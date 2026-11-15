  /* ---------- 깃발 문: the quiz on the road. A question shows at the top, a row of gates comes down the road with one option on each,
     and the gate the car drives through is the answer. The gates split the whole road between them, so there is always an answer;
     the time to think is set in seconds, and the gates are put as far ahead as the car covers in that time ---------- */
  var QG_EDGE = 8.6, QG_COL = ['#1967d2', '#8e24aa', '#e8710a', '#00897b'];   /* blue, purple, orange, teal: no colour hints at right or wrong */
  var quiz = { deck: null, q: null, phase: 'off', t: 0, d: 0, g: null, combo: 0, best: 0, ok: 0 };
  var gateSets = {};
  /* an answer panel, as in the mockup: a glossy plate in the gate's colour, a white rim, a big number or word with a soft shadow */
  function shadeHex(hex, k) {
    var n = parseInt(hex.slice(1), 16), f = function (v) { return Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k)); };
    return 'rgb(' + f(n >> 16) + ',' + f((n >> 8) & 255) + ',' + f(n & 255) + ')';
  }
  function gateTex(c, text, col, dim) {
    var x = c.getContext('2d'), w = c.width, h = c.height, r = h * 0.16, m = h * 0.045;
    x.clearRect(0, 0, w, h);
    x.globalAlpha = dim ? 0.3 : 1;
    var g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, shadeHex(col, 0.28)); g.addColorStop(0.55, col); g.addColorStop(1, shadeHex(col, -0.35));
    x.fillStyle = g; x.beginPath(); x.roundRect(m, m, w - 2 * m, h - 2 * m, r); x.fill();
    x.lineWidth = h * 0.04; x.strokeStyle = 'rgba(255,255,255,0.95)'; x.stroke();
    var gl = x.createLinearGradient(0, m, 0, h * 0.5);
    gl.addColorStop(0, 'rgba(255,255,255,0.45)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = gl; x.beginPath(); x.roundRect(m * 2.2, m * 2.2, w - m * 4.4, h * 0.4, r * 0.75); x.fill();
    var fs = Math.round(h * 0.64), font = function (z) { return '400 ' + z + 'px "Black Han Sans", "Noto Sans KR", system-ui, sans-serif'; };
    x.font = font(fs); var tw = x.measureText(String(text)).width;
    if (tw > w - h * 0.24) { fs = Math.floor(fs * (w - h * 0.24) / tw); x.font = font(fs); }   /* a word like 가르치셨다 shrinks to fit the sign */
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.shadowColor = 'rgba(0,0,0,0.45)'; x.shadowBlur = h * 0.07; x.shadowOffsetY = h * 0.03;
    x.fillStyle = '#ffffff'; x.fillText(String(text), w / 2, h * 0.55);
    x.shadowColor = 'transparent'; x.shadowBlur = 0; x.shadowOffsetY = 0;
    x.globalAlpha = 1;
  }
  /* light-painted chevrons on the lane in front of a gate, one texture for every gate; its offset makes them flow forward */
  var chevTex = (function () {
    var c = document.createElement('canvas'); c.width = 128; c.height = 128;
    var x = c.getContext('2d');
    x.strokeStyle = '#ffffff'; x.lineWidth = 16; x.lineCap = 'round'; x.lineJoin = 'round';
    x.shadowColor = '#ffffff'; x.shadowBlur = 10;
    x.beginPath(); x.moveTo(18, 92); x.lineTo(64, 44); x.lineTo(110, 92); x.stroke();
    var t = new T.CanvasTexture(c); t.wrapS = T.ClampToEdgeWrapping; t.wrapT = T.RepeatWrapping; t.repeat.set(1, 5);
    return t;
  })();
  /* one set of gates per option count, built the first time it is needed. Each answer has its own neon frame in its colour */
  function gateSet(n) {
    if (gateSets[n]) return gateSets[n];
    var g = new T.Group(), W = 2 * QG_EDGE / n, s = { g: g, n: n, W: W, banners: [], neon: [], i: 0 }, i;
    var tube = new T.BoxGeometry(1, 1, 1);
    for (i = 0; i < n; i++) {
      var cx = -QG_EDGE + W * (i + 0.5), hw = W / 2 - 0.3, base = C(parseInt(QG_COL[i].slice(1), 16));
      var nm = new T.MeshBasicMaterial({ color: base.clone() });
      s.neon.push({ m: nm, base: base });
      [cx - hw, cx + hw].forEach(function (px) { var p = new T.Mesh(tube, nm); p.scale.set(0.2, 5.0, 0.2); p.position.set(px, 2.5, 0); g.add(p); });
      var bar = new T.Mesh(tube, nm); bar.scale.set(2 * hw + 0.2, 0.2, 0.2); bar.position.set(cx, 5.0, 0); g.add(bar);
      var halo = glowSprite(parseInt(QG_COL[i].slice(1), 16), Math.min(W * 1.4, 10), 0.35); halo.material.fog = false; halo.position.set(cx, 3.3, -0.4); g.add(halo);
      var c = document.createElement('canvas'); c.width = 512; c.height = 256;
      var tx = new T.CanvasTexture(c); tx.colorSpace = T.SRGBColorSpace; tx.anisotropy = 4;
      var bw = Math.min(W - 0.7, 4.4), m = new T.Mesh(new T.PlaneGeometry(bw, bw / 2), new T.MeshBasicMaterial({ map: tx, transparent: true, fog: false, depthWrite: false }));
      m.position.set(cx, 3.3, 0.05); g.add(m);
      var am = new T.MeshBasicMaterial({ map: chevTex, color: base.clone().multiplyScalar(1.4), transparent: true, opacity: 0.85, depthWrite: false, blending: T.AdditiveBlending });
      var lane = new T.Mesh(new T.PlaneGeometry(Math.min(W - 1.2, 6), 24, 1, 6), am);
      lane.rotation.x = -Math.PI / 2; lane.position.set(cx, 0.04, 12); g.add(lane);
      s.banners.push({ c: c, tx: tx, m: m, arrows: am });
    }
    g.visible = false; scene.add(g);
    return (gateSets[n] = s);
  }
  /* neon brightness: brighter than white so the bloom picks it up, more so at night, and a flare when an answer is taken */
  var gatePulse = 0;
  function gateGlow(dt) {
    var s = quiz.g; if (!s) return;
    gatePulse = Math.max(0, gatePulse - dt * 2);
    var k = 1.5 + 1.8 * cur.night + gatePulse * 2.5;
    s.neon.forEach(function (o) { o.m.color.copy(o.base).multiplyScalar(k); });
    chevTex.offset.y = (chevTex.offset.y - dt * 1.6) % 1;
  }
  function gatesShow(q) {
    var s = gateSet(q.n);
    s.banners.forEach(function (b, i) { gateTex(b.c, q.opts[i], QG_COL[i], false); b.tx.needsUpdate = true; b.m.material.opacity = 1; b.arrows.opacity = 0.85; });
    s.g.visible = true; quiz.g = s;
  }
  function gatesDim(q, picked) {
    quiz.g.banners.forEach(function (b, i) { if (i !== q.slot) { gateTex(b.c, q.opts[i], QG_COL[i], true); b.tx.needsUpdate = true; } });
  }
  function quizOff() {
    var k;
    for (k in gateSets) gateSets[k].g.visible = false;
    for (k in balloonSets) balloonSets[k].g.visible = false;
    quiz.phase = 'off'; quiz.g = null; quiz.b = null; quiz.q = null; $('qbox').hidden = true;
  }
  function danLabel(dans) {
    if (dans.length === 8) return '2단~9단';
    return dans.map(function (d) { return d + '단'; }).join('·');
  }
  var SPELL_SETS = {}; SPELL_DATA.sets.forEach(function (st) { SPELL_SETS[st.key] = st; });
  var SPELL_ORDER = SPELL_DATA.sets.map(function (st) { return st.key; });
  function spellSel() { var s = save.quiz.sel, k = s.spell || 'dwae'; return { subject: 'spell', sets: k === 'all' ? SPELL_ORDER.slice() : [own(SPELL_SETS, k) ? k : 'dwae'], type: 'spell', pace: s.pace, foe: s.foe !== 'off', style: s.style === 'shoot' ? 'shoot' : 'gate' }; }
  function setLabel(sets) { return sets.length === SPELL_ORDER.length ? '모든 묶음' : sets.map(function (k) { return SPELL_SETS[k].name; }).join('·'); }
  function quizSel() { var s = save.quiz.sel; return { dans: s.dan === 'all' ? [2, 3, 4, 5, 6, 7, 8, 9] : s.dan.split(',').map(Number), type: s.type, pace: s.pace, foe: s.foe !== 'off', style: s.style === 'shoot' ? 'shoot' : 'gate' }; }
  /* enemies on a quiz road, as in the original missions: f = { drones, kami, strike, buggy, traffic }. null: only the gates */
  function quizFoes(m, f) {
    m.drones = f ? f.drones || 0 : 0; m.kami = f ? f.kami || 0 : 0; m.strike = f ? f.strike || 0 : 0; m.buggy = f ? !!f.buggy : false;
    m.strikes = f && f.strikes ? f.strikes : ['lane', 'chase'];
    m.traffic = f ? f.traffic || 1.2 : 1; m.chasers = f ? 1 : 0; m.noFoes = !f;
    return m;
  }
  function quizMission(kind) {
    var spell = kind === 'spell', m = condMission('free'), o = spell ? spellSel() : quizSel();
    m.kind = spell ? 'spell' : 'quiz'; m.goal = 'quiz'; m.name = spell ? '맞춤법 ' + setLabel(o.sets) : '구구단 ' + danLabel(o.dans); m.label = QUIZ_TYPES[o.type].name; m.quiz = o;
    m.farm = o.foe && m.region === 'country' ? 0.6 : 0; m.road = { order: ['hill'], gap: [300, 420] };
    quizFoes(m, o.foe ? { drones: 0.5, buggy: true, traffic: 1.2 } : null);
    m.aim = (o.style === 'shoot' ? '문제를 보고 정답이 적힌 풍선을 쏘아 맞힌다.' : '문제를 보고 정답이 적힌 깃발 문으로 지나간다.') + (spell ? ' 빈칸에 들어갈 바른 말을 고른다.' : '') + (o.foe ? ' 덤비는 폭주 차량과 드론은 쏴서 막는다.' : '') + ' 틀린 문제는 끝에 한 번 더 나온다.';
    return m;
  }
  function quizRun() { return runKind === 'quiz' || runKind === 'spell' || runKind === 'story'; }
  function quizBegin() {
    var o = mission.quiz || quizSel();
    quizOff();
    quiz.deck = o.subject === 'spell' ? quizDeck({ subject: 'spell', sets: o.sets, bank: SPELL_SETS, n: 10, stats: save.quiz.facts }) : quizDeck({ dans: o.dans, type: o.type, n: 10, stats: save.quiz.facts, zero: !!o.zero });
    quiz.style = o.style === 'shoot' && EDU.arms ? 'shoot' : 'gate'; quiz.pace = own(QUIZ_PACE, o.pace) ? QUIZ_PACE[o.pace] : QUIZ_PACE.mid; quiz.combo = 0; quiz.best = 0; quiz.ok = 0; quiz.hinted = false;
    quiz.phase = 'wait'; quiz.t = 0.8;
  }
  function qboxSet(kick, text, cls, q, why) {
    $('q-kick').textContent = kick; $('q-text').textContent = text; $('qbox').className = 'qbox' + (cls ? ' ' + cls : '') + (text.length > 12 ? ' long' : '');
    $('q-why').textContent = why || ''; $('q-why').hidden = !why;
    var h = '';
    if (q) q.opts.forEach(function (v, i) { h += '<span style="background:' + QG_COL[i] + '">' + v + '</span>'; });
    $('q-opts').innerHTML = h; $('q-opts').hidden = !q;
    $('qbox').hidden = false;
  }
  /* 맞히기: the options come as numbered balloons, one over each part of the road. They drift in, hover ahead for the time to think, then come on;
     shooting one picks it, and if none is shot the one the car drives into is the pick (so a car with only a saw or missiles can still answer) */
  var QB_HOLD = -27, balloonSets = {};
  function balloonSet(n) {
    if (balloonSets[n]) return balloonSets[n];
    var g = new T.Group(), W = 2 * QG_EDGE / n, s = { g: g, n: n, W: W, items: [] }, i;
    for (i = 0; i < n; i++) {
      var col = parseInt(QG_COL[i].slice(1), 16), b = new T.Group(), x = -QG_EDGE + W * (i + 0.5);
      var ball = new T.Mesh(new T.SphereGeometry(0.85, 16, 12), std(col, 0.35)); ball.scale.y = 1.15; ball.position.y = 3.3; ball.castShadow = true; b.add(ball);
      b.add(cyl(0.02, 0.02, 1.3, 4, M.white, 0, 2.05, 0));
      var c = document.createElement('canvas'); c.width = 512; c.height = 256;
      var tx = new T.CanvasTexture(c); tx.colorSpace = T.SRGBColorSpace;
      var bw = Math.min(W - 0.6, 3.2), m = new T.Mesh(new T.PlaneGeometry(bw, bw / 2), new T.MeshBasicMaterial({ map: tx, transparent: true, fog: false, depthWrite: false }));
      m.position.y = 1.35; b.add(m);
      b.position.x = x; g.add(b);
      s.items.push({ g: b, c: c, tx: tx, x: x, hw: bw / 2, hp: 0, popped: false });
    }
    g.visible = false; scene.add(g);
    return (balloonSets[n] = s);
  }
  function balloonsShow(q) {
    var s = balloonSet(q.n);
    s.items.forEach(function (it, i) { gateTex(it.c, q.opts[i], QG_COL[i], false); it.tx.needsUpdate = true; it.hp = 0; it.popped = false; it.g.visible = true; });
    s.g.visible = true; s.g.position.set(0, 0, -95); quiz.b = s;
  }
  /* called for every player bullet: true when it hit a balloon */
  function quizShot(p, b) {
    var s = quiz.b, i;
    if (!s || quiz.phase !== 'ask' || p.y > 3.9) return false;
    var z = s.g.position.z, z0 = b && b.z0 !== undefined ? b.z0 : p.z;
    if (p.z > z + 1.6 || z0 < z - 1.6) return false;   /* swept: the stretch flown this frame */
    for (i = 0; i < s.items.length; i++) {
      var it = s.items[i];
      if (it.popped || b.hits.indexOf(it) >= 0 || Math.abs(p.x - it.x) > it.hw) continue;
      b.hits.push(it); it.hp += b.dmg;
      spawnP('glow', it.x, 1.4, z, 0, 0, 0, 0.15, 1.5, 3, COL.white, 0.8, 0);
      if (it.hp >= 3) quiz.shotPick = i;
      return true;
    }
    return false;
  }
  function quizJudge(picked, px, car) {
    var dk = quiz.deck, q = quiz.q, first = dk.i <= dk.main, ok = quizAnswer(dk, q, picked);
    postFlash(ok);
    if (first) factRecord(save.quiz.facts, q.key, ok);
    if (quiz.g) { gatesDim(q, picked); quiz.g.banners.forEach(function (b) { b.arrows.opacity = 0; }); gatePulse = 1; }
    if (quiz.b) quiz.b.items.forEach(function (it, i) { if (i !== q.slot) { gateTex(it.c, q.opts[i], QG_COL[i], true); it.tx.needsUpdate = true; } if (i === picked) { it.popped = true; it.g.visible = false; spawnRing(it.x, quiz.b.g.position.z, 5, 0.35, veff, i === q.slot ? COL.cyan : COL.orange); } });
    if (ok) {
      if (first) quiz.ok++; quiz.combo++; quiz.best = Math.max(quiz.best, quiz.combo); score += 100 + 20 * Math.min(quiz.combo - 1, 5); scrap += 20;
      buff.nitro = Math.max(buff.nitro, 1.2); sfx('item');
      if (EDU.arms) player.hp = Math.min(car.hp, player.hp + car.hp * 0.2);   /* a right answer repairs a fifth of the car: solving keeps you on the road */
      spawnRing(px, 0, 9, 0.45, 0, COL.cyan); spawnP('glow', px, 1.4, 0, 0, 0, 0, 0.4, 4, 12, COL.cyan, 0.9, 0);
      qboxSet((quiz.combo >= 3 ? quiz.combo + '개 연속 정답!' : '정답!') + (EDU.arms ? ' · 수리 +20%' : ''), q.full, 'ok');
    } else {
      quiz.combo = 0; player.v = Math.max(car.vmin, player.v * 0.7); sfx('thud');
      qboxSet(dk.queued ? '정답은 이거예요 · 끝에 한 번 더 나와요' : '정답은 이거예요', q.full, 'no', null, q.why);
    }
    quizToast(ok, q, dk.queued);
    quiz.phase = 'show'; quiz.t = ok ? 1.6 : (q.why ? 3.6 : 2.4);   /* a spelling miss shows why, which takes longer to read */
  }
  function quizStep(dt, px, car) {
    if (quiz.phase === 'off' || mode !== 'play' || briefT > 0 || player.dead) return;
    var dk = quiz.deck, q = quiz.q, bs = quiz.b;
    gateGlow(dt);
    if (quiz.g) {
      var gz = quiz.g.g.position.z = dist - quiz.d, fade = clamp(-(gz + 2) / 12, 0, 1);   /* the signs fade as the car passes under, so they never fill the screen */
      quiz.g.banners.forEach(function (b) { b.m.material.opacity = fade; });
      if (quiz.phase !== 'ask' && gz > 40) { quiz.g.g.visible = false; quiz.g = null; }
    }
    if (bs) {
      var bz = bs.g.position.z;
      if (quiz.phase === 'ask') {
        if (bz < QB_HOLD && quiz.hold > 0) bs.g.position.z = Math.min(QB_HOLD, bz + Math.max(18, veff) * dt);   /* drift in */
        else if ((quiz.hold -= dt) <= 0) bs.g.position.z = bz + veff * dt;                                       /* time is up: they come on */
      } else { bs.g.position.z = bz + veff * dt; if (bs.g.position.z > 30) { bs.g.visible = false; quiz.b = null; } }
      bs.items.forEach(function (it, i) { it.g.position.y = Math.sin(time * 2 + i) * 0.15; });
    }
    quiz.t -= dt;
    if (quiz.phase === 'ask' && (!quiz.b || quiz.b.g.position.z >= QB_HOLD - 0.01)) quiz.askE += dt;   /* game time (a pause does not run the clock); balloons start it once they have drifted in */
    if (quiz.phase === 'wait' && quiz.t <= 0) {
      q = quiz.q = quizNext(dk);
      if (!q) { quiz.phase = 'done'; finish(true); return; }
      var think = quiz.pace.t + QUIZ_TYPES[q.type].think;
      quiz.phase = 'ask'; quiz.shotPick = -1; quiz.askE = 0; quiz.askLen = think; quiz.askD0 = dist;
      if (quiz.g) { quiz.g.g.visible = false; quiz.g = null; }
      if (quiz.b) { quiz.b.g.visible = false; quiz.b = null; }
      if (quiz.style === 'shoot') { balloonsShow(q); quiz.hold = think; }
      else { quiz.d = dist + Math.max(70, veff * think); gatesShow(q); quiz.g.g.position.set(0, 0, dist - quiz.d); }
      qboxSet(dk.i > dk.main ? '다시 풀기' : '문제 ' + dk.i + ' / ' + dk.main, q.text, '', q);
      sfx('cycle'); storyRadio(dk);
    } else if (quiz.phase === 'ask' && quiz.g && dist >= quiz.d) quizJudge(clamp(Math.floor((px + QG_EDGE) / quiz.g.W), 0, q.n - 1), px, car);
    else if (quiz.phase === 'ask' && quiz.b && quiz.shotPick >= 0) quizJudge(quiz.shotPick, px, car);
    else if (quiz.phase === 'ask' && quiz.b && quiz.b.g.position.z > -1.5) quizJudge(clamp(Math.floor((px + QG_EDGE) / quiz.b.W), 0, q.n - 1), px, car);
    else if (quiz.phase === 'show' && quiz.t <= 0) { quiz.phase = 'wait'; quiz.t = 0.6; $('qbox').hidden = true; }
  }
  function quizObjective() {
    var dk = quiz.deck;
    if (!dk) return { f: 0, txt: '' };
    var n = Math.min(dk.i, dk.main), extra = dk.items.length - dk.main;
    return { f: dk.log.length / dk.items.length, txt: (dk.i > dk.main ? '다시 풀기 ' + (dk.i - dk.main) + ' / ' + extra : '문제 ' + Math.max(1, n) + ' / ' + dk.main) + ' · 맞힘 ' + quiz.ok };
  }
  /* the result panel for a quiz run; returns the sound to play */
  function quizResult(win) {
    var sc = quizScore(quiz.deck), N = function (v) { return v.toLocaleString('ko-KR'); }, got = win ? scrap : Math.floor(scrap / 2), all = win && sc.right === sc.total;
    var asked = {}; quiz.deck.items.forEach(function (q) { asked[q.key] = true; });
    var dk = quiz.deck, spell = dk.subject === 'spell', fullOf = {};
    dk.items.forEach(function (q) { fullOf[q.key] = spell ? q.full : q.full.replace(/ /g, ''); });
    save.quiz.runs = (save.quiz.runs || []).concat([{ day: dayText(Date.now()), name: mission.name, type: QUIZ_TYPES[dk.type].name, right: sc.right, total: sc.total }]).slice(-30);
    save.scrap += got; storeSave(); setMusic('menu'); quizOff();
    $('res-grid').innerHTML = spell ? spellTable(dk.sets, asked) : factGrid(dk.dans.slice().sort(), asked);
    $('res-title').textContent = !win ? '차가 멈췄어요' : all ? '모두 맞혔다!' : (sc.right >= sc.total * 0.7 ? '잘했어요' : '끝까지 달렸어요');
    $('res-story').textContent = !win ? failWhy + ' ' + quiz.deck.main + '문제 가운데 ' + sc.total + '문제까지 풀고 ' + sc.right + '문제를 맞혔다.'
      : sc.total + '문제 가운데 ' + sc.right + '문제를 맞혔다.' + (sc.missed.length ? ' 틀린 문제는 끝에서 ' + sc.fixed + '개를 다시 맞혔다.' : '');
    resRows([['문제', mission.name + (spell ? '' : ' · ' + QUIZ_TYPES[dk.type].name)], ['맞힌 문제', sc.right + ' / ' + sc.total], ['가장 긴 연속 정답', quiz.best + '개'],
      ['다시 볼 문제', sc.missed.length ? sc.missed.filter(function (k, i) { return sc.missed.indexOf(k) === i; }).map(function (k) { return fullOf[k]; }).join(spell ? ' / ' : ', ') : '없음'], ['점수', N(score)]]);
    $('res-reward').textContent = (win ? '고철 ' + got : '모은 고철의 절반 ' + got) + ' · 보유 ' + N(save.scrap);
    if (runKind === 'story') return storyAfter(sc, win);
    return !win ? 'fail' : all ? 'record' : (sc.right >= sc.total * 0.7 ? 'win' : 'fail');
  }
  /* the 9×9 record. dans: the rows to show; now: the facts of the run just played, outlined */
  var LV_MARK = { good: '★', learn: '●', hard: '▲', 'new': '' };
  function factGrid(dans, now) {
    var h = '<table class="fgrid"><tr><th></th>', a, b;
    for (b = 1; b <= 9; b++) h += '<th>×' + b + '</th>';
    h += '</tr>';
    dans.forEach(function (a) {
      h += '<tr><th>' + a + '단</th>';
      for (b = 1; b <= 9; b++) {
        var k = a + 'x' + b, lv = factLevel(save.quiz.facts[k]);
        h += '<td class="lv-' + lv + (now && now[k] ? ' now' : '') + '" title="' + a + '×' + b + '=' + a * b + ' · ' + FACT_LEVEL[lv] + '">' + a * b + '<i>' + LV_MARK[lv] + '</i></td>';
      }
      h += '</tr>';
    });
    return h + '</table><div class="flegend"><span>★ 잘함 (세 번 연속 맞힘)</span><span>● 연습 중</span><span>▲ 어려움 (최근 첫 답이 틀림)</span><span>빈칸 처음</span></div>';
  }
  function levelCount(dans) {
    var c = { good: 0, learn: 0, hard: 0, 'new': 0 };
    dans.forEach(function (a) { for (var b = 1; b <= 9; b++) c[factLevel(save.quiz.facts[a + 'x' + b])]++; });
    return c;
  }
  /* 맞춤법 record: one row per set, how many of its sentences are at each level */
  function spellTable(sets, now) {
    var h = '<table class="stable"><tr><th>묶음</th><th>★ 잘함</th><th>● 연습 중</th><th>▲ 어려움</th><th>처음</th></tr>';
    sets.forEach(function (k) {
      var c = { good: 0, learn: 0, hard: 0, 'new': 0 }, st = SPELL_SETS[k], hit = false;
      st.items.forEach(function (it, i) { var key = 'sp:' + k + ':' + i; c[factLevel(save.quiz.facts[key])]++; if (now && now[key]) hit = true; });
      h += '<tr' + (hit ? ' class="now"' : '') + '><th>' + st.name + '</th><td class="lv-good">' + c.good + '</td><td class="lv-learn">' + c.learn + '</td><td class="lv-hard">' + c.hard + '</td><td class="lv-new">' + c['new'] + '</td></tr>';
    });
    return h + '</table>';
  }
  function renderRec() {
    var all = [2, 3, 4, 5, 6, 7, 8, 9], c = levelCount(all), runs = save.quiz.runs || [], h = '';
    $('rec-sum').textContent = '72문제 가운데 잘함 ' + c.good + ' · 연습 중 ' + c.learn + ' · 어려움 ' + c.hard + ' · 처음 ' + c['new'];
    $('rec-grid').innerHTML = factGrid(all);
    $('rec-spell').innerHTML = spellTable(SPELL_ORDER);
    runs.slice(-10).reverse().forEach(function (r) { h += row(r.day, r.name + ' · ' + r.type + ' · ' + r.right + ' / ' + r.total); });
    $('rec-runs').innerHTML = h || row('아직', '한 판을 끝내면 여기에 남습니다.');
  }
  function dayText(t) { var d = new Date(t); return (d.getMonth() + 1) + '월 ' + d.getDate() + '일 ' + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes(); }
  /* menu: what to ask */
  var DAN_OPTS = [['2', '2단'], ['3', '3단'], ['4', '4단'], ['5', '5단'], ['6', '6단'], ['7', '7단'], ['8', '8단'], ['9', '9단'], ['2,5', '2단과 5단'], ['3,6', '3단과 6단'], ['4,8', '4단과 8단'], ['all', '2단~9단 모두']];
  function renderQuiz() {
    var s = save.quiz.sel, spell = selKind === 'spell', o = spell ? spellSel() : quizSel(), t = QUIZ_TYPES[o.type], p = QUIZ_PACE[o.pace];
    $('opt-dan').value = s.dan; $('opt-qtype').value = s.type; $('opt-pace').value = s.pace; $('opt-spell').value = s.spell || 'dwae';
    $('lb-dan').hidden = spell; $('lb-qtype').hidden = spell; $('lb-spell').hidden = !spell;
    $('quiz-premise').textContent = spell ? '새벽: “마성의 글자 칩도 말썽이야. 빈칸에 들어갈 바른 말이 적힌 문으로 지나가 줘.”' : '새벽: “마성이 계산을 까먹었어. 길마다 숫자 갈림길이 생겼는데, 맞는 답이 적힌 문으로 지나가면 다시 기억해.”';
    $('opt-foe').value = s.foe === 'off' ? 'off' : 'on'; $('opt-style').value = o.style;
    if (spell) {
      var st = o.sets.length === 1 ? SPELL_SETS[o.sets[0]] : null;
      $('quiz-brief').innerHTML = row('문제 수', '10문제') + row('요령', st ? st.tip : '모든 묶음에서 섞어 나온다. 덜 익힌 문장이 더 자주 나온다.') +
        row('보기', (o.style === 'shoot' ? '풍선 ' : '깃발 문 ') + '2~4개') + row('생각할 시간', '약 ' + (p.t + t.think) + '초 (문장을 읽는 시간 2초 더함)') + row('틀리면', '정답 문장과 까닭을 보여 준다. 그 문제는 끝에 한 번 더 나온다.');
      return;
    }
    $('quiz-brief').innerHTML = row('문제 수', o.type === 'seq' ? o.dans.length * 9 + '문제 (단마다 1부터 9까지)' : '10문제') + row('보기', (o.style === 'shoot' ? '숫자 풍선 ' : '깃발 문 ') + t.opts + '개') + row('푸는 법', o.style === 'shoot' ? '정답 풍선을 쏘아 맞힌다. 못 쏘면 차가 들이받는 풍선이 답이 된다' : '정답이 적힌 문으로 지나간다') +
      row('생각할 시간', (o.style === 'shoot' ? '풍선이 앞에 멈춰 기다리는 시간 약 ' : '문제가 나오고 문에 닿기까지 약 ') + (p.t + t.think) + '초') + row('틀리면', '차가 잠깐 느려지고 정답을 보여 준다. 그 문제는 끝에 한 번 더 나온다.');
  }
