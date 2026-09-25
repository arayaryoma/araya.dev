import { bytesToBase64, encodeUtf8ToBase64 } from "./encoding";
import { repoConfig, type Env } from "./env";
import { GitHubClient } from "./github";
import { assertSameOrigin, badRequest, HttpError, json } from "./http";
import {
  assertImageGroup,
  assertNewFilename,
  assertReadableFilename,
  dateFromFilename,
  imageExtension,
  parsePost,
  sanitizeImageName,
  serializePost,
  slugFromFilename,
  type Frontmatter,
} from "./posts";
import type { Session } from "./session";

/** Refuse anything large enough to make the repository unpleasant to clone. */
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function handleApi(
  request: Request,
  env: Env,
  session: Session,
  path: string,
): Promise<Response> {
  const repo = repoConfig(env);
  const github = new GitHubClient(session.token, repo);

  if (path === "/api/session" && request.method === "GET") {
    return json({
      login: session.login,
      name: session.name,
      avatarUrl: session.avatarUrl,
      repo: { owner: repo.owner, name: repo.repo, branch: repo.branch },
      repoAccessible: await github.repoAccessible(),
      blogOrigin: env.BLOG_ORIGIN,
      imageUrlPrefix: repo.imageUrlPrefix,
    });
  }

  if (path === "/api/posts" && request.method === "GET") {
    const entries = await github.listDirectory(repo.contentDir);
    const posts = entries
      .filter((entry) => entry.type === "file" && /\.mdx?$/.test(entry.name))
      .map((entry) => ({
        filename: entry.name,
        slug: slugFromFilename(entry.name),
        date: dateFromFilename(entry.name),
        path: entry.path,
        sha: entry.sha,
      }))
      // Filenames start with the date, so this is newest-first.
      .sort((a, b) => b.filename.localeCompare(a.filename));
    return json({ posts });
  }

  const postMatch = /^\/api\/posts\/([^/]+)$/.exec(path);
  if (postMatch !== null) {
    const filename = decodeURIComponent(postMatch[1]);
    if (request.method === "GET")
      return getPost(github, repo.contentDir, filename);
    if (request.method === "PUT") {
      assertSameOrigin(request);
      return putPost(request, github, repo.contentDir, filename);
    }
    if (request.method === "DELETE") {
      assertSameOrigin(request);
      return deletePost(request, github, repo.contentDir, filename);
    }
    throw new HttpError(405, "method not allowed");
  }

  if (path === "/api/images" && request.method === "POST") {
    assertSameOrigin(request);
    return uploadImage(request, github, repo.imageDir, repo.imageUrlPrefix);
  }

  throw new HttpError(404, "not found");
}

async function getPost(
  github: GitHubClient,
  contentDir: string,
  filename: string,
): Promise<Response> {
  assertReadableFilename(filename);
  const file = await github.readFile(`${contentDir}/${filename}`);
  if (file === null) throw new HttpError(404, `${filename} が見つかりません`);
  const { frontmatter, body } = parsePost(file.text);
  return json({
    filename,
    slug: slugFromFilename(filename),
    path: file.path,
    sha: file.sha,
    frontmatter,
    body,
  });
}

interface SavePostBody {
  frontmatter?: Frontmatter;
  body?: string;
  /** Blob sha of the version being replaced; omitted when creating. */
  sha?: string | null;
  message?: string;
}

