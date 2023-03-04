---
title: "JavaScript の NaN について"
date: "2017-12-15"
tags:
  - JavaScript
---

この記事は[#kosen10s Advent Calendar 2017](https://adventar.org/calendars/2199)の 15 日目の記事です。

昨日は[寒い日は紅茶に砂糖を入れて飲むとおいしい - 死後裁きにあう](http://cycloneo.hatenablog.com/entry/2017/12/14/215238)でした。
美味しい紅茶が飲みたくなりました。

2 つとった枠のうち 1 つは技術系の記事を書こうと思ってたのですが、準備不足もあり小ネタです。

JavaScript でコードを書いていると、まれに`NaN(Not a Number)`に遭遇することがあります。
別に知ってれば大したことないのですが、若干ややこしくて厄介なので NaN について解説したいと思います。

## どういうときに遭遇するか

NaN は`Math` object の関数に引数として不適な値を渡したり、`parseInt()`などで文字列を数値に変換させようとすると返ってくることがあります。

また、`let x = NaN`のように代入可能です。

例:

```javascript
Math.sqrt(-1); // => NaN 虚数は返ってこない
parseInt("hello", 10); // => NaN
```

`https://example.com?page=18`という URL から`page`パラメータを取得し、その値に応じて表示する内容を書き換える
といったコードを書いた時、`https://example.com?page=hello`に対しては例外処理が必要です。

ちなみに、数値`x(!==0)`を`0`で割ったときには`Infinity`もしくは`-Infinity`となり、`0 / 0`は`NaN`となります

## Truthy, Falsy

`NaN`を単体で評価すると Falsy になります。直感的ですね。

```javascript
NaN ? "foo" : "hoge"; // => 'hoge'
```

## 比較

`NaN`は比較演算子で評価した場合、どんな値とも等価にはなりません。
ここで気をつけなければいけないのが、`NaN === NaN`が`false`になることです。

```javascript
NaN === false; // => false
NaN === 0; // => false
NaN > 0; // => false
NaN < 0; // => false
NaN === NaN; // => false
NaN !== false; // => true
NaN !== true; // => true
NaN !== NaN; // => true
```

## NaN の検出

JavaScript には`isNaN()`というトップレベル関数が用意されています。引数を一つとり、boolean(true | false)を返します。
ただ、この`isNaN()`にも一癖あって、渡された引数が`NaN`以外にも、文字列、undefined、Object、 Function だった場合も`true`を返します。<br>
そのため、`isNaN(x)`により`true`が返却されても、`x`が`NaN`である保証はありません。

```javascript
isNaN(NaN); // => true
isNaN(undefined); // => true
isNaN("hello"); // => true
isNaN({}); // => true
isNaN(new Function()); // => true
isNaN(0); // => false
isNaN(true); // => false
isNaN(null); // => false
```

引数が Array の場合は length が 0 か、要素 1 つだけで値が数値または null の場合のみ`false`が返ります

```javascript
isNaN([1, 2, 3]); // => true
isNaN(["hello"]); // => true
isNaN([true]); // => true
isNaN([]); // => false
isNaN([1]); // => false
isNaN([null]); // => false
```

非常にややこしいですね。覚えなくて大丈夫です。<br>
というのも、ECMAScript2015 で`Number.isNaN()`が導入され、これを用いることにより`NaN`かどうかを正しく評価することができるようになりました。

```javascript
Number.isNaN(NaN); // => true
Number.isNaN(undefined); // => false
Number.isNaN("hello"); // => false
Number.isNaN({}); // => false
Number.isNaN(new Function()); // => false
Number.isNaN(0); // => false
Number.isNaN(true); // => false
Number.isNaN(null); // => false
```

すばらしいですね。非常にわかりやすくなりました。とはいえ、前時代の JavaScript を書かなければいけないこともあるかもしれません。
そのときは先に述べた、`NaNは比較演算子で評価した場合、どんな値とも等価にはならない`という性質を利用します。

```javascript
Number.isNaN = function (val) {
  return val !== val;
};

Number.isNaN(NaN); // => true;
Number.isNaN(0); // => false;
```

## まとめ

トップレベル関数の`isNaN()`は使ってはいけません。`Number.isNaN()`を使いましょう。

明日は ruryusham さんの記事です。
