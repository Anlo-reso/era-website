/* Services, the era assistant (#/steps) and the Help desk. */
import { html, useState, useEffect, useRef, motion, AnimatePresence, LayoutGroup, SPRING, SOFT, BOUNCE, Icon, useAppState, setState, getState, toast, setUI, go, pendingQ, isActive } from './lib.js';
import { I, PEOPLE, SERVICE_DONE, SVC, SVC_CATS, ANSWERS, SUGGEST, ANSWER_ACTIONS, HELP_TOPICS } from './data.js';
import { Check } from './family.js';

const BotFace = ({ cls = '' }) => html`<svg className=${`bot-face ${cls}`} viewBox="0 0 88 88" aria-hidden="true"><rect width="88" height="88" rx="24" /><path d="M32 30v9M56 30v9M24 50 A20 20 0 0 0 64 50" /></svg>`;
const rise = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: SPRING } };
const stagger = { show: { transition: { staggerChildren: 0.06 } } };

/* ======================= services ======================= */
export function Services({ sub }) {
  useAppState();
  const [filter, setFilter] = useState('all'), [query, setQuery] = useState('');
  const [sel, setSel] = useState(() => (SVC.some((s) => s.id === sub) ? sub : null));
  useEffect(() => { if (SVC.some((s) => s.id === sub)) { setSel(sub); setTimeout(() => document.getElementById('svc-' + sub)?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 400); } }, [sub]);
  const list = SVC.filter((s) => (filter === 'all' || s.cat === filter) && (!query || (s.name + ' ' + s.who + ' ' + s.what).toLowerCase().includes(query.toLowerCase())));
  const vis = new Set(list.map((s) => s.id));
  const ask = (s) => {
    if (SERVICE_DONE[s.id]) { setState((st) => ({ active: st.active.some((a) => a.text === SERVICE_DONE[s.id].text) ? st.active : [{ text: SERVICE_DONE[s.id].text, when: SERVICE_DONE[s.id].when }, ...st.active] })); toast(SERVICE_DONE[s.id].toast); }
    else toast('Request sent. The service will call you within one working day.');
  };
  const pick = (id) => setSel((v) => (v === id ? null : id));
  const mapSel = SVC.find((s) => s.id === (sel || SVC.find((x) => isActive(x.id))?.id));
  const lw = (t, size) => t.length * size * 0.55 + 22;

  return html`
    <div className="svc-page">
      <div className="svc-left">
        <${motion.div} className="svc-head" initial="hidden" animate="show" variants=${stagger}>
          <${motion.h1} className="h1" variants=${rise}>Care made easy with us</${motion.h1}>
          <${motion.p} className="lead" variants=${rise}>Help close to Andrea's home in Bergamo. Ask with one click — era sends the request and keeps the family up to date.</${motion.p}>
        </${motion.div}>
        <label className="svc-search"><${Icon} n="search" /><span className="sr-only">Search services</span>
          <input type="search" placeholder='Search for help, e.g. "lunch" or "shower"' value=${query} onChange=${(e) => setQuery(e.target.value)} autoComplete="off" /></label>
        <${LayoutGroup} id="chips">
          <div className="svc-chips" role="group" aria-label="Filter services">
            ${SVC_CATS.map(([k, l]) => html`<${motion.button} key=${k} type="button" className="m-chip" aria-pressed=${k === filter} onClick=${() => setFilter(k)} whileTap=${{ scale: 0.95 }}>
              ${k === filter && html`<${motion.span} layoutId="chip-bg" className="m-chip-bg" transition=${SPRING} />`}<span className="m-chip-t">${l}</span></${motion.button}>`)}
          </div>
        </${LayoutGroup}>
        <${motion.div} className="svc-grid" layout>
          <${AnimatePresence} mode="popLayout">
            ${list.map((s, i) => {
              const on = isActive(s.id);
              return html`<${motion.article} key=${s.id} layout id=${'svc-' + s.id} className=${`svc2 ${on ? 'is-active' : ''} ${sel === s.id ? 'is-sel' : ''}`}
                initial=${{ opacity: 0, y: 24, scale: 0.97 }} animate=${{ opacity: 1, y: 0, scale: 1 }} exit=${{ opacity: 0, scale: 0.94, transition: { duration: 0.18 } }}
                transition=${{ ...SPRING, delay: i * 0.04 }} whileHover=${{ y: -4 }} onClick=${(e) => { if (!e.target.closest('button, a')) pick(s.id); }}>
                <div className="m-img"><${motion.img} className="svc2-img" src=${s.img} alt="" whileHover=${{ scale: 1.04 }} transition=${SOFT} /></div>
                <div className="svc2-text"><h3>${s.name}</h3><p className="what">${s.what}</p></div>
                <${AnimatePresence} mode="wait" initial=${false}>
                  ${on ? html`<${motion.p} key="on" className="active-pill" initial=${{ opacity: 0, scale: 0.9 }} animate=${{ opacity: 1, scale: 1 }} transition=${BOUNCE}><i></i>Active for Andrea · ${SERVICE_DONE[s.id].soon}</${motion.p}>`
                    : html`<${motion.button} key="ask" className="ask-btn" type="button" exit=${{ opacity: 0, scale: 0.95 }} whileTap=${{ scale: 0.96 }} onClick=${() => ask(s)}>Ask for this <${Icon} n="arrow" /></${motion.button}>`}
                </${AnimatePresence}>
              </${motion.article}>`;
            })}
          </${AnimatePresence}>
          ${!list.length && html`<${motion.p} className="empty" initial=${{ opacity: 0 }} animate=${{ opacity: 1 }}>No service matches. Try another word, or ask era.</${motion.p}>`}
        </${motion.div}>
      </div>
      <${motion.div} className="svc-map" initial=${{ opacity: 0, scale: 0.98 }} animate=${{ opacity: 1, scale: 1 }} transition=${{ ...SOFT, delay: 0.1 }}>
        <div id="svcMap">
          <svg viewBox="0 0 760 880" preserveAspectRatio="xMidYMid slice" role="group" aria-label="Map of services around Andrea's home">
            <g className="m-roads"><path d="M-20 300 C 160 330, 260 380, 380 430 C 500 480, 620 470, 780 440" /><path d="M380 430 C 360 300, 330 160, 300 -20" /><path d="M380 430 C 400 560, 430 720, 460 900" /><path d="M-20 640 C 150 600, 260 520, 380 430" /><path d="M380 430 C 520 360, 640 240, 780 180" /><path d="M120 -20 C 140 120, 180 220, 260 280" /></g>
            <g className="m-rings"><${motion.circle} cx="380" cy="430" initial=${{ r: 0 }} animate=${{ r: 160 }} transition=${{ ...SOFT, delay: 0.2 }} /><${motion.circle} cx="380" cy="430" initial=${{ r: 0 }} animate=${{ r: 279 }} transition=${{ ...SOFT, delay: 0.3 }} /></g>
            <text className="m-ring-t" x="380" y="262" textAnchor="middle">500 m</text><text className="m-ring-t" x="380" y="143" textAnchor="middle">1 km</text>
            <text className="m-city" x="150" y="56">BERGAMO</text>
            <${AnimatePresence}>${mapSel && html`<${motion.path} key=${'r' + mapSel.id} className="m-route" d=${`M380 430 L ${mapSel.x} ${mapSel.y}`} initial=${{ opacity: 0 }} animate=${{ opacity: 1 }} exit=${{ opacity: 0 }} transition=${{ duration: 0.35 }} />`}</${AnimatePresence}>
            ${SVC.map((s, i) => {
              const on = mapSel && mapSel.id === s.id, r = on ? 32 : 28;
              return html`<${motion.g} key=${s.id} className=${`m-stop ${on ? 'on' : ''} ${vis.has(s.id) ? '' : 'dim'}`} role="button" tabIndex="0" aria-label=${`${s.name}, ${s.dist}`}
                style=${{ transformBox: 'fill-box', transformOrigin: 'center' }} initial=${{ opacity: 0, scale: 0.6 }} animate=${{ opacity: vis.has(s.id) ? 1 : 0.35, scale: 1 }} transition=${{ ...BOUNCE, delay: 0.3 + i * 0.07 }}
                whileHover=${{ scale: 1.08 }} whileTap=${{ scale: 0.94 }} onClick=${() => pick(s.id)} onKeyDown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(s.id); } }}>
                <${motion.circle} cx=${s.x} cy=${s.y} initial=${false} animate=${{ r }} transition=${BOUNCE} />
                <svg x=${s.x - 12} y=${s.y - 12} width="24" height="24" viewBox="0 -960 960 960" className="m-ico ms" dangerouslySetInnerHTML=${{ __html: I[s.icon] }} />
                <rect x=${s.x - lw(s.who, 13) / 2} y=${s.y + r + 8} width=${lw(s.who, 13)} height="24" rx="12" /><text x=${s.x} y=${s.y + r + 24} textAnchor="middle">${s.who}</text></${motion.g}>`;
            })}
            <${AnimatePresence}>${mapSel && (() => { const wx = mapSel.x + (380 - mapSel.x) * 0.6, wy = mapSel.y + (430 - mapSel.y) * 0.6 - 26, w = lw(mapSel.walk, 13);
              return html`<${motion.g} key=${'w' + mapSel.id} className="m-walk" initial=${{ opacity: 0, y: 8 }} animate=${{ opacity: 1, y: 0 }} exit=${{ opacity: 0 }} transition=${SPRING}>
                <rect x=${wx - w / 2} y=${wy - 12} width=${w} height="24" rx="12" /><text x=${wx} y=${wy + 5} textAnchor="middle">${mapSel.walk}</text></${motion.g}>`; })()}</${AnimatePresence}>
            <defs><clipPath id="clip-home"><circle cx="380" cy="430" r="48" /></clipPath></defs>
            <circle className="m-home-ring" cx="380" cy="430" r="53" />
            <image href=${PEOPLE.rosa.photo} x="332" y="382" width="96" height="96" clipPath="url(#clip-home)" preserveAspectRatio="xMidYMid slice" />
            <g className="m-home-l"><rect x="318" y="492" width="124" height="28" rx="14" /><text x="390" y="511" textAnchor="middle">Andrea's home</text>
              <svg x="326" y="499" width="14" height="14" viewBox="0 -960 960 960" className="m-ico-b ms" dangerouslySetInnerHTML=${{ __html: I.home }} /></g>
          </svg>
        </div>
        <${motion.a} className="map-tip" href="#/steps" whileHover=${{ y: -3 }} onClick=${() => { pendingQ.q = 'How can Andrea keep living at home?'; }}>
          <${BotFace} cls="small" /><span><b>Not sure what Andrea needs?</b><br />Ask era — it suggests services that fit his day.</span></${motion.a}>
      </${motion.div}>
    </div>`;
}

