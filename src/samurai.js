// A code-drawn samurai: an SVG rig of jointed parts that can stand, walk, draw and lunge.
// Drawn facing right in a 400×820 box; feet rest on y = 800.

const PALETTES = {
  crimson: {
    armor: '#14161e',
    armorHi: '#252936',
    plate: '#1b1e28',
    lace: '#8e1b24',
    cloth: '#b3122b',
    metal: '#6f727c',
    rim: '#ff4a3d',
    eye: '#ff2a2a',
    horn: '#c9c3b8',
  },
  gold: {
    armor: '#1e1a12',
    armorHi: '#3a301c',
    plate: '#2a2416',
    lace: '#b08a3a',
    cloth: '#c9a04a',
    metal: '#d4a24c',
    rim: '#ffc766',
    eye: '#ffd27a',
    horn: '#e8c46f',
  },
};

const HIP = [200, 470];
const SHOULDER = [205, 292];
const THIGH = 150;
const SHIN = 150;
const UPPER = 108;
const FORE = 100;

// Joint angles in degrees. Positive = clockwise on screen.
const POSES = {
  stand: {
    torso: 0,
    near: { thigh: -6, knee: 4, upper: -30, fore: 45 },
    far: { thigh: 8, knee: 4, upper: -22, fore: 40 },
    sword: 0,
  },
  guard: {
    torso: -4,
    near: { thigh: -16, knee: 14, upper: -70, fore: -90 },
    far: { thigh: 14, knee: 6, upper: -62, fore: -84 },
    sword: -140,
  },
  lunge: {
    torso: -12,
    near: { thigh: -46, knee: 38, upper: -86, fore: -4 },
    far: { thigh: 32, knee: 10, upper: 36, fore: -24 },
    sword: -96,
  },
};

const walkPose = (p) => {
  const t = p * Math.PI * 2;
  const s = Math.sin(t);
  const c = Math.cos(t + 0.3);
  return {
    torso: -3,
    near: { thigh: -24 * s, knee: 6 + 40 * Math.max(0, c), upper: 22 * s, fore: -22 },
    far: { thigh: 24 * s, knee: 6 + 40 * Math.max(0, -c), upper: -22 * s, fore: -28 },
    sword: 28,
  };
};

const lerp = (a, b, t) => a + (b - a) * t;
const mixPose = (a, b, t) => ({
  torso: lerp(a.torso, b.torso, t),
  sword: lerp(a.sword, b.sword, t),
  near: Object.fromEntries(Object.keys(a.near).map((k) => [k, lerp(a.near[k], b.near[k], t)])),
  far: Object.fromEntries(Object.keys(a.far).map((k) => [k, lerp(a.far[k], b.far[k], t)])),
});

// Vertical reach of a leg: how far below the hip its foot lands.
const legDrop = (thigh, knee) => {
  const r = Math.PI / 180;
  return THIGH * Math.cos(thigh * r) + SHIN * Math.cos((thigh + knee) * r);
};

let uid = 0;

