// Fixed-window rate limiter backed by KV.
// KV has no atomic counter, so concurrent requests can under-count; that slack is
// acceptable for abuse protection (the real brake is the 60s window itself).

import { sha256Hex } from './util.js';

export async function rateLimit(env, request, secret, bucket, limit, windowSeconds = 60) {
  if (!env.STACKHK) return true; // no KV: fail open, health checks will flag the binding
  const ip = await sha256Hex(`${secret}:${request.headers.get('CF-Connecting-IP') || 'unknown'}`);
  const minute = Math.floor(Date.now() / (windowSeconds * 1000));
  const key = `rl:${bucket}:${ip}:${minute}`;
  const current = parseInt((await env.STACKHK.get(key)) || '0', 10);
  if (current >= limit) return false;
  await env.STACKHK.put(key, String(current + 1), { expirationTtl: windowSeconds * 2 });
  return true;
}
