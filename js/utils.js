/* ============================================================
   PHONICS PALS — utils.js
   Tiny helpers used across modules. Attaches to window.PP.utils
   ============================================================ */
(function () {
  'use strict';
  window.PP = window.PP || {};

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function pickN(arr, n) { return shuffle([...arr]).slice(0, n); }

  // localStorage with safe fallbacks
  function storeGet(key, fallback = null) {
    try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); }
    catch (e) { return fallback; }
  }
  function storeSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  // Capitalize first letter
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  // Format short date for certificate
  function todayString() {
    const d = new Date();
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }

  PP.utils = { $, $$, shuffle, pick, pickN, storeGet, storeSet, cap, todayString };
})();
