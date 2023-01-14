---
title: Private Prefetch Proxy と Speculation Rulesによるprefetch/prerender
tags:
  - browser
  - Web API
date: "2021-08-12 00:00:00 +0900"
description: origin をまたいでsecureにprefetchを実行するために、中間にproxyを挟む提案がChromeチームから出されている。
layout: ../../layouts/Post.astro
---

## はじめに

この記事で述べている情報は、筆者が一次情報を調べ自分なりに理解をまとめたものである。

先にこの記事で参照している情報源をすべて列挙しておく。当然のことだが、最新かつ正確な情報は一次情報を当たることを推奨する。この記事はあくまで筆者のメモである。

- [alternate-loading-modes/triggers.md at main · jeremyroman/alternate-loading-modes](https://github.com/jeremyroman/alternate-loading-modes/blob/main/triggers.md)
- [Chrome Prerendering - The Chromium Projects](https://www.chromium.org/developers/design-documents/prerender)
- [Intent to Deprecate and Remove: Prerender](https://groups.google.com/a/chromium.org/g/Blink-dev/c/0nSxuuv9bBw/m/l0pN2tUjCQAJ)
- [Introducing NoState Prefetch | Web | Google Developers](https://developers.google.com/web/updates/2018/07/nostate-prefetch)
- [Resource Hints](https://www.w3.org/TR/resource-hints/)
- [buettner/private-prefetch-proxy: Proposal to use a CONNECT proxy to obfuscate the user IP address for privacy-enhanced prefetching.](https://github.com/buettner/private-prefetch-proxy)
- [private-prefetch-proxy/traffic-advice.md at main · buettner/private-prefetch-proxy](https://github.com/buettner/private-prefetch-proxy/blob/main/traffic-advice.md)
- [Chromium Blog: Continuing our journey to bring instant experiences to the whole web](https://blog.chromium.org/2020/12/continuing-our-journey-to-bring-instant.html)
- [Prerender2 [public]](https://docs.google.com/document/d/1P2VKCLpmnNm_cRAjUeE-bqLL0bslL_zKqiNeCzNom_w/edit#heading=h.ze3eels8iahe)

## Terms

この記事および記事中紹介する仕様や提案では、prefetch の文脈でいくつかの概念が登場するため、予め簡単に説明しておく。

- User: Web ブラウザを使ってサイトを閲覧しているユーザー
- Browser: Web ブラウザ
- Referrer: ユーザーが今滞在しているページ (図中 `a.example.org`)
- Publisher: prefetch リクエストを送る先の Web サイト、もしくはその提供者 (図中 `b.example.com`)
- Proxy: Brwoser と、Referrer もしくは Publisher の origin server との中間にある proxy server

![User, Browser, Referrer, Publisher, Proxy](/assets/images/speculation-rules/terms.svg)

## Prerendering / Prefetch

[Resource Hints](https://www.w3.org/TR/resource-hints/) の 1 つである Prerender の、 [Chrome におけるかつての実装](https://www.chromium.org/developers/design-documents/prerender)では
リンク先のリソースをユーザーが遷移するよりも先にダウンロードして、バックグラウンドで JS も実行してページを内部的にレンダリングしていたが、
2017 年はじめに[取り下げられ](https://groups.google.com/a/chromium.org/g/Blink-dev/c/0nSxuuv9bBw/m/l0pN2tUjCQAJ)、2018 年には[NoState Prefetch](https://developers.google.com/web/updates/2018/07/nostate-prefetch)という仕組みに置き換えられている。

Chrome の NoState Prefetch prerender の Resource Hint に対して発火し、リソースの先読みはするが JS の実行やレンダリングはしない。prefetch とは異なり、事前取得の対象が html なら html をスキャンして、サブリソースも含めて事前取得しておく。

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
![HTTP/2 CONNECT Proxy経由で www.google.comからa.example.comとb.example.orgへのprefetchが行われる](/assets/images/speculation-rules/ppp-google-example.svg)

これにより、Google の検索結果ページから各サイトへの prefetch を行うことでサイトへの遷移を高速に行うことができる。

この Google が提供するサービス での例は[Chromium Blog](https://blog.chromium.org/2020/12/continuing-our-journey-to-bring-instant.html)でが紹介されたものだが、記事執筆時点で筆者が Google Search で検証した限りは Private Prefetch Proxy 経由での prefetch や prerender は発見できなかった。
将来的になにかアナウンスがあるかもしれない。

## Opt-in / Opt-out

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

つまり、Well-Known URI で Traffic Advice を提示する以上、Publisher による Opt-out は、現状 origin 単位でしかできないようだ。

#### User による Opt-out

提案では User がブラウザのシークレットブラウジングモードを使っているときは prefetch は無効になるべきとされている。また、User はいつでも prefetch を無効にできるとされている。

> Users can opt-out of the feature at any time. Furthermore, users can temporarily opt-out of the feature by using their browser’s private browsing mode.

### Referrer による Opt-in

Referrer が prefetch が有益だと判断した場合は、Browser に対して prefetch を要求するリソースを指示する。その方法として用いられるのが [Speculation Rules](https://github.com/jeremyroman/alternate-loading-modes/blob/main/triggers.md#speculation-rules)だ。

#### Speculation Rules

Speculation Rules は、HTML 内の`script` タグに `type="speculationrules"` 属性を付け、JSON で記述する。

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

この JSON 形式で記述する Rules は、UA がすべてを理解することを保証するものではない。UA は理解できないルールを破棄する場合もある。

Rules の中身を見ていく。

##### 'prefetch' | 'prerender' | 'dns-prefetch' ...

まず key でその Rules がなんのアクションに対する Rules なのかを明示する。`prefetch` についての Rules を定義したいときは `"prefetch": Array<Rule>` の形で記述する。

取りうる key の文字列、つまり Speculation Rules で提示するアクションは以下のものがある。

- `"prefetch"`
- `"prerender"`
- `"dns-prefetch"`
- `"preconnect"`
- `"prefetch_with_subresources"`

##### source

Rule が適用される URL をどういう形式で UA に伝えるかを示すためのフィールド。
`"list"` を指定した場合は List rule、 `"document"` を指定した場合は Document rule として扱われる

##### List rule

List rule では `url` フィールドに Rule が適用される URL をリスト形式で明示的に指定する。

```js
{
  "source": "list",
  "urls": ["https://b.example.com/index.html", "https://b.example.com/main.css"],
}
```

##### Document rule

Document rule では UA に speculation を実行する対象の判断を任せる。
次に挙げるフィールドで、UA が対象として扱うことのできるリンク先を制限することができる。

- `"if_href_matches": [...]`: リンクの URL がリスト内の pattern のいずれかに一致することを要求
- `"if_not_href_matches": [...]`: リンクの URL がリスト内のどの pattern にもマッチしない
- `"if_selector_matches": [...]`: `link`要素がリスト内のいずれかのセレクタにマッチする
- `"if_not_selector_matches": [...]`: `link`要素がリスト内のどのセレクタにマッチしない

リスト内の要素は現在策定中の[URLPattern](https://github.com/WICG/urlpattern)で pattern を記述することができ、URLPattern のルールに従ってマッチするかどうかが判定される。

##### 拡張フィールド

Speculation Rules では将来的に Rule を拡張できるように設計されている。前述のとおり、UA は理解できない Rule は無視するので、拡張を理解できる UA だけがその拡張を使った Rule を適用することができる。

提案内では 2 つの拡張フィールドが例示されている。これらはあくまで例なので実際に UA がサポートするかは全くわからない。

###### Requirements

```js
"requires": ["anonymous-client-ip-when-cross-origin"]
```

Cross-origin のリクエストが発行された場合に、UA がリクエスト先のオリジンサーバーにクライアントの IP アドレスが見えないようにできるときだけ Rule がマッチする。

###### Handler URLs

```js
"handler": "/details/_prerender"
```

ナビゲーションが実際に発生する前に、同一 origin 上の任意の URL を prerender する。これにより例えば各商品ページの共通のテンプレートのみを prerendering できるようになる。

## これからの prefetch と prerender

- Referrer による Speculation Rules を用いた Opt-in
- Publisher による Traffic Advice を用いた Opt-out
- cross-origin な prefetch に対する Private Prfetch Proxy
  - User のブラウザの設定やブラウジングモードによる Opt-out

これらと既存の CSP などの仕組みを組み合わせて、セキュリティ面でもプライバシー面でもユーザーにとって安全な prefetch/prerender を実現しようという取り組みが Chromium チームを中心に進められている。

この取り組みは[Prerender2](https://docs.google.com/document/d/1P2VKCLpmnNm_cRAjUeE-bqLL0bslL_zKqiNeCzNom_w/edit?usp=sharing)と名付けられ、これからの実験の予定や懸念事項などがまとめられている。

現在は[Speculation Rules の Origin Trial](https://developer.chrome.com/origintrials/#/view_trial/4576783121315266561)が進行中だ。この Origin Trial は以下の制限付きで実施されている。

- 追加された Rule の処理のみを行う。削除については無視される。
- "prefetch_with_subresources" のみを受け入れる。
- List rules のみを受け入れる。
- same-origin URL のみを受け入れる。
- "anonymous-client-ip-when-cross-origin" の場合を除きリダイレクトには従わない。
  - 実験のため、これを持つ Rule は Google が持つ allow list に登録されている origin からのみ受け入れられる。

どうやら Chrome では先述した Rule 拡張である `"requires": ["anonymous-client-ip-when-cross-origin"]`をサポートする予定のようだ。

## 試してみたが上手くいかず

OT token を発行し、Intent to Experiment に記載されていた制限を守った最低限の Speculation Rules を置いてみた。

- [https://playground.araya.dev/speculation-rules-prefetch/](https://playground.araya.dev/speculation-rules-prefetch/)

が、残念ながら prefetch が動作している様子は観測できなかった。OT token に併せ、`chrome://flags/#enable-prerender2` も有効にしてみたがやはり動いているようにはみえなかった。

記録用に `chrome://version` の情報を残しておく。

```
Google Chrome 94.0.4604.0 (Official Build) canary (x86_64)
Revision e401077b3b0ac41054ac7391bab56a646dab94d8-refs/branch-heads/4604@{#1}
OS macOS Version 11.4 (Build 20F71)
JavaScript V8 9.4.133
User Agent Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4604.0 Safari/537.36
```

## おわりに

一度は取り下げられた prerender や、ユーザーのプライバシーを守った上での prefetch を実現するためにいくつかの提案を組み合わせた取り組みは非常に面白い。

今後どの程度パフォーマンスに影響を与えるか、実際にユーザーのプライバシーは守られるのかといったレポートが上がってくるのが楽しみだ。
