(() => {
'use strict';

/* =====================================================================
   utils + palette
   ===================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const fract = (x) => x - Math.floor(x);
const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
const now = () => performance.now();
const pad2 = (n) => String(n).padStart(2, '0');
const root = document.documentElement;
const themeColor = $('meta[name="theme-color"]');
root.classList.add('js');
const RMQ = matchMedia('(prefers-reduced-motion: reduce)');
let reduced = RMQ.matches;
if (RMQ.addEventListener) RMQ.addEventListener('change', (e) => { reduced = e.matches; });
const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
const AUTOMATED = navigator.webdriver === true;
const S2 = Math.SQRT1_2;
const BLUE = '#1f2bff', BLUE2 = '#3442ff', DEEP = '#1119c4', INKB = '#0a0f86', PAPER = '#eef0ff', WHITE = '#f7f8ff', LIME = '#c8ff2e', PERI = '#a6b4ff', BLACK = '#0b0c10';
const SPOTIFY = 'https://open.spotify.com/artist/3Y2WqblqWtFfsFufyvIwDU', SOUNDCLOUD = 'https://soundcloud.com/celesnica', INSTA = 'https://www.instagram.com/celesnicamusic/';
const YOUTUBE = 'https://youtube.com/@celesnica?si=y1GzksclObeIhuR9', NETEASE = 'https://163cn.tv/bkLNYZ0R';
const F_MONO = '"JetBrains Mono", ui-monospace, "DejaVu Sans Mono", monospace', F_DISP = '"CEL Black", "Chakra Petch", sans-serif', F_UI = '"CEL Line", "Chakra Petch", sans-serif', F_CJK = '"PingFang SC","Noto Sans SC","Noto Sans CJK SC","Microsoft YaHei","Hiragino Sans GB",sans-serif';
const ss = {
  get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } },
};
const hex2rgb = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const mulberry = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const outExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const setStretch = () => {};
let tAll = 0;

function slabPath(c, cx, cy, t0, t1, ww, end) {
  const hx = end === 'h' ? ww / 2 : 0, hy = end === 'h' ? 0 : ww / 2;
  const x0 = cx + S2 * t0, y0 = cy - S2 * t0, x1 = cx + S2 * t1, y1 = cy - S2 * t1;
  c.moveTo(x0 - hx, y0 - hy); c.lineTo(x0 + hx, y0 + hy); c.lineTo(x1 + hx, y1 + hy); c.lineTo(x1 - hx, y1 - hy); c.closePath();
}
function hatch(c, x, y, w, h, col, gap, lw) {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.strokeStyle = col; c.lineWidth = lw;
  for (let i = -h; i < w + h; i += gap) { c.beginPath(); c.moveTo(x + i, y + h); c.lineTo(x + i + h, y); c.stroke(); }
  c.restore();
}
function bracket(c, x, y, w, h, l) {
  c.beginPath();
  c.moveTo(x, y + l); c.lineTo(x, y); c.lineTo(x + l, y);
  c.moveTo(x + w - l, y); c.lineTo(x + w, y); c.lineTo(x + w, y + l);
  c.moveTo(x + w, y + h - l); c.lineTo(x + w, y + h); c.lineTo(x + w - l, y + h);
  c.moveTo(x + l, y + h); c.lineTo(x, y + h); c.lineTo(x, y + h - l);
  c.stroke();
}
/* riso print kit (the featured CH 02 card): off-white paper, ultramarine + fluorescent lime overprint,
   halftone dots, slight misregistration, ink drop-outs. Static layer is cached; only the needle moves. */
const RISO = { paper: '#f1efe8', off: null, noise: null };
function risoNoise() { if (RISO.noise) return RISO.noise; const cv = document.createElement('canvas'); cv.width = cv.height = 256; const x = cv.getContext('2d'), im = x.createImageData(256, 256); for (let i = 0; i < im.data.length; i += 4) { const v = (Math.random() * 255) | 0; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } x.putImageData(im, 0, 0); return (RISO.noise = cv); }
function risoGrain(c, w, h, a, mode) { c.save(); c.globalAlpha = a; c.globalCompositeOperation = mode; c.fillStyle = c.createPattern(risoNoise(), 'repeat'); c.fillRect(0, 0, w, h); c.restore(); }
function risoBand(c, w, h, cx, cy, len, wd, paint, fade) {
  const off = RISO.off || (RISO.off = document.createElement('canvas')); off.width = w; off.height = h; const o = off.getContext('2d');
  o.save(); o.translate(cx, cy); o.rotate(-Math.PI / 4); paint(o, len, wd);
  if (fade) { o.globalCompositeOperation = 'destination-in'; const g = o.createLinearGradient(-len / 2, 0, len / 2, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.3, '#000'); g.addColorStop(0.72, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)'); o.fillStyle = g; o.fillRect(-len / 2 - 2, -h * 2, len + 4, h * 4); }
  o.restore(); c.drawImage(off, 0, 0);
}
function risoForm(c, w, h, cx, cy, len, wd, main) {
  c.save(); c.globalCompositeOperation = 'multiply';
  if (main) risoBand(c, w, h, cx + wd * 0.7 * S2 + wd * 0.06, cy + wd * 0.7 * S2, len * 0.86, wd * 0.5, (o, L, W) => { o.fillStyle = LIME; o.fillRect(-L / 2, -W / 2, L, W); }, true);
  risoBand(c, w, h, cx, cy, len, wd, (o, L, W) => {
    o.fillStyle = BLUE; const g = Math.max(3, main ? W * 0.07 : W * 0.5);
    for (let x = -L / 2; x < L / 2; x += g) { const t = (x + L / 2) / L, I = Math.pow(Math.sin(Math.PI * t), 1.3); for (let y = -W / 2 + g / 2; y < W / 2; y += g) { const r = g * 0.64 * I; if (r > 0.35) { o.beginPath(); o.arc(x, y, r, 0, 7); o.fill(); } } }
  }, false);
  c.restore();
}
function risoCard(S) {
  const cv = document.createElement('canvas'); cv.width = cv.height = S; const c = cv.getContext('2d');
  c.fillStyle = RISO.paper; c.fillRect(0, 0, S, S); risoGrain(c, S, S, 0.09, 'multiply');
  risoForm(c, S, S, S * 0.47, S * 0.55, S * 1.6, S * 0.15, true);
  risoForm(c, S, S, S * 0.68, S * 0.6, S * 1.15, S * 0.02, false);
  const cx = S * 0.62, cy = S * 0.42, R = S * 0.29;
  c.save(); c.globalCompositeOperation = 'multiply'; c.strokeStyle = BLUE;
  c.lineWidth = S * 0.006; c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.stroke();
  c.lineWidth = Math.max(1, S * 0.0026); c.setLineDash([S * 0.004, S * 0.01]); c.beginPath(); c.arc(cx, cy, R * 0.68, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
  c.strokeStyle = 'rgba(31,43,255,.7)'; c.beginPath();
  for (let i = 0; i < 96; i++) { const an = (i / 96) * Math.PI * 2, l = i % 12 === 0 ? S * 0.024 : S * 0.009; c.moveTo(cx + Math.cos(an) * R, cy + Math.sin(an) * R); c.lineTo(cx + Math.cos(an) * (R + l), cy + Math.sin(an) * (R + l)); }
  c.stroke(); c.restore();
  hatch(c, S * 0.06, S * 0.2, S * 0.045, S * 0.22, 'rgba(31,43,255,.42)', S * 0.014, S * 0.0034);
  c.fillStyle = 'rgba(31,43,255,.18)'; c.fillRect(S * 0.06, S * 0.104, S * 0.88, Math.max(1, S * 0.0018));
  c.font = `400 ${Math.round(S * 0.024)}px ${F_UI}`; c.textBaseline = 'top';
  c.fillStyle = BLUE; c.fillText('NEW SINGLE', S * 0.06, S * 0.06);
  c.fillStyle = 'rgba(31,43,255,.66)'; c.textAlign = 'right'; c.fillText('CH 02 · 45.00', S * 0.94, S * 0.06); c.textAlign = 'left';
  const fs = S * 0.25, ty = S * 0.82, cut = ty - fs * 0.34;
  c.font = `400 ${Math.round(fs)}px ${F_DISP}`; c.textBaseline = 'alphabetic';
  const tt = (dx, dy, col) => { c.fillStyle = col; c.save(); c.beginPath(); c.rect(0, 0, S, cut); c.clip(); c.fillText('TBA', S * 0.06 + dx, ty + dy); c.restore(); c.save(); c.beginPath(); c.rect(0, cut + S * 0.006, S, S); c.clip(); c.fillText('TBA', S * 0.074 + dx, ty + dy); c.restore(); };
  // knock the title (and its caption) out of the halftone so it prints clean, then the two inks
  c.save(); c.strokeStyle = RISO.paper; c.lineJoin = 'round'; c.lineWidth = S * 0.016; c.fillStyle = RISO.paper;
  for (const [x, yy] of [[S * 0.06, ty], [S * 0.074, ty]]) { c.strokeText('TBA', x, yy); c.fillText('TBA', x, yy); }
  c.restore();
  tt(S * 0.006, S * 0.0045, LIME); tt(0, 0, BLUE);
  const cols = [BLUE, 'rgba(31,43,255,.68)', 'rgba(31,43,255,.4)', 'rgba(31,43,255,.16)', LIME, '#17262e'], bw = (S * 0.34) / cols.length;
  cols.forEach((col, i) => { c.fillStyle = col; c.fillRect(S * 0.06 + i * bw, S * 0.92, bw - Math.max(1, S * 0.002), S * 0.016); });
  c.save(); c.fillStyle = RISO.paper; const r = mulberry(7); for (let i = 0; i < (S * S) / 900; i++) { c.globalAlpha = 0.25 + r() * 0.5; c.fillRect(r() * S, r() * S, 1 + r() * 1.4, 1 + r() * 1.4); } c.restore();
  risoGrain(c, S, S, 0.05, 'multiply');
  return cv;
}
function spring(o, target, dt, k = 150, d = 13) {
  const n = Math.max(1, Math.ceil(dt / (1 / 120))), h = dt / n;
  for (let i = 0; i < n; i++) { o.vel += (k * (target - o.v) - d * o.vel) * h; o.v += o.vel * h; }
}

/* =====================================================================
   data
   ===================================================================== */
const pat = (s) => [...s].map((ch) => (ch === '.' ? { on: false, p: 3 } : { on: true, p: +ch }));
const hits = (s) => [...s].map((ch) => ch === 'x');
const DECK = ['jedm', 'organic', 'missions', 'worlds'];
const CH = {
  jedm: { code: 'CH 01', name: 'J-EDM', tag: 'Japanese style', monInk: BLUE, monBg: LIME, bpm: 140, root: 69, scale: [0, 1, 5, 7, 8, 12, 13, 17], scaleName: 'Miyako-bushi', patch: 'pluck', perc: 'Clap', hat: 'Hat',
    preset: { lead: '4.32.45.7.654.23', kick: 'x...x...x...x...', perc: '....x.......x...', hat: '..x...x...x...xx' } },
  organic: { code: 'CH 02', name: 'ORGANIC', tag: 'Nature · sound', monInk: BLUE, monBg: PAPER, bpm: 96, root: 72, scale: [0, 2, 4, 7, 9, 12, 14, 16], scaleName: 'Pentatonic', patch: 'kalimba', perc: 'Wood', hat: 'Shaker',
    preset: { lead: '2..4..3.5.42..1.', kick: 'x......x..x.....', perc: '....x.......xx..', hat: 'x.x.x.x.x.x.x.xx' } },
  missions: { code: 'CH 03', name: 'MISSIONS', tag: 'Sci-fi · narrative', monInk: LIME, monBg: DEEP, bpm: 120, root: 57, scale: [0, 3, 5, 7, 10, 12, 15, 17], scaleName: 'Minor pent.', patch: 'arp', perc: 'Snare', hat: 'Hat',
    preset: { lead: '0.24.5..0.246.5.', kick: 'x..x....x..x....', perc: '....x.......x...', hat: 'x.xxx.xxx.xxx.xx' } },
  worlds: { code: 'CH 04', name: 'WORLDS', tag: 'Game audio', monInk: WHITE, monBg: BLUE, bpm: 128, root: 72, scale: [0, 2, 4, 5, 7, 9, 11, 12], scaleName: 'Major', patch: 'chip', perc: 'Chip snare', hat: 'Hat',
    preset: { lead: '0247.25734.75210', kick: 'x.....x.x.....x.', perc: '....x.......x...', hat: '..x...x...x...x.' } },
};
const TUNE = [
  { f: 41.7, code: 'CH 01', chip: '未眠 Remix', k: 'Official remix · 2026', t: '未眠', cjk: true, a: 'Vesk Green — Celesnica Remix',
    n: 'Winner of Vesk Green’s “未眠 (No Sleep)” Remix Contest. The remix earned an official release.', g: ['Official release', 'Contest winner', '2026'], l: [['Listen on Spotify', SPOTIFY]],
    art: { seed: 11, inv: true, title: '未眠', cjk: true, sub: 'Vesk Green — Celesnica Remix', code: '2026' } },
  { f: 45.0, code: 'CH 02', chip: 'Featured slot', k: 'Featured · next single', t: 'Incoming', a: 'Celesnica — new single',
    n: 'The next single lands on this channel. Title, artwork and release date will be announced here.', g: ['Title TBA', 'Artwork TBA', 'Date TBA'], l: [['Follow on Spotify', SPOTIFY]], art: null },
  { f: 48.3, code: 'CH 03', chip: 'Awake Remix', k: 'Remix · 2026', t: 'Awake', a: 'MitiS — Celesnica & Akmmer Remix',
    n: 'Made with Akmmer for the MitiS remix contest.', g: ['Remix contest', 'Collaboration', '2026'], l: [['Listen on SoundCloud', SOUNDCLOUD]],
    art: { seed: 23, title: 'AWAKE', sub: 'Celesnica & Akmmer Remix', code: 'REMIX' } },
];
const C_PIECES = [
  [[1.9, 5.2], [0, 5.2], [0, 2.7], [2.7, 0], [7.6, 0], [8.4, 0.8], [7.3, 1.9], [3.4, 1.9], [1.9, 3.4]],
  [[8.7, 1.1], [10, 2.4], [10, 3.5], [6.3, 3.5]],
  [[1.9, 5.4], [0, 5.4], [0, 7.9], [2.7, 10.6], [7.6, 10.6], [8.4, 9.8], [7.3, 8.7], [3.4, 8.7], [1.9, 7.2]],
  [[8.7, 9.5], [10, 8.2], [10, 7.1], [6.3, 7.1]],
];
const pd = (pts) => 'M' + pts.map((p) => p[0] + ' ' + p[1]).join('L') + 'Z';
const cSVG = () => `<svg viewBox="-.2 -.2 10.4 11" aria-hidden="true" focusable="false"><path class="cm-b" d="${pd(C_PIECES[0])}${pd(C_PIECES[2])}"/><path class="cm-t" d="${pd(C_PIECES[1])}${pd(C_PIECES[3])}"/></svg>`;

/* =====================================================================
   scramble
   ===================================================================== */
const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789/<>#_+=';
function scramble(el, to, dur = 620) {
  if (!el) return;
  if (reduced) { el.textContent = to; return; }
  cancelAnimationFrame(el._scr);
  const from = el.textContent, start = now();
  const tick = () => {
    const p = clamp((now() - start) / dur, 0, 1);
    let out = '';
    for (let i = 0; i < to.length; i++) {
      const rp = (i / Math.max(1, to.length)) * 0.65;
      if (p >= rp + 0.35 || to[i] === ' ') out += to[i];
      else if (p > rp) out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      else out += from[i] || '';
    }
    el.textContent = out;
    if (p < 1) el._scr = requestAnimationFrame(tick); else el.textContent = to;
  };
  tick();
}

/* =====================================================================
   audio
   ===================================================================== */
const AU = {
  ctx: null, out: null, bus: null, an: null, noise: null, tdata: null, on: false, st: null,
  ok: !!(window.AudioContext || window.webkitAudioContext),
  ensure() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return true; }
    if (!this.ok) return false;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      const c = new AC();
      this.ctx = c;
      this.out = c.createGain(); this.out.gain.value = 0;
      const comp = c.createDynamicsCompressor();
      comp.threshold.value = -16; comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.2;
      this.bus = c.createGain(); this.bus.gain.value = 0.5;
      this.an = c.createAnalyser(); this.an.fftSize = 1024;
      this.bus.connect(comp); comp.connect(this.out); this.out.connect(this.an); this.an.connect(c.destination);
      const len = c.sampleRate, b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.noise = b;
      this.tdata = new Uint8Array(this.an.fftSize);
      return true;
    } catch (e) { this.ok = false; return false; }
  },
  setOn(v) {
    this.on = !!v;
    if (this.on && !this.ensure()) this.on = false;
    if (this.ctx) { const t = this.ctx.currentTime; this.out.gain.cancelScheduledValues(t); this.out.gain.setTargetAtTime(this.on ? 1 : 0, t, 0.03); }
    const b = $('#soundBtn');
    b.setAttribute('aria-pressed', String(this.on));
    b.setAttribute('aria-label', this.on ? 'Sound is on. Turn sound off' : 'Sound is off. Turn sound on');
    root.classList.toggle('snd-on', this.on);
  },
  env(g, t, a, peak, d) { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); },
  nz(t, dur, type, f, q, peak) {
    const c = this.ctx, s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.noise; fl.type = type; fl.frequency.value = f; fl.Q.value = q;
    this.env(g, t, 0.001, peak, dur);
    s.connect(fl); fl.connect(g); g.connect(this.bus);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  },
  osc(t, type, f, peak, a, d) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    this.env(g, t, a, peak, d);
    o.connect(g); g.connect(this.bus); o.start(t); o.stop(t + a + d + 0.05);
    return o;
  },
  lead(patch, t, f, vel = 1) {
    const c = this.ctx;
    if (!c) return;
    if (patch === 'pluck') {
      const fl = c.createBiquadFilter(), g = c.createGain();
      fl.type = 'lowpass'; fl.Q.value = 6;
      fl.frequency.setValueAtTime(7000, t); fl.frequency.exponentialRampToValueAtTime(700, t + 0.22);
      this.env(g, t, 0.003, 0.2 * vel, 0.34);
      fl.connect(g); g.connect(this.bus);
      [-9, 9].forEach((dt) => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = dt; o.connect(fl); o.start(t); o.stop(t + 0.45); });
      const sq = c.createOscillator(), sg = c.createGain();
      sq.type = 'square'; sq.frequency.value = f / 2; sg.gain.value = 0.32; sq.connect(sg); sg.connect(fl); sq.start(t); sq.stop(t + 0.45);
    } else if (patch === 'kalimba') {
      this.osc(t, 'sine', f, 0.3 * vel, 0.002, 0.9);
      this.osc(t, 'sine', f * 3.01, 0.07 * vel, 0.001, 0.25);
      this.osc(t, 'triangle', f * 5.4, 0.025 * vel, 0.001, 0.08);
      this.nz(t, 0.012, 'highpass', 3000, 0.7, 0.05);
    } else if (patch === 'arp') {
      const fl = c.createBiquadFilter(), g = c.createGain();
      fl.type = 'lowpass'; fl.Q.value = 9;
      fl.frequency.setValueAtTime(2600, t); fl.frequency.exponentialRampToValueAtTime(320, t + 0.26);
      this.env(g, t, 0.004, 0.2 * vel, 0.3);
      fl.connect(g); g.connect(this.bus);
      const o1 = c.createOscillator(), o2 = c.createOscillator();
      o1.type = 'sawtooth'; o1.frequency.value = f; o2.type = 'square'; o2.frequency.value = f * 1.004;
      o1.connect(fl); o2.connect(fl); o1.start(t); o2.start(t); o1.stop(t + 0.4); o2.stop(t + 0.4);
    } else {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'square';
      o.frequency.setValueAtTime(f * 2, t); o.frequency.setValueAtTime(f, t + 0.018);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.1 * vel, t + 0.002);
      g.gain.setValueAtTime(0.075 * vel, t + 0.06); g.gain.setValueAtTime(0.05 * vel, t + 0.1); g.gain.linearRampToValueAtTime(0.0001, t + 0.17);
      o.connect(g); g.connect(this.bus); o.start(t); o.stop(t + 0.2);
    }
  },
  kick(t, style) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    const soft = style === 'organic', chip = style === 'worlds';
    o.type = 'sine';
    o.frequency.setValueAtTime(soft ? 120 : chip ? 220 : 165, t);
    o.frequency.exponentialRampToValueAtTime(soft ? 48 : 42, t + (chip ? 0.06 : 0.12));
    g.gain.setValueAtTime(soft ? 0.55 : 0.95, t); g.gain.exponentialRampToValueAtTime(0.0001, t + (soft ? 0.28 : 0.38));
    o.connect(g); g.connect(this.bus); o.start(t); o.stop(t + 0.42);
    if (!soft) this.nz(t, 0.01, 'highpass', 1500, 0.7, 0.12);
  },
  perc(t, style) {
    if (style === 'jedm') { for (let i = 0; i < 3; i++) this.nz(t + i * 0.011, i === 2 ? 0.14 : 0.02, 'bandpass', 1500, 0.9, 0.35); }
    else if (style === 'organic') { this.nz(t, 0.04, 'bandpass', 2400, 9, 0.5); this.osc(t, 'sine', 820, 0.12, 0.001, 0.05); }
    else if (style === 'missions') { this.nz(t, 0.18, 'bandpass', 1800, 1, 0.38); this.osc(t, 'triangle', 190, 0.22, 0.001, 0.1); }
    else { this.nz(t, 0.12, 'highpass', 1000, 0.7, 0.26); this.osc(t, 'square', 160, 0.06, 0.001, 0.05); }
  },
  hat(t, style, acc = 1) {
    if (style === 'organic') this.nz(t, 0.07, 'bandpass', 6200, 1.2, 0.14 * acc);
    else this.nz(t, 0.035, 'highpass', 8000, 0.7, 0.13 * acc);
  },
  staticLevel(l, f = 45) {
    if (!this.ctx) return;
    if (!this.st) {
      if (l <= 0.001) return;
      const c = this.ctx, s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
      s.buffer = this.noise; s.loop = true; fl.type = 'bandpass'; fl.Q.value = 0.9; g.gain.value = 0;
      s.connect(fl); fl.connect(g); g.connect(this.bus); s.start();
      this.st = { s, fl, g, lv: 0 };
    }
    const lv = this.on ? l : 0;
    if (Math.abs(lv - this.st.lv) < 0.01) return;
    this.st.lv = lv;
    const t = this.ctx.currentTime;
    this.st.g.gain.setTargetAtTime(lv * 0.13, t, 0.03);
    this.st.fl.frequency.setTargetAtTime(700 + (f - 40) * 260, t, 0.05);
  },
  ui(kind, arg) {
    if (!this.on || !this.ctx) return;
    const t = this.ctx.currentTime + 0.005;
    if (kind === 'tick') this.osc(t, 'sine', 2300, 0.02, 0.001, 0.025);
    else if (kind === 'blip') { const o = this.osc(t, 'square', 660, 0.035, 0.002, 0.07); o.frequency.exponentialRampToValueAtTime(1320, t + 0.06); }
    else if (kind === 'switch') { const f = arg || 440; this.osc(t, 'triangle', f, 0.08, 0.002, 0.18); this.osc(t + 0.06, 'triangle', f * 1.5, 0.06, 0.002, 0.2); }
    else if (kind === 'lock') { [72, 76, 79, 84].forEach((m, i) => this.osc(t + i * 0.055, 'triangle', mtof(m + (arg || 0)), 0.07, 0.002, 0.32)); }
    else if (kind === 'ping') { const o = this.osc(t, 'sine', 1320, 0.12, 0.002, 0.7); o.frequency.exponentialRampToValueAtTime(990, t + 0.6); this.osc(t + 0.32, 'sine', 990, 0.04, 0.002, 0.5); }
    else if (kind === 'strike') {
      this.kick(t, 'jedm'); this.nz(t, 0.4, 'bandpass', 900, 0.6, 0.3);
      const o = this.osc(t, 'sawtooth', 420, 0.08, 0.002, 0.35); o.frequency.exponentialRampToValueAtTime(60, t + 0.35);
    } else if (kind === 'whoosh') {
      const c = this.ctx, s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
      s.buffer = this.noise; fl.type = 'bandpass'; fl.Q.value = 1.4;
      fl.frequency.setValueAtTime(300, t); fl.frequency.exponentialRampToValueAtTime(5000, t + 0.45);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.15, t + 0.2); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      s.connect(fl); fl.connect(g); g.connect(this.bus); s.start(t); s.stop(t + 0.65);
    }
  },
};

/* =====================================================================
   sequencer
   ===================================================================== */
const MONS = [];
const Seq = {
  key: 'jedm', patterns: {}, playing: false, step: 0, next: 0, timer: 0, q: [], audioless: false, vclock: 0,
  init() { for (const k of DECK) this.patterns[k] = this.fromPreset(k); },
  fromPreset(k) { const p = CH[k].preset; return { lead: pat(p.lead), kick: hits(p.kick), perc: hits(p.perc), hat: hits(p.hat) }; },
  get ch() { return CH[this.key]; },
  get pat() { return this.patterns[this.key]; },
  stepDur() { return 60 / this.ch.bpm / 4; },
  freq(p, oct = 0, key = this.key) { const ch = CH[key]; return mtof(ch.root + ch.scale[clamp(p, 0, 7)] + oct * 12); },
  start() {
    if (this.playing) return;
    this.playing = true; this.step = 0; this.q.length = 0;
    if (AU.ensure()) {
      this.audioless = false;
      this.next = AU.ctx.currentTime + 0.06;
      this.timer = setInterval(() => this.tick(), 25);
      this.tick();
    } else { this.audioless = true; this.vclock = this.stepDur(); }
    Deck.playState(true);
  },
  stop() { this.playing = false; clearInterval(this.timer); this.q.length = 0; Deck.playhead(-1); Deck.playState(false); },
  tick() {
    const c = AU.ctx;
    while (this.next < c.currentTime + 0.12) {
      this.schedule(this.step, this.next);
      this.q.push({ s: this.step, t: this.next });
      this.next += this.stepDur();
      this.step = (this.step + 1) % 16;
    }
  },
  schedule(s, t) {
    const P = this.pat, ch = this.ch, k = this.key, L = P.lead[s];
    if (L.on) AU.lead(ch.patch, t, this.freq(L.p), s % 4 === 0 ? 1 : 0.82);
    if (P.kick[s]) AU.kick(t, k);
    if (P.perc[s]) AU.perc(t, k);
    if (P.hat[s]) AU.hat(t, k, s % 2 ? 0.7 : 1);
  },
  frame(dt) {
    if (!this.playing) return;
    if (!this.audioless && AU.ctx) {
      const t = AU.ctx.currentTime;
      while (this.q.length && this.q[0].t <= t) this.fire(this.q.shift().s);
    } else {
      this.vclock += dt;
      while (this.vclock >= this.stepDur()) { this.vclock -= this.stepDur(); this.fire(this.step); this.step = (this.step + 1) % 16; }
    }
  },
  fire(s) {
    const P = this.pat, L = P.lead[s], k = this.key;
    Deck.playhead(s);
    const send = (l, p) => { for (const m of MONS) if (m.key === k) m.note(l, p); };
    if (L.on) { send('lead', L.p); Field.hit(0.45); }
    if (P.kick[s]) { send('kick'); Field.hit(1); }
    if (P.perc[s]) { send('perc'); Field.hit(0.6); }
    if (P.hat[s]) send('hat');
  },
};

/* =====================================================================
   signal field: 45° slabs drifting behind the blue sections
   ===================================================================== */
