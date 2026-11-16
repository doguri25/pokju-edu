  /* ---------- 수업 링크: a teacher picks a mode and its settings, and shares one address. Opening it skips the prologue and lands on that mode,
     already set; nothing is sent anywhere, the settings ride in the address itself (?m=quiz&dan=7&type=mix…). A story link opens its chapter even if it is still locked ---------- */
  var classLink = null, linkCh = -1, linkKeep = null;   /* linkKeep: the student's own choices, which are what gets saved while a link is open */
  /* a name is a real entry of a table only if the table holds it itself: 'constructor' or 'toString' must not pass for a setting */
  function own(o, k) { return typeof k === 'string' && Object.prototype.hasOwnProperty.call(o, k); }
  function linkParams() {
    var out = {}, src = (location.search || '').slice(1) + '&' + (location.hash || '').replace(/^#/, '');
    src.split('&').forEach(function (kv) { var p = kv.split('='); if (p[0]) { try { out[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ''); } catch (e) {} } });
    return out;
  }
  /* read the address once, after the save is loaded */
  function applyLink() {
    var p = linkParams(), s = save.quiz.sel, m = p.m;
    if (!m || KIND_ORDER.indexOf(m) < 0) return;
    linkKeep = JSON.parse(JSON.stringify(s));
    if (p.dan && DAN_OPTS.some(function (o) { return o[0] === p.dan; })) s.dan = p.dan;
    if (own(QUIZ_TYPES, p.type) && !QUIZ_TYPES[p.type].own) s.type = p.type;
    if (own(QUIZ_PACE, p.pace)) s.pace = p.pace;
    if (p.foe === 'on' || p.foe === 'off') s.foe = p.foe;
    if (p.style === 'gate' || p.style === 'shoot') s.style = p.style;
    if (p.set === 'all' || own(SPELL_SETS, p.set)) s.spell = p.set;
    if (m === 'story') { var ch = (parseInt(p.ch, 10) || 1) - 1; if (ch >= 0 && ch < CHAPTERS.length) { selChapter = ch; linkCh = ch; } }
    /* the road too (1.5): background, time of day and weather, for the modes that let you choose them */
    if (REGION_ORDER.indexOf(p.region) >= 0) cond.region = p.region;
    if (own(TIME_LABEL, p.time)) cond.time = p.time;
    if (WEATHER_ORDER.indexOf(p.weather) >= 0) cond.weather = p.weather;
    selKind = m; classLink = { label: linkLabel(m) };
  }
  function linkLabel(m) {
    if (m === 'story') return '이야기 ' + (selChapter + 1) + '장 ' + CHAPTERS[selChapter].name;
    if (m === 'quiz' || m === 'spell') { var q = quizMission(m); return q.name + (m === 'quiz' ? ' · ' + QUIZ_TYPES[save.quiz.sel.type].name : '') + (save.quiz.sel.foe === 'off' ? ' · 적 없음' : ''); }
    return KINDS[m].name;
  }
  /* the address for what is chosen now */
  function linkMake() {
    var s = save.quiz.sel, q = ['m=' + selKind];
    if (selKind === 'story') q.push('ch=' + (selChapter + 1));
    if (selKind === 'quiz') q.push('dan=' + encodeURIComponent(s.dan), 'type=' + s.type);
    if (selKind === 'spell') q.push('set=' + s.spell);
    if (selKind === 'quiz' || selKind === 'spell') q.push('style=' + s.style, 'foe=' + s.foe);
    if (selKind !== 'free') q.push('pace=' + s.pace);
    if (selKind === 'quiz' || selKind === 'spell' || selKind === 'free' || selKind === 'surv') q.push('region=' + cond.region, 'time=' + cond.time, 'weather=' + cond.weather);
    return location.href.split(/[?#]/)[0] + '?' + q.join('&');
  }
  function linkShow() {
    var url = linkMake(), out = $('link-out'), done = function (ok) { $('link-note').textContent = ok ? '복사했습니다. 학생들에게 이 주소를 나눠 주세요.' : '주소를 길게 눌러 복사해 학생들에게 나눠 주세요.'; };
    out.value = url; $('link-box').hidden = false; out.focus(); out.select();
    try { navigator.clipboard.writeText(url).then(function () { done(true); }, function () { done(false); }); } catch (e) { done(false); }
  }
