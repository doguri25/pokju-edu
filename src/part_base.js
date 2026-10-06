  /* ---------- learning edition: one switch for what is left of the original combat. Weapons, skills and supply crates stay in the code but are off until the quiz modes bring back a gentle version ---------- */
  var EDU = { arms: false };

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
  var texSmoke = radialTex([[0, 0.9], [0.45, 0.55], [0.8, 0.12], [1, 0]]);
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
    t.wrapS = t.wrapT = T.RepeatWrapping; t.encoding = T.sRGBEncoding; t.anisotropy = 4;
    return t;
  }
  function facadeTex(emissive) {
    var c = document.createElement('canvas'); c.width = c.height = 256;
    var g = c.getContext('2d');
    g.fillStyle = emissive ? '#000' : '#ece6dc'; g.fillRect(0, 0, 256, 256);
    for (var y = 0; y < 4; y++) for (var x = 0; x < 4; x++) {
      if (emissive) {
        if (Math.random() > 0.55) continue;
        g.fillStyle = pick(['#ffd98a', '#ffe9b8', '#ffc76a', '#a8d4ff']);
      } else g.fillStyle = '#5a6c80';
      g.fillRect(x * 64 + 14, y * 64 + 12, 36, 40);
    }
    var t = new T.CanvasTexture(c);
    t.wrapS = t.wrapT = T.RepeatWrapping; t.encoding = T.sRGBEncoding;
    return t;
  }

  /* ---------- lights and time-of-day presets ---------- */
  var hemi = new T.HemisphereLight(0xffffff, 0x888888, 1);
  scene.add(hemi);
  var sun = new T.DirectionalLight(0xffffff, 1);
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
  function bake(root, keep) {
    var ks = (keep || []).slice(), k, v, buckets = {}, order = [], inv;
    for (k in root.userData) { v = root.userData[k]; if (v && v.isObject3D) ks.push(v); else if (Array.isArray(v)) v.forEach(function (q) { if (q && q.isObject3D) ks.push(q); }); }
    root.updateMatrixWorld(true); inv = new T.Matrix4().copy(root.matrixWorld).invert();
    (function walk(o) {
      for (var i = 0; i < o.children.length; i++) {
        var c = o.children[i];
        if (ks.indexOf(c) >= 0 || !c.visible || c.userData.baked) continue;
        if (c.isMesh && !c.isInstancedMesh && !Array.isArray(c.material) && c.geometry && c.geometry.isBufferGeometry && c.geometry.attributes.position && c.geometry.attributes.normal) {
          var key = c.material.uuid + (c.castShadow ? 'c' : '-') + (c.receiveShadow ? 'r' : '-') + c.renderOrder + (c.frustumCulled ? '' : 'n');
          if (!buckets[key]) { buckets[key] = { parts: [] }; order.push(key); }
          buckets[key].parts.push(c);
        }
        walk(c);
      }
    })(root);
    order.forEach(function (key) {
      var parts = buckets[key].parts, total = 0, geos, pos, nor, uv, off = 0, hasUv = true, first = parts[0];
      if (parts.length < 2) return;
      geos = parts.map(function (c) { var g = c.geometry.index ? c.geometry.toNonIndexed() : c.geometry; total += g.attributes.position.count; if (!g.attributes.uv) hasUv = false; return g; });
      pos = new Float32Array(total * 3); nor = new Float32Array(total * 3); uv = hasUv ? new Float32Array(total * 2) : null;
      parts.forEach(function (c, pi) {
        var g = geos[pi], gp = g.attributes.position, gn = g.attributes.normal, gu = g.attributes.uv, n = gp.count, i, j, flip;
        bakeM.multiplyMatrices(inv, c.matrixWorld); bakeN.getNormalMatrix(bakeM); flip = bakeM.determinant() < 0;
        for (i = 0; i < n; i++) {
          j = flip && i % 3 ? (i % 3 === 1 ? i + 1 : i - 1) : i;   /* a mirrored part has its triangles turned back the right way */
          bakeV.fromBufferAttribute(gp, j).applyMatrix4(bakeM); pos[(off + i) * 3] = bakeV.x; pos[(off + i) * 3 + 1] = bakeV.y; pos[(off + i) * 3 + 2] = bakeV.z;
          bakeV.fromBufferAttribute(gn, j).applyMatrix3(bakeN).normalize(); nor[(off + i) * 3] = bakeV.x; nor[(off + i) * 3 + 1] = bakeV.y; nor[(off + i) * 3 + 2] = bakeV.z;
          if (uv) { uv[(off + i) * 2] = gu.getX(j); uv[(off + i) * 2 + 1] = gu.getY(j); }
        }
        off += n;
        if (g !== c.geometry) g.dispose();
      });
      var geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('normal', new T.BufferAttribute(nor, 3)); if (uv) geo.setAttribute('uv', new T.BufferAttribute(uv, 2));
      geo.computeBoundingSphere();
      var m = new T.Mesh(geo, first.material); m.castShadow = first.castShadow; m.receiveShadow = first.receiveShadow; m.renderOrder = first.renderOrder; m.frustumCulled = first.frustumCulled; m.userData.baked = true; m.matrixAutoUpdate = false;
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
  function prof(pts, width, mat, bevel) {
    var s = new T.Shape();
    pts.forEach(function (p, i) { if (i) s.lineTo(p[0], p[1]); else s.moveTo(p[0], p[1]); });
    var b = bevel || 0;
    var g = new T.ExtrudeGeometry(s, { depth: width - 2 * b, bevelEnabled: b > 0, bevelThickness: b, bevelSize: b, bevelSegments: 1, steps: 1 });
    g.translate(0, 0, -(width - 2 * b) / 2);
    g.rotateY(Math.PI / 2);
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

