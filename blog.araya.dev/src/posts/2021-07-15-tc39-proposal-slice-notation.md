---
title: Slice notation (Stage 1)
tags:
  - JavaScript
  - ECMA262
  - TC39
date: "2021-07-15 00:00:00 +0900"
---

[tc39_study](https://web-study.connpass.com/event/213676/)のための準備。

tc39 に Slice notation という仕様が提案されている。これは現在 Stage1 で、将来的に標準化されるとしても**この記事に書かれている多くの API はその頃には大きく変更されている可能性がある**

- [tc39/proposal-slice-notation](https://github.com/tc39/proposal-slice-notation)

## Motivation

JavaScript においてある配列から N 番目から N+M 番目の要素を取得したいときには [`Array.prototype.slice`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice) を用いることができる。

```js
// index 1 から 2 の要素を切り出したArrayを返す
["a", "b", "c", "d"].slice(1, 3); // => ['b', 'c']
```

しかし、この`slice`メソッドは引数を 1 つだけ受け取ることもでき、

```js
["a", "b", "c", "d"].slice(3);

["a", "b", "c", "d"].slice(-2);
```

といった結果がどうなるのか分かりづらい。

そこで、他の言語にあるような index の指定で Array を slice する syntax を追加したいというのがこの提案だ。

また、下記で紹介する syntax での index の指定の挙動は`slice`メソッドと一致するため、現状ではただの syntax sugar のようだ。

## Syntax

`array[N:M]` と書くことで、 index `N` から index `M - 1` までの要素を切り出した配列を得ることができる。

```js
const array = ["a", "b", "c", "d"];

// array.slice(1, 3)と同等
array[1:3] // => ['b', 'c']
```

また、`:`の両側にしている index は指定しないこともできる。

```js
const array = ["a", "b", "c", "d"];

// array.slice(0, 3)と同等
array[:3]; // => ['a', 'b', 'c']

// array.slice(1)と同等
array[1:]; // => ['b', 'c', 'd']

// コピーが作られる。 array.slice()と同等
array[:]; // => ['a', 'b', 'c', 'd']
```

### 負の index

index の値は負にすることもできる。

`:` の左側(lowerBound)が負の値だった場合、開始地点の index(start)は配列の長さ(len)も用いて以下で決められる。

```js
start = max(lowerBound + len, 0);
```

逆に、右側(upperBound)が負の値だった場合の終了地点の index(end)は

```js
end = max(upperBound + len, 0);
```

で決定される。

#### 負の index を指定したときの例

```js
const array = ["a", "b", "c", "d"];

// start = max((-2 + 4), 0) = max(2, 0) = 2
// array.slice(-2)と同等
array[-2:]; // => ['c', 'd']

// start = max((-10 + 4), 0) = max(-6, 0) = 0
// lowerBoundが負かつ絶対値がlenより大きい場合は、startは0になる
// array.slice(-10)と同等
array[-10:]; // => ['a', 'b', 'c', 'd']

// end = max((-2 + 4), 0) = 2
// array.slice(0, -2) と同等
array[:-2]; // => ['a', 'b']

// end = max((-10 + 4), 0) = 0
// upperBoundが負かつ絶対値がlenより大きい場合は、endが0になるため空配列が返る
// array.slice(0, -10) と同等
array[:-10]; // => []
]
```

### 配列の長さを超える index

指定した index が配列の長さを超えたときには、その配列が持つ範囲の index まで扱われる。

```js
const array = ['a', 'b', 'c', 'd'];

// array.slice(100) と同等
array[100:]; // => []

// array.slice(0, 100) と同等
array[:100]; // => ['a', 'b', 'c', 'd']
```
