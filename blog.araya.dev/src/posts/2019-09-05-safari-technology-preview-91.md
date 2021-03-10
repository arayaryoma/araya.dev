---
title: Safari Technology Preview 91
tags:
    - browser
    - safari
---

2019-09-04にSafari Technology Preview 91が[リリースされた](https://webkit.org/blog/9526/release-notes-for-safari-technology-preview-91/)

WebKitのrevisionは[248705-249190](https://trac.webkit.org/log/webkit/?stop_rev=248705&&rev=249190&limit=999)

概要を部分的に以下にまとめる。

## セキュリティ
TLS1.0と1.1が無効化

## JavaScript API
- unhandled promise rejectionsのためのpublicなAPIをJavaScript Coreに追加
- [hashbang](https://github.com/tc39/proposal-hashbang)をサポート
- [optional chaining](https://github.com/tc39/proposal-optional-chaining)を実装
- `StaticRange` constructorを実装
- `toISOString`がobjectを返したとき、`Date.prototype.toJSON`が例外を吐かないように修正
- `Promise.prototype.finally`がPromise型ではないobjectを受け入れるように変更

## JavaScript パフォーマンス
- `Array.prototype.toString`が呼ばれるたびに`join`関数が参照されていた問題を修正
- `x?.y ?? z`が高速であることを保証

## Media
- picture-in-pictureがあるときに `webkitpresentationmodechanged` が2回発火されるのを修正
- `MediaDevices`が停止するときに`MediaDevices`タイマーが停止するように変更
- `requestFullscreen()`がフルスクリーンを一貫しないstateで抜けたあとに`requestAnimationFrame()`コールバックのfullscreen elementが削除されるように修正
- capture devicesをサーチするときに無効化されたデバイスが考慮されないように変更

## Web API
- globalの`window` objectにGeolocation interfacesを生やすようにした
- variation selectorsをつかったEmojiがテキストスタイルではなくemojiスタイルで描画されるように修正
- SVG elementsに`focus`と`key`event listenerが追加されたときにfocusableになるように変更
- `HTMLFieldSetElement`と`HTMLOutputElement`のtab indexのデフォルト値が-1になるように変更

## レンダリング
- `drawImage`によるアニメーション画像のcanvasの最初のフレームへの描画を修正

## ポインターイベント　
- 将来のポインターイベントがmacOSでディスパッチされないようにする、キャプチャ要素の削除を修正

## WebDriver
- `SimulatedInputDispatcher`ログでマウスのボタンが正しく出力されるように修正

## Webインスペクター
- ElementsのDOMツリー、Networkのheaderペイン、Consoleが、RTLモードあっても常にLTRで表示する
- `BigInt`のシンタックスハイライトを追加
- 次のマイクロステップで停止するグローバルなbreakpointを指定できるようになった
- `queryHolders`コマンドラインAPI関数を実装
など
