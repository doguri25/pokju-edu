// 폭주 구구단 graphics mockup: one gameplay screen on the upgraded stack.
//   Three.js + WebGL2   scene, PBR car paint lit by an environment map baked from the sky shader
//   GLSL                sky, wet road, neon gate frames, light-painted lane arrows, final grade pass
//   Canvas2D            every texture (facades, neon signs, answer panels, glows) and the HUD
//   Vite                dev server, GLSL imported as text with ?raw, one-command build
// The screen plays itself: the car reads the question, steers to a gate, fires at the drones.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

import noiseGLSL from './shaders/noise.glsl?raw';
import worldVert from './shaders/world.vert?raw';
import roadFrag from './shaders/road.frag?raw';
import skyVert from './shaders/sky.vert?raw';
import skyFrag from './shaders/sky.frag?raw';
import neonFrag from './shaders/neon.frag?raw';
import arrowsFrag from './shaders/arrows.frag?raw';
import gradeFrag from './shaders/grade.frag?raw';
import { facade, neonSign, gatePanel, glow } from './textures.js';
import { Hud } from './hud.js';

THREE.ShaderChunk.noise = noiseGLSL;   // lets the shaders say #include <noise>

const GATE_COL = ['#2f7bff', '#b04dff'];
const C = (hex) => new THREE.Color(hex);
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[(Math.random() * a.length) | 0];

async function fontsReady() {
  const wait = Promise.all([document.fonts.load('400 100px "Black Han Sans"'), document.fonts.load('700 20px "Noto Sans KR"')]).catch(() => {});
  await Promise.race([wait, new Promise((r) => setTimeout(r, 2500))]);
}

