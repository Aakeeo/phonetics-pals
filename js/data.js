/* ============================================================
   PHONICS PALS — data.js
   Phonics curriculum + Mr. Pip's dialogue lines
   ============================================================ */
(function () {
  'use strict';

  // Letter -> example word (for letter-sound association)
  const letterWords = {
    a: 'apple',  b: 'ball',  c: 'cat',     d: 'dog',
    e: 'egg',    f: 'fish',  g: 'goat',    h: 'hat',
    i: 'igloo',  j: 'jam',   k: 'king',    l: 'lion',
    m: 'moon',   n: 'nest',  o: 'octopus', p: 'pig',
    r: 'rabbit', s: 'sun',   t: 'turtle',  u: 'umbrella',
    v: 'van',    w: 'water', y: 'yo-yo',   z: 'zebra',
  };

  function letterIntro(l) {
    const w = letterWords[l] || l;
    return `${l.toUpperCase()}. ${w}.`;
  }
  function soundPrompt(l) {
    const w = letterWords[l] || l;
    return `${w}. ${w} starts with which letter?`;
  }

  const soundMatchPool = ['a','s','m','t','b','f','l','n','p','r','c','d','g','h','o','i','u'];

  const wordBuilderWords = [
    { word: 'cat', emoji: '🐱', hint: 'It says "meow!"' },
    { word: 'sun', emoji: '☀️', hint: 'It is up in the sky.' },
    { word: 'pig', emoji: '🐷', hint: 'It rolls in the mud.' },
    { word: 'dog', emoji: '🐶', hint: 'It says "woof!"' },
    { word: 'hat', emoji: '🎩', hint: 'You wear it on your head.' },
    { word: 'bug', emoji: '🐛', hint: 'A tiny creepy crawler.' },
    { word: 'fox', emoji: '🦊', hint: 'A clever forest friend.' },
    { word: 'bee', emoji: '🐝', hint: 'It buzzes and makes honey.' },
  ];

  // Each round has: target digraph, mixed words, set of correct words, and an example
  const digraphRounds = [
    {
      target: 'sh',
      example: 'ship',
      words: ['ship', 'cat', 'fish', 'sun', 'wash', 'dog', 'shell', 'pig'],
      answers: ['ship', 'fish', 'wash', 'shell'],
    },
    {
      target: 'ch',
      example: 'chip',
      words: ['chair', 'sun', 'much', 'lamp', 'chip', 'ball', 'lunch', 'bee'],
      answers: ['chair', 'much', 'chip', 'lunch'],
    },
    {
      target: 'th',
      example: 'thumb',
      words: ['this', 'frog', 'math', 'cup', 'thumb', 'duck', 'with', 'star'],
      answers: ['this', 'math', 'thumb', 'with'],
    },
  ];

  // Each vowel word notes the vowel letter for highlighting
  const vowelWords = [
    { word: 'cat',  len: 'short', vowel: 'a' },
    { word: 'cake', len: 'long',  vowel: 'a' },
    { word: 'pig',  len: 'short', vowel: 'i' },
    { word: 'kite', len: 'long',  vowel: 'i' },
    { word: 'sun',  len: 'short', vowel: 'u' },
    { word: 'rope', len: 'long',  vowel: 'o' },
    { word: 'hen',  len: 'short', vowel: 'e' },
    { word: 'cube', len: 'long',  vowel: 'u' },
    { word: 'mop',  len: 'short', vowel: 'o' },
    { word: 'bike', len: 'long',  vowel: 'i' },
  ];

  const stickerCatalog = {
    soundmatch: { id: 'ear',       emoji: '🎧', name: 'Sound Hero' },
    wordbuilder:{ id: 'brick',     emoji: '🏗️', name: 'Word Builder' },
    digraph:    { id: 'detective', emoji: '🕵️', name: 'Digraph Detective' },
    vowel:      { id: 'cake',      emoji: '🎂', name: 'Vowel Master' },
    perfect:    { id: 'rainbow',   emoji: '🌈', name: 'Rainbow Star' },
    streak:     { id: 'rocket',    emoji: '🚀', name: 'On a Roll' },
  };

  // ============================================================
  // Mr. Pip's dialogue — varied lines, contextual corrections
  // ============================================================
  const dialogue = {
    // Welcome screen — when the kid opens the app or returns
    greetingNew: [
      n => `Hi ${n}! I'm Mr. Pip. I'll be your sound teacher today.`,
      n => `Hello ${n}! I'm so glad you came to class. I'm Mr. Pip!`,
      n => `Welcome, ${n}! I'm Mr. Pip the owl. Ready to play with sounds?`,
    ],
    greetingReturning: [
      n => `Welcome back, ${n}! Great to see you again.`,
      n => `Hi ${n}! Ready for more sound fun?`,
      n => `${n}! You came back. Let's keep learning!`,
    ],

    tutorialIntro: [
      n => `First, let me show you how phonics works, ${n}. It's like magic!`,
      n => `Let's start with a quick lesson, ${n}. Don't worry, it's fun.`,
    ],
    tutorialEnd: [
      n => `You're ready, ${n}! Pick a game to play.`,
      n => `Great listening, ${n}! Let's pick a game now.`,
    ],

    hubGreet: [
      n => `What shall we play first, ${n}?`,
      n => `Pick a lesson, ${n}!`,
      n => `I love your sticker collection, ${n}. Let's earn another!`,
    ],

    // Per-game intro and end
    gameIntro: {
      soundmatch: [
        n => `Sound Match! I'll say a word, ${n}. You tap the letter that starts it.`,
        n => `Listen for the first sound, ${n}, and tap that letter!`,
      ],
      wordbuilder: [
        n => `Word Builder! Look at the picture, ${n}, and tap the letters in order.`,
        n => `Time to build words, ${n}! What does the picture show?`,
      ],
      digraph: [
        (n, t) => `Digraph Hunt! We're looking for the ${t} sound today, ${n}.`,
        (n, t) => `Find every word with ${t}, ${n}. They team up to make ONE sound!`,
      ],
      vowel: [
        n => `Vowel Sort! Short vowels say a quick sound. Long vowels say their name, ${n}.`,
        n => `Listen carefully, ${n}. Is the vowel SHORT or LONG?`,
      ],
    },

    cheers: [
      n => `Yes! Brilliant, ${n}!`,
      n => `That's right!`,
      n => `Wonderful, ${n}!`,
      n => `You did it!`,
      n => `Star sound, ${n}!`,
      n => `Excellent!`,
      n => `Way to go!`,
      n => `Bullseye, ${n}!`,
      n => `Sweet listening!`,
      n => `Hooray!`,
    ],

    encourage: [
      n => `Almost, ${n}! Let's listen again.`,
      n => `Good guess. Try one more time.`,
      n => `Hmm, not quite. I'll help you.`,
      n => `Close! Listen carefully.`,
      n => `Nice try, ${n}. Listen again.`,
    ],

    // Contextual corrections — explain WHY and re-prompt
    correct: {
      // Sound Match: kid picked wrong letter
      soundmatch: (picked, target) => {
        const pw = letterWords[picked]   || picked;
        const tw = letterWords[target]   || target;
        return `That's ${picked.toUpperCase()} for ${pw}. We want ${tw} — listen, ${tw} starts with ${target.toUpperCase()}!`;
      },
      // Word Builder: full attempt was wrong
      wordbuilder: (target) => {
        return `The word is ${target}. Say it slowly: ${target}. Try again!`;
      },
      // Digraph Hunt: kid tapped a word without the digraph
      digraph: (word, target, example) => {
        return `${word} doesn't have ${target.toUpperCase()}. We need words like ${example} — with the ${target} sound!`;
      },
      // Vowel Sort: kid picked wrong bucket
      vowel: (word, actualLen) => {
        const why = actualLen === 'long' ? 'it says its name' : 'a quick sound';
        return `${word} has a ${actualLen} vowel — ${why}. Try the ${actualLen} bucket!`;
      },
    },

    // Game complete summary
    summary: {
      perfect: (n, total, game) =>
        `Wow ${n}, perfect! ${total} out of ${total}! You're a star.`,
      good: (n, score, total, game) =>
        `Great work, ${n}! You earned ${score} stars. Keep it up!`,
      ok: (n, score, total, game) =>
        `Good try, ${n}! You got ${score}. Practice makes perfect!`,
    },
  };

  PP.data = {
    letterWords,
    letterIntro,
    soundPrompt,
    soundMatchPool,
    wordBuilderWords,
    digraphRounds,
    vowelWords,
    stickerCatalog,
    dialogue,
  };
})();
