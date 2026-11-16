/*
 * カテゴリー・項目データ
 * ------------------------------------------------------------
 * iPhone の GitHub アプリ / Safari からでも編集しやすいよう、
 * ビルド不要のプレーンな JavaScript で書いています。
 *
 * 【重要】項目の id は利用者の記録（ステータス・チェック）と紐付いています。
 *        一度公開した id は変更・再利用しないでください。
 *
 * 項目のフィールド
 *   id        : 一意のID（変更禁止）
 *   name      : 項目名
 *   kind      : 'habit'(習慣) / 'knowledge'(知識) / 'item'(持ち物) / 'behavior'(振る舞い)
 *               省略時はカテゴリーの kind を使用
 *   viewpoint : アプリから提示する「気にするとよい観点」
 *   checks    : 自己チェック項目（文字列の配列）
 *   suggest   : おすすめ提案 { text, reason, priority(1高〜3低), effect, cost, time }
 *   tasks     : 実践タスクのひな型 [{ name, freq }]  freq = daily/weekly/monthly/seasonal/irregular
 *   articles  : 紐付く知識コンテンツの id 配列（js/content.js）
 */

window.SAITEIGEN_DATA = (function () {
  const I = (id, name, extra) => Object.assign({ id, name }, extra || {});

  const categories = [
    {
      id: 'c01', no: '01', name: '美容・身だしなみ', icon: '🪞', important: true, kind: 'habit',
      description: '眉毛・肌・髪・口元など、見た目の清潔感の土台。',
      items: [
        I('brow', '眉毛の整え方・形・手入れ頻度', {
          viewpoint: '眉毛が伸びっぱなしになっていないか',
          checks: [
            '眉毛を整える必要があることを知っている',
            '眉毛の整え方を知っている',
            '自分の眉毛の状態を鏡で確認した',
            '眉毛を整えた（自分で／サロンで）',
            '定期的に整えている'
          ],
          suggest: {
            text: 'まず眉毛の基本（整える理由・整え方）を学ぶ',
            reason: '眉毛は顔の印象に影響しやすい一方、手入れの有無に自分では気づきにくい部分です。',
            priority: 1, effect: '顔まわりの清潔感が出やすい', cost: '0〜数千円（道具／サロン）', time: '学習10分・手入れ10〜15分'
          },
          tasks: [{ name: '眉毛の状態を確認・手入れ', freq: 'irregular', interval: 14 }],
          articles: ['a-brow']
        }),
        I('brow-salon', '眉毛サロン', { kind: 'knowledge', viewpoint: '自分で整えるのが不安なら、プロに任せる選択肢を知っているか', articles: ['a-brow'] }),
        I('skincare', 'スキンケア（基本）', {
          viewpoint: '洗顔・保湿・紫外線対策ができているか',
          checks: [
            '洗顔をしている',
            '保湿をしている',
            '日焼け止めを使用している',
            '自分の肌質を理解している',
            '肌の状態に合った用品を使っている'
          ],
          suggest: {
            text: 'スキンケアの基本（洗顔・保湿・紫外線対策）を確認する',
            reason: '保湿や紫外線対策は肌の乾燥や日焼けへの基本的な対策として広く案内されています。',
            priority: 1, effect: '乾燥・肌荒れの予防', cost: '数百〜数千円／月', time: '1日数分'
          },
          tasks: [{ name: '洗顔', freq: 'daily' }, { name: '保湿', freq: 'daily' }],
          articles: ['a-skincare']
        }),
        I('face-wash', '洗顔', { viewpoint: '洗いすぎ・すすぎ残しがないか', tasks: [{ name: '洗顔', freq: 'daily' }], articles: ['a-skincare'] }),
        I('lotion', '化粧水・乳液・美容液', { kind: 'knowledge', viewpoint: 'それぞれの役割の違いを理解しているか', articles: ['a-skincare'] }),
        I('moisture', '保湿', { viewpoint: '洗顔後や入浴後に保湿しているか', tasks: [{ name: '保湿', freq: 'daily' }], articles: ['a-skincare'] }),
        I('sunscreen', '日焼け止め', { viewpoint: '季節や外出時間に応じて紫外線対策をしているか', articles: ['a-skincare'] }),
        I('acne', 'ニキビ・毛穴・肌荒れ', { kind: 'knowledge', viewpoint: '自己判断で悪化させていないか。続く場合は皮膚科を検討しているか' }),
        I('hair', '髪型・ヘアスタイル', { viewpoint: '自分に合った髪型になっているか。伸びすぎていないか' }),
        I('salon', '美容院の選び方・オーダー方法', { kind: 'knowledge', viewpoint: 'なりたい髪型を写真などで伝えられるか', tasks: [{ name: '美容院に行く', freq: 'irregular', interval: 45 }] }),
        I('styling', 'ワックス・ジェル・バーム', { kind: 'knowledge', viewpoint: '髪質や仕上がりに合ったスタイリング剤を選べているか' }),
        I('dryer', 'ドライヤー・ヘアセット', { viewpoint: '洗髪後に自然乾燥のまま放置していないか' }),
        I('beard', '髭の手入れ', { viewpoint: '剃り残し・伸ばしっぱなしになっていないか', tasks: [{ name: '髭の手入れ', freq: 'daily' }] }),
        I('nose-hair', '鼻毛・耳毛', { viewpoint: '鼻毛が見えていないか', tasks: [{ name: '鼻毛・耳毛の確認', freq: 'weekly' }] }),
        I('nail', '爪の手入れ', { viewpoint: '爪が伸びすぎていないか・汚れが溜まっていないか', tasks: [{ name: '爪の確認・手入れ', freq: 'weekly' }] }),
        I('teeth', '歯磨き・フロス', {
          viewpoint: '歯と歯の間まで磨けているか',
          checks: ['1日2回以上歯を磨いている', 'フロスや歯間ブラシを使っている', '定期的に歯科検診を受けている'],
          tasks: [{ name: '歯磨き', freq: 'daily' }, { name: 'フロス・歯間ブラシ', freq: 'daily' }, { name: '歯科検診', freq: 'irregular', interval: 180 }]
        }),
        I('oral', '口腔ケア', { viewpoint: '舌や歯ぐきのケアもできているか' }),
        I('lip', 'リップケア', { viewpoint: '唇が乾燥・ひび割れしていないか' }),
        I('body-hair', '体毛の処理', { viewpoint: '服装や場面に応じて気になる体毛がないか（必須ではない）' }),
        I('contact', 'コンタクトレンズ', { kind: 'knowledge', viewpoint: '装用時間・交換期限・ケア方法を守れているか' })
      ]
    },
    {
      id: 'c02', no: '02', name: '匂い・清潔感', icon: '🫧', important: true, kind: 'habit',
      description: '自分では気づきにくい匂いの問題と、清潔感の維持。',
      items: [
        I('body-odor', '体臭', {
          viewpoint: '体臭・口臭・衣類臭に気を配れているか',
          checks: ['毎日入浴・シャワーをしている', '汗をかいたら着替えや拭き取りをしている', '同じ服を洗わずに続けて着ていない'],
          suggest: { text: '体臭の主な原因と基本対策を確認する', reason: '匂いは自分で気づきにくく、人から指摘されにくい項目です。', priority: 1, effect: '清潔感の維持', cost: '0円〜', time: '日常の範囲' }
        }),
        I('sweat', '汗', { viewpoint: '汗をかいたまま放置していないか' }),
        I('scalp', '頭皮の匂い', { viewpoint: '頭皮まで洗えているか・すすぎ残しはないか' }),
        I('breath', '口臭', {
          viewpoint: '口臭を自分で確認する方法を知っているか',
          checks: ['舌の汚れを確認している', '歯間ケアをしている', '口の乾燥に気をつけている'],
          suggest: { text: '口臭の主な原因（歯垢・舌苔・乾燥など）を知る', reason: '口臭は自覚しにくく、会話の印象に影響しやすいため。', priority: 1, effect: '会話時の安心感', cost: '数百円〜（歯間ブラシ等）', time: '1日数分' }
        }),
        I('cloth-odor', '衣類の臭い', {
          viewpoint: '洗濯した服から嫌な臭いがしていないか',
          checks: ['洗濯物を溜め込みすぎていない', '洗濯後すぐに干している', '洗濯槽を定期的に掃除している'],
          suggest: { text: '衣類の臭い対策（洗濯・乾燥・保管）を確認する', reason: '衣類の臭いは自分の鼻が慣れて気づきにくいため。', priority: 1, effect: '衣類臭の予防', cost: '数百円〜', time: '洗濯時' },
          articles: ['a-namagawaki']
        }),
        I('namagawaki', '生乾き臭', { viewpoint: '洗濯物を早く乾かす工夫をしているか', articles: ['a-namagawaki'] }),
        I('shoe-odor', '靴の臭い', { viewpoint: '同じ靴を毎日履き続けていないか' }),
        I('deodorant', '制汗剤・デオドラント', { kind: 'knowledge', viewpoint: '目的（汗を抑える／臭いを抑える）に合わせて選べているか' }),
        I('perfume', '香水', { kind: 'knowledge', viewpoint: 'つけすぎていないか・場面に合っているか（使わない選択も可）' }),
        I('softener', '柔軟剤', { kind: 'knowledge', viewpoint: '香りが強すぎて周囲の負担になっていないか' }),
        I('air-freshener', '部屋の芳香剤', { kind: 'knowledge', viewpoint: '臭いの原因を取り除かずに香りでごまかしていないか' }),
        I('diffuser', 'リードディフューザー', { kind: 'item', viewpoint: '置き場所と香りの強さが適切か' }),
        I('bedding-odor', '寝具・タオルの臭い', { viewpoint: 'タオルやシーツを定期的に洗濯・交換しているか', tasks: [{ name: 'シーツ・枕カバーの洗濯', freq: 'weekly' }] }),
        I('ventilation', '換気', { viewpoint: '部屋の空気がこもっていないか', tasks: [{ name: '部屋の換気', freq: 'daily' }] }),
        I('cleanliness', '清潔感の維持', { viewpoint: '清潔感を構成する要素（髪・肌・服・匂い・爪）を把握しているか' })
      ]
    },
    {
      id: 'c03', no: '03', name: 'ファッション・服装', icon: '👕', kind: 'knowledge',
      description: '流行よりもまず、サイズ感と清潔感。',
      items: [
        I('choose-clothes', '服の選び方', { viewpoint: '目的（仕事・休日など）に合う服を選べているか' }),
        I('size', 'サイズ感', {
          viewpoint: 'サイズ感や清潔感に問題がないか',
          checks: ['肩の位置が合っている', '袖・裾の長さが合っている', '大きすぎ・小さすぎの服を着ていない'],
          suggest: { text: '手持ちの服のサイズ感を確認する', reason: 'サイズが合っているかは、流行に関係なく見た目の印象に関わりやすいとされます。', priority: 2, effect: '服の印象が整う', cost: '0円（確認のみ）', time: '15分' }
        }),
        I('silhouette', 'シルエット', { viewpoint: '上下のバランスを意識しているか' }),
        I('color', '色の組み合わせ', { viewpoint: '色数を絞って組み合わせられているか' }),
        I('coordinate', 'コーディネート', { viewpoint: '手持ちの服で組み合わせのパターンを持っているか' }),
        I('season-clothes', '季節ごとの服装', { viewpoint: '気温や季節に合った服装か' }),
        I('tpo', 'TPO', { viewpoint: '場面にふさわしい服装を判断できるか' }),
        I('trend', 'トレンド', { viewpoint: '流行は「好み」であり必須ではないと理解しているか' }),
        I('inner', 'インナー・下着', { kind: 'item', viewpoint: '透け・ヨレ・黄ばみがないか' }),
        I('socks', '靴下', { kind: 'item', viewpoint: '穴やゴムの伸びがないか' }),
        I('accessory', 'アクセサリー', { viewpoint: 'つけすぎていないか（つけない選択も可）' }),
        I('belt-wallet', 'ベルト・財布', { kind: 'item', viewpoint: '傷みすぎていないか・服装と合っているか' })
      ]
    },
    {
      id: 'c04', no: '04', name: 'メガネ・カバン・持ち物', icon: '👓', kind: 'item',
      description: '毎日使うものほど、印象と使い勝手に効く。',
      items: [
        I('glasses-type', 'メガネの種類・形状', { kind: 'knowledge', viewpoint: '顔や髪型に合った形を選べているか' }),
        I('glasses-face', '顔型との相性', { kind: 'knowledge', viewpoint: '顔幅とフレーム幅が合っているか' }),
        I('glasses-frame', 'フレームの太さ・サイズ', { kind: 'knowledge', viewpoint: 'フレームの存在感が強すぎないか' }),
        I('glasses-care', 'メガネの手入れ', { kind: 'habit', viewpoint: 'レンズの汚れ・フレームの歪みがないか', tasks: [{ name: 'メガネの洗浄', freq: 'weekly' }] }),
        I('glasses-contact', 'コンタクトとの使い分け', { kind: 'knowledge', viewpoint: '場面に応じた使い分けができているか' }),
        I('bag-type', 'カバンの種類', { kind: 'knowledge', viewpoint: '用途に合ったカバンを持っているか' }),
        I('bag-style', 'トート・ショルダー・リュック', { kind: 'knowledge', viewpoint: '服装や場面とカバンの種類が合っているか' }),
        I('bag-size', 'カバンのサイズ・用途', { kind: 'knowledge', viewpoint: '荷物量に対して大きすぎ・小さすぎないか' }),
        I('wallet', '財布', { viewpoint: 'レシートやカードで膨らんでいないか', tasks: [{ name: '財布の中身を整理', freq: 'weekly' }] }),
        I('handkerchief', 'ハンカチ・ティッシュ', { viewpoint: '外出時に持ち歩いているか' }),
        I('small-items', '小物', { viewpoint: '必要な小物を把握しているか' }),
        I('bag-organize', 'バッグ内の整理', { kind: 'habit', viewpoint: 'カバンの中が散らかっていないか', tasks: [{ name: 'カバンの中身を整理', freq: 'monthly' }] })
      ]
    },
    {
      id: 'c05', no: '05', name: '洗濯・衣類管理', icon: '🧺', kind: 'habit',
      description: '洗い方・干し方・しまい方で服の寿命と匂いが変わる。',
      items: [
        I('care-label', '洗濯表示', { kind: 'knowledge', viewpoint: '洗濯表示の意味を読めるか', articles: ['a-care-label'],
          suggest: { text: '洗濯表示の読み方を確認する', reason: '洗濯表示は衣類の取扱い方法を示す公的な表示で、誤った洗い方による縮み・傷みを防げます。', priority: 2, effect: '衣類トラブルの予防', cost: '0円', time: '10分' } }),
        I('detergent', '洗剤・柔軟剤', { kind: 'knowledge', viewpoint: '洗剤の量や種類を適切に使えているか' }),
        I('bleach', '酸素系・塩素系漂白剤', { kind: 'knowledge', viewpoint: '漂白剤の種類の違いと、混ぜてはいけない組み合わせを知っているか' }),
        I('yellowing', '黄ばみ・黒ずみ', { kind: 'knowledge', viewpoint: '襟・脇の黄ばみに気づけているか' }),
        I('namagawaki-wash', '生乾き臭', { viewpoint: '洗濯後すぐ干す・風通しよく干すことができているか', articles: ['a-namagawaki'] }),
        I('net', '洗濯ネット', { kind: 'knowledge', viewpoint: 'デリケートな衣類をネットに入れているか' }),
        I('dryer-machine', '乾燥機', { kind: 'knowledge', viewpoint: '乾燥機にかけてはいけない衣類を判別できるか' }),
        I('iron', 'アイロン・スチーマー', { viewpoint: 'シワのある服をそのまま着ていないか' }),
        I('pilling', '毛玉取り', { viewpoint: '毛玉が目立つ服を着ていないか' }),
        I('lint', 'ほこり・糸くずの処理', { viewpoint: '服にほこりや糸くず、ペットの毛が付いたままになっていないか' }),
        I('cleaning-shop', 'クリーニング', { kind: 'knowledge', viewpoint: '家で洗えない服をクリーニングに出せているか' }),
        I('koromogae', '衣替え', { viewpoint: '季節の変わり目に衣類を入れ替えているか', tasks: [{ name: '衣替え', freq: 'seasonal' }] }),
        I('storage', '衣類の保管', { viewpoint: '湿気・虫食い対策ができているか' }),
        I('discard', '服を捨てるタイミング', { kind: 'knowledge', viewpoint: '傷んだ服・着ない服を判断できているか', tasks: [{ name: '着ない服・傷んだ服の見直し', freq: 'seasonal' }] }),
        I('underwear-replace', '下着・靴下の交換時期', { kind: 'item', viewpoint: 'ヨレ・穴・ゴム伸びがないか', tasks: [{ name: '下着・靴下の状態確認', freq: 'seasonal' }] })
      ]
    },
    {
      id: 'c06', no: '06', name: '靴・革製品', icon: '👞', kind: 'item',
      description: '足元は意外と見られている。',
      items: [
        I('sneaker', 'スニーカーの選び方', { kind: 'knowledge', viewpoint: 'サイズと用途に合っているか' }),
        I('leather-shoes', '革靴の選び方', { kind: 'knowledge', viewpoint: '場面に合った形・色を選べているか' }),
        I('shoe-care', '靴の手入れ', { kind: 'habit', viewpoint: '汚れ・すり減りを放置していないか',
          suggest: { text: '靴のメンテナンス方法を確認する', reason: '靴の汚れやかかとのすり減りは、自分では気づきにくい部分です。', priority: 2, effect: '足元の清潔感・靴の長持ち', cost: '数百〜数千円', time: '10〜20分' },
          tasks: [{ name: '靴の汚れ確認・手入れ', freq: 'irregular', interval: 14 }] }),
        I('shoe-shine', '靴磨き', { kind: 'habit', viewpoint: '革靴を定期的に磨いているか' }),
        I('shoe-wash', '靴の洗浄・消臭', { kind: 'habit', viewpoint: '靴の中の臭いや汚れに気を配れているか' }),
        I('shoe-life', '靴の寿命', { kind: 'knowledge', viewpoint: 'かかとのすり減りや型崩れで買い替えを判断できるか' }),
        I('leather-care', '革製品の手入れ', { kind: 'habit', viewpoint: '乾燥・ひび割れを防げているか' }),
        I('leather-storage', '革製品の保管', { kind: 'knowledge', viewpoint: '湿気・カビ対策ができているか' })
      ]
    },
    {
      id: 'c07', no: '07', name: '部屋・住環境', icon: '🏠', kind: 'habit',
      description: '清潔で快適な環境を維持できているか。',
      items: [
        I('tidy', '整理整頓', { viewpoint: '物の定位置が決まっているか' }),
        I('floor', '掃除機・床掃除', { viewpoint: '床にホコリや髪の毛が溜まっていないか', tasks: [{ name: '床掃除', freq: 'weekly' }],
          suggest: { text: '週1回の床掃除を習慣にする', reason: '部屋の清潔さは匂いや寝具の状態にも影響します。', priority: 2, effect: '快適な住環境', cost: '0円〜', time: '15〜30分' } }),
        I('toilet', 'トイレ掃除', { viewpoint: '便器・床の汚れや臭いを放置していないか', tasks: [{ name: 'トイレ掃除', freq: 'weekly' }] }),
        I('bath', '浴室・洗面台', { viewpoint: 'カビ・水垢が溜まっていないか', tasks: [{ name: '浴室・洗面台の掃除', freq: 'weekly' }] }),
        I('drain', '排水口', { viewpoint: '詰まり・臭いが出ていないか', tasks: [{ name: '排水口の掃除', freq: 'irregular', interval: 14 }] }),
        I('washer-tub', '洗濯槽', { viewpoint: '洗濯槽を定期的に掃除しているか', tasks: [{ name: '洗濯槽の掃除', freq: 'monthly' }] }),
        I('aircon', 'エアコン', { viewpoint: 'フィルターを掃除しているか', tasks: [{ name: 'エアコンフィルターの掃除', freq: 'irregular', interval: 14 }] }),
        I('garbage', 'ゴミの管理', { viewpoint: 'ゴミの日を把握し、溜め込んでいないか' }),
        I('fridge', '冷蔵庫', { viewpoint: '期限切れの食品が残っていないか', tasks: [{ name: '冷蔵庫の中身確認', freq: 'weekly' }] }),
        I('bedding', '寝具', { viewpoint: 'シーツ・布団を清潔に保てているか' }),
        I('curtain', 'カーテン', { viewpoint: 'カーテンを洗ったことがあるか', tasks: [{ name: 'カーテンの洗濯', freq: 'seasonal' }] }),
        I('room-vent', '換気', { viewpoint: '湿気や臭いがこもっていないか' }),
        I('room-fragrance', '芳香剤・ディフューザー', { kind: 'knowledge', viewpoint: '香りの強さが適切か' }),
        I('interior', 'インテリア', { kind: 'knowledge', viewpoint: '自分が落ち着ける空間になっているか（好みの範囲）' }),
        I('plants', '観葉植物', { kind: 'knowledge', viewpoint: '置き場所や水やりの頻度を知っているか' })
      ]
    },
    {
      id: 'c08', no: '08', name: '日用品・消耗品管理', icon: '🧴', kind: 'item',
      description: '交換時期を過ぎたものを使い続けていないか。',
      items: [
        I('toothbrush', '歯ブラシ', { viewpoint: '毛先が開いたまま使っていないか', tasks: [{ name: '歯ブラシの交換', freq: 'monthly' }] }),
        I('towel', 'タオル', { viewpoint: 'ゴワつき・臭いが出ていないか' }),
        I('sheets', 'シーツ', { viewpoint: '定期的に洗濯・交換しているか' }),
        I('razor', 'カミソリ', { viewpoint: '刃が劣化したまま使っていないか' }),
        I('shampoo', 'シャンプー', { viewpoint: '残量を把握しているか' }),
        I('body-soap', 'ボディソープ', { viewpoint: '残量を把握しているか' }),
        I('laundry-detergent', '洗剤', { viewpoint: '残量を把握しているか' }),
        I('bleach-stock', '漂白剤', { viewpoint: '用途に合ったものを持っているか' }),
        I('cleaning-tools', '掃除用品', { viewpoint: '必要な掃除道具が揃っているか' }),
        I('deodorizer', '消臭用品', { viewpoint: '用途に合った消臭用品を使えているか' }),
        I('cosme-expiry', 'スキンケア用品の使用期限', { kind: 'knowledge', viewpoint: '開封後の使用期限を把握しているか' }),
        I('consumable-cycle', '消耗品の交換時期', { kind: 'knowledge', viewpoint: '主な消耗品の交換目安を知っているか' }),
        I('stock', 'ストック管理', { kind: 'habit', viewpoint: '切らしたり買いすぎたりしていないか', tasks: [{ name: '日用品のストック確認', freq: 'weekly' }] })
      ]
    },
    {
      id: 'c09', no: '09', name: '健康・生活習慣', icon: '🌙', kind: 'habit',
      description: '見た目も気分も、生活の土台から。',
      items: [
        I('sleep', '睡眠', { viewpoint: '睡眠時間と睡眠の質を確保できているか' }),
        I('diet', '食生活', { viewpoint: '偏った食事が続いていないか' }),
        I('water', '水分補給', { viewpoint: 'こまめに水分をとっているか' }),
        I('exercise', '運動', { viewpoint: '日常的に体を動かしているか' }),
        I('weight', '体重管理', { viewpoint: '体重の変化を把握しているか', tasks: [{ name: '体重を測る', freq: 'weekly' }] }),
        I('posture', '姿勢', { viewpoint: '猫背になっていないか' }),
        I('bathing', '入浴', { viewpoint: 'シャワーだけで済ませすぎていないか（好みの範囲）' }),
        I('rhythm', '生活リズム', { viewpoint: '起床・就寝時間が大きく乱れていないか' }),
        I('checkup', '健康診断', { viewpoint: '定期的に健康診断を受けているか', tasks: [{ name: '健康診断', freq: 'irregular', interval: 365 }] }),
        I('condition', '体調管理', { viewpoint: '不調のサインに気づいて対処できているか' })
      ]
    },
    {
      id: 'c10', no: '10', name: 'お金・買い物', icon: '💴', kind: 'knowledge',
      description: '必要なものを、無理なく計画的に。',
      items: [
        I('budget', '家計管理', { viewpoint: '収入と支出を把握しているか' }),
        I('expense', '支出管理', { kind: 'habit', viewpoint: '何にいくら使っているか把握しているか', tasks: [{ name: '今月の支出を振り返る', freq: 'monthly' }] }),
        I('beauty-cost', '美容・服飾費', { viewpoint: '身だしなみにかける予算を決めているか' }),
        I('daily-cost', '日用品費', { viewpoint: '日用品にかかる費用を把握しているか' }),
        I('replace-budget', '買い替え予算', { viewpoint: '買い替えが必要なものの予算を見込んでいるか' }),
        I('product-choice', '商品の選び方', { viewpoint: '目的と条件を決めてから選んでいるか' }),
        I('price-quality', '価格と品質の考え方', { viewpoint: '安さだけ・高さだけで判断していないか' }),
        I('priority-buy', '買い物の優先順位', { viewpoint: '必要度の高いものから揃えているか' }),
        I('impulse', '衝動買いの防止', { kind: 'behavior', viewpoint: '欲しいものリストに入れて時間を置けているか' }),
        I('saving', '貯蓄・投資の基礎', { viewpoint: '貯蓄・投資の基本的な仕組みを知っているか' })
      ]
    },
    {
      id: 'c11', no: '11', name: '店選び・外出・遊び', icon: '🗺️', kind: 'knowledge',
      description: '場面に合う店や過ごし方を選べるように。',
      items: [
        I('restaurant', '飲食店の選び方', { viewpoint: '目的・人数・予算に合わせて選べるか' }),
        I('izakaya-cafe', '居酒屋・カフェ', { viewpoint: '場面に合った店の種類を選べるか' }),
        I('friend-meal', '友人との食事', { viewpoint: '相手の都合や好みに配慮できているか' }),
        I('date-spot', 'デート向けの店', { viewpoint: '落ち着いて話せる店を選べるか' }),
        I('salon-choice', '美容院選び', { viewpoint: '口コミや得意なスタイルから選べるか' }),
        I('shop-choice', '服屋選び', { viewpoint: '自分の予算・好みに合う店を知っているか' }),
        I('hotel', 'ホテル・旅館', { viewpoint: '目的に合った宿の選び方を知っているか' }),
        I('travel', '旅行', { viewpoint: '計画と持ち物の準備ができるか' }),
        I('leisure', 'レジャー', { viewpoint: '季節や相手に合った過ごし方を選べるか' }),
        I('season-event', '季節イベント', { viewpoint: '季節ごとの行事を楽しめているか' }),
        I('present', 'プレゼント', { viewpoint: '相手や関係性に合った贈り物を選べるか' }),
        I('reservation', '予約方法', { viewpoint: '電話・Webでの予約やキャンセルのマナーを知っているか' }),
        I('price-mood', '価格帯や雰囲気の判断', { viewpoint: '口コミ・写真・メニューから価格帯と雰囲気を判断できるか' }),
        I('purpose-shop', '目的や相手に応じた店選び', { viewpoint: '誰と・何のために行くかで店を選べているか' }),
        I('gift-shop', '贈り物を購入する店舗', { viewpoint: '贈り物を買える店（百貨店・専門店など）を知っているか' })
      ]
    },
    {
      id: 'c12', no: '12', name: 'コミュニケーション・話し方', icon: '💬', kind: 'behavior',
      description: '専門的な会話術ではなく、日常的に気にしたい観点。',
      items: [
        I('self-deprecation', '自虐が多すぎないか', {
          viewpoint: '自虐が多すぎないか、自虐風自慢になっていないか',
          checks: [
            '自虐が多すぎないか振り返った',
            '褒められたときに素直に受け取れている',
            '相手が反応に困るような発言をしていない',
            '相手の話を聞くことができている'
          ],
          suggest: { text: '最近の会話での自虐の頻度を振り返る', reason: '自虐が続くと、相手がフォローや反応に困ることがあると言われます。程度の問題で、ゼロにする必要はありません。', priority: 2, effect: '会話の気まずさを減らす', cost: '0円', time: '5分' },
          articles: ['a-self-deprecation']
        }),
        I('humblebrag', '自虐風自慢になっていないか', { viewpoint: '謙遜の形をとった自慢になっていないか', articles: ['a-self-deprecation'] }),
        I('over-modest', '謙遜しすぎていないか', { viewpoint: '褒め言葉を否定しすぎていないか' }),
        I('brag', '自慢話が多くないか', { viewpoint: '自分の成果の話ばかりになっていないか' }),
        I('self-talk', '自分の話ばかりしていないか', { viewpoint: '相手が話す時間を確保できているか' }),
        I('interrupt', '相手の話を遮っていないか', { viewpoint: '相手が話し終わるのを待てているか' }),
        I('negative-start', '否定から入っていないか', { viewpoint: '「でも」「いや」から話し始めていないか' }),
        I('extra-word', '余計な一言を言っていないか', { viewpoint: '言わなくてよい一言を足していないか' }),
        I('aizuchi', '相槌やリアクション', { viewpoint: '聞いていることが相手に伝わっているか' }),
        I('question', '相手への質問', { viewpoint: '相手に関心を持って質問できているか' }),
        I('topic', '話題の広げ方', { viewpoint: '相手の話から話題を広げられるか' }),
        I('voice', '声の大きさ・話す速度', { viewpoint: '場面に合った声量・速さで話せているか' }),
        I('keigo', '敬語・言葉遣い', { kind: 'knowledge', viewpoint: '基本的な敬語を使い分けられるか' }),
        I('chat', 'LINE・チャットの表現', { viewpoint: '文面がそっけなさすぎ・長すぎになっていないか' }),
        I('distance', '相手との距離感', { viewpoint: '関係性に対して近づきすぎ・踏み込みすぎていないか' })
      ]
    },
    {
      id: 'c13', no: '13', name: 'マナー・社会的な振る舞い・教養', icon: '🎩', kind: 'knowledge',
      description: '場面に応じた振る舞いと、話題の引き出し。',
      items: [
        I('meal-manner', '食事のマナー', { kind: 'behavior', viewpoint: '音・食べ方・姿勢に気を配れているか' }),
        I('table-manner', 'テーブルマナー', { viewpoint: 'カトラリーの使い方など基本を知っているか' }),
        I('staff', '店員への接し方', { kind: 'behavior', viewpoint: '店員に横柄な態度をとっていないか' }),
        I('public', '公共の場でのマナー', { kind: 'behavior', viewpoint: '周囲への配慮ができているか' }),
        I('ceremony', '冠婚葬祭', { viewpoint: '服装・ご祝儀・香典などの基本を知っているか' }),
        I('gift', '贈り物', { viewpoint: '贈り物・お返しの基本を知っているか' }),
        I('thanks-apology', 'お礼・謝罪', { kind: 'behavior', viewpoint: 'お礼や謝罪をきちんと伝えられているか' }),
        I('business', 'ビジネスマナー', { viewpoint: '基本的なビジネスマナーを知っているか' }),
        I('common-sense', '社会常識', { viewpoint: '社会生活で必要な基本的な知識があるか' }),
        I('culture-media', '映画・音楽・読書', { viewpoint: '興味のある分野を持てているか（好みの範囲）' }),
        I('art', '美術・芸術', { viewpoint: '美術館などに触れる機会があるか（好みの範囲）' }),
        I('food-culture', '料理・食文化', { viewpoint: '基本的な料理ができるか' }),
        I('local-culture', '旅行・地域文化', { viewpoint: '地域の文化や名産に関心を持てているか（好みの範囲）' }),
        I('sports', 'スポーツ', { viewpoint: '話題として知っているスポーツがあるか（好みの範囲）' }),
        I('season-custom', '季節行事', { viewpoint: '主な年中行事の意味を知っているか' })
      ]
    },
    {
      id: 'c14', no: '14', name: 'プレゼント・贈り物', icon: '🎁', kind: 'knowledge',
      description: '相手と場面に合った贈り物を、無理なく選べるように。',
      items: [
        I('gift-scene', 'プレゼントを贈る場面', { viewpoint: '誕生日・お礼・お祝いなど、贈り物をする場面を知っているか' }),
        I('gift-relation', '相手との関係性に応じた選び方', { viewpoint: '関係性に対して重すぎ・軽すぎない贈り物を選べるか',
          suggest: { text: '贈り物の基本の考え方（関係性・予算・好み）を確認する', reason: '贈り物は「相手の負担にならないこと」が大切とされ、関係性で適切な内容が変わります。', priority: 2, effect: '贈り物で失敗しにくくなる', cost: '0円（確認のみ）', time: '10分' } }),
        I('gift-budget', '一般的な予算感', { viewpoint: '関係性や目的に対して、予算が極端に高すぎ・低すぎないか' }),
        I('gift-purpose', '誕生日・記念日・お礼など目的別の選び方', { viewpoint: '目的に合った贈り物を選べるか' }),
        I('gift-taste', '相手の好みの把握', { viewpoint: '普段の会話から相手の好みを覚えておけているか' }),
        I('gift-avoid', '避けた方がよい贈り物', { viewpoint: '場面によって避けた方がよいとされる品を知っているか' }),
        I('gift-type', '消耗品・食品・雑貨などの特徴', { viewpoint: '残る物・消える物の違いを考えて選べるか' }),
        I('wrapping', 'ラッピング', { viewpoint: '場面に合った包装・のしを選べるか' }),
        I('gift-timing', '渡すタイミングや方法', { viewpoint: '相手の負担にならないタイミング・渡し方ができるか' }),
        I('gift-return', 'お返しやお礼の考え方', { viewpoint: 'もらった後のお礼・お返しをきちんとできているか', tasks: [{ name: 'もらった物のお礼・お返しを確認', freq: 'irregular', interval: 30 }] })
      ]
    }
  ];

  // 種類ごとのステータス表示（値 v は 0〜6 の共通スケール）
  //  0 知らない / 1 知っている・未学習 / 2 学習中 / 3 実践待ち / 4 実践中 / 5 習慣化 / 6 維持管理
  const statusSets = {
    habit: [
      { v: 0, label: '知らない' },
      { v: 1, label: '知っている・未学習' },
      { v: 2, label: '学習中' },
      { v: 3, label: '実践待ち' },
      { v: 4, label: '実践中' },
      { v: 5, label: '習慣化' },
      { v: 6, label: '維持管理' }
    ],
    knowledge: [
      { v: 0, label: '知らない' },
      { v: 1, label: '知っている・未学習' },
      { v: 2, label: '学習中' },
      { v: 6, label: '理解した' }
    ],
    item: [
      { v: 0, label: '知らない' },
      { v: 1, label: '知っている' },
      { v: 3, label: '用意・購入待ち' },
      { v: 4, label: '使用中' },
      { v: 6, label: '維持管理' }
    ],
    behavior: [
      { v: 0, label: '意識したことがない' },
      { v: 1, label: '知っている' },
      { v: 2, label: '振り返り中' },
      { v: 4, label: '意識して実践中' },
      { v: 6, label: '自然にできている' }
    ]
  };

  const kindLabels = { habit: '習慣', knowledge: '知識', item: '持ち物', behavior: '振る舞い' };

  const freqLabels = { daily: '毎日', weekly: '毎週', monthly: '毎月', seasonal: '季節ごと', irregular: '不定期' };
  const freqDays = { daily: 1, weekly: 7, monthly: 30, seasonal: 90, irregular: 30 };

  // 情報の分類（要件定義 10章）
  const reliabilityTypes = {
    official: '公的・制度的情報',
    maker: 'メーカーの公式情報',
    science: '科学的・医学的根拠',
    expert: '専門家の推奨',
    custom: '一般的な慣習',
    trend: 'トレンド',
    preference: '個人の好み',
    uncertain: '不確実な情報'
  };

  return { categories, statusSets, kindLabels, freqLabels, freqDays, reliabilityTypes };
})();
