---
title: What is webbotauth WG
tags:
date: "2025-12-02"
description: ""
draft: true
---

HTTP Advent Calendar 2025 Day 2

---

[Day 1](/posts/2025-12-01-http-advent-calendar-day-1) の最後に触れた[Web Bot Auth (webbotauth)](https://datatracker.ietf.org/wg/webbotauth/about/)について、スコープやモチベーションを少し深く掘ってみる。

## Scopes

[WGのページ](https://datatracker.ietf.org/wg/webbotauth/about/)によると、webbotauthは

- 検索インデックスのためのクローラー
- Webアーカイブ
- リンクチェッカーやvalidatorなどのツール
- AI学習のためのクローラー
- (AIエージェントの)ユーザーの代わりにコンテンツを取得・操作するAIエージェント

これらに対しWebサイトへのアクセスを暗号を用いて認証することをスコープとしている。以下のようなケースはこのWGのスコープ外としている。

- HTTP APIなど、そもそも人間が直接利用することを想定していないアクセス
- エンドユーザーに対する認証
- HTTP以外のアプリケーションプロトコル
- 暗号を使用しない認証
- botの意図を表現するための語彙の定義
- 特定のbotの追跡や評価
- botとそうでないクライアントを区別するための技術

つまり、人間がアクセスするためのWebサイトにアクセスしてきたbotに対して、アクセスを許可するかを認証により制御したいというユースケースがモチベーションになっている。

## Chairs

webbotauthのchairsは、GoogleでOHTTPやMASQUEのマネージャーをしていて数々のネットワークスタックのdraftを出してきたDavid Schinazi氏と、oauthのchairも兼任していてDigest AccessなどのAuthまわりのいくつかのRFCの著者であるRifaat Shekh-Yusef氏が務めている。

## Motivations

webbotauthは2025年3月に開催されたIETF 122でのside meetingでの議論を元に発足された。[2025年3月17日にメーリングリストが作成されている](https://mailarchive.ietf.org/arch/msg/web-bot-auth/tv0xvOa1xcMWiEjZh1QdrWr4lk8/)。
side meetingであるため実際の議事録は残っていないが、[mnot氏のMLへの投稿](https://mailarchive.ietf.org/arch/msg/web-bot-auth/oyEJfuJ0LuRy0PJ6St_U5bMknN8/)からざっくりどんな意見が出たのかを掴める。

- 議論のscopeを、人間向けのサイトで人間以外に認証をかけること と明確にした
- 一般的にはUserAgentやClient IP address でのアクセス許可が一般的な方法
  - しかし、十分に機能しなくかつインターネットにとってよくない(not good for internet) という点で合意があった
- 新しく、何らかの暗号メカニズムを使う必要があると考えられている
- いくつかのユースケースがある
  - クローラーおよび、行儀の良いbotの識別(検索エンジン、Webアーカイブなど)
  - LLMクローラーの識別
  - CAPTCHA, WAFなどのサービスに対する基地のクライアントの識別
  - ユーザーの代理として行動するAIエージェントの識別
    - 信頼できるインフラからのリクエスト
    - 信頼できないpartyからのリクエスト
- いくつかの候補について活発に議論をした。それぞれ問題点が指摘された。
  - OAuth: 一般的に人間向けのWebサイトとうまく連携しない
  - PrivacyPass: クライアントを識別するためにトークンを発行する必要がある
  - HTTP Concealed Authentication: 実装のハードルがある。関心があまりなかった
  - mTLS: デプロイに関する懸念
  - HTTP Signatures(RFC9421): 効率に関する懸念
- 簡単なユースケースはmTLSもしくはHTTP Signaturesのいずれかで対処できる可能性が高い
  - それぞれのソリューションにたいして懸念はあるが、どれか1つだけを推奨する必要はない(方法は複数あってもいい)
- エージェント的なユースケースにはついてはもう少し慎重に議論しながら、単純なユースケースに焦点をあてる

## 感想

実際自分が関わっているところでも、botからのアクセスについて、GoogleのクローラーやE2E、外形監視は許可したいがAI botは拒否したい(もしくはひとまず識別だけしたい)というニーズはある。

まずは識別できることが重要で、FastlyやCloudflareなどの大手CDN vendor はこのための機能を提供している。しかしそれもip addressやUA, header fieldsなどheuristicに判定するしかないため、このWGによる提案が進めばコンテンツ事業者としてはコントロールしやすくなるだろう。

---

次はwebbotauthで策定しているdraftの具体的中身を見ていく。
