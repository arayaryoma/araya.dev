/** Typed wrappers over the Worker's /api endpoints. */

export interface SessionInfo {
  login: string;
  name: string;
  avatarUrl: string;
  repo: { owner: string; name: string; branch: string };
  /** False when the GitHub App has not been installed on the repository. */
  repoAccessible: boolean;
  blogOrigin: string;
  imageUrlPrefix: string;
}

export interface PostSummary {
  filename: string;
  slug: string;
  date: string | null;
  path: string;
  sha: string;
}

export interface Frontmatter {
  title: string;
  tags?: string[] | null;
  date?: string;
  description?: string;
  draft?: boolean;
  thumbnail?: string;
  [key: string]: unknown;
}

export interface PostDetail {
  filename: string;
  slug: string;
  path: string;
  sha: string;
  frontmatter: Frontmatter;
  body: string;
}

export interface SaveResult {
  filename: string;
  slug: string;
  path: string;
  sha: string;
  commitSha: string;
  commitUrl: string;
}

export interface UploadResult {
  path: string;
  url: string;
  commitSha: string;
  commitUrl: string;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: "same-origin",
    headers: { accept: "application/json", ...(init.headers ?? {}) },
  });
  if (response.status === 401) {
    // The session expired mid-edit. Anything unsaved is in localStorage.
    location.assign("/login");
    throw new ApiError(401, "ログインし直してください");
  }
  const body = (await response.json().catch(() => null)) as
    | (T & { error?: string })
    | null;
  if (!response.ok) {
    throw new ApiError(
      response.status,
      body?.error ?? `リクエストに失敗しました (${response.status})`,
    );
  }
  return body as T;
}

export const api = {
  session: () => request<SessionInfo>("/api/session"),

  listPosts: () => request<{ posts: PostSummary[] }>("/api/posts"),

  getPost: (filename: string) =>
    request<PostDetail>(`/api/posts/${encodeURIComponent(filename)}`),

  savePost: (
    filename: string,
    payload: { frontmatter: Frontmatter; body: string; sha: string | null },
  ) =>
    request<SaveResult>(`/api/posts/${encodeURIComponent(filename)}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),

  uploadImage: (group: string, file: File) => {
    const form = new FormData();
    form.set("group", group);
    form.set("file", file, file.name);
    return request<UploadResult>("/api/images", { method: "POST", body: form });
  },
};
