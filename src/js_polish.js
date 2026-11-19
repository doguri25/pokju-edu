  /* ---------- sky: a dome that travels with the camera. Horizon-to-zenith gradient, sun or moon with a halo, stars at night, drifting clouds that thicken with the weather.
     Colours are written as they should appear on screen, like the plain background colour behind it ---------- */
  var skyU = { uTop: { value: new T.Color() }, uHor: { value: new T.Color() }, uSun: { value: new T.Vector3(0, 1, 0) }, uSunCol: { value: new T.Color() }, uDark: { value: new T.Color() },
    uNight: { value: 0 }, uCloud: { value: 0.3 }, uTime: { value: 0 }, uDim: { value: 1 }, uLin: { value: 0 } };
  /* the dome is drawn after everything solid, on the far plane itself (z = w), so its clouds are worked out only where the sky shows
     and no camera's far plane can cut it off (the mirror's reaches 75 m) */
  var SKY_VS = 'varying vec3 vDir;\nvoid main() {\n\tvDir = position;\n\tgl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );\n\tgl_Position.z = gl_Position.w;\n}';
  var skyDome = new T.Mesh(new T.SphereGeometry(480, 32, 16), new T.ShaderMaterial({ uniforms: skyU, side: T.BackSide, depthWrite: false, fog: false,
    vertexShader: SKY_VS, fragmentShader: GLSL_SKY_FRAG }));   /* src/shaders/sky.frag */
  skyDome.renderOrder = 1000; skyDome.frustumCulled = false; scene.add(skyDome);
  function updSky() {
    var W = weather, g;
    skyU.uHor.value.copy(scene.background);
    skyU.uTop.value.copy(cur.top);
    if (W.cloud) { g = cur.top.r * 0.3 + cur.top.g * 0.5 + cur.top.b * 0.2; tmpC.setRGB(g * 0.8, g * 0.84, g * 0.92); skyU.uTop.value.lerp(tmpC, W.cloud * 0.9); }
    if (boltF > 0) skyU.uTop.value.addScalar(boltF * 0.35);
    skyU.uSun.value.copy(cur.sunDir); skyU.uSunCol.value.copy(cur.sunCol).multiplyScalar(1 - 0.9 * W.cloud);
    skyU.uNight.value = cur.night; skyU.uCloud.value = Math.max(0.28, W.cloud); skyU.uTime.value = time;
    if (tunGlare > 0.001) { skyU.uHor.value.lerp(tunWhite, tunGlare); skyU.uTop.value.lerp(tunWhite, tunGlare * 0.8); }
    skyU.uDim.value = 1 - 0.96 * tunK * (1 - tunOut); skyU.uDark.value.copy(tunDark);
    skyDome.position.copy(camera.position);
    updFar();
  }

  /* ---------- far skyline (graphics upgrade 2): a ring of silhouettes beyond the road that travels with the sky dome. Towers in
     town, hills in the country, mountains in the hills, snowy peaks in the snow; worked out in src/shaders/skyline.frag ---------- */
  var farU = { uTop: skyU.uTop, uHor: skyU.uHor, uSun: skyU.uSun, uSunCol: skyU.uSunCol, uDark: skyU.uDark, uNight: skyU.uNight, uTime: skyU.uTime, uDim: skyU.uDim,
    uNear: { value: new T.Color() }, uVis: { value: 1 }, uKind: { value: 1 }, uSea: { value: 0 }, uScale: { value: 1 } };
  var FAR_KIND = { city: [1, 1, 0], highway: [1, 0.72, 0], country: [2, 1, 0], creek: [2, 0.9, 0], coast: [2, 0.85, 1], coastE: [2, 0.85, -1], offroad: [3, 0.75, 0], mountain: [3, 1, 0], snow: [4, 0.95, 0] };
  var farRing = new T.Mesh(new T.CylinderGeometry(430, 430, 135, 96, 1, true).translate(0, 47.5, 0), new T.ShaderMaterial({ uniforms: farU, side: T.BackSide,
    depthWrite: false, fog: false, alphaToCoverage: true, vertexShader: SKY_VS, fragmentShader: GLSL_SKYLINE_FRAG }));   /* src/shaders/skyline.frag */
  farRing.renderOrder = 1001; farRing.frustumCulled = false; skyDome.add(farRing);
  var farGrey = new T.Color(0.36, 0.38, 0.44);
  function updFar() {
    var k = FAR_KIND[region.key] || FAR_KIND.city;
    farU.uKind.value = k[0]; farU.uScale.value = k[1]; farU.uSea.value = k[2];
    if (k[0] === 1) farU.uNear.value.copy(farGrey).multiply(tintC); else farU.uNear.value.copy(groundMat.color).multiplyScalar(0.8);
    farU.uVis.value = clamp((envFogF - 85) / 100, 0, 1) * (1 - 0.6 * boltF);
    farRing.visible = farU.uVis.value > 0.02;
  }

  /* ---------- graphics quality: three levels; 「자동」 starts high and, when frames take too long during a run, first lowers the
     rendering resolution a little at a time, and only then steps down a level. The rear-view mirror stays at every level ---------- */
  var GFX = { high: { pr: 2, shadow: true, fx: 1, map: 2048, mir: 1, post: 1, mw: 384, msaa: 4 }, mid: { pr: 1.5, shadow: true, fx: 0.7, map: 1024, mir: 2, post: 0.8, mw: 336, msaa: 2 }, low: { pr: 1, shadow: false, fx: 0.45, map: 1024, mir: 2, post: 0, mw: 264, msaa: 2 } },
    gfxNow = 'high', fxK = 1, mirEvery = 1, resK = 1, gfxWin = [], gfxHold = 0, gfxFast = 0, gfxRaised = false, gfxNoUp = false, gfxRef = [], gfxBest = 1 / 30;
  var RES_STEPS = [1, 0.85, 0.72];
  /* 「자동」 starts one step down on a phone-sized or touch screen: those are the devices where the full setting costs frames */
  function gfxStart() { var small = Math.min(window.innerWidth, window.innerHeight) <= 520 || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches); return small ? 'mid' : 'high'; }
  /* the picture is finished off screen in a multisampled half-float buffer: on a big, sharp screen (a tablet, a 4K monitor) that alone
     took hundreds of megabytes of graphics memory, and running short is what takes the picture away (js_fx2.js). Each level now has a
     ceiling on the number of pixels drawn (1.4) */
  var PX_CAP = { high: 3.2e6, mid: 2.1e6, low: 1.3e6 };
  function gfxRatio() {
    var q = GFX[gfxNow] || GFX.high, pr = Math.min(window.devicePixelRatio || 1, q.pr) * resK, a = Math.max(1, window.innerWidth * window.innerHeight);
    return Math.max(0.5, Math.min(pr, Math.sqrt((PX_CAP[gfxNow] || PX_CAP.high) / a)));
  }
  /* after the graphics chip gave up in this browser tab, the game starts lighter: one step down, after two the lowest */
  function gfxBoot() {
    var k = save.gfx === 'auto' ? gfxStart() : save.gfx, n = 0;
    try { n = +sessionStorage.getItem('pokju-gl-lost') || 0; } catch (e) {}
    if (n >= 2) return 'low';
    if (n >= 1) return k === 'high' ? 'mid' : 'low';   /* 1.5: a phone or tablet starts at 보통 already, so one loss has to bring it lower */
    return k;
  }
  /* the graphics picker: the level chosen, or the level really in use when the game had to come down from a chosen level */
  /* the picker keeps the level chosen (so that any other level can still be picked); when the game had to come down from it, that
     option says which level is really in use */
  var GFX_NAME = { high: '높음', mid: '보통', low: '낮음' };
  function gfxSel() {
    var el = $('opt-gfx'); if (!el) return;
    /* when the game had to come down from the chosen level, a line of its own says so and is the one shown, so every level, the chosen
       one too, can still be picked (picking the option already shown does nothing) */
    var down = GFX[save.gfx] && gfxNow !== save.gfx, ph = el.querySelector('option[value="now"]');
    if (down) {
      if (!ph) { ph = document.createElement('option'); ph.value = 'now'; ph.hidden = true; ph.disabled = true; el.insertBefore(ph, el.firstChild); }
      ph.textContent = GFX_NAME[save.gfx] + ' · 지금은 ' + GFX_NAME[gfxNow];
      el.value = 'now';
    } else { if (ph) ph.remove(); el.value = save.gfx; }
  }
  function applyGfx(k, keepRes) {
    var q = GFX[k] || GFX.high;
    gfxNow = GFX[k] ? k : 'high'; fxK = q.fx; mirEvery = q.mir;
    /* turning shadows off recompiles every lit material: in the middle of a run that waits for the menu */
    if (!(mode === 'play' && sun.castShadow && !q.shadow)) sun.castShadow = q.shadow;
    if (!keepRes) resK = 1;
    if (sun.shadow.mapSize.x !== q.map) { sun.shadow.mapSize.set(q.map, q.map); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
    if (typeof mirrorRT !== 'undefined' && mirrorRT.width !== q.mw) mirrorRT.setSize(q.mw, Math.round(q.mw / 3));
    gfxWin.length = 0; gfxHold = 2;
    gfxResizeNext = true;
  }
  function setRes(k) { resK = k; gfxWin.length = 0; gfxHold = 1.5; gfxFast = 0; gfxResizeNext = true; }
  /* a new resolution is applied at the start of a frame, just before it is drawn: resizing the canvas clears it, and done after a frame
     was drawn (gfxTick runs then) the cleared canvas showed for a moment, a black flash in the middle of a fight */
  var gfxResizeNext = false;
  function gfxApplyPending() { if (!gfxResizeNext) return; gfxResizeNext = false; renderer.setPixelRatio(gfxRatio()); resize(); }
  /* one step slower: the resolution first; then a level down, at a resolution that keeps the pixel count from going up again */
  /* the first resolution step past index i (going down when dir is 1, up when -1) that really changes the pixel ratio: on a big or sharp
     screen the pixel ceiling already holds it down, and a step that changes nothing only cost seconds of stutter (1.5) */
  function resStep(i, dir) {
    var pr0 = gfxRatio(), keep = resK, j, r = null;
    for (j = i + dir; i >= 0 && j >= 0 && j < RES_STEPS.length; j += dir) { resK = RES_STEPS[j]; if (dir > 0 ? gfxRatio() < pr0 - 1e-3 : gfxRatio() > pr0 + 1e-3) { r = RES_STEPS[j]; break; } }
    resK = keep; return r;
  }
  function gfxSlower() {
    var i = RES_STEPS.indexOf(resK), pr0 = gfxRatio(), base, j, down = resStep(i, 1);
    if (down !== null) { setRes(down); return; }
    if (gfxNow === 'low') return;
    applyGfx(gfxNow === 'high' ? 'mid' : 'low', true);
    base = Math.min(window.devicePixelRatio || 1, GFX[gfxNow].pr);
    for (j = 0; j < RES_STEPS.length - 1 && base * RES_STEPS[j] > pr0 + 1e-3; j++) {}
    setRes(RES_STEPS[j]);
  }
  /* frame times are judged by their median over about 1.5 s of driving, so a single stall (a shader compiling as something new
     comes into view, the sky's reflections being redrawn) does not count. They are measured against the screen's own refresh,
     taken from the quickest steady frames seen anywhere (a phone saving battery runs at 30 Hz, and that is not a slow device).
     Menus, pauses and the first moments of a run are not judged */
  function gfxTick(rdt) {
    if (paused || document.hidden || rdt <= 0) { gfxWin.length = 0; return; }
    gfxRef.push(rdt);
    if (gfxRef.length >= 60) { gfxBest = Math.max(1 / 150, Math.min(gfxBest, gfxRef.sort(function (a, b) { return a - b; })[12])); gfxRef.length = 0; }
    if (mode !== 'play') { gfxWin.length = 0; var sh = (GFX[gfxNow] || GFX.high).shadow; if (sun.castShadow !== sh) sun.castShadow = sh; return; }
    if (save.gfx !== 'auto') return;
    if (gfxHold > 0) { gfxHold -= rdt; return; }
    gfxWin.push(rdt);
    if (gfxWin.length < 90) return;
    var m = gfxWin.slice().sort(function (a, b) { return a - b; })[45], i = RES_STEPS.indexOf(resK), slow = Math.max(0.026, gfxBest * 1.35), fast = Math.max(0.0185, gfxBest * 1.12);
    gfxWin.length = 0;
    /* also slow whatever the screen's refresh: under about 28 fps everywhere (a weak graphics chip slow in the menu too) it never
       stepped down, the quickest frames being slow as well (1.5). A 30 Hz screen's 33 ms stays under this */
    if (m > slow || m > 0.036) {
      if (gfxRaised) gfxNoUp = true;   /* going back up made it slow again: stay where it is from now on */
      gfxRaised = false; gfxFast = 0; gfxSlower();
    } else if (m < fast && i > 0 && !gfxNoUp) {
      gfxRaised = false;
      if (++gfxFast >= 4) { var up = resStep(i, -1); if (up !== null) { setRes(up); gfxRaised = true; } else gfxFast = 0; }
    } else { gfxRaised = false; gfxFast = 0; }
  }

  /* ---------- pictures for the car cards: every car model is rendered once into a small off-screen target, one per frame so start-up is not held back ---------- */
  var carQ = [], thumbRT = null, thumbScene = null, thumbCam = null, thumbCv = null, thumbBuf = null, zeroH = new Float32Array(HILL_N), BLANK = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
  function carThumbStep() {
    if (!carQ.length) return;
    var key = carQ.shift(), car = CARS[key], W = 256, H = 160, g = car.g, par = g.parent, vis = g.visible, hid = [], L = car.spec.L, i, j, d;
    if (!thumbRT) {
      thumbRT = new T.WebGLRenderTarget(W, H); thumbRT.texture.colorSpace = T.SRGBColorSpace; thumbRT.isXRRenderTarget = true;   /* tone-mapped like the game */
      thumbScene = new T.Scene(); thumbScene.background = new T.Color(0x323957);
      /* studio light (1.3): a soft sky, a strong key from the front left and a cool rim from behind, so the panels read as curved */
      thumbScene.add(legacy(new T.HemisphereLight(0xdfe8ff, 0x3a4058, 0.5)));
      var dl = legacy(new T.DirectionalLight(0xfff4e6, 1.55)); dl.position.set(-5, 8, -6); thumbScene.add(dl);
      var rl = legacy(new T.DirectionalLight(0x9fc4ff, 0.9)); rl.position.set(6, 4, 7); thumbScene.add(rl);
      var fl = new T.Mesh(new T.CircleGeometry(40, 32), new T.MeshBasicMaterial({ color: C(0x4a5380) })); fl.rotation.x = -Math.PI / 2; fl.position.y = -0.02; thumbScene.add(fl);
      thumbCam = new T.PerspectiveCamera(26, W / H, 0.1, 120);
      thumbCv = document.createElement('canvas'); thumbCv.width = W; thumbCv.height = H; thumbBuf = new Uint8Array(W * H * 4);
    }
    thumbScene.add(g); g.visible = true;
    g.traverse(function (o) { if (o.isSprite && o.visible) { o.visible = false; hid.push(o); } });
    d = L * 1.5 + 2.6;
    thumbCam.position.set(-0.62 * d, 0.34 * d + 0.4, -0.7 * d); thumbCam.lookAt(0, car.spec.H * 0.42, 0); thumbCam.updateMatrixWorld();
    var kh = hillU.value, ks = splitU.value, kl = liftU.value, ex = renderer.toneMappingExposure;
    hillU.value = zeroH; splitU.value = zeroH; liftU.value = 0; renderer.toneMappingExposure = 1;
    try {
      renderer.setRenderTarget(thumbRT); renderer.render(thumbScene, thumbCam);
      renderer.readRenderTargetPixels(thumbRT, 0, 0, W, H, thumbBuf);
      var cx = thumbCv.getContext('2d'), img = cx.createImageData(W, H);
      for (j = 0; j < H; j++) for (i = 0; i < W * 4; i++) img.data[j * W * 4 + i] = thumbBuf[(H - 1 - j) * W * 4 + i];
      cx.putImageData(img, 0, 0); THUMB['c:' + key] = thumbCv.toDataURL('image/jpeg', 0.84);
    } catch (e) { THUMB['c:' + key] = ''; }
    renderer.setRenderTarget(null); renderer.toneMappingExposure = ex; hillU.value = kh; splitU.value = ks; liftU.value = kl;
    for (i = 0; i < hid.length; i++) hid[i].visible = true;
    par.add(g); g.visible = vis;
    var el = $('cimg-' + key); if (el && THUMB['c:' + key]) el.src = THUMB['c:' + key];
  }

  /* ---------- damage that shows: as hit points fall the car gets scratched, then smokes and sags, then burns ---------- */
  function scuffTex(kind) {
    var c = document.createElement('canvas'), g, i; c.width = 256; c.height = 128; g = c.getContext('2d');
    for (i = 0; i < (kind ? 5 : 3); i++) { var gx = 40 + Math.random() * 176, gy = 30 + Math.random() * 68, gr = 22 + Math.random() * 34, rg = g.createRadialGradient(gx, gy, 0, gx, gy, gr); rg.addColorStop(0, 'rgba(18,16,14,' + (kind ? 0.8 : 0.4) + ')'); rg.addColorStop(1, 'rgba(18,16,14,0)'); g.fillStyle = rg; g.fillRect(0, 0, 256, 128); }
    for (i = 0; i < (kind ? 9 : 14); i++) {
      var y0 = 20 + Math.random() * 88, x0 = 10 + Math.random() * 120, len = 50 + Math.random() * 110;
      g.strokeStyle = i % 3 ? 'rgba(215,215,210,0.85)' : 'rgba(30,28,26,0.9)'; g.lineWidth = 1 + Math.random() * 2.2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + len, y0 + (Math.random() - 0.5) * 16); g.stroke();
    }
    var t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
  }
  var dmgRoot = new T.Group(), dmgDecals = [], dmgStage = 0, dmgLean = 1, dmgCar = '', dmgRoll = 0, dmgPitch = 0, dmgGeo = new T.PlaneGeometry(1, 1);
  (function () {
    /* four scuff panels on the flanks, where every body is flat enough to carry them: two appear at the first stage, the sootier pair at the second */
    for (var i = 0; i < 6; i++) {
      var d = new T.Mesh(dmgGeo, new T.MeshBasicMaterial({ map: scuffTex(i === 2 || i === 3 || i === 5), transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
      if (i < 4) d.rotation.y = i % 2 ? Math.PI / 2 : -Math.PI / 2; else { d.rotation.x = -Math.PI / 2; d.rotation.z = i === 4 ? 0.5 : -0.9; }   /* the last two lie on the roof, where the chase view sees them */
      d.visible = false; d.userData.need = i === 2 || i === 3 || i === 5 ? 2 : 1; dmgRoot.add(d); dmgDecals.push(d);
    }
    playerRoot.add(dmgRoot);
  })();
  function dmgFit(car) {
    var s = car.spec, big = s.H > 2.2;
    dmgDecals.forEach(function (d, i) {
      if (i >= 4) { var rf = Math.max(-car.hl + 1.2, Math.min(car.hl - 1.4, (car.seatF || 0) - 0.55)); d.position.set(i === 4 ? -0.18 : 0.2, s.H + 0.035, -rf + (i === 4 ? -0.25 : 0.3)); d.scale.set(Math.min(1.5, s.W * 0.62), Math.min(1.1, s.W * 0.5), 1); return; }
      var side = i % 2 ? 1 : -1, back = i >= 2;
      d.position.set(side * (s.W / 2 + 0.05), big ? s.H * 0.4 : Math.min(0.95, s.H * 0.5), (back ? 0.2 : -0.16) * s.L * (side > 0 ? 1 : 0.8));
      d.scale.set(s.L * (back ? 0.34 : 0.3), big ? 0.9 : 0.46, 1);
    });
  }
  function dmgReset() { dmgStage = 0; dmgRoll = dmgPitch = 0; dmgLean = Math.random() < 0.5 ? -1 : 1; dmgDecals.forEach(function (d) { d.visible = false; d.material.opacity = 0; }); }
  function dmgStep(dt, car, on) {
    var r = player.hp / car.hp, act = on || (mode === 'demo' && tr.phase === 'play'), st = !act ? 0 : (r < 0.2 ? 3 : (r < 0.45 ? 2 : (r < 0.7 ? 1 : 0))), i, fz = -(car.hl - 0.5), fy = Math.min(1.35, car.spec.H * 0.62), px = player.x, bz = car.hl - 0.5, vs = veff * 0.22;
    if (dmgCar !== player.car) { dmgCar = player.car; dmgFit(car); }
    if (st > dmgStage && act && !player.dead) {
      /* dropping a stage: bits of bodywork come off */
      for (i = 0; i < 3 + st * 2; i++) spawnDebris(px + rnd(-car.hw, car.hw), 0.8, rnd(-car.hl, car.hl) * 0.6, i % 2 ? car.paint : M.dark, veff * 0.6);
      for (i = 0; i < 8; i++) spawnP('glow', px + rnd(-car.hw, car.hw), 0.6, rnd(-car.hl, 0), rnd(-9, 9), rnd(2, 9), veff * 0.6, 0.3, 0.8, 0.1, COL.spark, 1);
      shake = Math.min(1.2, shake + 0.25);
    }
    dmgStage = st;
    for (i = 0; i < dmgDecals.length; i++) {
      var d = dmgDecals[i], want = st >= d.userData.need ? (st === 3 ? 1 : 0.8) : 0;
      d.material.opacity = lerp(d.material.opacity, want, 1 - Math.exp(-dt * 6)); d.visible = d.material.opacity > 0.02 && !cockpit.visible;
    }
    dmgRoll = lerp(dmgRoll, dmgLean * [0, 0.006, 0.02, 0.04][st] + (st === 3 ? Math.sin(time * 23) * 0.006 : 0), 1 - Math.exp(-dt * 5));
    dmgPitch = lerp(dmgPitch, [0, 0, 0.008, 0.02][st], 1 - Math.exp(-dt * 5));
    if (player.dead || !st) return;
    /* the plume leaves the bonnet slowly, so it streams back over the roof where every view shows it */
    if (st === 1) { if (Math.random() < dt * 4 * fxK) spawnP('smoke', px + rnd(-0.3, 0.3), fy, fz, rnd(-0.4, 0.4), rnd(1.5, 2.5), vs, rnd(0.5, 0.8), 0.5, 1.8, smokeColor(COL.smokeL), 0.3, 0.3); return; }
    if (Math.random() < dt * (st === 3 ? 22 : 12) * fxK) spawnP('smoke', px + rnd(-0.35, 0.35), fy, fz + rnd(-0.2, 0.3), rnd(-0.6, 0.6), rnd(2.2, 4), vs, rnd(0.6, 1.0), 0.9, st === 3 ? 3.4 : 2.6, smokeColor(st === 3 ? COL.smokeD : COL.smokeL), st === 3 ? 0.75 : 0.5, 0.4);
    if (st === 3) {
      if (Math.random() < dt * 16 * fxK) spawnP('glow', px + rnd(-0.45, 0.45), fy - 0.05, fz + rnd(-0.2, 0.4), rnd(-1, 1), rnd(2, 4), vs * 0.7, rnd(0.25, 0.45), 1.5, 0.35, Math.random() < 0.5 ? COL.fire : COL.fire2, 0.9, 0.3);
      if (Math.random() < dt * 14 * fxK) spawnP('glow', px + dmgLean * car.hw * 0.5 + rnd(-0.3, 0.3), Math.min(1.2, car.spec.H * 0.5), bz + rnd(-0.2, 0.2), rnd(-1, 1), rnd(1.5, 3), vs, rnd(0.25, 0.4), 1.7, 0.4, COL.fire, 0.9, 0.3);   /* flames lick at the rear corner too */
      if (Math.random() < dt * 5 * fxK) spawnP('glow', px + rnd(-car.hw, car.hw), 0.25, rnd(-1, 1.5), rnd(-5, 5), rnd(0.5, 3), veff * 0.9, 0.3, 0.6, 0.1, COL.spark, 1);
    }
  }

  /* ---------- rear-view mirror: the road behind is drawn into a small target every other frame and shown, flipped left to right, on a panel at the top of the screen ---------- */
  /* the rear-view mirror is drawn every frame at a small size; its buffer gets the same tone mapping as the main picture (see js_fx2.js) */
  var mirrorRT = new T.WebGLRenderTarget(GFX[gfxNow].mw, Math.round(GFX[gfxNow].mw / 3), { type: HALF_RT ? T.HalfFloatType : T.UnsignedByteType }); mirrorRT.texture.colorSpace = T.SRGBColorSpace; mirrorRT.isXRRenderTarget = true;
  var mirrorCam = new T.PerspectiveCamera(40, 3, 0.5, 52), mirrorN = 0;   /* the mirror's fog is thick at 50 m (mirrorPass): nothing past it is drawn */
  var mirrorQuad = new T.Mesh(new T.PlaneGeometry(1, 1), new T.ShaderMaterial({ uniforms: { tMap: { value: mirrorRT.texture } }, depthTest: false, depthWrite: false, transparent: true, fog: false,
    vertexShader: 'varying vec2 vUv;\nvoid main() {\n\tvUv = uv;\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}',
    fragmentShader: ['uniform sampler2D tMap; varying vec2 vUv;', 'void main() {', '\tvec2 p = ( vUv - 0.5 ) * vec2( 3.0, 1.0 );', '\tfloat d = length( max( abs( p ) - vec2( 1.5 - 0.17, 0.5 - 0.17 ), 0.0 ) ) - 0.17;', '\tif ( d > 0.0 ) discard;',
      '\tvec3 c = texture2D( tMap, vec2( 1.0 - vUv.x, vUv.y ) ).rgb * 0.94 + vec3( 0.0, 0.01, 0.03 );', '\tgl_FragColor = vec4( mix( c, vec3( 0.05, 0.055, 0.065 ), smoothstep( -0.05, -0.035, d ) ), 1.0 );', '}'].join('\n') }));
  mirrorQuad.renderOrder = 999; mirrorQuad.frustumCulled = false; mirrorQuad.visible = false; camera.add(mirrorQuad);
  var mirTop = 12, mirLay = 0, mirEls = null;
  function mirrorLayout(wpx, hpx) {
    if (!mirEls) mirEls = [$('hud'), $('hud').querySelector('.obj'), $('hud').querySelector('.status')];
    var ro = mirEls[1].getBoundingClientRect(), rs = mirEls[2].getBoundingClientRect(), pad = parseFloat(getComputedStyle(mirEls[0]).paddingTop) || 14;
    var left = (vw - wpx) / 2, right = left + wpx, hit = ro.width > 0 && (ro.right + 10 > left || rs.left - 10 < right);
    mirTop = hit ? Math.max(ro.bottom, rs.bottom) + 8 : pad;
    var mb = Math.round(mirTop + hpx + 10) + 'px';
    document.documentElement.style.setProperty('--mb', mb);
    if (mb !== mirMb) { mirMb = mb; if (!$('qbox').hidden) qboxFit(); }   /* the card hangs from the mirror: placed again when it moves (a phone turned on its side) */
  }
  var mirMb = '';
  function mirrorPass(force) {
    var car = CARS[player.car], on = save.mirror && mode === 'play' && !player.dead && runKind !== 'tut';
    mirrorQuad.visible = on;
    if (!on) { if (mirLay !== -99) { mirLay = -99; mirMb = ''; document.documentElement.style.removeProperty('--mb'); if (!$('qbox').hidden) qboxFit(); } return; }
    if (mirLay === -99) mirLay = 0;
    /* the panel sits at the top centre; where the HUD chips would overlap it (a narrow screen, or a notch pushing them down) it goes below them */
    /* 1.5: a smaller mirror: 70% of its old size, and a little over half on a portrait phone, where it sits under the HUD chips and the
       question card hangs below it (a big mirror pushed the card down over the place where the answer gates come into view) */
    var small = vw <= 720 && vh > vw, hh = Math.tan(camera.fov * Math.PI / 360), hw = hh * camera.aspect, h = Math.min(0.24 * hh, 0.6 * hw * 2 / 3) * (small ? 0.55 : 0.7), w = h * 3;
    if (force || mirLay-- <= 0) { mirLay = 20; mirrorLayout(w / (2 * hw) * vw, h / (2 * hh) * vh); }
    var top = mirTop / vh * 2 * hh;
    mirrorQuad.scale.set(w, h, 1); mirrorQuad.position.set(0, hh - top - h / 2, -1);
    if (!force && (mirrorN++ % mirEvery)) return;
    mirrorCam.position.set(player.x, 1.25 + car.spec.H * 0.35, car.hl + 0.5); mirrorCam.lookAt(player.x, 0.9, car.hl + 40); mirrorCam.updateMatrixWorld();
    var kv = viewU.value, fn = scene.fog.near, ff = scene.fog.far, ck = cockpit.visible;
    viewU.value = mirrorCam.matrixWorldInverse; skyDome.position.copy(mirrorCam.position); scene.fog.near = Math.min(fn, 14); scene.fog.far = Math.min(ff, 50);
    cockpit.visible = false; mirrorQuad.visible = false; renderer.shadowMap.autoUpdate = false;
    try { renderer.setRenderTarget(mirrorRT); renderer.render(scene, mirrorCam); }
    finally {   /* should the mirror's picture fail, the main view must not keep the mirror's camera, fog and target */
      renderer.setRenderTarget(null);
      renderer.shadowMap.autoUpdate = true; cockpit.visible = ck; mirrorQuad.visible = true;
      viewU.value = kv; skyDome.position.copy(camera.position); scene.fog.near = fn; scene.fog.far = ff;
    }
  }

