
"use strict";
const ASSETS = {"batS0":"img/batS0.webp","batS1":"img/batS1.webp","batS2":"img/batS2.webp","bg_ruins":"img/bg_ruins.webp","bigboom":"img/bigboom.webp","bigufo0":"img/bigufo0.webp","bigufo1":"img/bigufo1.webp","bomber0":"img/bomber0.webp","bomber1":"img/bomber1.webp","bomber2":"img/bomber2.webp","bomber3":"img/bomber3.webp","boom0":"img/boom0.webp","boom1":"img/boom1.webp","boom2":"img/boom2.webp","boom3":"img/boom3.webp","boom4":"img/boom4.webp","dive0":"img/dive0.webp","dive1":"img/dive1.webp","dive2":"img/dive2.webp","dive3":"img/dive3.webp","drone0":"img/drone0.webp","drone1":"img/drone1.webp","drone2":"img/drone2.webp","elite0":"img/elite0.webp","elite1":"img/elite1.webp","elite2":"img/elite2.webp","elite3":"img/elite3.webp","eshot0":"img/eshot0.webp","eshot1":"img/eshot1.webp","eshot2":"img/eshot2.webp","eshot3":"img/eshot3.webp","fighter0":"img/fighter0.webp","fighter1":"img/fighter1.webp","fighter2":"img/fighter2.webp","fighter3":"img/fighter3.webp","hbolt":"img/hbolt.webp","hcharge":"img/hcharge.webp","hlight":"img/hlight.webp","hshot0":"img/hshot0.webp","hshot1":"img/hshot1.webp","hshot2":"img/hshot2.webp","l1f":"img/l1f.webp","l1f_sky":"img/l1f_sky.webp","l1s_b":"img/l1s_b.webp","l1s_far":"img/l1s_far.webp","l1s_near":"img/l1s_near.webp","l2f":"img/l2f.webp","l2f_sky":"img/l2f_sky.webp","l2s_b":"img/l2s_b.webp","l2s_far":"img/l2s_far.webp","l2s_near":"img/l2s_near.webp","l3f":"img/l3f.webp","l3f_sky":"img/l3f_sky.webp","l3s_a":"img/l3s_a.webp","l3s_b":"img/l3s_b.webp","l4f_a":"img/l4f_a.webp","l4f_b":"img/l4f_b.webp","l4s_a":"img/l4s_a.webp","l4s_b":"img/l4s_b.webp","lv4f_panel":"img/lv4f_panel.webp","lv4s_panel":"img/lv4s_panel.webp","lv5f_panel":"img/lv5f_panel.webp","lv5s_panel":"img/lv5s_panel.webp","lv6f_panel":"img/lv6f_panel.webp","lv6s_panel":"img/lv6s_panel.webp","lv7f_panel":"img/lv7f_panel.webp","lv7s_panel":"img/lv7s_panel.webp","lv8f_panel":"img/lv8f_panel.webp","lv8s_panel":"img/lv8s_panel.webp","mother0":"img/mother0.webp","mother1":"img/mother1.webp","mother2":"img/mother2.webp","mother3":"img/mother3.webp","motherbeam":"img/motherbeam.webp","mothership":"img/mothership.webp","ps0":"img/ps0.webp","ps1":"img/ps1.webp","ps2":"img/ps2.webp","ps3":"img/ps3.webp","psa0":"img/psa0.webp","psa1":"img/psa1.webp","psa2":"img/psa2.webp","psa3":"img/psa3.webp","psa4":"img/psa4.webp","psa5":"img/psa5.webp","pshot0":"img/pshot0.webp","pshot1":"img/pshot1.webp","pshot2":"img/pshot2.webp","pshot3":"img/pshot3.webp","pshot4":"img/pshot4.webp","pu0":"img/pu0.webp","pu1":"img/pu1.webp","pu2":"img/pu2.webp","pu3":"img/pu3.webp","pu4":"img/pu4.webp","pub0":"img/pub0.webp","pub1":"img/pub1.webp","pub2":"img/pub2.webp","pub3":"img/pub3.webp","pub4":"img/pub4.webp","pv0":"img/pv0.webp","pv1":"img/pv1.webp","pv2":"img/pv2.webp","pv3":"img/pv3.webp","pv4":"img/pv4.webp","pv5":"img/pv5.webp","pv6":"img/pv6.webp","pv7":"img/pv7.webp","pvhit":"img/pvhit.webp","pvwreck":"img/pvwreck.webp","ring0":"img/ring0.webp","ring1":"img/ring1.webp","ring2":"img/ring2.webp","ring3":"img/ring3.webp","scout0":"img/scout0.webp","scout1":"img/scout1.webp","scout2":"img/scout2.webp","scout3":"img/scout3.webp","spawn0":"img/spawn0.webp","spawn1":"img/spawn1.webp","spawn2":"img/spawn2.webp","spider0":"img/spider0.webp","spider1":"img/spider1.webp","spider2":"img/spider2.webp","strafe0":"img/strafe0.webp","strafe1":"img/strafe1.webp","strafe2":"img/strafe2.webp","strafe3":"img/strafe3.webp","tbeam0":"img/tbeam0.webp","tbeam1":"img/tbeam1.webp","tbeam2":"img/tbeam2.webp","tbeam3":"img/tbeam3.webp","tbeam4":"img/tbeam4.webp","ufoS0":"img/ufoS0.webp","ufoS1":"img/ufoS1.webp","ufoS2":"img/ufoS2.webp","ufoS3":"img/ufoS3.webp"};
let W = 960; const H = 540;
const PHASE_DUR = 180; // seconds of play per view (3 minutes)
const C = document.getElementById('game');
const ctx = C.getContext('2d');
const IMG = {};
let loadedCount = 0, assetTotal = Object.keys(ASSETS).length;
for (const k in ASSETS) { const im = new Image(); im.onload = () => { loadedCount++; }; im.src = ASSETS[k] + '?v=6'; IMG[k] = im; }

// ---------- utils ----------
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const dist2 = (ax, ay, bx, by) => (ax - bx) ** 2 + (ay - by) ** 2;
function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }
function wpick(obj) { let s = 0; for (const k in obj) s += obj[k]; let r = Math.random() * s; for (const k in obj) { r -= obj[k]; if (r <= 0) return k; } return Object.keys(obj)[0]; }
function sz(name) { const im = IMG[name]; return im && im.width ? [im.width, im.height] : [40, 40]; }
function draw(name, x, y, sc = 1, rot = 0, alpha = 1, add = false, flip = false) {
  const im = IMG[name]; if (!im || !im.width) return;
  ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot); if (flip) ctx.scale(-1, 1);
  if (alpha !== 1) ctx.globalAlpha = alpha; if (add) ctx.globalCompositeOperation = 'lighter';
  ctx.drawImage(im, -im.width * sc / 2, -im.height * sc / 2, im.width * sc, im.height * sc);
  ctx.restore();
}
function lsGet(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

// Catmull-Rom path, sampled into a polyline walked at constant speed
function makePath(pts) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let j = 0; j < 14; j++) {
      const t = j / 14, t2 = t * t, t3 = t2 * t;
      out.push({
        x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
      });
    }
  }
  out.push(pts[pts.length - 1]);
  const L = [0];
  for (let i = 1; i < out.length; i++) L.push(L[i - 1] + Math.hypot(out[i].x - out[i - 1].x, out[i].y - out[i - 1].y));
  return { p: out, L, len: L[L.length - 1], i: 0 };
}
function pathAt(path, s) {
  const { p, L } = path;
  if (s >= path.len) return p[p.length - 1];
  while (path.i < L.length - 2 && L[path.i + 1] < s) path.i++;
  const a = p[path.i], b = p[path.i + 1], seg = L[path.i + 1] - L[path.i] || 1, t = (s - L[path.i]) / seg;
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

// ---------- audio ----------
let AC = null, muted = lsGet('legio_mute', '0') === '1', lastShootSfx = 0;
function initAudio() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } }
  if (AC && AC.state === 'suspended') AC.resume();
}
function tone(f, dur, type = 'square', vol = 0.04, f2 = 0, delay = 0) {
  if (!AC || muted) return;
  const t0 = AC.currentTime + delay, o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(AC.destination); o.start(t0); o.stop(t0 + dur + 0.02);
}
let noiseBuf = null;
function noise(dur, vol = 0.15, freq = 1200) {
  if (!AC || muted) return;
  if (!noiseBuf) { noiseBuf = AC.createBuffer(1, AC.sampleRate, AC.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(), t0 = AC.currentTime;
  s.buffer = noiseBuf; f.type = 'lowpass'; f.frequency.setValueAtTime(freq, t0); f.frequency.exponentialRampToValueAtTime(80, t0 + dur);
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  s.connect(f).connect(g).connect(AC.destination); s.start(t0); s.stop(t0 + dur);
}
const SFX = {
  shoot() { const n = performance.now(); if (n - lastShootSfx < 70) return; lastShootSfx = n; tone(1100, 0.06, 'square', 0.018, 520); },
  boom() { noise(0.35, 0.16, 1400); },
  bigboom() { noise(1.2, 0.3, 900); tone(90, 0.8, 'sawtooth', 0.05, 40); },
  hit() { tone(220, 0.05, 'square', 0.02, 160); },
  pickup() { [660, 880, 1320].forEach((f, i) => tone(f, 0.09, 'triangle', 0.06, 0, i * 0.06)); },
  ring() { tone(180, 0.6, 'sawtooth', 0.06, 1400); noise(0.5, 0.1, 3000); },
  charge() { tone(260, 0.35, 'sawtooth', 0.06, 1600); },
  die() { noise(1.0, 0.3, 700); tone(300, 0.9, 'square', 0.05, 50); },
  warn() { for (let i = 0; i < 4; i++) { tone(440, 0.18, 'square', 0.04, 0, i * 0.4); tone(330, 0.18, 'square', 0.04, 0, i * 0.4 + 0.2); } },
  fanfare() { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i === 5 ? 0.7 : 0.16, 'triangle', 0.07, 0, i * 0.17)); },
  life() { [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.12, 'square', 0.04, 0, i * 0.08)); }
};

// ---------- data ----------
const RANKS = [
  { name: 'Miles', title: 'Star Fighter, 1st Cohort', reward: '' },
  { name: 'Tesserarius', title: 'Watch Officer', reward: 'Twin ballista cannons fitted to your hull.' },
  { name: 'Optio', title: 'Second of the Century', reward: 'An aquila drone now flies on your wing.' },
  { name: 'Centurio', title: 'Commander of the Century', reward: 'Tesla charge shot: hold C, release to fire.' },
  { name: 'Primus Pilus', title: 'First Spear of the Legion', reward: 'Reinforced hull: +1 life, and every special +1.' },
  { name: 'Tribunus', title: 'Tribune of the Legion', reward: 'A second aquila drone joins your wing.' },
  { name: 'Legatus', title: 'Legate of the Star Legion', reward: 'Triple cannons fitted. Every special +1.' },
  { name: 'Imperator', title: 'Commander of the Empire', reward: '' }
];
const LEVELS = [
  { name: 'Training Fields', side: { bg: 'latiumSide', orders: 'Your first sortie from the training grounds. Saucers are raiding the grain fields. Drive them off.' },
    fwd: { bg: 'latiumFwd', orders: 'The raiders are regrouping over the fields. Push forward and break their formation.' } },
  { name: 'Attack on the City', side: { bg: 'romeSide', orders: 'The saucers are burning Rome. Sweep the walls and the river clear of raiders.' },
    fwd: { bg: 'romeFwd', orders: 'Fly the Via Sacra to the Colosseum. Their elite guard holds the avenue.' } },
  { name: 'Imperial Navy Academy', side: { bg: 'academySide', orders: 'The Mothership is heading for the Academia Navalis and its docked fleet. Bring it down.' },
    fwd: { bg: 'academyFwd', orders: 'Hold the great causeway of the Academy against their elite guard.' } },
  { name: 'Protecting the Capital', side: { bg: 'capitalSide', orders: 'The walls of Rome are burning. Fly the ramparts and break the assault.' },
    fwd: { bg: 'capitalFwd', orders: 'The saucers are over the Capitol itself. Hold the sky above the temple.' } },
  { name: 'Fire in the Skies', side: { bg: 'skiesSide', orders: 'Climb above the clouds and hunt the raiders among the sky ruins.' },
    fwd: { bg: 'skiesFwd', orders: 'An invasion fleet is breaking through the clouds. Meet it head on.' } },
  { name: 'Battle Above Earth', side: { bg: 'earthSide', orders: 'The Legion holds a fortress on the Moon. Defend its Tesla towers.' },
    fwd: { bg: 'earthFwd', orders: 'High orbit over Earth. Break their fleet before it reaches the world below.' } },
  { name: 'Fires Amongst the Stars', side: { bg: 'starsSide', orders: 'Chase the fleet through the asteroid ruins beyond Saturn.' },
    fwd: { bg: 'starsFwd', orders: 'Deep space. Their elite squadrons guard the road to the Mothership.' } },
  { name: 'UFO Mothership Battle', side: { bg: 'motherSide', orders: 'The Mothership itself. Strike the docking towers and bring down the hull.' },
    fwd: { bg: 'motherFwd', orders: 'Into the belly of the beast. End this war, Legatus.' } }
];
const T = {
  scout:   { spr: 'scout', n: 4, sc: .6, hp: 1, pts: 100, fire: .5, dive: 1 },
  fighter: { spr: 'fighter', n: 4, sc: .6, hp: 1, pts: 150, fire: .6, dive: 1.6 },
  bomber:  { spr: 'bomber', n: 4, sc: .62, hp: 2, pts: 200, fire: 1, dive: .8 },
  elite:   { spr: 'elite', n: 4, sc: .66, hp: 3, pts: 300, fire: 1.3, dive: 1.2 },
  diver:   { spr: 'dive', n: 4, sc: .75, hp: 1, pts: 250 },
  strafer: { spr: 'strafe', n: 4, sc: .62, hp: 2, pts: 300 },
  mother:  { spr: 'mother', n: 4, sc: 1.7, hp: 140, pts: 5000, boss: 1, ell: [.46, .4] },
  ufo:     { spr: 'ufoS', n: 4, sc: .72, hp: 1, pts: 100 },
  bat:     { spr: 'batS', n: 3, sc: .6, hp: 2, pts: 200, rot: Math.PI / 2 },
  spider:  { spr: 'spider', n: 3, sc: .62, hp: 3, pts: 300, rot: Math.PI / 2 },
  bigufo:  { spr: 'bigufo', n: 2, sc: 1.05, hp: 34, pts: 2000, boss: 1, ell: [.47, .42] },
  mothership: { spr: 'mothership', n: 1, sc: 1.25, hp: 420, pts: 10000, boss: 1, ell: [.47, .42] }
};
const PU_TYPES = { rapid: 28, tesla: 24, shield: 18, missile: 16, arsenal: 12, life: 5 };
const PU_SPR_F = { rapid: 'pu0', tesla: 'pu1', shield: 'pu2', missile: 'pu3', life: 'pu4' };
const PU_SPR_S = { rapid: 'pub0', tesla: 'pub1', missile: 'pub2', shield: 'pub3', life: 'pub4' };
const PU_NAME = { rapid: 'RAPID FIRE', tesla: 'TESLA POWER', shield: 'AEGIS SHIELD', missile: 'PILUM MISSILES', life: 'EXTRA LIFE', arsenal: 'ARSENAL RESUPPLY' };
// limited-use specials: key, label, starting charges, max charges
const SPECIALS = [
  { id: 'roll', key: '1', label: 'ROLL', start: 3, max: 5, name: 'BARREL ROLL' },
  { id: 'missile', key: '2', label: 'MSL', start: 2, max: 4, name: 'MISSILE STRIKE' },
  { id: 'drone', key: '3', label: 'DRONE', start: 2, max: 4, name: 'DRONE ATTACK' },
  { id: 'emp', key: '4', label: 'EMP', start: 2, max: 4, name: 'EMP BLAST' },
  { id: 'chain', key: '5', label: 'ARC', start: 3, max: 5, name: 'TESLA CHAIN STRIKE' }
];
const freshSpecials = () => Object.fromEntries(SPECIALS.map(s => [s.id, s.start]));

