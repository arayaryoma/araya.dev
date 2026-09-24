import type { Env } from "./env";
import { HttpError } from "./http";

/**
 * GitHub App user authorization ("log in with GitHub").
 *
 * A GitHub App issues a *user access token*, which is the intersection of
 * three things: the app's configured permissions, the repositories the app is
 * installed on, and what the signed-in user can already do. The editor's app
 * is installed on one repository with Contents: Read and write, so the token
 * it commits with cannot touch anything else — a narrowing an OAuth App's
 * `public_repo` scope could not express, since that grants write access to
 * every public repository the user can push to.
 *
 * Two differences from the OAuth App flow, both from GitHub's docs:
 *   - the authorize URL takes no `scope`; permissions come from the app
 *     registration and the parameter is ignored
 *   - the token expires (8 hours by default) and comes with a refresh token
 *     (good for 6 months of disuse), so `refreshAccessToken` exists
 * The endpoints themselves are the same ones OAuth Apps use.
 */

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
  url.searchParams.set("state", state);
  return url.toString();
}

export interface TokenSet {
  accessToken: string;
  /** Absent when the app has user token expiration turned off. */
  refreshToken?: string;
  /** Unix seconds. Absent alongside refreshToken. */
  expiresAt?: number;
}

interface TokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

/**
 * Split out from the request so the parsing rules are testable: an app with
 * expiring tokens turned off returns neither `expires_in` nor `refresh_token`,
 * and the session must cope with both shapes.
 */
export function parseTokenResponse(
  body: TokenResponse,
  nowSeconds: number,
): TokenSet {
  if (typeof body.access_token !== "string" || body.access_token === "") {
    throw new HttpError(
      401,
      body.error_description ??
        body.error ??
        "GitHub がトークンを返しませんでした",
    );
  }
  return {
    accessToken: body.access_token,
    refreshToken:
      typeof body.refresh_token === "string" && body.refresh_token !== ""
        ? body.refresh_token
        : undefined,
    expiresAt:
      typeof body.expires_in === "number" && body.expires_in > 0
        ? nowSeconds + body.expires_in
        : undefined,
  };
}

async function requestToken(
  env: Env,
  params: Record<string, string>,
): Promise<TokenSet> {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      ...params,
    }),
  });
  if (!response.ok) {
    throw new HttpError(502, `token request failed (${response.status})`);
  }
  return parseTokenResponse(
    (await response.json()) as TokenResponse,
    Math.floor(Date.now() / 1000),
  );
}

export function exchangeCodeForToken(
  env: Env,
  code: string,
  redirectUri: string,
): Promise<TokenSet> {
  return requestToken(env, { code, redirect_uri: redirectUri });
}

/**
 * Both the access token and the refresh token are rotated, so the caller has
 * to store what comes back; the old pair stops working immediately.
 */
export function refreshAccessToken(
  env: Env,
  refreshToken: string,
): Promise<TokenSet> {
  return requestToken(env, {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
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
