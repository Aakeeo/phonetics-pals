/* ============================================================
   PHONICS PALS — dnd.js
   Pointer-Events drag helper. Mouse + touch + pen.
   Spawns a ghost element that follows the cursor; on drop,
   detects the zone under the pointer and calls onDrop(zone, src).
   onDrop returns truthy => "handled" (ghost removed, source stays
   hidden), falsy => snaps ghost back to source.
   ============================================================ */
(function () {
  'use strict';

  function findZone(x, y, selector) {
    if (!selector) return null;
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    return el.closest(selector);
  }

  function makeDraggable(el, opts = {}) {
    el.style.touchAction = 'none';
    el.style.cursor = 'grab';
    el.dataset.draggable = '1';

    el.addEventListener('pointerdown', e => {
      // Only main button / primary touch / single pointer
      if (e.button !== undefined && e.button !== 0) return;
      // Skip if disabled (e.g. already placed)
      if (el.classList.contains('used') || el.classList.contains('placed') || el.classList.contains('drop-correct')) return;
      e.preventDefault();
      startDrag(el, e, opts);
    });
  }

  function startDrag(el, e, opts) {
    const rect = el.getBoundingClientRect();
    const ox = e.clientX - rect.left;
    const oy = e.clientY - rect.top;

    // Make a ghost (visual stand-in following cursor)
    const ghost = el.cloneNode(true);
    ghost.classList.add('drag-ghost');
    ghost.style.cssText = `
      position: fixed;
      left: ${rect.left}px;
      top: ${rect.top}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      margin: 0;
      pointer-events: none;
      z-index: 200;
      transform: rotate(-3deg) scale(1.08);
      transition: transform .15s cubic-bezier(.34,1.56,.64,1);
    `;
    document.body.appendChild(ghost);

    el.classList.add('dragging-source');
    if (opts.onDragStart) opts.onDragStart(el, ghost);

    let lastZone = null;

    function move(ev) {
      ev.preventDefault();
      ghost.style.left = (ev.clientX - ox) + 'px';
      ghost.style.top  = (ev.clientY - oy) + 'px';

      const zone = findZone(ev.clientX, ev.clientY, opts.dropSelector);
      if (zone !== lastZone) {
        if (lastZone) lastZone.classList.remove('drop-hover');
        if (zone) zone.classList.add('drop-hover');
        lastZone = zone;
      }
    }

    function up(ev) {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);

      const zone = findZone(ev.clientX, ev.clientY, opts.dropSelector);
      if (lastZone) lastZone.classList.remove('drop-hover');
      el.classList.remove('dragging-source');

      let handled = false;
      if (zone && opts.onDrop) {
        try { handled = !!opts.onDrop(zone, el, ghost); } catch (err) { handled = false; }
      }

      if (!handled) {
        // Animate ghost back to source's position then remove
        const r2 = el.getBoundingClientRect();
        ghost.style.transition = 'left .35s cubic-bezier(.34,1.56,.64,1), top .35s cubic-bezier(.34,1.56,.64,1), transform .25s';
        ghost.style.left = r2.left + 'px';
        ghost.style.top  = r2.top + 'px';
        ghost.style.transform = 'rotate(0) scale(1)';
        setTimeout(() => ghost.remove(), 380);
      } else {
        ghost.remove();
      }

      if (opts.onDragEnd) opts.onDragEnd(el, handled);
    }

    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }

  PP.dnd = { makeDraggable };
})();
