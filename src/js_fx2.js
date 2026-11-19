  /* ---------- picture finish (graphics upgrade, after the mockup): the scene, then bloom on what glows, then a GLSL grade pass.
     The scene is drawn off screen exactly as it used to appear on screen: the buffers are flagged so the renderer applies its
     ACES tone mapping and sRGB encoding there too (as it does for a headset's buffer), so the sky dome and background, which
     write their colours as they should look, are not tone-mapped twice. Bloom and grading then work on that picture.
     Light sources turn brighter than white at dusk and at night so the bloom finds them: lamps, head and tail lights, eyes, neon ---------- */
  var post = null, postFlashT = 0, postLast = 0;
  var GLOW_MATS = [];
  function glowMat(m, day, night) { if (m && m.color) GLOW_MATS.push({ m: m, base: m.color.clone(), day: day, night: night }); return m; }
  [M.lamp, M.head, M.drl, M.eye, M.coil].forEach(function (m) { glowMat(m, 1.1, 2.0); });
  [M.tail, M.tailHot].forEach(function (m) { glowMat(m, 1.1, 1.5); });   /* pushed harder, the tone mapping turns red tail lights salmon */
  glowMat(M.amber, 1.1, 2.2);

  function postBuild() {
    if (!HALF_RT) return null;   /* devices that cannot draw into half-float buffers draw straight to the screen, as before */
    /* half float: the multisampled buffer and the texture it resolves into then share one format (8-bit would differ: linear vs sRGB) */
    var rt = new T.WebGLRenderTarget(2, 2, { type: T.HalfFloatType, samples: 4 });
    var composer = new EffectComposer(renderer, rt);
    [composer.renderTarget1, composer.renderTarget2].forEach(function (t) { t.isXRRenderTarget = true; t.texture.colorSpace = T.SRGBColorSpace; });
    composer.addPass(new RenderPass(scene, camera));
    var bloom = new UnrealBloomPass(new T.Vector2(256, 256), 0.3, 0.4, 0.93);
    /* the glow is soft anyway: its first level is never wider than 960 pixels, however sharp the screen */
    var bloomSize = bloom.setSize.bind(bloom);
    bloom.setSize = function (w, h) { var k = Math.min(1, 1920 / Math.max(1, w)); bloomSize(Math.round(w * k), Math.round(h * k)); };
    composer.addPass(bloom);
    /* a pixel that is not a number (NaN) or infinite, from any shader on any graphics chip, would be blurred by the bloom over the whole
       screen and black it out: the glow only ever takes in real colours (1.4) */
    var hp = bloom.materialHighPassFilter, hpFrom = 'vec4 texel = texture2D( tDiffuse, vUv );';
    if (hp.fragmentShader.indexOf(hpFrom) >= 0) { hp.fragmentShader = hp.fragmentShader.replace(hpFrom, hpFrom + '\n\t\t\tif ( any( isnan( texel ) ) || any( isinf( texel ) ) ) texel = vec4( 0.0 );'); hp.needsUpdate = true; }
    var grade = new ShaderPass({
      uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uSpeed: { value: 0 }, uFlash: { value: 0 }, uFlashColor: { value: new T.Color(0.2, 0.9, 0.55) }, uNight: { value: 0 }, uDusk: { value: 0 }, uRain: { value: 0 }, uRainY: { value: -1 }, uAspect: { value: 1 } },
      vertexShader: 'varying vec2 vUv;\nvoid main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: GLSL_GRADE_FRAG
    });
    grade.needsSwap = false;   /* it draws to the screen: swapping would make the composer keep a second full-size buffer */
    composer.addPass(grade);
    return { composer: composer, bloom: bloom, grade: grade.uniforms };
  }
  try { post = postBuild(); } catch (e) { post = null; }
  /* the sky's environment map: the sky dome drawn into a blurred cube map whenever the time, weather or region changes enough to show.
     Car paint, glass, chrome and the road reflect it */
  var envGen = new T.PMREMGenerator(renderer), envScene = new T.Scene(), envRT = null, envKey = '', envT = 0;
  envScene.add(new T.Mesh(skyDome.geometry, skyDome.material));
  ENV_MATS.push(roadMat, roadOutMat);
  /* the road, its shoulders and the fields are seen at a grazing angle: sharper filtering keeps the far road crisp instead of smeared */
  (function () { var a = Math.min(8, renderer.capabilities.getMaxAnisotropy() || 1); [roadTex, shoulderTex, groundTex].forEach(function (t) { if (t && t.anisotropy < a) { t.anisotropy = a; t.needsUpdate = true; } }); })();
  function updEnv(dt) {
    envT -= dt; if (envT > 0) return; envT = 0.6;
    var key = Math.round(cur.night * 16) + ',' + Math.round(weather.cloud * 8) + ',' + Math.round(tunK * 3) + ',' + Math.round(cur.sunDir.x * 8) + ',' + Math.round(cur.sunDir.y * 8);
    if (key === envKey) return;
    envKey = key;
    skyU.uLin.value = 1;   /* the dome paints display colours; the map has to hold light */
    var rt = envGen.fromScene(envScene, 0, 0.1, 1000);
    skyU.uLin.value = 0;
    for (var i = 0; i < ENV_MATS.length; i++) { var m = ENV_MATS[i]; if (!m.envMap) m.needsUpdate = true; m.envMap = rt.texture; }
    if (envRT) envRT.dispose();
    envRT = rt;
  }
  /* ---------- the graphics chip gave up (WebGL context lost, learning edition 1.4) ----------
     A tablet or laptop that runs short of graphics memory, or whose driver resets in a heavy moment (a blast, the effects of a gate),
     takes the 3D picture away: the screen went black behind the panels and stayed black while the car drove on unseen. Now the run
     pauses and says so. When the browser gives the picture back, everything is redrawn one quality step lower (the same load would
     only stop it again); if it does not come back, a reload starts the game at a lighter setting (gfxBoot, js_polish.js) */
  var glLost = false, glLostAt = 0, glLossN = 0, glNoteEnd = 0, glLostBg = false, glBgCounted = false, glShownAt = -1e9;   /* glBgCounted: a background loss counted for the next start only (the picture coming back late is still not answered with a lower quality) */
  try { glLossN = +sessionStorage.getItem('pokju-gl-lost') || 0; } catch (e) {}
  /* a phone often takes the picture away from a page sent to the background (1.5): that is no sign of a load too heavy, so such a loss
     is neither counted for the next start nor answered with a lower quality, and the wait for the picture starts when the page is back */
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { glShownAt = performance.now(); if (glLost) glLostAt = glShownAt; } });
  function glNote(txt, reload) {
    var el = $('glnote'), pz = $('pause'), inPanel = mode === 'play' && !pz.hidden;
    /* in a paused run it sits in the pause panel above its buttons (on a short screen a floating note covered them); elsewhere at the bottom */
    if (inPanel && el.parentNode !== pz) pz.insertBefore(el, pz.querySelector('.btns')); else if (!inPanel && el.parentNode !== document.body) document.body.appendChild(el);
    el.classList.toggle('inpanel', inPanel);
    $('glnote-text').textContent = txt; $('glnote-reload').hidden = !reload; el.hidden = !txt;
  }
  renderer.domElement.addEventListener('webglcontextlost', function (ev) {
    ev.preventDefault();   /* asks the browser to give the picture back */
    glLost = true; glLostAt = performance.now(); glNoteEnd = 0;
    glLostBg = document.hidden || glLostAt - glShownAt < 1500; glBgCounted = false;
    if (!glLostBg) { glLossN++; try { sessionStorage.setItem('pokju-gl-lost', String(glLossN)); } catch (e) {} }
    if (mode === 'play' && !paused) setPaused(true);
    glNote('그래픽 장치가 잠시 멈췄어요. 화면을 다시 그리는 중이에요…', false);
  }, false);
  renderer.domElement.addEventListener('webglcontextrestored', function () {
    glLost = false; envKey = ''; envT = 0;
    if (glLostBg) { glLostBg = false; gfxResizeNext = true; glNote('화면이 돌아왔어요.', false); glNoteEnd = performance.now() + 2500; return; }
    if (gfxNow !== 'low') applyGfx(gfxNow === 'high' ? 'mid' : 'low', false);
    else setRes(RES_STEPS[RES_STEPS.length - 1]);
    gfxNoUp = true; gfxSel();
    glNote('화면이 돌아왔어요. 화질을 한 단계 낮췄어요.', false); glNoteEnd = performance.now() + 4000;
  }, false);
  $('glnote-reload').addEventListener('click', function () { location.reload(); });
  /* from the main loop, every frame: after five seconds without a picture, a reload is offered */
  function glWatch() {
    var ge = $('glnote');
    if (!ge.hidden && (ge.parentNode === $('pause')) !== (mode === 'play' && !$('pause').hidden)) glNote($('glnote-text').textContent, !$('glnote-reload').hidden);   /* the run was left (menu, title) or paused again */
    if (glLost) {
      if (mode === 'play' && !paused && briefT <= 0) { setPaused(true); glNote($('glnote-text').textContent, !$('glnote-reload').hidden); }   /* lost during the start card: stopped as soon as the run begins, the note moved into the panel */
      if (performance.now() - glLostAt > 5000 && $('glnote-reload').hidden && glLostBg && !glBgCounted) { glBgCounted = true; glLossN++; try { sessionStorage.setItem('pokju-gl-lost', String(glLossN)); } catch (e) {} }   /* lost in the background and still not back: a reload does start lighter, as the note says */
      if (performance.now() - glLostAt > 5000 && $('glnote-reload').hidden) glNote('화면이 돌아오지 않아요. 다시 불러오면 화질을 낮춰서 시작해요. 지금 판은 처음부터 다시 해요.', true); return; }
    if (glNoteEnd && performance.now() > glNoteEnd && ge.parentNode !== $('pause')) { glNoteEnd = 0; glNote('', false); }   /* not while it sits in the pause panel: the buttons under it would move up under a finger about to tap 계속하기 */
  }
  function postResize(w, h) {
    if (!post) return;
    /* fewer samples at the middle setting: on a phone the multisampled half-float buffer is the biggest cost after the pixels themselves */
    var s = (GFX[gfxNow] || GFX.high).msaa || 0, pr = renderer.getPixelRatio();
    /* a big, sharp screen (a 2560×1600 tablet, a 4K monitor) at 높음: 4× samples of a half-float picture took about 150 MB there alone.
       2× is enough where the pixels are that small (1.5) */
    if (s > 2 && w * h * pr * pr > 2.4e6) s = 2;
    [post.composer.renderTarget1, post.composer.renderTarget2].forEach(function (t) { if (t.samples !== s) { t.samples = s; t.dispose(); } });
    post.composer.setPixelRatio(renderer.getPixelRatio()); post.composer.setSize(w, h); post.grade.uAspect.value = w / Math.max(1, h);
  }
  /* a right or wrong answer washes the picture green or red for a moment */
  function postFlash(ok) {
    if (!post) return;
    post.grade.uFlashColor.value.setRGB(ok ? 0.2 : 1.0, ok ? 0.9 : 0.25, ok ? 0.55 : 0.35);
    postFlashT = 1;
  }
  /* how lit the light sources are: brighter than white once the sun goes down */
  function postLights() {
    var k = cur.night, i, g;
    for (i = 0; i < GLOW_MATS.length; i++) { g = GLOW_MATS[i]; g.m.color.copy(g.base).multiplyScalar(lerp(g.day, g.night, k)); }
    for (i = 0; i < NEON_SIGNS.length; i++) { g = NEON_SIGNS[i]; g.m.color.copy(g.base).multiplyScalar(lerp(g.day, g.night, k)); }
  }
  function renderFrame() {
    var q = GFX[gfxNow] || GFX.high, now = performance.now(), dt = Math.min(0.1, (now - postLast) / 1000);
    postLast = now;
    postLights(); updEnv(dt);
    if (!post) { renderer.render(scene, camera); return; }
    /* the lowest setting still finishes the picture off screen (that is where it is antialiased), only without the glow */
    var u = post.grade, n = cur.night, car = CARS[player.car];
    var dusk = clamp(1 - Math.abs(n - 0.35) / 0.3, 0, 1);
    post.bloom.enabled = q.post > 0;
    post.bloom.strength = (0.12 + 0.2 * n + 0.04 * dusk) * q.post;
    post.bloom.threshold = 0.93;   /* lit windows reach about 0.9 at night: any lower and every building glows white */
    postFlashT = Math.max(0, postFlashT - dt * 2.2);
    u.uFlash.value = postFlashT * 0.45;
    u.uTime.value = (now / 1000) % 1000; u.uNight.value = n; u.uDusk.value = dusk;
    /* drops on the lens in the rain, out in the open, in the views that look through a windscreen or from just behind the car */
    u.uRain.value = lerp(u.uRain.value, mode === 'play' && !save.calm ? rainK * (1 - tunK) : 0, 1 - Math.exp(-dt * 1.5));
    var fast = mode === 'play' && car ? clamp((veff - car.vmax * 0.92) / (car.vmax * 0.35), 0, 1) : 0;
    /* while answer signs are coming up, the speed blur at the edges stays light: a right answer gives nitro, and the next gate's signs
       were smeared just as they had to be read (1.5) */
    var signsUp = quiz.phase === 'ask' && !!(quiz.g || quiz.b);
    u.uSpeed.value = lerp(u.uSpeed.value, Math.max(fast, buff.nitro > 0 ? 0.55 : 0) * fxK * (signsUp ? 0.3 : 1), 1 - Math.exp(-dt * 5));
    if (!isFinite(u.uSpeed.value)) u.uSpeed.value = 0;   /* a value that once went wrong would otherwise stay wrong: each frame starts from the last */
    if (!isFinite(u.uRain.value)) u.uRain.value = 0;
    /* where the dash's top edge is on the screen in the driver's seat: the lens drops stop there */
    u.uRainY.value = cockpit.visible ? 0.5 + 0.5 * ((-0.31 + cockpit.position.y) / 1.19) / Math.tan(camera.fov * Math.PI / 360) : -1;
    post.composer.render(dt);
  }