const Field = {
  cv: null, ctx: null, w: 0, h: 0, dpr: 1, R: 0, slabs: [], traces: [], streaks: [],
  kick: 0, kk: 0, sv: 0, scrollAcc: 0, mx: -1e4, my: -1e4, mOn: false, t: 0, speed: 1, haz: null, lime: hex2rgb(LIME),
  init() {
    this.cv = $('#field'); this.ctx = this.cv.getContext('2d');
    const hc = document.createElement('canvas'); hc.width = hc.height = 12;
    const hx = hc.getContext('2d'); hx.strokeStyle = WHITE; hx.lineWidth = 3;
    for (let i = -12; i <= 24; i += 12) { hx.beginPath(); hx.moveTo(i, 12); hx.lineTo(i + 12, 0); hx.stroke(); }
    this.haz = this.ctx.createPattern(hc, 'repeat');
    this.resize();
    let lw = innerWidth, lh = innerHeight, rt = 0;
    addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => { if (innerWidth !== lw || Math.abs(innerHeight - lh) > 140) { lw = innerWidth; lh = innerHeight; this.resize(); } }, 140);
    });
    if (FINE) {
      addEventListener('pointermove', (e) => { this.mx = e.clientX; this.my = e.clientY; this.mOn = true; }, { passive: true });
      document.addEventListener('pointerleave', () => { this.mOn = false; });
    }
  },
  resize() {
    this.w = innerWidth; this.h = innerHeight; this.dpr = Math.min(devicePixelRatio || 1, 1.75);
    this.cv.width = Math.round(this.w * this.dpr); this.cv.height = Math.round(this.h * this.dpr);
    this.R = (this.w + this.h) * S2 * 0.5 + 80;
    this.build();
  },
  build() {
    const R = this.R, n = this.w < 700 ? 9 : 16;
    this.slabs = [];
    for (let i = 0; i < n; i++) {
      const r = Math.random();
      let kind = r < 0.46 ? 0 : r < 0.62 ? 1 : r < 0.84 ? 2 : 3;
      if (i < 1) kind = 4;
      this.slabs.push({ kind, p: rand(-R, R), s: rand(-R, R), len: rand(0.2, 0.7) * this.h, ww: kind === 3 ? rand(1.5, 3) : kind === 4 ? rand(30, 60) : rand(16, 90),
        z: rand(0.45, 1.3), sp: rand(6, 24) * (Math.random() < 0.2 ? -1 : 1), end: Math.random() < 0.6 ? 'h' : 'v', fl: i % 3 === 0 });
    }
    this.traces = [];
    const tn = this.w < 700 ? 2 : 4;
    for (let i = 0; i < tn; i++) {
      let x = rand(-0.2, 0.85) * this.w, y = this.h + 20;
      const pts = [[x, y]];
      while (x < this.w + 60 && y > -60) { const L = rand(80, 320); x += L * S2; y -= L * S2; pts.push([x, y]); if (Math.random() < 0.6) { y -= rand(30, 160); pts.push([x, y]); } }
      const segs = []; let tot = 0;
      for (let j = 1; j < pts.length; j++) { const l = Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]); segs.push(l); tot += l; }
      this.traces.push({ pts, segs, tot, off: rand(0, tot), sp: rand(60, 160) });
    }
  },
  hit(v) { this.kick = Math.max(this.kick, v); },
  strike(x, y) { this.kick = 1.3; for (let i = 0; i < 14; i++) this.streaks.push({ x: x + rand(-260, 120), y: y + rand(-120, 120), len: rand(30, 220), life: rand(0.6, 1) }); },
  frame(dt) {
    const c = this.ctx, W2 = this.w / 2, H2 = this.h / 2, R = this.R;
    this.t += dt;
    const amb = Seq.playing || reduced ? 0 : 0.22 * Math.exp(-fract(this.t * 128 / 60) * 7);
    this.kick *= Math.exp(-dt * 7);
    const kk = Math.max(this.kick, amb); this.kk = kk;
    const scr = reduced ? 0 : this.scrollAcc; this.scrollAcc = 0;
    this.sv = lerp(this.sv, scr / Math.max(dt, 0.001), 0.2);
    if (reduced && this.drawn) return;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    c.clearRect(0, 0, this.w, this.h);
    const L = this.lime, mOn = this.mOn && !reduced, mx = this.mx, my = this.my, cutR = 120;
    for (const s of this.slabs) {
      if (!reduced) {
        s.s += (s.sp * this.speed * dt + scr * 0.42) * s.z;
        const lim = R + s.len / 2;
        if (s.s > lim) { s.s = -lim; s.p = rand(-R, R); } else if (s.s < -lim) { s.s = lim; s.p = rand(-R, R); }
      }
      const cx = W2 + S2 * (s.s + s.p), cy = H2 + S2 * (s.p - s.s);
      if (cx < -s.len || cx > this.w + s.len || cy < -s.len || cy > this.h + s.len) continue;
      const half = s.len / 2;
      let a0 = -half, a1 = half, b0 = 0, b1 = 0, split = false;
      if (mOn) {
        const dx = mx - cx, dy = my - cy, t = (dx - dy) * S2, d = (dx + dy) * S2, th = s.ww * 0.36 + cutR;
        if (Math.abs(d) < th && Math.abs(t) < half) { const g = 64 * (1 - Math.abs(d) / th), sh = g * 0.35; a0 = -half - sh; a1 = t - g / 2 - sh; b0 = t + g / 2 + sh; b1 = half + sh; split = true; }
      }
      c.beginPath();
      if (a1 > a0) slabPath(c, cx, cy, a0, a1, s.ww, s.end);
      if (split && b1 > b0) slabPath(c, cx, cy, b0, b1, s.ww, s.end);
      if (s.kind === 0) { c.fillStyle = 'rgba(247,248,255,.05)'; c.fill(); }
      else if (s.kind === 1) { c.globalAlpha = 0.13; c.fillStyle = this.haz; c.fill(); c.globalAlpha = 1; }
      else if (s.kind === 2) { c.strokeStyle = `rgba(247,248,255,${0.2 + (s.fl ? kk * 0.45 : 0)})`; c.lineWidth = 1; c.stroke(); }
      else if (s.kind === 3) { c.fillStyle = rgba(L, 0.55 + (s.fl ? kk * 0.4 : 0)); c.fill(); }
      else { c.fillStyle = `rgba(247,248,255,${0.05 + kk * 0.06})`; c.fill(); }
    }
    c.lineWidth = 1;
    for (const tr of this.traces) {
      c.strokeStyle = 'rgba(247,248,255,.12)'; c.beginPath();
      tr.pts.forEach((p, j) => (j ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
      c.stroke();
      if (!reduced) tr.off = (tr.off + tr.sp * (1 + kk * 2.5) * this.speed * dt) % tr.tot;
      this.packet(c, tr, tr.off, 70, rgba(L, 0.9));
    }
    if (!reduced && Math.abs(this.sv) > 1400 && Math.random() < 0.5) this.streaks.push({ x: rand(0, this.w), y: rand(0, this.h), len: rand(40, 260), life: 1 });
    if (this.streaks.length) {
      c.fillStyle = WHITE;
      for (const st of this.streaks) { st.life -= dt * 2.2; c.globalAlpha = Math.max(0, st.life) * 0.6; c.fillRect(st.x, st.y, st.len, 1); st.x += dt * 260; }
      c.globalAlpha = 1;
      this.streaks = this.streaks.filter((s) => s.life > 0);
    }
    this.drawn = true;
  },
  packet(c, tr, d0, len, style) {
    let d = 0, started = false;
    const d1 = d0 + len;
    c.strokeStyle = style; c.lineWidth = 2; c.beginPath();
    for (let j = 0; j < tr.segs.length; j++) {
      const L = tr.segs[j], a = tr.pts[j], b = tr.pts[j + 1];
      if (d + L >= d0 && d <= d1) {
        const s0 = clamp((d0 - d) / L, 0, 1), s1 = clamp((d1 - d) / L, 0, 1);
        const x0 = a[0] + (b[0] - a[0]) * s0, y0 = a[1] + (b[1] - a[1]) * s0, x1 = a[0] + (b[0] - a[0]) * s1, y1 = a[1] + (b[1] - a[1]) * s1;
        if (!started) { c.moveTo(x0, y0); started = true; }
        c.lineTo(x1, y1);
      }
      d += L;
      if (d > d1) break;
    }
    c.stroke(); c.lineWidth = 1;
  },
};

/* =====================================================================
   wordmark: CELESNICA built from slabs, cut along 45°
   ===================================================================== */
const GLY = {
  C: { w: 6, r: [[[1.7, 0], [6, 0], [6, 1.7], [2.4, 1.7], [1.7, 2.4], [1.7, 5.6], [2.4, 6.3], [6, 6.3], [6, 8], [1.7, 8], [0, 6.3], [0, 1.7]]] },
  E: { w: 5.6, r: [[[1.7, 0], [5.6, 0], [5.6, 1.7], [1.7, 1.7], [1.7, 3.15], [4.9, 3.15], [4.9, 4.85], [1.7, 4.85], [1.7, 6.3], [5.6, 6.3], [5.6, 8], [0, 8], [0, 1.7]]] },
  L: { w: 5.4, r: [[[0, 0], [1.7, 0], [1.7, 6.3], [5.4, 6.3], [5.4, 8], [1.7, 8], [0, 6.3]]] },
  S: { w: 6, r: [[[1.7, 0], [6, 0], [6, 1.7], [2.4, 1.7], [1.7, 2.4], [1.7, 2.45], [2.4, 3.15], [4.3, 3.15], [6, 4.85], [6, 6.3], [4.3, 8], [0, 8], [0, 6.3], [3.6, 6.3], [4.3, 5.6], [4.3, 5.55], [3.6, 4.85], [1.7, 4.85], [0, 3.15], [0, 1.7]]] },
  N: { w: 6, r: [[[0, 0], [1.7, 0], [4.3, 5.1], [4.3, 0], [6, 0], [6, 8], [4.3, 8], [1.7, 2.9], [1.7, 8], [0, 8]]] },
  I: { w: 1.7, r: [[[0, 1.7], [1.7, 0], [1.7, 8], [0, 8]]] },
  A: { w: 6, r: [[[0, 8], [0, 1.7], [1.7, 0], [4.3, 0], [6, 1.7], [6, 8], [4.3, 8], [4.3, 5], [1.7, 5], [1.7, 8]], [[1.7, 3.3], [4.3, 3.3], [4.3, 2.4], [3.6, 1.7], [2.4, 1.7], [1.7, 2.4]]] },
};
function clipHalf(poly, a, b, c0) {
  const res = [], n = poly.length;
  for (let i = 0; i < n; i++) {
    const p = poly[i], q = poly[(i + 1) % n];
    const fp = a * p[0] + b * p[1] + c0, fq = a * q[0] + b * q[1] + c0;
    if (fp >= 0) res.push(p);
    if ((fp >= 0) !== (fq >= 0)) { const t = fp / (fp - fq); res.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
  }
  return res;
}
function clipU(ring, lo, hi) {
  let out = ring;
  if (lo > -1e8) out = clipHalf(out, 1, 1, -lo);
  if (out.length && hi < 1e8) out = clipHalf(out, -1, -1, hi);
  return out;
}
const WM = {
  cv: null, ctx: null, letters: [], Wu: 0, Hu: 8, padX: 1.4, padY: 2, k: 1, cw: 0, dpr: 1,
  cuts: [10.5, 22.8, 36.2, 38.6, 49.5], g: 0.17, boff: [0, 0.24, -0.16, 0.1, 0.28, -0.12], hazBand: 3,
  anim: -1, spread: 0, hov: false, um: 30, gm: { v: 0, vel: 0 }, sm: { v: 0, vel: 0 }, glitch: 0, nextG: 4, streaks: [], tmp: null, pat: null, patK: 0, dirty: true,
  init() {
    this.cv = $('#wm'); this.ctx = this.cv.getContext('2d');
    let x = 0; const sp = 1.1;
    for (const ch of 'CELESNICA') {
      const gl = GLY[ch];
      const rings = gl.r.map((r) => r.map((p) => [p[0] + x, p[1]]));
      let lo = 1e9, hi = -1e9;
      rings[0].forEach((p) => { const u = p[0] + p[1]; if (u < lo) lo = u; if (u > hi) hi = u; });
      this.letters.push({ rings, lo, hi, x0: x, x1: x + gl.w });
      x += gl.w + sp;
    }
    this.Wu = x - sp;
    this.tmp = document.createElement('canvas');
    const hero = $('#hero');
    hero.addEventListener('pointermove', (e) => this.move(e));
    hero.addEventListener('pointerleave', () => { this.hov = false; });
    hero.addEventListener('click', (e) => { if (e.target.closest('a,button')) return; this.strike(e.clientX, e.clientY); });
    if (window.ResizeObserver) new ResizeObserver(() => this.size()).observe(this.cv.parentElement);
    this.size();
  },
  size() {
    const w = this.cv.parentElement.clientWidth;
    if (!w) return;
    this.cw = w; this.k = w / (this.Wu + this.padX * 2);
    const hh = this.k * (this.Hu + this.padY * 2);
    this.dpr = Math.min(devicePixelRatio || 1, 2);
    this.cv.style.height = hh + 'px';
    this.cv.width = Math.round(w * this.dpr); this.cv.height = Math.round(hh * this.dpr);
    this.tmp.width = this.cv.width; this.tmp.height = this.cv.height;
    this.pat = null; this.dirty = true;
  },
  toUnit(cx, cy) { const r = this.cv.getBoundingClientRect(); return [(cx - r.left) / this.k - this.padX, (cy - r.top) / this.k - this.padY, r]; },
  move(e) {
    if (!FINE || reduced || e.pointerType !== 'mouse') return;
    const [ux, uy, r] = this.toUnit(e.clientX, e.clientY);
    this.hov = e.clientY > r.top - 90 && e.clientY < r.bottom + 90;
    this.um = ux + uy;
  },
  hitU(u) { this.um = u; if (!reduced) { this.gm.vel += 11; this.sm.vel += 7; this.glitch = 0.24; this.spawnStreaks(10); } AU.ui('strike'); },
  strike(cx, cy) { const [ux, uy] = this.toUnit(cx, cy); this.hitU(clamp(ux + uy, 2, this.Wu + 6)); Field.strike(cx, cy); },
  pulse(i) { this.um = (i / 8) * (this.Wu + 8); if (!reduced) { this.gm.vel += 5; this.sm.vel += 2.5; } },
  assemble() { this.anim = reduced || AUTOMATED ? -1 : now(); this.dirty = true; },
  spawnStreaks(n) {
    for (let i = 0; i < n; i++) {
      const L = this.letters[(Math.random() * this.letters.length) | 0], len = rand(0.6, 4.2), left = Math.random() < 0.5;
      this.streaks.push({ x: left ? L.x0 - len - 0.25 : L.x1 + 0.25, y: rand(0.3, 7.7), len, life: 1 });
    }
  },
  hazPattern() {
    if (this.pat && this.patK === this.k) return this.pat;
    const pc = document.createElement('canvas'); pc.width = pc.height = 8;
    const x = pc.getContext('2d'); x.strokeStyle = LIME; x.lineWidth = 3;
    for (let i = -8; i <= 16; i += 8) { x.beginPath(); x.moveTo(i, 8); x.lineTo(i + 8, 0); x.stroke(); }
    const p = this.ctx.createPattern(pc, 'repeat');
    try { p.setTransform(new DOMMatrix().scale(1 / this.k)); } catch (e) { return LIME; }
    this.pat = p; this.patK = this.k;
    return p;
  },
  frame(dt) {
    if (!this.cw || !this.cv.offsetParent) return;
    const t = now(), animOn = this.anim >= 0 && t - this.anim < 2000;
    if (reduced) { if (!this.dirty) return; }
    else {
      spring(this.gm, this.hov ? 0.3 : 0, dt);
      spring(this.sm, this.hov ? 0.15 : 0, dt);
      this.glitch = Math.max(0, this.glitch - dt);
      this.nextG -= dt;
      if (this.nextG <= 0) { this.glitch = 0.13; this.nextG = rand(3.5, 7.5); this.spawnStreaks(4); }
    }
    const c = this.ctx, k = this.k, dpr = this.dpr, W = this.cv.width, H = this.cv.height;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);
    c.setTransform(k * dpr, 0, 0, k * dpr, this.padX * k * dpr, this.padY * k * dpr);
    // outline ghost at the true position (the 2088 solid/outline pairing)
    c.strokeStyle = 'rgba(247,248,255,.42)'; c.lineWidth = 1.2 / k; c.beginPath();
    for (const L of this.letters) for (const ring of L.rings) { c.moveTo(ring[0][0], ring[0][1]); for (let j = 1; j < ring.length; j++) c.lineTo(ring[j][0], ring[j][1]); c.closePath(); }
    c.stroke();
    const g2 = this.g / 2, cuts = this.cuts, bands = [];
    let lo = -1e9;
    for (let i = 0; i <= cuts.length; i++) { const hi = i < cuts.length ? cuts[i] - g2 : 1e9; bands.push({ lo, hi, i }); if (i < cuts.length) lo = cuts[i] + g2; }
    const gm = Math.max(0, this.gm.v), sm = this.sm.v, um = this.um, cutOn = !reduced && gm > 0.004;
    let ivs = bands;
    if (cutOn) {
      ivs = [];
      for (const b of bands) {
        if (um > b.lo && um < b.hi) { ivs.push({ lo: b.lo, hi: um - gm / 2, i: b.i, side: -1 }); ivs.push({ lo: um + gm / 2, hi: b.hi, i: b.i, side: 1 }); }
        else ivs.push({ lo: b.lo, hi: b.hi, i: b.i, side: b.hi <= um ? -1 : 1 });
      }
    }
    const tt = t - this.anim;
    for (const iv of ivs) {
      if (iv.hi <= iv.lo) continue;
      const sgn = iv.i % 2 ? -1 : 1;
      let off = this.boff[iv.i] || 0;
      if (animOn) { const p = clamp((tt - iv.i * 80) / 1200, 0, 1); off += (1 - outExpo(p)) * sgn * (46 + iv.i * 6); }
      off += sgn * this.spread * (1 + iv.i * 0.3);
      if (cutOn) off += iv.side * sm;
      const ox = off * S2, oy = -off * S2;
      c.beginPath();
      let any = false;
      for (const L of this.letters) {
        if (L.hi < iv.lo || L.lo > iv.hi) continue;
        for (const ring of L.rings) {
          const cl = clipU(ring, iv.lo, iv.hi);
          if (cl.length < 3) continue;
          any = true;
          c.moveTo(cl[0][0] + ox, cl[0][1] + oy);
          for (let j = 1; j < cl.length; j++) c.lineTo(cl[j][0] + ox, cl[j][1] + oy);
          c.closePath();
        }
      }
      if (!any) continue;
      c.fillStyle = iv.i === this.hazBand ? this.hazPattern() : WHITE;
      c.fill('evenodd');
    }
    if (cutOn) { c.strokeStyle = `rgba(200,255,46,${clamp(gm * 3.2, 0, 1)})`; c.lineWidth = 2 / k; c.beginPath(); c.moveTo(um + 1.4, -1.4); c.lineTo(um - 9.4, 9.4); c.stroke(); }
    if (this.streaks.length) {
      c.fillStyle = WHITE;
      for (const s of this.streaks) { s.life -= dt * 2.4; c.globalAlpha = Math.max(0, s.life); c.fillRect(s.x, s.y, s.len, Math.max(0.05, 1 / k)); }
      c.globalAlpha = 1;
      this.streaks = this.streaks.filter((s) => s.life > 0);
    }
    if (this.glitch > 0 && !reduced) {
      c.setTransform(1, 0, 0, 1, 0, 0);
      const tc = this.tmp.getContext('2d');
      tc.clearRect(0, 0, W, H); tc.drawImage(this.cv, 0, 0);
      for (let i = 0; i < 3; i++) { const y = Math.random() * H, hh = rand(3, H * 0.12), dx = rand(-1, 1) * k * dpr * 0.9; c.clearRect(0, y, W, hh); c.drawImage(this.tmp, 0, y, W, hh, dx, y, W, hh); }
    }
    this.dirty = animOn;
  },
};

/* =====================================================================
   glyph composition + channel motifs + monitors
   ===================================================================== */
class Glyph {
  constructor(seed) { this.seed = seed; }
  setup(w, h, opt = {}) {
    const r = mulberry(this.seed), n = opt.n || 12, xc = opt.xc || 0.5, spread = opt.spread || 0.16;
    this.sl = [];
    for (let i = 0; i < n; i++) {
      const cy = h * (0.12 + 0.76 * (i / (n - 1))) + (r() - 0.5) * h * 0.04;
      const cx = w * xc + (r() - 0.5) * w * spread + (i % 2 ? 1 : -1) * w * spread * 0.2;
      const len = h * (0.16 + r() * 0.26), ww = Math.min(w, h * 1.6) * (0.028 + r() * 0.05);
      this.sl.push({ cx, cy, len, cur: len, v: 0, ww, end: r() < 0.55 ? 'h' : 'v', fl: 0 });
    }
    this.lines = [];
    for (let i = 0; i < 6; i++) {
      const x = w * (xc - spread * 2 + r() * spread * 4), y = h * (0.15 + r() * 0.7);
      const L1 = h * (0.1 + r() * 0.25), V = h * (0.05 + r() * 0.15), L2 = h * (0.05 + r() * 0.2);
      const p1 = [x + L1 * S2, y - L1 * S2], p2 = [p1[0], p1[1] - V], p3 = [p2[0] + L2 * S2, p2[1] - L2 * S2];
      this.lines.push({ pts: [[x, y], p1, p2, p3], a: 0 });
    }
    this.shake = 0; this.inv = 0;
  }
  note(lane, p = 3) {
    if (lane === 'lead' || lane === 'amb') {
      const idx = lane === 'amb' ? (Math.random() * this.sl.length) | 0 : clamp(Math.round((p / 7) * (this.sl.length - 1)), 0, this.sl.length - 1);
      const s = this.sl[idx]; s.v -= s.len * (lane === 'amb' ? 2.6 : 8.5); s.fl = lane === 'amb' ? 0.35 : 1;
    } else if (lane === 'kick') this.shake = 1;
    else if (lane === 'perc') this.inv = 1;
    else if (lane === 'hat') this.lines[(Math.random() * this.lines.length) | 0].a = 1;
  }
  update(dt) {
    for (const s of this.sl) { s.v += (160 * (s.len - s.cur) - 16 * s.v) * dt; s.cur += s.v * dt; s.fl = Math.max(0, s.fl - dt * 3); }
    this.shake *= Math.exp(-dt * 12); this.inv = Math.max(0, this.inv - dt * 9);
    for (const l of this.lines) l.a = Math.max(0, l.a - dt * 2.5);
  }
  draw(c, ink, flash) {
    c.save();
    c.translate((Math.random() - 0.5) * this.shake * 6, (Math.random() - 0.5) * this.shake * 4);
    c.fillStyle = ink; c.beginPath();
    for (const s of this.sl) slabPath(c, s.cx, s.cy, -Math.max(2, s.cur) / 2, Math.max(2, s.cur) / 2, s.ww, s.end);
    c.fill();
    for (const s of this.sl) if (s.fl > 0.02) { c.fillStyle = flash; c.globalAlpha = s.fl * 0.9; c.beginPath(); slabPath(c, s.cx, s.cy, -s.cur / 2, s.cur / 2, s.ww, s.end); c.fill(); }
    c.globalAlpha = 1; c.strokeStyle = ink; c.lineWidth = 2;
    for (const l of this.lines) { c.globalAlpha = 0.5 + l.a * 0.5; c.beginPath(); l.pts.forEach((p, j) => (j ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.stroke(); }
    c.globalAlpha = 1;
    c.restore();
  }
}
const hexPath = (c, x, y, r) => { for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i + Math.PI / 6, px = x + r * Math.cos(a), py = y + r * Math.sin(a); i ? c.lineTo(px, py) : c.moveTo(px, py); } c.closePath(); };
const chevPath = (c, x, cy, s, t) => { c.beginPath(); c.moveTo(x, cy - s); c.lineTo(x + t, cy - s); c.lineTo(x + t + s, cy); c.lineTo(x + t, cy + s); c.lineTo(x, cy + s); c.lineTo(x + s, cy); c.closePath(); };
function makeMotif(key) {
  if (key === 'jedm') return {
    setup(m) { this.g = new Glyph(7); this.g.setup(m.w, m.h); },
    note(l, p) { this.g.note(l, p); },
    update(dt) { this.g.update(dt); },
    draw(c, m) {
      const inv = this.g.inv > 0.5, bg = inv ? BLUE : LIME, ink = inv ? LIME : BLUE;
      c.fillStyle = bg; c.fillRect(0, 0, m.w, m.h);
      this.g.draw(c, ink, WHITE);
      c.fillStyle = ink; c.fillRect(m.w * 0.06, m.h * 0.86, m.w * 0.14, 2); c.fillRect(m.w * 0.8, m.h * 0.14, m.w * 0.14, 2);
    },
  };
  if (key === 'organic') return {
    setup(m) {
      const r = (this.r = Math.max(9, m.w / 42)), dx = Math.sqrt(3) * r, dy = 1.5 * r;
      this.cells = []; let row = 0;
      for (let y = 0; y < m.h + r * 2; y += dy, row++) for (let x = (row % 2) * dx / 2; x < m.w + dx; x += dx) this.cells.push({ x, y, e: 0 });
      this.rip = [];
    },
    note(lane, p, m) {
      const w = m.w, h = m.h;
      if (lane === 'lead') this.rip.push({ x: w * (0.12 + (p / 7) * 0.76), y: h * (0.2 + Math.random() * 0.6), r: 0, a: 1, sp: w * 0.55 });
      else if (lane === 'kick') this.rip.push({ x: w / 2, y: h / 2, r: 0, a: 0.7, sp: w * 0.9 });
      else if (lane === 'perc') this.rip.push({ x: Math.random() * w, y: Math.random() * h, r: 0, a: 0.6, sp: w * 0.4 });
      else if (lane === 'amb') this.rip.push({ x: Math.random() * w, y: Math.random() * h, r: 0, a: 0.45, sp: w * 0.3 });
      else if (lane === 'hat') this.cells[(Math.random() * this.cells.length) | 0].e = 1;
      if (this.rip.length > 8) this.rip.shift();
    },
    update(dt, m) {
      const R = this.r;
      for (const q of this.rip) { q.r += q.sp * dt; q.a *= Math.exp(-dt * 1.2); }
      this.rip = this.rip.filter((q) => q.a > 0.03 && q.r < m.w * 1.5);
      for (const cl of this.cells) {
        let e = cl.e * Math.exp(-dt * 2.6);
        for (const q of this.rip) { const kk = 1 - Math.abs(Math.hypot(cl.x - q.x, cl.y - q.y) - q.r) / (R * 2.2); if (kk > 0) e = Math.max(e, kk * q.a); }
        cl.e = e;
      }
    },
    draw(c, m) {
      const w = m.w, h = m.h, R = this.r * 0.92;
      c.fillStyle = PAPER; c.fillRect(0, 0, w, h);
      c.strokeStyle = 'rgba(31,43,255,.16)'; c.lineWidth = 1; c.beginPath();
      for (const q of this.cells) hexPath(c, q.x, q.y, R);
      c.stroke();
      for (const q of this.cells) if (q.e > 0.04) { c.fillStyle = q.e > 0.7 ? LIME : `rgba(31,43,255,${q.e * 0.75})`; c.beginPath(); hexPath(c, q.x, q.y, R * (0.55 + q.e * 0.45)); c.fill(); }
      const b = Math.max(8, w * 0.018), ch = w * 0.05;
      c.fillStyle = BLUE; c.beginPath(); c.rect(0, 0, w, h);
      c.moveTo(b + ch, b); c.lineTo(w * 0.36, b); c.lineTo(w * 0.36 + b, b * 2); c.lineTo(w * 0.7, b * 2); c.lineTo(w * 0.7 + b, b);
      c.lineTo(w - b, b); c.lineTo(w - b, h - b - ch); c.lineTo(w - b - ch, h - b); c.lineTo(b, h - b); c.lineTo(b, b + ch); c.closePath();
      c.fill('evenodd');
      hatch(c, w * 0.08, h - b * 3.4, w * 0.12, b * 1.1, BLUE, 9, 3);
      hatch(c, w * 0.78, b * 3, w * 0.14, b * 1.1, BLUE, 9, 3);
      c.fillStyle = 'rgba(31,43,255,.5)';
      for (let i = 0; i < 12; i++) for (let j = 0; j < 4; j++) c.fillRect(w * 0.82 + i * 6, h * 0.2 + j * 6, 1.6, 1.6);
    },
  };
  if (key === 'missions') return {
    setup(m) {
      this.gs = m.w / 16; this.tg = []; this.blk = [0, 1, 2, 3].map(() => ({ v: 0, vel: 0 })); this.fl = 0; this.scan = 0;
      this.cross = []; for (let i = 0; i < 10; i++) this.cross.push({ i: 1 + ((Math.random() * 14) | 0), j: 1 + ((Math.random() * 8) | 0), a: 0 });
    },
    note(lane, p, m) {
      const rows = Math.max(4, Math.floor(m.h / this.gs));
      if (lane === 'lead' || lane === 'amb') {
        if (lane === 'amb' && Math.random() < 0.5) return;
        this.tg.push({ i: clamp(2 + Math.round(p * 1.6), 1, 14), j: 1 + ((Math.random() * (rows - 2)) | 0), life: 1, born: m.t, amb: lane === 'amb' });
        if (this.tg.length > 6) this.tg.shift();
      } else if (lane === 'kick') this.blk.forEach((b, k) => { b.vel += 220 + k * 40; });
      else if (lane === 'perc') this.fl = 1;
      else if (lane === 'hat') this.cross[(Math.random() * this.cross.length) | 0].a = 1;
    },
    update(dt, m) {
      for (const t of this.tg) t.life -= dt * (t.amb ? 0.9 : 0.55);
      this.tg = this.tg.filter((t) => t.life > 0);
      for (const b of this.blk) spring(b, 0, dt, 120, 12);
      this.fl = Math.max(0, this.fl - dt * 5);
      for (const q of this.cross) q.a = Math.max(0, q.a - dt * 2);
      this.scan = fract((reduced ? 0 : m.t) * CH.missions.bpm / 60 / 4);
    },
    draw(c, m) {
      const w = m.w, h = m.h, g = this.gs;
      c.fillStyle = DEEP; c.fillRect(0, 0, w, h);
      c.fillStyle = BLUE2; c.beginPath(); c.moveTo(w * 0.15, h); c.lineTo(w * 0.55, 0); c.lineTo(w * 0.85, 0); c.lineTo(w * 0.45, h); c.closePath(); c.fill();
      c.strokeStyle = `rgba(247,248,255,${0.13 + this.fl * 0.25})`; c.lineWidth = 1; c.beginPath();
      for (let x = 0; x <= w; x += g) { c.moveTo(x + 0.5, 0); c.lineTo(x + 0.5, h); }
      for (let y = 0; y <= h; y += g) { c.moveTo(0, y + 0.5); c.lineTo(w, y + 0.5); }
      c.stroke();
      hatch(c, g * 2, g, g * 1.4, g * 1.4, 'rgba(247,248,255,.32)', 8, 3);
      hatch(c, g * 7, g * 3, g * 2.4, g, 'rgba(247,248,255,.26)', 8, 3);
      c.strokeStyle = LIME; c.lineWidth = 1.5;
      for (const q of this.cross) { c.globalAlpha = 0.35 + q.a * 0.65; const x = q.i * g, y = q.j * g; c.beginPath(); c.moveTo(x - 5, y); c.lineTo(x + 5, y); c.moveTo(x, y - 5); c.lineTo(x, y + 5); c.stroke(); }
      c.globalAlpha = 1;
      const sx = this.scan * w, grd = c.createLinearGradient(sx - 120, 0, sx, 0);
      grd.addColorStop(0, 'rgba(200,255,46,0)'); grd.addColorStop(1, 'rgba(200,255,46,.24)');
      c.fillStyle = grd; c.fillRect(sx - 120, 0, 120, h); c.fillStyle = LIME; c.fillRect(sx, 0, 1.5, h);
      c.font = `400 ${Math.max(9, w / 90)}px ${F_MONO}`; c.textBaseline = 'top';
      for (const t of this.tg) {
        const kk = outExpo(clamp((m.t - t.born) / 0.35, 0, 1)), cx = t.i * g, cy = t.j * g, s = lerp(g * 2.6, g * 0.8, kk);
        c.globalAlpha = Math.min(1, t.life * 1.6); c.strokeStyle = LIME; c.lineWidth = 1.5;
        bracket(c, cx - s / 2, cy - s / 2, s, s, s * 0.3);
        c.fillStyle = LIME; c.fillText(`TGT X${pad2(t.i)} Y${pad2(t.j)}`, cx + s / 2 + 6, cy - s / 2);
        c.setLineDash([3, 4]); c.beginPath(); c.moveTo(cx + s / 2, cy); c.lineTo(w, cy); c.stroke(); c.setLineDash([]);
      }
      c.globalAlpha = 1;
      const b = Math.max(8, w * 0.02);
      c.fillStyle = LIME; c.beginPath();
      c.moveTo(w - b, h * 0.12); c.lineTo(w, h * 0.12 - b); c.lineTo(w, h); c.lineTo(w * 0.5, h); c.lineTo(w * 0.5 + b * 1.4, h - b * 1.4); c.lineTo(w - b, h - b * 1.4); c.closePath(); c.fill();
      c.fillStyle = WHITE;
      const bw = w * 0.05, bh = h * 0.2, by = h - bh - b * 0.8;
      for (let k = 0; k < 4; k++) { const x0 = w * 0.04 + k * (bw + bh * 0.55) + this.blk[k].v * 0.6; c.beginPath(); c.moveTo(x0, by + bh); c.lineTo(x0 + bh, by); c.lineTo(x0 + bh + bw, by); c.lineTo(x0 + bw, by + bh); c.closePath(); c.fill(); }
    },
  };
  return {
    setup(m) {
      const w = m.w, h = m.h;
      this.ch = [{ x: -w * 0.1, s: h * 0.62, t: h * 0.2, a: 0.95, v: 0, sp: 14 }, { x: w * 0.3, s: h * 0.44, t: h * 0.14, a: 0.6, v: 0, sp: 22 }, { x: w * 0.62, s: h * 0.3, t: h * 0.09, a: 0.4, v: 0, sp: 30 }];
      this.rects = []; this.fl = 0; this.hat = 0;
    },
    note(lane, p, m) {
      if (lane === 'lead' || lane === 'amb') {
        if (lane === 'amb' && Math.random() < 0.5) return;
        const sz = m.h * (0.06 + (p / 7) * 0.16);
        this.rects.push({ x: Math.random() * (m.w - sz * 2.4), y: Math.random() * (m.h - sz), w: sz * (1.2 + Math.random()), h: sz, life: 1, fill: Math.random() < 0.4 });
        if (this.rects.length > 7) this.rects.shift();
      } else if (lane === 'kick') this.ch.forEach((q) => { q.v += 300; });
      else if (lane === 'perc') this.fl = 1;
      else if (lane === 'hat') this.hat = 1;
    },
    update(dt, m) {
      for (const q of this.ch) { q.v *= Math.exp(-dt * 6); if (!reduced) q.x += (q.sp + q.v) * dt; if (q.x > m.w + q.s) q.x = -q.s * 2 - q.t; }
      for (const r of this.rects) r.life -= dt * 0.7;
      this.rects = this.rects.filter((r) => r.life > 0);
      this.fl = Math.max(0, this.fl - dt * 4); this.hat = Math.max(0, this.hat - dt * 6);
    },
    draw(c, m) {
      const w = m.w, h = m.h, grd = c.createLinearGradient(0, 0, w, h);
      grd.addColorStop(0, BLUE); grd.addColorStop(1, '#0d15a8');
      c.fillStyle = grd; c.fillRect(0, 0, w, h);
      for (const q of this.ch) {
        c.globalAlpha = q.a; c.fillStyle = PERI; chevPath(c, q.x, h * 0.5, q.s, q.t); c.fill();
        c.globalAlpha = q.a * 0.7; c.strokeStyle = WHITE; c.lineWidth = 1; chevPath(c, q.x - q.t * 1.6, h * 0.5, q.s * 1.08, q.t * 0.2); c.stroke();
      }
      c.globalAlpha = 1; c.strokeStyle = 'rgba(247,248,255,.8)'; c.lineWidth = 1; c.beginPath();
      c.moveTo(w * 0.28, h * 0.25); c.lineTo(w * 0.62, h * 0.25); c.moveTo(w * 0.35, h * 0.82); c.lineTo(w * 0.74, h * 0.82); c.moveTo(w * 0.9, h * 0.12); c.lineTo(w * 0.9, h * 0.4);
      c.stroke();
      const bx = w * 0.72, by = h * 0.56, bs = h * 0.16;
      c.strokeRect(bx, by, bs, bs); c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + bs, by + bs); c.moveTo(bx + bs, by); c.lineTo(bx, by + bs); c.stroke();
      for (const r of this.rects) {
        c.globalAlpha = Math.min(1, r.life * 1.5);
        if (r.fill) { c.fillStyle = 'rgba(200,255,46,.28)'; c.fillRect(r.x, r.y, r.w, r.h); }
        c.strokeStyle = WHITE; c.strokeRect(r.x + 0.5, r.y + 0.5, r.w, r.h);
      }
      c.globalAlpha = 1;
      c.fillStyle = `rgba(200,255,46,${0.4 + this.hat * 0.6})`;
      for (let i = 0; i < 5; i++) c.fillRect(w * 0.06 + i * 10, h * 0.12, 6, 6);
      if (this.fl > 0) { c.fillStyle = `rgba(247,248,255,${this.fl * 0.6})`; c.fillRect(0, h * (1 - this.fl), w, 2); }
    },
  };
}
class Monitor {
  constructor(cv, key) {
    this.cv = cv; this.ctx = cv.getContext('2d'); this.key = key; this.motif = null; this.vis = false; this.t = 0; this.ab = 0; this.w = 0; this.h = 0; this.dpr = 1; this.dirty = true;
    MONS.push(this);
    if (window.ResizeObserver) new ResizeObserver(() => this.resize()).observe(cv.parentElement);
    if (window.IntersectionObserver) new IntersectionObserver((es) => { for (const e of es) this.vis = e.isIntersecting; }).observe(cv.parentElement); else this.vis = true;
  }
  resize() {
    const r = this.cv.getBoundingClientRect();
    if (!r.width) return;
    this.dpr = Math.min(devicePixelRatio || 1, 2); this.w = r.width; this.h = r.height;
    this.cv.width = Math.round(r.width * this.dpr); this.cv.height = Math.round(r.height * this.dpr);
    this.motif = null; this.dirty = true;
  }
  set(k) { this.key = k; this.motif = null; this.dirty = true; }
  note(l, p) { if (this.motif) { this.motif.note(l, p, this); this.dirty = true; } }
  frame(dt) {
    if (!this.vis || !this.cv.offsetParent) return;
    if (!this.w) this.resize();
    if (!this.w) return;
    if (!this.motif) { this.motif = makeMotif(this.key); this.motif.setup(this); this.dirty = true; }
    const live = Seq.playing && Seq.key === this.key;
    if (!live && !reduced) { this.ab += dt; const bd = 60 / CH[this.key].bpm; if (this.ab >= bd) { this.ab -= bd; this.motif.note('amb', (Math.random() * 8) | 0, this); } }
    if (reduced && !this.dirty) return;
    this.t += dt;
    this.motif.update(dt, this);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.motif.draw(this.ctx, this);
    this.dirty = false;
  }
}

/* =====================================================================
   deck: channel tabs + 16-step sequencer
   ===================================================================== */
const LANES = ['lead', 'kick', 'perc', 'hat'];
const Deck = {
  key: 'jedm', cells: { lead: [], kick: [], perc: [], hat: [] }, ph: -1, drag: null, suppress: false, mon: null, hoverT: 0,
  init() {
    this.mon = new Monitor($('#mon'), 'jedm');
    this.buildLanes();
    const tabs = $$('.dk-tab');
    tabs.forEach((t) => t.addEventListener('click', () => this.setChannel(t.dataset.ch)));
    $('.dchips').addEventListener('keydown', (e) => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      let n = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i + tabs.length - 1) % tabs.length;
      else if (e.key === 'Home') n = 0; else if (e.key === 'End') n = tabs.length - 1;
      if (n < 0) return;
      e.preventDefault(); tabs[n].focus(); this.setChannel(tabs[n].dataset.ch);
    });
    $$('.prow').forEach((r) => {
      const go = () => { clearTimeout(this.hoverT); this.hoverT = setTimeout(() => this.setChannel(r.dataset.ch), 140); };
      r.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') go(); });
      r.addEventListener('focus', go);
      r.addEventListener('pointerleave', () => clearTimeout(this.hoverT));
    });
    $('#playBtn').addEventListener('click', () => { if (Seq.playing) Seq.stop(); else { AU.setOn(true); Seq.start(); } });
    $('#shuffleBtn').addEventListener('click', () => { this.shuffle(); AU.ui('blip'); });
    $('#resetBtn').addEventListener('click', () => { Seq.patterns[this.key] = Seq.fromPreset(this.key); this.render(); AU.ui('blip'); });
    this.text();
    this.render();
  },
  buildLanes() {
    const box = $('#lanes');
    box.textContent = '';
    for (const lane of LANES) {
      const row = document.createElement('div'); row.className = 'lane lane-' + lane;
      const lab = document.createElement('span'); lab.className = 'lane-l'; lab.id = 'll-' + lane; row.appendChild(lab);
      const g = document.createElement('div'); g.className = 'cells'; g.setAttribute('role', 'group'); g.setAttribute('aria-labelledby', lab.id);
      for (let i = 0; i < 16; i++) {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'cell'; b.dataset.i = i; b.dataset.lane = lane; b.tabIndex = i === 0 ? 0 : -1; b.dataset.cur = lane === 'lead' ? 'Step · drag' : 'Step';
        if (lane === 'lead') b.appendChild(document.createElement('i'));
        g.appendChild(b); this.cells[lane].push(b);
      }
      row.appendChild(g); box.appendChild(row);
    }
    box.addEventListener('click', (e) => {
      const b = e.target.closest('.cell');
      if (!b) return;
      if (this.suppress) { this.suppress = false; return; }
      const lane = b.dataset.lane, i = +b.dataset.i, P = Seq.pat;
      if (lane === 'lead') { P.lead[i].on = !P.lead[i].on; if (P.lead[i].on) this.preview('lead', P.lead[i].p); }
      else { P[lane][i] = !P[lane][i]; if (P[lane][i]) this.preview(lane); }
      this.renderCell(lane, i);
    });
    box.addEventListener('pointerdown', (e) => { const b = e.target.closest('.lane-lead .cell'); if (b) this.drag = { b, y: e.clientY, moved: false, id: e.pointerId }; });
    addEventListener('pointermove', (e) => {
      const d = this.drag;
      if (!d || e.pointerId !== d.id) return;
      if (!d.moved && Math.abs(e.clientY - d.y) > 5) { d.moved = true; try { d.b.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ } }
      if (!d.moved) return;
      const r = d.b.getBoundingClientRect(), i = +d.b.dataset.i, L = Seq.pat.lead[i];
      const p = clamp(Math.round((1 - (e.clientY - r.top) / r.height) * 7), 0, 7);
      if (L.p !== p || !L.on) { L.p = p; L.on = true; this.renderCell('lead', i); this.preview('lead', p); }
    });
    const end = () => { if (this.drag && this.drag.moved) this.suppress = true; this.drag = null; setTimeout(() => { this.suppress = false; }, 0); };
    addEventListener('pointerup', end); addEventListener('pointercancel', end);
    box.addEventListener('keydown', (e) => {
      const b = e.target.closest('.cell');
      if (!b) return;
      const lane = b.dataset.lane, i = +b.dataset.i;
      let tgt = null;
      if (e.key === 'ArrowRight') tgt = this.cells[lane][(i + 1) % 16];
      else if (e.key === 'ArrowLeft') tgt = this.cells[lane][(i + 15) % 16];
      else if (e.key === 'Home') tgt = this.cells[lane][0];
      else if (e.key === 'End') tgt = this.cells[lane][15];
      else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const dir = e.key === 'ArrowUp' ? 1 : -1;
        if (lane === 'lead') { e.preventDefault(); const L = Seq.pat.lead[i]; L.p = clamp(L.p + dir, 0, 7); L.on = true; this.renderCell('lead', i); this.preview('lead', L.p); return; }
        const li = LANES.indexOf(lane), nl = LANES[clamp(li - dir, 0, 3)];
        tgt = this.cells[nl][i];
      }
      if (!tgt) return;
      e.preventDefault();
      this.cells[tgt.dataset.lane].forEach((cb) => { cb.tabIndex = -1; }); tgt.tabIndex = 0; tgt.focus();
    });
  },
  preview(lane, p) {
    for (const m of MONS) if (m.key === this.key) m.note(lane, p);
    if (!AU.on || !AU.ctx || Seq.playing) return;
    const t = AU.ctx.currentTime + 0.005, k = this.key;
    if (lane === 'lead') AU.lead(CH[k].patch, t, Seq.freq(p)); else if (lane === 'kick') AU.kick(t, k); else if (lane === 'perc') AU.perc(t, k); else AU.hat(t, k);
  },
  renderCell(lane, i) {
    const b = this.cells[lane][i], P = Seq.pat, ch = CH[this.key];
    const label = lane === 'lead' ? 'Lead' : lane === 'kick' ? 'Kick' : lane === 'perc' ? ch.perc : ch.hat;
    if (lane === 'lead') {
      const L = P.lead[i];
      b.setAttribute('aria-pressed', String(L.on)); b.style.setProperty('--p', ((L.p + 1) / 8).toFixed(3));
      b.setAttribute('aria-label', `${label} step ${i + 1}, ${L.on ? 'on' : 'off'}, pitch ${L.p + 1} of 8`);
    } else {
      b.setAttribute('aria-pressed', String(P[lane][i]));
      b.setAttribute('aria-label', `${label} step ${i + 1}, ${P[lane][i] ? 'on' : 'off'}`);
    }
  },
  render() {
    const ch = CH[this.key];
    $('#ll-lead').textContent = 'Lead'; $('#ll-kick').textContent = 'Kick'; $('#ll-perc').textContent = ch.perc; $('#ll-hat').textContent = ch.hat;
    for (const lane of LANES) for (let i = 0; i < 16; i++) this.renderCell(lane, i);
  },
  shuffle() {
    const P = Seq.pat;
    let p = (Math.random() * 8) | 0;
    P.lead.forEach((L, i) => { p = clamp(p + ((Math.random() * 5) | 0) - 2, 0, 7); L.p = p; L.on = i % 4 === 0 ? Math.random() < 0.85 : Math.random() < 0.5; });
    P.kick = P.kick.map((_, i) => i === 0 || (i % 4 === 0 && Math.random() < 0.75) || Math.random() < 0.08);
    P.perc = P.perc.map((_, i) => i === 4 || i === 12 || Math.random() < 0.07);
    P.hat = P.hat.map((_, i) => (i % 2 ? Math.random() < 0.55 : Math.random() < 0.3));
    this.render();
  },
  playhead(s) {
    if (this.ph >= 0) for (const l of LANES) this.cells[l][this.ph].classList.remove('ph');
    this.ph = s;
    if (s >= 0) for (const l of LANES) this.cells[l][s].classList.add('ph');
  },
  playState(on) {
    $('#playBtn').setAttribute('aria-pressed', String(on));
    $('#playT').textContent = on ? 'Stop sketch' : 'Play sketch';
    $('#monitor').classList.toggle('playing', on);
    $('#monLive').textContent = on ? 'Live' : 'Idle';
  },
  text() {
    const ch = CH[this.key], m = $('#monitor');
    $('#monCode').textContent = ch.code; $('#monName').textContent = `${ch.name} // ${ch.tag}`; $('#monBpm').textContent = ch.bpm + ' BPM';
    $('#bpmV').textContent = ch.bpm; $('#scaleV').textContent = ch.scaleName;
    m.style.setProperty('--mon-ink', ch.monInk); m.style.setProperty('--mon-bg', ch.monBg);
  },
  setChannel(k) {
    if (k === this.key || !DECK.includes(k)) return;
    this.key = k; Seq.key = k;
    $$('.dk-tab').forEach((t) => { const on = t.dataset.ch === k; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
    $('#deckPanel').setAttribute('aria-labelledby', 'tab-' + k);
    this.render();
    if (this.ph >= 0) this.playhead(this.ph);
    const wipe = $('.mon-wipe b');
    if (reduced || !wipe.animate) { this.mon.set(k); this.text(); }
    else {
      wipe.style.background = CH[k].monBg === PAPER ? BLUE : CH[k].monBg;
      wipe.animate([{ transform: 'translateX(-101%)' }, { transform: 'translateX(0)', offset: 0.45 }, { transform: 'translateX(0)', offset: 0.55 }, { transform: 'translateX(101%)' }], { duration: 760, easing: 'cubic-bezier(.76,0,.24,1)' });
      setTimeout(() => { this.mon.set(k); this.text(); }, 340);
    }
    AU.ui('switch', Seq.freq(0));
  },
};

/* =====================================================================
   generated sleeves (placeholder cover art)
   ===================================================================== */
function drawSleeve(c, S, o) {
  const r = mulberry(o.seed || 1), inv = !!o.inv;
  const bg = inv ? LIME : BLUE, ink = inv ? BLUE : WHITE, acc = inv ? BLUE : LIME;
  c.save();
  c.fillStyle = bg; c.fillRect(0, 0, S, S);
  c.save(); c.beginPath(); c.moveTo(S * 0.45, S); c.lineTo(S, S * 0.45); c.lineTo(S, S); c.closePath(); c.clip();
  c.strokeStyle = inv ? 'rgba(31,43,255,.16)' : DEEP; c.lineWidth = S * 0.024;
  for (let i = -S; i < 2 * S; i += S * 0.055) { c.beginPath(); c.moveTo(i, S); c.lineTo(i + S, 0); c.stroke(); }
  c.restore();
  const ccx = S * (0.56 + r() * 0.16), ccy = S * (0.38 + r() * 0.14);
  c.strokeStyle = inv ? 'rgba(31,43,255,.55)' : 'rgba(247,248,255,.6)'; c.lineWidth = Math.max(1, S * 0.003);
  c.beginPath(); c.arc(ccx, ccy, S * 0.3, 0, Math.PI * 2); c.stroke();
  c.setLineDash([S * 0.006, S * 0.014]); c.beginPath(); c.arc(ccx, ccy, S * 0.2, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
  const n = 3 + ((r() * 3) | 0);
  for (let i = 0; i < n; i++) {
    const cx = S * (0.08 + r() * 0.6), cy = S * (0.3 + r() * 0.6), len = S * (0.25 + r() * 0.7), ww = S * (0.05 + r() * 0.15);
    c.fillStyle = i === 0 ? acc : inv ? (i % 2 ? '#a9e01f' : DEEP) : (i % 2 ? PERI : BLUE2);
    c.globalAlpha = i === 0 ? 1 : 0.9; c.beginPath(); slabPath(c, cx, cy, -len / 2, len / 2, ww, r() < 0.5 ? 'h' : 'v'); c.fill();
  }
  c.globalAlpha = 1;
  hatch(c, S * (0.06 + r() * 0.08), S * (0.2 + r() * 0.25), S * 0.06, S * 0.28, ink, S * 0.034, S * 0.014);
  c.strokeStyle = acc; c.lineWidth = Math.max(1, S * 0.004);
  for (let i = 0; i < 3; i++) { const x = S * r(), y = S * (0.5 + r() * 0.5); c.beginPath(); c.moveTo(x, y); c.lineTo(x + S * 0.4, y - S * 0.4); c.stroke(); }
  c.fillStyle = ink; c.textBaseline = 'top';
  c.font = `400 ${Math.round(S * 0.026)}px ${F_UI}`;
  c.fillText('CELESNICA', S * 0.06, S * 0.06);
  c.textAlign = 'right'; c.fillText(o.code || '', S * 0.94, S * 0.06); c.textAlign = 'left';
  const title = o.title || '';
  if (o.cjk) c.font = `900 ${Math.round(S * 0.27)}px ${F_CJK}`;
  else {
    setStretch(c);
    let fs = S * 0.15; c.font = `400 ${Math.round(fs)}px ${F_DISP}`;
    while (c.measureText(title).width > S * 0.86 && fs > 10) { fs *= 0.92; c.font = `400 ${Math.round(fs)}px ${F_DISP}`; }
  }
  c.textBaseline = 'alphabetic';
  const tx = S * 0.06, ty = S * 0.84, cutY = ty - S * (o.cjk ? 0.12 : 0.05);
  c.save(); c.beginPath(); c.rect(0, 0, S, cutY); c.clip(); c.fillText(title, tx, ty); c.restore();
  c.save(); c.beginPath(); c.rect(0, cutY + S * 0.008, S, S); c.clip(); c.fillText(title, tx + S * 0.022, ty); c.restore();
  try { c.fontStretch = 'normal'; } catch (e) { /* unsupported */ }
  c.font = `400 ${Math.round(S * 0.024)}px ${F_UI}`; c.fillStyle = inv ? 'rgba(31,43,255,.8)' : 'rgba(247,248,255,.8)';
  c.fillText((o.sub || '').toUpperCase(), tx, S * 0.92);
  c.restore();
}

/* =====================================================================
   hero: diagram, scope wave, 45° angle lock
   ===================================================================== */
const Hero = {
  el: null, mx: 0, my: 0, inside: false, px: 0, py: 0, th: 0, lockT: -10, lastAng: '', s: 1, cx: 0, cy: 0, w: 0, h: 0, dpr: 1, top: 0, left: 0,
  init() {
    this.el = $('#hero'); this.par = $('#dgPar'); this.orb = $('#orbDot'); this.bars = $$('#dgBars rect'); this.blade = $('#dgBlade');
    this.cv = $('#scope'); this.ctx = this.cv.getContext('2d'); this.angV = $('#angV'); this.angH = $('#angH');
    if (window.ResizeObserver) new ResizeObserver(() => this.layout()).observe(this.el);
    this.el.addEventListener('pointermove', (e) => {
      this.mx = e.clientX; this.my = e.clientY; this.inside = e.pointerType === 'mouse';
      const r = this.el.getBoundingClientRect();
      this.el.style.setProperty('--hx', (e.clientX - r.left) + 'px'); this.el.style.setProperty('--hy', (e.clientY - r.top) + 'px');
    });
    this.el.addEventListener('pointerleave', () => { this.inside = false; });
    if (!FINE) this.angH.textContent = 'Tap to strike';
    ticks($('#heroTicks'), 1000, 400, 254, 96, 8);
    this.layout();
  },
  layout() {
    const r = this.el.getBoundingClientRect();
    if (!r.width) return;
    this.w = r.width; this.h = r.height; this.dpr = Math.min(devicePixelRatio || 1, 2);
    this.cv.width = Math.round(this.w * this.dpr); this.cv.height = Math.round(this.h * this.dpr);
    this.s = Math.max(this.w / 1600, this.h / 1000);
    this.cx = (this.w - 1600 * this.s) / 2 + 1000 * this.s; this.cy = (this.h - 1000 * this.s) / 2 + 400 * this.s;
    // measure where the diagram centre actually lands (the svg box need not match this.el exactly)
    const svgM = $('#heroDg') && $('#heroDg').getScreenCTM();
    if (svgM) { this.s = svgM.a; this.cx = svgM.a * 1000 + svgM.e - r.left; this.cy = svgM.d * 400 + svgM.f - r.top; }
    // park the metallic C on the diagram core; fit it into the free band above the wordmark and
    // slide the whole diagram (rings, scope, 45° lock centre) with it so everything stays concentric
    const hc = $('#heroC');
    this.dx = 0; this.dy = 0;
    if (hc) {
      const top = $('.hero-top').getBoundingClientRect(), bot = $('.hero-bot').getBoundingClientRect();
      const a = top.bottom - r.top, b = bot.top - r.top;
      let x = this.cx, y = this.cy, size = 128 * this.s * 1.9;
      if (this.w < 900) {
        size = clamp((b - a) * 0.78, 96, Math.min(this.w * 0.5, 230));
        x = this.w * 0.5; y = a + (b - a) / 2;
        // narrow screens: the C is centred, so the rings, text ring and scope follow it
        this.dx = x - this.cx; this.dy = y - this.cy; this.cx = x; this.cy = y;
      } else if (b - a > 60) {
        size = Math.min(size, (b - a) * 0.9);
        const lo = a + size / 2 + 6, hi = b - size / 2 - 6;
        y = hi < lo ? (a + b) / 2 : clamp(this.cy, lo, hi);
        this.dy = y - this.cy; this.cy = y;
      }
      hc.style.setProperty('--hcx', x.toFixed(1) + 'px'); hc.style.setProperty('--hcy', y.toFixed(1) + 'px'); hc.style.setProperty('--hcs', size.toFixed(1) + 'px');
    }
    if (this.par) this.par.setAttribute('transform', `translate(${((this.px + this.dx) / this.s).toFixed(2)} ${((this.py + this.dy) / this.s).toFixed(2)})`);
  },
  lock() {
    this.lockT = tAll;
    this.el.classList.add('locked');
    this.blade.classList.remove('on'); void this.blade.getBBox(); this.blade.classList.add('on');
    WM.hitU(WM.Wu * 0.5 + 4);
    Field.strike(this.left + this.cx, this.top + this.cy);
    AU.ui('lock');
    this.angH.textContent = '45° found'; $('#live').textContent = '45 degrees found';
    setTimeout(() => { this.el.classList.remove('locked'); this.angH.textContent = 'Find the 45°'; }, 1600);
  },
  frame(dt) {
    if (Router.cur !== 'home' || !this.w) return;
    const r = this.el.getBoundingClientRect();
    if (r.bottom < 0) return;
    this.top = r.top; this.left = r.left;
    const kk = Field.kk;
    if (!reduced) {
      this.th += dt * (0.32 + kk * 0.5);
      const ex = 450 * Math.cos(this.th), ey = 122 * Math.sin(this.th), a = -14 * Math.PI / 180;
      this.orb.setAttribute('cx', (1000 + ex * Math.cos(a) - ey * Math.sin(a)).toFixed(1));
      this.orb.setAttribute('cy', (400 + ex * Math.sin(a) + ey * Math.cos(a)).toFixed(1));
      this.bars.forEach((b, i) => { b.style.transform = `scaleY(${(0.3 + 0.7 * Math.abs(Math.sin(tAll * 2.1 + i * 1.7)) * (0.55 + kk * 0.6)).toFixed(3)})`; });
      const tx = this.inside ? -((this.mx - r.left) / this.w - 0.5) * 22 : 0, ty = this.inside ? -((this.my - r.top) / this.h - 0.5) * 14 : 0;
      this.px = lerp(this.px, tx, 0.06); this.py = lerp(this.py, ty, 0.06);
      this.par.setAttribute('transform', `translate(${((this.px + (this.dx || 0)) / this.s).toFixed(2)} ${((this.py + (this.dy || 0)) / this.s).toFixed(2)})`);
    }
    if (this.inside && FINE) {
      const dx = this.mx - r.left - this.cx, dy = this.my - r.top - this.cy, dist = Math.hypot(dx, dy);
      const ang = (Math.atan2(-dy, dx) * 180 / Math.PI + 360) % 360;
      const txt = `∠ ${ang.toFixed(1).padStart(5, '0')}°`;
      if (txt !== this.lastAng) { this.angV.textContent = txt; this.lastAng = txt; }
      if (dist > 70 && (Math.abs(ang - 45) < 1.2 || Math.abs(ang - 225) < 1.2) && tAll - this.lockT > 2) this.lock();
    }
    this.scope(dt, r);
  },
  scope(dt, r) {
    const c = this.ctx, w = this.w, h = this.h, y0 = this.cy, t = reduced ? 0 : tAll, kk = Field.kk;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); c.clearRect(0, 0, w, h);
    const A = 5 + kk * 22, live = AU.ctx && AU.on && Seq.playing;
    if (live) AU.an.getByteTimeDomainData(AU.tdata);
    const lmx = this.mx - r.left, lmy = this.my - r.top, bumpOn = this.inside && !reduced, N = live ? AU.tdata.length : 0;
    const yAt = (x, ph) => {
      let y = y0 + A * (Math.sin(x * 0.011 + t * 2.6 + ph) * 0.55 + Math.sin(x * 0.027 - t * 4.1) * 0.3 + Math.sin(x * 0.003 + t * 0.7) * 0.4);
      if (live) y += ((AU.tdata[((x / w) * N) | 0] - 128) / 128) * h * 0.1;
      if (bumpOn) { const g = Math.exp(-((x - lmx) * (x - lmx)) / 16200); y += clamp(lmy - y0, -170, 170) * 0.32 * g; }
      return y;
    };
    c.lineWidth = 1; c.strokeStyle = 'rgba(200,255,46,.9)'; c.beginPath();
    for (let x = 0; x <= w; x += 4) { const y = yAt(x, 0.9) + 3; x ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.stroke();
    c.lineWidth = 1.6; c.strokeStyle = 'rgba(247,248,255,.95)'; c.beginPath();
    for (let x = 0; x <= w; x += 4) { const y = yAt(x, 0); x ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.stroke();
  },
};
const Roles = {
  i: 0,
  init() {
    this.els = $$('#roles span');
    setInterval(() => {
      if (Router.cur !== 'home' || document.hidden) return;
      this.els[this.i].classList.remove('on');
      this.i = (this.i + 1) % this.els.length;
      this.els[this.i].classList.add('on');
    }, 2200);
  },
};

/* =====================================================================
   featured release tuner
   ===================================================================== */
const Tuner = {
  f: 45, from: 45, to: 45, tw: 1, twDur: 0, drag: false, near: 1, shown: -1, locked: false, sig: 1, arts: [], vis: false, S: 0, dpr: 1, t: 0, scaleW: 0, flash: 0,
  init() {
    this.cv = $('#scr'); this.ctx = this.cv.getContext('2d'); this.needle = $('#needle'); this.scale = $('#dialScale');
    let h = '';
    for (let i = 0; i <= 50; i++) { const f = 40 + i * 0.2, x = (i / 50) * 100, major = i % 5 === 0; h += `<i class="${major ? 'm' : ''}" style="left:${x}%"></i>`; if (major) h += `<span style="left:${x}%">${f.toFixed(1)}</span>`; }
    TUNE.forEach((ch) => { h += `<b class="dial-ch" style="left:${(ch.f - 40) * 10}%;top:auto"><svg><use href="#i-star"/></svg>${ch.code}</b>`; });
    this.scale.innerHTML = h;
    $('#dialChips').innerHTML = TUNE.map((ch, i) => `<button class="dchip jr-opt" type="button" data-i="${i}" aria-pressed="false" data-cur="Tune"><b>${ch.code}</b>${ch.chip}</button>`).join('');
    $$('#dialChips .dchip').forEach((b) => b.addEventListener('click', () => { this.tweenTo(TUNE[+b.dataset.i].f); AU.setOn(AU.on); }));
    this.noise = document.createElement('canvas'); this.noise.width = this.noise.height = 96; this.nctx = this.noise.getContext('2d'); this.nimg = this.nctx.createImageData(96, 96);
    this.arts = TUNE.map((ch) => { if (!ch.art) return null; const cv = document.createElement('canvas'); cv.width = cv.height = 640; drawSleeve(cv.getContext('2d'), 640, ch.art); return cv; });
    const dial = $('#dial');
    const fx = (e) => { const r = this.scale.getBoundingClientRect(); return 40 + clamp((e.clientX - r.left) / r.width, 0, 1) * 10; };
    dial.addEventListener('pointerdown', (e) => { this.drag = true; this.tw = 1; try { dial.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ } this.setF(fx(e)); this.needle.focus({ preventScroll: true }); });
    dial.addEventListener('pointermove', (e) => { if (this.drag) this.setF(fx(e)); });
    const up = () => { if (!this.drag) return; this.drag = false; this.snap(); };
    dial.addEventListener('pointerup', up); dial.addEventListener('pointercancel', up);
    this.needle.addEventListener('keydown', (e) => {
      let f = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') f = this.f + 0.1;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') f = this.f - 0.1;
      else if (e.key === 'PageUp') { const n = TUNE.find((c) => c.f > this.f + 0.05); if (n) return e.preventDefault(), this.tweenTo(n.f); }
      else if (e.key === 'PageDown') { const n = [...TUNE].reverse().find((c) => c.f < this.f - 0.05); if (n) return e.preventDefault(), this.tweenTo(n.f); }
      else if (e.key === 'Home') f = 40; else if (e.key === 'End') f = 50;
      if (f === null) return;
      e.preventDefault(); this.tw = 1; this.setF(Math.round(f * 10) / 10); clearTimeout(this.kt); this.kt = setTimeout(() => this.snap(), 700);
    });
    if (window.ResizeObserver) { new ResizeObserver(() => this.size()).observe($('#screen')); new ResizeObserver(() => { this.scaleW = this.scale.clientWidth; this.setF(this.f); }).observe(this.scale); }
    if (window.IntersectionObserver) new IntersectionObserver((es) => { for (const e of es) this.vis = e.isIntersecting; }).observe($('#screen')); else this.vis = true;
    this.setF(45);
  },
  size() { const r = this.cv.getBoundingClientRect(); if (!r.width) return; this.dpr = Math.min(devicePixelRatio || 1, 2); this.S = r.width; this.cv.width = this.cv.height = Math.round(r.width * this.dpr); },
  snap() { let best = null, bd = 9; for (const ch of TUNE) { const d = Math.abs(ch.f - this.f); if (d < bd) { bd = d; best = ch; } } if (best && bd < 1.1 && bd > 0.001) this.tweenTo(best.f); },
  tweenTo(f) { this.from = this.f; this.to = f; this.tw = 0; this.twDur = reduced ? 0.001 : 0.35 + Math.abs(f - this.from) * 0.09; },
  setF(f) {
    this.f = clamp(f, 40, 50);
    const x = ((this.f - 40) / 10) * (this.scaleW || this.scale.clientWidth);
    this.needle.style.setProperty('--nx', x.toFixed(1) + 'px');
    let ni = 0, nd = 99;
    TUNE.forEach((ch, i) => { const d = Math.abs(ch.f - this.f); if (d < nd) { nd = d; ni = i; } });
    this.near = ni;
    this.sig = clamp(1 - (nd - 0.04) / 0.6, 0, 1);
    const locked = nd < 0.05;
    const fs = this.f.toFixed(2);
    $('#needleR').textContent = fs; $('#scF').textContent = fs; $('#tF').textContent = fs + (locked ? ' · locked' : ' · searching');
    this.needle.setAttribute('aria-valuenow', fs);
    this.needle.setAttribute('aria-valuetext', `${fs}, ${locked ? TUNE[ni].code + ', ' + TUNE[ni].chip : 'between channels'}`);
    $$('#sig i').forEach((el, i) => el.classList.toggle('on', i < Math.round(this.sig * 4)));
    $('#scSt').textContent = locked ? 'Locked' : this.sig > 0.3 ? 'Weak signal' : 'No signal';
    $('#screen').classList.toggle('locked', locked);
    if (ni !== this.shown && this.sig > 0.25) this.show(ni);
    if (locked && !this.locked) { this.flash = 1; Field.hit(0.9); AU.ui('lock', ni * 2 - 2); }
    this.locked = locked;
  },
  show(i) {
    this.shown = i;
    const ch = TUNE[i], body = $('#tBody');
    $('#tCh').textContent = ch.code; $('#scCh').textContent = ch.code;
    $$('#dialChips .dchip').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.i === i)));
    const fill = () => {
      $('#tK').textContent = ch.k;
      const tt = $('#tT'); tt.classList.toggle('cjk', !!ch.cjk); tt.textContent = ch.t; if (!ch.cjk) scramble(tt, ch.t, 480);
      $('#tA').textContent = ch.a; $('#tN').textContent = ch.n;
      $('#tG').innerHTML = ch.g.map((g) => `<span class="chip line">${g}</span>`).join('');
      $('#tL').innerHTML = ch.l.map((l) => `<a class="btn" href="${l[1]}" target="_blank" rel="noopener" data-cur="Listen">${l[0]} <span class="ar" aria-hidden="true">↗</span></a>`).join('');
      body.classList.remove('swap');
    };
    if (reduced || this.shownOnce !== true) { this.shownOnce = true; fill(); return; }
    body.classList.add('swap'); clearTimeout(this.st); this.st = setTimeout(fill, 180);
  },
  frame(dt) {
    if (Router.cur !== 'home') { AU.staticLevel(0); return; }
    this.t += dt;
    if (this.tw < 1) { this.tw = Math.min(1, this.tw + dt / this.twDur); this.setF(lerp(this.from, this.to, inOut(this.tw))); }
    AU.staticLevel(this.drag || this.tw < 1 ? 1 - this.sig : 0, this.f);
    this.flash = Math.max(0, this.flash - dt * 2.5);
    if (!this.vis || !this.S) return;
    this.draw();
  },
  draw() {
    const c = this.ctx, S = this.S, sig = this.sig, art = this.arts[this.near];
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (art) {
      if (sig >= 0.98 || reduced) c.drawImage(art, 0, 0, S, S);
      else {
        const sl = 12, hh = S / sl;
        for (let i = 0; i < sl; i++) { const dx = (Math.random() - 0.5) * (1 - sig) * S * 0.18; c.drawImage(art, 0, (i / sl) * 640, 640, 640 / sl, dx, i * hh, S, hh + 1); }
      }
    } else this.testCard(c, S);
    if (sig < 0.995) {
      const d = this.nimg.data;
      for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255; d[i] = v * 0.78; d[i + 1] = v * 0.82; d[i + 2] = 80 + v * 0.7; d[i + 3] = 255; }
      this.nctx.putImageData(this.nimg, 0, 0);
      c.save(); c.imageSmoothingEnabled = false; c.globalAlpha = reduced ? (1 - sig) * 0.7 : clamp((1 - sig) * 0.95 + 0.03, 0, 1); c.drawImage(this.noise, 0, 0, S, S); c.restore();
    }
    c.fillStyle = 'rgba(10,15,134,.08)';
    for (let y = 0; y < S; y += 4) c.fillRect(0, y, S, 1);
    if (this.flash > 0) { c.fillStyle = `rgba(200,255,46,${this.flash * 0.5})`; c.fillRect(0, 0, S, S); }
  },
  testCard(c, S) {
    const t = reduced ? 0 : this.t, px = Math.round(S * this.dpr);
    if (!this.riso || this.riso.width !== px) {
      const ready = !document.fonts || document.fonts.check(`400 20px "CEL Black"`);
      const card = risoCard(px); if (ready) this.riso = card; else { c.drawImage(card, 0, 0, S, S); return; }
    }
    c.drawImage(this.riso, 0, 0, S, S);
    const cx = S * 0.62, cy = S * 0.42, R = S * 0.29, an = -0.55 + t * 0.4;
    c.save(); c.globalCompositeOperation = 'multiply'; c.strokeStyle = BLUE; c.lineWidth = Math.max(1.2, S * 0.003);
    c.beginPath(); c.moveTo(cx - Math.cos(an) * R * 1.12, cy - Math.sin(an) * R * 1.12); c.lineTo(cx + Math.cos(an) * R * 1.12, cy + Math.sin(an) * R * 1.12); c.stroke();
    c.restore();
    const q = S * 0.024, qx = cx + Math.cos(an) * R, qy = cy + Math.sin(an) * R;
    c.fillStyle = LIME; c.fillRect(qx - q / 2 + S * 0.004, qy - q / 2 + S * 0.003, q, q);
    c.fillStyle = BLUE; c.fillRect(qx - q / 2, qy - q / 2, q, q);
  },
};

