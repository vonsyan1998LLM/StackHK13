// Deployment smoke probe. If this returns JSON, Pages Functions are executing and
// the KV binding is live. If a request here returns HTML, the deployment has no
// attached Functions — that was the failure mode of the legacy system.

import { json } from '../_lib/util.js';

export async function onRequestGet({ env }) {
  const checks = {
    kv: 'missing',
    adminUsername: !!env.ADMIN_USERNAME,
    passwordSalt: !!env.ADMIN_PASSWORD_SALT,
    passwordHash: !!env.ADMIN_PASSWORD_HASH,
    sessionSecret: !!env.ADMIN_SESSION_SECRET
  };
  if (env.STACKHK) {
    try {
      await env.STACKHK.list({ limit: 1 });
      checks.kv = 'ok';
    } catch (e) {
      checks.kv = 'error';
    }
  }
  return json({
    ok: true,
    service: 'stackhk-admin',
    version: env.SITE_VERSION || 'dev',
    time: new Date().toISOString(),
    checks
  });
}
