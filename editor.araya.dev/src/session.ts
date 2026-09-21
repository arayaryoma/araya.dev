import { base64UrlToBytes, bytesToBase64Url } from "./encoding";

/**
 * Sessions are sealed cookies: there is no server-side store, because a Worker
 * has nowhere durable to keep one and a single admin does not need one. The
 * cookie holds the GitHub access token encrypted with AES-GCM under a key
 * derived from SESSION_SECRET, so the browser cannot read or forge it, and
 * rotating SESSION_SECRET invalidates every outstanding session.
 */

export interface Session {
  login: string;
  name: string;
  avatarUrl: string;
  token: string;
  /** Unix seconds. */
  exp: number;
}

export interface OAuthState {
  state: string;
  exp: number;
}

export const SESSION_COOKIE = "__Host-editor_session";
export const OAUTH_COOKIE = "__Host-editor_oauth";
export const SESSION_TTL_SECONDS = 12 * 60 * 60;
const OAUTH_TTL_SECONDS = 10 * 60;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const keyCache = new Map<string, Promise<CryptoKey>>();

function aesKey(secret: string, purpose: string): Promise<CryptoKey> {
  const cacheKey = `${purpose}:${secret}`;
  let key = keyCache.get(cacheKey);
  if (key === undefined) {
    key = deriveKey(secret, purpose);
    keyCache.set(cacheKey, key);
  }
  return key;
}

async function deriveKey(secret: string, purpose: string): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    "HKDF",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: encoder.encode("editor.araya.dev"),
      info: encoder.encode(purpose),
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function seal(
  secret: string,
  purpose: string,
  payload: unknown,
): Promise<string> {
  const key = await aesKey(secret, purpose);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoder.encode(JSON.stringify(payload)),
    ),
  );
  const sealed = new Uint8Array(iv.length + ciphertext.length);
  sealed.set(iv);
  sealed.set(ciphertext, iv.length);
  return bytesToBase64Url(sealed);
}

async function unseal<T>(
  secret: string,
  purpose: string,
  value: string,
): Promise<T | null> {
  try {
    const key = await aesKey(secret, purpose);
    const sealed = base64UrlToBytes(value);
    if (sealed.length <= 12) return null;
    // slice() rather than subarray(): a view keeps the parent buffer's type,
    // which WebCrypto's BufferSource will not accept.
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: sealed.slice(0, 12) },
      key,
      sealed.slice(12),
    );
    return JSON.parse(decoder.decode(plaintext)) as T;
  } catch {
    // Tampered, truncated, or sealed under a rotated secret: all "no session".
    return null;
  }
}

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (header === null) return null;
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() === name) {
      return part.slice(separator + 1).trim();
    }
  }
  return null;
}

function cookie(name: string, value: string, maxAge: number): string {
  // __Host- requires Secure, Path=/ and no Domain. SameSite=Lax rather than
  // Strict so the cookie survives the top-level redirect back from GitHub.
  return `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearCookie(name: string): string {
  return `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export async function createSessionCookie(
  secret: string,
  session: Omit<Session, "exp">,
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const sealed = await seal(secret, "session-v1", { ...session, exp });
  return cookie(SESSION_COOKIE, sealed, SESSION_TTL_SECONDS);
}

export async function readSession(
  request: Request,
  secret: string,
  adminLogin: string,
): Promise<Session | null> {
  const raw = readCookie(request, SESSION_COOKIE);
  if (raw === null) return null;
  const session = await unseal<Session>(secret, "session-v1", raw);
  if (session === null) return null;
  if (session.exp <= Math.floor(Date.now() / 1000)) return null;
  // Re-check the allowlist on every request, so narrowing ADMIN_GITHUB_LOGIN
  // takes effect immediately instead of when the last session expires.
  if (!isAdmin(session.login, adminLogin)) return null;
  return session;
}

export function isAdmin(login: string, adminLogin: string): boolean {
  return login.toLowerCase() === adminLogin.trim().toLowerCase();
}

export async function createOAuthStateCookie(
  secret: string,
): Promise<{ state: string; cookie: string }> {
  const state = bytesToBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  const exp = Math.floor(Date.now() / 1000) + OAUTH_TTL_SECONDS;
  const sealed = await seal(secret, "oauth-v1", { state, exp });
  return { state, cookie: cookie(OAUTH_COOKIE, sealed, OAUTH_TTL_SECONDS) };
}

export async function verifyOAuthState(
  request: Request,
  secret: string,
  received: string | null,
): Promise<boolean> {
  const raw = readCookie(request, OAUTH_COOKIE);
  if (raw === null || received === null) return false;
  const stored = await unseal<OAuthState>(secret, "oauth-v1", raw);
  if (stored === null) return false;
  if (stored.exp <= Math.floor(Date.now() / 1000)) return false;
  return timingSafeEqual(stored.state, received);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
