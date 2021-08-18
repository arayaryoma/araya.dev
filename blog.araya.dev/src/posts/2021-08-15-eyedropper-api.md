---
title: EyeDropper API で Webサイトからスポイト(color picker)を起動する
tags:
  - browser
  - Web API
date: "2021-08-15 00:00:00 +0900"
---

## EyeDropper API とは

[EyeDropper API](https://wicg.github.io/eyedropper-api/) という API が WICG で提案されている。"eyedropper"とは、スポイトのことで、画像編集ソフトなどによくある色を抽出する機能のことだ。

eyedropper を OS などのカラーピッカーを介さずにブラウザから直接できる API がこの EyeDropper API で、Chrome ではすでに実装が進み、[ship がアナウンスされている](https://groups.google.com/a/chromium.org/g/blink-dev/c/rdniQ0D5UfY/m/Aywn9XyyAAAJ)。

## モチベーション

```html
<div></div>
```
