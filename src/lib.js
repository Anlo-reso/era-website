/* React + Framer Motion, loaded as ES modules (no build step), and the shared app state. */
import React, { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect, useSyncExternalStore } from 'react';
import htm from 'htm';
import { motion, AnimatePresence, LayoutGroup, MotionConfig, animate, useReducedMotion, useMotionValue } from 'framer-motion';
import { I, SERVICE_DONE, PREP, PREP_DONE, PREP_MEMBERS } from './data.js';

export const html = htm.bind(React.createElement);
export { React, useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect, motion, AnimatePresence, LayoutGroup, MotionConfig, animate, useReducedMotion, useMotionValue };

/* ---------- motion presets: one feel across the site ---------- */
export const SPRING = { type: 'spring', stiffness: 380, damping: 32, mass: 0.9 };   // snappy, no wobble
export const SOFT = { type: 'spring', stiffness: 170, damping: 24 };                 // gentle, a little give
export const BOUNCE = { type: 'spring', stiffness: 520, damping: 22 };               // small pops
export const EASE = [0.22, 1, 0.36, 1];                                              // easeOutQuint

/* ---------- icons ---------- */
export const Icon = ({ n, className = 'ms' }) => html`<svg className=${className} viewBox="0 -960 960 960" aria-hidden="true" dangerouslySetInnerHTML=${{ __html: I[n] }} />`;

/* ---------- storage ---------- */
export const store = {
  get(k, d) { try { const v = localStorage.getItem('era2:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('era2:' + k, JSON.stringify(v)); } catch (e) { /* fine */ } },
};

/* ---------- app state (a tiny store every component can read) ---------- */
let state = store.get('state', { active: [], checklist: [] });
// silent reset on every load: only Andrea (and you) connected, lunch + driving active — so the demo can be shown again
state.connected = ['rosa', 'giulia'];
state.active = ['food', 'drive'].map((k) => ({ text: SERVICE_DONE[k].text, when: SERVICE_DONE[k].when }));
if (!state.prep) state.prep = PREP_DONE.giulia.map((t) => t.slice());
if (!state.checklist || !state.checklist.length) {
  state.checklist = [{ title: 'Living at home', items: [{ text: 'Walk through the flat with Andrea', done: true }, { text: 'Try lunch delivery for a week', done: true }, { text: 'Check funding for a walk-in shower', done: false }] }];
}
store.set('state', state);
const subs = new Set();
export function setState(fn) { state = { ...state, ...fn(state) }; store.set('state', state); subs.forEach((f) => f()); }
export const useAppState = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => state);
export const getState = () => state;

/* ---------- toasts ---------- */
const toastSubs = new Set();
let toastMsg = null, toastTimer;
export function toast(text) { toastMsg = { text, id: Date.now() }; toastSubs.forEach((f) => f()); clearTimeout(toastTimer); toastTimer = setTimeout(() => { toastMsg = null; toastSubs.forEach((f) => f()); }, 3600); }
export const useToast = () => useSyncExternalStore((f) => { toastSubs.add(f); return () => toastSubs.delete(f); }, () => toastMsg);

/* ---------- small shared bits: overlays (urgent help) ---------- */
const uiSubs = new Set();
let ui = { urgent: false, connect: null };
export function setUI(p) { ui = { ...ui, ...p }; uiSubs.forEach((f) => f()); }
export const useUI = () => useSyncExternalStore((f) => { uiSubs.add(f); return () => uiSubs.delete(f); }, () => ui);

/* ---------- hash route ---------- */
export function useRoute() {
  const [h, setH] = useState(location.hash);
  useEffect(() => { const f = () => setH(location.hash); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); }, []);
  let [route, sub] = h.replace(/^#\/?/, '').split('/');
  if (route === 'overview') route = 'family';
  return { route, sub };
}
export const go = (hash, replace) => { if (replace) { history.replaceState(null, '', hash); dispatchEvent(new HashChangeEvent('hashchange')); } else location.hash = hash; };

/* ---------- a question waiting for the assistant ---------- */
export const pendingQ = { q: null };

/* ---------- preparedness maths ---------- */
export const isActive = (id) => !!SERVICE_DONE[id] && state.active.some((a) => a.text === SERVICE_DONE[id].text);
export const isConnected = (id) => state.connected.includes(id);
export const sum = (a) => a.flat().reduce((n, v) => n + v, 0);
export const PREP_TOTAL = PREP.reduce((n, t) => n + t.tasks.length, 0);
export const prepOf = (id) => (id === 'giulia' ? state.prep : PREP_DONE[id]);
export const prepScore = (id) => (id === 'rosa' ? PREP_MEMBERS.reduce((n, m) => n + sum(prepOf(m)), 0) / (PREP_TOTAL * PREP_MEMBERS.length) : sum(prepOf(id)) / PREP_TOTAL);
export const topicScore = (id, ti) => (id === 'rosa' ? PREP_MEMBERS.reduce((n, m) => n + sum(prepOf(m)[ti]), 0) / (PREP[ti].tasks.length * PREP_MEMBERS.length) : sum(prepOf(id)[ti]) / PREP[ti].tasks.length);
export const lvl10 = (f) => Math.round(f * 10);
export const q10 = (f) => lvl10(f) / 10;
export const level = (f) => { const q = q10(f); return q >= 0.8 ? { cls: 'well', label: 'Well prepared' } : q >= 0.4 ? { cls: 'way', label: 'On the way' } : { cls: 'start', label: 'Getting started' }; };
export const pct = (f) => `${lvl10(f)}/10`;
// the bottom half of a circle: from the left, through the bottom, to the right
export const arcD = (cx, cy, R) => `M${(cx - R).toFixed(1)} ${cy} A ${R.toFixed(1)} ${R.toFixed(1)} 0 0 0 ${(cx + R).toFixed(1)} ${cy}`;
