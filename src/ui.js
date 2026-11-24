/* Shared pieces: header, phone tab bar, dialogs, toast. */
import { html, useState, useEffect, useRef, motion, AnimatePresence, animate, SPRING, Icon, store, toast, useToast, useUI, setUI } from './lib.js';

// a native <dialog> (focus trap, Esc, backdrop) that springs in and fades out
export function Modal({ open, onClose, className = '', children, labelledBy }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current; if (!d) return;
    if (open && !d.open) {
      d.showModal();
      animate(d, { opacity: [0, 1], y: [24, 0], scale: [0.96, 1] }, SPRING);
    } else if (!open && d.open) {
      animate(d, { opacity: 0, y: 12, scale: 0.98 }, { duration: 0.16, ease: 'easeIn' }).then(() => d.close());
    }
  }, [open]);
  useEffect(() => {
    const d = ref.current;
    const cancel = (e) => { e.preventDefault(); onClose(); };
    const click = (e) => { if (e.target === d) onClose(); };
    d.addEventListener('cancel', cancel); d.addEventListener('click', click);
    return () => { d.removeEventListener('cancel', cancel); d.removeEventListener('click', click); };
  }, [onClose]);
  return html`<dialog ref=${ref} className=${className} aria-labelledby=${labelledBy}>${children}</dialog>`;
}

export function Toast() {
  const t = useToast();
  return html`<div className="toast-host" role="status" aria-live="polite">
    <${AnimatePresence}>${t && html`<${motion.div} key=${t.id} className="toast show m-toast"
      initial=${{ opacity: 0, y: 24, scale: 0.95 }} animate=${{ opacity: 1, y: 0, scale: 1 }} exit=${{ opacity: 0, y: 12, transition: { duration: 0.18 } }} transition=${SPRING}>${t.text}</${motion.div}>`}</${AnimatePresence}>
  </div>`;
}

export function Urgent() {
  const { urgent } = useUI();
  const close = () => setUI({ urgent: false });
  return html`<${Modal} open=${urgent} onClose=${close} labelledBy="urgentTitle">
    <div className="dlg-head">
      <h2 id="urgentTitle">You're not alone.</h2>
      <button type="button" className="icon-btn" aria-label="Close" onClick=${close}><${Icon} n="close" /></button>
    </div>
    <p className="lead">Take a breath. Here is what to do now, and what can wait.</p>
    <div className="dlg-cols">
      <section className="now"><h3>Right now</h3>
        <ol className="num"><li>If Andrea is in danger, call <b>112</b>.</li><li>Show the doctors Andrea's emergency sheet.</li><li>Tell the family with one tap.</li></ol></section>
      <section><h3>In the next days</h3>
        <ol className="num"><li>Ask the hospital who plans Andrea's discharge.</li><li>Check what help Andrea needs at home afterwards.</li><li>Let era make your next steps.</li></ol></section>
    </div>
    <div className="row">
      <a className="btn btn-dark" href="tel:+390000000000">Call a care advisor</a>
      <button type="button" className="btn btn-line" onClick=${() => toast('Marco and Sofia got a message: "Andrea needs help — please check era."')}>Tell my family</button>
    </div>
    <p className="small muted">Care advisors are real people, every day 8:00–20:00.</p>
  </${Modal}>`;
}

const SIZES = [15, 17, 19, 21];
function TextSize() {
  const [si, setSi] = useState(() => Math.min(3, Math.max(0, store.get('ts', 0))));
  useEffect(() => { document.documentElement.style.fontSize = SIZES[si] + 'px'; store.set('ts', si); }, [si]);
  return html`<div className="textsize" role="group" aria-label="Text size">
    <${motion.button} type="button" aria-label="Smaller text" disabled=${si === 0} whileTap=${{ scale: 0.88 }} onClick=${() => setSi(si - 1)}><img src="assets/ui/minus.svg" width="40" height="40" alt="" /></${motion.button}>
    <${motion.span} key=${si} aria-hidden="true" initial=${{ scale: 0.7 }} animate=${{ scale: 1 }} transition=${SPRING}>Aa</${motion.span}>
    <${motion.button} type="button" aria-label="Larger text" disabled=${si === 3} whileTap=${{ scale: 0.88 }} onClick=${() => setSi(si + 1)}><img src="assets/ui/plus.svg" width="40" height="40" alt="" /></${motion.button}>
  </div>`;
}

const NAV = [['family', 'Overview'], ['services', 'Services']];
export function Header({ route }) {
  return html`<${motion.header} className="top" initial=${{ y: -20, opacity: 0 }} animate=${{ y: 0, opacity: 1 }} transition=${SPRING}>
    <div className="wrap top-in">
      <a className="logo" href="#/family" aria-label="era – overview"><img src="assets/ui/era-logo.svg" width="86.4" height="54" alt="era" /></a>
      <nav className="nav" aria-label="Main">
        ${NAV.map(([k, l]) => html`<a key=${k} href=${'#/' + k} aria-current=${route === k ? 'page' : undefined} className="m-nav">${l}
          ${route === k && html`<${motion.span} layoutId="nav-line" className="m-nav-line" transition=${SPRING} />`}</a>`)}
      </nav>
      <div className="tools">
        <${TextSize} />
        <${motion.button} type="button" className="urgent" whileHover=${{ scale: 1.03 }} whileTap=${{ scale: 0.96 }} onClick=${() => setUI({ urgent: true })}>Urgent help</${motion.button}>
        <${motion.a} className="me" href="#/family/giulia" aria-label="Your profile: Isa" whileHover=${{ scale: 1.05 }} whileTap=${{ scale: 0.95 }}><img src="assets/people/giulia.jpg" alt="" /><span className="me-smile" aria-hidden="true"><img src="assets/ui/smile.svg" width="32" height="32" alt="" /></span></${motion.a}>
      </div>
    </div>
  </${motion.header}>`;
}

const TABS = [['family', 'Overview', 'dashboard'], ['services', 'Services', 'pin'], ['help', 'Help', 'help']];
export function TabBar({ route }) {
  return html`<nav className="tabbar" aria-label="Main (phone)">
    ${TABS.map(([k, l, ic]) => html`<a key=${k} href=${'#/' + k} aria-current=${route === k ? 'page' : undefined} className="m-tab">
      ${route === k && html`<${motion.span} layoutId="tab-bg" className="m-tab-bg" transition=${SPRING} />`}
      <${Icon} n=${ic} />${l}</a>`)}
  </nav>`;
}
