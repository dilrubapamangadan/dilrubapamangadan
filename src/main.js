import './style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { chips } from './content.js';
import { renderUI } from './ui.js';
import { createWorld } from './world/scene.js';

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const lite = window.innerWidth < 900 || (navigator.hardwareConcurrency || 8) <= 4;

renderUI(document.getElementById('app'));

// The 3D world is a progressive enhancement: without WebGL the panels still read as a normal page.
let world = null;
try {
  world = createWorld(document.getElementById('world'), { chips, lite, reduced });
} catch (err) {
  console.warn('WebGL unavailable, showing the page without the 3D board.', err);
  document.body.classList.add('no-webgl');
}

// --- Smooth scrolling -----------------------------------------------------------
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

const chapters = [...document.querySelectorAll('.chapter')];
const railFill = document.querySelector('.rail-fill');
const railNo = document.querySelector('.rail-no');
const railName = document.querySelector('.rail-name');
const navLinks = [...document.querySelectorAll('.nav-links a')];

// Share of each chapter's scroll spent walking to its chip; the rest is spent parked there.
const WALK = 0.42;
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const stops = world?.stops;
const stopAt = (i) => stops?.[i].s ?? 0;

function show(chapter, { s, dwell, panelSide, wave, live }) {
  world?.set({ s, dwell, panelSide, wave });
  chapters.forEach((c, i) => c.classList.toggle('live', i === chapter && live));
  railNo.textContent = String(dwell + 1).padStart(2, '0');
  railName.textContent = dwell >= 0 ? chips[dwell].title : chapter === 0 ? 'Boot' : 'Walking…';
  navLinks.forEach((a) => a.classList.toggle('active', dwell >= 0 && a.hash === `#${chips[dwell].id}`));
}
const showHero = () => show(0, { s: stopAt(0), dwell: -1, panelSide: -1, wave: 1, live: true });

// Hero: standing on the boot pad, waving.
ScrollTrigger.create({
  trigger: chapters[0],
  start: 'top top',
  end: 'bottom bottom',
  onUpdate: (self) => self.isActive && showHero(),
  onEnterBack: showHero,
});

// Each chip chapter: walk from the previous stop, then park at this chip while its panel is live.
chapters.slice(1).forEach((el, i) => {
  ScrollTrigger.create({
    trigger: el,
    start: 'top bottom',
    end: 'bottom bottom',
    onUpdate(self) {
      if (!self.isActive) return;
      const p = self.progress;
      const from = stopAt(i);
      const to = stopAt(i + 1);
      const arrived = p >= WALK;
      show(i + 1, {
        s: arrived ? to : from + (to - from) * ease(p / WALK),
        dwell: arrived ? i : -1,
        panelSide: arrived ? (i % 2 ? -1 : 1) : 0,
        wave: arrived && i === chips.length - 1 ? 1 : 0,
        live: p > WALK - 0.06,
      });
    },
  });
});

ScrollTrigger.create({
  start: 0,
  end: 'max',
  onUpdate: (self) => (railFill.style.transform = `scaleY(${self.progress})`),
});

// Nav links glide to the moment he arrives at that chip.
document.querySelectorAll('a[href^="#"]').forEach((a) =>
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const y = target.id === 'top' ? 0 : target.offsetTop + window.innerHeight * 0.15;
    lenis ? lenis.scrollTo(y, { duration: 2.2 }) : window.scrollTo(0, y);
  })
);

showHero();
window.addEventListener('load', () => ScrollTrigger.refresh());
