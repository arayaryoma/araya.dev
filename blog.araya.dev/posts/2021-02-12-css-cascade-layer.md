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

## Cascade に影響する要素

CSS の Cascade 処理では、下記の 4 つの基準で優先度が決められる。

1. Origin / Importance
2. Context
3. Specificity
4. Order of Appearance

本記事ではおさらいとしてこれら 4 つについて簡単に述べるが、詳細について知りたい場合は [Level4 の Editor's Draft](https://drafts.csswg.org/css-cascade/#cascading)を読んだほうがいい。

### 1. Origin / Importance

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
