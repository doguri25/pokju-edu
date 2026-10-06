  /* ---------- 구구단 출제기: no 3D in here, so it can be tested on its own (tests/quiz.test.js).
     A deck is one run: the facts to ask in order, each with its options and where the right one sits.
     Wrong options are the answers children actually give (a neighbouring product, the same last digit, a + b), never random numbers ---------- */
  var QUIZ_TYPES = {
    seq: { name: '순서대로', opts: 2, think: 0 },
    mix: { name: '섞어서', opts: 2, think: 0 },
    blank: { name: '빈칸 찾기', opts: 3, think: 0.5 },
    rev: { name: '거꾸로', opts: 4, think: 1 }
  };
  var QUIZ_PACE = { slow: { name: '천천히', t: 6 }, mid: { name: '보통', t: 4 }, fast: { name: '빠르게', t: 2.5 } };
  function qPick(arr, rf) { return arr[(rf() * arr.length) | 0]; }
  function qShuffle(arr, rf) {
    for (var i = arr.length - 1; i > 0; i--) { var j = (rf() * (i + 1)) | 0, t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
    return arr;
  }
  /* wrong options for a value, best first: the nearer a mistake is to what a child would say, the earlier it comes */
  function qWrongsMul(a, b) {
    var ans = a * b, near = [a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b], far = [ans + 10, ans - 10, a + b, ans + 1, ans - 1, ans + 2, ans - 2];
    if (b === 1) near = [a + 1, 1, a * 2];            /* 6 × 1: adding one, or answering 1 */
    if (b === 0 || a === 0) near = [a + b, 1, 10];    /* 6 × 0: answering 6 */
    return { near: near, far: far };
  }
  /* blank and reverse questions ask for the missing factor: the wrong ones are the factors next to it, and the number that was shown */
  function qWrongsFactor(shown, missing) {
    return { near: [missing + 1, missing - 1], far: [missing + 2, missing - 2, shown, missing + 3, missing - 3] };
  }
  function qOptions(ans, w, n, rf) {
    var out = [ans], pool = qShuffle(w.near.slice(), rf).concat(qShuffle(w.far.slice(), rf)), i;
    for (i = 0; i < pool.length && out.length < n; i++) {
      var v = pool[i];
      if (v >= 0 && v === Math.round(v) && out.indexOf(v) < 0) out.push(v);
    }
    return out;   /* the right answer is first; the deck decides where it goes */
  }
  /* a fact is [a, b]: a is the 단 */
  function qQuestion(a, b, type, rf) {
    var t = QUIZ_TYPES[type] || QUIZ_TYPES.mix, q = { a: a, b: b, key: a + 'x' + b, type: type, n: t.opts };
    if (type === 'blank') { q.text = a + ' × □ = ' + a * b; q.ans = b; q.full = a + ' × ' + b + ' = ' + a * b; q.opts = qOptions(b, qWrongsFactor(a, b), t.opts, rf); }
    else if (type === 'rev') { q.text = a * b + ' = ' + a + ' × □'; q.ans = b; q.full = a * b + ' = ' + a + ' × ' + b; q.opts = qOptions(b, qWrongsFactor(a, b), t.opts, rf); }
    else { q.text = a + ' × ' + b + ' = ?'; q.ans = a * b; q.full = a + ' × ' + b + ' = ' + a * b; q.opts = qOptions(a * b, qWrongsMul(a, b), t.opts, rf); }
    return q;
  }
  /* where the right answer sits, over the whole deck: with two gates it is left exactly half the time and never more than twice running on the same side */
  function qSlots(count, n, rf) {
    var s = [], i, run, tries;
    for (tries = 0; tries < 40; tries++) {
      s.length = 0;
      for (i = 0; i < count; i++) s.push(i % n);
      qShuffle(s, rf);
      for (run = 1, i = 1; i < s.length; i++) { if (s[i] === s[i - 1]) { if (++run > 2) break; } else run = 1; }
      if (i >= s.length) break;
    }
    return s;
  }
  function qPlace(q, slot) {
    var rest = q.opts.slice(1);
    rest.splice(slot, 0, q.ans);
    q.opts = rest; q.slot = slot;
    return q;
  }
  /* how well a fact is known, from what is kept for it: [first answers right, first answers wrong, right in a row since the last miss].
     'new' never asked, 'good' three right in a row, 'hard' missed and not yet answered right since, 'learn' anything between */
  var FACT_LEVEL = { good: '잘함', learn: '연습 중', hard: '어려움', 'new': '처음' };
  function factLevel(f) {
    if (!f || !(f[0] + f[1])) return 'new';
    var run = f.length > 2 ? f[2] : (f[0] > f[1] ? 1 : 0);   /* a record from before the run count was kept */
    if (run >= 3) return 'good';
    if (f[1] > 0 && run === 0) return 'hard';
    return 'learn';
  }
  function factRecord(stats, key, ok) {
    var f = stats[key] || (stats[key] = [0, 0, 0]);
    if (ok) { f[0]++; f[2] = (f[2] || 0) + 1; } else { f[1]++; f[2] = 0; }
    return f;
  }
  /* which facts a mixed run asks: weak ones (hard or still learning) about 40%, new ones 40%, known ones 20%. A share with nothing in it goes to the others */
  var QUIZ_MIX = [['weak', 0.4], ['new', 0.4], ['good', 0.2]];
  function qDraw(all, n, stats, rf) {
    var bins = { weak: [], 'new': [], good: [] }, facts = [], i;
    all.forEach(function (f) { var l = factLevel(stats && stats[f[0] + 'x' + f[1]]); bins[l === 'hard' || l === 'learn' ? 'weak' : l].push(f); });
    var src = {}; for (var k in bins) src[k] = [];
    function from(bin) {   /* each share is a shuffled bag, so a fact comes back only after the rest of its share */
      if (!src[bin].length) src[bin] = qShuffle(bins[bin].slice(), rf);
      return src[bin].pop();
    }
    while (facts.length < n) {
      var live = QUIZ_MIX.filter(function (b) { return bins[b[0]].length; }), sum = 0, r;
      live.forEach(function (b) { sum += b[1]; });
      r = rf() * sum;
      for (i = 0; i < live.length - 1 && r >= live[i][1]; i++) r -= live[i][1];
      var f = from(live[i][0]);
      if (facts.length && f === facts[facts.length - 1] && all.length > 1) continue;   /* a bin with one fact in it: draw again */
      facts.push(f);
    }
    return facts;
  }
  /* o = { dans: [7], type: 'mix', n: 10, stats: save.quiz.facts }. 순서대로 asks every fact of every chosen 단 once, in order; the others draw n facts without repeats */
  function quizDeck(o, rf) {
    rf = rf || Math.random;
    var type = QUIZ_TYPES[o.type] ? o.type : 'mix', dans = o.dans && o.dans.length ? o.dans.slice() : [2], facts = [], all = [], i, j;
    for (i = 0; i < dans.length; i++) for (j = 1; j <= 9; j++) all.push([dans[i], j]);
    if (type === 'seq') facts = all;
    else {
      facts = qDraw(all, o.n || 10, o.stats || null, rf);
    }
    var qs = facts.map(function (f) { return qQuestion(f[0], f[1], type, rf); }), slots = qSlots(qs.length, QUIZ_TYPES[type].opts, rf);
    qs.forEach(function (q, k) { qPlace(q, slots[k]); });
    return { type: type, dans: dans, items: qs, main: qs.length, i: 0, retried: {}, log: [] };
  }
  /* the next question, or null when the deck is done */
  function quizNext(deck) { return deck.i < deck.items.length ? deck.items[deck.i++] : null; }
  /* record an answer. A fact missed in the main part comes back once at the end, with its options shuffled again */
  function quizAnswer(deck, q, picked, rf) {
    rf = rf || Math.random;
    var ok = picked === q.slot, retry = deck.i > deck.main;
    deck.log.push({ key: q.key, ok: ok, retry: retry, picked: picked < 0 ? null : q.opts[picked] });
    if (!ok && !retry && !deck.retried[q.key]) {
      deck.retried[q.key] = true;
      var again = qQuestion(q.a, q.b, q.type, rf);
      deck.items.push(qPlace(again, (rf() * again.n) | 0));
    }
    return ok;
  }
  function quizScore(deck) {
    var first = deck.log.filter(function (r) { return !r.retry; }), right = first.filter(function (r) { return r.ok; }).length;
    return { right: right, total: first.length, missed: first.filter(function (r) { return !r.ok; }).map(function (r) { return r.key; }), fixed: deck.log.filter(function (r) { return r.retry && r.ok; }).length };
  }
