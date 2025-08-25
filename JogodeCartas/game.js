// game.js - níveis com pontos, resultado volta para modal de dificuldade, perfil por clique, pontuação por nível no localStorage
(function () {
  "use strict";

  // helpers: funções utilitárias pequenas
  function $id(id) { return document.getElementById(id); }
  function $qs(sel, root = document) { return (root || document).querySelector(sel); }
  function $create(tag, attrs = {}) {
    const el = document.createElement(tag);
    for (const k in attrs) {
      if (k === 'class') el.className = attrs[k];
      else if (k === 'text') el.textContent = attrs[k];
      else el.setAttribute(k, attrs[k]);
    }
    return el;
  }
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  // estado: objeto que guarda o estado atual do jogo
  let state = {
    container: null,
    questions: [],
    currentIndex: 0,
    score: 0,
    sessionCorrect: 0,
    sessionWrong: 0,
    running: false,
    selectedLevel: 'facil',
    pointsPerCorrect: 10,
    scoreListeners: []
  };

  function computeCategoria(pontos) {
    pontos = Number(pontos) || 0;
    if (pontos >= 300) return "Senior";
    if (pontos >= 200) return "Pleno";
    return "Junior";
  }

  function buildUI(container) {
    container.innerHTML = '';
    const wrapper = $create('div', { class: 'game-wrapper' });

    const topBar = $create('div', { class: 'game-topbar' });
    const scoreEl = $create('div', { class: 'game-score', id: 'game-score', text: 'Pontos: 0' });
    const progEl = $create('div', { class: 'game-progress', id: 'game-progress', text: '' });
    topBar.appendChild(scoreEl);
    topBar.appendChild(progEl);

    const qEl = $create('h2', { class: 'game-question', id: 'game-question', text: '...' });

    const cardsWrap = $create('div', { class: 'game-cards', id: 'game-cards' });
    for (let i = 0; i < 3; i++) {
      const btn = $create('button', { class: 'carta-resposta game-card', 'data-idx': i });
      btn.type = 'button';
      cardsWrap.appendChild(btn);
    }

    wrapper.appendChild(topBar);
    wrapper.appendChild(qEl);
    wrapper.appendChild(cardsWrap);

    container.appendChild(wrapper);
  }

  function renderQuestion() {
    const qi = state.currentIndex;
    const qObj = state.questions[qi];
    const qText = $qs('#game-question', state.container);
    const cards = Array.from(state.container.querySelectorAll('.game-card'));
    const progress = $qs('#game-progress', state.container);

    const headerScore = $id('header-score');
    if (headerScore) headerScore.textContent = 'Pontos: ' + state.score;
    const scoreEl = $qs('#game-score', state.container);
    if (scoreEl) scoreEl.textContent = 'Pontos: ' + state.score;

    if (!qObj) {
      qText.textContent = `Fim das perguntas!`;
      cards.forEach(c => c.style.display = 'none');
      state.running = false;
      showResultModal();
      notifyScore();
      return;
    }

    qText.textContent = qObj.pergunta || '—';
    progress.textContent = `Pergunta ${qi + 1} / ${state.questions.length}`;

    const alternatives = [qObj.respostaCorreta, ...(qObj.respostasFalsas || [])].slice(0, 3);
    shuffle(alternatives);

    cards.forEach((card, idx) => {
      card.classList.remove('correct', 'wrong', 'disabled');
      card.style.display = alternatives[idx] ? 'inline-flex' : 'none';
      card.textContent = alternatives[idx] || '';
      card.disabled = false;
      card.onclick = () => onCardClick(card, alternatives[idx], qObj);
    });
  }

  function onCardClick(cardEl, answerText, qObj) {
    if (!state.running) return;

    const cards = Array.from(state.container.querySelectorAll('.game-card'));
    cards.forEach(c => { c.disabled = true; c.classList.add('disabled'); });

    const correct = answerText === qObj.respostaCorreta;

    if (correct) {
      state.sessionCorrect++;
      state.score += state.pointsPerCorrect;
      cardEl.classList.remove('disabled');
      cardEl.classList.add('correct');
      addPointsToPlayer(state.pointsPerCorrect);
    } else {
      state.sessionWrong++;
      cardEl.classList.add('wrong');
      cards.forEach(c => { if (c.textContent === qObj.respostaCorreta) c.classList.add('correct'); });
    }

    const scoreEl = $qs('#game-score', state.container);
    if (scoreEl) scoreEl.textContent = 'Pontos: ' + state.score;
    const headerScore = $id('header-score');
    if (headerScore) headerScore.textContent = 'Pontos: ' + state.score;

    notifyScore();

    setTimeout(() => {
      state.currentIndex++;
      if (state.currentIndex < state.questions.length) {
        renderQuestion();
      } else {
        state.running = false;
        renderQuestion();
      }
    }, 3000);
  }

  function addPointsToPlayer(pts) {
    try {
      const currentPlayerRaw = sessionStorage.getItem('currentPlayer');
      if (!currentPlayerRaw) return;
      const currentPlayer = JSON.parse(currentPlayerRaw);

      if (!currentPlayer.scores || typeof currentPlayer.scores !== 'object') {
        currentPlayer.scores = { facil: 0, medio: 0, dificil: 0 };
      } else {
        currentPlayer.scores.facil = Number(currentPlayer.scores.facil || 0);
        currentPlayer.scores.medio = Number(currentPlayer.scores.medio || 0);
        currentPlayer.scores.dificil = Number(currentPlayer.scores.dificil || 0);
      }

      const level = state.selectedLevel || 'facil';
      currentPlayer.scores[level] = Number(currentPlayer.scores[level] || 0) + Number(pts || 0);

      currentPlayer.pontuacao = Number(state.score || 0);

      sessionStorage.setItem('currentPlayer', JSON.stringify(currentPlayer));

      try {
        if (window.RankModal && typeof window.RankModal.upsertPlayer === 'function') {
          window.RankModal.upsertPlayer(currentPlayer);
        } else {
          const rawPlayers = localStorage.getItem('players');
          let playersArr = rawPlayers ? JSON.parse(rawPlayers) : [];
          const idx = playersArr.findIndex(p => p.usuario === currentPlayer.usuario);
          const now = Date.now();
          const toSave = {
            id: currentPlayer.id || ('u' + now),
            usuario: currentPlayer.usuario,
            senha: currentPlayer.senha, // Incluímos a senha aqui
            foto: currentPlayer.foto || '1.png',
            pontuacao: Number(currentPlayer.pontuacao || 0),
            scores: currentPlayer.scores || { facil: 0, medio: 0, dificil: 0 },
            lastPlayed: now
          };
          if (idx >= 0) playersArr[idx] = Object.assign({}, playersArr[idx], toSave);
          else playersArr.push(toSave);
          localStorage.setItem('players', JSON.stringify(playersArr));
        }
      } catch (err) {
        console.error('Erro atualizando players para Rank:', err);
      }

      const ttPont = document.getElementById('tt-pontuacao');
      const ttCat = document.getElementById('tt-categoria');
      const headerScore = document.getElementById('header-score');
      if (ttPont) ttPont.textContent = 'Pontuação: ' + currentPlayer.pontuacao;
      if (headerScore) headerScore.textContent = 'Pontos: ' + currentPlayer.pontuacao;
      if (ttCat) ttCat.textContent = 'Categoria: ' + computeCategoria(currentPlayer.pontuacao);

      const perfilDiv = document.getElementById('perfil-game');
      if (perfilDiv && currentPlayer.foto) {
        perfilDiv.style.backgroundImage = `url('assets/images/${currentPlayer.foto}')`;
      }
    } catch (e) {
      console.error('Erro ao gravar pontos por nível:', e);
    }
  }

  function notifyScore() {
    state.scoreListeners.forEach(cb => {
      try { cb(state.score); } catch (e) { console.error(e); }
    });
  }

  function showResultModal() {
    const modal = $id('result-modal');
    if (!modal) return;
    $id('result-score').textContent = 'Pontos: ' + state.score;
    $id('result-correct').textContent = state.sessionCorrect;
    $id('result-wrong').textContent = state.sessionWrong;
    modal.style.display = 'flex';
  }
  function hideResultModal() {
    const modal = $id('result-modal');
    if (!modal) return;
    modal.style.display = 'none';
  }

  function showDifficultyModal() {
    const modal = $id('difficulty-modal');
    if (!modal) return;
    modal.style.display = 'flex';
  }
  function hideDifficultyModal() {
    const modal = $id('difficulty-modal');
    if (!modal) return;
    modal.style.display = 'none';
  }

  function configureDifficultyModal() {
    const modal = $id('difficulty-modal');
    if (!modal) return;

    modal.querySelectorAll('.level-option').forEach(el => {
      el.addEventListener('click', () => {
        modal.querySelectorAll('.level-option').forEach(i => {
          i.classList.remove('selected');
          i.setAttribute('aria-checked', 'false');
        });
        el.classList.add('selected');
        el.setAttribute('aria-checked', 'true');
        state.selectedLevel = el.getAttribute('data-level') || 'facil';
      });
    });

    const exitBtn = $id('diff-exit');
    if (exitBtn) exitBtn.addEventListener('click', () => {
      sessionStorage.removeItem('authenticated');
      sessionStorage.removeItem('currentPlayer');
      window.location.href = 'index.html';
    });

    const worldBtn = $id('diff-world');
    if (worldBtn) worldBtn.addEventListener('click', () => {
      if (window.RankModal && typeof window.RankModal.open === 'function') {
        window.RankModal.open();
      }
    });

    const playBtn = $id('diff-play');
    if (playBtn) playBtn.addEventListener('click', () => {
      const lvl = state.selectedLevel || 'facil';
      if (lvl === 'facil') state.pointsPerCorrect = 10;
      else if (lvl === 'medio') state.pointsPerCorrect = 20;
      else if (lvl === 'dificil') state.pointsPerCorrect = 30;
      hideDifficultyModal();
      try {
        LogicardsGame.start(lvl);
      } catch (e) {
        console.error('Erro iniciando jogo:', e);
      }
    });
  }

  const LogicardsGame = {
    init: function (containerSelectorOrEl) {
      const el = (typeof containerSelectorOrEl === 'string')
        ? document.querySelector(containerSelectorOrEl)
        : containerSelectorOrEl;
      if (!el) throw new Error('container not found for LogicardsGame.init()');
      state.container = el;
      buildUI(el);
      configureDifficultyModal();
      showDifficultyModal();
      return LogicardsGame;
    },

    start: function (level) {
      const lvl = level || state.selectedLevel || 'facil';
      state.selectedLevel = lvl;

      if (lvl === 'facil') state.pointsPerCorrect = 10;
      else if (lvl === 'medio') state.pointsPerCorrect = 20;
      else if (lvl === 'dificil') state.pointsPerCorrect = 30;

      let qset = [];
      try {
        if (window.perguntas && Array.isArray(window.perguntas[lvl])) {
          qset = window.perguntas[lvl].slice();
        }
      } catch (e) { /* ignore */ }

      if (!qset || !qset.length) {
        state.container.innerHTML = '<div class="game-empty">Nenhuma pergunta disponível para este nível.</div>';
        return;
      }

      shuffle(qset);
      state.questions = qset;
      state.currentIndex = 0;
      state.sessionCorrect = 0;
      state.sessionWrong = 0;
      state.running = true;

      try {
        const currentPlayerRaw = sessionStorage.getItem('currentPlayer');
        if (currentPlayerRaw) {
          const currentPlayer = JSON.parse(currentPlayerRaw);
          state.score = Number(currentPlayer.pontuacao || 0);
        } else {
          state.score = 0;
        }
      } catch (e) { state.score = 0; }

      buildUI(state.container);

      const headerScore = $id('header-score');
      if (headerScore) headerScore.textContent = 'Pontos: ' + state.score;

      renderQuestion();
      notifyScore();
    },

    stop: function () {
      state.running = false;
      if (state.container) state.container.querySelectorAll('.game-card').forEach(c => { c.onclick = null; c.disabled = true; });
    },

    onScoreChange: function (cb) {
      if (typeof cb === 'function') state.scoreListeners.push(cb);
      return LogicardsGame;
    },

    _state: function () { return Object.assign({}, state); }
  };

  window.LogicardsGame = LogicardsGame;

  function carregarPerfilNoGame() {
    const currentPlayerRaw = sessionStorage.getItem("currentPlayer");
    if (!currentPlayerRaw) return;
    let currentPlayer = null;
    try { currentPlayer = JSON.parse(currentPlayerRaw); } catch (e) { console.error(e); return; }

    const perfilDiv = $id("perfil-game");
    if (perfilDiv) {
      perfilDiv.style.display = "block";
      const foto = currentPlayer.foto ? `assets/images/${currentPlayer.foto.replace(/^assets\/images\//, '').replace(/^img\//, '')}` : 'assets/images/user-default.png';
      perfilDiv.style.backgroundImage = `url('${foto}')`;
      perfilDiv.title = currentPlayer.usuario || "Jogador";
    }

    const ttUsuario = $id("tt-usuario"); if (ttUsuario) ttUsuario.textContent = currentPlayer.usuario || "Jogador";
    const ttPont = $id("tt-pontuacao"); if (ttPont) ttPont.textContent = "Pontuação: " + (currentPlayer.pontuacao || 0);
    const ttCat = $id("tt-categoria"); if (ttCat) ttCat.textContent = "Categoria: " + computeCategoria(currentPlayer.pontuacao || 0);
  }

  function configurarTooltipPerfil() {
    const perfilDiv = $id("perfil-game");
    const tooltip = $id("perfil-tooltip");
    if (!perfilDiv || !tooltip) return;

    perfilDiv.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const visible = tooltip.style.display === 'block';
      if (!visible) {
        tooltip.style.display = "block";
        tooltip.style.opacity = "0";
        requestAnimationFrame(() => { tooltip.style.transition = "opacity 180ms ease"; tooltip.style.opacity = "1"; });
        perfilDiv.classList.add('active');
      } else {
        tooltip.style.opacity = "0";
        setTimeout(() => { tooltip.style.display = "none"; }, 180);
        perfilDiv.classList.remove('active');
      }
    });

    document.addEventListener("click", (ev) => {
      if (!perfilDiv.contains(ev.target) && !tooltip.contains(ev.target)) {
        tooltip.style.opacity = "0";
        setTimeout(() => { tooltip.style.display = "none"; }, 180);
        perfilDiv.classList.remove('active');
      }
    });
  }

  function configurarLogoutBtn() {
    const btn = $id("logout-btn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      sessionStorage.removeItem("authenticated");
      sessionStorage.removeItem("currentPlayer");
      window.location.href = 'index.html';
    });
  }

  window.addEventListener("load", () => {
    if (sessionStorage.getItem('authenticated') !== 'true') {
      window.location.href = 'index.html';
      return;
    }

    carregarPerfilNoGame();
    configurarTooltipPerfil();
    configurarLogoutBtn();

    const resWorld = $id('result-world');
    if (resWorld) resWorld.addEventListener('click', () => {
      try {
        const currentPlayerRaw = sessionStorage.getItem('currentPlayer');
        if (currentPlayerRaw && window.RankModal && typeof window.RankModal.upsertPlayer === 'function') {
          window.RankModal.upsertPlayer(JSON.parse(currentPlayerRaw));
        }
        if (window.RankModal && typeof window.RankModal.open === 'function') {
          window.RankModal.open();
        }
      } catch (e) { console.error('Erro ao abrir Rank do resultado:', e); }
    });

    const resFinish = $id('result-finish');
    if (resFinish) resFinish.addEventListener('click', () => {
      hideResultModal();
      showDifficultyModal();
      if (state.container) buildUI(state.container);
    });

    const rootSelector = '#game-root';
    const rootEl = document.querySelector(rootSelector);
    if (rootEl) {
      try {
        window.LogicardsGame.init(rootSelector);
      } catch (e) {
        console.error('Erro inicializando LogicardsGame:', e);
      }

      window.LogicardsGame.onScoreChange((novaPontuacao) => {
        try {
          const currentPlayerRaw = sessionStorage.getItem('currentPlayer');
          if (!currentPlayerRaw) return;
          const currentPlayer = JSON.parse(currentPlayerRaw);
          currentPlayer.pontuacao = Number(novaPontuacao) || 0;
          sessionStorage.setItem('currentPlayer', JSON.stringify(currentPlayer));
          
          const ttPont = document.getElementById('tt-pontuacao');
          const ttCat = document.getElementById('tt-categoria');
          const headerScore = document.getElementById('header-score');
          if (ttPont) ttPont.textContent = 'Pontuação: ' + currentPlayer.pontuacao;
          if (headerScore) headerScore.textContent = 'Pontos: ' + currentPlayer.pontuacao;
          if (ttCat) ttCat.textContent = 'Categoria: ' + computeCategoria(currentPlayer.pontuacao);
        } catch (err) { console.error(err); }
      });
    } else {
      console.warn('Elemento #game-root não encontrado — adicione <main id="game-root"></main> no game.html');
    }
    configureDifficultyModal();
  });

})();