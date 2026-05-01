/* ============================================================
   PHONICS PALS — games/soundmatch.js
   DRAG version: hear the word, drag the right letter into the slot
   ============================================================ */
(function () {
  'use strict';
  const { $, $$, shuffle } = PP.utils;
  const { speak } = PP.speech;
  const { sfx } = PP.audio;
  const { soundMatchPool, soundPrompt, letterWords } = PP.data;

  const ROUNDS = 8;
  let game = null;
  let target = null;

  function start() {
    const pool = shuffle([...soundMatchPool]).slice(0, ROUNDS);
    game = { rounds: pool, idx: 0, correct: 0 };
    PP.app.showScreen('soundmatch');
    PP.teacher.setSize('small');
    PP.teacher.intro('soundmatch');
    renderProgress();
    setTimeout(renderRound, 1700);
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
    target = game.rounds[game.idx];

    // Reset target slot
    const slot = $('#sm-target');
    slot.textContent = '?';
    slot.classList.remove('drop-correct', 'drop-wrong');

    // 4 letter tiles
    const distractors = shuffle(soundMatchPool.filter(l => l !== target)).slice(0, 3);
    const choices = shuffle([target, ...distractors]);
    const grid = $('#sm-choices');
    grid.innerHTML = '';
    choices.forEach(letter => {
      const tile = document.createElement('button');
      tile.className = 'letter-tile';
      tile.textContent = letter.toUpperCase();
      tile.dataset.letter = letter;
      // Drag setup
      PP.dnd.makeDraggable(tile, {
        dropSelector: '#sm-target',
        onDrop: (zone, src) => onDropTile(zone, src),
      });
      // Tap as fallback (also kid-friendly): single tap = "throw" letter into slot
      tile.addEventListener('click', e => {
        // Only trigger click if NOT a drag (no movement happened)
        if (tile.classList.contains('drop-correct') || tile.classList.contains('used')) return;
        // Treat tap as a drop attempt
        const zone = $('#sm-target');
        if (zone) onDropTile(zone, tile);
      });
      grid.appendChild(tile);
    });
    setTimeout(() => speak(soundPrompt(target)), 250);
  }

  function onDropTile(zone, src) {
    const picked = src.dataset.letter;
    if (picked === target) {
      zone.textContent = picked.toUpperCase();
      zone.classList.add('drop-correct');
      src.classList.add('used');
      sfx.correct();
      PP.app.awardStar('soundmatch');
      game.correct++;
      PP.teacher.cheer();
      PP.confetti(28, { y: window.innerHeight * 0.4 });
      setTimeout(() => { game.idx++; renderRound(); }, 1500);
      return true; // ghost stays gone
    } else {
      zone.classList.add('drop-wrong');
      sfx.wrong();
      PP.teacher.correct('soundmatch', picked, target);
      setTimeout(() => zone.classList.remove('drop-wrong'), 600);
      // Hint: highlight the right tile
      setTimeout(() => {
        const right = $$('#sm-choices .letter-tile').find(t => t.dataset.letter === target);
        if (right) {
          right.classList.add('hint');
          setTimeout(() => right.classList.remove('hint'), 2400);
        }
        speak(soundPrompt(target));
      }, 2200);
      return false; // ghost snaps back
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
      speak(soundPrompt(target));
    });
  }

  PP.games = PP.games || {};
  PP.games.soundmatch = { init, start };
})();
