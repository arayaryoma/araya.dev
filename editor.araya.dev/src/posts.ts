import { isMap, parseDocument, stringify as stringifyYaml } from "yaml";
import { badRequest } from "./http";

/**
 * Frontmatter handling.
 *
 * The schema is blog.araya.dev/src/content.config.ts. The posts written over
 * nine years do not agree on key order or on which scalars are quoted, and the
 * blog renders each post's commit history as its 変更履歴, so a save that
 * reformats frontmatter the author did not touch is noise in a place people
 * read. `parsePost` therefore keeps the source text of every frontmatter entry,
 * and `serializePost` re-emits an unchanged entry verbatim; only keys whose
 * value actually changed are rewritten, in the style the newer posts use.
 */

export interface Frontmatter {
  title: string;
  tags?: string[] | null;
  date?: string;
  description?: string;
  draft?: boolean;
  thumbnail?: string;
  /** Any key the schema does not name, preserved verbatim on save. */
  [key: string]: unknown;
}

const KNOWN_KEYS = [
  "title",
  "tags",
  "date",
  "description",
  "draft",
  "thumbnail",
] as const;

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

/** One top-level frontmatter key, with the exact text it was written as. */
export interface FrontmatterEntry {
  key: string;
  value: unknown;
  /** The source lines for this key, without the trailing newline. */
  raw: string;
}

export interface ParsedPost {
  frontmatter: Frontmatter;
  body: string;
  entries: FrontmatterEntry[];
}

export function parsePost(source: string): ParsedPost {
  const match = FRONTMATTER.exec(source);
  if (match === null) {
    return { frontmatter: { title: "" }, body: source, entries: [] };
  }
  const yamlText = match[1];
  const document = parseDocument(yamlText);
  const parsed = document.toJS() as unknown;
  const frontmatter: Frontmatter =
    parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Frontmatter)
      : { title: "" };
  if (typeof frontmatter.title !== "string") frontmatter.title = "";
  return {
    frontmatter,
    body: source.slice(match[0].length),
    entries: readEntries(document, yamlText),
  };
}

/**
 * Slice the frontmatter into one raw chunk per key. Each entry runs from its
 * own key to the start of the next one, which keeps block sequences, folded
 * scalars and an empty value (`tags:` with nothing after it) intact without
 * having to reason about any of them.
 */
function readEntries(
  document: ReturnType<typeof parseDocument>,
  yamlText: string,
): FrontmatterEntry[] {
  const contents = document.contents;
  if (!isMap(contents)) return [];

  const starts: { key: string; value: unknown; start: number }[] = [];
  for (const item of contents.items) {
    const key = item.key as {
      value?: unknown;
      range?: [number, number, number];
    };
    if (key?.range === undefined || typeof key.value !== "string") return [];
    starts.push({
      key: key.value,
      value:
        (item.value as { toJSON?: () => unknown } | null)?.toJSON?.() ?? null,
      start: key.range[0],
    });
  }

  return starts.map((entry, index) => ({
    key: entry.key,
    value: entry.value,
    raw: yamlText
      .slice(entry.start, starts[index + 1]?.start ?? yamlText.length)
      .replace(/\s+$/, ""),
  }));
}

export function serializePost(
  post: { frontmatter: Frontmatter; body: string },
  /** The entries as the file on GitHub currently spells them, if it exists. */
  template: readonly FrontmatterEntry[] = [],
): string {
  const { frontmatter } = post;
  const lines: string[] = ["---"];
  const done = new Set<string>();

  for (const entry of template) {
    done.add(entry.key);
    if (!(entry.key in frontmatter)) continue; // the key was removed
    const value = frontmatter[entry.key];
    if (JSON.stringify(value) === JSON.stringify(entry.value)) {
      lines.push(entry.raw);
    } else {
      lines.push(...canonicalEntry(entry.key, value));
    }
  }

  for (const key of KNOWN_KEYS) {
    if (done.has(key)) continue;
    done.add(key);
    lines.push(...canonicalEntry(key, frontmatter[key]));
  }

  for (const [key, value] of Object.entries(frontmatter)) {
    if (done.has(key) || value === undefined) continue;
    lines.push(stringifyYaml({ [key]: value }, { lineWidth: 0 }).trimEnd());
  }

  lines.push("---");
  const frontmatterBlock = lines.join("\n");
  // A post can be frontmatter only (an advent-calendar placeholder, say); it
  // should not gain two blank lines every time it is saved.
  const body = post.body.replace(/^\r?\n+/, "").replace(/\s*$/, "");
  return body === ""
    ? `${frontmatterBlock}\n`
    : `${frontmatterBlock}\n\n${body}\n`;
}

