import assert from "node:assert/strict";
import { test } from "node:test";
import {
  base64ToBytes,
  base64UrlToBytes,
  bytesToBase64,
  bytesToBase64Url,
  decodeGitHubContent,
  encodeUtf8ToBase64,
} from "../src/encoding";
import { assertSameOrigin, HttpError } from "../src/http";
import {
  accessTokenExpired,
  clearCookie,
  createOAuthStateCookie,
  createSession,
  isAdmin,
  OAUTH_COOKIE,
  readCookie,
  readSession,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  verifyOAuthState,
} from "../src/session";

const SECRET = "0123456789abcdef0123456789abcdef";
const ADMIN = "arayaryoma";

function cookieValue(setCookie: string): string {
  return setCookie.slice(setCookie.indexOf("=") + 1, setCookie.indexOf(";"));
}

function requestWithCookie(name: string, value: string): Request {
  return new Request("https://editor.araya.dev/", {
    headers: { cookie: `${name}=${value}` },
  });
}

async function atTime(
  offsetMs: number,
  body: () => Promise<void>,
): Promise<void> {
  const realNow = Date.now;
  Date.now = () => realNow() + offsetMs;
  try {
    await body();
  } finally {
    Date.now = realNow;
  }
}

const user = {
  login: ADMIN,
  name: "araya",
  avatarUrl: "https://avatars.githubusercontent.com/u/5627119?v=4",
  token: "gho_exampletoken",
};

