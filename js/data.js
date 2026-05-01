/* ============================================================
   PHONICS PALS — data.js
   Phonics curriculum + Mr. Pip's dialogue in 5 languages.
   English letters and example words are preserved verbatim
   inside native-language explanations (code-switched), so
   ElevenLabs multilingual_v2 pronounces each part naturally.
   Languages: en (English), hi (Hindi), ta (Tamil), te (Telugu),
   kn (Kannada).
   ============================================================ */
(function () {
  'use strict';
  const { storeGet, storeSet } = PP.utils;

  // ---------------- Phonics curriculum ----------------
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
    return `${l ? l.toUpperCase() : ''}. ${w}.`;
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

  const digraphRounds = [
    { target: 'sh', example: 'ship',
      words: ['ship', 'cat', 'fish', 'sun', 'wash', 'dog', 'shell', 'pig'],
      answers: ['ship', 'fish', 'wash', 'shell'] },
    { target: 'ch', example: 'chip',
      words: ['chair', 'sun', 'much', 'lamp', 'chip', 'ball', 'lunch', 'bee'],
      answers: ['chair', 'much', 'chip', 'lunch'] },
    { target: 'th', example: 'thumb',
      words: ['this', 'frog', 'math', 'cup', 'thumb', 'duck', 'with', 'star'],
      answers: ['this', 'math', 'thumb', 'with'] },
  ];

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
    soundmatch:  { id: 'ear',       emoji: '🎧', name: 'Sound Hero' },
    wordbuilder: { id: 'brick',     emoji: '🏗️', name: 'Word Builder' },
    digraph:     { id: 'detective', emoji: '🕵️', name: 'Digraph Detective' },
    vowel:       { id: 'cake',      emoji: '🎂', name: 'Vowel Master' },
    perfect:     { id: 'rainbow',   emoji: '🌈', name: 'Rainbow Star' },
    streak:      { id: 'rocket',    emoji: '🚀', name: 'On a Roll' },
  };

  // ============================================================
  // Language bundles. Each is its own dialogue object.
  // ============================================================
  const LANGS = {
    en: { code: 'en', name: 'English',  ttsLang: 'en-US', native: 'English' },
    hi: { code: 'hi', name: 'Hindi',    ttsLang: 'hi-IN', native: 'हिन्दी' },
    ta: { code: 'ta', name: 'Tamil',    ttsLang: 'ta-IN', native: 'தமிழ்' },
    te: { code: 'te', name: 'Telugu',   ttsLang: 'te-IN', native: 'తెలుగు' },
    kn: { code: 'kn', name: 'Kannada',  ttsLang: 'kn-IN', native: 'ಕನ್ನಡ' },
  };

  // ============================================================
  // English (default)
  // ============================================================
  const en = {
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
    gameIntro: {
      soundmatch: [
        n => `Sound Match! I'll say a word, ${n}. Drag the letter that starts it into the slot!`,
        n => `Listen for the first sound, ${n}, and drag that letter to the box!`,
      ],
      wordbuilder: [
        n => `Word Builder! Look at the picture, ${n}, and drag the letters into the right places.`,
        n => `Time to build words, ${n}! Drag each letter where it belongs.`,
      ],
      digraph: [
        (n, t) => `Digraph Hunt! Drag every word with ${t} into the basket, ${n}!`,
        (n, t) => `Find every word with ${t}, ${n}. They team up to make ONE sound!`,
      ],
      vowel: [
        n => `Vowel Sort! Drag the word into the right bucket, ${n}.`,
        n => `Listen carefully, ${n}. Is the vowel SHORT or LONG? Drag it to the right basket!`,
      ],
    },
    cheers: [
      n => `Yes! Brilliant, ${n}!`, n => `That's right!`, n => `Wonderful, ${n}!`,
      n => `You did it!`,           n => `Star sound, ${n}!`, n => `Excellent!`,
      n => `Way to go!`,            n => `Bullseye, ${n}!`,   n => `Sweet listening!`,
      n => `Hooray!`,
    ],
    encourage: [
      n => `Almost, ${n}! Let's listen again.`,
      n => `Good guess. Try one more time.`,
      n => `Hmm, not quite. I'll help you.`,
      n => `Close! Listen carefully.`,
      n => `Nice try, ${n}. Listen again.`,
    ],
    correct: {
      soundmatch: (picked, target) => {
        const pw = letterWords[picked] || picked;
        const tw = letterWords[target] || target;
        return `That's ${picked.toUpperCase()} for ${pw}. We want ${tw} — listen, ${tw} starts with ${target.toUpperCase()}!`;
      },
      wordbuilder: (target) => `The word is ${target}. Say it slowly: ${target}. Try again!`,
      digraph: (word, target, example) =>
        `${word} doesn't have ${target.toUpperCase()}. We need words like ${example} — with the ${target} sound!`,
      vowel: (word, actualLen) => {
        const why = actualLen === 'long' ? 'it says its name' : 'a quick sound';
        return `${word} has a ${actualLen} vowel — ${why}. Try the ${actualLen} bucket!`;
      },
    },
    summary: {
      perfect: (n, total) => `Wow ${n}, perfect! ${total} out of ${total}! You're a star.`,
      good:    (n, score) => `Great work, ${n}! You earned ${score} stars. Keep it up!`,
      ok:      (n, score) => `Good try, ${n}! You got ${score}. Practice makes perfect!`,
    },
    tutorialNarration: [
      "Letters are sound friends! Tap a letter to hear it.",
      "Sounds team up to make words. Tap to hear it!",
      "Two letters can team up. Listen to these buddies!",
      "Short vowels are quick. Long vowels say their name!",
      "You're ready! Pick a game and let's play!",
    ],
    tutorialHear: [
      "Letters are sound friends! Each letter has its own sound. Tap a letter to hear it!",
      "Cat. Cat. The word cat is made of three sounds, all together: cat.",
      "Letter buddies! Ship. Chip. Thumb.",
      "Short vowels make quick sounds. Cat. Pig. Long vowels say their name. Cake. Kite.",
      "You are ready! Pick a game and let's play!",
    ],
  };

  // ============================================================
  // Hindi (हिन्दी)
  // ============================================================
  const hi = {
    greetingNew: [
      n => `नमस्ते ${n}! मैं हूँ Mr. Pip. आज हम साथ में आवाज़ें सीखेंगे।`,
      n => `हैलो ${n}! मेरा नाम Mr. Pip है। चलो phonics खेलते हैं!`,
      n => `Welcome, ${n}! मैं उल्लू Mr. Pip हूँ। तैयार हो?`,
    ],
    greetingReturning: [
      n => `वापस आ गए ${n}! फिर से मिलकर खुशी हुई।`,
      n => `नमस्ते ${n}! और सुनने के लिए तैयार हो?`,
      n => `${n}! तुम लौट आए। चलो और सीखें!`,
    ],
    tutorialIntro: [
      n => `पहले मैं तुम्हें phonics दिखाता हूँ, ${n}। यह बहुत मज़ेदार है!`,
      n => `थोड़ा सा सीखते हैं, ${n}। डरो मत, मज़ा आएगा।`,
    ],
    tutorialEnd: [
      n => `तुम तैयार हो, ${n}! एक खेल चुनो।`,
      n => `बहुत बढ़िया सुना, ${n}! अब खेल चुनते हैं।`,
    ],
    hubGreet: [
      n => `क्या खेलें पहले, ${n}?`,
      n => `एक lesson चुनो, ${n}!`,
      n => `तुम्हारे stickers बहुत प्यारे हैं, ${n}। एक और कमाते हैं!`,
    ],
    gameIntro: {
      soundmatch: [
        n => `Sound Match! मैं एक शब्द बोलूंगा, ${n}। जो letter उससे शुरू होता है, उसे slot में रखो!`,
        n => `पहली आवाज़ सुनो, ${n}, और सही letter को box में खींचो।`,
      ],
      wordbuilder: [
        n => `Word Builder! तस्वीर देखो, ${n}, और letters को सही जगह पर रखो।`,
        n => `अब शब्द बनाते हैं, ${n}! हर letter को उसकी जगह पर खींचो।`,
      ],
      digraph: [
        (n, t) => `Digraph Hunt! ${t} वाले सारे शब्द basket में डालो, ${n}!`,
        (n, t) => `${t} वाले शब्द ढूंढो, ${n}। यह दो letters मिलकर एक आवाज़ बनाते हैं!`,
      ],
      vowel: [
        n => `Vowel Sort! शब्द को सही bucket में खींचो, ${n}।`,
        n => `ध्यान से सुनो, ${n}। vowel छोटा है या लंबा? सही basket में डालो!`,
      ],
    },
    cheers: [
      n => `बहुत बढ़िया, ${n}!`, n => `सही है!`,           n => `वाह, ${n}!`,
      n => `तुमने कर दिया!`,    n => `ज़बरदस्त, ${n}!`,    n => `बहुत अच्छा!`,
      n => `शाबाश!`,           n => `बिल्कुल सही, ${n}!`,  n => `कमाल है!`,
      n => `हुर्रे!`,
    ],
    encourage: [
      n => `लगभग, ${n}! फिर से सुनो।`,
      n => `अच्छी कोशिश। एक बार और।`,
      n => `अरे, मैं मदद करता हूँ।`,
      n => `करीब! ध्यान से सुनो।`,
      n => `कोशिश अच्छी थी, ${n}। फिर सुनो।`,
    ],
    correct: {
      soundmatch: (picked, target) => {
        const pw = letterWords[picked] || picked;
        const tw = letterWords[target] || target;
        return `यह तो ${picked.toUpperCase()} है, ${pw} का। हमें चाहिए ${tw} — सुनो, ${tw} शुरू होता है ${target.toUpperCase()} से!`;
      },
      wordbuilder: (target) =>
        `शब्द है ${target}। धीरे से बोलो: ${target}। फिर से कोशिश करो!`,
      digraph: (word, target, example) =>
        `${word} में ${target.toUpperCase()} नहीं है। हमें ${target} वाले शब्द चाहिए, जैसे ${example}!`,
      vowel: (word, actualLen) => {
        const lenWord = actualLen === 'short' ? 'छोटा' : 'लंबा';
        const why = actualLen === 'long' ? 'अपना नाम कहता है' : 'जल्दी आवाज़ है';
        return `${word} में ${lenWord} vowel है — ${why}। ${lenWord} वाली bucket में डालो!`;
      },
    },
    summary: {
      perfect: (n, total) => `वाह ${n}, सब सही! ${total} में से ${total}! तुम तो star हो।`,
      good:    (n, score) => `बहुत अच्छा, ${n}! तुमने ${score} stars कमाए। शाबाश!`,
      ok:      (n, score) => `अच्छी कोशिश, ${n}! तुमने ${score} पाए। और अभ्यास करो!`,
    },
    tutorialNarration: [
      "Letters आवाज़ के दोस्त हैं! एक letter पर tap करके सुनो।",
      "Sounds मिलकर शब्द बनाते हैं। Tap करके सुनो!",
      "दो letters मिलकर एक आवाज़ बना सकते हैं। इन दोस्तों को सुनो!",
      "छोटे vowels जल्दी होते हैं। लंबे vowels अपना नाम कहते हैं!",
      "तुम तैयार हो! एक खेल चुनो, चलो खेलें!",
    ],
    tutorialHear: [
      "Letters आवाज़ के दोस्त हैं! हर letter की अपनी आवाज़ है। एक letter पर tap करके सुनो।",
      "Cat. Cat. यह शब्द तीन ध्वनियों से बना है: c — a — t. मिलकर: cat।",
      "Letter दोस्त! Ship. Chip. Thumb.",
      "छोटे vowels जल्दी होते हैं। Cat. Pig. लंबे vowels अपना नाम कहते हैं। Cake. Kite.",
      "तुम तैयार हो! एक खेल चुनो, चलो खेलें!",
    ],
  };

  // ============================================================
  // Tamil (தமிழ்)
  // ============================================================
  const ta = {
    greetingNew: [
      n => `வணக்கம் ${n}! நான்தான் Mr. Pip. இன்று நாம் ஒலிகளைக் கற்போம்.`,
      n => `Hello ${n}! என் பெயர் Mr. Pip. phonics விளையாடலாமா?`,
      n => `Welcome, ${n}! நான் ஆந்தை Mr. Pip. தயாரா?`,
    ],
    greetingReturning: [
      n => `மீண்டும் வரவேற்கிறேன், ${n}!`,
      n => `Hi ${n}! மேலும் ஒலிகளைக் கற்க தயாரா?`,
      n => `${n}! நீ திரும்பி வந்தாய். மேலும் கற்போம்!`,
    ],
    tutorialIntro: [
      n => `முதலில் phonics எப்படி வேலை செய்கிறது என்று காட்டுகிறேன், ${n}.`,
      n => `சிறு பாடம் ஒன்று, ${n}. பயப்பட வேண்டாம், மிக சந்தோஷம்!`,
    ],
    tutorialEnd: [
      n => `${n}, நீ தயார்! ஒரு விளையாட்டைத் தேர்ந்தெடு.`,
      n => `நன்றாகக் கேட்டாய், ${n}! இப்போது விளையாட்டு தேர்வு செய்.`,
    ],
    hubGreet: [
      n => `எதை விளையாடலாம், ${n}?`,
      n => `ஒரு lesson தேர்ந்தெடு, ${n}!`,
      n => `உனது stickers அழகாக உள்ளன, ${n}. இன்னொரு கிடைக்கும்!`,
    ],
    gameIntro: {
      soundmatch: [
        n => `Sound Match! நான் ஒரு வார்த்தை சொல்வேன், ${n}. அது தொடங்கும் letter-ஐ slot-இல் இடு!`,
        n => `முதல் ஒலியைக் கேள், ${n}, சரியான letter-ஐ box-இல் இடு.`,
      ],
      wordbuilder: [
        n => `Word Builder! படம் பார், ${n}, letters-ஐ சரியான இடங்களில் இடு.`,
        n => `வார்த்தைகள் கட்டலாம், ${n}! ஒவ்வொரு letter-ஐ சரியான இடத்தில் வை.`,
      ],
      digraph: [
        (n, t) => `Digraph Hunt! ${t} உள்ள வார்த்தைகளை basket-இல் இடு, ${n}!`,
        (n, t) => `${t} உள்ள வார்த்தைகளைக் கண்டுபிடி, ${n}. இரு letters சேர்ந்து ஒரே ஒலி!`,
      ],
      vowel: [
        n => `Vowel Sort! வார்த்தையை சரியான bucket-இல் இடு, ${n}.`,
        n => `கவனமாகக் கேள், ${n}. vowel குறுகியதா நீளமா? சரியான basket-இல் இடு!`,
      ],
    },
    cheers: [
      n => `அருமை, ${n}!`,    n => `சரி!`,            n => `வாவ், ${n}!`,
      n => `நீ செய்தாய்!`,     n => `சூப்பர், ${n}!`,    n => `மிக நன்று!`,
      n => `பலே!`,           n => `சரியாகச் சொன்னாய், ${n}!`, n => `கலக்கல்!`,
      n => `ஹுர்ரே!`,
    ],
    encourage: [
      n => `கிட்ட வந்தது, ${n}! மீண்டும் கேள்.`,
      n => `நல்ல முயற்சி. இன்னொரு முறை.`,
      n => `சரி, நான் உதவுகிறேன்.`,
      n => `கிட்ட! கவனமாகக் கேள்.`,
      n => `நன்றாக முயற்சி செய்தாய், ${n}.`,
    ],
    correct: {
      soundmatch: (picked, target) => {
        const pw = letterWords[picked] || picked;
        const tw = letterWords[target] || target;
        return `அது ${picked.toUpperCase()}, ${pw}-க்கு. நமக்கு வேண்டியது ${tw} — கேள், ${tw} தொடங்குவது ${target.toUpperCase()}-இல்!`;
      },
      wordbuilder: (target) =>
        `வார்த்தை ${target}. மெதுவாக சொல்: ${target}. மீண்டும் முயற்சி செய்!`,
      digraph: (word, target, example) =>
        `${word}-இல் ${target.toUpperCase()} இல்லை. நமக்கு ${target} ஒலி உள்ள வார்த்தைகள் வேண்டும், ${example} போல!`,
      vowel: (word, actualLen) => {
        const lenWord = actualLen === 'short' ? 'குறுகிய' : 'நீள';
        const why = actualLen === 'long' ? 'தனது பெயரைச் சொல்கிறது' : 'குறுகிய ஒலி';
        return `${word}-இல் ${lenWord} vowel உள்ளது — ${why}. ${lenWord} bucket-இல் இடு!`;
      },
    },
    summary: {
      perfect: (n, total) => `வாவ் ${n}, அருமை! ${total}-இல் ${total}! நீ ஒரு star!`,
      good:    (n, score) => `சிறப்பு, ${n}! நீ ${score} stars பெற்றாய். தொடர்!`,
      ok:      (n, score) => `நல்ல முயற்சி, ${n}! ${score} கிடைத்தது. பயிற்சி தொடர்!`,
    },
    tutorialNarration: [
      "Letters ஒலியின் நண்பர்கள்! ஒரு letter-ஐ tap செய்து கேள்.",
      "ஒலிகள் சேர்ந்து வார்த்தைகள் ஆகும். Tap செய்து கேள்!",
      "இரு letters சேர்ந்து ஒரே ஒலி உருவாக்கும். கேள்!",
      "குறுகிய vowels வேகம், நீள vowels தனது பெயரைச் சொல்லும்!",
      "நீ தயார்! ஒரு விளையாட்டைத் தேர்ந்தெடு!",
    ],
    tutorialHear: [
      "Letters ஒலி நண்பர்கள்! ஒவ்வொரு letter-க்கும் சொந்த ஒலி உள்ளது. tap செய்து கேள்.",
      "Cat. Cat. இந்த வார்த்தை மூன்று ஒலிகள் சேர்ந்தது: c — a — t. ஒன்றாக: cat.",
      "Letter நண்பர்கள்! Ship. Chip. Thumb.",
      "குறுகிய vowels வேகம். Cat. Pig. நீள vowels தனது பெயரைச் சொல்லும். Cake. Kite.",
      "நீ தயார்! ஒரு விளையாட்டைத் தேர்ந்தெடு, விளையாடலாம்!",
    ],
  };

  // ============================================================
  // Telugu (తెలుగు)
  // ============================================================
  const te = {
    greetingNew: [
      n => `హాయ్ ${n}! నేనే Mr. Pip. ఈరోజు మనం శబ్దాలు నేర్చుకుందాం.`,
      n => `Hello ${n}! నా పేరు Mr. Pip. phonics ఆడదామా?`,
      n => `Welcome, ${n}! నేను గుడ్లగూబ Mr. Pip. సిద్ధమా?`,
    ],
    greetingReturning: [
      n => `మళ్ళీ స్వాగతం, ${n}!`,
      n => `Hi ${n}! ఇంకా శబ్దాలు నేర్చుకోవడానికి సిద్ధమా?`,
      n => `${n}! నీవు తిరిగొచ్చావు. ఇంకా నేర్చుకుందాం!`,
    ],
    tutorialIntro: [
      n => `ముందుగా phonics ఎలా పనిచేస్తుందో చూపిస్తాను, ${n}.`,
      n => `చిన్న పాఠం, ${n}. భయపడకు, చాలా బాగుంటుంది!`,
    ],
    tutorialEnd: [
      n => `నీవు సిద్ధం, ${n}! ఒక ఆట ఎంచుకో.`,
      n => `బాగా విన్నావు, ${n}! ఇప్పుడు ఆట ఎంచుకుందాం.`,
    ],
    hubGreet: [
      n => `ఏ ఆట ఆడదాం, ${n}?`,
      n => `ఒక lesson ఎంచుకో, ${n}!`,
      n => `నీ stickers అందంగా ఉన్నాయి, ${n}. ఇంకొకటి పొందుదాం!`,
    ],
    gameIntro: {
      soundmatch: [
        n => `Sound Match! నేను ఒక పదం చెబుతాను, ${n}. ఆ పదం మొదలయ్యే letter-ని slot-లో పెట్టు!`,
        n => `మొదటి శబ్దాన్ని విను, ${n}, సరైన letter-ని box-లోకి లాగు.`,
      ],
      wordbuilder: [
        n => `Word Builder! చిత్రం చూడు, ${n}, letters-ని సరైన చోట్లలో పెట్టు.`,
        n => `పదాలు తయారు చేద్దాం, ${n}! ప్రతి letter-ని దాని స్థానంలో ఉంచు.`,
      ],
      digraph: [
        (n, t) => `Digraph Hunt! ${t} ఉన్న పదాలను basket-లో వేయి, ${n}!`,
        (n, t) => `${t} ఉన్న పదాలను కనుక్కో, ${n}. రెండు letters కలిసి ఒకే శబ్దం!`,
      ],
      vowel: [
        n => `Vowel Sort! పదాన్ని సరైన bucket-లోకి లాగు, ${n}.`,
        n => `శ్రద్ధగా విను, ${n}. vowel పొట్టి లేదా పొడవు? సరైన basket-లో వేయి!`,
      ],
    },
    cheers: [
      n => `భళా, ${n}!`,     n => `సరే!`,            n => `వావ్, ${n}!`,
      n => `నీవు చేశావు!`,    n => `సూపర్, ${n}!`,    n => `చాలా బాగుంది!`,
      n => `శభాష్!`,         n => `సరిగ్గా చెప్పావు, ${n}!`, n => `అద్భుతం!`,
      n => `హుర్రే!`,
    ],
    encourage: [
      n => `దగ్గరికి వచ్చావు, ${n}! మళ్ళీ విను.`,
      n => `మంచి ప్రయత్నం. మరోసారి.`,
      n => `సరే, నేను సాయం చేస్తాను.`,
      n => `దగ్గరగా! శ్రద్ధగా విను.`,
      n => `మంచి ప్రయత్నం, ${n}.`,
    ],
    correct: {
      soundmatch: (picked, target) => {
        const pw = letterWords[picked] || picked;
        const tw = letterWords[target] || target;
        return `అది ${picked.toUpperCase()}, ${pw} కోసం. మనకు ${tw} కావాలి — విను, ${tw} మొదలవుతుంది ${target.toUpperCase()} తో!`;
      },
      wordbuilder: (target) =>
        `పదం ${target}. నెమ్మదిగా చెప్పు: ${target}. మళ్ళీ ప్రయత్నించు!`,
      digraph: (word, target, example) =>
        `${word}-లో ${target.toUpperCase()} లేదు. మనకు ${target} శబ్దం ఉన్న పదాలు కావాలి, ${example} లాంటివి!`,
      vowel: (word, actualLen) => {
        const lenWord = actualLen === 'short' ? 'పొట్టి' : 'పొడవు';
        const why = actualLen === 'long' ? 'తన పేరు చెబుతుంది' : 'వేగమైన శబ్దం';
        return `${word}-లో ${lenWord} vowel ఉంది — ${why}. ${lenWord} bucket-లో వేయి!`;
      },
    },
    summary: {
      perfect: (n, total) => `వావ్ ${n}, పర్ఫెక్ట్! ${total}-కి ${total}! నీవే star!`,
      good:    (n, score) => `చాలా బాగుంది, ${n}! ${score} stars సాధించావు. కొనసాగించు!`,
      ok:      (n, score) => `మంచి ప్రయత్నం, ${n}! ${score} వచ్చాయి. ఇంకా సాధన చేయి!`,
    },
    tutorialNarration: [
      "Letters శబ్దం యొక్క మిత్రులు! ఒక letter-ని tap చేసి విను.",
      "శబ్దాలు కలిసి పదాలవుతాయి. Tap చేసి విను!",
      "రెండు letters కలిసి ఒకే శబ్దం చేయగలవు. విను!",
      "పొట్టి vowels వేగం. పొడవు vowels తమ పేరు చెబుతాయి!",
      "నీవు సిద్ధం! ఒక ఆట ఎంచుకో!",
    ],
    tutorialHear: [
      "Letters శబ్దం మిత్రులు! ప్రతి letter కు దాని శబ్దం ఉంది. Tap చేసి విను.",
      "Cat. Cat. ఈ పదం మూడు శబ్దాల కలయిక: c — a — t. కలిసి: cat.",
      "Letter మిత్రులు! Ship. Chip. Thumb.",
      "పొట్టి vowels వేగం. Cat. Pig. పొడవు vowels తమ పేరు చెబుతాయి. Cake. Kite.",
      "నీవు సిద్ధం! ఒక ఆట ఎంచుకో, ఆడుదాం!",
    ],
  };

  // ============================================================
  // Kannada (ಕನ್ನಡ)
  // ============================================================
  const kn = {
    greetingNew: [
      n => `ಹಲೋ ${n}! ನಾನು Mr. Pip. ಇಂದು ನಾವು ಶಬ್ದಗಳನ್ನು ಕಲಿಯೋಣ.`,
      n => `Hello ${n}! ನನ್ನ ಹೆಸರು Mr. Pip. phonics ಆಡೋಣವೇ?`,
      n => `Welcome, ${n}! ನಾನು ಗೂಬೆ Mr. Pip. ಸಿದ್ಧವೇ?`,
    ],
    greetingReturning: [
      n => `ಮತ್ತೆ ಸ್ವಾಗತ, ${n}!`,
      n => `Hi ${n}! ಇನ್ನಷ್ಟು ಶಬ್ದ ಕಲಿಯಲು ಸಿದ್ಧವೇ?`,
      n => `${n}! ನೀನು ಮರಳಿ ಬಂದಿದ್ದೀಯ. ಮತ್ತಷ್ಟು ಕಲಿಯೋಣ!`,
    ],
    tutorialIntro: [
      n => `ಮೊದಲು phonics ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತೆ ತೋರಿಸ್ತೀನಿ, ${n}.`,
      n => `ಸಣ್ಣ ಪಾಠ, ${n}. ಭಯವೇಡ, ಮಜವಾಗಿರುತ್ತೆ!`,
    ],
    tutorialEnd: [
      n => `ನೀನು ಸಿದ್ಧ, ${n}! ಒಂದು ಆಟ ಆಯ್ಕೆಮಾಡು.`,
      n => `ಚೆನ್ನಾಗಿ ಕೇಳಿದೆ, ${n}! ಈಗ ಆಟ ಆಯ್ಕೆಮಾಡೋಣ.`,
    ],
    hubGreet: [
      n => `ಯಾವ ಆಟ ಮೊದಲು, ${n}?`,
      n => `ಒಂದು lesson ಆಯ್ಕೆಮಾಡು, ${n}!`,
      n => `ನಿನ್ನ stickers ಚೆನ್ನಾಗಿವೆ, ${n}. ಇನ್ನೊಂದು ಗೆಲ್ಲೋಣ!`,
    ],
    gameIntro: {
      soundmatch: [
        n => `Sound Match! ನಾನು ಒಂದು ಪದ ಹೇಳ್ತೀನಿ, ${n}. ಅದು ಪ್ರಾರಂಭವಾಗುವ letter ಅನ್ನು slot-ನಲ್ಲಿ ಇಡು!`,
        n => `ಮೊದಲ ಶಬ್ದ ಕೇಳು, ${n}, ಸರಿಯಾದ letter ಅನ್ನು box-ಗೆ ಎಳೆ.`,
      ],
      wordbuilder: [
        n => `Word Builder! ಚಿತ್ರ ನೋಡು, ${n}, letters ಅನ್ನು ಸರಿಯಾದ ಸ್ಥಳಗಳಲ್ಲಿ ಇಡು.`,
        n => `ಪದಗಳನ್ನು ಮಾಡೋಣ, ${n}! ಪ್ರತಿ letter ಅನ್ನು ಅದರ ಸ್ಥಳದಲ್ಲಿ ಇಡು.`,
      ],
      digraph: [
        (n, t) => `Digraph Hunt! ${t} ಇರೋ ಪದಗಳನ್ನು basket-ಗೆ ಎಳೆ, ${n}!`,
        (n, t) => `${t} ಇರೋ ಪದಗಳನ್ನು ಹುಡುಕು, ${n}. ಎರಡು letters ಸೇರಿ ಒಂದೇ ಶಬ್ದ!`,
      ],
      vowel: [
        n => `Vowel Sort! ಪದವನ್ನು ಸರಿಯಾದ bucket-ಗೆ ಎಳೆ, ${n}.`,
        n => `ಎಚ್ಚರಿಕೆಯಿಂದ ಕೇಳು, ${n}. vowel ಚಿಕ್ಕದಾ ಉದ್ದನಾ? ಸರಿಯಾದ basket-ಗೆ ಇಡು!`,
      ],
    },
    cheers: [
      n => `ಭಲೆ, ${n}!`,    n => `ಸರಿ!`,            n => `ವಾವ್, ${n}!`,
      n => `ನೀನು ಮಾಡಿದೆ!`,  n => `ಸೂಪರ್, ${n}!`,    n => `ಬಹಳ ಚೆನ್ನಾಗಿದೆ!`,
      n => `ಶಭಾಷ್!`,        n => `ಸರಿಯಾಗಿ ಹೇಳಿದೆ, ${n}!`, n => `ಅದ್ಭುತ!`,
      n => `ಹುರ್ರೇ!`,
    ],
    encourage: [
      n => `ಹತ್ತಿರಕ್ಕೆ ಬಂದೆ, ${n}! ಮತ್ತೆ ಕೇಳು.`,
      n => `ಒಳ್ಳೆಯ ಪ್ರಯತ್ನ. ಇನ್ನೊಮ್ಮೆ.`,
      n => `ಆಯ್ತು, ನಾನು ಸಹಾಯ ಮಾಡ್ತೀನಿ.`,
      n => `ಹತ್ತಿರ! ಎಚ್ಚರಿಕೆಯಿಂದ ಕೇಳು.`,
      n => `ಚೆನ್ನಾಗಿ ಪ್ರಯತ್ನಿಸಿದೆ, ${n}.`,
    ],
    correct: {
      soundmatch: (picked, target) => {
        const pw = letterWords[picked] || picked;
        const tw = letterWords[target] || target;
        return `ಅದು ${picked.toUpperCase()}, ${pw} ಗೆ. ನಮಗೆ ${tw} ಬೇಕು — ಕೇಳು, ${tw} ${target.toUpperCase()} ನಿಂದ ಪ್ರಾರಂಭವಾಗುತ್ತೆ!`;
      },
      wordbuilder: (target) =>
        `ಪದ ${target}. ನಿಧಾನವಾಗಿ ಹೇಳು: ${target}. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸು!`,
      digraph: (word, target, example) =>
        `${word}-ನಲ್ಲಿ ${target.toUpperCase()} ಇಲ್ಲ. ನಮಗೆ ${target} ಶಬ್ದದ ಪದಗಳು ಬೇಕು, ${example} ಥರ!`,
      vowel: (word, actualLen) => {
        const lenWord = actualLen === 'short' ? 'ಚಿಕ್ಕ' : 'ಉದ್ದ';
        const why = actualLen === 'long' ? 'ತನ್ನ ಹೆಸರನ್ನು ಹೇಳುತ್ತೆ' : 'ವೇಗದ ಶಬ್ದ';
        return `${word}-ನಲ್ಲಿ ${lenWord} vowel ಇದೆ — ${why}. ${lenWord} bucket-ಗೆ ಇಡು!`;
      },
    },
    summary: {
      perfect: (n, total) => `ವಾವ್ ${n}, ಪರ್ಫೆಕ್ಟ್! ${total}-ರಲ್ಲಿ ${total}! ನೀನೇ star!`,
      good:    (n, score) => `ಬಹಳ ಚೆನ್ನಾಗಿದೆ, ${n}! ${score} stars ಗಳಿಸಿದೆ. ಮುಂದುವರಿಸು!`,
      ok:      (n, score) => `ಒಳ್ಳೆಯ ಪ್ರಯತ್ನ, ${n}! ${score} ಸಿಕ್ತು. ಇನ್ನಷ್ಟು ಅಭ್ಯಾಸ ಮಾಡು!`,
    },
    tutorialNarration: [
      "Letters ಶಬ್ದದ ಸ್ನೇಹಿತರು! ಒಂದು letter ಅನ್ನು tap ಮಾಡಿ ಕೇಳು.",
      "ಶಬ್ದಗಳು ಸೇರಿ ಪದಗಳಾಗುತ್ತವೆ. Tap ಮಾಡಿ ಕೇಳು!",
      "ಎರಡು letters ಸೇರಿ ಒಂದೇ ಶಬ್ದ ಮಾಡ್ತಾವೆ. ಕೇಳು!",
      "ಚಿಕ್ಕ vowels ವೇಗ. ಉದ್ದ vowels ತಮ್ಮ ಹೆಸರು ಹೇಳ್ತಾವೆ!",
      "ನೀನು ಸಿದ್ಧ! ಒಂದು ಆಟ ಆಯ್ಕೆಮಾಡು!",
    ],
    tutorialHear: [
      "Letters ಶಬ್ದದ ಸ್ನೇಹಿತರು! ಪ್ರತಿ letter ಗೆ ತನ್ನದೇ ಶಬ್ದ ಇದೆ. Tap ಮಾಡಿ ಕೇಳು.",
      "Cat. Cat. ಈ ಪದ ಮೂರು ಶಬ್ದಗಳಿಂದ ಆಗಿದೆ: c — a — t. ಸೇರಿ: cat.",
      "Letter ಸ್ನೇಹಿತರು! Ship. Chip. Thumb.",
      "ಚಿಕ್ಕ vowels ವೇಗ. Cat. Pig. ಉದ್ದ vowels ತಮ್ಮ ಹೆಸರು ಹೇಳ್ತಾವೆ. Cake. Kite.",
      "ನೀನು ಸಿದ್ಧ! ಒಂದು ಆಟ ಆಯ್ಕೆಮಾಡು, ಆಡೋಣ!",
    ],
  };

  // ============================================================
  // Bundle + language API
  // ============================================================
  const bundles = { en, hi, ta, te, kn };

  let currentLang = storeGet('phonics-language', 'en');
  if (!bundles[currentLang]) currentLang = 'en';

  function getLang() { return currentLang; }
  function getLangMeta() { return LANGS[currentLang]; }
  function setLang(lang) {
    if (bundles[lang]) {
      currentLang = lang;
      storeSet('phonics-language', lang);
    }
  }
  function getDialogue() {
    return bundles[currentLang] || bundles.en;
  }
  function tutorialNarration(idx) {
    const arr = getDialogue().tutorialNarration || en.tutorialNarration;
    return arr[idx] || en.tutorialNarration[idx] || '';
  }
  function tutorialHear(idx) {
    const arr = getDialogue().tutorialHear || en.tutorialHear;
    return arr[idx] || en.tutorialHear[idx] || '';
  }

  PP.data = {
    letterWords,
    letterIntro,
    soundPrompt,
    soundMatchPool,
    wordBuilderWords,
    digraphRounds,
    vowelWords,
    stickerCatalog,
    LANGS,
    bundles,
    getLang,
    getLangMeta,
    setLang,
    getDialogue,
    tutorialNarration,
    tutorialHear,
    // Backwards-compat: expose `dialogue` as a getter-like function returning current
    get dialogue() { return getDialogue(); },
  };
})();
