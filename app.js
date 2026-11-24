/* era website — clickable prototype with made-up example data.
   Routes: #/login · #/family · #/family/<id> · #/steps · #/services[/<id>] · #/help */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem('era2:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('era2:' + k, JSON.stringify(v)); } catch (e) { /* fine */ } },
  };
  // Material Symbols Outlined (weight 400, fill 0, 24px) — fonts.google.com/icons
  const I = {
    arrow: '<path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z"/>',  // arrow_forward
    back: '<path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"/>',  // arrow_back
    food: '<path d="M280-80v-366q-51-14-85.5-56T160-600v-280h80v280h40v-280h80v280h40v-280h80v280q0 56-34.5 98T360-446v366h-80Zm400 0v-320H560v-280q0-83 58.5-141.5T760-880v800h-80Z"/>',  // restaurant
    car: '<path d="M240-200v40q0 17-11.5 28.5T200-120h-40q-17 0-28.5-11.5T120-160v-320l84-240q6-18 21.5-29t34.5-11h440q19 0 34.5 11t21.5 29l84 240v320q0 17-11.5 28.5T800-120h-40q-17 0-28.5-11.5T720-160v-40H240Zm-8-360h496l-42-120H274l-42 120Zm-32 80v200-200Zm100 160q25 0 42.5-17.5T360-380q0-25-17.5-42.5T300-440q-25 0-42.5 17.5T240-380q0 25 17.5 42.5T300-320Zm360 0q25 0 42.5-17.5T720-380q0-25-17.5-42.5T660-440q-25 0-42.5 17.5T600-380q0 25 17.5 42.5T660-320Zm-460 40h560v-200H200v200Z"/>',  // directions_car
    hand: '<path d="M480-480v-400q0-17 11.5-28.5T520-920q17 0 28.5 11.5T560-880v400h-80Zm-160 0v-360q0-17 11.5-28.5T360-880q17 0 28.5 11.5T400-840v360h-80ZM500-40q-142 0-241-99t-99-241v-380q0-17 11.5-28.5T200-800q17 0 28.5 11.5T240-760v380q0 109 75.5 184.5T500-120q109 0 184.5-75.5T760-380v-140q-17 0-28.5 11.5T720-480v160H600q-33 0-56.5 23.5T520-240v40h-80v-40q0-66 47-113t113-47h40v-400q0-17 11.5-28.5T680-840q17 0 28.5 11.5T720-800v207q10-3 19.5-5t20.5-2h80v220q0 142-99 241T500-40Zm40-320Z"/>',  // front_hand
    home: '<path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z"/>',  // home
    msg: '<path d="M240-400h320v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z"/>',  // chat
    phone: '<path d="M798-120q-125 0-247-54.5T329-329Q229-429 174.5-551T120-798q0-18 12-30t30-12h162q14 0 25 9.5t13 22.5l26 140q2 16-1 27t-11 19l-97 98q20 37 47.5 71.5T387-386q31 31 65 57.5t72 48.5l94-94q9-9 23.5-13.5T670-390l138 28q14 4 23 14.5t9 23.5v162q0 18-12 30t-30 12ZM241-600l66-66-17-94h-89q5 41 14 81t26 79Zm358 358q39 17 79.5 27t81.5 13v-88l-94-19-67 67ZM241-600Zm358 358Z"/>',  // call
    check: '<path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>',  // check
    search: '<path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/>',  // search
    pin: '<path d="M536.5-503.5Q560-527 560-560t-23.5-56.5Q513-640 480-640t-56.5 23.5Q400-593 400-560t23.5 56.5Q447-480 480-480t56.5-23.5ZM480-186q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z"/>',  // location_on
    cross: '<path d="M120-120v-80l80-240-80-240v-80h508l58-160 94 34-46 126h106v80l-80 240 80 240v80H120Zm320-160h80v-120h120v-80H520v-120h-80v120H320v80h120v120Zm-236 80h552l-80-240 80-240H204l80 240-80 240Zm276-240Z"/>',  // local_pharmacy
  };
  const icon = (n) => `<svg class="ms" viewBox="0 -960 960 960" aria-hidden="true">${I[n]}</svg>`;

  /* ---------- people (photos from the team's Figma) ---------- */
  const PEOPLE = {
    rosa:   { name: 'Rosa',   role: 'Mum',           full: 'Rosa Bianchi',  born: '10.11.1948', photo: 'assets/people/rosa.jpg' },
    giulia: { name: 'Andrea', role: 'You',           full: 'Andrea Bianchi', born: '02.04.1975', photo: 'assets/people/giulia.jpg' },
    marco:  { name: 'Marco',  role: 'Brother',       full: 'Marco Bolognini', born: '19.07.1972', photo: 'assets/people/marco.jpg' },
    sofia:  { name: 'Sofia',  role: 'Granddaughter', full: 'Sofia Rossi',   born: '30.01.2005', photo: 'assets/people/sofia.jpg' },
    lucia:  { name: 'Lucia',  role: 'Neighbour',     full: 'Lucia Conti',   born: '',           photo: null },
  };
  const DETAILS = {
    rosa: {
      relation: 'Mum', sub: 'Via Pignolo 12, Bergamo · 50 min from you',
      appts: [['Thu 26 Nov', 'Dr. Ferri (GP) — check-up, 10:00'], ['Tue 8 Dec', 'Cardiologist — heart check, 9:30']],
      info: ['Irregular heartbeat · 4 medicines a day', 'Allergic to penicillin', 'Wants to stay at home as long as possible'],
      actions: [['food', 'Order food', 'food'], ['drive', 'Get driving assistance', 'car']],
    },
    giulia: { relation: 'You', sub: 'Lives in Milan · 50 min away', appts: [['Thu 26 Nov', 'Goes with Rosa to Dr. Ferri']], info: ['Looks after Wishes and Health', "Rosa's main contact"], actions: [] },
    marco: { relation: 'Brother', sub: 'Lives in Bergamo · 10 min away', appts: [['Fri 4 Dec', 'Notary — power of attorney, 15:00']], info: ['Looks after Legal and Money', 'Can drive Rosa on Thursdays'], actions: [['msg', 'Send Marco a message', 'msg'], ['call', 'Call Marco', 'phone']] },
    sofia: { relation: 'Granddaughter', sub: 'Student in Bergamo', appts: [['Every Wed', 'Visits Nonna · tech help']], info: ['Helps Rosa with the phone and the app'], actions: [['msg', 'Send Sofia a message', 'msg'], ['call', 'Call Sofia', 'phone']] },
    lucia: { relation: 'Neighbour', sub: 'Lives next door · has a key', appts: [], info: ['Can see the emergency sheet only', 'Checks on Rosa in the evening'], actions: [['call', 'Call Lucia', 'phone']] },
  };
  const TOPICS = [['Wishes', 'ready'], ['Health', 'almost'], ['Legal', 'ready'], ['Living at home', 'todo'], ['Money & funding', 'todo']];
  const CHIP = { ready: ['chip-ready', 'Ready'], almost: ['chip-almost', 'Almost ready'], todo: ['chip-todo', 'Not started'] };
  const SERVICE_DONE = {
    food: { soon: 'tomorrow 12:00', text: 'Lunch delivery — Pranzo a Casa', when: 'Every day at 12:00 · starts tomorrow', toast: 'Lunch is ordered for Rosa. It arrives tomorrow at 12:00.' },
    drive: { soon: 'Thu 9:30', text: 'Driving service — Bus Amico', when: 'Thu 26 Nov · pick-up 9:30 to Dr. Ferri', toast: 'A driver picks Rosa up on Thursday at 9:30.' },
    assist: { soon: 'Mon 9:00', text: 'Daily care assistant — Casa Serena', when: 'First visit Mon 30 Nov · 9:00', toast: 'Casa Serena will call you to plan the first visit.' },
    funding: { soon: 'in review', text: 'Home adjustment funding', when: 'Application started · a care advisor checks it', toast: 'Your funding application is started. A care advisor will call you.' },
  };
  const SERVICES = [
    { id: 'food', icon: 'food', name: 'Food delivery', who: 'Pranzo a Casa', what: 'A warm lunch at the door, every day.', dist: '600 m from Rosa', cost: 'First week free' },
    { id: 'drive', icon: 'car', name: 'Driving service', who: 'Bus Amico', what: 'Volunteer drivers to the doctor and the hospital.', dist: '1.1 km from Rosa', cost: 'Free' },
    { id: 'assist', icon: 'hand', name: 'Daily care assistant', who: 'Casa Serena', what: 'Help with shopping, cleaning and taking medicines.', dist: '900 m from Rosa', cost: 'Partly funded' },
    { id: 'funding', icon: 'home', name: 'Funding for home adjustments', who: 'Social services Bergamo', what: 'Money and advice for grab rails, showers and ramps.', dist: '1.6 km from Rosa', cost: 'Free advice' },
  ];

  let state = store.get('state', { active: [], checklist: [] });
  const save = () => store.set('state', state);

  /* ---------- the family map (Figma "Family" layout) ----------
     You sit in the middle, in focus; the family sits around you, joined by thin 2px lines.
     Coordinates are relative to you at (0, 0). `where` = city · travel time from you. */
  const MAPP = {
    giulia: { x: 0, y: 0, r: 78, where: 'Milano' },
    rosa:   { x: -360, y: -300, r: 66, where: 'Bergamo · 50 min' },
    lucia:  { x: -730, y: -250, r: 46, where: 'Bergamo · 50 min' },
    sofia:  { x: 360, y: -320, r: 56, where: 'Bergamo · 55 min' },
    marco:  { x: -600, y: 190, r: 58, where: 'Bergamo · 50 min' },
  };
  const FAM_LINKS = [['giulia', 'rosa'], ['giulia', 'sofia'], ['giulia', 'marco'], ['rosa', 'lucia'], ['rosa', 'sofia'], ['rosa', 'marco']];
  const PEOPLE_ORDER = ['giulia', 'rosa', 'sofia', 'marco', 'lucia'];   // the order they appear in
  // Rosa's services sit on her line to the person who looks after them: [line from, line to, how far along, who is part of it]
  const MAP_SVC = {
    food:    { name: 'Food delivery', icon: 'food', on: ['giulia', 'rosa', 0.33], people: ['giulia', 'rosa'] },
    assist:  { name: 'Day care assistant', icon: 'hand', on: ['rosa', 'sofia', 0.5], people: ['sofia', 'rosa'] },
    drive:   { name: 'Driving assistant', icon: 'car', on: ['rosa', 'marco', 0.5], people: ['marco', 'rosa'] },
    funding: { name: 'Home adjustments', icon: 'home', on: ['rosa', 'marco', 0.74], people: ['marco', 'rosa'] },
  };
  let selected = null;
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
  const svcOf = (id) => Object.keys(MAP_SVC).filter((k) => MAP_SVC[k].people.includes(id));
  const lineHl = (a, b) => !!selected && svcOf(selected).some((k) => { const [x, y] = MAP_SVC[k].on; return (x === a && y === b) || (x === b && y === a); });
  const hasLink = (a, b) => FAM_LINKS.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  // from you to the person you picked: directly, or through Rosa
  const routeTo = (id) => (id === 'giulia' ? '' : hasLink('giulia', id) ? link('giulia', id) : link('giulia', 'rosa') + ' ' + link('rosa', id));
  const textW = (s, size) => s.length * size * 0.52;
  const PIN = 'M536.5-503.5Q560-527 560-560t-23.5-56.5Q513-640 480-640t-56.5 23.5Q400-593 400-560t23.5 56.5Q447-480 480-480t56.5-23.5ZM480-186q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z';

  // map units → screen pixels; before the map is on the page, estimate it from the window
  function mapZ() {
    if ($('#map')) return mapBox().z;
    const w = window.innerWidth, small = w <= 1020;
    const pw = small ? w - 28 : w - 64 - Math.min(460, Math.max(340, w * 0.28)), ph = small ? pw / 1.3 : Math.min(1000, Math.max(600, window.innerHeight - 110));
    return Math.min(pw / CONTENT.w, ph / CONTENT.h);
  }
  function mapSVG(enter) {
    const small = window.innerWidth <= 1020;
    const z = mapZ(), u = (px) => px / z;           // text sizes in screen pixels, whatever the map's scale
    const ns = u(small ? 13 : 16), ls = u(12.5), ss = u(11.5);
    let s = '';
    s += `<g class="links">${FAM_LINKS.map(([a, b], i) => `<path class="link ${lineHl(a, b) ? 'hl' : ''}" d="${link(a, b)}" pathLength="1" style="--i:${i}"/>`).join('')}</g>`;
    // the route to the person you picked draws itself, and a dashed flow keeps travelling along it
    if (selected) { const d = routeTo(selected); if (d.trim()) s += `<path class="route" d="${d}" pathLength="1"/><path class="route-flow" d="${d}"/>`; }
    // services on the lines: blue when active (opted in), white when not; the picked person's ones light up
    const mine = selected ? svcOf(selected) : [];
    let tags = '';   // names, drawn last so nothing covers them; shown on hover or keyboard focus
    s += Object.entries(MAP_SVC).map(([k, v]) => {
      const { x, y } = alongLink(...v.on), on = isActive(k), hl = mine.includes(k), dim = selected && !hl;
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
      const ly = p.y + p.r + (you ? 22 : 14) + ns;
      const pinW = textW(p.where, ls) + ls * 2.9, pinH = ls * 2, py = ly + ls * 0.8, pc = py + pinH / 2, ic = ls * 1.25;
      const px = p.x - pinW / 2 + ls * 0.7;
      return `
      <g class="person ${selected === id ? 'sel' : ''} ${you ? 'is-you' : ''}" data-person="${id}" role="button" tabindex="0" style="--i:${PEOPLE_ORDER.indexOf(id)}" aria-pressed="${selected === id}" aria-label="${you ? 'You' : `${esc(who.name)}, ${esc(who.role)}`}, ${esc(p.where)}. Show details">
        ${selected === id || (you && !selected) ? `<circle class="sel-ring" cx="${p.x}" cy="${p.y}" r="${p.r + 6}"/>` : ''}
        <circle class="halo" cx="${p.x}" cy="${p.y}" r="${p.r + 16}"/><circle class="edge" cx="${p.x}" cy="${p.y}" r="${p.r + 1}"/>
        ${who.photo
    ? `<image href="${who.photo}" x="${p.x - p.r}" y="${p.y - p.r}" width="${p.r * 2}" height="${p.r * 2}" clip-path="url(#clip-${id})" preserveAspectRatio="xMidYMid slice"/>`
    : `<circle class="initial-bg" cx="${p.x}" cy="${p.y}" r="${p.r}"/><text class="initial" x="${p.x}" y="${p.y + p.r * 0.12}" font-size="${p.r * 0.8}" text-anchor="middle">${esc(who.name[0])}</text>`}
        <text class="name" x="${p.x}" y="${ly}" font-size="${you ? ns * 1.15 : ns}" text-anchor="middle">${you ? 'You' : `${esc(who.name)}${small ? '' : `<tspan class="role" font-size="${ls + 1}"> · ${esc(who.role)}</tspan>`}`}</text>
        ${small ? '' : `<g class="where"><rect x="${p.x - pinW / 2}" y="${py}" width="${pinW}" height="${pinH}" rx="${pinH / 2}"/>
          <svg class="pin ms" x="${px}" y="${pc - ic / 2}" width="${ic}" height="${ic}" viewBox="0 -960 960 960"><path d="${PIN}"/></svg>
          <text x="${px + ic + ls * 0.35}" y="${pc + ls * 0.36}" font-size="${ls}">${esc(p.where)}</text></g>`}
      </g>`;
    }).join('');
    return `<svg class="${enter ? 'enter' : ''}" role="group" aria-label="Map of Rosa's family around you"><defs>${defs}</defs>${s}<g class="svc-tags" aria-hidden="true">${tags}</g></svg>`;
  }

  function family() {
    return `
    <div class="fam">
      <section class="fam-map" aria-label="Rosa's family">
        <p class="panel-title">Rosa's circle of care · 5 people</p>
        <div class="map" id="map">${mapSVG(true)}</div>
        <div class="map-toast" id="mapToast" role="status" aria-live="polite"></div>
        <div class="ask">
          <span class="bot" aria-hidden="true"><img src="assets/ui/bot-face.svg" width="53.3439" height="42.0934" alt=""></span>
          <form data-ask>
            <label class="sr-only" for="ask">Ask era</label>
            <input id="ask" type="text" placeholder="how can I help you?" autocomplete="off">
            <button class="send" type="submit" aria-label="Ask"><img src="assets/ui/send.svg" width="45" height="45" alt=""></button>
          </form>
        </div>
      </section>
      <aside class="fam-side" id="side">${selected ? profile(selected) : overview()}</aside>
    </div>`;
  }

  function activeList() {
    return state.active.map((a) => `<div class="active"><span class="dot"></span><span>${esc(a.text)}<br><span class="muted small">${esc(a.when)}</span></span></div>`).join('');
  }

  // what is coming up for the family, grouped by month
  const EVENTS = [
    ['November', 'Thu 26', 'Dr. Ferri (GP) — check-up, 10:00', 'You go with Rosa'],
    ['December', 'Fri 4', 'Notary — power of attorney, 15:00', 'Marco goes with Rosa'],
    ['December', 'Tue 8', 'Cardiologist — heart check, 9:30', 'Rosa'],
    ['December', 'Every Wed', 'Sofia visits Nonna', 'Tech help with the phone'],
  ];
  function overview() {
    const months = [...new Set(EVENTS.map((e) => e[0]))];
    return `
      <section class="list-card fam-list" id="list" aria-label="Your list"></section>
      <section class="list-card fam-over" aria-label="Overview">
        <div class="list-head"><h2>Overview</h2><span>later this year</span></div>
        ${state.active.length ? `<div class="grp"><p class="grp-t">Services for Rosa</p>${activeList()}</div>` : ''}
        ${months.map((m) => `<div class="grp"><p class="grp-t">${m}</p><ul class="events">${EVENTS.filter((e) => e[0] === m).map(([, day, what, who]) => `
          <li><span class="ev-day">${esc(day)}</span><span><span class="ev-what">${esc(what)}</span><span class="ev-who">${esc(who)}</span></span></li>`).join('')}</ul></div>`).join('')}
      </section>`;
  }

  // Person card, as on the Figma board:
  //  · connected   → banner, name, relation, address, upcoming appointments, important documents, (sharing), "View details"
  //  · not yet     → banner, name, relation, address, sharing, big "Connect with brother Marco" → pop-up → "now connected"
  const REL = { rosa: ['Your Mother', 'mum'], giulia: ['You', ''], marco: ['Your brother', 'brother'], sofia: ["Rosa's granddaughter", ''], lucia: ["Rosa's neighbour", 'neighbour'] };
  const ADDR = { rosa: 'Via Pignolo 12, Bergamo · 50 min from you', giulia: 'Milano · your home', marco: 'Via Tasso 8, Bergamo · 50 min from you', sofia: 'Bergamo · 55 min from you', lucia: 'Via Pignolo 14, Bergamo · next door to Rosa' };
  const SHARE = { rosa: ['giulia', 'marco'], giulia: ['rosa', 'marco'], marco: ['sofia', 'giulia'], sofia: ['rosa', 'giulia'], lucia: [] };
  const FOCUS = { rosa: '50% 42%', giulia: '50% 38%', marco: '50% 30%', sofia: '50% 62%' }; // where the face sits in each photo
  const INSURED = { rosa: true, giulia: true, marco: true, sofia: true, lucia: false };
  const APPTS = { rosa: [['Tue 8 Dec', 'Cardiologist, 9:30'], ['Thu 26 Nov', 'Dr. Ferri (GP), 10:00']], giulia: [['Thu 26 Nov', 'Goes with Rosa to Dr. Ferri']], marco: [['Tue 8 Dec', 'Cardiologist, 9:30'], ['Thu 26 Nov', 'Dr. Ferri (GP), 10:00']], sofia: [['Every Wed', 'Visits Nonna · tech help']], lucia: [] };
  const DOCS_FULL = ['Health insurance card', 'Medical Prescription', 'Living will', 'Report • Doctor’s appointment • 12/12/10'];
  const DOCS = { rosa: DOCS_FULL, giulia: ['Health insurance card'], marco: DOCS_FULL, sofia: ['Health insurance card'], lucia: ["Rosa's emergency sheet"] };
  // silent reset: every refresh starts with only Rosa (and you) connected, so the connect demo can be shown again
  state.connected = ['rosa', 'giulia'];
  // …and with lunch delivery and the driving assistant active, so both service states are on the map
  state.active = ['food', 'drive'].map((k) => ({ text: SERVICE_DONE[k].text, when: SERVICE_DONE[k].when }));
  save();
  const isConnected = (id) => state.connected.includes(id);
  const mini = (id) => { const q = PEOPLE[id]; return q.photo ? `<img src="${q.photo}" alt="${esc(q.name)}">` : `<span>${esc(q.name[0])}</span>`; };
  const shareBlock = (id) => { const share = SHARE[id]; return `<div class="share"><h3>${share.length ? `Sharing medical information with ${share.length} others` : "Can see Rosa's emergency sheet only"}</h3>
    ${share.length ? `<div class="stack">${share.map((s2) => `<a class="mini" href="#/family/${s2}" data-person="${s2}" title="${esc(PEOPLE[s2].name)}">${mini(s2)}</a>`).join('')}</div>` : ''}</div>`; };
  const connectLabel = (id) => `Connect with ${REL[id][1] ? esc(REL[id][1]) + ' ' : ''}<b>${esc(PEOPLE[id].name)}</b>`;

  // the person's active services, stacked at the end of their card
  function svcStack(id) {
    const list = svcOf(id).filter((k) => isActive(k));
    return `<div class="svc-stack"><h3>Active services</h3>
      ${list.map((k) => `<a class="svc-btn" href="#/services/${k}"><span class="svc-btn-ico">${icon(MAP_SVC[k].icon)}</span>
        <span class="svc-btn-t"><b>${esc(MAP_SVC[k].name)}</b><span>${esc(SERVICE_DONE[k].soon)}</span></span><span class="svc-btn-on">Active</span></a>`).join('')}
      <a class="svc-btn add" href="#/services">${icon('add')} Add a service</a></div>`;
  }
  function profile(id) {
    const p = PEOPLE[id], on = isConnected(id);
    const title = id === 'rosa' ? `Mum | ${p.full}` : p.full;
    return `
      <article class="card profile2 ${on ? 'is-on' : ''}" aria-label="${esc(p.name)}'s details">
        <button class="back" type="button" data-person="${id}">${icon('back')} Overview</button>
        <div class="banner">${p.photo ? `<img src="${p.photo}" alt="${esc(p.full)}" style="object-position:${FOCUS[id] || '50% 40%'}">` : `<span class="initial-xl" aria-hidden="true">${esc(p.name[0])}</span>`}</div>
        <div class="pinfo">
          <h2 class="pname">${esc(title)}</h2>
          <p class="prel">${esc(REL[id][0])}${INSURED[id] ? ` <span class="sep" aria-hidden="true">·</span> <span class="ins">Per your insurance <b>Allianz</b></span>` : ''}</p>
          <p class="paddr">${esc(ADDR[id])}</p>
        </div>
        ${on ? `
          ${APPTS[id].length ? `<div class="pblock"><h3>Upcoming appointments</h3><ul class="appts">${APPTS[id].map(([w, t]) => `<li><span>${w}</span><span>${t}</span></li>`).join('')}</ul></div>` : ''}
          <div class="pblock"><h3>Important documents</h3><ul class="docs">${DOCS[id].map((d2) => `<li><button type="button" data-doc="${esc(d2)}">${esc(d2)}</button></li>`).join('')}</ul></div>
          ${id !== 'rosa' && id !== 'giulia' ? shareBlock(id) : ''}
          <div class="pfoot">${svcStack(id)}<button class="view-btn" type="button" data-viewdetails="${id}">View details</button></div>`
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

  /* ---------- the map can be dragged; it always opens with you in the middle ---------- */
  let view = null, viewAnim = 0;
  const CONTENT = { w: 1700, h: 1000 };   // the family around you, with room for names and pills
  function mapBox() { const m = $('#map'), r = m ? m.getBoundingClientRect() : { width: 1200, height: 800 }, pw = r.width || 1200, ph = r.height || 800, z = Math.min(pw / CONTENT.w, ph / CONTENT.h); return { z, w: pw / z, h: ph / z }; }
  const baseView = (mb) => ({ x: -mb.w / 2, y: -mb.h / 2 + 30 });
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  function clampView(v, mb) { const b = baseView(mb); return { x: clamp(v.x, b.x - 450, b.x + 450), y: clamp(v.y, b.y - 320, b.y + 320) }; }
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
    if (!e.target.closest('#map') || window.innerWidth <= 1020) return;
    e.preventDefault(); cancelAnimationFrame(viewAnim);
    const mb = mapBox(); view = clampView({ x: (view ? view.x : 0) + e.deltaX / mb.z, y: (view ? view.y : 0) + e.deltaY / mb.z }, mb); applyView();
  }, { passive: false });

  /* ---------- privacy ---------- */
  function privacy() {
    return `
    <section class="page-head"><h1 class="h1">Privacy Policy</h1><p class="lead">era is a public service. Your family's information belongs to you.</p></section>
    <div class="grid">
      <article class="card c7" style="box-shadow:var(--shadow)">
        <ul class="lines">
          <li>Rosa decides what is shared, and with whom. She can change it at any time.</li>
          <li>Only people Rosa connected can see her information. Lucia sees the emergency sheet only.</li>
          <li>Care advisors see Rosa's information only during a call you started.</li>
          <li>era never sells data and shows no advertising.</li>
        </ul>
      </article>
    </div>`;
  }

  /* ---------- your steps (scripted assistant + checklist) ---------- */
  const ANSWERS = [
    { keys: ['home', 'living', 'alone', 'stay'], title: 'Help Rosa keep living at home',
      text: 'Rosa wants to stay in her flat. That is often possible with a little help. Step by step:',
      steps: ['Walk through the flat with Rosa: stairs, bathroom, light, rugs.', 'Ask her what is hard on a normal day.', 'Try one service for a week, like lunch delivery.', 'Check funding for home adjustments.', 'Decide who in the family looks after this topic.'] },
    { keys: ['dementia', 'forget', 'memory', 'confus'], title: 'Signs of dementia',
      text: 'Noticing changes in your mum is hard. If it happens more often, it is worth a check:',
      steps: ['Write down what you notice, with dates.', 'Book a visit with Dr. Ferri and bring your notes.', 'Ask about a memory check.', 'Make sure the power of attorney is signed in time.'] },
    { keys: ['hospital', 'urgent', 'fell', 'emergency'], title: 'Rosa is in hospital',
      text: 'I am sorry, that is a lot at once. You are not alone. Here is what to do, in order:',
      steps: ['Show the ward Rosa\'s emergency sheet.', 'Tell the nurse Rosa takes a blood thinner.', 'Ask who plans her discharge.', 'Update Marco and Sofia in era.', 'If it gets too much, call a care advisor.'] },
    { keys: ['pay', 'money', 'fund', 'cost'], title: 'Funding for home adjustments',
      text: 'Changes like grab rails or a walk-in shower can be partly paid for:',
      steps: ['List what is hard at home.', 'Ask social services for a home visit.', 'Get a price from an approved fitter.', 'Apply — a care advisor checks the form with you.'] },
  ];
  const SUGGEST = ['How can Rosa keep living at home?', 'Mum forgets things more often', 'Mum is in hospital. What now?', 'How do we pay for a shower?'];
  // buttons under an answer: [label, primary?, link or toast]
  const ANSWER_ACTIONS = {
    'Help Rosa keep living at home': [['See services near Rosa', true, '#/services'], ['Read: Living at home', false, '#/help']],
    'Signs of dementia': [['Book Dr. Ferri', true, 'toast:Request sent to Dr. Ferri\'s practice. They will call you back.'], ['Read: Dementia & memory', false, '#/help']],
    'Rosa is in hospital': [['Call a care advisor', true, 'urgent'], ['Open emergency sheet', false, 'urgent']],
    'Funding for home adjustments': [['Show funding office', true, '#/services/funding'], ['Talk to a care advisor', false, 'urgent']],
  };
  let chat = [{ me: false, html: '<p>Hello Andrea. I know Rosa\'s situation, so you don\'t have to explain everything. What\'s on your mind?</p>' }];
  let pending = null, typing = false;
  if (!state.checklist.length) { // a first list, so the page never starts empty
    state.checklist = [{ title: 'Living at home', items: [{ text: 'Walk through the flat with Rosa', done: true }, { text: 'Try lunch delivery for a week', done: true }, { text: 'Check funding for a walk-in shower', done: false }] }];
    save();
  }
  const BOT_FACE = (cls = '') => `<svg class="bot-face ${cls}" viewBox="0 0 88 88" aria-hidden="true"><rect width="88" height="88" rx="24"/><path d="M32 30v9M56 30v9M24 50 A20 20 0 0 0 64 50"/></svg>`;

  function steps() {
    return `
    <div class="chat-page">
      <section class="convo" aria-label="Ask era">
        <header class="convo-head">
          ${BOT_FACE()}
          <div><p class="convo-title">era assistant</p>
            <p class="knows"><span>Knows:</span><i>Rosa, 78</i><i>lives alone</i><i>irregular heartbeat</i><i>GP: Dr. Ferri</i></p></div>
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
  // map positions are in the 760×880 map drawing (Rosa's home in the middle)
  const SVC = [
    { id: 'food', cat: 'food', icon: 'food', name: 'Lunch delivery', who: 'Pranzo a Casa', cost: 'First week free', what: 'A warm lunch at the door, every day.', dist: '600 m', walk: '8 min walk', x: 260, y: 300 },
    { id: 'drive', cat: 'transport', icon: 'car', name: 'Driving service', who: 'Bus Amico', cost: 'Free', what: 'Volunteer drivers to the doctor and hospital.', dist: '1.1 km', walk: '4 min by car', x: 600, y: 560 },
    { id: 'assist', cat: 'home', icon: 'hand', name: 'Daily care assistant', who: 'Casa Serena', cost: 'Partly funded', what: 'Help with shopping, cleaning and medicines.', dist: '900 m', walk: '12 min walk', x: 220, y: 640 },
    { id: 'funding', cat: 'funding', icon: 'home', name: 'Home adjustments', who: 'Social services', cost: 'Free advice', what: 'Advice and money for grab rails and showers.', dist: '1.6 km', walk: '6 min by car', x: 640, y: 220 },
    { id: 'pharmacy', cat: 'health', icon: 'cross', name: 'Pharmacy delivery', who: 'Farmacia del Borgo', cost: 'Free delivery 65+', what: 'Medicines delivered to Rosa\'s door.', dist: '300 m', walk: '4 min walk', x: 470, y: 330 },
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
        <div class="svc-head"><h1 class="h1">Services near Rosa</h1>
          <p class="lead">Help close to Rosa's home in Bergamo. Ask with one click — era sends the request and keeps the family up to date.</p></div>
        <label class="svc-search">${icon('search')}<span class="sr-only">Search services</span>
          <input id="svcSearch" type="search" placeholder="Search for help, e.g. &quot;lunch&quot; or &quot;shower&quot;" value="${esc(svcQuery)}" autocomplete="off"></label>
        <div class="svc-chips" role="group" aria-label="Filter services">${SVC_CATS.map(([k, l]) => `<button type="button" data-svcfilter="${k}" aria-pressed="${k === svcFilter}">${l}</button>`).join('')}</div>
        <div class="svc-grid" id="svcGrid"></div>
      </div>
      <div class="svc-map"><div id="svcMap"></div>
        <a class="map-tip" href="#/steps" data-q="How can Rosa keep living at home?">${BOT_FACE('small')}<span><b>Not sure what Rosa needs?</b><br>Ask era — it suggests services that fit her day.</span></a>
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
        ${on ? `<p class="active-pill"><i></i>Active for Rosa · ${SERVICE_DONE[s.id].soon}</p>`
             : `<button class="ask-btn" type="button" data-action="${SERVICE_DONE[s.id] ? s.id : 'svc-' + s.id}" data-who="rosa">Ask for this ${icon('arrow')}</button>`}
      </article>`;
    }).join('') : '<p class="empty">No service matches. Try another word, or ask era.</p>';
    const vis = new Set(list.map((s) => s.id));
    const sel = SVC.find((s) => s.id === (svcSel || SVC.find((x) => isActive(x.id))?.id));
    const lw = (t, size) => t.length * size * 0.55 + 22;
    $('#svcMap').innerHTML = `<svg viewBox="0 0 760 880" preserveAspectRatio="xMidYMid slice" role="group" aria-label="Map of services around Rosa's home">
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
      <g class="m-home-l"><rect x="318" y="492" width="124" height="28" rx="14"/><text x="390" y="511" text-anchor="middle">Rosa's home</text>
        <svg x="326" y="499" width="14" height="14" viewBox="0 -960 960 960" class="m-ico-b ms">${I.home}</svg></g>
    </svg>`;
  }

  /* ---------- help desk ---------- */
  function help() {
    const topics = [['Health', 'Doctors, medicines and the emergency sheet.', 'What should be on Rosa\'s emergency sheet?'], ['Wishes', 'What matters to Rosa, in her own words.', 'How do we talk about wishes?'], ['Legal', 'Power of attorney and living will.', 'How do we set up a power of attorney?'], ['Living at home', 'Safety at home and help with daily tasks.', 'How can Rosa keep living at home?'], ['Money & funding', 'What care costs and what is paid for.', 'How do we pay for home adjustments?'], ['Dementia & memory', 'When forgetting is worth a check.', 'Mum forgets things more often']];
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

  /* ---------- login ---------- */
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
  const LINKS = [[0, 1], [1, 2]];                                     // left → middle → right, hanging like a string
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
  const PAGES = { login, family, steps, services, help, privacy };
  const TITLES = { login: 'Welcome', family: "Rosa's family", steps: 'Your steps', services: 'Services', help: 'Help desk', privacy: 'Privacy Policy' };
  function render() {
    const [route0, sub] = location.hash.replace(/^#\/?/, '').split('/');
    const route = PAGES[route0] ? route0 : 'login';
    if (route === 'family') selected = sub && PEOPLE[sub] ? sub : null;
    document.body.classList.toggle('is-login', route === 'login');
    $$('[data-nav]').forEach((a) => (a.dataset.nav === route ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
    document.title = 'era – ' + TITLES[route];
    $('#main').innerHTML = PAGES[route](sub);
    if (route === 'steps') { renderChat(); renderList(); if (pending) { const q = pending; pending = null; ask(q); } }
    if (route === 'services') { renderServices(); if (sub === 'search') $('#svcSearch')?.focus(); else if (sub) $('#svc-' + sub)?.scrollIntoView({ block: 'center' }); }
    if (route === 'login') playIntro(); else stopIntro();
    if (route === 'family') { view = null; applyView(); renderList(); }
    window.scrollTo(0, 0);
  }
  function refreshFamily() {
    if (!location.hash.startsWith('#/family')) return;
    $('#map').innerHTML = mapSVG(); applyView();
    $('#side').innerHTML = selected ? profile(selected) : overview();
    renderList();
  }
  window.addEventListener('hashchange', render);
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if ($('#map')) { $('#map').innerHTML = mapSVG(); applyView(); } if ($('#introMap')) { drawIntroMap(); } }, 150); });

  // R replays the login intro (for demos) — but not while typing in a field or with a modifier key held
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() !== 'r' || e.repeat || e.metaKey || e.ctrlKey || e.altKey || !$('#intro')) return;
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
    e.preventDefault(); playIntro();
  });

  /* ---------- events ---------- */
  let tt;
  function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 3600); }

  function pick(id) {
    selected = selected === id ? null : id;
    history.replaceState(null, '', selected ? '#/family/' + selected : '#/family');
    refreshFamily(); focusOn();
    if (selected && window.innerWidth <= 1020) $('#side').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-person], [data-connect], [data-doc], [data-viewdetails], [data-theme], [data-skip], [data-svcfilter], [data-svcsel], [data-chatact], [data-stop], [data-action], [data-q], [data-check], [data-notify], [data-close]');
    if (!t) return;
    const d = t.dataset;
    if (d.person) { pick(d.person); return; }
    if (d.connect) { openConnect(d.connect); return; }
    if (d.doc) { toast(`${d.doc} opens here (demo).`); return; }
    if (d.viewdetails) { toast(`${PEOPLE[d.viewdetails].name}'s full profile opens here (demo).`); return; }
    if (d.svcfilter) { svcFilter = d.svcfilter; $$('[data-svcfilter]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.svcfilter === svcFilter)); renderServices(); return; }
    if (d.chatact) { if (d.chatact === 'urgent') $('#urgent').showModal(); else toast(d.chatact.replace(/^toast:/, '')); return; }
    if (d.svcsel && !e.target.closest('button, a')) { svcSel = svcSel === d.svcsel ? null : d.svcsel; renderServices(); return; }
    if (d.theme) { state.theme = d.theme; save(); const el = $('#intro'); el.className = el.className.replace(/theme-\w+/, 'theme-' + d.theme); $$('[data-theme]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.theme === d.theme)); return; }
    if (d.skip !== undefined) { e.preventDefault(); playIntro(true); $('#code')?.focus(); return; }
    if (d.stop) { location.hash = '#/services/' + d.stop; return; }
    if (d.action) {
      const s = SERVICE_DONE[d.action];
      if (s) {
        if (!state.active.some((a) => a.text === s.text)) { state.active.unshift({ text: s.text, when: s.when }); save(); }
        toast(s.toast);
        if (location.hash.startsWith('#/family')) refreshFamily(); else render();
      } else if (d.action.startsWith('svc-')) { toast('Request sent. The service will call you within one working day.'); }
      else toast(d.action === 'call' ? `Connecting you with ${PEOPLE[d.who].name}… (demo)` : `Message to ${PEOPLE[d.who].name} opens here (demo).`);
      return;
    }
    if (d.q) {
      if (location.hash.startsWith('#/steps')) { e.preventDefault(); ask(d.q); } else { pending = d.q; }
      return;
    }
    if (d.notify !== undefined) { toast('Marco, Sofia and Lucia got a message: "Rosa needs help — please check era."'); return; }
    if (d.close !== undefined) { $('#urgent').close(); }
  });
  document.addEventListener('keydown', (e) => {
    const g = e.target.closest && e.target.closest('.person, .stop, .m-stop');
    if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); if (g.dataset.person) pick(g.dataset.person); else g.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
  });
  document.addEventListener('input', (e) => { if (e.target.id === 'svcSearch') { svcQuery = e.target.value; renderServices(); } });
  document.addEventListener('change', (e) => {
    const c = e.target.dataset.check;
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
