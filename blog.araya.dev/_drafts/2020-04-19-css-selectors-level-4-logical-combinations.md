---
title: CSSのSelectors Level 4で策定が進んでいる Logical Combinationsについて
tags:
    - browser
    - css
    - w3c
---
## 注意
本記事で述べる内容は2020年4月19日現在に公開されている情報をもとに書かれている。

## Logical Combinationsとして追加される3つの擬似クラス関数
[CSS working groupのSelectors Level 4](https://drafts.csswg.org/selectors) では[Logical Combinations](https://drafts.csswg.org/selectors/#logical-combination) というセクションにいくつかの擬似クラス関数が定義されている。
この中には[Selectors Level 3](https://www.w3.org/TR/selectors-3/#negation) で定義されていた否定擬似クラス関数(`:not()`)も含まれているが、新しく以下の3つの擬似クラス関数が追加されている。

- Matches-Any擬似クラス関数 `:is()`
- Specificity-adjustment擬似クラス関数 `:where()`
- Relational擬似クラス関数 `:has()`

### `:is()`
`:is()`関数は、引数に複数のセレクタを受け取ることができ、受け取ったセレクタの内どれか1つにでもマッチすれば要素に適用される擬似クラスだ。

たとえば、下記の例では `.foo`, `.bar`, `.baz`全てに `color: red;` が適用される。
```html
<span class="foo">foo</span>
<span class="bar">bar</span>
<span class="baz">baz</span>
<style>
:is(.foo, .bar, baz) {
    color: red;
}
</style>
```
つまり、このセレクタは
```css
.foo, .bar, .baz {
    color: red;
}
```
と等価になる。

### `:where()`

### `:has()`
