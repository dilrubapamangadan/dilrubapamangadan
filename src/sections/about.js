import { gsap } from 'gsap';

export function initAbout({ desktop }) {
  const sec = document.querySelector('.about');
  const panel = sec.querySelector('.about-panel');
  const portrait = sec.querySelector('.spec-portrait');

  if (!desktop) {
    gsap.from(sec.querySelectorAll('.about-panel > *, .spec-portrait, .spec-callout'), {
      y: 40,
      opacity: 0,
      stagger: 0.08,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: sec, start: 'top 75%' },
    });
    return;
  }

  const lines = sec.querySelectorAll('.spec-line');
  const dots = sec.querySelectorAll('.spec-dot');
  const callouts = sec.querySelectorAll('.spec-callout');
  const index = sec.querySelector('.spec-index');

  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
    scrollTrigger: {
      trigger: sec.querySelector('.about-pin'),
      start: 'top top',
      end: '+=320%',
      pin: true,
      scrub: 0.6,
    },
  });

  tl.from(portrait, { scale: 1.25, yPercent: 10, filter: 'brightness(0.4)', duration: 1 })
    .from(panel.children, { x: -60, opacity: 0, stagger: 0.12, duration: 0.8 }, 0.2);

  callouts.forEach((c, i) => {
    const at = 1.2 + i * 1.1;
    tl.from(dots[i], { scale: 0, opacity: 0, duration: 0.25 }, at)
      .from(lines[i], { scaleX: 0, duration: 0.5, ease: 'none' }, at + 0.1)
      .from(c, { opacity: 0, x: c.classList.contains('spec-right') ? 30 : -30, duration: 0.4 }, at + 0.45)
      .call(() => (index.textContent = String(i + 1).padStart(2, '0')), null, at + 0.2);
    if (i > 0) tl.to([callouts[i - 1], lines[i - 1], dots[i - 1]], { opacity: 0.35, duration: 0.3 }, at);
  });
  tl.to({}, { duration: 0.6 });
}
