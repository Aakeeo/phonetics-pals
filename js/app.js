/* ============================================================
   PHONICS PALS — app.js
   App entry point: state, screen routing, voice picker UI,
   wires modules together
   ============================================================ */
(function () {
  'use strict';
  const { $, $$, storeGet, storeSet } = PP.utils;
  const { sfx } = PP.audio;
  const { stickerCatalog } = PP.data;

  // ----- State -----
  const saved = storeGet('phonics-state', null);
  const state = {
    name: (saved && saved.name) || 'friend',
    totalStars: (saved && saved.totalStars) || 0,
    stickers: new Set((saved && saved.stickers) || []),
    perGameStars: (saved && saved.perGameStars) || { soundmatch: 0, wordbuilder: 0, digraph: 0, vowel: 0 },
    isReturning: !!saved,
  };
  PP.state = state;

  function persist() {
    storeSet('phonics-state', {
      name: state.name,
      totalStars: state.totalStars,
      stickers: Array.from(state.stickers),
      perGameStars: state.perGameStars,
    });
  }

  // ----- Screen routing -----
  function showScreen(id) {
    $$('.screen').forEach(s => s.classList.remove('active'));
    const el = $('#screen-' + id);
    if (el) {
      el.classList.add('active');
      el.scrollTop = 0;
      document.body.dataset.screen = id;
    }
  }

  function goToHub() {
    $('#hub-name').textContent = state.name;
    showScreen('hub');
    PP.teacher.setSize('small');
    PP.hub.updateBadges();
    setTimeout(() => PP.teacher.hubLine(), 350);
  }

  // ----- Stars / stickers (called by games) -----
  function awardStar(game) {
    state.totalStars++;
    if (game) state.perGameStars[game] = (state.perGameStars[game] || 0) + 1;
    persist();
    PP.hub.updateBadges();
  }

  function unlockSticker(id) {
    if (state.stickers.has(id)) return null;
    state.stickers.add(id);
    persist();
    PP.hub.renderStickers();
    return Object.values(stickerCatalog).find(s => s.id === id);
  }

  // ----- Voice picker UI (modal) -----
  function isPremium(v) { return PP.voices.isPremium(v); }
  function voiceMeta(v) {
    const lang = v.lang.toUpperCase();
    let region = '';
    if (/en-US/i.test(v.lang)) region = 'US';
    else if (/en-GB/i.test(v.lang)) region = 'UK';
    else if (/en-AU/i.test(v.lang)) region = 'AU';
    else if (/en-IN/i.test(v.lang)) region = 'IN';
    else region = lang;
    return region + (v.localService ? ' • on-device' : ' • online');
  }
  function renderVoiceList() {
    const list = $('#voice-list');
    if (!list) return;
    const voices = PP.voices.list();
    const chosen = PP.voices.chosen();
    list.innerHTML = '';
    if (!voices.length) {
      list.innerHTML = '<div class="voice-tip" style="padding:14px;">No English voices found in this browser.</div>';
      return;
    }
    voices.forEach(v => {
      const row = document.createElement('div');
      row.className = 'voice-row' + (v.name === chosen ? ' active' : '');
      const info = document.createElement('div');
      info.className = 'v-info';
      const name = document.createElement('div');
      name.className = 'v-name';
      name.textContent = v.name;
      if (isPremium(v)) {
        const b = document.createElement('span');
        b.className = 'v-badge';
        b.textContent = '★ warm';
        name.appendChild(b);
      }
      const meta = document.createElement('div');
      meta.className = 'v-meta';
      meta.textContent = voiceMeta(v);
      info.appendChild(name); info.appendChild(meta);
      const test = document.createElement('button');
      test.className = 'v-test';
      test.textContent = '▶';
      test.title = 'Test voice';
      test.addEventListener('click', e => {
        e.stopPropagation();
        // Temporarily speak with this voice without persisting
        const prev = PP.voices.chosen();
        PP.voices.set(v.name);
        sfx.tap();
        PP.speech.speak("Hi! I'm Mr. Pip. Cat. Sun. Apple.");
        PP.voices.set(prev);
      });
      row.appendChild(info);
      row.appendChild(test);
      row.addEventListener('click', () => {
        sfx.pop();
        PP.voices.set(v.name);
        renderVoiceList();
        PP.speech.speak("Voice set! Hello " + state.name + ".");
      });
      list.appendChild(row);
    });

    const tip = $('#voice-tip');
    if (tip) {
      const hasGood = voices.some(isPremium);
      tip.innerHTML = hasGood
        ? 'Voices with the <strong>★ warm</strong> badge usually sound the most natural.'
        : 'These voices come from your operating system. For warmer voices, try opening this in <strong>Chrome</strong> while online.';
    }
  }

  // ----- Language picker -----
  function renderLangGrid() {
    const grid = $('#lang-grid');
    if (!grid) return;
    const current = PP.data.getLang();
    grid.innerHTML = '';
    Object.keys(PP.data.LANGS).forEach(code => {
      const meta = PP.data.LANGS[code];
      const card = document.createElement('button');
      card.className = 'lang-card' + (code === current ? ' active' : '');
      card.dataset.lang = code;
      card.innerHTML = `<div class="lang-native">${meta.native}</div><div class="lang-en">${meta.name}</div>`;
      card.addEventListener('click', () => {
        sfx.pop();
        PP.data.setLang(code);
        renderLangGrid();
        // Greet in the new language
        const greetLine = PP.data.getDialogue().greetingNew[0](state.name);
        PP.teacher.say(greetLine, { mood: 'happy', bubbleMs: 5000 });
      });
      grid.appendChild(card);
    });
  }

  // ----- ElevenLabs UI -----
  function renderEL() {
    const el = PP.elevenlabs.state();
    $('#el-enabled').checked = !!el.enabled;
    $('#el-key').value = el.key || '';
    if (el.key && el.voiceName) {
      // Voice list will be loaded async on demand
    }
    $('#el-voice-row').classList.toggle('hidden', !el.key);
    $('#el-status').textContent = el.enabled && el.key && el.voiceId
      ? `🪄 Using ElevenLabs: ${el.voiceName || el.voiceId.slice(0, 8)}`
      : '';
    $('#el-status').classList.remove('error');
  }
  async function loadELVoices() {
    const status = $('#el-status');
    status.textContent = 'Loading voices…';
    status.classList.remove('error');
    try {
      const voices = await PP.elevenlabs.fetchVoices();
      const sel = $('#el-voice');
      sel.innerHTML = '';
      const cur = PP.elevenlabs.state().voiceId;
      voices.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.voice_id;
        opt.dataset.name = v.name;
        const tags = v.labels && (v.labels.gender || v.labels.accent) ? ` (${[v.labels.gender, v.labels.accent].filter(Boolean).join(', ')})` : '';
        opt.textContent = v.name + tags;
        if (v.voice_id === cur) opt.selected = true;
        sel.appendChild(opt);
      });
      if (!cur && voices[0]) {
        // Auto-select the first voice
        PP.elevenlabs.setVoice(voices[0].voice_id, voices[0].name);
        sel.value = voices[0].voice_id;
      }
      $('#el-voice-row').classList.remove('hidden');
      status.textContent = '✓ ' + voices.length + ' voices loaded';
    } catch (e) {
      status.textContent = '⚠ ' + (e.message || 'Could not load voices');
      status.classList.add('error');
    }
  }

  function init() {
    // Wire teacher init
    PP.teacher.init();

    // Re-render the voice list whenever voices load
    PP.voices.onChange(renderVoiceList);

    // Welcome screen wiring
    const nameInput = $('#name-input');
    if (state.isReturning && state.name && state.name !== 'friend') {
      nameInput.value = state.name;
    }
    nameInput.addEventListener('input', e => {
      state.name = (e.target.value.trim() || 'friend');
    });
    nameInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') $('#start-btn').click();
    });

    $('#start-btn').addEventListener('click', () => {
      sfx.whoosh();
      const v = nameInput.value.trim();
      state.name = v || state.name || 'friend';
      persist();
      $('#hub-name').textContent = state.name;
      // Mr. Pip greets, then we head to tutorial (or hub if returning)
      if (state.isReturning && state.totalStars > 0) {
        // Returning kid — skip to hub
        PP.teacher.greet(true);
        setTimeout(() => goToHub(), 1400);
      } else {
        PP.teacher.greet(false);
        setTimeout(() => PP.tutorial.start(), 2200);
      }
    });

    // Back buttons
    $$('.back-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.tap();
        const target = btn.dataset.back;
        if (target === 'hub') goToHub();
        else if (target === 'welcome') showScreen('welcome');
      });
    });

    // Settings (was Voice picker)
    $('#settings-btn').addEventListener('click', () => {
      sfx.tap();
      PP.voices.refresh();
      renderVoiceList();
      renderLangGrid();
      renderEL();
      // Auto-load EL voices if key already saved
      if (PP.elevenlabs.state().key) loadELVoices();
      $('#voice-modal').classList.add('active');
    });
    $('#voice-close').addEventListener('click', () => {
      sfx.tap();
      $('#voice-modal').classList.remove('active');
    });
    $('#voice-modal').addEventListener('click', e => {
      if (e.target.id === 'voice-modal') $('#voice-modal').classList.remove('active');
    });

    // ElevenLabs controls
    $('#el-enabled').addEventListener('change', e => {
      PP.elevenlabs.setEnabled(e.target.checked);
      renderEL();
    });
    $('#el-key-save').addEventListener('click', async () => {
      sfx.tap();
      const key = $('#el-key').value.trim();
      PP.elevenlabs.setKey(key);
      if (key) {
        // Auto-enable when first key saved
        if (!PP.elevenlabs.state().enabled) PP.elevenlabs.setEnabled(true);
        renderEL();
        await loadELVoices();
      } else {
        PP.elevenlabs.setEnabled(false);
        renderEL();
      }
    });
    $('#el-voice').addEventListener('change', e => {
      const sel = e.target;
      const opt = sel.options[sel.selectedIndex];
      PP.elevenlabs.setVoice(sel.value, opt ? opt.dataset.name : '');
      renderEL();
    });
    $('#el-voice-test').addEventListener('click', () => {
      sfx.tap();
      const greet = PP.data.getDialogue().greetingNew[0](state.name);
      PP.speech.speak(greet);
    });

    // Init child modules
    PP.tutorial.init();
    PP.games.soundmatch.init();
    PP.games.wordbuilder.init();
    PP.games.digraph.init();
    PP.games.vowel.init();
    PP.hub.init();
    PP.results.init();

    // Initial badges + voice list
    PP.hub.updateBadges();
    renderVoiceList();
    document.body.dataset.screen = 'welcome';
  }

  // Expose app API
  PP.app = {
    init,
    showScreen,
    goToHub,
    awardStar,
    unlockSticker,
    state,
    persist,
  };

  // Boot when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
