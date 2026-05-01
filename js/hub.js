/* ============================================================
   PHONICS PALS — hub.js
   Lesson hub navigation, sticker rendering, star counter
   ============================================================ */
(function () {
  'use strict';
  const { $, $$ } = PP.utils;
  const { sfx } = PP.audio;
  const { stickerCatalog } = PP.data;

  function updateBadges() {
    $('#star-count').textContent = PP.state.totalStars;
    for (const game of Object.keys(PP.state.perGameStars)) {
      const el = $(`[data-stars="${game}"]`);
      if (el) el.textContent = '⭐ ' + PP.state.perGameStars[game];
    }
    renderStickers();
  }

  function renderStickers() {
    const row = $('#stickers-row');
    if (!row) return;
    row.innerHTML = '';
    const allIds = Object.values(stickerCatalog).map(s => s.id);
    const slots = Math.max(8, allIds.length);
    for (let i = 0; i < slots; i++) {
      const slot = document.createElement('div');
      slot.className = 'sticker-slot';
      const id = allIds[i];
      if (id && PP.state.stickers.has(id)) {
        const meta = Object.values(stickerCatalog).find(s => s.id === id);
        slot.classList.add('unlocked');
        slot.style.setProperty('--rot', `${(i % 2 ? 4 : -4)}deg`);
        slot.textContent = meta.emoji;
        slot.title = meta.name;
      }
      row.appendChild(slot);
    }
  }

  function init() {
    $$('.game-card').forEach(card => {
      card.addEventListener('click', () => {
        sfx.pop();
        const game = card.dataset.game;
        if (PP.games[game]) PP.games[game].start();
      });
    });
    $('#hub-cert').addEventListener('click', () => {
      sfx.pop();
      PP.results.openCertificate();
    });
    $('#hub-tutorial').addEventListener('click', () => {
      sfx.pop();
      PP.tutorial.start();
    });
  }

  PP.hub = { init, updateBadges, renderStickers };
})();
