import { gsap } from 'gsap';
import { STRIDE, rigScale, poseTo } from '../samurai.js';

export function initExperience({ desktop }) {
  const sec = document.querySelector('.experience');
  const card = sec.querySelector('.exp-card');
  const figure = sec.querySelector('.exp-samurai');
  const samurai = figure.samurai;

  if (!desktop) {
    gsap.from([card, ...sec.querySelectorAll('.exp-role')], {
      y: 50,
      opacity: 0,
      stagger: 0.1,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: sec, start: 'top 75%' },
    });
    return;
  }

  // Roles overlap in one slot and cross-fade while the section is pinned.
  card.classList.add('is-stepped');
  const roles = sec.querySelectorAll('.exp-role');
  const steps = sec.querySelectorAll('.exp-step');
  const shot = sec.querySelector('.exp-shot-i');
  const setActive = (i) => {
    steps.forEach((s, j) => s.classList.toggle('active', j <= i));
    shot.textContent = String(i + 1).padStart(2, '0');
  };
  setActive(0);

  // The samurai walks in from the right, feet matched to the distance travelled.
  const walkIn = () => window.innerWidth * 0.5;
  const cycles = () => walkIn() / (STRIDE * rigScale(figure));
  samurai.pose({ facing: -1, walkBlend: 1 });

  gsap
    .timeline({ scrollTrigger: { trigger: sec, start: 'top 85%', end: 'top top', scrub: 0.4 } })
    .from(card, { xPercent: -130, rotate: -6, duration: 0.7, ease: 'power3.out' }, 0.3)
    .from(roles[0].children, { y: 20, opacity: 0, stagger: 0.06, duration: 0.3 }, 0.7);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sec.querySelector('.exp-pin'),
      start: 'top top',
      end: '+=340%',
      pin: true,
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
  });
  // He walks on while the section is held, comes to a halt, then readies his blade as the career advances.
  tl.fromTo(figure, { x: walkIn }, { x: 0, ease: 'none', duration: 1.2 }, 0)
    .fromTo(samurai.state, { walk: 0 }, { walk: cycles, ease: 'none', duration: 1.2, onUpdate: () => samurai.pose() }, 0)
    .fromTo(samurai.state, { walkBlend: 1 }, { walkBlend: 0, duration: 0.3, onUpdate: () => samurai.pose() }, 1.15);

  roles.forEach((role, i) => {
    if (!i) return;
    const at = (i - 1) * 1.2 + 1.7;
    tl.to(roles[i - 1], { opacity: 0, y: -30, duration: 0.4 }, at)
      .fromTo(role, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5 }, at + 0.3)
      .to(...poseTo(samurai, { draw: i / (roles.length - 1) * 0.8, duration: 0.9 }), at)
      .call(() => setActive(tl.scrollTrigger.direction > 0 ? i : i - 1), null, at + 0.3);
  });
  tl.to({}, { duration: 0.6 });
}
