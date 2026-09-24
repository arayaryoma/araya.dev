import type { Env } from "./env";
import { refreshAccessToken, type TokenSet } from "./oauth";
import {
  accessTokenExpired,
  clearCookie,
  createSession,
  readCookie,
  readSession,
  SESSION_COOKIE,
  type Session,
} from "./session";

export interface LoadedSession {
  session: Session | null;
  /** What the browser must be told afterwards, if anything. */
  setCookie?: string;
}

export type Refresher = (env: Env, refreshToken: string) => Promise<TokenSet>;

/**
 * Read the session, renewing the GitHub access token when it has run out.
 *
 * Every path that gives up clears the cookie rather than leaving it in place:
 * a session the Worker will never accept again would otherwise be replayed on
 * every request, and the login page would bounce straight back to it.
 *
 * `refresh` is a parameter so the renewal can be exercised without reaching
 * GitHub.
 */
export async function loadSession(
  request: Request,
  env: Env,
  refresh: Refresher = refreshAccessToken,
): Promise<LoadedSession> {
  if (readCookie(request, SESSION_COOKIE) === null) return { session: null };

  const session = await readSession(
    request,
    env.SESSION_SECRET,
    env.ADMIN_GITHUB_LOGIN,
  );
  if (session === null) return dead();
  if (!accessTokenExpired(session)) return { session };

  if (session.refreshToken === undefined) {
    // Expired with no way to act on it: only reachable if the app's token
    // settings changed while a session was outstanding.
    return dead();
  }

  try {
    const tokens = await refresh(env, session.refreshToken);
    const renewed = await createSession(env.SESSION_SECRET, {
      login: session.login,
      name: session.name,
      avatarUrl: session.avatarUrl,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenExpiresAt: tokens.expiresAt,
    });
    return { session: renewed.session, setCookie: renewed.cookie };
  } catch {
    // Already spent, expired after six months unused, or the authorization was
    // revoked on GitHub. Every one of them means: log in again.
    return dead();
  }
}

function dead(): LoadedSession {
  return { session: null, setCookie: clearCookie(SESSION_COOKIE) };
}
