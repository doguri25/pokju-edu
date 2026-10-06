  /* ---------- sky: a dome that travels with the camera. Horizon-to-zenith gradient, sun or moon with a halo, stars at night, drifting clouds that thicken with the weather.
     Colours are written as they should appear on screen, like the plain background colour behind it ---------- */
  var skyU = { uTop: { value: new T.Color() }, uHor: { value: new T.Color() }, uSun: { value: new T.Vector3(0, 1, 0) }, uSunCol: { value: new T.Color() }, uDark: { value: new T.Color() },
    uNight: { value: 0 }, uCloud: { value: 0.3 }, uTime: { value: 0 }, uDim: { value: 1 } };
  var skyDome = new T.Mesh(new T.SphereGeometry(480, 32, 16), new T.ShaderMaterial({ uniforms: skyU, side: T.BackSide, depthWrite: false, depthTest: false, fog: false,
    vertexShader: 'varying vec3 vDir;\nvoid main() {\n\tvDir = position;\n\tgl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );\n}',
    fragmentShader: [
      'uniform vec3 uTop; uniform vec3 uHor; uniform vec3 uSun; uniform vec3 uSunCol; uniform vec3 uDark; uniform float uNight; uniform float uCloud; uniform float uTime; uniform float uDim;',
      'varying vec3 vDir;',
      'float hash( vec2 p ) { return fract( sin( dot( p, vec2( 127.1, 311.7 ) ) ) * 43758.5453 ); }',
      'float noise( vec2 p ) { vec2 i = floor( p ), f = fract( p ); f = f * f * ( 3.0 - 2.0 * f ); return mix( mix( hash( i ), hash( i + vec2( 1.0, 0.0 ) ), f.x ), mix( hash( i + vec2( 0.0, 1.0 ) ), hash( i + vec2( 1.0, 1.0 ) ), f.x ), f.y ); }',
      'void main() {',
      '\tvec3 d = normalize( vDir );',
      '\tfloat h = clamp( d.y, 0.0, 1.0 );',
      '\tvec3 col = mix( uHor, uTop, pow( h, 0.55 ) );',
      '\tfloat sd = max( dot( d, normalize( uSun ) ), 0.0 );',
      '\tcol += uSunCol * ( pow( sd, 900.0 ) * 1.5 + pow( sd, 30.0 ) * 0.26 + pow( sd, 5.0 ) * 0.1 );',
      '\tif ( uNight > 0.5 && d.y > 0.02 ) {',
      '\t\tvec2 sp = d.xz / ( d.y + 0.35 ) * 70.0; float s = hash( floor( sp ) ); vec2 sf = fract( sp ) - 0.5;',
      '\t\tfloat star = step( 0.955, s ) * smoothstep( 0.22, 0.03, length( sf ) );',
      '\t\tcol += vec3( star ) * smoothstep( 0.5, 1.0, uNight ) * ( 0.55 + 0.45 * sin( uTime * 2.0 + s * 40.0 ) ) * smoothstep( 0.02, 0.25, d.y ) * ( 1.0 - uCloud );',
      '\t}',
      '\tif ( d.y > 0.0 ) {',
      '\t\tvec2 cp = d.xz / ( d.y + 0.12 ) * 1.6 + vec2( uTime * 0.012, uTime * 0.004 );',
      '\t\tfloat n = noise( cp ) * 0.55 + noise( cp * 2.3 + 7.1 ) * 0.3 + noise( cp * 5.1 + 3.3 ) * 0.15;',
      '\t\tfloat c = smoothstep( 0.82 - uCloud * 0.75, 1.12 - uCloud * 0.75, n ) * smoothstep( 0.0, 0.18, d.y );',
      '\t\tvec3 cc = mix( uHor, vec3( 1.0 ), 0.55 - 0.45 * uNight ) * ( 1.0 - 0.35 * uCloud ) + uSunCol * pow( sd, 6.0 ) * 0.22;',
      '\t\tcol = mix( col, cc, c * ( 0.55 + 0.4 * uCloud ) );',
      '\t}',
      '\tgl_FragColor = vec4( mix( uDark, col, uDim ), 1.0 );',
      '}'].join('\n') }));
  skyDome.renderOrder = -100; skyDome.frustumCulled = false; scene.add(skyDome);
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
  }

  /* ---------- graphics quality: three levels; 「자동」 starts high and steps down when frames take too long ---------- */
  var GFX = { high: { pr: 2, shadow: true, fx: 1, map: 2048, mir: 2 }, mid: { pr: 1.5, shadow: true, fx: 0.7, map: 1024, mir: 3 }, low: { pr: 1, shadow: false, fx: 0.45, map: 1024, mir: 3 } }, gfxNow = 'high', gfxAcc = 0, gfxN = 0, fxK = 1, mirEvery = 2;
  /* 「자동」 starts one step down on a phone-sized or touch screen: those are the devices where the full setting costs frames */
  function gfxStart() { var small = Math.min(window.innerWidth, window.innerHeight) <= 520 || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches); return small ? 'mid' : 'high'; }
  function applyGfx(k) {
    var q = GFX[k] || GFX.high;
    gfxNow = GFX[k] ? k : 'high'; fxK = q.fx; sun.castShadow = q.shadow; mirEvery = q.mir;
    if (sun.shadow.mapSize.x !== q.map) { sun.shadow.mapSize.set(q.map, q.map); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, q.pr)); resize();
  }
  function gfxTick(rdt) {
    if (save.gfx !== 'auto' || paused) return;
    gfxAcc += rdt; gfxN++;
    if (gfxN >= 120) { var avg = gfxAcc / gfxN; gfxAcc = 0; gfxN = 0; if (avg > 0.028 && gfxNow !== 'low') applyGfx(gfxNow === 'high' ? 'mid' : 'low'); }
  }

  /* ---------- pictures for the car cards: every car model is rendered once into a small off-screen target, one per frame so start-up is not held back ---------- */
  var carQ = [], thumbRT = null, thumbScene = null, thumbCam = null, thumbCv = null, thumbBuf = null, zeroH = new Float32Array(HILL_N), BLANK = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
  function carThumbStep() {
    if (!carQ.length) return;
    var key = carQ.shift(), car = CARS[key], W = 256, H = 160, g = car.g, par = g.parent, vis = g.visible, hid = [], L = car.spec.L, i, j, d;
    if (!thumbRT) {
      thumbRT = new T.WebGLRenderTarget(W, H); thumbRT.texture.encoding = T.sRGBEncoding;
      thumbScene = new T.Scene(); thumbScene.background = new T.Color(0xdfe8f3);
      thumbScene.add(new T.HemisphereLight(0xffffff, 0x9aa3b0, 1.0));
      var dl = new T.DirectionalLight(0xffffff, 1.25); dl.position.set(-5, 8, -6); thumbScene.add(dl);
      var fl = new T.Mesh(new T.CircleGeometry(40, 32), new T.MeshBasicMaterial({ color: C(0xc9d4e2) })); fl.rotation.x = -Math.PI / 2; fl.position.y = -0.02; thumbScene.add(fl);
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
    var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; return t;
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
  var mirrorRT = new T.WebGLRenderTarget(384, 128); mirrorRT.texture.encoding = T.sRGBEncoding;
  var mirrorCam = new T.PerspectiveCamera(40, 3, 0.5, 90), mirrorN = 0;
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
    document.documentElement.style.setProperty('--mb', Math.round(mirTop + hpx + 10) + 'px');
  }
  function mirrorPass(force) {
    var car = CARS[player.car], on = save.mirror && gfxNow !== 'low' && mode === 'play' && !player.dead && runKind !== 'tut';
    mirrorQuad.visible = on;
    if (!on) { if (mirLay !== -99) { mirLay = -99; document.documentElement.style.removeProperty('--mb'); } return; }
    if (mirLay === -99) mirLay = 0;
    /* the panel sits at the top centre; where the HUD chips would overlap it (a narrow screen, or a notch pushing them down) it goes below them */
    var hh = Math.tan(camera.fov * Math.PI / 360), hw = hh * camera.aspect, h = Math.min(0.24 * hh, 0.6 * hw * 2 / 3), w = h * 3;
    if (force || mirLay-- <= 0) { mirLay = 20; mirrorLayout(w / (2 * hw) * vw, h / (2 * hh) * vh); }
    var top = mirTop / vh * 2 * hh;
    mirrorQuad.scale.set(w, h, 1); mirrorQuad.position.set(0, hh - top - h / 2, -1);
    if (!force && (mirrorN++ % mirEvery)) return;
    mirrorCam.position.set(player.x, 1.25 + car.spec.H * 0.35, car.hl + 0.5); mirrorCam.lookAt(player.x, 0.9, car.hl + 40); mirrorCam.updateMatrixWorld();
    var kv = viewU.value, fn = scene.fog.near, ff = scene.fog.far, ck = cockpit.visible;
    viewU.value = mirrorCam.matrixWorldInverse; skyDome.position.copy(mirrorCam.position); scene.fog.near = Math.min(fn, 14); scene.fog.far = Math.min(ff, 50);
    cockpit.visible = false; mirrorQuad.visible = false; renderer.shadowMap.autoUpdate = false;
    renderer.setRenderTarget(mirrorRT); renderer.render(scene, mirrorCam); renderer.setRenderTarget(null);
    renderer.shadowMap.autoUpdate = true; cockpit.visible = ck; mirrorQuad.visible = true;
    viewU.value = kv; skyDome.position.copy(camera.position); scene.fog.near = fn; scene.fog.far = ff;
  }