/* ======================= the era assistant ======================= */
const HELLO = { me: false, id: 0, body: html`<p>Hello Isa. I know Andrea's situation, so you don't have to explain everything. What's on your mind?</p>` };
let chatLog = [HELLO];   // kept while you move around the site

function ChatList() {
  const app = useAppState();
  const all = app.checklist.flatMap((g) => g.items), done = all.filter((i) => i.done).length;
  const tick = (gi, ii, v) => setState((s) => ({ checklist: s.checklist.map((g, a) => (a !== gi ? g : { ...g, items: g.items.map((it, b) => (b !== ii ? it : { ...it, done: v, isNew: false })) })) }));
  return html`<section className="list-card" aria-label="Your list">
    <div className="list-head"><h2>Your list</h2><span>${done} of ${all.length} done</span></div>
    <div className="bar" aria-hidden="true"><${motion.span} initial=${false} animate=${{ width: (all.length ? Math.round(done / all.length * 100) : 0) + '%' }} transition=${SOFT} style=${{ display: 'block' }} /></div>
    <${AnimatePresence} initial=${false}>
      ${app.checklist.map((g, gi) => html`<${motion.div} key=${g.title} layout className="grp" initial=${{ opacity: 0, y: -12, scale: 0.98 }} animate=${{ opacity: 1, y: 0, scale: 1 }} transition=${SPRING}>
        <p className="grp-t">${g.title}</p>
        ${g.items.map((it, ii) => html`<${Check} key=${ii} done=${it.done} isNew=${it.isNew} onChange=${(v) => tick(gi, ii, v)}>${it.text}</${Check}>`)}
      </${motion.div}>`)}
    </${AnimatePresence}>
  </section>`;
}

