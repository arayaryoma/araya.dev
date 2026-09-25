import {
  api,
  ApiError,
  type Frontmatter,
  type PostSummary,
  type SessionInfo,
} from "./api";
import { fromDateInput, toDateInput } from "./date";
import { prepareImage } from "./image";
import { renderMarkdown } from "./markdown";
import { applyCommand, insertAtCursor, type Command } from "./toolbar";

function element<T extends HTMLElement>(selector: string): T {
  const node = document.querySelector<T>(selector);
  if (node === null) throw new Error(`missing element: ${selector}`);
  return node;
}

const listView = element("[data-view='list']");
const editView = element("[data-view='edit']");
const postList = element<HTMLUListElement>("[data-role='post-list']");
const listStatus = element("[data-role='list-status']");
const accountLine = element("[data-role='account']");
const appTitle = element("[data-role='app-title']");
const backButton = element<HTMLButtonElement>("[data-action='back']");
const editor = element<HTMLTextAreaElement>("[data-role='editor']");
const preview = element("[data-role='preview']");
const panes = element("[data-role='panes']");
const statusLine = element("[data-role='status']");
const metaDetails = element<HTMLDetailsElement>("[data-role='meta']");
const slugField = element("[data-role='slug-field']");
const filenameHint = element("[data-role='filename-hint']");
const fileInput = element<HTMLInputElement>("[data-role='file']");
const publishButton = element<HTMLButtonElement>("[data-action='publish']");
const deleteButton = element<HTMLButtonElement>("[data-action='delete']");
const dangerZone = element("[data-role='danger-zone']");

const fields = {
  title: element<HTMLInputElement>("[data-field='title']"),
  date: element<HTMLInputElement>("[data-field='date']"),
  slug: element<HTMLInputElement>("[data-field='slug']"),
  tags: element<HTMLInputElement>("[data-field='tags']"),
  description: element<HTMLTextAreaElement>("[data-field='description']"),
  thumbnail: element<HTMLInputElement>("[data-field='thumbnail']"),
  draft: element<HTMLInputElement>("[data-field='draft']"),
};

interface OpenPost {
  /** null while a new post has not been saved for the first time. */
  filename: string | null;
  sha: string | null;
  /** Frontmatter keys outside the known schema, preserved across a save. */
  extras: Record<string, unknown>;
  /** `date` exactly as the post stores it, which may carry a time. */
  originalDate: string | undefined;
  /** Snapshot of the last saved (or loaded) content, for the dirty check. */
  saved: string;
}

let session: SessionInfo | null = null;
let current: OpenPost | null = null;
/** Images committed in this session, not yet deployed to the blog. */
const localImages = new Map<string, string>();

const DRAFT_PREFIX = "editor-draft:";

/* -------------------------------------------------------------- rendering */

function setStatus(message: string, tone: "" | "error" | "ok" = ""): void {
  statusLine.textContent = message;
  statusLine.dataset.tone = tone;
}

function setStatusWithLink(message: string, href: string, label: string): void {
  statusLine.dataset.tone = "ok";
  statusLine.replaceChildren(document.createTextNode(`${message} `));
  const link = document.createElement("a");
  link.href = href;
  link.target = "_blank";
  link.rel = "noreferrer noopener";
  link.textContent = label;
  statusLine.append(link);
}

let previewTimer: number | undefined;

function schedulePreview(): void {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(renderPreview, 200);
}

function renderPreview(): void {
  if (session === null) return;
  preview.replaceChildren(
    renderMarkdown(editor.value, {
      blogOrigin: session.blogOrigin,
      localImages,
    }),
  );
}

function showList(): void {
  listView.hidden = false;
  editView.hidden = true;
  backButton.hidden = true;
  appTitle.textContent = "記事";
}

function showEdit(title: string): void {
  listView.hidden = true;
  editView.hidden = false;
  backButton.hidden = false;
  appTitle.textContent = title;
}

