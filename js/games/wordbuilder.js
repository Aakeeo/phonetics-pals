/* ============================================================
   PHONICS PALS — games/wordbuilder.js
   DRAG version: each slot expects a specific letter (per-position
   validation). Right letter → slot turns green. Wrong letter → ghost
   snaps back, gentle correction from Mr. Pip.
   ============================================================ */
(function () {
  'use strict';
  const { $, $$, shuffle } = PP.utils;
  const { speak } = PP.speech;
  const { sfx } = PP.audio;
  const { wordBuilderWords } = PP.data;

  const ROUNDS = 6;
  let game = null;
  let wrongAttempts = 0;

  function start() {
    const rounds = shuffle([...wordBuilderWords]).slice(0, ROUNDS);
    game = { rounds, idx: 0, correct: 0 };
    PP.app.showScreen('wordbuilder');
    PP.teacher.setSize('small');
    PP.teacher.intro('wordbuilder');
    renderProgress();
    setTimeout(renderRound, 1800);
  }

  function renderProgress() {
    const p = $('#wb-progress'); p.innerHTML = '';
    for (let i = 0; i < ROUNDS; i++) {
      const pip = document.createElement('div');
      pip.className = 'progress-pip';
      if (i < game.idx) pip.classList.add('done');
      else if (i === game.idx) pip.classList.add('current');
      p.appendChild(pip);
    }
  }

  function renderRound() {
    if (game.idx >= ROUNDS) return endGame();
    renderProgress();
    wrongAttempts = 0;
    const r = game.rounds[game.idx];
    $('#wb-emoji').textContent = r.emoji;
    $('#wb-hint').textContent = r.hint;

    const slots = $('#wb-slots'); slots.innerHTML = '';
    for (let i = 0; i < r.word.length; i++) {
      const s = document.createElement('div');
      s.className = 'wb-slot drop-zone';
      s.dataset.idx = i;
      s.dataset.expected = r.word[i].toLowerCase();
      slots.appendChild(s);
    }

    const distractors = shuffle('abcdefghijklmnopqrstuvwxyz'.split('').filter(c => !r.word.includes(c))).slice(0, 2);
    const letters = shuffle([...r.word.split(''), ...distractors]);
    const pool = $('#wb-pool'); pool.innerHTML = '';
    letters.forEach((ch, i) => {
      const b = document.createElement('button');
      b.className = 'pool-letter';
      b.textContent = ch.toUpperCase();
      b.dataset.letter = ch.toLowerCase();
      b.dataset.idx = String(i);
      PP.dnd.makeDraggable(b, {
        dropSelector: '.wb-slot',
        onDrop: (zone, src) => onDropLetter(zone, src),
      });
      pool.appendChild(b);
    });
    setTimeout(() => speak('Spell ' + r.word + '.'), 250);
  }

  function onDropLetter(slot, src) {
    if (slot.classList.contains('drop-correct')) {
      // Already filled — wrong target
      slot.classList.add('drop-wrong');
      sfx.wrong();
      setTimeout(() => slot.classList.remove('drop-wrong'), 500);
      return false;
    }
    const expected = slot.dataset.expected;
    const picked = src.dataset.letter;
    if (picked === expected) {
      slot.textContent = picked.toUpperCase();
      slot.classList.add('drop-correct');
      slot.dataset.letter = picked;
      src.classList.add('used');
      sfx.pop();
      PP.confetti(8, { x: slot.getBoundingClientRect().left + 30, y: slot.getBoundingClientRect().top });
      checkComplete();
      return true;
    } else {
      // Wrong letter for this slot
      slot.classList.add('drop-wrong');
      sfx.wrong();
      wrongAttempts++;
      // Correct softly after the second mistake
      if (wrongAttempts >= 2) {
        const target = game.rounds[game.idx].word;
        PP.teacher.correct('wordbuilder', target);
      } else {
        PP.teacher.encourage();
      }
      setTimeout(() => slot.classList.remove('drop-wrong'), 600);
      return false;
    }
  }

  function checkComplete() {
    const slots = $$('#wb-slots .wb-slot');
    if (slots.every(s => s.classList.contains('drop-correct'))) {
      const target = game.rounds[game.idx].word;
      sfx.correct();
      PP.app.awardStar('wordbuilder');
      game.correct++;
      PP.teacher.cheer();
      PP.confetti(30, { y: window.innerHeight * 0.4 });
      speak(target + '!');
      setTimeout(() => { game.idx++; renderRound(); }, 1700);
    }
  }

  function clearSlots() {
    $$('#wb-slots .wb-slot').forEach(s => {
      s.textContent = '';
      s.classList.remove('drop-correct', 'drop-wrong');
      delete s.dataset.letter;
    });
    $$('#wb-pool .pool-letter').forEach(b => b.classList.remove('used'));
  }

  function endGame() {
    const earned = game.correct;
    let unlocked = null;
    if (earned >= Math.ceil(ROUNDS * 0.6)) unlocked = PP.app.unlockSticker('brick');
    if (earned === ROUNDS) PP.app.unlockSticker('rainbow');
    const kind = earned === ROUNDS ? 'perfect' : earned >= Math.ceil(ROUNDS * 0.6) ? 'good' : 'ok';
    const summary = PP.teacher.summary(kind, earned, ROUNDS);
    if (summary) PP.teacher.say(summary, { mood: 'celebrate', bubbleMs: 5000 });
    PP.results.show({
      title: 'Word wizard!',
      msg: `You spelled ${earned} of ${ROUNDS} words!`,
      earned, total: ROUNDS,
      sticker: unlocked,
      onReplay: start,
    });
  }

  function init() {
    $('#wb-clear').addEventListener('click', () => {
      if (!game) return;
      sfx.tap();
      clearSlots();
    });
    $('#wb-hear-word').addEventListener('click', () => {
      if (!game) return;
      sfx.pop();
      const w = game.rounds[game.idx].word;
      speak(w + '. ' + w + '.', { rate: 0.78 });
    });
  }

  PP.games = PP.games || {};
  PP.games.wordbuilder = { init, start };
})();
