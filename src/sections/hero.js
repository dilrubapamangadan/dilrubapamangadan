import { gsap } from 'gsap';

const countUp = (el) => {
  const to = Number(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const obj = { v: to > 1000 ? to - 18 : 0 };
  gsap.to(obj, {
    v: to,
    duration: 1.8,
    delay: 0.9,
    ease: 'power3.out',
    onUpdate: () => (el.textContent = Math.round(obj.v) + suffix),
  });
};

export function initHero({ desktop }) {
  const hero = document.querySelector('.hero');
  const stage = hero.querySelector('.hero-stage');
  const back = hero.querySelector('.mega-back');
  const front = hero.querySelector('.mega-front');
  const portrait = hero.querySelector('.hero-portrait');

  // Intro: letters rise, portrait steps forward, brush strokes slash in.
  const intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
  intro
    .from(hero.querySelector('.glow'), { opacity: 0, scale: 0.6, duration: 1.6 })
    .from(back.querySelectorAll('.mega-line'), { yPercent: 60, opacity: 0, filter: 'blur(12px)', stagger: 0.12, duration: 1.3 }, 0.1)
    .from(portrait, { y: 80, opacity: 0, duration: 1.4 }, 0.25)
    .from(front.querySelectorAll('.mega-line'), { yPercent: 60, opacity: 0, stagger: 0.12, duration: 1.3 }, 0.35)
    .fromTo(hero.querySelectorAll('.slashes path'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5, stagger: 0.12, ease: 'power2.inOut' }, 0.8)
    .from(hero.querySelectorAll('.hero-kicker, .hero-headline, .hero-foot, .scroll-cue'), { y: 24, opacity: 0, stagger: 0.08, duration: 1 }, 0.9);
  hero.querySelectorAll('[data-count]').forEach(countUp);

  // Scroll out: the title blows past the camera, the portrait pushes in.
  gsap
    .timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } })
    .to(back, { scale: 1.35, yPercent: -18, opacity: 0, ease: 'none' }, 0)
    .to(front, { scale: 1.6, yPercent: -30, opacity: 0, ease: 'none' }, 0)
    .to(stage, { scale: 1.12, yPercent: 8, ease: 'none' }, 0)
    .to(hero.querySelectorAll('.hero-kicker, .hero-headline, .hero-foot, .scroll-cue, .slashes'), { opacity: 0, y: -40, ease: 'none' }, 0);

  if (!desktop) return;

  // Subtle depth on pointer move: layers drift at different rates.
  const layers = [
    [back, 14],
    [portrait, -10],
    [front, 26],
  ].map(([el, d]) => ({ x: gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power3' }), d }));
  hero.addEventListener('pointermove', (e) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    layers.forEach((l) => l.x(nx * l.d * 2));
  });
}
