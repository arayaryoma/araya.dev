import { securityHeaders } from "./http";

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char] as string,
  );
}

function document(title: string, body: string): string {
  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, viewport-fit=cover"
    />
    <meta name="color-scheme" content="light dark" />
    <meta name="robots" content="noindex, nofollow" />
    <title>${escapeHtml(title)}</title>
    <link rel="stylesheet" href="/app.css" />
    <!-- Sync, and before the stylesheet paints, so the stored scheme does not flash. -->
    <script src="/theme.js"></script>
  </head>
  <body>
${body}
  </body>
</html>
`;
}

export function loginPage(blogOrigin: string, error?: string): Response {
  const banner =
    error === undefined
      ? ""
      : `        <p class="login__error" role="alert">${escapeHtml(error)}</p>\n`;
  const html = document(
    "ログイン - araya's reservoir editor",
    `    <main class="login">
      <h1 class="login__title">araya's reservoir</h1>
      <p class="login__lead">記事エディタ</p>
${banner}      <a class="button button--primary login__button" href="/auth/github"
        >GitHub でログイン</a
      >
    </main>`,
  );
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      ...securityHeaders(blogOrigin),
    },
  });
}

export function appPage(blogOrigin: string): Response {
  const html = document(
    "記事エディタ - araya's reservoir",
    `    <header class="appbar">
      <button class="appbar__back" type="button" data-action="back" hidden>
        <span aria-hidden="true">←</span> 一覧
      </button>
      <h1 class="appbar__title" data-role="app-title">記事</h1>
      <div class="appbar__actions">
        <button class="icon-button" type="button" data-action="toggle-scheme" title="配色を切り替え">
          <span aria-hidden="true">◐</span><span class="visually-hidden">配色を切り替え</span>
        </button>
        <form method="post" action="/auth/logout" class="appbar__logout">
          <button class="icon-button" type="submit" title="ログアウト">
            <span aria-hidden="true">⏻</span><span class="visually-hidden">ログアウト</span>
          </button>
        </form>
      </div>
    </header>

    <main class="app">
      <section class="view view--list" data-view="list">
        <div class="list__header">
          <p class="list__account" data-role="account"></p>
          <button class="button button--primary" type="button" data-action="new">
            新規作成
          </button>
        </div>
        <ul class="post-list" data-role="post-list"></ul>
        <p class="empty" data-role="list-status">読み込み中…</p>
      </section>

      <section class="view view--edit" data-view="edit" hidden>
        <details class="meta" data-role="meta">
          <summary class="meta__summary">記事の設定</summary>
          <div class="meta__fields">
            <label class="field">
              <span class="field__label">タイトル</span>
              <input class="field__input" type="text" data-field="title" autocomplete="off" />
            </label>
            <label class="field">
              <span class="field__label">日付</span>
              <input class="field__input" type="date" data-field="date" />
            </label>
            <label class="field" data-role="slug-field">
              <span class="field__label">スラッグ（URL・半角英数）</span>
              <input
                class="field__input"
                type="text"
                data-field="slug"
                inputmode="url"
                autocapitalize="off"
                autocorrect="off"
                spellcheck="false"
              />
              <span class="field__hint" data-role="filename-hint"></span>
            </label>
            <label class="field">
              <span class="field__label">タグ（カンマ区切り）</span>
              <input class="field__input" type="text" data-field="tags" autocomplete="off" />
            </label>
            <label class="field">
              <span class="field__label">説明</span>
              <textarea class="field__input field__input--area" rows="3" data-field="description"></textarea>
            </label>
            <label class="field">
              <span class="field__label">サムネイル</span>
              <input class="field__input" type="text" data-field="thumbnail" autocomplete="off" />
            </label>
            <label class="field field--checkbox">
              <input type="checkbox" data-field="draft" />
              <span>下書き（draft: true のあいだは公開されません）</span>
            </label>
          </div>
        </details>

        <div class="toolbar" role="toolbar" aria-label="Markdown">
          <button class="toolbar__button" type="button" data-md="heading" title="見出し">H2</button>
          <button class="toolbar__button" type="button" data-md="bold" title="太字"><strong>B</strong></button>
          <button class="toolbar__button" type="button" data-md="italic" title="斜体"><em>I</em></button>
          <button class="toolbar__button" type="button" data-md="link" title="リンク">🔗</button>
          <button class="toolbar__button" type="button" data-md="code" title="コード">&lt;/&gt;</button>
          <button class="toolbar__button" type="button" data-md="quote" title="引用">❝</button>
          <button class="toolbar__button" type="button" data-md="list" title="箇条書き">•</button>
          <button class="toolbar__button" type="button" data-action="upload" title="画像を追加">🖼</button>
          <input class="visually-hidden" type="file" accept="image/*" data-role="file" />
        </div>

        <div class="panes" data-role="panes" data-pane="write">
          <div class="tabs" role="tablist">
            <button class="tabs__tab" type="button" role="tab" data-pane-target="write" aria-selected="true">編集</button>
            <button class="tabs__tab" type="button" role="tab" data-pane-target="preview" aria-selected="false">プレビュー</button>
          </div>
          <div class="pane pane--write">
            <textarea
              class="editor"
              data-role="editor"
              spellcheck="false"
              autocapitalize="off"
              autocorrect="off"
              placeholder="Markdown で書く"
            ></textarea>
          </div>
          <div class="pane pane--preview">
            <div class="markdown preview" data-role="preview"></div>
          </div>
        </div>

        <div class="statusbar">
          <p class="statusbar__message" data-role="status" aria-live="polite"></p>
          <button class="button button--primary" type="button" data-action="save">保存</button>
        </div>
      </section>
    </main>

    <script src="/app.js" type="module"></script>`,
  );
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      ...securityHeaders(blogOrigin),
    },
  });
}