/* =====================================================================
   statement arc, alias scrubber, counters
   ===================================================================== */
const Arc = {
  vis: false, t: 0,
  init() {
    this.p = $('#arcP'); this.d = $('#arcDot');
    try { this.L = this.p.getTotalLength(); } catch (e) { this.L = 0; }
    if (window.IntersectionObserver) new IntersectionObserver((es) => { for (const e of es) this.vis = e.isIntersecting; }).observe($('#stDg'));
  },
  frame(dt) {
    if (!this.vis || !this.L || reduced || Router.cur !== 'home') return;
    this.t = (this.t + dt * 0.28) % 1.25;
    const q = clamp(this.t, 0, 1), pt = this.p.getPointAtLength(inOut(q) * this.L);
    this.d.setAttribute('cx', pt.x.toFixed(1)); this.d.setAttribute('cy', pt.y.toFixed(1));
  },
};
const MARKS = [
  { p: 0.03, l: 'Before', t: 'Commercial EDM and collaborative projects as No-One CN' },
  { p: 0.28, l: '2024', t: 'Shortlisted for Music China 2024' },
  { p: 0.5, l: '2025.08', t: 'S A N C T U M released on 2088 RECORDS as No-One CN' },
  { p: 0.72, l: 'Early 2026', t: 'Launched Celesnica' },
  { p: 0.86, l: '2026', t: 'Won Vesk Green’s “未眠 (No Sleep)” Remix Contest' },
  { p: 0.98, l: 'Now', t: 'Building Celesnica across Instagram, Spotify and SoundCloud' },
];
const Era = {
  p: 0.98, era: 'celesnica', drag: false, w: 0,
  init() {
    this.track = $('#track'); this.knob = $('#knob');
    this.track.style.setProperty('--b', '72%');
    let h = '';
    MARKS.forEach((m, i) => { h += `<i class="track-mark" style="left:${m.p * 100}%" data-i="${i}"></i><span class="track-lab${i === 0 ? ' edge-l' : i === MARKS.length - 1 ? ' edge-r' : ''}" style="left:${m.p * 100}%">${m.l}</span>`; });
    this.track.insertAdjacentHTML('beforeend', h);
    this.marks = $$('.track-mark', this.track);
    const px = (e) => { const r = this.track.getBoundingClientRect(); return clamp((e.clientX - r.left) / r.width, 0, 1); };
    this.track.addEventListener('pointerdown', (e) => { this.drag = true; try { this.track.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ } this.set(px(e)); this.knob.focus({ preventScroll: true }); });
    this.track.addEventListener('pointermove', (e) => { if (this.drag) this.set(px(e)); });
    const up = () => { this.drag = false; };
    this.track.addEventListener('pointerup', up); this.track.addEventListener('pointercancel', up);
    this.knob.addEventListener('keydown', (e) => {
      let p = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') p = this.p + 0.02;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') p = this.p - 0.02;
      else if (e.key === 'PageUp') { const m = MARKS.find((x) => x.p > this.p + 0.01); p = m ? m.p : 1; }
      else if (e.key === 'PageDown') { const m = [...MARKS].reverse().find((x) => x.p < this.p - 0.01); p = m ? m.p : 0; }
      else if (e.key === 'Home') p = 0; else if (e.key === 'End') p = 1;
      if (p === null) return;
      e.preventDefault(); this.set(p);
    });
    if (window.ResizeObserver) new ResizeObserver(() => { this.w = this.track.clientWidth; this.set(this.p, true); }).observe(this.track);
    this.set(this.p, true);
  },
  set(p, quiet) {
    this.p = clamp(p, 0, 1);
    this.knob.style.setProperty('--kx', (this.p * (this.w || this.track.clientWidth)).toFixed(1) + 'px');
    let ni = -1, nd = 0.06;
    MARKS.forEach((m, i) => { const d = Math.abs(m.p - this.p); if (d < nd) { nd = d; ni = i; } });
    this.marks.forEach((el, i) => el.classList.toggle('hot', i === ni));
    $('#callout').innerHTML = ni >= 0 ? `<b>${MARKS[ni].l}</b> · ${MARKS[ni].t}` : '';
    const era = this.p >= 0.7 ? 'celesnica' : 'noone';
    this.knob.setAttribute('aria-valuenow', Math.round(this.p * 100));
    this.knob.setAttribute('aria-valuetext', `${ni >= 0 ? MARKS[ni].l + ', ' : ''}${era === 'noone' ? 'No-One CN' : 'Celesnica'}`);
    if (era !== this.era) {
      this.era = era;
      scramble($('#aliasN'), era === 'noone' ? 'No-One CN' : 'Celesnica', 520);
      $('#aliasS').textContent = era === 'noone' ? 'Before early 2026' : 'Early 2026 — now';
      $('#eraA').classList.toggle('on', era === 'noone'); $('#eraA').classList.toggle('off', era !== 'noone');
      $('#eraB').classList.toggle('on', era === 'celesnica'); $('#eraB').classList.toggle('off', era !== 'celesnica');
      if (!quiet) { AU.ui('switch', era === 'noone' ? 330 : 440); Field.hit(0.8); }
    }
  },
};
function countUp(el) {
  const n = +el.dataset.count, suf = el.dataset.suf || '', pad = +el.dataset.pad || 0, t0 = now(), dur = 1300;
  if (reduced) return;
  const put = (txt) => (el._slice ? Slice.setText(el, txt) : (el.textContent = txt));
  const tick = () => { const p = clamp((now() - t0) / dur, 0, 1), v = Math.round(outExpo(p) * n); put(String(v).padStart(pad, '0') + suf); if (p < 1) requestAnimationFrame(tick); };
  tick();
}