// ---------- state ----------
const G = {
  state: 'loading', t: 0, score: 0, hi: +lsGet('legio_hi', '0') || 0, lives: 3, rank: 0, phase: 0, sp: null, rollT: 0,
  tempPow: 0, rapidT: 0, missileT: 0, shield: 0, nextLife: 50000, kills: 0, shots: 0, hits: 0, paused: false,
  banner: null, flash: 0, shake: 0, phaseScore: 0
};
let P = null, enemies = [], pb = [], eb = [], fx = [], pickups = [], missiles = [], drones = [], particles = [], kdrones = [], arcs = [];
let ST = null; // current phase runtime
const view = () => ST ? ST.view : 'fwd';
const lvl = () => Math.floor(G.phase / 2);

// ---------- input ----------
const keys = {}, hit = {};
const KMAP = { ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r', ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd',
  Space: 'f', KeyZ: 'f', KeyJ: 'f', KeyX: 's4', KeyC: 'c', KeyL: 'c', ShiftLeft: 's1', ShiftRight: 's1', Digit1: 's1', Digit2: 's2', Digit3: 's3', Digit4: 's4', Digit5: 's5', Numpad1: 's1', Numpad2: 's2', Numpad3: 's3', Numpad4: 's4', Numpad5: 's5', KeyP: 'p', Escape: 'p', KeyM: 'm', Enter: 'e', NumpadEnter: 'e' };
addEventListener('keydown', e => {
  const k = KMAP[e.code]; initAudio();
  if (k) { if (!keys[k]) hit[k] = true; keys[k] = true; e.preventDefault(); }
});
addEventListener('keyup', e => { const k = KMAP[e.code]; if (k) { keys[k] = false; e.preventDefault(); } });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; if (G.state === 'play') G.paused = true; });
const touch = { id: null, sx: 0, sy: 0, px: 0, py: 0, active: false };
function toLogical(e) { const r = C.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; }
C.addEventListener('pointerdown', e => {
  initAudio(); C.focus();
  if (G.state === 'cut') return;
  if (G.state !== 'play' || G.paused) { goFull(); hit.e = true; G.paused = false; return; }
  if (e.pointerType === 'mouse') return;
  const q = toLogical(e); touch.id = e.pointerId; touch.sx = q.x; touch.sy = q.y; touch.px = P.x; touch.py = P.y; touch.active = true;
  C.setPointerCapture(e.pointerId);
});
C.addEventListener('pointermove', e => {
  if (!touch.active || e.pointerId !== touch.id || !P) return;
  const q = toLogical(e); P.tx = touch.px + (q.x - touch.sx) * 1.3; P.ty = touch.py + (q.y - touch.sy) * 1.3;
});
const endTouch = e => { if (e.pointerId === touch.id) { touch.active = false; touch.id = null; if (P) { P.tx = null; P.ty = null; } } };
C.addEventListener('pointerup', endTouch); C.addEventListener('pointercancel', endTouch);
const spBtns = [...document.querySelectorAll('.sbtn[data-sp]')], bCharge = document.getElementById('bCharge');
const coarse = matchMedia('(pointer:coarse)').matches;
const zap = b => { b.classList.add('zap'); setTimeout(() => b.classList.remove('zap'), 160); };
spBtns.forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); initAudio(); if (G.state === 'play' && !G.paused) { zap(b); useSpecial(b.dataset.sp); } }));
// on phones, the first taps also ask for full screen in landscape so the game can use the whole display
function goFull() {
  const d = document.documentElement, rq = d.requestFullscreen || d.webkitRequestFullscreen;
  if (!coarse || !rq || document.fullscreenElement || document.webkitFullscreenElement) return;
  try { const p = rq.call(d, { navigationUI: 'hide' }); const lock = () => { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); };
    if (p && p.then) p.then(lock).catch(() => {}); else lock(); } catch (err) {}
}
bCharge.addEventListener('pointerdown', e => { e.preventDefault(); keys.c = true; bCharge.classList.add('held'); });
const chargeUp = () => { keys.c = false; bCharge.classList.remove('held'); };
bCharge.addEventListener('pointerup', chargeUp); bCharge.addEventListener('pointercancel', chargeUp); bCharge.addEventListener('pointerleave', chargeUp);

// ---------- sizing ----------
function resize() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const st = document.getElementById('stage'); let aw = st.clientWidth, ah = st.clientHeight;
  // phones: leave room for the button columns at the sides (landscape) or the button panel below (portrait)
  if (coarse) { if (aw >= ah) aw -= 2 * 84; else ah -= Math.min(ah * 0.4, 330); }
  // stretch the play area to the shape of the space instead of letterboxing a fixed 16:9 screen
  const nw = Math.round(Math.max(720, Math.min(1280, H * aw / Math.max(1, ah))));
  if (nw !== W) {
    const k = nw / W; W = nw; skyCache = {};
    if (typeof stars !== 'undefined') for (const p of stars) p.x *= k;
    if (typeof P !== 'undefined' && P) { P.x = Math.min(P.x, W - 30); }
  }
  C.width = Math.round(W * dpr); C.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.imageSmoothingQuality = 'high';
  const s = Math.min(aw / W, ah / H);
  C.style.width = Math.floor(W * s) + 'px'; C.style.height = Math.floor(H * s) + 'px';
}
addEventListener('resize', resize); addEventListener('orientationchange', () => setTimeout(resize, 120)); document.addEventListener('fullscreenchange', resize);
addEventListener('resize', () => setTimeout(placeCut, 0));

