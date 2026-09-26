import { gsap } from 'gsap';
import { duel } from '../content.js';
import { STRIDE, rigScale } from '../samurai.js';

export function initDuel({ embers }) {
  const sec = document.querySelector('.duel');
  const num = sec.querySelector('.duel-num');
  const counter = { v: duel.counter.from };

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: sec.querySelector('.duel-pin'),
      start: 'top top',
      end: '+=260%',
      pin: true,
      scrub: 0.5,
      invalidateOnRefresh: true,
    },
  });

  const left = sec.querySelector('.duel-samurai-l');
  const right = sec.querySelector('.duel-samurai-r');
  const [red, gold] = [left.samurai, right.samurai];
  gold.pose({ facing: -1 });
  const approach = () => window.innerWidth * 0.3;
  const cycles = () => approach() / (STRIDE * rigScale(left));
  const both = { walk: 0, walkBlend: 1, lunge: 0 };
  const poseBoth = () => {
    red.pose(both);
    gold.pose(both);
  };
  poseBoth();

  tl.from(sec.querySelector('.duel-bg-l'), { xPercent: -40, opacity: 0, duration: 1 }, 0)
    .from(sec.querySelector('.duel-bg-r'), { xPercent: 40, opacity: 0, duration: 1 }, 0)
    .fromTo(sec.querySelector('.duel-word'), { xPercent: 35 }, { xPercent: -35, duration: 4 }, 0)
    .from(sec.querySelector('.duel-l'), { x: -120, opacity: 0, duration: 0.8 }, 0.3)
    .from(sec.querySelector('.duel-r'), { x: 120, opacity: 0, duration: 0.8 }, 0.3)
    // The two warriors close the distance, step for step...
    .fromTo(left, { x: () => -approach() }, { x: 0, duration: 1.4 }, 0)
    .fromTo(right, { x: approach }, { x: 0, duration: 1.4 }, 0)
    .fromTo(both, { walk: 0 }, { walk: cycles, duration: 1.4, onUpdate: poseBoth }, 0)
    .to(sec.querySelector('.duel-l'), { x: 60, opacity: 0, duration: 0.6 }, 1.3)
    .to(sec.querySelector('.duel-r'), { x: -60, opacity: 0, duration: 0.6 }, 1.3)
    // ...then strike, and the blades meet.
    .to(both, { walkBlend: 0, lunge: 1, duration: 0.6, ease: 'power2.in', onUpdate: poseBoth }, 1.4)
    .call(() => {
      if (tl.scrollTrigger.direction < 0) return;
      const r = left.getBoundingClientRect();
      embers?.burst(window.innerWidth / 2, r.top + r.height * 0.34, 140);
    }, null, 2)
    .to(sec.querySelector('.duel-pin'), { '--flash': 1, duration: 0.1 }, 2)
    .to(sec.querySelector('.duel-pin'), { '--flash': 0, duration: 0.4 }, 2.1)
    .from(sec.querySelector('.duel-counter'), { opacity: 0, scale: 0.8, duration: 0.5 }, 2.1)
    .to(counter, { v: duel.counter.to, duration: 1.4, onUpdate: () => (num.textContent = Math.round(counter.v)) }, 2.2)
    // Everything else falls out of focus, like the reference's depth-of-field pull.
    .to(sec.querySelectorAll('.duel-bg, .duel-samurai, .duel-word'), { filter: 'blur(8px) brightness(0.6)', duration: 1 }, 3)
    .to({}, { duration: 0.4 });
}

export function initGallery({ desktop }) {
  const sec = document.querySelector('.gallery');
  const cards = sec.querySelectorAll('.project');

  if (!desktop) {
    cards.forEach((c) =>
      gsap.from(c, { y: 60, opacity: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: c, start: 'top 85%' } })
    );
    return;
  }

  const track = sec.querySelector('.gallery-track');
  const distance = () => track.scrollWidth - window.innerWidth + 80;
  gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: sec.querySelector('.gallery-pin'),
      start: 'top top',
      end: () => '+=' + distance(),
      pin: true,
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
  });
  gsap.from(cards, {
    opacity: 0,
    y: 80,
    rotate: 3,
    stagger: 0.1,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: { trigger: sec, start: 'top 60%' },
  });
}
