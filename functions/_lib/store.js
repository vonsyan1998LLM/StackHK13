// KV persistence for the site content document.
//   site:data          — the live document (same shape as api-seed.json)
//   site:meta          — {version, at, by, backups}
//   backup:site:<ts>   — rolling snapshots, newest kept, pruned to KEEP_BACKUPS

import { normalizeSiteData } from './validate.js';

export const SITE_KEY = 'site:data';
export const META_KEY = 'site:meta';
const BACKUP_PREFIX = 'backup:site:';
const KEEP_BACKUPS = 20;

export function emptySiteData() {
  return { settings: {}, tools: [], news: [], courses: [], guides: [], logos: [] };
}

export async function readMeta(env) {
  const raw = await env.STACKHK.get(META_KEY);
  return raw ? JSON.parse(raw) : { version: 0, at: null, by: null, backups: 0 };
}

// Live document from KV; falls back to the bundled api-seed.json asset when the
// KV key has never been written, so a cold deployment still serves full data.
export async function readSiteData(env) {
  if (env.STACKHK) {
    const raw = await env.STACKHK.get(SITE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) { /* corrupted value: fall through to seed */ }
    }
  }
  try {
    const asset = await env.ASSETS.fetch(new URL('/api-seed.json', 'https://local'));
    if (asset.ok) return await asset.json();
  } catch (e) { /* no seed available */ }
  return emptySiteData();
}

// Validate, snapshot the current value, then persist the new one.
export async function writeSiteData(env, body, username) {
  const data = normalizeSiteData(body);

  const previous = await env.STACKHK.get(SITE_KEY);
  const meta = await readMeta(env);
  const ts = new Date().toISOString().replace(/[:.]/g, '-');

  if (previous) {
    await env.STACKHK.put(`${BACKUP_PREFIX}${ts}`, previous, { expirationTtl: 60 * 60 * 24 * 30 });
    meta.backups += 1;
  }

  await env.STACKHK.put(SITE_KEY, JSON.stringify(data));
  meta.version += 1;
  meta.at = new Date().toISOString();
  meta.by = username;
  await env.STACKHK.put(META_KEY, JSON.stringify(meta));

  await pruneBackups(env);
  return { data, meta };
}

export async function listBackups(env) {
  const list = await env.STACKHK.list({ prefix: BACKUP_PREFIX, limit: 100 });
  const keys = list.keys.map(k => k.name).sort().reverse();
  const out = [];
  for (const name of keys) {
    const raw = await env.STACKHK.get(name);
    if (!raw) continue;
    let doc;
    try { doc = JSON.parse(raw); } catch (e) { continue; }
    out.push({
      key: name,
      timestamp: name.slice(BACKUP_PREFIX.length),
      tools: Array.isArray(doc.tools) ? doc.tools.length : 0,
      news: Array.isArray(doc.news) ? doc.news.length : 0
    });
  }
  return out;
}

export async function restoreBackup(env, timestamp, username) {
  const raw = await env.STACKHK.get(`${BACKUP_PREFIX}${timestamp}`);
  if (!raw) return null;
  const doc = JSON.parse(raw);

  const current = await env.STACKHK.get(SITE_KEY);
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  if (current) {
    await env.STACKHK.put(`${BACKUP_PREFIX}${ts}`, current, { expirationTtl: 60 * 60 * 24 * 30 });
  }

  await env.STACKHK.put(SITE_KEY, JSON.stringify(doc));
  const meta = await readMeta(env);
  meta.version += 1;
  meta.at = new Date().toISOString();
  meta.by = `${username} (restore)`;
  await env.STACKHK.put(META_KEY, JSON.stringify(meta));
  return { meta };
}

async function pruneBackups(env) {
  const list = await env.STACKHK.list({ prefix: BACKUP_PREFIX, limit: 100 });
  const keys = list.keys.map(k => k.name).sort().reverse();
  for (const name of keys.slice(KEEP_BACKUPS)) {
    await env.STACKHK.delete(name);
  }
}
