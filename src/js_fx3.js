  /* ---------- graphics upgrade 3: explosions, sparks, scorch marks, a wet road with puddles ----------
     - a fireball: a noisy ball whose surface boils (vertex displacement), white-hot at the core, orange, then sooty at the rim, burning
       out from the inside (src/shaders/fireball.vert/.frag). Brighter than white, so the bloom wraps it in light
     - sparks: streaks drawn along their motion, one draw call for all of them; they bounce off the road and cool from white to red
     - scorch marks left on the road where something blew up, travelling with the road and fading
     - puddles: on a wet road some patches turn into mirrors, and the whole surface darkens */

  /* fireballs: a small pool, reused */
  var FB_N = 8, fireballs = [], fbGeo = new T.IcosahedronGeometry(1, 3);
  fbGeo.boundingSphere = new T.Sphere(new T.Vector3(), 1.5);
  for (var fbi = 0; fbi < FB_N; fbi++) {
    var fbm = new T.ShaderMaterial({ uniforms: { uT: { value: 0 }, uSeed: { value: fbi * 7.31 }, uHeat: { value: 1 }, uNight: { value: 0 } },
      vertexShader: GLSL_FIREBALL_VERT, fragmentShader: GLSL_FIREBALL_FRAG, transparent: true, depthWrite: false, fog: false });
    var fbMesh = new T.Mesh(fbGeo, fbm); fbMesh.visible = false; fbMesh.renderOrder = 3; scene.add(fbMesh);
    fireballs.push({ m: fbMesh, u: fbm.uniforms, life: 0, max: 1, size: 1, vy: 0, vz: 0, delay: 0 });
  }
  var fbNext = 0;
  function fireball(x, y, z, size, vz, delay, heat) {
    var f = fireballs[fbNext++ % FB_N];
    f.m.position.set(x, y, z); f.life = f.max = 0.75 + 0.35 * Math.min(size, 2); f.size = size; f.vy = 1.6 + size; f.vz = vz; f.delay = delay || 0;
    f.u.uSeed.value = Math.random() * 50; f.u.uHeat.value = heat === undefined ? 1 : heat; f.u.uT.value = 0;
    f.m.rotation.set(rnd(0, 6), rnd(0, 6), 0); f.m.scale.setScalar(0.01); f.m.visible = f.delay <= 0;
  }

  /* sparks: line segments, a head and a tail per spark */
  var SPK_N = 320, spk = [], spkPos = new Float32Array(SPK_N * 6), spkCol = new Float32Array(SPK_N * 6), spkGeo = new T.BufferGeometry();
  spkGeo.setAttribute('position', new T.BufferAttribute(spkPos, 3).setUsage(T.DynamicDrawUsage));
  spkGeo.setAttribute('color', new T.BufferAttribute(spkCol, 3).setUsage(T.DynamicDrawUsage));
  spkGeo.setDrawRange(0, 0);
  var spkMesh = new T.LineSegments(spkGeo, new T.LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false, toneMapped: false }));
  spkMesh.frustumCulled = false; spkMesh.renderOrder = 4; scene.add(spkMesh);
  var SPK_HOT = new T.Color(1.0, 0.86, 0.55), SPK_COOL = new T.Color(1.0, 0.32, 0.08);
  function sparkAdd(x, y, z, vx, vy, vz, life) {
    if (spk.length >= SPK_N) spk.shift();
    spk.push({ x: x, y: y, z: z, vx: vx, vy: vy, vz: vz, life: life, max: life });
  }
  function sparks(x, y, z, n, speed, vz) {
    n = Math.round(n * (0.5 + 0.5 * fxK));
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, up = rnd(0.15, 1), s = speed * rnd(0.4, 1);
      sparkAdd(x, y, z, Math.cos(a) * s * (1 - up * 0.5), up * s * 0.9, vz + Math.sin(a) * s * (1 - up * 0.5), rnd(0.35, 0.8));
    }
  }

  /* scorch marks */
  var scorchTex = (function () {
    var c = document.createElement('canvas'); c.width = c.height = 128;
    var g = c.getContext('2d'), i;
    var r = g.createRadialGradient(64, 64, 4, 64, 64, 62); r.addColorStop(0, 'rgba(0,0,0,0.95)'); r.addColorStop(0.45, 'rgba(0,0,0,0.7)'); r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    g.globalCompositeOperation = 'destination-out';   /* a ragged edge: bites out of the rim */
    for (i = 0; i < 60; i++) { var a = Math.random() * 6.283, d = rnd(30, 64); g.fillStyle = 'rgba(0,0,0,' + rnd(0.2, 0.7) + ')'; g.beginPath(); g.arc(64 + Math.cos(a) * d, 64 + Math.sin(a) * d, rnd(3, 11), 0, 6.283); g.fill(); }
    return new T.CanvasTexture(c);
  })();
  var scorches = [], scGeo = new T.PlaneGeometry(1, 1, 1, 2); scGeo.rotateX(-Math.PI / 2);
  for (var sci = 0; sci < 6; sci++) {
    var scm = new T.Mesh(scGeo, new T.MeshBasicMaterial({ map: scorchTex, color: 0x000000, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    scm.visible = false; scm.renderOrder = 1; scene.add(scm); scorches.push({ m: scm, life: 0 });
  }
  var scNext = 0;
  function scorch(x, z, size) {
    var s = scorches[scNext++ % scorches.length];
    s.m.position.set(x, 0.035, z); s.m.scale.set(3.6 * size, 1, 3.6 * size); s.m.rotation.y = rnd(0, 6.28); s.life = 6; s.m.visible = true;
  }

  /* the per-frame part, called from step() in js_gb.js */
  var fbCam = new T.Vector3();
  function fx3Step(dt) {
    var i, f, t, n = 0, k;
    for (i = 0; i < FB_N; i++) {
      f = fireballs[i];
      if (f.life <= 0) continue;
      if (f.delay > 0) { f.delay -= dt; if (f.delay > 0) continue; f.m.visible = true; }
      f.life -= dt; t = 1 - Math.max(0, f.life) / f.max;
      f.u.uT.value = t; f.u.uNight.value = cur.night;
      f.m.scale.setScalar(f.size * (0.5 + 1.25 * (1 - Math.pow(1 - t, 2.4))));
      f.m.position.y += f.vy * dt; f.vy *= 1 - dt * 1.2;
      f.vz += (veff - f.vz) * dt * 1.4; f.m.position.z += f.vz * dt;
      f.m.rotation.y += dt * 0.6;
      if (f.life <= 0) f.m.visible = false;
    }
    /* sparks: gravity, drag, a bounce on the road; head bright, tail fading into the dark */
    for (i = spk.length - 1; i >= 0; i--) {
      var p = spk[i]; p.life -= dt;
      if (p.life <= 0 || p.z > 30) { spk.splice(i, 1); continue; }
      p.vy -= 20 * dt; p.vx *= 1 - dt * 1.5; p.vz += (veff - p.vz) * dt * 0.8;
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      if (p.y < 0.04) { p.y = 0.04; p.vy = Math.abs(p.vy) * 0.38; p.vx *= 0.7; }
    }
    for (i = 0; i < spk.length; i++) {
      p = spk[i]; t = p.life / p.max; k = i * 6;
      var len = 0.028 + 0.012 * t, hx = p.x, hy = p.y, hz = p.z, rz = p.vz - veff;   /* the streak follows the motion relative to the road under it */
      spkPos[k] = hx; spkPos[k + 1] = hy; spkPos[k + 2] = hz;
      spkPos[k + 3] = hx - p.vx * len; spkPos[k + 4] = hy - p.vy * len; spkPos[k + 5] = hz - rz * len;
      tmpCol.copy(SPK_COOL).lerp(SPK_HOT, t).multiplyScalar(2.6 * t + 0.4);
      spkCol[k] = tmpCol.r; spkCol[k + 1] = tmpCol.g; spkCol[k + 2] = tmpCol.b;
      spkCol[k + 3] = tmpCol.r * 0.12; spkCol[k + 4] = tmpCol.g * 0.08; spkCol[k + 5] = tmpCol.b * 0.05;
      n++;
    }
    spkGeo.setDrawRange(0, n * 2);
    if (n) { spkGeo.attributes.position.needsUpdate = true; spkGeo.attributes.color.needsUpdate = true; }
    spkMesh.visible = n > 0;
    for (i = 0; i < scorches.length; i++) {
      var s = scorches[i];
      if (s.life <= 0) continue;
      s.life -= dt; s.m.position.z += veff * dt;
      s.m.material.opacity = 0.62 * Math.min(1, s.life / 2) * (1 - 0.5 * tunK);
      if (s.life <= 0 || s.m.position.z > 40) { s.life = 0; s.m.visible = false; }
    }
  }
  function fx3Clear() {
    var i;
    for (i = 0; i < FB_N; i++) { fireballs[i].life = 0; fireballs[i].m.visible = false; }
    spk.length = 0; spkGeo.setDrawRange(0, 0); spkMesh.visible = false;
    for (i = 0; i < scorches.length; i++) { scorches[i].life = 0; scorches[i].m.visible = false; }
    if (post) post.grade.uRain.value = 0;   /* no drops carried over from the last run's rain */
  }

  /* puddles: the road shader gets a mask, sampled in the road's own texture space so it travels with the road. Where it is set and the road
     is wet, the asphalt goes dark and almost mirror-smooth, so the sky, the lamps and the neon show in it */
  var puddleTex = (function () {
    var c = document.createElement('canvas'), W = 256, H = 512; c.width = W; c.height = H;
    var g = c.getContext('2d'), i;
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    for (i = 0; i < 26; i++) {
      var x = rnd(10, W - 10), y = rnd(10, H - 10), rx = rnd(10, 46), ry = rnd(14, 70), ro = rnd(-0.4, 0.4), al = rnd(0.6, 1);
      for (var dx = -W; dx <= W; dx += W) for (var dy = -H; dy <= H; dy += H) {   /* drawn on all sides, so the tile wraps */
        g.save(); g.translate(x + dx, y + dy); g.rotate(ro); g.scale(rx, ry);
        var r = g.createRadialGradient(0, 0, 0, 0, 0, 1); r.addColorStop(0, 'rgba(255,255,255,' + al + ')'); r.addColorStop(0.6, 'rgba(255,255,255,' + al * 0.8 + ')'); r.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = r; g.beginPath(); g.arc(0, 0, 1, 0, 6.283); g.fill(); g.restore();
      }
    }
    var t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; return t;
  })();
  var roadWetU = { value: 0 }, roadPudU = { value: puddleTex };
  (function () {
    var hill = T.Material.prototype.onBeforeCompile;
    [roadMat, roadOutMat].forEach(function (m) {
      m.onBeforeCompile = function (sh) {
        hill.call(this, sh);
        sh.uniforms.uWet = roadWetU; sh.uniforms.tPud = roadPudU;
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vPudX;').replace('#include <fog_vertex>', 'vPudX = ( modelMatrix * vec4( transformed, 1.0 ) ).x;\n#include <fog_vertex>');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uWet;\nuniform sampler2D tPud;\nvarying float vPudX;')
          /* each lane reads the asphalt a little further along, so patches and cracks never line up across the road */
          .replace('#include <map_fragment>', '#ifdef USE_MAP\n\tfloat laneK = step( -4.2, vPudX ) + step( -0.205, vPudX ) + step( 0.205, vPudX ) + step( 4.2, vPudX );\n\tdiffuseColor *= texture2D( map, vec2( vMapUv.x, vMapUv.y + laneK * 0.383 ) );\n#endif')
          .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n#ifdef USE_MAP\n\tfloat pud = smoothstep( 0.25, 0.75, texture2D( tPud, vec2( vPudX * 0.071, vMapUv.y * 0.57 ) ).r ) * uWet;\n\troughnessFactor = mix( roughnessFactor, 0.035, pud );\n\tdiffuseColor.rgb *= 1.0 - 0.5 * pud;\n#endif')
          .replace('#include <lights_fragment_maps>', '#include <lights_fragment_maps>\n#ifdef USE_MAP\n\tradiance *= 1.0 + 1.0 * pud;\n#endif');
      };
      m.customProgramCacheKey = function () { return 'road-puddles'; };
      m.needsUpdate = true;
    });
  })();
