import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  assertImageGroup,
  assertNewFilename,
  assertReadableFilename,
  buildFilename,
  dateFromFilename,
  imageExtension,
  parsePost,
  sanitizeImageName,
  serializePost,
  slugFromFilename,
} from "../src/posts";

const CONTENT_DIR = new URL(
  "../../blog.araya.dev/src/content/blog",
  import.meta.url,
).pathname;

const posts = readdirSync(CONTENT_DIR).filter((name) => /\.mdx?$/.test(name));

test("the corpus is actually being read", () => {
  assert.ok(
    posts.length > 20,
    `expected the blog's posts, found ${posts.length}`,
  );
});

test("every existing post survives a parse/serialize round trip", () => {
  for (const name of posts) {
    const source = readFileSync(join(CONTENT_DIR, name), "utf8");
    const once = parsePost(source);
    const twice = parsePost(serializePost(once, once.entries));
    assert.deepEqual(
      twice.frontmatter,
      once.frontmatter,
      `frontmatter changed for ${name}`,
    );
    assert.equal(
      twice.body.trimEnd(),
      once.body.trimEnd(),
      `body changed for ${name}`,
    );
  }
});

test("re-saving an untouched post changes nothing but trailing whitespace", () => {
  const noisy: string[] = [];
  for (const name of posts) {
    const source = readFileSync(join(CONTENT_DIR, name), "utf8");
    const parsed = parsePost(source);
    const rewritten = serializePost(parsed, parsed.entries);
    if (rewritten !== source.replace(/\s*$/, "\n")) noisy.push(name);
  }
  // This is the blast radius of opening a post and pressing save: the posts
  // disagree about key order and quoting, and none of that should be rewritten
  // under an author who only fixed a typo in the body.
  assert.deepEqual(
    noisy,
    [],
    `these posts would be reformatted: ${noisy.join(", ")}`,
  );
});

test("only the keys that changed are rewritten", () => {
  const source = [
    "---",
    'title: "JavaScript の NaN について"',
    'date: "2017-12-15"',
    "tags:",
    "  - JavaScript",
    "---",
    "",
    "本文",
    "",
  ].join("\n");
  const parsed = parsePost(source);
  const rewritten = serializePost(
    { frontmatter: { ...parsed.frontmatter, draft: true }, body: "新しい本文" },
    parsed.entries,
  );
  assert.equal(
    rewritten,
    [
      "---",
      // Still quoted, still before `tags`, because neither one was edited.
      'title: "JavaScript の NaN について"',
      'date: "2017-12-15"',
      "tags:",
      "  - JavaScript",
      "draft: true",
      "---",
      "",
      "新しい本文",
      "",
    ].join("\n"),
  );
});

test("an edited key is rewritten in the editor's own style", () => {
  const parsed = parsePost(
    ["---", 'title: "old"', 'date: "2017-12-15"', "---", "", "x", ""].join(
      "\n",
    ),
  );
  const rewritten = serializePost(
    { frontmatter: { ...parsed.frontmatter, title: "new" }, body: "x" },
    parsed.entries,
  );
  assert.ok(rewritten.includes("title: new"));
  assert.ok(rewritten.includes('date: "2017-12-15"'));
});

test("frontmatter is written in the blog's own style", () => {
  const source = serializePost({
    frontmatter: {
      title: "2023年現在package.jsonに何を書くか",
      tags: ["Node.js", "package.json"],
      date: "2023-10-01",
      description: "まとめ",
      draft: true,
    },
    body: "## Intro\n\n本文\n",
  });
  assert.equal(
    source,
    [
      "---",
      "title: 2023年現在package.jsonに何を書くか",
      "tags:",
      "  - Node.js",
      "  - package.json",
      'date: "2023-10-01"',
      "description: まとめ",
      "draft: true",
      "---",
      "",
      "## Intro",
      "",
      "本文",
      "",
    ].join("\n"),
  );
});

test("values that would break a plain scalar get quoted", () => {
  const { frontmatter } = parsePost(
    serializePost({
      frontmatter: {
        title: "HTTP/2: the sequel",
        description: "- leading dash",
        thumbnail: "yes",
      },
      body: "",
    }),
  );
  assert.equal(frontmatter.title, "HTTP/2: the sequel");
  assert.equal(frontmatter.description, "- leading dash");
  // Unquoted, YAML 1.1 readers turn `yes` into a boolean.
  assert.equal(frontmatter.thumbnail, "yes");
});

