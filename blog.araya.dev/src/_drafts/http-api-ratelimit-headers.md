IETFのHTTP API Working Groupで[RateLimit header fields for HTTP](https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-07.html)という仕様の策定が進められている。

HTTP経由でデータを取得するいわゆるWebAPIの実装では、クライアントに対しリクエストのコール数を制限(rate limiting)することがある。
このdraftはそのrate limitをサーバーがクライアントに伝える際のレスポンスフォーマットを標準化しようというものだ。
レスポンスフォーマットを標準化することで、まったく別のライブラリに起因するWebAPIフレームワークとクライアントのデータフェッチライブラリで、
標準に則った仕様で実装することができる。

### response header fields
このdraftでは2つのresponse header fields (以降は単にheaderと呼ぶ)が提案されている。

#### RateLimit
RateLimit headerの外観はこのように単純なkeyとvalueのpairを持つSFVの形式になっている。
```
limit=100, remaining=50, reset=5
```
サーバーがRateLimit headeをresponseする場合は、`limit`, `reset` keyについてはrequired、`remaining`についてはoptionalとなっている。

##### limit 
limitはわかりやすくサーバーが一定時間(window)内に受け付けるリクエストの数を示す。このlimitの値はpathだけでなくquery paramsなどによっても変わりうるため、API全体のrate limitは
後述のRateLimit-Policyで指定する。

#### remaining
remainingもそのkey名の通り、一定時間内に可能なAPIコール数の残りを示している。ただし、draftではclientはこのremainingの値が保証されていることを前提にしてはいけないとされている。

#### reset

