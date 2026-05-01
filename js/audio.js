/* ============================================================
   PHONICS PALS — audio.js
   Web Audio sound effects + Speech Synthesis (Mr. Pip's voice)
   Attaches PP.audio (sfx + speak helpers) and PP.voices (picker)
   ============================================================ */
(function () {
  'use strict';
  const { storeGet, storeSet } = PP.utils;

  /* -------- Web Audio (sfx) -------- */
  let audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { return null; }
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }
  function tone(freq, dur = 0.18, type = 'sine', vol = 0.18, when = 0) {
    const ctx = ensureAudio(); if (!ctx) return;
    const t0 = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  }
  function chord(freqs, gap = 0.06, dur = 0.22) {
    freqs.forEach((f, i) => tone(f, dur, 'triangle', 0.16, i * gap));
  }
  const sfx = {
    correct: () => chord([523.25, 659.25, 783.99, 1046.5], 0.07, 0.28),
    wrong:   () => { tone(220, 0.15, 'sawtooth', 0.10); tone(160, 0.20, 'sawtooth', 0.10, 0.10); },
    tap:     () => tone(880, 0.05, 'sine', 0.10),
    pop:     () => tone(660, 0.08, 'triangle', 0.12),
    whoosh:  () => { tone(400, 0.1, 'sine', 0.06); tone(700, 0.12, 'sine', 0.06, 0.05); },
    fanfare: () => chord([392, 523, 659, 784, 1046], 0.08, 0.4),
  };

  /* -------- Speech Synthesis -------- */
  let englishVoices = [];
  let chosenVoiceName = storeGet('phonics-voice', null);
  const onVoicesChangedCallbacks = [];

  function refreshVoices() {
    if (!window.speechSynthesis) return;
    const all = speechSynthesis.getVoices() || [];
    englishVoices = all.filter(v => /^en[-_]?/i.test(v.lang));
    const score = v => {
      let s = 0;
      if (/Natural|Neural|Online|Premium|Enhanced|Studio|Wavenet/i.test(v.name)) s += 100;
      if (/Google/i.test(v.name)) s += 60;
      if (/Microsoft/i.test(v.name) && /Online/i.test(v.name)) s += 80;
      if (/Samantha|Karen|Moira|Tessa|Allison|Ava|Susan|Joanna/i.test(v.name)) s += 50;
      if (/Aria|Jenny|Guy|Sara|Davis|Emma|Brian/i.test(v.name)) s += 40;
      if (/^en-US/i.test(v.lang)) s += 20;
      else if (/^en-GB/i.test(v.lang)) s += 15;
      else if (/^en-AU/i.test(v.lang)) s += 10;
      if (/female/i.test(v.name)) s += 5;
      return s;
    };
    englishVoices.sort((a, b) => score(b) - score(a));
    if (chosenVoiceName && !englishVoices.find(v => v.name === chosenVoiceName)) {
      // Saved voice missing — fall back
      chosenVoiceName = null;
    }
    if (!chosenVoiceName && englishVoices[0]) chosenVoiceName = englishVoices[0].name;
    onVoicesChangedCallbacks.forEach(cb => { try { cb(); } catch (e) {} });
  }
  if (window.speechSynthesis) {
    speechSynthesis.onvoiceschanged = refreshVoices;
    refreshVoices();
  }

  function pickVoice() {
    if (!englishVoices.length) refreshVoices();
    if (chosenVoiceName) {
      const m = englishVoices.find(v => v.name === chosenVoiceName);
      if (m) return m;
    }
    return englishVoices[0] || null;
  }
  function isPremium(v) {
    return /Natural|Neural|Online|Premium|Enhanced|Studio|Wavenet|Google|Microsoft.*Online/i.test(v.name);
  }
  function setVoice(name) {
    chosenVoiceName = name;
    storeSet('phonics-voice', name);
  }
  function getChosenName() { return chosenVoiceName; }
  function getEnglishVoices() { return englishVoices; }
  function onVoicesChanged(cb) { onVoicesChangedCallbacks.push(cb); }

  // Track whether speech is in flight, so we can offer "stop" if needed
  let speakingNow = false;

  function speak(text, opts = {}) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate   = opts.rate   ?? 0.88;
    u.pitch  = opts.pitch  ?? 1.05;
    u.volume = opts.volume ?? 1;
    const voice = pickVoice();
    if (voice) { u.voice = voice; u.lang = voice.lang; }
    else u.lang = 'en-US';
    u.onstart = () => { speakingNow = true; if (opts.onstart) opts.onstart(); };
    u.onend = () => { speakingNow = false; if (opts.onend) opts.onend(); };
    u.onerror = () => { speakingNow = false; };
    speechSynthesis.speak(u);
  }
  function stop() {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    speakingNow = false;
  }

  // Warm up speech on first interaction (some browsers gate it)
  window.addEventListener('pointerdown', function warm() {
    ensureAudio();
    if ('speechSynthesis' in window) {
      try {
        const u = new SpeechSynthesisUtterance(' ');
        u.volume = 0;
        speechSynthesis.speak(u);
        setTimeout(() => speechSynthesis.cancel(), 50);
      } catch (e) {}
    }
    window.removeEventListener('pointerdown', warm);
  }, { once: true });

  PP.audio = { sfx, ensureAudio };
  PP.speech = { speak, stop, isSpeaking: () => speakingNow };
  PP.voices = {
    refresh: refreshVoices,
    list: getEnglishVoices,
    chosen: getChosenName,
    set: setVoice,
    isPremium,
    onChange: onVoicesChanged,
  };
})();
