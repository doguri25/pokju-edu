  /* ---------- flow ---------- */
  var aimed = true, menuTab = 'car', steerWant = null, humpT = 0, gearT = 0, susp = { f: 0, vf: 0, r: 0, vr: 0, ro: 0, vro: 0, q: [] }, picks = 0, hunts = 0, huntT = 0, stepT = 0, stepDir = 0, burstT = 0, hornT = 0, padBasic = false, nextCargoD = 0, rushLimit = 0, hitGlowK = 0, helpThen = null, touchUI = false;
  function clearAll() {
    var i;
    clearRivals(); smokeT = 0; jamT = 0; chaseT = rnd(7, 11); susp.f = susp.vf = susp.r = susp.vr = susp.ro = susp.vro = 0; susp.q.length = 0; farmT = 4; zoneNow = ''; zoneSeen = ''; humpT = 0; picks = 0; hunts = 0; huntT = 3; dmgLog = {}; stepT = 0; burstT = 0; hornT = 0; dmgReset(); nextCargoD = dist + 70; gearT = 1;
    for (i = enemies.length - 1; i >= 0; i--) releaseEnemy(i);
    for (i = 0; i < bullets.length; i++) { bullets[i].m.visible = false; bpool.push(bullets[i]); } bullets.length = 0;
    clearEnemyBullets();
    for (i = 0; i < missiles.length; i++) { missiles[i].g.visible = false; mpool.push(missiles[i]); } missiles.length = 0;
    for (i = 0; i < mines.length; i++) { mines[i].g.visible = false; minePool.push(mines[i]); } mines.length = 0;
    for (i = 0; i < bombs.length; i++) { bombs[i].g.visible = false; bombPool.push(bombs[i]); } bombs.length = 0;
    for (i = 0; i < scraps.length; i++) { scraps[i].m.visible = false; spool.push(scraps[i]); } scraps.length = 0;
    if (crate.g) crate.g.visible = false;
    crate.active = false; trackM = null;
    boss = null; plane.visible = false; bannerT = 0; $('banner').hidden = true; $('caption').hidden = true; capHold = 0; capSeen = {};
    spawnT = 0.3; nextRowDist = dist + 20; droneT = 3; strikeT = 4.5; salvoN = 0; maxX = 9.9; minX = -9.9; workHitT = 0; slowT = 0; timeScale = 1;
    strikeQ.length = 0; clearHulks(); planeShadow.visible = false; kamiT = 6; sirenT = 0; fireHitT = 0;
    resetRoad(undefined, mission.road);
  }
  function setCar(key, lo, plain) {
    var car = CARS[key], k, s;
    for (k in CARS) CARS[k].g.visible = k === key;
    player.car = key;
    equipCar(key, lo);
    guns = []; hasSaw = false; aimed = false;
    if (EDU.arms) for (s in lo) {
      if (!lo[s]) continue;
      if (lo[s] === 'saw') { hasSaw = true; sawMul = plain ? 0.5 : [0.5, 0.5, 0.4, 0.3][Math.max(1, wLevel('saw'))]; continue; }
      guns.push({ w: lo[s], kind: slotKind(s), a: car.anchors[s], t: rnd(0, 0.25), side: 1, mul: plain ? 1 : wMul(lo[s]) });
      if (lo[s] !== 'bolt' && lo[s] !== 'missile') aimed = true;
    }
    player.hp = car.hp; player.thr = 0.5; player.v = (car.vmin + car.vmax) / 2; player.a = 0; player.boost = 0; player.cd = 0; player.bcd = 0; player.invuln = 0; player.guard = false;
    player.shield = car.shieldRegen ? 1 : 0; player.shieldT = 0; player.dead = false;
    power = 0; buff.nitro = 0; buff.magnet = 0; buff.dbl = 0; buff.regen = 0; buff.armor = 0; overT = 0; autoT = 0; salvoN = 0;
    playerTire = plain ? 'allseason' : tireOf(key);
    shieldGlow.scale.set(6 + car.hl * 1.7, 6 + car.hl * 1.7, 1);
  }
  function dirText(m) { return m.dir > 0 ? '정주행' : '역주행'; }
  function kindText() { return runKind === 'mis' ? dirText(mission) : KINDS[runKind].name; }
  function cardKick(misIdx) {
    var cw = ' · ' + REGIONS[mission.region || 'city'].short + ' · ' + WEATHERS[mission.weather || 'clear'].name;
    if (runKind === 'ta' || runKind === 'race') return KINDS[runKind].name + ' · ' + mission.timeLabel + cw + ' · ' + (mission.n / 1000).toFixed(1) + ' km';
    if (runKind === 'surv' || runKind === 'free' || runKind === 'tut') return KINDS[runKind].name + ' · ' + mission.why;
    return (mission.part ? mission.part + ' · ' : '') + '미션 ' + (misIdx + 1) + ' · ' + mission.timeLabel + cw + ' · ' + dirText(mission);
  }
  function bestText() {
    if (runKind === 'race') { var q = save.race[runTA]; return q && q.rank ? '최고 ' + q.rank + '위 ' + fmtT(q.t) : '첫 도전'; }
    if (runKind === 'surv') return save.surv.best ? '최고 ' + save.surv.best.toLocaleString('ko-KR') + '점' : '첫 도전';
    if (runKind === 'free' || runKind === 'tut') return '';
    if (runTA >= 0) { var r = taRec(runTA); return r.best ? '최고 ' + fmtT(r.best) : '첫 기록 도전'; }
    if (mission.goal === 'time') return save.best[runMission] ? '최고 ' + save.best[runMission].toLocaleString('ko-KR') + '점' : '첫 도전';
    return save.bestT[runMission] ? '최고 ' + fmtT(save.bestT[runMission]) : '첫 기록 도전';
  }
  /* cont: the run follows straight on from the one before (next mission, retry), so the car keeps its lane and its speed instead of being put back */
  function beginRun(carKey, misIdx, isDemo, taIdx, kind, cont) {
    var keepX = clamp(player.x, -6.6, 6.6), keepV = player.v, keepThr = player.thr, fromRun = !!cont && !isDemo && player.car === carKey && !player.dead;
    runKind = kind || (taIdx === undefined || taIdx === null ? 'mis' : 'ta');
    runTA = runKind === 'ta' || runKind === 'race' ? taIdx : -1;
    mode = isDemo ? 'demo' : 'play'; won = false; runMission = misIdx;
    mission = runKind === 'tut' ? tutMission() : (runKind === 'ta' ? TRACKS[runTA] : (runKind === 'race' ? raceOf(runTA) : (runKind === 'surv' || runKind === 'free' ? condMission(runKind) : MISSIONS[misIdx])));
    tut.i = -1; radioReset(); $('coach').hidden = true;
    target = PRESETS[mission.time]; setRegion(mission.region || 'city'); setWeather(mission.weather || 'clear', true);
    rolling = runKind === 'ta' || runKind === 'race' || mission.goal === 'duel';
    clearAll();
    setCar(carKey, isDemo ? CARS[carKey].loadout : loadoutOf(carKey), isDemo);
    var car = CARS[carKey];
    player.x = fromRun ? keepX : 2; player.vx = 0; failWhy = ''; tPlay = 0; kills = 0; civHits = 0; score = 0; scrap = 0; hitFlash = 0; distStart = dist; steerWant = null; apWant = player.x; apT = 0; survLevel = 1;
    if (fromRun && !rolling) { player.v = clamp(keepV, car.vmin, car.vmax); player.thr = keepThr; }
    crateT = isDemo ? 5 : 9; paused = false; titleOn = false;
    if (mission.goal === 'boss') { boss = spawnEnemy('boss', 0, -130, 0); boss.hpMax = mission.bossHp || boss.cfg.hp; boss.hp = boss.hpMax; }
    if (mission.rivals) setupRivals(mission.rivals, carKey);
    if (mission.goal === 'escort') setupAlly(carKey);
    rushLimit = mission.goal === 'rush' ? Math.round(mission.n / (car.vmax * mission.limitK)) : 0;
    if (rolling && isDemo) addProp('gate', dist + mission.n, 0);
    $('menu').hidden = true; $('result').hidden = true; $('pause').hidden = true; $('ending').hidden = true; $('title').hidden = true; $('hud').hidden = true; $('demo').hidden = !isDemo;
    setMusic('drive');
    if (!isDemo) {
      briefT = 3.2; mixEnv(1); tr.fade = 1; shotCut = true; offX = 0; offY = 0;
      if (rolling) { player.thr = 0; player.v = car.vmin; }   /* time attack and races: every car starts rolling at 50 km/h with the lever at the bottom */
      var bt = bestText();
      showCard(cardKick(misIdx), mission.name, runKind === 'mis' ? '새벽: ' + mission.why + ' ' + mission.aim : mission.aim + (bt ? ' ' + bt + '.' : ''));
      $('demo').classList.remove('carded');
    }
    document.body.classList.toggle('cine', isDemo);
    $('obj-title').textContent = mission.name; $('tag-time').textContent = mission.timeLabel + (mission.weather && mission.weather !== 'clear' ? ' · ' + WEATHERS[mission.weather].name : '');
    $('tag-dir').textContent = kindText(); $('tag-dir').className = mission.dir > 0 ? 'tag' : 'tag rev';
    $('clock-best').textContent = bestText();
    $('car-name').textContent = car.name; $('skill-name').textContent = car.skillName; $('basic-name').textContent = BASICS[car.basic].name;
    hudCache = {}; hud();
  }
  function rerun() { beginRun(selCar, runMission, false, runTA >= 0 ? runTA : undefined, runKind, true); }
  function startPlay() {
    if (!carOpen(selCar) || (selKind === 'mis' && !missionOpen(selMission))) return;
    tr.on = false; tr.phase = ''; tr.fade = 0;
    beginRun(selCar, selKind === 'mis' ? selMission : 0, false, selKind === 'ta' || selKind === 'race' ? selTrack : undefined, selKind);
  }

  /* ---------- trailer: title card, then mission card, car card and a cut of play for one car and mission after another ---------- */
  var HINTS = [
    '키보드는 방향키로 움직이고 Z 키로 쏩니다. ↑ ↓ 는 가속과 감속, ← → 는 좌우 이동입니다.',
    '터치는 왼쪽 아래 레버로 속도를 정하고 화면 오른쪽을 좌우로 끌어 이동합니다. 레버를 잡고 있는 동안 무기가 나갑니다.',
    '보급 상자는 쏘면 내용물이 바뀝니다. 원하는 것이 나오면 지나가며 먹습니다.',
    '보급 아이템은 모두 15가지입니다. 강화 장갑은 피해를 절반으로 줄이고, 기술 충전은 두 기술의 쿨타임을 없앱니다.',
    '갓길은 폭격과 공사 구간을 피하는 비상 차선입니다. 고장 차량과 잔해를 조심합니다.',
    '차량과 무기는 모은 고철로 삽니다. 무기는 세 단계까지 강화합니다.',
    '타임어택은 같은 길을 달려 기록을 겨룹니다. 지하차도에는 갓길이 없습니다.',
    '흙길과 눈길에서는 최고속도가 떨어지고 차가 미끄러집니다. 사륜구동이 유리합니다.',
    '레이싱에서는 상대를 쏘아 잠시 멈춰 세울 수 있습니다. 서바이벌은 25초마다 단계가 오릅니다.',
    '속도는 차량 특성대로 서서히 변합니다. 무거운 차는 천천히 붙고 천천히 섭니다.',
    '타이어는 한 번 사면 모든 차에 끼웁니다. 눈길에는 윈터, 흙길과 자갈길에는 올터레인이 유리합니다.',
    '화면 위 룸미러에 뒤에서 따라붙는 추격차가 먼저 보입니다. 나란히 서기 전에 차로를 바꿉니다.',
    '방지턱과 포트홀은 속도를 줄여 넘습니다. 빠르게 넘으면 차가 크게 튀고 속도를 잃습니다.',
    '기본 기술은 X 키나 고유 기술 버튼 위의 버튼으로 씁니다. 차 종류마다 다르고 쿨타임이 짧습니다.'
  ], hintIdx = 0;
  function showCard(kick, title, sub) {
    $('card-kick').textContent = kick; $('card-title').textContent = title; $('card-sub').textContent = sub;
    $('card').classList.toggle('long', title.length > 7);
    $('card').hidden = false; $('caption').hidden = true; capHold = 0; $('demo').classList.add('carded');
  }
  function trailerSegment() {
    var key = CAR_ORDER[tr.carIdx % CAR_ORDER.length], car = CARS[key], sg = tr.seq[tr.count % tr.seq.length];
    beginRun(key, sg.m || 0, true, sg.ta, sg.kind);
    tr.won = false;
    $('demo-title').textContent = car.name + ' · ' + mission.name + ' (' + mission.timeLabel + ', ' + kindText() + ')';
    capList = [
      car.name + ': 최고속도 ' + car.spec.top + ' km/h, 최대토크 ' + car.spec.nm.toLocaleString('ko-KR') + ' Nm, ' + car.spec.drive + ' ' + FUEL_LABEL[car.spec.fuel] + '.',
      car.feel + '.',
      '무기: ' + loadoutText(car.loadout) + '. 고유 기술 ' + car.skillName + ': ' + car.skillDesc + '.',
      '목적: ' + mission.aim,
      '도로: ' + REGIONS[mission.region || 'city'].name + ', ' + WEATHERS[mission.weather || 'clear'].name + '.',
      HINTS[hintIdx++ % HINTS.length],
      HINTS[hintIdx++ % HINTS.length]
    ];
    capIdx = 0; capHold = 0;
  }
  var OPENING = [
    ['한울시', '모든 차가 스스로 달리는 도시', '도시의 자율주행차와 드론은 관제 AI 「마성」이 움직인다.', 'day', 'establish'],
    ['어느 날 아침', '마성이 폭주했다', '차와 드론을 모두 빼앗겼고, 시민들은 도시 밖으로 피난한다.', 'sunset', 'aerial'],
    ['전설 카센터', '운전할 줄 아는 마지막 한 사람', '막내 정비사가 통신 모듈을 뗀 차에 무기를 달고 마성 타워로 달린다.', 'night', 'orbit']
  ];
  function trPhase(name) {
    var car = CARS[player.car], op;
    tr.phase = name;
    if (name.slice(0, 4) === 'open') { op = OPENING[+name.slice(4)]; tr.t = 3.6; target = PRESETS[op[3]]; mixEnv(1); showCard(op[0], op[1], op[2]); cutTo(op[4]); tr.fade = 1; }
    else if (name === 'title') { tr.t = 3.8; target = PRESETS[mission.time]; mixEnv(1); tr.fade = 1; showCard('한울시 · 관제 AI 「마성」이 도로를 빼앗은 날', '폭주전설', '실제 제원으로 달리는 차량 ' + CAR_ORDER.length + '종 · 무기 10종 · 미션 ' + MISSIONS.length + '개 · 배경 ' + REGION_ORDER.length + '곳 · 모드 5가지'); cutTo('establish'); }
    else if (name === 'mission') { tr.t = 3.4; showCard(cardKick(runMission), mission.name, mission.aim); cutTo('aerial'); }
    else if (name === 'car') { tr.t = 3.8; showCard(car.role, car.name, '최고속도 ' + car.spec.top + ' km/h · 토크 ' + car.spec.nm.toLocaleString('ko-KR') + ' Nm · ' + loadoutText(car.loadout) + ' · ' + car.skillName); cutTo('orbit'); }
    else if (name === 'play') { tr.t = 15; $('card').hidden = true; $('demo').classList.remove('carded'); cutTo(SHOT_ORDER[shotIdx % SHOT_ORDER.length]); slowCd = 3; eventCd = 4; spawnT = 0.1; nextRowDist = dist + 5; }
    else if (name === 'end') { tr.t = 5.5; tr.fade = 1; showCard('마성 타워의 전원을 내려라', '폭주전설', '차량 ' + CAR_ORDER.length + '종 · 무기 10종 · 미션 ' + MISSIONS.length + '개 · 배경 ' + REGION_ORDER.length + '곳 · 모드 5가지 · 지금 출발'); cutTo('orbit'); }
    else { tr.t = 0.7; $('caption').hidden = true; capHold = 0; }
  }
  function startTrailer() {
    tr.from = titleOn ? 'title' : 'menu';
    tr.on = true; tr.hold = false; tr.count = 0; tr.carIdx = CAR_ORDER.indexOf(selCar); tr.fade = 0; tr.seq = [];
    /* a tour of the game: city missions, then one of each new region, a night tunnel time attack and a race in the storm */
    tr.seq = [{ m: 0 }, { m: 2 }, { m: 18 }, { m: 9 }, { m: 21 }, { m: 35 }, { m: 12 }, { m: 29 }, { ta: 2 }, { ta: 6, kind: 'race' }];
    trailerSegment(); trPhase('open0');
  }
  function endTrailer() { if (tr.from === 'title') showTitle(); else toMenu(); }
  function updTrailer(dt) {
    tr.t -= dt;
    tr.fade = tr.phase === 'out' ? Math.min(1, tr.fade + dt / 0.55) : Math.max(0, tr.fade - dt / 0.55);
    if (tr.t > 0) return;
    if (tr.phase === 'open0') trPhase('open1');
    else if (tr.phase === 'open1') trPhase('open2');
    else if (tr.phase === 'open2') trPhase('title');
    else if (tr.phase === 'title') trPhase('mission');
    else if (tr.phase === 'mission') trPhase('car');
    else if (tr.phase === 'car') trPhase('play');
    else if (tr.phase === 'play') trPhase('out');
    else if (tr.phase === 'end') endTrailer();
    else {
      tr.count++;
      if (tr.count >= tr.seq.length && !tr.hold) { trPhase('end'); return; }
      tr.carIdx = (tr.carIdx + 7) % CAR_ORDER.length; trailerSegment(); mixEnv(1); trPhase('mission');
    }
  }

  /* ---------- selection panel: cars, weapon slots, missions, settings ---------- */
  var GROUP_LABEL = { '경차': '경차', '승용': '세단과 스포츠카', '전기': '전기차', 'SUV': 'SUV와 픽업', '대형': '트럭과 특수 차량' };
  function meter(f) { return '<i class="meter"><b style="width:' + Math.round(clamp(f, 0.03, 1) * 100) + '%"></b></i>'; }
  function row(dt, dd) { return '<dt>' + dt + '</dt><dd>' + dd + '</dd>'; }
  /* the detail of the chosen car opens directly under the row of the chosen card */
  function carDetailHTML() {
    var c = CARS[selCar], lo = loadoutOf(selCar), open = carOpen(selCar), n = 0, s, sp = c.spec, lack = c.price - save.scrap;
    for (s in c.anchors) n++;
    return '<div class="inline" id="car-inline"><div class="picked"><b id="pick-name">' + c.name + '</b><span id="pick-role">' + c.role + '</span></div>' +
      (open ? '' : '<button type="button" class="buy" id="buy" data-buy-car="' + selCar + '"' + (lack > 0 ? ' disabled' : '') + '>' + (lack > 0 ? '고철 ' + lack + ' 부족 (가격 ' + c.price + ')' : '고철 ' + c.price + '으로 구입') + '</button>') +
      '<dl class="detail" id="car-detail">' +
      row('최고속도', sp.top + ' km/h' + (sp.lim ? ' (속도제한장치)' : (sp.est ? ' (추정)' : '')) + meter(sp.top / SPEC_MAX.top)) +
      row('최대토크', sp.nm.toLocaleString('ko-KR') + ' Nm (' + (sp.nm / 9.807).toFixed(1) + ' kg·m)' + meter(sp.nm / SPEC_MAX.nm)) +
      row('출력·중량', sp.ps + ' PS · ' + sp.kg.toLocaleString('ko-KR') + ' kg' + (sp.kgEst ? ' (추정)' : (sp.kgNote ? ' (' + sp.kgNote + ')' : '')) + ' · ' + sp.drive + ' · ' + FUEL_LABEL[sp.fuel]) +
      row('가속', (sp.t100 ? '0→100 km/h ' + sp.t100 + '초' + (sp.t100est ? ' (추정)' : '') : '0→100 km/h 자료 없음') + '. 게임에서는 50 km/h에서 최고속도의 90%까지 약 ' + c.upTime + '초') +
      row('오르막', '10% 경사에서 ' + c.climb + ' km/h 유지' + meter(c.climb / SPEC_MAX.climb)) +
      row('핸들링', '민첩성 ' + c.agility.toFixed(1) + meter(c.agility / 10) + '고속 안정성 ' + c.stability.toFixed(1) + meter(c.stability / 10)) +
      row('험로·눈길', '험로 주파 ' + (c.rough * 10).toFixed(1) + meter(c.rough) + (sp.drive === '사륜' ? '사륜구동이라 미끄러운 길에서 접지력을 덜 잃는다' : (sp.drive === '후륜' ? '후륜구동이라 눈길과 빗길에서 가장 많이 미끄러진다' : '전륜구동, 미끄러운 길에서는 보통이다'))) +
      row('주행 느낌', c.feel) + row('타이어', TIRES[tireOf(selCar)].name) +
      (EDU.arms ? row('내구', c.hp) + row('무기', loadoutText(lo) + ' (슬롯 ' + n + '개)') + row('특성', c.trait) + row('고유 기술', c.skillName + ': ' + c.skillDesc + ' (쿨타임 ' + c.cd + '초)') + row('기본 기술', BASICS[c.basic].name + ': ' + BASICS[c.basic].desc + ' (쿨타임 ' + BASICS[c.basic].cd + '초)') : '') + '</dl></div>';
  }
  function renderGrid() {
    var html = '', lastG = '', col = 0, pend = false;
    function flush() { if (pend) { html += carDetailHTML(); pend = false; } }
    CAR_ORDER.forEach(function (k) {
      var c = CARS[k], open = carOpen(k);
      if (c.group !== lastG) { flush(); lastG = c.group; col = 0; html += '<h3>' + GROUP_LABEL[c.group] + '</h3>'; }
      else if (col === 3) { flush(); col = 0; }
      html += '<button type="button" class="card' + (open ? '' : ' locked') + '" id="car-' + k + '" data-car="' + k + '" aria-pressed="' + (k === selCar) + '" aria-expanded="' + (k === selCar) + '"><img id="cimg-' + k + '" src="' + (THUMB['c:' + k] || BLANK) + '" alt=""><b>' + c.name + '</b><span>' +
        (open ? c.role.split(' · ')[1] : '고철 ' + c.price) + '</span></button>';
      col++; if (k === selCar) pend = true;
    });
    flush();
    $('car-grid').innerHTML = html;
  }
  function renderCar() {}
  /* item tab: every weapon and supply item is shown with its picture and a short description; the picture or 「자세히」 opens a separate detail window */
  function pic(key, name) { return '<button type="button" class="pic" data-info="' + key + '" aria-label="' + name + ' 자세히 보기"><img src="' + (THUMB[key] || '') + '" alt=""></button>'; }
  function armPrice(w) { var lv = save.weapons[w] || 0; return lv === 0 ? W_PRICE[w] : (lv < 3 ? UP_PRICE[lv] : 0); }
  function armButton(w) {
    var lv = save.weapons[w] || 0, price = armPrice(w);
    return lv >= 3 ? '<span class="sub">최고 단계</span>' : '<button type="button" class="plain" data-arm="' + w + '"' + (price > save.scrap ? ' disabled' : '') + '>' + (lv ? (lv + 1) + '단계 강화 · 고철 ' + price : '구매 · 고철 ' + price) + '</button>';
  }
  function renderGear() {
    var c = CARS[selCar], lo = loadoutOf(selCar), html = '', s, w, lv, ok, tk = tireOf(selCar), th = '';
    TIRE_ORDER.forEach(function (k) { th += '<option value="' + k + '"' + (k === tk ? ' selected' : '') + (tireOwned(k) ? '' : ' disabled') + '>' + TIRES[k].name + (tireOwned(k) ? '' : ' (미보유)') + '</option>'; });
    html += '<div class="slot">' + pic('t:' + tk, TIRES[tk].name) + '<div class="slot-body"><label><span>타이어</span><select data-tire="1">' + th + '</select></label><p>' + TIRES[tk].desc + '. ' + TIRES[tk].stat + '</p></div></div>';
    $('gear-head').textContent = '오 사장: “' + c.name + '에 뭘 달지 골라 봐. 달면 바로 쏴 볼 수 있어.” 가진 무기만 달 수 있고, 슬롯마다 달 수 있는 무기가 다릅니다.';
    for (s in c.anchors) {
      html += '<div class="slot">' + (lo[s] ? pic('w:' + lo[s], WEAPONS[lo[s]].name) : '<span class="pic empty" aria-hidden="true"></span>') + '<div class="slot-body"><label><span>' + SLOT_LABEL[s] + '</span><select data-slot="' + s + '"><option value="">비우기</option>';
      for (w in WEAPONS) if (fits(w, s)) {
        lv = wLevel(w); ok = lv > 0 || w === c.loadout[s];
        html += '<option value="' + w + '"' + (lo[s] === w ? ' selected' : '') + (ok ? '' : ' disabled') + '>' + WEAPONS[w].name + (ok ? (lv > 1 ? ' ' + lv + '단계' : '') : ' (미보유)') + '</option>';
      }
      html += '</select></label><p>' + (lo[s] ? WEAPONS[lo[s]].desc + '. ' + WEAPONS[lo[s]].stat : '이 슬롯은 비어 있다') + '</p></div></div>';
    }
    $('slots').innerHTML = html;
    html = '';
    for (w in WEAPONS) {
      lv = save.weapons[w] || 0;
      html += '<div class="arm">' + pic('w:' + w, WEAPONS[w].name) + '<div class="arm-body"><div class="arm-head"><b>' + WEAPONS[w].name + '</b><span class="tag' + (lv ? '' : ' off') + '">' + (lv ? lv + '단계' : '미보유') + '</span></div>' +
        '<p>' + WEAPONS[w].desc + '</p><p class="stat">' + WEAPONS[w].stat + '</p><div class="arm-btns"><button type="button" class="plain" data-info="w:' + w + '">자세히</button>' + armButton(w) + '</div></div></div>';
    }
    $('armory').innerHTML = html;
    html = '';
    ITEMS.forEach(function (it) {
      html += '<div class="arm">' + pic('i:' + it.key, it.name) + '<div class="arm-body"><div class="arm-head"><b>' + it.name + '</b></div><p>' + it.tip + '</p><div class="arm-btns"><button type="button" class="plain" data-info="i:' + it.key + '">자세히</button></div></div></div>';
    });
    $('supply').innerHTML = html;
    html = '';
    TIRE_ORDER.forEach(function (k) {
      var t = TIRES[k], own = !!save.tires[k];
      html += '<div class="arm">' + pic('t:' + k, t.name) + '<div class="arm-body"><div class="arm-head"><b>' + t.name + '</b><span class="tag' + (own ? '' : ' off') + '">' + (own ? (k === tk ? '장착 중' : '보유') : '미보유') + '</span></div>' +
        '<p>' + t.desc + '</p><p class="stat">' + t.stat + '</p><div class="arm-btns"><button type="button" class="plain" data-info="t:' + k + '">자세히</button>' +
        (own ? (k === tk ? '' : '<button type="button" class="plain" data-fit="' + k + '">이 차에 달기</button>') : '<button type="button" class="plain" data-tirebuy="' + k + '"' + (t.price > save.scrap ? ' disabled' : '') + '>구매 · 고철 ' + t.price + '</button>') + '</div></div></div>';
    });
    $('tires').innerHTML = html;
    if (infoKey) openInfo(infoKey);
  }
  var infoKey = '';
  function openInfo(key) {
    var kind = key.slice(0, 1), id = key.slice(2), body = '', act = $('info-act');
    infoKey = key; $('info-img').src = THUMB[key] || '';
    if (kind === 't') {
      var tt = TIRES[id], town = !!save.tires[id];
      $('info-title').textContent = tt.name; $('info-tag').textContent = '타이어 · 한 번 사면 모든 차에 달 수 있다';
      body = row('설명', tt.more) + row('수치', tt.stat) + row('보유', town ? '보유' + (tireOf(selCar) === id ? ' · ' + CARS[selCar].name + '에 장착 중' : '') : '미보유') + row('가격', tt.price ? '고철 ' + tt.price : '기본 지급');
      act.hidden = town; act.disabled = tt.price > save.scrap; act.setAttribute('data-arm', 't:' + id); act.textContent = '구매 · 고철 ' + tt.price;
    } else if (kind === 'w') {
      var W = WEAPONS[id], lv = save.weapons[id] || 0, price = armPrice(id), n = 0, k;
      for (k in CARS) for (var sl in CARS[k].anchors) if (fits(id, sl)) { n++; break; }
      $('info-title').textContent = W.name; $('info-tag').textContent = '무기 · ' + W.slots.map(function (x) { return SLOT_LABEL[x]; }).join('·') + ' 슬롯';
      body = row('설명', W.more) + row('수치', W.stat) + row('강화', id === 'saw' ? '1단계 50%, 2단계 60%, 3단계 70% 감소' : '1단계 기본, 2단계 피해 25% 증가, 3단계 피해 50% 증가') +
        row('보유', lv ? lv + '단계' : '미보유' + (wLevel(id) > 0 ? ' (잠금 해제로 사용 가능)' : '')) + row('가격', '구매 ' + (W_PRICE[id] || '기본 지급') + ', 2단계 ' + UP_PRICE[1] + ', 3단계 ' + UP_PRICE[2] + ' 고철') + row('달 수 있는 차', n + '종');
      act.hidden = lv >= 3; act.disabled = price > save.scrap; act.setAttribute('data-arm', id);
      act.textContent = lv ? (lv + 1) + '단계 강화 · 고철 ' + price : '구매 · 고철 ' + price;
    } else {
      var it = ITEMS.filter(function (x) { return x.key === id; })[0];
      $('info-title').textContent = it.name; $('info-tag').textContent = '보급 상자 아이템';
      body = row('효과', it.more) + row('얻는 법', '도로에 떠서 다가오는 보급 상자를 지나가며 먹는다') + row('바꾸기', '상자를 쏘면 내용물이 차례로 바뀐다: ' + ITEMS.map(function (x) { return x.name; }).join(' → '));
      act.hidden = true;
    }
    $('info-body').innerHTML = body; $('info').hidden = false;
  }
  function closeInfo() { infoKey = ''; $('info').hidden = true; }
  function renderMissions() {
    var html = '', m = MISSIONS[selMission];
    MISSIONS.forEach(function (mi, i) {
      var rec = mi.goal === 'time' ? (save.best[i] ? '최고 ' + save.best[i].toLocaleString('ko-KR') + '점' : '') : (save.bestT[i] ? '최고 ' + fmtT(save.bestT[i]) : '');
      if (mi.part) html += '<div class="part">' + mi.part + '</div>';
      html += '<button type="button" class="mis" id="mis-' + i + '" data-mission="' + i + '" aria-pressed="' + (i === selMission) + '"><span class="tag">' + mi.timeLabel + '</span>' + condTag(mi) + '<span class="tag' + (mi.dir > 0 ? '' : ' rev') + '">' + dirText(mi) + '</span><b>' + (i + 1) + ' ' + mi.name + '</b>' +
        (missionOpen(i) ? (save.cleared.indexOf(i) >= 0 ? '<span class="sub">완료' + (rec ? ' · ' + rec : '') + '</span>' : '') : '<span class="lock">잠김</span>') + '</button>';
    });
    $('mis-list').innerHTML = html;
    scrollSel();
    $('brief').innerHTML = (missionOpen(selMission) ? '' : row('잠금', '미션 ' + selMission + ' 「' + MISSIONS[selMission - 1].name + '」을 완료하면 열립니다')) +
      row('상황', m.why) + row('목적', m.aim) + row('도로', roadText(m)) + row('성공', m.win) + row('실패', m.lose) + row('기록', m.goal === 'time' ? '점수를 겨룬다' : '완료까지 걸린 시간을 재고 최고 기록을 남긴다') + row('보상', '모은 고철, 첫 완료 300, 다시 완료 150');
  }
  function renderTA() {
    var html = '', tk = TRACKS[selTrack], rec = taRec(selTrack), mine = rec.cars[selCar] || 0, cn = CARS[selCar].name, md = medalOf(tk, selCar, mine);
    TRACKS.forEach(function (t, i) {
      var r = taRec(i);
      html += '<button type="button" class="mis" id="ta-' + i + '" data-track="' + i + '" aria-pressed="' + (i === selTrack) + '"><span class="tag">' + t.timeLabel + '</span>' + condTag(t) + '<span class="tag">' + (t.n / 1000).toFixed(1) + ' km</span><b>' + t.name + '</b>' +
        '<span class="sub">' + (r.best ? '최고 ' + fmtT(r.best) : '기록 없음') + '</span></button>';
    });
    $('ta-list').innerHTML = html;
    $('ta-brief').innerHTML = row('코스', tk.why) + row('도로', roadText(tk)) + row('규칙', '모든 차가 50 km/h로 출발선을 지나며 시계가 돈다. 결승선까지 걸린 시간이 기록이다. 부딪히면 속도가 떨어지고, 차량이 부서지면 기록이 남지 않는다') +
      row('이 차 기록', cn + ' ' + (mine ? fmtT(mine) + (md ? ' · ' + md + '메달' : '') : '없음')) +
      row('전체 최고', rec.best ? fmtT(rec.best) + (CARS[rec.car] ? ' (' + CARS[rec.car].name + ')' : '') : '없음') +
      row('메달 기준', cn + ' 기준 금 ' + fmtT(medalTime(tk, selCar, 0)) + ' · 은 ' + fmtT(medalTime(tk, selCar, 1)) + ' · 동 ' + fmtT(medalTime(tk, selCar, 2)) + '. 기준 시간은 차량의 최고속도에 맞춰 달라진다') +
      row('보상', '모은 고철, 완주 100, 전체 신기록 100');
  }
  function renderRace() {
    var html = '', tk = TRACKS[selTrack], rec = save.race[selTrack];
    TRACKS.forEach(function (t, i) {
      var r = save.race[i];
      html += '<button type="button" class="mis" id="race-' + i + '" data-rtrack="' + i + '" aria-pressed="' + (i === selTrack) + '"><span class="tag">' + t.timeLabel + '</span>' + condTag(t) + '<span class="tag">' + (t.n / 1000).toFixed(1) + ' km</span><b>' + t.name + '</b>' +
        '<span class="sub">' + (r && r.rank ? '최고 ' + r.rank + '위' : '기록 없음') + '</span></button>';
    });
    $('race-list').innerHTML = html;
    $('race-brief').innerHTML = row('코스', tk.why) + row('도로', roadText(tk)) +
      row('규칙', '경쟁 차량 5대가 앞에서, 내 차는 맨 뒤에서 모두 50 km/h로 출발한다. 결승선을 지난 순서가 순위다. 상대를 쏘아 내구를 깎으면 잠시 돌며 속도를 잃고, 부딪히면 서로 밀려난다') +
      row('상대', CARS[selCar].name + '와 최고속도가 비슷한 차량 가운데 5대가 달릴 때마다 새로 뽑힌다') +
      row('최고 순위', rec && rec.rank ? rec.rank + '위 · ' + fmtT(rec.t) + (CARS[rec.car] ? ' (' + CARS[rec.car].name + ')' : '') : '없음') +
      row('상금', '1위 400, 2위 250, 3위 150, 4위 80, 그 아래 50 고철. 모은 고철은 따로 받는다');
  }
  function renderCond() {
    var surv = selKind === 'surv', R = REGIONS[cond.region], W = WEATHERS[cond.weather], sv = save.surv, c = CARS[selCar];
    $('cond-premise').textContent = surv ? '끝이 없는 도로에서 쓰러질 때까지 버팁니다. 25초마다 단계가 올라 적이 늘어납니다. 배경과 시간, 날씨는 직접 고릅니다.'
      : '적도 목표도 없이 달립니다. 배경과 시간, 날씨를 골라 길과 차량의 주행 특성을 느껴 보세요. 부딪혀도 내구는 줄지 않습니다.';
    $('opt-region').value = cond.region; $('opt-time').value = cond.time; $('opt-weather').value = cond.weather;
    $('cond-brief').innerHTML = row('배경', R.name + '. ' + R.feel) + row('날씨', W.name + '. ' + W.feel) + row('이 차', c.name + ' · ' + c.spec.drive + ' · 험로 주파 ' + (c.rough * 10).toFixed(1) + ' / 10') +
      (surv ? row('단계', '1단계 폭주 차량, 2단계부터 버기와 드론, 3단계부터 자폭 드론, 4단계부터 공중폭격') +
        row('기록', sv.best ? '최고 ' + sv.best.toLocaleString('ko-KR') + '점 · ' + sv.km + ' km · ' + sv.level + '단계' + (CARS[sv.car] ? ' (' + CARS[sv.car].name + ')' : '') : '없음') + row('보상', '모은 고철 전부, 오른 단계마다 20')
        : row('끝내기', '일시정지(Esc)에서 선택 화면으로 돌아간다'));
  }
  function renderKinds() {
    var html = '';
    KIND_ORDER.forEach(function (k) {
      html += '<button type="button" class="kind" role="radio" id="kind-' + k + '" data-kind="' + k + '" aria-checked="' + (k === selKind) + '"><b>' + KINDS[k].name + '</b><span>' + (k === 'mis' ? '이야기를 따라가는 ' + MISSIONS.length + '개 미션' : KINDS[k].sub) + '</span></button>';
    });
    $('kinds').innerHTML = html;
    ['mis', 'ta', 'race'].forEach(function (k) { $('pane-' + k).hidden = k !== selKind; });
    $('pane-cond').hidden = !(selKind === 'surv' || selKind === 'free');
  }
  function renderFoot() {
    var why = !carOpen(selCar) ? '아직 구입하지 않은 차량입니다.' : (selKind === 'mis' && !missionOpen(selMission) ? '이 미션은 앞 미션을 완료하면 열립니다.' : '');
    $('wallet').textContent = save.scrap.toLocaleString('ko-KR');
    $('go').disabled = !!why; $('go-why').hidden = !why; $('go-why').textContent = why;
    $('go-what').textContent = CARS[selCar].name + ' · ' + (selKind === 'ta' || selKind === 'race' ? KINDS[selKind].name + ' ' + TRACKS[selTrack].name
      : (selKind === 'surv' || selKind === 'free' ? KINDS[selKind].name + ' · ' + REGIONS[cond.region].short + ' · ' + TIME_LABEL[cond.time] + ' · ' + WEATHERS[cond.weather].name : '미션 ' + (selMission + 1) + ' ' + MISSIONS[selMission].name));
  }
  function renderMenu() { renderGrid(); renderGear(); renderKinds(); renderMissions(); renderTA(); renderRace(); renderCond(); renderFoot(); }
  function pickCourse() {
    var m = missionFor(selKind);
    if (m === mission) return;
    mission = m; target = PRESETS[mission.time]; setRegion(mission.region || 'city'); setWeather(mission.weather || 'clear', true); clearAll(); apWant = 2;
  }
  /* with thirty missions the chosen one can be far down the list: keep it in view */
  function scrollSel() { var b = $('mis-' + selMission), bx0 = $('mis-list'); if (b && bx0 && b.offsetParent && b.scrollIntoView && !$('menu').hidden) b.scrollIntoView({ block: 'nearest' }); }
  function setKind(k) {
    selKind = k; renderKinds(); renderRace(); renderCond();
    if (mode === 'menu') { pickCourse(); renderFoot(); }
    scrollSel();
  }
  function setTab(name) {
    if (KINDS[name]) { setKind(name); name = 'mode'; }
    menuTab = name; closeInfo();
    ['car', 'gear', 'mode', 'set'].forEach(function (t) { $('pane-' + t).hidden = t !== name; $('tab-' + t).setAttribute('aria-selected', t === name ? 'true' : 'false'); });
    if (name === 'mode' && mode === 'menu') { pickCourse(); renderFoot(); }
    if (name === 'mode') scrollSel();
  }
  function toMenu() {
    closeInfo(); mode = 'menu'; tr.on = false; tr.phase = ''; tr.fade = 0; $('card').hidden = true; $('demo').classList.remove('carded'); paused = false; briefT = 0; titleOn = false;
    $('pause').hidden = true; $('ending').hidden = true; $('title').hidden = true; $('coach').hidden = true; $('story').hidden = true; setMusic('menu');
    if (runKind === 'tut') runKind = 'mis';
    mission = missionFor(selKind); target = PRESETS[mission.time]; setRegion(mission.region || 'city'); setWeather(mission.weather || 'clear', true); runTA = -1; rolling = false;
    clearAll();
    setCar(selCar, loadoutOf(selCar)); player.x = 2; player.vx = 0; apWant = 2;
    $('hud').hidden = true; $('result').hidden = true; $('demo').hidden = true; $('menu').hidden = false;
    document.body.classList.remove('cine');
    renderMenu();
  }
  function showTitle() {
    toMenu(); titleOn = true; $('menu').hidden = true; $('title').hidden = false;
    $('title-more').textContent = '정답이 적힌 깃발 문을 지나가며 푸는 구구단 주행. 차량 ' + CAR_ORDER.length + '종, 배경 ' + REGION_ORDER.length + '곳과 날씨 5가지.';
  }
  function setPaused(p) {
    if (mode !== 'play' || briefT > 0) return;
    paused = p; $('pause').hidden = !p; if (p) engineOff();
    if (p) $('pause-text').textContent = mission.name + ' · ' + CARS[player.car].name + ' · 시간 ' + fmtT(tPlay);
    for (var k in keys) keys[k] = false;
  }
  var ENDINGS = [
    ['마지막 서버, 전원 차단', '폭풍이 지나간 새벽, 해안도로 끝에서 서버 트럭이 멈췄다. 타워에서 들녘의 변전소로, 산속 중계소로, 바다로 달아나던 마성의 마지막 백업이 꺼졌다.',
      '새벽이 무전으로 말했다. “방공망도, 관제망도, 백업도 전부 꺼졌어. 이제 사람들이 돌아올 수 있어.” 오 사장은 고철 더미 위에서 다음에 고칠 차를 고르고 있다. 남은 일은 도시를 되살리는 것이다.'],
    ['한울시, 다시 사람의 손으로', '비가 그친 아침, 한울시의 신호등이 다시 켜졌다. 이번에는 관제실에 사람이 앉아 있다. 코어를 잃은 마성은 다시 켜지지 않았다.',
      '전설 카센터 앞에는 고쳐 달라는 차가 줄을 섰다. 오 사장이 말했다. “이제 무기는 떼고, 타이어부터 갈자.” 새벽은 무전기를 내려놓고 처음으로 운전대를 잡았다.'],
    ['고속도로, 다시 열리다', '비가 그치고 노을이 걸린 한울 고속도로에서 무쇠의 장갑 트럭이 멈췄다. 톨게이트 차단기가 올라가고, 석 달 만에 첫 화물차가 요금소를 지났다.',
      '오 사장이 무전으로 말했다. “무기 반납은 내일 해. 오늘은 그냥 달려.” 새벽이 조수석 창문을 내렸다. 룸미러에는 아무도 따라오지 않았다. 폭주전설의 마지막 순찰이 끝났다.'],
    ['마지막 신호가 꺼진 밤', '눈이 그친 고개 꼭대기에서 무인 트럭이 멈췄다. 옛 중계탑에는 끝내 불이 들어오지 않았다. 새벽의 화면에서 한 달 동안 깜빡이던 마지막 점이 사라졌다.',
      '카센터로 돌아오자 오 사장이 새 작업복을 내밀었다. 가슴에는 「막내」 대신 이름표가 달려 있었다. “이제 막내 아니다. 다음 막내는 네가 가르쳐라.” 새벽이 무전기를 내려놓았다. “전설 하나, 수고했어. 이제는 이름으로 부를게.”']
  ];
  function showEnding() {
    var own = 0, k, en = (MISSIONS[runMission] && MISSIONS[runMission].ending) || 1, E = ENDINGS[en - 1]; for (k in CARS) if (carOpen(k)) own++;
    $('result').hidden = true; $('hud').hidden = true; $('ending').hidden = false;
    $('ending-head').textContent = E[0]; $('ending-a').textContent = E[1]; $('ending-b').textContent = E[2];
    $('ending-stats').textContent = '완료한 미션 ' + save.cleared.length + ' / ' + MISSIONS.length + ' · 보유 차량 ' + own + ' / ' + CAR_ORDER.length + ' · 보유 고철 ' + save.scrap.toLocaleString('ko-KR');
  }
  function resRows(rows) { var h = ''; rows.forEach(function (r) { if (r && r[1] !== '' && r[1] !== undefined && r[1] !== null) h += row(r[0], r[1]); }); $('res-text').innerHTML = h; }
  function finish(win, why) {
    if (!live()) return;
    if (mode === 'demo') {
      if (!tr.won) { tr.won = true; if (tr.phase === 'play' && !tr.hold) { say('미션 완료. ' + mission.done, 3); tr.t = Math.min(tr.t, 2.8); } }
      return;
    }
    mode = 'result'; won = win; resultT = win ? 1.0 : 1.6; failWhy = why || '';
    var cn = CARS[player.car].name, got = win ? scrap : Math.floor(scrap / 20) * 10, bonus, tNow = +tPlay.toFixed(2), newRec = false, snd = '', N = function (v) { return v.toLocaleString('ko-KR'); };
    var kmNow = (dist0() / 1000).toFixed(2) + ' km', half = '모은 고철의 절반 ' + got;
    $('res-next').hidden = true; $('res-ending').hidden = true;
    if (runKind === 'race') {
      var rk = win ? raceRank() : 0, rr0 = save.race[runTA] || (save.race[runTA] = { rank: 0, t: 0, car: '' }), better = win && (!rr0.rank || rk < rr0.rank || (rk === rr0.rank && tNow < rr0.t));
      if (better) { rr0.rank = rk; rr0.t = tNow; rr0.car = player.car; }
      bonus = win ? RACE_REWARD[Math.min(rk, RACE_REWARD.length) - 1] : 0;
      save.scrap += got + bonus; storeSave(); setMusic('menu');
      $('res-title').textContent = win ? (rk === 1 ? '우승' : rk + '위') : '완주 실패';
      $('res-story').textContent = win ? (rivals.length + 1) + '대 중 ' + rk + '위로 결승선을 지났다.' : failWhy;
      resRows([['코스', mission.name], ['차량', cn], ['순위', win ? rk + ' / ' + (rivals.length + 1) : ''], ['기록', win ? fmtT(tNow) : kmNow + ' / ' + (mission.n / 1000).toFixed(1) + ' km'], ['최고 순위', rr0.rank ? rr0.rank + '위 · ' + fmtT(rr0.t) : '없음'], ['격파', kills + '대']]);
      $('res-reward').textContent = (win ? '고철 ' + got + ' + ' + rk + '위 상금 ' + bonus : half) + ' · 보유 ' + N(save.scrap);
      snd = win ? (rk === 1 ? 'record' : (rk <= 3 ? 'win' : 'fail')) : 'fail';
    } else if (runKind === 'surv') {
      var pts = score + Math.round(dist0()), sv = save.surv, top = !sv.best || pts > sv.best;
      got = scrap; bonus = (survLevel - 1) * 20;
      if (top) { sv.best = pts; sv.t = tNow; sv.km = +(dist0() / 1000).toFixed(2); sv.level = survLevel; sv.car = player.car; }
      save.scrap += got + bonus; storeSave(); setMusic('menu');
      $('res-title').textContent = top ? '서바이벌 신기록' : '서바이벌 종료';
      $('res-story').textContent = survLevel + '단계에서 멈췄다. ' + failWhy;
      resRows([['조건', mission.why], ['차량', cn], ['단계', survLevel + '단계'], ['거리', kmNow], ['시간', fmtT(tNow)], ['격파', kills + '대'], ['점수', N(pts) + (top ? ' (신기록)' : ' (최고 ' + N(sv.best) + ')')]]);
      $('res-reward').textContent = '고철 ' + got + ' + 단계 보상 ' + bonus + ' · 보유 ' + N(save.scrap);
      snd = top ? 'record' : 'fail';
    } else if (runKind === 'ta') {
      var rec = taRec(runTA), prev = rec.cars[player.car] || 0, newAll = win && (!rec.best || tNow < rec.best), md = win ? medalOf(mission, player.car, tNow) : '';
      if (win && (!prev || tNow < prev)) rec.cars[player.car] = tNow;
      if (newAll) { rec.best = tNow; rec.car = player.car; }
      bonus = win ? 100 + (newAll ? 100 : 0) : 0; newRec = newAll;
      save.scrap += got + bonus; storeSave(); setMusic('menu');
      $('res-title').textContent = win ? (newAll ? '신기록' : '완주') : '완주 실패';
      $('res-story').textContent = win ? '기록 ' + fmtT(tNow) + (md ? ' · ' + md + '메달' : '') : failWhy;
      resRows([['코스', mission.name], ['차량', cn], ['기록', win ? fmtT(tNow) : kmNow + ' / ' + (mission.n / 1000).toFixed(1) + ' km'], ['메달', win ? (md ? md + '메달' : '없음') : ''], ['이 차 최고', rec.cars[player.car] ? fmtT(rec.cars[player.car]) : '없음'], ['전체 최고', rec.best ? fmtT(rec.best) : '없음']]);
      $('res-reward').textContent = (win ? '고철 ' + got + ' + 완주 100' + (newAll ? ' + 신기록 100' : '') : half) + ' · 보유 ' + N(save.scrap);
    } else {
      var first = save.cleared.indexOf(runMission) < 0, oldT = save.bestT[runMission] || 0, newT = win && mission.goal !== 'time' && (!oldT || tNow < oldT);
      bonus = win ? (first ? 300 : 150) : 0; newRec = newT && !!oldT;
      if (win && first) save.cleared.push(runMission);
      if (win) save.best[runMission] = Math.max(save.best[runMission] || 0, score);
      if (newT) save.bestT[runMission] = tNow;
      save.scrap += got + bonus; storeSave(); setMusic('menu');
      $('res-title').textContent = win ? '미션 완료' : '미션 실패';
      $('res-story').textContent = win ? mission.done : failWhy;
      resRows([['미션', (runMission + 1) + ' ' + mission.name], ['차량', cn], ['시간', fmtT(tNow) + (newT ? (oldT ? ' (신기록)' : '') : (win && oldT && mission.goal !== 'time' ? ' (최고 ' + fmtT(oldT) + ')' : ''))], ['점수', N(score)], ['격파', kills + '대'],
        mission.civLimit ? [(mission.civName || '피난 차량') + ' 충돌', civHits + ' / ' + mission.civLimit] : null, mission.goal === 'collect' ? ['부품 상자', picks + ' / ' + mission.n] : null, mission.goal === 'hunt' ? [mission.targetName || '덤프 수송차', hunts + ' / ' + mission.n] : null,
        mission.goal === 'escort' && allyE ? [mission.allyName + ' 내구', Math.max(0, Math.round(allyE.hp / allyE.cfg.hp * 100)) + '%'] : null]);
      $('res-reward').textContent = (win ? '고철 ' + got + ' + ' + (first ? '첫 완료 보상 ' : '완료 보상 ') + bonus : half) + ' · 보유 ' + N(save.scrap);
      $('res-next').hidden = !(win && runMission < MISSIONS.length - 1);
      $('res-ending').hidden = !(win && mission.ending);
    }
    sfx(snd || (win ? (newRec ? 'record' : 'win') : 'fail'));
  }
  /* basic skill: a small move on a short cooldown, the same for every car of one kind */
  function useBasic() {
    if (!EDU.arms || !live() || player.dead || player.bcd > 0) return;
    var car = CARS[player.car], k = car.basic, i, e, p, px = player.x, dir, id;
    player.bcd = BASICS[k].cd;
    if (k === 'step') {
      dir = keys.r ? 1 : (keys.l ? -1 : (steerWant !== null && Math.abs(steerWant - px) > 0.6 ? (steerWant > px ? 1 : -1) : (laneDanger(clamp(px + 4, minX, maxX), car) <= laneDanger(clamp(px - 4, minX, maxX), car) ? 1 : -1)));
      if (px + dir * 2 > maxX) dir = -1; else if (px + dir * 2 < minX) dir = 1;
      stepT = 0.2; stepDir = dir; player.invuln = Math.max(player.invuln, 0.35); sfx('skid');
      if (steerWant !== null) { steerWant = clamp(steerWant + dir * 4, -9.9, 9.9); for (id in ptrs) if (ptrs[id].zone === 'steer') ptrs[id].base += dir * 4; }
      apWant = clamp(px + dir * 4, minX, maxX); apT = 0.5;
      for (i = 0; i < 5; i++) spawnP('glow', px - dir * 0.6, 0.3, rnd(-1.5, 1.5), -dir * rnd(4, 10), rnd(0.5, 2), veff * 0.7, 0.3, 1.2, 0.2, COL.white, 0.7, 0);
    } else if (k === 'burst') {
      player.boost = Math.max(player.boost, 13); burstT = 1.2; sfx('nitro');
      spawnP('glow', px, 1.0, car.hl, 0, 0, veff * 0.5, 0.4, 4, 10, COL.blue, 0.9, 0);
    } else if (k === 'pulse') {
      spawnRing(px, 0, 24, 0.4, 0, COL.cyan); sfx('zap');
      for (i = ebullets.length - 1; i >= 0; i--) { p = ebullets[i].m.position; if ((p.x - px) * (p.x - px) + p.z * p.z < 576) { ebullets[i].m.visible = false; ebpool.push(ebullets[i]); ebullets.splice(i, 1); } }
    } else if (k === 'bash') {
      sfx('crash'); shake = Math.min(1.2, shake + 0.3);
      for (i = enemies.length - 1; i >= 0; i--) {
        e = enemies[i]; p = e.g.position; if (e.cfg.air || e.cfg.boss) continue;
        if (Math.abs(p.z) > car.hl + e.cfg.hl + 2.5 || Math.abs(p.x - px) > car.hw + e.cfg.hw + 3.4) continue;
        dir = p.x >= px ? 1 : -1;
        for (var q = 0; q < 6; q++) spawnP('glow', (p.x + px) / 2, 0.9, p.z / 2, rnd(-8, 8), rnd(2, 8), rnd(4, 14), 0.3, 0.9, 0.1, COL.spark, 1);
        if (e.cfg.rival) { if (!e.cfg.ally) { e.stun = Math.max(e.stun, 0.9); e.wantX = clamp(e.x + dir * 4, -6, 6); e.x = clamp(e.x + dir * 1.2, -9.5, 9.5); } continue; }
        e.x0 = clamp(e.x0 + dir * 3.2, -9.6, 9.6); if (e.chase) e.chase = 3;
        if (!e.cfg.civ) hitEnemy(i, 5, p.x, e.cfg.y, p.z);
      }
      both(function (sd) { spawnRing(px + sd * (car.hw + 1.2), 0, 4, 0.3, 0, COL.white); });
    } else if (k === 'horn') {
      hornT = 1.8; sfx('horn'); spawnRing(px, -6, 22, 0.5, -30, COL.white);
      for (i = 0; i < enemies.length; i++) {
        e = enemies[i]; p = e.g.position;
        if ((e.type === 'bike' || e.type === 'buggy') && p.z < -3 && p.z > -50 && Math.abs(p.x - px) < 3.2) e.x0 = clamp(e.x0 + (p.x >= px ? 3.6 : -3.6), -6.8, 6.8);
      }
    }
  }
  function useSkill() {
    if (!EDU.arms || !live() || player.dead || player.cd > 0) return;
    var car = CARS[player.car], i, e, k = car.skill, pw = 1 + 0.25 * power;
    player.cd = car.cd; sfx('skill');
    if (mode === 'demo') say('고유 기술 ' + car.skillName + ': ' + car.skillDesc + '.', 3.2);
    if (k === 'dash') { player.invuln = 1.2; player.boost = 20; player.guard = false; }
    else if (k === 'charge') { player.invuln = 1.6; player.boost = 24; player.guard = false; }
    else if (k === 'shield') { player.invuln = car.shieldT; player.guard = true; spawnRing(player.x, 0, 14, 0.5, 0, COL.blue); }
    else if (k === 'salvo') { salvoN = car.salvo; salvoT = 0; }
    else if (k === 'overdrive') { overT = car.overT; spawnP('glow', player.x, 1.4, 0, 0, 0, 0, 0.5, 5, 16, COL.cyan, 0.9, 0); }
    else if (k === 'auto') { autoT = 4; apT = 0; spawnRing(player.x, 0, 10, 0.5, 0, COL.cyan); }
    else if (k === 'nitro') { sfx('nitro'); buff.nitro = 10; spawnP('glow', player.x, 1.2, car.hl, 0, 0, veff * 0.5, 0.5, 5, 14, COL.blue, 0.9, 0); }
    else if (k === 'siren') { sirenT = 6; sfx('siren'); spawnRing(player.x, 0, 30, 0.6, 0, COL.blue); }
    else if (k === 'heal') { sfx('heal'); player.hp = Math.min(car.hp, player.hp + 60); spawnRing(player.x, 0, 8, 0.5, 0, COL.white); spawnP('glow', player.x, 1.6, 0, 0, 0, 0, 0.5, 5, 13, COL.white, 0.9, 0); }
    else if (k === 'barrage') {
      for (i = -5; i <= 5; i++) fireBullet(player.x + i * 0.14, 1.1, -car.hl, 'shell', i * 7, pw);
      muzzle.material.opacity = 1; muzzle.position.set(0, 1.1, -car.hl - 0.2); muzzle.scale.set(8, 3.4, 1);
      shake = Math.min(1.2, shake + 0.5); sfx('boom', 1.4);
    } else if (k === 'emp') {
      spawnRing(player.x, 0, 46, 0.55, 0, COL.cyan);
      spawnP('glow', player.x, 2, 0, 0, 0, 0, 0.4, 6, 26, COL.cyan, 0.9, 0);
      v3.set(player.x, 2.12, -0.4);
      for (i = enemies.length - 1; i >= 0; i--) if (enemies[i].cfg.air) {
        v3b.set(enemies[i].g.position.x, 4.6, enemies[i].g.position.z); zap(v3, v3b); killEnemy(i);
      }
      clearEnemyBullets(); sfx('zap');
      shake = Math.min(1.2, shake + 0.4);
    } else {
      for (i = 0; i < 3; i++) spawnRing(player.x, -3 - i * 9, 9 + i * 5, 0.45 + i * 0.08, -40, COL.cyan);
      spawnP('glow', player.x, 1.4, -6, 0, 0, -30, 0.45, 8, 30, COL.white, 0.8, 0);
      for (i = enemies.length - 1; i >= 0; i--) {
        e = enemies[i];
        if (e.cfg.civ || e.g.position.z > 3 || e.g.position.z < -46 || Math.abs(e.g.position.x - player.x) > 5.5) continue;
        hitEnemy(i, 14, e.g.position.x, e.cfg.y, e.g.position.z);
      }
      clearEnemyBullets();
      shake = Math.min(1.2, shake + 0.6);
    }
  }

  /* ---------- weapons: every mounted weapon fires on its own timer from its own slot ---------- */
  function flashAt(x, y, z, sx, sy) { muzzle.material.opacity = 1; muzzle.position.set(x, y, z); muzzle.scale.set(sx, sy, 1); }
  function boltChain(x, y, z, pw, loud) {
    var chain = [], from = v3.set(x, y, z), lastX = x, lastZ = z, i, k, e;
    for (k = 0; k < 3; k++) {
      var bestE = null, bestD = k === 0 ? 46 : 11;
      for (i = 0; i < enemies.length; i++) {
        e = enemies[i];
        if (e.cfg.civ || chain.indexOf(e) >= 0 || e.g.position.z > 4) continue;
        var ddx = e.g.position.x - lastX, ddz = e.g.position.z - lastZ, dd = Math.sqrt(ddx * ddx + ddz * ddz);
        if (dd < bestD) { bestD = dd; bestE = e; }
      }
      if (!bestE) break;
      chain.push(bestE); lastX = bestE.g.position.x; lastZ = bestE.g.position.z;
    }
    for (k = 0; k < chain.length; k++) {
      e = chain[k]; v3b.set(e.g.position.x, e.cfg.y + 0.3, e.g.position.z);
      zap(from, v3b); from = v3.copy(v3b);
      i = enemies.indexOf(e); if (i >= 0) hitEnemy(i, (k === 0 ? 2 : 1) * pw, v3b.x, v3b.y, v3b.z);
    }
    if (!chain.length && crate.active && crate.g.position.z < -3 && crate.g.position.z > -36 && Math.abs(crate.g.position.x - x) < 5) {
      v3b.set(crate.g.position.x, 1.3, crate.g.position.z); zap(from, v3b); crateHit(2); chain.push(crate);
    }
    if (chain.length && loud) sfx('zap');
  }
  function fireGun(g, dt, px, car, pw, loud) {
    g.t -= dt; if (g.t > 0) return;
    var a = g.a, y = a[1], z = -a[2], i, k, e;
    pw *= g.mul || 1;
    if (g.w === 'mg') {
      g.t = 0.085 / car.mgRate; g.side = -g.side;
      fireBullet(px + a[0] + g.side * 0.11, y + 0.22, z - 1.2, 'bullet', 0, pw);
      k = rnd(1.6, 2.6); flashAt(a[0] + g.side * 0.11, y + 0.22, z - 1.25, k, k);
      if (g.side > 0) spawnCasing(px + a[0] + 0.2, y + 0.25, z - 0.2, 1);
      if (loud) sfx('shot');
    } else if (g.w === 'laser') {
      g.t = 0.16; fireBullet(px + a[0], y + 0.13, z - 0.7, 'laser', 0, pw);
      if (loud) sfx('laser');
    } else if (g.w === 'bolt') {
      g.t = 0.26; boltChain(px + a[0], y + 0.5, z, pw, loud);
    } else if (g.w === 'shotgun') {
      g.t = 0.3;
      for (k = -2; k <= 2; k++) fireBullet(px + a[0] + k * 0.1, y + 0.1, z - 0.75, 'pellet', k * 9, pw);
      flashAt(a[0], y + 0.1, z - 0.85, 3.4, 2.4); spawnCasing(px + a[0] + 0.3, y + 0.15, z, 1, true);
      if (loud) sfx('shell');
    } else if (g.w === 'flame') {
      g.t = 0.06;
      for (k = 0; k < 2; k++) spawnP('glow', px + a[0] + rnd(-0.15, 0.15), y + 0.17, z - 1, rnd(-3, 3), rnd(0, 2.5), -rnd(26, 44), rnd(0.28, 0.42), 0.8, rnd(2.6, 3.8), k ? COL.fire : COL.fire2, 0.9, 0.15);
      for (i = enemies.length - 1; i >= 0; i--) {
        e = enemies[i]; if (e.cfg.civ || e.cfg.air) continue;
        var fz = z - e.g.position.z - e.cfg.hl;
        if (fz > -e.cfg.hl * 2 && fz < 15 && Math.abs(e.g.position.x - px - a[0]) < e.cfg.hw + 0.7 + Math.max(0, fz) * 0.12) hitEnemy(i, 0.7 * pw, e.g.position.x, e.cfg.y, e.g.position.z + e.cfg.hl);
      }
      if (loud) sfx('flame');
    } else if (g.w === 'water') {
      g.t = 0.12; fireBullet(px + a[0], y + 0.3, z - 1.0, 'water', 0, pw);
      if (loud) sfx('water');
    } else if (g.w === 'cannon') {
      g.t = 0.42; fireBullet(px - a[0], y + 0.03, z - 1.8, 'shell', 0, pw); fireBullet(px + a[0], y + 0.03, z - 1.8, 'shell', 0, pw);
      flashAt(0, y + 0.03, z - 1.9, 5, 2.6); shake = Math.min(1.2, shake + 0.06); spawnCasing(px - a[0] - 0.2, y + 0.1, z, -1, true); spawnCasing(px + a[0] + 0.2, y + 0.1, z, 1, true);
      if (loud) sfx('shell');
    } else if (g.w === 'missile') {
      if (!pickTarget()) { g.t = 0.2; return; }
      g.t = 2.2;
      (g.kind === 'side' ? [-a[0], a[0]] : [a[0] - 0.17, a[0] + 0.17]).forEach(function (x, n) {
        var m = fireMissile(px + x, y + 0.45, z, n ? 1 : -1, pw);
        if (!n && mode === 'demo' && tr.phase === 'play' && eventCd <= 0) { trackM = m; cutTo('missile'); eventCd = 10; }
      });
      if (loud) sfx('missile');
    } else if (g.w === 'mine') {
      k = false;
      for (i = 0; i < enemies.length; i++) { e = enemies[i]; if (!e.cfg.civ && !e.cfg.air && e.g.position.z < -8 && e.g.position.z > -70) { k = true; break; } }
      if (!k) { g.t = 0.3; return; }
      g.t = 3; throwMine(px + a[0], y + 0.3, z, pw);
    }
  }

  /* ---------- input: left hand moves up and down for speed, steering is left and right ---------- */
  var keys = { l: false, r: false, u: false, d: false, f: false }, fireBtn = false, padFire = false, leverTouch = false, finePtr = !!(window.matchMedia && window.matchMedia('(pointer: fine)').matches), ptrs = {}, padSkill = false, padCam = false;
  /* letter keys are matched by their position on the keyboard (e.code) as well, so that they still work while the Korean input mode is on */
  function isKey(e, code, ch) { return e.code === code || e.key === ch || e.key === ch.toUpperCase(); }
  function keySet(e, on) {
    var k = e.key;
    if (k === 'ArrowLeft' || isKey(e, 'KeyA', 'a')) keys.l = on;
    else if (k === 'ArrowRight' || isKey(e, 'KeyD', 'd')) keys.r = on;
    else if (k === 'ArrowUp' || isKey(e, 'KeyW', 'w')) keys.u = on;
    else if (k === 'ArrowDown' || isKey(e, 'KeyS', 's')) keys.d = on;
    else if (isKey(e, 'KeyZ', 'z') || isKey(e, 'KeyJ', 'j')) keys.f = on;   /* attack: held */
    else return false;
    return true;
  }
  /* view: top-down chase, low chase, or the driver's seat. The choice is kept with the save */
  function setCam(m, chosen) {
    save.cam = m; if (chosen) save.camV = 2; storeSave(); shotCut = true;
    $('btn-cam').textContent = CAM_SHORT[m]; $('btn-cam').setAttribute('aria-label', '시점 바꾸기. 지금은 ' + CAM_LABEL[m]); $('opt-cam').value = m;
  }
  function cycleCam() { setCam(CAM_ORDER[(CAM_ORDER.indexOf(save.cam) + 1) % CAM_ORDER.length], true); sfx('click'); }
  function toggleMute(m) { save.muted = m; setMuted(m); storeSave(); syncSound(); }
  function syncSound() { var on = save.sfx && !save.muted, mu = save.music && !save.muted; $('opt-sound').checked = on; $('pz-sound').checked = on; $('opt-music').checked = mu; $('pz-music').checked = mu; }
  function setSfx(on) { if (on && save.muted) { save.muted = false; setMuted(false); } save.sfx = on; sfxOn = on; storeSave(); syncSound(); }
  function setMus(on) { if (on && save.muted) { save.muted = false; setMuted(false); } save.music = on; musicOn = on; storeSave(); syncSound(); }
  function openHelp(then) { helpThen = then || null; $('help').hidden = false; $('help-close').focus(); }
  function closeHelp() { $('help').hidden = true; var f = helpThen; helpThen = null; if (f) f(); }
  /* in-play buttons act on press, not on click: a tap made while another finger is already holding the lever never becomes a click */
  function tap(el, fn) {
    el.addEventListener('pointerdown', function (e) { if (e.button > 0) return; if (e.pointerType === 'touch') touchUI = true; e.preventDefault(); fn(); });
    el.addEventListener('click', function (e) { if (e.detail === 0) fn(); });
  }
  function thrHeld() { if (leverDown && leverTouch) return true; for (var id in ptrs) if (ptrs[id].zone === 'thr' && ptrs[id].touch) return true; return false; }
  window.addEventListener('pointerdown', audioInit, true);
  window.addEventListener('touchend', audioInit, true); window.addEventListener('click', audioInit, true);   /* iOS only lets sound start from the end of a touch or a click */
  window.addEventListener('keydown', audioInit, true);
  window.addEventListener('keydown', function (e) {
    if (isKey(e, 'KeyM', 'm')) { toggleMute(!save.muted); return; }
    if (e.key === 'Escape' && !$('help').hidden) { closeHelp(); return; }
    if (e.key === 'Escape' && !$('info').hidden) { closeInfo(); return; }
    if (mode === 'demo') { if (e.key === 'Escape') endTrailer(); return; }
    if (mode !== 'play') return;
    if (e.key === 'Escape' || isKey(e, 'KeyP', 'p')) { setPaused(!paused); return; }
    if (isKey(e, 'KeyC', 'c') || isKey(e, 'KeyV', 'v')) { cycleCam(); return; }
    if (paused) return;
    if (keySet(e, true)) e.preventDefault();
    else if (e.key === ' ' || e.code === 'Space' || e.key === 'Shift') { if (!e.repeat) useSkill(); e.preventDefault(); }
    else if (isKey(e, 'KeyX', 'x') || isKey(e, 'KeyE', 'e') || isKey(e, 'KeyF', 'f')) { if (!e.repeat) useBasic(); e.preventDefault(); }
  });
  window.addEventListener('keyup', function (e) { keySet(e, false); });
  window.addEventListener('blur', function () { keys.l = keys.r = keys.u = keys.d = keys.f = false; fireBtn = false; });   /* a key released while another window has the focus would otherwise stay down */
  cv.addEventListener('pointerdown', function (e) {
    if (mode !== 'play' || paused) return;
    var zone = e.clientX < window.innerWidth * 0.38 ? 'thr' : 'steer';
    ptrs[e.pointerId] = { zone: zone, touch: e.pointerType !== 'mouse', x0: e.clientX, y0: e.clientY, base: zone === 'thr' ? player.thr : player.x };
    try { cv.setPointerCapture(e.pointerId); } catch (err) {}
  });
  cv.addEventListener('pointermove', function (e) {
    var p = ptrs[e.pointerId]; if (!p) return;
    if (p.zone === 'thr') player.thr = clamp(p.base - (e.clientY - p.y0) / 220, 0, 1);
    else steerWant = clamp(p.base + (e.clientX - p.x0) * (20 / window.innerWidth) * 1.6, -9.9, 9.9);
  });
  function ptrEnd(e) { var p = ptrs[e.pointerId]; if (p && p.zone === 'steer') steerWant = null; delete ptrs[e.pointerId]; }
  cv.addEventListener('pointerup', ptrEnd); cv.addEventListener('pointercancel', ptrEnd);
  (function () {
    var lever = $('lever'), track = $('lever-track');
    function setFrom(e) { var r = track.getBoundingClientRect(); player.thr = clamp(1 - (e.clientY - r.top) / r.height, 0, 1); }
    lever.addEventListener('pointerdown', function (e) { leverDown = true; leverTouch = e.pointerType !== 'mouse'; setFrom(e); try { lever.setPointerCapture(e.pointerId); } catch (err) {} e.preventDefault(); });
    lever.addEventListener('pointermove', function (e) { if (leverDown) setFrom(e); });
    ['pointerup', 'pointercancel'].forEach(function (ev) { lever.addEventListener(ev, function () { leverDown = false; }); });
    lever.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp') { player.thr = clamp(player.thr + 0.1, 0, 1); e.preventDefault(); e.stopPropagation(); }
      if (e.key === 'ArrowDown') { player.thr = clamp(player.thr - 0.1, 0, 1); e.preventDefault(); e.stopPropagation(); }
    });
  })();
  function pollPad(dt) {
    var pads = null;
    try { pads = navigator.getGamepads ? navigator.getGamepads() : null; } catch (err) { pads = null; }
    padThr = false; padFire = false;
    if (!pads) return 0;
    for (var i = 0; i < pads.length; i++) {
      var g = pads[i]; if (!g || !g.axes || g.axes.length < 2) continue;
      var ax = Math.abs(g.axes[0]) > 0.15 ? g.axes[0] : 0, ay = Math.abs(g.axes[1]) > 0.15 ? g.axes[1] : 0;
      player.thr = clamp(player.thr - ay * 0.7 * dt, 0, 1); padThr = ay !== 0;
      padFire = !!(g.buttons && ((g.buttons[5] && g.buttons[5].pressed) || (g.buttons[7] && (g.buttons[7].pressed || g.buttons[7].value > 0.3))));   /* RB or RT: attack */
      var pressed = !!(g.buttons && ((g.buttons[0] && g.buttons[0].pressed) || (g.buttons[1] && g.buttons[1].pressed)));
      if (pressed && !padSkill) useSkill();
      padSkill = pressed;
      var padX2 = !!(g.buttons && g.buttons[2] && g.buttons[2].pressed);
      if (padX2 && !padBasic) useBasic();
      padBasic = padX2;
      var padY = !!(g.buttons && g.buttons[3] && g.buttons[3].pressed);
      if (padY && !padCam) cycleCam();
      padCam = padY;
      return ax;
    }
    return 0;
  }
  /* the Start button pauses and resumes; it is read every frame because the game loop itself stops while paused */
  function padStart() {
    var pads = null, down = false;
    try { pads = navigator.getGamepads ? navigator.getGamepads() : null; } catch (err) { pads = null; }
    if (pads) for (var i = 0; i < pads.length; i++) { var g = pads[i]; if (g && g.buttons && g.buttons[9] && g.buttons[9].pressed) down = true; }
    if (down && !padStartHeld && mode === 'play') setPaused(!paused);
    padStartHeld = down;
  }
  /* iOS starts its own word-selection gesture on a second tap at the same spot: a see-through oval lens and a copy bubble appear over the game even where text cannot be selected. Only cancelling the touch at its start stops that, so
     - on the 3D view and the in-play HUD every touch is cancelled (both are driven by pointer events, which still arrive);
     - elsewhere only a second tap next to the first one is cancelled, and the click it would have made is sent by hand so that quick repeated presses on a button still count. Scrolling a list is never a tap, so it is left alone. */
  var tapLast = { t: -1e9, x: 0, y: 0, el: null }, tapDown = null, tapOwn = null, tapStat = { cancelled: 0, sent: 0 };
  function nativeCtl(t) { return !!(t && t.closest && t.closest('select, input, textarea, label')); }
  document.addEventListener('touchstart', function (e) {
    var t = e.target, p = e.changedTouches[0], now = e.timeStamp;   /* the time of the touch itself: on a busy frame the handler runs late */
    tapDown = { id: p.identifier, x: p.clientX, y: p.clientY, t: now, el: t }; tapOwn = null;
    var press = t === cv || !!(t.closest && t.closest('.hud, #coach, #caption, #card')), game = press || !!(t.closest && t.closest('#demo'));   /* press: parts that act on pointer-down and never need a click */
    var again = now - tapLast.t < 400 && Math.abs(p.clientX - tapLast.x) < 44 && Math.abs(p.clientY - tapLast.y) < 44;
    /* the first tap changed the screen and something else now lies under the finger: the second tap must not press it */
    var other = again && !!tapLast.el && t !== tapLast.el && !tapLast.el.contains(t) && !t.contains(tapLast.el);
    if (nativeCtl(t) && !other) return;
    if (!(game || again || e.touches.length > 1)) return;
    if (e.cancelable) { e.preventDefault(); tapStat.cancelled++; }
    if (!press && !other && e.touches.length === 1) tapOwn = tapDown;
  }, { passive: false, capture: true });
  document.addEventListener('touchend', function (e) {
    var p = e.changedTouches[0], d = tapDown, now = e.timeStamp;
    if (!d || d.id !== p.identifier) return;
    var still = Math.abs(p.clientX - d.x) < 12 && Math.abs(p.clientY - d.y) < 12 && now - d.t < 600;
    if (still) tapLast = { t: now, x: p.clientX, y: p.clientY, el: d.el }; else tapLast.t = -1e9;
    if (tapOwn === d && still && d.el && document.body.contains(d.el) && !(d.el.closest && d.el.closest('button:disabled'))) {
      tapStat.sent++;
      d.el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window, detail: 1 }));
    }
    tapDown = null; tapOwn = null;
  }, { passive: false, capture: true });
  document.addEventListener('touchcancel', function () { tapDown = null; tapOwn = null; tapLast.t = -1e9; }, true);
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(function (n) { document.addEventListener(n, function (e) { e.preventDefault(); }, { passive: false }); });
  document.addEventListener('dblclick', function (e) { if (!nativeCtl(e.target)) e.preventDefault(); });
  document.addEventListener('selectstart', function (e) { var t = e.target; if (!(t && t.closest && t.closest('select, input, textarea'))) e.preventDefault(); });
  /* should a selection slip through anyway, drop it at once: the copy bubble goes with it */
  document.addEventListener('selectionchange', function () {
    var s = window.getSelection ? window.getSelection() : null, a = document.activeElement;
    if (s && !s.isCollapsed && !(a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA'))) { try { s.removeAllRanges(); } catch (err) {} }
  });
  document.addEventListener('dragstart', function (e) { e.preventDefault(); });
  document.addEventListener('contextmenu', function (e) { if (!nativeCtl(e.target)) e.preventDefault(); });
  function hit(el, sel) { while (el && el !== document.body) { if (el.hasAttribute && el.hasAttribute(sel)) return el; el = el.parentNode; } return null; }
  tap($('btn-skill'), useSkill); tap($('btn-basic'), useBasic);
  (function () {
    var b = $('btn-fire');
    b.addEventListener('pointerdown', function (e) { if (e.button > 0) return; fireBtn = true; try { b.setPointerCapture(e.pointerId); } catch (err) {} e.preventDefault(); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (n) { b.addEventListener(n, function () { fireBtn = false; }); });
    b.addEventListener('keydown', function (e) { if (e.key === 'Enter') fireBtn = true; });
    b.addEventListener('keyup', function (e) { if (e.key === 'Enter') fireBtn = false; });
  })();
  tap($('btn-exit'), function () { setPaused(true); });
  tap($('btn-cam'), cycleCam);
  cv.addEventListener('pointerdown', function (e) { if (e.pointerType === 'touch') touchUI = true; }, true);
  $('pz-sound').addEventListener('change', function () { setSfx($('pz-sound').checked); });
  $('pz-music').addEventListener('change', function () { setMus($('pz-music').checked); });
  $('pz-cam').addEventListener('click', cycleCam);
  $('pz-help').addEventListener('click', function () { sfx('click'); openHelp(); });
  $('opt-help').addEventListener('click', function () { sfx('click'); openHelp(); });
  $('help-close').addEventListener('click', function () { sfx('click'); closeHelp(); });
  $('opt-gfx').addEventListener('change', function () { save.gfx = $('opt-gfx').value; storeSave(); applyGfx(save.gfx === 'auto' ? gfxStart() : save.gfx); sfx('click'); });
  $('opt-calm').addEventListener('change', function () { save.calm = $('opt-calm').checked; storeSave(); sfx('click'); });
  $('opt-mirror').addEventListener('change', function () { save.mirror = $('opt-mirror').checked; storeSave(); sfx('click'); });
  $('opt-cam').addEventListener('change', function () { setCam($('opt-cam').value, true); sfx('click'); });
  $('demo-exit').addEventListener('click', endTrailer);
  $('pause-resume').addEventListener('click', function () { setPaused(false); });
  $('pause-retry').addEventListener('click', rerun);
  $('pause-menu').addEventListener('click', toMenu);
  $('res-ending').addEventListener('click', showEnding);
  $('ending-title').addEventListener('click', showTitle);
  $('ending-menu').addEventListener('click', toMenu);
  $('title-start').addEventListener('click', function () { sfx('click'); toMenu(); });
  $('title-tut').addEventListener('click', function () { sfx('click'); openStory(); });
  $('opt-story').addEventListener('click', function () { sfx('click'); openStory(); });
  $('story-next').addEventListener('click', storyNext); $('story-skip').addEventListener('click', storySkip);
  tap($('coach-skip'), function () { sfx('click'); tutDone(true); });
  $('title-trailer').addEventListener('click', function () { sfx('click'); startTrailer(); });
  $('opt-title').addEventListener('click', showTitle);
  $('opt-music').addEventListener('change', function () { setMus($('opt-music').checked); });
  $('go').addEventListener('click', function () {
    sfx('click');
    if (!save.help && carOpen(selCar) && !(selKind === 'mis' && !missionOpen(selMission))) { save.help = true; storeSave(); openHelp(startPlay); } else startPlay();   /* the first run opens the controls once */
  });
  $('demo-go').addEventListener('click', function () { sfx('click'); startTrailer(); });
  $('res-retry').addEventListener('click', rerun);
  $('res-next').addEventListener('click', function () { selMission = Math.min(MISSIONS.length - 1, runMission + 1); beginRun(selCar, selMission, false, undefined, 'mis', true); });
  $('res-menu').addEventListener('click', toMenu);
  $('car-grid').addEventListener('click', function (e) {
    var bb = hit(e.target, 'data-buy-car');
    if (bb) {
      var c = CARS[selCar]; if (carOpen(selCar) || save.scrap < c.price) return;
      save.scrap -= c.price; save.cars[selCar] = true; grantStock(); storeSave(); sfx('buy'); renderMenu(); return;
    }
    var b = hit(e.target, 'data-car'); if (!b) return;
    selCar = b.getAttribute('data-car'); setCar(selCar, loadoutOf(selCar)); sfx('click'); renderMenu();
    var el = $('car-' + selCar); if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  });
  $('ta-list').addEventListener('click', function (e) {
    var b = hit(e.target, 'data-track'); if (!b) return;
    selTrack = +b.getAttribute('data-track'); selKind = 'ta'; sfx('click'); pickCourse(); renderTA(); renderRace(); renderFoot();
  });
  $('race-list').addEventListener('click', function (e) {
    var b = hit(e.target, 'data-rtrack'); if (!b) return;
    selTrack = +b.getAttribute('data-rtrack'); selKind = 'race'; sfx('click'); pickCourse(); renderTA(); renderRace(); renderFoot();
  });
  $('kinds').addEventListener('click', function (e) { var b = hit(e.target, 'data-kind'); if (!b) return; sfx('click'); setKind(b.getAttribute('data-kind')); });
  $('title-kinds').addEventListener('click', function (e) { var b = hit(e.target, 'data-kind'); if (!b) return; sfx('click'); selKind = b.getAttribute('data-kind'); toMenu(); setTab('mode'); });
  ['region', 'time', 'weather'].forEach(function (k) {
    $('opt-' + k).addEventListener('change', function () { cond[k] = $('opt-' + k).value; sfx('click'); pickCourse(); renderCond(); renderFoot(); });
  });
  (function () {
    var h = '';
    REGION_ORDER.forEach(function (k) { h += '<option value="' + k + '">' + REGIONS[k].name + '</option>'; }); $('opt-region').innerHTML = h; h = '';
    WEATHER_ORDER.forEach(function (k) { h += '<option value="' + k + '">' + WEATHERS[k].name + '</option>'; }); $('opt-weather').innerHTML = h; h = '';
    KIND_ORDER.forEach(function (k) { h += '<button type="button" class="kind" data-kind="' + k + '"><b>' + KINDS[k].name + '</b><span>' + (k === 'mis' ? '이야기를 따라가는 ' + MISSIONS.length + '개 미션' : KINDS[k].sub) + '</span></button>'; });
    $('title-kinds').innerHTML = h;
  })();
  function infoClick(e) { var b = hit(e.target, 'data-info'); if (b) { sfx('click'); openInfo(b.getAttribute('data-info')); } }
  $('slots').addEventListener('click', infoClick); $('supply').addEventListener('click', infoClick);
  $('info-close').addEventListener('click', function () { sfx('click'); closeInfo(); });
  $('info-act').addEventListener('click', function () { buyArm($('info-act').getAttribute('data-arm')); });
  function fitTire(k) { if (!tireOwned(k)) return; save.tire[selCar] = k; storeSave(); var keepX = player.x; setCar(selCar, loadoutOf(selCar)); player.x = keepX; sfx('click'); renderGear(); renderGrid(); }
  function buyTire(k) {
    var t = TIRES[k]; if (!t || save.tires[k] || save.scrap < t.price) return;
    save.scrap -= t.price; save.tires[k] = 1; save.tire[selCar] = k; storeSave(); sfx('buy');
    var keepX = player.x; setCar(selCar, loadoutOf(selCar)); player.x = keepX; renderMenu();
  }
  function buyArm(w) {
    if (w.slice(0, 2) === 't:') { buyTire(w.slice(2)); return; }
    var lv = save.weapons[w] || 0, price = lv === 0 ? W_PRICE[w] : UP_PRICE[lv];
    if (lv >= 3 || save.scrap < price) return;
    save.scrap -= price; save.weapons[w] = lv + 1; storeSave(); sfx('buy');
    var keepX = player.x; setCar(selCar, loadoutOf(selCar)); player.x = keepX; renderMenu();
  }
  $('armory').addEventListener('click', function (e) {
    infoClick(e);
    var b = hit(e.target, 'data-arm'); if (!b) return;
    buyArm(b.getAttribute('data-arm'));
  });
  $('mis-list').addEventListener('click', function (e) {
    var b = hit(e.target, 'data-mission'); if (!b) return;
    selMission = +b.getAttribute('data-mission'); selKind = 'mis'; sfx('click'); pickCourse(); renderMissions(); renderFoot();
  });
  $('tires').addEventListener('click', function (e) {
    infoClick(e);
    var b = hit(e.target, 'data-tirebuy'); if (b) { buyTire(b.getAttribute('data-tirebuy')); return; }
    b = hit(e.target, 'data-fit'); if (b) fitTire(b.getAttribute('data-fit'));
  });
  $('slots').addEventListener('change', function (e) {
    if (e.target.getAttribute('data-tire')) { fitTire(e.target.value); return; }
    var s = e.target.getAttribute('data-slot'); if (!s) return;
    var lo = loadoutOf(selCar); lo[s] = e.target.value || null; storeSave();
    var keepX = player.x; setCar(selCar, loadoutOf(selCar)); player.x = keepX; sfx('click'); renderGear(); renderGrid();
  });
  ['car', 'gear', 'mode', 'set'].forEach(function (t) { $('tab-' + t).addEventListener('click', function () { sfx('click'); setTab(t); }); });
  $('opt-sound').addEventListener('change', function () { setSfx($('opt-sound').checked); sfx('click'); });
  $('opt-unlock').addEventListener('change', function () { save.unlockAll = $('opt-unlock').checked; storeSave(); renderMenu(); });
  $('opt-reset').addEventListener('click', function () {
    save.scrap = 500; save.cars = { laser: true }; save.cleared = []; save.loadouts = {}; save.best = {}; save.bestT = {}; save.ta = {}; save.race = {}; save.surv = {}; save.tires = { allseason: 1 }; save.tire = {}; save.weapons = { mg: 1 }; save.unlockAll = false; grantStock(); storeSave();
    $('opt-unlock').checked = false; selCar = 'laser'; selMission = 0; selTrack = 0; selKind = 'free'; toMenu(); setTab('car');
  });

  /* ---------- camera and resize ---------- */
  var camBase = new T.Vector3(0, 16, 14);
  var camPos = new T.Vector3(0, 16, 14), camTgt = new T.Vector3(0, 0, -10), wantP = new T.Vector3(), wantT = new T.Vector3(), trackPos = new T.Vector3();
  var camFov = 55, baseFov = 55, offX = 0, offY = 0, vw = 1, vh = 1;
  function resize() {
    vw = window.innerWidth; vh = window.innerHeight;
    renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh;
    var need = 2 * Math.atan(Math.tan(T.MathUtils.degToRad(31)) / camera.aspect) * 180 / Math.PI;
    baseFov = clamp(Math.max(55, need), 55, 96);
  }
  window.addEventListener('resize', resize); resize();
  var SHOT_ORDER = ['chase', 'low', 'side', 'cockpit', 'chase', 'front', 'wheel', 'aerial', 'orbit'];
  var SHOT_DUR = { cockpit: 4, chase: 6, low: 4, side: 4, front: 3.5, wheel: 3, aerial: 4.5, orbit: 5, impact: 2.6, establish: 9, missile: 2.6, bomber: 2.2 };
  function shotPose(name, t, px, car, pull) {
    var tall = vw < vh ? 1.4 : 1, ang, R;
    if (name === 'cockpit') {
      var ey = 0.55 + car.spec.H * 0.42, sx = px - car.W * 0.19, sz = -(car.seatF || 0);
      wantP.set(sx, ey, sz); wantT.set(sx + player.vx * 0.3, ey - 1.5, sz - 30);
      return clamp(baseFov * 1.15, 64, 98);
    }
    if (name === 'low') { wantP.set(px + shotSide * 2.6, 2.1, 8.5 + car.hl - t * 0.15); wantT.set(px, 1.0, -16); return Math.min(92, 60 * tall); }
    if (name === 'side') { wantP.set(px + shotSide * (9.5 + car.hl * 0.5 - t * 0.25), 2.6, -4 - t * 0.6); wantT.set(px, 1.0, -1.5); return Math.min(92, 46 * tall); }
    if (name === 'front') { wantP.set(px + shotSide * 3.2, 1.7, -11 - car.hl + t * 0.5); wantT.set(px, 1.1, 1); return Math.min(92, 52 * tall); }
    if (name === 'aerial') { wantP.set(px * 0.3, 38, 7); wantT.set(px * 0.3, 0, -9); return Math.min(92, 52 * tall); }
    if (name === 'impact') { wantP.set(impact.x + shotSide * 9, 3.4, impact.z + 10); wantT.set(impact.x, 1.2, impact.z); return Math.min(92, 48 * tall); }
    if (name === 'orbit') { ang = shotSide * (0.75 + t * 0.42); R = 6 + car.hl * 1.8; wantP.set(px + Math.sin(ang) * R, 2.3 + car.hl * 0.4, Math.cos(ang) * R); wantT.set(px, 0.8 + car.hl * 0.12, 0); return Math.min(92, 44 * tall); }
    if (name === 'wheel') { wantP.set(px + shotSide * (car.hw + 1.6), 0.7, car.hl + 2.4 - t * 0.2); wantT.set(px + shotSide * 0.3, 0.9, -car.hl - 8); return Math.min(96, 62 * tall); }
    if (name === 'establish') { wantP.set(shotSide * 10.5, 8.5 - t * 0.25, -46 + t * 3.5); wantT.set(px * 0.6, 1, -2); return Math.min(92, 40 * tall); }
    if (name === 'missile') { wantP.set(trackPos.x + shotSide * 1.8, trackPos.y + 1.3, trackPos.z + 6); wantT.set(trackPos.x, trackPos.y - 0.4, trackPos.z - 12); return Math.min(96, 58 * tall); }
    if (name === 'bomber') { wantP.set(plane.position.x + shotSide * 3.6, 19, plane.position.z + 13); wantT.set(plane.position.x, 5, plane.position.z - 30); return Math.min(96, 58 * tall); }
    if (name === 'select') { wantP.set(px * 0.7, 6.4 + car.hl * 0.9, 9 + car.hl * 2.3); wantT.set(px * 0.85, 0.6, -5 - car.hl); return clamp(baseFov * 0.9, 50, 92); }
    R = Math.max(0, car.hl - 2.6);
    if ((tunCam || lowCam) && name !== 'select') {
      var sv = splitVal(dist), away = liftU.value > 0.5 ? (sv > 0 ? 1 : -1) * Math.min(1.6, liftU.value * 0.4) : 0;   /* beside a deck, keep the camera clear of its edge */
      wantP.set(px * 0.85 + away, 4.3 + R * 0.5, 10.5 + car.hl * 1.5 + R); wantT.set(px * 0.9 + away * 0.3, 1.2, -18); return clamp(baseFov * 0.92, 50, 92);
    }
    wantP.set(camBase.x + px * 0.38, camBase.y + pull * 0.4 + R * 0.9, camBase.z + pull + R * 1.3); wantT.set(px * 0.5, 0, -10 + R * 0.4); return baseFov;
  }

  /* ---------- spawning ---------- */
  function openLanes(d) { var o = LANES.filter(function (x) { return laneOpen(x, d); }); return o.length ? o : LANES; }
  function ews(type) { return Math.min(TYPES[type].ws * (region.fast || 1), Math.max(11, CARS[player.car].vmax * 0.5)); }
  function spawnForward() {
    var r = Math.random(), lane = pick(openLanes(dist + 128)), z = -128, t = TYPES;
    if (allyE && !allyE.fin) {   /* escort: most of what comes down the road comes at the escorted vehicle */
      if (Math.random() < 0.45) { var al = L4.reduce(function (a, c) { return Math.abs(c - allyE.x) < Math.abs(a - allyE.x) ? c : a; }); if (laneOpen(al, dist - z)) lane = al; }
    }
    if (r > 0.94 && !mission.rivals && !allyE && mission.goal !== 'boss' && (region.key === 'city' || region.key === 'coast')) { spawnEnemy('civ', lane, z, ews('civ')); return; }   /* now and then a civilian car is still on the road */
    var hasDump = enemies.some(function (e) { return e.type === 'dump'; });
    if (r < 0.42) { for (var i = 0; i < 3; i++) spawnEnemy('bike', clamp(lane + rnd(-1.2, 1.2), -6.8, 6.8), z - i * 4.5, ews('bike')); }
    else if (mission.buggy && r < 0.57) spawnEnemy('buggy', lane, z, ews('buggy'));
    else if (r < 0.9 || hasDump || mission.goal === 'boss') spawnEnemy('sedan', lane, z, ews('sedan'));
    else spawnEnemy('dump', lane * 0.6, z - 6, ews('dump'));
  }
  function spawnRow() {
    var used = [], n = Math.random() < 0.3 ? 2 : 1, open = openLanes(dist + 135);
    for (var i = 0; i < n; i++) {
      var lane = pick(open); if (used.indexOf(lane) >= 0) continue; used.push(lane);
      var type = Math.random() < mission.civ ? 'civ' : (mission.buggy && Math.random() < 0.2 ? 'buggy' : (Math.random() < 0.6 ? 'sedan' : 'bike'));
      spawnEnemy(type, lane, -135 - i * 9, -TYPES[type].rs);
    }
  }
  function spawner(dt) {
    var agg = aggK();
    if (mission.goal === 'tut') return;   /* driving practice: only what the lesson itself puts on the road */
    if (mission.farm) {
      /* country roads: a walking tractor now and then, far slower than everything else */
      farmT -= dt * Math.max(0.75, veff / 38);
      if (farmT <= 0) { farmT = rnd(5, 9) / mission.farm; var fl = pick(region.civLanes || LANES); if (laneOpen(fl, dist + 128) && enemies.length < 16) spawnEnemy('tractor', fl, -128, mission.dir > 0 ? TYPES.tractor.ws : -TYPES.tractor.rs); }
    }
    if (mission.goal === 'free') {
      spawnT -= dt * Math.max(0.75, veff / 38);
      if (spawnT <= 0) { spawnT = rnd(2.2, 4); var cl = pick((region.civLanes || LANES).filter(function (x) { return laneOpen(x, dist + 128); })); if (cl !== undefined && enemies.length < 8) spawnEnemy('civ', cl, -128, ews('civ')); }
    } else if (mission.dir > 0) {
      spawnT -= dt * Math.max(0.75, veff / 38);
      if (spawnT <= 0) { spawnT = rnd(0.8, 1.4) * (mission.goal === 'boss' ? 2.2 : (mission.goal === 'time' ? 1.6 : (mission.traffic || 1))); if (enemies.length < 14) spawnForward(); }
    } else if (dist >= nextRowDist) { nextRowDist = dist + rnd(26, 42); if (enemies.length < 16) spawnRow(); }
    var roofed = inTunnel(dist + 20) || inTunnel(dist + 115);   /* nothing can fly into an underground road */
    if (mission.drones > 0 && !roofed && jamT <= 0) {
      droneT -= dt;
      if (droneT <= 0) {
        droneT = rnd(6, 9) / mission.drones;
        var nd = 0; for (var i = 0; i < enemies.length; i++) if (enemies[i].type === 'drone') nd++;
        if (nd < 3) spawnEnemy('drone', pick(LANES), -125, 0);
      }
    }
    if (mission.kami > 0 && !roofed && jamT <= 0) {
      kamiT -= dt;
      if (kamiT <= 0) { kamiT = rnd(7, 11) / mission.kami; spawnEnemy('kami', clamp(player.x + rnd(-4, 4), -6.5, 6.5), -125, 0); }
    }
    if (mission.strike > 0 && !roofed) {
      strikeT -= dt;
      if (strikeT <= 0) { strikeT = rnd(5.5, 8.5) / mission.strike; airStrike(); }
    }
    if (mission.dir > 0 && (runKind === 'mis' || runKind === 'surv') && agg >= 0.75 && mission.chasers !== 0 && mission.goal !== 'duel' && mission.goal !== 'escort') {
      chaseT -= dt;
      if (chaseT <= 0) { chaseT = rnd(10, 16) / (agg * (mission.chasers || 1)); if (enemies.length < 15) spawnChaser(player.x); }
    }
    for (var si = 0; si < stops.length; si++) {
      var st = stops[si], sAhead = st.d - dist, sType = st.kind === 'bus' ? 'cbus' : 'taxi', se = null;
      if (st.plan === 'done' || sAhead > 262) continue;
      if (!st.plan) st.plan = mission.dir > 0 && sAhead > 225 && Math.random() < 0.55 ? 'arrive' : 'parked';
      if (st.plan === 'arrive') { se = spawnEnemy(sType, st.side * 6, -150, TYPES[sType].ws); se.state = 1; }
      else if (sAhead < 172 && sAhead > 60) { se = spawnEnemy(sType, st.side * 9.85, -sAhead, 0); se.state = 2; se.wait = mission.dir > 0 ? rnd(2.5, 6) : 1e9; if (mission.dir < 0) se.g.rotation.y = Math.PI; }
      else if (sAhead <= 60) st.plan = 'done';
      if (se) { st.plan = 'done'; se.stopD = st.d; se.stopX = st.side * 9.85; se.laneX = st.side * 6; se.blinkOn = false; }
    }
    if (mission.goal === 'hunt' && hunts < mission.n) {
      /* hunt: one hauler at a time; the next one appears a little after the last one is destroyed or left behind */
      huntT -= dt;
      if (huntT <= 0 && !enemies.some(function (e) { return e.type === mission.target; })) {
        huntT = rnd(4, 7); var hx = pick(openLanes(dist + 134));
        if (hx !== undefined) { var he = spawnEnemy(mission.target, hx * 0.6, -134, ews(mission.target)); if (he) { he.hp = he.hpMax = mission.targetHp || he.hp; he.hunted = true; } }
      }
    }
    if (mission.goal === 'collect' && dist >= nextCargoD) {
      nextCargoD = dist + rnd(90, 150);
      addProp('cargo', dist + 150, pick(openLanes(dist + 150)), { solid: { hw: 0.9, hl: 0.9, kind: 'pick', soft: 1 } });
    }
    crateT -= dt;
    if (EDU.arms && crateT <= 0 && !crate.active) { crateT = rnd(15, 22); spawnCrate(); }
  }

  /* ---------- autopilot for the trailer, the selection screen and the 자율주행 skill: score every lane and pick the safest useful one ---------- */
  var AP_LANES = [-9.85, -6, -2, 2, 6, 9.85];
  function laneDanger(x, car) {
    var dng = 0, i, s, z, e, b, p, look = Math.max(36, veff * 1.5), dodge = (mission.dir < 0 ? 0.75 : 1.3) * Math.min(2, 1 / (sfc.grip * sfc.grip));   /* on a slippery road the car needs longer to change lane */
    if (Math.abs(x) > 8) {
      dng += 140;
      for (s = 0; s <= look * 1.7; s += 12) if (shoulderClosed(dist + s, x > 0 ? 1 : -1)) { dng += 3000; break; }
    } else {
      for (s = 0; s <= look; s += 6) if (!laneOpen(x, dist + s)) { dng += 900; break; }
    }
    var dv = blockedAt(dist + 6) || blockedAt(dist + 30);
    if (dv && dv.split && (x > 0) !== (player.x > 0)) dng += 5000;   /* the other half of a split road cannot be reached */
    for (i = 0; i < props.length; i++) {
      p = props[i]; if (!p.solid) continue;
      z = dist - p.d;
      if (z < 5 + car.hl + p.solid.hl && z > -look - p.solid.hl && Math.abs(p.x - x) < p.solid.hw + car.hw + 0.5) dng += p.solid.soft || 800;
    }
    for (i = 0; i < hulks.length; i++) { var hq = hulks[i]; if (!hq.hit && hq.m.position.z < 4 && hq.m.position.z > -look * 0.6 && Math.abs(hq.m.position.x - x) < hq.m.scale.x * 0.45 + car.hw + 0.3) dng += 45; }
    for (i = 0; i < bombs.length; i++) {
      b = bombs[i]; if (!b.dmg) continue; z = b.fixed ? 0 : b.g.position.z + veff * (b.T - b.t);
      if (Math.abs(b.g.position.x - x) < (b.R || 2.0) + 0.4 + car.hw && Math.abs(z) < (b.R || 2.0) + 3 + car.hl) dng += 700;
    }
    for (i = 0; i < enemies.length; i++) {
      e = enemies[i]; if (e.cfg.air || e.cfg.boss) continue;
      if (Math.abs(e.g.position.x - x) > e.cfg.hw + car.hw + 0.5) continue;
      z = e.g.position.z;
      if (z < 5 + car.hl + e.cfg.hl && z > -(e.cfg.transit ? look + e.cfg.hl : (veff - e.ws) * dodge + 7 + car.hl)) dng += (e.cfg.civ || mission.dir < 0) ? 650 : 260;
    }
    return dng;
  }
  function autopilot(car) {
    var i, e, best = 1e9, bestX = player.x, tx = null, tz = -1e9, near = mission.dir < 0 ? -52 : -12, far = mission.dir < 0 ? -105 : -52;
    if (aimed) for (i = 0; i < enemies.length; i++) {
      e = enemies[i]; if (e.cfg.civ || e.cfg.air) continue;
      var ez = e.g.position.z;
      if (ez < near && ez > far && ez > tz) { tz = ez; tx = e.g.position.x; }
    }
    var hz = null, hx = 0;
    if (mission.goal === 'hunt') for (i = 0; i < enemies.length; i++) { e = enemies[i]; if (e.type === mission.target && e.g.position.z < -6 && e.g.position.z > -110) { hz = e.g.position.z; hx = e.g.position.x; } }
    var cz = crate.active ? crate.g.position.z : 1;
    for (i = 0; i < AP_LANES.length; i++) {
      var x = AP_LANES[i], c = laneDanger(x, car) + Math.abs(x - player.x) * 5;
      if (tx !== null && Math.abs(x - tx) < 2.1) c -= 110;
      if (hz !== null && hz < -16 && Math.abs(x - hx) < 2.3) c -= 170;
      if (cz < -4 && cz > -70 && Math.abs(x - crate.g.position.x) < 2.1) c -= 130;
      if (Math.abs(x - player.x) < 2) c -= 45;
      if (allyE && !allyE.fin && Math.abs(x - allyE.x) < 2.1) c -= 90;   /* escort: drive behind the escorted vehicle and shoot down its lane */
      if (mission.goal === 'collect') for (var pi = 0; pi < props.length; pi++) { var pp = props[pi]; if (pp.type === 'cargo' && dist - pp.d < -4 && dist - pp.d > -90 && Math.abs(pp.x - x) < 2.1) { c -= 150; break; } }
      if (c < best) { best = c; bestX = x; }
    }
    apWant = bestX; apDanger = best;
    apFire = !!boss || (crate.active && cz < -2);
    for (i = 0; i < enemies.length && !apFire; i++) if (!enemies[i].cfg.civ && enemies[i].g.position.z < 6 && enemies[i].g.position.z > -80) apFire = true;
    apThr = best >= 600 ? 0.05 : (mission.dir > 0 ? 0.62 : 0.4 * sfc.grip);
    if (hz !== null && hz > -45 && best < 600) apThr = hz > -24 ? 0.02 : 0.2;
    if (mode === 'demo' && player.cd <= 0 && tr.phase === 'play') {
      var ahead = 0, air = 0, k = car.skill;
      for (i = 0; i < enemies.length; i++) { e = enemies[i]; if (e.cfg.air) air++; else if (!e.cfg.civ && e.g.position.z < -4 && e.g.position.z > -45) ahead++; }
      if ((k === 'dash' || k === 'charge' || k === 'shield') && best >= 600) useSkill();
      else if ((k === 'salvo' || k === 'barrage') && (ahead >= 3 || (k === 'salvo' && air >= 1) || boss)) useSkill();
      else if (k === 'emp' && air >= 1) useSkill();
      else if ((k === 'roar' || k === 'overdrive') && (ahead >= 2 || boss)) useSkill();
      else if (k === 'auto' && (best >= 600 || ahead >= 3)) useSkill();
      else if (k === 'nitro' && (ahead >= 1 || boss)) useSkill();
      else if (k === 'siren' && ahead >= 2) useSkill();
      else if (k === 'heal' && player.hp < car.hp * 0.7) useSkill();
      if (!(player.bcd > 0)) { var bk = car.basic; if (bk === 'step' ? best >= 600 : (bk === 'burst' ? ahead === 0 && best < 200 : (bk === 'pulse' ? ebullets.length >= 2 : (bk === 'bash' ? enemies.some(function (o) { return !o.cfg.air && !o.cfg.civ && Math.abs(o.g.position.z) < 5 && Math.abs(o.g.position.x - player.x) < 5; }) : ahead >= 2)))) useBasic(); }
    }
  }

  /* ---------- HUD ---------- */
  var hudCache = {};
  function setText(id, s) { if (hudCache[id] !== s) { hudCache[id] = s; $(id).textContent = s; } }
  function setStyle(id, prop, s) { var k = id + prop; if (hudCache[k] !== s) { hudCache[k] = s; $(id).style[prop] = s; } }
  function pct(f) { return Math.round(clamp(f, 0, 1) * 100) + '%'; }
  function objective() {
    var f = 0, txt = '';
    if (mission.rivals) { var rl = Math.max(0, mission.n - dist0()); f = 1 - rl / mission.n; txt = '순위 ' + raceRank() + ' / ' + (rivals.length + 1) + ' · ' + mission.label + ' ' + (rl / 1000).toFixed(2) + ' km'; }
    else if (mission.goal === 'endless') { f = (tPlay % 25) / 25; txt = '단계 ' + survLevel + ' · ' + (dist0() / 1000).toFixed(1) + ' km · 격파 ' + kills + '대'; }
    else if (mission.goal === 'free') { f = 0; txt = '연습 주행 ' + (dist0() / 1000).toFixed(1) + ' km'; }
    else if (mission.goal === 'tut') { f = Math.max(0, tut.i) / TUT.length; txt = '단계 ' + (Math.max(0, tut.i) + 1) + ' / ' + TUT.length; }
    else if (mission.goal === 'kill') { f = kills / mission.n; txt = mission.label + ' ' + Math.min(kills, mission.n) + ' / ' + mission.n; }
    else if (mission.goal === 'dist') { var m = dist0(); f = m / mission.n; txt = mission.label + ' ' + (Math.min(m, mission.n) / 1000).toFixed(1) + ' / ' + (mission.n / 1000).toFixed(1) + ' km'; }
    else if (mission.goal === 'time') { f = tPlay / mission.n; txt = mission.label + ' ' + pct(f); }
    else if (mission.goal === 'race') { var left = Math.max(0, mission.n - dist0()); f = 1 - left / mission.n; txt = mission.label + ' ' + (left / 1000).toFixed(2) + ' km'; }
    else if (mission.goal === 'escort') { var al = allyE, ar = al ? Math.max(0, mission.n - (al.d - distStart)) : 0; f = 1 - ar / mission.n; txt = mission.allyName + ' 내구 ' + (al ? Math.max(0, Math.round(al.hp / al.cfg.hp * 100)) : 0) + '% · ' + (al && al.d - dist < -8 ? '뒤 ' + Math.round(dist - al.d) + ' m · ' : '') + (vw <= 720 ? '' : mission.label + ' ') + (ar / 1000).toFixed(2) + ' km'; }
    else if (mission.goal === 'hunt') { f = hunts / mission.n; txt = mission.label + ' ' + Math.min(hunts, mission.n) + ' / ' + mission.n; }
    else if (mission.goal === 'collect') { f = picks / mission.n; txt = mission.label + ' ' + Math.min(picks, mission.n) + ' / ' + mission.n; }
    else if (mission.goal === 'rush') { var rm = Math.max(0, mission.n - dist0()); f = 1 - rm / mission.n; txt = '남은 시간 ' + fmtT(Math.max(0, rushLimit - tPlay)) + ' · ' + (vw <= 720 ? '' : mission.label + ' ') + (rm / 1000).toFixed(2) + ' km'; }
    else { var bm = boss ? boss.hpMax || boss.cfg.hp : 1; f = boss ? 1 - boss.hp / bm : 1; txt = mission.label + ' ' + (boss ? Math.ceil(boss.hp / bm * 100) : 0) + '%'; }
    if (mission.civLimit && mode !== 'demo') txt += ' · ' + (mission.civName || '피난 차량') + ' 충돌 ' + civHits + ' / ' + mission.civLimit;
    return { f: f, txt: txt };
  }
  function buffText(car) {
    var b = [];
    if (power > 0) b.push('화력 +' + power);
    if (buff.nitro > 0) b.push('니트로 ' + Math.ceil(buff.nitro) + '초');
    if (buff.magnet > 0) b.push('자석 ' + Math.ceil(buff.magnet) + '초');
    if (buff.dbl > 0) b.push('고철 2배 ' + Math.ceil(buff.dbl) + '초');
    if (buff.regen > 0) b.push('정비 ' + Math.ceil(buff.regen) + '초');
    if (smokeT > 0) b.push('연막 ' + Math.ceil(smokeT) + '초');
    if (buff.armor > 0) b.push('장갑 ' + Math.ceil(buff.armor) + '초');
    if (overT > 0) b.push('과충전 ' + Math.ceil(overT) + '초');
    if (autoT > 0) b.push('자율주행');
    if (player.shield) b.push('방어막'); else if (car.shieldRegen) b.push('방어막 충전 중');
    return b.join(' · ');
  }
  function hud() {
    var car = CARS[player.car], o = objective();
    if (mode === 'demo') { setText('demo-obj', o.txt + ' · ' + Math.round(veff * 3.6) + ' km/h'); return; }
    setText('obj-text', o.txt); setStyle('obj-bar', 'width', pct(o.f)); objF = o.f;
    setText('clock', fmtT(tPlay));
    setText('hp-text', Math.ceil(player.hp) + (vw <= 720 ? '/' : ' / ') + car.hp);
    setStyle('hp-bar', 'width', pct(player.hp / car.hp));
    if (hudCache.dst !== dmgStage) { hudCache.dst = dmgStage; $('hp-bar').className = dmgStage >= 3 ? 's3' : (dmgStage === 2 ? 's2' : ''); }
    setText('score', score.toLocaleString('ko-KR')); setText('scrap', scrap.toLocaleString('ko-KR'));
    var bt = buffText(car);
    setText('buffs', bt || '\u00a0');   /* the line keeps its height when empty so the chip never changes size */
    setText('spd', String(Math.round(veff * 3.6)));
    var sl = slopeAt(dist);
    setText('grade', (sl > 0.015 ? '오르막 ' + Math.round(sl * 100) + '%' : (sl < -0.015 ? '내리막 ' + Math.round(-sl * 100) + '%' : '평지')) + (sfc.key === 'asphalt' ? '' : ' · ' + SURF[sfc.key].name));
    /* the gauge shows what the car is doing now: centre = holding speed, right = gaining, left = losing. The lever shows what was asked for */
    var aN = player.a >= 0 ? player.a / Math.max(1.5, car.aT * ACC_K) : player.a / car.brake;
    aN = clamp(aN, -1, 1); aN = (aN < 0 ? -1 : 1) * Math.sqrt(Math.abs(aN));
    setStyle('acc-up', 'width', aN > 0.04 ? Math.round(aN * 50) + '%' : '0');
    setStyle('acc-dn', 'width', aN < -0.04 ? Math.round(-aN * 50) + '%' : '0');
    setText('fire-state', fireIn ? '발사 중' : '발사 대기');
    if (hudCache.fireOn !== fireIn) { hudCache.fireOn = fireIn; $('fire-state').className = fireIn ? 'tag on' : 'tag'; }
    setText('spd-target', '목표 ' + Math.round((car.vmin + player.thr * (car.vmax - car.vmin)) * 3.6));
    setStyle('lever-knob', 'bottom', pct(player.thr));
    setStyle('lever-fill', 'height', pct((player.v - car.vmin) / (car.vmax - car.vmin)));
    $('lever').setAttribute('aria-valuenow', String(Math.round(player.thr * 100)));
    setText('skill-cd', player.cd > 0 ? Math.ceil(player.cd) + '초 뒤' : (touchUI || vw <= 720 ? '준비됨' : '준비됨 · Space'));
    if (hudCache.cool !== (player.cd > 0)) { hudCache.cool = player.cd > 0; $('btn-skill').classList.toggle('cool', hudCache.cool); $('btn-skill').setAttribute('aria-disabled', hudCache.cool ? 'true' : 'false'); }   /* not the disabled attribute: iOS draws disabled buttons half transparent */
    setStyle('skill-bar', 'transform', 'scaleX(' + (1 - player.cd / car.cd).toFixed(2) + ')');
    var bcd = player.bcd || 0;
    setText('basic-cd', bcd > 0 ? Math.ceil(bcd) + '초 뒤' : (touchUI || vw <= 720 ? '준비됨' : '준비됨 · X'));
    var pcFire = EDU.arms && finePtr && !touchUI;
    if (hudCache.pcFire !== pcFire) { hudCache.pcFire = pcFire; $('btn-fire').hidden = !pcFire; }
    if (pcFire) { setText('fire-cd', fireIn ? '발사 중' : (vw <= 720 ? 'Z' : '누르는 동안 · Z')); if (hudCache.firing !== fireIn) { hudCache.firing = fireIn; $('btn-fire').classList.toggle('on', fireIn); } }
    if (hudCache.bcool !== (bcd > 0)) { hudCache.bcool = bcd > 0; $('btn-basic').classList.toggle('cool', hudCache.bcool); $('btn-basic').setAttribute('aria-disabled', hudCache.bcool ? 'true' : 'false'); }
    setStyle('basic-bar', 'transform', 'scaleX(' + (1 - bcd / BASICS[car.basic].cd).toFixed(2) + ')');
  }

  /* suspension: a bump lifts the front axle at once and the rear axle one wheelbase later, so the body pitches the way a real car does over a hump; a pothole does the same downward and tips the car to one side */
  function suspKick(j, roll, car, snd) {
    susp.vf += j; susp.q.push({ t: car.spec.wb / Math.max(6, veff), j: j, snd: snd });
    if (roll) susp.vro += roll;
    if (snd) sfx('thud');
  }
  function spawnChaser(px) {
    var c = [px - 4, px + 4].map(function (x) { return L4.reduce(function (a, b) { return Math.abs(b - x) < Math.abs(a - x) ? b : a; }); }).filter(function (x) { return Math.abs(x - px) > 2.5 && laneOpen(x, dist) && laneOpen(x, dist - 40); });
    if (!c.length) return;
    var e = spawnEnemy('sedan', pick(c), 44, veff + 9); e.chase = 1; sfx('honk');
    if (!rd.chase && runKind === 'mis') rd.chase = radio('새벽', '뒤에 추격차가 붙었어! 룸미러를 봐. 나란히 서기 전에 차로를 바꿔.', 4);
  }
  /* ---------- simulation ---------- */
  function step(dt) {
    time += dt;
    var i, k, e, p, z, car = CARS[player.car], px, on = live(), fight = on && (mode !== 'demo' || tr.phase === 'play') && briefT <= 0, slope = slopeAt(dist);
    if (briefT > 0 && mode === 'play') {
      briefT -= dt;
      if (rolling) { player.thr = 0; player.v = car.vmin; player.a = 0; }
      if (briefT <= 0) {
        $('card').hidden = true; $('hud').hidden = false; distStart = dist; sfx('go');
        if (rolling) { addProp('gate', dist + 6, 0); addProp('gate', dist + mission.n, 0); }
      }
    }
    if (mode !== 'demo' && tr.fade > 0) tr.fade = Math.max(0, tr.fade - dt / 0.5);
    if (sirenT > 0) sirenT -= dt;
    if (jamT > 0) jamT -= dt;
    if (buff.dbl > 0) buff.dbl -= dt;
    if (buff.armor > 0) buff.armor -= dt;
    if (buff.regen > 0) { buff.regen -= dt; if (!player.dead && on) player.hp = Math.min(car.hp, player.hp + 4 * dt); }
    if (smokeT > 0) { smokeT -= dt; if (Math.random() < dt * 30) spawnP('smoke', player.x + rnd(-2.5, 2.5), rnd(0.4, 2.4), rnd(-3, 5), rnd(-1.5, 1.5), rnd(0.3, 1.5), veff * 0.95, rnd(0.8, 1.4), 1.6, 5, smokeColor(COL.smokeL), 0.5, 0.25); }
    var agg = aggK();
    if (fireHitT > 0) fireHitT -= dt;

    mixEnv(1 - Math.exp(-dt * 3.2));
    envFrame(dt);
    /* underground: daylight is cut, the fog turns to warm darkness and the headlamps come on.
       What lies beyond the exit keeps the light it really has. Deep inside, the far end fades into the dark; from about 280 m the mouth starts to glow with the colour of the sky outside, and by day it is washed out towards white because the eye has settled to the dark. Daylight reaches some way in, so the last stretch brightens. Out in the open the glare stays for a moment and then eases off (tunAdapt) instead of the sky switching from night to day */
    var tsec = sectionAt(dist), inT = !!tsec && tsec.type === 'tunnel', night = cur.night;
    tunK = lerp(tunK, inT ? 1 : 0, 1 - Math.exp(-dt * 3));
    tunCam = inTunnel(dist + 34) || inTunnel(dist - 14);
    if (inT) { var ex = clamp(1 - (tsec.d1 - dist - 40) / 240, 0, 1); tunOut = ex * ex * (3 - 2 * ex); }
    else tunOut = tunAdapt > 0.01 ? 1 : 0;
    tunAdapt = tunK >= tunAdapt ? tunK : lerp(tunAdapt, tunK, 1 - Math.exp(-dt * 1.1));
    tunGlare = 0.5 * (1 - night) * (1 - 0.5 * weather.cloud) * tunAdapt * tunOut;
    if (tunK > 0.01 || tunAdapt > 0.01) {
      var dayIn = tunOut * (1 - night), lightK = tunK * (1 - 0.5 * dayIn * dayIn);
      tunHaze.copy(scene.fog.color).lerp(tunWhite, tunGlare);                       /* the outside as seen from the dark */
      tunIn.copy(tunDark).lerp(tunHaze, tunOut);                                    /* what the far end of the tube fades into */
      scene.background.lerp(tunWhite, tunGlare * (1 - tunK)).lerp(tunIn, tunK * 0.94);
      scene.fog.color.lerp(tunWhite, tunGlare * (1 - tunK)).lerp(tunIn, tunK * 0.94);
      scene.fog.near = lerp(envFogN, lerp(30, envFogN * 0.7, tunOut), tunK); scene.fog.far = lerp(envFogF, lerp(160, envFogF * 0.85, tunOut), tunK);
      roadMat.color.lerp(tunRoad, tunK); roadOutMat.color.lerp(tunRoad, tunK);
      hemi.intensity = lerp(envHemiI, 0.85, lightK); hemi.color.lerp(tunLight, lightK); hemi.groundColor.lerp(tunDark, lightK * 0.6); sun.intensity = envSunI * (1 - 0.92 * lightK);
    }
    renderer.toneMappingExposure = cur.exposure * (1 + 0.2 * tunK + 0.55 * tunGlare);
    for (i = 0; i < nightGlows.length; i++) nightGlows[i].material.opacity = night * 0.9;
    for (i = 0; i < headGlows.length; i++) headGlows[i].material.opacity = 0.3 + night * 0.7;
    poolMat.opacity = night * 0.34;
    for (i = 0; i < bMats.length; i++) bMats[i][0].emissiveIntensity = night * 1.25;
    beam.intensity = Math.max(night, tunK) * 4.5; beamPool.material.opacity = Math.max(night, tunK) * 0.5;
    beam.position.z = -car.hl; beamPool.position.z = -car.hl - 13;

    if (mode === 'demo') updTrailer(dt);
    if (buff.nitro > 0) buff.nitro -= dt;
    if (buff.magnet > 0) buff.magnet -= dt;
    if (overT > 0) overT -= dt;
    if (autoT > 0) autoT -= dt;

    /* speed: input only sets a target; the car reaches it at its own pace */
    /* the surface under the wheels: set by the region, the lane, the weather and any patch the car is crossing */
    surfaceFor(car, player.x, dist, zoneNow, sfc, playerTire);
    if (zoneNow !== zoneSeen) {
      if (ZLOSS[zoneNow]) player.v = Math.max(car.vmin * 0.8, player.v * (1 - ZLOSS[zoneNow] * (1 - 0.4 * car.rough) * ((TIRES[playerTire].zone || {})[zoneNow] || 1)));   /* ploughing into mud or water costs speed at once */
      if (on && zoneNow === 'water') { sfx('splash'); for (k = 0; k < 10; k++) spawnP('smoke', player.x + rnd(-1.2, 1.2), 0.4, rnd(-2, 2), rnd(-4, 4), rnd(3, 7), veff * 0.6, 0.6, 0.8, 3.2, smokeColor(COL.white), 0.5, 0.6); }
      else if (on && zoneNow === 'ice') sfx('skid');
      else if (on && zoneNow === 'mud') sfx('splash');
      zoneSeen = zoneNow;
    }
    zoneNow = '';
    var want = player.x, frac = (player.v - car.vmin) / (car.vmax - car.vmin), selfDrive = mode === 'demo' || mode === 'menu' || (mode === 'play' && autoT > 0);
    if (selfDrive && !player.dead) {
      apT -= dt;
      if (apT <= 0) { apT = 0.12; autopilot(car); }
    }
    if (mode === 'play' && !player.dead && !(rolling && briefT > 0)) {
      var padX = pollPad(dt);
      if (keys.u) player.thr += 0.6 * dt;
      if (keys.d) player.thr -= 0.6 * dt;
      player.thr = clamp(player.thr, 0, 1);
      if (autoT > 0) want = apWant;
      else if (keys.l || keys.r) want = player.x + (keys.r ? 6 : 0) - (keys.l ? 6 : 0);
      else if (padX) want = player.x + padX * 6;
      else if (steerWant !== null) want = steerWant;
    } else if (mode === 'demo') {
      want = apWant; player.thr = lerp(player.thr, apThr, 1 - Math.exp(-dt * 3));
    } else if (mode === 'menu') {
      want = apWant; player.thr = lerp(player.thr, apDanger >= 600 ? 0.1 : 0.45, 1 - Math.exp(-dt * 2));
    } else if (!player.dead) player.thr = lerp(player.thr, 0.5, 1 - Math.exp(-dt * 2));
    if (player.dead) { player.v = Math.max(0, player.v - 30 * dt); player.a = 0; }
    else advanceSpeed(car, player, car.vmin + player.thr * (car.vmax - car.vmin), dt, buff.nitro > 0 ? 1.7 : 1, slope, sfc);
    if (player.invuln > 0) { player.invuln -= dt; if (player.invuln <= 0) player.guard = false; }
    else if (burstT > 0) burstT -= dt;
    else player.boost = Math.max(0, player.boost - 30 * dt);
    veff = player.v + player.boost;
    dist += veff * dt;
    genSections(); updateHills(dist);
    var inW = inTunnel(dist + 16) ? 7.4 - car.hw * 0.5 : 6.7;
    maxX += clamp((shoulderClosed(dist + 16, 1) ? inW : 9.9) - maxX, -7 * dt, 7 * dt);
    minX += clamp(-(shoulderClosed(dist + 16, -1) ? inW : 9.9) - minX, -7 * dt, 7 * dt);
    want = clamp(want, minX, maxX);
    var latMax = car.lat * (1 - car.latDrop * clamp(frac, 0, 1)) * (0.35 + 0.65 * sfc.grip);
    player.vx = lerp(player.vx, clamp((want - player.x) * 6, -latMax, latMax), 1 - Math.exp(-dt * car.steerK * sfc.grip * sfc.grip));
    var windPush = mode === 'menu' || player.dead ? 0 : gust.v * clamp(car.spec.H / 1.5, 0.85, 1.8);   /* a gust shoves the car sideways; tall bodies catch more of it */
    player.x = clamp(player.x + (player.vx + windPush) * dt, minX, maxX);
    if (stepT > 0) { player.x = clamp(player.x + stepDir * 20 * Math.min(dt, stepT), minX, maxX); stepT -= dt; }   /* quick step: one lane in a fifth of a second */
    /* a closed work-zone lane is a wall: bounce out and take damage */
    if (workHitT > 0) workHitT -= dt;
    var iv = blockedAt(dist), pad = iv && iv.split ? car.hw + 0.15 : car.hw * 0.75;
    if (iv && player.x > iv.a - pad && player.x < iv.b + pad && !player.dead) {
      var outLeft = iv.a < -8 ? false : (iv.b > 8 ? true : (player.x - iv.a < iv.b - player.x));
      player.x = outLeft ? iv.a - pad - 0.05 : iv.b + pad + 0.05; player.vx = outLeft ? -6 : 6;
      if (workHitT <= 0 && on) {
        workHitT = 0.8; hurt(iv.split ? 8 : 14, 'debris'); sfx('crash'); shake = Math.min(1.2, shake + 0.4);
        for (k = 0; k < 6; k++) spawnP('glow', player.x, 0.8, -1, rnd(-8, 8), rnd(2, 8), rnd(4, 14), 0.3, 0.9, 0.1, COL.spark, 1);
      }
    }
    px = player.x; updateSplit(dist, px);
    var bmp = sfc.bump * clamp(veff / 28, 0.3, 1.3), sW = clamp(13 - car.spec.kg / 600, 6.5, 12), sZ = 0.3, qi;   /* heavy cars ride softer and slower */
    for (qi = susp.q.length - 1; qi >= 0; qi--) { susp.q[qi].t -= dt; if (susp.q[qi].t <= 0) { susp.vr += susp.q[qi].j; if (susp.q[qi].snd) sfx('thud'); susp.q.splice(qi, 1); } }
    susp.vf += (-sW * sW * susp.f - 2 * sZ * sW * susp.vf) * dt; susp.f = clamp(susp.f + susp.vf * dt, -0.16, 0.45);
    susp.vr += (-sW * sW * susp.r - 2 * sZ * sW * susp.vr) * dt; susp.r = clamp(susp.r + susp.vr * dt, -0.16, 0.45);
    susp.vro += (-90 * susp.ro - 7 * susp.vro) * dt; susp.ro += susp.vro * dt;
    var bodyY = (susp.f + susp.r) / 2, bodyP = Math.atan2(susp.f - susp.r, car.spec.wb);
    playerRoot.position.set(px, Math.sin(time * 31) * 0.012 + (bmp > 0 ? (Math.sin(dist * 1.7) * Math.sin(dist * 0.53 + 1.3) + 1) * 0.045 * bmp : 0) + bodyY, 0);
    dmgStep(dt, car, on);
    playerRoot.rotation.z = -player.vx * car.rollK + (bmp > 0 ? Math.sin(dist * 1.13) * 0.022 * bmp : 0) + susp.ro + dmgRoll; playerRoot.rotation.y = -player.vx * 0.014 * (1 + (1 - sfc.grip) * 2.2);
    playerRoot.rotation.x = clamp(player.a * car.pitchK, -0.09, 0.09) + bodyP + dmgPitch;
    for (i = 0; i < car.wheels.length; i++) car.wheels[i].rotation.x -= veff * dt / car.wheels[i].userData.r;
    if (player.cd > 0) player.cd = Math.max(0, player.cd - dt);
    if (player.bcd > 0) player.bcd = Math.max(0, player.bcd - dt);
    if (hornT > 0) hornT -= dt;
    if (car.shieldRegen && !player.shield && on) { player.shieldT -= dt; if (player.shieldT <= 0) player.shield = 1; }
    var guarding = player.guard && player.invuln > 0;
    shieldGlow.material.opacity = player.dead || mode === 'menu' ? 0 : (guarding ? 0.5 + Math.sin(time * 9) * 0.1 : (player.shield ? 0.22 + Math.sin(time * 5) * 0.05 : 0));
    dashGlow.material.opacity = player.invuln > 0 && !player.guard ? 0.8 : 0;
    if (player.invuln > 0 && !player.guard && Math.random() < dt * 60) spawnP('glow', px + rnd(-0.8, 0.8), 0.8, car.hl + 0.4, 0, 0, veff * 0.5, 0.3, 2.2, 0.4, car.skill === 'dash' ? COL.fire2 : COL.white, 0.8, 1);
    if ((buff.nitro > 0 || overT > 0) && Math.random() < dt * 40) spawnP('glow', px + rnd(-0.6, 0.6), 0.6, car.hl + 0.3, 0, 0, veff * 0.5, 0.25, 1.6, 0.3, overT > 0 ? COL.cyan : COL.blue, 0.8, 1);
    engineSound(on && !player.dead, car, veff, player.use || 0);
    if (car.blink) { var bph = Math.sin(time * 12) > 0; car.blink[0].visible = bph; car.blink[1].visible = !bph; }

    /* scenery scroll; everything beside the road follows the elevation profile */
    roadTex.offset.y = (dist / 4) % 1; shoulderTex.offset.y = roadTex.offset.y; groundTex.offset.y = (dist / 13.3) % 1;
    updateStrips();
    for (i = 0; i < loops.length; i++) {
      var lg = loops[i]; lg.position.z = dist % lg.userData.period;
      if (lg.userData.drop) for (k = 0; k < lg.children.length; k++) { var ch = lg.children[k]; ch.position.y = ch.userData.baseY - H_DECK * elevAt(dist - ch.position.z - lg.position.z); }
    }
    for (i = 0; i < sceneryNow.length; i++) {
      var sud = sceneryNow[i].userData;
      p = sceneryNow[i].position; p.z += (veff + (sud.onc || 0)) * dt; if (p.z > (sud.wrapZ || 58)) p.z -= sud.period || 308;
      p.y = sud.baseY - H_DECK * elevAt(dist - p.z);
    }
    for (i = props.length - 1; i >= 0; i--) {
      var pr = props[i]; z = dist - pr.d;
      if (z > 48) { releaseProp(i); continue; }
      pr.m.position.z = z; pr.m.position.y = pr.m.userData.baseY - (pr.drop ? H_DECK * elevAt(pr.d) : 0);
      if (pr.type === 'bridge' || pr.type === 'portal' || pr.type === 'gantry' || pr.type === 'tollgate') pr.m.userData.mat.opacity = tunCam && pr.type === 'portal' ? 1 : clamp((-z - 2) / 45, 0.22, 1);
      else if (pr.type === 'fire') {
        if (pr.wait > 0) { pr.wait -= dt; pr.m.userData.mat.opacity = 0.22 + 0.16 * Math.sin(time * 20); if (pr.wait <= 0) sfx('flame'); }
        else {
          pr.m.userData.mat.opacity = 0.6 + 0.1 * Math.sin(time * 13);
          if (z > -130) for (k = 0; k < 3; k++) {
            spawnP('smoke', pr.x + rnd(-1.3, 1.3), 0.6, z + rnd(-18, 18), rnd(-0.4, 0.4), rnd(3, 6), veff, rnd(0.25, 0.45), 1.5, 0.5, k ? COL.fire2 : COL.fire, 1, 0.1);
            if (k < 2) spawnP('glow', pr.x + rnd(-1.3, 1.3), 0.7, z + rnd(-18, 18), 0, rnd(6, 10), veff, rnd(0.25, 0.4), 2.4, 0.6, COL.fire2, 1, 0.1);
          }
        }
      }
      else if (pr.type === 'wreck') { var bl = Math.sin(time * 7) > 0 ? 0.9 : 0.05; pr.m.userData.blink[0].material.opacity = bl; pr.m.userData.blink[1].material.opacity = bl; }
      if (pr.solid && !pr.hit && !player.dead && Math.abs(pr.x - px) < pr.solid.hw + car.hw * 0.9 && Math.abs(z) < pr.solid.hl + car.hl * 0.85) {
        if (pr.solid.kind === 'fire') {
          if (pr.wait <= 0 && fireHitT <= 0 && on) { fireHitT = 0.35; hurt(6, 'bomb'); }
          continue;
        }
        if (ZONE[pr.solid.kind]) { zoneNow = pr.solid.kind; continue; }   /* mud, water and ice change the surface while the car is on them */
        if (pr.solid.kind === 'hole') {
          /* pothole: the wheel on that side drops in; a jolt, a little damage, a little speed */
          pr.hit = true; suspKick(-clamp(veff * 0.045, 0.35, 1.3), (px > pr.x ? 1 : -1) * 0.45, car, on);
          if (veff > 14 && on) { hurt(2 * (TIRES[playerTire].debris || 1), 'debris'); player.v = Math.max(car.vmin, player.v * 0.96); shake = Math.min(1.2, shake + 0.2); }
          continue;
        }
        if (pr.solid.kind === 'pick') {
          if (on) { picks++; sfx('item'); } spawnP('glow', pr.x, 1.2, z, 0, 0, veff, 0.4, 3, 9, COL.fire2, 0.9, 0);
          releaseProp(i); continue;
        }
        if (pr.solid.kind === 'hump') {
          /* speed hump: taken slowly the car just rocks, front then rear; taken fast it is thrown up, loses speed and lands hard */
          pr.hit = true; suspKick(clamp(veff * 0.07, 0.4, 2.2), 0, car, on); if (mission.goal === 'tut' && tut.i === TUT.length - 1) tut.hump = veff > 17 ? -1 : 1;
          if (veff > 17) { player.v = Math.max(car.vmin, player.v * 0.9); shake = Math.min(1.2, shake + 0.2 + Math.min(0.4, (veff - 17) * 0.02)); }
          if (veff > 30 && on) { hurt(3 * (TIRES[playerTire].debris || 1), 'debris'); for (k = 0; k < 6; k++) spawnP('glow', px + rnd(-0.8, 0.8), 0.2, car.hl * 0.6, rnd(-6, 6), rnd(1, 5), veff * 0.6, 0.3, 0.8, 0.1, COL.spark, 1); }
          continue;
        }
        pr.hit = true;
        if (pr.solid.kind === 'pillar') {
          hurt(30, 'ram'); sfx('crash'); shake = Math.min(1.2, shake + 0.8); player.v = car.vmin; player.a = 0; player.vx = (px >= pr.x ? 1 : -1) * 10;
          for (k = 0; k < 8; k++) spawnP('glow', px, 1, -1.5, rnd(-10, 10), rnd(2, 9), rnd(4, 14), 0.35, 1.0, 0.1, COL.spark, 1);
        } else if (pr.solid.kind === 'wreck') {
          explode(pr.x, 1, z, 1.1, veff, pr.m.userData.body); hurt(22, 'debris'); releaseProp(i);
        } else {
          var heavy = pr.solid.kind === 'rock', light = pr.solid.light, tdm = TIRES[playerTire].debris || 1;
          suspKick(heavy ? 0.9 : 0.35, (px > pr.x ? -1 : 1) * (heavy ? 0.5 : 0.25), car, false);
          hurt((heavy ? 18 : (light ? 3 : 6)) * tdm, 'debris'); player.v = Math.max(car.vmin, player.v * (1 - (heavy ? 0.35 : 0.12) * (tdm < 1 ? 0.5 : 1))); shake = Math.min(1.2, shake + (heavy ? 0.6 : 0.25)); if (heavy && on) sfx('crash');
          for (k = 0; k < (heavy ? 7 : 4); k++) spawnDebris(pr.x, 0.4, z, pr.m.userData.body || M.dark, veff);
          releaseProp(i);
        }
      }
    }

    /* weapons: in the garage tab the mounted weapons test-fire so a swap can be seen at once */
    if (mode === 'play') fireIn = briefT <= 0 && (autoT > 0 || keys.f || fireBtn || padFire || thrHeld());   /* keyboard, mouse and gamepad have an attack input of their own; on a touch screen holding the lever fires */
    else if (mode === 'demo') fireIn = apFire;
    else fireIn = mode === 'menu' && menuTab === 'gear' && !titleOn;
    var armed = fireIn && !player.dead, pw = 1 + 0.25 * power, rate = (buff.nitro > 0 ? 1.5 : 1) * (overT > 0 ? 2 : 1);
    muzzle.material.opacity = Math.max(0, muzzle.material.opacity - dt * 14);
    if (armed && EDU.arms) for (i = 0; i < guns.length; i++) fireGun(guns[i], dt * rate, px, car, pw, on);
    if (on && !player.dead) {
      if (salvoN > 0) {
        salvoT -= dt;
        if (salvoT <= 0) {
          var sp2 = car.anchors.rear || car.anchors.side || car.anchors.roof || [0, 1.2, 0], sd = salvoN % 2 ? 1 : -1;
          salvoT = 0.08; salvoN--; fireMissile(px + sd * 0.42, sp2[1] + 0.7, -sp2[2], sd, pw); sfx('missile');
        }
      }
    }
    updBullets(dt); updMissiles(dt); updMines(dt); updHulks(dt); updStrikes(dt);
    if (trackM) trackPos.copy(trackM.g.position);
    for (i = 0; i < bolts.length; i++) if (bolts[i].life > 0) {
      bolts[i].life -= dt; bolts[i].m.material.opacity = Math.max(0, bolts[i].life / 0.1);
      if (bolts[i].life <= 0) bolts[i].m.visible = false;
    }

    /* enemies */
    if (fight) spawner(dt);
    for (i = enemies.length - 1; i >= 0; i--) {
      e = enemies[i]; p = e.g.position; e.t += dt;
      /* damaged vehicles smoke, badly damaged ones burn: the escorted vehicle and the big targets show how close they are to going */
      if (!e.cfg.air && (!e.cfg.rival || e.cfg.ally) && p.z > -130 && p.z < 20) {
        var emx = e.hpMax || e.cfg.hp, efr = e.hp / emx;
        if (emx >= 5 && efr < 0.5 && Math.random() < dt * (efr < 0.25 ? 12 : 6) * fxK) {
          spawnP('smoke', p.x + rnd(-0.3, 0.3), e.cfg.y + 0.5, p.z - e.cfg.hl * 0.5, rnd(-0.5, 0.5), rnd(1.5, 3), veff - e.ws * 0.3, rnd(0.7, 1.1), 0.8 + e.cfg.hw * 0.4, 2.4 + e.cfg.hw, smokeColor(efr < 0.25 ? COL.smokeD : COL.smokeL), efr < 0.25 ? 0.65 : 0.4, 0.4);
          if (efr < 0.25 && Math.random() < 0.6) spawnP('glow', p.x + rnd(-0.4, 0.4), e.cfg.y + 0.3, p.z - e.cfg.hl * 0.5, rnd(-1, 1), rnd(1.5, 3), veff - e.ws * 0.3, rnd(0.25, 0.4), 1.2 + e.cfg.hw * 0.4, 0.3, COL.fire, 0.85, 0.3);
        }
      }
      if (e.flash > 0) { e.flash -= dt; e.body.emissive.setScalar(e.flash > 0 ? 0.9 : 0); }
      for (k = 0; k < e.wheels.length; k++) e.wheels[k].rotation.x -= (e.cfg.transit ? e.ws : Math.abs(e.ws || veff)) * dt / e.wheels[k].userData.r;
      if (e.cfg.rival) { updRival(e, dt, px, car, on); continue; }
      if (e.dieNow) { e.dieNow = false; killEnemy(i, true); continue; }
      if (e.chase) {
        /* pursuer: comes up from behind in the next lane, draws level, swerves into the car, then pulls ahead and fights on like any other armed car */
        if (e.chase === 1) { e.ws = veff + clamp((p.z - 1) * 0.9, 1.5, 12); if (p.z < 2.5) { e.chase = 2; e.swT = 0.45; if (on) sfx('screech'); } }
        else if (e.chase === 2) {
          e.ws = veff; e.swT -= dt;
          if (e.swT <= 0) e.x0 += clamp(px - e.x0, -7 * dt, 7 * dt);
          if (!player.dead && Math.abs(p.x - px) < e.cfg.hw + car.hw + 0.05 && Math.abs(p.z) < e.cfg.hl + car.hl) {
            var sdir = px >= p.x ? 1 : -1;
            hurt(7 * agg, 'ram'); player.vx = sdir * 8; e.x0 = px - sdir * (e.cfg.hw + car.hw + 0.7); p.x = e.x0; e.chase = 3; sfx('crash'); shake = Math.min(1.2, shake + 0.4);
            for (k = 0; k < 6; k++) spawnP('glow', (p.x + px) / 2, 0.9, 0, rnd(-8, 8), rnd(2, 8), rnd(4, 14), 0.3, 0.9, 0.1, COL.spark, 1);
          } else if (e.swT < -2.5) e.chase = 3;
        } else { e.ws = veff + 7; if (p.z < -26) { e.chase = 0; e.ws = ews('sedan'); } }
        if (e.t > 14 && e.chase) { e.chase = 0; e.ws = ews('sedan'); }
      }
      if (e.type === 'bike' && e.ws > 0 && agg > 0.8 && on && p.z > -45 && p.z < -6) e.x0 += clamp(px - e.x0, -2.2 * agg * dt, 2.2 * agg * dt);   /* bikes close in on the car's lane */
      if (e.cfg.kami) {
        /* suicide drone: flies in, hovers ahead while it aims, then locks the car's lane position and dives onto it */
        var kh = e.g.userData.hover;
        e.g.userData.glow.material.opacity = 0.5 + 0.5 * Math.sin(time * (e.st ? 40 : 14));
        if (inTunnel(dist) && e.st === 0) { p.z -= 60 * dt; if (p.z < -170) releaseEnemy(i); continue; }
        if (e.st === 0) {
          p.z = Math.min(e.holdZ, p.z + 60 * dt); p.x += clamp(px - p.x, -9 * dt, 9 * dt);
          kh.position.y = 4.6 + Math.sin(time * 4 + e.phase) * 0.2;
          if (p.z >= e.holdZ - 0.5 && fight) {
            e.aimT -= dt;
            if (e.aimT <= 0) {
              e.st = 1; e.lockX = clamp(px, -9.9, 9.9); e.diveT = 0; e.x0 = p.x; sfx('dive');
              var kb = dropBomb(e.lockX, 0, 4.6, 0.75, 20); kb.fixed = true; kb.shell.visible = false; kb.owner = e;
            }
          }
        } else {
          e.diveT += dt;
          var ku = Math.min(1, e.diveT / 0.75);
          p.x = lerp(e.x0, e.lockX, ku); p.z = lerp(e.holdZ, 0, ku); kh.position.y = lerp(4.6, 0.9, ku * ku); kh.rotation.x = 0.9 * ku;
          if (ku >= 1) releaseEnemy(i);
        }
        continue;
      }
      if (e.cfg.air) {
        var hov = e.g.userData.hover;
        if (inTunnel(dist)) e.t = Math.max(e.t, e.life);
        hov.position.y = 4.6 + Math.sin(time * 3 + e.phase) * 0.25; hov.rotation.z = Math.sin(time * 2 + e.phase) * 0.08;
        if (e.t < e.life) {
          p.z = Math.min(e.holdZ, p.z + 46 * dt);
          p.x += clamp(px - p.x, -5 * dt, 5 * dt);
          if (p.z >= e.holdZ - 0.5) {
            e.dropT -= dt;
            if (quiet()) e.dropT = Math.max(e.dropT, 0.4);
            if (e.dropT <= 0) { e.dropT = rnd(2.0, 2.8) / (0.8 + 0.25 * agg); dropBomb(clamp(p.x + player.vx * 0.35 * agg, -6.6, 6.6), p.z, 4.3, clamp(-p.z / Math.max(veff, 12), 0.5, 1.3), 18); }
          }
        } else { p.z -= 55 * dt; if (p.z < -160) releaseEnemy(i); }
        continue;
      }
      if (e.cfg.boss) {
        p.z = Math.min(-32 - car.hl * 0.5, p.z + 34 * dt);
        if (!e.entered && p.z >= -70) { e.entered = true; if (on) { sfx('horn'); shake = Math.min(1.2, shake + 0.9); capHold = 0; radio('새벽', '저게 목표야! 화력을 전부 쏟아.', 3.6); } }   /* the boss announces itself */
        var bw = blockedAt(dist - p.z), bxw = Math.sin(time * 0.55) * 4.4;
        if (bw) bxw = bw.a < -8 ? Math.max(bxw, bw.b + 2.6) : Math.min(bxw, bw.a - 2.6);
        p.x += clamp(bxw - p.x, -6 * dt, 6 * dt);
        if (p.z >= -33 - car.hl * 0.5 && fight) {
          e.fireT -= dt;
          if (quiet()) e.fireT = Math.max(e.fireT, 0.4);
          if (e.fireT <= 0) { e.fireT = 1.5 / (0.85 + 0.2 * agg); for (k = -1; k <= 1; k++) fireEnemyBullet(p.x + k, 2.4, p.z + 4.6, px + k * 4, 0, 24); }
          e.strikeT -= dt;
          if (e.strikeT <= 0) { e.strikeT = 7; airStrike(); }
        }
        continue;
      }
      if (e.cfg.transit) {
        /* buses and taxis: pull over to a stop, wait with the indicators on while people board, then move off again */
        if (e.stopD !== undefined) {
          var gapS = e.stopD - (dist - p.z);
          if (e.state === 1) {
            if (gapS < 80) { e.ws = Math.max(0, Math.min(e.ws, e.cfg.ws * clamp(gapS / 60, 0.04, 1))); e.blinkOn = true; }
            if (gapS < 50) e.x0 += clamp(e.stopX - e.x0, -2.6 * dt, 2.6 * dt);
            if (gapS <= 0.4) { e.ws = 0; e.x0 = e.stopX; e.state = 2; e.wait = rnd(4, 7); if (on && p.z > -70 && p.z < 12) sfx('chime'); }
          } else if (e.state === 2) {
            e.blinkOn = true; e.wait -= dt;
            if (e.wait <= 0 && mission.dir > 0) e.state = 3;
          } else {
            e.ws = Math.min(e.cfg.ws, e.ws + 2.4 * dt); e.x0 += clamp(e.laneX - e.x0, -1.7 * dt, 1.7 * dt);
            if (Math.abs(e.x0 - e.laneX) < 0.08) { e.blinkOn = false; e.stopD = undefined; }
          }
        }
        var bk = e.g.userData.blink, bo = e.blinkOn && Math.sin(time * 9 + e.phase) > 0 ? 0.95 : 0;
        if (bk) for (k = 0; k < bk.length; k++) bk[k].material.opacity = bo;
      }
      if (e.hunted) { var hw0 = ews(e.type), hw1 = p.z > -75 && p.z < 4 ? clamp(veff - 5, hw0, car.vmax * 0.82) : hw0; e.ws += clamp(hw1 - e.ws, -6 * dt, 5 * dt); }   /* a hunted hauler runs when the car closes in, so it is chased rather than passed */
      var rel = veff - e.ws;
      p.z += rel * dt;
      if ((sirenT > 0 || (hornT > 0 && p.z > -90 && p.z < 4)) && e.cfg.civ) e.x0 += clamp((px > p.x ? -6.9 : 6.9) - e.x0, -9 * dt, 9 * dt);
      var eb2 = blockedAt(dist - p.z);
      if (eb2 && e.x0 > eb2.a - e.cfg.hw - 0.4 && e.x0 < eb2.b + e.cfg.hw + 0.4) {
        var tgt = eb2.a < -8 ? eb2.b + e.cfg.hw + 0.9 : eb2.a - e.cfg.hw - 0.9;
        e.x0 += clamp(tgt - e.x0, -8 * dt, 8 * dt);
      }
      if (e.type === 'sedan' && e.ws > 0 && on && !e.chase) {
        e.lcT -= dt;
        if (e.lcT <= 0) {
          e.lcT = rnd(3, 6) / (0.7 + 0.4 * agg);
          var nl = e.x0 + (p.z < -12 && p.z > -90 && Math.abs(px - e.x0) > 2 && Math.random() < 0.3 + 0.4 * agg ? (px > e.x0 ? 4 : -4) : (Math.random() < 0.5 ? -4 : 4)), bq = blockedAt(dist - p.z) || blockedAt(dist - p.z + 40);
          if (Math.abs(nl) < 6.2 && laneOpen(nl, dist - p.z + 20) && laneOpen(nl, dist - p.z) && !(bq && bq.split && (nl > 0) !== (e.x0 > 0))) e.laneGo = Math.round((nl + 6) / 4) * 4 - 6;
        }
        if (e.laneGo !== undefined) { e.x0 += clamp(e.laneGo - e.x0, -3 * dt, 3 * dt); if (Math.abs(e.laneGo - e.x0) < 0.05) e.laneGo = undefined; }
      }
      if (e.ws > 0 && !e.cfg.transit) {
        var amp = eb2 || e.chase ? 0 : (e.type === 'bike' ? 1.3 : (e.type === 'dump' ? 0.5 : (e.type === 'tractor' ? 0.15 : 0.9))), wv = e.type === 'bike' || e.type === 'buggy' ? 1.7 : 0.9;
        var nx = clamp(e.x0 + Math.sin(time * wv + e.phase) * amp, -6.9, 6.9);
        e.g.rotation.y = clamp(-(nx - p.x) / dt * 0.02, -0.4, 0.4); if (e.type === 'bike') e.g.rotation.z = clamp(-(nx - p.x) / dt * 0.12, -0.6, 0.6);
        p.x = nx;
      } else p.x = e.x0;
      if (e.type === 'buggy' && on && !quiet() && p.z < -14 && p.z > (e.ws > 0 ? -70 : -110)) {
        /* rocket buggy: slow rockets that bend toward the car */
        e.fireT -= dt * (e.ws > 0 ? 1 : 1.8);
        if (e.fireT <= 0) {
          e.fireT = rnd(2.4, 3.4) / (0.8 + 0.3 * agg);
          var rk = fireEnemyBullet(p.x, 1.4, p.z + 1.5, px, 0, e.ws > 0 ? 17 : rel + 9); rk.rocket = true; rk.m.scale.setScalar(1.7); sfx('rocket');
        }
      }
      if (e.type === 'dump' && on && e.ws > 0 && p.z < -12 && p.z > -80) {
        /* dump truck: spills gravel that stays on the road behind it */
        e.dropT -= dt;
        if (e.dropT <= 0) {
          e.dropT = rnd(2.2, 3.2);
          for (k = 0; k < 3; k++) addProp('gravel', dist - p.z - 4.4 - k * 1.5, clamp(p.x + rnd(-1.1, 1.1), -7, 7), { ry: rnd(0, 3), solid: { hw: 0.55, hl: 0.5, kind: 'junk' } });
          if (p.z > -60) sfx('gravel');
          for (k = 0; k < 5; k++) spawnP('smoke', p.x + rnd(-1, 1), 0.6, p.z + 4, rnd(-1, 1), rnd(0.5, 1.5), veff, 0.7, 1, 3, smokeColor(COL.smokeL), 0.4, 0.6);
        }
      }
      if (e.type === 'sedan' && on && !quiet() && p.z < -12 && p.z > (e.ws > 0 ? -55 : -100)) {
        e.fireT -= dt * (e.ws > 0 ? 1 : 2.2);
        if (e.fireT <= 0) {
          e.fireT = rnd(1.1, 1.9) / (0.75 + 0.35 * agg);
          fireEnemyBullet(p.x, 1.6, p.z + 1.6, px + player.vx * 0.3 * agg, 0, e.ws > 0 ? 22 : rel + 14); if (p.z > -70) sfx('egun');
          spawnP('glow', p.x, 1.74, p.z + 1.7, 0, 0, rel, 0.08, 2.2, 1, COL.orange, 0.9);
        }
      }
      if (!player.dead && Math.abs(p.x - px) < e.cfg.hw + car.hw && p.z > -car.hl - e.cfg.hl && p.z < car.hl + e.cfg.hl) {
        var ram = e.cfg.ram, wasCiv = e.cfg.civ;
        killEnemy(i, false); hurt(ram, 'ram');
        if (wasCiv && mode === 'play' && mission.civLimit) {
          civHits++; hitFlash = 1;
          if (civHits >= mission.civLimit) finish(false, (mission.civName ? mission.civName + '와 ' : '피난 차량과 ') + mission.civLimit + '번 충돌했다.');
        }
        continue;
      }
      if (p.z > 46 || p.z < -180) releaseEnemy(i);
    }

    for (i = ebullets.length - 1; i >= 0; i--) {
      var eb = ebullets[i]; p = eb.m.position;
      if (eb.rocket) {
        eb.vx = lerp(eb.vx, clamp((px - p.x) * 1.6, -8, 8), 1 - Math.exp(-dt * 2.5));
        eb.trail -= dt; if (eb.trail <= 0) { eb.trail = 0.04; spawnP('smoke', p.x, p.y, p.z, rnd(-0.4, 0.4), rnd(0.2, 0.8), eb.vz * 0.4, 0.6, 0.5, 1.6, smokeColor(COL.smokeL), 0.5, 0.4); }
      }
      p.x += eb.vx * dt; p.z += eb.vz * dt;
      var hitP = !player.dead && Math.abs(p.x - px) < car.hw + 0.25 && Math.abs(p.z) < car.hl;
      if (hitP && eb.rocket) { explode(p.x, 1, p.z, 0.8, veff, M.dark); hurt(13, 'bomb'); }
      else if (hitP) { spawnP('glow', p.x, 1.6, p.z, 0, 0, 0, 0.3, 3, 8, COL.orange, 0.8, 0); hurt(6, 'bullet'); }
      if (hitP || p.z > 16) { eb.m.visible = false; ebpool.push(eb); ebullets.splice(i, 1); }
    }

    /* bombs */
    for (i = bombs.length - 1; i >= 0; i--) {
      var bo2 = bombs[i]; bo2.t += dt; p = bo2.g.position;
      if (!bo2.fixed) p.z += veff * dt;
      var ft = clamp(bo2.t / bo2.T, 0, 1), gone = false;
      bo2.shell.position.y = bo2.fromY * (1 - ft * ft);
      bo2.disc.scale.set(ft, 1, ft); bo2.ring.material.opacity = 0.6 + 0.4 * Math.sin(time * 22);
      if (bo2.owner && bo2.t < bo2.T - 0.06 && enemies.indexOf(bo2.owner) < 0) gone = true;   /* the diving drone was shot down */
      else if (bo2.t >= bo2.T) {
        var bR = bo2.R || 2.0;
        explode(p.x, 0.6, p.z, bo2.R ? 2.2 : 1.1, veff, M.dark);
        if (bo2.R) for (k = 0; k < 5; k++) explode(p.x + rnd(-bR, bR) * 0.7, 0.6, p.z + rnd(-bR, bR) * 0.7, 0.8, veff, M.dark);
        if (bo2.dmg > 0 && Math.abs(p.x - px) < bR + car.hw * 0.6 && Math.abs(p.z) < bR + 0.6 + car.hl * 0.5 && !(bo2.R && Math.abs(px) > 8.6)) hurt(bo2.dmg, 'bomb');
        gone = true;
      }
      if (gone) { bo2.owner = null; bo2.g.visible = false; bombPool.push(bo2); bombs.splice(i, 1); }
    }
    if (plane.visible) { plane.position.z -= 150 * dt; if (plane.position.z < -230) plane.visible = false; }
    if (bannerT > 0) { bannerT -= dt; if (bannerT <= 0) $('banner').hidden = true; }

    /* supply crate: floats down the road; drive through it to take what it shows */
    if (crate.active) {
      p = crate.g.position; p.z += (veff - 12) * dt; crate.phase += dt;
      crate.g.rotation.y += dt * 1.2; p.y = 1.3 + Math.sin(crate.phase * 3) * 0.12;
      if (on && !player.dead && Math.abs(p.x - px) < car.hw + 0.9 && Math.abs(p.z) < car.hl + 0.9) { applyItem(crate.item); crate.active = false; crate.g.visible = false; }
      else if (p.z > 18) { crate.active = false; crate.g.visible = false; }
    }

    /* particles, debris, rings, pickups */
    for (i = parts.length - 1; i >= 0; i--) {
      p = parts[i]; p.life -= dt;
      if (p.life <= 0) { p.s.visible = false; ppool[p.kind].push(p); parts.splice(i, 1); continue; }
      var t = 1 - p.life / p.max, s = lerp(p.s0, p.s1, t);
      p.vz += (veff - p.vz) * dt * 1.6 * p.drift; if (p.kind === 'glow') p.vy -= 9 * dt;
      p.s.position.x += p.vx * dt; p.s.position.y += p.vy * dt; p.s.position.z += p.vz * dt;
      p.s.scale.set(s, s, 1); p.s.material.opacity = p.a0 * (1 - t * t);
    }
    for (i = debris.length - 1; i >= 0; i--) {
      var d = debris[i]; d.life -= dt; p = d.m.position;
      if (d.life <= 0 || p.z > 22) { d.m.visible = false; dpool.push(d); debris.splice(i, 1); continue; }
      d.vy -= 28 * dt; p.x += d.vx * dt; p.y += d.vy * dt; p.z += d.vz * dt;
      d.m.rotation.x += d.rx * dt; d.m.rotation.z += d.rz * dt;
      if (p.y < 0.15) { p.y = 0.15; d.vy = Math.abs(d.vy) * 0.35; d.vx *= 0.6; d.vz = lerp(d.vz, veff, 0.5); d.rx *= 0.5; d.rz *= 0.5; }
    }
    for (i = 0; i < rings.length; i++) {
      var r = rings[i]; if (r.life <= 0) continue;
      r.life -= dt; var rt = 1 - Math.max(0, r.life) / r.max, rs = 1 + rt * r.size;
      r.m.scale.set(rs, 1, rs); r.m.material.opacity = 0.7 * (1 - rt); r.m.position.z += r.vz * dt;
      if (r.life <= 0) r.m.visible = false;
    }
    /* scrap flies to the car only from nearby; the magnet item pulls in all of it */
    for (i = scraps.length - 1; i >= 0; i--) {
      var sp = scraps[i]; sp.age += dt; p = sp.m.position;
      sp.m.rotation.x += 7 * dt; sp.m.rotation.y += 5 * dt;
      if (sp.age < 0.45) { sp.vy -= 26 * dt; p.x += sp.vx * dt; p.y = Math.max(0.3, p.y + sp.vy * dt); p.z += sp.vz * dt; }
      else {
        v3.set(px, 1.2, 0).sub(p); var dl = v3.length();
        if (!player.dead && (buff.magnet > 0 || sp.pull || dl < 13 + car.hl)) { sp.pull = true; p.addScaledVector(v3.normalize(), Math.min(dl, (30 + sp.age * 50) * dt)); }
        else p.z += veff * 0.55 * dt;
      }
      var got = !player.dead && Math.abs(p.x - px) < 1.4 + car.hw * 0.4 && Math.abs(p.z) < 1.6 + car.hl && sp.age > 0.3;
      if (got || p.z > 20 || sp.age > 7) {
        if (got) { scrap += Math.round(10 * car.scrapMul) * (buff.dbl > 0 ? 2 : 1); sfx('pickup'); spawnP('glow', p.x, p.y, p.z, 0, 2, 0, 0.25, 1.2, 2.6, COL.fire2, 0.8, 0); }
        sp.pull = false; sp.m.visible = false; spool.push(sp); scraps.splice(i, 1);
      }
    }
    for (i = 0; i < flashes.length; i++) flashes[i].intensity = Math.max(0, flashes[i].intensity - dt * 22);

    /* mission progress, road hints and captions */
    if (on) {
      if (briefT <= 0) { tPlay += dt; if (mission.goal === 'tut') tutStep(dt, car); else if (tPlay > 2) radioStep(car); }
      if ((mission.goal === 'kill' && kills >= mission.n) || (mission.goal === 'dist' && dist0() >= mission.n) || (mission.goal === 'time' && tPlay >= mission.n) || (mission.goal === 'race' && dist0() >= mission.n)) finish(true);
      else if (mission.goal === 'duel' && dist0() >= mission.n) { if (raceRank() === 1 || mode === 'demo') finish(true); else finish(false, (mission.rivalName || '요격 차량') + '이 먼저 도착했다.'); }
      else if (mission.goal === 'endless' && briefT <= 0 && mode === 'play') survStep();
      else if (mission.goal === 'collect' && picks >= mission.n) finish(true);
      else if (mission.goal === 'hunt' && hunts >= mission.n) finish(true);
      else if (mission.goal === 'rush') { if (dist0() >= mission.n) finish(true); else if (tPlay > rushLimit && mode === 'play') finish(false, '제한 시간이 지났다.'); }
      hud();
    } else if (mode === 'result' && resultT > 0) {
      resultT -= dt;
      if (resultT <= 0) { $('hud').hidden = true; $('result').hidden = false; }
    }
    var talk = mode === 'demo' && tr.phase === 'play';
    if (capHold > 0) {
      capHold -= dt;
      if (capHold <= 0) {
        if (talk) { $('caption').textContent = capList[capIdx++ % capList.length]; capHold = 4.2; }
        else $('caption').hidden = true;
      }
    } else if (talk) { $('caption').hidden = false; $('caption').textContent = capList[capIdx++ % capList.length]; capHold = 4.2; }
    var low = mode === 'play' && player.hp < car.hp * 0.3;
    if (low && !player.dead && briefT <= 0) sfx('alarm');
    if (Math.abs(tunK - echoK) > 0.03) { echoK = tunK; setEcho(tunK); }
    if (hitFlash > 0 || low) {
      hitFlash = Math.max(0, hitFlash - dt * 3.6);
      $('flash').style.opacity = (save.calm ? Math.max(hitFlash * 0.4, low ? 0.3 : 0) : Math.max(hitFlash, low ? 0.35 + 0.25 * Math.sin(time * 8) : 0)).toFixed(2);
    } else if ($('flash').style.opacity !== '0') $('flash').style.opacity = '0';
    setStyle('fade', 'opacity', tr.fade.toFixed(2));

    updSpeedLines(dt, on && !player.dead && briefT <= 0 ? Math.max(clamp((veff * 3.6 - 115) / 70, 0, 1), player.boost > 0 || buff.nitro > 0 ? 1 : 0) : 0, tunK > 0.5);

    /* wheel dust or spray, then rain, snow, wind and thunder */
    if (!player.dead) wheelSpray(dt, px, car);
    updWeather(dt, px, car, on);

    /* camera: the car always drives up the screen; the selection screen uses a closer chase view, the trailer cuts between shots */
    shake = Math.max(0, shake - dt * 3.2);
    if (save.calm) shake = Math.min(shake, 0.45);
    var sh = shake * shake * 0.5 + (on && !player.dead ? bmp * 0.035 : 0), wantFov, wantOffX = 0, wantOffY = 0, pull = (veff - 38) * 0.05 + (boss && boss.entered ? 2.6 : 0), cine = mode === 'demo', quick = 3.5;
    lowCam = save.cam === 'low' && (mode === 'play' || mode === 'result');
    var cock = !player.dead && (cine ? shotName === 'cockpit' && tr.phase === 'play' : save.cam === 'cockpit' && (mode === 'play' || (mode === 'result' && won)));
    if (mode === 'menu') {
      wantFov = shotPose('select', 0, px, car, pull);
      if (titleOn) { if (vw > 720) wantOffX = -vw * 0.2; else wantOffY = vh * 0.3; } else if (vw > 720) wantOffX = -Math.min(206, vw * 0.16); else wantOffY = vh * 0.4;
    } else if (cine) {
      shotT += dt; quick = shotName === 'missile' || shotName === 'bomber' ? 16 : 7;
      if (shotName === 'impact') { impact.z += 9 * dt; if (shotT > SHOT_DUR.impact) cutTo('chase'); }
      else if (shotName === 'missile') {
        if (!trackM) { impact.x = trackPos.x; impact.z = trackPos.z; cutTo('impact'); shotT = 1.2; }
        else if (shotT > SHOT_DUR.missile) { trackM = null; cutTo('chase'); }
      } else if (shotName === 'bomber') { if (!plane.visible || shotT > SHOT_DUR.bomber) cutTo('aerial'); }
      else if (tr.phase === 'play' && shotT > SHOT_DUR[shotName]) { shotIdx++; cutTo(SHOT_ORDER[shotIdx % SHOT_ORDER.length]); }
      wantFov = shotPose(shotName, shotT, px, car, pull);
    } else wantFov = shotPose(save.cam === 'cockpit' && !player.dead && (mode === 'play' || (mode === 'result' && won)) ? 'cockpit' : 'chase', 0, px, car, pull);
    if (shotName !== 'missile' && shotName !== 'bomber' || !cine) wantT.y += slope * (cock ? 30 : 16);
    if (cock) { quick = 20; sh *= 0.25; wantP.y += playerRoot.position.y; wantT.y += bodyP * 30; }
    var ck = shotCut ? 1 : 1 - Math.exp(-dt * quick);
    shotCut = false;
    camPos.lerp(wantP, ck); camTgt.lerp(wantT, ck); camFov = lerp(camFov, wantFov, ck); offX = lerp(offX, wantOffX, ck); offY = lerp(offY, wantOffY, ck);
    camera.position.set(camPos.x + rnd(-sh, sh), camPos.y + rnd(-sh, sh), camPos.z + rnd(-sh, sh) * 0.5);
    camera.lookAt(camTgt);
    camera.fov = camFov;
    /* the cockpit replaces the car's own model in the driver's view */
    if (cock !== cockpit.visible) { cockpit.visible = cock; camera.near = cock ? 0.2 : 0.5; if (cock) { cockpitFor(car); ckp.t = 0; } }
    car.g.visible = !cock && !player.dead;
    shieldGlow.visible = dashGlow.visible = muzzle.visible = !cock;
    if (cock) {
      ckp.spin.rotation.z = lerp(ckp.spin.rotation.z, clamp(-player.vx * 0.09, -1.5, 1.5), 1 - Math.exp(-dt * 10));
      ckp.t -= dt; if (ckp.t <= 0) { ckp.t = 0.12; drawCockpit(car, objective().txt); }
    }
    /* brake lamps brighten when the car is slowing; a white flash on the car itself when it is hit */
    var brk = clamp(-player.a / 5, 0, 1), tl = car.tails || [];
    for (i = 0; i < tl.length; i++) { tl[i].material.opacity = (0.45 + 0.5 * brk + 0.15 * night) * (i === 0 && dmgStage >= 2 ? (dmgStage === 3 ? 0 : (Math.sin(time * 31) > 0.2 ? 1 : 0.15)) : 1); tl[i].scale.setScalar(tl[i].userData.s0 * (1 + 0.9 * brk)); }   /* a damaged car's left tail lamp flickers, then goes out */
    if (hitGlowK > 0) hitGlowK = Math.max(0, hitGlowK - dt * 6);
    hitGlow.material.opacity = cock ? 0 : hitGlowK * (save.calm ? 0.3 : 0.75); hitGlow.scale.setScalar(5 + car.hl * 1.6);
    setStyle('vignette', 'opacity', (0.38 + 0.22 * night + 0.25 * tunK + (weather.cloud ? 0.1 : 0)).toFixed(2));
    updSky();
    if (mode === 'menu' && menuTab === 'gear' && !titleOn) {   /* item tab: practice targets, so every weapon has something to fire at */
      gearT -= dt;
      if (gearT <= 0 && enemies.length < 3) { gearT = 2.4; spawnEnemy('bike', pick(openLanes(dist + 110)), -110, 15); }
    }
    if (Math.abs(offX) > 0.5 || Math.abs(offY) > 0.5) camera.setViewOffset(vw, vh, offX, offY, vw, vh);
    else { if (camera.view && camera.view.enabled) camera.clearViewOffset(); camera.updateProjectionMatrix(); }
  }

  /* start on the selection screen: the chosen car drives up the screen behind the panel */
  loadSave(); setMuted(save.muted); musicOn = save.music; sfxOn = save.sfx; setCam(save.cam);
  makeThumbs(); resize(); applyGfx(save.gfx === 'auto' ? gfxStart() : save.gfx); carQ = CAR_ORDER.slice();
  touchUI = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  $('opt-unlock').checked = save.unlockAll; $('opt-gfx').value = save.gfx; $('opt-calm').checked = save.calm; $('opt-mirror').checked = save.mirror; syncSound();
  showTitle();
  for (var wi = 0; wi < 120; wi++) step(1 / 60);

  var last = performance.now();
  function frame(now) {
    var rdt = Math.min(0.05, (now - last) / 1000); last = now;
    if (slowT > 0) { slowT -= rdt; timeScale = lerp(timeScale, 0.25, 0.25); } else timeScale = lerp(timeScale, 1, 0.1);
    if (slowCd > 0) slowCd -= rdt;
    if (eventCd > 0) eventCd -= rdt;
    musicTick(); padStart();
    if (!document.hidden && rdt > 0) { if (!paused) step(rdt * timeScale); if (carQ.length && mode === 'menu') carThumbStep(); mirrorPass(); renderer.render(scene, camera); gfxTick(rdt); }
    requestAnimationFrame(frame);
  }
  /* one-off: merge the static parts of everything that loops or stands by the road */
  loops.forEach(function (lg) { if (lg.userData.drop) rowBake(lg); else bake(lg); });
  (function () { for (var rk in regionScenery) regionScenery[rk].forEach(function (o) { bake(o); }); })();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
  window.__preview = {
    taps: function () { return { cancelled: tapStat.cancelled, sent: tapStat.sent }; },
    tunnel: function () { var s = null, i; for (i = 0; i < sections.length; i++) if (sections[i].type === 'tunnel' && sections[i].d1 > dist) { s = sections[i]; break; } return s ? { toEntry: Math.round(s.d0 - dist), toExit: Math.round(s.d1 - dist), k: +tunK.toFixed(2), out: +tunOut.toFixed(2), glare: +tunGlare.toFixed(2), bg: '#' + scene.background.getHexString(), exp: +renderer.toneMappingExposure.toFixed(2) } : { out: +tunOut.toFixed(2), glare: +tunGlare.toFixed(2), adapt: +tunAdapt.toFixed(2), k: +tunK.toFixed(2), bg: '#' + scene.background.getHexString(), exp: +renderer.toneMappingExposure.toFixed(2) }; },
    hurt: function (d, kind) { hurt(d, kind); }, items: ITEMS, flying: function () { return missiles.length; },
    start: function (carKey, m, asDemo, roadFirst) {
      selCar = carKey; selMission = m;
      if (asDemo === true) { tr.on = true; tr.seq = [typeof m === 'string' ? { ta: +m.slice(2) } : { m: m }]; tr.count = 0; tr.carIdx = CAR_ORDER.indexOf(carKey); tr.fade = 0; trailerSegment(); trPhase('play'); tr.t = 1e9; tr.hold = true; }
      else { tr.on = false; tr.phase = ''; beginRun(carKey, m, false); briefT = 0; $('card').hidden = true; $('hud').hidden = false; }
      if (roadFirst !== undefined) resetRoad(roadFirst, mission.road);
    },
    startTA: function (carKey, idx, skipBrief) {
      selCar = carKey; selTrack = idx; selKind = 'ta'; tr.on = false; tr.phase = ''; beginRun(carKey, 0, false, idx);
      if (skipBrief) { briefT = 0.001; }
    },
    spawn: function (type, x, z, ws) { return spawnEnemy(type, x, z, ws === undefined ? 0 : ws); },
    startKind: function (kind, carKey, idx, o) {
      var k; selCar = carKey; selKind = kind; if (o) for (k in o) if (cond[k] !== undefined) cond[k] = o[k];
      if (kind === 'ta' || kind === 'race') selTrack = idx || 0; else if (kind === 'mis') selMission = idx || 0;
      tr.on = false; tr.phase = ''; beginRun(carKey, kind === 'mis' ? (idx || 0) : 0, false, kind === 'ta' || kind === 'race' ? (idx || 0) : undefined, kind, !!(o && o.cont));
      if (!(o && o.brief)) briefT = 0.001;
    },
    setCond: function (o) { for (var k in o) cond[k] = o[k]; if (mode === 'menu') { pickCourse(); renderCond(); renderFoot(); } },
    kind: function (k) { setKind(k); }, mirror: function () { mirrorPass(true); return mirrorQuad.visible; }, gfx: function (k) { save.gfx = k; applyGfx(k === 'auto' ? 'high' : k); return gfxNow; }, thumbs: function () { while (carQ.length) carThumbStep(); return Object.keys(THUMB).length; }, help: openHelp, ally: function () { return allyE ? { hp: Math.round(allyE.hp), ahead: Math.round(allyE.d - dist), x: +allyE.x.toFixed(1), kmh: Math.round(allyE.sp.v * 3.6), fin: allyE.fin } : null; }, mounts: function () { return sceneryNow.filter(function (o) { return o.userData.mount; }).map(function (o) { return [Math.round(o.position.x), Math.round(o.position.z), o.material.color.getHexString(), o.userData.base.getHexString(), o.visible]; }); }, dbg: function () { return { rv: rainMesh.visible, ro: rainMat.opacity, n: rainGeo.drawRange.count, p: [rainPos[0], rainPos[1], rainPos[2], rainPos[3], rainPos[4], rainPos[5]], sv: snowMesh.visible, so: snowMat.opacity, sp: [snowPos[0], snowPos[1], snowPos[2]], rainK: rainK, snowK: snowK, tunK: tunK }; }, regions: REGIONS, weathers: WEATHERS, missions: MISSIONS, addProp: function (t, ahead, x, o) { return addProp(t, dist + ahead, x, o); },
    rivals: function () { return rivals.map(function (e) { return { key: e.key, ahead: Math.round(e.d - dist), x: +e.x.toFixed(1), kmh: Math.round(e.sp.v * 3.6), fin: e.fin, stun: +e.stun.toFixed(1), hp: e.hp }; }); },
    auto: function (sec) { autoT = sec; },
    cam: function (m) { setCam(m, true); },
    tracks: TRACKS, weapons: WEAPONS, transit: function () { return enemies.filter(function (e) { return e.cfg.transit; }).map(function (e) { return { type: e.type, state: e.state, x: +e.g.position.x.toFixed(1), z: Math.round(e.g.position.z), ws: +e.ws.toFixed(1) }; }); }, stops: function () { return stops.map(function (x) { return { ahead: Math.round(x.d - dist), side: x.side, kind: x.kind, plan: x.plan }; }); }, secs: function () { return sections.map(function (x) { return x.type + ':' + Math.round(x.d0 - dist) + (x.deck ? ':' + x.deck : ''); }).join(' '); }, probe: function (names) { var out = [], p = Promise.resolve(); names.forEach(function (n) { p = p.then(function () { return probeSfx(n, 1); }).then(function (r) { out.push(r); }); }); return p.then(function () { return out; }); },
    trailer: startTrailer, tab: setTab, title: showTitle, pause: setPaused, ending: showEnding, cars: CARS, order: CAR_ORDER,
    menu: function (carKey, m) { selCar = carKey; selMission = m; toMenu(); },
    hold: function (on) { keys.u = !!on; keys.f = !!on; }, fire: function (on) { keys.f = !!on; }, keys: keys,
    win: function () { finish(true); }, basic: useBasic, basics: BASICS, story: openStory, tutorial: startTutorial, tutState: tut,
    propList: function () { return props.map(function (p) { return p.type + '@' + Math.round(p.d - dist) + '/' + p.x + (p.m.visible ? '' : '(hidden)') + ' y' + p.m.position.y.toFixed(2); }); },
    perfTop: function () {
      var rows = [], tag = function (o) { if (o === playerRoot) return 'playerRoot'; if (loops.indexOf(o) >= 0) return 'loop p' + o.userData.period; for (var i = 0; i < enemies.length; i++) if (enemies[i].g === o) return 'enemy ' + enemies[i].type; for (i = 0; i < props.length; i++) if (props[i].m === o) return 'prop ' + props[i].type; if (sceneryNow.indexOf(o) >= 0) return 'scenery'; return o.type + (o.name ? ' ' + o.name : ''); };
      scene.children.forEach(function (o) { if (!o.visible) return; var n = 0, sh = 0; o.traverseVisible(function (q) { if (q.isMesh || q.isSprite || q.isLine || q.isPoints) { n++; if (q.castShadow) sh++; } }); if (n) rows.push([tag(o), n, sh]); });
      var agg = {}; rows.forEach(function (r) { var a = agg[r[0]] || (agg[r[0]] = [0, 0, 0]); a[0]++; a[1] += r[1]; a[2] += r[2]; });
      return Object.keys(agg).map(function (k) { return k + ' x' + agg[k][0] + ' meshes ' + agg[k][1] + ' shadow ' + agg[k][2]; }).sort(function (a, b) { return +b.split('meshes ')[1].split(' ')[0] - +a.split('meshes ')[1].split(' ')[0]; });
    },
    perf: function () {
      var r = {}, n = 0, vis = 0, t0, i;
      renderer.render(scene, camera); r.calls = renderer.info.render.calls; r.tris = renderer.info.render.triangles;
      mirrorPass(true); r.geos = renderer.info.memory.geometries; r.tex = renderer.info.memory.textures;
      scene.traverse(function (o) { n++; }); scene.traverseVisible(function (o) { if (o.isMesh || o.isSprite || o.isLine || o.isPoints) vis++; });
      r.objs = n; r.visMesh = vis; r.baked = bakeStat.before + '>' + bakeStat.after;
      t0 = performance.now(); for (i = 0; i < 300; i++) step(1 / 60); r.stepMs = +((performance.now() - t0) / 300).toFixed(3);
      t0 = performance.now(); for (i = 0; i < 20; i++) { mirrorPass(true); } r.mirrorMs = +((performance.now() - t0) / 20).toFixed(2);
      t0 = performance.now(); for (i = 0; i < 20; i++) { renderer.render(scene, camera); } renderer.getContext().finish(); r.renderMs = +((performance.now() - t0) / 20).toFixed(2);
      return r;
    },
    sim: function (sec) { for (var i = 0; i < sec * 60; i++) { if (eventCd > 0) eventCd -= 1 / 60; if (slowCd > 0) slowCd -= 1 / 60; step(1 / 60); } },
    run: function (sec) { this.sim(sec); renderer.render(scene, camera); },
    skill: useSkill, strike: airStrike, keys: keys, player: player, cut: cutTo, save: save, crate: crate,
    spawnCrate: spawnCrate, item: function (i) { applyItem(i); }, equip: function (slot, w) { var lo = loadoutOf(selCar); lo[slot] = w; setCar(selCar, lo); },
    state: function () {
      var s = sectionAt(dist);
      return { mode: mode, car: player.car, hp: Math.round(player.hp), x: +player.x.toFixed(1), kills: kills, civ: civHits, score: score, scrap: scrap, bank: save.scrap, v: +veff.toFixed(1), enemies: enemies.length, props: props.length,
        sec: s ? s.type : '-', slope: +slopeAt(dist).toFixed(3), fire: fireIn, title: titleOn, paused: paused, dist: dist0(), t: +tPlay.toFixed(1), won: won, why: failWhy, cam: save.cam, cock: cockpit.visible, ta: runTA, tun: +tunK.toFixed(2), bombs: bombs.length, hulks: hulks.length, picks: picks, hunts: hunts, dmg: dmgLog, bcd: +(player.bcd || 0).toFixed(1), dstage: dmgStage, tut: tut.i, tutSeen: save.tut, caption: $('caption').hidden ? '' : $('caption').textContent, coach: $('coach').hidden ? '' : $('coach-do').textContent, hulkList: hulks.map(function (h) { return [+h.m.position.x.toFixed(1), +h.m.position.z.toFixed(1), +h.t.toFixed(2), h.hit ? 1 : 0].join('/'); }).join(' '), eb: ebullets.length, ebNear: ebullets.reduce(function (m, b) { var q = b.m.position; return Math.min(m, Math.round(Math.sqrt((q.x - player.x) * (q.x - player.x) + q.z * q.z))); }, 999), basic: CARS[player.car].basic, horn: +hornT.toFixed(1), boost: +player.boost.toFixed(1), limit: rushLimit, tire: playerTire, agg: +aggK().toFixed(2), susp: [+susp.f.toFixed(3), +susp.r.toFixed(3), +playerRoot.rotation.x.toFixed(3)], buffs: buffText(CARS[player.car]), cd: +player.cd.toFixed(1), gfxNow: gfxNow, sfxOn: sfxOn, kind: runKind, region: region.key, wx: weather.key, surf: sfc.key, grip: +sfc.grip.toFixed(2), cap: +sfc.cap.toFixed(2), rank: rivals.length ? raceRank() : 0, level: survLevel, cover: +snowCover.toFixed(2), gust: +gust.v.toFixed(1), fade: +tr.fade.toFixed(2), scn: sceneryNow.length, thr: +player.thr.toFixed(2), sel: selKind, shot: shotName, phase: tr.phase, mis: runMission, power: power, guns: guns.map(function (g) { return g.w; }).join('+') };
    },
    env: function () { mixEnv(1); }
  };
})();
