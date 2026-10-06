  /* ---------- extras: shell casings, speed lines, burnt-out hulks, air-strike patterns ---------- */
  M.brass = std(0xd8b04a, 0.3, 0.8); M.hulk = std(0x1d1c1b, 0.95, 0.1);
  var tunDark = C(0x1a1612), tunLight = C(0xffe6c4), tunRoad = C(0x6f727a), tunHaze = C(0), tunIn = C(0), tunWhite = C(0xffffff);
  function spawnCasing(x, y, z, side, big) {
    spawnDebris(x, y, z, M.brass, 0);
    var d = debris[debris.length - 1], s = big ? 0.12 : 0.06;
    d.m.scale.set(s, s, big ? 0.3 : 0.18); d.vx = side * rnd(3, 6); d.vy = rnd(3, 5.5); d.vz = rnd(3, 8); d.life = 0.9;
  }
  /* speed lines: thin streaks that rush past once the car is really moving, or during a boost */
  var speedLines = [], slMat = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, fog: false });
  (function () {
    var geo = new T.BoxGeometry(0.05, 0.05, 8);
    for (var i = 0; i < 26; i++) { var m = new T.Mesh(geo, slMat); m.visible = false; m.frustumCulled = false; scene.add(m); speedLines.push(m); }
  })();
  function placeLine(m, z, roofed) {
    var side = Math.random() < 0.5 ? -1 : 1;
    if (roofed) m.position.set(side * rnd(6.8, 8.1), rnd(2.5, 6.2), z); else m.position.set(side * rnd(9.2, 17), rnd(0.6, 6), z);
  }
  function updSpeedLines(dt, k, roofed) {
    var i, m;
    slMat.opacity = lerp(slMat.opacity, k * 0.5, 1 - Math.exp(-dt * 6));
    var show = slMat.opacity > 0.02;
    for (i = 0; i < speedLines.length; i++) {
      m = speedLines[i];
      if (!show) { m.visible = false; continue; }
      if (!m.visible) { m.visible = true; placeLine(m, -rnd(10, 150), roofed); }
      m.position.z += veff * 2.6 * dt;
      if (m.position.z > 26) placeLine(m, -rnd(90, 160), roofed);
    }
  }
  /* a destroyed car leaves a burning hulk that slides to a stop and falls behind */
  var hulks = [], hulkPool = [], hulkGeo = new T.BoxGeometry(1, 1, 1);
  function spawnHulk(e, rel) {
    var h = hulkPool.pop(), tall = e.type === 'dump';
    if (!h) { h = { m: shadowed(new T.Mesh(hulkGeo, M.hulk)) }; scene.add(h.m); }
    h.m.visible = true; h.m.scale.set(e.cfg.hw * 1.9, tall ? 1.5 : 0.6, e.cfg.hl * 1.8);
    h.m.position.set(e.g.position.x, tall ? 1.1 : 0.55, e.g.position.z); h.m.rotation.set(0, e.g.rotation.y + rnd(-0.3, 0.3), 0);
    h.vz = rel; h.vx = rnd(-1.5, 1.5); h.spin = rnd(-1.6, 1.6); h.t = 0; h.hit = false;
    hulks.push(h);
  }
  function updHulks(dt) {
    for (var i = hulks.length - 1; i >= 0; i--) {
      var h = hulks[i], p = h.m.position, k = 1 - Math.exp(-dt * 1.4);
      h.t += dt; h.vz = lerp(h.vz, veff, k); h.vx *= 1 - k; h.spin *= 1 - k;
      p.z += h.vz * dt; p.x = clamp(p.x + h.vx * dt, -7.4, 7.4); h.m.rotation.y += h.spin * dt;
      /* a burning wreck still on the road: driving through it costs a little (never the wreck of the car just rammed: that one is given half a second to clear) */
      if (!h.hit && h.t > 0.5 && live() && !player.dead) {
        var hc = CARS[player.car];
        if (Math.abs(p.z) < hc.hl + h.m.scale.z * 0.45 && Math.abs(p.x - player.x) < hc.hw + h.m.scale.x * 0.45) {
          h.hit = true; hurt(2 * (TIRES[playerTire].debris || 1), 'debris'); player.v = Math.max(hc.vmin, player.v * 0.97); shake = Math.min(1.2, shake + 0.15); sfx('thud');
          for (var hk = 0; hk < 5; hk++) spawnP('glow', player.x + rnd(-0.8, 0.8), 0.4, rnd(-1, 1), rnd(-7, 7), rnd(2, 7), veff * 0.6, 0.3, 0.8, 0.1, COL.spark, 1);
        }
      }
      if (Math.random() < dt * 14) spawnP('glow', p.x + rnd(-0.6, 0.6), 1.1, p.z + rnd(-0.8, 0.8), rnd(-1, 1), rnd(2, 4), h.vz, rnd(0.3, 0.5), 1.6, 0.4, Math.random() < 0.5 ? COL.fire : COL.fire2, 0.85, 0.3);
      if (Math.random() < dt * 8) spawnP('smoke', p.x, 1.4, p.z, rnd(-0.6, 0.6), rnd(2, 3.5), h.vz, rnd(0.9, 1.3), 1.4, 4, smokeColor(COL.smokeD), 0.6, 0.5);
      if (p.z > (tunCam ? 6 + h.m.scale.z : 36) || p.z < -200 || h.t > 12) { h.m.visible = false; hulkPool.push(h); hulks.splice(i, 1); }
    }
  }
  function clearHulks() { for (var i = 0; i < hulks.length; i++) { hulks[i].m.visible = false; hulkPool.push(hulks[i]); } hulks.length = 0; }

  /* ---------- air strikes: six patterns, each avoided in a different way. None of them reaches the shoulders, and none can enter an underground road ---------- */
  var STRIKES = { lane: '차선 폭격', cross: '횡단 폭격', diag: '대각선 폭격', cluster: '집속 폭격', chase: '추적 폭격', napalm: '소이탄' };
  var strikeQ = [], lastStrike = '';
  function airStrike(kind) {
    if (inTunnel(dist) || inTunnel(dist + 60)) return;
    var open = LANES.filter(function (x) { return laneOpen(x, dist); });
    if (!open.length) return;
    var kinds = mission.strikes || ['lane'], i, T2, b;
    if (!kind || !STRIKES[kind]) { kind = pick(kinds); if (kind === lastStrike && kinds.length > 1) kind = pick(kinds); }
    var dvd = blockedAt(dist) || blockedAt(dist + 40);
    if (kind === 'cluster' && dvd && dvd.split) kind = 'lane';   /* the large marker would straddle the two levels */
    lastStrike = kind;
    var near = open.reduce(function (a, c) { return Math.abs(c - player.x) < Math.abs(a - player.x) ? c : a; });
    var lane = Math.random() < 0.65 ? near : pick(open), planeX = lane;
    if (kind === 'cross') {
      /* a row across every lane but one; on harder missions a second row follows with the gap one lane over */
      var gap = pick(open), gap2 = gap + (gap >= 6 ? -4 : (gap <= -6 ? 4 : (Math.random() < 0.5 ? -4 : 4))), rows = mission.strike >= 0.7 ? 2 : 1;
      for (i = 0; i < rows; i++) LANES.forEach(function (lx) { if (lx !== (i ? gap2 : gap)) { T2 = 1.7 + i * 0.8; dropBomb(lx, -3 - veff * T2, 15, T2, 20); } });
      planeX = 0;
    } else if (kind === 'diag') {
      /* lane after lane from one side to the other: step into a lane just after it has been hit */
      var dir = Math.random() < 0.5 ? -1 : 1;
      for (i = 0; i < 4; i++) { T2 = 1.4 + i * 0.4; dropBomb(dir * (-6 + i * 4), -2 - veff * T2, 15, T2, 20); }
      planeX = 0;
    } else if (kind === 'cluster') {
      /* one large marker around the car: leave the circle or change speed */
      T2 = 2.1; planeX = clamp(player.x, -5, 5);
      b = dropBomb(planeX, -2 - veff * T2, 15, T2, 30); b.R = 4.6; b.g.scale.set(2.42, 1, 2.42);
    } else if (kind === 'chase') {
      /* five bombs one after another, each aimed at where the car is at that moment: keep moving */
      for (i = 0; i < 5; i++) strikeQ.push({ t: i * 0.45, fn: function () { dropBomb(clamp(player.x, -6.6, 6.6), -1 - veff * 1.15, 15, 1.15, 18); } });
      planeX = clamp(player.x, -6, 6);
    } else if (kind === 'napalm') {
      /* a lane ahead is set on fire: the burning strip is fixed to the road and has to be driven around */
      T2 = 1.3;
      var fp = addProp('fire', dist + 78 + veff * T2, lane, { solid: { hw: 1.5, hl: 18, kind: 'fire' } });
      fp.wait = T2;
      for (i = 0; i < 3; i++) { b = dropBomb(lane, -(62 + i * 16) - veff * T2, 15, T2, 0); b.napalm = true; }
    } else {
      var lanes = [lane];
      if (mission.strike >= 1 && Math.random() < 0.4) lanes.push(clamp(lane + (Math.random() < 0.5 ? -4 : 4), -6, 6));
      lanes.forEach(function (x) { for (i = 0; i < 4; i++) { T2 = 1.5 + i * 0.08; dropBomb(x, (-16 + i * 7) - veff * T2, 15, T2, 22); } });
      if (lanes.length > 1) planeX = (lanes[0] + lanes[1]) / 2;
    }
    plane.position.set(planeX, 15, 34); plane.visible = true;
    $('banner').textContent = STRIKES[kind]; bannerT = 1.4; $('banner').hidden = false; sfx('warn');
    if (mode === 'demo' && tr.phase === 'play' && eventCd <= 6 && shotName !== 'missile') { cutTo('bomber'); slowT = 0.9; eventCd = 9; }
  }
  function updStrikes(dt) {
    for (var i = strikeQ.length - 1; i >= 0; i--) { strikeQ[i].t -= dt; if (strikeQ[i].t <= 0) { var q = strikeQ[i]; strikeQ.splice(i, 1); q.fn(); } }
    planeShadow.visible = plane.visible;
    /* at sunset the low sun throws the bomber's shadow far ahead of it, so it is seen early */
    var lowSun = clamp(1 - Math.abs(cur.night - 0.35) / 0.3, 0, 1);
    if (plane.visible) { planeShadow.position.set(plane.position.x + 1.5 + 7 * lowSun, 0.09, plane.position.z + 4 - 16 * lowSun); planeShadow.scale.set(1 + 0.5 * lowSun, 1, 1 + 1.4 * lowSun); }
  }

  /* ---------- first-person view: a cockpit that rides with the camera. Layout after the car the 바다사자 7 parodies: four-spoke flat-bottom wheel with a hexagonal pad,
     a low freestanding cluster screen, a wide landscape centre screen floating over a horizontal two-tone dash, a shifter stalk on the column. Left-hand drive ---------- */
  var CAM_SHORT = { top: '탑뷰', low: '추격 뷰', cockpit: '운전석' }, CAM_LABEL = { top: '탑뷰', low: '낮은 추격 뷰', cockpit: '운전석 뷰' }, CAM_ORDER = ['low', 'top', 'cockpit'];
  var cockpit = new T.Group(), ckp = { spin: null, hood: null, hoodMat: null, cl: null, sc: null, t: 0 };
  (function () {
    var dash = std(0x1b1d22, 0.9), lower = std(0x9fb4c8, 0.8), leather = std(0x15161a, 0.75), silver = std(0x8a9098, 0.5, 0.5), frame = std(0x101114, 0.9);
    var strip = new T.MeshBasicMaterial({ color: 0x4fd8ff });
    function B(w, h, l, mat, x, y, z) { var m = new T.Mesh(new T.BoxGeometry(w, h, l), mat); m.position.set(x, y, z); cockpit.add(m); return m; }
    function screen(w, h, cw, ch) {
      var c = document.createElement('canvas'); c.width = cw; c.height = ch;
      var tx = new T.CanvasTexture(c); tx.encoding = T.sRGBEncoding;
      var m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: tx, fog: false }));
      cockpit.add(m);
      return { c: c, x: c.getContext('2d'), tx: tx, m: m };
    }
    var CX = 0.37;   /* the car's centre line, seen from the driver's seat */
    B(1.9, 0.12, 0.64, dash, CX, -0.37, -0.87);                       /* dash top */
    B(1.9, 0.2, 0.06, lower, CX, -0.53, -0.56);                      /* pale lower panel facing the seats */
    B(1.9, 0.05, 0.08, dash, CX, -0.415, -0.56);
    B(1.5, 0.012, 0.02, strip, CX, -0.442, -0.525);                  /* ambient light strip */
    [-0.5, 1.24].forEach(function (x) { B(0.2, 0.05, 0.03, frame, x, -0.37, -0.555); });   /* outer vents */
    B(0.5, 0.05, 0.03, frame, CX, -0.37, -0.555);
    /* cluster: low, flat, no hood */
    B(0.3, 0.125, 0.02, frame, 0, -0.26, -0.672).rotation.x = -0.2;
    ckp.cl = screen(0.27, 0.105, 256, 100); ckp.cl.m.position.set(0, -0.26, -0.66); ckp.cl.m.rotation.x = -0.2;
    /* centre screen: fixed, landscape, floating */
    B(0.41, 0.235, 0.02, frame, 0.43, -0.2, -0.732).rotation.y = -0.1;
    B(0.08, 0.1, 0.05, frame, 0.43, -0.3, -0.75);
    ckp.sc = screen(0.38, 0.208, 420, 230); ckp.sc.m.position.set(0.43, -0.2, -0.72); ckp.sc.m.rotation.y = -0.1;
    /* steering wheel: flat-bottom rim, hexagonal pad, two side spokes and two lower spokes */
    var col = new T.Group(); col.position.set(0, -0.33, -0.47); col.rotation.x = -0.42; cockpit.add(col);
    var spin = new T.Group(); col.add(spin); ckp.spin = spin;
    var rim = new T.Mesh(new T.TorusGeometry(0.18, 0.021, 10, 30, 5.1), leather); rim.rotation.z = -Math.PI / 2 + (Math.PI * 2 - 5.1) / 2; spin.add(rim);
    var flat = new T.Mesh(new T.BoxGeometry(0.2, 0.04, 0.04), leather); flat.position.y = -0.148; spin.add(flat);
    var pad = new T.Mesh(new T.CylinderGeometry(0.058, 0.058, 0.035, 6), frame); pad.rotation.x = Math.PI / 2; spin.add(pad);
    var badge = new T.Mesh(new T.CylinderGeometry(0.018, 0.018, 0.04, 12), silver); badge.rotation.x = Math.PI / 2; spin.add(badge);
    [-1, 1].forEach(function (s) {
      var sp = new T.Mesh(new T.BoxGeometry(0.125, 0.034, 0.022), frame); sp.position.set(s * 0.115, 0.005, 0); spin.add(sp);
      var bt = new T.Mesh(new T.BoxGeometry(0.034, 0.014, 0.026), silver); bt.position.set(s * 0.115, 0.007, 0.003); spin.add(bt);
      var lo = new T.Mesh(new T.BoxGeometry(0.03, 0.12, 0.022), frame); lo.position.set(s * 0.045, -0.095, 0); lo.rotation.z = s * 0.3; spin.add(lo);
    });
    var stalk = new T.Mesh(new T.BoxGeometry(0.13, 0.022, 0.022), frame); stalk.position.set(0.15, 0.03, -0.06); stalk.rotation.z = 0.25; col.add(stalk);
    var colm = new T.Mesh(new T.CylinderGeometry(0.035, 0.045, 0.2, 10), frame); colm.rotation.x = Math.PI / 2; colm.position.z = -0.11; col.add(colm);
    /* windscreen frame, pillars, mirror, door top */
    B(2.0, 0.09, 0.34, frame, CX, 0.42, -0.34);
    [[-0.7, 0.1], [1.44, -0.1]].forEach(function (p) { var a = B(0.05, 1.0, 0.07, frame, p[0], 0.04, -0.64); a.rotation.x = 0.66; a.rotation.z = p[1]; });
    B(0.2, 0.065, 0.03, frame, CX, 0.31, -0.52); B(0.18, 0.05, 0.005, silver, CX, 0.31, -0.503);
    B(0.07, 0.1, 1.3, frame, -0.62, -0.31, -0.05); B(0.07, 0.1, 1.3, frame, 1.36, -0.31, -0.05);
    /* bonnet in the car's own colour */
    ckp.hoodMat = std(0x808080, 0.4, 0.2);
    ckp.hood = new T.Mesh(new T.BoxGeometry(1.74, 0.04, 1), ckp.hoodMat); cockpit.add(ckp.hood);
    cockpit.traverse(function (o) { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; o.frustumCulled = false; } });
    cockpit.visible = false; camera.add(cockpit); scene.add(camera);
  })();
  function cockpitFor(car) {
    var len = car.hoodLen || 0;
    ckp.hood.visible = len > 0.3;
    if (len > 0.3) { ckp.hood.scale.z = len; ckp.hood.position.set(0.37, -0.36 - len * 0.05, -1.2 - len / 2); ckp.hood.rotation.x = -0.1; ckp.hoodMat.color.copy((car.paint || M.dark).color); }
  }
  /* cluster: speed, the same gain/loss gauge as the HUD, hit points. Centre screen: a radar of the road ahead with the objective and the run clock */
  function drawCockpit(car, objTxt) {
    var x = ckp.cl.x, W = 256, H = 100, i;
    x.fillStyle = '#0a0d13'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.font = '700 54px "Noto Sans KR", system-ui, sans-serif';
    x.fillText(String(Math.round(veff * 3.6)), W / 2, 60);
    x.font = '700 13px "Noto Sans KR", system-ui, sans-serif'; x.fillStyle = '#9fb4c8'; x.fillText('km/h · 목표 ' + Math.round((car.vmin + player.thr * (car.vmax - car.vmin)) * 3.6), W / 2, 80);
    var aN = clamp(player.a >= 0 ? player.a / Math.max(1.5, car.aT * ACC_K) : player.a / car.brake, -1, 1);
    x.fillStyle = '#263041'; x.fillRect(18, 20, 10, 60); x.fillRect(W - 28, 20, 10, 60);
    x.fillStyle = aN >= 0 ? '#3ddc84' : '#ff6a5a'; var ah = Math.sqrt(Math.abs(aN)) * 30; x.fillRect(18, aN >= 0 ? 50 - ah : 50, 10, ah);
    x.fillStyle = '#ffffff'; x.fillRect(14, 49, 18, 2);
    var hp = clamp(player.hp / car.hp, 0, 1); x.fillStyle = hp < 0.3 ? '#ff6a5a' : '#4fd8ff'; x.fillRect(W - 28, 80 - 60 * hp, 10, 60 * hp);
    x.fillStyle = '#9fb4c8'; x.font = '700 10px "Noto Sans KR", system-ui, sans-serif'; x.fillText('가감속', 23, 94); x.fillText('내구', W - 23, 94);
    if (EDU.arms) { x.fillStyle = fireIn ? '#3ddc84' : '#5a6678'; x.fillText(fireIn ? '발사 중' : '발사 대기', W / 2, 94); }
    ckp.cl.tx.needsUpdate = true;
    x = ckp.sc.x; W = 420; H = 230;
    x.fillStyle = '#0d1420'; x.fillRect(0, 0, W, H);
    var rx = 250, rw = 150, top = 8, bot = 222;   /* radar strip on the right: 20 m wide, 150 m ahead to 10 m behind */
    function sx(wx) { return rx + (wx + 10) / 20 * rw; } function sy(wz) { return bot - (10 - wz) / 160 * (bot - top); }
    x.fillStyle = '#1b2533'; x.fillRect(rx, top, rw, bot - top);
    x.fillStyle = '#2b384a'; x.fillRect(sx(-8), top, sx(8) - sx(-8), bot - top);
    x.strokeStyle = '#51627a'; x.lineWidth = 1; x.setLineDash([6, 6]);
    [-4, 0, 4].forEach(function (lx) { x.beginPath(); x.moveTo(sx(lx), top); x.lineTo(sx(lx), bot); x.stroke(); });
    x.setLineDash([]);
    for (i = 0; i < props.length; i++) { var p = props[i]; if (!p.solid) continue; var pz = dist - p.d; if (pz > 10 || pz < -150) continue; x.fillStyle = p.solid.kind === 'fire' ? '#ff5a1f' : '#f2b01e'; var ph = Math.max(3, p.solid.hl * 2 / 160 * (bot - top)); x.fillRect(sx(p.x) - 4, sy(pz) - ph / 2, 8, ph); }
    for (i = 0; i < bombs.length; i++) { var b = bombs[i], bz = b.fixed ? 0 : b.g.position.z + veff * (b.T - b.t); if (!b.dmg || bz < -150 || bz > 10) continue; x.strokeStyle = '#ff3a2a'; x.lineWidth = 2; x.beginPath(); x.arc(sx(b.g.position.x), sy(bz), b.R ? 16 : 7, 0, 6.3); x.stroke(); }
    for (i = 0; i < enemies.length; i++) { var e = enemies[i], ez = e.g.position.z; if (ez > 10 || ez < -150) continue; x.fillStyle = e.cfg.civ ? '#c9d2dc' : (e.cfg.air ? '#ff9a3d' : '#ff3a2a'); x.beginPath(); x.arc(sx(e.g.position.x), sy(ez), e.cfg.boss ? 7 : 4, 0, 6.3); x.fill(); }
    if (crate.active) { x.fillStyle = '#3ddc84'; x.fillRect(sx(crate.g.position.x) - 4, sy(crate.g.position.z) - 4, 8, 8); }
    x.fillStyle = '#4fd8ff'; x.beginPath(); x.moveTo(sx(player.x), sy(0) - 9); x.lineTo(sx(player.x) - 6, sy(0) + 5); x.lineTo(sx(player.x) + 6, sy(0) + 5); x.closePath(); x.fill();
    x.textAlign = 'left'; x.fillStyle = '#9fb4c8'; x.font = '700 15px "Noto Sans KR", system-ui, sans-serif'; x.fillText(mission.name, 14, 30);
    x.fillStyle = '#ffffff'; x.font = '700 40px "Noto Sans KR", system-ui, sans-serif'; x.fillText(fmtT(tPlay), 14, 78);
    x.fillStyle = '#9fb4c8'; x.font = '700 14px "Noto Sans KR", system-ui, sans-serif';
    var words = objTxt.split(' · ');
    for (i = 0; i < words.length && i < 3; i++) x.fillText(words[i].slice(0, 16), 14, 106 + i * 20);
    x.fillStyle = '#263041'; x.fillRect(14, 196, 215, 8); x.fillStyle = '#4fd8ff'; x.fillRect(14, 196, 215 * clamp(objective().f, 0, 1), 8);
    x.fillStyle = '#9fb4c8'; x.fillText(car.name, 14, 186);
    ckp.sc.tx.needsUpdate = true;
  }


  /* ---------- pictures for the item tab: weapons are rendered from their own 3D models, supply items are drawn as crates with a symbol ---------- */
  var THUMB = {};
  function itemIcon(it) {
    var c = document.createElement('canvas'); c.width = 320; c.height = 240;
    var x = c.getContext('2d'), col = '#' + ('000000' + it.color.toString(16)).slice(-6);
    x.fillStyle = '#e3ebf5'; x.fillRect(0, 0, 320, 240);
    x.fillStyle = 'rgba(0,0,0,0.14)'; x.beginPath(); x.ellipse(160, 206, 74, 12, 0, 0, 6.3); x.fill();
    x.fillStyle = col; x.fillRect(92, 52, 136, 136);
    x.fillStyle = 'rgba(255,255,255,0.9)'; x.fillRect(86, 76, 148, 12); x.fillRect(86, 152, 148, 12);
    x.fillStyle = 'rgba(0,0,0,0.16)'; x.fillRect(200, 52, 28, 136);
    x.strokeStyle = '#ffffff'; x.fillStyle = '#ffffff'; x.lineWidth = 9; x.lineCap = 'round'; x.lineJoin = 'round';
    x.save(); x.translate(156, 120);
    if (it.key === 'power') { [-12, 12].forEach(function (dy) { x.beginPath(); x.moveTo(-22, dy + 10); x.lineTo(0, dy - 12); x.lineTo(22, dy + 10); x.stroke(); }); }
    else if (it.key === 'repair') { x.fillRect(-7, -26, 14, 52); x.fillRect(-26, -7, 52, 14); }
    else if (it.key === 'nitro') { x.beginPath(); x.moveTo(8, -28); x.lineTo(-16, 4); x.lineTo(-2, 4); x.lineTo(-8, 28); x.lineTo(16, -4); x.lineTo(2, -4); x.closePath(); x.fill(); }
    else if (it.key === 'shield') { x.beginPath(); x.moveTo(0, -27); x.lineTo(23, -17); x.lineTo(23, 2); x.quadraticCurveTo(21, 20, 0, 28); x.quadraticCurveTo(-21, 20, -23, 2); x.lineTo(-23, -17); x.closePath(); x.stroke(); }
    else if (it.key === 'magnet') { x.lineWidth = 13; x.lineCap = 'butt'; x.beginPath(); x.moveTo(-17, -24); x.lineTo(-17, 4); x.arc(0, 4, 17, Math.PI, 0, true); x.lineTo(17, -24); x.stroke(); }
    else if (it.key === 'jammer') { x.lineWidth = 7; [10, 20, 30].forEach(function (r) { x.beginPath(); x.arc(0, 12, r, Math.PI * 1.2, Math.PI * 1.8); x.stroke(); }); x.beginPath(); x.arc(0, 14, 5, 0, 6.3); x.fill(); }
    else if (it.key === 'double') { x.font = '900 44px system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('×2', 0, 2); }
    else if (it.key === 'smoke') { [[-14, 6, 15], [8, 8, 17], [-2, -10, 15]].forEach(function (q) { x.beginPath(); x.arc(q[0], q[1], q[2], 0, 6.3); x.fill(); }); }
    else if (it.key === 'armor') { x.lineWidth = 8; x.strokeRect(-24, -24, 48, 48); [[-13, -13], [13, -13], [-13, 13], [13, 13]].forEach(function (q) { x.beginPath(); x.arc(q[0], q[1], 4.5, 0, 6.3); x.fill(); }); x.beginPath(); x.moveTo(-10, 10); x.lineTo(10, -10); x.stroke(); }
    else if (it.key === 'rapid') { [-20, 0, 20].forEach(function (dx) { x.beginPath(); x.moveTo(dx - 7, 26); x.lineTo(dx - 7, -10); x.quadraticCurveTo(dx, -32, dx + 7, -10); x.lineTo(dx + 7, 26); x.closePath(); x.fill(); }); }
    else if (it.key === 'missile') { x.rotate(-0.785); x.beginPath(); x.moveTo(30, 0); x.lineTo(14, -9); x.lineTo(-18, -9); x.lineTo(-18, 9); x.lineTo(14, 9); x.closePath(); x.fill(); x.beginPath(); x.moveTo(-18, -9); x.lineTo(-30, -20); x.lineTo(-30, 20); x.lineTo(-18, 9); x.closePath(); x.fill(); }
    else if (it.key === 'charge') { x.lineWidth = 8; x.strokeRect(-26, -15, 46, 30); x.fillRect(22, -7, 8, 14); x.beginPath(); x.moveTo(2, -11); x.lineTo(-12, 3); x.lineTo(-3, 3); x.lineTo(-7, 12); x.lineTo(8, -3); x.lineTo(-1, -3); x.closePath(); x.fill(); }
    else if (it.key === 'cash') { x.lineWidth = 10; x.beginPath(); for (var hk = 0; hk < 6; hk++) { var ha = hk / 6 * 6.283 + 0.52; x[hk ? 'lineTo' : 'moveTo'](Math.cos(ha) * 23, Math.sin(ha) * 23); } x.closePath(); x.stroke(); x.beginPath(); x.arc(0, 0, 6, 0, 6.3); x.fill(); }
    else if (it.key === 'regen') { x.lineWidth = 8; x.beginPath(); x.arc(0, 0, 22, 0.6, 5.2); x.stroke(); x.beginPath(); x.moveTo(12, -26); x.lineTo(24, -12); x.lineTo(6, -10); x.closePath(); x.fill(); }
    else { x.beginPath(); x.arc(-3, 6, 19, 0, 6.3); x.fill(); x.lineWidth = 6; x.beginPath(); x.moveTo(9, -9); x.quadraticCurveTo(18, -22, 26, -18); x.stroke(); }
    x.restore();
    return c.toDataURL('image/png');
  }
  function tireIcon(t) {
    var c = document.createElement('canvas'); c.width = 320; c.height = 240;
    var x = c.getContext('2d'), col = '#' + ('000000' + t.color.toString(16)).slice(-6), i;
    x.fillStyle = '#e3ebf5'; x.fillRect(0, 0, 320, 240);
    x.fillStyle = 'rgba(0,0,0,0.14)'; x.beginPath(); x.ellipse(160, 214, 80, 10, 0, 0, 6.3); x.fill();
    x.fillStyle = '#17181c'; x.beginPath(); x.arc(160, 118, 92, 0, 6.3); x.fill();
    x.strokeStyle = col; x.lineWidth = 7; x.lineCap = 'round';
    for (i = 0; i < 20; i++) { var a = i / 20 * 6.283; x.beginPath(); x.moveTo(160 + Math.cos(a) * 70, 118 + Math.sin(a) * 70); x.lineTo(160 + Math.cos(a + 0.16) * 88, 118 + Math.sin(a + 0.16) * 88); x.stroke(); }
    x.fillStyle = '#c9ccd1'; x.beginPath(); x.arc(160, 118, 54, 0, 6.3); x.fill();
    x.fillStyle = '#17181c'; for (i = 0; i < 5; i++) { var b = i / 5 * 6.283 - 1.57; x.beginPath(); x.ellipse(160 + Math.cos(b) * 32, 118 + Math.sin(b) * 32, 13, 9, b, 0, 6.3); x.fill(); }
    x.fillStyle = col; x.beginPath(); x.arc(160, 118, 12, 0, 6.3); x.fill();
    return c.toDataURL('image/png');
  }
  function makeThumbs() {
    var sc = new T.Scene(), cam = new T.PerspectiveCamera(30, 4 / 3, 0.05, 60), box = new T.Box3(), ctr = new T.Vector3(), size = new T.Vector3(), w;
    sc.background = new T.Color(0xe3ebf5);
    sc.add(new T.HemisphereLight(0xffffff, 0x9aa3b0, 1.05));
    var dl = new T.DirectionalLight(0xffffff, 1.3); dl.position.set(4, 6, 2); sc.add(dl);
    var floor = new T.Mesh(new T.CircleGeometry(1, 28), new T.MeshBasicMaterial({ color: 0xcfd8e4 })); floor.rotation.x = -Math.PI / 2; sc.add(floor);
    var pr = renderer.getPixelRatio(), ex = renderer.toneMappingExposure, keepView = viewU.value;
    renderer.setPixelRatio(1); renderer.setSize(320, 240, false); renderer.toneMappingExposure = 1; viewU.value = cam.matrixWorldInverse;
    for (w in WEAPONS) {
      var g = new T.Group(), kind = w === 'missile' ? 'rear' : WEAPONS[w].slots[0];
      g.add(weaponMesh(w, kind, 1.9));
      if (kind === 'side') { g.children[0].position.x = -0.5; var twin = weaponMesh(w, kind, 1.9); twin.position.x = 0.5; g.add(twin); }
      g.traverse(function (o) { if (o.isSprite) o.visible = false; });   /* glow sprites would wash the picture out */
      sc.add(g); box.setFromObject(g); box.getCenter(ctr); box.getSize(size);
      var r = Math.max(size.x, size.z, size.y * 1.3) * 0.5 + 0.1;
      floor.position.set(ctr.x, box.min.y - 0.01, ctr.z); floor.scale.set(r * 1.5, r * 1.5, 1);
      cam.position.set(ctr.x + r * 2.1, ctr.y + r * 1.6, ctr.z + r * 2.4); cam.lookAt(ctr); cam.updateMatrixWorld();
      renderer.render(sc, cam);
      try { THUMB['w:' + w] = cv.toDataURL('image/png'); } catch (e) { THUMB['w:' + w] = ''; }
      sc.remove(g);
    }
    renderer.setPixelRatio(pr); renderer.toneMappingExposure = ex; viewU.value = keepView;
    ITEMS.forEach(function (it) { THUMB['i:' + it.key] = itemIcon(it); });
    TIRE_ORDER.forEach(function (k) { THUMB['t:' + k] = tireIcon(TIRES[k]); });
  }