async function main() {
  await fontsReady();

  /* ---------- renderer ---------- */
  const canvas = document.getElementById('gl');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.82;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.3, 1200);

  /* ---------- palette: a sunset after rain ---------- */
  const skyLow = C('#ff9466'), skyMid = C('#b4507e'), skyHigh = C('#191c48');
  const fogCol = skyLow.clone().lerp(skyMid, 0.45).multiplyScalar(0.42);
  const FOG_NEAR = 110, FOG_FAR = 470;
  scene.fog = new THREE.Fog(fogCol, FOG_NEAR, FOG_FAR);
  const sunDir = new THREE.Vector3(0.18, 0.06, -1).normalize();

  /* ---------- sky (GLSL), also baked into the environment map that lights the car paint ---------- */
  const skyMat = new THREE.ShaderMaterial({
    vertexShader: skyVert, fragmentShader: skyFrag, side: THREE.BackSide, depthWrite: false,
    uniforms: { uSunDir: { value: sunDir }, uTime: { value: 0 }, uSkyLow: { value: skyLow }, uSkyMid: { value: skyMid }, uSkyHigh: { value: skyHigh } }
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 48, 24), skyMat);
  sky.renderOrder = -1;
  scene.add(sky);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene(); envScene.add(new THREE.Mesh(new THREE.SphereGeometry(900, 48, 24), skyMat));
  scene.environment = pmrem.fromScene(envScene, 0.02).texture;
  scene.environmentIntensity = 0.55;

  /* ---------- lights ---------- */
  scene.add(new THREE.HemisphereLight(C('#ffb48c'), C('#1b1426'), 0.3));
  const sun = new THREE.DirectionalLight(C('#ffab73'), 1.6); sun.position.copy(sunDir).multiplyScalar(100); scene.add(sun);
  const fill = new THREE.DirectionalLight(C('#7383ff'), 1.1); fill.position.set(-6, 8, 12); scene.add(fill);
  const key = new THREE.PointLight(C('#ffe6d2'), 60, 22, 1.6); scene.add(key);   // follows the car: lights its back, which faces away from the sun

  /* ---------- road (GLSL) ---------- */
  const roadMat = new THREE.ShaderMaterial({
    vertexShader: worldVert, fragmentShader: roadFrag,
    uniforms: {
      uTime: { value: 0 }, uOffset: { value: 0 }, uCar: { value: new THREE.Vector2() },
      uFog: { value: fogCol }, uFogNear: { value: FOG_NEAR }, uFogFar: { value: FOG_FAR },
      uSkyLow: { value: skyLow }, uSkyHigh: { value: skyMid }
    }
  });
  const road = new THREE.Mesh(new THREE.PlaneGeometry(44, 560, 1, 1), roadMat);
  road.rotation.x = -Math.PI / 2; road.position.z = -260;
  scene.add(road);

  const glowTex = glow();
  const glowSprite = (hex, size, intensity = 1) => {
    const m = new THREE.SpriteMaterial({ map: glowTex, color: C(hex).multiplyScalar(intensity), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
    const s = new THREE.Sprite(m); s.scale.set(size, size, 1); return s;
  };

  /* ---------- buildings: Canvas2D facades with lit windows, recycled as the road scrolls ---------- */
  const facades = [0, 1, 2, 3, 4, 5].map((i) => facade(i));
  const SIGNS = [['전설 카센터', '#22e1ff'], ['한울 분식', '#ffb52e'], ['구구단 학원', '#ff2d95'], ['24시 편의점', '#5dff9a'], ['마성 전자', '#ff4d6d'], ['노래방', '#b04dff']];
  const signTex = SIGNS.map(([t, c]) => neonSign(t, c));
  const scrollers = [];   // everything that moves past the car: { obj, len }
  const buildings = new THREE.Group(); scene.add(buildings);
  function makeBuilding(side, z) {
    const w = rnd(9, 15), d = rnd(10, 18), h = rnd(18, 72), f = pick(facades);
    const map = f.map.clone(), em = f.emissive.clone();
    [map, em].forEach((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(Math.max(1, Math.round(d / 6)), Math.max(2, Math.round(h / 11))); t.needsUpdate = true; });
    const mat = new THREE.MeshStandardMaterial({ map, emissiveMap: em, emissive: C('#ffffff'), emissiveIntensity: 0.75, roughness: 0.75, metalness: 0.15 });
    const g = new THREE.Group();
    const box = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); box.position.y = h / 2; g.add(box);
    if (Math.random() < 0.5) { const b = glowSprite('#ff2a2a', 3, 3); b.position.set(0, h + 0.8, 0); b.userData.blink = rnd(0, 6); g.add(b); }
    if (Math.random() < 0.55) {
      const k = (Math.random() * SIGNS.length) | 0;
      const sg = new THREE.Mesh(new THREE.PlaneGeometry(7, 2.2), new THREE.MeshBasicMaterial({ map: signTex[k], transparent: true, color: C('#ffffff').multiplyScalar(1.6), fog: true }));
      sg.position.set(-side * (w / 2 + 0.05), rnd(7, 13), rnd(-d / 4, d / 4)); sg.rotation.y = -side * Math.PI / 2; g.add(sg);
    }
    g.position.set(side * (rnd(21, 24) + w / 2), 0, z);
    buildings.add(g);
    scrollers.push({ obj: g, len: d + rnd(2, 6), kind: 'building', side });
    return d;
  }
  for (const side of [-1, 1]) { let z = 30; while (z > -520) { const d = makeBuilding(side, z); z -= d + rnd(2, 6); } }

  /* ---------- street lamps every 30 m ---------- */
  const poleMat = new THREE.MeshStandardMaterial({ color: C('#2a2c33'), roughness: 0.5, metalness: 0.6 });
  const lampMat = new THREE.MeshBasicMaterial({ color: C('#ffcf8a').multiplyScalar(4) });
  for (let i = 0; i < 18; i++) for (const side of [-1, 1]) {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 8, 8), poleMat); pole.position.y = 4; g.add(pole);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 0.12), poleMat); arm.position.set(-side * 1.0, 7.9, 0); g.add(arm);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.12, 0.35), lampMat); head.position.set(-side * 1.9, 7.8, 0); g.add(head);
    const gl = glowSprite('#ffb066', 4, 0.7); gl.position.copy(head.position); g.add(gl);
    g.position.set(side * 10.6, 0, 15 - i * 30);
    scene.add(g); scrollers.push({ obj: g, len: 30, kind: 'lamp' });
  }

  /* ---------- distant skyline and 마성 타워 (fixed, too far to need parallax) ---------- */
  for (let i = 0; i < 46; i++) {
    const side = i % 2 ? 1 : -1, h = rnd(40, 150), w = rnd(14, 30);
    const f = pick(facades), em = f.emissive.clone(); em.wrapS = em.wrapT = THREE.RepeatWrapping; em.repeat.set(2, Math.round(h / 20)); em.needsUpdate = true;
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), new THREE.MeshStandardMaterial({ color: C('#16141f'), emissiveMap: em, emissive: C('#ffffff'), emissiveIntensity: 0.45, roughness: 0.9 }));
    b.position.set(side * rnd(46, 160), h / 2, rnd(-260, -520)); scene.add(b);
  }
  const tower = new THREE.Group();
  const tBody = new THREE.Mesh(new THREE.CylinderGeometry(7, 11, 210, 6), new THREE.MeshStandardMaterial({ color: C('#1a1830'), roughness: 0.35, metalness: 0.8 }));
  tBody.position.y = 105; tower.add(tBody);
  for (let i = 0; i < 9; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(10.6 - i * 0.42, 0.35, 6, 6), new THREE.MeshBasicMaterial({ color: C(i % 2 ? '#22e1ff' : '#ff2d95').multiplyScalar(4) }));
    ring.rotation.x = Math.PI / 2; ring.position.y = 20 + i * 22; tower.add(ring);
  }
  const beacon = glowSprite('#ff3b3b', 30, 4); beacon.position.y = 222; tower.add(beacon);
  tower.position.set(-70, 0, -470); scene.add(tower);

  /* ---------- the player's car: rounded PBR body, clearcoat paint, HDR lamps for the bloom ---------- */
  function buildCar(paintHex) {
    const g = new THREE.Group(), wheels = [];
    const paint = new THREE.MeshPhysicalMaterial({ color: C(paintHex), metalness: 0.2, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05, sheen: 0.3, sheenColor: C('#7ffff0') });
    const dark = new THREE.MeshStandardMaterial({ color: C('#16171c'), roughness: 0.6, metalness: 0.4 });
    const glass = new THREE.MeshPhysicalMaterial({ color: C('#0b1020'), metalness: 0.3, roughness: 0.04, clearcoat: 1 });
    const chrome = new THREE.MeshStandardMaterial({ color: C('#d8dde6'), roughness: 0.15, metalness: 1 });
    const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); g.add(m); return m; };
    add(new RoundedBoxGeometry(2.05, 0.62, 4.4, 4, 0.2), paint, 0, 0.66, 0);
    add(new RoundedBoxGeometry(2.1, 0.22, 4.2, 2, 0.08), dark, 0, 0.36, 0);
    add(new RoundedBoxGeometry(1.72, 0.58, 2.2, 4, 0.24), glass, 0, 1.18, 0.35);
    add(new RoundedBoxGeometry(1.5, 0.1, 1.7, 2, 0.04), paint, 0, 1.49, 0.4);
    const stripe = new THREE.MeshStandardMaterial({ color: C('#f4f4f4'), roughness: 0.3 });   /* twin racing stripes over the hood and roof */
    add(new THREE.BoxGeometry(0.34, 0.012, 4.3), stripe, 0.22, 0.975, 0);
    add(new THREE.BoxGeometry(0.34, 0.012, 4.3), stripe, -0.22, 0.975, 0);
    add(new THREE.BoxGeometry(2.0, 0.07, 0.42), paint, 0, 1.36, 2.05);
    add(new THREE.BoxGeometry(0.08, 0.32, 0.18), dark, 0.62, 1.18, 2.05);
    add(new THREE.BoxGeometry(0.08, 0.32, 0.18), dark, -0.62, 1.18, 2.05);
    const tail = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 0.0, 0.02) });   // pure red in linear space: ACES turns a brighter red into salmon
    add(new THREE.BoxGeometry(0.62, 0.11, 0.05), tail, 0.64, 0.82, 2.21);
    add(new THREE.BoxGeometry(0.62, 0.11, 0.05), tail, -0.64, 0.82, 2.21);
    add(new THREE.BoxGeometry(0.66, 0.03, 0.04), tail, 0, 0.84, 2.21);
    add(new THREE.BoxGeometry(1.7, 0.16, 0.06), dark, 0, 0.5, 2.21);
    const head = new THREE.MeshBasicMaterial({ color: C('#eaf4ff').multiplyScalar(6) });
    add(new THREE.BoxGeometry(0.5, 0.1, 0.05), head, 0.65, 0.8, -2.21);
    add(new THREE.BoxGeometry(0.5, 0.1, 0.05), head, -0.65, 0.8, -2.21);
    for (const ex of [0.4, -0.4]) { const p = add(new THREE.CylinderGeometry(0.07, 0.07, 0.2, 12), chrome, ex, 0.42, 2.2); p.rotation.x = Math.PI / 2; }
    // roof turret, as in the original game
    add(new RoundedBoxGeometry(0.55, 0.22, 0.6, 2, 0.06), dark, 0, 1.62, 0.5);
    for (const bx of [0.1, -0.1]) { const b = add(new THREE.CylinderGeometry(0.045, 0.045, 0.75, 8), chrome, bx, 1.66, 0.05); b.rotation.x = Math.PI / 2; }
    const tire = new THREE.MeshStandardMaterial({ color: C('#0c0c0e'), roughness: 0.85 });
    for (const [wx, wz] of [[0.98, -1.38], [-0.98, -1.38], [0.98, 1.38], [-0.98, 1.38]]) {
      const w = new THREE.Group();
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.34, 24), tire); t.rotation.z = Math.PI / 2; w.add(t);
      const r = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.35, 7), chrome); r.rotation.z = Math.PI / 2; w.add(r);
      w.position.set(wx, 0.4, wz); g.add(w); wheels.push(w);
    }
    return { g, wheels };
  }
  const car = buildCar('#11d1bd');
  scene.add(car.g);
  const turretTip = new THREE.Vector3(0, 1.66, -0.4);

  /* ---------- 마성's drones ---------- */
  function buildDrone() {
    const g = new THREE.Group(), rotors = [];
    const body = new THREE.MeshStandardMaterial({ color: C('#23242c'), roughness: 0.35, metalness: 0.7 });
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.7, 20, 12), body); core.scale.y = 0.45; g.add(core);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), new THREE.MeshBasicMaterial({ color: C('#ff2030').multiplyScalar(8) })); eye.position.set(0, -0.05, 0.62); g.add(eye);
    const e2 = glowSprite('#ff2030', 2.4, 2); e2.position.copy(eye.position); g.add(e2);
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + i * Math.PI / 2;
      const arm = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 0.12), body); arm.position.set(Math.cos(a) * 0.75, 0, Math.sin(a) * 0.75); arm.rotation.y = -a; g.add(arm);
      const rot = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.02, 20), new THREE.MeshBasicMaterial({ color: C('#9fe8ff'), transparent: true, opacity: 0.25, depthWrite: false }));
      rot.position.set(Math.cos(a) * 1.35, 0.12, Math.sin(a) * 1.35); g.add(rot); rotors.push(rot);
      const tip = glowSprite('#22e1ff', 0.9, 2); tip.position.set(Math.cos(a) * 1.35, 0.0, Math.sin(a) * 1.35); g.add(tip);
    }
    g.rotation.y = Math.PI;   // the eye looks back at the player
    return { g, rotors, ph: rnd(0, 6) };
  }
  const drones = [buildDrone(), buildDrone()];
  drones.forEach((d) => scene.add(d.g));

  /* ---------- tracers and sparks ---------- */
  const tracerMat = new THREE.MeshBasicMaterial({ color: C('#ffd27a').multiplyScalar(6) });
  const tracers = [];
  for (let i = 0; i < 24; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 1.8), tracerMat); m.visible = false; scene.add(m); tracers.push({ m, v: new THREE.Vector3(), life: 0 }); }
  const sparks = [];
  for (let i = 0; i < 40; i++) { const s = glowSprite('#ffb04a', 1.2, 3); s.visible = false; scene.add(s); sparks.push({ s, v: new THREE.Vector3(), life: 0 }); }

  /* ---------- speed lines ---------- */
  const LINES = 140, lpos = new Float32Array(LINES * 6), lseed = [];
  for (let i = 0; i < LINES; i++) lseed.push({ x: rnd(-15, 15), y: rnd(0.3, 9), z: rnd(-120, 10), l: rnd(3, 9) });
  const lgeo = new THREE.BufferGeometry(); lgeo.setAttribute('position', new THREE.BufferAttribute(lpos, 3));
  const lmat = new THREE.LineBasicMaterial({ color: C('#cfe6ff'), transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false });
  scene.add(new THREE.LineSegments(lgeo, lmat));

  /* ---------- quiz gates: neon frames (GLSL), Canvas2D answer panels, light-painted arrows (GLSL) ---------- */
  const gate = new THREE.Group(); scene.add(gate);
  const gateParts = [0, 1].map((i) => {
    const cx = i ? 4.3 : -4.3, col = C(GATE_COL[i]);
    const neon = new THREE.ShaderMaterial({ vertexShader: worldVert, fragmentShader: neonFrag, uniforms: { uColor: { value: col }, uTime: { value: 0 }, uPulse: { value: 0 } } });
    for (const px of [cx - 3.95, cx + 3.95]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.28, 5.4, 0.28), neon); p.position.set(px, 2.7, 0); gate.add(p); }
    const bar = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.28, 0.28), neon); bar.position.set(cx, 5.4, 0); gate.add(bar);
    const panel = gatePanel('0', GATE_COL[i]);
    const pm = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 2.4), new THREE.MeshBasicMaterial({ map: panel.texture, transparent: true, color: C('#ffffff').multiplyScalar(1.1), depthWrite: false, fog: false }));
    pm.position.set(cx, 3.7, 0.2); gate.add(pm);
    const arrows = new THREE.ShaderMaterial({ vertexShader: worldVert, fragmentShader: arrowsFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uColor: { value: col }, uTime: { value: 0 }, uFade: { value: 1 } } });
    const ar = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 30), arrows); ar.rotation.x = -Math.PI / 2; ar.position.set(cx, 0.03, 15); gate.add(ar);
    const halo = glowSprite(GATE_COL[i], 12, 0.5); halo.material.fog = false; halo.position.set(cx, 3.7, -0.5); gate.add(halo);
    return { neon, panel, pm, arrows };
  });

  /* ---------- post-processing: bloom, then the grade pass (GLSL), then tone mapping ---------- */
  const rt = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, rt);
  composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.6, 0.45, 1.0);
  composer.addPass(bloom);
  const grade = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uSpeed: { value: 0 }, uFlash: { value: 0 }, uFlashColor: { value: C('#35e08a') } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: gradeFrag
  });
  composer.addPass(grade);
  composer.addPass(new OutputPass());

  const hud = new Hud(document.getElementById('hud'));
  window.addEventListener('resize', () => {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h); composer.setSize(w, h); bloom.setSize(w, h);
    camera.aspect = w / h; camera.updateProjectionMatrix(); hud.resize();
  });

  /* ---------- the demo run ---------- */
  const QUESTIONS = [[7, 8], [6, 9], [8, 7], [9, 4], [7, 6], [8, 8], [6, 7], [9, 9], [7, 9], [8, 6]];
  const st = {
    kicker: '이야기 9장 · 도심 · 노을', title: '마성 타워', total: 10, index: 0, results: [], time: 0,
    qKick: '문제 1 / 10', qText: '', opts: [0, 0], colors: GATE_COL, slot: 0, timer: 0,
    hp: 0.72, score: 4820, combo: 3, speed: 0, nitro: 0.6, skillCd: 0.4, firing: false, feedback: null
  };
  const G = { z: -210, start: -210, phase: 'come', wait: 0, pick: 0, a: 7, b: 8 };
  function newQuestion() {
    const [a, b] = QUESTIONS[st.index % QUESTIONS.length];
    const ans = a * b, wrong = Math.random() < 0.5 ? a * (b + 1) : a * (b - 1), slot = Math.random() < 0.5 ? 0 : 1;
    st.opts = slot ? [wrong, ans] : [ans, wrong]; st.slot = slot; st.qText = a + ' × ' + b + ' = ?'; st.qKick = '문제 ' + (st.index + 1) + ' / ' + st.total;
    G.a = a; G.b = b; G.z = G.start; G.phase = 'come';
    G.pick = st.index % 4 === 3 ? 1 - slot : slot;   // every fourth answer is wrong, to show both kinds of feedback
    gateParts.forEach((p, i) => { p.panel.redraw(st.opts[i], GATE_COL[i], false); p.arrows.uniforms.uFade.value = 1; });
    gate.visible = true;
  }
  newQuestion();

  let offset = 0, speed = 30, carX = 0, carRoll = 0, nitroT = 0, flash = 0, fireT = 0, burst = 0, shot = 0, shake = 0;
  const tmp = new THREE.Vector3();

  function step(dt) {
    st.time += dt;
    const target = 30 + (nitroT > 0 ? 14 : 0);
    speed += (target - speed) * (1 - Math.exp(-dt * 2.5));
    nitroT = Math.max(0, nitroT - dt);
    offset += speed * dt;
    st.speed = speed * 3.6; st.nitro = Math.min(1, 0.35 + nitroT / 1.6 * 0.65);
    st.skillCd = Math.max(0, st.skillCd - dt / 12);
    st.hp = Math.max(0.15, st.hp - dt * 0.006);

    // gates come down the road; the car moves to its chosen gate once it has had time to "read" the question
    if (gate.visible) {
      G.z += speed * dt;
      gate.position.z = G.z;
      st.timer = THREE.MathUtils.clamp((G.z - G.start) / -G.start, 0, 1);
      if (G.phase === 'come' && G.z >= 0) {
        const ok = G.pick === st.slot;
        st.results[st.index] = ok;
        st.feedback = { ok, t: 0, text: ok ? '정답!' : '아쉬워요', sub: ok ? '수리 +20% · 니트로' : G.a + ' × ' + G.b + ' = ' + G.a * G.b + ' · 끝에 한 번 더' };
        if (ok) { st.combo++; st.score += 100 + 20 * Math.min(st.combo, 5); st.hp = Math.min(1, st.hp + 0.2); nitroT = 1.6; grade.uniforms.uFlashColor.value.set('#35e08a'); }
        else { st.combo = 0; speed *= 0.7; grade.uniforms.uFlashColor.value.set('#ff4060'); shake = 0.5; }
        flash = 1;
        gateParts.forEach((p, i) => { if (i !== st.slot) p.panel.redraw(st.opts[i], GATE_COL[i], true); p.arrows.uniforms.uFade.value = 0; });
        G.phase = 'past';
      }
      if (G.phase === 'past' && G.z > 30) { gate.visible = false; G.wait = 1.4; }
    } else if ((G.wait -= dt) <= 0) {
      st.index = (st.index + 1) % st.total;
      if (st.index === 0) st.results = [];
      newQuestion();
    }
    if (st.feedback) st.feedback.t += dt;

    const want = G.phase === 'come' && G.z > G.start * 0.78 ? (G.pick ? 4.3 : -4.3) : carX;
    const prev = carX;
    carX += (want - carX) * (1 - Math.exp(-dt * 2.4));
    carRoll += (((carX - prev) / Math.max(dt, 1e-3)) * -0.025 - carRoll) * (1 - Math.exp(-dt * 6));
    car.g.position.x = carX; car.g.rotation.z = carRoll; car.g.rotation.y = -carRoll * 0.6;
    car.g.position.y = Math.sin(st.time * 18) * 0.008;
    car.wheels.forEach((w) => { w.rotation.x -= speed * dt / 0.4; });

    // scrolling world
    for (const s of scrollers) {
      s.obj.position.z += speed * dt;
      if (s.obj.position.z > 40) s.obj.position.z -= s.kind === 'lamp' ? 540 : 560;
      if (s.kind === 'building') s.obj.children.forEach((c) => { if (c.userData.blink !== undefined) c.visible = Math.sin(st.time * 3 + c.userData.blink) > 0; });
    }
    for (let i = 0; i < LINES; i++) {
      const L = lseed[i];
      L.z += speed * dt * 1.7;
      if (L.z > 12) { L.z = rnd(-130, -60); L.x = rnd(-15, 15); L.y = rnd(0.3, 9); if (Math.abs(L.x) < 3 && L.y < 3) L.x += 6; }
      lpos.set([L.x, L.y, L.z, L.x, L.y, L.z - L.l], i * 6);
    }
    lgeo.attributes.position.needsUpdate = true;
    lmat.opacity = 0.12 + 0.5 * THREE.MathUtils.clamp((speed - 26) / 18, 0, 1);

    // drones weave ahead; the car fires short bursts at them
    drones.forEach((d, i) => {
      d.ph += dt;
      d.g.position.set(Math.sin(d.ph * 0.7 + i * 2) * 6 + (i ? 3 : -3), 5.6 + Math.sin(d.ph * 1.7) * 0.6, -34 - i * 12 + Math.sin(d.ph * 0.5) * 4);
      d.g.rotation.z = Math.sin(d.ph * 0.7 + i * 2) * -0.25;
      d.rotors.forEach((r) => { r.rotation.y += dt * 40; });
    });
    fireT -= dt;
    if (fireT <= 0) { burst = 1.1; fireT = rnd(2.6, 3.8); shot = (shot + 1) % 2; }
    st.firing = burst > 0;
    if (burst > 0) {
      burst -= dt;
      if (Math.random() < dt * 14) {
        const t = tracers.find((q) => q.life <= 0);
        if (t) {
          const from = car.g.localToWorld(tmp.copy(turretTip)).clone(), to = drones[shot].g.position.clone().add(new THREE.Vector3(rnd(-0.6, 0.6), rnd(-0.3, 0.3), 0));
          t.m.position.copy(from); t.v.copy(to).sub(from).normalize().multiplyScalar(150); t.m.lookAt(to); t.life = from.distanceTo(to) / 150; t.m.visible = true;
          t.hit = to;
        }
      }
    }
    for (const t of tracers) if (t.life > 0) {
      t.m.position.addScaledVector(t.v, dt); t.life -= dt;
      if (t.life <= 0) {
        t.m.visible = false;
        for (let k = 0; k < 4; k++) { const s = sparks.find((q) => q.life <= 0); if (!s) break; s.s.position.copy(t.hit); s.v.set(rnd(-6, 6), rnd(-2, 6), rnd(-6, 6)); s.life = rnd(0.2, 0.45); s.s.visible = true; }
      }
    }
    for (const s of sparks) if (s.life > 0) { s.s.position.addScaledVector(s.v, dt); s.life -= dt; s.s.material.opacity = Math.max(0, s.life * 3); if (s.life <= 0) s.s.visible = false; }

    // camera: chase view that leans into lane changes and widens with nitro
    shake = Math.max(0, shake - dt);
    const fovT = baseFov() + (speed - 30) * 0.6;
    camera.fov += (fovT - camera.fov) * (1 - Math.exp(-dt * 4)); camera.updateProjectionMatrix();
    const tall = camera.aspect < 1;   /* a phone held upright: further back and higher, so both gates fit */
    camera.position.set(carX * (tall ? 0.45 : 0.65) + (Math.random() - 0.5) * shake * 0.3, (tall ? 4.4 : 3.1) + (Math.random() - 0.5) * shake * 0.2, tall ? 10.5 : 7.8);
    camera.lookAt(carX * 0.8, 1.25, -16);
    camera.rotateZ(carRoll * 0.35);
    sky.position.copy(camera.position);
    key.position.set(carX + 1.5, 4.2, 6.5);

    // shader clocks
    roadMat.uniforms.uTime.value = st.time; roadMat.uniforms.uOffset.value = offset; roadMat.uniforms.uCar.value.set(carX, 0);
    skyMat.uniforms.uTime.value = st.time;
    flash = Math.max(0, flash - dt * 2.2);
    grade.uniforms.uTime.value = st.time; grade.uniforms.uFlash.value = flash * 0.5;
    grade.uniforms.uSpeed.value = THREE.MathUtils.clamp((speed - 24) / 22, 0, 1);
    gateParts.forEach((p) => { p.neon.uniforms.uTime.value = st.time; p.arrows.uniforms.uTime.value = st.time; p.neon.uniforms.uPulse.value = flash; });
  }

  // keep roughly the same sideways view on any screen shape: wide screens use 58° vertical, narrow ones widen it
  function baseFov() {
    if (camera.aspect >= 1.4) return 58;
    const h = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(34)) / camera.aspect);
    return Math.min(84, THREE.MathUtils.radToDeg(h));
  }
  camera.fov = baseFov();

  let last = performance.now(), frozen = false;
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 1 / 20); last = now;
    if (!frozen) step(dt);
    composer.render();
    hud.draw(st);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // for screenshots and tests: advance the demo by fixed steps, or hold it still
  window.__mock = {
    advance(sec) { for (let t = 0; t < sec; t += 1 / 60) step(1 / 60); composer.render(); hud.draw(st); },
    freeze(on) { frozen = on; },
    state: st, gate: G
  };
}

main();