// ---------- backgrounds ----------
const stars = Array.from({ length: 160 }, () => ({ x: Math.random() * W, y: Math.random() * H, z: rnd(0.2, 1), a: Math.random() * 6.28 }));
let skyCache = {};
function skyGradient(kind) {
  if (skyCache[kind]) return skyCache[kind];
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const cols = {
    dusk: ['#0b0d2a', '#2b2350', '#7a3f5c', '#d7865a'],
    storm: ['#07050c', '#1a1024', '#3b1626', '#6b2a2a'],
    moon: ['#02030a', '#070a1c', '#0d1030', '#141236'],
    void: ['#000000', '#05030c', '#0c0618', '#100820']
  }[kind];
  const gr = g.createLinearGradient(0, 0, 0, H); cols.forEach((col, i) => gr.addColorStop(i / (cols.length - 1), col));
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // nebula wisps
  for (let i = 0; i < 9; i++) {
    const x = Math.random() * W, y = Math.random() * H * 0.7, r = rnd(80, 220);
    const ng = g.createRadialGradient(x, y, 0, x, y, r);
    const hue = kind === 'storm' ? 'rgba(160,40,60,' : kind === 'dusk' ? 'rgba(120,60,140,' : 'rgba(90,60,200,';
    ng.addColorStop(0, hue + '0.18)'); ng.addColorStop(1, hue + '0)'); g.fillStyle = ng; g.fillRect(0, 0, W, H);
  }
  return (skyCache[kind] = c);
}
let ruinsFaded = null;
function getRuinsFaded() {
  if (ruinsFaded || !IMG.bg_ruins || !IMG.bg_ruins.width) return ruinsFaded;
  const im = IMG.bg_ruins, c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
  const g = c.getContext('2d'); g.drawImage(im, 0, 0); g.globalCompositeOperation = 'destination-in';
  const gr = g.createLinearGradient(0, 0, 0, 70); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)');
  g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
  return (ruinsFaded = c);
}
function tileMirror(im, y, h, offset) {
  if (!im || !im.width) return;
  const w = im.width * (h / im.height); let idx = Math.floor(offset / w), x = -(offset - idx * w);
  for (; x < W; x += w, idx++) {
    if (idx & 1) { ctx.save(); ctx.translate(x + w, y); ctx.scale(-1, 1); ctx.drawImage(im, 0, 0, w, h); ctx.restore(); }
    else ctx.drawImage(im, x, y, w, h);
  }
}
function tileRepeat(im, y, h, offset) {
  if (!im || !im.width) return;
  const w = im.width * (h / im.height); let x = -(offset % w);
  for (; x < W; x += w) ctx.drawImage(im, x, y, w + 1, h);
}
function drawStars(dt, mode, speed) {
  for (const s of stars) {
    if (mode === 'down') { s.y += s.z * speed * dt; if (s.y > H) { s.y = 0; s.x = Math.random() * W; } }
    else if (mode === 'left') { s.x -= s.z * speed * dt; if (s.x < 0) { s.x = W; s.y = Math.random() * H; } }
    else if (mode === 'warp') {
      const dx = s.x - W / 2, dy = s.y - H * 0.35, d = Math.hypot(dx, dy) || 1;
      const v = (20 + d * 1.6) * s.z * dt * speed / 100; s.x += dx / d * v; s.y += dy / d * v;
      if (s.x < 0 || s.x > W || s.y < 0 || s.y > H) { s.x = W / 2 + rnd(-40, 40); s.y = H * 0.35 + rnd(-30, 30); }
    }
    s.a += dt * 3;
    const b = 0.5 + 0.5 * Math.sin(s.a);
    ctx.fillStyle = `rgba(${200 + 55 * b | 0},${210 + 45 * b | 0},255,${0.35 + 0.65 * s.z})`;
    const r = s.z * 1.6;
    if (mode === 'warp') {
      const dx = s.x - W / 2, dy = s.y - H * 0.35, d = Math.hypot(dx, dy) || 1, len = Math.min(18, d * 0.05) * s.z;
      ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = r; ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - dx / d * len, s.y - dy / d * len); ctx.stroke();
    } else ctx.fillRect(s.x, s.y, r, r);
  }
}
function drawMoon(t) {
  const x = W * 0.78, y = 120 + Math.sin(t * 0.05) * 6, r = 70;
  const g = ctx.createRadialGradient(x - 20, y - 20, 10, x, y, r);
  g.addColorStop(0, '#e6e2d6'); g.addColorStop(0.7, '#9c978c'); g.addColorStop(1, '#4a4842');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(60,58,52,.35)';
  [[-20, -10, 12], [18, 14, 16], [-5, 30, 8], [30, -25, 9], [-35, 20, 7]].forEach(([dx, dy, rr]) => { ctx.beginPath(); ctx.arc(x + dx, y + dy, rr, 0, 7); ctx.fill(); });
}
function drawBackground(dt) {
  const kind = ST ? ST.bg : 'title', t = G.t;
  // each side view has two backdrops: the first half of the view, then a crossfade to the second around the mid-boss
  const SIDEBG = {
    latiumSide: [['l1s_far', 'l1s_near', 660, 640], ['l1s_b']],
    romeSide: [['l2s_far', 'l2s_near', 710, 690], ['l2s_b']],
    academySide: [['l3s_a'], ['l3s_b']],
    capitalSide: [['l4s_a'], ['l4s_b']],
    skiesSide: [['lv5s_panel'], ['lv5s_panel']],
    earthSide: [['lv6s_panel'], ['lv6s_panel']],
    starsSide: [['lv7s_panel'], ['lv7s_panel']],
    motherSide: [['lv8s_panel'], ['lv8s_panel']]
  };
  const FWDBG = {
    latiumFwd: [{ img: 'l1f', sky: 'l1f_sky', vx: 836, vy: 268, streak: 'rgba(255,236,150,.55)' }],
    romeFwd: [{ img: 'l2f', sky: 'l2f_sky', vx: 836, vy: 300, streak: 'rgba(255,190,220,.45)', dark: 0.18 }],
    academyFwd: [{ img: 'l3f', sky: 'l3f_sky', vx: 836, vy: 80, streak: 'rgba(150,200,255,.45)', zoom: 0.3 }],
    capitalFwd: [{ img: 'l4f_a', vx: 512, vy: 120, streak: 'rgba(255,210,150,.45)', zoom: 0.35, dark: 0.12 }, { img: 'l4f_b', vx: 512, vy: 110, streak: 'rgba(255,210,150,.45)', zoom: 0.35, dark: 0.12 }],
    skiesFwd: [{ img: 'lv5f_panel', vx: 350, vy: 40, streak: 'rgba(255,230,200,.5)', zoom: 0.4 }],
    earthFwd: [{ img: 'lv6f_panel', vx: 350, vy: 40, streak: 'rgba(200,220,255,.5)', zoom: 0.25, warp: 1 }],
    starsFwd: [{ img: 'lv7f_panel', vx: 430, vy: 60, streak: 'rgba(230,200,255,.5)', zoom: 0.4, warp: 1 }],
    motherFwd: [{ img: 'lv8f_panel', vx: 350, vy: 60, streak: 'rgba(255,150,150,.5)', zoom: 0.25, warp: 1 }]
  };
  if (SIDEBG[kind]) {
    ST.scrollFar += dt * 32; ST.scrollNear += dt * 150;
    const pr = ST.t / ST.dur, mix = clamp((pr - 0.47) / 0.05, 0, 1);
    const drawSet = (set) => {
      const s = H / 941;
      if (set.length > 1) { const [fn, nn, fh, ny] = set; tileMirror(IMG[fn], 0, fh * s, ST.scrollFar); tileMirror(IMG[nn], ny * s, (941 - ny) * s, ST.scrollNear); }
      else tileRepeat(IMG[set[0]], 0, H, ST.scrollFar * 1.6);
    };
    const [A, B] = SIDEBG[kind];
    if (mix < 1) drawSet(A);
    if (mix > 0) { ctx.save(); ctx.globalAlpha = mix; drawSet(B); ctx.restore(); }
    if (kind === 'romeSide') { ctx.fillStyle = 'rgba(12,6,24,.22)'; ctx.fillRect(0, 0, W, H); }
  } else if (FWDBG[kind]) {
    ST.zoomP = (ST.zoomP + dt / 2.6) % 1;
    const cfgs = FWDBG[kind], pr = ST.t / ST.dur, mix = cfgs.length > 1 ? clamp((pr - 0.47) / 0.05, 0, 1) : 0;
    const drawCfg = (c) => {
      const im = IMG[c.img]; if (!im || !im.width) return null;
      const s = Math.max(W / im.width, H / im.height), ox = (W - im.width * s) / 2, oy = (H - im.height * s) / 2;
      const vpx = ox + c.vx * s, vpy = oy + c.vy * s, za = c.zoom == null ? 0.7 : c.zoom;
      const q1 = ST.zoomP, q2 = (q1 + 0.5) % 1, older = Math.max(q1, q2), newer = Math.min(q1, q2);
      const drawZ = (q, a) => { const sc = 1 + za * q; ctx.save(); ctx.globalAlpha *= a; ctx.translate(vpx, vpy); ctx.scale(sc, sc); ctx.translate(-vpx, -vpy); ctx.drawImage(im, ox, oy, im.width * s, im.height * s); ctx.restore(); };
      drawZ(older, 1); drawZ(newer, newer / 0.5);
      if (c.sky && IMG[c.sky] && IMG[c.sky].width) ctx.drawImage(IMG[c.sky], ox, oy, IMG[c.sky].width * s, IMG[c.sky].height * s);
      return { vpx, vpy };
    };
    const A = cfgs[0], B = cfgs[1] || cfgs[0];
    let vp = null;
    if (mix < 1) vp = drawCfg(A);
    if (mix > 0) { ctx.save(); ctx.globalAlpha = mix; vp = drawCfg(B) || vp; ctx.restore(); }
    if (!vp) return;
    const c = mix > 0.5 ? B : A, { vpx, vpy } = vp;
    if (c.warp) drawStars(dt, 'warp', 140);
    // streaks flying past for speed
    if (particles.length < 70) particles.push({ x: vpx + rnd(-60, 60), y: vpy + rnd(10, 30), v: rnd(0.6, 1.4) });
    ctx.strokeStyle = c.streak;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i], dx = p.x - vpx, dy = p.y - vpy + 8; const k = 1 + dt * 1.6 * p.v;
      p.x = vpx + dx * k; p.y = vpy - 8 + dy * k;
      if (p.y > H || p.x < 0 || p.x > W) { particles.splice(i, 1); continue; }
      const l = Math.min(14, dy * 0.06); ctx.lineWidth = 1 + dy / 140;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - dx * 0.04, p.y - l); ctx.stroke();
    }
    // vignette for readability
    const dk = c.dark || 0; const vg = ctx.createLinearGradient(0, 0, 0, H); vg.addColorStop(0, `rgba(0,0,30,${0.15 + dk})`); vg.addColorStop(1, `rgba(30,10,0,${0.25 + dk})`);
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  } else if (kind === 'dusk' || kind === 'storm') {
    ctx.drawImage(skyGradient(kind), 0, 0);
    drawStars(dt, 'left', kind === 'storm' ? 40 : 25);
    ST.scrollNear += dt * 110;
    if (kind === 'dusk') { const rf = getRuinsFaded(); if (rf) tileMirror(rf, H - 200, 200, ST.scrollNear); }
    if (kind === 'storm') {
      ST.lightT -= dt;
      if (ST.lightT <= 0) { ST.lightT = rnd(3, 8); ST.bolt = { x: rnd(100, W - 100), t: 0.35 }; }
      if (ST.bolt && ST.bolt.t > 0) {
        ST.bolt.t -= dt; ctx.fillStyle = `rgba(200,200,255,${ST.bolt.t * 0.5})`; ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = 'rgba(220,230,255,.9)'; ctx.lineWidth = 2; ctx.beginPath(); let x = ST.bolt.x; ctx.moveTo(x, 0);
        for (let y = 0; y < H - 150; y += 30) { x += rnd(-25, 25); ctx.lineTo(x, y); } ctx.stroke();
      }
    }
  } else if (kind === 'moon' || kind === 'void') {
    ctx.drawImage(skyGradient(kind), 0, 0);
    if (kind === 'moon') drawMoon(t);
    drawStars(dt, 'warp', kind === 'void' ? 260 : 160);
  } else {
    ctx.drawImage(skyGradient('moon'), 0, 0); drawStars(dt, 'down', 30);
  }
}

// ---------- phase setup ----------
function startPhase(i, keepPlayer) {
  G.phase = i; const L = LEVELS[lvl()], v = i % 2 === 0 ? 'side' : 'fwd', d = v === 'side' ? L.side : L.fwd;
  ST = { view: v, bg: d.bg, t: 0, dur: PHASE_DUR, intro: 3.2, scrollFar: 0, scrollNear: 0, zoomP: 0, lightT: 4, bolt: null,
    waveT: 2.5, midDone: false, midActive: false, bossSpawned: false, bossDead: false, clearT: -1, hazardT: 12,
    form: null, formGap: 1, formCount: 0, endT: -1 };
  enemies = []; pb = []; eb = []; fx = []; pickups = []; missiles = []; particles = []; kdrones = []; arcs = [];
  P = newPlayer(); G.phaseScore = 0;
  drones = []; for (let k = 0; k < droneCount(); k++) drones.push({ x: P.x, y: P.y, cd: rnd(0, .3), k });
  G.banner = { title: (v === 'side' ? 'SIDE ASSAULT' : 'FORWARD ASSAULT') + '  ·  LEVEL ' + (lvl() + 1), sub: L.name, orders: d.orders, t: 3.2 };
  G.state = 'play';
}
function newPlayer() {
  const side = view() === 'side';
  return { x: side ? 150 : W / 2, y: side ? H / 2 : H - 60, tx: null, ty: null, inv: 2.5, dead: false, deadT: 0, cd: 0, charge: 0, vx: 0, vy: 0, hitT: 0 };
}
const baseGun = () => G.rank >= 6 ? 3 : G.rank >= 1 ? 2 : 1;
const droneCount = () => G.rank >= 5 ? 2 : G.rank >= 2 ? 1 : 0;
const gunLevel = () => Math.min(5, baseGun() + G.tempPow);
const lvlC = () => Math.min(3, Math.round(lvl() * 3 / 7));
const difficulty = () => lvl() * 0.4 + (ST ? Math.min(1, ST.t / ST.dur) : 0) * 0.9;

