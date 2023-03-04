---
title: Safari Technology Preview 93
date: "2019-10-03"
tags:
  - browser
  - safari
---

2019-10-02 に Safari Technology Preview 92 が[リリースされた](https://webkit.org/blog/9600/release-notes-for-safari-technology-preview-93/)

WebKit の revision は[249750-250329](https://trac.webkit.org/log?stop_rev=249750&&rev=250329&limit=999)。

概要を部分的に以下にまとめる。

## Resource Timing

- すべての HTTP ステータスコードに対してパフォーマンスエントリーをレポートするように変更

## SVG

- `<ellipse>`と`<rect>`要素の`rx`, `ry`について、自動的な挙動を追加
- `<animateMotion>`の`fill="support"`サポートを修正
- エフェクトを持たない`<view>`要素の SMIL アニメーションを修正

## Web API

- feature policy に`sync-xhr`を追加
- `Refresh`ヘッダーと`<meta http-equiv="refresh">`に同じパーサーを使うように変更
- `Node.replaceChild()`の pre-replacement バリデーションの順番を修正
- `Access-Control-Expose-Headers`が正しくパースされるように修正
- DOMCache から生成されたレスポンスで保存される`Content-Type`を修正
- `Date.prototype.toJSON`が正しく実行されるように修正
- 壊れたポスター画像を持つ HTMLVideoElement が正方形の寸法をとるように修正
- Intersection Observer の交差率が 1 より大きくなるケースを修正
- `<datalist>`の切り取られたドロップダウンシャドウを修正
- セキュアなページで Worker による WebSocket URL 接続の試行をブロックするように修正
- 余剰なサービスワーカーへのメッセージ送信が、エラーを吐かずに終了していた問題を修正
- CSP の継承のセマンティクスを改善
- 元のページで処理をトリガーする AR QuickLook のプロトタイプを提供
- URLParser の特別な scheme のリストから`gopher`を削除

## Web Inspector

## Accessibility

- アクセスビリティクライアントに editable content のミススペル範囲を公開

## Apple Pay

- なぜセッションがキャンセルされたかを Web サイトに伝えるサポートを追加
- サマリーアイテムのハンドリングと支払い方法の更新をクリーンアップした

## WebGPU

- フィールドとしてポインターをもつ`structs`および`arrays`を許可しない
- 標準ライブラリから`null`を削除

## Web Authentication

- 3 つ以上の FIDO プロトコルバージョンのサポートを追加

## WebDriver

- いくつかのケースにおいて、`safaridriver --enable` がすぐに有効にならないことがあるバグを修正
