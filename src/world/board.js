import * as THREE from 'three';

// Seeded random so the board looks the same on every visit.
function rng(seed = 7) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

const V2 = THREE.Vector2;

// Flat ribbons for a set of polylines, merged into one geometry.
function ribbons(lines, y) {
  const pos = [];
  const idx = [];
  lines.forEach(({ pts, width }) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const d = b.clone().sub(a).normalize();
      const n = new V2(-d.y, d.x).multiplyScalar(width / 2);
      const ea = a.clone().addScaledVector(d, -width / 2);
      const eb = b.clone().addScaledVector(d, width / 2);
      const base = pos.length / 3;
      pos.push(ea.x + n.x, y, ea.y + n.y, ea.x - n.x, y, ea.y - n.y, eb.x - n.x, y, eb.y - n.y, eb.x + n.x, y, eb.y + n.y);
      idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// Parallel copy of a polyline, `d` units to its right (mitred corners).
function offsetLine(pts, d) {
  return pts.map((p, i) => {
    const prev = pts[Math.max(0, i - 1)];
    const next = pts[Math.min(pts.length - 1, i + 1)];
    const d1 = p.clone().sub(prev).normalize();
    const d2 = next.clone().sub(p).normalize();
    if (i === 0) d1.copy(d2);
    if (i === pts.length - 1) d2.copy(d1);
    const n1 = new V2(-d1.y, d1.x);
    const n2 = new V2(-d2.y, d2.x);
    const m = n1.add(n2).normalize();
    const scale = d / Math.max(0.3, m.dot(new V2(-d1.y, d1.x)));
    return p.clone().addScaledVector(m, -scale);
  });
}

function gridTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#0b1830';
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = 'rgba(80, 160, 220, 0.08)';
  g.lineWidth = 2;
  for (let i = 0; i <= 256; i += 64) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i, 256);
    g.moveTo(0, i);
    g.lineTo(256, i);
    g.stroke();
  }
  g.fillStyle = 'rgba(120, 200, 255, 0.12)';
  for (let x = 16; x < 256; x += 32) for (let y = 16; y < 256; y += 32) g.fillRect(x - 1, y - 1, 2, 2);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function labelTexture(text, { size = 48, color = 'rgba(200, 225, 255, 0.55)', width = 512 } = {}) {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = size * 1.6;
  const g = c.getContext('2d');
  g.fillStyle = color;
  g.font = `600 ${size}px "JetBrains Mono", monospace`;
  g.textBaseline = 'middle';
  g.fillText(text, 4, c.height / 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return { tex, aspect: c.width / c.height };
}

function silkscreen(text, x, z, h, rotY = 0, opts) {
  const { tex, aspect } = labelTexture(text, opts);
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(h * aspect, h),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
  );
  m.rotation.set(-Math.PI / 2, 0, rotY);
  m.position.set(x, 0.025, z);
  return m;
}