async function loadList(): Promise<void> {
  listStatus.hidden = false;
  listStatus.textContent = "読み込み中…";
  try {
    const { posts } = await api.listPosts();
    postList.replaceChildren(...posts.map(postListItem));
    listStatus.hidden = posts.length > 0;
    if (posts.length === 0) listStatus.textContent = "記事がありません";
  } catch (error) {
    listStatus.textContent = errorMessage(error);
  }
}

function postListItem(post: PostSummary): HTMLLIElement {
  const item = document.createElement("li");
  item.className = "post-list__item";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "post-list__button";
  button.addEventListener("click", () => void openPost(post.filename));

  const date = document.createElement("time");
  date.className = "post-list__date";
  date.textContent = post.date ?? "";

  const name = document.createElement("span");
  name.className = "post-list__name";
  name.textContent = post.slug;

  button.append(date, name);
  item.append(button);
  return item;
}

/* ------------------------------------------------------------ editor state */

function snapshot(): string {
  return JSON.stringify({ frontmatter: readFrontmatter(), body: editor.value });
}

function isDirty(): boolean {
  return current !== null && current.saved !== snapshot();
}

function readFrontmatter(): Frontmatter {
  const tags = fields.tags.value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag !== "");
  const frontmatter: Frontmatter = {
    ...(current?.extras ?? {}),
    title: fields.title.value.trim(),
  };
  if (tags.length > 0) frontmatter.tags = tags;
  const date = fromDateInput(fields.date.value, current?.originalDate);
  if (date !== undefined) frontmatter.date = date;
  const description = fields.description.value.trim();
  if (description !== "") frontmatter.description = description;
  if (fields.draft.checked) frontmatter.draft = true;
  const thumbnail = fields.thumbnail.value.trim();
  if (thumbnail !== "") frontmatter.thumbnail = thumbnail;
  return frontmatter;
}

function writeFrontmatter(frontmatter: Frontmatter): Record<string, unknown> {
  fields.title.value = frontmatter.title ?? "";
  fields.date.value = toDateInput(frontmatter.date);
  fields.tags.value = (frontmatter.tags ?? []).join(", ");
  fields.description.value = frontmatter.description ?? "";
  fields.thumbnail.value = frontmatter.thumbnail ?? "";
  fields.draft.checked = frontmatter.draft === true;

  const known = new Set([
    "title",
    "tags",
    "date",
    "description",
    "draft",
    "thumbnail",
  ]);
  return Object.fromEntries(
    Object.entries(frontmatter).filter(([key]) => !known.has(key)),
  );
}

function today(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function currentSlug(): string {
  if (current?.filename !== null && current?.filename !== undefined) {
    return current.filename.replace(/\.mdx?$/, "");
  }
  const slug = fields.slug.value.trim();
  return slug === "" ? "" : `${fields.date.value}-${slug}`;
}

function newFilename(): string {
  const slug = fields.slug.value.trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(slug)) {
    throw new Error("スラッグは半角英数字とハイフンで入力してください");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.date.value)) {
    throw new Error("日付を入力してください");
  }
  return `${fields.date.value}-${slug}.md`;
}

function updateFilenameHint(): void {
  if (current?.filename != null) {
    filenameHint.textContent = current.filename;
    return;
  }
  try {
    filenameHint.textContent = newFilename();
  } catch {
    filenameHint.textContent = "YYYY-MM-DD-slug.md";
  }
}

/* ----------------------------------------------------------- open and save */

function draftKey(filename: string | null): string {
  return `${DRAFT_PREFIX}${filename ?? "__new__"}`;
}

function saveDraft(): void {
  if (current === null) return;
  try {
    localStorage.setItem(
      draftKey(current.filename),
      JSON.stringify({
        frontmatter: readFrontmatter(),
        body: editor.value,
        slug: fields.slug.value,
        at: Date.now(),
      }),
    );
  } catch {
    // Out of quota or storage blocked. The in-memory state is still intact.
  }
}

