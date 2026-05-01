/* ============================================================
   PHONICS PALS — games/vowel.js
   Sort each word: short or long vowel?
   ============================================================ */
(function () {
  'use strict';
  const { $, $$, shuffle } = PP.utils;
  const { speak } = PP.speech;
  const { sfx } = PP.audio;
  const { vowelWords } = PP.data;

  const ROUNDS = 6;
  let game = null;

  function start() {
    const rounds = shuffle([...vowelWords]).slice(0, ROUNDS);
    game = { rounds, idx: 0, correct: 0 };
    PP.app.showScreen('vowel');
    PP.teacher.setSize('small');
    PP.teacher.intro('vowel');
    renderProgress();
    setTimeout(renderRound, 1900);
  }

  function renderProgress() {
    const p = $('#vs-progress'); p.innerHTML = '';
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
    const w = $('#vs-word');
    // Highlight the vowel inside the word
    const idx = r.word.indexOf(r.vowel);
    if (idx >= 0) {
      w.innerHTML =
        r.word.slice(0, idx) +
        `<span class="vowel-hl">${r.word[idx]}</span>` +
        r.word.slice(idx + 1);
    } else {
      w.textContent = r.word;
    }
    $$('.vs-bucket').forEach(b => b.classList.remove('right', 'wrong', 'hint'));
    setTimeout(() => speak(r.word), 200);
  }

  function pickBucket(b) {
    if (!game) return;
    const r = game.rounds[game.idx];
    if (b.dataset.len === r.len) {
      b.classList.add('right');
      sfx.correct();
      PP.app.awardStar('vowel');
      game.correct++;
      PP.teacher.cheer();
      PP.confetti(24);
      setTimeout(() => { game.idx++; renderRound(); }, 1300);
    } else {
      b.classList.add('wrong');
      sfx.wrong();
      PP.teacher.correct('vowel', r.word, r.len);
      // Hint the right bucket
      const right = $$('.vs-bucket').find(x => x.dataset.len === r.len);
      if (right) {
        setTimeout(() => right.classList.add('hint'), 700);
        setTimeout(() => right.classList.remove('hint'), 2700);
      }
      setTimeout(() => b.classList.remove('wrong'), 800);
    }
  }

  function endGame() {
    const earned = game.correct;
    let unlocked = null;
    if (earned >= Math.ceil(ROUNDS * 0.6)) unlocked = PP.app.unlockSticker('cake');
    if (earned === ROUNDS) PP.app.unlockSticker('rainbow');
    const kind = earned === ROUNDS ? 'perfect' : earned >= Math.ceil(ROUNDS * 0.6) ? 'good' : 'ok';
    const summary = PP.teacher.summary(kind, earned, ROUNDS);
    if (summary) PP.teacher.say(summary, { mood: 'celebrate', bubbleMs: 5000 });
    PP.results.show({
      title: 'Vowel champ!',
      msg: `You sorted ${earned} of ${ROUNDS} words!`,
      earned, total: ROUNDS,
      sticker: unlocked,
      onReplay: start,
    });
  }

  function init() {
    $$('.vs-bucket').forEach(b => b.addEventListener('click', () => pickBucket(b)));
    $('#vs-hear').addEventListener('click', () => {
      if (!game) return;
      sfx.pop();
      speak(game.rounds[game.idx].word);
    });
  }

  PP.games = PP.games || {};
  PP.games.vowel = { init, start };
})();
