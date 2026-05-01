/* ============================================================
   PHONICS PALS — games/digraph.js
   DRAG version: drag words containing the digraph into the basket.
   Wrong word → shakes red and snaps back. Right word → joins basket.
   ============================================================ */
(function () {
  'use strict';
  const { $, $$, shuffle } = PP.utils;
  const { speak } = PP.speech;
  const { sfx } = PP.audio;
  const { digraphRounds } = PP.data;

  let game = null;

  function start() {
    const round = digraphRounds[Math.floor(Math.random() * digraphRounds.length)];
    game = {
      target: round.target,
      example: round.example,
      words: shuffle([...round.words]),
      answers: new Set(round.answers),
      found: 0,
    };
    PP.app.showScreen('digraph');
    PP.teacher.setSize('small');
    PP.teacher.intro('digraph', round.target.toUpperCase());

    $('#dh-target').textContent = `Find: ${round.target}`;
    $('#dh-found').textContent = '0';
    $('#dh-total').textContent = round.answers.length;
    resetBasket();
    renderBoard();
    setTimeout(() => speak(`Find words with ${round.target}!`), 1900);
  }

  function highlightDigraph(word, target) {
    const i = word.toLowerCase().indexOf(target);
    if (i < 0) return word;
    return word.slice(0, i) + `<span class="digraph-hl">${word.slice(i, i + target.length)}</span>` + word.slice(i + target.length);
  }

  function resetBasket() {
    const basket = $('#dh-basket');
    // Remove any previously-found chips, keep the label + empty hint
    Array.from(basket.querySelectorAll('.basket-found')).forEach(n => n.remove());
    const empty = $('#dh-basket-empty');
    if (empty) empty.style.display = '';
  }

  function renderBoard() {
    const board = $('#dh-board');
    board.innerHTML = '';
    game.words.forEach(w => {
      const c = document.createElement('button');
      c.className = 'word-card';
      c.dataset.word = w;
      c.textContent = w;
      PP.dnd.makeDraggable(c, {
        dropSelector: '#dh-basket',
        onDrop: (zone, src) => onDropWord(zone, src),
      });
      board.appendChild(c);
    });
  }

  function onDropWord(basket, src) {
    const w = src.dataset.word;
    if (game.answers.has(w)) {
      // Right — add to basket
      src.classList.add('drop-correct');
      sfx.correct();
      PP.app.awardStar('digraph');
      game.found++;
      $('#dh-found').textContent = game.found;
      // Hide the empty label once first found
      const empty = $('#dh-basket-empty');
      if (empty) empty.style.display = 'none';
      // Make a chip in the basket
      const chip = document.createElement('span');
      chip.className = 'basket-found';
      chip.innerHTML = highlightDigraph(w, game.target);
      basket.appendChild(chip);
      // Source becomes inert
      src.style.pointerEvents = 'none';
      src.style.opacity = '0.5';
      PP.teacher.cheer();
      PP.confetti(20);
      speak(w + '!', { rate: 0.95 });
      if (game.found === game.answers.size) setTimeout(endGame, 1300);
      return true;
    } else {
      // Wrong word — shake basket briefly + Mr. Pip explains
      basket.classList.add('drop-wrong');
      sfx.wrong();
      PP.teacher.correct('digraph', w, game.target.toUpperCase(), game.example);
      setTimeout(() => basket.classList.remove('drop-wrong'), 800);
      return false;
    }
  }

  function endGame() {
    const earned = game.found;
    const total = game.answers.size;
    let unlocked = null;
    if (earned === total) unlocked = PP.app.unlockSticker('detective');
    const kind = earned === total ? 'perfect' : earned >= Math.ceil(total * 0.6) ? 'good' : 'ok';
    const summary = PP.teacher.summary(kind, earned, total);
    if (summary) PP.teacher.say(summary, { mood: 'celebrate', bubbleMs: 5000 });
    PP.results.show({
      title: 'Sound sleuth!',
      msg: `You found ${earned} of ${total} ${game.target} words!`,
      earned, total,
      sticker: unlocked,
      onReplay: start,
    });
  }

  function init() {
    // Static screen
  }

  PP.games = PP.games || {};
  PP.games.digraph = { init, start };
})();
