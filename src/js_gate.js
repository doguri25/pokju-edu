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
  /* the 2,350 everyday Hangul syllables (KS X 1001). The display face (Black Han Sans) has these and no other syllable, so a wrong spelling
     such as 「됬어」 or 「됀」 came out with one letter in another face at another height. A label with any other syllable is now set
     whole in the body face, bold (1.5) */
  var KSX = '가각간갇갈갉갊감갑값갓갔강갖갗같갚갛개객갠갤갬갭갯갰갱갸갹갼걀걋걍걔걘걜거걱건걷걸걺검겁것겄겅겆겉겊겋게겐겔겜겝겟겠겡겨격겪견겯결겸겹겻겼경곁계곈곌곕곗고곡곤곧골곪곬곯곰곱곳공곶과곽관괄괆괌괍괏광괘괜괠괩괬괭괴괵괸괼굄굅굇굉교굔굘굡굣구국군굳굴굵굶굻굼굽굿궁궂궈궉권궐궜궝궤궷귀귁귄귈귐귑귓규균귤그극근귿글긁금급긋긍긔기긱긴긷길긺김깁깃깅깆깊까깍깎깐깔깖깜깝깟깠깡깥깨깩깬깰깸깹깻깼깽꺄꺅꺌꺼꺽꺾껀껄껌껍껏껐껑께껙껜껨껫껭껴껸껼꼇꼈꼍꼐꼬꼭꼰꼲꼴꼼꼽꼿꽁꽂꽃꽈꽉꽐꽜꽝꽤꽥꽹꾀꾄꾈꾐꾑꾕꾜꾸꾹꾼꿀꿇꿈꿉꿋꿍꿎꿔꿜꿨꿩꿰꿱꿴꿸뀀뀁뀄뀌뀐뀔뀜뀝뀨끄끅끈끊끌끎끓끔끕끗끙끝끼끽낀낄낌낍낏낑나낙낚난낟날낡낢남납낫났낭낮낯낱낳내낵낸낼냄냅냇냈냉냐냑냔냘냠냥너넉넋넌널넒넓넘넙넛넜넝넣네넥넨넬넴넵넷넸넹녀녁년녈념녑녔녕녘녜녠노녹논놀놂놈놉놋농높놓놔놘놜놨뇌뇐뇔뇜뇝뇟뇨뇩뇬뇰뇹뇻뇽누눅눈눋눌눔눕눗눙눠눴눼뉘뉜뉠뉨뉩뉴뉵뉼늄늅늉느늑는늘늙늚늠늡늣능늦늪늬늰늴니닉닌닐닒님닙닛닝닢다닥닦단닫달닭닮닯닳담답닷닸당닺닻닿대댁댄댈댐댑댓댔댕댜더덕덖던덛덜덞덟덤덥덧덩덫덮데덱덴델뎀뎁뎃뎄뎅뎌뎐뎔뎠뎡뎨뎬도독돈돋돌돎돐돔돕돗동돛돝돠돤돨돼됐되된될됨됩됫됴두둑둔둘둠둡둣둥둬뒀뒈뒝뒤뒨뒬뒵뒷뒹듀듄듈듐듕드득든듣들듦듬듭듯등듸디딕딘딛딜딤딥딧딨딩딪따딱딴딸땀땁땃땄땅땋때땍땐땔땜땝땟땠땡떠떡떤떨떪떫떰떱떳떴떵떻떼떽뗀뗄뗌뗍뗏뗐뗑뗘뗬또똑똔똘똥똬똴뙈뙤뙨뚜뚝뚠뚤뚫뚬뚱뛔뛰뛴뛸뜀뜁뜅뜨뜩뜬뜯뜰뜸뜹뜻띄띈띌띔띕띠띤띨띰띱띳띵라락란랄람랍랏랐랑랒랖랗래랙랜랠램랩랫랬랭랴략랸럇량러럭런럴럼럽럿렀렁렇레렉렌렐렘렙렛렝려력련렬렴렵렷렸령례롄롑롓로록론롤롬롭롯롱롸롼뢍뢨뢰뢴뢸룀룁룃룅료룐룔룝룟룡루룩룬룰룸룹룻룽뤄뤘뤠뤼뤽륀륄륌륏륑류륙륜률륨륩륫륭르륵른를름릅릇릉릊릍릎리릭린릴림립릿링마막만많맏말맑맒맘맙맛망맞맡맣매맥맨맬맴맵맷맸맹맺먀먁먈먕머먹먼멀멂멈멉멋멍멎멓메멕멘멜멤멥멧멨멩며멱면멸몃몄명몇몌모목몫몬몰몲몸몹못몽뫄뫈뫘뫙뫼묀묄묍묏묑묘묜묠묩묫무묵묶문묻물묽묾뭄뭅뭇뭉뭍뭏뭐뭔뭘뭡뭣뭬뮈뮌뮐뮤뮨뮬뮴뮷므믄믈믐믓미믹민믿밀밂밈밉밋밌밍및밑바박밖밗반받발밝밞밟밤밥밧방밭배백밴밸뱀뱁뱃뱄뱅뱉뱌뱍뱐뱝버벅번벋벌벎범법벗벙벚베벡벤벧벨벰벱벳벴벵벼벽변별볍볏볐병볕볘볜보복볶본볼봄봅봇봉봐봔봤봬뵀뵈뵉뵌뵐뵘뵙뵤뵨부북분붇불붉붊붐붑붓붕붙붚붜붤붰붸뷔뷕뷘뷜뷩뷰뷴뷸븀븃븅브븍븐블븜븝븟비빅빈빌빎빔빕빗빙빚빛빠빡빤빨빪빰빱빳빴빵빻빼빽뺀뺄뺌뺍뺏뺐뺑뺘뺙뺨뻐뻑뻔뻗뻘뻠뻣뻤뻥뻬뼁뼈뼉뼘뼙뼛뼜뼝뽀뽁뽄뽈뽐뽑뽕뾔뾰뿅뿌뿍뿐뿔뿜뿟뿡쀼쁑쁘쁜쁠쁨쁩삐삑삔삘삠삡삣삥사삭삯산삳살삵삶삼삽삿샀상샅새색샌샐샘샙샛샜생샤샥샨샬샴샵샷샹섀섄섈섐섕서석섞섟선섣설섦섧섬섭섯섰성섶세섹센셀셈셉셋셌셍셔셕션셜셤셥셧셨셩셰셴셸솅소속솎손솔솖솜솝솟송솥솨솩솬솰솽쇄쇈쇌쇔쇗쇘쇠쇤쇨쇰쇱쇳쇼쇽숀숄숌숍숏숑수숙순숟술숨숩숫숭숯숱숲숴쉈쉐쉑쉔쉘쉠쉥쉬쉭쉰쉴쉼쉽쉿슁슈슉슐슘슛슝스슥슨슬슭슴습슷승시식신싣실싫심십싯싱싶싸싹싻싼쌀쌈쌉쌌쌍쌓쌔쌕쌘쌜쌤쌥쌨쌩썅써썩썬썰썲썸썹썼썽쎄쎈쎌쏀쏘쏙쏜쏟쏠쏢쏨쏩쏭쏴쏵쏸쐈쐐쐤쐬쐰쐴쐼쐽쑈쑤쑥쑨쑬쑴쑵쑹쒀쒔쒜쒸쒼쓩쓰쓱쓴쓸쓺쓿씀씁씌씐씔씜씨씩씬씰씸씹씻씽아악안앉않알앍앎앓암압앗았앙앝앞애액앤앨앰앱앳앴앵야약얀얄얇얌얍얏양얕얗얘얜얠얩어억언얹얻얼얽얾엄업없엇었엉엊엌엎에엑엔엘엠엡엣엥여역엮연열엶엷염엽엾엿였영옅옆옇예옌옐옘옙옛옜오옥온올옭옮옰옳옴옵옷옹옻와왁완왈왐왑왓왔왕왜왝왠왬왯왱외왹왼욀욈욉욋욍요욕욘욜욤욥욧용우욱운울욹욺움웁웃웅워웍원월웜웝웠웡웨웩웬웰웸웹웽위윅윈윌윔윕윗윙유육윤율윰윱윳융윷으윽은을읊음읍읏응읒읓읔읕읖읗의읜읠읨읫이익인일읽읾잃임입잇있잉잊잎자작잔잖잗잘잚잠잡잣잤장잦재잭잰잴잼잽잿쟀쟁쟈쟉쟌쟎쟐쟘쟝쟤쟨쟬저적전절젊점접젓정젖제젝젠젤젬젭젯젱져젼졀졈졉졌졍졔조족존졸졺좀좁좃종좆좇좋좌좍좔좝좟좡좨좼좽죄죈죌죔죕죗죙죠죡죤죵주죽준줄줅줆줌줍줏중줘줬줴쥐쥑쥔쥘쥠쥡쥣쥬쥰쥴쥼즈즉즌즐즘즙즛증지직진짇질짊짐집짓징짖짙짚짜짝짠짢짤짧짬짭짯짰짱째짹짼쨀쨈쨉쨋쨌쨍쨔쨘쨩쩌쩍쩐쩔쩜쩝쩟쩠쩡쩨쩽쪄쪘쪼쪽쫀쫄쫌쫍쫏쫑쫓쫘쫙쫠쫬쫴쬈쬐쬔쬘쬠쬡쭁쭈쭉쭌쭐쭘쭙쭝쭤쭸쭹쮜쮸쯔쯤쯧쯩찌찍찐찔찜찝찡찢찧차착찬찮찰참찹찻찼창찾채책챈챌챔챕챗챘챙챠챤챦챨챰챵처척천철첨첩첫첬청체첵첸첼쳄쳅쳇쳉쳐쳔쳤쳬쳰촁초촉촌촐촘촙촛총촤촨촬촹최쵠쵤쵬쵭쵯쵱쵸춈추축춘출춤춥춧충춰췄췌췐취췬췰췸췹췻췽츄츈츌츔츙츠측츤츨츰츱츳층치칙친칟칠칡침칩칫칭카칵칸칼캄캅캇캉캐캑캔캘캠캡캣캤캥캬캭컁커컥컨컫컬컴컵컷컸컹케켁켄켈켐켑켓켕켜켠켤켬켭켯켰켱켸코콕콘콜콤콥콧콩콰콱콴콸쾀쾅쾌쾡쾨쾰쿄쿠쿡쿤쿨쿰쿱쿳쿵쿼퀀퀄퀑퀘퀭퀴퀵퀸퀼큄큅큇큉큐큔큘큠크큭큰클큼큽킁키킥킨킬킴킵킷킹타탁탄탈탉탐탑탓탔탕태택탠탤탬탭탯탰탱탸턍터턱턴털턺텀텁텃텄텅테텍텐텔템텝텟텡텨텬텼톄톈토톡톤톨톰톱톳통톺톼퇀퇘퇴퇸툇툉툐투툭툰툴툼툽툿퉁퉈퉜퉤튀튁튄튈튐튑튕튜튠튤튬튱트특튼튿틀틂틈틉틋틔틘틜틤틥티틱틴틸팀팁팃팅파팍팎판팔팖팜팝팟팠팡팥패팩팬팰팸팹팻팼팽퍄퍅퍼퍽펀펄펌펍펏펐펑페펙펜펠펨펩펫펭펴편펼폄폅폈평폐폘폡폣포폭폰폴폼폽폿퐁퐈퐝푀푄표푠푤푭푯푸푹푼푿풀풂품풉풋풍풔풩퓌퓐퓔퓜퓟퓨퓬퓰퓸퓻퓽프픈플픔픕픗피픽핀필핌핍핏핑하학한할핥함합핫항해핵핸핼햄햅햇했행햐향허헉헌헐헒험헙헛헝헤헥헨헬헴헵헷헹혀혁현혈혐협혓혔형혜혠혤혭호혹혼홀홅홈홉홋홍홑화확환활홧황홰홱홴횃횅회획횐횔횝횟횡효횬횰횹횻후훅훈훌훑훔훗훙훠훤훨훰훵훼훽휀휄휑휘휙휜휠휨휩휫휭휴휵휸휼흄흇흉흐흑흔흖흗흘흙흠흡흣흥흩희흰흴흼흽힁히힉힌힐힘힙힛힝';
  function displayOK(s) { s = String(s); for (var i = 0; i < s.length; i++) { var c = s.charCodeAt(i); if (c >= 0xAC00 && c <= 0xD7A3 && KSX.indexOf(s.charAt(i)) < 0) return false; } return true; }
  /* one face for all the answers of a question: a wrong spelling in another face would give itself away */
  function qBody(q) { if (q.body === undefined) q.body = !q.opts.every(displayOK); return q.body; }
  /* a 1024×512 sign costs four times the memory and redraw time of 512×256: only where the graphics are set high (a weak device runs
     at 보통 or 낮음, where the sign stays as it was) */
  function signCanvas() { var c = document.createElement('canvas'), hi = gfxNow === 'high'; c.width = hi ? 1024 : 512; c.height = hi ? 512 : 256; return c; }
  function signTex(c) { var tx = new T.CanvasTexture(c); tx.colorSpace = T.SRGBColorSpace; tx.anisotropy = Math.min(16, renderer.capabilities.getMaxAnisotropy() || 1); return tx; }
  function gateTex(c, text, col, dim, body) {
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
    var disp = body === undefined ? displayOK(text) : !body, fs = Math.round(h * (disp ? 0.64 : 0.54)), font = function (z) { return disp ? '400 ' + z + 'px "Black Han Sans", "Noto Sans KR", system-ui, sans-serif' : '900 ' + z + 'px "Noto Sans KR", system-ui, sans-serif'; };
    x.font = font(fs); var tw = x.measureText(String(text)).width;
    if (tw > w - h * 0.24) { fs = Math.floor(fs * (w - h * 0.24) / tw); x.font = font(fs); }   /* a word like 가르치셨다 shrinks to fit the sign */
    /* centred on its own ink (1.5): the body face sat 15 px lower than the display face on the same sign */
    x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    var mt = x.measureText(String(text)), ia = mt.actualBoundingBoxAscent, id = mt.actualBoundingBoxDescent, ty = ia + id > 0 ? h * 0.49 + (ia - id) / 2 : h * 0.55;
    if (!(ia + id > 0)) x.textBaseline = 'middle';
    /* a dark rim round the letters, then the letters: white on the bright top of the sign read soft before */
    x.lineJoin = 'round'; x.lineWidth = h * 0.05; x.strokeStyle = 'rgba(0,0,0,0.5)';
    x.shadowColor = 'rgba(0,0,0,0.45)'; x.shadowBlur = h * 0.06; x.shadowOffsetY = h * 0.025;
    x.strokeText(String(text), w / 2, ty);
    x.shadowColor = 'transparent'; x.shadowBlur = 0; x.shadowOffsetY = 0;
    x.fillStyle = '#ffffff'; x.fillText(String(text), w / 2, ty);
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
      /* the answer sign (1.5: sharper, same size): twice the pixels at the high setting, and the finest filtering the chip has */
      var c = signCanvas();
      var tx = signTex(c);
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
  /* the web fonts come in many small parts, fetched only for text drawn on the page: letters drawn on a canvas (the gate signs, the
     balloons) used a fallback face until some page text happened to need them. Every answer and wrong option is fetched up front, and
     the signs on the road are redrawn once the letters are in (1.5) */
  var spellFontsAsked = false;
  function spellFonts() {
    if (spellFontsAsked || !(document.fonts && document.fonts.load)) return; spellFontsAsked = true;
    var disp = {}, body = {}, k;
    SPELL_DATA.sets.forEach(function (st) { st.items.forEach(function (it) { var all = [it.a].concat(it.w), to = all.every(displayOK) ? disp : body; all.forEach(function (t) { for (var i = 0; i < t.length; i++) to[t.charAt(i)] = 1; }); }); });
    var dt = '', bt = ''; for (k in disp) dt += k; for (k in body) bt += k;
    Promise.all([document.fonts.load('400 64px "Black Han Sans"', dt), bt ? document.fonts.load('900 64px "Noto Sans KR"', bt) : null]).then(function () {
      var q = quiz.q; if (!q || quiz.phase !== 'ask') return;
      if (quiz.g) quiz.g.banners.forEach(function (b, i) { gateTex(b.c, q.opts[i], QG_COL[i], false, qBody(q)); b.tx.needsUpdate = true; });
      if (quiz.b) quiz.b.items.forEach(function (it, i) { if (!it.popped) { gateTex(it.c, q.opts[i], QG_COL[i], false, qBody(q)); it.tx.needsUpdate = true; } });
    }, function () {});
  }
  spellFonts();
  function gatesShow(q) {
    var s = gateSet(q.n);
    s.banners.forEach(function (b, i) { gateTex(b.c, q.opts[i], QG_COL[i], false, qBody(q)); b.tx.needsUpdate = true; b.m.material.opacity = 1; b.arrows.opacity = 0.85; });
    s.g.visible = true; quiz.g = s;
  }
  function gatesDim(q, picked) {
    quiz.g.banners.forEach(function (b, i) { if (i !== q.slot) { gateTex(b.c, q.opts[i], QG_COL[i], true, qBody(q)); b.tx.needsUpdate = true; } });
  }
  function quizOff() {
    var k;
    for (k in gateSets) gateSets[k].g.visible = false;
    for (k in balloonSets) balloonSets[k].g.visible = false;
    quiz.phase = 'off'; quiz.g = null; quiz.b = null; quiz.q = null; $('qbox').hidden = true;
  }
  /* text in the display face that holds a sign the face does not have (□ ＿ · ★): such a sign came out thin, in a fallback weight
     (1.5). It is now set in the body face at its heaviest */
  function dispSet(el, text) {
    text = String(text);
    if (!/[□＿·★☆…「」]/.test(text)) { el.textContent = text; return; }
    el.innerHTML = esc(text).replace(/[□＿·★☆…「」]+/g, '<span class="sym">$&</span>');
  }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function danLabel(dans) {
    if (dans.length === 8) return '2단~9단';
    return dans.map(function (d) { return d + '단'; }).join('·');
  }
  var SPELL_SETS = {}; SPELL_DATA.sets.forEach(function (st) { SPELL_SETS[st.key] = st; });
  var SPELL_ORDER = SPELL_DATA.sets.map(function (st) { return st.key; });
  /* 1.5: how many sentences were made with Upstage Solar (each set counts its own, data/spell.json "ai"); the title and the set details say so */
  var SPELL_AI = SPELL_DATA.sets.reduce(function (n, st) { return n + (st.ai || 0); }, 0), SPELL_ALL = SPELL_DATA.sets.reduce(function (n, st) { return n + st.items.length; }, 0);
  (function () { var el = $('title-credit-text'); if (el && SPELL_AI) el.textContent = '맞춤법 문장 ' + SPELL_ALL + '개 가운데 ' + SPELL_AI + '개는 업스테이지 Solar AI로 만들고 검증했어요'; })();
  function spellSel() { var s = save.quiz.sel, k = s.spell || 'dwae'; return { subject: 'spell', sets: k === 'all' ? SPELL_ORDER.slice() : [own(SPELL_SETS, k) ? k : 'dwae'], type: 'spell', pace: s.pace, foe: s.foe !== 'off', style: s.style === 'shoot' ? 'shoot' : 'gate' }; }
  /* how many answers stand on the road for these sets: 2, or 2~3 (1.5: it said 2~4, which no set has) */
  function spellChoices(sets) {
    var lo = 9, hi = 0;
    sets.forEach(function (k) { (SPELL_SETS[k] ? SPELL_SETS[k].items : []).forEach(function (it) { var n = 1 + it.w.length; if (n < lo) lo = n; if (n > hi) hi = n; }); });
    return hi ? (lo === hi ? hi + '개' : lo + '~' + hi + '개') : '2개';
  }
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
  /* a phone on its side: the long card (640 px) lay over both HUD chips at the top corners, their names, clock and buttons showing through
     it (1.5). It now fits between them, or, where the gap is too narrow, goes just below them */
  function qboxFit() {
    var el = $('qbox'), st = el.style, hud = $('hud'), vw = window.innerWidth, vh = window.innerHeight;
    st.left = st.right = st.width = st.transform = st.top = '';
    if (el.hidden || hud.hidden) return;
    var ro = hud.querySelector('.obj').getBoundingClientRect(), rs = hud.querySelector('.status').getBoundingClientRect(), r = el.getBoundingClientRect();
    if (!ro.width || !rs.width || r.top >= Math.max(ro.bottom, rs.bottom) || (r.left >= ro.right && r.right <= rs.left)) return;
    /* a phone on its side has no height to spare: between the chips if they leave room; a taller screen (a tablet, 1024×768) puts it under them */
    if (vh <= 520 && vw > vh && rs.left - ro.right >= 280) { st.left = (ro.right + 8) + 'px'; st.right = (vw - rs.left + 8) + 'px'; st.width = 'auto'; st.transform = 'none'; }
    else st.top = (Math.max(ro.bottom, rs.bottom) + 4) + 'px';
  }
  window.addEventListener('resize', function () { if (!$('qbox').hidden) qboxFit(); });
  function qboxSet(kick, text, cls, q, why) {
    $('q-kick').textContent = kick; dispSet($('q-text'), text); $('qbox').className = 'qbox' + (cls ? ' ' + cls : '') + (text.length > 12 ? ' long' : '');
    $('q-why').textContent = why || ''; $('q-why').hidden = !why;
    var h = '';
    if (q) q.opts.forEach(function (v, i) { h += '<span style="background:' + QG_COL[i] + '">' + v + '</span>'; });
    $('q-opts').innerHTML = h; $('q-opts').hidden = !q;
    $('qbox').hidden = false;
    qboxFit();
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
      var c = signCanvas();
      var tx = signTex(c);
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
    s.items.forEach(function (it, i) { gateTex(it.c, q.opts[i], QG_COL[i], false, qBody(q)); it.tx.needsUpdate = true; it.hp = 0; it.popped = false; it.g.visible = true; });
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
    /* first: a question of the main part (it counts for the score); a fact's second ask in the main part and the misses asked again at the
       end are not kept as first answers. Only main-part answers build the run of right answers (1.5: the retries at the end did too,
       so a run with no first answer right showed 「가장 긴 연속 정답 9개」 and scored nearly as much as a perfect one) */
    var dk = quiz.deck, q = quiz.q, first = dk.i <= dk.main, ok = quizAnswer(dk, q, picked);
    postFlash(ok);
    if (first && !q.again) { factRecord(save.quiz.facts, q.key, ok); factLog.push([q.key, ok]); }
    if (!first) quiz.combo = 0;
    if (quiz.g) { gatesDim(q, picked); quiz.g.banners.forEach(function (b) { b.arrows.opacity = 0; }); gatePulse = 1; }
    if (quiz.b) quiz.b.items.forEach(function (it, i) { if (i !== q.slot) { gateTex(it.c, q.opts[i], QG_COL[i], true, qBody(q)); it.tx.needsUpdate = true; } if (i === picked) { it.popped = true; it.g.visible = false; spawnRing(it.x, quiz.b.g.position.z, 5, 0.35, veff, i === q.slot ? COL.cyan : COL.orange); } });
    if (ok) {
      if (first) { quiz.ok++; quiz.combo++; quiz.best = Math.max(quiz.best, quiz.combo); score += 100 + 20 * Math.min(quiz.combo - 1, 5); scrap += 20; }
      else { score += 50; scrap += 10; }   /* fixed at the end: half */
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
    $('res-title').textContent = !win ? '차가 멈췄어요' : all ? '모두 맞혔어요!' : (sc.right >= sc.total * 0.7 ? '잘했어요' : '끝까지 달렸어요');
    $('res-story').textContent = !win ? failWhy + ' ' + quiz.deck.main + '문제 가운데 ' + sc.total + '문제까지 풀고 ' + sc.right + '문제를 맞혔다.'
      : sc.total + '문제 가운데 ' + sc.right + '문제를 맞혔다.' + (sc.missed.length ? ' 틀린 문제는 끝에서 ' + sc.fixed + '개를 다시 맞혔다.' : '');
    resRows([['문제', mission.name + (spell ? '' : ' · ' + QUIZ_TYPES[dk.type].name)], ['맞힌 문제', sc.right + ' / ' + sc.total], ['가장 긴 연속 정답', quiz.best + '개'],
      ['다시 볼 문제', !sc.missed.length ? '없음' : (spell ? '<span class="lines">' : '') + sc.missed.filter(function (k, i) { return sc.missed.indexOf(k) === i; }).map(function (k) { return esc(fullOf[k]); }).join(spell ? '<br>' : ', ') + (spell ? '</span>' : '')], ['점수', N(score)]]);   /* sentences one under another, from the left (1.5) */
    $('res-reward').textContent = (win ? '고철 ' + got : '모은 고철의 절반 ' + got) + ' · 보유 ' + N(save.scrap);
    if (runKind === 'story') return storyAfter(sc, win);
    return !win ? 'fail' : all ? 'record' : (sc.right >= sc.total * 0.7 ? 'win' : 'fail');
  }
  /* the 9×9 record. dans: the rows to show; now: the facts of the run just played, outlined */
  var LV_MARK = { good: '★', learn: '●', hard: '▲', 'new': '' };
  /* ×0 gets a column once a 0의 곱 fact of these 단 has been asked (1.5: those answers were kept but shown nowhere) */
  function factGrid(dans, now) {
    var z = dans.some(function (a) { return save.quiz.facts[a + 'x0'] || (now && now[a + 'x0']); }) ? 0 : 1;
    var h = '<table class="fgrid"><tr><th></th>', a, b;
    for (b = z; b <= 9; b++) h += '<th>×' + b + '</th>';
    h += '</tr>';
    dans.forEach(function (a) {
      h += '<tr><th>' + a + '단</th>';
      for (b = z; b <= 9; b++) {
        var k = a + 'x' + b, lv = factLevel(save.quiz.facts[k]);
        h += '<td class="lv-' + lv + (now && now[k] ? ' now' : '') + '" title="' + a + '×' + b + '=' + a * b + ' · ' + FACT_LEVEL[lv] + '">' + a * b + '<i>' + LV_MARK[lv] + '</i></td>';
      }
      h += '</tr>';
    });
    return h + '</table><div class="flegend"><span>★ 잘함 (세 번 연속 맞힘)</span><span>● 연습 중</span><span>▲ 어려움 (최근 첫 답이 틀림)</span><span>빈칸 처음</span></div>';
  }
  function levelCount(dans, zero) {
    var c = { good: 0, learn: 0, hard: 0, 'new': 0, n: 0 };
    dans.forEach(function (a) { for (var b = zero ? 0 : 1; b <= 9; b++) { c[factLevel(save.quiz.facts[a + 'x' + b])]++; c.n++; } });
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
    /* 1단 and ×0 (이야기 9장) join the record once they have been asked */
    var keys = Object.keys(save.quiz.facts), all = keys.some(function (k) { return /^1x/.test(k); }) ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : [2, 3, 4, 5, 6, 7, 8, 9],
      zero = keys.some(function (k) { return /x0$/.test(k); }), c = levelCount(all, zero), runs = save.quiz.runs || [], h = '';
    $('rec-sum').textContent = c.n + '문제 가운데 잘함 ' + c.good + ' · 연습 중 ' + c.learn + ' · 어려움 ' + c.hard + ' · 처음 ' + c['new'];
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
    var balloon = o.style === 'shoot';   /* gates or balloons, as chosen */
    $('quiz-premise').textContent = spell ? '새벽: “마성의 글자 칩도 말썽이야. 빈칸에 들어갈 바른 말이 ' + (balloon ? '적힌 풍선을 맞혀 줘.”' : '적힌 문으로 지나가 줘.”') : '새벽: “마성이 계산을 까먹었어. 길마다 숫자 갈림길이 생겼는데, 맞는 답이 ' + (balloon ? '적힌 풍선을 맞히면' : '적힌 문으로 지나가면') + ' 다시 기억해.”';
    $('opt-foe').value = s.foe === 'off' ? 'off' : 'on'; $('opt-style').value = o.style;
    if (spell) {
      var st = o.sets.length === 1 ? SPELL_SETS[o.sets[0]] : null;
      var aiN = st ? (st.ai || 0) : SPELL_AI, allN = st ? st.items.length : SPELL_ALL;
      $('quiz-brief').innerHTML = row('문제 수', '10문제') + row('요령', st ? st.tip : '모든 묶음에서 섞어 나온다. 덜 익힌 문장이 더 자주 나온다.') +
        row('문장', allN + '개' + (aiN ? ' · ' + (aiN === allN ? '모두' : aiN + '개는') + ' 업스테이지 Solar AI로 만들고 검증' : '')) +
        row('보기', (o.style === 'shoot' ? '풍선 ' : '깃발 문 ') + spellChoices(o.sets)) + row('생각할 시간', '약 ' + (p.t + t.think) + '초 (문장을 읽는 시간 2초 더함)') + row('틀리면', '정답 문장과 까닭을 보여 준다. 그 문제는 끝에 한 번 더 나온다.');
      return;
    }
    $('quiz-brief').innerHTML = row('문제 수', o.type === 'seq' ? o.dans.length * 9 + '문제 (단마다 1부터 9까지)' : '10문제') + row('보기', (o.style === 'shoot' ? '숫자 풍선 ' : '깃발 문 ') + t.opts + '개') + row('푸는 법', o.style === 'shoot' ? '정답 풍선을 쏘아 맞힌다. 못 쏘면 차가 들이받는 풍선이 답이 된다' : '정답이 적힌 문으로 지나간다') +
      row('생각할 시간', (o.style === 'shoot' ? '풍선이 앞에 멈춰 기다리는 시간 약 ' : '문제가 나오고 문에 닿기까지 약 ') + (p.t + t.think) + '초') + row('틀리면', '차가 잠깐 느려지고 정답을 보여 준다. 그 문제는 끝에 한 번 더 나온다.');
  }
