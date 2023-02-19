---
title: ECH の config を well-known URI で配布するドラフトのメモ
tags:
  - TLS
  - IETF draft
date: "2023-02-17 23:23:23 +0900"
description: IETF でdraftとして議論が進められている A well-known URI for publishing ECHConfigList values. のメモ
draft: true
---

## Encrypted Client Hello (ECH) の設定の課題

現状 Chrome などで実装が進んでいる[ECH](https://chromestatus.com/feature/6196703843581952)は、サーバーが生成した ECH 用の公開鍵を DNS の`HTTPS` resource record の値の ECHConfigList に設定していることが前提になっている。
この DNS の resource record に依存するやり方は、サーバーの管理者が ECH 用の鍵ペアを更新する際に

- サーバー管理者の管轄外の DNS に resource record が登録されている可能性がある
- 鍵の更新時に resource record の値を自動的に書き換える API が DNS プロバイダーから提供されているとは限らない

という課題があった

## well-known URI と zone factory

このような背景があり提案された draft が [A well-known URI for publishing ECHConfigList values.](https://datatracker.ietf.org/doc/draft-ietf-tls-wkech/) だ。

この draft では

- サーバー管理者が well-known URI で ECHConfigList の値を配布する
- DNS の resource record への書き込み権限を持つ存在が、https クライアントとして well-known URI から ECHConfigList の値を取得し、DNS の HTTPS resource record に書き込む
  - (draft ではこのような存在を **zone factory** と呼称している)

という仕組みでサーバー側の鍵更新と DNS の resource record の更新を同期させることを提案している。

### well-known URI で ECHConfigList の値を配布する

サーバーは zone factory 向けに https://{HOSTNAME}/.well-known/origin-svcb に JSON コンテンツを置く。この JSON には以下のような情報を含める

- SVCB record の AliasMode と等価の設定
- SvcPriority に対応する設定
- TargetName に対応する設定
- SvcParamKey の port に対応する設定
- ECHConfigList を 含む base64 encoded な文字列。SvcParamKey の ech に対応する設定

JSON format は現在議論中であり、draft-00 から draft-01 でも大きく変わったため、今後も変更される可能性が大いにある。

#### AliasMode 相当

AliasMode を利用するときの JSON コンテンツの例はこのようになる。

```json
// https://foo.example.com/.well-known/origin-svcb
{
  "alias": "foo.example.com:443"
}
```

#### ServiceMode 相当

AliasMode を用いずに、ServiceMode に対応する設定はこのようになる。

```json
// https://foo.example.com/.well-known/origin-svcb
{
  "endpoints": [
    {
      "priority": 1,
      "target": "foo.example.com",
      "ech": "Zm9vYmFy.....aG9nZQ=="
    },
    {
      "priority": 1,
      "port": 8443,
      "ech": "Zm9vYmFy.....aG9nZQ=="
    },
    {}
  ]
}
```

空の endpoint (`{}`) は、

- SvcPriority が 未設定 (推論に任せる)であり
- TargetName が `.` であり
- ECH を サポートしていない

HTTPS resource record に対応する。これは HSTS を利用する方法の 1 つになる。

### zone factory の挙動

zone factory は `/.well-known/origin-svcb` から JSON を fetch したら、DNS の resource record を設定し公開する前に、提示された endpoint が動作していて Origin にアクセス可能であることをテストする。
また、 zone factory は GREASEd ECH を送信して、返ってきた retry-config と ECHConfig 値の整合性を確認することができる。

#### `/.well-known/origin-svcb` の freshness と DNS の TTL

サーバー管理者が`/.well-known/origin-svcb`に配置する JSON を、例えば `cache-control: max-age=3600` で配布しているとする。これは ECH の設定が最短 1h で更新されうることを意味する。そのため、zone facttory はこの JSON の freshness time を考慮して十分短い時間で DNS の resource record の TTL を設定する必要がある。