function clearDraft(filename: string | null): void {
  try {
    localStorage.removeItem(draftKey(filename));
  } catch {
    /* nothing to clean up */
  }
}

function readDraft(
  filename: string | null,
): { frontmatter: Frontmatter; body: string; slug: string; at: number } | null {
  try {
    const raw = localStorage.getItem(draftKey(filename));
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

async function openPost(filename: string): Promise<void> {
  if (!confirmDiscard()) return;
  setStatus("読み込み中…");
  try {
    const post = await api.getPost(filename);
    const extras = writeFrontmatter(post.frontmatter);
    editor.value = post.body;
    current = {
      filename: post.filename,
      sha: post.sha,
      extras,
      originalDate: post.frontmatter.date,
      saved: "",
    };
    current.saved = snapshot();

    slugField.hidden = true;
    fields.date.disabled = true;
    metaDetails.open = false;
    restoreDraftIfNewer(post.filename);

    updateFilenameHint();
    updateDraftControls();
    renderPreview();
    setPane("write");
    showEdit(post.frontmatter.title || post.slug);
    setStatus("");
  } catch (error) {
    setStatus(errorMessage(error), "error");
  }
}

function startNewPost(): void {
  if (!confirmDiscard()) return;
  const extras = writeFrontmatter({ title: "", date: today(), draft: true });
  fields.slug.value = "";
  editor.value = "";
  current = {
    filename: null,
    sha: null,
    extras,
    originalDate: undefined,
    saved: "",
  };
  current.saved = snapshot();

  slugField.hidden = false;
  fields.date.disabled = false;
  metaDetails.open = true;
  restoreDraftIfNewer(null);

  updateFilenameHint();
  updateDraftControls();
  renderPreview();
  setPane("write");
  showEdit("新規記事");
  setStatus("下書きとして作成されます（draft: true）");
  fields.title.focus();
}

/**
 * A phone can evict the tab at any time, so every keystroke is mirrored to
 * localStorage. On reopening a post, offer whatever was left behind.
 */
function restoreDraftIfNewer(filename: string | null): void {
  const draft = readDraft(filename);
  if (draft === null || current === null) return;
  const same =
    JSON.stringify({ frontmatter: draft.frontmatter, body: draft.body }) ===
    current.saved;
  if (same) {
    clearDraft(filename);
    return;
  }
  const when = new Date(draft.at).toLocaleString("ja-JP");
  if (
    !confirm(`保存されていない編集内容があります（${when}）。復元しますか？`)
  ) {
    clearDraft(filename);
    return;
  }
  current.extras = writeFrontmatter(draft.frontmatter);
  if (filename === null) fields.slug.value = draft.slug;
  editor.value = draft.body;
}

/** Returns whether the post reached GitHub, so callers can undo their intent. */
async function save(): Promise<boolean> {
  if (current === null) return false;
  const frontmatter = readFrontmatter();
  if (frontmatter.title === "") {
    metaDetails.open = true;
    setStatus("タイトルを入力してください", "error");
    fields.title.focus();
    return false;
  }

  let filename: string;
  try {
    filename = current.filename ?? newFilename();
  } catch (error) {
    metaDetails.open = true;
    setStatus(errorMessage(error), "error");
    return false;
  }

  const saveButton = element<HTMLButtonElement>("[data-action='save']");
  saveButton.disabled = true;
  setStatus("保存中…");
  try {
    const pending = snapshot();
    const result = await api.savePost(filename, {
      frontmatter,
      body: editor.value,
      sha: current.sha,
    });
    const wasNew = current.filename === null;
    if (wasNew) clearDraft(null);
    current = {
      filename: result.filename,
      sha: result.sha,
      extras: current.extras,
      originalDate: frontmatter.date,
      saved: pending,
    };
    clearDraft(result.filename);

    slugField.hidden = true;
    fields.date.disabled = true;
    updateFilenameHint();
    updateDraftControls();
    appTitle.textContent = frontmatter.title;
    setStatusWithLink(
      "保存しました",
      result.commitUrl,
      result.commitSha.slice(0, 8),
    );
    if (wasNew) void loadList();
    return true;
  } catch (error) {
    setStatus(errorMessage(error), "error");
    return false;
  } finally {
    saveButton.disabled = false;
  }
}

/* --------------------------------------------------------- publish/delete */

/**
 * The draft checkbox lives in the collapsed settings panel, which is the wrong
 * place for the one action that puts a post on the internet. This surfaces it
 * next to 保存 whenever the open post is still a draft.
 */
function updateDraftControls(): void {
  publishButton.hidden = current === null || !fields.draft.checked;
  // Nothing to delete until the post exists on GitHub.
  dangerZone.hidden = current?.filename == null || current.sha == null;
}

async function publish(): Promise<void> {
  if (current === null) return;
  const title = fields.title.value.trim() || currentSlug() || "この記事";
  if (
    !confirm(
      `「${title}」を公開します。\n\n` +
        "draft を外して保存し、blog.araya.dev に反映されます" +
        "（デプロイ完了まで数分かかります）。",
    )
  ) {
    return;
  }

  fields.draft.checked = false;
  updateDraftControls();
  if (!(await save())) {
    // The post on GitHub is untouched, so the form must not keep claiming it
    // is published -- otherwise the next plain 保存 would publish by accident.
    fields.draft.checked = true;
    updateDraftControls();
  }
}

async function remove(): Promise<void> {
  const filename = current?.filename;
  const sha = current?.sha;
  if (filename == null || sha == null) return;

  if (
    !confirm(
      `${filename} を削除します。\n\n` +
        "・記事の Markdown だけを削除します（画像は残ります）\n" +
        "・git の履歴からは復元できます\n\n" +
        "削除しますか？",
    )
  ) {
    return;
  }

  deleteButton.disabled = true;
  setStatus("削除中…");
  try {
    const result = await api.deletePost(filename, sha);
    clearDraft(filename);
    current = null;
    setStatus("");
    showList();
    await loadList();
    setListMessage(
      `${filename} を削除しました`,
      result.commitUrl,
      result.commitSha.slice(0, 8),
    );
  } catch (error) {
    setStatus(errorMessage(error), "error");
  } finally {
    deleteButton.disabled = false;
  }
}

/** The status bar belongs to the edit view, so a delete reports on the list. */
function setListMessage(message: string, href: string, label: string): void {
  listStatus.hidden = false;
  listStatus.dataset.tone = "";
  listStatus.replaceChildren(document.createTextNode(`${message} `));
  const link = document.createElement("a");
  link.href = href;
  link.target = "_blank";
  link.rel = "noreferrer noopener";
  link.textContent = label;
  listStatus.append(link);
}

/* ------------------------------------------------------------------ images */

async function uploadImage(file: File): Promise<void> {
  const group = currentSlug();
  if (group === "") {
    metaDetails.open = true;
    setStatus("画像を追加する前に日付とスラッグを入力してください", "error");
    fields.slug.focus();
    return;
  }
  setStatus("画像をアップロード中…");
  try {
    const prepared = await prepareImage(file);
    const result = await api.uploadImage(group, prepared);
    localImages.set(result.url, URL.createObjectURL(prepared));

    const alt = "画像の説明";
    const start = editor.selectionStart;
    insertAtCursor(editor, `![${alt}](${result.url})`);
    editor.setSelectionRange(start + 2, start + 2 + alt.length);
    editor.focus();

    setStatusWithLink(
      "画像を追加しました",
      result.commitUrl,
      result.commitSha.slice(0, 8),
    );
  } catch (error) {
    setStatus(errorMessage(error), "error");
  }
}

/* ------------------------------------------------------------------- panes */

function setPane(pane: "write" | "preview"): void {
  panes.dataset.pane = pane;
  for (const tab of panes.querySelectorAll<HTMLButtonElement>(
    "[data-pane-target]",
  )) {
    tab.setAttribute("aria-selected", String(tab.dataset.paneTarget === pane));
  }
  if (pane === "preview") renderPreview();
}

/* ------------------------------------------------------------------- wiring */

function confirmDiscard(): boolean {
  if (!isDirty()) return true;
  return confirm("保存していない変更があります。破棄しますか？");
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiError || error instanceof Error) return error.message;
  return "予期しないエラーが発生しました";
}

document.addEventListener("click", (event) => {
  const trigger = (event.target as HTMLElement).closest<HTMLElement>(
    "[data-action], [data-md], [data-pane-target]",
  );
  if (trigger === null) return;

  const command = trigger.dataset.md as Command | undefined;
  if (command !== undefined) {
    applyCommand(editor, command);
    return;
  }
  const pane = trigger.dataset.paneTarget as "write" | "preview" | undefined;
  if (pane !== undefined) {
    setPane(pane);
    return;
  }

  switch (trigger.dataset.action) {
    case "new":
      startNewPost();
      break;
    case "back":
      if (confirmDiscard()) {
        current = null;
        showList();
        void loadList();
      }
      break;
    case "save":
      void save();
      break;
    case "publish":
      void publish();
      break;
    case "delete":
      void remove();
      break;
    case "upload":
      fileInput.click();
      break;
    case "toggle-scheme":
      toggleColorScheme();
      break;
  }
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  // Reset first: picking the same file twice in a row must fire change again.
  fileInput.value = "";
  if (file !== undefined) void uploadImage(file);
});

let draftTimer: number | undefined;

editor.addEventListener("input", () => {
  schedulePreview();
  clearTimeout(draftTimer);
  draftTimer = setTimeout(saveDraft, 800);
});

for (const field of Object.values(fields)) {
  field.addEventListener("input", () => {
    updateFilenameHint();
    updateDraftControls();
    clearTimeout(draftTimer);
    draftTimer = setTimeout(saveDraft, 800);
  });
}

editor.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "s") {
    event.preventDefault();
    void save();
  }
});

