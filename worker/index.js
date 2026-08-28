// Cloudflare Workers entry (pivot path when Pages Functions are unavailable).
// Static assets are served directly by Workers Static Assets; only /api/* and
// /assets/* are routed to this worker (run_worker_first in wrangler-workers.jsonc).
// The route handlers are the SAME modules used by the Pages Functions layout.

import { fail } from '../functions/_lib/util.js';
import { onRequestGet as healthGet } from '../functions/api/health.js';
import { onRequestPost as loginPost } from '../functions/api/auth/login.js';
import { onRequestPost as logoutPost } from '../functions/api/auth/logout.js';
import { onRequestGet as sessionGet } from '../functions/api/auth/session.js';
import { onRequestGet as dataGet, onRequestPut as dataPut } from '../functions/api/data.js';
import { onRequestGet as subsGet, onRequestPost as subsPost, onRequestDelete as subsDelete } from '../functions/api/submissions.js';
import { onRequestGet as backupsGet } from '../functions/api/backups/index.js';
import { onRequestPost as backupsRestorePost } from '../functions/api/backups/restore.js';
import { onRequestPost as uploadPost } from '../functions/api/upload.js';
import { onRequestGet as metaGet } from '../functions/api/meta.js';

function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function assetHandler({ request, env, params }) {
  const id = String(params.id || '');
  if (!/^[0-9a-f]{8}$/.test(id)) return new Response('Not found', { status: 404 });
  const raw = await env.STACKHK.get(`img:${id}`);
  if (!raw) return new Response('Not found', { status: 404 });
  let doc;
  try { doc = JSON.parse(raw); } catch (e) { return new Response('Not found', { status: 404 }); }
  return new Response(b64ToBytes(doc.b64), {
    headers: {
      'Content-Type': doc.mime,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

const routes = {
  'GET /api/health': healthGet,
  'POST /api/auth/login': loginPost,
  'POST /api/auth/logout': logoutPost,
  'GET /api/auth/session': sessionGet,
  'GET /api/data': dataGet,
  'PUT /api/data': dataPut,
  'POST /api/submissions': subsPost,
  'GET /api/submissions': subsGet,
  'DELETE /api/submissions': subsDelete,
  'GET /api/backups': backupsGet,
  'POST /api/backups/restore': backupsRestorePost,
  'POST /api/upload': uploadPost,
  'GET /api/meta': metaGet
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // /assets/<8-hex-id> — uploaded images
    const assetMatch = path.match(/^\/assets\/([0-9a-f]{8})$/);
    if (assetMatch) {
      if (request.method !== 'GET') return fail(405, 'METHOD', 'Method not allowed');
      return assetHandler({ request, env, params: { id: assetMatch[1] } });
    }

    const handler = routes[`${request.method} ${path}`];
    if (handler) {
      try {
        return await handler({ request, env, params: {}, ctx: {} });
      } catch (e) {
        return fail(500, 'INTERNAL', 'Internal error');
      }
    }

    return fail(404, 'NOT_FOUND', 'Not found');
  }
};
