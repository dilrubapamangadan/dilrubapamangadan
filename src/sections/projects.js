import { gsap } from 'gsap';
import { duel } from '../content.js';

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
    },
  });

  tl.from(sec.querySelector('.duel-bg-l'), { xPercent: -40, opacity: 0, duration: 1 }, 0)
    .from(sec.querySelector('.duel-bg-r'), { xPercent: 40, opacity: 0, duration: 1 }, 0)
    .fromTo(sec.querySelector('.duel-word'), { xPercent: 35 }, { xPercent: -35, duration: 4 }, 0)
    .from(sec.querySelector('.duel-l'), { x: -120, opacity: 0, duration: 0.8 }, 0.3)
    .from(sec.querySelector('.duel-r'), { x: 120, opacity: 0, duration: 0.8 }, 0.3)
    // Blades close in and cross.
    .fromTo(sec.querySelectorAll('.duel-blades i'), { rotate: (i) => (i ? 60 : -60), opacity: 0 }, { rotate: (i) => (i ? -22 : 22), opacity: 1, duration: 1 }, 1)
    .to(sec.querySelector('.duel-l'), { x: 60, opacity: 0, duration: 0.6 }, 1.5)
    .to(sec.querySelector('.duel-r'), { x: -60, opacity: 0, duration: 0.6 }, 1.5)
    .call(() => tl.scrollTrigger.direction > 0 && embers?.burst(window.innerWidth / 2, window.innerHeight * 0.42, 140), null, 2)
    .to(sec.querySelector('.duel-pin'), { '--flash': 1, duration: 0.1 }, 2)
    .to(sec.querySelector('.duel-pin'), { '--flash': 0, duration: 0.4 }, 2.1)
    .from(sec.querySelector('.duel-counter'), { opacity: 0, scale: 0.8, duration: 0.5 }, 2.1)
    .to(counter, { v: duel.counter.to, duration: 1.4, onUpdate: () => (num.textContent = Math.round(counter.v)) }, 2.2)
    // Everything else falls out of focus, like the reference's depth-of-field pull.
    .to(sec.querySelectorAll('.duel-bg, .duel-blades, .duel-word'), { filter: 'blur(8px) brightness(0.6)', duration: 1 }, 3)
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
