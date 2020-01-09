# RecordとTupleが変えるJavaScriptのmutability
### 2019-12-20 @arayaryoma
### at つくばexpress.js #1

---

## 自己紹介
- あらや / Ryoma Abe
- [arayaryoma](https://twitter.com/arayaryoma)
- 元フラー社員, 元柏の葉在住
- フロントエンドエンジニア
- Web標準が好き

---
### 現職
- 株式会社ヘマタイト
- https://ctfkit.com
![CTFKit](./images/ctfkit.png)

---
## JSのmutabilityおさらい

---
`const` で宣言された変数は再代入できない
```javascript
// TypeError: Assignment to constant variable.

const num = 0;
num++;

const str = 'hello';
str = 'bye'; 

const isFree = false;
isFree = true;

const nullable = null;
nullable = 100;

const undef = undefined;
undef = 500;

const bigNum = 100000000000000000000000000n
bigNum = 0;

const sym = Symbol('hello');
sym = Symbol('');

const obj = {a: 'hello'};
obj = {a: 'bye'};

const arr = [1,2];
arr = [3]
```

---

`object`と`Array`は**再代入不可**だが**immutable**ではない

```javascript
const person = {
    name: 'Araya',
    age: 24
}
person.age++;
console.log(person); // { name: 'Araya', age: 25 }

const stations = ['柏の葉キャンパス', '流山おおたかの森'];
stations.push('流山セントラルパーク');
stations.shift(); 
console.log(stations); // [ '流山おおたかの森', '流山セントラルパーク' ]
```

---
元の値を変更しないものもある
```js
const arr1 = [1,2,[3,4,5]];
const flatten = arr1.flat();
console.log(arr1); // [ 1, 2, [ 3, 4, 5 ] ]
console.log(flatten); // [ 1, 2, 3, 4, 5 ] 
```

---

## 現代でのmutabilityとの戦い

---

`Object.freeze`
```js
const person = {
    name: 'Araya',
    age: 24
}
Object.freeze(person);
person.age++;
console.log(person); // { name: 'Araya', age: 24 }
```

- エラーはthrowされない
- **shallow freeze**であることに注意
```js
const person = {
    name: 'Araya',
    age: 24,
    company: {
        name: 'Hematite Inc.',
        place: 'Tokyo'
    }
}
Object.freeze(person);
person.company.place = 'Antarctica';
console.log(person.company.place) // Antarctica
```

---

Spread syntax (スプレッド構文)
```js
const person = {
    name: 'Araya',
    age: 24
}
const clone = {...person, age: person.age + 1}
console.log(person); // { name: 'Araya', age: 24 }
console.log(clone); // { name: 'Araya', age: 25 }

const stations = ['柏の葉キャンパス', '流山おおたかの森'];
const added = [...stations, '流山セントラルパーク']
console.log(stations);  // [ '柏の葉キャンパス', '流山おおたかの森' ]
console.log(added) // [ '柏の葉キャンパス', '流山おおたかの森', '流山セントラルパーク' ]
```
objectのプロパティなどを直接書き換えるのを禁止して、必ず新しい変数を作る。

---
Libraries

- [https://github.com/immutable-js/immutable-js](https://github.com/immutable-js/immutable-js)
- [https://github.com/kolodny/immutability-helper](https://github.com/kolodny/immutability-helper)

---

## ここまでのまとめ
- JavaScriptのobjectはmutable
- `Object.deepFreeze` を別途実装したり、Immutable.js のライブラリが使われている
- 言語レベルでimmutableなobjectは求められている

---

## Record & Tuple
[https://github.com/tc39/proposal-record-tuple](https://github.com/tc39/proposal-record-tuple)

---

### Record & Tuple
- TC39に提出されているproposalの1つ。
- 2019年12月20日時点でStage1。
- 提案されたのは2019年4月頃
- TC39に出されるproposalとしてはかなり順調(に見える)
- 残念ながら現在babel pluginなどはなさそう・・・
---

## Record
### 基本のSyntax
```javascript
const record = #{
    a: 1,
    b: 2,
    c: 3,
};
record.a === 1; // true
record['a'] === 1; //true

record.a = 100 // TypeError
```
___

### スプレッド構文
```javascript
const record2 = #{...record1, b: 5};
record1 !== record2; //true
record2 === #{ a: 1, c: 3, b: 5 }; // true
```

---

### Iteration
```javascript
const record = #{ a: 1, b: 2 };

// TypeError: record is not iterable
for (const o of record) { console.log(o); }
```
Recordはiterableではない

---

### objectからRecord型のオブジェクトを作る
```js
const obj = {a: 1, b: 2, c: 3};
const record = Record.from(obj);
Record.from({ a: {} }); // TypeError: Can't convert Object with a non-const value to Record
```
---

## Tuple
### 基本のSyntax
```javascript
const tuple = #[1, 2, 3];
tuple[0] === 1; // true
tuple[0] = 100; // TypeError
```

---

### `with`
```javascript
const tuple1 = #[1, 2, 3];
const tuple2 = tuple1.with(0, 2);
tuple1 !== tuple2; // true
tuple2 === #[2, 2, 3]; // true

```

---

### スプレッド構文
```javascript
const tuple1 = #[1, 2, 3];
const tuple2 = #[1, ...tuple1];
tuple2 === #[1, 1, 2, 3]; // true
```

---

### `push`, `pop`
```js
const tuple1 = #[1, 2, 3];

const pushed = tuple1.push(4);
pushed === #[1, 2, 3, 4]; // true

const popped = tuple4.pop();
popped === #[1, 2, 3]; // true
```

---

### Iteration
```javascript
for (const o of tuple) { console.log(o); }
// 1
// 2
```

---

### Array型のオブジェクトからTuple型のオブジェクトを作る
```js
const tuple = Tuple.from([1, 2, 3]);
const tuple2 = Tuple.from([{}, {} , {}]); // // TypeError: Can't convert Iterable with a non-const value to Tuple
```

---
## 気をつけること
`#{...}`はshallow freezeと同質
```js
const person = #{
    name: 'Araya',
    age: 24,
    company: { // この中はmutable
        name: 'Hematite Inc.',
        place: 'Tokyo'
    }
}
```
```js
const imPerson = #{
    name: 'Araya',
    age: 24,
    company: #{ // immutable
        name: 'Hematite Inc.',
        place: 'Tokyo'
    }
}
```
これについてはTupleも同様

---

## `JSON.stringify`
- `JSON.stringify(record)`は`JSON.stringify(object)`と同じ結果
- `JSON.stringify(tuple)`は`JSON.stringify(array)`と同じ結果

```js
JSON.stringify(#{ a: #[1, 2, 3] }); // '{"a":[1,2,3]}'
JSON.stringify(#[true, #{ a: #[1, 2, 3] }]); // '[true,{"a":[1,2,3]}]'
```

---

## `typeof`
現在のところどちらも`record`になるのが妥当だと考えられている

```js
typeof {a: 1} === "object";
typeof [1, 2] === "object";

typeof #{ a: 1 } === "record";
typeof #[1, 2]   === "record";
```

---
## まとめ
- RecordとTupleはJSのランタイムにimmutableな世界をもたらす
- すべてをimmutableにするのではなくて、**mutable/immutableを明示的に書ける**ことが重要
- まだ使うことはできないが、期待値は高め(完全に発表者の主観。みなさんはどう思いますか？)
- 詳しくは[proposal](https://github.com/tc39/proposal-record-tuple/commits/master)を見てください
- TypeScriptのRecordとTupleは・・・RecordとTupleにコンパイルされる・・・？
(しかし中身はただのUtility type...)
