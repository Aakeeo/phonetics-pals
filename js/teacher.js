/* ============================================================
   PHONICS PALS — teacher.js
   Mr. Pip — character behaviors, speech bubble, dialogue API.
   Always uses the CURRENT language via PP.data.getDialogue().
   ============================================================ */
(function () {
  'use strict';
  const { $, pick, displayName } = PP.utils;
  const { speak } = PP.speech;

  let stage, character, bubble, bubbleText, bubbleReplay;
  let bubbleTimer = null;
  let lastSpoken = '';

  function init() {
    stage        = $('#pip-stage');
    character    = $('#pip-character');
    bubble       = $('#pip-bubble');
    bubbleText   = $('#pip-bubble-text');
    bubbleReplay = $('#pip-bubble-replay');

    bubbleReplay.addEventListener('click', () => {
      if (lastSpoken) speak(lastSpoken);
    });
    character.addEventListener('click', () => {
      if (lastSpoken) speak(lastSpoken);
      else say(pick(PP.data.getDialogue().cheers)(displayName()));
    });
  }

  function setMood(mood = 'happy') {
    if (!character) return;
    character.dataset.mood = mood;
    if (mood === 'celebrate') {
      character.classList.remove('shake');
      character.classList.add('bounce');
      setTimeout(() => character.classList.remove('bounce'), 700);
    } else if (mood === 'surprised') {
      character.classList.remove('bounce');
      character.classList.add('shake');
      setTimeout(() => character.classList.remove('shake'), 600);
    }
  }

  function setSize(size) {
    if (!stage) return;
    stage.dataset.size = size;
  }

  function showBubble(text, durationMs = 6000) {
    if (!bubble) return;
    if (bubbleTimer) { clearTimeout(bubbleTimer); bubbleTimer = null; }
    bubbleText.textContent = text;
    requestAnimationFrame(() => bubble.classList.add('show'));
    if (durationMs > 0) {
      bubbleTimer = setTimeout(() => bubble.classList.remove('show'), durationMs);
    }
  }
  function hideBubble() {
    if (!bubble) return;
    bubble.classList.remove('show');
    if (bubbleTimer) { clearTimeout(bubbleTimer); bubbleTimer = null; }
  }

  function say(text, opts = {}) {
    if (!text) return;
    lastSpoken = text;
    if (opts.mood) setMood(opts.mood);
    showBubble(text, opts.bubbleMs ?? 6500);
    speak(text, { rate: opts.rate, pitch: opts.pitch });
  }

  function cheer() {
    const n = displayName();
    const line = pick(PP.data.getDialogue().cheers)(n);
    say(line, { mood: 'celebrate', bubbleMs: 2200 });
  }
  function encourage() {
    const n = displayName();
    const line = pick(PP.data.getDialogue().encourage)(n);
    say(line, { mood: 'thinking', bubbleMs: 3500 });
  }
  function correct(game, ...args) {
    const fn = PP.data.getDialogue().correct[game];
    if (!fn) return;
    let line;
    try { line = fn(...args); } catch (e) { return; }
    say(line, { mood: 'thinking', bubbleMs: 7000 });
  }
  function intro(game, ...args) {
    const n = displayName();
    const lines = PP.data.getDialogue().gameIntro[game];
    if (!lines || !lines.length) return;
    const fn = pick(lines);
    let line;
    try { line = fn(n, ...args); } catch (e) { return; }
    say(line, { mood: 'happy', bubbleMs: 5500 });
  }
  function summary(kind, score, total) {
    const n = displayName();
    const fn = PP.data.getDialogue().summary[kind];
    if (!fn) return null;
    try { return fn(n, score, total); } catch (e) { return null; }
  }
  function greet(returning) {
    const n = displayName();
    const lines = returning
      ? PP.data.getDialogue().greetingReturning
      : PP.data.getDialogue().greetingNew;
    if (!lines || !lines.length) return;
    say(pick(lines)(n), { mood: 'happy', bubbleMs: 6000 });
  }
  function hubLine() {
    const n = displayName();
    const lines = PP.data.getDialogue().hubGreet;
    if (!lines || !lines.length) return;
    say(pick(lines)(n), { mood: 'happy', bubbleMs: 5500 });
  }
  function tutorialIntro() {
    const n = displayName();
    const lines = PP.data.getDialogue().tutorialIntro;
    if (!lines || !lines.length) return;
    say(pick(lines)(n), { mood: 'happy', bubbleMs: 5500 });
  }
  function tutorialEnd() {
    const n = displayName();
    const lines = PP.data.getDialogue().tutorialEnd;
    if (!lines || !lines.length) return;
    say(pick(lines)(n), { mood: 'celebrate', bubbleMs: 4500 });
  }

  PP.teacher = {
    init, say, cheer, encourage, correct, intro, summary, greet,
    hubLine, tutorialIntro, tutorialEnd,
    setMood, setSize, hideBubble, showBubble,
  };
})();
