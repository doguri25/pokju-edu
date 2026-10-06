  /* ---------- 깃발 문: the quiz on the road. A question shows at the top, a row of gates comes down the road with one option on each,
     and the gate the car drives through is the answer. The gates split the whole road between them, so there is always an answer;
     the time to think is set in seconds, and the gates are put as far ahead as the car covers in that time ---------- */
  var QG_EDGE = 8.6, QG_COL = ['#1967d2', '#8e24aa', '#e8710a', '#00897b'];   /* blue, purple, orange, teal: no colour hints at right or wrong */
  var quiz = { deck: null, q: null, phase: 'off', t: 0, d: 0, g: null, combo: 0, best: 0, ok: 0 };
  var gateSets = {};
  function gateTex(c, text, col, dim) {
    var x = c.getContext('2d'), w = c.width, h = c.height;
    x.clearRect(0, 0, w, h);
    x.globalAlpha = dim ? 0.35 : 1;
    x.fillStyle = col; x.beginPath(); x.moveTo(16, 4); x.arcTo(w - 4, 4, w - 4, h - 4, 18); x.arcTo(w - 4, h - 4, 4, h - 4, 18); x.arcTo(4, h - 4, 4, 4, 18); x.arcTo(4, 4, w - 4, 4, 18); x.fill();
    x.lineWidth = 8; x.strokeStyle = '#ffffff'; x.stroke();
    var fs = Math.round(h * 0.66), font = function (z) { return '900 ' + z + 'px "Black Han Sans", "Noto Sans KR", system-ui, sans-serif'; };
    x.font = font(fs); var tw = x.measureText(String(text)).width;
    if (tw > w - 30) { fs = Math.floor(fs * (w - 30) / tw); x.font = font(fs); }   /* a word like 가르치셨다 shrinks to fit the sign */
    x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(text), w / 2, h * 0.55);
    x.globalAlpha = 1;
  }
  /* one set of gates per option count, built the first time it is needed */
  function gateSet(n) {
    if (gateSets[n]) return gateSets[n];
    var g = new T.Group(), W = 2 * QG_EDGE / n, s = { g: g, n: n, W: W, banners: [], i: 0 }, i;
    var postM = std(0xf2f2ee, 0.5), barM = std(0x2a2d34, 0.6);
    for (i = 0; i <= n; i++) {
      var bxX = -QG_EDGE + W * i;
      g.add(cyl(0.16, 0.16, 4.6, 8, postM, bxX, 2.3, 0));
      g.add(bx(0.95, 0.6, 0.05, std(parseInt(QG_COL[Math.min(i, n - 1)].slice(1), 16), 0.6), bxX + (i === n ? -0.5 : 0.5), 4.3, 0));   /* the little flag on each post */
    }
    g.add(bx(2 * QG_EDGE + 0.4, 0.22, 0.22, barM, 0, 4.62, 0));
    for (i = 0; i < n; i++) {
      var c = document.createElement('canvas'); c.width = 256; c.height = 128;
      var tx = new T.CanvasTexture(c); tx.encoding = T.sRGBEncoding;
      var bw = Math.min(W - 0.5, 4.2), m = new T.Mesh(new T.PlaneGeometry(bw, bw / 2), new T.MeshBasicMaterial({ map: tx, transparent: true, fog: false, depthWrite: false }));
      m.position.set(-QG_EDGE + W * (i + 0.5), 3.3, 0.05); g.add(m);
      var lane = new T.Mesh(new T.PlaneGeometry(W - 0.5, 3), new T.MeshBasicMaterial({ color: C(parseInt(QG_COL[i].slice(1), 16)), transparent: true, opacity: 0.32, depthWrite: false }));
      lane.rotation.x = -Math.PI / 2; lane.position.set(m.position.x, 0.03, 0); g.add(lane);
      s.banners.push({ c: c, tx: tx, m: m });
    }
    g.visible = false; scene.add(g);
    return (gateSets[n] = s);
  }
  function gatesShow(q) {
    var s = gateSet(q.n);
    s.banners.forEach(function (b, i) { gateTex(b.c, q.opts[i], QG_COL[i], false); b.tx.needsUpdate = true; b.m.material.opacity = 1; });
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
  function spellSel() { var s = save.quiz.sel, k = s.spell || 'dwae'; return { subject: 'spell', sets: k === 'all' ? SPELL_ORDER.slice() : [SPELL_SETS[k] ? k : 'dwae'], type: 'spell', pace: s.pace, foe: s.foe !== 'off', style: s.style === 'shoot' ? 'shoot' : 'gate' }; }
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
    quiz.style = o.style === 'shoot' && EDU.arms ? 'shoot' : 'gate'; quiz.pace = QUIZ_PACE[o.pace] || QUIZ_PACE.mid; quiz.combo = 0; quiz.best = 0; quiz.ok = 0; quiz.hinted = false;
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
      var c = document.createElement('canvas'); c.width = 256; c.height = 128;
      var tx = new T.CanvasTexture(c); tx.encoding = T.sRGBEncoding;
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
    var z = s.g.position.z;
    if (Math.abs(p.z - z) > 1.6) return false;
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
    if (first) factRecord(save.quiz.facts, q.key, ok);
    if (quiz.g) gatesDim(q, picked);
    if (quiz.b) quiz.b.items.forEach(function (it, i) { if (i !== q.slot) { gateTex(it.c, q.opts[i], QG_COL[i], true); it.tx.needsUpdate = true; } if (i === picked) { it.popped = true; it.g.visible = false; spawnRing(it.x, quiz.b.g.position.z, 5, 0.35, veff, i === q.slot ? COL.cyan : COL.orange); } });
    if (ok) {
      if (first) quiz.ok++; quiz.combo++; quiz.best = Math.max(quiz.best, quiz.combo); score += 100 + 20 * Math.min(quiz.combo - 1, 5); scrap += 20;
      buff.nitro = Math.max(buff.nitro, 1.2); sfx('item');
      if (EDU.arms) player.hp = Math.min(car.hp, player.hp + car.hp * 0.2);   /* a right answer repairs a fifth of the car: solving keeps you on the road */
      spawnRing(px, 0, 9, 0.45, 0, COL.cyan); spawnP('glow', px, 1.4, 0, 0, 0, 0, 0.4, 4, 12, COL.cyan, 0.9, 0);
      qboxSet((quiz.combo >= 3 ? quiz.combo + '개 연속 정답!' : '정답!') + (EDU.arms ? ' · 수리 +20%' : ''), q.full, 'ok');
    } else {
      quiz.combo = 0; player.v = Math.max(car.vmin, player.v * 0.7); sfx('thud');
      qboxSet(first ? '정답은 이거예요 · 끝에 한 번 더 나와요' : '정답은 이거예요', q.full, 'no', null, q.why);
    }
    quiz.phase = 'show'; quiz.t = ok ? 1.6 : (q.why ? 3.6 : 2.4);   /* a spelling miss shows why, which takes longer to read */
  }
  function quizStep(dt, px, car) {
    if (quiz.phase === 'off' || mode !== 'play' || briefT > 0 || player.dead) return;
    var dk = quiz.deck, q = quiz.q, bs = quiz.b;
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
    if (quiz.phase === 'wait' && quiz.t <= 0) {
      q = quiz.q = quizNext(dk);
      if (!q) { quiz.phase = 'done'; finish(true); return; }
      var think = quiz.pace.t + QUIZ_TYPES[q.type].think;
      quiz.phase = 'ask'; quiz.shotPick = -1;
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
    return h + '</table><div class="flegend"><span>★ 잘함 (세 번 연속 맞힘)</span><span>● 연습 중</span><span>▲ 어려움 (틀린 뒤 아직 못 맞힘)</span><span>빈칸 처음</span></div>';
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