// ---------- spawning ----------
function mkEnemy(type, x, y, extra) {
  const tp = T[type], [w, h] = sz(tp.n > 1 ? tp.spr + '0' : tp.spr);
  const hpScale = tp.boss ? (1 + lvl() * 0.3) : 1;
  const e = Object.assign({ type, tp, x, y, hp: Math.round(tp.hp * hpScale), maxHp: Math.round(tp.hp * hpScale), w: w * tp.sc, h: h * tp.sc,
    r: Math.min(w, h) * tp.sc * 0.45, t: rnd(0, 3), flash: 0, cd: rnd(1.5, 4), rot: 0, delay: 0, beh: 'line', vx: 0, vy: 0, scale: 1, s: 0 }, extra || {});
  enemies.push(e); return e;
}
// --- side view waves ---
function sideWave() {
  const d = difficulty(), Lv = lvl(), pr = ST.t / ST.dur;
  const pool = { line: 3, sine: 3, swoop: 2 + d };
  if (Lv >= 1 || pr > 0.35) pool.spider = 1 + Lv;
  if (pr > 0.6 || Lv >= 1) pool.mixed = 1.5;
  const kind = wpick(pool), sp = 150 + d * 30;
  if (kind === 'line' || kind === 'sine') {
    const n = 4 + Math.floor(d * 1.5) + (Math.random() * 2 | 0), y = rnd(70, H - 120);
    for (let i = 0; i < n; i++) mkEnemy('ufo', W + 40 + i * 58, y, { beh: kind, y0: y, vx: -sp, amp: rnd(40, 90), ph: i * 0.55 });
  } else if (kind === 'swoop') {
    const n = 3 + Math.floor(d), top = Math.random() < 0.5, y0 = top ? -40 : H + 40;
    const ty = clamp(P.y, 80, H - 80);
    for (let i = 0; i < n; i++) {
      const e = mkEnemy(Lv >= 1 && Math.random() < 0.5 ? 'bat' : (Lv === 0 && pr < 0.25 ? 'ufo' : 'bat'), W + 40, y0, { beh: 'path', delay: i * 0.32, spd: sp * 1.6 });
      e.path = makePath([{ x: W + 40, y: y0 }, { x: W * 0.72, y: top ? H * 0.3 : H * 0.7 }, { x: W * 0.45, y: ty }, { x: W * 0.2, y: top ? H * 0.75 : H * 0.25 }, { x: -80, y: top ? H + 40 : -40 }]);
    }
  } else if (kind === 'spider') {
    const n = 1 + Math.floor(d * 0.8);
    for (let i = 0; i < n; i++) mkEnemy('spider', W + 50 + i * 70, 90 + (H - 260) * (n === 1 ? 0.5 : i / (n - 1)), { beh: 'spider', stopX: W * 0.74 - i * 30, hold: 4 });
  } else {
    for (let i = 0; i < 4; i++) mkEnemy('ufo', W + 40 + i * 60, 90 + i * 30, { beh: 'sine', y0: 90 + i * 30, vx: -sp, amp: 40, ph: i });
    const ty = clamp(P.y, 80, H - 80);
    for (let i = 0; i < 3; i++) { const e = mkEnemy('bat', W + 40, H + 40, { beh: 'path', delay: 1 + i * 0.3, spd: sp * 1.7 }); e.path = makePath([{ x: W + 40, y: H + 40 }, { x: W * 0.6, y: H * 0.6 }, { x: W * 0.35, y: ty }, { x: -80, y: H * 0.2 }]); }
  }
}
function spawnBigUfo(y) { return mkEnemy('bigufo', W + 120, y, { beh: 'bigufo', y0: y }); }
// --- forward view formations ---
function buildFormation() {
  const d = difficulty(), Lv = lvl(), pr = ST.t / ST.dur;
  const cols = clamp(8 + Math.floor(d), 8, 10), nrows = 3 + (d > 0.8 ? 1 : 0);
  const typesByRow = [];
  const top = Lv >= 1 ? (Math.random() < 0.5 ? 'elite' : 'bomber') : (pr > 0.5 ? 'bomber' : 'fighter');
  typesByRow.push(top); typesByRow.push(Lv >= 1 || pr > 0.3 ? 'fighter' : 'scout');
  for (let r = 2; r < nrows; r++) typesByRow.push(Lv >= 2 && r === 2 ? 'fighter' : 'scout');
  const slots = [];
  typesByRow.forEach((type, r) => {
    const n = r === 0 ? cols - 2 : cols;
    for (let c = 0; c < n; c++) slots.push({ type, sx: W / 2 + (c - (n - 1) / 2) * 64, sy: 62 + r * 50 });
  });
  const groups = []; for (let i = 0; i < slots.length; i += 5) groups.push(slots.slice(i, i + 5));
  const sides = ['H', 'L', 'R', 'TL', 'TR', 'H'];
  ST.form = { queue: groups.map((g, i) => ({ g, side: sides[i % sides.length], at: 0.4 + i * 1.25 })), t: 0, live: 0, attackT: 3, age: 0 };
  ST.formCount++;
}
function slotPos(e) {
  const f = ST.form, t = ST.t, br = 1 + 0.05 * Math.sin(t * 1.7), sway = Math.sin(t * 0.6) * 40;
  return { x: W / 2 + (e.sx - W / 2) * br + sway, y: 62 + (e.sy - 62) * br };
}
function entryPath(side, sx, sy) {
  const m = side === 'R' || side === 'TR' ? -1 : 1, cx = W / 2;
  if (side === 'H') return null;
  if (side === 'L' || side === 'R') return makePath([{ x: cx - m * (W / 2 + 40), y: H * 0.78 }, { x: cx - m * 220, y: H * 0.6 }, { x: cx - m * 40, y: H * 0.42 }, { x: cx - m * 180, y: H * 0.25 }, { x: sx, y: sy }]);
  return makePath([{ x: cx - m * 120, y: -40 }, { x: cx - m * 80, y: H * 0.35 }, { x: cx - m * 300, y: H * 0.55 }, { x: cx - m * 380, y: H * 0.3 }, { x: sx, y: sy }]);
}
function spawnGroup(q) {
  const d = difficulty();
  q.g.forEach((s, i) => {
    const e = mkEnemy(s.type, 0, -100, { beh: 'enter', sx: s.sx, sy: s.sy, delay: i * 0.16, spd: 330 + d * 30, form: true, side: q.side });
    if (q.side === 'H') { e.hz = { x: W / 2 + rnd(-30, 30), y: 150, t: 0 }; e.x = e.hz.x; e.y = e.hz.y; e.scale = 0.15; }
    else { e.path = entryPath(q.side, s.sx, s.sy); const p0 = e.path.p[0]; e.x = p0.x; e.y = p0.y; }
  });
}
function startDive(e) {
  const dir = e.x < P.x ? 1 : -1, d = difficulty();
  e.beh = 'dive'; e.s = 0; e.spd = 250 + d * 35; e.shotsLeft = e.type === 'bomber' ? 1 : 2; e.spread = e.type === 'bomber';
  e.path = makePath([{ x: e.x, y: e.y }, { x: e.x - dir * 50, y: e.y - 40 }, { x: e.x - dir * 90, y: e.y + 20 },
    { x: clamp(P.x + rnd(-60, 60), 40, W - 40), y: H * 0.62 }, { x: clamp(P.x + dir * 120, -20, W + 20), y: H * 0.86 }, { x: clamp(P.x + dir * 220, -60, W + 60), y: H + 60 }]);
}
function spawnHazard() {
  const Lv = lvl();
  if (Math.random() < 0.5) {
    const ltr = Math.random() < 0.5, y = rnd(210, 290);
    mkEnemy('strafer', ltr ? -60 : W + 60, y, { beh: 'strafe', vx: (ltr ? 1 : -1) * (210 + Math.min(Lv, 4) * 20), y0: y });
  } else {
    const x0 = rnd(150, W - 150), dir = x0 < W / 2 ? 1 : -1;
    for (let i = 0; i < 3; i++) {
      const e = mkEnemy('diver', x0, -50, { beh: 'path', delay: i * 0.28, spd: 340 + Math.min(Lv, 4) * 20, dshoot: true });
      e.path = makePath([{ x: x0, y: -50 }, { x: x0 + dir * 60, y: H * 0.25 }, { x: clamp(P.x, 60, W - 60), y: H * 0.65 }, { x: clamp(P.x - dir * 200, -80, W + 80), y: H + 60 }]);
    }
  }
}
function spawnBoss() {
  ST.bossSpawned = true; SFX.warn();
  const L = lvl();
  if (ST.view === 'side') {
    if (L === 2 || L === 7) { mkEnemy('mothership', W * 0.7, -120, { beh: 'mothership', phase: 0, atk: 2.5, cycle: 0 }); G.banner = { title: 'WARNING', sub: 'The Mothership descends', t: 2.6, warn: true }; }
    else { const n = Math.min(4, 2 + Math.floor(L / 2)); for (let i = 0; i < n; i++) { const b = spawnBigUfo(100 + i * (H - 260) / Math.max(1, n - 1)); b.bossGroup = true; b.delay = i * 0.8; } G.banner = { title: 'WARNING', sub: n + ' saucer decurions inbound', t: 2.6, warn: true }; }
  } else {
    const b = mkEnemy('mother', W / 2, -120, { beh: 'mother', atk: 2, cycle: 0, y0: 120 });
    fx.push({ k: 'spawn', x: W / 2, y: 120, t: 0, sc: 2.5 });
    G.banner = { title: 'WARNING', sub: L === 7 ? 'The Imperator of the Saucers' : 'Hive carrier approaching', t: 2.6, warn: true };
  }
}

// ---------- shooting ----------
function eShot(x, y, vx, vy, kind) { eb.push({ x, y, vx, vy, r: kind === 1 ? 5 : 7, k: kind || 0 }); }
function aimShot(e, speed, spreadN = 1, spreadA = 0.25) {
  const a = Math.atan2(P.y - e.y, P.x - e.x);
  for (let i = 0; i < spreadN; i++) { const aa = a + (spreadN > 1 ? (i / (spreadN - 1) - 0.5) * spreadA * 2 : 0); eShot(e.x, e.y, Math.cos(aa) * speed, Math.sin(aa) * speed, 1); }
}
function playerFire() {
  const side = view() === 'side', lv = gunLevel();
  const pat = [null, [[0, 0]], [[-9, 0], [9, 0]], [[-12, -.04], [0, 0], [12, .04]], [[-14, -.05], [-5, 0], [5, 0], [14, .05]], [[-16, -.16], [-8, -.05], [0, 0], [8, .05], [16, .16]]][lv];
  for (const [o, a] of pat) {
    if (side) pb.push({ x: P.x + 50, y: P.y + o + 4, vx: Math.cos(a) * 780, vy: Math.sin(a) * 780, r: 8, dmg: 1, k: 'h' });
    else pb.push({ x: P.x + o, y: P.y - 30, vx: Math.sin(a) * 680, vy: -Math.cos(a) * 680, r: 7, dmg: 1, k: 'v' });
    G.shots++;
  }
  SFX.shoot();
}
function fireCharge(power) {
  const side = view() === 'side';
  pb.push(side ? { x: P.x + 60, y: P.y, vx: 640, vy: 0, r: 30, dmg: 3 + power * 5, k: 'C', pierce: true, hitSet: new Map() }
               : { x: P.x, y: P.y - 40, vx: 0, vy: -600, r: 30, dmg: 3 + power * 5, k: 'C', pierce: true, hitSet: new Map() });
  SFX.charge();
}
function liveTargets() { return enemies.filter(e => !e.dead && e.delay <= 0 && e.x > -20 && e.x < W + 20 && e.y > -20 && e.y < H + 20 && !(e.hz && e.scale < 0.6)); }
function useSpecial(id) {
  if (G.state !== 'play' || G.paused || !P || P.dead || !G.sp || G.sp[id] <= 0) return;
  if (id === 'roll' && G.rollT > 0) return;
  if ((id === 'chain' || id === 'drone' || id === 'missile') && !liveTargets().length) { toast('NO TARGETS'); return; }
  G.sp[id]--;
  const side = view() === 'side';
  if (id === 'roll') {
    // quick sideways dodge, untouchable while spinning
    let dx = (keys.r ? 1 : 0) - (keys.l ? 1 : 0), dy = (keys.d ? 1 : 0) - (keys.u ? 1 : 0);
    if (!dx && !dy) { if (side) dy = P.y > H / 2 ? -1 : 1; else dx = P.x > W / 2 ? -1 : 1; }
    if (side) dx *= 0.5; else dy *= 0.4;
    const n = Math.hypot(dx, dy) || 1; G.rollT = 0.6; P.rollV = { x: dx / n * 330, y: dy / n * 330 }; P.inv = Math.max(P.inv, 0.65);
    tone(500, 0.3, 'triangle', 0.05, 900);
  } else if (id === 'missile') {
    // salvo of 12 homing pila
    for (let i = 0; i < 12; i++) setTimeoutGame(() => { if (!P) return; const a = (side ? 0 : -Math.PI / 2) + rnd(-1.2, 1.2); missiles.push({ x: P.x, y: P.y, vx: Math.cos(a) * 260, vy: Math.sin(a) * 260, t: 0, big: true }); tone(300, 0.12, 'sawtooth', 0.03, 120); }, i * 0.06);
  } else if (id === 'drone') {
    // four kamikaze aquila drones hunt the nearest enemies and detonate
    for (let i = 0; i < 4; i++) kdrones.push({ x: P.x, y: P.y, vx: side ? 120 : (i - 1.5) * 140, vy: side ? (i - 1.5) * 140 : -120, t: 0 });
    tone(700, 0.25, 'square', 0.04, 1200);
  } else if (id === 'emp') {
    // clears every enemy shot and stuns the fleet
    fx.push({ k: 'emp', x: P.x, y: P.y, t: 0, hitDone: new Set() }); eb.length = 0; G.flash = 0.45; SFX.ring();
    for (const e of enemies) { e.stun = e.tp.boss ? 1.5 : 3.5; if (!e.tp.boss) damageEnemy(e, 1); }
  } else if (id === 'chain') {
    // lightning that jumps between nearby enemies
    const pool = liveTargets(); let from = { x: side ? P.x + 50 : P.x, y: side ? P.y : P.y - 34 }; const pts = [from]; const done = new Set();
    for (let j = 0; j < 8; j++) {
      let best = null, bd = (j === 0 ? 520 : 220) ** 2;
      for (const e of pool) { if (done.has(e)) continue; const d = dist2(e.x, e.y, from.x, from.y); if (d < bd) { bd = d; best = e; } }
      if (!best) break; done.add(best); pts.push({ x: best.x, y: best.y });
      damageEnemy(best, best.tp.boss ? 14 : 8); from = best;
    }
    arcs.push({ pts, t: 0 });
    noise(0.4, 0.16, 5000); tone(1800, 0.3, 'sawtooth', 0.04, 200); G.flash = 0.15;
  }
  toast(SPECIALS.find(s => s.id === id).name);
}

// ---------- damage ----------
function damageEnemy(e, dmg) {
  if (e.dying) return;
  e.hp -= dmg; e.flash = 0.08; G.hits++;
  if (e.hp <= 0) killEnemy(e); else SFX.hit();
}
function killEnemy(e) {
  e.dead = true; G.kills++;
  addScore(e.tp.pts * (e.beh === 'dive' ? 2 : 1), e.x, e.y);
  if (e.tp.boss) {
    for (let i = 0; i < 10; i++) fx.push({ k: 'boom', x: e.x + rnd(-e.w / 2, e.w / 2), y: e.y + rnd(-e.h / 2, e.h / 2), t: -i * 0.12, sc: rnd(1, 1.8) });
    fx.push({ k: 'big', x: e.x, y: e.y, t: -0.6, sc: e.w / 90 }); SFX.bigboom(); G.shake = 0.6;
    if (!e.bossGroup || e.type === 'bigufo') dropPickup(e.x, e.y, true);
    if (e.type === 'mothership' || e.type === 'mother') eb.length = 0;
  } else {
    fx.push({ k: 'boom', x: e.x, y: e.y, t: 0, sc: e.r / 22 }); SFX.boom();
    if (Math.random() < (e.type === 'elite' || e.type === 'spider' ? 0.14 : 0.07)) dropPickup(e.x, e.y);
  }
}
function addScore(n, x, y) {
  G.score += n; G.phaseScore += n;
  if (x != null) fx.push({ k: 'text', x, y, t: 0, txt: String(n) });
  if (G.score >= G.nextLife) { G.nextLife += 60000; G.lives = Math.min(9, G.lives + 1); SFX.life(); toast('EXTRA LIFE'); }
  if (G.score > G.hi) { G.hi = G.score; }
}
function dropPickup(x, y, good) {
  let k = wpick(PU_TYPES); if (good && k === 'life' && Math.random() < 0.5) k = 'tesla';
  pickups.push({ k, x, y, t: 0 });
}
let toasts = [];
function toast(txt) { toasts.push({ txt, t: 0 }); }
function playerHit() {
  if (P.dead || P.inv > 0 || G.state !== 'play') return;
  if (G.shield > 0) { G.shield = 0; P.inv = 1.4; SFX.hit(); fx.push({ k: 'boom', x: P.x, y: P.y, t: 0, sc: 1.2 }); return; }
  P.dead = true; P.deadT = 0; G.lives--; SFX.die(); G.shake = 0.5;
  G.tempPow = Math.max(0, G.tempPow - 1); G.rapidT = 0; G.missileT = 0;
  fx.push({ k: 'wreck', x: P.x, y: P.y, t: 0 }); fx.push({ k: 'big', x: P.x, y: P.y, t: -0.35, sc: 1.1 });
}

