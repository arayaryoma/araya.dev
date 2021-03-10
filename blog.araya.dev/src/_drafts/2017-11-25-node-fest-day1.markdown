---
title: "node fest day1"
date: "2017-11-25 12:58:41 +0900"
---

# Source to Binary - journey of V8 javascript engine -- 青野健利 a.k.a brn
https://speakerdeck.com/brn/source-to-binary-journey-of-v8-javascript-engine
## Execution flow
source -> AST -> Bytecode -> Graph -> Assembly
## Parse
- Make AST from the source
### Problems
- Parsing all function --> too slow
### lazy parsing
```
function x(a, b) {
  return a + b;
}
```
ASTを作らずにパースする。`x()`が呼ばれた段階でASTにパースする
## AST
- V8はASTを作った後更に変形をかける
### ES - Bynary AST
- 今のASTのサイズが大きいのでBinary ASTにする提案がでてる
## Ignition
- V8が生成したASTを1~4byteのBytecodeに変換
### Ignition Handler
- CodeStubAssemblerというDSLで記述されてる
- 実行予定のNodeを組み立てるだけ。Assemblyをいちいち書かなくていい。すごい。
- BuiltinsはAssemblerクラスを利用して各アーキテクチャ向けの処理をラップしてる。
### Builtins
### Runtime
- Builtinsやその他のアセンブラコードから呼べるただのC++
## Hidden Class
- JSには型がないからオブジェクトの構造自体を内部的にmapなどを型として作成
- 別のオブジェクトでも同じ構造を持ってたら同じHidden Classとして扱う
- Map王ジェクトはプロパティの構造を厳密にチェックしてる
- プロパティの増減が起きた時はMapを共有しながら新しいMapを使う
- オブジェクトのプロパティアクセスや型チェックが高速かつ安全にできる
## Inlne Caching
- オブジェクトからプロパティを探すのは遅い。HashMapやFixedArrayからプロパティをロードするから。
- Cacheは特定のMapを初回呼び出し時に記憶する。
### Cache miss
- 4つまでMapオブジェクトをキャッシュできる
### Cache state
- Pre Monmorphic
- Monomorphic
- Polymorphic
- Megamorphic
  - Mapの記録を停止
## Optimization
- Optimize Budgetが0を切ったら最適化が走る
### For loop
- JumpLoopというバイドコードが出力される
### Concurrent Compilation
- functionは並列的にコンパイルされてる
### TurboFun
### Code generation
### Deoptimization
- 最適化したAssemblyコードに予期せぬ値が渡ったらコンパイルし直す

# Make you a React: How to build your own JavaScript framework. -- Jorge Bucaran
http://goo.gl/UKjXiC
- Virtual DOM
## JSX
## VDOM
- virtual nodeを作って、DOMを更新する(`patch()`)
- Performanceを上げるためのものではなくて、開発者が書きやすいようになっている。
## Virtual Node
- ただのJSオブジェクト
-

# WebAssembly and the Future of the Web -- Athan Reines
- JSの数値計算ライブラリ https://stdlib.io/
## History
### Javaアプレット
- ブラウザ上から実行可能だった。JavaScriptのグラフィック処理の発展によって廃れた
### ActiveX
-
### NaCl
### PNaCl
### asm.js
## WebAssembly
- C/C++ -> IR -> wasm -> x86/ARM
- バイナリエンコーディングとテキストフォーマットがある
### 使える型
- i32, f32, i64, f64
### Binary Encoding
- Magic Number: `00 61 73 6d` -> `asm`
## Advantages
Compact, Parsing, Typed, Optimization, Deoptimization, Lower-level, GC, Performance
### Emscripten
- LLVM code -> JS code
### Roadmap
- ブラウザ互換性
- 活発な開発
- LLVM
- Develoer tools
- GCなどの新しい機能
- Node.jsのアップデート

# No REST for the weary... Introducing GraphQL -- Sia Karamalegos
## History
- RESTの前にはSOAPがあったよね
- クライアントとサーバーの結合が密なのはよくなくてなくなった
### REST
- HTTPのメソッドでクライアントとサーバー間の結合が疎になった
- 1ページのデータを表示するために叩くREST APIが多すぎる
- リソース指向よりもニーズ指向。必要なデータだけを全部取りたい
### GraphQL
- http://graphql.org/
#### 実装例
- https://github.com/graphql/swapi-graphql
- https://github.com/siakaramalegos/star_wars_graphql
#### ecosystem
- https://github.com/graphql/graphiql


# Turbo Boost Next Node.js -- Yosuke Furukawa
## Inside of Node.js
- 標準ライブラリ
- n-api
- V8
- http-parser, c-ares, OpenSSLとかのmiddleware
- libuv
## V8 Optimization
- Runtimeで最適化
-　Deoptimizationが走るとかなり遅くなる
### 前のバージョンであった問題
- ESの最新版に対応してない
- Deoptimizationが起きないように気をつけなきゃいけない
- 大量のマシンコードを生むので、メモリを食う
## V8v6
- Ignition InterpreterがBytecodeを生成
- TurboFan Compilerがマシンコードを生成
## UseCases
- 色々使われるようになってきたけど、CPUに高負荷をかける。Node.jsは向いてないと言われてきた
- Node.jsもConcurrencyを入れるようになってきたし、workerの活用による明るい未来が見えている

# Native ES Module - something almost, but not quite entirely unlike CommonJS -- Gil Tayar
## ESM and CJSM
- import => Asynchronous, require() => Synchronous
- ES moduleを使う時は拡張子が`.mjs`じゃないとだめ
### export as default
### index
- まずindex.jsを探す
- package.jsonの`main`フィールドに指定するのがbetter

# SSR with Angular -- Angular Universal Suguru Inatomi
AngularでSSRするにはAngular Universal
## Why SSR
- パフォーマンスとSEO
## DOMINO
https://github.com/fgnass/domino

# 2017版、React、Lambda、S3で始めるモダンなユーザーデータ可視化ツール 向山 裕介
## API Gateway
- VPCの中にエンドポイントを閉じ込められるようになった
- アクセスログが使えるようになった

# How TypeScript can simplify design decision Hyunje Jun

# Introduction to Visual Regression Testing Yusuke Kurami
- https://speakerdeck.com/quramy/introduction-to-visual-regression-testing-jp
