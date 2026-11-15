  /* ---------- particles, debris, rings, pickups ---------- */
  var parts = [], ppool = { glow: [], smoke: [] };
  function spawnP(kind, x, y, z, vx, vy, vz, life, s0, s1, color, a0, drift) {
    if (color === COL.spark && typeof sparkAdd === 'function' && spkGeo) { sparkAdd(x, y, z, vx * 1.3, vy * 1.2, vz, life * 1.6); return; }   /* sparks are streaks now (js_fx3.js) */
    var p = ppool[kind].pop();
    if (!p) {
      p = { kind: kind, s: new T.Sprite(new T.SpriteMaterial({ map: kind === 'glow' ? texGlow : texSmoke, transparent: true, depthWrite: false, fog: false, blending: kind === 'glow' ? T.AdditiveBlending : T.NormalBlending })) };
      scene.add(p.s);
    }
    p.s.position.set(x, y, z); p.vx = vx; p.vy = vy; p.vz = vz; p.life = p.max = life; p.s0 = s0; p.s1 = s1; p.a0 = a0; p.drift = drift === undefined ? 1 : drift;
    p.s.material.color.copy(color); p.s.material.opacity = a0; p.s.scale.set(s0, s0, 1); p.s.visible = true;
    p.rs = kind === 'smoke' ? rnd(-0.9, 0.9) : 0; p.s.material.rotation = kind === 'smoke' ? rnd(0, 6.283) : 0;   /* smoke puffs turn slowly as they grow */
    parts.push(p);
  }
  var COL = { white: C(0xffffff), fire: C(0xff8a1f), fire2: C(0xffc93d), spark: C(0xffe08a), smokeL: C(0xe6e6e6), smokeD: C(0x35332f), blue: C(0x6fb4ff), orange: C(0xff7a1a), cyan: C(0x7fe9ff) };
  var tmpCol = new T.Color();
  function smokeColor(base) { return tmpCol.copy(base).multiplyScalar(1 - 0.82 * cur.night); }
  var debris = [], dpool = [], debrisGeo = new T.BoxGeometry(1, 1, 1);
  /* torn panels and chunks: a few jagged shapes, flat-shaded so every facet catches the light */
  var DEB_GEOS = [0, 1, 2, 3].map(function (k) {
    var g = k === 3 ? new T.BoxGeometry(1, 0.18, 1, 2, 1, 2) : new T.IcosahedronGeometry(0.62, 0), a, i, seen = {};
    if (g.index) g = g.toNonIndexed();
    a = g.attributes.position;
    for (i = 0; i < a.count; i++) {   /* the same corner moves the same way on every face that shares it, so the shard stays closed */
      var key = a.getX(i).toFixed(3) + ',' + a.getY(i).toFixed(3) + ',' + a.getZ(i).toFixed(3), o = seen[key] || (seen[key] = [rnd(0.6, 1.35), rnd(0.5, 1.3), rnd(0.6, 1.35)]);
      a.setXYZ(i, a.getX(i) * o[0] * (k === 1 ? 1.6 : 1), a.getY(i) * o[1] * (k === 2 ? 0.45 : 1), a.getZ(i) * o[2]);
    }
    g.computeVertexNormals(); return g;
  });
  function spawnDebris(x, y, z, mat, vzRel, hot) {
    var d = dpool.pop();
    if (!d) { d = { m: new T.Mesh(debrisGeo, mat) }; d.m.castShadow = true; scene.add(d.m); }
    d.m.geometry = DEB_GEOS[(Math.random() * DEB_GEOS.length) | 0];
    d.m.material = mat; d.m.visible = true; d.m.position.set(x, y, z);
    d.m.scale.set(rnd(0.3, 0.75), rnd(0.25, 0.6), rnd(0.3, 0.8));
    d.vx = rnd(-9, 9); d.vy = rnd(5, 13); d.vz = vzRel + rnd(-8, 8); d.rx = rnd(-10, 10); d.rz = rnd(-10, 10); d.life = rnd(1.4, 2.0);
    d.burn = hot && Math.random() < 0.45 ? rnd(0.8, 1.6) : 0; d.metal = mat === M.metal || mat === M.steel || mat === M.dark; d.trail = 0;
    debris.push(d);
  }
  var rings = [], ringGeo = new T.PlaneGeometry(2, 2); ringGeo.rotateX(-Math.PI / 2);
  var ringTex = radialTex([[0, 0], [0.5, 0], [0.74, 0.1], [0.88, 0.55], [0.95, 0.2], [1, 0]]);   /* soft on both edges: it reads as a shock wave, not as an outline */
  for (var ri = 0; ri < 8; ri++) {
    var rm = new T.Mesh(ringGeo, new T.MeshBasicMaterial({ map: ringTex, color: C(0xffd9a0), blending: T.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0, fog: false }));
    rm.visible = false; scene.add(rm); rings.push({ m: rm, life: 0, max: 1, size: 1, vz: 0 });
  }
  function spawnRing(x, z, size, life, vz, color) {
    for (var i = 0; i < rings.length; i++) if (rings[i].life <= 0) {
      var r = rings[i]; r.life = r.max = life; r.size = size; r.vz = vz; r.m.position.set(x, 0.08, z); r.m.material.color.copy(color); r.m.visible = true; return;
    }
  }
  var ringWarm = C(0xffa64a);
  var flashes = [];
  for (var fi = 0; fi < 2; fi++) { var pl = legacy(new T.PointLight(0xffa040, 0, 34, 1.6)); scene.add(pl); flashes.push(pl); }
  var flashIdx = 0, shake = 0;
  var scraps = [], spool = [], scrapGeo = new T.TorusGeometry(0.24, 0.1, 5, 6);
  function spawnScrap(x, y, z, vzRel) {
    var s = spool.pop();
    if (!s) { s = { m: new T.Mesh(scrapGeo, M.gold) }; s.m.castShadow = true; scene.add(s.m); }
    s.m.visible = true; s.m.position.set(x, y, z); s.vx = rnd(-5, 5); s.vy = rnd(6, 10); s.vz = vzRel + rnd(-4, 4); s.age = 0;
    scraps.push(s);
  }
  function explode(x, y, z, size, vzRel, bodyMat) {
    var i;
    spawnP('glow', x, y, z, 0, 0, vzRel, 0.22, 3 * size, 11 * size, COL.white, 1);
    /* the fireball itself (js_fx3.js): a big one and a smaller, later one off to the side */
    fireball(x, y + 0.6 * size, z, 1.25 * size, vzRel, 0, 1);
    fireball(x + rnd(-0.9, 0.9) * size, y + 1.1 * size, z + rnd(-0.8, 0.8) * size, 0.8 * size, vzRel, 0.09, 0.8);
    for (i = 0; i < 6; i++) spawnP('glow', x + rnd(-0.6, 0.6) * size, y + rnd(0, 0.8), z + rnd(-0.6, 0.6) * size, rnd(-7, 7), rnd(2, 9), vzRel + rnd(-6, 6), rnd(0.35, 0.6), rnd(2.2, 3.6) * size, 0.4, i % 2 ? COL.fire : COL.fire2, 0.85);
    for (i = 0; i < 7; i++) spawnP('smoke', x + rnd(-0.8, 0.8) * size, y + rnd(0.6, 1.6), z + rnd(-0.8, 0.8) * size, rnd(-2, 2), rnd(2.5, 5.5), vzRel + rnd(-2, 2), rnd(1.1, 1.8), 1.8 * size, 6 * size, smokeColor(COL.smokeD), 0.72, 0.6);
    sparks(x, y + 0.4, z, 34 * Math.min(size, 2), 17, vzRel);
    if (y < 3) scorch(x, z, Math.min(size, 2));
    var n = Math.round(8 * Math.min(size, 2));
    for (i = 0; i < n; i++) spawnDebris(x, y, z, i % 3 === 0 ? M.dark : (i % 3 === 1 ? bodyMat : M.metal), vzRel, true);
    spawnRing(x, z, 5 * size, 0.32, vzRel, ringWarm);
    var fl = flashes[flashIdx++ % flashes.length]; fl.position.set(x, y + 2, z); fl.intensity = 5 * Math.min(size, 2);
    shake = Math.min(1.2, shake + 0.45 * size);
  }

