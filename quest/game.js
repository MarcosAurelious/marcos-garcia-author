/* The Aurelious Quest — a Marcus Aurelius side-scroller by Marcos Garcia, drawn in the style of his Stoic books.
   Original game: all art is drawn in code, plus Marcos Garcia's own illustrations.
   Runs entirely in the browser. No network calls, no tracking; the best result stays in this browser. */
(() => {
  'use strict';

  /* ================= basics ================= */
  const $ = (s) => document.querySelector(s);
  const T = 32, ROWS = 15, VW = 960; let VH = 480;
  // On small screens the camera moves in closer so the characters are bigger, and follows Marcus up and down.
  let ZOOM = 1, VWZ = VW, VHZ = VH, HS = 1, HW = VW, RES = 1;   // RES: real pixels per game pixel, so big screens stay sharp
  function setZoom() {
    const portrait = window.innerHeight > window.innerWidth && window.innerWidth < 760;
    const w = cv.getBoundingClientRect().width || VW, h = window.innerHeight;
    HS = portrait ? 1.6 : w < 700 ? 1.3 : 1; HW = VW / HS;   // bigger score bar on small screens
    let want = 480;
    if (portrait) {   // phones held upright: fill the free height above the touch buttons
      const top = cv.getBoundingClientRect().top + window.scrollY, pad = $('#touch'), padH = pad && pad.offsetHeight ? pad.offsetHeight : 96;
      const avail = Math.max(260, h - Math.max(0, top - window.scrollY) - padH - 14);
      want = Math.round(VW * avail / w);
      ZOOM = clamp(want / 480, 2.0, 2.5);
      want = Math.round(clamp(want, 720, (480 + 200) * ZOOM + 44 * HS));   // up to 200 px of open sky above the level, never below it
    } else {   // wide screens: fill the window (as large as fits), keeping the 2:1 view
      const wrap = $('#game-wrap'), cssW = Math.floor(Math.min(window.innerWidth - 28, (h - 28) * VW / 480));
      if (wrap) wrap.style.width = Math.max(320, cssW) + 'px';
      const ww = Math.max(320, cssW); ZOOM = ww < 560 ? 1.8 : (ww < 960 || h < 560) ? 1.45 : 1.12;
    }
    VH = want;
    const cssW2 = cv.getBoundingClientRect().width || VW, touchy = document.body.classList.contains('touchy');
    const res = clamp(Math.ceil(cssW2 * (window.devicePixelRatio || 1) / VW * 4) / 4, 1, touchy ? 1.75 : 3);
    if (cv.width !== Math.round(VW * res) || cv.height !== Math.round(VH * res)) { RES = res; cv.width = Math.round(VW * res); cv.height = Math.round(VH * res); cv.style.aspectRatio = `${VW} / ${VH}`; for (const k in strips) delete strips[k]; }
    VWZ = VW / ZOOM; VHZ = VH / ZOOM;
  }
  const cv = $('#cv'); let ctx = cv.getContext('2d');
  window.addEventListener('resize', () => setZoom()); window.addEventListener('orientationchange', () => setTimeout(setZoom, 300));
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const rnd = (n) => Math.floor(Math.random() * n);
  const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const store = { get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } } };
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Calm mode (photosensitivity safety): no strobing flashes, no screen shake, steady hit blinks. On by default for reduced-motion users.
  let calm = store.get('aq-calm'); if (calm === null) calm = reduceMotion;
  const strobe = (hz) => !calm && Math.floor(L.t * hz) % 2;
  const img = (src) => { const i = new Image(); i.src = src; return i; };
  const ART = {};
  const bgImg = (src) => ART[src] || (ART[src] = img(src));
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  const ATLAS = {"warrior":{"idle":[[0,0,38,56,20,56],[40,0,42,56,21,56],[84,0,39,55,20,55]],"walk":[[125,0,38,50,19,50],[165,0,35,48,18,48],[202,0,37,48,17,48],[241,0,55,48,27,48]],"run":[[298,0,40,49,20,49],[340,0,41,48,20,48],[383,0,39,50,18,50],[424,0,37,48,17,48]],"jump":[[463,0,45,56,22,56],[510,0,38,55,18,55],[550,0,32,51,14,51],[584,0,35,49,17,49]],"attack":[[621,0,42,63,19,63],[665,0,37,64,13,64],[704,0,47,52,26,52],[753,0,46,47,17,47]],"hurt":[[801,0,37,64,18,64],[840,0,33,52,16,52],[875,0,35,51,17,51]],"die":[[912,0,42,46,22,46],[956,0,57,32,28,32],[0,66,52,29,26,29]]},"archer":{"idle":[[54,66,46,52,21,52],[102,66,38,51,15,51],[142,66,40,51,16,51]],"walk":[[184,66,43,48,19,48],[229,66,32,48,13,48],[263,66,35,50,16,50]],"run":[[300,66,46,48,20,48],[348,66,38,48,16,48],[388,66,41,48,20,48]],"jump":[[431,66,45,53,20,53],[478,66,38,49,14,49],[518,66,29,52,13,52]],"attack":[[549,66,48,50,16,50],[599,66,37,53,13,53],[638,66,44,51,14,51]],"hurt":[[684,66,48,51,21,51],[734,66,41,48,16,48],[777,66,35,52,12,52]],"die":[[814,66,48,38,26,38],[864,66,44,24,22,24],[910,66,40,27,19,27]]},"knight":{"idle":[[952,66,34,54,16,54],[988,66,34,53,15,53],[0,122,31,53,14,53]],"walk":[[33,122,34,49,15,49],[69,122,32,49,15,49],[103,122,36,48,18,48]],"run":[[141,122,39,50,17,50],[182,122,37,49,18,49],[221,122,35,50,16,50]],"jump":[[258,122,32,52,14,52],[292,122,34,50,17,50],[328,122,28,50,11,50]],"attack":[[358,122,42,64,20,64],[402,122,20,56,12,56],[424,122,36,59,12,59],[462,122,44,57,27,57]],"hurt":[[508,122,32,50,15,50],[542,122,34,48,16,48],[578,122,48,48,18,48]],"die":[[628,122,38,41,18,41],[668,122,42,29,19,29],[712,122,43,26,19,26]]},"commander":{"idle":[[757,122,72,104,35,104],[831,122,72,105,35,105],[905,122,67,100,36,100]],"walk":[[0,229,62,93,28,93],[64,229,68,93,33,93],[134,229,66,93,34,93]],"run":[[202,229,79,93,39,93],[283,229,79,91,39,91],[364,229,81,93,43,93]],"jump":[[447,229,74,100,32,100],[523,229,85,98,40,98],[610,229,70,100,35,100]],"attack":[[682,229,84,113,46,113],[768,229,86,115,38,115],[856,229,115,118,60,118]],"hurt":[[0,349,82,91,40,91],[84,349,70,88,36,88],[156,362,67,90,34,90]],"die":[[225,349,85,86,43,86],[312,349,85,79,42,79],[399,349,84,53,42,53]]},"priestess":{"idle":[[485,349,59,60,24,60],[546,349,49,59,24,59]],"walk":[[597,349,56,55,23,55],[655,349,50,54,24,54]],"run":[[707,349,54,56,25,56],[763,349,52,54,24,54]],"jump":[[817,349,55,62,24,62],[874,349,56,59,25,59]],"attack":[[932,349,40,69,23,69],[0,460,58,71,24,71]],"hurt":[[60,460,55,58,27,58],[117,460,73,61,38,61]],"die":[[192,460,67,43,32,43],[261,460,67,56,34,56]]},"companion":{"idle":[[330,460,21,30,10,30],[353,460,22,30,11,30],[377,460,22,32,11,32]],"walk":[[401,460,20,31,9,31],[423,460,20,28,10,28],[445,460,20,30,10,30],[467,460,19,29,9,29]],"run":[[488,460,29,33,11,33],[519,460,23,32,12,32],[544,460,22,32,11,32]],"jump":[[568,460,23,32,10,32],[593,460,24,35,11,35],[619,460,22,31,10,31]],"attack":[[643,460,35,37,23,37],[680,460,29,34,15,34],[711,460,32,40,18,40]],"hurt":[[745,460,27,33,14,33],[774,460,28,32,14,32],[804,460,27,33,14,33]],"die":[[833,460,22,31,9,31]]},"fx":{"slash":[[857,460,35,48,17,24]],"heal":[[894,460,73,70,36,35]],"swirl":[[0,533,79,40,39,20]],"comet":[[81,533,63,26,31,13]],"sun":[[146,533,28,34,14,17]],"star":[[176,533,27,28,13,14]],"dust":[[205,533,27,28,13,14]]},"eagle":{"fly":[[234,533,41,41,18,20],[277,533,38,39,16,19]],"dive":[[317,533,32,44,14,22],[351,533,42,44,20,22],[395,533,48,49,25,24],[445,533,43,53,21,26]],"glide":[[490,533,53,34,25,17],[545,533,41,29,20,14],[588,533,47,31,23,15]],"hurt":[[637,533,33,27,15,13],[672,533,38,34,22,17]],"die":[[712,533,46,33,20,16],[760,533,47,25,19,12]]},"coil":{"idle":[[809,533,58,91,29,91],[869,533,61,90,32,90],[932,533,63,95,30,95]],"beam":[[0,630,59,93,29,93],[61,630,57,91,28,91],[120,630,233,90,27,90]],"arc":[[355,630,64,99,34,99],[421,630,64,99,32,99],[487,630,108,99,41,99]],"hurt":[[597,630,57,98,28,98],[656,630,56,91,28,91],[714,630,46,96,25,96]],"die":[[762,630,59,90,30,90],[823,630,85,104,37,104]]},"boss":{"idle":[[0,0,122,110,63,110],[124,0,104,106,54,106],[230,0,125,108,65,108],[357,0,116,107,58,107]],"walk":[[475,0,110,96,58,96],[587,0,65,96,30,96],[654,0,74,96,35,96],[730,0,74,96,31,96]],"run":[[806,0,95,96,48,96],[903,0,75,96,31,96],[0,112,99,96,44,96]],"slam":[[101,112,178,95,51,95]],"blast":[[281,112,264,98,43,98]],"summon":[[547,112,187,98,52,98]],"thunder":[[736,112,191,108,59,108]],"shield":[[0,222,154,108,42,108]],"hurt":[[156,222,122,110,56,110]],"die":[[280,222,144,112,46,112]]},"bfx":{"spear":[[426,222,80,48,40,24]],"orb":[[508,222,33,35,16,17]],"drone":[[543,222,33,27,16,13]],"bolt":[[578,222,60,103,30,51]],"ring":[[640,222,121,107,60,53]],"burst":[[763,222,72,66,36,33]],"smoke":[[837,222,71,68,35,34]]}};
  /* ================= sprites (Marcos Garcia's character sheets) ================= */
  const SPR = img('img/sprites.webp'), BOSSIMG = img('img/boss.webp'), ENEMYIMG = img('img/enemies.webp');
  const EATLAS = {"minotaur":{"idle":[[0,0,57,70,29,70],[59,0,53,69,25,69]],"move":[[114,0,69,65,37,65],[185,0,85,67,50,67]],"gore":[[272,0,84,56,59,56],[358,0,107,64,81,64]],"slam":[[467,0,182,68,131,68]]},"medusa":{"idle":[[651,0,40,66,24,66],[693,0,40,66,24,66]],"move":[[735,0,40,64,24,64],[777,0,42,64,28,64],[821,0,37,64,24,64]],"gaze":[[860,0,84,67,26,67]],"serp":[[946,0,37,61,24,61]]},"chiron":{"idle":[[0,72,52,70,20,70],[54,72,59,69,26,69]],"move":[[115,72,43,70,22,70],[160,72,69,69,31,69],[231,72,49,68,19,68]],"shoot":[[282,72,60,66,22,66]]},"chariot":{"idle":[[344,72,123,66,68,33]],"move":[[469,72,143,74,79,37]],"beam":[[614,72,95,55,52,27]]},"leviathan":{"idle":[[711,72,166,92,83,92]],"emerge":[[0,166,186,116,93,116]],"tent":[[188,166,241,102,121,102]],"cannon":[[431,166,219,99,109,99]]},"colossus":{"idle":[[652,166,106,100,50,100],[760,166,103,100,54,100],[865,166,118,100,47,100]],"slam":[[0,284,114,108,60,108],[116,284,97,108,56,108],[215,284,174,108,64,108]],"throw":[[391,284,86,91,48,91],[479,284,200,98,158,98]]},"techno":{"idle":[[681,284,75,64,42,64],[758,284,60,64,24,64],[820,284,63,64,20,64]],"gaze":[[885,284,46,65,16,65],[0,394,96,68,18,68]],"sum":[[98,394,39,57,18,57],[139,394,115,60,56,60],[256,394,54,57,24,57]]},"engine":{"idle":[[312,394,117,104,63,104],[431,394,119,101,55,101],[552,394,112,97,60,97]],"charge":[[666,394,139,99,71,99],[807,407,124,99,65,99],[0,508,119,121,53,121]],"sweep":[[121,508,126,96,59,96],[249,508,163,112,87,112],[414,508,101,94,50,94]]},"pegasus":{"idle":[[517,508,87,52,44,26],[606,508,61,60,48,30],[669,508,53,56,44,28]],"dive":[[724,508,72,62,44,31],[798,508,68,75,54,37],[868,508,80,76,66,38]],"sonic":[[0,631,77,60,52,30],[79,631,46,61,50,30]]},"helios":{"idle":[[127,631,63,54,31,27],[192,631,76,62,38,31],[270,631,50,60,25,30]],"orbs":[[322,631,71,60,36,30],[395,631,86,69,43,34],[483,631,51,61,26,30]],"laser":[[536,631,40,47,20,23],[578,631,71,63,36,31],[651,631,100,70,50,35]]},"efx":{"serpent":[[753,631,38,17,19,8]],"star":[[793,631,89,16,44,8]],"flare":[[884,631,51,43,25,21]],"rock":[[937,631,38,32,19,16]],"ring":[[0,703,58,38,29,19]],"sunorb":[[60,703,70,32,35,16]],"water":[[132,703,98,41,49,20]],"beam":[[232,703,87,28,43,14]]}};
  const XATLAS = {"cerberus":{"recover":[[0,0,164,128,67,128]],"special":[[1566,0,219,110,87,110]],"attack":[[1245,242,202,98,127,98]],"idle":[[655,345,134,96,67,96]],"walk":[[1473,345,171,95,81,95]],"wind":[[0,539,144,83,79,83]]},"blackknight":{"wind":[[166,0,87,123,48,123]],"special":[[819,0,148,114,48,114]],"attack":[[967,130,128,104,46,104]],"idle":[[1906,242,68,96,34,96]],"recover":[[1936,345,78,94,30,94]],"walk":[[1074,443,87,89,44,89]]},"stormtaur":{"wind":[[255,0,113,119,80,119]],"special":[[370,0,202,116,102,116]],"attack":[[0,242,187,101,88,101]],"recover":[[1084,242,159,98,76,98]],"idle":[[0,345,125,96,62,96]],"walk":[[943,443,129,91,72,91]]},"spider":{"special":[[574,0,243,116,154,116]],"wind":[[1124,0,166,113,84,113]],"recover":[[1381,0,183,110,102,110]],"walk":[[595,242,178,99,86,99]],"idle":[[485,345,168,96,84,96]],"attack":[[424,443,215,93,94,93]]},"king":{"special":[[969,0,153,113,109,113]],"wind":[[881,130,84,105,45,105]],"idle":[[1772,242,66,96,33,96]],"recover":[[1840,242,64,96,33,96]],"walk":[[1850,345,84,94,45,94]],"attack":[[1733,443,115,85,49,85]]},"templar":{"attack":[[1292,0,87,112,41,112]],"idle":[[1703,242,67,96,33,96]],"recover":[[1160,345,75,95,35,95]],"walk":[[771,443,89,91,51,91]],"wind":[[862,443,79,91,41,91]],"special":[[1295,443,138,88,51,88]]},"pluto":{"wind":[[1787,0,121,110,61,110]],"special":[[0,130,188,110,95,110]],"recover":[[775,242,127,99,59,99]],"idle":[[791,345,94,96,47,96]],"walk":[[1646,345,112,95,59,95]],"attack":[[270,539,178,80,61,80]]},"harpy":{"wind":[[190,130,105,109,58,109]],"attack":[[1097,130,138,104,72,104]],"special":[[1626,130,198,103,98,103]],"recover":[[1449,242,128,97,60,97]],"idle":[[366,345,117,96,58,96]],"walk":[[1357,345,114,95,60,95]]},"strider":{"special":[[297,130,184,108,103,108]],"recover":[[1826,130,103,103,51,103]],"wind":[[189,242,114,101,55,101]],"attack":[[305,242,176,101,55,101]],"walk":[[1579,242,122,97,69,97]],"idle":[[962,345,90,96,45,96]]},"titan":{"attack":[[483,130,162,107,102,107]],"wind":[[647,130,118,106,90,106]],"special":[[1424,130,200,103,86,103]],"idle":[[251,345,113,96,56,96]],"walk":[[304,443,118,93,62,93]],"recover":[[1163,443,130,89,72,89]]},"charon":{"wind":[[767,130,112,106,53,106]],"special":[[1237,130,185,104,99,104]],"idle":[[1054,345,104,96,51,96]],"walk":[[1435,443,125,87,59,87]],"recover":[[146,539,122,82,63,82]],"attack":[[450,539,186,78,63,78]]},"anubis":{"wind":[[483,242,110,100,67,100]],"idle":[[127,345,122,96,61,96]],"walk":[[1237,345,118,95,57,95]],"recover":[[0,443,130,94,71,94]],"attack":[[1562,443,169,86,85,86]],"special":[[638,539,191,77,105,77]]},"galvanic":{"special":[[904,242,178,99,86,99]],"idle":[[887,345,73,96,36,96]],"recover":[[1760,345,88,95,44,95]],"attack":[[132,443,170,94,54,94]],"walk":[[641,443,128,92,56,92]],"wind":[[1850,443,100,85,48,85]]}};
  const ELITEIMG = img('img/elites.webp');
  const MATLAS = {"n2":{"idle":[[241,0,92,125,48,125],[1188,0,110,117,66,116]],"walk":[[1033,146,116,109,74,109],[1692,0,107,115,66,112]],"run":[[1033,146,116,109,74,109],[1692,0,107,115,66,112]],"jump":[[0,0,118,144,76,120]],"attack":[[241,0,92,125,48,125],[561,146,178,110,70,109],[561,146,178,110,70,109],[561,146,178,110,70,109]],"special":[[561,146,178,110,70,109]],"hurt":[[1188,0,110,117,66,116]]},"n5":{"idle":[[609,0,96,124,52,124],[950,0,118,120,68,120]],"walk":[[443,146,116,113,70,113],[111,146,110,115,61,112]],"run":[[443,146,116,113,70,113],[111,146,110,115,61,112]],"jump":[[120,0,119,143,78,119]],"attack":[[609,0,96,124,52,124],[1518,0,172,116,66,116],[1518,0,172,116,66,116],[1518,0,172,116,66,116]],"special":[[1518,0,172,116,66,116]],"hurt":[[950,0,118,120,68,120]]},"n4":{"idle":[[335,0,91,125,48,125],[0,146,109,115,66,115]],"walk":[[1331,146,121,109,80,108],[331,146,110,113,68,112]],"run":[[1331,146,121,109,80,108],[331,146,110,113,68,112]],"jump":[[823,0,125,121,82,121]],"attack":[[335,0,91,125,48,125],[1454,146,180,107,68,107],[1454,146,180,107,68,107],[1454,146,180,107,68,107]],"special":[[1454,146,180,107,68,107]],"hurt":[[0,146,109,115,66,115]]},"n1":{"idle":[[428,0,85,124,46,124],[1300,0,106,116,68,116]],"walk":[[741,146,115,109,74,109],[223,146,106,113,64,112]],"run":[[741,146,115,109,74,109],[223,146,106,113,64,112]],"jump":[[707,0,114,121,74,121]],"attack":[[428,0,85,124,46,124],[858,146,173,109,68,109],[858,146,173,109,68,109],[858,146,173,109,68,109]],"special":[[858,146,173,109,68,109]],"hurt":[[1300,0,106,116,68,116]]},"n3":{"idle":[[515,0,92,124,47,124],[1408,0,108,116,63,115]],"walk":[[1801,0,119,115,73,108],[1922,0,111,115,62,113]],"run":[[1801,0,119,115,73,108],[1922,0,111,115,62,113]],"jump":[[1070,0,116,119,75,118]],"attack":[[515,0,92,124,47,124],[1151,146,178,109,69,108],[1151,146,178,109,69,108],[1151,146,178,109,69,108]],"special":[[1151,146,178,109,69,108]],"hurt":[[1408,0,108,116,63,115]]}};   // Marcus, armor stages I-V (drawn at half size)
  const MARCUSIMG = img('img/marcus.webp');
  Object.assign(ATLAS, EATLAS, XATLAS, MATLAS);
  // Chapter I and II bosses: full redrawn sheets (weapon in every frame, real walk cycles, death falls)
  const BOSS2 = { commander: img('img/boss-commander.webp'), engine: img('img/boss-engine.webp'), colossus: img('img/boss-colossus.webp'), techno: img('img/boss-medusa.webp'), leviathan: img('img/boss-leviathan.webp'), stormtaur: img('img/boss-stormtaur.webp'), cerberus: img('img/boss-cerberus.webp') };
  const BOSS2_SCALE = { colossus: 1 / 1.5, techno: 1 / 1.5, leviathan: 1 / 1.5, stormtaur: 1 / 1.5, cerberus: 1 / 1.4 };   // packed at full boss size: the 1.5x boss draws 1:1 (sharp), regular ones shrink
  ATLAS.techno = {"idle":[[2,2,76,97,36,97],[82,2,83,96,42,96],[169,2,82,96,40,96],[255,2,84,94,40,94]],"move":[[2,103,85,90,38,90],[91,103,94,89,44,89],[189,103,97,91,44,91],[290,103,97,84,46,84]],"gaze":[[2,198,80,94,38,94],[86,198,141,93,42,93],[231,198,139,93,38,93]],"summon":[[2,296,94,93,40,93],[100,296,125,93,52,93],[229,296,99,94,42,94]],"hurt":[[2,394,86,88,44,88],[92,394,86,84,43,84]],"die":[[2,486,74,101,35,101],[80,486,79,102,37,102],[163,486,77,100,39,100],[244,486,77,98,39,98],[325,486,113,49,55,49]]};
  ATLAS.leviathan = {"idle":[[2,2,270,134,138,134],[276,2,268,140,134,140],[548,2,270,148,141,148],[822,2,269,136,138,136]],"emerge":[[2,154,268,124,137,124],[274,154,269,152,135,152],[547,154,275,181,138,181],[826,154,276,198,140,198]],"tent":[[2,356,257,147,125,147],[263,356,254,174,122,174],[521,356,304,150,132,150],[829,356,274,150,127,150]],"cannon":[[2,534,249,140,118,140],[255,534,252,142,129,142],[511,534,318,142,148,142],[833,534,289,142,136,142]],"hurt":[[2,680,252,160,126,160],[258,680,261,184,130,184]],"die":[[2,868,224,177,113,177],[230,868,223,168,109,168],[457,868,218,145,103,145],[679,868,218,121,100,121],[901,868,218,108,111,108]]};
  ATLAS.stormtaur = {"idle":[[2,2,191,144,87,144],[197,2,188,148,86,148],[389,2,194,144,87,144],[587,2,189,141,86,141]],"walk":[[2,154,158,126,72,126],[164,154,155,124,71,124],[323,154,156,121,74,121],[483,154,155,123,72,123],[642,154,156,120,73,120],[802,154,156,122,71,122]],"wind":[[2,284,184,132,87,132],[190,284,149,174,71,174]],"attack":[[2,462,184,129,89,129],[190,462,181,165,95,165],[375,462,250,153,119,153],[629,462,191,126,92,126]],"special":[[2,631,181,132,85,132],[187,631,211,127,100,127],[402,631,253,132,109,132],[659,631,244,132,123,132]],"hurt":[[2,767,180,142,81,142],[186,767,175,137,86,137]],"die":[[2,913,162,132,73,132],[168,913,174,118,80,118],[346,913,181,104,85,104],[531,913,189,80,97,80],[724,913,205,61,105,61]]};
  ATLAS.cerberus = {"idle":[[2,2,195,128,105,128],[201,2,194,135,104,135],[399,2,195,133,104,133],[598,2,196,136,104,136]],"walk":[[2,142,203,133,109,133],[209,142,204,132,112,132],[417,142,204,135,113,135],[625,142,204,138,110,138],[833,142,204,131,111,131],[1041,142,201,141,111,141]],"wind":[[2,287,185,109,98,109],[191,287,186,104,97,104]],"attack":[[2,400,184,110,98,110],[190,400,245,113,119,113],[439,400,250,114,123,114],[693,400,232,114,99,114]],"special":[[2,518,169,152,90,152],[175,518,202,170,85,170],[381,518,269,144,143,144],[654,518,254,124,141,124]],"hurt":[[2,692,183,106,97,106],[189,692,177,105,97,105]],"die":[[2,802,166,107,88,107],[172,802,172,102,95,102],[348,802,189,94,100,94],[541,802,199,90,102,90],[744,802,203,99,104,99]]};
  ATLAS.colossus = {"idle":[[2,2,137,150,67,150],[143,2,130,150,62,150],[277,2,124,150,59,150],[405,2,130,150,59,150]],"walk":[[2,156,135,147,65,147],[141,156,128,147,62,147],[273,156,130,146,66,146],[407,156,128,147,62,147],[539,156,127,155,63,155],[670,156,128,153,63,153]],"throw":[[2,315,158,123,71,123],[164,315,137,150,69,150],[305,315,144,172,67,172],[453,315,175,143,78,143]],"slam":[[2,491,142,164,70,164],[148,491,159,135,72,135],[311,491,201,114,99,114],[516,491,188,128,95,128]],"hurt":[[2,659,148,140,73,140],[154,659,144,139,69,139]],"die":[[2,803,134,141,66,141],[140,803,139,138,69,138],[283,803,156,121,78,121],[443,803,187,91,98,91],[634,803,218,58,104,58]]};
  ATLAS.commander = {"idle":[[2,2,66,104,36,104],[72,2,66,104,36,104],[142,2,67,104,37,104],[213,2,67,104,38,104]],"walk":[[2,110,62,101,32,101],[68,110,65,101,35,101],[137,110,67,101,37,101],[208,110,70,99,40,99],[282,110,70,101,40,101],[356,110,70,101,40,101]],"attack":[[2,215,95,85,44,85],[101,215,129,83,48,83],[234,215,155,83,55,83],[393,215,123,84,62,84]],"throw":[[2,304,94,93,46,93],[100,304,160,92,54,92],[264,304,96,93,45,93]],"hurt":[[2,401,77,93,39,93],[83,401,93,90,42,90]],"die":[[2,498,77,86,37,86],[83,498,91,73,45,73],[178,498,124,50,58,50],[306,498,135,31,64,31]]};
  ATLAS.engine = {"idle":[[2,2,100,100,45,100],[106,2,99,100,45,100],[209,2,99,101,45,101],[312,2,99,99,44,99]],"walk":[[2,107,98,98,44,98],[104,107,94,99,43,99],[202,107,94,99,43,99],[300,107,88,96,40,96],[392,107,92,99,43,99],[488,107,84,99,38,99]],"wind":[[2,210,97,87,45,87],[103,210,103,82,48,82]],"charge":[[2,301,100,84,52,84],[106,301,103,84,55,84],[213,301,101,85,53,85],[318,301,110,79,62,79]],"sweep":[[2,390,85,104,45,104],[91,390,111,94,50,94],[206,390,114,80,53,80],[324,390,94,78,43,78]],"hurt":[[2,498,94,92,40,92],[100,498,93,88,41,88]],"die":[[2,594,94,94,44,94],[100,594,100,95,45,95],[204,594,99,95,46,95],[307,594,114,76,51,76],[425,594,124,52,64,52]]};
  const imgFor = (set) => BOSS2[set] || (set === 'boss' || set === 'bfx' ? BOSSIMG : MATLAS[set] ? MARCUSIMG : XATLAS[set] ? ELITEIMG : EATLAS[set] ? ENEMYIMG : SPR);
  // spr: draw one frame with its anchor (feet, or centre for effects) at screen x,y. clip limits how far right of the anchor is drawn.
  function spr(set, anim, i, sx, sy, face = 1, scale = 1, alpha = 1, clip = 0) {
    const fr = ATLAS[set] && ATLAS[set][anim]; if (!fr) return;
    const im = imgFor(set); if (!im.complete || !im.naturalWidth) return;
    const [x, y, w0, h, ax, ay] = fr[((Math.floor(i) % fr.length) + fr.length) % fr.length];
    const w = clip ? Math.min(w0, ax + clip) : w0;
    ctx.save(); if (alpha !== 1) ctx.globalAlpha *= alpha; ctx.translate(Math.round(sx), Math.round(sy)); if (face < 0) ctx.scale(-1, 1);
    if (BOSS2_SCALE[set]) scale *= BOSS2_SCALE[set];
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
    ['Confine yourself to the present.', 'after Meditations 7.29'],
    ['How much time he gains who does not look to see what his neighbor says or does.', 'after Meditations 4.18'],
    ['The happiness of your life depends upon the quality of your thoughts.', 'after Meditations 5.16'],
    ['A strong opinion is not evidence. Ask what would change your mind.', 'A lesson for the Stoic mind'],
    ['When you are offended, your judgment is what offends you.', 'after Meditations 11.18'],
    ['Look back over the past, with its changing empires, and you can foresee the future too.', 'after Meditations 7.49'],
    ['Loss is nothing else but change, and change is nature\'s delight.', 'after Meditations 9.35'],
    ['Never confuse a confident voice with a correct one.', 'A lesson for the Stoic mind'],
    ['Dwell on the beauty of life. Watch the stars, and see yourself running with them.', 'after Meditations 7.47'],
    ['You have power over your mind, not outside events. Realize this, and you will find strength.', 'after Meditations'],
    ['Fear is louder than facts. Let the facts speak first.', 'A lesson for the Stoic mind'],
    ['Waste no more time arguing about what a good man should be. Be one.', 'Meditations 10.16'],
    ['Accept the things to which fate binds you, and love the people with whom fate brings you together.', 'after Meditations 6.39'],
    ['Wealth and rank are borrowed. Character is the only thing you keep.', 'A lesson for the Stoic mind'],
    ['Soon you will have forgotten all things; soon all things will have forgotten you.', 'Meditations 7.21'],
    ['Power without discipline is only noise and sparks.', 'A lesson for the Stoic mind'],
    ['The impediment to action advances action.', 'Meditations 5.20'],
    ['A spark that is not grounded burns its own house.', 'A lesson for the Stoic mind'],
    ['Think of yourself as dead. Now take what is left and live it properly.', 'after Meditations 7.56'],
    ['Do every act of your life as though it were the very last.', 'after Meditations 2.5'],
    ['Look within. Within is the fountain of good, and it will ever bubble up, if you will ever dig.', 'Meditations 7.59'],
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
    { name: 'The Sketchbook Frontier', theme: 0, intro: 'Rome, drawn in graphite beneath a spiral galaxy. The Shadow Legion has torn the first scrolls from the Meditations, and the Minotaur Engine guards the end of the road.', art: 'img/bust-sketch.webp', bg: 'img/bg-sketch.webp', build() {
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
    { name: 'The Weird Science Laboratory', theme: 1, intro: 'Ball lightning, copper coils and Faraday cages. Shadow archers guard the ledges, and at the far end the Dark Commander waits with his spear.', art: 'img/plate-lightning.webp', bg: 'img/bg-lab.webp', build() {
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
    { name: 'The Cosmic Forum', theme: 2, intro: 'Beneath the great Tesla coils of the Forum stands Augustus Colossus, a giant statue animated by lightning. Recover the scrolls and bring it down.', art: 'img/bg-tesla.webp', bg: 'img/bg-tesla.webp', build() {
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
      L.ent('bigboss', 180, 11, { kind: 'colossus', minX: 162 });
      L.ent('flag', 190, 11, { hidden: true });
      return L;
    } },
    { name: 'The Sundial at Dawn', theme: 0, intro: 'Morning over the seven hills. Minotaurs and Pegasus drones patrol the old observatory, and Medusa the Technomancer waits beside the great sundial.', art: 'img/card-globe.webp', bg: 'img/bg-pantheon.webp', build() {
      const L = builder(192);
      L.ground(0, 20); L.ent('start', 2, 11);
      L.coins(5, 10, 4); L.set(9, 8, 'B'); L.box(10, 8, 'coin'); L.set(11, 8, 'B'); L.ent('soldier', 15, 11); L.ent('pegasus', 18, 5);
      L.ground(24, 48);
      L.plat(27, 9, 3); L.ent('archer', 28, 8); L.plat(31, 6, 3); L.ent('scroll', 32, 5, { i: 9 });
      L.ent('minotaur', 38, 11); L.field(43, 8, 11); L.coins(45, 10, 3);
      L.ground(52, 80); L.ent('check', 53, 11);
      L.ent('eagle', 58, 4); L.ent('chiron', 62, 11); L.stairs(66, 3); L.coins(70, 7, 3); L.ent('colossus', 74, 11);
      L.plat(82, 10, 2);
      L.ground(85, 120);
      L.ent('pegasus', 88, 5); L.ent('anubis', 91, 11); L.plat(95, 8, 4); L.ent('archer', 96, 7); L.plat(101, 5, 3); L.ent('scroll', 102, 4, { i: 10 });
      L.field(108, 8, 11); L.field(112, 8, 11); L.ent('minotaur', 116, 11);
      L.ground(124, 192); L.ent('check', 125, 11);
      L.ent('chiron', 132, 11); L.ent('eagle', 136, 3); L.set(139, 8, 'B'); L.box(140, 8, 'heart'); L.set(141, 8, 'B');
      L.ent('colossus', 146, 11); L.plat(150, 8, 3); L.ent('scroll', 151, 7, { i: 11 }); L.ent('pegasus', 156, 5); L.ent('archer', 160, 11);
      L.ent('check', 166, 11);
      L.ent('bigboss', 178, 11, { kind: 'techno', minX: 168 });
      L.ent('flag', 187, 11, { hidden: true });
      return L;
    } },
    { name: 'The Hall of Synchronicity', theme: 1, intro: 'A hall of clocks, cards and coincidence. Helios orbs hum overhead, and beneath the flooded far end sleeps the Neptune Leviathan.', art: 'img/card-power.webp', bg: 'img/bg-chamber.webp', build() {
      const L = builder(196);
      L.ground(0, 22); L.ent('start', 2, 11);
      L.coins(5, 10, 3); L.ent('helios', 10, 6); L.ent('centurion', 16, 11); L.field(20, 8, 11);
      L.ground(26, 52);
      L.plat(29, 8, 3); L.ent('scroll', 30, 7, { i: 12 }); L.ent('medusa', 36, 11); L.ent('archer', 42, 11);
      L.set(45, 8, 'B'); L.box(46, 8, 'coin'); L.box(47, 8, 'heart'); L.field(50, 8, 11);
      L.plat(54, 9, 2);
      L.ground(57, 90); L.ent('check', 58, 11);
      L.ent('helios', 64, 6); L.ent('titan', 65, 11); L.col(70, 10, 11); L.col(71, 10, 11); L.ent('medusa', 76, 11); L.ent('chariot', 80, 3);
      L.field(84, 8, 11); L.coins(86, 10, 3);
      L.ground(94, 130);
      L.plat(97, 8, 3); L.ent('archer', 98, 7); L.plat(101, 5, 3); L.ent('scroll', 102, 4, { i: 13 });
      L.ent('centurion', 106, 11); L.ent('helios', 112, 5); L.field(116, 8, 11); L.field(119, 8, 11); L.ent('medusa', 125, 11);
      L.ground(134, 178); L.ent('check', 135, 11);
      L.ent('spider', 142, 11); L.ent('eagle', 146, 3); L.plat(150, 8, 3); L.ent('scroll', 151, 7, { i: 14 }); L.box(155, 8, 'laurel');
      L.ent('centurion', 158, 11); L.ent('helios', 162, 5); L.ent('check', 170, 11);
      L.ent('bigboss', 180, 11, { kind: 'leviathan' });
      L.ground(183, 196);
      L.ent('flag', 192, 11, { hidden: true });
      return L;
    } },
    { name: 'The Storm over the Seven Hills', music: 'ch4', theme: 2, intro: 'Jupiter and Saturn hang over the sleeping Forum. Anubis stalks the terraces, the Storm Harpy circles above, and on the last hill Asterion the Storm Minotaur waits with his thunder axe.', art: 'img/bg-planets.webp', bg: 'img/bg-planets.webp', build() {
      const L = builder(212);
      L.ground(0, 16); L.ent('start', 2, 11);
      L.coins(5, 10, 3); L.ent('pegasus', 12, 5);
      L.ground(20, 44);
      L.field(24, 8, 11); L.ent('chiron', 30, 11); L.plat(33, 8, 3); L.ent('scroll', 34, 7, { i: 15 }); L.ent('anubis', 41, 11);
      L.plat(46, 9, 2, 'B');
      L.ground(49, 84); L.ent('check', 50, 11);
      L.ent('techno', 56, 11); L.ent('harpy', 60, 4); L.field(63, 7, 11); L.field(67, 7, 11); L.ent('colossus', 73, 11); L.box(77, 8, 'heart');
      L.ent('leviathan', 86, 11);
      L.ground(89, 120);
      L.plat(92, 8, 3); L.ent('archer', 93, 7); L.plat(96, 5, 3); L.ent('scroll', 97, 4, { i: 16 });
      L.ent('pegasus', 102, 5); L.ent('anubis', 107, 11); L.field(112, 8, 11); L.ent('chiron', 117, 11);
      L.ground(124, 212); L.ent('check', 125, 11);
      L.ent('minotaur', 132, 11); L.ent('chariot', 136, 3); L.field(140, 8, 11); L.field(143, 8, 11); L.field(146, 8, 11);
      L.plat(151, 8, 3); L.ent('scroll', 152, 7, { i: 17 }); L.box(156, 8, 'laurel'); L.ent('harpy', 162, 4); L.ent('anubis', 168, 11);
      L.ent('check', 180, 11);
      L.ent('xboss', 198, 11, { kind: 'stormtaur', minX: 186 });
      L.ent('flag', 207, 11, { hidden: true });
      return L;
    } },
    { name: 'The Gates of the Underworld', music: 'ch5', theme: 1, intro: 'Beneath Rome, glowing roots split the dark earth. Fire titans and clockwork spiders guard the descent, and at the gate itself Cerberus, the three-headed hound, breathes fire.', art: 'img/bg-underworld.webp', bg: 'img/bg-underworld.webp', build() {
      const L = builder(206);
      L.ground(0, 18); L.ent('start', 2, 11);
      L.coins(5, 10, 3); L.set(8, 8, 'B'); L.box(9, 8, 'coin'); L.set(10, 8, 'B'); L.ent('anubis', 15, 11);
      L.ground(22, 46);
      L.plat(25, 9, 3); L.ent('archer', 26, 8); L.plat(29, 6, 3); L.ent('scroll', 30, 5, { i: 18 });
      L.ent('harpy', 35, 4); L.ent('soldier', 38, 11); L.field(41, 8, 11);
      L.plat(47, 9, 2, 'B');
      L.ground(51, 84); L.ent('check', 52, 11);
      L.ent('titan', 60, 11); L.field(65, 8, 11); L.coins(67, 10, 3); L.box(71, 8, 'heart'); L.ent('harpy', 72, 4); L.ent('spider', 78, 11);
      L.ground(88, 92, 10); L.coins(89, 9, 3);
      L.ground(96, 130);
      L.plat(99, 8, 3); L.plat(103, 5, 3); L.ent('scroll', 104, 4, { i: 19 }); L.ent('archer', 100, 7);
      L.ent('titan', 109, 11); L.field(114, 8, 11); L.ent('harpy', 119, 4); L.ent('anubis', 125, 11);
      L.ground(134, 206); L.ent('check', 135, 11);
      L.ent('spider', 142, 11); L.plat(147, 8, 3); L.ent('scroll', 148, 7, { i: 20 }); L.box(152, 8, 'laurel'); L.ent('titan', 158, 11); L.ent('harpy', 163, 4);
      L.ent('check', 172, 11);
      L.ent('xboss', 192, 11, { kind: 'cerberus', minX: 178 });
      L.ent('flag', 201, 11, { hidden: true });
      return L;
    } },
    { name: 'The Kingdom of Pluto', music: 'ch6', theme: 2, intro: 'A river of stars above black mountains. Charon the Ferryman rows the lost souls past, and on his throne of shadow Pluto, King of the Underworld, raises the dead against you.', art: 'img/bg-pluto.webp', bg: 'img/bg-pluto.webp', build() {
      const L = builder(208);
      L.ground(0, 16); L.ent('start', 2, 11);
      L.coins(5, 10, 3); L.ent('charon', 13, 11);
      L.ground(20, 22); L.ground(26, 50);
      L.plat(29, 8, 3); L.ent('scroll', 30, 7, { i: 21 }); L.ent('harpy', 34, 4); L.field(38, 8, 11); L.ent('medusa', 44, 11);
      L.plat(51, 9, 2, 'B');
      L.ground(55, 90); L.ent('check', 56, 11);
      L.ent('charon', 63, 11); L.ent('pegasus', 66, 5); L.col(70, 10, 11); L.col(71, 10, 11); L.ent('titan', 77, 11); L.box(82, 8, 'heart'); L.ent('helios', 85, 5);
      L.ground(94, 98, 10);
      L.ground(102, 134);
      L.plat(105, 8, 3); L.ent('archer', 106, 7); L.plat(109, 5, 3); L.ent('scroll', 110, 4, { i: 22 });
      L.ent('harpy', 115, 4); L.ent('charon', 119, 11); L.field(124, 8, 11); L.ent('anubis', 129, 11);
      L.ground(138, 208); L.ent('check', 139, 11);
      L.ent('titan', 146, 11); L.plat(151, 8, 3); L.ent('scroll', 152, 7, { i: 23 }); L.box(156, 8, 'laurel'); L.ent('charon', 161, 11); L.ent('harpy', 165, 4);
      L.ent('check', 174, 11);
      L.ent('xboss', 194, 11, { kind: 'pluto', minX: 180 });
      L.ent('flag', 203, 11, { hidden: true });
      return L;
    } },
    { name: 'The Galvanic Forge', music: 'ch7', theme: 1, intro: 'Ball lightning rolls across the storm fields of the forge, where lightning is hammered into soldiers. Tesla Striders and Galvanic Gladiators walk its halls, and in the great cage the Roman Automaton, a forgotten machine of the empire, awakens.', art: 'img/bg-orbs.webp', bg: 'img/bg-orbs.webp', build() {
      const L = builder(208);
      L.ground(0, 20); L.ent('start', 2, 11);
      L.coins(5, 10, 3); L.box(8, 8, 'coin'); L.set(9, 8, 'B'); L.box(10, 8, 'coin'); L.ent('spider', 16, 11);
      L.ground(24, 50);
      L.field(27, 8, 11); L.plat(30, 8, 3); L.ent('scroll', 31, 7, { i: 24 }); L.ent('strider', 37, 11); L.field(42, 8, 11); L.ent('helios', 45, 5);
      L.plat(51, 9, 2, 'B');
      L.ground(55, 90); L.ent('check', 56, 11);
      L.ent('techno', 62, 11); L.field(66, 8, 11); L.field(69, 8, 11); L.ent('strider', 75, 11); L.box(80, 8, 'heart'); L.ent('harpy', 83, 4);
      L.ground(94, 98, 10); L.coins(95, 9, 3);
      L.ground(102, 136);
      L.plat(105, 8, 3); L.plat(109, 5, 3); L.ent('scroll', 110, 4, { i: 25 }); L.ent('archer', 106, 7);
      L.ent('spider', 115, 11); L.field(120, 8, 11); L.ent('galvanic', 125, 11); L.ent('helios', 128, 5); L.ent('strider', 132, 11);
      L.ground(140, 208); L.ent('check', 141, 11);
      L.field(146, 8, 11); L.field(149, 8, 11); L.plat(153, 8, 3); L.ent('scroll', 154, 7, { i: 26 }); L.box(158, 8, 'laurel'); L.ent('galvanic', 163, 11); L.ent('spider', 168, 11);
      L.ent('check', 175, 11);
      L.ent('boss', 194, 11, { minX: 181 });
      L.ent('flag', 203, 11, { hidden: true });
      return L;
    } },
    { name: 'The Edge of Eternity', music: 'ch8', theme: 2, intro: 'Rome beneath a spiral of stars, at the end of all roads. Every foe of the quest returns here, and at the summit three knights hold the last road: the Templar Crusader, the Golden King and the Black Knight.', art: 'img/card-bust.webp', bg: 'img/bg-eternity.webp', build() {
      const L = builder(224);
      L.ground(0, 16); L.ent('start', 2, 11);
      L.coins(5, 10, 3); L.ent('pegasus', 12, 5);
      L.ground(20, 46);
      L.field(24, 8, 11); L.ent('charon', 30, 11); L.plat(33, 8, 3); L.ent('scroll', 34, 7, { i: 27 }); L.ent('anubis', 41, 11);
      L.plat(47, 9, 2, 'B');
      L.ground(51, 86); L.ent('check', 52, 11);
      L.ent('galvanic', 58, 11); L.ent('chariot', 62, 3); L.field(65, 7, 11); L.field(69, 7, 11); L.ent('titan', 75, 11); L.box(79, 8, 'heart'); L.ent('harpy', 82, 4);
      L.ent('leviathan', 88, 11);
      L.ground(91, 124);
      L.plat(94, 8, 3); L.ent('archer', 95, 7); L.plat(98, 5, 3); L.ent('scroll', 99, 4, { i: 28 });
      L.ent('spider', 105, 11); L.ent('stormtaur', 111, 11); L.field(116, 8, 11); L.ent('chiron', 121, 11);
      L.ground(128, 224); L.ent('check', 129, 11);
      L.ent('colossus', 136, 11); L.ent('chariot', 140, 3); L.field(144, 8, 11); L.field(147, 8, 11); L.ent('charon', 152, 11);
      L.plat(157, 8, 3); L.ent('scroll', 158, 7, { i: 29 }); L.box(162, 8, 'laurel'); L.ent('strider', 167, 11); L.ent('harpy', 171, 4); L.ent('anubis', 177, 11);
      L.ent('check', 190, 11);
      L.ent('xboss', 212, 11, { kind: 'templar', minX: 198, next: ['king', 'blackknight'] });
      L.ent('flag', 219, 11, { hidden: true });
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
      ensure, get ac() { return ac; }, get on() { return on; }, toggle() { on = !on; store.set('aq-sound', on); return on; },
      jump: () => tone(300, 620, 0.14, 'square', 0.05), coin: () => { tone(880, 880, 0.06, 'square', 0.05); tone(1320, 1320, 0.12, 'square', 0.05, 0.06); },
      slash: () => noise(0.12, 0.08, 2500), hit: () => tone(220, 90, 0.15, 'sawtooth', 0.07), stomp: () => tone(500, 120, 0.12, 'square', 0.07),
      hurt: () => tone(330, 110, 0.35, 'sawtooth', 0.08), bump: () => tone(140, 90, 0.08, 'square', 0.06), zap: () => noise(0.18, 0.04, 4000),
      scroll: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.12, 'triangle', 0.07, i * 0.08)),
      power: () => [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, f * 1.01, 0.1, 'square', 0.05, i * 0.06)),
      win: () => [523, 523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.16, 'triangle', 0.08, i * 0.13)),
      boss: () => tone(90, 60, 0.6, 'sawtooth', 0.09),
    };
  })();

  /* ================= music: original rock themes synthesized live, plus Marcos's own recordings ================= */
  const MUSIC = (() => {
    let on = store.get('aq-music') !== false, ac = null, master = null, crunch = null, gtrL = null, gtrR = null, leadBus = null, noise = null, timer = null, track = null, name = '', step = 0, nextT = 0, running = false;
    const NOTE = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
    const hz = (s) => { const m = /^([A-G][#b]?)(\d)$/.exec(s); return 440 * Math.pow(2, (NOTE[m[1]] + (+m[2] + 1) * 12 - 69) / 12); };
    const seq = (str) => { const t = str.trim().split(/\s+/), out = new Array(t.length).fill(null); t.forEach((x, i) => { if (x === '-' || x === '.') return; let d = 1; while (t[i + d] === '-') d++; out[i] = { f: hz(x), d }; }); return out; };
    const ch = (s) => s.split(' ').map(hz);
    const T = {
      // Chapter I: a heroic charge in D minor (i, VI, III, VII)
      ch1: { bpm: 136, wave: 'square', leadVol: 0.065, harm: 0.03, bass: 'octave', pad: 0.03, arp: 2, arpWave: 'triangle', arpVol: 0.03, chug: 'O...o.o.O...o.o.', crash: true, rockPower: 0.034,
        kick: [0, 4, 8, 12], snare: [4, 12], hat: [2, 6, 10, 14], tick: true, fill: true,
        chords: [ch('D3 F3 A3'), ch('Bb2 D3 F3'), ch('F3 A3 C4'), ch('C3 E3 G3')],
        lead: [seq('D5 - D5 - A4 - D5 - F5 - E5 - D5 - C5 - Bb4 - D5 - F5 - Bb5 - A5 - - - F5 - - - F5 - A5 - C6 - A5 - G5 - F5 - E5 - C5 - E5 - G5 - - - F5 - E5 - C5 - - - - -'),
               seq('A5 - - - G5 - F5 - G5 - A5 - - - D5 - F5 - - - E5 - D5 - E5 - F5 - - - Bb4 - C5 - F5 - A5 - C6 - Bb5 - A5 - G5 - F5 - G5 - - - A5 - - - C6 - - - A5 - G5 -')] },
      // Chapter II: the laboratory, an electric dance in E Phrygian dominant
      ch2: { bpm: 140, wave: 'square', leadVol: 0.055, harm: 0.025, bass: 'octave', arp: 1, arpWave: 'square', arpVol: 0.026, chug: 'o.o.o.o.o.o.o.o.', crash: true, rockPower: 0.034,
        kick: [0, 4, 8, 12], snare: [4, 12], hat: [2, 6, 10, 14], tick: true, fill: true,
        chords: [ch('E3 G#3 B3'), ch('F3 A3 C4'), ch('E3 G#3 B3'), ch('D3 F3 A3')],
        lead: [seq('E5 - E5 - G#5 - B5 - A5 - G#5 - F5 - E5 - F5 - A5 - C6 - A5 - G#5 - - - E5 - - - E5 - G#5 - B5 - E6 - D6 - C6 - B5 - A5 - F5 - E5 - D5 - F5 - E5 - - - - - - -'),
               seq('B5 - - - A5 - G#5 - A5 - B5 - - - E5 - C6 - - - B5 - A5 - B5 - C6 - - - F5 - G#5 - B5 - E6 - B5 - G#5 - B5 - E6 - F6 - E6 - D6 - C6 - B5 - A5 - G#5 - F5 - E5 -')] },
      // Chapter III: the cosmos, soaring and bright in A minor (i, VI, III, VII)
      ch3: { bpm: 128, wave: 'triangle', leadVol: 0.085, harm: 0.035, bass: 'octave', pad: 0.04, arp: 1, arpWave: 'sine', arpVol: 0.03, chug: 'O.......O.......', crash: true, rockPower: 0.034,
        kick: [0, 4, 8, 12], snare: [4, 12], hat: [2, 6, 10, 14], tick: true, fill: true,
        chords: [ch('A2 C3 E3'), ch('F2 A2 C3'), ch('C3 E3 G3'), ch('G2 B2 D3')],
        lead: [seq('E5 - A5 - C6 - B5 - A5 - - - E5 - G5 - F5 - - - E5 - C5 - A4 - C5 - - - - - G5 - C6 - E6 - D6 - C6 - - - G5 - E5 - D5 - G5 - B5 - A5 - G5 - - - - - - -'),
               seq('A5 - - - C6 - - - B5 - A5 - G5 - E5 - F5 - A5 - C6 - A5 - F5 - - - C5 - - - E5 - G5 - C6 - G5 - E6 - - - D6 - C6 - B5 - - - D6 - - - G5 - A5 - B5 - D6 -')] },
      // Chapter VI: storm over the hills, driving G minor
      ch4: { bpm: 144, wave: 'square', leadVol: 0.06, harm: 0.028, bass: 'octave', pad: 0.025, arp: 2, arpWave: 'triangle', arpVol: 0.03, chug: 'O...x.x.O.x.x.x.', crash: true, rockPower: 0.034,
        kick: [0, 4, 8, 10, 12], snare: [4, 12], hat: [2, 6, 10, 14], tick: true, fill: true,
        chords: [ch('G2 Bb2 D3'), ch('Eb3 G3 Bb3'), ch('Bb2 D3 F3'), ch('F3 A3 C4')],
        lead: [seq('G5 - Bb5 - D6 - Bb5 - G5 - - - D5 - G5 - Eb5 - G5 - Bb5 - G5 - Eb5 - - - Bb4 - Eb5 - D5 - F5 - Bb5 - A5 - G5 - F5 - D5 - F5 - C5 - F5 - A5 - C6 - A5 - - - - - - -'),
               seq('D6 - - - C6 - Bb5 - A5 - G5 - - - D5 - Eb6 - - - D6 - C6 - Bb5 - G5 - - - Eb5 - F5 - Bb5 - D6 - F6 - D6 - Bb5 - F5 - D5 - F5 - A5 - C6 - F6 - E6 - C6 - A5 - F5 -')] },
      // Chapter VII: the Underworld gate, dark and pounding E minor
      ch5: { bpm: 132, wave: 'sawtooth', leadVol: 0.05, harm: 0.03, bass: 'gallop', pad: 0.035, arp: 2, arpWave: 'square', arpVol: 0.022, chug: 'O.x.x.x.O.x.x.x.', crash: true, rockPower: 0.034,
        kick: [0, 4, 6, 8, 12], snare: [4, 12], hat: [2, 6, 10, 14], tick: true, fill: true,
        chords: [ch('E3 G3 B3'), ch('C3 E3 G3'), ch('D3 F#3 A3'), ch('B2 D#3 F#3')],
        lead: [seq('E5 - - - B4 - E5 - G5 - F#5 - E5 - D#5 - E5 - G5 - C6 - B5 - A5 - G5 - E5 - - - D5 - F#5 - A5 - D6 - C6 - A5 - F#5 - A5 - B4 - D#5 - F#5 - B5 - A5 - F#5 - D#5 - B4 -'),
               seq('B5 - - - A5 - G5 - F#5 - G5 - A5 - B5 - C6 - - - B5 - A5 - G5 - E5 - G5 - C6 - D6 - - - C6 - B5 - A5 - F#5 - D5 - F#5 - D#6 - - - B5 - - - F#5 - - - D#5 - - -')] },
      // Chapter VIII: the Kingdom of Pluto, haunting B minor with a big pad
      ch6: { bpm: 126, wave: 'triangle', leadVol: 0.085, harm: 0.03, bass: 'octave', pad: 0.045, arp: 1, arpWave: 'sine', arpVol: 0.03, chug: 'O.......O...x.x.', crash: true, rockPower: 0.034,
        kick: [0, 4, 8, 12], snare: [4, 12], hat: [2, 6, 10, 14], tick: true, fill: true,
        chords: [ch('B2 D3 F#3'), ch('G2 B2 D3'), ch('D3 F#3 A3'), ch('A2 C#3 E3')],
        lead: [seq('F#5 - B5 - D6 - C#6 - B5 - - - F#5 - - - G5 - B5 - D6 - B5 - G5 - - - D5 - - - A5 - F#5 - D5 - F#5 - A5 - D6 - F#6 - D6 - E6 - C#6 - A5 - E5 - A5 - C#6 - E6 - - -'),
               seq('D6 - - - C#6 - B5 - C#6 - D6 - F#6 - - - G6 - - - F#6 - E6 - D6 - B5 - G5 - - - F#6 - - - E6 - D6 - A5 - F#5 - A5 - D6 - E6 - - - C#6 - A5 - E5 - - - A5 - - -')] },
      // Chapter IX: the Galvanic Forge, fast hammering F# minor
      ch7: { bpm: 150, wave: 'square', leadVol: 0.055, harm: 0.026, bass: 'gallop', arp: 1, arpWave: 'square', arpVol: 0.024, chug: 'xxxxO.xxxxxxO.xx', crash: true, rockPower: 0.034,
        kick: [0, 4, 8, 12, 14], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14], tick: true, fill: true,
        chords: [ch('F#3 A3 C#4'), ch('D3 F#3 A3'), ch('E3 G#3 B3'), ch('C#3 F3 G#3')],
        lead: [seq('F#5 F#5 - F#5 A5 - C#6 - F#5 F#5 - F#5 E5 - C#5 - D5 D5 - D5 F#5 - A5 - D6 - C#6 - A5 - F#5 - E5 E5 - E5 G#5 - B5 - E6 - D6 - B5 - G#5 - C#5 - F5 - G#5 - C#6 - B5 - G#5 - F5 - C#5 -'),
               seq('C#6 - - - B5 - A5 - G#5 - A5 - B5 - C#6 - D6 - - - C#6 - B5 - A5 - F#5 - A5 - D6 - E6 - - - D6 - C#6 - B5 - G#5 - B5 - E6 - F6 - - - C#6 - - - G#5 - - - F5 - - -')] },
      // Chapter X: the Edge of Eternity, a heroic finale in D major
      ch8: { bpm: 138, wave: 'square', leadVol: 0.06, harm: 0.03, bass: 'octave', pad: 0.04, arp: 2, arpWave: 'triangle', arpVol: 0.03, chug: 'O...o.o.O...o.o.', crash: true, rockPower: 0.034,
        kick: [0, 4, 8, 12], snare: [4, 12], hat: [2, 6, 10, 14], tick: true, fill: true,
        chords: [ch('D3 F#3 A3'), ch('A2 C#3 E3'), ch('B2 D3 F#3'), ch('G2 B2 D3')],
        lead: [seq('D5 - F#5 - A5 - D6 - - - A5 - F#5 - A5 - C#6 - - - A5 - E5 - A5 - C#6 - E6 - - - D6 - - - B5 - F#5 - B5 - D6 - F#6 - - - G6 - F#6 - E6 - D6 - B5 - D6 - E6 - - -'),
               seq('F#6 - - - E6 - D6 - E6 - F#6 - A6 - - - E6 - - - C#6 - A5 - C#6 - E6 - A6 - - - F#6 - - - D6 - B5 - D6 - F#6 - B6 - - - G6 - - - F#6 - E6 - D6 - E6 - F#6 - G6 -')] },
      // The knights' gauntlet: a galloping A minor battle theme
      knights: { bpm: 172, wave: 'sawtooth', leadVol: 0.045, harm: 0.022, bass: 'gallop', pad: 0.02, arp: 2, arpWave: 'square', arpVol: 0.022, chug: 'xxxxO.xxxxxxO.xx', crash: true, rockPower: 0.045,
        kick: [0, 3, 4, 8, 11, 12], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14], tick: true, fill: true,
        chords: [ch('A2 C3 E3'), ch('F2 A2 C3'), ch('G2 B2 D3'), ch('E3 G#3 B3')],
        lead: [seq('A5 - C6 - E6 - C6 - A5 - E5 - A5 - B5 - C6 - A5 - F5 - A5 - C6 - - - D6 - - - B5 - G5 - D5 - G5 - B5 - D6 - G6 - - - G#5 - E5 - B4 - E5 - G#5 - B5 - E6 - - -'),
               seq('E6 - - - D6 - C6 - B5 - - - A5 - - - F6 - - - E6 - D6 - C6 - - - A5 - - - G6 - - - F6 - E6 - D6 - - - B5 - - - G#6 - - - E6 - - - B5 - - - G#5 - - -')] },
      // Riot: the punk track from the music-video teaser (E, E, A, G power chords at 168 BPM), now the boss-battle theme
      riot: { bpm: 168, wave: 'square', leadVol: 0, harm: 0, bass: 'octave', pad: 0, arp: 0, power: 0.05, dist: true, chug: 'o.o.o.o.o.o.o.o.', crash: true,
        kick: [0, 4, 8, 12], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14], tick: false, fill: true,
        chords: [ch('E2 B2 E3'), ch('E2 B2 E3'), ch('A2 E3 A3'), ch('G2 D3 G3')],
        lead: [seq('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -')] },
      // Legion Riot: fast E punk, distorted power chords and a shout-along hook
      legion: { bpm: 180, wave: 'square', leadVol: 0.05, harm: 0.02, bass: 'octave', pad: 0, arp: 0, power: 0.045, dist: true, chug: 'o.o.o.o.o.o.o.o.', crash: true,
        kick: [0, 4, 8, 10, 12], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14], tick: false, fill: true,
        chords: [ch('E2 B2 E3'), ch('C3 G3 C4'), ch('G2 D3 G3'), ch('D3 A3 D4')],
        lead: [seq('E5 - - - E5 - G5 - - - E5 - D5 - B4 - C5 - - - C5 - E5 - - - G5 - E5 - C5 - D5 - - - B4 - D5 - G5 - - - F#5 - G5 - A5 - - - - - F#5 - D5 - - - - - - -'),
               seq('B5 - B5 - B5 - A5 - G5 - - - E5 - - - G5 - G5 - G5 - E5 - C5 - - - E5 - - - D6 - - - B5 - G5 - D5 - G5 - B5 - D6 - C6 - - - B5 - - - A5 - - - F#5 - - -')] },
      // Colosseum Crash: A punk, the crowd's chant on top
      arena: { bpm: 176, wave: 'square', leadVol: 0.05, harm: 0.02, bass: 'octave', pad: 0, arp: 0, power: 0.045, dist: true, chug: 'O...o.o.O...o.o.', crash: true,
        kick: [0, 3, 8, 11], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14], tick: false, fill: true,
        chords: [ch('A2 E3 A3'), ch('F2 C3 F3'), ch('C3 G3 C4'), ch('G2 D3 G3')],
        lead: [seq('A5 - A5 - C6 - A5 - E5 - - - A5 - C6 - C6 - - - A5 - F5 - - - A5 - C6 - A5 - G5 - - - E5 - G5 - C6 - - - E6 - D6 - D6 - - - B5 - - - G5 - - - - - - -'),
               seq('E6 - - - E6 - D6 - C6 - - - A5 - - - F6 - - - E6 - C6 - A5 - - - F5 - - - E6 - D6 - C6 - G5 - E6 - D6 - C6 - G5 - B5 - - - D6 - - - G6 - - - - - - -')] },
      // Gladiator Stomp: heavy D minor rock with a swinging kick
      stomp: { bpm: 150, wave: 'sawtooth', leadVol: 0.045, harm: 0.02, bass: 'octave', pad: 0, arp: 0, power: 0.05, dist: true, chug: 'O...x.x.O.x.x.x.', crash: true,
        kick: [0, 3, 8, 11], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14], tick: false, fill: true,
        chords: [ch('D2 A2 D3'), ch('Bb2 F3 Bb3'), ch('C3 G3 C4'), ch('A2 E3 A3')],
        lead: [seq('D5 - - - F5 - - - A5 - G5 - F5 - E5 - D5 - - - - - - - Bb4 - D5 - F5 - - - E5 - - - G5 - - - C6 - Bb5 - G5 - E5 - C#5 - - - E5 - - - A5 - - - - - - -'),
               seq('A5 - - - A5 - G5 - F5 - - - D5 - F5 - Bb5 - - - A5 - F5 - D5 - - - - - - - C6 - - - Bb5 - G5 - E5 - G5 - C6 - E6 - E6 - - - C#6 - - - A5 - - - E5 - - -')] },
      // Hellfire Thrash: the Hades finale, E minor at full gallop
      hellfire: { bpm: 192, wave: 'sawtooth', leadVol: 0.042, harm: 0.02, bass: 'gallop', pad: 0, arp: 0, power: 0.045, dist: true, chug: 'xxxxO.xxxxxxO.xx', crash: true,
        kick: [0, 3, 4, 8, 11, 12], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14], tick: false, fill: true,
        chords: [ch('E2 B2 E3'), ch('G2 D3 G3'), ch('A2 E3 A3'), ch('B2 F#3 B3')],
        lead: [seq('E5 - G5 - B5 - E6 - D6 - B5 - G5 - B5 - D6 - - - B5 - G5 - D5 - G5 - B5 - D6 - E6 - - - C#6 - A5 - E5 - A5 - C#6 - E6 - D#6 - - - B5 - - - F#5 - - - D#5 - - -'),
               seq('B5 - - - - - G5 - E5 - - - - - - - G5 - - - B5 - - - D6 - - - G6 - - - A5 - - - C#6 - - - E6 - - - A6 - - - F#6 - - - D#6 - - - B5 - - - F#5 - - -')] },
      // Gods of the Machine: mid-tempo hard-rock anthem in G (the select-screen theme)
      machine: { bpm: 140, wave: 'sawtooth', leadVol: 0.045, harm: 0.02, bass: 'octave', pad: 0, arp: 0, power: 0.045, dist: true, chug: 'O.....x.O...x.x.', crash: true,
        kick: [0, 8, 10], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14], tick: false, fill: true,
        chords: [ch('G2 D3 G3'), ch('D3 A3 D4'), ch('E2 B2 E3'), ch('C3 G3 C4')],
        lead: [seq('G5 - - - B5 - D6 - - - B5 - G5 - - - F#5 - - - A5 - D6 - - - A5 - F#5 - - - E5 - - - G5 - B5 - - - E6 - D6 - B5 - C6 - - - - - B5 - A5 - - - G5 - - -'),
               seq('D6 - D6 - D6 - B5 - G5 - - - D6 - - - D6 - D6 - E6 - F#6 - A6 - - - F#6 - - - G6 - - - F#6 - E6 - B5 - - - E6 - - - E6 - - - D6 - C6 - B5 - - - G5 - - -')] },
      // Sack of Rome: 200 BPM d-beat punk in A
      sack: { bpm: 200, wave: 'square', leadVol: 0.048, harm: 0.02, bass: 'octave', pad: 0, arp: 0, power: 0.045, dist: true, chug: 'o.o.o.o.o.o.o.o.', crash: true,
        kick: [0, 3, 8, 11], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14], tick: false, fill: true,
        chords: [ch('A2 E3 A3'), ch('F#2 C#3 F#3'), ch('D3 A3 D4'), ch('E2 B2 E3')],
        lead: [seq('A5 - - - C#6 - E6 - - - C#6 - A5 - E5 - F#5 - - - A5 - C#6 - - - A5 - F#5 - C#5 - D5 - F#5 - A5 - D6 - F#6 - - - E6 - D6 - E6 - - - - - - - B5 - G#5 - E5 - - -'),
               seq('E6 - E6 - E6 - - - C#6 - - - A5 - - - C#6 - C#6 - C#6 - - - A5 - - - F#5 - - - A5 - - - D6 - - - F#6 - - - A6 - - - G#6 - - - E6 - - - B5 - - - G#5 - - -')] },
      // Bosses: fast and furious C minor
      boss: { bpm: 166, wave: 'sawtooth', leadVol: 0.045, harm: 0.022, bass: 'gallop', pad: 0, arp: 2, arpWave: 'square', arpVol: 0.022, chug: 'O.xxO.xxO.xxO.x.', crash: true, rockPower: 0.045,
        kick: [0, 3, 4, 8, 11, 12], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14], tick: true, fill: true,
        chords: [ch('C3 Eb3 G3'), ch('Ab2 C3 Eb3'), ch('Bb2 D3 F3'), ch('G2 B2 D3')],
        lead: [seq('C5 - Eb5 - G5 - Eb5 - C5 - G4 - C5 - D5 - Eb5 - C5 - Ab4 - C5 - Eb5 - - - F5 - G5 - F5 - D5 - Bb4 - D5 - F5 - - - Eb5 - D5 - D5 - B4 - G4 - B4 - D5 - - - - - - -'),
               seq('G5 - - - F5 - Eb5 - D5 - - - C5 - - - Ab5 - - - G5 - F5 - Eb5 - - - C5 - - - Bb5 - - - Ab5 - G5 - F5 - - - D5 - - - B5 - - - G5 - - - D5 - - - B4 - - -')] },
    };
    Object.values(T).forEach((t) => t.lead.forEach((l) => { if (l.length !== 64) console.warn('music pattern length', l.length); }));
    function init() {
      if (ac) return true; ac = SFX.ac; if (!ac) return false;
      master = ac.createGain(); master.gain.value = 0;
      const glue = ac.createDynamicsCompressor(); glue.threshold.value = -16; glue.knee.value = 8; glue.ratio.value = 4; glue.attack.value = 0.004; glue.release.value = 0.16;   // band glue, like a rock mix bus
      const make = ac.createGain(); make.gain.value = 0.8; master.connect(glue).connect(make).connect(ac.destination);
      // guitar crunch: power chords run through a soft-clip waveshaper, then a cabinet-style lowpass
      const amp = (drive, tone, level, pan) => {   // one guitar rig: soft-clip amp, mid-scooped cabinet, panned
        const sh = ac.createWaveShaper(), cv = new Float32Array(2048); for (let i = 0; i < 2048; i++) { const x = i / 1023.5 - 1; cv[i] = Math.tanh(x * drive) * 0.62; } sh.curve = cv; sh.oversample = '4x';
        const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 70;
        const mid = ac.createBiquadFilter(); mid.type = 'peaking'; mid.frequency.value = 700; mid.Q.value = 0.8; mid.gain.value = -4;
        const pres = ac.createBiquadFilter(); pres.type = 'peaking'; pres.frequency.value = 2400; pres.Q.value = 1; pres.gain.value = 3;
        const cab = ac.createBiquadFilter(); cab.type = 'lowpass'; cab.frequency.value = tone; cab.Q.value = 0.9;
        const g = ac.createGain(); g.gain.value = level; let out = sh.connect(hp).connect(mid).connect(pres).connect(cab).connect(g);
        if (ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = pan; out = out.connect(p); } out.connect(master); return sh; };
      crunch = amp(6, 3200, 0.55, 0); gtrL = amp(9, 3600, 0.55, -0.7); gtrR = amp(9, 3400, 0.55, 0.7); leadBus = amp(14, 4200, 0.34, 0.08);
      noise = ac.createBuffer(1, ac.sampleRate * 0.3, ac.sampleRate); const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      return true;
    }
    function env(g, t, a, peak, hold, rel) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.setValueAtTime(peak, t + a + hold); g.gain.exponentialRampToValueAtTime(0.0001, t + a + hold + rel); }
    function voice(f, t, dur, wave, vol, cutoff, a = 0.01, rel = 0.08, dest = master) {
      const o = ac.createOscillator(), g = ac.createGain(); o.type = wave; o.frequency.setValueAtTime(f, t);
      let out = o; if (cutoff) { const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = cutoff; o.connect(lp); out = lp; }
      out.connect(g); g.connect(dest); env(g, t, a, vol, Math.max(0.01, dur - a), rel); o.start(t); o.stop(t + dur + rel + 0.05);
    }
    function lead(f, t, dur, vol) {   // distorted lead guitar: saw through the lead amp, vibrato that blooms on long notes
      const o = ac.createOscillator(), g = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f * 0.985, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.03);
      lfo.frequency.value = 5.6; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(dur > 0.25 ? f * 0.012 : 0, t + Math.min(dur, 0.35)); lfo.connect(lg).connect(o.frequency);
      o.connect(g); g.connect(leadBus); env(g, t, 0.006, vol, Math.max(0.01, dur - 0.006), 0.09); o.start(t); o.stop(t + dur + 0.15); lfo.start(t); lfo.stop(t + dur + 0.15);
    }
    function strum(root, t, dur, vol, muted) {   // a power chord on two double-tracked guitars; palm mutes are short and dark
      [[gtrL, 1], [gtrR, 1.0045]].forEach(([bus, dt], k) => [1, 1.5, 2].forEach((r, j) => voice(root * r * dt, t + k * 0.004 + j * 0.003, dur, 'sawtooth', vol * (j === 2 ? 0.7 : 1), muted ? 650 : 0, 0.002, muted ? 0.03 : 0.07, bus)));
    }
    function drum(kind, t, v = 1) {
      if (kind === 't') { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(v, t); o.frequency.exponentialRampToValueAtTime(v * 0.55, t + 0.18); g.gain.setValueAtTime(0.4, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22); o.connect(g).connect(master); o.start(t); o.stop(t + 0.24); return; }
      if (kind === 'k') { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12); g.gain.setValueAtTime(0.55, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16); o.connect(g).connect(master); o.start(t); o.stop(t + 0.18); return; }
      const n = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); n.buffer = noise;
      const P = { s: [1500, 0.12, 0.17, 'highpass'], h: [8000, 0.03, 0.035, 'highpass'], o: [6500, 0.09, 0.05, 'highpass'], c: [5000, 0.28, 0.07, 'highpass'] }[kind];
      f.type = P[3]; f.frequency.value = P[0]; g.gain.setValueAtTime(P[2] * v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + P[1]);
      n.connect(f).connect(g).connect(master); n.start(t); n.stop(t + P[1] + 0.02);
      if (kind === 's') { const o = ac.createOscillator(), g2 = ac.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(140, t + 0.06); g2.gain.setValueAtTime(0.08 * v, t); g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.08); o.connect(g2).connect(master); o.start(t); o.stop(t + 0.1); }
    }
    function schedule(s, t) {
      const tr = track, sd = 60 / tr.bpm / 4, len = tr.lead[0].length, i = s % len, sec = Math.floor(s / len) % tr.lead.length, bar = Math.floor(i / 16), b = i % 16, c = tr.chords[bar % tr.chords.length];
      const n = tr.lead[sec][i];
      if (n && tr.dist && tr.leadVol) lead(n.f, t, n.d * sd * 0.92, tr.leadVol * 1.5);
      else if (n) { const cut = tr.wave === 'sawtooth' ? 2600 : tr.wave === 'square' ? 3400 : 0; voice(n.f, t, n.d * sd * 0.9, tr.wave, tr.leadVol, cut, 0.008, 0.1); if (tr.harm) voice(n.f / 2, t, n.d * sd * 0.9, 'square', tr.harm, 1600, 0.008, 0.1); }
      const root = c[0] / 2;
      if (tr.chug) { const pc = tr.chug[b]; if (pc !== '.') { let d = 1; while (b + d < 16 && tr.chug[b + d] === '.') d++; strum(c[0] > 160 ? c[0] / 2 : c[0], t, pc === 'O' ? sd * d * 0.95 : pc === 'o' ? sd * Math.min(d, 2) * 0.8 : sd * 0.55, (tr.power || tr.rockPower) * (pc === 'x' ? 1.5 : 1.25), pc === 'x'); } }
      else if (tr.power && b % 2 === 0) { if (tr.dist) [1, 1.5, 2, 1.006, 0.996].forEach((r) => voice(c[0] * r, t, sd * 1.8, 'sawtooth', tr.power * 2.2, 0, 0.003, 0.04, crunch)); else [1, 1.5, 2, 1.004].forEach((r) => voice(c[0] * r, t, sd * 1.9, 'square', tr.power, 2200, 0.004, 0.05)); }
      if (tr.bass === 'octave' && b % 2 === 0) voice((b / 2) % 2 ? root * 2 : root, t, sd * 0.85, 'sawtooth', 0.085, 900, 0.005, 0.05);
      if (tr.bass === 'gallop' && (b % 4 !== 1)) voice(b % 4 === 0 ? root : root * 2, t, sd * 0.8, 'sawtooth', 0.085, 1000, 0.004, 0.04);
      if (tr.pad && b === 0) c.forEach((f) => { voice(f * 2, t, sd * 15, 'sawtooth', tr.pad / 2, 1300, 0.08, 0.4); voice(f * 2 * 1.007, t, sd * 15, 'sawtooth', tr.pad / 2, 1300, 0.08, 0.4); });
      if (tr.arp && b % tr.arp === 0) { const k = (b / tr.arp) % 4, tones = [c[0], c[1], c[2], c[1]]; voice(tones[k] * 4, t, sd * tr.arp * 0.55, tr.arpWave, tr.arpVol, 0, 0.004, 0.12); }
      const filling = tr.fill && bar % 4 === 3 && sec === tr.lead.length - 1 && b >= 12;
      if (tr.kick.includes(b)) drum('k', t);
      if (filling && tr.dist) drum('t', t, [210, 170, 135, 105][b - 12]);
      else if (filling) drum('s', t, 0.55 + (b - 12) * 0.15);
      else if (tr.snare.includes(b)) drum('s', t);
      if (tr.hat.includes(b)) drum('o', t);
      if (tr.tick) drum('h', t, b % 2 ? 0.5 : 0.8);
      if ((bar === 0 && b === 0 && sec === 0) || (tr.crash && b === 0 && bar % 4 === 0)) drum('c', t);
    }
    // Marcos's own recordings: decoded once, looped sample-accurately (the loop points sit on the downbeat; a one-beat crossfade is baked into the file)
    const SONGS = {
      acta: { src: '../fight/music/acta-non-verba.mp3?v=2', loopStart: 31.37, loopEnd: 95.3738, vol: 1.0 },   // Acta Non Verba (instrumental): intro plays once, then 0:31-1:35 loops
      ego: { src: '../fight/music/ego-death.mp3?v=2', loopStart: 16.625, loopEnd: 66.2807, vol: 1.0 },           // Ego Death (instrumental): 0:16-1:06 loops
    };
    const songBuf = {}; let songSrc = null, songGain = null, songPos = 0, songAt = 0, songName = '';
    function songLoad(n) { const S = SONGS[n]; if (!songBuf[n]) songBuf[n] = fetch(S.src).then((r) => r.arrayBuffer()).then((ab) => new Promise((res, rej) => ac.decodeAudioData(ab, res, rej))).catch(() => { delete songBuf[n]; return null; }); return songBuf[n]; }
    function songWhere() { const S = SONGS[songName]; let p = songPos + (ac.currentTime - songAt); if (S && p > S.loopEnd) p = S.loopStart + (p - S.loopStart) % (S.loopEnd - S.loopStart); return p; }
    function songHalt(keep) { if (songSrc) { if (keep) songPos = songWhere(); const s0 = songSrc; songGain.gain.cancelScheduledValues(ac.currentTime); songGain.gain.setTargetAtTime(0, ac.currentTime, 0.06); setTimeout(() => { try { s0.stop(); } catch { /* already stopped */ } }, 300); songSrc = null; } if (!keep) songPos = 0; }
    function songStart() {
      if (!on || !init()) return; const n = name, S = SONGS[n]; if (!S) return;
      if (!songGain) { songGain = ac.createGain(); songGain.gain.value = 0; songGain.connect(ac.destination); }
      songLoad(n).then((buf) => {
        if (!buf || name !== n || !on || songSrc || paused) return;
        const src = ac.createBufferSource(); src.buffer = buf; src.loop = true; src.loopStart = S.loopStart; src.loopEnd = S.loopEnd; src.connect(songGain);
        const t = ac.currentTime + 0.05; src.start(t, songPos); songAt = t; songName = n; songSrc = src;
        songGain.gain.cancelScheduledValues(ac.currentTime); songGain.gain.setValueAtTime(0.0001, ac.currentTime); songGain.gain.setTargetAtTime(S.vol, t, 0.08);
      });
    }
    let paused = false;
    function tick() { if (!running || !track) return; while (nextT < ac.currentTime + 0.15) { schedule(step, nextT); nextT += 60 / track.bpm / 4; step++; } }
    function start() { if (!on || !track || !init()) return; running = true; clearInterval(timer); nextT = Math.max(nextT, ac.currentTime + 0.05); timer = setInterval(tick, 25);
      master.gain.cancelScheduledValues(ac.currentTime); master.gain.setTargetAtTime(['boss', 'knights', 'riot', 'legion', 'arena', 'stomp', 'hellfire', 'machine', 'sack'].includes(name) ? 0.36 : 0.34, ac.currentTime, 0.25); }
    function halt(fade = 0.15) { running = false; clearInterval(timer); if (master) { master.gain.cancelScheduledValues(ac.currentTime); master.gain.setTargetAtTime(0, ac.currentTime, fade); } }
    return {
      get on() { return on; },
      play(n) {
        paused = false;
        if (SONGS[n]) { if (name === n && songSrc) return; halt(0.2); songHalt(false); name = n; track = null; songStart(); return; }
        if (name === n && running) return; songHalt(false); name = n; track = T[n]; step = 0; if (ac) nextT = ac.currentTime + 0.3; start();
      },
      pause() { paused = true; halt(0.08); if (ac) songHalt(true); },
      resume() { paused = false; if (SONGS[name]) songStart(); else if (track) { if (ac) nextT = ac.currentTime + 0.1; start(); } },
      stop() { halt(0.4); if (ac) songHalt(false); name = ''; },
      toggle() { on = !on; store.set('aq-music', on); if (on) this.resume(); else { halt(0.1); if (ac) songHalt(true); } return on; },
    };
  })();
  const BOSS_TRACK = ['legion', 'arena', 'riot', 'stomp', 'machine', 'sack', 'hellfire', 'stomp', 'hellfire', 'ego'];   // one punk/rock track per chapter boss
  const chapterTrack = () => LEVELS[S.level].music || ['ch1', 'ch2', 'ch3'][LEVELS[S.level].theme];

  /* ================= input ================= */
  const keys = { left: false, right: false, jump: false, attack: false, throw: false };
  let jumpPressed = false, attackPressed = false, throwPressed = false;
  const KEYMAP = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'jump', KeyW: 'jump', Space: 'jump', KeyX: 'attack', KeyJ: 'attack', KeyK: 'throw', KeyC: 'throw', KeyL: 'throw', KeyZ: 'jump' };
  function press(k, down) {
    if (k === 'jump' && down && !keys.jump) jumpPressed = true;
    if (k === 'attack' && down && !keys.attack) attackPressed = true;
    if (k === 'throw' && down && !keys.throw) throwPressed = true;
    keys[k] = down;
  }
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && S && S.mode === 'menu') { openSettings(false); return; }
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

  /* ================= Marcus evolution: experience and upgrades ================= */
  const STAGES = [
    { xp: 0, name: 'Legionary', gear: 'Leather armor, a gladius and a round shield.', perk: '' },
    { xp: 400, name: 'Centurion', gear: 'Bronze armor and a reinforced shield.', perk: '+1 heart.' },
    { xp: 1300, name: 'Tesla Legate', gear: 'A Tesla backpack and an electric sword.', perk: 'Your sword strikes twice as hard and reaches farther.' },
    { xp: 2400, name: 'Powered Praetorian', gear: 'Powered armor, a plasma sword and an energy shield.', perk: 'The energy shield blocks one hit, then recharges.' },
    { xp: 3800, name: 'Cosmic Emperor', gear: 'A gravity reactor, an orbital shield and support drones.', perk: 'Two drones fire on nearby foes, the shield recharges faster, and +1 heart.' },
  ];
  const START_XP = [0, 450, 900, 1350, 1900, 2500, 3100, 3700, 4300, 4900];   // when a run begins at a later chapter
  const stageFor = (xp) => STAGES.reduce((k, st, i) => (xp >= st.xp ? i : k), 0);
  const heartsFor = (stage) => 3 + (stage >= 1 ? 1 : 0) + (stage >= 4 ? 1 : 0);
  function gainXP(n, x, y) {
    if (!S || !n) return; S.xp += n;
    if (x !== undefined && n >= 40) float(x, y, `+${n} XP`, '#8fd8ff');
    const k = stageFor(S.xp);
    if (k > S.stage) { const add = heartsFor(k) - heartsFor(S.stage); S.stage = k; S.maxHp += add; if (P) { P.hp = S.maxHp; P.glow = 2.2; P.shieldT = 0; P.special = 0.9; } S.evoPending = k; SFX.power(); }
  }

  /* ================= game state ================= */
  let S = null;   // whole run
  let L = null;   // current level

  function newRun(start) {
    const xp0 = START_XP[start || 0] || 0, st0 = stageFor(xp0);
    S = { level: start || 0, coins: 0, kills: 0, deaths: 0, scrolls: new Set(), maxHp: heartsFor(st0), mode: 'play', score: 0, time: 0, spears: 0, killStreak: 0, spearTip: false, xp: xp0, stage: st0, evoPending: 0 };
    $('#s-title').hidden = true; $('#s-final').hidden = true; $('#s-game').hidden = false;
    window.scrollTo({ top: 0 });
    loadLevel(start || 0, true);
  }

  function loadLevel(n, showIntro) {
    S.level = n;
    const def = LEVELS[n], B = def.build();
    L = { def, w: B.w, g: B.g.map((r) => r.slice()), q: Object.assign({}, B.q), fields: B.fields, notes: B.notes, items: [], enemies: [], parts: [], texts: [], orbs: [], bumps: [], corpses: [], arrows: [], drones: [], waves: [], strikes: [], shots: [], zones: [], pspears: [], camY: 0,
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
      else if (e.type === 'bigboss') {
        const C = { colossus: { w: 72, h: 126, hp: 10, title: 'AUGUSTUS COLOSSUS', wake: 'Augustus Colossus, a giant statue animated by lightning. Dodge the boulders, and strike when it slams.', state: 'walk' },
          techno: { w: 40, h: 78, hp: 9, title: 'MEDUSA THE TECHNOMANCER', wake: 'Medusa the Technomancer. Her gaze turns you to stone, so never linger in front of her eyes.', state: 'idle' },
          leviathan: { w: 130, h: 96, hp: 9, title: 'THE NEPTUNE LEVIATHAN', wake: 'The Neptune Leviathan rises from the deep. Strike only while it is above the water.', state: 'sub' } }[e.kind];
        const b = { type: e.kind, big: true, scale: 1.5, title: C.title, wakeText: C.wake, x, y: (e.ty + 1) * T - C.h, w: C.w, h: C.h, vx: 0, vy: 0, hp: C.hp, maxHp: C.hp, face: -1, hurt: 0, onGround: false, anim: 0, awake: false, state: C.state, st: 1.2, n: 0, minX: e.minX ? e.minX * T : 0 };
        if (e.kind === 'leviathan') Object.assign(b, { x: e.tx * T + T - C.w / 2, y: 12 * T - C.h, ghost: true, fly: true, pit: [e.tx - 1, e.tx + 2] });
        if (e.kind === 'techno') b.shot = 0;
        L.boss = b; L.enemies.push(b);
      }
      else if (XK[e.type]) L.enemies.push(makeX(e.type, e.tx, e.ty));
      else if (e.type === 'xboss') { L.boss = makeX(e.kind, e.tx, e.ty, { minX: e.minX }); if (e.next) { L.gauntlet = e.next.slice(); L.boss.music = 'ego'; } L.enemies.push(L.boss); }
      else if (e.type === 'boss') { L.boss = { type: 'boss', big: true, title: 'THE ROMAN AUTOMATON', x, y: (e.ty + 1) * T - 100, w: 56, h: 100, vx: 0, vy: 0, hp: 14, maxHp: 14, face: -1, hurt: 0, onGround: false, anim: 0, awake: false, state: 'walk', st: 1.5, phase: 1, count: 0, shieldCd: 4, shield: 0, minX: (e.minX || 162) * T }; L.enemies.push(L.boss); }
    });
    L.check = { x: L.start.x, y: L.start.y };
    spawnPlayer();
    C = { x: P.x - 20, y: P.y - 30, anim: 0, cast: 0 };
    S.mode = 'play';
    MUSIC.play(chapterTrack());
    if (n > (store.get('aq-unlocked') || 0)) store.set('aq-unlocked', n);
    if (showIntro) overlay(`Chapter ${ROMAN[n]} of ${LEVELS.length}`, def.name, def.intro, 'Begin the chapter', () => {}, def.art);
  }

  let P = null, C = null;   // Marcus, and his Cosmic Companion
  function spawnPlayer() {
    P = { x: L.check.x, y: L.check.y, w: 22, h: 38, vx: 0, vy: 0, face: 1, onGround: false, coyote: 0, buffer: 0, atk: 0, atkCd: 0, hp: S.maxHp, inv: 1.2, anim: 0, glow: 0, dead: 0, special: 0, shieldT: 0, droneT: 1, zaps: [] };
    setZoom();
    L.cam = clamp(P.x - VWZ * 0.35, 0, L.w * T - VWZ); L.camY = camYTarget();
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
    L.enemies.forEach((en) => { if (en.type !== 'eagle' && en.type !== 'boss' && !en.big && Math.abs(en.y + en.h - ty * T) < 4 && en.x + en.w > target * T && en.x < (target + 1) * T) damage(en, 9, 0); });
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
      en.dead = true; S.kills += 1; L.levelKills += 1; S.killStreak += 1; gainXP(en.big ? 200 : XK[en.type] ? 40 : ['colossus', 'chariot', 'leviathan', 'minotaur', 'engine'].includes(en.type) ? 25 : 10, en.x, en.y - 24);
      if (S.killStreak >= 5) { S.killStreak = 0; const gy = Math.min(en.y + en.h - 30, 12 * T - 34); L.items.push({ type: 'spear', x: en.x + en.w / 2 - 14, y: Math.max(60, gy), w: 28, h: 28, rise: 0.3 }); float(en.x - 10, en.y - 24, 'A spear!', '#8fe6d2'); }
      L.corpses.push({ set: CORPSE[en.type] || en.type, x: en.x + en.w / 2, y: en.type === 'eagle' ? en.y + en.h / 2 : en.y + en.h, face: en.face, t: 0, vy: 0, eagle: en.type === 'eagle' || en.type === 'pegasus' || en.type === 'chariot' || en.type === 'helios', big: en.big, scale: en.scale || (en.type === 'centurion' ? 1.12 : 1) });
      burst(en.x + en.w / 2, en.y + en.h / 2, ['#ffd27a', '#c9a227', '#8fe6d2', '#fff'], en.big ? 70 : 18, en.big ? 320 : 200);
      const pts = en.type === 'boss' ? 1000 : en.big ? 500 : XK[en.type] ? 200 : ['colossus', 'chariot', 'leviathan', 'minotaur'].includes(en.type) ? 150 : 50;
      float(en.x, en.y - 6, '+' + pts, '#e7c46a'); S.score += pts;
      if (en.big && L.gauntlet && L.gauntlet.length) {   // the next knight of the gauntlet rides in
        SFX.win(); L.shake = 0.5; L.shots = []; L.zones = []; L.waves = []; L.strikes = []; L.drones = [];
        const nb = makeX(L.gauntlet.shift(), Math.round((en.minX || en.x) / T) + 14, 11, { minX: Math.round(en.minX / T) });
        Object.assign(nb, { awake: true, music: 'ego', st: 1.6 }); L.boss = nb; L.enemies.push(nb);
        toast(en.title.charAt(0) + en.title.slice(1).toLowerCase() + ' falls. ' + nb.wakeText, 'Boss');
        return true;
      }
      if (en.big) {
        MUSIC.pause(); setTimeout(() => { if (S && S.mode === 'play') MUSIC.play(chapterTrack()); }, 2600);
        SFX.win(); L.shake = 0.6; if (L.flag) L.flag.hidden = false;
        L.drones = []; L.waves = []; L.strikes = []; L.orbs = [];
        toast(en.type === 'boss' ? 'The Roman Automaton falls silent. The road to the Edge of Eternity is open.' : en.type === 'blackknight' ? 'The Black Knight kneels at last. The last road home is open.' : en.type === 'engine' ? 'The Minotaur Engine grinds to a halt. The eagle standard is yours.' : en.type === 'commander' ? 'The Dark Commander yields. The eagle standard is yours.' : en.title.charAt(0) + en.title.slice(1).toLowerCase().replace(/(^|\s)(the|of)(?=\s)/g, '$1$2') + ' is defeated. The eagle standard is yours.', 'Reach the standard'); L.shots = []; L.zones = [];
      } else SFX.hit();
    } else { SFX.hit(); burst(en.x + en.w / 2, en.y + 10, ['#fff', '#8fe6d2'], 8, 140); }
    return true;
  }

  function hurtPlayer(fromX) {
    if (P.inv > 0 || P.dead) return;
    if (S.stage >= 3 && P.shieldT <= 0) { P.shieldT = S.stage >= 4 ? 5 : 8; P.inv = 0.9; SFX.bump(); burst(P.x + P.w / 2, P.y + 18, ['#8fd8ff', '#fff', '#57b6ff'], 16, 190); float(P.x - 24, P.y - 18, 'Shield!', '#8fd8ff'); P.special = 0.35; return; }
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
    if (S.evoPending) { const k = S.evoPending; S.evoPending = 0; const st = STAGES[k]; overlay(`Marcus evolves · Stage ${ROMAN[k]}`, st.name, `${st.gear} ${st.perk} (${S.xp} XP)`, 'Onward', null, `img/stage${k + 1}.webp`); return; }
    if (P.shieldT > 0) P.shieldT -= dt; if (P.special > 0) P.special -= dt;
    P.zaps = P.zaps.filter((z) => (z.t -= dt) > 0);
    if (S.stage >= 4) { P.droneT -= dt; if (P.droneT <= 0) { P.droneT = 1.3; const cx = P.x + P.w / 2, cy = P.y + 10; let best = null, bd = 280;
        L.enemies.forEach((en) => { if (en.dead || en.ghost || (en.wakeText && !en.awake)) return; const d = Math.hypot(en.x + en.w / 2 - cx, en.y + en.h / 2 - cy); if (d < bd) { bd = d; best = en; } });
        if (best) { const side = P.zaps.length % 2 ? 1 : -1; P.zaps.push({ x0: cx + side * 26, y0: P.y - 22, x1: best.x + best.w / 2, y1: best.y + best.h / 2, t: 0.14 }); SFX.zap(); damage(best, 1, 0); } } }
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
    if (throwPressed) { throwPressed = false;
      if (S.spears > 0 && P.atkCd <= 0) { S.spears -= 1; P.atk = 0.18; P.atkCd = 0.32; P.thrown = 0.18; SFX.slash(); L.pspears.push({ x: P.x + P.w / 2 + P.face * 14, y: P.y + 14, vx: P.face * 640, vy: -40, life: 1.6, face: P.face, hit: new Set() }); }
      else if (S.spears <= 0) float(P.x - 30, P.y - 18, 'No spears yet', '#c9c2b0'); }
    P.atk -= dt; P.atkCd -= dt; if (P.thrown > 0) P.thrown -= dt; P.inv -= dt; P.glow -= dt; P.anim += dt * (Math.abs(P.vx) > 20 ? Math.abs(P.vx) / 26 : 2);

    P.vy = Math.min(MAXFALL, P.vy + GRAV * dt);
    moveX(P, P.vx * dt);
    moveY(P, P.vy * dt, headHit);
    if (P.x < 0) P.x = 0;
    if (P.y > ROWS * T + 60) { P.hp = 0; killPlayer(); return; }

    // sword
    if (P.atk > 0 && !(P.thrown > 0)) {
      const reach = S.stage >= 2 ? 58 : 46, hb = { x: P.face > 0 ? P.x + P.w - 4 : P.x - reach + 4, y: P.y + 2, w: reach, h: 30 };
      L.enemies.forEach((en) => { if (!en.dead && overlap(hb, en)) damage(en, S.stage >= 2 ? 2 : 1, P.face); });
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
      else if (it.type === 'spear') { it.taken = true; S.spears = Math.min(9, S.spears + 3); SFX.power(); float(it.x - 30, it.y - 10, '+3 spears', '#8fe6d2');
        if (!S.spearTip) { S.spearTip = true; toast(matchMedia('(pointer: coarse)').matches ? 'You found spears. Tap the spear button to throw one. Every five foes defeated brings another.' : 'You found spears. Press K (or C) to throw one. Every five foes defeated brings another.', 'Weapon'); } }
      else if (it.type === 'heart') { it.taken = true; P.hp = Math.min(S.maxHp, P.hp + 1); SFX.power(); float(it.x, it.y, '+1 heart', '#ff9b8a'); }
      else if (it.type === 'laurel') { it.taken = true; S.maxHp = Math.min(heartsFor(S.stage) + 2, S.maxHp + 1); P.hp = S.maxHp; P.glow = 1.6; SFX.power(); float(it.x - 10, it.y, 'Laurel of Virtue: +1 max heart', '#8fe6d2'); }
      else if (it.type === 'scroll') { it.taken = true; S.scrolls.add(it.i); S.score += 500; gainXP(50, it.x - 10, it.y - 30); SFX.scroll(); burst(it.x + 12, it.y + 12, ['#e7c46a', '#fff6e0', '#8fe6d2'], 26, 200); toast(SCROLLS[it.i][0], SCROLLS[it.i][1]); C.cast = 0.8; }
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
          turnTo(en, dx); en.shot -= dt; en.draw = en.shot < 0.5 ? 1 : 0;
          if (en.shot <= 0) { en.shot = rand(2.1, 2.9); SFX.slash(); L.arrows.push({ x: en.x + en.w / 2 + en.face * 18, y: en.y + 17, vx: en.face * 330, life: 3 }); }
        } else en.draw = 0;
      } else if (en.type === 'commander') updateCommander(en, dt);
      else if (NEW_AI[en.type]) {
        if (en.wakeText && !wake(en, en.wakeText)) { /* sleeping */ }
        else { NEW_AI[en.type](en, en.wakeText ? dt * 1.25 : dt); if (en.wakeText && en.minX) en.x = clamp(en.x, en.minX, (L.w - 4) * T); }
      }
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
  // Enemies turn around only after Marcus has clearly crossed to the other side for a moment (no left-right flicker when he jumps over them).
  let TDT = 1 / 60;
  function turnTo(e, dx) { const want = dx >= 0 ? 1 : -1; if (want === e.face) { e.turnT = 0; return; } if (Math.abs(dx) < 34 && e.face) return; e.turnT = (e.turnT || 0) + TDT; if (e.turnT >= 0.18 || !e.face) { e.face = want; e.turnT = 0; } }
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
      if (en.state === 'walk') { turnTo(en, dx); en.vx = en.hurt > 0.2 ? 0 : en.face * 55 * fast;
        if (en.st <= 0) { if (Math.abs(dx) < 110) { en.state = 'sweepWind'; en.st = 0.45 / fast; } else { en.state = 'wind'; en.st = 0.6 / fast; } en.vx = 0; } }
      else if (en.state === 'wind') { en.vx = 0; if (en.st <= 0) { en.state = 'charge'; en.st = 1.1; SFX.boss(); } }
      else if (en.state === 'charge') { en.vx = en.face * 380 * fast; if (en.hitWall || en.st <= 0 || (en.face < 0 && en.x <= en.minX + 2) || (en.face > 0 && en.x >= (L.w - 4) * T - 2)) { en.state = 'rest'; en.st = 0.9 / fast; en.vx = 0; L.shake = 0.3;
          if (fast > 1) [-1, 1].forEach((d) => L.waves.push({ x: en.x + en.w / 2 + d * 30, y: en.y + en.h, vx: d * 320, life: 1.3 })); } }
      else if (en.state === 'sweepWind') { if (en.st <= 0) { en.state = 'sweep'; en.st = 0.35; en.swept = true; SFX.slash(); } }
      else if (en.state === 'sweep') { const hb = { x: en.face > 0 ? en.x + en.w - 10 : en.x - 80, y: en.y + 20, w: 90, h: 70 }; if (!P.dead && overlap(P, hb)) hurtPlayer(en.x + en.w / 2); if (en.st <= 0) { en.state = 'rest'; en.st = 0.8 / fast; } }
      else { en.vx = 0; if (en.st <= 0) { en.state = 'walk'; en.swept = false; en.st = rand(0.8, 1.4); } }
      en.vy = Math.min(MAXFALL, en.vy + GRAV * dt); moveX(en, en.vx * dt); moveY(en, en.vy * dt); en.x = clamp(en.x, en.minX, (L.w - 4) * T);
    },
    medusa(en, dt) {
      en.anim += dt; en.st -= dt; en.vx = 0; const dx = P.x + P.w / 2 - en.x - en.w / 2; en.vy = Math.min(MAXFALL, en.vy + GRAV * dt); moveY(en, en.vy * dt);
      if (en.state === 'idle') { if (near(en, 420)) turnTo(en, dx);
        if (en.st <= 0 && near(en, 380)) { en.n++; if (en.n % 2) { en.state = 'gazeWind'; en.st = 0.7; } else { en.state = 'serp'; en.st = 0.9; en.spawned = 0; } } }
      else if (en.state === 'gazeWind') { if (en.st <= 0) { en.state = 'gaze'; en.st = 0.7; SFX.zap();
          const len = (en.type === 'techno' ? 170 : 140) * (en.scale || 1), feet = en.y + en.h; L.zones.push({ x: en.face > 0 ? en.x + en.w : en.x - len, y: feet - 56, w: len, h: 46, t: 0.7, stone: true }); } }
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
      if (near(en, 560)) { turnTo(en, dx); en.shot -= dt; en.draw = en.shot < 0.45 ? 1 : 0;
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
      if (en.state === 'walk') { if (near(en, 500)) turnTo(en, dx); en.vx = en.hurt > 0 ? 0 : en.face * 32;
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
      en.anim += dt; en.st -= dt; const cx = en.x + en.w / 2, dx = P.x + P.w / 2 - cx; turnTo(en, dx);
      if (en.state === 'sub') { en.ghost = true; if (en.st <= 0 && Math.abs(dx) < 420) { en.state = 'emerge'; en.st = 0.6; SFX.boss(); burst(cx, 12 * T, ['#8fd8ff', '#fff'], 18, 220); } }
      else if (en.state === 'emerge') { en.ghost = false; if (en.st <= 0) { if (Math.abs(dx) < 110) { en.state = 'tent'; en.st = 1.0; L.zones.push({ x: cx - 85, y: 12 * T - 140, w: 170, h: 140, t: 0.75, delay: 0.25 }); } else { en.state = 'cannon'; en.st = 1.0; L.zones.push({ x: en.face > 0 ? cx + 30 : cx - 300, y: 12 * T - 34, w: 270, h: 26, t: 0.7, delay: 0.2 }); } SFX.zap(); } }
      else if (en.state === 'tent' || en.state === 'cannon') { if (en.st <= 0) { en.state = 'rest'; en.st = 1.4; } }
      else { if (en.st <= 0) { en.state = 'sub'; en.st = 2.2; } }
    },
  };
  NEW_AI.techno = NEW_AI.medusa;

  /* ---------- elites and bosses of the later chapters (one animated sheet row each) ---------- */
  const XK = {
    stormtaur: { sc: 1.05, bsc: 1.5, spd: 55, hp: 5, bhp: 14, wide: 0.5, atk: 'front', sp: 'waves strikes', col: ['#b07cff', '#fff', '#6b2fa8'], title: 'ASTERION, THE STORM MINOTAUR', wake: 'Asterion, the Storm Minotaur. When he raises his axe high, leap: the storm strikes the ground.' },
    anubis: { sc: 1.0, bsc: 1.45, spd: 50, hp: 4, bhp: 12, wide: 0.4, atk: 'front', sp: 'burst', col: ['#ffd27a', '#c9a227', '#fff'], title: 'ANUBIS, WEIGHER OF HEARTS', wake: 'Anubis, Weigher of Hearts. His spear reaches far; strike as he recovers.' },
    titan: { sc: 1.05, bsc: 1.5, spd: 45, hp: 5, bhp: 14, wide: 0.5, atk: 'front', sp: 'waves', col: ['#ff9a3d', '#ffd27a', '#fff'], title: 'THE FIRE TITAN', wake: 'The Fire Titan. Jump the flames his hammer sends along the ground.' },
    harpy: { sc: 0.9, bsc: 1.3, spd: 0, hp: 3, bhp: 10, wide: 0.45, fly: true, atk: 'dive', sp: 'feathers', col: ['#7fa8ff', '#fff', '#3d5bd8'], title: 'THE STORM HARPY', wake: 'The Storm Harpy. Dodge her dive, then strike before she climbs.' },
    spider: { sc: 0.8, bsc: 1.2, spd: 38, hp: 4, bhp: 12, wide: 0.6, atk: 'front', sp: 'front', col: ['#8fe6ff', '#fff', '#2fb6d8'], title: 'THE CLOCKWORK SPIDER', wake: 'The Clockwork Spider. Its beam fires straight ahead: stay above it.' },
    cerberus: { sc: 0.95, bsc: 1.4, spd: 70, hp: 6, bhp: 15, wide: 0.6, atk: 'front', sp: 'burst rocks', col: ['#ff9a3d', '#ffd27a', '#7a2a12'], title: 'CERBERUS, HOUND OF THE UNDERWORLD', wake: 'Cerberus, the three-headed hound. Its fire breath reaches far, so leap it, and strike while it recovers.' },
    pluto: { sc: 1.0, bsc: 1.5, spd: 50, hp: 6, bhp: 16, wide: 0.4, atk: 'front shot', sp: 'burst souls', col: ['#b58cff', '#fff', '#5a2d82'], title: 'PLUTO, KING OF THE UNDERWORLD', wake: 'Pluto, King of the Underworld. Cut down the spirits he raises, and never stand before his trident.' },
    galvanic: { sc: 1.0, bsc: 1.5, spd: 52, hp: 6, bhp: 16, wide: 0.45, atk: 'front shot', sp: 'burst waves', col: ['#8fd8ff', '#fff', '#2f6bd8'], title: 'THE GALVANIC GLADIATOR', wake: 'The Galvanic Gladiator, a giant raised by lightning. His fist hurls bolts; leap his ground dome.' },
    strider: { sc: 1.0, bsc: 1.45, spd: 42, hp: 5, bhp: 14, wide: 0.45, atk: 'front', sp: 'burst strikes', col: ['#8fe6ff', '#fff', '#57b6ff'], title: 'THE TESLA STRIDER', wake: 'The Tesla Strider. Watch the sky: its coils call down lightning.' },
    charon: { sc: 1.0, bsc: 1.45, spd: 48, hp: 5, bhp: 14, wide: 0.4, atk: 'front', sp: 'burst souls', col: ['#7dffb0', '#fff', '#2e8b57'], title: 'CHARON, THE FERRYMAN', wake: 'Charon, the Ferryman. His oar sweeps low, and the lost souls follow him.' },
    templar: { sc: 1.0, bsc: 1.45, spd: 60, hp: 6, bhp: 14, wide: 0.4, atk: 'front', sp: 'front shot', col: ['#ffd27a', '#fff', '#c9a227'], title: 'THE TEMPLAR CRUSADER', wake: 'The last guardians ride out. First, the Templar Crusader: his shield blocks nothing from above, so leap and strike.' },
    king: { sc: 1.0, bsc: 1.5, spd: 55, hp: 7, bhp: 16, wide: 0.4, atk: 'front', sp: 'burst waves strikes', col: ['#ffd27a', '#fff', '#e7a227'], title: 'THE GOLDEN KING', wake: 'The Golden King draws his blazing sword. When he raises it high, lightning will fall.' },
    blackknight: { sc: 1.0, bsc: 1.55, spd: 62, hp: 8, bhp: 20, wide: 0.4, atk: 'front shot', sp: 'burst waves rocks', col: ['#ff4a3d', '#ffb0a0', '#5a0f0f'], title: 'THE BLACK KNIGHT', wake: 'The Black Knight, last of all. His blade splits the earth itself. Stand firm, Marcus.' },
  };
  const xfr = (en, a) => { const k = BOSS2_SCALE[en.type]; if (!k) return ATLAS[en.type][a][0];   // redrawn multi-frame sheets: widest reach, scaled to game units
    const f = ATLAS[en.type][a].reduce((m, g) => (g[2] - g[4] > m[2] - m[4] ? g : m)); return f.map((v, i) => (i < 2 ? v : Math.round(v * k))); };
  function xZone(en, a, mode, t, delay = 0) {
    const fr = xfr(en, a), sc = en.scale, feet = en.y + en.h, cx = en.x + en.w / 2;
    if (mode === 'front') { const fwd = (fr[2] - fr[4]) * sc * 0.9, h = fr[3] * sc * 0.7; L.zones.push({ x: en.face > 0 ? cx - 8 : cx - fwd, y: feet - h, w: fwd + 8, h, t, delay }); }
    else { const w = fr[2] * sc * 0.82, h = fr[3] * sc * 0.55; L.zones.push({ x: cx - w / 2, y: feet - h, w, h, t, delay }); }
  }
  function xExtras(en, list, boss, rage) {
    const K = XK[en.type], cx = en.x + en.w / 2, feet = en.y + en.h;
    if (list.includes('waves')) [-1, 1].forEach((d) => L.waves.push({ x: cx + d * 30, y: feet, vx: d * (rage ? 340 : 290), life: 1.3 }));
    if (!boss && !list.includes('waves')) return;
    if (list.includes('shot')) { const sx = cx + en.face * 60 * en.scale, sy = feet - en.h * 0.6; L.shots.push({ x: sx, y: sy, vx: en.face * 300, vy: 0, r: 11, life: 3, set: 'efx', anim: 'ring', scale: 0.6, breakable: true }); }
    if (list.includes('strikes')) { const n = rage ? 4 : 3; for (let i = 0; i < n; i++) L.strikes.push({ x: P.x + P.w / 2 + (i - (n - 1) / 2) * 70 + rand(-15, 15), y: 12 * T, t: 0.75 + i * 0.12 }); }
    if (list.includes('souls')) { const n = rage ? 3 : 2; for (let i = 0; i < n; i++) L.drones.push({ x: cx + rand(-50, 50), y: feet - 40, t: 0, life: 5, speed: 105 + i * 12, soul: K.col[0] }); }
    if (list.includes('rocks')) for (let i = 0; i < (rage ? 3 : 2); i++) { const t = 0.9 + i * 0.2, tx = P.x + P.w / 2 + rand(-60, 60), sy = feet - 60;
      L.shots.push({ x: cx, y: sy, vx: (tx - cx) / t, vy: (P.y + P.h - 10 - sy - 0.5 * 700 * t * t) / t, g: 700, r: 10, life: 3, set: 'efx', anim: 'flare', scale: 0.32, boom: K.col }); }
  }
  function xAI(en, dt) {
    const K = XK[en.type], boss = !!en.big, rage = boss && en.hp <= en.maxHp / 2, dx = P.x + P.w / 2 - en.x - en.w / 2;
    en.anim += dt; en.st -= dt;
    if (K.fly) return xFly(en, dt, K, boss, rage, dx);
    const reach = (xfr(en, 'attack')[2] - xfr(en, 'attack')[4]) * en.scale * 0.85;
    if (en.state === 'walk') {
      if (near(en, 520)) turnTo(en, dx);
      en.vx = en.hurt > 0 ? 0 : en.face * K.spd * (rage ? 1.35 : 1);
      if (en.st <= 0 && near(en, boss ? 560 : 380)) {
        en.n = (en.n || 0) + 1; const special = en.n % (rage ? 2 : 3) === 0;
        if (special || Math.abs(dx) < reach || K.atk.includes('shot') && boss) { en.next = special ? 'special' : 'attack'; en.state = 'wind'; en.st = rage ? 0.42 : 0.6; en.vx = 0; }
        else en.st = 0.3;
      }
    } else if (en.state === 'wind') { en.vx = 0; if (en.st <= 0) { en.state = en.next; en.st = en.next === 'special' ? 0.85 : 0.5;
        if (en.next === 'attack') { xZone(en, 'attack', 'front', 0.35, 0.05); xExtras(en, K.atk, boss, rage); SFX.slash(); }
        else { const sp = K.sp; xZone(en, 'special', sp.startsWith('front') ? 'front' : 'around', 0.4, 0.1); xExtras(en, sp, boss, rage); SFX.boss(); L.shake = Math.max(L.shake, boss ? 0.35 : 0.18); burst(en.x + en.w / 2, en.y + en.h, K.col, boss ? 22 : 10, 220); } } }
    else if (en.state === 'attack' || en.state === 'special') { en.vx = 0; if (en.st <= 0) { en.state = 'recover'; en.st = rage ? 0.5 : 0.75; } }
    else { en.vx = 0; if (en.st <= 0) { en.state = 'walk'; en.st = rand(0.7, 1.4) * (rage ? 0.7 : 1); } }
    groundStep(en, dt);
  }
  function xFly(en, dt, K, boss, rage, dx) {
    const px = P.x + P.w / 2, py = P.y + P.h / 2, cx = en.x + en.w / 2;
    if (en.state === 'walk') {
      en.x = en.hx + Math.sin(en.anim * 0.8) * (boss ? 160 : 100); en.y = en.hy + Math.sin(en.anim * 2) * 12; turnTo(en, dx);
      if (en.st <= 0 && !P.dead && Math.abs(dx) < (boss ? 420 : 300)) { en.n = (en.n || 0) + 1; en.next = en.n % (rage ? 2 : 3) === 0 ? 'special' : 'attack'; en.state = 'wind'; en.st = rage ? 0.4 : 0.55; }
    } else if (en.state === 'wind') { if (en.st <= 0) {
        if (en.next === 'attack') { en.state = 'attack'; en.st = 1.0; const ddx = px - cx, ddy = py - en.y - en.h / 2, d = Math.hypot(ddx, ddy) || 1; en.vx = ddx / d * (boss ? 360 : 300); en.vy = ddy / d * (boss ? 360 : 300); en.face = Math.sign(ddx) || -1; SFX.slash(); }
        else { en.state = 'special'; en.st = 0.8; SFX.zap(); const n = boss ? (rage ? 7 : 5) : 3; for (let i = 0; i < n; i++) { const a = Math.PI / 2 + (i - (n - 1) / 2) * 0.28; L.shots.push({ x: cx, y: en.y + en.h * 0.6, vx: Math.cos(a) * 230, vy: Math.sin(a) * 230, r: 9, life: 3, set: 'efx', anim: 'ring', scale: 0.45, breakable: true }); }
          if (boss) xExtras(en, 'strikes', boss, rage); } } }
    else if (en.state === 'attack') { en.x += en.vx * dt; en.y += en.vy * dt; if (en.st <= 0 || en.y + en.h > 12 * T) { en.y = Math.min(en.y, 12 * T - en.h); en.state = 'recover'; en.st = 0.9; } }
    else if (en.state === 'special') { if (en.st <= 0) { en.state = 'recover'; en.st = 0.6; } }
    else { // recover: hang low for a moment (a chance to strike), then climb back to the patrol line
      if (en.st <= 0) { en.y += (en.hy - en.y) * Math.min(1, dt * 2.4); en.x += (en.hx - en.x) * Math.min(1, dt * 1.1);
        if (Math.abs(en.y - en.hy) < 6) { en.state = 'walk'; en.st = rand(1.0, 1.8) * (rage ? 0.7 : 1); en.anim = Math.asin(clamp((en.x - en.hx) / (boss ? 160 : 100), -1, 1)) / 0.8; } } }
    if (en.minX) en.hx = Math.max(en.hx, en.minX + 60);
  }
  Object.keys(XK).forEach((k) => { NEW_AI[k] = xAI; });
  function makeX(kind, tx, ty, bossOpts) {
    const K = XK[kind], sc = bossOpts ? K.bsc : K.sc, hk = sc * (BOSS2_SCALE[kind] || 1), fr = ATLAS[kind].idle[0], w = Math.round(fr[2] * hk * K.wide), h = Math.round(fr[3] * hk * 0.85);
    const en = { type: kind, scale: sc, x: tx * T + T / 2 - w / 2, y: (ty + 1) * T - h, w, h, vx: 0, vy: 0, hp: bossOpts ? K.bhp : K.hp, face: -1, hurt: 0, onGround: false, anim: Math.random() * 3, state: 'walk', st: rand(0.6, 1.4), n: 0 };
    if (K.fly) Object.assign(en, { fly: true, hx: en.x, hy: ty * T, y: ty * T });
    if (bossOpts) Object.assign(en, { big: true, maxHp: en.hp, title: K.title, wakeText: K.wake, awake: false, st: 1.2, minX: bossOpts.minX ? bossOpts.minX * T : 0 });
    return en;
  }

  /* ---------- the Dark Commander (Chapter II) ---------- */
  function wake(b, text) { if (b.awake) return true; if (P.x > b.x - 470) { b.awake = true; L.bossOn = true; SFX.boss(); MUSIC.play(b.music || BOSS_TRACK[S.level] || 'riot'); toast(text, 'Boss'); return true; } return false; }
  function updateCommander(b, dt) {
    if (!wake(b, 'The Dark Commander bars the way. Watch his spear, strike when he recovers, or land on his helmet.')) return;
    b.anim += dt; b.st -= dt;
    const dx = P.x + P.w / 2 - (b.x + b.w / 2), dist = Math.abs(dx), fast = b.hp <= 3 ? 1.5 : 1;
    if (b.state === 'walk') {
      turnTo(b, dx); b.vx = b.hurt > 0 ? 0 : b.face * 70 * fast;
      if (b.st <= 0 && dist < 120) { b.state = 'wind'; b.st = 0.45 / fast; b.vx = 0; }
      else if (b.st <= 0 && fast > 1 && dist > 200) { b.state = 'throw'; b.st = 0.5; b.vx = 0; }
    } else if (b.state === 'wind') { if (b.st <= 0) { b.state = 'swing'; b.st = 0.32; b.swung = true; SFX.slash(); } }
    else if (b.state === 'swing') {
      const hb = { x: b.face > 0 ? b.x + b.w - 6 : b.x - 80, y: b.y + 20, w: 86, h: 60 };
      if (!P.dead && overlap(P, hb)) hurtPlayer(b.x + b.w / 2);
      if (b.st <= 0) { b.state = 'rest'; b.st = 0.7 / fast; }
    } else if (b.state === 'throw') {
      if (b.st <= 0) { L.orbs.push({ x: b.x + b.w / 2 + b.face * 30, y: b.y + 40, vx: b.face * 260, life: 3.5, swirl: true, face: b.face }); SFX.zap(); b.state = 'rest'; b.st = 0.6; }
    } else if (b.state === 'rest') { b.vx = 0; if (b.st <= 0) { b.state = 'walk'; b.swung = false; b.st = rand(0.6, 1.2); } }
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
        turnTo(b, dx); b.vx = b.hurt > 0.2 ? 0 : b.face * (ph === 3 ? 115 : 60) * (ph === 2 ? 1.2 : 1);
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
        turnTo(b, dx);
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

  function camYTarget() { const top = 44 * HS / ZOOM, extra = Math.max(0, VHZ - ROWS * T - top), lo = -top - extra; return clamp(P.y + P.h - VHZ * 0.74, lo, Math.max(lo, ROWS * T - VHZ)); }
  function updateSpears(dt) {
    L.pspears.forEach((sp) => {
      sp.vy += 260 * dt; sp.x += sp.vx * dt; sp.y += sp.vy * dt; sp.life -= dt;
      const hb = { x: sp.x - 16, y: sp.y - 5, w: 32, h: 10 };
      L.enemies.forEach((en) => { if (!en.dead && !sp.hit.has(en) && overlap(hb, en)) { sp.hit.add(en); if (damage(en, 2, sp.face) || en.shield > 0) { if (en.big || en.shield > 0) sp.life = 0; burst(sp.x, sp.y, ['#8fe6d2', '#fff', '#57b6ff'], 10, 160); } } });
      L.shots.forEach((o) => { if (o.breakable && overlap(hb, { x: o.x - o.r, y: o.y - o.r, w: o.r * 2, h: o.r * 2 })) o.dead = true; });
      L.drones.forEach((d) => { if (!d.dead && overlap(hb, { x: d.x - 13, y: d.y - 13, w: 26, h: 26 })) { d.dead = true; burst(d.x, d.y, ['#57b6ff', '#fff'], 10, 150); } });
      if (solid(Math.floor((sp.x + sp.face * 14) / T), Math.floor(sp.y / T))) { sp.life = 0; burst(sp.x, sp.y, ['#c9a227', '#fff'], 6, 120); }
    });
    L.pspears = L.pspears.filter((sp) => sp.life > 0);
  }
  function update(dt) {
    TDT = dt;
    L.t += dt; S.time += dt;
    if (S.time >= (S.nextBreak || 2400)) { S.nextBreak = S.time + 2400; toast(`You have been questing for ${Math.round(S.time / 60)} minutes. Even Marcus rested: stretch, drink some water, rest your eyes.`, 'Time for a break'); }
    updatePlayer(dt); updateEnemies(dt); updateSpears(dt);
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
    const target = clamp(P.x - VWZ * 0.38, 0, L.w * T - VWZ);
    L.cam += (target - L.cam) * Math.min(1, dt * 8);
    L.camY += (camYTarget() - L.camY) * Math.min(1, dt * 5);
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
    const key = L.def.bg; if (strips[key]) return strips[key];
    const im = bgImg(key); if (!im.complete || !im.naturalWidth) return null;
    const t = THEMES[th], h = 600, w = Math.round(im.naturalWidth * (h / im.naturalHeight));
    const k = Math.min(RES, 2), c = document.createElement('canvas'); c.width = Math.round(w * 2 * k); c.height = Math.round(h * k); c.lw = w * 2; c.lh = h; const g = c.getContext('2d'); g.scale(k, k);
    g.fillStyle = t.paper; g.fillRect(0, 0, w * 2, h);
    g.globalAlpha = th === 0 ? 0.92 : th === 1 ? 0.85 : 0.75; if (th === 0) g.globalCompositeOperation = 'multiply';
    g.drawImage(im, 0, 0, w, h); g.save(); g.translate(w * 2, 0); g.scale(-1, 1); g.drawImage(im, 0, 0, w, h); g.restore();
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    if (th === 0) { g.fillStyle = g.createPattern(grain, 'repeat'); g.fillRect(0, 0, w * 2, h); }
    return (strips[key] = c);
  }
  const vignette = (() => { const c = document.createElement('canvas'); c.width = VW; c.height = 480; const g = c.getContext('2d');
    const v = g.createRadialGradient(VW / 2, 240, 168, VW / 2, 240, VW * 0.65); v.addColorStop(0, 'rgba(120,90,50,0)'); v.addColorStop(1, 'rgba(120,90,50,0.35)'); g.fillStyle = v; g.fillRect(0, 0, VW, VH); return c; })();
  const shade = [null, [0.15, 0.65, '7,16,25'], [0, 0.6, '5,6,15']].map((x) => { if (!x) return null; const c = document.createElement('canvas'); c.width = 4; c.height = VH; const g = c.getContext('2d');
    const f = g.createLinearGradient(0, 0, 0, VH); f.addColorStop(0, `rgba(${x[2]},${x[0]})`); f.addColorStop(1, `rgba(${x[2]},${x[1]})`); g.fillStyle = f; g.fillRect(0, 0, 4, VH); return c; });

  function drawBackground(th) {
    const t = THEMES[th], st = strip(th), par = [0.18, 0.15, 0.12][th], y0 = [-60, -40, -50][th];
    ctx.fillStyle = t.paper; ctx.fillRect(0, 0, VW, VH);
    if (st) { const k = Math.max(1, (VH - y0) / st.lh), sw = st.lw * k, sh = st.lh * k, off = (L.cam * par * k) % sw;   // tall phone screens: stretch the art to the full height
      for (let x = -off; x < VW; x += sw) ctx.drawImage(st, Math.floor(x), y0, Math.ceil(sw) + 1, sh); }
    if (th === 0) ctx.drawImage(vignette, 0, 0, VW, VH);
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
    const t = THEMES[th], x0 = Math.floor(L.cam / T), x1 = Math.min(L.w - 1, x0 + Math.ceil(VWZ / T) + 1);
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
    const q = Math.min(3, Math.max(1, ctx.getTransform().a)), QW = Math.ceil(W * q), QH = Math.ceil(H * q);   // offscreen at screen resolution
    if (sprCv.width < QW || sprCv.height < QH) { sprCv.width = silCv.width = Math.max(QW, sprCv.width); sprCv.height = silCv.height = Math.max(QH, sprCv.height); }
    sprCtx.clearRect(0, 0, sprCv.width, sprCv.height); silCtx.clearRect(0, 0, silCv.width, silCv.height);
    const main = ctx; ctx = sprCtx; sprCtx.save(); sprCtx.setTransform(q, 0, 0, q, 0, 0); sprCtx.translate(pad - bx, pad - by); draw(); sprCtx.restore(); ctx = main;
    silCtx.globalCompositeOperation = 'source-over'; silCtx.drawImage(sprCv, 0, 0); silCtx.globalCompositeOperation = 'source-in'; silCtx.fillStyle = th.outline; silCtx.fillRect(0, 0, silCv.width, silCv.height);
    const o = th.ow, dirs = th.sepia ? [[-o, 0], [o, 0], [0, -o], [0, o], [-o, -o], [o, -o], [-o, o], [o, o]] : [[-o, 0], [o, 0], [0, -o], [0, o]];
    dirs.forEach(([dx, dy]) => ctx.drawImage(silCv, 0, 0, QW, QH, bx - pad + dx, by - pad + dy, W, H));
    ctx.drawImage(sprCv, 0, 0, QW, QH, bx - pad, by - pad, W, H);
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
    const blink = !p.dead && p.inv > 0 && p.inv <= 1.0 ? (calm ? 0.6 : Math.floor(p.inv * 6) % 2 ? 0.45 : 1) : 1;
    const aura = p.glow > 0 ? '#8fe6d2' : [null, null, '#57b6ff', '#8fd8ff', '#ffd27a'][S.stage];
    if (aura) { ctx.save(); ctx.shadowColor = aura; ctx.shadowBlur = p.glow > 0 ? 18 : 7 + S.stage * 2; }
    const set = MARCUSIMG.complete && MARCUSIMG.naturalWidth ? 'n' + (S.stage + 1) : 'warrior', sc = set === 'warrior' ? 1 : 0.5;
    if (set !== 'warrior') {
      if (p.dead) anim = 'die';
      else if (anim === 'hurt') f = 0;
      else if (p.special > 0) { anim = 'special'; f = 0; }
      else if (anim === 'run') f = p.anim * 0.8; else if (anim === 'walk') f = p.anim * 0.9; else if (anim === 'idle') f = L.t * 1.2; else if (anim === 'jump') f = 0;
      if (anim === 'attack') f = Math.min(3, (1 - p.atk / 0.2) * 5);
    }
    if (p.stone > 0) { ctx.save(); ctx.filter = 'grayscale(1) brightness(0.85)'; spr(set, 'idle', 0, x, y + 1, p.face, sc, 1); ctx.restore(); }
    else if (set !== 'warrior' && p.dead) {   // topples backwards and fades
      const k = clamp((1.2 - p.dead) / 0.45, 0, 1); ctx.save(); ctx.translate(Math.round(x - p.face * k * 10), Math.round(y + 1 - k * 15)); ctx.rotate(-p.face * k * 1.45);
      spr(set, 'hurt', 0, 0, 0, p.face, sc, p.dead > 0.45 ? 1 : p.dead / 0.45); ctx.restore(); }
    else if (set !== 'warrior' && anim === 'hurt') { ctx.save(); ctx.filter = 'sepia(1) saturate(4) hue-rotate(-30deg) brightness(1.1)'; spr(set, 'hurt', 0, x, y + 1, p.face, sc, 1); ctx.restore(); }
    else spr(set, anim, f, x, y + 1, p.face, sc, blink);
    if (aura) ctx.restore();
    if (p.atk > 0 && !(p.thrown > 0) && (set === 'warrior' || p.thrown > 0)) { const k = 1 - p.atk / 0.2;
      if (S.stage >= 2) { ctx.save(); ctx.shadowColor = S.stage >= 3 ? '#c48cff' : '#57b6ff'; ctx.shadowBlur = 16; ctx.filter = S.stage >= 3 ? 'hue-rotate(220deg) saturate(2)' : 'hue-rotate(170deg) saturate(2)'; spr('fx', 'slash', 0, x + p.face * 40, y - 22, p.face, 1.15, 1 - k * 0.6); ctx.restore(); }
      else spr('fx', 'slash', 0, x + p.face * 34, y - 22, p.face, 0.9, 1 - k * 0.7); }
    if (S.stage >= 3 && !p.dead && p.shieldT <= 0) { ctx.save(); ctx.globalAlpha = 0.35 + Math.sin(L.t * 5) * 0.1; ctx.strokeStyle = S.stage >= 4 ? '#ffd27a' : '#8fd8ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y - 20, 22, 28, 0, 0, 7); ctx.stroke(); ctx.restore(); }
    if (S.stage >= 4 && !p.dead && set === 'warrior') [-1, 1].forEach((side, i) => spr('bfx', 'drone', 0, x + side * 26 + Math.sin(L.t * 2 + i) * 4, y - 60 + Math.sin(L.t * 4 + i * 2) * 4, 1, 0.6));
    p.zaps.forEach((z) => { ctx.save(); ctx.strokeStyle = '#bfe6ff'; ctx.shadowColor = '#57b6ff'; ctx.shadowBlur = 12; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(z.x0 - L.cam, z.y0);
      for (let i = 1; i <= 6; i++) { const t = i / 6; ctx.lineTo(z.x0 + (z.x1 - z.x0) * t - L.cam + (i < 6 ? rand(-6, 6) : 0), z.y0 + (z.y1 - z.y0) * t + (i < 6 ? rand(-6, 6) : 0)); } ctx.stroke(); ctx.restore(); });
    if (p.healFx > 0) spr('fx', 'heal', 0, x, y - 22, 1, 0.9, Math.min(1, p.healFx * 2));
  }
  function drawCompanion() {
    if (!C) return;
    const anim = P.dead ? 'hurt' : C.cast > 0 ? 'attack' : Math.abs(C.vx || 0) > 14 ? 'walk' : 'idle';
    spr('companion', anim, C.anim * 6, C.x - L.cam, C.y + 15, (C.vx || 0) < -2 ? -1 : 1);
  }
  function drawEnemy(en) {
    const x = en.x + en.w / 2 - L.cam, feet = en.y + en.h, blink = en.big ? 1 : en.hurt > 0 ? (calm ? 0.7 : Math.floor(en.hurt * 6) % 2 ? 0.55 : 1) : 1;
    if (en.big && en.hurt > 0) {   // bosses stay solid when hit: a bright strike flash instead of turning see-through
      ctx.save(); ctx.filter = calm ? 'brightness(1.35)' : en.hurt > 0.3 ? 'brightness(2.4) saturate(0.4)' : Math.floor(en.hurt * 20) % 2 ? 'brightness(1.5)' : 'none';
      drawEnemyBody(en, x, feet, blink); ctx.restore(); return;
    }
    drawEnemyBody(en, x, feet, blink);
  }
  function drawEnemyBody(en, x, feet, blink) {
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
      const st = en.state, moving = Math.abs(en.vx) > 1;
      const anim = en.hurt > 0.2 ? 'hurt' : st === 'wind' || st === 'swing' || (st === 'rest' && en.swung && en.st > 0.4) ? 'attack' : st === 'throw' ? 'throw' : st === 'walk' && moving ? 'walk' : 'idle';
      const f = anim === 'hurt' ? (en.hurt > 0.32 ? 0 : 1) : anim === 'attack' ? (st === 'wind' ? 0 : st === 'swing' ? (en.st > 0.16 ? 1 : 2) : 3) : anim === 'throw' ? (en.st > 0.3 ? 0 : en.st > 0.12 ? 1 : 2) : anim === 'walk' ? en.anim * 8 : en.anim * 3;
      spr('commander', anim, f, x, feet + 1, en.face, 1, blink);
    } else if (en.type === 'boss') drawAutomaton(en, x, feet, blink);
    else if (XK[en.type]) drawX(en, x, feet, blink);
    else drawNew(en, x, feet, blink);
  }
  function drawX(en, x, feet, blink) {
    const st = en.state, moving = Math.abs(en.vx) > 1 || en.fly;
    const a = st === 'wind' ? 'wind' : st === 'attack' ? 'attack' : st === 'special' ? 'special' : st === 'recover' ? (en.fly && en.st <= 0 ? 'walk' : 'recover') : (moving && Math.floor(en.anim * 4) % 2 ? 'walk' : 'idle');
    const rage = en.big && en.hp <= en.maxHp / 2;
    if (rage) { ctx.save(); ctx.shadowColor = XK[en.type].col[0]; ctx.shadowBlur = 5 + Math.sin(L.t * 12) * 2; }
    let A = a, f = 0;
    if (BOSS2_SCALE[en.type] && ATLAS[en.type].hurt) {   // redrawn sheet: real cycles and multi-frame attacks
      A = st === 'wind' ? (en.next === 'attack' ? 'attack' : 'wind') : st === 'attack' || st === 'special' ? st : en.hurt > 0.2 ? 'hurt' : moving && st === 'walk' ? 'walk' : 'idle';
      f = st === 'wind' ? (en.st > (en.next === 'attack' ? 0.25 : 0.3) ? 0 : 1) : st === 'attack' ? (en.st > 0.3 ? 2 : 3) : st === 'special' ? (en.st > 0.75 ? 1 : en.st > 0.3 ? 2 : 3) : A === 'hurt' ? (en.hurt > 0.32 ? 0 : 1) : A === 'walk' ? en.anim * 8 : en.anim * 3;
    }
    if (st === 'wind' && strobe(5)) { ctx.save(); ctx.filter = 'brightness(1.5)'; spr(en.type, A, f, x, feet + 2, en.face, en.scale, blink); ctx.restore(); }
    else spr(en.type, A, f, x, feet + 2, en.face, en.scale, blink);
    if (rage) ctx.restore();
  }
  function flashOn(cond) { return cond && strobe(5); }
  function drawNew(en, x, feet, blink) {
    const t = en.type, st = en.state;
    if (t === 'pegasus') { spr('pegasus', en.state === 'swoop' ? 'dive' : en.cast > 0 ? 'sonic' : 'idle', en.anim * 7, x, en.y + en.h / 2, en.face, 1.05, blink); return; }
    if (t === 'minotaur' || t === 'engine') {
      if (t === 'engine') {
        const moving = Math.abs(en.vx) > 1, a = en.hurt > 0.2 && st !== 'charge' && st !== 'sweep' ? 'hurt' : st === 'charge' ? 'charge' : st === 'wind' ? 'wind' : st === 'sweepWind' || st === 'sweep' || (st === 'rest' && en.swept && en.st > 0.45) ? 'sweep' : st === 'walk' && moving ? 'walk' : 'idle';
        const f = a === 'hurt' ? (en.hurt > 0.32 ? 0 : 1) : a === 'sweep' ? (st === 'sweepWind' ? 0 : st === 'sweep' ? (en.st > 0.17 ? 1 : 2) : 3) : a === 'wind' ? (en.st > 0.3 ? 0 : 1) : a === 'charge' ? en.anim * 10 : a === 'walk' ? en.anim * 7 : en.anim * 3;
        if (flashOn(st === 'wind' || st === 'sweepWind')) { ctx.save(); ctx.filter = 'brightness(1.6)'; spr('engine', a, f, x, feet + 1, en.face, 1, blink); ctx.restore(); } else spr('engine', a, f, x, feet + 1, en.face, 1, blink);
        return;
      }
      const set = t, a = st === 'charge' ? 'gore' : st === 'wind' ? 'idle' : st === 'walk' && Math.abs(en.vx) > 1 ? 'move' : 'idle';
      const f = en.anim * (st === 'charge' ? 9 : 4);
      if (flashOn(st === 'wind')) { ctx.save(); ctx.filter = 'brightness(1.6)'; spr(set, a, f, x, feet + 1, en.face, 1, blink); ctx.restore(); } else spr(set, a, f, x, feet + 1, en.face, 1, blink);
      return;
    }
    if (t === 'techno') {   // Medusa the Technomancer: eyes glow, eye beam, summon, hurt, idle hover
      const a = st === 'gazeWind' || st === 'gaze' ? 'gaze' : st === 'serp' ? 'summon' : en.hurt > 0.2 ? 'hurt' : 'idle';
      const f = st === 'gazeWind' ? 0 : st === 'gaze' ? (en.st > 0.2 ? 1 : 2) : a === 'summon' ? (0.9 - en.st) * 3.3 : a === 'hurt' ? (en.hurt > 0.32 ? 0 : 1) : en.anim * 4;
      if (flashOn(st === 'gazeWind')) { ctx.save(); ctx.shadowColor = '#e7c46a'; ctx.shadowBlur = 20; spr(t, a, f, x, feet + 1, en.face, en.scale || 1, blink); ctx.restore(); }
      else spr(t, a, f, x, feet + 1, en.face, en.scale || 1, blink);
      return;
    }
    if (t === 'medusa' || t === 'techno') {
      const a = st === 'gaze' ? (t === 'medusa' ? 'gaze' : 'gaze') : st === 'serp' ? (t === 'medusa' ? 'serp' : 'sum') : 'idle';
      const f = st === 'gaze' && t === 'techno' ? 1 : st === 'serp' ? (0.9 - en.st) * 3 : en.anim * 3;
      const sc = en.scale || 1;
      if (flashOn(st === 'gazeWind')) { ctx.save(); ctx.shadowColor = '#e7c46a'; ctx.shadowBlur = 20; spr(t, 'idle', 0, x, feet + 1, en.face, sc, blink); ctx.restore(); }
      else spr(t, a, f, x, feet + 1, en.face, sc, blink);
      if (st === 'gaze' && t === 'medusa') { ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#e7c46a'; const z = 140; ctx.beginPath(); ctx.moveTo(x + en.face * 12, feet - 44); ctx.lineTo(x + en.face * z, feet - 60); ctx.lineTo(x + en.face * z, feet - 8); ctx.closePath(); ctx.fill(); ctx.restore(); }
      return;
    }
    if (t === 'helios') { const cx = x, cy = en.y + en.h / 2;
      if (st === 'laserWind' && (calm || strobe(5))) { ctx.save(); ctx.strokeStyle = 'rgba(255,200,90,0.7)'; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, 12 * T); ctx.stroke(); ctx.restore(); }
      if (st === 'laser') { ctx.save(); ctx.shadowColor = '#ffb347'; ctx.shadowBlur = 20; ctx.fillStyle = 'rgba(255,220,140,0.9)'; ctx.fillRect(cx - 7, cy, 14, 12 * T - cy); ctx.fillStyle = '#fff'; ctx.fillRect(cx - 2, cy, 4, 12 * T - cy); ctx.restore(); spr('helios', 'laser', 2, cx, 12 * T - 20, 1, 0.9); }
      spr('helios', st === 'orbs' ? 'orbs' : 'idle', en.anim * 4, cx, cy, 1, 1.05, blink); return; }
    if (t === 'chiron') { spr('chiron', en.hurt > 0 ? 'idle' : en.draw ? 'shoot' : 'idle', en.anim * 3, x, feet + 1, en.face, 1, blink); return; }
    if (t === 'chariot') { spr('chariot', 'move', 0, x, en.y + en.h / 2, en.face, 1, blink); return; }
    if (t === 'colossus') {   // crouch, lift, overhead, release (boulder leaves at st 0.35) / raise, crouch, impact (st 0.45), recover
      const a = st === 'throw' ? 'throw' : st === 'slam' ? 'slam' : en.hurt > 0.2 ? 'hurt' : st === 'walk' && Math.abs(en.vx) > 1 ? 'walk' : 'idle';
      const f = a === 'throw' ? (en.st > 0.65 ? 0 : en.st > 0.5 ? 1 : en.st > 0.35 ? 2 : 3) : a === 'slam' ? (en.st > 0.68 ? 0 : en.st > 0.45 ? 1 : en.st > 0.25 ? 2 : 3) : a === 'hurt' ? (en.hurt > 0.32 ? 0 : 1) : a === 'walk' ? en.anim * 6 : en.anim * 3;
      spr('colossus', a, f, x, feet + 1, en.face, en.scale || 1, blink); return; }
    if (t === 'leviathan') { const a = st === 'emerge' ? 'emerge' : st === 'tent' ? 'tent' : st === 'cannon' ? 'cannon' : en.hurt > 0.2 ? 'hurt' : 'idle';
      const f = a === 'emerge' ? (0.6 - en.st) / 0.6 * 4 : a === 'tent' || a === 'cannon' ? (1 - en.st) * 4.4 : a === 'hurt' ? (en.hurt > 0.32 ? 0 : 1) : en.anim * 4;
      const sink = st === 'sub' ? 36 : 0; ctx.save(); ctx.beginPath(); ctx.rect(x - 240, 0, 480, 12 * T + 14); ctx.clip(); spr('leviathan', a, Math.min(f, 3.99), x, 12 * T + 18 * (en.scale || 1) + sink, en.face, en.scale || 1, blink); ctx.restore(); return; }
  }
  function drawSpearAt(x, y, ang, scale) {
    const fr = ATLAS.bfx && ATLAS.bfx.spear; if (!fr || !BOSSIMG.complete) return;
    const [sx, sy, w, h, ax, ay] = fr[0]; ctx.save(); ctx.translate(x, y); ctx.rotate(ang + 0.38); ctx.drawImage(BOSSIMG, sx, sy, w, h, -ax * scale, -ay * scale, w * scale, h * scale); ctx.restore();
  }
  function drawPlayerSpears() {
    L.pspears.forEach((sp) => { const ang = Math.atan2(sp.vy, sp.vx); drawSpearAt(sp.x - L.cam, sp.y, sp.face > 0 ? ang : ang, 0.75); });
  }
  function drawWater() {
    L.enemies.forEach((en) => { if (en.type !== 'leviathan' || !en.pit) return;
      const x0 = en.pit[0] * T - L.cam, w = (en.pit[1] - en.pit[0] + 1) * T, y = 12 * T + 8;
      ctx.fillStyle = 'rgba(40,110,160,0.85)'; ctx.fillRect(x0, y, w, ROWS * T + 40 - y); ctx.fillStyle = 'rgba(143,216,255,0.9)';
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
    if ((st === 'slamWind' || st === 'thrustWind' || st === 'blastWind') && strobe(5)) { ctx.save(); ctx.filter = 'brightness(1.6)'; spr('boss', anim, f, x, feet + 1, b.face, 1, blink, clip); ctx.restore(); }
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
    L.drones.forEach((d) => { if (!d.soul) return spr('bfx', 'drone', 0, d.x - L.cam, d.y + Math.sin(d.t * 8) * 2, 1, 0.85);
      const x = d.x - L.cam, y = d.y + Math.sin(d.t * 6) * 3, g = ctx.createRadialGradient(x, y, 2, x, y, 16); g.addColorStop(0, '#fff'); g.addColorStop(0.35, d.soul); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 16, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(20,10,30,0.8)'; ctx.fillRect(x - 5, y - 4, 3, 3); ctx.fillRect(x + 2, y - 4, 3, 3); });
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
      if (hasDie) spr(c.set, 'die', f, c.x - L.cam, c.y + (c.eagle ? 0 : 1) + (c.set === 'leviathan' ? 18 * (c.scale || 1) : 0), c.face, c.scale, a);
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
      } else if (it.type === 'spear') {
        const bob = Math.sin(L.t * 3 + it.x) * 4; ctx.save(); ctx.shadowColor = '#8fe6d2'; ctx.shadowBlur = 16; drawSpearAt(x + 14, y + 14 + bob, -0.9, 0.62); ctx.restore();
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

  function drawHud() {
    ctx.save(); ctx.scale(HS, HS);
    // a parchment strip with the gold double rule from the books
    ctx.fillStyle = '#efe6cf'; ctx.fillRect(0, 0, HW, 40); ctx.fillStyle = ctx.createPattern(grain, 'repeat'); ctx.fillRect(0, 0, HW, 40);
    ctx.fillStyle = '#a8842a'; ctx.fillRect(0, 40, HW, 1.5); ctx.fillRect(0, 43, HW, 1);
    const hsp = S.maxHp > 5 ? 20 : 26; for (let i = 0; i < S.maxHp; i++) drawHeart(22 + i * hsp, 20, S.maxHp > 5 ? 8 : 9, i < Math.max(0, P.hp) ? '#b8322d' : '#d8ccb0');
    { // stage and experience, on a small parchment tab under the strip
      const k = S.stage, lo = STAGES[k].xp, hi = k < 4 ? STAGES[k + 1].xp : lo, r = k < 4 ? (S.xp - lo) / (hi - lo) : 1;
      ctx.fillStyle = 'rgba(239,230,207,0.94)'; ctx.fillRect(8, 48, 214, 24); ctx.strokeStyle = '#a8842a'; ctx.lineWidth = 1; ctx.strokeRect(8, 48, 214, 24);
      ctx.fillStyle = '#2b1d10'; ctx.font = '700 13px "Cormorant Garamond", Georgia, serif'; ctx.textBaseline = 'middle'; ctx.fillText(`${ROMAN[k]} · ${STAGES[k].name}`, 15, 58);
      ctx.fillStyle = '#d8ccb0'; ctx.fillRect(15, 65, 200, 3.5); ctx.fillStyle = k >= 4 ? '#c9a227' : '#3d7bd8'; ctx.fillRect(15, 65, 200 * clamp(r, 0, 1), 3.5);
      ctx.textAlign = 'right'; ctx.font = '600 11px "Cormorant Garamond", Georgia, serif'; ctx.fillStyle = '#5a4a32'; ctx.fillText(k < 4 ? `${S.xp} / ${hi} XP` : `${S.xp} XP`, 215, 57); ctx.textAlign = 'left';
    }
    ctx.textBaseline = 'middle'; ctx.font = '700 19px "Cormorant Garamond", Georgia, serif';
    ctx.fillStyle = '#c9a227'; ctx.beginPath(); ctx.arc(172, 20, 8, 0, 7); ctx.fill(); ctx.strokeStyle = '#2b1d10'; ctx.lineWidth = 1.3; ctx.stroke();
    ctx.fillStyle = '#2b1d10'; ctx.fillText('× ' + S.coins, 186, 21);
    ctx.fillStyle = '#f6eed8'; ctx.fillRect(262, 13, 16, 14); ctx.strokeRect(262, 13, 16, 14); ctx.fillStyle = '#2b1d10'; ctx.fillText(`${S.scrolls.size} of ${SCROLLS.length} scrolls`, 286, 21);
    drawSpearAt(424, 22, -0.75, 0.32); ctx.fillStyle = S.spears ? '#2b1d10' : '#9a8a74'; ctx.fillText(`× ${S.spears}`, 442, 21); if (!S.spears && HS === 1) { ctx.font = 'italic 500 15px "Cormorant Garamond", Georgia, serif'; ctx.fillText(`${5 - S.killStreak} more foe${5 - S.killStreak === 1 ? '' : 's'} for a spear`, 478, 21); ctx.font = '700 19px "Cormorant Garamond", Georgia, serif'; }
    ctx.textAlign = 'right'; ctx.font = 'italic 600 19px "Cormorant Garamond", Georgia, serif'; if (HS === 1) ctx.fillText(`Chapter ${ROMAN[S.level]} · ${L.def.name}`, HW - 58, 21); ctx.textAlign = 'left';
    if (L.boss && L.bossOn && !L.boss.dead) {
      ctx.fillStyle = 'rgba(239,230,207,0.95)'; ctx.fillRect(HW / 2 - 165, 52, 330, 30); ctx.strokeStyle = '#a8842a'; ctx.lineWidth = 1.5; ctx.strokeRect(HW / 2 - 165, 52, 330, 30);
      ctx.fillStyle = '#d8ccb0'; ctx.fillRect(HW / 2 - 155, 70, 310, 7); ctx.fillStyle = '#6b2fa8'; ctx.fillRect(HW / 2 - 155, 70, 310 * (L.boss.hp / L.boss.maxHp), 7); ctx.strokeStyle = '#2b1d10'; ctx.lineWidth = 1; ctx.strokeRect(HW / 2 - 155, 70, 310, 7);
      ctx.fillStyle = '#2b1d10'; ctx.font = '700 13px "Cormorant Garamond", Georgia, serif'; ctx.textAlign = 'center'; ctx.fillText(L.boss.title, HW / 2, 61); if (L.boss.type === 'boss') { ctx.fillStyle = '#2b1d10'; [0.5, 0.2].forEach((r) => ctx.fillRect(HW / 2 - 155 + 310 * r - 1, 68, 2, 11)); } ctx.textAlign = 'left';
    }
    if (L.toast) {
      // styled like the "Philosophical Reflection" boxes in the books
      const a = Math.min(1, L.toast.life * 2, (5 - L.toast.life) * 4);
      ctx.globalAlpha = a; const w = Math.min(660, HW - 24), x = (HW - w) / 2, y = 92, h = 84;
      ctx.fillStyle = '#f3ead2'; ctx.fillRect(x, y, w, h); ctx.fillStyle = ctx.createPattern(grain, 'repeat'); ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#a8842a'; ctx.lineWidth = 1.5; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); ctx.lineWidth = 1; ctx.strokeRect(x + 5, y + 5, w - 10, h - 10);
      ctx.textAlign = 'center'; ctx.fillStyle = '#8a6a1e'; ctx.font = '700 11px "Cormorant Garamond", Georgia, serif';
      ctx.fillText(L.toast.cite === 'Boss' || L.toast.cite === 'Reach the standard' ? '✦  ' + L.toast.cite.toUpperCase() + '  ✦' : '✦  PHILOSOPHICAL REFLECTION  ✦', HW / 2, y + 18);
      ctx.fillStyle = '#2b1d10'; ctx.font = 'italic 500 21px "Cormorant Garamond", Georgia, serif';
      wrap('“' + L.toast.text + '”', HW / 2, y + 44, w - 50, 22);
      if (L.toast.cite !== 'Boss' && L.toast.cite !== 'Reach the standard') { ctx.fillStyle = '#8a6a1e'; ctx.font = '600 12px "Cormorant Garamond", Georgia, serif'; ctx.fillText('— ' + L.toast.cite, HW / 2, y + h - 12); }
      ctx.textAlign = 'left'; ctx.globalAlpha = 1;
    }
    ctx.textBaseline = 'alphabetic';
    ctx.restore();
  }
  function wrap(text, x, y, maxW, lh) {
    const words = text.split(' '); let line = ''; const lines = [];
    words.forEach((w) => { const test = line ? line + ' ' + w : w; if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test; });
    lines.push(line); if (lines.length > 1) y -= lh * 0.4;
    lines.slice(0, 2).forEach((l, i) => ctx.fillText(l, x, y + i * lh));
  }

  function render() {
    ctx.setTransform(RES, 0, 0, RES, 0, 0);
    ctx.save();
    if (L.shake && !calm) ctx.translate(rand(-6, 6) * L.shake * 2, rand(-6, 6) * L.shake * 2);
    const th = L.def.theme;
    drawBackground(th);
    ctx.save(); ctx.scale(ZOOM, ZOOM); ctx.translate(0, -(L.camY || 0));
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
    drawPlayerSpears();
    ctx.globalAlpha = 1;
    ctx.restore();
    if (P.dead) { ctx.fillStyle = `rgba(43,29,16,${clamp(1.2 - P.dead, 0, 0.55)})`; ctx.fillRect(0, 0, VW, VH); }
    ctx.restore();
    drawHud();
  }

  /* ================= flow ================= */
  const ov = { box: $('#overlay'), kicker: $('#ov-kicker'), title: $('#ov-title'), text: $('#ov-text'), go: $('#ov-go') };
  let ovNext = null;
  function overlay(kicker, title, text, label, next, art) {
    MUSIC.pause();
    S.mode = 'overlay'; ovNext = next;
    const im = $('#ov-img'); if (art) { im.src = art; im.hidden = false; } else im.hidden = true;
    ov.kicker.textContent = kicker; ov.title.textContent = title; ov.text.textContent = text; ov.go.textContent = label;
    ov.box.hidden = false; setTimeout(() => ov.go.focus({ preventScroll: true }), 30);
    Object.keys(keys).forEach((k) => { keys[k] = false; });
  }
  ov.go.addEventListener('click', () => { SFX.ensure(); ov.box.hidden = true; S.mode = 'play'; const n = ovNext; ovNext = null; if (n) n(); if (S.mode === 'play') MUSIC.resume(); last = performance.now(); });

  const gear = $('#gear'), panel = $('#settings');
  function openSettings(open) {
    if (!S) return;
    if (open && S.mode === 'play') { S.mode = 'menu'; MUSIC.pause(); Object.keys(keys).forEach((k) => { keys[k] = false; }); }
    if (!open && S.mode === 'menu') { S.mode = 'play'; MUSIC.resume(); last = performance.now(); }
    panel.hidden = !open; gear.setAttribute('aria-expanded', String(open));
    if (open) setTimeout(() => $('#set-close').focus({ preventScroll: true }), 30); else gear.focus({ preventScroll: true });
  }
  gear.addEventListener('click', () => { SFX.ensure(); openSettings(panel.hidden); });
  $('#set-close').addEventListener('click', () => openSettings(false));
  // title screen theme: Acta Non Verba starts on the first tap (browsers block sound until then)
  document.addEventListener('pointerdown', () => { if (!$('#s-title').hidden) { SFX.ensure(); MUSIC.play('acta'); } });
  $('#set-quit').addEventListener('click', () => { openSettings(false); MUSIC.play('acta'); S.mode = 'done'; $('#s-game').hidden = true; $('#s-title').hidden = false; showChapters(); showBest(); window.scrollTo({ top: 0 }); });
  function togglePause() {
    if (S.mode === 'play') overlay('Paused', 'Breathe', '“Receive without arrogance; let go without struggle.” Take a moment, then continue.', 'Resume', null);
    else if (S.mode === 'overlay' && ov.title.textContent === 'Breathe') ov.go.click();
  }
  $('#pause').addEventListener('click', () => { if (!S) return; openSettings(false); togglePause(); });
  const musicBtn = $('#music'); const syncMusic = () => { musicBtn.textContent = 'Music: ' + (MUSIC.on ? 'on' : 'off'); };
  musicBtn.addEventListener('click', () => { SFX.ensure(); MUSIC.toggle(); syncMusic(); }); syncMusic();
  const soundBtn = $('#sound'); const syncSound = () => { soundBtn.textContent = 'Sound: ' + (SFX.on ? 'on' : 'off'); };
  soundBtn.addEventListener('click', () => { SFX.ensure(); SFX.toggle(); syncSound(); }); syncSound();
  const calmBtn = $('#calm'); const syncCalm = () => { calmBtn.textContent = 'Calm mode: ' + (calm ? 'on' : 'off'); calmBtn.setAttribute('aria-pressed', String(calm)); };
  calmBtn.addEventListener('click', () => { calm = !calm; store.set('aq-calm', calm); syncCalm(); }); syncCalm();
  document.addEventListener('visibilitychange', () => { if (document.hidden && S && S.mode === 'play') togglePause(); });

  function levelComplete() {
    if (S.mode !== 'play') return;
    SFX.win(); S.score += 300; gainXP(100);
    const n = S.level, found = [...S.scrolls].filter((i) => Math.floor(i / 3) === n).length;
    if (n + 1 < LEVELS.length) overlay(`Chapter ${ROMAN[n]} complete`, LEVELS[n].name, `Coins: ${L.levelCoins} · Foes defeated: ${L.levelKills} · Scrolls found here: ${found} of 3${L.levelDeaths ? ' · Falls: ' + L.levelDeaths : ''}`, `On to ${LEVELS[n + 1].name}`, () => loadLevel(n + 1, true));
    else finish();
  }

  function finish() {
    MUSIC.stop();
    S.mode = 'done';
    const sc = S.scrolls.size;
    const all = SCROLLS.length, rank = sc === all && S.deaths <= 10 ? 'Philosopher-King' : sc >= all * 0.75 ? 'Stoic Champion' : sc >= all * 0.4 ? 'Legionary of Virtue' : 'Student of the Stoa';
    S.score += Math.max(0, 2000 - S.deaths * 150);
    $('#s-game').hidden = true; $('#s-final').hidden = false;
    $('#final-rank').textContent = rank;
    $('#final-line').textContent = sc === all ? 'You recovered every scroll of the Meditations. The Black Knight has fallen and the empire can think clearly again.' : `The Black Knight has fallen, but ${all - sc} scroll${all - sc === 1 ? ' is' : 's are'} still out there. Play again to find them all.`;
    const st = $('#final-stats'); st.replaceChildren();
    const mins = Math.floor(S.time / 60), secs = Math.floor(S.time % 60);
    [['Score', S.score.toLocaleString('en-US')], ['Marcus reached', `Stage ${ROMAN[S.stage]} · ${STAGES[S.stage].name} (${S.xp} XP)`], ['Scrolls recovered', `${sc} of ${all}`], ['Coins', String(S.coins)], ['Foes defeated', String(S.kills)], ['Falls', String(S.deaths)], ['Time', `${mins}:${String(secs).padStart(2, '0')}`]]
      .forEach(([k, v]) => { const li = document.createElement('li'); const b = document.createElement('b'); b.textContent = v; li.append(k + ': ', b); st.append(li); });
    const best = store.get('aq-best');
    if (!best || S.score > best.score) store.set('aq-best', { score: S.score, rank });
    showBest(); showChapters(); window.scrollTo({ top: 0 });
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

  $('#start').addEventListener('click', () => { SFX.ensure(); newRun(0); });
  $('#again').addEventListener('click', () => { SFX.ensure(); newRun(0); });
  // chapter select: every chapter you have reached can be started directly
  function showChapters() {
    const box = $('#chapters'), max = Math.min(LEVELS.length - 1, store.get('aq-unlocked') || 0); box.replaceChildren();
    if (max < 1) { box.hidden = true; return; }
    box.hidden = false; const lab = document.createElement('p'); lab.className = 'box-h'; lab.textContent = 'Continue from a chapter'; box.append(lab);
    const row = document.createElement('div'); row.className = 'chap-row';
    LEVELS.forEach((lv, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn btn-ghost btn-sm'; b.disabled = i > max;
      b.textContent = ROMAN[i]; b.title = lv.name + (i > max ? ' (locked)' : ''); b.setAttribute('aria-label', `Chapter ${ROMAN[i]}: ${lv.name}${i > max ? ', locked' : ''}`);
      b.addEventListener('click', () => { SFX.ensure(); newRun(i); }); row.append(b); });
    box.append(row);
  }
  showChapters();
  showBest();
})();
