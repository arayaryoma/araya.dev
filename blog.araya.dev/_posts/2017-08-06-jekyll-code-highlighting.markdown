---
title: "jekyll code highlighting"
date: "2017-08-06 21:49:42 +0900"
tags:
  - jekyll
---

jekyllでブログ書いてると、[code highlighting](https://jekyllrb.com/docs/templates/#code-snippet-highlighting)を確実に使うことになるが、
対応してる言語やsyntaxがよくわかんなかったので調べた。

jekyllはcode highlightingに[Rouge](http://rouge.jneen.net/)を使用していて、Rougeは[Pygments](http://pygments.org/)と完全互換らしいので、
Pygmentsで使えるcode highlightはjekyll上でも使うことができる。

[ここ](http://pygments.org/languages/)に載ってる言語はhighlightingが利用できるはず。
