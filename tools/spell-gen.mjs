// 맞춤법 문제 후보 만들기 (learning edition 1.5). Run by hand while developing, never by the game: the key stays on the developer's machine.
//
//   UPSTAGE_API_KEY=… node tools/spell-gen.mjs gen    → tools/out/spell-candidates.json  (new sentences for every set)
//   UPSTAGE_API_KEY=… node tools/spell-gen.mjs check  → the same file, each sentence checked twice by a second model call
//
// Behind a proxy, Node's own fetch needs NODE_USE_ENV_PROXY=1. Nothing here touches data/spell.json: the sentences are only candidates.
// A teacher approves them on the review page, and only approved ones are merged into the bank (tools/spell-merge.mjs).
//
// Checks, in order:
//   1. form (here): one blank, short sentence, the answer and the wrong options differ, a short explanation in 「」 style, no repeats
//   2. blind pick (model): the options are shown shuffled without saying which is right; the model must choose the right one by itself
//   3. review (model): with the answer shown, is the filled sentence correct and natural, is every wrong option really wrong there,
//      is the explanation right, is it fit for a child in grades 1-4
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');   /* a folder with spaces or Korean letters, or on Windows */
const OUT = path.join(ROOT, 'tools', 'out', 'spell-candidates.json');
const KEY = process.env.UPSTAGE_API_KEY || '';
const MODEL = process.env.UPSTAGE_MODEL || 'solar-pro4';
const API = 'https://api.upstage.ai/v1/chat/completions';

/* new sets: key, name, the one-line tip shown in the game, and what the sentences should cover */
const NEW_SETS = [
  { key: 'jak', name: '작다/적다', tip: '크기는 「작다」, 양이나 수는 「적다」야.', cover: '크기(옷, 신발, 몸, 그릇, 글씨)와 양·수(사람, 물, 돈, 시간, 밥) 둘 다' },
  { key: 'ilh', name: '잃어버리다/잊어버리다', tip: '물건이 없어지면 「잃어버리다」, 기억이 안 나면 「잊어버리다」야.', cover: '물건을 잃는 경우와 약속·이름·숙제를 잊는 경우 둘 다' },
  { key: 'but', name: '붙이다/부치다', tip: '딱 달라붙게 하면 「붙이다」, 편지나 짐을 보내면 「부치다」야.', cover: '스티커·우표·별명을 붙이는 경우와 편지·소포를 부치는 경우' },
  { key: 'mae', name: '매다/메다', tip: '끈을 묶으면 「매다」, 어깨에 걸치면 「메다」야.', cover: '끈·넥타이·안전띠를 매는 경우와 가방·배낭을 메는 경우' },
  { key: 'ban', name: '반드시/반듯이', tip: '꼭은 「반드시」, 비뚤지 않고 바르면 「반듯이」야.', cover: '꼭 해야 하는 일과 바르게 앉기·눕기·놓기' },
  { key: 'itta', name: '이따가/있다가', tip: '조금 뒤에는 「이따가」, 어디에 머물다가는 「있다가」야.', cover: '조금 뒤를 뜻하는 경우와 어떤 곳에 머물다가를 뜻하는 경우' },
  { key: 'neom', name: '너머/넘어', tip: '저쪽 공간은 「너머」, 무엇을 지나가는 움직임은 「넘어」야.', cover: '산·담·창문 너머의 공간과 담·고개·줄을 넘어가는 움직임' },
  { key: 'dar', name: '다르다/틀리다', tip: '같지 않으면 「다르다」, 답이 맞지 않으면 「틀리다」야.', cover: '서로 같지 않은 경우와 답·계산이 맞지 않은 경우' }
];
const ADD_OLD = 12, ADD_NEW = 14, EXTRA = 6;   /* a few more than wanted: some will not pass the checks */

