IETFのHTTP API Working Groupで[RateLimit header fields for HTTP](https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-07.html)という仕様の策定が進められている。

HTTP経由でデータを取得するいわゆるWebAPIの実装では、クライアントに対しリクエストのコール数を制限(rate limiting)することがある。
このdraftはそのrate limitをサーバーがクライアントに伝える際のレスポンスフォーマットを標準化しようというものだ。
レスポンスフォーマットを標準化することで、まったく別のライブラリに起因するWebAPIフレームワークとクライアントのデータフェッチライブラリで、
標準に則った仕様で実装することができる。

### response header fields
このdraftでは2つのresponse header fields (以降は単にheaderと呼ぶ)が提案されている。
