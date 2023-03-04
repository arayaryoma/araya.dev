---
title: "このWebサイトのstyleを書き換えた(v0.3.0)"
date: "2017-08-06"
tags:
  - Web Front-end
  - update
  - 雑記
---

今まで[scribble](https://github.com/muan/scribble)ていう jekyll theme を使ってたんだけど、
scribble をベースに style 書き換えた。
reset.css に[normalize.css](https://necolas.github.io/normalize.css/)使ってるくらいで、
ほかは全部自分で書くようにした。

![compare]({{site.url}}/images/2017-08-06-newversionsite/compare.jpg)

左が古いやつで右が新しいやつ

テンプレートの数めっちゃ少ないし、シンプルなレイアウト構成にしてるので、[stylesheet も 150 行くらい](https://github.com/Allajah/allajah.github.io/blob/master/_sass/_style.scss)で済んでる。

### 使用した外部リソース

- [Font Awesome](http://fontawesome.io/)
- [normalize.css](https://necolas.github.io/normalize.css/)
- [Noto Sans](https://www.google.com/get/noto/)