test("publishing removes only the draft line", () => {
  // The real shape of a draft post in this blog.
  const source = [
    "---",
    "title: http advent calendar day 5",
    "tags:",
    'date: "2025-12-05"',
    'description: ""',
    "draft: true",
    "---",
    "",
    "本文",
    "",
  ].join("\n");
  const parsed = parsePost(source);

  const published = serializePost(
    { frontmatter: { ...parsed.frontmatter, draft: false }, body: parsed.body },
    parsed.entries,
  );
  assert.equal(
    published,
    [
      "---",
      "title: http advent calendar day 5",
      // Still an empty `tags:` and a quoted empty description: publishing must
      // not drag the rest of the frontmatter through a reformat.
      "tags:",
      'date: "2025-12-05"',
      'description: ""',
      "---",
      "",
      "本文",
      "",
    ].join("\n"),
  );
});

test("a published post can be put back into draft", () => {
  const parsed = parsePost(
    ["---", "title: t", 'date: "2025-12-05"', "---", "", "本文", ""].join("\n"),
  );
  const drafted = serializePost(
    { frontmatter: { ...parsed.frontmatter, draft: true }, body: parsed.body },
    parsed.entries,
  );
  assert.ok(drafted.includes("draft: true"));
  // Appended after the keys the file already had, not inserted among them.
  assert.ok(drafted.indexOf("draft: true") > drafted.indexOf("date:"));
});

test("draft: false is omitted rather than written out", () => {
  const source = serializePost({
    frontmatter: { title: "t", draft: false },
    body: "x",
  });
  assert.ok(!source.includes("draft"));
});

test("unknown frontmatter keys are preserved", () => {
  const source = serializePost({
    frontmatter: { title: "t", canonical: "https://example.com" },
    body: "x",
  });
  assert.ok(source.includes("canonical: https://example.com"));
});

test("a post without frontmatter is treated as all body", () => {
  const { frontmatter, body } = parsePost("# hello\n");
  assert.equal(frontmatter.title, "");
  assert.equal(body, "# hello\n");
});

test("filenames map to the Astro collection id", () => {
  assert.equal(
    slugFromFilename("2025-09-10-hyper-http-status-parsing.md"),
    "2025-09-10-hyper-http-status-parsing",
  );
  assert.equal(
    slugFromFilename("2026-08-24-color-study.mdx"),
    "2026-08-24-color-study",
  );
  assert.equal(dateFromFilename("2025-09-10-a.md"), "2025-09-10");
  assert.equal(dateFromFilename("no-date.md"), null);
});

test("path traversal is rejected everywhere a name reaches a URL", () => {
  for (const bad of [
    "../../../etc/passwd",
    "../secrets.md",
    "a/b.md",
    ".hidden.md",
    "post.txt",
    "",
  ]) {
    assert.throws(() => assertReadableFilename(bad), `accepted ${bad}`);
  }
  assert.equal(assertReadableFilename("2025-09-10-a.md"), "2025-09-10-a.md");

  for (const bad of ["../x", "a/b", "", "."]) {
    assert.throws(() => assertImageGroup(bad), `accepted ${bad}`);
  }
  assert.equal(assertImageGroup("2025-09-10-a"), "2025-09-10-a");
});

test("new posts must be named YYYY-MM-DD-slug", () => {
  assert.equal(
    buildFilename("2026-09-21", "editor", "md"),
    "2026-09-21-editor.md",
  );
  assert.throws(() => assertNewFilename("editor.md"));
  assert.throws(() => buildFilename("2026-09-21", "エディタ", "md"));
});

test("uploaded image names are normalized, and only images are accepted", () => {
  assert.equal(sanitizeImageName("IMG_0421.HEIC", "webp"), "img-0421.webp");
  assert.equal(sanitizeImageName("スクリーンショット.png", "png"), "image.png");
  assert.equal(sanitizeImageName("a  b--c.jpeg", "jpg"), "a-b-c.jpg");

  assert.equal(imageExtension("image/png"), "png");
  assert.equal(imageExtension("image/jpeg; charset=binary"), "jpg");
  assert.equal(imageExtension("text/html"), null);
  assert.equal(imageExtension(""), null);
});
