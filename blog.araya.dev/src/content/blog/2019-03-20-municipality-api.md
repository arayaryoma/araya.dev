---
title: "国土交通省の公開APIを用いて都道府県と市区町村のリストを取得する"
date: "2019-03-20"
tags:
  - JavaScript
  - tips
  - 公開API
---

日本の各都道府県および市区町村には[全国地方公共団体コード](https://ja.wikipedia.org/wiki/全国地方公共団体コード)というものが割り振られています。
また、[国土交通省が公開している API](http://www.land.mlit.go.jp/webland/api.html#todofukenlist)を用いて、これらの一覧を取得することができます。
JavaScript で軽いスクリプトを書いて、この API を呼び出しデータを整形して JSON にします。

[Gist](https://gist.github.com/arayaryoma/729d28e4eb99949b8f1dc95e3afc691d)

JS のコードだけ抜粋

```javascript
const prefectues = require("./prefectures");
const http = require("http");

const endpoint = "http://www.land.mlit.go.jp/webland/api/CitySearch";

const httpGet = (url) => {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      if (res.statusCode < 200 || res.statusCode > 299) {
        reject(new Error(res.statusCode));
      }
      const body = [];
      res.on("data", (chunk) => body.push(chunk));
      res.on("end", () => resolve(body.join("")));
    });
    req.on("error", (err) => reject(err));
  });
};

const getCities = async () => {
  for (let pref of prefectues) {
    const url = `${endpoint}?area=${pref.id}`;
    const res = JSON.parse(await httpGet(url));
    pref.cities = res.data;
  }
};

getCities().then(() => {
  console.log(JSON.stringify(prefectues));
});
```

当該 API では、都道府県コードを `area` URL query parameter に指定してリクエストを送らなければならないため、
都道府県ごとにリクエストを送る必要があります。

北海道の市区町村の一覧を取得する例: `GET http://www.land.mlit.go.jp/webland/api/CitySearch?area=01`

1 行目で `require` している `prefectures` は以下のようなデータ構造の JSON ファイルです。

```json
[
  {
    "id": "01",
    "name": "北海道",
    "name_en": "hokkaido"
  },
  {
    "id": "02",
    "name": "青森県",
    "name_en": "aomori prefecture"
  },
  {
    "id": "03",
    "name": "岩手県",
    "name_en": "iwate prefecture"
  },
  ...
]
```

## 利用する際の注意

- 全都道府県分のデータを取得するためには最低 47 回 `go.jp` ドメイン宛に HTTP request を送らなければならないため、テストで叩きすぎて DoS 攻撃認定されて補導・逮捕されないように注意しましょう
- この API は HTTPS での Request/Response のやり取りをすることができません。そのため、受け取ったレスポンスが改ざんされている可能性が 0 ではありません。

## 余談

この規模の小さいスクリプト書くのに外部 package に依存するのが嫌だったので、Node.js の標準パッケージだけで書いたが、 `http` を Promise にラップするコードを書くのが面倒だった。 Node に fetch API 入ってほしい。
