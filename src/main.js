import './style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { render } from './render.js';
import { createEmbers } from './embers.js';
import { createSamurai } from './samurai.js';
import { initHero } from './sections/hero.js';
import { initAbout } from './sections/about.js';
import { initExperience } from './sections/experience.js';
import { initDuel, initGallery } from './sections/projects.js';
import { initSkills, initAI, initCases, initContact } from './sections/rest.js';

gsap.registerPlugin(ScrollTrigger);

render(document.getElementById('app'));

// Mount a posable samurai into every slot; sections reach it via slot.samurai.
document.querySelectorAll('[data-samurai]').forEach((slot) => {
  slot.samurai = createSamurai({ variant: slot.dataset.samurai });
  slot.append(slot.samurai.el);
});

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const rail = document.querySelector('.rail-fill');

let lenis = null;
let embers = null;

if (!reduceMotion) {
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 });
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.on('scroll', (e) => {
    ScrollTrigger.update();
    embers?.setVelocity(e.velocity);
  });
  embers = createEmbers(document.getElementById('embers'), { count: window.innerWidth < 900 ? 35 : 80 });
}

// Anchor links glide instead of jumping.
document.querySelectorAll('a[href^="#"]').forEach((a) =>
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(target, { duration: 1.6 }) : target.scrollIntoView();
  })
);

// Progress rail + active nav link.
const navLinks = [...document.querySelectorAll('.nav-links a')];
ScrollTrigger.create({
  start: 0,
  end: 'max',
  onUpdate: (self) => {
    rail.style.transform = `scaleY(${self.progress})`;
    document.body.classList.toggle('scrolled', self.scroll() > 40);
  },
});
const mm = gsap.matchMedia();
mm.add(
  {
    desktop: '(min-width: 900px) and (prefers-reduced-motion: no-preference)',
    mobile: '(max-width: 899px) and (prefers-reduced-motion: no-preference)',
  },
  (ctx) => {
    const opts = { desktop: ctx.conditions.desktop, embers };
    initHero(opts);
    initAbout(opts);
    initExperience(opts);
    initDuel(opts);
    initGallery(opts);
    initSkills(opts);
    initAI(opts);
    initCases(opts);
    initContact(opts);
    return () => document.querySelector('.exp-card')?.classList.remove('is-stepped');
  }
);

// Created after the pinned sections so their offsets include pin spacing.
navLinks.forEach((link) => {
  const sec = document.querySelector(link.getAttribute('href'));
  ScrollTrigger.create({
    trigger: sec,
    start: 'top 50%',
    end: 'bottom 50%',
    onToggle: (self) => link.classList.toggle('active', self.isActive),
  });
});

// Pin spacing depends on image and font sizes.
window.addEventListener('load', () => ScrollTrigger.refresh());
document.fonts?.ready.then(() => ScrollTrigger.refresh());
