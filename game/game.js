/* Critical Thinking for a Stoic Mind — a 21st-century strategy game by Marcos Garcia.
   Everything runs in the browser. No network calls, no tracking; the best result is kept in this browser only. */
(() => {
  'use strict';

  /* ---------------- helpers ---------------- */
  const $ = (s) => document.querySelector(s);
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const SVGNS = 'http://www.w3.org/2000/svg';
  const sv = (tag, attrs, text) => { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (text != null) e.textContent = text; return e; };
  const rnd = (n) => Math.floor(Math.random() * n);
  const pick = (a) => a[rnd(a.length)];
  const d6 = () => 1 + rnd(6);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const btn = (label, cls, onClick, disabled) => { const b = el('button', 'btn ' + (cls || ''), label); b.type = 'button'; b.disabled = !!disabled; b.addEventListener('click', onClick); return b; };
  const store = { get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } } };

  /* ---------------- the map ---------------- */
  // 4 columns x 3 rows. Column 0 is yours, column 3 is Kessar's, the middle starts neutral.
  const REG = [
    'Port Vela', 'Nova Roma', 'Ironridge',
    'Sable Coast', 'Midmarch', 'Glass Hills',
    'Varn Delta', 'Cinder Pass', 'Steppe Gate',
    'Black Harbor', 'Kessar City', 'Frost Reach',
  ];
  const YOU_CAP = 1, RIVAL_CAP = 10, MAX_STR = 12, TURNS = 12, WIN_REGIONS = 9;
  const col = (i) => Math.floor(i / 3), row = (i) => i % 3;
  const adj = (i) => { const c = col(i), r = row(i), o = []; if (c > 0) o.push(i - 3); if (c < 3) o.push(i + 3); if (r > 0) o.push(i - 1); if (r < 2) o.push(i + 1); return o; };
  const isAdj = (a, b) => adj(a).includes(b);
  const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'];
  const OWNER_NAME = { you: 'Aurel', rival: 'Kessar', neutral: 'Neutral' };

  /* ---------------- Marcus's lines ---------------- */
  const ADVICE = {
    intel: ['Before you act on a report, ask: who says so, and how would they know?', 'Independent sources that agree are hard to fake. One loud voice is easy to fake.',
      'Do not say more to yourself than what the first impression reports.', 'Fear is the enemy\'s favorite weapon. Check the claim before you obey the feeling.'],
    orders: ['Spend your strength on what is up to you.', 'Strike where the evidence says the enemy is weak, not where anger points.', 'A secure capital is worth more than a glorious advance.',
      'Invading the neutral costs you friends. Persuasion lasts longer than force.'],
    rival: ['You did not choose their move. You choose your next one.', 'What stands in the way becomes the way.', 'Receive news without panic. Then decide.'],
    dilemma: ['Here the battle is inside you.', 'Ask what a just person would do, and do that.', 'Your character is the one territory no enemy can take.'],
  };

  /* ---------------- intelligence reports ---------------- */
  // Each report has a quality. Strong reports are usually true, weak ones usually false. Mixed ones are a coin flip: verify them.
  const TRUTH = { strong: 0.9, mixed: 0.5, weak: 0.12 };
  const LESSON = {
    strong: 'Independent sources that agree are hard to fake. That is strong evidence.',
    mixed: 'One credible but unconfirmed source. When it is a coin flip, verifying is the wise spend.',
    weak: 'No real source, emotional language, or the enemy\'s own propaganda. Weak evidence built to make you react.',
  };
  const INTEL = {
    threat: { label: 'Threat', act: 'Reinforce {R}', text: {
      strong: ['Satellite images from two independent commercial providers, plus allied radar, show armor and drone launchers massing opposite {R}.',
        'An allied intelligence service and your own signals team, working separately, both report assault orders against {R} this season.'],
      mixed: ['A field officer near {R} reports more drone traffic overhead. No other confirmation yet.', 'An informant who has been right before says {R} may be hit, but admits it is secondhand.'],
      weak: ['A viral post with no source says "everyone in the capital knows" Kessar will hit {R} next. The account is two days old.',
        'Kessar state TV boasts that {R} will fall "within days" and that resistance is pointless.'] } },
    cyber: { label: 'Cyber', act: 'Harden the grid', text: {
      strong: ['Your cyber command and a private security firm independently found the same malware hidden inside your power grid.'],
      mixed: ['An analyst flags unusual traffic on government servers. It could be an attack or a botched software update.'],
      weak: ['An anonymous hacker forum claims your whole grid will go dark tomorrow and "the government is hiding it."'] } },
    strike: { label: 'Opportunity', act: 'Strike the gap', text: {
      strong: ['Drone footage, confirmed by two scout teams, shows Kessar pulling units out of {R} to reinforce elsewhere.'],
      mixed: ['Intercepted radio chatter suggests {R} is short on fuel. The intercept is fragmentary.'],
      weak: ['A Kessar deserter, paid per tip, swears {R} is "basically empty" and you must strike now before it is too late.'] } },
    envoy: { label: 'Diplomacy', act: 'Welcome them', text: {
      strong: ['{R}\'s elected council sent a signed request, confirmed by your embassy, to join your coalition.'],
      mixed: ['A {R} official hints privately that joining you is "on the table." Nothing is in writing.'],
      weak: ['A trending hashtag says {R} "already voted" to join you. No official record exists.'] } },
    home: { label: 'Home front', act: 'Issue a public alert', text: {
      strong: ['Two independent labs and your health ministry confirm contaminated water in {R}. Residents need guidance now.'],
      mixed: ['A local reporter in {R} says hospitals are seeing more stomach illness. Officials have not commented.'],
      weak: ['A viral video claims Kessar poisoned the water in {R}. The footage shows a river in another country, posted by an account with no history.'] } },
  };

  /* ---------------- Stoic dilemmas ---------------- */
  const DILEMMAS = [
    { text: 'A Kessar general mocks you on global television, calling you a coward who hides behind your allies.', art: 'trial-impression',
      choices: [{ t: 'Fire back with insults on social media.', fx: { morale: 3, alliance: -6 }, wise: false, r: 'The crowd cheered for a day. Your allies winced, and Kessar got the reaction it wanted.' },
        { t: 'Ignore it and keep working the plan.', fx: { alliance: 4 }, wise: true, r: 'Nothing changed on the map, and your allies saw a steady hand.' }],
      q: 'His words are not up to you. Your response is.', cite: 'after Meditations 8.47' },
    { text: 'A storm grounds every drone you own for the season. Your plans are ruined.', art: 'trial-control',
      choices: [{ t: 'Blame the weather officers and demand answers.', fx: { morale: -4 }, wise: false, r: 'The storm did not care. Your staff now hides bad news from you.' },
        { t: 'Accept it and send the drone crews to repair the power grid.', fx: { next: 1 }, wise: true, r: 'The grid is stronger. +1 command next season.' }],
      q: 'The obstacle to action advances action. What stands in the way becomes the way.', cite: 'after Meditations 5.20' },
    { text: 'An ally offers extra aid if you exaggerate Kessar\'s losses in your next press release.', art: 'trial-fallacy',
      choices: [{ t: 'Publish the inflated numbers.', fx: { next: 2, lie: true }, wise: false, r: '+2 command next season. But lies have a way of surfacing.' },
        { t: 'Publish only the verified numbers.', fx: { alliance: 5 }, wise: true, r: 'Less aid today, more trust tomorrow. +5 alliance.' }],
      q: 'If it is not right, do not do it. If it is not true, do not say it.', cite: 'Meditations 12.17' },
    { text: 'Your staff wants to cut power to a border city to slow Kessar\'s advance. Civilians would lose heat in winter.', art: 'trial-control',
      choices: [{ t: 'Cut the power.', fx: { rivalHit: 2, alliance: -12, morale: -6 }, wise: false, r: 'Kessar slowed a little. The world saw families freezing, and your allies pulled back.' },
        { t: 'Find another way, even if it costs you.', fx: { next: -1, alliance: 4 }, wise: true, r: '−1 command next season. Your allies trust your judgment more.' }],
      q: 'What is not good for the hive is not good for the bee.', cite: 'Meditations 6.54' },
    { text: 'After a setback, your command staff is panicking and blaming each other in front of the press.', art: 'trial-impression',
      choices: [{ t: 'Fire the general everyone is blaming.', fx: { morale: -5 }, wise: false, r: 'A scapegoat calmed nobody. Morale fell.' },
        { t: 'Hold a calm briefing on what is still in your control.', fx: { morale: 6 }, wise: true, r: 'Focus returned. +6 morale.' }],
      q: 'Some things are up to us and some are not.', cite: 'Epictetus, Enchiridion 1' },
    { text: 'Your intelligence chief wants to secretly spy on your own journalists to find a leak.', art: 'trial-fallacy',
      choices: [{ t: 'Approve the surveillance.', fx: { next: 1, morale: -8 }, wise: false, r: 'You found the leak. Then the surveillance leaked too. −8 morale.' },
        { t: 'Refuse, and tighten your own security instead.', fx: { alliance: 3 }, wise: true, r: 'A free press, a cleaner conscience, and allies who notice. +3 alliance.' }],
      q: 'Waste no more time arguing about what a good person should be. Be one.', cite: 'after Meditations 10.16' },
    { text: 'A Kessar envoy offers a secret ceasefire, but only if you quietly abandon an ally\'s border region.', art: 'trial-evidence',
      choices: [{ t: 'Take the deal.', fx: { morale: 4, alliance: -15 }, wise: false, r: 'A quiet season, and an ally who will never trust you again. −15 alliance.' },
        { t: 'Decline, and tell your ally about the offer.', fx: { alliance: 8 }, wise: true, r: 'Your word held. +8 alliance.' }],
      q: 'Never value anything as profitable that makes you break your word or lose your self-respect.', cite: 'after Meditations 3.7' },
    { text: 'A tech firm says its AI predicts every Kessar move. It will not show its methods or its track record.', art: 'trial-evidence',
      choices: [{ t: 'Buy it and follow it blindly.', fx: { next: -1, morale: -2 }, wise: false, r: 'It confidently predicted the wrong things. −1 command next season.' },
        { t: 'Test it against last year\'s data before trusting it.', fx: { next: 1 }, wise: true, r: 'It was right sometimes, so you use it as one source among many. +1 command next season.' }],
      q: 'If anyone can show me that I am wrong, I will gladly change.', cite: 'after Meditations 6.21' },
    { text: 'After a good month, your advisors want a giant victory parade and a speech declaring the war nearly won.', art: 'trial-control',
      choices: [{ t: 'Throw the parade. The people deserve it.', fx: { morale: 6, rivalAll: 1 }, wise: false, r: 'The party was great. Kessar used the distraction to dig in everywhere.' },
        { t: 'Thank the troops quietly and stay focused.', fx: { morale: 2, alliance: 2 }, wise: true, r: 'Steady work, steady trust.' }],
      q: 'Receive without arrogance. Let go without struggle.', cite: 'after Meditations 8.33' },
    { text: 'Your sanctions on Kessar are hurting your own families too. Protesters fill the capital.', art: 'trial-impression',
      choices: [{ t: 'Crack down on the protests.', fx: { morale: -10 }, wise: false, r: 'The streets went quiet, and so did your support. −10 morale.' },
        { t: 'Explain the costs honestly and fund relief for families.', fx: { next: -1, morale: 5 }, wise: true, r: '−1 command next season, +5 morale.' }],
      q: 'Look within. Within is the fountain of good.', cite: 'after Meditations 7.59' },
    { text: 'A captured Kessar drone pilot could give you useful intel. Some officers want to threaten his family.', art: 'trial-fallacy',
      choices: [{ t: 'Allow the threats.', fx: { next: 1, alliance: -12 }, wise: false, r: 'He talked, and then the world heard how. −12 alliance.' },
        { t: 'Treat him by the law and offer asylum instead.', fx: { alliance: 5, morale: 2 }, wise: true, r: 'He defected willingly, and his story became your best propaganda. +5 alliance.' }],
      q: 'The best revenge is not to be like your enemy.', cite: 'after Meditations 6.6' },
    { text: 'Kessar hacked your defense minister\'s email and is leaking embarrassing but true messages.', art: 'trial-evidence',
      choices: [{ t: 'Call them all fakes.', fx: { morale: -6, alliance: -4 }, wise: false, r: 'Journalists verified them in hours. Now you look dishonest as well as embarrassed.' },
        { t: 'Admit what is true, apologize, and move on.', fx: { morale: 3, alliance: 3 }, wise: true, r: 'The story died in two days.' }],
      q: 'If it is not true, do not say it.', cite: 'Meditations 12.17' },
  ];

  /* ---------------- state ---------------- */
  let S = null;

  function newGame() {
    S = {
      turn: 1, owner: [], str: [], bonus: Array(12).fill(0), talks: Array(12).fill(0),
      cp: 0, morale: 65, alliance: 60, next: 0, shield: false, cyberHit: false, countered: false, lie: false,
      planned: null, cyberPlanned: false, reports: [], log: [], orderLog: [], usedDilemmas: [], dilemma: null, choice: null,
      intel: { right: 0, total: 0, verified: 0 }, stoic: { wise: 0, total: 0 }, taken: 0, lost: 0,
      sel: null, target: null, phase: 'intel', advice: '',
    };
    for (let i = 0; i < 12; i++) {
      const c = col(i);
      S.owner[i] = c === 0 ? 'you' : c === 3 ? 'rival' : 'neutral';
      S.str[i] = S.owner[i] === 'neutral' ? 2 : (i === YOU_CAP || i === RIVAL_CAP ? 6 : 4);
    }
    $('#s-title').hidden = true; $('#s-final').hidden = true; $('#s-game').hidden = false;
    startTurn();
    window.scrollTo({ top: 0 });
  }

  const mine = () => S.owner.map((o, i) => (o === 'you' ? i : -1)).filter((i) => i >= 0);
  const theirs = () => S.owner.map((o, i) => (o === 'rival' ? i : -1)).filter((i) => i >= 0);
  const frontier = (i, foe) => adj(i).some((j) => S.owner[j] === foe);

  function commandPoints() {
    return Math.max(1, 4 + Math.floor(mine().length / 4) + (S.alliance >= 70 ? 1 : 0) + S.next - (S.cyberHit ? 1 : 0));
  }

  function planAttack() {
    let best = null, score = -99;
    mine().forEach((t) => {
      const atk = adj(t).filter((j) => S.owner[j] === 'rival');
      if (!atk.length) return;
      const strongest = Math.max(...atk.map((j) => S.str[j]));
      const s = strongest - S.str[t] + (t === YOU_CAP ? 1 : 0) + Math.random();
      if (s > score) { score = s; best = t; }
    });
    return best;
  }

  function startTurn() {
    S.bonus.fill(0); S.countered = false; S.sel = null; S.target = null; S.orderLog = []; S.log = [];
    S.cp = commandPoints(); S.next = 0; S.cyberHit = false;
    S.planned = planAttack();
    S.cyberPlanned = Math.random() < 0.35;
    S.reports = makeReports();
    setPhase('intel');
  }

  function setPhase(p) { S.phase = p; S.advice = pick(ADVICE[p] || ADVICE.orders); render(); }

  /* ---------------- intel ---------------- */
  function quality() { const x = Math.random(); return x < 0.35 ? 'strong' : x < 0.65 ? 'mixed' : 'weak'; }

  function makeReports() {
    const types = [];
    const strikeTargets = theirs().filter((i) => frontier(i, 'you'));
    const envoyTargets = S.owner.map((o, i) => (o === 'neutral' && frontier(i, 'you') ? i : -1)).filter((i) => i >= 0);
    if (S.planned != null && Math.random() < 0.75) types.push('threat');
    const pool = shuffle(['cyber', 'home', ...(strikeTargets.length ? ['strike', 'strike'] : []), ...(envoyTargets.length ? ['envoy', 'envoy'] : []), ...(S.planned != null ? ['threat'] : [])]);
    for (const t of pool) { if (types.length >= 2) break; if (!types.includes(t)) types.push(t); }

    return types.map((type) => {
      let q = quality(), truth = Math.random() < TRUTH[q], region = null, src = null;
      if (type === 'threat') {
        const decoys = mine().filter((i) => i !== S.planned);
        if (!truth && !decoys.length) truth = true;
        region = truth ? S.planned : pick(decoys);
      } else if (type === 'cyber') {
        S.cyberPlanned = truth;
      } else if (type === 'strike') {
        region = pick(strikeTargets);
        src = adj(region).filter((j) => S.owner[j] === 'you').sort((a, b) => S.str[b] - S.str[a])[0];
      } else if (type === 'envoy') {
        region = pick(envoyTargets);
      } else {
        region = pick(mine());
      }
      const name = region != null ? REG[region] : '';
      const text = pick(INTEL[type].text[q]).replace(/\{R\}/g, name);
      return { type, q, truth, region, src, text, actLabel: INTEL[type].act.replace('{R}', name), state: 'open', result: null, good: null };
    });
  }

  function verify(rep) {
    if (S.cp < 1 || rep.state !== 'open') return;
    S.cp -= 1; S.intel.verified += 1; rep.state = 'verified';
    render();
  }

  function resolve(rep, choice) {
    if (rep.state === 'done') return;
    const act = choice === 'act', T = rep.truth, R = rep.region != null ? REG[rep.region] : '';
    const right = (T && act) || (!T && !act);
    S.intel.total += 1; if (right) S.intel.right += 1;
    let msg = '';
    switch (rep.type) {
      case 'threat':
        if (act && T) { S.bonus[rep.region] += 3; msg = `Defenses dug in at ${R}: +3 against any attack this season.`; }
        else if (act) { S.cp = Math.max(0, S.cp - 1); bump('morale', -3); msg = `You rushed forces to ${R} for an attack that never existed. −1 command, −3 morale.`; }
        else if (T) msg = `You let it go. The attack on ${R} is real, and your troops there are not ready.`;
        else msg = `Good call. It was a decoy meant to pull your forces out of position.`;
        break;
      case 'cyber':
        if (act && T) { S.shield = true; msg = 'Grid hardened. The attack will bounce off.'; }
        else if (act) { S.cp = Math.max(0, S.cp - 1); msg = 'You spent a command point chasing a phantom.'; }
        else if (T) msg = 'The malware stays in your grid. Expect trouble.';
        else msg = 'Good call. The rumor was noise.';
        break;
      case 'strike':
        if (act && T) { S.str[rep.region] = Math.max(1, S.str[rep.region] - 3); msg = `Kessar's garrison in ${R} is thinned (−3). Advance while the gap is open.`; }
        else if (act) { S.str[rep.src] = Math.max(1, S.str[rep.src] - 2); msg = `Ambush! It was bait. You lost 2 forces in ${REG[rep.src]}.`; }
        else if (T) msg = `The gap in ${R} closes before anyone acts.`;
        else msg = 'Good call. It was bait for an ambush.';
        break;
      case 'envoy':
        if (act && T) { S.owner[rep.region] = 'you'; S.str[rep.region] = Math.max(2, S.str[rep.region]); S.taken += 1; flash(rep.region); msg = `${R} joins your coalition!`; }
        else if (act) { bump('alliance', -6); msg = 'It was a hoax, and you announced it to the world. −6 alliance.'; }
        else if (T) { bump('alliance', -2); msg = `${R}'s council felt ignored. −2 alliance.`; }
        else msg = 'Good call. There was never any vote.';
        break;
      default:
        if (act && T) { bump('morale', 5); msg = 'You got ahead of a real problem. +5 morale.'; }
        else if (act) { bump('morale', -8); msg = 'You spread panic about a hoax. −8 morale.'; }
        else if (T) { bump('morale', -10); msg = 'People got sick while you waited. −10 morale.'; }
        else msg = 'Good call. No harm done.';
    }
    rep.state = 'done'; rep.good = right;
    rep.result = { msg, verdict: T ? 'The report was TRUE.' : 'The report was FALSE.' };
    if (checkEnd()) return;
    render();
  }

  /* ---------------- orders ---------------- */
  function winChance(atk, def) {
    let w = 0; for (let a = 1; a <= 6; a++) for (let d = 1; d <= 6; d++) if (atk + a > def + d) w++;
    return Math.round((w / 36) * 100);
  }
  const defense = (i) => S.str[i] + S.bonus[i] + (i === RIVAL_CAP || i === YOU_CAP ? 3 : 0);

  function clickRegion(i) {
    if (S.phase !== 'orders') return;
    if (S.owner[i] === 'you') { S.sel = S.sel === i ? null : i; S.target = null; }
    else if (S.sel != null && isAdj(S.sel, i)) { S.target = S.target === i ? null : i; }
    else {
      const from = adj(i).filter((j) => S.owner[j] === 'you').sort((a, b) => S.str[b] - S.str[a])[0];
      S.sel = from ?? null; S.target = i;
    }
    render();
  }

  function reinforce(i) {
    if (S.cp < 1) return;
    S.cp -= 1; S.str[i] = Math.min(MAX_STR, S.str[i] + 2);
    S.orderLog.push({ good: true, html: [`Reinforced `, b(REG[i]), ` (+2).`] });
    render();
  }

  function advance(from, to) {
    if (S.cp < 2 || S.str[from] < 2) return;
    S.cp -= 2;
    const wasNeutral = S.owner[to] === 'neutral';
    const ra = d6(), rd = d6(), atk = S.str[from] + ra, def = defense(to) + rd;
    if (wasNeutral) bump('alliance', -8);
    if (atk > def) {
      const move = Math.floor(S.str[from] / 2);
      S.owner[to] = 'you'; S.str[to] = Math.max(1, move); S.str[from] = Math.max(1, S.str[from] - move);
      S.taken += 1; bump('morale', 4); flash(to);
      S.orderLog.push({ good: true, html: [`Took `, b(REG[to]), ` from ${wasNeutral ? 'neutral forces' : 'Kessar'}. +4 morale`, wasNeutral ? ', −8 alliance for invading a neutral.' : '.', dice(atk, def)] });
      if (to === RIVAL_CAP) return endGame('victory-capital');
    } else {
      S.str[from] = Math.max(1, S.str[from] - 2); S.str[to] = Math.max(1, S.str[to] - 1);
      S.orderLog.push({ good: false, html: [`The advance on `, b(REG[to]), ` stalled. You lost 2 forces${wasNeutral ? ' and 8 alliance' : ''}.`, dice(atk, def)] });
    }
    S.target = null;
    if (checkEnd()) return;
    render();
  }

  function negotiate(i) {
    if (S.cp < 1) return;
    S.cp -= 1;
    const p = clamp(0.25 + (S.alliance - 50) / 150 + (S.morale - 50) / 300 + S.talks[i], 0.1, 0.85);
    if (Math.random() < p) {
      S.owner[i] = 'you'; S.str[i] = Math.max(2, S.str[i]); S.taken += 1; flash(i);
      S.orderLog.push({ good: true, html: [b(REG[i]), ` agreed to join your coalition.`] });
      S.target = null;
    } else {
      S.talks[i] += 0.15;
      S.orderLog.push({ good: false, html: [`Talks with `, b(REG[i]), ` continue. They will listen more next time.`] });
    }
    if (checkEnd()) return;
    render();
  }

  function counterDisinfo() { if (S.cp < 1 || S.countered) return; S.cp -= 1; S.countered = true; bump('morale', 3); S.orderLog.push({ good: true, html: ['Fact-checkers deployed. +3 morale, and Kessar\'s troll farms are blunted this season.'] }); render(); }
  function cyberShield() { if (S.cp < 1 || S.shield) return; S.cp -= 1; S.shield = true; S.orderLog.push({ good: true, html: ['Cyber shield up. The next attack on your networks will fail.'] }); render(); }

  /* ---------------- Kessar's turn ---------------- */
  function rivalTurn() {
    const log = [];
    S.sel = null; S.target = null;
    // grow
    theirs().forEach((i) => { const front = adj(i).some((j) => S.owner[j] !== 'rival'); S.str[i] = Math.min(MAX_STR, S.str[i] + 1 + (front && S.turn % 2 === 0 ? 1 : 0) + (front && S.turn >= 9 ? 1 : 0)); });
    // annex a neutral by pressure
    const neutrals = S.owner.map((o, i) => (o === 'neutral' && frontier(i, 'rival') ? i : -1)).filter((i) => i >= 0);
    if (neutrals.length && Math.random() < 0.45) {
      const n = neutrals.sort((a, b) => S.str[a] - S.str[b])[0];
      const push = Math.max(...adj(n).filter((j) => S.owner[j] === 'rival').map((j) => S.str[j]));
      if (push > S.str[n] + 1) { S.owner[n] = 'rival'; S.str[n] += 1; flash(n); log.push({ good: false, html: ['Kessar annexed ', b(REG[n]), ' through pressure and bribes.'] }); }
    }
    // attack
    let t = S.planned != null && S.owner[S.planned] === 'you' ? S.planned : (Math.random() < 0.5 ? planAttack() : null);
    if (t != null) {
      const from = adj(t).filter((j) => S.owner[j] === 'rival').sort((a, b) => S.str[b] - S.str[a])[0];
      if (from != null && S.str[from] >= 3) {
        const ra = d6(), rd = d6(), atk = S.str[from] + ra, def = defense(t) + rd;
        if (atk > def) {
          const move = Math.ceil(S.str[from] / 2);
          S.owner[t] = 'rival'; S.str[t] = move; S.str[from] = Math.max(1, S.str[from] - move);
          S.lost += 1; bump('morale', -8); flash(t);
          log.push({ good: false, html: ['Kessar drones and armor took ', b(REG[t]), '. −8 morale.', dice(atk, def, true)] });
          if (t === YOU_CAP) { S.log = log; return endGame('defeat-capital'); }
        } else {
          S.str[from] = Math.max(1, S.str[from] - 2); S.str[t] = Math.max(1, S.str[t] - 1); bump('morale', 3);
          log.push({ good: true, html: ['Your forces held ', b(REG[t]), ' against a Kessar assault. +3 morale.', S.bonus[t] ? ' The early warning paid off.' : '', dice(atk, def, true)] });
        }
      }
    }
    // cyber
    if (S.cyberPlanned) {
      if (S.shield) { S.shield = false; log.push({ good: true, html: ['A Kessar cyber attack hit your shield and failed.'] }); }
      else { S.cyberHit = true; log.push({ good: false, html: ['A Kessar cyber attack knocked out power in two cities. −1 command next season.'] }); }
    }
    // disinformation
    if (S.countered) log.push({ good: true, html: ['Your fact-checkers blunted Kessar\'s disinformation campaign.'] });
    else { bump('morale', -4); log.push({ good: false, html: ['Kessar troll farms flooded your feeds with lies. −4 morale.'] }); }
    // old lies come back
    if (S.lie && Math.random() < 0.45) { S.lie = false; bump('alliance', -20); log.push({ good: false, html: ['Journalists exposed the inflated loss numbers you published. −20 alliance.'] }); }
    S.log = log;
    if (checkEnd()) return;
    setPhase('rival');
  }

  /* ---------------- dilemmas ---------------- */
  function startDilemma() {
    let options = DILEMMAS.map((d, i) => i).filter((i) => !S.usedDilemmas.includes(i));
    if (!options.length) { S.usedDilemmas = []; options = DILEMMAS.map((d, i) => i); }
    const i = pick(options); S.usedDilemmas.push(i);
    S.dilemma = { ...DILEMMAS[i], order: shuffle(DILEMMAS[i].choices) }; S.choice = null;
    setPhase('dilemma');
  }

  function choose(c) {
    if (S.choice) return;
    S.choice = c; S.stoic.total += 1; if (c.wise) S.stoic.wise += 1;
    const fx = c.fx;
    if (fx.morale) bump('morale', fx.morale);
    if (fx.alliance) bump('alliance', fx.alliance);
    if (fx.next) S.next += fx.next;
    if (fx.lie) S.lie = true;
    if (fx.rivalAll) theirs().forEach((j) => { S.str[j] = Math.min(MAX_STR, S.str[j] + fx.rivalAll); });
    if (fx.rivalHit) { const f = theirs().filter((j) => frontier(j, 'rival')).sort((a, b) => S.str[b] - S.str[a])[0]; if (f != null) S.str[f] = Math.max(1, S.str[f] - fx.rivalHit); }
    if (checkEnd()) return;
    render();
  }

  function nextSeason() {
    if (S.turn >= TURNS) return endGame('end');
    S.turn += 1; startTurn(); window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------------- end ---------------- */
  function checkEnd() {
    S.morale = clamp(S.morale, 0, 100); S.alliance = clamp(S.alliance, 0, 100);
    if (S.owner[YOU_CAP] !== 'you') { endGame('defeat-capital'); return true; }
    if (S.morale <= 0) { endGame('defeat-morale'); return true; }
    if (S.owner[RIVAL_CAP] === 'you') { endGame('victory-capital'); return true; }
    if (mine().length >= WIN_REGIONS) { endGame('victory-regions'); return true; }
    return false;
  }

  function endGame(kind) {
    const regions = mine().length;
    const asked = S.intel.total + S.stoic.total, good = S.intel.right + S.stoic.wise;
    const wisdom = asked ? Math.round((100 * good) / asked) : 0;
    const outcomes = {
      'victory-capital': ['Total victory', 'You took Kessar City. The war is over.'],
      'victory-regions': ['Victory', `You hold ${regions} of 12 regions. Kessar sues for peace.`],
      'defeat-capital': ['Defeat', 'Nova Roma has fallen. The Republic will have to rebuild.'],
      'defeat-morale': ['Defeat', 'Public morale collapsed and your government fell.'],
    };
    let [label, line] = outcomes[kind] || (regions >= 7 ? ['Victory on points', `Twelve seasons survived holding ${regions} regions. Kessar agrees to a ceasefire on your terms.`]
      : regions >= 5 ? ['You held the line', `Twelve seasons survived holding ${regions} regions. A tense ceasefire begins.`]
        : ['Pushed back', `You survived twelve seasons, but hold only ${regions} regions.`]);
    const rank = wisdom >= 90 ? 'Philosopher-King' : wisdom >= 72 ? 'Stoic Strategist' : wisdom >= 50 ? 'Seasoned Commander' : 'Student of the Stoa';
    $('#s-game').hidden = true; $('#s-final').hidden = false;
    $('#final-kicker').textContent = label;
    $('#final-rank').textContent = rank;
    $('#final-line').textContent = line + ' ' + (wisdom >= 72 ? 'Marcus would be proud: you judged the evidence and kept your character.' : wisdom >= 50 ? 'Marcus nods. Sharper judgment would have saved you trouble.' : 'Marcus suggests reading the intel more carefully, and choosing justice when it costs you.');
    const stats = $('#final-stats'); stats.replaceChildren();
    [['Seasons commanded', `${S.turn} of ${TURNS}`], ['Regions held', `${regions} of 12`], ['Intel judged correctly', `${S.intel.right} of ${S.intel.total}`],
      ['Reports verified', String(S.intel.verified)], ['Stoic choices', `${S.stoic.wise} of ${S.stoic.total}`], ['Wisdom score', `${wisdom}%`]]
      .forEach(([k, v]) => { const li = el('li'); li.append(k + ': ', b(v)); stats.append(li); });
    const best = store.get('ctsm-best');
    if (!best || wisdom > best.wisdom || (wisdom === best.wisdom && regions > best.regions)) store.set('ctsm-best', { rank, label, wisdom, regions });
    window.scrollTo({ top: 0 });
  }

  /* ---------------- small UI bits ---------------- */
  function b(text) { const e = el('b', '', text); return e; }
  function dice(a, d, rivalAttacking) { return el('span', 'dice', ` [${rivalAttacking ? 'Kessar' : 'you'} ${a} vs ${rivalAttacking ? 'you' : 'them'} ${d}]`); }
  const bumped = new Set();
  function bump(stat, delta) { S[stat] = clamp(S[stat] + delta, 0, 100); bumped.add(stat); }
  const flashed = new Set();
  function flash(i) { flashed.add(i); }

  function renderBar() {
    $('#b-season').textContent = `Season ${S.turn} of ${TURNS} · ${SEASONS[(S.turn - 1) % 4]} ${2031 + Math.floor((S.turn - 1) / 4)}`;
    $('#b-phase').textContent = { intel: 'Intelligence briefing', orders: 'Orders', rival: 'Kessar moves', dilemma: 'The hard call' }[S.phase];
    const set = (id, v, low, key) => { const e = $(id); e.textContent = String(v); e.parentElement.classList.toggle('low', !!low); if (bumped.has(key)) { e.classList.remove('bump'); void e.offsetWidth; e.classList.add('bump'); } };
    set('#b-cp', S.cp, S.cp === 0, 'cp'); set('#b-morale', S.morale, S.morale < 25, 'morale'); set('#b-alliance', S.alliance, S.alliance < 25, 'alliance'); set('#b-regions', mine().length, mine().length < 3, 'regions');
    bumped.clear();
  }

  const CW = 180, CH = 150, GX = 200, GY = 168, OX = 20, OY = 14;
  const cx = (i) => OX + col(i) * GX, cy = (i) => OY + row(i) * GY;

  function renderMap() {
    const svg = $('#map'); svg.replaceChildren();
    const defs = sv('defs', {});
    [['g-you', '#2f8f7c', '#16473f'], ['g-rival', '#a8423a', '#4d1b17'], ['g-neutral', '#3a3f52', '#1b1e29']].forEach(([id, a, c]) => {
      const g = sv('linearGradient', { id, x1: 0, y1: 0, x2: 1, y2: 1 }); g.append(sv('stop', { offset: '0%', 'stop-color': a }), sv('stop', { offset: '100%', 'stop-color': c })); defs.append(g);
    });
    svg.append(defs);
    for (let i = 0; i < 12; i++) adj(i).filter((j) => j > i).forEach((j) => svg.append(sv('line', { class: 'link', x1: cx(i) + CW / 2, y1: cy(i) + CH / 2, x2: cx(j) + CW / 2, y2: cy(j) + CH / 2 })));
    const reach = S.phase === 'orders' && S.sel != null ? adj(S.sel).filter((j) => S.owner[j] !== 'you') : [];
    for (let i = 0; i < 12; i++) {
      const cls = ['cell', S.owner[i]];
      if (S.sel === i) cls.push('sel');
      if (S.target === i) cls.push('target'); else if (reach.includes(i)) cls.push('reach');
      if (flashed.has(i)) cls.push('flash');
      const g = sv('g', { class: cls.join(' '), tabindex: S.phase === 'orders' ? 0 : -1, role: 'button',
        'aria-label': `${REG[i]}, ${OWNER_NAME[S.owner[i]]}, ${S.str[i]} forces${i === YOU_CAP || i === RIVAL_CAP ? ', capital' : ''}` });
      g.append(sv('rect', { class: 'body', x: cx(i), y: cy(i), width: CW, height: CH, rx: 6 }));
      g.append(sv('text', { class: 'tag', x: cx(i) + 12, y: cy(i) + 22 }, OWNER_NAME[S.owner[i]]));
      if (i === YOU_CAP || i === RIVAL_CAP) g.append(sv('text', { class: 'star', x: cx(i) + CW - 36, y: cy(i) + 28 }, '★'));
      g.append(sv('text', { class: 'name', x: cx(i) + 12, y: cy(i) + 56 }, REG[i]));
      g.append(sv('text', { class: 'forces', x: cx(i) + 12, y: cy(i) + CH - 20 }, String(S.str[i])));
      if (S.bonus[i] && S.owner[i] === 'you') g.append(sv('text', { class: 'bonus', x: cx(i) + CW - 12, y: cy(i) + CH - 22, 'text-anchor': 'end' }, `+${S.bonus[i]}`));
      g.addEventListener('click', () => clickRegion(i));
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clickRegion(i); } });
      svg.append(g);
    }
    flashed.clear();
  }

  function advisor(text) {
    const a = el('div', 'advisor'); const img = el('img'); img.src = 'img/guide.webp'; img.alt = 'Marcus Aurelius'; img.width = 64; img.height = 64;
    a.append(img, el('p', '', '“' + text + '”')); return a;
  }

  function logList(items) {
    const ul = el('ul', 'log');
    items.forEach((it) => { const li = el('li', it.good === true ? 'good' : it.good === false ? 'bad' : ''); it.html.forEach((h) => li.append(h instanceof Node ? h : document.createTextNode(h))); ul.append(li); });
    return ul;
  }

  function renderPanel() {
    const p = $('#panel'); p.replaceChildren(advisor(S.advice));

    if (S.phase === 'intel') {
      p.append(el('h3', '', 'Intelligence briefing'), el('p', 'sub', 'Act on a report, verify it first for 1 command point, or dismiss it. Acting on a lie costs you. Ignoring the truth costs more.'));
      S.reports.forEach((r) => {
        const card = el('div', 'report');
        const head = el('div', 'report-head'); head.append(el('span', '', INTEL[r.type].label));
        const stamp = el('span', 'stamp', r.state === 'verified' || r.state === 'done' ? (r.truth ? 'Confirmed true' : 'Confirmed false') : 'Unverified');
        if (r.state !== 'open') stamp.classList.add(r.truth ? 't' : 'f');
        head.append(stamp); card.append(head, el('p', 'claim', r.text));
        if (r.state !== 'done') {
          const acts = el('div', 'acts');
          acts.append(btn(r.actLabel, 'btn-teal', () => resolve(r, 'act')));
          if (r.state === 'open') acts.append(btn('Verify · 1 CP', '', () => verify(r), S.cp < 1));
          acts.append(btn('Dismiss', 'btn-red', () => resolve(r, 'dismiss')));
          card.append(acts);
        } else {
          const res = el('div', 'result ' + (r.good ? 'good' : 'bad'));
          res.append(b((r.good ? 'Well judged. ' : 'Misjudged. ') + r.result.verdict + ' '), document.createTextNode(r.result.msg));
          res.append(el('span', 'lesson', LESSON[r.q]));
          card.append(res);
        }
        p.append(card);
      });
      if (S.reports.every((r) => r.state === 'done')) { const row = el('div', 'next-row'); row.append(btn('Give orders →', 'btn-gold', () => setPhase('orders'))); p.append(row); }
    }

    if (S.phase === 'orders') {
      p.append(el('h3', '', 'Orders'), el('p', 'sub', `You have ${S.cp} command point${S.cp === 1 ? '' : 's'}. Tap one of your regions, then a neighbor to advance or negotiate.`));
      const box = el('div', 'orders-sel');
      if (S.sel == null && S.target == null) box.append(el('p', 'meta', 'Nothing selected. Tap a region on the map.'));
      if (S.sel != null) {
        box.append(el('h4', '', REG[S.sel]), el('p', 'meta', `Yours · ${S.str[S.sel]} forces${S.sel === YOU_CAP ? ' · capital (+3 defense)' : ''}`));
        const ob = el('div', 'order-btns');
        ob.append(btn('Reinforce +2', '', () => reinforce(S.sel), S.cp < 1 || S.str[S.sel] >= MAX_STR));
        ob.lastChild.append(el('small', '', '1 CP'));
        if (S.target != null) {
          const t = S.target, neutral = S.owner[t] === 'neutral', odds = winChance(S.str[S.sel], defense(t));
          const adv = btn(`Advance into ${REG[t]}`, 'btn-red', () => advance(S.sel, t), S.cp < 2 || S.str[S.sel] < 2);
          adv.append(el('small', '', `2 CP · ~${odds}%${neutral ? ' · −8 alliance' : ''}`)); ob.append(adv);
          if (neutral) { const n = btn(`Negotiate with ${REG[t]}`, 'btn-teal', () => negotiate(t), S.cp < 1); n.append(el('small', '', '1 CP')); ob.append(n); }
        }
        box.append(ob);
      } else if (S.target != null) {
        box.append(el('h4', '', REG[S.target]), el('p', 'meta', `${OWNER_NAME[S.owner[S.target]]} · ${S.str[S.target]} forces · not next to any of your regions`));
      }
      if (S.target != null && S.sel != null) box.insertBefore(el('p', 'meta', `Target: ${REG[S.target]} · ${OWNER_NAME[S.owner[S.target]]} · ${S.str[S.target]} forces${S.target === RIVAL_CAP ? ' · capital (+3 defense)' : ''}`), box.querySelector('.order-btns'));
      p.append(box);
      const gb = el('div', 'global-btns');
      const c1 = btn('Counter disinfo', '', counterDisinfo, S.cp < 1 || S.countered); c1.append(el('small', '', S.countered ? 'done' : '1 CP'));
      const c2 = btn('Cyber shield', '', cyberShield, S.cp < 1 || S.shield); c2.append(el('small', '', S.shield ? 'active' : '1 CP'));
      gb.append(c1, c2); p.append(gb);
      if (S.orderLog.length) p.append(logList(S.orderLog));
      const row = el('div', 'next-row'); row.append(btn('End season →', 'btn-gold', rivalTurn)); p.append(row);
    }

    if (S.phase === 'rival') {
      p.append(el('h3', '', 'Kessar moves'), logList(S.log.length ? S.log : [{ good: null, html: ['A quiet season on the front.'] }]));
      const row = el('div', 'next-row'); row.append(btn('Face the hard call →', 'btn-gold', startDilemma)); p.append(row);
    }

    if (S.phase === 'dilemma') {
      const d = S.dilemma;
      const art = el('img', 'dilemma-art'); art.src = `img/${d.art}.webp`; art.alt = ''; art.width = 420; art.height = 150;
      p.append(art, el('h3', '', 'The hard call'), el('p', 'sub', d.text));
      if (!S.choice) {
        const ch = el('div', 'choices');
        d.order.forEach((c) => { const bt = el('button', 'choice', c.t); bt.type = 'button'; bt.addEventListener('click', () => choose(c)); ch.append(bt); });
        p.append(ch);
      } else {
        const res = el('div', 'result ' + (S.choice.wise ? 'good' : 'bad'));
        res.append(b(S.choice.wise ? 'The Stoic choice. ' : 'Not the Stoic choice. '), document.createTextNode(S.choice.r));
        const qt = el('blockquote', 'quote', '“' + d.q + '”'); qt.append(el('cite', '', d.cite));
        p.append(res, qt);
        const row = el('div', 'next-row'); row.append(btn(S.turn >= TURNS ? 'See how history judges you →' : 'Next season →', 'btn-gold', nextSeason)); p.append(row);
      }
    }
  }

  function render() { renderBar(); renderMap(); renderPanel(); }

  /* ---------------- boot ---------------- */
  $('#start').addEventListener('click', newGame);
  $('#again').addEventListener('click', newGame);
  const best = store.get('ctsm-best');
  if (best && best.rank) { const e = $('#best'); e.hidden = false; e.textContent = `Your best: ${best.rank} · ${best.label} · wisdom ${best.wisdom}%`; }
})();
