---
title: Safari Technology Preview 93
tags:
    - browser
    - safari
---

2019-10-02にSafari Technology Preview 92が[リリースされた](https://webkit.org/blog/9600/release-notes-for-safari-technology-preview-93/)

WebKitのrevisionは[249750-250329](https://trac.webkit.org/log?stop_rev=249750&&rev=250329&limit=999)。

概要を部分的に以下にまとめる。

## Resource Timing
- すべてのHTTPステータスコードに対してパフォーマンスエントリーをレポートするように変更

## SVG
- `<ellipse>`と`<rect>`要素の`rx`, `ry`について、自動的な挙動を追加
- `<animateMotion>`の`fill="support"`サポートを修正
- エフェクトを持たない`<view>`要素のSMILアニメーションを修正

## Web API
- feature policyに`sync-xhr`を追加
- `Refresh`ヘッダーと`<meta http-equiv="refresh">`に同じパーサーを使うように変更
- `Node.replaceChild()`のpre-replacementバリデーションの順番を修正
- `Access-Control-Expose-Headers`が正しくパースされるように修正
- DOMCacheから生成されたレスポンスで保存される`Content-Type`を修正
- `Date.prototype.toJSON`が正しく実行されるように修正
- 壊れたポスター画像を持つHTMLVideoElementが正方形の寸法をとるように修正
- Intersection Observerの交差率が1より大きくなるケースを修正
- `<datalist>`の切り取られたドロップダウンシャドウを修正
- セキュアなページでWorkerによるWebSocket URL接続の試行をブロックするように修正
- 余剰なサービスワーカーへのメッセージ送信が、エラーを吐かずに終了していた問題を修正
- CSPの継承のセマンティクスを改善
- 元のページで処理をトリガーするAR QuickLookのプロトタイプを提供
- URLParserの特別なschemeのリストから`gopher`を削除

## Web Inspector

## Accessibility
- アクセスビリティクライアントにeditable contentのミススペル範囲を公開

## Apple Pay
- なぜセッションがキャンセルされたかをWebサイトに伝えるサポートを追加
- サマリーアイテムのハンドリングと支払い方法の更新をクリーンアップした

## WebGPU
- フィールドとしてポインターをもつ`structs`および`arrays`を許可しない
- 標準ライブラリから`null`を削除

## Web Authentication
- 3つ以上のFIDOプロトコルバージョンのサポートを追加

## WebDriver
- いくつかのケースにおいて、`safaridriver --enable` がすぐに有効にならないことがあるバグを修正