// ---------- update ----------
function update(dt) {
  G.t += dt;
  if (G.state === 'title') { if (hit.e || hit.f) { newGame(); } return; }
  if (G.state === 'cut') { G.stateT += dt; if ((hit.e || hit.f || hit.p) && G.stateT > 0.4) endCutscene(); return; }
  if (G.state === 'promo' || G.state === 'interlude' || G.state === 'over' || G.state === 'victory') { G.stateT += dt; if ((hit.e || hit.f) && G.stateT > 1.2) advanceFromScreen(); return; }
  if (G.state !== 'play') return;
  if (hit.p) G.paused = !G.paused;
  if (G.paused) { if (hit.e) G.paused = false; return; }
  ST.t += dt;
  if (G.banner) { G.banner.t -= dt; if (G.banner.t <= 0) G.banner = null; }
  G.flash = Math.max(0, G.flash - dt); G.shake = Math.max(0, G.shake - dt);
  G.rapidT = Math.max(0, G.rapidT - dt); G.missileT = Math.max(0, G.missileT - dt);
  updatePlayer(dt);
  if (ST.view === 'side') directorSide(dt); else directorFwd(dt);
  updateEnemies(dt);
  updateBullets(dt);
  updateFx(dt);
  // phase end
  if (ST.clearT >= 0) { ST.clearT += dt; if (ST.clearT > 3) phaseCleared(); }
}
function updatePlayer(dt) {
  if (P.dead) {
    P.deadT += dt;
    if (P.deadT > 2.2) {
      if (G.lives < 0) { G.lives = 0; gameOver(); return; }
      const keep = { x: P.x }; P = newPlayer(); P.x = keep.x;
    }
    return;
  }
  P.inv = Math.max(0, P.inv - dt); P.hitT = Math.max(0, P.hitT - dt);
  const side = view() === 'side', sp = 340;
  let ax = (keys.r ? 1 : 0) - (keys.l ? 1 : 0), ay = (keys.d ? 1 : 0) - (keys.u ? 1 : 0);
  if (ax && ay) { ax *= 0.7071; ay *= 0.7071; }
  const ox = P.x, oy = P.y;
  P.x += ax * sp * dt; P.y += ay * sp * dt;
  if (G.rollT > 0) { G.rollT -= dt; P.x += P.rollV.x * dt * 1.6; P.y += P.rollV.y * dt * 1.6; }
  if (P.tx != null) { P.x = lerp(P.x, P.tx, Math.min(1, dt * 14)); P.y = lerp(P.y, P.ty, Math.min(1, dt * 14)); }
  if (side) { P.x = clamp(P.x, 50, W * 0.72); P.y = clamp(P.y, 30, H - 34); }
  else { P.x = clamp(P.x, 34, W - 34); P.y = clamp(P.y, H * 0.56, H - 38); }
  P.vx = (P.x - ox) / dt; P.vy = (P.y - oy) / dt;
  // fire
  P.cd -= dt;
  const firing = keys.f || touch.active || coarse && G.state === 'play' && touch.active;
  if (firing && P.cd <= 0 && G.banner == null || firing && P.cd <= 0 && ST.t > 1.2) { playerFire(); P.cd = G.rapidT > 0 ? 0.085 : 0.15; }
  // charge
  if (G.rank >= 3) {
    if (keys.c) P.charge = Math.min(1.2, P.charge + dt);
    else if (P.charge > 0) { if (P.charge > 0.35) fireCharge(P.charge / 1.2); P.charge = 0; }
  }
  for (const s of SPECIALS) if (hit['s' + s.key]) useSpecial(s.id);
  // drones follow
  drones.forEach((d, i) => {
    const off = side ? { x: -30, y: (i ? 1 : -1) * 54 } : { x: (i ? 1 : -1) * 58, y: 14 };
    d.x = lerp(d.x, P.x + off.x, Math.min(1, dt * 8)); d.y = lerp(d.y, P.y + off.y, Math.min(1, dt * 8));
    d.cd -= dt; if (firing && d.cd <= 0) { d.cd = 0.3; pb.push(side ? { x: d.x + 20, y: d.y, vx: 760, vy: 0, r: 7, dmg: 1, k: 'h', small: 1 } : { x: d.x, y: d.y - 18, vx: 0, vy: -660, r: 6, dmg: 1, k: 'v', small: 1 }); }
  });
  // missiles
  if (G.missileT > 0) {
    P.mcd = (P.mcd || 0) - dt;
    if (P.mcd <= 0) { P.mcd = 0.55; for (const s of [-1, 1]) missiles.push({ x: P.x, y: P.y, vx: side ? 200 : s * 160, vy: side ? s * 160 : -200, t: 0 }); }
  }
  // pickups
  for (let i = pickups.length - 1; i >= 0; i--) {
    const p = pickups[i];
    if (dist2(p.x, p.y, P.x, P.y) < 34 * 34) { applyPickup(p.k); pickups.splice(i, 1); }
  }
}
function applyPickup(k) {
  SFX.pickup(); toast(PU_NAME[k]); addScore(250);
  if (k === 'rapid') G.rapidT = 15;
  else if (k === 'tesla') G.tempPow = Math.min(3, G.tempPow + 1);
  else if (k === 'shield') G.shield = 1;
  else if (k === 'missile') G.missileT = 15;
  else if (k === 'life') { G.lives = Math.min(9, G.lives + 1); SFX.life(); }
  else if (k === 'arsenal') { const s = SPECIALS.slice().sort((a, b) => G.sp[a.id] / a.max - G.sp[b.id] / b.max)[0]; G.sp[s.id] = Math.min(s.max, G.sp[s.id] + 1); toast('+1 ' + s.name); }
}
function directorSide(dt) {
  if (ST.t < 2.5) return;
  const pr = ST.t / ST.dur;
  if (!ST.midDone && pr >= 0.5) { ST.midDone = true; ST.midActive = true; ST.midT = 0; spawnBigUfo(H * 0.4).mid = true; G.banner = { title: 'SAUCER DECURION', sub: 'Mid-assault commander', t: 2.2, warn: true }; SFX.warn(); }
  if (ST.midActive) { ST.midT += dt; if (!enemies.some(e => e.mid) || ST.midT > 45) ST.midActive = false; }
  if (ST.t < ST.dur) {
    ST.waveT -= dt * (ST.midActive ? 0.35 : 1);
    if (ST.waveT <= 0) { sideWave(); ST.waveT = clamp(3.4 - 1.5 * pr - 0.2 * lvl(), 1.2, 4); }
  } else if (!ST.bossSpawned) {
    if (!enemies.some(e => !e.dead)) spawnBoss();
  } else if (!ST.bossDead && !enemies.some(e => e.tp.boss && !e.dead)) { ST.bossDead = true; ST.clearT = 0; }
}
function directorFwd(dt) {
  if (ST.t < 2.5) return;
  if (ST.t < ST.dur || (ST.form && enemies.some(e => e.form))) {
    if (!ST.form) { ST.formGap -= dt; if (ST.formGap <= 0 && ST.t < ST.dur) buildFormation(); }
    else {
      const f = ST.form; f.t += dt;
      while (f.queue.length && f.queue[0].at <= f.t) spawnGroup(f.queue.shift());
      const live = enemies.filter(e => e.form && !e.dead);
      if (!f.queue.length && !live.length) { ST.form = null; ST.formGap = 2.2; addScore(1000 + 500 * lvl()); toast('FORMATION BROKEN +' + (1000 + 500 * lvl())); }
      else if (!f.queue.length || f.t > 6) {
        f.age += dt; f.attackT -= dt;
        if (f.attackT <= 0) {
          const d = difficulty(), inForm = live.filter(e => e.beh === 'form');
          const n = Math.min(inForm.length, 1 + Math.floor(d * 0.8 + Math.random() * 1.5) + (f.age > 50 ? 2 : 0));
          for (let i = 0; i < n; i++) { const e = inForm.splice((Math.random() * inForm.length) | 0, 1)[0]; if (e) startDive(e); }
          f.attackT = clamp((2.8 - d * 0.45) * rnd(0.7, 1.2) / Math.max(1, (live[0] && live[0].tp.dive) || 1), 0.6, 3.2) * (f.age > 50 ? 0.5 : 1);
        }
      }
    }
    if (ST.t > 25 || lvl() > 0) { ST.hazardT -= dt; if (ST.hazardT <= 0) { spawnHazard(); ST.hazardT = rnd(7, 12) - lvlC() * 1.5; } }
  } else if (!ST.bossSpawned) {
    if (!enemies.some(e => !e.dead)) spawnBoss();
  } else if (!ST.bossDead && !enemies.some(e => e.tp.boss && !e.dead)) { ST.bossDead = true; ST.clearT = 0; }
}
function updateEnemies(dt) {
  const d = difficulty(), bspd = 210 + d * 35;
  for (const e of enemies) {
    if (e.dead) continue;
    if (e.delay > 0) { e.delay -= dt; continue; }
    e.flash = Math.max(0, e.flash - dt);
    if (e.stun > 0) { e.stun -= dt; if (e.beh !== 'form') { e.x += (e.tp.boss ? 0 : (ST.view === 'side' ? -20 : 0)) * dt; } continue; }
    e.t += dt;
    const ox = e.x, oy = e.y;
    switch (e.beh) {
      case 'line': e.x += e.vx * dt; if (e.x < -80) e.dead = e.gone = true; break;
      case 'sine': e.x += e.vx * dt; e.y = e.y0 + Math.sin(e.t * 2.2 + e.ph) * e.amp; if (e.x < -80) e.dead = e.gone = true; break;
      case 'path': {
        e.s += e.spd * dt; const p = pathAt(e.path, e.s); e.x = p.x; e.y = p.y;
        if (e.s >= e.path.len) e.dead = e.gone = true;
        if (e.dshoot && !e.shot && e.y > H * 0.3) { e.shot = true; aimShot(e, bspd); }
        break;
      }
      case 'spider':
        if (e.x > e.stopX && e.hold > 0) e.x -= 90 * dt;
        else if (e.hold > 0) { e.hold -= dt; e.y += Math.sin(e.t * 3) * 20 * dt; }
        else { e.x -= 200 * dt; if (e.x < -80) e.dead = e.gone = true; }
        e.cd -= dt; if (e.cd <= 0 && e.x < W - 20) { e.cd = rnd(1.1, 1.6); aimShot(e, bspd, lvl() >= 1 ? 3 : 1, 0.18); }
        break;
      case 'bigufo': {
        const tx = e.bossGroup ? W - 160 - (e.y0 / H) * 90 : W - 170;
        if (e.x > tx) e.x -= 120 * dt; else e.y = e.y0 + Math.sin(e.t * 0.9) * 70;
        e.cd -= dt;
        if (e.cd <= 0 && e.x < W) { e.cd = rnd(1.3, 1.9) - lvlC() * 0.2; aimShot(e, bspd * 0.95, 5 + lvlC() * 2, 0.45); }
        break;
      }
      case 'mothership': updateMothership(e, dt, bspd); break;
      case 'mother': updateMother(e, dt, bspd); break;
      case 'strafe':
        e.x += e.vx * dt; e.y = e.y0 + Math.sin(e.t * 3) * 14;
        e.cd -= dt; if (e.cd <= 0) { e.cd = 0.9; aimShot(e, bspd); }
        if (e.x < -80 || e.x > W + 80) e.dead = e.gone = true;
        break;
      case 'enter':
        if (e.hz) {
          e.hz.t += dt; const k = Math.min(1, e.hz.t / 1.4), sp = slotPos(e);
          e.x = lerp(e.hz.x, sp.x, k * k); e.y = lerp(e.hz.y, sp.y, k) - Math.sin(k * Math.PI) * 30; e.scale = 0.15 + 0.85 * k;
          if (k >= 1) { e.beh = 'form'; e.scale = 1; }
        } else {
          e.s += e.spd * dt; const p = pathAt(e.path, e.s); e.x = p.x; e.y = p.y;
          if (e.s >= e.path.len) e.beh = 'toSlot';
        }
        break;
      case 'toSlot': {
        const sp = slotPos(e), dx = sp.x - e.x, dy = sp.y - e.y, dd = Math.hypot(dx, dy), v = 300 * dt;
        if (dd < v + 1) { e.x = sp.x; e.y = sp.y; e.beh = 'form'; } else { e.x += dx / dd * v; e.y += dy / dd * v; }
        break;
      }
      case 'form': {
        const sp = slotPos(e); e.x = sp.x; e.y = sp.y;
        e.cd -= dt;
        if (e.cd <= 0) { e.cd = rnd(5, 10) / (e.tp.fire * (0.7 + d * 0.35)); if (Math.random() < 0.6) { if (e.type === 'elite') aimShot(e, bspd, 2, 0.08); else eShot(e.x, e.y + 14, (P.x - e.x) * 0.15, bspd); } }
        break;
      }
      case 'dive': {
        e.s += e.spd * dt; const p = pathAt(e.path, e.s); e.x = p.x; e.y = p.y;
        if (e.shotsLeft > 0 && e.s > e.path.len * (e.shotsLeft === 2 ? 0.28 : 0.45)) { e.shotsLeft--; if (e.spread) aimShot(e, bspd, 3, 0.3); else aimShot(e, bspd * 1.05); }
        if (e.s >= e.path.len) { const sp = slotPos(e); e.x = sp.x; e.y = -40; e.beh = 'toSlot'; }
        break;
      }
    }
    // heading rotation for forward view flights
    if (ST.view === 'fwd' && (e.beh === 'enter' || e.beh === 'dive' || e.beh === 'toSlot') && !e.hz && e.type !== 'diver') {
      const vx = e.x - ox, vy = e.y - oy; if (vx * vx + vy * vy > 0.01) { const target = Math.atan2(vy, vx) - Math.PI / 2; let dr = target - e.rot; while (dr > Math.PI) dr -= 2 * Math.PI; while (dr < -Math.PI) dr += 2 * Math.PI; e.rot += dr * Math.min(1, dt * 10); }
    } else e.rot *= Math.max(0, 1 - dt * 8);
    // body collision
    if (!P.dead && !e.dead && !e.tp.boss && dist2(e.x, e.y, P.x, P.y) < (e.r + 16) ** 2) { if (P.inv <= 0) { damageEnemy(e, 5); playerHit(); } }
  }
  enemies = enemies.filter(e => !e.dead);
}
function updateMothership(e, dt, bspd) {
  const enr = e.hp < e.maxHp * 0.4;
  if (e.y < 100 && !e.beam) { e.y += 80 * dt; return; }
  if (!e.beam || e.beam.st === 'off') e.x = W * 0.66 + Math.sin(e.t * 0.45) * W * 0.2;
  e.atk -= dt;
  if (e.beam && e.beam.st !== 'off') {
    e.beam.t += dt;
    if (e.beam.st === 'tele' && e.beam.t > 1.1) { e.beam.st = 'on'; e.beam.t = 0; noise(1.8, 0.12, 400); }
    else if (e.beam.st === 'on') {
      e.x += clamp(P.x - e.x, -1, 1) * (enr ? 110 : 75) * dt; e.x = clamp(e.x, W * 0.3, W - 120);
      if (!P.dead && Math.abs(P.x - e.x) < 52 && P.y > e.y + 40) playerHit();
      if (e.beam.t > 2.6) { e.beam.st = 'off'; }
    }
    return;
  }
  if (e.atk <= 0) {
    const seq = ['fan', 'fan', 'beam', 'spawn', 'fan', 'beam', 'burst'], a = seq[e.cycle++ % seq.length];
    if (a === 'fan') { const n = enr ? 11 : 8; for (let i = 0; i < n; i++) { const ang = Math.PI * (0.55 + 0.4 * i / (n - 1)); eShot(e.x, e.y + 30, Math.cos(ang) * bspd, Math.sin(ang) * bspd); } e.atk = enr ? 1.0 : 1.4; }
    else if (a === 'beam') { e.beam = { st: 'tele', t: 0 }; e.atk = 4.2; }
    else if (a === 'spawn') { for (let i = 0; i < 4; i++) mkEnemy('ufo', W + 40 + i * 60, rnd(120, H - 160), { beh: 'sine', y0: rnd(140, H - 180), vx: -200, amp: 50, ph: i }); e.atk = 1.4; }
    else { for (let k = 0; k < 3; k++) setTimeoutGame(() => !e.dead && aimShot(e, bspd * 1.2, 3, 0.2), k * 0.22); e.atk = 1.5; }
  }
}
function updateMother(e, dt, bspd) {
  const enr = e.hp < e.maxHp * 0.45, L = lvlC();
  if (e.y < e.y0) { e.y += 90 * dt; return; }
  e.x = W / 2 + Math.sin(e.t * (enr ? 0.7 : 0.5)) * (W * 0.32);
  e.y = e.y0 + Math.sin(e.t * 1.3) * 12;
  e.atk -= dt;
  if (e.atk <= 0) {
    const seq = ['fan', 'aim', 'spawn', 'fan', 'ring', 'aim'], a = seq[e.cycle++ % seq.length];
    if (a === 'fan') { const n = 7 + L * 2 + (enr ? 2 : 0); for (let i = 0; i < n; i++) { const ang = Math.PI * (0.18 + 0.64 * i / (n - 1)); eShot(e.x, e.y + 40, Math.cos(ang) * bspd, Math.sin(ang) * bspd); } e.atk = enr ? 1.0 : 1.5; }
    else if (a === 'aim') { for (let k = 0; k < 3 + L; k++) setTimeoutGame(() => !e.dead && aimShot(e, bspd * 1.15), k * 0.18); e.atk = 1.3; }
    else if (a === 'spawn') {
      for (let i = 0; i < 3 + L; i++) { const s = mkEnemy(L >= 1 ? 'fighter' : 'scout', e.x, e.y + 30, { beh: 'path', delay: i * 0.25, spd: 320, dshoot: true }); s.path = makePath([{ x: e.x, y: e.y + 30 }, { x: e.x + (i - 1.5) * 120, y: H * 0.4 }, { x: clamp(P.x, 40, W - 40), y: H * 0.7 }, { x: clamp(P.x + (i - 1.5) * 200, -60, W + 60), y: H + 60 }]); }
      fx.push({ k: 'spawn', x: e.x, y: e.y + 30, t: 0, sc: 1.4 }); e.atk = 1.6;
    } else { const n = 14 + L * 4; for (let i = 0; i < n; i++) { const ang = i / n * Math.PI * 2 + e.t; eShot(e.x, e.y, Math.cos(ang) * bspd * 0.75, Math.sin(ang) * bspd * 0.75); } e.atk = 1.7; }
  }
}
const timers = [];
function setTimeoutGame(fn, delay) { timers.push({ fn, t: delay }); }
function updateBullets(dt) {
  for (let i = timers.length - 1; i >= 0; i--) { timers[i].t -= dt; if (timers[i].t <= 0) { const f = timers[i].fn; timers.splice(i, 1); f(); } }
  for (const b of pb) {
    b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.x > W + 60 || b.y < -60 || b.x < -60 || b.y > H + 60) { b.dead = true; continue; }
    for (const e of enemies) {
      if (e.dead || e.delay > 0 || e.y < -30 || e.x > W + 20 || (e.beh === 'enter' && e.hz && e.scale < 0.6)) continue;
      if (hitTest(e, b.x, b.y, b.r)) {
        if (b.pierce) { const last = b.hitSet.get(e) || -9; if (G.t - last < 0.2) continue; b.hitSet.set(e, G.t); damageEnemy(e, b.dmg); fx.push({ k: 'spark', x: b.x, y: b.y, t: 0 }); continue; }
        damageEnemy(e, b.dmg); b.dead = true; fx.push({ k: 'spark', x: b.x, y: b.y, t: 0 }); break;
      }
    }
  }
  pb = pb.filter(b => !b.dead);
  for (const m of missiles) {
    m.t += dt;
    let best = null, bd = 1e12; for (const e of enemies) { if (e.dead || e.delay > 0 || e.x > W || e.y < 0) continue; const dd = dist2(e.x, e.y, m.x, m.y); if (dd < bd) { bd = dd; best = e; } }
    const sp = 420;
    if (best) { const a = Math.atan2(best.y - m.y, best.x - m.x); m.vx = lerp(m.vx, Math.cos(a) * sp, Math.min(1, dt * 5)); m.vy = lerp(m.vy, Math.sin(a) * sp, Math.min(1, dt * 5)); }
    m.x += m.vx * dt; m.y += m.vy * dt;
    if (m.t > 3 || m.x < -40 || m.x > W + 40 || m.y < -40 || m.y > H + 40) m.dead = true;
    if (best && hitTest(best, m.x, m.y, 6)) { damageEnemy(best, 2); m.dead = true; fx.push({ k: 'boom', x: m.x, y: m.y, t: 0.1, sc: 0.5 }); }
  }
  missiles = missiles.filter(m => !m.dead);
  for (const k of kdrones) {
    k.t += dt;
    let best = null, bd = 1e12; for (const e of liveTargets()) { const dd = dist2(e.x, e.y, k.x, k.y); if (dd < bd) { bd = dd; best = e; } }
    const sp = 380 + k.t * 120;
    if (best && k.t > 0.25) { const a = Math.atan2(best.y - k.y, best.x - k.x); k.vx = lerp(k.vx, Math.cos(a) * sp, Math.min(1, dt * 4)); k.vy = lerp(k.vy, Math.sin(a) * sp, Math.min(1, dt * 4)); }
    k.x += k.vx * dt; k.y += k.vy * dt;
    if ((best && hitTest(best, k.x, k.y, 10)) || k.t > 4) {
      k.dead = true; fx.push({ k: 'boom', x: k.x, y: k.y, t: 0, sc: 1.3 }); SFX.boom(); G.shake = Math.max(G.shake, 0.15);
      for (const e of liveTargets()) if (hitTest(e, k.x, k.y, 70)) damageEnemy(e, e.tp.boss ? 8 : 6);
    }
  }
  kdrones = kdrones.filter(k => !k.dead);
  for (const a of arcs) a.t += dt; arcs = arcs.filter(a => a.t < 0.45);
  for (const b of eb) {
    b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.x < -30 || b.x > W + 30 || b.y < -30 || b.y > H + 30) { b.dead = true; continue; }
    if (!P.dead && dist2(b.x, b.y, P.x, P.y) < (b.r + 11) ** 2) { b.dead = true; playerHit(); }
  }
  eb = eb.filter(b => !b.dead);
  for (const p of pickups) {
    p.t += dt;
    if (view() === 'side') { p.x -= 70 * dt; p.y += Math.sin(p.t * 3) * 20 * dt; } else { p.y += 85 * dt; p.x += Math.sin(p.t * 3) * 30 * dt; }
  }
  pickups = pickups.filter(p => p.x > -40 && p.y < H + 40);
}
function hitTest(e, x, y, r) {
  if (e.tp.ell) { const rx = e.w * e.tp.ell[0] + r, ry = e.h * e.tp.ell[1] + r; return ((x - e.x) / rx) ** 2 + ((y - e.y) / ry) ** 2 < 1; }
  return dist2(e.x, e.y, x, y) < (e.r * (e.scale || 1) + r) ** 2;
}
function updateFx(dt) {
  for (const f of fx) {
    f.t += dt;
    if (f.k === 'ring' && f.t > 0) {
      const rad = f.t / 0.7 * 300;
      for (const b of eb) if (dist2(b.x, b.y, f.x, f.y) < rad * rad) { b.dead = true; }
      for (const e of enemies) if (!f.hitDone.has(e) && hitTest(e, f.x, f.y, rad)) { f.hitDone.add(e); damageEnemy(e, e.tp.boss ? 12 : 10); }
    }
    if (f.k === 'emp') for (const b of eb) b.dead = true;
  }
  fx = fx.filter(f => f.t < ({ boom: 0.45, big: 0.9, ring: 0.7, emp: 0.9, spawn: 0.5, text: 0.9, spark: 0.12, wreck: 1.2 }[f.k] || 1));
  for (const t of toasts) t.t += dt; toasts = toasts.filter(t => t.t < 1.8);
}
function phaseCleared() {
  const bonus = 2500 * (G.phase + 1); addScore(bonus);
  G.lastBonus = bonus; G.shield = 1; saveHi(); G.stateT = 0; SFX.fanfare();
  if (G.phase % 2 === 0) { // side view done: halfway through the level, no promotion yet
    G.sp.roll = Math.min(5, G.sp.roll + 1); G.sp.emp = Math.min(4, G.sp.emp + 1);
    G.state = 'interlude'; return;
  }
  if (G.phase >= LEVELS.length * 2 - 1) { G.rank = RANKS.length - 1; G.state = 'victory'; return; }
  G.rank = Math.min(RANKS.length - 2, G.rank + 1);
  for (const s of SPECIALS) G.sp[s.id] = Math.min(s.max, G.sp[s.id] + 1);
  if (RANKS[G.rank].name === 'Primus Pilus') { G.lives = Math.min(9, G.lives + 1); }
  G.state = 'promo';
}
function gameOver() { saveHi(); G.state = 'over'; G.stateT = 0; }
function saveHi() { if (G.score >= G.hi) { G.hi = G.score; lsSet('legio_hi', String(G.hi)); } }
function advanceFromScreen() {
  if (G.state === 'promo') { const n = G.phase + 1; playCutscene(n >> 1, () => startPhase(n)); }
  else if (G.state === 'interlude') { startPhase(G.phase + 1); }
  else if (G.state === 'over') { // continue from the same view, score resets
    G.lives = 3; G.score = 0; G.nextLife = 50000; G.tempPow = 0; G.shield = 0; for (const s of SPECIALS) G.sp[s.id] = Math.max(G.sp[s.id], s.start); startPhase(G.phase);
  } else { G.state = 'title'; ST = null; }
}
// ---------- cutscenes: one anime cutscene before each level ----------
const CUTS = [1, 2, 3, 4, 5, 6, 7, 8].map(n => 'cut/level' + n + '.mp4');
const cutWrap = document.getElementById('cutWrap'), cutVid = document.getElementById('cutVid');
let cutDone = null, cutGuard = 0;
function placeCut() {
  if (cutWrap.hidden) return;
  const st = document.getElementById('stage').getBoundingClientRect(), r = C.getBoundingClientRect();
  cutWrap.style.left = (r.left - st.left) + 'px'; cutWrap.style.top = (r.top - st.top) + 'px';
  cutWrap.style.width = r.width + 'px'; cutWrap.style.height = r.height + 'px';
}
function playCutscene(level, then) {
  const src = CUTS[level];
  if (!src) { then(); return; }
  G.state = 'cut'; G.stateT = 0; cutDone = then; cutWrap.hidden = false; placeCut();
  cutVid.src = src; cutVid.muted = muted; cutVid.currentTime = 0;
  const p = cutVid.play();
  if (p && p.catch) p.catch(() => { cutVid.muted = true; cutVid.play().catch(endCutscene); });
  clearTimeout(cutGuard); cutGuard = setTimeout(endCutscene, 20000);
}
function endCutscene() {
  if (!cutDone) return;
  const f = cutDone; cutDone = null; clearTimeout(cutGuard);
  cutVid.pause(); cutVid.removeAttribute('src'); cutVid.load(); cutWrap.hidden = true;
  f();
}
cutVid.addEventListener('ended', endCutscene);
cutVid.addEventListener('error', endCutscene);
cutWrap.addEventListener('pointerdown', e => { e.preventDefault(); if (G.stateT > 0.4) endCutscene(); });
function newGame() {
  Object.assign(G, { score: 0, lives: 3, rank: 0, sp: freshSpecials(), rollT: 0, tempPow: 0, rapidT: 0, missileT: 0, shield: 0, nextLife: 50000, kills: 0, shots: 0, hits: 0, paused: false });
  playCutscene(0, () => startPhase(0));
}

