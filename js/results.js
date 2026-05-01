/* ============================================================
   PHONICS PALS — results.js
   Game completion modal + Canvas certificate + share/download
   ============================================================ */
(function () {
  'use strict';
  const { $, todayString, displayName, nameSlug } = PP.utils;
  const { sfx } = PP.audio;
  const { stickerCatalog } = PP.data;

  let pendingReplay = null;

  // ----- Game completion modal -----
  function show({ title, msg, earned, total, sticker, onReplay }) {
    pendingReplay = onReplay;
    $('#results-title').innerHTML = `${title} <span>${displayName()}</span>!`;
    $('#results-msg').textContent = msg;
    const pct = earned / Math.max(1, total);
    const lit = pct >= 1 ? 3 : pct >= 0.6 ? 2 : pct >= 0.3 ? 1 : 0;
    const ms = $('#results-stars');
    ms.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const s = document.createElement('div');
      s.className = 'ms' + (i >= lit ? ' dim' : '');
      s.textContent = '⭐';
      ms.appendChild(s);
    }
    const stickEl = $('#results-sticker');
    if (sticker) {
      stickEl.classList.remove('hidden');
      $('#results-sticker-emoji').textContent = sticker.emoji;
      $('#results-sticker-name').textContent = sticker.name;
    } else {
      stickEl.classList.add('hidden');
    }
    $('#results-modal').classList.add('active');
    setTimeout(() => { PP.confetti(60); sfx.fanfare(); }, 220);
  }

  function close() {
    $('#results-modal').classList.remove('active');
  }

  // ----- Certificate canvas painting -----
  function drawRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // Tiny owl illustration (Mr. Pip) on the certificate
  function drawPip(ctx, cx, cy, scale = 1) {
    const s = scale;
    ctx.save();
    ctx.translate(cx, cy);
    // body
    ctx.fillStyle = '#88d8a8';
    ctx.strokeStyle = '#2a263d';
    ctx.lineWidth = 5 * s;
    ctx.beginPath(); ctx.ellipse(0, 0, 80*s, 85*s, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    // belly
    ctx.fillStyle = '#fef8ec';
    ctx.beginPath(); ctx.ellipse(0, 20*s, 50*s, 58*s, 0, 0, Math.PI*2); ctx.fill();
    // glasses
    ctx.fillStyle = '#fff';
    ctx.lineWidth = 4 * s;
    ctx.beginPath(); ctx.arc(-28*s, -28*s, 26*s, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc( 28*s, -28*s, 26*s, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-2*s, -28*s); ctx.lineTo(2*s, -28*s); ctx.stroke();
    // happy eyes (curves)
    ctx.lineWidth = 5 * s;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-40*s, -28*s); ctx.quadraticCurveTo(-28*s, -36*s, -16*s, -28*s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(16*s, -28*s); ctx.quadraticCurveTo(28*s, -36*s, 40*s, -28*s); ctx.stroke();
    // beak
    ctx.fillStyle = '#ffc94a';
    ctx.lineWidth = 3 * s;
    ctx.beginPath();
    ctx.moveTo(0, -6*s); ctx.lineTo(-12*s, 12*s); ctx.lineTo(12*s, 12*s); ctx.closePath();
    ctx.fill(); ctx.stroke();
    // bowtie
    ctx.fillStyle = '#ff7e7e';
    ctx.beginPath();
    ctx.moveTo(-15*s, 42*s); ctx.lineTo(-32*s, 34*s); ctx.lineTo(-32*s, 62*s); ctx.lineTo(-15*s, 56*s); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(15*s, 42*s); ctx.lineTo(32*s, 34*s); ctx.lineTo(32*s, 62*s); ctx.lineTo(15*s, 56*s); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ed5a5a';
    ctx.beginPath(); ctx.arc(0, 49*s, 7*s, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  function drawStar(ctx, cx, cy, r, fill = '#ffc94a') {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI / 5) * i - Math.PI / 2;
      const radius = i % 2 === 0 ? r : r * 0.5;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.strokeStyle = '#2a263d';
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function paintCertificate() {
    const cv = $('#cert-canvas');
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;

    // Background — paper cream
    ctx.fillStyle = '#fef8ec';
    ctx.fillRect(0, 0, W, H);

    // Soft tinted glows
    const grad1 = ctx.createRadialGradient(W*0.15, H*0.15, 50, W*0.15, H*0.15, 600);
    grad1.addColorStop(0, 'rgba(255,201,74,0.45)');
    grad1.addColorStop(1, 'rgba(255,201,74,0)');
    ctx.fillStyle = grad1; ctx.fillRect(0, 0, W, H);
    const grad2 = ctx.createRadialGradient(W*0.85, H*0.9, 50, W*0.85, H*0.9, 600);
    grad2.addColorStop(0, 'rgba(93,196,236,0.30)');
    grad2.addColorStop(1, 'rgba(93,196,236,0)');
    ctx.fillStyle = grad2; ctx.fillRect(0, 0, W, H);

    // Polka dots
    ctx.fillStyle = 'rgba(217,200,155,0.5)';
    for (let y = 20; y < H; y += 28) {
      for (let x = 20; x < W; x += 28) {
        ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI*2); ctx.fill();
      }
    }

    // Outer frame (chunky)
    ctx.strokeStyle = '#2a263d';
    ctx.lineWidth = 8;
    drawRoundedRect(ctx, 30, 30, W - 60, H - 60, 32);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.stroke();

    // Inner ribbon header
    ctx.fillStyle = '#ff7e7e';
    drawRoundedRect(ctx, 80, 70, W - 160, 110, 24);
    ctx.fill();
    ctx.lineWidth = 5; ctx.stroke();

    // Header text
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 64px Fredoka, "Comic Sans MS", sans-serif';
    ctx.fillText('Phonics Pal Certificate', W / 2, 125);

    // Mr. Pip on the left
    drawPip(ctx, 250, 380, 1.6);

    // Stars decorations on right
    drawStar(ctx, W - 230, 280, 32, '#ffc94a');
    drawStar(ctx, W - 160, 360, 22, '#5dc4ec');
    drawStar(ctx, W - 280, 410, 18, '#ff7e7e');
    drawStar(ctx, W - 190, 450, 26, '#c4a3ff');

    // Awarded to
    ctx.fillStyle = '#4a4564';
    ctx.font = '500 30px Fredoka, sans-serif';
    ctx.fillText('Awarded to', W / 2, 240);

    // Kid's name (huge)
    ctx.fillStyle = '#2a263d';
    ctx.font = '700 90px Fredoka, sans-serif';
    const name = displayName().slice(0, 18);
    ctx.fillText(name, W / 2, 320);

    // Underline squiggle
    ctx.strokeStyle = '#5dc4ec';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const baseX = W / 2 - 200, baseY = 365;
    for (let i = 0; i <= 16; i++) {
      const x = baseX + i * 25;
      const y = baseY + (i % 2 === 0 ? 0 : 8);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.quadraticCurveTo(x - 12, y - 10, x, y);
    }
    ctx.stroke();

    // Stats panel
    ctx.fillStyle = '#fef8ec';
    ctx.strokeStyle = '#2a263d';
    ctx.lineWidth = 4;
    drawRoundedRect(ctx, 420, 410, 540, 220, 24);
    ctx.fill(); ctx.stroke();

    // Total stars
    ctx.fillStyle = '#2a263d';
    ctx.font = '700 36px Fredoka, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`⭐ ${PP.state.totalStars} stars earned`, 460, 460);

    // Sticker collection
    ctx.font = '500 24px Fredoka, sans-serif';
    ctx.fillStyle = '#4a4564';
    ctx.fillText(`Stickers collected: ${PP.state.stickers.size}`, 460, 510);

    // Sticker icons row
    const unlockedStickers = Array.from(PP.state.stickers).map(id =>
      Object.values(stickerCatalog).find(s => s.id === id)
    ).filter(Boolean);
    ctx.font = '50px serif';
    let sx = 460;
    unlockedStickers.slice(0, 8).forEach((s) => {
      ctx.fillText(s.emoji, sx, 580);
      sx += 60;
    });
    if (unlockedStickers.length === 0) {
      ctx.font = 'italic 20px Nunito, sans-serif';
      ctx.fillStyle = '#a8a0b8';
      ctx.fillText('Play more games to earn stickers!', 460, 575);
    }

    // Per-game breakdown ticker (small)
    ctx.font = '600 18px Fredoka, sans-serif';
    ctx.fillStyle = '#4a4564';
    const labels = {
      soundmatch: '👂 Sound',
      wordbuilder: '🧱 Build',
      digraph: '🔍 Digraph',
      vowel: '🪣 Vowel',
    };
    let bx = 80;
    const by = 720;
    Object.keys(labels).forEach(g => {
      const txt = `${labels[g]}: ${PP.state.perGameStars[g] || 0}`;
      ctx.fillText(txt, bx, by);
      bx += 220;
    });

    // Date + signature
    ctx.textAlign = 'right';
    ctx.font = '500 22px Fredoka, sans-serif';
    ctx.fillStyle = '#2a263d';
    ctx.fillText(`— Mr. Pip,  ${todayString()}`, W - 80, 720);

    // Confetti dots scattered
    const cdots = [
      ['#ffc94a', 0.18, 0.78], ['#5dc4ec', 0.06, 0.55], ['#ff7e7e', 0.25, 0.65],
      ['#8ad9a8', 0.92, 0.18], ['#c4a3ff', 0.05, 0.18], ['#ff7e7e', 0.95, 0.40],
      ['#5dc4ec', 0.45, 0.84], ['#ffc94a', 0.78, 0.86],
    ];
    cdots.forEach(([color, x, y]) => {
      ctx.fillStyle = color;
      ctx.strokeStyle = '#2a263d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(W * x, H * y, 8, 0, Math.PI*2);
      ctx.fill(); ctx.stroke();
    });
  }

  function openCertificate() {
    paintCertificate();
    $('#cert-status').textContent = '';
    $('#cert-modal').classList.add('active');
    sfx.fanfare();
    setTimeout(() => PP.confetti(40), 200);
  }
  function closeCertificate() {
    $('#cert-modal').classList.remove('active');
  }

  // ----- Sharing -----
  async function dataUrlToFile(dataUrl, filename) {
    const r = await fetch(dataUrl);
    const blob = await r.blob();
    return new File([blob], filename, { type: blob.type });
  }

  function downloadCertificate() {
    const cv = $('#cert-canvas');
    const url = cv.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `phonics-pal-${nameSlug()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    $('#cert-status').textContent = '✅ Downloaded!';
  }

  async function shareCertificate() {
    const cv = $('#cert-canvas');
    const url = cv.toDataURL('image/png');
    const summary = textSummary();
    const filename = `phonics-pal-${nameSlug()}.png`;

    if (navigator.canShare) {
      try {
        const file = await dataUrlToFile(url, filename);
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `${displayName()}'s Phonics Pal Certificate`,
            text: summary,
            files: [file],
          });
          $('#cert-status').textContent = '✅ Shared!';
          return;
        }
      } catch (e) { /* fall through */ }
    }
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${displayName()}'s Phonics Pal Certificate`,
          text: summary,
        });
        $('#cert-status').textContent = '✅ Shared!';
        return;
      } catch (e) { /* fall through */ }
    }
    // Fallback: download + copy text
    downloadCertificate();
    copyText();
    $('#cert-status').textContent = '✅ Saved and copied — paste anywhere!';
  }

  function textSummary() {
    const stickers = Array.from(PP.state.stickers).map(id => {
      const meta = Object.values(stickerCatalog).find(s => s.id === id);
      return meta ? meta.emoji : '';
    }).join('');
    return `🦉 ${displayName()}'s Phonics Pals report:\n` +
           `⭐ ${PP.state.totalStars} stars earned\n` +
           `🎟  Stickers: ${stickers || 'none yet'}\n` +
           `📅 ${todayString()}\n` +
           `(Studied with Mr. Pip!)`;
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(textSummary());
      $('#cert-status').textContent = '✅ Copied to clipboard!';
    } catch (e) {
      // Fallback using legacy textarea trick
      const ta = document.createElement('textarea');
      ta.value = textSummary();
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); $('#cert-status').textContent = '✅ Copied!'; }
      catch (err) { $('#cert-status').textContent = '⚠ Copy not supported in this browser.'; }
      ta.remove();
    }
  }

  function init() {
    $('#results-replay').addEventListener('click', () => {
      sfx.tap();
      close();
      if (pendingReplay) pendingReplay();
    });
    $('#results-home').addEventListener('click', () => {
      sfx.tap();
      close();
      PP.app.goToHub();
    });
    $('#results-share').addEventListener('click', () => {
      sfx.tap();
      close();
      openCertificate();
    });

    $('#cert-download').addEventListener('click', () => { sfx.tap(); downloadCertificate(); });
    $('#cert-share').addEventListener('click', () => { sfx.tap(); shareCertificate(); });
    $('#cert-copy').addEventListener('click', () => { sfx.tap(); copyText(); });
    $('#cert-close').addEventListener('click', () => { sfx.tap(); closeCertificate(); });
    $('#cert-modal').addEventListener('click', e => {
      if (e.target.id === 'cert-modal') closeCertificate();
    });
  }

  PP.results = { init, show, close, openCertificate, paintCertificate };
})();
