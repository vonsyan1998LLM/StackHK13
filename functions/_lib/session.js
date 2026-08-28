// Signed, stateless session tokens carried in an HttpOnly cookie.
// Token = base64url(payload JSON) + "." + HMAC-SHA256(payloadB64, ADMIN_SESSION_SECRET)
// The payload embeds a per-session CSRF token which write endpoints double-check
// against the X-CSRF-Token header.

import { hmacHex } from './crypto.js';
import { b64urlEncode, b64urlDecode, timingSafeEqual, randomHex } from './util.js';

export const SESSION_COOKIE = 'shk_session';
export const SESSION_TTL_SECONDS = 12 * 60 * 60;

export async function issueSession(env, username) {
  const secret = env.ADMIN_SESSION_SECRET;
  const payload = {
    u: username,
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
    csrf: randomHex(16)
  };
  const body = b64urlEncode(JSON.stringify(payload));
  const sig = await hmacHex(secret, body);
  return { token: `${body}.${sig}`, csrf: payload.csrf, maxAge: SESSION_TTL_SECONDS };
}

export function sessionCookie(token, maxAge) {
  // HttpOnly: invisible to JS; Secure: HTTPS only; SameSite=Strict: no cross-site sends.
  return `${SESSION_COOKIE}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}

// Returns the payload ({u, exp, csrf}) for a valid, unexpired token, else null.
export async function verifySession(env, request) {
  const secret = env.ADMIN_SESSION_SECRET;
  if (!secret) return null;
  const cookie = request.headers.get('Cookie') || '';
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  if (!m) return null;
  const token = m[1];
  const dot = token.lastIndexOf('.');
  if (dot < 1) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = await hmacHex(secret, body);
  if (!timingSafeEqual(sig, expected)) return null;
  try {
    const payload = JSON.parse(b64urlDecode(body));
    if (!payload.u || !payload.exp || !payload.csrf) return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

// Full guard for write endpoints: session + CSRF header. Returns payload or null.
export async function requireAuth(request, env) {
  const payload = await verifySession(env, request);
  if (!payload) return null;
  const header = request.headers.get('X-CSRF-Token') || '';
  if (!header || !timingSafeEqual(header, payload.csrf)) return null;
  return payload;
}
