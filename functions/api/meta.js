import { json, fail } from '../_lib/util.js';
import { requireAuth } from '../_lib/session.js';
import { readMeta } from '../_lib/store.js';

export async function onRequestGet({ request, env }) {
  const session = await requireAuth(request, env);
  if (!session) return fail(401, 'AUTH', 'Unauthorized');
  return json(await readMeta(env));
}
