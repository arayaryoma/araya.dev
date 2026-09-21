# editor.araya.dev

blog.araya.dev の記事エディタ。スマートフォンのブラウザから Markdown で記事を書き、
画像を添付し、そのまま GitHub にコミットするための Cloudflare Worker です。

記事の保存先は既存の記事とまったく同じ `blog.araya.dev/src/content/blog/` で、
コミットが `main` に入ると `.github/workflows/build-and-deploy.yml` が
いつもどおりブログをビルドしてデプロイします。エディタ専用のデータストアはありません。

## できること

- Markdown での執筆と、ブログ本体と同じスタイルシートを使ったプレビュー
- frontmatter（タイトル / 日付 / タグ / 説明 / サムネイル / 下書き）のフォーム編集
- 画像アップロード（撮った写真はブラウザ側で長辺 1600px に縮小してからコミット）
- GitHub OAuth によるログイン。許可されるのは `ADMIN_GITHUB_LOGIN` の 1 アカウントのみ

新規記事は常に `draft: true` で作られます。ブログは `DRAFTS` が設定されたときしか
下書きを出力しないので、書きかけをコミットしても公開はされません。

## 認証の考えかた

ログインは GitHub OAuth の web application flow です。ここで得たアクセストークンが
そのままコミットに使う資格情報になるので、

- サーバーに長期有効な personal access token を置かずに済む
- コミットが管理者本人の名前で残る
- GitHub 側で認可を取り消せば、エディタの書き込み権限も同時に消える

という性質が得られます。トークンは `SESSION_SECRET` から HKDF で導出した鍵で
AES-GCM 暗号化し、`__Host-` 付きの HttpOnly Cookie に封入します。
サーバー側のセッションストアはありません。`SESSION_SECRET` を差し替えれば
発行済みセッションはすべて無効になります。

ログインを許されるアカウントは `ADMIN_GITHUB_LOGIN` と一致する 1 つだけで、
この判定はログイン時だけでなくリクエストごとに行われます。

## セットアップ

### 1. GitHub OAuth App を作る

<https://github.com/settings/developers> で New OAuth App:

| 項目                       | 値                                       |
| -------------------------- | ---------------------------------------- |
| Application name           | 任意（例: `araya.dev blog editor`）      |
| Homepage URL               | `https://editor.araya.dev`               |
| Authorization callback URL | `https://editor.araya.dev/auth/callback` |

callback URL は完全一致で照合されるので、1 文字も違えられません。
client secret は発行直後にしか表示されないので、その場で控えます。

必要なスコープは `public_repo` です（`src/oauth.ts` の `OAUTH_SCOPE`）。
arayaryoma/araya.dev は public なのでこれで足ります。private にする場合は `repo` に
変更してください。

### 2. シークレットを登録する

```sh
cd editor.araya.dev
pnpm install

pnpm exec wrangler secret put GITHUB_CLIENT_ID
pnpm exec wrangler secret put GITHUB_CLIENT_SECRET
openssl rand -base64 32 | pnpm exec wrangler secret put SESSION_SECRET
```

`SESSION_SECRET` は 32 文字以上が必須です（短いと起動時に 500 で弾かれます）。

### 3. デプロイする

```sh
pnpm run deploy
```

初回のデプロイで `editor.araya.dev` のカスタムドメインが作成されます。
araya.dev ゾーンは既に Cloudflare にあるので、DNS の手作業は要りません。

以降は `main` への push で GitHub Actions が自動デプロイします。
そのためにリポジトリの secret に `CLOUDFLARE_API_TOKEN` を登録してください
（権限は Account → Workers Scripts → Edit）。未登録のあいだ、この job は
失敗ではなくスキップされます。

## 開発

```sh
pnpm install
cp .dev.vars.example .dev.vars   # ローカル用の OAuth App の値を入れる
pnpm dev                         # http://localhost:8787
pnpm check                       # 型検査（Worker とクライアントを別々に）
pnpm test                        # node:test
```

ローカルでログインまで試すには、callback URL が `http://localhost:8787/auth/callback`
の OAuth App をもう 1 つ登録する必要があります。OAuth App は callback URL を
1 つしか持てないためです。

## 構成

```
src/        Worker（ルーティング、OAuth、セッション、GitHub API、HTML シェル）
client/     ブラウザ側のバンドル（エディタ本体、プレビュー、ツールバー、画像縮小）
scripts/    esbuild によるクライアントのビルドとテスト実行
test/       node:test
public/     クライアントのビルド成果物（gitignore 済み、wrangler が静的配信）
```

プレビューはブログ本体の `blog.araya.dev/src/styles/markdown.css` を
そのまま `@import` しています。記事の見た目を変えたらプレビューにも自動で反映されます。

## 既知の差分・制限

- プレビューのコードブロックにシンタックスハイライトはありません。ブログのビルドでは
  Astro の Shiki が当たりますが、そのために shiki をクライアントへ同梱するのは
  割に合わないと判断しました。背景色だけ本番に合わせてあります。
- コミットしたばかりの画像はまだデプロイされていないため、プレビューでは
  ブラウザ内の blob URL を表示します。保存済みの記事の画像は blog.araya.dev から読みます。
- 保存は 1 ファイル 1 コミットです（記事の保存と画像の追加で別々のコミットになります）。
- 既存記事のファイル名（= URL）はエディタからは変更できません。
- `.mdx` の記事も開いて編集できますが、プレビューは MDX のコンポーネントを解釈せず
  素の Markdown として描画します。
