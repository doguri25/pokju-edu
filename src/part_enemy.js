  function frontGlows(g, x, y, f) {
    [-x, x].forEach(function (sx) {
      g.add(bx(0.34, 0.14, 0.05, M.head, sx, y, f));
      var s = glowSprite(0xfff0c0, 1.7, 0); s.position.set(sx, y, -f - 0.15); g.add(s); nightGlows.push(s);
    });
  }
  function buildEnemy(type) {
    var g = new T.Group(), wheels = [], body = std(type === 'civ' ? pick(civColors) : (type === 'cbus' ? pick([0x2f6fd0, 0x3aa655]) : (type === 'taxi' ? pick([0xe8862a, 0xd9dde2]) : pick(enemyReds))), 0.45, 0.1), i;
    if (type === 'sedan' || type === 'civ' || type === 'taxi') {
      g.add(prof([[-2.2, 0.35], [2.2, 0.35], [2.25, 0.75], [1.9, 0.98], [-1.95, 0.98], [-2.25, 0.8]], 1.8, body, 0.06));
      g.add(prof([[-1.5, 0.98], [1.05, 0.98], [0.35, 1.5], [-1.0, 1.5]], 1.6, M.glass, 0.02));
      g.add(prof([[-1.0, 1.5], [0.35, 1.5], [0.3, 1.58], [-0.95, 1.58]], 1.64, body, 0.02));
      if (type === 'sedan') {
        g.add(cyl(0.26, 0.3, 0.24, 8, M.gun, 0, 1.7, -0.4));
        g.add(cyl(0.07, 0.07, 1.1, 6, M.dark, 0, 1.74, -1.0, 'z'));
        g.add(bx(1.95, 0.3, 0.16, M.dark, 0, 0.6, 2.32));
        g.add(bx(0.5, 0.05, 2.2, M.dark, 0, 1.0, 0.9));
      }
      if (type === 'taxi') {
        g.add(bx(0.5, 0.16, 0.22, new T.MeshBasicMaterial({ color: 0xffe14a }), 0, 1.68, 0.1));
        g.add(bx(1.82, 0.12, 2.6, M.dark, 0, 0.52, 0));
        g.userData.blink = [];
        [[0.95, 2.1], [0.95, -2.1], [-0.95, 2.1], [-0.95, -2.1]].forEach(function (q) { var bs = glowSprite(0xffa21a, 1.5, 0); bs.position.set(q[0], 0.85, -q[1]); g.add(bs); g.userData.blink.push(bs); });
      }
      frontGlows(g, 0.6, 0.7, 2.28);
      [-0.6, 0.6].forEach(function (x) { g.add(bx(0.42, 0.13, 0.06, M.tail, x, 0.84, -2.3)); });
      [[0.86, 1.35], [-0.86, 1.35], [0.86, -1.35], [-0.86, -1.35]].forEach(function (p) { g.add(wheel(0.37, 0.28, p[0], p[1], wheels)); });
    } else if (type === 'bike') {
      g.add(bx(0.3, 0.5, 1.5, M.dark, 0, 0.72, 0));
      g.add(wheel(0.36, 0.18, 0, 0.78, wheels)); g.add(wheel(0.36, 0.18, 0, -0.78, wheels));
      var torso = bx(0.52, 0.66, 0.4, body, 0, 1.28, -0.12); torso.rotation.x = -0.35; g.add(torso);
      var helm = shadowed(new T.Mesh(new T.IcosahedronGeometry(0.24, 0), body)); helm.position.set(0, 1.75, -0.12); g.add(helm);
      g.add(bx(0.7, 0.06, 0.06, M.metal, 0, 1.12, 0.55));
      g.add(bx(0.16, 0.1, 0.05, M.tail, 0, 0.9, -0.78));
    } else if (type === 'dump') {
      g.add(bx(2.3, 0.5, 7.2, M.dark, 0, 0.85, 0));
      g.add(prof([[1.6, 0.9], [3.6, 0.9], [3.6, 1.9], [1.6, 1.9]], 2.6, M.dark, 0.06));
      g.add(prof([[1.7, 1.9], [3.56, 1.9], [3.2, 2.65], [1.7, 2.65]], 2.46, M.glass, 0.02));
      g.add(prof([[1.6, 2.65], [3.25, 2.65], [3.18, 2.78], [1.6, 2.78]], 2.6, M.dark, 0.03));
      g.add(bx(2.8, 1.5, 4.9, body, 0, 1.95, -1.0));
      g.add(bx(2.9, 0.2, 5.0, M.dark, 0, 1.15, -1.0));
      for (i = 0; i < 9; i++) {
        var rock = shadowed(new T.Mesh(new T.IcosahedronGeometry(rnd(0.45, 0.75), 0), M.gravel));
        rock.position.set(rnd(-0.8, 0.8), 2.75 + rnd(0, 0.25), 1.0 + rnd(-1.9, 1.9)); g.add(rock);
      }
      g.add(bx(3.0, 0.5, 0.3, M.metal, 0, 0.9, 3.75));
      frontGlows(g, 0.95, 1.2, 3.65);
      [-0.95, 0.95].forEach(function (x) { g.add(bx(0.5, 0.2, 0.06, M.tail, x, 1.3, -3.52)); });
      [[1.2, 2.6], [-1.2, 2.6], [1.2, -1.3], [-1.2, -1.3], [1.2, -2.6], [-1.2, -2.6]].forEach(function (p) { g.add(wheel(0.58, 0.45, p[0], p[1], wheels)); });
    } else if (type === 'boss') {
      body = M.bossRed.clone();
      g.add(bx(2.7, 0.6, 9.4, M.dark, 0, 0.95, 0));
      g.add(prof([[2.6, 1.0], [4.7, 1.0], [4.7, 2.2], [2.6, 2.2]], 3.0, body, 0.06));
      g.add(prof([[2.7, 2.2], [4.66, 2.2], [4.25, 3.0], [2.7, 3.0]], 2.84, M.glass, 0.02));
      g.add(prof([[2.6, 3.0], [4.3, 3.0], [4.22, 3.14], [2.6, 3.14]], 3.0, body, 0.03));
      g.add(cyl(1.55, 1.55, 6.6, 14, M.steel, 0, 2.75, -1.1, 'z'));
      [-3.6, -1.1, 1.4].forEach(function (f) { g.add(cyl(1.6, 1.6, 0.35, 14, body, 0, 2.75, f, 'z')); });
      [-1.0, 1.0].forEach(function (x) {
        g.add(cyl(0.34, 0.4, 0.3, 8, M.gun, x, 4.4, -3.6));
        g.add(cyl(0.09, 0.09, 1.3, 6, M.dark, x, 4.5, -4.3, 'z'));
      });
      g.add(bx(3.3, 0.6, 0.3, M.metal, 0, 1.0, 4.85));
      [-1.1, 1.1].forEach(function (x) { g.add(bx(0.6, 0.24, 0.06, M.tail, x, 1.4, -4.72)); var tg = glowSprite(0xff2a1a, 2.2, 0.7); tg.position.set(x, 1.4, 4.8); g.add(tg); });
      [[1.4, 3.6], [-1.4, 3.6], [1.4, -1.6], [-1.4, -1.6], [1.4, -2.9], [-1.4, -2.9], [1.4, -4.1], [-1.4, -4.1]].forEach(function (p) { g.add(wheel(0.62, 0.5, p[0], p[1], wheels)); });
    } else if (type === 'cbus') {
      /* city bus: long low-floor body, window band, two doors on the kerb side, route board */
      g.add(bx(2.44, 2.5, 10.4, body, 0, 1.75, 0));
      g.add(bx(2.48, 0.95, 8.9, M.glass, 0, 2.2, -0.2));
      g.add(bx(2.3, 1.3, 0.06, M.glass, 0, 2.0, 5.19)); g.add(bx(2.3, 0.9, 0.06, M.glass, 0, 2.3, -5.19));
      g.add(bx(1.5, 0.34, 0.08, new T.MeshBasicMaterial({ color: 0xffb53d }), 0, 2.82, 5.2));
      g.add(bx(2.0, 0.26, 4.4, M.white, 0, 3.12, -1.0));
      g.add(bx(2.5, 0.3, 10.44, M.dark, 0, 0.62, 0));
      [3.4, -1.2].forEach(function (f) { g.add(bx(0.05, 1.9, 1.1, M.dark, 1.23, 1.55, f)); });
      frontGlows(g, 0.85, 0.85, 5.2);
      [-0.9, 0.9].forEach(function (x) { g.add(bx(0.4, 0.18, 0.06, M.tail, x, 1.0, -5.21)); });
      g.userData.blink = [];
      [[1.25, 4.9], [1.25, -4.9], [-1.25, 4.9], [-1.25, -4.9]].forEach(function (q) { var bs = glowSprite(0xffa21a, 2.0, 0); bs.position.set(q[0], 1.0, -q[1]); g.add(bs); g.userData.blink.push(bs); });
      [[1.05, 3.4], [-1.05, 3.4], [1.05, -3.0], [-1.05, -3.0]].forEach(function (p) { g.add(wheel(0.48, 0.34, p[0], p[1], wheels)); });
    } else if (type === 'tractor') {
      /* 경운기: a walking tractor pulling a cart, the slow vehicle of country roads */
      body = std(pick([0xc5221f, 0x2f6fb5, 0x3f8a5a]), 0.6, 0.1);
      g.add(bx(0.7, 0.55, 1.0, body, 0, 0.78, 1.3)); g.add(bx(0.32, 0.2, 0.34, M.dark, 0, 1.15, 1.5));
      g.add(cyl(0.05, 0.05, 0.5, 6, M.dark, 0.22, 1.3, 1.05));
      [-0.3, 0.3].forEach(function (x) { g.add(bx(0.07, 0.07, 1.3, M.metal, x, 1.02, 0.35)); });
      g.add(bx(1.5, 0.12, 2.0, M.trunk, 0, 0.75, -0.9));
      [-0.75, 0.75].forEach(function (x) { g.add(bx(0.08, 0.4, 2.0, M.trunk, x, 0.98, -0.9)); });
      g.add(bx(1.5, 0.4, 0.08, M.trunk, 0, 0.98, -1.9));
      g.add(bx(1.2, 0.5, 1.1, std(0xd8bc6a, 1), 0, 1.1, -1.25));
      g.add(bx(0.42, 0.56, 0.3, std(0x4a6a8a, 0.8), 0, 1.36, -0.08));
      var fh = shadowed(new T.Mesh(new T.SphereGeometry(0.16, 8, 6), std(0xe8c39e, 0.8))); fh.position.set(0, 1.8, 0.08); g.add(fh);
      g.add(cyl(0.34, 0.34, 0.04, 12, std(0xe2c98a, 0.9), 0, 1.95, -0.08));
      frontGlows(g, 0.22, 0.82, 1.82);
      g.add(bx(0.3, 0.12, 0.05, M.tail, 0, 0.72, -1.92));
      [[0.5, 1.3, 0.4], [-0.5, 1.3, 0.4], [0.82, -1.0, 0.36], [-0.82, -1.0, 0.36]].forEach(function (p) { g.add(wheel(p[2], 0.2, p[0], p[1], wheels)); });
    } else if (type === 'buggy') {
      /* rocket buggy: open frame, roll cage, fat rear tyres and a rocket pod over the engine */
      g.add(bx(1.3, 0.3, 2.7, M.dark, 0, 0.55, 0));
      g.add(prof([[0.5, 0.7], [1.45, 0.7], [1.2, 0.95], [0.5, 1.0]], 1.2, body, 0.04));
      g.add(bx(1.0, 0.5, 0.8, body, 0, 0.9, -1.0));
      [-0.55, 0.55].forEach(function (x) {
        g.add(bx(0.07, 0.9, 0.07, M.metal, x, 1.2, 0.35)); g.add(bx(0.07, 0.9, 0.07, M.metal, x, 1.2, -0.55)); g.add(bx(0.07, 0.07, 0.97, M.metal, x, 1.65, -0.1));
      });
      g.add(bx(1.17, 0.07, 0.07, M.metal, 0, 1.65, 0.35)); g.add(bx(1.17, 0.07, 0.07, M.metal, 0, 1.65, -0.55));
      var bh = shadowed(new T.Mesh(new T.IcosahedronGeometry(0.2, 0), M.dark)); bh.position.set(0, 1.25, 0.05); g.add(bh);
      g.add(bx(0.8, 0.34, 1.0, M.gun, 0, 1.92, -0.2));
      [[-0.2, 0.08], [0.2, 0.08], [-0.2, -0.08], [0.2, -0.08]].forEach(function (p) {
        var tip = new T.Mesh(new T.ConeGeometry(0.09, 0.26, 8), M.redTip); tip.geometry.rotateX(Math.PI / 2); tip.position.set(p[0], 1.92 + p[1], 0.42); g.add(tip);
      });
      frontGlows(g, 0.45, 0.8, 1.45);
      g.add(bx(0.5, 0.1, 0.05, M.tail, 0, 0.95, -1.42));
      [[0.72, 1.0, 0.34, 0.24], [-0.72, 1.0, 0.34, 0.24], [0.78, -0.95, 0.44, 0.36], [-0.78, -0.95, 0.44, 0.36]].forEach(function (p) { g.add(wheel(p[2], p[3], p[0], p[1], wheels)); });
    } else if (type === 'kami') {
      /* suicide drone: small dart with a red warhead; it hovers ahead, locks on, then dives */
      var kd = new T.Group(); kd.position.y = 4.6; g.add(kd);
      kd.add(cyl(0.2, 0.2, 1.1, 8, M.dark, 0, 0, 0, 'z'));
      var nose = new T.Mesh(new T.ConeGeometry(0.2, 0.5, 8), M.redTip); nose.geometry.rotateX(Math.PI / 2); nose.position.z = 0.8; kd.add(nose);
      kd.add(bx(1.7, 0.05, 0.4, body, 0, 0, -0.1)); kd.add(bx(0.7, 0.05, 0.26, body, 0, 0, -0.5)); kd.add(bx(0.05, 0.4, 0.26, body, 0, 0.18, -0.5));
      [-0.85, 0.85].forEach(function (x) { var r = new T.Mesh(new T.CylinderGeometry(0.34, 0.34, 0.03, 12), M.rotor); r.position.set(x, 0.08, -0.1); kd.add(r); });
      var kg = glowSprite(0xff2a1a, 2.4, 0.9); kg.position.set(0, 0, 0.7); kd.add(kg);
      g.userData.hover = kd; g.userData.glow = kg;
    } else {
      var d = new T.Group(); d.position.y = 4.6; g.add(d);
      d.add(bx(0.95, 0.34, 0.95, M.dark, 0, 0, 0));
      d.add(bx(0.6, 0.2, 0.6, body, 0, 0.25, 0));
      var a1 = bx(2.5, 0.08, 0.16, M.gun, 0, 0, 0); a1.rotation.y = Math.PI / 4; d.add(a1);
      var a2 = bx(2.5, 0.08, 0.16, M.gun, 0, 0, 0); a2.rotation.y = -Math.PI / 4; d.add(a2);
      [[0.88, 0.88], [-0.88, 0.88], [0.88, -0.88], [-0.88, -0.88]].forEach(function (p) {
        var r = new T.Mesh(new T.CylinderGeometry(0.62, 0.62, 0.03, 16), M.rotor); r.position.set(p[0], 0.14, p[1]); r.castShadow = true; d.add(r);
      });
      var eye = new T.Mesh(new T.SphereGeometry(0.16, 8, 6), M.eye); eye.position.set(0, -0.24, 0.2); d.add(eye);
      var eg = glowSprite(0xff3b1f, 1.8, 0.8); eg.position.copy(eye.position); d.add(eg);
      g.userData.hover = d;
    }
    bake(g, wheels); wheels.forEach(function (wh) { bake(wh); }); if (g.userData.hover) bake(g.userData.hover);
    return { g: g, type: type, cfg: TYPES[type], body: body, wheels: wheels, hp: 1, x0: 0, phase: 0, flash: 0, fireT: 1, ws: 0, t: 0 };
  }
  var enemies = [], epool = { bike: [], sedan: [], civ: [], dump: [], drone: [], boss: [], buggy: [], kami: [], cbus: [], taxi: [], tractor: [] };
  function spawnEnemy(type, x, z, ws) {
    var e = epool[type].pop();
    if (!e) { e = buildEnemy(type); scene.add(e.g); }
    e.hp = e.cfg.hp; e.x0 = x; e.phase = rnd(0, 6.28); e.flash = 0; e.fireT = rnd(0.6, 1.6); e.ws = ws; e.t = 0;
    e.dropT = rnd(1.2, 2.0); e.holdZ = -rnd(20, 30); e.life = 15; e.strikeT = 5; e.st = 0; e.aimT = 1.1; e.lockX = 0; e.diveT = 0; e.stopD = undefined; e.state = 0; e.blinkOn = false; e.dieNow = false; e.hunted = false; e.lcT = rnd(2, 5); e.laneGo = undefined; e.entered = false; e.hpMax = 0; e.chase = 0; e.swT = 0;
    if (e.g.userData.hover) { e.g.userData.hover.position.y = 4.6; e.g.userData.hover.rotation.set(0, 0, 0); }
    e.body.emissive.setScalar(0);
    e.g.position.set(x, 0, z); e.g.rotation.set(0, ws < 0 ? Math.PI : 0, 0); e.g.visible = true;
    enemies.push(e);
    return e;
  }
  function releaseEnemy(i) { var e = enemies[i]; e.g.visible = false; epool[e.type].push(e); enemies.splice(i, 1); }