/* =====================================================================
   45° split titles + tapes
   ===================================================================== */
const ST = {
  list: [],
  init() {
    $$('[data-st]').forEach((el, i) => {
      const html = el.innerHTML;
      el.innerHTML = `<span class="st-a">${html}</span><span class="st-b" aria-hidden="true">${html}</span><span class="st-c" aria-hidden="true">${html}</span>`;
      el.classList.add('st');
      const o = { el, cx: 0.58, tcx: 0.58, hov: -10, w: 0, h: 0, i };
      this.list.push(o);
      const sec = el.closest('section');
      sec.addEventListener('pointermove', (e) => { if (reduced || e.pointerType !== 'mouse') return; const r = el.getBoundingClientRect(); o.tcx = clamp((e.clientX - r.left) / r.width, -0.1, 1.1); o.hov = tAll; });
      if (window.ResizeObserver) new ResizeObserver(() => { o.w = el.offsetWidth; o.h = el.offsetHeight; }).observe(el);
    });
  },
  frame(t) {
    for (const o of this.list) {
      if (!o.el.offsetParent || !o.w) continue;
      if (!reduced && t - o.hov > 1.4) o.tcx = 0.56 + Math.sin(t * 0.45 + o.i) * 0.3;
      o.cx = reduced ? 0.58 : lerp(o.cx, o.tcx, 0.1);
      const px = o.cx * o.w, hh = o.h / 2;
      o.el.style.setProperty('--ta', (px + hh).toFixed(1) + 'px'); o.el.style.setProperty('--tb', (px - hh).toFixed(1) + 'px');
    }
  },
};
const Tapes = {
  list: [], boost: 1,
  init() {
    $$('[data-tape]').forEach((t) => {
      const track = $('.tape-track', t), g = $('.tape-group', track);
      for (let i = 0; i < 3; i++) track.appendChild(g.cloneNode(true));
      this.list.push({ t, track, g, sp: +t.dataset.speed || 1, x: 0, gw: 0 });
    });
    this.measure();
    addEventListener('resize', () => this.measure());
  },
  measure() { for (const o of this.list) o.gw = o.g.offsetWidth; },
  frame(dt) {
    if (reduced) return;
    const b = 1 + clamp(Math.abs(Field.sv) / 500, 0, 7) * (Over.on ? 2 : 1), dir = Field.sv < -40 ? -1 : 1;
    this.boost = lerp(this.boost, b * (Over.on ? 4 : 1), 0.08);
    for (const o of this.list) {
      if (!o.t.offsetParent) continue;
      if (!o.gw) { o.gw = o.g.offsetWidth; if (!o.gw) continue; }
      const r = o.t.getBoundingClientRect();
      if (r.bottom < -40 || r.top > innerHeight + 40) continue;
      o.x -= o.sp * 55 * dt * this.boost * dir;
      if (o.x <= -o.gw) o.x += o.gw; else if (o.x > 0) o.x -= o.gw;
      o.track.style.transform = `translate3d(${o.x.toFixed(1)}px,0,0)`;
    }
  },
};

/* =====================================================================
   releases page
   ===================================================================== */
const Rel = {
  init() {
    $$('[data-mini]').forEach((cv) => new Monitor(cv, cv.dataset.mini));
    const draw = (cv) => { const w = cv.clientWidth; if (!w) return; const d = Math.min(devicePixelRatio || 1, 2), S = Math.round(w * d); if (cv.width === S) return; cv.width = cv.height = S; drawSleeve(cv.getContext('2d'), S, { seed: +cv.dataset.seed, inv: cv.dataset.inv === '1', title: cv.dataset.title, cjk: /[^\x00-\x7F]/.test(cv.dataset.title), sub: cv.dataset.sub, code: cv.dataset.code }); };
    this.covers = $$('canvas[data-cover]');
    this.drawAll = () => this.covers.forEach((cv) => { cv.width = 0; draw(cv); });
    if (window.ResizeObserver) { const ro = new ResizeObserver((es) => es.forEach((e) => draw(e.target))); this.covers.forEach((cv) => ro.observe(cv)); }
    this.rbs = $$('.rb');
    if (window.IntersectionObserver) {
      const io = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) this.rbs.forEach((b) => b.setAttribute('aria-current', String(b.dataset.go === e.target.dataset.proj))); }, { rootMargin: '-45% 0px -50% 0px' });
      $$('[data-proj]').forEach((s) => io.observe(s));
    }
  },
};

/* =====================================================================
   contact radar
   ===================================================================== */
