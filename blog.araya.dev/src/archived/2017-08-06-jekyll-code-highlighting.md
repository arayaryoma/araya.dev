---
title: "jekyll code highlighting"
date: "2017-08-06"
tags:
  - jekyll
---

jekyll でブログ書いてると、[code highlighting](https://jekyllrb.com/docs/templates/#code-snippet-highlighting)を確実に使うことになるが、
対応してる言語や syntax がよくわかんなかったので調べた。

jekyll は code highlighting に[Rouge](http://rouge.jneen.net/)を使用していて、Rouge は[Pygments](http://pygments.org/)と完全互換らしいので、
Pygments で使える code highlight は jekyll 上でも使うことができる。

[ここ](http://pygments.org/languages/)に載ってる言語は highlighting が利用できるはず。
