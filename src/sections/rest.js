import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { STRIDE, rigScale } from '../samurai.js';

const reveal = (targets, trigger, vars = {}, start = 'top 80%') =>
  gsap.from(targets, {
    y: 50,
    opacity: 0,
    duration: 0.9,
    stagger: 0.08,
    ease: 'power3.out',
    scrollTrigger: { trigger, start },
    ...vars,
  });

export function initSkills() {
  const sec = document.querySelector('.skills');
  reveal(sec.querySelectorAll('.section-head > *'), sec);

  gsap.fromTo(sec.querySelector('.marquee span'), { xPercent: 0 }, {
    xPercent: -40,
    ease: 'none',
    scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true },
  });

  gsap.set(sec.querySelectorAll('.skill-group'), { y: 60, opacity: 0 });
  ScrollTrigger.batch(sec.querySelectorAll('.skill-group'), {
    start: 'top 85%',
    once: true,
    onEnter: (groups) => {
      gsap.to(groups, { y: 0, opacity: 1, stagger: 0.1, duration: 0.9, ease: 'power3.out' });
      groups.forEach((g, i) =>
        g.querySelectorAll('.chip').forEach((c, j) => setTimeout(() => c.classList.add('lit'), 400 + i * 100 + j * 80))
      );
    },
  });
}

export function initAI({ embers }) {
  const sec = document.querySelector('.ai');

  // The world turns gold for this chapter.
  ScrollTrigger.create({
    trigger: sec,
    start: 'top 60%',
    end: 'bottom 40%',
    onToggle: (self) => {
      document.body.classList.toggle('theme-gold', self.isActive);
      embers?.setTint(self.isActive ? [255, 190, 90] : [255, 70, 50]);
    },
  });

  gsap.from(sec.querySelectorAll('.section-head > *'), {
    filter: 'blur(18px)',
    opacity: 0,
    y: 30,
    stagger: 0.1,
    ease: 'none',
    scrollTrigger: { trigger: sec, start: 'top 85%', end: 'top 35%', scrub: true },
  });

  gsap.from(sec.querySelector('.ai-line'), {
    scaleY: 0,
    ease: 'none',
    scrollTrigger: { trigger: sec.querySelector('.ai-path'), start: 'top 70%', end: 'bottom 60%', scrub: true },
  });

  sec.querySelectorAll('.ai-node').forEach((node) => {
    gsap.from(node.querySelector('.ai-body'), {
      x: node.classList.contains('ai-node-r') ? 60 : -60,
      opacity: 0,
      filter: 'blur(8px)',
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: node, start: 'top 72%' },
    });
    gsap.from(node.querySelector('.ai-dot'), {
      scale: 0,
      duration: 0.6,
      ease: 'back.out(3)',
      scrollTrigger: { trigger: node, start: 'top 72%' },
    });
  });
}

export function initCases() {
  const sec = document.querySelector('.cases');
  reveal(sec.querySelectorAll('.section-head > *'), sec);

  sec.querySelectorAll('.case').forEach((c) => {
    reveal(c.querySelectorAll('.case-text > *'), c, { x: -40, y: 0 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: c, start: 'top 75%', end: 'center 50%', scrub: 0.6 } });
    tl.from(c.querySelectorAll('.node'), { opacity: 0, scale: 0.6, transformOrigin: '50% 50%', stagger: 0.1, ease: 'back.out(2)' })
      .fromTo(c.querySelectorAll('.edge'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, stagger: 0.08, ease: 'none' }, 0.2);
  });
}

export function initContact() {
  const sec = document.querySelector('.contact');
  const figure = sec.querySelector('.contact-samurai');
  const samurai = figure.samurai;
  // He walks back on stage and plants his sword: the bookend to the hero.
  const walkIn = () => window.innerWidth * 0.35;
  const cycles = () => walkIn() / (STRIDE * rigScale(figure));
  samurai.pose({ facing: -1, walkBlend: 1 });

  gsap
    .timeline({ scrollTrigger: { trigger: sec, start: 'top 90%', end: 'top 10%', scrub: true, invalidateOnRefresh: true } })
    .from(sec.querySelectorAll('.mega-back .mega-line'), { yPercent: 80, opacity: 0, stagger: 0.1 }, 0)
    .fromTo(figure, { x: walkIn }, { x: 0, ease: 'none', duration: 0.8 }, 0)
    .fromTo(samurai.state, { walk: 0 }, { walk: cycles, ease: 'none', duration: 0.8, onUpdate: () => samurai.pose() }, 0)
    .fromTo(samurai.state, { walkBlend: 1 }, { walkBlend: 0, duration: 0.25, onUpdate: () => samurai.pose() }, 0.8)
    .from(sec.querySelectorAll('.mega-front .mega-line'), { yPercent: 120, opacity: 0, stagger: 0.1 }, 0.1)
    .from(sec.querySelector('.glow'), { opacity: 0, scale: 0.5 }, 0);
  reveal(sec.querySelectorAll('.contact-card > *'), sec.querySelector('.contact-card'), {}, 'top 95%');
}
