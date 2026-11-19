---
title: StarlingMonkey に contiribute した
date: "2026-11-09"
---

先日[Starling MonkeyにはじめてPRを出した](https://github.com/bytecodealliance/StarlingMonkey/pull/348)。

Starling MonkeyはBytecode Alliance下にあるJSRuntimeで、wasm componentとしてcompile可能であり、Fastly ComputeのJS Runtimeなどで用いられている。

内部的にはJS EngineはSpider Monkeyを用いており、fetchなどのDOM相当、つまりWinterTCで取り扱われるようなAPIはStarling Monkeyで実装している。

今回出したPRはRequest/Responseを `text()` や `json()` でdecodeする際にUTF-8の扱いを[WHATWGのencoding spec](https://encoding.spec.whatwg.org/#utf-8-decode)に揃えるものだ。

encoding specは、UTF-8 をdecodeする際にBOMを取り除きbodyに対してdecodeするように定められている。
これまでのStarling Monkeyの実装ではBOMを検知した時点で無効なバイト列としてエラーとして終了していた。

Starling Monkey はWPTの一部を用いてテストを行っており、17のテストケースをPASSさせるようにした。

このPRは円滑にmergeされた。

Starling Monkey、もっというとBytecode Alliance自体、開発スピードが緩やかになっているように見えていたため、2日程度でレビューをもらえたのは安心感があった。
