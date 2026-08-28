// Small image upload for admin (logo library). Stored in KV as JSON {mime, b64},
// served by /assets/[id]. Free-plan friendly: no R2 required.

import { json, fail, randomHex } from '../_lib/util.js';
import { requireAuth } from '../_lib/session.js';

const MAX_B64_LENGTH = 200_000; // ~150KB binary
const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']);

export async function onRequestPost({ request, env }) {
  const session = await requireAuth(request, env);
  if (!session) return fail(401, 'AUTH', 'Unauthorized');
  if (!env.STACKHK) return fail(500, 'CONFIG', 'KV binding STACKHK is missing');

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return fail(400, 'BAD_REQUEST', 'Invalid JSON body');
  }

  const dataUrl = typeof body.dataUrl === 'string' ? body.dataUrl : '';
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : '';
  const m = dataUrl.match(/^data:(image\/(?:png|jpeg|webp|svg\+xml));base64,([A-Za-z0-9+/=]+)$/);
  if (!m) return fail(400, 'BAD_REQUEST', 'Only PNG, JPEG, WebP or SVG images are allowed');
  if (m[2].length > MAX_B64_LENGTH) return fail(400, 'BAD_REQUEST', 'Image too large (max ~150KB)');

  const mime = m[1];
  if (!ALLOWED_MIME.has(mime)) return fail(400, 'BAD_REQUEST', 'Unsupported image type');

  const id = randomHex(8);
  await env.STACKHK.put(`img:${id}`, JSON.stringify({ mime, b64: m[2], name, at: Date.now() }));
  return json({ ok: true, id, url: `/assets/${id}`, name });
}
