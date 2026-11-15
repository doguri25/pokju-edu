  /* ---------- world: the four lanes stay flat; shoulders and everything beside the road can drop away under an elevated deck ---------- */
  var H_DECK = 10, sections = [], genD = 0, roadIdx = 0, props = [], propPool = {};
  /* concrete (graphics upgrade 3): pores and grit, softer blotches where it weathered, a few streaks running down */
  var concreteTex = (function () {
    var c = document.createElement('canvas'); c.width = c.height = 128;
    var g = c.getContext('2d'), i, v;
    g.fillStyle = '#c8c8c8'; g.fillRect(0, 0, 128, 128);
    for (i = 0; i < 18; i++) { var x = Math.random() * 128, y = Math.random() * 128, rg = g.createRadialGradient(x, y, 0, x, y, rnd(10, 30)); v = Math.random() < 0.5 ? 255 : 90; rg.addColorStop(0, 'rgba(' + v + ',' + v + ',' + v + ',0.12)'); rg.addColorStop(1, 'rgba(' + v + ',' + v + ',' + v + ',0)'); g.fillStyle = rg; g.fillRect(0, 0, 128, 128); }
    for (i = 0; i < 1600; i++) { v = Math.random() < 0.5 ? Math.round(rnd(220, 255)) : Math.round(rnd(80, 130)); g.fillStyle = 'rgba(' + v + ',' + v + ',' + v + ',' + rnd(0.1, 0.3) + ')'; g.fillRect(Math.random() * 128, Math.random() * 128, rnd(0.6, 1.6), rnd(0.6, 1.6)); }
    for (i = 0; i < 6; i++) { var sx = Math.random() * 128, lg = g.createLinearGradient(0, 0, 0, 128); lg.addColorStop(0, 'rgba(60,58,54,0.16)'); lg.addColorStop(1, 'rgba(60,58,54,0)'); g.fillStyle = lg; g.fillRect(sx, 0, rnd(2, 6), rnd(50, 128)); }
    var t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t;
  })();
  M.cone = std(0xff6a13, 0.6); M.concrete = std(0xb9bcc0, 0.9); M.concrete.map = concreteTex; M.dirt = std(0x8a6a4a, 1); M.digger = std(0xf2b01e, 0.5, 0.1);
  M.sign = new T.MeshBasicMaterial({ color: 0xffc21a });
  /* tunnel walls are drawn already lit (tiles, joints every 5 m, a dark skirting and an orange guide line), so they look the same at any time of day */
  M.tunWall = (function () {
    var c = document.createElement('canvas'); c.width = 512; c.height = 128;
    var x = c.getContext('2d'), i;
    var gr = x.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, '#6f6a5c'); gr.addColorStop(0.35, '#b9b09a'); gr.addColorStop(1, '#a39a86');
    x.fillStyle = gr; x.fillRect(0, 0, 512, 128);
    x.fillStyle = 'rgba(60,56,48,0.35)'; for (i = 1; i < 6; i++) x.fillRect(0, 12 + i * 15, 512, 1);
    for (i = 0; i < 16; i++) x.fillRect(i * 32, 20, 1, 90);
    x.fillStyle = '#4a463e'; for (i = 0; i < 4; i++) x.fillRect(i * 128, 0, 4, 110);
    x.fillStyle = '#ff8a2a'; x.fillRect(0, 100, 512, 4);
    x.fillStyle = '#2f3136'; x.fillRect(0, 110, 512, 18);
    var tx = new T.CanvasTexture(c); tx.colorSpace = T.SRGBColorSpace; tx.anisotropy = 4;
    return new T.MeshBasicMaterial({ map: tx });
  })();
  M.tunCeil = new T.MeshBasicMaterial({ color: C(0x35373c) });
  M.tunLamp = new T.MeshBasicMaterial({ color: 0xfff0cf, fog: false });
  M.exitGreen = new T.MeshBasicMaterial({ color: 0x35d07f });
  var tunPoolMat = new T.MeshBasicMaterial({ map: texGlow, color: C(0xffd9a0), blending: T.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.42 });
  var fireStripMat = new T.MeshBasicMaterial({ color: 0x7a1206, transparent: true, depthWrite: false, opacity: 0.4, fog: false });
  function checkerMat() {
    var c = document.createElement('canvas'); c.width = 256; c.height = 32;
    var x = c.getContext('2d');
    for (var i = 0; i < 16; i++) for (var j = 0; j < 2; j++) { x.fillStyle = (i + j) % 2 ? '#15171a' : '#f4f4f0'; x.fillRect(i * 16, j * 16, 16, 16); }
    return new T.MeshBasicMaterial({ map: new T.CanvasTexture(c) });
  }
  /* road layout randomness: seeded for time-attack tracks so a track is the same road every run */
  var roadSeed = 0, holeSeed = 0;
  /* potholes are laid out by their own random stream, so adding them did not move anything else on the seeded tracks */
  function hr() {
    if (!holeSeed) return Math.random();
    holeSeed = (holeSeed + 0x6D2B79F5) | 0;
    var t = Math.imul(holeSeed ^ (holeSeed >>> 15), 1 | holeSeed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function rr() {
    if (!roadSeed) return Math.random();
    roadSeed = (roadSeed + 0x6D2B79F5) | 0;
    var t = Math.imul(roadSeed ^ (roadSeed >>> 15), 1 | roadSeed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function rrnd(a, b) { return a + rr() * (b - a); }
  function rpick(arr) { return arr[(rr() * arr.length) | 0]; }
  function smooth(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function elevAt(d) {
    for (var i = 0; i < sections.length; i++) {
      var s = sections[i];
      if (s.type === 'deck' && d > s.d0 && d < s.d1) return smooth((d - s.d0) / 50) * smooth((s.d1 - d) / 50);
    }
    return 0;
  }
  function sectionAt(d) { for (var i = 0; i < sections.length; i++) if (d >= sections[i].d0 && d < sections[i].d1) return sections[i]; return null; }
  function blockedAt(d) {
    var s = sectionAt(d);
    if (s && s.type === 'split') {
      var ws = Math.min(clamp((d - s.d0) / 30, 0, 1), clamp((s.d1 - d) / 20, 0, 1));
      return ws < 0.05 ? null : { a: -0.5 * ws, b: 0.5 * ws, split: true };
    }
    if (!s || s.type !== 'work') return null;
    var w = Math.min(clamp((d - s.d0) / 36, 0, 1), clamp((s.d1 - d) / 14, 0, 1));
    if (w < 0.03) return null;
    var outer = s.side * 8.1, inner = s.side * (8.1 - s.width * w);
    return { a: Math.min(outer, inner), b: Math.max(outer, inner) };
  }
  function laneOpen(x, d) { var iv = blockedAt(d); return !iv || x < iv.a - 1 || x > iv.b + 1; }
  /* side: 1 = right shoulder, -1 = left shoulder. A full deck or a tunnel closes both; a split road closes only the shoulder on its elevated side */
  function shoulderClosed(d, side) {
    if (region.noLeft && side === -1) return true;   /* an expressway has a median barrier where the left shoulder would be */
    for (var i = 0; i < sections.length; i++) {
      var s = sections[i];
      if (d <= s.d0 - 14 || d >= s.d1 + 4) continue;
      if (s.type === 'deck' || s.type === 'tunnel' || s.type === 'toll') return true;
      if (s.type === 'split' && side === s.deck) return true;
    }
    return false;
  }
  /* split road: two lanes stay on a deck while the other two and their shoulder run at ground level beside it. The value is the height difference at distance d;
     its sign tells the shader which side is the low one (positive: x > 0) */
  var H_SPLIT = 6.5, stops = [];
  function splitDepth(s, d) { return H_SPLIT * smooth((d - s.d0 - 34) / 60) * smooth((s.d1 - 34 - d) / 60); }
  function splitVal(d) {
    for (var i = 0; i < sections.length; i++) { var s = sections[i]; if (s.type === 'split' && d > s.d0 && d < s.d1) return -s.deck * splitDepth(s, d); }
    return 0;
  }
  function updateSplit(dist, px) {
    var a = splitU.value, v = splitVal(dist);
    for (var k = 0; k < HILL_N; k++) a[k] = splitVal(dist - 60 + 5 * k);
    liftU.value = (v > 0 && px > 0.2) || (v < 0 && px < -0.2) ? Math.abs(v) : 0;
  }
  function inTunnel(d) { var s = sectionAt(d); return !!s && s.type === 'tunnel'; }
  var dropStrips = [], STRIP_ROWS = 88;
  function strip(x, width, y, mat, drop) {
    var g = new T.PlaneGeometry(width, 440, 1, STRIP_ROWS); g.rotateX(-Math.PI / 2);
    var m = new T.Mesh(g, mat); m.position.set(x, y, -170); m.receiveShadow = true; m.frustumCulled = false; scene.add(m);
    if (drop) dropStrips.push(m);
    return m;
  }
  /* asphalt (graphics upgrade 3): one lane wide and 16 m long per tile. Stone chips in the binder, two darker wheel paths and an oily
     strip down the middle where cars drip, a few sealed cracks and a repair patch; the colour itself comes from the material */
  function asphaltTex() {
    var W = 256, H = 1024, c = document.createElement('canvas'); c.width = W; c.height = H;
    var g = c.getContext('2d'), i, x, y, v;
    g.fillStyle = '#c6c6c6'; g.fillRect(0, 0, W, H);
    for (i = 0; i < 60; i++) {   /* broad mottling */
      x = rnd(0, W); y = rnd(0, H); v = Math.random() < 0.5 ? 0 : 255;
      var mg = g.createRadialGradient(x, y, 0, x, y, rnd(30, 90)); mg.addColorStop(0, 'rgba(' + v + ',' + v + ',' + v + ',0.05)'); mg.addColorStop(1, 'rgba(' + v + ',' + v + ',' + v + ',0)');
      g.fillStyle = mg; g.fillRect(0, 0, W, H);
    }
    [[0.28, 0.13], [0.72, 0.13], [0.5, 0.06]].forEach(function (b) {   /* wheel paths and the oily middle */
      var bx = b[0] * W, lg = g.createLinearGradient(bx - 26, 0, bx + 26, 0);
      lg.addColorStop(0, 'rgba(0,0,0,0)'); lg.addColorStop(0.5, 'rgba(20,20,24,' + b[1] + ')'); lg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = lg; g.fillRect(bx - 26, 0, 52, H);
    });
    for (i = 0; i < 26; i++) { g.fillStyle = 'rgba(10,10,12,' + rnd(0.06, 0.16) + ')'; g.beginPath(); g.ellipse(W * 0.5 + rnd(-10, 10), rnd(0, H), rnd(3, 9), rnd(5, 16), 0, 0, 6.283); g.fill(); }   /* drips */
    for (i = 0; i < 9000; i++) {   /* the stone chips */
      v = Math.random() < 0.55 ? Math.round(rnd(215, 255)) : Math.round(rnd(60, 110));
      g.fillStyle = 'rgba(' + v + ',' + v + ',' + v + ',' + rnd(0.12, 0.38) + ')';
      g.fillRect(Math.random() * W, Math.random() * H, rnd(0.8, 2.2), rnd(0.8, 2.2));
    }
    x = rnd(30, W - 110); y = rnd(200, H - 360); v = rnd(120, 260);   /* a repair patch */
    var pw = rnd(60, 100);
    g.fillStyle = 'rgba(30,30,34,0.13)'; g.fillRect(x, y, pw, v);
    g.strokeStyle = 'rgba(20,20,22,0.25)'; g.lineWidth = 1.5; g.strokeRect(x, y, pw, v);
    g.lineCap = 'round';
    for (i = 0; i < 4; i++) {   /* sealed cracks: dark wandering lines, a little wider where the sealant spread */
      x = rnd(20, W - 20); y = rnd(60, H - 160);
      g.strokeStyle = 'rgba(12,12,14,' + rnd(0.3, 0.5) + ')'; g.lineWidth = rnd(1.2, 2.6);
      g.beginPath(); g.moveTo(x, y);
      for (var s = 0, n = 6 + (Math.random() * 10 | 0); s < n; s++) { x = clamp(x + rnd(-14, 14), 4, W - 4); y += rnd(6, 16); g.lineTo(x, y); }
      g.stroke();
    }
    var t = new T.CanvasTexture(c);
    t.wrapS = t.wrapT = T.RepeatWrapping; t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8;
    return t;
  }
  var groundTex = grassTex(); groundTex.repeat.set(90, 33);
  var groundMat = new T.MeshStandardMaterial({ map: groundTex, roughness: 1 });
  strip(0, 1200, -0.06, groundMat, true);
  var roadTex = asphaltTex(); roadTex.repeat.set(1, 27.5);   /* each lane strip runs 0..1 across, so one tile is one lane; 440 m / 27.5 = 16 m per tile */
  var roadMat = new T.MeshStandardMaterial({ map: roadTex, roughness: 0.85, shadowSide: T.DoubleSide });
  var roadOutMat = new T.MeshStandardMaterial({ map: roadTex, roughness: 0.85, shadowSide: T.DoubleSide });
  [[-8.1148, -4.2, 1], [-4.2, -0.2052, 0], [-0.2048, 0.2048, 0], [0.2052, 4.2, 0], [4.2, 8.1148, 1]].forEach(function (r) { strip((r[0] + r[1]) / 2, r[1] - r[0], 0, r[2] ? roadOutMat : roadMat, false).castShadow = true; });
  var shoulderTex = noiseTex(1.6); shoulderTex.repeat.set(1, 110);
  var shoulderMat = new T.MeshStandardMaterial({ map: shoulderTex, roughness: 0.95 });
  var walkMat = new T.MeshStandardMaterial({ roughness: 0.95 });
  var sideKerbs = [], sideRails = [], edgeLines = [];
  [-1, 1].forEach(function (s) {
    strip(s * 9.8076, 3.3848, -0.01, shoulderMat, true);
    sideKerbs.push(strip(s * 11.65, 0.3, 0.1, walkMat, true));
    strip(s * 13.5, 3.5, 0.03, walkMat, true);
    sideRails.push(strip(s * 11.6, 0.14, 0.82, M.rail, true));
    var edge = new T.Mesh(new T.PlaneGeometry(0.22, 440, 1, STRIP_ROWS), M.white);
    edge.rotation.x = -Math.PI / 2; edge.position.set(s * 7.95, 0.015, -170); scene.add(edge); edgeLines.push(edge);
  });
  function updateStrips() {
    for (var k = 0; k < dropStrips.length; k++) {
      var pos = dropStrips[k].geometry.attributes.position;
      for (var r = 0; r <= STRIP_ROWS; r++) {
        var y = -H_DECK * elevAt(dist + 390 - r * 5);
        pos.setY(r * 2, y); pos.setY(r * 2 + 1, y);
      }
      pos.needsUpdate = true;
    }
  }
  var loops = [];
  function loopGroup(period, drop) { var g = new T.Group(); g.userData.period = period; g.userData.drop = !!drop; scene.add(g); loops.push(g); return g; }
  var dashes = loopGroup(9, false);
  var dashGeo = new T.PlaneGeometry(0.22, 3.4); dashGeo.rotateX(-Math.PI / 2);
  for (var dz = -297; dz <= 45; dz += 9) [-4, 0, 4].forEach(function (x) {
    var d = new T.Mesh(dashGeo, M.white); d.position.set(x, 0.012, dz); d.receiveShadow = true; dashes.add(d);
  });
  var posts = loopGroup(6, true);
  var postGeo = new T.BoxGeometry(0.14, 0.9, 0.14);
  for (var pz = -294; pz <= 42; pz += 6) [-11.6, 11.6].forEach(function (x) {
    var p = new T.Mesh(postGeo, M.pole); p.position.set(x, 0.45, pz); p.userData.baseY = 0.45; p.castShadow = true; posts.add(p);
  });
  var nightGlows = [];
  var poolMat = new T.MeshBasicMaterial({ map: texGlow, color: C(0xffd9a0), blending: T.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0, fog: false });
  /* a lamp's reflection on a wet or night road: a long warm streak running towards the viewer (graphics upgrade) */
  var streakMat = new T.MeshBasicMaterial({ map: texGlow, color: C(0xffb066), blending: T.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0, fog: false });
  var lamps = loopGroup(48, true);
  for (var lz = -288, li = 0; lz <= 48; lz += 24, li++) {
    var ls = li % 2 ? 1 : -1;
    var L = new T.Group(); L.position.set(ls * 12.1, 0, lz); L.userData.baseY = 0;
    L.add(cyl(0.11, 0.15, 7.6, 6, M.pole, 0, 3.8, 0));
    L.add(bx(2.6, 0.12, 0.12, M.pole, -ls * 1.2, 7.5, 0));
    var head = new T.Mesh(new T.BoxGeometry(0.9, 0.14, 0.4), M.lamp); head.position.set(-ls * 2.3, 7.4, 0); L.add(head);
    var gl = glowSprite(0xffd08a, 5, 0); gl.position.set(-ls * 2.3, 7.3, 0); L.add(gl); nightGlows.push(gl);
    var pool = new T.Mesh(new T.PlaneGeometry(14, 17, 1, 4), poolMat); pool.rotation.x = -Math.PI / 2; pool.position.set(-ls * 4.6, 0.05, 0); L.add(pool);
    var streak = new T.Mesh(new T.PlaneGeometry(1.6, 26, 1, 6), streakMat);   /* glows on the road have rows, so they bend over a crest instead of sinking into it */ streak.rotation.x = -Math.PI / 2; streak.position.set(-ls * 3.4, 0.06, 9); L.add(streak);
    lamps.add(L);
  }
  var facade = facadeTex(false), facadeE = facadeTex(true);
  var bTints = [0xf2c9b4, 0xbfd6f2, 0xf0e2a8, 0xdccdf0, 0xc4e6d0, 0xf5f0e8, 0xe8b9b0];
  var bMats = bTints.map(function (hex) {
    var wall = new T.MeshStandardMaterial({ map: facade, emissiveMap: facadeE, emissive: new T.Color(1, 0.86, 0.6), emissiveIntensity: 0, color: C(hex), roughness: 0.9 });
    var roof = new T.MeshStandardMaterial({ color: C(hex).multiplyScalar(0.72), roughness: 0.95 });
    return [wall, wall, roof, roof, wall, wall];
  });
  var neonColors = [0xff3d8b, 0x2de2ff, 0xffd23d, 0x7dff6a];
  /* neon shop signs (graphics upgrade, after the mockup): glowing Hangul on a dark plate, drawn with Canvas2D.
     By day they read as signboards; at dusk and night postLights() drives them brighter than white so the bloom catches them */
  var SIGN_TEXT = [['전설 카센터', '#2de2ff'], ['한울 분식', '#ffd23d'], ['구구단 학원', '#ff3d8b'], ['24시 편의점', '#7dff6a'], ['마성 전자', '#ff4d6d'],
    ['노래방', '#b04dff'], ['맞춤법 서점', '#2de2ff'], ['한울 약국', '#7dff6a'], ['떡볶이', '#ff3d8b'], ['PC방', '#ffd23d']];
  var NEON_SIGNS = [];
  var signMats = SIGN_TEXT.map(function (t) {
    var c = document.createElement('canvas'); c.width = 512; c.height = 160;
    var x = c.getContext('2d');
    x.fillStyle = 'rgba(12,10,22,0.94)'; x.beginPath(); x.roundRect(6, 6, 500, 148, 24); x.fill();
    x.lineWidth = 6; x.strokeStyle = t[1]; x.shadowColor = t[1]; x.shadowBlur = 22; x.stroke();
    x.font = '400 88px "Black Han Sans", "Noto Sans KR", system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    var tw = x.measureText(t[0]).width; if (tw > 460) x.font = '400 ' + Math.floor(88 * 460 / tw) + 'px "Black Han Sans", "Noto Sans KR", system-ui, sans-serif';
    for (var i = 0; i < 3; i++) { x.shadowBlur = 28 - i * 10; x.fillStyle = i === 2 ? '#ffffff' : t[1]; x.fillText(t[0], 256, 86); }
    var tx = new T.CanvasTexture(c); tx.colorSpace = T.SRGBColorSpace; tx.anisotropy = 4;
    var m = new T.MeshBasicMaterial({ map: tx, transparent: true });
    NEON_SIGNS.push({ m: m, base: new T.Color(1, 1, 1), day: 1, night: 1.7 });
    return m;
  });
  var stripMats = neonColors.map(function (hex) { var m = new T.MeshBasicMaterial({ color: C(hex) }); NEON_SIGNS.push({ m: m, base: C(hex), day: 1, night: 3 }); return m; });
  var scenery = [];
  /* rooftops and shop floors (graphics upgrade 3): a parapet, plant on the roof, and at street level a lit shop window under an awning */
  var bldTrim = std(0xd8d4cc, 0.85), shopGlass = new T.MeshStandardMaterial({ color: C(0x1d2733), roughness: 0.12, metalness: 0.5, emissive: new T.Color(1, 0.74, 0.45), emissiveIntensity: 0 });
  var awnings = [0xc0392b, 0x2e86c1, 0x27ae60, 0xd68910, 0x7d3c98].map(function (h) { return std(h, 0.7); }), tankGeo = new T.CylinderGeometry(0.9, 0.9, 1.6, 12);
  ENV_MATS.push(shopGlass);
  function dressBuilding(m, side, w, h, d) {
    var top = h / 2, rf = -side, i, pw = 0.25;
    [[w, pw, 0, d / 2 - pw / 2], [w, pw, 0, -d / 2 + pw / 2], [pw, d, w / 2 - pw / 2, 0], [pw, d, -w / 2 + pw / 2, 0]].forEach(function (p) {   /* parapet */
      var e = shadowed(new T.Mesh(new T.BoxGeometry(p[0], 0.7, p[1]), bldTrim)); e.position.set(p[2], top + 0.35, p[3]); m.add(e);
    });
    for (i = 0; i < 1 + (Math.random() * 3 | 0); i++) {   /* air-conditioning units */
      var ac = shadowed(new T.Mesh(new T.BoxGeometry(rnd(1, 1.8), rnd(0.7, 1.1), rnd(1, 1.6)), i % 2 ? M.metal : M.steel)); ac.position.set(rnd(-w / 3, w / 3), top + 0.5, rnd(-d / 3, d / 3)); m.add(ac);
    }
    if (Math.random() < 0.5) { var tk = shadowed(new T.Mesh(tankGeo, M.steel)); tk.position.set(rnd(-w / 4, w / 4), top + 1.3, rnd(-d / 4, d / 4)); m.add(tk); }
    else if (h > 14) { var an = new T.Mesh(new T.CylinderGeometry(0.05, 0.08, 4, 6), M.pole); an.position.set(rnd(-w / 4, w / 4), top + 2, rnd(-d / 4, d / 4)); m.add(an); }
    /* the shop floor on the road side */
    var sw = d * 0.8, shop = new T.Mesh(new T.BoxGeometry(0.12, 2.6, sw), shopGlass); shop.position.set(rf * (w / 2 + 0.02), -h / 2 + 1.5, 0); m.add(shop);
    var fr = new T.Mesh(new T.BoxGeometry(0.2, 0.3, sw + 0.3), bldTrim); fr.position.set(rf * (w / 2 + 0.05), -h / 2 + 2.95, 0); m.add(fr);
    var aw = shadowed(new T.Mesh(new T.BoxGeometry(1.6, 0.12, sw), pick(awnings))); aw.position.set(rf * (w / 2 + 0.75), -h / 2 + 3.25, 0); aw.rotation.z = rf * 0.28; m.add(aw);
  }
  function makeBuilding(side, z) {
    var w = rnd(9, 15), h = rnd(7, 24), d = rnd(9, 16);
    var g = new T.BoxGeometry(w, h, d);
    var uv = g.attributes.uv;
    for (var i = 0; i < uv.count; i++) {
      var face = (i / 4) | 0;
      if (face === 2 || face === 3) continue;
      var fw = face < 2 ? d : w;
      uv.setXY(i, uv.getX(i) * Math.max(1, Math.round(fw / 3)) / 4, uv.getY(i) * Math.max(1, Math.round(h / 3.2)) / 4);
    }
    var m = shadowed(new T.Mesh(g, pick(bMats)));
    m.position.set(side * (17.5 + w / 2 + rnd(0, 7)), h / 2, z); m.userData.baseY = h / 2;
    if (Math.random() < 0.6) {
      var si = (Math.random() * SIGN_TEXT.length) | 0, sw = Math.min(rnd(5, 7), d - 1);
      var sign = new T.Mesh(new T.PlaneGeometry(sw, sw * 0.31), signMats[si]);
      sign.position.set(-side * (w / 2 + 0.06), -h / 2 + rnd(4, Math.min(h - 1.5, 9)), rnd(-d / 5, d / 5)); sign.rotation.y = -side * Math.PI / 2;
      m.add(sign);
      var ng = glowSprite(parseInt(SIGN_TEXT[si][1].slice(1), 16), 9, 0); ng.position.copy(sign.position); ng.position.x -= side * 0.8; m.add(ng); nightGlows.push(ng);
    }
    if (Math.random() < 0.35) {   /* a neon strip up the corner that faces the road */
      var strip = new T.Mesh(new T.BoxGeometry(0.16, h * 0.9, 0.16), pick(stripMats));
      strip.position.set(-side * (w / 2 + 0.08), 0, (Math.random() < 0.5 ? -1 : 1) * (d / 2 - 0.1)); m.add(strip);
    }
    dressBuilding(m, side, w, h, d);
    scene.add(m); scenery.push(m);
  }
  for (var bi = 0; bi < 14; bi++) { makeBuilding(-1, -250 + bi * 22 + rnd(-3, 3)); makeBuilding(1, -250 + bi * 22 + rnd(-3, 3)); }
  var coneGeoA = new T.ConeGeometry(1.5, 2.6, 7), coneGeoB = new T.ConeGeometry(1.1, 2.2, 7), trunkGeo = new T.CylinderGeometry(0.18, 0.24, 1.6, 5);
  /* ---------- trees (graphics upgrade 5): Korean roadside species, each with its own shape and colours ----------
     은행나무 (ginkgo, tall pointed oval, gold), 단풍나무 (maple, wide dome, red to orange), 벚나무 (cherry, low spreading, pink),
     느티나무 (zelkova, vase of branches under a broad umbrella), 소나무 (red pine, a leaning red-brown trunk and flat cloud-like layers),
     자작나무 (birch, a slender white trunk), 가문비 (spruce, tiers) and a bare winter tree. A tree is a trunk with branches and lumpy,
     faceted clumps of leaves at their ends; autumn trees drop a ring of fallen leaves round their feet */
  var CLUMP_GEOS = [0, 1, 2].map(function () {
    var g = new T.IcosahedronGeometry(1, 1), a, i, seen = {};
    if (g.index) g = g.toNonIndexed();
    a = g.attributes.position;
    for (i = 0; i < a.count; i++) {   /* the same corner moves the same way on every face: a closed, lumpy ball */
      var key = a.getX(i).toFixed(3) + ',' + a.getY(i).toFixed(3) + ',' + a.getZ(i).toFixed(3), k = seen[key] || (seen[key] = rnd(0.78, 1.22));
      a.setXYZ(i, a.getX(i) * k, a.getY(i) * k * (a.getY(i) < -0.3 ? 0.75 : 1), a.getZ(i) * k);
    }
    g.computeVertexNormals(); return g;
  });
  var BRANCH_GEO = new T.CylinderGeometry(0.5, 1, 1, 6); BRANCH_GEO.translate(0, 0.5, 0);   /* unit branch: base at 0, tip at 1, tapering */
  function leaves(hexes) { return hexes.map(function (h) { var m = std(h, 0.85); m.flatShading = true; return m; }); }
  var TREE_MAT = {
    ginkgo: leaves([0xf2c12e, 0xe8b31c, 0xf5d24a, 0xd9a417]), ginkgoG: leaves([0x7fae3e, 0x93bb48]),
    maple: leaves([0xc8331d, 0xe0552a, 0xa82418, 0xe8862a, 0xd9461f]), cherry: leaves([0xf4b8c8, 0xf7cad6, 0xeaa2b8, 0xfbe0e8]),
    zelkova: leaves([0x6f9a3e, 0x8a9a3a, 0xb7792e, 0x5e8a3a]), green: leaves([0x4f8f3e, 0x6aa84f, 0x5c9a46]),
    pine: leaves([0x2f5e3a, 0x3c6e44, 0x284f33]), birch: leaves([0xb9c65a, 0xd4c24a, 0xa9bd52]), spruce: leaves([0x2a5a40, 0x23503a, 0x30664a])
  };
  var BARK = { brown: std(0x5e4330, 0.95), dark: std(0x3f3128, 0.95), red: std(0x9a5a3a, 0.9), white: std(0xe8e4da, 0.8), grey: std(0x7a746c, 0.95) };
  /* fallen leaves: a disc of scattered autumn leaves, fading out at the rim */
  var litterMats = {};
  function litterMat(kind) {
    if (litterMats[kind]) return litterMats[kind];
    var cols = { ginkgo: ['#f2c12e', '#e8b31c', '#f5d24a', '#c99a14'], maple: ['#c8331d', '#e0552a', '#a82418', '#e8862a', '#8a3a1c'], cherry: ['#f4b8c8', '#fbe0e8', '#eaa2b8'], zelkova: ['#b7792e', '#8a6a2a', '#a0662a'] }[kind];
    var c = document.createElement('canvas'); c.width = c.height = 128;
    var g = c.getContext('2d'), i;
    for (i = 0; i < 420; i++) {
      var r = Math.pow(Math.random(), 0.7) * 60, a = Math.random() * 6.283, x = 64 + Math.cos(a) * r, y = 64 + Math.sin(a) * r;
      g.save(); g.translate(x, y); g.rotate(Math.random() * 6.283); g.globalAlpha = 0.95 * (1 - Math.pow(r / 62, 3));
      g.fillStyle = pick(cols); g.beginPath(); g.ellipse(0, 0, rnd(1.6, 3), rnd(1, 1.8), 0, 0, 6.283); g.fill(); g.restore();
    }
    var t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace;
    return (litterMats[kind] = new T.MeshStandardMaterial({ map: t, transparent: true, depthWrite: false, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }));
  }
  var litterGeo = new T.CircleGeometry(1, 20); litterGeo.rotateX(-Math.PI / 2);
  function branch(g, mat, x0, y0, z0, x1, y1, z1, r) {
    var b = shadowed(new T.Mesh(BRANCH_GEO, mat)), dx = x1 - x0, dy = y1 - y0, dz = z1 - z0, len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    b.position.set(x0, y0, z0); b.scale.set(r, len, r);
    b.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), new T.Vector3(dx / len, dy / len, dz / len)); g.add(b); return b;
  }
  function clump(g, mats, x, y, z, sx, sy, sz) {
    var m = shadowed(new T.Mesh(pick(CLUMP_GEOS), pick(mats))); m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.rotation.set(rnd(0, 6), rnd(0, 6), rnd(0, 6)); g.add(m); return m;
  }
  function mkTree(kind, sc) {
    var g = new T.Group(), i, a, r, h, n, x, z, L = TREE_MAT;
    if (kind === 'ginkgo') {   /* tall trunk, a pointed oval of gold (a few still green) */
      var gm = Math.random() < 0.18 ? L.ginkgoG : L.ginkgo; h = rnd(2.4, 3.0);
      branch(g, BARK.grey, 0, 0, 0, rnd(-0.1, 0.1), h + 3.5, rnd(-0.1, 0.1), 0.26);
      for (i = 0; i < 6; i++) { var t = i / 5, rr = 1.75 * Math.sin(Math.PI * (0.18 + 0.75 * t)) * (1 - 0.35 * t); a = rnd(0, 6.28); clump(g, gm, Math.cos(a) * rr * 0.35, h + 0.6 + t * 4.2, Math.sin(a) * rr * 0.35, rr, rnd(1.0, 1.25), rr); }
      if (gm === L.ginkgo) { var lt = new T.Mesh(litterGeo, litterMat('ginkgo')); lt.scale.setScalar(rnd(2.2, 3)); lt.position.y = 0.03; lt.renderOrder = -1; g.add(lt); }
    } else if (kind === 'maple' || kind === 'cherry' || kind === 'green') {   /* short trunk, branches to a wide dome */
      var mm = L[kind]; h = rnd(1.4, 1.9); n = kind === 'cherry' ? 5 : 4;
      branch(g, kind === 'cherry' ? BARK.dark : BARK.brown, 0, 0, 0, 0, h, 0, 0.24);
      for (i = 0; i < n; i++) {
        a = i / n * 6.28 + rnd(-0.4, 0.4); r = rnd(1.0, 1.7) * (kind === 'cherry' ? 1.2 : 1);
        x = Math.cos(a) * r; z = Math.sin(a) * r; var ty = h + rnd(1.1, 1.8) * (kind === 'cherry' ? 0.8 : 1);
        branch(g, kind === 'cherry' ? BARK.dark : BARK.brown, 0, h - 0.1, 0, x, ty, z, 0.12);
        clump(g, mm, x, ty + 0.5, z, rnd(1.3, 1.7), rnd(1.0, 1.3) * (kind === 'cherry' ? 0.8 : 1), rnd(1.3, 1.7));
      }
      clump(g, mm, 0, h + 2.3, 0, rnd(1.5, 1.9), rnd(1.1, 1.4), rnd(1.5, 1.9));
      if (kind !== 'green') { var lm = new T.Mesh(litterGeo, litterMat(kind)); lm.scale.setScalar(rnd(2.6, 3.4)); lm.position.y = 0.03; lm.renderOrder = -1; g.add(lm); }
    } else if (kind === 'zelkova') {   /* a vase of branches under a broad umbrella */
      h = rnd(1.8, 2.2); branch(g, BARK.grey, 0, 0, 0, 0, h, 0, 0.32);
      for (i = 0; i < 6; i++) { a = i / 6 * 6.28 + rnd(-0.3, 0.3); x = Math.cos(a) * rnd(1.8, 2.4); z = Math.sin(a) * rnd(1.8, 2.4); branch(g, BARK.grey, 0, h - 0.2, 0, x, h + rnd(2.0, 2.6), z, 0.13); clump(g, L.zelkova, x, h + 3.0, z, rnd(1.5, 1.9), rnd(0.9, 1.1), rnd(1.5, 1.9)); }
      clump(g, L.zelkova, 0, h + 3.7, 0, 2.2, 1.1, 2.2);
      if (Math.random() < 0.6) { var lz = new T.Mesh(litterGeo, litterMat('zelkova')); lz.scale.setScalar(rnd(3, 3.8)); lz.position.y = 0.03; lz.renderOrder = -1; g.add(lz); }
    } else if (kind === 'pine') {   /* 소나무: a leaning red trunk, flat layered clouds of needles */
      var lean = rnd(-0.35, 0.35), bx2 = lean * 2.2; h = rnd(4.2, 5.4);
      branch(g, BARK.red, 0, 0, 0, bx2 * 0.5, h * 0.55, 0, 0.26); branch(g, BARK.red, bx2 * 0.5, h * 0.55, 0, bx2, h, rnd(-0.3, 0.3), 0.19);
      for (i = 0; i < 4; i++) {
        var py = h * (0.5 + i * 0.17), pa = rnd(0, 6.28), pr = rnd(0.6, 1.4) * (1 - i * 0.15), px2 = bx2 * (py / h) + Math.cos(pa) * pr, pz = Math.sin(pa) * pr;
        branch(g, BARK.red, bx2 * (py / h) * 0.9, py - 0.4, 0, px2, py, pz, 0.08);
        clump(g, L.pine, px2, py + 0.15, pz, rnd(1.2, 1.7) * (1 - i * 0.12), rnd(0.38, 0.5), rnd(1.1, 1.5) * (1 - i * 0.12));
      }
    } else if (kind === 'birch') {   /* slender white trunk, small light crown */
      h = rnd(3.2, 4); branch(g, BARK.white, 0, 0, 0, rnd(-0.15, 0.15), h + 2.2, 0, 0.15);
      for (i = 0; i < 4; i++) { a = rnd(0, 6.28); clump(g, L.birch, Math.cos(a) * 0.6, h + i * 0.6, Math.sin(a) * 0.6, rnd(0.8, 1.1), rnd(0.9, 1.2), rnd(0.8, 1.1)); }
    } else if (kind === 'spruce' || kind === 'spruceSnow') {   /* tiers of cones */
      var sm = pick(L.spruce); branch(g, BARK.dark, 0, 0, 0, 0, 1.2, 0, 0.22);
      for (i = 0; i < 4; i++) { var cn = shadowed(new T.Mesh(i < 2 ? coneGeoA : coneGeoB, sm)); cn.position.y = 1.9 + i * 1.05; cn.scale.setScalar(1.15 - i * 0.22); cn.rotation.y = i * 0.7; g.add(cn); }
      if (kind === 'spruceSnow') for (i = 0; i < 3; i++) { var sn = new T.Mesh(coneGeoB, BARK.white); sn.position.y = 2.5 + i * 1.05; sn.scale.set(0.75 - i * 0.16, 0.45, 0.75 - i * 0.16); g.add(sn); }
    } else {   /* bare winter tree */
      h = rnd(1.8, 2.4); branch(g, BARK.dark, 0, 0, 0, 0, h, 0, 0.22);
      for (i = 0; i < 5; i++) { a = i / 5 * 6.28 + rnd(-0.3, 0.3); x = Math.cos(a) * rnd(1, 1.8); z = Math.sin(a) * rnd(1, 1.8); var by = h + rnd(1.2, 2.2); branch(g, BARK.dark, 0, h - 0.2, 0, x, by, z, 0.09); branch(g, BARK.dark, x, by, z, x * 1.3, by + 0.8, z * 1.3, 0.05); }
    }
    g.scale.setScalar(sc || rnd(0.85, 1.25)); g.rotation.y = rnd(0, 6.28); g.userData.baseY = 0;
    return g;
  }
  /* which species where: weights per kind of place */
  var TREE_MIX = { street: [['ginkgo', 5], ['zelkova', 2], ['maple', 2], ['cherry', 1]], broad: [['maple', 4], ['ginkgo', 2], ['zelkova', 2], ['cherry', 1], ['green', 2], ['birch', 1]],
    conifer: [['pine', 5], ['spruce', 3], ['maple', 1], ['birch', 1]], snow: [['spruceSnow', 4], ['bare', 3], ['birch', 2]], coast: [['pine', 5], ['green', 1]] };
  TREE_MIX.coastE = TREE_MIX.coast;
  function pickTree(mix, sc) {
    var list = TREE_MIX[mix], sum = 0, i, r;
    for (i = 0; i < list.length; i++) sum += list[i][1];
    r = Math.random() * sum;
    for (i = 0; i < list.length - 1 && r >= list[i][1]; i++) r -= list[i][1];
    return mkTree(list[i][0], sc);
  }
  for (var ti = 0; ti < 30; ti++) {   /* street trees along the city's pavements */
    var tr = pickTree('street', rnd(0.85, 1.15));
    tr.position.set((ti % 2 ? 1 : -1) * rnd(13.2, 14.8), 0, -250 + ti * 10.3 + rnd(-2, 2));
    scene.add(tr); scenery.push(tr);
  }

  /* ---------- road props: ground-fixed objects for work zones, decks, overpasses and shoulder hazards ---------- */
  var coneGeo = new T.ConeGeometry(0.3, 0.8, 8), barrierGeo = new T.BoxGeometry(0.5, 0.8, 2.6), parapetGeo = new T.BoxGeometry(0.45, 2.5, 12);
  var pierGeo = new T.BoxGeometry(1.6, H_DECK, 1.6), pillarGeo = new T.BoxGeometry(1.2, 7, 1.2);
  var BUILD = {
    cone: function () { var m = shadowed(new T.Mesh(coneGeo, M.cone)); m.userData.baseY = 0.4; return m; },
    barrier: function () { var m = shadowed(new T.Mesh(barrierGeo, M.cone)); m.userData.baseY = 0.4; return m; },
    barrierW: function () { var m = shadowed(new T.Mesh(barrierGeo, M.white)); m.userData.baseY = 0.4; return m; },
    parapet: function () { var m = shadowed(new T.Mesh(parapetGeo, M.concrete)); m.userData.baseY = -0.35; return m; },
    pier: function () { var m = shadowed(new T.Mesh(pierGeo, M.concrete)); m.userData.baseY = -1.6 - H_DECK / 2; return m; },
    pillar: function () { var g = new T.Group(); var m = shadowed(new T.Mesh(pillarGeo, M.concrete)); m.position.y = 3.5; g.add(m); g.add(bx(1.5, 0.5, 1.5, M.cone, 0, 0.6, 0)); g.userData.baseY = 0; return g; },
    arrow: function () {
      var g = new T.Group();
      g.add(bx(2.4, 1.5, 0.2, M.dark, 0, 2.1, 0)); g.add(bx(0.12, 1.4, 0.12, M.pole, -0.9, 0.7, 0)); g.add(bx(0.12, 1.4, 0.12, M.pole, 0.9, 0.7, 0));
      [-0.6, 0, 0.6].forEach(function (x) {
        var a = new T.Mesh(new T.BoxGeometry(0.5, 0.14, 0.05), M.sign); a.position.set(x + 0.1, 2.3, 0.12); a.rotation.z = -0.7; g.add(a);
        var b = new T.Mesh(new T.BoxGeometry(0.5, 0.14, 0.05), M.sign); b.position.set(x + 0.1, 1.9, 0.12); b.rotation.z = 0.7; g.add(b);
      });
      g.userData.baseY = 0; return g;
    },
    pile: function () { var m = shadowed(new T.Mesh(new T.ConeGeometry(1.5, 1.4, 7), M.dirt)); m.userData.baseY = 0.7; return m; },
    digger: function () {
      var g = new T.Group();
      g.add(bx(1.8, 0.5, 2.6, M.dark, 0, 0.35, 0)); g.add(bx(1.6, 0.9, 1.8, M.digger, 0, 1.05, -0.2)); g.add(bx(0.9, 0.8, 0.9, M.glass, 0.3, 1.9, -0.3));
      var arm = bx(0.3, 0.3, 2.6, M.digger, -0.5, 2.0, 1.3); arm.rotation.x = 0.5; g.add(arm);
      var arm2 = bx(0.26, 0.26, 1.8, M.digger, -0.5, 1.6, 2.7); arm2.rotation.x = -0.9; g.add(arm2);
      g.userData.baseY = 0; return g;
    },
    bridge: function () {
      var g = new T.Group();
      var mat = new T.MeshStandardMaterial({ color: C(0xaeb2b8), roughness: 0.9, transparent: true });
      var slab = new T.Mesh(new T.BoxGeometry(35, 1.2, 10), mat); slab.position.y = 7.6; slab.castShadow = true; g.add(slab);
      [-1, 1].forEach(function (s) {
        var rail = new T.Mesh(new T.BoxGeometry(35, 0.7, 0.3), mat); rail.position.set(0, 8.5, s * 4.85); g.add(rail);
        g.add(bx(2.2, 7, 10, M.concrete, s * 16.4, 3.5, 0));
      });
      g.userData.mat = mat; g.userData.baseY = 0; return g;
    },
    wreck: function () {
      var w = buildEnemy('civ'), g = w.g;
      var h1 = glowSprite(0xffa020, 1.6, 0.9); h1.position.set(-0.7, 0.9, 2.35); g.add(h1);
      var h2 = glowSprite(0xffa020, 1.6, 0.9); h2.position.set(0.7, 0.9, 2.35); g.add(h2);
      var tri = new T.Mesh(new T.ConeGeometry(0.5, 0.8, 3), M.redTip); tri.position.set(0, 0.4, 5); g.add(tri);
      g.userData.blink = [h1, h2]; g.userData.body = w.body; g.userData.baseY = 0; return g;
    },
    /* one 20 m piece of underground road: walls and ceiling face inward only, so cameras above or beside the tunnel see into it */
    tseg: function () {
      var g = new T.Group();
      [-1, 1].forEach(function (s) {
        var wall = new T.Mesh(new T.PlaneGeometry(20, 6.8, 4, 1), M.tunWall); wall.rotation.y = -s * Math.PI / 2; wall.position.set(s * 8.45, 3.4, 0); g.add(wall);
        var lamp = new T.Mesh(new T.BoxGeometry(0.34, 0.07, 8), M.tunLamp); lamp.position.set(s * 3.4, 6.72, 0); g.add(lamp);
      });
      var ceil = new T.Mesh(new T.PlaneGeometry(16.9, 20, 1, 4), M.tunCeil); ceil.rotation.x = Math.PI / 2; ceil.position.y = 6.8; g.add(ceil);
      var pool = new T.Mesh(new T.PlaneGeometry(17, 19, 1, 4), tunPoolMat); pool.rotation.x = -Math.PI / 2; pool.position.y = 0.05; pool.renderOrder = -1; g.add(pool);
      g.userData.baseY = 0; return g;
    },
    tfan: function () {
      var g = new T.Group();
      g.add(cyl(0.5, 0.5, 2.6, 12, M.metal, 0, 5.9, 0, 'z')); g.add(bx(0.1, 0.5, 0.1, M.dark, 0, 6.55, 0.8)); g.add(bx(0.1, 0.5, 0.1, M.dark, 0, 6.55, -0.8));
      var sign = new T.Mesh(new T.PlaneGeometry(1.1, 0.5), M.exitGreen); sign.position.set(0, 5.0, 0); g.add(sign);
      g.userData.baseY = 0; return g;
    },
    portal: function () {
      var g = new T.Group(), mat = new T.MeshStandardMaterial({ color: C(0xaeb2b8), roughness: 0.9, transparent: true });
      var head = new T.Mesh(new T.BoxGeometry(19.6, 1.7, 1.4), mat); head.position.y = 7.65; head.castShadow = true; g.add(head);
      [-1, 1].forEach(function (s) { var p = new T.Mesh(new T.BoxGeometry(1.3, 6.8, 1.4), mat); p.position.set(s * 9.15, 3.4, 0); p.castShadow = true; g.add(p); });
      var sign = new T.Mesh(new T.PlaneGeometry(7.2, 1.2), textMat('한울 지하차도', '#ffffff', '#1a5fb4', 512, 86)); sign.position.set(0, 7.65, 0.72); g.add(sign);
      g.userData.mat = mat; g.userData.baseY = 0; return g;
    },
    gate: function () {
      var g = new T.Group(), ck = checkerMat();
      [-1, 1].forEach(function (s) { g.add(bx(0.5, 7, 0.5, M.white, s * 9.0, 3.5, 0)); });
      var top = new T.Mesh(new T.BoxGeometry(18.5, 1.3, 0.3), ck); top.position.y = 6.9; g.add(top);
      var line = new T.Mesh(new T.PlaneGeometry(16.4, 2.2), ck); line.rotation.x = -Math.PI / 2; line.position.y = 0.03; g.add(line);
      g.userData.baseY = 0; return g;
    },
    gravel: function () {
      var g = new T.Group();
      [[-0.3, 0.1, 0.34], [0.32, -0.2, 0.3], [0.05, 0.4, 0.26], [-0.1, -0.45, 0.22]].forEach(function (p) {
        var rock = shadowed(new T.Mesh(new T.IcosahedronGeometry(p[2], 0), M.gravel)); rock.position.set(p[0], p[2] * 0.7, p[1]); g.add(rock);
      });
      g.userData.baseY = 0; return g;
    },
    fire: function () {
      var g = new T.Group(), mat = fireStripMat.clone();
      var m = new T.Mesh(new T.PlaneGeometry(3.3, 36, 1, 8), mat); m.rotation.x = -Math.PI / 2; m.position.y = 0.07; m.renderOrder = -1; g.add(m);
      g.userData.mat = mat; g.userData.baseY = 0; return g;
    },
    /* one 20 m piece of the elevated half of a split road, built with the deck on the left; mirrored for a deck on the right */
    sdeck: function () {
      var g = new T.Group(), face = new T.MeshStandardMaterial({ color: C(0xc4c7cc), roughness: 0.9, side: T.DoubleSide, emissive: C(0x3a3d44) }), belly = new T.MeshStandardMaterial({ color: C(0x9a9da3), roughness: 1, side: T.DoubleSide, emissive: C(0x4a4d55) });
      [0.2, -8.11].forEach(function (x) { var f = new T.Mesh(new T.PlaneGeometry(20, 2.3, 4, 1), face); f.rotation.y = Math.PI / 2; f.position.set(x, -0.25, 0); g.add(f); });
      g.add(bx(0.2, 0.9, 20, M.concrete, 0.08, 0.45, 0)); g.add(bx(0.22, 0.9, 20, M.concrete, -7.995, 0.45, 0));
      var under = new T.Mesh(new T.PlaneGeometry(8.31, 20, 1, 4), belly); under.rotation.x = Math.PI / 2; under.position.set(-3.955, -1.4, 0); g.add(under);
      g.add(bx(1.4, H_SPLIT, 1.4, M.concrete, -3.955, -1.4 - H_SPLIT / 2, 0));
      g.userData.baseY = 0; return g;
    },
    busstop: function () { return stopProp('bus', 1); }, busstopL: function () { return stopProp('bus', -1); },
    taxistand: function () { return stopProp('taxi', 1); }, taxistandL: function () { return stopProp('taxi', -1); },
    junk: function () {
      var g = new T.Group();
      var tire = shadowed(new T.Mesh(new T.TorusGeometry(0.34, 0.14, 6, 10), M.tire)); tire.rotation.x = Math.PI / 2; tire.position.set(-0.4, 0.15, 0.2); g.add(tire);
      g.add(bx(0.7, 0.5, 0.6, M.dirt, 0.4, 0.25, -0.2)); g.add(bx(0.5, 0.2, 0.9, M.dark, 0.1, 0.1, 0.8));
      g.userData.baseY = 0; return g;
    }
  };
  /* bus stop or taxi stand: a shelter and waiting people on the pavement, a marked bay on the shoulder. s = which side of the road it stands on */
  function person(x, f, hex) {
    var g = new T.Group(), mat = std(hex, 0.8);
    g.add(bx(0.36, 0.56, 0.24, mat, 0, 1.06, 0)); g.add(bx(0.3, 0.78, 0.22, M.dark, 0, 0.39, 0));
    var head = shadowed(new T.Mesh(new T.SphereGeometry(0.15, 8, 6), std(0xe8c39e, 0.8))); head.position.y = 1.5; g.add(head);
    g.position.set(x, 0, -f); return g;
  }
  function flatText(text, fg, bg, w, l) {
    var m = new T.Mesh(new T.PlaneGeometry(w, l), textMat(text, fg, bg, 256, Math.round(256 * l / w))); m.rotation.x = -Math.PI / 2; return m;
  }
  function stopProp(kind, s) {
    var g = new T.Group(), bus = kind === 'bus', col = bus ? 0x1a5fb4 : 0xf2b01e, sign = new T.MeshBasicMaterial({ color: C(col) }), bay = -s * 2.85, len = bus ? 15 : 9, i;
    /* the bay: a yellow outline and a word on the shoulder */
    [-1, 1].forEach(function (e) { var ln = new T.Mesh(new T.PlaneGeometry(0.14, len), M.sign); ln.rotation.x = -Math.PI / 2; ln.position.set(bay + e * 1.35, 0.02, 0); g.add(ln); });
    [-1, 1].forEach(function (e) { var ln = new T.Mesh(new T.PlaneGeometry(2.84, 0.14), M.sign); ln.rotation.x = -Math.PI / 2; ln.position.set(bay, 0.02, e * len / 2); g.add(ln); });
    var word = flatText(bus ? '버스' : '택시', '#ffc21a', '#3a3e46', 2.2, 1.1); word.position.set(bay, 0.021, len / 2 - 1.6); g.add(word);
    /* shelter */
    var deep = bus ? 4.6 : 2.6;
    g.add(bx(1.9, 0.12, deep, M.dark, s * 0.2, 2.5, 0)); g.add(bx(0.06, 2.0, deep - 0.3, M.glass, s * 1.05, 1.4, 0));
    [-1, 1].forEach(function (e) { g.add(bx(0.1, 2.5, 0.1, M.pole, s * 1.05, 1.25, e * (deep / 2 - 0.1))); g.add(bx(0.1, 2.5, 0.1, M.pole, -s * 0.65, 1.25, e * (deep / 2 - 0.1))); });
    if (bus) g.add(bx(0.4, 0.08, 2.6, M.metal, s * 0.7, 0.5, 0));
    var board = new T.Mesh(new T.PlaneGeometry(deep - 0.4, 0.5), textMat(bus ? '버스 정류장' : '택시 승강장', bus ? '#ffffff' : '#15171a', bus ? '#1a5fb4' : '#f2b01e', 384, Math.round(384 * 0.5 / (deep - 0.4))));
    board.rotation.y = -s * Math.PI / 2; board.position.set(-s * 0.76, 2.82, 0); g.add(board);
    g.add(bx(0.06, 0.56, deep - 0.3, sign, -s * 0.72, 2.82, 0));
    /* sign pole at the head of the bay */
    g.add(cyl(0.05, 0.05, 2.8, 6, M.pole, -s * 0.9, 1.4, deep / 2 + 1.4));
    var disc = cyl(0.36, 0.36, 0.05, 14, sign, -s * 0.9, 2.9, deep / 2 + 1.4, 'z'); g.add(disc);
    var cap = new T.Mesh(new T.PlaneGeometry(0.5, 0.26), textMat(bus ? 'BUS' : 'TAXI', bus ? '#ffffff' : '#15171a', bus ? '#1a5fb4' : '#f2b01e', 128, 64)); cap.position.set(-s * 0.9, 2.9, -(deep / 2 + 1.4) + 0.03); g.add(cap);
    /* people waiting */
    var cols = [0xd9480f, 0x2c3e66, 0x4a9a6a, 0xf2b01e, 0x8e1b2c, 0x9aa0a6];
    for (i = 0; i < (bus ? 4 : 2); i++) g.add(person(-s * (0.2 + (i % 2) * 0.5), (i - 1.5) * (bus ? 0.9 : 0.7), cols[(i * 5 + (bus ? 0 : 2)) % cols.length]));
    g.userData.baseY = 0; return g;
  }
  function addProp(type, d, x, o) {
    var pool = propPool[type] || (propPool[type] = []);
    var p = pool.pop();
    if (!p) { p = { type: type, m: bake(BUILD[type]()) }; scene.add(p.m); }
    p.d = d; p.x = x; p.drop = !!(o && o.drop); p.solid = (o && o.solid) || null; p.hit = false; p.rh = 0;
    p.m.position.x = x; p.m.scale.x = (o && o.sx) || 1; p.m.rotation.y = (o && o.ry) || 0; p.m.visible = true;
    props.push(p);
    return p;
  }
  function releaseProp(i) { var p = props[i]; p.m.visible = false; propPool[p.type].push(p); props.splice(i, 1); }
  function genShoulder(dA, dB) {
    [-1, 1].forEach(function (s) {
      for (var d = dA + rrnd(25, 70); d < dB - 10; d += rrnd(80, 150)) {
        if (stops.some(function (st) { return st.side === s && Math.abs(st.d - d) < 30; })) continue;
        if (region.edge) { var ek = region.edge[rr() < 0.6 ? 0 : 1]; addProp(ek, d, s * (9.85 + rrnd(-0.4, 0.4)), { drop: true, ry: rrnd(0, 3), solid: EDGE_SOLID[ek] }); }
        else if (rr() < 0.6) addProp('wreck', d, s * 9.85, { drop: true, ry: rrnd(-0.12, 0.12), solid: { hw: 1.0, hl: 2.3, kind: 'wreck' } });
        else addProp('junk', d, s * (9.85 + rrnd(-0.4, 0.4)), { drop: true, ry: rrnd(0, 3), solid: { hw: 0.8, hl: 0.9, kind: 'junk' } });
      }
    });
  }
  function genWork(d0) {
    var side = rr() < 0.5 ? -1 : 1, width = rr() < 0.45 ? 8.1 : 4.1, d1 = d0 + rrnd(150, 210), t, i = 0;
    sections.push({ type: 'work', d0: d0, d1: d1, side: side, width: width });
    for (t = 0; t <= 36; t += 3) addProp('cone', d0 + t, side * (8.1 - width * (t / 36)));
    for (t = 0; t <= 14; t += 3.5) addProp('cone', d1 - t, side * (8.1 - width * (t / 14)));
    addProp('arrow', d0 + 40, side * (8.1 - width / 2), { sx: -side });
    for (t = d0 + 40; t < d1 - 16; t += 7, i++) {
      addProp(i % 2 ? 'barrier' : 'barrierW', t, side * (8.1 - width));
      addProp(i % 2 ? 'barrierW' : 'barrier', t, side * 8.15);
    }
    for (t = d0 + 62, i = 0; t < d1 - 24; t += 34, i++) addProp(i % 2 ? 'digger' : 'pile', t, side * (8.1 - width / 2) + rrnd(-0.5, 0.5), { ry: rrnd(-0.4, 0.4) });
    genShoulder(d0, d1);
    return d1;
  }
  function genDeck(d0) {
    var d1 = d0 + rrnd(260, 340), t;
    sections.push({ type: 'deck', d0: d0, d1: d1 });
    [-1, 1].forEach(function (s) {
      for (t = -30; t <= 10; t += 4) addProp('cone', d0 + t, s * (11.2 - 2.9 * ((t + 30) / 40)));
      for (t = d0 + 12; t < d1 - 6; t += 12) addProp('parapet', t, s * 8.5);
      for (t = d0 + 40; t < d1 - 30; t += 40) addProp('pier', t, s * 6.4);
    });
    return d1;
  }
  function genUnder(d0) {
    var d1 = d0 + 175;
    sections.push({ type: 'under', d0: d0, d1: d1 });
    [30, 88, 146].forEach(function (off) {
      var d = d0 + off, lane = rpick([-6, -2, 2, 6]);
      addProp('bridge', d, 0);
      addProp('pillar', d, lane, { solid: { hw: 0.6, hl: 0.7, kind: 'pillar' } });
      addProp('pillar', d, -8.1, { solid: { hw: 0.6, hl: 0.7, kind: 'pillar' } });
      addProp('pillar', d, 8.1, { solid: { hw: 0.6, hl: 0.7, kind: 'pillar' } });
      if (rr() < 0.4) { var l2 = lane > 0 ? lane - 8 : lane + 8; addProp('pillar', d, l2, { solid: { hw: 0.6, hl: 0.7, kind: 'pillar' } }); }
    });
    genShoulder(d0, d1);
    return d1;
  }
  /* a hill section is a crest (up, then down) or a dip (down, then up) on an otherwise ordinary stretch of road */
  function genHill(d0) {
    var up = rr() < 0.6 ? 1 : -1, g = rpick(roadCfg.grade || region.grade || [0.08, 0.1, 0.12]), len = rrnd(150, 190), flat = rrnd(30, 60), d1 = d0 + len * 2 + flat + 40;
    addSlope(d0 + 20, len, up * g); addSlope(d0 + 20 + len + flat, len, -up * g);
    sections.push({ type: 'hill', d0: d0, d1: d1, up: up, g: g });
    genShoulder(d0, d1);
    return d1;
  }
  /* underground road: a ramp down, walls and a ceiling with no shoulders, stalled cars in the lanes, then a ramp back up. Nothing can attack from the air inside */
  function genTunnel(d0) {
    var len = Math.round((roadCfg.tunnel ? rrnd(roadCfg.tunnel[0], roadCfg.tunnel[1]) : rrnd(300, 400)) / 20) * 20, d1 = d0 + len, t, i;
    sections.push({ type: 'tunnel', d0: d0, d1: d1 });
    addSlope(d0 - 20, 110, -0.07); addSlope(d1 - 90, 110, 0.07);
    [-1, 1].forEach(function (s) { for (t = -30; t <= 6; t += 4) addProp('cone', d0 + t, s * (11.2 - 2.9 * ((t + 30) / 36))); });
    addProp('portal', d0, 0); addProp('portal', d1, 0, { ry: Math.PI });
    for (t = d0 + 10; t < d1; t += 20) addProp('tseg', t, 0);
    for (t = d0 + 50, i = 0; t < d1 - 30; t += 80, i++) addProp('tfan', t, i % 2 ? 3.4 : -3.4);
    for (t = d0 + rrnd(70, 110); t < d1 - 50; t += rrnd(90, 150) / (roadCfg.wrecks || 1)) addProp('wreck', t, rpick([-6, -2, 2, 6]), { ry: rrnd(-0.1, 0.1), solid: { hw: 1.0, hl: 2.3, kind: 'wreck' } });
    return d1;
  }
  /* split road: after a gore marked with cones the carriageway divides for 300 to 400 m; a parapet and the height difference keep the two halves apart */
  function genSplit(d0) {
    var deck = rr() < 0.5 ? -1 : 1, d1 = d0 + Math.round(rrnd(320, 400) / 20) * 20, t;
    sections.push({ type: 'split', d0: d0, d1: d1, deck: deck });
    for (t = 0; t <= 30; t += 3) addProp('cone', d0 + t, 0);
    for (t = -30; t <= 10; t += 4) addProp('cone', d0 + t, deck * (11.2 - 2.9 * ((t + 30) / 40)));
    for (t = d0 + 40; t < d1 - 25; t += 20) addProp('sdeck', t, 0, { sx: -deck });
    genShoulder(d0, d1);
    return d1;
  }
  var ROAD_ORDER = ['hill', 'work', 'tunnel', 'split', 'hill', 'under', 'deck'], roadOrder = ROAD_ORDER, roadCfg = {};
  function genSections() {
    while (genD < dist + 470) {
      var gap = roadCfg.gap ? rrnd(roadCfg.gap[0], roadCfg.gap[1]) : rrnd(80, 130);
      sections.push({ type: 'normal', d0: genD, d1: genD + gap });
      if (region.stops && gap > 84 && rr() < 0.6) {
        var sSide = rr() < 0.7 ? 1 : -1, sKind = rr() < 0.6 ? 'bus' : 'taxi', sD = genD + rrnd(34, gap - 34);
        stops.push({ d: sD, side: sSide, kind: sKind, plan: '' });
        addProp((sKind === 'bus' ? 'busstop' : 'taxistand') + (sSide < 0 ? 'L' : ''), sD, sSide * 12.7, { drop: true });
      }
      genShoulder(genD, genD + gap);
      genExtras(genD, genD + gap); genHoles(genD, genD + gap); if (region.gantry && gap > 80) addProp('gantry', genD + gap * 0.5, 0);
      genD += gap;
      var type = roadOrder[roadIdx++ % roadOrder.length];
      genD = (GEN[type] || genUnder)(genD);
    }
    while (sections.length && sections[0].d1 < dist - 120) sections.shift();
    while (stops.length && stops[0].d < dist - 60) stops.shift();
  }
  function resetRoad(first, cfg) {
    for (var i = props.length - 1; i >= 0; i--) releaseProp(i);
    roadCfg = cfg || {}; roadOrder = roadCfg.order || region.order || ROAD_ORDER; roadSeed = roadCfg.seed || 0; holeSeed = roadSeed ? (roadSeed ^ 0x5bd1e995) | 1 : 0; stops.length = 0;
    sections.length = 0; resetHills(); genD = dist + (roadCfg.lead || 130); roadIdx = first === undefined ? (roadSeed ? 0 : (Math.random() * roadOrder.length) | 0) : first;
    sections.push({ type: 'normal', d0: dist - 200, d1: genD });
    genSections();
  }