export function createBoard({ route, chips, lite }) {
  const rand = rng(11);
  const group = new THREE.Group();

  // --- Board ------------------------------------------------------------------
  const margin = 26;
  const b = route.box;
  const w = b.max.x - b.min.x + margin * 2;
  const h = b.max.y - b.min.y + margin * 2;
  const cx = (b.min.x + b.max.x) / 2;
  const cz = (b.min.y + b.max.y) / 2;
  const grid = gridTexture();
  grid.repeat.set(w / 8, h / 8);
  const board = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({ map: grid, roughness: 0.85, metalness: 0.15 })
  );
  board.rotation.x = -Math.PI / 2;
  board.position.set(cx, 0, cz);
  board.receiveShadow = true;
  group.add(board);

  // Keep-out test for scattering things: off the route, away from chips.
  const chipZones = chips.map((c) => c.position);
  const clear = (x, z, r = 3) =>
    route.distance(x, z) > r && chipZones.every((p) => Math.hypot(p.x - x, p.z - z) > 5 + r) &&
    Math.abs(x - cx) < w / 2 - 2 && Math.abs(z - cz) < h / 2 - 2;

  // --- Traces -------------------------------------------------------------------
  const busLanes = [
    { pts: route.pts, width: 0.34 },
    { pts: offsetLine(route.pts, 1.1), width: 0.12 },
    { pts: offsetLine(route.pts, -1.1), width: 0.12 },
  ];

  const chipLines = [];
  chips.forEach((chip) => {
    const { position: p, rotation, pinPositions, side } = chip;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const toWorld = (x, z) => new V2(p.x + x * cos + z * sin, p.z - x * sin + z * cos);
    chip.toWorld = toWorld;
    pinPositions.forEach(({ side: s, x, z }, i) => {
      // Skip the face that looks at the walking trace.
      const faceToRoute = side > 0 ? 1 : 3; // chip-local +x points back at the route for right-hand chips
      if (s === faceToRoute || i % 2) return;
      const out = new V2(x, z).normalize();
      const axis = Math.abs(out.x) > Math.abs(out.y) ? new V2(Math.sign(out.x), 0) : new V2(0, Math.sign(out.y));
      const start = new V2(x, z).addScaledVector(axis, 0.3);
      const run1 = 1 + rand() * 1.5;
      const bend = new V2(axis.x - axis.y * (rand() > 0.5 ? 1 : -1), axis.y + axis.x * (rand() > 0.5 ? 1 : -1)).normalize();
      const p1 = start.clone().addScaledVector(axis, run1);
      const p2 = p1.clone().addScaledVector(bend, 1 + rand() * 2);
      const p3 = p2.clone().addScaledVector(axis, 2 + rand() * 5);
      const line = [start, p1, p2, p3].map((v) => toWorld(v.x, v.y));
      if (line.every((v) => route.distance(v.x, v.y) > 1.8)) chipLines.push({ pts: line, width: 0.12 });
    });
  });

  // Random traces and parallel bundles wandering across the rest of the board.
  const decorLines = [];
  const dirs = Array.from({ length: 8 }, (_, i) => new V2(Math.sin((i * Math.PI) / 4), Math.cos((i * Math.PI) / 4)));
  const walkers = lite ? 40 : 90;
  for (let n = 0; n < walkers; n++) {
    const start = new V2(cx + (rand() - 0.5) * w * 0.95, cz + (rand() - 0.5) * h * 0.95);
    if (!clear(start.x, start.y)) continue;
    let dir = Math.floor(rand() * 8);
    const pts = [start];
    const steps = 3 + Math.floor(rand() * 4);
    let ok = true;
    for (let k = 0; k < steps && ok; k++) {
      const next = pts.at(-1).clone().addScaledVector(dirs[dir], 2 + rand() * 7);
      for (let t = 0.25; t <= 1; t += 0.25) {
        const q = pts.at(-1).clone().lerp(next, t);
        if (!clear(q.x, q.y, 2)) ok = false;
      }
      if (ok) pts.push(next);
      dir = (dir + (rand() > 0.5 ? 1 : 7)) % 8;
    }
    if (pts.length < 2) continue;
    const bundle = rand() > 0.6 ? 3 : 1;
    for (let j = 0; j < bundle; j++) decorLines.push({ pts: j ? offsetLine(pts, j * 0.45) : pts, width: 0.1 });
  }

  const traceMat = (color, intensity) =>
    new THREE.MeshStandardMaterial({ color: '#0f2a40', emissive: color, emissiveIntensity: intensity, roughness: 0.4, metalness: 0.6, side: THREE.DoubleSide });
  const busMat = traceMat('#22d3ff', 0.75);
  const bus = new THREE.Mesh(ribbons(busLanes, 0.012), busMat);
  const pinTraces = new THREE.Mesh(ribbons(chipLines, 0.011), traceMat('#1fb8e6', 0.45));
  const decor = new THREE.Mesh(ribbons(decorLines, 0.01), traceMat('#1583b8', 0.3));
  [bus, pinTraces, decor].forEach((m) => (m.receiveShadow = true));
  group.add(bus, pinTraces, decor);

  // Vias: plated rings at the end of every trace.
  const viaEnds = [...chipLines, ...decorLines].map((l) => l.pts.at(-1));
  const vias = new THREE.InstancedMesh(
    new THREE.RingGeometry(0.12, 0.26, 16).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: '#d4a94c', metalness: 0.9, roughness: 0.3, emissive: '#6b4a10', emissiveIntensity: 0.4 }),
    viaEnds.length
  );
  const m4 = new THREE.Matrix4();
  viaEnds.forEach((p, i) => vias.setMatrixAt(i, m4.makeTranslation(p.x, 0.02, p.y)));
  group.add(vias);

  // --- Components ---------------------------------------------------------------
  const scatter = (count, r) => {
    const out = [];
    for (let tries = 0; out.length < count && tries < count * 30; tries++) {
      const x = cx + (rand() - 0.5) * w * 0.95;
      const z = cz + (rand() - 0.5) * h * 0.95;
      if (clear(x, z, r) && out.every((o) => Math.hypot(o.x - x, o.z - z) > r * 2)) out.push({ x, z, a: Math.floor(rand() * 4) * (Math.PI / 2) });
    }
    return out;
  };
  const placeInstanced = (geo, mat, spots, y, scaleFn) => {
    const mesh = new THREE.InstancedMesh(geo, mat, spots.length);
    const q = new THREE.Quaternion();
    spots.forEach((s, i) => {
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), s.a);
      const sc = scaleFn ? scaleFn(i) : 1;
      mesh.setMatrixAt(i, m4.compose(new THREE.Vector3(s.x, y * sc, s.z), q, new THREE.Vector3(1, sc, 1)));
    });
    mesh.castShadow = mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };

  // Electrolytic capacitors.
  const caps = scatter(lite ? 14 : 28, 1.2);
  placeInstanced(new THREE.CylinderGeometry(0.55, 0.55, 1.4, 20), new THREE.MeshStandardMaterial({ color: '#1f3b73', roughness: 0.35, metalness: 0.4 }), caps, 0.7, (i) => 0.7 + (i % 3) * 0.25);
  placeInstanced(new THREE.CylinderGeometry(0.5, 0.5, 0.05, 20), new THREE.MeshStandardMaterial({ color: '#b9c3d0', metalness: 0.9, roughness: 0.25 }), caps, 1.42, (i) => 0.7 + (i % 3) * 0.25);
  // Resistors and SMD parts.
  placeInstanced(new THREE.BoxGeometry(1.1, 0.35, 0.45), new THREE.MeshStandardMaterial({ color: '#1b1f29', roughness: 0.6 }), scatter(lite ? 20 : 45, 0.8), 0.18);
  placeInstanced(new THREE.BoxGeometry(0.5, 0.18, 0.3), new THREE.MeshStandardMaterial({ color: '#c8b48a', roughness: 0.5 }), scatter(lite ? 20 : 50, 0.5), 0.09);

  // LEDs that blink.
  const ledSpots = scatter(lite ? 12 : 26, 0.8);
  const leds = new THREE.InstancedMesh(new THREE.SphereGeometry(0.18, 12, 8), new THREE.MeshBasicMaterial({ toneMapped: false }), ledSpots.length);
  ledSpots.forEach((s, i) => leds.setMatrixAt(i, m4.makeTranslation(s.x, 0.18, s.z)));
  const ledPhase = ledSpots.map(() => rand() * 10);
  const ledColor = ledSpots.map((_, i) => new THREE.Color(i % 3 ? '#29e3ff' : '#ffb940'));
  const tmpColor = new THREE.Color();
  ledSpots.forEach((_, i) => leds.setColorAt(i, ledColor[i]));
  group.add(leds);

  // --- Silkscreen -----------------------------------------------------------------
  group.add(silkscreen('DMP-MAINBOARD  REV 2026', 3, -4, 1.6, Math.PI, { size: 48, width: 1100 }));
  group.add(silkscreen('BOOT', -2.4, 1.2, 1, Math.PI, { size: 48, width: 180 }));
  chips.forEach((c, i) => {
    const at = c.toWorld(-3.3 * c.side, 3.3);
    group.add(silkscreen(`U${i + 1}`, at.x, at.y, 0.9, c.rotation, { size: 48, width: 140 }));
  });

  // --- Data pulses ------------------------------------------------------------------
  const tracks = [...busLanes, ...busLanes, ...chipLines.slice(0, 60), ...decorLines.slice(0, lite ? 20 : 60)].map(({ pts }) => {
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
    return { pts, cum, len: cum.at(-1) };
  });
  const pulseCount = tracks.length;
  const pulses = new THREE.InstancedMesh(
    new THREE.CapsuleGeometry(0.09, 0.5, 4, 8).rotateX(Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(0.5, 2.2, 3), toneMapped: false }),
    pulseCount
  );
  const pulseState = tracks.map((t, i) => ({ t, u: rand() * t.len, speed: (i < busLanes.length * 2 ? 7 : 3) + rand() * 3 }));
  group.add(pulses);
  const tmpQ = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const one = new THREE.Vector3(1, 1, 1);

  function update(dt, time) {
    pulseState.forEach((p, i) => {
      p.u = (p.u + p.speed * dt) % p.t.len;
      const { pts, cum } = p.t;
      let k = 1;
      while (k < cum.length - 1 && cum[k] < p.u) k++;
      const a = pts[k - 1];
      const bb = pts[k];
      const f = (p.u - cum[k - 1]) / (cum[k] - cum[k - 1] || 1);
      tmpQ.setFromAxisAngle(up, Math.atan2(bb.x - a.x, bb.y - a.y));
      pulses.setMatrixAt(i, m4.compose(new THREE.Vector3(a.x + (bb.x - a.x) * f, 0.06, a.y + (bb.y - a.y) * f), tmpQ, one));
    });
    pulses.instanceMatrix.needsUpdate = true;

    ledSpots.forEach((_, i) => {
      const on = Math.sin(time * 2 + ledPhase[i]) > 0.3 ? 2.2 : 0.25;
      leds.setColorAt(i, tmpColor.copy(ledColor[i]).multiplyScalar(on));
    });
    leds.instanceColor.needsUpdate = true;
    busMat.emissiveIntensity = 0.7 + 0.12 * Math.sin(time * 1.5);
  }

  return { group, update, center: new THREE.Vector3(cx, 0, cz), size: Math.max(w, h) };
}
