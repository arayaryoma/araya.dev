## 注意事項
- これは[#tc39_study](https://web-study.connpass.com/event/147538/)の発表資料です
- この機能はまだ提案/策定途中であり仕様に入るまでに大きな変更が入る可能性があり、またこの機能の策定自体が中止される可能性もあります。


---

## ステータス
- [proposal](https://github.com/tc39/proposal-record-tuple)
- Champion
  - Robin Ricard (Bloomberg)
  - Richard Button (Bloomberg)
- Stage: 1 (0 to 1 per 2019.10.01 TC39)
- (Stage0の時点では "Const Value Types: Record & Tuple" 名前だった)
- 実装済みのエンジン: なし

---

## モチベーション
言語レベルでimmutableなデータ型が欲しい

---

## これまでと現状
- かつて[別の提案](https://github.com/sebmarkbage/ecmascript-immutable-data-structures)があったが、仕様の複雑さとユースケースの観点から廃棄された
- [Immutable.js](https://immutable-js.github.io/immutable-js/) などのライブラリが存在する

---

## Record
### 基本のSyntax
```javascript
const record1 = #{
    a: 1,
    b: 2,
    c: 3,
};
record1.a === 1; // true
record1["a"] === 1; //true
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

## Tuple
### 基本のSyntax
```javascript
const tuple1 = #[1, 2, 3];
tuple1[0] === 1; // true
```
### `with`
```javascript
const tuple2 = tuple1.with(0, 2);
tuple1 !== tuple2; // true
tuple2 === #[2, 2, 3]; // true
```
### スプレッド構文
```javascript
const tuple3 = #[1, ...tuple2];
tuple3 === #[1, 2, 2, 3]; // true
```

### `push`, `pop`
```javascript
const tuple4 = tuple3.push(4);
tuple4 === #[1, 2, 2, 3, 4]; // true

const tuple5 = tuple4.pop();
tuple5 === #[2, 2, 3, 4]; // true
```

### Iteration
```javascript
// 1
// 2
for (const o of tuple) { console.log(o); }
```
---

## Equality
- `-0`のケースは常に`false`、`NaN`のケースは常に`true` (?)
- [議論のissue](https://github.com/tc39/proposal-record-tuple/issues/65)

```js
-0 === +0; // true
Object.is(-0, +0); //false

#{ a: -0 } === #{ a: +0 }; //false
#[-0] === #[+0]; //false
```

```js
NaN === NaN; // false
Object.is(NaN, NaN); // true
#{ a: NaN } === #{ a: NaN }; // true
#[NaN] === #[NaN]; // true
```

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
