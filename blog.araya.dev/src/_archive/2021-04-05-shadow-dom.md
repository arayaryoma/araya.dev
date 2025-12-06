---
title:
tags:
  - browser
  - ShadowDOM
date: "2021-02-16"
---

WebComponents におけるカプセル化のための技術として、ShadowDOM がある。

[Can I use によると](https://caniuse.com/shadowdomv1)現在 Shadow DOM API V1 は IE を除く主要ブラウザでは利用することができるようになっている。

ただ、Shadow DOM には実用上不足する部分がいくつかあり、それらを埋めるために Declarative Shadow DOM と Imperative Shadow DOM Distrubution API というものが提案され各ブラウザでの実装も進んできている。

- Declarative Shadow DOM: https://github.com/mfreed7/declarative-shadow-dom/blob/master/README.md
- Imperative Shadow DOM Distribution API: https://github.com/WICG/webcomponents/blob/gh-pages/proposals/Imperative-Shadow-DOM-Distribution-API.md

この記事では Shadow DOM API v1 のおさらいと、現状の API の何を解決するためにこれらが提案されているかについてまとめる。
また、本記事では

## Shadow DOM
