// AI仮情報がどれだけ残っているかを数える: node tools/ai-report.js [--list]
// 一気に書き換える作業の進み具合の確認に使います。
const path = require('path');
global.window = {};
const root = path.join(__dirname, '..');
['js/data.js', 'js/content.js', 'js/ai-draft/01-05.js', 'js/ai-draft/06-10.js', 'js/ai-draft/11-14.js', 'js/map.js', 'js/trouble.js', 'js/judge.js']
  .forEach(f => require(path.join(root, f)));
const D = window.SAITEIGEN_DATA, C = window.SAITEIGEN_CONTENT, A = window.SAITEIGEN_AI_DRAFT, M = window.SAITEIGEN_MAP;
const items = D.categories.flatMap(c => c.items.map(i => Object.assign({ cat: c.no + ' ' + c.name }, i)));
const covered = new Set(C.filter(a => a.status !== 'archived').flatMap(a => a.items));
const humanCovered = new Set(C.filter(a => a.status !== 'archived' && a.origin !== 'ai').flatMap(a => a.items));
const aiDraftUsed = items.filter(i => A[i.id] && !covered.has(i.id));
const aiArticles = C.filter(a => a.origin === 'ai' && a.status !== 'archived');
const aiCards = M.cards.filter(c => (c.origin || M.origin) === 'ai');
const none = items.filter(i => !covered.has(i.id) && !A[i.id]);
console.log('項目数                         :', items.length);
console.log('人が確認した記事がある項目     :', humanCovered.size);
console.log('AI仮情報 (content.js の記事)   :', aiArticles.length, '本');
console.log('AI仮情報 (ai-draft で表示中)   :', aiDraftUsed.length, '項目');
console.log('AI仮情報 (マップのカード)      :', aiCards.length, '/', M.cards.length, '枚');
const T = window.SAITEIGEN_TROUBLE;
console.log('AI仮情報 (トラブル対処)        :', T.origin === 'ai' ? T.cases.length : 0, '/', T.cases.length, '件');
console.log('AI仮情報 (判断のコツ)          :', window.SAITEIGEN_JUDGE.origin === 'ai' ? window.SAITEIGEN_JUDGE.guides.length : 0, '件');
console.log('内容なし                       :', none.length, '項目');
const unknown = Object.keys(A).filter(k => !items.some(i => i.id === k));
if (unknown.length) console.log('⚠ data.js に無い ai-draft のキー:', unknown.join(', '));
if (process.argv.includes('--list')) {
  console.log('\n--- ai-draft で表示中の項目 ---');
  aiDraftUsed.forEach(i => console.log(i.id.padEnd(20), i.cat, '/', i.name));
  console.log('\n--- AI仮情報のカード ---');
  aiCards.forEach(c => console.log(c.id.padEnd(20), 'Lv' + c.level, c.title));
}
