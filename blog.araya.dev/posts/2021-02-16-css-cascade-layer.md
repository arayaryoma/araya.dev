---
title: CSSのCascadingに追加されようとしているLayerという概念
tags:
  - browser
  - css
  - w3c
date: "2021-02-16 00:53:00 +0900"
---

2021 年 1 月に [CSS Cascading and Inheritance Level 5 の First Public Working Draft](https://www.w3.org/TR/css-cascade-5/) が公開された。
CSS Cascading and Inheritance はその名の通り、CSS の Cascade や継承などについての仕様を定義しているもので、つい先日 Level3 が晴れて W3C Recommendation となった。

- [CSS Cascading and Inheritance Level 3 is a W3C Recommendation](https://www.w3.org/blog/news/archives/8921)

そして、新たに First Public Working Draft が公開された Level5 では、今までの Cascading に、新たに**Layer**という概念の導入が検討されている。

本記事では CSS の Cascading についておさらいし、新しい概念である Layer とはどういったものかをまとめる。
なお、この記事で触れている内容については 2021 年 2 月現在策定が始まったばかりのものも多く含むため、将来的に大きく変更される可能性がある。

## Cascading における優先度付けの基準

CSS の Cascading では、下記の 4 つの基準で優先度が決められる。

1. Origin and Importance
2. Context
3. Specificity
4. Order of Appearance

本記事ではおさらいとしてこれら 4 つについて簡単に述べるが、詳細について知りたい場合は [Level4 の Editor's Draft](https://drafts.csswg.org/css-cascade/#cascading)を参照してほしい。

### 1. Origin and Importance

Cascading において、Origin とは style の宣言(declaration)がどこでされているかを表す。

- Author Origin: Web サイトなどのコンテンツの作者による style
- User Origin: ユーザー(Web サイトでは閲覧者)による style
- User-Agent Origin: UA(例えばブラウザ)による style

Importance は property と value の宣言に `!important` が指定されているか否かを表す。
`!important` が指定されている宣言は `important`、指定されていないものは`normal`として扱われる。

この Origin と Importance を組み合わせて、下記の順序で Origin / Importance の中での優先度付けがされる。

1. transition
2. `!important` が指定されている UA による宣言
3. `!important` が指定されている User による宣言
4. `!important` が指定されている Author による宣言
5. animation
6. Author による宣言
7. User による宣言
8. UA による宣言

### 2. Context

DOM における Shadow DOM のようなカプセル化された環境についての情報。
異なるカプセル化された context からの宣言では

- important: 内側の context の宣言が勝つ
- normal:外側の context の宣言が勝つ

という優先度付けがされる。

### 3. Specificity

詳細度。これについては CSS を書く人にとっては馴染みの深い概念のため概要は省く。
詳しい仕様は [Selectors Level 4](https://www.w3.org/TR/selectors/#specificity)で確認することができる。

### 4. Order of Appearance

宣言の stylesheet の中での登場順。同じ宣言が重複して存在した場合は、後に登場する宣言が優先される。

HTML など document の `style`属性については、document 内に登場する順番で、stylesheet の後ろに配置される。
CSS での宣言よりも style 属性のほうが優先されるのはこの取り決めによるもの。

ここまでをまとめると、最も優先されるのは`transition`による変化であり、仮にブラウザなどが`!important`を指定した宣言を持っていたら`transition`以外の方法で書き換えることが不可能という仕様になっている。

## 新たな基準: Layers

前述した Cascading における優先度付の新たな基準として Layers という基準が提案されている。

- https://www.w3.org/TR/css-cascade-5/#layering

Layer の登場と合わせ、Cascading のおける優先順位も以下のように変更されている。

1. Origin and Importance
2. Context
3. **The Style Attribute**
4. **Layers**
5. Specificity
6. Order of Appearance

style 属性についての記述が Order of Appearance から切り出され、importance が同等であっても style attribute の値としての宣言のほうが優先されることがわかりやすくなっている。

## Layer とはなにか

開発者(コンテンツ制作者)が CSS を書くとき、実際に意識する Origin は Author と User-Agent だろう。リアルワールドでブラウザが`!important`つきの宣言をしていることはあまり考えないとすると、
開発者が意識するのは `!important` の有無、style attribute、Specificity、宣言の出現順 ということになる。

CSS を一度でも書いたことがあれば、なぜか適用されてほしい style が適用されず、調べてみると詳細度や出現順によるものだったという経験がある人も多いだろう。

ここで、Layer という、Specificity よりも優先的に扱われる基準を追加する。
Layer は開発者が`@layer` rule で明示的に作成することができる。

下記の例では、`bottom`という名前の Layer を作り、style の宣言を`bottom`Layer にあるものとして、宣言している。
この単独の指定では、Author Origin で最優先される`.container`の`display`プロパティの値は、`inline-block`となる。

```css
@layer bottom {
  .container {
    display: inline-block;
  }
}
/* <div class="container"> の display は inline-block */
```

また、selector がなくても、Layer だけを先に作っておいてあとからその Layer に selector と property, value を宣言することもできる。

```css
@layer bottom;

@layer bottom {
  .container {
    display: inline-block;
  }
}
/* <div class="container"> の display は inline-block */
```

### Layer の優先度け

複数の異なる Layer が作られていてそれぞれの Layer の中に同一の宣言があった場合は、後に記述されているものが優先される。

下記の例では、`middle` Layer に宣言されている`display: flex`が優先される。

```css
@layer bottom {
  .container {
    display: inline-block;
  }
}

@layer middle {
  .container {
    display: flex;
  }
}

/* <div class="container"> の display は flex */
```

Layer は、`@layer` によって Layer が宣言された順序で優先度付がされるため、下記の例では`bototm`よりも`middle`のほうが後ろに宣言されていることになり、
` .container { display: inline-block; }`よりも`.container { display: flex; }`が優先される。

```css
@layer bottom;
@layer middle;

@layer middle {
  .container {
    display: flex;
  }
}

@layer bottom {
  .container {
    display: inline-block;
  }
}

/* <div class="container"> の display は flex */
```

Layer を指定してない宣言は、Layer が指定されている宣言よりも優先される。

```css
@layer bottom;
@layer middle;

.container {
  display: none;
}

@layer middle {
  .container {
    display: flex;
  }
}

@layer bottom {
  .container {
    display: inline-block;
  }
}

/* <div class="container"> の display は none */
```

<span class="small"> \* 結果を示すコメントに間違いがあり[修正](https://github.com/arayaryoma/araya.dev/commit/e88cc89752e04f89e42d03eb9e22e1f931086998)しました。 [@laco2net](https://twitter.com/laco2net) さんありがとうございます！</span class="small">

### Layer と Specificity

下記の例で Layer がない単純な指定では、`.container.content`のほうが Specificity が高いため、`display: inline-block;`が優先される。

```css
/* Specificity: (0,2,0) */
.container.content {
  display: inline-block;
}

/* Specificity: (0,1,0) */
.container {
  display: flex;
}

/* <div class="container content"> の display は inline-block */
```

ここで、Layer は Specificity よりも優先するものとして扱われるため、下記のように Layer を宣言すると、
Specificity が低い`display: flex;`を優先させることができる。

```css
@layer bottom;
@layer middle;

@layer bottom {
  /* Specificity: (0,2,0) */
  .container.content {
    display: inline-block;
  }
}

@layer middle {
  /* Specificity: (0,1,0) */
  .container {
    display: flex;
  }
}

/* <div class="container content"> の display は flex */
```

### Layer のネスト

Layer はネストして作ることができる。
ネストされた Layer の名前空間は親の Layer の名前空間のスコープとなるため、ネストされた Layer 内の宣言は、外の Layer には影響を与えない。
下記の宣言では、layer の出現順は

1. bottom
2. bottom first
3. middle

となるため、`.container`の`display`プロパティで優先される宣言は、`display: flex;`となる。

```css
@layer bottom {
  @layer first {
    .container {
      display: inline-block;
    }
  }
}

@layer middle {
  .container {
    display: flex;
  }
}

/* <div class="container content"> の display は flex */
```

ネストされた Layer を、親 Layer の外から参照することもできる。

その場合は、Layer の階層間に`.`をつけ、JavaScript の property access のように書く。

下記の例では、`bottom`Layer 内の`first`Layer で、 `.container { display: block; background-color: red; }` を宣言していることになる。

```css
@layer bottom {
  @layer first {
    .container {
      display: inline-block;
    }
  }
}

@layer bottom.first {
  .container {
    background-color: red;
  }
}
```

また、この例は省略して 1 つにまとめることができる。下記の例では、`bottom` Layer, `bottom`内の`first` Layer を一度に宣言している。

```css
@layer bottom.first {
  .container {
    display: inline-block;
    background-color: red;
  }
}
```

Layer の宣言を少し複雑にして、次の例を考えてみる。

```css
@layer bottom {
  .container {
    display: none;
  }
}

@layer middle.first {
  .container.content {
    display: inline-block;
  }
}

@layer middle {
  @layer first {
    .container {
      display: block;
    }
  }
  @layer second {
    .container {
      display: flex;
    }
  }
}

@layer bottom.first {
  .container.content {
    display: inline;
  }
}
```

一見しただけでは分かりづらいが、Layer の宣言順は下記の順番であるとみなされる。

1. bottom
2. bottom first
3. middle
4. middle first
5. middle second

結果として、Specificity も踏まえた優先順は降順に、

1. `display: flex;`
2. `display: inline-block;`
3. `display: block;`
4. `display: inline;`
5. `display: none;`

となる。

## @layer を使った外部 stylesheet の import

CSS では、 `@import`を使って、外部の stylesheet を import することができる。

- [https://drafts.csswg.org/css-cascade/#at-import](https://drafts.csswg.org/css-cascade/#at-import)

```css
@import url("my-theme.css");
```

現在の draft では、`@layer` を使って外部から import した sytlesheet 全体を layer の内部に含めるようにできる提案がされている。

下記の例では`theme` Layer を宣言し、`my-theme.css`のすべての宣言を`theme`layer に内包させている。

```css
@layer theme url("my-theme.css");
```

`@import` を使った場合は、`@import`宣言が import してくる中身に置き換えられたものとして扱われ、Specificity や Order of Appearance により優先度つけがされるが、
Layer を用いることで Specificity より先に Layer による優先度をさせることができる。

```css
/* my-theme.css */
.button {
  background-color: blue;
}

/* main.css */
@layer default, theme;

@layer theme url("my-theme.css");

@layer default {
  .button {
    background-color: black;
  }
}

/* <button class="button"> の background-color は black; */
```

上記の例で my-theme.css に Layer が作られていた場合、ネストされた Layer として、main.css から my-theme.css 内の Layer を参照することができる。

```css
/* my-theme.css */
@layer dark {
  .button {
    background-color: blue;
  }
}

/* main.css */
@layer theme url("my-theme.css");

@layer theme.dark {
  .button {
    background-color: white;
  }
}

/* <button class="button"> の background-color は white; */
```

HTML の`<link>`を用いた sytlesheet の読み込み時に、対象の stylesheet 全体を layer に含められるか否かについては現在議論されている。

- Issue: [https://github.com/w3c/csswg-drafts/issues/5853](https://github.com/w3c/csswg-drafts/issues/5853)

## 無名 Layer

現在の draft によると、明示的に無名 Layer を作ることもできる。

```css
@layer {
  .container {
    display: inline-block;
  }
}
```

無名 Layer は Layer における優先度付けるでは Layer が設定されていないものと同等に扱われるため、意味がないように思えるが、
「CSS を書くときには明示的に Layer を必ず指定する」というルールをチーム内で決める といったユースケースは考えられる。

ネストされている Layer のネスト構造の途中に無名 Layer があった場合、その内部の Layer には外から参照することができなくなる。

```css
/* button.css */
@layer default {
  button.button {
    background-color: black;
    color: white;
  }
}

/* dark.css */
@layer url("button.css");
@layer url("nav.css");

/* theme.css */
@layer dark url("dark.css");

/* main.css */
@layer theme url("theme.css");
/* button.cssのなかで宣言されている "default" Layer は参照できない */

/* button.button の background-color に優先度付けで勝つためには新たなLayerを作る必要がある。 */
@layer override-button {
  button.button {
    background-color: white;
    color: black;
  }
}
```

これにより、テーマ内の特定の宣言 A についてはテーマを使う側から書き換えることができるが、別の宣言 B は新たに Layer を定義しないと書き換えることができない、ということが可能になる。

## 各ブラウザエンジンの対応状況

### Blink

- Issue: [https://bugs.chromium.org/p/chromium/issues/detail?id=1095765](https://bugs.chromium.org/p/chromium/issues/detail?id=1095765)

### Gecko

- Request for Position: [https://github.com/mozilla/standards-positions/issues/471](https://github.com/mozilla/standards-positions/issues/471)
  - 未確定
  - アイディア自体は支持するが、まだ仕様が未発達だという反応。

### Webkit

- Request for Position: [https://lists.webkit.org/pipermail/webkit-dev/2021-January/031664.html](https://lists.webkit.org/pipermail/webkit-dev/2021-January/031664.html)
  - 現在返答なし

## 関連資料

- Explainer: [https://github.com/oddbird/css-sandbox/blob/main/src/layers/explainer.md](https://github.com/oddbird/css-sandbox/blob/main/src/layers/explainer.md)
- Issues: [https://github.com/w3c/csswg-drafts/labels/css-cascade-5](https://github.com/w3c/csswg-drafts/labels/css-cascade-5)
- Request for TAG review: [https://github.com/w3ctag/design-reviews/issues/597](https://github.com/w3ctag/design-reviews/issues/597)
- First Public Working Draft 以前の議論: [https://github.com/w3c/csswg-drafts/issues/4470](https://github.com/w3c/csswg-drafts/issues/4470)

## まとめ

- Cascading における新たな基準: Layers
- Layer の概説
- Layer の記法
- ブラウザエンジンの対応状況および進められている議論

についてまとめた。
Cascading の優先度付けに新たな基準が加わるというのは CSS にとって大きな変更であり、CSS フレームワークやアプリケーションの CSS 設計に大きく影響を与える可能性があると考えている。
今後も動向を追っていきたい。
