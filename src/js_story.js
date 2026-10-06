
  /* ---------- story and driving practice: who the player is, why they drive, and the first drive that teaches the controls ---------- */
  var STORY = [
    ['한울시의 아침', '한울시에서는 승용차도, 버스도, 신호등도 관제 AI 「마성」이 움직인다. 당신은 전설 카센터의 막내 정비사다. 고친 차를 시운전하느라, 이 도시에서 몇 안 남은 운전할 줄 아는 사람이다.'],
    ['마성이 계산을 까먹은 날', '오늘 아침, 마성이 숫자를 까먹었다. 신호등은 7초인지 70초인지 몰라 깜빡이고, 버스는 엉뚱한 정류장에 선다. 마성은 길마다 「숫자 갈림길」을 세웠고, 마성에 묶인 차와 드론은 엉뚱하게 날뛰며 지나가는 차에 덤벼든다.'],
    ['맞는 문으로 지나가기', '관제사 새벽이 무전으로 말했다. “갈림길마다 답이 적힌 문이 있어. 맞는 문으로 지나가면 마성이 다시 기억해. 틀려도 괜찮아, 다음에 또 나오니까.” 오 사장은 통신 모듈을 뗀 차에 방어 장비를 달아 주었다. “덤비는 놈들은 쏴서 멈춰 세워. 그래도 문은 꼭 맞는 데로 지나가라.” 먼저 카센터 앞 길에서 운전부터 익힌다.']
  ], STORY_DONE = ['운전 연습 끝', '새벽: “전설 하나, 운전은 됐어. 첫 갈림길은 도심이야. 신호등이 2단을 까먹었대.” 오 사장: “막내야, 천천히 다녀와라. 틀려도 혼 안 낸다.”'];
  var storyI = 0, storyMode = 'intro';
  function storyShow() {
    var done = storyMode === 'done', s = done ? STORY_DONE : STORY[storyI];
    $('story-step').textContent = done ? '전설 카센터' : '이야기 ' + (storyI + 1) + ' / ' + STORY.length;
    $('story-title').textContent = s[0]; $('story-text').textContent = s[1];
    $('story-next').textContent = done ? '1장 출발' : (storyI === STORY.length - 1 ? '운전 연습 시작' : '다음');
    $('story-skip').textContent = done ? '차량 고르기' : '건너뛰기';
    $('story').hidden = false; $('story-next').focus();
  }
  function openStory() { storyMode = 'intro'; storyI = 0; $('title').hidden = true; $('menu').hidden = true; storyShow(); }
  function storyNext() {
    sfx('click');
    if (storyMode === 'done') { $('story').hidden = true; selKind = 'story'; selChapter = 0; startPlay(); return; }
    if (++storyI < STORY.length) storyShow(); else { $('story').hidden = true; startTutorial(); }
  }
  function storySkip() {
    sfx('click'); $('story').hidden = true;
    if (storyMode === 'intro') { save.tut = true; storeSave(); selKind = 'story'; toMenu(); setTab('mode'); }
  }

  var tut = { i: -1, t: 0, L: false, R: false, k0: 0, sp: 0, item: false, cT: 0, hump: 0, tries: 0 };
  function tutMission() {
    return { kind: 'tut', name: '운전 연습', region: 'city', weather: 'clear', time: 'day', timeLabel: '낮', dir: 1, goal: 'tut', n: TUT.length, civ: 0, civLimit: 0, drones: 0, strike: 0, kami: 0, buggy: false, traffic: 1, chasers: 0, farm: 0,
      road: { order: ['hill'], gap: [420, 560] }, label: '운전 연습', why: '전설 카센터 앞 도로. 아직 갈림길도, 날뛰는 차도 없는 조용한 길이다.', aim: '오 사장과 새벽의 말을 따라 운전, 무기, 기술을 차례로 익힌다. 연습 중에는 차가 부서지지 않는다.', win: '', lose: '', done: '' };
  }
  function tutTouch() { return touchUI || vw <= 720; }
  var TUT = [
    { who: '오 사장', line: '막내야, 시동 걸었으면 속도부터 올려 봐. 이 차들은 밟는다고 바로 튀어 나가지 않는다.', key: '↑ 를 누르고 있기', touch: '왼쪽 아래 레버를 위로 올리기', goal: function (car) { return '시속 ' + Math.round(Math.min(100, car.vmax * 3.6 * 0.8)) + ' km 넘기기'; },
      check: function (car) { return veff * 3.6 >= Math.min(100, car.vmax * 3.6 * 0.8); } },
    { who: '새벽', line: '전설 하나, 들려? 새벽이야. 길은 내가 읽어 줄게. 먼저 차로를 바꿔 봐.', key: '← →', touch: '화면 오른쪽을 좌우로 끌기', goal: function () { return '맨 왼쪽 차로와 맨 오른쪽 차로를 한 번씩 밟기' + (tut.L ? ' (왼쪽 완료)' : '') + (tut.R ? ' (오른쪽 완료)' : ''); },
      enter: function () { tut.L = tut.R = false; }, tick: function () { if (player.x < -4.6) tut.L = true; if (player.x > 4.6) tut.R = true; }, check: function () { return tut.L && tut.R; } },
    { who: '오 사장', line: '무기는 공격 키를 누르고 있는 동안 나간다. 손을 떼면 총도 쉰다. 앞에 굴러다니는 마성의 오토바이로 시험해 봐.', lineT: '무기는 레버를 잡고 있는 동안에만 나간다. 손을 떼면 총도 쉰다. 앞에 굴러다니는 마성의 오토바이로 시험해 봐.', key: 'Z 를 누른 채 오토바이와 같은 차로에 서기', touch: '레버를 누른 채 오토바이와 같은 차로에 서기', goal: function () { return '오토바이 ' + Math.min(3, kills - tut.k0) + ' / 3대 부수기'; },
      enter: function () { tut.k0 = kills; tut.sp = 0; },
      tick: function (dt) { tut.sp -= dt; if (tut.sp <= 0 && !enemies.some(function (e) { return e.type === 'bike'; })) { tut.sp = 2.5; for (var b = 0; b < 3; b++) spawnEnemy('bike', clamp(player.x + (b - 1) * 1.4, -6.6, 6.6), -95 - b * 5, Math.max(8, veff - 9)); } },
      check: function () { return kills - tut.k0 >= 3; } },
    { who: '새벽', line: '앞에 보급 상자가 있어. 쏘면 내용물이 바뀌고, 지나가면서 닿으면 먹어. 필요한 게 나올 때까지 쏘는 거야.', key: '상자를 쏴서 바꾸고, 같은 차로로 지나가기', touch: '상자를 쏴서 바꾸고, 같은 차로로 지나가기', goal: function () { return '보급 상자 먹기'; },
      enter: function () { tut.item = false; tut.cT = 0; if (!crate.active) spawnCrate(); }, tick: function (dt) { if (!crate.active && !tut.item) { tut.cT += dt; if (tut.cT > 1.2) { tut.cT = 0; spawnCrate(); } } }, check: function () { return tut.item; } },
    { who: '오 사장', line: '급할 때는 기본 기술이다. 차 종류마다 다르고, 몇 초면 다시 쓸 수 있어.', key: 'X', touch: '오른쪽 아래의 작은 버튼', goal: function (car) { return '기본 기술 「' + BASICS[car.basic].name + '」 쓰기'; }, check: function () { return player.bcd > 0; } },
    { who: '새벽', line: '고유 기술은 그 차만의 필살기야. 세지만 다시 쓰려면 오래 기다려야 해. 아껴 뒀다가 몰렸을 때 써.', key: 'Space', touch: '오른쪽 아래의 큰 버튼', goal: function (car) { return '고유 기술 「' + car.skillName + '」 쓰기'; }, check: function () { return player.cd > 0; } },
    { who: '오 사장', line: '저 앞에 방지턱이다. 빠르게 넘으면 차가 튀고 속도를 잃는다. 줄여서 넘어.', key: '↓ 로 감속', touch: '레버를 아래로 내려 감속', goal: function () { return '시속 60 km 아래로 방지턱 넘기' + (tut.missed ? ' (턱을 비켜 갔다. 다음 턱은 넘어서 가기)' : (tut.tries ? ' (너무 빨랐다. 다음 턱에서 다시)' : '')); },
      enter: function () { tut.hump = 0; tut.tries = 0; tut.missed = false; tutHump(); },
      tick: function () {
        if (tut.hump < 0) { tut.hump = 0; tut.tries++; tut.missed = false; tutHump(); tutCoach(); }
        else if (tut.hump === 0 && dist > tut.humpD + 14) { tut.missed = true; tutHump(); tutCoach(); }   /* driven around it: the next one comes in the lane the car is in */
      }, check: function () { return tut.hump > 0; } }
  ];
  function tutHump() { tut.humpD = dist + 190; addProp('hump', tut.humpD, clamp(player.x, -6.4, 6.4), { solid: { hw: 3.4, hl: 0.2, kind: 'hump', soft: 1 } }); }
  function tutCoach() {
    var s = TUT[tut.i], car = CARS[player.car];
    $('coach-who').textContent = s.who; $('coach-step').textContent = '운전 연습 ' + (tut.i + 1) + ' / ' + TUT.length;
    $('coach-line').textContent = '“' + ((tutTouch() && s.lineT) || s.line) + '”'; $('coach-do').textContent = (tutTouch() ? s.touch : s.key) + ' → ' + s.goal(car);
    $('coach').hidden = false;
  }
  function tutGo(i) { tut.i = i; tut.t = 0; var s = TUT[i]; if (s.enter) s.enter(); tutCoach(); }
  function tutStep(dt, car) {
    if (tut.i < 0) { player.thr = 0.08; player.v = car.vmin + 2; tutGo(0); }   /* the lesson starts slow, so the first thing to do is speed up */
    var s = TUT[tut.i]; tut.t += dt;
    if (s.tick) s.tick(dt, car);
    if (hudCache.tutGoal !== (hudCache.tutGoal = s.goal(car))) tutCoach();
    if (tut.t > 1 && s.check(car)) { sfx('pickup'); if (tut.i + 1 < TUT.length) tutGo(tut.i + 1); else tutDone(); }
  }
  function startTutorial() {
    tr.on = false; tr.phase = ''; tr.fade = 0; $('story').hidden = true;
    beginRun(carOpen(selCar) ? selCar : 'laser', 0, false, undefined, 'tut');
  }
  function tutDone(skipped) {
    save.tut = true; save.help = true; storeSave(); $('coach').hidden = true;
    toMenu();
    if (!skipped) { storyMode = 'done'; storyShow(); }
  }

  /* ---------- radio: 새벽 and 오 사장 talk the driver through each mission ---------- */
  var RADIO_MID = [
    ['오 사장', '오토바이는 떼로 온다. 한 대씩 쫓지 말고 줄을 맞춰 쏴.'], ['새벽', '마주 오는 건 피난 차량이야. 절대 부딪히면 안 돼. 막히면 갓길을 써.'], ['오 사장', '유조차는 단단하다. 옆에 붙지 말고 뒤에서 계속 쏴.'],
    ['새벽', '추격대가 정면으로 와. 자폭 드론은 내려꽂기 전에 차로를 바꿔.'], ['새벽', '해킹 절반 됐어. 바닥의 붉은 표시를 봐. 폭탄은 거기 떨어져.'], ['새벽', '타워가 보여. 마지막 방어선이야. 멈추지 마.'],
    ['오 사장', '경운기는 농부 거다. 건드리지 말고 돌아가.'], ['새벽', '빗길이야. 평소보다 일찍 꺾어.'], ['오 사장', '진흙에 빠지면 속도가 죽는다. 바퀴 자국을 따라가.'],
    ['새벽', '상대도 눈길에서는 미끄러워. 쏴서 멈춰 세우고 앞질러.'], ['새벽', '돌풍이 불면 차가 밀려. 난간 쪽 차로는 피해.'], ['오 사장', '저 트럭이 마지막 백업이다. 여기서 끝내자.'],
    ['새벽', '구급차 차로로 오는 차부터 잡아. 구급차가 버텨야 해.'], ['오 사장', '빛기둥 보이지? 상자는 지나가기만 하면 실린다.'], ['새벽', '시간이 절반 남았어. 빙판에서는 꺾지 말고 그대로 지나가.'],
    ['새벽', '신호를 쫓는 중이야. 조금만 더 버텨 줘.'], ['오 사장', '옆에 붙으면 민다. 밀리기 전에 먼저 쏴.'], ['새벽', '코어가 저 안에 있어. 저것만 멈추면 마성은 끝이야.'],
    ['새벽', '무쇠파 추격차가 뒤에서 와. 룸미러를 자주 봐.'], ['오 사장', '톨게이트 기둥은 박으면 크게 깨진다. 열린 칸으로만 지나가.'], ['새벽', '수송차가 달아나기 시작했어. 뒤에 붙어서 계속 쏴.'],
    ['오 사장', '자갈길에서 급하게 꺾으면 미끄러진다. 낙석은 미리 보고 피해.'], ['새벽', '물길에 들어가면 속도를 잃어. 상자는 마른 차로에서 주워.'], ['새벽', '승합차에 사람들이 타고 있어. 승합차 앞을 비워 줘.'],
    ['오 사장', '시간 반 썼다. 물길만 피하면 닿는다.'], ['새벽', '앞차가 길을 막을 거야. 한 번 막으면 3초는 그 차로에 있어. 반대쪽으로 빠져.'], ['새벽', '조종 신호를 절반 잡았어. 드론은 네가 가는 쪽으로 떨어뜨려. 방향을 자주 바꿔.'],
    ['오 사장', '추격차가 나란히 서면 속도를 줄여 앞으로 보내 버려.'], ['새벽', '안개 때문에 가까이 가야 보여. 수송차는 덩치가 커.'], ['오 사장', '무쇠 저놈 장갑은 내가 안다. 계속 쏘면 뚫린다!'],
    ['새벽', '안개 속에서는 전조등이 먼저 보여. 불빛이 보이면 바로 쏴.'], ['새벽', '마주 오는 건 전부 시민 차야. 부딪히지 말고 빈 차로로 빠져.'], ['오 사장', '시간 반 썼다. 돌풍 불 때는 꺾지 말고 버텨라.'],
    ['새벽', '발전차 차로로 내려오는 차부터 잡아. 병원이 기다리고 있어.'], ['새벽', '중계 트럭은 가까이 가면 달아나. 멀리서부터 쏘면서 붙어.'], ['새벽', '근원을 절반 좁혔어. 물길로 밀리면 폭격을 못 피해. 마른 차로를 지켜.'],
    ['오 사장', '앞차가 막으면 3초는 그 차로에 있다. 반대쪽으로 빠져서 앞질러라.'], ['오 사장', '저 트럭만 서면 정말 끝이다. 눈길이니까 급하게 꺾지 마라!']
  ];
  var RADIO_NEAR = { kill: ['새벽', '몇 대 안 남았어. 마무리하자.'], dist: ['새벽', '거의 다 왔어. 속도를 지켜.'], time: ['새벽', '조금만 더. 거의 끝났어.'], boss: ['오 사장', '연기 난다! 조금만 더 쏴!'], duel: ['새벽', '결승이 코앞이야. 자리를 지켜.'], escort: ['새벽', '거의 다 왔어. 끝까지 앞을 지켜 줘.'], collect: ['오 사장', '몇 개 안 남았다. 놓치지 마.'], rush: ['새벽', '거의 다 왔어. 시간 안에 들어갈 수 있어.'], hunt: ['새벽', '수송차가 얼마 안 남았어.'] };
  var rd = { mid: false, near: false, low: false, chase: false, boss: false }, objF = 0;
  function radio(who, text, hold) {
    if (mode !== 'play' || player.dead || capHold > 1.2) return false;
    var el = $('caption'); el.textContent = who + ': “' + text + '”'; el.hidden = false; capHold = hold || 4.6; sfx('cycle'); return true;
  }
  function radioReset() { rd.mid = rd.near = rd.low = rd.chase = rd.boss = false; objF = 0; }
  function radioStep(car) {
    if (runKind !== 'mis') return;
    var m = RADIO_MID[runMission], n = RADIO_NEAR[mission.goal];
    if (!rd.low && player.hp < car.hp * 0.3) rd.low = radio('오 사장', '차가 운다, 막내야! 수리 키트 보이면 무조건 먹어.', 4);
    else if (!rd.mid && objF >= 0.5 && m) rd.mid = radio(m[0], m[1]);
    else if (!rd.near && objF >= 0.86 && n) rd.near = radio(n[0], n[1], 3.6);
  }
