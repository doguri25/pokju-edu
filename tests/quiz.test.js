/* 출제기 시험: node tests/quiz.test.js
   src/js_quiz.js 는 게임의 큰 함수 안에 들어가는 조각이라, 여기서는 함수 하나로 감싸 불러온다. */
'use strict';
var fs = require('fs'), path = require('path'), assert = require('assert');
var src = fs.readFileSync(path.join(__dirname, '..', 'src', 'js_quiz.js'), 'utf8');
var SPELL = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'spell.json'), 'utf8')), BANK = {};
SPELL.sets.forEach(function (st) { BANK[st.key] = st; });
var Q = new Function(src + '\nreturn { quizDeck: quizDeck, quizNext: quizNext, quizAnswer: quizAnswer, quizScore: quizScore, qQuestion: qQuestion, QUIZ_TYPES: QUIZ_TYPES, factLevel: factLevel, factRecord: factRecord };')();
function seeded(s) { return function () { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x80000000; }; }
var fails = 0, runs = 0;
function test(name, fn) { runs++; try { fn(); } catch (e) { fails++; console.log('실패: ' + name + '\n  ' + e.message); } }

test('81개 곱셈 모든 유형: 보기 개수, 중복 없음, 정답 한 개, 음수 없음', function () {
  var rf = seeded(7);
  ['seq', 'mix', 'blank', 'rev'].forEach(function (type) {
    for (var a = 1; a <= 9; a++) for (var b = 1; b <= 9; b++) for (var k = 0; k < 5; k++) {
      var q = Q.qQuestion(a, b, type, rf);
      assert.strictEqual(q.opts.length, Q.QUIZ_TYPES[type].opts, type + ' ' + a + 'x' + b + ' 보기 개수');
      assert.strictEqual(new Set(q.opts).size, q.opts.length, type + ' ' + a + 'x' + b + ' 중복 ' + q.opts);
      assert.strictEqual(q.opts.filter(function (v) { return v === q.ans; }).length, 1, type + ' ' + a + 'x' + b + ' 정답 한 개');
      q.opts.forEach(function (v) { assert.ok(v >= 0 && Number.isInteger(v), '음수나 소수 ' + v); });
    }
  });
});
test('곱셈 정답이 맞다', function () {
  var q = Q.qQuestion(7, 8, 'mix', seeded(1)); assert.strictEqual(q.ans, 56); assert.strictEqual(q.text, '7 × 8 = ?');
  q = Q.qQuestion(6, 7, 'blank', seeded(1)); assert.strictEqual(q.ans, 7); assert.strictEqual(q.text, '6 × □ = 42');
  q = Q.qQuestion(7, 8, 'rev', seeded(1)); assert.strictEqual(q.ans, 8); assert.strictEqual(q.text, '56 = 7 × □');
});
test('헷갈리는 보기는 이웃 곱에서 먼저 나온다 (7×8)', function () {
  var near = [63, 49, 64, 48], hit = 0;
  for (var s = 1; s <= 200; s++) { var q = Q.qQuestion(7, 8, 'mix', seeded(s)); if (near.indexOf(q.opts[1]) >= 0) hit++; }
  assert.strictEqual(hit, 200);
});
test('보기 2개일 때 정답 위치가 왼쪽·오른쪽 반반이고 같은 쪽이 세 번 이어지지 않는다', function () {
  var left = 0, all = 0;
  for (var s = 1; s <= 300; s++) {
    var d = Q.quizDeck({ dans: [2 + (s % 8)], type: 'mix', n: 10 }, seeded(s)), run = 1;
    d.items.forEach(function (q, i) {
      assert.strictEqual(q.opts[q.slot], q.ans);
      if (q.slot === 0) left++; all++;
      if (i) { run = q.slot === d.items[i - 1].slot ? run + 1 : 1; assert.ok(run <= 2, '같은 쪽 ' + run + '번'); }
    });
  }
  var r = left / all; assert.ok(r >= 0.45 && r <= 0.55, '왼쪽 비율 ' + r.toFixed(3));
});
test('순서대로는 단마다 1부터 9까지', function () {
  var d = Q.quizDeck({ dans: [3, 6], type: 'seq' }, seeded(3));
  assert.deepStrictEqual(d.items.map(function (q) { return q.key; }), [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (b) { return '3x' + b; }).concat([1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (b) { return '6x' + b; })));
});
test('섞어서는 n개, 같은 문제가 바로 이어 나오지 않는다', function () {
  for (var s = 1; s <= 100; s++) {
    var d = Q.quizDeck({ dans: [5], type: 'mix', n: 10 }, seeded(s));
    assert.strictEqual(d.items.length, 10);
    assert.strictEqual(new Set(d.items.map(function (q) { return q.key; })).size, 9, '한 단 9문제를 모두 내고 한 문제만 겹친다');
    d.items.forEach(function (q, i) { if (i) assert.notStrictEqual(q.key, d.items[i - 1].key); });
  }
});
test('틀린 문제는 끝에 한 번만 다시 나오고, 점수는 첫 답만 센다', function () {
  var rf = seeded(11), d = Q.quizDeck({ dans: [7], type: 'mix', n: 5 }, rf), q, picks = 0;
  while ((q = Q.quizNext(d))) { var wrong = (q.slot + 1) % q.n; Q.quizAnswer(d, q, picks++ < 5 && picks % 2 ? wrong : q.slot, rf); }
  var sc = Q.quizScore(d);
  assert.strictEqual(sc.total, 5); assert.strictEqual(sc.right, 2); assert.strictEqual(sc.missed.length, 3);
  assert.strictEqual(d.items.length, 8); assert.strictEqual(sc.fixed, 3);
  d = Q.quizDeck({ dans: [7], type: 'mix', n: 3 }, rf);
  while ((q = Q.quizNext(d))) Q.quizAnswer(d, q, (q.slot + 1) % q.n, rf);
  assert.strictEqual(d.items.length, 6, '다시 나온 문제를 또 틀려도 한 번 더 나오지 않는다');
});

