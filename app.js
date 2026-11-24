/* era website — clickable prototype with made-up example data.
   Routes: #/login · #/family[/<person> | /svc-<service>] ("Overview", the home page) · #/services[/<id>] · #/steps (assistant) · #/help */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  // same breakpoints as styles.css: phone ≤ 767 · tablet ≤ 1023 · desktop above
  const isTablet = () => window.matchMedia("(max-width: 1023px)").matches;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem('era2:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('era2:' + k, JSON.stringify(v)); } catch (e) { /* fine */ } },
  };
  // Material Symbols Outlined (weight 400, fill 0, 24px) — fonts.google.com/icons
  const I = {
    arrow: '<path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z"/>',  // arrow_forward
    food: '<path d="M280-80v-366q-51-14-85.5-56T160-600v-280h80v280h40v-280h80v280h40v-280h80v280q0 56-34.5 98T360-446v366h-80Zm400 0v-320H560v-280q0-83 58.5-141.5T760-880v800h-80Z"/>',  // restaurant
    car: '<path d="M240-200v40q0 17-11.5 28.5T200-120h-40q-17 0-28.5-11.5T120-160v-320l84-240q6-18 21.5-29t34.5-11h440q19 0 34.5 11t21.5 29l84 240v320q0 17-11.5 28.5T800-120h-40q-17 0-28.5-11.5T720-160v-40H240Zm-8-360h496l-42-120H274l-42 120Zm-32 80v200-200Zm100 160q25 0 42.5-17.5T360-380q0-25-17.5-42.5T300-440q-25 0-42.5 17.5T240-380q0 25 17.5 42.5T300-320Zm360 0q25 0 42.5-17.5T720-380q0-25-17.5-42.5T660-440q-25 0-42.5 17.5T600-380q0 25 17.5 42.5T660-320Zm-460 40h560v-200H200v200Z"/>',  // directions_car
    hand: '<path d="M480-480v-400q0-17 11.5-28.5T520-920q17 0 28.5 11.5T560-880v400h-80Zm-160 0v-360q0-17 11.5-28.5T360-880q17 0 28.5 11.5T400-840v360h-80ZM500-40q-142 0-241-99t-99-241v-380q0-17 11.5-28.5T200-800q17 0 28.5 11.5T240-760v380q0 109 75.5 184.5T500-120q109 0 184.5-75.5T760-380v-140q-17 0-28.5 11.5T720-480v160H600q-33 0-56.5 23.5T520-240v40h-80v-40q0-66 47-113t113-47h40v-400q0-17 11.5-28.5T680-840q17 0 28.5 11.5T720-800v207q10-3 19.5-5t20.5-2h80v220q0 142-99 241T500-40Zm40-320Z"/>',  // front_hand
    home: '<path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z"/>',  // home
    phone: '<path d="M798-120q-125 0-247-54.5T329-329Q229-429 174.5-551T120-798q0-18 12-30t30-12h162q14 0 25 9.5t13 22.5l26 140q2 16-1 27t-11 19l-97 98q20 37 47.5 71.5T387-386q31 31 65 57.5t72 48.5l94-94q9-9 23.5-13.5T670-390l138 28q14 4 23 14.5t9 23.5v162q0 18-12 30t-30 12ZM241-600l66-66-17-94h-89q5 41 14 81t26 79Zm358 358q39 17 79.5 27t81.5 13v-88l-94-19-67 67ZM241-600Zm358 358Z"/>',  // call
    check: '<path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>',  // check
    search: '<path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/>',  // search
    cross: '<path d="M120-120v-80l80-240-80-240v-80h508l58-160 94 34-46 126h106v80l-80 240 80 240v80H120Zm320-160h80v-120h120v-80H520v-120h-80v120H320v80h120v120Zm-236 80h552l-80-240 80-240H204l80 240-80 240Zm276-240Z"/>',  // local_pharmacy
    add: '<path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/>',  // add
    question: '<path d="M424-320q0-81 14.5-116.5T500-514q41-36 62.5-62.5T584-637q0-41-27.5-68T480-732q-51 0-77.5 31T365-638l-103-44q21-64 77-111t141-47q105 0 161.5 58.5T698-641q0 50-21.5 85.5T609-475q-49 47-59.5 71.5T539-320H424Zm56 240q-33 0-56.5-23.5T400-160q0-33 23.5-56.5T480-240q33 0 56.5 23.5T560-160q0 33-23.5 56.5T480-80Z"/>',  // question_mark
    remove: '<path d="M200-440v-80h560v80H200Z"/>',  // remove
  };
  const icon = (n) => `<svg class="ms" viewBox="0 -960 960 960" aria-hidden="true">${I[n]}</svg>`;

  /* ---------- people (photos from the team's Figma) ---------- */
  const PEOPLE = {
    rosa:   { name: 'Andrea', role: 'Dad',           full: 'Andrea Balloni', born: '14.03.1955', photo: 'assets/people/andrea.jpg' },
    giulia: { name: 'Isa',    role: 'You',           full: 'Isa Bianchi',    born: '02.04.1975', photo: 'assets/people/giulia.jpg' },
    marco:  { name: 'Marco',  role: 'Brother',       full: 'Marco Bolognini', born: '19.07.1972', photo: 'assets/people/marco.jpg' },
    sofia:  { name: 'Sofia',  role: 'Granddaughter', full: 'Sofia Rossi',   born: '30.01.2005', photo: 'assets/people/sofia.jpg' },
  };
  const SERVICE_DONE = {
    food: { soon: 'tomorrow 12:00', text: 'Lunch delivery — Pranzo a Casa', when: 'Every day at 12:00 · starts tomorrow', toast: 'Lunch is ordered for Andrea. It arrives tomorrow at 12:00.' },
    drive: { soon: 'Thu 9:30', text: 'Driving service — Bus Amico', when: 'Thu 26 Nov · pick-up 9:30 to Dr. Ferri', toast: 'A driver picks Andrea up on Thursday at 9:30.' },
    assist: { soon: 'Mon 9:00', text: 'Daily care assistant — Casa Serena', when: 'First visit Mon 30 Nov · 9:00', toast: 'Casa Serena will call you to plan the first visit.' },
    funding: { soon: 'in review', text: 'Home adjustment funding', when: 'Application started · a care advisor checks it', toast: 'Your funding application is started. A care advisor will call you.' },
  };

  let state = store.get('state', { active: [], checklist: [] });
  const save = () => store.set('state', state);

  /* ---------- the family map (Figma "Family" layout) ----------
     You sit in the middle, in focus; the family sits around you, joined by thin 2px lines.
     Coordinates are relative to you at (0, 0). `where` = city · travel time from you. */
  const MAPP = {
    giulia: { x: 0, y: 0, r: 78, where: 'Milano' },
    rosa:   { x: -360, y: -300, r: 66, where: 'Bergamo · 50 min' },
    sofia:  { x: 360, y: -320, r: 56, where: 'Bergamo · 55 min' },
    marco:  { x: -600, y: 190, r: 58, where: 'Bergamo · 50 min' },
  };
  const FAM_LINKS = [['giulia', 'rosa'], ['giulia', 'sofia'], ['giulia', 'marco'], ['rosa', 'sofia'], ['rosa', 'marco']];
  const PEOPLE_ORDER = ['giulia', 'rosa', 'sofia', 'marco'];   // the order they appear in
  // Andrea's services, placed where they are around his home; `people` = who in the family looks after each one
  const MAP_SVC = {
    food:    { name: 'Food delivery', icon: 'food', at: { x: -560, y: -440 }, people: ['giulia', 'rosa'] },
    assist:  { name: 'Day care assistant', icon: 'hand', at: { x: -600, y: -150 }, people: ['sofia', 'rosa'] },
    drive:   { name: 'Driving assistant', icon: 'car', at: { x: -150, y: -210 }, people: ['marco', 'rosa'] },
    funding: { name: 'Home adjustments', icon: 'home', at: { x: -150, y: -470 }, people: ['marco', 'rosa'] },
  };
  let selected = null, selSvc = null;   // the person or the service you tapped
  const at = (k) => MAPP[k];
  // a gently bent line between two people: start, bend point, end
  function linkGeom(a, b) {
    const p = at(a), q = at(b), dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy), bend = d * 0.08 * ((a.length + b.length) % 2 ? 1 : -1);
    return { p, c: { x: (p.x + q.x) / 2 - dy / d * bend, y: (p.y + q.y) / 2 + dx / d * bend }, q };
  }
  function link(a, b) { const { p, c, q } = linkGeom(a, b); return `M${p.x} ${p.y} Q ${c.x.toFixed(1)} ${c.y.toFixed(1)} ${q.x} ${q.y}`; }
  // the point a share t along a line
  function alongLink(a, b, t) { const { p, c, q } = linkGeom(a, b), m = 1 - t; return { x: m * m * p.x + 2 * m * t * c.x + t * t * q.x, y: m * m * p.y + 2 * m * t * c.y + t * t * q.y }; }
  // services and lines that belong to the person you picked
  const notYet = (a, b) => {
    if (a === 'giulia' || b === 'giulia') return !isConnected(a === 'giulia' ? b : a);
    return [a, b].some((x) => x !== 'rosa' && !hasLink('giulia', x) && !isConnected(x));
  };
  const svcOf = (id) => Object.keys(MAP_SVC).filter((k) => MAP_SVC[k].people.includes(id));
  const hasLink = (a, b) => FAM_LINKS.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  // from you to the person you picked: directly, or through Andrea
  const routeTo = (id) => (id === 'giulia' ? '' : hasLink('giulia', id) ? link('giulia', id) : link('giulia', 'rosa') + ' ' + link('rosa', id));
  const textW = (s, size) => s.length * size * 0.52;
  const PIN = 'M536.5-503.5Q560-527 560-560t-23.5-56.5Q513-640 480-640t-56.5 23.5Q400-593 400-560t23.5 56.5Q447-480 480-480t56.5-23.5ZM480-186q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z';

  // a quiet Bergamo street layout behind the family: the walls of Città Alta on its hill, the ring roads and the
  // main avenues down to the station, and the railway. A simplified drawing, not an exact map; no labels or icons.
  const CITY_BG = `<g class="city-bg" aria-hidden="true">
    <path class="cb-wall" d="M-560 -470 C -470 -540, -300 -560, -170 -530 C -60 -505, 30 -470, 60 -410 C 80 -360, 20 -320, -80 -305 C -200 -290, -330 -300, -440 -330 C -540 -360, -620 -410, -560 -470 Z"/>
    <path class="cb-road" d="M-900 -230 C -650 -260, -380 -250, -150 -235 C 120 -218, 420 -260, 900 -300"/>
    <path class="cb-road" d="M-900 90 C -600 60, -300 80, -40 110 C 260 145, 560 120, 900 70"/>
    <path class="cb-road" d="M-120 -300 C -110 -160, -60 -40, 20 80 C 90 190, 140 330, 160 700"/>
    <path class="cb-road" d="M-700 700 C -560 520, -420 360, -300 240 C -190 130, -80 40, 40 -40 C 180 -130, 380 -200, 900 -520"/>
    <path class="cb-road thin" d="M-900 -420 C -760 -380, -650 -360, -560 -400"/>
    <path class="cb-road thin" d="M60 -410 C 200 -450, 380 -470, 600 -560"/>
    <path class="cb-road thin" d="M-600 -230 C -620 -60, -640 120, -680 700"/>
    <path class="cb-road thin" d="M420 -255 C 430 -40, 460 160, 520 700"/>
    <path class="cb-road thin" d="M-900 380 C -500 360, -100 390, 300 380 S 700 350, 900 360"/>
    <path class="cb-rail" d="M-900 470 C -500 430, -150 450, 160 470 C 460 490, 700 470, 900 440"/>
  </g>`;
  // beyond the drawn centre the town carries on as made-up streets, so the map never ends when you drag or zoom out.
  // The same every time (a fixed seed); main roads continue outward, and quieter side streets fill the rest.
  const CITY_FILL = (() => {
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const E = 3200, CX = 900, CY0 = -560, CY1 = 700;     // how far the town goes; the box of the drawn centre
    const wob = (n) => (rnd() - 0.5) * n;
    // a gently wandering street from (x1,y1) to (x2,y2)
    const st = (x1, y1, x2, y2, cls) => { const mx = (x1 + x2) / 2 + wob(80), my = (y1 + y2) / 2 + wob(80);
      return `<path class="cb-road ${cls}" d="M${x1.toFixed(0)} ${y1.toFixed(0)} Q ${mx.toFixed(0)} ${my.toFixed(0)} ${x2.toFixed(0)} ${y2.toFixed(0)}"/>`; };
    let o = '';
    // the centre's main roads and railway carry on to the edge of town
    [[-900, -230, -1], [900, -300, 1], [-900, 90, -1], [900, 70, 1], [-900, 380, -1], [900, 360, 1], [-900, -420, -1]]
      .forEach(([x, y, d]) => { o += st(x, y, d * E, y + wob(240), y === 380 || y === 360 || y === -420 ? 'thin' : ''); });
    [[160, 700], [-700, 700], [-680, 700], [520, 700]].forEach(([x, y], i) => { o += st(x, y, x + wob(500), E, i ? 'thin' : ''); });
    o += st(900, -520, 2200, -1300, '') + st(2200, -1300, E, -1900, '') + st(600, -560, 1300, -1200, 'thin');
    o += `<path class="cb-rail" d="M-900 470 C -1600 500, -2400 440, -${E} 480 M900 440 C 1600 410, 2400 470, ${E} 430"/>`;
    // a few more big roads out in the suburbs
    [-1500, -1000, 1050, 1700].forEach((y) => { o += st(-E, y + wob(120), E, y + wob(120), ''); });
    [-1900, -1300, 1350, 2000].forEach((x) => { o += st(x + wob(120), -E, x + wob(120), E, ''); });
    // side streets: everywhere except over the drawn centre
    for (let y = -E + 120; y < E; y += 230 + wob(60)) {
      const inCore = y > CY0 && y < CY1;
      if (inCore) { o += st(-E, y, -CX - 40, y + wob(40), 'thin') + st(CX + 40, y + wob(40), E, y, 'thin'); }
      else o += st(-E, y, E, y + wob(60), 'thin');
    }
    for (let x = -E + 140; x < E; x += 250 + wob(70)) {
      const inCore = Math.abs(x) < CX;
      if (inCore) { o += st(x, -E, x + wob(40), CY0 - 40, 'thin') + st(x + wob(40), CY1 + 40, x, E, 'thin'); }
      else o += st(x, -E, x + wob(60), E, 'thin');
    }
    return `<g class="city-bg city-fill" aria-hidden="true">${o}</g>`;
  })();

  // map units → screen pixels; before the map is on the page, estimate it from the window
  function mapZ() {
    if ($('#map')) return mapBox().z;
    const w = window.innerWidth, small = isTablet();
    const pw = small ? w - 28 : w - 64 - Math.min(460, Math.max(340, w * 0.28)), ph = small ? pw / 1.3 : Math.min(1000, Math.max(600, window.innerHeight - 110));
    return Math.min(pw / CONTENT.w, ph / CONTENT.h);
  }
  function mapSVG(enter) {
    const small = isTablet();
    const z = mapZ(), u = (px) => px / z;           // text sizes in screen pixels, whatever the map's scale
    const ns = u(small ? 13 : 16), ls = u(12.5), ss = u(11.5);
    let s = CITY_FILL + CITY_BG;
    // lines to people you are not connected with yet are still and dotted, with a question mark half-way
    const k2q = small ? 1.6 : 1 / z, dots = `stroke-dasharray:0 ${(8 * k2q).toFixed(1)};stroke-width:${(3.5 * k2q).toFixed(1)}`;
    s += `<g class="links">${FAM_LINKS.map(([a, b], i) => { const nc = notYet(a, b);
      return `<path class="link ${nc ? 'pending' : ''}" d="${link(a, b)}" ${nc ? `style="${dots}"` : `pathLength="1" style="--i:${i}"`}/>`; }).join('')}</g>`;
    // the route to the person you picked: drawn solid, or dotted while you are not connected yet
    if (selected) {
      const d = routeTo(selected), nc = !isConnected(selected);
      if (d.trim()) s += nc ? `<path class="route pending" d="${d}" style="${dots}"/>` : `<path class="route" d="${d}" pathLength="1"/>`;
    }
    s += FAM_LINKS.filter(([a, b]) => notYet(a, b)).map(([a, b]) => { const m = alongLink(a, b, 0.5), qr = 15 * k2q, qi = 18 * k2q;
      return `<g class="route-q"><title>Not connected yet</title><circle cx="${m.x}" cy="${m.y}" r="${qr}"/><svg x="${m.x - qi / 2}" y="${m.y - qi / 2}" width="${qi}" height="${qi}" viewBox="0 -960 960 960" class="ms">${I.question}</svg></g>`; }).join('');
    // services on the lines: blue when active (opted in), white when not; the picked person's ones light up
    // by default (and when you pick yourself) no service is highlighted; picking someone else, or a service, lights theirs up
    const mine = selSvc ? [selSvc] : selected && selected !== 'giulia' ? svcOf(selected) : [];
    let tags = '';   // names, drawn last so nothing covers them; shown on hover or keyboard focus
    s += Object.entries(MAP_SVC).map(([k, v]) => {
      const { x, y } = v.at, hl = mine.includes(k), on = hl && isActive(k), dim = mine.length > 0 && !hl;
      const k2 = small ? 1.6 : 1 / z;   // on phones the map is tiny, so services scale with the faces instead of staying a fixed pixel size
      const r = (hl ? 21 : 18) * k2, ic = (hl ? 22 : 19) * k2, label = `${v.name}${on ? ' · Active' : ''}`, fs = u(12), lw = textW(label, fs) + fs * 1.8, lh = fs * 2;
      if (!small) tags += `<g class="svc-tag" id="tag-${k}"><rect x="${x - lw / 2}" y="${y - r - u(8) - lh}" width="${lw}" height="${lh}" rx="${lh / 2}"/><text x="${x}" y="${y - r - u(8) - lh / 2 + fs * 0.36}" font-size="${fs}" text-anchor="middle">${esc(label)}</text></g>`;
      return `
      <g class="stop svcnode ${on ? 'on' : ''} ${hl ? 'hl' : ''} ${dim ? 'dim' : ''}" role="button" tabindex="0" data-stop="${k}" aria-label="${esc(v.name)}, ${on ? 'active' : 'not opted in'}. Open service">
        ${hl ? `<circle class="svc-ring" cx="${x}" cy="${y}" r="${r + 5 * k2}"/>` : ''}
        <circle class="svc-dot" cx="${x}" cy="${y}" r="${r}"/>
        <svg x="${x - ic / 2}" y="${y - ic / 2}" width="${ic}" height="${ic}" viewBox="0 -960 960 960" class="svc-ico ms">${I[v.icon]}</svg>
      </g>`;
    }).join('');
    const defs = Object.entries(MAPP).map(([id, p]) => `<clipPath id="clip-${id}"><circle cx="${p.x}" cy="${p.y}" r="${p.r}"/></clipPath>`).join('');
    s += PEOPLE_ORDER.slice().reverse().map((id) => {
      const p = MAPP[id], who = PEOPLE[id], you = id === 'giulia';
      const mf = prepScore(id), mR = p.r + 6 + u(7), mw = u(5);
      const ly = p.y + p.r + (you ? 22 : 14) + ns + u(12);
      const pinW = textW(p.where, ls) + ls * 2.9, pinH = ls * 2, py = p.y - p.r - 6 - u(10) - pinH, pc = py + pinH / 2, ic = ls * 1.25;   // above the face
      const px = p.x - pinW / 2 + ls * 0.7;
      return `
      <g class="person ${selected === id ? 'sel' : ''} ${you ? 'is-you' : ''}" data-person="${id}" role="button" tabindex="0" style="--i:${PEOPLE_ORDER.indexOf(id)}" aria-pressed="${selected === id}" aria-label="${you ? 'You' : `${esc(who.name)}, ${esc(who.role)}`}, ${esc(p.where)}, ${id === 'rosa' ? 'family' : ''} preparedness ${pct(mf)}. Show details">
        ${selected === id || (you && !selected) ? `<circle class="sel-ring" cx="${p.x}" cy="${p.y}" r="${p.r + 6}"/>` : ''}
        <circle class="halo" cx="${p.x}" cy="${p.y}" r="${p.r + 16}"/><circle class="edge" cx="${p.x}" cy="${p.y}" r="${p.r + 1}"/>
        ${who.photo
    ? `<image href="${who.photo}" x="${p.x - p.r}" y="${p.y - p.r}" width="${p.r * 2}" height="${p.r * 2}" clip-path="url(#clip-${id})" preserveAspectRatio="xMidYMid slice"/>`
    : `<circle class="initial-bg" cx="${p.x}" cy="${p.y}" r="${p.r}"/><text class="initial" x="${p.x}" y="${p.y + p.r * 0.12}" font-size="${p.r * 0.8}" text-anchor="middle">${esc(who.name[0])}</text>`}
        <path class="meter-track" d="${arcD(p.x, p.y, mR)}" stroke-width="${mw}"/>
        <path class="meter-edge" d="${arcD(p.x, p.y, mR)}" stroke-width="${mw + u(3)}" pathLength="1" stroke-dasharray="${q10(mf)} 1"/>
        <path class="meter-fill lv-${level(mf).cls}" d="${arcD(p.x, p.y, mR)}" stroke-width="${mw}" pathLength="1" stroke-dasharray="${q10(mf)} 1"><title>${id === 'rosa' ? 'Family' : you ? 'Your' : esc(who.name) + "'s"} preparedness: ${pct(mf)}</title></path>
        <text class="name" x="${p.x}" y="${ly}" font-size="${you ? ns * 1.15 : ns}" text-anchor="middle">${you ? 'You' : `${esc(who.name)}${small ? '' : `<tspan class="role" font-size="${ls + 1}"> · ${esc(who.role)}</tspan>`}`}</text>
        ${small ? '' : `<g class="where"><rect x="${p.x - pinW / 2}" y="${py}" width="${pinW}" height="${pinH}" rx="${pinH / 2}"/>
          <svg class="pin ms" x="${px}" y="${pc - ic / 2}" width="${ic}" height="${ic}" viewBox="0 -960 960 960"><path d="${PIN}"/></svg>
          <text x="${px + ic + ls * 0.35}" y="${pc + ls * 0.36}" font-size="${ls}">${esc(p.where)}</text></g>`}
      </g>`;
    }).join('');
    return `<svg class="${enter ? 'enter' : ''}" role="group" aria-label="Map of Andrea's family around you"><defs>${defs}</defs>${s}<g class="svc-tags" aria-hidden="true">${tags}</g></svg>`;
  }

  function family() {
    mapZoom = 1;
    return `
    <div class="fam">
      <section class="fam-map" aria-label="Andrea's family">
        <p class="panel-title">Andrea's family · 4 people</p>
        <div class="map" id="map">${mapSVG(true)}</div>
        <div class="map-zoom" role="group" aria-label="Zoom the map">
          <button type="button" data-zoom="in" aria-label="Zoom in">${icon('add')}</button>
          <button type="button" data-zoom="out" aria-label="Zoom out" disabled>${icon('remove')}</button>
        </div>
        <div class="map-toast" id="mapToast" role="status" aria-live="polite"></div>
        <div class="ask">
          <span class="bot" aria-hidden="true"><img src="assets/ui/assistant.svg" width="73" height="73" alt=""></span>
          <form data-ask>
            <label class="sr-only" for="ask">Ask era</label>
            <input id="ask" type="text" placeholder="how can I help you?" autocomplete="off">
            <button class="send" type="submit" aria-label="Ask"><img src="assets/ui/send.svg?v=2" width="45" height="45" alt=""></button>
          </form>
        </div>
      </section>
      <aside class="fam-side" id="side">${sidePanel()}</aside>
    </div>`;
  }

  function activeList() {
    return state.active.map((a) => `<div class="active"><span class="dot"></span><span>${esc(a.text)}<br><span class="muted small">${esc(a.when)}</span></span></div>`).join('');
  }

  // what is coming up for the family, grouped by month
  const EVENTS = [
    ['November', 'Thu 26', 'Dr. Ferri (GP) — check-up, 10:00', 'You go with Andrea'],
    ['December', 'Fri 4', 'Notary — power of attorney, 15:00', 'Marco goes with Andrea'],
    ['December', 'Tue 8', 'Cardiologist — heart check, 9:30', 'Andrea'],
    ['December', 'Every Wed', 'Sofia visits Nonno', 'Tech help with the phone'],
  ];
  function overview() {
    const months = [...new Set(EVENTS.map((e) => e[0]))];
    return `
      ${prepCard()}
      <section class="list-card fam-over" aria-label="Overview">
        <div class="list-head"><h2>Overview</h2><span>later this year</span></div>
        ${state.active.length ? `<div class="grp"><p class="grp-t">Services for Dad</p>${activeList()}</div>` : ''}
        ${months.map((m) => `<div class="grp"><p class="grp-t">${m}</p><ul class="events">${EVENTS.filter((e) => e[0] === m).map(([, day, what, who]) => `
          <li><span class="ev-day">${esc(day)}</span><span><span class="ev-what">${esc(what)}</span><span class="ev-who">${esc(who)}</span></span></li>`).join('')}</ul></div>`).join('')}
      </section>`;
  }

  // Person card, as on the Figma board:
  //  · connected   → banner, name, relation, address, upcoming appointments, important documents, (sharing), "View details"
  //  · not yet     → banner, name, relation, address, sharing, big "Connect with brother Marco" → pop-up → "now connected"
  const REL = { rosa: ['Your Father', 'dad'], giulia: ['You', ''], marco: ['Your brother', 'brother'], sofia: ["Andrea's granddaughter", ''] };
  const ADDR = { rosa: 'Via Pignolo 12, Bergamo · 50 min from you', giulia: 'Milano · your home', marco: 'Via Tasso 8, Bergamo · 50 min from you', sofia: 'Bergamo · 55 min from you' };
  const SHARE = { rosa: ['giulia', 'marco'], giulia: ['rosa', 'marco'], marco: ['sofia', 'giulia'], sofia: ['rosa', 'giulia'] };
  const FOCUS = { rosa: '50% 42%', giulia: '50% 38%', marco: '50% 30%', sofia: '50% 62%' }; // where the face sits in each photo
  const INSURED = { rosa: true, giulia: true, marco: true, sofia: true };
  const APPTS = { rosa: [['Tue 8 Dec', 'Cardiologist, 9:30'], ['Thu 26 Nov', 'Dr. Ferri (GP), 10:00']], giulia: [['Thu 26 Nov', 'Goes with Andrea to Dr. Ferri']], marco: [['Tue 8 Dec', 'Cardiologist, 9:30'], ['Thu 26 Nov', 'Dr. Ferri (GP), 10:00']], sofia: [['Every Wed', 'Visits Nonno · tech help']] };
  const DOCS_FULL = ['Health insurance card', 'Medical Prescription', 'Living will', 'Report • Doctor’s appointment • 12/12/10'];
  const DOCS = { rosa: DOCS_FULL, giulia: ['Health insurance card'], marco: DOCS_FULL, sofia: ['Health insurance card'] };
  // silent reset: every refresh starts with only Andrea (and you) connected, so the connect demo can be shown again
  state.connected = ['rosa', 'giulia'];
  // …and with lunch delivery and the driving assistant active, so both service states are on the map
  state.active = ['food', 'drive'].map((k) => ({ text: SERVICE_DONE[k].text, when: SERVICE_DONE[k].when }));
  save();
  const isConnected = (id) => state.connected.includes(id);
  const mini = (id) => { const q = PEOPLE[id]; return q.photo ? `<img src="${q.photo}" alt="${esc(q.name)}">` : `<span>${esc(q.name[0])}</span>`; };
  const shareBlock = (id) => { const share = SHARE[id]; return `<div class="share"><h3>${share.length ? `Sharing medical information with ${share.length} others` : "Can see Andrea's emergency sheet only"}</h3>
    ${share.length ? `<div class="stack">${share.map((s2) => `<a class="mini" href="#/family/${s2}" data-person="${s2}" title="${esc(PEOPLE[s2].name)}">${mini(s2)}</a>`).join('')}</div>` : ''}</div>`; };
  const connectLabel = (id) => `Connect with ${REL[id][1] ? esc(REL[id][1]) + ' ' : ''}<b>${esc(PEOPLE[id].name)}</b>`;

  /* ---------- preparedness ----------
     Everyone works through the same list: Andrea's 5 topics, 3 tasks each, shared equally so everyone is prepared.
     A person's meter = share of the 15 tasks they have done. Andrea's meter = the family average. */
  const PREP = [
    { name: 'Wishes', tasks: ['Talk with Andrea about what matters to him', "Read Andrea's wishes in era", 'Know where Andrea wants to live later on'] },
    { name: 'Health', tasks: ["Know Andrea's medicines and his allergy", "Save Andrea's emergency sheet on your phone", 'Know how to reach Dr. Ferri'] },
    { name: 'Legal', tasks: ['Know who has power of attorney', "Read Andrea's living will", 'Know where his documents are kept'] },
    { name: 'Living at home', tasks: ["Walk through Andrea's flat with him", 'Know which services help Andrea at home', 'Agree who checks in on which day'] },
    { name: 'Money & funding', tasks: ["Know what Andrea's care costs", 'Know which funding Andrea can get', "Know who pays the bills if Andrea can't"] },
  ];
  // example progress: what each person has done (1 = done), per topic in the order above
  const PREP_DONE = {
    giulia: [[1, 1, 1], [1, 1, 0], [1, 0, 1], [1, 0, 0], [0, 0, 0]],   //  8 of 15 · on the way
    marco:  [[1, 0, 0], [1, 0, 0], [1, 1, 1], [0, 0, 0], [1, 1, 0]],   //  7 of 15 · on the way
    sofia:  [[1, 1, 0], [0, 1, 0], [0, 0, 0], [1, 1, 0], [0, 0, 0]],   //  5 of 15 · getting started
  };
  const PREP_MEMBERS = ['giulia', 'marco', 'sofia'];
  if (!state.prep) { state.prep = PREP_DONE.giulia.map((t) => t.slice()); save(); }   // your own ticks are kept in the browser
  const prepOf = (id) => (id === 'giulia' ? state.prep : PREP_DONE[id]);
  const sum = (a) => a.flat().reduce((n, v) => n + v, 0);
  const PREP_TOTAL = PREP.reduce((n, t) => n + t.tasks.length, 0);
  const prepScore = (id) => (id === 'rosa' ? PREP_MEMBERS.reduce((n, m) => n + sum(prepOf(m)), 0) / (PREP_TOTAL * PREP_MEMBERS.length) : sum(prepOf(id)) / PREP_TOTAL);
  const topicScore = (id, ti) => (id === 'rosa' ? PREP_MEMBERS.reduce((n, m) => n + sum(prepOf(m)[ti]), 0) / (PREP[ti].tasks.length * PREP_MEMBERS.length) : sum(prepOf(id)[ti]) / PREP[ti].tasks.length);
  // preparedness is shown as a level from 0 to 10 (not a percentage); the arc fills in tenths
  const lvl10 = (f) => Math.round(f * 10);
  const q10 = (f) => lvl10(f) / 10;
  const level = (f) => { const q = q10(f); return q >= 0.8 ? { cls: 'well', label: 'Well prepared' } : q >= 0.4 ? { cls: 'way', label: 'On the way' } : { cls: 'start', label: 'Getting started' }; };
  const pct = (f) => `${lvl10(f)}/10`;
  const big10 = (f) => `${lvl10(f)}<small>/10</small>`;
  const wpct = (f) => Math.round(f * 100) + '%';   // bar widths only
  // the bottom half of a circle: from the left, through the bottom, to the right
  const arcD = (cx, cy, R) => `M${(cx - R).toFixed(1)} ${cy} A ${R.toFixed(1)} ${R.toFixed(1)} 0 0 0 ${(cx + R).toFixed(1)} ${cy}`;
  // a face with its meter, for the cards
  function meterFace(id, size) {
    const f = prepScore(id), q = PEOPLE[id], r = size / 2, R = r + 7, w = 5, W = 2 * (R + w), top = r + 2;
    return `<svg class="meter-face" width="${W}" height="${top + R + w}" viewBox="${-W / 2} ${-top} ${W} ${top + R + w}" aria-hidden="true">
      <defs><clipPath id="mf-${id}-${size}"><circle r="${r}"/></clipPath></defs>
      ${q.photo ? `<image href="${q.photo}" x="${-r}" y="${-r}" width="${size}" height="${size}" clip-path="url(#mf-${id}-${size})" preserveAspectRatio="xMidYMid slice"/>` : `<circle class="mf-bg" r="${r}"/><text class="mf-initial" y="${r * 0.3}" font-size="${r * 0.9}" text-anchor="middle">${esc(q.name[0])}</text>`}
      <path class="meter-track" d="${arcD(0, 0, R)}" stroke-width="${w}"/>
      <path class="meter-edge" d="${arcD(0, 0, R)}" stroke-width="${w + 3}" pathLength="1" stroke-dasharray="${q10(f)} 1"/>
      <path class="meter-fill lv-${level(f).cls}" d="${arcD(0, 0, R)}" stroke-width="${w}" pathLength="1" stroke-dasharray="${q10(f)} 1"/>
    </svg>`;
  }
  const bar = (f) => `<span class="tbar"><i class="lv-${level(f).cls}" style="width:${wpct(f)}"></i></span>`;
  // meter detail in a person's card (Andrea: the family's)
  function meterBlock(id) {
    const f = prepScore(id), lv = level(f), rosa = id === 'rosa';
    return `<div class="pblock meter-block">
      <h3>${rosa ? 'Family preparedness' : 'Preparedness'}</h3>
      <div class="meter-head">${meterFace(id, 52)}<div><p class="meter-pct lv-${lv.cls}">${big10(f)}</p><p class="meter-lv"><span class="lv-tag lv-${lv.cls}">${lv.label}</span>${rosa ? 'the family on average' : `${sum(prepOf(id))} of ${PREP_TOTAL} tasks`}</p></div></div>
      <ul class="topic-bars">${PREP.map((t, ti) => { const tf = topicScore(id, ti); return `<li><span class="tname">${t.name}</span>${bar(tf)}<span class="tnum">${rosa ? pct(tf) : `${sum(prepOf(id)[ti])}/${t.tasks.length}`}</span></li>`; }).join('')}</ul>
      ${rosa ? `<div class="member-row">${PREP_MEMBERS.map((m) => `<a class="member" href="#/family/${m}" data-person="${m}" title="${m === 'giulia' ? 'You' : esc(PEOPLE[m].name)}: ${pct(prepScore(m))}">
        <span class="member-pct">${pct(prepScore(m))}</span>${meterFace(m, 44)}<span class="member-name">${m === 'giulia' ? 'You' : esc(PEOPLE[m].name)}</span></a>`).join('')}</div>` : ''}
    </div>`;
  }
  // your card: your meter, what to do next, and your full to-do list
  const prepOpen = new Set();   // topics you opened in your list
  function prepCard() {
    const f = prepScore('giulia'), lv = level(f);
    // suggestions: the next unfinished task of each of your weakest topics
    const next = PREP.map((t, ti) => ({ ti, s: topicScore('giulia', ti), i: state.prep[ti].indexOf(0) })).filter((x) => x.i >= 0).sort((a, b) => a.s - b.s || a.ti - b.ti).slice(0, 3);
    return `<section class="list-card fam-list prep-card" aria-label="Your preparedness">
      <div class="list-head"><h2>Your preparedness</h2><span>${sum(state.prep)} of ${PREP_TOTAL} done</span></div>
      <div class="meter-head">${meterFace('giulia', 60)}<div><p class="meter-pct lv-${lv.cls}">${big10(f)}</p><p class="meter-lv"><span class="lv-tag lv-${lv.cls}">${lv.label}</span></p></div></div>
      ${next.length ? `<div class="grp"><p class="grp-t">Do next to improve</p>${next.map(({ ti, i }) => `
        <button class="sugg-btn" type="button" data-prepdo="${ti}:${i}"><span class="sugg-t">${esc(PREP[ti].tasks[i])}</span><span class="sugg-topic">${esc(PREP[ti].name)}</span><span class="sugg-done">Done ${icon('check')}</span></button>`).join('')}</div>`
        : '<p class="meter-lv">You have done everything on your list.</p>'}
      <div class="grp"><p class="grp-t">Your to-do list</p>
      ${PREP.map((t, ti) => { const n = sum(state.prep[ti]); return `<details class="ptopic" data-topic="${ti}" ${prepOpen.has(ti) ? 'open' : ''}>
        <summary><span class="tname">${t.name}</span>${bar(n / t.tasks.length)}<span class="tnum">${n}/${t.tasks.length}</span></summary>
        ${t.tasks.map((task, i) => `<label class="it ${state.prep[ti][i] ? 'is-done' : ''}"><input type="checkbox" data-prep="${ti}:${i}" ${state.prep[ti][i] ? 'checked' : ''}><span class="box" aria-hidden="true">${icon('check')}</span><span class="it-t">${esc(task)}</span></label>`).join('')}
      </details>`; }).join('')}
      </div>
    </section>`;
  }

  // the person's active services, stacked at the end of their card
  function svcStack(id) {
    const list = svcOf(id).filter((k) => isActive(k));
    return `<div class="svc-stack"><h3>Active services</h3>
      <div class="svc-row">
      ${list.map((k) => `<a class="svc-chip" href="#/family/svc-${k}" data-stop="${k}" title="${esc(MAP_SVC[k].name)} · ${esc(SERVICE_DONE[k].soon)}">
        <span class="svc-chip-ico">${icon(MAP_SVC[k].icon)}</span><span class="svc-chip-name">${esc(MAP_SVC[k].name)}</span><span class="svc-chip-when">${esc(SERVICE_DONE[k].soon)}</span></a>`).join('')}
      <a class="svc-chip add" href="#/services"><span class="svc-chip-ico">${icon('add')}</span><span class="svc-chip-name">Add</span><span class="svc-chip-when">a service</span></a>
      </div></div>`;
  }
  const sidePanel = () => (selSvc ? svcDetail(selSvc) : selected && selected !== 'giulia' ? profile(selected) : overview());
  // a service you tapped on the map: what it is, who looks after it, and one button that stays at the bottom
  function svcDetail(k) {
    const m = MAP_SVC[k], d = SVC.find((x) => x.id === k), on = isActive(k);
    const people = m.people.map((id) => (id === 'giulia' ? 'You' : PEOPLE[id].name)).join(' & ');
    return `
      <article class="card profile2 svc-detail ${on ? 'is-on' : ''}" aria-label="${esc(m.name)}">
        <div class="banner svc-banner"><span class="svc-detail-ico">${icon(m.icon)}</span></div>
        <div class="pinfo">
          <h2 class="pname">${esc(m.name)}</h2>
          <p class="prel">${esc(d.who)} <span class="sep" aria-hidden="true">·</span> ${esc(d.cost)}</p>
          <p class="paddr">${esc(d.dist)} from Andrea · ${esc(d.walk)}</p>
        </div>
        <div class="pblock"><h3>What it is</h3><p class="svc-what">${esc(d.what)}</p></div>
        <div class="pblock"><h3>Status</h3>
          <p class="svc-status">${on ? `<span class="svc-btn-on">Active</span> For Andrea · next: ${esc(SERVICE_DONE[k].soon)}` : '<span class="svc-off">Not opted in</span> Andrea doesn\'t use this yet'}</p>
          ${on ? `<p class="svc-when">${esc(SERVICE_DONE[k].when)}</p>` : ''}</div>
        <div class="pblock"><h3>Looked after by</h3><p class="svc-people">${m.people.map((id) => `<a class="mini" href="#/family/${id}" data-person="${id}" title="${esc(PEOPLE[id].name)}">${mini(id)}</a>`).join('')}<span>${esc(people)}</span></p></div>
        <div class="pfoot">${on
          ? `<a class="view-btn as-link" href="#/services/${k}">See it on the Services page</a>`
          : `<button class="connect" type="button" data-action="${k}" data-who="rosa">Opt in for Andrea</button>`}</div>
      </article>`;
  }
  function profile(id) {
    const p = PEOPLE[id], on = isConnected(id);
    const title = id === 'rosa' ? `Dad | ${p.full}` : p.full;
    return `
      <article class="card profile2 ${on ? 'is-on' : ''}" aria-label="${esc(p.name)}'s details">
        <div class="banner">${p.photo ? `<img src="${p.photo}" alt="${esc(p.full)}" style="object-position:${FOCUS[id] || '50% 40%'}">` : `<span class="initial-xl" aria-hidden="true">${esc(p.name[0])}</span>`}</div>
        <div class="pinfo">
          <h2 class="pname">${esc(title)}</h2>
          <p class="prel">${esc(REL[id][0])}${INSURED[id] ? ` <span class="sep" aria-hidden="true">·</span> <span class="ins">Per your insurance <b>Allianz</b></span>` : ''}</p>
          <p class="paddr">${esc(ADDR[id])}</p>
        </div>
        ${meterBlock(id)}
        ${on ? `
          ${APPTS[id].length ? `<div class="pblock"><h3>Upcoming appointments</h3><ul class="appts">${APPTS[id].map(([w, t]) => `<li><span>${w}</span><span>${t}</span></li>`).join('')}</ul></div>` : ''}
          <div class="pblock"><h3>Important documents</h3><ul class="docs">${DOCS[id].map((d2) => `<li><button type="button" data-doc="${esc(d2)}">${esc(d2)}</button></li>`).join('')}</ul></div>
          ${id !== 'rosa' && id !== 'giulia' ? shareBlock(id) : ''}
          ${svcStack(id)}
          <div class="pfoot"><button class="view-btn" type="button" data-viewdetails="${id}">View details</button></div>`
        : `
          ${shareBlock(id)}
          <div class="pfoot"><button class="connect" type="button" data-connect="${id}">${connectLabel(id)}</button></div>`}
      </article>`;
  }

  function openConnect(id) {
    let dlg = $('#connectDlg');
    if (!dlg) { dlg = document.createElement('dialog'); dlg.id = 'connectDlg'; dlg.className = 'connect-dlg'; document.body.appendChild(dlg); dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); }); }
    const n = esc(PEOPLE[id].name);
    dlg.innerHTML = `
      <form method="dialog" class="cd-form" data-connectform="${id}">
        <h2 class="cd-title">Quick checks!</h2>
        <label class="cd-opt"><input type="checkbox" name="share"><span class="cd-box" aria-hidden="true">${icon('check')}</span><span><b>Share</b> your medical information with ${n}</span></label>
        <label class="cd-opt"><input type="checkbox" name="receive" checked><span class="cd-box" aria-hidden="true">${icon('check')}</span><span><b>Receive</b> medical information from ${n}</span></label>
        <button class="connect" type="submit">Send connect request</button>
        <p class="cd-note">Your data is secured and private</p>
      </form>`;
    dlg.showModal();
  }
  let mtt;
  function mapToast(id) {
    const t = $('#mapToast'); if (!t) return;
    t.innerHTML = `<span class="mt-av">${mini(id)}<i>${icon('check')}</i></span><span>${esc(REL[id][0])} <b>${esc(PEOPLE[id].name)}</b> is now connected</span>`;
    t.classList.add('show'); clearTimeout(mtt); mtt = setTimeout(() => t.classList.remove('show'), 4200);
  }

  const showTag = (e, on) => { const n = e.target.closest && e.target.closest('.svcnode'); if (n) $('#tag-' + n.dataset.stop)?.classList.toggle('show', on); };
  ['pointerover', 'focusin'].forEach((t) => document.addEventListener(t, (e) => showTag(e, true)));
  ['pointerout', 'focusout'].forEach((t) => document.addEventListener(t, (e) => showTag(e, false)));

  /* ---------- the map can be dragged and zoomed; it always opens with you in the middle ---------- */
  let view = null, viewAnim = 0, mapZoom = 1;
  const ZOOM_MIN = 1, ZOOM_MAX = 2.4, ZOOM_STEP = 1.3;
  const CONTENT = { w: 1700, h: 1000 };   // the family around you, with room for names and pills
  function mapBox() { const m = $('#map'), r = m ? m.getBoundingClientRect() : { width: 1200, height: 800 }, pw = r.width || 1200, ph = r.height || 800, z = Math.min(pw / CONTENT.w, ph / CONTENT.h) * mapZoom; return { z, w: pw / z, h: ph / z }; }
  const baseView = (mb) => ({ x: -mb.w / 2, y: -mb.h / 2 + 30 });
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  // zoomed in, you can move further, so every part of the family stays reachable
  function clampView(v, mb) { const b = baseView(mb), sx = Math.max(450, (CONTENT.w - mb.w) / 2 + 150), sy = Math.max(320, (CONTENT.h - mb.h) / 2 + 150); return { x: clamp(v.x, b.x - sx, b.x + sx), y: clamp(v.y, b.y - sy, b.y + sy) }; }
  // zoom around a point of the map (the middle, or where the pointer is); names and pills keep their size
  function setZoom(nz, at) {
    const map = $('#map'); if (!map) return;
    nz = clamp(nz, ZOOM_MIN, ZOOM_MAX); if (Math.abs(nz - mapZoom) < 0.001) return;
    cancelAnimationFrame(viewAnim);
    const before = mapBox(); if (!view) view = baseView(before);
    const fx = at ? at.fx : 0.5, fy = at ? at.fy : 0.5, px = view.x + before.w * fx, py = view.y + before.h * fy;
    mapZoom = nz; map.innerHTML = mapSVG();
    const after = mapBox(); view = { x: px - after.w * fx, y: py - after.h * fy }; applyView(); zoomButtons();
  }
  function zoomButtons() { const i = $('[data-zoom="in"]'), o = $('[data-zoom="out"]'); if (i) i.disabled = mapZoom >= ZOOM_MAX - 0.001; if (o) o.disabled = mapZoom <= ZOOM_MIN + 0.001; }
  function applyView() { const s2 = $('#map > svg'); if (!s2) return; const mb = mapBox(); if (!view) view = baseView(mb); view = clampView(view, mb); s2.setAttribute('viewBox', `${view.x.toFixed(1)} ${view.y.toFixed(1)} ${mb.w.toFixed(1)} ${mb.h.toFixed(1)}`); s2.setAttribute('preserveAspectRatio', 'xMidYMid meet'); }
  // everyone fits in view, so picking someone just glides the map back to you in the middle
  function focusOn() {
    if (!$('#map')) return;
    const to = baseView(mapBox());
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !view) { view = to; applyView(); return; }
    cancelAnimationFrame(viewAnim);
    const from = { ...view }, t0 = performance.now(), D = 600;
    const step = (t) => { const k = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - k, 3); view = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e }; applyView(); if (k < 1) viewAnim = requestAnimationFrame(step); };
    viewAnim = requestAnimationFrame(step);
  }
  let drag = null, dragMoved = false;
  document.addEventListener('pointerdown', (e) => { if (!e.target.closest('#map') || e.button !== 0) return; drag = { x: e.clientX, y: e.clientY, vx: view ? view.x : 0, vy: view ? view.y : 0 }; dragMoved = false; });
  document.addEventListener('pointermove', (e) => {
    if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!dragMoved && Math.hypot(dx, dy) < 5) return;
    dragMoved = true; cancelAnimationFrame(viewAnim); $('#map')?.classList.add('dragging');
    const mb = mapBox(); view = clampView({ x: drag.vx - dx / mb.z, y: drag.vy - dy / mb.z }, mb); applyView();
  });
  document.addEventListener('pointerup', () => { if (drag) { $('#map')?.classList.remove('dragging'); drag = null; } });
  document.addEventListener('click', (e) => { if (dragMoved && e.target.closest('#map')) { e.stopPropagation(); e.preventDefault(); dragMoved = false; } }, true);
  document.addEventListener('wheel', (e) => {
    if (!e.target.closest('#map') || isTablet()) return;
    e.preventDefault(); cancelAnimationFrame(viewAnim);
    if (e.ctrlKey) { const r = $('#map').getBoundingClientRect(); setZoom(mapZoom * Math.exp(-e.deltaY * 0.01), { fx: (e.clientX - r.left) / r.width, fy: (e.clientY - r.top) / r.height }); return; }
    const mb = mapBox(); view = clampView({ x: (view ? view.x : 0) + e.deltaX / mb.z, y: (view ? view.y : 0) + e.deltaY / mb.z }, mb); applyView();
  }, { passive: false });

  /* ---------- your steps (scripted assistant + checklist) ---------- */
  const ANSWERS = [
    { keys: ['home', 'living', 'alone', 'stay'], title: 'Help Andrea keep living at home',
      text: 'Andrea wants to stay in his flat. That is often possible with a little help. Step by step:',
      steps: ['Walk through the flat with Andrea: stairs, bathroom, light, rugs.', 'Ask him what is hard on a normal day.', 'Try one service for a week, like lunch delivery.', 'Check funding for home adjustments.', 'Decide who in the family looks after this topic.'] },
    { keys: ['dementia', 'forget', 'memory', 'confus'], title: 'Signs of dementia',
      text: 'Noticing changes in your dad is hard. If it happens more often, it is worth a check:',
      steps: ['Write down what you notice, with dates.', 'Book a visit with Dr. Ferri and bring your notes.', 'Ask about a memory check.', 'Make sure the power of attorney is signed in time.'] },
    { keys: ['hospital', 'urgent', 'fell', 'emergency'], title: 'Andrea is in hospital',
      text: 'I am sorry, that is a lot at once. You are not alone. Here is what to do, in order:',
      steps: ['Show the ward Andrea\'s emergency sheet.', 'Tell the nurse Andrea takes a blood thinner.', 'Ask who plans his discharge.', 'Update Marco and Sofia in era.', 'If it gets too much, call a care advisor.'] },
    { keys: ['pay', 'money', 'fund', 'cost'], title: 'Funding for home adjustments',
      text: 'Changes like grab rails or a walk-in shower can be partly paid for:',
      steps: ['List what is hard at home.', 'Ask social services for a home visit.', 'Get a price from an approved fitter.', 'Apply — a care advisor checks the form with you.'] },
  ];
  const SUGGEST = ['How can Andrea keep living at home?', 'Dad forgets things more often', 'Dad is in hospital. What now?', 'How do we pay for a shower?'];
  // buttons under an answer: [label, primary?, link or toast]
  const ANSWER_ACTIONS = {
    'Help Andrea keep living at home': [['See services near Andrea', true, '#/services'], ['Read: Living at home', false, '#/help']],
    'Signs of dementia': [['Book Dr. Ferri', true, 'toast:Request sent to Dr. Ferri\'s practice. They will call you back.'], ['Read: Dementia & memory', false, '#/help']],
    'Andrea is in hospital': [['Call a care advisor', true, 'urgent'], ['Open emergency sheet', false, 'urgent']],
    'Funding for home adjustments': [['Show funding office', true, '#/services/funding'], ['Talk to a care advisor', false, 'urgent']],
  };
  let chat = [{ me: false, html: '<p>Hello Isa. I know Andrea\'s situation, so you don\'t have to explain everything. What\'s on your mind?</p>' }];
  let pending = null, typing = false;
  if (!state.checklist.length) { // a first list, so the page never starts empty
    state.checklist = [{ title: 'Living at home', items: [{ text: 'Walk through the flat with Andrea', done: true }, { text: 'Try lunch delivery for a week', done: true }, { text: 'Check funding for a walk-in shower', done: false }] }];
    save();
  }
  const BOT_FACE = (cls = '') => `<img class="bot-face ${cls}" src="assets/ui/assistant.svg" alt="" aria-hidden="true">`;

  function steps() {
    return `
    <div class="chat-page">
      <section class="convo" aria-label="Ask era">
        <header class="convo-head">
          ${BOT_FACE()}
          <div><p class="convo-title">era assistant</p>
            <p class="knows"><span>Knows:</span><i>Andrea, 78</i><i>lives alone</i><i>irregular heartbeat</i><i>GP: Dr. Ferri</i></p></div>
        </header>
        <div class="log" id="log" aria-live="polite"></div>
        <div class="convo-foot">
          <div class="sugg">${SUGGEST.map((s) => `<button class="q" type="button" data-q="${esc(s)}">${esc(s)}</button>`).join('')}</div>
          <form class="ask-bar" id="chatForm">
            <label class="sr-only" for="q">Your question</label>
            <input id="q" type="text" placeholder="How can I help you?" autocomplete="off">
            <button class="go" type="submit" aria-label="Send">${icon('arrow')}</button>
          </form>
          <p class="disclaimer">Guidance, not a diagnosis · For medical decisions talk to Dr. Ferri or a care advisor</p>
        </div>
      </section>
      <aside class="list-col">
        <section class="list-card" aria-label="Your list" id="list"></section>
        <a class="person-card" href="tel:+390000000000">
          <span><b>Rather talk to a person?</b><br><span>Care advisors · every day 8–20 · free</span></span>
          <span class="person-call" aria-hidden="true">${icon('phone')}</span>
        </a>
      </aside>
    </div>`;
  }
  function renderChat() {
    const log = $('#log'); if (!log) return;
    log.innerHTML = chat.map((m) => `<div class="m ${m.me ? 'm-me' : 'm-bot'}">${m.html}</div>`).join('') +
      (typing ? '<div class="m m-bot m-typing" aria-label="era is writing"><span></span><span></span><span></span></div>' : '');
    log.scrollTop = log.scrollHeight;
  }
  function renderList() {
    const box = $('#list'); if (!box) return;
    const all = state.checklist.flatMap((g) => g.items), done = all.filter((i) => i.done).length;
    box.innerHTML = `
      <div class="list-head"><h2>Your list</h2><span>${done} of ${all.length} done</span></div>
      <div class="bar" aria-hidden="true"><span style="width:${all.length ? Math.round(done / all.length * 100) : 0}%"></span></div>
      ${state.checklist.map((g, gi) => `
        <div class="grp"><p class="grp-t">${esc(g.title)}</p>
        ${g.items.map((it, ii) => `<label class="it ${it.isNew && !it.done ? 'is-new' : ''} ${it.done ? 'is-done' : ''}">
          <input type="checkbox" data-check="${gi}:${ii}" ${it.done ? 'checked' : ''}><span class="box" aria-hidden="true">${icon('check')}</span>
          <span class="it-t">${esc(it.text)}</span>${it.isNew && !it.done ? '<span class="new">new</span>' : ''}</label>`).join('')}</div>`).join('')}`;
  }
  function ask(q) {
    q = q.trim(); if (!q || typing) return;
    chat.push({ me: true, html: `<p>${esc(q)}</p>` });
    typing = true; renderChat();
    setTimeout(() => {
      typing = false;
      const a = ANSWERS.find((x) => x.keys.some((k) => q.toLowerCase().includes(k)));
      if (a) {
        if (!state.checklist.some((g) => g.title === a.title)) { state.checklist.unshift({ title: a.title, items: a.steps.map((text) => ({ text, done: false, isNew: true })) }); save(); }
        const acts = ANSWER_ACTIONS[a.title] || [];
        chat.push({ me: false, html: `<p>${a.text}</p><ol class="nums">${a.steps.slice(0, 3).map((s) => `<li>${s}</li>`).join('')}</ol>
          <p class="added">${icon('check')} Added to your list</p>
          ${acts.length ? `<div class="m-acts">${acts.map(([l, primary, to]) => to.startsWith('#') ? `<a class="pill ${primary ? 'pill-blue' : 'pill-line'}" href="${to}">${l}</a>` : `<button class="pill ${primary ? 'pill-blue' : 'pill-line'}" type="button" data-chatact="${esc(to)}">${l}</button>`).join('')}</div>` : ''}` });
      } else {
        chat.push({ me: false, html: '<p>I\'m not sure I understood. Try one of the questions below — or talk to a care advisor, a real person.</p><div class="m-acts"><button class="pill pill-blue" type="button" data-chatact="urgent">Talk to a care advisor</button></div>' });
      }
      renderChat(); renderList();
    }, 800);
  }

  /* ---------- services ---------- */
  // map positions are in the 760×880 map drawing (Andrea's home in the middle)
  const SVC = [
    { id: 'food', img: 'assets/services/lunch-delivery.webp', cat: 'food', icon: 'food', name: 'Lunch delivery', who: 'Pranzo a Casa', cost: 'First week free', what: 'A warm lunch at the door, every day.', dist: '600 m', walk: '8 min walk', x: 260, y: 300 },
    { id: 'drive', img: 'assets/services/driving-service.webp', cat: 'transport', icon: 'car', name: 'Driving service', who: 'Bus Amico', cost: 'Free', what: 'Volunteer drivers to the doctor and hospital.', dist: '1.1 km', walk: '4 min by car', x: 600, y: 560 },
    { id: 'assist', img: 'assets/services/daily-care.webp', cat: 'home', icon: 'hand', name: 'Daily care assistant', who: 'Casa Serena', cost: 'Partly funded', what: 'Help with shopping, cleaning and medicines.', dist: '900 m', walk: '12 min walk', x: 220, y: 640 },
    { id: 'funding', img: 'assets/services/home-adjustments.webp', cat: 'funding', icon: 'home', name: 'Home adjustments', who: 'Social services', cost: 'Free advice', what: 'Advice and money for grab rails and showers.', dist: '1.6 km', walk: '6 min by car', x: 640, y: 220 },
    { id: 'pharmacy', img: 'assets/services/pharmacy-delivery.webp', cat: 'health', icon: 'cross', name: 'Pharmacy delivery', who: 'Farmacia del Borgo', cost: 'Free delivery 65+', what: 'Medicines delivered to Andrea\'s door.', dist: '300 m', walk: '4 min walk', x: 470, y: 330 },
  ];
  const SVC_CATS = [['all', 'All'], ['food', 'Food'], ['transport', 'Getting around'], ['home', 'Help at home'], ['health', 'Health'], ['funding', 'Funding']];
  let svcFilter = 'all', svcQuery = '', svcSel = null;
  const isActive = (id) => SERVICE_DONE[id] && state.active.some((a) => a.text === SERVICE_DONE[id].text);
  const svcVisible = () => SVC.filter((s) => (svcFilter === 'all' || s.cat === svcFilter) && (!svcQuery || (s.name + ' ' + s.who + ' ' + s.what).toLowerCase().includes(svcQuery.toLowerCase())));

  function services(sub) {
    svcSel = SVC.some((s) => s.id === sub) ? sub : (svcSel || null);
    return `
    <div class="svc-page">
      <div class="svc-left">
        <div class="svc-head"><h1 class="h1">Care made easy with us</h1>
          <p class="lead">Help close to Andrea's home in Bergamo. Ask with one click — era sends the request and keeps the family up to date.</p></div>
        <label class="svc-search">${icon('search')}<span class="sr-only">Search services</span>
          <input id="svcSearch" type="search" placeholder="Search for help, e.g. &quot;lunch&quot; or &quot;shower&quot;" value="${esc(svcQuery)}" autocomplete="off"></label>
        <div class="svc-chips" role="group" aria-label="Filter services">${SVC_CATS.map(([k, l]) => `<button type="button" data-svcfilter="${k}" aria-pressed="${k === svcFilter}">${l}</button>`).join('')}</div>
        <div class="svc-grid" id="svcGrid"></div>
      </div>
      <div class="svc-map"><div id="svcMap"></div>
        <a class="map-tip" href="#/steps" data-q="How can Andrea keep living at home?">${BOT_FACE('small')}<span><b>Not sure what Andrea needs?</b><br>Ask era — it suggests services that fit his day.</span></a>
      </div>
    </div>`;
  }
  function renderServices() {
    const grid = $('#svcGrid'); if (!grid) return;
    const list = svcVisible();
    grid.innerHTML = list.length ? list.map((s) => {
      const on = isActive(s.id);
      return `<article class="svc2 ${on ? 'is-active' : ''} ${svcSel === s.id ? 'is-sel' : ''}" id="svc-${s.id}" data-svcsel="${s.id}">
        ${s.img ? `<img class="svc2-img" src="${s.img}" alt="">` : '<div class="svc2-img" aria-hidden="true"></div>'}
        <div class="svc2-text"><h3>${s.name}</h3><p class="what">${s.what}</p></div>
        ${on ? `<p class="active-pill"><i></i>Active for Andrea · ${SERVICE_DONE[s.id].soon}</p>`
             : `<button class="ask-btn" type="button" data-action="${SERVICE_DONE[s.id] ? s.id : 'svc-' + s.id}" data-who="rosa">Ask for this ${icon('arrow')}</button>`}
      </article>`;
    }).join('') : '<p class="empty">No service matches. Try another word, or ask era.</p>';
    const vis = new Set(list.map((s) => s.id));
    const sel = SVC.find((s) => s.id === (svcSel || SVC.find((x) => isActive(x.id))?.id));
    const lw = (t, size) => t.length * size * 0.55 + 22;
    $('#svcMap').innerHTML = `<svg viewBox="0 0 760 880" preserveAspectRatio="xMidYMid slice" role="group" aria-label="Map of services around Andrea's home">
      <g class="m-roads"><path d="M-20 300 C 160 330, 260 380, 380 430 C 500 480, 620 470, 780 440"/><path d="M380 430 C 360 300, 330 160, 300 -20"/><path d="M380 430 C 400 560, 430 720, 460 900"/><path d="M-20 640 C 150 600, 260 520, 380 430"/><path d="M380 430 C 520 360, 640 240, 780 180"/><path d="M120 -20 C 140 120, 180 220, 260 280"/></g>
      <g class="m-rings"><circle cx="380" cy="430" r="160"/><circle cx="380" cy="430" r="279"/></g>
      <text class="m-ring-t" x="380" y="262" text-anchor="middle">500 m</text><text class="m-ring-t" x="380" y="143" text-anchor="middle">1 km</text>
      <text class="m-city" x="150" y="56">BERGAMO</text>
      ${sel ? `<path class="m-route" d="M380 430 L ${sel.x} ${sel.y}"/>` : ''}
      ${SVC.map((s) => { const on = sel && sel.id === s.id; const r = on ? 32 : 28; return `<g class="m-stop ${on ? 'on' : ''} ${vis.has(s.id) ? '' : 'dim'}" data-svcsel="${s.id}" role="button" tabindex="0" aria-label="${s.name}, ${s.dist}">
        <circle cx="${s.x}" cy="${s.y}" r="${r}"/><svg x="${s.x - 12}" y="${s.y - 12}" width="24" height="24" viewBox="0 -960 960 960" class="m-ico ms">${I[s.icon]}</svg>
        <rect x="${s.x - lw(s.who, 13) / 2}" y="${s.y + r + 8}" width="${lw(s.who, 13)}" height="24" rx="12"/><text x="${s.x}" y="${s.y + r + 24}" text-anchor="middle">${s.who}</text></g>`; }).join('')}
      ${sel ? (() => { const wx = sel.x + (380 - sel.x) * 0.6, wy = sel.y + (430 - sel.y) * 0.6 - 26; return `<g class="m-walk"><rect x="${wx - lw(sel.walk, 13) / 2}" y="${wy - 12}" width="${lw(sel.walk, 13)}" height="24" rx="12"/><text x="${wx}" y="${wy + 5}" text-anchor="middle">${sel.walk}</text></g>`; })() : ''}
      <defs><clipPath id="clip-home"><circle cx="380" cy="430" r="48"/></clipPath></defs>
      <circle class="m-home-ring" cx="380" cy="430" r="53"/>
      <image href="${PEOPLE.rosa.photo}" x="332" y="382" width="96" height="96" clip-path="url(#clip-home)" preserveAspectRatio="xMidYMid slice"/>
      <g class="m-home-l"><rect x="318" y="492" width="124" height="28" rx="14"/><text x="390" y="511" text-anchor="middle">Andrea's home</text>
        <svg x="326" y="499" width="14" height="14" viewBox="0 -960 960 960" class="m-ico-b ms">${I.home}</svg></g>
    </svg>`;
  }

  /* ---------- help desk ---------- */
  function help() {
    const topics = [['Health', 'Doctors, medicines and the emergency sheet.', 'What should be on Andrea\'s emergency sheet?'], ['Wishes', 'What matters to Andrea, in his own words.', 'How do we talk about wishes?'], ['Legal', 'Power of attorney and living will.', 'How do we set up a power of attorney?'], ['Living at home', 'Safety at home and help with daily tasks.', 'How can Andrea keep living at home?'], ['Money & funding', 'What care costs and what is paid for.', 'How do we pay for home adjustments?'], ['Dementia & memory', 'When forgetting is worth a check.', 'Dad forgets things more often']];
    return `
    <section class="page-head"><h1 class="h1">Help desk</h1><p class="lead">Talk to a real person, or read short, clear answers.</p></section>
    <div class="grid">
      <article class="card blue c5"><p class="title">Talk to a care advisor</p><p class="muted">Every day 8:00–20:00 · free</p>
        <div class="row"><a class="btn" style="background:#fff;color:var(--blue-deep)" href="tel:+390000000000">${icon('phone')} Call now</a></div></article>
      <article class="card c7" style="box-shadow:var(--shadow)">${topics.map(([t, d, q]) => `
        <a class="topic-link" href="#/steps" data-q="${esc(q)}"><span><span class="title" style="font-size:1.15rem;display:block">${t}</span><span class="small muted">${d}</span></span><span class="arrow">${icon('arrow')}</span></a>`).join('')}
      </article>
    </div>`;
  }

  /* ---------- login / first touchpoint (animated) ----------
     Storyboard "Login v4" in the team's Figma — see the stages below. */
  const LOGO_A = ['M14.7917 31.4889C11.9476 31.4889 9.40763 30.8432 7.17376 29.5499C4.93803 28.2584 3.18378 26.4837 1.91101 24.2311C0.638247 21.9786 0 19.4107 0 16.5292C0 13.8344 0.627051 11.3411 1.88302 9.04941C3.13899 6.75955 4.85591 4.92318 7.03566 3.53658C9.21355 2.15184 11.7068 1.45947 14.5155 1.45947C17.5444 1.45947 20.0918 2.10519 22.1614 3.39848C24.2292 4.69177 25.7987 6.41803 26.8699 8.57912C27.9411 10.7402 28.4767 13.1308 28.4767 15.7529C28.4767 16.3445 28.389 16.4173 28.389 16.8428C28.389 17.1488 28.1986 17.4399 27.9467 17.6994C27.3215 18.3432 26.4351 18.6661 25.5374 18.6474L5.40458 18.192C4.65249 18.192 4.04224 17.5818 4.04224 16.8297V14.4036C4.04224 13.6515 4.65249 13.0413 5.40458 13.0413H19.7633C20.7487 13.0413 21.3907 12.0036 20.9502 11.1228L20.9409 11.1023C20.6087 10.436 20.1459 9.82762 19.5562 9.27335C18.9646 8.71909 18.2535 8.26746 17.4231 7.91661C16.5926 7.56576 15.6408 7.39033 14.5696 7.39033C13.1662 7.39033 11.8822 7.75984 10.7196 8.49887C9.55693 9.23789 8.64248 10.2643 7.97811 11.5744C7.31373 12.8864 6.97968 14.4465 6.97968 16.2549C6.97968 18.0633 7.33053 19.7373 8.03223 21.0474C8.73393 22.3593 9.68383 23.3559 10.8857 24.0389C12.0857 24.722 13.4237 25.0635 14.9018 25.0635C16.6374 25.0635 18.0968 24.6846 19.2781 23.9269C20.1366 23.3783 20.8588 22.7251 21.4448 21.9711C21.8367 21.4654 22.5291 21.3105 23.102 21.5923L26.5508 23.2831C27.3047 23.6526 27.5492 24.6156 27.0677 25.3023C25.8752 27.0025 24.4233 28.391 22.7138 29.4678C20.5714 30.8152 17.9307 31.4907 14.7917 31.4907V31.4889Z', 'M31.6904 29.2398V3.70795C31.6904 2.95586 32.3007 2.34561 33.0528 2.34561H37.1417C37.8938 2.34561 38.504 2.95586 38.504 3.70795V6.11351H38.9482C39.4278 5.22706 40.0642 4.44324 40.8592 3.75834C41.6542 3.07343 42.5854 2.53036 43.6567 2.12353C44.7279 1.71856 45.8737 1.51514 47.0905 1.51514C47.8295 1.51514 48.4939 1.57112 49.0855 1.68123C49.2516 1.71296 49.4121 1.74655 49.567 1.78387C50.1903 1.93317 50.6363 2.47624 50.6363 3.11636V7.49079C50.6363 8.4015 49.7573 9.04722 48.8839 8.78781C48.7011 8.73369 48.5182 8.68144 48.3371 8.63291C47.5795 8.43136 46.777 8.32872 45.9279 8.32872C44.4871 8.32872 43.2405 8.6889 42.1879 9.40926C41.1354 10.1296 40.3329 11.1075 39.7786 12.3467C39.2244 13.5859 38.9482 14.9781 38.9482 16.5289V29.2398C38.9482 29.9918 38.3379 30.6021 37.5858 30.6021H33.0528C32.3007 30.6021 31.6904 29.9918 31.6904 29.2398Z', 'M78.1226 14.0337H74.1643C73.4778 14.0337 72.9214 14.5902 72.9214 15.2766V29.5457C72.9214 30.2322 73.4778 30.7887 74.1643 30.7887H78.1226C78.809 30.7887 79.3655 30.2322 79.3655 29.5457V15.2766C79.3655 14.5902 78.809 14.0337 78.1226 14.0337Z', 'M64.2855 0.260102C67.1292 0.210465 69.68 0.811752 71.9361 2.06586C74.194 3.31807 75.979 5.06197 77.2909 7.29194C78.6028 9.52192 79.2857 12.0783 79.336 14.9593C79.3831 17.6537 78.7996 20.1576 77.5838 22.4709C76.368 24.7823 74.6834 26.6483 72.5282 28.0728C70.3748 29.4953 67.894 30.2311 65.0858 30.2801C62.0573 30.333 59.4991 29.7318 57.4072 28.4748C55.3171 27.2178 53.7177 25.5192 52.609 23.3772C51.5002 21.2351 50.923 18.8542 50.8772 16.2325C50.8669 15.641 50.9533 15.5667 50.9459 15.1413C50.9405 14.8353 51.1258 14.5409 51.3732 14.2771C51.987 13.6225 52.8677 13.2842 53.7655 13.2872L73.9032 13.3911C74.6552 13.378 75.276 13.9775 75.2892 14.7295L75.3315 17.1552C75.3446 17.9071 74.7451 18.528 73.9931 18.5411L59.6366 18.7917C58.6514 18.8089 58.0276 19.8575 58.4833 20.7306L58.493 20.7509C58.8368 21.4113 59.3102 22.0115 59.9095 22.5554C60.5107 23.0993 61.2295 23.5384 62.0659 23.8747C62.9024 24.211 63.8571 24.3698 64.9281 24.3511C66.3313 24.3266 67.6086 23.9347 68.7582 23.1755C69.9078 22.4163 70.8042 21.3741 71.4456 20.0526C72.087 18.7293 72.3938 17.1635 72.3622 15.3554C72.3306 13.5473 71.9506 11.8797 71.2262 10.5821C70.5017 9.28256 69.5345 8.30272 68.3209 7.64076C67.1092 6.97877 65.7654 6.66066 64.2876 6.68645C62.5522 6.71674 61.0997 7.121 59.9318 7.89919C59.083 8.46275 58.3723 9.12844 57.7995 9.89251C57.4165 10.405 56.727 10.572 56.1492 10.3002L52.6714 8.66986C51.9111 8.31356 51.6499 7.35501 52.1193 6.65994C53.282 4.93925 54.7095 3.52566 56.3999 2.41917C58.5184 1.03458 61.147 0.313017 64.2855 0.258234L64.2855 0.260102Z'];
  const LOGO_B = 'M23.7523 34.9833C23.1761 34.9833 22.7154 35.4736 22.7604 36.0484C23.3635 43.596 30.3277 49.5698 38.801 49.5698C47.2742 49.5698 54.2385 43.596 54.8415 36.0484C54.888 35.4736 54.4259 34.9833 53.8496 34.9833L50.1061 34.9833C49.5975 34.9833 49.1833 35.3693 49.1241 35.8737C48.6 40.3527 44.1704 43.8623 38.7996 43.8623C33.4288 43.8623 28.9991 40.3527 28.475 35.8737C28.4158 35.3693 28.0016 34.9833 27.493 34.9833L23.7495 34.9833L23.7523 34.9833Z';
  const logoSVG = (cls = '') => `<svg class="era-logo ${cls}" viewBox="0 0 80 50" role="img" aria-label="era">${LOGO_A.map((d) => `<path class="la" d="${d}"/>`).join('')}<path class="lb" d="${LOGO_B}"/></svg>`;

  // Login v4 storyboard (Figma board, frame 1728×1117):
  //   0 start, empty grey · 1 three bubbles pop in · 2 lines join them · 3 bubbles and lines fade into the background
  //   · 4 the era logo comes forward out of the background · 5 the logo moves up and the login scrolls in under it.
  const FW = 1728, FH = 1117;
  const BUBS = [[467, 530, 68], [864, 666, 90], [1313, 429, 70]];   // x, y, r in the frame
  const LINKS = [[0, 1], [2, 1]];                                     // from the left and from the right, in to the middle bubble
  const BRAND = { 4: [864, 604, 300], 5: [864, 378, 150] };           // x, y, width of the logo
  const JOIN_TOP = 455;                                               // top of the login form in the frame
  const STEPS = [[400, 1], [1700, 2], [3100, 3], [3900, 4], [5500, 5]];  // ms → stage
  let introTimers = [], introStage = 0;

  function login() {
    return `
    <section class="intro" id="intro" aria-label="Welcome to era" data-stage="0">
      <svg class="intro-map" id="introMap" aria-hidden="true"></svg>
      <div class="brand" id="brand" aria-hidden="true">${logoSVG()}</div>
      <div class="join" id="join">
        <h1 class="sr-only">Welcome to era</h1>
        <p class="tagline">Care is something we share.</p>
        <form id="loginForm" class="join-form">
          <label class="sr-only" for="code">Your secure code from the letter</label>
          <input id="code" type="text" placeholder="Enter your secure code to join" autocomplete="off">
          <button class="join-btn" type="submit">Join now</button>
        </form>
        <a class="alt" href="#/login" data-skip>or join with your insurance ID</a>
      </div>
    </section>`;
  }

  // frame coordinates → screen pixels (the frame is scaled to cover the window, like CSS "cover")
  function introFit() { const w = window.innerWidth, h = window.innerHeight, s = Math.max(w / FW, h / FH); return { s, ox: (w - FW * s) / 2, oy: (h - FH * s) / 2 }; }
  // on narrow (portrait) screens the wide frame is cropped at the sides, so pull the bubbles inward
  const squeeze = () => Math.min(1, (FH * window.innerWidth / window.innerHeight) / FW * 0.94);
  function drawIntroMap() {
    const svgEl = $('#introMap'); if (!svgEl) return;
    const q = squeeze(), k = Math.max(0.55, Math.min(1, q * 1.6));
    const P = BUBS.map(([x, y, r]) => [FW / 2 + (x - FW / 2) * q, y, r * k]);
    const links = LINKS.map(([a, b]) => {
      const [x1, y1, r1] = P[a], [x2, y2, r2] = P[b], d = Math.hypot(x2 - x1, y2 - y1);
      const cx = (x1 + x2) / 2, cy = Math.max(y1, y2) + d * 0.16;             // the string sags below both bubbles
      const edge = (x, y, r) => { const dx = cx - x, dy = cy - y, l = Math.hypot(dx, dy); return [x + dx / l * (r + 6), y + dy / l * (r + 6)]; };
      const [sx, sy] = edge(x1, y1, r1), [ex, ey] = edge(x2, y2, r2);
      return `<path d="M${sx.toFixed(1)} ${sy.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}" pathLength="1"/>`;
    }).join('');
    svgEl.setAttribute('viewBox', `0 0 ${FW} ${FH}`);
    svgEl.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svgEl.innerHTML = `<g class="links">${links}</g>` + P.map(([x, y, r], i) => {
      const s = r * 0.36, sy = r * 0.08;
      return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><g class="bub" style="--i:${i}"><circle r="${r.toFixed(1)}"/>
        <path d="M${-s} ${sy} A${s} ${s} 0 0 0 ${s} ${sy}" stroke-width="${(r * 0.1).toFixed(1)}"/></g></g>`;
    }).join('');
    placeIntro();
  }
  // the logo and the form are HTML, placed in frame coordinates
  function placeIntro() {
    const f = introFit(), [bx, by, bw] = BRAND[introStage >= 5 ? 5 : 4];
    const brand = $('#brand'), join = $('#join');
    if (brand) Object.assign(brand.style, { width: bw * f.s + 'px', left: f.ox + bx * f.s + 'px', top: f.oy + by * f.s + 'px' });
    if (join) join.style.top = f.oy + JOIN_TOP * f.s + 'px';
  }
  function setIntroStage(st) {
    introStage = st;
    const el = $('#intro'); if (!el) return;
    el.dataset.stage = st;
    placeIntro();
  }
  function stopIntro() { introTimers.forEach(clearTimeout); introTimers = []; }
  function playIntro(skip) {
    stopIntro();
    const el = $('#intro'); if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.classList.add('instant');                  // jump without animating, then turn transitions back on
    setIntroStage(skip || reduce ? 5 : 0); drawIntroMap();
    void el.offsetWidth; el.classList.remove('instant');
    // a click during the animation skips straight to the login
    el.onclick = () => { if (introStage < 5) playIntro(true); };
    if (skip || reduce) { $('#code')?.focus({ preventScroll: true }); return; }
    STEPS.forEach(([ms, st]) => introTimers.push(setTimeout(() => setIntroStage(st), ms)));
    introTimers.push(setTimeout(() => $('#code')?.focus({ preventScroll: true }), STEPS[STEPS.length - 1][0] + 1100));
  }

  /* ---------- routing ---------- */
  const PAGES = { login, family, steps, services, help };
  const TITLES = { login: 'Welcome', family: 'Overview', steps: 'era assistant', services: 'Services', help: 'Help desk' };
  function render() {
    let [route0, sub] = location.hash.replace(/^#\/?/, '').split('/');
    if (route0 === 'overview') route0 = 'family';   // "Overview" in the menu is the family map page
    const route = PAGES[route0] ? route0 : 'login';
    if (route === 'family') { selected = sub && PEOPLE[sub] ? sub : null; selSvc = sub && sub.startsWith('svc-') && MAP_SVC[sub.slice(4)] ? sub.slice(4) : null; }
    document.body.classList.toggle('is-login', route === 'login');
    $$('[data-nav]').forEach((a) => (a.dataset.nav === route ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
    document.title = 'era – ' + TITLES[route];
    $('#main').innerHTML = PAGES[route](sub);
    if (route === 'steps') { renderChat(); renderList(); if (pending) { const q = pending; pending = null; ask(q); } }
    if (route === 'services') { renderServices(); if (sub) $('#svc-' + sub)?.scrollIntoView({ block: 'center' }); }
    if (route === 'login') playIntro(); else stopIntro();
    if (route === 'family') { view = null; applyView(); renderList(); }
    window.scrollTo(0, 0);
  }
  function refreshFamily() {
    if (!location.hash.startsWith('#/family')) return;
    $('#map').innerHTML = mapSVG(); applyView();
    const sc = $('.prep-card')?.scrollTop || 0;   // keep your place in your list while ticking
    $('#side').innerHTML = sidePanel();
    if ($('.prep-card')) $('.prep-card').scrollTop = sc;
  }
  window.addEventListener('hashchange', render);
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if ($('#map')) { $('#map').innerHTML = mapSVG(); applyView(); } if ($('#introMap')) { drawIntroMap(); } }, 150); });

  // R replays the login intro (for demos) — but not while typing in a field or with a modifier key held
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() !== 'r' || e.repeat || e.metaKey || e.ctrlKey || e.altKey || !$('#intro')) return;
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
    e.preventDefault(); playIntro();
  });

  document.addEventListener('toggle', (e) => { const t = e.target.dataset && e.target.dataset.topic; if (t !== undefined) { const n = Number(t); if (e.target.open) prepOpen.add(n); else prepOpen.delete(n); } }, true);

  /* ---------- events ---------- */
  let tt;
  function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 3600); }

  function pick(id) {
    selected = selected === id ? null : id; selSvc = null;
    history.replaceState(null, '', selected ? '#/family/' + selected : '#/family');
    refreshFamily(); focusOn();
    if (selected && isTablet()) $('#side').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function pickSvc(k) {
    selSvc = selSvc === k ? null : k; selected = null;
    history.replaceState(null, '', selSvc ? '#/family/svc-' + selSvc : '#/family');
    refreshFamily(); focusOn();
    if (selSvc && isTablet()) $('#side').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  document.addEventListener('click', (e) => {
    // tapping the empty map closes the person or service card
    if (e.target.closest('#map') && !e.target.closest('.person, .stop') && (selected || selSvc)) { selected = null; selSvc = null; history.replaceState(null, '', '#/family'); refreshFamily(); return; }
    const t = e.target.closest('[data-person], [data-zoom], [data-prepdo], [data-connect], [data-doc], [data-viewdetails], [data-skip], [data-svcfilter], [data-svcsel], [data-chatact], [data-stop], [data-action], [data-q], [data-check], [data-notify], [data-close]');
    if (!t) return;
    const d = t.dataset;
    if (d.person) { pick(d.person); return; }
    if (d.zoom) { setZoom(d.zoom === 'in' ? mapZoom * ZOOM_STEP : mapZoom / ZOOM_STEP); return; }
    if (d.prepdo) { const [ti, i] = d.prepdo.split(':').map(Number); state.prep[ti][i] = 1; save(); refreshFamily(); toast(`Done — your preparedness is now ${pct(prepScore('giulia'))}.`); return; }
    if (d.connect) { openConnect(d.connect); return; }
    if (d.doc) { toast(`${d.doc} opens here (demo).`); return; }
    if (d.viewdetails) { toast(`${PEOPLE[d.viewdetails].name}'s full profile opens here (demo).`); return; }
    if (d.svcfilter) { svcFilter = d.svcfilter; $$('[data-svcfilter]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.svcfilter === svcFilter)); renderServices(); return; }
    if (d.chatact) { if (d.chatact === 'urgent') $('#urgent').showModal(); else toast(d.chatact.replace(/^toast:/, '')); return; }
    if (d.svcsel && !e.target.closest('button, a')) { svcSel = svcSel === d.svcsel ? null : d.svcsel; renderServices(); return; }
    if (d.skip !== undefined) { e.preventDefault(); playIntro(true); $('#code')?.focus(); return; }
    if (d.stop) { if ($('#map')) pickSvc(d.stop); else location.hash = '#/services/' + d.stop; return; }
    if (d.action) {
      const s = SERVICE_DONE[d.action];
      if (s) {
        if (!state.active.some((a) => a.text === s.text)) { state.active.unshift({ text: s.text, when: s.when }); save(); }
        toast(s.toast);
        if (location.hash.startsWith('#/family')) refreshFamily(); else render();
      } else if (d.action.startsWith('svc-')) { toast('Request sent. The service will call you within one working day.'); }
      return;
    }
    if (d.q) {
      if (location.hash.startsWith('#/steps')) { e.preventDefault(); ask(d.q); } else { pending = d.q; }
      return;
    }
    if (d.notify !== undefined) { toast('Marco and Sofia got a message: "Andrea needs help — please check era."'); return; }
    if (d.close !== undefined) { $('#urgent').close(); }
  });
  document.addEventListener('keydown', (e) => {
    const g = e.target.closest && e.target.closest('.person, .stop, .m-stop');
    if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); if (g.dataset.person) pick(g.dataset.person); else g.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
  });
  document.addEventListener('input', (e) => { if (e.target.id === 'svcSearch') { svcQuery = e.target.value; renderServices(); } });
  document.addEventListener('change', (e) => {
    const c = e.target.dataset.check;
    const pr = e.target.dataset.prep;
    if (pr) { const [ti, i] = pr.split(':').map(Number); state.prep[ti][i] = e.target.checked ? 1 : 0; save(); refreshFamily(); return; }
    if (c) { const [gi, ii] = c.split(':').map(Number); state.checklist[gi].items[ii].done = e.target.checked; state.checklist[gi].items[ii].isNew = false; save(); renderList(); }
  });
  document.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    if (f.dataset.connectform) { const id = f.dataset.connectform; if (!state.connected.includes(id)) { state.connected.push(id); save(); } $('#connectDlg').close(); refreshFamily(); mapToast(id); return; }
    if (f.id === 'loginForm') { location.hash = '#/family'; return; }
    if (f.id === 'chatForm') { const i = $('#q'); ask(i.value); i.value = ''; return; }
    if (f.dataset.ask !== undefined) { const v = $('input', f).value.trim(); if (v) { pending = v; location.hash = '#/steps'; } }
  });
  const dlg = $('#urgent');
  $('#urgentBtn').addEventListener('click', () => dlg.showModal());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

  /* text size */
  const SIZES = [15, 17, 19, 21];
  let si = Math.min(3, Math.max(0, store.get('ts', 0)));
  function applySize() { document.documentElement.style.fontSize = SIZES[si] + 'px'; $('#tsDown').disabled = si === 0; $('#tsUp').disabled = si === 3; store.set('ts', si); }
  $('#tsDown').addEventListener('click', () => { if (si > 0) { si--; applySize(); } });
  $('#tsUp').addEventListener('click', () => { if (si < 3) { si++; applySize(); } });
  applySize();
  render();
})();
