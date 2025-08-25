// rank.js - Gerencia o Rank/Mundo (slide lateral com jogadores simulados e jogador real)
(function () {
  "use strict";

  // ---------------------
  // Configuração inicial / Jogadores simulados (seed)
  // ---------------------
  const STORAGE_KEY = 'players';

  const SEED_PLAYERS = [

  ];

  // ---------------------
  // Funções para LocalStorage
  // ---------------------
  function readPlayers() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.debug('rank.js: erro ao ler JSON do localStorage', e);
      return null;
    }
  }

  function writePlayers(arr) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }

  function ensureSeed() {
    const existing = readPlayers();
    if (!existing || !Array.isArray(existing) || existing.length < 1) {
      writePlayers(SEED_PLAYERS);
      console.debug('rank.js: seed inicial gravada');
    }
  }

  // ---------------------
  // Ordenação do rank
  // ---------------------
  function getSorted() {
    const arr = (readPlayers() || []).slice();
    arr.sort((a, b) => {
      if (b.pontuacao !== a.pontuacao) return b.pontuacao - a.pontuacao;
      return (b.lastPlayed || 0) - (a.lastPlayed || 0);
    });
    return arr;
  }

  // ---------------------
  // Inserir ou atualizar jogador real no ranking
  // ---------------------
  function upsertPlayer(jogador) {
    if (!jogador || !jogador.usuario) return;
    ensureSeed();
    const arr = readPlayers() || [];
    const idx = arr.findIndex(p => p.usuario === jogador.usuario);
    const now = Date.now();

    const toSave = {
      id: jogador.id || ('u' + now),
      usuario: jogador.usuario,
      senha: jogador.senha, // Garante que a senha seja salva/atualizada
      foto: jogador.foto || '1.png',
      pontuacao: Number(jogador.pontuacao || 0),
      scores: jogador.scores || { facil: 0, medio: 0, dificil: 0 },
      lastPlayed: now
    };

    if (idx >= 0) arr[idx] = Object.assign({}, arr[idx], toSave);
    else arr.push(toSave);

    writePlayers(arr);
    console.debug('rank.js: upsertPlayer', toSave.usuario, toSave.pontuacao);
  }

  // ---------------------
  // Utilidades: categoria e escape de HTML
  // ---------------------
  function computeCategoria(pontos) {
    pontos = Number(pontos) || 0;
    if (pontos >= 300) return 'Senior';
    if (pontos >= 200) return 'Pleno';
    return 'Junior';
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>"'`=\/]/g, function (s) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
      })[s];
    });
  }

  // ---------------------
  // Criação do slide DOM
  // ---------------------
  let domCreated = false;
  let outsideClickHandler = null;

  function ensureDOM() {
    if (domCreated) return;
    if (document.getElementById('rank-slide')) {
      domCreated = true;
      return;
    }

    const slide = document.createElement('aside');
    slide.id = 'rank-slide';
    slide.setAttribute('aria-hidden', 'true');

    slide.innerHTML = `
      <div class="rank-header">
        <div>
          <div class="rank-title">Mundo · Ranking</div>
          <div class="rank-sub">Top 6 jogadores</div>
        </div>
      </div>

      <div class="rank-top3" id="rank-top3"></div>
      <div class="rank-list" id="rank-list"></div>

      <div class="rank-footer">
        <button id="rank-exit" class="rank-exit">Sair</button>
      </div>
    `;

    document.body.appendChild(slide);

    slide.querySelectorAll('#rank-exit').forEach(btn => {
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        close();
      });
    });

    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') close();
    });

    outsideClickHandler = function (ev) {
      const sl = document.getElementById('rank-slide');
      if (!sl || !sl.classList.contains('open')) return;
      const isInside = sl.contains(ev.target);
      if (!isInside) close();
    };

    domCreated = true;
    console.debug('rank.js: DOM do slide criado');
  }

  // ---------------------
  // Preencher o ranking
  // ---------------------
  function populate() {
    ensureSeed();
    ensureDOM();

    const sorted = getSorted();
    const top6 = sorted.slice(0, 6);

    const top3Container = document.getElementById('rank-top3');
    const listContainer = document.getElementById('rank-list');
    if (!top3Container || !listContainer) return;

    top3Container.innerHTML = '';
    listContainer.innerHTML = '';

    const cardFor = (p, place) => {
      if (!p) return `<div class="rank-card" style="opacity:0.4"><div class="name">—</div><div class="pts">—</div></div>`;
      return `
        <div class="rank-card">
          <div style="font-size:0.82rem; opacity:0.9;">#${place}</div>
          <div class="name">${escapeHtml(p.usuario)}</div>
          <div class="pts">${Number(p.pontuacao || 0)}</div>
          <div style="font-size:0.78rem; color:#bfcbe6; margin-top:6px;">${computeCategoria(p.pontuacao)}</div>
        </div>
      `;
    };

    top3Container.innerHTML = `
      ${cardFor(top6[0], 1)}
      ${cardFor(top6[1], 2)}
      ${cardFor(top6[2], 3)}
    `;

    top6.forEach((p, i) => {
      if (!p) return;
      const item = document.createElement('div');
      item.className = 'rank-item';
      item.innerHTML = `
        <div class="pos">#${i + 1}</div>
        <div class="avatar" style="background-image:url('assets/images/${escapeHtml(p.foto || '1.png')}')"></div>
        <div class="meta">
          <div class="u">${escapeHtml(p.usuario)}</div>
          <div class="cat">${computeCategoria(p.pontuacao)}</div>
        </div>
        <div class="score">${Number(p.pontuacao || 0)}</div>
      `;
      listContainer.appendChild(item);
    });

    const meRaw = sessionStorage.getItem('currentPlayer');
    let me = null;
    if (meRaw) {
      try { me = JSON.parse(meRaw); } catch (e) { me = null; }
    }

    if (me && me.usuario) {
      const listItems = Array.from(listContainer.querySelectorAll('.rank-item'));
      let found = false;
      listItems.forEach((el) => {
        const name = el.querySelector('.meta .u').textContent;
        if (name === me.usuario) {
          el.classList.add('you');
          found = true;
        }
      });

      if (!found) {
        const all = getSorted();
        const pos = all.findIndex(p => p.usuario === me.usuario);
        const posDisplay = (pos >= 0) ? (pos + 1) : '-';
        const elm = document.createElement('div');
        elm.className = 'rank-item you';
        elm.style.marginTop = '12px';
        elm.innerHTML = `
          <div class="pos">#${posDisplay}</div>
          <div class="avatar" style="background-image:url('assets/images/${escapeHtml(me.foto || '1.png')}')"></div>
          <div class="meta"><div class="u">${escapeHtml(me.usuario)}</div><div class="cat">${computeCategoria(me.pontuacao)}</div></div>
          <div class="score">${Number(me.pontuacao || 0)}</div>
        `;
        listContainer.appendChild(elm);
        setTimeout(() => { elm.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 80);
      }
    }
  }

  // ---------------------
  // Abrir / Fechar slide
  // ---------------------
  function open() {
    ensureSeed();
    ensureDOM();
    populate();

    const slide = document.getElementById('rank-slide');
    if (!slide) return;

    slide.classList.add('open');
    slide.setAttribute('aria-hidden', 'true');

    setTimeout(() => {
      document.addEventListener('click', outsideClickHandler);
    }, 20);

    console.debug('rank.js: aberto');
  }

  function close() {
    const slide = document.getElementById('rank-slide');
    if (!slide) return;
    slide.classList.remove('open');
    slide.setAttribute('aria-hidden', 'true');

    if (outsideClickHandler) document.removeEventListener('click', outsideClickHandler);

    console.debug('rank.js: fechado');
  }

  // ---------------------
  // Expor funções globais
  // ---------------------
  window.RankModal = {
    open,
    close,
    ensureSeed,
    upsertPlayer
  };

  // ---------------------
  // Garantir seed na carga
  // ---------------------
  try { ensureSeed(); } catch (e) { /* ignore */ }

})();