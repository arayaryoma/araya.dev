---
title: EyeDropper API で Webサイトからスポイト(color picker)を起動する
tags:
  - browser
  - Web API
date: "2021-08-19 01:18:00 +0900"
---

## EyeDropper API とは

[EyeDropper API](https://wicg.github.io/eyedropper-api/) という API が WICG で提案されている。"eyedropper"とは、スポイトのことで、画像編集ソフトなどによくある色を抽出する機能のことだ。

eyedropper を OS などのカラーピッカーを介さずにブラウザから直接起動できる API がこの EyeDropper API で、Chrome ではすでに実装が進み、[Chrome に搭載されることがアナウンスされている](https://groups.google.com/a/chromium.org/g/blink-dev/c/rdniQ0D5UfY/m/Aywn9XyyAAAJ)。

## Demo

とりあえず動かしてみた。 [https://playground.araya.dev/eye-dropper-api/](https://playground.araya.dev/eye-dropper-api/)

動かすには Chrome の Experimental Web Platform features (`chrome://flags/#enable-experimental-web-platform-features`)を有効にしておく必要がある。筆者は以下の環境で動作を確認した。

```
Google Chrome	95.0.4608.0 (Official Build) canary (x86_64)
Revision	aea2573cb09d9a30a45a2186141751e139b7465f-refs/branch-heads/4608@{#1}
OS	macOS Version 11.4 (Build 20F71)
```

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/bXvhmeY1atA" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

ボタンを押すとカラーピッカー UI を介すことなく eyedropper が起動している。取得した色はボタンの下に出力している。

## モチベーション

既存の `<input type="color">` で カラーピッカー を起動すればその中にある eyedropper を使用することは可能だ。
しかし、この UI は OS などのプラットフォームに依存していて、プラットフォームによってはカラーピッカーに eyedropper がない場合もあり得るし、アプリケーションからすると必ずカラーピッカー UI を経由しないと eyedropper を呼び出せないことになる。

![macOS のカラーピッカーにはeyedropperが用意されている](/assets/images/eyedropper/color-picker-ui.jpg)

macOS のカラーピッカーには eyedropper が用意されている

EyeDropper API があれば、Web アプリケーション側で eyedropper を起動するボタンを用意し、プラットフォームに依存せずに直に eyedropper を呼び出すことができる。

## インターフェース

EyeDropper API はかなりシンプルなインターフェースになっている。デモのページから EyeDropper API の呼び出し部分だけを抜き出す。

```js
const eyeDropper = new EyeDropper();

eyeDropper
  .open()
  .then((colorSelectionResult) => {
    // 例: `#db7463`
    resultTextArea.innerText = `${colorSelectionResult.sRGBHex}`;
  })
  .catch((error) => {
    // キャンセルした場合の例: `DOMException: The user canceled the selection.`
    console.error(error);
  });
```

`EyeDropper` のインスタンスを作り、`open` メソッドを呼び出す。`open` メソッドは Promise を返す。
正しく色の取得が行われた場合は、`ColorSelectionResul` 型の値を resolve し、ユーザーがキャンセルをすると reject される。キャンセルは、Chrome では Esc キーで可能だ。

[draft の`ColorSectionReulst`の定義](https://wicg.github.io/eyedropper-api/#colorselectionresult-dictionary)を見ると、`sRGBHex` というキーで、取得した色の sRGB 色空間での値が取れることがわかる。実際にデモでも期待する動作が得られた。

デモ動画内では同一のページ内からのみ色を取得しているが、実際には**スクリーン上のどのピクセルからでも**色を取得することができる。

ユーザーが eyedropper での色取得をキャンセルした場合は`DOMException`で reject される。
他にも eyedropper を重複して呼び出そうとした場合などには reject される。詳しくは[`open()`メソッドの定義](https://wicg.github.io/eyedropper-api/#eyedropper-interface)を見てほしい。

### EyeDropper API を呼び出す条件

`EyeDropper::open()` を呼び出すときには、ユーザーがクリックなどの明示的なジェスチャーを示していることが必要。このハンドルをせずに、単に`open()`メソッドを呼び出した場合は reject される。

これにより、ユーザーが意図しないうちに eyedropper が起動していて、クリックをしたら Web アプリケーションにスクリーン上 (Web アプリ内とは限らない)のピクセルデータが渡ってしまう、ということを防いでいる。

## 他ブラウザのサポート

- Mozilla には[Request for Position](https://github.com/mozilla/standards-positions/issues/557)が出されているが現在のところ回答はない。
- Webkit にも[Request for Position](https://lists.webkit.org/pipermail/webkit-dev/2021-July/031929.html)が出されているが、現在のところ回答はない。

## もともとの提案: `<input type=color eyedropper>`

EyeDropper API はもともと、既存の `input` 要素に `eyedropper` 属性を追加するという[提案だった](https://github.com/whatwg/html/issues/5584)。
が、 `HTMLInputElement` の API はすでに複雑化しており、ここにさらに`open`などのメソッドを追加するよりも新しい API を追加したほうがいいということになったようだ。

## おわりに

Web 全体に大きな影響を与える API ではないが個人的に色周りは好きなのでまとめた。Web 上で動くデザインツールなどに活かせるかもしれない。

現在の API では結果を sRGB の文字列で取得できるが、最近は Adobe RGB の 99% を表示可能なディスプレイも普及してきているし、sRGB では表現できない色域をどうするのかは気になっている。
