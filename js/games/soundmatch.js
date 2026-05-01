/* ============================================================
   PHONICS PALS — games/soundmatch.js
   Listen to the word, tap the starting letter
   ============================================================ */
(function () {
  'use strict';
  const { $, $$, shuffle } = PP.utils;
  const { speak } = PP.speech;
  const { sfx } = PP.audio;
  const { soundMatchPool, soundPrompt, letterWords } = PP.data;

  const ROUNDS = 8;
  let game = null;

  function start() {
    const pool = shuffle([...soundMatchPool]).slice(0, ROUNDS);
    game = { rounds: pool, idx: 0, correct: 0 };
    PP.app.showScreen('soundmatch');
    PP.teacher.setSize('small');
    PP.teacher.intro('soundmatch');
    renderProgress();
    setTimeout(renderRound, 1700); // give intro time to play
  }

  function renderProgress() {
    const p = $('#sm-progress'); p.innerHTML = '';
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
    const target = game.rounds[game.idx];
    const distractors = shuffle(soundMatchPool.filter(l => l !== target)).slice(0, 3);
    const choices = shuffle([target, ...distractors]);

    const grid = $('#sm-choices');
    grid.innerHTML = '';
    choices.forEach(letter => {
      const tile = document.createElement('button');
      tile.className = 'letter-tile';
      tile.textContent = letter.toUpperCase();
      tile.dataset.letter = letter;
      tile.addEventListener('click', () => choose(tile, letter, target));
      grid.appendChild(tile);
    });
    setTimeout(() => speak(soundPrompt(target)), 250);
  }

  function choose(tile, picked, target) {
    if (tile.classList.contains('right') || tile.classList.contains('wrong')) return;
    if (picked === target) {
      tile.classList.add('right');
      sfx.correct();
      PP.app.awardStar('soundmatch');
      game.correct++;
      PP.teacher.cheer();
      PP.confetti(28, { y: window.innerHeight * 0.4 });
      setTimeout(() => { game.idx++; renderRound(); }, 1500);
    } else {
      tile.classList.add('wrong');
      sfx.wrong();
      // Mr. Pip explains and re-prompts
      PP.teacher.correct('soundmatch', picked, target);
      // Highlight the right letter as a hint after a moment
      setTimeout(() => {
        const rightTile = $$('#sm-choices .letter-tile').find(t => t.dataset.letter === target);
        if (rightTile) rightTile.classList.add('hint');
        tile.classList.remove('wrong');
        // Re-play target word once correction finishes
        setTimeout(() => speak(soundPrompt(target)), 2400);
      }, 600);
    }
  }

  function endGame() {
    const earned = game.correct;
    let unlocked = null;
    if (earned >= Math.ceil(ROUNDS * 0.6)) unlocked = PP.app.unlockSticker('ear');
    if (earned === ROUNDS) PP.app.unlockSticker('rainbow');

    const kind = earned === ROUNDS ? 'perfect' : earned >= Math.ceil(ROUNDS * 0.6) ? 'good' : 'ok';
    const summary = PP.teacher.summary(kind, earned, ROUNDS);
    if (summary) PP.teacher.say(summary, { mood: 'celebrate', bubbleMs: 5000 });

    PP.results.show({
      title: 'Great ears!',
      msg: `You got ${earned} out of ${ROUNDS} sounds!`,
      earned, total: ROUNDS,
      sticker: unlocked,
      onReplay: start,
    });
  }

  function init() {
    $('#sm-hear').addEventListener('click', () => {
      if (!game) return;
      sfx.pop();
      speak(soundPrompt(game.rounds[game.idx]));
    });
  }

  PP.games = PP.games || {};
  PP.games.soundmatch = { init, start };
})();
