# CLAUDE.md

## プロジェクト
「さいていげん」: 大人の身だしなみ・生活力向上アプリ。ビルド不要の静的PWA（iPhoneだけで開発・利用）。
詳細は README.md。

## ブランチ・デプロイ（重要）
- **変更は、指示がない限り `main` に反映する**（GitHub Pages は `main` の `/ (root)` から公開）。
- 作業ブランチは `claude/friendly-rubin-mkbiiv`。コミット・プッシュ後、`git push origin claude/friendly-rubin-mkbiiv:main` で main に反映する。
- ユーザーが「mainに入れないで」等と明示したときだけ反映しない。
- PRは、ユーザーが頼んだときだけ作る。

## 更新時のルール
- 公開済みの変更をアプリに届けるため、`sw.js` の `VERSION` と `index.html` の `SAITEIGEN_VERSION` を上げる。
- `js/` `css/` `index.html` を変えたら `node tools/build-single.js` で `dist/saiteigen.html` を作り直し、一緒にコミットする。
- 項目の `id`（`js/data.js`）とカードの `id`（`js/map.js`）は利用者の記録と紐付くため、変更・再利用しない。

## コンテンツの方針
- 記事・カードの本文は下書き。出典を確認し、主張を裏付けると確かめるまで `status: 'draft'` のままにする（AI生成文をそのまま確定扱いにしない）。
- 事実・専門家の推奨・慣習・好みを区別して書く。医学的診断や人格の断定はしない。
- 根拠が用意できない項目には、無理に答えを作らない。

## 確認方法
- `python3 -m http.server 8765` で起動し、Playwright（iPhoneサイズ）で動作確認する。
- 記録は端末の localStorage（キー `saiteigen.v1`）に保存され、外部には送らない。
