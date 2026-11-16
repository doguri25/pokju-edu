// 검수한 맞춤법 문장을 문제 은행에 합치기 (learning edition 1.5).
//
//   node tools/spell-merge.mjs tools/out/spell-decisions.json
//
// Reads the candidates (tools/out/spell-candidates.json, from tools/spell-gen.mjs) and the teacher's decisions from the review page,
// { done: true, decisions: { "<set>-<n>": { ok: true|false, q?, a?, w?, why? } } }. A set records in "ai" how many of its sentences Solar made. A candidate with no decision keeps the review page's
// default: approved if it passed every check, left out if not. Fields given with a decision replace the generated ones (the teacher's edit).
//
// New sentences are only ever added at the END of a set: the game records each sentence by its place in its set (sp:<set>:<n>),
// so a child's record of the old sentences stays where it was. New sets are added after the old ones.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const BANK = path.join(ROOT, 'data', 'spell.json');
const cand = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'out', 'spell-candidates.json'), 'utf8'));
const dec = JSON.parse(fs.readFileSync(process.argv[2] || path.join(ROOT, 'tools', 'out', 'spell-decisions.json'), 'utf8'));
if (!dec.done) { console.error('검수가 끝나지 않았습니다 (done: false).'); process.exit(1); }
const bank = JSON.parse(fs.readFileSync(BANK, 'utf8'));
const norm = s => String(s || '').replace(/\s+/g, '').replace(/[.?!,]/g, '');
const seen = new Set(bank.sets.flatMap(s => s.items.map(i => norm(i.q))));

function valid(it) {
  return typeof it.q === 'string' && it.q.split('___').length === 2 && typeof it.a === 'string' && it.a &&
    Array.isArray(it.w) && it.w.length >= 1 && it.w.length <= 2 && it.w.every(w => typeof w === 'string' && w && w !== it.a) && typeof it.why === 'string' && it.why;
}

let added = 0, skipped = 0;
const report = [];
for (const cs of cand.sets) {
  const take = [];
  cs.items.forEach((it, n) => {
    if (it.form && it.form.length) return;   /* never shown on the review page */
    const id = cs.key + '-' + n, d = dec.decisions[id];
    const ok = d && typeof d.ok === 'boolean' ? d.ok : !!it.pass;
    if (!ok) return;
    const out = { q: (d && d.q) || it.q, a: (d && d.a) || it.a, w: (d && d.w) || it.w, why: (d && d.why) || it.why };
    if (!valid(out) || seen.has(norm(out.q))) { skipped++; report.push('건너뜀 ' + id + ': ' + out.q); return; }
    seen.add(norm(out.q)); take.push(out);
  });
  let set = bank.sets.find(s => s.key === cs.key);
  if (!set) {
    if (!take.length) continue;
    set = { key: cs.key, name: cs.name, tip: cs.tip, items: [] };
    bank.sets.push(set);
  }
  set.items.push(...take);
  if (take.length) set.ai = (set.ai || 0) + take.length;   /* how many of its sentences Solar made: the game says so (title, set details) */
  added += take.length;
  report.push(cs.key + ' ' + cs.name + ': +' + take.length + ' → ' + set.items.length);
}
/* written in the file's own layout: one sentence per line */
const J = v => JSON.stringify(v);
const item = it => '{ "q": ' + J(it.q) + ', "a": ' + J(it.a) + ', "w": [' + it.w.map(J).join(', ') + '], "why": ' + J(it.why) + ' }';
const text = '{\n  "about": ' + J(bank.about) + ',\n  "sets": [\n' + bank.sets.map(s =>
  '    { "key": ' + J(s.key) + ', "name": ' + J(s.name) + ', "tip": ' + J(s.tip) + (s.ai ? ', "ai": ' + s.ai : '') + ',\n      "items": [\n' + s.items.map(i => '        ' + item(i)).join(',\n') + '\n      ] }').join(',\n') + '\n  ]\n}\n';
JSON.parse(text);
fs.writeFileSync(BANK, text);
console.log(report.join('\n'));
console.log('added', added, 'skipped', skipped, 'sets', bank.sets.length, 'items', bank.sets.reduce((n, s) => n + s.items.length, 0));
