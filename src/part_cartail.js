  var muzzle = glowSprite(0xffc04a, 2.2, 0); playerRoot.add(muzzle);
  var shieldGlow = glowSprite(0x4fb8ff, 8, 0); shieldGlow.position.set(0, 1.2, 0); playerRoot.add(shieldGlow);
  var hitGlow = glowSprite(0xffffff, 6, 0); hitGlow.position.set(0, 1.1, 0); playerRoot.add(hitGlow);
  var dashGlow = glowSprite(0xffe08a, 9, 0); dashGlow.position.set(0, 1.0, 0.5); playerRoot.add(dashGlow);
  var beam = new T.SpotLight(0xfff0d0, 0, 80, 0.55, 0.7, 1);
  beam.position.set(0, 1.4, -2.7); beam.target.position.set(0, 0, -30); playerRoot.add(beam); playerRoot.add(beam.target);
  var beamPool = new T.Mesh(new T.PlaneGeometry(13, 26), new T.MeshBasicMaterial({ map: texGlow, color: C(0xfff0d0), blending: T.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0, fog: false }));
  beamPool.rotation.x = -Math.PI / 2; beamPool.position.set(0, 0.06, -15); playerRoot.add(beamPool);

  /* ---------- enemies ---------- */
  var TYPES = {
    bike: { hp: 2, hw: 0.55, hl: 1.0, ws: 19, rs: 22, score: 50, y: 0.9, ram: 8 },
    sedan: { hp: 7, hw: 1.0, hl: 2.3, ws: 21, rs: 16, score: 120, y: 1.0, ram: 16 },
    civ: { hp: 4, hw: 1.0, hl: 2.3, ws: 26, rs: 20, score: 0, y: 1.0, ram: 22, civ: true },
    dump: { hp: 40, hw: 1.45, hl: 3.7, ws: 16, rs: 12, score: 500, y: 1.6, ram: 40 },
    buggy: { hp: 5, hw: 0.85, hl: 1.5, ws: 23, rs: 18, score: 200, y: 0.9, ram: 12 },
    kami: { hp: 1, hw: 0.9, hl: 0.9, score: 180, y: 4.6, air: true, kami: true },
    tractor: { hp: 6, hw: 0.85, hl: 1.95, ws: 6.5, rs: 6.5, score: 0, y: 1.0, ram: 20, civ: true },
    cbus: { hp: 30, hw: 1.22, hl: 5.2, ws: 13, rs: 13, score: 0, y: 1.6, ram: 30, civ: true, transit: true },
    taxi: { hp: 4, hw: 0.95, hl: 2.3, ws: 16, rs: 16, score: 0, y: 1.0, ram: 20, civ: true, transit: true },
    drone: { hp: 2, hw: 1.0, hl: 1.0, score: 150, y: 4.6, air: true },
    boss: { hp: 260, hw: 1.9, hl: 4.8, score: 3000, y: 1.9, boss: true }
  };
  var enemyReds = [0xc5221f, 0xd9480f, 0x8e1b2c, 0xb5341c], civColors = [0xf1f1ee, 0x9aa0a6, 0xf2b01e, 0x2c3e66, 0x4a9a6a];
