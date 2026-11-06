/* Roman Arena — living backgrounds.
   Animated fire, embers, smoke, flowing water/lava, shimmering pools and glows painted on top
   of each stage's static backdrop. Everything is procedural (no extra image downloads) and
   stateless: each particle's position is a pure function of time, so nothing piles up.
   Positions are in normalized IMAGE coordinates (u = 0..1 across, v = 0..1 down the source art). */
(() => {
'use strict';
const TAU = Math.PI * 2;
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// Soft round sprites, one per color, rendered once and reused (much cheaper than per-particle gradients).
const sprites = new Map();
function soft(color) {
  if (sprites.has(color)) return sprites.get(color);
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, color); r.addColorStop(0.35, color.replace(/[\d.]+\)$/, m => (parseFloat(m) * 0.55) + ')')); r.addColorStop(1, color.replace(/[\d.]+\)$/, '0)'));
  g.fillStyle = r; g.fillRect(0, 0, 64, 64); sprites.set(color, c); return c;
}
const FIRE_CORE = 'rgba(255,236,170,1)', FIRE_MID = 'rgba(255,150,40,1)', FIRE_RED = 'rgba(230,60,20,1)';
const SMOKE = 'rgba(70,62,60,1)', MIST = 'rgba(220,245,255,1)', EMBER = 'rgba(255,190,90,1)';