test("a sealed session round trips", async () => {
  const setCookie = (await createSession(SECRET, user)).cookie;
  assert.match(setCookie, /^__Host-editor_session=/);
  // __Host- is only honored with all three of these.
  assert.match(setCookie, /HttpOnly/);
  assert.match(setCookie, /Secure/);
  assert.match(setCookie, /Path=\//);
  assert.match(setCookie, /SameSite=Lax/);

  const session = await readSession(
    requestWithCookie(SESSION_COOKIE, cookieValue(setCookie)),
    SECRET,
    ADMIN,
  );
  assert.equal(session?.login, ADMIN);
  assert.equal(session?.token, user.token);
});

test("the token is not readable from the cookie", async () => {
  const setCookie = (await createSession(SECRET, user)).cookie;
  assert.ok(!setCookie.includes(user.token));
  const raw = cookieValue(setCookie);
  assert.ok(
    !Buffer.from(base64UrlToBytes(raw)).toString("utf8").includes("gho_"),
  );
});

test("a tampered or re-keyed cookie is no session at all", async () => {
  const setCookie = (await createSession(SECRET, user)).cookie;
  const raw = cookieValue(setCookie);

  // Flipping one ciphertext byte must fail the AES-GCM tag.
  const bytes = base64UrlToBytes(raw);
  bytes[bytes.length - 1] ^= 0x01;
  const tampered = bytesToBase64Url(bytes);

  for (const [value, secret] of [
    [tampered, SECRET],
    [raw, "ffffffffffffffffffffffffffffffff"],
    ["not-base64!!", SECRET],
    ["", SECRET],
  ] as const) {
    assert.equal(
      await readSession(
        requestWithCookie(SESSION_COOKIE, value),
        secret,
        ADMIN,
      ),
      null,
    );
  }
});

test("an expired session is rejected", async () => {
  const setCookie = (await createSession(SECRET, user)).cookie;
  const request = requestWithCookie(SESSION_COOKIE, cookieValue(setCookie));

  await atTime((SESSION_TTL_SECONDS + 60) * 1000, async () => {
    assert.equal(await readSession(request, SECRET, ADMIN), null);
  });
});

test("the refresh token rides along in the sealed cookie", async () => {
  const { session, cookie } = await createSession(SECRET, {
    ...user,
    refreshToken: "ghr_examplerefresh",
    tokenExpiresAt: Math.floor(Date.now() / 1000) + 8 * 60 * 60,
  });
  assert.ok(!cookie.includes("ghr_examplerefresh"));

  const read = await readSession(
    requestWithCookie(SESSION_COOKIE, cookieValue(cookie)),
    SECRET,
    ADMIN,
  );
  assert.equal(read?.refreshToken, "ghr_examplerefresh");
  assert.equal(read?.tokenExpiresAt, session.tokenExpiresAt);
});

test("the access token is renewed before it actually dies", () => {
  const now = Math.floor(Date.now() / 1000);
  const base = { ...user, refreshToken: "r", exp: now + 999 };

  assert.equal(
    accessTokenExpired({ ...base, tokenExpiresAt: now + 8 * 60 * 60 }),
    false,
  );
  // Inside the safety margin: renew now rather than let a save race the expiry.
  assert.equal(accessTokenExpired({ ...base, tokenExpiresAt: now + 30 }), true);
  assert.equal(accessTokenExpired({ ...base, tokenExpiresAt: now - 1 }), true);
});

test("a non-expiring token is never treated as stale", () => {
  // An app with user token expiration turned off returns no expires_in at all.
  const now = Math.floor(Date.now() / 1000);
  assert.equal(accessTokenExpired({ ...user, exp: now + 999 }), false);
});

test("a session outlives several access tokens", async () => {
  // The point of carrying a refresh token: a 30-day cookie, not an 8-hour one.
  assert.ok(SESSION_TTL_SECONDS > 3 * 8 * 60 * 60);
  const { cookie } = await createSession(SECRET, {
    ...user,
    refreshToken: "r",
    tokenExpiresAt: Math.floor(Date.now() / 1000) + 8 * 60 * 60,
  });
  const request = requestWithCookie(SESSION_COOKIE, cookieValue(cookie));

  await atTime(3 * 24 * 60 * 60 * 1000, async () => {
    const read = await readSession(request, SECRET, ADMIN);
    assert.ok(read !== null, "the cookie should still be good three days on");
    assert.equal(
      accessTokenExpired(read),
      true,
      "but its access token should not be",
    );
  });
});

test("a session for anyone but the admin is rejected on every request", async () => {
  const setCookie = (await createSession(SECRET, { ...user, login: "someone" }))
    .cookie;
  assert.equal(
    await readSession(
      requestWithCookie(SESSION_COOKIE, cookieValue(setCookie)),
      SECRET,
      ADMIN,
    ),
    null,
  );

  // Narrowing ADMIN_GITHUB_LOGIN must take effect without waiting for the
  // outstanding session to expire.
  const valid = (await createSession(SECRET, user)).cookie;
  assert.equal(
    await readSession(
      requestWithCookie(SESSION_COOKIE, cookieValue(valid)),
      SECRET,
      "someone-else",
    ),
    null,
  );
});

test("the admin check ignores case but nothing else", () => {
  assert.ok(isAdmin("ArayaRyoma", "arayaryoma"));
  assert.ok(isAdmin("arayaryoma", "  arayaryoma  "));
  assert.ok(!isAdmin("arayaryoma2", "arayaryoma"));
  assert.ok(!isAdmin("", "arayaryoma"));
});

test("the OAuth state must match the cookie it was issued with", async () => {
  const { state, cookie } = await createOAuthStateCookie(SECRET);
  const request = requestWithCookie(OAUTH_COOKIE, cookieValue(cookie));

  assert.ok(await verifyOAuthState(request, SECRET, state));
  assert.ok(!(await verifyOAuthState(request, SECRET, "guessed")));
  assert.ok(!(await verifyOAuthState(request, SECRET, null)));
  // A callback with no state cookie at all: the classic login-CSRF shape.
  assert.ok(
    !(await verifyOAuthState(
      new Request("https://editor.araya.dev/"),
      SECRET,
      state,
    )),
  );

  const other = await createOAuthStateCookie(SECRET);
  assert.ok(!(await verifyOAuthState(request, SECRET, other.state)));
});

test("two logins never share a state value", async () => {
  const seen = new Set<string>();
  for (let i = 0; i < 50; i++) {
    seen.add((await createOAuthStateCookie(SECRET)).state);
  }
  assert.equal(seen.size, 50);
});

test("clearing a cookie expires it immediately", () => {
  const header = clearCookie(SESSION_COOKIE);
  assert.match(header, /Max-Age=0/);
  assert.match(header, /^__Host-editor_session=;/);
});

test("cookies are read by exact name", () => {
  const request = new Request("https://editor.araya.dev/", {
    headers: {
      cookie: "a=1; editor_session=decoy; __Host-editor_session=real; b=2",
    },
  });
  assert.equal(readCookie(request, SESSION_COOKIE), "real");
  assert.equal(readCookie(request, "a"), "1");
  assert.equal(readCookie(request, "missing"), null);
  assert.equal(readCookie(new Request("https://editor.araya.dev/"), "a"), null);
});

test("writes from another origin, or with no Origin, are refused", () => {
  const post = (origin?: string) =>
    new Request("https://editor.araya.dev/api/posts/x.md", {
      method: "PUT",
      headers: origin === undefined ? {} : { origin },
    });

  assert.doesNotThrow(() => assertSameOrigin(post("https://editor.araya.dev")));
  assert.throws(
    () => assertSameOrigin(post("https://evil.example")),
    HttpError,
  );
  assert.throws(() => assertSameOrigin(post("null")), HttpError);
  assert.throws(() => assertSameOrigin(post()), HttpError);
});

test("base64 helpers survive binary and multibyte input", () => {
  // Large enough to blow the call stack if the conversion is not chunked.
  const bytes = new Uint8Array(300_000).map((_, i) => i % 256);
  assert.deepEqual(base64ToBytes(bytesToBase64(bytes)), bytes);
  assert.deepEqual(base64UrlToBytes(bytesToBase64Url(bytes)), bytes);

  const text = "日本語と絵文字 🎈 と ASCII";
  assert.equal(
    Buffer.from(encodeUtf8ToBase64(text), "base64").toString("utf8"),
    text,
  );
  // GitHub wraps the base64 it returns.
  const wrapped = Buffer.from(text)
    .toString("base64")
    .replace(/(.{4})/g, "$1\n");
  assert.equal(decodeGitHubContent(wrapped), text);
});

test("base64url output is URL safe", () => {
  const bytes = new Uint8Array([251, 255, 190, 254, 0, 1, 2, 3]);
  const encoded = bytesToBase64Url(bytes);
  assert.ok(!/[+/=]/.test(encoded), encoded);
  assert.deepEqual(base64UrlToBytes(encoded), bytes);
});
