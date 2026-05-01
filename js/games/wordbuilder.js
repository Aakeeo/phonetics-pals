/* ============================================================
   PHONICS PALS — games/wordbuilder.js
   Tap letters to spell the picture
   ============================================================ */
(function () {
  'use strict';
  const { $, $$, shuffle } = PP.utils;
  const { speak } = PP.speech;
  const { sfx } = PP.audio;
  const { wordBuilderWords } = PP.data;

  const ROUNDS = 6;
  let game = null;

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
    const r = game.rounds[game.idx];
    $('#wb-emoji').textContent = r.emoji;
    $('#wb-hint').textContent = r.hint;

    const slots = $('#wb-slots'); slots.innerHTML = '';
    for (let i = 0; i < r.word.length; i++) {
      const s = document.createElement('div');
      s.className = 'wb-slot';
      s.dataset.idx = i;
      s.addEventListener('click', () => slotClick(i));
      slots.appendChild(s);
    }

    const distractors = shuffle('abcdefghijklmnopqrstuvwxyz'.split('').filter(c => !r.word.includes(c))).slice(0, 2);
    const letters = shuffle([...r.word.split(''), ...distractors]);
    const pool = $('#wb-pool'); pool.innerHTML = '';
    letters.forEach((ch, i) => {
      const b = document.createElement('button');
      b.className = 'pool-letter';
      b.textContent = ch.toUpperCase();
      b.dataset.letter = ch;
      b.dataset.idx = i;
      b.addEventListener('click', () => pickLetter(b));
      pool.appendChild(b);
    });

    setTimeout(() => speak('Spell ' + r.word + '.'), 250);
  }

  function pickLetter(btn) {
    if (btn.classList.contains('used')) return;
    const slots = $$('#wb-slots .wb-slot');
    const empty = slots.find(s => !s.classList.contains('filled'));
    if (!empty) return;
    empty.textContent = btn.textContent;
    empty.classList.add('filled');
    empty.dataset.fromIdx = btn.dataset.idx;
    empty.dataset.letter = btn.dataset.letter;
    btn.classList.add('used');
    sfx.tap();
    if (slots.every(s => s.classList.contains('filled'))) check();
  }

  function slotClick(idx) {
    const slot = $$('#wb-slots .wb-slot')[idx];
    if (!slot.classList.contains('filled')) return;
    const fromIdx = slot.dataset.fromIdx;
    slot.textContent = '';
    slot.classList.remove('filled');
    delete slot.dataset.fromIdx; delete slot.dataset.letter;
    const btn = $$('#wb-pool .pool-letter').find(b => b.dataset.idx === fromIdx);
    if (btn) btn.classList.remove('used');
    sfx.tap();
  }

  function check() {
    const slots = $$('#wb-slots .wb-slot');
    const built = slots.map(s => (s.dataset.letter || '').toLowerCase()).join('');
    const target = game.rounds[game.idx].word.toLowerCase();
    if (built === target) {
      slots.forEach(s => s.classList.add('right'));
      sfx.correct();
      PP.app.awardStar('wordbuilder');
      game.correct++;
      PP.teacher.cheer();
      PP.confetti(30, { y: window.innerHeight * 0.4 });
      speak(target + '!');
      setTimeout(() => { game.idx++; renderRound(); }, 1700);
    } else {
      sfx.wrong();
      PP.teacher.correct('wordbuilder', target);
      slots.forEach(s => {
        s.style.animation = 'shakeNo .35s ease-in-out';
        setTimeout(() => s.style.animation = '', 380);
      });
      // Auto-clear after correction so kid can try again
      setTimeout(clearSlots, 1800);
    }
  }

  function clearSlots() {
    $$('#wb-slots .wb-slot').forEach(s => {
      s.textContent = '';
      s.classList.remove('filled', 'right');
      delete s.dataset.fromIdx;
      delete s.dataset.letter;
    });
    $$('#wb-pool .pool-letter').forEach(b => b.classList.remove('used'));
    // Hint: pulse the first slot
    const first = $$('#wb-slots .wb-slot')[0];
    if (first) {
      first.classList.add('hint');
      setTimeout(() => first.classList.remove('hint'), 2000);
    }
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
