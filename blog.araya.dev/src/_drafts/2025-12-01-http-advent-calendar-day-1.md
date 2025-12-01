---
title: HTTP関連のworking group
tags:
  - http
  - advent calendar 2025
date: "2025-12-01"
description:
---

HTTP Advent Calendar 2025 Day 1

---

IETFには様々なWorking Group(WG, わーじー)がある。

https://datatracker.ietf.org/wg/

それぞれのWGはフォーカスするエリアが決まっており、WGごとにいくつかのdraftをRFCに向け策定を進めている。
個人が提案したInternet-Draft(id)は会議を通してWGが承認(accept)することにより、WGで議論していくことになる。

さらにWGはカテゴリごとにAreaにまとめられておりHTTPなどWeb関連のWGはWeb and Internet Transport (WIT) Areaに属している。
プロトコル・スタック上はWITの中の殆どがHTTPに関係あるといえばあるが、ここで扱うものは自分自身の興味範囲をもとにある程度絞る。

### HTTP WG (略称: `httpbis`)

https://datatracker.ietf.org/wg/httpbis/about/

HTTPそのもののセマンティクス(伝達する情報)やメッセージング(伝達する方法)についてのWG。Semantics, Caching, Structured Field Values for HTTP, HTTP/1.1, HTTP/2やそれぞれの拡張などを策定している。
HTTP/3については、HTTP/3の拡張はhttpbisで進められるが、HTTP/3は策定プロセス上quicの持ち物になっている。

2025年12月現在、策定中の主要なidは[rfc6265bis](https://datatracker.ietf.org/doc/draft-ietf-httpbis-rfc6265bis/)(Cookieの新しい仕様)などがある。

httpbisの `bis` は "twice" のラテン語であり、要するに「やり直し」や「改定」を意味する。IETFでは、WGの略称やidの接尾辞などによく使われる。

[RFC2616](https://datatracker.ietf.org/doc/html/rfc2616)を置き換える[RFC7230](https://datatracker.ietf.org/doc/html/rfc7230)を策定したころから `httpbis` で識別されており、9110~9114を策定するときもそのままにしたようだ。

### Building Blocks for HTTP APIs (略称: `httpapi`)

https://datatracker.ietf.org/wg/httpapi/about/

HTTPを使ったアプリケーション間の通信に焦点をあてているWG.

API といっても、JSON APIそのものを提供したり、JavaScriptから呼び出せるBrowser APIを定義しているわけではない。
あくまでHTTPのセマンティクスとメッセージングを利用して、実世界でWebアプリケーションを構築する上で役立つ、HTTP Fieldsなどの取り決めについて仕様やベストプラクティスを策定する。

プロトコルスタックのイメージ的にはHTTPの更に上にあるイメージになる。

### QUIC (略称: `quic`)

https://datatracker.ietf.org/wg/quic/about/

RFC9000でQUICが標準化されたのは記憶に新しい(といってももう4年半前だが...)。
QUICそのものや同時に策定されたHTTP/3、 QUIC TLSやQPACKなどHTTP/3を構築するために必要な仕様もquic WGで策定された。
QUIClog fileのschemaなどいくつかの拡張の策定作業が今も続いている。

### WebTransport (略称: `webtrans`)

https://datatracker.ietf.org/wg/webtrans/about/

[W3C](https://w3c.github.io/webtransport/)でAPIの策定が進んでいるWeb Transportについて、その通信プロトコルを定義するためのWG.
QUICやTCPのトランスポートプロトコルを利用するため、現在アクティブに策定中なidはわかりやすく、

- The WebTransport Protocol Framework (プロトコルの概要)
- WebTransport over HTTP/2
- WebTransport over HTTP/3

と、HTTP/2やHTTP/3の上で用いるためのプロトコルの策定が進んでいる。

### Web Bot Auth (略称: `webbotauth`)

https://datatracker.ietf.org/wg/webbotauth/about/

2025年6月に新設された新しいWG。

昨今、AIの激しい加熱により更に増加したCrawlerなどのbotに対してウェブサイトが認証をさせる標準プロトコルを策定する。

IP addressやUser-agentによる認証、[OAuth](https://datatracker.ietf.org/doc/html/rfc6749)や[PrivacyPass](https://datatracker.ietf.org/doc/rfc9576/)だとユースケースに適さないこともあり
、ユースケースを調査し何らかの暗号メカニズムで解決策を議論するためにIETF122のside meetingを起因に発足された。

[[Web-bot-auth] Welcome and summary of side meeting](https://mailarchive.ietf.org/arch/msg/web-bot-auth/L1GIYP9VG1xlJQ5ck8lT77D3Emk/)
