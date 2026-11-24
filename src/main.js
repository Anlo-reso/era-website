/* era — Framer Motion version. Routes: #/login · #/family[/<person> | /svc-<service>] · #/services[/<id>] · #/steps · #/help */
import { React, html, useEffect, motion, AnimatePresence, MotionConfig, useRoute, EASE } from './lib.js';
import { createRoot } from 'react-dom/client';
import { Header, TabBar, Urgent, Toast } from './ui.js';
import { Login } from './intro.js';
import { Family } from './family.js';
import { Services, Steps, Help } from './pages.js';

const PAGES = { login: Login, family: Family, steps: Steps, services: Services, help: Help };
const TITLES = { login: 'Welcome', family: 'Overview', steps: 'era assistant', services: 'Services', help: 'Help desk' };

function App() {
  const { route: r, sub } = useRoute();
  const route = PAGES[r] ? r : 'login';
  const Page = PAGES[route];
  useEffect(() => { document.title = 'era – ' + TITLES[route]; window.scrollTo(0, 0); }, [route]);
  return html`<${MotionConfig} reducedMotion="user">
    <a className="skip" href="#main">Skip to content</a>
    ${route !== 'login' && html`<${Header} route=${route} />`}
    <main id="main" className="wrap" tabIndex="-1">
      <${AnimatePresence} mode="wait">
        <${motion.div} key=${route} className="page"
          initial=${{ opacity: 0, y: route === 'login' ? 0 : 14 }} animate=${{ opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } }}
          exit=${{ opacity: 0, y: route === 'login' ? 0 : -8, transition: { duration: 0.18, ease: 'easeIn' } }}>
          <${Page} sub=${sub} />
        </${motion.div}>
      </${AnimatePresence}>
    </main>
    ${route !== 'login' && html`<${TabBar} route=${route} />`}
    <${Urgent} />
    <${Toast} />
  </${MotionConfig}>`;
}

createRoot(document.getElementById('app')).render(html`<${App} />`);
