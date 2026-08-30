// Full-site content audit against admin/standards v2 requirements.
// Usage: node scripts/audit-content.mjs
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "D:/web/StackHK13";
const list = (dir) => readdirSync(join(ROOT, dir)).filter(f => f.endsWith(".html")).map(f => `${dir}/${f}`);

const read = (f) => readFileSync(join(ROOT, f), "utf8");
const words = (html) => html
  .replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ")
  .split(/\s+/).filter(Boolean).length;

function jsonlds(html) {
  const out = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try { out.push(JSON.parse(m[1])); } catch { out.push({ __parse_error: true }); }
  }
  return out;
}
const ldType = (lds, t) => lds.filter(l => (Array.isArray(l) ? l : [l]).some(x => (x["@type"] || "").includes(t)));
const faqCount = (lds) => {
  for (const l of ldType(lds, "FAQPage")) {
    const page = (Array.isArray(l) ? l : [l]).find(x => (x["@type"] || "").includes("FAQPage"));
    if (page?.mainEntity) return page.mainEntity.length;
  }
  return 0;
};
const has = (html, re) => re.test(html);
const imgRefs = (html) => [...html.matchAll(/(?:src|href)="(images\/[^"]+)"/g)].map(m => m[1].split("?")[0]);

const R = [];
function audit(file, channel, checks) {
  const html = read(file);
  const lds = jsonlds(html);
  const fails = [];
  for (const [name, ok] of checks(html, lds)) if (!ok) fails.push(name);
  // universal: broken image refs
  const broken = [...new Set(imgRefs(html))].filter(p => !existsSync(join(ROOT, p)));
  if (broken.length) fails.push(`broken-img(${broken.length}): ${broken.slice(0, 2).join(",")}`);
  // universal: canonical + og
  if (!has(html, /rel="canonical"/)) fails.push("no-canonical");
  if (!has(html, /property="og:/)) fails.push("no-og");
  R.push({ file, channel, wc: words(html), faq: faqCount(lds), fails });
}

// ---------- SaaS: v2 详细版 ----------
for (const f of list("saas")) audit(f, "saas", (html, lds) => [
  ["dim-table", has(html, /dim-table/)],
  ["how-tested", has(html, /How We Tested/i)],
  ["verdict-box", has(html, /verdict-box/)],
  ["disclosure", has(html, /Disclosur/i)],
  ["faq-ld", ldType(lds, "FAQPage").length > 0],
  ["faq>=5", faqCount(lds) >= 5],
  ["breadcrumb", ldType(lds, "BreadcrumbList").length > 0],
  ["compare-table", has(html, /compare-table|Quick Comparison/i)],
  ["wc>=1500", null], // replaced below
].map(([n, v]) => n === "wc>=1500" ? [n, words(html) >= 1500] : [n, v]));

// ---------- AI reviews: v2 ----------
for (const f of list("reviews")) audit(f, "ai-review", (html, lds) => {
  const risks = (html.match(/<li[^>]*>(?:(?!<\/li>)[\s\S])*?<\/li>/g) || []).filter(li => {
    // count list items under the Risks heading only (rough): fall back to marker presence
    return false;
  }).length;
  return [
    ["dim-table", has(html, /dim-table/)],
    ["testing-process", has(html, /Our Testing Process|How We Tested/i)],
    ["risks", has(html, /Risks We Found/i)],
    ["privacy", has(html, /Privacy (&amp;|&) Security/i)],
    ["faq-ld", ldType(lds, "FAQPage").length > 0],
    ["faq>=5", faqCount(lds) >= 5],
    ["breadcrumb", ldType(lds, "BreadcrumbList").length > 0],
    ["verdict-box", has(html, /verdict-box/)],
    ["wc>=1200", words(html) >= 1200],
  ];
});

// ---------- Guides: best-* = roundup v2; 其它 = 升级版检查 ----------
for (const f of list("articles")) {
  const isRoundup = /best-/.test(f);
  audit(f, isRoundup ? "guide-roundup" : "guide-other", (html, lds) => {
    const base = [
      ["how-tested", has(html, /How We Tested|How to Choose/i)],
      ["trust-box", has(html, /trust-box|Why You Should Trust/i)],
      ["faq-ld", ldType(lds, "FAQPage").length > 0],
      ["breadcrumb", ldType(lds, "BreadcrumbList").length > 0],
    ];
    if (isRoundup) return [
      ["shortlist", has(html, /shortlist|Shortlist|Quick Comparison/i)],
      ["pick-card", has(html, /pick-card|pick-card|Pros|Cons/)],
      ...base,
      ["faq>=3", faqCount(lds) >= 3],
      ["wc>=1500", words(html) >= 1500],
    ];
    return [...base, ["wc>=800", words(html) >= 800]];
  });
}

// ---------- News: v2 editorial ----------
for (const f of list("news")) audit(f, "news", (html, lds) => [
  ["deck", has(html, /news-deck/)],
  ["punch", has(html, /punch/i)],
  ["reaction", has(html, /Media (&amp;|&) Industry Reaction|reaction/i)],
  ["news-ld", ldType(lds, "NewsArticle").length > 0],
  ["breadcrumb", ldType(lds, "BreadcrumbList").length > 0],
  ["any-ld", lds.length > 0],
]);

// ---------- Compare: v2 benchmark ----------
for (const f of list("compare")) audit(f, "compare", (html, lds) => [
  ["quick-verdict", has(html, /Quick Verdict|TL;DR/i)],
  ["dim-table", has(html, /dim-table/)],
  ["choose", has(html, /Choose/i)],
  ["faq-ld", ldType(lds, "FAQPage").length > 0],
  ["faq>=4", faqCount(lds) >= 4],
  ["breadcrumb", ldType(lds, "BreadcrumbList").length > 0],
  ["wc>=2000", words(html) >= 2000],
]);

// ---------- output ----------
const byChannel = {};
for (const r of R) (byChannel[r.channel] ??= []).push(r);
let badTotal = 0;
for (const [ch, rows] of Object.entries(byChannel)) {
  const bad = rows.filter(r => r.fails.length);
  badTotal += bad.length;
  console.log(`\n### ${ch}: ${rows.length} 篇, ${bad.length} 篇有问题`);
  for (const r of bad) console.log(`  ${r.file}  [${r.fails.join(" | ")}] (wc=${r.wc}, faq-ld=${r.faq})`);
}
console.log(`\n===== 总计: ${R.length} 篇, ${badTotal} 篇未达标 =====`);