test('숙달 단계: 처음, 연습 중, 어려움, 잘함', function () {
  var st = {};
  assert.strictEqual(Q.factLevel(st['7x8']), 'new');
  Q.factRecord(st, '7x8', true); assert.strictEqual(Q.factLevel(st['7x8']), 'learn');
  Q.factRecord(st, '7x8', false); assert.strictEqual(Q.factLevel(st['7x8']), 'hard');
  Q.factRecord(st, '7x8', true); Q.factRecord(st, '7x8', true); assert.strictEqual(Q.factLevel(st['7x8']), 'learn');
  Q.factRecord(st, '7x8', true); assert.strictEqual(Q.factLevel(st['7x8']), 'good');
  assert.strictEqual(Q.factLevel([2, 1]), 'learn', '예전 기록(연속 칸 없음)도 읽는다');
});
test('섞어서: 약한 문제 약 40%, 새 문제 약 40%, 아는 문제 약 20%', function () {
  var st = {}, b, k, c = { weak: 0, 'new': 0, good: 0 }, n = 0;
  for (b = 1; b <= 3; b++) st['7x' + b] = [0, 1, 0];          /* 어려움 3개 */
  for (b = 4; b <= 6; b++) st['7x' + b] = [3, 0, 3];          /* 잘함 3개, 7x7~7x9 는 처음 */
  for (var s = 1; s <= 400; s++) {
    var d = Q.quizDeck({ dans: [7], type: 'mix', n: 10, stats: st }, seeded(s));
    d.items.forEach(function (q, i) {
      var l = Q.factLevel(st[q.key]); c[l === 'hard' ? 'weak' : l]++; n++;
      if (i) assert.notStrictEqual(q.key, d.items[i - 1].key, '같은 문제가 이어 나옴');
    });
  }
  ['weak', 'new', 'good'].forEach(function (k2) { var want = k2 === 'good' ? 0.2 : 0.4, r = c[k2] / n; assert.ok(Math.abs(r - want) < 0.04, k2 + ' 비율 ' + r.toFixed(3)); });
});
test('섞어서: 모두 잘하는 단이면 그 안에서 고르고, 한 단의 아는 문제만 남아도 끝난다', function () {
  var st = {}; for (var b = 1; b <= 9; b++) st['3x' + b] = [3, 0, 3];
  var d = Q.quizDeck({ dans: [3], type: 'mix', n: 10, stats: st }, seeded(5)); assert.strictEqual(d.items.length, 10);
  st = { '2x1': [0, 1, 0] }; d = Q.quizDeck({ dans: [2], type: 'blank', n: 10, stats: st }, seeded(9)); assert.strictEqual(d.items.length, 10);
});

