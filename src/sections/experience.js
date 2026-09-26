import { gsap } from 'gsap';

export function initExperience({ desktop }) {
  const sec = document.querySelector('.experience');
  const card = sec.querySelector('.exp-card');
  const portrait = sec.querySelector('.exp-portrait');

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

  // Entrance plays while the section scrolls into view, so it never arrives empty.
  gsap
    .timeline({ scrollTrigger: { trigger: sec, start: 'top 85%', end: 'top 10%', scrub: 0.6 } })
    .from(portrait, { xPercent: 20, opacity: 0, filter: 'blur(10px)', duration: 1 })
    .from(card, { xPercent: -130, rotate: -6, duration: 1, ease: 'power3.out' }, 0.2)
    .from(roles[0].children, { y: 20, opacity: 0, stagger: 0.08, duration: 0.4 }, 0.8);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sec.querySelector('.exp-pin'),
      start: 'top top',
      end: '+=260%',
      pin: true,
      scrub: 0.6,
    },
  });
  tl.to({}, { duration: 0.4 });

  roles.forEach((role, i) => {
    if (!i) return;
    const at = (i - 1) * 1.2 + 0.4;
    tl.to(roles[i - 1], { opacity: 0, y: -30, duration: 0.4 }, at)
      .fromTo(role, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5 }, at + 0.3)
      .to(portrait, { xPercent: -4 * i, scale: 1 + 0.04 * i, duration: 0.9 }, at)
      .call(() => setActive(tl.scrollTrigger.direction > 0 ? i : i - 1), null, at + 0.3);
  });
  tl.to({}, { duration: 0.6 });
}