function rules(name) {
  return [
    `「${name}」을(를) 구분하는 초등학교 1~4학년용 빈칸 문제를 만든다.`,
    '- 만드는 순서: 먼저 아이가 집이나 학교에서 실제로 말할 법한, 앞뒤 뜻이 맞고 자연스러운 완전한 문장을 떠올린다. 그다음 그 문장에서 구분할 낱말 하나만 ___ 로 바꾼다. 정답 낱말은 문장의 다른 곳에 쓰지 않는다.',
    '- q: 8~26자. 빈칸 ___ 는 정확히 한 번. 띄어쓰기도 맞춤법에 맞게(예: 「넘어갔어」처럼 붙여 쓰는 말은 붙여서). 문장 끝에 마침표나 물음표.',
    '- a: 빈칸에 그대로 넣었을 때 문장이 맞춤법과 문법에 맞고 자연스러운 정확한 활용형 (예: 「작아서」, 「나았다」, 「돼」). 빈칸 뒤에 붙는 글자와 겹치지 않게.',
    '- w: 틀린 보기 1~2개. a와 같은 자리에 같은 활용으로 넣으면 맞춤법이나 뜻이 틀리는 말. 그 문장에서 맞을 수도 있는 말은 넣지 않는다.',
    '- why: 틀렸을 때 보여 줄 설명. 12~42자. 해요체로 끝낸다(예요/이에요/해요). 낱말은 「」로 묶는다. 아이가 규칙을 알 수 있게.',
    '- 정답이 여러 쪽에 고르게 나오게 한다: 구분하는 말이 둘이면 절반씩, 셋 이상이면 골고루.',
    '- 무섭거나 다치는 내용, 상표, 실제 인물, 어른만 쓰는 낱말은 쓰지 않는다. 이미 있는 문장과 같거나 거의 같은 문장은 만들지 않는다.'
  ].join('\n');
}

/* streamed: a reasoning answer can take a minute or more, and a connection that carries nothing for that long is cut on the way
   (502 "upstream request failed"); streamed, the reasoning keeps it busy */
async function chat(messages, opts = {}) {
  let last = '';
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const r = await fetch(API, {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + (KEY || 'proxy-injected'), 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: MODEL, messages, stream: true, response_format: { type: 'json_object' }, temperature: opts.temperature ?? 0.4, ...(opts.effort ? { reasoning_effort: opts.effort, max_tokens: 24000 } : {}) })
      });
      if (r.status === 429 || r.status >= 500) { last = r.status + ' ' + (await r.text()).slice(0, 160); await new Promise(res => setTimeout(res, 5000 * (attempt + 1))); continue; }   /* busy or rate-limited: wait longer each time */
      if (!r.ok) throw new Error(r.status + ' ' + (await r.text()).slice(0, 300));
      const rd = r.body.getReader(), dec = new TextDecoder();
      let buf = '', content = '', finish = '';
      for (;;) {
        const { value, done } = await rd.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let i;
        while ((i = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
          if (!line.startsWith('data:')) continue;
          const d = line.slice(5).trim();
          if (d === '[DONE]') continue;
          try { const c = JSON.parse(d).choices[0]; if (c.delta && c.delta.content) content += c.delta.content; if (c.finish_reason) finish = c.finish_reason; } catch (e) {}
        }
      }
      if (!content) throw new Error('empty answer (' + (finish || 'cut off') + ')');   /* reasoning ran out of room or the stream broke: ask again */
      return JSON.parse(content);
    } catch (e) {
      last = String(e.message || e);
      if (attempt === 5) throw e;
      await new Promise(res => setTimeout(res, 2000 * (attempt + 1)));
    }
  }
  throw new Error('no answer after 6 tries: ' + last);
}
/* run jobs a few at a time */
async function pool(items, n, fn) {
  let i = 0; const out = new Array(items.length);
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); } }));
  return out;
}

const norm = s => String(s || '').replace(/\s+/g, '').replace(/[.?!,]/g, '');
/* 1. form */
function formErrors(it, seen) {
  const e = [];
  if (typeof it.q !== 'string' || it.q.split('___').length !== 2) e.push('빈칸이 하나가 아님');
  if (it.q && (it.q.length < 8 || it.q.length > 30)) e.push('문장 길이 ' + it.q.length + '자');
  if (!it.a || typeof it.a !== 'string' || it.a.length > 8) e.push('정답 형식');
  if (!Array.isArray(it.w) || it.w.length < 1 || it.w.length > 2 || it.w.some(w => typeof w !== 'string' || !w || w.length > 8)) e.push('틀린 보기 형식');
  else if (it.w.some(w => w === it.a) || new Set(it.w).size !== it.w.length) e.push('보기가 겹침');
  if (typeof it.why !== 'string' || it.why.length < 10 || it.why.length > 50) e.push('설명 길이');
  else if (!/(요|요\.)$/.test(it.why.trim())) e.push('설명이 해요체가 아님');
  if (seen.has(norm(it.q))) e.push('이미 있는 문장');
  return e;
}