// ---------- render ----------
function render(dt) {
  ctx.save();
  if (G.shake > 0) ctx.translate(rnd(-1, 1) * G.shake * 10, rnd(-1, 1) * G.shake * 10);
  ctx.fillStyle = '#000'; ctx.fillRect(-20, -20, W + 40, H + 40);
  drawBackground(dt);
  if (G.state === 'title' || G.state === 'loading') { ctx.restore(); drawTitle(); return; }
  if (G.state === 'cut') { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore(); return; }
  if (ST) {
    const side = ST.view === 'side';
    for (const p of pickups) { if (p.k === 'arsenal') drawArsenal(p); else draw((side ? PU_SPR_S : PU_SPR_F)[p.k], p.x, p.y, 0.55 * (1 + Math.sin(p.t * 6) * 0.06)); }
    // mothership beam behind ship
    for (const e of enemies) if (e.beam && e.beam.st !== 'off') drawBeam(e);
    for (const e of enemies) if (e.delay <= 0) drawEnemy(e);
    for (const b of pb) drawPBullet(b);
    for (const m of missiles) { ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(Math.atan2(m.vy, m.vx)); ctx.fillStyle = '#ffb648'; ctx.fillRect(-12, -1.5, 6, 3); ctx.fillStyle = '#e8d8a8'; ctx.fillRect(-6, -2.5, 12, 5); ctx.fillStyle = '#c33'; ctx.beginPath(); ctx.moveTo(6, -2.5); ctx.lineTo(10, 0); ctx.lineTo(6, 2.5); ctx.fill(); ctx.restore(); }
    for (const k of kdrones) draw('drone' + (Math.floor(G.t * 12) % 3), k.x, k.y, 0.36, Math.atan2(k.vy, k.vx) - Math.PI / 2 + Math.PI, 1);
    drawPlayer();
    drawArcs();
    for (const b of eb) { if (b.k === 1) draw('eshot1', b.x, b.y, 0.42, Math.atan2(b.vy, b.vx) + Math.PI, 1, true); else draw('eshot0', b.x, b.y, 0.45, 0, 1, true); }
    drawFx();
  }
  ctx.restore();
  if (G.flash > 0) { ctx.fillStyle = `rgba(150,190,255,${G.flash})`; ctx.fillRect(0, 0, W, H); }
  if (ST) drawHUD();
  if (G.state === 'promo') drawPromo(); else if (G.state === 'interlude') drawInterlude(); else if (G.state === 'over') drawOver(); else if (G.state === 'victory') drawVictory();
  if (G.paused && G.state === 'play') { shade(0.55); centerText('PAUSED', H / 2 - 10, 44, '#f2e5c3', true); centerText('Press P or tap to resume', H / 2 + 30, 13, '#9a8c74'); }
}
function drawArsenal(p) {
  const s = 32 * (1 + Math.sin(p.t * 6) * 0.06); ctx.save(); ctx.translate(p.x, p.y);
  ctx.fillStyle = '#3a1418'; ctx.strokeStyle = '#e3b347'; ctx.lineWidth = 3; ctx.fillRect(-s / 2, -s / 2, s, s); ctx.strokeRect(-s / 2, -s / 2, s, s);
  ctx.fillStyle = '#e3b347'; ctx.font = '600 20px "Cormorant Garamond", Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('A', 0, 1); ctx.restore();
}
function drawEnemy(e) {
  const tp = e.tp, frame = tp.n > 1 ? tp.spr + (Math.floor(e.t * 8) % tp.n) : tp.spr;
  const side = ST.view === 'side';
  let rot = e.rot + (side && tp.rot ? tp.rot : 0), flip = false, sc = tp.sc * (e.scale || 1);
  if (e.type === 'strafer') flip = e.vx < 0;
  if (e.type === 'diver') { rot = 0; }
  draw(frame, e.x, e.y, sc, rot, 1, false, flip);
  if (e.flash > 0) draw(frame, e.x, e.y, sc, rot, 0.7, true, flip);
  if (e.stun > 0 && Math.floor(G.t * 12) % 2 === 0) draw(frame, e.x, e.y, sc, rot, 0.35, true, flip);
  if (tp.boss && (e.mid || e.bossGroup || e.type === 'mother' || e.type === 'mothership')) {
    const w = Math.min(e.w, 200), y = e.y - e.h / 2 - 12;
    ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(e.x - w / 2, y, w, 5);
    ctx.fillStyle = '#e3b347'; ctx.fillRect(e.x - w / 2, y, w * Math.max(0, e.hp / e.maxHp), 5);
  }
}
function drawBeam(e) {
  const b = e.beam, top = e.y + e.h * 0.3, h = H - top;
  if (b.st === 'tele') { ctx.fillStyle = `rgba(255,60,80,${0.25 + 0.25 * Math.sin(b.t * 40)})`; ctx.fillRect(e.x - 3, top, 6, h); ctx.strokeStyle = 'rgba(255,80,100,.35)'; ctx.setLineDash([6, 8]); ctx.strokeRect(e.x - 52, top, 104, h); ctx.setLineDash([]); return; }
  const im = IMG.motherbeam; if (!im || !im.width) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.9; ctx.drawImage(im, e.x - 70, top, 140, h); ctx.restore();
}
function drawPBullet(b) {
  if (b.k === 'v') draw('pshot' + (3 + (Math.floor(G.t * 20) % 2)), b.x, b.y, b.small ? 0.42 : 0.55, 0, 1, true);
  else if (b.k === 'h') draw('hshot' + (Math.floor(G.t * 20) % 3), b.x, b.y, b.small ? 0.42 : 0.6, Math.atan2(b.vy, b.vx), 1, true);
  else if (b.k === 'C') { if (view() === 'side') draw('hcharge', b.x, b.y, 0.55, 0, 1, true); else draw('ring' + (1 + Math.floor(G.t * 14) % 3), b.x, b.y, 0.75, 0, 1, true); }
}
function drawPlayer() {
  const side = ST.view === 'side';
  for (const d of drones) { draw('drone' + (Math.floor(G.t * 8) % 3), d.x, d.y, 0.42, side ? Math.PI / 2 : 0); }
  if (P.dead) return;
  if (P.inv > 0 && G.rollT <= 0 && Math.floor(G.t * 14) % 2 === 0) return;
  if (side) {
    const fr = 'ps' + (Math.floor(G.t * 10) % 4);
    if (G.rollT > 0) { const k = Math.cos((0.6 - G.rollT) / 0.6 * Math.PI * 4); const im = IMG[fr]; if (im && im.width) { ctx.save(); ctx.translate(P.x, P.y); ctx.scale(1, k); ctx.drawImage(im, -im.width * 0.21, -im.height * 0.21, im.width * 0.42, im.height * 0.42); ctx.restore(); } }
    else draw(fr, P.x, P.y, 0.42, clamp(P.vy / 3000, -0.12, 0.12));
  } else {
    const thrust = P.vy < -20;
    const fr = 'pv' + ((thrust ? 4 : 0) + Math.floor(G.t * 9) % 4);
    if (G.rollT > 0) { const k = Math.cos((0.6 - G.rollT) / 0.6 * Math.PI * 4); const im = IMG[fr]; if (im && im.width) { ctx.save(); ctx.translate(P.x, P.y); ctx.scale(k, 1); ctx.drawImage(im, -im.width * 0.26, -im.height * 0.26, im.width * 0.52, im.height * 0.52); ctx.restore(); } }
    else draw(fr, P.x, P.y, 0.52, clamp(P.vx / 4000, -0.12, 0.12));
  }
  if (G.shield > 0) draw('ring2', P.x, P.y, side ? 1.0 : 0.85, G.t, 0.45 + 0.2 * Math.sin(G.t * 6), true);
  if (P.charge > 0.05) {
    const k = P.charge / 1.2, nx = side ? P.x + 58 : P.x, ny = side ? P.y : P.y - 38;
    draw('ring0', nx, ny, 0.3 + k * 0.6, G.t * 5, 0.5 + 0.5 * k, true);
  }
}
function drawArcs() {
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineJoin = 'round';
  for (const a of arcs) {
    const al = 1 - a.t / 0.45;
    for (const [wd, col] of [[8, `rgba(80,140,255,${0.35 * al})`], [3, `rgba(170,210,255,${0.9 * al})`], [1.2, `rgba(255,255,255,${al})`]]) {
      ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.beginPath();
      for (let i = 0; i < a.pts.length - 1; i++) {
        const p = a.pts[i], q = a.pts[i + 1], segs = 7; ctx.moveTo(p.x, p.y);
        for (let s = 1; s <= segs; s++) { const t = s / segs, j = s === segs ? 0 : 14; ctx.lineTo(lerp(p.x, q.x, t) + rnd(-j, j), lerp(p.y, q.y, t) + rnd(-j, j)); }
      }
      ctx.stroke();
    }
    for (const p of a.pts.slice(1)) draw('ring0', p.x, p.y, 0.6, G.t * 8, al, true);
  }
  ctx.restore();
}
function drawFx() {
  for (const f of fx) {
    if (f.t < 0) continue;
    if (f.k === 'boom') draw('boom' + Math.min(4, Math.floor(f.t / 0.09)), f.x, f.y, f.sc, 0, 1, true);
    else if (f.k === 'big') draw('bigboom', f.x, f.y, f.sc * (0.6 + f.t), f.t, Math.max(0, 1 - f.t / 0.9), true);
    else if (f.k === 'spark') draw('boom0', f.x, f.y, 0.4, 0, 1 - f.t / 0.12, true);
    else if (f.k === 'spawn') draw('spawn' + Math.min(2, Math.floor(f.t / 0.17)), f.x, f.y, f.sc, 0, 1, true);
    else if (f.k === 'emp') { const rad = f.t / 0.9 * 900; ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const [r, w, a] of [[rad, 10, 0.5], [rad * 0.85, 4, 0.7], [rad * 0.6, 2, 0.4]]) { ctx.strokeStyle = `rgba(120,200,255,${a * (1 - f.t / 0.9)})`; ctx.lineWidth = w; ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, 7); ctx.stroke(); } ctx.restore(); }
    else if (f.k === 'ring') { const rad = f.t / 0.7 * 300; draw('ring3', f.x, f.y, rad * 2 / 99, f.t * 2, 1 - f.t / 0.7, true); }
    else if (f.k === 'wreck') draw(f.t < 0.3 ? (view() === 'side' ? 'psa0' : 'pvhit') : (view() === 'side' ? 'psa4' : 'pvwreck'), f.x, f.y + f.t * 30, view() === 'side' ? 0.55 : 0.52, f.t * 0.6, Math.max(0, 1 - f.t / 1.2));
    else if (f.k === 'text') { ctx.font = '12px "Space Mono", monospace'; ctx.textAlign = 'center'; ctx.fillStyle = `rgba(255,226,140,${1 - f.t / 0.9})`; ctx.fillText(f.txt, f.x, f.y - f.t * 30); }
  }
}
function shade(a) { ctx.fillStyle = `rgba(6,4,10,${a})`; ctx.fillRect(0, 0, W, H); }
function centerText(txt, y, size, color, display, x = W / 2) {
  ctx.font = (display ? `600 ${size}px "Cormorant Garamond", Georgia, serif` : `${size}px "Space Mono", monospace`);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillText(txt, x + 2, y + 2);
  ctx.fillStyle = color; ctx.fillText(txt, x, y);
}
function goldText(txt, y, size) {
  ctx.font = `600 ${size}px "Cormorant Garamond", Georgia, serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const g = ctx.createLinearGradient(0, y - size / 2, 0, y + size / 2); g.addColorStop(0, '#fff2bf'); g.addColorStop(0.5, '#e3b347'); g.addColorStop(1, '#8a5a17');
  ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillText(txt, W / 2 + 3, y + 3); ctx.fillStyle = g; ctx.fillText(txt, W / 2, y);
}
function laurel(x, y, r, color) {
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.arc(x, y, r, Math.PI / 2 + s * 0.25, Math.PI / 2 + s * 2.6, s < 0); ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = Math.PI / 2 + s * (0.45 + i * 0.27), lx = x + Math.cos(a) * r, ly = y + Math.sin(a) * r;
      ctx.save(); ctx.translate(lx, ly); ctx.rotate(a + s * 0.9); ctx.beginPath(); ctx.ellipse(0, 0, 9, 3.5, 0, 0, 7); ctx.fill(); ctx.restore();
    }
  }
  ctx.restore();
}
function drawHUD() {
  ctx.save();
  const g = ctx.createLinearGradient(0, 0, 0, 34); g.addColorStop(0, 'rgba(6,4,10,.85)'); g.addColorStop(1, 'rgba(6,4,10,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 48);
  ctx.textBaseline = 'top'; ctx.font = '14px "Space Mono", monospace';
  ctx.textAlign = 'left'; ctx.fillStyle = '#9a8c74'; ctx.fillText('SCORE', 14, 8); ctx.fillStyle = '#f2e5c3'; ctx.fillText(String(G.score).padStart(7, '0'), 76, 8);
  ctx.textAlign = 'center'; ctx.fillStyle = '#9a8c74'; ctx.fillText('HI ' + String(G.hi).padStart(7, '0'), W / 2, 8);
  ctx.textAlign = 'right'; ctx.font = '600 16px "Cormorant Garamond", Georgia, serif'; ctx.fillStyle = '#e3b347'; ctx.fillText(RANKS[G.rank].name.toUpperCase(), W - 14, 6);
  // phase progress bar
  const pr = Math.min(1, ST.t / ST.dur), bw = 220, bx = W / 2 - bw / 2, by = 28;
  ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(bx, by, bw, 3); ctx.fillStyle = ST.t >= ST.dur ? '#d33a3a' : '#e3b347'; ctx.fillRect(bx, by, bw * pr, 3);
  // lives + rings
  for (let i = 0; i < Math.min(G.lives, 6); i++) draw('pv0', 22 + i * 26, H - 20, 0.2);
  if (!coarse) {
    const bw = 80, x0 = W - SPECIALS.length * (bw + 4) - 10;
    ctx.font = '10px "Space Mono", monospace'; ctx.textBaseline = 'middle';
    SPECIALS.forEach((s, i) => {
      const x = x0 + i * (bw + 4), y = H - 30, n = G.sp[s.id], on = n > 0 && !(s.id === 'roll' && G.rollT > 0);
      ctx.fillStyle = 'rgba(6,4,10,.65)'; ctx.fillRect(x, y, bw, 22); ctx.strokeStyle = on ? '#e3b347' : '#4a3e2a'; ctx.lineWidth = 1; ctx.strokeRect(x + .5, y + .5, bw - 1, 21);
      ctx.textAlign = 'left'; ctx.fillStyle = on ? '#e3b347' : '#6a5e48'; ctx.fillText(s.key + ' ' + s.label, x + 5, y + 11);
      ctx.textAlign = 'right'; ctx.fillStyle = on ? '#f2e5c3' : '#6a5e48'; ctx.fillText('x' + n, x + bw - 5, y + 11);
    });
  }
  // timed power-ups
  let x = 14; ctx.font = '11px "Space Mono", monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  const chip = (label, frac, col) => { ctx.fillStyle = 'rgba(6,4,10,.6)'; ctx.fillRect(x, 32, 92, 16); ctx.fillStyle = col; ctx.fillRect(x, 46, 92 * frac, 2); ctx.fillText(label, x + 5, 40); x += 98; };
  if (G.rapidT > 0) chip('RAPID', G.rapidT / 15, '#ffcf5a');
  if (G.missileT > 0) chip('PILUM', G.missileT / 15, '#ff8a4a');
  if (G.tempPow > 0) chip('TESLA +' + G.tempPow, 1, '#6fb6ff');
  if (G.shield > 0) chip('AEGIS', 1, '#7fe0ff');
  ctx.restore();
  // banner
  if (G.banner) {
    const b = G.banner, a = Math.min(1, b.t * 2, (3.2 - b.t) * 3 + 0.2);
    ctx.save(); ctx.globalAlpha = clamp(a, 0, 1);
    ctx.fillStyle = 'rgba(6,4,10,.55)'; ctx.fillRect(0, H / 2 - 70, W, b.orders ? 150 : 110);
    centerText(b.title, H / 2 - 42, 14, b.warn ? '#ff5a5a' : '#9a8c74');
    goldText(b.sub, H / 2 - 4, 40);
    if (b.orders) centerText(b.orders, H / 2 + 44, 12, '#f2e5c3');
    ctx.restore();
  }
  toasts.forEach((t, i) => centerText(t.txt, 70 + i * 22, 14, `rgba(255,226,140,${1 - t.t / 1.8})`));
  if (ST.t >= ST.dur && !ST.bossSpawned && G.state === 'play') centerText('CLEAR THE FIELD', 64, 12, '#ff9a6a');
}
function drawPromo() {
  shade(0.78);
  const r = RANKS[G.rank], k = Math.min(1, G.stateT / 0.8);
  centerText('BY ORDER OF THE SENATE AND PEOPLE OF ROME', 70, 12, '#9a8c74');
  laurel(W / 2, 190, 92 * (0.8 + 0.2 * k), '#c9962e');
  ctx.save(); ctx.globalAlpha = k; goldText(r.name.toUpperCase(), 182, 52); ctx.restore();
  centerText(r.title, 232, 13, '#f2e5c3');
  centerText('PROMOTED', 120, 14, '#e3b347');
  if (r.reward) centerText(r.reward, 318, 14, '#7fe0ff');
  centerText(`Level ${lvl() + 1} cleared · bonus ${G.lastBonus}`, 352, 12, '#f2e5c3');
  centerText(`Score ${G.score}    Kills ${G.kills}    Accuracy ${G.shots ? Math.round(100 * G.hits / G.shots) : 0}%`, 380, 12, '#9a8c74');
  const next = G.phase + 1, L = LEVELS[Math.floor(next / 2)];
  centerText(`Next: Level ${Math.floor(next / 2) + 1}, ${L.name} · ${next % 2 === 0 ? 'side assault' : 'forward assault'}`, 430, 12, '#e3b347');
  if (G.stateT > 1.2 && Math.floor(G.t * 2) % 2 === 0) centerText('Press ENTER or tap to continue', 480, 13, '#f2e5c3');
}
function drawInterlude() {
  shade(0.72);
  const L = LEVELS[lvl()];
  centerText('LEVEL ' + (lvl() + 1) + ' · ' + L.name.toUpperCase(), 120, 13, '#9a8c74');
  goldText('SIDE ASSAULT CLEARED', 190, 44);
  centerText(`Bonus ${G.lastBonus} · Aegis shield restored · +1 Barrel Roll, +1 EMP`, 260, 13, '#7fe0ff');
  centerText(`Score ${G.score}    Kills ${G.kills}    Accuracy ${G.shots ? Math.round(100 * G.hits / G.shots) : 0}%`, 292, 12, '#9a8c74');
  centerText('Next: forward assault. Clear it to earn your promotion.', 360, 13, '#e3b347');
  if (G.stateT > 1.2 && Math.floor(G.t * 2) % 2 === 0) centerText('Press ENTER or tap to continue', 440, 13, '#f2e5c3');
}
function drawOver() {
  shade(0.8);
  goldText('THE LEGION FALLS', 170, 46);
  centerText(`You fell as ${RANKS[G.rank].name}. Score ${G.score}`, 240, 14, '#f2e5c3');
  centerText(`Level ${lvl() + 1} · ${ST.view === 'side' ? 'side assault' : 'forward assault'}`, 270, 12, '#9a8c74');
  if (G.stateT > 1.2 && Math.floor(G.t * 2) % 2 === 0) centerText('Press ENTER or tap to continue this view (score resets)', 350, 13, '#e3b347');
}
function drawVictory() {
  shade(0.7);
  laurel(W / 2, 200, 110, '#e3b347');
  goldText('AVE, IMPERATOR', 195, 54);
  centerText('From Star Fighter to Commander of the Empire.', 270, 14, '#f2e5c3');
  centerText(`Final score ${G.score}    Kills ${G.kills}`, 330, 14, '#e3b347');
  if (G.stateT > 1.2 && Math.floor(G.t * 2) % 2 === 0) centerText('Press ENTER or tap to return to the title', 420, 13, '#f2e5c3');
}
function drawTitle() {
  // title backdrop: Latium side view scrolling
  const far = IMG.l1s_far, near = IMG.l1s_near;
  if (far && far.width) { const s = H / 941; tileMirror(far, 0, 660 * s, G.t * 20); tileMirror(near, 640 * s, 301 * s, G.t * 80); }
  shade(0.45);
  const ready = loadedCount >= assetTotal;
  goldText('LEGIO STELLARIS', 120, 66);
  centerText('FROM STAR FIGHTER TO IMPERATOR', 172, 14, '#f2e5c3');
  draw('ps' + (Math.floor(G.t * 10) % 4), W / 2 - 150 + Math.sin(G.t) * 20, 262 + Math.sin(G.t * 1.7) * 8, 0.5);
  draw('pv' + (4 + Math.floor(G.t * 9) % 4), W / 2 + 170, 262 + Math.cos(G.t * 1.5) * 8, 0.6);
  // rank ladder
  ctx.save(); ctx.font = '10px "Space Mono", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const span = W - 140; RANKS.forEach((r, i) => { const x = 70 + span * i / (RANKS.length - 1); ctx.fillStyle = i === RANKS.length - 1 ? '#e3b347' : '#f2e5c3'; ctx.fillText(r.name.toUpperCase(), x, 352); if (i) { ctx.fillStyle = '#9a8c74'; ctx.fillText('›', x - span / (RANKS.length - 1) / 2, 352); } });
  ctx.restore();
  centerText('8 levels · each one a side assault then a forward assault · about 3 minutes per view', 384, 11, '#d9cba8');
  if (!ready) centerText(`Loading the legion… ${Math.round(100 * loadedCount / assetTotal)}%`, 450, 14, '#9a8c74');
  else if (Math.floor(G.t * 2) % 2 === 0) centerText(coarse ? 'Tap to enlist' : 'Press ENTER to enlist', 450, 16, '#f2e5c3');
  centerText('HI ' + String(G.hi).padStart(7, '0'), 500, 12, '#9a8c74');
}

// ---------- loop ----------
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.033, (now - last) / 1000); last = now;
  if (G.state === 'loading' && loadedCount >= assetTotal) G.state = 'title';
  if (hit.m) { muted = !muted; lsSet('legio_mute', muted ? '1' : '0'); cutVid.muted = muted; }
  try { update(dt); render(dt); } catch (err) { console.error(err); }
  for (const k in hit) hit[k] = false;
  const playing = G.state === 'play' && !G.paused; if (document.body.classList.contains('playing') !== playing) document.body.classList.toggle('playing', playing);
  if (coarse) {
    const live = G.state === 'play' && !G.paused && G.sp;
    for (const b of spBtns) { const n = G.sp ? G.sp[b.dataset.sp] : 0, c = b.lastElementChild, t = String(n);
      if (c.textContent !== t) c.textContent = t; const off = !live || n <= 0; if (b.disabled !== off) b.disabled = off; }
    const ch = !(G.rank >= 3); if (bCharge.hidden !== ch) bCharge.hidden = ch; bCharge.disabled = !live;
  }
  requestAnimationFrame(frame);
}
resize(); C.focus();
if (document.fonts) { document.fonts.load('600 20px "Cormorant Garamond"'); document.fonts.load('12px "Space Mono"'); }
requestAnimationFrame(frame);
// test hook (used for automated playtesting)
window.__legio = { G, get ST() { return ST; }, get P() { return P; }, startPhase, playCutscene, endCutscene, skip(t) { if (ST) ST.t = t; }, get enemies() { return enemies; }, kill(e) { damageEnemy(e, 1e6); } };