async function putPost(
  request: Request,
  github: GitHubClient,
  contentDir: string,
  filename: string,
): Promise<Response> {
  const payload = (await request
    .json()
    .catch(() => null)) as SavePostBody | null;
  if (payload === null) throw badRequest("JSON ボディが必要です");

  const frontmatter = payload.frontmatter;
  if (
    frontmatter === undefined ||
    typeof frontmatter !== "object" ||
    typeof frontmatter.title !== "string"
  ) {
    throw badRequest("frontmatter.title は必須です");
  }
  if (frontmatter.title.trim() === "")
    throw badRequest("タイトルを入力してください");
  if (typeof payload.body !== "string") throw badRequest("body は必須です");

  const isNew = payload.sha === undefined || payload.sha === null;
  if (isNew) {
    assertNewFilename(filename);
  } else {
    assertReadableFilename(filename);
  }

  const path = `${contentDir}/${filename}`;
  const existing = await github.readFile(path);
  if (isNew && existing !== null) {
    throw new HttpError(409, `${filename} は既に存在します`);
  }
  if (!isNew && existing === null) {
    throw new HttpError(404, `${filename} が見つかりません`);
  }

  // Re-emit untouched frontmatter exactly as the file already spells it, so the
  // commit shows the edit rather than a reformat. See src/posts.ts.
  const template = existing === null ? [] : parsePost(existing.text).entries;
  const source = serializePost({ frontmatter, body: payload.body }, template);
  const message =
    payload.message?.trim() ||
    `${isNew ? "Add" : "Update"} post: ${frontmatter.title}`;

  const result = await github.putFile({
    path,
    contentBase64: encodeUtf8ToBase64(source),
    message,
    ...(isNew ? {} : { sha: payload.sha as string }),
  });
  return json({
    filename,
    slug: slugFromFilename(filename),
    path: result.path,
    sha: result.sha,
    commitSha: result.commitSha,
    commitUrl: result.commitUrl,
  });
}

/**
 * Delete a post.
 *
 * Only the markdown file goes. Images under IMAGE_DIR are left alone: the
 * contents API deletes one file per commit, and an image that turns out to be
 * referenced by another post is a far worse outcome than a few orphaned
 * kilobytes. Nothing is really lost either way -- the file stays in the git
 * history and can be restored from it.
 */
async function deletePost(
  request: Request,
  github: GitHubClient,
  contentDir: string,
  filename: string,
): Promise<Response> {
  assertReadableFilename(filename);

  const sha = new URL(request.url).searchParams.get("sha");
  if (sha === null || sha === "") {
    // Required, so that a delete built from a stale post list cannot remove an
    // edit made since that list was fetched.
    throw badRequest("sha が必要です");
  }

  const result = await github.deleteFile({
    path: `${contentDir}/${filename}`,
    message: `Delete post: ${slugFromFilename(filename)}`,
    sha,
  });
  return json({
    filename,
    path: result.path,
    commitSha: result.commitSha,
    commitUrl: result.commitUrl,
  });
}

async function uploadImage(
  request: Request,
  github: GitHubClient,
  imageDir: string,
  imageUrlPrefix: string,
): Promise<Response> {
  const form = await request.formData().catch(() => null);
  if (form === null) throw badRequest("multipart/form-data が必要です");

  const file = form.get("file");
  if (!(file instanceof File)) throw badRequest("file フィールドが必要です");
  if (file.size === 0) throw badRequest("空のファイルです");
  if (file.size > MAX_IMAGE_BYTES) {
    throw badRequest(
      `画像は ${Math.floor(MAX_IMAGE_BYTES / 1024 / 1024)}MB 以下にしてください`,
    );
  }

  const extension = imageExtension(file.type);
  if (extension === null) {
    throw badRequest(`対応していない画像形式です: ${file.type || "unknown"}`);
  }

  const group = assertImageGroup(String(form.get("group") ?? "").trim());
  const name = sanitizeImageName(file.name, extension);
  const bytes = new Uint8Array(await file.arrayBuffer());

  // Never overwrite: a phone hands over the same `image.jpg` for every shot, so
  // collisions are the norm rather than the exception.
  const path = await uniquePath(github, `${imageDir}/${group}`, name);
  const result = await github.putFile({
    path,
    contentBase64: bytesToBase64(bytes),
    message: `Add image: ${path.slice(imageDir.length + 1)}`,
  });

  const url = `${imageUrlPrefix}/${path.slice(imageDir.length + 1)}`;
  return json({
    path: result.path,
    url,
    commitSha: result.commitSha,
    commitUrl: result.commitUrl,
  });
}

async function uniquePath(
  github: GitHubClient,
  directory: string,
  name: string,
): Promise<string> {
  const existing = new Set(
    (await github.listDirectory(directory)).map((entry) => entry.name),
  );
  if (!existing.has(name)) return `${directory}/${name}`;

  const dot = name.lastIndexOf(".");
  const base = name.slice(0, dot);
  const extension = name.slice(dot);
  for (let i = 2; i < 1000; i++) {
    const candidate = `${base}-${i}${extension}`;
    if (!existing.has(candidate)) return `${directory}/${candidate}`;
  }
  throw new HttpError(409, "同名の画像が多すぎます");
}
