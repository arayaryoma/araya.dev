---
title: "ECMAScriptのproposalで個人的に気になっているものを紹介する"
date: "2018-12-06 00:00:00 +0900"
---

これは[#kosen10s Advent Calendar 2018](https://adventar.org/calendars/3004)６日目の記事です。

自分の担当日を 1 日勘違いしていたため遅刻です。

今日は ECMAScript の proposal について書きます。

[12/3 の Babel 7.2.0 のリリース](https://babeljs.io/blog/2018/12/03/7.2.0)で、Pipeline Operator と Private Instance Methods の実装が入りました。
特に Pipeline Operator は JavaScript 界隈以外でも各所で話題になっていました。

JavaScript の仕様標準である ECMAScript にはこれらの他にも面白く利便性の高い提案(proposal)がたくさん出されています。
この記事ではその中でも僕が気になっている・期待しているものをいくつか紹介します。

## ECMAScript の仕様追加の進められ方

proposal を紹介する前に、proposal が出されてから ECMAScript に正式に入るまでの流れについて、
少しだけ触れておこうと思います。

ECMAScript は[tc39](https://www.ecma-international.org/memento/tc39.htm)という団体で仕様の策定が進められています。
proposal は[GitHub のリポジトリ](https://github.com/tc39/proposals)にまとめられていて、
[Contributing guideline](https://github.com/tc39/ecma262/blob/master/CONTRIBUTING.md)に従えば、誰でも出すことができます。

新たに出された proposal は stage0 から stage4 まで５つのプロセスを通って行き、最終的に ECMAScript に正式に入ることになります。

stage0 から stage4 までどのような条件で上がっていくかは[EcmaScript のドキュメント](https://tc39.github.io/process-document/)に
まとめられていますが、ここで各ステージに進むための代表的な条件を簡単に紹介します。

### Stage0 Strawman(たたき台)

新しい提案が出されただけの状態です。
Stage0 の proposal は、[Stage1~4 とは別けてまとめられています](https://github.com/tc39/proposals/blob/master/stage-0-proposals.md)。

### Stage1 Proposal(提案)

Stage1 に進むための条件は、

- 対象の新仕様追加を誰が牽引するか("Champion")が定められている。
- 問題性または必要性についてと、解決策についての概説がある。
- 仕様自体の横断的な懸念と実装難易度について述べられている。
- ユースケースの説明がある

などです。
Stage1 では実際に Polyfill や demo が実装され、実装難易度やもたらす可能性のある副作用について議論されます。

前述した[Pipeline Operator](https://github.com/tc39/proposal-pipeline-operator)は現在この Stage です。

### Stage2 Draft(下書き)

Stage2 に進むための条件は

- spec text(仕様書)の初期案

です。
Stage2 では具体的に Syntax や semantics を正確に定めます。
TC39 はここで、仕様が開発され、最終的に標準仕様に組み込まれることを期待します。

### Stage3 Candidate(候補)

Stage3 に進むための条件は

- 仕様書の完了
- 指定されたレビューアーが仕様書を承認している
- 全ての ECMAScript 編集者が仕様書を承認している

です。
Stage3 では仕様の策定は完了し、ブラウザの実装や、ユーザーからのフィードバックを待ちます。
この時点で ECMAScript 標準に入る可能性は非常に高いと言えます。もちろんここで落ちる可能性もあります。

### Stage4 Finished(完了)

Stage4 に進むための条件は

- 2 つ以上の競合する主要な JS エンジンで実装されている
- [tc39/test262](https://github.com/tc39/test262)の受け入れテストが主要なユースシナリオ用に作成され、マージされている。
- [tc39/ecma262](https://github.com/tc39/ecma262)に、統合された仕様書とともに全ての PR が提出されている。
- 全ての ECMAScript 編集者が PR を全て承認している。

などです。Stage4 に入った仕様は、次回の ECMAScript のリリースで標準仕様としてリリースされることが決定しています。

Stage4 の proposal は[ここ](https://github.com/tc39/proposals/blob/master/finished-proposals.md)から確認できます。

## 個人的に気になっている proposal をいくつか

現在 Stage1~3 で 80 個ほど、Stage0 も含めると 100 程度の proposal が出されていて、全て紹介するのは厳しいので、
個人的に気になっているものをかいつまんで紹介します。

※Stage の状態は 2018 年 12 月 6 日現在のものです。

### [Optional catch binding](https://github.com/tc39/proposal-optional-catch-binding) (Stage4)

JavaScript の try-catch 構文では、catch で error の値を受け取らなければなりません。

```javascript
try {
  // Do something expected error may be threw
} catch (err) {
  console.log("error");
}
```

この proposal は、 `catch`でエラーの値を受け取らなくてもいいとするものです。

```javascript
try {
  // Do something expected error may be threw
} catch {
  console.log("error");
}
```

`try`ブロックで`throw` された値が不要なとき、無駄な変数を作らずに済みます。
Babel で transpile する際は[@babel/plugin-proposal-optional-catch-binding](https://www.npmjs.com/package/@babel/plugin-proposal-optional-catch-binding)を利用します。
Babel で transpile すると以下のコードが出力されます。

```javascript
"use strict";

try {
  // Do something expected error may be threw
} catch (_unused) {
  console.log("error");
}
```

Optional catch binding は 2019 年にリリースされる ECMAScript に搭載予定です。

### [import()](https://github.com/tc39/proposal-dynamic-import) (Stage3)

ESModule をロードするための`import`構文はトップレベルでの静的なローディングのみサポートしています。

```javascript
// valid
import 'some-module';

// invalid
if(expression) {
    import `${variable.moduleName}`;
}
```

この proposal は、ESModule を動的にロードするための`import()` 関数を追加するためのものです。

```javascript
const moduleSpecifier = "./utils.mjs";
import(moduleSpecifier).then((module) => {
  // Use the module after loaded
});
```

[IE を除く最新のメジャーブラウザではすでに利用可能になっています](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#Browser_compatibility)。
ESModule の動的 import については[この記事](https://developers.google.com/web/updates/2017/11/dynamic-import)がわかりやすいと思います。

### [BigInt](https://github.com/tc39/proposal-bigint) (Stage3)

BigInt は JavaScript の Integer を拡張するためのものです。
現状 JavaScript で扱える整数の最大値は`Number.MAX_SAFE_INTEGER + 1`で取得できます。

```javascript
const x = Number.MAX_SAFE_INTEGER;
// ↪ 9007199254740991, 2^53 - 1

const y = x + 1;
// ↪ 9007199254740992

const z = x + 2;
// ↪ 9007199254740992
```

BigInt はこれより大きい整数値を扱えます。
BigInt は整数値の最後に`n`をつけることで表現します。

```javascript
const number = 9007199254740993; // => 9007199254740992
const bigIntNumber = 9007199254740993n; // => 9007199254740993n
```

若しくは、`BigInt()`関数に Number または String を渡すことで作成できます。

```javascript
const value1 = BigInt(9007199254740993); // => 9007199254740993n
const value2 = BigInt("9007199254740993"); // => 9007199254740993n
```

また、BigInt は Number 型に属していなく、JavaScript の全く新しい primitive です。

```javascript
typeof 0; // => 'number'
typeof 0n; // => 'bigint'
```

### [Numeric Separator](https://github.com/tc39/proposal-numeric-separator) (Stage2)

Number 型の値を読みやすくするためのものです。数値の先頭および末尾以外の、任意の場所に `_` を挿入することができます。

読みやすくするためだけなので、 `_` を挿入する位置で、数値が変わることはなく、単に取り除かれます。

```javascript
console.log(1_000_000); // => 1000000
console.log(1_00); // => 100
console.log(0xff_ba_54); // => 16759380
```

### [throw expressions](https://github.com/tc39/proposal-throw-expressions) (Stage2)

JavaScript の`throw`文を式としても使えるようにしようという proposal です。

例えば、引数を 1 つ受取り、引数がなかった場合は `'required!'`、引数が文字列出なかった場合は `'argument must be string'`
と Error を throw し、文字列であれば標準出力に出力する関数`test`を、現行の JavaScript で書くと

```javascript
const test = (param) => {
  if (param === undefined) throw new Error("required!");
  if (typeof param !== "string") throw new Error("argument must be string");
  console.log(param);
};
```

このようになります。throw expression を用いると以下のように書けるようになります。

```javascript
const test = (param = throw new Error("required")) => {
  typeof param === "string"
    ? console.log(param)
    : throw new Error("argument must be string");
};
```

### [Top-level await](https://github.com/tc39/proposal-top-level-await) (Stage2)

EcmaScript で入った async/await の拡張で、今まで async function 内でしか使用できなかった`await`をトップレベルで
使えるようにしようという提案です。

前述した`import()`は非同期で実行され Promise を返すため、モジュールをロードしてから処理をしたい時などに有用です。

```javascript
const strings = await import(`/i18n/${navigator.language}`);
const res = await fetch("https://reservoir.allajah.com");
```

手元で試したかったのですが babel の Plugin がまだ不完全なようで動きませんでした。

### [Temporal](https://github.com/tc39/proposal-temporal) (Stage2)

JavaScript の Date Object は非常に使い勝手が悪く、それを解決するために新しく追加が提案されている Object です。

Temporal は、date や time といった時間を扱うための API を持っていて、時差などの扱いが非常に簡潔になっています。
Temporal が Stage4 まで進めば、[moment](https://momentjs.com/)や[dayjs](https://github.com/iamkun/dayjs)
を使わなくても、標準ライブラリのみで時間が容易に扱えるようになるかもしれません。

[Polyfill](https://github.com/tc39/proposal-temporal)があるためすぐに使うことができますが、
仕様が変わる可能性がまだまだあるので注意です。

```javascript
// 現在の時刻を取得
import { Instant, ZonedDateTime } from "tc39-proposal-temporal";

const instant = Instant.fromMilliseconds(new Date());

// UTC
console.log(instant.toString());
// -> 2018-12-06T20:14:01.876000000Z

// Asia/Tokyo
console.log(new ZonedDateTime(instant, "Asia/Tokyo").toString());
// ->  2018-12-07T05:14:01.876000000+09:00[Asia/Tokyo]
```

### [Realms API](https://github.com/tc39/proposal-realms) (Stage2)

Realms は JavaScript を実行する環境で、global 空間を仮想的に作り出す API です。
`new Realm()`で作成したインスタンスで`evaluate`メソッドを呼ぶと、Realm 内のコンテキストで実行される function を作成できます。

```javascript
let g = window; // outer global
let r1 = new Realm(); // root realm
let r2 = new r1.global.Realm({ intrinsics: "inherit" }); // realm compartment

let f = r1.evaluate("(function() { return 17 })");

f() === 17; // true

Reflect.getPrototypeOf(f) === g.Function.prototype; // false
Reflect.getPrototypeOf(f) === r1.global.Function.prototype; // true
Reflect.getPrototypeOf(f) === r2.global.Function.prototype; // true
```

セキュリティ上の都合で global から切り離したり、ブラウザ上のエディタ開発で有用(らしい)です。

### [Observable](https://github.com/tc39/proposal-observable) (Stage1)

みんな大好き(?)Observable も ECMAScript 標準にしようという proposal も出ています。
Rx.js のような潤沢な operator はまだありませんが、
`Observable.of()`や`Observable.from()`で Observable な object を作り、`subsucribe`、`unsubscribe`するという
馴染み深いインターフェースになっています。

```typescript
function SubscriberFunction(observer: SubscriptionObserver) : (void => void) | Subscription;
interface Observable {
    constructor(subscriber : SubscriberFunction);
    subscribe(observer : Observer) : Subscription;
    subscribe(onNext : Function,
              onError? : Function,
              onComplete? : Function) : Subscription;
    [Symbol.observable]() : Observable;

    static of(...items) : Observable;

    static from(observable) : Observable;
}

interface Subscription {
    unsubscribe() : void;
    get closed() : Boolean;
}
```

### [Optional Chaining](https://github.com/tc39/proposal-optional-chaining) (Stage1)

JavaScript を書いてる人にとっては待望の機能だと思います。

JavaScript では下記のようなコードを書くと、7 行目で例外が発生します。

```javascript
const obj = {
  a: {},
};
console.log(obj); // -> { a: {} }
console.log(obj.a); // -> { }
console.log(obj.a.b); // -> undefined
console.log(obj.a.b.c); // -> TypeError: Cannot read property 'c' of undefined
```

これはアプリケーション開発では頻繁に起こりうることで、例えば Web API から JSON を受取り、ネストが深い位置にある
プロパティにアクセスする時です。

```javascript
fetch("https://api.reservoir.allajah.com/posts")
  .then((res) => res.json())
  .then((posts) => {
    posts.forEach((post) => {
      const authorName = post.author.name;
      //...
    });
  });
```

この例だと`post.author`が存在しなかった(undefined)時、`TypeError: Cannot read property 'name' of undefined`が発生します。

Optional Chaining でこの問題を解決できるようになります。

```javascript
const obj = {
  a: {},
};
console.log(obj); // -> { a: {} }
console.log(obj.a); // -> { }
console.log(obj.a?.b); // -> undefined
console.log(obj.a?.b?.c); // undefined
```

`undefined`もしくは`null`な可能性がある object の末尾に?をつけると、実際に`undefined | null`だったとき、プロパティアクセスを行わずに`undefined`が返ります。

```javascript
// ES2018
fetch("https://api.reservoir.allajah.com/posts")
  .then((res) => res.json())
  .then((posts) => {
    posts.forEach((post) => {
      const authorName = post.author ? post.author.name : "defaultName";
      //...
    });
  });

// with Optional Chaining
fetch("https://api.reservoir.allajah.com/posts")
  .then((res) => res.json())
  .then((posts) => {
    posts.forEach((post) => {
      const authorName = post.author?.name || "defaultName";
      //...
    });
  });
```

簡潔に書けますね。

### [Pipeline Operator](https://github.com/tc39/proposal-pipeline-operator) (Stage1)

最近少し話題になったパイプライン演算子です。
F#や Ocaml、Elixir などを書く人にとってはおなじみだと思います。

```javascript
const double = (x) => x * 2;
const result = 2 |> double |> ((x) => 3 + x) |> ((x) => x.toString());
console.log(result); // -> 7
```

個人的にパイプライン演算子は好きなのですが、proposal で上がってきた時は「絶対途中で落ちる」と思っていましたが、
意外と parser の実装などが進んでいるようで驚いています。

TypeScript などの型システムがないと、JavaScript では使うのが難しいかも知れません。

Pipeline Operator の Syntax をどういったものにするかは[何度も議論されているよう](https://github.com/tc39/proposal-pipeline-operator/wiki)で、
まだまだ不安定なので、実際に手を出すのはせめて Syntax が決まってからにするのをお薦めします。

### [Pattern Matching](https://github.com/tc39/proposal-pattern-matching) (Stage1)

関数型のパラダイムを輸入してこよう、という proposal はまだまだあります。
おなじみの Pattern Matching です。

まだ babel-plugin も公開されてないですが、下記のような Semantics になるようです。

```javascript
const res = await fetch(jsonService)
case (res) {
  when {status: 200, headers: {'Content-Length': s}} -> {
    console.log(`size is ${s}`)
  }
  when {status: 404} -> {
    console.log('JSON not found')
  }
  when {status} if (status >= 400) -> {
    throw new RequestError(res)
  }
}
```

`case`で評価された値が`when`ブロックとマッチした時`-> {}` ブロックが実行されます。

### [Standard Library](https://github.com/tc39/proposal-javascript-standard-library) (Stage1)

Date Object などの global 空間に置かれているものを標準ライブラリとして import することによって、名前空間を切ろうという提案です。

```javascript
import { Date } from "std:Date";
import { Date } from "std:Date+2.1.6-alpha.1";

const d = new Date();
```

まだ Semantics や仕様も決まっていなく、Polyfill もありません。

### [Asset References](https://github.com/sebmarkbage/ecmascript-asset-references) (Stage1)

`import`は ES modules をロードするための構文ですが、image や CSS などの asset をロードする構文を追加しようという提案です。

```javascript
asset Logo from "./logo.gif";
async function loadLogo() {
  let img = document.createElement("img");
  img.src = URL.createObjectURL(Logo);
  return img;
}
```

Stage2,3 と上がっていくか微妙ではありますが、機能としては非常に大きいので、数年後に業界を揺るがしているかも知れないです。

## Edge の JS エンジンが V8 に

ちょうどこの記事を書いている間に、[Microsoft が Edge を Chromium ベースに置き換える発表](https://github.com/MicrosoftEdge/MSEdge)がでていました。
Edge の JavaScript のエンジンが Chakra から V8 になると、
前述した proposal が step4 に上がるための条件である
「2 つ以上の競合する主要な JS エンジンで実装されている(原文: Two compatible implementations which pass the acceptance tests)」
を満たすことに影響が出るかも知れません。

現在主要な JavaScript エンジンといえば

- Blink (Google)
- SpiderMonkey (Mozilla)
- JavaScriptCore (Apple)
- Chakra (Microsoft)

の 4 つで、ここから Chakra を抜いた 3 つのうち 2 つのブラウザで実装される必要があります。

10 年後くらいには V8 大統一時代が来て、ECMAScript は実質 V8 の仕様になるかも・・・？

## まとめ

ECMAScript には新しい機能仕様がどんどん提案・追加されていて、JavaScript は進化し続けています。

JavaScript は使われている環境の性質上、後方互換性を保つのが必須になっています。
古い API が消えるようなことはなかなかないですが、
JS 開発者は新しくモダンな API を追いかけ、きれいでバグの少ないコードを書くことが求められています。

明日は[@ysakasin](https://twitter.com/ysakasin)の[オセロの完全解析を解説する](https://sakasin.net/blog/solving-othello)
です！もう上がってます！