test('맞춤법 묶음 파일: 빈칸 하나, 정답과 틀린 보기가 다르고 보기는 2~4개', function () {
  var keys = {};
  SPELL.sets.forEach(function (st) {
    assert.ok(st.key && st.name && st.tip && st.items.length >= 5, st.key + ' 묶음 정보');
    assert.ok(!keys[st.key], '묶음 key 중복 ' + st.key); keys[st.key] = true;
    st.items.forEach(function (it, i) {
      var where = st.key + ' ' + (i + 1) + '번 ';
      assert.strictEqual(it.q.split('___').length, 2, where + '빈칸은 하나');
      assert.ok(it.a && Array.isArray(it.w) && it.w.length >= 1 && it.w.length <= 3, where + '보기');
      assert.ok(it.w.indexOf(it.a) < 0 && new Set(it.w).size === it.w.length, where + '보기 중복');
      assert.ok(it.why, where + '설명');
    });
  });
});
test('맞춤법 덱: 10문제, 보기 개수 맞음, 정답 위치 맞음, 빈칸이 정답으로 채워짐', function () {
  for (var s = 1; s <= 50; s++) {
    var d = Q.quizDeck({ subject: 'spell', sets: ['dwae', 'nat'], bank: BANK, n: 10 }, seeded(s));
    assert.strictEqual(d.items.length, 10); assert.strictEqual(d.type, 'spell');
    d.items.forEach(function (q) {
      assert.strictEqual(q.opts[q.slot], q.ans); assert.strictEqual(q.opts.length, q.n);
      assert.ok(q.text.indexOf('＿＿') >= 0 && q.full.indexOf(q.ans) >= 0 && q.full.indexOf('___') < 0);
      assert.ok(/^sp:(dwae|nat):\d+$/.test(q.key));
    });
  }
});
test('맞춤법: 보기 2개짜리 정답 위치 반반, 틀린 문제는 같은 문장으로 다시 나온다', function () {
  var left = 0, all = 0;
  for (var s = 1; s <= 200; s++) {
    var d = Q.quizDeck({ subject: 'spell', sets: ['an'], bank: BANK, n: 10 }, seeded(s));
    d.items.forEach(function (q) { if (q.slot === 0) left++; all++; });
  }
  assert.ok(Math.abs(left / all - 0.5) < 0.05, '왼쪽 비율 ' + (left / all).toFixed(3));
  var rf = seeded(4), d2 = Q.quizDeck({ subject: 'spell', sets: ['wen'], bank: BANK, n: 4 }, rf), q, first = null;
  while ((q = Q.quizNext(d2))) { if (!first) first = q; Q.quizAnswer(d2, q, q === first ? (q.slot + 1) % q.n : q.slot, rf); }
  var again = d2.items[d2.items.length - 1];
  assert.strictEqual(d2.items.length, 5); assert.strictEqual(again.key, first.key); assert.strictEqual(again.full, first.full);
});

console.log(runs - fails + ' / ' + runs + ' 통과');
process.exit(fails ? 1 : 0);
