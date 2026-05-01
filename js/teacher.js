/* ============================================================
   PHONICS PALS — teacher.js
   Mr. Pip — character behaviors, speech bubble, dialogue API
   ============================================================ */
(function () {
  'use strict';
  const { $, pick } = PP.utils;
  const { speak } = PP.speech;
  const { dialogue } = PP.data;

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
      else say(pick(dialogue.cheers)(state().name));
    });
  }

  function state() {
    return PP.state || { name: 'friend' };
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
    stage.dataset.size = size; // 'small' | 'medium' | 'hidden'
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

  // Core API: have Mr. Pip say something (text + speech + bubble + mood)
  function say(text, opts = {}) {
    lastSpoken = text;
    if (opts.mood) setMood(opts.mood);
    showBubble(text, opts.bubbleMs ?? 6500);
    speak(text, { rate: opts.rate, pitch: opts.pitch });
  }

  // Convenience: say a varied cheer
  function cheer() {
    const n = state().name;
    const line = pick(dialogue.cheers)(n);
    say(line, { mood: 'celebrate', bubbleMs: 2200 });
  }
  // Convenience: say a varied gentle encouragement
  function encourage() {
    const n = state().name;
    const line = pick(dialogue.encourage)(n);
    say(line, { mood: 'thinking', bubbleMs: 3500 });
  }
  // Contextual correction — explains AND re-prompts
  function correct(game, ...args) {
    const fn = dialogue.correct[game];
    if (!fn) return;
    const line = fn(...args);
    say(line, { mood: 'thinking', bubbleMs: 7000 });
  }

  function intro(game, ...args) {
    const n = state().name;
    const lines = dialogue.gameIntro[game];
    if (!lines) return;
    const fn = pick(lines);
    const line = fn(n, ...args);
    say(line, { mood: 'happy', bubbleMs: 5500 });
  }

  function summary(kind, score, total) {
    const n = state().name;
    const fn = dialogue.summary[kind];
    if (!fn) return null;
    return fn(n, score, total);
  }

  function greet(returning) {
    const n = state().name;
    const lines = returning ? dialogue.greetingReturning : dialogue.greetingNew;
    say(pick(lines)(n), { mood: 'happy', bubbleMs: 6000 });
  }

  function hubLine() {
    const n = state().name;
    say(pick(dialogue.hubGreet)(n), { mood: 'happy', bubbleMs: 5500 });
  }

  PP.teacher = {
    init, say, cheer, encourage, correct, intro, summary, greet,
    hubLine, setMood, setSize, hideBubble, showBubble,
  };
})();
