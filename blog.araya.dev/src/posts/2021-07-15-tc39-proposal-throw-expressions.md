---
title: throw expressions (Stage 2)
tags:
  - JavaScript
  - ECMA262
  - TC39
date: "2021-07-15 20:00:00 +0900"
---

[tc39_study](https://web-study.connpass.com/event/213676/)のための準備。

tc39 に throw expressions という仕様が提案されている。これは現在 Stage2 で、将来的に標準化されるとしても**この記事に書かれている多くの API はその頃には変更されている可能性がある**

- [tc39/proposal-throw-expressions](https://github.com/tc39/proposal-throw-expressions)

この提案ではその名の通り、現在は statement のみである`throw`を expression としても使えるようにしようというものである。

## Examples

### 関数に必須な引数がなかったら Error を throw する

```js
function hello(name = throw new Error("arg: name must be passed")) {
  console.log(`Hello, ${name}`);
}

hello(); // Error 'arg: name must be passed'
```

上記のように引数のデフォルト値として`throw ...` を指定しておく。

statement で書くと

```js
function hello(name) {
  if (name === undefined) {
    throw new Error("arg: name must be passed");
  }
  console.log(`Hello, ${name}`);
}
```

となる。

### 三項演算子のネスト

proposal からそのまま引用する。_筆者個人的にはこの場合は switch-case のほうが読みやすい気もする..._

```js
function getEncoder(encoding) {
  const encoder =
    encoding === "utf8"
      ? new UTF8Encoder()
      : encoding === "utf16le"
      ? new UTF16Encoder(false)
      : encoding === "utf16be"
      ? new UTF16Encoder(true)
      : throw new Error("Unsupported encoding");
}
```

### `??` で値が `undefined | null` だったときに Error を throw する

```js
// throw expression
const result = obj?.a?.b ?? throw new Error("obj.a.b is undefined");

// throw statement
const result2 = obj?.a?.b;
if (result2 === undefined || result2 === null) {
  throw new Error("obj.a.b is undefined");
}
```