const Radar = {
  a: 0, blips: [], pings: [], w: 0, dpr: 1, amb: 1.5,
  init() {
    this.el = $('#radar'); this.cv = $('#radarCv'); this.ctx = this.cv.getContext('2d');
    if (window.ResizeObserver) new ResizeObserver(() => this.size()).observe(this.el);
    this.el.addEventListener('pointerdown', (e) => {
      const r = this.cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      if (Math.hypot(x - 0.5, y - 0.5) <= 0.5) this.ping(x, y, true);
    });
  },
  size() { const r = this.cv.getBoundingClientRect(); if (!r.width) return; this.dpr = Math.min(devicePixelRatio || 1, 2); this.w = r.width; this.cv.width = this.cv.height = Math.round(r.width * this.dpr); },
  ping(x, y, user) {
    this.pings.push({ x, y, r: 0, a: 1 });
    const lab = `X.${String(Math.round(x * 100)).padStart(2, '0')} Y.${String(Math.round(y * 100)).padStart(2, '0')}`;
    this.blips.push({ x, y, life: 1, lab, user });
    if (this.blips.length > 9) this.blips.shift();
    if (user) { AU.setOn(AU.on); AU.ui('ping'); Field.hit(0.8); $('#radarL').textContent = `Ping sent · ${lab} · no reply yet`; }
  },
  frame(dt) {
    if (Router.cur !== 'contact' || !this.w) return;
    const c = this.ctx, w = this.w, cx = w / 2, R = w / 2 - 3;
    if (!reduced) {
      this.a = (this.a + dt * 1.5) % (Math.PI * 2);
      this.amb -= dt; if (this.amb <= 0) { this.amb = rand(1.6, 3.2); const an = rand(0, Math.PI * 2), rr = rand(0.12, 0.42); this.ping(0.5 + Math.cos(an) * rr, 0.5 + Math.sin(an) * rr, false); }
    } else if (this.drawn) return;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); c.clearRect(0, 0, w, w);
    c.fillStyle = 'rgba(247,248,255,.06)'; c.beginPath(); c.arc(cx, cx, R, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(247,248,255,.85)'; c.lineWidth = 1.2;
    [1, 0.25].forEach((k) => { c.beginPath(); c.arc(cx, cx, R * k, 0, Math.PI * 2); c.stroke(); });
    c.strokeStyle = 'rgba(247,248,255,.64)'; c.setLineDash([3, 7]);
    [0.75, 0.5].forEach((k) => { c.beginPath(); c.arc(cx, cx, R * k, 0, Math.PI * 2); c.stroke(); });
    c.setLineDash([]); c.strokeStyle = 'rgba(247,248,255,.4)'; c.beginPath(); c.moveTo(cx - R, cx); c.lineTo(cx + R, cx); c.moveTo(cx, cx - R); c.lineTo(cx, cx + R);
    c.moveTo(cx - R * S2, cx + R * S2); c.lineTo(cx + R * S2, cx - R * S2); c.stroke();
    c.strokeStyle = 'rgba(247,248,255,.8)'; c.beginPath();
    for (let i = 0; i < 72; i++) { const an = (i / 72) * Math.PI * 2, l = i % 6 === 0 ? 12 : 5; c.moveTo(cx + Math.cos(an) * R, cx + Math.sin(an) * R); c.lineTo(cx + Math.cos(an) * (R - l), cx + Math.sin(an) * (R - l)); }
    c.stroke();
    const a = this.a, wedge = 0.9;
    if (c.createConicGradient) {
      const g = c.createConicGradient(a - wedge, cx, cx);
      const e = wedge / (Math.PI * 2);
      g.addColorStop(0, 'rgba(200,255,46,0)'); g.addColorStop(e, 'rgba(200,255,46,.42)'); g.addColorStop(Math.min(1, e + 0.001), 'rgba(200,255,46,0)'); g.addColorStop(1, 'rgba(200,255,46,0)');
      c.fillStyle = g; c.beginPath(); c.moveTo(cx, cx); c.arc(cx, cx, R, a - wedge, a); c.closePath(); c.fill();
    }
    c.strokeStyle = LIME; c.lineWidth = 2; c.beginPath(); c.moveTo(cx, cx); c.lineTo(cx + Math.cos(a) * R, cx + Math.sin(a) * R); c.stroke();
    for (const p of this.pings) { p.r += dt * 0.55; p.a -= dt * 0.8; if (p.a <= 0) continue; c.strokeStyle = `rgba(200,255,46,${p.a})`; c.lineWidth = 1.5; c.beginPath(); c.arc(p.x * w, p.y * w, p.r * w * 0.5, 0, Math.PI * 2); c.stroke(); }
    this.pings = this.pings.filter((p) => p.a > 0);
    c.font = `400 ${Math.max(9, w / 52)}px ${F_MONO}`; c.textBaseline = 'middle';
    for (const b of this.blips) {
      b.life -= dt * (b.user ? 0.12 : 0.22);
      const ba = Math.atan2(b.y - 0.5, b.x - 0.5), diff = ((a - ba) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      const glow = diff < 0.6 ? 1 - diff / 0.6 : 0, al = clamp(b.life, 0, 1) * (0.45 + glow * 0.55);
      if (al <= 0) continue;
      c.fillStyle = b.user ? `rgba(200,255,46,${al})` : `rgba(247,248,255,${al})`;
      c.beginPath(); c.arc(b.x * w, b.y * w, b.user ? 5 : 3.5, 0, Math.PI * 2); c.fill();
      if (b.user) { c.fillText(b.lab, b.x * w + 10, b.y * w); }
    }
    this.blips = this.blips.filter((b) => b.life > 0);
    c.fillStyle = WHITE; c.beginPath(); c.arc(cx, cx, 4, 0, Math.PI * 2); c.fill();
    this.drawn = true;
  },
};

/* =====================================================================
   shutter + router + menu + tone
   ===================================================================== */
const SHUTTER_IN = { duration: 470, stagger: 48 };
const SHUTTER_OUT = { duration: 560, stagger: 44, delay: 40 };
const SHUTTER_EASING = 'cubic-bezier(.76,0,.24,1)';
const Shutter = {
  init() {
    this.el = $('#shutter');
    this.bars = $$('.sb', this.el);
    this.themeText = $('#shThemeText');
    this.themeRun = $('#shThemeRun');
    this.themeLight = $('#shThemeLight');
    this.prev = [];
    this.themeEffects = [];
  },
  async cover(label, small = 'Tuning', themed = false) {
    $('#shLabel').innerHTML = `<small>${small}</small>${label}`;
    this.el.classList.toggle('sh-themed', themed);
    this.el.hidden = false;
    const A = this.bars.map((b, i) => b.animate([
      { transform: 'translateX(-101%)' },
      { transform: 'translateX(0)' },
    ], { duration: SHUTTER_IN.duration, delay: i * SHUTTER_IN.stagger, easing: SHUTTER_EASING, fill: 'both' }));
    this.prev = A;
    if (themed) this.startTheme(label);
    try { await Promise.all(A.map((a) => a.finished)); } catch (e) { /* cancelled */ }
  },
  startTheme(label) {
    const title = label.toUpperCase();
    this.themeText.textContent = `${title} ${title} ${title}`;
    const last = this.bars.length - 1;
    const span = SHUTTER_IN.duration + last * SHUTTER_IN.stagger
      + SHUTTER_OUT.duration + last * SHUTTER_OUT.stagger + SHUTTER_OUT.delay;
    this.themeEffects = [
      this.themeRun.animate([
        { transform: 'translateX(-15vmax)' },
        { transform: 'translateX(-2vmax)' },
      ], { duration: span, easing: 'linear', fill: 'both' }),
      this.themeLight.animate([
        { transform: 'translate(-10vmax, 4vmax)', opacity: 0 },
        { opacity: 1, offset: .23 },
        { opacity: .85, offset: .76 },
        { transform: 'translate(12vmax, -3vmax)', opacity: 0 },
      ], { duration: 380, delay: SHUTTER_IN.duration, easing: 'linear', fill: 'both' }),
    ];
  },
  async reveal() {
    const n = this.bars.length;
    const A = this.bars.map((b, i) => b.animate([
      { transform: 'translateX(0)' },
      { transform: 'translateX(101%)' },
    ], { duration: SHUTTER_OUT.duration, delay: (n - 1 - i) * SHUTTER_OUT.stagger + SHUTTER_OUT.delay, easing: SHUTTER_EASING, fill: 'both' }));
    this.prev.forEach((a) => a.cancel());
    try { await Promise.all(A.map((a) => a.finished)); } catch (e) { /* cancelled */ }
    this.el.hidden = true;
    A.forEach((a) => a.cancel());
    this.themeEffects.forEach((a) => a.cancel());
    this.themeEffects = [];
  },
};
const ROUTES = ['home', 'information', 'releases', 'contact'];
const TITLES = { home: 'Home', information: 'Information', releases: 'Releases', contact: 'Contact' };
const TX = { home: 'TX 01', information: 'TX 02', releases: 'TX 03', contact: 'TX 04' };
const SUBL = { 'releases-jedm': 'J-EDM', 'releases-organic': 'Organic', 'releases-missions': 'Missions', 'releases-worlds': 'Worlds', 'releases-other': 'Remixes', 'information-links': 'Listen & follow' };
const setNav = (name) => $$('[data-nav]').forEach((a) => { if (a.dataset.nav === name) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
const parseRoute = (h) => { h = (h || '').replace(/^#/, ''); const base = h.split('-')[0]; if (!ROUTES.includes(base)) return { base: 'home', sub: null }; return { base, sub: h.includes('-') ? h : null }; };
let lastY = 0;
const Router = {
  cur: null, viewEl: null, busy: false, queued: null, views: {},
  init() {
    $$('.view').forEach((v) => { this.views[v.dataset.view] = v; });
    addEventListener('hashchange', () => { const r = parseRoute(location.hash); this.go(r.base, r.sub); });
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const name = a.getAttribute('href').slice(1);
      e.preventDefault();
      if (name === 'main') { $('#main').focus(); return; }
      Menu.close();
      const r = parseRoute(name);
      if (r.base === this.cur || location.hash.slice(1) === name) this.go(r.base, r.sub);
      else location.hash = name;
    });
    const r = parseRoute(location.hash);
    this.swap(r.base, true);
    return r.sub;
  },
  toAnchor(sub, instant) {
    const el = sub && this.viewEl ? $(`[data-anchor="${sub}"]`, this.viewEl) : null;
    const off = (this.cur === 'releases' ? 64 : 0) + 70;
    const top = el ? el.getBoundingClientRect().top + scrollY - off + (this.cur === 'releases' ? 0 : 0) : 0;
    scrollTo({ top: Math.max(0, top), behavior: instant || reduced ? 'auto' : 'smooth' });
  },
  async go(base, sub) {
    if (base === this.cur) { this.toAnchor(sub); return; }
    if (this.busy) { this.queued = [base, sub]; return; }
    this.busy = true;
    setNav(base);
    AU.ui('whoosh');
    const animated = !reduced && !!document.body.animate;
    if (animated) await Shutter.cover(sub && SUBL[sub] ? SUBL[sub] : TITLES[base], `[${pad2(ROUTES.indexOf(base) + 1)}] Tuning`, true);
    this.swap(base);
    if (sub) this.toAnchor(sub, true);
    if (animated) await Shutter.reveal();
    this.busy = false;
    if (this.queued) { const q = this.queued; this.queued = null; if (q[0] !== this.cur) this.go(q[0], q[1]); }
  },
  swap(name, initial) {
    for (const k in this.views) this.views[k].hidden = k !== name;
    this.cur = name; this.viewEl = this.views[name];
    setNav(name);
    scrollTo(0, 0); lastY = 0; Field.scrollAcc = 0;
    if (name === 'home') { WM.size(); if (!initial) WM.assemble(); Hero.layout(); }
    if (name === 'contact') requestAnimationFrame(() => Radar.size());
    Tapes.measure();
    Obs.rescan(this.viewEl);
    if (!initial) { $('#main').focus({ preventScroll: true }); $('#live').textContent = TITLES[name] + ' page'; }
    requestAnimationFrame(onScroll);
  },
};
const Menu = {
  init() {
    this.btn = $('#menuBtn'); this.el = $('#mnav');
    this.btn.addEventListener('click', () => (this.el.hidden ? this.open() : this.close()));
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && !this.el.hidden) { this.close(); this.btn.focus(); } });
    addEventListener('resize', () => { if (!this.el.hidden) this.place(); });
  },
  open() {
    this.el.hidden = false; this.btn.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; root.dataset.navTone = 'blue'; AU.ui('blip');
    this.place();
    // the menu's own liquid-metal C, mounted on first open
    if (!this.mc) {
      const t = $('#mnavTicks'); if (t) ticks(t, 200, 200, 166, 72, 6);
      this.mc = Metal.mount($('#mnavMetal'), { reveal: 1 }) || 'none';
      if (this.mc === 'none') $('.mnav-c').classList.add('nogl');
      spinOrigins();
    } else if (this.mc !== 'none') this.mc.kick();
  },
  // ring system sits in the lower-right corner, partly off-screen like the old rings; the C itself stays
  // fully visible, clear of the links and of the bottom-right player
  place() {
    const W = innerWidth, H = innerHeight, links = $$('.mnav a');
    const lr = links[links.length - 1].getBoundingClientRect();
    let size = Math.min(W * 0.92, H * 0.75, 620), half, cx, cy;
    for (let k = 0; k < 8; k++) {
      half = size * 0.2 * 1.15; cx = W - size * 0.258;
      cy = Math.min(H - size * 0.42, H - 100 - half);
      if (!(cy - half < lr.bottom + 14 && cx - half < lr.right)) break;
      size *= 0.9;
    }
    const core = $('.mnav-core');
    core.style.setProperty('--mcs', size.toFixed(0) + 'px'); core.style.setProperty('--mcx', cx.toFixed(0) + 'px'); core.style.setProperty('--mcy', cy.toFixed(0) + 'px');
  },
  close() { if (!this.el || this.el.hidden) return; this.el.hidden = true; this.btn.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; onScroll(); },
};

/* =====================================================================
   cursor, keys, overdrive, observers
   ===================================================================== */
const Cur = {
  x: -200, y: -200, w: 24, h: 24, tx: -200, ty: -200, target: null, on: false,
  init() {
    if (!FINE) return;
    this.el = $('#cur'); this.dot = $('#curDot'); this.lab = $('#curL');
    root.classList.add('reticle'); this.on = true;
    addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      this.tx = e.clientX; this.ty = e.clientY;
      this.dot.style.setProperty('--x', e.clientX + 'px'); this.dot.style.setProperty('--y', e.clientY + 'px');
    }, { passive: true });
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest ? e.target.closest('a,button,[data-cur],select,input') : null;
      if (t !== this.target) { this.target = t; this.lab.textContent = t ? t.dataset.cur || '' : ''; if (t && t.dataset.cur) AU.ui('tick'); }
    });
    addEventListener('pointerdown', () => this.el.classList.add('down'));
    addEventListener('pointerup', () => this.el.classList.remove('down'));
    document.addEventListener('pointerleave', () => { this.tx = this.ty = -200; });
  },
  frame(dt) {
    if (!this.on) return;
    let x, y, w, h;
    const t = this.target;
    if (t && t.isConnected && t.offsetParent !== null) {
      const r = t.getBoundingClientRect(), p = 6;
      x = r.left - p; y = r.top - p; w = r.width + p * 2; h = r.height + p * 2;
      if (w > 460 || h > 220) { x = this.tx - 14; y = this.ty - 14; w = h = 28; }
    } else { x = this.tx - 12; y = this.ty - 12; w = h = 24; }
    const k = reduced ? 1 : 1 - Math.exp(-dt * 24);
    this.x = lerp(this.x, x, k); this.y = lerp(this.y, y, k); this.w = lerp(this.w, w, k); this.h = lerp(this.h, h, k);
    const s = this.el.style;
    s.setProperty('--x', this.x.toFixed(1) + 'px'); s.setProperty('--y', this.y.toFixed(1) + 'px'); s.setProperty('--w', this.w.toFixed(1) + 'px'); s.setProperty('--h', this.h.toFixed(1) + 'px');
  },
};
const Over = {
  on: false,
  go() {
    if (this.on || reduced) return;
    this.on = true; root.classList.add('over');
    Field.speed = 5; $('#live').textContent = 'Overdrive mode';
    let n = 0;
    const iv = setInterval(() => { WM.glitch = 0.2; WM.spawnStreaks(3); Field.hit(1.2); for (const m of MONS) m.note('kick'); if (n++ % 2 === 0) AU.ui('blip'); }, 469);
    setTimeout(() => { clearInterval(iv); this.on = false; Field.speed = 1; root.classList.remove('over'); }, 6000);
  },
};
const Keys = {
  buf: '', map: 'asdfghjkl',
  init() {
    addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tg = e.target;
      if (tg && tg.closest && tg.closest('input,textarea,select,[contenteditable],[role="slider"]')) return;
      const k = (e.key || '').toLowerCase();
      if (k.length === 1) { this.buf = (this.buf + k).slice(-4); if (this.buf === '2088') { this.buf = ''; Over.go(); } }
      const i = this.map.indexOf(k);
      if (i < 0 || e.repeat || k.length !== 1) return;
      if (!AU.on) AU.setOn(true);
      const deg = Math.min(i, 7), oct = i === 8 ? 1 : 0;
      if (AU.ctx) AU.lead(CH[Deck.key].patch, AU.ctx.currentTime + 0.005, Seq.freq(deg, oct, Deck.key));
      for (const m of MONS) if (m.key === Deck.key) m.note('lead', deg);
      Field.hit(0.6); WM.pulse(i);
      if (Router.cur === 'contact') { const an = (i / 9) * Math.PI * 2, rr = 0.15 + (i % 3) * 0.1; Radar.ping(0.5 + Math.cos(an) * rr, 0.5 + Math.sin(an) * rr, false); }
    });
  },
};
const Obs = {
  io: null,
  init() {
    $$('[data-scr]').forEach((el) => { el.dataset.txt = el.textContent; });
    if (!window.IntersectionObserver) return;
    this.io = new IntersectionObserver((ents) => {
      for (const e of ents) {
        if (!e.isIntersecting) continue;
        const el = e.target;
        this.io.unobserve(el);
        if (el.hasAttribute('data-scr')) scramble(el, el.dataset.txt, 760);
        if (el.hasAttribute('data-sweep')) { el.classList.remove('sw'); void el.offsetWidth; el.classList.add('sw'); }
        if (el.hasAttribute('data-count')) countUp(el);
        if (el._slice) Slice.play(el);
        if (el.tagName.toLowerCase() === 'svg') el.classList.add('drawn');
        if (el.hasAttribute('data-rv')) el.classList.add('on');
      }
    }, { threshold: 0.25 });
  },
  rescan(view) {
    if (!this.io || reduced) { $$('.dg', view).forEach((s) => s.classList.add('drawn')); $$('[data-rv]', view).forEach((el) => el.classList.add('on')); return; }
    $$('[data-scr],[data-sweep],[data-count],[data-slice],[data-rv]:not(.on)', view).forEach((el) => this.io.observe(el));
    $$('.dg', view).forEach((s) => { if (!s.classList.contains('drawn')) this.io.observe(s); });
  },
};

/* =====================================================================
   shared: tick rings for the diagrams
   ===================================================================== */
function spinOrigins() {
  $$('.dg .spin').forEach((g) => {
    const c = g.querySelector('circle');
    const cx = c ? +c.getAttribute('cx') : +g.dataset.cx, cy = c ? +c.getAttribute('cy') : +g.dataset.cy;
    if (!isFinite(cx) || !isFinite(cy)) return;
    g.style.transformBox = 'view-box'; g.style.transformOrigin = `${cx}px ${cy}px`;
  });
}
function ticks(g, cx, cy, r, n, major) {
  if (g) { g.dataset.cx = cx; g.dataset.cy = cy; }
  if (!g) return;
  let h = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, m = i % major === 0, l = m ? 15 : 6;
    h += `<line class="tick${m ? ' m' : ''}" x1="${(cx + Math.cos(a) * r).toFixed(1)}" y1="${(cy + Math.sin(a) * r).toFixed(1)}" x2="${(cx + Math.cos(a) * (r - l)).toFixed(1)}" y2="${(cy + Math.sin(a) * (r - l)).toFixed(1)}"/>`;
  }
  g.innerHTML = h;
}

/* =====================================================================
   jelly option groups — a vanilla take on JellyRadio.
   A spring blob (separate springs per edge, so it stretches toward where
   it is going, swells with speed, squashes on landing) barges the chips
   it passes. An ink layer copies the labels and is clipped to the blob,
   so the text inverts exactly where the blob is, mid-flight included.
   ===================================================================== */
const JELLY = [];
class Jelly {
  constructor(root, o) {
    this.root = root;
    this.o = Object.assign({ swell: 0.2, barge: 6, shrink: 0.05, jelly: 1, bounce: 0.25, stagger: 22, stiffness: 580, k: 10 }, o);
    this.isOn = o.isOn;
    this.opts = $$('.jr-opt', root);
    root.classList.add('jr');
    this.ink = document.createElement('div');
    this.ink.className = 'jr-ink';
    this.ink.setAttribute('aria-hidden', 'true');
    this.copies = this.opts.map((el) => {
      const c = document.createElement('span');
      c.className = el.className; c.innerHTML = el.innerHTML;
      c.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
      this.ink.appendChild(c);
      return c;
    });
    root.appendChild(this.ink);
    this.e = { l: { v: 0, vel: 0 }, r: { v: 0, vel: 0 }, t: { v: 0, vel: 0 }, b: { v: 0, vel: 0 } };
    this.push = this.opts.map(() => ({ v: 0, vel: 0, at: 0, amp: 0 }));
    this.cur = -1; this.hov = -1; this.press = -1; this.dir = 1; this.rects = []; this.raf = 0; this.last = 0; this.shown = false;
    const mo = new MutationObserver(() => this.sync());
    this.opts.forEach((el) => mo.observe(el, { attributes: true, attributeFilter: ['aria-current', 'aria-selected', 'aria-pressed'] }));
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => { this.measure(); this.snap(); });
      ro.observe(root); this.opts.forEach((el) => ro.observe(el));
    }
    this.opts.forEach((el, i) => {
      el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { this.hov = i; this.kick(); } });
      el.addEventListener('pointerleave', () => { if (this.hov === i) { this.hov = -1; this.kick(); } });
      el.addEventListener('pointerdown', () => { this.press = i; this.kick(); });
    });
    const rel = () => { if (this.press >= 0) { this.press = -1; this.kick(); } };
    addEventListener('pointerup', rel); addEventListener('pointercancel', rel);
    this.measure(); this.sync(true);
    JELLY.push(this);
  }
  measure() { this.rects = this.opts.map((el) => ({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight })); }
  snap() {
    const r = this.rects[this.cur];
    if (!r || !r.w) { this.ink.style.clipPath = 'polygon(0 0,0 0,0 0)'; return; }
    this.e.l.v = r.x; this.e.r.v = r.x + r.w; this.e.t.v = r.y; this.e.b.v = r.y + r.h;
    for (const k in this.e) this.e[k].vel = 0;
    this.render(); this.kick();
  }
  sync(instant) {
    const i = this.opts.findIndex((el) => this.isOn(el));
    if (i === this.cur) return;
    const from = this.cur; this.cur = i;
    if (i < 0) { this.ink.style.clipPath = 'polygon(0 0,0 0,0 0)'; return; }
    this.measure();
    const rt = this.root, ra = this.rects[i];
    if (ra && rt.scrollWidth > rt.clientWidth + 2) rt.scrollTo({ left: Math.max(0, ra.x - (rt.clientWidth - ra.w) / 2), behavior: reduced ? 'auto' : 'smooth' });
    if (from < 0 || instant || reduced || !this.root.offsetWidth || !this.shown) { this.snap(); return; }
    const a = this.rects[from], b = this.rects[i];
    this.dir = Math.sign((b.x + b.w / 2) - (a.x + a.w / 2)) || 1;
    const t0 = now(), lo = Math.min(from, i), hi = Math.max(from, i);
    for (let j = 0; j < this.opts.length; j++) {
      if (j === from) continue;
      let amp = 0;
      if (j > lo && j < hi) amp = 1;
      else if (j === i) amp = 0.5;
      else if ((this.dir > 0 && j === i + 1) || (this.dir < 0 && j === i - 1)) amp = 0.7;
      if (!amp) continue;
      const p = this.push[j];
      p.at = t0 + Math.abs(j - from) * this.o.stagger * (j === i ? 1.6 : 1);
      p.amp = amp * this.o.barge * this.dir;
    }
    this.kick();
  }
  kick() { if (!this.raf) { this.last = 0; this.raf = requestAnimationFrame((t) => this.frame(t)); } }
  step(s, target, k, dt) {
    const zeta = clamp(1 - this.o.bounce * 1.35, 0.32, 1), c = 2 * zeta * Math.sqrt(k), n = Math.max(1, Math.ceil(dt / (1 / 240))), h = dt / n;
    for (let i = 0; i < n; i++) { s.vel += (k * (target - s.v) - c * s.vel) * h; s.v += s.vel * h; }
  }
  frame(t) {
    this.raf = 0;
    const dt = this.last ? Math.min(0.034, (t - this.last) / 1000) : 1 / 60; this.last = t;
    const r = this.rects[this.cur];
    if (!r || !r.w) return;
    this.shown = true;
    const o = this.o, k = o.stiffness, dir = this.dir;
    const kl = k * (1 + 0.55 * o.jelly), kt = k * Math.max(0.2, 1 - 0.45 * o.jelly);
    let lean = 0;
    if (this.hov >= 0 && this.hov !== this.cur && this.rects[this.hov]) lean = Math.sign(this.rects[this.hov].x - r.x) * 7;
    const tg = { l: r.x + Math.min(0, lean), r: r.x + r.w + Math.max(0, lean), t: r.y, b: r.y + r.h };
    this.step(this.e.l, tg.l, dir > 0 ? kt : kl, dt);
    this.step(this.e.r, tg.r, dir > 0 ? kl : kt, dt);
    this.step(this.e.t, tg.t, k, dt); this.step(this.e.b, tg.b, k, dt);
    const tn = now();
    let busy = this.press >= 0;
    for (const p of this.push) {
      if (p.at && tn >= p.at) { p.vel += p.amp * 30; p.at = 0; }
      if (p.at) busy = true;
      this.step(p, 0, 340, dt);
      if (Math.abs(p.v) > 0.02 || Math.abs(p.vel) > 0.5) busy = true;
    }
    for (const key in this.e) { const s = this.e[key]; if (Math.abs(s.vel) > 0.4 || Math.abs(s.v - tg[key]) > 0.05) busy = true; }
    this.render();
    if (busy) this.raf = requestAnimationFrame((tt) => this.frame(tt));
  }
  render() {
    const r = this.rects[this.cur];
    if (!r) return;
    const o = this.o, L = this.e.l.v, R = this.e.r.v, T = this.e.t.v, B = this.e.b.v;
    const w = Math.max(6, R - L), vc = (this.e.l.vel + this.e.r.vel) / 2;
    const sp = clamp(Math.abs(vc) / 1500, 0, 1);
    const stretch = clamp(w / r.w, 0.6, 2.4);
    const pr = this.press === this.cur ? 1 - o.shrink : 1;
    const hf = (1 + o.swell * sp) * Math.pow(clamp(1 / Math.sqrt(stretch), 0.74, 1.15), o.jelly) * pr;
    const cx = (L + R) / 2, cy = (T + B) / 2, hw = (w / 2) * pr, hh = ((B - T) / 2) * hf;
    const x0 = cx - hw, x1 = cx + hw, y0 = cy - hh, y1 = cy + hh;
    const kk = Math.min(o.k, hh * 0.9, hw * 0.9);
    const H = y1 - y0, bul = o.jelly * sp * H * 0.26, wst = o.jelly * clamp(stretch - 1, 0, 0.8) * H * 0.16;
    const lead = vc >= 0 ? 1 : -1, N = 6, pts = [];
    pts.push([x0, y0 + kk], [x0 + kk, y0]);
    for (let i = 1; i < N; i++) { const u = i / N; pts.push([lerp(x0 + kk, x1, u), y0 + wst * Math.sin(Math.PI * u)]); }
    pts.push([x1, y0]);
    for (let i = 1; i < N; i++) { const u = i / N; pts.push([x1 + (lead > 0 ? bul : bul * 0.3) * Math.sin(Math.PI * u), lerp(y0, y1 - kk, u)]); }
    pts.push([x1, y1 - kk], [x1 - kk, y1]);
    for (let i = 1; i < N; i++) { const u = i / N; pts.push([lerp(x1 - kk, x0, u), y1 - wst * Math.sin(Math.PI * u)]); }
    pts.push([x0, y1]);
    for (let i = 1; i < N; i++) { const u = i / N; pts.push([x0 - (lead < 0 ? bul : bul * 0.3) * Math.sin(Math.PI * u), lerp(y1, y0 + kk, u)]); }
    const cp = 'polygon(' + pts.map((p) => p[0].toFixed(1) + 'px ' + p[1].toFixed(1) + 'px').join(',') + ')';
    this.ink.style.clipPath = cp; this.ink.style.webkitClipPath = cp;
    for (let j = 0; j < this.opts.length; j++) {
      const s = this.press === j ? 1 - o.shrink : 1, tf = `translate3d(${this.push[j].v.toFixed(2)}px,0,0) scale(${s})`;
      if (tf !== this.opts[j]._tf) { this.opts[j]._tf = tf; this.opts[j].style.transform = tf; this.copies[j].style.transform = tf; }
    }
  }
}
const Jellies = {
  init() {
    const P = { swell: 0.2, barge: 6, shrink: 0.05, jelly: 1, bounce: 0.25, stagger: 22, stiffness: 580 };
    const pills = $('.pills'); if (pills) new Jelly(pills, Object.assign({}, P, { isOn: (el) => el.getAttribute('aria-current') === 'page' }));
    const tabs = $('.dchips'); if (tabs) new Jelly(tabs, Object.assign({}, P, { isOn: (el) => el.getAttribute('aria-selected') === 'true' }));
    const dial = $('#dialChips'); if (dial) new Jelly(dial, Object.assign({}, P, { stiffness: 520, isOn: (el) => el.getAttribute('aria-pressed') === 'true' }));
    const rb = $('.rbar-in'); if (rb) new Jelly(rb, Object.assign({}, P, { k: 9, isOn: (el) => el.getAttribute('aria-current') === 'true' }));
  },
};

