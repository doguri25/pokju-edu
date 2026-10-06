  /* ---------- regions: every background has its own roadside, its own road surface and its own driving feel ---------- */
  /* grip scales steering, braking and launch; cap is the share of the car's speed range the surface allows; drag is extra rolling resistance in m/s²; bump shakes the car */
  var SURF = {
    asphalt: { name: '아스팔트', grip: 1, cap: 1, drag: 0, bump: 0 },
    wet: { name: '젖은 노면', grip: 0.8, cap: 0.94, drag: 0.05, bump: 0 },
    dirt: { name: '흙길', grip: 0.8, cap: 0.74, drag: 0.45, bump: 0.5 },
    wetdirt: { name: '젖은 흙길', grip: 0.66, cap: 0.66, drag: 0.9, bump: 0.45 },
    grass: { name: '풀밭', grip: 0.72, cap: 0.5, drag: 1.2, bump: 0.8 },
    mud: { name: '진흙', grip: 0.5, cap: 0.3, drag: 3.0, bump: 0.3 },
    water: { name: '물웅덩이', grip: 0.6, cap: 0.45, drag: 2.2, bump: 0.15 },
    snow: { name: '눈길', grip: 0.62, cap: 0.7, drag: 0.5, bump: 0.2 },
    ice: { name: '빙판', grip: 0.2, cap: 1, drag: 0, bump: 0 },
    gravel: { name: '자갈길', grip: 0.74, cap: 0.68, drag: 0.6, bump: 0.75 }
  };
  var ZONE = { mud: 1, water: 1, ice: 1 };
  var EDGE_SOLID = {
    rock: { hw: 0.85, hl: 0.85, kind: 'rock' }, bale: { hw: 0.7, hl: 0.7, kind: 'junk', light: true }, snowpile: { hw: 1.0, hl: 1.0, kind: 'junk', light: true, snow: true },
    junk: { hw: 0.8, hl: 0.9, kind: 'junk' }, log: { hw: 1.6, hl: 0.4, kind: 'junk' }
  };
  var REGIONS = {
    city: { key: 'city', name: '한울 도심 고속도로', short: '도심', marks: 'city', rail: true, lamps: true, kerb: true, stops: true, wind: 0, cover: 0,
      feel: '아스팔트 4차선. 접지력이 가장 좋아 차량의 최고속도를 그대로 낸다. 고가도로, 지하차도, 복합도로, 공사 구간이 나온다.' },
    country: { key: 'country', name: '들녘 시골길', short: '시골길', marks: 'country', rail: false, lamps: false, kerb: false, stops: false, wind: 0, cover: 0,
      ground: 0x86b85a, road: 0x70757d, roadOut: 0xa58a66, shoulder: 0x7aa552, walk: 0x7fae56, order: ['hill', 'village', 'work', 'hill', 'village'], edge: ['bale', 'junk'], civLanes: [-2, 2],
      feel: '가운데 두 차로만 포장되어 있고 바깥 두 차로는 흙길, 그 밖은 풀밭이다. 흙과 풀에서는 최고속도가 떨어지고 차가 미끄러진다. 마을에는 과속방지턱이 있고 경운기가 느리게 달린다.' },
    offroad: { key: 'offroad', name: '산속 임도', short: '오프로드', marks: 'none', rail: false, lamps: false, kerb: false, stops: false, wind: 0, cover: 0, base: 'dirt', verge: 'grass',
      ground: 0x5d7d46, road: 0x9c7d58, roadOut: 0x9c7d58, shoulder: 0x6d8a4c, walk: 0x62824a, order: ['hill', 'mud', 'rocks', 'ford', 'hill', 'rocks', 'mud'], edge: ['rock', 'rock'], grade: [0.1, 0.12, 0.14], tracks: { hex: 0x6a5238, a: 0.6 },
      feel: '전 구간 비포장. 차가 흔들리고 최고속도가 크게 떨어진다. 진흙에 빠지면 속도를 잃고, 바위와 통나무, 개울이 길을 막는다. 사륜구동과 SUV·픽업이 유리하다.' },
    snow: { key: 'snow', name: '눈 덮인 고갯길', short: '눈길', marks: 'city', rail: true, lamps: true, kerb: false, stops: false, wind: 0, cover: 0.75,
      ground: 0xe6edf2, road: 0x666c75, roadOut: 0x666c75, shoulder: 0xcdd6dd, walk: 0xe6edf2, order: ['hill', 'ice', 'tunnel', 'hill', 'ice', 'work'], edge: ['snowpile', 'snowpile'], tracks: { hex: 0x4a5058, a: 0.55 },
      feel: '눈이 쌓인 산간도로. 조향과 제동이 둔해지고 최고속도가 떨어진다. 빙판에서는 방향이 거의 바뀌지 않는다. 터널 안은 마른 노면이다. 사륜구동이 유리하고 후륜구동이 가장 불리하다.' },
    coast: { key: 'coast', name: '해안도로', short: '해안', marks: 'city', rail: true, lamps: true, kerb: true, stops: true, wind: 1, cover: 0,
      ground: 0x8fae6e, road: 0x6b7280, roadOut: 0x6b7280, shoulder: 0x565b66, walk: 0xd8d4c8, order: ['deck', 'work', 'under', 'deck', 'split', 'work'],
      feel: '바다를 낀 평탄한 아스팔트 도로. 빠르지만 옆바람이 차를 밀어내고, 키가 큰 차일수록 많이 밀린다. 해상교량과 복합도로가 나온다.' }
  };
  REGIONS.highway = { key: 'highway', name: '한울 고속도로', short: '고속도로', marks: 'city', rail: false, lamps: true, kerb: false, stops: false, wind: 0, cover: 0, noLeft: true, gantry: true, fast: 1.2, holes: 1,
    ground: 0x7fae6e, road: 0x5f646e, roadOut: 0x5f646e, shoulder: 0x4d525b, walk: 0x8f949b, order: ['toll', 'tunnel', 'deck', 'work', 'hill', 'under'],
    feel: '가장 넓고 곧은 아스팔트 길. 폭주 차량이 20% 더 빠르게 달리고, 왼쪽은 중앙분리대라 갓길이 없다. 톨게이트에서는 부스 사이 차로로 지나야 한다. 분리대 너머로 반대 차로의 차들이 지나간다.' };
  REGIONS.mountain = { key: 'mountain', name: '산악 험로', short: '산악', marks: 'none', rail: false, lamps: false, kerb: false, stops: false, wind: 0.3, cover: 0, base: 'gravel',
    ground: 0x6f7a5a, road: 0x8f8778, roadOut: 0x8f8778, shoulder: 0x7a7466, walk: 0x6f6a5c, order: ['hill', 'rocks', 'slide', 'hill', 'rocks', 'hill'], grade: [0.12, 0.15, 0.18], edge: ['rock', 'rock'], tracks: { hex: 0x6f675a, a: 0.5 },
    feel: '자갈이 깔린 가파른 산길. 경사가 12~18%로 가장 급하고, 낙석이 차로에 놓여 있으며 산사태가 차로를 막는다. 왼쪽은 암벽, 오른쪽은 돌 난간이다. 힘이 약하거나 무거운 차는 오르막에서 크게 처진다.' };
  REGIONS.creek = { key: 'creek', name: '개울길', short: '개울', marks: 'none', rail: false, lamps: false, kerb: false, stops: false, wind: 0, cover: 0, base: 'gravel', verge: 'grass',
    ground: 0x6f9a52, road: 0xa39a86, roadOut: 0xa39a86, shoulder: 0x7aa552, walk: 0x6f9a52, order: ['stream', 'ford', 'rocks', 'stream', 'ford', 'hill'], grade: [0.06, 0.08], edge: ['rock', 'log'], tracks: { hex: 0x8a826f, a: 0.45 },
    feel: '개울을 따라가는 자갈길. 물길이 한두 차로를 길게 덮고 여울이 길을 가로지른다. 물에서는 속도와 접지력을 잃는다. 레인 타이어와 올터레인 타이어가 도움이 된다.' };
  REGIONS.city.holes = 1; REGIONS.coast.holes = 0.7; REGIONS.country.holes = 1.2;
  var REGION_ORDER = ['city', 'highway', 'country', 'offroad', 'mountain', 'creek', 'snow', 'coast'];
  var region = REGIONS.city, regionScenery = { city: scenery, country: [], offroad: [], snow: [], coast: [], highway: [], mountain: [], creek: [] }, sceneryNow = scenery;
  (function () { for (var k in REGIONS) { var r = REGIONS[k]; if (r.ground) { r.groundC = C(r.ground); r.roadC = C(r.road); r.roadOutC = C(r.roadOut); r.shoulderC = C(r.shoulder); r.walkC = C(r.walk); } if (r.tracks) r.tracks.c = C(r.tracks.hex); } })();

  var RM = {
    wall: std(0xf1ead8, 0.9), wall2: std(0xd9d2c0, 0.9), roofB: std(0x2f6fb5, 0.6), roofO: std(0xd9662a, 0.6), roofG: std(0x3f8a5a, 0.6), roofR: std(0x9a4a3a, 0.7),
    vinyl: std(0xeef3f1, 0.35), paddyG: std(0x7fb24a, 1), paddyY: std(0xd6b54a, 1), paddyW: std(0x86a8a0, 0.3), ridge: std(0x7a6a4a, 1), yard: std(0xb39a78, 1),
    leaf: [std(0x5fa348, 0.9), std(0x7bb24e, 0.9), std(0x4c8f4a, 0.9)], pine: [std(0x2f6b45, 0.9), std(0x275a3c, 0.9), std(0x3a7a4c, 0.9)], snow: std(0xf4f7fa, 0.8),
    rock: std(0x8a8d90, 0.95), rockB: std(0x7d7468, 0.95), wood: std(0x8a5f3a, 0.9), woodD: std(0x5f4630, 0.9), bale: std(0xf3f3ee, 0.5), hay: std(0xd8bc6a, 1), line: std(0xf2c230, 0.8),
    mud: new T.MeshStandardMaterial({ color: C(0x4a3a28), roughness: 0.22, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }),
    water: new T.MeshStandardMaterial({ color: C(0x5f8fa8), roughness: 0.12, metalness: 0.25, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }),
    ice: new T.MeshStandardMaterial({ color: C(0x86bfe0), roughness: 0.06, metalness: 0.45, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }),
    cafe: [std(0xf6c9d0, 0.9), std(0xbfe3ea, 0.9), std(0xfbe6a8, 0.9), std(0xd5e8c4, 0.9)], hull: [std(0x2f6fb5, 0.6), std(0xc5221f, 0.6), std(0xf2f2ee, 0.6)]
  };
  function scn(key, obj, x, z, baseY, o) {
    obj.position.set(x, baseY || 0, z); obj.userData.baseY = baseY || 0;
    if (o) for (var k in o) obj.userData[k] = o[k];
    obj.visible = false; scene.add(obj); regionScenery[key].push(obj); return obj;
  }
  function zAt(i, n, jit) { return -250 + (i + 0.5) * 308 / n + rnd(-(jit || 0), jit || 0); }
  var leafGeo = new T.IcosahedronGeometry(1.6, 0), rockGeo = new T.IcosahedronGeometry(1, 0), capGeoA = new T.ConeGeometry(1.1, 1.0, 7), capGeoB = new T.ConeGeometry(0.75, 0.9, 7);
  function roundTree(sc) {
    var g = new T.Group(), tk = shadowed(new T.Mesh(trunkGeo, M.trunk)); tk.position.y = 0.8; g.add(tk);
    var cn = shadowed(new T.Mesh(leafGeo, pick(RM.leaf))); cn.position.y = 2.8; cn.scale.set(1, rnd(0.85, 1.15), 1); cn.rotation.y = rnd(0, 3); g.add(cn);
    g.scale.setScalar(sc || rnd(0.8, 1.4)); return g;
  }
  function pineTree(sc, snowy) {
    var g = new T.Group(), lm = pick(RM.pine), tk = shadowed(new T.Mesh(trunkGeo, M.trunk)); tk.position.y = 0.8; g.add(tk);
    var c1 = shadowed(new T.Mesh(coneGeoA, lm)); c1.position.y = 2.5; g.add(c1);
    var c2 = shadowed(new T.Mesh(coneGeoB, lm)); c2.position.y = 3.9; g.add(c2);
    if (snowy) { var s1 = new T.Mesh(capGeoA, RM.snow); s1.position.y = 3.25; g.add(s1); var s2 = new T.Mesh(capGeoB, RM.snow); s2.position.y = 4.6; g.add(s2); }
    g.scale.setScalar(sc || rnd(0.9, 1.7)); return g;
  }
  function boulder(r, mat) {
    var m = shadowed(new T.Mesh(rockGeo, mat || RM.rock)); m.scale.set(r * rnd(0.9, 1.3), r * rnd(0.6, 0.9), r * rnd(0.9, 1.3)); m.rotation.set(rnd(0, 3), rnd(0, 3), rnd(0, 3)); return m;
  }
  function house(w, d, h, wall, roof) {
    var g = new T.Group();
    g.add(bx(w, h, d, wall, 0, h / 2, 0));
    g.add(prof([[-d / 2 - 0.4, h], [d / 2 + 0.4, h], [0, h + 1.5]], w + 0.6, roof));
    g.add(bx(0.9, 1.7, 0.08, RM.woodD, -w * 0.2, 0.85, d / 2 + 0.02)); g.add(bx(1.2, 0.9, 0.08, M.glass, w * 0.22, 1.5, d / 2 + 0.02));
    return g;
  }
  /* far ridges are flat silhouettes that fade into the haze with distance */
  function mount(key, x, z, r, h, hex) {
    var m = new T.Mesh(new T.ConeGeometry(r, h, 6 + ((Math.random() * 3) | 0), 1), new T.MeshBasicMaterial({ color: C(hex), fog: false, toneMapped: false }));
    m.rotation.y = rnd(0, 3); m.frustumCulled = false;
    var ax = Math.max(Math.abs(x), r + 30); x = x < 0 ? -ax : ax;   /* the foot of a ridge always stays clear of the road, so the road never runs through it */
    return scn(key, m, x, z, h / 2 - 3, { mount: true, base: C(hex), period: 900, wrapZ: 150 });
  }

  /* --- 들녘 시골길: rice paddies, farmhouses with coloured metal roofs, vinyl greenhouses, utility poles, silage bales --- */
  (function () {
    var i, s, g, k = 'country', roofs = [RM.roofB, RM.roofO, RM.roofG, RM.roofR];
    for (i = 0; i < 14; i++) [-1, 1].forEach(function (sd) {
      [[34.5, 38], [73.5, 38]].forEach(function (row, ri) {
        g = new T.Group();
        var r = Math.random(), pl = new T.Mesh(new T.PlaneGeometry(row[1], 20.6), r < 0.6 ? RM.paddyG : (r < 0.85 ? RM.paddyY : RM.paddyW)); pl.rotation.x = -Math.PI / 2; pl.receiveShadow = true; g.add(pl);
        var rd = new T.Mesh(new T.BoxGeometry(row[1], 0.22, 0.5), RM.ridge); rd.position.set(0, 0.05, 10.6); g.add(rd);
        if (!ri) { var r2 = new T.Mesh(new T.BoxGeometry(0.5, 0.22, 20.6), RM.ridge); r2.position.set(sd * 19.2, 0.05, 0); g.add(r2); }
        scn(k, g, sd * row[0], -250 + i * 22 + 11, 0.03);
      });
    });
    for (i = 0; i < 6; i++) {
      s = i % 2 ? 1 : -1; g = new T.Group();
      var yard = new T.Mesh(new T.PlaneGeometry(15, 13), RM.yard); yard.rotation.x = -Math.PI / 2; yard.position.y = 0.04; yard.receiveShadow = true; g.add(yard);
      var hs = house(rnd(6.5, 8.5), rnd(4.5, 5.5), rnd(2.6, 3.1), Math.random() < 0.5 ? RM.wall : RM.wall2, pick(roofs)); hs.rotation.y = -s * Math.PI / 2; hs.position.set(s * 1.5, 0, 0); g.add(hs);
      var shed = house(3, 3, 2, RM.wall2, pick(roofs)); shed.position.set(-s * 3.5, 0, -4); g.add(shed);
      var tr = roundTree(1.5); tr.position.set(-s * 4.5, 0, 4.5); g.add(tr);
      scn(k, g, s * rnd(24, 30), zAt(i, 6, 8), 0.02);
    }
    for (i = 0; i < 4; i++) {
      s = i % 2 ? -1 : 1; g = new T.Group();
      for (var j = 0; j < 3; j++) {
        var geo = new T.CylinderGeometry(3, 3, 26, 10, 1, true, 0, Math.PI); geo.rotateX(Math.PI / 2); geo.rotateZ(Math.PI / 2);
        var vh = new T.Mesh(geo, RM.vinyl); vh.material.side = T.DoubleSide; vh.position.set(j * 6.6, 0, 0); vh.castShadow = true; g.add(vh);
        [-13, 13].forEach(function (zz) { var cap = new T.Mesh(new T.CircleGeometry(3, 10, 0, Math.PI), RM.vinyl); cap.position.set(j * 6.6, 0, zz); if (zz < 0) cap.rotation.y = Math.PI; g.add(cap); });
      }
      scn(k, g, s * 42 - 6.6, zAt(i, 4, 14) + 30, 0.02);
    }
    for (i = 0; i < 7; i++) {
      g = new T.Group();
      g.add(cyl(0.12, 0.16, 8.4, 6, RM.woodD, 0, 4.2, 0)); g.add(bx(1.9, 0.1, 0.1, RM.woodD, 0, 7.6, 0));
      [-0.75, 0.75].forEach(function (x) { var w = new T.Mesh(new T.BoxGeometry(0.03, 0.03, 44), M.dark); w.position.set(x, 7.68, -22); g.add(w); });
      scn(k, g, 12.7, -250 + i * 44, 0);
    }
    for (i = 0; i < 16; i++) scn(k, roundTree(), (i % 2 ? 1 : -1) * rnd(13.2, 15), zAt(i, 16, 6), 0);
    for (i = 0; i < 6; i++) {
      g = new T.Group();
      for (j = 0; j < 4; j++) g.add(cyl(0.65, 0.65, 1.25, 10, RM.bale, rnd(-3, 3), 0.65, rnd(-3, 3), 'x'));
      scn(k, g, (i % 2 ? -1 : 1) * rnd(19, 30), zAt(i, 6, 16) + 15, 0.03);
    }
    for (i = 0; i < 2; i++) {
      g = new T.Group();
      g.add(bx(0.1, 2.2, 0.1, RM.wood, 0, 1.1, 0)); g.add(bx(1.5, 0.1, 0.1, RM.wood, 0, 1.6, 0)); g.add(bx(0.7, 0.7, 0.2, std(0xc5221f, 0.9), 0, 1.5, 0));
      var hd = new T.Mesh(new T.SphereGeometry(0.2, 8, 6), RM.hay); hd.position.y = 2.2; g.add(hd); g.add(cyl(0.38, 0.38, 0.05, 10, RM.hay, 0, 2.38, 0));
      scn(k, g, (i ? 1 : -1) * 18, zAt(i, 2, 30), 0);
    }
    for (i = 0; i < 8; i++) mount(k, (i % 2 ? 1 : -1) * rnd(150, 270), -700 + i * 112 + rnd(-30, 30), rnd(70, 115), rnd(38, 72), i % 3 ? 0x4f8a5c : 0x3f7a6c);
  })();

  /* --- 산속 임도: a forest track; trees crowd the road, boulders and log piles line it --- */
  (function () {
    var i, g, k = 'offroad';
    for (i = 0; i < 70; i++) {
      var sd = i % 2 ? 1 : -1, near = i % 3 === 0;
      scn(k, Math.random() < 0.6 ? pineTree() : roundTree(rnd(1.1, 1.8)), sd * (near ? rnd(12, 14.5) : rnd(15, 40)), zAt(i, 70, 3), 0);
    }
    for (i = 0; i < 16; i++) scn(k, boulder(rnd(0.9, 2.3), i % 3 ? RM.rock : RM.rockB), (i % 2 ? 1 : -1) * rnd(11.9, 20), zAt(i, 16, 7), 0.5);
    for (i = 0; i < 4; i++) {
      g = new T.Group();
      [[0, 0.35], [0.72, 0.35], [0.36, 0.95]].forEach(function (p) { g.add(cyl(0.34, 0.34, 4.2, 8, RM.wood, p[0], p[1], 0, 'z')); });
      scn(k, g, (i % 2 ? 1 : -1) * 12.6, zAt(i, 4, 20) + 20, 0);
    }
    for (i = 0; i < 3; i++) {
      g = new T.Group(); g.add(bx(0.14, 2.0, 0.14, RM.woodD, 0, 1.0, 0)); g.add(bx(1.3, 0.4, 0.08, RM.wood, 0, 1.7, 0.1));
      scn(k, g, (i % 2 ? -1 : 1) * 11.9, zAt(i, 3, 30), 0);
    }
    for (i = 0; i < 9; i++) mount(k, (i % 2 ? 1 : -1) * rnd(95, 210), -700 + i * 100 + rnd(-30, 30), rnd(60, 105), rnd(46, 88), i % 3 ? 0x356a44 : 0x42765a);
  })();

  /* --- 눈 덮인 고갯길: snow-capped pines, snowbanks beyond the guardrail, cabins with lit windows, white ridges --- */
  var snowStakes = loopGroup(22, true);
  (function () {
    var i, g, k = 'snow', red = std(0xd9362a, 0.7);
    for (i = 0; i < 44; i++) scn(k, pineTree(0, true), (i % 2 ? 1 : -1) * (i % 3 === 0 ? rnd(15.6, 17) : rnd(17, 38)), zAt(i, 44, 3), 0);
    for (i = 0; i < 20; i++) [-1, 1].forEach(function (sd) {
      g = new T.Group();
      for (var j = 0; j < 3; j++) { var lump = new T.Mesh(rockGeo, RM.snow); lump.scale.set(rnd(1.2, 1.8), rnd(0.7, 1.2), rnd(2.6, 3.4)); lump.position.set(rnd(-0.4, 0.4), 0.2, -5 + j * 5); g.add(lump); }
      scn(k, g, sd * 13.4, -250 + i * 15.4, 0);
    });
    for (i = 0; i < 3; i++) {
      var sd2 = i % 2 ? 1 : -1; g = house(7, 5, 2.8, RM.wood, RM.snow); g.rotation.y = -sd2 * Math.PI / 2;
      var wg = glowSprite(0xffc46a, 5, 0); wg.position.set(1.6, 1.5, 3.2); g.add(wg); nightGlows.push(wg);
      scn(k, g, sd2 * rnd(22, 28), zAt(i, 3, 30), 0);
    }
    for (var sz = -286; sz <= 44; sz += 22) [-11.95, 11.95].forEach(function (x) {
      var p = new T.Group(); p.add(bx(0.09, 1.9, 0.09, M.white, 0, 0.95, 0)); p.add(bx(0.1, 0.36, 0.1, red, 0, 1.72, 0)); p.add(bx(0.1, 0.3, 0.1, red, 0, 1.0, 0));
      p.position.set(x, 0, sz); p.userData.baseY = 0; snowStakes.add(p);
    });
    snowStakes.visible = false;
    for (i = 0; i < 9; i++) mount(k, (i % 2 ? 1 : -1) * rnd(120, 250), -700 + i * 100 + rnd(-30, 30), rnd(70, 120), rnd(62, 115), i % 3 ? 0xdfe8f0 : 0xc3d2e0);
  })();

  /* --- 해안도로: the sea on the left behind a line of tetrapods, boats and lighthouses; rocks, pines and cafés on the land side --- */
  var seaTex = noiseTex(0.9); seaTex.repeat.set(44, 30);
  var seaMat = new T.MeshStandardMaterial({ map: seaTex, color: C(0x2f86b0), roughness: 0.22, metalness: 0.35 }), seaC = C(0x2f86b0);
  var seaStrip = strip(-316, 600, -0.03, seaMat, true); seaStrip.visible = false;
  (function () {
    var i, g, k = 'coast', tet = new T.TetrahedronGeometry(1.25, 0), red = std(0xd9362a, 0.6);
    for (i = 0; i < 30; i++) { var tp = shadowed(new T.Mesh(tet, M.concrete)); tp.rotation.set(rnd(0, 3), rnd(0, 3), rnd(0, 3)); scn(k, tp, -rnd(15.9, 19), zAt(i, 30, 3), 0.35); }
    for (i = 0; i < 5; i++) {
      g = new T.Group();
      g.add(prof([[-3, 0], [3.4, 0], [4.2, 0.9], [-3.2, 0.9]], 2.2, pick(RM.hull), 0.05)); g.add(bx(1.5, 1.1, 1.6, M.white, 0, 1.45, -1.2)); g.add(bx(0.08, 1.8, 0.08, M.pole, 0, 2.4, 0.6));
      g.rotation.y = rnd(-0.6, 0.6);
      scn(k, g, -rnd(32, 110), zAt(i, 5, 20), -0.25, { bob: rnd(0, 6) });
    }
    for (i = 0; i < 2; i++) {
      g = new T.Group();
      g.add(bx(26, 0.9, 3.4, M.concrete, -13, 0.3, 0)); g.add(cyl(1.0, 1.4, 9, 10, M.white, -24, 5.2, 0)); g.add(cyl(1.25, 1.3, 1.0, 10, red, -24, 6.2, 0));
      g.add(cyl(0.8, 0.8, 1.2, 8, M.glass, -24, 10.3, 0)); var cp = new T.Mesh(new T.ConeGeometry(1.1, 0.9, 8), red); cp.position.set(-24, 11.35, 0); g.add(cp);
      var lg = glowSprite(0xfff0b0, 9, 0); lg.position.set(-24, 10.3, 0); g.add(lg); nightGlows.push(lg);
      scn(k, g, -16.4, zAt(i, 2, 30), 0);
    }
    for (i = 0; i < 5; i++) mount(k, -rnd(190, 360), -700 + i * 180 + rnd(-40, 40), rnd(28, 60), rnd(14, 30), 0x3f7a56);
    for (i = 0; i < 12; i++) { var rk = boulder(rnd(2.2, 4.6), i % 2 ? RM.rockB : RM.rock); rk.scale.y *= 1.5; scn(k, rk, rnd(17.5, 30), zAt(i, 12, 8), 1.2); }
    for (i = 0; i < 16; i++) scn(k, pineTree(), rnd(16.2, 36), zAt(i, 16, 6), 0);
    for (i = 0; i < 5; i++) {
      var w = rnd(8, 12), h = rnd(4, 7); g = new T.Group();
      g.add(bx(w, h, 8, pick(RM.cafe), 0, h / 2, 0)); g.add(bx(0.1, h * 0.45, 6, M.glass, -w / 2 - 0.03, h * 0.5, 0)); g.add(bx(w + 0.6, 0.3, 8.6, M.white, 0, h + 0.15, 0));
      var col = pick(neonColors), sign = new T.Mesh(new T.BoxGeometry(0.2, 0.9, 3.6), new T.MeshBasicMaterial({ color: C(col) })); sign.position.set(-w / 2 - 0.2, h - 0.8, 0); g.add(sign);
      var ng = glowSprite(col, 8, 0); ng.position.set(-w / 2 - 0.8, h - 0.8, 0); g.add(ng); nightGlows.push(ng);
      scn(k, g, 18 + w / 2 + rnd(0, 6), zAt(i, 5, 14), 0);
    }
    for (i = 0; i < 4; i++) mount(k, rnd(150, 260), -700 + i * 225 + rnd(-40, 40), rnd(70, 110), rnd(36, 64), 0x4f8a5c);
  })();

  /* --- 한울 고속도로: median barrier with the opposite carriageway beyond it, a sound wall on the right, gantry signs, toll gates --- */
  var hwParts = [];
  (function () {
    var i, g, k = 'highway', wallLow = std(0x9aa3ad, 0.8), wallUp = new T.MeshStandardMaterial({ color: C(0x9fd6c8), roughness: 0.3, transparent: true, opacity: 0.38, depthWrite: false });
    function longBox(w, h, x, y, mat) { var m = new T.Mesh(new T.BoxGeometry(w, h, 440, 1, 1, STRIP_ROWS), mat); m.position.set(x, y, -170); m.frustumCulled = false; m.visible = false; scene.add(m); hwParts.push(m); return m; }
    longBox(0.55, 0.95, -8.8, 0.47, M.concrete).castShadow = true;   /* median barrier */
    longBox(0.3, 1.3, 15.9, 0.65, wallLow); longBox(0.12, 2.9, 15.9, 2.75, wallUp);   /* sound wall */
    var opp = strip(-23.6, 16.2, -0.02, roadMat, true); opp.visible = false; hwParts.push(opp);   /* the opposite carriageway */
    var od = loopGroup(9, false); for (var z = -297; z <= 45; z += 9) [-19.6, -23.6, -27.6].forEach(function (x) { var d = new T.Mesh(dashGeo, M.white); d.position.set(x, 0.0, z); od.add(d); }); od.visible = false; hwParts.push(od);
    for (i = 0; i < 14; i++) scn(k, Math.random() < 0.5 ? pineTree() : roundTree(rnd(1.1, 1.7)), rnd(18.5, 36), zAt(i, 14, 6), 0);
    for (i = 0; i < 10; i++) scn(k, roundTree(rnd(1.2, 1.8)), -rnd(34, 50), zAt(i, 10, 8), 0);
    for (i = 0; i < 7; i++) {   /* marker posts with reflectors along the right edge */
      g = new T.Group(); g.add(bx(0.1, 1.0, 0.1, M.white, 0, 0.5, 0)); g.add(bx(0.11, 0.16, 0.11, M.cone, 0, 0.85, 0)); scn(k, g, 11.9, -250 + i * 44, 0);
    }
    for (i = 0; i < 8; i++) mount(k, (i % 2 ? 1 : -1) * rnd(140, 260), -700 + i * 112 + rnd(-30, 30), rnd(70, 115), rnd(30, 60), i % 3 ? 0x4f8a5c : 0x3f7a6c);
  })();
  /* traffic on the other side of the median; built the first time the expressway is shown, because the vehicle models are defined later in the file */
  var hwCarsMade = false;
  function hwCars() {
    if (hwCarsMade) return; hwCarsMade = true;
    for (var i = 0; i < 7; i++) {
      var oc = buildEnemy(i % 3 === 2 ? 'cbus' : 'civ').g; oc.rotation.y = Math.PI;
      scn('highway', oc, -19.6 - (i % 3) * 4, -250 + i * 44 + rnd(-10, 10), 0, { onc: 27 + (i % 3) * 3 });
    }
  }
  /* --- 산악 험로: a rock wall on the left, guard stones and a drop on the right, big ridges close by --- */
  var guardStones = loopGroup(11, false);
  (function () {
    var i, g, k = 'mountain', j;
    for (i = 0; i < 20; i++) {
      g = new T.Group();
      for (j = 0; j < 3; j++) { var rr0 = rnd(3.2, 5.2), rk = boulder(rr0, j % 2 ? RM.rockB : RM.rock); rk.scale.y *= rnd(1.6, 2.6); rk.position.set(-(rr0 - 3.2) - rnd(0, 4) - j * 3, 3 + j * 3.5, rnd(-6, 6)); g.add(rk); }
      scn(k, g, -17.2, -250 + i * 15.4, 0);
    }
    for (i = 0; i < 12; i++) scn(k, boulder(rnd(1.0, 2.4), i % 2 ? RM.rock : RM.rockB), rnd(13.5, 24), zAt(i, 12, 8), 0.5);
    for (i = 0; i < 14; i++) scn(k, pineTree(rnd(0.9, 1.5)), rnd(14, 34), zAt(i, 14, 7), 0);
    for (var z = -297; z <= 45; z += 11) { var st = shadowed(new T.Mesh(new T.BoxGeometry(0.5, 0.7, 1.4), RM.rock)); st.position.set(11.8, 0.35, z); guardStones.add(st); }
    guardStones.visible = false;
    for (i = 0; i < 10; i++) mount(k, i % 3 === 0 ? -rnd(70, 120) : rnd(80, 190), -700 + i * 90 + rnd(-30, 30), rnd(70, 120), rnd(70, 130), i % 2 ? 0x5d6f5a : 0x6f7f76);
  })();
  /* --- 개울길: a stream runs along the right of the track; willows, reeds and stepping stones --- */
  var streamStrip = loopGroup(120, false); streamStrip.visible = false;   /* filled the first time the creek region is shown: winding tiles of running water */
  (function () {
    var i, g, k = 'creek', reed = std(0x8fb04a, 0.9), j;
    for (i = 0; i < 26; i++) scn(k, roundTree(rnd(1.2, 2.0)), (i % 3 === 0 ? 1 : -1) * (i % 3 === 0 ? rnd(26, 40) : rnd(12.5, 34)), zAt(i, 26, 5), 0);
    for (i = 0; i < 16; i++) {
      g = new T.Group();
      for (j = 0; j < 6; j++) { var rd = new T.Mesh(new T.ConeGeometry(0.09, rnd(1.2, 1.9), 4), reed); rd.position.set(rnd(-0.8, 0.8), 0.7, rnd(-0.8, 0.8)); g.add(rd); }
      scn(k, g, rnd(13.6, 14.6) + (i % 2) * 10.5, zAt(i, 16, 6), 0);
    }
    for (i = 0; i < 14; i++) scn(k, boulder(rnd(0.4, 1.0), RM.rockB), rnd(15, 24), zAt(i, 14, 8), 0.15);
    for (i = 0; i < 2; i++) {   /* a plank footbridge over the stream */
      g = new T.Group(); g.add(bx(11, 0.16, 1.6, RM.wood, 0, 0.5, 0)); [-1, 1].forEach(function (sd) { g.add(bx(11, 0.08, 0.08, RM.woodD, 0, 1.2, sd * 0.75)); [-5, 0, 5].forEach(function (x) { g.add(bx(0.1, 0.8, 0.1, RM.woodD, x, 0.85, sd * 0.75)); }); });
      scn(k, g, 19.5, zAt(i, 2, 40), 0);
    }
    for (i = 0; i < 8; i++) mount(k, (i % 2 ? 1 : -1) * rnd(130, 240), -700 + i * 112 + rnd(-30, 30), rnd(70, 110), rnd(40, 70), i % 3 ? 0x4f8a5c : 0x5a8468);
  })();

  /* --- road markings and wheel tracks that only some regions have --- */
  var cDash = loopGroup(9, false), cEdges = [], trackStrips = [];
  (function () {
    for (var z = -297; z <= 45; z += 9) { var d = new T.Mesh(dashGeo, RM.line); d.position.set(0, 0.012, z); d.receiveShadow = true; cDash.add(d); }
    cDash.visible = false;
    [-4.08, 4.08].forEach(function (x) {
      var e = new T.Mesh(new T.PlaneGeometry(0.18, 440, 1, STRIP_ROWS), M.white); e.rotation.x = -Math.PI / 2; e.position.set(x, 0.014, -170); e.visible = false; e.frustumCulled = false; scene.add(e); cEdges.push(e);
    });
  })();
  var trackMat = new T.MeshStandardMaterial({ color: 0x555555, roughness: 1, transparent: true, opacity: 0.5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
  [-6, -2, 2, 6].forEach(function (lx) {
    [-0.78, 0.78].forEach(function (o) {
      var m = new T.Mesh(new T.PlaneGeometry(0.58, 440, 1, STRIP_ROWS), trackMat); m.rotation.x = -Math.PI / 2; m.position.set(lx + o, 0.005, -170); m.visible = false; m.frustumCulled = false; scene.add(m); trackStrips.push(m);
    });
  });
  var streamC = C(0x4f93b5), foamC = C(0xeef6f8);
  var skyLin = new T.Color(), ZLOSS = { mud: 0.22, water: 0.14 }, snowTrackC = C(0x3f444c), mudC = C(0x4a3a28), iceC = C(0x86bfe0);

  /* --- what the road itself looks like up close: cracks, patches and skid marks on asphalt; humps, loose stones and damp patches on dirt and gravel; lumps of packed snow. One merged mesh per material, looping with the road --- */
  var detMat = {
    crack: new T.MeshStandardMaterial({ color: 0x000000, roughness: 1, transparent: true, opacity: 0.42, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
    patch: new T.MeshStandardMaterial({ color: 0x000000, roughness: 1, transparent: true, opacity: 0.14, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }),
    light: new T.MeshStandardMaterial({ color: 0xffffff, roughness: 1, transparent: true, opacity: 0.1, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }),
    solid: new T.MeshStandardMaterial({ color: 0xffffff, roughness: 1, vertexColors: true }),
    solidOut: new T.MeshStandardMaterial({ color: 0xffffff, roughness: 1, vertexColors: true })
  }, roadDetail = {}, DET_P = 120;
  function buildDetail(key) {
    var R = REGIONS[key], A = { crack: [], patch: [], light: [], solid: [], solidOut: [] }, CL = { solid: [], solidOut: [] }, lg = loopGroup(DET_P, false), k, i, copies = [-480, -360, -240, -120, 0];
    function flat(name, cx, cz, w, l, ang) {
      var c = Math.cos(ang), s = Math.sin(ang), hx = w / 2, hz = l / 2, q = [[-hx, -hz], [hx, -hz], [-hx, hz], [hx, hz]].map(function (p) { return [cx + p[0] * c - p[1] * s, cz + p[0] * s + p[1] * c]; });
      A[name].push(q[0][0], 0.012, q[0][1], q[2][0], 0.012, q[2][1], q[1][0], 0.012, q[1][1], q[1][0], 0.012, q[1][1], q[2][0], 0.012, q[2][1], q[3][0], 0.012, q[3][1]);
    }
    function tri(name, ax, ay, az, bx0, by, bz, cx, cy, cz, sh) { A[name].push(ax, ay, az, bx0, by, bz, cx, cy, cz); for (var q = 0; q < 3; q++) CL[name].push(sh, sh, sh); }
    function dome(name, cx, cz, rx, rz, h, sh) {
      var n = 7, j, a0, a1, m = 0.55;
      for (j = 0; j < n; j++) {
        a0 = j / n * 6.283; a1 = (j + 1) / n * 6.283;
        var x0 = Math.cos(a0), z0 = Math.sin(a0), x1 = Math.cos(a1), z1 = Math.sin(a1), lit = sh * (0.84 + 0.2 * Math.cos((a0 + a1) / 2 - 0.9));   /* one side in light, the other in shade: that is what makes it read as a hump */
        tri(name, cx, h, cz, cx + x1 * rx * m, h * 0.72, cz + z1 * rz * m, cx + x0 * rx * m, h * 0.72, cz + z0 * rz * m, sh * 0.99);
        tri(name, cx + x0 * rx * m, h * 0.72, cz + z0 * rz * m, cx + x1 * rx * m, h * 0.72, cz + z1 * rz * m, cx + x1 * rx, 0, cz + z1 * rz, lit);
        tri(name, cx + x0 * rx * m, h * 0.72, cz + z0 * rz * m, cx + x1 * rx, 0, cz + z1 * rz, cx + x0 * rx, 0, cz + z0 * rz, lit);
      }
    }
    function pebble(name, cx, cz, s, sh) {
      var a = rnd(0, 6.28), j, p = [];
      for (j = 0; j < 4; j++) p.push([cx + Math.cos(a + j * 1.571) * s * rnd(0.7, 1.2), cz + Math.sin(a + j * 1.571) * s * rnd(0.7, 1.2)]);
      for (j = 0; j < 4; j++) tri(name, cx, s * 0.75, cz, p[(j + 1) % 4][0], 0, p[(j + 1) % 4][1], p[j][0], 0, p[j][1], sh * (0.85 + 0.1 * j));
    }
    /* which lanes are what: [x from, x to, surface] */
    var bands = R.base ? [[-7.9, 7.9, R.base]] : (key === 'country' ? [[-3.9, 3.9, 'asphalt'], [-7.9, -4.4, 'dirt'], [4.4, 7.9, 'dirt']] : [[-7.9, 7.9, key === 'snow' ? 'snow' : 'asphalt']]);
    copies.forEach(function (z0) {
      /* the same chunk five times: the random numbers are replayed, so every copy is alike and the loop has no seam */
      var seed = 9173 + key.length * 131, rn = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }, R2 = function (a, b) { return a + (b - a) * rn(); };
      bands.forEach(function (bd) {
        var x0 = bd[0], x1 = bd[1], wd = (x1 - x0) / 15.8, kind = bd[2], out = key === 'country' && kind === 'dirt' ? 'solidOut' : 'solid', n, j, cx, cz, a, l, s;
        if (kind === 'asphalt') {
          for (n = 0; n < Math.round(16 * wd); n++) { cx = R2(x0, x1); cz = z0 + R2(0, DET_P); a = R2(-0.5, 0.5) + (rn() < 0.3 ? 1.57 : 0); for (j = 0; j < 3; j++) { l = R2(0.6, 1.7); flat('crack', cx, cz, R2(0.035, 0.06), l, a); cx += -Math.sin(a) * l * 0.9 + R2(-0.05, 0.05); cz += Math.cos(a) * l * 0.9; a += R2(-0.7, 0.7); } }
          for (n = 0; n < Math.round(6 * wd); n++) flat('patch', R2(x0 + 0.9, x1 - 0.9), z0 + R2(0, DET_P), R2(1.0, 2.2), R2(1.6, 4.2), R2(-0.06, 0.06));
          for (n = 0; n < Math.round(7 * wd); n++) flat('light', R2(x0 + 0.5, x1 - 0.5), z0 + R2(0, DET_P), R2(0.5, 1.3), R2(4, 11), R2(-0.03, 0.03));
          for (n = 0; n < Math.round(3 * wd); n++) { cx = R2(x0 + 1.2, x1 - 1.2); cz = z0 + R2(0, DET_P); l = R2(6, 15); a = R2(-0.08, 0.08); flat('patch', cx - 0.72, cz, 0.2, l, a); flat('patch', cx + 0.72, cz, 0.2, l, a); flat('patch', cx - 0.72, cz, 0.12, l * 0.8, a); flat('patch', cx + 0.72, cz, 0.12, l * 0.8, a); }
          if (key === 'city') for (n = 0; n < 3; n++) { cx = [-6, -2, 2, 6][(rn() * 4) | 0] + R2(-0.5, 0.5); cz = z0 + R2(0, DET_P); for (j = 0; j < 8; j++) { a = j / 8 * 6.283; flat('crack', cx + Math.cos(a) * 0.36, cz + Math.sin(a) * 0.36, 0.05, 0.3, -a); } flat('patch', cx, cz, 0.62, 0.62, 0.78); flat('patch', cx, cz, 0.62, 0.62, 0); }
        } else if (kind === 'snow') {
          for (n = 0; n < Math.round(34 * wd); n++) dome(out, R2(x0, x1), z0 + R2(0, DET_P), R2(0.25, 0.8), R2(0.3, 1.0), R2(0.04, 0.1), R2(1.0, 1.12));
          for (n = 0; n < Math.round(7 * wd); n++) flat('patch', R2(x0 + 0.6, x1 - 0.6), z0 + R2(0, DET_P), R2(0.5, 1.2), R2(3, 9), R2(-0.04, 0.04));
        } else {
          var gravel = kind === 'gravel';
          for (n = 0; n < Math.round((gravel ? 30 : 40) * wd); n++) { cx = R2(x0, x1); cz = z0 + R2(0, DET_P); l = R2(0.4, 1.3); s = R2(0.5, 1.7); dome(out, cx, cz, l, s, R2(0.07, 0.16), R2(0.84, 1.0)); flat('patch', cx - l * 0.75, cz + s * 0.2, l * 0.9, s * 1.5, 0.3); }   /* each hump has its shaded hollow beside it */
          for (n = 0; n < Math.round((gravel ? 190 : 80) * wd); n++) { s = gravel ? (rn() < 0.12 ? R2(0.16, 0.26) : R2(0.05, 0.13)) : R2(0.05, 0.16); pebble(out, R2(x0, x1), z0 + R2(0, DET_P), s, gravel ? R2(0.7, 1.35) : R2(0.6, 1.0)); }
          for (n = 0; n < Math.round(7 * wd); n++) flat('patch', R2(x0 + 0.8, x1 - 0.8), z0 + R2(0, DET_P), R2(1.2, 2.6), R2(1.6, 4.5), R2(-0.5, 0.5));
          if (!gravel) for (n = 0; n < Math.round(10 * wd); n++) flat('patch', R2(x0 + 0.6, x1 - 0.6), z0 + R2(0, DET_P), R2(0.3, 0.6), R2(0.4, 0.9), R2(0, 3));   /* small hollows */
        }
      });
    });
    for (k in A) {
      if (!A[k].length) continue;
      var g = new T.BufferGeometry(), pos = new Float32Array(A[k]), nor = new Float32Array(pos.length), v = 0, ax, ay, az, bx1, by1, bz1, nx, ny, nz, ln;
      for (i = 0; i < pos.length; i += 9) {   /* flat-shaded normals: the facets are what make a hump read as a hump */
        ax = pos[i + 3] - pos[i]; ay = pos[i + 4] - pos[i + 1]; az = pos[i + 5] - pos[i + 2]; bx1 = pos[i + 6] - pos[i]; by1 = pos[i + 7] - pos[i + 1]; bz1 = pos[i + 8] - pos[i + 2];
        nx = ay * bz1 - az * by1; ny = az * bx1 - ax * bz1; nz = ax * by1 - ay * bx1; ln = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1; if (ny < 0) { nx = -nx; ny = -ny; nz = -nz; }
        for (v = 0; v < 3; v++) { nor[i + v * 3] = nx / ln; nor[i + v * 3 + 1] = ny / ln; nor[i + v * 3 + 2] = nz / ln; }
      }
      g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('normal', new T.BufferAttribute(nor, 3));
      if (CL[k]) g.setAttribute('color', new T.BufferAttribute(new Float32Array(CL[k]), 3));
      var mesh = new T.Mesh(g, detMat[k]); mesh.receiveShadow = true; mesh.frustumCulled = false; if (CL[k]) mesh.material.side = T.DoubleSide; lg.add(mesh);
    }
    lg.visible = false; return lg;
  }
  function setRegion(key) {
    var k, i, list, on;
    region = REGIONS[key] || REGIONS.city;
    if (!roadDetail[region.key]) roadDetail[region.key] = buildDetail(region.key);
    if (region.key === 'creek' && !streamStrip.children.length) {
      var tile = bake(ribbon(120, 3.9, 0, 4.5, 60, 21));
      [-420, -300, -180, -60, 60].forEach(function (z, ti) { var cp = ti ? tile.clone() : tile; cp.position.set(19.6, 0, z); streamStrip.add(cp); });
    }
    for (k in roadDetail) roadDetail[k].visible = k === region.key;
    if (region.key === 'highway') hwCars();
    for (k in regionScenery) { list = regionScenery[k]; on = k === region.key; for (i = 0; i < list.length; i++) list[i].visible = on; }
    sceneryNow = regionScenery[region.key];
    dashes.visible = region.marks === 'city'; cDash.visible = region.marks === 'country';
    for (i = 0; i < edgeLines.length; i++) edgeLines[i].visible = region.marks === 'city';
    for (i = 0; i < cEdges.length; i++) cEdges[i].visible = region.marks === 'country';
    for (i = 0; i < sideRails.length; i++) sideRails[i].visible = region.rail;
    for (i = 0; i < sideKerbs.length; i++) sideKerbs[i].visible = region.kerb;
    posts.visible = region.rail; lamps.visible = region.lamps; seaStrip.visible = region.key === 'coast'; snowStakes.visible = region.key === 'snow';
    for (i = 0; i < hwParts.length; i++) hwParts[i].visible = region.key === 'highway';
    guardStones.visible = region.key === 'mountain'; streamStrip.visible = region.key === 'creek';
  }
  /* material colours for the region at the current time of day, then darkened by rain or whitened by snow */
  var dayRoad = PRESETS.day.road, tintC = new T.Color(), tmpC = new T.Color(), snowC = C(0xf2f6fa), wetK = 0;
  function regionColors(dt, wet, cover) {
    var R = region, i, o, tk, list = sceneryNow;
    tintC.setRGB(cur.road.r / dayRoad.r, cur.road.g / dayRoad.g, cur.road.b / dayRoad.b);
    skyLin.copy(scene.background).convertSRGBToLinear();   /* the background is drawn as it is; a material has to aim at its linear value to match it */
    if (!R.groundC) { groundMat.color.copy(cur.ground); roadMat.color.copy(cur.road); roadOutMat.color.copy(cur.road); walkMat.color.copy(cur.walk); shoulderMat.color.copy(cur.road).multiplyScalar(0.78); }
    else {
      groundMat.color.copy(R.groundC).multiply(tintC).multiplyScalar(1 - 0.3 * cur.night);
      roadMat.color.copy(R.roadC).multiply(tintC); roadOutMat.color.copy(R.roadOutC).multiply(tintC);
      shoulderMat.color.copy(R.shoulderC).multiply(tintC); walkMat.color.copy(R.walkC).multiply(tintC);
    }
    wetK = lerp(wetK, wet, 1 - Math.exp(-dt * 1.5));
    if (wetK > 0.01) {
      roadMat.color.multiplyScalar(1 - 0.36 * wetK * (1 - 0.5 * cur.night)); roadOutMat.color.multiplyScalar(1 - 0.3 * wetK * (1 - 0.5 * cur.night)); shoulderMat.color.multiplyScalar(1 - 0.28 * wetK);
      groundMat.color.multiplyScalar(1 - 0.14 * wetK); walkMat.color.multiplyScalar(1 - 0.2 * wetK);
    }
    roadMat.roughness = roadOutMat.roughness = 0.85 - 0.5 * wetK;
    if (cover > 0.01) {
      tmpC.copy(snowC).multiply(tintC);
      groundMat.color.lerp(tmpC, cover); walkMat.color.lerp(tmpC, cover); shoulderMat.color.lerp(tmpC, cover * 0.85); roadMat.color.lerp(tmpC, cover * 0.62); roadOutMat.color.lerp(tmpC, cover * 0.72);
    }
    /* wheel tracks: ruts in a dirt road, dark lines of bare asphalt through snow */
    tk = cover > 0.3 ? 1 : (R.tracks ? 2 : 0);
    for (i = 0; i < trackStrips.length; i++) trackStrips[i].visible = tk > 0;
    if (tk === 1) { trackMat.color.copy(snowTrackC).multiply(tintC); trackMat.opacity = 0.42 * cover * (1 - tunK); }
    else if (tk === 2) { trackMat.color.copy(R.tracks.c).multiply(tintC); trackMat.opacity = R.tracks.a; }
    /* road detail takes the colour of the road it lies on, so it follows the hour, the rain and the snow; in a tunnel and at the lowest graphics setting it is left out */
    detMat.solid.color.copy(roadMat.color); detMat.solidOut.color.copy(roadOutMat.color);
    if (roadDetail[R.key]) roadDetail[R.key].visible = gfxNow !== 'low' && tunK < 0.5;
    detMat.crack.opacity = 0.42 * (1 - cover); detMat.patch.opacity = 0.14 * (1 - 0.5 * cover); detMat.light.opacity = 0.1 * (1 - cover) * (1 - 0.7 * wetK);
    flowTex.offset.y = (time * 0.55) % 1; RM.stream.color.copy(skyLin).lerp(streamC, 0.55).multiply(tintC); RM.bank.color.copy(roadMat.color).multiplyScalar(0.6); RM.foam.color.copy(foamC).multiply(tintC);
    /* standing water mirrors the sky, mud and ice take the light of the hour */
    RM.water.color.copy(skyLin).lerp(roadMat.color, 0.45); RM.mud.color.copy(mudC).multiply(tintC); RM.ice.color.copy(iceC).multiply(tintC);
    if (R.key === 'coast') { seaMat.color.copy(seaC).multiply(tintC); seaTex.offset.y = (dist / 14.667 + time * 0.03) % 1; seaTex.offset.x = (time * 0.012) % 1; }
    for (i = 0; i < list.length; i++) {
      o = list[i];
      if (o.userData.mount) { var dd = Math.sqrt(o.position.x * o.position.x + o.position.z * o.position.z); o.material.color.copy(o.userData.base).multiply(tintC).lerp(skyLin, clamp(dd / (scene.fog.far * 2.5), 0.3, 1)); }
      else if (o.userData.bob !== undefined) o.rotation.z = Math.sin(time * 1.1 + o.userData.bob) * 0.05;
    }
  }

  /* --- what the wheels are on: region and lane first, then weather; a patch on the road (mud, water, ice) overrides both --- */
  var sfc = { key: 'asphalt', grip: 1, cap: 1, drag: 0, bump: 0 }, zoneNow = '', zoneSeen = '';
  function surfKey(x, d) {
    if (inTunnel(d)) return 'asphalt';
    var ax = Math.abs(x), k = 'asphalt';
    if (region.base) k = ax > 8.1 ? (region.verge || region.base) : region.base;
    else if (region.key === 'country') k = ax > 8.1 ? 'grass' : (ax > 4.15 ? 'dirt' : 'asphalt');
    if (snowCover > 0.35) return 'snow';
    if (weather.wet > 0.3) return k === 'asphalt' ? 'wet' : (k === 'dirt' ? 'wetdirt' : k);
    return k;
  }
  /* tyres: bought once, fitted per car. Each is better on one kind of surface and pays for it on another. grp: p = dry asphalt, w = wet, s = snow and ice, l = loose (dirt, gravel, grass, mud) */
  var SURF_GRP = { asphalt: 'p', wet: 'w', water: 'w', snow: 's', ice: 's', dirt: 'l', wetdirt: 'l', grass: 'l', mud: 'l', gravel: 'l' };
  var TIRES = {
    allseason: { name: '사계절 타이어', price: 0, color: 0x5a6068, desc: '기본 타이어. 어느 길에서나 무난하다', stat: '보정 없음',
      more: '모든 차량에 처음부터 달려 있는 타이어. 어느 노면에서도 손해도 이득도 없다.' },
    sport: { name: '스포츠 타이어', price: 500, color: 0xe53935, desc: '마른 아스팔트에서 잘 돌고 잘 선다. 젖은 길과 눈길, 흙길에서는 불리하다', stat: '마른 아스팔트 접지력 +12% · 젖은 길과 눈길 접지력 손실 1.3배 · 비포장 속도 상한 −8%',
      more: '마른 아스팔트에서 접지력이 12% 높아져 좌우 이동과 제동, 출발이 빨라진다. 대신 젖은 노면과 눈길에서는 접지력을 1.3배 더 잃고, 비포장에서는 속도 상한이 8% 낮아진다.',
      add: { p: 0.12 }, loss: { w: 1.3, s: 1.3 }, capMul: { l: 0.92 } },
    rain: { name: '레인 타이어', price: 400, color: 0x2f8fe0, desc: '젖은 길에서 접지력을 덜 잃고 물웅덩이를 잘 가른다', stat: '젖은 노면 접지력 손실 0.4배 · 물웅덩이 진입 속도 손실 절반',
      more: '깊은 배수 홈으로 젖은 노면과 물웅덩이에서 접지력 손실이 0.4배로 줄고, 물에 들어설 때 잃는 속도가 절반이 된다. 마른 길에서는 사계절 타이어와 같다.',
      loss: { w: 0.4 }, zone: { water: 0.5 } },
    winter: { name: '윈터 타이어', price: 500, color: 0x9ccbe6, desc: '눈길과 빙판에서 접지력을 덜 잃는다. 마른 길에서는 최고속도가 조금 줄어든다', stat: '눈길·빙판 접지력 손실 0.45배 · 눈길 속도 상한 +40% 회복 · 마른 아스팔트 속도 상한 −3%',
      more: '부드러운 고무와 잔 홈으로 눈길과 빙판에서 접지력 손실이 0.45배로 줄고, 눈길에서 깎인 속도 상한을 40% 되찾는다. 마른 아스팔트에서는 속도 상한이 3% 낮아진다.',
      loss: { s: 0.45 }, capGain: { s: 0.4 }, capMul: { p: 0.97 } },
    allterrain: { name: '올터레인 타이어', price: 600, color: 0x8a6a4a, desc: '흙길, 자갈, 풀밭, 진흙에서 빠르고 덜 흔들린다. 아스팔트에서는 조금 둔하다', stat: '비포장 속도 상한 +50% 회복 · 저항 0.6배 · 흔들림 0.7배 · 진흙 진입 손실 절반 · 아스팔트 접지력 −5%, 속도 상한 −4%',
      more: '굵은 블록 무늬로 비포장에서 깎인 속도 상한을 50% 되찾고, 추가 저항이 0.6배, 흔들림이 0.7배가 된다. 진흙에 들어설 때 잃는 속도도 절반이다. 아스팔트에서는 접지력이 5%, 속도 상한이 4% 낮아진다.',
      capGain: { l: 0.5 }, dragMul: { l: 0.6 }, bumpMul: { l: 0.7 }, zone: { mud: 0.5 }, add: { p: -0.05, w: -0.03 }, capMul: { p: 0.96, w: 0.96 } },
    runflat: { name: '런플랫 타이어', price: 450, color: 0xf2b01e, desc: '잔해와 포트홀을 밟아도 피해와 속도 손실이 적다', stat: '잔해·바위·포트홀 피해 0.4배 · 잔해로 잃는 속도 절반',
      more: '옆벽이 단단해 잔해, 자갈, 바위, 포트홀을 밟을 때 받는 피해가 0.4배가 되고 잃는 속도가 절반이 된다. 접지력은 사계절 타이어와 같다.',
      debris: 0.4 }
  };
  var TIRE_ORDER = ['allseason', 'sport', 'rain', 'winter', 'allterrain', 'runflat'], playerTire = 'allseason';
  function surfaceFor(car, x, d, zone, out, tire) {
    var k = zone || surfKey(x, d), s = SURF[k], rough = car.rough || 0, drv = car.spec.drive, loss = (drv === '사륜' ? 0.6 : (drv === '후륜' ? 1.15 : 1)) * (1 - 0.2 * rough), t = tire ? TIRES[tire] : null, g = SURF_GRP[k];
    if (t && t.loss && t.loss[g]) loss *= t.loss[g];
    out.key = k; out.grip = clamp(1 - (1 - s.grip) * loss, 0.12, 1); out.cap = s.cap + (1 - s.cap) * 0.5 * rough; out.drag = s.drag * (1 - 0.6 * rough); out.bump = s.bump * (1 - 0.5 * rough);
    if (t) {
      if (t.add && t.add[g]) out.grip = clamp(out.grip + t.add[g], 0.12, 1.12);
      if (t.capGain && t.capGain[g]) out.cap += (1 - out.cap) * t.capGain[g];
      if (t.capMul && t.capMul[g]) out.cap *= t.capMul[g];
      if (t.dragMul && t.dragMul[g]) out.drag *= t.dragMul[g];
      if (t.bumpMul && t.bumpMul[g]) out.bump *= t.bumpMul[g];
    }
    return out;
  }

  /* --- road objects of the new regions --- */
  var humpMat = (function () {
    var c = document.createElement('canvas'); c.width = 256; c.height = 16; var x = c.getContext('2d');
    for (var i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#1c1d20' : '#f2c230'; x.fillRect(i * 16, 0, 16, 16); }
    var tx = new T.CanvasTexture(c); tx.encoding = T.sRGBEncoding; return new T.MeshStandardMaterial({ map: tx, roughness: 0.8 });
  })();
  /* a patch lying on the road; round ones are pinched into an ellipse row by row so they still bend with the hills */
  function flatPatch(w, l, mat, rows, round) {
    var geo = new T.PlaneGeometry(w, l, 2, rows), pos = geo.attributes.position, i, t;
    if (round) {
      var ph = Math.random() * 6, lean = (Math.random() - 0.5) * 0.5;
      for (i = 0; i < pos.count; i++) { t = pos.getY(i) / (l / 2); var wob = 0.78 + 0.22 * Math.sin(t * 5.3 + ph) + 0.1 * Math.sin(t * 11.7 + ph * 2); pos.setX(i, pos.getX(i) * Math.sqrt(Math.max(0.03, 1 - t * t)) * wob + lean * w * 0.25 * Math.sin(t * 3.1 + ph)); }
    }
    var m = new T.Mesh(geo, mat); m.rotation.x = -Math.PI / 2; m.position.y = 0.02; m.receiveShadow = true; return m;
  }
  BUILD.rock = function () { var g = new T.Group(); var a = boulder(0.95); a.position.y = 0.5; g.add(a); var b = boulder(0.5, RM.rockB); b.position.set(0.7, 0.25, 0.5); g.add(b); g.userData.baseY = 0; g.userData.body = RM.rock; return g; };
  BUILD.log = function () { var g = new T.Group(); g.add(cyl(0.32, 0.36, 3.3, 8, RM.wood, 0, 0.34, 0, 'x')); g.add(cyl(0.08, 0.08, 0.7, 5, RM.woodD, 0.6, 0.7, 0)); g.userData.baseY = 0; g.userData.body = RM.wood; return g; };
  BUILD.bale = function () { var g = new T.Group(); g.add(cyl(0.68, 0.68, 1.25, 12, RM.bale, 0, 0.68, 0, 'x')); g.userData.baseY = 0; g.userData.body = RM.bale; return g; };
  BUILD.snowpile = function () { var g = new T.Group(); var m = shadowed(new T.Mesh(rockGeo, RM.snow)); m.scale.set(1.25, 0.7, 1.3); m.position.y = 0.3; g.add(m); g.userData.baseY = 0; g.userData.body = RM.snow; return g; };
  BUILD.mud = function () { var g = new T.Group(); g.add(flatPatch(3.6, 14.5, RM.mud, 10, true)); g.userData.baseY = 0; return g; };
  BUILD.puddle = function () { var g = new T.Group(); g.add(flatPatch(3.2, 9.5, RM.water, 8, true)); g.userData.baseY = 0; return g; };
  BUILD.ice = function () { var g = new T.Group(); g.add(flatPatch(3.7, 16.5, RM.ice, 10, true)); g.userData.baseY = 0; return g; };
  BUILD.ford = function () {
    var g = new T.Group(), rb = ribbon(23.6, 4.3, 0, 1.6); rb.rotation.y = Math.PI / 2; g.add(rb);   /* the same winding water, laid across the road */
    for (var i = 0; i < 10; i++) { var st = boulder(rnd(0.25, 0.5), RM.rockB); st.position.set(-10.5 + i * 2.3 + rnd(-0.5, 0.5), 0.1, (i % 2 ? 1 : -1) * rnd(4.4, 5)); g.add(st); }
    g.userData.baseY = 0; return g;
  };
  /* a crate of parts to collect: bright, with a beacon so it can be seen from far off */
  BUILD.cargo = function () {
    var g = new T.Group(), ym = std(0xffc21a, 0.5), beam = new T.MeshBasicMaterial({ color: 0xffe28a, transparent: true, opacity: 0.35, depthWrite: false, fog: false });
    g.add(bx(1.1, 0.9, 1.1, ym, 0, 0.6, 0)); g.add(bx(1.14, 0.2, 1.14, M.dark, 0, 0.6, 0)); g.add(bx(0.3, 0.3, 0.3, M.coil, 0, 1.2, 0));
    var col = new T.Mesh(new T.CylinderGeometry(0.16, 0.16, 9, 6), beam); col.position.y = 5.6; g.add(col);
    var gl = glowSprite(0xffd23d, 5, 0.7); gl.position.y = 0.9; g.add(gl);
    g.userData.baseY = 0; return g;
  };
  BUILD.hump = function () { var g = new T.Group(); var m = new T.Mesh(new T.BoxGeometry(8.3, 0.14, 1.3), humpMat); m.position.y = 0.07; m.receiveShadow = true; g.add(m); g.userData.baseY = 0; return g; };
  BUILD.cottage = function () {
    var g = new T.Group(), hs = house(rnd(6, 7.5), 4.6, 2.7, Math.random() < 0.5 ? RM.wall : RM.wall2, pick([RM.roofB, RM.roofO, RM.roofG, RM.roofR])); g.add(hs);
    g.add(bx(8.5, 0.9, 0.3, M.concrete, 0, 0.45, 3.6));
    g.userData.baseY = 0; return g;
  };

  /* pothole: a broken patch of asphalt; a wheel drops into it */
  BUILD.pothole = function () {
    var g = new T.Group(), dark = new T.MeshStandardMaterial({ color: C(0x15161a), roughness: 1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    var rim = new T.MeshStandardMaterial({ color: C(0xa3a7ad), roughness: 1, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
    var a = flatPatch(2.0, 2.5, rim, 4, true); a.rotation.z = rnd(-0.5, 0.5); g.add(a);
    var b = flatPatch(1.35, 1.75, dark, 4, true); b.rotation.z = rnd(-0.5, 0.5); b.position.y = 0.03; g.add(b);
    for (var i = 0; i < 7; i++) { var bit = new T.Mesh(rockGeo, M.gravel); bit.scale.set(0.1, 0.06, 0.1); bit.position.set(rnd(-0.85, 0.85), 0.05, rnd(-1.1, 1.1)); g.add(bit); }
    g.userData.baseY = 0; return g;
  };
  BUILD.gantry = function () {
    var g = new T.Group(), mat = new T.MeshStandardMaterial({ color: C(0x8a9098), roughness: 0.6, metalness: 0.4, transparent: true }), names = ['한울 12 km', '휴게소 2 km', '톨게이트 1 km', '출구 500 m'];
    [-8.8, 12.0].forEach(function (x) { var p = new T.Mesh(new T.BoxGeometry(0.4, 7.6, 0.4), mat); p.position.set(x, 3.8, 0); p.castShadow = true; g.add(p); });
    var beam = new T.Mesh(new T.BoxGeometry(21.2, 0.5, 0.5), mat); beam.position.set(1.6, 7.4, 0); g.add(beam);
    [-4, 4].forEach(function (x, i) { var sg = new T.Mesh(new T.PlaneGeometry(5.6, 1.8), textMat(names[(Math.random() * names.length) | 0], '#ffffff', '#1f7a4a', 512, 164)); sg.position.set(x, 6.4, 0.3); g.add(sg); });
    g.userData.mat = mat; g.userData.baseY = 0; return g;
  };
  BUILD.tollgate = function () {
    var g = new T.Group(), mat = new T.MeshStandardMaterial({ color: C(0xd9dde2), roughness: 0.7, transparent: true }), blue = new T.MeshBasicMaterial({ color: C(0x1a5fb4) });
    var roof = new T.Mesh(new T.BoxGeometry(22, 0.8, 11), mat); roof.position.y = 6.6; roof.castShadow = true; g.add(roof);
    var sign = new T.Mesh(new T.PlaneGeometry(9, 1.3), textMat('한울 톨게이트', '#ffffff', '#1a5fb4', 512, 74)); sign.position.set(0, 6.6, 5.52); g.add(sign);
    [-8.1, -4, 0, 4, 8.1].forEach(function (x) {
      g.add(bx(1.0, 0.3, 9, M.concrete, x, 0.15, 0)); g.add(bx(0.9, 2.2, 2.2, M.white, x, 1.4, 0)); g.add(bx(0.92, 0.7, 1.6, M.glass, x, 1.9, 0));
      g.add(bx(0.3, 5.0, 0.3, M.pole, x, 3.7, -1.6)); g.add(bx(0.5, 1.0, 0.5, M.cone, x, 0.8, 4.2));
    });
    [-6, -2, 2, 6].forEach(function (x, i) { var ln = new T.Mesh(new T.PlaneGeometry(2.6, 26), blue); ln.rotation.x = -Math.PI / 2; ln.position.set(x, 0.02, 4); if (i === 1 || i === 2) g.add(ln); });
    g.userData.mat = mat; g.userData.baseY = 0; return g;
  };
  BUILD.rockpile = function () { var g = new T.Group(); for (var i = 0; i < 7; i++) { var r = boulder(rnd(0.6, 1.3), i % 2 ? RM.rock : RM.rockB); r.position.set(rnd(-1.4, 1.4), rnd(0.3, 1.2), rnd(-1.4, 1.4)); g.add(r); } g.userData.baseY = 0; return g; };
  /* running water: a ribbon with wandering banks. Its ends are pinned (same width, same place, no slope), so any two pieces join without a seam; `dx` is how far it moves sideways over its length */
  var flowTex = (function () {
    var c = document.createElement('canvas'), g, i; c.width = 64; c.height = 256; g = c.getContext('2d');
    g.fillStyle = '#b8c4cc'; g.fillRect(0, 0, 64, 256);
    for (i = 0; i < 46; i++) { var x = Math.random() * 64, y = Math.random() * 256, l = 20 + Math.random() * 60; g.strokeStyle = 'rgba(255,255,255,' + (0.25 + Math.random() * 0.5) + ')'; g.lineWidth = 1 + Math.random() * 1.6; g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + 4, y + l * 0.3, x - 4, y + l * 0.7, x + 1, y + l); g.stroke(); }
    for (i = 0; i < 20; i++) { g.fillStyle = 'rgba(40,60,70,' + (0.1 + Math.random() * 0.2) + ')'; g.beginPath(); g.ellipse(Math.random() * 64, Math.random() * 256, 4 + Math.random() * 8, 10 + Math.random() * 22, 0, 0, 6.3); g.fill(); }
    var t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.encoding = T.sRGBEncoding; return t;
  })();
  RM.stream = new T.MeshStandardMaterial({ color: C(0x6fa8c4), map: flowTex, roughness: 0.14, metalness: 0.2, transparent: true, opacity: 0.9, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  RM.bank = new T.MeshStandardMaterial({ color: C(0x5a5346), roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
  RM.foam = new T.MeshStandardMaterial({ color: C(0xeef6f8), roughness: 0.6, transparent: true, opacity: 0.55, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
  function ribbon(len, half, dx, wob, rowsN, stones) {
    var N = rowsN || 24, P = [], Nn = [], U = [], BP = [], BN = [], FP = [], FN = [], i, t, w, cx, hw, z, rows = [], ph = rnd(0, 6.28), ph2 = rnd(0, 6.28), a1 = rnd(0.25, 0.6) * wob, bw1 = rnd(0, 6.28), bw2 = rnd(0, 6.28);
    for (i = 0; i <= N; i++) {
      t = i / N; w = Math.sin(Math.PI * t); w *= w; z = len / 2 - t * len;
      cx = -dx / 2 + dx * t * t * (3 - 2 * t) + a1 * Math.sin(6.283 * t * 1.5 + ph) * w;
      hw = half * (1 + 0.24 * Math.sin(6.283 * t * 2 + ph2) * w);
      rows.push([z, cx - hw, cx + hw, cx - hw - 0.5 - 0.3 * (0.5 + 0.5 * Math.sin(t * 19 + bw1)) * w - 0.12, cx + hw + 0.5 + 0.3 * (0.5 + 0.5 * Math.sin(t * 23 + bw2)) * w + 0.12, t]);
    }
    function quad(A, Nm, x0, z0, x1, z1, x2, z2, x3, z3, y) { A.push(x0, y, z0, x1, y, z1, x2, y, z2, x1, y, z1, x3, y, z3, x2, y, z2); for (var q = 0; q < 6; q++) Nm.push(0, 1, 0); }
    for (i = 0; i < N; i++) {
      var a = rows[i], b = rows[i + 1];
      quad(BP, BN, a[3], a[0], a[4], a[0], b[3], b[0], b[4], b[0], 0.012);
      quad(P, Nn, a[1], a[0], a[2], a[0], b[1], b[0], b[2], b[0], 0.03);
      U.push(0, a[5] * len / 5, 1, a[5] * len / 5, 0, b[5] * len / 5, 1, a[5] * len / 5, 1, b[5] * len / 5, 0, b[5] * len / 5);
      quad(FP, FN, a[1] - 0.07, a[0], a[1] + 0.1, a[0], b[1] - 0.07, b[0], b[1] + 0.1, b[0], 0.04);
      quad(FP, FN, a[2] - 0.1, a[0], a[2] + 0.07, a[0], b[2] - 0.1, b[0], b[2] + 0.07, b[0], 0.04);
    }
    function mk(A, Nm, mat, uv) { var g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(new Float32Array(A), 3)); g.setAttribute('normal', new T.BufferAttribute(new Float32Array(Nm), 3)); if (uv) g.setAttribute('uv', new T.BufferAttribute(new Float32Array(uv), 2)); var m = new T.Mesh(g, mat); m.receiveShadow = true; return m; }
    var grp = new T.Group(); grp.add(mk(BP, BN, RM.bank)); grp.add(mk(P, Nn, RM.stream, U)); grp.add(mk(FP, FN, RM.foam));
    /* stones on the banks and a couple standing in the water */
    for (i = 0; i < (stones || 7); i++) { var rw = rows[2 + ((Math.random() * (N - 3)) | 0)], inW = i % 7 > 4, sd = Math.random() < 0.5 ? 3 : 4, st = boulder(inW ? rnd(0.16, 0.26) : rnd(0.14, 0.34), i % 2 ? RM.rock : RM.rockB); st.position.set(inW ? lerp(rw[1], rw[2], rnd(0.25, 0.75)) : rw[sd] + (sd === 3 ? 0.15 : -0.15), inW ? 0.05 : 0.08, rw[0]); st.castShadow = false; grp.add(st); }
    grp.userData.baseY = 0; return grp;
  }
  function streamKey(dx) { var k = 'sb_' + dx; if (!BUILD[k]) BUILD[k] = function () { return ribbon(20, 1.25, dx, 1); }; return k; }
  BUILD.streamseg = function () { return ribbon(20, 1.25, 0, 1); };
  BUILD.zone = function () { var g = new T.Group(); g.userData.baseY = 0; return g; };   /* a patch of surface with nothing to draw: part of a larger shape drawn elsewhere */
  /* --- sections that belong to one region --- */
  var L4 = [-6, -2, 2, 6];
  /* village: houses close to the road, speed humps across the paved lanes, silage bales left on the dirt lanes */
  function genVillage(d0) {
    var d1 = d0 + rrnd(210, 270), t;
    sections.push({ type: 'village', d0: d0, d1: d1 });
    for (t = d0 + 40; t < d1 - 25; t += 85) addProp('hump', t, 0, { solid: { hw: 3.4, hl: 0.2, kind: 'hump', soft: 1 } });
    [-1, 1].forEach(function (s) { for (t = d0 + rrnd(8, 28); t < d1 - 8; t += rrnd(26, 40)) addProp('cottage', t, s * rrnd(16.4, 18.4), { ry: -s * Math.PI / 2 }); });
    for (t = d0 + rrnd(30, 60); t < d1 - 20; t += rrnd(45, 80)) addProp('bale', t, rpick([-6, 6]) + rrnd(-0.6, 0.6), { solid: EDGE_SOLID.bale });
    genShoulder(d0, d1);
    return d1;
  }
  function genMud(d0) {
    var d1 = d0 + rrnd(170, 220), t, i = 0, a, b;
    sections.push({ type: 'mud', d0: d0, d1: d1 });
    for (t = d0 + 20; t < d1 - 20; t += rrnd(24, 34), i++) {
      a = rpick(L4); b = rr() < 0.45 ? rpick(L4) : a;
      addProp('mud', t, a, { solid: { hw: 0.9, hl: 6, kind: 'mud', soft: 160 } });
      if (b !== a) addProp('mud', t + 6, b, { solid: { hw: 0.9, hl: 6, kind: 'mud', soft: 160 } });
      if (i % 3 === 2) addProp('log', t + 14, rpick(L4), { ry: rrnd(-0.2, 0.2), solid: EDGE_SOLID.log });
    }
    genShoulder(d0, d1);
    return d1;
  }
  function genRocks(d0) {
    var d1 = d0 + rrnd(160, 200), t, a, b;
    sections.push({ type: 'rocks', d0: d0, d1: d1 });
    for (t = d0 + 24; t < d1 - 20; t += rrnd(20, 30)) {
      a = rpick(L4); b = rr() < 0.4 ? rpick(L4) : a;
      addProp('rock', t, a + rrnd(-0.8, 0.8), { ry: rrnd(0, 3), solid: EDGE_SOLID.rock });
      if (b !== a) addProp('rock', t + rrnd(4, 9), b + rrnd(-0.8, 0.8), { ry: rrnd(0, 3), solid: EDGE_SOLID.rock });
    }
    genShoulder(d0, d1);
    return d1;
  }
  /* ford: a shallow stream runs across the whole track; everything slows down in it */
  function genFord(d0) {
    var d1 = d0 + 90;
    sections.push({ type: 'ford', d0: d0, d1: d1 });
    addProp('ford', d0 + 45, 0, { solid: { hw: 10.5, hl: 3.4, kind: 'water', soft: 1 } });
    return d1;
  }
  function genIce(d0) {
    var d1 = d0 + rrnd(190, 240), t, a, b;
    sections.push({ type: 'ice', d0: d0, d1: d1 });
    for (t = d0 + 24; t < d1 - 24; t += rrnd(26, 38)) {
      a = rpick(L4); b = rr() < 0.5 ? rpick(L4) : a;
      addProp('ice', t, a, { solid: { hw: 0.95, hl: 7, kind: 'ice', soft: 170 } });
      if (b !== a) addProp('ice', t + 5, b, { solid: { hw: 0.95, hl: 7, kind: 'ice', soft: 170 } });
    }
    genShoulder(d0, d1);
    return d1;
  }
  /* rain leaves puddles in the lanes of any road */
  function genExtras(dA, dB) {
    if (weather.wet > 0.5 && region.key !== 'offroad') for (var d = dA + rrnd(20, 50); d < dB - 12; d += rrnd(45, 85)) addProp('puddle', d, rpick(L4) + rrnd(-0.5, 0.5), { solid: { hw: 0.8, hl: 3.6, kind: 'water', soft: 90 } });
  }
  /* toll plaza: booths stand on islands between the lanes; the lanes themselves are open and the shoulders end */
  function genToll(d0) {
    var d1 = d0 + 150, t;
    sections.push({ type: 'toll', d0: d0, d1: d1 });
    addProp('tollgate', d0 + 75, 0);
    [-8.1, -4, 0, 4, 8.1].forEach(function (x) { addProp('barrierW', d0 + 75, x, { solid: { hw: 0.55, hl: 4.6, kind: 'pillar' } }); for (t = 30; t >= 9; t -= 7) addProp('cone', d0 + 75 - t, x); });
    for (t = -24; t <= 10; t += 4) addProp('cone', d0 + t, 11.2 - 2.9 * ((t + 24) / 34));
    return d1;
  }
  /* landslide: rock has come down over one or two lanes; it is a wall, like a closed work-zone lane */
  function genSlide(d0) {
    var side = -1, width = rr() < 0.5 ? 8.1 : 4.1, d1 = d0 + rrnd(120, 170), t;
    sections.push({ type: 'work', d0: d0, d1: d1, side: side, width: width, slide: true });
    for (t = 0; t <= 36; t += 6) addProp('rock', d0 + t, side * (8.1 - width * (t / 36)), { ry: rrnd(0, 3) });
    for (t = d0 + 40; t < d1 - 14; t += 6) addProp('rockpile', t, side * (8.1 - width / 2) + rrnd(-width / 4, width / 4), { ry: rrnd(0, 3) });
    for (t = d0 + 40; t < d1 - 14; t += 5) addProp('rock', t, side * (8.1 - width) - side * 0.2, { ry: rrnd(0, 3) });
    genShoulder(d0, d1);
    return d1;
  }
  /* stream: the water runs down one lane, then crosses to the next; whoever stays in it keeps losing speed */
  function genStream(d0) {
    /* the water comes in from the stream beside the road, runs down one of the right-hand lanes, crosses to the next lane half way, then leaves to the right again */
    var n = Math.round(rrnd(180, 240) / 20), d1 = d0 + n * 20, a = rr() < 0.5 ? 6 : 2, b = a === 6 ? 2 : (rr() < 0.5 ? 6 : -2), m = Math.floor(n / 2), i, t, x0, x1, k, u, sx;
    sections.push({ type: 'stream', d0: d0, d1: d1 });
    for (i = 0; i < n; i++) {
      t = d0 + 10 + i * 20;
      x0 = i === 0 ? 14.5 : (i <= m ? a : b); x1 = i === n - 1 ? 14.5 : (i < m ? a : b);
      addProp(streamKey(x1 - x0), t, (x0 + x1) / 2, x0 === x1 ? { solid: { hw: 1.3, hl: 10.2, kind: 'water', soft: 140 } } : null);
      if (x0 !== x1) for (k = 0; k < 3; k++) { u = (k + 0.5) / 3; sx = x0 + (x1 - x0) * u * u * (3 - 2 * u); if (Math.abs(sx) < 9.6) addProp('zone', t - 10 + u * 20, sx, { solid: { hw: 1.4, hl: 3.6, kind: 'water', soft: 140 } }); }
    }
    genShoulder(d0, d1);
    return d1;
  }
  function genHoles(dA, dB) {
    if (!region.holes || snowCover > 0.35) return;
    var lanes = region.civLanes || L4;
    for (var d = dA + 20 + hr() * 60; d < dB - 10; d += (70 + hr() * 90) / region.holes) {
      var x = lanes[(hr() * lanes.length) | 0] + (hr() < 0.5 ? -0.85 : 0.85);
      if (laneOpen(x, d) && !inTunnel(d)) addProp('pothole', d, x, { ry: hr() * 3, solid: { hw: 0.5, hl: 0.65, kind: 'hole', soft: 70 } });
    }
  }
  var GEN = {
    work: genWork, deck: genDeck, tunnel: genTunnel, split: genSplit, under: genUnder, village: genVillage, mud: genMud, rocks: genRocks, ford: genFord, ice: genIce, toll: genToll, slide: genSlide, stream: genStream,
    hill: function (d0) { var d1 = genHill(d0); genExtras(d0 + 10, d1 - 10); genHoles(d0 + 10, d1 - 10); return d1; }
  };

