import { json, fail, timingSafeEqual } from '../../_lib/util.js';
import { pbkdf2HashHex } from '../../_lib/crypto.js';
import { issueSession, sessionCookie, SESSION_TTL_SECONDS } from '../../_lib/session.js';
import { rateLimit } from '../../_lib/ratelimit.js';

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_SESSION_SECRET || !env.ADMIN_PASSWORD_HASH || !env.ADMIN_PASSWORD_SALT || !env.ADMIN_USERNAME) {
    return fail(500, 'CONFIG', 'Server secrets are not configured');
  }
  if (!(await rateLimit(env, request, env.ADMIN_SESSION_SECRET, 'login', 5))) {
    return fail(429, 'RATE_LIMIT', 'Too many attempts. Try again in a minute.');
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return fail(400, 'BAD_REQUEST', 'Invalid JSON body');
  }
  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const captchaId = typeof body.captchaId === 'string' ? body.captchaId : '';
  const captchaText = typeof body.captchaText === 'string' ? body.captchaText.trim() : '';
  if (!username || !password) {
    return fail(400, 'BAD_REQUEST', 'Username and password are required');
  }

  // Captcha gate: one-time KV challenge, checked before the expensive PBKDF2 derive
  // so bot traffic never reaches password hashing. Delete-then-compare = single use.
  const capKey = `captcha:${captchaId}`;
  const capExpected = captchaId && env.STACKHK ? await env.STACKHK.get(capKey) : null;
  if (env.STACKHK) await env.STACKHK.delete(capKey);
  if (!capExpected || !captchaText || !timingSafeEqual(captchaText.toLowerCase(), capExpected)) {
    return fail(401, 'CAPTCHA', 'Captcha is wrong or expired. Try the new one.');
  }

  const userOk = timingSafeEqual(username, env.ADMIN_USERNAME);
  const computed = await pbkdf2HashHex(password, env.ADMIN_PASSWORD_SALT);
  const passOk = timingSafeEqual(computed, env.ADMIN_PASSWORD_HASH);

  // Same generic message for both failure modes — no account enumeration.
  if (!userOk || !passOk) {
    return fail(401, 'AUTH', 'Invalid username or password');
  }

  const session = await issueSession(env, username);
  return json(
    { ok: true, csrf: session.csrf, user: { username, name: 'StackHK Admin', role: 'Administrator' } },
    200,
    {
      'Set-Cookie': sessionCookie(session.token, SESSION_TTL_SECONDS)
    }
  );
}
