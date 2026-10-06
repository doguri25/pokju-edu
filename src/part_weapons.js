  var WEAPONS = {
    mg: { name: '기관총', slots: ['roof'], desc: '직선 연사. 같은 줄의 드론도 맞힌다', stat: '피해 1 · 초당 약 12발 · 사거리 48 m', more: '지붕에서 앞으로 곧게 쏜다. 같은 줄에 드론이 있으면 탄이 떠올라 드론도 맞힌다. 가장 다루기 쉬운 기본 무기다.' },
    bolt: { name: '전기 볼트', slots: ['roof'], desc: '자동 조준, 3대까지 연쇄', stat: '피해 2(연쇄 1) · 초당 약 4번 · 사거리 46 m', more: '조준하지 않아도 가장 가까운 적을 찾아가고 3대까지 번진다. 보급 상자도 맞힌다. 떼로 오는 오토바이에 강하다.' },
    laser: { name: '픽셀 레이저', slots: ['roof'], desc: '적을 관통하는 빠른 광선', stat: '피해 1.6 · 초당 약 6발 · 사거리 72 m · 관통', more: '빠르고 멀리 가는 광선이 한 줄의 적을 모두 뚫는다. 차선을 맞춰야 한다.' },
    shotgun: { name: '산탄포', slots: ['front'], desc: '부채꼴 5발, 짧은 사거리', stat: '피해 1 × 5발 · 초당 약 3번 · 사거리 34 m', more: '앞 범퍼에서 부채꼴로 다섯 발을 쏜다. 가까울수록 여러 발이 맞는다.' },
    flame: { name: '화염방사기', slots: ['front'], desc: '바로 앞의 적을 계속 태운다', stat: '피해 0.7 · 초당 약 16번 · 사거리 15 m', more: '바로 앞의 적을 계속 태운다. 사거리가 짧아 붙어야 하지만 덤프트럭 같은 큰 적을 빨리 녹인다.' },
    saw: { name: '톱날 범퍼', slots: ['front'], desc: '충돌로 받는 피해가 절반', stat: '충돌로 받는 피해 50% 감소', more: '쏘는 무기가 아니다. 달아 두면 적이나 잔해와 부딪혔을 때 받는 피해가 줄어든다.' },
    water: { name: '물대포', slots: ['front'], desc: '관통하는 물줄기로 적을 밀어낸다', stat: '피해 1 · 초당 약 8발 · 사거리 30 m · 관통', more: '굵은 물줄기가 적을 뚫고 지나가며 뒤로 밀어낸다. 앞을 막는 적과 거리를 벌릴 때 쓴다.' },
    cannon: { name: '캐논', slots: ['side'], desc: '느리지만 강한 관통 포탄', stat: '피해 5 × 2발 · 초당 약 2번 · 사거리 48 m · 관통', more: '좌우에서 한 발씩, 느리지만 묵직한 포탄을 쏜다. 내구가 높은 적에게 좋다.' },
    missile: { name: '유도 미사일', slots: ['side', 'rear'], desc: '적을 추적해 폭발한다', stat: '피해 8 × 2발 · 2.2초마다 · 유도', more: '적을 스스로 쫓아가 터진다. 드론을 먼저 노린다. 적이 있을 때만 나간다.' },
    mine: { name: '지뢰', slots: ['rear'], desc: '앞쪽 도로에 던져 깔아 두면 밟은 적과 주변이 터진다', stat: '피해 10 · 3초마다 · 폭발 범위 4 m', more: '앞쪽 도로에 던져 깔아 둔다. 밟은 적과 주변이 함께 터진다. 적이 있을 때만 던진다.' }
  };
  var SLOT_LABEL = { front: '전면', roof: '지붕', side: '좌우', rear: '후면', rear2: '후면 2' };
  function slotKind(s) { return s === 'rear2' ? 'rear' : s; }
  function weaponMesh(type, kind, width) {
    var g = new T.Group(), i;
    if (type === 'mg') {
      g.add(cyl(0.24, 0.3, 0.24, 10, M.gun, 0, 0.12, 0));
      g.add(cyl(0.05, 0.05, 1.2, 6, M.dark, -0.11, 0.22, 0.6, 'z')); g.add(cyl(0.05, 0.05, 1.2, 6, M.dark, 0.11, 0.22, 0.6, 'z'));
    } else if (type === 'bolt') {
      g.add(cyl(0.1, 0.17, 0.44, 8, M.gun, 0, 0.22, 0));
      var ring = new T.Mesh(new T.TorusGeometry(0.3, 0.065, 6, 16), M.coil); ring.rotation.x = Math.PI / 2; ring.position.y = 0.5; g.add(ring);
      var cg = glowSprite(0x4fdcff, 2.2, 0.7); cg.position.y = 0.5; g.add(cg);
    } else if (type === 'laser') {
      g.add(bx(0.46, 0.2, 1.0, M.gun, 0, 0.12, 0)); g.add(bx(0.34, 0.14, 0.08, M.coil, 0, 0.13, 0.52));
      for (i = -1; i <= 1; i++) g.add(bx(0.07, 0.07, 0.04, M.head, i * 0.11, 0.26, 0.5));
    } else if (type === 'shotgun') {
      g.add(bx(0.72, 0.16, 0.6, M.gun, 0, 0.08, 0));
      [-0.22, 0, 0.22].forEach(function (x) { g.add(cyl(0.065, 0.065, 0.6, 6, M.dark, x, 0.1, 0.45, 'z')); });
    } else if (type === 'flame') {
      g.add(cyl(0.17, 0.17, 0.7, 8, M.redTip, 0, 0.17, -0.15, 'x')); g.add(cyl(0.07, 0.11, 0.8, 8, M.dark, 0, 0.17, 0.5, 'z'));
      g.add(bx(0.12, 0.12, 0.1, M.sign, 0, 0.17, 0.92));
    } else if (type === 'saw') {
      var sw = (width || 1.9) * 0.98;
      g.add(bx(sw, 0.22, 0.18, M.metal, 0, 0.02, 0));
      for (i = 0; i < 7; i++) { var tooth = shadowed(new T.Mesh(new T.ConeGeometry(0.13, 0.4, 4), M.metal)); tooth.geometry.rotateX(-Math.PI / 2); tooth.position.set(-sw / 2 + 0.14 + i * (sw - 0.28) / 6, 0.02, -0.26); g.add(tooth); }
    } else if (type === 'water') {
      g.add(cyl(0.22, 0.28, 0.26, 10, M.gun, 0, 0.13, 0)); g.add(cyl(0.11, 0.16, 1.0, 8, M.waterBlue, 0, 0.3, 0.5, 'z'));
    } else if (type === 'cannon') {
      g.add(bx(0.24, 0.28, 1.3, M.gun, 0, 0, 0)); g.add(cyl(0.085, 0.085, 1.2, 8, M.dark, 0, 0.03, 1.2, 'z'));
    } else if (type === 'missile') {
      var big = kind === 'rear', pod = new T.Group(); pod.rotation.x = 0.2; pod.position.y = big ? 0.32 : 0.1;
      pod.add(bx(big ? 0.62 : 0.38, big ? 0.44 : 0.36, big ? 1.2 : 1.2, M.gun, 0, 0, 0));
      (big ? [[-0.15, 0.1], [0.15, 0.1], [-0.15, -0.1], [0.15, -0.1]] : [[0, 0.08], [0, -0.09]]).forEach(function (p) {
        var tip = new T.Mesh(new T.ConeGeometry(0.095, 0.28, 8), M.redTip); tip.geometry.rotateX(-Math.PI / 2); tip.position.set(p[0], p[1], -0.7); pod.add(tip);
      });
      g.add(pod);
    } else if (type === 'mine') {
      g.add(bx(0.9, 0.16, 0.6, M.gun, 0, 0.08, 0));
      [-0.28, 0, 0.28].forEach(function (x) { g.add(cyl(0.13, 0.13, 0.1, 8, M.redTip, x, 0.2, 0)); });
    }
    return bake(g);
  }

