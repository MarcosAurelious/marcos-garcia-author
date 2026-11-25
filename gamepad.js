/* Marcos Aurelious Arcade — shared controller support.
   Lets USB SNES-style pads (and Xbox / PlayStation / other standard pads) play every arcade game.
   - In gameplay the pad "presses" the game's own keyboard keys, so each game's controls stay as they are.
   - On menu / dialog screens the D-pad moves a gold highlight between buttons and A (or Start) presses them.
   Load with: <script src="../gamepad.js?v=1" data-game="quest" defer></script>
   Runs entirely in the browser; nothing is sent anywhere. */
(() => {
  'use strict';
  const script = document.currentScript;
  const GAME = (script && script.dataset.game) || '';

  /* ---------- per-game setup ----------
     keys:  pad button -> keyboard code(s) for player 1 (keys2 = player 2 on a second pad)
     dpad:  'arrows' or 'wasd' (dpad2 for player 2)
     menus: screens that are navigated like menus, highest priority first (first visible one wins)
     back:  button to click when B is pressed on that menu (optional) */
  const ARROWS = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
  const WASD = { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD' };
  const CONFIGS = {
    // Ultra Girl: Cyberspace Run — matches the on-screen pad: A jump, B blast, R dash/slide; Y blast, X/L shield, Start = start / pause
    ultragirl: {
      dpad: ARROWS,
      keys: { A: ['Space', 'Enter'], B: 'KeyJ', Y: 'KeyJ', R: 'ShiftLeft', X: 'KeyL', L: 'KeyL', START: ['KeyP', 'Enter'], SELECT: 'KeyP' },
      menus: ['#spriteModal', '#codeModal', '#briefModal'],
      back: { '#spriteModal': '#spriteClose' },
    },
    // Legio Stellaris — B fire, Y charge shot, A/X/L/R/Select = specials 1–5, Start = start / pause
    stars: {
      dpad: ARROWS,
      keys: { B: 'Space', Y: 'KeyC', A: 'Digit1', X: 'Digit2', L: 'Digit3', R: 'Digit4', SELECT: 'Digit5', START: 'KeyP' },
      menus: [],
    },
    // Roman Arena — Y light punch, X heavy punch, B light kick, A heavy kick, L super, R combo breaker
    fight: {
      dpad: WASD, dpad2: ARROWS,
      keys: { Y: 'KeyJ', X: 'KeyK', B: 'KeyU', A: 'KeyI', L: 'KeyQ', R: 'Space', START: 'KeyP', SELECT: 'KeyP' },
      keys2: { Y: 'Comma', X: 'Period', B: 'KeyM', A: 'KeyN', L: 'Semicolon', R: 'Quote', START: 'KeyP', SELECT: 'KeyP' },
      menus: ['#art-help-panel', '#menu', '#result', '#s-select'],
      back: { '#art-help-panel': '#art-help', '#menu': '#m-resume' },
      start: { '#s-select': '.hot-fight, #fight', '#menu': '#m-resume' },
    },
    // The Aurelious Quest — B/A jump, Y/L attack, X/R throw spear, Start = pause
    quest: {
      dpad: ARROWS,
      keys: { B: 'Space', A: 'Space', Y: 'KeyJ', L: 'KeyJ', X: 'KeyK', R: 'KeyK', START: 'KeyP', SELECT: 'KeyP' },
      menus: ['#settings', '#overlay', '#s-splash', '#s-title', '#s-final'],
      back: { '#settings': '#set-close' },
      start: { '#settings': '#set-close', '#overlay': '#ov-go' },
    },
    // Critical Thinking for a Stoic Mind — all menus: D-pad moves, A chooses
    game: {
      dpad: ARROWS, keys: {},
      menus: ['#s-final', '#s-game', '#s-title'],
    },
    // Cursebound — Y/X/R punches (light/med/heavy), B/A/Select kicks (light/med/heavy), L guard
    cursebound: {
      dpad: WASD, dpad2: ARROWS,
      keys: { Y: 'KeyJ', X: 'KeyK', R: 'KeyL', B: 'KeyU', A: 'KeyI', SELECT: 'KeyO', L: 'ShiftLeft', START: 'KeyP' },
      keys2: { Y: 'Digit1', X: 'Digit2', R: 'Digit3', B: 'Digit4', A: 'Digit5', SELECT: 'Digit6', L: 'Numpad0', START: 'KeyP' },
      menus: ['#pauseMenu', '#result', '#menu'],
      back: { '#pauseMenu': '#pauseBtn' },
      start: { '#pauseMenu': '#pauseBtn', '#menu': '.art-menu-btn, #arcadeBtn' },
    },
    // Zib & the Fuzzy Friends — all menus: D-pad moves, A chooses (hold A on hold-buttons)
    zib: {
      dpad: ARROWS, keys: {},
      menus: ['#settings', '#modal', '#title', 'body'],
      back: { '#settings': '#setClose' },
    },
  };
  const CFG = CONFIGS[GAME];
  if (!CFG) return;

  /* ---------- reading the pad ---------- */
  let blocked = false;
  const getPads = () => {
    if (blocked || !navigator.getGamepads) return [];
    try { return [...(navigator.getGamepads() || [])].filter((g) => g && g.connected); } catch (e) { blocked = true; return []; }
  };
  // Converts any pad into SNES names. Generic USB SNES pads: 0=X 1=A 2=B 3=Y 4=L 5=R 8=Select 9=Start.
  // "Standard" pads (Xbox/PS/some SNES clones): 0=B 1=A 2=Y 3=X (by position).
  function read(gp) {
    const b = (n) => !!(gp.buttons[n] && gp.buttons[n].pressed);
    const std = gp.mapping === 'standard';
    const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
    let left = ax < -0.5, right = ax > 0.5, up = ay < -0.5, down = ay > 0.5;
    // Some drivers report the D-pad as a "hat" on axis 9, or as axes 6/7
    if (gp.axes.length > 9) {
      const h = gp.axes[9];
      if (h >= -1.05 && h <= 1.05) {
        const k = Math.round((h + 1) / (2 / 7));
        if (k >= 0 && k <= 7) { up ||= k === 0 || k === 1 || k === 7; right ||= k >= 1 && k <= 3; down ||= k >= 3 && k <= 5; left ||= k >= 5 && k <= 7; }
      }
    }
    if (!std && gp.axes.length > 7) {
      const h6 = gp.axes[6] || 0, h7 = gp.axes[7] || 0;
      left ||= h6 < -0.5; right ||= h6 > 0.5; up ||= h7 < -0.5; down ||= h7 > 0.5;
    }
    up ||= b(12); down ||= b(13); left ||= b(14); right ||= b(15);
    return {
      up, down, left, right,
      A: b(1), B: std ? b(0) : b(2), X: std ? b(3) : b(0), Y: std ? b(2) : b(3),
      L: b(4) || (!std && b(6)), R: b(5) || (!std && b(7)),
      SELECT: b(8), START: b(9),
    };
  }

  /* ---------- fake keyboard ---------- */
  const keyName = (code) => {
    if (/^Key[A-Z]$/.test(code)) return code.slice(3).toLowerCase();
    if (/^(Digit|Numpad)\d$/.test(code)) return code.slice(-1);
    return { Space: ' ', ShiftLeft: 'Shift', ShiftRight: 'Shift', Comma: ',', Period: '.', Semicolon: ';', Quote: "'" }[code] || code;
  };
  const keyTarget = () => {
    const a = document.activeElement;
    return a && a !== document.body && a.isConnected ? a : document.body;
  };
  function fire(type, code, target) {
    const ev = new KeyboardEvent(type, { code, key: keyName(code), bubbles: true, cancelable: true, shiftKey: code.startsWith('Shift') && type === 'keydown' });
    (target || keyTarget()).dispatchEvent(ev);
    return ev;
  }
  const down = [new Map(), new Map()]; // per player: code -> how many pad buttons hold it
  function hold(p, code) { const m = down[p]; const n = m.get(code) || 0; m.set(code, n + 1); if (!n) fire('keydown', code); }
  function release(p, code) { const m = down[p]; const n = m.get(code) || 0; if (n <= 1) { m.delete(code); if (n) fire('keyup', code); } else m.set(code, n - 1); }
  function releaseAll() { for (let p = 0; p < 2; p++) { for (const code of [...down[p].keys()]) fire('keyup', code); down[p].clear(); } }
  const codesFor = (map, btn) => { const v = map && map[btn]; return v ? (Array.isArray(v) ? v : [v]) : []; };

  /* ---------- menu navigation ---------- */
  const FOCUSABLE = 'button, a[href], [role="button"], [tabindex]:not([tabindex="-1"]), input:not([type="hidden"]), select, textarea';
  function visible(el) {
    if (!el || !el.isConnected || el.closest('[hidden]')) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.right < 0 || r.top > innerHeight || r.left > innerWidth) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none' && cs.pointerEvents !== 'none' && +cs.opacity > 0.05;
  }
  function activeMenu() {
    for (const sel of CFG.menus) {
      for (const el of document.querySelectorAll(sel)) {
        if (el.hidden || el.closest('[hidden]')) continue;
        const cs = getComputedStyle(el);  // (size isn't checked: some screens hold only fixed-position buttons)
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        if (items(el).length) return { el, sel };
      }
    }
    return null;
  }
  // A dialog inside a menu screen takes over (e.g. a pop-up on top of the screen)
  const items = (root) => [...root.querySelectorAll(FOCUSABLE)].filter((e) => !e.disabled && visible(e) && !e.closest('[aria-hidden="true"]'));
  const PREFERRED = '[autofocus], .primary, .gold, .btn-gold, .splash-play, .cta, #start, #fight';
  const center = (el) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };

  let ringEl = null, ringSaved = null;
  function ring(el) {
    if (ringEl === el) return;
    if (ringEl && ringSaved) Object.assign(ringEl.style, ringSaved);
    ringEl = el; ringSaved = null;
    if (!el) return;
    ringSaved = { outline: el.style.outline, outlineOffset: el.style.outlineOffset, boxShadow: el.style.boxShadow };
    Object.assign(el.style, { outline: '3px solid #ffd54a', outlineOffset: '3px', boxShadow: '0 0 18px 4px rgba(255,213,74,.65)' });
  }
  function focusEl(el) {
    if (!el) return;
    try { el.focus({ preventScroll: true }); } catch (e) {}
    try { el.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) {}
    ring(el);
  }
  function current(list) { const a = document.activeElement; return list.includes(a) ? a : list.includes(ringEl) ? ringEl : null; }
  function move(list, dir) {
    const cur = current(list);
    if (!cur) { focusEl(list.find((e) => e.matches(PREFERRED)) || list[0]); return; }
    const a = center(cur);
    let best = null, bestScore = Infinity;
    for (const el of list) {
      if (el === cur) continue;
      const c = center(el), dx = c.x - a.x, dy = c.y - a.y;
      const main = dir === 'right' ? dx : dir === 'left' ? -dx : dir === 'down' ? dy : -dy;
      const side = dir === 'left' || dir === 'right' ? Math.abs(dy) : Math.abs(dx);
      if (main < 4) continue;
      const score = main + side * 2.2;
      if (score < bestScore) { bestScore = score; best = el; }
    }
    if (!best) { // wrap around to the far side
      const sorted = list.slice().sort((p, q) => {
        const cp = center(p), cq = center(q);
        return dir === 'right' || dir === 'down' ? (dir === 'right' ? cp.x - cq.x : cp.y - cq.y) : (dir === 'left' ? cq.x - cp.x : cq.y - cp.y);
      });
      best = sorted[0] !== cur ? sorted[0] : null;
    }
    if (best) focusEl(best);
  }
  let pressedEl = null;
  function press(list) {
    const el = current(list) || list.find((e) => e.matches(PREFERRED)) || list[0];
    if (!el) return;
    focusEl(el);
    const ev = fire('keydown', 'Enter', el);  // lets hold-buttons and map regions react like a keyboard
    pressedEl = el;
    if (!ev.defaultPrevented && !/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) el.click();
  }
  function unpress() { if (pressedEl) { fire('keyup', 'Enter', pressedEl.isConnected ? pressedEl : document.body); pressedEl = null; } }
  function clickSel(sel) {
    const el = sel && [...document.querySelectorAll(sel)].find((e) => !e.disabled && visible(e));
    if (el) { focusEl(el); el.click(); return true; }
    return false;
  }

  /* ---------- connect message ---------- */
  let toastEl = null, toastTimer = 0;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.setAttribute('role', 'status');
      Object.assign(toastEl.style, { position: 'fixed', left: '50%', bottom: '18px', transform: 'translateX(-50%)', zIndex: '2147483647', background: 'rgba(12,10,20,.92)', color: '#ffd54a', border: '2px solid #ffd54a', borderRadius: '10px', padding: '8px 16px', font: '600 14px system-ui, sans-serif', pointerEvents: 'none', transition: 'opacity .4s', opacity: '0' });
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg; toastEl.style.opacity = '1';
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { toastEl.style.opacity = '0'; }, 2600);
  }
  addEventListener('gamepadconnected', (e) => toast('🎮 Controller ready — D-pad + A for menus'));
  addEventListener('gamepaddisconnected', () => { releaseAll(); toast('🎮 Controller disconnected'); });
  addEventListener('blur', releaseAll);

  /* ---------- main loop ---------- */
  const BTNS = ['A', 'B', 'X', 'Y', 'L', 'R', 'SELECT', 'START'];
  const DIRS = ['up', 'down', 'left', 'right'];
  const prev = [{}, {}];
  const repeatAt = {};
  let wasMenu = false;
  function tick(now) {
    requestAnimationFrame(tick);
    const pads = getPads();
    if (!pads.length) { if (wasMenu) { ring(null); wasMenu = false; } return; }
    const menu = activeMenu();
    if (menu && !wasMenu) releaseAll();
    if (!menu && wasMenu) { ring(null); unpress(); }
    wasMenu = !!menu;
    const list = menu ? items(menu.el) : null;
    if (list && !current(list)) { const a = document.activeElement; if (!(a && /^(INPUT|TEXTAREA)$/.test(a.tagName))) focusEl(list.find((e) => e.matches(PREFERRED)) || list[0]); }
    else if (list) ring(current(list));

    pads.slice(0, 2).forEach((gp, i) => {
      const st = read(gp), pv = prev[i];
      const p = i === 1 && CFG.keys2 ? 1 : 0;
      const keys = p ? CFG.keys2 : CFG.keys, dpad = p ? (CFG.dpad2 || CFG.dpad) : CFG.dpad;
      if (menu) {
        for (const d of DIRS) {
          const id = i + d;
          if (st[d] && !pv[d]) { move(list, d); repeatAt[id] = now + 380; }
          else if (st[d] && now >= (repeatAt[id] || Infinity)) { move(items(menu.el), d); repeatAt[id] = now + 140; }
        }
        if ((st.A && !pv.A)) press(list);
        if (st.START && !pv.START) { const s = CFG.start && CFG.start[menu.sel]; if (!(s && clickSel(s))) press(list); }
        if (st.B && !pv.B) { const s = CFG.back && CFG.back[menu.sel]; if (s) clickSel(s); else press(list); }
        if ((!st.A && pv.A) || (!st.START && pv.START) || (!st.B && pv.B)) unpress();
      } else {
        for (const d of DIRS) {
          if (st[d] && !pv[d]) hold(p, dpad[d]);
          else if (!st[d] && pv[d]) release(p, dpad[d]);
        }
        for (const btn of BTNS) {
          const codes = codesFor(keys, btn);
          if (st[btn] && !pv[btn]) codes.forEach((c) => hold(p, c));
          else if (!st[btn] && pv[btn]) codes.forEach((c) => release(p, c));
        }
      }
      prev[i] = st;
    });
  }
  requestAnimationFrame(tick);
})();
