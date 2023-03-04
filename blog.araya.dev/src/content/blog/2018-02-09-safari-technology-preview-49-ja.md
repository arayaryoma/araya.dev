---
title: "Safari Technology Preview 49"
date: "2018-02-09"
tags:
  - Safari
  - Browser
  - 翻訳
---

Safari Technology Preview 49 の変更点を訳しただけ。
([元記事](https://webkit.org/blog/8088/release-notes-for-safari-technology-preview-49/))

### Service Workers

- 永続的ストレージからリストアされた Service Worker が`activated`状態を持つように変更。
- 応答しない Service Worker は終了させるように変更。
- JavaScript が`register()`を再度呼び出したときに、ディスクから Service Worker の登録がリストアされるのを防ぐ。

### Fetch

- Fetch レスポンスのチャンクデータが受け取られた際の ConsumeData コールバックをサポート
- ロードされている不明瞭なレスポンスにおいてその body がクローンされるように変更。
- 不明瞭なレスポンスから Fetch ヘッダーを除外
- Fetch のリダイレクトが`no-cors`モードと互換性のあるように修正
- リクエストが null だったらリクエストから URL をコピーするように Fetch レスポンスを修正
- スクリプトと CSS をロードするための Fetch のオプションに整合性を設定

### Intelligent Tracking Prevention

- ユーザーのインタラクションがない状態での一般的なリソースへのクッキーをブロックする
- Service Worker のローディングとリクエストが正しく Intelligent Tracking Prevention により正しくクリアされることを保証
- 試験的機能として、デバッグモードを導入

### CSS

- `column-gap`でのパーセンテージ指定をサポート
- CSS メディアクエリ内での`calc()`のパースをサポート
- block/cross-axis のアラインメントプロパティから`left`と`right`を削除。
- CSS ワーキンググループの勧告を採用し、`css-align`プロパティ内の`self-position`もしくは`content-position`に先行する`overflow-position`を必須とする。
- `justify-content`プロパティの値としてとして有効な`baseline`を削除。
- `scale`が 1 より大きい時の`position:fixed`な要素のスクロール位置の演算を修正
- 色彩反転がオンになってたとき、オリジナルの image、picture 要素の色を保存する

### Rendering

- 数式を表示するときの overflow を修正
- 複数の iframe を持つ高速でないスクロール可能領域の構築を最適化

### SVG

- 軸の半径の 0 を許容し、エフェクトを適用できるように`feMorphology`フィルターを修正

### JavaScript

- `trimStart`と`trimEnd`の実装
- JavaScript の JSON サブセットを作成する String の改行コードの制限を緩くする。

### Web Inspector

- 兄弟を持たない path 要素をクリックして選択できるように変更
- Layers タブが動くポップオーバーの代わりに静的に位置づけられたレイヤー詳細パネルを使用するように変更。
- Web Inspector が RTL(Right To Left)レイアウトになっていても Styles サイドバーが常に CSS ルールを左から右に表示するように修正
- Canvas タブが複数の"waiting for frames"メッセージを表示するときに発生する問題を修正。
- Canvas タブのレコードボタンがマウスオーバーしても出現しないことがある問題を修正
- Network タブが、ソートされたカラムが非表示され再表示された時に、インディケーターをソートして非表示にしてしまうバグを修正。
- デフォルトのズームレベルでないとときに Network タブのテーブルカラムが揺れないように修正
- Styles サイドバーを素早く更新することによって発生するデータの破損問題を修正。
- コメントアウトされた過去のプロパティを移動するときに Styles サイドバーがエラーを吐かないように修正。
- Resource タブの詳細サイドバーが非常に長い URL をより良くラップしてくれるように Window のりサイズを修正。
- すべてのカラムが必須だったらテーブルヘッダーを右クリックしても"Displayed Columns"を表示しない。
- 幅が小さいときの Network タブの Cookies テーブルの挙動を改善。
- 高さが小さい時のナビゲーションバーのレイアウトを改善。

### Media

- CDMinstanceClearKey の異なるセッションからの複数のキーをサポート。
- media 要素がなかったら NowPlaying ステータスを終了させるように変更。
- 新規作成された色空間の代わりに既存の RGB 色空間を使用するように変更。
- WebVTT が HLS 経由でサーブされる合図を修正

### Storage

- AppCache を使っていたら deprecation 警告をコンソールに表示する。
- 割当などのキャシュストレージのエラーのためのコンソールメッセージを追加。
- Sevice Worker が登録されてなかったらメインリソースをロードしている時にストレージのプロセスを使わないように変更。
- Sevice Worker が登録されてなかったら Service Worker クライアントを登録している時にストレージのプロセスを使わないように変更。
- 同タイミングで呼ばれた `caches.open`のプロミスを Cache API が解決することを保証する。
- 指定されたオリジンのデータをクリアするときに DOMCache データが正しく削除されない問題を修正。
- デフォルトのキャッシュストレージの割当を 50MB に増量。

### Security

- JavaScript URL に遷移するときに、対象となる window のポリシーチェックを追加。
- Service Worker のレスポンスをチェックする CSP ポストを追加。
- `allow-same-origin`フラグがないサンドボックスフレームでの、Service Worker と Cache API へのアクセスを無効にする。
- `frame-ancestor`指令を Content Security Policy Level3 に適合するように更新。

### Accessibility

- ARIA active-descendant をサポート。
- VoiceOver に Web セッションを一意に識別する方法を追加。
- `graphics-document`、`graphics-object`、`graphics-symbol`の Graphics ARIA ロールをサポート。
- SVG ルートの場合に ARIA ロールの属性の上書きから SVG AAM マッピングを保護する。

### Bug Fixes

- サブリソースのロードのリダイレクトが Service Worker のコントローラーを変更できるように保証することによって、[formus.swift.org](https://formus.swift.org)での GitHub ログインを修正。
- Microsoft Word for Mac 2011 の blob 変換とサニタイズを修正。
- PostScript の名前が指定されていたら、許可されていないユーザーインストールのフォントが使用されないように変更。

## 所感

46 で Service Worker が入ってから Service Worker 周りの修正が続々と入ってますね。

ところどころ知識が追いついていないせいで怪しいところがあったりするので、間違い等あったら指摘してください。
