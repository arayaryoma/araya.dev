import assert from "node:assert/strict";
import { test } from "node:test";
import { loadSession, type Refresher } from "../src/auth";
import type { Env } from "../src/env";
import { HttpError } from "../src/http";
import type { TokenSet } from "../src/oauth";
import {
  createSession,
  readSession,
  SESSION_COOKIE,
  type Session,
} from "../src/session";

const SECRET = "0123456789abcdef0123456789abcdef";

const env = {
  SESSION_SECRET: SECRET,
  ADMIN_GITHUB_LOGIN: "arayaryoma",
  GITHUB_CLIENT_ID: "Iv23liTest",
  GITHUB_CLIENT_SECRET: "secret",
} as Env;

const user = {
  login: "arayaryoma",
  name: "araya",
  avatarUrl: "https://example.test/a.png",
  token: "ghu_current",
};

function requestWith(cookie: string | null): Request {
  return new Request("https://editor.araya.dev/api/posts", {
    headers: cookie === null ? {} : { cookie },
  });
}

function seconds(offset: number): number {
  return Math.floor(Date.now() / 1000) + offset;
}

const never: Refresher = () => {
  throw new Error("refresh should not have been attempted");
};

function cookieValue(setCookie: string): string {
  return setCookie.slice(0, setCookie.indexOf(";"));
}

test("no cookie means no session and nothing to set", async () => {
  const loaded = await loadSession(requestWith(null), env, never);
  assert.equal(loaded.session, null);
  assert.equal(loaded.setCookie, undefined);
});

test("a live access token is used as is", async () => {
  const { cookie } = await createSession(SECRET, {
    ...user,
    refreshToken: "ghr_one",
    tokenExpiresAt: seconds(8 * 60 * 60),
  });
  const loaded = await loadSession(
    requestWith(cookieValue(cookie)),
    env,
    never,
  );
  assert.equal(loaded.session?.token, "ghu_current");
  // Nothing changed, so the browser is not asked to rewrite the cookie.
  assert.equal(loaded.setCookie, undefined);
});

test("an expired access token is renewed and the cookie replaced", async () => {
  const { cookie } = await createSession(SECRET, {
    ...user,
    refreshToken: "ghr_one",
    tokenExpiresAt: seconds(-1),
  });

  const seen: string[] = [];
  const refresh: Refresher = async (_env, refreshToken) => {
    seen.push(refreshToken);
    return {
      accessToken: "ghu_renewed",
      refreshToken: "ghr_two",
      expiresAt: seconds(8 * 60 * 60),
    } satisfies TokenSet;
  };

  const loaded = await loadSession(
    requestWith(cookieValue(cookie)),
    env,
    refresh,
  );
  assert.deepEqual(seen, ["ghr_one"]);
  assert.equal(loaded.session?.token, "ghu_renewed");
  assert.ok(loaded.setCookie !== undefined, "the new tokens must be persisted");

  // GitHub rotates the refresh token, so the replacement cookie has to carry
  // the new one -- keeping the old one would break the next renewal.
  const stored = await readSession(
    requestWith(cookieValue(loaded.setCookie)),
    SECRET,
    "arayaryoma",
  );
  assert.equal(stored?.refreshToken, "ghr_two");
  assert.equal(stored?.token, "ghu_renewed");
});

test("renewal happens inside the safety margin, not after the deadline", async () => {
  const { cookie } = await createSession(SECRET, {
    ...user,
    refreshToken: "ghr_one",
    tokenExpiresAt: seconds(30),
  });
  let called = false;
  const refresh: Refresher = async () => {
    called = true;
    return { accessToken: "ghu_renewed" };
  };
  await loadSession(requestWith(cookieValue(cookie)), env, refresh);
  assert.ok(called, "a token 30 seconds from death should be renewed early");
});

test("a spent refresh token ends the session and clears the cookie", async () => {
  const { cookie } = await createSession(SECRET, {
    ...user,
    refreshToken: "ghr_spent",
    tokenExpiresAt: seconds(-1),
  });
  const refresh: Refresher = () => {
    throw new HttpError(401, "bad_refresh_token");
  };

  const loaded = await loadSession(
    requestWith(cookieValue(cookie)),
    env,
    refresh,
  );
  assert.equal(loaded.session, null);
  // Without this the dead cookie is replayed forever and /login bounces back.
  assert.match(loaded.setCookie ?? "", /Max-Age=0/);
});

test("an expired token with no refresh token clears the cookie", async () => {
  const { cookie } = await createSession(SECRET, {
    ...user,
    tokenExpiresAt: seconds(-1),
  });
  const loaded = await loadSession(
    requestWith(cookieValue(cookie)),
    env,
    never,
  );
  assert.equal(loaded.session, null);
  assert.match(loaded.setCookie ?? "", /Max-Age=0/);
});

test("a token with no expiry is never sent for renewal", async () => {
  const { cookie } = await createSession(SECRET, user);
  const loaded = await loadSession(
    requestWith(cookieValue(cookie)),
    env,
    never,
  );
  assert.equal(loaded.session?.token, "ghu_current");
  assert.equal(loaded.setCookie, undefined);
});

test("an unreadable cookie is cleared rather than replayed", async () => {
  for (const value of [
    `${SESSION_COOKIE}=garbage`,
    `${SESSION_COOKIE}=`,
    // Sealed under a different secret: what a SESSION_SECRET rotation leaves.
    cookieValue((await createSession("f".repeat(32), user)).cookie),
  ]) {
    const loaded = await loadSession(requestWith(value), env, never);
    assert.equal(loaded.session, null);
    assert.match(loaded.setCookie ?? "", /Max-Age=0/);
  }
});

test("a session for someone other than the admin is cleared", async () => {
  const { cookie } = await createSession(SECRET, { ...user, login: "someone" });
  const loaded = await loadSession(
    requestWith(cookieValue(cookie)),
    env,
    never,
  );
  assert.equal(loaded.session, null);
  assert.match(loaded.setCookie ?? "", /Max-Age=0/);
});

test("renewal keeps the identity, and never trusts the refresher for it", async () => {
  const { cookie } = await createSession(SECRET, {
    ...user,
    refreshToken: "ghr_one",
    tokenExpiresAt: seconds(-1),
  });
  const refresh: Refresher = async () => ({
    accessToken: "ghu_renewed",
    refreshToken: "ghr_two",
    expiresAt: seconds(8 * 60 * 60),
  });
  const loaded = await loadSession(
    requestWith(cookieValue(cookie)),
    env,
    refresh,
  );
  const renewed = loaded.session as Session;
  assert.equal(renewed.login, "arayaryoma");
  assert.equal(renewed.name, "araya");
  assert.equal(renewed.avatarUrl, user.avatarUrl);
});
