/* ============================================================
   PHONICS PALS — games/digraph.js
   Find every word with the target digraph (sh, ch, th)
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
    renderBoard();
    setTimeout(() => speak(`Find words with ${round.target}!`), 1900);
  }

  function highlightDigraph(word, target) {
    const i = word.toLowerCase().indexOf(target);
    if (i < 0) return word;
    return word.slice(0, i) + `<span class="digraph-hl">${word.slice(i, i + target.length)}</span>` + word.slice(i + target.length);
  }

  function renderBoard() {
    const board = $('#dh-board');
    board.innerHTML = '';
    game.words.forEach(w => {
      const c = document.createElement('button');
      c.className = 'word-card';
      c.dataset.word = w;
      c.textContent = w; // show plain — kid hunts; we reveal-highlight after right answer
      c.addEventListener('click', () => pick(c, w));
      board.appendChild(c);
    });
  }

  function pick(card, w) {
    if (card.classList.contains('found')) return;
    if (game.answers.has(w)) {
      card.classList.add('right', 'found');
      // Reveal the digraph highlight on the correct word
      card.innerHTML = highlightDigraph(w, game.target);
      sfx.correct();
      PP.app.awardStar('digraph');
      game.found++;
      $('#dh-found').textContent = game.found;
      PP.teacher.cheer();
      PP.confetti(20);
      speak(w + '!', { rate: 0.95 });
      if (game.found === game.answers.size) setTimeout(endGame, 1300);
    } else {
      card.classList.add('wrong');
      sfx.wrong();
      PP.teacher.correct('digraph', w, game.target.toUpperCase(), game.example);
      setTimeout(() => card.classList.remove('wrong'), 800);
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
    // Static screen — no extra controls beyond board taps
  }

  PP.games = PP.games || {};
  PP.games.digraph = { init, start };
})();
