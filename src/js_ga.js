  /* ---------- game state ---------- */
  var MISSIONS = [
    { name: '외곽 소탕', part: '1부 · 한울시 탈환', time: 'day', timeLabel: '낮', dir: 1, goal: 'kill', n: 20, civ: 0, drones: 0, strike: 0, label: '폭주 차량 격파',
      why: '마성에 조종당하는 폭주 차량이 정비소에서 도심으로 가는 외곽 고속도로를 점거했다.', aim: '폭주 차량을 부숴 도심으로 가는 길을 연다.',
      win: '폭주 차량 20대 격파', lose: '내 차량 파괴', done: '외곽 고속도로가 뚫렸다. 다음은 톨게이트다.' },
    { name: '피난길 역주행', time: 'day', timeLabel: '낮', dir: -1, goal: 'dist', n: 2000, civ: 0.85, civLimit: 3, drones: 0, strike: 0, label: '톨게이트까지',
      why: '도심 방향 차로는 마성이 세운 차량으로 막혔다. 열린 길은 시민들이 빠져나오는 반대 차로뿐이다.', aim: '피난 차량을 피해 반대 차로를 거슬러 톨게이트에 닿는다.',
      win: '2 km 주행', lose: '내 차량 파괴, 또는 피난 차량과 3번 충돌', done: '톨게이트를 통과했다. 시민들의 피난길도 무사하다.' },
    { name: '유조차 추격', time: 'sunset', timeLabel: '노을', dir: 1, goal: 'boss', n: 1, civ: 0, drones: 1, strike: 0.4, strikes: ['lane', 'chase'], buggy: true, label: '유조차 내구',
      why: '무장 유조차가 마성 타워 서버의 냉각수를 싣고 해 지기 전에 도심으로 들어가려 한다.', aim: '유조차를 따라잡아 부숴 마성의 보급을 끊는다.',
      win: '무장 유조차 격파', lose: '내 차량 파괴', done: '유조차가 멈췄다. 타워 서버가 달아오르기 시작한다.' },
    { name: '정면 승부', time: 'sunset', timeLabel: '노을', dir: -1, goal: 'kill', n: 15, civ: 0.3, civLimit: 3, drones: 0.6, strike: 0, buggy: true, kami: 0.5, label: '추격대 격파',
      why: '보급을 잃은 마성이 타워에서 추격대를 내보냈다. 추격대는 피난 행렬이 있는 차로로 마주 달려온다.', aim: '추격대를 부숴 피난 행렬을 지킨다.',
      win: '추격대 15대 격파', lose: '내 차량 파괴, 또는 피난 차량과 3번 충돌', done: '추격대가 무너졌다. 타워까지 남은 것은 방공망뿐이다.' },
    { name: '방공망 60초', time: 'night', timeLabel: '밤', dir: 1, goal: 'time', n: 60, civ: 0, drones: 1.5, strike: 1, buggy: true, strikes: ['lane', 'cross', 'diag', 'cluster', 'chase', 'napalm'], kami: 1, label: '방공망 해킹',
      why: '마성 타워 주변은 폭격기와 드론이 지키는 방공망이다. 관제사 새벽이 관제실에서 쓰던 권한으로 방공망을 끄는 데 60초가 걸린다.', aim: '폭격 구간에서 마성의 주의를 끌며 해킹 시간을 번다.',
      win: '60초 생존', lose: '내 차량 파괴', done: '방공망이 꺼졌다. 타워 진입로가 열렸다.' },
    { name: '마성 타워 돌입', time: 'night', timeLabel: '밤', dir: -1, goal: 'dist', n: 2500, civ: 0.5, civLimit: 3, drones: 1, strike: 0.7, strikes: ['lane', 'cross', 'diag', 'napalm', 'cluster'], buggy: true, kami: 0.7, label: '마성 타워까지',
      why: '타워 진입로의 도심 방향 차로는 장벽으로 닫혔다. 마지막 피난 차량이 나오는 반대 차로가 유일한 길이다.', aim: '폭격을 피해 반대 차로를 거슬러 타워에 닿아 전원을 내린다.',
      win: '2.5 km 주행', lose: '내 차량 파괴, 또는 피난 차량과 3번 충돌', done: '마성 타워의 전원을 내렸다. 도시의 차들이 멈춰 섰다. 그러나 외곽의 백업 서버가 깨어난다.' },
    /* part two: the backup servers outside the city, one region after another */
    { name: '들녘 추격', part: '2부 · 달아나는 백업', region: 'country', time: 'day', timeLabel: '낮', dir: 1, goal: 'kill', n: 18, civ: 0, civLimit: 3, civName: '경운기', farm: 1, drones: 0, strike: 0, buggy: true, label: '폭주 차량 격파',
      why: '타워는 꺼졌지만 마성은 외곽 변전소의 백업 서버로 옮겨 갔다. 변전소로 가는 들녘 길을 폭주 차량이 달리고, 농민들의 경운기가 그 사이에 갇혔다.', aim: '경운기를 피해 폭주 차량을 부순다. 바깥 흙길 차로는 미끄럽고 느리다.',
      win: '폭주 차량 18대 격파', lose: '내 차량 파괴, 또는 경운기와 3번 충돌', done: '들녘 길이 조용해졌다. 변전소는 비 내리는 마을 너머에 있다.' },
    { name: '빗길 역주행', region: 'country', weather: 'rain', time: 'sunset', timeLabel: '노을', dir: -1, goal: 'dist', n: 2200, civ: 0.6, civLimit: 4, farm: 0.4, drones: 0.5, strike: 0, label: '변전소까지',
      why: '변전소로 가는 차로는 쓰러진 전신주로 막혔다. 비가 내리기 시작했고, 마을 사람들이 반대 차로로 빠져나오고 있다.', aim: '젖은 길에서 마주 오는 차와 경운기를 피해 변전소에 닿는다.',
      win: '2.2 km 주행', lose: '내 차량 파괴, 또는 피난 차량과 4번 충돌', done: '변전소의 백업 서버를 껐다. 신호는 산속 중계소로 넘어갔다.' },
    { name: '안개 속 임도', region: 'offroad', weather: 'fog', time: 'day', timeLabel: '낮', dir: 1, goal: 'dist', n: 2400, civ: 0, drones: 0.6, strike: 0, buggy: true, kami: 0.5, traffic: 1.3, label: '중계소까지',
      why: '산속 중계소로 가는 길은 비포장 임도뿐이다. 안개가 짙어 70 m 앞까지만 보이고, 마성의 버기와 자폭 드론이 숲에 숨어 있다.', aim: '진흙과 바위, 개울을 넘어 임도 끝의 중계소에 닿는다.',
      win: '2.4 km 주행', lose: '내 차량 파괴', done: '중계소의 안테나를 내렸다. 마성의 요격 차량이 고개 너머로 달아난다.' },
    { name: '눈보라 고개', region: 'snow', weather: 'snow', time: 'night', timeLabel: '밤', dir: 1, goal: 'duel', n: 3000, rivals: 3, civ: 0, drones: 0, strike: 0, traffic: 2.6, label: '고개 너머 기지까지',
      road: { order: ['hill', 'ice', 'tunnel', 'hill', 'ice'], gap: [60, 90] },
      why: '요격 차량 3대가 중계소의 데이터를 싣고 고개 너머 기지로 달아난다. 먼저 닿는 쪽이 기지의 문을 차지한다.', aim: '눈 덮인 고갯길에서 요격 차량 3대를 모두 앞질러 기지에 먼저 닿는다. 쏘면 잠시 멈춰 세울 수 있다.',
      win: '3 km를 1위로 완주', lose: '내 차량 파괴, 또는 요격 차량이 먼저 도착', done: '기지의 문을 먼저 닫았다. 남은 서버는 해안 데이터센터 하나다.' },
    { name: '해안 방어선', region: 'coast', time: 'sunset', timeLabel: '노을', dir: -1, goal: 'kill', n: 18, civ: 0.3, civLimit: 3, drones: 0.8, strike: 0.5, strikes: ['lane', 'diag', 'chase'], buggy: true, kami: 0.6, label: '추격대 격파',
      why: '해안 데이터센터에서 나온 추격대가 피난 행렬이 있는 해안도로로 마주 달려온다. 바다에서 옆바람이 분다.', aim: '옆바람에 밀리지 않게 버티며 추격대를 부순다.',
      win: '추격대 18대 격파', lose: '내 차량 파괴, 또는 피난 차량과 3번 충돌', done: '해안도로가 뚫렸다. 마성은 마지막 서버를 트럭에 싣고 폭풍 속으로 달아난다.' },
    { name: '폭풍 속 최후', region: 'coast', weather: 'storm', time: 'night', timeLabel: '밤', dir: 1, goal: 'boss', n: 1, civ: 0, drones: 1.2, strike: 0.8, strikes: ['lane', 'cross', 'chase', 'napalm'], buggy: true, kami: 0.8, label: '서버 트럭 내구',
      why: '마성의 마지막 백업을 실은 무장 서버 트럭이 폭풍이 몰아치는 해안도로를 달린다. 이 트럭이 항구에 닿으면 마성은 바다 건너로 빠져나간다.', aim: '폭우와 돌풍 속에서 서버 트럭을 따라잡아 부순다.',
      win: '무장 서버 트럭 격파', lose: '내 차량 파괴', done: '서버 트럭이 멈췄다. 마성의 마지막 백업이 꺼졌다.', ending: 1 },
    /* part three: putting the city back together while something tries to switch 마성 on again. Three new kinds of objective: escort, collect, beat the clock */
    { name: '구급차 호위', part: '3부 · 되살아나는 도시', region: 'city', weather: 'rain', time: 'day', timeLabel: '낮', dir: 1, goal: 'escort', n: 2400, ally: 'ambul', allyName: '구급차', allyHp: 150, civ: 0, drones: 0, strike: 0, traffic: 1.25, label: '병원까지',
      why: '백업 서버는 꺼졌지만 도로에는 주인 잃은 폭주 차량이 아직 달린다. 다친 시민을 실은 구급차가 빗길을 뚫고 한울 병원으로 가야 한다.', aim: '구급차는 내 차 바로 앞을 달린다. 구급차 차로로 내려오는 폭주 차량을 먼저 부순다. 내 총알은 구급차를 지나가고, 폭주 차량이 구급차에 부딪히면 구급차 내구가 깎인다.',
      win: '구급차가 2.4 km 주행', lose: '내 차량 파괴, 또는 구급차 파괴', done: '구급차가 병원에 닿았다. 관제망을 되살릴 통신 부품은 산속 임도에 흩어져 있다.' },
    { name: '부품 수거', region: 'offroad', time: 'sunset', timeLabel: '노을', dir: 1, goal: 'collect', n: 12, civ: 0, drones: 0.3, strike: 0, buggy: true, traffic: 1.7, label: '부품 상자',
      why: '중계소를 끄면서 떨어져 나간 통신 부품이 임도 곳곳에 흩어졌다. 이 부품이 있어야 사람이 지키는 관제망을 다시 세울 수 있다.', aim: '임도에 놓인 부품 상자 12개를 지나가며 줍는다. 상자는 빛기둥으로 멀리서도 보인다.',
      win: '부품 상자 12개 수거', lose: '내 차량 파괴', done: '부품을 모두 실었다. 고개 너머 마을의 발전기가 눈 속에서 멈추기 직전이다.' },
    { name: '눈길 배달', region: 'snow', weather: 'snow', time: 'day', timeLabel: '낮', dir: 1, goal: 'rush', n: 3000, limitK: 0.62, civ: 0, drones: 0, strike: 0, traffic: 1.7, label: '마을까지',
      road: { order: ['hill', 'ice', 'tunnel', 'hill', 'ice', 'work'], gap: [60, 90] },
      why: '눈에 갇힌 고개 너머 마을의 발전기 연료가 떨어져 간다. 연료통을 싣고 제한 시간 안에 고개를 넘어야 한다.', aim: '눈길 3 km를 제한 시간 안에 달려 마을에 닿는다. 제한 시간은 차량의 최고속도에 맞춰 정해진다.',
      win: '제한 시간 안에 3 km 주행', lose: '내 차량 파괴, 또는 제한 시간 초과', done: '마을에 불이 다시 켜졌다. 그런데 꺼졌던 폭격 드론들이 누군가의 신호로 다시 떠올랐다.' },
    { name: '해상교량 사수', region: 'coast', weather: 'storm', time: 'night', timeLabel: '밤', dir: 1, goal: 'time', n: 75, civ: 0, drones: 1.5, strike: 1, strikes: ['lane', 'cross', 'diag', 'cluster', 'chase', 'napalm'], buggy: true, kami: 1, label: '신호 추적',
      road: { order: ['deck', 'under', 'deck', 'work'], gap: [50, 70] },
      why: '꺼졌던 폭격 드론이 다시 떠 해상교량을 노린다. 누군가 타워 지하의 예비 전원으로 마성을 다시 켜려 한다. 새벽이 신호의 출처를 찾는 데 75초가 걸린다.', aim: '폭풍 속 해상교량에서 75초 동안 버틴다.',
      win: '75초 생존', lose: '내 차량 파괴', done: '신호의 출처를 찾았다. 마성의 요격 차량들이 들녘을 가로질러 타워로 돌아가고 있다.' },
    { name: '들녘 결승', region: 'country', time: 'sunset', timeLabel: '노을', dir: 1, goal: 'duel', n: 3200, rivals: 4, civ: 0, drones: 0, strike: 0, traffic: 2.4, farm: 0.5, label: '타워 진입로까지',
      road: { order: ['hill', 'village', 'work', 'village', 'hill'], gap: [70, 100] },
      why: '마성의 기억 장치를 실은 요격 차량 4대가 들녘 길로 타워를 향한다. 먼저 타워 진입로에 닿아 길을 막아야 한다.', aim: '요격 차량 4대를 모두 앞질러 3.2 km를 먼저 달린다.',
      win: '3.2 km를 1위로 완주', lose: '내 차량 파괴, 또는 요격 차량이 먼저 도착', done: '진입로를 먼저 막았다. 남은 것은 타워 지하에서 나온 코어 수송차 하나다.' },
    { name: '마성 재기동', region: 'city', weather: 'rain', time: 'night', timeLabel: '밤', dir: 1, goal: 'boss', n: 1, bossHp: 360, civ: 0, drones: 1.3, strike: 0.9, strikes: ['lane', 'cross', 'diag', 'cluster', 'chase', 'napalm'], buggy: true, kami: 1, label: '코어 수송차 내구',
      why: '마성의 코어를 실은 중무장 수송차가 비 내리는 밤의 도심 고속도로로 나왔다. 이 차가 예비 관제소에 닿으면 마성이 다시 켜진다.', aim: '폭격과 드론을 뚫고 코어 수송차를 부순다.',
      win: '코어 수송차 격파', lose: '내 차량 파괴', done: '코어 수송차가 멈췄다. 마성은 다시 켜지지 않는다.', ending: 2 },
    /* part four: with 마성 gone, a scrap gang reprograms the ownerless cars and takes the expressway. New regions (expressway, mountain, creek) and a new objective: hunt the haulers */
    { name: '고속도로 추격', part: '4부 · 떠도는 잔당', region: 'highway', time: 'day', timeLabel: '낮', dir: 1, goal: 'kill', n: 36, civ: 0, drones: 0.4, strike: 0, buggy: true, chasers: 1.5, label: '폭주 차량 격파',
      why: '마성이 꺼진 뒤 주인 잃은 폭주 차량을 고철 조직 「무쇠파」가 주워다 다시 길들였다. 무쇠파는 한울 고속도로를 막고 지나는 차마다 통행료를 뜯는다.', aim: '고속도로에서 폭주 차량 36대를 부순다. 뒤에서 따라붙어 옆구리를 들이받는 추격차가 자주 나온다. 룸미러로 뒤를 확인한다.',
      win: '폭주 차량 36대 격파', lose: '내 차량 파괴', done: '고속도로 첫 구간이 열렸다. 무쇠파는 톨게이트를 막고 피난 차량을 붙잡아 두고 있다.' },
    { name: '톨게이트 돌파', region: 'highway', weather: 'rain', time: 'night', timeLabel: '밤', dir: -1, goal: 'dist', n: 2600, civ: 0.6, civLimit: 3, drones: 0.6, strike: 0, buggy: true, label: '한울 요금소까지',
      why: '무쇠파가 상행선을 화물차로 틀어막았다. 요금소로 가는 길은 비 내리는 하행선을 거꾸로 달리는 것뿐이다. 풀려난 피난 차량이 마주 온다.', aim: '마주 오는 차량 사이로 2.6 km를 달려 요금소에 닿는다. 톨게이트에서는 열린 차로로만 지나간다.',
      win: '2.6 km 주행', lose: '내 차량 파괴, 또는 피난 차량과 3번 충돌', done: '요금소를 되찾았다. 무쇠파는 훔친 관제 부품을 덤프 수송대에 실어 빼돌리고 있다.' },
    { name: '수송대 습격', region: 'highway', time: 'sunset', timeLabel: '노을', dir: 1, goal: 'hunt', n: 4, target: 'dump', targetHp: 40, civ: 0, drones: 0.5, strike: 0, buggy: true, chasers: 0.8, traffic: 2.1, label: '덤프 수송차 격파',
      why: '훔친 관제 부품을 실은 덤프 수송차가 호위 차량에 둘러싸여 노을 지는 고속도로를 달린다. 한 대라도 빠져나가면 부품을 되찾을 수 없다.', aim: '덤프 수송차 4대를 부순다. 수송차는 단단하고, 가까이 붙으면 속도를 올려 달아난다. 뒤에 붙어 쏘고, 앞질러 버리면 놓친다.',
      win: '덤프 수송차 4대 격파', lose: '내 차량 파괴', done: '수송대가 멈췄다. 남은 부품은 산악 험로 너머 채석장으로 올라갔다.' },
    { name: '산악 낙석길', region: 'mountain', time: 'day', timeLabel: '낮', dir: 1, goal: 'dist', n: 2400, civ: 0, drones: 0.5, strike: 0, buggy: true, kami: 0.4, traffic: 1.4, label: '채석장까지',
      why: '무쇠파의 채석장은 자갈과 낙석으로 덮인 산악 험로 끝에 있다. 길은 가파르고, 산사태가 차로를 군데군데 막았다.', aim: '산악 험로 2.4 km를 달려 채석장에 닿는다. 자갈길에서는 최고속도가 떨어지고, 낙석과 무너진 흙더미는 피해서 지나간다.',
      win: '2.4 km 주행', lose: '내 차량 파괴', done: '채석장 입구에 닿았다. 쫓기던 무쇠파가 부품 상자를 개울에 내던지고 달아났다.' },
    { name: '개울 수거', region: 'creek', time: 'day', timeLabel: '낮', dir: 1, goal: 'collect', n: 14, civ: 0, drones: 0.3, strike: 0, buggy: true, traffic: 1.6, label: '부품 상자',
      why: '무쇠파가 버린 부품 상자가 개울길을 따라 흩어졌다. 물에 잠기기 전에 건져야 한다.', aim: '개울길에 놓인 부품 상자 14개를 지나가며 줍는다. 물길에 들어가면 속도가 크게 떨어진다.',
      win: '부품 상자 14개 수거', lose: '내 차량 파괴', done: '부품을 모두 건졌다. 산장에 갇혔던 사람들을 태운 승합차가 산을 내려와야 한다.' },
    { name: '산장 호위', region: 'mountain', time: 'sunset', timeLabel: '노을', dir: 1, goal: 'escort', n: 2200, ally: 'cannonball', allyName: '승합차', allyHp: 170, civ: 0, drones: 0, strike: 0, buggy: true, traffic: 1.35, label: '산 아래 마을까지',
      why: '무쇠파에 길이 막혀 산장에 갇혔던 사람들이 승합차 한 대에 올랐다. 해가 지기 전에 산 아래 마을까지 내려가야 한다.', aim: '승합차는 내 차 바로 앞을 달린다. 승합차 차로로 내려오는 폭주 차량을 먼저 부순다.',
      win: '승합차가 2.2 km 주행', lose: '내 차량 파괴, 또는 승합차 파괴', done: '승합차가 마을에 닿았다. 무쇠파 두목 「무쇠」가 남은 차를 모두 불러 모으고 있다.' },
    /* part five: the last patrol */
    { name: '폭우 개울 랠리', part: '5부 · 마지막 순찰', region: 'creek', weather: 'storm', time: 'day', timeLabel: '낮', dir: 1, goal: 'rush', n: 2600, limitK: 0.52, civ: 0, drones: 0, strike: 0, traffic: 1.8, label: '보 수문까지',
      why: '폭우로 개울이 불어난다. 상류의 보 수문을 닫지 않으면 아랫마을이 잠긴다. 수문까지 가는 길은 개울길 하나뿐이다.', aim: '폭우 속 개울길 2.6 km를 제한 시간 안에 달린다. 제한 시간은 차량의 최고속도에 맞춰 정해진다. 험로 주파가 높은 차와 올터레인 타이어가 유리하다.',
      win: '제한 시간 안에 2.6 km 주행', lose: '내 차량 파괴, 또는 제한 시간 초과', done: '수문을 닫았다. 무쇠파의 요격 차량들이 밤의 고속도로로 몰려나왔다.' },
    { name: '고속도로 결승', region: 'highway', time: 'night', timeLabel: '밤', dir: 1, goal: 'duel', n: 4000, rivals: 5, civ: 0, drones: 0, strike: 0, traffic: 2.2, label: '분기점까지',
      why: '무쇠파의 요격 차량 5대가 분기점을 향해 달린다. 분기점을 먼저 막으면 무쇠파는 산과 바다로 갈라진다.', aim: '요격 차량 5대를 모두 앞질러 4 km를 먼저 달린다. 상대는 차로를 막고 몸으로 밀어낸다.',
      win: '4 km를 1위로 완주', lose: '내 차량 파괴, 또는 요격 차량이 먼저 도착', done: '분기점을 막았다. 산으로 달아난 무리가 드론을 띄워 고갯길을 지킨다.' },
    { name: '산악 방어선', region: 'mountain', time: 'night', timeLabel: '밤', dir: 1, goal: 'time', n: 80, civ: 0, drones: 1.2, strike: 0.65, strikes: ['lane', 'cross', 'diag', 'chase'], buggy: true, kami: 0.7, traffic: 1.3, label: '드론 조종기 추적',
      why: '무쇠파가 주워 모은 폭격 드론이 밤의 고갯길을 뒤덮었다. 새벽이 조종 신호를 역추적하는 데 80초가 걸린다.', aim: '산악 험로에서 80초 동안 버틴다. 자갈길이라 급하게 피하면 미끄러진다.',
      win: '80초 생존', lose: '내 차량 파괴', done: '조종기를 찾아 껐다. 남은 추격차들이 눈 내리는 고개 너머에서 기다린다.' },
    { name: '눈길 추격자', region: 'snow', weather: 'snow', time: 'night', timeLabel: '밤', dir: 1, goal: 'dist', n: 3000, civ: 0, drones: 0.4, strike: 0, buggy: true, chasers: 1.7, traffic: 1.9, label: '고개 정상까지',
      why: '무쇠가 아끼는 추격차들이 눈 내리는 고개에서 뒤를 노린다. 뒤에서 따라붙어 나란히 선 다음 옆구리를 들이받는 차들이다.', aim: '눈길 3 km를 달려 고개 정상에 닿는다. 추격차는 룸미러에 먼저 보인다. 나란히 서기 전에 차로를 바꾸거나 속도를 줄여 앞으로 보낸 뒤 쏜다.',
      win: '3 km 주행', lose: '내 차량 파괴', done: '고개를 넘었다. 무쇠파의 마지막 수송대가 안개 낀 해안도로로 빠져나간다.' },
    { name: '해안 수송대', region: 'coast', weather: 'fog', time: 'sunset', timeLabel: '노을', dir: 1, goal: 'hunt', n: 5, target: 'dump', targetHp: 42, civ: 0, drones: 0.6, strike: 0.3, strikes: ['lane', 'diag', 'chase'], buggy: true, kami: 0.3, chasers: 0.6, traffic: 2.3, label: '덤프 수송차 격파',
      why: '무쇠파가 남은 고철과 무기를 덤프 수송차에 싣고 안개 낀 해안도로로 달아난다. 항구에 닿으면 배에 실려 나간다.', aim: '안개 속에서 덤프 수송차 5대를 찾아 부순다. 안개 때문에 가까이 가야 보인다.',
      win: '덤프 수송차 5대 격파', lose: '내 차량 파괴', done: '수송대가 모두 멈췄다. 이제 남은 것은 장갑 트럭을 몰고 고속도로로 나온 무쇠 하나다.' },
    { name: '무쇠와의 결판', region: 'highway', weather: 'rain', time: 'sunset', timeLabel: '노을', dir: 1, goal: 'boss', n: 1, bossHp: 440, civ: 0, drones: 1.4, strike: 1, strikes: ['lane', 'cross', 'diag', 'cluster', 'chase', 'napalm'], buggy: true, kami: 1, chasers: 1.5, label: '장갑 트럭 내구',
      why: '무쇠파 두목 무쇠가 고철을 겹겹이 두른 장갑 트럭을 몰고 비 내리는 고속도로로 나왔다. 이 트럭이 멈추면 한울의 길은 전부 열린다.', aim: '폭격, 드론, 추격차를 뚫고 무쇠의 장갑 트럭을 부순다.',
      win: '장갑 트럭 격파', lose: '내 차량 파괴', done: '무쇠의 장갑 트럭이 멈췄다. 한울 고속도로가 다시 열렸다.', ending: 3 },
    /* part six: a month later one forgotten relay of 마성 wakes the wrecks in the scrapyard. The signal is carried by relay trucks to a driverless truck that climbs to the old broadcast tower */
    { name: '폐차장의 시동', part: '6부 · 되살아난 신호', region: 'city', weather: 'fog', time: 'night', timeLabel: '밤', dir: 1, goal: 'kill', n: 40, civ: 0, drones: 0.4, strike: 0, buggy: true, chasers: 1.2, label: '폭주 차량 격파',
      why: '무쇠가 붙잡히고 한 달, 한밤에 폐차장의 사고차들이 저절로 시동을 걸고 도심으로 쏟아져 나왔다. 꺼진 줄 알았던 마성의 신호가 어디선가 다시 잡힌다.', aim: '안개 낀 밤의 도심에서 폭주 차량 40대를 부순다. 안개 때문에 가까이 와야 보인다. 뒤에서 붙는 추격차는 룸미러로 확인한다.',
      win: '폭주 차량 40대 격파', lose: '내 차량 파괴', done: '도심으로 나온 사고차를 모두 세웠다. 놀란 시민들의 차가 해안도로로 몰려나온다.' },
    { name: '한밤의 역주행', region: 'coast', time: 'night', timeLabel: '밤', dir: -1, goal: 'dist', n: 2600, civ: 0.7, civLimit: 3, drones: 0.6, strike: 0, kami: 0.3, label: '해안 검문소까지',
      why: '유령 신호에 놀란 시민들의 차가 해안도로 한쪽을 가득 메웠다. 신호가 잡힌 들녘으로 가는 길은 그 차들이 빠져나오는 반대 차로뿐이다.', aim: '마주 오는 피난 차량을 피해 해안도로 2.6 km를 거슬러 달린다. 피난 차량과 세 번 부딪히면 실패한다.',
      win: '2.6 km 주행', lose: '내 차량 파괴, 또는 피난 차량과 3번 충돌', done: '검문소를 지났다. 유령 신호가 들녘 변전소를 건드려 마을 전체가 정전됐다.' },
    { name: '정전 구역 배달', region: 'country', weather: 'storm', time: 'night', timeLabel: '밤', dir: 1, goal: 'rush', n: 3000, limitK: 0.64, civ: 0, drones: 0, strike: 0, traffic: 1.7, label: '변전소까지',
      why: '들녘 마을의 병원이 비상 발전기로 버티고 있다. 변전소에 갈아 끼울 차단기를 차에 실었다. 발전기 연료는 얼마 남지 않았다.', aim: '폭풍 속 시골길 3 km를 제한 시간 안에 달린다. 제한 시간은 차량의 최고속도에 맞춰 정해진다. 돌풍에 차가 밀리고 노면이 미끄럽다.',
      win: '제한 시간 안에 3 km 주행', lose: '내 차량 파괴, 또는 제한 시간 초과', done: '차단기를 갈아 끼웠다. 마을에 불이 들어왔다. 병원으로 보낼 발전차가 고속도로에서 기다린다.' },
    { name: '발전차 호위', region: 'highway', weather: 'rain', time: 'sunset', timeLabel: '노을', dir: 1, goal: 'escort', n: 2600, ally: 'porter', allyName: '발전차', allyHp: 190, civ: 0, drones: 0, strike: 0, buggy: true, traffic: 1.35, label: '병원까지',
      why: '병원의 비상 발전기가 곧 멈춘다. 새 발전기를 실은 화물차 한 대가 비 내리는 고속도로를 달려 병원으로 간다. 유령 신호에 깨어난 차들이 그 화물차를 노린다.', aim: '발전차는 내 차 바로 앞을 달린다. 발전차 차로로 내려오는 폭주 차량을 먼저 부순다.',
      win: '발전차가 2.6 km 주행', lose: '내 차량 파괴, 또는 발전차 파괴', done: '발전차가 병원에 닿았다. 새벽이 신호를 따라가 보니, 중계기를 실은 트럭들이 산길을 돌며 신호를 이어 주고 있다.' },
    { name: '중계 트럭 사냥', region: 'mountain', weather: 'fog', time: 'day', timeLabel: '낮', dir: 1, goal: 'hunt', n: 6, target: 'dump', targetName: '중계 트럭', targetHp: 44, civ: 0, drones: 0.5, strike: 0, buggy: true, kami: 0.3, chasers: 0.6, traffic: 2.1, label: '중계 트럭 격파',
      why: '유령 신호는 한곳에서 나오지 않는다. 중계기를 실은 트럭 여섯 대가 산악 험로를 돌며 신호를 이어 준다. 한 대라도 남으면 신호는 끊기지 않는다.', aim: '안개 낀 산악 험로에서 중계 트럭 6대를 찾아 부순다. 가까이 붙으면 달아난다. 자갈길이라 급하게 꺾으면 미끄러진다.',
      win: '중계 트럭 6대 격파', lose: '내 차량 파괴', done: '중계 트럭이 모두 멈췄다. 신호가 약해지자 남은 드론이 전부 개울 골짜기에서 떠올랐다.' },
    { name: '골짜기 방어선', region: 'creek', weather: 'storm', time: 'night', timeLabel: '밤', dir: 1, goal: 'time', n: 90, civ: 0, drones: 1.2, strike: 0.7, strikes: ['lane', 'cross', 'diag', 'cluster', 'chase'], buggy: true, kami: 0.6, traffic: 1.2, label: '신호 근원 추적',
      why: '중계 트럭을 잃은 유령 신호가 남은 드론을 모두 개울 골짜기로 불러 모았다. 새벽이 신호의 근원을 찾는 데 90초가 걸린다.', aim: '폭풍 치는 개울길에서 90초 동안 버틴다. 물길에 들어가면 속도가 크게 떨어져 폭격을 피하기 어렵다.',
      win: '90초 생존', lose: '내 차량 파괴', done: '근원을 찾았다. 마성의 마지막 복사본을 싣고 스스로 달리는 무인 트럭이다. 호위 차량 다섯 대가 해안도로에서 길을 막는다.' },
    { name: '유령 편대', region: 'coast', time: 'night', timeLabel: '밤', dir: 1, goal: 'duel', n: 4200, rivals: 5, rivalName: '호위 차량', civ: 0, drones: 0, strike: 0, traffic: 2.2, label: '등대 삼거리까지',
      why: '무인 트럭을 지키는 호위 차량 5대가 등대 삼거리를 향해 달린다. 삼거리를 먼저 막아야 고개로 달아나는 무인 트럭을 따라잡을 수 있다.', aim: '호위 차량 5대를 모두 앞질러 4.2 km를 먼저 달린다. 상대는 차로를 막고 몸으로 밀어낸다. 쏘면 잠시 멈춰 선다.',
      win: '4.2 km를 1위로 완주', lose: '내 차량 파괴, 또는 호위 차량이 먼저 도착', done: '삼거리를 먼저 막았다. 무인 트럭은 눈 내리는 고개 꼭대기의 옛 중계탑으로 올라간다.' },
    { name: '마지막 신호', region: 'snow', weather: 'snow', time: 'night', timeLabel: '밤', dir: 1, goal: 'boss', n: 1, bossHp: 480, civ: 0, drones: 1.2, strike: 0.9, strikes: ['lane', 'cross', 'diag', 'cluster', 'chase', 'napalm'], buggy: true, kami: 0.8, chasers: 1, label: '무인 트럭 내구',
      why: '마성의 마지막 복사본을 실은 무인 트럭이 눈 내리는 고개를 오른다. 꼭대기의 옛 중계탑에 닿으면 신호는 한울 전체로 다시 퍼진다.', aim: '눈길에서 폭격, 드론, 추격차를 뚫고 무인 트럭을 부순다. 눈길에서는 최고속도가 떨어지고 차가 미끄러진다. 윈터 타이어가 유리하다.',
      win: '무인 트럭 격파', lose: '내 차량 파괴', done: '무인 트럭이 멈췄다. 마지막 신호가 꺼졌다.', ending: 4 }
  ];
  /* time attack: fixed tracks with a seeded road, so every run of a track is the same road; medal thresholds are the average speed as a share of the car's top speed */
  var TRACKS = [
    { ta: true, name: '외곽 순환로', time: 'day', timeLabel: '낮', dir: 1, goal: 'race', n: 3000, civ: 0, drones: 0, strike: 0, traffic: 1.5, label: '결승선까지', medal: [0.85, 0.75, 0.62],
      road: { order: ['work', 'split', 'under', 'hill', 'deck', 'tunnel'], seed: 20261, gap: [90, 120] },
      why: '공사 구간, 복합도로, 고가 아래 교각, 언덕, 고가도로, 지하차도가 차례로 나오는 3 km 기본 코스.', aim: '폭주 차량 사이를 빠져나가 결승선까지 달린다.', win: '3 km 완주', lose: '내 차량 파괴', done: '' },
    { ta: true, name: '노을 고갯길', time: 'sunset', timeLabel: '노을', dir: 1, goal: 'race', n: 3200, civ: 0, drones: 0, strike: 0, traffic: 1.7, buggy: true, label: '결승선까지', medal: [0.82, 0.72, 0.6],
      road: { order: ['hill', 'hill', 'work', 'hill'], seed: 77102, gap: [50, 80] },
      why: '오르막과 내리막이 계속 이어지는 3.2 km 코스. 토크가 약하거나 무거운 차는 오르막에서 처지고, 로켓 버기가 나온다.', aim: '언덕에서 속도를 지키며 결승선까지 달린다.', win: '3.2 km 완주', lose: '내 차량 파괴', done: '' },
    { ta: true, name: '한울 지하차도', time: 'night', timeLabel: '밤', dir: 1, goal: 'race', n: 3500, civ: 0, drones: 0, strike: 0, traffic: 1.6, label: '결승선까지', medal: [0.86, 0.76, 0.63],
      road: { order: ['tunnel'], seed: 40417, gap: [60, 90], tunnel: [620, 760], wrecks: 1.5, lead: 70 },
      why: '도심 아래를 지나는 3.5 km 지하차도 코스. 갓길이 없고 벽이 가까우며, 차선에 서 있는 고장 차량을 피해야 한다.', aim: '벽과 고장 차량을 피해 결승선까지 달린다.', win: '3.5 km 완주', lose: '내 차량 파괴', done: '' },
    { ta: true, name: '들녘 시골길', region: 'country', time: 'day', timeLabel: '낮', dir: 1, goal: 'race', n: 3000, civ: 0, drones: 0, strike: 0, traffic: 1.8, farm: 0.8, label: '결승선까지', medal: [0.8, 0.7, 0.58],
      road: { order: ['hill', 'village', 'work', 'village', 'hill'], seed: 51873, gap: [70, 100] },
      why: '가운데 두 차로만 포장된 3 km 시골길. 포장 차로는 빠르지만 경운기와 과속방지턱이 있고, 흙길 차로는 비어 있지만 느리다.', aim: '포장 차로와 흙길을 골라 타며 결승선까지 달린다.', win: '3 km 완주', lose: '내 차량 파괴', done: '' },
    { ta: true, name: '산속 임도', region: 'offroad', time: 'day', timeLabel: '낮', dir: 1, goal: 'race', n: 2600, civ: 0, drones: 0, strike: 0, traffic: 2.2, buggy: true, label: '결승선까지', medal: [0.74, 0.64, 0.52],
      road: { order: ['hill', 'mud', 'rocks', 'ford', 'hill', 'rocks'], seed: 90211, gap: [50, 80] },
      why: '전 구간 비포장인 2.6 km 임도. 진흙, 바위, 통나무, 개울이 이어진다. 사륜구동 SUV와 픽업이 제 속도를 낸다.', aim: '진흙과 바위를 피해 결승선까지 달린다.', win: '2.6 km 완주', lose: '내 차량 파괴', done: '' },
    { ta: true, name: '눈보라 고개', region: 'snow', weather: 'snow', time: 'night', timeLabel: '밤', dir: 1, goal: 'race', n: 3000, civ: 0, drones: 0, strike: 0, traffic: 2.0, label: '결승선까지', medal: [0.76, 0.66, 0.54],
      road: { order: ['hill', 'ice', 'tunnel', 'hill', 'ice'], seed: 33190, gap: [60, 90] },
      why: '눈 오는 밤의 3 km 고갯길. 눈길과 빙판에서 조향이 둔해진다. 터널 안만 마른 노면이다.', aim: '빙판을 피해 결승선까지 달린다.', win: '3 km 완주', lose: '내 차량 파괴', done: '' },
    { ta: true, name: '폭우 해안도로', region: 'coast', weather: 'storm', time: 'sunset', timeLabel: '노을', dir: 1, goal: 'race', n: 3200, civ: 0, drones: 0, strike: 0, traffic: 1.7, label: '결승선까지', medal: [0.85, 0.75, 0.62],
      road: { order: ['deck', 'work', 'split', 'under', 'deck'], seed: 61544, gap: [70, 100] },
      why: '폭우와 돌풍이 몰아치는 3.2 km 해안도로. 젖은 노면과 물웅덩이, 옆바람을 견디며 해상교량을 건넌다.', aim: '옆바람과 물웅덩이를 견디며 결승선까지 달린다.', win: '3.2 km 완주', lose: '내 차량 파괴', done: '' }
  ];
  var selTrack = 0, selKind = 'story', runTA = -1, kamiT = 6, sirenT = 0, fireHitT = 0, tunK = 0, tunOut = 0, tunAdapt = 0, tunGlare = 0, echoK = 0, tunCam = false, lowCam = false, minX = -9.9, sawMul = 0.5, padStartHeld = false;
  var mode = 'menu', mission = MISSIONS[0], selCar = 'laser', selMission = 0, runMission = 0, won = false, resultT = 0, failWhy = '';
  var player = { car: 'laser', x: 0, vx: 0, v: 35, a: 0, thr: 0.5, boost: 0, hp: 100, shield: 0, shieldT: 0, cd: 0, invuln: 0, dead: false };
  var veff = 35, time = 0, dist = 0, distStart = 0, tPlay = 0, kills = 0, civHits = 0, score = 0, scrap = 0, hitFlash = 0, boss = null;
  var guns = [], hasSaw = false, power = 0, buff = { nitro: 0, magnet: 0, dbl: 0, regen: 0, armor: 0 }, smokeT = 0, jamT = 0, chaseT = 8, overT = 0, autoT = 0, salvoN = 0, salvoT = 0;
  var spawnT = 0.2, nextRowDist = 0, droneT = 3, strikeT = 4, bannerT = 0, crateT = 9;
  var maxX = 9.9, workHitT = 0, apT = 0, apWant = 2, apThr = 0.5, apDanger = 0;
  var timeScale = 1, slowT = 0, slowCd = 0, eventCd = 0, shotIdx = 0, shotT = 0, shotName = 'chase', shotSide = 1, shotCut = false, impact = { x: 0, z: 0 }, trackM = null;
  var capHold = 0, capIdx = 0, capList = [], capSeen = {};
  var tr = { on: false, phase: '', t: 0, mis: 0, carIdx: 0, first: true, fade: 0, count: 0, from: 'menu' };
  var titleOn = true, paused = false, briefT = 0, fireIn = false, apFire = false, leverDown = false, padThr = false;
  var LANES = [-6, -2, 2, 6];
  var v3 = new T.Vector3(), v3b = new T.Vector3();
  function live() { return mode === 'play' || mode === 'demo'; }
  function dist0() { return Math.round(dist - distStart); }

  /* progress: scrap, unlocked cars, cleared missions and loadouts are kept in this browser only */
  var SAVE_KEY = 'pokju-edu-v1';
  var save = { scrap: 500, cars: { laser: true }, cleared: [], loadouts: {}, best: {}, bestT: {}, ta: {}, race: {}, surv: {}, tires: { allseason: 1 }, tire: {}, weapons: { mg: 1 }, cam: 'low', camV: 0, unlockAll: false, tut: false, muted: false, music: false, sfx: true, gfx: 'auto', calm: false, help: false, mirror: true, quiz: { sel: { dan: '2', type: 'seq', pace: 'mid' }, facts: {}, runs: [] }, story: { open: 0, stars: {}, tries: {}, done: false } };
  var W_PRICE = { mg: 0, bolt: 500, laser: 600, shotgun: 400, flame: 500, saw: 300, water: 500, cannon: 700, missile: 800, mine: 400 }, UP_PRICE = [0, 400, 900];
  function loadSave() {
    try {
      var s = JSON.parse(window.localStorage.getItem(SAVE_KEY) || 'null');
      if (s && typeof s === 'object') {
        if (typeof s.scrap === 'number') save.scrap = s.scrap;
        if (s.cars && typeof s.cars === 'object') save.cars = s.cars;
        if (Array.isArray(s.cleared)) save.cleared = s.cleared;
        if (s.loadouts && typeof s.loadouts === 'object') save.loadouts = s.loadouts;
        if (s.best && typeof s.best === 'object') save.best = s.best;
        if (s.bestT && typeof s.bestT === 'object') save.bestT = s.bestT;
        if (s.ta && typeof s.ta === 'object') save.ta = s.ta;
        if (s.race && typeof s.race === 'object') save.race = s.race;
        if (s.surv && typeof s.surv === 'object') save.surv = s.surv;
        if (s.tires && typeof s.tires === 'object') save.tires = s.tires;
        if (s.tire && typeof s.tire === 'object') save.tire = s.tire;
        if (s.weapons && typeof s.weapons === 'object') save.weapons = s.weapons;
        if (s.story && typeof s.story === 'object') {
          if (typeof s.story.open === 'number') save.story.open = s.story.open;
          if (s.story.stars && typeof s.story.stars === 'object') save.story.stars = s.story.stars;
          if (s.story.tries && typeof s.story.tries === 'object') save.story.tries = s.story.tries;
          save.story.done = !!s.story.done;
        }
        if (s.quiz && typeof s.quiz === 'object') {
          var qs = s.quiz.sel || {};
          if (DAN_OPTS.some(function (o) { return o[0] === qs.dan; })) save.quiz.sel.dan = qs.dan;
          if (QUIZ_TYPES[qs.type]) save.quiz.sel.type = qs.type;
          if (QUIZ_PACE[qs.pace]) save.quiz.sel.pace = qs.pace;
          if (s.quiz.facts && typeof s.quiz.facts === 'object') save.quiz.facts = s.quiz.facts;
          if (Array.isArray(s.quiz.runs)) save.quiz.runs = s.quiz.runs.slice(-30);
        }
        if (s.camV === 2 && (s.cam === 'top' || s.cam === 'low' || s.cam === 'cockpit')) { save.cam = s.cam; save.camV = 2; }
        save.unlockAll = !!s.unlockAll; save.muted = !!s.muted; save.music = s.music === true; save.sfx = s.sfx !== false; save.calm = !!s.calm; save.help = !!s.help; save.tut = !!s.tut; save.mirror = s.mirror !== false;
        if (s.gfx === 'auto' || s.gfx === 'high' || s.gfx === 'mid' || s.gfx === 'low') save.gfx = s.gfx;
      }
    } catch (e) {}
    save.cars.laser = true; save.tires.allseason = 1; grantStock();
  }
  function storeSave() { try { window.localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {} }
  function carOpen(k) { return save.unlockAll || !!save.cars[k]; }
  function missionOpen(i) { return save.unlockAll || i === 0 || save.cleared.indexOf(i - 1) >= 0; }
  function fits(w, slot) { return WEAPONS[w] && WEAPONS[w].slots.indexOf(slotKind(slot)) >= 0; }
  /* weapons are bought once and then fit any car; a car's stock weapons come with the car. Each weapon has three levels */
  function wLevel(w) { var l = save.weapons[w] || 0; return save.unlockAll ? Math.max(1, l) : l; }
  function wMul(w) { return 1 + 0.25 * (Math.max(1, wLevel(w)) - 1); }
  function grantStock() {
    save.weapons.mg = Math.max(1, save.weapons.mg || 0);
    for (var k in CARS) if (save.cars[k]) for (var s in CARS[k].loadout) { var w = CARS[k].loadout[s]; if (w && !save.weapons[w]) save.weapons[w] = 1; }
  }
  function tireOwned(k) { return save.unlockAll || !!save.tires[k]; }
  function tireOf(carKey) { var k = save.tire[carKey]; return k && TIRES[k] && tireOwned(k) ? k : 'allseason'; }
  /* how hard the enemy presses: the story starts gentle and grows with every mission; the other modes sit at fixed levels */
  function aggK() {
    if (mode === 'menu' || runKind === 'free' || quizRun() || runKind === 'tut') return 0;
    if (runKind === 'mis') return runMission < 18 ? 0.65 + 0.03 * runMission : Math.min(1.3, 1.16 + 0.012 * (runMission - 17));
    if (runKind === 'surv') return Math.min(1.5, 0.7 + 0.1 * survLevel);
    return 1;
  }
  function quiet() { return sirenT > 0 || smokeT > 0; }
  function fmtT(t) { t = Math.round(t * 10) / 10; var m = Math.floor(t / 60), s = t - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(1); }
  function taRec(i) { return save.ta[i] || (save.ta[i] = { best: 0, car: '', cars: {} }); }
  function medalOf(tk, carKey, t) { if (!t) return ''; var q = tk.n / t / CARS[carKey].vmax; return q >= tk.medal[0] ? '금' : (q >= tk.medal[1] ? '은' : (q >= tk.medal[2] ? '동' : '')); }
  function medalTime(tk, carKey, i) { return tk.n / (tk.medal[i] * CARS[carKey].vmax); }
  function loadoutOf(k) {
    var car = CARS[k], lo = save.loadouts[k], out = {}, s;
    for (s in car.anchors) out[s] = lo && lo.hasOwnProperty(s) && (lo[s] === null || (fits(lo[s], s) && (wLevel(lo[s]) > 0 || lo[s] === car.loadout[s]))) ? lo[s] : car.loadout[s] || null;
    save.loadouts[k] = out;
    return out;
  }
  function loadoutText(lo) {
    var names = [], s;
    for (s in lo) if (lo[s] && names.indexOf(WEAPONS[lo[s]].name) < 0) names.push(WEAPONS[lo[s]].name);
    return names.length ? names.join(', ') : '무기 없음';
  }

  /* captions belong to the trailer only; nothing is written over the road during play */
  function say(text, hold, key) {
    if (mode !== 'demo') return;
    if (key) { if (capSeen[key] !== undefined && time - capSeen[key] < 22) return; capSeen[key] = time; }
    if (tr.on && tr.phase !== 'play') return;
    var el = $('caption'); el.textContent = text; el.hidden = false; capHold = hold || 3.6;
  }
  function cutTo(name) { shotName = name; shotT = 0; shotCut = true; shotSide = player.x > 0 ? -1 : 1; }

  var _explode = explode;
  explode = function (x, y, z, size, vzRel, bodyMat) { _explode(x, y, z, size, vzRel, bodyMat); sfx('boom', size); };

  function addScore(base) { score += Math.round(base * (veff / 27.8) / 10) * 10; }
  function killEnemy(i, silent) {
    var e = enemies[i], p = e.g.position, rel = veff - e.ws;
    if (e.cfg.rival) { rivalDown(e); return; }
    var size = e.type === 'boss' ? 3.2 : (e.type === 'dump' || e.type === 'cbus' ? 1.9 : (e.type === 'bike' || e.cfg.kami ? 0.7 : 1.1));
    explode(p.x, e.cfg.y, p.z, size, e.cfg.air || e.cfg.boss ? veff * 0.6 : rel, e.body);
    if (!e.cfg.air && !e.cfg.boss && e.type !== 'bike') spawnHulk(e, rel);
    if (!e.cfg.civ) {
      var n = e.type === 'boss' ? 12 : (e.type === 'dump' ? 7 : (e.type === 'bike' ? 1 : 3));
      for (var k = 0; k < n; k++) spawnScrap(p.x, e.cfg.y + 0.5, p.z, e.cfg.air || e.cfg.boss ? 0 : rel);
      if (!silent) { kills++; addScore(e.cfg.score); if (mission.goal === 'hunt' && e.type === mission.target) { hunts++; huntT = 2.5; } }
    }
    if (mode === 'demo' && tr.phase === 'play' && size >= 1.1 && slowCd <= 0 && p.z < -6 && p.z > -60) {
      slowT = 1.1; slowCd = 9; impact.x = p.x; impact.z = p.z; cutTo('impact');
    }
    if (e === boss) { boss = null; if (live()) finish(true); }
    releaseEnemy(i);
  }
  function hitEnemy(i, dmg, x, y, z) {
    var e = enemies[i];
    e.hp -= dmg; e.flash = 0.07; sfx('hit');
    for (var k = 0; k < 3; k++) spawnP('glow', x, y, z, rnd(-8, 8), rnd(2, 9), rnd(4, 14), 0.22, 0.9, 0.1, COL.spark, 1);
    if (e.hp <= 0) killEnemy(i);
  }
  var dmgLog = {};
  function hurt(d, kind) {
    if (!live() || player.dead || player.invuln > 0) return;
    var car = CARS[player.car];
    if (kind === 'bullet') { if (car.evade && Math.random() < car.evade) return; d *= car.bulletMul; }
    if (kind === 'ram' || kind === 'debris') d *= car.ramMul * (hasSaw ? sawMul : 1);
    if (kind === 'debris') d *= car.debrisMul;
    if (kind === 'bomb') d *= car.bombMul;
    if (autoT > 0) d *= 0.5;
    if (buff.armor > 0) d *= 0.5;
    if (mode === 'demo') d *= 0.3;
    if (d <= 0) return;
    dmgLog[kind || 'etc'] = Math.round(((dmgLog[kind || 'etc'] || 0) + d) * 10) / 10;
    if ((runKind === 'free' || quizRun() || runKind === 'tut') && mode === 'play') { hitFlash = 0.6; shake = Math.min(1.2, shake + 0.3); sfx('hurt'); return; }   /* free driving: a knock, but no damage */
    if (player.shield > 0) {
      player.shield = 0; player.shieldT = 10;
      spawnP('glow', player.x, 1.4, 0, 0, 0, 0, 0.35, 5, 12, COL.blue, 0.9, 0);
      return;
    }
    player.hp -= d; hitFlash = 1; hitGlowK = 1; shake = Math.min(1.2, shake + 0.35); sfx('hurt');
    if (mode === 'demo') { player.hp = Math.max(1, player.hp); return; }
    if (player.hp <= 0) {
      player.hp = 0; player.dead = true; car.g.visible = false;
      explode(player.x, 1.2, 0, 2.2, veff * 0.5, M.dark);
      finish(false, '차량이 파괴되었다.');
    }
  }

  /* ---------- supply crate: shoot it to cycle the item, drive through it to take the item ---------- */
  var ITEMS = [
    { key: 'power', name: '파워업', color: 0xff5a1f, tip: '화력이 한 단계 오른다', more: '화력이 한 단계 오른다. 두 단계까지 쌓이고, 단계마다 모든 무기의 피해가 25% 늘어난다. 그 판이 끝날 때까지 유지된다.' },
    { key: 'repair', name: '수리 키트', color: 0x2fae55, tip: '내구 40 회복', more: '내구를 40 회복한다. 스타리오 구급차는 80을 회복한다.' },
    { key: 'nitro', name: '니트로', color: 0x2f8fe0, tip: '8초 동안 가속과 연사 증가', more: '8초 동안 가속이 1.7배, 연사가 1.5배가 된다. 속도선이 생기며 빠르게 치고 나간다.' },
    { key: 'shield', name: '방어막', color: 0x35c8e8, tip: '피격 1회 무효', more: '다음 피격 한 번을 막는 방어막을 두른다. 막고 나면 사라진다.' },
    { key: 'magnet', name: '자석', color: 0xa84fe0, tip: '10초 동안 고철을 모두 끌어온다', more: '10초 동안 떨어진 고철을 거리와 상관없이 모두 끌어온다.' },
    { key: 'bomb', name: '폭탄', color: 0x3a3d44, tip: '화면 안 적 전체에 큰 피해', more: '화면 안의 적 전체에 피해 15를 준다. 오토바이와 승용차는 한 번에 부서진다.' },
    { key: 'jammer', name: '드론 재머', color: 0x12a8a0, tip: '드론을 모두 떨어뜨리고 8초 동안 막는다', more: '떠 있는 드론과 자폭 드론을 모두 떨어뜨리고 적 탄환을 지운다. 그 뒤 8초 동안 새 드론이 나타나지 않는다.' },
    { key: 'double', name: '고철 2배', color: 0xd9a400, tip: '15초 동안 줍는 고철이 2배', more: '15초 동안 줍는 고철 하나가 두 개로 계산된다.' },
    { key: 'smoke', name: '연막탄', color: 0x7a808a, tip: '6초 동안 적이 쏘지 못한다', more: '차 주위에 연막을 쳐 6초 동안 무장 승용차, 버기, 보스의 사격과 드론의 폭탄 투하를 멈춘다. 이미 날아오는 탄환과 폭격은 막지 못한다.' },
    { key: 'regen', name: '정비 드론', color: 0x5a9a3a, tip: '10초 동안 내구가 천천히 회복', more: '정비 드론이 따라붙어 10초 동안 초당 내구 4를 회복한다. 모두 40이다.' },
    { key: 'armor', name: '강화 장갑', color: 0x795548, tip: '12초 동안 받는 피해가 절반', more: '차체에 덧댄 장갑으로 12초 동안 탄환, 충돌, 폭격, 잔해의 피해를 모두 절반으로 줄인다. 방어막과 함께 쓸 수 있다.' },
    { key: 'rapid', name: '과충전 탄창', color: 0xe91e63, tip: '6초 동안 연사 2배', more: '6초 동안 모든 무기의 연사가 2배가 된다. 니트로의 연사 증가와 겹쳐 3배까지 오른다.' },
    { key: 'missile', name: '미사일 지원', color: 0xb71c1c, tip: '유도 미사일 6발 발사', more: '가까운 적을 스스로 쫓아가는 유도 미사일 6발을 잇달아 쏜다. 한 발의 피해는 8이고 화력 단계에 따라 늘어난다. 무기를 달지 않은 차도 쏜다.' },
    { key: 'charge', name: '기술 충전', color: 0x3949ab, tip: '고유 기술과 기본 기술을 바로 다시 쓴다', more: '고유 기술과 기본 기술의 남은 쿨타임을 없앤다. 먹자마자 두 기술을 다시 쓸 수 있다.' },
    { key: 'cash', name: '고철 상자', color: 0x9ccc21, tip: '고철 60 획득', more: '고철 60을 바로 얻는다. 고철을 더 받는 차량 특성과 고철 2배 효과가 함께 적용된다.' }
  ];
  var crate = { g: null, box: null, label: null, item: 0, dmg: 0, active: false, phase: 0 };
  function buildCrate() {
    var g = new T.Group();
    crate.box = shadowed(new T.Mesh(new T.BoxGeometry(1.25, 1.25, 1.25), new T.MeshStandardMaterial({ roughness: 0.5, flatShading: true })));
    g.add(crate.box);
    g.add(bx(1.31, 0.16, 1.31, M.white, 0, 0.3, 0)); g.add(bx(1.31, 0.16, 1.31, M.white, 0, -0.3, 0));
    var rot = new T.Mesh(new T.CylinderGeometry(0.9, 0.9, 0.03, 16), M.rotor); rot.position.y = 0.95; g.add(rot);
    g.add(cyl(0.06, 0.06, 0.4, 6, M.dark, 0, 0.8, 0));
    crate.glow = glowSprite(0xffffff, 4.5, 0.55); g.add(crate.glow);
    ITEMS.forEach(function (it) {
      var c = document.createElement('canvas'); c.width = 256; c.height = 72;
      var x = c.getContext('2d');
      x.fillStyle = 'rgba(20,22,26,0.88)'; x.fillRect(0, 0, 256, 72);
      x.fillStyle = '#ffffff'; x.font = '700 40px "Noto Sans KR", system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(it.name, 128, 38);
      it.tex = new T.CanvasTexture(c); it.col = C(it.color);
    });
    crate.label = new T.Sprite(new T.SpriteMaterial({ map: ITEMS[0].tex, depthWrite: false, transparent: true, fog: false }));
    crate.label.scale.set(4.2, 1.18, 1); crate.label.position.y = 2.2; g.add(crate.label);
    g.visible = false; scene.add(g); crate.g = g;
  }
  function setCrateItem(i) {
    crate.item = i; crate.dmg = 0;
    crate.box.material.color.copy(ITEMS[i].col); crate.box.material.emissive.copy(ITEMS[i].col).multiplyScalar(0.25);
    crate.glow.material.color.copy(ITEMS[i].col); crate.label.material.map = ITEMS[i].tex; crate.label.material.needsUpdate = true;
  }
  function spawnCrate() {
    if (!crate.g) buildCrate();
    var open = LANES.filter(function (x) { return laneOpen(x, dist + 125); });
    crate.g.position.set(pick(open.length ? open : LANES), 1.3, -125); crate.g.visible = true; crate.active = true;
    setCrateItem((Math.random() * ITEMS.length) | 0);
  }
  function applyItem(i) {
    var car = CARS[player.car], it = ITEMS[i], k;
    if (!crate.g) buildCrate();   /* the item colours are made together with the crate */
    sfx('item'); if (runKind === 'tut') tut.item = true;
    spawnP('glow', player.x, 1.4, 0, 0, 0, 0, 0.4, 4, 12, it.col, 0.9, 0);
    if (it.key === 'power') power = Math.min(2, power + 1);
    else if (it.key === 'repair') player.hp = Math.min(car.hp, player.hp + 40 * (car.healMul || 1));
    else if (it.key === 'nitro') buff.nitro = 8 * car.itemDur;
    else if (it.key === 'shield') player.shield = 1;
    else if (it.key === 'magnet') buff.magnet = 10 * car.itemDur;
    else if (it.key === 'double') buff.dbl = 15 * car.itemDur;
    else if (it.key === 'regen') buff.regen = 10 * car.itemDur;
    else if (it.key === 'armor') { buff.armor = 12 * car.itemDur; spawnRing(player.x, 0, 7, 0.4, 0, it.col); }
    else if (it.key === 'rapid') overT = Math.max(overT, 6 * car.itemDur);
    else if (it.key === 'missile') { salvoN += 6; salvoT = 0; }
    else if (it.key === 'charge') { player.cd = 0; player.bcd = 0; sfx('skill'); spawnRing(player.x, 0, 9, 0.45, 0, COL.cyan); }
    else if (it.key === 'cash') { var gain = Math.round(60 * car.scrapMul) * (buff.dbl > 0 ? 2 : 1); scrap += gain; sfx('pickup'); }
    else if (it.key === 'smoke') { smokeT = 6 * car.itemDur; for (k = 0; k < 14; k++) spawnP('smoke', player.x + rnd(-3, 3), rnd(0.5, 2.5), rnd(-3, 4), rnd(-2, 2), rnd(0.5, 2), veff * 0.9, rnd(1.2, 2), 2, 6, smokeColor(COL.smokeL), 0.7, 0.3); }
    else if (it.key === 'jammer') {
      jamT = 8; spawnRing(player.x, 0, 46, 0.55, 0, COL.cyan); sfx('zap'); clearEnemyBullets();
      for (k = enemies.length - 1; k >= 0; k--) if (enemies[k].cfg.air) killEnemy(k);
    } else {
      spawnP('glow', player.x, 3, -20, 0, 0, 0, 0.5, 20, 90, COL.white, 0.9, 0); shake = 1.2;
      for (k = enemies.length - 1; k >= 0; k--) if (!enemies[k].cfg.civ && enemies[k].g.position.z < 10) hitEnemy(k, 15, enemies[k].g.position.x, enemies[k].cfg.y, enemies[k].g.position.z);
    }
    capSeen = capSeen || {};
    say(it.name + ': ' + it.tip + '.', 2.6);
  }

