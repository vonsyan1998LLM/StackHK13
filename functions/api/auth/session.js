import { json } from '../../_lib/util.js';
import { verifySession } from '../../_lib/session.js';

export async function onRequestGet({ request, env }) {
  const payload = await verifySession(env, request);
  if (!payload) return json({ ok: false }, 401);
  return json({ ok: true, username: payload.u, csrf: payload.csrf });
}