export function Steps() {
  const [log, setLog] = useState(chatLog), [typing, setTyping] = useState(false), [q, setQ] = useState('');
  const logRef = useRef(null);
  useEffect(() => { chatLog = log; const el = logRef.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }); }, [log, typing]);
  const act = (to) => { if (to === 'urgent') setUI({ urgent: true }); else toast(to.replace(/^toast:/, '')); };
  const ask = (text) => {
    text = text.trim(); if (!text || typing) return;
    setLog((l) => [...l, { me: true, id: Date.now(), body: html`<p>${text}</p>` }]); setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const a = ANSWERS.find((x) => x.keys.some((k) => text.toLowerCase().includes(k)));
      let body;
      if (a) {
        if (!getState().checklist.some((g) => g.title === a.title)) setState((s) => ({ checklist: [{ title: a.title, items: a.steps.map((t) => ({ text: t, done: false, isNew: true })) }, ...s.checklist] }));
        const acts = ANSWER_ACTIONS[a.title] || [];
        body = html`<p>${a.text}</p><ol className="nums">${a.steps.slice(0, 3).map((s) => html`<li key=${s}>${s}</li>`)}</ol>
          <${motion.p} className="added" initial=${{ opacity: 0, x: -8 }} animate=${{ opacity: 1, x: 0 }} transition=${{ ...SPRING, delay: 0.3 }}><${Icon} n="check" /> Added to your list</${motion.p}>
          ${acts.length > 0 && html`<div className="m-acts">${acts.map(([l, primary, to]) => to.startsWith('#')
            ? html`<a key=${l} className=${`pill ${primary ? 'pill-blue' : 'pill-line'}`} href=${to}>${l}</a>`
            : html`<button key=${l} className=${`pill ${primary ? 'pill-blue' : 'pill-line'}`} type="button" onClick=${() => act(to)}>${l}</button>`)}</div>`}`;
      } else {
        body = html`<p>I'm not sure I understood. Try one of the questions below — or talk to a care advisor, a real person.</p><div className="m-acts"><button className="pill pill-blue" type="button" onClick=${() => act('urgent')}>Talk to a care advisor</button></div>`;
      }
      setLog((l) => [...l, { me: false, id: Date.now() + 1, body }]);
    }, 800);
  };
  // a question asked from another page
  useEffect(() => { if (pendingQ.q) { const v = pendingQ.q; pendingQ.q = null; ask(v); } }, []);

  return html`
    <div className="chat-page">
      <${motion.section} className="convo" aria-label="Ask era" initial=${{ opacity: 0, y: 16 }} animate=${{ opacity: 1, y: 0 }} transition=${SPRING}>
        <header className="convo-head">
          <${BotFace} />
          <div><p className="convo-title">era assistant</p>
            <p className="knows"><span>Knows:</span><i>Andrea, 78</i><i>lives alone</i><i>irregular heartbeat</i><i>GP: Dr. Ferri</i></p></div>
        </header>
        <div className="log" id="log" aria-live="polite" ref=${logRef}>
          ${log.map((m) => html`<${motion.div} key=${m.id} className=${`m ${m.me ? 'm-me' : 'm-bot'}`} style=${{ transformOrigin: m.me ? '100% 100%' : '0% 100%' }}
            initial=${{ opacity: 0, y: 14, scale: 0.94 }} animate=${{ opacity: 1, y: 0, scale: 1 }} transition=${SPRING}>${m.body}</${motion.div}>`)}
          <${AnimatePresence}>${typing && html`<${motion.div} key="typing" className="m m-bot m-typing" aria-label="era is writing" initial=${{ opacity: 0, scale: 0.8 }} animate=${{ opacity: 1, scale: 1 }} exit=${{ opacity: 0, scale: 0.8 }} transition=${SPRING}><span></span><span></span><span></span></${motion.div}>`}</${AnimatePresence}>
        </div>
        <div className="convo-foot">
          <div className="sugg">${SUGGEST.map((s) => html`<${motion.button} key=${s} className="q" type="button" whileHover=${{ y: -2 }} whileTap=${{ scale: 0.96 }} onClick=${() => ask(s)}>${s}</${motion.button}>`)}</div>
          <form className="ask-bar" onSubmit=${(e) => { e.preventDefault(); ask(q); setQ(''); }}>
            <label className="sr-only" htmlFor="q">Your question</label>
            <input id="q" type="text" placeholder="How can I help you?" autoComplete="off" value=${q} onChange=${(e) => setQ(e.target.value)} />
            <${motion.button} className="go" type="submit" aria-label="Send" whileTap=${{ scale: 0.9 }}><${Icon} n="arrow" /></${motion.button}>
          </form>
          <p className="disclaimer">Guidance, not a diagnosis · For medical decisions talk to Dr. Ferri or a care advisor</p>
        </div>
      </${motion.section}>
      <${motion.aside} className="list-col" initial=${{ opacity: 0, x: 20 }} animate=${{ opacity: 1, x: 0 }} transition=${{ ...SPRING, delay: 0.08 }}>
        <${ChatList} />
        <${motion.a} className="person-card" href="tel:+390000000000" whileHover=${{ y: -3 }}>
          <span><b>Rather talk to a person?</b><br /><span>Care advisors · every day 8–20 · free</span></span>
          <span className="person-call" aria-hidden="true"><${Icon} n="phone" /></span>
        </${motion.a}>
      </${motion.aside}>
    </div>`;
}

