import { decodeGitHubContent } from "./encoding";
import type { RepoConfig } from "./env";
import { HttpError } from "./http";

/**
 * The slice of the GitHub REST API the editor needs.
 *
 * Everything goes through the contents API rather than the lower-level git data
 * API: one commit per file is exactly the granularity the editor works at
 * (save a post, upload an image), and it keeps the Worker small.
 */

const API = "https://api.github.com";

export interface DirectoryEntry {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: "file" | "dir" | "symlink" | "submodule";
}

export interface FileContent {
  path: string;
  sha: string;
  text: string;
}

export interface CommitResult {
  path: string;
  sha: string;
  commitSha: string;
  commitUrl: string;
}

export class GitHubClient {
  constructor(
    private readonly token: string,
    private readonly repo: RepoConfig,
  ) {}

  private async request(
    path: string,
    init: RequestInit = {},
  ): Promise<Response> {
    const response = await fetch(`${API}${path}`, {
      ...init,
      headers: {
        authorization: `Bearer ${this.token}`,
        accept: "application/vnd.github+json",
        "x-github-api-version": "2022-11-28",
        "user-agent": "editor.araya.dev",
        ...(init.headers ?? {}),
      },
    });
    if (response.status === 401 || response.status === 403) {
      throw new HttpError(response.status, await githubMessage(response));
    }
    return response;
  }

  private contentsPath(repoPath: string): string {
    const encoded = repoPath.split("/").map(encodeURIComponent).join("/");
    return `/repos/${this.repo.owner}/${this.repo.repo}/contents/${encoded}`;
  }

  async listDirectory(repoPath: string): Promise<DirectoryEntry[]> {
    const response = await this.request(
      `${this.contentsPath(repoPath)}?ref=${encodeURIComponent(this.repo.branch)}`,
    );
    if (response.status === 404) return [];
    if (!response.ok) {
      throw new HttpError(502, await githubMessage(response));
    }
    const body = await response.json();
    return Array.isArray(body) ? (body as DirectoryEntry[]) : [];
  }

  /** Returns null when the file does not exist yet. */
  async readFile(repoPath: string): Promise<FileContent | null> {
    const response = await this.request(
      `${this.contentsPath(repoPath)}?ref=${encodeURIComponent(this.repo.branch)}`,
    );
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new HttpError(502, await githubMessage(response));
    }
    const body = (await response.json()) as {
      type: string;
      sha: string;
      content?: string;
      encoding?: string;
    };
    if (body.type !== "file" || typeof body.content !== "string") {
      throw new HttpError(400, `${repoPath} is not a file`);
    }
    return {
      path: repoPath,
      sha: body.sha,
      text: decodeGitHubContent(body.content),
    };
  }

  /**
   * Create or update a file. `sha` must be the sha of the blob being replaced;
   * omitting it means "create". GitHub rejects a stale sha with 409, which is
   * what stops a save from silently clobbering an edit made elsewhere.
   */
  async putFile(options: {
    path: string;
    contentBase64: string;
    message: string;
    sha?: string;
  }): Promise<CommitResult> {
    const response = await this.request(this.contentsPath(options.path), {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message: options.message,
        content: options.contentBase64,
        branch: this.repo.branch,
        ...(options.sha === undefined ? {} : { sha: options.sha }),
      }),
    });
    if (response.status === 409 || response.status === 422) {
      throw new HttpError(
        409,
        "GitHub 上のファイルが編集後に変更されています。再読み込みしてから保存してください。",
      );
    }
    if (!response.ok) {
      throw new HttpError(502, await githubMessage(response));
    }
    const body = (await response.json()) as {
      content: { path: string; sha: string };
      commit: { sha: string; html_url: string };
    };
    return {
      path: body.content.path,
      sha: body.content.sha,
      commitSha: body.commit.sha,
      commitUrl: body.commit.html_url,
    };
  }
}

async function githubMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message ?? `GitHub API error (${response.status})`;
  } catch {
    return `GitHub API error (${response.status})`;
  }
}
