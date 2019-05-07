---
title: "Chrome 65 Beta"
date: "2018-02-09 04:00:00 +0900"
tags:
  - Chrome
  - Browser
  - 翻訳
---
Chrome Betaの最新版65がでました。([元記事](http://blog.chromium.org/2018/02/chrome-65-beta-css-paint-api-and.html))

今回特に大きいのはCSS Paint APIですね。


## CSS Paint API
CSS Paint APIを使うと、CSSのプロパティの要求に合わせて動的に画像を生成することができます。

[デモ動画](https://storage.googleapis.com/webfundamentals-assets/paintapi/checkercast_vp8.webm)
を観るとわかりますが、カスタムプロパティを変更すると、JSがそれを検知してイメージを動的に更新しています。

これをうまく使うとDOMツリーを軽くしたり普通に画像をつかうよりもファイルサイズを小さくすることができます。

## Server Timing API
Server Timing APIにより、Webサーバーがブラウザにパフォーマンス情報を送信することができます。<br>
サーバーからのHTTPレスポンスに`Server-Timing`ヘッダーを追加し、そのヘッダー内に任意のパフォーマンス情報を記述します。<br>
たとえば、データベースからの読み込みに何ms、書き込みに何ms、ファイルシステムからの読み込みに何msかかったというような情報をブラウザに送ってあげることにより、Webサーバーからのレスポンスタイムだけでなく更に深いところまでパフォーマンスメトリクスをブラウザ上で確認することができます。

## その他の機能

### CSS
- 擬似クラス [:any-link](https://developer.mozilla.org/en-US/docs/Web/CSS/:any-link)が使えるようになった。
- `color`プロパティの色指定が[CSS Color Module Level 4](https://drafts.csswg.org/css-color/)準拠になった。
-  自身のboxは作らないが、子要素や疑似要素のboxは生成する`display: contents`が使えるようになった。

### DOM
- `assignedNodes()`を補完するために`<slot>`要素が`assignedElements()`メソッドを持つようになった。
- `HTMLAnchorElement.relList`をサポート。`<a>`要素で指定されたリソースと現在のリソースの関係性を示すための機能。

### Feature Policy
- [sync-xhr feature policy](http://xhr.featurepolicy.rocks/)が使えるようになった。

### Network
- TLSの仕様との互換性を取るため、[TLS1.3のdraft-23](https://tools.ietf.org/html/draft-ietf-tls-tls13-23)をサポート。
- `Request.destination`でどのリソースをService Workerがfetchしてるか評価できるようになった。

### Performance API
- `PerformanceResourceTiming`、`PerformanceLongTaskTiming`、`TaskAttributionTiming`が `toJSON`メソッドをサポート。

### Security
- `cross-origin`属性付きの`<a>`要素の`download`属性を無視する。

## 廃止と相互運用性の改善

### Bindings
- HTMLの仕様と合わせ、`document.all`は上書き禁止となる。

### Network
- 2017/12/01以降に発行されたSymantecのレガシーなPKI(Public Key Infrastructure)を信頼しない。
これが影響するのはDigiCertの新しいPKIへの移行を明示的にオプトアウトしたサイト運営者だけで、このインフラから独立した、前もって公開されたサブ認証局には影響しない。