const svgMarkup = (id, c) => {
  const leg = (dx, shade) => `
    <g data-part="${shade}Thigh">
      <path d="M${166 + dx} 458 Q${206 + dx} 446 ${246 + dx} 458 L${238 + dx} 626 L${178 + dx} 626 Z" fill="${c.armor}" stroke="${c.rim}" stroke-opacity=".35"/>
      <path d="M${172 + dx} 520 L${242 + dx} 520 M${174 + dx} 560 L${240 + dx} 560 M${177 + dx} 598 L${238 + dx} 598" stroke="${c.armorHi}" stroke-width="3"/>
      <g data-part="${shade}Shin">
        <circle cx="${207 + dx}" cy="622" r="20" fill="${c.plate}" stroke="${c.metal}" stroke-width="2"/>
        <path d="M${184 + dx} 634 L${230 + dx} 634 L${224 + dx} 772 L${190 + dx} 772 Z" fill="${c.plate}" stroke="${c.rim}" stroke-opacity=".35"/>
        <path d="M${198 + dx} 640 L${198 + dx} 764 M${207 + dx} 640 L${207 + dx} 766 M${216 + dx} 640 L${216 + dx} 764" stroke="${c.armorHi}" stroke-width="2.5"/>
        <path d="M${182 + dx} 768 L${230 + dx} 768 L${258 + dx} 800 L${178 + dx} 800 Z" fill="${c.armor}"/>
      </g>
    </g>`;

  const arm = (dx, shade, withSword) => `
    <g data-part="${shade}Upper">
      <path d="M${186 + dx} 292 L${226 + dx} 292 L${222 + dx} 398 L${190 + dx} 398 Z" fill="${c.armor}"/>
      <path d="M${152 + dx} 272 L${258 + dx} 272 L${268 + dx} 386 L${142 + dx} 386 Z" fill="${c.plate}" stroke="${c.rim}" stroke-opacity=".5"/>
      <path d="M${150 + dx} 300 L${261 + dx} 300 M${148 + dx} 328 L${263 + dx} 328 M${146 + dx} 356 L${265 + dx} 356" stroke="${c.lace}" stroke-width="3"/>
      <g data-part="${shade}Fore">
        <circle cx="${205 + dx}" cy="400" r="14" fill="${c.plate}"/>
        <path d="M${187 + dx} 400 L${223 + dx} 400 L${217 + dx} 490 L${193 + dx} 490 Z" fill="${c.plate}" stroke="${c.rim}" stroke-opacity=".35"/>
        <path d="M${196 + dx} 420 L${214 + dx} 420 M${197 + dx} 445 L${213 + dx} 445 M${198 + dx} 470 L${212 + dx} 470" stroke="${c.metal}" stroke-width="2"/>
        ${
          withSword
            ? `<g data-part="katana">
          <rect x="${200 + dx}" y="466" width="10" height="64" rx="3" fill="#0c0d12" stroke="${c.lace}" stroke-width="2" stroke-dasharray="5 4"/>
          <ellipse cx="${205 + dx}" cy="533" rx="14" ry="5" fill="${c.metal}"/>
          <path d="M${201 + dx} 537 L${209 + dx} 537 Q${214 + dx} 690 ${203 + dx} 830 Q${203 + dx} 690 ${201 + dx} 537 Z" fill="url(#${id}-blade)"/>
        </g>`
            : ''
        }
        <circle cx="${205 + dx}" cy="500" r="13" fill="${c.armor}" stroke="${c.rim}" stroke-opacity=".4"/>
      </g>
    </g>`;

  return `
  <svg class="samurai-svg" viewBox="0 0 400 820" overflow="visible" aria-hidden="true">
    <defs>
      <linearGradient id="${id}-blade" x1="0" x2="1">
        <stop offset="0" stop-color="#8d929e"/>
        <stop offset=".5" stop-color="#f4f1ea"/>
        <stop offset="1" stop-color="#9aa0ac"/>
      </linearGradient>
      <radialGradient id="${id}-eye">
        <stop offset="0" stop-color="#fff"/>
        <stop offset=".4" stop-color="${c.eye}"/>
        <stop offset="1" stop-color="${c.eye}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <ellipse cx="200" cy="802" rx="120" ry="9" fill="#000" opacity=".55"/>
    <g data-part="root">
      <g data-part="cloak">
        <path d="M150 280 Q205 262 262 282 L296 690 L278 650 L266 720 L246 668 L228 746 L208 680 L188 738 L172 670 L150 724 L140 660 L118 700 L124 600 Z" fill="#0d0e14" stroke="${c.rim}" stroke-opacity=".5" stroke-width="2"/>
        <path d="M150 200 C120 270 112 340 122 420 M160 196 C136 280 134 360 146 450 M146 206 C104 280 96 380 108 470" stroke="#07080b" stroke-width="9" fill="none" stroke-linecap="round"/>
      </g>
      <g opacity=".75">${leg(-14, 'far')}</g>
      <g data-part="torsoBack">
        <g opacity=".75">${arm(-12, 'far', false)}</g>
        <!-- Kusazuri (armoured skirt) -->
        <path d="M132 446 L270 446 L298 596 L282 584 L266 604 L246 588 L224 608 L204 590 L182 606 L160 588 L140 602 L122 586 L104 598 Z" fill="${c.plate}" stroke="${c.rim}" stroke-opacity=".4"/>
        <path d="M128 480 L276 480 M122 514 L282 514 M116 548 L288 548 M166 446 L150 590 M236 446 L252 590" stroke="${c.lace}" stroke-width="3"/>
        <!-- Do (chest plate) -->
        <path d="M136 290 Q202 262 268 290 L272 440 L132 440 Z" fill="${c.armor}" stroke="${c.rim}" stroke-opacity=".55" stroke-width="2"/>
        <path d="M138 330 Q202 316 268 330 M136 362 Q202 348 270 362 M134 394 Q202 380 271 394" stroke="${c.armorHi}" stroke-width="4" fill="none"/>
        <path d="M137 346 Q202 332 269 346 M135 378 Q202 364 270 378 M134 410 Q202 396 271 410" stroke="${c.lace}" stroke-width="2" stroke-dasharray="3 7" fill="none"/>
        <!-- Obi (sash) -->
        <path d="M130 426 L274 426 L274 454 L130 454 Z" fill="${c.cloth}"/>
        <path d="M168 452 Q160 500 150 540 L166 542 Q176 500 184 452 Z" fill="${c.cloth}" opacity=".9"/>
        <!-- Head -->
        <g data-part="head">
          <path d="M146 212 Q203 196 256 210 L272 262 Q206 284 134 258 Z" fill="${c.plate}" stroke="${c.rim}" stroke-opacity=".45"/>
          <path d="M142 232 Q204 218 262 230 M138 248 Q205 236 268 246" stroke="${c.lace}" stroke-width="3" fill="none"/>
          <ellipse cx="203" cy="186" rx="54" ry="46" fill="${c.armor}" stroke="${c.rim}" stroke-opacity=".6" stroke-width="2"/>
          <path d="M160 170 Q203 150 246 170 M156 186 Q203 168 250 186" stroke="${c.armorHi}" stroke-width="3" fill="none"/>
          <path d="M150 204 Q205 190 262 204 L266 214 Q205 202 146 214 Z" fill="${c.metal}"/>
          <path d="M213 156 C224 112 246 82 268 58" stroke="${c.horn}" stroke-width="7" fill="none" stroke-linecap="round"/>
          <path d="M199 156 C188 112 170 86 150 66" stroke="${c.horn}" stroke-width="7" fill="none" stroke-linecap="round"/>
          <circle cx="206" cy="160" r="9" fill="${c.cloth}" stroke="${c.metal}" stroke-width="2"/>
          <!-- Menpo (face mask) -->
          <path d="M184 212 L254 214 L250 250 Q222 262 196 254 Z" fill="#0b0c11" stroke="${c.metal}" stroke-width="1.5"/>
          <path d="M200 238 Q222 246 246 236" stroke="${c.metal}" stroke-width="2" fill="none"/>
          <ellipse cx="226" cy="222" rx="18" ry="6" fill="url(#${id}-eye)"/>
          <path d="M212 222 L240 222" stroke="${c.eye}" stroke-width="2.5" stroke-linecap="round"/>
        </g>
      </g>
      ${leg(0, 'near')}
      <g data-part="torsoFront">
        <path d="M170 452 L238 452 L250 600 L236 590 L220 606 L204 592 L188 606 L172 592 L160 600 Z" fill="${c.plate}" stroke="${c.rim}" stroke-opacity=".4"/>
        <path d="M168 486 L240 486 M166 520 L243 520 M164 554 L246 554" stroke="${c.lace}" stroke-width="3"/>
        ${arm(0, 'near', true)}
      </g>
    </g>
  </svg>`;
};

