/*
 * 知識コンテンツ
 * ------------------------------------------------------------
 * 要件定義「10. 情報の信頼性・品質管理」に従い、各記事は以下を持ちます。
 *
 *   status      : 'draft'(下書き・出典確認前) / 'review'(確認中) / 'published'(確認済み) / 'archived'(非公開)
 *   reliability : 主な情報の分類（data.js の reliabilityTypes のキー）
 *   sources     : 出典 [{ title, publisher, url, type, verified(主張を裏付けているか確認済みか), checkedAt }]
 *   checkedAt   : 最終確認日 (YYYY-MM-DD)
 *   history     : 更新履歴 [{ date, note }]
 *   sections    : 基本構成 1〜9（what / why / recommended / howto / tools / choose / caution / frequency / maintain）
 *                 本文中の各段落は { text, basis } の形にでき、basis で「一般的な推奨」「好み」等を区別します。
 *
 * 【注意】ここに入っている本文はアプリの動作確認用の「下書き」です。
 *        出典の確認（verified: true）と編集者のレビューが終わるまで status は 'draft' のままにしてください。
 *        アプリ上でも「下書き・出典確認前」と明示されます。
 *        status を 'archived' にすると一覧から非表示になります。
 */

window.SAITEIGEN_CONTENT = [
  {
    id: 'a-brow',
    title: '眉毛の整え方（基本）',
    items: ['brow', 'brow-salon'],
    status: 'draft',
    reliability: 'custom',
    checkedAt: null,
    history: [{ date: '2026-11-15', note: '構成の下書きを作成（出典未確認）' }],
    sources: [],
    sections: {
      what: [{ text: '眉毛の手入れとは、伸びた毛・眉の形から外れた毛を整えて、眉の形をすっきり見せることです。', basis: 'custom' }],
      why: [
        { text: '眉毛は顔の中でも目立ちやすく、手入れの有無が印象に出やすい部分と一般に言われます。', basis: 'custom' },
        { text: '自分では見慣れているため、伸びっぱなしでも気づきにくいことがあります。', basis: 'custom' }
      ],
      recommended: [
        { text: '初めてなら、一度サロンで整えてもらい、その形を自分で維持する方法がよく紹介されます。', basis: 'custom' },
        { text: '自分で整える場合は「長さを揃える」「明らかにはみ出た毛だけ処理する」から始め、削りすぎないようにします。', basis: 'custom' }
      ],
      howto: [
        { text: '1. 明るい場所で鏡を見て、眉全体の形と、はみ出ている毛を確認する。' },
        { text: '2. 眉用コームで毛流れを整え、コームからはみ出た長い毛を眉用ハサミで切る。' },
        { text: '3. 眉の形から明らかに外れた毛（眉間・まぶた側）を処理する。迷う毛は残す。' },
        { text: '4. 左右を見比べて、必要以上に細くなっていないか確認する。' }
      ],
      tools: [{ text: '眉用コーム、眉用ハサミ、（必要に応じて）毛抜き・眉用シェーバー' }],
      choose: [{ text: '肌への負担を減らしたい場合は電動の眉用シェーバーという選択肢もあります。どれを使うかは好みや肌の状態によります。', basis: 'preference' }],
      caution: [
        { text: '一度に細くしすぎると、生えそろうまで時間がかかります。少しずつ整えるのが無難です。', basis: 'custom' },
        { text: '肌荒れや炎症がある部分は無理に処理しないでください。', basis: 'custom' }
      ],
      frequency: [{ text: '目安として2〜4週間に1回程度、伸び具合を確認します（毛の伸び方には個人差があります）。', basis: 'custom' }],
      maintain: [{ text: '「次回の手入れ日」を習慣に登録しておくと、伸びっぱなしを防げます。' }]
    }
  },
  {
    id: 'a-skincare',
    title: 'スキンケアの基本（洗顔・保湿・紫外線対策）',
    items: ['skincare', 'face-wash', 'lotion', 'moisture', 'sunscreen'],
    status: 'draft',
    reliability: 'expert',
    checkedAt: null,
    history: [{ date: '2026-11-15', note: '構成の下書きを作成（出典未確認）' }],
    sources: [],
    sections: {
      what: [{ text: 'スキンケアは、肌の汚れを落とし（洗顔）、うるおいを保ち（保湿）、紫外線から守る（日焼け止め）ための日常的な手入れです。' }],
      why: [{ text: '乾燥や紫外線は肌トラブルの原因になりうるとされ、基本的なケアは性別を問わず広く推奨されています。', basis: 'expert' }],
      recommended: [{ text: 'まずは「洗顔 → 保湿 → （日中は）日焼け止め」の3ステップを基本にします。美容液などの追加は必要に応じて検討します。', basis: 'expert' }],
      howto: [
        { text: '1. 洗顔料をよく泡立て、こすらずに泡で洗う。' },
        { text: '2. ぬるま湯で十分にすすぎ、清潔なタオルで押さえるように拭く。' },
        { text: '3. 洗顔後は早めに化粧水・乳液（またはオールインワン）で保湿する。' },
        { text: '4. 外出時は日焼け止めを塗る。' }
      ],
      tools: [{ text: '洗顔料、化粧水・乳液（またはオールインワンジェル）、日焼け止め' }],
      choose: [
        { text: '肌質（乾燥しやすい／脂っぽい／敏感など）に合わせて選びます。', basis: 'expert' },
        { text: '香り・使用感・価格帯の選び方は個人の好みです。', basis: 'preference' }
      ],
      caution: [{ text: '赤み・かゆみ・痛みが出た場合は使用を中止し、続く場合は皮膚科に相談してください。このアプリは医学的な診断を行いません。', basis: 'custom' }],
      frequency: [{ text: '洗顔・保湿は朝晩、日焼け止めは外出時。' }],
      maintain: [{ text: '開封後の使用期限を持ち物に登録し、古いものを使い続けないようにします。' }]
    }
  },
  {
    id: 'a-care-label',
    title: '洗濯表示の読み方',
    items: ['care-label'],
    status: 'draft',
    reliability: 'official',
    checkedAt: null,
    history: [{ date: '2026-11-15', note: '構成の下書きを作成（出典未確認）' }],
    sources: [
      { title: '新しい洗濯表示（出典候補）', publisher: '消費者庁', url: 'https://www.caa.go.jp/policy/quality_labeling/household_goods/laundry_symbols.html', type: 'official', verified: false, checkedAt: null }
    ],
    sections: {
      what: [{ text: '洗濯表示は、衣類の洗い方・漂白・乾燥・アイロン・クリーニングの可否を記号で示したものです。', basis: 'official' }],
      why: [{ text: '表示と違う方法で洗うと、縮み・色落ち・型崩れの原因になります。', basis: 'official' }],
      recommended: [{ text: '新しい服を買ったら、最初に洗濯表示を確認する習慣をつけます。' }],
      howto: [
        { text: '1. 衣類の内側のタグを見る。' },
        { text: '2. 「洗濯おけ」「三角」「四角」「アイロン」「円」の5つの基本記号を確認する。' },
        { text: '3. 記号に付いた数字・点・線・×の意味を確認する（詳細は公的機関の資料で確認）。' }
      ],
      tools: [],
      choose: [],
      caution: [{ text: '記号の正確な意味は、必ず出典（公的機関の資料）で確認してください。', basis: 'official' }],
      frequency: [{ text: '新しい衣類を買ったとき。' }],
      maintain: []
    }
  },
  {
    id: 'a-namagawaki',
    title: '生乾き臭を防ぐ',
    items: ['namagawaki', 'namagawaki-wash', 'cloth-odor'],
    status: 'draft',
    reliability: 'custom',
    checkedAt: null,
    history: [{ date: '2026-11-15', note: '構成の下書きを作成（出典未確認）' }],
    sources: [],
    sections: {
      what: [{ text: '生乾き臭は、洗濯物が乾くまでに時間がかかったときなどに発生しやすい、いやな臭いです。' }],
      why: [{ text: '自分の鼻は慣れやすく、本人は気づかないまま周囲に伝わることがあります。', basis: 'custom' }],
      recommended: [
        { text: '洗濯が終わったらすぐ干す、間隔をあけて風通しよく干す、が基本とされます。', basis: 'custom' },
        { text: '洗濯槽の汚れも原因になりうるため、定期的な洗濯槽の掃除も合わせて紹介されます。', basis: 'custom' }
      ],
      howto: [
        { text: '1. 洗濯物を溜め込みすぎない。' },
        { text: '2. 洗濯機に詰め込みすぎない。' },
        { text: '3. 終了後すぐに取り出して干す。' },
        { text: '4. 部屋干しのときは扇風機・除湿機・換気で早く乾かす。' }
      ],
      tools: [{ text: '（必要に応じて）部屋干し用洗剤、酸素系漂白剤、除湿機・扇風機、洗濯槽クリーナー' }],
      choose: [],
      caution: [{ text: '漂白剤は種類によって使える衣類が異なり、混ぜると危険なものもあります。必ず製品の表示に従ってください。', basis: 'official' }],
      frequency: [{ text: '洗濯のたび。洗濯槽の掃除は製品の説明書の推奨頻度を確認。' }],
      maintain: [{ text: '「洗濯槽の掃除」を毎月の習慣に登録できます。' }]
    }
  },
  {
    id: 'a-self-deprecation',
    title: '自虐との付き合い方',
    items: ['self-deprecation', 'humblebrag'],
    status: 'draft',
    reliability: 'uncertain',
    checkedAt: null,
    history: [{ date: '2026-11-15', note: '構成の下書きを作成（出典未確認）' }],
    sources: [],
    sections: {
      what: [{ text: '自虐とは、自分の欠点や失敗をあえて話題にして笑いや謙遜につなげる話し方です。' }],
      why: [
        { text: '適度な自虐は場を和ませることもありますが、多すぎると相手が反応やフォローに困ることがあると言われます。', basis: 'custom' },
        { text: '「自虐の形をとった自慢（自虐風自慢）」は、相手に違和感を与えることがあります。', basis: 'custom' }
      ],
      recommended: [{ text: 'ゼロにする必要はありません。「最近の会話で自虐が続いていなかったか」を振り返る観点として使ってください。', basis: 'custom' }],
      howto: [
        { text: '1. 最近の会話を思い出し、自虐を言った場面を書き出してみる。' },
        { text: '2. 相手がどう反応したか（笑った／フォローした／困っていた）を振り返る。' },
        { text: '3. 褒められたときは否定せず「ありがとう」で受け取ってみる。' }
      ],
      tools: [],
      choose: [],
      caution: [{ text: '話し方には個性があり、正解は一つではありません。このアプリは人格についての判断をしません。', basis: 'preference' }],
      frequency: [{ text: '気になったときに振り返る。' }],
      maintain: []
    }
  }
];
