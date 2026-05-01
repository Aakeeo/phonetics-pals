/* ============================================================
   PHONICS PALS — tutorial.js
   Mr. Pip's intro lesson: 5 friendly slides
   ============================================================ */
(function () {
  'use strict';
  const { $, $$ } = PP.utils;
  const { speak } = PP.speech;
  const { sfx } = PP.audio;
  const { letterIntro } = PP.data;

  const slides = [
    {
      title: () => ['Letters are ', { a: 'sound friends!', cls: 'accent' }],
      body: 'Every letter has its own sound. Tap one to hear it say hi!',
      teacher: () => PP.data.tutorialNarration(0),
      demo: () => {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;justify-content:center;';
        ['A','B','C','S'].forEach(L => {
          const d = document.createElement('button');
          d.className = 'demo-letter';
          d.textContent = L;
          d.addEventListener('click', () => { sfx.tap(); speak(letterIntro(L.toLowerCase())); });
          wrap.appendChild(d);
        });
        return wrap;
      },
      hear: () => speak(PP.data.tutorialHear(0)),
    },
    {
      title: () => ['Put sounds together to ', { a: 'make words', cls: 'accent2' }, '!'],
      body: 'Push the sounds together: c-a-t squishes into "cat".',
      teacher: () => PP.data.tutorialNarration(1),
      demo: () => {
        const wrap = document.createElement('div');
        wrap.className = 'demo-blend';
        wrap.innerHTML = `
          <span class="demo-letter" data-l="c" style="background:var(--coral);transform:rotate(-3deg);">C</span>
          <span class="plus">+</span>
          <span class="demo-letter" data-l="a" style="background:var(--sun);color:var(--ink);transform:rotate(3deg);">A</span>
          <span class="plus">+</span>
          <span class="demo-letter" data-l="t" style="background:var(--sky);transform:rotate(-2deg);">T</span>
          <span class="equals">=</span>
          <span class="word-out">CAT 🐱</span>
        `;
        $$('.demo-letter', wrap).forEach(el => {
          el.addEventListener('click', () => { sfx.tap(); speak(letterIntro(el.dataset.l)); });
        });
        $('.word-out', wrap).addEventListener('click', () => { sfx.pop(); speak('Cat!'); });
        return wrap;
      },
      hear: () => speak(PP.data.tutorialHear(1), { rate: 0.85 }),
    },
    {
      title: () => ['Letter ', { a: 'buddies', cls: 'accent3' }, ' (digraphs)!'],
      body: 'Sometimes two letters team up to make ONE sound — like sh, ch, and th.',
      teacher: () => PP.data.tutorialNarration(2),
      demo: () => {
        const wrap = document.createElement('div');
        wrap.className = 'demo-pair';
        const pairs = [
          { letters: 'sh', word: 'ship 🚢', tts: 'Ship. Shell. Shop. The S H sound.' },
          { letters: 'ch', word: 'chip 🍪', tts: 'Chip. Chair. Cherry. The C H sound.' },
          { letters: 'th', word: 'thumb 👍', tts: 'Thumb. Three. Think. The T H sound.' },
        ];
        pairs.forEach(p => {
          const item = document.createElement('button');
          item.className = 'demo-pair-item';
          item.innerHTML = `<span class="lbl">${p.word}</span><span class="big">${p.letters}</span>`;
          item.addEventListener('click', () => { sfx.tap(); speak(p.tts); });
          wrap.appendChild(item);
        });
        return wrap;
      },
      hear: () => speak(PP.data.tutorialHear(2)),
    },
    {
      title: () => ['Short and ', { a: 'long vowels', cls: 'accent2' }, '!'],
      body: 'Short vowels say a quick sound. Long vowels say their NAME.',
      teacher: () => PP.data.tutorialNarration(3),
      demo: () => {
        const wrap = document.createElement('div');
        wrap.className = 'demo-pair';
        const pairs = [
          { lbl: 'short A', big: 'cat 🐱',  tts: 'Short A. Cat.' },
          { lbl: 'long A',  big: 'cake 🎂', tts: 'Long A. Cake.', cls: 'long' },
          { lbl: 'short I', big: 'pig 🐷',  tts: 'Short I. Pig.' },
          { lbl: 'long I',  big: 'kite 🪁', tts: 'Long I. Kite.', cls: 'long' },
        ];
        pairs.forEach(p => {
          const item = document.createElement('button');
          item.className = 'demo-pair-item' + (p.cls ? ' ' + p.cls : '');
          item.innerHTML = `<span class="lbl">${p.lbl}</span><span class="big">${p.big}</span>`;
          item.addEventListener('click', () => { sfx.tap(); speak(p.tts); });
          wrap.appendChild(item);
        });
        return wrap;
      },
      hear: () => speak(PP.data.tutorialHear(3)),
    },
    {
      title: () => ['You\'re ', { a: 'ready!', cls: 'accent' }],
      body: 'Pick a game next. Earn a star for every right answer and collect cool stickers!',
      teacher: () => PP.data.tutorialNarration(4),
      demo: () => {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex;gap:14px;flex-wrap:wrap;justify-content:center;';
        ['🎧', '🏗️', '🕵️', '🌈'].forEach((e, i) => {
          const d = document.createElement('div');
          d.style.cssText = `font-size:54px;background:#fff;border:3px solid var(--ink);border-radius:18px;width:80px;height:80px;display:grid;place-items:center;box-shadow:0 5px 0 var(--ink);transform:rotate(${(i % 2 ? 4 : -4)}deg);`;
          d.textContent = e;
          wrap.appendChild(d);
        });
        return wrap;
      },
      hear: () => speak(PP.data.tutorialHear(4)),
    },
  ];

  let idx = 0;

  function start() {
    idx = 0;
    PP.app.showScreen('tutorial');
    PP.teacher.setSize('small');
    render();
    setTimeout(() => PP.teacher.tutorialIntro(), 200);
  }

  function render() {
    const slide = slides[idx];
    $('#tut-num').textContent = (idx + 1);

    const titleEl = $('#tut-title');
    titleEl.innerHTML = '';
    slide.title().forEach(p => {
      if (typeof p === 'string') titleEl.appendChild(document.createTextNode(p));
      else { const s = document.createElement('span'); s.className = p.cls; s.textContent = p.a; titleEl.appendChild(s); }
    });

    $('#tut-body').textContent = slide.body;
    const demoEl = $('#tut-demo');
    demoEl.innerHTML = '';
    demoEl.appendChild(slide.demo());

    const dots = $('#tut-dots');
    dots.innerHTML = '';
    slides.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'tut-dot' + (i === idx ? ' active' : (i < idx ? ' done' : ''));
      dots.appendChild(d);
    });

    $('#tut-prev').disabled = idx === 0;
    $('#tut-next').textContent = idx === slides.length - 1 ? '🎮' : '→';

    // Mr. Pip narrates each slide (after a tiny delay so it feels natural)
    setTimeout(() => PP.teacher.say(slide.teacher(), { mood: 'happy', bubbleMs: 4500 }), 350);
  }

  function init() {
    $('#tut-prev').addEventListener('click', () => {
      if (idx > 0) { sfx.tap(); idx--; render(); }
    });
    $('#tut-next').addEventListener('click', () => {
      sfx.tap();
      if (idx < slides.length - 1) { idx++; render(); }
      else {
        PP.teacher.tutorialEnd();
        setTimeout(() => PP.app.goToHub(), 1200);
      }
    });
    $('#tut-hear').addEventListener('click', () => {
      sfx.pop(); slides[idx].hear();
    });
  }

  PP.tutorial = { init, start };
})();
