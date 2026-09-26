// Full-screen canvas of drifting embers, plus one-off spark bursts.

export function createEmbers(canvas, { count = 70 } = {}) {
  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let dpr = 1;
  let tint = [255, 70, 50];
  let targetTint = tint;
  const embers = [];
  const sparks = [];

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const spawn = (e = {}) => {
    e.x = Math.random() * w;
    e.y = h + Math.random() * h * 0.5;
    e.r = Math.random() * 1.8 + 0.4;
    e.vy = -(Math.random() * 0.6 + 0.2);
    e.vx = (Math.random() - 0.5) * 0.3;
    e.life = Math.random() * 0.6 + 0.4;
    e.phase = Math.random() * Math.PI * 2;
    return e;
  };

  resize();
  for (let i = 0; i < count; i++) {
    const e = spawn();
    e.y = Math.random() * h;
    embers.push(e);
  }
  window.addEventListener('resize', resize);

  let scrollVel = 0;
  const tick = (t) => {
    ctx.clearRect(0, 0, w, h);
    tint = tint.map((c, i) => c + (targetTint[i] - c) * 0.04);
    const [r, g, b] = tint.map(Math.round);
    ctx.globalCompositeOperation = 'lighter';

    for (const e of embers) {
      e.x += e.vx + Math.sin(t / 900 + e.phase) * 0.25;
      e.y += e.vy - scrollVel * 0.02;
      if (e.y < -20 || e.y > h + h * 0.6) spawn(e);
      const a = e.life * (0.5 + 0.5 * Math.sin(t / 400 + e.phase));
      ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.12;
      s.vx *= 0.985;
      s.life -= 0.016;
      if (s.life <= 0) {
        sparks.splice(i, 1);
        continue;
      }
      ctx.strokeStyle = `rgba(255,${180 + Math.round(60 * s.life)},90,${s.life})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * 3, s.y - s.vy * 3);
      ctx.stroke();
    }

    scrollVel *= 0.9;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  return {
    setVelocity(v) {
      scrollVel = Math.max(-60, Math.min(60, v));
    },
    setTint(rgb) {
      targetTint = rgb;
    },
    burst(x = w / 2, y = h / 2, n = 90) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = Math.random() * 9 + 2;
        sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, life: Math.random() * 0.6 + 0.5 });
      }
    },
  };
}
