日本の各都道府県および市区町村には[全国地方公共団体コード](https://ja.wikipedia.org/wiki/全国地方公共団体コード)というものが割り振られています。
また、[国土交通省が公開しているAPI](http://www.land.mlit.go.jp/webland/api.html#todofukenlist)を用いて、これらの一覧を取得することができます。
JavaScriptで軽いスクリプトを書いて、このAPIを呼び出しデータを整形してJSONにします。

[Gist](https://gist.github.com/arayaryoma/729d28e4eb99949b8f1dc95e3afc691d)

JSのコードだけ抜粋

```javascript

const prefectues = require('./prefectures');
const http = require('http');

const endpoint = 'http://www.land.mlit.go.jp/webland/api/CitySearch';

const httpGet = url => {
    return new Promise((resolve, reject) => {
        const req = http.get(url, res => {
            if (res.statusCode < 200 || res.statusCode > 299) {
                reject(new Error(res.statusCode));
            }
            const body = [];
            res.on('data', chunk => body.push(chunk));
            res.on('end', () => resolve(body.join('')));
        });
        req.on('error', err => reject(err))
    })
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

当該APIでは、都道府県コードを `area` URL query parameterに指定してリクエストを送らなければならないため、
都道府県ごとにリクエストを送る必要があります。

北海道の市区町村の一覧を取得する例: `GET http://www.land.mlit.go.jp/webland/api/CitySearch?area=01`

1行目で `require` している `prefectures` は以下のようなデータ構造のJSONファイルです。

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
- 全都道府県分のデータを取得するためには最低47回 `go.jp` ドメイン宛にHTTP requestを送らなければならないため、テストで叩きすぎてDoS攻撃認定されて補導・逮捕されないように注意しましょう
- このAPIはHTTPSでのRequest/Responseのやり取りをすることができません。そのため、受け取ったレスポンスが改ざんされている可能性が0ではありません。

## 余談
この規模の小さいスクリプト書くのに外部packageに依存するのが嫌だったので、Node.jsの標準パッケージだけで書いたが、 `http` をPromiseにラップするコードを書くのが面倒だった。 Nodeにfetch API入ってほしい。