/* ---------- effect painters: (ctx, map, t, fx, calm) ---------- */
// map(u,v) -> [x,y] in world units; map.k = world units per 1.0 of image width
function fire(ctx, m, t, f, calm) {
  const [x, y] = m(f.u, f.v), s = f.s * m.k, seed = f.u * 97 + f.v * 13;
  const flick = calm ? 0.92 : 0.82 + 0.18 * Math.sin(t * 9 + seed) * Math.sin(t * 13.7 + seed * 2);
  ctx.globalAlpha = 0.55 * flick; ctx.drawImage(soft('rgba(255,140,40,0.9)'), x - s * 3, y - s * 3.2, s * 6, s * 6);   // warm light pool
  const n = f.n || 9;
  for (let i = 0; i < n; i++) {           // flame tongues: rise, shrink, cool from yellow to red
    const life = 0.55 + hash(seed + i) * 0.35, p = ((t + hash(seed + i * 7) * life) % life) / life;
    const sway = Math.sin(t * 6 + i * 1.7 + seed) * s * 0.25 * p;
    const px = x + (hash(seed + i * 3) - 0.5) * s * 1.1 + sway, py = y - p * s * 2.2, r = s * (0.75 - p * 0.55);
    ctx.globalAlpha = (1 - p) * 0.85; ctx.drawImage(soft(p < 0.35 ? FIRE_CORE : p < 0.7 ? FIRE_MID : FIRE_RED), px - r, py - r, r * 2, r * 2);
  }
  embers(ctx, m, t, { u: f.u, v: f.v, w: f.s * 0.8, h: f.s * 6, n: f.e ?? 4, s: f.s }, calm);
}
function embers(ctx, m, t, f) {
  const [x, y] = m(f.u, f.v), seed = f.u * 53 + f.v * 7, w = f.w * m.k, h = f.h * m.k, n = f.n || 10, r0 = Math.max(1.2, (f.s || 0.01) * m.k * 0.16);
  for (let i = 0; i < n; i++) {
    const life = 1.6 + hash(seed + i * 5) * 1.6, p = ((t + hash(seed + i * 11) * life) % life) / life;
    const px = x + (hash(seed + i) - 0.5) * w + Math.sin(t * 2 + i * 2.3) * w * 0.15 * p, py = y - p * h;
    ctx.globalAlpha = Math.sin(p * Math.PI) * 0.9; ctx.drawImage(soft(EMBER), px - r0, py - r0, r0 * 2, r0 * 2);
  }
}
function smoke(ctx, m, t, f) {
  const [x, y] = m(f.u, f.v), seed = f.u * 31 + f.v * 17, s = f.s * m.k, n = f.n || 7, prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = 'source-over';
  for (let i = 0; i < n; i++) {
    const life = 7 + hash(seed + i) * 4, p = ((t + hash(seed + i * 9) * life) % life) / life;
    const r = s * (0.6 + p * 2.2), px = x + p * s * (f.drift ?? 2.5) + Math.sin(t * 0.4 + i) * s * 0.3, py = y - p * s * (f.rise ?? 7);
    ctx.globalAlpha = Math.sin(p * Math.PI) * (f.a ?? 0.22); ctx.drawImage(soft(SMOKE), px - r, py - r, r * 2, r * 2);
  }
  ctx.globalCompositeOperation = prev;
}
function fall(ctx, m, t, f) {   // waterfall or lavafall: streaks pouring down plus churning mist at the base
  const [x, y0] = m(f.u, f.v0), [, y1] = m(f.u, f.v1), w = f.w * m.k, n = f.n || 14, seed = f.u * 71 + f.v0 * 3, lava = f.lava;
  const col = lava ? 'rgba(255,214,120,' : 'rgba(235,252,255,', H = y1 - y0;
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const sp = 0.7 + hash(seed + i) * 0.6, p = ((t * sp * (f.speed || 0.9) + hash(seed + i * 13)) % 1), len = H * (0.18 + hash(seed + i * 2) * 0.2);
    const px = x + (hash(seed + i * 5) - 0.5) * w, py = y0 + p * (H + len) - len;
    const top = Math.max(y0, py), bot = Math.min(y1, py + len); if (bot <= top) continue;
    ctx.globalAlpha = 1; ctx.strokeStyle = col + (lava ? 0.55 : 0.5) * Math.sin(p * Math.PI) + ')'; ctx.lineWidth = Math.max(1, w * (0.06 + hash(seed + i * 3) * 0.08));
    ctx.beginPath(); ctx.moveTo(px, top); ctx.lineTo(px, bot); ctx.stroke();
  }
  for (let i = 0; i < 6; i++) {   // splash / mist (or lava glow) at the foot
    const p = ((t * 0.6 + i / 6) % 1), r = w * (0.35 + p * 0.7);
    ctx.globalAlpha = (1 - p) * (lava ? 0.45 : 0.32);
    ctx.drawImage(soft(lava ? 'rgba(255,120,30,1)' : MIST), x + (hash(seed + i) - 0.5) * w - r, y1 - r * 0.8 - p * w * 0.3, r * 2, r * 2);
  }
}
function shimmer(ctx, m, t, f) {   // glints sliding across a water surface or a lava pool
  const [x0, y0] = m(f.u0, f.v0), [x1, y1] = m(f.u1, f.v1), n = f.n || 16, seed = f.u0 * 19 + f.v0 * 23;
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const life = 2 + hash(seed + i) * 2, p = ((t + hash(seed + i * 7) * life) % life) / life;
    const px = x0 + hash(seed + i * 3) * (x1 - x0) + (p - 0.5) * (x1 - x0) * 0.06 * (f.flow ?? 1), py = y0 + hash(seed + i * 5) * (y1 - y0), len = (x1 - x0) * (0.025 + hash(seed + i) * 0.035);
    ctx.globalAlpha = Math.sin(p * Math.PI) * (f.a ?? 0.6); ctx.strokeStyle = f.col || 'rgba(225,250,255,1)'; ctx.lineWidth = Math.max(1, (y1 - y0) * 0.035);
    ctx.beginPath(); ctx.moveTo(px - len / 2, py); ctx.lineTo(px + len / 2, py); ctx.stroke();
  }
}
function glow(ctx, m, t, f, calm) {   // slow breathing light (eyes, portals, lantern, moon)
  const [x, y] = m(f.u, f.v), r = f.r * m.k, k = calm ? 0.85 : 0.7 + 0.3 * Math.sin(t * (f.speed || 1.6) + f.u * 10);
  ctx.globalAlpha = (f.a ?? 0.5) * k; ctx.drawImage(soft(f.col), x - r, y - r, r * 2, r * 2);
}
function flies(ctx, m, t, f) {   // fireflies / magic motes drifting in a region
  const [x0, y0] = m(f.u0, f.v0), [x1, y1] = m(f.u1, f.v1), n = f.n || 14, seed = f.u0 * 41 + f.v1 * 5, r = Math.max(1.5, m.k * 0.0035);
  for (let i = 0; i < n; i++) {
    const px = x0 + (x1 - x0) * (0.5 + 0.5 * Math.sin(t * (0.13 + hash(seed + i) * 0.12) + i * 4.1));
    const py = y0 + (y1 - y0) * (0.5 + 0.5 * Math.sin(t * (0.17 + hash(seed + i * 3) * 0.1) + i * 2.7));
    const a = Math.max(0, Math.sin(t * (1 + hash(seed + i * 9)) + i * 3)); ctx.globalAlpha = a * 0.9;
    ctx.drawImage(soft(f.col || 'rgba(230,255,150,1)'), px - r * 3, py - r * 3, r * 6, r * 6);
  }
}
const PAINT = { fire, embers, smoke, fall, shimmer, glow, flies };

