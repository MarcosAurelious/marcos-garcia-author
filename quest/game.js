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
  const rnd = (n) => Math.floor(Math.random() * n);
  const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const store = { get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } } };
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const img = (src) => { const i = new Image(); i.src = src; return i; };
  const ART = { sketch: img('img/bg-sketch.webp'), lab: img('img/bg-lab.webp'), cosmos: img('img/bg-cosmos.webp') };
  const ATLAS = {"warrior":{"idle":[[0,0,38,56,20,56],[40,0,42,56,21,56],[84,0,39,55,20,55]],"walk":[[125,0,38,50,19,50],[165,0,35,48,18,48],[202,0,37,48,17,48],[241,0,55,48,27,48]],"run":[[298,0,40,49,20,49],[340,0,41,48,20,48],[383,0,39,50,18,50],[424,0,37,48,17,48]],"jump":[[463,0,45,56,22,56],[510,0,38,55,18,55],[550,0,32,51,14,51],[584,0,35,49,17,49]],"attack":[[621,0,42,63,19,63],[665,0,37,64,13,64],[704,0,47,52,26,52],[753,0,46,47,17,47]],"hurt":[[801,0,37,64,18,64],[840,0,33,52,16,52],[875,0,35,51,17,51]],"die":[[912,0,42,46,22,46],[956,0,57,32,28,32],[0,66,52,29,26,29]]},"archer":{"idle":[[54,66,46,52,21,52],[102,66,38,51,15,51],[142,66,40,51,16,51]],"walk":[[184,66,43,48,19,48],[229,66,32,48,13,48],[263,66,35,50,16,50]],"run":[[300,66,46,48,20,48],[348,66,38,48,16,48],[388,66,41,48,20,48]],"jump":[[431,66,45,53,20,53],[478,66,38,49,14,49],[518,66,29,52,13,52]],"attack":[[549,66,48,50,16,50],[599,66,37,53,13,53],[638,66,44,51,14,51]],"hurt":[[684,66,48,51,21,51],[734,66,41,48,16,48],[777,66,35,52,12,52]],"die":[[814,66,48,38,26,38],[864,66,44,24,22,24],[910,66,40,27,19,27]]},"knight":{"idle":[[952,66,34,54,16,54],[988,66,34,53,15,53],[0,122,31,53,14,53]],"walk":[[33,122,34,49,15,49],[69,122,32,49,15,49],[103,122,36,48,18,48]],"run":[[141,122,39,50,17,50],[182,122,37,49,18,49],[221,122,35,50,16,50]],"jump":[[258,122,32,52,14,52],[292,122,34,50,17,50],[328,122,28,50,11,50]],"attack":[[358,122,42,64,20,64],[402,122,20,56,12,56],[424,122,36,59,12,59],[462,122,44,57,27,57]],"hurt":[[508,122,32,50,15,50],[542,122,34,48,16,48],[578,122,48,48,18,48]],"die":[[628,122,38,41,18,41],[668,122,42,29,19,29],[712,122,43,26,19,26]]},"commander":{"idle":[[757,122,72,104,37,104],[831,122,72,105,35,105],[905,122,67,100,36,100]],"walk":[[0,229,62,93,30,93],[64,229,68,93,32,93],[134,229,66,93,33,93]],"run":[[202,229,79,93,39,93],[283,229,79,91,36,91],[364,229,81,93,40,93]],"jump":[[447,229,74,100,29,100],[523,229,85,98,36,98],[610,229,70,100,34,100]],"attack":[[682,229,84,113,44,113],[768,229,86,115,37,115],[856,229,115,118,62,118]],"hurt":[[0,349,82,109,45,109],[84,349,70,88,34,88],[156,349,67,103,31,103]],"die":[[225,349,85,86,44,86],[312,349,85,79,40,79],[399,349,84,53,40,53]]},"priestess":{"idle":[[485,349,59,60,24,60],[546,349,49,59,24,59]],"walk":[[597,349,56,55,23,55],[655,349,50,54,24,54]],"run":[[707,349,54,56,25,56],[763,349,52,54,24,54]],"jump":[[817,349,55,62,24,62],[874,349,56,59,25,59]],"attack":[[932,349,40,69,23,69],[0,460,58,71,24,71]],"hurt":[[60,460,55,58,27,58],[117,460,73,61,38,61]],"die":[[192,460,67,43,32,43],[261,460,67,56,34,56]]},"companion":{"idle":[[330,460,21,30,10,30],[353,460,22,30,11,30],[377,460,22,32,11,32]],"walk":[[401,460,20,31,9,31],[423,460,20,28,10,28],[445,460,20,30,10,30],[467,460,19,29,9,29]],"run":[[488,460,29,33,11,33],[519,460,23,32,12,32],[544,460,22,32,11,32]],"jump":[[568,460,23,32,10,32],[593,460,24,35,11,35],[619,460,22,31,10,31]],"attack":[[643,460,35,37,23,37],[680,460,29,34,15,34],[711,460,32,40,18,40]],"hurt":[[745,460,27,33,14,33],[774,460,28,32,14,32],[804,460,27,33,14,33]],"die":[[833,460,22,31,9,31]]},"fx":{"slash":[[857,460,35,48,17,24]],"heal":[[894,460,73,70,36,35]],"swirl":[[0,533,79,40,39,20]],"comet":[[81,533,63,26,31,13]],"sun":[[146,533,28,34,14,17]],"star":[[176,533,27,28,13,14]],"dust":[[205,533,27,28,13,14]]},"eagle":{"fly":[[234,533,41,41,18,20],[277,533,38,39,16,19]],"dive":[[317,533,32,44,14,22],[351,533,42,44,20,22],[395,533,48,49,25,24],[445,533,43,53,21,26]],"glide":[[490,533,53,34,25,17],[545,533,41,29,20,14],[588,533,47,31,23,15]],"hurt":[[637,533,33,27,15,13],[672,533,38,34,22,17]],"die":[[712,533,46,33,20,16],[760,533,47,25,19,12]]},"coil":{"idle":[[809,533,58,91,29,91],[869,533,61,90,32,90],[932,533,63,95,30,95]],"beam":[[0,630,59,93,29,93],[61,630,57,91,28,91],[120,630,233,90,27,90]],"arc":[[355,630,64,99,34,99],[421,630,64,99,32,99],[487,630,108,99,41,99]],"hurt":[[597,630,57,98,28,98],[656,630,56,91,28,91],[714,630,46,96,25,96]],"die":[[762,630,59,90,30,90],[823,630,85,104,37,104]]},"boss":{"idle":[[0,0,122,110,63,110],[124,0,104,106,54,106],[230,0,125,108,65,108],[357,0,116,107,58,107]],"walk":[[475,0,110,96,58,96],[587,0,65,96,30,96],[654,0,74,96,35,96],[730,0,74,96,31,96]],"run":[[806,0,95,96,48,96],[903,0,75,96,31,96],[0,112,99,96,44,96]],"slam":[[101,112,178,95,51,95]],"blast":[[281,112,264,98,43,98]],"summon":[[547,112,187,98,52,98]],"thunder":[[736,112,191,108,59,108]],"shield":[[0,222,154,108,42,108]],"hurt":[[156,222,122,110,56,110]],"die":[[280,222,144,112,46,112]]},"bfx":{"spear":[[426,222,80,48,40,24]],"orb":[[508,222,33,35,16,17]],"drone":[[543,222,33,27,16,13]],"bolt":[[578,222,60,103,30,51]],"ring":[[640,222,121,107,60,53]],"burst":[[763,222,72,66,36,33]],"smoke":[[837,222,71,68,35,34]]}};
  /* ================= sprites (Marcos Garcia's character sheets) ================= */
  const SPR = img('img/sprites.webp'), BOSSIMG = img('img/boss.webp'), ENEMYIMG = img('img/enemies.webp');
  const EATLAS = {"minotaur":{"idle":[[0,0,57,70,29,70],[59,0,53,69,25,69]],"move":[[114,0,69,65,33,65],[185,0,85,67,34,67]],"gore":[[272,0,84,56,38,56],[358,0,107,64,23,64]],"slam":[[467,0,182,68,42,68]]},"medusa":{"idle":[[651,0,40,66,24,66],[693,0,40,66,24,66]],"move":[[735,0,40,64,21,64],[777,0,42,64,23,64],[821,0,37,64,21,64]],"gaze":[[860,0,84,67,40,67]],"serp":[[946,0,37,61,22,61]]},"chiron":{"idle":[[0,72,52,70,20,70],[54,72,59,69,26,69]],"move":[[115,72,43,70,22,70],[160,72,69,69,31,69],[231,72,49,68,19,68]],"shoot":[[282,72,60,66,22,66]]},"chariot":{"idle":[[344,72,123,66,68,33]],"move":[[469,72,143,74,79,37]],"beam":[[614,72,95,55,52,27]]},"leviathan":{"idle":[[711,72,166,92,83,92]],"emerge":[[0,166,186,116,93,116]],"tent":[[188,166,241,102,121,102]],"cannon":[[431,166,219,99,109,99]]},"colossus":{"idle":[[652,166,106,100,50,100],[760,166,103,100,54,100],[865,166,118,100,58,100]],"slam":[[0,284,114,108,59,108],[116,284,97,108,56,108],[215,284,174,108,47,108]],"throw":[[391,284,86,91,45,91],[479,284,200,98,63,98]]},"techno":{"idle":[[681,284,75,64,42,64],[758,284,60,64,23,64],[820,284,63,64,19,64]],"gaze":[[885,284,46,65,17,65],[0,394,96,68,33,68]],"sum":[[98,394,39,57,15,57],[139,394,115,60,21,60],[256,394,54,57,26,57]]},"engine":{"idle":[[312,394,117,104,64,104],[431,394,119,101,62,101],[552,394,112,97,64,97]],"charge":[[666,394,139,99,68,99],[807,394,124,112,62,112],[0,508,119,121,49,121]],"sweep":[[121,508,126,96,50,96],[249,508,163,112,92,112],[414,508,101,94,48,94]]},"pegasus":{"idle":[[517,508,87,52,44,26],[606,508,61,60,30,30],[669,508,53,56,26,28]],"dive":[[724,508,72,62,36,31],[798,508,68,75,34,37],[868,508,80,76,40,38]],"sonic":[[0,631,77,60,38,30],[79,631,46,61,23,30]]},"helios":{"idle":[[127,631,63,54,31,27],[192,631,76,62,38,31],[270,631,50,60,25,30]],"orbs":[[322,631,71,60,36,30],[395,631,86,69,43,34],[483,631,51,61,26,30]],"laser":[[536,631,40,47,20,23],[578,631,71,63,36,31],[651,631,100,70,50,35]]},"efx":{"serpent":[[753,631,38,17,19,8]],"star":[[793,631,89,16,44,8]],"flare":[[884,631,51,43,25,21]],"rock":[[937,631,38,32,19,16]],"ring":[[0,703,58,38,29,19]],"sunorb":[[60,703,70,32,35,16]],"water":[[132,703,98,41,49,20]],"beam":[[232,703,87,28,43,14]]}};
  Object.assign(ATLAS, EATLAS);
  const imgFor = (set) => (set === 'boss' || set === 'bfx' ? BOSSIMG : EATLAS[set] ? ENEMYIMG : SPR);
  // spr: draw one frame with its anchor (feet, or centre for effects) at screen x,y. clip limits how far right of the anchor is drawn.
  function spr(set, anim, i, sx, sy, face = 1, scale = 1, alpha = 1, clip = 0) {
    const fr = ATLAS[set] && ATLAS[set][anim]; if (!fr) return;
    const im = imgFor(set); if (!im.complete || !im.naturalWidth) return;
    const [x, y, w0, h, ax, ay] = fr[((Math.floor(i) % fr.length) + fr.length) % fr.length];
    const w = clip ? Math.min(w0, ax + clip) : w0;
    ctx.save(); if (alpha !== 1) ctx.globalAlpha *= alpha; ctx.translate(Math.round(sx), Math.round(sy)); if (face < 0) ctx.scale(-1, 1);
    ctx.drawImage(im, x, y, w, h, -ax * scale, -ay * scale, w * scale, h * scale); ctx.restore();
  }
  const frames = (set, anim) => (ATLAS[set] && ATLAS[set][anim] ? ATLAS[set][anim].length : 1);


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
      field(x, y0, y1) { L.fields.push({ x, y0, y1, period: 2.9, on: 1.5, phase: (x * 0.61) % 2.9 }); },
    };
    return L;
  }

  const LEVELS = [
    { name: 'The Sketchbook Frontier', theme: 0, intro: 'Rome, drawn in graphite beneath a spiral galaxy. The Shadow Legion has torn the first scrolls from the Meditations, and the Minotaur Engine guards the end of the road.', art: 'img/bust-sketch.webp', build() {
      const L = builder(150);
      L.ground(0, 24); L.ent('start', 2, 11);
      L.note(4.2, 4.2, 'Golden SPQR block:\nstrike it from below', 9.5, 8.2); L.note(14.5, 6.5, 'Soldier of the Shadow Legion:\nthe sword, or a firm stomp', 19.6, 10.4);
      L.note(34, 2.3, 'A lost scroll of\nthe Meditations', 39.4, 5);
      L.note(58.5, 2.2, 'Eagle: it swoops when\nyou pass beneath', 63, 5.2); L.note(70.5, 5, 'Tesla coil: wait\nuntil it sleeps', 68.5, 8.5);
      L.coins(6, 10, 3); L.box(9, 8, 'coin'); L.set(10, 8, 'B'); L.box(11, 8, 'heart'); L.set(12, 8, 'B'); L.coins(10, 6, 2);
      L.ent('soldier', 19, 11);
      L.ground(28, 50);
      L.plat(31, 9, 4); L.coins(31, 8, 4); L.ent('archer', 34, 8);
      L.ent('soldier', 36, 11); L.plat(38, 6, 3); L.ent('scroll', 39, 5, { i: 0 }); L.ent('soldier', 43, 11);
      L.stairs(46, 4); L.col(50, 8, 11);
      L.ground(55, 82); L.ent('check', 57, 11);
      L.ent('eagle', 63, 5); L.coins(60, 10, 3); L.ent('pegasus', 52, 6);
      L.field(68, 8, 11); L.coins(70, 10, 3);
      L.ent('soldier', 75, 11); L.box(78, 8, 'laurel'); L.set(77, 8, 'B'); L.set(79, 8, 'B');
      L.ground(86, 150);
      L.plat(90, 9, 3); L.plat(94, 6, 3); L.ent('scroll', 95, 5, { i: 1 }); L.coins(90, 8, 3);
      L.ent('soldier', 93, 11); L.ent('minotaur', 99, 11); L.ent('eagle', 101, 4); L.ent('archer', 104, 11); L.ent('pegasus', 116, 5);
      L.field(108, 8, 11); L.coins(110, 10, 2); L.field(113, 8, 11);
      L.ent('soldier', 118, 11); L.col(121, 10, 11); L.col(122, 10, 11); L.ent('scroll', 122, 8, { i: 2 });
      L.ent('eagle', 127, 4); L.ent('minotaur', 129, 11);
      L.ent('check', 132, 11);
      L.ent('engine', 142, 11);
      L.ent('flag', 146, 11, { hidden: true });
      return L;
    } },
    { name: 'The Weird Science Laboratory', theme: 1, intro: 'Ball lightning, copper coils and Faraday cages. Shadow archers guard the ledges, and at the far end the Dark Commander waits with his spear.', art: 'img/plate-lightning.webp', build() {
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
      L.ent('centurion', 62, 11); L.ent('eagle', 65, 4); L.box(68, 8, 'heart'); L.ent('helios', 59, 6); L.ent('medusa', 67, 11);
      L.ground(75, 79);
      L.ground(84, 110);
      L.plat(86, 8, 4); L.plat(92, 5, 3); L.ent('scroll', 93, 4, { i: 4 }); L.coins(86, 7, 4);
      L.ent('archer', 87, 7); L.ent('soldier', 89, 11); L.ent('centurion', 98, 11); L.ent('eagle', 102, 3);
      L.field(105, 8, 11); L.ent('eagle', 108, 5); L.ent('medusa', 109, 11);
      L.ground(115, 170); L.ent('check', 116, 11);
      L.col(122, 9, 11); L.col(123, 9, 11); L.ent('helios', 126, 6);
      L.field(128, 8, 11); L.ent('centurion', 132, 11); L.field(136, 8, 11);
      L.plat(140, 8, 3); L.ent('scroll', 141, 7, { i: 5 }); L.box(144, 8, 'laurel');
      L.ent('eagle', 147, 3); L.ent('archer', 150, 11); L.ent('helios', 145, 5);
      L.ent('commander', 161, 11);
      L.ent('flag', 166, 11, { hidden: true });
      return L;
    } },
    { name: 'The Cosmic Forum', theme: 2, intro: 'At the edge of the cosmos stands the Roman Automaton, a forgotten machine of the empire awakened by forbidden power. Recover the last scrolls and face it with a steady mind.', art: 'img/bg-cosmos.webp', build() {
      const L = builder(196);
      L.ground(0, 14); L.ent('start', 2, 11);
      L.ground(18, 22); L.ground(26, 45);
      L.field(30, 8, 11); L.ent('eagle', 34, 4); L.coins(32, 10, 3); L.field(37, 8, 11);
      L.plat(40, 8, 3); L.ent('scroll', 41, 7, { i: 6 });
      L.plat(47, 9, 2, 'B');
      L.ground(51, 75); L.ent('check', 52, 11);
      L.ent('techno', 57, 11); L.ent('eagle', 60, 3); L.ent('chiron', 63, 11);
      L.field(66, 7, 11); L.field(70, 7, 11); L.box(73, 8, 'heart');
      L.ground(79, 84, 10); L.coins(80, 9, 3);
      L.ground(89, 93, 11); L.ent('leviathan', 95, 11); L.ent('chariot', 112, 3);
      L.ground(98, 126);
      L.plat(101, 8, 3); L.plat(105, 5, 3); L.ent('scroll', 106, 4, { i: 7 });
      L.ent('archer', 102, 7); L.ent('eagle', 110, 3); L.ent('archer', 113, 11); L.ent('eagle', 117, 5); L.ent('colossus', 121, 11);
      L.field(124, 8, 11);
      L.ground(131, 196); L.ent('check', 132, 11);
      L.field(137, 8, 11); L.field(140, 8, 11); L.field(143, 8, 11);
      L.plat(148, 8, 3); L.ent('scroll', 149, 7, { i: 8 }); L.box(153, 8, 'laurel'); L.ent('chariot', 150, 3); L.ent('chiron', 156, 11);
      L.col(160, 11, 11);
      L.ent('boss', 180, 11);
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
    L = { def, w: B.w, g: B.g.map((r) => r.slice()), q: Object.assign({}, B.q), fields: B.fields, notes: B.notes, items: [], enemies: [], parts: [], texts: [], orbs: [], bumps: [], corpses: [], arrows: [], drones: [], waves: [], strikes: [], shots: [], zones: [],
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
      else if (e.type === 'pegasus') L.enemies.push({ type: 'pegasus', x, y, w: 40, h: 30, hx: x, hy: y, vx: 0, vy: 0, hp: 2, face: -1, state: 'patrol', st: 0, anim: Math.random() * 6, hurt: 0, shot: rand(1.5, 3) });
      else if (e.type === 'minotaur') L.enemies.push({ type: 'minotaur', x, y: (e.ty + 1) * T - 56, w: 40, h: 56, vx: 0, vy: 0, hp: 3, face: -1, hurt: 0, onGround: false, anim: 0, state: 'walk', st: 1 });
      else if (e.type === 'medusa' || e.type === 'techno') L.enemies.push({ type: e.type, x: x + 2, y: (e.ty + 1) * T - 52, w: 28, h: 52, vx: 0, vy: 0, hp: 2, face: -1, hurt: 0, onGround: false, anim: 0, state: 'idle', st: rand(1, 2), n: 0 });
      else if (e.type === 'helios') L.enemies.push({ type: 'helios', x: x - 6, y, w: 44, h: 44, hy: y, vx: 0, vy: 0, hp: 3, face: -1, hurt: 0, anim: 0, shot: rand(1.5, 2.6), state: 'idle', st: 0, fly: true });
      else if (e.type === 'chiron') L.enemies.push({ type: 'chiron', x, y: (e.ty + 1) * T - 56, w: 36, h: 56, vx: 0, vy: 0, hp: 2, face: -1, hurt: 0, onGround: false, anim: 0, shot: rand(1, 2), draw: 0 });
      else if (e.type === 'chariot') L.enemies.push({ type: 'chariot', x, y: 110, w: 100, h: 44, hx: x, vx: 0, vy: 0, hp: 3, face: -1, hurt: 0, anim: 0, state: 'wait', drop: 0.5, fly: true });
      else if (e.type === 'colossus') L.enemies.push({ type: 'colossus', x, y: (e.ty + 1) * T - 84, w: 50, h: 84, vx: 0, vy: 0, hp: 4, face: -1, hurt: 0, onGround: false, anim: 0, state: 'walk', st: 2 });
      else if (e.type === 'leviathan') L.enemies.push({ type: 'leviathan', x: x + T - 45, y: 12 * T - 70, w: 90, h: 70, vx: 0, vy: 0, hp: 3, face: -1, hurt: 0, anim: 0, state: 'sub', st: 1.5, ghost: true, fly: true, pit: [x / T - 1, x / T + 2] });
      else if (e.type === 'engine') { L.boss = { type: 'engine', big: true, title: 'THE MINOTAUR ENGINE', x, y: (e.ty + 1) * T - 90, w: 60, h: 90, vx: 0, vy: 0, hp: 7, maxHp: 7, face: -1, hurt: 0, onGround: false, anim: 0, awake: false, state: 'walk', st: 1.2, minX: 133 * T }; L.enemies.push(L.boss); }
      else if (e.type === 'archer') L.enemies.push({ type: 'archer', x: x + 4, y: (e.ty + 1) * T - 38, w: 24, h: 38, vx: 0, vy: 0, hp: 1, face: -1, hurt: 0, onGround: false, anim: Math.random() * 6, shot: rand(1, 2.4), draw: 0 });
      else if (e.type === 'commander') { L.boss = { type: 'commander', big: true, title: 'THE DARK COMMANDER', x, y: (e.ty + 1) * T - 86, w: 40, h: 86, vx: 0, vy: 0, hp: 6, maxHp: 6, face: -1, hurt: 0, onGround: false, anim: 0, awake: false, state: 'walk', st: 1, cd: 1.4, minX: 151 * T }; L.enemies.push(L.boss); }
      else if (e.type === 'boss') { L.boss = { type: 'boss', big: true, title: 'THE ROMAN AUTOMATON', x, y: (e.ty + 1) * T - 100, w: 56, h: 100, vx: 0, vy: 0, hp: 14, maxHp: 14, face: -1, hurt: 0, onGround: false, anim: 0, awake: false, state: 'walk', st: 1.5, phase: 1, count: 0, shieldCd: 4, shield: 0, minX: 162 * T }; L.enemies.push(L.boss); }
    });
    L.check = { x: L.start.x, y: L.start.y };
    spawnPlayer();
    C = { x: P.x - 20, y: P.y - 30, anim: 0, cast: 0 };
    S.mode = 'play';
    if (showIntro) overlay(`Chapter ${['I', 'II', 'III'][n]}`, def.name, def.intro, 'Begin the chapter', () => {}, def.art);
  }

  let P = null, C = null;   // Marcus, and his Cosmic Companion
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
  const CORPSE = { soldier: 'knight', centurion: 'knight', archer: 'archer', eagle: 'eagle', commander: 'commander', boss: 'boss', pegasus: 'pegasus', minotaur: 'minotaur', medusa: 'medusa', techno: 'techno', helios: 'helios', chiron: 'chiron', chariot: 'chariot', colossus: 'colossus', leviathan: 'leviathan', engine: 'engine' };
  function damage(en, amount, dir) {
    if (en.hurt > 0 || en.dead || en.ghost) return false;
    if (en.shield > 0) { SFX.bump(); burst(en.x + en.w / 2, en.y + 30, ['#8fe6d2', '#fff'], 8, 160); float(en.x, en.y - 8, 'Shielded!', '#8fe6d2'); P.vx = (P.x < en.x ? -1 : 1) * 280; return false; }
    en.hp -= amount; en.hurt = en.big ? 0.45 : 0.25;
    if (dir && !en.big) en.vx = dir * 160;
    if (en.hp <= 0) {
      en.dead = true; S.kills += 1; L.levelKills += 1;
      L.corpses.push({ set: CORPSE[en.type], x: en.x + en.w / 2, y: en.type === 'eagle' ? en.y + en.h / 2 : en.y + en.h, face: en.face, t: 0, vy: 0, eagle: en.type === 'eagle' || en.type === 'pegasus' || en.type === 'chariot' || en.type === 'helios', big: en.big, scale: en.type === 'centurion' ? 1.12 : 1 });
      burst(en.x + en.w / 2, en.y + en.h / 2, ['#ffd27a', '#c9a227', '#8fe6d2', '#fff'], en.big ? 70 : 18, en.big ? 320 : 200);
      const pts = en.type === 'boss' ? 1000 : en.big ? 500 : ['colossus', 'chariot', 'leviathan', 'minotaur'].includes(en.type) ? 150 : 50;
      float(en.x, en.y - 6, '+' + pts, '#e7c46a'); S.score += pts;
      if (en.big) {
        SFX.win(); L.shake = 0.6; if (L.flag) L.flag.hidden = false;
        L.drones = []; L.waves = []; L.strikes = []; L.orbs = [];
        toast(en.type === 'boss' ? 'The Roman Automaton falls silent. The last road home is open.' : en.type === 'engine' ? 'The Minotaur Engine grinds to a halt. The eagle standard is yours.' : 'The Dark Commander yields. The eagle standard is yours.', 'Reach the standard'); L.shots = []; L.zones = [];
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
    if (P.stone > 0) { P.stone -= dt; jumpPressed = false; attackPressed = false; }
    const dir = P.stone > 0 ? 0 : (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
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
      L.orbs.forEach((o) => { if (overlap(hb, { x: o.x - 10, y: o.y - 10, w: 20, h: 20 })) { o.dead = true; burst(o.x, o.y, ['#b9a6ff', '#fff'], 10, 150); } });
      L.shots.forEach((o) => { if (o.breakable && overlap(hb, { x: o.x - o.r, y: o.y - o.r, w: o.r * 2, h: o.r * 2 })) { o.dead = true; burst(o.x, o.y, ['#e7c46a', '#fff'], 8, 140); } });
      L.arrows.forEach((a) => { if (overlap(hb, { x: a.x - 12, y: a.y - 3, w: 24, h: 6 })) { a.dead = true; burst(a.x, a.y, ['#c9a227', '#fff'], 6, 120); } });
      L.drones.forEach((d) => { if (!d.dead && overlap(hb, { x: d.x - 13, y: d.y - 13, w: 26, h: 26 })) { d.dead = true; SFX.hit(); burst(d.x, d.y, ['#57b6ff', '#fff', '#c9a227'], 14, 180); S.score += 25; } });
    }

    // items
    L.items.forEach((it) => {
      if (it.taken || it.rise > 0) return;
      if (it.type === 'coin' && !P.dead) { const dx = P.x + P.w / 2 - (it.x + 8), dy = P.y + 16 - (it.y + 10), d = Math.hypot(dx, dy); if (d < 120) { const v = Math.min(d, 460 * dt); it.x += dx / (d || 1) * v; it.y += dy / (d || 1) * v; C.cast = Math.max(C.cast, 0.25); } }
      if (!overlap(P, it)) return;
      if (it.type === 'coin') { it.taken = true; S.coins += 1; L.levelCoins += 1; S.score += 10; SFX.coin(); burst(it.x + 8, it.y + 10, ['#e7c46a', '#fff'], 6, 90); }
      else if (it.type === 'heart') { it.taken = true; P.hp = Math.min(S.maxHp, P.hp + 1); SFX.power(); float(it.x, it.y, '+1 heart', '#ff9b8a'); }
      else if (it.type === 'laurel') { it.taken = true; S.maxHp = Math.min(5, S.maxHp + 1); P.hp = S.maxHp; P.glow = 1.6; SFX.power(); float(it.x - 10, it.y, 'Laurel of Virtue: +1 max heart', '#8fe6d2'); }
      else if (it.type === 'scroll') { it.taken = true; S.scrolls.add(it.i); S.score += 500; SFX.scroll(); burst(it.x + 12, it.y + 12, ['#e7c46a', '#fff6e0', '#8fe6d2'], 26, 200); toast(SCROLLS[it.i][0], SCROLLS[it.i][1]); C.cast = 0.8; }
      else if (it.type === 'check' && !it.on) { it.on = true; it.cast = 1.2; L.check = { x: it.x - 2, y: it.y + 26 }; P.hp = S.maxHp; P.healFx = 0.9; SFX.power(); float(it.x - 46, it.y - 14, 'The Sun Priestess heals you', '#e7c46a'); }
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
      if (en.type === 'archer') {
        const dx = P.x + P.w / 2 - (en.x + en.w / 2);
        en.vy = Math.min(MAXFALL, en.vy + GRAV * dt); moveY(en, en.vy * dt);
        if (Math.abs(dx) < 520 && !P.dead) {
          en.face = Math.sign(dx) || -1; en.shot -= dt; en.draw = en.shot < 0.5 ? 1 : 0;
          if (en.shot <= 0) { en.shot = rand(2.1, 2.9); SFX.slash(); L.arrows.push({ x: en.x + en.w / 2 + en.face * 18, y: en.y + 17, vx: en.face * 330, life: 3 }); }
        } else en.draw = 0;
      } else if (en.type === 'commander') updateCommander(en, dt);
      else if (NEW_AI[en.type]) NEW_AI[en.type](en, dt);
      else if (en.type === 'soldier' || en.type === 'centurion') {
        const speed = en.type === 'centurion' ? 70 : 55;
        if (en.hurt <= 0) en.vx = en.face * speed;
        en.vy = Math.min(MAXFALL, en.vy + GRAV * dt);
        moveX(en, en.vx * dt); moveY(en, en.vy * dt);
        if (en.hitWall) en.face *= -1;
        if (en.onGround) { const ax = Math.floor((en.face > 0 ? en.x + en.w + 2 : en.x - 2) / T), ay = Math.floor((en.y + en.h + 4) / T); const c = tileAt(ax, ay); if (!SOLID.includes(c) && c !== '=') en.face *= -1; }
        if (en.y > ROWS * T + 60) en.dead = true;
      } else if (en.type === 'eagle' || en.type === 'pegasus') {
        if (en.type === 'pegasus') { en.shot -= dt; if (en.state === 'patrol' && en.shot <= 0 && Math.abs(P.x - en.x) < 440 && !P.dead) { en.shot = rand(2.4, 3.4); en.cast = 0.4; const dx = P.x + P.w / 2 - en.x - en.w / 2, dy = P.y + 16 - en.y - en.h / 2, d = Math.hypot(dx, dy) || 1; L.shots.push({ x: en.x + en.w / 2, y: en.y + en.h / 2, vx: dx / d * 230, vy: dy / d * 230, r: 10, life: 4, set: 'efx', anim: 'ring', scale: 0.55, breakable: true }); SFX.zap(); } if (en.cast > 0) en.cast -= dt; }
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
        if (en.ghost) return;
        const stomp = P.vy > 60 && P.y + P.h - en.y < (en.big ? 22 : 16) && !(en.shield > 0);
        if (stomp) { if (damage(en, 1, 0)) { P.vy = -520; SFX.stomp(); S.score += 0; } else P.vy = -420; }
        else hurtPlayer(en.x + en.w / 2);
      }
    });
    L.enemies = L.enemies.filter((en) => !en.dead || en === L.boss);

    // arrows, drones, shockwaves, lightning strikes
    L.arrows.forEach((a) => { a.x += a.vx * dt; a.life -= dt; if (!P.dead && overlap(P, { x: a.x - 10, y: a.y - 3, w: 20, h: 6 })) { a.dead = true; hurtPlayer(a.x); } if (solid(Math.floor(a.x / T), Math.floor(a.y / T))) a.dead = true; });
    L.arrows = L.arrows.filter((a) => !a.dead && a.life > 0);
    L.drones.forEach((d) => {
      d.t += dt; d.life -= dt; const tx = P.x + P.w / 2, ty = P.y + 10; const dx = tx - d.x, dy = ty - d.y, dd = Math.hypot(dx, dy) || 1;
      if (d.t < 0.6) d.y -= 90 * dt; else { d.x += dx / dd * d.speed * dt; d.y += (dy / dd * d.speed + Math.sin(d.t * 5) * 30) * dt; }
      if (!P.dead && overlap(P, { x: d.x - 11, y: d.y - 11, w: 22, h: 22 })) { d.dead = true; hurtPlayer(d.x); burst(d.x, d.y, ['#57b6ff', '#fff'], 10, 150); }
    });
    L.drones = L.drones.filter((d) => !d.dead && d.life > 0);
    L.waves.forEach((w) => { w.x += w.vx * dt; w.life -= dt; if (!P.dead && overlap(P, { x: w.x - 13, y: w.y - 28, w: 26, h: 28 })) hurtPlayer(w.x); if (solid(Math.floor((w.x + Math.sign(w.vx) * 14) / T), Math.floor((w.y - 8) / T))) w.life = 0; });
    L.waves = L.waves.filter((w) => w.life > 0);
    L.strikes.forEach((k) => { k.t -= dt; if (k.t <= 0 && !k.hit) { k.hit = true; SFX.zap(); L.shake = Math.max(L.shake, 0.15); burst(k.x, k.y, ['#8fe6d2', '#fff', '#57b6ff'], 14, 200); }
      if (k.t <= 0 && k.t > -0.3 && !P.dead && overlap(P, { x: k.x - 16, y: 0, w: 32, h: k.y })) hurtPlayer(k.x); });
    L.strikes = L.strikes.filter((k) => k.t > -0.35);
    L.shots.forEach((o) => {
      o.vy += (o.g || 0) * dt; o.x += o.vx * dt; o.y += o.vy * dt; o.life -= dt;
      if (!P.dead && overlap(P, { x: o.x - o.r, y: o.y - o.r, w: o.r * 2, h: o.r * 2 })) { o.dead = true; hurtPlayer(o.x); }
      if (solid(Math.floor(o.x / T), Math.floor(o.y / T)) || o.y > 12 * T - 2 && o.g) { o.dead = true; if (o.boom) { burst(o.x, o.y, o.boom, 14, 200); L.zones.push({ x: o.x - 22, y: o.y - 26, w: 44, h: 28, t: 0.18 }); } }
    });
    L.shots = L.shots.filter((o) => !o.dead && o.life > 0);
    L.zones.forEach((z) => { if (z.delay > 0) { z.delay -= dt; return; } z.t -= dt; if (!P.dead && overlap(P, z)) { if (z.stone) { if (!(P.stone > 0) && P.inv <= 0) { P.stone = 1.3; P.inv = 1.6; SFX.bump(); float(P.x - 20, P.y - 16, 'Turned to stone!', '#c9c2b0'); } } else hurtPlayer(z.x + z.w / 2); } });
    L.zones = L.zones.filter((z) => z.t > 0);
    // spear swirls (Dark Commander)
    L.orbs.forEach((o) => { o.x += o.vx * dt; o.life -= dt; if (!P.dead && overlap(P, { x: o.x - 9, y: o.y - 9, w: 18, h: 18 })) { o.dead = true; hurtPlayer(o.x); } if (solid(Math.floor(o.x / T), Math.floor(o.y / T))) o.dead = true; });
    L.orbs = L.orbs.filter((o) => !o.dead && o.life > 0);
    L.corpses.forEach((c) => { c.t += dt; if (c.eagle) { c.vy += 900 * dt; c.y = Math.min(c.y + c.vy * dt, 12 * T - 6); } });
    L.corpses = L.corpses.filter((c) => c.t < (c.big ? 4 : 1.4));
  }

  /* ---------- the new adversaries ---------- */
  const groundStep = (en, dt) => { en.vy = Math.min(MAXFALL, en.vy + GRAV * dt); moveX(en, en.vx * dt); moveY(en, en.vy * dt);
    if (en.hitWall) en.face *= -1;
    if (en.onGround && en.vx) { const ax = Math.floor((en.face > 0 ? en.x + en.w + 2 : en.x - 2) / T), ay = Math.floor((en.y + en.h + 4) / T); const c = tileAt(ax, ay); if (!SOLID.includes(c) && c !== '=') { en.face *= -1; en.vx = 0; if (en.state === 'charge') { en.state = 'rest'; en.st = 0.8; } } }
    if (en.y > ROWS * T + 60) en.dead = true; };
  const near = (en, r) => !P.dead && Math.abs(P.x + P.w / 2 - en.x - en.w / 2) < r && Math.abs(P.y + P.h - en.y - en.h) < 90;
  const NEW_AI = {
    minotaur(en, dt) {
      en.anim += dt; en.st -= dt; const dx = P.x + P.w / 2 - en.x - en.w / 2;
      if (en.state === 'walk') { en.vx = en.hurt > 0 ? 0 : en.face * 45; if (en.st <= 0 && near(en, 330)) { en.face = Math.sign(dx) || -1; en.state = 'wind'; en.st = 0.55; en.vx = 0; } }
      else if (en.state === 'wind') { en.vx = 0; if (en.st <= 0) { en.state = 'charge'; en.st = 0.9; SFX.boss(); } }
      else if (en.state === 'charge') { en.vx = en.face * 360; if (Math.random() < 0.3) burst(en.x + en.w / 2 - en.face * 20, en.y + en.h, ['#c9b48c'], 1, 60); if (en.st <= 0) { en.state = 'rest'; en.st = 0.9; } }
      else { en.vx = 0; if (en.st <= 0) { en.state = 'walk'; en.st = 1.2; } }
      groundStep(en, dt);
    },
    engine(en, dt) {
      if (!wake(en, 'The Minotaur Engine, beast of muscle and machine. Leap its charge, and strike while it turns.')) return;
      en.anim += dt; en.st -= dt; const dx = P.x + P.w / 2 - en.x - en.w / 2, fast = en.hp <= 3 ? 1.4 : 1;
      if (en.state === 'walk') { en.face = Math.sign(dx) || -1; en.vx = en.hurt > 0.2 ? 0 : en.face * 55 * fast;
        if (en.st <= 0) { if (Math.abs(dx) < 110) { en.state = 'sweepWind'; en.st = 0.45 / fast; } else { en.state = 'wind'; en.st = 0.6 / fast; } en.vx = 0; } }
      else if (en.state === 'wind') { en.vx = 0; if (en.st <= 0) { en.state = 'charge'; en.st = 1.1; SFX.boss(); } }
      else if (en.state === 'charge') { en.vx = en.face * 380 * fast; if (en.hitWall || en.st <= 0 || (en.face < 0 && en.x <= en.minX + 2) || (en.face > 0 && en.x >= (L.w - 4) * T - 2)) { en.state = 'rest'; en.st = 0.9 / fast; en.vx = 0; L.shake = 0.3;
          if (fast > 1) [-1, 1].forEach((d) => L.waves.push({ x: en.x + en.w / 2 + d * 30, y: en.y + en.h, vx: d * 320, life: 1.3 })); } }
      else if (en.state === 'sweepWind') { if (en.st <= 0) { en.state = 'sweep'; en.st = 0.35; SFX.slash(); } }
      else if (en.state === 'sweep') { const hb = { x: en.face > 0 ? en.x + en.w - 10 : en.x - 80, y: en.y + 20, w: 90, h: 70 }; if (!P.dead && overlap(P, hb)) hurtPlayer(en.x + en.w / 2); if (en.st <= 0) { en.state = 'rest'; en.st = 0.8 / fast; } }
      else { en.vx = 0; if (en.st <= 0) { en.state = 'walk'; en.st = rand(0.8, 1.4); } }
      en.vy = Math.min(MAXFALL, en.vy + GRAV * dt); moveX(en, en.vx * dt); moveY(en, en.vy * dt); en.x = clamp(en.x, en.minX, (L.w - 4) * T);
    },
    medusa(en, dt) {
      en.anim += dt; en.st -= dt; en.vx = 0; const dx = P.x + P.w / 2 - en.x - en.w / 2; en.vy = Math.min(MAXFALL, en.vy + GRAV * dt); moveY(en, en.vy * dt);
      if (en.state === 'idle') { if (near(en, 420)) en.face = Math.sign(dx) || -1;
        if (en.st <= 0 && near(en, 380)) { en.n++; if (en.n % 2) { en.state = 'gazeWind'; en.st = 0.7; } else { en.state = 'serp'; en.st = 0.9; en.spawned = 0; } } }
      else if (en.state === 'gazeWind') { if (en.st <= 0) { en.state = 'gaze'; en.st = 0.7; SFX.zap();
          const len = en.type === 'techno' ? 170 : 140, feet = en.y + en.h; L.zones.push({ x: en.face > 0 ? en.x + en.w : en.x - len, y: feet - 56, w: len, h: 46, t: 0.7, stone: true }); } }
      else if (en.state === 'gaze') { if (en.st <= 0) { en.state = 'idle'; en.st = rand(1.6, 2.4); } }
      else if (en.state === 'serp') { const want = 3 - Math.ceil(en.st / 0.3); while (en.spawned < want && en.spawned < 3) { en.spawned++; L.shots.push({ x: en.x + en.w / 2 + en.face * 20, y: en.y + en.h - 12, vx: en.face * 190, vy: 0, r: 9, life: 3.5, set: en.type === 'techno' ? 'efx' : 'efx', anim: 'serpent', scale: 0.9, breakable: true, face: en.face }); }
        if (en.st <= 0) { en.state = 'idle'; en.st = rand(1.6, 2.4); } }
    },
    helios(en, dt) {
      en.anim += dt; en.y = en.hy + Math.sin(en.anim * 1.6) * 8; en.shot -= dt; en.st -= dt;
      const px = P.x + P.w / 2, cx = en.x + en.w / 2;
      if (en.state === 'idle') {
        if (en.shot <= 0 && Math.abs(px - cx) < 460 && !P.dead) { en.shot = rand(2.6, 3.4); en.state = 'orbs'; en.st = 0.5;
          const dy0 = P.y + 16 - en.y - en.h / 2, a0 = Math.atan2(dy0, px - cx); [-0.32, 0, 0.32].forEach((da) => L.shots.push({ x: cx, y: en.y + en.h / 2, vx: Math.cos(a0 + da) * 170, vy: Math.sin(a0 + da) * 170, r: 9, life: 4.5, set: 'efx', anim: 'sunorb', scale: 0.45, breakable: true })); SFX.zap(); }
        else if (Math.abs(px - cx) < 50 && P.y > en.y && en.st <= -1.5) { en.state = 'laserWind'; en.st = 0.55; }
      } else if (en.state === 'orbs') { if (en.st <= 0) en.state = 'idle'; }
      else if (en.state === 'laserWind') { if (en.st <= 0) { en.state = 'laser'; en.st = 0.6; SFX.zap(); L.zones.push({ x: cx - 18, y: en.y + en.h, w: 36, h: 12 * T - en.y - en.h, t: 0.6 }); } }
      else if (en.state === 'laser') { if (en.st <= 0) { en.state = 'idle'; en.st = 0; } }
    },
    chiron(en, dt) {
      en.anim += dt; en.vx = 0; en.vy = Math.min(MAXFALL, en.vy + GRAV * dt); moveY(en, en.vy * dt);
      const dx = P.x + P.w / 2 - en.x - en.w / 2;
      if (near(en, 560)) { en.face = Math.sign(dx) || -1; en.shot -= dt; en.draw = en.shot < 0.45 ? 1 : 0;
        if (en.shot <= 0) { en.shot = rand(1.7, 2.4); SFX.slash(); L.shots.push({ x: en.x + en.w / 2 + en.face * 26, y: en.y + en.h - 24, vx: en.face * 430, vy: 0, r: 8, life: 2.5, set: 'efx', anim: 'star', scale: 0.7, breakable: true, face: en.face }); } } else en.draw = 0;
    },
    chariot(en, dt) {
      en.anim += dt; en.y = 110 + Math.sin(en.anim * 2) * 10;
      if (en.state === 'wait') { if (P.x > en.hx - 640) { en.state = 'pass'; en.face = -1; } return; }
      en.x += en.face * 170 * dt; en.drop -= dt;
      const cx = en.x + en.w / 2, px = P.x + P.w / 2;
      if (en.drop <= 0 && Math.abs(cx - px) < 150 && !P.dead) { en.drop = 0.75; L.shots.push({ x: cx, y: en.y + 30, vx: en.face * 40, vy: 30, g: 520, r: 10, life: 4, set: 'efx', anim: 'flare', scale: 0.32, boom: ['#ffd27a', '#ff9a3d', '#fff'] }); SFX.zap(); }
      if (en.face < 0 && cx < px - 620) en.face = 1; else if (en.face > 0 && cx > px + 620) en.face = -1;
    },
    colossus(en, dt) {
      en.anim += dt; en.st -= dt; const dx = P.x + P.w / 2 - en.x - en.w / 2;
      if (en.state === 'walk') { if (near(en, 500)) en.face = Math.sign(dx) || -1; en.vx = en.hurt > 0 ? 0 : en.face * 32;
        if (en.st <= 0 && near(en, 480)) { if (Math.abs(dx) < 100) { en.state = 'slam'; en.st = 0.9; } else { en.state = 'throw'; en.st = 0.8; en.thrown = false; } en.vx = 0; } }
      else if (en.state === 'throw') { en.vx = 0; if (en.st < 0.35 && !en.thrown) { en.thrown = true; const t = 1.0, sx = en.x + en.w / 2 + en.face * 20, sy = en.y + 20;
          L.shots.push({ x: sx, y: sy, vx: (P.x + P.w / 2 - sx) / t, vy: (P.y + P.h - 10 - sy - 0.5 * 700 * t * t) / t, g: 700, r: 11, life: 3, set: 'efx', anim: 'rock', scale: 1.1, boom: ['#9a8a74', '#c9b48c', '#fff'] }); SFX.slash(); }
        if (en.st <= 0) { en.state = 'walk'; en.st = rand(1.8, 2.6); } }
      else if (en.state === 'slam') { en.vx = 0; if (en.st < 0.45 && !en.slammed) { en.slammed = true; L.shake = 0.3; SFX.boss(); burst(en.x + en.w / 2 + en.face * 40, en.y + en.h, ['#57b6ff', '#fff', '#9a8a74'], 18, 220);
          L.zones.push({ x: en.face > 0 ? en.x + en.w / 2 : en.x + en.w / 2 - 110, y: en.y + en.h - 40, w: 110, h: 40, t: 0.25 }); }
        if (en.st <= 0) { en.slammed = false; en.state = 'walk'; en.st = rand(1.6, 2.4); } }
      groundStep(en, dt);
    },
    leviathan(en, dt) {
      en.anim += dt; en.st -= dt; const cx = en.x + en.w / 2, dx = P.x + P.w / 2 - cx; en.face = Math.sign(dx) || 1;
      if (en.state === 'sub') { en.ghost = true; if (en.st <= 0 && Math.abs(dx) < 420) { en.state = 'emerge'; en.st = 0.6; SFX.boss(); burst(cx, 12 * T, ['#8fd8ff', '#fff'], 18, 220); } }
      else if (en.state === 'emerge') { en.ghost = false; if (en.st <= 0) { if (Math.abs(dx) < 110) { en.state = 'tent'; en.st = 1.0; L.zones.push({ x: cx - 85, y: 12 * T - 140, w: 170, h: 140, t: 0.75, delay: 0.25 }); } else { en.state = 'cannon'; en.st = 1.0; L.zones.push({ x: en.face > 0 ? cx + 30 : cx - 300, y: 12 * T - 34, w: 270, h: 26, t: 0.7, delay: 0.2 }); } SFX.zap(); } }
      else if (en.state === 'tent' || en.state === 'cannon') { if (en.st <= 0) { en.state = 'rest'; en.st = 1.4; } }
      else { if (en.st <= 0) { en.state = 'sub'; en.st = 2.2; } }
    },
  };
  NEW_AI.techno = NEW_AI.medusa;

  /* ---------- the Dark Commander (Chapter II) ---------- */
  function wake(b, text) { if (b.awake) return true; if (P.x > b.x - 470) { b.awake = true; L.bossOn = true; SFX.boss(); toast(text, 'Boss'); return true; } return false; }
  function updateCommander(b, dt) {
    if (!wake(b, 'The Dark Commander bars the way. Watch his spear, strike when he recovers, or land on his helmet.')) return;
    b.anim += dt; b.st -= dt;
    const dx = P.x + P.w / 2 - (b.x + b.w / 2), dist = Math.abs(dx), fast = b.hp <= 3 ? 1.5 : 1;
    if (b.state === 'walk') {
      b.face = Math.sign(dx) || -1; b.vx = b.hurt > 0 ? 0 : b.face * 70 * fast;
      if (b.st <= 0 && dist < 120) { b.state = 'wind'; b.st = 0.45 / fast; b.vx = 0; }
      else if (b.st <= 0 && fast > 1 && dist > 200) { b.state = 'throw'; b.st = 0.5; b.vx = 0; }
    } else if (b.state === 'wind') { if (b.st <= 0) { b.state = 'swing'; b.st = 0.32; SFX.slash(); } }
    else if (b.state === 'swing') {
      const hb = { x: b.face > 0 ? b.x + b.w - 6 : b.x - 80, y: b.y + 20, w: 86, h: 60 };
      if (!P.dead && overlap(P, hb)) hurtPlayer(b.x + b.w / 2);
      if (b.st <= 0) { b.state = 'rest'; b.st = 0.7 / fast; }
    } else if (b.state === 'throw') {
      if (b.st <= 0) { L.orbs.push({ x: b.x + b.w / 2 + b.face * 30, y: b.y + 40, vx: b.face * 260, life: 3.5, swirl: true, face: b.face }); SFX.zap(); b.state = 'rest'; b.st = 0.6; }
    } else if (b.state === 'rest') { b.vx = 0; if (b.st <= 0) { b.state = 'walk'; b.st = rand(0.6, 1.2); } }
    b.vy = Math.min(MAXFALL, b.vy + GRAV * dt); moveX(b, b.vx * dt); moveY(b, b.vy * dt);
    b.x = clamp(b.x, b.minX, (L.w - 3) * T);
  }

  /* ---------- the Roman Automaton (final boss): three phases ---------- */
  function updateBoss(b, dt) {
    if (b.dead) return;
    if (!wake(b, 'A forgotten machine of the empire, awakened by forbidden power. Strike when it pauses, and never panic.')) return;
    const ratio = b.hp / b.maxHp, ph = ratio > 0.5 ? 1 : ratio > 0.2 ? 2 : 3;
    if (ph !== b.phase) {
      b.phase = ph; L.shake = 0.5; SFX.boss();
      toast(ph === 2 ? 'Phase II: electricity floods its armor. Its attacks come faster now.' : 'Phase III: its core overloads. Stay calm; it is most dangerous, and most open, when it rages.', 'Boss');
    }
    const mul = [0, 1, 1.35, 1.8][ph], feet = b.y + b.h, cx = b.x + b.w / 2, dx = P.x + P.w / 2 - cx, dist = Math.abs(dx);
    b.anim += dt * mul; b.st -= dt; b.shieldCd -= dt; if (b.shield > 0) b.shield -= dt;
    const go = (state, t) => { b.state = state; b.st = t / mul; b.vx = 0; };
    switch (b.state) {
      case 'walk': {
        b.face = Math.sign(dx) || -1; b.vx = b.hurt > 0.2 ? 0 : b.face * (ph === 3 ? 115 : 60) * (ph === 2 ? 1.2 : 1);
        if (b.st > 0) break;
        b.count++;
        const opts = [];
        if (dist < 150) opts.push('slam', 'slam');
        if (ph === 1) opts.push('thrust'); else opts.push('blast', 'summon');
        if (ph === 3) opts.push('thunder', 'thunder');
        if (ph >= 2 && b.shieldCd <= 0 && b.count % 3 === 0) opts.unshift('shield');
        const pick = opts[0] === 'shield' ? 'shield' : opts[rnd(opts.length)];
        if (pick === 'slam') go('slamWind', 0.6);
        else if (pick === 'thrust') go('thrustWind', 0.45);
        else if (pick === 'blast') { go('blastWind', 0.9); b.aim = null; }
        else if (pick === 'summon') go('summon', 0.8);
        else if (pick === 'thunder') go('thunder', 1.1);
        else { b.state = 'shield'; b.st = 2.2; b.shield = 2.2; b.shieldCd = 9; b.vx = 0; SFX.power(); }
        break;
      }
      case 'slamWind': if (b.st <= 0) {
        go('slam', 0.5); SFX.boss(); L.shake = 0.35; burst(cx + b.face * 40, feet, ['#c9a227', '#8a6a4a', '#fff'], 16, 220);
        const hb = { x: b.face > 0 ? cx : cx - 110, y: feet - 70, w: 110, h: 70 }; if (!P.dead && overlap(P, hb)) hurtPlayer(cx);
        if (ph >= 2) [-1, 1].forEach((d) => L.waves.push({ x: cx + d * 30, y: feet, vx: d * (300 + ph * 40), life: 1.6 }));
      } break;
      case 'thrustWind': b.face = Math.sign(dx) || -1; if (b.st <= 0) { go('thrust', 0.4); b.vx = b.face * 420; SFX.slash(); } break;
      case 'thrust': b.vx = b.face * 420; if (b.st <= 0) go('rest', 0.8); break;
      case 'blastWind':
        b.face = Math.sign(dx) || -1;
        if (b.st < 0.3 / mul && !b.aim) { const hx = cx + b.face * 34, hy = feet - 62, tx = P.x + P.w / 2, ty = P.y + P.h / 2, d = Math.hypot(tx - hx, ty - hy) || 1; b.aim = { x1: hx, y1: hy, x2: hx + (tx - hx) / d * 620, y2: hy + (ty - hy) / d * 620 }; }
        if (b.st <= 0) { go('blast', 0.6); SFX.zap(); L.shake = 0.2; } break;
      case 'blast': {
        const a = b.aim, px = P.x + P.w / 2, py = P.y + P.h / 2, vx = a.x2 - a.x1, vy = a.y2 - a.y1, t = clamp(((px - a.x1) * vx + (py - a.y1) * vy) / (vx * vx + vy * vy), 0, 1);
        if (!P.dead && Math.hypot(px - (a.x1 + vx * t), py - (a.y1 + vy * t)) < 22) hurtPlayer(cx);
        if (b.st <= 0) { b.aim = null; go('rest', 0.7); } break;
      }
      case 'summon':
        if (b.st <= 0.4 / mul && !b.summoned) { b.summoned = true; SFX.power(); for (let i = 0; i < (ph === 3 ? 3 : 2) && L.drones.length < 5; i++) L.drones.push({ x: cx + b.face * (40 + i * 18), y: feet - 70 - i * 14, t: -i * 0.25, speed: 85 + ph * 20, life: 10, dead: false }); }
        if (b.st <= 0) { b.summoned = false; go('rest', 0.6); } break;
      case 'thunder':
        if (b.st <= 0.7 / mul && !b.called) { b.called = true; SFX.boss(); const px = P.x + P.w / 2; [-1, 0, 1, rnd(2) ? -2 : 2].forEach((k, i) => L.strikes.push({ x: px + k * 95, y: 12 * T, t: 0.85 + i * 0.12, hit: false })); }
        if (b.st <= 0) { b.called = false; go('rest', 0.5); } break;
      case 'shield': b.vx = 0; if (b.st <= 0) { b.shield = 0; go('rest', 0.4); } break;
      case 'slam': if (b.st <= 0) go('rest', 0.9); break;
      default: b.vx = 0; if (b.st <= 0) { b.state = 'walk'; b.st = rand(0.8, 1.5) / mul; }
    }
    b.vy = Math.min(MAXFALL, b.vy + GRAV * dt); moveX(b, b.vx * dt); moveY(b, b.vy * dt);
    b.x = clamp(b.x, b.minX, (L.w - 4) * T);
  }

  function update(dt) {
    L.t += dt; S.time += dt;
    updatePlayer(dt); updateEnemies(dt);
    if (C) { const tx = P.x + P.w / 2 - P.face * 30, ty = P.y - 14 + Math.sin(L.t * 3) * 5; C.vx = tx - C.x; C.x += (tx - C.x) * Math.min(1, dt * 4); C.y += (ty - C.y) * Math.min(1, dt * 4); C.anim += dt; C.cast -= dt; }
    if (P.healFx > 0) P.healFx -= dt;
    L.items.forEach((it) => { if (it.cast > 0) it.cast -= dt; });
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
    L.fields.forEach((f) => {
      const x = f.x * T - L.cam + 16; if (x < -80 || x > VW + 80) return;
      const top = f.y0 * T, ground = (f.y1 + 1) * T, coilTop = ground - 86;
      const on = fieldOn(f), warn = fieldWarn(f);
      spr('coil', on ? 'arc' : warn ? 'hurt' : 'idle', L.t * (on ? 12 : 5), x, ground + 2, 1, 1);
      if (on && coilTop > top) {
        ctx.save(); ctx.shadowColor = '#57b6ff'; ctx.shadowBlur = 16;
        [['#ffffff', 2], ['#8fd8ff', 3], ['#b9a6ff', 2]].forEach(([c, w], k) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.globalAlpha = k ? 0.75 : 1; ctx.beginPath(); ctx.moveTo(x, coilTop); for (let y = coilTop - 8; y >= top; y -= 8) ctx.lineTo(x + rand(-7, 7), y); ctx.stroke(); });
        ctx.restore(); ctx.globalAlpha = 1;
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

  /* ---------- characters ---------- */
  function drawMarcus() {
    const p = P, x = p.x + p.w / 2 - L.cam, y = p.y + p.h;
    let anim = 'idle', f = L.t * 3;
    if (p.dead) { anim = 'die'; f = Math.min(2, (1.2 - p.dead) * 5); }
    else if (p.inv > 1.0) { anim = 'hurt'; f = L.t * 10; }
    else if (p.atk > 0) { anim = 'attack'; f = Math.min(3, (1 - p.atk / 0.2) * 4); }
    else if (!p.onGround) { anim = 'jump'; f = p.vy < -250 ? 0 : p.vy < 0 ? 1 : p.vy < 300 ? 2 : 3; }
    else if (Math.abs(p.vx) > 150) { anim = 'run'; f = p.anim; }
    else if (Math.abs(p.vx) > 20) { anim = 'walk'; f = p.anim; }
    const blink = !p.dead && p.inv > 0 && p.inv <= 1.0 && Math.floor(p.inv * 14) % 2 ? 0.4 : 1;
    if (p.glow > 0) { ctx.save(); ctx.shadowColor = '#8fe6d2'; ctx.shadowBlur = 18; }
    if (p.stone > 0) { ctx.save(); ctx.filter = 'grayscale(1) brightness(0.85)'; spr('warrior', 'idle', 0, x, y + 1, p.face, 1, 1); ctx.restore(); }
    else spr('warrior', anim, f, x, y + 1, p.face, 1, blink);
    if (p.glow > 0) ctx.restore();
    if (p.atk > 0) { const k = 1 - p.atk / 0.2; spr('fx', 'slash', 0, x + p.face * 34, y - 22, p.face, 0.9, 1 - k * 0.7); }
    if (p.healFx > 0) spr('fx', 'heal', 0, x, y - 22, 1, 0.9, Math.min(1, p.healFx * 2));
  }
  function drawCompanion() {
    if (!C) return;
    const anim = P.dead ? 'hurt' : C.cast > 0 ? 'attack' : Math.abs(C.vx || 0) > 14 ? 'walk' : 'idle';
    spr('companion', anim, C.anim * 6, C.x - L.cam, C.y + 15, (C.vx || 0) < -2 ? -1 : 1);
  }
  function drawEnemy(en) {
    const x = en.x + en.w / 2 - L.cam, feet = en.y + en.h, blink = en.hurt > 0 && Math.floor(en.hurt * 20) % 2 ? 0.55 : 1;
    if (en.type === 'soldier' || en.type === 'centurion') {
      const sc = en.type === 'centurion' ? 1.12 : 1;
      if (en.type === 'centurion') { ctx.save(); ctx.shadowColor = '#c9a227'; ctx.shadowBlur = 8; }
      spr('knight', en.hurt > 0 ? 'hurt' : 'walk', en.anim * 6, x, feet + 1, en.face, sc, blink);
      if (en.type === 'centurion') ctx.restore();
    } else if (en.type === 'archer') {
      spr('archer', en.hurt > 0 ? 'hurt' : en.draw ? 'attack' : 'idle', en.draw ? (0.5 - en.shot) * 6 : en.anim * 3, x, feet + 1, en.face, 1, blink);
    } else if (en.type === 'eagle') {
      const anim = en.hurt > 0 ? 'hurt' : en.state === 'swoop' ? 'dive' : en.state === 'rise' ? 'fly' : 'glide';
      spr('eagle', anim, en.anim * 7, x, en.y + en.h / 2, en.face, 1, blink);
    } else if (en.type === 'commander') {
      const anim = en.hurt > 0.2 ? 'hurt' : en.state === 'wind' || en.state === 'throw' ? 'attack' : en.state === 'swing' ? 'attack' : en.state === 'rest' ? 'idle' : 'walk';
      const f = en.state === 'wind' || en.state === 'throw' ? 0 : en.state === 'swing' ? 1 + (en.st < 0.16 ? 1 : 0) : en.anim * 5;
      spr('commander', anim, f, x, feet + 1, en.face, 1, blink);
    } else if (en.type === 'boss') drawAutomaton(en, x, feet, blink);
    else drawNew(en, x, feet, blink);
  }
  function flashOn(cond) { return cond && Math.floor(L.t * 16) % 2; }
  function drawNew(en, x, feet, blink) {
    const t = en.type, st = en.state;
    if (t === 'pegasus') { spr('pegasus', en.state === 'swoop' ? 'dive' : en.cast > 0 ? 'sonic' : 'idle', en.anim * 7, x, en.y + en.h / 2, en.face, 1.05, blink); return; }
    if (t === 'minotaur' || t === 'engine') {
      const set = t, a = t === 'minotaur' ? (st === 'charge' ? 'gore' : st === 'wind' ? 'idle' : st === 'walk' && Math.abs(en.vx) > 1 ? 'move' : 'idle') : (st === 'charge' ? 'charge' : st === 'sweep' || st === 'sweepWind' ? 'sweep' : 'idle');
      const f = t === 'engine' && (st === 'sweep' || st === 'sweepWind') ? (st === 'sweepWind' ? 0 : 1 + (en.st < 0.18 ? 1 : 0)) : en.anim * (st === 'charge' ? 9 : 4);
      if (flashOn(st === 'wind' || st === 'sweepWind')) { ctx.save(); ctx.filter = 'brightness(1.6)'; spr(set, a, f, x, feet + 1, en.face, 1, blink); ctx.restore(); } else spr(set, a, f, x, feet + 1, en.face, 1, blink);
      return;
    }
    if (t === 'medusa' || t === 'techno') {
      const a = st === 'gaze' ? (t === 'medusa' ? 'gaze' : 'gaze') : st === 'serp' ? (t === 'medusa' ? 'serp' : 'sum') : 'idle';
      const f = st === 'gaze' && t === 'techno' ? 1 : st === 'serp' ? (0.9 - en.st) * 3 : en.anim * 3;
      if (flashOn(st === 'gazeWind')) { ctx.save(); ctx.shadowColor = '#e7c46a'; ctx.shadowBlur = 20; spr(t, 'idle', 0, x, feet + 1, en.face, 1, blink); ctx.restore(); }
      else spr(t, a, f, x, feet + 1, en.face, 1, blink);
      if (st === 'gaze' && t === 'medusa') { ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#e7c46a'; const z = 140; ctx.beginPath(); ctx.moveTo(x + en.face * 12, feet - 44); ctx.lineTo(x + en.face * z, feet - 60); ctx.lineTo(x + en.face * z, feet - 8); ctx.closePath(); ctx.fill(); ctx.restore(); }
      return;
    }
    if (t === 'helios') { const cx = x, cy = en.y + en.h / 2;
      if (st === 'laserWind' && Math.floor(L.t * 16) % 2) { ctx.save(); ctx.strokeStyle = 'rgba(255,200,90,0.7)'; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, 12 * T); ctx.stroke(); ctx.restore(); }
      if (st === 'laser') { ctx.save(); ctx.shadowColor = '#ffb347'; ctx.shadowBlur = 20; ctx.fillStyle = 'rgba(255,220,140,0.9)'; ctx.fillRect(cx - 7, cy, 14, 12 * T - cy); ctx.fillStyle = '#fff'; ctx.fillRect(cx - 2, cy, 4, 12 * T - cy); ctx.restore(); spr('helios', 'laser', 2, cx, 12 * T - 20, 1, 0.9); }
      spr('helios', st === 'orbs' ? 'orbs' : 'idle', en.anim * 4, cx, cy, 1, 1.05, blink); return; }
    if (t === 'chiron') { spr('chiron', en.hurt > 0 ? 'idle' : en.draw ? 'shoot' : 'idle', en.anim * 3, x, feet + 1, en.face, 1, blink); return; }
    if (t === 'chariot') { spr('chariot', 'move', 0, x, en.y + en.h / 2, en.face, 1, blink); return; }
    if (t === 'colossus') { const a = st === 'throw' ? 'throw' : st === 'slam' ? 'slam' : 'idle', f = st === 'throw' ? (en.st < 0.35 ? 1 : 0) : st === 'slam' ? (0.9 - en.st) * 3.4 : en.anim * 3; spr('colossus', a, f, x, feet + 1, en.face, 1, blink); return; }
    if (t === 'leviathan') { const a = st === 'sub' ? 'idle' : st === 'emerge' ? 'emerge' : st === 'tent' ? 'tent' : st === 'cannon' ? 'cannon' : 'emerge';
      const sink = st === 'sub' ? 36 : 0; ctx.save(); ctx.beginPath(); ctx.rect(x - 200, 0, 400, 12 * T + 14); ctx.clip(); spr('leviathan', a, 0, x, 12 * T + 18 + sink, en.face, 1, blink); ctx.restore(); return; }
  }
  function drawWater() {
    L.enemies.forEach((en) => { if (en.type !== 'leviathan' || !en.pit) return;
      const x0 = en.pit[0] * T - L.cam, w = (en.pit[1] - en.pit[0] + 1) * T, y = 12 * T + 8;
      ctx.fillStyle = 'rgba(40,110,160,0.85)'; ctx.fillRect(x0, y, w, VH - y); ctx.fillStyle = 'rgba(143,216,255,0.9)';
      for (let i = 0; i < w; i += 8) ctx.fillRect(x0 + i, y + Math.sin(L.t * 3 + i * 0.3) * 2, 6, 2); });
  }
  function drawAutomaton(b, x, feet, blink) {
    const st = b.state; let anim = 'idle', f = b.anim * 4, clip = 0;
    if (st === 'walk') { anim = b.phase === 3 ? 'run' : 'walk'; f = b.anim * (b.phase === 3 ? 8 : 5); }
    else if (st === 'slam') { anim = 'slam'; clip = 0; }
    else if (st === 'slamWind' || st === 'thrustWind') { anim = 'idle'; f = 0; }
    else if (st === 'thrust') { anim = 'run'; f = 1; }
    else if (st === 'blastWind' || st === 'blast') { anim = 'blast'; clip = 64; }
    else if (st === 'summon') { anim = 'summon'; clip = 70; }
    else if (st === 'thunder') { anim = 'thunder'; clip = 60; }
    else if (st === 'shield') anim = 'shield';
    if (b.hurt > 0.25 && st !== 'shield') { anim = 'hurt'; clip = 0; }
    if (b.phase >= 2) { ctx.save(); ctx.shadowColor = b.phase === 3 ? '#ff6a5a' : '#57b6ff'; ctx.shadowBlur = 14 + Math.sin(L.t * 12) * 6; }
    if ((st === 'slamWind' || st === 'thrustWind' || st === 'blastWind') && Math.floor(L.t * 16) % 2) { ctx.save(); ctx.filter = 'brightness(1.6)'; spr('boss', anim, f, x, feet + 1, b.face, 1, blink, clip); ctx.restore(); }
    else spr('boss', anim, f, x, feet + 1, b.face, 1, blink, clip);
    if (b.phase >= 2) ctx.restore();
    if (st === 'blastWind') { const k = 1 - b.st * 1.1; spr('bfx', 'orb', 0, x + b.face * 34, feet - 62, 1, 0.4 + Math.max(0, k) * 0.6); }
    if (st === 'blastWind' && b.aim) { ctx.save(); ctx.strokeStyle = 'rgba(255,90,70,0.8)'; ctx.setLineDash([6, 6]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(b.aim.x1 - L.cam, b.aim.y1); ctx.lineTo(b.aim.x2 - L.cam, b.aim.y2); ctx.stroke(); ctx.restore(); }
    if (st === 'blast' && b.aim) {
      const a = b.aim; ctx.save(); ctx.shadowColor = '#57b6ff'; ctx.shadowBlur = 22;
      [[14, 'rgba(87,182,255,0.45)'], [7, '#bfe6ff'], [3, '#ffffff']].forEach(([w, c]) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(a.x1 - L.cam, a.y1);
        const n = 14; for (let i = 1; i <= n; i++) { const t = i / n; ctx.lineTo(a.x1 + (a.x2 - a.x1) * t - L.cam + rand(-4, 4), a.y1 + (a.y2 - a.y1) * t + rand(-4, 4)); } ctx.stroke(); });
      ctx.restore(); spr('bfx', 'orb', 0, a.x1 - L.cam, a.y1, 1, 0.8);
    }
  }
  function drawHazards() {
    L.arrows.forEach((a) => { const x = a.x - L.cam, d = Math.sign(a.vx); ctx.strokeStyle = '#3a2716'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - d * 12, a.y); ctx.lineTo(x + d * 10, a.y); ctx.stroke();
      ctx.fillStyle = '#c9a227'; ctx.beginPath(); ctx.moveTo(x + d * 14, a.y); ctx.lineTo(x + d * 8, a.y - 3); ctx.lineTo(x + d * 8, a.y + 3); ctx.fill(); ctx.fillStyle = '#e8e2d4'; ctx.fillRect(x - d * 13 - 2, a.y - 3, 4, 6); });
    L.orbs.forEach((o) => { if (o.swirl) spr('fx', 'swirl', 0, o.x - L.cam, o.y, o.face, 0.75); });
    L.drones.forEach((d) => spr('bfx', 'drone', 0, d.x - L.cam, d.y + Math.sin(d.t * 8) * 2, 1, 0.85));
    L.waves.forEach((w) => { const x = w.x - L.cam; spr('bfx', 'burst', 0, x, w.y - 16, Math.sign(w.vx), 0.55 + 0.1 * Math.sin(L.t * 30)); });
    L.strikes.forEach((k) => {
      const x = k.x - L.cam;
      if (k.t > 0) { const a = 0.4 + 0.5 * Math.abs(Math.sin(k.t * 14)); ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#8fe6d2'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, k.y - 2, 22, 6, 0, 0, 7); ctx.stroke(); ctx.restore(); }
      else { ctx.save(); ctx.globalAlpha = Math.max(0, 1 + k.t * 3); spr('bfx', 'bolt', 0, x, k.y / 2, 1, 1, 1);
        ctx.strokeStyle = '#e8f6ff'; ctx.lineWidth = 3; ctx.shadowColor = '#57b6ff'; ctx.shadowBlur = 18; ctx.beginPath(); let yy = 40, xx = x; ctx.moveTo(xx, yy); while (yy < k.y) { yy += 18; xx = x + rand(-9, 9); ctx.lineTo(xx, yy); } ctx.stroke(); ctx.restore();
        spr('bfx', 'burst', 0, x, k.y - 18, 1, 0.6, Math.max(0, 1 + k.t * 3)); }
    });
    L.corpses.forEach((c) => {
      const hasDie = ATLAS[c.set] && ATLAS[c.set].die, n = frames(c.set, 'die'), f = Math.min(n - 1, c.t * 6), a = c.t > (c.big ? 3 : 0.8) ? Math.max(0, 1 - (c.t - (c.big ? 3 : 0.8)) * 1.6) : 1;
      if (hasDie) spr(c.set, 'die', f, c.x - L.cam, c.y + (c.eagle ? 0 : 1), c.face, c.scale, a);
      else { ctx.save(); ctx.filter = 'grayscale(0.7) brightness(0.8)'; spr(c.set, 'idle', 0, c.x - L.cam, c.y + 1, c.face, c.scale, Math.max(0, 1 - c.t * 0.9)); ctx.restore(); if (c.t < 1.2) spr('bfx', 'smoke', 0, c.x - L.cam, c.y - 30 - c.t * 20, 1, c.big ? 1 : 0.6, 1 - c.t / 1.2); }
      if (c.big && c.set === 'boss' && c.t < 2.5) spr('bfx', 'smoke', 0, c.x - L.cam + Math.sin(c.t * 3) * 20, c.y - 50 - c.t * 10, 1, 1, 1 - c.t / 2.5);
    });
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
      } else if (it.type === 'check' && ATLAS.priestess) {
        const casting = it.cast > 0;
        spr('priestess', casting ? 'attack' : 'idle', casting ? (1.2 - it.cast) * 3 : L.t * 2, x + 8, it.y + it.h + 1, -1);
        if (casting) spr('fx', 'sun', 0, x - 18, it.y + it.h - 34, 1, 0.8 + Math.sin(L.t * 12) * 0.1, Math.min(1, it.cast));
        if (it.on && !casting) spr('fx', 'star', 0, x + 8, it.y + 4 + Math.sin(L.t * 3) * 3, 1, 0.45, 0.8);
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
      ctx.fillStyle = '#2b1d10'; ctx.font = '700 13px "Cormorant Garamond", Georgia, serif'; ctx.textAlign = 'center'; ctx.fillText(L.boss.title, VW / 2, 61); if (L.boss.type === 'boss') { ctx.fillStyle = '#2b1d10'; [0.5, 0.2].forEach((r) => ctx.fillRect(VW / 2 - 155 + 310 * r - 1, 68, 2, 11)); } ctx.textAlign = 'left';
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
    L.items.forEach((it) => { const x = it.x - L.cam; if (x < -60 || x > VW + 60) return; if (it.type === 'check') { drawItems([it], false); return; } inked(x - 6, it.y - 8, it.w + 40, it.h + 16, () => drawItems([it], false)); });
    if (L.flag && !L.flag.hidden) { const fx = L.flag.x - L.cam; if (fx > -80 && fx < VW + 80) inked(fx - 14, L.flag.y - 16, 64, L.flag.h + 20, () => drawItems([], true)); }
    drawWater();
    drawHazards();
    L.shots.forEach((o) => spr(o.set, o.anim, 0, o.x - L.cam, o.y, o.face || (o.vx < 0 ? -1 : 1), o.scale));
    L.enemies.forEach((en) => { if (en.dead) return; const sx = en.x - L.cam; if (sx < -160 || sx > VW + 160) return; drawEnemy(en); });
    drawCompanion();
    drawMarcus();
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
    $('#final-line').textContent = sc === 9 ? 'You recovered every scroll of the Meditations. The Roman Automaton is silenced and the empire can think clearly again.' : `The Roman Automaton is silenced, but ${9 - sc} scroll${9 - sc === 1 ? ' is' : 's are'} still out there. Play again to find them all.`;
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
