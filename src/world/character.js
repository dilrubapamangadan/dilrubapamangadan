import * as THREE from 'three';

// A cartoon developer built from primitives: big head, glasses, short beard, orange hoodie,
// jeans and sneakers. Toon-shaded with inverted-hull outlines. Faces +z; feet on y = 0.

const THIGH = 0.4;
const SHIN = 0.5; // knee → sole
const HIP_H = THIGH + SHIN;

const COLORS = {
  skin: '#e2a878',
  hair: '#2a1c15',
  hoodie: '#ff7a3d',
  hoodieDark: '#e0602a',
  jeans: '#2f5597',
  shoe: '#f4f4f2',
  sole: '#ff7a3d',
  frame: '#1a1d26',
  white: '#ffffff',
  pupil: '#1b1b22',
  mouth: '#6b2a26',
};

function toonGradient() {
  const data = new Uint8Array([90, 170, 255]);
  const tex = new THREE.DataTexture(data, data.length, 1, THREE.RedFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

function logoTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#ffffff';
  g.font = 'bold 64px monospace';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('</>', 64, 66);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createCharacter() {
  const gradientMap = toonGradient();
  const mats = {};
  const mat = (key) =>
    (mats[key] ??= new THREE.MeshToonMaterial({ color: COLORS[key], gradientMap }));
  const outlineMat = new THREE.MeshBasicMaterial({ color: '#0a0c12', side: THREE.BackSide });

  // Mesh with an inverted-hull outline; geometry must be centred on its own origin.
  const part = (geo, key, { outline = 0.045, pos, rot, scale } = {}) => {
    const m = new THREE.Mesh(geo, mat(key));
    m.castShadow = true;
    if (pos) m.position.set(...pos);
    if (rot) m.rotation.set(...rot);
    if (scale) m.scale.set(...scale);
    if (outline) {
      const o = new THREE.Mesh(geo, outlineMat);
      o.scale.setScalar(1 + outline);
      m.add(o);
    }
    return m;
  };
  const group = (pos = [0, 0, 0]) => {
    const g = new THREE.Group();
    g.position.set(...pos);
    return g;
  };
  const capsule = (r, len) => new THREE.CapsuleGeometry(r, len, 6, 14);
  const sphere = (r, ...args) => new THREE.SphereGeometry(r, 28, 18, ...args);

  const root = group();
  const body = group([0, HIP_H, 0]); // hips; moved up/down for the walk bob
  root.add(body);

  // --- Pelvis & torso -------------------------------------------------------
  body.add(part(sphere(0.3), 'jeans', { pos: [0, 0.03, 0], scale: [1, 0.55, 0.72] }));
  const torso = group([0, 0.05, 0]);
  body.add(torso);
  torso.add(part(capsule(0.29, 0.34), 'hoodie', { pos: [0, 0.3, 0], scale: [1, 1, 0.78] }));
  torso.add(part(new THREE.TorusGeometry(0.29, 0.045, 8, 24), 'hoodieDark', { pos: [0, 0.02, 0], rot: [Math.PI / 2, 0, 0], scale: [1, 0.78, 1], outline: 0.02 }));
  const hood = part(new THREE.TorusGeometry(0.17, 0.075, 10, 20), 'hoodieDark', { pos: [0, 0.6, -0.11], rot: [Math.PI / 2.4, 0, 0] });
  torso.add(hood);
  [-0.07, 0.07].forEach((x) =>
    torso.add(part(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 6), 'white', { pos: [x, 0.47, 0.225], outline: 0 }))
  );
  const logo = new THREE.Mesh(
    new THREE.PlaneGeometry(0.24, 0.24),
    new THREE.MeshBasicMaterial({ map: logoTexture(), transparent: true })
  );
  logo.position.set(0, 0.32, 0.232);
  torso.add(logo);

  // --- Head -----------------------------------------------------------------
  const neck = group([0, 0.62, 0]);
  torso.add(neck);
  neck.add(part(new THREE.CylinderGeometry(0.075, 0.085, 0.14, 12), 'skin', { pos: [0, 0.02, 0], outline: 0 }));
  const head = group([0, 0.38, 0.01]);
  neck.add(head);
  head.add(part(sphere(0.4), 'skin', { scale: [1, 1.03, 0.95] }));
  [-1, 1].forEach((sx) => head.add(part(sphere(0.085), 'skin', { pos: [0.39 * sx, -0.02, -0.02], scale: [0.6, 1, 1] })));

  // Hair: a cap over the top and back, plus a quiff at the front.
  head.add(part(sphere(0.42, 0, Math.PI * 2, 0, Math.PI * 0.46), 'hair', { pos: [0, 0.03, -0.02], rot: [-0.28, 0, 0] }));
  head.add(part(sphere(0.18), 'hair', { pos: [0.02, 0.34, 0.16], rot: [0.5, 0, -0.3], scale: [1.3, 0.55, 1] }));
  head.add(part(sphere(0.14), 'hair', { pos: [-0.16, 0.3, 0.14], rot: [0.4, 0, 0.4], scale: [1.2, 0.5, 1] }));

  // Short beard hugging the jaw, and a moustache.
  const beard = new THREE.Mesh(
    sphere(0.403, Math.PI * 0.18, Math.PI * 0.64, Math.PI * 0.66, Math.PI * 0.22),
    new THREE.MeshToonMaterial({ color: COLORS.hair, gradientMap, side: THREE.DoubleSide })
  );
  beard.scale.set(1.02, 1.04, 0.97);
  head.add(beard);
  head.add(part(capsule(0.03, 0.12), 'hair', { pos: [0, -0.1, 0.375], rot: [0, 0, Math.PI / 2], outline: 0 }));
  head.add(part(new THREE.TorusGeometry(0.06, 0.016, 8, 16, Math.PI), 'mouth', { pos: [0, -0.16, 0.36], rot: [0, 0, Math.PI], outline: 0 }));
  head.add(part(sphere(0.055), 'skin', { pos: [0, -0.02, 0.4], outline: 0.08 }));

  // Eyes, brows, glasses.
  const eyes = [];
  [-1, 1].forEach((sx) => {
    const eye = group([0.14 * sx, 0.06, 0.33]);
    eye.add(part(sphere(0.085), 'white', { scale: [1, 1.1, 0.55], outline: 0 }));
    eye.add(part(sphere(0.045), 'pupil', { pos: [0, -0.005, 0.04], scale: [1, 1.1, 0.5], outline: 0 }));
    eye.add(part(sphere(0.014), 'white', { pos: [0.015, 0.018, 0.064], outline: 0 }));
    head.add(eye);
    eyes.push(eye);
    head.add(part(capsule(0.018, 0.09), 'hair', { pos: [0.14 * sx, 0.2, 0.35], rot: [0, 0, Math.PI / 2 + 0.12 * sx], outline: 0 }));
    head.add(part(new THREE.TorusGeometry(0.11, 0.017, 8, 24), 'frame', { pos: [0.14 * sx, 0.06, 0.39], outline: 0 }));
    head.add(part(new THREE.BoxGeometry(0.02, 0.02, 0.36), 'frame', { pos: [0.25 * sx, 0.07, 0.2], rot: [0, -0.12 * sx, 0], outline: 0 }));
  });
  head.add(part(new THREE.CylinderGeometry(0.012, 0.012, 0.07, 6), 'frame', { pos: [0, 0.08, 0.4], rot: [0, 0, Math.PI / 2], outline: 0 }));

  // --- Limbs ----------------------------------------------------------------
  const arms = {};
  ['L', 'R'].forEach((side) => {
    const sx = side === 'L' ? 1 : -1; // character's left is +x
    const shoulder = group([0.34 * sx, 0.52, 0]);
    torso.add(shoulder);
    shoulder.add(part(capsule(0.088, 0.2), 'hoodie', { pos: [0, -0.14, 0] }));
    const elbow = group([0, -0.3, 0]);
    shoulder.add(elbow);
    elbow.add(part(capsule(0.078, 0.17), 'hoodie', { pos: [0, -0.12, 0] }));
    elbow.add(part(new THREE.TorusGeometry(0.07, 0.025, 8, 16), 'hoodieDark', { pos: [0, -0.24, 0], rot: [Math.PI / 2, 0, 0], outline: 0 }));
    elbow.add(part(sphere(0.085), 'skin', { pos: [0, -0.31, 0] }));
    arms[side] = { shoulder, elbow, sx };
  });

  const legs = {};
  ['L', 'R'].forEach((side) => {
    const sx = side === 'L' ? 1 : -1;
    const hip = group([0.14 * sx, 0, 0]);
    body.add(hip);
    hip.add(part(capsule(0.115, 0.22), 'jeans', { pos: [0, -0.2, 0] }));
    const knee = group([0, -THIGH, 0]);
    hip.add(knee);
    knee.add(part(capsule(0.1, 0.24), 'jeans', { pos: [0, -0.2, 0] }));
    knee.add(part(capsule(0.1, 0.17), 'shoe', { pos: [0, -0.41, 0.07], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.85] }));
    knee.add(part(new THREE.BoxGeometry(0.2, 0.05, 0.36), 'sole', { pos: [0, -0.475, 0.07], outline: 0.03 }));
    legs[side] = { hip, knee };
  });

  // --- Animation --------------------------------------------------------------
  const TAU = Math.PI * 2;
  let blinkT = 2;

  function update(dt, s) {
    const { phase = 0, walk = 0, wave = 0, time = 0, calm = false } = s;
    const t = phase * TAU;
    const sin = Math.sin(t);
    const c = Math.cos(t + 0.3);
    const idle = 1 - walk;
    const breathe = calm ? 0 : Math.sin(time * 2.2);

    // Legs: swing forward (negative x) with knees flexing through the swing phase.
    const thighL = -0.5 * sin * walk + 0.02 * idle;
    const thighR = 0.5 * sin * walk - 0.02 * idle;
    const kneeL = walk * (0.08 + 0.85 * Math.max(0, c)) + 0.03 * idle;
    const kneeR = walk * (0.08 + 0.85 * Math.max(0, -c)) + 0.03 * idle;
    legs.L.hip.rotation.x = thighL;
    legs.L.knee.rotation.x = kneeL;
    legs.R.hip.rotation.x = thighR;
    legs.R.knee.rotation.x = kneeR;

    // Keep the lower foot planted: drop the hips by however much the legs have shortened.
    const reach = (a, k) => THIGH * Math.cos(a) + SHIN * Math.cos(a + k);
    const drop = HIP_H - Math.max(reach(thighL, kneeL), reach(thighR, kneeR));
    body.position.y = HIP_H - drop + 0.006 * breathe;

    // Torso counter-rotates; arms swing opposite to the legs.
    torso.rotation.y = 0.14 * sin * walk + (calm ? 0 : 0.05 * Math.sin(time * 0.7) * idle);
    torso.rotation.x = 0.07 * walk;
    torso.scale.y = 1 + 0.012 * breathe * idle;
    arms.L.shoulder.rotation.set(0.5 * sin * walk, 0, 0.1 + 0.03 * breathe * idle);
    arms.R.shoulder.rotation.set(-0.5 * sin * walk, 0, -0.1 - 0.03 * breathe * idle);
    arms.L.elbow.rotation.set(-0.35 * walk - 0.12 * idle, 0, 0);
    arms.R.elbow.rotation.set(-0.35 * walk - 0.12 * idle, 0, 0);

    // Wave with the right hand.
    if (wave > 0) {
      const R = arms.R;
      R.shoulder.rotation.z = THREE.MathUtils.lerp(R.shoulder.rotation.z, -2.75, wave);
      R.shoulder.rotation.x = THREE.MathUtils.lerp(R.shoulder.rotation.x, -0.25, wave);
      R.elbow.rotation.z = wave * (0.2 + 0.45 * Math.sin(time * 9));
      R.elbow.rotation.x = THREE.MathUtils.lerp(R.elbow.rotation.x, -0.2, wave);
    } else {
      arms.R.elbow.rotation.z = 0;
    }

    // Head: bob with the steps, glance around when idle.
    head.rotation.y = calm ? 0 : 0.28 * Math.sin(time * 0.45) * idle - torso.rotation.y * 0.6;
    head.rotation.x = -0.05 * walk + 0.03 * Math.sin(time * 0.9) * idle * (calm ? 0 : 1);
    head.rotation.z = 0.04 * sin * walk;

    // Blink every few seconds.
    blinkT -= dt;
    const closed = !calm && blinkT < 0.12;
    if (blinkT < 0) blinkT = 2.5 + Math.random() * 3;
    eyes.forEach((e) => (e.scale.y = closed ? 0.12 : 1));
  }

  update(0, {});
  return { root, update, stride: 4 * (THIGH + SHIN) * Math.sin(0.5) };
}
