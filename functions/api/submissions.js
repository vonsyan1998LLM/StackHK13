// Public tool submissions from submit.html + admin review endpoints.
// Storage keys: data:submissions:<id>

import { json, fail, randomHex } from '../_lib/util.js';
import { requireAuth } from '../_lib/session.js';
import { rateLimit } from '../_lib/ratelimit.js';
import { normalizeSubmission, ValidationError } from '../_lib/validate.js';

const PREFIX = 'data:submissions:';

// Public: submit. Anti-abuse: honeypot field, minimum fill-out time, per-IP limit.
export async function onRequestPost({ request, env }) {
  if (!env.STACKHK) return fail(500, 'CONFIG', 'KV binding STACKHK is missing');
  if (!(await rateLimit(env, request, env.ADMIN_SESSION_SECRET || 'shk', 'submit', 10))) {
    return fail(429, 'RATE_LIMIT', 'Too many submissions. Try again later.');
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return fail(400, 'BAD_REQUEST', 'Invalid JSON body');
  }

  // Honeypot: real users never see or fill this field.
  if (body.company) return json({ ok: true });
  // Minimum 2s between page load and submit — bots submit instantly.
  const openedAt = Number(body.openedAt);
  if (!Number.isFinite(openedAt) || Date.now() - openedAt < 2000) {
    return fail(400, 'BAD_REQUEST', 'Submission rejected');
  }

  try {
    const s = normalizeSubmission(body);
    const id = new Date().toISOString().slice(0, 10) + '-' + randomHex(4);
    const record = { id, at: Date.now(), status: 'pending', ...s };
    await env.STACKHK.put(PREFIX + id, JSON.stringify(record));
    return json({ ok: true, id });
  } catch (e) {
    if (e instanceof ValidationError) return fail(400, e.code, e.message);
    return fail(500, 'INTERNAL', 'Submission failed');
  }
}

// Admin: list submissions.
export async function onRequestGet({ request, env }) {
  const session = await requireAuth(request, env);
  if (!session) return fail(401, 'AUTH', 'Unauthorized');

  const list = await env.STACKHK.list({ prefix: PREFIX, limit: 200 });
  const items = [];
  for (const key of list.keys) {
    const raw = await env.STACKHK.get(key.name);
    if (raw) {
      try { items.push(JSON.parse(raw)); } catch (e) { /* skip malformed */ }
    }
  }
  items.sort((a, b) => (b.at || 0) - (a.at || 0));
  return json({ ok: true, items });
}

// Admin: delete one submission.
export async function onRequestDelete({ request, env }) {
  const session = await requireAuth(request, env);
  if (!session) return fail(401, 'AUTH', 'Unauthorized');

  const id = new URL(request.url).searchParams.get('id');
  if (!id || id.includes('/')) return fail(400, 'BAD_REQUEST', 'Missing id');
  await env.STACKHK.delete(PREFIX + id);
  return json({ ok: true });
}
