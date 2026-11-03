/* The Aurelious Quest — a Marcus Aurelius side-scroller by Marcos Garcia, drawn in the style of his Stoic books.
   Original game: all art is drawn in code, plus Marcos Garcia's own illustrations.
   Runs entirely in the browser. No network calls, no tracking; the best result stays in this browser. */
(() => {
  'use strict';

  /* ================= basics ================= */
  const $ = (s) => document.querySelector(s);
  const T = 32, ROWS = 15, VW = 960, VH = 480;
  const cv = $('#cv'); let ctx = cv.getContext('2d');
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const store = { get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } } };
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const img = (src) => { const i = new Image(); i.src = src; return i; };
  const ART = { sketch: img('img/bg-sketch.webp'), lab: img('img/bg-lab.webp'), cosmos: img('img/bg-cosmos.webp') };

  /* ================= lessons on the scrolls ================= */
  const SCROLLS = [
    ['Some things are up to us, and some are not. Spend your strength on the first.', 'Epictetus, Enchiridion 1'],
    ['Do not say more to yourself than what the first impression reports.', 'after Meditations 8.49'],
    ['If anyone can show me I am wrong, I will gladly change.', 'after Meditations 6.21'],
    ['If it is not right, do not do it. If it is not true, do not say it.', 'Meditations 12.17'],
    ['What stands in the way becomes the way.', 'after Meditations 5.20'],
    ['Ask of every claim: who says so, and how would they know?', 'A lesson for the Stoic mind'],
    ['Three echoes of one rumor are still one rumor.', 'A lesson for the Stoic mind'],
    ['The best revenge is not to be like your enemy.', 'after Meditations 6.6'],
    ['Waste no more time arguing about what a good person should be. Be one.', 'after Meditations 10.16'],
  ];

  /* ================= level builder ================= */
  function builder(w) {
    const g = Array.from({ length: ROWS }, () => Array(w).fill('.'));
    const L = {
      w, g, ents: [], q: {}, fields: [], notes: [],
      set(x, y, c) { if (x >= 0 && x < w && y >= 0 && y < ROWS) g[y][x] = c; },
      ground(x0, x1, top = 12) { for (let x = x0; x <= x1; x++) for (let y = top; y < ROWS; y++) L.set(x, y, '#'); },
      plat(x, y, n, c = '=') { for (let i = 0; i < n; i++) L.set(x + i, y, c); },
      col(x, y0, y1, c = 'B') { for (let y = y0; y <= y1; y++) L.set(x, y, c); },
      stairs(x, n, base = 11) { for (let i = 0; i < n; i++) L.col(x + i, base - i, base); },
      box(x, y, content) { L.set(x, y, 'Q'); L.q[x + ',' + y] = content; },
      coins(x, y, n, dx = 1) { for (let i = 0; i < n; i++) L.ent('coin', x + i * dx, y); },
      note(x, y, text, ax, ay) { L.notes.push({ x: x * T, y: y * T, text, ax: ax * T, ay: ay * T }); },
      ent(type, x, y, extra) { L.ents.push(Object.assign({ type, tx: x, ty: y }, extra || {})); },
      field(x, y0, y1) { L.set(x, y0 - 1, 'P'); L.fields.push({ x, y0, y1, period: 2.9, on: 1.5, phase: (x * 0.61) % 2.9 }); },
    };
    return L;
  }

  const LEVELS = [
    { name: 'The Sketchbook Frontier', theme: 0, intro: 'Rome, drawn in graphite beneath a spiral galaxy. The Shadow Legion has torn the first scrolls from the Meditations and scattered them along the road.', art: 'img/bust-sketch.webp', build() {
      const L = builder(150);
      L.ground(0, 24); L.ent('start', 2, 11);
      L.note(4.2, 4.2, 'Golden SPQR block:\nstrike it from below', 9.5, 8.2); L.note(14.5, 6.5, 'Soldier of the Shadow Legion:\nthe sword, or a firm stomp', 19.6, 10.4);
      L.note(34, 2.3, 'A lost scroll of\nthe Meditations', 39.4, 5);
      L.note(58.5, 2.2, 'Eagle: it swoops when\nyou pass beneath', 63, 5.2); L.note(70.5, 5, 'Electric field: wait\nuntil it sleeps', 68.5, 8.5);
      L.coins(6, 10, 3); L.box(9, 8, 'coin'); L.set(10, 8, 'B'); L.box(11, 8, 'heart'); L.set(12, 8, 'B'); L.coins(10, 6, 2);
      L.ent('soldier', 19, 11);
      L.ground(28, 50);
      L.plat(31, 9, 4); L.coins(31, 8, 4);
      L.ent('soldier', 36, 11); L.plat(38, 6, 3); L.ent('scroll', 39, 5, { i: 0 }); L.ent('soldier', 43, 11);
      L.stairs(46, 4); L.col(50, 8, 11);
      L.ground(55, 82); L.ent('check', 57, 11);
      L.ent('eagle', 63, 5); L.coins(60, 10, 3);
      L.field(68, 8, 11); L.coins(70, 10, 3);
      L.ent('soldier', 75, 11); L.box(78, 8, 'laurel'); L.set(77, 8, 'B'); L.set(79, 8, 'B');
      L.ground(86, 150);
      L.plat(90, 9, 3); L.plat(94, 6, 3); L.ent('scroll', 95, 5, { i: 1 }); L.coins(90, 8, 3);
      L.ent('soldier', 93, 11); L.ent('eagle', 101, 4); L.ent('soldier', 104, 11);
      L.field(108, 8, 11); L.coins(110, 10, 2); L.field(113, 8, 11);
      L.ent('soldier', 118, 11); L.col(121, 10, 11); L.col(122, 10, 11); L.ent('scroll', 122, 8, { i: 2 });
      L.ent('eagle', 127, 4); L.ent('soldier', 129, 11);
      L.stairs(133, 5); L.col(138, 7, 11);
      L.ent('flag', 144, 11);
      return L;
    } },
    { name: 'The Weird Science Laboratory', theme: 1, intro: 'Ball lightning, copper coils and Faraday cages. Centurions take two strikes, and the Tesla coils never truly sleep for long.', art: 'img/plate-lightning.webp', build() {
      const L = builder(170);
      L.ground(0, 20); L.ent('start', 2, 11);
      L.coins(5, 10, 4); L.box(8, 8, 'coin'); L.set(9, 8, 'B'); L.box(10, 8, 'coin');
      L.ent('centurion', 16, 11);
      L.ground(25, 40);
      L.plat(27, 9, 3); L.plat(31, 6, 3); L.ent('scroll', 32, 5, { i: 3 });
      L.ent('eagle', 35, 3); L.ent('soldier', 38, 11);
      L.plat(42, 9, 2, 'B');
      L.ground(46, 70); L.ent('check', 47, 11);
      L.field(52, 8, 11); L.coins(53, 10, 2); L.field(56, 8, 11);
      L.ent('centurion', 62, 11); L.ent('eagle', 65, 4); L.box(68, 8, 'heart');
      L.ground(75, 79);
      L.ground(84, 110);
      L.plat(86, 8, 4); L.plat(92, 5, 3); L.ent('scroll', 93, 4, { i: 4 }); L.coins(86, 7, 4);
      L.ent('soldier', 89, 11); L.ent('centurion', 98, 11); L.ent('eagle', 102, 3);
      L.field(105, 8, 11); L.ent('eagle', 108, 5);
      L.ground(115, 170); L.ent('check', 116, 11);
      L.col(122, 9, 11); L.col(123, 9, 11);
      L.field(128, 8, 11); L.ent('centurion', 132, 11); L.field(136, 8, 11);
      L.plat(140, 8, 3); L.ent('scroll', 141, 7, { i: 5 }); L.box(144, 8, 'laurel');
      L.ent('eagle', 147, 3); L.ent('soldier', 150, 11); L.ent('centurion', 154, 11);
      L.stairs(158, 4);
      L.ent('flag', 165, 11);
      return L;
    } },
    { name: 'The Cosmic Forum', theme: 2, intro: 'At the edge of the cosmos waits Chaos, the Storm Legate. Recover the last scrolls and face him with a steady mind.', art: 'img/bg-cosmos.webp', build() {
      const L = builder(196);
      L.ground(0, 14); L.ent('start', 2, 11);
      L.ground(18, 22); L.ground(26, 45);
      L.field(30, 8, 11); L.ent('eagle', 34, 4); L.coins(32, 10, 3); L.field(37, 8, 11);
      L.plat(40, 8, 3); L.ent('scroll', 41, 7, { i: 6 });
      L.plat(47, 9, 2, 'B');
      L.ground(51, 75); L.ent('check', 52, 11);
      L.ent('centurion', 57, 11); L.ent('eagle', 60, 3); L.ent('centurion', 63, 11);
      L.field(66, 7, 11); L.field(70, 7, 11); L.box(73, 8, 'heart');
      L.ground(79, 84, 10); L.coins(80, 9, 3);
      L.ground(89, 93, 11);
      L.ground(98, 126);
      L.plat(101, 8, 3); L.plat(105, 5, 3); L.ent('scroll', 106, 4, { i: 7 });
      L.ent('eagle', 110, 3); L.ent('soldier', 113, 11); L.ent('eagle', 117, 5); L.ent('centurion', 120, 11);
      L.field(124, 8, 11);
      L.ground(131, 196); L.ent('check', 132, 11);
      L.field(137, 8, 11); L.field(140, 8, 11); L.field(143, 8, 11);
      L.plat(148, 8, 3); L.ent('scroll', 149, 7, { i: 8 }); L.box(153, 8, 'laurel');
      L.col(160, 11, 11);
      L.ent('boss', 178, 9);
      L.ent('flag', 190, 11, { hidden: true });
      return L;
    } },
  ];

  /* ================= sound (tiny synth, no files) ================= */
  const SFX = (() => {
    let ac = null, on = store.get('aq-sound') !== false;
    const ensure = () => { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { ac = null; } } if (ac && ac.state === 'suspended') ac.resume(); };
    function tone(f1, f2, dur, type = 'square', vol = 0.08, when = 0) {
      if (!on || !ac) return;
      const t0 = ac.currentTime + when, o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.setValueAtTime(f1, t0); o.frequency.exponentialRampToValueAtTime(Math.max(30, f2), t0 + dur);
      g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g).connect(ac.destination); o.start(t0); o.stop(t0 + dur + 0.02);
    }
    function noise(dur, vol = 0.06, hp = 1200) {
      if (!on || !ac) return;
      const n = ac.createBufferSource(), b = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp; const g = ac.createGain(); g.gain.value = vol;
      n.buffer = b; n.connect(f).connect(g).connect(ac.destination); n.start();
    }
    return {
      ensure, get on() { return on; }, toggle() { on = !on; store.set('aq-sound', on); return on; },
      jump: () => tone(300, 620, 0.14, 'square', 0.05), coin: () => { tone(880, 880, 0.06, 'square', 0.05); tone(1320, 1320, 0.12, 'square', 0.05, 0.06); },
      slash: () => noise(0.12, 0.08, 2500), hit: () => tone(220, 90, 0.15, 'sawtooth', 0.07), stomp: () => tone(500, 120, 0.12, 'square', 0.07),
      hurt: () => tone(330, 110, 0.35, 'sawtooth', 0.08), bump: () => tone(140, 90, 0.08, 'square', 0.06), zap: () => noise(0.18, 0.04, 4000),
      scroll: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.12, 'triangle', 0.07, i * 0.08)),
      power: () => [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, f * 1.01, 0.1, 'square', 0.05, i * 0.06)),
      win: () => [523, 523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.16, 'triangle', 0.08, i * 0.13)),
      boss: () => tone(90, 60, 0.6, 'sawtooth', 0.09),
    };
  })();

  /* ================= input ================= */
  const keys = { left: false, right: false, jump: false, attack: false };
  let jumpPressed = false, attackPressed = false;
  const KEYMAP = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'jump', KeyW: 'jump', Space: 'jump', KeyX: 'attack', KeyJ: 'attack', KeyK: 'attack', KeyZ: 'jump' };
  function press(k, down) {
    if (k === 'jump' && down && !keys.jump) jumpPressed = true;
    if (k === 'attack' && down && !keys.attack) attackPressed = true;
    keys[k] = down;
  }
  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyP' || e.code === 'Escape') { if (S && S.mode === 'play') togglePause(); return; }
    const k = KEYMAP[e.code]; if (!k || !S || S.mode !== 'play') return;
    e.preventDefault(); SFX.ensure(); press(k, true);
  });
  window.addEventListener('keyup', (e) => { const k = KEYMAP[e.code]; if (k) press(k, false); });
  document.querySelectorAll('#touch button').forEach((b) => {
    const k = b.dataset.k;
    const down = (e) => { e.preventDefault(); SFX.ensure(); b.setPointerCapture && b.setPointerCapture(e.pointerId); b.classList.add('on'); press(k, true); };
    const up = (e) => { e.preventDefault(); b.classList.remove('on'); press(k, false); };
    b.addEventListener('pointerdown', down); b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
  });
  if (matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window) document.body.classList.add('touchy');

  /* ================= game state ================= */
  let S = null;   // whole run
  let L = null;   // current level

  function newRun() {
    S = { level: 0, coins: 0, kills: 0, deaths: 0, scrolls: new Set(), maxHp: 3, mode: 'play', score: 0, time: 0 };
    $('#s-title').hidden = true; $('#s-final').hidden = true; $('#s-game').hidden = false;
    window.scrollTo({ top: 0 });
    loadLevel(0, true);
  }

  function loadLevel(n, showIntro) {
    S.level = n;
    const def = LEVELS[n], B = def.build();
    L = { def, w: B.w, g: B.g.map((r) => r.slice()), q: Object.assign({}, B.q), fields: B.fields, notes: B.notes, items: [], enemies: [], parts: [], texts: [], orbs: [], bumps: [],
      start: null, check: null, flag: null, boss: null, toast: null, t: 0, cam: 0, shake: 0, levelCoins: 0, levelKills: 0, levelDeaths: 0, bossOn: false };
    B.ents.forEach((e) => {
      const x = e.tx * T, y = e.ty * T;
      if (e.type === 'start') L.start = { x: x + 5, y: y - 6 };
      else if (e.type === 'coin') L.items.push({ type: 'coin', x: x + 8, y: y + 6, w: 16, h: 20 });
      else if (e.type === 'scroll') { if (!S.scrolls.has(e.i)) L.items.push({ type: 'scroll', i: e.i, x: x + 4, y: y + 2, w: 24, h: 26 }); }
      else if (e.type === 'check') L.items.push({ type: 'check', x: x + 8, y: y - 32, w: 16, h: 64, on: false });
      else if (e.type === 'flag') L.flag = { x: x, y: y - 128, w: 28, h: 160, hidden: !!e.hidden };
      else if (e.type === 'soldier' || e.type === 'centurion') L.enemies.push({ type: e.type, x: x + 4, y: y - 6, w: 24, h: 38, vx: -55, vy: 0, hp: e.type === 'centurion' ? 2 : 1, face: -1, hurt: 0, onGround: false, anim: Math.random() * 6 });
      else if (e.type === 'eagle') L.enemies.push({ type: 'eagle', x, y, w: 34, h: 22, hx: x, hy: y, vx: 0, vy: 0, hp: 1, face: -1, state: 'patrol', st: 0, anim: Math.random() * 6, hurt: 0 });
      else if (e.type === 'boss') { L.boss = { type: 'boss', x, y, w: 48, h: 72, vx: 0, vy: 0, hp: 8, maxHp: 8, face: -1, hurt: 0, onGround: false, jumpT: 2.2, orbT: 1.6, anim: 0, awake: false }; L.enemies.push(L.boss); }
    });
    L.check = { x: L.start.x, y: L.start.y };
    spawnPlayer();
    S.mode = 'play';
    if (showIntro) overlay(`Chapter ${['I', 'II', 'III'][n]}`, def.name, def.intro, 'Begin the chapter', () => {}, def.art);
  }

  let P = null;
  function spawnPlayer() {
    P = { x: L.check.x, y: L.check.y, w: 22, h: 38, vx: 0, vy: 0, face: 1, onGround: false, coyote: 0, buffer: 0, atk: 0, atkCd: 0, hp: S.maxHp, inv: 1.2, anim: 0, glow: 0, dead: 0 };
    L.cam = clamp(P.x - VW * 0.35, 0, L.w * T - VW);
  }

  /* ================= tiles & collision ================= */
  const SOLID = '#BQUP';
  const tileAt = (tx, ty) => (ty < 0 || ty >= ROWS ? '.' : tx < 0 || tx >= L.w ? '#' : L.g[ty][tx]);
  const solid = (tx, ty) => SOLID.includes(tileAt(tx, ty));

  function moveX(e, dx) {
    e.x += dx; e.hitWall = false;
    const top = Math.floor(e.y / T), bot = Math.floor((e.y + e.h - 0.01) / T);
    if (dx > 0) { const tx = Math.floor((e.x + e.w - 0.01) / T); for (let ty = top; ty <= bot; ty++) if (solid(tx, ty)) { e.x = tx * T - e.w; e.vx = 0; e.hitWall = true; break; } }
    else if (dx < 0) { const tx = Math.floor(e.x / T); for (let ty = top; ty <= bot; ty++) if (solid(tx, ty)) { e.x = (tx + 1) * T; e.vx = 0; e.hitWall = true; break; } }
  }
  function moveY(e, dy, onHead) {
    const prevBottom = e.y + e.h;
    e.y += dy; e.onGround = false;
    const l = Math.floor(e.x / T), r = Math.floor((e.x + e.w - 0.01) / T);
    if (dy > 0) {
      const ty = Math.floor((e.y + e.h - 0.01) / T);
      for (let tx = l; tx <= r; tx++) {
        const c = tileAt(tx, ty);
        if (SOLID.includes(c) || (c === '=' && prevBottom <= ty * T + 0.5)) { e.y = ty * T - e.h; e.vy = 0; e.onGround = true; break; }
      }
    } else if (dy < 0) {
      const ty = Math.floor(e.y / T);
      for (let tx = l; tx <= r; tx++) if (solid(tx, ty)) { e.y = (ty + 1) * T; e.vy = 0; if (onHead) onHead(Math.floor((e.x + e.w / 2) / T) === tx ? tx : tx, ty); break; }
    }
  }

  function headHit(tx, ty) {
    // choose the block nearest Marcus's center
    const cx = Math.floor((P.x + P.w / 2) / T);
    const target = solid(cx, ty) ? cx : tx;
    const c = tileAt(target, ty);
    L.bumps.push({ tx: target, ty, t: 0.15 });
    if (c === 'Q') {
      L.g[ty][target] = 'U';
      const what = L.q[target + ',' + ty] || 'coin';
      if (what === 'coin') { S.coins += 1; L.levelCoins += 1; SFX.coin(); L.parts.push({ coinPop: true, x: target * T + 8, y: ty * T - 10, vy: -320, life: 0.55 }); }
      else { SFX.power(); L.items.push({ type: what, x: target * T + 4, y: ty * T - 28, w: 24, h: 24, rise: 0.4 }); }
    } else SFX.bump();
    // defeat enemies standing on a bumped block
    L.enemies.forEach((en) => { if (en.type !== 'eagle' && en.type !== 'boss' && Math.abs(en.y + en.h - ty * T) < 4 && en.x + en.w > target * T && en.x < (target + 1) * T) damage(en, 9, 0); });
  }

  /* ================= effects ================= */
  function burst(x, y, colors, n = 18, sp = 200) {
    const k = reduceMotion ? Math.ceil(n / 3) : n;
    for (let i = 0; i < k; i++) { const a = Math.random() * Math.PI * 2, v = rand(0.3, 1) * sp; L.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, life: rand(0.4, 0.9), c: colors[i % colors.length], r: rand(1.5, 3.5) }); }
  }
  function float(x, y, s, c) { L.texts.push({ x, y, s, c, life: 1 }); }
  function toast(text, cite) { L.toast = { text, cite, life: 5 }; }

  /* ================= combat ================= */
  function damage(en, amount, dir) {
    if (en.hurt > 0 || en.dead) return false;
    en.hp -= amount; en.hurt = en.type === 'boss' ? 0.5 : 0.25;
    if (dir) en.vx = dir * (en.type === 'boss' ? 120 : 160);
    if (en.hp <= 0) {
      en.dead = true; S.kills += 1; L.levelKills += 1;
      burst(en.x + en.w / 2, en.y + en.h / 2, en.type === 'eagle' ? ['#ffd27a', '#8a6a4a', '#fff'] : ['#ffd27a', '#c9a227', '#8fe6d2', '#fff'], en.type === 'boss' ? 70 : 22, en.type === 'boss' ? 320 : 200);
      float(en.x, en.y - 6, en.type === 'boss' ? '+1000' : '+50', '#e7c46a');
      S.score += en.type === 'boss' ? 1000 : 50;
      if (en.type === 'boss') {
        SFX.win(); L.shake = 0.6; if (L.flag) L.flag.hidden = false;
        toast('Chaos is defeated. The last road home is open.', 'Reach the standard');
      } else SFX.hit();
    } else { SFX.hit(); burst(en.x + en.w / 2, en.y + 10, ['#fff', '#8fe6d2'], 8, 140); }
    return true;
  }

  function hurtPlayer(fromX) {
    if (P.inv > 0 || P.dead) return;
    P.hp -= 1; P.inv = 1.3; SFX.hurt(); L.shake = 0.25;
    P.vx = (P.x + P.w / 2 < fromX ? -1 : 1) * 260; P.vy = -380;
    burst(P.x + P.w / 2, P.y + 14, ['#ff7a59', '#fff'], 10, 160);
    if (P.hp <= 0) killPlayer();
  }

  function killPlayer() {
    if (P.dead) return;
    P.dead = 1.2; S.deaths += 1; L.levelDeaths += 1; SFX.hurt();
    burst(P.x + P.w / 2, P.y + P.h / 2, ['#e7c46a', '#7b3fa0', '#fff'], 30, 240);
  }

  /* ================= update ================= */
  const GRAV = 1900, RUN = 235, ACC = 1900, AIR = 1300, FRICT = 2400, JUMP = 730, MAXFALL = 920;

  function updatePlayer(dt) {
    if (P.dead) {
      P.dead -= dt;
      if (P.dead <= 0) { spawnPlayer(); float(P.x - 20, P.y - 20, 'Rise again', '#8fe6d2'); }
      return;
    }
    const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    if (dir) { P.vx += dir * (P.onGround ? ACC : AIR) * dt; P.face = dir; }
    else if (P.onGround) { const f = FRICT * dt; P.vx = Math.abs(P.vx) <= f ? 0 : P.vx - Math.sign(P.vx) * f; }
    P.vx = clamp(P.vx, -RUN, RUN);

    P.coyote = P.onGround ? 0.1 : P.coyote - dt;
    if (jumpPressed) { P.buffer = 0.13; jumpPressed = false; }
    else P.buffer -= dt;
    if (P.buffer > 0 && P.coyote > 0) { P.vy = -JUMP; P.buffer = 0; P.coyote = 0; SFX.jump(); burst(P.x + P.w / 2, P.y + P.h, ['#c9c2b0'], 5, 60); }
    if (!keys.jump && P.vy < -300) P.vy = -300;  // short hop when the button is released early

    if (attackPressed) { attackPressed = false; if (P.atkCd <= 0) { P.atk = 0.2; P.atkCd = 0.34; SFX.slash(); } }
    P.atk -= dt; P.atkCd -= dt; P.inv -= dt; P.glow -= dt; P.anim += dt * (Math.abs(P.vx) > 20 ? Math.abs(P.vx) / 26 : 2);

    P.vy = Math.min(MAXFALL, P.vy + GRAV * dt);
    moveX(P, P.vx * dt);
    moveY(P, P.vy * dt, headHit);
    if (P.x < 0) P.x = 0;
    if (P.y > ROWS * T + 60) { P.hp = 0; killPlayer(); return; }

    // sword
    if (P.atk > 0) {
      const hb = { x: P.face > 0 ? P.x + P.w - 4 : P.x - 42, y: P.y + 2, w: 46, h: 30 };
      L.enemies.forEach((en) => { if (!en.dead && overlap(hb, en)) damage(en, 1, P.face); });
      L.orbs.forEach((o) => { if (overlap(hb, o)) { o.dead = true; burst(o.x, o.y, ['#b9a6ff', '#fff'], 10, 150); } });
    }

    // items
    L.items.forEach((it) => {
      if (it.taken || it.rise > 0) return;
      if (!overlap(P, it)) return;
      if (it.type === 'coin') { it.taken = true; S.coins += 1; L.levelCoins += 1; S.score += 10; SFX.coin(); burst(it.x + 8, it.y + 10, ['#e7c46a', '#fff'], 6, 90); }
      else if (it.type === 'heart') { it.taken = true; P.hp = Math.min(S.maxHp, P.hp + 1); SFX.power(); float(it.x, it.y, '+1 heart', '#ff9b8a'); }
      else if (it.type === 'laurel') { it.taken = true; S.maxHp = Math.min(5, S.maxHp + 1); P.hp = S.maxHp; P.glow = 1.6; SFX.power(); float(it.x - 10, it.y, 'Laurel of Virtue: +1 max heart', '#8fe6d2'); }
      else if (it.type === 'scroll') { it.taken = true; S.scrolls.add(it.i); S.score += 500; SFX.scroll(); burst(it.x + 12, it.y + 12, ['#e7c46a', '#fff6e0', '#8fe6d2'], 26, 200); toast(SCROLLS[it.i][0], SCROLLS[it.i][1]); }
      else if (it.type === 'check' && !it.on) { it.on = true; L.check = { x: it.x - 2, y: it.y + 26 }; SFX.coin(); float(it.x - 30, it.y - 10, 'Checkpoint', '#8fe6d2'); }
    });
    L.items = L.items.filter((it) => !it.taken || it.type === 'check');

    // electric fields
    L.fields.forEach((f) => {
      if (!fieldOn(f)) return;
      const r = { x: f.x * T + 9, y: f.y0 * T, w: 14, h: (f.y1 - f.y0 + 1) * T };
      if (overlap(P, r)) { hurtPlayer(f.x * T + 16); SFX.zap(); }
    });

    // finish
    if (L.flag && !L.flag.hidden && overlap(P, L.flag)) levelComplete();
  }

  const fieldOn = (f) => ((L.t + f.phase) % f.period) < f.on;
  const fieldWarn = (f) => { const c = (L.t + f.phase) % f.period; return c > f.period - 0.45; };

  function updateEnemies(dt) {
    L.enemies.forEach((en) => {
      if (en.dead) return;
      en.hurt -= dt; en.anim += dt;
      if (en.type === 'soldier' || en.type === 'centurion') {
        const speed = en.type === 'centurion' ? 70 : 55;
        if (en.hurt <= 0) en.vx = en.face * speed;
        en.vy = Math.min(MAXFALL, en.vy + GRAV * dt);
        moveX(en, en.vx * dt); moveY(en, en.vy * dt);
        if (en.hitWall) en.face *= -1;
        if (en.onGround) { const ax = Math.floor((en.face > 0 ? en.x + en.w + 2 : en.x - 2) / T), ay = Math.floor((en.y + en.h + 4) / T); const c = tileAt(ax, ay); if (!SOLID.includes(c) && c !== '=') en.face *= -1; }
        if (en.y > ROWS * T + 60) en.dead = true;
      } else if (en.type === 'eagle') {
        const px = P.x + P.w / 2, py = P.y + P.h / 2;
        if (en.state === 'patrol') {
          en.x = en.hx + Math.sin(en.anim * 0.9) * 90; en.y = en.hy + Math.sin(en.anim * 2.2) * 14;
          en.face = Math.cos(en.anim * 0.9) > 0 ? 1 : -1;
          if (!P.dead && Math.abs(px - en.x) < 230 && py > en.y + 30 && en.st <= 0) { en.state = 'swoop'; en.st = 1.1; const dx = px - en.x, dy = py - en.y, d = Math.hypot(dx, dy) || 1; en.vx = (dx / d) * 280; en.vy = (dy / d) * 280; en.face = Math.sign(dx) || -1; }
          en.st -= dt;
        } else if (en.state === 'swoop') {
          en.x += en.vx * dt; en.y += en.vy * dt; en.st -= dt;
          if (en.st <= 0 || en.y > 11 * T) { en.state = 'rise'; }
        } else {
          en.y += (en.hy - en.y) * Math.min(1, dt * 2.2); en.x += (en.hx - en.x) * Math.min(1, dt * 1.2);
          if (Math.abs(en.y - en.hy) < 6) { en.state = 'patrol'; en.st = 1.4; en.anim = Math.asin(clamp((en.x - en.hx) / 90, -1, 1)) / 0.9; }
        }
      } else if (en.type === 'boss') updateBoss(en, dt);

      // contact with Marcus
      if (!P.dead && !en.dead && overlap(P, en)) {
        const stomp = P.vy > 60 && P.y + P.h - en.y < (en.type === 'boss' ? 22 : 16);
        if (stomp) { if (damage(en, 1, 0)) { P.vy = -520; SFX.stomp(); S.score += 0; } else P.vy = -420; }
        else hurtPlayer(en.x + en.w / 2);
      }
    });
    L.enemies = L.enemies.filter((en) => !en.dead || en === L.boss);

    // boss orbs
    L.orbs.forEach((o) => { o.x += o.vx * dt; o.life -= dt; if (!P.dead && overlap(P, { x: o.x - 9, y: o.y - 9, w: 18, h: 18 })) { o.dead = true; hurtPlayer(o.x); } if (solid(Math.floor(o.x / T), Math.floor(o.y / T))) o.dead = true; });
    L.orbs = L.orbs.filter((o) => !o.dead && o.life > 0);
  }

  function updateBoss(b, dt) {
    if (b.dead) return;
    if (!b.awake) { if (P.x > b.x - 520) { b.awake = true; L.bossOn = true; SFX.boss(); toast('Chaos, the Storm Legate, blocks the road. Strike him, or land on his helmet.', 'Boss'); } else return; }
    b.anim += dt;
    const dir = Math.sign(P.x - b.x) || -1; b.face = dir;
    if (b.hurt <= 0) b.vx = dir * 75;
    b.jumpT -= dt; b.orbT -= dt;
    if (b.jumpT <= 0 && b.onGround) { b.vy = -760; b.jumpT = rand(2, 3); }
    if (b.orbT <= 0) { b.orbT = b.hp <= 4 ? 1.1 : 1.7; L.orbs.push({ x: b.x + b.w / 2 + dir * 30, y: b.y + 28, vx: dir * 250, life: 4 }); SFX.zap(); }
    b.vy = Math.min(MAXFALL, b.vy + GRAV * dt);
    moveX(b, b.vx * dt);
    const wasAir = !b.onGround;
    moveY(b, b.vy * dt);
    if (wasAir && b.onGround) { L.shake = 0.3; burst(b.x + b.w / 2, b.y + b.h, ['#b9a6ff', '#fff'], 12, 180); }
    if (b.x < 162 * T) b.x = 162 * T;
  }

  function update(dt) {
    L.t += dt; S.time += dt;
    updatePlayer(dt); updateEnemies(dt);
    L.items.forEach((it) => { if (it.rise > 0) { it.rise -= dt; it.y -= 24 * dt; } });
    L.parts.forEach((p) => { p.life -= dt; if (p.coinPop) { p.y += p.vy * dt; p.vy += 1200 * dt; } else { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 500 * dt; p.vx *= 0.98; } });
    L.parts = L.parts.filter((p) => p.life > 0);
    L.texts.forEach((x) => { x.life -= dt; x.y -= 30 * dt; }); L.texts = L.texts.filter((x) => x.life > 0);
    L.bumps.forEach((b) => { b.t -= dt; }); L.bumps = L.bumps.filter((b) => b.t > 0);
    if (L.toast) { L.toast.life -= dt; if (L.toast.life <= 0) L.toast = null; }
    L.shake = Math.max(0, L.shake - dt);
    const target = clamp(P.x - VW * 0.38, 0, L.w * T - VW);
    L.cam += (target - L.cam) * Math.min(1, dt * 8);
  }

  /* ================= drawing ================= */
  /* ---------- book styles: 0 = Grand Mysteries (graphite on parchment), 1 = Weird Science (navy, gold, teal), 2 = the cosmos ---------- */
  const THEMES = [
    { ink: '#2b1d10', outline: '#2b1d10', ow: 1.6, paper: '#efe6cf', fill: '#e6d8b8', fill2: '#d8c7a0', hatch: 'rgba(60,40,20,0.32)', top: '#2b1d10', plat: '#f3ecda', brick: '#e2d3b0', sepia: true },
    { ink: '#c9a227', outline: '#c9a227', ow: 1, paper: '#071019', fill: '#121c27', fill2: '#0c141d', hatch: 'rgba(143,230,210,0.10)', top: '#c9a227', plat: '#8a6a2a', brick: '#16212d', sepia: false },
    { ink: '#c9a227', outline: '#e7c46a', ow: 1, paper: '#05060f', fill: '#161230', fill2: '#0e0b22', hatch: 'rgba(185,166,255,0.10)', top: '#e7c46a', plat: '#2a2350', brick: '#1d1840', sepia: false },
  ];
  let stars = Array.from({ length: 120 }, () => ({ x: Math.random() * VW * 2, y: Math.random() * VH * 0.7, s: Math.random() < 0.15 ? 2 : 1 }));
  // paper grain, made once
  const grain = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const d = g.createImageData(128, 128);
    for (let i = 0; i < d.data.length; i += 4) { const v = 200 + Math.random() * 55; d.data[i] = v; d.data[i + 1] = v * 0.95; d.data[i + 2] = v * 0.82; d.data[i + 3] = 26; } g.putImageData(d, 0, 0); return c; })();

  // Each chapter's scenery (paper + book illustration + mirrored copy) is painted once into a strip, then scrolled with parallax.
  const strips = {};
  function strip(th) {
    if (strips[th]) return strips[th];
    const im = [ART.sketch, ART.lab, ART.cosmos][th]; if (!im.complete || !im.naturalWidth) return null;
    const t = THEMES[th], h = 600, w = Math.round(im.naturalWidth * (h / im.naturalHeight));
    const c = document.createElement('canvas'); c.width = w * 2; c.height = h; const g = c.getContext('2d');
    g.fillStyle = t.paper; g.fillRect(0, 0, c.width, h);
    g.globalAlpha = th === 0 ? 0.92 : th === 1 ? 0.85 : 0.75; if (th === 0) g.globalCompositeOperation = 'multiply';
    g.drawImage(im, 0, 0, w, h); g.save(); g.translate(w * 2, 0); g.scale(-1, 1); g.drawImage(im, 0, 0, w, h); g.restore();
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    if (th === 0) { g.fillStyle = g.createPattern(grain, 'repeat'); g.fillRect(0, 0, c.width, h); }
    return (strips[th] = c);
  }
  const vignette = (() => { const c = document.createElement('canvas'); c.width = VW; c.height = VH; const g = c.getContext('2d');
    const v = g.createRadialGradient(VW / 2, VH / 2, VH * 0.35, VW / 2, VH / 2, VW * 0.65); v.addColorStop(0, 'rgba(120,90,50,0)'); v.addColorStop(1, 'rgba(120,90,50,0.35)'); g.fillStyle = v; g.fillRect(0, 0, VW, VH); return c; })();
  const shade = [null, [0.15, 0.65, '7,16,25'], [0, 0.6, '5,6,15']].map((x) => { if (!x) return null; const c = document.createElement('canvas'); c.width = 4; c.height = VH; const g = c.getContext('2d');
    const f = g.createLinearGradient(0, 0, 0, VH); f.addColorStop(0, `rgba(${x[2]},${x[0]})`); f.addColorStop(1, `rgba(${x[2]},${x[1]})`); g.fillStyle = f; g.fillRect(0, 0, 4, VH); return c; });

  function drawBackground(th) {
    const t = THEMES[th], st = strip(th), par = [0.18, 0.15, 0.12][th], y0 = [-60, -40, -50][th];
    ctx.fillStyle = t.paper; ctx.fillRect(0, 0, VW, VH);
    if (st) { const off = (L.cam * par) % st.width; for (let x = -off; x < VW; x += st.width) ctx.drawImage(st, Math.floor(x), y0); }
    if (th === 0) ctx.drawImage(vignette, 0, 0);
    else ctx.drawImage(shade[th], 0, 0, VW, VH);
    if (th === 1) {
      if (Math.sin(L.t * 1.7) > 0.97) { ctx.strokeStyle = 'rgba(143,230,210,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); let x = rand(100, VW - 100), y = 50; ctx.moveTo(x, y); while (y < 260) { x += rand(-18, 18); y += rand(10, 24); ctx.lineTo(x, y); } ctx.stroke(); }
      ctx.strokeStyle = 'rgba(201,162,39,0.55)'; ctx.lineWidth = 1; ctx.strokeRect(10, 50, VW - 20, VH - 60); ctx.strokeRect(15, 55, VW - 30, VH - 70);
      [[15, 55], [VW - 15, 55], [15, VH - 15], [VW - 15, VH - 15]].forEach(([x, y]) => { ctx.fillStyle = '#c9a227'; ctx.beginPath(); ctx.moveTo(x, y - 7); ctx.lineTo(x + 7, y); ctx.lineTo(x, y + 7); ctx.lineTo(x - 7, y); ctx.closePath(); ctx.fill(); });
    }
    if (th === 2) stars.forEach((s) => { const x = ((s.x - L.cam * 0.05) % (VW * 2) + VW * 2) % (VW * 2); if (s.y > 200) return; ctx.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(L.t + s.x)); ctx.fillStyle = '#fff6e0'; ctx.fillRect(x, s.y, s.s, s.s); });
    ctx.globalAlpha = 1;
  }

  function hatch(x, y, w, h, color, step = 6) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.beginPath();
    for (let k = -h; k < w; k += step) { ctx.moveTo(x + k, y + h); ctx.lineTo(x + k + h, y); }
    ctx.stroke(); ctx.restore();
  }

  function drawTiles(th) {
    const t = THEMES[th], x0 = Math.floor(L.cam / T), x1 = Math.min(L.w - 1, x0 + Math.ceil(VW / T) + 1);
    for (let ty = 0; ty < ROWS; ty++) for (let tx = x0; tx <= x1; tx++) {
      const c = L.g[ty][tx]; if (c === '.') continue;
      const x = tx * T - L.cam; let y = ty * T;
      const bump = L.bumps.find((b) => b.tx === tx && b.ty === ty); if (bump) y -= Math.sin((bump.t / 0.15) * Math.PI) * 8;
      ctx.lineWidth = th === 0 ? 1.6 : 1;
      if (c === '#') {
        const isTop = tileAt(tx, ty - 1) !== '#';
        ctx.fillStyle = isTop ? t.fill : t.fill2; ctx.fillRect(x, y, T, T);
        hatch(x, y, T, T, t.hatch, th === 0 ? 5 : 8);
        if (th === 0) { ctx.strokeStyle = 'rgba(43,29,16,0.45)'; ctx.beginPath(); ctx.moveTo(x + (tx * 7) % 20 + 4, y + 10); ctx.lineTo(x + (tx * 7) % 20 + 10, y + 18); ctx.stroke(); }
        if (isTop) {
          ctx.strokeStyle = t.top; ctx.lineWidth = th === 0 ? 2.2 : 2; ctx.beginPath(); ctx.moveTo(x, y + 1); ctx.lineTo(x + T, y + 1); ctx.stroke();
          if (th === 0) { ctx.lineWidth = 1.2; ctx.beginPath(); for (let k = 0; k < 4; k++) { const gx = x + 3 + k * 8 + (tx % 3); ctx.moveTo(gx, y + 1); ctx.lineTo(gx - 2, y - 5); ctx.moveTo(gx + 2, y + 1); ctx.lineTo(gx + 3, y - 4); } ctx.stroke(); }
          if (th === 1) { ctx.fillStyle = '#8fe6d2'; ctx.fillRect(x + 6, y + 6, 2, 2); ctx.fillRect(x + 24, y + 6, 2, 2); }
        }
        if (tileAt(tx - 1, ty) !== '#') { ctx.strokeStyle = t.top; ctx.beginPath(); ctx.moveTo(x + 0.5, y); ctx.lineTo(x + 0.5, y + T); ctx.stroke(); }
        if (tileAt(tx + 1, ty) !== '#') { ctx.strokeStyle = t.top; ctx.beginPath(); ctx.moveTo(x + T - 0.5, y); ctx.lineTo(x + T - 0.5, y + T); ctx.stroke(); }
      } else if (c === 'B') {
        ctx.fillStyle = t.brick; ctx.fillRect(x, y, T, T);
        ctx.strokeStyle = t.ink; ctx.strokeRect(x + 0.5, y + 0.5, T - 1, T - 1);
        ctx.beginPath(); ctx.moveTo(x, y + 16); ctx.lineTo(x + T, y + 16); ctx.moveTo(x + 16, y); ctx.lineTo(x + 16, y + 16); ctx.moveTo(x + 8, y + 16); ctx.lineTo(x + 8, y + T); ctx.moveTo(x + 24, y + 16); ctx.lineTo(x + 24, y + T); ctx.stroke();
        hatch(x + 1, y + 24, T - 2, 7, t.hatch, 4);
      } else if (c === 'Q') {
        const pulse = 0.8 + 0.2 * Math.sin(L.t * 4 + tx);
        ctx.fillStyle = '#b8901f'; ctx.fillRect(x, y, T, T); ctx.fillStyle = `rgba(240,208,122,${pulse})`; ctx.fillRect(x + 3, y + 3, T - 6, T - 6);
        ctx.strokeStyle = th === 0 ? '#2b1d10' : '#5a3f0a'; ctx.lineWidth = 1.5; ctx.strokeRect(x + 0.75, y + 0.75, T - 1.5, T - 1.5); ctx.strokeRect(x + 4, y + 4, T - 8, T - 8);
        ctx.fillStyle = '#4a330a'; ctx.font = '700 11px "Cormorant Garamond", Georgia, serif'; ctx.textAlign = 'center'; ctx.fillText('SPQR', x + 16, y + 20); ctx.textAlign = 'left';
      } else if (c === 'U') {
        ctx.fillStyle = th === 0 ? '#cdbb92' : '#3a2f1c'; ctx.fillRect(x, y, T, T); ctx.strokeStyle = t.ink; ctx.lineWidth = 1.2; ctx.strokeRect(x + 0.5, y + 0.5, T - 1, T - 1); hatch(x, y, T, T, t.hatch, 4);
      } else if (c === 'P') {
        if (th === 1) { // Tesla coil cap
          ctx.fillStyle = '#5a3a1e'; ctx.fillRect(x + 6, y, T - 12, T);
          ctx.strokeStyle = '#d08a4a'; ctx.lineWidth = 2; for (let k = 4; k < T; k += 5) { ctx.beginPath(); ctx.moveTo(x + 6, y + k); ctx.lineTo(x + T - 6, y + k + 2); ctx.stroke(); }
          ctx.fillStyle = '#c9a227'; ctx.beginPath(); ctx.ellipse(x + 16, y + 2, 13, 5, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#8fe6d2'; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(L.t * 9 + tx); ctx.beginPath(); ctx.arc(x + 16, y - 3, 5, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
        } else {
          ctx.fillStyle = th === 0 ? '#d9c9a4' : '#2a2a48'; ctx.fillRect(x + 5, y, T - 10, T); ctx.strokeStyle = t.ink; ctx.lineWidth = 1.5; ctx.strokeRect(x + 5.5, y + 0.5, T - 11, T - 1);
          ctx.fillStyle = th === 0 ? '#2b1d10' : '#e7c46a'; ctx.fillRect(x + 2, y, T - 4, 4); ctx.fillStyle = '#8fe6d2'; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(L.t * 8 + tx); ctx.fillRect(x + 10, y + T - 7, T - 20, 5); ctx.globalAlpha = 1;
        }
      } else if (c === '=') {
        ctx.fillStyle = t.plat; ctx.fillRect(x, y, T, 12);
        ctx.strokeStyle = t.ink; ctx.lineWidth = th === 0 ? 1.5 : 1; ctx.strokeRect(x + 0.5, y + 0.5, T - 1, 11);
        hatch(x, y + 7, T, 5, t.hatch, 3);
        if (th === 1) { ctx.fillStyle = '#e7c46a'; ctx.fillRect(x + 3, y + 4, 2, 2); ctx.fillRect(x + 27, y + 4, 2, 2); }
      }
    }
  }

  function drawFields() {
    const th = L.def.theme;
    L.fields.forEach((f) => {
      const x = f.x * T - L.cam + 16; if (x < -40 || x > VW + 40) return;
      const top = f.y0 * T, bot = (f.y1 + 1) * T;
      if (fieldOn(f)) {
        ctx.save(); ctx.shadowColor = th === 0 ? '#5fb8a3' : '#8fe6d2'; ctx.shadowBlur = th === 0 ? 8 : 16;
        const cols = th === 0 ? ['#1e2a3a', '#2f6f8f', '#5fb8a3'] : ['#ffffff', '#8fe6d2', '#b9a6ff'];
        for (let k = 0; k < 3; k++) {
          ctx.strokeStyle = cols[k]; ctx.lineWidth = k === 0 ? 2 : 2.5; ctx.globalAlpha = k === 0 ? 1 : 0.75;
          ctx.beginPath(); ctx.moveTo(x, top); for (let y = top + 8; y <= bot; y += 8) ctx.lineTo(x + rand(-7, 7), y); ctx.stroke();
        }
        ctx.restore(); ctx.globalAlpha = 1;
        ctx.fillStyle = th === 0 ? 'rgba(47,111,143,0.12)' : 'rgba(143,230,210,0.12)'; ctx.fillRect(x - 14, top, 28, bot - top);
      } else {
        ctx.strokeStyle = fieldWarn(f) ? (th === 0 ? 'rgba(160,60,30,0.9)' : 'rgba(255,240,180,0.85)') : (th === 0 ? 'rgba(43,29,16,0.35)' : 'rgba(143,230,210,0.25)');
        ctx.setLineDash([3, 7]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bot); ctx.stroke(); ctx.setLineDash([]);
        if (fieldWarn(f)) { ctx.fillStyle = th === 0 ? '#a03c1e' : '#fff2b0'; for (let i = 0; i < 3; i++) ctx.fillRect(x + rand(-6, 6), rand(top, bot), 2, 2); }
      }
    });
  }

  // handwritten field notes, like the annotated diagrams in Grand Mysteries
  function drawNotes() {
    ctx.save(); ctx.font = 'italic 600 17px "Cormorant Garamond", Georgia, serif'; ctx.fillStyle = '#2b1d10'; ctx.strokeStyle = 'rgba(43,29,16,0.7)'; ctx.lineWidth = 1;
    L.notes.forEach((n) => {
      const x = n.x - L.cam, ax = n.ax - L.cam; if (x < -320 || x > VW + 60) return;
      ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(x + 6, n.y + 6); ctx.quadraticCurveTo((x + ax) / 2, n.y + 30, ax, n.ay); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(ax, n.ay, 2.5, 0, 7); ctx.fill();
      ctx.save(); ctx.translate(x, n.y); ctx.rotate(-0.03); n.text.split('\n').forEach((line, i) => ctx.fillText(line, 0, i * 18)); ctx.restore();
    });
    ctx.restore();
  }

  // every character gets an ink (or gold) outline, like the book illustrations
  const sprCv = document.createElement('canvas'), sprCtx = sprCv.getContext('2d');
  const silCv = document.createElement('canvas'), silCtx = silCv.getContext('2d');
  function inked(bx, by, bw, bh, draw) {
    const pad = 4, W = Math.ceil(bw + pad * 2), H = Math.ceil(bh + pad * 2), th = THEMES[L.def.theme];
    if (sprCv.width < W || sprCv.height < H) { sprCv.width = silCv.width = Math.max(W, sprCv.width); sprCv.height = silCv.height = Math.max(H, sprCv.height); }
    sprCtx.clearRect(0, 0, sprCv.width, sprCv.height); silCtx.clearRect(0, 0, silCv.width, silCv.height);
    const main = ctx; ctx = sprCtx; sprCtx.save(); sprCtx.translate(pad - bx, pad - by); draw(); sprCtx.restore(); ctx = main;
    silCtx.globalCompositeOperation = 'source-over'; silCtx.drawImage(sprCv, 0, 0); silCtx.globalCompositeOperation = 'source-in'; silCtx.fillStyle = th.outline; silCtx.fillRect(0, 0, silCv.width, silCv.height);
    const o = th.ow, dirs = th.sepia ? [[-o, 0], [o, 0], [0, -o], [0, o], [-o, -o], [o, -o], [-o, o], [o, o]] : [[-o, 0], [o, 0], [0, -o], [0, o]];
    dirs.forEach(([dx, dy]) => ctx.drawImage(silCv, 0, 0, W, H, bx - pad + dx, by - pad + dy, W, H));
    ctx.drawImage(sprCv, 0, 0, W, H, bx - pad, by - pad, W, H);
  }

  function drawMarcus(x, y, face, p) {
    if (p.inv > 0 && !p.dead && Math.floor(p.inv * 14) % 2) return;
    const run = Math.abs(p.vx) > 20 && p.onGround, ph = Math.sin(p.anim);
    ctx.save(); ctx.translate(Math.round(x + p.w / 2), Math.round(y + p.h)); ctx.scale(face, 1);
    if (p.glow > 0) { ctx.shadowColor = '#8fe6d2'; ctx.shadowBlur = 20; }
    // cape
    const sway = run ? ph * 3 : Math.sin(L.t * 3) * 1.5, flare = Math.min(10, Math.abs(p.vx) / 25) + (p.onGround ? 0 : 6);
    ctx.fillStyle = '#6b2f8f'; ctx.beginPath(); ctx.moveTo(-6, -32); ctx.lineTo(-12 - flare, -4 + sway); ctx.lineTo(-2, -6); ctx.lineTo(4, -30); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#7f3aa8'; ctx.beginPath(); ctx.moveTo(-5, -32); ctx.lineTo(-9 - flare * 0.7, -8 + sway); ctx.lineTo(-2, -10); ctx.closePath(); ctx.fill();
    // legs
    const l1 = run ? ph * 5 : 0, l2 = -l1;
    ctx.fillStyle = '#d9a77c'; ctx.fillRect(-6 + l1 * 0.3, -12, 4, 9); ctx.fillRect(2 + l2 * 0.3, -12, 4, 9);
    ctx.fillStyle = '#5a3a1e'; ctx.fillRect(-7 + l1 * 0.3, -3, 6, 3); ctx.fillRect(1 + l2 * 0.3, -3, 6, 3);
    if (!p.onGround) { ctx.fillStyle = '#d9a77c'; ctx.fillRect(-6, -10, 4, 4); }
    // skirt (pteruges)
    ctx.fillStyle = '#a8322d'; ctx.fillRect(-8, -17, 16, 6);
    ctx.fillStyle = '#c9a227'; for (let i = 0; i < 4; i++) ctx.fillRect(-7 + i * 4, -13, 2, 3);
    // cuirass
    ctx.fillStyle = '#c9a227'; ctx.fillRect(-8, -31, 16, 15);
    ctx.fillStyle = '#e7c46a'; ctx.fillRect(-6, -29, 5, 5); ctx.fillStyle = '#8a6b14'; ctx.fillRect(-8, -21, 16, 2); ctx.fillRect(-1, -31, 2, 10);
    // arm + sword
    if (p.atk > 0) {
      const k = 1 - p.atk / 0.2, a = -1.4 + k * 2.6;
      ctx.save(); ctx.translate(6, -26); ctx.rotate(a);
      ctx.fillStyle = '#d9a77c'; ctx.fillRect(0, -2, 9, 4);
      ctx.fillStyle = '#7a5a2a'; ctx.fillRect(8, -3, 3, 6);
      ctx.fillStyle = '#e8eef5'; ctx.fillRect(11, -2, 24, 4); ctx.fillStyle = '#ffffff'; ctx.fillRect(11, -2, 24, 1);
      ctx.restore();
      ctx.strokeStyle = `rgba(232,238,245,${0.8 * (1 - k)})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(6, -24, 34, -1.3, -1.3 + k * 2.5); ctx.stroke();
      ctx.strokeStyle = `rgba(143,230,210,${0.5 * (1 - k)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(6, -24, 40, -1.2, -1.2 + k * 2.4); ctx.stroke();
    } else {
      ctx.fillStyle = '#d9a77c'; ctx.fillRect(5, -29, 4, 11);
      ctx.fillStyle = '#7a5a2a'; ctx.fillRect(5, -18, 4, 3);
      ctx.fillStyle = '#cfd6de'; ctx.fillRect(6, -15, 2, 12);
    }
    // head: face, curls, beard, laurel
    ctx.fillStyle = '#e0b48a'; ctx.fillRect(-5, -42, 11, 11);
    ctx.fillStyle = '#3b2716'; ctx.fillRect(-6, -45, 13, 4); ctx.fillRect(-7, -43, 4, 7); ctx.fillRect(-5, -34, 11, 4); ctx.fillRect(2, -36, 4, 2);
    ctx.fillStyle = '#2a1b0e'; ctx.fillRect(3, -39, 2, 2);
    ctx.fillStyle = '#4f9a3c'; for (let i = 0; i < 5; i++) ctx.fillRect(-6 + i * 3, -46 + (i % 2), 3, 2);
    ctx.restore();
  }

  function drawSoldier(en) {
    const x = Math.round(en.x - L.cam), y = Math.round(en.y), c = en.type === 'centurion';
    if (en.hurt > 0 && Math.floor(en.hurt * 20) % 2) return;
    ctx.save(); ctx.translate(x + en.w / 2, y + en.h); ctx.scale(en.face, 1);
    const ph = Math.sin(en.anim * 9);
    ctx.fillStyle = '#20232e'; ctx.fillRect(-6 + ph * 2, -12, 4, 11); ctx.fillRect(2 - ph * 2, -12, 4, 11);
    ctx.fillStyle = '#3a2216'; ctx.fillRect(-7 + ph * 2, -2, 6, 2); ctx.fillRect(1 - ph * 2, -2, 6, 2);
    ctx.fillStyle = '#4a1e1e'; ctx.fillRect(-8, -17, 16, 6);
    ctx.fillStyle = c ? '#3d3020' : '#2e3242'; ctx.fillRect(-8, -31, 16, 15);
    ctx.fillStyle = c ? '#c9a227' : '#5a6078'; ctx.fillRect(-8, -26, 16, 2); ctx.fillRect(-8, -21, 16, 2);
    // shield in front
    ctx.fillStyle = '#7a1f1a'; ctx.fillRect(5, -32, 7, 22); ctx.fillStyle = '#c9a227'; ctx.fillRect(7, -23, 3, 4);
    // spear
    ctx.fillStyle = '#6b4a2a'; ctx.fillRect(-10, -44, 2, 40); ctx.fillStyle = '#cfd6de'; ctx.fillRect(-11, -48, 4, 6);
    // head + helmet + plume
    ctx.fillStyle = '#c9946a'; ctx.fillRect(-4, -41, 9, 9);
    ctx.fillStyle = '#1b1e28'; ctx.fillRect(-5, -44, 11, 5); ctx.fillRect(-5, -41, 3, 6);
    ctx.fillStyle = '#ff5a4f'; ctx.fillRect(2, -38, 2, 2);
    ctx.fillStyle = '#a8322d'; if (c) ctx.fillRect(-9, -48, 18, 4); else ctx.fillRect(-2, -50, 4, 7);
    ctx.restore();
  }

  function drawEagle(en) {
    const x = Math.round(en.x - L.cam), y = Math.round(en.y);
    if (x < -60 || x > VW + 60) return;
    if (en.hurt > 0 && Math.floor(en.hurt * 20) % 2) return;
    const flap = en.state === 'swoop' ? -0.6 : Math.sin(en.anim * 12);
    ctx.save(); ctx.translate(x + en.w / 2, y + en.h / 2); ctx.scale(en.face, 1);
    ctx.fillStyle = '#2a1f1a';
    ctx.beginPath(); ctx.moveTo(-4, -2); ctx.lineTo(-22, -4 - flap * 14); ctx.lineTo(-10, 4); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(4, -2); ctx.lineTo(18, -6 - flap * 14); ctx.lineTo(8, 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3d2c22'; ctx.beginPath(); ctx.ellipse(0, 2, 13, 6, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#e8e2d4'; ctx.fillRect(9, -4, 7, 6);
    ctx.fillStyle = '#e7c46a'; ctx.fillRect(16, -2, 5, 3);
    ctx.fillStyle = '#ff5a4f'; ctx.fillRect(12, -3, 2, 2);
    ctx.fillStyle = '#2a1f1a'; ctx.fillRect(-16, 2, 6, 3);
    ctx.restore();
  }

  function drawBoss(b) {
    if (b.dead) return;
    const x = Math.round(b.x - L.cam), y = Math.round(b.y);
    ctx.save();
    ctx.shadowColor = '#b9a6ff'; ctx.shadowBlur = 24 + Math.sin(L.t * 8) * 8;
    ctx.translate(x + b.w / 2, y + b.h); ctx.scale(b.face, 1);
    if (b.hurt > 0 && Math.floor(b.hurt * 20) % 2) ctx.globalAlpha = 0.4;
    const ph = Math.sin(b.anim * 6);
    ctx.fillStyle = '#3b1f5a'; ctx.beginPath(); ctx.moveTo(-14, -60); ctx.lineTo(-34, -4 + ph * 4); ctx.lineTo(-4, -8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#16131f'; ctx.fillRect(-14 + ph * 3, -24, 9, 22); ctx.fillRect(5 - ph * 3, -24, 9, 22);
    ctx.fillStyle = '#2a1840'; ctx.fillRect(-18, -34, 36, 12);
    ctx.fillStyle = '#1e1a2c'; ctx.fillRect(-18, -62, 36, 30);
    ctx.fillStyle = '#b9a6ff'; ctx.fillRect(-14, -54, 28, 3); ctx.fillRect(-2, -62, 4, 26);
    ctx.fillStyle = '#c9946a'; ctx.fillRect(-8, -80, 18, 16);
    ctx.fillStyle = '#0e0c16'; ctx.fillRect(-10, -86, 22, 9); ctx.fillRect(-10, -80, 5, 12);
    ctx.fillStyle = '#b9a6ff'; ctx.fillRect(5, -76, 4, 3);
    ctx.fillStyle = '#6b2fa8'; ctx.fillRect(-14, -94, 28, 6);
    ctx.fillStyle = '#5a4a3a'; ctx.fillRect(18, -92, 4, 88);
    ctx.fillStyle = '#e8eef5'; ctx.fillRect(16, -100, 8, 10);
    ctx.strokeStyle = '#8fe6d2'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(20, -100); for (let i = 0; i < 5; i++) ctx.lineTo(20 + rand(-8, 8), -104 - i * 6); ctx.stroke();
    ctx.restore();
  }

  function drawItems(list = L.items, withFlag = true) {
    list.forEach((it) => {
      const x = it.x - L.cam, y = it.y; if (x < -40 || x > VW + 40) return;
      if (it.type === 'coin') {
        const s = Math.abs(Math.sin(L.t * 4 + it.x)); ctx.fillStyle = '#c9a227'; ctx.beginPath(); ctx.ellipse(x + 8, y + 10, 8 * s + 1, 10, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#f0d07a'; ctx.beginPath(); ctx.ellipse(x + 8, y + 10, 5 * s, 7, 0, 0, 7); ctx.fill();
      } else if (it.type === 'scroll') {
        const bob = Math.sin(L.t * 3 + it.x) * 4;
        ctx.save(); ctx.shadowColor = '#e7c46a'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#efe2c0'; ctx.fillRect(x + 2, y + 6 + bob, 20, 16); ctx.fillStyle = '#8a6b3a'; ctx.fillRect(x, y + 3 + bob, 24, 5); ctx.fillRect(x, y + 20 + bob, 24, 5);
        ctx.fillStyle = '#6b4a2a'; for (let i = 0; i < 3; i++) ctx.fillRect(x + 6, y + 10 + i * 4 + bob, 12, 1);
        ctx.restore();
      } else if (it.type === 'heart') drawHeart(x + 12, y + 12, 10, '#ff5a6a');
      else if (it.type === 'laurel') {
        ctx.save(); ctx.shadowColor = '#8fe6d2'; ctx.shadowBlur = 16; ctx.strokeStyle = '#5bbf4a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x + 12, y + 14, 10, 0.4, Math.PI * 2 - 0.4 + Math.PI - Math.PI); ctx.stroke();
        ctx.fillStyle = '#7fe066'; for (let i = 0; i < 7; i++) { const a = 0.6 + i * 0.75; ctx.beginPath(); ctx.ellipse(x + 12 + Math.cos(a) * 10, y + 14 + Math.sin(a) * 10, 4, 2, a, 0, 7); ctx.fill(); }
        ctx.restore();
      } else if (it.type === 'check') {
        ctx.fillStyle = '#6b5a3a'; ctx.fillRect(x + 6, y, 4, it.h);
        ctx.fillStyle = it.on ? '#c9a227' : '#5a5a6a'; ctx.beginPath(); ctx.moveTo(x + 10, y + 2); ctx.lineTo(x + 34, y + 10); ctx.lineTo(x + 10, y + 20); ctx.closePath(); ctx.fill();
        if (it.on) { ctx.fillStyle = 'rgba(143,230,210,0.25)'; ctx.beginPath(); ctx.arc(x + 8, y + it.h, 20, Math.PI, 0); ctx.fill(); }
      }
    });
    // finish: the golden eagle standard (aquila)
    if (withFlag && L.flag && !L.flag.hidden) {
      const f = L.flag, x = f.x - L.cam; if (x > -60 && x < VW + 60) {
        ctx.fillStyle = '#8a6b3a'; ctx.fillRect(x + 12, f.y + 20, 5, f.h - 20);
        ctx.save(); ctx.shadowColor = '#e7c46a'; ctx.shadowBlur = 20 + Math.sin(L.t * 4) * 6;
        ctx.fillStyle = '#e7c46a'; ctx.beginPath(); ctx.moveTo(x + 14, f.y + 4); ctx.lineTo(x - 6, f.y - 6); ctx.lineTo(x + 6, f.y + 14); ctx.lineTo(x + 14, f.y + 20); ctx.lineTo(x + 22, f.y + 14); ctx.lineTo(x + 34, f.y - 6); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#a8322d'; ctx.fillRect(x + 2, f.y + 30, 26, 30); ctx.fillStyle = '#e7c46a'; ctx.font = '700 8px "Space Mono", monospace'; ctx.fillText('SPQR', x + 5, f.y + 49);
        ctx.restore();
      }
    }
  }

  function drawHeart(x, y, s, c) {
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x, y + s * 0.9);
    ctx.bezierCurveTo(x - s * 1.4, y - s * 0.2, x - s * 0.6, y - s * 1.2, x, y - s * 0.4);
    ctx.bezierCurveTo(x + s * 0.6, y - s * 1.2, x + s * 1.4, y - s * 0.2, x, y + s * 0.9); ctx.fill();
    ctx.strokeStyle = '#2b1d10'; ctx.lineWidth = 1.4; ctx.stroke();
  }

  const ROMAN = ['I', 'II', 'III'];
  function drawHud() {
    // a parchment strip with the gold double rule from the books
    ctx.fillStyle = '#efe6cf'; ctx.fillRect(0, 0, VW, 40); ctx.fillStyle = ctx.createPattern(grain, 'repeat'); ctx.fillRect(0, 0, VW, 40);
    ctx.fillStyle = '#a8842a'; ctx.fillRect(0, 40, VW, 1.5); ctx.fillRect(0, 43, VW, 1);
    for (let i = 0; i < S.maxHp; i++) drawHeart(22 + i * 26, 20, 9, i < Math.max(0, P.hp) ? '#b8322d' : '#d8ccb0');
    ctx.textBaseline = 'middle'; ctx.font = '700 19px "Cormorant Garamond", Georgia, serif';
    ctx.fillStyle = '#c9a227'; ctx.beginPath(); ctx.arc(172, 20, 8, 0, 7); ctx.fill(); ctx.strokeStyle = '#2b1d10'; ctx.lineWidth = 1.3; ctx.stroke();
    ctx.fillStyle = '#2b1d10'; ctx.fillText('× ' + S.coins, 186, 21);
    ctx.fillStyle = '#f6eed8'; ctx.fillRect(262, 13, 16, 14); ctx.strokeRect(262, 13, 16, 14); ctx.fillStyle = '#2b1d10'; ctx.fillText(`${S.scrolls.size} of 9 scrolls`, 286, 21);
    ctx.textAlign = 'right'; ctx.font = 'italic 600 19px "Cormorant Garamond", Georgia, serif'; ctx.fillText(`Chapter ${ROMAN[S.level]} · ${L.def.name}`, VW - 14, 21); ctx.textAlign = 'left';
    if (L.boss && L.bossOn && !L.boss.dead) {
      ctx.fillStyle = 'rgba(239,230,207,0.95)'; ctx.fillRect(VW / 2 - 165, 52, 330, 30); ctx.strokeStyle = '#a8842a'; ctx.lineWidth = 1.5; ctx.strokeRect(VW / 2 - 165, 52, 330, 30);
      ctx.fillStyle = '#d8ccb0'; ctx.fillRect(VW / 2 - 155, 70, 310, 7); ctx.fillStyle = '#6b2fa8'; ctx.fillRect(VW / 2 - 155, 70, 310 * (L.boss.hp / L.boss.maxHp), 7); ctx.strokeStyle = '#2b1d10'; ctx.lineWidth = 1; ctx.strokeRect(VW / 2 - 155, 70, 310, 7);
      ctx.fillStyle = '#2b1d10'; ctx.font = '700 13px "Cormorant Garamond", Georgia, serif'; ctx.textAlign = 'center'; ctx.fillText('CHAOS, THE STORM LEGATE', VW / 2, 61); ctx.textAlign = 'left';
    }
    if (L.toast) {
      // styled like the "Philosophical Reflection" boxes in the books
      const a = Math.min(1, L.toast.life * 2, (5 - L.toast.life) * 4);
      ctx.globalAlpha = a; const w = 660, x = (VW - w) / 2, y = 92, h = 84;
      ctx.fillStyle = '#f3ead2'; ctx.fillRect(x, y, w, h); ctx.fillStyle = ctx.createPattern(grain, 'repeat'); ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#a8842a'; ctx.lineWidth = 1.5; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); ctx.lineWidth = 1; ctx.strokeRect(x + 5, y + 5, w - 10, h - 10);
      ctx.textAlign = 'center'; ctx.fillStyle = '#8a6a1e'; ctx.font = '700 11px "Cormorant Garamond", Georgia, serif';
      ctx.fillText(L.toast.cite === 'Boss' || L.toast.cite === 'Reach the standard' ? '✦  ' + L.toast.cite.toUpperCase() + '  ✦' : '✦  PHILOSOPHICAL REFLECTION  ✦', VW / 2, y + 18);
      ctx.fillStyle = '#2b1d10'; ctx.font = 'italic 500 21px "Cormorant Garamond", Georgia, serif';
      wrap('“' + L.toast.text + '”', VW / 2, y + 44, w - 50, 22);
      if (L.toast.cite !== 'Boss' && L.toast.cite !== 'Reach the standard') { ctx.fillStyle = '#8a6a1e'; ctx.font = '600 12px "Cormorant Garamond", Georgia, serif'; ctx.fillText('— ' + L.toast.cite, VW / 2, y + h - 12); }
      ctx.textAlign = 'left'; ctx.globalAlpha = 1;
    }
    ctx.textBaseline = 'alphabetic';
  }
  function wrap(text, x, y, maxW, lh) {
    const words = text.split(' '); let line = ''; const lines = [];
    words.forEach((w) => { const test = line ? line + ' ' + w : w; if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test; });
    lines.push(line); if (lines.length > 1) y -= lh * 0.4;
    lines.slice(0, 2).forEach((l, i) => ctx.fillText(l, x, y + i * lh));
  }

  function render() {
    ctx.save();
    if (L.shake && !reduceMotion) ctx.translate(rand(-6, 6) * L.shake * 2, rand(-6, 6) * L.shake * 2);
    const th = L.def.theme;
    drawBackground(th);
    if (L.notes.length) drawNotes();
    drawTiles(th);
    drawFields();
    L.items.forEach((it) => { const x = it.x - L.cam; if (x < -60 || x > VW + 60) return; inked(x - 6, it.y - 8, it.w + 40, it.h + 16, () => drawItems([it], false)); });
    if (L.flag && !L.flag.hidden) { const fx = L.flag.x - L.cam; if (fx > -80 && fx < VW + 80) inked(fx - 14, L.flag.y - 16, 64, L.flag.h + 20, () => drawItems([], true)); }
    L.enemies.forEach((en) => {
      if (en.dead) return; const sx = en.x - L.cam; if (sx < -120 || sx > VW + 120) return;
      if (en.type === 'eagle') inked(sx - 14, en.y - 18, en.w + 28, en.h + 34, () => drawEagle(en));
      else if (en.type === 'boss') inked(sx - 80, en.y - 90, en.w + 160, en.h + 120, () => drawBoss(en));
      else inked(sx - 18, en.y - 18, en.w + 36, en.h + 22, () => drawSoldier(en));
    });
    L.orbs.forEach((o) => { const x = o.x - L.cam; ctx.save(); ctx.shadowColor = '#b9a6ff'; ctx.shadowBlur = 16; ctx.fillStyle = '#d9ccff'; ctx.beginPath(); ctx.arc(x, o.y, 8 + Math.sin(L.t * 20) * 2, 0, 7); ctx.fill(); ctx.strokeStyle = '#2b1d10'; ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore(); });
    if (!P.dead) { const px = P.x - L.cam; inked(px - 40, P.y - 20, P.w + 92, P.h + 24, () => drawMarcus(px, P.y, P.face, P)); }
    L.parts.forEach((p) => {
      if (p.coinPop) { ctx.fillStyle = '#f0d07a'; ctx.beginPath(); ctx.ellipse(p.x - L.cam + 8, p.y, 6 * Math.abs(Math.sin(p.life * 20)) + 1, 9, 0, 0, 7); ctx.fill(); ctx.strokeStyle = '#2b1d10'; ctx.lineWidth = 1; ctx.stroke(); return; }
      ctx.globalAlpha = clamp(p.life * 2, 0, 1); ctx.fillStyle = th === 0 && p.c === '#fff' ? '#2b1d10' : p.c; ctx.fillRect(p.x - L.cam, p.y, p.r, p.r);
    });
    ctx.globalAlpha = 1;
    ctx.font = '700 17px "Cormorant Garamond", Georgia, serif';
    L.texts.forEach((x) => { ctx.globalAlpha = clamp(x.life * 1.5, 0, 1); ctx.fillStyle = th === 0 ? '#f3ead2' : '#05070d'; ctx.fillText(x.s, x.x - L.cam + 1, x.y + 1); ctx.fillStyle = th === 0 ? '#5a3a10' : x.c; ctx.fillText(x.s, x.x - L.cam, x.y); });
    ctx.globalAlpha = 1;
    if (P.dead) { ctx.fillStyle = `rgba(43,29,16,${clamp(1.2 - P.dead, 0, 0.55)})`; ctx.fillRect(0, 0, VW, VH); }
    ctx.restore();
    drawHud();
  }

  /* ================= flow ================= */
  const ov = { box: $('#overlay'), kicker: $('#ov-kicker'), title: $('#ov-title'), text: $('#ov-text'), go: $('#ov-go') };
  let ovNext = null;
  function overlay(kicker, title, text, label, next, art) {
    S.mode = 'overlay'; ovNext = next;
    const im = $('#ov-img'); if (art) { im.src = art; im.hidden = false; } else im.hidden = true;
    ov.kicker.textContent = kicker; ov.title.textContent = title; ov.text.textContent = text; ov.go.textContent = label;
    ov.box.hidden = false; setTimeout(() => ov.go.focus({ preventScroll: true }), 30);
    Object.keys(keys).forEach((k) => { keys[k] = false; });
  }
  ov.go.addEventListener('click', () => { SFX.ensure(); ov.box.hidden = true; S.mode = 'play'; const n = ovNext; ovNext = null; if (n) n(); last = performance.now(); });

  function togglePause() {
    if (S.mode === 'play') overlay('Paused', 'Breathe', '“Receive without arrogance; let go without struggle.” Take a moment, then continue.', 'Resume', null);
    else if (S.mode === 'overlay' && ov.title.textContent === 'Breathe') ov.go.click();
  }
  $('#pause').addEventListener('click', () => { if (S) togglePause(); });
  const soundBtn = $('#sound'); const syncSound = () => { soundBtn.textContent = 'Sound: ' + (SFX.on ? 'on' : 'off'); };
  soundBtn.addEventListener('click', () => { SFX.ensure(); SFX.toggle(); syncSound(); }); syncSound();
  document.addEventListener('visibilitychange', () => { if (document.hidden && S && S.mode === 'play') togglePause(); });

  function levelComplete() {
    if (S.mode !== 'play') return;
    SFX.win(); S.score += 300;
    const n = S.level, found = [...S.scrolls].filter((i) => Math.floor(i / 3) === n).length;
    if (n + 1 < LEVELS.length) overlay(`Chapter ${['I', 'II', 'III'][n]} complete`, LEVELS[n].name, `Coins: ${L.levelCoins} · Foes defeated: ${L.levelKills} · Scrolls found here: ${found} of 3${L.levelDeaths ? ' · Falls: ' + L.levelDeaths : ''}`, `On to ${LEVELS[n + 1].name}`, () => loadLevel(n + 1, true));
    else finish();
  }

  function finish() {
    S.mode = 'done';
    const sc = S.scrolls.size;
    const rank = sc === 9 && S.deaths <= 3 ? 'Philosopher-King' : sc >= 7 ? 'Stoic Champion' : sc >= 4 ? 'Legionary of Virtue' : 'Student of the Stoa';
    S.score += Math.max(0, 2000 - S.deaths * 150);
    $('#s-game').hidden = true; $('#s-final').hidden = false;
    $('#final-rank').textContent = rank;
    $('#final-line').textContent = sc === 9 ? 'You recovered every scroll of the Meditations. Chaos is defeated and the empire can think clearly again.' : `Chaos is defeated, but ${9 - sc} scroll${9 - sc === 1 ? ' is' : 's are'} still out there. Play again to find them all.`;
    const st = $('#final-stats'); st.replaceChildren();
    const mins = Math.floor(S.time / 60), secs = Math.floor(S.time % 60);
    [['Score', S.score.toLocaleString('en-US')], ['Scrolls recovered', `${sc} of 9`], ['Coins', String(S.coins)], ['Foes defeated', String(S.kills)], ['Falls', String(S.deaths)], ['Time', `${mins}:${String(secs).padStart(2, '0')}`]]
      .forEach(([k, v]) => { const li = document.createElement('li'); const b = document.createElement('b'); b.textContent = v; li.append(k + ': ', b); st.append(li); });
    const best = store.get('aq-best');
    if (!best || S.score > best.score) store.set('aq-best', { score: S.score, rank });
    showBest(); window.scrollTo({ top: 0 });
  }

  function showBest() { const b = store.get('aq-best'), e = $('#best'); if (b && b.rank) { e.hidden = false; e.textContent = `Your best: ${b.score.toLocaleString('en-US')} points · ${b.rank}`; } }

  /* ================= main loop ================= */
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(1 / 30, (now - last) / 1000); last = now;
    if (S && L && !$('#s-game').hidden) {
      if (S.mode === 'play') { const steps = 2; for (let i = 0; i < steps; i++) update(dt / steps); }
      render();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  $('#start').addEventListener('click', () => { SFX.ensure(); newRun(); });
  $('#again').addEventListener('click', () => { SFX.ensure(); newRun(); });
  showBest();
})();
