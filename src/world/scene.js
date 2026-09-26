import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { createRoute } from './route.js';
import { createBoard } from './board.js';
import { createChip } from './chip.js';
import { createCharacter } from './character.js';

const BG = '#050b16';
const MAX_SPEED = 7; // route units per second
const damp = (a, b, rate, dt) => a + (b - a) * (1 - Math.exp(-rate * dt));
const dampAngle = (a, b, rate, dt) => {
  const d = Math.atan2(Math.sin(b - a), Math.cos(b - a));
  return a + d * (1 - Math.exp(-rate * dt));
};

export function createWorld(canvas, { chips: chipInfo, lite = false, reduced = false }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lite, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lite ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.FogExp2(BG, 0.022);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 300);

  // --- Lights -----------------------------------------------------------------
  scene.add(new THREE.HemisphereLight('#a8dcff', '#0a1426', 1.1));
  const sun = new THREE.DirectionalLight('#fff4e6', 2.4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(lite ? 1024 : 2048, lite ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 40 });
  sun.shadow.bias = -0.0005;
  scene.add(sun, sun.target);
  const chipLight = new THREE.PointLight('#29e3ff', 0, 14, 1.6);
  scene.add(chipLight);

  // --- Content ----------------------------------------------------------------
  const route = createRoute(chipInfo.length);
  const chips = chipInfo.map((info, i) => {
    const stop = route.stops[i + 1];
    const chip = createChip(info);
    chip.rotation = Math.atan2(stop.tangent.x, stop.tangent.z);
    chip.group.position.copy(stop.chip);
    chip.group.rotation.y = chip.rotation;
    chip.position = stop.chip;
    chip.side = stop.side;
    scene.add(chip.group);
    return chip;
  });
  const board = createBoard({ route, chips, lite });
  scene.add(board.group);

  const hero = createCharacter();
  scene.add(hero.root);

  // --- State --------------------------------------------------------------------
  const state = {
    target: route.stops[0].s, // where scroll wants him (route distance)
    s: route.stops[0].s,
    phase: 0,
    walk: 0,
    heading: Math.PI, // start facing the camera
    wave: 0,
    waveTarget: 1,
    dwell: -1, // chip index he is parked at, or -1
    panelSide: 1, // screen side the HTML panel is on (+1 right, -1 left, 0 none)
    film: 0,
  };
  const pos = new THREE.Vector3();
  const tan = new THREE.Vector3();
  const camPos = new THREE.Vector3();
  const camLook = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  let camInit = false;

  // --- Post-processing ------------------------------------------------------------
  let composer = null;
  if (!lite) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.85, 0.55, 0.78));
    composer.addPass(new OutputPass());
  }

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    composer?.setSize(w, h);
    camera.aspect = w / h;
    // Pull back a little on narrow screens so he and the chip both fit.
    camera.fov = w / h < 0.8 ? 50 : 38;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // --- Loop -----------------------------------------------------------------------
  const timer = new THREE.Timer();
  timer.connect(document); // ignores the time spent in a hidden tab
  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(frame);
  });

  function frame() {
    if (!running) return;
    timer.update();
    const dt = Math.min(timer.getDelta(), 0.1);
    const time = timer.getElapsed();

    // Move along the route; the walk cycle advances with distance so feet never slide.
    const prev = state.s;
    // Ease toward the scroll target, but never faster than a brisk walk.
    const wantStep = reduced ? state.target - state.s : (state.target - state.s) * (1 - Math.exp(-3 * dt));
    state.s += reduced ? wantStep : THREE.MathUtils.clamp(wantStep, -MAX_SPEED * dt, MAX_SPEED * dt);
    const ds = state.s - prev;
    const speed = Math.abs(ds) / Math.max(dt, 1e-4);
    state.walk = damp(state.walk, Math.min(1, speed / 1.5), 6, dt);
    // He turns round to walk back, so the cycle always runs forward.
    state.phase += Math.abs(ds) / hero.stride;

    route.pointAt(state.s, pos);
    route.tangentAt(state.s, tan);
    const along = Math.atan2(tan.x, tan.z);

    // Face the way he's walking; when parked, turn to face the camera.
    let wantHeading = ds < -1e-4 ? along + Math.PI : along;
    if (state.walk < 0.15) {
      tmp.copy(camera.position).sub(pos);
      wantHeading = Math.atan2(tmp.x, tmp.z);
    }
    state.heading = dampAngle(state.heading, wantHeading, 6, dt);
    hero.root.position.copy(pos);
    hero.root.rotation.y = state.heading;

    state.wave = damp(state.wave, state.walk < 0.1 ? state.waveTarget : 0, 5, dt);
    hero.update(dt, { phase: state.phase, walk: state.walk, wave: state.wave, time, calm: reduced });

    // Chips power up while he stands at them.
    chips.forEach((c, i) => {
      c.setActive(i === state.dwell);
      c.update(dt, time);
    });
    const active = chips[state.dwell];
    chipLight.intensity = damp(chipLight.intensity, active ? 30 : 0, 3, dt);
    if (active) chipLight.position.set(active.position.x, 2.5, active.position.z);

    board.update(dt, time);

    // Camera: a front-quarter follow while walking; pulls out to frame him with the chip when parked.
    const right = tmp.set(-tan.z, 0, tan.x);
    const walkCam = new THREE.Vector3().copy(pos).addScaledVector(tan, 9).addScaledVector(right, -4.5).add(new THREE.Vector3(0, 4.2, 0));
    const walkLook = new THREE.Vector3().copy(pos).add(new THREE.Vector3(0, 1.1, 0));
    let wantPos = walkCam;
    let wantLook = walkLook;
    if (active) {
      // Phones have no room beside the panel, so keep him centred with the chip at the edge.
      const tall = camera.aspect < 0.8;
      const mid = new THREE.Vector3().copy(pos).lerp(active.position, tall ? 0.18 : 0.45);
      const away = -active.side; // camera sits on the side of the trace away from the chip
      const dwellCam = new THREE.Vector3()
        .copy(mid)
        .addScaledVector(tan, tall ? 10 : 8.5)
        .addScaledVector(right, away * (tall ? 1.5 : 3.5))
        .add(new THREE.Vector3(0, tall ? 5.2 : 4.6, 0));
      const k = 1 - state.walk;
      wantPos = walkCam.lerp(dwellCam, k);
      wantLook = walkLook.lerp(mid.add(new THREE.Vector3(0, 0.9, 0)), k);
    }
    const camRate = reduced ? 50 : 2.4;
    if (!camInit) {
      camPos.copy(wantPos);
      camLook.copy(wantLook);
      camInit = true;
    }
    camPos.x = damp(camPos.x, wantPos.x, camRate, dt);
    camPos.y = damp(camPos.y, wantPos.y, camRate, dt);
    camPos.z = damp(camPos.z, wantPos.z, camRate, dt);
    camLook.x = damp(camLook.x, wantLook.x, camRate * 1.5, dt);
    camLook.y = damp(camLook.y, wantLook.y, camRate * 1.5, dt);
    camLook.z = damp(camLook.z, wantLook.z, camRate * 1.5, dt);
    camera.position.copy(camPos);
    camera.lookAt(camLook);

    // Shift the frame so the action sits beside the HTML panel (or above it on phones).
    const w = window.innerWidth;
    const h = window.innerHeight;
    const narrow = camera.aspect < 0.8;
    state.film = damp(state.film, narrow ? 0 : state.panelSide * 0.25, 3, dt);
    // Phones: panels are bottom sheets (lift him up); the hero text sits on top (drop him down).
    const liftTarget = !narrow ? 0 : state.dwell >= 0 ? 0.24 : state.panelSide ? -0.14 : 0;
    state.lift = damp(state.lift ?? 0, liftTarget, 3, dt);
    camera.setViewOffset(w, h, state.film * w, state.lift * h, w, h);

    sun.position.copy(pos).add(new THREE.Vector3(6, 12, 5));
    sun.target.position.copy(pos);

    if (composer) composer.render(dt);
    else renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  if (import.meta.env.DEV || location.search.includes('debug')) window.__world = { state, hero, camera, chips, route };

  return {
    route,
    stops: route.stops,
    // Scroll hands us a route distance plus what's on screen.
    set({ s, dwell = -1, panelSide = 0, wave = 0 }) {
      state.target = s;
      state.dwell = dwell;
      state.panelSide = panelSide;
      state.waveTarget = wave;
    },
  };
}
