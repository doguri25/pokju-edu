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
    var fbMesh = new T.Mesh(fbGeo, fbm); fbMesh.visible = false; scene.add(fbMesh);
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
  var spkFree = [];
  for (var spi = 0; spi < SPK_N; spi++) spkFree.push({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0, max: 1 });
  function sparkAdd(x, y, z, vx, vy, vz, life) {
    var p = spkFree.pop();
    if (!p) { p = spk[0]; spk[0] = spk[spk.length - 1]; spk.pop(); }   /* all in use: the oldest makes way */
    p.x = x; p.y = y; p.z = z; p.vx = vx; p.vy = vy; p.vz = vz; p.life = p.max = life;
    spk.push(p);
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
    scm.visible = false; scm.renderOrder = -1; scene.add(scm); scorches.push({ m: scm, life: 0 });
  }
  var scNext = 0;
  function scorch(x, z, size) {
    if (splitVal(dist - z - 3) || splitVal(dist - z + 3)) return;   /* a split level: the mark would hang between the two decks */
    var s = scorches[scNext++ % scorches.length];
    s.m.position.set(x, 0.035, z); s.m.scale.set(3.6 * size, 1, 3.6 * size); s.m.rotation.y = rnd(0, 6.28); s.life = 6; s.m.visible = true;
  }

  /* the player's contact shadow lies flat on the road under the car: on the sprung body it rolled into the asphalt on every lane change */
  var playerAO = new T.Mesh(aoGeo, aoMat); playerAO.renderOrder = -1; scene.add(playerAO);
  function playerAOStep() {
    var car = CARS[player.car];
    playerAO.visible = !!(car && car.g && car.g.visible && !player.dead);
    if (!playerAO.visible) return;
    playerAO.position.set(playerRoot.position.x, 0.03, 0); playerAO.rotation.y = playerRoot.rotation.y;
    playerAO.scale.set(car.hw * 2 * 1.3, 1, car.hl * 2 * 1.14);
  }

  /* the per-frame part, called from step() in js_gb.js */
  var fbCam = new T.Vector3();
  function fx3Step(dt) {
    var i, f, t, n = 0, k;
    waterU.uWT.value = time % 600; waterU.uWD.value = dist; seaStep(dt); playerAOStep(); leafStep(dt);
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
      if (p.life <= 0 || p.z > 30) { spkFree.push(p); spk[i] = spk[spk.length - 1]; spk.pop(); continue; }
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
    while (spk.length) spkFree.push(spk.pop());
    spkGeo.setDrawRange(0, 0); spkMesh.visible = false;
    for (i = 0; i < scorches.length; i++) { scorches[i].life = 0; scorches[i].m.visible = false; }
    if (post) post.grade.uRain.value = 0;   /* no drops carried over from the last run's rain */
    envKey = ''; envT = 0;   /* a new hour or weather: bake the sky's reflections now, not in half a second */
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
          .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n#ifdef USE_MAP\n\tfloat pud = smoothstep( 0.25, 0.75, texture2D( tPud, vec2( vPudX * 0.071, vMapUv.y * 0.5 ) ).r ) * uWet;\n\troughnessFactor = mix( roughnessFactor, 0.035, pud );\n\tdiffuseColor.rgb *= 1.0 - 0.5 * pud;\n#endif')
          .replace('#include <lights_fragment_maps>', '#include <lights_fragment_maps>\n#ifdef USE_MAP\n\tradiance *= 1.0 + 0.5 * pud;\n#endif');
      };
      m.customProgramCacheKey = function () { return 'road-puddles'; };
      m.needsUpdate = true;
    });
  })();

  /* water (graphics upgrade 3): the sea, the creek and puddles get moving waves worked out in the shader. A few travelling swells
     and a finer chop tilt the surface normal, so the sun glints and the sky's reflection ripples; seen flat on, deep water stays dark.
     The sea lies on a strip that does not move, so its waves are laid out along the road's distance to travel past like the shore */
  var waterU = { uWT: { value: 0 }, uWD: { value: 0 } };
  var WAVE_GLSL = [
    'vec2 waveGrad( vec2 p, float t ) {',
    '\tvec2 d1 = vec2( 0.287, 0.958 ), d2 = vec2( -0.759, 0.651 ), d3 = vec2( 0.976, 0.217 ), d4 = vec2( -0.196, -0.981 ), g = vec2( 0.0 );',
    '\tg += d1 * 0.9 * cos( dot( d1, p ) * 0.9 - t * 1.3 );',
    '\tg += d2 * 0.7 * cos( dot( d2, p ) * 1.7 - t * 1.9 );',
    '\tg += d3 * 0.5 * cos( dot( d3, p ) * 3.1 - t * 2.6 );',
    '\tg += d4 * 0.35 * cos( dot( d4, p ) * 5.3 - t * 3.4 );',
    '\tg += vec2( 0.6, -0.4 ) * 0.25 * cos( dot( vec2( 0.6, -0.8 ), p ) * 9.7 - t * 4.6 );',
    '\treturn g;',
    '}'].join('\n');
  function waterify(mat, amp, scale, scroll, key) {
    var hill = T.Material.prototype.onBeforeCompile;
    mat.onBeforeCompile = function (sh) {
      hill.call(this, sh);
      sh.uniforms.uWT = waterU.uWT; sh.uniforms.uWD = waterU.uWD;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWPos;')
        .replace('#include <fog_vertex>', 'vWPos = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;\n#include <fog_vertex>');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uWT;\nuniform float uWD;\nvarying vec3 vWPos;\n' + WAVE_GLSL)
        .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n\t{\n\t\tvec2 wp = vec2( vWPos.x, vWPos.z' + (scroll ? ' - uWD' : '') + ' ) * ' + scale.toFixed(3) + ';\n\t\tvec2 gr = waveGrad( wp, uWT ) * ' + amp.toFixed(3) + ';\n\t\tnormal = normalize( ( viewMatrix * vec4( normalize( vec3( -gr.x, 1.0, -gr.y ) ), 0.0 ) ).xyz );\n\t}');
    };
    mat.customProgramCacheKey = function () { return 'water-' + key; };
    mat.needsUpdate = true;
    if (ENV_MATS.indexOf(mat) < 0) ENV_MATS.push(mat);
  }
  RM.stream.roughness = 0.05; RM.stream.metalness = 0.05; RM.stream.envMapIntensity = 1.0;
  waterify(RM.stream, 0.22, 1.1, false, 'stream');
  RM.water.roughness = 0.04; RM.water.envMapIntensity = 1.0;
  waterify(RM.water, 0.06, 1.6, false, 'puddle');

  /* the sea (graphics upgrade 4): a finer surface that really heaves. Long swells roll in toward the shore (vertex displacement, calmer
     close in), with a finer chop on top for the light; the crests turn a lighter green-blue and break into foam, lines of surf run in to
     a foam rim along the tetrapods, the sun (or the moon) lays a glittering path on the water, and spray bursts up against the rocks.
     It still sinks away under a bridge deck like the rest of the ground */
  var SEA_COLS = 72, seaGeo = new T.PlaneGeometry(360, 440, SEA_COLS, STRIP_ROWS), seaRowY = [];
  seaGeo.rotateX(-Math.PI / 2);
  dropStrips.splice(dropStrips.indexOf(seaStrip), 1);
  seaStrip.geometry.dispose(); seaStrip.geometry = seaGeo; seaStrip.position.x = -196; seaStrip.receiveShadow = true;
  seaTex.repeat.set(26.4, 30);
  seaC.setHex(0x125582);
  var seaU = { uSunW: { value: new T.Vector3(0, 1, 0) }, uSunCol: { value: new T.Color() }, uSunK: { value: 1 }, uFoamL: { value: 1 } };
  var SEA_GLSL = [
    'float sHash( vec2 p ) { return fract( sin( dot( p, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 ); }',
    'float sNoise( vec2 p ) { vec2 i = floor( p ), f = fract( p ); f = f * f * ( 3.0 - 2.0 * f ); return mix( mix( sHash( i ), sHash( i + vec2( 1.0, 0.0 ) ), f.x ), mix( sHash( i + vec2( 0.0, 1.0 ) ), sHash( i + vec2( 1.0, 1.0 ) ), f.x ), f.y ); }',
    /* one travelling swell: height, and its slope added to g. Deep-water speed: omega = sqrt( 9.8 k ) */
    'float sWave( vec2 p, float t, vec2 d, float lam, float a, float ph, inout vec2 g ) { float k = 6.2832 / lam, w = sqrt( 9.8 * k ), x = k * dot( d, p ) - w * t + ph; g += d * a * k * cos( x ); return a * sin( x ); }',
    'float seaSwell( vec2 p, float t, out vec2 g ) { g = vec2( 0.0 ); float h = 0.0;',
    '\th += sWave( p, t, vec2( 0.914, 0.406 ), 38.0, 0.42, 0.0, g );',
    '\th += sWave( p, t, vec2( 0.759, -0.651 ), 23.0, 0.27, 1.7, g );',
    '\treturn h; }',
    'float seaSwellF( vec2 p, float t, out vec2 g ) { float h = seaSwell( p, t, g ); h += sWave( p, t, vec2( 0.989, 0.148 ), 13.5, 0.12, 4.1, g ); h += sWave( p, t, vec2( 0.6, 0.8 ), 8.0, 0.05, 2.3, g ); return h; }'
  ].join('\n');
  (function () {
    var hill = T.Material.prototype.onBeforeCompile;
    seaMat.roughness = 0.12; seaMat.metalness = 0.02; seaMat.envMapIntensity = 0.5;   /* the camera skims the water: a full mirror would turn it white */
    if (ENV_MATS.indexOf(seaMat) < 0) ENV_MATS.push(seaMat);
    seaMat.onBeforeCompile = function (sh) {
      hill.call(this, sh);
      sh.uniforms.uWT = waterU.uWT; sh.uniforms.uWD = waterU.uWD;
      for (var k in seaU) sh.uniforms[k] = seaU[k];
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uWT;\nuniform float uWD;\nvarying vec3 vWPos;\nvarying float vSeaH;\n' + SEA_GLSL)
        .replace('#include <begin_vertex>', '#include <begin_vertex>\n\t{\n\t\tvec4 sWp = modelMatrix * vec4( transformed, 1.0 );\n\t\tvec2 sG;\n\t\tfloat sOff = clamp( ( -17.0 - sWp.x ) / 26.0, 0.0, 1.0 );\n\t\tfloat sEnv = 0.15 + 0.85 * sOff, sH = seaSwell( vec2( sWp.x, sWp.z - uWD ), uWT, sG ) * sEnv;\n\t\ttransformed.y += sH + 0.72 * sEnv + 0.06; vSeaH = sH;   /* troughs stay above the field strip under the sea */\n\t}')
        .replace('#include <fog_vertex>', 'vWPos = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;\n#include <fog_vertex>');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uWT;\nuniform float uWD;\nuniform vec3 uSunW;\nuniform vec3 uSunCol;\nuniform float uSunK;\nuniform float uFoamL;\nvarying vec3 vWPos;\nvarying float vSeaH;\n' + SEA_GLSL + '\n' + WAVE_GLSL)
        .replace('#include <normal_fragment_maps>', [
          '#include <normal_fragment_maps>',
          '\tvec2 sP = vec2( vWPos.x, vWPos.z - uWD ), sG;',
          '\tfloat sOffF = clamp( ( -17.0 - vWPos.x ) / 26.0, 0.0, 1.0 ), sShore = -17.0 - vWPos.x;',
          '\tfloat sHF = seaSwellF( sP, uWT, sG ) * ( 0.15 + 0.85 * sOffF );',
          '\tvec2 sGt = sG * ( 0.15 + 0.85 * sOffF ) + waveGrad( sP * 0.55, uWT * 1.3 ) * 0.07;',
          '\tnormal = normalize( ( viewMatrix * vec4( normalize( vec3( -sGt.x, 1.0, -sGt.y ) ), 0.0 ) ).xyz );',
          '\tfloat sN = sNoise( sP * 0.35 + vec2( uWT * 0.05, 0.0 ) ) * 0.65 + sNoise( sP * 1.3 ) * 0.35;',
          /* crests light up green-blue, the shallows by the shore are paler */
          '\tdiffuseColor.rgb = mix( diffuseColor.rgb, diffuseColor.rgb * 0.55 + vec3( 0.07, 0.42, 0.44 ) * uFoamL, smoothstep( -0.05, 0.45, sHF ) * 0.55 );',
          '\tdiffuseColor.rgb = mix( diffuseColor.rgb, vec3( 0.1, 0.5, 0.52 ) * uFoamL, ( 1.0 - smoothstep( 0.0, 10.0, sShore ) ) * 0.5 );',
          /* foam: on the highest crests, in lines of surf coming in, and as a ragged rim at the shore */
          '\tfloat sCrest = smoothstep( 0.42, 0.68, sHF + ( sN - 0.5 ) * 0.3 ) * 0.6;',
          '\tfloat sSurf = ( 1.0 - smoothstep( 2.0, 14.0, sShore ) ) * smoothstep( 0.82, 0.97, 0.5 + 0.5 * sin( sShore * 0.85 + uWT * 1.7 + sN * 3.0 ) ) * 0.7;',
          '\tfloat sRim = 1.0 - smoothstep( 0.2, 1.4, sShore + ( sN - 0.5 ) * 1.2 + 0.4 * sin( uWT * 1.3 + vWPos.z * 0.2 ) );',
          '\tfloat sFoam = clamp( max( sCrest, max( sSurf, sRim ) ) * smoothstep( 0.25, 0.6, sN + 0.3 ), 0.0, 1.0 );',
          '\tdiffuseColor.rgb = mix( diffuseColor.rgb, vec3( 0.93, 0.96, 0.97 ) * uFoamL, sFoam );',
          '\troughnessFactor = mix( roughnessFactor, 0.75, sFoam );'].join('\n'))
        .replace('#include <emissivemap_fragment>', [
          '#include <emissivemap_fragment>',
          /* the glitter path: the sun's (or moon's) reflection in each facet of the chop, twinkling */
          '\t{',
          '\t\tvec3 sV = normalize( vViewPosition ), sSun = normalize( ( viewMatrix * vec4( uSunW, 0.0 ) ).xyz ), sR = reflect( -sV, normal );',
          '\t\tfloat sDot = max( dot( sR, sSun ), 0.0 ), sTw = step( 0.6, sHash( floor( sP * 3.0 ) + floor( uWT * 7.0 ) ) );',
          '\t\ttotalEmissiveRadiance += uSunCol * ( pow( sDot, 1400.0 ) * 22.0 * sTw + pow( sDot, 90.0 ) * 0.5 ) * uSunK * ( 1.0 - sFoam );',
          '\t}'].join('\n'));
    };
    seaMat.customProgramCacheKey = function () { return 'sea-v2'; };
    seaMat.needsUpdate = true;
  })();
  var splashC = new T.Color(), splashT = 0;
  function seaStep(dt) {
    if (!seaStrip.visible) return;
    var pos = seaGeo.attributes.position, cols = SEA_COLS + 1, dirty = false, r, c, y;
    for (r = 0; r <= STRIP_ROWS; r++) {   /* sink under a bridge deck, row by row, like the other ground strips */
      y = -H_DECK * elevAt(dist + 390 - r * 5);
      if (seaRowY[r] !== y) { seaRowY[r] = y; for (c = 0; c < cols; c++) pos.setY(r * cols + c, y); dirty = true; }
    }
    if (dirty) { pos.needsUpdate = true; seaGeo.computeBoundingSphere(); }
    seaU.uSunW.value.copy(cur.sunDir); seaU.uSunCol.value.copy(cur.sunCol);
    seaU.uSunK.value = (1 - 0.88 * weather.cloud) * (cur.night > 0.6 ? 0.5 : 1) * (1 - tunK);
    seaU.uFoamL.value = 1 - 0.78 * cur.night;
    /* spray bursting up on the tetrapods */
    splashT -= dt;
    if (splashT <= 0 && fxK > 0.5 && elevAt(dist) < 0.01 && tunK < 0.1) {
      splashT = rnd(0.08, 0.3) / fxK;
      var z = rnd(-150, -12), n = 3 + (Math.random() * 4 | 0);
      splashC.setRGB(0.92, 0.95, 0.97).multiplyScalar(1 - 0.75 * cur.night);
      for (var i = 0; i < n; i++) spawnP('smoke', -17.4 + rnd(-0.8, 0.6), rnd(0.2, 0.8), z + rnd(-1.5, 1.5), rnd(-1.2, 1.2), rnd(3, 6.5), veff, rnd(0.7, 1.2), rnd(0.5, 0.9), rnd(2, 3.4), splashC, rnd(0.45, 0.7), 1);
    }
  }

  /* falling leaves (graphics upgrade 5): yellow ginkgo, red and orange maple and brown zelkova leaves come off the roadside trees,
     flutter down turning over and drift across the road on the wind; one instanced mesh, a colour per leaf */
  var LEAF_N = 150, LEAF_REG = { city: 1, country: 1, highway: 1, creek: 1, mountain: 1, offroad: 1 };
  var leafGeo3 = (function () {
    var p = [0, 0.012, 0, 0, 0, 0.1, -0.055, 0, 0.01, 0, 0.012, 0, 0.055, 0, 0.01, 0, 0, 0.1, 0, 0.012, 0, -0.045, 0, -0.03, 0, 0, -0.08, 0, 0.012, 0, 0, 0, -0.08, 0.045, 0, -0.03,
      0, 0.012, 0, -0.055, 0, 0.01, -0.045, 0, -0.03, 0, 0.012, 0, 0.045, 0, -0.03, 0.055, 0, 0.01];
    var g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(p, 3)); g.computeVertexNormals(); return g;
  })();
  var leafMesh = new T.InstancedMesh(leafGeo3, new T.MeshStandardMaterial({ roughness: 0.8, side: T.DoubleSide }), LEAF_N);
  leafMesh.frustumCulled = false; leafMesh.visible = false; scene.add(leafMesh);
  var LEAF_COLS = { city: [0xf2c12e, 0xe8b31c, 0xf5d24a, 0xd9a417, 0xe0552a, 0xb7792e], other: [0xc8331d, 0xe0552a, 0xe8862a, 0xf2c12e, 0xb7792e, 0x8a5a2a] };
  var leafs = [], lm4 = new T.Matrix4(), lq = new T.Quaternion(), le = new T.Euler(), lsv = new T.Vector3(), lpv = new T.Vector3(), lcol = new T.Color(), leafRegion = '';
  for (var lfi = 0; lfi < LEAF_N; lfi++) leafs.push({ x: 0, y: -1, z: 0, vx: 0, vy: 0, ph: 0, rx: 0, ry: 0, rz: 0, sx: 0, sy: 0, sz: 0, s: 1 });
  function leafSpawn(f, anywhere) {
    var side = Math.random() < 0.5 ? -1 : 1;
    f.x = side * rnd(9, 22); f.y = anywhere ? rnd(0.5, 8) : rnd(4, 8.5); f.z = anywhere ? rnd(-120, 10) : rnd(-130, -60);
    f.vx = -side * rnd(0, 1.4); f.vy = -rnd(0.6, 1.3); f.ph = rnd(0, 6.28);
    f.rx = rnd(0, 6.28); f.ry = rnd(0, 6.28); f.rz = rnd(0, 6.28); f.sx = rnd(-4, 4); f.sy = rnd(-2, 2); f.sz = rnd(-4, 4); f.s = rnd(1.3, 2.0);
  }
  function leafRecolor() {
    var cols = LEAF_COLS[region.key === 'city' ? 'city' : 'other'];
    for (var i = 0; i < LEAF_N; i++) leafMesh.setColorAt(i, lcol.setHex(pick(cols)).multiplyScalar(rnd(0.85, 1.1)));
    leafMesh.instanceColor.needsUpdate = true;
  }
  function leafStep(dt) {
    var on = !!LEAF_REG[region.key] && tunK < 0.3 && fxK > 0.4 && snowCover < 0.3, i, f, n;
    leafMesh.visible = on;
    if (!on) return;
    if (leafRegion !== region.key) { leafRegion = region.key; leafRecolor(); for (i = 0; i < LEAF_N; i++) leafSpawn(leafs[i], true); }
    n = Math.round(LEAF_N * Math.min(1, fxK));
    var wind = (gust ? gust.v * (gust.dir || 1) : 0) * 0.15, fall = 1 + 1.6 * rainK;
    for (i = 0; i < n; i++) {
      f = leafs[i];
      f.ph += dt * 2.6;
      f.x += (f.vx + Math.sin(f.ph) * 1.1 + wind) * dt; f.y += f.vy * fall * dt * (0.7 + 0.3 * Math.sin(f.ph * 1.7)); f.z += (veff + Math.cos(f.ph * 0.8) * 0.6) * dt;
      f.rx += f.sx * dt; f.ry += f.sy * dt; f.rz += f.sz * dt;
      if (f.y < 0.04) { f.y = 0.04; f.vx = 0; f.sx = f.sy = f.sz = 0; f.vy = 0; }   /* landed: it lies on the road and travels with it */
      if (f.z > 14) leafSpawn(f, false);
      le.set(f.y <= 0.04 ? 0 : f.rx, f.ry, f.y <= 0.04 ? 0 : f.rz); lq.setFromEuler(le); lsv.setScalar(f.s); lpv.set(f.x, f.y, f.z);
      leafMesh.setMatrixAt(i, lm4.compose(lpv, lq, lsv));
    }
    leafMesh.count = n; leafMesh.instanceMatrix.needsUpdate = true;
  }