/* =====================================================================
   LogoLoop — the engine below is the supplied component's engine, kept
   intact; mountLoop() replaces the React wrapper with plain DOM.
   ===================================================================== */
const LL = (() => {
const SMOOTH_TAU = 0.25;
const GLIDE_TAU = 0.8;
const DRAG_THRESHOLD = 6;
const MAX_FLING = 4000;
const INTRO_TIME = 0.7;
const INTRO_STAGGER = 0.45;
const HALF_SQRT_PI = Math.sqrt(Math.PI) / 2;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const toCssLength = value => (typeof value === 'number' ? `${value}px` : (value ?? undefined));

const erf = x => {
  const a = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * a);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a);
  return x < 0 ? -y : y;
};

const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const easeOut = t => 1 - Math.pow(1 - t, 3);

const smootherstep = t => t * t * t * (t * (t * 6 - 15) + 10);

const fadeMask = (size, vertical) => {
  const span = clamp(size, 0, 0.5) * 100;
  if (span <= 0) return undefined;
  const stops = [];
  for (let i = 0; i <= 12; i++) {
    stops.push(`rgba(0,0,0,${smootherstep(i / 12).toFixed(4)}) ${((span * i) / 12).toFixed(3)}%`);
  }
  for (let i = 12; i >= 0; i--) {
    stops.push(`rgba(0,0,0,${smootherstep(i / 12).toFixed(4)}) ${(100 - (span * i) / 12).toFixed(3)}%`);
  }
  return `linear-gradient(${vertical ? 'to bottom' : 'to right'}, ${stops.join(', ')})`;
};

const rotationMatrix = (degX, degY) => {
  const a = (degX * Math.PI) / 180;
  const b = (degY * Math.PI) / 180;
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const cb = Math.cos(b);
  const sb = Math.sin(b);
  return [cb, 0, sb, sa * sb, ca, -sa * cb, -ca * sb, sa, ca * cb];
};

const unproject = (m, depth, sx, sy) => {
  const den = m[8] * depth - m[2] * sx - m[5] * sy;
  if (den <= 1e-6) return null;
  const t = (m[8] * depth) / den;
  if (t <= 0) return null;
  const qx = t * sx;
  const qy = t * sy;
  const qz = depth * (1 - t);
  return [m[0] * qx + m[3] * qy + m[6] * qz, m[1] * qx + m[4] * qy + m[7] * qz];
};

const project = (m, depth, px, py) => {
  const k = depth / (depth - (m[6] * px + m[7] * py));
  return [(m[0] * px + m[1] * py) * k, (m[3] * px + m[4] * py) * k];
};

const createEngine = (root, track, config, setLayout) => {
  const query = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const st = {
    offset: 0,
    velocity: 0,
    period: 0,
    length: 0,
    box: [0, 0],
    items: [],
    snaps: [],
    pitch: 0,
    crossMax: 0,
    sizeMax: 0,
    tipMax: 0,
    geo: null,
    layout: { copies: 2, primary: 0 },
    hovered: false,
    focused: false,
    pointer: null,
    pointerInside: false,
    mag: 0,
    magU: 0,
    magReady: false,
    drag: null,
    glide: false,
    suppressUntil: 0,
    pressedAt: -1e9,
    move: null,
    hold: 0,
    seek: null,
    scrollVel: 0,
    scrollY: window.scrollY,
    scrollT: 0,
    visible: typeof IntersectionObserver === 'undefined',
    introStart: -1,
    introDone: !config.current.intro,
    itemMode: false,
    active: null,
    raf: 0,
    last: 0,
    reduced: !!query?.matches,
    destroyed: false
  };

  const collect = () => {
    const items = [];
    Array.from(track.children).forEach((list, copy) => {
      Array.from(list.children).forEach((el, index) => {
        items.push({
          el,
          copy,
          index,
          content: el.children[0] || null,
          tip: el.children[1] || null,
          center: 0,
          size: 0,
          cross: 0,
          t: '',
          o: '',
          v: '',
          z: '',
          s: '',
          p: ''
        });
      });
    });
    st.items = items;
    st.active = null;
  };

  const clearItems = () => {
    for (const it of st.items) {
      it.el.style.transform = '';
      it.el.style.opacity = '';
      it.el.style.visibility = '';
      it.el.style.zIndex = '';
      if (it.content) it.content.style.transform = '';
      if (it.tip) it.tip.style.transform = '';
      it.t = it.o = it.v = it.z = it.s = it.p = '';
    }
  };

  const geometry = () => {
    const cfg = config.current;
    const L = st.length;
    const P = st.period;
    const hc = st.crossMax;
    const w = st.sizeMax;
    const bend = clamp(cfg.bend, -1, 1);
    const geo = {
      mode: cfg.layout,
      shift: 0,
      uMin: -L / 2 - w,
      uMax: L / 2 + w,
      lead: 0,
      focus: clamp(cfg.focus, 0, 1) * 0.9,
      focusSigma: Math.max(40, L * 0.18),
      magnify: clamp(cfg.magnify, 0, 1),
      magSigma: Math.max(hc * 1.4, st.pitch * 1.1),
      amp: 0,
      k: 0,
      R: 0,
      sign: 1,
      limit: 0,
      C: 0,
      alpha: 0,
      depth: 0,
      pf: 1,
      tilted: false,
      tiltX: 0,
      tiltY: 0,
      m: [1, 0, 0, 0, 1, 0, 0, 0, 1],
      persp: 0
    };
    let pad = cfg.scaleOnHover ? hc * 0.1 : 0;
    const lens = (1 + geo.focus) * (1 + geo.magnify) - 1;
    if (geo.mode === 'wave') {
      geo.amp = bend * (hc * 0.6 + L * 0.035);
      geo.k = (2 * Math.PI) / Math.max(1, L / 1.25);
      pad += Math.abs(geo.amp) + (lens * hc) / 2 + hc * 0.08;
    } else if (geo.mode === 'arc' && Math.abs(bend) > 0.005) {
      const edge = Math.abs(bend) * (Math.PI / 4);
      const R = L / 2 / Math.sin(edge);
      const sag = R * (1 - Math.cos(edge));
      geo.R = R;
      geo.sign = Math.sign(bend);
      geo.shift = sag / 2;
      geo.limit = Math.PI * 0.6;
      const reach = R * Math.min(Math.PI / 2, Math.asin(Math.min(1, (L / 2 + w) / R))) + w;
      geo.uMin = -reach;
      geo.uMax = reach;
      pad += sag / 2 + (w / 2) * Math.sin(edge) + (lens * hc) / 2;
    } else if (geo.mode === 'orbit') {
      const R = Math.max(40, L * 0.43 - w * 0.2);
      const k = Math.max(1, Math.round((2 * Math.PI * R) / P));
      const alpha = Math.sign(bend) * Math.atan2(Math.abs(bend) * Math.max(hc * 2, R * 0.36), R);
      const depth = R * 5;
      const pf = depth / (depth - R * Math.cos(alpha));
      const pb = depth / (depth + R * Math.cos(alpha));
      const yf = R * Math.sin(alpha) * pf;
      const yb = -R * Math.sin(alpha) * pb;
      const grow = (1 + lens) * (cfg.scaleOnHover ? 1.2 : 1);
      const lo = Math.min(yf - (hc * pf * grow) / 2, yb - (hc * pb) / 2);
      const hi = Math.max(yf + (hc * pf * grow) / 2, yb + (hc * pb) / 2);
      geo.R = R;
      geo.C = k * P;
      geo.alpha = alpha;
      geo.depth = depth;
      geo.pf = pf;
      geo.shift = (lo + hi) / 2;
      geo.uMin = -geo.C / 2;
      geo.uMax = geo.C / 2;
      pad = Math.max(0, (hi - lo) / 2 - hc / 2);
    } else {
      pad += (lens * hc) / 2;
    }
    if (cfg.labels === 'hover') pad += cfg.vertical ? st.tipMax : hc * 0.2 + Math.max(11, hc * 0.26) * 1.3;
    const tx = clamp(cfg.tiltX, -60, 60);
    const ty = clamp(cfg.tiltY, -60, 60);
    if (Math.abs(tx) > 0.01 || Math.abs(ty) > 0.01) {
      geo.tilted = true;
      geo.tiltX = tx;
      geo.tiltY = ty;
      geo.m = rotationMatrix(tx, ty);
      geo.persp = Math.max(L, 480) * 1.3;
      const edge = L / 2 + w;
      const along = s => {
        const p = cfg.vertical ? unproject(geo.m, geo.persp, 0, s) : unproject(geo.m, geo.persp, s, 0);
        if (!p) return Math.sign(s) * L * 4;
        return clamp(cfg.vertical ? p[1] : p[0], -L * 4, L * 4);
      };
      const a = along(-edge);
      const b = along(edge);
      geo.uMin = Math.min(geo.uMin, a, b) - w;
      geo.uMax = Math.max(geo.uMax, a, b) + w;
      const band = hc / 2 + pad;
      let reach = band;
      for (const u of [a, b, 0]) {
        for (const v of [-band, band]) {
          const q = cfg.vertical ? project(geo.m, geo.persp, v, u) : project(geo.m, geo.persp, u, v);
          reach = Math.max(reach, Math.abs(cfg.vertical ? q[0] : q[1]));
        }
      }
      pad = reach - hc / 2;
    }
    const extra = cfg.links ? 2 : 0;
    geo.lead = (Math.max(0, Math.ceil((-geo.uMin - L / 2) / P)) + extra) * P;
    const copies = Math.max(2, Math.ceil((geo.uMax + L / 2 + geo.lead) / P) + 2 + (extra ? 1 : 0));
    const primary = Math.min(copies - 1, Math.floor((geo.lead + L / 2) / P));
    st.geo = geo;
    root.style.setProperty('--logoloop-pad', `${Math.ceil(pad)}px`);
    root.style.perspective = geo.tilted ? `${geo.persp}px` : '';
    track.style.transformOrigin = geo.tilted ? (cfg.vertical ? `50% ${L / 2}px` : `${L / 2}px 50%`) : '';
    if (copies !== st.layout.copies || primary !== st.layout.primary) {
      st.layout = { copies, primary };
      setLayout(st.layout);
    }
  };

  const measure = () => {
    const cfg = config.current;
    const lists = track.children;
    if (!lists.length || !st.items.length) {
      st.period = 0;
      return;
    }
    if (cfg.vertical) {
      const parentHeight = root.parentElement?.clientHeight ?? 0;
      if (parentHeight > 0 && root.style.height !== `${Math.ceil(parentHeight)}px`) {
        root.style.height = `${Math.ceil(parentHeight)}px`;
      }
    } else if (root.style.height) {
      root.style.height = '';
    }
    track.style.transform = 'none';
    clearItems();
    const rootRect = root.getBoundingClientRect();
    const k = root.offsetWidth ? rootRect.width / root.offsetWidth || 1 : 1;
    const trackRect = track.getBoundingClientRect();
    const origin = cfg.vertical ? trackRect.top : trackRect.left;
    let crossMax = 0;
    let sizeMax = 0;
    let tipMax = 0;
    for (const it of st.items) {
      const r = it.el.getBoundingClientRect();
      it.center = ((cfg.vertical ? r.top + r.height / 2 : r.left + r.width / 2) - origin) / k;
      it.size = (cfg.vertical ? r.height : r.width) / k;
      it.cross = (cfg.vertical ? r.width : r.height) / k;
      crossMax = Math.max(crossMax, it.cross);
      sizeMax = Math.max(sizeMax, it.size);
      if (it.tip && it.copy === 0) tipMax = Math.max(tipMax, it.tip.offsetWidth);
    }
    const a = lists[0].getBoundingClientRect();
    const b = lists[1] ? lists[1].getBoundingClientRect() : null;
    st.period = (b ? (cfg.vertical ? b.top - a.top : b.left - a.left) : cfg.vertical ? a.height : a.width) / k;
    const cs = getComputedStyle(root);
    st.box = [root.offsetWidth, root.offsetHeight];
    st.length = cfg.vertical
      ? root.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
      : root.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    st.crossMax = crossMax;
    st.sizeMax = sizeMax;
    st.tipMax = tipMax + crossMax * 0.25;
    const first = st.items.filter(it => it.copy === 0);
    st.pitch = first.length ? st.period / first.length : st.period;
    st.snaps = first.map(it => it.center);
    st.itemMode = false;
    if (st.period <= 0) return;
    geometry();
  };

  const pointerU = () => {
    const geo = st.geo;
    if (!st.pointer || !geo) return null;
    const cfg = config.current;
    let sx = st.pointer[0] - st.box[0] / 2;
    let sy = st.pointer[1] - st.box[1] / 2;
    if (geo.tilted) {
      const p = unproject(geo.m, geo.persp, sx, sy);
      if (!p) return null;
      sx = p[0];
      sy = p[1];
    }
    const s = cfg.vertical ? sy : sx;
    if (geo.mode === 'arc' && geo.R) return geo.R * Math.asin(clamp(s / geo.R, -1, 1));
    if (geo.mode === 'orbit') return Math.asin(clamp(s / (geo.R * geo.pf), -1, 1));
    return s;
  };

  const snapTarget = (from, dir) => {
    const P = st.period;
    const base = st.length / 2 + (st.geo?.lead ?? 0);
    let best = null;
    for (const c of st.snaps) {
      const s = c - base;
      const candidate = dir > 0 ? s + P * Math.ceil((from + 0.5 - s) / P) : s + P * Math.floor((from - 0.5 - s) / P);
      if (best === null || (dir > 0 ? candidate < best : candidate > best)) best = candidate;
    }
    return best ?? from;
  };

  const nearestSnap = value => {
    const P = st.period;
    const base = st.length / 2 + (st.geo?.lead ?? 0);
    let best = value;
    let dist = Infinity;
    for (const c of st.snaps) {
      const s = c - base;
      const candidate = s + P * Math.round((value - s) / P);
      if (Math.abs(candidate - value) < dist) {
        dist = Math.abs(candidate - value);
        best = candidate;
      }
    }
    return best;
  };

  const startMove = (target, duration) => {
    st.move = { from: st.offset, delta: target - st.offset, t: 0, dur: duration };
  };

  const stepTiming = speed => {
    const cycle = st.pitch / Math.max(1, Math.abs(speed));
    const move = clamp(cycle * 0.55, 0.35, 0.9);
    return { move, hold: Math.max(0.35, cycle - move) };
  };

  const write = (it, key, prop, value, target) => {
    if (it[key] !== value) {
      it[key] = value;
      target.style[prop] = value;
    }
  };

  const render = now => {
    const cfg = config.current;
    const geo = st.geo;
    const L = st.length;
    const half = L / 2;
    const T = -st.offset - geo.lead;
    const lineT = cfg.vertical
      ? `translate3d(0px, ${T.toFixed(2)}px, 0px)`
      : `translate3d(${T.toFixed(2)}px, 0px, 0px)`;
    track.style.transform = geo.tilted ? `rotateX(${geo.tiltX}deg) rotateY(${geo.tiltY}deg) ${lineT}` : lineT;
    const introRunning = st.introStart >= 0;
    const elapsed = introRunning ? (now - st.introStart) / 1000 : 0;
    const lensFocus = geo.mode === 'orbit' ? clamp(cfg.focus, 0, 1) * 0.9 : geo.focus;
    const lensMag = geo.magnify * st.mag;
    const cursorActive = lensMag > 0 && st.mag > 0.5 && geo.mode !== 'orbit';
    const wantsActive = cfg.focus > 0 || cfg.step || cursorActive;
    const needItems = geo.mode !== 'line' || lensFocus > 0 || lensMag > 0.0005 || introRunning;
    if (!needItems && st.itemMode) clearItems();
    st.itemMode = needItems;
    if (!needItems && !wantsActive) {
      if (st.active) {
        st.active.el.removeAttribute('data-active');
        st.active = null;
      }
      return;
    }
    let best = null;
    let bestDist = Infinity;
    for (const it of st.items) {
      const u = T + it.center - half;
      let x = u;
      let y = 0;
      let rot = 0;
      let scale = 1;
      let opacity = 1;
      let z = '';
      let hidden = false;
      let dist = Math.abs(u);
      if (geo.mode === 'orbit') {
        if (u < -geo.C / 2 || u >= geo.C / 2) {
          hidden = true;
        } else {
          const th = (2 * Math.PI * u) / geo.C;
          const Z = geo.R * Math.cos(th);
          const p = geo.depth / (geo.depth - Z * Math.cos(geo.alpha));
          x = geo.R * Math.sin(th) * p;
          y = Z * Math.sin(geo.alpha) * p - geo.shift;
          scale = p;
          if (lensFocus > 0) scale *= 1 + lensFocus * Math.exp(-((th / 0.55) ** 2));
          if (lensMag > 0) {
            const span = (geo.magSigma * 2 * Math.PI) / geo.C;
            scale *= 1 + lensMag * Math.max(0, Math.cos(th)) * Math.exp(-(((th - st.magU) / span) ** 2));
          }
          const facing = (Math.cos(th) + 1) / 2;
          opacity = 0.25 + 0.75 * facing * facing;
          z = String(Math.round(facing * 1000));
          dist = Math.cos(th) > 0 ? Math.abs(th) * geo.R : Infinity;
        }
      } else {
        let w = u;
        if (lensFocus > 0) {
          const kf = w / geo.focusSigma;
          scale *= 1 + lensFocus * Math.exp(-kf * kf);
          opacity *= 1 - 0.45 * lensFocus * (1 - Math.exp(-((u / (geo.focusSigma * 1.8)) ** 2)));
          w += lensFocus * geo.focusSigma * HALF_SQRT_PI * erf(kf);
        }
        const near = Math.abs(w - st.magU);
        if (lensMag > 0) {
          const km = (w - st.magU) / geo.magSigma;
          scale *= 1 + lensMag * Math.exp(-km * km);
          w += lensMag * geo.magSigma * HALF_SQRT_PI * erf(km);
        }
        x = w;
        if (geo.mode === 'wave') {
          y = geo.amp * Math.sin(geo.k * w);
          rot = (Math.atan(geo.amp * geo.k * Math.cos(geo.k * w)) * 90) / Math.PI;
        } else if (geo.mode === 'arc' && geo.R) {
          const phi = w / geo.R;
          if (Math.abs(phi) > geo.limit) hidden = true;
          x = geo.R * Math.sin(phi);
          y = geo.sign * (geo.R * (1 - Math.cos(phi)) - geo.shift);
          rot = (geo.sign * phi * 180) / Math.PI;
        }
        dist = cursorActive ? near : Math.abs(x);
      }
      if (introRunning && !hidden) {
        const pos = clamp((x + half) / Math.max(1, L), 0, 1);
        const e = easeOut(clamp((elapsed - pos * INTRO_STAGGER) / INTRO_TIME, 0, 1));
        opacity *= e;
        y += (1 - e) * 14;
      }
      if (wantsActive && !hidden && dist < bestDist) {
        bestDist = dist;
        best = it;
      }
      if (!needItems) continue;
      const along = x - u;
      const t = hidden
        ? ''
        : `${cfg.vertical ? `translate3d(${y.toFixed(2)}px, ${along.toFixed(2)}px, 0px)` : `translate3d(${along.toFixed(2)}px, ${y.toFixed(2)}px, 0px)`}${
            rot ? ` rotate(${(cfg.vertical ? -rot : rot).toFixed(2)}deg)` : ''
          }`;
      write(it, 't', 'transform', t, it.el);
      write(it, 'o', 'opacity', hidden ? '0' : opacity > 0.999 ? '' : opacity.toFixed(3), it.el);
      write(it, 'v', 'visibility', hidden ? 'hidden' : '', it.el);
      write(it, 'z', 'zIndex', z, it.el);
      if (it.content)
        write(it, 's', 'transform', Math.abs(scale - 1) < 0.0005 ? '' : `scale(${scale.toFixed(4)})`, it.content);
      if (it.tip) {
        const lift = ((scale - 1) * it.cross) / 2;
        write(
          it,
          'p',
          'transform',
          Math.abs(lift) < 0.05
            ? ''
            : cfg.vertical
              ? `translateX(${lift.toFixed(2)}px)`
              : `translateY(${lift.toFixed(2)}px)`,
          it.tip
        );
      }
    }
    const active = best && bestDist < Math.max(best.size, st.pitch) / 2 + 1 ? best : null;
    if (active !== st.active) {
      st.active?.el.removeAttribute('data-active');
      active?.el.setAttribute('data-active', '');
      st.active = active;
    }
  };

  const frame = now => {
    st.raf = 0;
    if (st.destroyed || !st.geo || st.period <= 0) return;
    const cfg = config.current;
    const dt = st.last ? clamp((now - st.last) / 1000, 0, 0.1) : 0;
    st.last = now;
    const P = st.period;
    let busy = false;
    if (st.introStart === -1 && !st.introDone && st.visible) {
      if (cfg.intro && !st.reduced) {
        st.introStart = now;
      } else {
        st.introDone = true;
      }
      root.removeAttribute('data-intro');
    }
    if (st.introStart >= 0) {
      if ((now - st.introStart) / 1000 >= INTRO_TIME + INTRO_STAGGER) {
        st.introStart = -2;
        st.introDone = true;
      } else {
        busy = true;
      }
    }
    const travel = Math.sign(cfg.speed) || 1;
    const paused = st.focused || (st.hovered && cfg.hoverValue !== undefined);
    const pausedSpeed = st.focused ? 0 : (cfg.hoverValue ?? 0);
    let target = st.reduced ? 0 : paused ? pausedSpeed * travel * cfg.dirSign : cfg.speed * cfg.dirSign;
    if (cfg.scrollBoost > 0 && !st.reduced) {
      st.scrollVel *= Math.exp(-dt / 0.18);
      if (Math.abs(st.scrollVel) > 1) busy = true;
      target += clamp(st.scrollVel * cfg.scrollBoost, -3000, 3000) * travel * cfg.dirSign;
    }
    if (st.drag?.active) {
      busy = true;
    } else if (st.seek) {
      st.seek.t = Math.min(1, st.seek.t + dt / st.seek.dur);
      st.offset = st.seek.from + st.seek.delta * easeInOut(st.seek.t);
      st.velocity = 0;
      if (st.seek.t >= 1) st.seek = null;
      busy = true;
    } else if (st.move) {
      st.move.t = Math.min(1, st.move.t + dt / st.move.dur);
      st.offset = st.move.from + st.move.delta * easeInOut(st.move.t);
      st.velocity = 0;
      busy = true;
      if (st.move.t >= 1) {
        st.move = null;
        st.hold = stepTiming(paused ? pausedSpeed : cfg.speed).hold;
      }
    } else if (cfg.step && !st.reduced) {
      const speed = paused ? pausedSpeed : cfg.speed;
      st.velocity = 0;
      if (speed) {
        busy = true;
        st.hold -= dt;
        if (st.hold <= 0) {
          const dir = Math.sign(speed) * cfg.dirSign;
          startMove(snapTarget(st.offset, dir), stepTiming(speed).move);
        }
      }
    } else {
      const tau = st.glide ? GLIDE_TAU : SMOOTH_TAU;
      st.velocity += (target - st.velocity) * (1 - Math.exp(-dt / tau));
      if (st.glide && Math.abs(st.velocity - target) < 2) st.glide = false;
      if (Math.abs(st.velocity - target) < 0.01) st.velocity = target;
      st.offset += st.velocity * dt;
      if (st.velocity !== 0 || target !== 0) busy = true;
    }
    if (!st.focused && !st.seek && !st.drag?.active) {
      const wrapped = ((st.offset % P) + P) % P;
      if (st.move) st.move.from += wrapped - st.offset;
      st.offset = wrapped;
    }
    const wantMag = cfg.magnify > 0 && st.pointerInside && !st.reduced ? 1 : 0;
    if (st.mag !== wantMag) {
      st.mag += (wantMag - st.mag) * (1 - Math.exp(-dt / (wantMag ? 0.12 : 0.25)));
      if (Math.abs(wantMag - st.mag) < 0.002) st.mag = wantMag;
      busy = true;
    }
    const pu = st.mag > 0 ? pointerU() : null;
    if (pu !== null) {
      if (!st.magReady) {
        st.magU = pu;
        st.magReady = true;
      }
      const next = st.magU + (pu - st.magU) * (1 - Math.exp(-dt / 0.06));
      if (Math.abs(next - pu) > 0.05) busy = true;
      st.magU = Math.abs(next - pu) > 0.05 ? next : pu;
    } else if (st.mag === 0) {
      st.magReady = false;
    }
    render(now);
    if (busy && st.visible && !st.destroyed) st.raf = requestAnimationFrame(frame);
  };

  const wake = () => {
    if (st.raf || st.destroyed || !st.visible) return;
    st.last = 0;
    st.raf = requestAnimationFrame(frame);
  };

  const local = e => {
    const r = root.getBoundingClientRect();
    const k = root.offsetWidth ? r.width / root.offsetWidth || 1 : 1;
    return [(e.clientX - r.left) / k, (e.clientY - r.top) / k];
  };

  const dragScale = () => {
    const geo = st.geo;
    if (!geo) return 1;
    if (geo.mode === 'orbit') return geo.C / (2 * Math.PI * geo.R * geo.pf);
    const pu = pointerU();
    if (pu === null || geo.focus <= 0) return 1;
    const kf = pu / geo.focusSigma;
    return 1 / (1 + geo.focus * Math.exp(-kf * kf));
  };

  const onEnter = e => {
    st.hovered = true;
    if (e.pointerType !== 'touch') {
      st.pointerInside = true;
      st.pointer = local(e);
    }
    wake();
  };

  const onLeave = () => {
    st.hovered = false;
    st.pointerInside = false;
    wake();
  };

  const onDown = e => {
    st.pressedAt = performance.now();
    if (!config.current.draggable || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const [x, y] = local(e);
    if (e.pointerType !== 'touch') st.pointer = [x, y];
    st.drag = { id: e.pointerId, x, y, active: false, samples: [], scale: dragScale(), anchor: 0, offset: 0 };
  };

  const onMove = e => {
    const cfg = config.current;
    if (e.pointerType !== 'touch') {
      st.pointer = local(e);
      st.pointerInside = true;
    }
    const d = st.drag;
    if (d && e.pointerId === d.id) {
      const [x, y] = local(e);
      const along = cfg.vertical ? y - d.y : x - d.x;
      const across = cfg.vertical ? x - d.x : y - d.y;
      if (!d.active) {
        if (Math.abs(along) < DRAG_THRESHOLD) return wake();
        if (Math.abs(across) > Math.abs(along)) {
          st.drag = null;
          return wake();
        }
        d.active = true;
        d.anchor = along;
        d.offset = st.offset;
        st.move = null;
        st.seek = null;
        st.glide = false;
        st.velocity = 0;
        try {
          root.setPointerCapture(e.pointerId);
        } catch {}
        root.setAttribute('data-dragging', '');
      }
      const next = d.offset - (along - d.anchor) * d.scale;
      const P = st.period || 1;
      st.offset = ((next % P) + P) % P;
      d.offset += st.offset - next;
      const now = performance.now();
      d.samples.push([now, along]);
      while (d.samples.length > 2 && now - d.samples[0][0] > 100) d.samples.shift();
    }
    wake();
  };

  const endDrag = (e, cancelled) => {
    const d = st.drag;
    if (!d || e.pointerId !== d.id) return;
    st.drag = null;
    if (!d.active) return;
    root.removeAttribute('data-dragging');
    try {
      root.releasePointerCapture(e.pointerId);
    } catch {}
    const cfg = config.current;
    const now = performance.now();
    st.suppressUntil = now + 400;
    let v = 0;
    const s = d.samples;
    if (!cancelled && s.length > 1) {
      const [t0, a0] = s[0];
      const [t1, a1] = s[s.length - 1];
      if (t1 > t0 && now - t1 < 80) v = clamp((-(a1 - a0) / (t1 - t0)) * 1000 * d.scale, -MAX_FLING, MAX_FLING);
    }
    if (cfg.step && !st.reduced) {
      const target = nearestSnap(st.offset + v * 0.35);
      startMove(target, clamp(0.3 + Math.abs(target - st.offset) / 1800, 0.3, 0.8));
      st.velocity = 0;
    } else {
      st.velocity = v;
      st.glide = Math.abs(v) > 30;
    }
    wake();
  };

  const onUp = e => endDrag(e, false);
  const onCancel = e => endDrag(e, true);

  const onClick = e => {
    if (performance.now() < st.suppressUntil) {
      e.preventDefault();
      e.stopPropagation();
      st.suppressUntil = 0;
    }
  };

  const onDragStart = e => {
    if (config.current.draggable) e.preventDefault();
  };

  const onFocusIn = e => {
    const target = e.target;
    if (performance.now() - st.pressedAt < 800) return;
    st.focused = true;
    const it = st.items.find(item => item.el.contains(target));
    if (it && st.geo) {
      const u = -st.offset - st.geo.lead + it.center - st.length / 2;
      const comfortable = st.geo.mode === 'orbit' ? 1 : Math.max(0, st.length / 2 - it.size);
      if (Math.abs(u) > comfortable) {
        st.move = null;
        st.seek = { from: st.offset, delta: u, t: 0, dur: clamp(0.35 + Math.abs(u) / 2000, 0.35, 0.8) };
      }
    }
    wake();
  };

  const onFocusOut = e => {
    if (root.contains(e.relatedTarget)) return;
    st.focused = false;
    wake();
  };

  const onRootScroll = () => {
    if (root.scrollLeft || root.scrollTop) {
      root.scrollLeft = 0;
      root.scrollTop = 0;
    }
  };

  const onScroll = () => {
    const now = performance.now();
    const y = window.scrollY;
    if (st.scrollT && now > st.scrollT) {
      const v = ((y - st.scrollY) / (now - st.scrollT)) * 1000;
      st.scrollVel += (clamp(v, -6000, 6000) - st.scrollVel) * 0.5;
    }
    st.scrollY = y;
    st.scrollT = now;
    if (config.current.scrollBoost > 0) wake();
  };

  const onMotion = () => {
    st.reduced = !!query?.matches;
    wake();
  };

  root.addEventListener('pointerenter', onEnter);
  root.addEventListener('pointerleave', onLeave);
  root.addEventListener('pointerdown', onDown);
  root.addEventListener('pointermove', onMove);
  root.addEventListener('pointerup', onUp);
  root.addEventListener('pointercancel', onCancel);
  root.addEventListener('lostpointercapture', onCancel);
  root.addEventListener('click', onClick, true);
  root.addEventListener('dragstart', onDragStart);
  root.addEventListener('focusin', onFocusIn);
  root.addEventListener('focusout', onFocusOut);
  root.addEventListener('scroll', onRootScroll);
  window.addEventListener('scroll', onScroll, { passive: true });
  query?.addEventListener?.('change', onMotion);

  let resizeObserver = null;
  const observed = new Set();
  const refresh = () => {
    collect();
    measure();
    if (resizeObserver) {
      const first = track.children[0];
      for (const el of [root, first]) {
        if (el && !observed.has(el)) {
          resizeObserver.observe(el);
          observed.add(el);
        }
      }
    }
    st.last = 0;
    if (st.raf) cancelAnimationFrame(st.raf);
    st.raf = 0;
    if (st.geo && st.period > 0) frame(performance.now());
  };

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      measure();
      if (st.geo && st.period > 0) render(performance.now());
      wake();
    });
  } else {
    window.addEventListener('resize', refresh);
  }

  let intersection = null;
  if (typeof IntersectionObserver !== 'undefined') {
    intersection = new IntersectionObserver(
      entries => {
        const entry = entries[entries.length - 1];
        st.visible = entry.isIntersecting;
        if (st.visible) wake();
      },
      { threshold: 0.1 }
    );
    intersection.observe(root);
  }

  const onVisibility = () => {
    if (!document.hidden) wake();
  };
  document.addEventListener('visibilitychange', onVisibility);

  const destroy = () => {
    st.destroyed = true;
    if (st.raf) cancelAnimationFrame(st.raf);
    root.removeEventListener('pointerenter', onEnter);
    root.removeEventListener('pointerleave', onLeave);
    root.removeEventListener('pointerdown', onDown);
    root.removeEventListener('pointermove', onMove);
    root.removeEventListener('pointerup', onUp);
    root.removeEventListener('pointercancel', onCancel);
    root.removeEventListener('lostpointercapture', onCancel);
    root.removeEventListener('click', onClick, true);
    root.removeEventListener('dragstart', onDragStart);
    root.removeEventListener('focusin', onFocusIn);
    root.removeEventListener('focusout', onFocusOut);
    root.removeEventListener('scroll', onRootScroll);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', refresh);
    document.removeEventListener('visibilitychange', onVisibility);
    query?.removeEventListener?.('change', onMotion);
    resizeObserver?.disconnect();
    intersection?.disconnect();
  };

  return { refresh, wake, destroy, state: st };
};
  return { createEngine, fadeMask, toCssLength, clamp };
})();

