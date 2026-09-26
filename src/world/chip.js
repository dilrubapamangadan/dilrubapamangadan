import * as THREE from 'three';

const SIZE = 5;
const PINS = 12;

function topTexture(code, title) {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#10141c';
  g.fillRect(0, 0, 512, 512);
  g.strokeStyle = '#d4a94c';
  g.lineWidth = 10;
  g.strokeRect(22, 22, 468, 468);
  g.lineWidth = 2;
  g.strokeRect(44, 44, 424, 424);
  // Pin-1 marker.
  g.fillStyle = '#d4a94c';
  g.beginPath();
  g.arc(78, 78, 12, 0, Math.PI * 2);
  g.fill();
  g.textAlign = 'center';
  g.fillStyle = '#e9c77a';
  g.font = '600 30px "JetBrains Mono", monospace';
  g.fillText(code, 256, 110);
  g.fillStyle = 'rgba(233, 199, 122, 0.55)';
  g.font = '500 24px "JetBrains Mono", monospace';
  g.fillText(title.toUpperCase(), 256, 440);
  g.fillText('AI · 2026', 256, 470);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

// The glowing die in the middle of the chip: a little neural-net pattern.
function coreTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#000';
  g.fillRect(0, 0, 256, 256);
  const layers = [3, 5, 5, 3];
  const nodes = layers.map((n, i) =>
    Array.from({ length: n }, (_, j) => [40 + (i * 176) / (layers.length - 1), 128 + (j - (n - 1) / 2) * 40])
  );
  g.strokeStyle = 'rgba(255,255,255,0.5)';
  g.lineWidth = 2;
  for (let i = 0; i < nodes.length - 1; i++)
    nodes[i].forEach(([x1, y1]) => nodes[i + 1].forEach(([x2, y2]) => {
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x2, y2);
      g.stroke();
    }));
  g.fillStyle = '#fff';
  nodes.flat().forEach(([x, y]) => {
    g.beginPath();
    g.arc(x, y, 9, 0, Math.PI * 2);
    g.fill();
  });
  g.strokeStyle = '#fff';
  g.lineWidth = 6;
  g.strokeRect(6, 6, 244, 244);
  return new THREE.CanvasTexture(c);
}

export function createChip({ code, title }) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(SIZE, 0.7, SIZE),
    new THREE.MeshStandardMaterial({ color: '#141821', roughness: 0.45, metalness: 0.3 })
  );
  body.position.y = 0.35;
  body.castShadow = body.receiveShadow = true;
  group.add(body);

  const top = new THREE.Mesh(
    new THREE.PlaneGeometry(SIZE - 0.2, SIZE - 0.2),
    new THREE.MeshStandardMaterial({ map: topTexture(code, title), roughness: 0.5, metalness: 0.2 })
  );
  top.rotation.x = -Math.PI / 2;
  top.position.y = 0.705;
  group.add(top);

  const coreMat = new THREE.MeshBasicMaterial({
    map: coreTexture(),
    color: new THREE.Color('#29e3ff'),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  const core = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), coreMat);
  core.rotation.x = -Math.PI / 2;
  core.position.y = 0.72;
  group.add(core);

  // Gold gull-wing pins on all four sides.
  const pinMat = new THREE.MeshStandardMaterial({ color: '#c9a24a', metalness: 0.9, roughness: 0.3, emissive: '#ffb940', emissiveIntensity: 0 });
  const pins = new THREE.InstancedMesh(new THREE.BoxGeometry(0.2, 0.12, 0.7), pinMat, PINS * 4);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const pinPositions = [];
  for (let side = 0; side < 4; side++) {
    const angle = (side * Math.PI) / 2;
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
    for (let i = 0; i < PINS; i++) {
      const along = -SIZE / 2 + 0.45 + (i * (SIZE - 0.9)) / (PINS - 1);
      const local = new THREE.Vector3(along, 0.08, SIZE / 2 + 0.3).applyQuaternion(q);
      m.compose(local, q, new THREE.Vector3(1, 1, 1));
      pins.setMatrixAt(side * PINS + i, m);
      pinPositions.push({ side, x: local.x, z: local.z });
    }
  }
  pins.castShadow = true;
  group.add(pins);

  // A soft glow on the board beneath the chip when it powers up.
  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(SIZE * 2.4, SIZE * 2.4),
    new THREE.MeshBasicMaterial({ map: haloTexture(), color: '#29e3ff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = 0.03;
  group.add(halo);

  let power = 0;
  let target = 0;
  function update(dt, time) {
    power += (target - power) * (1 - Math.exp(-dt * 4));
    const flicker = 0.85 + 0.15 * Math.sin(time * 6 + code.length);
    const k = 0.25 + power * 2.6 * flicker;
    coreMat.color.setRGB(0.16 * k, 0.89 * k, 1 * k);
    pinMat.emissiveIntensity = power * 0.6;
    halo.material.opacity = power * 0.5;
    core.rotation.z = power * 0.08 * Math.sin(time * 0.8);
  }

  return {
    group,
    pinPositions,
    size: SIZE,
    update,
    setActive: (on) => (target = on ? 1 : 0),
  };
}

let halo;
function haloTexture() {
  if (halo) return halo;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 10, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,0.9)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  halo = new THREE.CanvasTexture(c);
  return halo;
}