window.addEventListener("beforeunload", (event) => {
  if (!isDirty()) return;
  saveDraft();
  event.preventDefault();
});

function toggleColorScheme(): void {
  const root = document.documentElement;
  const stored = root.getAttribute("data-color-scheme");
  const current =
    stored ??
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";
  root.setAttribute("data-color-scheme", next);
  try {
    localStorage.setItem("preferred-color-scheme", next);
  } catch {
    /* the toggle still applies for this page load */
  }
}

async function boot(): Promise<void> {
  try {
    session = await api.session();
    accountLine.textContent = `${session.login} / ${session.repo.owner}/${session.repo.name}@${session.repo.branch}`;
    if (!session.repoAccessible) {
      showNotInstalled(session);
      return;
    }
    await loadList();
  } catch (error) {
    listStatus.textContent = errorMessage(error);
  }
}

/**
 * Authorizing the GitHub App and installing it on the repository are two
 * separate steps, and skipping the second one otherwise just looks like a blog
 * with no posts in it.
 */
function showNotInstalled(info: SessionInfo): void {
  element<HTMLButtonElement>("[data-action='new']").disabled = true;
  listStatus.hidden = false;
  listStatus.dataset.tone = "error";
  listStatus.replaceChildren(
    document.createTextNode(
      `GitHub App が ${info.repo.owner}/${info.repo.name} にインストールされていません。`,
    ),
    document.createElement("br"),
  );
  const link = document.createElement("a");
  link.href = "https://github.com/settings/installations";
  link.target = "_blank";
  link.rel = "noreferrer noopener";
  link.textContent = "インストール設定を開く";
  listStatus.append(link);
}

showList();
void boot();
