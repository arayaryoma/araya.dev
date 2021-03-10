## 注意事項
- これは[#tc39_study](https://web-study.connpass.com/event/147538/)の発表資料です
- この機能はまだ提案/策定途中であり仕様に入るまでに大きな変更が入る可能性があり、またこの機能の策定自体が中止される可能性もあります。


---

## ステータス
- [proposal](https://github.com/tc39/proposal-string-replaceall)
- Champion
  - [Mathias Bynens (Google)](https://github.com/mathiasbynens)
- Stage: 3 (2 to 3 per 2019.10.02 TC39)
- 実装済みのエンジン: なし

---

## モチベーション
文字列の中の特定の文字をすべて置換したい
e.g. `q=query+string+parameters` -> `q=query string parameters`

[StackOverflowで4000近くのvote、700以上のstarがついている](https://stackoverflow.com/questions/1144783/how-to-replace-all-occurrences-of-a-string)

---

### 現状の解決策1

```javascript
const queryString = 'q=query+string+parameters';
const withSpaces = queryString.replace(/\+/g, ' ');
```
RegExpで意味を持つ記号はエスケープが必要

---

### 現状の解決策2

```javascript
const queryString = 'q=query+string+parameters';
const withSpaces = queryString.split('+').join(' ');
```
一度Arrayに変換してからStringに戻すのでオーバーヘッドが大きい

---

## String.prototype.replaceAll
```javascript
const queryString = 'q=query+string+parameters';
const withSpaces = queryString.replaceAll('+', ' ');
```

---

## 空文字を置換したらどうなる？
```javascript
'x'.replace('', '_');
// -> '_x'
'xxx'.replace(/(?:)/g, '_');
// -> '_x_x_x_'
'xxx'.replaceAll('', '_');
// -> '_x_x_x_'
```
結果としては `replace(/(?:)/g, replaceValue)`と同じになる
