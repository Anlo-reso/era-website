/* Overview: the family map (left) and the side panel (right). */
import { html, useState, useEffect, useRef, useLayoutEffect, motion, AnimatePresence, animate, useMotionValue, useReducedMotion,
  SPRING, SOFT, BOUNCE, EASE, Icon, useAppState, setState, toast, setUI, useUI, go, pendingQ,
  isActive, isConnected, sum, PREP_TOTAL, prepOf, prepScore, topicScore, lvl10, q10, level, pct, arcD } from './lib.js';
import { I, PEOPLE, SERVICE_DONE, MAPP, FAM_LINKS, PEOPLE_ORDER, MAP_SVC, CITY_BG, EVENTS, REL, ADDR, SHARE, FOCUS, APPTS, DOCS, PREP, PREP_MEMBERS, SVC } from './data.js';
import { Modal } from './ui.js';

/* ---------- geometry ---------- */
const at = (k) => MAPP[k];
function linkGeom(a, b) {
  const p = at(a), q = at(b), dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy), bend = d * 0.08 * ((a.length + b.length) % 2 ? 1 : -1);
  return { p, c: { x: (p.x + q.x) / 2 - dy / d * bend, y: (p.y + q.y) / 2 + dx / d * bend }, q };
}
const link = (a, b) => { const { p, c, q } = linkGeom(a, b); return `M${p.x} ${p.y} Q ${c.x.toFixed(1)} ${c.y.toFixed(1)} ${q.x} ${q.y}`; };
const alongLink = (a, b, t) => { const { p, c, q } = linkGeom(a, b), m = 1 - t; return { x: m * m * p.x + 2 * m * t * c.x + t * t * q.x, y: m * m * p.y + 2 * m * t * c.y + t * t * q.y }; };
const hasLink = (a, b) => FAM_LINKS.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
const notYet = (a, b) => {
  if (a === 'giulia' || b === 'giulia') return !isConnected(a === 'giulia' ? b : a);
  return [a, b].some((x) => x !== 'rosa' && !hasLink('giulia', x) && !isConnected(x));
};
const svcOf = (id) => Object.keys(MAP_SVC).filter((k) => MAP_SVC[k].people.includes(id));
const routeTo = (id) => (id === 'giulia' ? '' : hasLink('giulia', id) ? link('giulia', id) : link('giulia', 'rosa') + ' ' + link('rosa', id));
const textW = (s, size) => s.length * size * 0.52;

/* ---------- the map's camera: drag, glide, zoom (springs) ---------- */
const CONTENT = { w: 1700, h: 1000 };
const ZOOM_MIN = 1, ZOOM_MAX = 2.4, ZOOM_STEP = 1.3;
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const boxOf = (size, zoom) => { const z = Math.min(size.w / CONTENT.w, size.h / CONTENT.h) * zoom; return { z, w: size.w / z, h: size.h / z }; };
const baseView = (mb) => ({ x: -mb.w / 2, y: -mb.h / 2 + 30 });
function clampView(v, mb) { const b = baseView(mb), sx = Math.max(450, (CONTENT.w - mb.w) / 2 + 150), sy = Math.max(320, (CONTENT.h - mb.h) / 2 + 150); return { x: clamp(v.x, b.x - sx, b.x + sx), y: clamp(v.y, b.y - sy, b.y + sy) }; }

const useWidth = () => { const [w, setW] = useState(innerWidth); useEffect(() => { const f = () => setW(innerWidth); addEventListener('resize', f); return () => removeEventListener('resize', f); }, []); return w; };

/* ---------- small pieces ---------- */
const Mini = ({ id }) => { const q = PEOPLE[id]; return q.photo ? html`<img src=${q.photo} alt=${q.name} />` : html`<span>${q.name[0]}</span>`; };

// a number that counts to its new value
function Count({ value }) {
  const ref = useRef(null), last = useRef(value);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const c = animate(last.current, value, { duration: 0.6, ease: EASE, onUpdate: (v) => { el.textContent = Math.round(v); } });
    last.current = value; return () => c.stop();
  }, [value]);
  return html`<span ref=${ref}>${value}</span>`;
}

