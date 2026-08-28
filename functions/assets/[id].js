// Serves uploaded images stored under img:<id> with immutable caching.

import { b64ToBytes } from '../_lib/util.js';

export async function onRequestGet({ params, env }) {
  const id = String(params.id || '');
  if (!/^[0-9a-f]{8}$/.test(id)) return new Response('Not found', { status: 404 });

  const raw = await env.STACKHK.get(`img:${id}`);
  if (!raw) return new Response('Not found', { status: 404 });

  let doc;
  try {
    doc = JSON.parse(raw);
  } catch (e) {
    return new Response('Not found', { status: 404 });
  }

  const bytes = b64ToBytes(doc.b64);
  return new Response(bytes, {
    headers: {
      'Content-Type': doc.mime,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}
