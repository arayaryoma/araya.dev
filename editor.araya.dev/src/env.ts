/**
 * Bindings for the editor Worker.
 *
 * The four secrets are set with `wrangler secret put <NAME>`; everything else
 * lives in `vars` in wrangler.jsonc so a config change is reviewable in git.
 */
export interface Env {
  /** GitHub App client id. Not secret, but kept next to the secret. */
  GITHUB_CLIENT_ID: string;
  /** secret: GitHub App client secret. */
  GITHUB_CLIENT_SECRET: string;
  /** secret: 32+ random bytes; seals the session cookie. */
  SESSION_SECRET: string;
  /** The single GitHub login allowed to sign in. */
  ADMIN_GITHUB_LOGIN: string;

  REPO_OWNER: string;
  REPO_NAME: string;
  /** Branch that posts are committed to. Pushing here triggers the deploy. */
  REPO_BRANCH: string;
  /** Repo-relative directory holding the post markdown files. */
  CONTENT_DIR: string;
  /** Repo-relative directory holding post images. */
  IMAGE_DIR: string;
  /** URL prefix the blog serves IMAGE_DIR from. */
  IMAGE_URL_PREFIX: string;
  /** Origin of the published blog, used to resolve preview image URLs. */
  BLOG_ORIGIN: string;

  /**
   * Static assets (the client bundle), bound by wrangler's `assets`. Typed
   * structurally rather than as workers-types' `Fetcher` so that modules
   * reaching this file still typecheck outside the Workers project.
   */
  ASSETS: { fetch(request: Request): Promise<Response> };
}

export interface RepoConfig {
  owner: string;
  repo: string;
  branch: string;
  contentDir: string;
  imageDir: string;
  imageUrlPrefix: string;
}

export function repoConfig(env: Env): RepoConfig {
  return {
    owner: env.REPO_OWNER,
    repo: env.REPO_NAME,
    branch: env.REPO_BRANCH,
    contentDir: trimSlashes(env.CONTENT_DIR),
    imageDir: trimSlashes(env.IMAGE_DIR),
    imageUrlPrefix: `/${trimSlashes(env.IMAGE_URL_PREFIX)}`,
  };
}

function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, "");
}