function mountLoop(host, props) {
  const P = Object.assign({ speed: 120, direction: 'left', width: '100%', logoHeight: 28, gap: 32, pauseOnHover: undefined, hoverSpeed: undefined, fadeOut: true, fadeOutWidth: 0.12, scaleOnHover: false, layout: 'line', bend: 0.5, focus: 0, magnify: 0, tiltX: 0, tiltY: 0, step: false, muted: 0, labels: 'none', draggable: true, scrollBoost: 0, intro: true, ariaLabel: 'Logos', className: '' }, props);
  const logos = P.logos;
  const vertical = P.direction === 'up' || P.direction === 'down';
  const root = document.createElement('div'), track = document.createElement('div');
  track.className = 'logoloop__track';
  root.appendChild(track);
  root.className = ['logoloop', vertical ? 'logoloop--vertical' : 'logoloop--horizontal', P.scaleOnHover && 'logoloop--scale-hover', P.className].filter(Boolean).join(' ');
  root.setAttribute('role', 'region'); root.setAttribute('aria-label', P.ariaLabel);
  if (P.intro) root.setAttribute('data-intro', '');
  if (P.draggable) root.setAttribute('data-draggable', '');
  const amount = LL.clamp(P.muted, 0, 1);
  if (amount > 0) root.setAttribute('data-muted', '');
  if (P.labels !== 'none') root.setAttribute('data-labels', P.labels);
  const wcss = LL.toCssLength(P.width);
  root.style.width = vertical ? (wcss === '100%' ? '' : wcss) : (wcss ?? '100%');
  root.style.setProperty('--logoloop-gap', `${P.gap}px`);
  root.style.setProperty('--logoloop-logoHeight', `${P.logoHeight}px`);
  if (amount > 0) { root.style.setProperty('--logoloop-gray', Math.min(1, amount * 2).toFixed(3)); root.style.setProperty('--logoloop-dim', (1 - amount * 0.6).toFixed(3)); }
  const mask = P.fadeOut ? LL.fadeMask(P.fadeOutWidth, vertical) : undefined;
  if (mask) { root.style.webkitMaskImage = mask; root.style.maskImage = mask; }
  host.appendChild(root);
  const config = { current: {
    speed: P.speed, dirSign: (vertical ? P.direction === 'up' : P.direction !== 'right') ? 1 : -1,
    hoverValue: P.hoverSpeed !== undefined ? P.hoverSpeed : P.pauseOnHover === false ? undefined : 0,
    vertical, layout: P.layout, bend: P.bend, focus: P.focus, magnify: P.magnify, tiltX: P.tiltX, tiltY: P.tiltY,
    step: P.step, draggable: P.draggable, scrollBoost: P.scrollBoost, intro: P.intro, scaleOnHover: P.scaleOnHover,
    labels: P.labels, links: logos.some((item) => item.href),
  } };
  let layout = { copies: 3, primary: 1 };
  const build = () => {
    const frag = document.createDocumentFragment();
    for (let ci = 0; ci < layout.copies; ci++) {
      const isPrimary = ci === layout.primary;
      const ul = document.createElement('ul');
      ul.className = 'logoloop__list'; ul.setAttribute('role', 'list');
      if (!isPrimary) ul.setAttribute('aria-hidden', 'true');
      logos.forEach((item) => {
        const li = document.createElement('li');
        li.className = 'logoloop__item'; li.setAttribute('role', 'listitem');
        if (item.hoverColor) { li.setAttribute('data-color', ''); li.style.setProperty('--logoloop-item-color', item.hoverColor); }
        const isNode = 'node' in item;
        const visual = isNode
          ? `<span class="logoloop__node"${item.href && !item.ariaLabel ? ' aria-hidden="true"' : ''}>${item.node}</span>`
          : `<img src="${item.src}" alt="${item.alt ?? ''}" loading="lazy" decoding="async" draggable="false">`;
        const text = (P.labels === 'inline' || P.labels === 'below') && item.title ? `<span class="logoloop__label">${item.title}</span>` : '';
        const name = isNode ? (item.ariaLabel ?? item.title) : (item.alt ?? item.title);
        let content;
        if (item.href) {
          content = document.createElement('a');
          content.href = item.href; content.target = '_blank'; content.rel = 'noreferrer noopener'; content.draggable = false;
          content.setAttribute('aria-label', name || 'logo link'); content.dataset.cur = 'Open';
          if (!isPrimary) content.tabIndex = -1;
        } else content = document.createElement('div');
        content.className = 'logoloop__content';
        content.innerHTML = visual + text;
        li.appendChild(content);
        if (P.labels === 'hover' && item.title) {
          const tip = document.createElement('span');
          tip.className = 'logoloop__tip'; tip.setAttribute('aria-hidden', 'true'); tip.textContent = item.title;
          li.appendChild(tip);
        }
        ul.appendChild(li);
      });
      frag.appendChild(ul);
    }
    track.textContent = ''; track.appendChild(frag);
  };
  build();
  let engine = null, pending = false;
  engine = LL.createEngine(root, track, config, (l) => {
    layout = { copies: Math.min(l.copies, 40), primary: Math.min(l.primary, 39) };  // hard cap: a host that sizes to content must never snowball
    if (pending) return;
    pending = true;
    queueMicrotask(() => { pending = false; build(); if (engine) { engine.refresh(); engine.wake(); } });
  });
  engine.refresh(); engine.wake();
  return { root, engine, destroy() { engine.destroy(); root.remove(); } };
}

/* loop content: original channel glyphs + typeset label marks (not the labels' own logos) */
const lgi = (id, t) => `<span class="lgi"><svg class="ico" aria-hidden="true"><use href="#${id}"/></svg>${t}</span>`;
const LG_C = '<span class="lgi-c"><svg viewBox="-.2 -.2 10.4 11" aria-hidden="true"><use href="#i-c"/></svg></span>';
const PLATFORM_ITEMS = (hc) => [
  { node: LG_C, title: 'Celesnica', ariaLabel: 'Celesnica' },
  { node: lgi('i-stream', 'Spotify'), title: 'Spotify', ariaLabel: 'Spotify', href: SPOTIFY, hoverColor: hc },
  { node: lgi('i-wave', 'SoundCloud'), title: 'SoundCloud', ariaLabel: 'SoundCloud', href: SOUNDCLOUD, hoverColor: hc },
  { node: lgi('i-frame', 'Instagram'), title: 'Instagram', ariaLabel: 'Instagram', href: INSTA, hoverColor: hc },
  { node: '<span class="lgi"><svg class="ico" aria-hidden="true" style="width:1.9em;height:1.9em"><use href="#i-x"/></svg></span>', title: 'X · soon', ariaLabel: 'X' },
  { node: lgi('i-play', 'YouTube'), title: 'YouTube', ariaLabel: 'YouTube', href: YOUTUBE, hoverColor: hc },
  { node: lgi('i-disc', 'NetEase'), title: 'NetEase Cloud Music', ariaLabel: 'NetEase Cloud Music', href: NETEASE, hoverColor: hc },
];
const LABEL_ITEMS = (hc) => [
  { node: '<span class="lg lg-a"><b>2088</b><i>Records</i></span>', title: '2088 Records', ariaLabel: '2088 Records', href: 'https://2088.studio/', hoverColor: hc },
  { node: '<span class="lg lg-b">SN</span>', title: 'SN', hoverColor: hc },
  { node: '<span class="lg lg-c">Stardust<i>Records</i></span>', title: 'Stardust Records', hoverColor: hc },
  { node: LG_C, title: 'Celesnica' },
  { node: '<span class="lg lg-d">Quadrant Shield</span>', title: 'Quadrant Shield', hoverColor: hc },
  { node: '<span class="lg lg-e">Vultures</span>', title: 'Vultures Records', hoverColor: hc },
  { node: '<span class="lg lg-f">Taisheng<i>Music</i></span>', title: 'Taisheng Music', hoverColor: hc },
  { node: '<span class="lg lg-g">Diary Music</span>', title: 'Diary Music', hoverColor: hc },
  { node: LG_C, title: 'Celesnica' },
];
const Loops = {
  list: [],
  init() {
    const narrow = innerWidth < 700;
    const mk = (id, props) => { const h = $(id); if (h) this.list.push(mountLoop(h, props)); };
    mk('#loopLabels', { logos: LABEL_ITEMS(LIME), ariaLabel: 'Labels', speed: 64, logoHeight: narrow ? 38 : 56, gap: narrow ? 30 : 46, layout: 'line', focus: 0.16, magnify: 0.35, labels: 'none', fadeOutWidth: 0.1, scrollBoost: 0.35, muted: 0.25, hoverSpeed: 18 });
    mk('#loopPlatforms', { logos: PLATFORM_ITEMS(), ariaLabel: 'Platforms', speed: 90, logoHeight: narrow ? 40 : 52, gap: narrow ? 30 : 46, layout: 'wave', bend: 0.55, focus: 0.16, magnify: 0.45, labels: 'none', fadeOutWidth: 0.08, scrollBoost: 0.5, hoverSpeed: 24 });
    mk('#loopArc', { logos: LABEL_ITEMS(), ariaLabel: 'Labels', speed: 56, logoHeight: narrow ? 32 : 44, gap: narrow ? 26 : 40, layout: 'arc', bend: narrow ? 0.25 : 0.32, focus: 0.18, magnify: 0.3, labels: 'none', fadeOutWidth: 0.12, scrollBoost: 0.3, hoverSpeed: 16 });
    const icons = PLATFORM_ITEMS().slice(1).map((it) => Object.assign({}, it, { node: it.node.replace(/<\/svg>[^<]*<\/span>$/, '</svg></span>') }))
      .concat([['i-jedm', 'J-EDM'], ['i-organic', 'Organic'], ['i-missions', 'Missions'], ['i-worlds', 'Worlds']].map(([id, t]) => ({ node: `<span class="lgi"><svg class="ico" aria-hidden="true"><use href="#${id}"/></svg></span>`, title: t, ariaLabel: t })));
    // one set of glyphs should exactly fill the ring: estimate the orbit radius from the layout
    const gut = clamp(innerWidth * 0.044, 20, 64), cw = Math.min(innerWidth - 2 * Math.max(16, gut), 1360);
    const ow = innerWidth <= 900 ? cw : ((cw - 30) * 0.9) / 1.9, oh = narrow ? 30 : 38;
    const R = Math.max(40, ow * 0.43 - oh * 0.2), ogap = Math.max(24, (2 * Math.PI * R) / icons.length - oh * 1.15);
    mk('#loopOrbit', { logos: icons, ariaLabel: 'Platforms', speed: 46, logoHeight: oh, gap: Math.round(ogap), layout: 'orbit', bend: 1, focus: 0.3, magnify: 0, labels: 'none', fadeOut: false, draggable: true, hoverSpeed: 10 });
    const orb = this.list[this.list.length - 1], wrap = $('.orbit-wrap');
    if (orb && wrap) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'orbit-path'); svg.setAttribute('aria-hidden', 'true');
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse'); svg.appendChild(el); wrap.prepend(svg);
      const fit = () => {
        const g = orb.engine.state.geo; if (!g || !g.R) return;
        const hr = orb.root.getBoundingClientRect(), wr = wrap.getBoundingClientRect(); if (!hr.width) return;
        const sa = Math.sin(g.alpha), ca = Math.cos(g.alpha), pb = g.depth / (g.depth + g.R * ca);
        const bot = g.R * sa * g.pf - g.shift, top = -g.R * sa * pb - g.shift;
        const cx = hr.left - wr.left + hr.width / 2, cy = hr.top - wr.top + hr.height / 2 + (top + bot) / 2;
        el.setAttribute('cx', cx.toFixed(1)); el.setAttribute('cy', cy.toFixed(1)); el.setAttribute('rx', g.R.toFixed(1)); el.setAttribute('ry', ((bot - top) / 2).toFixed(1));
        wrap.style.setProperty('--oy', (cy - wr.height / 2).toFixed(1) + 'px');
      };
      fit(); setTimeout(fit, 400);
      if (window.ResizeObserver) new ResizeObserver(fit).observe(wrap);
    }
  },
};

/* =====================================================================
   metallic paint — liquid-metal shader on our C mark (a rewrite of the
   MetallicPaint idea for this site: chrome body, lime tips, 45° pour-in,
   bevel field from an exact distance transform so the thin tips survive)
   ===================================================================== */
const Metal = {
  VS: '#version 300 es\nprecision mediump float;\nin vec2 a_position;\nout vec2 vUv;\nvoid main(){vUv=.5*(a_position+1.);gl_Position=vec4(a_position,0.,1.);}',
  FS: `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D u_tex;
uniform float u_time,u_patternScale,u_refraction,u_patternBlur,u_liquid,u_reveal,u_hover,u_burst;
uniform vec2 u_mouse;
uniform vec3 u_c1,u_c2,u_t1,u_t2;
#define PI 3.14159265358979323846
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec2 mod289(vec2 x){return x-floor(x*(1./289.))*289.;}
vec3 permute(vec3 x){return mod289(((x*34.)+1.)*x);}
float snoise(vec2 v){
  const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
  vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289(i);
  vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
  vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);m=m*m;m=m*m;
  vec3 x=2.*fract(p*C.www)-1.;vec3 h=abs(x)-.5;vec3 ox=floor(x+.5);vec3 a0=x-ox;
  m*=1.79284291400159-.85373472095314*(a0*a0+h*h);
  vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.*dot(m,g);
}
vec2 rotate(vec2 uv,float th){return mat2(cos(th),sin(th),-sin(th),cos(th))*uv;}
float ch(float c1,float c2,float sp,vec3 w,float eb,float b){
  float c=c2;float bl=u_patternBlur+eb;
  c=mix(c,c1,smoothstep(0.,bl,sp));
  float bo=w[0];c=mix(c,c2,smoothstep(bo-bl,bo+bl,sp));
  b=smoothstep(.2,.8,b);
  bo=w[0]+.4*(1.-b)*w[1];c=mix(c,c1,smoothstep(bo-bl,bo+bl,sp));
  bo=w[0]+.5*(1.-b)*w[1];c=mix(c,c2,smoothstep(bo-bl,bo+bl,sp));
  bo=w[0]+w[1];c=mix(c,c1,smoothstep(bo-bl,bo+bl,sp));
  float gt=(sp-w[0]-w[1])/w[2];
  float gr=mix(c1,c2,smoothstep(0.,1.,gt));
  c=mix(c,gr,smoothstep(bo-bl,bo+bl,sp));
  return c;
}
void main(){
  vec2 uv=vUv;uv.y=1.-uv.y;
  float diagonal=uv.x-uv.y;
  float t=.001*u_time;
  vec2 iuv=vec2(vUv.x,1.-vUv.y);
  vec4 img=texture(u_tex,iuv);
  float rv=(iuv.x+1.-iuv.y)*.5;
  float front=u_reveal*1.24-.12;
  float op=img.b*smoothstep(rv-.045,rv+.045,front);
  if(op<=0.){fragColor=vec4(0.);return;}
  float tip=img.g;
  vec3 color1=mix(u_c1,u_t1,tip);
  vec3 color2=mix(u_c2,u_t2,tip);
  color2+=vec3(0.,.02,.1)*smoothstep(.7,1.3,uv.x+uv.y)*(1.-tip);
  float edge=img.r;
  float md=length(iuv-u_mouse);
  edge=clamp(edge+(u_hover*.07+u_burst*.25)*sin(md*46.-u_time*.012)*exp(-md*5.)*(1.-edge*.5),0.,1.);
  vec2 grad_uv=uv-.5;
  float dist=length(grad_uv+vec2(0.,.2*diagonal));
  grad_uv=rotate(grad_uv,(.25-.2*diagonal)*PI);
  float bulge=pow(1.8*dist,1.2);bulge=1.-bulge;bulge*=pow(max(uv.y,0.),.3);
  float cw=u_patternScale;
  float th1=.12/cw*(1.-.4*bulge),th2=.07/cw*(1.+.4*bulge),wide=1.-th1-th2;
  float noise=snoise(uv-t);
  edge+=(1.-edge)*u_liquid*noise;
  float refr=clamp(1.-bulge,0.,1.);
  float dir=grad_uv.x+diagonal;
  dir-=2.*noise*diagonal*(smoothstep(0.,1.,edge)*smoothstep(1.,0.,edge));
  bulge*=clamp(pow(max(uv.y,0.),.1),.3,1.);
  dir*=(.1+(1.1-edge)*bulge);
  dir*=smoothstep(1.,.7,edge);
  dir+=.18*(smoothstep(.1,.2,uv.y)*smoothstep(.4,.2,uv.y));
  dir+=.03*(smoothstep(.1,.2,1.-uv.y)*smoothstep(.4,.2,1.-uv.y));
  dir*=(.5+.5*pow(max(uv.y,0.),2.));
  dir*=cw;dir-=t;
  float rr=refr+.03*bulge*noise,rb=1.3*refr;
  rr+=5.*(smoothstep(-.1,.2,uv.y)*smoothstep(.5,.1,uv.y))*(smoothstep(.4,.6,bulge)*smoothstep(1.,.4,bulge));
  rr-=diagonal;
  rb+=(smoothstep(0.,.4,uv.y)*smoothstep(.8,.1,uv.y))*(smoothstep(.4,.6,bulge)*smoothstep(.8,.4,bulge));
  rb-=.2*edge;
  rr*=u_refraction;rb*=u_refraction;
  vec3 w=vec3(cw*th1,cw*th2,wide);
  w[1]-=.02*smoothstep(0.,1.,edge+bulge);
  float r=ch(color1.r,color2.r,mod(dir+rr,1.),w,.02+.03*u_refraction*bulge,bulge);
  float g=ch(color1.g,color2.g,mod(dir,1.),w,.01/max(.05,1.-diagonal),bulge);
  float b=ch(color1.b,color2.b,mod(dir-rb,1.),w,.01,bulge);
  vec3 col=vec3(r,g,b);
  col+=vec3(.5,.78,.08)*smoothstep(.6,.98,img.r)*.16*(1.-tip);
  float rim=smoothstep(.04,0.,abs(rv-front))*step(.001,u_reveal)*step(u_reveal,.999);
  col=mix(col,vec3(.8,1.,.2),rim*.85);
  fragColor=vec4(col*op,op);
}`,
  tex: null,
  edt(M, W, H) {
    const INF = 1e20, n = Math.max(W, H), f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1), g = new Float64Array(W * H);
    for (let i = 0; i < W * H; i++) g[i] = M[i] ? INF : 0;
    const dt1 = (len) => {
      let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
      for (let q = 1; q < len; q++) {
        let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
        while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
        k++; v[k] = q; z[k] = s; z[k + 1] = INF;
      }
      k = 0;
      for (let q = 0; q < len; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) * (q - v[k]) + f[v[k]]; }
    };
    for (let x = 0; x < W; x++) { for (let y = 0; y < H; y++) f[y] = g[y * W + x]; dt1(H); for (let y = 0; y < H; y++) g[y * W + x] = d[y]; }
    for (let y = 0; y < H; y++) { for (let x = 0; x < W; x++) f[x] = g[y * W + x]; dt1(W); for (let x = 0; x < W; x++) g[y * W + x] = d[x]; }
    return g;
  },
  field(N) {
    if (this.tex && this.tex.N === N) return this.tex;
    const cv = document.createElement('canvas'); cv.width = cv.height = N;
    const c = cv.getContext('2d', { willReadFrequently: true });
    const pad = 0.15, sc = (N * (1 - 2 * pad)) / 10.6, ox = (N - 10 * sc) / 2, oy = (N - 10.6 * sc) / 2;
    const path = (pts) => { c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(ox + p[0] * sc, oy + p[1] * sc) : c.moveTo(ox + p[0] * sc, oy + p[1] * sc))); c.closePath(); };
    c.fillStyle = '#fff';
    [0, 2].forEach((i) => { path(C_PIECES[i]); c.fill(); });
    const body = c.getImageData(0, 0, N, N).data;
    c.clearRect(0, 0, N, N);
    [1, 3].forEach((i) => { path(C_PIECES[i]); c.fill(); });
    const tips = c.getImageData(0, 0, N, N).data;
    const M = new Uint8Array(N * N), A = new Float32Array(N * N), TP = new Float32Array(N * N);
    for (let i = 0; i < N * N; i++) { const a = Math.max(body[i * 4 + 3], tips[i * 4 + 3]); A[i] = a / 255; M[i] = a > 127 ? 1 : 0; TP[i] = tips[i * 4 + 3] / 255; }
    // dome field per piece (what a Poisson solve gives on a strip), normalised per piece so the
    // thin tips get the same depth as the body; edge = 1 - dome² like the original remap
    const D = this.edt(M, N, N);
    let dB = 1, dT = 1;
    for (let i = 0; i < N * N; i++) { if (!M[i]) continue; const d = Math.sqrt(D[i]); if (TP[i] > 0.5) { if (d > dT) dT = d; } else if (d > dB) dB = d; }
    const out = new Uint8Array(N * N * 4);
    for (let i = 0; i < N * N; i++) {
      let e = 1;
      if (M[i]) { const hh = Math.min(1, Math.sqrt(D[i]) / (TP[i] > 0.5 ? dT : dB)), u = hh * (2 - hh); e = 1 - u * u; }
      out[i * 4] = Math.round(e * 255);
      out[i * 4 + 1] = Math.round(TP[i] * 255);
      out[i * 4 + 2] = Math.round(A[i] * 255);
      out[i * 4 + 3] = 255;
    }
    this.tex = { N, data: out };
    return this.tex;
  },
  mount(cv, opt = {}) {
    let gl = null;
    try { gl = cv.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: true }); } catch (e) { gl = null; }
    if (!gl) return null;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; } return s; };
    const vs = sh(gl.VERTEX_SHADER, this.VS), fs = sh(gl.FRAGMENT_SHADER, this.FS);
    if (!vs || !fs) return null;
    const prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(prog)); return null; }
    gl.useProgram(prog);
    const U = {};
    ['u_tex', 'u_time', 'u_patternScale', 'u_refraction', 'u_patternBlur', 'u_liquid', 'u_reveal', 'u_hover', 'u_burst', 'u_mouse', 'u_c1', 'u_c2', 'u_t1', 'u_t2'].forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a_position'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const F = this.field(opt.N || 512);
    const tx = gl.createTexture(); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tx);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, F.N, F.N, 0, gl.RGBA, gl.UNSIGNED_BYTE, F.data);
    gl.uniform1i(U.u_tex, 0);
    gl.uniform1f(U.u_patternScale, opt.patternScale || 2); gl.uniform1f(U.u_refraction, opt.refraction ?? 0.016);
    gl.uniform1f(U.u_patternBlur, opt.patternBlur ?? 0.005); gl.uniform1f(U.u_liquid, opt.liquid ?? 0.08);
    gl.uniform3f(U.u_c1, 0.985, 0.99, 1.0); gl.uniform3f(U.u_c2, 0.03, 0.05, 0.42);
    gl.uniform3f(U.u_t1, 0.86, 1.0, 0.24); gl.uniform3f(U.u_t2, 0.05, 0.08, 0.6);
    const m = { cv, gl, U, t: rand(0, 4000), reveal: opt.reveal ?? 1, hover: 0, hoverTo: 0, burst: 0, mx: 0.5, my: 0.5, vis: true, alive: true, speed: opt.speed || 0.3, raf: 0, last: 0, w: 0 };
    const size = () => {
      const r = cv.getBoundingClientRect(); if (!r.width) return;
      const d = Math.min(devicePixelRatio || 1, 2), S = Math.round(Math.min(r.width * d, opt.maxSize ?? 1100));
      if (S !== m.w) { m.w = S; cv.width = cv.height = S; gl.viewport(0, 0, S, S); }
    };
    m.size = size;
    if (window.ResizeObserver) { m.ro = new ResizeObserver(size); m.ro.observe(cv); }
    if (window.IntersectionObserver) { m.io = new IntersectionObserver((es) => { for (const e of es) m.vis = e.isIntersecting; if (m.vis) m.kick(); }); m.io.observe(cv); }
    size();
    m.draw = () => {
      gl.uniform1f(U.u_time, m.t); gl.uniform1f(U.u_reveal, m.reveal); gl.uniform1f(U.u_hover, m.hover); gl.uniform1f(U.u_burst, m.burst);
      gl.uniform2f(U.u_mouse, m.mx, m.my);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    m.frame = (ts) => {
      m.raf = 0;
      if (!m.alive) return;
      const dt = m.last ? Math.min(0.05, (ts - m.last) / 1000) : 0.016; m.last = ts;
      m.hover += (m.hoverTo - m.hover) * (1 - Math.exp(-dt * 6));
      m.burst *= Math.exp(-dt * 2.2);
      if (!reduced) m.t += dt * 1000 * m.speed * (1 + m.hover * 1.4 + m.burst * 3);
      if (!m.w) size();
      if (m.w) m.draw();
      if (m.vis && !document.hidden && !reduced) m.raf = requestAnimationFrame(m.frame);
    };
    m.kick = () => { if (!m.raf && m.alive) { m.last = 0; m.raf = requestAnimationFrame(m.frame); } };
    m.point = (cx, cy) => { const r = cv.getBoundingClientRect(); m.mx = (cx - r.left) / r.width; m.my = (cy - r.top) / r.height; };
    const resume = () => { if (!document.hidden) m.kick(); };
    m.destroy = () => { m.alive = false; cancelAnimationFrame(m.raf); if (m.ro) m.ro.disconnect(); if (m.io) m.io.disconnect(); document.removeEventListener('visibilitychange', resume); const ext = gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext(); };
    document.addEventListener('visibilitychange', resume);
    m.kick();
    return m;
  },
};
// the Information hero's C: same liquid metal, parked on the centre of that page's ring (1180,430)
const InfoC = {
  init() {
    this.el = $('#infoC'); this.dg = $('#infoDg');
    if (!this.el || !this.dg) return;
    this.sec = this.el.parentElement;
    this.m = Metal.mount($('#infoMetal'), { reveal: 1 });
    if (!this.m) this.el.classList.add('nogl');
    else {
      this.el.addEventListener('pointermove', (e) => { this.m.point(e.clientX, e.clientY); this.m.hoverTo = 1; this.m.kick(); });
      this.el.addEventListener('pointerleave', () => { this.m.hoverTo = 0; });
      this.el.addEventListener('click', (e) => { this.m.point(e.clientX, e.clientY); this.m.burst = 1; this.m.kick(); });
    }
    const go = () => this.layout();
    if (window.ResizeObserver) new ResizeObserver(go).observe(this.sec);
    addEventListener('resize', go); go();
  },
  layout() {
    const M = this.dg.getScreenCTM(), r = this.sec.getBoundingClientRect();
    if (!M || !r.width) return;
    const x = M.a * 1180 + M.e - r.left, y = M.d * 430 + M.f - r.top, size = 216 * 2 * 0.62 * M.a;
    this.el.style.setProperty('--icx', x.toFixed(1) + 'px'); this.el.style.setProperty('--icy', y.toFixed(1) + 'px'); this.el.style.setProperty('--ics', size.toFixed(1) + 'px');
    // on narrow screens the ring sits mostly off the right edge; a half-cut C would look like a mistake
    this.el.classList.toggle('off', x + size * 0.35 > r.width);
  },
};
const HeroC = {
  m: null,
  init() {
    this.el = $('#heroC');
    if (!this.el) return;
    this.m = Metal.mount($('#heroMetal'), { reveal: 1 });
    if (!this.m) { this.el.classList.add('nogl'); return; }
    this.el.addEventListener('pointermove', (e) => { this.m.point(e.clientX, e.clientY); this.m.hoverTo = 1; this.m.kick(); });
    this.el.addEventListener('pointerleave', () => { this.m.hoverTo = 0; });
    this.el.addEventListener('click', (e) => {
      e.stopPropagation();
      this.m.point(e.clientX, e.clientY); this.m.burst = 1; this.m.kick();
      Field.strike(e.clientX, e.clientY); WM.hitU(WM.Wu * 0.5 + 4);
    });
  },
};

