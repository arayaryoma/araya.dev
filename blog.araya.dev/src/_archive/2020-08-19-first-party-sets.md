# First-Party Sets

- ブラウザごとに様々なトラッキング防止のポリシーや仕組みがある。
  - ITP
  - ETP, RTP
  - MS Edge Tracking Prevention

ユーザーの識別をファーストパーティに限定している。

2つのゴールのバランス

- ユーザーのプライバシーの取得を必要最低限にする
- サイト上でユーザーが求める十分な機能を提供できる

1つのスコープとしてはtop-levelのoriginで分けるという方法が自然だが、
実際には`https:///araya.dev` `https://blog.araya.dev` など、1つのサイト上で
保持者が同じ複数のoriginにリクエストをする場合がある。

1つのユーザーIDが関連する複数のオリジンにまたがることを許可したい場合がある。
Firefoxではこれを実現するために、originは異なるが所有者が同じだということをTracking Protectionに伝えるための[リスト](https://github.com/mozilla-services/shavar-prod-lists#entity-list)を作成している。

First-Party setsではこれをサイト提供者からUA(ブラウザ)に伝える仕組みを提案する。

## 達成したいこと

- 関連するドメインを同一のfirst-partyとして宣言できること
- その宣言されたドメインがプライバシーメカニズム上で同じサイトだとブラウザが扱うためのフレームワークを定義すること

## ゴール外

- 関連の無いサイトの3rd partyサインイン(SSO?)
- 広告ターゲティング/コンバージョン測定ツールとの情報のやりとり
- その他の関連のないサイトを含むユースケース

## First-Party set

first-party setは所有者が登録しているドメイン(owner)と、それに関連するドメイン(secondary)で宣言される
次の条件を満たすとfirst-party setとして扱われる

- schemeがhttps
- 登録されているドメインがownerもしくはsecondary

これはwell-known URL `https://<domain>/.well-known/first-party-set` から提供されるJSON manifestに記述する。

explainerから例を引用する

`https://a.example.com/.well-known/first-party-set`

```json
{
  "owner": "a.example",
  "version": 1,
  "members": ["b.example", "c.example"],
  "assertions": {
    "chrome-fps-v1": "<base64 contents...>",
    "firefox-fps-v1": "<base64 contents...>",
    "safari-fps-v1": "<base64 contents...>"
  }
}
```

`https://b.example/.well-known/first-party-set`

```json
{ "owner": "a.example" }
```

`https://c.example/.well-known/first-party-set`

```json
{ "owner": "a.example" }
```

- `owner`: ownerのdomainを記載する。
- `members`: ownerとなるdomainに対し、secondaryとなるdomainをリストで指定する。ここでownerの`members`のリストにあるドメインのmanifestの`owner`がownerと一致しなければ無視される。
- `version` manifestのバージョン番号
- `assetions`:

`members`の要素でUA policyを満たす要素だけが受け入れられ、その他は無視される。owner自体がUAポリシーを満たさない場合はset全体が無視される。
