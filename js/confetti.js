/* ============================================================
   PHONICS PALS — confetti.js
   DOM-based paper confetti spawner. PP.confetti(count, opts)
   ============================================================ */
(function () {
  'use strict';
  const { $ } = PP.utils;

  const COLORS = ['#ffc94a', '#5dc4ec', '#8ad9a8', '#ff7e7e', '#c4a3ff', '#fff'];
  const SHAPES = ['conf-circle', 'conf-square', 'conf-rect', 'conf-star'];

  function confetti(count = 36, opts = {}) {
    const layer = $('#confetti-layer');
    if (!layer) return;
    const sourceX = opts.x ?? window.innerWidth * 0.5;
    const sourceY = opts.y ?? window.innerHeight * 0.35;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      el.className = 'confetti ' + shape;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      el.style.background = shape === 'conf-star' ? 'transparent' : color;
      el.style.color = color;
      el.style.left = (sourceX + (Math.random() * 200 - 100)) + 'px';
      el.style.top = sourceY + 'px';
      el.style.setProperty('--dx', (Math.random() * 600 - 300) + 'px');
      el.style.setProperty('--rot', (Math.random() * 1080 - 540) + 'deg');
      el.style.setProperty('--dur', (1.6 + Math.random() * 1.4) + 's');
      frag.appendChild(el);
      setTimeout(() => el.remove(), 3200);
    }
    layer.appendChild(frag);
  }

  PP.confetti = confetti;
})();
