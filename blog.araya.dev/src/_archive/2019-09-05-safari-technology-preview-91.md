---
title: Safari Technology Preview 91
date: "2019-09-05"
draft: true
tags:
  - browser
  - safari
---

2019-09-04 に Safari Technology Preview 91 が[リリースされた](https://webkit.org/blog/9526/release-notes-for-safari-technology-preview-91/)

WebKit の revision は[248705-249190](https://trac.webkit.org/log/webkit/?stop_rev=248705&&rev=249190&limit=999)

概要を部分的に以下にまとめる。

## セキュリティ

TLS1.0 と 1.1 が無効化

## JavaScript API

- unhandled promise rejections のための public な API を JavaScript Core に追加
- [hashbang](https://github.com/tc39/proposal-hashbang)をサポート
- [optional chaining](https://github.com/tc39/proposal-optional-chaining)を実装
- `StaticRange` constructor を実装
- `toISOString`が object を返したとき、`Date.prototype.toJSON`が例外を吐かないように修正
- `Promise.prototype.finally`が Promise 型ではない object を受け入れるように変更

## JavaScript パフォーマンス

- `Array.prototype.toString`が呼ばれるたびに`join`関数が参照されていた問題を修正
- `x?.y ?? z`が高速であることを保証

## Media

- picture-in-picture があるときに `webkitpresentationmodechanged` が 2 回発火されるのを修正
- `MediaDevices`が停止するときに`MediaDevices`タイマーが停止するように変更
- `requestFullscreen()`がフルスクリーンを一貫しない state で抜けたあとに`requestAnimationFrame()`コールバックの fullscreen element が削除されるように修正
- capture devices をサーチするときに無効化されたデバイスが考慮されないように変更

## Web API

- global の`window` object に Geolocation interfaces を生やすようにした
- variation selectors をつかった Emoji がテキストスタイルではなく emoji スタイルで描画されるように修正
- SVG elements に`focus`と`key`event listener が追加されたときに focusable になるように変更
- `HTMLFieldSetElement`と`HTMLOutputElement`の tab index のデフォルト値が-1 になるように変更

## レンダリング

- `drawImage`によるアニメーション画像の canvas の最初のフレームへの描画を修正

## ポインターイベント　

- 将来のポインターイベントが macOS でディスパッチされないようにする、キャプチャ要素の削除を修正

## WebDriver

- `SimulatedInputDispatcher`ログでマウスのボタンが正しく出力されるように修正

## Web インスペクター

- Elements の DOM ツリー、Network の header ペイン、Console が、RTL モードあっても常に LTR で表示する
- `BigInt`のシンタックスハイライトを追加
- 次のマイクロステップで停止するグローバルな breakpoint を指定できるようになった
- `queryHolders`コマンドライン API 関数を実装
  など
