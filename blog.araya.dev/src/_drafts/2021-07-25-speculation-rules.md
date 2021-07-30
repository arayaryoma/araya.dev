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

## Terms

この記事および記事中紹介する draft では、prefetch の文脈でいくつかの概念が登場するため、予め簡単に説明しておく。

- User: Web ブラウザを使ってサイトを閲覧しているユーザー
- Browser: Web ブラウザ
- Referrer: ユーザーが今滞在しているページ (図中 `a.example.org`)
- Publisher: prefetch リクエストを送る先の Web サイト、もしくはその提供者 (図中 `b.example.com`)
- Proxy: Brwoser と、Referrer もしくは Publisher の origin server との中間にある proxy server

## Prerendering / Prefetch

Chrome にはかつて、リンク先のリソースをユーザーが遷移するよりも先にダウンロードして、バックグラウンドで JS も実行してページをロードしておく[prerendering](https://www.chromium.org/developers/design-documents/prerender)という仕組みがあったが、
2017 年はじめに[取り下げられ](https://groups.google.com/a/chromium.org/g/Blink-dev/c/0nSxuuv9bBw/m/l0pN2tUjCQAJ)、2018 年には[NoState Prefetch](https://developers.google.com/web/updates/2018/07/nostate-prefetch)という仕組みに置き換えられている。

Chrome の NoState Prefetch はリソースの先読みはするが JS の実行やレンダリングはしない。仕様 としての `prefetch` や `prerender` などは [Resource Hints というひとまとまりのドラフトとして提案されている](https://www.w3.org/TR/resource-hints/)。

JS の事前実行やレンダリングをやめたことによりメモリを過剰に利用してしまう問題は解消できたが、そもそも prefetch 自体にも、cross-origin での prefetch では、ユーザーが明示的に遷移先に関心を示す前に cookie や IP アドレスなどの情報が遷移先に渡ってしまうというプライバシー上の懸念があった。

![https://foobar.exampleに対してはユーザーの明示的な遷移、https://hogehoge.exampleに対しては、ユーザーの実際の関心に関係なくprefetchによりIPアドレスなどが送られてしまう](/assets/images/speculation-rules/prefetch.svg)

これを解決するために Chrome チームが提案し、実験を進めているのが [Private Prefetch Proxy](https://github.com/buettner/private-prefetch-proxy)という仕組みだ。

## Private Prefetch Proxy

prefetch を行う際に cookie などの特定の HTTP header を送らないようにする仕組みはブラウザのエンジンで実装可能だが、ユーザーの IP アドレスを隠すような仕組みはネットワークの通信に介入する必要がある。
このための proxy を用意してしまおうというのが Private Prefetch Proxy だ。

Private Prefetch Proxy は [HTTP/2 CONNECT method](https://httpwg.org/specs/rfc7540.html#rfc.section.8.3)を用いてクライアントサーバー間に Proxy を設置し、prefetch のリクエストが送られてきたサーバーから見ると、リクエスト元の IP アドレスは実際のユーザーではなく中間にいる Proxy のものになる。
HTTP/2 CONNECT ではクライアント-サーバー間では TLS 接続により通信が暗号化されているため、Proxy から内容を盗み見ることはできないようになっている。

### Google/Chrome での例

Chrome および Google では、Google が提供しているサービスからの prefetch でのみ、Google が提供する Proxy を経由してリクエストが送られる。
例えば、Google Search で `a.example.com` と `b.example.org` を prefetch するときは下の図のようになる。
![](/assets/images/speculation-rules/ppp-google-example.svg)

これにより、Google の検索結果ページから各サイトへの prefetch を行うことでサイトへの遷移を高速に行うことができる。

この Google が提供するサービス での例は[Chromium Blog](https://blog.chromium.org/2020/12/continuing-our-journey-to-bring-instant.html)でが紹介されたものだが、記事執筆時点で筆者が Google Search で検証した限りは Private Prefetch Proxy 経由で prefetch/prerender を実行している形跡は見当たらなかった。
将来的になにかアナウンスがあるかもしれない。

### Opt-in / Opt-out

### Opt-out

Private Prefetch Proxy を用いた prefetch / prerender を行って欲しくないユーザーもしくは Web サイトコンテンツ提供者(Publisher)のために、Opt-out する手段も提案されている。

#### Publisher による Opt-out

Publisher による Opt-out は、[Traffic Advice](https://github.com/buettner/private-prefetch-proxy/blob/938f6c024330672e68b7085c1fa17483c1bcbe36/traffic-advice.md)という仕組みを用いる方針で進められている。

`/.well-known/traffic-advice` という Well-Known URI へのリクエストに対し、 `content-type: application/trafficadvice+json` で OK な response を返し、Private Prefetch Proxy からのリクエストを許可しないことを伝える。

```json
[{ "user_agent": "prefetch-proxy", "disallow": true }]
```

これを受け取った UA(prefetch-proxy)は、この結果を cache し、定期的に Traffic Advice を再検証するためのリクエスト`GET /.well-known/traffic-advice`を origin server に対し送るが、それ以外のリクエストは許可がされるまで(`"dissallow": false`となるまで) 一切送信しない。

`GET /.well-known/traffic-advice` に対し 404 などのエラーが返された場合は UA(ここでは Private Prefetch Proxy)は自身が持つデフォルトの挙動を採用する。

robots.txt のような仕組みだと捉えるとわかりやすい。robots.txt を使わずにあらたに Well-Known URI を定義したのは

- robots.txt はクローラーエンジンのためのものである
- robots.txt は path ごとのハンドリングも可能だが、CONNECT proxy のような path ごとに振る舞いを変えないような UA に対しては不向き

といったことが[理由に挙げられている](https://github.com/buettner/private-prefetch-proxy/blob/938f6c024330672e68b7085c1fa17483c1bcbe36/traffic-advice.md#why-not-robotstxt)。

つまり、Well-Known URI で Traffic Advice を提示する以上、Publisher による Opt-out は、現状 Origin 単位でしかできないようだ。

#### User による Opt-out

提案では User がブラウザのシークレットブラウジングモードを使っているときは prefetch は無効になるべきとされている。また、User はいつでも prefetch を無効にできるとされている。

> Users can opt-out of the feature at any time. Furthermore, users can temporarily opt-out of the feature by using their browser’s private browsing mode.

### Referrer による Opt-in

Referrer が prefetch が有益だと判断した場合は、Browser に対して prefetch を要求するリソースを指示する。その方法として用いられるのが [Speculation Rules](https://github.com/jeremyroman/alternate-loading-modes/blob/main/triggers.md#speculation-rules)だ。

#### Speculation Rules

Speculation Rules は、HTML 内の`script` タグに `type="speculationrules"` 属性を指定し、json 形式で記述する。

```jsx
<script type="speculationrules">
  {
  "prefetch": [
    {
      "source": "list",
      "urls": ["https://b.example.com/index.html"],
      "requires": ["anonymous-client-ip-when-cross-origin"]
    }
  ],
  "prerender": [
    { "source": "list", "urls": ["/page/2"], "score": 0.5 },
    {
      "source": "document",
      "if_href_matches": ["https://*.c.example.net/**"],
      "if_not_selector_matches": [".restricted-section *"],
      "score": 0.1
    }
  ]
}
</script>
```