/* ---------- where the life goes, stage by stage (u, v measured on the source art) ---------- */
const STAGES = {
  'bg-battlefield': [
    { t: 'smoke', u: 0.68, v: 0.33, s: 0.03, rise: 8, drift: 3, a: 0.25 }, { t: 'smoke', u: 0.52, v: 0.52, s: 0.025, a: 0.2 }, { t: 'smoke', u: 0.79, v: 0.48, s: 0.025, a: 0.2 },
    { t: 'fire', u: 0.30, v: 0.525, s: 0.012 }, { t: 'fire', u: 0.475, v: 0.53, s: 0.014 }, { t: 'fire', u: 0.68, v: 0.525, s: 0.016 }, { t: 'fire', u: 0.72, v: 0.53, s: 0.012 },
    { t: 'fire', u: 0.97, v: 0.57, s: 0.013 }, { t: 'fire', u: 0.66, v: 0.37, s: 0.008, e: 2 }, { t: 'fire', u: 0.71, v: 0.36, s: 0.008, e: 2 },
    { t: 'embers', u: 0.6, v: 0.55, w: 0.6, h: 0.4, n: 16, s: 0.01 }, { t: 'fire', u: 0.70, v: 0.94, s: 0.012, e: 3 },
  ],
  'bg-colosseum': [
    { t: 'fire', u: 0.17, v: 0.43, s: 0.022 }, { t: 'fire', u: 0.44, v: 0.36, s: 0.018 }, { t: 'fire', u: 0.665, v: 0.36, s: 0.018 }, { t: 'fire', u: 0.905, v: 0.42, s: 0.022 },
    { t: 'shimmer', u0: 0.25, v0: 0.80, u1: 0.75, v1: 0.88, n: 8, col: 'rgba(255,120,40,1)', a: 0.45 },
  ],
  'bg-hades': [
    { t: 'fall', u: 0.24, v0: 0.47, v1: 0.63, w: 0.05, lava: true }, { t: 'fall', u: 0.545, v0: 0.38, v1: 0.49, w: 0.025, lava: true },
    { t: 'fall', u: 0.68, v0: 0.25, v1: 0.36, w: 0.04, lava: true }, { t: 'fall', u: 0.73, v0: 0.52, v1: 0.63, w: 0.05, lava: true },
    { t: 'fire', u: 0.04, v: 0.40, s: 0.026 }, { t: 'fire', u: 0.96, v: 0.40, s: 0.026 },
    { t: 'glow', u: 0.675, v: 0.10, r: 0.09, col: 'rgba(255,40,40,1)', a: 0.3, speed: 0.8 },
    { t: 'shimmer', u0: 0.0, v0: 0.80, u1: 1.0, v1: 0.97, n: 14, col: 'rgba(255,170,60,1)', a: 0.55, flow: 0.4 },
    { t: 'embers', u: 0.5, v: 0.75, w: 1.0, h: 0.6, n: 26, s: 0.01 },
  ],
  'bg-gate': [
    { t: 'fall', u: 0.32, v0: 0.47, v1: 0.64, w: 0.045, lava: true }, { t: 'fall', u: 0.16, v0: 0.27, v1: 0.37, w: 0.02, lava: true },
    { t: 'fall', u: 0.245, v0: 0.29, v1: 0.37, w: 0.015, lava: true }, { t: 'fall', u: 0.835, v0: 0.51, v1: 0.64, w: 0.03, lava: true },
    { t: 'fire', u: 0.045, v: 0.47, s: 0.024 }, { t: 'fire', u: 0.955, v: 0.47, s: 0.024 },
    { t: 'glow', u: 0.70, v: 0.30, r: 0.09, col: 'rgba(255,110,30,1)', a: 0.4, speed: 1.2 },
    { t: 'glow', u: 0.53, v: 0.215, r: 0.012, col: 'rgba(255,60,30,1)', a: 0.8, speed: 2.4 }, { t: 'glow', u: 0.59, v: 0.215, r: 0.012, col: 'rgba(255,60,30,1)', a: 0.8, speed: 2.4 },
    { t: 'glow', u: 0.82, v: 0.22, r: 0.012, col: 'rgba(255,60,30,1)', a: 0.8, speed: 2.1 }, { t: 'glow', u: 0.875, v: 0.20, r: 0.012, col: 'rgba(255,60,30,1)', a: 0.8, speed: 2.1 },
    { t: 'shimmer', u0: 0.0, v0: 0.76, u1: 1.0, v1: 0.97, n: 12, col: 'rgba(255,160,60,1)', a: 0.5, flow: 0.4 },
    { t: 'embers', u: 0.5, v: 0.7, w: 1.0, h: 0.6, n: 24, s: 0.01 },
  ],
  'bg-sea': [
    { t: 'fall', u: 0.665, v0: 0.25, v1: 0.43, w: 0.03, speed: 1.1 }, { t: 'fall', u: 0.735, v0: 0.22, v1: 0.45, w: 0.04, speed: 1.1 }, { t: 'fall', u: 0.81, v0: 0.28, v1: 0.46, w: 0.035, speed: 1.1 },
    { t: 'shimmer', u0: 0.12, v0: 0.40, u1: 0.68, v1: 0.53, n: 26, a: 0.7, flow: 2.5 },
    { t: 'shimmer', u0: 0.10, v0: 0.62, u1: 0.90, v1: 0.75, n: 12, col: 'rgba(170,220,255,1)', a: 0.35, flow: 0.5 },
    { t: 'fire', u: 0.085, v: 0.42, s: 0.022 }, { t: 'fire', u: 0.945, v: 0.42, s: 0.022 },
    { t: 'glow', u: 0.66, v: 0.03, r: 0.02, col: 'rgba(160,240,255,1)', a: 0.6, speed: 2 },
  ],
  'bg-gorgon': [
    { t: 'glow', u: 0.618, v: 0.14, r: 0.022, col: 'rgba(230,120,255,1)', a: 0.9, speed: 1.4 }, { t: 'glow', u: 0.662, v: 0.14, r: 0.022, col: 'rgba(230,120,255,1)', a: 0.9, speed: 1.4 },
    { t: 'fall', u: 0.66, v0: 0.36, v1: 0.48, w: 0.06, speed: 0.5, lava: false, n: 10 },
    { t: 'glow', u: 0.66, v: 0.44, r: 0.08, col: 'rgba(170,60,255,1)', a: 0.35, speed: 1 },
    { t: 'flies', u0: 0.45, v0: 0.30, u1: 0.85, v1: 0.55, n: 14, col: 'rgba(210,140,255,1)' },
    { t: 'fire', u: 0.075, v: 0.55, s: 0.024 }, { t: 'fire', u: 0.94, v: 0.55, s: 0.024 },
  ],
  'bg-labyrinth': [
    { t: 'fire', u: 0.045, v: 0.49, s: 0.026 }, { t: 'fire', u: 0.955, v: 0.49, s: 0.026 },
    { t: 'fire', u: 0.41, v: 0.54, s: 0.01, e: 2 }, { t: 'fire', u: 0.64, v: 0.54, s: 0.01, e: 2 },
    { t: 'fire', u: 0.483, v: 0.495, s: 0.006, e: 1, n: 5 }, { t: 'fire', u: 0.59, v: 0.49, s: 0.006, e: 1, n: 5 },
    { t: 'glow', u: 0.55, v: 0.47, r: 0.05, col: 'rgba(255,170,70,1)', a: 0.35, speed: 1.1 },
  ],
  'bg-forge': [
    { t: 'fall', u: 0.31, v0: 0.33, v1: 0.48, w: 0.04, lava: true, speed: 0.7 }, { t: 'glow', u: 0.29, v: 0.31, r: 0.07, col: 'rgba(255,130,30,1)', a: 0.4, speed: 2 },
    { t: 'fire', u: 0.47, v: 0.38, s: 0.02 }, { t: 'fire', u: 0.575, v: 0.445, s: 0.016 }, { t: 'fire', u: 0.93, v: 0.37, s: 0.026 },
    { t: 'smoke', u: 0.67, v: 0.08, s: 0.03, rise: 5, drift: 3, a: 0.3, n: 8 }, { t: 'glow', u: 0.67, v: 0.10, r: 0.03, col: 'rgba(255,90,30,1)', a: 0.55, speed: 1.7 },
    { t: 'fall', u: 0.76, v0: 0.26, v1: 0.35, w: 0.015, n: 8 }, { t: 'fall', u: 0.81, v0: 0.27, v1: 0.33, w: 0.01, n: 6 },
    { t: 'embers', u: 0.35, v: 0.5, w: 0.5, h: 0.4, n: 16, s: 0.01 },
  ],
  'bg-chiron': [
    { t: 'fall', u: 0.335, v0: 0.33, v1: 0.58, w: 0.02, speed: 1 }, { t: 'fall', u: 0.36, v0: 0.36, v1: 0.58, w: 0.015, speed: 1 }, { t: 'fall', u: 0.56, v0: 0.58, v1: 0.63, w: 0.012, n: 6 },
    { t: 'shimmer', u0: 0.30, v0: 0.62, u1: 0.62, v1: 0.68, n: 14, a: 0.6 },
    { t: 'glow', u: 0.79, v: 0.29, r: 0.02, col: 'rgba(255,200,110,1)', a: 0.7, speed: 2.2 },
    { t: 'flies', u0: 0.05, v0: 0.30, u1: 0.95, v1: 0.65, n: 18 },
  ],
  'bg-diana': [
    { t: 'fall', u: 0.58, v0: 0.36, v1: 0.58, w: 0.035, speed: 0.9 }, { t: 'shimmer', u0: 0.50, v0: 0.60, u1: 0.72, v1: 0.66, n: 14, col: 'rgba(200,240,255,1)', a: 0.6 },
    { t: 'glow', u: 0.565, v: 0.15, r: 0.07, col: 'rgba(210,235,255,1)', a: 0.25, speed: 0.6 },
    { t: 'fire', u: 0.05, v: 0.55, s: 0.016 }, { t: 'fire', u: 0.965, v: 0.54, s: 0.016 },
    { t: 'flies', u0: 0.10, v0: 0.35, u1: 0.90, v1: 0.65, n: 20, col: 'rgba(170,230,255,1)' },
  ],
};

/* draw(ctx, stageKey, toWorld, t, calm)  — toWorld(u,v) maps source-image coords to world coords, toWorld.k = world width of the image */
function draw(ctx, key, toWorld, t, calm) {
  const list = STAGES[key]; if (!list) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const f of list) { const paint = PAINT[f.t]; if (paint) paint(ctx, toWorld, t, f, calm); }
  ctx.restore();
}
window.ArenaBgFX = { draw, stages: Object.keys(STAGES) };
})();
