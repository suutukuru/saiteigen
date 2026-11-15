// 単一HTML版を作る: node tools/build-single.js
// CSS・JS・アイコンをすべて埋め込み、dist/saiteigen.html 1ファイルだけで動くようにします。
// （iPhoneの「ファイル」アプリ等からローカルで開く用。公開用の複数ファイル版とは別物）
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const rd = p => fs.readFileSync(path.join(root, p), 'utf8');
let html = rd('index.html');
const icon = 'data:image/svg+xml;base64,' + fs.readFileSync(path.join(root, 'icons/icon.svg')).toString('base64');
const touch = 'data:image/png;base64,' + fs.readFileSync(path.join(root, 'icons/apple-touch-icon.png')).toString('base64');
html = html
  .replace(/<link rel="manifest"[^>]*>\n?/, '')
  .replace('href="icons/icon.svg"', 'href="' + icon + '"')
  .replace('href="icons/apple-touch-icon.png"', 'href="' + touch + '"')
  .replace(/<link rel="stylesheet" href="css\/style.css">/, () => '<style>\n' + rd('css/style.css') + '\n</style>')
  .replace(/<script src="(js\/[^"]+)"><\/script>/g, (_, p) => '<script>\n' + rd(p).replace(/<\/script>/gi, '<\\/script>') + '\n</script>');
fs.writeFileSync(path.join(root, 'dist/saiteigen.html'), html);
console.log('dist/saiteigen.html', Math.round(html.length / 1024) + 'KB');