/* =====================================================================
   intro orbit: channel glyphs circling the metallic C, passing in front
   of it at the bottom of the ellipse and behind it at the top
   ===================================================================== */
const ORBIT_ICONS = [['i-stream', 'Spotify'], ['i-jedm', 'J-EDM'], ['i-wave', 'SoundCloud'], ['i-organic', 'Organic'], ['i-frame', 'Instagram'], ['i-missions', 'Missions'], ['i-x', 'X'], ['i-worlds', 'Worlds'], ['i-play', 'YouTube'], ['i-disc', 'NetEase']];
function mountOrbit(host) {
  host.innerHTML = ORBIT_ICONS.map(([id, name], i) => `<span class="io-i${i % 2 ? ' lime' : ''}"><svg aria-hidden="true"><use href="#${id}"/></svg><span>${name}</span></span>`).join('');
  const els = $$('.io-i', host), n = els.length;
  const o = { a: -0.6, fade: 0, speed: 0.42 };
  let radius = host.clientWidth * 0.365;
  const resize = window.ResizeObserver && new ResizeObserver(() => { radius = host.clientWidth * 0.365; });
  if (resize) resize.observe(host);
  o.destroy = () => { if (resize) resize.disconnect(); host.textContent = ''; };
  o.frame = (dt) => {
    if (!reduced) o.a += dt * o.speed;
    if (!o.fade) return;
    for (let i = 0; i < n; i++) {
      const th = o.a + (i / n) * Math.PI * 2, z = Math.cos(th), x = Math.sin(th) * radius, y = z * radius * 0.3;
      const k = (z + 1) / 2, s = 0.6 + 0.55 * k, op = (0.22 + 0.78 * k * k) * o.fade;
      els[i].style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${s.toFixed(3)})`;
      els[i].style.opacity = op.toFixed(3);
      els[i].style.zIndex = z > 0 ? 4 : 1;
    }
  };
  return o;
}

/* =====================================================================
   slice-wave type: the glyphs are cut into vertical strips that arrive
   on a wave and ripple under the pointer
   ===================================================================== */
const Slice = {
  list: [],
  init() { $$('[data-slice]').forEach((el) => this.make(el)); },
  make(el) {
    const n = +el.dataset.slice || 12, html = el.innerHTML, txt = el.textContent.trim();
    el.setAttribute('aria-label', txt); el.classList.add('slice');
    let h = `<span class="sl-base" aria-hidden="true">${html}</span>`;
    for (let i = 0; i < n; i++) {
      const a = ((i * 100) / n).toFixed(3), b = (100 - ((i + 1) * 100) / n).toFixed(3);
      h += `<span class="sl${i % 2 ? ' ev' : ''}" aria-hidden="true" style="clip-path:inset(-40% ${b}% -40% ${a}%)">${html}</span>`;
    }
    el.innerHTML = h;
    const o = { el, n, strips: $$('.sl', el), y: new Float32Array(n), v: new Float32Array(n), mx: -1, intro: 0, busy: false };
    el._slice = o;
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); o.mx = (e.clientX - r.left) / r.width; o.busy = true; });
    el.addEventListener('pointerleave', () => { o.mx = -1; });
    this.list.push(o);
  },
  setText(el, txt) { $$('.sl,.sl-base', el).forEach((s) => { s.textContent = txt; }); el.setAttribute('aria-label', txt); },
  play(el) { const o = el._slice; if (!o || reduced) return; o.intro = now(); o.busy = true; for (let i = 0; i < o.n; i++) { o.y[i] = (i % 2 ? -1 : 1) * (60 + (i % 3) * 18); o.v[i] = 0; } },
  frame(dt) {
    if (reduced) return;
    const t = now();
    for (const o of this.list) {
      if (!o.busy || !o.el.offsetParent) continue;
      let moving = false;
      for (let i = 0; i < o.n; i++) {
        let target = 0;
        if (o.intro && t - o.intro < (i * 42)) target = o.y[i];
        if (o.mx >= 0) { const d = (i + 0.5) / o.n - o.mx; target -= 34 * Math.exp(-(d * d) / 0.012) * Math.cos(d * 26); }
        o.v[i] += (260 * (target - o.y[i]) - 17 * o.v[i]) * dt;
        o.y[i] += o.v[i] * dt;
        if (Math.abs(o.y[i] - target) > 0.05 || Math.abs(o.v[i]) > 0.1) moving = true;
        o.strips[i].style.transform = `translate3d(0,${o.y[i].toFixed(2)}%,0)`;
      }
      if (!moving && o.mx < 0) { o.busy = false; o.intro = 0; }
    }
  },
};

/* ghost words drift sideways with scroll */
const Ghost = {
  list: [],
  init() { this.list = $$('[data-ghost]').map((el) => ({ el, s: +el.dataset.gs || -0.4, x: 0 })); },
  frame() {
    if (reduced) return;
    const H = innerHeight;
    for (const o of this.list) {
      if (!o.el.offsetParent) continue;
      const r = o.el.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > H + 100) continue;
      const x = (r.top + r.height / 2 - H / 2) * o.s * 0.5;
      if (Math.abs(x - o.x) > 0.4) { o.x = x; o.el.style.setProperty('--gx', x.toFixed(1) + 'px'); }
    }
  },
};

/* =====================================================================
   intro
   ===================================================================== */
const Intro = {
  busy: false, visible: false,
  should() { return !reduced && !AUTOMATED && !ss.get('cel3-intro') && !!document.body.animate; },
  async play(preparePage) {
    if (this.busy) return;
    this.busy = true;
    themeColor.content = BLACK;
    ss.set('cel3-intro', '1');
    const el = $('#intro'), svg = $('#inC'), stage = $('#inStage'), dg = $('.in-dg', el), blade = $('#inBlade');
    if (preparePage) root.classList.add('intro-startup');
    svg.innerHTML = C_PIECES.map((p, i) => `<path class="${i % 2 ? 't' : ''}" d="${pd(p)}"/>`).join('');
    ticks($('#inTicks'), 400, 400, 262, 120, 10);
    el.classList.remove('locked', 'gl');
    el.hidden = false;
    this.visible = true;
    dg.classList.remove('drawn'); blade.classList.remove('on');
    const old = $('#inMetal'), cv = old.cloneNode(false); old.replaceWith(cv);
    const metal = Metal.mount(cv, { reveal: 0, speed: 0.34, maxSize: 320 });
    if (metal) { el.classList.add('gl'); metal.size(); metal.draw(); }
    const orb = mountOrbit($('#inOrbit'));
    const ghost = $('.in-ghost', el), pct = $('#inPct'), chk = $('#inChk');
    pct.textContent = '000'; chk.style.setProperty('--ip', 0);
    ghost.style.animation = 'none'; void ghost.offsetWidth;
    ghost.style.animation = ''; dg.classList.add('drawn');
    let locked = false, progress = 0, frame = 0, start, last, finish;
    const finished = new Promise((resolve) => { finish = resolve; });
    const skipButton = $('#inSkip');
    skipButton.addEventListener('click', finish, { once: true });
    addEventListener('keydown', finish, { once: true });
    const LOCK = 1750;
    const lock = () => {
      locked = true;
      el.classList.add('locked');
      blade.classList.add('on');
      if (metal) { metal.burst = 1; metal.kick(); }
      orb.speed = 2.4;
      AU.ui('lock');
      if (stage.animate) stage.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(-7px,0) skewX(-4deg)' }, { transform: 'translate(6px,0)' }, { transform: 'translate(0,0)' }], { duration: 260, easing: 'ease-out' });
    };
    const tick = (time) => {
      start ??= time;
      const e = time - start, dt = Math.min(0.05, (time - (last ?? time)) / 1000); last = time;
      const p = clamp(e / 1600, 0, 1);
      if (p !== progress) {
        const count = Math.round(p * 100);
        if (count !== Math.round(progress * 100)) pct.textContent = String(count).padStart(3, '0');
        chk.style.setProperty('--ip', p.toFixed(3));
        progress = p;
      }
      if (metal) { metal.reveal = outExpo(clamp((e - 200) / 1200, 0, 1)); metal.kick(); }
      orb.fade = clamp((e - 380) / 700, 0, 1);
      orb.speed = lerp(orb.speed, locked ? 0.9 : 0.42, 0.04);
      orb.frame(dt);
      if (!locked && e >= LOCK) lock();
      frame = requestAnimationFrame(tick);
    };
    if (!metal) $$('path', svg).forEach((p, i) => {
      const d = (i % 2 ? 1 : -1) * (i < 2 ? 16 : 13);
      p.animate([{ transform: `translate(${-d}px,${d}px)`, opacity: 0 }, { transform: 'translate(0px,0px)', opacity: 1 }], { duration: 720, delay: 380 + i * 95, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' });
    });
    frame = requestAnimationFrame(tick);
    const hold = setTimeout(finish, LOCK + 1000);
    await finished;
    clearTimeout(hold);
    await Shutter.cover('Celesnica', 'Signal locked');
    cancelAnimationFrame(frame);
    el.hidden = true;
    this.visible = false;
    skipButton.removeEventListener('click', finish);
    removeEventListener('keydown', finish);
    if (metal) metal.destroy();
    orb.destroy();
    try {
      if (preparePage) {
        root.classList.remove('intro-startup');
        // Paint the closed shutter before running the page's synchronous setup.
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        preparePage();
      }
      if (Router.cur === 'home') WM.assemble();
    } finally {
      await Shutter.reveal();
      themeColor.content = BLUE;
      this.busy = false;
    }
  },
};

/* =====================================================================
   scroll, tone, player, loop, boot
   ===================================================================== */
let scrollRaf = 0;
function onScroll() {
  scrollRaf = 0;
  const y = scrollY;
  if (Router.cur === 'home') {
    const hero = $('#hero'), hp = clamp(y / Math.max(1, hero.offsetHeight), 0, 1);
    WM.spread = reduced ? 0 : hp * 2.6; WM.dirty = true;
  }
  if (Menu.el && !Menu.el.hidden) return;
  const ty = parseFloat(getComputedStyle(root).getPropertyValue('--frame')) + 30 || 42;
  let tone = 'blue';
  const els = Router.viewEl ? [...Router.viewEl.querySelectorAll('[data-tone]'), $('.foot')] : [];
  for (const el of els) { const r = el.getBoundingClientRect(); if (r.top <= ty && r.bottom >= ty) tone = el.dataset.tone; }
  root.dataset.navTone = tone;
}
const Player = {
  t0: now(), last: '',
  frame() {
    const e = (now() - this.t0) / 1000;
    const tc = `${pad2(Math.floor(e / 3600))}:${pad2(Math.floor(e / 60) % 60)}:${pad2(Math.floor(e) % 60)}`;
    const st = Over.on ? 'Overdrive' : Seq.playing ? 'Live' : 'Scanning';
    const ch = Seq.playing ? CH[Seq.key].code : TX[Router.cur] || 'TX 01';
    const key = tc + st + ch;
    if (key === this.last) return;
    this.last = key;
    $('#plTc').textContent = tc; $('#plSt').textContent = st; $('#plCh').textContent = ch;
  },
};

/* =====================================================================
   information · 2088 Records sleeve: drag the record (it rolls), flip the sleeve
   ===================================================================== */
const Sleeve = {
  el: null, x: { v: 0, vel: 0 }, tx: 0, px: 0, a: 0, rx: { v: 0, vel: 0 }, ry: { v: 0, vel: 0 }, trx: 0, try: 0,
  W: 0, D: 0, minX: 0, maxX: 0, rest: 0, out: false, drag: null, vis: false, seen: false, gx: 60, touched: false, idle: 0,
  init() {
    this.el = $('#slv'); if (!this.el) return;
    this.tilt = $('#slvTilt'); this.rec = $('#slvRec'); this.disc = $('#slvDisc'); this.card = $('#slvCard'); this.np = $('#slvNp span');
    this.measure();
    this.x.v = this.px = this.minX; this.tx = this.minX;
    if (window.ResizeObserver) new ResizeObserver(() => { this.measure(); this.tx = this.out ? this.maxX : this.rest; if (reduced) this.x.v = this.px = this.tx; }).observe(this.el);
    const io = window.IntersectionObserver ? new IntersectionObserver((es) => {
      for (const e of es) { this.vis = e.isIntersecting; if (this.vis && !this.seen) { this.seen = true; this.tx = this.rest; if (reduced) this.x.v = this.px = this.rest; } }
    }, { threshold: 0.3 }) : null;
    if (io) io.observe(this.el); else { this.vis = this.seen = true; this.tx = this.rest; }
    const d = this.disc;
    d.addEventListener('pointerdown', (e) => {
      if (e.button) return;
      d.setPointerCapture(e.pointerId);
      this.drag = { id: e.pointerId, x0: e.clientX, v0: this.x.v, lx: e.clientX, lt: now(), vx: 0, moved: false };
      this.el.classList.add('grab'); this.touched = true; AU.ui('tick');
    });
    d.addEventListener('pointermove', (e) => {
      const g = this.drag; if (!g || g.id !== e.pointerId) return;
      const dx = e.clientX - g.x0; if (Math.abs(dx) > 4) g.moved = true;
      let nx = g.v0 + dx;
      if (nx < this.minX) nx = this.minX - Math.pow(this.minX - nx, 0.7);
      if (nx > this.maxX) nx = this.maxX + Math.pow(nx - this.maxX, 0.7);
      const t = now(), dt = Math.max(1, t - g.lt);
      g.vx = g.vx * 0.6 + ((e.clientX - g.lx) / dt) * 1000 * 0.4; g.lx = e.clientX; g.lt = t;
      this.x.v = nx; this.x.vel = g.vx;
    });
    const up = (e) => {
      const g = this.drag; if (!g || g.id !== e.pointerId) return;
      this.drag = null; this.el.classList.remove('grab');
      if (!g.moved) { this.set(!this.out); return; }
      const mid = (this.rest + this.maxX) / 2;
      this.set(g.vx > 500 ? true : g.vx < -500 ? false : this.x.v > mid);
    };
    d.addEventListener('pointerup', up); d.addEventListener('pointercancel', up);
    d.addEventListener('click', (e) => { if (e.detail === 0) this.set(!this.out); });
    this.card.addEventListener('click', () => {
      this.touched = true;
      const f = this.card.getAttribute('aria-pressed') !== 'true';
      this.card.setAttribute('aria-pressed', String(f));
      this.card.setAttribute('aria-label', f ? 'Flip the sleeve back to the front' : 'Flip the sleeve');
      AU.ui('whoosh');
    });
    if (FINE) {
      this.el.addEventListener('pointermove', (e) => {
        if (reduced || e.pointerType !== 'mouse') return;
        const r = this.tilt.getBoundingClientRect(), u = (e.clientX - r.left) / r.width - 0.5, v = (e.clientY - r.top) / r.height - 0.5;
        this.try = clamp(u, -0.8, 0.8) * 14; this.trx = -clamp(v, -0.8, 0.8) * 10; this.gx = 100 - clamp(u + 0.5, 0, 1) * 100;
      });
      this.el.addEventListener('pointerleave', () => { this.trx = this.try = 0; this.gx = 60; });
    }
  },
  measure() {
    const sw = this.el.clientWidth; this.W = this.tilt.clientWidth || 1; this.D = this.W * 0.92;
    this.minX = this.W * 0.04; const room = sw < 600 ? sw - this.D * 0.65 : sw - this.D - 2;
    this.maxX = Math.max(this.minX + 10, Math.min(this.W * 0.9, room));
    this.rest = this.minX + (this.maxX - this.minX) * 0.52;
  },
  set(o) {
    if (o === this.out && !this.drag) { this.tx = o ? this.maxX : this.rest; return; }
    this.out = o; this.tx = o ? this.maxX : this.rest;
    this.el.classList.toggle('out', o);
    this.disc.setAttribute('aria-pressed', String(o));
    this.disc.setAttribute('aria-label', o ? 'Slide the record back into the sleeve' : 'Pull the record out of the sleeve');
    this.np.textContent = o ? 'Now spinning · 2088 Records' : 'In the sleeve';
    if (o) { AU.ui('lock', -5); Field.hit(0.45); } else AU.ui('switch', 330);
    if (reduced) this.x.v = this.px = this.tx;
  },
  frame(dt) {
    if (!this.el || !this.vis || Router.cur !== 'information') return;
    if (!this.drag && !reduced) {
      if (!this.touched && !this.out && this.seen) { this.idle += dt; if (this.idle > 3.6) { this.idle = 0; this.x.vel += 260; } }
      spring(this.x, this.tx, dt, 90, 15);
    }
    const x = this.x.v, dx = x - this.px; this.px = x;
    if (!reduced) {
      this.a += (dx / (this.D / 2)) * 57.2958;
      const s = clamp((x - this.rest) / Math.max(1, this.maxX - this.rest), 0, 1);
      this.a += dt * 200 * s * (this.drag ? 0.2 : 1);
      spring(this.rx, this.trx, dt, 70, 12); spring(this.ry, this.try, dt, 70, 12);
    }
    this.rec.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
    this.disc.style.transform = `rotate(${(this.a % 360).toFixed(2)}deg)`;
    this.tilt.style.transform = `perspective(1400px) rotateX(${this.rx.v.toFixed(2)}deg) rotateY(${this.ry.v.toFixed(2)}deg)`;
    this.el.style.setProperty('--gx', this.gx.toFixed(1) + '%');
  },
};
let last = now();
function loop(t) {
  const dt = Math.min(0.05, Math.max(0, (t - last) / 1000));
  last = t; tAll += dt;
  Seq.frame(dt);
  if (!Intro.visible) {
    Field.frame(dt);
    if (Router.cur === 'home') { WM.frame(dt); Hero.frame(dt); Arc.frame(dt); }
    Tuner.frame(dt);
    for (const m of MONS) m.frame(dt);
    Radar.frame(dt);
    Sleeve.frame(dt);
    ST.frame(tAll);
    Tapes.frame(dt);
    Slice.frame(dt);
    Ghost.frame();
    Player.frame();
  }
  Cur.frame(dt);
  requestAnimationFrame(loop);
}
function boot() {
  $$('[data-cmark]').forEach((el) => { el.innerHTML = cSVG(); });
  try { history.scrollRestoration = 'manual'; } catch (e) { /* ignore */ }
  Field.init(); Seq.init(); Slice.init(); Obs.init(); ST.init(); Tapes.init(); Ghost.init();
  Deck.init(); WM.init(); Hero.init(); Roles.init(); Tuner.init(); Arc.init(); Era.init(); Rel.init(); Radar.init();
  Menu.init(); Cur.init(); Keys.init();
  const initialAnchor = Router.init();
  Jellies.init(); Loops.init(); HeroC.init(); InfoC.init(); Sleeve.init(); spinOrigins();
  if (initialAnchor) Router.toAnchor(initialAnchor, true);
  $('#soundBtn').addEventListener('click', () => { AU.setOn(!AU.on); AU.ui('blip'); });
  $('#toTop').addEventListener('click', () => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));
  $$('[data-scroll]').forEach((b) => b.addEventListener('click', () => {
    const el = document.getElementById(b.dataset.scroll);
    if (el) scrollTo({ top: el.getBoundingClientRect().top + scrollY - 10, behavior: reduced ? 'auto' : 'smooth' });
  }));
  let plY = 0;
  addEventListener('scroll', () => {
    const y = scrollY; Field.scrollAcc += y - lastY; lastY = y;
    if (y > plY + 6 && y > 240) root.classList.add('pl-hide'); else if (y < plY - 6 || y < 240) root.classList.remove('pl-hide');
    if (Math.abs(y - plY) > 6) plY = y;
    if (!scrollRaf) scrollRaf = requestAnimationFrame(onScroll);
  }, { passive: true });
  $('#replayIntro').addEventListener('click', () => Intro.play());
  addEventListener('resize', () => { onScroll(); });
  const fontsIn = () => { WM.size(); Tapes.measure(); Rel.drawAll(); Hero.layout(); JELLY.forEach((j) => { j.measure(); j.snap(); }); Tuner.arts = TUNE.map((ch) => { if (!ch.art) return null; const cv = document.createElement('canvas'); cv.width = cv.height = 640; drawSleeve(cv.getContext('2d'), 640, ch.art); return cv; }); };
  if (document.fonts && document.fonts.load) Promise.all(['"CEL Black"', '"CEL Line"', '"CEL Cond"'].map((f) => document.fonts.load('40px ' + f).catch(() => null))).then(() => document.fonts.ready).then(fontsIn);
  else if (document.fonts && document.fonts.ready) document.fonts.ready.then(fontsIn);
  requestAnimationFrame((t) => { last = t; loop(t); });
}
function start() {
  Shutter.init();
  if (Intro.should()) Intro.play(boot);
  else {
    boot();
    themeColor.content = BLUE;
    WM.assemble();
  }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