async function gen() {
  const bank = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'spell.json'), 'utf8'));
  const jobs = bank.sets.map(s => ({ key: s.key, name: s.name, tip: s.tip, old: s.items, n: ADD_OLD, isNew: false }))
    .concat(NEW_SETS.map(s => ({ ...s, old: [], n: ADD_NEW, isNew: true })));
  const seen = new Set(bank.sets.flatMap(s => s.items.map(i => norm(i.q))));
  /* a set already made in an earlier run is kept (the run can be stopped and started again); the file is saved after every set */
  const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : null, doneSets = {};
  if (prev && prev.gen === 2) prev.sets.forEach(s => { if (s.items.filter(i => !i.form.length).length >= s.want) { doneSets[s.key] = s; s.items.forEach(i => { if (!i.form.length) seen.add(norm(i.q)); }); } });
  const out = { gen: 2, model: MODEL, made: new Date().toISOString(), sets: [] };
  const save = () => { fs.mkdirSync(path.dirname(OUT), { recursive: true }); out.sets.sort((x, y) => jobs.findIndex(j => j.key === x.key) - jobs.findIndex(j => j.key === y.key)); fs.writeFileSync(OUT, JSON.stringify(out, null, 1)); };
  Object.values(doneSets).forEach(s => out.sets.push(s));
  const sets = await pool(jobs.filter(j => !doneSets[j.key]), 3, async (job) => {
    const examples = (job.old.length ? job.old : bank.sets[0].items.slice(0, 3)).map(i => JSON.stringify(i)).join('\n');
    const kept = [], want = job.n + EXTRA;
    /* seven at a time (a long reasoning request is cut off on the way); each batch is told what is already there */
    for (let batch = 0; kept.length < want && batch < 5; batch++) {
      const made = kept.filter(i => !i.form.length);
      const tally = {}; job.old.concat(made).forEach(i => { tally[i.a] = (tally[i.a] || 0) + 1; });
      const msg = [
        { role: 'system', content: '너는 초등학교 국어 교사이자 표준어·한글 맞춤법 전문가다. 국립국어원 표준국어대사전과 한글 맞춤법 규정을 따른다. JSON만 출력한다.' },
        { role: 'user', content: rules(job.name) + '\n\n게임 안내 문구: ' + job.tip + (job.cover ? '\n다룰 상황: ' + job.cover : '') +
          '\n\n형식과 말투는 아래 예시를 따른다' + (job.old.length ? '(이 문장들은 이미 있으니 다시 쓰지 않는다)' : '(다른 묶음의 예시)') + ':\n' + examples +
          (made.length ? '\n\n이번에 이미 만든 문장(다시 쓰지 않는다):\n' + made.map(i => i.q).join('\n') : '') +
          (Object.keys(tally).length ? '\n지금까지 정답 수: ' + JSON.stringify(tally) + ' (적은 쪽을 더 만든다)' : '') +
          '\n\n새 문제 7개를 {"items":[{"q":"","a":"","w":[""],"why":""}]} 형식으로 출력한다.' }
      ];
      let res;
      try { res = await chat(msg, { temperature: 0.7, effort: 'high' }); } catch (e) { console.log(job.key, 'batch', batch, 'failed:', e.message); continue; }
      const items = ((res && res.items) || []).map(it => ({ q: String(it.q || '').trim(), a: String(it.a || '').trim(), w: (it.w || []).map(x => String(x).trim()), why: String(it.why || '').trim() }));
      for (const it of items) { const e = formErrors(it, seen); it.form = e; if (!e.length) seen.add(norm(it.q)); kept.push(it); }
      console.log(job.key, 'batch', batch, '+' + items.length, new Date().toISOString().slice(11, 19));
    }
    console.log(job.key, 'made', kept.length, 'form ok', kept.filter(i => !i.form.length).length);
    const done = { key: job.key, name: job.name, tip: job.tip, isNew: job.isNew, want: job.n, items: kept };
    out.sets.push(done); save();
    return done;
  });
  save();
  console.log('wrote', path.relative(ROOT, OUT), out.sets.length, 'sets');
}

