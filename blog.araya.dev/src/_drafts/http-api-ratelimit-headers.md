IETF の HTTP API Working Group で[RateLimit header fields for HTTP](https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-07.html)という仕様の策定が進められている。

HTTP 経由でデータを取得するいわゆる WebAPI の実装では、クライアントに対しリクエストのコール数を制限(rate limiting)することがある。
この draft はその rate limit をサーバーがクライアントに伝える際のレスポンスフォーマットを標準化しようというものだ。
レスポンスフォーマットを標準化することで、まったく別のライブラリに起因する WebAPI フレームワークとクライアントのデータフェッチライブラリの
相互運用性が向上することが期待できる。

### response header fields

この draft では`RateLimit`, `RateLimit-Policy`という 2 つの response header fields (以降は単に header と呼ぶ)が提案されている。

全体観としては、例えば `GET https://api.example/articles?user=araya` というリクエストに対してのレスポンスに

```
RateLimit: limit=100, remaining=99, reset=3000
RateLimit-Policy: 10;w=1, 100;w=3600
```

が付与されていたとすると、このエンドポイントは

- 秒間 1 回、1 時間あたり 100 回のリクエストを許可している
- 指定されたリソースに対しては残り 99 回アクセスすることができる
- 50 分(3000 秒)後に limit 消費のカウントがリセットされる

ことを示している。

なお、これらはあくまでクライアント実装へのヒントであり、クライアントはサーバーが送ってくるこれらの値が
保証されているものと認識してはならないと draft 内には記載がある。

#### RateLimit header

RateLimit header の外観はこのように単純な key と value の pair を持つ Structured-Field-Value(SFV)の形式になっている。

```
limit=100, remaining=50, reset=5
```

サーバーが RateLimit heade を response する場合は、`limit`, `reset` key については required、`remaining`については optional となっている。

##### limit

limit はわかりやすくサーバーが一定時間(window)内に受け付けるリクエストの数を示す。この limit の値は path だけでなく query params などによっても変わりうるため、API 全体の rate limit は
後述の RateLimit-Policy で指定する。

#### remaining

remaining もその key 名の通り、一定時間内に可能な API コール数の残りを示している。ただし、draft では client はこの remaining の値が保証されていることを前提にしてはいけないとされている。

#### reset

受けっとたリクエスト数をカウントして remaining を減らしていく実装をサーバーでしているはずだが、そのカウントがリセットされるまでの秒数

#### RateLimit-Policy header

RateLimit-Policy ではサーバーがどの時間内にどれだけのリクエストを受け付けるかというポリシー(quota policy)を
SFV のリスト形式で記述できる。
quota policy の記述方法例は

```
10;w=1
```

となり、これは 1 秒間に 10 回のリクエストを受け付けることを示している。
w で指定しているのが window であり異なる window での limit をリストで指定できる。

```
RateLimit-Policy: 10;w=1, 100;w=3600
```

### クライアントに求められる挙動

draft ではクライアント実装に求められる要件や注意点がいくつか書かれている。

- RateLimit header の remaining が 1 以上だからといって次のリクエストが必ず受け入れられると期待してはならない
- 違反している RateLimit header を受け取ったら無視しなければならない
- 一度サーバーが RateLimit header を送ってきたからといって、その後のリクエストには必ず RateLimit header が付与されることを期待してはならない

冒頭に述べたあくまでもヒントである、というのがクライアントへの要件(MUST/MUST NOT)からも見て取れる
