IETFのHTTP API Working Groupで[RateLimit header fields for HTTP](https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-07.html)という仕様の策定が進められている。

HTTP経由でデータを取得するいわゆるWebAPIの実装では、クライアントに対しリクエストのコール数を制限(rate limiting)することがある。
このdraftはそのrate limitをサーバーがクライアントに伝える際のレスポンスフォーマットを標準化しようというものだ。
レスポンスフォーマットを標準化することで、まったく別のライブラリに起因するWebAPIフレームワークとクライアントのデータフェッチライブラリで、
標準に則った仕様で実装することができる。

### response header fields
このdraftでは`RateLimit`, `RateLimit-Policy`という2つのresponse header fields (以降は単にheaderと呼ぶ)が提案されている。

全体観としては、例えば `GET https://api.example/articles?user=araya` というリクエストに対してのレスポンスに
```
RateLimit: limit=100, remaining=99, reset=3000
RateLimit-Policy: 10;w=1, 100;w=3600
```
が付与されていたとすると、このエンドポイントは
- 秒間1回、1時間あたり100回のリクエストを許可している
- 指定されたリソースに対しては残り99回アクセスすることができる
- 50分(3000秒)後にlimit消費のカウントがリセットされる

ことを示している。

なお、これらはあくまでクライアント実装へのヒントであり、クライアントはサーバーが送ってくるこれらの値が
保証されているものと認識してはならないとdraft内には記載がある。


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
受けっとたリクエスト数をカウントしてremainingを減らしていく実装をサーバーでしているはずだが、そのカウントがリセットされるまでの秒数