import * as THREE from 'three';

// The walking route: a PCB-style trace made of straight runs with 45° bends.
// Moves are [heading in degrees (0 = -z, clockwise), length].
const MOVES = [
  [0, 13], [-45, 7], [0, 9], [45, 9], [90, 6], [45, 5], [0, 10], [-45, 8],
  [0, 9], [45, 7], [0, 10], [-90, 6], [-45, 5], [0, 11], [45, 6], [0, 8],
];
const CHAMFER = 1.2;
export const CHIP_OFFSET = 5.2;

const dirOf = (deg) => {
  const r = (deg * Math.PI) / 180;
  return new THREE.Vector2(Math.sin(r), -Math.cos(r)); // (x, z)
};

export function createRoute(stopCount) {
  // Corner points of the route in the x/z plane.
  const corners = [new THREE.Vector2(0, 0)];
  MOVES.forEach(([deg, len]) => corners.push(corners.at(-1).clone().addScaledVector(dirOf(deg), len)));

  // Chamfer every corner so the walker turns through a short diagonal.
  const pts = [corners[0]];
  for (let i = 1; i < corners.length - 1; i++) {
    const a = corners[i - 1], b = corners[i], c = corners[i + 1];
    pts.push(b.clone().addScaledVector(a.clone().sub(b).normalize(), CHAMFER));
    pts.push(b.clone().addScaledVector(c.clone().sub(b).normalize(), CHAMFER));
  }
  pts.push(corners.at(-1));

  const path = new THREE.CurvePath();
  for (let i = 0; i < pts.length - 1; i++) {
    path.add(new THREE.LineCurve3(new THREE.Vector3(pts[i].x, 0, pts[i].y), new THREE.Vector3(pts[i + 1].x, 0, pts[i + 1].y)));
  }
  const length = path.getLength();

  const pointAt = (s, target = new THREE.Vector3()) => target.copy(path.getPointAt(THREE.MathUtils.clamp(s / length, 0, 1)));
  const tangentAt = (s, target = new THREE.Vector3()) =>
    target.copy(path.getTangentAt(THREE.MathUtils.clamp(s / length, 0.0001, 0.9999)));

  // Stops: the start pad, then evenly spaced chips alternating either side of the trace.
  const stops = [{ s: 2, side: 0 }];
  for (let k = 1; k <= stopCount; k++) {
    const s = 2 + (k * (length - 8)) / stopCount;
    const side = k % 2 ? 1 : -1;
    const p = pointAt(s);
    const t = tangentAt(s);
    const right = new THREE.Vector3(-t.z, 0, t.x);
    stops.push({ s, side, chip: p.clone().addScaledVector(right, side * CHIP_OFFSET), tangent: t.clone() });
  }

  // Dense samples for "is this spot on the trace?" checks when scattering decor.
  const samples = [];
  for (let s = 0; s <= length; s += 1) samples.push(pointAt(s));
  const distance = (x, z) => samples.reduce((m, p) => Math.min(m, Math.hypot(p.x - x, p.z - z)), Infinity);

  const box = new THREE.Box2().setFromPoints(pts);
  return { pts, path, length, pointAt, tangentAt, stops, distance, box };
}
