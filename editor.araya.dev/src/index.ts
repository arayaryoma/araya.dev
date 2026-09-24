import { handleApi } from "./api";
import { loadSession } from "./auth";
import type { Env } from "./env";
import { HttpError, json, securityHeaders } from "./http";
import { authorizeUrl, exchangeCodeForToken, fetchUser } from "./oauth";
import { appPage, loginPage } from "./pages";
import {
  clearCookie,
  createOAuthStateCookie,
  createSession,
  isAdmin,
  OAUTH_COOKIE,
  SESSION_COOKIE,
  verifyOAuthState,
} from "./session";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      return await route(request, env);
    } catch (error) {
      return errorResponse(request, env, error);
    }
  },
} satisfies ExportedHandler<Env>;

async function route(request: Request, env: Env): Promise<Response> {
  assertConfigured(env);

  const url = new URL(request.url);
  const path = url.pathname;
  const redirectUri = `${url.origin}/auth/callback`;

  if (path === "/auth/github" && request.method === "GET") {
    const { state, cookie } = await createOAuthStateCookie(env.SESSION_SECRET);
    return new Response(null, {
      status: 302,
      headers: {
        location: authorizeUrl(env, redirectUri, state),
        "set-cookie": cookie,
        "cache-control": "no-store",
      },
    });
  }

  if (path === "/auth/callback" && request.method === "GET") {
    return handleCallback(request, env, url, redirectUri);
  }

  if (path === "/auth/logout" && request.method === "POST") {
    return new Response(null, {
      status: 303,
      headers: {
        location: "/login",
        "set-cookie": clearCookie(SESSION_COOKIE),
      },
    });
  }

  const { session, setCookie } = await loadSession(request, env);

  if (path.startsWith("/api/")) {
    if (session === null) throw new HttpError(401, "ログインしてください");
    return withCookie(await handleApi(request, env, session, path), setCookie);
  }

  if (path === "/login") {
    if (session !== null) return redirect("/");
    return withCookie(
      loginPage(env.BLOG_ORIGIN, url.searchParams.get("error") ?? undefined),
      setCookie,
    );
  }

  if (path === "/" || path === "/index.html") {
    if (session === null) return withCookie(redirect("/login"), setCookie);
    return withCookie(appPage(env.BLOG_ORIGIN), setCookie);
  }

  // Static client bundle. Normally the runtime serves these before the Worker
  // runs; this keeps working if that ordering ever changes.
  return env.ASSETS.fetch(request);
}

function withCookie(response: Response, setCookie?: string): Response {
  if (setCookie === undefined) return response;
  const headers = new Headers(response.headers);
  headers.append("set-cookie", setCookie);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function handleCallback(
  request: Request,
  env: Env,
  url: URL,
  redirectUri: string,
): Promise<Response> {
  const clearState = clearCookie(OAUTH_COOKIE);

  const oauthError = url.searchParams.get("error");
  if (oauthError !== null) {
    return redirect(
      `/login?error=${encodeURIComponent(oauthError)}`,
      clearState,
    );
  }

  const code = url.searchParams.get("code");
  if (code === null) {
    return redirect("/login?error=missing_code", clearState);
  }
  if (
    !(await verifyOAuthState(
      request,
      env.SESSION_SECRET,
      url.searchParams.get("state"),
    ))
  ) {
    return redirect("/login?error=state_mismatch", clearState);
  }

  const tokens = await exchangeCodeForToken(env, code, redirectUri);
  const user = await fetchUser(tokens.accessToken);
  if (!isAdmin(user.login, env.ADMIN_GITHUB_LOGIN)) {
    // The one authorization decision in the whole app: exactly one login.
    return redirect("/login?error=not_allowed", clearState);
  }

  const { cookie } = await createSession(env.SESSION_SECRET, {
    login: user.login,
    name: user.name,
    avatarUrl: user.avatarUrl,
    token: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    tokenExpiresAt: tokens.expiresAt,
  });
  const headers = new Headers({ location: "/", "cache-control": "no-store" });
  headers.append("set-cookie", clearState);
  headers.append("set-cookie", cookie);
  return new Response(null, { status: 303, headers });
}

function redirect(location: string, setCookie?: string): Response {
  const headers = new Headers({ location, "cache-control": "no-store" });
  if (setCookie !== undefined) headers.append("set-cookie", setCookie);
  return new Response(null, { status: 303, headers });
}

const REQUIRED_VARS = [
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "SESSION_SECRET",
  "ADMIN_GITHUB_LOGIN",
  "REPO_OWNER",
  "REPO_NAME",
  "REPO_BRANCH",
  "CONTENT_DIR",
  "IMAGE_DIR",
  "IMAGE_URL_PREFIX",
  "BLOG_ORIGIN",
] as const;

function assertConfigured(env: Env): void {
  const missing = REQUIRED_VARS.filter(
    (name) => typeof env[name] !== "string" || env[name] === "",
  );
  if (missing.length > 0) {
    throw new HttpError(
      500,
      `未設定の環境変数があります: ${missing.join(", ")}`,
    );
  }
  if (env.SESSION_SECRET.length < 32) {
    throw new HttpError(500, "SESSION_SECRET は 32 文字以上にしてください");
  }
}

function errorResponse(request: Request, env: Env, error: unknown): Response {
  const status = error instanceof HttpError ? error.status : 500;
  const message =
    error instanceof HttpError
      ? error.message
      : error instanceof Error
        ? error.message
        : "unexpected error";
  if (status >= 500) console.error(error);

  if (new URL(request.url).pathname.startsWith("/api/")) {
    return json({ error: message }, { status });
  }
  const blogOrigin = env.BLOG_ORIGIN ?? "https://blog.araya.dev";
  return new Response(`${status}: ${message}\n`, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      ...securityHeaders(blogOrigin),
    },
  });
}
