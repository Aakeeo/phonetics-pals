/* ============================================================
   PHONICS PALS — audio.js
   Web Audio sfx + Speech routing (ElevenLabs OR browser TTS).
   Mr. Pip can speak in 5 languages with code-switched English
   nouns, via ElevenLabs eleven_multilingual_v2.
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

  /* ============================================================
     Browser Speech Synthesis (fallback)
     ============================================================ */
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
      chosenVoiceName = null;
    }
    if (!chosenVoiceName && englishVoices[0]) chosenVoiceName = englishVoices[0].name;
    onVoicesChangedCallbacks.forEach(cb => { try { cb(); } catch (e) {} });
  }
  if (window.speechSynthesis) {
    speechSynthesis.onvoiceschanged = refreshVoices;
    refreshVoices();
  }

  function pickEnglishVoice() {
    if (!englishVoices.length) refreshVoices();
    if (chosenVoiceName) {
      const m = englishVoices.find(v => v.name === chosenVoiceName);
      if (m) return m;
    }
    return englishVoices[0] || null;
  }
  function pickVoiceForLang(langCode) {
    if (!('speechSynthesis' in window)) return null;
    const all = speechSynthesis.getVoices() || [];
    if (langCode === 'en') return pickEnglishVoice();
    const meta = PP.data.LANGS[langCode];
    if (!meta) return pickEnglishVoice();
    // Match locale exactly, else by language prefix
    return all.find(v => v.lang.replace('_', '-').toLowerCase() === meta.ttsLang.toLowerCase())
        || all.find(v => v.lang.toLowerCase().startsWith(langCode + '-')
                       || v.lang.toLowerCase().startsWith(langCode + '_')
                       || v.lang.toLowerCase() === langCode)
        || pickEnglishVoice();
  }
  function isPremium(v) {
    return /Natural|Neural|Online|Premium|Enhanced|Studio|Wavenet|Google|Microsoft.*Online/i.test(v.name);
  }
  function setEnglishVoice(name) {
    chosenVoiceName = name;
    storeSet('phonics-voice', name);
  }
  function getChosenName() { return chosenVoiceName; }
  function getEnglishVoices() { return englishVoices; }
  function onVoicesChanged(cb) { onVoicesChangedCallbacks.push(cb); }

  let speakingNow = false;

  function speakBrowser(text, opts = {}) {
    if (!('speechSynthesis' in window)) return false;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate   = opts.rate   ?? 0.88;
    u.pitch  = opts.pitch  ?? 1.05;
    u.volume = opts.volume ?? 1;
    const lang = PP.data.getLang();
    const voice = pickVoiceForLang(lang);
    if (voice) { u.voice = voice; u.lang = voice.lang; }
    else { u.lang = (PP.data.getLangMeta() || {}).ttsLang || 'en-US'; }
    u.onstart = () => { speakingNow = true; opts.onstart && opts.onstart(); };
    u.onend   = () => { speakingNow = false; opts.onend && opts.onend(); };
    u.onerror = () => { speakingNow = false; };
    speechSynthesis.speak(u);
    return true;
  }

  /* ============================================================
     ElevenLabs adapter (BYO key)
     ============================================================ */
  const EL = {
    apiBase: 'https://api.elevenlabs.io',
    enabled: storeGet('phonics-el-enabled', false),
    key:     storeGet('phonics-el-key', ''),
    voiceId: storeGet('phonics-el-voice', ''),
    voiceName: storeGet('phonics-el-voice-name', ''),
    model: 'eleven_multilingual_v2',
  };
  const audioCache = new Map(); // (voiceId|text) -> Promise<blobUrl>
  let currentEl = null;

  function elState() {
    return { ...EL };
  }
  function elSetKey(k) {
    EL.key = (k || '').trim();
    storeSet('phonics-el-key', EL.key);
    if (!EL.key) {
      EL.enabled = false;
      storeSet('phonics-el-enabled', false);
    }
  }
  function elSetEnabled(b) {
    EL.enabled = !!b;
    storeSet('phonics-el-enabled', EL.enabled);
  }
  function elSetVoice(id, name) {
    EL.voiceId = id || '';
    EL.voiceName = name || '';
    storeSet('phonics-el-voice', EL.voiceId);
    storeSet('phonics-el-voice-name', EL.voiceName);
  }
  function elIsReady() {
    return !!(EL.enabled && EL.key && EL.voiceId);
  }

  async function elFetchVoices() {
    if (!EL.key) throw new Error('No API key set');
    const r = await fetch(EL.apiBase + '/v1/voices', {
      headers: { 'xi-api-key': EL.key, accept: 'application/json' },
    });
    if (!r.ok) {
      const msg = r.status === 401 ? 'Invalid API key' : `ElevenLabs ${r.status}`;
      throw new Error(msg);
    }
    const data = await r.json();
    return (data.voices || []).map(v => ({
      voice_id: v.voice_id,
      name: v.name,
      preview: v.preview_url,
      labels: v.labels || {},
      category: v.category,
    }));
  }

  async function elTextToSpeech(text) {
    const cacheKey = EL.voiceId + '|' + text;
    if (audioCache.has(cacheKey)) return audioCache.get(cacheKey);
    const promise = (async () => {
      const r = await fetch(EL.apiBase + '/v1/text-to-speech/' + encodeURIComponent(EL.voiceId), {
        method: 'POST',
        headers: {
          'xi-api-key': EL.key,
          'Content-Type': 'application/json',
          'accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: EL.model,
          voice_settings: {
            stability: 0.55,
            similarity_boost: 0.85,
            style: 0.20,
            use_speaker_boost: true,
          },
        }),
      });
      if (!r.ok) throw new Error('ElevenLabs TTS ' + r.status);
      const blob = await r.blob();
      return URL.createObjectURL(blob);
    })();
    audioCache.set(cacheKey, promise);
    promise.catch(() => audioCache.delete(cacheKey));
    return promise;
  }

  function elStop() {
    if (currentEl) {
      try { currentEl.pause(); currentEl.currentTime = 0; } catch (e) {}
      currentEl = null;
    }
  }

  async function speakElevenLabs(text, opts = {}) {
    if (!elIsReady()) return false;
    elStop();
    try {
      const url = await elTextToSpeech(text);
      const a = new Audio(url);
      currentEl = a;
      a.playbackRate = opts.rate ?? 1.0;
      a.onplay  = () => { speakingNow = true; opts.onstart && opts.onstart(); };
      a.onended = () => { speakingNow = false; opts.onend && opts.onend(); currentEl = null; };
      a.onerror = () => { speakingNow = false; currentEl = null; };
      await a.play();
      return true;
    } catch (e) {
      // Fallback to browser TTS
      return false;
    }
  }

  /* ============================================================
     Public speak() — routes to EL if ready, else browser
     ============================================================ */
  function speak(text, opts = {}) {
    if (!text) return;
    // Try ElevenLabs first
    if (elIsReady()) {
      speakElevenLabs(text, opts).then(ok => {
        if (!ok) speakBrowser(text, opts);
      });
      return;
    }
    speakBrowser(text, opts);
  }

  function stop() {
    elStop();
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    speakingNow = false;
  }

  // Warm up audio on first interaction
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
    set: setEnglishVoice,
    isPremium,
    onChange: onVoicesChanged,
  };
  PP.elevenlabs = {
    state: elState,
    setKey: elSetKey,
    setEnabled: elSetEnabled,
    setVoice: elSetVoice,
    isReady: elIsReady,
    fetchVoices: elFetchVoices,
    clearCache: () => audioCache.clear(),
  };
})();
