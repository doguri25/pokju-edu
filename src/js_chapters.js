  /* ---------- 이야기 1부: 고장 난 마성을 구구단으로 고친다. Nine chapters in the order the 단 are taught (2·5, 3·6, 4·8, 7, 9, then 1 and everything),
     one road each. A chapter is a quiz run: the first try goes 1 to 9 in order, later tries are mixed. Seven right out of ten (or of nine) clears it ---------- */
  var CHAPTERS = [
    { part: '1부 · 계산 칩', dans: [2], region: 'city', time: 'day', weather: 'clear', fix: '신호등', foes: { traffic: 1.4 }, name: '깜빡이는 신호등',
      go: '도심 신호등이 7초인지 70초인지 몰라서 다 깜빡이고 있어. 2단 갈림길부터 지나가 보자.', hint: '2단은 2씩 커져. 2, 4, 6, 8… 손가락으로 세어도 돼.',
      done: '도심 신호등이 하나둘 제자리로 돌아왔다. 초록불이 켜지자 사람들이 건널목을 건넜다.' },
    { dans: [5], region: 'country', time: 'day', weather: 'clear', fix: '버스 시간표', foes: { buggy: true, traffic: 1.3 }, name: '엉뚱한 시골 버스',
      go: '시골 버스가 5분마다 와야 하는데 50분째 안 와. 5단을 알려 주자.', hint: '5단은 끝자리가 늘 5 아니면 0이야.',
      done: '정류장 시간표가 바로잡혔다. 할머니가 장바구니를 들고 제시간에 온 버스에 올랐다.' },
    { dans: [3], region: 'creek', time: 'day', weather: 'clear', fix: '다리 차단기', foes: { drones: 0.4, traffic: 1.3 }, name: '열리지 않는 다리',
      go: '개울 다리 차단기가 숫자를 까먹어서 안 올라가. 3단으로 열어 보자.', hint: '3단은 3씩 커져. 3, 6, 9 다음은 12야.',
      done: '차단기가 스르르 올라갔다. 개울 건너 마을로 우유 트럭이 지나갔다.' },
    { dans: [6], region: 'mountain', time: 'sunset', weather: 'clear', fix: '케이블카', foes: { drones: 0.5, buggy: true, traffic: 1.25 }, name: '멈춘 케이블카',
      go: '산 위 케이블카가 몇 번째 칸인지 몰라 멈춰 버렸어. 6단이야.', hint: '6단은 3단의 두 배야. 3×4가 12니까 6×4는 24.',
      done: '케이블카가 다시 움직였다. 노을 진 산 위에서 손을 흔드는 사람들이 보였다.' },
    { dans: [4], region: 'highway', time: 'day', weather: 'rain', fix: '톨게이트', foes: { drones: 0.6, strike: 0.3, traffic: 1.2 }, name: '헷갈린 톨게이트',
      go: '고속도로 톨게이트가 요금을 엉터리로 받고 있어. 4단을 지나가 줘. 비가 오니까 천천히.', hint: '4단은 2단의 두 배야. 2×7이 14니까 4×7은 28.',
      done: '톨게이트 화면에 숫자가 똑바로 떴다. 막혀 있던 차들이 빗속을 천천히 빠져나갔다.' },
    { dans: [8], region: 'offroad', time: 'day', weather: 'clear', fix: '택배 창고', foes: { drones: 0.6, kami: 0.4, buggy: true, traffic: 1.2 }, name: '뒤죽박죽 택배 창고',
      go: '숲속 택배 창고가 상자 개수를 다 틀리게 세고 있어. 8단이야, 조금 어려워.', hint: '8단은 4단의 두 배야. 8×5는 40, 거기서 8씩 더하거나 빼 봐.',
      done: '창고 로봇이 상자를 여덟 개씩 가지런히 쌓았다. 기다리던 택배가 하나씩 출발했다.' },
    { dans: [7], region: 'snow', time: 'day', weather: 'snow', fix: '제설차', foes: { drones: 0.7, kami: 0.5, strike: 0.4, traffic: 1.2 }, name: '길 잃은 제설차',
      go: '눈길 제설차들이 몇 번 왔다 갔다 할지 몰라서 서 있어. 7단을 알려 주자. 눈길이라 미끄러워.', hint: '7단이 제일 헷갈려. 7×7은 49, 7×8은 56. 5, 6, 7, 8 순서로 기억해!',
      done: '제설차가 눈을 밀며 고갯길을 올라갔다. 하얀 길 위로 까만 찻길이 열렸다.' },
    { dans: [9], region: 'coast', time: 'sunset', weather: 'clear', fix: '등대', foes: { drones: 0.8, kami: 0.6, strike: 0.6, buggy: true, traffic: 1.1 }, name: '꺼진 등대',
      go: '바닷가 등대가 몇 초마다 깜빡일지 몰라서 꺼져 있어. 9단이야.', hint: '9단은 십의 자리와 일의 자리를 더하면 늘 9야. 9×4는 36, 3 더하기 6은 9!',
      done: '등대 불빛이 바다를 비췄다. 멀리서 고깃배들이 불빛을 따라 돌아왔다.' },
    { dans: [1, 2, 3, 4, 5, 6, 7, 8, 9], region: 'city', time: 'night', weather: 'clear', fix: '마성의 계산 칩', ending: 1, foes: { drones: 1, kami: 0.7, strike: 0.8, buggy: true, traffic: 1.1, strikes: ['lane', 'cross', 'diag', 'chase', 'cluster'] }, name: '마성 타워', last: true,
      go: '마지막이야. 마성 타워 앞 갈림길에는 1단부터 9단까지 다 나와. 지금까지 한 대로만 하면 돼.', hint: '1단은 곱한 수 그대로야. 1×7은 7. 거의 다 왔어!',
      done: '타워 꼭대기에 불이 들어왔다. 마성의 목소리가 스피커에서 흘러나왔다. “고마워요. 이제 잊지 않을게요.”' },
    /* part two: the 글자 칩. The same roads again, one pair of easily confused words each */
    { part: '2부 · 글자 칩', sets: ['dwae'], region: 'city', time: 'sunset', weather: 'clear', fix: '도로 전광판', foes: { traffic: 1.3 }, name: '엉터리 전광판',
      go: '이번엔 마성의 글자 칩이 말썽이야. 도로 전광판에 「천천히 가도 됀다」가 떴어. 되와 돼부터 고치자.', hint: '되와 돼가 헷갈리면 「하」와 「해」를 넣어 봐. 「해」가 어울리면 「돼」야.',
      done: '전광판 글자가 바로잡혔다. 「천천히 가도 돼요.」 지나가던 버스 기사님이 고개를 끄덕였다.' },
    { sets: ['an'], region: 'country', time: 'day', weather: 'clear', fix: '마을 방송', foes: { buggy: true, traffic: 1.25 }, name: '이상한 마을 방송',
      go: '마을 방송에서 「오늘은 비가 않 옵니다」라고 하네. 안과 않을 고쳐 줘.', hint: '말 앞에 오면 「안」, 「-지」 뒤에 오면 「않」이야. 「오지 않는다」, 「안 온다」!',
      done: '이장님 목소리가 바르게 흘러나왔다. 「오늘은 비가 안 옵니다. 빨래를 널어도 됩니다.」' },
    { sets: ['mat'], region: 'creek', time: 'day', weather: 'clear', fix: '퀴즈 안내판', foes: { drones: 0.5, traffic: 1.25 }, name: '다리 앞 퀴즈 안내판',
      go: '다리 앞 퀴즈 안내판에 「정답을 맞추세요」라고 쓰여 있어. 맞히다와 맞추다야.', hint: '답을 알아내는 건 「맞히다」, 둘을 대어 보거나 퍼즐을 끼우는 건 「맞추다」야.',
      done: '안내판이 「정답을 맞혀 보세요!」로 바뀌었다. 다리 위 아이들이 퀴즈를 풀기 시작했다.' },
    { sets: ['wen'], region: 'mountain', time: 'sunset', weather: 'clear', fix: '케이블카 안내 방송', foes: { drones: 0.6, buggy: true, traffic: 1.2 }, name: '수상한 케이블카 방송',
      go: '케이블카 방송이 「왠일로 이렇게 사람이 많죠?」래. 웬과 왠이야.', hint: '「왠지」만 「왠」이고 나머지는 다 「웬」이야. 웬일, 웬 떡!',
      done: '방송이 바르게 흘러나왔다. 「웬일로 이렇게 손님이 많으세요? 오늘은 노을이 예뻐요.」' },
    { sets: ['deun'], region: 'highway', time: 'day', weather: 'rain', fix: '휴게소 안내판', foes: { drones: 0.6, strike: 0.35, traffic: 1.2 }, name: '헷갈린 휴게소',
      go: '휴게소 안내판에 「무엇이던지 물어보세요」라고 쓰여 있어. 든지와 던지야. 비가 오니까 조심해.', hint: '고를 때는 「든지」, 지난 일을 떠올릴 때는 「던지」야.',
      done: '안내판이 「무엇이든지 물어보세요」로 고쳐졌다. 비를 피하던 사람들이 길을 물어보러 다가갔다.' },
    { sets: ['garu'], region: 'offroad', time: 'day', weather: 'clear', fix: '길 안내 로봇', foes: { drones: 0.7, kami: 0.45, buggy: true, traffic: 1.2 }, name: '길 잃은 안내 로봇',
      go: '숲길 안내 로봇이 「저쪽을 가르쳐 드릴게요」라며 엉뚱한 데를 짚고 있어. 가르치다와 가리키다야.', hint: '손가락으로 짚는 건 「가리키다」, 알려 주는 건 「가르치다」야.',
      done: '로봇이 손을 들어 숲길 쪽을 바르게 가리켰다. 「이쪽으로 가세요. 길은 제가 가르쳐 드릴게요.」' },
    { sets: ['nat'], region: 'snow', time: 'day', weather: 'snow', fix: '날씨 안내판', foes: { drones: 0.75, kami: 0.55, strike: 0.45, traffic: 1.2 }, name: '뒤죽박죽 날씨 안내판',
      go: '고갯길 날씨 안내판에 「기온이 낫습니다」래. 낫다, 낮다, 났다, 낳다야. 이번엔 문이 세 개야.', hint: '병이 좋아지면 「낫다」, 높지 않으면 「낮다」, 생기면 「났다」, 아기는 「낳다」야.',
      done: '안내판에 「기온이 낮습니다. 눈길 조심」이 떴다. 제설차가 안내판 옆을 지나갔다.' },
    { sets: ['often'], region: 'coast', time: 'sunset', weather: 'clear', fix: '등대 일지', foes: { drones: 0.85, kami: 0.6, strike: 0.6, buggy: true, traffic: 1.1 }, name: '틀린 말투성이 등대 일지',
      go: '등대지기 일지가 「몇일」, 「금새」 투성이야. 자주 틀리는 말들이니까 하나씩 고쳐 보자.', hint: '「며칠」은 언제나 「며칠」이야. 「몇일」이라는 말은 없어!',
      done: '등대 일지가 반듯하게 고쳐졌다. 「며칠 동안 바다가 잔잔했다. 배들이 금세 돌아왔다.」' },
    { sets: ['dwae', 'an', 'mat', 'wen', 'deun', 'garu', 'nat', 'often', 'bara', 'ro'], region: 'city', time: 'night', weather: 'clear', fix: '마성의 글자 칩', ending: 2, name: '다시 마성 타워', last: true,
      foes: { drones: 1, kami: 0.75, strike: 0.85, buggy: true, traffic: 1.05, strikes: ['lane', 'cross', 'diag', 'chase', 'cluster'] },
      go: '마지막이야. 마성 타워 앞에는 헷갈리는 말이 다 나와. 처음 보는 「바라다」와 「로서」도 있어.', hint: '바라는 마음은 「바라」, 「바람」이야. 사람의 자격은 「로서」, 도구는 「로써」!',
      done: '타워의 전광판에 바른 글자가 하나씩 켜졌다. 마성의 목소리가 들렸다. “고마워요. 이제 「안 돼요」를 바르게 쓸게요.”' }
  ];
  var selChapter = 0;
  /* 을/를 after a word, by whether its last syllable has a final consonant */
  function objJosa(w) { var c = w.charCodeAt(w.length - 1) - 0xac00; return w + (c >= 0 && c < 11172 && c % 28 ? '을' : '를'); }
  function chapterOpen(i) { return save.unlockAll || i <= (save.story.open || 0) || i === linkCh; }
  function chapterStars(sc) { var r = sc.right / sc.total; return r >= 1 ? 3 : (r >= 0.9 ? 2 : (r >= 0.7 ? 1 : 0)); }
  function storyMission(i) {
    var ch = CHAPTERS[i] || CHAPTERS[0], m, k, keep = {};
    for (k in cond) keep[k] = cond[k];
    cond.region = ch.region; cond.time = ch.time; cond.weather = ch.weather;
    m = condMission('free');
    for (k in keep) cond[k] = keep[k];
    m.kind = 'story'; m.goal = 'quiz'; m.name = (i + 1) + '장 ' + ch.name; m.label = ch.fix;
    m.farm = ch.region === 'country' ? 1 : 0; m.road = { order: ['hill'], gap: [300, 420] };
    quizFoes(m, ch.foes);
    if (ch.sets) m.quiz = { subject: 'spell', sets: ch.sets, type: 'spell', pace: save.quiz.sel.pace };
    else {
      m.quiz = { dans: ch.dans, type: save.story.tries && save.story.tries[i] ? 'mix' : 'seq', pace: save.quiz.sel.pace };
      if (ch.last) m.quiz.type = 'mix';
    }
    m.aim = '새벽: “' + ch.go + '”';
    m.why = REGIONS[ch.region].short + ' · ' + TIME_LABEL[ch.time] + ' · ' + WEATHERS[ch.weather].name;
    return m;
  }
  /* 새벽 reads out a hint once, halfway through */
  function storyRadio(dk) {
    if (runKind !== 'story' || quiz.hinted || dk.i !== Math.ceil(dk.main / 2)) return;
    quiz.hinted = radio('새벽', CHAPTERS[runMission].hint, 5);
  }
  /* after a chapter run: stars, the next chapter, the scene. Called from quizResult */
  function storyAfter(sc, win) {
    var i = runMission, ch = CHAPTERS[i], st = win ? chapterStars(sc) : 0, was = save.story.stars[i] || 0;
    save.story.tries[i] = (save.story.tries[i] || 0) + 1;
    if (st > was) save.story.stars[i] = st;
    if (st && i + 1 > (save.story.open || 0)) save.story.open = Math.min(CHAPTERS.length - 1, i + 1);
    if (st && ch.last) save.story.done = true;
    storeSave();
    $('res-title').textContent = st ? objJosa(ch.fix) + ' 고쳤다! ' + '★★★'.slice(0, st) : '조금만 더!';
    $('res-story').textContent = st ? ch.done : !win ? '오 사장: “막내야, 차는 내가 금방 고친다. 다시 가 봐.” (' + failWhy + ')' : '새벽: “괜찮아, 틀린 건 다음에 더 자주 나와. 한 번 더 해 보자.” (10문제 가운데 7문제를 맞히면 다음 장이 열려요)';
    $('res-next').textContent = '다음 장';
    $('res-next').hidden = !(st && !ch.last);
    $('res-ending').hidden = !(st && ch.last);
    return st ? (st === 3 ? 'record' : 'win') : 'fail';
  }
  var ENDING2 = ['한울시, 다시 바르게 말하다', '마성의 글자 칩이 고쳐지자 전광판도, 마을 방송도, 안내판도, 등대 일지도 한꺼번에 바른 말로 돌아왔다. 마성이 말했다. “고마워요. 숫자도 글자도 이제 잊지 않을게요.”',
    '오 사장이 카센터 간판을 가리켰다. 「전설 카센터」. “이건 처음부터 맞게 썼지.” 새벽이 웃으며 무전기를 내려놓았다. “전설 하나, 이제 한울시는 숫자도 글자도 다 기억해. 정말 수고했어.”'];
  function storyEnding() {
    var stars = 0, k, two = CHAPTERS[runMission] && CHAPTERS[runMission].ending === 2; for (k in save.story.stars) stars += save.story.stars[k];
    $('result').hidden = true; $('hud').hidden = true; $('ending').hidden = false;
    if (two) { $('ending-head').textContent = ENDING2[0]; $('ending-a').textContent = ENDING2[1]; $('ending-b').textContent = ENDING2[2]; }
    else {
    $('ending-head').textContent = '한울시, 다시 숫자를 기억하다';
    $('ending-a').textContent = '마성 타워의 불이 켜지자 도시의 신호등, 버스, 다리, 케이블카, 톨게이트, 택배 창고, 제설차, 등대가 한꺼번에 제자리로 돌아왔다. 마성이 말했다. “고마워요. 이제 7 곱하기 8은 56이라는 걸 잊지 않을게요.”';
    $('ending-b').textContent = '전설 카센터로 돌아오자 오 사장이 새 작업복을 내밀었다. 가슴에는 「막내」 대신 이름표가 달려 있었다. 새벽이 무전기로 말했다. “전설 하나, 수고했어. 다음엔 글자 칩이 말썽이래.”';
    }
    $('ending-stats').textContent = (two ? '' : '2부 「글자 칩」이 열렸다 · ') + '모은 별 ' + stars + ' / ' + CHAPTERS.length * 3 + ' · 보유 고철 ' + save.scrap.toLocaleString('ko-KR');
  }
  function renderChapters() {
    var html = '', ch = CHAPTERS[selChapter];
    CHAPTERS.forEach(function (c, i) {
      var s = save.story.stars[i] || 0;
      if (c.part) html += '<div class="part">' + c.part + '</div>';
      html += '<button type="button" class="mis" id="ch-' + i + '" data-chapter="' + i + '" aria-pressed="' + (i === selChapter) + '"><span class="tag">' + REGIONS[c.region].short + '</span><span class="tag">' + (c.sets ? (c.last ? '모든 묶음' : SPELL_SETS[c.sets[0]].name) : (c.last ? '모든 단' : c.dans[0] + '단')) + '</span><b>' + (i + 1) + '장 ' + c.name + '</b>' +
        (chapterOpen(i) ? (s ? '<span class="sub" aria-label="별 ' + s + '개">' + '★★★'.slice(0, s) + '☆☆☆'.slice(0, 3 - s) + '</span>' : '') : '<span class="lock">잠김</span>') + '</button>';
    });
    $('ch-list').innerHTML = html;
    var cb = $('ch-' + selChapter); if (cb && cb.scrollIntoView && !$('menu').hidden && !$('pane-story').hidden) cb.scrollIntoView({ block: 'nearest' });
    var m = storyMission(selChapter);
    $('ch-brief').innerHTML = (chapterOpen(selChapter) ? '' : row('잠금', (selChapter) + '장 「' + CHAPTERS[selChapter - 1].name + '」' + objJosa(CHAPTERS[selChapter - 1].name).slice(CHAPTERS[selChapter - 1].name.length) + ' 깨면 열립니다')) +
      row('고칠 것', ch.fix) + row('문제', ch.sets ? '맞춤법 ' + (ch.last ? '모든 묶음 섞어서' : SPELL_SETS[ch.sets[0]].name) : (ch.last ? '1단~9단 섞어서' : ch.dans[0] + '단 ' + QUIZ_TYPES[m.quiz.type].name)) + row('길', m.why) + row('깨기', '10문제 가운데 7문제 이상 (순서대로는 9문제 가운데 7문제). 별은 7개 이상 1개, 9개 이상 2개, 모두 맞히면 3개');
  }
