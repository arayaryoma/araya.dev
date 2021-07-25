---
title: Speculation Rules
tags:
  - browser
  - Web API
date: "2021-07-26 00:00:00 +0900"
---

Google / Chromium の開発チームから Speculation Rules という仕組みが提案されていれ、Origin Trial による実験が始まっている。

- Explainer: https://github.com/jeremyroman/alternate-loading-modes/blob/main/triggers.md
- Intent to Experiment: https://groups.google.com/a/chromium.org/g/blink-dev/c/Cw-hOjT47qI
- Origin Trial: https://developer.chrome.com/origintrials/#/view_trial/4576783121315266561

## Prerendering / Prefetch

Chrome にはかつて、リンク先のリソースをユーザーが遷移するよりも先にダウンロードして、バックグラウンドで JS も実行してページをロードしておく[prerendering](https://www.chromium.org/developers/design-documents/prerender)という仕組みがあったが、
2017 年はじめに[取り下げられ](https://groups.google.com/a/chromium.org/g/Blink-dev/c/0nSxuuv9bBw/m/l0pN2tUjCQAJ)、2018 年には[NoState Prefetch](https://developers.google.com/web/updates/2018/07/nostate-prefetch)という仕組みに置き換えられている。

Chrome の NoState Prefetch はリソースの先読みはするが JS の実行やレンダリングはしない。仕様 としての `prefetch` や `prerender` などは [Resource Hints というひとまとまりのドラフトとして提案されている](https://www.w3.org/TR/resource-hints/)。

JS の事前実行やレンダリングをやめたことにより、メモリを過剰に利用してしまう問題は解消できたが、そもそも prefetch 自体にも、cross-origin での prefetch では、ユーザーが明示的に遷移先に関心を示す前に cookie や IP アドレスなどの情報が遷移先に渡ってしまうというプライバシー上の懸念があった。

![https://foobar.exampleに対してはユーザーの明示的な遷移、https://hogehoge.exampleに対しては、ユーザーの実際の関心に関係なくprefetchによりIPアドレスなどが送られてしまう](/assets/images/speculation-rules/prefetch.svg)

これを解決するために Chrome チームが実験を進めているのが [Private Prefetch Proxy](https://github.com/buettner/private-prefetch-proxy)という仕組みだ。

## Private Prefetch Proxy

prefetch をする際に cookie などの特定の HTTP header を送らないようにする仕組みはブラウザのエンジンで実装可能だが、ユーザーの IP アドレスを隠すような仕組みはネットワークの通信に介入する必要がある。
このための proxy を用意してしまおうというのが Private Prefetch Proxy だ。

Private Prefetch Proxy は [HTTP/2 CONNECT method](https://httpwg.org/specs/rfc7540.html#rfc.section.8.3)を用いてクライアントサーバー間に Proxy を設置し、prefetch のリクエストが送られてきたサーバーから見ると、リクエスト元の IP アドレスは実際のユーザーではなく中間にいる Proxy のものになる。
HTTP/2 CONNECT ではクライアント-サーバー間では TLS 接続により通信が暗号化されているため、Proxy から内容を盗み見ることはできないようになっている。

### Google/Chrome での例

Chrome および Google では、例えば Google Search などの Google のサービスからの prefetch でのみ、Google が提供する Proxy を経由してリクエストが送られる。
