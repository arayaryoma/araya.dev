---
title: Safari Technology Preview 92
tags:
    - browser
    - safari
---

2019-09-18にSafari Technology Preview 92が[リリースされた](https://webkit.org/blog/9568/release-notes-for-safari-technology-preview-92/)

WebKitのrevisionは[249190-249750](https://trac.webkit.org/changeset/249597/webkit/)。

概要を部分的に以下にまとめる。

## JavaScript
- `Math.round()` が誤った結果になることがあるのを修正 (`Math.round(0.49999999999999994) === 1`)
- `Promise`の高速化

## WebGPU
- マトリクスがただしい配置になるように修正
- `GPUUncapturedErrorEvent`を実装
- `SampleLevel()` `SampleBias()`　`SampleGrad()`を実装
- いくつかのinterfaceとenumの名前が仕様に合うように更新

## SVG
- `url(#fragment)`がHTMLの`<base>`要素に関係なく現在のドキュメントに対して解決されるように修正
- SVGの`<view>`要素のSMILアニメーションを修正
- `href`属性もしくは`xlink:href`の値の取得を変更

## Images
- 画像を描画するときにデフォルトでEXIFを尊重するように変更

## Web API
- 改行がある2つのパラグラフのコピー&ペーストで、改行が中にある脱線した段落になるのを修正
- Google画像検索で`opacity: 0`でコンテンツが残るトランジションを修正
- `document.fonts.ready`の解決が早すぎる問題を修正
- 有効な`Content-Type`が`+xml`で終わっていたとき、`XMLHttpRequest`の`responseXML`が`null`を返すことがあるのを修正
- `tabIndex`のIDL属性が自身のコンテンツの属性を反映するように変更
- `HTMLImageElement::decode()`が非ビットマップ画像のデコードで解決されたpromiseを返すように変更
- contextがセキュアでない場合に`geolocation.watchPosition()`と`geolocation.getCurrentPとtion()`が`PERMISSION_DENIED`を返すように変更。

## Service Workers
- `Service-Worker-Allowed`ヘッダーのオリジンチェックを追加
- SWとwindow間の`postMessage`のバッファリングをサポート
- 登録復元(registration resurrection)のサポートを落とす

## WebRTC
- `RTCDataChannel.send(Blob)`をサポート
- オーティオがキャプチャされないことがある問題を修正

## IndexedDB
- パフォーマンス改善のために、SQLiteIDBCursorのSQLiteStatementがキャッシュされるように変更
- パフォーマンス改善のために、カウント操作で`SQL COUNT`文を使用するように変更
- データベースの操作が完了したときのデータベースのサイズを変更

## Web Inspector
省略

## Accessibility
- タブインデックスが削除されたら子要素のキャッシュが再計算されるように変更

## Security
- WebSocketsでのTLS1.0, 1.1を無効化
