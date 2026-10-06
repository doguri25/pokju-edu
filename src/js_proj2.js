  /* ---------- projectiles: one pooled bullet mesh, five kinds ---------- */
  var bullets = [], bpool = [], bulletGeo = new T.BoxGeometry(0.14, 0.14, 1.7);
  function bkind(o) { o.mat = new T.MeshBasicMaterial({ color: o.color, fog: false }); o.glowCol = C(o.glow); return o; }
  var BK = {
    bullet: bkind({ speed: 95, dmg: 1, minZ: -48, color: 0xfff3b8, glow: 0xffb53d, sx: 1, sz: 1 }),
    shell: bkind({ speed: 95, dmg: 5, pierce: true, minZ: -48, color: 0xfff3b8, glow: 0xffb53d, sx: 2.4, sz: 1.3 }),
    pellet: bkind({ speed: 95, dmg: 1, minZ: -34, color: 0xfff3b8, glow: 0xffb53d, sx: 1, sz: 0.6 }),
    laser: bkind({ speed: 170, dmg: 1.6, pierce: true, minZ: -72, color: 0xe2fcff, glow: 0x35d8ff, sx: 0.9, sz: 2.6 }),
    water: bkind({ speed: 60, dmg: 1, pierce: true, push: 2.2, minZ: -30, color: 0xd6eeff, glow: 0x2f8fe0, sx: 2.8, sz: 0.8 })
  };
  function droneInLine(x) {
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (e.cfg.air && Math.abs(e.g.position.x - x) < 1.4 && e.g.position.z < -6 && e.g.position.z > -46) return e;
    }
    return null;
  }
  function fireBullet(x, y, z, kind, vx, mul) {
    var b = bpool.pop(), K = BK[kind];
    if (!b) { b = { m: new T.Mesh(bulletGeo, K.mat), hits: [] }; b.g = glowSprite(0xffb53d, 1.5, 0.9); b.g.scale.set(1.1, 2.6, 1); b.m.add(b.g); scene.add(b.m); }
    b.m.material = K.mat; b.g.material.color.copy(K.glowCol);
    b.m.visible = true; b.m.position.set(x, y, z); b.hits.length = 0;
    b.K = K; b.dmg = K.dmg * (mul || 1); b.vx = vx || 0;
    b.m.scale.set(K.sx, K.sx, K.sz);
    b.m.rotation.y = b.vx ? -Math.atan2(b.vx, K.speed) : 0;
    var dr = b.vx ? null : droneInLine(x);
    b.vy = dr ? (4.5 - y) / ((z - dr.g.position.z) / K.speed) : 0;
    bullets.push(b);
  }
  function updBullets(dt) {
    var i, k, e, p, b;
    for (i = bullets.length - 1; i >= 0; i--) {
      b = bullets[i]; p = b.m.position;
      p.z -= b.K.speed * dt; p.x += b.vx * dt;
      if (b.vy > 0) p.y = Math.min(4.7, p.y + b.vy * dt); else if (p.y > 1.15) p.y -= 7 * dt;
      var gone = p.z < b.K.minZ || Math.abs(p.x) > 11;
      if (!gone && crate.active && b.hits.indexOf(crate) < 0 && Math.abs(p.x - crate.g.position.x) < 1.0 && Math.abs(p.z - crate.g.position.z) < 1.6 && p.y < 3) {
        b.hits.push(crate); crateHit(b.dmg); if (!b.K.pierce) gone = true;
      }
      if (!gone && quizShot(p, b) && !b.K.pierce) gone = true;
      for (k = enemies.length - 1; k >= 0 && !gone; k--) {
        e = enemies[k];
        if (e.cfg.civ || (e.cfg.air ? p.y < 3.2 : p.y > 3.4)) continue;
        if (b.hits.indexOf(e) >= 0) continue;
        if (Math.abs(p.x - e.g.position.x) < e.cfg.hw + 0.12 && Math.abs(p.z - e.g.position.z) < e.cfg.hl + 0.9) {
          b.hits.push(e);
          if (b.K.push && !e.cfg.air && !e.cfg.boss) e.g.position.z -= b.K.push;
          hitEnemy(k, b.dmg, p.x, p.y, p.z); if (!b.K.pierce) gone = true;
        }
      }
      if (gone) { b.m.visible = false; bpool.push(b); bullets.splice(i, 1); }
    }
  }
  function crateHit(d) {
    crate.dmg += d;
    if (crate.dmg >= 6) {
      setCrateItem((crate.item + 1) % ITEMS.length); sfx('cycle');
      spawnP('glow', crate.g.position.x, 1.3, crate.g.position.z, 0, 0, 0, 0.2, 2, 5, ITEMS[crate.item].col, 0.9, 0);
    }
  }
  var ebullets = [], ebpool = [], ebGeo = new T.SphereGeometry(0.26, 8, 6), ebMat = new T.MeshBasicMaterial({ color: 0xff8a2a, fog: false });
  function fireEnemyBullet(x, y, z, tx, tz, speed) {
    var b = ebpool.pop();
    if (!b) { b = { m: new T.Mesh(ebGeo, ebMat) }; b.m.add(glowSprite(0xff6a1a, 2.4, 0.9)); scene.add(b.m); }
    var dx = tx - x, dz2 = tz - z, d = Math.sqrt(dx * dx + dz2 * dz2) || 1;
    b.vx = dx / d * speed; b.vz = dz2 / d * speed; b.m.visible = true; b.m.position.set(x, y, z); ebullets.push(b);
    b.rocket = false; b.trail = 0; b.m.scale.setScalar(1);
    return b;
  }
  function clearEnemyBullets() { for (var i = 0; i < ebullets.length; i++) { ebullets[i].m.visible = false; ebpool.push(ebullets[i]); } ebullets.length = 0; }

  /* ---------- homing missiles ---------- */
  var missiles = [], mpool = [];
  function buildMissile() {
    var g = new T.Group();
    var body = new T.Mesh(new T.CylinderGeometry(0.13, 0.13, 1.0, 8), M.white); body.geometry.rotateX(Math.PI / 2); body.castShadow = true; g.add(body);
    var nose = new T.Mesh(new T.ConeGeometry(0.13, 0.36, 8), M.redTip); nose.geometry.rotateX(Math.PI / 2); nose.position.z = 0.68; g.add(nose);
    var fin = new T.Mesh(new T.BoxGeometry(0.5, 0.04, 0.26), M.dark); fin.position.z = -0.4; g.add(fin);
    var fin2 = new T.Mesh(new T.BoxGeometry(0.04, 0.5, 0.26), M.dark); fin2.position.z = -0.4; g.add(fin2);
    var fl = glowSprite(0xffb03d, 2.4, 1); fl.position.z = -0.75; g.add(fl);
    scene.add(g);
    return { g: g, vel: new T.Vector3(), age: 0, trail: 0, target: null, dmg: 8 };
  }
  function fireMissile(x, y, z, side, mul) {
    var m = mpool.pop() || buildMissile();
    m.g.visible = true; m.g.position.set(x, y, z); m.vel.set(side * 7, 9, -14); m.age = 0; m.trail = 0; m.target = null; m.dmg = 8 * (mul || 1);
    missiles.push(m);
    for (var k = 0; k < 4; k++) spawnP('smoke', x, y, z + 0.6, rnd(-1.5, 1.5), rnd(0.5, 2), rnd(4, 10), 0.6, 0.7, 2.4, smokeColor(COL.smokeL), 0.6, 0.5);
    return m;
  }
  function pickTarget() {
    var best = null, bestV = -1e9;
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i], z = e.g.position.z;
      if (e.cfg.civ || z > -4 || z < -75) continue;
      var v = (e.cfg.air ? 300 : 0) + e.hp * 12 + z;
      for (var k = 0; k < missiles.length; k++) if (missiles[k].target === e) v -= 150;
      if (v > bestV) { bestV = v; best = e; }
    }
    return best;
  }
  function updMissiles(dt) {
    var i, k, p, m;
    for (i = missiles.length - 1; i >= 0; i--) {
      m = missiles[i]; p = m.g.position; m.age += dt;
      if (!m.target || enemies.indexOf(m.target) < 0) m.target = m.age > 0.22 ? pickTarget() : null;
      var speed = Math.min(52, 22 + m.age * 60);
      if (m.target) v3.set(m.target.g.position.x, m.target.cfg.y, m.target.g.position.z).sub(p).normalize().multiplyScalar(speed);
      else v3.set(0, m.age > 0.22 ? -0.04 : 0.5, -1).normalize().multiplyScalar(speed);
      m.vel.lerp(v3, 1 - Math.exp(-dt * (m.age > 0.22 ? 7 : 1.5)));
      p.addScaledVector(m.vel, dt);
      m.g.lookAt(v3.copy(p).add(m.vel));
      m.trail -= dt;
      if (m.trail <= 0) { m.trail = 0.022; spawnP('smoke', p.x, p.y, p.z, rnd(-0.6, 0.6), rnd(0.2, 1), rnd(-1, 1), 0.75, 0.55, 1.9, smokeColor(COL.smokeL), 0.55, 0.45); }
      var boom = false;
      if (m.target) {
        var tp = m.target.g.position, dx = p.x - tp.x, dy = p.y - m.target.cfg.y, dz3 = p.z - tp.z, rr = m.target.cfg.boss ? 14 : 3.2;
        if (dx * dx + dy * dy + dz3 * dz3 < rr) {
          k = enemies.indexOf(m.target);
          explode(p.x, p.y, p.z, 0.75, veff * 0.4, M.dark);
          hitEnemy(k, m.dmg, p.x, p.y, p.z); boom = true;
        }
      }
      if (!boom && p.y < 0.25) { explode(p.x, 0.4, p.z, 0.7, veff, M.dark); boom = true; }
      if (boom || m.age > 3.2 || p.z < -140) { if (trackM === m) trackM = null; m.g.visible = false; mpool.push(m); missiles.splice(i, 1); }
    }
  }

  /* ---------- lightning bolts: a jagged flat ribbon between two points ---------- */
  var bolts = [], BOLT_N = 8;
  var boltMat = new T.MeshBasicMaterial({ color: C(0xbff4ff), blending: T.AdditiveBlending, transparent: true, depthWrite: false, side: T.DoubleSide, fog: false });
  for (var bo = 0; bo < 12; bo++) {
    var bg = new T.BufferGeometry();
    bg.setAttribute('position', new T.BufferAttribute(new Float32Array(BOLT_N * 2 * 3), 3));
    var idx = [];
    for (var q = 0; q < BOLT_N - 1; q++) idx.push(2 * q, 2 * q + 1, 2 * q + 2, 2 * q + 1, 2 * q + 3, 2 * q + 2);
    bg.setIndex(idx);
    var bm = new T.Mesh(bg, boltMat.clone()); bm.frustumCulled = false; bm.visible = false; scene.add(bm);
    bolts.push({ m: bm, life: 0 });
  }
  function zap(a, b) {
    for (var i = 0; i < bolts.length; i++) if (bolts[i].life <= 0) {
      var bolt = bolts[i], pos = bolt.m.geometry.attributes.position;
      var nx = -(b.z - a.z), nz = b.x - a.x, nl = Math.sqrt(nx * nx + nz * nz) || 1; nx /= nl; nz /= nl;
      for (var k = 0; k < BOLT_N; k++) {
        var t = k / (BOLT_N - 1), j = (k === 0 || k === BOLT_N - 1) ? 0 : rnd(-0.8, 0.8);
        var x = lerp(a.x, b.x, t) + nx * j, y = lerp(a.y, b.y, t) + (j ? rnd(-0.3, 0.3) : 0), z = lerp(a.z, b.z, t) + nz * j;
        pos.setXYZ(2 * k, x + nx * 0.17, y, z + nz * 0.17); pos.setXYZ(2 * k + 1, x - nx * 0.17, y, z - nz * 0.17);
      }
      pos.needsUpdate = true; bolt.life = 0.1; bolt.m.visible = true; bolt.m.material.opacity = 1;
      spawnP('glow', b.x, b.y, b.z, 0, 0, 0, 0.14, 2.6, 0.6, COL.cyan, 0.9, 0);
      return;
    }
  }

  /* ---------- mines: lobbed onto the road ahead, then fixed to the ground until something drives over them ---------- */
  var mines = [], minePool = [];
  function buildMine() {
    var g = new T.Group();
    g.add(cyl(0.42, 0.5, 0.2, 10, M.gun, 0, 0.1, 0));
    var cap = new T.Mesh(new T.CylinderGeometry(0.16, 0.16, 0.08, 8), M.tail); cap.position.y = 0.24; g.add(cap);
    var gl = glowSprite(0xff2a1a, 1.8, 0.8); gl.position.y = 0.4; g.add(gl);
    scene.add(g);
    return { g: g, gl: gl };
  }
  function throwMine(x, y, z, mul) {
    var m = minePool.pop() || buildMine();
    m.g.visible = true; m.g.position.set(x, y, z); m.vy = 8; m.vz = -(veff * 0.45 + 16); m.air = true; m.age = 0; m.dmg = 10 * (mul || 1);
    mines.push(m);
  }
  function updMines(dt) {
    var i, k, e, p, m;
    for (i = mines.length - 1; i >= 0; i--) {
      m = mines[i]; p = m.g.position; m.age += dt;
      if (m.air) {
        m.vy -= 26 * dt; p.y += m.vy * dt; p.z += m.vz * dt; m.g.rotation.x += 9 * dt;
        if (p.y <= 0) { p.y = 0; m.air = false; m.g.rotation.x = 0; }
      } else p.z += veff * dt;
      m.gl.material.opacity = 0.45 + 0.45 * Math.sin(m.age * 14);
      var boom = false;
      if (!m.air) for (k = 0; k < enemies.length; k++) {
        e = enemies[k];
        if (e.cfg.civ || e.cfg.air) continue;
        if (Math.abs(p.x - e.g.position.x) < e.cfg.hw + 0.5 && Math.abs(p.z - e.g.position.z) < e.cfg.hl + 0.6) { boom = true; break; }
      }
      if (boom) {
        explode(p.x, 0.5, p.z, 1.3, veff, M.dark);
        for (k = enemies.length - 1; k >= 0; k--) {
          e = enemies[k];
          if (e.cfg.civ || e.cfg.air) continue;
          var dx = e.g.position.x - p.x, dz = e.g.position.z - p.z;
          if (Math.abs(dx) < 4 + e.cfg.hw && Math.abs(dz) < 4 + e.cfg.hl) hitEnemy(k, m.dmg, e.g.position.x, e.cfg.y, e.g.position.z);
        }
      }
      if (boom || p.z > 14 || m.age > 9) { m.g.visible = false; minePool.push(m); mines.splice(i, 1); }
    }
  }

  /* ---------- bombs: ground-fixed markers used by bomber drones and air strikes ---------- */
  var bombs = [], bombPool = [];
  var markRingGeo = new T.RingGeometry(1.9, 2.25, 40); markRingGeo.rotateX(-Math.PI / 2);
  var markDiscGeo = new T.CircleGeometry(1.9, 32); markDiscGeo.rotateX(-Math.PI / 2);
  function makeBomb() {
    var g = new T.Group();
    var ring = new T.Mesh(markRingGeo, new T.MeshBasicMaterial({ color: 0xff2a1a, transparent: true, opacity: 0.95, depthWrite: false, fog: false }));
    var disc = new T.Mesh(markDiscGeo, new T.MeshBasicMaterial({ color: 0xff3a22, transparent: true, opacity: 0.55, depthWrite: false, fog: false }));
    ring.position.y = 0.07; disc.position.y = 0.06;
    var shell = new T.Group();
    var sb = new T.Mesh(new T.CylinderGeometry(0.22, 0.22, 0.8, 8), M.dark); sb.castShadow = true; shell.add(sb);
    var sn = new T.Mesh(new T.ConeGeometry(0.22, 0.4, 8), M.redTip); sn.rotation.x = Math.PI; sn.position.y = -0.6; shell.add(sn);
    g.add(ring); g.add(disc); g.add(shell); scene.add(g);
    return { g: g, disc: disc, ring: ring, shell: shell };
  }
  function dropBomb(x, z, fromY, T2, dmg) {
    var b = bombPool.pop() || makeBomb();
    b.t = 0; b.T = T2; b.fromY = fromY; b.dmg = dmg; b.fixed = false; b.R = 0; b.napalm = false; b.owner = null;
    b.g.position.set(x, 0, z); b.g.visible = true; b.g.scale.set(1, 1, 1); b.shell.visible = true; b.shell.position.y = fromY; b.disc.scale.set(0.01, 1, 0.01);
    bombs.push(b); if (fromY > 8 && live()) sfx('drop');
    return b;
  }
  var plane = new T.Group();
  (function () {
    plane.add(prof([[-4.5, -0.3], [4.2, -0.3], [5.4, 0.1], [4.0, 0.55], [-4.5, 0.45]], 1.3, M.plane, 0.08));
    var ws2 = new T.Shape(); ws2.moveTo(1.6, 0); ws2.lineTo(-2.6, 6.2); ws2.lineTo(-3.8, 6.2); ws2.lineTo(-3.2, 0); ws2.lineTo(-3.8, -6.2); ws2.lineTo(-2.6, -6.2); ws2.lineTo(1.6, 0);
    var wg = new T.ExtrudeGeometry(ws2, { depth: 0.16, bevelEnabled: false });
    wg.rotateX(Math.PI / 2); wg.rotateY(Math.PI / 2);
    var wing = new T.Mesh(wg, M.plane); wing.castShadow = true; wing.position.y = 0.2; plane.add(wing);
    plane.add(bx(0.14, 1.4, 1.4, M.plane, 0, 1.0, -3.7));
    var pg = glowSprite(0xff7a2a, 3, 0.9); pg.position.set(0, 0.1, 4.8); plane.add(pg);
    plane.visible = false; scene.add(plane);
  })();
  /* the bomber's shadow runs along the road just ahead of the bombs */
  var planeShadow = (function () {
    var sh = new T.Shape(), pts = [[0, 5.4], [0.65, 4], [0.65, 1.6], [6.2, -2.6], [6.2, -3.8], [0.65, -3.2], [0.65, -4.5], [-0.65, -4.5], [-0.65, -3.2], [-6.2, -3.8], [-6.2, -2.6], [-0.65, 1.6], [-0.65, 4]];
    sh.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) sh.lineTo(pts[i][0], pts[i][1]);
    var geo = new T.ShapeGeometry(sh); geo.rotateX(-Math.PI / 2);
    var m = new T.Mesh(geo, new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3, depthWrite: false }));
    m.visible = false; m.renderOrder = 2; scene.add(m);
    return m;
  })();
