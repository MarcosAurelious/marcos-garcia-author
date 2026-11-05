/* Aurelious Fighters — a one-on-one arena fighter by Marcos Garcia. Sprites shared with The Aurelious Quest. */
(() => {
  'use strict';
  const $ = (q) => document.querySelector(q);
  const store = { get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage off */ } } };
  const img = (src) => { const i = new Image(); i.src = src; return i; };
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let calm = store.get('af-calm'); if (calm === null) calm = reduceMotion;

  const ATLAS = {"warrior":{"idle":[[0,0,38,56,20,56],[40,0,42,56,21,56],[84,0,39,55,20,55]],"walk":[[125,0,38,50,19,50],[165,0,35,48,18,48],[202,0,37,48,17,48],[241,0,55,48,27,48]],"run":[[298,0,40,49,20,49],[340,0,41,48,20,48],[383,0,39,50,18,50],[424,0,37,48,17,48]],"jump":[[463,0,45,56,22,56],[510,0,38,55,18,55],[550,0,32,51,14,51],[584,0,35,49,17,49]],"attack":[[621,0,42,63,19,63],[665,0,37,64,13,64],[704,0,47,52,26,52],[753,0,46,47,17,47]],"hurt":[[801,0,37,64,18,64],[840,0,33,52,16,52],[875,0,35,51,17,51]],"die":[[912,0,42,46,22,46],[956,0,57,32,28,32],[0,66,52,29,26,29]]},"archer":{"idle":[[54,66,46,52,21,52],[102,66,38,51,15,51],[142,66,40,51,16,51]],"walk":[[184,66,43,48,19,48],[229,66,32,48,13,48],[263,66,35,50,16,50]],"run":[[300,66,46,48,20,48],[348,66,38,48,16,48],[388,66,41,48,20,48]],"jump":[[431,66,45,53,20,53],[478,66,38,49,14,49],[518,66,29,52,13,52]],"attack":[[549,66,48,50,16,50],[599,66,37,53,13,53],[638,66,44,51,14,51]],"hurt":[[684,66,48,51,21,51],[734,66,41,48,16,48],[777,66,35,52,12,52]],"die":[[814,66,48,38,26,38],[864,66,44,24,22,24],[910,66,40,27,19,27]]},"knight":{"idle":[[952,66,34,54,16,54],[988,66,34,53,15,53],[0,122,31,53,14,53]],"walk":[[33,122,34,49,15,49],[69,122,32,49,15,49],[103,122,36,48,18,48]],"run":[[141,122,39,50,17,50],[182,122,37,49,18,49],[221,122,35,50,16,50]],"jump":[[258,122,32,52,14,52],[292,122,34,50,17,50],[328,122,28,50,11,50]],"attack":[[358,122,42,64,20,64],[402,122,20,56,12,56],[424,122,36,59,12,59],[462,122,44,57,27,57]],"hurt":[[508,122,32,50,15,50],[542,122,34,48,16,48],[578,122,48,48,18,48]],"die":[[628,122,38,41,18,41],[668,122,42,29,19,29],[712,122,43,26,19,26]]},"commander":{"idle":[[757,122,72,104,37,104],[831,122,72,105,35,105],[905,122,67,100,36,100]],"walk":[[0,229,62,93,30,93],[64,229,68,93,32,93],[134,229,66,93,33,93]],"run":[[202,229,79,93,39,93],[283,229,79,91,36,91],[364,229,81,93,40,93]],"jump":[[447,229,74,100,29,100],[523,229,85,98,36,98],[610,229,70,100,34,100]],"attack":[[682,229,84,113,44,113],[768,229,86,115,37,115],[856,229,115,118,62,118]],"hurt":[[0,349,82,109,45,109],[84,349,70,88,34,88],[156,349,67,103,31,103]],"die":[[225,349,85,86,44,86],[312,349,85,79,40,79],[399,349,84,53,40,53]]},"priestess":{"idle":[[485,349,59,60,24,60],[546,349,49,59,24,59]],"walk":[[597,349,56,55,23,55],[655,349,50,54,24,54]],"run":[[707,349,54,56,25,56],[763,349,52,54,24,54]],"jump":[[817,349,55,62,24,62],[874,349,56,59,25,59]],"attack":[[932,349,40,69,23,69],[0,460,58,71,24,71]],"hurt":[[60,460,55,58,27,58],[117,460,73,61,38,61]],"die":[[192,460,67,43,32,43],[261,460,67,56,34,56]]},"companion":{"idle":[[330,460,21,30,10,30],[353,460,22,30,11,30],[377,460,22,32,11,32]],"walk":[[401,460,20,31,9,31],[423,460,20,28,10,28],[445,460,20,30,10,30],[467,460,19,29,9,29]],"run":[[488,460,29,33,11,33],[519,460,23,32,12,32],[544,460,22,32,11,32]],"jump":[[568,460,23,32,10,32],[593,460,24,35,11,35],[619,460,22,31,10,31]],"attack":[[643,460,35,37,23,37],[680,460,29,34,15,34],[711,460,32,40,18,40]],"hurt":[[745,460,27,33,14,33],[774,460,28,32,14,32],[804,460,27,33,14,33]],"die":[[833,460,22,31,9,31]]},"fx":{"slash":[[857,460,35,48,17,24]],"heal":[[894,460,73,70,36,35]],"swirl":[[0,533,79,40,39,20]],"comet":[[81,533,63,26,31,13]],"sun":[[146,533,28,34,14,17]],"star":[[176,533,27,28,13,14]],"dust":[[205,533,27,28,13,14]]},"eagle":{"fly":[[234,533,41,41,18,20],[277,533,38,39,16,19]],"dive":[[317,533,32,44,14,22],[351,533,42,44,20,22],[395,533,48,49,25,24],[445,533,43,53,21,26]],"glide":[[490,533,53,34,25,17],[545,533,41,29,20,14],[588,533,47,31,23,15]],"hurt":[[637,533,33,27,15,13],[672,533,38,34,22,17]],"die":[[712,533,46,33,20,16],[760,533,47,25,19,12]]},"coil":{"idle":[[809,533,58,91,29,91],[869,533,61,90,32,90],[932,533,63,95,30,95]],"beam":[[0,630,59,93,29,93],[61,630,57,91,28,91],[120,630,233,90,27,90]],"arc":[[355,630,64,99,34,99],[421,630,64,99,32,99],[487,630,108,99,41,99]],"hurt":[[597,630,57,98,28,98],[656,630,56,91,28,91],[714,630,46,96,25,96]],"die":[[762,630,59,90,30,90],[823,630,85,104,37,104]]},"boss":{"idle":[[0,0,122,110,63,110],[124,0,104,106,54,106],[230,0,125,108,65,108],[357,0,116,107,58,107]],"walk":[[475,0,110,96,58,96],[587,0,65,96,30,96],[654,0,74,96,35,96],[730,0,74,96,31,96]],"run":[[806,0,95,96,48,96],[903,0,75,96,31,96],[0,112,99,96,44,96]],"slam":[[101,112,178,95,51,95]],"blast":[[281,112,264,98,43,98]],"summon":[[547,112,187,98,52,98]],"thunder":[[736,112,191,108,59,108]],"shield":[[0,222,154,108,42,108]],"hurt":[[156,222,122,110,56,110]],"die":[[280,222,144,112,46,112]]},"bfx":{"spear":[[426,222,80,48,40,24]],"orb":[[508,222,33,35,16,17]],"drone":[[543,222,33,27,16,13]],"bolt":[[578,222,60,103,30,51]],"ring":[[640,222,121,107,60,53]],"burst":[[763,222,72,66,36,33]],"smoke":[[837,222,71,68,35,34]]}};
  const EATLAS = {"minotaur":{"idle":[[0,0,57,70,29,70],[59,0,53,69,25,69]],"move":[[114,0,69,65,37,65],[185,0,85,67,50,67]],"gore":[[272,0,84,56,59,56],[358,0,107,64,81,64]],"slam":[[467,0,182,68,131,68]]},"medusa":{"idle":[[651,0,40,66,24,66],[693,0,40,66,24,66]],"move":[[735,0,40,64,24,64],[777,0,42,64,28,64],[821,0,37,64,24,64]],"gaze":[[860,0,84,67,26,67]],"serp":[[946,0,37,61,24,61]]},"chiron":{"idle":[[0,72,52,70,20,70],[54,72,59,69,26,69]],"move":[[115,72,43,70,22,70],[160,72,69,69,31,69],[231,72,49,68,19,68]],"shoot":[[282,72,60,66,22,66]]},"chariot":{"idle":[[344,72,123,66,68,33]],"move":[[469,72,143,74,79,37]],"beam":[[614,72,95,55,52,27]]},"leviathan":{"idle":[[711,72,166,92,83,92]],"emerge":[[0,166,186,116,93,116]],"tent":[[188,166,241,102,121,102]],"cannon":[[431,166,219,99,109,99]]},"colossus":{"idle":[[652,166,106,100,50,100],[760,166,103,100,54,100],[865,166,118,100,47,100]],"slam":[[0,284,114,108,60,108],[116,284,97,108,56,108],[215,284,174,108,64,108]],"throw":[[391,284,86,91,48,91],[479,284,200,98,158,98]]},"techno":{"idle":[[681,284,75,64,42,64],[758,284,60,64,24,64],[820,284,63,64,20,64]],"gaze":[[885,284,46,65,16,65],[0,394,96,68,18,68]],"sum":[[98,394,39,57,18,57],[139,394,115,60,56,60],[256,394,54,57,24,57]]},"engine":{"idle":[[312,394,117,104,64,104],[431,394,119,101,54,101],[552,394,112,97,60,97]],"charge":[[666,394,139,99,78,99],[807,394,124,112,70,112],[0,508,119,121,58,121]],"sweep":[[121,508,126,96,74,96],[249,508,163,112,104,112],[414,508,101,94,50,94]]},"pegasus":{"idle":[[517,508,87,52,44,26],[606,508,61,60,48,30],[669,508,53,56,44,28]],"dive":[[724,508,72,62,44,31],[798,508,68,75,54,37],[868,508,80,76,66,38]],"sonic":[[0,631,77,60,52,30],[79,631,46,61,50,30]]},"helios":{"idle":[[127,631,63,54,31,27],[192,631,76,62,38,31],[270,631,50,60,25,30]],"orbs":[[322,631,71,60,36,30],[395,631,86,69,43,34],[483,631,51,61,26,30]],"laser":[[536,631,40,47,20,23],[578,631,71,63,36,31],[651,631,100,70,50,35]]},"efx":{"serpent":[[753,631,38,17,19,8]],"star":[[793,631,89,16,44,8]],"flare":[[884,631,51,43,25,21]],"rock":[[937,631,38,32,19,16]],"ring":[[0,703,58,38,29,19]],"sunorb":[[60,703,70,32,35,16]],"water":[[132,703,98,41,49,20]],"beam":[[232,703,87,28,43,14]]}};
  const XATLAS = {"cerberus":{"recover":[[0,0,164,128,67,128]],"special":[[1566,0,219,110,87,110]],"attack":[[1245,242,202,98,127,98]],"idle":[[655,345,134,96,67,96]],"walk":[[1473,345,171,95,81,95]],"wind":[[0,539,144,83,79,83]]},"blackknight":{"wind":[[166,0,87,123,48,123]],"special":[[819,0,148,114,48,114]],"attack":[[967,130,128,104,46,104]],"idle":[[1906,242,68,96,34,96]],"recover":[[1936,345,78,94,30,94]],"walk":[[1074,443,87,89,44,89]]},"stormtaur":{"wind":[[255,0,113,119,80,119]],"special":[[370,0,202,116,102,116]],"attack":[[0,242,187,101,88,101]],"recover":[[1084,242,159,98,76,98]],"idle":[[0,345,125,96,62,96]],"walk":[[943,443,129,91,72,91]]},"spider":{"special":[[574,0,243,116,154,116]],"wind":[[1124,0,166,113,84,113]],"recover":[[1381,0,183,110,102,110]],"walk":[[595,242,178,99,86,99]],"idle":[[485,345,168,96,84,96]],"attack":[[424,443,215,93,94,93]]},"king":{"special":[[969,0,153,113,109,113]],"wind":[[881,130,84,105,45,105]],"idle":[[1772,242,66,96,33,96]],"recover":[[1840,242,64,96,33,96]],"walk":[[1850,345,84,94,45,94]],"attack":[[1733,443,115,85,49,85]]},"templar":{"attack":[[1292,0,87,112,41,112]],"idle":[[1703,242,67,96,33,96]],"recover":[[1160,345,75,95,35,95]],"walk":[[771,443,89,91,51,91]],"wind":[[862,443,79,91,41,91]],"special":[[1295,443,138,88,51,88]]},"pluto":{"wind":[[1787,0,121,110,61,110]],"special":[[0,130,188,110,95,110]],"recover":[[775,242,127,99,59,99]],"idle":[[791,345,94,96,47,96]],"walk":[[1646,345,112,95,59,95]],"attack":[[270,539,178,80,61,80]]},"harpy":{"wind":[[190,130,105,109,58,109]],"attack":[[1097,130,138,104,72,104]],"special":[[1626,130,198,103,98,103]],"recover":[[1449,242,128,97,60,97]],"idle":[[366,345,117,96,58,96]],"walk":[[1357,345,114,95,60,95]]},"strider":{"special":[[297,130,184,108,103,108]],"recover":[[1826,130,103,103,51,103]],"wind":[[189,242,114,101,55,101]],"attack":[[305,242,176,101,55,101]],"walk":[[1579,242,122,97,69,97]],"idle":[[962,345,90,96,45,96]]},"titan":{"attack":[[483,130,162,107,102,107]],"wind":[[647,130,118,106,90,106]],"special":[[1424,130,200,103,86,103]],"idle":[[251,345,113,96,56,96]],"walk":[[304,443,118,93,62,93]],"recover":[[1163,443,130,89,72,89]]},"charon":{"wind":[[767,130,112,106,53,106]],"special":[[1237,130,185,104,99,104]],"idle":[[1054,345,104,96,51,96]],"walk":[[1435,443,125,87,59,87]],"recover":[[146,539,122,82,63,82]],"attack":[[450,539,186,78,63,78]]},"anubis":{"wind":[[483,242,110,100,67,100]],"idle":[[127,345,122,96,61,96]],"walk":[[1237,345,118,95,57,95]],"recover":[[0,443,130,94,71,94]],"attack":[[1562,443,169,86,85,86]],"special":[[638,539,191,77,105,77]]},"galvanic":{"special":[[904,242,178,99,86,99]],"idle":[[887,345,73,96,36,96]],"recover":[[1760,345,88,95,44,95]],"attack":[[132,443,170,94,54,94]],"walk":[[641,443,128,92,56,92]],"wind":[[1850,443,100,85,48,85]]}};
  const MATLAS = {"n2":{"idle":[[241,0,92,125,48,125],[1188,0,110,117,66,116]],"walk":[[1033,146,116,109,74,109],[1692,0,107,115,66,112]],"run":[[1033,146,116,109,74,109],[1692,0,107,115,66,112]],"jump":[[0,0,118,144,76,120]],"attack":[[241,0,92,125,48,125],[561,146,178,110,70,109],[561,146,178,110,70,109],[561,146,178,110,70,109]],"special":[[561,146,178,110,70,109]],"hurt":[[1188,0,110,117,66,116]]},"n5":{"idle":[[609,0,96,124,52,124],[950,0,118,120,68,120]],"walk":[[443,146,116,113,70,113],[111,146,110,115,61,112]],"run":[[443,146,116,113,70,113],[111,146,110,115,61,112]],"jump":[[120,0,119,143,78,119]],"attack":[[609,0,96,124,52,124],[1518,0,172,116,66,116],[1518,0,172,116,66,116],[1518,0,172,116,66,116]],"special":[[1518,0,172,116,66,116]],"hurt":[[950,0,118,120,68,120]]},"n4":{"idle":[[335,0,91,125,48,125],[0,146,109,115,66,115]],"walk":[[1331,146,121,109,80,108],[331,146,110,113,68,112]],"run":[[1331,146,121,109,80,108],[331,146,110,113,68,112]],"jump":[[823,0,125,121,82,121]],"attack":[[335,0,91,125,48,125],[1454,146,180,107,68,107],[1454,146,180,107,68,107],[1454,146,180,107,68,107]],"special":[[1454,146,180,107,68,107]],"hurt":[[0,146,109,115,66,115]]},"n1":{"idle":[[428,0,85,124,46,124],[1300,0,106,116,68,116]],"walk":[[741,146,115,109,74,109],[223,146,106,113,64,112]],"run":[[741,146,115,109,74,109],[223,146,106,113,64,112]],"jump":[[707,0,114,121,74,121]],"attack":[[428,0,85,124,46,124],[858,146,173,109,68,109],[858,146,173,109,68,109],[858,146,173,109,68,109]],"special":[[858,146,173,109,68,109]],"hurt":[[1300,0,106,116,68,116]]},"n3":{"idle":[[515,0,92,124,47,124],[1408,0,108,116,63,115]],"walk":[[1801,0,119,115,73,108],[1922,0,111,115,62,113]],"run":[[1801,0,119,115,73,108],[1922,0,111,115,62,113]],"jump":[[1070,0,116,119,75,118]],"attack":[[515,0,92,124,47,124],[1151,146,178,109,69,108],[1151,146,178,109,69,108],[1151,146,178,109,69,108]],"special":[[1151,146,178,109,69,108]],"hurt":[[1408,0,108,116,63,115]]}};
  const SFX = (() => {
    let ac = null, on = store.get('af-sound') !== false;
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
      tone, noise, ensure, get ac() { return ac; }, get on() { return on; }, toggle() { on = !on; store.set('af-sound', on); return on; },
      jump: () => tone(300, 620, 0.14, 'square', 0.05), coin: () => { tone(880, 880, 0.06, 'square', 0.05); tone(1320, 1320, 0.12, 'square', 0.05, 0.06); },
      slash: () => noise(0.12, 0.08, 2500), hit: () => tone(220, 90, 0.15, 'sawtooth', 0.07), stomp: () => tone(500, 120, 0.12, 'square', 0.07),
      hurt: () => tone(330, 110, 0.35, 'sawtooth', 0.08), bump: () => tone(140, 90, 0.08, 'square', 0.06), zap: () => noise(0.18, 0.04, 4000),
      scroll: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.12, 'triangle', 0.07, i * 0.08)),
      power: () => [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, f * 1.01, 0.1, 'square', 0.05, i * 0.06)),
      win: () => [523, 523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.16, 'triangle', 0.08, i * 0.13)),
      boss: () => tone(90, 60, 0.6, 'sawtooth', 0.09),
    };
  })();
  const MUSIC = (() => {
    let on = store.get('af-music') !== false, ac = null, master = null, crunch = null, gtrL = null, gtrR = null, leadBus = null, noise = null, timer = null, track = null, name = '', step = 0, nextT = 0, running = false;
    const NOTE = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
    const hz = (s) => { const m = /^([A-G][#b]?)(\d)$/.exec(s); return 440 * Math.pow(2, (NOTE[m[1]] + (+m[2] + 1) * 12 - 69) / 12); };
    const seq = (str) => { const t = str.trim().split(/\s+/), out = new Array(t.length).fill(null); t.forEach((x, i) => { if (x === '-' || x === '.') return; let d = 1; while (t[i + d] === '-') d++; out[i] = { f: hz(x), d }; }); return out; };
    const ch = (s) => s.split(' ').map(hz);
    const T = {
      // Chapter I: a heroic charge in D minor (i, VI, III, VII)
      ch1: { bpm: 136, wave: 'square', leadVol: 0.065, harm: 0.03, bass: 'octave', pad: 0.03, arp: 2, arpWave: 'triangle', arpVol: 0.03,
        kick: [0, 4, 8, 12], snare: [4, 12], hat: [2, 6, 10, 14], tick: true, fill: true,
        chords: [ch('D3 F3 A3'), ch('Bb2 D3 F3'), ch('F3 A3 C4'), ch('C3 E3 G3')],
        lead: [seq('D5 - D5 - A4 - D5 - F5 - E5 - D5 - C5 - Bb4 - D5 - F5 - Bb5 - A5 - - - F5 - - - F5 - A5 - C6 - A5 - G5 - F5 - E5 - C5 - E5 - G5 - - - F5 - E5 - C5 - - - - -'),
               seq('A5 - - - G5 - F5 - G5 - A5 - - - D5 - F5 - - - E5 - D5 - E5 - F5 - - - Bb4 - C5 - F5 - A5 - C6 - Bb5 - A5 - G5 - F5 - G5 - - - A5 - - - C6 - - - A5 - G5 -')] },
      // Chapter II: the laboratory, an electric dance in E Phrygian dominant
      ch2: { bpm: 140, wave: 'square', leadVol: 0.055, harm: 0.025, bass: 'octave', arp: 1, arpWave: 'square', arpVol: 0.026,
        kick: [0, 4, 8, 12], snare: [4, 12], hat: [2, 6, 10, 14], tick: true, fill: true,
        chords: [ch('E3 G#3 B3'), ch('F3 A3 C4'), ch('E3 G#3 B3'), ch('D3 F3 A3')],
        lead: [seq('E5 - E5 - G#5 - B5 - A5 - G#5 - F5 - E5 - F5 - A5 - C6 - A5 - G#5 - - - E5 - - - E5 - G#5 - B5 - E6 - D6 - C6 - B5 - A5 - F5 - E5 - D5 - F5 - E5 - - - - - - -'),
               seq('B5 - - - A5 - G#5 - A5 - B5 - - - E5 - C6 - - - B5 - A5 - B5 - C6 - - - F5 - G#5 - B5 - E6 - B5 - G#5 - B5 - E6 - F6 - E6 - D6 - C6 - B5 - A5 - G#5 - F5 - E5 -')] },
      // Chapter III: the cosmos, soaring and bright in A minor (i, VI, III, VII)
      ch3: { bpm: 128, wave: 'triangle', leadVol: 0.085, harm: 0.035, bass: 'octave', pad: 0.04, arp: 1, arpWave: 'sine', arpVol: 0.03,
        kick: [0, 4, 8, 12], snare: [4, 12], hat: [2, 6, 10, 14], tick: true, fill: true,
        chords: [ch('A2 C3 E3'), ch('F2 A2 C3'), ch('C3 E3 G3'), ch('G2 B2 D3')],
        lead: [seq('E5 - A5 - C6 - B5 - A5 - - - E5 - G5 - F5 - - - E5 - C5 - A4 - C5 - - - - - G5 - C6 - E6 - D6 - C6 - - - G5 - E5 - D5 - G5 - B5 - A5 - G5 - - - - - - -'),
               seq('A5 - - - C6 - - - B5 - A5 - G5 - E5 - F5 - A5 - C6 - A5 - F5 - - - C5 - - - E5 - G5 - C6 - G5 - E6 - - - D6 - C6 - B5 - - - D6 - - - G5 - A5 - B5 - D6 -')] },
      // Chapter VI: storm over the hills, driving G minor
      ch4: { bpm: 144, wave: 'square', leadVol: 0.06, harm: 0.028, bass: 'octave', pad: 0.025, arp: 2, arpWave: 'triangle', arpVol: 0.03,
        kick: [0, 4, 8, 10, 12], snare: [4, 12], hat: [2, 6, 10, 14], tick: true, fill: true,
        chords: [ch('G2 Bb2 D3'), ch('Eb3 G3 Bb3'), ch('Bb2 D3 F3'), ch('F3 A3 C4')],
        lead: [seq('G5 - Bb5 - D6 - Bb5 - G5 - - - D5 - G5 - Eb5 - G5 - Bb5 - G5 - Eb5 - - - Bb4 - Eb5 - D5 - F5 - Bb5 - A5 - G5 - F5 - D5 - F5 - C5 - F5 - A5 - C6 - A5 - - - - - - -'),
               seq('D6 - - - C6 - Bb5 - A5 - G5 - - - D5 - Eb6 - - - D6 - C6 - Bb5 - G5 - - - Eb5 - F5 - Bb5 - D6 - F6 - D6 - Bb5 - F5 - D5 - F5 - A5 - C6 - F6 - E6 - C6 - A5 - F5 -')] },
      // Chapter VII: the Underworld gate, dark and pounding E minor
      ch5: { bpm: 132, wave: 'sawtooth', leadVol: 0.05, harm: 0.03, bass: 'gallop', pad: 0.035, arp: 2, arpWave: 'square', arpVol: 0.022,
        kick: [0, 4, 6, 8, 12], snare: [4, 12], hat: [2, 6, 10, 14], tick: true, fill: true,
        chords: [ch('E3 G3 B3'), ch('C3 E3 G3'), ch('D3 F#3 A3'), ch('B2 D#3 F#3')],
        lead: [seq('E5 - - - B4 - E5 - G5 - F#5 - E5 - D#5 - E5 - G5 - C6 - B5 - A5 - G5 - E5 - - - D5 - F#5 - A5 - D6 - C6 - A5 - F#5 - A5 - B4 - D#5 - F#5 - B5 - A5 - F#5 - D#5 - B4 -'),
               seq('B5 - - - A5 - G5 - F#5 - G5 - A5 - B5 - C6 - - - B5 - A5 - G5 - E5 - G5 - C6 - D6 - - - C6 - B5 - A5 - F#5 - D5 - F#5 - D#6 - - - B5 - - - F#5 - - - D#5 - - -')] },
      // Chapter VIII: the Kingdom of Pluto, haunting B minor with a big pad
      ch6: { bpm: 126, wave: 'triangle', leadVol: 0.085, harm: 0.03, bass: 'octave', pad: 0.045, arp: 1, arpWave: 'sine', arpVol: 0.03,
        kick: [0, 4, 8, 12], snare: [4, 12], hat: [2, 6, 10, 14], tick: true, fill: true,
        chords: [ch('B2 D3 F#3'), ch('G2 B2 D3'), ch('D3 F#3 A3'), ch('A2 C#3 E3')],
        lead: [seq('F#5 - B5 - D6 - C#6 - B5 - - - F#5 - - - G5 - B5 - D6 - B5 - G5 - - - D5 - - - A5 - F#5 - D5 - F#5 - A5 - D6 - F#6 - D6 - E6 - C#6 - A5 - E5 - A5 - C#6 - E6 - - -'),
               seq('D6 - - - C#6 - B5 - C#6 - D6 - F#6 - - - G6 - - - F#6 - E6 - D6 - B5 - G5 - - - F#6 - - - E6 - D6 - A5 - F#5 - A5 - D6 - E6 - - - C#6 - A5 - E5 - - - A5 - - -')] },
      // Chapter IX: the Galvanic Forge, fast hammering F# minor
      ch7: { bpm: 150, wave: 'square', leadVol: 0.055, harm: 0.026, bass: 'gallop', arp: 1, arpWave: 'square', arpVol: 0.024,
        kick: [0, 4, 8, 12, 14], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14], tick: true, fill: true,
        chords: [ch('F#3 A3 C#4'), ch('D3 F#3 A3'), ch('E3 G#3 B3'), ch('C#3 F3 G#3')],
        lead: [seq('F#5 F#5 - F#5 A5 - C#6 - F#5 F#5 - F#5 E5 - C#5 - D5 D5 - D5 F#5 - A5 - D6 - C#6 - A5 - F#5 - E5 E5 - E5 G#5 - B5 - E6 - D6 - B5 - G#5 - C#5 - F5 - G#5 - C#6 - B5 - G#5 - F5 - C#5 -'),
               seq('C#6 - - - B5 - A5 - G#5 - A5 - B5 - C#6 - D6 - - - C#6 - B5 - A5 - F#5 - A5 - D6 - E6 - - - D6 - C#6 - B5 - G#5 - B5 - E6 - F6 - - - C#6 - - - G#5 - - - F5 - - -')] },
      // Chapter X: the Edge of Eternity, a heroic finale in D major
      ch8: { bpm: 138, wave: 'square', leadVol: 0.06, harm: 0.03, bass: 'octave', pad: 0.04, arp: 2, arpWave: 'triangle', arpVol: 0.03,
        kick: [0, 4, 8, 12], snare: [4, 12], hat: [2, 6, 10, 14], tick: true, fill: true,
        chords: [ch('D3 F#3 A3'), ch('A2 C#3 E3'), ch('B2 D3 F#3'), ch('G2 B2 D3')],
        lead: [seq('D5 - F#5 - A5 - D6 - - - A5 - F#5 - A5 - C#6 - - - A5 - E5 - A5 - C#6 - E6 - - - D6 - - - B5 - F#5 - B5 - D6 - F#6 - - - G6 - F#6 - E6 - D6 - B5 - D6 - E6 - - -'),
               seq('F#6 - - - E6 - D6 - E6 - F#6 - A6 - - - E6 - - - C#6 - A5 - C#6 - E6 - A6 - - - F#6 - - - D6 - B5 - D6 - F#6 - B6 - - - G6 - - - F#6 - E6 - D6 - E6 - F#6 - G6 -')] },
      // The knights' gauntlet: a galloping A minor battle theme
      knights: { bpm: 172, wave: 'sawtooth', leadVol: 0.045, harm: 0.022, bass: 'gallop', pad: 0.02, arp: 2, arpWave: 'square', arpVol: 0.022,
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
      boss: { bpm: 166, wave: 'sawtooth', leadVol: 0.045, harm: 0.022, bass: 'gallop', pad: 0, arp: 2, arpWave: 'square', arpVol: 0.022,
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
      if (tr.chug) { const pc = tr.chug[b]; if (pc !== '.') { let d = 1; while (b + d < 16 && tr.chug[b + d] === '.') d++; strum(c[0], t, pc === 'O' ? sd * d * 0.95 : pc === 'o' ? sd * Math.min(d, 2) * 0.8 : sd * 0.55, tr.power * (pc === 'x' ? 1.5 : 1.25), pc === 'x'); } }
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
      acta: { src: 'music/acta-non-verba.mp3?v=2', loopStart: 31.37, loopEnd: 95.3738, vol: 1.0 },   // Acta Non Verba (instrumental): intro plays once, then 0:31-1:35 loops
      ego: { src: 'music/ego-death.mp3?v=2', loopStart: 16.625, loopEnd: 66.2807, vol: 1.0 },           // Ego Death (instrumental): 0:16-1:06 loops
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
      master.gain.cancelScheduledValues(ac.currentTime); master.gain.setTargetAtTime(['boss', 'knights', 'riot', 'legion', 'arena', 'stomp', 'hellfire', 'machine', 'sack'].includes(name) ? 0.36 : 0.32, ac.currentTime, 0.25); }
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
      toggle() { on = !on; store.set('af-music', on); if (on) this.resume(); else { halt(0.1); if (ac) songHalt(true); } return on; },
    };
  })();


  /* ================= fighter sounds: every legend sounds different ================= */
  const VOICE = {
    marcus: { hit: () => { SFX.noise(0.08, 0.07, 3500); SFX.tone(900, 400, 0.08, 'square', 0.04); }, sp: () => { SFX.tone(300, 1400, 0.3, 'sawtooth', 0.05); SFX.noise(0.35, 0.05, 2500); } },
    mars: { hit: () => { SFX.tone(1400, 1300, 0.12, 'square', 0.05); SFX.noise(0.06, 0.06, 4000); }, sp: () => { SFX.noise(0.3, 0.08, 900); SFX.tone(200, 90, 0.3, 'sawtooth', 0.07); } },
    colossus: { hit: () => { SFX.noise(0.25, 0.09, 200); SFX.tone(110, 45, 0.3, 'sawtooth', 0.08); }, sp: () => { SFX.noise(0.7, 0.12, 120); SFX.tone(80, 30, 0.8, 'sawtooth', 0.1); SFX.noise(0.12, 0.08, 5000); } },
    medusa: { hit: () => SFX.noise(0.22, 0.07, 6000), sp: () => { SFX.noise(0.5, 0.06, 7000); SFX.tone(600, 300, 0.5, 'triangle', 0.05); SFX.tone(640, 280, 0.5, 'triangle', 0.04); } },
    minotaur: { hit: () => SFX.tone(140, 60, 0.22, 'sawtooth', 0.09), sp: () => { SFX.tone(160, 50, 0.5, 'sawtooth', 0.1); SFX.noise(0.5, 0.08, 150); } },
    vulcan: { hit: () => { SFX.tone(1250, 1200, 0.25, 'triangle', 0.08); SFX.tone(1870, 1850, 0.2, 'triangle', 0.05); }, sp: () => { SFX.noise(0.6, 0.11, 100); SFX.tone(70, 35, 0.6, 'sawtooth', 0.1); } },
    chiron: { hit: () => SFX.tone(700, 260, 0.12, 'triangle', 0.08), sp: () => [880, 1100, 1320, 1760].forEach((f, i) => SFX.tone(f, f, 0.12, 'triangle', 0.06, i * 0.06)) },
    diana: { hit: () => { SFX.tone(820, 300, 0.1, 'triangle', 0.08); SFX.noise(0.05, 0.05, 5000); }, sp: () => { SFX.tone(400, 2200, 0.18, 'sine', 0.07); SFX.noise(0.2, 0.05, 6000); } },
    cerberus: { hit: () => { SFX.tone(95, 70, 0.25, 'sawtooth', 0.09); SFX.noise(0.18, 0.06, 300); }, sp: () => { SFX.tone(120, 60, 0.7, 'sawtooth', 0.11); SFX.tone(180, 90, 0.7, 'sawtooth', 0.07); SFX.noise(0.6, 0.08, 400); } },
    pegasus: { hit: () => SFX.tone(900, 1400, 0.1, 'square', 0.05), sp: () => { SFX.tone(700, 1500, 0.15, 'square', 0.05); SFX.tone(1500, 600, 0.25, 'square', 0.05, 0.15); SFX.noise(0.4, 0.05, 1500); } },
    helios: { hit: () => SFX.tone(1200, 1700, 0.12, 'sine', 0.07), sp: () => { SFX.tone(200, 1200, 0.5, 'sawtooth', 0.07); SFX.tone(1600, 1600, 0.4, 'sine', 0.04); } },
    neptune: { hit: () => SFX.noise(0.18, 0.09, 600), sp: () => { SFX.noise(0.9, 0.12, 300); SFX.tone(90, 60, 0.8, 'sine', 0.08); } },
    hades: { hit: () => SFX.tone(320, 140, 0.25, 'sine', 0.09), sp: () => { SFX.tone(60, 30, 0.9, 'sawtooth', 0.11); [220, 207, 196].forEach((f, i) => SFX.tone(f, f * 0.7, 0.5, 'sine', 0.05, i * 0.12)); } },
  };
  /* ---- fighter voices: a small formant synthesizer (a glottal buzz shaped by vowel resonances), so every legend yells in their own voice ---- */
  const VOWEL = { a: [730, 1090, 2440], o: [570, 840, 2410], e: [530, 1840, 2480], i: [300, 2200, 3000], u: [330, 870, 2240] };
  // f0: pitch · fs: formant size (lower = bigger body) · rasp: growl · hiss/ring/echo: character colour · kind: how the lines are voiced
  const VOX = {
    marcus: { f0: 128, fs: 1, rasp: 0.15 }, mars: { f0: 98, fs: 0.9, rasp: 0.45 }, colossus: { f0: 72, fs: 0.78, rasp: 0.3, ring: 0.5 }, medusa: { f0: 235, fs: 1.18, rasp: 0.1, hiss: 0.6 },
    minotaur: { f0: 70, fs: 0.8, rasp: 0.85, kind: 'beast' }, vulcan: { f0: 88, fs: 0.86, rasp: 0.55 }, chiron: { f0: 142, fs: 1, rasp: 0.12 }, diana: { f0: 265, fs: 1.2, rasp: 0.05 },
    cerberus: { f0: 190, fs: 0.95, rasp: 0.7, kind: 'hound' }, pegasus: { f0: 520, fs: 1.45, rasp: 0.1, kind: 'horse' }, helios: { f0: 180, fs: 1.05, rasp: 0, kind: 'machine', ring: 0.8 },
    neptune: { f0: 82, fs: 0.82, rasp: 0.6, hiss: 0.8, kind: 'beast' }, hades: { f0: 66, fs: 0.76, rasp: 0.5, echo: 0.45 },
  };
  const LINES = {   // [vowel, seconds, pitch start, pitch peak, pitch end, loudness] per syllable: short, rising, chopped off hard, like a kiai
    atk: [['a', 0.13, 1.2, 1.45, 1.35, 1.1]],                                             // "HAH!"
    jab: [['u', 0.065, 1.25, 1.35, 1.3, 0.7]],                                            // "HUP"
    sp: [['i', 0.055, 1.3, 1.4, 1.4, 0.85], ['a', 0.2, 1.4, 1.7, 1.5, 1.2]],              // "HI-YAH!"
    sup: [['o', 0.07, 1.15, 1.25, 1.25, 0.9], ['a', 0.42, 1.35, 1.8, 1.6, 1.3]],          // "RAAAH!" climbing
    hurt: [['u', 0.075, 1.3, 1.35, 1.15, 0.8]],                                           // a clipped "UGH"
    ko: [['a', 0.38, 1.7, 1.75, 1.25, 1.2]],                                              // a short, defiant cry
    win: [['a', 0.1, 1.35, 1.45, 1.45, 1], ['a', 0.1, 1.45, 1.55, 1.55, 1.05], ['a', 0.3, 1.55, 1.8, 1.7, 1.25]],   // "HA! HA! HAAH!"
  };
  const vLast = {};
  function speak(ch, line) {
    const ac = SFX.ac, V = VOX[ch.id]; if (!SFX.on || !ac || !V || !LINES[line]) return false;
    const now = ac.currentTime; if ((line === 'atk' || line === 'jab' || line === 'hurt') && vLast[ch.id] > now - 0.22) return true; vLast[ch.id] = now;
    const out = ac.createGain(); out.gain.value = 1.4; out.connect(ac.destination);
    if (V.echo) { const d = ac.createDelay(1), fb = ac.createGain(), wet = ac.createGain(); d.delayTime.value = 0.16; fb.gain.value = V.echo * 0.6; wet.gain.value = V.echo; out.connect(d); d.connect(fb).connect(d); d.connect(wet).connect(ac.destination); }
    let t = now + 0.005, kind = V.kind || 'human', syl = LINES[line];
    if (kind === 'hound' && (line === 'atk' || line === 'sp' || line === 'sup' || line === 'win')) syl = [0, 1, 2].map(() => ['a', 0.11, 1.3, 1.4, 0.8, 0.9]);   // three heads, three barks
    if (kind === 'horse' && line !== 'jab') syl = [['i', line === 'hurt' ? 0.25 : 0.55, 1.0, 1.5, 0.75, 0.9]];   // a whinny
    if (kind === 'beast' && line !== 'jab') syl = syl.map(([v, d, a, b, c, l]) => ['o', d * 1.15, a * 0.95, b, c * 0.95, l]);   // roars
    const breath = (at, dur, vol) => { const n = ac.createBufferSource(), b = ac.createBuffer(1, Math.ceil(ac.sampleRate * dur), ac.sampleRate), dd = b.getChannelData(0); for (let i = 0; i < dd.length; i++) dd[i] = Math.random() * 2 - 1;
      const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800 * V.fs; bp.Q.value = 0.8; const g = ac.createGain(); g.gain.setValueAtTime(0.0001, at); g.gain.linearRampToValueAtTime(vol, at + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      n.buffer = b; n.connect(bp).connect(g).connect(out); n.start(at); n.stop(at + dur + 0.02); };
    if (line === 'atk' || line === 'sp' || line === 'sup' || line === 'win') { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(V.f0 * 0.9, t); o.frequency.exponentialRampToValueAtTime(V.f0 * 0.5, t + 0.08); g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1); o.connect(g).connect(out); o.start(t); o.stop(t + 0.12); }
    if (kind === 'human' && line !== 'hurt' && line !== 'jab') { breath(t, 0.05, 0.07); t += 0.03; }
    syl.forEach(([vow, dur, p0, p1, p2, loud]) => {
      const f0 = V.f0 * (0.97 + Math.random() * 0.06), src = ac.createOscillator(); src.type = kind === 'machine' ? 'square' : 'sawtooth';
      src.frequency.setValueAtTime(f0 * p0, t); src.frequency.linearRampToValueAtTime(f0 * p1, t + dur * 0.3); src.frequency.exponentialRampToValueAtTime(f0 * p2, t + dur);
      const vib = ac.createOscillator(), vg = ac.createGain(); vib.frequency.value = kind === 'horse' ? 9 : 5.5; vg.gain.value = f0 * (kind === 'horse' ? 0.07 : kind === 'human' ? 0 : 0.01); vib.connect(vg).connect(src.frequency);
      const amp = ac.createGain(); amp.gain.setValueAtTime(0.0001, t); amp.gain.linearRampToValueAtTime(0.13 * loud, t + 0.008); amp.gain.setValueAtTime(0.12 * loud, t + dur * 0.7); amp.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.03);
      let node = src; if (!speak.drive) { speak.drive = ac.createWaveShaper(); const cv = new Float32Array(512); for (let i = 0; i < 512; i++) { const x = i / 255.5 - 1; cv[i] = Math.tanh(x * 3.2); } speak.drive.curve = cv; }
      const dr = ac.createWaveShaper(); dr.curve = speak.drive.curve; src.connect(dr); node = dr;
      if (V.rasp) { const lfo = ac.createOscillator(), lg = ac.createGain(), rg = ac.createGain(); lfo.type = 'square'; lfo.frequency.value = 28 + Math.random() * 14; lg.gain.value = V.rasp * 0.5; rg.gain.value = 1 - V.rasp * 0.5; lfo.connect(lg).connect(rg.gain); dr.connect(rg); node = rg; lfo.start(t); lfo.stop(t + dur + 0.05); }
      const F = VOWEL[vow].map((x) => x * V.fs); [1, 0.6, 0.35].forEach((lv, k) => { const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = F[k]; bp.Q.value = 6 + k * 3; const g = ac.createGain(); g.gain.value = lv * 3.2; node.connect(bp).connect(g).connect(amp); });
      if (V.ring) { const r = ac.createOscillator(), rg = ac.createGain(); r.type = 'sine'; r.frequency.value = kind === 'machine' ? 1240 : 420; rg.gain.setValueAtTime(0.05 * V.ring * loud, t); rg.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.25); r.connect(rg).connect(out); r.start(t); r.stop(t + dur + 0.3); }
      if (V.hiss) breath(t, dur + 0.1, 0.06 * V.hiss * loud);
      if (kind === 'beast' || kind === 'hound') breath(t, dur, 0.04 * loud);
      amp.connect(out); src.start(t); src.stop(t + dur + 0.05); vib.start(t); vib.stop(t + dur + 0.05); t += dur + (kind === 'hound' ? 0.05 : 0.03);
    });
    return true;
  }

  /* ---- impact sound design: bat-on-heavy-bag thuds, ringing metal, lasers, spell-casting; all synthesized, no files ---- */
  const FX = (() => {
    let bus = null, verb = null, nb = null;
    const A = () => SFX.ac;
    function init() {
      const ac = A(); if (!ac) return false; if (bus) return true;
      bus = ac.createDynamicsCompressor(); bus.threshold.value = -14; bus.ratio.value = 5; bus.attack.value = 0.002; bus.release.value = 0.12;
      const trim = ac.createGain(); trim.gain.value = 0.55; const lim = ac.createDynamicsCompressor(); lim.threshold.value = -3; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.001; lim.release.value = 0.08; bus.connect(trim).connect(lim).connect(ac.destination);
      const len = ac.sampleRate * 1.6; nb = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); const d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      verb = ac.createConvolver(); const ir = ac.createBuffer(2, len, ac.sampleRate); for (let c = 0; c < 2; c++) { const x = ir.getChannelData(c); for (let i = 0; i < len; i++) x[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); } verb.buffer = ir;
      const vg = A().createGain(); vg.gain.value = 0.5; verb.connect(vg).connect(bus); return true;
    }
    const ok = () => SFX.on && A() && init();
    function env(g, t, a, peak, dec) { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); }
    function osc(type, f1, f2, t, dur, vol, wet = 0, a = 0.002, pan = 0) {
      const ac = A(), o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f1, t); if (f2 !== f1) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
      env(g, t, a, vol, dur); o.connect(g); let n = g; if (pan && ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = pan; g.connect(p); n = p; }
      n.connect(bus); if (wet) { const w = ac.createGain(); w.gain.value = wet; n.connect(w).connect(verb); } o.start(t); o.stop(t + a + dur + 0.05); return o;
    }
    function noise(t, dur, vol, type, f1, f2 = f1, q = 0.8, wet = 0, a = 0.001) {
      const ac = A(), n = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); n.buffer = nb; n.loop = true;
      f.type = type; f.Q.value = q; f.frequency.setValueAtTime(f1, t); if (f2 !== f1) f.frequency.exponentialRampToValueAtTime(f2, t + dur);
      env(g, t, a, vol, dur); n.connect(f).connect(g).connect(bus); if (wet) { const w = ac.createGain(); w.gain.value = wet; g.connect(w).connect(verb); } n.start(t, Math.random() * 0.5); n.stop(t + a + dur + 0.05);
    }
    const now = () => A().currentTime + 0.003;
    return {
      // a bat on a heavy bag: a deep body thump, the leather slap, and a short dull smack
      thud(heavy) { if (!ok()) return; const t = now(), k = heavy ? 1.35 : 1;
        osc('sine', 150 * (heavy ? 0.8 : 1), 42, t, 0.22 * k, 0.75 * k);
        osc('triangle', 95, 55, t, 0.12 * k, 0.35);
        noise(t, 0.05, 0.55 * k, 'bandpass', 2600, 1500, 0.9);
        noise(t, 0.16 * k, 0.6 * k, 'lowpass', 900, 220, 0.7);
        if (heavy) noise(t + 0.01, 0.35, 0.18, 'lowpass', 400, 120, 0.5, 0.25); },
      // steel on steel: inharmonic ringing partials over a bright scrape
      clang(big) { if (!ok()) return; const t = now(), base = 520 + Math.random() * 140, k = big ? 1.2 : 0.85;
        [1, 2.31, 3.17, 4.53, 5.96].forEach((r, i) => osc('sine', base * r, base * r * 0.995, t, (0.55 - i * 0.07) * k, 0.22 / (1 + i * 0.5), 0.35, 0.001, (i % 2 ? 0.25 : -0.25)));
        noise(t, 0.09, 0.7, 'highpass', 3500, 3500, 0.7, 0.2); noise(t, 0.04, 0.6, 'bandpass', 1800, 1800, 2); },
      // a shield block: a dull clank, then a little ring
      block() { if (!ok()) return; const t = now(); noise(t, 0.06, 0.45, 'bandpass', 1200, 900, 1.5); osc('sine', 880, 870, t, 0.25, 0.16, 0.25); osc('sine', 1320, 1310, t, 0.18, 0.1, 0.25); osc('sine', 120, 60, t, 0.08, 0.4); },
      // the swing whoosh before a hit
      whoosh(heavy) { if (!ok()) return; const t = now(); noise(t, heavy ? 0.22 : 0.13, heavy ? 0.9 : 0.6, 'bandpass', 600, 2800, 1.6, 0, 0.04); },
      // a sci-fi laser: a falling FM zap with a bright tail
      laser(big) { if (!ok()) return; const ac = A(), t = now(), dur = big ? 0.5 : 0.3;
        const o = ac.createOscillator(), m = ac.createOscillator(), mg = ac.createGain(), g = ac.createGain(); o.type = 'sawtooth'; m.type = 'square';
        o.frequency.setValueAtTime(big ? 2200 : 1800, t); o.frequency.exponentialRampToValueAtTime(big ? 140 : 220, t + dur); m.frequency.setValueAtTime(big ? 90 : 60, t); mg.gain.value = big ? 600 : 300;
        m.connect(mg).connect(o.frequency); const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5000; env(g, t, 0.004, big ? 0.45 : 0.34, dur);
        o.connect(lp).connect(g).connect(bus); const w = ac.createGain(); w.gain.value = 0.3; g.connect(w).connect(verb); o.start(t); m.start(t); o.stop(t + dur + 0.05); m.stop(t + dur + 0.05);
        osc('sine', 3200, 900, t, 0.08, 0.12); if (big) noise(t, 0.4, 0.15, 'bandpass', 4000, 800, 3, 0.3); },
      // electric crackle for lightning
      zap() { if (!ok()) return; const t = now(); for (let i = 0; i < 6; i++) noise(t + i * 0.03 + Math.random() * 0.02, 0.03, 0.3, 'highpass', 2500 + Math.random() * 3000, 2500, 0.7, 0.15); osc('square', 90, 60, t, 0.2, 0.1); },
      // a spell: a breath of air rising into a shimmering chord of bells
      spell(big, root = 440) { if (!ok()) return; const t = now(), k = big ? 1.5 : 1;
        noise(t, 0.45 * k, 0.45, 'bandpass', 300, 5000, 4, 0.5, 0.15);
        [1, 1.25, 1.5, 2, 2.5, 3].forEach((r, i) => { osc('sine', root * r, root * r * 1.003, t + 0.12 + i * 0.05 * k, 0.6 * k, 0.15, 0.8, 0.02, i % 2 ? 0.4 : -0.4); osc('triangle', root * r * 2.01, root * r * 2.01, t + 0.12 + i * 0.05 * k, 0.3 * k, 0.05, 0.8); });
        if (big) osc('sine', root / 2, root / 2, t, 1.2, 0.12, 0.6, 0.3); },
      // fire and fury: a rumbling roar
      fire(big) { if (!ok()) return; const t = now(); noise(t, big ? 0.9 : 0.5, 0.9, 'lowpass', 300, 1800, 0.6, 0.3, 0.05); noise(t + 0.05, big ? 0.7 : 0.4, 0.4, 'bandpass', 2500, 900, 1, 0.2, 0.05); osc('sawtooth', 70, 45, t, big ? 0.8 : 0.4, 0.12); },
      // water: a crashing wash
      wave(big) { if (!ok()) return; const t = now(); noise(t, big ? 1.1 : 0.7, 0.75, 'bandpass', 400, 1500, 0.5, 0.4, 0.15); noise(t + 0.2, 0.6, 0.35, 'highpass', 3000, 6000, 0.5, 0.3, 0.1); },
      // a lightning strike: a split-second white crack, a buzzing sizzle, a few branching snaps
      lightning(big) { if (!ok()) return; const t = now(), k = big ? 1.3 : 1;
        noise(t, 0.05, 1.1 * k, 'highpass', 1200, 1200, 0.5, 0.4);
        noise(t, 0.12 * k, 0.6 * k, 'bandpass', 5000, 2000, 1.2, 0.35);
        for (let i = 0; i < (big ? 7 : 4); i++) noise(t + 0.03 + i * 0.022 + Math.random() * 0.015, 0.02, 0.45, 'highpass', 3000 + Math.random() * 4000, 3000, 0.7, 0.3);
        const ac = A(), o = ac.createOscillator(), m = ac.createOscillator(), mg = ac.createGain(), g = ac.createGain(); o.type = 'sawtooth'; o.frequency.value = 120; m.type = 'square'; m.frequency.value = 37; mg.gain.value = 90; m.connect(mg).connect(o.frequency);
        env(g, t, 0.002, 0.18 * k, 0.35 * k); const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 400; o.connect(hp).connect(g).connect(bus); o.start(t); m.start(t); o.stop(t + 0.45 * k); m.stop(t + 0.45 * k); },
      // thunder: a sharp clap, then a deep roll that rumbles unevenly and fades, delayed like the real thing
      thunder(big, delay = 0.12) { if (!ok()) return; const ac = A(), t = now() + delay, dur = big ? 2.4 : 1.5;
        noise(t, 0.18, 0.9, 'lowpass', 2400, 600, 0.6, 0.5);
        const n = ac.createBufferSource(), lp = ac.createBiquadFilter(), g = ac.createGain(), am = ac.createGain(); n.buffer = nb; n.loop = true; lp.type = 'lowpass'; lp.Q.value = 0.7;
        lp.frequency.setValueAtTime(700, t); lp.frequency.exponentialRampToValueAtTime(90, t + dur);
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(big ? 1.4 : 1.0, t + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        am.gain.setValueAtTime(1, t); let x = t + 0.1; while (x < t + dur) { am.gain.linearRampToValueAtTime(0.35 + Math.random() * 0.9, x); x += 0.08 + Math.random() * 0.18; }   // the uneven rolls
        n.connect(lp).connect(am).connect(g).connect(bus); const w = ac.createGain(); w.gain.value = 0.6; g.connect(w).connect(verb); n.start(t, Math.random() * 0.4); n.stop(t + dur + 0.05);
        osc('sine', 55, 32, t, dur * 0.7, big ? 0.5 : 0.35, 0.3, 0.05); },
      // the knockout: a huge body slam with a metal crash tail
      ko() { if (!ok()) return; const t = now(); osc('sine', 120, 30, t, 0.6, 0.9); noise(t, 0.4, 0.6, 'lowpass', 1200, 150, 0.7, 0.4); this.clang(true); },
    };
  })();
  // each legend's sound palette: what their strikes and specials sound like
  const STYLE = {
    marcus: { hit: 'blade', sp: 'zap' }, mars: { hit: 'blade', sp: 'clang' }, colossus: { hit: 'thud', sp: 'zap' }, medusa: { hit: 'thud', sp: 'spell', root: 370 },
    minotaur: { hit: 'thud', sp: 'fire' }, vulcan: { hit: 'hammer', sp: 'fire' }, chiron: { hit: 'thud', sp: 'spell', root: 523 }, diana: { hit: 'thud', sp: 'spell', root: 587 },
    cerberus: { hit: 'thud', sp: 'fire' }, pegasus: { hit: 'thud', sp: 'laser' }, helios: { hit: 'tech', sp: 'laser' }, neptune: { hit: 'thud', sp: 'wave' }, hades: { hit: 'blade', sp: 'spell', root: 220 },
  };
  function strikeSound(f, heavy) {   // what a landed hit sounds like
    const S = STYLE[f.ch.id] || { hit: 'thud' }, punch = f.move === 'light' || f.move === 'heavy';
    FX.thud(heavy);
    if ((S.hit === 'blade' && punch) || S.hit === 'hammer') FX.clang(heavy || S.hit === 'hammer');
    else if (S.hit === 'tech') FX.laser(false);
  }
  const STORM = ['marcus', 'colossus', 'helios', 'pegasus', 'mars', 'hades'];   // legends who call the storm on every special
  function castSound(f, big) {   // the special or super going off: every special cracks lightning, every super rolls thunder
    const S = STYLE[f.ch.id] || { sp: 'laser' };
    FX.lightning(big); if (big || STORM.includes(f.ch.id)) FX.thunder(big, big ? 0.15 : 0.22);
    if (S.sp === 'spell') FX.spell(big, S.root); else if (S.sp === 'laser') FX.laser(big); else if (S.sp === 'zap') { FX.zap(); FX.laser(big); }
    else if (S.sp === 'fire') FX.fire(big); else if (S.sp === 'wave') FX.wave(big); else if (S.sp === 'clang') { FX.whoosh(true); FX.clang(true); }
  }
  const voice = (f, k) => { const v = VOICE[f.ch.id]; if (v) v[k](); else (k === 'hit' ? SFX.hit() : SFX.zap()); };

  /* ================= art ================= */
  const Q = '../quest/img/';
  const SPR = img(Q + 'sprites.webp'), BOSSIMG = img(Q + 'boss.webp'), ENEMYIMG = img(Q + 'enemies.webp'), ELITEIMG = img(Q + 'elites.webp'), MARCUSIMG = img(Q + 'marcus.webp');
  const LATLAS = {};
  const PATLAS = {};
  const NATIVE = {"colossus":1,"medusa":1,"minotaur":1,"pegasus":1,"helios":1,"mars":-1,"neptune":1,"vulcan":1,"chiron":-1,"diana":1,"cerberus":1,"hades":1};   // which way each portrait faces in the art
  const FATLAS = {"f_mars":{"idle":[[1689,673,136,200,70,200],[1827,673,127,200,64,200]],"walk":[[741,1079,114,199,60,199],[1689,673,136,200,70,200],[1562,1079,114,198,62,198],[1689,673,136,200,70,200]],"jump":[[1562,1079,114,198,62,198]],"light":[[0,2062,161,187,72,187]],"heavy":[[753,2251,199,180,92,180]],"lkick":[[0,1676,164,192,66,192]],"hkick":[[166,1676,194,192,62,192]],"hurt":[[1337,2062,172,184,72,184]],"ko":[[1337,2062,172,184,72,184],[782,2768,239,64,119,64]],"special":[[1385,0,197,220,96,220]],"victory":[[857,1079,147,199,70,199]]},"f_colossus":{"idle":[[0,877,137,200,88,200],[139,877,129,200,80,200]],"walk":[[1811,1079,161,197,92,197],[0,877,137,200,88,200],[326,1281,140,196,92,196],[0,877,137,200,88,200]],"jump":[[326,1281,140,196,92,196]],"light":[[1755,1870,196,188,100,188]],"heavy":[[1734,2062,220,182,94,182]],"lkick":[[656,1480,146,193,92,193]],"hkick":[[1357,1870,227,189,90,189]],"hurt":[[614,2062,182,186,114,186]],"ko":[[614,2062,182,186,114,186],[1023,2768,223,63,111,63]],"special":[[1349,243,224,211,114,211]],"victory":[[1575,243,161,210,102,210]]},"f_medusa":{"idle":[[270,877,125,200,61,200],[1006,1079,139,199,61,199]],"walk":[[1793,1281,121,194,61,194],[270,877,125,200,61,200],[1248,1281,131,195,69,195],[270,877,125,200,61,200]],"jump":[[1248,1281,131,195,69,195]],"light":[[1546,2251,163,178,71,178]],"heavy":[[1183,2435,209,168,83,168]],"lkick":[[798,2062,123,185,55,185]],"hkick":[[923,2062,205,185,57,185]],"hurt":[[1656,2435,138,162,83,162]],"ko":[[1656,2435,138,162,83,162],[1507,2768,211,59,105,59]],"special":[[211,243,183,215,85,215]],"victory":[[1739,1676,135,190,69,190]]},"f_minotaur":{"idle":[[397,877,158,200,75,200],[929,461,146,205,75,205]],"walk":[[0,1281,137,197,63,197],[397,877,158,200,75,200],[468,1281,136,196,59,196],[397,877,158,200,75,200]],"jump":[[468,1281,136,196,59,196]],"light":[[1511,2062,221,183,91,183]],"heavy":[[163,2062,241,187,113,187]],"lkick":[[606,1281,134,196,71,196]],"hkick":[[742,1281,233,196,77,196]],"hurt":[[804,1480,177,193,85,193]],"ko":[[804,1480,177,193,85,193],[533,2768,247,69,123,69]],"special":[[437,461,244,208,117,208]],"victory":[[1738,243,186,210,103,210]]},"f_vulcan":{"idle":[[557,877,155,200,74,200],[933,673,153,201,74,201]],"walk":[[1774,461,154,202,70,202],[557,877,155,200,74,200],[1147,1079,167,199,80,199],[557,877,155,200,74,200]],"jump":[[1147,1079,167,199,80,199]],"light":[[954,2251,219,180,86,180]],"heavy":[[0,1870,243,190,136,190]],"lkick":[[362,1676,196,192,78,192]],"hkick":[[560,1676,238,192,80,192]],"hurt":[[0,1480,174,194,86,194]],"ko":[[0,1480,174,194,86,194],[1411,2614,250,85,125,85]],"special":[[1088,673,231,201,120,201]],"victory":[[484,0,202,235,90,235]]},"f_chiron":{"idle":[[714,877,162,200,81,200],[878,877,167,200,85,200]],"walk":[[800,1676,176,192,93,192],[714,877,162,200,81,200],[1563,1676,174,191,97,191],[714,877,162,200,81,200]],"jump":[[1563,1676,174,191,97,191]],"light":[[978,1676,189,192,101,192]],"heavy":[[176,1480,237,194,85,194]],"lkick":[[0,461,199,210,61,210]],"hkick":[[683,461,244,208,61,208]],"hurt":[[1047,877,171,200,75,200]],"ko":[[1047,877,171,200,75,200],[1663,2614,254,79,127,79]],"special":[[1584,0,238,220,103,220]],"victory":[[956,0,190,225,89,225]]},"f_diana":{"idle":[[1220,877,131,200,69,200],[1321,673,130,201,69,201]],"walk":[[1678,1079,131,198,71,198],[1220,877,131,200,69,200],[1169,1676,137,192,75,192],[1220,877,131,200,69,200]],"jump":[[1169,1676,137,192,75,192]],"light":[[1586,1870,167,189,83,189]],"heavy":[[1711,2251,235,177,119,177]],"lkick":[[1381,1281,184,195,53,195]],"hkick":[[1567,1281,224,195,55,195]],"hurt":[[1175,2251,165,180,77,180]],"ko":[[1175,2251,165,180,77,180],[1248,2768,257,63,128,63]],"special":[[1148,0,235,224,81,224]],"victory":[[1824,0,150,216,71,216]]},"f_cerberus":{"idle":[[1353,877,244,200,122,200],[1316,1079,244,199,122,199]],"walk":[[0,2251,239,182,124,182],[1353,877,244,200,122,200],[510,2251,241,181,130,181],[1353,877,244,200,122,200]],"jump":[[510,2251,241,181,130,181]],"light":[[417,2435,248,175,126,175]],"heavy":[[241,2251,267,182,120,181]],"lkick":[[415,1480,239,194,124,194]],"hkick":[[245,1870,255,190,116,190]],"hurt":[[396,243,217,215,112,215]],"ko":[[396,243,217,215,112,215],[689,2614,268,136,134,136]],"special":[[0,0,239,241,122,241]],"victory":[[241,0,241,239,132,238]]},"f_hades":{"idle":[[1599,877,168,200,78,200],[1769,877,167,200,78,200]],"walk":[[502,1870,182,190,94,190],[1599,877,168,200,78,200],[983,1480,188,193,98,193],[1599,877,168,200,78,200]],"jump":[[983,1480,188,193,98,193]],"light":[[255,2614,216,146,68,146]],"heavy":[[473,2614,214,140,64,140]],"lkick":[[1077,461,199,203,58,203]],"hkick":[[1130,243,217,213,66,213]],"hurt":[[1796,2435,214,161,64,161]],"ko":[[1796,2435,214,161,64,161],[959,2614,212,123,106,123]],"special":[[0,673,211,202,92,202]],"victory":[[213,673,212,202,104,202]]},"f_pegasus":{"idle":[[0,1079,190,200,95,200],[1173,1480,194,193,99,193]],"walk":[[1369,1480,199,193,97,193],[0,1079,190,200,95,200],[1570,1480,197,193,97,193],[0,1079,190,200,95,200]],"jump":[[1570,1480,197,193,97,193]],"light":[[1453,673,234,201,93,201]],"heavy":[[427,673,284,202,107,202]],"lkick":[[1278,461,223,203,83,203]],"hkick":[[1503,461,269,203,95,203]],"hurt":[[406,2062,206,187,121,187]],"ko":[[406,2062,206,187,121,187],[257,2768,274,72,137,72]],"special":[[840,243,288,214,85,214]],"victory":[[0,243,209,216,105,216]]},"f_helios":{"idle":[[192,1079,180,200,90,200],[374,1079,183,200,94,200]],"walk":[[1769,1480,162,193,92,193],[192,1079,180,200,90,200],[686,1870,155,190,88,190],[192,1079,180,200,90,200]],"jump":[[686,1870,155,190,88,190]],"light":[[1308,1676,253,192,88,192]],"heavy":[[843,1870,272,190,90,190]],"lkick":[[1117,1870,238,190,94,190]],"hkick":[[977,1281,269,196,104,196]],"hurt":[[0,2435,204,177,120,177]],"ko":[[0,2435,204,177,120,177],[1173,2614,236,96,118,96]],"special":[[688,0,266,232,134,232]],"victory":[[713,673,218,202,114,202]]},"f_neptune":{"idle":[[559,1079,180,200,90,200],[139,1281,185,197,96,197]],"walk":[[1342,2251,202,180,106,180],[559,1079,180,200,90,200],[0,2614,253,152,114,152],[559,1079,180,200,90,200]],"jump":[[0,2614,253,152,114,152]],"light":[[206,2435,209,177,80,177]],"heavy":[[930,2435,251,170,90,170]],"lkick":[[667,2435,261,174,80,174]],"hkick":[[1394,2435,260,168,60,168]],"hurt":[[1130,2062,205,185,104,185]],"ko":[[1130,2062,205,185,104,185],[0,2768,255,75,127,75]],"special":[[615,243,223,215,122,215]],"victory":[[201,461,234,210,122,210]]}};
  const FIGHTIMG = img('fighters.webp');
  const AATLAS = {"a_mars":{"light":[[176,430,188,192,109,192],[176,229,219,198,111,198],[0,625,241,177,119,177],[770,430,224,180,111,180]],"heavy":[[755,229,176,193,107,193],[0,430,174,193,105,193],[366,430,199,190,117,190],[567,430,201,190,129,190]],"lkick":[[461,0,154,200,85,200],[803,0,162,199,93,199],[0,229,174,199,105,199],[617,0,184,200,107,200]],"hkick":[[583,229,170,197,101,197],[247,0,212,203,109,203],[0,0,245,227,125,227],[397,229,184,198,111,198]],"idle":[[461,0,154,200,85,200],[583,229,170,197,101,197]],"walk":[[803,0,162,199,93,199],[0,229,174,199,105,199],[617,0,184,200,107,200],[0,229,174,199,105,199]],"jump":[[0,430,174,193,105,193]],"hurt":[[755,229,176,193,107,193]],"special":[[247,0,212,203,109,203],[0,0,245,227,125,227]],"victory":[[0,0,245,227,125,227]]},"a_marcus":{"light":[[838,427,185,201,102,201],[408,427,184,202,100,202],[594,427,242,202,120,202],[684,632,184,199,96,199]],"heavy":[[0,427,193,203,108,203],[485,218,209,204,128,204],[618,1036,258,185,82,185],[0,1036,192,196,104,196]],"lkick":[[173,632,167,200,88,200],[342,632,161,200,72,200],[195,427,211,203,78,203],[696,218,158,204,80,204]],"hkick":[[593,0,187,209,92,209],[228,0,177,212,84,212],[0,218,265,207,92,207],[407,0,184,211,98,211]],"idle":[[505,632,177,200,96,200],[0,835,165,199,92,199],[510,835,168,197,100,197],[431,1036,185,194,108,194]],"walk":[[680,835,164,197,94,197],[167,835,168,198,102,198],[337,835,171,198,96,198],[0,632,171,201,94,201]],"jump":[[167,835,168,198,102,198],[0,632,171,201,94,201]],"hurt":[[0,1234,191,179,94,179]],"ko":[[193,1234,187,159,96,159],[382,1234,217,121,108,121],[601,1234,227,80,113,80]],"special":[[267,218,216,207,106,207],[194,1036,235,196,150,196]],"victory":[[0,0,226,216,96,216]]},"a_colossus":{"light":[[0,410,172,196,106,196],[597,410,173,191,106,191],[0,608,209,187,102,187],[772,410,169,189,98,189]],"heavy":[[165,208,186,199,120,199],[788,0,200,201,128,201],[174,410,241,194,112,194],[417,410,178,193,106,193]],"lkick":[[0,208,163,200,96,200],[353,208,161,199,100,199],[516,208,199,199,86,199],[717,208,149,198,86,198]],"hkick":[[176,0,179,204,100,204],[0,0,174,206,114,206],[357,0,251,204,92,204],[610,0,176,204,106,204]]},"a_medusa":{"light":[[785,420,169,199,98,199],[0,624,186,198,102,198],[188,624,222,198,88,198],[619,420,164,200,90,200]],"heavy":[[0,214,189,204,98,204],[162,420,217,201,98,201],[191,214,246,204,100,204],[439,214,180,204,94,204]],"lkick":[[848,214,156,203,90,203],[621,214,225,204,92,204],[381,420,236,201,98,201],[0,420,160,202,96,202]],"hkick":[[240,0,193,209,90,209],[0,0,238,212,92,212],[615,0,246,207,86,207],[435,0,178,209,108,209]]},"a_minotaur":{"light":[[668,213,161,196,81,196],[831,213,185,196,85,196],[0,416,203,196,83,196],[428,416,160,195,81,195]],"heavy":[[0,614,184,192,87,192],[205,416,221,196,91,196],[590,416,252,193,91,193],[507,213,159,199,79,199]],"lkick":[[149,213,149,200,73,200],[742,0,146,201,73,201],[300,213,205,200,67,200],[0,213,147,201,75,201]],"hkick":[[426,0,150,207,77,207],[256,0,168,208,97,208],[0,0,254,211,75,211],[578,0,162,204,83,204]]},"a_vulcan":{"light":[[715,433,168,198,79,198],[327,433,179,199,85,199],[0,635,220,198,83,198],[222,635,168,198,79,198]],"heavy":[[0,220,203,211,93,211],[608,0,221,212,97,212],[723,220,257,202,99,202],[380,220,184,203,91,203]],"lkick":[[0,433,164,200,77,200],[566,220,155,203,75,203],[508,433,205,199,77,199],[166,433,159,200,71,200]],"hkick":[[435,0,171,214,83,214],[0,0,174,218,83,218],[176,0,257,218,77,218],[205,220,173,210,81,210]]},"a_chiron":{"light":[[547,220,163,200,86,200],[0,430,167,198,90,198],[670,430,234,197,94,197],[169,430,158,198,86,198]],"heavy":[[367,220,178,205,98,205],[265,0,199,210,102,210],[466,0,259,209,108,209],[329,430,175,198,96,198]],"lkick":[[506,430,162,198,92,198],[0,630,160,197,68,197],[162,630,229,196,74,196],[712,220,148,199,88,199]],"hkick":[[0,220,178,208,96,208],[180,220,185,208,72,208],[0,0,263,218,72,218],[727,0,162,209,88,209]]},"a_diana":{"light":[[177,216,152,200,77,200],[483,216,164,199,91,199],[649,216,216,199,87,199],[331,216,150,200,77,200]],"heavy":[[699,0,163,201,87,201],[0,216,175,201,103,201],[0,419,250,197,113,197],[854,419,161,193,87,193]],"lkick":[[252,419,136,195,77,195],[390,419,131,195,69,195],[523,419,202,195,75,195],[727,419,125,194,69,194]],"hkick":[[247,0,152,204,85,204],[401,0,155,204,73,204],[0,0,245,214,79,214],[558,0,139,204,81,204]]},"a_cerberus":{"light":[[574,0,248,200,111,200],[469,427,249,191,113,191],[284,815,243,181,111,181],[724,225,234,194,111,194]],"heavy":[[720,427,228,191,111,191],[0,622,225,191,111,191],[227,622,309,191,111,191],[538,622,244,191,111,191]],"lkick":[[486,225,236,195,111,195],[232,427,235,192,107,192],[0,815,282,191,109,191],[0,427,230,193,111,193]],"hkick":[[0,225,239,200,111,200],[308,0,264,201,109,201],[0,0,306,223,181,223],[241,225,243,197,107,197]]},"a_pegasus":{"light":[[213,438,212,200,111,200],[419,231,206,203,115,203],[0,641,251,196,113,196],[627,231,205,201,105,201]],"heavy":[[427,438,211,199,111,199],[486,0,221,212,117,212],[709,0,310,212,115,212],[0,438,211,201,111,201]],"lkick":[[726,641,210,186,109,186],[640,438,212,198,111,198],[253,641,254,196,125,196],[509,641,215,191,111,191]],"hkick":[[0,231,210,205,109,205],[286,0,198,215,115,215],[0,0,284,229,143,229],[212,231,205,205,105,205]]},"a_helios":{"light":[[461,410,166,200,84,188],[629,410,198,200,94,187],[0,614,218,200,86,187],[220,614,174,200,84,187]],"heavy":[[0,0,208,203,110,190],[210,0,218,203,110,190],[179,205,240,202,102,189],[421,205,171,202,84,189]],"lkick":[[594,205,160,202,84,189],[430,0,187,203,84,189],[619,0,217,203,86,197],[838,0,155,203,82,190]],"hkick":[[756,205,172,202,88,188],[0,410,223,202,110,186],[225,410,234,202,94,197],[0,205,177,203,84,189]]},"a_neptune":{"light":[[681,621,222,200,110,200],[232,621,222,202,110,202],[456,621,223,202,110,202],[0,621,230,203,110,203]],"heavy":[[746,208,229,204,112,204],[742,0,234,205,112,205],[0,415,250,204,106,204],[252,415,260,204,102,204]],"lkick":[[0,0,231,206,102,206],[514,415,247,204,104,204],[233,0,248,206,114,206],[483,0,257,206,106,206]],"hkick":[[0,208,244,205,114,205],[763,415,244,204,124,204],[246,208,246,205,120,205],[494,208,250,205,126,205]]},"a_hades":{"light":[[201,0,204,204,116,204],[467,409,206,196,106,196],[675,409,230,195,108,195],[430,610,201,182,110,182]],"heavy":[[0,0,199,205,118,205],[643,0,193,201,110,201],[210,207,227,199,114,199],[407,0,234,204,106,204]],"lkick":[[0,610,216,187,92,187],[218,610,210,182,96,182],[218,610,210,182,96,182],[633,610,197,169,108,169]],"hkick":[[439,207,210,199,116,199],[651,207,210,199,114,199],[0,409,227,199,136,199],[229,409,236,199,156,199]]}};   // 4-phase attack frames: wind-up, wind-up, strike, return
  const ATKIMG = {}; const atkImg = (set) => ATKIMG[set] || (ATKIMG[set] = img('atk/' + set.slice(2) + '.webp'));   // one small file per fighter, loaded on demand
  const GENERATED = window.__ARENA_GENERATED_ATLAS || {};
  const GENERATED_IMAGES = {};
  const generatedImg = (set) => GENERATED_IMAGES[set] || (GENERATED_IMAGES[set] = img('generated/' + set.slice(2) + '.webp'));
  const ALL = Object.assign({}, ATLAS, EATLAS, XATLAS, MATLAS, FATLAS, AATLAS, GENERATED);
  const imgFor = (set) => (GENERATED[set] ? generatedImg(set) : AATLAS[set] ? atkImg(set) : FATLAS[set] ? FIGHTIMG : set === 'boss' || set === 'bfx' ? BOSSIMG : MATLAS[set] ? MARCUSIMG : XATLAS[set] ? ELITEIMG : EATLAS[set] ? ENEMYIMG : SPR);
  const PIXEL = new Set(['knight', 'archer', 'commander', 'priestess', 'warrior', 'fx']);
  function frameOf(set, anim, i) { const fr = ALL[set] && ALL[set][anim]; if (!fr) return null; return fr[((Math.floor(i) % fr.length) + fr.length) % fr.length]; }
  function spr(g, set, anim, i, x, y, face = 1, scale = 1, alpha = 1) {
    const f = frameOf(set, anim, i); const im = imgFor(set); if (!f || !im.complete || !im.naturalWidth) return;
    const [sx, sy, w, h, ax, ay] = f;
    g.save(); if (alpha !== 1) g.globalAlpha *= alpha; g.imageSmoothingEnabled = !PIXEL.has(set);
    g.translate(Math.round(x), Math.round(y)); if (face < 0) g.scale(-1, 1);
    g.drawImage(im, sx, sy, w, h, -ax * scale, -ay * scale, w * scale, h * scale); g.restore();
  }
  const BGN = ['bg-pantheon', 'bg-tesla', 'bg-planets', 'bg-orbs', 'bg-eternity', 'bg-underworld', 'bg-pluto', 'bg-sketch', 'bg-chamber', 'bg-lab', 'bg-battlefield', 'bg-colosseum', 'bg-hades', 'bg-gate', 'bg-sea', 'bg-gorgon', 'bg-labyrinth', 'bg-forge', 'bg-chiron', 'bg-diana'];
  const LOCAL_BG = ['bg-battlefield', 'bg-colosseum', 'bg-hades', 'bg-gate', 'bg-sea', 'bg-gorgon', 'bg-labyrinth', 'bg-forge', 'bg-chiron', 'bg-diana'];   // stages painted for the Arena live in fight/, the rest are shared with the Quest
  const BGS = BGN.map((n) => img((LOCAL_BG.includes(n) ? '' : Q) + n + '.webp'));

  /* ================= the roster =================
     each fighter: frames for idle/walk/jump/light/heavy/special/hurt/ko, size, speed, and a special move */
  const H = (set, a, frames) => ({ set, a, f: frames });   // frames: list of frame indexes, or omitted for all
  function std(set) { return { idle: H(set, 'idle'), walk: H(set, 'walk'), jump: H(set, 'jump'), light: H(set, 'attack', [0, 1]), heavy: H(set, 'attack'), special: H(set, 'attack'), hurt: H(set, 'hurt'), ko: H(set, 'die'), victory: H(set, 'idle') }; }
  function elite(set) { return { idle: H(set, 'idle'), walk: H(set, 'walk'), jump: H(set, 'wind'), light: H(set, 'attack'), heavy: H(set, 'wind', [0]), heavyHit: H(set, 'attack'), special: H(set, 'special'), hurt: H(set, 'recover'), ko: null, victory: H(set, 'wind') }; }
  const FA = (id) => { const s = 'f_' + id, x = 'a_' + id, a = {}; ['idle', 'walk', 'jump', 'light', 'heavy', 'lkick', 'hkick', 'special', 'hurt', 'ko', 'victory'].forEach((k) => { a[k] = AATLAS[x] && AATLAS[x][k] ? H(x, k) : FATLAS[s] && FATLAS[s][k] ? H(s, k) : null; }); return a; };
  const PT = (id) => { const a = { portrait: id }; ['idle', 'walk', 'jump', 'light', 'heavy', 'special', 'hurt', 'victory'].forEach((k) => { a[k] = H('p_' + id, 'idle'); }); a.ko = null; return a; };
  const LG = (id) => { const s = 'g_' + id; return { idle: H(s, 'idle'), walk: H(s, 'walk'), jump: H(s, 'jump'), light: H(s, 'light'), heavy: H(s, 'heavy'), special: H(s, 'special'), hurt: H(s, 'hurt'), ko: null, victory: H(s, 'special') }; };
  const ROSTER = [
    { id: 'marcus', name: 'Marcus Aurelius', title: 'The Tesla Legate', size: 1.0, speed: 250, hp: 100, anims: FA('marcus'),
      special: { kind: 'proj', name: 'Lightning Wave', set: 'bfx', a: 'orb', sc: 1.0, speed: 520, col: ['#8fe6ff', '#ffffff', '#57b6ff'] }, quote: 'You have power over your mind, not outside events.' },
    { id: 'mars', name: 'Mars Warforge', title: 'God of the Legions', size: 1.04, speed: 255, hp: 105, anims: Object.assign(FA('mars'), { ko: null }),
      special: { kind: 'dash', name: 'Crimson Cleave', dist: 320, col: ['#ff4a3d', '#ffd27a', '#ffffff'] }, quote: 'War is my forge, and you are the iron.' },
    { id: 'colossus', name: 'Augustus Colossus', title: 'The Living Statue', size: 1.15, speed: 215, hp: 120, anims: FA('colossus'),
      special: { kind: 'proj', name: 'Thunder Fist', set: 'fx2', a: 'colossus', sc: 1.2, speed: 500, col: ['#57b6ff', '#ffffff', '#bfe6ff'] }, quote: 'Empires crumble. Marble endures.' },
    { id: 'medusa', name: 'Medusa Technomancer', title: 'Gaze of Stone', size: 1.0, speed: 245, hp: 95, anims: FA('medusa'),
      special: { kind: 'proj', name: 'Hex Sigil', set: 'fx2', a: 'medusa', sc: 1.1, speed: 430, col: ['#c070ff', '#ffffff', '#7b3fa0'] }, quote: 'Look at me. I insist.' },
    { id: 'minotaur', name: 'Minotaur Engine', title: 'Beast of the Labyrinth', size: 1.1, speed: 235, hp: 115, anims: FA('minotaur'),
      special: { kind: 'dash', name: 'Gore Charge', dist: 360, col: ['#ff9a3d', '#ffd27a', '#ffffff'] }, quote: 'Every maze ends with me.' },
    { id: 'vulcan', name: 'Vulcan Forge', title: 'Smith of the Gods', size: 1.08, speed: 225, hp: 120, anims: FA('vulcan'),
      special: { kind: 'wave', name: 'Magma Hammer', col: ['#ff9a3d', '#ffd27a', '#ff4a1a'] }, quote: 'I forged the thunderbolts. I can forge your defeat.' },
    { id: 'chiron', name: 'Chiron Astronomer', title: 'Archer of the Stars', size: 1.12, speed: 265, hp: 100, anims: FA('chiron'),
      special: { kind: 'proj', name: 'Star Chart', set: 'fx2', a: 'chiron', sc: 1.0, speed: 460, col: ['#ffd27a', '#ffffff', '#e7a227'] }, quote: 'The stars told me how this ends.' },
    { id: 'diana', name: 'Diana Hunter', title: 'Moon of the Forest', size: 1.0, speed: 280, hp: 90, anims: FA('diana'),
      special: { kind: 'proj', name: 'Emerald Arrow', set: 'fx2', a: 'diana', sc: 1.2, speed: 760, col: ['#b6ff4a', '#ffffff', '#4ad84a'] }, quote: 'I never miss. I only wait.' },
    { id: 'cerberus', name: 'Cerberus Unit', title: 'Hound of the Gate', size: 1.0, speed: 270, hp: 110, anims: FA('cerberus'),
      special: { kind: 'dash', name: 'Hellfire Pounce', dist: 340, col: ['#ff6a1a', '#ffd27a', '#ffffff'] }, quote: 'Three heads. Zero mercy.' },
    { id: 'pegasus', name: 'Pegasus Drone', title: 'Skyfire Assault', size: 1.05, speed: 290, hp: 92, anims: FA('pegasus'),
      special: { kind: 'dash', name: 'Heavenfall Strike', dist: 380, col: ['#56c9ff', '#ffffff', '#bfe6ff'] }, quote: 'The sky was never your side of the arena.' },
    { id: 'helios', name: 'Helios Orb', title: 'Solar Furnace', size: 0.95, speed: 240, hp: 98, hover: 26, anims: FA('helios'),
      special: { kind: 'beam', name: 'Supernova Beam', len: 560, col: ['#ffc24b', '#ffffff', '#ffe28a'] }, quote: 'I do not fight. I simply shine.' },
    { id: 'neptune', name: 'Neptune Leviathan', title: 'Abyssal Tide', size: 1.12, speed: 225, hp: 116, anims: FA('neptune'),
      special: { kind: 'wave', name: 'Tsunami Surge', col: ['#27d8ff', '#ffffff', '#1f6bd8'] }, quote: 'The tide always returns. So do I.' },
    { id: 'hades', name: 'Hades Sentinel', title: 'Keeper of Shadows', size: 1.05, speed: 235, hp: 105, anims: FA('hades'),
      special: { kind: 'proj', name: 'Void Seal', set: 'fx2', a: 'hades', sc: 1.1, speed: 420, col: ['#a46bff', '#ffffff', '#5a2d82'] }, quote: 'Everyone comes to my kingdom eventually.' },
  ];
  // a passive power for every fighter (from Roman Arena V8, plus five new ones)
  const PASSIVE = {
    colossus: ['Chain Lightning', 'heavy hits add 3 lightning damage'], medusa: ['Venom', 'heavy hits poison the foe'], helios: ['Solar Battery', 'every hit charges extra meter'],
    vulcan: ['Burn', 'heavy kicks set the foe on fire'], chiron: ['Time Slow', 'heavy punches slow the foe'], cerberus: ['Double Bite', 'light punches bite twice'],
    hades: ['Soul Siphon', 'heavy hits heal him'], mars: ['Legion Drill', 'longer, stronger combos'], minotaur: ['Iron Hide', 'takes 15% less damage'],
    pegasus: ['Tailwind', 'fastest fighter in the arena'], diana: ['Hunter\'s Eye', '1 in 5 hits is a critical'], neptune: ['Undertow', 'heavy kicks drag the foe in'],
    marcus: ['Stoic Will', 'super meter fills 25% faster'],
  };
  const BODY_H = 190;   // every fighter is scaled so the standing pose is about this tall (times size)
  // health re-tuned for the faster fighting speed from ~22,000 computer-vs-computer matches so every fighter wins about half the time
  const BALANCE = {"marcus":1.13,"mars":1.02,"colossus":0.8,"medusa":0.99,"minotaur":0.84,"vulcan":0.77,"chiron":1.07,"diana":1.16,"cerberus":1.04,"pegasus":1.23,"helios":0.93,"neptune":1.01,"hades":0.95};
  ROSTER.forEach((c) => { c.hp = Math.round(c.hp * 1.6 * (BALANCE[c.id] || 1)); const f = frameOf(c.anims.idle.set, c.anims.idle.a, 0); c.scale = BODY_H * c.size / f[3]; });

  /* ================= canvas ================= */
  const VW = 960, VH = 540, FLOOR = 488;
  // phones held upright (like the Quest): a taller view, the camera moved in on a narrower fighting floor so the fighters are bigger
  let CAM = null, BASE = { minX: 0, w: VW, h: VH }, PORTRAIT = false, CZ = 1, CX = VW / 2, SH = VH, SW = VW, WALL_L = 50, WALL_R = VW - 50;   // SW x SH: the screen in game units (wider or taller than the 960x540 stage when the window is)
  const cv = $('#cv'); const ctx = cv.getContext('2d'); let RES = 1;
  function fit() {
    const wrap = $('#arena'), portrait = innerHeight > innerWidth && innerWidth < 760;
    const touchy = document.body.classList.contains('touchy'), phoneWide = touchy && !portrait && innerHeight <= 520;
    let w = portrait ? document.documentElement.clientWidth - 16 : phoneWide ? document.documentElement.clientWidth - 4 : Math.min(innerWidth - 24, (innerHeight - (touchy ? 24 : 120)) * VW / VH * 1.65);
    w = Math.max(300, Math.floor(w)); wrap.style.width = w + 'px';
    SW = VW; SH = VH; PORTRAIT = portrait; BASE = { minX: 0, w: VW, h: VH }; WALL_L = 50; WALL_R = VW - 50;
    if (!portrait) {   // wide windows and phones held sideways: the stage stays put, the view widens to show more of the backdrop
      const h = phoneWide ? innerHeight - 8 : Math.min(innerHeight - (touchy ? 24 : 120), w * VH / VW);
      SW = Math.round(clamp(VH * w / Math.max(200, h), VW, VW * 1.65));
      w = Math.min(w, Math.floor(h * SW / VH)); wrap.style.width = w + 'px';   // never taller than the window
      BASE = { minX: -(SW - VW) / 2, w: SW, h: VH };
    }
    if (portrait) {
      const PW = 640, X0 = 160, pad = $('#touch'), padH = pad && pad.offsetHeight ? pad.offsetHeight + 40 : 170, top = Math.max(0, wrap.getBoundingClientRect().top);
      const avail = Math.max(w * 0.6, innerHeight - top - padH - 28), Hv = clamp(PW * avail / w, VH, 1000);   // world height on screen: the backdrop fills the extra sky above the stage
      BASE = { minX: X0, w: PW, h: Hv }; SH = Math.round(Hv * VW / PW); WALL_L = X0 + 50; WALL_R = X0 + PW - 50;
    }
    cv.style.aspectRatio = `${SW} / ${SH}`;
    const r = clamp(Math.ceil(w * (devicePixelRatio || 1) / SW * 4) / 4, 1, 2.5);
    if (r !== RES || cv.width !== Math.round(SW * r) || cv.height !== Math.round(SH * r)) { RES = r; cv.width = Math.round(SW * r); cv.height = Math.round(SH * r); }
  }
  addEventListener('resize', fit);
  if (matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window) document.body.classList.add('touchy');

  /* ================= input ================= */
  const KEYS = {
    p1: { left: ['KeyA'], right: ['KeyD'], up: ['KeyW'], down: ['KeyS'], light: ['KeyJ'], heavy: ['KeyK'], lkick: ['KeyU'], hkick: ['KeyI'], special: ['KeyL'], super: ['KeyQ'], breaker: ['Space'] },
    p2: { left: ['ArrowLeft'], right: ['ArrowRight'], up: ['ArrowUp'], down: ['ArrowDown'], light: ['Numpad1', 'Comma'], heavy: ['Numpad2', 'Period'], lkick: ['Numpad4', 'KeyM'], hkick: ['Numpad5', 'KeyN'], special: ['Numpad3', 'Slash'], super: ['Numpad0', 'Semicolon'], breaker: ['Numpad6', 'Quote'] },
  };
  const held = new Set(), pressed = new Set();
  addEventListener('keydown', (e) => {
    if (e.code === 'Escape' || e.code === 'KeyP') { if (G && G.mode !== 'select') togglePause(); return; }
    if (G && G.mode === 'play') { const all = Object.values(KEYS).flatMap((k) => Object.values(k).flat()); if (all.includes(e.code)) e.preventDefault(); }
    if (!e.repeat) pressed.add(e.code); held.add(e.code);
  });
  addEventListener('keyup', (e) => held.delete(e.code));
  addEventListener('blur', () => held.clear());
  // touch: a virtual pad for player one
  const touchHeld = new Set(), touchPressed = new Set();
  document.querySelectorAll('#touch [data-k]').forEach((b) => {
    const k = b.dataset.k;
    const down = (e) => { e.preventDefault(); SFX.ensure(); touchHeld.add(k); touchPressed.add(k); b.classList.add('on'); if (navigator.vibrate && !calm) try { navigator.vibrate(k === 'super' ? 25 : 10); } catch { /* no haptics */ } };
    const up = (e) => { e.preventDefault(); touchHeld.delete(k); b.classList.remove('on'); };
    b.addEventListener('pointerdown', down); b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('pointerleave', up);
  });
  // the shield joystick: drag the umbo; left/right/down are held, up is a jump on entry
  (() => {
    const st = $('#stick'); if (!st) return; const knob = st.querySelector('.knob'); let pid = null, cx = 0, cy = 0, ox = 0, oy = 0, upOn = false;
    const dirs = ['left', 'right', 'down'];
    const setDir = (dx, dy) => {   // 8-way: each direction owns a 135-degree wedge, so diagonals (crouch-forward, jump-back) work
      const r = st.clientWidth / 2, d = Math.hypot(dx, dy), k = d > r * 0.55 ? r * 0.55 / d : 1; knob.style.transform = `translate(${(dx * k + ox)}px, ${(dy * k + oy)}px)`;
      const on = d > r * 0.16, ang = Math.atan2(dy, dx) * 180 / Math.PI;   // 0 = right, 90 = down
      const want = { right: on && Math.abs(ang) < 67.5, left: on && Math.abs(ang) > 112.5, down: on && ang > 22.5 && ang < 157.5 && d > r * 0.24 };
      dirs.forEach((n) => { if (want[n]) touchHeld.add(n); else touchHeld.delete(n); });
      const up = on && d > r * 0.24 && ang < -22.5 && ang > -157.5; if (up && !upOn) touchPressed.add('up'); upOn = up;
    };
    const end = (e) => { if (e.pointerId !== pid) return; pid = null; upOn = false; ox = oy = 0; knob.style.transform = ''; dirs.forEach((n) => touchHeld.delete(n)); st.classList.remove('on-stick'); };
    st.addEventListener('pointerdown', (e) => { e.preventDefault(); SFX.ensure(); pid = e.pointerId; st.setPointerCapture(pid); const b = st.getBoundingClientRect(), r = b.width / 2, mx = b.left + r, my = b.top + r;
      // the stick centres where the thumb lands (kept inside the shield), so touching off-centre never jerks the fighter
      ox = clamp(e.clientX - mx, -r * 0.35, r * 0.35); oy = clamp(e.clientY - my, -r * 0.35, r * 0.35); cx = mx + ox; cy = my + oy; setDir(e.clientX - cx, e.clientY - cy); });
    st.addEventListener('pointermove', (e) => { if (e.pointerId === pid) setDir(e.clientX - cx, e.clientY - cy); });
    st.addEventListener('pointerup', end); st.addEventListener('pointercancel', end); st.addEventListener('lostpointercapture', end);
  })();
  const BUF = { p1: {}, p2: {} }, BUFFERED = ['light', 'heavy', 'lkick', 'hkick', 'special', 'super'];   // a press made a moment early (during an attack) still comes out
  function humanInput(slot) {
    const K = KEYS[slot], now = performance.now(), h = (n) => K[n].some((c) => held.has(c)) || (slot === 'p1' && touchHeld.has(n)), raw = (n) => K[n].some((c) => pressed.has(c)) || (slot === 'p1' && touchPressed.has(n));
    const p = (n) => { if (!BUFFERED.includes(n)) return raw(n); if (raw(n)) BUF[slot][n] = now; return now - (BUF[slot][n] || -1e9) < 160; };
    return { left: h('left'), right: h('right'), up: p('up'), down: h('down'), light: p('light'), heavy: p('heavy'), lkick: p('lkick'), hkick: p('hkick'), special: p('special'), super: p('super'), breaker: p('breaker') };
  }

  /* ================= fighters ================= */
  const MOVES = {   // seconds: startup, active, recovery; reach in px; damage
    light: { start: 0.04, act: 0.07, rec: 0.075, reach: 112, dmg: 5, stun: 0.21, push: 140, meter: 6 },     // tuned ~25% faster than launch for a snappier, arcade feel
    heavy: { start: 0.12, act: 0.09, rec: 0.17, reach: 140, dmg: 11, stun: 0.36, push: 330, meter: 10 },
    lkick: { start: 0.055, act: 0.08, rec: 0.10, reach: 132, dmg: 6, stun: 0.23, push: 170, meter: 7, low: true },
    hkick: { start: 0.135, act: 0.10, rec: 0.19, reach: 160, dmg: 12, stun: 0.38, push: 360, meter: 11, low: true },
    special: { start: 0.15, act: 0.10, rec: 0.23, reach: 0, dmg: 12, stun: 0.44, push: 360, meter: 0 },
  };
  const CHAIN = { light: ['light', 'lkick', 'heavy', 'hkick', 'special'], lkick: ['heavy', 'hkick', 'special'], heavy: ['hkick', 'special'], hkick: ['special'] };   // cancels after a landed hit
  function makeFighter(ch, side) {
    return { ch, side, x: side === 0 ? 300 : 660, y: FLOOR, vx: 0, vy: 0, face: side === 0 ? 1 : -1, hp: ch.hp, maxHp: ch.hp, meter: 0, wins: 0,
      state: 'idle', t: 0, move: null, hit: false, stun: 0, block: 0, knockdown: false, onGround: true, anim: 0, strideTravel: 0, cool: 0, flash: 0, superOn: false, combo: 0, comboT: 0, cpu: null };
  }
  let G = null;   // the match
  const STAGE_NAMES = { 'bg-battlefield': 'The Field of Mars', 'bg-colosseum': 'The Grand Colosseum', 'bg-sea': 'The Temple of the Tides', 'bg-gorgon': 'The Gorgon\'s Garden', 'bg-gate': 'The Abyssal Gate',
    'bg-hades': 'The Throne of Hades', 'bg-labyrinth': 'The Labyrinth of the Minotaur', 'bg-forge': 'The Forge of Vulcan', 'bg-chiron': 'Chiron\'s Grove', 'bg-diana': 'Diana\'s Moonlit Glade' };
  // arcade endings: two lines of story for whoever clears the ladder
  const ENDINGS = {
    marcus: ['With the Underworld broken, Marcus returned the Tesla core to Rome and lit the city for a thousand nights.', 'He wrote one line in his journal that evening: “The obstacle was the way.”'],
    mars: ['Mars hung the trident of Hades above his forge and declared the war finished, for now.', 'The legions say that when thunder rolls over the Campus Martius, he is sharpening his sword again.'],
    colossus: ['The Colossus took the empty throne of the Underworld and did not move for a hundred years.', 'Pilgrims still climb its knees to leave laurels, and swear the bronze is warm to the touch.'],
    medusa: ['Medusa turned the gates of Hades to marble and built a garden in the dark.', 'No hero has visited since. The statues at the entrance suggest a few tried.'],
    minotaur: ['The Minotaur walked out of the last labyrinth there was and kept walking, all the way to the sea.', 'For the first time in his life, nothing around him had walls.'],
    vulcan: ['Vulcan melted the trident of Hades down and forged a new crown, then gave it away.', '“I make things,” he said. “I do not need to wear them.”'],
    chiron: ['Chiron mapped every star the Underworld had hidden and carried the chart back to the living.', 'Sailors still steer by it, and call the brightest point the Archer.'],
    diana: ['Diana released the hounds of the Underworld into her forest and taught them to hunt by moonlight.', 'On clear nights, three-headed shadows run beside her, and they are happy.'],
    cerberus: ['Cerberus guarded the gate for ten thousand years. Today, for the first time, he walked through it.', 'All three heads agreed: the world above smells wonderful.'],
    pegasus: ['Pegasus carried the last ember of the Underworld up past the clouds and set it in the sky.', 'You can see it rising every evening, just after the sun goes down.'],
    helios: ['Helios Orb poured its light into the deepest cavern of the dead, and the darkness simply ended.', 'Its gears turned once more, then settled, as if satisfied.'],
    neptune: ['Neptune flooded the halls of Hades and the fires hissed out one by one.', 'The Underworld is a sea now, quiet and deep, and the serpent sleeps at the bottom of it.'],
    hades: ['Hades crushed the bronze Colossus and reclaimed every soul it had stolen from his kingdom.', 'The Throne of the Underworld is his again. He has never been more polite to visitors.'],
  };
  const PUNK = ['legion', 'arena', 'stomp', 'riot', 'hellfire', 'machine', 'sack'];
  const STAGE_TRACK = ['legion', 'arena', 'stomp', 'riot', 'sack', 'ego'];   // the final fight at the Throne of Hades plays Ego Death
  const STAGES = [['The Field of Mars', 'bg-battlefield'], ['The Grand Colosseum', 'bg-colosseum'], ['The Temple of the Tides', 'bg-sea'], ['The Gorgon\'s Garden', 'bg-gorgon'], ['The Abyssal Gate', 'bg-gate'], ['The Throne of Hades', 'bg-hades']];
  let ARC = null;   // arcade run: { ladder, stage, score, base }
  function newMatch(p1, p2, cpuLevel) {
    [p1, p2].forEach((c) => { if (AATLAS['a_' + c.id]) atkImg('a_' + c.id); });
    CZ = 1; CX = VW / 2;
    G = { mode: 'intro', p: [makeFighter(p1, 0), makeFighter(p2, 1)], round: 1, timer: 60, t: 0, msg: null, shots: [], fx: [], beams: [], waves: [], shake: 0, stop: 0, slow: 0, bg: BGS[BGN.indexOf(pick(LOCAL_BG))], cpuLevel, banner: null, pause: false };
    if (cpuLevel) G.p[1].cpu = { level: cpuLevel, think: 0, plan: null };
    if (!ARC) { const sp = store.get('af-stage'); const bgN = sp && LOCAL_BG.includes(sp) ? sp : pick(LOCAL_BG); G.bg = BGS[BGN.indexOf(bgN)]; G.stageName = STAGE_NAMES[bgN]; }
    if (ARC) { G.arcade = true; G.stageName = `Stage ${ARC.stage + 1} of 6 · ${STAGES[ARC.stage][0]}`; G.bg = BGS[BGN.indexOf(STAGES[ARC.stage][1])] || G.bg; }
    startRound();
    MUSIC.play(ARC ? STAGE_TRACK[ARC.stage] : G.bg === BGS[BGN.indexOf('bg-hades')] ? 'ego' : pick(PUNK));
  }
  function startRound() {
    G.rings = []; G.p.forEach((f, i) => Object.assign(f, { took: 0, poison: 0, burn: 0, slowT: 0, x: i === 0 ? 300 : 660, y: FLOOR, vx: 0, vy: 0, face: i === 0 ? 1 : -1, hp: f.maxHp, state: 'idle', t: 0, move: null, stun: 0, block: 0, knockdown: false, strideTravel: 0, onGround: true, cool: 0, combo: 0 }));
    G.shots = []; G.fx = []; G.beams = []; G.waves = []; G.timer = 60; G.mode = 'intro'; G.t = 0;
    G.banner = { text: G.round === 3 || (G.p[0].wins === 1 && G.p[1].wins === 1) ? 'FINAL ROUND' : 'ROUND ' + G.round, sub: 'FIGHT!', t: 0 };
    SFX.boss();
  }
  const opp = (f) => G.p[1 - f.side];
  function hurtbox(f) { const w = 62 * f.ch.size, h = BODY_H * f.ch.size * (f.crouch ? 0.52 : 0.92); return { x: f.x - w / 2, y: f.y - h, w, h }; }
  const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  function startMove(f, kind, isSuper) {
    if (!f.cpu) BUF[f.side ? 'p2' : 'p1'] = {};
    const m = MOVES[kind]; f.state = 'attack'; f.move = kind; f.t = 0; f.hit = false; f.superOn = !!isSuper;
    speak(f.ch, isSuper ? 'sup' : kind === 'special' ? 'sp' : (kind === 'heavy' || kind === 'hkick') ? 'atk' : Math.random() < 0.3 ? 'jab' : '');
    if (kind === 'special') { f.cool = isSuper ? 0.6 : 1.5; castSound(f, isSuper); if (isSuper) { f.meter = 0; G.stop = 0.35; G.flash = 0.35; G.banner = { text: f.ch.special.name.toUpperCase() + '!', sub: '', t: 0, small: true }; SFX.power(); } else SFX.zap(); }
    else FX.whoosh(kind === 'heavy' || kind === 'hkick');
    if (f.onGround) f.vx = 0;
    return m;
  }
  function say(f, text, col) { (G.texts = G.texts || []).push({ text, x: f.x, y: f.y - BODY_H * f.ch.size - 20, col, t: 1.1 }); }
  function passive(a, d, move, dmg) {   // returns extra damage; also applies effects
    const id = a.ch.id, heavyHit = move === 'heavy' || move === 'hkick'; let extra = 0;
    if (id === 'colossus' && heavyHit) { extra += 3; say(d, 'CHAIN LIGHTNING', '#9cdcff'); }
    if (id === 'medusa' && heavyHit) { d.poison = 3.5; say(d, 'VENOM', '#d77bff'); }
    if (id === 'vulcan' && move === 'hkick') { d.burn = 2.7; say(d, 'BURN', '#ff9b49'); }
    if (id === 'chiron' && move === 'heavy') { d.slowT = 2; say(d, 'TIME SLOW', '#c4b1ff'); }
    if (id === 'cerberus' && move === 'light') { extra += 2; say(d, 'DOUBLE BITE', '#ffa6a6'); }
    if (id === 'hades' && heavyHit) { a.hp = Math.min(a.maxHp, a.hp + 4); say(a, 'SOUL SIPHON', '#d5a2ff'); }
    if (id === 'mars' && a.combo >= 2) extra += Math.round(dmg * Math.min(0.4, a.combo * 0.08));
    if (id === 'diana' && Math.random() < 0.2) { extra += Math.round(dmg * 0.5); say(d, 'CRITICAL!', '#b6ff4a'); }
    if (id === 'neptune' && move === 'hkick') { d.vx = a.face * -260; say(d, 'UNDERTOW', '#27d8ff'); }
    if (id === 'helios') a.meter = Math.min(100, a.meter + 6);
    if (d.ch.id === 'minotaur') extra -= Math.round((dmg + extra) * 0.15);
    return extra;
  }
  function damage(attacker, target, dmg, stun, push, hitX) {
    if (target.inv > 0) return;
    const low = attacker.move && MOVES[attacker.move] && MOVES[attacker.move].low;
    const blocking = target.onGround && target.state !== 'attack' && target.state !== 'hurt' && target.state !== 'ko' && target.holdBack && (!low || target.crouch || Math.random() < 0.5);
    if (blocking) {
      dmg = Math.max(1, Math.round(dmg * 0.15)); target.block = 0.2; target.state = 'block'; target.t = 0; target.vx = -target.face * push * 0.7; FX.block();
      spark(hitX, target.y - BODY_H * target.ch.size * 0.55, ['#8fd8ff', '#ffffff'], 10); target.meter = Math.min(100, target.meter + 4);
    } else {
      if (target.hp - dmg > 0 && (dmg >= 10 || Math.random() < 0.3)) speak(target.ch, 'hurt'); target.state = 'hurt'; target.t = 0; target.knockdown = dmg >= 11 && target.onGround && target.hp > dmg; target.stun = target.knockdown ? Math.max(stun, 0.72) : stun; target.vx = -target.face * push; if (!target.onGround) target.vy = -320;
      dmg = Math.max(1, dmg + passive(attacker, target, attacker.state === 'attack' ? attacker.move : 'special', dmg));
      strikeSound(attacker, dmg >= 10); const hy = target.y - BODY_H * target.ch.size * 0.55; spark(hitX, hy, attacker.ch.special.col.concat(['#ffffff']), dmg >= 10 ? 34 : 22);
      (G.rings = G.rings || []).push({ x: hitX, y: hy, t: 0, max: dmg >= 10 ? 0.32 : 0.22, r: dmg >= 10 ? 90 : 55, col: attacker.ch.special.col[0] });
      attacker.combo = (attacker.comboT > 0 ? attacker.combo : 0) + 1; attacker.comboT = 0.9;
      if (attacker.combo >= 2) G.comboMsg = { side: attacker.side, n: attacker.combo, t: 1 };
      target.meter = Math.min(100, target.meter + dmg * 0.8); attacker.meter = Math.min(100, attacker.meter + dmg * 1.1 * (attacker.ch.id === 'marcus' ? 1.25 : 1));
      G.stop = Math.max(G.stop, dmg >= 10 ? 0.09 : 0.05); G.shake = Math.max(G.shake, dmg >= 10 ? 0.25 : 0.12);
    }
    target.hp = Math.max(0, target.hp - dmg); target.flash = 0.12; target.took = (target.took || 0) + dmg;
    if (G.training && attacker.side === 0) { G.tc = G.tc && G.t - G.tc.last < 1.2 ? G.tc : { hits: 0, dmg: 0 }; G.tc.hits += 1; G.tc.dmg += dmg; G.tc.last = G.t; target.lastHit = G.t; }
    if (target.hp <= 0) knockout(attacker, target);
  }
  function knockout(winner, loser) {
    if (G.training) { loser.hp = loser.maxHp; return; }
    speak(loser.ch, 'ko'); loser.state = 'ko'; loser.t = 0; loser.vx = -loser.face * 380; loser.vy = -520; loser.onGround = false;
    G.mode = 'ko'; G.t = 0; G.stop = 0.22; G.slow = 1.6; G.shake = 0.5; G.flash = 0.25; G.banner = { text: 'K.O.', sub: winner.took ? '' : 'PERFECT!', t: 0, big: true }; FX.ko();
    (G.rings = G.rings || []).push({ x: loser.x, y: loser.y - BODY_H * loser.ch.size * 0.5, t: 0, max: 0.6, r: 220, col: winner.ch.special.col[0] });
    winner.wins += 1;
  }
  function spark(x, y, cols, n) { const k = reduceMotion ? Math.ceil(n / 3) : n; for (let i = 0; i < k; i++) { const a = Math.random() * Math.PI * 2, v = rand(120, 420); G.fx.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, life: rand(0.25, 0.55), c: cols[i % cols.length], r: rand(2, 5) }); } }

  function fighterUpdate(f, inp, dt) {
    const o = opp(f); f.anim += dt; f.t += dt; f.flash -= dt; f.cool -= dt; f.comboT -= dt;
    const toward = Math.sign(o.x - f.x) || f.face;
    f.holdBack = (toward > 0 && inp.left && !inp.right) || (toward < 0 && inp.right && !inp.left);
    // combo breaker: spend 40% meter to burst out of a combo
    if (inp.breaker && f.state === 'hurt' && f.meter >= 40 && G.mode === 'play') { f.meter -= 40; f.state = 'idle'; f.stun = 0; f.inv = 0.5; o.vx = o.face * -0; o.state = o.state === 'ko' ? 'ko' : 'hurt'; o.t = 0; o.stun = 0.35; o.vx = toward * 520; spark(f.x, f.y - BODY_H * f.ch.size * 0.5, ['#8fe6ff', '#ffffff', '#ffd27a'], 30); G.shake = 0.3; G.banner = { text: 'COMBO BREAKER!', sub: '', t: 0, small: true }; SFX.power(); }
    f.inv = (f.inv || 0) - dt;
    if (f.poison > 0 || f.burn > 0) { f.dotT = (f.dotT || 0) + dt; if (f.dotT >= 0.5) { f.dotT = 0; if (f.state !== 'ko' && G.mode === 'play') { f.hp = Math.max(0, f.hp - (f.burn > 0 ? 2 : 1)); spark(f.x, f.y - BODY_H * f.ch.size * 0.6, f.burn > 0 ? ['#ff9b49', '#ffd27a'] : ['#d77bff', '#ffffff'], 4); if (f.hp <= 0) knockout(opp(f), f); } } }
    f.poison = Math.max(0, (f.poison || 0) - dt); f.burn = Math.max(0, (f.burn || 0) - dt); f.slowT = Math.max(0, (f.slowT || 0) - dt);
    // chain: a landed hit can be cancelled into the next attack in the chain
    if (f.state === 'attack' && f.hit && f.move !== 'special' && G.mode === 'play') {
      const want = inp.special && f.cool <= 0 ? 'special' : inp.hkick ? 'hkick' : inp.heavy ? 'heavy' : inp.lkick ? 'lkick' : inp.light ? 'light' : null;
      if (want && CHAIN[f.move] && CHAIN[f.move].includes(want) && f.t >= MOVES[f.move].start + MOVES[f.move].act * (f.ch.id === 'mars' ? 0.2 : 0.5)) startMove(f, want);
    }
    f.crouch = f.onGround && inp.down && (f.state === 'idle' || f.state === 'walk' || f.state === 'block');
    const canAct = f.state === 'idle' || f.state === 'walk' || (f.state === 'jump' && !f.airAttacked);
    if (f.state === 'ko') { /* fall */ }
    else if (f.state === 'hurt') { if (f.t >= f.stun && f.onGround) { f.state = 'idle'; f.knockdown = false; } }
    else if (f.state === 'block') { f.block -= dt; if (f.block <= 0) f.state = 'idle'; }
    else if (f.state === 'attack') {
      const m = MOVES[f.move], total = m.start + m.act + m.rec, sp = f.ch.special;
      const inAct = f.t >= m.start && f.t < m.start + m.act;
      if (f.move === 'special') {
        if (!f.fired && f.t >= m.start) { f.fired = true; fireSpecial(f); }
        if (sp.kind === 'dash' && f.t >= m.start && f.t < m.start + 0.22) { f.vx = f.face * sp.dist / 0.22 * (f.superOn ? 1.3 : 1); dashHit(f); }
        else if (sp.kind === 'dash') f.vx *= 0.8;
      } else if (inAct && !f.hit) {
        const reach = m.reach * f.ch.size, hb = m.low ? { x: f.face > 0 ? f.x : f.x - reach, y: f.y - BODY_H * f.ch.size * 0.55, w: reach, h: BODY_H * f.ch.size * 0.55 } : { x: f.face > 0 ? f.x : f.x - reach, y: f.y - BODY_H * f.ch.size * 0.85, w: reach, h: BODY_H * f.ch.size * 0.6 };
        if (overlap(hb, hurtbox(o)) && o.state !== 'ko') { f.hit = true; damage(f, o, Math.round(m.dmg * (f.ch.id === 'automaton' ? 1.15 : 1)), m.stun, m.push, f.x + f.face * reach * 0.75); }
      }
      if (f.t >= total && (f.onGround || f.move !== 'special')) { f.state = f.onGround ? 'idle' : 'jump'; f.move = null; f.fired = false; f.superOn = false; }
    }
    if (canAct && G.mode === 'play') {
      if (f.onGround) f.face = toward;
      if (inp.super && f.meter >= 100 && f.onGround) startMove(f, 'special', true);
      else if (inp.special && f.cool <= 0 && f.onGround) startMove(f, 'special');
      else if (inp.hkick) { startMove(f, 'hkick'); if (!f.onGround) f.airAttacked = true; }
      else if (inp.lkick) { startMove(f, 'lkick'); if (!f.onGround) f.airAttacked = true; }
      else if (inp.heavy) { startMove(f, 'heavy'); if (!f.onGround) f.airAttacked = true; }
      else if (inp.light) { startMove(f, 'light'); if (!f.onGround) f.airAttacked = true; }
      else if (f.onGround) {
        if (inp.up) { f.vy = -960; f.onGround = false; f.state = 'jump'; f.airAttacked = false; f.vx = (inp.right ? 1 : inp.left ? -1 : 0) * f.ch.speed * 1.50; SFX.jump(); }
        else if (f.crouch) { f.vx = 0; f.state = 'idle'; }
        else { const d = (inp.right ? 1 : 0) - (inp.left ? 1 : 0); f.vx = d * f.ch.speed * 1.42 * (f.holdBack ? 0.7 : 1) * (f.slowT > 0 ? 0.55 : 1) * (f.ch.id === 'pegasus' ? 1.12 : 1); f.state = d ? 'walk' : 'idle'; }
      }
    }
    // physics
    if (!f.onGround) { f.vy += 2860 * dt; f.y += f.vy * dt; if (f.y >= FLOOR) { f.y = FLOOR; f.vy = 0; f.onGround = true; if (f.state === 'jump') f.state = 'idle'; if (f.state === 'attack' && f.move !== 'special') { f.state = 'idle'; f.move = null; } if (f.state === 'ko') { G.shake = 0.3; spark(f.x, FLOOR, ['#c9b48c', '#8a6a4a'], 14); } } }
    else if (f.state === 'hurt' || f.state === 'block' || f.state === 'ko') f.vx *= Math.pow(0.0009, dt);
    const priorX = f.x;
    f.x += f.vx * dt; f.x = clamp(f.x, WALL_L, WALL_R);
    if (f.state === 'walk' && f.onGround) f.strideTravel = (f.strideTravel || 0) + Math.abs(f.x - priorX);
  }
  function separate() {   // fighters push each other apart instead of overlapping
    const [a, b] = G.p, min = 88 * (a.ch.size + b.ch.size) / 2;
    if (Math.abs(a.y - b.y) < 120 && Math.abs(a.x - b.x) < min) { const mid = (a.x + b.x) / 2, s = Math.sign(a.x - b.x) || (a.side ? 1 : -1); a.x = clamp(mid + s * min / 2, 50, VW - 50); b.x = clamp(mid - s * min / 2, 50, VW - 50); if (Math.abs(a.x - b.x) < min) (a.x <= 50 || a.x >= VW - 50 ? b : a).x += s * (min - Math.abs(a.x - b.x)) * (a.x <= 50 || a.x >= VW - 50 ? -1 : 1); }
  }
  function fireSpecial(f) {
    const sp = f.ch.special, sup = f.superOn, mul = sup ? 2.2 : 1, top = f.y - BODY_H * f.ch.size * 0.55;
    if (sp.kind === 'proj') { const n = sup ? 3 : 1; for (let i = 0; i < n; i++) G.shots.push({ owner: f.side, x: f.x + f.face * 60, y: top + (i - (n - 1) / 2) * 38, vx: f.face * sp.speed, set: sp.set, a: sp.a, sc: sp.sc * (sup ? 1.4 : 1), dmg: Math.round(MOVES.special.dmg * (sup ? 1.1 : 1)), col: sp.col, life: 2.4, face: f.face }); if (sp.heal) f.hp = Math.min(f.maxHp, f.hp + sp.heal * (sup ? 2 : 1)); }
    else if (sp.kind === 'beam') G.beams.push({ owner: f.side, x: f.x + f.face * 50, y: top - 6, face: f.face, len: sp.len * (sup ? 1.6 : 1), t: 0, dur: 0.32, dmg: Math.round(13 * mul), hit: false, col: sp.col });
    else if (sp.kind === 'wave') { const n = sup ? 3 : 1; for (let i = 0; i < n; i++) G.waves.push({ owner: f.side, x: f.x + f.face * (60 + i * 70), vx: f.face * 470, dmg: Math.round(12 * (sup ? 1.1 : 1)), life: 1.6, col: sp.col, delay: i * 0.12 }); G.shake = 0.25; }
    else if (sp.kind === 'dash') { f.dashDmg = Math.round(13 * mul); f.dashHit = false; spark(f.x, f.y - 40, sp.col, 10); }
  }
  function dashHit(f) { const o = opp(f); if (!f.dashHit && overlap({ x: f.x - 50, y: f.y - BODY_H, w: 100, h: BODY_H }, hurtbox(o)) && o.state !== 'ko') { f.dashHit = true; damage(f, o, f.dashDmg, 0.5, 420, (f.x + o.x) / 2); } }
  function updateAttacks(dt) {
    G.shots.forEach((s) => { s.x += s.vx * dt; s.life -= dt; const t = G.p[1 - s.owner];
      G.shots.forEach((o) => { if (o !== s && o.owner !== s.owner && !o.dead && Math.abs(o.x - s.x) < 40 && Math.abs(o.y - s.y) < 50) { s.dead = o.dead = true; spark((s.x + o.x) / 2, s.y, s.col.concat(o.col), 20); FX.clang(true); FX.zap(); } });
      if (!s.dead && t.state !== 'ko' && overlap({ x: s.x - 22, y: s.y - 22, w: 44, h: 44 }, hurtbox(t))) { s.dead = true; damage(G.p[s.owner], t, s.dmg, 0.45, 300, s.x); }
      if (s.x < -60 || s.x > VW + 60) s.dead = true; });
    G.shots = G.shots.filter((s) => !s.dead && s.life > 0);
    G.beams.forEach((b) => { b.t += dt; const t = G.p[1 - b.owner], box = { x: b.face > 0 ? b.x : b.x - b.len, y: b.y - 26, w: b.len, h: 52 };
      if (!b.hit && b.t > 0.05 && t.state !== 'ko' && overlap(box, hurtbox(t))) { b.hit = true; damage(G.p[b.owner], t, b.dmg, 0.55, 380, t.x - b.face * 20); } });
    G.beams = G.beams.filter((b) => b.t < b.dur);
    G.waves.forEach((w) => { if (w.delay > 0) { w.delay -= dt; return; } w.x += w.vx * dt; w.life -= dt; const t = G.p[1 - w.owner];
      if (!w.hit && t.state !== 'ko' && t.onGround && overlap({ x: w.x - 26, y: FLOOR - 70, w: 52, h: 70 }, hurtbox(t))) { w.hit = true; damage(G.p[w.owner], t, w.dmg, 0.5, 320, w.x); } });
    G.waves = G.waves.filter((w) => w.life > 0 && !w.hit && w.x > -40 && w.x < VW + 40);
    (G.rings || []).forEach((r) => { r.t += dt; }); G.rings = (G.rings || []).filter((r) => r.t < r.max);
    (G.texts || []).forEach((t) => { t.t -= dt; t.y -= 40 * dt; }); G.texts = (G.texts || []).filter((t) => t.t > 0);
    G.fx.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 900 * dt; p.life -= dt; }); G.fx = G.fx.filter((p) => p.life > 0);
  }

  /* ================= the computer opponent ================= */
  function cpuInput(f, dt) {
    const o = opp(f), c = f.cpu, lvl = c.level, dx = o.x - f.x, dist = Math.abs(dx), fwd = Math.sign(dx) || f.face;
    const inp = { left: false, right: false, up: false, down: false, light: false, heavy: false, lkick: false, hkick: false, special: false, super: false, breaker: false };
    if (f.state === 'hurt' && f.meter >= 40 && f.combo !== -1 && opp(f).combo >= 2 && Math.random() < 0.05 * lvl) inp.breaker = true;
    if (f.state === 'attack' && f.hit && Math.random() < 0.25 * lvl) inp[pick(['heavy', 'hkick', 'lkick'])] = true;
    const go = (d) => { if (d > 0) inp.right = true; else if (d < 0) inp.left = true; };
    const react = clamp(0.1 + 0.25 * lvl, 0, 0.95);
    // incoming danger: block or jump
    const threat = (o.state === 'attack' && dist < 190 && o.t < 0.25) || G.shots.some((s) => s.owner !== f.side && Math.sign(f.x - s.x) === Math.sign(s.vx) && Math.abs(f.x - s.x) < 260) || G.waves.some((w) => w.owner !== f.side && Math.abs(f.x - w.x) < 230) || G.beams.some((b) => b.owner !== f.side);
    if (threat && c.reacted !== G.t) { c.reacted = G.t; c.def = Math.random() < react ? pick(['block', 'block', 'crouch', 'jump']) : null; c.defT = 0.35; }
    c.defT -= dt;
    if (c.def && c.defT > 0) { if (c.def === 'crouch') { inp.down = true; go(-fwd); } else if (c.def === 'block') go(-fwd); else if (f.onGround && c.def === 'jump') { inp.up = true; c.def = null; } return inp; }
    c.think -= dt;
    if (c.think <= 0) {
      c.think = rand(0.12, 0.35) / (0.6 + lvl * 0.2);
      const r = Math.random();
      if (f.meter >= 100 && dist < 420 && r < 0.5) c.plan = 'super';
      else if (dist > 330) c.plan = f.cool <= 0 && r < 0.25 + lvl * 0.08 ? 'special' : r < 0.85 ? 'approach' : 'jumpin';
      else if (dist > 125) c.plan = r < 0.55 ? 'approach' : r < 0.7 && f.cool <= 0 ? 'special' : r < 0.82 ? 'jumpin' : 'wait';
      else c.plan = r < 0.42 ? 'light' : r < 0.68 ? 'heavy' : r < 0.8 ? 'back' : r < 0.88 && f.cool <= 0 ? 'special' : 'wait';
    }
    switch (c.plan) {
      case 'approach': go(fwd); break;
      case 'back': go(-fwd); break;
      case 'jumpin': if (f.onGround) { inp.up = true; go(fwd); } else if (dist < 140) inp.heavy = true; else go(fwd); break;
      case 'light': inp.light = true; c.plan = Math.random() < 0.4 + lvl * 0.1 ? 'light2' : 'wait'; break;
      case 'light2': if (f.state !== 'attack') { inp.light = true; c.plan = 'wait'; } break;
      case 'heavy': inp[pick(['heavy', 'hkick', 'lkick'])] = true; c.plan = 'wait'; break;
      case 'special': inp.special = true; c.plan = 'wait'; break;
      case 'super': inp.super = true; c.plan = 'wait'; break;
      default: break;
    }
    return inp;
  }

  /* ================= main loop ================= */
  let last = performance.now();
  function update(dt) {
    if (!G || G.pause) return;
    G.t += dt; if (G.banner) G.banner.t += dt; if (G.comboMsg) G.comboMsg.t -= dt; G.flash = Math.max(0, (G.flash || 0) - dt); G.shake = Math.max(0, G.shake - dt);
    if (G.stop > 0) { G.stop -= dt; return; }   // hit-stop: freeze on impact
    if (G.slow > 0) { G.slow -= dt; dt *= 0.3; }
    if (G.mode === 'intro') { if (G.t > 1.7) { G.mode = 'play'; G.banner = null; } }
    if (G.training) { G.timer = 60; const [me, dm] = G.p; me.meter = 100; if (dm.state !== 'hurt' && G.t - (dm.lastHit || -9) > 1.6) { dm.hp = dm.maxHp; dm.poison = dm.burn = 0; } }
    else if (G.mode === 'play') { G.timer -= dt; if (G.timer <= 0) { G.timer = 0; const [a, b] = G.p; const w = a.hp / a.maxHp >= b.hp / b.maxHp ? a : b; knockout(w, opp(w)); G.banner = { text: 'TIME', sub: '', t: 0, big: true }; } }
    const none = { left: false, right: false, up: false, down: false, light: false, heavy: false, lkick: false, hkick: false, special: false, super: false, breaker: false };
    G.p.forEach((f) => { const inp = G.mode === 'play' && !f.dummy ? (f.cpu ? cpuInput(f, dt) : humanInput(f.side ? 'p2' : 'p1')) : none; fighterUpdate(f, inp, dt); });
    separate(); updateAttacks(dt);
    if (G.mode === 'ko' && G.t > 2.6) {
      const champ = G.p.find((f) => f.wins >= 2);
      if (champ) { G.mode = 'over'; G.winner = champ; MUSIC.pause(); SFX.win(); setTimeout(() => speak(champ.ch, 'win'), 350); showResult(champ); }
      else { G.round += 1; startRound(); }
    }
    pressed.clear(); touchPressed.clear();
  }

  /* ================= drawing ================= */
  const BUSY = ['bg-sketch', 'bg-tesla', 'bg-orbs', 'bg-chamber'];
  const bgCache = new Map();
  function bakedBg(im) {   // a softened, darker copy so the fighters stand out (works on every browser: shrink-and-grow blur)
    if (bgCache.has(im)) return bgCache.get(im);
    const busy = BUSY.some((n) => im.src.includes(n)), wide = im.naturalWidth / im.naturalHeight > 2.2, W = wide ? Math.round(VH * im.naturalWidth / im.naturalHeight) : Math.round(VW * 1.08), Hh = VH, s = Math.max(W / im.naturalWidth, Hh / im.naturalHeight), w = im.naturalWidth * s, h = im.naturalHeight * s;
    const small = document.createElement('canvas'), k = busy ? 0.28 : 0.45; small.width = Math.round(W * k); small.height = Math.round(Hh * k);
    const sg = small.getContext('2d'); sg.imageSmoothingQuality = 'high'; sg.drawImage(im, (W - w) / 2 * k, (Hh - h) / 2 * k, w * k, h * k);
    const c = document.createElement('canvas'); c.width = Math.round(W * 1.5); c.height = Math.round(Hh * 1.5); const g = c.getContext('2d'); g.imageSmoothingQuality = 'high';
    g.drawImage(small, 0, 0, c.width, c.height); g.fillStyle = busy ? 'rgba(12,8,5,0.5)' : 'rgba(12,8,5,0.3)'; g.fillRect(0, 0, c.width, c.height);
    const v = g.createRadialGradient(c.width / 2, c.height * 0.62, c.height * 0.15, c.width / 2, c.height * 0.62, c.width * 0.6); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.45)'); g.fillStyle = v; g.fillRect(0, 0, c.width, c.height);
    bgCache.set(im, c); return c;
  }
  function drawBg() {
    const im = G.bg, R = CAM ? { x: CAM.x0, y: CAM.top, w: CAM.w, h: CAM.h } : { x: 0, y: 0, w: VW, h: VH }; ctx.fillStyle = '#120c08'; ctx.fillRect(R.x, R.y, R.w, R.h);
    if (im.complete && im.naturalWidth && CAM) {   // upright phone: the whole backdrop scaled to the view's height, drifting gently with the fight
      const c = bakedBg(im), bw = c.width / 1.5, k = Math.max(R.h / VH, R.w / bw), dw = bw * k, dh = VH * k, mid = (G.p[0].x + G.p[1].x) / 2 - (R.x + R.w / 2), room = Math.max(0, (dw - R.w) / 2);
      ctx.drawImage(c, R.x + R.w / 2 - dw / 2 - clamp(mid / Math.max(100, R.w / 2 - 50), -1, 1) * room * 0.35, R.y + (R.h - dh) * 0.7, dw, dh); }
    else if (im.complete && im.naturalWidth) { const c = bakedBg(im), par = (G.p[0].x + G.p[1].x) / 2 - VW / 2, bw = c.width / 1.5;
      if (bw > VW * 1.5) { const extra = bw - VW; G.pan = (G.pan ?? 0) + (clamp(par / 330, -1, 1) * extra / 2 - (G.pan ?? 0)) * 0.06; ctx.drawImage(c, -extra / 2 - G.pan, 0, bw, VH); }   // panoramic stage: the camera drifts toward the action
      else ctx.drawImage(c, -VW * 0.04 - par * 0.04, 0, VW * 1.08, VH); }
    const g = ctx.createLinearGradient(0, R.y, 0, VH); g.addColorStop(0, 'rgba(10,6,4,0.35)'); g.addColorStop(0.7, 'rgba(10,6,4,0.15)'); g.addColorStop(1, 'rgba(10,6,4,0.75)'); ctx.fillStyle = g; ctx.fillRect(R.x, R.y, R.w, R.h);
    ctx.fillStyle = 'rgba(20,12,6,0.55)'; ctx.fillRect(R.x, FLOOR, R.w, VH - FLOOR); ctx.fillStyle = '#a8842a'; ctx.fillRect(R.x, FLOOR, R.w, 2);
  }
  // Every fighter keeps its own atlas, center/foot anchors, and attack poses.
  // These profiles create additional displayed motion samples (not new painted art).
  const MOTION_PACKS = {
    marcus:   { cadence: 1.06, lean: 1.0, bounce: 1.0, power: 1.0 },
    mars:     { cadence: 1.04, lean: 1.1, bounce: 0.9, power: 1.2 },
    colossus: { cadence: 0.77, lean: 0.6, bounce: 0.5, power: 1.5 },
    medusa:   { cadence: 1.13, lean: 0.8, bounce: 0.6, power: 0.85 },
    minotaur: { cadence: 0.92, lean: 1.2, bounce: 1.2, power: 1.5 },
    vulcan:   { cadence: 0.90, lean: 0.9, bounce: 0.7, power: 1.35 },
    chiron:   { cadence: 1.04, lean: 0.7, bounce: 0.6, power: 0.9 },
    diana:    { cadence: 1.22, lean: 1.15, bounce: 1.2, power: 0.95 },
    cerberus: { cadence: 1.08, lean: 1.25, bounce: 1.35, power: 1.15 },
    pegasus:  { cadence: 1.20, lean: 0.75, bounce: 0.75, power: 0.9 },
    helios:   { cadence: 1.12, lean: 0.55, bounce: 0.45, power: 1.0 },
    neptune:  { cadence: 0.85, lean: 0.75, bounce: 0.55, power: 1.45 },
    hades:    { cadence: 0.94, lean: 0.85, bounce: 0.65, power: 1.25 }
  };
  function animFor(f) {
    const A = f.ch.anims; let k = 'idle', frame = f.anim * 6;
    if (f.state === 'walk') { k = 'walk'; frame = f.anim * 10.5 * (f.slowT > 0 ? 0.65 : 1); }
    else if (f.state === 'jump') { k = 'jump'; frame = f.vy < 0 ? 0 : 1; }
    else if (f.state === 'attack') { const m = MOVES[f.move], prog = clamp(f.t / (m.start + m.act + m.rec), 0, 0.999); k = (f.move === 'lkick' || f.move === 'hkick') && !A[f.move] ? (f.move === 'lkick' ? 'light' : 'heavy') : f.move; if (f.move === 'heavy' && A.heavyHit && f.t >= m.start) k = 'heavyHit'; if (!f.onGround && f.move !== 'special') k = A.jump ? f.move : 'jump'; frame = prog; }
    else if (f.state === 'hurt' || f.state === 'block') {
      k = 'hurt'; frame = 0;
      if (f.state === 'hurt' && f.knockdown && A.ko) {
        // Hit stagger -> fall -> floor hold -> rise, respecting original sprite anchors.
        const p = clamp(f.t / f.stun, 0, 0.999);
        k = p < 0.16 || p > 0.87 ? 'hurt' : 'ko';
        frame = p < 0.16 ? 0 : p < 0.46 ? (p - 0.16) / 0.30 : p < 0.73 ? 0.999 : 1 - (p - 0.73) / 0.14;
      }
    }
    else if (f.state === 'ko') { k = A.ko ? 'ko' : 'hurt'; frame = Math.min(1, f.t * 1.8) * 0.999; }
    if (G.mode === 'over' && f === G.winner) { k = 'victory'; frame = f.anim * 2; }
    const h = A[k] || A.idle, all = ALL[h.set][h.a], list = h.f || all.map((_, i) => i);
    // Prefer generated, transparent, foot-aligned animation sheets only after
    // their images decode successfully. Any missing asset falls back to v47 art.
    const generatedSet = 'g_' + f.ch.id;
    const generatedAnimations = GENERATED[generatedSet];
    if (generatedAnimations && generatedAnimations[k]) {
      const generatedImage = generatedImg(generatedSet);
      if (generatedImage.complete && generatedImage.naturalWidth > 0) {
        const frames = generatedAnimations[k], count = frames.length;
        const motion = MOTION_PACKS[f.ch.id] || MOTION_PACKS.marcus;
        let phase = 0;
        if (f.state === 'attack') {
          const m = MOVES[f.move];
          phase = clamp(f.t / (m.start + m.act + m.rec), 0, 0.9999);
        } else if (f.state === 'hurt') {
          phase = clamp(f.t / Math.max(0.15, f.stun), 0, 0.9999);
          if (k === 'ko' && phase > 0.73) phase = clamp(1 - (phase - 0.73) / 0.14, 0, 0.9999);
        } else if (f.state === 'ko') {
          phase = clamp(f.t / 0.65, 0, 0.9999);
        } else if (f.state === 'jump') {
          phase = clamp(0.5 + f.vy / 1800, 0, 0.9999);
        } else {
          const cadence = f.state === 'walk' ? 1.32 : k === 'victory' ? 0.68 : 0.54;
          phase = f.state === 'walk'
            ? (((f.strideTravel || 0) / 106) % 1 + 1) % 1
            : ((f.anim * cadence * motion.cadence) % 1 + 1) % 1;
        }
        return { h: { set: generatedSet, a: k }, idx: Math.min(count - 1, Math.floor(phase * count)), mix: 0 };
      }
    }
    const profile = MOTION_PACKS[f.ch.id] || MOTION_PACKS.marcus;
    const attacking = f.state === 'attack';
    const moving = f.state === 'walk';
    const recovering = f.state === 'hurt' || f.state === 'ko';
    const phases = attacking ? 12 : moving ? 8 : recovering ? 8 : f.state === 'jump' ? 6 : 8;
    if (list.length === 1) return { h, idx: list[0], mix: 0 };
    let phase;
    if (attacking) {
      const m = MOVES[f.move], total = m.start + m.act + m.rec;
      phase = clamp(f.t / total, 0, 0.9999);
      // Punch and kick each retain four hand-authored keys; speed of strike is
      // controlled by attack startup/active/recovery, not simply by frame count.
      const keys = [0, m.start / total, (m.start + m.act) / total, 1];
      const sampled = Math.min(phases - 1, Math.floor(phase * phases));
      phase = (sampled + 0.5) / phases;
      if (list.length >= 4) {
        const segment = phase < keys[1] ? 0 : phase < keys[2] ? 1 : 2;
        const lo = keys[segment], hi = keys[segment + 1];
        const sub = clamp((phase - lo) / Math.max(0.001, hi - lo), 0, 1);
        const smooth = sub * sub * (3 - 2 * sub);
        return { h, idx: list[segment], next: list[segment + 1], mix: calm ? 0 : smooth };
      }
    } else if (recovering) {
      phase = f.state === 'ko' ? clamp(f.t / 0.65, 0, 0.9999) :
        clamp(f.t / Math.max(0.1, f.stun), 0, 0.9999);
      if (f.knockdown && f.state === 'hurt' && k === 'ko' && phase > 0.70) phase = Math.max(0, 1 - (phase - 0.70) / 0.30);
    } else if (f.state === 'jump') {
      // Use ascending/descending sprite keys where the character art contains them.
      phase = clamp(0.5 + f.vy / 2200, 0, 0.9999);
    } else {
      phase = ((f.anim * (moving ? 1.36 : 0.68) * profile.cadence) % 1 + 1) % 1;
    }
    const sample = (Math.floor(phase * phases) + 0.5) / phases;
    const pos = sample * (recovering || attacking || f.state === 'jump' ? list.length - 1 : list.length);
    const base = Math.min(list.length - 1, Math.floor(pos));
    const nextIndex = moving || f.state === 'idle' ? (base + 1) % list.length : Math.min(list.length - 1, base + 1);
    const rawMix = pos - Math.floor(pos);
    return { h, idx: list[base], next: list[nextIndex], mix: calm ? 0 : rawMix };
  }
  function drawFighter(f) {
    const { h, idx, next, previous, mix = 0 } = animFor(f), sc = f.ch.scale * (h.set.startsWith('n') ? 1 : 1);
    // shadow on the floor
    ctx.fillStyle = 'rgba(0,0,0,0.38)'; ctx.beginPath(); ctx.ellipse(f.x, FLOOR + 3, 56 * f.ch.size * clamp(1 - (FLOOR - f.y) / 400, 0.4, 1), 9, 0, 0, 7); ctx.fill();
    ctx.save();
    if (f.ch.anims.portrait) { drawPortrait(f, h, sc); ctx.restore(); drawFx(f); return; }
    if (f.state === 'ko' && !f.ch.anims.ko) { const k = clamp(f.t / 0.5, 0, 1); ctx.translate(f.x, f.y); ctx.rotate(-f.face * k * 1.45); ctx.translate(-f.x, -f.y - k * 14); }
    if (f.superOn || f.meter >= 100) { ctx.shadowColor = f.ch.special.col[0]; ctx.shadowBlur = 18 + (calm ? 0 : Math.sin(G.t * 14) * 6); }
    if (f.flash > 0 && !calm) ctx.filter = 'brightness(1.8)';
    else if (f.state === 'block') ctx.filter = 'brightness(1.15) saturate(0.6)';
    // startup / active / recovery: lean back, lunge in, ease out (on top of the drawn pose)
    let lx = 0, rot = 0, sq = 1;
    const ease = (x) => 1 - (1 - clamp(x, 0, 1)) ** 3;
    const motion = MOTION_PACKS[f.ch.id] || MOTION_PACKS.marcus;
    if (f.state === 'attack') { const m = MOVES[f.move], heavy = f.move === 'heavy' || f.move === 'hkick' || f.move === 'special', reach = (heavy ? 26 : 16) * motion.power;
      if (f.t < m.start) { const w = ease(f.t / m.start); lx = -f.face * reach * 0.45 * w; rot = -0.06 * w * (heavy ? 1.4 : 1); sq = 1 - 0.03 * w; }
      else if (f.t < m.start + m.act) { const w = ease((f.t - m.start) / m.act); lx = f.face * reach * w; rot = 0.05 * w; sq = 1 + 0.02 * w; }
      else { const w = 1 - ease((f.t - m.start - m.act) / m.rec); lx = f.face * reach * w; rot = 0.05 * w; } }
    else if (f.state === 'hurt') {
      const w = clamp(1 - f.t / Math.max(0.2, f.stun), 0, 1);
      lx = -f.face * 8 * w; rot = -0.08 * w;
      if (f.knockdown) { const p = clamp(f.t / f.stun, 0, 1);
        // Extra body weight on the landing; recovery springs back into stance.
        rot += -0.09 * Math.sin(Math.PI * p);
        sq = 1 - 0.045 * Math.sin(Math.PI * p);
      }
    }
    else if (f.state === 'walk') { rot = 0; sq = 1; }
    else if (f.state === 'idle') { sq = calm ? 1 : 1 + Math.sin(f.anim * 2.2) * 0.002; }
    else if (f.state === 'jump') { rot = f.vy < 0 ? -0.045 : 0.035; sq = f.vy < 0 ? 1.025 : 0.98; }
    const status = f.poison > 0 ? 'hue-rotate(250deg) saturate(1.6)' : f.burn > 0 ? 'sepia(0.5) saturate(2.2) hue-rotate(-20deg) brightness(1.1)' : f.slowT > 0 ? 'saturate(0.4) brightness(0.9)' : '';
    if (status && !(f.flash > 0)) ctx.filter = status;
    const strideBob = 0; // no second bounce: feet stay aligned to FLOOR
    const fy = f.y + 2 - strideBob - (f.ch.hover && f.state !== 'ko' ? f.ch.hover + Math.sin(f.anim * 3) * 6 : 0);
    ctx.translate(f.x + lx, fy); ctx.rotate(rot * f.face); ctx.scale(1 / sq, sq);
    // Synthesized in-between animation poses: blend only adjacent source frames.
    // Rendering both uses the same foot anchor, keeping hitboxes and collision unchanged.
    if (previous != null && mix < 1 && !calm) {
      spr(ctx, h.set, h.a, previous, 0, 0, f.face, sc, 1 - mix);
      spr(ctx, h.set, h.a, idx, 0, 0, f.face, sc, mix);
    } else if (next != null && mix > 0.12 && mix < 0.88 && !calm) {
      spr(ctx, h.set, h.a, idx, 0, 0, f.face, sc, 1 - mix);
      spr(ctx, h.set, h.a, next, 0, 0, f.face, sc, mix);
    } else {
      spr(ctx, h.set, h.a, next != null && mix >= 0.88 ? next : idx, 0, 0, f.face, sc);
    }
    ctx.restore();
    if (f.state === 'block') { ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeStyle = '#8fd8ff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(f.x + f.face * 30, f.y - BODY_H * f.ch.size * 0.55, 60, -1.1, 1.1); if (f.face < 0) { ctx.beginPath(); ctx.arc(f.x + f.face * 30, f.y - BODY_H * f.ch.size * 0.55, 60, Math.PI - 1.1, Math.PI + 1.1); } ctx.stroke(); ctx.restore(); }
    drawFx(f);
  }
  function drawStatus(f) {
    const tags = []; if (f.poison > 0) tags.push(['POISONED', '#d77bff']); if (f.burn > 0) tags.push(['BURNING', '#ff9b49']); if (f.slowT > 0) tags.push(['SLOWED', '#c4b1ff']);
    tags.forEach(([t, c], i) => { ctx.save(); ctx.font = '17px "Bebas Neue", Impact, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = '#120c08'; const y = FLOOR + 22 + i * 15; ctx.strokeText(t, f.x, y); ctx.fillStyle = c; ctx.fillText(t, f.x, y); ctx.restore(); });
  }
  function drawFx(f) {
    drawStatus(f);
    if (AATLAS['a_' + f.ch.id]) return;   // these fighters draw their own swooshes
    if (f.state === 'attack' && f.move !== 'special' && f.t >= MOVES[f.move].start && f.t < MOVES[f.move].start + MOVES[f.move].act + 0.05) {
      const reach = MOVES[f.move].reach * f.ch.size; ctx.save(); ctx.globalAlpha = 0.85; ctx.globalCompositeOperation = 'lighter';
      const kick = f.move === 'lkick' || f.move === 'hkick'; spr(ctx, 'fx', 'slash', 0, f.x + f.face * reach * 0.7, f.y - BODY_H * f.ch.size * (kick ? 0.3 : 0.55), f.face, f.move === 'heavy' || f.move === 'hkick' ? 2.3 : 1.6); ctx.restore(); }
  }
  // portraits are single drawings: the pose comes from leaning, lunging, squashing and recoiling them
  function drawPortrait(f, h, sc) {
    const nat = NATIVE[f.ch.anims.portrait] || 1, face = f.face * nat, t = f.anim, H0 = BODY_H * f.ch.size;
    let dx = 0, dy = -(f.ch.hover || 0) + (f.ch.hover ? Math.sin(t * 3) * 6 : 0), rot = 0, sx = 1, sy = 1;
    const ease = (x) => 1 - (1 - clamp(x, 0, 1)) ** 3;
    if (f.crouch) { sy = 0.78; sx = 1.06; rot = 0.05; }
    else if (f.state === 'idle') { sy = 1 + Math.sin(t * 3.2) * 0.012; sx = 1 - Math.sin(t * 3.2) * 0.006; }
    else if (f.state === 'walk') { dy -= Math.abs(Math.sin(t * 13)) * 7; rot = Math.sin(t * 13) * 0.045; sx = 1 + Math.sin(t * 26) * 0.014; sy = 2 - sx; }
    else if (f.state === 'jump') { rot = (f.vy < 0 ? -0.08 : 0.06); sy = f.vy < 0 ? 1.05 : 0.97; sx = 2 - sy; }
    else if (f.state === 'attack') {
      const m = MOVES[f.move], k = f.t;
      if (k < m.start) { const w = ease(k / m.start); dx = -f.face * 14 * w; rot = -0.08 * w; sy = 1 - 0.03 * w; }          // wind up: lean back
      else if (k < m.start + m.act) { const w = ease((k - m.start) / m.act); const big = f.move === 'heavy' || f.move === 'hkick' ? 1.6 : f.move === 'special' ? 1.3 : 1, kick = f.move === 'lkick' || f.move === 'hkick';
        dx = f.face * 34 * big * w; rot = (kick ? -0.12 : 0.13) * big * w; if (kick) dy -= 10 * w; sx = 1 + 0.05 * w; sy = 1 - 0.03 * w; }                               // strike: lunge forward
      else { const w = 1 - ease((k - m.start - m.act) / m.rec); const kick = f.move === 'lkick' || f.move === 'hkick', big = f.move === 'heavy' || f.move === 'hkick' ? 1.6 : 1.2; dx = f.face * 34 * big * w; rot = (kick ? -0.12 : 0.13) * big * w; }
      if (f.move === 'special' && k >= m.start) { ctx.shadowColor = f.ch.special.col[0]; ctx.shadowBlur = calm ? 12 : 30; }
    }
    else if (f.state === 'hurt') { const w = clamp(1 - f.t / Math.max(0.2, f.stun), 0, 1); dx = -f.face * 10 * w; rot = -0.16 * w; sx = 1 - 0.04 * w; }
    else if (f.state === 'block') { rot = -0.05; sx = 0.96; }
    else if (f.state === 'ko') { const k = clamp(f.t / 0.55, 0, 1); rot = -1.4 * k; dy = -k * 18; }
    if (G.mode === 'over' && f === G.winner) { sy = 1 + Math.abs(Math.sin(t * 4)) * 0.04; dy -= Math.abs(Math.sin(t * 4)) * 8; }
    if (f.superOn || f.meter >= 100) { ctx.shadowColor = f.ch.special.col[0]; ctx.shadowBlur = 18 + (calm ? 0 : Math.sin(G.t * 14) * 6); }
    if (f.flash > 0 && !calm) ctx.filter = 'brightness(1.9)';
    else if (f.state === 'hurt') ctx.filter = 'sepia(0.6) saturate(2.5) hue-rotate(-25deg)';
    else if (f.state === 'block') ctx.filter = 'brightness(1.15) saturate(0.7)';
    ctx.translate(f.x + dx, f.y + 2 + dy); ctx.rotate(rot * f.face); ctx.scale(sx, sy);
    spr(ctx, h.set, h.a, 0, 0, 0, face, sc);
  }
  // drawn energy shots (no sprite needed): a glowing core with a streaking tail in the fighter's colors
  function drawBolt(s) {
    const r = 16 * (s.sc || 1), d = s.face || Math.sign(s.vx) || 1, t = G.t * 20, arrow = s.a === 'diana';
    const tail = ctx.createLinearGradient(s.x - d * r * (arrow ? 7 : 4.5), s.y, s.x, s.y); tail.addColorStop(0, 'rgba(0,0,0,0)'); tail.addColorStop(1, s.col[0]);
    ctx.fillStyle = tail; ctx.beginPath(); ctx.moveTo(s.x, s.y - r * (arrow ? 0.35 : 0.8)); ctx.lineTo(s.x - d * r * (arrow ? 7 : 4.5), s.y); ctx.lineTo(s.x, s.y + r * (arrow ? 0.35 : 0.8)); ctx.fill();
    if (arrow) { ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(s.x + d * r * 1.6, s.y); ctx.lineTo(s.x - d * r * 0.4, s.y - r * 0.6); ctx.lineTo(s.x - d * r * 0.4, s.y + r * 0.6); ctx.fill(); return; }
    const g = ctx.createRadialGradient(s.x, s.y, 1, s.x, s.y, r * 1.6); g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, s.col[0]); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s.x, s.y, r * 1.6, 0, 7); ctx.fill();
    ctx.strokeStyle = s.col[1] || '#ffffff'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + t * 0.1; ctx.moveTo(s.x + Math.cos(a) * r * 0.6, s.y + Math.sin(a) * r * 0.6); ctx.lineTo(s.x + Math.cos(a + 0.4) * r * (1.3 + (calm ? 0 : Math.random() * 0.4)), s.y + Math.sin(a + 0.4) * r * 1.3); } ctx.stroke();
  }
  function drawAttacks() {
    G.shots.forEach((s) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.shadowColor = s.col[0]; ctx.shadowBlur = 20;
      if (frameOf(s.set, s.a, 0)) spr(ctx, s.set, s.a, 0, s.x, s.y, s.face, s.sc); else drawBolt(s); ctx.restore(); });
    G.beams.forEach((b) => { const k = 1 - b.t / b.dur; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.shadowColor = b.col[0]; ctx.shadowBlur = 24;
      [[22, 'rgba(87,182,255,0.45)'], [10, '#bfe6ff'], [4, '#ffffff']].forEach(([w, c]) => { ctx.strokeStyle = c; ctx.lineWidth = w * k + 1; ctx.beginPath(); ctx.moveTo(b.x, b.y); for (let i = 1; i <= 16; i++) ctx.lineTo(b.x + b.face * b.len * i / 16, b.y + (i < 16 ? rand(-7, 7) : 0)); ctx.stroke(); });
      ctx.restore(); });
    G.waves.forEach((w) => { if (w.delay > 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.shadowColor = w.col[0]; ctx.shadowBlur = 18; spr(ctx, 'bfx', 'burst', 0, w.x, FLOOR - 30, Math.sign(w.vx), 0.9 + 0.12 * Math.sin(G.t * 30)); ctx.restore(); });
    (G.rings || []).forEach((r) => { const k = r.t / r.max; ctx.save(); ctx.globalAlpha = (1 - k) * (calm ? 0.4 : 0.85); ctx.strokeStyle = r.col; ctx.lineWidth = 10 * (1 - k) + 2; ctx.shadowColor = r.col; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(r.x, r.y, r.r * (0.25 + k), 0, 7); ctx.stroke(); ctx.restore(); });
    (G.texts || []).forEach((t) => { ctx.save(); ctx.globalAlpha = clamp(t.t * 2, 0, 1); ctx.font = '24px "Metal Mania", Impact, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 5; ctx.strokeStyle = '#120c08'; ctx.strokeText(t.text, t.x, t.y); ctx.fillStyle = t.col; ctx.fillText(t.text, t.x, t.y); ctx.restore(); });
    G.fx.forEach((p) => { ctx.globalAlpha = clamp(p.life * 3, 0, 1); ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.r, p.r); }); ctx.globalAlpha = 1;
  }
  function bar(x, y, w, h, frac, col, right) { ctx.fillStyle = 'rgba(20,12,6,0.85)'; ctx.fillRect(x - 3, y - 3, w + 6, h + 6); ctx.fillStyle = '#3a1410'; ctx.fillRect(x, y, w, h); const fw = w * clamp(frac, 0, 1); ctx.fillStyle = col; ctx.fillRect(right ? x + w - fw : x, y, fw, h); ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 2; ctx.strokeRect(x - 1, y - 1, w + 2, h + 2); }
  function drawHud() {
    const HS = PORTRAIT ? 1.5 : 1, HW = SW / HS; ctx.save(); ctx.scale(HS, HS);   // upright phones: a bigger HUD, like the Quest's score bar
    const [a, b] = G.p; ctx.textBaseline = 'middle';
    bar(30, 24, HW * 0.396, 22, a.hp / a.maxHp, a.hp / a.maxHp > 0.3 ? '#e7c46a' : '#e0503a', false);
    bar(HW - 30 - HW * 0.396, 24, HW * 0.396, 22, b.hp / b.maxHp, b.hp / b.maxHp > 0.3 ? '#e7c46a' : '#e0503a', true);
    bar(30, 54, HW * 0.19, 8, a.meter / 100, a.meter >= 100 ? (Math.floor(G.t * 4) % 2 && !calm ? '#ffffff' : '#57b6ff') : '#57b6ff', false);
    bar(HW - 30 - HW * 0.19, 54, HW * 0.19, 8, b.meter / 100, b.meter >= 100 ? (Math.floor(G.t * 4) % 2 && !calm ? '#ffffff' : '#57b6ff') : '#57b6ff', true);
    ctx.font = '22px "Bebas Neue", Impact, sans-serif'; ctx.fillStyle = '#f3ead2'; ctx.strokeStyle = '#120c08'; ctx.lineWidth = 4;
    const name = (t, x, al) => { ctx.textAlign = al; ctx.strokeText(t, x, 78); ctx.fillText(t, x, 78); };
    name(a.ch.name.toUpperCase() + (a.meter >= 100 ? '  ·  SUPER READY' : ''), 30, 'left'); name((b.meter >= 100 ? 'SUPER READY  ·  ' : '') + b.ch.name.toUpperCase() + (b.cpu ? ' (CPU)' : ''), HW - 30, 'right');
    // round wins as gold laurels
    for (let i = 0; i < 2; i++) { ctx.fillStyle = a.wins > i ? '#e7c46a' : 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.arc(30 + HW * 0.396 - 8 - i * 18, 58, 6, 0, 7); ctx.fill();
      ctx.fillStyle = b.wins > i ? '#e7c46a' : 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.arc(HW - 30 - HW * 0.396 + 8 + i * 18, 58, 6, 0, 7); ctx.fill(); }
    // timer
    ctx.textAlign = 'center'; ctx.font = '50px "Bebas Neue", Impact, sans-serif'; ctx.lineWidth = 6; ctx.strokeText(String(Math.ceil(G.timer)), HW / 2, 38); ctx.fillStyle = G.timer < 10 ? '#ff7a59' : '#f3ead2'; ctx.fillText(String(Math.ceil(G.timer)), HW / 2, 38);
    if (G.comboMsg && G.comboMsg.t > 0) { ctx.save(); ctx.globalAlpha = clamp(G.comboMsg.t * 2, 0, 1); ctx.font = '34px "Metal Mania", Impact, sans-serif'; ctx.textAlign = G.comboMsg.side ? 'right' : 'left'; const x = G.comboMsg.side ? HW - 30 : 30;
      ctx.lineWidth = 6; const cy = G.training && !G.comboMsg.side ? 372 : 130; ctx.strokeText(G.comboMsg.n + ' HIT COMBO!', x, cy); ctx.fillStyle = '#ffd27a'; ctx.fillText(G.comboMsg.n + ' HIT COMBO!', x, cy); ctx.restore(); }
    if (G.training) { ctx.save(); ctx.fillStyle = 'rgba(12,8,5,0.78)'; ctx.fillRect(18, 96, 300, 250); ctx.strokeStyle = '#a8842a'; ctx.strokeRect(18, 96, 300, 250);
      ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillStyle = '#e7c46a'; ctx.font = '22px "Bebas Neue", Impact, sans-serif'; ctx.fillText('TRAINING · MOVE LIST', 30, 106);
      ctx.font = '600 16px "Cormorant Garamond", Georgia, serif'; ctx.fillStyle = '#f3ead2';
      const me = G.p[0], pas = PASSIVE[me.ch.id];
      ['J / P  punch          K / HP  heavy punch', 'U / K  kick             I / HK  heavy kick', 'L / S  special: ' + me.ch.special.name, 'Q / ★  super (meter is always full here)', 'Space / ✦  combo breaker (when hit)', 'S / ▼  crouch · hold back to block', 'Chain: punch → kick → heavy → special', 'Passive: ' + (pas ? pas[0] + ' — ' + pas[1] : '—')]
        .forEach((l, i) => ctx.fillText(l, 30, 132 + i * 21));
      if (G.tc) { ctx.fillStyle = '#ffd27a'; ctx.font = '21px "Bebas Neue", Impact, sans-serif'; ctx.fillText(`Last combo: ${G.tc.hits} hit${G.tc.hits > 1 ? 's' : ''}, ${Math.round(G.tc.dmg)} damage`, 30, 316); }
      ctx.restore(); }
    if (G.stageName && G.mode === 'intro') { ctx.save(); ctx.textAlign = 'center'; ctx.font = '30px "Metal Mania", Impact, sans-serif'; ctx.lineWidth = 5; ctx.strokeStyle = '#120c08'; ctx.strokeText(G.stageName.toUpperCase(), HW / 2, (PORTRAIT ? SH / HS * 0.4 - 80 : 150)); ctx.fillStyle = '#e7c46a'; ctx.fillText(G.stageName.toUpperCase(), HW / 2, (CAM ? SH / HS * 0.4 - 80 : 150)); ctx.restore(); }
    if (G.banner) { const bn = G.banner, t = bn.t; ctx.save(); ctx.textAlign = 'center';
      const sc = Math.min(1, t * 5) * (bn.big ? 1.25 : bn.small ? 0.6 : 1); const showSub = bn.sub && t > 0.9;
      ctx.translate(HW / 2, (PORTRAIT ? SH / HS * 0.4 : 230)); ctx.scale(sc, sc); ctx.font = '100px "Metal Mania", Impact, sans-serif'; ctx.lineWidth = 10; ctx.strokeStyle = '#120c08';
      const txt = showSub ? bn.sub : bn.text; ctx.strokeText(txt, 0, 0); const gr = ctx.createLinearGradient(0, -40, 0, 40); gr.addColorStop(0, '#fff6d8'); gr.addColorStop(1, '#e7a227'); ctx.fillStyle = gr; ctx.fillText(txt, 0, 0); ctx.restore(); }
    ctx.restore();
  }

  function render() {
    ctx.setTransform(RES, 0, 0, RES, 0, 0);
    if (!G) { ctx.fillStyle = '#120c08'; ctx.fillRect(0, 0, SW, SH); return; }
    ctx.save(); if (G.shake > 0 && !calm) ctx.translate(rand(-8, 8) * G.shake * 2, rand(-8, 8) * G.shake * 2);
    {   // fighting-game camera: zooms in when the fighters close in, pulls back as they separate, always keeps both in view
      const [p, q] = G.p, mid = (p.x + q.x) / 2, want = clamp(BASE.w / (Math.abs(p.x - q.x) + (PORTRAIT ? 300 : 360)), 1, PORTRAIT ? 1.5 : 1.3);
      CZ += (want - CZ) * 0.06; const Wv = BASE.w / CZ, Hv = BASE.h / CZ; CX += (clamp(mid, BASE.minX + Wv / 2, BASE.minX + BASE.w - Wv / 2) - CX) * 0.12;
      CX = clamp(CX, BASE.minX + Wv / 2, BASE.minX + BASE.w - Wv / 2);
      CAM = { x0: CX - Wv / 2, s: SW / Wv, top: VH - Hv, w: Wv, h: Hv }; ctx.scale(CAM.s, CAM.s); ctx.translate(-CAM.x0, -CAM.top);
    }
    drawBg(); const order = G.p.slice().sort((x, y) => (x.state === 'attack') - (y.state === 'attack')); order.forEach(drawFighter); drawAttacks();
    if (G.flash > 0 && !calm) { ctx.fillStyle = `rgba(255,255,255,${G.flash * 0.6})`; ctx.fillRect(-VW, -VH, VW * 3, VH * 3); }
    else if (G.flash > 0) { ctx.fillStyle = 'rgba(10,6,20,0.35)'; ctx.fillRect(-VW, -VH, VW * 3, VH * 3); }
    ctx.restore(); drawHud();
  }
  function frame(now) { const dt = Math.min(0.05, (now - last) / 1000); last = now; update(dt / 2); update(dt / 2); render(); requestAnimationFrame(frame); }

  /* ================= screens ================= */
  let chosen = [null, null], mode = store.get('af-mode') || 'cpu', level = store.get('af-level') || 2;
  function portrait(c) {
    const cnv = document.createElement('canvas'); cnv.width = 150; cnv.height = 170; const g = cnv.getContext('2d');
    const draw = () => { const f = frameOf(c.anims.idle.set, c.anims.idle.a, 0); if (!f) return; const s = Math.min(150 * 0.9 / f[2], 160 / f[3]); g.clearRect(0, 0, 150, 170); spr(g, c.anims.idle.set, c.anims.idle.a, 0, 75, 166, 1, s); };
    const im = imgFor(c.anims.idle.set); if (im.complete) draw(); else im.addEventListener('load', draw, { once: true });
    return cnv;
  }
  function buildSelect() {
    const grid = $('#roster'); grid.replaceChildren();
    ROSTER.forEach((c, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'card'; b.dataset.i = i; b.setAttribute('aria-label', `${c.name}, ${c.title}`);
      const cap = document.createElement('span'); cap.className = 'nm'; cap.textContent = c.name; const t = document.createElement('small'); t.textContent = c.special.name + (PASSIVE[c.id] ? ' · ' + PASSIVE[c.id][0] : ''); t.title = PASSIVE[c.id] ? PASSIVE[c.id][1] : ''; cap.append(t);
      b.append(portrait(c), cap); b.addEventListener('click', () => choose(i)); grid.append(b);
    });
    syncSelect();
  }
  function syncSelect() {
    document.querySelectorAll('#roster .card').forEach((b) => { const i = +b.dataset.i; b.classList.toggle('p1', chosen[0] === i); b.classList.toggle('p2', chosen[1] === i); });
    if (mode === 'arcade' && chosen[1] !== null) chosen[1] = null;
    if (mode === 'training' && chosen[0] !== null && chosen[1] === null) $('#sel-step').dataset.t = '1';
    const best = store.get('af-arcade-best');
    const step = mode === 'training' ? (chosen[0] === null ? 'Training: choose the fighter you want to practice' : chosen[1] === null ? 'Pick a sparring dummy, or press Fight for a random one' : 'Ready to train!') : chosen[0] === null ? (mode === 'arcade' ? 'Arcade: choose your champion and defeat six challengers' + (best ? ` (best score ${best.toLocaleString('en-US')})` : '') : 'Player 1: choose your fighter') : mode === 'arcade' ? 'Ready! Six stages, ending at the Throne of Hades.' : mode === 'cpu' ? (chosen[1] === null ? 'Choose your opponent, or press Fight for a random one' : 'Ready!') : chosen[1] === null ? 'Player 2: choose your fighter' : 'Ready!';
    $('#sel-step').textContent = step; $('#fight').disabled = chosen[0] === null || (mode === '2p' && chosen[1] === null);
    document.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
    document.querySelectorAll('[data-level]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.level === level)));
    $('#levels').hidden = mode === '2p' || mode === 'training'; $('#stage-row').hidden = mode === 'arcade';
  }
  function choose(i) { SFX.ensure(); SFX.coin(); if (!G) MUSIC.play('acta'); if (mode === 'arcade') { chosen = [i, null]; syncSelect(); return; } if (chosen[0] === null) chosen[0] = i; else if (chosen[1] === null) chosen[1] = i; else { chosen = [i, null]; } syncSelect(); }
  document.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => { mode = b.dataset.mode; store.set('af-mode', mode); chosen[1] = null; syncSelect(); }));
  document.querySelectorAll('[data-level]').forEach((b) => b.addEventListener('click', () => { level = +b.dataset.level; store.set('af-level', level); syncSelect(); }));
  (() => {   // stage select for versus and training
    const sel = $('#stage-pick'); const o = document.createElement('option'); o.value = 'random'; o.textContent = 'Random stage'; sel.append(o);
    LOCAL_BG.forEach((n) => { const op = document.createElement('option'); op.value = n; op.textContent = STAGE_NAMES[n]; sel.append(op); });
    const cur = store.get('af-stage'); sel.value = cur && LOCAL_BG.includes(cur) ? cur : 'random';
    sel.addEventListener('change', () => store.set('af-stage', sel.value === 'random' ? null : sel.value));
  })();
  $('#sel-reset').addEventListener('click', () => { chosen = [null, null]; syncSelect(); });
  $('#fight').addEventListener('click', () => {
    SFX.ensure(); let p2 = chosen[1]; if (p2 === null) { do { p2 = Math.floor(Math.random() * ROSTER.length); } while (p2 === chosen[0]); }
    $('#s-select').hidden = true; $('#s-fight').hidden = false; $('#result').hidden = true; fit();
    ARC = null;
    if (mode === 'training') { newMatch(ROSTER[chosen[0]], ROSTER[p2], 0); G.training = true; G.p[1].dummy = true; G.p[1].cpu = null; G.stageName = 'Training · ' + G.stageName; window.scrollTo({ top: 0 }); return; }
    if (mode === 'arcade') {
      const me = ROSTER[chosen[0]], hades = ROSTER.find((c) => c.id === 'hades'), boss = me === hades ? ROSTER.find((c) => c.id === 'colossus') : hades;
      const pool = ROSTER.filter((c) => c !== me && c !== boss).sort(() => Math.random() - 0.5).slice(0, 5);
      ARC = { ladder: pool.concat([boss]), stage: 0, score: 0, base: level };
      newMatch(me, ARC.ladder[0], arcLevel());
    } else newMatch(ROSTER[chosen[0]], ROSTER[p2], mode === 'cpu' ? level : 0);
    window.scrollTo({ top: 0 });
  });
  const arcLevel = () => Math.min(3.4, ARC.base - 0.5 + ARC.stage * 0.3);
  function showResult(champ) {
    const r = $('#result'); r.hidden = false;
    $('#res-k').textContent = champ.cpu ? 'Defeat' : (G.p[1].cpu ? 'Victory' : `Player ${champ.side + 1} wins`);
    $('#res-name').textContent = champ.ch.name; $('#res-quote').textContent = '“' + champ.ch.quote + '”';
    if (!champ.cpu && G.p[1].cpu) { const s = (store.get('af-streak') || 0) + 1; store.set('af-streak', s); $('#res-streak').textContent = `Win streak: ${s}`; } else if (G.p[1].cpu) { store.set('af-streak', 0); $('#res-streak').textContent = 'Win streak reset. Breathe, and go again.'; } else $('#res-streak').textContent = '';
    $('#res-again').textContent = 'Rematch'; $('#res-next').hidden = false; $('#res-end').hidden = true;
    if (ARC) {
      const won = champ.side === 0;
      if (won) { ARC.score += 1000 + Math.round(champ.hp / champ.maxHp * 1000) + Math.ceil(G.timer) * 10; ARC.stage += 1; }
      const done = won && ARC.stage >= 6;
      $('#res-k').textContent = done ? 'Champion of the Arena' : won ? `Stage ${ARC.stage} cleared` : `Stage ${ARC.stage + 1} lost`;
      if (done) { const best = Math.max(store.get('af-arcade-best') || 0, ARC.score); store.set('af-arcade-best', best); $('#res-streak').textContent = `Final score ${ARC.score.toLocaleString('en-US')} · best ${best.toLocaleString('en-US')}. The gods bow to you.`; $('#res-again').textContent = 'New campaign';
        const e = ENDINGS[champ.ch.id]; if (e) { const box = $('#res-end'); box.replaceChildren(portrait(champ.ch)); e.forEach((line) => { const p = document.createElement('p'); p.textContent = line; box.append(p); }); box.hidden = false; $('#res-name').textContent = champ.ch.name + ': The Ending'; } }
      else { $('#res-streak').textContent = `Score ${ARC.score.toLocaleString('en-US')}` + (won ? ` · next: ${ARC.ladder[ARC.stage].name}` : ''); $('#res-again').textContent = won ? 'Next battle' : 'Retry stage'; }
      $('#res-next').hidden = true; ARC.done = done;
    }
    setTimeout(() => $('#res-again').focus({ preventScroll: true }), 50);
  }
  $('#res-again').addEventListener('click', () => { $('#result').hidden = true; const [a, b] = G.p;
    if (ARC) { if (ARC.done) { const me = a.ch; const boss = ARC.ladder[5]; ARC = { ladder: ROSTER.filter((c) => c !== me && c !== boss).sort(() => Math.random() - 0.5).slice(0, 5).concat([boss]), stage: 0, score: 0, base: ARC.base }; } newMatch(a.ch, ARC.ladder[ARC.stage], arcLevel()); }
    else newMatch(a.ch, b.ch, G.cpuLevel); });
  $('#res-next').addEventListener('click', () => { $('#result').hidden = true; const a = G.p[0]; let n; do { n = pick(ROSTER); } while (n === a.ch); newMatch(a.ch, n, G.cpuLevel || level); });
  $('#res-select').addEventListener('click', backToSelect);
  function backToSelect() { G = null; MUSIC.play('acta'); ARC = null; $('#s-fight').hidden = true; $('#s-select').hidden = false; $('#result').hidden = true; $('#menu').hidden = true; chosen[1] = null; syncSelect(); }
  // settings
  function togglePause(force) { if (!G || G.mode === 'over') return; G.pause = force !== undefined ? force : !G.pause; $('#menu').hidden = !G.pause; if (G.pause) MUSIC.pause(); else { MUSIC.resume(); last = performance.now(); } }
  $('#gear').addEventListener('click', () => togglePause());
  $('#m-resume').addEventListener('click', () => togglePause(false));
  $('#m-select').addEventListener('click', backToSelect);
  const syncBtns = () => { $('#m-music').textContent = 'Music: ' + (MUSIC.on ? 'on' : 'off'); $('#m-sound').textContent = 'Sound: ' + (SFX.on ? 'on' : 'off'); $('#m-calm').textContent = 'Calm mode: ' + (calm ? 'on' : 'off'); $('#m-calm').setAttribute('aria-pressed', String(calm)); };
  $('#m-music').addEventListener('click', () => { SFX.ensure(); MUSIC.toggle(); syncBtns(); });
  $('#m-sound').addEventListener('click', () => { SFX.ensure(); SFX.toggle(); syncBtns(); });
  $('#m-calm').addEventListener('click', () => { calm = !calm; store.set('af-calm', calm); syncBtns(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && G && G.mode !== 'over' && !G.pause) togglePause(true); });
  if (document.fonts) ['24px "Metal Mania"', '24px "Bebas Neue"'].forEach((f) => document.fonts.load(f).catch(() => {}));   // canvas text needs the fonts loaded before first use
  syncBtns(); buildSelect(); fit(); requestAnimationFrame(frame);
})();