// a face with its meter (cards)
export function MeterFace({ id, size, delay = 0 }) {
  useAppState();
  const f = prepScore(id), q = PEOPLE[id], r = size / 2, R = r + 7, w = 5, W = 2 * (R + w), top = r + 2, d = arcD(0, 0, R);
  return html`<svg className="meter-face" width=${W} height=${top + R + w} viewBox=${`${-W / 2} ${-top} ${W} ${top + R + w}`} aria-hidden="true">
    <defs><clipPath id=${`mf-${id}-${size}`}><circle r=${r} /></clipPath></defs>
    <image href=${q.photo} x=${-r} y=${-r} width=${size} height=${size} clipPath=${`url(#mf-${id}-${size})`} preserveAspectRatio="xMidYMid slice" />
    <path className="meter-track" d=${d} strokeWidth=${w} />
    <${motion.path} className="meter-edge" d=${d} strokeWidth=${w + 3} initial=${{ pathLength: 0 }} animate=${{ pathLength: q10(f) }} transition=${{ ...SOFT, delay }} />
    <${motion.path} className=${`meter-fill lv-${level(f).cls}`} d=${d} strokeWidth=${w} initial=${{ pathLength: 0 }} animate=${{ pathLength: q10(f) }} transition=${{ ...SOFT, delay }} />
  </svg>`;
}
const Bar = ({ f, delay = 0 }) => html`<span className="tbar"><${motion.i} className=${`lv-${level(f).cls}`} initial=${{ width: 0 }} animate=${{ width: Math.round(f * 100) + '%' }} transition=${{ ...SOFT, delay }} /></span>`;
const Big10 = ({ f }) => html`<${Count} value=${lvl10(f)} /><small>/10</small>`;

// content inside a card rises in, one block after another
const stagger = { show: { transition: { staggerChildren: 0.045, delayChildren: 0.05 } } };
const rise = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: SPRING } };
const Block = ({ className, children, ...p }) => html`<${motion.div} className=${className} variants=${rise} ...${p}>${children}</${motion.div}>`;

/* ======================= the map ======================= */
function FamilyMap({ selected, selSvc, onPick, onPickSvc, onClear }) {
  const app = useAppState();
  const reduce = useReducedMotion();
  const width = useWidth(), small = width <= 1020;
  const boxRef = useRef(null), svgRef = useRef(null);
  const [size, setSize] = useState({ w: 1200, h: 800 });
  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(1), zoomAnim = useRef(null);
  const vx = useMotionValue(0), vy = useMotionValue(0), ready = useRef(false);
  const [hover, setHover] = useState(null);
  const sizeRef = useRef(size); sizeRef.current = size;

  const mbNow = () => boxOf(sizeRef.current, zoomRef.current);
  const applyView = () => { const s = svgRef.current; if (!s) return; const mb = mbNow(); s.setAttribute('viewBox', `${vx.get().toFixed(1)} ${vy.get().toFixed(1)} ${mb.w.toFixed(1)} ${mb.h.toFixed(1)}`); };
  useEffect(() => { const a = vx.on('change', applyView), b = vy.on('change', applyView); return () => { a(); b(); }; }, []);
  useLayoutEffect(() => applyView());

  // the map's size on screen
  useLayoutEffect(() => {
    const el = boxRef.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const s = { w: e.contentRect.width || 1200, h: e.contentRect.height || 800 }; sizeRef.current = s; setSize(s);
      const mb = mbNow();
      if (!ready.current) { const b = baseView(mb); vx.set(b.x); vy.set(b.y); ready.current = true; }
      else { const v = clampView({ x: vx.get(), y: vy.get() }, mb); vx.set(v.x); vy.set(v.y); }
      applyView();
    });
    ro.observe(el); return () => ro.disconnect();
  }, []);

  const glide = (to) => {
    if (reduce) { vx.set(to.x); vy.set(to.y); return; }
    animate(vx, to.x, SOFT); animate(vy, to.y, SOFT);
  };
  // picking someone glides the map back to you in the middle
  useEffect(() => { if (ready.current) glide(baseView(mbNow())); }, [selected, selSvc]);

  // zoom around a point (0..1 of the map box); text keeps its size on screen
  const zoomTo = (target, fx = 0.5, fy = 0.5) => {
    target = clamp(target, ZOOM_MIN, ZOOM_MAX); if (Math.abs(target - zoomRef.current) < 0.001) return;
    const b0 = mbNow(), px = vx.get() + b0.w * fx, py = vy.get() + b0.h * fy;
    vx.stop(); vy.stop(); zoomAnim.current?.stop();
    const step = (z) => {
      zoomRef.current = z; const mb = mbNow();
      const v = z <= ZOOM_MIN + 0.001 ? baseView(mb) : clampView({ x: px - mb.w * fx, y: py - mb.h * fy }, mb);
      vx.set(v.x); vy.set(v.y); setZoom(z);
    };
    if (reduce) { step(target); return; }
    zoomAnim.current = animate(zoomRef.current, target, { ...SPRING, onUpdate: step });
  };

  // drag with a little momentum when you let go
  const drag = useRef(null);
  const onDown = (e) => { if (e.button !== 0) return; vx.stop(); vy.stop(); drag.current = { x: e.clientX, y: e.clientY, vx: vx.get(), vy: vy.get(), moved: false, t: performance.now(), lx: e.clientX, ly: e.clientY, sx: 0, sy: 0 }; };
  useEffect(() => {
    const move = (e) => {
      const d = drag.current; if (!d) return;
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      if (!d.moved && Math.hypot(dx, dy) < 5) return;
      d.moved = true; boxRef.current?.classList.add('dragging');
      const now = performance.now(), dt = Math.max(1, now - d.t); d.sx = (e.clientX - d.lx) / dt; d.sy = (e.clientY - d.ly) / dt; d.t = now; d.lx = e.clientX; d.ly = e.clientY;
      const mb = mbNow(), v = clampView({ x: d.vx - dx / mb.z, y: d.vy - dy / mb.z }, mb); vx.set(v.x); vy.set(v.y);
    };
    const up = () => {
      const d = drag.current; if (!d) return; drag.current = null; boxRef.current?.classList.remove('dragging');
      if (!d.moved) return;
      // a moved pointer is not a tap: swallow the click that follows
      const stop = (ev) => { ev.stopPropagation(); ev.preventDefault(); }; addEventListener('click', stop, { capture: true, once: true }); setTimeout(() => removeEventListener('click', stop, { capture: true }), 50);
      if (reduce || performance.now() - d.t > 80) return;
      const mb = mbNow(), b = baseView(mb), sx = Math.max(450, (CONTENT.w - mb.w) / 2 + 150), sy = Math.max(320, (CONTENT.h - mb.h) / 2 + 150);
      animate(vx, vx.get(), { type: 'inertia', velocity: -d.sx * 1000 / mb.z, power: 0.35, timeConstant: 260, min: b.x - sx, max: b.x + sx, bounceStiffness: 300, bounceDamping: 30 });
      animate(vy, vy.get(), { type: 'inertia', velocity: -d.sy * 1000 / mb.z, power: 0.35, timeConstant: 260, min: b.y - sy, max: b.y + sy, bounceStiffness: 300, bounceDamping: 30 });
    };
    addEventListener('pointermove', move); addEventListener('pointerup', up);
    return () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); };
  }, []);
  // trackpad: two fingers move the map, pinch zooms
  useEffect(() => {
    const el = boxRef.current;
    const wheel = (e) => {
      if (innerWidth <= 1020) return; e.preventDefault(); vx.stop(); vy.stop();
      if (e.ctrlKey) {
        const r = el.getBoundingClientRect(), z = clamp(zoomRef.current * Math.exp(-e.deltaY * 0.01), ZOOM_MIN, ZOOM_MAX), fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
        const b0 = mbNow(), px = vx.get() + b0.w * fx, py = vy.get() + b0.h * fy; zoomRef.current = z; const mb = mbNow();
        const v = clampView({ x: px - mb.w * fx, y: py - mb.h * fy }, mb); vx.set(v.x); vy.set(v.y); setZoom(z); return;
      }
      const mb = mbNow(), v = clampView({ x: vx.get() + e.deltaX / mb.z, y: vy.get() + e.deltaY / mb.z }, mb); vx.set(v.x); vy.set(v.y);
    };
    el.addEventListener('wheel', wheel, { passive: false }); return () => el.removeEventListener('wheel', wheel);
  }, []);

  /* ----- drawing ----- */
  const mb = boxOf(size, zoom), z = mb.z, u = (px) => px / z;
  const ns = u(small ? 13 : 16), ls = u(12.5);
  const k2 = small ? 1.6 : 1 / z;
  const dots = { strokeDasharray: `0 ${(8 * k2).toFixed(1)}`, strokeWidth: (3.5 * k2).toFixed(1) };
  const mine = selSvc ? [selSvc] : selected && selected !== 'giulia' ? svcOf(selected) : [];
  const ringOn = selected || 'giulia', rp = MAPP[ringOn];
  const pop = (delay) => (reduce ? {} : { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, transition: { ...SOFT, delay } });
  const fillBox = { transformBox: 'fill-box', transformOrigin: 'center' };

  const clickBg = (e) => { if (!e.target.closest('.person, .stop') && (selected || selSvc)) onClear(); };
  const key = (fn) => (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } };

  return html`
    <div className="map" id="map" ref=${boxRef} onPointerDown=${onDown} onClick=${clickBg}>
      <svg ref=${svgRef} role="group" aria-label="Map of Andrea's family around you" preserveAspectRatio="xMidYMid meet">
        <defs>${Object.entries(MAPP).map(([id, p]) => html`<clipPath key=${id} id=${`clip-${id}`}><circle cx=${p.x} cy=${p.y} r=${p.r} /></clipPath>`)}</defs>
        <${motion.g} className="city-bg" aria-hidden="true" initial=${{ opacity: 0 }} animate=${{ opacity: 1 }} transition=${{ duration: 1.2 }}>
          ${CITY_BG.map(([c, d], i) => html`<path key=${i} className=${c} d=${d} />`)}
        </${motion.g}>

        <g className="links">
          ${FAM_LINKS.map(([a, b], i) => {
            const nc = notYet(a, b);
            return nc
              ? html`<${motion.path} key=${a + b + 'p'} className="link pending" d=${link(a, b)} style=${{ ...dots, vectorEffect: 'none' }} initial=${{ opacity: 0 }} animate=${{ opacity: 1 }} transition=${{ duration: 0.8, delay: reduce ? 0 : 0.8 }} />`
              : html`<${motion.path} key=${a + b} className="link" d=${link(a, b)} style=${{ vectorEffect: 'none', strokeWidth: u(2) }} initial=${reduce ? false : { pathLength: 0 }} animate=${{ pathLength: 1 }} transition=${{ duration: 0.9, ease: [0.4, 0, 0.2, 1], delay: 0.8 + i * 0.08 }} />`;
          })}
        </g>

        <!-- the route to the person you picked draws itself -->
        <${AnimatePresence}>
          ${selected && selected !== 'giulia' && html`<${motion.path} key=${'r-' + selected} className="route-m" d=${routeTo(selected)}
            style=${isConnected(selected) ? {} : { ...dots, stroke: 'var(--blue)' }}
            initial=${isConnected(selected) ? { pathLength: 0, opacity: 1 } : { opacity: 0 }} animate=${isConnected(selected) ? { pathLength: 1, opacity: 1 } : { opacity: 1 }}
            exit=${{ opacity: 0, transition: { duration: 0.2 } }} transition=${{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }} />`}
        </${AnimatePresence}>

        ${FAM_LINKS.filter(([a, b]) => notYet(a, b)).map(([a, b]) => {
          const m = alongLink(a, b, 0.5), qr = 15 * k2, qi = 18 * k2;
          return html`<${motion.g} key=${'q' + a + b} className="route-q" style=${fillBox} ...${pop(1.2)} exit=${{ scale: 0, opacity: 0 }}>
            <title>Not connected yet</title><circle cx=${m.x} cy=${m.y} r=${qr} />
            <svg x=${m.x - qi / 2} y=${m.y - qi / 2} width=${qi} height=${qi} viewBox="0 -960 960 960" className="ms" dangerouslySetInnerHTML=${{ __html: I.question }} /></${motion.g}>`;
        })}

        <!-- Andrea's services, where they are around his home -->
        ${Object.entries(MAP_SVC).map(([k, v]) => {
          const { x, y } = v.at, hl = mine.includes(k), on = hl && isActive(k), dim = mine.length > 0 && !hl;
          const r = (hl ? 21 : 18) * k2, ic = (hl ? 22 : 19) * k2;
          return html`<${motion.g} key=${k} className=${`stop svcnode ${on ? 'on' : ''} ${hl ? 'hl' : ''} ${dim ? 'dim' : ''}`} role="button" tabIndex="0"
            aria-label=${`${v.name}, ${on ? 'active' : 'not opted in'}. Open service`} style=${fillBox}
            ...${pop(1.3)} whileHover=${{ scale: 1.12 }} whileTap=${{ scale: 0.92 }}
            onClick=${(e) => { e.stopPropagation(); onPickSvc(k); }} onKeyDown=${key(() => onPickSvc(k))}
            onPointerEnter=${() => setHover(k)} onPointerLeave=${() => setHover(null)} onFocus=${() => setHover(k)} onBlur=${() => setHover(null)}>
            <${AnimatePresence}>${hl && html`<${motion.circle} key="ring" className="svc-ring" cx=${x} cy=${y} initial=${{ r: r, opacity: 0 }} animate=${{ r: r + 5 * k2, opacity: 1 }} exit=${{ r: r, opacity: 0 }} transition=${BOUNCE} />`}</${AnimatePresence}>
            <${motion.circle} className="svc-dot" cx=${x} cy=${y} animate=${{ r }} initial=${false} transition=${BOUNCE} />
            <svg x=${x - ic / 2} y=${y - ic / 2} width=${ic} height=${ic} viewBox="0 -960 960 960" className="svc-ico ms" dangerouslySetInnerHTML=${{ __html: I[v.icon] }} />
          </${motion.g}>`;
        })}

        <!-- one blue ring that glides to whoever you picked -->
        <g className="person" style=${{ pointerEvents: 'none' }}>
          <${motion.circle} className="sel-ring" initial=${reduce ? false : { cx: rp.x, cy: rp.y, r: 0 }} animate=${{ cx: rp.x, cy: rp.y, r: rp.r + 6 }} transition=${{ ...SPRING, delay: ready.current ? 0 : 0.5 }} />
        </g>

        ${PEOPLE_ORDER.slice().reverse().map((id) => {
          const p = MAPP[id], who = PEOPLE[id], you = id === 'giulia', mf = prepScore(id), mR = p.r + 6 + u(7), mw = u(5);
          const ly = p.y + p.r + (you ? 22 : 14) + ns + u(12);
          const pinW = textW(p.where, ls) + ls * 2.9, pinH = ls * 2, py = p.y - p.r - 6 - u(10) - pinH, pc = py + pinH / 2, ic = ls * 1.25, px = p.x - pinW / 2 + ls * 0.7;
          const d = arcD(p.x, p.y, mR), i = PEOPLE_ORDER.indexOf(id);
          return html`<${motion.g} key=${id} className=${`person ${selected === id ? 'sel' : ''} ${you ? 'is-you' : ''}`} role="button" tabIndex="0" aria-pressed=${selected === id}
            aria-label=${`${you ? 'You' : `${who.name}, ${who.role}`}, ${p.where}, preparedness ${pct(mf)}. Show details`}
            style=${fillBox} ...${pop(0.1 + i * 0.15)} whileHover=${{ scale: 1.03 }} whileTap=${{ scale: 0.97 }}
            onClick=${(e) => { e.stopPropagation(); onPick(id); }} onKeyDown=${key(() => onPick(id))}>
            <circle className="halo" cx=${p.x} cy=${p.y} r=${p.r + 16} /><circle className="edge" cx=${p.x} cy=${p.y} r=${p.r + 1} />
            <image href=${who.photo} x=${p.x - p.r} y=${p.y - p.r} width=${p.r * 2} height=${p.r * 2} clipPath=${`url(#clip-${id})`} preserveAspectRatio="xMidYMid slice" />
            <path className="meter-track" d=${d} strokeWidth=${mw} />
            <${motion.path} className="meter-edge" d=${d} strokeWidth=${mw + u(3)} initial=${reduce ? false : { pathLength: 0 }} animate=${{ pathLength: q10(mf) }} transition=${{ ...SOFT, delay: ready.current ? 0 : 1.2 }} />
            <${motion.path} className=${`meter-fill lv-${level(mf).cls}`} d=${d} strokeWidth=${mw} initial=${reduce ? false : { pathLength: 0 }} animate=${{ pathLength: q10(mf) }} transition=${{ ...SOFT, delay: ready.current ? 0 : 1.2 }}>
              <title>${id === 'rosa' ? 'Family' : you ? 'Your' : who.name + "'s"} preparedness: ${pct(mf)}</title></${motion.path}>
            <text className="name" x=${p.x} y=${ly} fontSize=${you ? ns * 1.15 : ns} textAnchor="middle">${you ? 'You' : html`${who.name}${!small && html`<tspan className="role" fontSize=${ls + 1}> · ${who.role}</tspan>`}`}</text>
            ${!small && html`<g className="where"><rect x=${p.x - pinW / 2} y=${py} width=${pinW} height=${pinH} rx=${pinH / 2} />
              <svg className="pin ms" x=${px} y=${pc - ic / 2} width=${ic} height=${ic} viewBox="0 -960 960 960" dangerouslySetInnerHTML=${{ __html: I.pin }} />
              <text x=${px + ic + ls * 0.35} y=${pc + ls * 0.36} fontSize=${ls}>${p.where}</text></g>`}
          </${motion.g}>`;
        })}

        <!-- a service's name, on hover or keyboard focus -->
        <g className="svc-tags" aria-hidden="true">
          <${AnimatePresence}>
            ${hover && !small && (() => {
              const v = MAP_SVC[hover], { x, y } = v.at, hl = mine.includes(hover), on = hl && isActive(hover), r = (hl ? 21 : 18) * k2;
              const label = `${v.name}${on ? ' · Active' : ''}`, fs = u(12), lw = textW(label, fs) + fs * 1.8, lh = fs * 2, ty = y - r - u(8) - lh;
              return html`<${motion.g} key=${hover} className="svc-tag show" style=${{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}
                initial=${{ opacity: 0, y: u(6), scale: 0.9 }} animate=${{ opacity: 1, y: 0, scale: 1 }} exit=${{ opacity: 0, scale: 0.95, transition: { duration: 0.12 } }} transition=${SPRING}>
                <rect x=${x - lw / 2} y=${ty} width=${lw} height=${lh} rx=${lh / 2} /><text x=${x} y=${ty + lh / 2 + fs * 0.36} fontSize=${fs} textAnchor="middle">${label}</text></${motion.g}>`;
            })()}
          </${AnimatePresence}>
        </g>
      </svg>
    </div>
    <div className="map-zoom" role="group" aria-label="Zoom the map">
      <${motion.button} type="button" aria-label="Zoom in" disabled=${zoom >= ZOOM_MAX - 0.001} whileTap=${{ scale: 0.9 }} onClick=${() => zoomTo(zoomRef.current * ZOOM_STEP)}><${Icon} n="add" /></${motion.button}>
      <${motion.button} type="button" aria-label="Zoom out" disabled=${zoom <= ZOOM_MIN + 0.001} whileTap=${{ scale: 0.9 }} onClick=${() => zoomTo(zoomRef.current / ZOOM_STEP)}><${Icon} n="remove" /></${motion.button}>
    </div>`;
}

/* ======================= the side panel ======================= */
function Overview() {
  const app = useAppState();
  const months = [...new Set(EVENTS.map((e) => e[0]))];
  return html`
    <${PrepCard} />
    <${motion.section} className="list-card fam-over" aria-label="Overview" variants=${stagger} initial="hidden" animate="show">
      <${Block} className="list-head"><h2>Overview</h2><span>later this year</span></${Block}>
      ${app.active.length > 0 && html`<${Block} className="grp"><p className="grp-t">Services for Dad</p>
        <${AnimatePresence} initial=${false}>${app.active.map((a) => html`<${motion.div} layout key=${a.text} className="active" initial=${{ opacity: 0, height: 0 }} animate=${{ opacity: 1, height: 'auto' }} exit=${{ opacity: 0, height: 0 }} transition=${SPRING}>
          <span className="dot"></span><span>${a.text}<br /><span className="muted small">${a.when}</span></span></${motion.div}>`)}</${AnimatePresence}></${Block}>`}
      ${months.map((m) => html`<${Block} key=${m} className="grp"><p className="grp-t">${m}</p><ul className="events">
        ${EVENTS.filter((e) => e[0] === m).map(([, day, what, who]) => html`<li key=${what}><span className="ev-day">${day}</span><span><span className="ev-what">${what}</span><span className="ev-who">${who}</span></span></li>`)}</ul></${Block}>`)}
    </${motion.section}>`;
}

function PrepCard() {
  const app = useAppState();
  const [open, setOpen] = useState(() => new Set());
  const f = prepScore('giulia'), lv = level(f);
  const next = PREP.map((t, ti) => ({ ti, s: topicScore('giulia', ti), i: app.prep[ti].indexOf(0) })).filter((x) => x.i >= 0).sort((a, b) => a.s - b.s || a.ti - b.ti).slice(0, 3);
  const tick = (ti, i, v) => setState((s) => { const prep = s.prep.map((t) => t.slice()); prep[ti][i] = v; return { prep }; });
  const toggle = (ti) => setOpen((o) => { const n = new Set(o); n.has(ti) ? n.delete(ti) : n.add(ti); return n; });
  return html`
    <${motion.section} className="list-card fam-list prep-card" aria-label="Your preparedness" variants=${stagger} initial="hidden" animate="show">
      <${Block} className="list-head"><h2>Your preparedness</h2><span><${Count} value=${sum(app.prep)} /> of ${PREP_TOTAL} done</span></${Block}>
      <${Block} className="meter-head"><${MeterFace} id="giulia" size=${60} delay=${0.2} /><div><p className=${`meter-pct lv-${lv.cls}`}><${Big10} f=${f} /></p><p className="meter-lv"><${motion.span} key=${lv.cls} className=${`lv-tag lv-${lv.cls}`} initial=${{ scale: 0.8, opacity: 0 }} animate=${{ scale: 1, opacity: 1 }} transition=${BOUNCE}>${lv.label}</${motion.span}></p></div></${Block}>
      ${next.length ? html`<${Block} className="grp"><p className="grp-t">Do next to improve</p>
        <${AnimatePresence} mode="popLayout" initial=${false}>
          ${next.map(({ ti, i }) => html`<${motion.button} layout key=${ti + ':' + i} className="sugg-btn" type="button"
            initial=${{ opacity: 0, y: 14 }} animate=${{ opacity: 1, y: 0 }} exit=${{ opacity: 0, x: 40, transition: { duration: 0.22 } }} transition=${SPRING} whileHover=${{ y: -2 }} whileTap=${{ scale: 0.98 }}
            onClick=${() => { tick(ti, i, 1); setTimeout(() => toast(`Done — your preparedness is now ${pct(prepScore('giulia'))}.`)); }}>
            <span className="sugg-t">${PREP[ti].tasks[i]}</span><span className="sugg-topic">${PREP[ti].name}</span><span className="sugg-done">Done <${Icon} n="check" /></span></${motion.button}>`)}
        </${AnimatePresence}></${Block}>`
      : html`<p className="meter-lv">You have done everything on your list.</p>`}
      <${Block} className="grp"><p className="grp-t">Your to-do list</p>
        ${PREP.map((t, ti) => {
          const n = sum(app.prep[ti]), isOpen = open.has(ti);
          return html`<div key=${ti} className="ptopic m-topic" data-open=${isOpen}>
            <button type="button" className="m-summary" aria-expanded=${isOpen} onClick=${() => toggle(ti)}>
              <span className="tname">${t.name}</span><${Bar} f=${n / t.tasks.length} /><span className="tnum">${n}/${t.tasks.length}</span>
            </button>
            <${AnimatePresence} initial=${false}>${isOpen && html`<${motion.div} key="c" className="m-topic-body" initial=${{ height: 0, opacity: 0 }} animate=${{ height: 'auto', opacity: 1 }} exit=${{ height: 0, opacity: 0 }} transition=${SPRING}>
              ${t.tasks.map((task, i) => html`<${Check} key=${i} done=${!!app.prep[ti][i]} onChange=${(v) => tick(ti, i, v ? 1 : 0)}>${task}</${Check}>`)}
            </${motion.div}>`}</${AnimatePresence}>
          </div>`;
        })}
      </${Block}>
    </${motion.section}>`;
}

// a round checkbox whose tick springs in
export function Check({ done, isNew, onChange, children }) {
  return html`<label className=${`it ${done ? 'is-done' : ''} ${isNew && !done ? 'is-new' : ''}`}>
    <input type="checkbox" checked=${done} onChange=${(e) => onChange(e.target.checked)} />
    <${motion.span} className="box" aria-hidden="true" animate=${{ scale: done ? [1, 1.25, 1] : 1 }} transition=${{ duration: 0.35 }}>
      <${motion.span} style=${{ display: 'grid' }} initial=${false} animate=${{ scale: done ? 1 : 0, rotate: done ? 0 : -45 }} transition=${BOUNCE}><${Icon} n="check" /></${motion.span}>
    </${motion.span}>
    <span className="it-t">${children}</span>${isNew && !done && html`<span className="new">new</span>`}</label>`;
}

function MeterBlock({ id, onPick }) {
  useAppState();
  const f = prepScore(id), lv = level(f), rosa = id === 'rosa';
  return html`<${Block} className="pblock meter-block">
    <h3>${rosa ? 'Family preparedness' : 'Preparedness'}</h3>
    <div className="meter-head"><${MeterFace} id=${id} size=${52} delay=${0.25} /><div><p className=${`meter-pct lv-${lv.cls}`}><${Big10} f=${f} /></p><p className="meter-lv"><span className=${`lv-tag lv-${lv.cls}`}>${lv.label}</span>${rosa ? 'the family on average' : `${sum(prepOf(id))} of ${PREP_TOTAL} tasks`}</p></div></div>
    <ul className="topic-bars">${PREP.map((t, ti) => { const tf = topicScore(id, ti); return html`<li key=${ti}><span className="tname">${t.name}</span><${Bar} f=${tf} delay=${0.2 + ti * 0.05} /><span className="tnum">${rosa ? pct(tf) : `${sum(prepOf(id)[ti])}/${t.tasks.length}`}</span></li>`; })}</ul>
    ${rosa && html`<div className="member-row">${PREP_MEMBERS.map((m, i) => html`<${motion.a} key=${m} className="member" href=${`#/family/${m}`} title=${`${m === 'giulia' ? 'You' : PEOPLE[m].name}: ${pct(prepScore(m))}`}
      onClick=${(e) => { e.preventDefault(); onPick(m); }} whileHover=${{ y: -3 }} whileTap=${{ scale: 0.95 }}>
      <span className="member-pct">${pct(prepScore(m))}</span><${MeterFace} id=${m} size=${44} delay=${0.3 + i * 0.08} /><span className="member-name">${m === 'giulia' ? 'You' : PEOPLE[m].name}</span></${motion.a}>`)}</div>`}
  </${Block}>`;
}

function Profile({ id, onPick, onPickSvc }) {
  useAppState();
  const p = PEOPLE[id], on = isConnected(id);
  const share = SHARE[id];
  const ShareBlock = () => html`<${Block} className="share"><h3>Sharing medical information with ${share.length} others</h3>
    <div className="stack">${share.map((s2) => html`<a key=${s2} className="mini" href=${`#/family/${s2}`} title=${PEOPLE[s2].name} onClick=${(e) => { e.preventDefault(); onPick(s2); }}><${Mini} id=${s2} /></a>`)}</div></${Block}>`;
  const svcs = Object.keys(MAP_SVC).filter((k) => MAP_SVC[k].people.includes(id) && isActive(k));
  return html`
    <${motion.article} className=${`card profile2 ${on ? 'is-on' : ''}`} aria-label=${`${p.name}'s details`} variants=${stagger} initial="hidden" animate="show">
      <div className="banner"><${motion.img} src=${p.photo} alt=${p.full} style=${{ objectPosition: FOCUS[id] }} initial=${{ scale: 1.08, opacity: 0 }} animate=${{ scale: 1, opacity: 1 }} transition=${{ duration: 0.7, ease: EASE }} /></div>
      <${Block} className="pinfo">
        <h2 className="pname">${id === 'rosa' ? `Dad | ${p.full}` : p.full}</h2>
        <p className="prel">${REL[id][0]} <span className="sep" aria-hidden="true">·</span> <span className="ins">Per your insurance <b>Allianz</b></span></p>
        <p className="paddr">${ADDR[id]}</p>
      </${Block}>
      <${MeterBlock} id=${id} onPick=${onPick} />
      ${on ? html`
        ${APPTS[id].length > 0 && html`<${Block} className="pblock"><h3>Upcoming appointments</h3><ul className="appts">${APPTS[id].map(([w, t]) => html`<li key=${w + t}><span>${w}</span><span>${t}</span></li>`)}</ul></${Block}>`}
        <${Block} className="pblock"><h3>Important documents</h3><ul className="docs">${DOCS[id].map((d2) => html`<li key=${d2}><button type="button" onClick=${() => toast(`${d2} opens here (demo).`)}>${d2}</button></li>`)}</ul></${Block}>
        ${id !== 'rosa' && id !== 'giulia' && html`<${ShareBlock} />`}
        <${Block} className="svc-stack"><h3>Active services</h3>
          <div className="svc-row">
            ${svcs.map((k) => html`<${motion.a} key=${k} className="svc-chip" href=${`#/family/svc-${k}`} title=${`${MAP_SVC[k].name} · ${SERVICE_DONE[k].soon}`} onClick=${(e) => { e.preventDefault(); onPickSvc(k); }} whileHover=${{ y: -3 }} whileTap=${{ scale: 0.95 }}>
              <span className="svc-chip-ico"><${Icon} n=${MAP_SVC[k].icon} /></span><span className="svc-chip-name">${MAP_SVC[k].name}</span><span className="svc-chip-when">${SERVICE_DONE[k].soon}</span></${motion.a}>`)}
            <${motion.a} className="svc-chip add" href="#/services" whileHover=${{ y: -3 }} whileTap=${{ scale: 0.95 }}><span className="svc-chip-ico"><${Icon} n="add" /></span><span className="svc-chip-name">Add</span><span className="svc-chip-when">a service</span></${motion.a}>
          </div></${Block}>
        <div className="pfoot"><${motion.button} className="view-btn" type="button" whileTap=${{ scale: 0.98 }} onClick=${() => toast(`${p.name}'s full profile opens here (demo).`)}>View details</${motion.button}></div>`
      : html`
        <${ShareBlock} />
        <div className="pfoot"><${motion.button} className="connect" type="button" whileHover=${{ scale: 1.01 }} whileTap=${{ scale: 0.97 }} onClick=${() => setUI({ connect: id })}>Connect with ${REL[id][1] ? REL[id][1] + ' ' : ''}<b>${p.name}</b></${motion.button}></div>`}
    </${motion.article}>`;
}

function SvcDetail({ k, onPick }) {
  useAppState();
  const m = MAP_SVC[k], d = SVC.find((x) => x.id === k), on = isActive(k);
  const people = m.people.map((id) => (id === 'giulia' ? 'You' : PEOPLE[id].name)).join(' & ');
  const optIn = () => { setState((s) => ({ active: s.active.some((a) => a.text === SERVICE_DONE[k].text) ? s.active : [{ text: SERVICE_DONE[k].text, when: SERVICE_DONE[k].when }, ...s.active] })); toast(SERVICE_DONE[k].toast); };
  return html`
    <${motion.article} className=${`card profile2 svc-detail ${on ? 'is-on' : ''}`} aria-label=${m.name} variants=${stagger} initial="hidden" animate="show">
      <div className="banner svc-banner"><${motion.span} className="svc-detail-ico" initial=${{ scale: 0.5, opacity: 0 }} animate=${{ scale: 1, opacity: 1 }} transition=${BOUNCE}><${Icon} n=${m.icon} /></${motion.span}></div>
      <${Block} className="pinfo"><h2 className="pname">${m.name}</h2>
        <p className="prel">${d.who} <span className="sep" aria-hidden="true">·</span> ${d.cost}</p><p className="paddr">${d.dist} from Andrea · ${d.walk}</p></${Block}>
      <${Block} className="pblock"><h3>What it is</h3><p className="svc-what">${d.what}</p></${Block}>
      <${Block} className="pblock"><h3>Status</h3>
        <${AnimatePresence} mode="wait" initial=${false}>
          <${motion.div} key=${on ? 'on' : 'off'} initial=${{ opacity: 0, y: 6 }} animate=${{ opacity: 1, y: 0 }} exit=${{ opacity: 0, y: -6 }} transition=${{ duration: 0.2 }}>
            <p className="svc-status">${on ? html`<span className="svc-btn-on">Active</span> For Andrea · next: ${SERVICE_DONE[k].soon}` : html`<span className="svc-off">Not opted in</span> Andrea doesn't use this yet`}</p>
            ${on && html`<p className="svc-when">${SERVICE_DONE[k].when}</p>`}
          </${motion.div}>
        </${AnimatePresence}></${Block}>
      <${Block} className="pblock"><h3>Looked after by</h3><p className="svc-people">${m.people.map((id) => html`<a key=${id} className="mini" href=${`#/family/${id}`} title=${PEOPLE[id].name} onClick=${(e) => { e.preventDefault(); onPick(id); }}><${Mini} id=${id} /></a>`)}<span>${people}</span></p></${Block}>
      <div className="pfoot">${on
        ? html`<a className="view-btn as-link" href=${`#/services/${k}`}>See it on the Services page</a>`
        : html`<${motion.button} className="connect" type="button" whileTap=${{ scale: 0.97 }} onClick=${optIn}>Opt in for Andrea</${motion.button}>`}</div>
    </${motion.article}>`;
}

/* ======================= connect flow ======================= */
function ConnectDialog({ onDone }) {
  const { connect: id } = useUI();
  const [share, setShare] = useState(false), [receive, setReceive] = useState(true);
  useEffect(() => { setShare(false); setReceive(true); }, [id]);
  const n = id ? PEOPLE[id].name : '';
  const Opt = ({ v, set, children }) => html`<label className="cd-opt"><input type="checkbox" checked=${v} onChange=${(e) => set(e.target.checked)} />
    <${motion.span} className="cd-box" aria-hidden="true" animate=${{ scale: v ? [1, 1.2, 1] : 1 }}><${motion.span} style=${{ display: 'grid' }} initial=${false} animate=${{ scale: v ? 1 : 0 }} transition=${BOUNCE}><${Icon} n="check" /></${motion.span}></${motion.span}><span>${children}</span></label>`;
  return html`<${Modal} open=${!!id} onClose=${() => setUI({ connect: null })} className="connect-dlg">
    <form className="cd-form" onSubmit=${(e) => { e.preventDefault(); const who = id; setState((s) => ({ connected: s.connected.includes(who) ? s.connected : [...s.connected, who] })); setUI({ connect: null }); onDone(who); }}>
      <h2 className="cd-title">Quick checks!</h2>
      <${Opt} v=${share} set=${setShare}><b>Share</b> your medical information with ${n}</${Opt}>
      <${Opt} v=${receive} set=${setReceive}><b>Receive</b> medical information from ${n}</${Opt}>
      <${motion.button} className="connect" type="submit" whileTap=${{ scale: 0.97 }}>Send connect request</${motion.button}>
      <p className="cd-note">Your data is secured and private</p>
    </form>
  </${Modal}>`;
}

/* ======================= the page ======================= */
export function Family({ sub }) {
  useAppState();
  const selected = sub && PEOPLE[sub] ? sub : null;
  const selSvc = sub && sub.startsWith('svc-') && MAP_SVC[sub.slice(4)] ? sub.slice(4) : null;
  const sideRef = useRef(null);
  const [mt, setMt] = useState(null);
  const [ask, setAsk] = useState('');
  useEffect(() => { if (!mt) return; const t = setTimeout(() => setMt(null), 4200); return () => clearTimeout(t); }, [mt]);

  const toSide = () => { if (innerWidth <= 1020) setTimeout(() => sideRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); };
  const onPick = (id) => { go(selected === id ? '#/family' : '#/family/' + id, true); if (selected !== id) toSide(); };
  const onPickSvc = (k) => { go(selSvc === k ? '#/family' : '#/family/svc-' + k, true); if (selSvc !== k) toSide(); };
  const onClear = () => go('#/family', true);

  const paneKey = selSvc ? 's-' + selSvc : selected && selected !== 'giulia' ? 'p-' + selected : 'ov';
  return html`
    <div className="fam">
      <section className="fam-map" aria-label="Andrea's family">
        <p className="panel-title">Andrea's family · 4 people</p>
        <${FamilyMap} selected=${selected} selSvc=${selSvc} onPick=${onPick} onPickSvc=${onPickSvc} onClear=${onClear} />
        <${AnimatePresence}>${mt && html`<${motion.div} key=${mt} className="map-toast show" role="status" aria-live="polite"
          initial=${{ opacity: 0, y: -16, scale: 0.96 }} animate=${{ opacity: 1, y: 0, scale: 1 }} exit=${{ opacity: 0, y: -10 }} transition=${SPRING}>
          <span className="mt-av"><${Mini} id=${mt} /><${motion.i} initial=${{ scale: 0 }} animate=${{ scale: 1 }} transition=${{ ...BOUNCE, delay: 0.2 }}><${Icon} n="check" /></${motion.i}></span>
          <span>${REL[mt][0]} <b>${PEOPLE[mt].name}</b> is now connected</span></${motion.div}>`}</${AnimatePresence}>
        <div className="ask">
          <span className="bot" aria-hidden="true"><img src="assets/ui/bot-face.svg" width="53.3439" height="42.0934" alt="" /></span>
          <form onSubmit=${(e) => { e.preventDefault(); const v = ask.trim(); if (v) { pendingQ.q = v; go('#/steps'); } }}>
            <label className="sr-only" htmlFor="ask">Ask era</label>
            <input id="ask" type="text" placeholder="how can I help you?" autoComplete="off" value=${ask} onChange=${(e) => setAsk(e.target.value)} />
            <${motion.button} className="send" type="submit" aria-label="Ask" whileHover=${{ scale: 1.06 }} whileTap=${{ scale: 0.92 }}><img src="assets/ui/send.svg" width="45" height="45" alt="" /></${motion.button}>
          </form>
        </div>
      </section>
      <aside className="fam-side" id="side" ref=${sideRef}>
        <${AnimatePresence} mode="wait" initial=${false}>
          <${motion.div} key=${paneKey} className="side-pane"
            initial=${{ opacity: 0, x: 28 }} animate=${{ opacity: 1, x: 0, transition: SPRING }} exit=${{ opacity: 0, x: -16, transition: { duration: 0.14, ease: 'easeIn' } }}>
            ${selSvc ? html`<${SvcDetail} k=${selSvc} onPick=${onPick} />` : selected && selected !== 'giulia' ? html`<${Profile} id=${selected} onPick=${onPick} onPickSvc=${onPickSvc} />` : html`<${Overview} />`}
          </${motion.div}>
        </${AnimatePresence}>
      </aside>
      <${ConnectDialog} onDone=${(id) => setMt(id)} />
    </div>`;
}