/** How the editor writes a key it had to change. Empty means "omit the key". */
function canonicalEntry(key: string, value: unknown): string[] {
  switch (key) {
    case "title":
      return [`title: ${yamlScalar(typeof value === "string" ? value : "")}`];
    case "tags":
      if (value === null) return ["tags:"];
      if (!Array.isArray(value) || value.length === 0) return [];
      return ["tags:", ...value.map((tag) => `  - ${yamlScalar(String(tag))}`)];
    case "date":
      // Always quoted: an unquoted 2023-10-01 is a timestamp to some YAML
      // readers, and the collection schema wants a string.
      return typeof value === "string" && value !== ""
        ? [`date: ${JSON.stringify(value)}`]
        : [];
    case "draft":
      return value === true ? ["draft: true"] : [];
    case "description":
    case "thumbnail":
      return typeof value === "string" && value !== ""
        ? [`${key}: ${yamlScalar(value)}`]
        : [];
    default:
      return value === undefined
        ? []
        : [stringifyYaml({ [key]: value }, { lineWidth: 0 }).trimEnd()];
  }
}

/**
 * Double-quote only when a plain scalar would not round-trip. Keeping the
 * common case unquoted matches how the newer posts are written.
 */
function yamlScalar(value: string): string {
  const needsQuotes =
    value === "" ||
    /^[\s]|[\s]$/.test(value) ||
    /[:#]\s|^[-?:,[\]{}#&*!|>'"%@`]|\s#|[\n\r\t]|:$/.test(value) ||
    /^(true|false|null|yes|no|on|off|~)$/i.test(value) ||
    /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(value);
  return needsQuotes ? JSON.stringify(value) : value;
}

/** `2025-09-10-hyper-http-status-parsing.md` -> the Astro collection id. */
export function slugFromFilename(filename: string): string {
  return filename.replace(/\.mdx?$/, "");
}

export function dateFromFilename(filename: string): string | null {
  const match = /^(\d{4}-\d{2}-\d{2})-/.exec(filename);
  return match === null ? match : match[1];
}

const READABLE_FILENAME = /^[A-Za-z0-9][A-Za-z0-9._-]*\.mdx?$/;

/** Guards the path segment before it is pasted into a GitHub API URL. */
export function assertReadableFilename(filename: string): string {
  if (!READABLE_FILENAME.test(filename) || filename.includes("..")) {
    throw badRequest(`不正なファイル名です: ${filename}`);
  }
  return filename;
}

const NEW_FILENAME = /^\d{4}-\d{2}-\d{2}-[A-Za-z0-9][A-Za-z0-9._-]*\.mdx?$/;

export function assertNewFilename(filename: string): string {
  assertReadableFilename(filename);
  if (!NEW_FILENAME.test(filename)) {
    throw badRequest(
      "新規記事のファイル名は YYYY-MM-DD-slug.md の形式にしてください",
    );
  }
  return filename;
}

export function buildFilename(
  date: string,
  slug: string,
  extension: "md" | "mdx",
): string {
  return assertNewFilename(`${date}-${slug}.${extension}`);
}

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

export function imageExtension(contentType: string): string | null {
  return (
    IMAGE_EXTENSIONS[contentType.split(";")[0].trim().toLowerCase()] ?? null
  );
}

/**
 * Normalize an uploaded filename into something safe to commit. Mobile cameras
 * hand over names like `IMG_0421.HEIC` or a bare `image.jpg` for every shot, so
 * the caller is expected to disambiguate collisions.
 */
export function sanitizeImageName(name: string, extension: string): string {
  const base = name
    .replace(/\.[^.]*$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${base === "" ? "image" : base}.${extension}`;
}

/** Image directories are grouped per post, keyed by the post's slug. */
export function assertImageGroup(group: string): string {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(group) || group.includes("..")) {
    throw badRequest(`不正な画像ディレクトリ名です: ${group}`);
  }
  return group;
}
