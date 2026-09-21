import type { Env } from "./env";
import { HttpError } from "./http";

/**
 * GitHub OAuth web application flow.
 *
 * The access token this yields is also the credential used to commit, so the
 * editor never stores a long-lived personal access token anywhere: commits are
 * attributed to the admin, and revoking the OAuth grant on GitHub revokes the
 * editor's write access in one step.
 *
 * `public_repo` is enough for arayaryoma/araya.dev, which is public. A private
 * repo would need `repo`.
 */
export const OAUTH_SCOPE = "public_repo";

const AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const TOKEN_URL = "https://github.com/login/oauth/access_token";

export function authorizeUrl(
  env: Env,
  redirectUri: string,
  state: string,
): string {
  const url = new URL(AUTHORIZE_URL);
  url.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", OAUTH_SCOPE);
  url.searchParams.set("state", state);
  url.searchParams.set("allow_signup", "false");
  return url.toString();
}

export async function exchangeCodeForToken(
  env: Env,
  code: string,
  redirectUri: string,
): Promise<string> {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
    }),
  });
  if (!response.ok) {
    throw new HttpError(502, `token exchange failed (${response.status})`);
  }
  const body = (await response.json()) as {
    access_token?: string;
    error_description?: string;
    error?: string;
  };
  if (typeof body.access_token !== "string") {
    throw new HttpError(
      401,
      body.error_description ??
        body.error ??
        "token exchange returned no token",
    );
  }
  return body.access_token;
}

export interface GitHubUser {
  login: string;
  name: string;
  avatarUrl: string;
}

export async function fetchUser(token: string): Promise<GitHubUser> {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "user-agent": "editor.araya.dev",
    },
  });
  if (!response.ok) {
    throw new HttpError(502, `could not read GitHub user (${response.status})`);
  }
  const body = (await response.json()) as {
    login: string;
    name: string | null;
    avatar_url: string;
  };
  return {
    login: body.login,
    name: body.name ?? body.login,
    avatarUrl: body.avatar_url,
  };
}
