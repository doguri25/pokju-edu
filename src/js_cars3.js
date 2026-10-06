  /* ---------- paints and trim ---------- */
  M.mint = std(0xa9dccd, 0.4, 0.1); M.carWhite = std(0xf1f1ee, 0.35, 0.1); M.sea = std(0x4d6688, 0.3, 0.35);
  M.sage = std(0x8fa58a, 0.5, 0.15); M.ivory = std(0xcfc9bd, 0.35, 0.2); M.nocturne = std(0x5b616b, 0.35, 0.3); M.arctic = std(0x7fb5d6, 0.35, 0.2);
  M.coral = std(0xf2a7b5, 0.4, 0.1); M.deepBlue = std(0x2a4a9a, 0.3, 0.3); M.obsidian = std(0x1c1d20, 0.28, 0.4); M.busGreen = std(0x3aa655, 0.5, 0.1);
  M.fireRed = std(0xe01f1f, 0.4, 0.15); M.towYellow = std(0xf4b400, 0.45, 0.1); M.waterBlue = std(0x2f8fe0, 0.4, 0.3);
  M.forest = std(0x2f4a3a, 0.45, 0.2); M.latte = std(0xb9b0a2, 0.4, 0.2); M.pearl = std(0xf4f3ee, 0.3, 0.15); M.marble = std(0x7b8087, 0.4, 0.25);
  M.blaze = std(0xc7772e, 0.4, 0.25); M.dandy = std(0x3f6fb5, 0.4, 0.2); M.gloss = std(0x0c0d10, 0.18, 0.5);
  M.rim = std(0xc9ccd1, 0.3, 0.8); M.rimDark = std(0x2a2c30, 0.4, 0.6); M.chrome = std(0xdfe3e8, 0.15, 0.9);
  M.drl = new T.MeshBasicMaterial({ color: 0xffffff }); M.amber = new T.MeshBasicMaterial({ color: 0xffa21a }); M.tailHot = new T.MeshBasicMaterial({ color: 0xff9a8a });
  M.avRed = std(0xb02a30, 0.35, 0.25); M.g80Green = std(0x1f3a33, 0.25, 0.45); M.nBlue = std(0x8fb2dc, 0.55, 0.05); M.terra = std(0xa85a3c, 0.45, 0.15);
  M.iceberg = std(0xa7bdb6, 0.4, 0.2); M.khaki = std(0x6b6a4f, 0.6, 0.1);
  M.polBlue = new T.MeshBasicMaterial({ color: C(0x1a3f9a) }); M.polYellow = new T.MeshBasicMaterial({ color: C(0xf2c318) }); M.lime = new T.MeshBasicMaterial({ color: C(0xb5d334) });
  M.nOrange = new T.MeshBasicMaterial({ color: C(0xff4a1a) }); M.sosRed = new T.MeshBasicMaterial({ color: C(0xd81e1e) });
  M.barRed = new T.MeshBasicMaterial({ color: 0xff2a2a }); M.barBlue = new T.MeshBasicMaterial({ color: 0x3a6cff });
  M.sandBrown = std(0x7d6a55, 0.4, 0.3); M.navy = std(0x26344d, 0.3, 0.4); M.sienna = std(0xd97b3a, 0.45, 0.1); M.silverGrey = std(0x9aa3ad, 0.3, 0.55);
  M.burgundy = std(0x6e1f28, 0.3, 0.4); M.tan = std(0xb8a888, 0.5, 0.1); M.parcel = std(0xf0d24a, 0.5, 0.1); M.racing = std(0xf2c40f, 0.3, 0.2); M.boxOrange = new T.MeshBasicMaterial({ color: C(0xe8862a) });
  M.advGreen = std(0x6b8e4e, 0.45, 0.15); M.carib = std(0x1fa3c4, 0.4, 0.2); M.butter = std(0xefe0a0, 0.5, 0.05); M.smokeBlue = std(0x6f8296, 0.4, 0.25);
  M.graphite = std(0x3b4048, 0.35, 0.35); M.flame = std(0xd9361e, 0.35, 0.2); M.wolfGrey = std(0x767e86, 0.55, 0.05); M.jungle = std(0x4f5d49, 0.5, 0.15); M.teal = std(0x2f7f86, 0.4, 0.25);
  M.yacht = std(0x24566f, 0.3, 0.4); M.orchid = std(0x7a6aa8, 0.35, 0.25); M.copper = std(0x9a4f2e, 0.35, 0.4); M.grabber = std(0x1f7fe0, 0.35, 0.2);
  M.plate = new T.MeshBasicMaterial({ color: C(0xe9e9e4) }); M.plateEV = new T.MeshBasicMaterial({ color: C(0x4a9ae8) });
  function textMat(text, fg, bg, w, h) {
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var x = c.getContext('2d'); x.fillStyle = bg; x.fillRect(0, 0, w, h);
    x.fillStyle = fg; x.font = '900 ' + Math.round(h * 0.74) + 'px "Noto Sans KR", system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, w / 2, h * 0.54);
    var tx = new T.CanvasTexture(c); tx.encoding = T.sRGBEncoding;
    return new T.MeshBasicMaterial({ map: tx });
  }

  /* ---------- player cars: 52 vehicles; game traits here, movement from the real figures in SPECS ---------- */
  function carDef(o) {
    var d = { bulletMul: 1, ramMul: 1, bombMul: 1, debrisMul: 1, evade: 0, mgRate: 1, scrapMul: 1, itemDur: 1, shieldRegen: false, brakeMul: 1, overT: 4 };
    for (var k in o) d[k] = o[k];
    return d;
  }
  var CARS = {
    laser: carDef({ name: '레이저', role: '경차 · 회피형', group: '경차', price: 0, hp: 100, mgRate: 1.4, cd: 6, skill: 'dash', skillName: '틈새 대시', skillDesc: '1.2초 동안 무적으로 급가속',
      trait: '키 큰 상자형 경차. 기관총 연사 40% 증가로 연사가 가장 빠르다', feel: '가볍게 방향을 바꾸지만 힘이 약해 속도가 더디게 붙고 오르막에서 처진다', loadout: { front: null, roof: 'mg' } }),
    dolphin: carDef({ name: '돌고래', role: '전기 해치백 · 회피형', group: '승용', price: 400, hp: 105, cd: 8, skill: 'roar', skillName: '초음파', skillDesc: '전방 충격파로 앞쪽 적에게 큰 피해, 적 탄환 소거',
      trait: '작은 차체와 낮은 무게중심', feel: '반응은 즉시 오지만 출력이 작아 고속에서 힘이 빠진다', loadout: { front: null, roof: 'bolt' } }),
    avante: carDef({ name: '아방떼', role: '준중형 세단 · 실속형', group: '승용', price: 350, hp: 120, scrapMul: 1.2, cd: 6, skill: 'dash', skillName: '칼치기', skillDesc: '1.2초 동안 무적으로 급가속',
      trait: '가볍고 낮은 차체. 고철을 20% 더 모은다', feel: '가벼워서 방향은 잘 바꾸지만 123마력이라 고속에서 속도가 더디게 붙는다', loadout: { front: null, roof: 'mg', rear: null } }),
    bmw5: carDef({ name: '오시리얼', role: '수입 세단 · 주행 보조형', group: '승용', price: 900, hp: 160, brakeMul: 1.15, cd: 10, skill: 'auto', skillName: '주행 보조', skillDesc: '4초 동안 스스로 위험을 피하고 피해를 반만 받는다',
      trait: '후륜구동 스포츠 세단. 제동이 15% 강하다', feel: '긴 축거와 후륜구동으로 230 km/h까지 차분하게 올라가고, 190마력이라 급하지는 않다', loadout: { front: null, roof: 'laser', side: 'missile' } }),
    p911: carDef({ name: '구일일', role: '스포츠카 · 초고속형', group: '승용', price: 1300, hp: 115, evade: 0.3, cd: 5, skill: 'dash', skillName: '런치 컨트롤', skillDesc: '1.2초 동안 무적으로 급가속',
      trait: '최고속도 294 km/h로 가장 빠르다. 낮은 차체라 적 탄환의 30%가 빗나간다', feel: '가볍고 짧아 생각하는 대로 움직이고, 후륜구동 394마력으로 끝없이 속도가 붙는다. 내구는 약하다', loadout: { front: 'shotgun', roof: 'laser', rear: null } }),
    grand: carDef({ name: '그랜절', role: '대형 세단 · 균형형', group: '승용', price: 400, hp: 150, cd: 5, skill: 'salvo', salvo: 4, skillName: '연속 발사', skillDesc: '미사일 4발을 발사. 쿨타임이 짧다',
      trait: '약점이 없는 균형형. 고유 기술 쿨타임이 5초로 짧다', feel: '길고 낮은 차체가 고속에서 안정적이고, 속도는 부드럽게 꾸준히 붙는다', loadout: { front: null, roof: 'mg', rear: 'missile' } }),
    eclass: carDef({ name: '이클래식', role: '수입 세단 · 방어형', group: '승용', price: 900, hp: 170, bombMul: 0.7, cd: 9, skill: 'shield', shieldT: 3, skillName: '에어 방어막', skillDesc: '3초 동안 모든 피해를 막는다',
      trait: '두꺼운 차체로 폭격 피해 30% 감소', feel: '최고속도가 가장 높고 사륜구동이라 고속에서도 흔들리지 않는다', loadout: { front: null, roof: 'mg', side: 'missile' } }),
    g80: carDef({ name: '지팔공', role: '고급 세단 · 방어형', group: '승용', price: 950, hp: 175, bulletMul: 0.8, cd: 9, skill: 'shield', shieldT: 3, skillName: '이중 접합 유리', skillDesc: '3초 동안 모든 피해를 막는다',
      trait: '두꺼운 유리와 차체로 탄환 피해 20% 감소', feel: '긴 축거와 사륜구동으로 250 km/h까지 흔들림 없이 올라간다', loadout: { front: null, roof: 'laser', side: 'missile' } }),
    casper: carDef({ name: '캐스터 EV', role: '경형 전기차 · 회피형', group: '전기', price: 350, hp: 105, evade: 0.25, cd: 6, skill: 'dash', skillName: '깜짝 대시', skillDesc: '1.2초 동안 무적으로 급가속',
      trait: '작은 차체라 적 탄환의 25%가 빗나간다', feel: '짧고 가벼워 잽싸게 움직이지만 115마력이라 150 km/h에서 멈춘다', loadout: { front: null, roof: 'bolt' } }),
    atto: carDef({ name: '아또 3', role: '전기 SUV · 자동 조준형', group: '전기', price: 500, hp: 130, shieldRegen: true, cd: 10, skill: 'emp', skillName: '방전', skillDesc: '주변 드론을 모두 떨어뜨리고 적 탄환을 지운다',
      trait: '피격 1회를 막는 방어막이 10초마다 재충전', feel: '밟는 즉시 나가지만 최고속도가 낮다', loadout: { front: null, roof: 'bolt', rear: null } }),
    ionic: carDef({ name: '아이고닉', role: '전기 해치백 · 관통형', group: '전기', price: 600, hp: 140, cd: 7, skill: 'overdrive', skillName: 'V2L 과충전', skillDesc: '4초 동안 모든 무기의 연사가 2배',
      trait: '초급속 충전으로 고유 기술 쿨타임이 짧다', feel: '축거가 길어 직진은 안정적이고 방향 전환은 묵직하다', loadout: { front: null, roof: 'laser', rear: null } }),
    ionicn: carDef({ name: '아이고닉 N', role: '고성능 전기차 · 고속형', group: '전기', price: 1100, hp: 150, cd: 14, skill: 'nitro', skillName: 'N 그린 부스트', skillDesc: '10초 동안 가속과 연사가 크게 오른다',
      trait: '전기차 가운데 가장 빠르다(260 km/h)', feel: '609마력 사륜구동이라 어느 속도에서든 밟는 대로 튀어 나간다', loadout: { front: 'shotgun', roof: 'laser', rear: null } }),
    ev3: carDef({ name: '이브 3', role: '소형 전기 SUV · 보급형', group: '전기', price: 450, hp: 125, itemDur: 1.2, cd: 7, skill: 'overdrive', skillName: 'V2L 과충전', skillDesc: '4초 동안 모든 무기의 연사가 2배',
      trait: 'V2L: 보급 상자 효과가 20% 오래 간다', feel: '짧고 가벼워 잽싸게 움직이고, 최고속도는 170 km/h에서 멈춘다', loadout: { front: null, roof: 'bolt', rear: null } }),
    seal: carDef({ name: '물개', role: '전기 세단 · 고속형', group: '전기', price: 600, hp: 120, evade: 0.35, cd: 6, skill: 'dash', skillName: '미끄러지기', skillDesc: '1.2초 동안 무적으로 급가속',
      trait: '낮은 차체라 적 탄환의 35%가 빗나간다', feel: '낮게 깔려 고속에서도 좌우 이동이 그대로 살아 있다', loadout: { front: null, roof: 'bolt' } }),
    sealion: carDef({ name: '바다사자 7', role: '쿠페형 전기 SUV · 돌격형', group: '전기', price: 800, hp: 180, ramMul: 0.7, cd: 9, skill: 'roar', skillName: '포효', skillDesc: '전방 충격파로 앞쪽 적에게 큰 피해, 적 탄환 소거',
      trait: '낮은 무게중심의 쿠페형 차체. 충돌 피해 30% 감소', feel: '313마력 후륜구동. 2.2톤 차체를 뒤에서 꾸준히 밀고, 고속에서도 안정적이다', loadout: { front: 'shotgun', roof: null, rear: null } }),
    modely: carDef({ name: '모델 왜', role: '수입 전기 SUV · 자율주행형', group: '전기', price: 800, hp: 150, brakeMul: 1.25, cd: 10, skill: 'auto', skillName: '자율주행', skillDesc: '4초 동안 스스로 위험을 피하고 피해를 반만 받는다',
      trait: '회생 제동으로 제동이 25% 강하다', feel: '조용히 빠르게 붙고 급하게 선다', loadout: { front: null, roof: 'laser', rear: 'missile' } }),
    ev9: carDef({ name: '이브 9', role: '대형 전기 SUV · 중장갑형', group: '전기', price: 1000, hp: 210, ramMul: 0.6, cd: 9, skill: 'salvo', salvo: 6, skillName: '일제 사격', skillDesc: '미사일 6발을 한꺼번에 발사',
      trait: '3열 대형 차체로 충돌 피해 40% 감소', feel: '2.6톤이지만 700 Nm 듀얼 모터라 무게를 잊게 민다. 길고 무거워 좌우 이동은 느리다', loadout: { front: null, roof: 'mg', side: 'cannon', rear: 'missile' } }),
    cyber: carDef({ name: '사이다트럭', role: '전기 픽업 · 방어형', group: '전기', price: 1000, hp: 220, bulletMul: 0.4, ramMul: 0.3, cd: 8, skill: 'charge', skillName: '돌진', skillDesc: '1.6초 동안 무적으로 급가속, 닿은 적 격파',
      trait: '방탄 차체로 탄환 피해 60%, 충돌 피해 70% 감소', feel: '3톤 차체를 1,008 Nm 토크로 밀어붙인다. 길고 무거워 좌우 이동은 느리다', loadout: { front: null, side: 'cannon' } }),
    tivoli: carDef({ name: '티볼링', role: '소형 SUV · 돌파형', group: 'SUV', price: 350, hp: 115, cd: 7, skill: 'charge', skillName: '스트라이크', skillDesc: '1.6초 동안 무적으로 급가속, 닿은 적 격파',
      trait: '작고 가벼운 차체. 고유 기술 쿨타임이 짧다', feel: '짧은 축거로 잽싸게 움직이고 터보 토크로 가볍게 치고 나간다', loadout: { front: 'saw', roof: 'mg' } }),
    torres: carDef({ name: '도로스', role: '중형 SUV · 험로형', group: 'SUV', price: 500, hp: 150, debrisMul: 0.5, cd: 8, skill: 'charge', skillName: '험로 돌파', skillDesc: '1.6초 동안 무적으로 급가속, 닿은 적 격파',
      trait: '험로용 차체: 잔해, 고장 차량, 방호벽에 부딪혀 받는 피해 50% 감소', feel: '키가 큰 상자형 차체라 고속에서 좌우 이동이 둔해진다', loadout: { front: null, roof: 'mg', rear: 'missile' } }),
    torresevx: carDef({ name: '도로스 EV', role: '전기 SUV · 보급형', group: 'SUV', price: 650, hp: 160, itemDur: 1.3, cd: 10, skill: 'emp', skillName: '방전', skillDesc: '주변 드론을 모두 떨어뜨리고 적 탄환을 지운다',
      trait: 'V2L: 보급 상자 효과가 30% 오래 간다', feel: '배터리 무게로 묵직하지만 밟는 즉시 반응한다', loadout: { front: null, roof: 'bolt', rear: 'mine' } }),
    actyon: carDef({ name: '액숀', role: '쿠페형 SUV · 회피형', group: 'SUV', price: 550, hp: 140, evade: 0.2, cd: 6, skill: 'dash', skillName: '액션 대시', skillDesc: '1.2초 동안 무적으로 급가속',
      trait: '날렵한 차체라 적 탄환의 20%가 빗나간다', feel: '낮고 넓은 비례로 도로스보다 안정적이다', loadout: { front: 'shotgun', roof: 'mg' } }),
    santafe: carDef({ name: '산타패', role: '중형 SUV · 화력형', group: 'SUV', price: 650, hp: 165, bombMul: 0.8, cd: 8, skill: 'salvo', salvo: 5, skillName: '테일게이트 사격', skillDesc: '미사일 5발을 한꺼번에 발사',
      trait: '상자형 차체로 폭격 피해 20% 감소', feel: '281마력 터보와 사륜구동으로 언덕에서도 꾸준하고, 키가 커서 고속에서 좌우 이동이 둔하다', loadout: { front: 'saw', roof: 'mg', rear: 'missile' } }),
    sorento: carDef({ name: '쏘렌타', role: '중형 하이브리드 SUV · 균형형', group: 'SUV', price: 600, hp: 160, cd: 6, skill: 'overdrive', skillName: '하이브리드 부스트', skillDesc: '4초 동안 모든 무기의 연사가 2배',
      trait: '약점이 없는 균형형. 고유 기술 쿨타임이 짧다', feel: '하이브리드라 반응이 빠르고 속도가 고르게 붙는다', loadout: { front: null, roof: 'mg', rear: 'missile' } }),
    palisade: carDef({ name: '팰리세이브', role: '대형 SUV · 방어형', group: 'SUV', price: 850, hp: 205, ramMul: 0.75, bombMul: 0.85, cd: 9, skill: 'shield', shieldT: 3, skillName: '가족 보호', skillDesc: '3초 동안 모든 피해를 막는다',
      trait: '큰 차체와 두꺼운 범퍼. 충돌 피해 25%, 폭격 피해 15% 감소', feel: '2톤 차체를 281마력 터보로 넉넉하게 밀지만, 5 m가 넘어 좌우 이동이 느리다', loadout: { front: null, roof: 'mg', side: 'cannon' } }),
    gv80: carDef({ name: '지브이팔공', role: '고급 SUV · 중장갑형', group: 'SUV', price: 1000, hp: 210, bulletMul: 0.75, cd: 9, skill: 'roar', skillName: '경적', skillDesc: '전방 충격파로 앞쪽 적에게 큰 피해, 적 탄환 소거',
      trait: '두꺼운 차체와 유리로 탄환 피해 25% 감소', feel: '304마력 사륜구동이라 언덕에서도 여유가 있고, 긴 보닛의 후륜 기반 차체가 고속에서 안정적이다', loadout: { front: null, roof: 'mg', side: 'cannon' } }),
    rexton: carDef({ name: '렉스톤', role: '대형 SUV · 방어형', group: 'SUV', price: 850, hp: 200, bulletMul: 0.7, cd: 9, skill: 'shield', shieldT: 3, skillName: '프레임 방어', skillDesc: '3초 동안 모든 피해를 막는다',
      trait: '프레임 차체로 탄환 피해 30% 감소', feel: '디젤 토크로 오르막을 꾸준히 오르지만 반응이 한 박자 늦다', loadout: { front: null, roof: 'mg', side: 'cannon' } }),
    musso: carDef({ name: '무쏴', role: '디젤 픽업 · 화력형', group: 'SUV', price: 700, hp: 185, cd: 9, skill: 'salvo', salvo: 6, skillName: '일제 사격', skillDesc: '미사일 6발을 한꺼번에 발사',
      trait: '데크에 후면 슬롯이 2개', feel: '디젤 441 Nm 토크와 사륜구동으로 오르막에 강하다. 차체가 길어 방향 전환은 느리다', loadout: { front: 'saw', roof: 'mg', rear: 'missile', rear2: 'mine' } }),
    mussoev: carDef({ name: '무쏴 EV', role: '전기 픽업 · 과충전형', group: 'SUV', price: 950, hp: 190, overT: 6, cd: 8, skill: 'overdrive', skillName: 'V2L 과충전', skillDesc: '6초 동안 모든 무기의 연사가 2배',
      trait: '듀얼 모터 사륜구동. 과충전이 6초 동안 이어진다', feel: '413마력으로 픽업답지 않게 빠르게 치고 나간다', loadout: { front: null, roof: 'laser', rear: 'missile' } }),
    tasman: carDef({ name: '타스만두', role: '가솔린 픽업 · 험로 화력형', group: 'SUV', price: 800, hp: 195, debrisMul: 0.5, cd: 9, skill: 'salvo', salvo: 6, skillName: '일제 사격', skillDesc: '미사일 6발을 한꺼번에 발사',
      trait: '험로용 차체: 잔해와 방호벽 피해 50% 감소. 데크에 후면 슬롯 2개', feel: '281마력 터보와 사륜구동으로 언덕에 강하지만, 5.4 m 차체라 방향 전환이 느리다', loadout: { front: 'saw', roof: 'mg', rear: 'missile', rear2: 'mine' } }),
    porter: carDef({ name: '포터블', role: '1톤 트럭 · 화력형', group: '대형', price: 300, hp: 160, cd: 9, skill: 'salvo', salvo: 6, skillName: '일제 사격', skillDesc: '미사일 6발을 한꺼번에 발사',
      trait: '적재함에 후면 슬롯이 2개라 무기를 가장 많이 단다', feel: '좁고 높은 차체라 고속에서 좌우 이동이 크게 둔해지고 많이 기운다', loadout: { front: 'saw', roof: 'mg', rear: 'missile', rear2: 'missile' } }),
    pv5: carDef({ name: '피부이 택배', role: '전기 화물 밴 · 수집형', group: '대형', price: 500, hp: 170, scrapMul: 1.5, itemDur: 1.3, cd: 9, skill: 'barrage', skillName: '상자 투척', skillDesc: '포탄 11발을 부채꼴로 쏟아붓는다',
      trait: '넓은 화물칸: 고철을 50% 더 싣고, 보급 상자 효과가 30% 오래 간다', feel: '전기 모터라 출발은 가볍지만 최고속도가 135 km/h로 낮고, 키가 커서 고속에서 기운다', loadout: { front: null, roof: 'mg', rear: 'mine' } }),
    cannonball: carDef({ name: '캐논발', role: '미니밴 · 포격형', group: '대형', price: 700, hp: 190, itemDur: 1.5, cd: 9, skill: 'barrage', skillName: '도어 일제포', skillDesc: '포탄 11발을 부채꼴로 쏟아붓는다',
      trait: '넉넉한 실내로 보급 상자 효과가 50% 오래 간다', feel: '하이브리드라 반응이 빠르고, 길고 무거워 방향 전환은 느리다', loadout: { front: null, roof: 'mg', side: 'cannon' } }),
    ambul: carDef({ name: '스타리오 구급차', role: '구급차 · 회복형', group: '대형', price: 900, hp: 200, healMul: 2, cd: 14, skill: 'heal', skillName: '응급 처치', skillDesc: '내구를 60 회복한다',
      trait: '수리 키트 효과가 2배', feel: '디젤 토크로 꾸준히 밀지만 반응이 늦고, 높은 차체라 고속에서 크게 기운다', loadout: { front: null, roof: 'mg', side: 'missile' } }),
    police: carDef({ name: '소나기 순찰차', role: '순찰차 · 교란형', group: '대형', price: 800, hp: 150, evade: 0.15, cd: 12, skill: 'siren', skillName: '사이렌', skillDesc: '6초 동안 피난 차량이 길을 비키고 적의 사격이 멈춘다',
      trait: '경광등에 조준이 흐트러져 적 탄환의 15%가 빗나간다', feel: '낮고 긴 세단이라 고속에서 안정적이고, 160마력이라 속도는 천천히 붙는다', loadout: { front: null, roof: 'mg', rear: null } }),
    tow: carDef({ name: '번개렉카', role: '견인차 · 충돌형', group: '대형', price: 900, hp: 200, ramMul: 0.2, scrapMul: 2, cd: 8, skill: 'charge', skillName: '끌고 가기', skillDesc: '1.6초 동안 무적으로 급가속, 닿은 적 격파',
      trait: '충돌 피해 80% 감소. 고철 값이 2배', feel: '속도제한장치로 90 km/h에서 멈추고, 디젤이라 반응이 늦다', loadout: { front: 'saw', roof: 'mg', rear: null } }),
    fire: carDef({ name: '불끄미', role: '소방차 · 진압형', group: '대형', price: 1200, hp: 260, bombMul: 0.5, cd: 9, skill: 'roar', skillName: '물폭탄', skillDesc: '전방 충격파로 앞쪽 적에게 큰 피해, 적 탄환 소거',
      trait: '방화 차체로 폭격 피해 50% 감소', feel: '물 3톤을 실은 12톤 차체라 속도가 아주 느리게 붙고 오르막에서 크게 처진다', loadout: { front: 'water', roof: 'mg', side: null } }),
    bus: carDef({ name: '만원버스', role: '전기 시내버스 · 중장갑형', group: '대형', price: 1200, hp: 320, ramMul: 0.4, cd: 10, skill: 'shield', shieldT: 4, skillName: '문 닫습니다', skillDesc: '4초 동안 모든 피해를 막는다',
      trait: '내구가 가장 높고 충돌 피해 60% 감소. 차체가 11 m라 피하기 어렵다', feel: '전기 모터라 출발은 매끄럽지만 최고속도가 가장 낮고 오르막에서 처진다', loadout: { front: null, roof: 'mg', side: 'cannon', rear: 'mine' } }),
    k5: carDef({ name: '케이오', role: '중형 세단 · 실속형', group: '승용', price: 400, hp: 125, scrapMul: 1.15, cd: 6, skill: 'dash', skillName: '한 방 대시', skillDesc: '1.2초 동안 무적으로 급가속',
      trait: '실속형: 고철을 15% 더 얻고, 고유 기술 쿨타임이 짧다', feel: '160마력 자연흡기라 속도는 천천히 붙지만, 가볍고 낮아 좌우 이동이 잽싸다', loadout: { front: 'shotgun', roof: 'mg' } }),
    sonata: carDef({ name: '쏘나티네 N', role: '스포츠 세단 · 고속형', group: '승용', price: 750, hp: 135, evade: 0.1, cd: 13, skill: 'nitro', skillName: 'N 라인 부스트', skillDesc: '10초 동안 가속과 연사가 크게 오른다',
      trait: '낮게 깔린 패스트백 차체라 적 탄환의 10%가 빗나간다', feel: '290마력 터보가 앞바퀴를 강하게 끈다. 중속에서 치고 나가는 힘이 좋고 고속에서 안정적이다', loadout: { front: null, roof: 'mg', rear: 'missile' } }),
    mustang: carDef({ name: '무스탕', role: '머슬카 · 화력형', group: '승용', price: 1100, hp: 150, mgRate: 1.15, cd: 9, skill: 'barrage', skillName: 'V8 일제포', skillDesc: '포탄 11발을 부채꼴로 쏟아붓는다',
      trait: '기관총 연사 15% 증가. 고유 기술로 포탄을 부채꼴로 쏟는다', feel: '493마력 V8 후륜구동. 밟는 만큼 밀어붙이지만 젖은 길과 흙길에서는 뒤가 쉽게 미끄러진다', loadout: { front: 'shotgun', roof: 'mg', side: 'cannon' } }),
    ev6: carDef({ name: '이브 6', role: '전기 크로스오버 · 대공형', group: '전기', price: 750, hp: 150, brakeMul: 1.2, cd: 10, skill: 'emp', skillName: 'V2L 방전', skillDesc: '주변 드론을 모두 떨어뜨리고 적 탄환을 지운다',
      trait: '회생 제동으로 제동이 20% 강하다', feel: '2.9 m 축거의 낮은 크로스오버. 후륜 모터가 조용히 꾸준하게 밀고, 직진이 안정적이다', loadout: { front: null, roof: 'bolt', rear: 'missile' } }),
    ioniq6: carDef({ name: '아이고닉 6', role: '전기 세단 · 회피형', group: '전기', price: 800, hp: 135, evade: 0.3, cd: 6, skill: 'dash', skillName: '유선형 대시', skillDesc: '1.2초 동안 무적으로 급가속',
      trait: '물방울 같은 유선형 차체라 적 탄환의 30%가 빗나간다', feel: '공기저항이 작아 고속에서도 속도가 잘 붙는다. 길고 낮아 차로 변경이 매끄럽다', loadout: { front: null, roof: 'laser' } }),
    model3: carDef({ name: '모델 쓰리고', role: '수입 전기 세단 · 자율주행형', group: '전기', price: 750, hp: 140, brakeMul: 1.2, cd: 10, skill: 'auto', skillName: '자율주행', skillDesc: '4초 동안 스스로 위험을 피하고 피해를 반만 받는다',
      trait: '회생 제동으로 제동이 20% 강하다', feel: '가볍고 낮은 전기 세단. 밟는 즉시 반응하고 좌우 이동이 날카롭다', loadout: { front: null, roof: 'laser', rear: 'mine' } }),
    sportage: carDef({ name: '스포츠지', role: '준중형 SUV · 균형형', group: 'SUV', price: 500, hp: 150, debrisMul: 0.75, cd: 8, skill: 'roar', skillName: '부메랑 경적', skillDesc: '전방 충격파로 앞쪽 적에게 큰 피해, 적 탄환 소거',
      trait: '도심형 SUV 차체: 잔해, 고장 차량, 방호벽에 부딪혀 받는 피해 25% 감소', feel: '180마력 터보로 무난하게 달린다. 짧은 차체라 좌우 이동이 SUV치고 가볍다', loadout: { front: 'saw', roof: 'mg', rear: null } }),
    tucson: carDef({ name: '투싼타', role: '하이브리드 SUV · 과충전형', group: 'SUV', price: 600, hp: 155, itemDur: 1.2, cd: 7, skill: 'overdrive', skillName: '하이브리드 과충전', skillDesc: '4초 동안 모든 무기의 연사가 2배',
      trait: '보급 상자 효과가 20% 오래 간다', feel: '모터가 터보의 빈틈을 메워 출발과 재가속이 빠르다. 키가 커서 고속에서 좌우 이동이 조금 둔하다', loadout: { front: null, roof: 'mg', rear: 'missile' } }),
    gv70: carDef({ name: '지브이칠공', role: '고급 SUV · 방어형', group: 'SUV', price: 900, hp: 185, bulletMul: 0.85, cd: 9, skill: 'shield', shieldT: 3, skillName: '방패 문양', skillDesc: '3초 동안 모든 피해를 막는다',
      trait: '두꺼운 차체로 탄환 피해 15% 감소', feel: '304마력 사륜구동. 긴 보닛의 후륜 기반 차체가 미끄러운 길에서도 침착하다', loadout: { front: null, roof: 'mg', side: 'cannon' } }),
    carni: carDef({ name: '카니발레', role: '대형 미니밴 · 지원형', group: '대형', price: 750, hp: 195, healMul: 1.5, itemDur: 1.2, cd: 13, skill: 'heal', skillName: '차박 정비', skillDesc: '내구를 60 회복한다',
      trait: '루프박스에 공구를 싣고 다닌다. 수리 키트 효과 1.5배, 보급 상자 효과 20% 연장', feel: '3.5 가솔린 294마력으로 2톤 차체를 넉넉히 민다. 5 m가 넘어 방향 전환은 느리다', loadout: { front: null, roof: 'mg', side: 'missile' } }),
    morning: carDef({ name: '모닝콜', role: '경차 · 연사형', group: '경차', price: 150, hp: 95, mgRate: 1.25, overT: 3, cd: 7, skill: 'overdrive', skillName: '알람 연사', skillDesc: '3초 동안 모든 무기의 연사가 2배',
      trait: '기관총 연사 25% 증가', feel: '1톤이 안 되는 차체라 좌우 이동이 아주 잽싸다. 76마력이라 속도는 천천히 붙고 오르막에서 처진다', loadout: { front: null, roof: 'mg' } }),
    spark: carDef({ name: '스파클', role: '경차 · 실속형', group: '경차', price: 120, hp: 90, scrapMul: 1.2, cd: 5, skill: 'dash', skillName: '번쩍 대시', skillDesc: '1.2초 동안 무적으로 급가속',
      trait: '가장 가벼운 차. 고철을 20% 더 얻고, 고유 기술 쿨타임이 5초로 짧다', feel: '910 kg으로 가장 가볍다. 낮은 차체라 경차치고 고속에서 덜 흔들린다', loadout: { front: 'shotgun', roof: null } }),
    caspert: carDef({ name: '캐스터 터보', role: '경형 SUV · 돌파형', group: '경차', price: 250, hp: 110, debrisMul: 0.7, cd: 7, skill: 'charge', skillName: '꼬마 돌진', skillDesc: '1.6초 동안 무적으로 급가속, 닿은 적 격파',
      trait: '경형 SUV 차체: 잔해, 고장 차량, 방호벽에 부딪혀 받는 피해 30% 감소', feel: '100마력 터보라 경차 가운데 가장 힘이 좋다. 키가 커서 흙길과 자갈길에서 손해가 작다', loadout: { front: 'saw', roof: 'mg' } }),
    rayev: carDef({ name: '레이저 EV', role: '경형 전기 박스카 · 보급형', group: '경차', price: 300, hp: 105, itemDur: 1.3, cd: 10, skill: 'emp', skillName: '방전', skillDesc: '주변 드론을 모두 떨어뜨리고 적 탄환을 지운다',
      trait: 'V2L: 보급 상자 효과가 30% 오래 간다', feel: '모터라 출발이 가볍고 조용하다. 배터리 무게로 레이저보다 묵직하고, 키가 커서 고속에서 기운다', loadout: { front: null, roof: 'bolt' } })
  };
  var CAR_ORDER = ['laser', 'morning', 'spark', 'caspert', 'rayev', 'dolphin', 'avante', 'grand', 'k5', 'sonata', 'bmw5', 'g80', 'eclass', 'p911', 'mustang', 'casper', 'atto', 'ev3', 'ev6', 'ionic', 'ionicn', 'ioniq6', 'seal', 'sealion', 'modely', 'model3', 'ev9', 'cyber', 'tivoli', 'torres', 'torresevx', 'actyon', 'sportage', 'tucson', 'sorento', 'santafe', 'palisade', 'gv70', 'gv80', 'rexton', 'musso', 'mussoev', 'tasman', 'porter', 'pv5', 'cannonball', 'carni', 'ambul', 'police', 'tow', 'fire', 'bus'];
  /* basic skill: every car has one besides its own special skill; which one depends on the kind of car. Short cooldown, small effect */
  var BASICS = {
    step: { name: '퀵 스텝', cd: 3, desc: '옆 차로로 순간 이동하고 그동안 0.35초 무적. 좌우 입력 방향으로, 입력이 없으면 덜 위험한 쪽으로 움직인다' },
    burst: { name: '순간 가속', cd: 5, desc: '1.2초 동안 속도를 시속 47 km 더 낸다. 무적은 아니다' },
    pulse: { name: '회생 펄스', cd: 6, desc: '반경 24 m 안의 적 탄환과 로켓을 지운다' },
    bash: { name: '옆구리 밀치기', cd: 4, desc: '양옆에 붙은 적에게 피해 5를 주고 옆 차로로 밀어낸다. 추격차의 들이받기를 끊는다' },
    horn: { name: '경적', cd: 5, desc: '1.8초 동안 앞의 피난 차량이 길을 비키고, 앞쪽 오토바이와 버기가 내 차로에서 밀려난다' }
  }, BASIC_BY_GROUP = { '경차': 'step', '승용': 'burst', '전기': 'pulse', 'SUV': 'bash', '대형': 'horn' };
  var SPEC_MAX = { top: 0, nm: 0, climb: 0 };
  CAR_ORDER.forEach(function (k) {
    var c = CARS[k]; c.key = k; deriveCar(c, SPECS[k]); c.basic = c.basic || BASIC_BY_GROUP[c.group];
    SPEC_MAX.top = Math.max(SPEC_MAX.top, c.spec.top); SPEC_MAX.nm = Math.max(SPEC_MAX.nm, c.spec.nm); SPEC_MAX.climb = Math.max(SPEC_MAX.climb, c.climb);
  });

  /* ---------- model helpers ---------- */
  var playerRoot = new T.Group(); scene.add(playerRoot);
  var headGlows = [];
  function pane(w, f1, y1, f2, y2, mat, lift) {
    var len = Math.sqrt((f2 - f1) * (f2 - f1) + (y2 - y1) * (y2 - y1));
    var m = new T.Mesh(new T.BoxGeometry(w, 0.035, len), mat);
    m.position.set(0, (y1 + y2) / 2 + (lift === undefined ? 0.025 : lift), -(f1 + f2) / 2);
    m.rotation.x = Math.atan2(-(y2 - y1), -(f2 - f1));
    return m;
  }
  function finishCar(key, g, wheels, lights) {
    var car = CARS[key], k;
    bake(g, wheels); wheels.forEach(function (wh) { bake(wh); });
    lights.head.forEach(function (p) { var s = glowSprite(0xfff0c0, 1.5, 0.5); s.position.set(p[0], p[1], -p[2] - 0.15); g.add(s); headGlows.push(s); });
    car.tails = [];
    lights.tail.forEach(function (p) { var s = glowSprite(0xff2a1a, p[3] || 1.4, 0.55); s.position.set(p[0], p[1], -p[2] + 0.1); s.userData.s0 = p[3] || 1.4; g.add(s); car.tails.push(s); });
    car.mounts = {};
    for (k in car.anchors) {
      var a = car.anchors[k], list = [], xs = slotKind(k) === 'side' ? [-a[0], a[0]] : [a[0]];
      xs.forEach(function (x) { var m = new T.Group(); m.position.set(x, a[1], -a[2]); g.add(m); list.push(m); });
      car.mounts[k] = list;
    }
    car.g = g; car.wheels = wheels; g.visible = false; playerRoot.add(g);
  }
  function equipCar(key, loadout) {
    var car = CARS[key];
    for (var k in car.mounts) car.mounts[k].forEach(function (m) {
      while (m.children.length) m.remove(m.children[0]);
      if (EDU.arms && loadout[k]) m.add(weaponMesh(loadout[k], slotKind(k), car.W));
    });
  }
  /* wheel: tyre, rim face and spokes; st = { rim, spoke, n, cover } */
  function wheel2(r, w, x, f, list, st) {
    st = st || {};
    var g = new T.Group(), n = st.n || 5, i;
    g.add(cyl(r, r, w, 18, M.tire, 0, 0, 0, 'x'));
    var face = new T.Mesh(new T.CylinderGeometry(r * 0.68, r * 0.68, w + 0.02, 18), st.rim || M.rim); face.geometry.rotateZ(Math.PI / 2); g.add(face);
    for (i = 0; i < n; i++) { var sp = new T.Mesh(new T.BoxGeometry(w + 0.035, r * (st.cover ? 0.34 : 0.15), r * 1.3), st.spoke || M.rimDark); sp.rotation.x = i * Math.PI / n; g.add(sp); }
    g.add(cyl(r * 0.17, r * 0.17, w + 0.05, 8, st.rim || M.rim, 0, 0, 0, 'x'));
    g.position.set(x, r, -f); g.userData.r = r; list.push(g);
    return g;
  }
  function archDisc(r, x, y, f, trap) {
    var geo;
    if (trap) { var sh = new T.Shape(); sh.moveTo(-r * 1.3, -r * 0.25); sh.lineTo(-r * 0.86, r); sh.lineTo(r * 0.86, r); sh.lineTo(r * 1.3, -r * 0.25); geo = new T.ShapeGeometry(sh); }
    else geo = new T.CircleGeometry(r, 16, 0, Math.PI);
    var m = new T.Mesh(geo, M.dark); m.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2; m.position.set(x, y, -f);
    return m;
  }
  function both(fn) { fn(-1); fn(1); }
  /* passenger cars, SUVs and pickups share one builder: a side silhouette from a few real proportions, then each car's own lamps, grille and trim */
  function mkCar(key, o) {
    var car = CARS[key], s = car.spec, L = s.L, W = s.W, H = o.H || s.H, g = new T.Group(), w = [], B = o.mat, R = o.roofMat || B;
    var gc = o.gc, hb = gc + 0.22, rb = gc + 0.3, Wg = W - (o.tumble || 0.3), fTip = L / 2, rTip = -L / 2, ff = fTip - o.fo, fr = ff - s.wb, r = o.r, tailIn = o.bed ? 0 : o.tailIn, tailY = o.bed ? o.bed.wallY : o.tailY;
    function fF(y) { return y <= hb ? fTip - (hb - y) / 0.22 * 0.1 : fTip - Math.min(1, (y - hb) / (o.noseY - hb)) * o.nose; }
    function rF(y) { return y <= rb ? rTip + (rb - y) / 0.3 * 0.05 : rTip + Math.min(1, (y - rb) / (tailY - rb)) * tailIn; }
    function beltY(f) { return lerp(o.hoodY, o.deckY, clamp((o.cowlF - f) / (o.cowlF - o.rearBaseF), 0, 1)); }
    function roofY(f) { return lerp(H, o.roofY2, clamp((o.roofF1 - f) / (o.roofF1 - o.roofF2), 0, 1)); }
    function along(a, b, y) { return a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]); }
    var LB = 0.035, GB = 0.025;   /* bevels: the shell bulges this far beyond its outline, so trim sits that much further out */
    function F(wd, ht, x, y, mat, d) { var m = bx(wd, ht, d || 0.05, mat, x, y, fF(y) + LB + 0.012); g.add(m); return m; }
    function Rr(wd, ht, x, y, mat, d) { var m = bx(wd, ht, d || 0.05, mat, x, y, rF(y) - LB - 0.012); g.add(m); return m; }
    var lower = [[rTip + 0.05, gc], [fTip - 0.1, gc], [fTip, hb], [fTip - o.nose, o.noseY], [o.cowlF, o.hoodY], [o.rearBaseF, o.deckY]];
    if (o.bed) lower.push([o.rearBaseF - 0.03, o.bed.floorY], [rTip + 0.03, o.bed.floorY], [rTip, rb]);
    else lower.push([rTip + o.tailIn, o.tailY], [rTip, rb]);
    g.add(prof(lower, W, B, LB));
    g.add(prof([[o.rearBaseF, o.deckY - 0.02], [o.cowlF, o.hoodY - 0.02], [o.roofF1, H - GB], [o.roofF2, o.roofY2 - GB]], Wg, R, GB));
    var A0 = [o.cowlF, o.hoodY], A1 = [o.roofF1, H], C0 = [o.rearBaseF, o.deckY], C1 = [o.roofF2, o.roofY2], aT = o.aT || 0.14, cT = o.cT === undefined ? 0.2 : o.cT;
    var y0f = o.hoodY + 0.07, y1f = H - 0.09, y0r = o.deckY + 0.07, y1r = o.roofY2 - 0.09;
    g.add(pane(Wg - 0.16, o.cowlF - 0.03, o.hoodY + 0.02, o.roofF1 + 0.03, H - 0.05, M.glass, 0.03));
    g.add(pane(Wg - 0.24, o.roofF2 - 0.03, o.roofY2 - 0.05, o.rearBaseF + 0.03, o.deckY + 0.03, M.glass, 0.03));
    g.add(prof([[along(C0, C1, y0r) + cT, y0r], [along(A0, A1, y0f) - aT, y0f], [along(A0, A1, y1f) - aT, y1f], [along(C0, C1, y1r) + cT, y1r]], Wg + 0.03, M.glass, 0));
    (o.pillars || []).forEach(function (f) { var ht = roofY(f) - beltY(f) - 0.04; g.add(bx(Wg + 0.055, ht, 0.1, o.pillarMat || R, 0, beltY(f) + 0.03 + ht / 2, f)); });
    if (o.glassRoof) g.add(pane(Wg - 0.36, o.glassRoof[0], roofY(o.glassRoof[0]), o.glassRoof[1], roofY(o.glassRoof[1]), M.glass, 0.012));
    if (o.rails) both(function (sd) { g.add(bx(0.05, 0.05, o.rails[0] - o.rails[1], o.railMat || M.dark, sd * (Wg / 2 - 0.12), roofY((o.rails[0] + o.rails[1]) / 2) + 0.045, (o.rails[0] + o.rails[1]) / 2)); });
    if (o.fin !== undefined) g.add(bx(0.05, 0.07, 0.2, M.gloss, 0, roofY(o.fin) + 0.05, o.fin));
    if (o.spoiler) g.add(bx(Wg * 0.94, 0.05, 0.32, o.spoilerMat || R, 0, o.roofY2 + 0.005, o.roofF2 - 0.12));
    if (o.ducktail) g.add(bx(W * 0.82, 0.05, 0.2, B, 0, o.tailY + 0.025, rTip + o.tailIn + 0.08));
    if (o.clad) g.add(bx(W + 0.02, 0.15, s.wb - 2 * r - 0.16, M.dark, 0, gc + 0.075, (ff + fr) / 2));
    [ff, fr].forEach(function (f) { both(function (sd) { g.add(archDisc(r + (o.clad ? 0.15 : 0.07), sd * (W / 2 + 0.008), r, f, o.arch === 'trap')); }); });
    (o.doors || []).forEach(function (f) { var ht = beltY(f) - gc - 0.16; both(function (sd) { g.add(bx(0.012, ht, 0.014, M.gloss, sd * (W / 2 + 0.001), gc + 0.13 + ht / 2, f)); }); });
    both(function (sd) { g.add(bx(0.2, 0.11, 0.14, o.mirrorMat || B, sd * (W / 2 + 0.08), o.hoodY + 0.1, o.cowlF - 0.42)); });
    if (o.bed) {
      var bl = o.rearBaseF - rTip, bm = (o.rearBaseF + rTip) / 2, bh = o.bed.wallY - o.bed.floorY;
      both(function (sd) { g.add(bx(0.09, bh, bl - 0.04, B, sd * (W / 2 - 0.08), o.bed.floorY + bh / 2, bm)); });
      g.add(bx(W - 0.08, bh, 0.09, B, 0, o.bed.floorY + bh / 2, rTip + 0.06));
      g.add(bx(W - 0.26, 0.02, bl - 0.16, M.dark, 0, o.bed.floorY + 0.015, bm));
    }
    F(0.5, 0.11, 0, gc + (o.plateFY || 0.24), o.plate || M.plate, 0.03); Rr(0.5, 0.11, 0, o.plateRY || gc + 0.42, o.plate || M.plate, 0.03);
    var ctx = { g: g, W: W, Wg: Wg, L: L, H: H, B: B, R: R, gc: gc, r: r, ff: ff, fr: fr, fTip: fTip, rTip: rTip, fF: fF, rF: rF, F: F, Rr: Rr, beltY: beltY, roofY: roofY, o: o };
    if (o.detail) o.detail(ctx);
    [ff, fr].forEach(function (f) { both(function (sd) { g.add(wheel2(r, r * 0.8, sd * (W / 2 - 0.1), f, w, o.wheel)); }); });
    var roofF = o.roofSlot === undefined ? (o.roofF1 + o.roofF2) / 2 : o.roofSlot, an = { front: [0, gc + 0.28, fTip + 0.04], roof: [0, roofY(roofF) + 0.02, roofF] };
    if (o.slots.indexOf('side') >= 0) an.side = [W / 2 + 0.08, gc + 0.72, (ff + fr) / 2];
    if (o.slots.indexOf('rear') >= 0) an.rear = o.bed ? [o.slots.indexOf('rear2') >= 0 ? -0.42 : 0, o.bed.floorY + 0.03, bm] : (o.rearSlot || [0, roofY(o.roofF2 + 0.3) + 0.02, o.roofF2 + 0.3]);
    if (o.slots.indexOf('rear2') >= 0) an.rear2 = [0.42, o.bed.floorY + 0.03, bm];
    car.anchors = an; car.seatF = o.cowlF - 0.95; car.hoodLen = fTip - o.cowlF; car.paint = B;
    finishCar(key, g, w, { head: [[-W * 0.33, o.lampY, fF(o.lampY)], [W * 0.33, o.lampY, fF(o.lampY)]],
      tail: o.tailBar ? [[-W * 0.3, o.tailLampY, rF(o.tailLampY), 1.7], [W * 0.3, o.tailLampY, rF(o.tailLampY), 1.7], [0, o.tailLampY, rF(o.tailLampY), 1.7]] : [[-W * 0.36, o.tailLampY, rF(o.tailLampY)], [W * 0.36, o.tailLampY, rF(o.tailLampY)]] });
  }
  var RIM_AERO = { rim: M.rimDark, spoke: M.rim, n: 5, cover: true }, RIM_DARK = { rim: M.rimDark, spoke: M.rim, n: 5 }, RIM_STEEL = { rim: M.rim, spoke: M.rimDark, n: 3 }, RIM_ALLOY = { rim: M.rim, spoke: M.rimDark, n: 5 }, RIM_TRUCK = { rim: M.rim, spoke: M.rimDark, n: 4, cover: true };

  /* 레이저: upright kei box. Vertical lamps at the corners joined by a centre band; vertical tail lamps; sliding-door rail on the kerb side */
  mkCar('laser', { mat: M.mint, gc: 0.16, fo: 0.62, r: 0.277, nose: 0.08, noseY: 0.95, hoodY: 1.05, cowlF: 1.25, roofF1: 0.72, roofF2: -1.62, roofY2: 1.68, rearBaseF: -1.74, deckY: 1.05, tailIn: 0.03, tailY: 1.05, tumble: 0.14, cT: 0.16,
    pillars: [0.15, -0.85], doors: [0.2, -0.82], wheel: RIM_STEEL, slots: ['front', 'roof'], lampY: 0.78, tailLampY: 1.0,
    detail: function (c) {
      c.F(1.02, 0.1, 0, 0.8, M.gloss); c.F(1.0, 0.16, 0, 0.44, M.dark); c.F(0.8, 0.05, 0, 0.3, M.metal);
      both(function (s) {
        c.F(0.13, 0.4, s * 0.66, 0.76, M.head); c.F(0.22, 0.04, s * 0.5, 0.95, M.drl);
        c.Rr(0.09, 0.5, s * 0.7, 1.0, M.tail); c.Rr(0.17, 0.05, s * 0.62, 1.22, M.tail); c.Rr(0.17, 0.05, s * 0.62, 0.78, M.tail);
      });
      c.Rr(1.2, 0.045, 0, 0.88, M.gloss); c.Rr(1.3, 0.14, 0, 0.36, M.dark);
      c.g.add(bx(0.02, 0.03, 1.0, M.gloss, c.W / 2 + 0.003, 1.0, -1.15));
    } });
  /* 돌고래: short one-box hatch, two-tone roof, U-shaped running lamps, full-width tail lamp */
  mkCar('dolphin', { mat: M.coral, roofMat: M.carWhite, plate: M.plateEV, gc: 0.17, fo: 0.85, r: 0.318, nose: 0.18, noseY: 0.88, hoodY: 1.02, cowlF: 1.28, roofF1: 0.55, roofF2: -1.45, roofY2: 1.52, rearBaseF: -1.98, deckY: 1.08, tailIn: 0.1, tailY: 1.0,
    pillars: [-0.25], doors: [0.5, -0.3, -1.1], wheel: RIM_AERO, slots: ['front', 'roof'], spoiler: true, lampY: 0.82, tailLampY: 0.98, tailBar: true,
    detail: function (c) {
      c.F(1.1, 0.1, 0, 0.78, M.gloss); c.F(1.0, 0.14, 0, 0.42, M.dark);
      both(function (s) { c.F(0.34, 0.045, s * 0.6, 0.84, M.drl); c.F(0.045, 0.14, s * 0.77, 0.79, M.drl); c.F(0.2, 0.07, s * 0.58, 0.77, M.head); c.Rr(0.1, 0.13, s * 0.68, 0.96, M.tail); });
      c.Rr(1.5, 0.06, 0, 1.0, M.tail); c.Rr(1.3, 0.14, 0, 0.38, M.dark);
    } });
  /* 그랜절: five-metre three-box sedan. One thin running lamp across the whole nose over a full-width grille; thin full-width tail lamp; opera window */
  mkCar('grand', { mat: M.nocturne, gc: 0.16, fo: 0.93, r: 0.35, nose: 0.1, noseY: 0.82, hoodY: 0.98, cowlF: 1.15, roofF1: 0.25, roofF2: -1.0, roofY2: 1.42, rearBaseF: -1.85, deckY: 1.02, tailIn: 0.08, tailY: 0.98, cT: 0.34,
    pillars: [-0.3], doors: [0.55, -0.32, -1.2], wheel: RIM_ALLOY, slots: ['front', 'roof', 'rear'], rearSlot: [0, 1.01, -2.1], fin: -0.85, lampY: 0.6, tailLampY: 0.92, tailBar: true,
    detail: function (c) {
      c.F(1.74, 0.04, 0, 0.8, M.drl); c.F(1.5, 0.3, 0, 0.56, M.dark);
      [0.48, 0.56, 0.64].forEach(function (y) { c.F(1.36, 0.014, 0, y, M.chrome, 0.06); });
      both(function (s) { c.F(0.15, 0.2, s * 0.8, 0.58, M.head); c.g.add(bx(0.02, 0.13, 0.2, M.glass, s * (c.Wg / 2 + 0.018), 1.2, -1.38)); });
      c.Rr(1.76, 0.04, 0, 0.93, M.tail); c.Rr(1.5, 0.018, 0, 0.985, M.chrome); c.Rr(1.5, 0.14, 0, 0.36, M.dark);
    } });
  /* 이클래식: long bonnet, cabin set back. Gloss panel joining slim lamps to a rounded grille with a round badge; tail lamps with bright star points */
  mkCar('eclass', { mat: M.obsidian, gc: 0.16, fo: 0.84, r: 0.35, nose: 0.15, noseY: 0.8, hoodY: 0.98, cowlF: 0.95, roofF1: 0.1, roofF2: -1.05, roofY2: 1.43, rearBaseF: -1.85, deckY: 1.02, tailIn: 0.1, tailY: 0.97, cT: 0.3,
    pillars: [-0.42], doors: [0.4, -0.45, -1.3], wheel: RIM_ALLOY, slots: ['front', 'roof', 'side'], glassRoof: [-0.05, -0.8], lampY: 0.72, tailLampY: 0.9,
    detail: function (c) {
      c.F(1.62, 0.18, 0, 0.72, M.gloss); c.F(0.8, 0.26, 0, 0.64, M.dark); c.F(0.84, 0.02, 0, 0.78, M.chrome, 0.06); c.F(0.84, 0.02, 0, 0.5, M.chrome, 0.06);
      var badge = cyl(0.1, 0.1, 0.03, 14, M.chrome, 0, 0.64, c.fF(0.64) + 0.075, 'z'); c.g.add(badge);
      c.F(1.2, 0.12, 0, 0.36, M.dark);
      both(function (s) {
        c.F(0.36, 0.09, s * 0.64, 0.74, M.head); c.F(0.3, 0.016, s * 0.64, 0.8, M.drl, 0.06); c.F(0.3, 0.016, s * 0.64, 0.685, M.drl, 0.06);
        c.Rr(0.52, 0.12, s * 0.58, 0.9, M.tail); c.Rr(0.07, 0.07, s * 0.48, 0.9, M.tailHot, 0.06); c.Rr(0.07, 0.07, s * 0.68, 0.9, M.tailHot, 0.06);
        c.g.add(bx(0.015, 0.02, 3.4, M.chrome, s * (c.Wg / 2 + 0.02), c.beltY(-0.4) + 0.02, -0.45));
      });
      c.Rr(0.6, 0.02, 0, 0.9, M.chrome); c.Rr(1.4, 0.13, 0, 0.36, M.dark);
    } });
  /* 아또 3: rounded compact SUV. Silver bar joining slim lamps, scale-pattern D-pillar garnish, roof rails, full-width tail lamp */
  mkCar('atto', { mat: M.carWhite, plate: M.plateEV, gc: 0.18, fo: 0.88, r: 0.347, nose: 0.2, noseY: 0.9, hoodY: 1.06, cowlF: 1.2, roofF1: 0.4, roofF2: -1.4, roofY2: 1.58, rearBaseF: -2.05, deckY: 1.12, tailIn: 0.12, tailY: 1.05, clad: true,
    pillars: [-0.35], doors: [0.5, -0.38, -1.2], wheel: RIM_ALLOY, slots: ['front', 'roof', 'rear'], rails: [0.2, -1.3], railMat: M.metal, glassRoof: [0.2, -0.5], spoiler: true, lampY: 0.86, tailLampY: 1.0, tailBar: true,
    detail: function (c) {
      c.F(1.3, 0.055, 0, 0.86, M.chrome); c.F(0.8, 0.02, 0, 0.79, M.drl); c.F(1.3, 0.26, 0, 0.46, M.dark);
      both(function (s) { c.F(0.4, 0.09, s * 0.66, 0.86, M.head); c.g.add(bx(0.02, 0.3, 0.36, M.metal, s * (c.Wg / 2 + 0.02), 1.34, -1.72)); });
      c.Rr(1.62, 0.07, 0, 1.0, M.tail); c.Rr(1.5, 0.2, 0, 0.4, M.dark);
    } });
  /* 아이고닉: sharp-edged hatch on a three-metre wheelbase. Square pixel lamps, clamshell bonnet, diagonal door crease, pixel tail band */
  mkCar('ionic', { mat: M.sage, plate: M.plateEV, gc: 0.16, fo: 0.845, r: 0.37, nose: 0.1, noseY: 0.88, hoodY: 1.04, cowlF: 1.3, roofF1: 0.5, roofF2: -1.5, roofY2: 1.57, rearBaseF: -2.12, deckY: 1.12, tailIn: 0.1, tailY: 1.02, clad: true, cT: 0.34,
    pillars: [-0.3], doors: [0.6, -0.32, -1.25], wheel: RIM_AERO, slots: ['front', 'roof', 'rear'], spoiler: true, lampY: 0.84, tailLampY: 0.98, tailBar: true,
    detail: function (c) {
      var i;
      c.F(1.62, 0.14, 0, 0.84, M.gloss); c.F(1.3, 0.2, 0, 0.44, M.dark); c.F(1.0, 0.05, 0, 0.3, M.metal);
      both(function (s) { for (i = 0; i < 4; i++) c.F(0.085, 0.085, s * (0.44 + i * 0.105), 0.84, M.head, 0.06); });
      c.g.add(bx(c.W - 0.12, 0.012, 0.02, M.gloss, 0, 0.93, c.fTip - 0.16));
      c.Rr(1.66, 0.2, 0, 0.98, M.gloss);
      for (i = 0; i < 12; i++) { c.Rr(0.075, 0.055, -0.715 + i * 0.13, 1.025, M.tail, 0.06); c.Rr(0.075, 0.055, -0.715 + i * 0.13, 0.94, M.tail, 0.06); }
      c.Rr(1.4, 0.18, 0, 0.4, M.dark);
      both(function (s) { var k = bx(0.01, 0.016, 2.3, M.gloss, s * (c.W / 2 + 0.001), 0.8, 0); k.rotation.x = -0.14; c.g.add(k); });
    } });
  /* 물개: low four-door fastback. Wedge nose with double-U lamps and ripple lines, glass roof, ducktail, dotted full-width tail lamp */
  mkCar('seal', { mat: M.arctic, plate: M.plateEV, gc: 0.14, fo: 0.9, r: 0.347, nose: 0.25, noseY: 0.74, hoodY: 0.94, cowlF: 1.15, roofF1: 0.2, roofF2: -0.75, roofY2: 1.42, rearBaseF: -1.95, deckY: 1.05, tailIn: 0.12, tailY: 1.0, cT: 0.42,
    doors: [0.5, -0.35, -1.15], wheel: RIM_AERO, slots: ['front', 'roof'], roofSlot: -0.2, glassRoof: [0.1, -0.65], ducktail: true, lampY: 0.7, tailLampY: 0.95, tailBar: true,
    detail: function (c) {
      c.F(0.9, 0.12, 0, 0.32, M.dark);
      both(function (s) {
        c.F(0.36, 0.05, s * 0.62, 0.7, M.head); c.F(0.3, 0.03, s * 0.64, 0.63, M.drl);
        [0.5, 0.45, 0.4].forEach(function (y, i) { c.F(0.18 - i * 0.03, 0.018, s * 0.74, y, M.drl, 0.06); });
        [0.62, 0.7, 0.78].forEach(function (x) { c.Rr(0.045, 0.045, s * x, 0.87, M.tail, 0.06); });
      });
      c.Rr(1.62, 0.045, 0, 0.95, M.tail); c.Rr(1.3, 0.16, 0, 0.34, M.dark);
    } });
  /* 바다사자 7: coupe-SUV. C-shaped lamps, roofline falling to a ducktail under a roof spoiler, full-width tail lamp */
  mkCar('sealion', { mat: M.sea, plate: M.plateEV, gc: 0.18, fo: 0.92, r: 0.36, nose: 0.22, noseY: 0.9, hoodY: 1.06, cowlF: 1.22, roofF1: 0.3, roofF2: -0.75, roofY2: 1.58, rearBaseF: -2.1, deckY: 1.22, tailIn: 0.12, tailY: 1.12, clad: true, cT: 0.45,
    pillars: [-0.38], doors: [0.5, -0.4, -1.25], wheel: RIM_DARK, slots: ['front', 'roof', 'rear'], roofSlot: -0.2, rearSlot: [0, 1.36, -1.6], glassRoof: [0.15, -0.65], spoiler: true, ducktail: true, lampY: 0.84, tailLampY: 1.08, tailBar: true,
    detail: function (c) {
      c.F(1.3, 0.24, 0, 0.44, M.dark);
      both(function (s) { c.F(0.42, 0.045, s * 0.62, 0.88, M.drl); c.F(0.045, 0.17, s * 0.82, 0.81, M.drl); c.F(0.3, 0.06, s * 0.66, 0.78, M.head); });
      c.Rr(1.72, 0.055, 0, 1.08, M.tail); c.Rr(1.5, 0.22, 0, 0.42, M.dark);
    } });
  /* 모델 왜: smooth grille-less nose with one thin light bar and split lamps below, black glass roof, recessed full-width tail bar */
  mkCar('modely', { mat: M.deepBlue, plate: M.plateEV, gc: 0.17, fo: 0.9, r: 0.356, nose: 0.28, noseY: 0.88, hoodY: 1.05, cowlF: 1.2, roofF1: 0.3, roofF2: -0.6, roofY2: 1.6, rearBaseF: -2.0, deckY: 1.25, tailIn: 0.12, tailY: 1.15, clad: true, cT: 0.4,
    pillars: [-0.35], pillarMat: M.gloss, doors: [0.5, -0.36, -1.2], wheel: RIM_AERO, slots: ['front', 'roof', 'rear'], roofSlot: 0.0, rearSlot: [0, 1.4, -1.55], glassRoof: [0.22, -0.55], ducktail: true, lampY: 0.84, tailLampY: 1.12, tailBar: true,
    detail: function (c) {
      c.F(1.62, 0.032, 0, 0.86, M.drl); c.F(1.0, 0.12, 0, 0.34, M.dark);
      both(function (s) { c.F(0.26, 0.07, s * 0.72, 0.62, M.head); });
      c.Rr(1.62, 0.12, 0, 1.12, M.gloss); c.Rr(1.5, 0.03, 0, 1.12, M.tail, 0.07); c.Rr(1.4, 0.2, 0, 0.4, M.dark);
    } });
  /* 티볼링: short, upright small SUV. Blade garnish between the lamps, two-tone floating roof, thick C-pillar */
  mkCar('tivoli', { mat: M.dandy, roofMat: M.carWhite, gc: 0.18, fo: 0.87, r: 0.334, nose: 0.12, noseY: 0.95, hoodY: 1.06, cowlF: 1.15, roofF1: 0.45, roofF2: -1.45, roofY2: 1.58, rearBaseF: -1.95, deckY: 1.12, tailIn: 0.08, tailY: 1.05, clad: true, cT: 0.36,
    pillars: [-0.3], doors: [0.45, -0.35, -1.1], wheel: RIM_ALLOY, slots: ['front', 'roof'], rails: [0.2, -1.3], spoiler: true, lampY: 0.86, tailLampY: 1.0,
    detail: function (c) {
      c.F(0.9, 0.045, 0, 0.88, M.gloss); c.F(1.0, 0.22, 0, 0.56, M.dark); c.F(0.9, 0.05, 0, 0.32, M.metal);
      both(function (s) { c.F(0.36, 0.12, s * 0.6, 0.86, M.head); c.F(0.3, 0.02, s * 0.6, 0.94, M.drl, 0.06); c.Rr(0.4, 0.14, s * 0.6, 1.0, M.tail); });
      c.Rr(0.3, 0.05, 0, 0.5, M.gloss); c.Rr(1.4, 0.2, 0, 0.4, M.dark);
    } });
  /* 도로스: boxy mid-size SUV. Six vertical grille slots, grab-handle garnishes on the bonnet, thick C-pillar garnish, roof rack, hexagonal spare-wheel garnish on the tailgate, split vertical tail lamps */
  function torresBody(key, ev) {
    mkCar(key, { mat: ev ? M.latte : M.forest, plate: ev ? M.plateEV : M.plate, gc: 0.2, fo: 0.9, r: 0.364, nose: 0.1, noseY: 1.02, hoodY: 1.12, cowlF: 1.25, roofF1: 0.55, roofF2: -1.8, roofY2: SPECS[key].H - 0.02, rearBaseF: -2.18, deckY: 1.18, tailIn: 0.06, tailY: 1.12, clad: true, cT: 0.42, tumble: 0.26,
      pillars: [-0.25, -1.2], doors: [0.55, -0.3, -1.15], wheel: ev ? RIM_AERO : RIM_ALLOY, slots: ['front', 'roof', 'rear'], roofSlot: -0.3, rails: [0.3, -1.7], spoiler: true, lampY: ev ? 0.56 : 0.86, tailLampY: 1.15,
      detail: function (c) {
        var i;
        if (ev) {
          for (i = -5; i <= 5; i++) c.F(0.1, 0.035, i * 0.14, 0.92, M.drl, 0.06);
          both(function (s) { c.F(0.2, 0.14, s * 0.74, 0.56, M.head); });
          c.F(1.4, 0.2, 0, 0.46, M.dark);
        } else {
          c.F(1.34, 0.26, 0, 0.86, M.gloss);
          for (i = 0; i < 6; i++) c.F(0.09, 0.2, (i - 2.5) * 0.2, 0.86, c.B, 0.07);
          both(function (s) { c.F(0.3, 0.16, s * 0.76, 0.86, M.head); });
          c.F(1.5, 0.22, 0, 0.5, M.dark);
        }
        c.F(0.9, 0.09, 0, 0.33, M.metal);
        both(function (s) {
          c.g.add(bx(0.08, 0.05, 0.3, M.gloss, s * 0.64, 1.12, 1.72));
          c.g.add(bx(0.02, 0.4, 0.34, M.gloss, s * (c.Wg / 2 + 0.02), 1.45, -1.72));
          c.Rr(0.1, 0.17, s * 0.84, 1.27, M.tail); c.Rr(0.1, 0.17, s * 0.84, 1.05, M.tail);
        });
        var hex = new T.Mesh(new T.CylinderGeometry(0.3, 0.3, 0.05, 6), M.gloss); hex.rotation.x = Math.PI / 2; hex.position.set(0, 0.86, -c.rF(0.86) + 0.05); c.g.add(hex);
        c.Rr(1.6, 0.2, 0, 0.47, M.dark); c.Rr(1.0, 0.06, 0, 0.34, M.metal);
      } });
  }
  torresBody('torres', false);
  torresBody('torresevx', true);
  /* 액숀: coupe-SUV, lower and wider than 도로스. Thin running lamp with broken-line ends over low-set lamps, black floating roof, thin full-width tail lamp */
  mkCar('actyon', { mat: M.pearl, roofMat: M.gloss, gc: 0.2, fo: 0.92, r: 0.364, nose: 0.12, noseY: 1.0, hoodY: 1.1, cowlF: 1.25, roofF1: 0.5, roofF2: -1.1, roofY2: 1.64, rearBaseF: -2.15, deckY: 1.22, tailIn: 0.1, tailY: 1.14, clad: true, cT: 0.5,
    pillars: [-0.3], doors: [0.55, -0.32, -1.15], wheel: RIM_DARK, slots: ['front', 'roof'], roofSlot: -0.3, spoiler: true, lampY: 0.74, tailLampY: 1.12, tailBar: true,
    detail: function (c) {
      c.F(1.1, 0.03, 0, 0.94, M.drl); c.F(1.2, 0.22, 0, 0.6, M.dark); c.F(0.9, 0.08, 0, 0.34, M.metal);
      both(function (s) {
        c.F(0.12, 0.03, s * 0.66, 0.94, M.drl); c.F(0.07, 0.03, s * 0.8, 0.94, M.drl); c.F(0.24, 0.12, s * 0.74, 0.74, M.head);
        c.g.add(bx(0.08, 0.05, 0.3, M.gloss, s * 0.66, 1.1, 1.72));
      });
      c.Rr(1.72, 0.035, 0, 1.12, M.tail); c.Rr(1.6, 0.22, 0, 0.44, M.dark); c.Rr(1.0, 0.06, 0, 0.32, M.metal);
    } });
  /* 렉스톤: tall three-row body-on-frame SUV. Large diamond-pattern grille, four-beam lamps, T-shaped tail lamps, twin exhaust garnishes */
  mkCar('rexton', { mat: M.obsidian, gc: 0.22, fo: 0.9, r: 0.385, nose: 0.08, noseY: 1.1, hoodY: 1.2, cowlF: 1.2, roofF1: 0.5, roofF2: -2.0, roofY2: 1.8, rearBaseF: -2.3, deckY: 1.22, tailIn: 0.05, tailY: 1.15, clad: true, cT: 0.3, tumble: 0.26,
    pillars: [-0.3, -1.3], doors: [0.5, -0.35, -1.25], wheel: RIM_ALLOY, slots: ['front', 'roof', 'side'], rails: [0.3, -1.9], railMat: M.metal, spoiler: true, lampY: 0.98, tailLampY: 1.12,
    detail: function (c) {
      c.F(1.1, 0.42, 0, 0.86, M.dark); c.F(1.14, 0.03, 0, 1.08, M.chrome, 0.06); c.F(1.14, 0.03, 0, 0.64, M.chrome, 0.06);
      [-0.3, 0, 0.3].forEach(function (x) { [0.76, 0.96].forEach(function (y) { var d = bx(0.14, 0.14, 0.06, M.chrome, x, y, c.fF(y) + 0.05); d.rotation.z = Math.PI / 4; c.g.add(d); }); });
      c.F(1.2, 0.08, 0, 0.36, M.metal);
      both(function (s) {
        c.F(0.4, 0.15, s * 0.77, 0.98, M.head); c.F(0.3, 0.02, s * 0.77, 0.88, M.amber, 0.06);
        c.Rr(0.5, 0.08, s * 0.62, 1.12, M.tail); c.Rr(0.08, 0.26, s * 0.83, 1.03, M.tail); c.Rr(0.2, 0.07, s * 0.6, 0.38, M.chrome);
      });
      c.Rr(0.7, 0.03, 0, 1.12, M.chrome); c.Rr(1.6, 0.18, 0, 0.5, M.dark);
    } });
  /* 무쏴: double-cab diesel pickup. Square bumper and large upright grille under a five-segment lamp strip, trapezoid arches with cladding, sport bar, open deck */
  mkCar('musso', { mat: M.marble, gc: 0.24, fo: 0.9, r: 0.38, nose: 0.08, noseY: 1.12, hoodY: 1.22, cowlF: 1.35, roofF1: 0.7, roofF2: -0.62, roofY2: 1.84, rearBaseF: -0.75, deckY: 1.25, tailIn: 0, tailY: 1.3, bed: { floorY: 0.86, wallY: 1.3 }, clad: true, arch: 'trap', cT: 0.12, tumble: 0.24,
    pillars: [0.02], doors: [0.6, -0.05], wheel: RIM_DARK, slots: ['front', 'roof', 'rear', 'rear2'], rails: [0.5, -0.5], lampY: 0.92, tailLampY: 1.0,
    detail: function (c) {
      var i;
      c.F(1.2, 0.4, 0, 0.9, M.gloss);
      [0.78, 0.9, 1.02].forEach(function (y) { c.F(1.1, 0.03, 0, y, M.metal, 0.06); });
      for (i = -2; i <= 2; i++) c.F(0.2, 0.03, i * 0.24, 1.14, M.drl, 0.06);
      c.F(1.92, 0.26, 0, 0.5, M.dark, 0.1); c.F(0.9, 0.07, 0, 0.36, M.metal, 0.12);
      both(function (s) {
        c.F(0.26, 0.2, s * 0.8, 0.92, M.head); c.F(0.04, 0.2, s * 0.94, 0.92, M.drl, 0.06);
        c.Rr(0.1, 0.42, s * 0.9, 1.0, M.tail);
        c.g.add(bx(0.07, 0.42, 0.07, M.gloss, s * (c.W / 2 - 0.14), 1.5, -0.95)); c.g.add(bx(0.07, 0.07, 0.5, M.gloss, s * (c.W / 2 - 0.14), 1.68, -1.16));
        c.g.add(bx(0.16, 0.05, 1.5, M.dark, s * (c.W / 2 + 0.04), c.gc + 0.04, 0.15));
      });
      c.g.add(bx(c.W - 0.28, 0.07, 0.07, M.gloss, 0, 1.68, -0.95));
      c.Rr(0.5, 0.05, 0, 1.2, M.gloss); c.Rr(1.86, 0.16, 0, 0.5, M.dark, 0.12);
    } });
  /* 무쏴 EV: one-piece electric pickup. Dotted running-lamp band, thick C-pillar flowing into the deck with a vertical garnish, deck-top protector, side steps, tool-shaped tail lamps */
  mkCar('mussoev', { mat: M.blaze, plate: M.plateEV, gc: 0.2, fo: 0.93, r: 0.363, nose: 0.1, noseY: 1.02, hoodY: 1.12, cowlF: 1.55, roofF1: 0.85, roofF2: -0.45, roofY2: 1.72, rearBaseF: -1.0, deckY: 1.22, tailIn: 0, tailY: 1.22, bed: { floorY: 0.82, wallY: 1.22 }, clad: true, cT: 0.5,
    pillars: [0.2], doors: [0.85, 0.15, -0.6], wheel: RIM_AERO, slots: ['front', 'roof', 'rear'], rails: [0.6, -0.4], lampY: 0.6, tailLampY: 1.0,
    detail: function (c) {
      var i;
      for (i = -5; i <= 5; i++) c.F(0.1, 0.035, i * 0.14, 0.92, M.drl, 0.06);
      c.F(1.4, 0.22, 0, 0.5, M.gloss); c.F(0.9, 0.08, 0, 0.33, M.metal);
      both(function (s) {
        c.F(0.2, 0.14, s * 0.76, 0.6, M.head);
        c.g.add(bx(0.02, 0.42, 0.12, M.gloss, s * (c.Wg / 2 + 0.02), 1.42, -0.86));
        c.g.add(bx(0.1, 0.035, 1.5, M.gloss, s * (c.W / 2 - 0.08), 1.24, -1.8));
        c.g.add(bx(0.16, 0.05, 1.7, M.dark, s * (c.W / 2 + 0.04), c.gc + 0.04, 0.1));
        c.Rr(0.1, 0.36, s * 0.88, 1.0, M.tail); c.Rr(0.17, 0.07, s * 0.8, 1.14, M.tail);
      });
      c.Rr(1.86, 0.16, 0, 0.46, M.dark, 0.1);
    } });
  /* 캐논발: long flat-roofed minivan. Upright lamps with angled running lamps around a wide grille, C-pillar fin garnish, roof rack, sliding-door rail, vertical tail lamps joined by a bar */
  mkCar('cannonball', { mat: M.ivory, gc: 0.17, fo: 0.94, r: 0.37, nose: 0.1, noseY: 1.0, hoodY: 1.12, cowlF: 1.55, roofF1: 0.8, roofF2: -2.3, roofY2: 1.76, rearBaseF: -2.5, deckY: 1.15, tailIn: 0.05, tailY: 1.12, clad: true, cT: 0.2, tumble: 0.26,
    pillars: [-0.2, -1.42], doors: [0.75, -0.25, -1.5], wheel: RIM_ALLOY, slots: ['front', 'roof', 'side'], roofSlot: -0.6, rails: [0.5, -2.1], railMat: M.metal, spoiler: true, lampY: 0.8, tailLampY: 1.05, tailBar: true,
    detail: function (c) {
      c.F(1.5, 0.36, 0, 0.78, M.dark);
      [0.68, 0.78, 0.88].forEach(function (y) { c.F(1.4, 0.02, 0, y, M.chrome, 0.06); });
      c.F(1.2, 0.08, 0, 0.32, M.metal);
      both(function (s) {
        c.F(0.13, 0.36, s * 0.86, 0.8, M.head); c.F(0.3, 0.035, s * 0.72, 0.99, M.drl, 0.06); c.F(0.035, 0.3, s * 0.95, 0.84, M.drl, 0.06);
        c.Rr(0.1, 0.4, s * 0.88, 1.05, M.tail);
        c.g.add(bx(0.02, 0.36, 0.2, M.chrome, s * (c.Wg / 2 + 0.02), 1.46, -1.42));
        c.g.add(bx(0.02, 0.03, 1.2, M.gloss, s * (c.W / 2 + 0.003), 1.1, -1.7));
      });
      c.Rr(1.72, 0.04, 0, 1.22, M.tail); c.Rr(1.7, 0.2, 0, 0.42, M.dark); c.Rr(1.1, 0.06, 0, 0.3, M.metal);
    } });

  /* text on a car's flank, readable from both sides */
  function sideText(c, text, fg, bg, w, h, y, f) {
    var mat = textMat(text, fg, bg, Math.round(w * 180), Math.round(h * 180));
    both(function (s) { var m = new T.Mesh(new T.PlaneGeometry(w, h), mat); m.rotation.y = s * Math.PI / 2; m.position.set(s * (c.W / 2 + 0.006), y, -f); c.g.add(m); });
  }
  /* roof light bar: two halves that flash in turn */
  function lightBar(c, key, f, y, colA, colB, wd) {
    var half = (wd || 1.2) / 2;
    c.g.add(bx(wd || 1.2, 0.05, 0.3, M.gloss, 0, y + 0.025, f));
    var a = bx(half - 0.03, 0.11, 0.26, colA, -half / 2, y + 0.1, f), b = bx(half - 0.03, 0.11, 0.26, colB, half / 2, y + 0.1, f);
    a.castShadow = false; b.castShadow = false; c.g.add(a); c.g.add(b);
    var ga = glowSprite(colA.color.getHex(), 2.6, 0.8); ga.position.set(0, 0.1, 0); a.add(ga);
    var gb = glowSprite(colB.color.getHex(), 2.6, 0.8); gb.position.set(0, 0.1, 0); b.add(gb);
    CARS[key].blink = [a, b];
  }
  /* 아방떼: low wedge sedan with a fastback roofline. Slim lamps joined by a thin garnish over a wide black grille, sharp door creases, H-shaped full-width tail lamp, ducktail */
  mkCar('avante', { mat: M.avRed, gc: 0.15, fo: 0.88, r: 0.318, nose: 0.2, noseY: 0.72, hoodY: 0.92, cowlF: 1.0, roofF1: 0.12, roofF2: -0.92, roofY2: 1.37, rearBaseF: -1.8, deckY: 1.02, tailIn: 0.1, tailY: 0.98, cT: 0.4,
    pillars: [-0.35], doors: [0.45, -0.35, -1.18], wheel: RIM_ALLOY, slots: ['front', 'roof', 'rear'], rearSlot: [0, 1.01, -2.02], ducktail: true, lampY: 0.7, tailLampY: 0.94, tailBar: true,
    detail: function (c) {
      c.F(1.2, 0.018, 0, 0.71, M.chrome, 0.06); c.F(1.5, 0.3, 0, 0.47, M.dark); c.F(1.1, 0.05, 0, 0.3, M.gloss);
      both(function (s) {
        c.F(0.42, 0.07, s * 0.66, 0.7, M.head); c.F(0.36, 0.018, s * 0.68, 0.75, M.drl, 0.06);
        c.Rr(0.05, 0.2, s * 0.84, 0.9, M.tail);
        var k1 = bx(0.01, 0.014, 1.25, M.gloss, s * (c.W / 2 + 0.001), 0.74, 0.35); k1.rotation.x = 0.1; c.g.add(k1);
        var k2 = bx(0.01, 0.014, 1.25, M.gloss, s * (c.W / 2 + 0.001), 0.62, -0.75); k2.rotation.x = -0.12; c.g.add(k2);
      });
      c.Rr(1.7, 0.035, 0, 0.95, M.tail); c.Rr(1.5, 0.17, 0, 0.36, M.gloss);
    } });
  /* 지팔공: long bonnet with the cabin set back. Shield-shaped crest grille, two-line lamps repeated on the wings and at the tail, roofline sloping like a coupe */
  mkCar('g80', { mat: M.g80Green, gc: 0.16, fo: 0.86, r: 0.36, nose: 0.1, noseY: 0.84, hoodY: 1.0, cowlF: 0.85, roofF1: 0.0, roofF2: -1.1, roofY2: 1.4, rearBaseF: -2.0, deckY: 1.04, tailIn: 0.12, tailY: 0.98, cT: 0.42,
    pillars: [-0.5], doors: [0.3, -0.5, -1.35], wheel: RIM_ALLOY, slots: ['front', 'roof', 'side'], roofSlot: -0.5, ducktail: true, lampY: 0.76, tailLampY: 0.92,
    detail: function (c) {
      c.F(0.86, 0.3, 0, 0.7, M.dark); c.F(0.9, 0.024, 0, 0.86, M.chrome, 0.06);
      both(function (s) {
        var v = bx(0.5, 0.024, 0.06, M.chrome, s * 0.22, 0.47, c.fF(0.5) + 0.05); v.rotation.z = s * 0.52; c.g.add(v);
        var e = bx(0.024, 0.3, 0.06, M.chrome, s * 0.44, 0.71, c.fF(0.7) + 0.05); c.g.add(e);
        c.F(0.46, 0.022, s * 0.72, 0.8, M.drl, 0.06); c.F(0.46, 0.022, s * 0.72, 0.72, M.drl, 0.06);
        c.g.add(bx(0.012, 0.018, 0.34, M.drl, s * (c.W / 2 + 0.002), 0.8, c.ff - 0.62)); c.g.add(bx(0.012, 0.018, 0.34, M.drl, s * (c.W / 2 + 0.002), 0.73, c.ff - 0.62));
        c.Rr(0.62, 0.026, s * 0.6, 0.96, M.tail, 0.06); c.Rr(0.62, 0.026, s * 0.6, 0.88, M.tail, 0.06);
        c.Rr(0.36, 0.035, s * 0.52, 0.34, M.chrome);
        c.g.add(bx(0.015, 0.02, 3.3, M.chrome, s * (c.Wg / 2 + 0.02), c.beltY(-0.5) + 0.02, -0.55));
      });
      c.F(1.3, 0.12, 0, 0.36, M.dark); c.Rr(1.4, 0.13, 0, 0.36, M.dark);
    } });
  /* 아이고닉 N: the pixel-lamp hatch made low and wide. Black bumpers with an orange line round the bottom, widened arches, big roof wing, rear diffuser */
  mkCar('ionicn', { mat: M.nBlue, plate: M.plateEV, gc: 0.14, fo: 0.875, r: 0.375, nose: 0.1, noseY: 0.86, hoodY: 1.02, cowlF: 1.33, roofF1: 0.52, roofF2: -1.5, roofY2: 1.55, rearBaseF: -2.14, deckY: 1.1, tailIn: 0.1, tailY: 1.0, clad: true, cT: 0.34,
    pillars: [-0.3], doors: [0.6, -0.32, -1.25], wheel: RIM_DARK, slots: ['front', 'roof', 'rear'], lampY: 0.82, tailLampY: 0.96, tailBar: true,
    detail: function (c) {
      var i;
      c.F(1.66, 0.13, 0, 0.82, M.gloss); c.F(1.74, 0.3, 0, 0.46, M.gloss); c.F(1.7, 0.03, 0, 0.27, M.nOrange, 0.07);
      both(function (s) {
        for (i = 0; i < 4; i++) c.F(0.085, 0.085, s * (0.44 + i * 0.105), 0.82, M.head, 0.06);
        c.F(0.22, 0.2, s * 0.68, 0.46, M.dark, 0.07);
        c.g.add(bx(0.012, 0.03, c.ff - c.fr - 2 * c.r - 0.2, M.nOrange, s * (c.W / 2 + 0.014), c.gc + 0.035, (c.ff + c.fr) / 2));
        var k = bx(0.01, 0.016, 2.3, M.gloss, s * (c.W / 2 + 0.001), 0.78, 0); k.rotation.x = -0.14; c.g.add(k);
        c.g.add(bx(0.05, 0.16, 0.5, M.gloss, s * (c.Wg / 2 - 0.2), 1.6, -1.72));
      });
      c.g.add(bx(c.Wg * 1.0, 0.045, 0.46, M.gloss, 0, 1.68, -1.78)); c.g.add(bx(0.2, 0.035, 0.03, M.tail, 0, 1.66, -2.02));
      c.Rr(1.66, 0.2, 0, 0.96, M.gloss);
      for (i = 0; i < 12; i++) { c.Rr(0.075, 0.055, -0.715 + i * 0.13, 1.005, M.tail, 0.06); c.Rr(0.075, 0.055, -0.715 + i * 0.13, 0.92, M.tail, 0.06); }
      c.Rr(1.7, 0.28, 0, 0.42, M.gloss); c.Rr(1.6, 0.03, 0, 0.26, M.nOrange, 0.07);
      [-0.45, -0.15, 0.15, 0.45].forEach(function (x) { c.Rr(0.03, 0.14, x, 0.36, M.dark, 0.08); });
    } });
  /* 이브 3: short boxy SUV. Closed nose with L-shaped running lamps at the outer corners, squared arches, black rear pillar under a floating roof, L-shaped tail lamps beside the glass */
  mkCar('ev3', { mat: M.terra, plate: M.plateEV, gc: 0.19, fo: 0.85, r: 0.35, nose: 0.08, noseY: 0.95, hoodY: 1.06, cowlF: 1.15, roofF1: 0.4, roofF2: -1.55, roofY2: 1.5, rearBaseF: -1.98, deckY: 1.12, tailIn: 0.08, tailY: 1.08, clad: true, arch: 'trap', cT: 0.3,
    pillars: [-0.3], doors: [0.45, -0.35, -1.15], wheel: RIM_AERO, slots: ['front', 'roof', 'rear'], spoiler: true, spoilerMat: M.gloss, lampY: 0.88, tailLampY: 1.1,
    detail: function (c) {
      c.F(1.3, 0.2, 0, 0.44, M.dark); c.F(1.0, 0.06, 0, 0.3, M.metal);
      both(function (s) {
        c.F(0.045, 0.3, s * 0.84, 0.9, M.drl, 0.06); c.F(0.3, 0.04, s * 0.71, 1.03, M.drl, 0.06); c.F(0.1, 0.16, s * 0.72, 0.86, M.head);
        c.g.add(bx(0.02, 0.36, 0.52, M.gloss, s * (c.Wg / 2 + 0.02), 1.3, -1.62));
        c.Rr(0.05, 0.3, s * 0.86, 0.94, M.tail); c.Rr(0.26, 0.045, s * 0.74, 0.81, M.tail);
      });
      c.Rr(1.6, 0.22, 0, 0.44, M.dark); c.Rr(1.0, 0.06, 0, 0.31, M.metal);
    } });
  /* 이브 9: very large upright three-row box. Closed nose with stacked cube lamps and angular running lamps, squared arches, thin vertical tail lamps down the tailgate edges */
  mkCar('ev9', { mat: M.iceberg, plate: M.plateEV, gc: 0.2, fo: 0.87, r: 0.39, nose: 0.07, noseY: 1.08, hoodY: 1.18, cowlF: 1.35, roofF1: 0.65, roofF2: -2.15, roofY2: 1.74, rearBaseF: -2.4, deckY: 1.24, tailIn: 0.05, tailY: 1.18, clad: true, arch: 'trap', cT: 0.25, tumble: 0.26,
    pillars: [-0.2, -1.35], pillarMat: M.gloss, doors: [0.6, -0.3, -1.4], wheel: RIM_AERO, slots: ['front', 'roof', 'side', 'rear'], roofSlot: -0.3, rearSlot: [0, 1.76, -1.7], rails: [0.4, -2.0], spoiler: true, lampY: 0.98, tailLampY: 1.2,
    detail: function (c) {
      c.F(1.74, 0.26, 0, 0.48, M.gloss); c.F(1.1, 0.07, 0, 0.32, M.metal);
      both(function (s) {
        [0.9, 1.0].forEach(function (y) { c.F(0.085, 0.085, s * 0.8, y, M.head, 0.06); c.F(0.085, 0.085, s * 0.69, y, M.head, 0.06); });
        c.F(0.04, 0.34, s * 0.93, 0.97, M.drl, 0.06); c.F(0.24, 0.035, s * 0.83, 1.13, M.drl, 0.06);
        c.Rr(0.045, 0.42, s * 0.93, 1.0, M.tail); c.Rr(0.2, 0.04, s * 0.84, 0.81, M.tail);
        c.g.add(bx(0.03, 0.4, 0.05, M.tail, s * (c.Wg / 2 - 0.02), 1.5, -2.33));
      });
      c.Rr(1.74, 0.26, 0, 0.48, M.gloss); c.Rr(1.1, 0.07, 0, 0.32, M.metal);
    } });
  /* 산타패: boxy two-box SUV with a long flat roof. H-shaped lamps front and rear, H motif in the bumper, squared arches, very upright wide tailgate with the lamps set low */
  mkCar('santafe', { mat: M.khaki, gc: 0.2, fo: 0.9, r: 0.37, nose: 0.06, noseY: 1.06, hoodY: 1.16, cowlF: 1.3, roofF1: 0.6, roofF2: -2.2, roofY2: 1.7, rearBaseF: -2.36, deckY: 1.2, tailIn: 0.03, tailY: 1.14, clad: true, arch: 'trap', cT: 0.6, tumble: 0.22,
    pillars: [-0.2, -1.3], doors: [0.55, -0.3, -1.35], wheel: RIM_DARK, slots: ['front', 'roof', 'rear'], roofSlot: -0.3, rearSlot: [0, 1.72, -1.7], rails: [0.45, -2.05], spoiler: true, lampY: 0.98, tailLampY: 0.82,
    detail: function (c) {
      c.F(1.84, 0.2, 0, 0.98, M.gloss); c.F(0.9, 0.025, 0, 0.98, M.drl, 0.06); c.F(1.4, 0.2, 0, 0.72, M.dark);
      c.F(1.5, 0.2, 0, 0.44, M.dark); c.F(0.06, 0.2, -0.5, 0.44, M.metal, 0.07); c.F(0.06, 0.2, 0.5, 0.44, M.metal, 0.07); c.F(1.0, 0.05, 0, 0.44, M.metal, 0.07);
      both(function (s) {
        c.F(0.035, 0.16, s * 0.6, 0.98, M.drl, 0.07); c.F(0.035, 0.16, s * 0.86, 0.98, M.drl, 0.07); c.F(0.26, 0.035, s * 0.73, 0.98, M.drl, 0.07);
        c.Rr(0.035, 0.15, s * 0.56, 0.82, M.tail, 0.07); c.Rr(0.035, 0.15, s * 0.86, 0.82, M.tail, 0.07); c.Rr(0.3, 0.035, s * 0.71, 0.82, M.tail, 0.07);
        c.g.add(bx(0.02, 0.2, 0.08, M.gloss, s * (c.Wg / 2 + 0.03), 1.48, -1.72));
      });
      c.Rr(1.84, 0.22, 0, 0.82, M.gloss, 0.03); c.Rr(1.6, 0.2, 0, 0.44, M.dark); c.Rr(1.0, 0.06, 0, 0.31, M.metal);
    } });
  /* 소나기 순찰차: low fastback sedan in patrol livery. Full-width running lamp over a wide black grille, blue band with a yellow line along the flanks, red and blue light bar */
  mkCar('police', { mat: M.carWhite, gc: 0.15, fo: 0.94, r: 0.33, nose: 0.22, noseY: 0.74, hoodY: 0.94, cowlF: 1.05, roofF1: 0.15, roofF2: -0.95, roofY2: 1.4, rearBaseF: -1.95, deckY: 1.04, tailIn: 0.1, tailY: 1.0, cT: 0.42,
    pillars: [-0.35], doors: [0.5, -0.35, -1.22], wheel: RIM_STEEL, slots: ['front', 'roof', 'rear'], roofSlot: -0.72, rearSlot: [0, 1.03, -2.12], ducktail: true, lampY: 0.56, tailLampY: 0.95, tailBar: true,
    detail: function (c) {
      c.F(1.72, 0.03, 0, 0.75, M.drl); c.F(1.6, 0.3, 0, 0.5, M.dark); c.F(1.2, 0.05, 0, 0.3, M.gloss);
      both(function (s) {
        c.F(0.2, 0.1, s * 0.7, 0.56, M.head); c.Rr(0.05, 0.2, s * 0.84, 0.9, M.tail);
        c.g.add(bx(0.012, 0.2, 3.5, M.polBlue, s * (c.W / 2 + 0.003), 0.6, -0.1)); c.g.add(bx(0.012, 0.04, 3.5, M.polYellow, s * (c.W / 2 + 0.004), 0.73, -0.1));
      });
      c.g.add(pane(0.46, c.fTip - 0.3, 0.755, 1.1, 0.932, M.polBlue, 0.024));
      c.g.add(bx(0.5, 0.012, 0.42, M.polBlue, 0, 1.045, -2.12));
      sideText(c, '경찰', '#1a3f9a', '#f1f1ee', 0.62, 0.26, 0.9, -0.1);
      lightBar(c, 'police', -0.12, c.roofY(-0.12), M.barRed, M.barBlue, 1.25);
      c.Rr(1.7, 0.035, 0, 0.96, M.tail); c.Rr(1.5, 0.16, 0, 0.36, M.dark);
    } });
  /* 스타리오 구급차: one-box van with a short sloping nose and very large windows. Thin full-width running lamp over a wide low grille, lime band edged in red, red light bar, tall vertical tail lamps */
  mkCar('ambul', { mat: M.carWhite, H: 2.0, gc: 0.18, fo: 0.94, r: 0.36, nose: 0.28, noseY: 0.96, hoodY: 1.14, cowlF: 2.02, roofF1: 0.95, roofF2: -2.53, roofY2: 1.98, rearBaseF: -2.6, deckY: 1.14, tailIn: 0.04, tailY: 1.2, cT: 0.2, tumble: 0.22,
    pillars: [0.55, -0.6, -1.6], doors: [0.95, -0.2, -1.5], wheel: RIM_STEEL, slots: ['front', 'roof', 'side'], roofSlot: -1.1, lampY: 0.62, tailLampY: 1.3,
    detail: function (c) {
      c.F(1.84, 0.03, 0, 1.0, M.drl); c.F(1.74, 0.42, 0, 0.6, M.dark); c.F(1.2, 0.06, 0, 0.31, M.metal);
      [0.5, 0.6, 0.7].forEach(function (y) { c.F(1.3, 0.016, 0, y, M.metal, 0.06); });
      both(function (s) {
        c.F(0.2, 0.22, s * 0.82, 0.62, M.head);
        c.Rr(0.09, 0.9, s * 0.9, 1.3, M.tail);
        c.g.add(bx(0.012, 0.26, 4.5, M.lime, s * (c.W / 2 + 0.003), 0.62, -0.15)); c.g.add(bx(0.012, 0.045, 4.5, M.sosRed, s * (c.W / 2 + 0.004), 0.78, -0.15));
        c.g.add(bx(0.02, 0.03, 1.5, M.gloss, s * (c.W / 2 + 0.003), 1.06, -1.3));
        c.g.add(bx(0.3, 0.1, 0.16, M.barRed, s * 0.7, c.roofY(-2.3) + 0.05, -2.3));
      });
      sideText(c, '119 구급대', '#d81e1e', '#f1f1ee', 1.3, 0.24, 0.95, -1.3);
      c.Rr(1.5, 0.24, 0, 0.72, M.lime, 0.03); c.Rr(1.7, 0.2, 0, 0.42, M.dark);
      c.g.add(pane(0.9, c.fTip - 0.32, 0.982, 2.06, 1.118, M.sosRed, 0.024));
      lightBar(c, 'ambul', 0.55, c.roofY(0.55), M.barRed, M.barRed, 1.5);
    } });

  /* 쏘렌타: boxy two-box SUV. Stacked vertical lamps at the outer corners with T-shaped running lamps, wide upright grille, vertical tail lamps */
  mkCar('sorento', { mat: M.sandBrown, gc: 0.19, fo: 0.92, r: 0.36, nose: 0.08, noseY: 1.02, hoodY: 1.12, cowlF: 1.3, roofF1: 0.55, roofF2: -2.05, roofY2: 1.66, rearBaseF: -2.3, deckY: 1.18, tailIn: 0.05, tailY: 1.12, clad: true, cT: 0.3, tumble: 0.24,
    pillars: [-0.25, -1.3], doors: [0.55, -0.3, -1.3], wheel: RIM_ALLOY, slots: ['front', 'roof', 'rear'], roofSlot: -0.3, rearSlot: [0, 1.68, -1.6], rails: [0.4, -1.9], railMat: M.metal, spoiler: true, lampY: 0.9, tailLampY: 1.0,
    detail: function (c) {
      c.F(1.36, 0.4, 0, 0.82, M.dark); [0.72, 0.82, 0.92].forEach(function (y) { c.F(1.26, 0.018, 0, y, M.chrome, 0.06); }); c.F(1.1, 0.07, 0, 0.32, M.metal);
      both(function (s) {
        c.F(0.1, 0.3, s * 0.82, 0.88, M.head); c.F(0.035, 0.34, s * 0.92, 0.9, M.drl, 0.06); c.F(0.22, 0.035, s * 0.82, 1.06, M.drl, 0.06);
        c.Rr(0.08, 0.36, s * 0.86, 0.94, M.tail); c.Rr(0.22, 0.04, s * 0.76, 1.1, M.tail);
        c.g.add(bx(0.02, 0.3, 0.14, M.chrome, s * (c.Wg / 2 + 0.02), 1.4, -1.3));
      });
      c.Rr(1.6, 0.2, 0, 0.44, M.dark); c.Rr(1.0, 0.06, 0, 0.31, M.metal);
    } });
  /* 팰리세이브: very large upright SUV. Tall running-lamp columns merged into a wide block-pattern grille, squared arches, layered vertical tail lamps at the outer edges */
  mkCar('palisade', { mat: M.navy, gc: 0.21, fo: 0.9, r: 0.39, nose: 0.05, noseY: 1.12, hoodY: 1.22, cowlF: 1.35, roofF1: 0.65, roofF2: -2.2, roofY2: 1.78, rearBaseF: -2.45, deckY: 1.26, tailIn: 0.04, tailY: 1.2, clad: true, arch: 'trap', cT: 0.3, tumble: 0.24,
    pillars: [-0.2, -1.35], doors: [0.6, -0.3, -1.4], wheel: RIM_ALLOY, slots: ['front', 'roof', 'side'], roofSlot: -0.3, rails: [0.45, -2.05], railMat: M.metal, spoiler: true, lampY: 0.8, tailLampY: 1.0,
    detail: function (c) {
      var i, j;
      c.F(1.72, 0.52, 0, 0.88, M.dark);
      for (i = -5; i <= 5; i++) for (j = 0; j < 3; j++) c.F(0.09, 0.07, i * 0.135 + (j % 2 ? 0.067 : 0), 0.74 + j * 0.14, M.chrome, 0.06);
      c.F(1.2, 0.08, 0, 0.36, M.metal);
      both(function (s) {
        c.F(0.05, 0.5, s * 0.92, 0.9, M.drl, 0.07); c.F(0.05, 0.5, s * 0.8, 0.9, M.drl, 0.07); c.F(0.08, 0.2, s * 0.86, 0.8, M.head, 0.07);
        c.Rr(0.06, 0.5, s * 0.93, 1.0, M.tail); c.Rr(0.06, 0.4, s * 0.83, 1.0, M.tail);
      });
      c.Rr(1.7, 0.22, 0, 0.46, M.dark); c.Rr(1.1, 0.07, 0, 0.32, M.metal);
    } });
  /* 캐스터 EV: tiny tall box. Round running-lamp rings, pixel turn signals in a black panel, bulging arches, pixel tail band */
  mkCar('casper', { mat: M.sienna, plate: M.plateEV, gc: 0.17, fo: 0.66, r: 0.3, nose: 0.1, noseY: 0.92, hoodY: 1.02, cowlF: 1.15, roofF1: 0.55, roofF2: -1.5, roofY2: 1.55, rearBaseF: -1.72, deckY: 1.05, tailIn: 0.05, tailY: 1.02, clad: true, cT: 0.22, tumble: 0.16,
    pillars: [-0.05], doors: [0.25, -0.6], wheel: RIM_AERO, slots: ['front', 'roof'], rails: [0.3, -1.3], lampY: 0.66, tailLampY: 0.72,
    detail: function (c) {
      var i;
      c.F(1.2, 0.16, 0, 0.9, M.gloss); c.F(1.0, 0.2, 0, 0.4, M.dark); c.F(0.7, 0.05, 0, 0.29, M.metal);
      both(function (s) {
        var ring = cyl(0.115, 0.115, 0.03, 16, M.drl, s * 0.5, 0.66, c.fF(0.66) + 0.05, 'z'); ring.castShadow = false; c.g.add(ring);
        c.g.add(cyl(0.075, 0.075, 0.035, 16, M.head, s * 0.5, 0.66, c.fF(0.66) + 0.055, 'z'));
        for (i = 0; i < 3; i++) c.F(0.05, 0.05, s * (0.36 + i * 0.075), 0.9, M.drl, 0.06);
        c.Rr(0.15, 0.15, s * 0.52, 0.72, M.tail); c.Rr(0.09, 0.09, s * 0.52, 0.72, M.tailHot, 0.06);
        for (i = 0; i < 3; i++) c.Rr(0.05, 0.05, s * (0.36 + i * 0.075), 0.98, M.tail, 0.06);
      });
      c.Rr(1.2, 0.14, 0, 0.98, M.gloss, 0.03); c.Rr(1.1, 0.18, 0, 0.4, M.dark);
    } });
  /* 오시리얼: long rear-drive sedan. Twin kidney grille with a lit outline, slim upturned lamps, fastback-like roofline, slim horizontal tail lamps */
  mkCar('bmw5', { mat: M.silverGrey, gc: 0.16, fo: 0.84, r: 0.35, nose: 0.12, noseY: 0.84, hoodY: 1.0, cowlF: 0.9, roofF1: 0.05, roofF2: -1.1, roofY2: 1.46, rearBaseF: -1.95, deckY: 1.05, tailIn: 0.1, tailY: 1.0, cT: 0.34,
    pillars: [-0.45], doors: [0.35, -0.45, -1.3], wheel: RIM_ALLOY, slots: ['front', 'roof', 'side'], roofSlot: -0.5, glassRoof: [-0.1, -0.85], lampY: 0.76, tailLampY: 0.94,
    detail: function (c) {
      both(function (s) {
        c.F(0.46, 0.36, s * 0.25, 0.66, M.drl, 0.04); c.F(0.41, 0.31, s * 0.25, 0.66, M.dark, 0.06);
        c.F(0.42, 0.07, s * 0.72, 0.77, M.head);
        var d1 = bx(0.16, 0.02, 0.06, M.drl, s * 0.64, 0.79, c.fF(0.79) + 0.05); d1.rotation.z = s * 0.5; c.g.add(d1);
        var d2 = bx(0.16, 0.02, 0.06, M.drl, s * 0.8, 0.79, c.fF(0.79) + 0.05); d2.rotation.z = s * 0.5; c.g.add(d2);
        c.Rr(0.62, 0.05, s * 0.58, 0.94, M.tail); c.Rr(0.2, 0.07, s * 0.5, 0.34, M.chrome);
        c.g.add(bx(0.015, 0.02, 3.3, M.chrome, s * (c.Wg / 2 + 0.02), c.beltY(-0.5) + 0.02, -0.55));
      });
      c.F(1.4, 0.14, 0, 0.36, M.dark); c.Rr(1.4, 0.13, 0, 0.36, M.dark);
    } });
  /* 지브이팔공: large rear-drive-based SUV. Pentagonal crest grille, two-line lamps at the front and tail, long bonnet, roofline falling gently to the rear */
  mkCar('gv80', { mat: M.burgundy, gc: 0.2, fo: 0.86, r: 0.4, nose: 0.1, noseY: 1.02, hoodY: 1.16, cowlF: 1.0, roofF1: 0.3, roofF2: -1.75, roofY2: 1.62, rearBaseF: -2.3, deckY: 1.22, tailIn: 0.1, tailY: 1.14, cT: 0.42,
    pillars: [-0.4, -1.4], doors: [0.4, -0.45, -1.35], wheel: RIM_ALLOY, slots: ['front', 'roof', 'side'], roofSlot: -0.5, spoiler: true, lampY: 0.94, tailLampY: 1.06,
    detail: function (c) {
      c.F(1.0, 0.36, 0, 0.86, M.dark); c.F(1.04, 0.026, 0, 1.05, M.chrome, 0.06);
      both(function (s) {
        var v = bx(0.56, 0.026, 0.06, M.chrome, s * 0.26, 0.6, c.fF(0.6) + 0.05); v.rotation.z = s * 0.5; c.g.add(v);
        c.g.add(bx(0.026, 0.34, 0.06, M.chrome, s * 0.51, 0.87, c.fF(0.87) + 0.05));
        c.F(0.42, 0.024, s * 0.76, 0.98, M.drl, 0.06); c.F(0.42, 0.024, s * 0.76, 0.9, M.drl, 0.06);
        c.g.add(bx(0.012, 0.018, 0.34, M.drl, s * (c.W / 2 + 0.002), 0.96, c.ff - 0.66)); c.g.add(bx(0.012, 0.018, 0.34, M.drl, s * (c.W / 2 + 0.002), 0.89, c.ff - 0.66));
        c.Rr(0.6, 0.028, s * 0.62, 1.1, M.tail, 0.06); c.Rr(0.6, 0.028, s * 0.62, 1.02, M.tail, 0.06);
        c.g.add(bx(0.015, 0.02, 3.2, M.chrome, s * (c.Wg / 2 + 0.02), c.beltY(-0.5) + 0.02, -0.6));
      });
      c.F(1.4, 0.16, 0, 0.4, M.dark); c.Rr(1.5, 0.18, 0, 0.42, M.dark); c.Rr(0.9, 0.05, 0, 0.31, M.chrome);
    } });
  /* 타스만두: upright double-cab pickup. Slab front with a massive grille, small vertical lamps set into black wing flares, upright windscreen, C-shaped tail lamps, corner steps */
  mkCar('tasman', { mat: M.tan, gc: 0.25, fo: 0.9, r: 0.39, nose: 0.06, noseY: 1.14, hoodY: 1.24, cowlF: 1.5, roofF1: 1.0, roofF2: -0.45, roofY2: 1.84, rearBaseF: -0.6, deckY: 1.27, tailIn: 0, tailY: 1.3, bed: { floorY: 0.88, wallY: 1.3 }, clad: true, arch: 'trap', cT: 0.12, tumble: 0.22,
    pillars: [0.25], doors: [0.85, 0.2], wheel: RIM_DARK, slots: ['front', 'roof', 'rear', 'rear2'], rails: [0.7, -0.3], lampY: 1.0, tailLampY: 1.05,
    detail: function (c) {
      c.F(1.3, 0.5, 0, 0.92, M.dark); [0.78, 0.92, 1.06].forEach(function (y) { c.F(1.2, 0.035, 0, y, M.gloss, 0.06); });
      c.g.add(bx(1.5, 0.03, 0.22, M.gloss, 0, 1.25, c.fTip - 0.2));
      c.F(1.9, 0.26, 0, 0.5, M.dark, 0.1); c.F(0.9, 0.07, 0, 0.36, M.metal, 0.12);
      both(function (s) {
        c.g.add(bx(0.1, 0.22, 1.0, M.dark, s * (c.W / 2 + 0.01), 1.02, c.ff)); c.g.add(bx(0.1, 0.22, 1.0, M.dark, s * (c.W / 2 + 0.01), 1.02, c.fr));
        c.F(0.1, 0.26, s * 0.84, 1.0, M.head); c.F(0.03, 0.3, s * 0.93, 1.0, M.drl, 0.06);
        c.Rr(0.07, 0.3, s * 0.91, 1.05, M.tail); c.Rr(0.14, 0.04, s * 0.85, 1.19, M.tail); c.Rr(0.14, 0.04, s * 0.85, 0.91, M.tail);
        c.Rr(0.3, 0.1, s * 0.8, 0.52, M.dark, 0.16);
        c.g.add(bx(0.16, 0.05, 1.7, M.dark, s * (c.W / 2 + 0.04), c.gc + 0.04, 0.4));
      });
      c.Rr(1.3, 0.14, 0, 0.5, M.dark, 0.1);
    } });
  /* 피부이 택배: one-box electric cargo van. Black upper mask with thin running lamps, headlamps low in the bumper, blank cargo sides, twin rear doors */
  mkCar('pv5', { mat: M.parcel, plate: M.plateEV, gc: 0.18, fo: 0.82, r: 0.36, nose: 0.22, noseY: 1.0, hoodY: 1.16, cowlF: 1.82, roofF1: 0.95, roofF2: -2.28, roofY2: 1.89, rearBaseF: -2.32, deckY: 1.16, tailIn: 0.02, tailY: 1.2, clad: true, cT: 0.1, tumble: 0.14,
    pillars: [0.35], doors: [0.95, -0.1], wheel: RIM_STEEL, slots: ['front', 'roof', 'rear'], roofSlot: -0.4, rearSlot: [0, 1.91, -1.7], lampY: 0.5, tailLampY: 0.9,
    detail: function (c) {
      c.F(1.72, 0.14, 0, 1.06, M.gloss); c.F(1.82, 0.36, 0, 0.46, M.dark); c.F(1.1, 0.06, 0, 0.3, M.metal);
      both(function (s) {
        c.F(0.3, 0.03, s * 0.72, 1.06, M.drl, 0.07); c.F(0.03, 0.2, s * 0.9, 0.98, M.drl, 0.07); c.F(0.2, 0.1, s * 0.72, 0.5, M.head, 0.07);
        c.g.add(bx(0.03, 0.62, 2.55, c.B, s * (c.Wg / 2 + 0.012), 1.52, -1.0));
        c.Rr(0.07, 0.5, s * 0.9, 0.9, M.tail);
        c.g.add(bx(0.02, 0.03, 1.4, M.gloss, s * (c.W / 2 + 0.003), 1.08, -0.9));
      });
      c.g.add(bx(c.Wg - 0.2, 0.66, 0.03, c.B, 0, 1.52, -2.31));
      sideText(c, '전설 택배', '#ffffff', '#e8862a', 1.1, 0.32, 0.9, -0.4);
      c.Rr(0.02, 1.3, 0, 1.1, M.gloss); c.Rr(1.8, 0.26, 0, 0.42, M.dark);
    } });
  /* 구일일: low rear-engined coupe. Round lamps on raised wings, long sloping nose, roofline running straight down to the tail, wide rear haunches, full-width light strip */
  mkCar('p911', { mat: M.racing, gc: 0.12, fo: 1.0, r: 0.34, nose: 0.5, noseY: 0.62, hoodY: 0.86, cowlF: 0.75, roofF1: -0.1, roofF2: -0.6, roofY2: 1.26, rearBaseF: -1.95, deckY: 0.98, tailIn: 0.15, tailY: 0.9, cT: 0.5, tumble: 0.42,
    doors: [0.4, -0.55], wheel: RIM_DARK, slots: ['front', 'roof', 'rear'], roofSlot: -0.35, rearSlot: [0, 1.0, -1.85], lampY: 0.7, tailLampY: 0.88, tailBar: true,
    detail: function (c) {
      var i;
      c.F(1.5, 0.2, 0, 0.34, M.dark); c.F(0.5, 0.02, -0.5, 0.36, M.gloss, 0.07); c.F(0.5, 0.02, 0.5, 0.36, M.gloss, 0.07); c.F(0.5, 0.02, -0.5, 0.3, M.gloss, 0.07); c.F(0.5, 0.02, 0.5, 0.3, M.gloss, 0.07);
      both(function (s) {
        c.g.add(bx(0.4, 0.1, 1.0, c.B, s * 0.68, 0.74, 1.45));
        var lamp = cyl(0.15, 0.15, 0.1, 16, M.head, s * 0.68, 0.76, 1.98, 'z'); lamp.rotation.x = -0.9; c.g.add(lamp);
        [[-0.05, 0.05], [0.05, 0.05], [-0.05, -0.05], [0.05, -0.05]].forEach(function (p) { var d = bx(0.035, 0.035, 0.03, M.drl, s * 0.68 + p[0], 0.8 + p[1] * 0.5, 2.0 + p[1]); c.g.add(d); });
        c.g.add(bx(0.1, 0.3, 1.1, c.B, s * (c.W / 2 - 0.03), 0.7, c.fr));
        c.Rr(0.14, 0.08, s * 0.3, 0.3, M.chrome);
      });
      for (i = -3; i <= 3; i++) c.g.add(bx(0.03, 0.012, 0.36, M.gloss, i * 0.09, 1.02, -1.75));
      c.Rr(1.74, 0.04, 0, 0.88, M.tail); c.Rr(1.5, 0.2, 0, 0.36, M.dark);
    } });

  /* ---- v13: ten more ---- */
  /* 케이오: fastback sedan. Slim grille between zigzag running lamps at the corners, chrome strip along the window line, full-width tail lamp with dashed ends */
  mkCar('k5', { mat: M.wolfGrey, gc: 0.15, fo: 0.91, r: 0.34, nose: 0.16, noseY: 0.76, hoodY: 0.94, cowlF: 1.1, roofF1: 0.15, roofF2: -0.8, roofY2: 1.37, rearBaseF: -1.95, deckY: 1.04, tailIn: 0.1, tailY: 0.98, cT: 0.46,
    pillars: [-0.35], doors: [0.48, -0.36, -1.2], wheel: RIM_ALLOY, slots: ['front', 'roof'], roofSlot: -0.3, ducktail: true, lampY: 0.68, tailLampY: 0.95, tailBar: true,
    detail: function (c) {
      c.F(1.24, 0.13, 0, 0.67, M.dark); c.F(1.5, 0.2, 0, 0.42, M.dark); c.F(1.0, 0.04, 0, 0.3, M.metal);
      both(function (s) {
        c.F(0.035, 0.26, s * 0.86, 0.66, M.drl, 0.06); c.F(0.2, 0.03, s * 0.77, 0.78, M.drl, 0.06); c.F(0.12, 0.03, s * 0.8, 0.54, M.drl, 0.06); c.F(0.2, 0.07, s * 0.7, 0.68, M.head);
        c.Rr(0.035, 0.16, s * 0.85, 0.87, M.tail, 0.06); c.Rr(0.035, 0.07, s * 0.78, 0.86, M.tail, 0.06);
        c.g.add(bx(0.015, 0.02, 3.0, M.chrome, s * (c.Wg / 2 + 0.02), c.beltY(-0.5) + 0.02, -0.5));
      });
      c.Rr(1.7, 0.035, 0, 0.95, M.tail); c.Rr(1.4, 0.16, 0, 0.36, M.dark);
    } });
  /* 쏘나티네 N: low wide sedan. One light bar across the whole nose with the lamps hidden beneath it, wide low grille with a red line, H-shaped tail lamp, twin exhausts */
  mkCar('sonata', { mat: M.flame, gc: 0.15, fo: 0.93, r: 0.345, nose: 0.14, noseY: 0.76, hoodY: 0.95, cowlF: 1.08, roofF1: 0.18, roofF2: -0.85, roofY2: 1.38, rearBaseF: -1.88, deckY: 1.03, tailIn: 0.1, tailY: 0.98, cT: 0.44,
    pillars: [-0.35], doors: [0.48, -0.36, -1.2], wheel: RIM_DARK, slots: ['front', 'roof', 'rear'], roofSlot: -0.3, rearSlot: [0, 1.03, -2.1], ducktail: true, fin: -0.7, lampY: 0.62, tailLampY: 0.93, tailBar: true,
    detail: function (c) {
      c.F(1.72, 0.035, 0, 0.8, M.drl); c.F(1.5, 0.28, 0, 0.5, M.dark); c.F(1.3, 0.02, 0, 0.34, M.sosRed, 0.06);
      [0.44, 0.52, 0.6].forEach(function (y) { c.F(1.3, 0.012, 0, y, M.gloss, 0.06); });
      both(function (s) {
        c.F(0.2, 0.1, s * 0.74, 0.66, M.head); c.Rr(0.045, 0.2, s * 0.85, 0.9, M.tail, 0.06);
        c.Rr(0.16, 0.07, s * 0.52, 0.3, M.chrome); c.Rr(0.16, 0.07, s * 0.7, 0.3, M.chrome);
        c.g.add(bx(0.012, 0.03, 1.9, M.gloss, s * (c.W / 2 + 0.002), c.gc + 0.1, 0.1));
      });
      c.Rr(1.72, 0.04, 0, 0.93, M.tail); c.Rr(1.5, 0.18, 0, 0.36, M.dark);
    } });
  /* 무스탕: long bonnet, short deck, fastback. Blunt nose with a big hexagonal grille, three-bar lamps front and rear, twin white stripes nose to tail, four exhausts */
  mkCar('mustang', { mat: M.grabber, gc: 0.14, fo: 0.88, r: 0.36, nose: 0.12, noseY: 0.78, hoodY: 0.98, cowlF: 0.6, roofF1: -0.15, roofF2: -0.75, roofY2: 1.3, rearBaseF: -1.9, deckY: 1.02, tailIn: 0.08, tailY: 0.96, cT: 0.5, tumble: 0.36,
    doors: [0.3, -0.6], wheel: RIM_DARK, slots: ['front', 'roof', 'side'], roofSlot: -0.42, ducktail: true, lampY: 0.68, tailLampY: 0.9,
    detail: function (c) {
      var i;
      c.F(1.3, 0.24, 0, 0.6, M.dark); c.F(1.5, 0.13, 0, 0.34, M.dark); c.F(0.16, 0.07, 0, 0.6, M.chrome, 0.07);
      c.Rr(1.62, 0.26, 0, 0.9, M.gloss); c.Rr(1.4, 0.16, 0, 0.34, M.dark);
      both(function (s) {
        c.F(0.3, 0.08, s * 0.74, 0.7, M.head);
        for (i = 0; i < 3; i++) { c.F(0.03, 0.09, s * (0.64 + i * 0.07), 0.7, M.drl, 0.07); c.Rr(0.075, 0.2, s * (0.5 + i * 0.13), 0.9, M.tail, 0.07); }
        c.Rr(0.1, 0.08, s * 0.5, 0.3, M.chrome); c.Rr(0.1, 0.08, s * 0.64, 0.3, M.chrome);
        var hd = bx(0.17, 0.012, 1.7, M.carWhite, s * 0.15, 0.92, 1.44); hd.rotation.x = 0.118; c.g.add(hd);
        var rf = bx(0.17, 0.012, 0.6, M.carWhite, s * 0.15, 1.385, -0.45); rf.rotation.x = -0.173; c.g.add(rf);
        var dk = bx(0.17, 0.012, 0.4, M.carWhite, s * 0.15, 1.03, -2.1); dk.rotation.x = -0.14; c.g.add(dk);
        c.g.add(bx(0.1, 0.3, 1.0, c.B, s * (c.W / 2 - 0.03), 0.74, c.fr));
        c.g.add(bx(0.012, 0.14, 0.26, M.gloss, s * (c.W / 2 + 0.003), 0.62, c.ff - 0.62));
      });
      c.g.add(bx(0.5, 0.03, 0.5, M.gloss, 0, 0.98, 1.05));
    } });
  /* 이브 6: low crossover. Thin lamp band across the nose, roofline falling to a ducktail, one tail-lamp arc that runs over the tail and down onto the flanks */
  mkCar('ev6', { mat: M.yacht, plate: M.plateEV, gc: 0.17, fo: 0.845, r: 0.37, nose: 0.2, noseY: 0.86, hoodY: 1.0, cowlF: 1.2, roofF1: 0.35, roofF2: -1.05, roofY2: 1.47, rearBaseF: -1.98, deckY: 1.18, tailIn: 0.1, tailY: 1.1, clad: true, cT: 0.44,
    pillars: [-0.35], doors: [0.55, -0.35, -1.25], wheel: RIM_AERO, slots: ['front', 'roof', 'rear'], roofSlot: -0.2, rearSlot: [0, 1.34, -1.55], spoiler: true, spoilerMat: M.gloss, ducktail: true, lampY: 0.8, tailLampY: 1.08, tailBar: true,
    detail: function (c) {
      c.F(1.3, 0.06, 0, 0.85, M.gloss); c.F(1.4, 0.18, 0, 0.42, M.dark); c.F(1.0, 0.04, 0, 0.3, M.metal);
      both(function (s) {
        c.F(0.34, 0.1, s * 0.68, 0.8, M.head); c.F(0.36, 0.025, s * 0.68, 0.875, M.drl, 0.06); c.F(0.03, 0.1, s * 0.86, 0.8, M.drl, 0.06);
        var k = bx(0.012, 0.045, 0.62, M.tail, s * (c.W / 2 + 0.003), 0.98, c.rTip + 0.42); k.rotation.x = -0.38; c.g.add(k);
        c.g.add(bx(0.012, 0.03, 1.9, M.metal, s * (c.W / 2 + 0.003), c.gc + 0.2, 0.05));
      });
      c.Rr(1.78, 0.045, 0, 1.1, M.tail); c.Rr(1.3, 0.035, 0, 0.52, M.chrome); c.Rr(1.5, 0.2, 0, 0.38, M.dark);
    } });
  /* 아이고닉 6: streamliner. One curve from nose to tail, pixel lamps in a low nose, glass roof, pixel bar across a boat tail under a deck wing with its own row of pixels */
  mkCar('ioniq6', { mat: M.orchid, plate: M.plateEV, gc: 0.14, fo: 0.9, r: 0.355, nose: 0.3, noseY: 0.7, hoodY: 0.92, cowlF: 1.2, roofF1: 0.15, roofF2: -0.7, roofY2: 1.44, rearBaseF: -2.1, deckY: 1.04, tailIn: 0.14, tailY: 0.96, cT: 0.46,
    doors: [0.5, -0.38, -1.2], wheel: RIM_AERO, slots: ['front', 'roof'], roofSlot: -0.25, glassRoof: [0.05, -0.6], ducktail: true, lampY: 0.68, tailLampY: 0.92, tailBar: true,
    detail: function (c) {
      var i;
      c.F(1.5, 0.16, 0, 0.36, M.dark); c.Rr(1.62, 0.1, 0, 0.92, M.gloss); c.Rr(1.4, 0.2, 0, 0.38, M.dark);
      for (i = -3; i <= 3; i++) c.F(0.05, 0.05, i * 0.17, 0.36, M.drl, 0.07);
      for (i = 0; i < 14; i++) c.Rr(0.07, 0.05, -0.748 + i * 0.115, 0.92, M.tail, 0.07);
      both(function (s) {
        for (i = 0; i < 3; i++) { c.F(0.075, 0.075, s * (0.58 + i * 0.105), 0.68, M.head, 0.06); c.Rr(0.045, 0.045, s * 0.72, 0.3 + i * 0.07, M.tail, 0.07); }
        c.g.add(bx(0.05, 0.1, 0.1, M.gloss, s * 0.6, 1.1, -2.2));
      });
      c.g.add(bx(c.W * 0.8, 0.035, 0.24, M.gloss, 0, 1.16, -2.22));
      for (i = -5; i <= 5; i++) c.g.add(bx(0.06, 0.02, 0.02, M.tail, i * 0.1, 1.16, -2.345));
    } });
  /* 모델 쓰리고: smooth grille-less nose with slim lamps, black glass roof, C-shaped tail lamps set into the boot lid */
  mkCar('model3', { mat: M.carWhite, plate: M.plateEV, gc: 0.14, fo: 0.84, r: 0.345, nose: 0.28, noseY: 0.72, hoodY: 0.93, cowlF: 1.1, roofF1: 0.2, roofF2: -0.75, roofY2: 1.4, rearBaseF: -1.9, deckY: 1.06, tailIn: 0.1, tailY: 1.0, cT: 0.44,
    doors: [0.5, -0.36, -1.15], wheel: RIM_AERO, slots: ['front', 'roof', 'rear'], roofSlot: -0.25, rearSlot: [0, 1.06, -2.1], glassRoof: [0.12, -0.68], ducktail: true, lampY: 0.72, tailLampY: 0.96,
    detail: function (c) {
      c.F(1.2, 0.12, 0, 0.34, M.dark); c.Rr(1.3, 0.16, 0, 0.36, M.dark);
      both(function (s) {
        c.F(0.4, 0.045, s * 0.62, 0.73, M.head); c.F(0.36, 0.02, s * 0.64, 0.78, M.drl, 0.06);
        c.Rr(0.4, 0.035, s * 0.62, 1.0, M.tail, 0.06); c.Rr(0.4, 0.035, s * 0.62, 0.9, M.tail, 0.06); c.Rr(0.035, 0.135, s * 0.805, 0.95, M.tail, 0.06);
        c.g.add(bx(0.012, 0.03, 0.16, M.gloss, s * (c.W / 2 + 0.003), 0.86, -0.2)); c.g.add(bx(0.012, 0.03, 0.16, M.gloss, s * (c.W / 2 + 0.003), 0.88, -0.98));
      });
    } });
  /* 스포츠지: compact SUV. Black panel across the whole face with boomerang running lamps either side of the grille, blade tail lamps joined by a thin bar */
  mkCar('sportage', { mat: M.jungle, gc: 0.19, fo: 0.9, r: 0.355, nose: 0.1, noseY: 0.98, hoodY: 1.08, cowlF: 1.25, roofF1: 0.5, roofF2: -1.85, roofY2: 1.6, rearBaseF: -2.2, deckY: 1.16, tailIn: 0.06, tailY: 1.1, clad: true, cT: 0.34, tumble: 0.26,
    pillars: [-0.3, -1.25], doors: [0.5, -0.32, -1.25], wheel: RIM_ALLOY, slots: ['front', 'roof', 'rear'], roofSlot: -0.3, rearSlot: [0, 1.62, -1.45], rails: [0.35, -1.7], railMat: M.metal, spoiler: true, lampY: 0.84, tailLampY: 1.04, tailBar: true,
    detail: function (c) {
      c.F(1.62, 0.36, 0, 0.8, M.gloss); c.F(1.3, 0.14, 0, 0.4, M.dark); c.F(1.0, 0.06, 0, 0.3, M.metal);
      both(function (s) {
        c.F(0.035, 0.34, s * 0.58, 0.81, M.drl, 0.07); c.F(0.24, 0.035, s * 0.69, 0.965, M.drl, 0.07); c.F(0.14, 0.035, s * 0.64, 0.655, M.drl, 0.07); c.F(0.14, 0.2, s * 0.8, 0.8, M.head, 0.06);
        c.Rr(0.3, 0.1, s * 0.72, 1.0, M.tail); c.g.add(bx(0.02, 0.26, 0.14, M.chrome, s * (c.Wg / 2 + 0.02), 1.36, -1.25));
      });
      c.Rr(1.6, 0.03, 0, 1.08, M.tail); c.Rr(1.6, 0.24, 0, 0.44, M.dark); c.Rr(0.9, 0.06, 0, 0.31, M.metal);
    } });
  /* 투싼타: compact SUV. Grille whose outer cells light up as wing-shaped running lamps, creased flanks, tail bar with two fang lamps hanging from each end */
  mkCar('tucson', { mat: M.teal, gc: 0.19, fo: 0.91, r: 0.355, nose: 0.1, noseY: 1.0, hoodY: 1.1, cowlF: 1.24, roofF1: 0.5, roofF2: -1.8, roofY2: 1.58, rearBaseF: -2.18, deckY: 1.17, tailIn: 0.07, tailY: 1.1, clad: true, cT: 0.36, tumble: 0.26,
    pillars: [-0.3, -1.22], doors: [0.5, -0.32, -1.22], wheel: RIM_DARK, slots: ['front', 'roof', 'rear'], roofSlot: -0.3, rearSlot: [0, 1.6, -1.42], rails: [0.35, -1.65], railMat: M.metal, spoiler: true, lampY: 0.84, tailLampY: 1.06, tailBar: true,
    detail: function (c) {
      var i;
      c.F(1.56, 0.36, 0, 0.82, M.dark); c.F(1.2, 0.12, 0, 0.42, M.dark); c.F(1.0, 0.07, 0, 0.31, M.metal);
      both(function (s) {
        for (i = 0; i < 4; i++) c.F(0.1, 0.075, s * (0.4 + i * 0.12), 0.92 - i * 0.012, M.drl, 0.07);
        for (i = 0; i < 3; i++) c.F(0.1, 0.075, s * (0.46 + i * 0.12), 0.82, M.drl, 0.07);
        c.F(0.16, 0.13, s * 0.82, 0.64, M.head, 0.06);
        c.Rr(0.05, 0.2, s * 0.6, 0.99, M.tail, 0.07); c.Rr(0.05, 0.2, s * 0.74, 0.99, M.tail, 0.07);
        var k = bx(0.012, 0.02, 1.5, M.gloss, s * (c.W / 2 + 0.002), 0.86, -0.2); k.rotation.x = 0.1; c.g.add(k);
      });
      c.Rr(1.62, 0.035, 0, 1.1, M.tail); c.Rr(1.6, 0.26, 0, 0.44, M.dark); c.Rr(1.0, 0.07, 0, 0.32, M.metal);
    } });
  /* 지브이칠공: sporty luxury SUV. Crest grille and two-line lamps on a long bonnet, arched chrome window line, roof falling to a short tail, two-line tail lamps, oval exhausts */
  mkCar('gv70', { mat: M.copper, gc: 0.19, fo: 0.82, r: 0.38, nose: 0.1, noseY: 0.98, hoodY: 1.1, cowlF: 0.95, roofF1: 0.2, roofF2: -1.35, roofY2: 1.5, rearBaseF: -2.1, deckY: 1.18, tailIn: 0.12, tailY: 1.1, cT: 0.46,
    pillars: [-0.45], doors: [0.38, -0.45, -1.3], wheel: RIM_ALLOY, slots: ['front', 'roof', 'side'], roofSlot: -0.45, spoiler: true, lampY: 0.9, tailLampY: 1.02,
    detail: function (c) {
      c.F(0.92, 0.34, 0, 0.82, M.dark); c.F(0.96, 0.024, 0, 1.0, M.chrome, 0.06);
      both(function (s) {
        var v = bx(0.52, 0.024, 0.06, M.chrome, s * 0.24, 0.58, c.fF(0.58) + 0.05); v.rotation.z = s * 0.5; c.g.add(v);
        c.g.add(bx(0.024, 0.3, 0.06, M.chrome, s * 0.47, 0.83, c.fF(0.83) + 0.05));
        c.F(0.4, 0.022, s * 0.72, 0.94, M.drl, 0.06); c.F(0.4, 0.022, s * 0.72, 0.87, M.drl, 0.06);
        c.g.add(bx(0.012, 0.018, 0.3, M.drl, s * (c.W / 2 + 0.002), 0.93, c.ff - 0.62)); c.g.add(bx(0.012, 0.018, 0.3, M.drl, s * (c.W / 2 + 0.002), 0.87, c.ff - 0.62));
        c.Rr(0.56, 0.026, s * 0.6, 1.06, M.tail, 0.06); c.Rr(0.56, 0.026, s * 0.6, 0.98, M.tail, 0.06);
        c.Rr(0.22, 0.1, s * 0.56, 0.36, M.chrome, 0.06);
        var a = bx(0.015, 0.02, 2.5, M.chrome, s * (c.Wg / 2 + 0.02), c.beltY(-0.5) + 0.02, -0.55); c.g.add(a);
        var b = bx(0.015, 0.02, 0.62, M.chrome, s * (c.Wg / 2 + 0.02), 1.33, -1.78); b.rotation.x = -0.46; c.g.add(b);
      });
      c.F(1.4, 0.15, 0, 0.4, M.dark); c.Rr(1.5, 0.2, 0, 0.42, M.dark);
    } });
  /* 카니발레: large minivan. Wide patterned grille running into the lamps, sliding-door rails, full-width tail lamp; roof box and a rolled awning for car camping */
  mkCar('carni', { mat: M.graphite, gc: 0.17, fo: 0.94, r: 0.37, nose: 0.1, noseY: 1.0, hoodY: 1.12, cowlF: 1.55, roofF1: 0.8, roofF2: -2.3, roofY2: 1.75, rearBaseF: -2.5, deckY: 1.15, tailIn: 0.05, tailY: 1.12, clad: true, cT: 0.2, tumble: 0.26,
    pillars: [-0.2, -1.42], doors: [0.75, -0.25, -1.5], wheel: RIM_DARK, slots: ['front', 'roof', 'side'], roofSlot: 0.35, rails: [0.5, -2.1], railMat: M.metal, spoiler: true, lampY: 0.86, tailLampY: 1.05, tailBar: true,
    detail: function (c) {
      var i;
      c.F(1.74, 0.28, 0, 0.84, M.gloss); c.F(1.4, 0.16, 0, 0.42, M.dark); c.F(1.1, 0.07, 0, 0.3, M.metal);
      for (i = -5; i <= 5; i++) { c.F(0.05, 0.05, i * 0.105, 0.88, M.chrome, 0.07); c.F(0.05, 0.05, i * 0.105 + 0.05, 0.79, M.chrome, 0.07); }
      both(function (s) {
        c.F(0.24, 0.12, s * 0.8, 0.87, M.head, 0.07); c.F(0.3, 0.03, s * 0.78, 0.965, M.drl, 0.07);
        c.Rr(0.09, 0.3, s * 0.9, 1.0, M.tail);
        c.g.add(bx(0.02, 0.36, 0.2, M.chrome, s * (c.Wg / 2 + 0.02), 1.46, -1.42));
        c.g.add(bx(0.02, 0.03, 1.2, M.gloss, s * (c.W / 2 + 0.003), 1.1, -1.7));
      });
      c.Rr(1.8, 0.05, 0, 1.05, M.tail); c.Rr(1.5, 0.025, 0, 0.98, M.chrome); c.Rr(1.6, 0.2, 0, 0.42, M.dark);
      [-0.35, -1.85].forEach(function (f) { c.g.add(bx(c.Wg - 0.1, 0.04, 0.07, M.metal, 0, c.roofY(f) + 0.09, f)); });
      var box = bx(0.92, 0.3, 1.9, M.gloss, 0, c.roofY(-1.1) + 0.27, -1.1); c.g.add(box);
      c.g.add(bx(0.8, 0.1, 0.5, M.gloss, 0, c.roofY(-0.1) + 0.2, -0.1));
      c.g.add(cyl(0.07, 0.07, 2.3, 8, M.carWhite, c.Wg / 2 + 0.03, c.roofY(-0.9) + 0.03, -0.9, 'z'));
    } });

  /* ---- v14: kei cars ---- */
  /* 모닝콜: low kei hatch. Slim grille between vertical running lamps at the corners, big lower intake, full-width tail lamp with vertical ends */
  mkCar('morning', { mat: M.advGreen, gc: 0.15, fo: 0.7, r: 0.28, nose: 0.14, noseY: 0.78, hoodY: 0.92, cowlF: 1.0, roofF1: 0.42, roofF2: -1.3, roofY2: 1.44, rearBaseF: -1.62, deckY: 1.02, tailIn: 0.05, tailY: 0.98, cT: 0.2, tumble: 0.18,
    pillars: [-0.15], doors: [0.25, -0.62], wheel: RIM_ALLOY, slots: ['front', 'roof'], spoiler: true, lampY: 0.72, tailLampY: 0.95, tailBar: true,
    detail: function (c) {
      c.F(0.9, 0.07, 0, 0.8, M.gloss); c.F(1.1, 0.22, 0, 0.42, M.dark); c.F(0.7, 0.04, 0, 0.29, M.metal);
      both(function (s) {
        c.F(0.035, 0.24, s * 0.7, 0.72, M.drl, 0.06); c.F(0.14, 0.14, s * 0.58, 0.74, M.head);
        c.Rr(0.04, 0.22, s * 0.68, 0.87, M.tail, 0.06);
      });
      c.Rr(1.3, 0.035, 0, 0.95, M.tail); c.Rr(1.1, 0.16, 0, 0.36, M.dark);
    } });
  /* 스파클: low kei hatch with a sloping nose. Two-part grille split by a chrome bar, swept-back lamps, rear door handles hidden in the pillar, tall tail lamps */
  mkCar('spark', { mat: M.carib, gc: 0.15, fo: 0.69, r: 0.28, nose: 0.2, noseY: 0.74, hoodY: 0.9, cowlF: 0.98, roofF1: 0.38, roofF2: -1.25, roofY2: 1.43, rearBaseF: -1.6, deckY: 1.04, tailIn: 0.06, tailY: 1.0, cT: 0.26, tumble: 0.2,
    pillars: [-0.15], doors: [0.25, -0.6], wheel: RIM_ALLOY, slots: ['front', 'roof'], spoiler: true, lampY: 0.74, tailLampY: 0.96,
    detail: function (c) {
      c.F(0.8, 0.08, 0, 0.7, M.dark); c.F(0.84, 0.02, 0, 0.64, M.chrome, 0.06); c.F(1.0, 0.22, 0, 0.44, M.dark); c.F(0.16, 0.05, 0, 0.64, M.polYellow, 0.07);
      both(function (s) {
        c.F(0.3, 0.1, s * 0.56, 0.76, M.head); c.F(0.2, 0.025, s * 0.58, 0.69, M.drl, 0.06); c.F(0.08, 0.08, s * 0.62, 0.42, M.drl, 0.06);
        c.Rr(0.18, 0.24, s * 0.62, 0.96, M.tail);
        c.g.add(bx(0.012, 0.1, 0.14, M.gloss, s * (c.Wg / 2 + 0.03), 1.2, -1.02));
      });
      c.Rr(1.0, 0.14, 0, 0.36, M.dark);
    } });
  /* 캐스터 터보: upright kei SUV. Round lamps and two round intakes set into a wide grille, separate turn lamps above, roof rails, round tail lamps */
  mkCar('caspert', { mat: M.butter, gc: 0.17, fo: 0.64, r: 0.29, nose: 0.1, noseY: 0.92, hoodY: 1.02, cowlF: 1.05, roofF1: 0.48, roofF2: -1.42, roofY2: 1.55, rearBaseF: -1.62, deckY: 1.05, tailIn: 0.05, tailY: 1.02, clad: true, cT: 0.22, tumble: 0.16,
    pillars: [-0.1], doors: [0.2, -0.62], wheel: RIM_ALLOY, slots: ['front', 'roof'], rails: [0.25, -1.25], lampY: 0.64, tailLampY: 0.72,
    detail: function (c) {
      var i;
      c.F(1.24, 0.3, 0, 0.62, M.dark); c.F(1.0, 0.12, 0, 0.36, M.dark); c.F(0.7, 0.05, 0, 0.28, M.metal);
      both(function (s) {
        var ring = cyl(0.115, 0.115, 0.03, 16, M.drl, s * 0.46, 0.64, c.fF(0.64) + 0.05, 'z'); ring.castShadow = false; c.g.add(ring);
        c.g.add(cyl(0.075, 0.075, 0.035, 16, M.head, s * 0.46, 0.64, c.fF(0.64) + 0.055, 'z'));
        c.g.add(cyl(0.06, 0.06, 0.03, 12, M.gloss, s * 0.2, 0.6, c.fF(0.6) + 0.05, 'z'));
        c.F(0.26, 0.045, s * 0.44, 0.9, M.amber, 0.06);
        c.Rr(0.15, 0.15, s * 0.5, 0.72, M.tail); c.Rr(0.09, 0.09, s * 0.5, 0.72, M.tailHot, 0.06);
        for (i = 0; i < 3; i++) c.Rr(0.05, 0.05, s * (0.34 + i * 0.075), 0.98, M.tail, 0.06);
      });
      c.Rr(1.1, 0.18, 0, 0.4, M.dark);
    } });
  /* 레이저 EV: the kei box with a closed nose. Charge door in the middle of the nose, aero wheels, blue plate */
  mkCar('rayev', { mat: M.smokeBlue, plate: M.plateEV, gc: 0.16, fo: 0.62, r: 0.277, nose: 0.08, noseY: 0.95, hoodY: 1.05, cowlF: 1.25, roofF1: 0.72, roofF2: -1.62, roofY2: 1.69, rearBaseF: -1.74, deckY: 1.05, tailIn: 0.03, tailY: 1.05, tumble: 0.14, cT: 0.16,
    pillars: [0.15, -0.85], doors: [0.2, -0.82], wheel: RIM_AERO, slots: ['front', 'roof'], lampY: 0.78, tailLampY: 1.0,
    detail: function (c) {
      c.F(1.02, 0.1, 0, 0.8, M.gloss); c.F(0.3, 0.2, 0, 0.6, M.gloss, 0.04); c.F(0.24, 0.14, 0, 0.6, c.B, 0.06); c.F(0.9, 0.1, 0, 0.38, M.dark); c.F(0.8, 0.05, 0, 0.3, M.metal);
      both(function (s) {
        c.F(0.13, 0.4, s * 0.66, 0.76, M.head); c.F(0.22, 0.04, s * 0.5, 0.95, M.drl);
        c.Rr(0.09, 0.5, s * 0.7, 1.0, M.tail); c.Rr(0.17, 0.05, s * 0.62, 1.22, M.tail); c.Rr(0.17, 0.05, s * 0.62, 0.78, M.tail);
      });
      c.Rr(1.2, 0.045, 0, 0.88, M.gloss); c.Rr(1.3, 0.14, 0, 0.36, M.dark); c.Rr(0.4, 0.03, 0, 0.62, M.plateEV, 0.06);
      c.g.add(bx(0.02, 0.03, 1.0, M.gloss, c.W / 2 + 0.003, 1.0, -1.15));
    } });

  (function () { /* 사이다트럭: unpainted stainless wedge. Apex over the front seats, full-width light bars front and rear, trapezoid black arches, one large wiper, tonneau cover */
    var g = new T.Group(), w = [], B = M.steel;
    g.add(prof([[-2.84, 0.5], [2.78, 0.5], [2.84, 0.98], [2.7, 1.08], [0.55, 1.79], [-2.84, 1.42]], 2.03, B, 0.02));
    g.add(pane(1.8, 2.3, 1.22, 0.7, 1.75, M.glass, 0.03));
    g.add(pane(1.6, 0.42, 1.775, -0.7, 1.655, M.glass, 0.03));
    g.add(pane(1.84, -0.82, 1.64, -2.76, 1.43, M.dark, 0.03));
    g.add(prof([[-0.75, 1.42], [1.75, 1.3], [0.6, 1.72], [-0.75, 1.62]], 2.06, M.glass, 0));
    var wiper = bx(0.04, 0.03, 1.1, M.gloss, -0.25, 1.52, 1.5); wiper.rotation.x = Math.atan2(0.53, 1.6); wiper.rotation.z = 0.5; g.add(wiper);
    g.add(bx(1.96, 0.3, 0.1, M.dark, 0, 0.64, 2.8)); g.add(bx(1.96, 0.3, 0.1, M.dark, 0, 0.64, -2.82));
    g.add(bx(1.9, 0.05, 0.05, M.drl, 0, 1.03, 2.83)); g.add(bx(1.9, 0.07, 0.05, M.tail, 0, 1.33, -2.86));
    g.add(bx(0.5, 0.11, 0.03, M.plateEV, 0, 0.72, -2.88));
    both(function (s) {
      g.add(bx(0.2, 0.12, 0.14, M.dark, s * 1.1, 1.36, 1.5)); g.add(bx(0.24, 0.07, 0.05, M.head, s * 0.72, 0.8, 2.86));
      [1.835, -1.8].forEach(function (f) { g.add(archDisc(0.62, s * 1.023, 0.44, f, true)); });
      [1.835, -1.8].forEach(function (f) { g.add(wheel2(0.44, 0.36, s * 0.88, f, w, RIM_DARK)); });
    });
    CARS.cyber.anchors = { front: [0, 0.62, 2.92], side: [1.1, 1.0, 0.25] };
    finishCar('cyber', g, w, { head: [[-0.8, 1.03, 2.83], [0.8, 1.03, 2.83]], tail: [[-0.75, 1.33, -2.86, 1.8], [0.75, 1.33, -2.86, 1.8], [0, 1.33, -2.86, 1.8]] });
  })();
  (function () { /* 포터블: cab-over one-ton truck. Rounded lamps in black bezels, small grille, super-cab quarter window, drop-side bed, small twin rear wheels */
    var g = new T.Group(), w = [], B = M.blue;
    g.add(bx(1.5, 0.3, 5.0, M.dark, 0, 0.55, 0));
    g.add(prof([[0.55, 0.45], [2.5, 0.45], [2.56, 0.8], [2.52, 1.2], [0.55, 1.2]], 1.74, B, 0.05));
    g.add(prof([[0.55, 1.2], [2.52, 1.2], [2.18, 1.93], [0.55, 1.95]], 1.66, B, 0.03));
    g.add(pane(1.5, 2.5, 1.24, 2.2, 1.88, M.glass));
    g.add(prof([[1.15, 1.25], [2.34, 1.25], [2.1, 1.82], [1.15, 1.82]], 1.69, M.glass, 0));
    g.add(prof([[0.66, 1.3], [0.98, 1.3], [0.98, 1.78], [0.66, 1.78]], 1.69, M.glass, 0));
    g.add(bx(1.0, 0.4, 0.04, M.glass, 0, 1.6, 0.54));
    g.add(bx(0.6, 0.1, 0.05, M.dark, 0, 0.82, 2.56)); g.add(bx(1.76, 0.2, 0.12, M.dark, 0, 0.5, 2.54)); g.add(bx(0.5, 0.11, 0.03, M.plate, 0, 0.6, 2.6));
    both(function (s) {
      g.add(bx(0.4, 0.26, 0.04, M.gloss, s * 0.6, 0.82, 2.555)); g.add(bx(0.3, 0.18, 0.05, M.head, s * 0.6, 0.82, 2.57));
      g.add(bx(0.3, 0.05, 0.05, M.dark, s * 0.95, 1.45, 2.3)); g.add(bx(0.08, 0.34, 0.14, M.dark, s * 1.08, 1.45, 2.3));
      g.add(bx(0.06, 0.4, 3.0, B, s * 0.84, 1.1, -1.0));
      [0.0, -1.0, -2.0].forEach(function (f) { g.add(bx(0.07, 0.42, 0.06, M.metal, s * 0.86, 1.1, f)); });
      g.add(bx(0.22, 0.12, 0.05, M.tail, s * 0.7, 0.72, -2.52)); g.add(bx(0.02, 0.6, 0.025, M.gloss, s * 0.872, 0.85, 1.3));
      g.add(wheel2(0.327, 0.22, s * 0.74, 1.75, w, RIM_STEEL));
      g.add(wheel2(0.284, 0.16, s * 0.78, -1.06, w, RIM_STEEL)); g.add(wheel2(0.284, 0.16, s * 0.6, -1.06, w, RIM_STEEL));
    });
    g.add(bx(1.74, 0.1, 3.0, B, 0, 0.85, -1.0)); g.add(bx(1.74, 0.4, 0.06, B, 0, 1.1, -2.5)); g.add(bx(1.6, 0.6, 0.06, M.dark, 0, 1.5, 0.48));
    g.add(bx(0.5, 0.11, 0.03, M.plate, 0, 0.72, -2.55));
    CARS.porter.anchors = { front: [0, 0.52, 2.66], roof: [0, 1.95, 1.4], rear: [-0.42, 0.92, -0.9], rear2: [0.42, 0.92, -0.9] };
    finishCar('porter', g, w, { head: [[-0.6, 0.82, 2.56], [0.6, 0.82, 2.56]], tail: [[-0.7, 0.72, -2.52], [0.7, 0.72, -2.52]] });
  })();
  (function () { /* 번개렉카: medium cab-over truck with a flat deck, slanted boom and under-lift; amber light bar */
    var g = new T.Group(), w = [], B = M.towYellow;
    g.add(bx(1.9, 0.4, 6.4, M.dark, 0, 0.66, 0));
    g.add(prof([[1.45, 0.52], [3.3, 0.52], [3.36, 0.95], [3.3, 1.35], [1.45, 1.35]], 2.18, B, 0.05));
    g.add(prof([[1.45, 1.35], [3.3, 1.35], [2.95, 2.3], [1.45, 2.34]], 2.08, B, 0.03));
    g.add(pane(1.9, 3.27, 1.39, 2.98, 2.24, M.glass));
    g.add(prof([[1.65, 1.42], [3.1, 1.42], [2.85, 2.2], [1.65, 2.2]], 2.11, M.glass, 0));
    g.add(bx(2.19, 0.12, 1.8, M.gloss, 0, 1.1, 2.38)); g.add(bx(1.5, 0.3, 0.05, M.chrome, 0, 1.0, 3.36)); g.add(bx(1.9, 0.24, 0.14, M.dark, 0, 0.58, 3.34));
    g.add(bx(1.3, 0.14, 0.3, M.sign, 0, 2.42, 2.2)); g.add(bx(0.5, 0.11, 0.03, M.plate, 0, 0.62, 3.42));
    g.add(bx(2.18, 0.3, 4.5, B, 0, 1.02, -1.05)); g.add(bx(2.2, 0.5, 1.2, M.gloss, 0, 0.7, 0.4)); g.add(bx(2.0, 0.04, 4.3, M.metal, 0, 1.19, -1.05));
    [-0.45, 0.45].forEach(function (x) { var b = bx(0.16, 0.16, 3.2, M.gloss, x, 2.0, -1.9); b.rotation.x = -0.42; g.add(b); });
    g.add(bx(1.1, 0.14, 0.14, M.gloss, 0, 2.66, -3.35)); g.add(cyl(0.08, 0.08, 0.9, 6, M.metal, 0, 2.2, -3.35)); g.add(bx(0.5, 0.3, 0.5, M.gun, 0, 1.36, -0.2));
    g.add(bx(0.16, 0.12, 1.3, M.gloss, 0, 0.5, -3.8)); g.add(bx(1.5, 0.1, 0.14, M.gloss, 0, 0.5, -4.4));
    both(function (s) {
      g.add(bx(0.34, 0.2, 0.05, M.head, s * 0.76, 0.95, 3.37)); g.add(bx(0.3, 0.14, 0.05, M.tail, s * 0.85, 0.98, -3.31)); g.add(bx(0.08, 0.36, 0.14, M.dark, s * 1.27, 1.75, 3.0));
      g.add(bx(0.02, 0.7, 0.025, M.gloss, s * 1.092, 0.95, 2.2)); g.add(bx(0.5, 0.4, 1.0, B, s * 0.85, 0.72, -1.2));
      g.add(wheel2(0.376, 0.26, s * 0.92, 2.25, w, RIM_TRUCK));
      g.add(wheel2(0.376, 0.2, s * 0.96, -1.6, w, RIM_TRUCK)); g.add(wheel2(0.376, 0.2, s * 0.74, -1.6, w, RIM_TRUCK));
    });
    CARS.tow.anchors = { front: [0, 0.58, 3.44], roof: [0, 2.36, 1.75], rear: [0, 1.22, 0.9] };
    finishCar('tow', g, w, { head: [[-0.76, 0.95, 3.37], [0.76, 0.95, 3.37]], tail: [[-0.85, 0.98, -3.31], [0.85, 0.98, -3.31]] });
  })();
  (function () { /* 불끄미: double-cab pumper. Red body with a white reflective band, shutter lockers, roof ladder and hose reel, red light bar, 119 lettering */
    var g = new T.Group(), w = [], B = M.fireRed, i, m119 = textMat('119', '#ffffff', '#e01f1f', 128, 64);
    g.add(bx(2.1, 0.5, 7.4, M.dark, 0, 0.7, 0));
    g.add(prof([[1.3, 0.62], [3.8, 0.62], [3.835, 1.5], [1.3, 1.5]], 2.42, B, 0.05));
    g.add(prof([[1.3, 1.5], [3.83, 1.5], [3.62, 2.72], [1.3, 2.72]], 2.36, B, 0.03));
    g.add(pane(2.05, 3.8, 1.56, 3.64, 2.62, M.glass));
    g.add(prof([[2.75, 1.6], [3.52, 1.6], [3.42, 2.42], [2.75, 2.42]], 2.39, M.glass, 0)); g.add(prof([[1.55, 1.6], [2.5, 1.6], [2.5, 2.42], [1.55, 2.42]], 2.39, M.glass, 0));
    g.add(bx(2.42, 1.9, 5.0, B, 0, 1.62, -1.3)); g.add(bx(2.44, 0.2, 7.5, M.white, 0, 1.22, 0));
    [-0.3, -2.1].forEach(function (f) { g.add(bx(2.45, 0.95, 1.55, M.metal, 0, 1.95, f)); });
    g.add(bx(2.3, 0.6, 0.06, M.gloss, 0, 1.75, -3.82));
    [-0.4, 0.4].forEach(function (x) { g.add(bx(0.08, 0.12, 4.6, M.metal, x, 2.68, -1.4)); });
    for (i = 0; i < 9; i++) g.add(bx(0.8, 0.06, 0.06, M.metal, 0, 2.68, 0.7 - i * 0.52));
    g.add(cyl(0.4, 0.4, 0.5, 12, M.fireRed, 0.7, 2.8, -3.2, 'x'));
    g.add(bx(1.5, 0.18, 0.32, M.tail, 0, 2.83, 2.9)); g.add(bx(0.3, 0.19, 0.33, M.white, 0, 2.83, 2.9));
    g.add(bx(1.5, 0.5, 0.05, M.gloss, 0, 1.2, 3.84)); g.add(bx(2.3, 0.32, 0.16, M.metal, 0, 0.74, 3.84)); g.add(bx(0.5, 0.11, 0.03, M.plate, 0, 0.74, 3.93));
    g.add(bx(0.9, 0.42, 0.03, m119, 0, 2.3, -3.83));
    both(function (s) {
      g.add(bx(0.4, 0.22, 0.05, M.head, s * 0.88, 1.05, 3.85)); g.add(bx(0.3, 0.2, 0.05, M.tail, s * 1.0, 1.12, -3.82)); g.add(bx(0.08, 0.44, 0.16, M.dark, s * 1.4, 2.0, 3.5));
      [3.05, 1.98].forEach(function (f) { g.add(bx(0.02, 0.8, 0.025, M.gloss, s * 1.212, 1.05, f)); });
      g.add(bx(0.03, 0.4, 0.8, m119, s * 1.222, 0.98, 2.5));
      g.add(wheel2(0.42, 0.3, s * 1.02, 2.75, w, RIM_TRUCK));
      g.add(wheel2(0.42, 0.24, s * 1.06, -1.55, w, RIM_TRUCK)); g.add(wheel2(0.42, 0.24, s * 0.8, -1.55, w, RIM_TRUCK));
    });
    CARS.fire.anchors = { front: [0, 2.74, 3.1], roof: [0, 2.6, -3.25], side: [1.25, 1.3, 0.3] };
    finishCar('fire', g, w, { head: [[-0.88, 1.05, 3.85], [0.88, 1.05, 3.85]], tail: [[-1.0, 1.12, -3.82], [1.0, 1.12, -3.82]] });
  })();
  (function () { /* 만원버스: eleven-metre low-floor electric city bus. Full-height windscreen under a destination sign, split lamps, two kerb-side doors, long window band, roof battery fairing, four tail lamps */
    var g = new T.Group(), w = [], B = M.busGreen, sign = textMat('100 마성타워', '#ffb21a', '#101114', 512, 96), sd;
    g.add(bx(2.3, 0.4, 10.2, M.dark, 0, 0.5, 0));
    g.add(prof([[-5.49, 0.36], [5.44, 0.36], [5.5, 1.0], [5.5, 1.35], [-5.49, 1.35]], 2.49, B, 0.05));
    g.add(prof([[-5.49, 1.35], [5.5, 1.35], [5.4, 3.06], [-5.49, 3.06]], 2.43, B, 0.05));
    g.add(prof([[-5.2, 1.5], [4.5, 1.5], [4.5, 2.62], [-5.2, 2.62]], 2.46, M.glass, 0));
    [3.0, 1.35, -0.3, -1.95, -3.6].forEach(function (f) { g.add(bx(2.49, 1.14, 0.12, M.gloss, 0, 2.06, f)); });
    g.add(bx(2.5, 0.14, 10.9, M.white, 0, 1.3, 0));
    g.add(bx(2.2, 1.7, 0.05, M.glass, 0, 1.92, 5.56)); g.add(bx(1.9, 0.3, 0.05, sign, 0, 2.86, 5.52)); g.add(bx(2.0, 0.9, 0.05, M.glass, 0, 2.3, -5.56));
    g.add(bx(1.9, 0.34, 5.6, M.white, 0, 3.22, 1.0)); g.add(bx(1.5, 0.26, 1.8, M.metal, 0, 3.18, -3.6));
    g.add(bx(0.5, 0.11, 0.03, M.plateEV, 0, 0.7, 5.58)); g.add(bx(0.5, 0.11, 0.03, M.plateEV, 0, 0.9, -5.57));
    [3.9, -0.6].forEach(function (f) { g.add(bx(0.03, 1.95, 1.2, M.gloss, 1.25, 1.55, f)); g.add(bx(0.03, 1.5, 1.0, M.glass, 1.262, 1.7, f)); g.add(bx(0.04, 1.95, 0.04, B, 1.27, 1.55, f)); });
    for (sd = -1; sd <= 1; sd += 2) {
      g.add(bx(0.4, 0.06, 0.05, M.drl, sd * 0.9, 1.08, 5.57)); g.add(bx(0.34, 0.16, 0.05, M.head, sd * 0.9, 0.82, 5.57));
      g.add(bx(0.14, 0.14, 0.05, M.tail, sd * 1.0, 1.1, -5.56)); g.add(bx(0.14, 0.14, 0.05, M.tail, sd * 1.0, 0.86, -5.56));
      g.add(bx(0.08, 0.5, 0.2, M.dark, sd * 1.42, 2.3, 5.25));
      g.add(archDisc(0.6, sd * 1.253, 0.478, 2.9)); g.add(archDisc(0.6, sd * 1.253, 0.478, -2.5));
      g.add(wheel2(0.478, 0.3, sd * 1.08, 2.9, w, RIM_TRUCK)); g.add(wheel2(0.478, 0.3, sd * 1.08, -2.5, w, RIM_TRUCK));
    }
    CARS.bus.anchors = { front: [0, 0.6, 5.56], roof: [0, 3.4, 3.3], side: [1.3, 1.1, 1.0], rear: [0, 3.08, -4.9] };
    finishCar('bus', g, w, { head: [[-0.9, 0.82, 5.52], [0.9, 0.82, 5.52]], tail: [[-1.0, 1.0, -5.52], [1.0, 1.0, -5.52]] });
  })();
  CARS.cyber.seatF = 0.55; CARS.cyber.hoodLen = 1.6; CARS.cyber.paint = M.steel;
  CARS.porter.seatF = CARS.porter.hl - 1.25; CARS.tow.seatF = CARS.tow.hl - 1.4; CARS.fire.seatF = CARS.fire.hl - 1.5; CARS.bus.seatF = CARS.bus.hl - 1.5;
  ['porter', 'tow', 'fire', 'bus'].forEach(function (k) { CARS[k].hoodLen = 0; CARS[k].paint = M.dark; });

