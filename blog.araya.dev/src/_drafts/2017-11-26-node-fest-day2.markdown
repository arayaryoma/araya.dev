---
title: "node fest day2"
date: "2017-11-26 13:56:24 +0900"
---

# Sharing is Caring… At Scale! -- Sarah Saltrick Meyer
- BuzFeedはモノリシックなPerlアプリケーション(700行のswitchがある)になってたが、 つらいのでマイクロサービス・コンテナ化した
- スタイルガイドを定めた https://solid.buzzfeed.com/
- 別のアプリケーション間で同じコンポーネントを共有したい。コピペはしたくない。
- 昔コンポーネントライブラリを作ったが、そのころはモノリスアプリケーションだったので誰も使ってくれなかった。 => 優れたものを作ってもタイミングが大事
- 「私達はBuzzって言葉を使いすぎますよ、やっぱり」
- コンポーネントを置いておくギャラリーがある。 => デザイナーにも嬉しい

# data sketches: A Visualization a Month -- Shirley Wu
http://sxywu.com/datasketches-talk/#/before-starting
- 好奇心が全て。旅行に言った時どんな写真とってるだろう？一番検索されている観光地はどこだろう？
- 気になったものをアイディアスケッチに起こす

# JSON Schema Centralized Design -- Hikaru TAKEMURA
## API Spec
### 仕様と実装の乖離
- 別々にメンテするから起きる。
- 仕様を中央集権にして、それをもとに実装をすすめる

## JSON Schema

## RAML
- REST APIの定義フォーマット　
- Swaggerとかで使われるやつ

## JSON Schema Centralized Design
- 基本的にRAMLとJSON Schema しかメンテしない
###
### validation
- https://github.com/mafintosh/is-my-json-valid
### Flow Type
https://github.com/dannynelson/json-schema-to-flow-type
JSON SchemaからFlow Typeを自動生成
### Stub Object
- raml-serverから mock APIを生成できる

## まとめ
- Spec Driven Development

# Real-world applications of hash functions -- Emil Bay
t
