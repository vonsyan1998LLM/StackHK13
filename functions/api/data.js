// Public read + authorized full-document write of the site content.
// GET is consumed by js/tp-main.js (falls back to the bundled api-seed.json on failure).

import { json, fail } from '../_lib/util.js';
import { requireAuth } from '../_lib/session.js';
import { readSiteData, writeSiteData, emptySiteData } from '../_lib/store.js';
import { ValidationError } from '../_lib/validate.js';

export async function onRequestGet({ env }) {
  if (!env.STACKHK) {
    // Same contract as below, but straight from the bundled seed.
    try {
      const asset = await env.ASSETS.fetch(new URL('/api-seed.json', 'https://local'));
      if (asset.ok) {
        return new Response(asset.body, {
          headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=60' }
        });
      }
    } catch (e) { /* fall through */ }
    return json(emptySiteData(), 200, { 'Cache-Control': 'public, max-age=60' });
  }

  const data = await readSiteData(env);
  return json(data, 200, { 'Cache-Control': 'public, max-age=60' });
}

export async function onRequestPut({ request, env }) {
  if (!env.STACKHK) return fail(500, 'CONFIG', 'KV binding STACKHK is missing');
  const session = await requireAuth(request, env);
  if (!session) return fail(401, 'AUTH', 'Unauthorized');

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return fail(400, 'BAD_REQUEST', 'Invalid JSON body');
  }

  try {
    const { meta } = await writeSiteData(env, body, session.u);
    return json({ ok: true, version: meta.version, savedAt: meta.at });
  } catch (e) {
    if (e instanceof ValidationError) return fail(400, e.code, e.message);
    return fail(500, 'INTERNAL', 'Save failed');
  }
}
