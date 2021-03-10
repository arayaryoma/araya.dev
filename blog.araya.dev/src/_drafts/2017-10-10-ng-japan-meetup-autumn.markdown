---
title: "Ng Japan Meetup Autumn"
date: "2017-10-10 19:37:00 +0900"
---

# lacoさん Angular v5.0.0
- Animations
  - :increments / :decrements
  - Disable animations by data-binding
  - Negative Query Limit (count from tail)
- Router
  - ChildActivationStart/End
  - ActivationStart/End
- Forms
  - updateOn
    - アップデートのタイミングをコントロールできる('change' | 'blur' | 'submit')
- Core
  - Multiple 'exportAs'
  - Bootstrap on custom zone.js
    - zone.jsを除外すると、変更検知できなくなるので自分でコンポーネントに書く
    -
- Http
  - httpClientに直接Object mapを突っ込めるようになった
- Platform Server
  - TransferState
  - Render Hooks
- ServiceWorker
  - Rewritten in angular/angular
  - experimental. 触らないほうが良い
- Deprecation
    - @angular/http は非推奨。 HttpClientを使いましょう
- Removal
   - <template>
   - OpaqueToken
   - initialNavigation: true | false
   - ngForは*ngForだけ
- Breaking Changes
   - Require TypeScript 2.4
   - number, currency, decimal, date あたりのpipeの内部実装が変わった
     - Intl APIを捨てた
     -  en_US以外は追加で読み込まなきゃいけない。`registerLocaleData()`
     - DeprecatedI18NPipesModuleを使うのもあり。ただしv6.0.0で消える
- https://next.angular.io/docs

# Compile - Quramiさん
## Component
Componentをパースして描画、アップデートする関数は別にしてるってのがCompilerがやってること

# Just in Time or Ahead of Time
## JiT
- ブラウザで動作させるまでCompileエラーに気づけない
- XSSをつかれた場合、動的にComponentを書き換えられる可能性がある
## AoT
- ビルドに時間かかりすぎ
- jsのサイズが肥大


AoTが速ければJiTなんて使わなくていい
- Transformer (TypeScript魔改造) angular-cli >= v1.5.0
- TS2.4.1からCustom Transformerが許されるようになった
- Transformer?
  - ASTを別のASTへ変換する

Angular Bazel Rule
Bazelはビルド対象を細分化した上で並行してビルドを実行
対応された場合、ビルドにJVMが必要になる...


# Angularの設計指針
## 中規模
- ServiceはただのTSのclass。オブジェクト指向の原則に従う
- すべては非同期であることを前提に作る
## 大規模
- 優秀なエンジニアが複数人いるときの宗派の違いは無駄な議論のもと
- DDDみたいな設計手法に乗っかる
- コードは腐敗する。それをきちんと把握し、負債は計画的に返済する
