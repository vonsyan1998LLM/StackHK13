// SVG captcha for the admin login form.
// GET /api/auth/captcha -> { id, svg }
// One-time use: login deletes the KV key after checking. TTL 5 min.
// Self-contained (no third-party service): KV-backed challenge, random distortion per char.
import { json, fail, randomHex } from '../../_lib/util.js';
import { rateLimit } from '../../_lib/ratelimit.js';

// Unambiguous charset (no 0/O/1/l/I)
const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
const FILLS = ['#f5a623', '#e8ebf1', '#7dd3fc', '#86efac', '#fda4af', '#c4b5fd'];
const FONTS = ['Playfair Display, serif', 'DM Sans, sans-serif', 'DM Mono, monospace'];

function buildSvg(text) {
  const W = 150, H = 46;
  const parts = [];
  // noise: curved paths
  for (let i = 0; i < 3; i++) {
    const x1 = Math.random() * W, y1 = Math.random() * H;
    const cx = Math.random() * W, cy = Math.random() * H;
    const x2 = Math.random() * W, y2 = Math.random() * H;
    parts.push(`<path d="M${x1.toFixed(1)},${y1.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}" stroke="${FILLS[i % FILLS.length]}" stroke-width="1" fill="none" opacity=".45"/>`);
  }
  // noise dots
  for (let i = 0; i < 26; i++) {
    parts.push(`<circle cx="${(Math.random() * W).toFixed(1)}" cy="${(Math.random() * H).toFixed(1)}" r="${(Math.random() * 1.4 + .5).toFixed(1)}" fill="${FILLS[Math.floor(Math.random() * FILLS.length)]}" opacity=".4"/>`);
  }
  // chars
  let x = 16;
  for (const ch of text) {
    const y = H / 2 + (Math.random() * 10 - 5);
    const rot = (Math.random() * 36 - 18).toFixed(1);
    const size = 24 + Math.floor(Math.random() * 7);
    const fill = FILLS[Math.floor(Math.random() * FILLS.length)];
    const font = FONTS[Math.floor(Math.random() * FONTS.length)];
    parts.push(`<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" transform="rotate(${rot} ${x.toFixed(1)} ${y.toFixed(1)})" font-family="${font}" font-size="${size}" font-weight="700" fill="${fill}">${ch}</text>`);
    x += 24 + Math.random() * 6;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="captcha"><rect width="${W}" height="${H}" rx="8" fill="#161a21"/>${parts.join('')}</svg>`;
}

export async function onRequestGet({ request, env }) {
  if (!env.STACKHK) return fail(500, 'CONFIG', 'KV binding STACKHK is missing');
  if (!(await rateLimit(env, request, env.ADMIN_SESSION_SECRET || 'shk', 'captcha', 20))) {
    return fail(429, 'RATE_LIMIT', 'Too many requests. Try again in a minute.');
  }
  let text = '';
  for (let i = 0; i < 5; i++) text += CHARS[Math.floor(Math.random() * CHARS.length)];
  const id = randomHex(12);
  await env.STACKHK.put(`captcha:${id}`, text.toLowerCase(), { expirationTtl: 300 });
  return json({ id, svg: buildSvg(text) }, 200, { 'Cache-Control': 'no-store' });
}
