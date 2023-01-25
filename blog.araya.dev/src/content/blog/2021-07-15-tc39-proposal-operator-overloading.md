---
title: Operator overloading in JavaScript (Stage 1)
tags:
  - JavaScript
  - ECMA262
  - TC39
date: "2021-07-15 00:00:00 +0900"
---

[tc39_study](https://web-study.connpass.com/event/213676/)のための準備。

tc39 に Operator overloading in JavaScript という仕様が提案されている。これは現在 Stage1 で、将来的に標準化されるとしても**この記事に書かれている多くの API はその頃には大きく変更されている可能性がある**

- [tc39/proposal-operator-overloading](https://github.com/tc39/proposal-operator-overloading)

その名の通り、ここでは JavaScript における演算子オーバーロードが提案されている。

## API

### overload される演算子、されない演算子

提案の中では下記の演算子は overload されうるものとして扱われている。

- 数値計算の演算子
  - 単項: `+`, `-`, `++`, `--`;
  - 複項: `+`, `-`, `*`, `/`, `%`, `**`
- ビット演算子
  - 単項: `~`
  - 複項: `&`, `^`, `|`, `<<`, `>>`, `>>>`
- 比較演算子: - `==`, `<`, `>`, `<=`, `>=`
- 整数値でのプロパティアクセス: `[]`, `[]=`

一方、下記の演算子は overload をサポートしないとされている。

- `!`, `&&`, `||`
- `===`
- 整数値以外での`.`, `[]`によるプロパティアクセス
- 関数呼び出し: `()`
- `,`
- pipeline operator: `|>`
- optional chaining `?.`, `?.[]`, `?.()`
- nullish coalescing: `??`
  - (logical assignment `??=` については明記されてないがおそらくここに含まれるはず)

### overload の挙動を定義する

例として、RGB の各要素を単純に加算する RGB class の `+` 演算子を定義する。
(具体的には、`#A1B2C3` と `#1A2B3C` を加算して `#BBDDFF` を得られるような演算子)

まず、専用の operator の集合を作る。これは`Operators`関数を呼び出すことで得られる。

```js
const RGBOps = Operators({
  "+"(a, b) {
    // エラーハンドリングは省略している雑な実装
    return {
      r: a.r + b.r,
      g: a.g + b.g,
      b: a.b + b.b,
    };
  },
});
```

この operators を使うことのできる class`RGB`を宣言するには、上記で宣言した`RGBOps` class を継承する必要がある。

```js
class RGB extends RGBOps {
  r;
  g;
  b;
  constructor(hex) {
    this.r = parseInt(hex.slice(1, 3), 16);
    this.g = parseInt(hex.slice(3, 5), 16);
    this.b = parseInt(hex.slice(5, 7), 16);
  }
}
```

演算子オーバーロードは class に対して明示的に有効化したときにしか使用できない。
明示的に有効にするには `with operators from` もしくは [littledan/proposal-reserved-decorator-like-syntax](https://github.com/littledan/proposal-reserved-decorator-like-syntax)を使って`@use: operators` で宣言する方法が検討されているようだ。

proposal のコード例では `with operators from` を使っているため、ここでもそちらを用いる。

```js
new RGB("#A1B2C3") + new RGB("#1A2B3C"); // operatorを使用することを明示的に宣言していないためTypeError の例外が起きる。

with operators from RGB; // オーバーロード演算子を使うことを明示

new RGB("#A1B2C3") + new RGB("#1A2B3C"); // new RGB('#BBDDFF') と同等の値を持つインスタンスが得られる
```

### 異なる class との演算

上の例では`RGB` class 同士での加算を定義したが、例えば`new RGB('#112233') * 4` のように数値との乗算で`#112233`各要素の値を 4 倍して`#4488CC`を得られるような演算子`*`を定義したくなるかもしれない。この提案ではこのケースもサポートされている。

`Operators` 関数の第 2 引数には、すでに定義されている他の class との演算を行うときの演算子を定義できる。

```js
const RGBOps = Operators(
  {
    "+"(a, b) {
      // エラーハンドリングは省略している雑な実装
      return {
        r: a.r + b.r,
        g: a.g + b.g,
        b: a.b + b.b,
      };
    },
  },
  {
    right: Number,
    "*"(a, b) {
      return {
        r: a.r * b,
        g: a.g * g,
        b: a.b * b,
      };
    },
  }
);
```

この例では演算子`*`の右側のオブジェクトが`Number`型だったときの挙動を定義している。既存の他の class `A` との演算子を定義するときには、
このように演算子の左側に`A`がいる場合と右側に`A`がいる場合をそれぞれ明示的に定義する必要がある。

## Use case

上記の RGB の例は筆者が適当に考えたユースケースであるが、提案のなかでは別の[ユースケースがいくつか示されている](https://github.com/tc39/proposal-operator-overloading#case-studies)。

- Number, BigInt に加え複素数などを追加した "Numeric type(数値型)"
- 行列、ベクトル計算
- TensorFlow.js などで用いられる DSL
- CSS の単位(em, px など)の計算
