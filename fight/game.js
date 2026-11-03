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
      ensure, get ac() { return ac; }, get on() { return on; }, toggle() { on = !on; store.set('af-sound', on); return on; },
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
    let on = store.get('af-music') !== false, ac = null, master = null, noise = null, timer = null, track = null, name = '', step = 0, nextT = 0, running = false;
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
      riot: { bpm: 168, wave: 'square', leadVol: 0, harm: 0, bass: 'octave', pad: 0, arp: 0, power: 0.05,
        kick: [0, 4, 8, 12], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14], tick: false, fill: true,
        chords: [ch('E2 B2 E3'), ch('E2 B2 E3'), ch('A2 E3 A3'), ch('G2 D3 G3')],
        lead: [seq('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -')] },
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
      master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
      noise = ac.createBuffer(1, ac.sampleRate * 0.3, ac.sampleRate); const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      return true;
    }
    function env(g, t, a, peak, hold, rel) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.setValueAtTime(peak, t + a + hold); g.gain.exponentialRampToValueAtTime(0.0001, t + a + hold + rel); }
    function voice(f, t, dur, wave, vol, cutoff, a = 0.01, rel = 0.08) {
      const o = ac.createOscillator(), g = ac.createGain(); o.type = wave; o.frequency.setValueAtTime(f, t);
      let out = o; if (cutoff) { const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = cutoff; o.connect(lp); out = lp; }
      out.connect(g); g.connect(master); env(g, t, a, vol, Math.max(0.01, dur - a), rel); o.start(t); o.stop(t + dur + rel + 0.05);
    }
    function drum(kind, t, v = 1) {
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
      if (n) { const cut = tr.wave === 'sawtooth' ? 2600 : tr.wave === 'square' ? 3400 : 0; voice(n.f, t, n.d * sd * 0.9, tr.wave, tr.leadVol, cut, 0.008, 0.1); if (tr.harm) voice(n.f / 2, t, n.d * sd * 0.9, 'square', tr.harm, 1600, 0.008, 0.1); }
      const root = c[0] / 2;
      if (tr.power && b % 2 === 0) [1, 1.5, 2, 1.004].forEach((r) => voice(c[0] * r, t, sd * 1.9, 'square', tr.power, 2200, 0.004, 0.05));
      if (tr.bass === 'octave' && b % 2 === 0) voice((b / 2) % 2 ? root * 2 : root, t, sd * 0.85, 'sawtooth', 0.085, 900, 0.005, 0.05);
      if (tr.bass === 'gallop' && (b % 4 !== 1)) voice(b % 4 === 0 ? root : root * 2, t, sd * 0.8, 'sawtooth', 0.085, 1000, 0.004, 0.04);
      if (tr.pad && b === 0) c.forEach((f) => { voice(f * 2, t, sd * 15, 'sawtooth', tr.pad / 2, 1300, 0.08, 0.4); voice(f * 2 * 1.007, t, sd * 15, 'sawtooth', tr.pad / 2, 1300, 0.08, 0.4); });
      if (tr.arp && b % tr.arp === 0) { const k = (b / tr.arp) % 4, tones = [c[0], c[1], c[2], c[1]]; voice(tones[k] * 4, t, sd * tr.arp * 0.55, tr.arpWave, tr.arpVol, 0, 0.004, 0.12); }
      const filling = tr.fill && bar % 4 === 3 && sec === tr.lead.length - 1 && b >= 12;
      if (tr.kick.includes(b)) drum('k', t);
      if (filling) drum('s', t, 0.55 + (b - 12) * 0.15);
      else if (tr.snare.includes(b)) drum('s', t);
      if (tr.hat.includes(b)) drum('o', t);
      if (tr.tick) drum('h', t, b % 2 ? 0.5 : 0.8);
      if (bar === 0 && b === 0 && sec === 0) drum('c', t);
    }
    function tick() { if (!running || !track) return; while (nextT < ac.currentTime + 0.15) { schedule(step, nextT); nextT += 60 / track.bpm / 4; step++; } }
    function start() { if (!on || !track || !init()) return; running = true; clearInterval(timer); nextT = Math.max(nextT, ac.currentTime + 0.05); timer = setInterval(tick, 25);
      master.gain.cancelScheduledValues(ac.currentTime); master.gain.setTargetAtTime(name === 'boss' || name === 'knights' || name === 'riot' ? 0.36 : 0.32, ac.currentTime, 0.25); }
    function halt(fade = 0.15) { running = false; clearInterval(timer); if (master) { master.gain.cancelScheduledValues(ac.currentTime); master.gain.setTargetAtTime(0, ac.currentTime, fade); } }
    return {
      get on() { return on; },
      play(n) { if (name === n && running) return; name = n; track = T[n]; step = 0; if (ac) nextT = ac.currentTime + 0.3; start(); },
      pause() { halt(0.08); }, resume() { if (track) { if (ac) nextT = ac.currentTime + 0.1; start(); } }, stop() { halt(0.4); name = ''; },
      toggle() { on = !on; store.set('af-music', on); if (on) this.resume(); else halt(0.1); return on; },
    };
  })();


  /* ================= art ================= */
  const Q = '../quest/img/';
  const SPR = img(Q + 'sprites.webp'), BOSSIMG = img(Q + 'boss.webp'), ENEMYIMG = img(Q + 'enemies.webp'), ELITEIMG = img(Q + 'elites.webp'), MARCUSIMG = img(Q + 'marcus.webp');
  const LATLAS = {"fx2":{"colossus":[[635,416,63,70,31,35]],"medusa":[[700,416,54,70,27,35]],"chiron":[[756,416,74,70,37,35]],"diana":[[832,416,194,70,97,35]],"hades":[[1028,416,60,70,30,35]]},"g_colossus":{"idle":[[361,171,91,120,45,120],[0,416,70,94,32,94]],"walk":[[0,416,70,94,32,94],[1536,296,78,98,37,98]],"jump":[[1536,296,78,98,37,98]],"light":[[1365,296,79,105,39,105],[1446,296,88,101,43,101]],"heavy":[[1446,296,88,101,43,101],[1854,296,92,97,43,97]],"special":[[140,416,91,92,48,92]],"hurt":[[560,416,73,80,35,80]]},"g_medusa":{"idle":[[454,171,81,120,41,120],[145,296,69,117,34,117]],"walk":[[454,171,81,120,41,120],[145,296,69,117,34,117]],"jump":[[1948,296,80,97,34,97]],"light":[[1948,296,80,97,34,97],[1616,296,83,98,36,98]],"heavy":[[1616,296,83,98,36,98],[326,416,69,85,30,85]],"special":[[397,416,68,85,25,85]],"hurt":[[326,416,69,85,30,85]]},"g_minotaur":{"idle":[[537,171,120,120,50,120],[1706,0,144,124,66,124]],"walk":[[537,171,120,120,50,120],[1706,0,144,124,66,124]],"jump":[[1376,0,125,127,62,127]],"light":[[1376,0,125,127,62,127],[1201,0,173,131,94,131]],"heavy":[[1701,296,151,98,53,98]],"special":[[1007,0,192,135,95,135]],"hurt":[[1201,0,173,131,94,131]]},"g_mars":{"idle":[[659,171,105,120,34,120]],"walk":[[659,171,105,120,34,120],[530,296,127,115,46,115]],"jump":[[216,296,147,116,66,116]],"light":[[170,171,189,122,14,122]],"heavy":[[530,296,127,115,46,115],[883,296,118,110,58,110]],"special":[[883,296,118,110,58,110]],"hurt":[[216,296,147,116,66,116]]},"g_vulcan":{"idle":[[766,171,131,120,31,120],[1503,0,112,125,31,125]],"walk":[[766,171,131,120,31,120],[1503,0,112,125,31,125]],"jump":[[1503,0,112,125,31,125]],"light":[[1003,296,158,109,46,109]],"heavy":[[0,171,168,123,87,123]],"special":[[332,0,332,156,165,156]],"hurt":[[1503,0,112,125,31,125]]},"g_chiron":{"idle":[[899,171,98,120,49,120]],"walk":[[1267,296,96,106,48,106],[72,416,66,93,35,92]],"jump":[[1163,296,102,108,54,108]],"light":[[1768,171,137,118,41,118]],"heavy":[[1267,296,96,106,48,106]],"special":[[659,296,128,115,69,114]],"hurt":[[72,416,66,93,35,92]]},"g_diana":{"idle":[[1672,171,94,119,35,119]],"walk":[[1672,171,94,119,35,119],[233,416,91,91,27,91]],"jump":[[233,416,91,91,27,91]],"light":[[1672,171,94,119,35,119],[999,171,131,120,21,120]],"heavy":[[467,416,91,85,39,84]],"special":[[999,171,131,120,21,120]],"hurt":[[233,416,91,91,27,91]]},"g_cerberus":{"idle":[[1132,171,145,120,72,119],[365,296,163,116,79,115]],"walk":[[0,296,143,118,63,117],[1279,171,189,120,71,120]],"jump":[[365,296,163,116,79,115]],"light":[[1279,171,189,120,71,120]],"heavy":[[365,296,163,116,79,115]],"special":[[0,0,330,169,164,169]],"hurt":[[0,296,143,118,63,117]]},"g_hades":{"idle":[[1470,171,99,120,40,120],[789,296,92,114,26,113]],"walk":[[1852,0,104,124,31,123],[1571,171,99,120,40,119]],"jump":[[666,0,94,142,38,142]],"light":[[1571,171,99,120,40,119]],"heavy":[[1617,0,87,125,41,124],[762,0,113,137,50,137]],"special":[[877,0,128,137,63,137]],"hurt":[[1852,0,104,124,31,123]]}};
  const LEGENDIMG = img('legends.webp');
  const PATLAS = {"p_colossus":{"idle":[[0,0,244,320,140,319]]},"p_medusa":{"idle":[[246,0,221,320,99,320]]},"p_minotaur":{"idle":[[469,0,292,320,106,319]]},"p_pegasus":{"idle":[[763,0,310,320,155,319]]},"p_helios":{"idle":[[1075,0,311,320,155,319]]},"p_mars":{"idle":[[1388,0,239,320,119,319]]},"p_neptune":{"idle":[[1629,0,307,320,143,319]]},"p_vulcan":{"idle":[[0,322,302,320,133,319]]},"p_chiron":{"idle":[[304,322,235,320,117,319]]},"p_diana":{"idle":[[541,322,200,320,102,319]]},"p_cerberus":{"idle":[[743,322,289,320,144,319]]},"p_hades":{"idle":[[1034,322,241,320,110,319]]}};
  const NATIVE = {"colossus":1,"medusa":1,"minotaur":1,"pegasus":1,"helios":1,"mars":-1,"neptune":1,"vulcan":1,"chiron":-1,"diana":1,"cerberus":1,"hades":1};   // which way each portrait faces in the art
  const PORTIMG = img('portraits.webp');
  const ALL = Object.assign({}, ATLAS, EATLAS, XATLAS, MATLAS, LATLAS, PATLAS);
  const imgFor = (set) => (PATLAS[set] ? PORTIMG : LATLAS[set] ? LEGENDIMG : set === 'boss' || set === 'bfx' ? BOSSIMG : MATLAS[set] ? MARCUSIMG : XATLAS[set] ? ELITEIMG : EATLAS[set] ? ENEMYIMG : SPR);
  const PIXEL = new Set(['knight', 'archer', 'commander', 'priestess', 'warrior', 'fx']);
  function frameOf(set, anim, i) { const fr = ALL[set] && ALL[set][anim]; if (!fr) return null; return fr[((Math.floor(i) % fr.length) + fr.length) % fr.length]; }
  function spr(g, set, anim, i, x, y, face = 1, scale = 1, alpha = 1) {
    const f = frameOf(set, anim, i); const im = imgFor(set); if (!f || !im.complete || !im.naturalWidth) return;
    const [sx, sy, w, h, ax, ay] = f;
    g.save(); if (alpha !== 1) g.globalAlpha *= alpha; g.imageSmoothingEnabled = !PIXEL.has(set);
    g.translate(Math.round(x), Math.round(y)); if (face < 0) g.scale(-1, 1);
    g.drawImage(im, sx, sy, w, h, -ax * scale, -ay * scale, w * scale, h * scale); g.restore();
  }
  const BGS = ['bg-pantheon', 'bg-tesla', 'bg-planets', 'bg-orbs', 'bg-eternity', 'bg-underworld', 'bg-pluto', 'bg-sketch', 'bg-chamber', 'bg-lab'].map((n) => img(Q + n + '.webp'));

  /* ================= the roster =================
     each fighter: frames for idle/walk/jump/light/heavy/special/hurt/ko, size, speed, and a special move */
  const H = (set, a, frames) => ({ set, a, f: frames });   // frames: list of frame indexes, or omitted for all
  function std(set) { return { idle: H(set, 'idle'), walk: H(set, 'walk'), jump: H(set, 'jump'), light: H(set, 'attack', [0, 1]), heavy: H(set, 'attack'), special: H(set, 'attack'), hurt: H(set, 'hurt'), ko: H(set, 'die'), victory: H(set, 'idle') }; }
  function elite(set) { return { idle: H(set, 'idle'), walk: H(set, 'walk'), jump: H(set, 'wind'), light: H(set, 'attack'), heavy: H(set, 'wind', [0]), heavyHit: H(set, 'attack'), special: H(set, 'special'), hurt: H(set, 'recover'), ko: null, victory: H(set, 'wind') }; }
  const PT = (id) => { const a = { portrait: id }; ['idle', 'walk', 'jump', 'light', 'heavy', 'special', 'hurt', 'victory'].forEach((k) => { a[k] = H('p_' + id, 'idle'); }); a.ko = null; return a; };
  const LG = (id) => { const s = 'g_' + id; return { idle: H(s, 'idle'), walk: H(s, 'walk'), jump: H(s, 'jump'), light: H(s, 'light'), heavy: H(s, 'heavy'), special: H(s, 'special'), hurt: H(s, 'hurt'), ko: null, victory: H(s, 'special') }; };
  const ROSTER = [
    { id: 'marcus', name: 'Marcus Aurelius', title: 'The Tesla Legate', size: 1.0, speed: 250, hp: 100, anims: { idle: H('n3', 'idle'), walk: H('n3', 'walk'), jump: H('n3', 'jump'), light: H('n3', 'attack', [1, 2]), heavy: H('n3', 'attack'), special: H('n3', 'attack', [1]), hurt: H('n3', 'hurt'), ko: null, victory: H('n3', 'special') },
      special: { kind: 'proj', name: 'Lightning Wave', set: 'bfx', a: 'orb', sc: 1.0, speed: 520, col: ['#8fe6ff', '#ffffff', '#57b6ff'] }, quote: 'You have power over your mind, not outside events.' },
    { id: 'mars', name: 'Mars Warforge', title: 'God of the Legions', size: 1.04, speed: 255, hp: 105, anims: PT('mars'),
      special: { kind: 'dash', name: 'Crimson Cleave', dist: 320, col: ['#ff4a3d', '#ffd27a', '#ffffff'] }, quote: 'War is my forge, and you are the iron.' },
    { id: 'colossus', name: 'Augustus Colossus', title: 'The Living Statue', size: 1.15, speed: 215, hp: 120, anims: PT('colossus'),
      special: { kind: 'proj', name: 'Thunder Fist', set: 'fx2', a: 'colossus', sc: 1.2, speed: 500, col: ['#57b6ff', '#ffffff', '#bfe6ff'] }, quote: 'Empires crumble. Marble endures.' },
    { id: 'medusa', name: 'Medusa Technomancer', title: 'Gaze of Stone', size: 1.0, speed: 245, hp: 95, anims: PT('medusa'),
      special: { kind: 'proj', name: 'Hex Sigil', set: 'fx2', a: 'medusa', sc: 1.1, speed: 430, col: ['#c070ff', '#ffffff', '#7b3fa0'] }, quote: 'Look at me. I insist.' },
    { id: 'minotaur', name: 'Minotaur Engine', title: 'Beast of the Labyrinth', size: 1.1, speed: 235, hp: 115, anims: PT('minotaur'),
      special: { kind: 'dash', name: 'Gore Charge', dist: 360, col: ['#ff9a3d', '#ffd27a', '#ffffff'] }, quote: 'Every maze ends with me.' },
    { id: 'vulcan', name: 'Vulcan Forge', title: 'Smith of the Gods', size: 1.08, speed: 225, hp: 120, anims: PT('vulcan'),
      special: { kind: 'wave', name: 'Magma Hammer', col: ['#ff9a3d', '#ffd27a', '#ff4a1a'] }, quote: 'I forged the thunderbolts. I can forge your defeat.' },
    { id: 'chiron', name: 'Chiron Astronomer', title: 'Archer of the Stars', size: 1.12, speed: 265, hp: 100, anims: PT('chiron'),
      special: { kind: 'proj', name: 'Star Chart', set: 'fx2', a: 'chiron', sc: 1.0, speed: 460, col: ['#ffd27a', '#ffffff', '#e7a227'] }, quote: 'The stars told me how this ends.' },
    { id: 'diana', name: 'Diana Hunter', title: 'Moon of the Forest', size: 1.0, speed: 280, hp: 90, anims: PT('diana'),
      special: { kind: 'proj', name: 'Emerald Arrow', set: 'fx2', a: 'diana', sc: 1.2, speed: 760, col: ['#b6ff4a', '#ffffff', '#4ad84a'] }, quote: 'I never miss. I only wait.' },
    { id: 'cerberus', name: 'Cerberus Unit', title: 'Hound of the Gate', size: 1.0, speed: 270, hp: 110, anims: PT('cerberus'),
      special: { kind: 'dash', name: 'Hellfire Pounce', dist: 340, col: ['#ff6a1a', '#ffd27a', '#ffffff'] }, quote: 'Three heads. Zero mercy.' },
    { id: 'pegasus', name: 'Pegasus Drone', title: 'Skyfire Assault', size: 1.05, speed: 290, hp: 92, anims: PT('pegasus'),
      special: { kind: 'dash', name: 'Heavenfall Strike', dist: 380, col: ['#56c9ff', '#ffffff', '#bfe6ff'] }, quote: 'The sky was never your side of the arena.' },
    { id: 'helios', name: 'Helios Orb', title: 'Solar Furnace', size: 0.95, speed: 240, hp: 98, hover: 26, anims: PT('helios'),
      special: { kind: 'beam', name: 'Supernova Beam', len: 560, col: ['#ffc24b', '#ffffff', '#ffe28a'] }, quote: 'I do not fight. I simply shine.' },
    { id: 'neptune', name: 'Neptune Leviathan', title: 'Abyssal Tide', size: 1.12, speed: 225, hp: 116, anims: PT('neptune'),
      special: { kind: 'wave', name: 'Tsunami Surge', col: ['#27d8ff', '#ffffff', '#1f6bd8'] }, quote: 'The tide always returns. So do I.' },
    { id: 'hades', name: 'Hades Sentinel', title: 'Keeper of Shadows', size: 1.05, speed: 235, hp: 105, anims: PT('hades'),
      special: { kind: 'proj', name: 'Void Seal', set: 'fx2', a: 'hades', sc: 1.1, speed: 420, col: ['#a46bff', '#ffffff', '#5a2d82'] }, quote: 'Everyone comes to my kingdom eventually.' },
  ];
  const BODY_H = 190;   // every fighter is scaled so the standing pose is about this tall (times size)
  ROSTER.forEach((c) => { c.hp = Math.round(c.hp * 1.6); const f = frameOf(c.anims.idle.set, c.anims.idle.a, 0); c.scale = BODY_H * c.size / f[3]; });

  /* ================= canvas ================= */
  const VW = 960, VH = 540, FLOOR = 488;
  const cv = $('#cv'); const ctx = cv.getContext('2d'); let RES = 1;
  function fit() {
    const wrap = $('#arena'), portrait = innerHeight > innerWidth && innerWidth < 760;
    let w = portrait ? innerWidth - 16 : Math.min(innerWidth - 24, (innerHeight - (document.body.classList.contains('touchy') ? 24 : 120)) * VW / VH);
    w = Math.max(300, Math.floor(w)); wrap.style.width = w + 'px';
    const r = clamp(Math.ceil(w * (devicePixelRatio || 1) / VW * 4) / 4, 1, 2.5);
    if (r !== RES || cv.width !== Math.round(VW * r)) { RES = r; cv.width = Math.round(VW * r); cv.height = Math.round(VH * r); }
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
    const down = (e) => { e.preventDefault(); SFX.ensure(); touchHeld.add(k); touchPressed.add(k); b.classList.add('on'); };
    const up = (e) => { e.preventDefault(); touchHeld.delete(k); b.classList.remove('on'); };
    b.addEventListener('pointerdown', down); b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('pointerleave', up);
  });
  function humanInput(slot) {
    const K = KEYS[slot], h = (n) => K[n].some((c) => held.has(c)) || (slot === 'p1' && touchHeld.has(n)), p = (n) => K[n].some((c) => pressed.has(c)) || (slot === 'p1' && touchPressed.has(n));
    return { left: h('left'), right: h('right'), up: p('up'), down: h('down'), light: p('light'), heavy: p('heavy'), lkick: p('lkick'), hkick: p('hkick'), special: p('special'), super: p('super'), breaker: p('breaker') };
  }

  /* ================= fighters ================= */
  const MOVES = {   // seconds: startup, active, recovery; reach in px; damage
    light: { start: 0.07, act: 0.09, rec: 0.13, reach: 112, dmg: 5, stun: 0.24, push: 140, meter: 6 },
    heavy: { start: 0.2, act: 0.11, rec: 0.3, reach: 140, dmg: 11, stun: 0.42, push: 330, meter: 10 },
    lkick: { start: 0.09, act: 0.1, rec: 0.16, reach: 132, dmg: 6, stun: 0.26, push: 170, meter: 7, low: true },
    hkick: { start: 0.22, act: 0.12, rec: 0.32, reach: 160, dmg: 12, stun: 0.45, push: 360, meter: 11, low: true },
    special: { start: 0.24, act: 0.12, rec: 0.36, reach: 0, dmg: 12, stun: 0.5, push: 360, meter: 0 },
  };
  const CHAIN = { light: ['light', 'lkick', 'heavy', 'hkick', 'special'], lkick: ['heavy', 'hkick', 'special'], heavy: ['hkick', 'special'], hkick: ['special'] };   // cancels after a landed hit
  function makeFighter(ch, side) {
    return { ch, side, x: side === 0 ? 300 : 660, y: FLOOR, vx: 0, vy: 0, face: side === 0 ? 1 : -1, hp: ch.hp, maxHp: ch.hp, meter: 0, wins: 0,
      state: 'idle', t: 0, move: null, hit: false, stun: 0, block: 0, onGround: true, anim: 0, cool: 0, flash: 0, superOn: false, combo: 0, comboT: 0, cpu: null };
  }
  let G = null;   // the match
  function newMatch(p1, p2, cpuLevel) {
    G = { mode: 'intro', p: [makeFighter(p1, 0), makeFighter(p2, 1)], round: 1, timer: 60, t: 0, msg: null, shots: [], fx: [], beams: [], waves: [], shake: 0, stop: 0, slow: 0, bg: pick(BGS), cpuLevel, banner: null, pause: false };
    if (cpuLevel) G.p[1].cpu = { level: cpuLevel, think: 0, plan: null };
    startRound();
    MUSIC.play('riot');
  }
  function startRound() {
    G.p.forEach((f, i) => Object.assign(f, { x: i === 0 ? 300 : 660, y: FLOOR, vx: 0, vy: 0, face: i === 0 ? 1 : -1, hp: f.maxHp, state: 'idle', t: 0, move: null, stun: 0, block: 0, onGround: true, cool: 0, combo: 0 }));
    G.shots = []; G.fx = []; G.beams = []; G.waves = []; G.timer = 60; G.mode = 'intro'; G.t = 0;
    G.banner = { text: G.round === 3 || (G.p[0].wins === 1 && G.p[1].wins === 1) ? 'FINAL ROUND' : 'ROUND ' + G.round, sub: 'FIGHT!', t: 0 };
    SFX.boss();
  }
  const opp = (f) => G.p[1 - f.side];
  function hurtbox(f) { const w = 62 * f.ch.size, h = BODY_H * f.ch.size * (f.crouch ? 0.52 : 0.92); return { x: f.x - w / 2, y: f.y - h, w, h }; }
  const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  function startMove(f, kind, isSuper) {
    const m = MOVES[kind]; f.state = 'attack'; f.move = kind; f.t = 0; f.hit = false; f.superOn = !!isSuper;
    if (kind === 'special') { f.cool = isSuper ? 0.6 : 1.5; if (isSuper) { f.meter = 0; G.stop = 0.35; G.flash = 0.35; G.banner = { text: f.ch.special.name.toUpperCase() + '!', sub: '', t: 0, small: true }; SFX.power(); } else SFX.zap(); }
    else SFX.slash();
    if (f.onGround) f.vx = 0;
    return m;
  }
  function damage(attacker, target, dmg, stun, push, hitX) {
    if (target.inv > 0) return;
    const low = attacker.move && MOVES[attacker.move] && MOVES[attacker.move].low;
    const blocking = target.onGround && target.state !== 'attack' && target.state !== 'hurt' && target.state !== 'ko' && target.holdBack && (!low || target.crouch || Math.random() < 0.5);
    if (blocking) {
      dmg = Math.max(1, Math.round(dmg * 0.15)); target.block = 0.2; target.state = 'block'; target.t = 0; target.vx = -target.face * push * 0.7; SFX.bump();
      spark(hitX, target.y - BODY_H * target.ch.size * 0.55, ['#8fd8ff', '#ffffff'], 10); target.meter = Math.min(100, target.meter + 4);
    } else {
      target.state = 'hurt'; target.t = 0; target.stun = stun; target.vx = -target.face * push; if (!target.onGround) target.vy = -320;
      SFX.hit(); spark(hitX, target.y - BODY_H * target.ch.size * 0.55, attacker.ch.special.col.concat(['#ffffff']), 18);
      attacker.combo = (attacker.comboT > 0 ? attacker.combo : 0) + 1; attacker.comboT = 0.9;
      if (attacker.combo >= 2) G.comboMsg = { side: attacker.side, n: attacker.combo, t: 1 };
      target.meter = Math.min(100, target.meter + dmg * 0.8); attacker.meter = Math.min(100, attacker.meter + dmg * 1.1);
      G.stop = Math.max(G.stop, dmg >= 10 ? 0.09 : 0.05); G.shake = Math.max(G.shake, dmg >= 10 ? 0.25 : 0.12);
    }
    target.hp = Math.max(0, target.hp - dmg); target.flash = 0.12;
    if (target.hp <= 0) knockout(attacker, target);
  }
  function knockout(winner, loser) {
    loser.state = 'ko'; loser.t = 0; loser.vx = -loser.face * 380; loser.vy = -520; loser.onGround = false;
    G.mode = 'ko'; G.t = 0; G.slow = 1.2; G.shake = 0.5; G.banner = { text: 'K.O.', sub: '', t: 0, big: true }; SFX.boss();
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
    // chain: a landed hit can be cancelled into the next attack in the chain
    if (f.state === 'attack' && f.hit && f.move !== 'special' && G.mode === 'play') {
      const want = inp.special && f.cool <= 0 ? 'special' : inp.hkick ? 'hkick' : inp.heavy ? 'heavy' : inp.lkick ? 'lkick' : inp.light ? 'light' : null;
      if (want && CHAIN[f.move] && CHAIN[f.move].includes(want) && f.t >= MOVES[f.move].start + MOVES[f.move].act * 0.5) startMove(f, want);
    }
    f.crouch = f.onGround && inp.down && (f.state === 'idle' || f.state === 'walk' || f.state === 'block');
    const canAct = f.state === 'idle' || f.state === 'walk' || (f.state === 'jump' && !f.airAttacked);
    if (f.state === 'ko') { /* fall */ }
    else if (f.state === 'hurt') { if (f.t >= f.stun && f.onGround) f.state = 'idle'; }
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
        if (inp.up) { f.vy = -860; f.onGround = false; f.state = 'jump'; f.airAttacked = false; f.vx = (inp.right ? 1 : inp.left ? -1 : 0) * f.ch.speed * 1.1; SFX.jump(); }
        else if (f.crouch) { f.vx = 0; f.state = 'idle'; }
        else { const d = (inp.right ? 1 : 0) - (inp.left ? 1 : 0); f.vx = d * f.ch.speed * (f.holdBack ? 0.7 : 1); f.state = d ? 'walk' : 'idle'; }
      }
    }
    // physics
    if (!f.onGround) { f.vy += 2300 * dt; f.y += f.vy * dt; if (f.y >= FLOOR) { f.y = FLOOR; f.vy = 0; f.onGround = true; if (f.state === 'jump') f.state = 'idle'; if (f.state === 'attack' && f.move !== 'special') { f.state = 'idle'; f.move = null; } if (f.state === 'ko') { G.shake = 0.3; spark(f.x, FLOOR, ['#c9b48c', '#8a6a4a'], 14); } } }
    else if (f.state === 'hurt' || f.state === 'block' || f.state === 'ko') f.vx *= Math.pow(0.0009, dt);
    f.x += f.vx * dt; f.x = clamp(f.x, 50, VW - 50);
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
      G.shots.forEach((o) => { if (o !== s && o.owner !== s.owner && !o.dead && Math.abs(o.x - s.x) < 40 && Math.abs(o.y - s.y) < 50) { s.dead = o.dead = true; spark((s.x + o.x) / 2, s.y, s.col.concat(o.col), 20); SFX.zap(); } });
      if (!s.dead && t.state !== 'ko' && overlap({ x: s.x - 22, y: s.y - 22, w: 44, h: 44 }, hurtbox(t))) { s.dead = true; damage(G.p[s.owner], t, s.dmg, 0.45, 300, s.x); }
      if (s.x < -60 || s.x > VW + 60) s.dead = true; });
    G.shots = G.shots.filter((s) => !s.dead && s.life > 0);
    G.beams.forEach((b) => { b.t += dt; const t = G.p[1 - b.owner], box = { x: b.face > 0 ? b.x : b.x - b.len, y: b.y - 26, w: b.len, h: 52 };
      if (!b.hit && b.t > 0.05 && t.state !== 'ko' && overlap(box, hurtbox(t))) { b.hit = true; damage(G.p[b.owner], t, b.dmg, 0.55, 380, t.x - b.face * 20); } });
    G.beams = G.beams.filter((b) => b.t < b.dur);
    G.waves.forEach((w) => { if (w.delay > 0) { w.delay -= dt; return; } w.x += w.vx * dt; w.life -= dt; const t = G.p[1 - w.owner];
      if (!w.hit && t.state !== 'ko' && t.onGround && overlap({ x: w.x - 26, y: FLOOR - 70, w: 52, h: 70 }, hurtbox(t))) { w.hit = true; damage(G.p[w.owner], t, w.dmg, 0.5, 320, w.x); } });
    G.waves = G.waves.filter((w) => w.life > 0 && !w.hit && w.x > -40 && w.x < VW + 40);
    G.fx.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 900 * dt; p.life -= dt; }); G.fx = G.fx.filter((p) => p.life > 0);
  }

  /* ================= the computer opponent ================= */
  function cpuInput(f, dt) {
    const o = opp(f), c = f.cpu, lvl = c.level, dx = o.x - f.x, dist = Math.abs(dx), fwd = Math.sign(dx) || f.face;
    const inp = { left: false, right: false, up: false, down: false, light: false, heavy: false, lkick: false, hkick: false, special: false, super: false, breaker: false };
    if (f.state === 'hurt' && f.meter >= 40 && f.combo !== -1 && opp(f).combo >= 2 && Math.random() < 0.05 * lvl) inp.breaker = true;
    if (f.state === 'attack' && f.hit && Math.random() < 0.25 * lvl) inp[pick(['heavy', 'hkick', 'lkick'])] = true;
    const go = (d) => { if (d > 0) inp.right = true; else if (d < 0) inp.left = true; };
    const react = [0, 0.35, 0.6, 0.82][lvl];
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
    if (G.mode === 'play') { G.timer -= dt; if (G.timer <= 0) { G.timer = 0; const [a, b] = G.p; const w = a.hp / a.maxHp >= b.hp / b.maxHp ? a : b; knockout(w, opp(w)); G.banner = { text: 'TIME', sub: '', t: 0, big: true }; } }
    const none = { left: false, right: false, up: false, down: false, light: false, heavy: false, lkick: false, hkick: false, special: false, super: false, breaker: false };
    G.p.forEach((f) => { const inp = G.mode === 'play' ? (f.cpu ? cpuInput(f, dt) : humanInput(f.side ? 'p2' : 'p1')) : none; fighterUpdate(f, inp, dt); });
    separate(); updateAttacks(dt);
    if (G.mode === 'ko' && G.t > 2.6) {
      const champ = G.p.find((f) => f.wins >= 2);
      if (champ) { G.mode = 'over'; G.winner = champ; MUSIC.pause(); SFX.win(); showResult(champ); }
      else { G.round += 1; startRound(); }
    }
    pressed.clear(); touchPressed.clear();
  }

  /* ================= drawing ================= */
  function drawBg() {
    const im = G.bg; ctx.fillStyle = '#120c08'; ctx.fillRect(0, 0, VW, VH);
    if (im.complete && im.naturalWidth) { const s = Math.max(VW / im.naturalWidth, VH / im.naturalHeight) * 1.04, w = im.naturalWidth * s, h = im.naturalHeight * s; const par = (G.p[0].x + G.p[1].x) / 2 - VW / 2;
      ctx.drawImage(im, (VW - w) / 2 - par * 0.04, (VH - h) / 2, w, h); }
    const g = ctx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, 'rgba(10,6,4,0.35)'); g.addColorStop(0.7, 'rgba(10,6,4,0.15)'); g.addColorStop(1, 'rgba(10,6,4,0.75)'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
    ctx.fillStyle = 'rgba(20,12,6,0.55)'; ctx.fillRect(0, FLOOR, VW, VH - FLOOR); ctx.fillStyle = '#a8842a'; ctx.fillRect(0, FLOOR, VW, 2);
  }
  function animFor(f) {
    const A = f.ch.anims; let k = 'idle', frame = f.anim * 5;
    if (f.state === 'walk') { k = 'walk'; frame = f.anim * 7; }
    else if (f.state === 'jump') { k = 'jump'; frame = f.vy < 0 ? 0 : 1; }
    else if (f.state === 'attack') { const m = MOVES[f.move], prog = clamp(f.t / (m.start + m.act + m.rec), 0, 0.999); k = f.move === 'lkick' ? 'light' : f.move === 'hkick' ? 'heavy' : f.move; if (f.move === 'heavy' && A.heavyHit && f.t >= m.start) k = 'heavyHit'; if (!f.onGround && f.move !== 'special') k = A.jump ? f.move : 'jump'; frame = prog; }
    else if (f.state === 'hurt' || f.state === 'block') { k = 'hurt'; frame = 0; }
    else if (f.state === 'ko') { k = A.ko ? 'ko' : 'hurt'; frame = Math.min(1, f.t * 1.8) * 0.999; }
    if (G.mode === 'over' && f === G.winner) { k = 'victory'; frame = f.anim * 2; }
    const h = A[k] || A.idle, all = ALL[h.set][h.a], list = h.f || all.map((_, i) => i);
    const idx = (f.state === 'attack' || f.state === 'ko') ? list[Math.min(list.length - 1, Math.floor(frame * list.length))] : list[Math.floor(frame) % list.length];
    return { h, idx };
  }
  function drawFighter(f) {
    const { h, idx } = animFor(f), sc = f.ch.scale * (h.set.startsWith('n') ? 1 : 1);
    // shadow on the floor
    ctx.fillStyle = 'rgba(0,0,0,0.38)'; ctx.beginPath(); ctx.ellipse(f.x, FLOOR + 3, 56 * f.ch.size * clamp(1 - (FLOOR - f.y) / 400, 0.4, 1), 9, 0, 0, 7); ctx.fill();
    ctx.save();
    if (f.ch.anims.portrait) { drawPortrait(f, h, sc); ctx.restore(); drawFx(f); return; }
    if (f.state === 'ko' && !f.ch.anims.ko) { const k = clamp(f.t / 0.5, 0, 1); ctx.translate(f.x, f.y); ctx.rotate(-f.face * k * 1.45); ctx.translate(-f.x, -f.y - k * 14); }
    if (f.superOn || f.meter >= 100) { ctx.shadowColor = f.ch.special.col[0]; ctx.shadowBlur = 18 + (calm ? 0 : Math.sin(G.t * 14) * 6); }
    if (f.flash > 0 && !calm) ctx.filter = 'brightness(1.8)';
    else if (f.state === 'block') ctx.filter = 'brightness(1.15) saturate(0.6)';
    spr(ctx, h.set, h.a, idx, f.x, f.y + 2, f.face, sc);
    ctx.restore();
    if (f.state === 'block') { ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeStyle = '#8fd8ff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(f.x + f.face * 30, f.y - BODY_H * f.ch.size * 0.55, 60, -1.1, 1.1); if (f.face < 0) { ctx.beginPath(); ctx.arc(f.x + f.face * 30, f.y - BODY_H * f.ch.size * 0.55, 60, Math.PI - 1.1, Math.PI + 1.1); } ctx.stroke(); ctx.restore(); }
    drawFx(f);
  }
  function drawFx(f) {
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
    else if (f.state === 'walk') { dy -= Math.abs(Math.sin(t * 9)) * 7; rot = Math.sin(t * 9) * 0.035; }
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
  function drawAttacks() {
    G.shots.forEach((s) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.shadowColor = s.col[0]; ctx.shadowBlur = 20; spr(ctx, s.set, s.a, 0, s.x, s.y, s.face, s.sc); ctx.restore(); });
    G.beams.forEach((b) => { const k = 1 - b.t / b.dur; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.shadowColor = b.col[0]; ctx.shadowBlur = 24;
      [[22, 'rgba(87,182,255,0.45)'], [10, '#bfe6ff'], [4, '#ffffff']].forEach(([w, c]) => { ctx.strokeStyle = c; ctx.lineWidth = w * k + 1; ctx.beginPath(); ctx.moveTo(b.x, b.y); for (let i = 1; i <= 16; i++) ctx.lineTo(b.x + b.face * b.len * i / 16, b.y + (i < 16 ? rand(-7, 7) : 0)); ctx.stroke(); });
      ctx.restore(); });
    G.waves.forEach((w) => { if (w.delay > 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.shadowColor = w.col[0]; ctx.shadowBlur = 18; spr(ctx, 'bfx', 'burst', 0, w.x, FLOOR - 30, Math.sign(w.vx), 0.9 + 0.12 * Math.sin(G.t * 30)); ctx.restore(); });
    G.fx.forEach((p) => { ctx.globalAlpha = clamp(p.life * 3, 0, 1); ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.r, p.r); }); ctx.globalAlpha = 1;
  }
  function bar(x, y, w, h, frac, col, right) { ctx.fillStyle = 'rgba(20,12,6,0.85)'; ctx.fillRect(x - 3, y - 3, w + 6, h + 6); ctx.fillStyle = '#3a1410'; ctx.fillRect(x, y, w, h); const fw = w * clamp(frac, 0, 1); ctx.fillStyle = col; ctx.fillRect(right ? x + w - fw : x, y, fw, h); ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 2; ctx.strokeRect(x - 1, y - 1, w + 2, h + 2); }
  function drawHud() {
    const [a, b] = G.p; ctx.textBaseline = 'middle';
    bar(30, 24, 380, 22, a.hp / a.maxHp, a.hp / a.maxHp > 0.3 ? '#e7c46a' : '#e0503a', false);
    bar(VW - 410, 24, 380, 22, b.hp / b.maxHp, b.hp / b.maxHp > 0.3 ? '#e7c46a' : '#e0503a', true);
    bar(30, 54, 180, 8, a.meter / 100, a.meter >= 100 ? (Math.floor(G.t * 4) % 2 && !calm ? '#ffffff' : '#57b6ff') : '#57b6ff', false);
    bar(VW - 210, 54, 180, 8, b.meter / 100, b.meter >= 100 ? (Math.floor(G.t * 4) % 2 && !calm ? '#ffffff' : '#57b6ff') : '#57b6ff', true);
    ctx.font = '700 17px "Cormorant Garamond", Georgia, serif'; ctx.fillStyle = '#f3ead2'; ctx.strokeStyle = '#120c08'; ctx.lineWidth = 4;
    const name = (t, x, al) => { ctx.textAlign = al; ctx.strokeText(t, x, 78); ctx.fillText(t, x, 78); };
    name(a.ch.name.toUpperCase() + (a.meter >= 100 ? '  ·  SUPER READY' : ''), 30, 'left'); name((b.meter >= 100 ? 'SUPER READY  ·  ' : '') + b.ch.name.toUpperCase() + (b.cpu ? ' (CPU)' : ''), VW - 30, 'right');
    // round wins as gold laurels
    for (let i = 0; i < 2; i++) { ctx.fillStyle = a.wins > i ? '#e7c46a' : 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.arc(402 - i * 18, 58, 6, 0, 7); ctx.fill();
      ctx.fillStyle = b.wins > i ? '#e7c46a' : 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.arc(VW - 402 + i * 18, 58, 6, 0, 7); ctx.fill(); }
    // timer
    ctx.textAlign = 'center'; ctx.font = '700 40px "Cormorant Garamond", Georgia, serif'; ctx.lineWidth = 6; ctx.strokeText(String(Math.ceil(G.timer)), VW / 2, 38); ctx.fillStyle = G.timer < 10 ? '#ff7a59' : '#f3ead2'; ctx.fillText(String(Math.ceil(G.timer)), VW / 2, 38);
    if (G.comboMsg && G.comboMsg.t > 0) { ctx.save(); ctx.globalAlpha = clamp(G.comboMsg.t * 2, 0, 1); ctx.font = '800 30px Georgia, serif'; ctx.textAlign = G.comboMsg.side ? 'right' : 'left'; const x = G.comboMsg.side ? VW - 30 : 30;
      ctx.lineWidth = 6; ctx.strokeText(G.comboMsg.n + ' HIT COMBO!', x, 130); ctx.fillStyle = '#ffd27a'; ctx.fillText(G.comboMsg.n + ' HIT COMBO!', x, 130); ctx.restore(); }
    if (G.banner) { const bn = G.banner, t = bn.t; ctx.save(); ctx.textAlign = 'center';
      const sc = Math.min(1, t * 5) * (bn.big ? 1.25 : bn.small ? 0.6 : 1); const showSub = bn.sub && t > 0.9;
      ctx.translate(VW / 2, 230); ctx.scale(sc, sc); ctx.font = '700 86px "Cormorant Garamond", Georgia, serif'; ctx.lineWidth = 10; ctx.strokeStyle = '#120c08';
      const txt = showSub ? bn.sub : bn.text; ctx.strokeText(txt, 0, 0); const gr = ctx.createLinearGradient(0, -40, 0, 40); gr.addColorStop(0, '#fff6d8'); gr.addColorStop(1, '#e7a227'); ctx.fillStyle = gr; ctx.fillText(txt, 0, 0); ctx.restore(); }
  }
  function render() {
    ctx.setTransform(RES, 0, 0, RES, 0, 0);
    if (!G) { ctx.fillStyle = '#120c08'; ctx.fillRect(0, 0, VW, VH); return; }
    ctx.save(); if (G.shake > 0 && !calm) ctx.translate(rand(-8, 8) * G.shake * 2, rand(-8, 8) * G.shake * 2);
    drawBg(); const order = G.p.slice().sort((x, y) => (x.state === 'attack') - (y.state === 'attack')); order.forEach(drawFighter); drawAttacks();
    if (G.flash > 0 && !calm) { ctx.fillStyle = `rgba(255,255,255,${G.flash * 0.6})`; ctx.fillRect(0, 0, VW, VH); }
    else if (G.flash > 0) { ctx.fillStyle = 'rgba(10,6,20,0.35)'; ctx.fillRect(0, 0, VW, VH); }
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
      const cap = document.createElement('span'); cap.className = 'nm'; cap.textContent = c.name; const t = document.createElement('small'); t.textContent = c.special.name; cap.append(t);
      b.append(portrait(c), cap); b.addEventListener('click', () => choose(i)); grid.append(b);
    });
    syncSelect();
  }
  function syncSelect() {
    document.querySelectorAll('#roster .card').forEach((b) => { const i = +b.dataset.i; b.classList.toggle('p1', chosen[0] === i); b.classList.toggle('p2', chosen[1] === i); });
    const step = chosen[0] === null ? 'Player 1: choose your fighter' : mode === 'cpu' ? (chosen[1] === null ? 'Choose your opponent, or press Fight for a random one' : 'Ready!') : chosen[1] === null ? 'Player 2: choose your fighter' : 'Ready!';
    $('#sel-step').textContent = step; $('#fight').disabled = chosen[0] === null || (mode === '2p' && chosen[1] === null);
    document.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
    document.querySelectorAll('[data-level]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.level === level)));
    $('#levels').hidden = mode !== 'cpu';
  }
  function choose(i) { SFX.ensure(); SFX.coin(); if (chosen[0] === null) chosen[0] = i; else if (chosen[1] === null) chosen[1] = i; else { chosen = [i, null]; } syncSelect(); }
  document.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => { mode = b.dataset.mode; store.set('af-mode', mode); chosen[1] = null; syncSelect(); }));
  document.querySelectorAll('[data-level]').forEach((b) => b.addEventListener('click', () => { level = +b.dataset.level; store.set('af-level', level); syncSelect(); }));
  $('#sel-reset').addEventListener('click', () => { chosen = [null, null]; syncSelect(); });
  $('#fight').addEventListener('click', () => {
    SFX.ensure(); let p2 = chosen[1]; if (p2 === null) { do { p2 = Math.floor(Math.random() * ROSTER.length); } while (p2 === chosen[0]); }
    $('#s-select').hidden = true; $('#s-fight').hidden = false; $('#result').hidden = true; fit();
    newMatch(ROSTER[chosen[0]], ROSTER[p2], mode === 'cpu' ? level : 0); window.scrollTo({ top: 0 });
  });
  function showResult(champ) {
    const r = $('#result'); r.hidden = false;
    $('#res-k').textContent = champ.cpu ? 'Defeat' : (G.p[1].cpu ? 'Victory' : `Player ${champ.side + 1} wins`);
    $('#res-name').textContent = champ.ch.name; $('#res-quote').textContent = '“' + champ.ch.quote + '”';
    if (!champ.cpu && G.p[1].cpu) { const s = (store.get('af-streak') || 0) + 1; store.set('af-streak', s); $('#res-streak').textContent = `Win streak: ${s}`; } else if (G.p[1].cpu) { store.set('af-streak', 0); $('#res-streak').textContent = 'Win streak reset. Breathe, and go again.'; } else $('#res-streak').textContent = '';
    setTimeout(() => $('#res-again').focus({ preventScroll: true }), 50);
  }
  $('#res-again').addEventListener('click', () => { $('#result').hidden = true; const [a, b] = G.p; newMatch(a.ch, b.ch, G.cpuLevel); });
  $('#res-next').addEventListener('click', () => { $('#result').hidden = true; const a = G.p[0]; let n; do { n = pick(ROSTER); } while (n === a.ch); newMatch(a.ch, n, G.cpuLevel || level); });
  $('#res-select').addEventListener('click', backToSelect);
  function backToSelect() { MUSIC.stop(); G = null; $('#s-fight').hidden = true; $('#s-select').hidden = false; $('#result').hidden = true; $('#menu').hidden = true; chosen[1] = null; syncSelect(); }
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
  syncBtns(); buildSelect(); fit(); requestAnimationFrame(frame);
})();
