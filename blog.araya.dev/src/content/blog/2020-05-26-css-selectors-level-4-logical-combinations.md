---
title: CSSのSelectors Level 4で策定が進んでいる Logical Combinationsについて
date: "2020-05-26"
tags:
  - browser
  - css
  - w3c
---

## 注意

本記事で述べる内容は 2020 年 5 月 26 日現在に公開されている情報をもとに書かれている。

## Logical Combinations として追加される 3 つの擬似クラス関数

[CSS working group の Selectors Level 4](https://drafts.csswg.org/selectors) では[Logical Combinations](https://drafts.csswg.org/selectors/#logical-combination) というセクションにいくつかの擬似クラスが定義されている。
この中には[Selectors Level 3](https://www.w3.org/TR/selectors-3/#negation) で定義されていた否定擬似クラス(`:not()`)も含まれているが、新しく以下の 3 つの擬似クラスが追加されている。

- Matches-Any 擬似クラス `:is()`
- Specificity-adjustment 擬似クラス `:where()`
- Relational 擬似クラス `:has()`

### `:is()`

`:is()`は、引数に複数のセレクタを受け取ることができ、受け取ったセレクタの内どれか 1 つにでもマッチすれば要素にスタイルが適用される擬似クラス関数である。

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

`:is()`の詳細度は、引数に渡されたセレクタリストのうち最も詳細度が高いもので計算される。

以下の例を考えてみる。

```html
<ul class="list-1">
  <li>Hello, world!</li>
</ul>

<ul>
  <li>See you!</li>
</ul>

<style>
  :is(ul, ol, .list-1) > li {
    color: red;
  }

  ul > li,
  ol > li,
  .list-1 > li {
    color: blue;
  }
</style>
```

`:is()`が実装されたブラウザでの描画結果はこのようになる。

!["Hello, world!"が青、"See you!"が赤で表示されているスクリーンショット](/assets/images/2020-05-26-css-selectors-level4/is-ex-1.png)

ここで注目すべきは`<li>See you!</li>` に `color: red;` が適用されていることである。`:is(ul, ol, .list-1) > li` が `ul > li, ol > li, .list-1 > li` の単なるショートハンドであれば `color: blue` が適用されるはずだが、そうなってはいない。

`:is()`の計算結果の詳細度(specificity)は、引数として渡したセレクタのうち、最も詳細度が高いもので解決される。
`ul, ol, .list-1` で最も詳細度が高いセレクタは `.list-1` であり、その詳細度は `(0, 1, 0)` である。`ul` および `li` の詳細度は`(0, 0, 1)`であるため、`:is(ul, ol, .list-1)`の詳細度の計算結果は`(0, 1, 0)`となる。

よって、`:is(ul, ol, .list-1) > li` の詳細度の計算結果は `(0, 1, 1)` となり、これは `ol > li` の詳細度 `(0, 0, 2)`よりも高くなり、そのため最終的に`<li>See you!</li>`に適用されるスタイルは `color: red;` となる。

`:is()`は`:matches()`として仕様策定が進められていたが、[rename されている](https://github.com/w3c/csswg-drafts/issues/3258)。

また、ベンダープレフィックス付きで、`:is()`とほぼ同等の機能をもつ`:any()`が実装されているブラウザもあるが、Can I use によると[非推奨となっているようだ](https://caniuse.com/#feat=css-matches-pseudo)。

### `:where()`

`:where()`擬似クラス関数は、前述の`:is()`と同じように扱えるが、詳細度の計算方法だけが異なる。

`:where()`自体も、`:where()`に引数として渡したセレクタのリストも、最終的に解決される詳細度には影響は与えず、例えば`:where(.foobar)`の詳細度は`(0, 0, 0)`となる。

`:is()`で例に上げたコードを少し書き換え、ブラウザで描画結果を確認してみる。

```html
<ul class="list-1">
  <li>Hello, world!</li>
</ul>

<ul>
  <li>See you!</li>
</ul>

<style>
  ul > li,
  ol > li,
  .list-1 > li {
    color: blue;
  }

  :where(ul, ol, .list-1) > li {
    color: red;
  }
</style>
```

!["Hello, world!"が青、"See you!"が青で表示されているスクリーンショット](/assets/images/2020-05-26-css-selectors-level4/where-ex-1.png)

`<li>Hello, world!</li>`も`<li>See you!</li>`も`color: blue;` が適用されている。

`:where(ul, ol, .list-1) >li` の詳細度が`(0, 0, 1)`であり、`ol > li`の詳細度は`(0, 0, 2)`、 `.list-1 > li`の詳細度は`(0, 1, 1)`であるためこのような結果になる。

### `:has()`

`:has()`は引数に相対的なセレクタを受け取り、**そのセレクタを 1 つ以上含んでいる要素**を表現できる擬似クラス関数である。

例えば、このような HTML があったとする。

```html
<section class="subsection section-1">
  <h3>Subsection 1</h3>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent ac sodales
    arcu, a facilisis enim.
  </p>
</section>
<section class="subsection section-2">
  <h3>Subsection 2</h3>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent ac sodales
    arcu, a facilisis enim.
  </p>
</section>
<section class="subsection section-3">
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent ac sodales
    arcu, a facilisis enim.
  </p>
</section>
```

上述した通り、`:has()`を使うと、引数に渡したセレクタのリストが 1 つ以上マッチしたらスタイルを適用するという要件が達成できる。
`<section>`の直接の子に`<h3>`がある場合だけ、背景色を変更する事を考えてみる。それを達成するスタイルシートはこのように書ける。

```css
section:has(> h3) {
  background-color: #ffccdd;
}
```

また、`:not`と組み合わせることにより、`<h3>`を直接の子に持たない`<section>`に適用するスタイルシートを書くこともできる。

```css
section:not(:has(> h3)) {
  background-color: #ccddff;
}
```

`:not(:has())`と`:has(:not())`では意味が違うことに注意が必要である。
上記のスタイルシートを

```css
section:has(:not(> h3)) {
  background-color: #ccddff;
}
```

と書いてしまうと、**「`<h3>`ではない何らかの子要素を持つ`<section>`要素にマッチする」**という表現となってしまう。

つまり`<section></section>`に対し、`section:not(:has(> h3))`はマッチするが、`section:has(:not(> h3))`はマッチしない。

## 関連文書

- https://drafts.csswg.org/selectors/#logical-combination
- https://developer.mozilla.org/en-US/docs/Web/CSS/:is
