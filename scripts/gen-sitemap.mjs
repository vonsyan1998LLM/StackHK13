#!/usr/bin/env node
// gen-sitemap.mjs — 从磁盘文件清单重新生成 sitemap.xml
// 规则：已收录的 URL 保留原 priority/changefreq（lastmod 刷为今天）；
//       新发现的 URL 按板块赋默认值；输出按"原顺序 + 新增追加"排列。
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'D:/web/StackHK13';
const BASE = 'https://www.airecmark.com';
const SECTIONS = ['reviews', 'saas', 'articles', 'compare', 'news', 'categories'];

// 新 URL 的默认约定（沿用现有 sitemap 的分级习惯）
function defaults(p) {
  if (p === 'index.html') return { cf: 'daily', pr: '1.0' };
  if (['reviews.html', 'saas.html', 'tools.html', 'news.html'].includes(p)) return { cf: 'daily', pr: '0.9' };
  if (p.startsWith('news/')) return { cf: 'weekly', pr: '0.7' };
  if (p.startsWith('categories/')) return { cf: 'weekly', pr: '0.7' };
  if (p.startsWith('reviews/') || p.startsWith('saas/')) return { cf: 'monthly', pr: '0.8' };
  if (['ranking.html', 'glossary.html', 'about.html'].includes(p)) return { cf: 'monthly', pr: '0.6' };
  return { cf: 'weekly', pr: '0.6' };
}

// 1) 解析现有 sitemap，保留分级约定
const xml = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const re = /<url><loc>([^<]+)<\/loc><lastmod>[^<]*<\/lastmod><changefreq>([^<]*)<\/changefreq><priority>([^<]*)<\/priority><\/url>/g;
const oldOrder = [];
const map = {};
let m;
const norm = loc => loc.endsWith('/index.html') ? BASE + '/' : loc; // 首页统一为裸路径
while ((m = re.exec(xml)) !== null) {
  const loc = norm(m[1]);
  oldOrder.push(loc);
  map[loc] = { cf: m[2], pr: m[3] };
}

// 2) 扫描磁盘
const files = [];
for (const f of fs.readdirSync(ROOT).filter(f => f.endsWith('.html'))) files.push(f);
for (const s of SECTIONS) {
  for (const f of fs.readdirSync(path.join(ROOT, s)).filter(f => f.endsWith('.html'))) files.push(s + '/' + f);
}
const onDisk = new Set(files.map(f => BASE + '/' + f));
onDisk.add(BASE + '/'); // 首页以裸路径收录
const locOf = f => f === 'index.html' ? BASE + '/' : BASE + '/' + f;

// 3) 合成：原有顺序优先（仅保留仍存在的），新增按板块追加
const kept = oldOrder.filter(loc => onDisk.has(loc)).map(loc => ({ loc, ...map[loc] }));
const added = files
  .map(f => locOf(f))
  .filter(loc => !map[loc] && loc !== BASE + '/')
  .map(loc => ({ loc, ...defaults(loc.replace(BASE + '/', '')) }));

const today = new Date().toISOString().slice(0, 10);
const all = [...kept, ...added];
const out = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
  + all.map(u => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><changefreq>${u.cf}</changefreq><priority>${u.pr}</priority></url>`).join('\n')
  + `\n</urlset>\n`;

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), out);
console.log(`sitemap: 保留 ${kept.length} · 新增 ${added.length} · 共 ${all.length} URL`);
if (added.length) console.log('新增:\n' + added.map(a => '  + ' + a.loc.replace(BASE, '') + ` (${a.cf}/${a.pr})`).join('\n'));
const dropped = oldOrder.filter(loc => !onDisk.has(loc));
if (dropped.length) console.log('移除（文件已不存在）:\n' + dropped.map(d => '  - ' + d).join('\n'));
