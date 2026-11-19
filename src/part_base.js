  /* ---------- learning edition: one switch for the original combat (weapons, skills, supply crates, damage). On: the quiz runs on roads with the original's enemies ---------- */
  var EDU = { arms: true };
  if (!EDU.arms) document.body.classList.add('edu');

  /* ---------- textures ---------- */
  function radialTex(stops) {
    var c = document.createElement('canvas'); c.width = c.height = 128;
    var g = c.getContext('2d');
    var r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    stops.forEach(function (s) { r.addColorStop(s[0], 'rgba(255,255,255,' + s[1] + ')'); });
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    return new T.CanvasTexture(c);
  }
  var texGlow = radialTex([[0, 1], [0.2, 0.6], [0.55, 0.14], [1, 0]]);
  /* the dark under a car where the road gets no light: keeps cars sitting on the road at night and in a tunnel, where shadows are faint */
  var aoMat = new T.MeshBasicMaterial({ map: radialTex([[0, 0.85], [0.45, 0.6], [0.8, 0.18], [1, 0]]), color: 0x000000, transparent: true, opacity: 0.62, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
  var aoGeo = new T.PlaneGeometry(1, 1); aoGeo.rotateX(-Math.PI / 2);
  function groundShadow(g) {
    /* the footprint of the solid parts only (glow sprites stick out), measured in the car's own space */
    var b = new T.Box3(), bb = new T.Box3(), inv = new T.Matrix4(), mm = new T.Matrix4(), sz = new T.Vector3(), m;
    g.updateMatrixWorld(true); inv.copy(g.matrixWorld).invert();
    g.traverse(function (o) { if (!o.isMesh || !o.geometry) return; if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); bb.copy(o.geometry.boundingBox).applyMatrix4(mm.multiplyMatrices(inv, o.matrixWorld)); b.union(bb); });
    if (b.isEmpty()) return null;
    b.getSize(sz); m = new T.Mesh(aoGeo, aoMat);
    m.scale.set(sz.x * 1.3, 1, sz.z * 1.16); m.position.set((b.min.x + b.max.x) / 2, 0.03, (b.min.z + b.max.z) / 2); m.renderOrder = -1;
    g.add(m); return m;
  }
  /* a smoke puff: a cluster of soft lumps rather than a plain disc, lighter at the top where it catches the light (graphics upgrade 3) */
  var texSmoke = (function () {
    var c = document.createElement('canvas'); c.width = c.height = 128;
    var g = c.getContext('2d'), i;
    for (i = 0; i < 16; i++) {
      var a = Math.random() * 6.283, d = Math.random() * 30, x = 64 + Math.cos(a) * d, y = 66 + Math.sin(a) * d * 0.85, r = 18 + Math.random() * 18, l = Math.round(rnd(215, 245));   /* evenly lit: the puff turns */
      var rg = g.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, 'rgba(' + l + ',' + l + ',' + l + ',0.5)'); rg.addColorStop(0.55, 'rgba(' + l + ',' + l + ',' + l + ',0.28)'); rg.addColorStop(1, 'rgba(' + l + ',' + l + ',' + l + ',0)');
      g.fillStyle = rg; g.fillRect(0, 0, 128, 128);
    }
    g.globalCompositeOperation = 'destination-in';   /* keep it round overall, so no square edge ever shows */
    var m = g.createRadialGradient(64, 64, 20, 64, 64, 64); m.addColorStop(0, 'rgba(0,0,0,1)'); m.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = m; g.fillRect(0, 0, 128, 128);
    return new T.CanvasTexture(c);
  })();
  function noiseTex(strength) {
    var c = document.createElement('canvas'); c.width = c.height = 256;
    var g = c.getContext('2d');
    g.fillStyle = '#c9c9c9'; g.fillRect(0, 0, 256, 256);
    for (var i = 0; i < 3200; i++) {
      var v = Math.random() < 0.5 ? 255 : 60;
      g.fillStyle = 'rgba(' + v + ',' + v + ',' + v + ',' + rnd(0.05, 0.2) * strength + ')';
      g.fillRect(Math.random() * 256, Math.random() * 256, rnd(1, 3), rnd(1, 5));
    }
    var t = new T.CanvasTexture(c);
    t.wrapS = t.wrapT = T.RepeatWrapping; t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4;
    return t;
  }
  /* fields (graphics upgrade 3): short blades in light and dark strokes, a few clover patches and bare specks; grey, so each region's ground colour tints it */
  function grassTex() {
    var c = document.createElement('canvas'); c.width = c.height = 256;
    var g = c.getContext('2d'), i, v, x, y, a, l;
    g.fillStyle = '#c4c4c4'; g.fillRect(0, 0, 256, 256);
    for (i = 0; i < 40; i++) { x = Math.random() * 256; y = Math.random() * 256; v = Math.random() < 0.5 ? 255 : 70; var rg = g.createRadialGradient(x, y, 0, x, y, rnd(14, 40)); rg.addColorStop(0, 'rgba(' + v + ',' + v + ',' + v + ',0.12)'); rg.addColorStop(1, 'rgba(' + v + ',' + v + ',' + v + ',0)'); g.fillStyle = rg; g.fillRect(0, 0, 256, 256); }
    g.lineCap = 'round';
    for (i = 0; i < 7000; i++) {
      x = Math.random() * 256; y = Math.random() * 256; a = rnd(-0.5, 0.5) - Math.PI / 2; l = rnd(2, 6);
      v = Math.random() < 0.6 ? Math.round(rnd(205, 255)) : Math.round(rnd(70, 125));
      g.strokeStyle = 'rgba(' + v + ',' + v + ',' + v + ',' + rnd(0.18, 0.42) + ')'; g.lineWidth = rnd(0.7, 1.4);
      for (var dx = -256; dx <= 256; dx += 256) for (var dy = -256; dy <= 256; dy += 256) {
        if (x + dx < -8 || x + dx > 264 || y + dy < -8 || y + dy > 264) continue;   /* wrap the strokes that cross an edge */
        g.beginPath(); g.moveTo(x + dx, y + dy); g.lineTo(x + dx + Math.cos(a) * l, y + dy + Math.sin(a) * l); g.stroke();
      }
    }
    for (i = 0; i < 260; i++) { v = Math.round(rnd(90, 150)); g.fillStyle = 'rgba(' + v + ',' + (v - 8) + ',' + (v - 20) + ',0.35)'; g.fillRect(Math.random() * 256, Math.random() * 256, rnd(1, 2.5), rnd(1, 2.5)); }
    var t = new T.CanvasTexture(c);
    t.wrapS = t.wrapT = T.RepeatWrapping; t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4;
    return t;
  }
  /* building walls (graphics upgrade 3): four bays by four storeys per tile. Storey bands, framed windows with a mullion, a sill and
     a sky reflection in the glass; the emissive version lights some windows, a few half hidden by curtains */
  function facadeTex(emissive) {
    var c = document.createElement('canvas'); c.width = c.height = 256;
    var g = c.getContext('2d'), x, y, i;
    g.fillStyle = emissive ? '#000' : '#ece6dc'; g.fillRect(0, 0, 256, 256);
    if (!emissive) {
      for (i = 0; i < 900; i++) { var v = Math.random() < 0.5 ? 255 : 120; g.fillStyle = 'rgba(' + v + ',' + v + ',' + v + ',' + rnd(0.04, 0.1) + ')'; g.fillRect(Math.random() * 256, Math.random() * 256, rnd(1, 3), rnd(1, 3)); }
      for (y = 0; y < 4; y++) { g.fillStyle = 'rgba(0,0,0,0.07)'; g.fillRect(0, y * 64 + 58, 256, 6); g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(0, y * 64 + 57, 256, 1.5); }
    }
    for (y = 0; y < 4; y++) for (x = 0; x < 4; x++) {
      var wx = x * 64 + 13, wy = y * 64 + 10, ww = 38, wh = 40;
      if (emissive) {
        if (Math.random() > 0.55) continue;
        g.fillStyle = pick(['#ffd98a', '#ffe9b8', '#ffc76a', '#a8d4ff', '#ffd0a0']); g.fillRect(wx, wy, ww, wh);
        if (Math.random() < 0.45) { g.fillStyle = 'rgba(0,0,0,0.62)'; g.fillRect(wx + (Math.random() < 0.5 ? 0 : ww * 0.55), wy, ww * 0.45, wh); }   /* a curtain */
        g.fillStyle = 'rgba(0,0,0,0.85)'; g.fillRect(wx + ww / 2 - 1, wy, 2, wh); g.fillRect(wx, wy + wh * 0.38, ww, 2);
        continue;
      }
      g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(wx - 3, wy - 3, ww + 6, wh + 6);                 /* the reveal around the frame */
      g.fillStyle = '#d9dde2'; g.fillRect(wx - 2, wy - 2, ww + 4, wh + 4);                          /* frame */
      var gl = g.createLinearGradient(wx, wy, wx + ww * 0.6, wy + wh);                              /* glass: sky above, darker below */
      gl.addColorStop(0, '#9fb6cc'); gl.addColorStop(0.45, '#5f7690'); gl.addColorStop(1, '#3c4d62');
      g.fillStyle = gl; g.fillRect(wx, wy, ww, wh);
      g.fillStyle = 'rgba(255,255,255,0.22)'; g.beginPath(); g.moveTo(wx, wy + wh * 0.55); g.lineTo(wx + ww * 0.5, wy); g.lineTo(wx + ww * 0.75, wy); g.lineTo(wx, wy + wh * 0.95); g.fill();   /* a streak of reflection */
      g.fillStyle = '#d9dde2'; g.fillRect(wx + ww / 2 - 1, wy, 2, wh); g.fillRect(wx, wy + wh * 0.38, ww, 2);   /* mullion and transom */
      g.fillStyle = '#f4f2ee'; g.fillRect(wx - 4, wy + wh + 2, ww + 8, 3); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(wx - 4, wy + wh + 5, ww + 8, 3);   /* sill and its shadow */
    }
    var t = new T.CanvasTexture(c);
    t.wrapS = t.wrapT = T.RepeatWrapping; t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4;
    return t;
  }

  /* ---------- lights and time-of-day presets ---------- */
  var hemi = legacy(new T.HemisphereLight(0xffffff, 0x888888, 1));
  scene.add(hemi);
  var sun = legacy(new T.DirectionalLight(0xffffff, 1));
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  var sc = sun.shadow.camera;
  sc.left = -45; sc.right = 45; sc.top = 70; sc.bottom = -45; sc.near = 1; sc.far = 260;
  sc.updateProjectionMatrix();
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.04;
  sun.target.position.set(0, 0, -22);
  scene.add(sun); scene.add(sun.target);

  function preset(o) {
    return {
      sky: new T.Color(o.sky), hemiSky: C(o.hemiSky), hemiGround: C(o.hemiGround), hemiI: o.hemiI,
      sun: C(o.sun), sunI: o.sunI, sunPos: new T.Vector3(o.sunPos[0], o.sunPos[1], o.sunPos[2]),
      ground: C(o.ground), road: C(o.road), walk: C(o.walk), exposure: o.exposure, night: o.night,
      fogNear: o.fogNear, fogFar: o.fogFar,
      top: new T.Color(o.top), sunDir: new T.Vector3(o.sunDir[0], o.sunDir[1], o.sunDir[2]).normalize(), sunCol: new T.Color(o.sunCol)   /* what the sky dome shows: zenith colour, where the sun or moon hangs, and its colour */
    };
  }
  var PRESETS = {
    day: preset({ sky: 0x9fd3f2, hemiSky: 0xe4f3ff, hemiGround: 0x8a9a78, hemiI: 0.9, sun: 0xfff1d6, sunI: 1.45,
      sunPos: [-45, 80, 18], ground: 0x86c07a, road: 0x6b7280, walk: 0xd8d4c8, exposure: 1.0, night: 0, fogNear: 80, fogFar: 230, top: 0x4a96e0, sunDir: [-0.35, 0.8, -0.45], sunCol: 0xfff6d8 }),
    sunset: preset({ sky: 0xf4a878, hemiSky: 0xffc59a, hemiGround: 0x6a5a86, hemiI: 0.8, sun: 0xffa25e, sunI: 1.9,
      sunPos: [-80, 44, -30], ground: 0x8fa862, road: 0x807c8c, walk: 0xcdb9a4, exposure: 1.05, night: 0.35, fogNear: 60, fogFar: 210, top: 0x6a5a9c, sunDir: [-0.45, 0.17, -0.87], sunCol: 0xffa052 }),
    night: preset({ sky: 0x0d1330, hemiSky: 0x4a5fb0, hemiGround: 0x141826, hemiI: 0.5, sun: 0x9db4ff, sunI: 0.42,
      sunPos: [40, 80, 24], ground: 0x1d3a36, road: 0x3a3e4c, walk: 0x565a6a, exposure: 1.1, night: 1, fogNear: 50, fogFar: 190, top: 0x04061a, sunDir: [0.35, 0.42, -0.84], sunCol: 0xaebcf0 })
  };
  var cur = preset({ sky: 0, hemiSky: 0, hemiGround: 0, hemiI: 0, sun: 0, sunI: 0, sunPos: [0, 1, 0], ground: 0, road: 0, walk: 0, exposure: 1, night: 0, fogNear: 60, fogFar: 200, top: 0, sunDir: [0, 1, 0], sunCol: 0 });
  var target = PRESETS.day;
  function mixEnv(a) {
    for (var k in cur) {
      var v = cur[k], t = target[k];
      if (v && v.isColor) v.lerp(t, a);
      else if (v && v.isVector3) v.lerp(t, a);
      else cur[k] = lerp(v, t, a);
    }
  }
  mixEnv(1);

  /* ---------- materials ---------- */
  function std(hex, rough, metal) {
    return new T.MeshStandardMaterial({ color: C(hex), roughness: rough === undefined ? 0.6 : rough, metalness: metal || 0, flatShading: true });
  }
  var M = {
    blue: std(0x1f6fe0, 0.4, 0.1), blueDark: std(0x154a9c, 0.5, 0.1), glass: std(0x1b2a3a, 0.12, 0.3),
    yellow: std(0xffc21a, 0.4, 0.1), steel: std(0xc3c8cf, 0.28, 0.7), teal: std(0x12a8a0, 0.35, 0.15),
    tire: std(0x17181c, 0.9), hub: std(0xb9bec6, 0.4, 0.5), dark: std(0x2a2d34, 0.7, 0.2), gun: std(0x4a4f58, 0.5, 0.5),
    metal: std(0xc6cad1, 0.3, 0.7), redTip: std(0xe53935, 0.5), rail: std(0xaab0b8, 0.4, 0.6), pole: std(0x5c626c, 0.6, 0.3),
    trunk: std(0x6b4a32, 0.9), gravel: std(0x9a9a94, 0.95), white: std(0xf2f2ee, 0.8), gold: std(0xf2b01e, 0.35, 0.6),
    plane: std(0x3c4250, 0.5, 0.4), bossRed: std(0xb3261e, 0.45, 0.2),
    head: new T.MeshBasicMaterial({ color: 0xfff4c8 }), tail: new T.MeshBasicMaterial({ color: 0xff2a1a }),
    lamp: new T.MeshBasicMaterial({ color: 0xfff0c0 }), eye: new T.MeshBasicMaterial({ color: 0xff3b1f }),
    coil: new T.MeshBasicMaterial({ color: 0x7fe9ff }),
    rotor: new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, depthWrite: false })
  };
  M.gold.emissive = C(0x6a4200);

  /* ---------- geometry helpers (f = forward distance; forward is -Z) ---------- */
  function shadowed(m) { m.castShadow = true; m.receiveShadow = true; return m; }
  /* draw-call saver: every static mesh under `root` is merged into one mesh per material and shadow setting. Left alone: objects listed in `keep`, objects that root.userData points at, sprites and lines, hidden parts. A kept group can be baked on its own, so a wheel still turns as one piece */
  var bakeM = new T.Matrix4(), bakeN = new T.Matrix3(), bakeV = new T.Vector3(), bakeStat = { before: 0, after: 0 };
  /* 1.5: plain matte parts that differ only in colour (a car's trim, tyres and lamps' housings, a building's ledges) are merged into one
     mesh too, their colours kept per vertex, with one shared material for each roughness and metalness. That roughly halves the draw
     calls of cars and repeated roadside pieces. Left out: anything that changes at run time (a hit flash, snow on the ground, water,
     lights at night: NOMERGE), anything with a texture, a glow, see-through or reflections of the sky */
  var NOMERGE = new WeakSet(), VC_MATS = {};
  function vcKey(c) {
    var m = c.material;
    if (m.userData.vcKey) return m.userData.vcKey;
    if (!m.isMeshStandardMaterial || NOMERGE.has(m) || c.geometry.attributes.color) return null;
    if (m.map || m.emissiveMap || m.normalMap || m.roughnessMap || m.metalnessMap || m.alphaMap || m.aoMap || m.lightMap || m.bumpMap) return null;
    if (m.transparent || m.opacity !== 1 || m.vertexColors || m.side !== T.FrontSide || m.wireframe || m.polygonOffset || !m.depthWrite || !m.depthTest || m.shadowSide !== null) return null;
    if (m.emissive.r + m.emissive.g + m.emissive.b !== 0 || Object.prototype.hasOwnProperty.call(m, 'onBeforeCompile')) return null;
    /* a car finish's roughness and metalness to a tenth: finishes that close look alike, and far fewer of them remain */
    var env = ENV_MATS.indexOf(m) >= 0, d = m.isMeshPhysicalMaterial ? 1 : 2, k = (m.roughness).toFixed(d) + '/' + (m.metalness).toFixed(d) + '/' + (m.flatShading ? 1 : 0) + '/' + (m.fog ? 1 : 0) + '/' + (env ? m.envMapIntensity.toFixed(2) : '-');
    if (!m.isMeshPhysicalMaterial) return (env ? 'E' : 'S') + '/' + k;
    /* car finishes (clearcoat, chrome): merged with others of the very same finish only */
    if (!env || m.transmission || m.sheen || m.iridescence || m.anisotropy || m.dispersion || m.specularIntensity !== 1 || m.ior !== 1.5 || m.specularColor.getHex() !== 0xffffff || m.clearcoatMap || m.clearcoatNormalMap) return null;
    return 'P/' + k + '/' + m.clearcoat.toFixed(2) + '/' + m.clearcoatRoughness.toFixed(2);
  }
  function vcMat(key) {
    if (VC_MATS[key]) return VC_MATS[key];
    var p = key.split('/'), o = { vertexColors: true, roughness: +p[1], metalness: +p[2], flatShading: p[3] === '1', fog: p[4] === '1' }, m;
    if (p[0] === 'P') { o.clearcoat = +p[6]; o.clearcoatRoughness = +p[7]; m = new T.MeshPhysicalMaterial(o); } else m = new T.MeshStandardMaterial(o);
    if (p[5] !== '-') {   /* reflects the sky like the parts it replaces */
      m.envMapIntensity = +p[5]; ENV_MATS.push(m);
      if (typeof envRT !== 'undefined' && envRT) m.envMap = envRT.texture;
    }
    m.userData.vcKey = key;
    return (VC_MATS[key] = m);
  }
  /* the two wheels of an axle turn together about the same line: they become one piece (one draw per material instead of two) */
  function pairWheels(root, list) {
    var by = {}, out = [], k;
    root.updateMatrixWorld(true);
    list.forEach(function (w) {
      if (w.parent !== root || !w.userData.r) { out.push(w); return; }
      k = w.userData.r.toFixed(3) + '/' + w.position.y.toFixed(3) + '/' + w.position.z.toFixed(3) + '/' + w.rotation.x.toFixed(3) + '/' + w.rotation.y.toFixed(3) + '/' + w.rotation.z.toFixed(3);
      (by[k] || (by[k] = [])).push(w);
    });
    for (k in by) {
      var ws = by[k];
      if (ws.length < 2 || ws[0].rotation.x || ws[0].rotation.y || ws[0].rotation.z) { ws.forEach(function (w) { out.push(w); }); continue; }
      var pv = new T.Group(); pv.position.set(0, ws[0].position.y, ws[0].position.z); pv.userData.r = ws[0].userData.r; root.add(pv); pv.updateMatrixWorld(true);
      ws.forEach(function (w) { pv.attach(w); });
      out.push(pv);
    }
    list.length = 0; out.forEach(function (o) { list.push(o); });
    return list;
  }
  function bake(root, keep, deep) {
    var ks = (keep || []).slice(), k, v, buckets = {}, order = [], inv;
    for (k in root.userData) { v = root.userData[k]; if (v && v.isObject3D) ks.push(v); else if (Array.isArray(v)) v.forEach(function (q) { if (q && q.isObject3D) ks.push(q); }); }
    root.updateMatrixWorld(true); inv = new T.Matrix4().copy(root.matrixWorld).invert();
    (function walk(o) {
      for (var i = 0; i < o.children.length; i++) {
        var c = o.children[i];
        if (ks.indexOf(c) >= 0 || !c.visible || (c.userData.baked && !deep)) continue;   /* deep: pieces baked before are merged again (a wreck: a whole car that no longer moves) */
        if (c.isMesh && !c.isInstancedMesh && !Array.isArray(c.material) && c.geometry && c.geometry.isBufferGeometry && c.geometry.attributes.position && c.geometry.attributes.normal) {
          var vk = vcKey(c), flags = (c.castShadow ? 'c' : '-') + (c.receiveShadow ? 'r' : '-') + c.renderOrder + (c.frustumCulled ? '' : 'n');
          var key = vk ? 'vc' + vk + flags.slice(2) : c.material.uuid + flags;   /* colour merges also join parts that differ only in their shadows: the piece casts and takes them if any part did */
          if (!buckets[key]) { buckets[key] = { parts: [], vc: vk }; order.push(key); }
          buckets[key].parts.push(c);
        }
        walk(c);
      }
    })(root);
    order.forEach(function (key) {
      var parts = buckets[key].parts, vc = buckets[key].vc, total = 0, geos, pos, nor, uv, col = null, off = 0, hasUv = true, first = parts[0];
      if (parts.length < 2) return;
      if (!vc && parts.some(function (c) { return !!c.geometry.attributes.color; })) return;   /* colours this merge would not carry */
      geos = parts.map(function (c) { var g = c.geometry.index ? c.geometry.toNonIndexed() : c.geometry; total += g.attributes.position.count; if (!g.attributes.uv) hasUv = false; return g; });
      pos = new Float32Array(total * 3); nor = new Float32Array(total * 3); uv = hasUv && !vc ? new Float32Array(total * 2) : null; if (vc) col = new Float32Array(total * 3);
      parts.forEach(function (c, pi) {
        var g = geos[pi], gp = g.attributes.position, gn = g.attributes.normal, gu = g.attributes.uv, n = gp.count, i, j, flip;
        bakeM.multiplyMatrices(inv, c.matrixWorld); bakeN.getNormalMatrix(bakeM); flip = bakeM.determinant() < 0;
        for (i = 0; i < n; i++) {
          j = flip && i % 3 ? (i % 3 === 1 ? i + 1 : i - 1) : i;   /* a mirrored part has its triangles turned back the right way */
          bakeV.fromBufferAttribute(gp, j).applyMatrix4(bakeM); pos[(off + i) * 3] = bakeV.x; pos[(off + i) * 3 + 1] = bakeV.y; pos[(off + i) * 3 + 2] = bakeV.z;
          bakeV.fromBufferAttribute(gn, j).applyMatrix3(bakeN).normalize(); nor[(off + i) * 3] = bakeV.x; nor[(off + i) * 3 + 1] = bakeV.y; nor[(off + i) * 3 + 2] = bakeV.z;
          if (uv) { uv[(off + i) * 2] = gu.getX(j); uv[(off + i) * 2 + 1] = gu.getY(j); }
          if (col) { var gc = g.attributes.color, mc = c.material.color; col[(off + i) * 3] = gc ? gc.getX(j) : mc.r; col[(off + i) * 3 + 1] = gc ? gc.getY(j) : mc.g; col[(off + i) * 3 + 2] = gc ? gc.getZ(j) : mc.b; }
        }
        off += n;
        if (g !== c.geometry) g.dispose();
      });
      var geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('normal', new T.BufferAttribute(nor, 3)); if (uv) geo.setAttribute('uv', new T.BufferAttribute(uv, 2)); if (col) geo.setAttribute('color', new T.BufferAttribute(col, 3));
      geo.computeBoundingSphere();
      var m = new T.Mesh(geo, vc ? vcMat(vc) : first.material); m.castShadow = parts.some(function (c) { return c.castShadow; }); m.receiveShadow = parts.some(function (c) { return c.receiveShadow; }); m.renderOrder = first.renderOrder; m.frustumCulled = first.frustumCulled; m.userData.baked = true; m.matrixAutoUpdate = false;
      parts.forEach(function (c) { while (c.children.length) c.parent.attach(c.children[0]); c.parent.remove(c); });
      root.add(m); bakeStat.before += parts.length; bakeStat.after++;
    });
    return root;
  }
  /* a looping group whose rows sink on their own (split-level road): each row becomes one group, baked by itself */
  function rowBake(lg) {
    var rows = {}, keys = [], i, c, k;
    for (i = lg.children.length - 1; i >= 0; i--) { c = lg.children[i]; k = Math.round(c.position.z * 10); if (!rows[k]) { rows[k] = []; keys.push(k); } rows[k].push(c); }
    keys.forEach(function (key) {
      var list = rows[key], z = list[0].position.z, g = new T.Group(); g.position.z = z; g.userData.baseY = 0;
      list.forEach(function (ch) { lg.remove(ch); ch.position.z -= z; g.add(ch); });
      lg.add(g); bake(g);
    });
  }
  function bx(w, h, l, mat, x, y, f) {
    var m = shadowed(new T.Mesh(new T.BoxGeometry(w, h, l), mat));
    m.position.set(x, y, -f); return m;
  }
  /* thick: how far across the width the edge rounds off (default: as far as the outline grows). A large value with a small bevel gives the
     soft, rolled shoulders of a modern car body without making the car any longer or taller */
  function prof(pts, width, mat, bevel, thick) {
    var s = new T.Shape();
    pts.forEach(function (p, i) { if (i) s.lineTo(p[0], p[1]); else s.moveTo(p[0], p[1]); });
    var b = bevel || 0, smooth = b > 0 && mat && mat.flatShading === false, t = smooth && thick ? Math.min(thick, width * 0.3) : b;
    var g = new T.ExtrudeGeometry(s, { depth: width - 2 * t, bevelEnabled: b > 0, bevelThickness: t, bevelSize: b, bevelSegments: smooth ? (thick ? 6 : 3) : 1, steps: 1 });
    g.translate(0, 0, -(width - 2 * t) / 2);
    g.rotateY(Math.PI / 2);
    /* smooth-shaded materials (car paint): round the bevels but keep the hard corners of the silhouette */
    if (smooth) { var cg = toCreasedNormals(g, 0.7); g.dispose(); g = cg; }
    return shadowed(new T.Mesh(g, mat));
  }
  /* a car body lofted from its side outline (learning edition 1.3): 40 stations along the car, each a rounded section, the corners of the
     plan rounded off at nose and tail. The outline's top edge (bonnet, screen base, boot) and bottom edge (sills, bumper undercuts) come
     from the same points the old flat extrusion used, so every lamp, grille and badge still sits where it did; only the surface between is
     now curved like a real panel. Returns null when the outline does not run front to back in one piece (then the extrusion is used) */
  function loftBody(pts, W, mat) {
    var n = pts.length, iMin = 0, iMax = 0, i, k;
    for (i = 1; i < n; i++) { if (pts[i][0] < pts[iMin][0]) iMin = i; if (pts[i][0] > pts[iMax][0]) iMax = i; }
    function chain(a, b) { var c = [], j = a; for (;;) { c.push(pts[j]); if (j === b) break; j = (j + 1) % n; } return c; }
    var lo = chain(iMin, iMax), up = chain(iMax, iMin).reverse();
    function mono(c) { for (var j = 1; j < c.length; j++) if (c[j][0] < c[j - 1][0] - 1e-6) return false; return true; }
    if (!mono(lo) || !mono(up)) return null;
    function at(c, f) {
      for (var j = 1; j < c.length; j++) if (f <= c[j][0] + 1e-9) { var a = c[j - 1], b = c[j], d = b[0] - a[0]; return d < 1e-6 ? Math.max(a[1], b[1]) : a[1] + (b[1] - a[1]) * (f - a[0]) / d; }
      return c[c.length - 1][1];
    }
    var f0 = pts[iMin][0], f1 = pts[iMax][0], N = 40, half = W / 2, pos = [], idx = [], ring = [];
    /* one quarter of the section as unit corner arcs: bottom (small radius) and top (large radius, the rolled shoulder) */
    var CB = 3, CT = 5;
    for (i = 0; i <= N; i++) {
      var u = i / N, f = f0 + (f1 - f0) * (0.5 - 0.5 * Math.cos(Math.PI * u));   /* stations closer together at the ends */
      var yb = at(lo, f), yt = Math.max(yb, at(up, f)), h = yt - yb;
      var e = Math.min(f - f0, f1 - f), kk = clamp(e / 0.3, 0, 1), hw = half * (0.97 + 0.03 * (1 - (1 - kk) * (1 - kk)));   /* plan corners, slight: lamps and grilles stay on the face */
      var rt = Math.min(0.2, h * 0.5, hw * 0.45, 0.03 + 0.5 * e), rb = Math.min(0.06, h * 0.25), sec = [];
      sec.push([0, yb]);
      for (k = 0; k <= CB; k++) { var a1 = -Math.PI / 2 + k / CB * Math.PI / 2; sec.push([hw - rb + Math.cos(a1) * rb, yb + rb + Math.sin(a1) * rb]); }
      for (k = 0; k <= CT; k++) { var a2 = k / CT * Math.PI / 2; sec.push([hw - rt + Math.cos(a2) * rt - 0.025 * Math.sin(a2), yt - rt + Math.sin(a2) * rt]); }
      sec.push([0, yt]);
      var full = sec.slice(); for (k = sec.length - 2; k >= 1; k--) full.push([-sec[k][0], sec[k][1]]);   /* mirror to the left side */
      ring.push(full.length);
      for (k = 0; k < full.length; k++) pos.push(full[k][0], full[k][1], -f);
    }
    var M2 = ring[0];
    for (i = 0; i < N; i++) for (k = 0; k < M2; k++) {
      var a = i * M2 + k, b = i * M2 + (k + 1) % M2, c = (i + 1) * M2 + k, d = (i + 1) * M2 + (k + 1) % M2;
      idx.push(a, c, b, b, c, d);
    }
    /* close both ends with a fan (they are usually pinched flat already) */
    [0, N].forEach(function (s, si) {
      var base = s * M2, cx = 0, cy = 0;
      for (k = 0; k < M2; k++) { cx += pos[(base + k) * 3]; cy += pos[(base + k) * 3 + 1]; }
      var ci = pos.length / 3; pos.push(cx / M2, cy / M2, pos[base * 3 + 2]);
      for (k = 0; k < M2; k++) { var p0 = base + k, p1 = base + (k + 1) % M2; if (si) idx.push(ci, p1, p0); else idx.push(ci, p0, p1); }   /* facing outward */
    });
    var g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
    g.computeVertexNormals();
    return shadowed(new T.Mesh(g, mat));
  }
  function cyl(r1, r2, len, seg, mat, x, y, f, axis) {
    var g = new T.CylinderGeometry(r1, r2, len, seg);
    if (axis === 'z') g.rotateX(Math.PI / 2);
    if (axis === 'x') g.rotateZ(Math.PI / 2);
    var m = shadowed(new T.Mesh(g, mat));
    m.position.set(x, y, -f); return m;
  }
  function wheel(r, w, x, f, list) {
    var m = cyl(r, r, w, 14, M.tire, x, r, f, 'x');
    var hg = new T.CylinderGeometry(r * 0.56, r * 0.56, w + 0.05, 6); hg.rotateZ(Math.PI / 2);
    m.add(new T.Mesh(hg, M.hub));
    m.userData.r = r; list.push(m); return m;
  }
  function glowSprite(hex, scale, opacity) {
    var s = new T.Sprite(new T.SpriteMaterial({ map: texGlow, color: C(hex), blending: T.AdditiveBlending, depthWrite: false, transparent: true, opacity: opacity === undefined ? 1 : opacity, fog: false }));
    s.scale.set(scale, scale, 1); return s;
  }

