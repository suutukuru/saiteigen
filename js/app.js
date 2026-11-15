/* 大人の身だしなみ・生活力向上アプリ — 本体
 * ビルド不要。データはすべてこの端末の localStorage に保存されます。 */
(function () {
  'use strict';

  const D = window.SAITEIGEN_DATA;
  const ARTICLES = (window.SAITEIGEN_CONTENT || []).filter(a => a.status !== 'archived');
  const STORE_KEY = 'saiteigen.v1';
  const $app = document.getElementById('app');

  // ---------- インデックス ----------
  const itemMap = {};
  const catMap = {};
  D.categories.forEach(c => {
    catMap[c.id] = c;
    c.items.forEach(it => {
      it.cat = c.id;
      it.kind = it.kind || c.kind;
      itemMap[it.id] = it;
    });
  });
  const articleMap = {};
  ARTICLES.forEach(a => { articleMap[a.id] = a; });
  const allItems = Object.values(itemMap);

  // ---------- 状態 ----------
  const blank = () => ({
    version: 1, status: {}, checks: {}, focus: {}, suggestion: {},
    habits: [], belongings: [], wishes: [], statusLog: [], practiceLog: [],
    goal: '', onboarded: false
  });
  let S = load();
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return Object.assign(blank(), JSON.parse(raw));
    } catch (e) { console.warn(e); }
    return blank();
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); }
    catch (e) { toast('保存に失敗しました（容量不足の可能性）。写真を減らすかバックアップしてください。'); }
  }

  // ---------- ユーティリティ ----------
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  function today() { return ymd(new Date()); }
  function ymd(d) { const z = n => String(n).padStart(2, '0'); return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()); }
  function parseYmd(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
  function addDays(s, n) { const d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d); }
  function addMonths(s, n) { const d = parseYmd(s); d.setMonth(d.getMonth() + n); return ymd(d); }
  function diffDays(a, b) { return Math.round((parseYmd(b) - parseYmd(a)) / 86400000); }
  function fmtDate(s) { if (!s) return '—'; const d = parseYmd(s); return (d.getMonth() + 1) + '/' + d.getDate(); }
  function yen(n) { return n || n === 0 ? '¥' + Number(n).toLocaleString('ja-JP') : '—'; }
  function rel(s) {
    if (!s) return '';
    const n = diffDays(today(), s);
    if (n === 0) return '今日';
    if (n === 1) return '明日';
    if (n === -1) return '昨日';
    return n > 0 ? n + '日後' : Math.abs(n) + '日前';
  }

  function statusSet(it) { return D.statusSets[it.kind] || D.statusSets.habit; }
  function statusOf(id) { return S.status[id] || 0; }
  function maxV(it) { const s = statusSet(it); return s[s.length - 1].v; }
  function statusLabel(it) {
    const v = statusOf(it.id);
    const set = statusSet(it);
    let best = set[0];
    set.forEach(o => { if (o.v <= v) best = o; });
    return best.label;
  }
  function progress(it) { return Math.min(1, statusOf(it.id) / maxV(it)); }
  function catProgress(c) {
    const p = c.items.reduce((a, it) => a + progress(it), 0);
    return c.items.length ? p / c.items.length : 0;
  }
  function setStatus(id, v) {
    if (statusOf(id) === v) return;
    S.status[id] = v;
    S.statusLog.push({ id, v, date: today() });
    if (S.statusLog.length > 1000) S.statusLog = S.statusLog.slice(-1000);
    save();
  }
  function raiseStatus(id, v) {
    const it = itemMap[id];
    if (!it) return;
    const allowed = statusSet(it).map(o => o.v).filter(x => x >= v);
    const target = allowed.length ? allowed[0] : maxV(it);
    if (statusOf(id) < target) setStatus(id, target);
  }

  // ---------- 習慣 ----------
  function habitInterval(h) { return Number(h.interval) || D.freqDays[h.freq] || 7; }
  function habitNext(h) { return h.last ? addDays(h.last, habitInterval(h)) : today(); }
  function habitDue(h) { return h.active !== false && habitNext(h) <= today(); }
  function habitDoneToday(h) { return h.last === today(); }
  function addHabit(name, freq, itemId, interval) {
    const exists = S.habits.find(h => h.name === name && h.itemId === itemId && h.active !== false);
    if (exists) return false;
    S.habits.push({ id: uid(), name, freq, interval: interval || D.freqDays[freq], itemId: itemId || null, last: null, log: [], createdAt: today(), active: true });
    return true;
  }
  function doneHabit(h) {
    if (habitDoneToday(h)) { // 取り消し
      h.log = (h.log || []).filter(d => d !== today());
      h.last = h.log.length ? h.log[h.log.length - 1] : null;
    } else {
      h.log = (h.log || []).concat(today()).slice(-400);
      h.last = today();
      if (h.itemId) {
        raiseStatus(h.itemId, 4);
        const streak = h.log.length;
        if (streak >= 8) raiseStatus(h.itemId, 5);
      }
    }
    save();
  }

  // ---------- メンテナンス ----------
  function maintDue(b) { return b.nextMaint && b.nextMaint <= today(); }
  function replaceDate(b) { return b.purchaseDate && b.replaceMonths ? addMonths(b.purchaseDate, Number(b.replaceMonths)) : null; }

  // ---------- おすすめ ----------
  function suggestions() {
    const list = [];
    allItems.forEach(it => {
      if (S.suggestion[it.id]) return;
      const v = statusOf(it.id);
      if (v >= 4) return;
      const c = catMap[it.cat];
      const sg = it.suggest || (S.focus[it.id] ? {
        text: '「' + it.name + '」の観点を確認する',
        reason: '「気にする」に登録した項目です。',
        priority: 2
      } : null);
      if (!sg) return;
      let score = (4 - (sg.priority || 2)) * 10;
      if (c.important) score += 8;
      if (S.focus[it.id]) score += 15;
      if (v === 0) score += 3;
      list.push({ it, sg, score });
    });
    return list.sort((a, b) => b.score - a.score);
  }
  function adopt(id) {
    const it = itemMap[id];
    S.suggestion[id] = 'adopted';
    S.focus[id] = S.focus[id] || 2;
    raiseStatus(id, 2);
    let n = 0;
    (it.tasks || []).forEach(t => { if (addHabit(t.name, t.freq, id, t.interval)) n++; });
    save();
    toast('採用しました' + (n ? '（習慣に' + n + '件追加）' : ''));
  }

  // ---------- トースト・シート ----------
  let toastTimer;
  function toast(msg) {
    let el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
  }
  function openSheet(title, bodyHtml, onSubmit) {
    const root = document.getElementById('sheet');
    root.innerHTML = '<div class="sheet-backdrop" data-act="close-sheet"></div>' +
      '<form class="sheet-panel" id="sheet-form" novalidate>' +
      '<div class="sheet-head"><button type="button" class="link" data-act="close-sheet">キャンセル</button>' +
      '<strong>' + esc(title) + '</strong><button type="submit" class="link strong">保存</button></div>' +
      '<div class="sheet-body">' + bodyHtml + '</div></form>';
    root.classList.add('open');
    document.body.classList.add('noscroll');
    const form = document.getElementById('sheet-form');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const fd = new FormData(form);
      const data = {};
      fd.forEach((v, k) => { if (!(v instanceof File)) data[k] = String(v).trim(); });
      const ok = await onSubmit(data, form);
      if (ok !== false) { closeSheet(); render(); }
    });
  }
  function closeSheet() {
    const root = document.getElementById('sheet');
    root.classList.remove('open');
    root.innerHTML = '';
    document.body.classList.remove('noscroll');
  }

  // ---------- 部品 ----------
  const bar = p => '<div class="bar"><span style="width:' + Math.round(p * 100) + '%"></span></div>';
  const badge = (t, cls) => '<span class="badge ' + (cls || '') + '">' + esc(t) + '</span>';
  const articleBadge = a => ({
    draft: badge('下書き・出典確認前', 'warn'),
    review: badge('確認中', 'warn'),
    published: badge('出典確認済み', 'ok')
  }[a.status] || '');
  function header(title, back) {
    return '<header class="top">' + (back ? '<a class="back" href="' + back + '" aria-label="戻る">‹</a>' : '<span></span>') +
      '<h1>' + esc(title) + '</h1><span></span></header>';
  }
  function seg(items, active) {
    return '<nav class="seg">' + items.map(([href, label]) =>
      '<a href="' + href + '" class="' + (href === active ? 'on' : '') + '">' + esc(label) + '</a>').join('') + '</nav>';
  }
  function habitRow(h) {
    const done = habitDoneToday(h);
    const it = h.itemId && itemMap[h.itemId];
    return '<li class="row">' +
      '<button class="check ' + (done ? 'on' : '') + '" data-act="habit-done" data-id="' + h.id + '" aria-label="完了">' + (done ? '✓' : '') + '</button>' +
      '<div class="grow"><div class="' + (done ? 'muted strike' : '') + '">' + esc(h.name) + '</div>' +
      '<div class="sub">' + esc(D.freqLabels[h.freq] || '') + (h.freq === 'irregular' ? '（' + habitInterval(h) + '日ごと）' : '') +
      (it ? ' · ' + esc(it.name) : '') + '</div></div></li>';
  }
  function suggestCard(x) {
    const { it, sg } = x;
    const c = catMap[it.cat];
    const pr = ['', '高', '中', '低'][sg.priority || 2];
    return '<div class="card suggest">' +
      '<div class="sub">' + c.icon + ' ' + esc(c.name) + ' · 優先度 ' + pr + '</div>' +
      '<a class="title" href="#/item/' + it.id + '">' + esc(sg.text) + '</a>' +
      '<p class="reason">' + esc(sg.reason || '') + '</p>' +
      '<dl class="meta">' +
      (sg.effect ? '<div><dt>効果</dt><dd>' + esc(sg.effect) + '</dd></div>' : '') +
      (sg.cost ? '<div><dt>費用</dt><dd>' + esc(sg.cost) + '</dd></div>' : '') +
      (sg.time ? '<div><dt>時間</dt><dd>' + esc(sg.time) + '</dd></div>' : '') +
      '</dl>' +
      '<div class="actions"><button class="btn primary" data-act="adopt" data-id="' + it.id + '">取り組む</button>' +
      '<button class="btn ghost" data-act="dismiss" data-id="' + it.id + '">今はしない</button></div></div>';
  }

  // ---------- 画面 ----------
  const views = {};

  views.home = function () {
    const t = today();
    const d = new Date();
    const wd = '日月火水木金土'[d.getDay()];
    const due = S.habits.filter(h => h.active !== false && (habitDue(h) || habitDoneToday(h)));
    const maint = S.belongings.filter(maintDue);
    const sugg = suggestions().slice(0, 3);
    const focus = allItems.filter(it => S.focus[it.id] && progress(it) < 1)
      .sort((a, b) => (S.focus[a.id] || 2) - (S.focus[b.id] || 2)).slice(0, 5);
    const total = allItems.reduce((a, it) => a + progress(it), 0) / allItems.length;
    const doneCount = due.filter(habitDoneToday).length;

    let html = '<header class="hero"><div class="sub">' + (d.getMonth() + 1) + '月' + d.getDate() + '日（' + wd + '）</div>' +
      '<h1>今日やること</h1>' + (S.goal ? '<p class="goal">🎯 ' + esc(S.goal) + '</p>' : '') + '</header>';

    if (!S.onboarded) {
      html += '<div class="card intro"><strong>はじめに</strong>' +
        '<p>このアプリは「何を気にすればいいか」を教えるアプリです。まずは最重要の2カテゴリーで、自分の状態をチェックしてみましょう。</p>' +
        '<div class="actions"><a class="btn primary" href="#/cat/c01">美容・身だしなみ</a><a class="btn" href="#/cat/c02">匂い・清潔感</a></div>' +
        '<button class="link small" data-act="onboarded">閉じる</button></div>';
    }

    html += '<section><h2>今日のタスク <span class="count">' + doneCount + '/' + due.length + '</span></h2>';
    if (due.length || maint.length) {
      html += '<ul class="list">' + due.map(habitRow).join('') +
        maint.map(b => '<li class="row"><button class="check" data-act="maint-done" data-id="' + b.id + '">🔧</button>' +
          '<div class="grow"><div>' + esc(b.name) + ' の手入れ</div><div class="sub">メンテナンス予定 ' + rel(b.nextMaint) + '</div></div></li>').join('') +
        '</ul>';
    } else {
      html += '<div class="empty">今日のタスクはありません。<br>おすすめを「取り組む」にするか、<a href="#/habits">習慣</a>を追加しましょう。</div>';
    }
    html += '</section>';

    html += '<section><h2>おすすめ <a class="more" href="#/suggest">すべて</a></h2>' +
      (sugg.length ? sugg.map(suggestCard).join('') : '<div class="empty">今のおすすめはすべて確認済みです。</div>') + '</section>';

    html += '<section><h2>改善ポイント <a class="more" href="#/status">自分の状態</a></h2>';
    if (focus.length) {
      html += '<ul class="list">' + focus.map(it => '<li><a class="row" href="#/item/' + it.id + '">' +
        '<span class="ico">' + catMap[it.cat].icon + '</span><div class="grow"><div>' + esc(it.viewpoint || it.name) + '</div>' +
        '<div class="sub">' + esc(it.name) + ' · ' + esc(statusLabel(it)) + '</div></div><span class="chev">›</span></a></li>').join('') + '</ul>';
    } else {
      html += '<div class="empty">項目の画面で「気にする」に登録すると、ここに表示されます。</div>';
    }
    html += '</section>';

    html += '<section><h2>全体の進み具合</h2><div class="card">' + bar(total) +
      '<div class="sub">' + Math.round(total * 100) + '% · ' + allItems.filter(it => statusOf(it.id) > 0).length + '/' + allItems.length + ' 項目に着手</div></div></section>';
    return html;
  };

  views.suggest = function () {
    const list = suggestions();
    const decided = allItems.filter(it => S.suggestion[it.id]);
    return header('おすすめ', '#/home') +
      '<p class="lead">アプリから提案する「次に取り組むとよいこと」です。採用するかどうかは自分で決められます。</p>' +
      (list.length ? list.map(suggestCard).join('') : '<div class="empty">未確認のおすすめはありません。</div>') +
      (decided.length ? '<section><h2>判断済み</h2><ul class="list">' + decided.map(it =>
        '<li class="row"><div class="grow"><a href="#/item/' + it.id + '">' + esc(it.name) + '</a><div class="sub">' +
        (S.suggestion[it.id] === 'adopted' ? '取り組み中' : '今はしない') + '</div></div>' +
        '<button class="link small" data-act="undecide" data-id="' + it.id + '">戻す</button></li>').join('') + '</ul></section>' : '');
  };

  views.learn = function (q) {
    q = (q || '').trim();
    let html = header('学ぶ') + seg([['#/learn', 'カテゴリー'], ['#/articles', '記事']], '#/learn') +
      '<form class="search" data-search><input type="search" name="q" placeholder="項目を検索（例：眉毛、口臭、洗濯）" value="' + esc(q) + '"></form>';
    if (q) {
      const hits = allItems.filter(it => (it.name + (it.viewpoint || '')).includes(q));
      const ah = ARTICLES.filter(a => a.title.includes(q));
      html += '<section><h2>検索結果</h2><ul class="list">' +
        ah.map(a => '<li><a class="row" href="#/article/' + a.id + '"><span class="ico">📖</span><div class="grow">' + esc(a.title) + '</div><span class="chev">›</span></a></li>').join('') +
        hits.map(it => '<li><a class="row" href="#/item/' + it.id + '"><span class="ico">' + catMap[it.cat].icon + '</span><div class="grow"><div>' + esc(it.name) + '</div><div class="sub">' + esc(it.viewpoint || '') + '</div></div><span class="chev">›</span></a></li>').join('') +
        '</ul>' + (!hits.length && !ah.length ? '<div class="empty">見つかりませんでした。</div>' : '') + '</section>';
      return html;
    }
    html += '<div class="grid">' + D.categories.map(c =>
      '<a class="tile ' + (c.important ? 'important' : '') + '" href="#/cat/' + c.id + '">' +
      '<span class="ico big">' + c.icon + '</span><span class="no">' + c.no + '</span>' +
      '<strong>' + esc(c.name) + '</strong>' + (c.important ? badge('最重要', 'accent') : '') +
      bar(catProgress(c)) + '</a>').join('') + '</div>';
    return html;
  };

  views.articles = function () {
    return header('学ぶ') + seg([['#/learn', 'カテゴリー'], ['#/articles', '記事']], '#/articles') +
      '<p class="lead">記事には出典・最終確認日・更新履歴が付きます。「下書き・出典確認前」の記事は、内容がまだ確認されていません。</p>' +
      '<ul class="list">' + ARTICLES.map(a => '<li><a class="row" href="#/article/' + a.id + '"><span class="ico">📖</span><div class="grow"><div>' + esc(a.title) + '</div>' +
        '<div class="sub">' + articleBadge(a) + ' ' + esc(D.reliabilityTypes[a.reliability] || '') + '</div></div><span class="chev">›</span></a></li>').join('') + '</ul>';
  };

  views.cat = function (id) {
    const c = catMap[id];
    if (!c) return notFound();
    return header(c.no + ' ' + c.name, '#/learn') +
      '<p class="lead">' + esc(c.description) + '</p>' +
      '<div class="card">' + bar(catProgress(c)) + '<div class="sub">タップして状態を記録できます。気になる項目は詳細から「気にする」に登録しましょう。</div></div>' +
      '<ul class="list items">' + c.items.map(it => {
        const set = statusSet(it);
        const v = statusOf(it.id);
        return '<li class="item-row"><a class="row" href="#/item/' + it.id + '"><div class="grow"><div>' +
          (S.focus[it.id] ? '⭐️ ' : '') + esc(it.name) + ' ' + badge(D.kindLabels[it.kind]) + '</div>' +
          '<div class="sub">' + esc(it.viewpoint || '') + '</div></div><span class="chev">›</span></a>' +
          '<div class="chips">' + set.map(o => '<button class="chip ' + (o.v === v || (o.v < v && !set.some(p => p.v > o.v && p.v <= v)) ? 'on' : '') +
            '" data-act="status" data-id="' + it.id + '" data-v="' + o.v + '">' + esc(o.label) + '</button>').join('') + '</div></li>';
      }).join('') + '</ul>';
  };

  views.item = function (id) {
    const it = itemMap[id];
    if (!it) return notFound();
    const c = catMap[it.cat];
    const set = statusSet(it);
    const v = statusOf(id);
    const checks = it.checks || [];
    const ck = S.checks[id] || [];
    const habits = S.habits.filter(h => h.itemId === id && h.active !== false);
    const arts = (it.articles || []).map(a => articleMap[a]).filter(Boolean);
    const sg = it.suggest;
    let html = header(it.name, '#/cat/' + c.id) +
      '<div class="sub center">' + c.icon + ' ' + esc(c.name) + ' · ' + esc(D.kindLabels[it.kind]) + '</div>';

    html += '<div class="card viewpoint"><div class="sub">気にするとよい観点</div><strong>' + esc(it.viewpoint || it.name) + '</strong>' +
      '<div class="actions"><button class="btn ' + (S.focus[id] ? 'primary' : '') + '" data-act="focus" data-id="' + id + '">' +
      (S.focus[id] ? '⭐️ 気にする（優先度 ' + ['', '高', '中', '低'][S.focus[id]] + '）' : '☆ 気にする') + '</button>' +
      (S.focus[id] ? '<button class="btn ghost" data-act="focus-off" data-id="' + id + '">外す</button>' : '') + '</div>' +
      '<p class="sub">すべてを必須にする必要はありません。自分に必要なものだけ登録しましょう。</p></div>';

    html += '<section><h2>今の状態</h2><div class="chips">' + set.map(o =>
      '<button class="chip ' + (o.v === v ? 'on' : '') + '" data-act="status" data-id="' + id + '" data-v="' + o.v + '">' + esc(o.label) + '</button>').join('') +
      '</div></section>';

    if (checks.length) {
      html += '<section><h2>自己チェック</h2><ul class="list">' + checks.map((t, i) =>
        '<li class="row"><button class="check ' + (ck[i] ? 'on' : '') + '" data-act="check" data-id="' + id + '" data-i="' + i + '">' + (ck[i] ? '✓' : '') + '</button>' +
        '<div class="grow">' + esc(t) + '</div></li>').join('') + '</ul></section>';
    }

    if (sg) {
      const st = S.suggestion[id];
      html += '<section><h2>おすすめ</h2>' + (st
        ? '<div class="card"><strong>' + esc(sg.text) + '</strong><p class="sub">' + (st === 'adopted' ? '取り組み中' : '今はしない') +
          ' · <button class="link small" data-act="undecide" data-id="' + id + '">判断を戻す</button></p></div>'
        : suggestCard({ it, sg })) + '</section>';
    }

    html += '<section><h2>学ぶ</h2>' + (arts.length
      ? '<ul class="list">' + arts.map(a => '<li><a class="row" href="#/article/' + a.id + '"><span class="ico">📖</span><div class="grow"><div>' + esc(a.title) + '</div><div class="sub">' + articleBadge(a) + '</div></div><span class="chev">›</span></a></li>').join('') + '</ul>'
      : '<div class="empty">この項目の記事はまだありません。<br><span class="sub">根拠のある情報が用意できるまで、無理に答えを作らない方針です。</span></div>') + '</section>';

    html += '<section><h2>実践・習慣</h2>';
    if (habits.length) html += '<ul class="list">' + habits.map(h => habitRow(h).replace('</li>', '<div class="sub right">次回 ' + rel(habitNext(h)) + '</div></li>')).join('') + '</ul>';
    const tpl = (it.tasks || []).filter(t => !habits.some(h => h.name === t.name));
    if (tpl.length) html += '<div class="actions wrap">' + tpl.map((t, i) =>
      '<button class="btn" data-act="add-tpl" data-id="' + id + '" data-i="' + (it.tasks.indexOf(t)) + '">＋ ' + esc(t.name) + '（' + D.freqLabels[t.freq] + '）</button>').join('') + '</div>';
    html += '<div class="actions wrap"><button class="btn" data-act="new-habit" data-id="' + id + '">＋ 自分で習慣を作る</button>' +
      '<button class="btn" data-act="practice" data-id="' + id + '">✍️ 実践したことを記録</button></div>';
    const logs = S.practiceLog.filter(p => p.id === id).slice(-5).reverse();
    if (logs.length) html += '<ul class="list compact">' + logs.map(p => '<li class="row"><div class="sub">' + fmtDate(p.date) + '</div><div class="grow">' + esc(p.note || '実践した') + '</div></li>').join('') + '</ul>';
    html += '</section>';
    return html;
  };

  views.article = function (id) {
    const a = articleMap[id];
    if (!a) return notFound();
    const SEC = [
      ['what', '1. これは何か'], ['why', '2. なぜ気にする必要があるのか'], ['recommended', '3. 一般的におすすめされる方法'],
      ['howto', '4. 具体的なやり方'], ['tools', '5. 必要な道具・用品'], ['choose', '6. 道具・用品の選び方'],
      ['caution', '7. 注意点'], ['frequency', '8. 実施頻度'], ['maintain', '9. 維持・管理方法']
    ];
    const back = a.items && a.items[0] ? '#/item/' + a.items[0] : '#/articles';
    let html = header('記事', back) + '<article class="article"><h1>' + esc(a.title) + '</h1>' +
      '<div class="sub">' + articleBadge(a) + ' 分類：' + esc(D.reliabilityTypes[a.reliability] || '—') + ' · 最終確認日：' + esc(a.checkedAt || '未確認') + '</div>';
    if (a.status !== 'published') {
      html += '<div class="notice">この記事は<strong>下書き</strong>です。出典による裏付けと編集者の確認がまだ終わっていません。参考程度に読み、安全や健康に関わることは製品の説明書・公的機関・専門家の情報を優先してください。</div>';
    }
    SEC.forEach(([k, label]) => {
      const paras = (a.sections || {})[k] || [];
      if (!paras.length) return;
      html += '<h2>' + label + '</h2>' + paras.map(p => {
        const t = typeof p === 'string' ? { text: p } : p;
        return '<p>' + esc(t.text) + (t.basis ? ' <span class="basis b-' + t.basis + '">' + esc(D.reliabilityTypes[t.basis] || t.basis) + '</span>' : '') + '</p>';
      }).join('');
    });
    html += '<h2>10. 参考情報・出典</h2>';
    if (a.sources && a.sources.length) {
      html += '<ul class="sources">' + a.sources.map(s => '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.title) + '</a>' +
        '<div class="sub">' + esc(s.publisher || '') + ' · ' + esc(D.reliabilityTypes[s.type] || '') + ' · ' +
        (s.verified ? '✅ 内容の裏付けを確認済み（' + esc(s.checkedAt || '') + '）' : '⚠️ 裏付け未確認') + '</div></li>').join('') + '</ul>';
    } else {
      html += '<p class="sub">⚠️ 出典が未登録です。</p>';
    }
    if (a.history && a.history.length) {
      html += '<h2>更新履歴</h2><ul class="sources">' + a.history.map(h => '<li><span class="sub">' + esc(h.date) + '</span> ' + esc(h.note) + '</li>').join('') + '</ul>';
    }
    html += '</article>';
    return html;
  };

  views.status = function () {
    const total = allItems.reduce((a, it) => a + progress(it), 0) / allItems.length;
    const counts = [0, 0, 0, 0, 0, 0, 0];
    allItems.forEach(it => counts[statusOf(it.id)]++);
    const names = D.statusSets.habit.map(o => o.label);
    return header('自分の状態', '#/my') +
      '<div class="card">' + bar(total) + '<div class="sub">全体 ' + Math.round(total * 100) + '%</div>' +
      '<dl class="meta stats">' + counts.map((n, i) => '<div><dt>' + esc(names[i]) + '</dt><dd>' + n + '</dd></div>').join('') + '</dl></div>' +
      '<section><h2>カテゴリー別</h2><ul class="list">' + D.categories.map(c => '<li><a class="row" href="#/cat/' + c.id + '"><span class="ico">' + c.icon + '</span>' +
        '<div class="grow"><div>' + esc(c.name) + '</div>' + bar(catProgress(c)) + '</div><span class="sub">' + Math.round(catProgress(c) * 100) + '%</span><span class="chev">›</span></a></li>').join('') + '</ul></section>' +
      '<section><h2>気にする項目</h2>' + (Object.keys(S.focus).length ? '<ul class="list">' + allItems.filter(it => S.focus[it.id]).map(it =>
        '<li><a class="row" href="#/item/' + it.id + '"><div class="grow"><div>' + esc(it.name) + '</div><div class="sub">優先度 ' + ['', '高', '中', '低'][S.focus[it.id]] + ' · ' + esc(statusLabel(it)) + '</div></div><span class="chev">›</span></a></li>').join('') + '</ul>'
        : '<div class="empty">まだありません。</div>') + '</section>';
  };

  views.habits = function () {
    const groups = Object.keys(D.freqLabels);
    const act = S.habits.filter(h => h.active !== false);
    let html = header('習慣') + '<p class="lead">頻度は項目ごとに変更できます。完了すると次回予定が自動で計算されます。</p>' +
      '<div class="actions"><button class="btn primary" data-act="new-habit">＋ 習慣を追加</button></div>';
    groups.forEach(g => {
      const hs = act.filter(h => h.freq === g);
      if (!hs.length) return;
      html += '<section><h2>' + D.freqLabels[g] + '</h2><ul class="list">' + hs.map(h =>
        habitRow(h).replace('</li>', '<div class="right"><div class="sub">次回 ' + rel(habitNext(h)) + '</div><button class="link small" data-act="edit-habit" data-id="' + h.id + '">編集</button></div></li>')).join('') + '</ul></section>';
    });
    if (!act.length) html += '<div class="empty">習慣はまだありません。<br>項目の画面やおすすめから追加できます。</div>';
    return html;
  };

  function ownTabs(active) { return seg([['#/belongings', '持ち物'], ['#/maint', 'メンテナンス'], ['#/wish', '欲しいもの']], active); }

  views.belongings = function () {
    const groups = {};
    S.belongings.forEach(b => { (groups[b.cat || 'その他'] = groups[b.cat || 'その他'] || []).push(b); });
    let html = header('持ち物') + ownTabs('#/belongings') +
      '<div class="actions"><button class="btn primary" data-act="new-belonging">＋ 持ち物を登録</button></div>';
    Object.keys(groups).forEach(g => {
      html += '<section><h2>' + esc(g) + '</h2><ul class="list">' + groups[g].map(b => {
        const rd = replaceDate(b);
        return '<li><button class="row plain" data-act="edit-belonging" data-id="' + b.id + '">' +
          (b.photo ? '<img class="thumb" src="' + b.photo + '" alt="">' : '<span class="thumb ph">📦</span>') +
          '<div class="grow"><div>' + esc(b.name) + '</div><div class="sub">' + esc(b.condition || '') +
          (b.nextMaint ? ' · 手入れ ' + rel(b.nextMaint) : '') + (rd ? ' · 買い替え目安 ' + esc(rd.slice(0, 7)) : '') + '</div></div><span class="chev">›</span></button></li>';
      }).join('') + '</ul></section>';
    });
    if (!S.belongings.length) html += '<div class="empty">スキンケア用品・服・靴・メガネ・タオルなどを登録すると、手入れや買い替えの時期を管理できます。</div>';
    return html;
  };

  views.maint = function () {
    const t = today();
    const soon = addDays(t, 14);
    const m = S.belongings.filter(b => b.nextMaint).sort((a, b) => a.nextMaint.localeCompare(b.nextMaint));
    const r = S.belongings.filter(b => replaceDate(b)).sort((a, b) => replaceDate(a).localeCompare(replaceDate(b)));
    return header('メンテナンス') + ownTabs('#/maint') +
      '<section><h2>手入れ予定</h2>' + (m.length ? '<ul class="list">' + m.map(b =>
        '<li class="row"><button class="check" data-act="maint-done" data-id="' + b.id + '" aria-label="手入れした">🔧</button><div class="grow"><div>' + esc(b.name) + '</div>' +
        '<div class="sub">' + esc(b.care || '手入れ') + (b.maintInterval ? ' · ' + b.maintInterval + '日ごと' : '') + '</div></div>' +
        '<span class="' + (b.nextMaint <= t ? 'badge warn' : 'sub') + '">' + rel(b.nextMaint) + '</span></li>').join('') + '</ul>'
        : '<div class="empty">持ち物に「次回メンテナンス日」を設定すると表示されます。</div>') + '</section>' +
      '<section><h2>買い替え目安</h2>' + (r.length ? '<ul class="list">' + r.map(b => {
        const rd = replaceDate(b);
        return '<li class="row"><div class="grow"><div>' + esc(b.name) + '</div><div class="sub">購入 ' + esc(b.purchaseDate) + ' · 目安 ' + b.replaceMonths + 'か月</div></div>' +
          '<span class="' + (rd <= soon ? 'badge warn' : 'sub') + '">' + esc(rd) + '</span>' +
          '<button class="link small" data-act="to-wish" data-id="' + b.id + '">欲しいものへ</button></li>';
      }).join('') + '</ul>' : '<div class="empty">持ち物に購入日と買い替え目安を入れると表示されます。</div>') + '</section>';
  };

  views.wish = function () {
    const open = S.wishes.filter(w => !w.purchased).sort((a, b) => (a.priority || 2) - (b.priority || 2));
    const done = S.wishes.filter(w => w.purchased);
    const budget = open.reduce((a, w) => a + (Number(w.budget) || 0), 0);
    const spent = done.reduce((a, w) => a + (Number(w.price) || 0), 0);
    const row = w => '<li class="row"><button class="check ' + (w.purchased ? 'on' : '') + '" data-act="wish-bought" data-id="' + w.id + '">' + (w.purchased ? '✓' : '') + '</button>' +
      '<button class="grow plain left" data-act="edit-wish" data-id="' + w.id + '"><div>' + esc(w.name) + (w.replace ? ' ' + badge('買い替え') : '') + '</div>' +
      '<div class="sub">優先度 ' + ['', '高', '中', '低'][w.priority || 2] + ' · 予算 ' + yen(w.budget) + (w.plannedDate ? ' · ' + esc(w.plannedDate) + '予定' : '') +
      (w.purchased ? ' · 購入 ' + yen(w.price) : '') + '</div></button></li>';
    return header('欲しいもの') + ownTabs('#/wish') +
      '<div class="card"><dl class="meta"><div><dt>未購入の予算合計</dt><dd>' + yen(budget) + '</dd></div><div><dt>購入済み合計</dt><dd>' + yen(spent) + '</dd></div></dl>' +
      '<p class="sub">すぐ買わずにリストに入れて時間を置くと、衝動買いの防止になります。</p></div>' +
      '<div class="actions"><button class="btn primary" data-act="new-wish">＋ 欲しいものを追加</button></div>' +
      '<section><h2>購入予定</h2>' + (open.length ? '<ul class="list">' + open.map(row).join('') + '</ul>' : '<div class="empty">まだありません。</div>') + '</section>' +
      (done.length ? '<section><h2>購入済み</h2><ul class="list">' + done.map(row).join('') + '</ul></section>' : '');
  };

  views.my = function () {
    const total = allItems.reduce((a, it) => a + progress(it), 0) / allItems.length;
    let size = 0;
    try { size = (localStorage.getItem(STORE_KEY) || '').length; } catch (e) { }
    return header('マイページ') +
      '<div class="card"><div class="sub">目標</div><strong>' + esc(S.goal || '未設定') + '</strong>' +
      '<div class="actions"><button class="btn" data-act="edit-goal">目標を設定</button></div></div>' +
      '<div class="card">' + bar(total) + '<dl class="meta"><div><dt>全体</dt><dd>' + Math.round(total * 100) + '%</dd></div>' +
      '<div><dt>習慣</dt><dd>' + S.habits.filter(h => h.active !== false).length + '</dd></div><div><dt>持ち物</dt><dd>' + S.belongings.length + '</dd></div>' +
      '<div><dt>欲しいもの</dt><dd>' + S.wishes.filter(w => !w.purchased).length + '</dd></div></dl></div>' +
      '<ul class="list">' +
      '<li><a class="row" href="#/status"><span class="ico">📊</span><div class="grow">自分の状態</div><span class="chev">›</span></a></li>' +
      '<li><a class="row" href="#/suggest"><span class="ico">💡</span><div class="grow">おすすめ一覧</div><span class="chev">›</span></a></li>' +
      '<li><a class="row" href="#/about"><span class="ico">ℹ️</span><div class="grow">このアプリと情報の信頼性について</div><span class="chev">›</span></a></li>' +
      '</ul>' +
      '<section><h2>データ（この端末にだけ保存）</h2><div class="card"><p class="sub">データはこのiPhoneのブラウザ内に保存され、外部には送信されません。機種変更やブラウザのデータ削除に備えて、ときどきバックアップしてください。使用量 約' + Math.ceil(size / 1024) + 'KB</p>' +
      '<div class="actions wrap"><button class="btn" data-act="export">バックアップを書き出す</button>' +
      '<label class="btn">バックアップから復元<input type="file" accept="application/json,.json" data-act="import" hidden></label>' +
      '<button class="btn danger" data-act="reset">すべて消去</button></div></div></section>' +
      '<p class="sub center">v' + esc(window.SAITEIGEN_VERSION || '') + '</p>';
  };

  views.about = function () {
    return header('このアプリについて', '#/my') + '<article class="article">' +
      '<p>大人として生活していくうえで、知っておきたいこと・気にしたいこと・できるようになりたいことを一か所に集約するアプリです。</p>' +
      '<h2>大切にしていること</h2><p>・知っていて当然という前提を置きません。<br>・個性を否定せず、判断材料と改善の観点を提供します。<br>・流行や好みは「必須」ではありません。</p>' +
      '<h2>情報の信頼性</h2><p>記事には出典・最終確認日・更新履歴を付けます。本文の各段落には、根拠の種類（公的情報・専門家の推奨・一般的な慣習・個人の好み など）を表示します。</p>' +
      '<p>出典の確認が終わっていない記事は「下書き・出典確認前」と表示されます。正しい情報を用意できない項目には、無理に答えを作りません。</p>' +
      '<p>このアプリは医学的な診断や、外見・人格についての断定を行いません。体調や肌の不調が続く場合は医療機関に相談してください。</p>' +
      '<h2>情報の分類</h2><ul class="sources">' + Object.keys(D.reliabilityTypes).map(k => '<li><span class="basis b-' + k + '">' + esc(D.reliabilityTypes[k]) + '</span></li>').join('') + '</ul>' +
      '</article>';
  };

  function notFound() { return header('見つかりません', '#/home') + '<div class="empty">ページが見つかりませんでした。</div>'; }

  // ---------- フォーム ----------
  function field(label, name, value, type, extra) {
    return '<label class="field"><span>' + esc(label) + '</span><input name="' + name + '" type="' + (type || 'text') + '" value="' + esc(value == null ? '' : value) + '" ' + (extra || '') + '></label>';
  }
  function select(label, name, value, opts) {
    return '<label class="field"><span>' + esc(label) + '</span><select name="' + name + '">' +
      opts.map(([v, t]) => '<option value="' + esc(v) + '"' + (String(v) === String(value) ? ' selected' : '') + '>' + esc(t) + '</option>').join('') + '</select></label>';
  }
  function textarea(label, name, value) {
    return '<label class="field"><span>' + esc(label) + '</span><textarea name="' + name + '" rows="3">' + esc(value || '') + '</textarea></label>';
  }
  const freqOpts = () => Object.keys(D.freqLabels).map(k => [k, D.freqLabels[k]]);
  const prioOpts = [[1, '高'], [2, '中'], [3, '低']];

  function habitForm(h, itemId) {
    h = h || { name: '', freq: 'daily', interval: '', itemId: itemId || '' };
    const itemOpts = [['', '（なし）']].concat(allItems.map(it => [it.id, catMap[it.cat].no + ' ' + it.name]));
    openSheet(h.id ? '習慣を編集' : '習慣を追加',
      field('やること', 'name', h.name, 'text', 'required placeholder="例：洗顔"') +
      select('頻度', 'freq', h.freq, freqOpts()) +
      field('間隔（日）※空欄なら頻度の標準', 'interval', h.id && h.interval !== D.freqDays[h.freq] ? h.interval : '', 'number', 'min="1" inputmode="numeric"') +
      select('関連する項目', 'itemId', h.itemId || '', itemOpts) +
      (h.id ? '<button type="button" class="btn danger full" data-act="del-habit" data-id="' + h.id + '">この習慣を削除</button>' : ''),
      d => {
        if (!d.name) { toast('やることを入力してください'); return false; }
        const interval = Number(d.interval) || D.freqDays[d.freq];
        if (h.id) Object.assign(h, { name: d.name, freq: d.freq, interval, itemId: d.itemId || null });
        else S.habits.push({ id: uid(), name: d.name, freq: d.freq, interval, itemId: d.itemId || null, last: null, log: [], createdAt: today(), active: true });
        if (d.itemId) raiseStatus(d.itemId, 3);
        save(); toast('保存しました');
      });
  }

  function belongingForm(b) {
    b = b || {};
    const cats = ['スキンケア用品', '洋服', '靴', 'カバン', 'メガネ', 'タオル', '寝具', '日用品', 'その他'];
    openSheet(b.id ? '持ち物を編集' : '持ち物を登録',
      '<div class="photo-field">' + (b.photo ? '<img class="photo" src="' + b.photo + '" alt="">' : '') +
      '<label class="btn">📷 写真を' + (b.photo ? '変更' : '追加') + '<input type="file" name="photo" accept="image/*" hidden></label>' +
      (b.photo ? '<label class="small"><input type="checkbox" name="removePhoto" value="1"> 写真を削除</label>' : '') + '</div>' +
      field('アイテム名', 'name', b.name, 'text', 'required') +
      select('カテゴリー', 'cat', b.cat || 'その他', cats.map(c => [c, c])) +
      field('購入日', 'purchaseDate', b.purchaseDate, 'date') +
      field('購入金額（円）', 'price', b.price, 'number', 'inputmode="numeric"') +
      select('使用頻度', 'usage', b.usage || '', [['', '—'], ['毎日', '毎日'], ['週数回', '週数回'], ['ときどき', 'ときどき'], ['季節もの', '季節もの']]) +
      select('現在の状態', 'condition', b.condition || '', [['', '—'], ['良好', '良好'], ['使用感あり', '使用感あり'], ['傷みあり', '傷みあり'], ['要買い替え', '要買い替え']]) +
      textarea('手入れ方法', 'care', b.care) +
      field('買い替え目安（か月）', 'replaceMonths', b.replaceMonths, 'number', 'min="1" inputmode="numeric"') +
      field('次回メンテナンス日', 'nextMaint', b.nextMaint, 'date') +
      field('メンテナンス間隔（日）※完了時に次回を自動設定', 'maintInterval', b.maintInterval, 'number', 'min="1" inputmode="numeric"') +
      (b.id ? '<button type="button" class="btn danger full" data-act="del-belonging" data-id="' + b.id + '">この持ち物を削除</button>' : ''),
      async (d, form) => {
        if (!d.name) { toast('アイテム名を入力してください'); return false; }
        const file = form.querySelector('input[name=photo]').files[0];
        let photo = b.photo || null;
        if (d.removePhoto) photo = null;
        if (file) photo = await resizeImage(file, 480);
        const rec = {
          name: d.name, cat: d.cat, purchaseDate: d.purchaseDate || null, price: d.price ? Number(d.price) : null,
          usage: d.usage, condition: d.condition, care: d.care, replaceMonths: d.replaceMonths ? Number(d.replaceMonths) : null,
          nextMaint: d.nextMaint || null, maintInterval: d.maintInterval ? Number(d.maintInterval) : null, photo
        };
        if (b.id) Object.assign(b, rec); else S.belongings.push(Object.assign({ id: uid(), createdAt: today() }, rec));
        save(); toast('保存しました');
      });
  }

  function wishForm(w) {
    w = w || { priority: 2 };
    openSheet(w.id ? '欲しいものを編集' : '欲しいものを追加',
      field('名前', 'name', w.name, 'text', 'required placeholder="例：眉用ハサミ"') +
      select('優先度', 'priority', w.priority || 2, prioOpts) +
      field('予算（円）', 'budget', w.budget, 'number', 'inputmode="numeric"') +
      field('購入予定時期', 'plannedDate', w.plannedDate, 'month') +
      field('購入金額（円）', 'price', w.price, 'number', 'inputmode="numeric"') +
      textarea('メモ（選ぶ条件など）', 'note', w.note) +
      (w.id ? '<button type="button" class="btn danger full" data-act="del-wish" data-id="' + w.id + '">削除</button>' : ''),
      d => {
        if (!d.name) { toast('名前を入力してください'); return false; }
        const rec = { name: d.name, priority: Number(d.priority) || 2, budget: d.budget ? Number(d.budget) : null, plannedDate: d.plannedDate || null, price: d.price ? Number(d.price) : null, note: d.note };
        if (w.id) Object.assign(w, rec); else S.wishes.push(Object.assign({ id: uid(), purchased: false, createdAt: today() }, rec));
        save(); toast('保存しました');
      });
  }

  function resizeImage(file, max) {
    return new Promise(resolve => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const r = Math.min(1, max / Math.max(img.width, img.height));
        const cv = document.createElement('canvas');
        cv.width = Math.round(img.width * r); cv.height = Math.round(img.height * r);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        URL.revokeObjectURL(url);
        resolve(cv.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
  }

  // ---------- バックアップ ----------
  async function exportData() {
    const json = JSON.stringify(Object.assign({ exportedAt: new Date().toISOString() }, S), null, 1);
    const name = 'saiteigen-backup-' + today() + '.json';
    const file = new File([json], name, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: name }); return; } catch (e) { if (e.name === 'AbortError') return; }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }
  function importData(file) {
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const obj = JSON.parse(fr.result);
        if (!obj || typeof obj !== 'object' || !obj.status) throw new Error('形式が違います');
        if (!confirm('現在のデータを、バックアップの内容で置き換えます。よろしいですか？')) return;
        delete obj.exportedAt;
        S = Object.assign(blank(), obj);
        save(); render(); toast('復元しました');
      } catch (e) { toast('読み込めませんでした：' + e.message); }
    };
    fr.readAsText(file);
  }

  // ---------- イベント ----------
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (!el || el.tagName === 'INPUT') return;
    const act = el.dataset.act;
    const id = el.dataset.id;
    const H = () => S.habits.find(h => h.id === id);
    const B = () => S.belongings.find(b => b.id === id);
    const W = () => S.wishes.find(w => w.id === id);
    switch (act) {
      case 'close-sheet': closeSheet(); return;
      case 'onboarded': S.onboarded = true; break;
      case 'status': setStatus(id, Number(el.dataset.v)); S.onboarded = true; break;
      case 'check': {
        const arr = S.checks[id] = S.checks[id] || [];
        const i = Number(el.dataset.i);
        arr[i] = !arr[i];
        if (arr[i]) raiseStatus(id, 1);
        break;
      }
      case 'focus': S.focus[id] = S.focus[id] ? (S.focus[id] % 3) + 1 : 1; break;
      case 'focus-off': delete S.focus[id]; break;
      case 'adopt': adopt(id); render(); return;
      case 'dismiss': S.suggestion[id] = 'dismissed'; toast('「今はしない」にしました'); break;
      case 'undecide': delete S.suggestion[id]; break;
      case 'habit-done': { const h = H(); if (h) { doneHabit(h); if (habitDoneToday(h)) toast('おつかれさまです'); } render(); return; }
      case 'add-tpl': {
        const t = itemMap[id].tasks[Number(el.dataset.i)];
        addHabit(t.name, t.freq, id, t.interval); raiseStatus(id, 3); toast('習慣に追加しました'); break;
      }
      case 'new-habit': habitForm(null, id); return;
      case 'edit-habit': habitForm(H()); return;
      case 'del-habit': if (confirm('この習慣を削除しますか？')) { S.habits = S.habits.filter(h => h.id !== id); save(); closeSheet(); render(); } return;
      case 'practice': {
        const note = prompt('実践したことのメモ（任意）', '');
        if (note === null) return;
        S.practiceLog.push({ id, date: today(), note });
        raiseStatus(id, 4); toast('記録しました'); break;
      }
      case 'new-belonging': belongingForm(); return;
      case 'edit-belonging': belongingForm(B()); return;
      case 'del-belonging': if (confirm('削除しますか？')) { S.belongings = S.belongings.filter(b => b.id !== id); save(); closeSheet(); render(); } return;
      case 'maint-done': {
        const b = B(); if (!b) return;
        b.lastMaint = today();
        b.nextMaint = b.maintInterval ? addDays(today(), b.maintInterval) : null;
        toast(b.nextMaint ? '次回は ' + fmtDate(b.nextMaint) : '手入れを記録しました'); break;
      }
      case 'to-wish': {
        const b = B(); if (!b) return;
        S.wishes.push({ id: uid(), name: b.name + '（買い替え）', priority: 2, budget: b.price || null, replace: true, purchased: false, createdAt: today() });
        toast('欲しいものに追加しました'); break;
      }
      case 'new-wish': wishForm(); return;
      case 'edit-wish': wishForm(W()); return;
      case 'del-wish': if (confirm('削除しますか？')) { S.wishes = S.wishes.filter(w => w.id !== id); save(); closeSheet(); render(); } return;
      case 'wish-bought': {
        const w = W(); if (!w) return;
        w.purchased = !w.purchased;
        w.purchasedAt = w.purchased ? today() : null;
        if (w.purchased) {
          save();
          if (confirm('購入済みにしました。持ち物にも登録しますか？')) {
            S.belongings.push({ id: uid(), name: w.name.replace('（買い替え）', ''), cat: 'その他', purchaseDate: today(), price: w.price || w.budget || null, createdAt: today() });
            toast('持ち物に登録しました');
          }
        }
        break;
      }
      case 'edit-goal': {
        openSheet('目標', textarea('どうなりたいか', 'goal', S.goal), d => { S.goal = d.goal; save(); });
        return;
      }
      case 'export': exportData(); return;
      case 'reset':
        if (confirm('すべての記録を消去します。元に戻せません。よろしいですか？') && confirm('本当に消去しますか？')) { S = blank(); save(); location.hash = '#/home'; toast('消去しました'); }
        render(); return;
      default: return;
    }
    save(); render();
  });
  document.addEventListener('change', e => {
    if (e.target.dataset && e.target.dataset.act === 'import' && e.target.files[0]) importData(e.target.files[0]);
  });
  document.addEventListener('submit', e => {
    if (e.target.hasAttribute('data-search')) {
      e.preventDefault();
      const q = e.target.q.value;
      location.hash = '#/learn' + (q ? '?q=' + encodeURIComponent(q) : '');
    }
  });

  // ---------- ルーター ----------
  let lastRoute = '';
  function render() {
    const hash = location.hash || '#/home';
    const [path, query] = hash.slice(2).split('?');
    const [name, arg] = path.split('/');
    const params = new URLSearchParams(query || '');
    const fn = views[name] || views.home;
    const y = window.scrollY;
    $app.innerHTML = fn(name === 'learn' ? params.get('q') : arg);
    const tab = { home: 'home', suggest: 'home', learn: 'learn', articles: 'learn', cat: 'learn', item: 'learn', article: 'learn',
      habits: 'habits', belongings: 'own', maint: 'own', wish: 'own', my: 'my', status: 'my', about: 'my' }[name] || 'home';
    document.querySelectorAll('.tabbar a').forEach(a => a.classList.toggle('on', a.dataset.tab === tab));
    if (hash !== lastRoute) window.scrollTo(0, 0); else window.scrollTo(0, y);
    lastRoute = hash;
  }
  window.addEventListener('hashchange', render);
  render();

  // 日付が変わったら再描画（ホーム画面アプリを開きっぱなしにした場合）
  let renderedDay = today();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && today() !== renderedDay) { renderedDay = today(); render(); }
  });

  // 保存できない環境（ファイルから開いた場合など）では最初に知らせる
  try { localStorage.setItem('saiteigen.test', '1'); localStorage.removeItem('saiteigen.test'); }
  catch (e) { setTimeout(() => toast('この開き方では記録を保存できません。Safariで開くか、バックアップを使ってください。'), 600); }

  // ---------- オフライン対応 ----------
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(e => console.warn('SW', e));
  }
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => { });
})();