function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
async function check() {
  const doc = JSON.parse(fs.readFileSync(OUT, 'utf8'));
  const all = doc.sets.flatMap(s => s.items.filter(it => !it.form.length && !it.review).map(it => ({ s, it })));   /* already checked ones are kept */
  let done = 0;
  await pool(all, 8, async ({ s, it }) => {
   /* one sentence the service keeps refusing must not stop the others: it is noted, left unchecked (so the next run tries it again)
      and the review page shows it as not passed */
   try {
    delete it.checkError;
    /* 2. blind pick */
    const opts = shuffle([it.a].concat(it.w));
    const blind = await chat([
      { role: 'system', content: '너는 표준어·한글 맞춤법 전문가다. 국립국어원 기준으로 판단한다. JSON만 출력한다.' },
      { role: 'user', content: `빈칸에 들어갈 말로 맞춤법과 뜻이 모두 맞는 것을 보기에서 하나 고른다. 맞는 것이 없거나 둘 이상이면 pick을 "없음" 또는 "여럿"으로.\n문장: ${it.q}\n보기: ${opts.map(o => '「' + o + '」').join(', ')}\n{"pick":"","reason":""}` }
    ], { temperature: 0, effort: 'medium' });
    /* 3. review, the answer shown */
    const filled = it.q.replace('___', it.a);
    const rev = await chat([
      { role: 'system', content: '너는 초등학교 국어 교사이자 표준어·한글 맞춤법 전문가다. 국립국어원 기준으로 꼼꼼하게 검토한다. JSON만 출력한다.' },
      { role: 'user', content: `초등 1~4학년 맞춤법 게임의 문제를 검토한다.\n빈칸 문장: ${it.q}\n정답: 「${it.a}」 → ${filled}\n틀린 보기: ${it.w.map(w => '「' + w + '」').join(', ')}\n틀렸을 때 설명: ${it.why}\n\n` +
        '각 항목을 true/false로: answer_ok(정답을 넣은 문장이 맞춤법·띄어쓰기·문법에 맞고, 앞뒤 뜻이 통하며 자연스럽다), wrong_ok(틀린 보기를 넣으면 모두 확실히 틀린다. 그 문장에서 맞을 수도 있으면 false), why_ok(설명이 사실에 맞고 아이가 이해할 수 있다), kid_ok(내용과 낱말이 초등 저학년에게 알맞다). 문제가 있으면 note에 한 문장으로.\n{"answer_ok":true,"wrong_ok":true,"why_ok":true,"kid_ok":true,"note":""}' }
    ], { temperature: 0, effort: 'high' });
    it.blind = { pick: String(blind.pick || ''), reason: String(blind.reason || '').slice(0, 200), ok: String(blind.pick || '').replace(/[「」]/g, '').trim() === it.a };
    it.review = { answer_ok: !!rev.answer_ok, wrong_ok: !!rev.wrong_ok, why_ok: !!rev.why_ok, kid_ok: !!rev.kid_ok, note: String(rev.note || '').slice(0, 200) };
    it.pass = it.blind.ok && it.review.answer_ok && it.review.wrong_ok && it.review.why_ok && it.review.kid_ok;
   } catch (err) {
    delete it.blind; delete it.review; it.pass = false; it.checkError = String((err && err.message) || err).slice(0, 200);
    console.error('check failed', s.key, it.q, it.checkError);
   } finally {
    if (++done % 10 === 0) { fs.writeFileSync(OUT, JSON.stringify(doc, null, 1)); console.log('checked', done, '/', all.length, new Date().toISOString().slice(11, 19)); }
   }
  });
  doc.checked = new Date().toISOString();
  fs.writeFileSync(OUT, JSON.stringify(doc, null, 1));
  const n = all.length, p = all.filter(x => x.it.pass).length;
  console.log('checked', n, 'passed', p);
  for (const s of doc.sets) console.log(s.key, 'pass', s.items.filter(i => i.pass).length, '/', s.items.length);
}

const cmd = process.argv[2];
if (cmd === 'gen') await gen();
else if (cmd === 'check') await check();
else console.log('usage: node tools/spell-gen.mjs gen | check');
