---
title: "ECMAScriptのproposalで個人的に気になっているものを紹介する"
date: "2018-12-06 00:00:00 +0900"
---

これは[#kosen10s Advent Calendar 2018](https://adventar.org/calendars/3004)６日目の記事です。

自分の担当日を1日勘違いしていたため遅刻です。

今日はECMAScriptのproposalについて書きます。

[12/3のBabel 7.2.0のリリース](https://babeljs.io/blog/2018/12/03/7.2.0)で、Pipeline OperatorとPrivate Instance Methodsの実装が入りました。
特にPipeline OperatorはJavaScript界隈以外でも各所で話題になっていました。



JavaScriptの仕様標準であるECMAScriptにはこれらの他にも面白く利便性の高い提案(proposal)がたくさん出されています。
この記事ではその中でも僕が気になっている・期待しているものをいくつか紹介します。

## ECMAScriptの仕様追加の進められ方
proposalを紹介する前に、proposalが出されてからECMAScriptに正式に入るまでの流れについて、
少しだけ触れておこうと思います。

ECMAScriptは[tc39](https://www.ecma-international.org/memento/tc39.htm)という団体で仕様の策定が進められています。
proposalは[GitHubのリポジトリ](https://github.com/tc39/proposals)にまとめられていて、
[Contributing guideline](https://github.com/tc39/ecma262/blob/master/CONTRIBUTING.md)に従えば、誰でも出すことができます。

新たに出されたproposalはstage0からstage4まで５つのプロセスを通って行き、最終的にECMAScriptに正式に入ることになります。

stage0からstage4までどのような条件で上がっていくかは[EcmaScriptのドキュメント](https://tc39.github.io/process-document/)に
まとめられていますが、ここで各ステージに進むための代表的な条件を簡単に紹介します。


### Stage0 Strawman(たたき台)
新しい提案が出されただけの状態です。
Stage0のproposalは、[Stage1~4とは別けてまとめられています](https://github.com/tc39/proposals/blob/master/stage-0-proposals.md)。

### Stage1 Proposal(提案)
Stage1に進むための条件は、
- 対象の新仕様追加を誰が牽引するか("Champion")が定められている。
- 問題性または必要性についてと、解決策についての概説がある。
- 仕様自体の横断的な懸念と実装難易度について述べられている。
- ユースケースの説明がある

などです。
Stage1では実際にPolyfillやdemoが実装され、実装難易度やもたらす可能性のある副作用について議論されます。

前述した[Pipeline Operator](https://github.com/tc39/proposal-pipeline-operator)は現在このStageです。


### Stage2 Draft(下書き)
Stage2に進むための条件は
- spec text(仕様書)の初期案

です。
Stage2では具体的にSyntaxやsemanticsを正確に定めます。
TC39はここで、仕様が開発され、最終的に標準仕様に組み込まれることを期待します。

### Stage3 Candidate(候補)
Stage3に進むための条件は
- 仕様書の完了
- 指定されたレビューアーが仕様書を承認している
- 全てのECMAScript編集者が仕様書を承認している

です。
Stage3では仕様の策定は完了し、ブラウザの実装や、ユーザーからのフィードバックを待ちます。
この時点でECMAScript標準に入る可能性は非常に高いと言えます。もちろんここで落ちる可能性もあります。

### Stage4 Finished(完了)
Stage4に進むための条件は
- 2つ以上の競合する主要なJSエンジンで実装されている
- [tc39/test262](https://github.com/tc39/test262)の受け入れテストが主要なユースシナリオ用に作成され、マージされている。
- [tc39/ecma262](https://github.com/tc39/ecma262)に、統合された仕様書とともに全てのPRが提出されている。
- 全てのECMAScript編集者がPRを全て承認している。

などです。Stage4に入った仕様は、次回のECMAScriptのリリースで標準仕様としてリリースされることが決定しています。

Stage4のproposalは[ここ](https://github.com/tc39/proposals/blob/master/finished-proposals.md)から確認できます。


## 個人的に気になっているproposalをいくつか
現在Stage1~3で80個ほど、Stage0も含めると100程度のproposalが出されていて、全て紹介するのは厳しいので、
個人的に気になっているものをかいつまんで紹介します。

※Stageの状態は2018年12月6日現在のものです。

### [Optional catch binding](https://github.com/tc39/proposal-optional-catch-binding) (Stage4)
JavaScriptのtry-catch構文では、catchでerrorの値を受け取らなければなりません。

```javascript
try {
    // Do something expected error may be threw
} catch (err) {
    console.log("error");
}

```
このproposalは、 `catch`でエラーの値を受け取らなくてもいいとするものです。

```javascript
try {
    // Do something expected error may be threw
} catch {
    console.log("error");
}
```
`try`ブロックで`throw` された値が不要なとき、無駄な変数を作らずに済みます。
Babelでtranspileする際は[@babel/plugin-proposal-optional-catch-binding](https://www.npmjs.com/package/@babel/plugin-proposal-optional-catch-binding)を利用します。
Babelでtranspileすると以下のコードが出力されます。
```javascript
"use strict";

try {
  // Do something expected error may be threw
} catch (_unused) {
  console.log("error");
}
```
Optional catch bindingは2019年にリリースされるECMAScriptに搭載予定です。

### [import()](https://github.com/tc39/proposal-dynamic-import) (Stage3)
ESModuleをロードするための`import`構文はトップレベルでの静的なローディングのみサポートしています。
```javascript
// valid
import 'some-module';

// invalid
if(expression) {
    import `${variable.moduleName}`;
}
```

このproposalは、ESModuleを動的にロードするための`import()` 関数を追加するためのものです。
```javascript
  const moduleSpecifier = './utils.mjs';
  import(moduleSpecifier)
    .then((module) => {
        // Use the module after loaded
    });
```

[IEを除く最新のメジャーブラウザではすでに利用可能になっています](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#Browser_compatibility)。
ESModuleの動的importについては[この記事](https://developers.google.com/web/updates/2017/11/dynamic-import)がわかりやすいと思います。　

### [BigInt](https://github.com/tc39/proposal-bigint) (Stage3)
BigIntはJavaScriptのIntegerを拡張するためのものです。
現状JavaScriptで扱える整数の最大値は`Number.MAX_SAFE_INTEGER + 1`で取得できます。

```javascript
const x = Number.MAX_SAFE_INTEGER;
// ↪ 9007199254740991, 2^53 - 1

const y = x + 1;
// ↪ 9007199254740992

const z = x + 2;
// ↪ 9007199254740992
```

BigIntはこれより大きい整数値を扱えます。
BigIntは整数値の最後に`n`をつけることで表現します。

```javascript
const number = 9007199254740993; // => 9007199254740992
const bigIntNumber = 9007199254740993n; // => 9007199254740993n
```

若しくは、`BigInt()`関数にNumberまたはStringを渡すことで作成できます。
```javascript
const value1 = BigInt(9007199254740993);  // => 9007199254740993n
const value2 = BigInt('9007199254740993');  // => 9007199254740993n
```

また、BigIntはNumber型に属していなく、JavaScriptの全く新しいprimitiveです。
```javascript
typeof 0; // => 'number' 
typeof 0n; // => 'bigint'
```

### [Numeric Separator](https://github.com/tc39/proposal-numeric-separator) (Stage2)
Number型の値を読みやすくするためのものです。数値の先頭および末尾以外の、任意の場所に `_` を挿入することができます。

読みやすくするためだけなので、 `_` を挿入する位置で、数値が変わることはなく、単に取り除かれます。
```javascript
console.log(1_000_000); // => 1000000
console.log(1_00); // => 100
console.log(0xFF_BA_54); // => 16759380
```

###  [throw expressions](https://github.com/tc39/proposal-throw-expressions) (Stage2)
JavaScriptの`throw`文を式としても使えるようにしようというproposalです。

例えば、引数を1つ受取り、引数がなかった場合は `'required!'`、引数が文字列出なかった場合は `'argument must be string'`
とErrorをthrowし、文字列であれば標準出力に出力する関数`test`を、現行のJavaScriptで書くと
```javascript
const test = (param) => {
    if (param === undefined) throw new Error('required!');
    if (typeof param !== 'string') throw new Error('argument must be string');
    console.log(param);
};
```
このようになります。throw expressionを用いると以下のように書けるようになります。
```javascript
const test = (param = throw new Error('required')) => {
    typeof param === 'string' ? console.log(param) : throw new Error('argument must be string');
};
```

### [Top-level await](https://github.com/tc39/proposal-top-level-await) (Stage2)
EcmaScriptで入ったasync/awaitの拡張で、今までasync function内でしか使用できなかった`await`をトップレベルで
使えるようにしようという提案です。

前述した`import()`は非同期で実行されPromiseを返すため、モジュールをロードしてから処理をしたい時などに有用です。
```javascript
const strings = await import(`/i18n/${navigator.language}`);
const res = await fetch('https://reservoir.allajah.com');
```

手元で試したかったのですがbabelのPluginがまだ不完全なようで動きませんでした。

### [Temporal](https://github.com/tc39/proposal-temporal) (Stage2)
JavaScriptのDate Objectは非常に使い勝手が悪く、それを解決するために新しく追加が提案されているObjectです。

Temporalは、dateやtimeといった時間を扱うためのAPIを持っていて、時差などの扱いが非常に簡潔になっています。
TemporalがStage4まで進めば、[moment](https://momentjs.com/)や[dayjs](https://github.com/iamkun/dayjs)
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
console.log(new ZonedDateTime(instant, 'Asia/Tokyo').toString());
// ->  2018-12-07T05:14:01.876000000+09:00[Asia/Tokyo]
```

### [Realms API](https://github.com/tc39/proposal-realms) (Stage2)
RealmsはJavaScriptを実行する環境で、global空間を仮想的に作り出すAPIです。
`new Realm()`で作成したインスタンスで`evaluate`メソッドを呼ぶと、Realm内のコンテキストで実行されるfunctionを作成できます。
```javascript
let g = window; // outer global
let r1 = new Realm(); // root realm
let r2 = new r1.global.Realm({ intrinsics: "inherit" }); // realm compartment

let f = r1.evaluate("(function() { return 17 })");

f() === 17 // true

Reflect.getPrototypeOf(f) === g.Function.prototype // false
Reflect.getPrototypeOf(f) === r1.global.Function.prototype // true
Reflect.getPrototypeOf(f) === r2.global.Function.prototype // true
```

セキュリティ上の都合でglobalから切り離したり、ブラウザ上のエディタ開発で有用(らしい)です。

### [Observable](https://github.com/tc39/proposal-observable) (Stage1)
みんな大好き(?)ObservableもECMAScript標準にしようというproposalも出ています。
Rx.jsのような潤沢なoperatorはまだありませんが、
`Observable.of()`や`Observable.from()`でObservableなobjectを作り、`subsucribe`、`unsubscribe`するという
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
JavaScriptを書いてる人にとっては待望の機能だと思います。

JavaScriptでは下記のようなコードを書くと、7行目で例外が発生します。
```javascript
const obj = {
    a: {}
};
console.log(obj); // -> { a: {} }
console.log(obj.a); // -> { }
console.log(obj.a.b); // -> undefined
console.log(obj.a.b.c); // -> TypeError: Cannot read property 'c' of undefined
```

これはアプリケーション開発では頻繁に起こりうることで、例えばWeb APIからJSONを受取り、ネストが深い位置にある
プロパティにアクセスする時です。

```javascript
fetch('https://api.reservoir.allajah.com/posts').then(res => res.json()).then(posts => {
    posts.forEach(post => {
        const authorName = post.author.name;
        //...
    })
});
```

この例だと`post.author`が存在しなかった(undefined)時、`TypeError: Cannot read property 'name' of undefined`が発生します。

Optional Chainingでこの問題を解決できるようになります。

```javascript
const obj = {
    a: {}
};
console.log(obj); // -> { a: {} }
console.log(obj.a); // -> { }
console.log(obj.a?.b); // -> undefined
console.log(obj.a?.b?.c); // undefined
```
`undefined`もしくは`null`な可能性があるobjectの末尾に?をつけると、実際に`undefined | null`だったとき、プロパティアクセスを行わずに`undefined`が返ります。
```javascript
// ES2018
fetch('https://api.reservoir.allajah.com/posts').then(res => res.json()).then(posts => {
    posts.forEach(post => {
        const authorName = post.author ? post.author.name : 'defaultName';
        //...
    })
});

// with Optional Chaining
fetch('https://api.reservoir.allajah.com/posts').then(res => res.json()).then(posts => {
    posts.forEach(post => {
        const authorName = post.author?.name || 'defaultName';
        //...
    })
});
```
簡潔に書けますね。


### [Pipeline Operator](https://github.com/tc39/proposal-pipeline-operator) (Stage1)

最近少し話題になったパイプライン演算子です。
F#やOcaml、Elixirなどを書く人にとってはおなじみだと思います。

```javascript
const double = x => x * 2;
const result = 2 |> double |> (x => 3 + x) |> (x => x.toString());
console.log(result); // -> 7
```

個人的にパイプライン演算子は好きなのですが、proposalで上がってきた時は「絶対途中で落ちる」と思っていましたが、
意外とparserの実装などが進んでいるようで驚いています。

TypeScriptなどの型システムがないと、JavaScriptでは使うのが難しいかも知れません。

Pipeline OperatorのSyntaxをどういったものにするかは[何度も議論されているよう](https://github.com/tc39/proposal-pipeline-operator/wiki)で、
まだまだ不安定なので、実際に手を出すのはせめてSyntaxが決まってからにするのをお薦めします。

### [Pattern Matching](https://github.com/tc39/proposal-pattern-matching) (Stage1)
関数型のパラダイムを輸入してこよう、というproposalはまだまだあります。
おなじみのPattern Matchingです。

まだbabel-pluginも公開されてないですが、下記のようなSemanticsになるようです。

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
Date Objectなどのglobal空間に置かれているものを標準ライブラリとしてimportすることによって、名前空間を切ろうという提案です。
```javascript
import { Date } from "std:Date";
import { Date } from "std:Date+2.1.6-alpha.1";

const d = new Date();
```

まだSemanticsや仕様も決まっていなく、Polyfillもありません。

### [Asset References](https://github.com/sebmarkbage/ecmascript-asset-references) (Stage1)
`import`はES modulesをロードするための構文ですが、imageやCSSなどのassetをロードする構文を追加しようという提案です。
```javascript
asset Logo from "./logo.gif";
async function loadLogo() {
  let img = document.createElement("img");
  img.src = URL.createObjectURL(Logo);
  return img;
}
```
Stage2,3と上がっていくか微妙ではありますが、機能としては非常に大きいので、数年後に業界を揺るがしているかも知れないです。

## EdgeのJSエンジンがV8に
ちょうどこの記事を書いている間に、[MicrosoftがEdgeをChromiumベースに置き換える発表](https://github.com/MicrosoftEdge/MSEdge)がでていました。
EdgeのJavaScriptのエンジンがChakraからV8になると、
前述したproposalがstep4に上がるための条件である
「2つ以上の競合する主要なJSエンジンで実装されている(原文: Two compatible implementations which pass the acceptance tests)」
を満たすことに影響が出るかも知れません。

現在主要なJavaScriptエンジンといえば
- Blink (Google)
- SpiderMonkey (Mozilla)
- JavaScriptCore (Apple)
- Chakra (Microsoft)

の4つで、ここからChakraを抜いた3つのうち2つのブラウザで実装される必要があります。

10年後くらいにはV8大統一時代が来て、ECMAScriptは実質V8の仕様になるかも・・・？

## まとめ
ECMAScriptには新しい機能仕様がどんどん提案・追加されていて、JavaScriptは進化し続けています。

JavaScriptは使われている環境の性質上、後方互換性を保つのが必須になっています。
古いAPIが消えるようなことはなかなかないですが、
JS開発者は新しくモダンなAPIを追いかけ、きれいでバグの少ないコードを書くことが求められています。


明日は[@ysakasin](https://twitter.com/ysakasin)の[オセロの完全解析を解説する](https://sakasin.net/blog/solving-othello)
です！もう上がってます！
