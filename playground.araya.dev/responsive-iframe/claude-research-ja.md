# Responsively-sized iframe と子ドキュメントの meta タグ

> [!NOTE]
> このドキュメントは Claude によるリサーチ結果のまとめ(日本語)。「なぜ responsively-sized iframe は子ウィンドウに meta タグを必要とするのか」という質問に対する調査を、blog.araya.dev の記事の文体でまとめたもの。

CSS の `frame-sizing` プロパティ([CSS Box Sizing Module Level 4 §5.3](https://drafts.csswg.org/css-sizing-4/#responsive-iframes) / [Chrome Platform Status](https://chromestatus.com/feature/5108373464547328))を使うと、`<iframe>` 要素を埋め込んだドキュメントのコンテンツの固有サイズに合わせてサイズさせることができる。iframe 内にスクロールバーが出なくなり、埋め込みコンテンツが親ページとシームレスに繋がって見える。

```html
<!-- 親(埋め込む側) -->
<iframe src="frame.html"></iframe>

<style>
  iframe {
    frame-sizing: content-height;
    height: auto;
  }
</style>
```

ただし親が `frame-sizing` を指定するだけでは機能せず、子(埋め込まれる側)のドキュメントが `<head>` 内で meta タグによりオプトインする必要がある。

```html
<!doctype html>
<html>
  <head>
    <meta name="responsive-embedded-sizing" />
  </head>
  <body>
    <!-- content -->
  </body>
</html>
```

このディレクトリのデモ([index.html](./index.html))を動かしながら、なぜ子側のオプトインが必要なのかを調べた。

## なぜ子ドキュメントのオプトインが必要なのか

### クロスオリジンの情報漏洩を防ぐため

これが核心の理由だ。同一オリジンポリシーは、クロスオリジンのドキュメントの内部情報をその埋め込み元から隠している。コンテンツの高さもそのひとつだ。

しかし iframe **要素**自体は親の DOM に属している。もしブラウザが子のコンテンツに合わせて iframe 要素を自動でリサイズしたら、親は `getBoundingClientRect()` や `ResizeObserver` でそのサイズを読み取れてしまう。

コンテンツの高さはコンテンツの関数であり、コンテンツはユーザーに依存する。ログイン済みかどうか、検索結果の件数、アカウント固有の情報、A/B テストのバリアント……。同意なしの自動リサイズは、フレームに入れられるあらゆるサイトに対するログイン状態検出やフィンガープリンティングのサイドチャネルを、すべての埋め込み側に与えてしまう。

そこでこの機能は**相互オプトイン**として設計されている。[Intent to Prototype のスレッド](https://groups.google.com/a/chromium.org/g/blink-dev/c/QirdSBIvM1k/m/rZdHOE59AQAJ)でも「新たに公開される情報はわずかで、双方がオプトインした場合にのみ公開される」と説明されている。親は CSS プロパティで、子は自分のサイズが公開されることに meta タグで同意する。

この脅威モデルでは親が攻撃者になりうるので、親の CSS プロパティだけでは同意として成立しない。情報を公開されるのは子側だから、子の同意が必要になる。

これはこの機能が置き換える従来のワークアラウンド([legacy.html](./legacy.html) にデモがある postMessage / iframe-resizer 方式)と同じ構図でもある。従来方式では子が自分の高さを報告するスクリプトを能動的に実行する必要があり、構造上、子は常に協力的な参加者だった。meta タグはその「同意」をスクリプトなしで宣言的に表現するものといえる。

### 埋め込まれる側を想定外のリサイズから守るため

オプトインがなければ、自分のサイトをフレームに入れた任意のページが、設計時に想定していなかった形でレイアウトを操作できてしまう。固定ビューポート前提のデザインが壊れたり、ユーザーのカーソルの下で UI がリサイズ・再配置される(クリックジャッキングに近い操作)恐れがある。オプトイン制なら、埋め込み用に作られたドキュメントだけが対象となり、レガシーコンテンツには影響しない。

### なぜ `<head>` 内・`<body>` より前でなければならないのか

responsive embedded sizing フラグは `<body>` の開始時点で確定する。ブラウザは最初のレイアウトの前に固有サイズを親へ伝播すべきかを知る必要があり、これによりサイズ決定が決定的になり、再レイアウトによるちらつきを避けられる。

セキュリティ上の利点もある。ページの body にマークアップを注入できる攻撃者(コメント欄やユーザー投稿コンテンツなど)がいても、遅れて書かれた meta は無視されるため、そのページを勝手にサイズ公開へオプトインさせることはできない。

### ロード後のサイズ更新も子がコントロールする

固有サイズはロード時に取得され、その後の変化は子自身が `window.requestResize()` を呼んだときにのみ親へ伝わる。親が継続的なライブフィードを勝手に得ることはない。これもオプトインモデルと一貫した、漏洩を最小限に抑える設計だ。

```js
// 子ドキュメント内
function onContentChanged() {
  // ...DOM を更新...
  window.requestResize();
}
```

なお、オプトインしていないドキュメントで `requestResize()` を呼ぶと `NotAllowedError` が投げられる。

## 特定の親にだけサイズを公開できるか

meta タグ自体にはオリジンや URL の許可リストを指定する仕組みは(現行の仕様案では)なく、「全員に公開するか、しないか」の二択だ。ただし実質的に同じ効果を得る方法はある。

**`frame-ancestors` で埋め込み元自体を制限する**のが正攻法だ。サイズが漏れるのは埋め込まれたときだけなので、CSP で埋め込みを許可するサイトを絞れば、サイズ情報が公開される相手も自動的にそのサイトだけになる。

```
Content-Security-Policy: frame-ancestors https://trusted.example
```

信頼できない親はそもそもページをフレームに入れられないので、漏らすサイズが存在しない。「meta でオプトイン + `frame-ancestors` で埋め込み元を許可リスト化」の組み合わせが、事実上の「特定サイトにだけ公開」になる。

他にも、iframe のナビゲーションリクエストに届く `Referer` や `Sec-Fetch-Site` ヘッダを見てサーバー側で meta タグを出し分ける方法もあるが、`Referer` は Referrer-Policy に依存する(デフォルトの `strict-origin-when-cross-origin` ではオリジンのみ、`no-referrer` なら欠落する)ため確実性には限界がある。

## X-Frame-Options との関わり

`X-Frame-Options`(XFO)や CSP の `frame-ancestors` とは直接の依存関係はなく、別レイヤーの独立した仕組みだが、役割が補完的だ。

XFO / `frame-ancestors` が決めるのは「**そもそも埋め込みを許すか**」で、ナビゲーションの段階で判定される。一方 `<meta name="responsive-embedded-sizing">` が決めるのは「**埋め込まれた後に、自分のコンテンツサイズを親へ公開するか**」だ。XFO で埋め込みがブロックされれば iframe 自体が描画されないので、meta があってもサイズが漏れる余地はない。逆に埋め込みが許可されても、meta がなければ `frame-sizing` は効かず iframe は固定サイズのままになる。「埋め込みの可否」と「サイズ公開の可否」の二段階のゲートになっている。

XFO に使える値は実質 `DENY` と `SAMEORIGIN` だけで、特定オリジンを許可する `ALLOW-FROM` は仕様から削除され現行ブラウザはサポートしていない。したがって「特定の他サイトにだけ埋め込み(=サイズ公開)を許す」には XFO ではなく `frame-ancestors` が必要になる。両方送った場合、`frame-ancestors` を解釈できるブラウザは XFO を無視する。

ちなみに `XFO: SAMEORIGIN` の構成では、同一オリジンの親はもともと `contentDocument` 経由で子の高さを直接測れるので、サイズは「新たに漏れる情報」ではない。この場合の meta は純粋にシームレス表示のためのオプトインになる。

対照的な設計として面白いのは、XFO が HTTP ヘッダ専用で `<meta http-equiv>` での指定は仕様上無視される点だ。埋め込み拒否はレンダリング開始前に確実に判定される必要があり、マークアップ経由だと注入や後出しのリスクがあるためだ。一方サイズ公開のオプトインが meta タグで許されているのは、「保護を解除する」のではなく「ページ作者が自分の情報公開に同意する」方向の宣言であることと、`<body>` 開始時点でフラグが確定するため body へのコンテンツ注入では悪用できないことによる。守る側はヘッダで厳格に、公開に同意する側はマークアップで手軽に、という住み分けになっている。

## まとめ

`<meta name="responsive-embedded-sizing">` は、埋め込まれたドキュメントが「オリジン境界を越えて自分のコンテンツサイズを公開すること」への明示的な同意だ。これがなければ、コンテンツ基準の iframe サイズ調整はすべての iframe をログイン状態検出やコンテンツ推測のためのクロスオリジンサイドチャネルに変えてしまい、リサイズを想定していないサイトを埋め込み側が操作できるようになってしまう。

埋め込みパートナーを限定しつつこの機能を使いたいなら、「`frame-ancestors` で埋め込み元を許可リスト化 + 子ページに meta でオプトイン」が正攻法だ。

## 参考

- [CSS Box Sizing Module Level 4 §5.3 — Responsive iframes](https://drafts.csswg.org/css-sizing-4/#responsive-iframes)
- [Chrome Platform Status: Responsively-sized \<iframe\>](https://chromestatus.com/feature/5108373464547328)
- [Intent to Prototype: Responsive iframes — blink-dev](https://groups.google.com/a/chromium.org/g/blink-dev/c/QirdSBIvM1k/m/rZdHOE59AQAJ)
- デモ: [index.html](./index.html) / レガシーな手法との比較: [legacy.html](./legacy.html)
