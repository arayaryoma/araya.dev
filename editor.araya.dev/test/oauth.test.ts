import assert from "node:assert/strict";
import { test } from "node:test";
import { HttpError } from "../src/http";
import { parseTokenResponse } from "../src/oauth";

const NOW = 1_800_000_000;

test("an expiring token carries its refresh token and deadline", () => {
  // The shape GitHub returns for a GitHub App with the default settings.
  const tokens = parseTokenResponse(
    {
      access_token: "ghu_access",
      refresh_token: "ghr_refresh",
      expires_in: 28800,
    },
    NOW,
  );
  assert.equal(tokens.accessToken, "ghu_access");
  assert.equal(tokens.refreshToken, "ghr_refresh");
  assert.equal(tokens.expiresAt, NOW + 28800);
});

test("a non-expiring token has neither", () => {
  // What an app with user token expiration turned off returns.
  const tokens = parseTokenResponse({ access_token: "ghu_access" }, NOW);
  assert.equal(tokens.accessToken, "ghu_access");
  assert.equal(tokens.refreshToken, undefined);
  // undefined, not 0 or NaN: accessTokenExpired keys off exactly this.
  assert.equal(tokens.expiresAt, undefined);
});

test("GitHub's error response becomes a 401, not a token", () => {
  assert.throws(
    () =>
      parseTokenResponse(
        {
          error: "bad_verification_code",
          error_description: "The code passed is incorrect or expired.",
        },
        NOW,
      ),
    (error: unknown) =>
      error instanceof HttpError &&
      error.status === 401 &&
      error.message.includes("incorrect or expired"),
  );
});

test("a spent refresh token is reported rather than swallowed", () => {
  assert.throws(
    () => parseTokenResponse({ error: "bad_refresh_token" }, NOW),
    (error: unknown) =>
      error instanceof HttpError && error.message === "bad_refresh_token",
  );
});

test("a response with no token at all is refused", () => {
  for (const body of [{}, { access_token: "" }, { access_token: 1 as never }]) {
    assert.throws(() => parseTokenResponse(body, NOW), HttpError);
  }
});

test("empty or nonsensical expiry fields are ignored", () => {
  const tokens = parseTokenResponse(
    { access_token: "a", refresh_token: "", expires_in: 0 },
    NOW,
  );
  assert.equal(tokens.refreshToken, undefined);
  assert.equal(tokens.expiresAt, undefined);
});