export function createSamurai({ variant = 'crimson' } = {}) {
  const id = `sam${uid++}`;
  const wrap = document.createElement('div');
  wrap.className = `samurai samurai-${variant}`;
  wrap.innerHTML = svgMarkup(id, PALETTES[variant]);

  const part = (name) => wrap.querySelector(`[data-part="${name}"]`);
  const el = {
    root: part('root'),
    cloak: part('cloak'),
    torsoBack: part('torsoBack'),
    torsoFront: part('torsoFront'),
    head: part('head'),
    nearThigh: part('nearThigh'),
    nearShin: part('nearShin'),
    farThigh: part('farThigh'),
    farShin: part('farShin'),
    nearUpper: part('nearUpper'),
    nearFore: part('nearFore'),
    farUpper: part('farUpper'),
    farFore: part('farFore'),
    katana: part('katana'),
  };
  const rot = (node, a, [x, y]) => node.setAttribute('transform', `rotate(${a.toFixed(2)} ${x} ${y})`);

  const state = { walk: 0, walkBlend: 0, draw: 0, lunge: 0, facing: 1 };

  function pose(next = {}) {
    Object.assign(state, next);
    let p = mixPose(POSES.stand, walkPose(state.walk), state.walkBlend);
    p = mixPose(p, POSES.guard, state.draw);
    p = mixPose(p, POSES.lunge, state.lunge);

    // Drop the hips so the lower foot stays planted on the ground.
    const reach = Math.max(legDrop(p.near.thigh, p.near.knee), legDrop(p.far.thigh, p.far.knee));
    const bob = THIGH + SHIN - reach;
    const flip = state.facing < 0 ? 'translate(400 0) scale(-1 1)' : '';
    el.root.setAttribute('transform', `${flip} translate(0 ${bob.toFixed(2)})`);

    rot(el.torsoBack, p.torso, HIP);
    rot(el.cloak, p.torso * 0.6 + state.walkBlend * 5 * Math.sin(state.walk * Math.PI * 4) + state.lunge * 8, [205, 280]);
    rot(el.torsoFront, p.torso, HIP);
    rot(el.head, -p.torso * 0.5, [203, 262]);
    rot(el.nearThigh, p.near.thigh, [206, 470]);
    rot(el.nearShin, p.near.knee, [207, 622]);
    rot(el.farThigh, p.far.thigh, [192, 470]);
    rot(el.farShin, p.far.knee, [193, 622]);
    rot(el.nearUpper, p.near.upper, SHOULDER);
    rot(el.nearFore, p.near.fore, [205, 400]);
    rot(el.farUpper, p.far.upper, [193, 292]);
    rot(el.farFore, p.far.fore, [193, 400]);
    // Sword angle is given in world space; convert it to the hand's frame.
    rot(el.katana, p.sword - p.torso - p.near.upper - p.near.fore, [205, 500]);
  }

  pose();
  return { el: wrap, pose, state };
}

// Ground covered by one full walk cycle, in rig units (two steps).
export const STRIDE = 2 * 2 * (THIGH + SHIN) * Math.sin((24 * Math.PI) / 180);

// Rig units → CSS pixels for a mounted samurai.
export const rigScale = (slot) => slot.getBoundingClientRect().height / 820;

// Tween target + vars that re-pose the rig on every frame: tl.to(...poseTo(s, { draw: 1 })).
export const poseTo = (samurai, vars) => [samurai.state, { ...vars, onUpdate: () => samurai.pose() }];
