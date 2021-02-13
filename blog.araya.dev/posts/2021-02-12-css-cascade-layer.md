---
title: CSSのCascadeに追加されようとしているLayerという概念
tags:
  - browser
  - css
  - w3c
date: "2021-02-13 00:00:00 +0900"
---

2021 年 1 月に [CSS Cascading and Inheritance Level 5 の First Public Working Draft](https://www.w3.org/TR/css-cascade-5/) が公開された。
CSS Cascading and Inheritance はその名の通り、CSS の Cascade や継承などについての仕様を定義しているもので、つい先日 Level3 が晴れて W3C Recoomendation となった。

- [https://www.w3.org/blog/news/archives/8921](CSS Cascading and Inheritance Level 3 is a W3C Recommendation)

そして、新たに First Public Working Draft が公開された Level5 では、今までの Cascade に、新たに**Layer**という概念の導入が検討されている。

本記事では今までの Cascading 処理についておさらいし、Layer とはどういったものかをまとめる。
なお、この記事で触れている内容については 2021 年 2 月現在策定が始まったばかりのものも多く含むため、将来的に大きく変更される可能性がある。

## Cascade に影響する要素

CSS の Cascade 処理では、下記の 4 つの基準で優先度が決められる。

1. Origin and Importance
2. Context
3. Specificity
4. Order of Appearance

本記事ではおさらいとしてこれら 4 つについて簡単に述べるが、詳細について知りたい場合は [Level4 の Editor's Draft](https://drafts.csswg.org/css-cascade/#cascading)を読んだほうがいい。

### 1. Origin and Importance

Cascading において、Origin とは style の宣言(declaration)がどこでされているかを表す。

- Author Origin: Web サイトなどのコンテンツの作者による style
- User Origin: ユーザー(Web サイトでは閲覧者)による style
- User-Agent Origin: UA(例えばブラウザ)による style

Importance は property と value の宣言に `!important` が指定されているか否かを表す。
`!important` が指定されている宣言は `important`、指定されていないものは`normal`として扱われる。

この Origin と Importance を組み合わせて、下記の順序で Origin / Importance の中での優先付がされる。

1. transition
2. `!important` が指定されている UA による宣言
3. `!important` が指定されている Uer による宣言
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

という優先度付がされる。

### 3. Specificity

詳細度。これについては CSS を書く人にとっては馴染みの深い概念のため概要は省く。
詳しい仕様は [Selectors Level 4](https://www.w3.org/TR/selectors/#specificity)で確認することができる。

### 4. Order of Appearance

宣言の stylesheet の中での登場順。同じ宣言が重複して存在した場合は、後に登場する宣言が優先される。

HTML など document の `style`属性については、document 内に登場する順番で、stylesheet の後ろに配置される。
CSS での宣言よりも style 属性のほうが優先されるのはこの取り決めによるもの。

ここまでをまとめると、最も優先されるのは`transition`による変化であり、仮にブラウザなどが`!important`を指定した宣言を持っていたら、`transition`以外の方法で書き換えることが不可能という仕様になっている。

## 新たな基準: Layers

前述した Cascading における優先度付の新たな基準として Layers という基準が登場している。

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
