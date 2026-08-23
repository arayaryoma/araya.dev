# Madoka Light — Keynote テーマ作成手順

blog.araya.dev のライトモード配色（`src/styles/main.css` の Madoka パレット）を
Keynote テーマ `.kth` として作る手順。

## なぜ手作業なのか

Keynote の AppleScript/JXA API には**色を設定するプロパティが一切ない**。
`shape` の全プロパティは以下のみ:

```
opacity, parent, pcls, reflectionShowing, backgroundFillType,
position, objectText, width, rotation, reflectionValue, height, locked
```

`backgroundFillType` すら読み取り専用（`set` すると
`Can't set that. Access not allowed.`）。`theme` クラスも `id` / `name` の
read-only のみで、`export` コマンドの対象は PDF / PPTX / 動画 / 画像だけ。
したがって配色適用と `.kth` 書き出しは GUI でしか行えない。

## 配色表

`palette.html` をブラウザで開くと現物のスウォッチが見られる（HEX はクリックで全選択）。

| 役割             | HEX      | RGB           | CSS token               |
| ---------------- | -------- | ------------- | ----------------------- |
| スライド背景     | `FAF8EB` | 250, 248, 235 | `--color-bg`            |
| カード面         | `FFFDF6` | 255, 253, 246 | `--color-surface`       |
| 本文テキスト     | `362A2E` | 54, 42, 46    | `--color-text`          |
| 補足テキスト     | `7D5F68` | 125, 95, 104  | `--color-text-muted`    |
| 見出し・強調     | `B23E4E` | 178, 62, 78   | `--color-accent`        |
| リンク           | `8F2F3D` | 143, 47, 61   | `--color-accent-strong` |
| 罫線             | `DAB0BD` | 218, 176, 189 | `--color-border`        |
| 帯・アクセント面 | `E7A3AA` | 231, 163, 170 | `--global-nav-bg`       |
| コード背景       | `F9DADF` | 249, 218, 223 | `--madoka-pale-pink`    |

## 手順

### 1. マスタースライドを開く

Keynote で対象ファイルを開き、メニューから
**表示 → マスタースライドを編集** を選ぶ。左に 15 レイアウトが並ぶ。

### 2. 各レイアウトの背景を塗る

レイアウトを選択 → 右パネル **フォーマット → 背景** → **カラー塗りつぶし**。
カラーウェルをクリック → カラーピッカーの**スライダ**タブ →
ポップアップで **RGB スライダ** を選び、下部の **16進数カラー▸** に
`FAF8EB` を入力。

> 16進入力欄が見当たらない場合は、カラーピッカーを縦に広げると現れる。

全 15 レイアウトに同じ背景色を適用する。「Blank」も忘れずに。

### 3. テキストスタイルを設定

各レイアウトのプレースホルダを選び、右パネル **テキスト** で色を指定する。

- タイトル → `B23E4E`
- 本文・箇条書き → `362A2E`
- サブタイトル / キャプション → `7D5F68`
- 「Statement」「Big Fact」「Quote」の大字 → `8F2F3D`

### 4. 罫線・図形のデフォルト

区切り線や図形の枠線は `DAB0BD`、図形の塗りは `FFFDF6`、
強調したい面は `E7A3AA` を使う。

### 5. テーマとして保存

**表示 → マスタースライドを編集を終了** で通常表示に戻り、
**ファイル → テーマを保存…**。

- **テーマセレクタに追加** を選ぶと下記に入る（Keynote 起動時に選択可能になる）:
  `~/Library/Containers/com.apple.iWork.Keynote/Data/Library/Application Support/User Templates/`
- ファイルとして書き出す場合は保存先を指定して `.kth` を作る。

推奨テーマ名: `Madoka Light`

### 6. 確認

Keynote を再起動し、新規ドキュメント作成時のテーマセレクタに
`Madoka Light` が出れば成功。

## コントラスト

全ペアが WCAG AA（本文サイズ 4.5:1）を満たす。スライドは大きな文字で
表示されるため余裕がある。

| 組み合わせ      | 比率    |
| --------------- | ------- |
| 本文 / 背景     | 12.89:1 |
| 補足 / 背景     | 5.31:1  |
| 強調 / 背景     | 5.33:1  |
| リンク / 背景   | 7.45:1  |
| 本文 / カード面 | 13.51:1 |
| 本文 / ピンク帯 | 6.69:1  |
| 白 / 強調面     | 5.69:1  |

## 元ファイルについて

`src/assets/color_sutdy_20260824.key` は 1 スライドのみで中身は空
（シェイプ 1 + テキスト 5、すべて空文字）。テーマ「Basic White」。
バックアップはセッションの scratchpad に取得済み。
