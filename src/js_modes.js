  /* ---------- modes: story missions, time attack, racing against rival cars, endless survival, free driving ---------- */
  var KINDS = {
    mis: { name: '미션', sub: '이야기를 따라가는 미션' },
    ta: { name: '타임어택', sub: '같은 길에서 기록 겨루기' },
    race: { name: '레이싱', sub: '경쟁 차량 5대와 순위 다툼' },
    surv: { name: '서바이벌', sub: '쓰러질 때까지 버티기' },
    story: { name: '이야기', sub: '고장 난 마성을 구구단으로 고치기' },
    quiz: { name: '구구단', sub: '정답이 적힌 깃발 문으로 지나가기' },
    free: { name: '연습 주행', sub: '문제 없이 길과 차에 익숙해지기' },
    tut: { name: '운전 연습', sub: '조작과 이야기 익히기' }
  };
  var KIND_ORDER = ['story', 'quiz', 'free'],   /* learning edition: the original modes stay in the code but are not offered; the quiz modes join this list */
      TIME_LABEL = { day: '낮', sunset: '노을', night: '밤' };
  var runKind = 'mis', rolling = false, cond = { region: 'city', time: 'day', weather: 'clear' }, raceM = [], rivals = [], finN = 0, survLevel = 1, farmT = 4;
  var RACE_REWARD = [400, 250, 150, 80, 50, 50];
  function condMission(kind) {
    var R = REGIONS[cond.region] || REGIONS.city, W = WEATHERS[cond.weather] || WEATHERS.clear, surv = kind === 'surv';
    return { kind: kind, name: surv ? '서바이벌' : '연습 주행', region: R.key, weather: W.key, time: cond.time, timeLabel: TIME_LABEL[cond.time], dir: 1, goal: surv ? 'endless' : 'free', n: 0, civ: 0, civLimit: 0,
      drones: 0, strike: 0, kami: 0, buggy: false, strikes: ['lane', 'cross', 'diag', 'chase', 'napalm', 'cluster'], traffic: 1.2, farm: R.key === 'country' ? (surv ? 0.5 : 1) : 0, label: surv ? '생존' : '연습 주행',
      why: R.name + ' · ' + TIME_LABEL[cond.time] + ' · ' + W.name, aim: surv ? '단계가 오를수록 거세지는 공격을 버티며 최대한 멀리 달린다.' : '문제 없이 길과 날씨, 차의 움직임에 익숙해진다. 앞차를 피해 빈 차로로 달린다.', win: '', lose: '', done: '' };
  }
  function raceOf(i) {
    if (raceM[i]) return raceM[i];
    var t = TRACKS[i], m = {}, k; for (k in t) m[k] = t[k];
    m.kind = 'race'; m.ta = false; m.rivals = 5; m.traffic = (t.traffic || 1) * 1.8; m.farm = (t.farm || 0) * 0.6; m.label = '결승선까지';
    m.aim = '경쟁 차량 5대보다 먼저 결승선을 지난다. 쏘거나 부딪혀 상대를 늦출 수 있다.';
    return (raceM[i] = m);
  }
  function missionFor(kind) { return kind === 'story' ? storyMission(selChapter) : kind === 'quiz' ? quizMission() : kind === 'ta' ? TRACKS[selTrack] : (kind === 'race' ? raceOf(selTrack) : (kind === 'surv' || kind === 'free' ? condMission(kind) : MISSIONS[selMission])); }
  function roadText(m) {
    var R = REGIONS[m.region || 'city'], W = WEATHERS[m.weather || 'clear'];
    return R.name + ' · ' + W.name + '. ' + R.feel + (W.key === 'clear' ? '' : ' ' + W.feel);
  }
  function condTag(m) { return '<span class="tag">' + REGIONS[m.region || 'city'].short + '</span><span class="tag">' + WEATHERS[m.weather || 'clear'].name + '</span>'; }

  /* --- rival cars: the other car models, driven by the same speed model as the player's car. They are entries in the enemy list, so every weapon works on them --- */
  var GRID = [[-2, 9], [6, 14], [-6, 20], [2, 27], [-2, 33]], PACE = [0.8, 0.84, 0.88, 0.92, 0.96], PACE3 = [0.84, 0.89, 0.94], PACE4 = [0.84, 0.88, 0.92, 0.96];
  var rsf = { key: '', grip: 1, cap: 1, drag: 0, bump: 0 };
  function rivalKeys(carKey, n) {
    var me = CARS[carKey], v = me.vmax, u = me.upTime || 10, list = CAR_ORDER.filter(function (k) { return k !== carKey; }), i, j, t;
    /* rivals are the cars closest to the player's in top speed and in how quickly they gain speed, so no car is handed a hopeless race */
    function gap(k) { var c = CARS[k]; return Math.abs(c.vmax - v) / v + 0.6 * Math.abs((c.upTime || 10) - u) / u; }
    list.sort(function (a, b) { return gap(a) - gap(b); });
    list = list.slice(0, Math.max(n, 9));
    for (i = list.length - 1; i > 0; i--) { j = (Math.random() * (i + 1)) | 0; t = list[i]; list[i] = list[j]; list[j] = t; }
    return list.slice(0, n);
  }
  function mkRunner(key, idx, ahead, x, pace, v0, extra, copy) {
    var car = CARS[key], root = new T.Group(), k, e, model = copy ? car.g.clone(true) : car.g;   /* copy: the player is driving this very model, so the runner gets a duplicate of it */
    root.add(model); model.visible = true; scene.add(root);
    e = { g: root, type: 'rival', cfg: { hp: 12, hw: car.hw, hl: car.hl, ws: 0, rs: 0, score: 150, y: 1.0, ram: 0, rival: true }, body: new T.MeshStandardMaterial({ color: car.paint ? car.paint.color : 0x888888 }), wheels: copy ? [] : car.wheels, model: model, own: !!copy,
      hp: 12, x0: x, phase: 0, flash: 0, fireT: 9, ws: v0, t: 0, st: 0, state: 0,
      car: car, key: key, idx: idx, d: dist + ahead, x: x, wantX: x, sp: { v: v0, a: 0 }, pace: pace, stun: 0, spin: 0, swipeT: 0, zone: '', aiT: idx * 0.04, jam: false, bumpT: 0, fin: 0 };
    if (extra) for (k in extra) e.cfg[k] = extra[k];
    e.hp = e.cfg.hp;
    root.position.set(x, 0, -ahead);
    enemies.push(e); rivals.push(e);
    return e;
  }
  function setupRivals(n, carKey) {
    var keys = rivalKeys(carKey, n), pace = n === 3 ? PACE3 : (n === 4 ? PACE4 : PACE), i;
    finN = 0;
    for (i = 0; i < n; i++) mkRunner(keys[i], i, GRID[i][1], GRID[i][0], pace[i], CARS[keys[i]].vmin);
  }
  /* escort: the vehicle to protect is a runner on the player's side. Weapons pass through it; every 폭주 vehicle that reaches it costs it hit points */
  var allyE = null;
  function setupAlly(carKey) {
    var key = mission.ally, car = CARS[key];
    allyE = mkRunner(key, 7, 20, -2, 1, clamp(player.v, car.vmin, car.vmax), { hp: mission.allyHp || 100, score: 0, civ: true, ally: true }, key === carKey);
  }
  function clearRivals() {
    for (var i = rivals.length - 1; i >= 0; i--) {
      var e = rivals[i], k = enemies.indexOf(e);
      if (k >= 0) enemies.splice(k, 1);
      if (!e.own) { e.car.g.visible = false; playerRoot.add(e.car.g); }
      scene.remove(e.g);
    }
    rivals.length = 0; finN = 0; allyE = null;
  }
  function raceRank() { var r = 1; for (var i = 0; i < rivals.length; i++) if (!rivals[i].cfg.ally && (rivals[i].fin || rivals[i].d > dist)) r++; return r; }
  function rivalCost(e, x) {
    var c = e.car, d = e.d, v = e.sp.v, look = Math.max(40, v * 1.7), cost = Math.abs(x - e.x) * 6, s, i, p, q, gap, o;
    for (s = 0; s <= look; s += 8) if (!laneOpen(x, d + s)) { cost += 900; break; }
    q = blockedAt(d + 4) || blockedAt(d + 34);
    if (q && q.split && (x > 0) !== (e.x > 0)) cost += 5000;
    for (i = 0; i < props.length; i++) {
      p = props[i]; if (!p.solid) continue; gap = p.d - d;
      if (gap > -4 - p.solid.hl && gap < look + p.solid.hl && Math.abs(p.x - x) < p.solid.hw + c.hw + 0.4) cost += p.solid.soft || 800;
    }
    for (i = 0; i < enemies.length && !e.cfg.ally; i++) {   /* the escorted vehicle holds its lane: clearing the way is the player's job */
      o = enemies[i]; if (o === e || o.cfg.air || o.cfg.boss) continue;
      gap = (dist - o.g.position.z) - d;
      if (gap > -(c.hl + o.cfg.hl + 1) && gap < look * 0.6 && Math.abs(o.g.position.x - x) < o.cfg.hw + c.hw + 0.5) cost += o.ws < v - 2 ? 420 : 160;
    }
    gap = dist - d;
    if (!player.dead && gap > -(c.hl + 3) && gap < look * 0.5 && Math.abs(player.x - x) < c.hw + CARS[player.car].hw + 0.5) cost += veff < v - 2 ? 420 : 160;
    cost += (1 - SURF[surfKey(x, d + 10)].cap) * 400;
    return cost;
  }
  function updRival(e, dt, px, pcar, on) {
    var c = e.car, p = e.g.position, i, pr, best = 1e9, bestX = e.wantX, zone = '', cst, lat, ahead, pace, vt, dx, k;
    e.aiT -= dt;
    if (e.aiT <= 0) {
      e.aiT = 0.18 + Math.random() * 0.08;
      for (i = 0; i < 4; i++) { cst = rivalCost(e, L4[i]); if (Math.abs(L4[i] - e.wantX) < 0.1) cst -= 40; if (cst < best) { best = cst; bestX = L4[i]; } }
      e.wantX = bestX; e.jam = best >= 600;
      /* rivals fight for position: they move across to block a car coming up behind and lean on a car that is alongside */
      var ag = aggK(), lead = e.d - dist;
      if (!e.cfg.ally && ag > 0 && !player.dead && !e.jam && e.stun <= 0) {
        if (e.blockT > 0) e.blockT -= 0.22;
        else if (lead > 6 && lead < 24 && veff > e.sp.v - 1.5 && Math.abs(player.x - e.x) > 1.5 && Math.random() < 0.3 * ag) {
          /* one move across, then it holds that lane for three seconds: a block can be answered by changing lane again */
          var bl = L4.reduce(function (a, b) { return Math.abs(b - player.x) < Math.abs(a - player.x) ? b : a; });
          if (rivalCost(e, bl) < 600) { e.wantX = bl; e.blockT = 3; }
        } else if (Math.abs(lead) < 4 && Math.abs(player.x - e.x) < 5.5 && e.swipeT <= 0 && Math.random() < 0.3 * ag) { e.wantX = clamp(player.x, -6, 6); e.swipeT = 5; }
      }
      if (e.swipeT > 0) e.swipeT -= 0.2;
    }
    for (i = 0; i < props.length; i++) {
      pr = props[i]; if (!pr.solid) continue;
      if (Math.abs(pr.d - e.d) < pr.solid.hl + c.hl * 0.85 && Math.abs(pr.x - e.x) < pr.solid.hw + c.hw * 0.9) {
        if (ZONE[pr.solid.kind]) zone = pr.solid.kind;
        else if (pr.solid.kind === 'hole') { if (!(pr.rh & (1 << e.idx))) { pr.rh |= 1 << e.idx; e.sp.v *= 0.96; } }
        else if (pr.solid.kind !== 'fire' && pr.solid.kind !== 'hump' && pr.solid.kind !== 'pick' && !(pr.rh & (1 << e.idx))) {
          pr.rh |= 1 << e.idx; e.sp.v = Math.max(c.vmin * 0.8, e.sp.v * 0.45); e.stun = Math.max(e.stun, 0.5);
          if (p.z < 10 && p.z > -90) { sfx('crash'); for (k = 0; k < 5; k++) spawnP('glow', p.x, 0.8, p.z, rnd(-8, 8), rnd(2, 8), rnd(4, 14), 0.3, 0.9, 0.1, COL.spark, 1); }
        }
      }
    }
    if (zone !== e.zone) { if (ZLOSS[zone]) e.sp.v = Math.max(c.vmin * 0.8, e.sp.v * (1 - ZLOSS[zone] * (1 - 0.4 * c.rough))); e.zone = zone; }
    surfaceFor(c, e.x, e.d, zone, rsf);
    ahead = e.d - dist;
    pace = e.cfg.ally ? e.pace : e.pace - (ahead > 220 ? 0.12 : (ahead > 70 ? 0.06 : 0)) + (ahead < -90 ? 0.05 : 0);
    vt = briefT > 0 || !on ? c.vmin : (e.stun > 0 ? c.vmin * 0.8 : (e.jam ? c.vmin + 0.15 * (c.vmax - c.vmin) : c.vmin + clamp(pace, 0.3, 1) * (c.vmax - c.vmin)));
    if (e.cfg.ally) {
      /* the escorted vehicle keeps station 20 m ahead of the player's car and matches its speed, whatever car the player drives */
      vt = e.jam ? Math.min(veff, c.vmin) : clamp(veff - (ahead - 20) * 0.7, 8, veff + 9);
      e.sp.v = lerp(e.sp.v, vt, 1 - Math.exp(-dt * 2.2)); e.sp.a = 0;
    } else advanceSpeed(c, e.sp, vt, dt, 1, slopeAt(e.d), rsf);
    if (briefT > 0 && mode === 'play' && !e.cfg.ally) { e.sp.v = c.vmin; e.sp.a = 0; }
    if (e.stun > 0) e.stun -= dt;
    e.d += e.sp.v * dt; e.ws = e.sp.v;
    lat = (7 + c.agility) * 0.5 * rsf.grip; dx = clamp(e.wantX - e.x, -lat * dt, lat * dt); e.x += dx;
    p.x = e.x; p.z = dist - e.d; e.x0 = e.x;
    if (e.spin > 0) { e.spin -= dt; e.g.rotation.y += dt * 9; } else e.g.rotation.y = clamp(-dx / Math.max(dt, 0.001) * 0.02, -0.3, 0.3);
    e.g.visible = p.z > -330 && p.z < 60;
    if (e.bumpT > 0) e.bumpT -= dt;
    /* contact with the player's car: side by side they push each other apart, nose to tail the one behind loses speed */
    if (!player.dead && Math.abs(p.x - px) < c.hw + pcar.hw - 0.05 && Math.abs(p.z) < c.hl + pcar.hl - 0.1) {
      var side = px >= p.x ? 1 : -1;
      if (c.hl + pcar.hl - Math.abs(p.z) > 1.2) { player.vx = side * 5; player.x = clamp(player.x + side * 0.14, minX, maxX); e.x -= side * 0.14; }
      else if (p.z < 0) { player.v = Math.max(pcar.vmin * 0.8, Math.min(player.v, e.sp.v - 1.5)); e.sp.v += 1.2; }
      else { e.sp.v = Math.max(c.vmin * 0.8, Math.min(e.sp.v, veff - 1.5)); player.v = Math.min(pcar.vmax, player.v + 0.8); }
      if (e.bumpT <= 0 && on && briefT <= 0) {
        e.bumpT = 0.6; hurt(3, 'ram'); sfx('crash'); shake = Math.min(1.2, shake + 0.3);
        for (k = 0; k < 5; k++) spawnP('glow', (p.x + px) / 2, 0.9, p.z / 2, rnd(-8, 8), rnd(2, 8), rnd(4, 14), 0.3, 0.9, 0.1, COL.spark, 1);
      }
    }
    if (e.cfg.ally) {
      for (i = 0; i < enemies.length; i++) {
        var o = enemies[i]; if (o.cfg.rival || o.cfg.air || o.cfg.boss || o.dieNow) continue;
        if (Math.abs(o.g.position.x - p.x) < o.cfg.hw + c.hw && Math.abs(o.g.position.z - p.z) < o.cfg.hl + c.hl) {
          o.dieNow = true; e.hp -= Math.min(10, (o.cfg.ram || 10) * 0.4); e.sp.v = Math.max(c.vmin * 0.8, e.sp.v * 0.85);
          if (p.z < 30 && p.z > -120) sfx('crash');
        }
      }
      if (e.hp <= 0 && !e.fin) {
        e.fin = 1; explode(p.x, 1.2, p.z, 2, veff - e.ws, e.body); e.model.visible = false;
        if (mode === 'play') finish(false, (mission.allyName || '호위 차량') + '가 파괴되었다.');
      } else if (!e.fin && on && briefT <= 0 && e.d - distStart >= mission.n) { e.fin = 1; if (live()) finish(true); }
    } else if (!e.fin && on && briefT <= 0 && e.d - distStart >= mission.n) {
      e.fin = ++finN;
      if (mission.goal === 'duel' && mode === 'play') finish(false, (mission.rivalName || '요격 차량') + '이 먼저 도착했다.');
    }
  }
  /* a rival that is shot down spins out and loses its speed, then carries on */
  function rivalDown(e) {
    var p = e.g.position, k;
    if (e.cfg.ally) return;
    e.hp = e.cfg.hp; e.stun = 2.4; e.spin = 0.7; e.sp.v = Math.max(e.car.vmin * 0.8, e.sp.v * 0.5);
    explode(p.x, 1, p.z, 0.8, veff - e.ws, e.body);
    for (k = 0; k < 3; k++) spawnScrap(p.x, 1.4, p.z, veff - e.ws);
    kills++; addScore(150);
  }
  /* survival: a new stage every 25 seconds brings denser traffic, then buggies and drones, then suicide drones, then air strikes */
  function survStep() {
    var L = 1 + Math.floor(tPlay / 25), m = mission;
    if (L !== survLevel) { survLevel = L; if (L > 1) sfx('go'); }
    m.traffic = Math.max(0.5, 1.3 - 0.1 * L); m.buggy = L >= 2; m.drones = L >= 2 ? Math.min(1.6, 0.35 * (L - 1)) : 0;
    m.kami = L >= 3 ? Math.min(1.2, 0.3 * (L - 2)) : 0; m.strike = L >= 4 ? Math.min(1.2, 0.25 * (L - 3)) : 0;
  }