/* ======================= help desk ======================= */
export function Help() {
  return html`
    <${motion.div} initial="hidden" animate="show" variants=${stagger}>
      <${motion.section} className="page-head" variants=${rise}><h1 className="h1">Help desk</h1><p className="lead">Talk to a real person, or read short, clear answers.</p></${motion.section}>
      <div className="grid">
        <${motion.article} className="card blue c5" variants=${rise}><p className="title">Talk to a care advisor</p><p className="muted">Every day 8:00–20:00 · free</p>
          <div className="row"><a className="btn" style=${{ background: '#fff', color: 'var(--blue-deep)' }} href="tel:+390000000000"><${Icon} n="phone" /> Call now</a></div></${motion.article}>
        <${motion.article} className="card c7" style=${{ boxShadow: 'var(--shadow)' }} variants=${{ show: { transition: { staggerChildren: 0.05 } } }}>
          ${HELP_TOPICS.map(([t, d, q]) => html`<${motion.a} key=${t} className="topic-link" href="#/steps" variants=${rise} whileHover=${{ x: 4 }} onClick=${() => { pendingQ.q = q; }}>
            <span><span className="title" style=${{ fontSize: '1.15rem', display: 'block' }}>${t}</span><span className="small muted">${d}</span></span><span className="arrow"><${Icon} n="arrow" /></span></${motion.a}>`)}
        </${motion.article}>
      </div>
    </${motion.div}>`;
}
