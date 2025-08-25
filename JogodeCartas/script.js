// script.js (index) - gerencia cadastro, login, toasts e confirm modal
(function () {
  "use strict";

  // ---------- helpers ----------
  function $id(id) { return document.getElementById(id); }
  function showFlex(el) { if (!el) return; el.style.display = "flex"; }
  function showInline(el) { if (!el) return; el.style.display = "inline-block"; }
  function hide(el) { if (!el) return; el.style.display = "none"; }
  function setText(el, txt) { if (!el) return; el.textContent = txt; }

  // ---------- TOAST (balão central) ----------
  const toastEl = $id("toast");
  let toastTimer = null;
  function showToast(message, type = "success", duration = 2000) {
    if (!toastEl) { 
      alert(message);
      return;
    }
    toastEl.className = "toast " + type + " show";
    toastEl.textContent = message;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.className = "toast " + type;
      setTimeout(() => hide(toastEl), 220);
    }, duration);
    toastEl.style.display = "block";
  }

  // ---------- Confirm modal (callback) ----------
  const confirmModal = $id("confirm-modal");
  const confirmMsgEl = $id("confirm-msg");
  const confirmOkBtn = $id("confirm-ok");
  const confirmCancelBtn = $id("confirm-cancel");

  function showConfirm(message, onConfirm) {
    if (!confirmModal) {
      if (confirm(message)) {
        onConfirm();
      }
      return;
    }
    setText(confirmMsgEl, message);
    showFlex(confirmModal);
    function cleanup() {
      hide(confirmModal);
      confirmOkBtn.removeEventListener("click", okHandler);
      confirmCancelBtn.removeEventListener("click", cancelHandler);
    }
    function okHandler() {
      cleanup();
      onConfirm && onConfirm();
    }
    function cancelHandler() {
      cleanup();
    }
    confirmOkBtn.addEventListener("click", okHandler);
    confirmCancelBtn.addEventListener("click", cancelHandler);
  }

  // ---------- util: calcula a categoria do jogador (copiado de rank.js) ----------
  function computeCategoria(pontos) {
    pontos = Number(pontos) || 0;
    if (pontos >= 300) return 'Senior';
    if (pontos >= 200) return 'Pleno';
    return 'Junior';
  }

  // ---------- lógica de exibição do botão cadastro e perfil ----------
  function atualizarBotoesInicial() {
    const cadastroBtn = $id("cadastro");
    const perfilJogadorContainer = $id("perfil-jogador-container");
    const iconePerfilClicavel = $id("icone-perfil-clicavel");
    const ttUsuario = $id("tt-usuario");
    const ttPont = $id("tt-pontuacao");
    const ttCat = $id("tt-categoria");

    const currentPlayerRaw = sessionStorage.getItem("currentPlayer");
    if (currentPlayerRaw) {
      const currentPlayer = JSON.parse(currentPlayerRaw);
      hide(cadastroBtn);
      showFlex(perfilJogadorContainer);
      
      if (iconePerfilClicavel) {
        iconePerfilClicavel.style.backgroundImage = `url('assets/images/${currentPlayer.foto}')`;
      }
      setText(ttUsuario, currentPlayer.usuario);
      setText(ttPont, "Pontuação: " + (currentPlayer.pontuacao || 0));
      setText(ttCat, "Categoria: " + computeCategoria(currentPlayer.pontuacao || 0));

    } else {
      showInline(cadastroBtn);
      hide(perfilJogadorContainer);
    }
  }

  // ---------- avatar selection ----------
  let fotoSelecionada = null;
  function inicializarAvatars() {
    const avs = document.querySelectorAll(".foto-perfil");
    if (!avs || !avs.length) return;
    avs.forEach(img => {
      img.addEventListener("click", function () {
        avs.forEach(i => i.classList.remove("selecionada"));
        this.classList.add("selecionada");
        fotoSelecionada = this.getAttribute("data-foto");
      });
    });
  }

  // ---------- salvar cadastro ----------
  function salvarCadastroHandler() {
    const btn = $id("salvar-cadastro");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const usuario = ($id("cadastro-usuario") || {}).value || "";
      const senha = ($id("cadastro-senha") || {}).value || "";
      const cadMsg = $id("cad-msg");
      setText(cadMsg, "");

      if (!usuario.trim() || !senha.trim() || !fotoSelecionada) {
        setText(cadMsg, "Preencha todos os campos e escolha uma foto de perfil!");
        return;
      }

      const rawPlayers = localStorage.getItem('players');
      const playersArr = rawPlayers ? JSON.parse(rawPlayers) : [];
      const userExists = playersArr.some(p => p.usuario === usuario.trim());

      if (userExists) {
        setText(cadMsg, "Usuário já existe. Escolha outro nome.");
        return;
      }

      const jogador = {
        id: 'u' + Date.now(),
        usuario: usuario.trim(),
        senha: senha.trim(),
        foto: fotoSelecionada,
        pontuacao: 0,
        scores: { facil: 0, medio: 0, dificil: 0 }
      };

      try {
        if (window.RankModal && typeof window.RankModal.upsertPlayer === 'function') {
          window.RankModal.upsertPlayer(jogador);
        } else {
          playersArr.push(jogador);
          localStorage.setItem('players', JSON.stringify(playersArr));
        }
      } catch (err) {
        console.error('Erro ao inserir jogador no Rank no cadastro:', err);
      }

      sessionStorage.setItem("currentPlayer", JSON.stringify(jogador));
      sessionStorage.setItem("authenticated", "true");

      const cadModal = $id("cadastro-modal");
      hide(cadModal);
      atualizarBotoesInicial();

      showToast("Cadastro realizado com sucesso!", "success", 2000);

      window.location.href = "game.html";
    });
  }

  // ---------- login ----------
  function loginHandler() {
    const btn = $id("jogar-login");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const usuario = ($id("usuario") || {}).value || "";
      const senha = ($id("senha") || {}).value || "";
      const loginMsg = $id("login-msg");
      setText(loginMsg, "");

      const playersRaw = localStorage.getItem("players");
      if (!playersRaw) {
        setText(loginMsg, "Nenhum usuário cadastrado. Cadastre-se primeiro.");
        return;
      }

      let playersArr;
      try { playersArr = JSON.parse(playersRaw); } catch (e) {
        console.error("JSON inválido no localStorage (players):", e);
        setText(loginMsg, "Erro com os dados dos usuários.");
        return;
      }

      const foundPlayer = playersArr.find(p => p.usuario === usuario.trim() && p.senha === senha);

      if (foundPlayer) {
        sessionStorage.setItem("authenticated", "true");
        sessionStorage.setItem("currentPlayer", JSON.stringify(foundPlayer));
        window.location.href = "game.html";
      } else {
        setText(loginMsg, "Usuário ou senha incorretos.");
        showToast("Usuário ou senha incorretos.", "error", 1800);
      }
    });
  }

  // ---------- botões e eventos ----------
  function configurarBotoes() {
    const mundoBtn = $id("mundo");
    if (mundoBtn) mundoBtn.addEventListener("click", () => {
      try {
        if (window.RankModal && typeof window.RankModal.open === 'function') {
          window.RankModal.open();
        } else {
          showToast("Carregando MUNDO...", "info", 1200);
        }
      } catch (e) {
        console.error('Erro abrindo Rank:', e);
      }
    });

    const jogarBtn = $id("jogar");
    if (jogarBtn) jogarBtn.addEventListener("click", () => {
      const currentPlayerRaw = sessionStorage.getItem("currentPlayer");
      if (currentPlayerRaw) {
        window.location.href = "game.html"; // Se já está logado, vai direto para o jogo
      } else {
        const loginModal = $id("login-modal");
        if (loginModal) {
          ($id("usuario") || {}).value = "";
          ($id("senha") || {}).value = "";
          setText($id("login-msg"), "");
          showFlex(loginModal);
        }
      }
    });

    const cadastroBtn = $id("cadastro");
    if (cadastroBtn) cadastroBtn.addEventListener("click", () => {
      const cad = $id("cadastro-modal");
      if (cad) {
        ($id("cadastro-usuario") || {}).value = "";
        ($id("cadastro-senha") || {}).value = "";
        fotoSelecionada = null;
        document.querySelectorAll(".foto-perfil.selecionada").forEach(i => i.classList.remove("selecionada"));
        setText($id("cad-msg"), "");
        showFlex(cad);
      }
    });

    const voltarCadastro = $id("voltar-cadastro");
    if (voltarCadastro) voltarCadastro.addEventListener("click", () => {
      const cad = $id("cadastro-modal");
      if (cad) hide(cad);
    });

    const voltarLogin = $id("voltar-login");
    if (voltarLogin) voltarLogin.addEventListener("click", () => {
      const login = $id("login-modal");
      if (login) hide(login);
    });

    const limparBtn = $id("limpar-cadastro");
    if (limparBtn) {
      limparBtn.addEventListener("click", () => {
        showConfirm("Deseja apagar TODOS os dados de cadastro e ranking salvos no navegador?", () => {
          localStorage.removeItem("players");
          sessionStorage.removeItem("currentPlayer");
          sessionStorage.removeItem("authenticated");
          if (window.RankModal && typeof window.RankModal.ensureSeed === 'function') {
            window.RankModal.ensureSeed();
          }
          atualizarBotoesInicial();
          showToast("Dados apagados com sucesso.", "success", 1800);
        });
      });
    }

    const iconePerfilClicavel = $id("icone-perfil-clicavel");
    const perfilInfoTooltip = $id("perfil-info-tooltip");
    if (iconePerfilClicavel && perfilInfoTooltip) {
        iconePerfilClicavel.addEventListener("click", (ev) => {
            ev.stopPropagation();
            const visible = perfilInfoTooltip.style.display === 'block';
            if (!visible) {
                perfilInfoTooltip.style.display = "block";
                perfilInfoTooltip.style.opacity = "0";
                requestAnimationFrame(() => { 
                    perfilInfoTooltip.style.transition = "opacity 180ms ease"; 
                    perfilInfoTooltip.style.opacity = "1"; 
                });
                iconePerfilClicavel.classList.add('active');
            } else {
                perfilInfoTooltip.style.opacity = "0";
                setTimeout(() => { perfilInfoTooltip.style.display = "none"; }, 180);
                iconePerfilClicavel.classList.remove('active');
            }
        });

        document.addEventListener("click", (ev) => {
            if (!iconePerfilClicavel.contains(ev.target) && !perfilInfoTooltip.contains(ev.target)) {
                perfilInfoTooltip.style.opacity = "0";
                setTimeout(() => { perfilInfoTooltip.style.display = "none"; }, 180);
                iconePerfilClicavel.classList.remove('active');
            }
        });
    }
  }

  // ---------- inicialização ----------
  window.addEventListener("load", () => {
    inicializarAvatars();
    salvarCadastroHandler();
    loginHandler();
    configurarBotoes();
    atualizarBotoesInicial();
    
    const t = $id("toast");
    if (t) hide(t);
    const confirmModalEl = $id("confirm-modal");
    if (confirmModalEl) hide(confirmModalEl);
    const loginModal = $id("login-modal");
    if (loginModal) hide(loginModal);
    const cadastroModal = $id("cadastro-modal");
    if (cadastroModal) hide(cadastroModal);
  });

})();