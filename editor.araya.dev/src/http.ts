/** Small helpers shared by the route handlers. */

export function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(init.headers ?? {}),
    },
  });
}

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export function badRequest(message: string): HttpError {
  return new HttpError(400, message);
}

/**
 * Content-Security-Policy for the editor's own HTML.
 *
 * The client bundle is served from this origin, so `script-src 'self'` needs no
 * escape hatch. Preview images come from the published blog, from blob: URLs
 * for images uploaded in this session, and from data: URLs.
 */
export function securityHeaders(blogOrigin: string): Record<string, string> {
  const csp = [
    "default-src 'self'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "script-src 'self'",
    "style-src 'self'",
    `img-src 'self' data: blob: ${blogOrigin} https://avatars.githubusercontent.com`,
    "connect-src 'self'",
  ].join("; ");
  return {
    "content-security-policy": csp,
    "referrer-policy": "same-origin",
    "x-content-type-options": "nosniff",
    "cross-origin-opener-policy": "same-origin",
    "cache-control": "no-store",
  };
}

/**
 * Same-origin check for state-changing requests.
 *
 * The session cookie is SameSite=Lax, which already keeps it off cross-site
 * POSTs, but browsers disagree about edge cases often enough that the Origin
 * header is worth checking too.
 */
export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (origin === null) {
    // Same-origin fetch() always sends Origin for non-GET; a missing one means
    // the request did not come from the editor UI.
    throw new HttpError(403, "missing Origin header");
  }
  if (origin !== new URL(request.url).origin) {
    throw new HttpError(403, "cross-origin request rejected");
  }
}
