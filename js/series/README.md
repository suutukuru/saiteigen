# シリーズ（シーン）

「スマートな人が自然にやっていること」を、テーマごとのシリーズとしてまとめる置き場です。
**ファイルを1つ足して `index.html` と `sw.js` に読み込み行を足すだけで、新しいシリーズが「シーン」タブに出ます。**

| ファイル | シリーズ |
| --- | --- |
| `prep.js` | 事前準備（2件探す・近くを探す・予約するか・旅程の立て方・幹事） |
| `kizukai.js` | 気づかいのさじ加減（足りない↔やりすぎ：空腹・疲れ・弱者扱い・荷物・丁寧すぎ・ツッコミ・席・ピッチャー） |

トラブル対処（`js/trouble.js`）と判断のコツ（`js/judge.js`）も「シーン」タブから開けます。

## 形式

```js
(window.SAITEIGEN_SERIES = window.SAITEIGEN_SERIES || []).push({
  id: 'prep', name: '事前準備', icon: '🧭', origin: 'ai', desc: '説明',
  // 表示する欄：[キー, 見出し, 表示形式(text/ol/ul/bubble), CSSクラス(任意)]
  fields: [['why', 'なぜ', 'text'], ['steps', '✅ やること', 'ol', 'tr-now']],
  groups: [{ id: 'date', name: 'デート', icon: '💑' }],
  items: [
    { id: 'pr-xxx', group: 'date', title: 'タイトル', why: '...', steps: ['...'],
      // 関連リンク（任意）：prep / kizukai / trouble / judge / card に各 id
      trouble: 't-full' }
  ]
});
```

- `id` は自分メモ（端末内）と紐付くので変更しない。すべてのシリーズ・トラブルで重複させない
- 本文は AI仮情報（`origin: 'ai'`）。人が確認したら `origin: 'verified'`
