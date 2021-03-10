---
title: "Safari Technology Preview 49"
date: "2018-02-09 03:30:00 +0900"
tags:
  - Safari
  - Browser
  - 翻訳
---

Safari Technology Preview 49の変更点を訳しただけ。
([元記事](https://webkit.org/blog/8088/release-notes-for-safari-technology-preview-49/))


### Service Workers
- 永続的ストレージからリストアされたService Workerが`activated`状態を持つように変更。
- 応答しないService Workerは終了させるように変更。
- JavaScriptが`register()`を再度呼び出したときに、ディスクからService Workerの登録がリストアされるのを防ぐ。

### Fetch
- Fetchレスポンスのチャンクデータが受け取られた際のConsumeDataコールバックをサポート
- ロードされている不明瞭なレスポンスにおいてそのbodyがクローンされるように変更。
- 不明瞭なレスポンスからFetchヘッダーを除外
- Fetchのリダイレクトが`no-cors`モードと互換性のあるように修正
- リクエストがnullだったらリクエストからURLをコピーするようにFetchレスポンスを修正
- スクリプトとCSSをロードするためのFetchのオプションに整合性を設定

### Intelligent Tracking Prevention
- ユーザーのインタラクションがない状態での一般的なリソースへのクッキーをブロックする
- Service Workerのローディングとリクエストが正しくIntelligent Tracking Preventionにより正しくクリアされることを保証
- 試験的機能として、デバッグモードを導入

### CSS
- `column-gap`でのパーセンテージ指定をサポート
- CSSメディアクエリ内での`calc()`のパースをサポート
- block/cross-axisのアラインメントプロパティから`left`と`right`を削除。
- CSSワーキンググループの勧告を採用し、`css-align`プロパティ内の`self-position`もしくは`content-position`に先行する`overflow-position`を必須とする。
- `justify-content`プロパティの値としてとして有効な`baseline`を削除。
- `scale`が1より大きい時の`position:fixed`な要素のスクロール位置の演算を修正
- 色彩反転がオンになってたとき、オリジナルのimage、picture要素の色を保存する

### Rendering
- 数式を表示するときのoverflowを修正
- 複数のiframeを持つ高速でないスクロール可能領域の構築を最適化

### SVG
- 軸の半径の0を許容し、エフェクトを適用できるように`feMorphology`フィルターを修正

### JavaScript
- `trimStart`と`trimEnd`の実装
- JavaScriptのJSONサブセットを作成するStringの改行コードの制限を緩くする。

### Web Inspector
-  兄弟を持たないpath要素をクリックして選択できるように変更
- Layersタブが動くポップオーバーの代わりに静的に位置づけられたレイヤー詳細パネルを使用するように変更。
- Web InspectorがRTL(Right To Left)レイアウトになっていてもStylesサイドバーが常にCSSルールを左から右に表示するように修正
- Canvasタブが複数の"waiting for frames"メッセージを表示するときに発生する問題を修正。
- Canvasタブのレコードボタンがマウスオーバーしても出現しないことがある問題を修正
- Networkタブが、ソートされたカラムが非表示され再表示された時に、インディケーターをソートして非表示にしてしまうバグを修正。
- デフォルトのズームレベルでないとときにNetworkタブのテーブルカラムが揺れないように修正
- Stylesサイドバーを素早く更新することによって発生するデータの破損問題を修正。
- コメントアウトされた過去のプロパティを移動するときにStylesサイドバーがエラーを吐かないように修正。
- Resourceタブの詳細サイドバーが非常に長いURLをより良くラップしてくれるようにWindowのりサイズを修正。
- すべてのカラムが必須だったらテーブルヘッダーを右クリックしても"Displayed Columns"を表示しない。
- 幅が小さいときのNetworkタブのCookiesテーブルの挙動を改善。
- 高さが小さい時のナビゲーションバーのレイアウトを改善。

### Media
- CDMinstanceClearKeyの異なるセッションからの複数のキーをサポート。
- media要素がなかったらNowPlayingステータスを終了させるように変更。
- 新規作成された色空間の代わりに既存のRGB色空間を使用するように変更。
- WebVTTがHLS経由でサーブされる合図を修正

### Storage
- AppCacheを使っていたらdeprecation警告をコンソールに表示する。
- 割当などのキャシュストレージのエラーのためのコンソールメッセージを追加。
- Sevice Workerが登録されてなかったらメインリソースをロードしている時にストレージのプロセスを使わないように変更。
- Sevice Workerが登録されてなかったらService Workerクライアントを登録している時にストレージのプロセスを使わないように変更。
- 同タイミングで呼ばれた `caches.open`のプロミスをCache APIが解決することを保証する。
- 指定されたオリジンのデータをクリアするときにDOMCacheデータが正しく削除されない問題を修正。
- デフォルトのキャッシュストレージの割当を50MBに増量。

### Security
- JavaScript URLに遷移するときに、対象となるwindowのポリシーチェックを追加。
- Service WorkerのレスポンスをチェックするCSPポストを追加。
- `allow-same-origin`フラグがないサンドボックスフレームでの、Service WorkerとCache APIへのアクセスを無効にする。
- `frame-ancestor`指令をContent Security Policy Level3に適合するように更新。

### Accessibility
- ARIA active-descendantをサポート。
- VoiceOverにWebセッションを一意に識別する方法を追加。
- `graphics-document`、`graphics-object`、`graphics-symbol`のGraphics ARIAロールをサポート。
- SVGルートの場合にARIAロールの属性の上書きからSVG AAMマッピングを保護する。

### Bug Fixes
- サブリソースのロードのリダイレクトがService Workerのコントローラーを変更できるように保証することによって、[formus.swift.org](https://formus.swift.org)でのGitHubログインを修正。
- Microsoft Word for Mac 2011のblob変換とサニタイズを修正。
- PostScriptの名前が指定されていたら、許可されていないユーザーインストールのフォントが使用されないように変更。


## 所感 
46でService Workerが入ってからService Worker周りの修正が続々と入ってますね。

ところどころ知識が追いついていないせいで怪しいところがあったりするので、間違い等あったら指摘してください。

