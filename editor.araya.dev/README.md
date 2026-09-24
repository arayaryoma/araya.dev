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
- GitHub App によるログイン。許可されるのは `ADMIN_GITHUB_LOGIN` の 1 アカウントのみで、
  書き込めるのは araya.dev 1 リポジトリだけです

新規記事は常に `draft: true` で作られます。ブログは `DRAFTS` が設定されたときしか
下書きを出力しないので、書きかけをコミットしても公開はされません。

## 認証の考えかた

ログインは **GitHub App** のユーザー認可フローです。ここで得た user access token が
そのままコミットに使う資格情報になるので、

- サーバーに長期有効な personal access token を置かずに済む
- コミットが管理者本人の名前で残る
- GitHub 側で認可を取り消せば、エディタの書き込み権限も同時に消える

という性質が得られます。

GitHub App のトークンは「アプリの permission」「アプリがインストールされた
リポジトリ」「ログインしたユーザー自身の権限」の**積集合**です。エディタのアプリは
`Contents: Read and write` だけを持ち、araya.dev 1 つにだけインストールするので、
このトークンでは他のリポジトリに一切触れません。OAuth App の `public_repo` スコープ
では「書き込めるすべての public リポジトリ」になってしまい、ここまで絞れません。

トークンは `SESSION_SECRET` から HKDF で導出した鍵で AES-GCM 暗号化し、`__Host-`
付きの HttpOnly Cookie に封入します。サーバー側のセッションストアはありません。
`SESSION_SECRET` を差し替えれば発行済みセッションはすべて無効になります。

ログインを許されるアカウントは `ADMIN_GITHUB_LOGIN` と一致する 1 つだけで、
この判定はログイン時だけでなく毎リクエスト行います。

### トークンの更新

GitHub App の user access token は 8 時間で失効し、同時に refresh token
（6 か月未使用で失効）が発行されます。エディタは refresh token も同じ Cookie に
封入しておき、失効が近づいたリクエストで自動的に更新して Cookie を貼り直します。
更新のたびに refresh token も回転するため、古いほうは即座に使えなくなります。

そのためセッション Cookie の寿命はアクセストークンの 8 時間ではなく 30 日で、
更新のたびに延びます（`SESSION_TTL_SECONDS`）。refresh token が期限切れ・使用済み・
認可取り消しのいずれかだった場合は Cookie を破棄してログイン画面に戻します。

## セットアップ

### 1. GitHub App を作る

<https://github.com/settings/apps/new> で作成します。

| 項目                                    | 値                                         |
| --------------------------------------- | ------------------------------------------ |
| GitHub App name                         | 任意（例: `araya.dev blog editor`）        |
| Homepage URL                            | `https://editor.araya.dev`                 |
| Callback URL                            | `https://editor.araya.dev/auth/callback`   |
| Webhook → Active                        | **チェックを外す**（webhook は使いません） |
| Where can this GitHub App be installed? | **Only on this account**                   |

Callback URL は完全一致で照合されます。GitHub App は callback URL を 10 個まで
登録できるので、`Add callback URL` で `http://localhost:8787/auth/callback` も
足しておくと、ローカル開発用に別アプリを作らずに済みます。

**Repository permissions は 1 つだけです。**

| permission | 設定               | 理由                                   |
| ---------- | ------------------ | -------------------------------------- |
| Contents   | **Read and write** | 記事の読み込みと、記事・画像のコミット |
| Metadata   | Read-only          | 他の permission を選ぶと自動で付きます |
| それ以外   | **No access**      | 使いません                             |

特に **Workflows は与えないでください**。`.github/workflows/` への書き込み権限で、
エディタは使いません。与えなければ、万一ワークフローを書き換えようとしても GitHub
側が拒否します。Organization permissions と Account permissions はすべて不要です
（`GET /user` が返す `login` / `name` / `avatar_url` に追加権限は要りません）。

### 2. アプリをインストールする

作成しただけでは使えません。アプリの設定ページから **Install App** を開き、
**Only select repositories → arayaryoma/araya.dev** を選んでインストールします。

インストールを忘れると、記事一覧が「インストールされていません」という表示になります
（空の一覧と区別がつくようにしてあります）。

### 3. シークレットを登録する

アプリの設定ページで client secret を生成し（表示は 1 回きりです）、client id と
あわせて登録します。

```sh
cd editor.araya.dev
pnpm install

pnpm exec wrangler secret put GITHUB_CLIENT_ID
pnpm exec wrangler secret put GITHUB_CLIENT_SECRET
openssl rand -base64 32 | pnpm exec wrangler secret put SESSION_SECRET
```

`SESSION_SECRET` は 32 文字以上が必須です（短いと起動時に 500 で弾かれます）。

### 4. デプロイする

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
cp .dev.vars.example .dev.vars   # GitHub App の client id / secret を入れる
pnpm dev                         # http://localhost:8787
pnpm check                       # 型検査（Worker / クライアント / テスト）
pnpm test                        # node:test
```

ローカルでログインまで試すには、本番と同じ GitHub App の Callback URL に
`http://localhost:8787/auth/callback` を足しておきます（10 個まで登録できます）。

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
