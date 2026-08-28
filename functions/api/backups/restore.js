import { json, fail } from '../../_lib/util.js';
import { requireAuth } from '../../_lib/session.js';
import { restoreBackup } from '../../_lib/store.js';

export async function onRequestPost({ request, env }) {
  const session = await requireAuth(request, env);
  if (!session) return fail(401, 'AUTH', 'Unauthorized');

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return fail(400, 'BAD_REQUEST', 'Invalid JSON body');
  }
  const timestamp = typeof body.timestamp === 'string' ? body.timestamp : '';
  // Snapshot keys are ISO timestamps with only digits and dashes.
  if (!/^[0-9T-]+$/.test(timestamp)) return fail(400, 'BAD_REQUEST', 'Invalid timestamp');

  const result = await restoreBackup(env, timestamp, session.u);
  if (!result) return fail(404, 'NOT_FOUND', 'Backup not found');
  return json({ ok: true, version: result.meta.version, restoredAt: result.meta.at });
}
