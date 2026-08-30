// P0 fixes (zero-writing):
// 1) news/*.html — inject OG tags + NewsArticle & BreadcrumbList JSON-LD (template-level gap)
// 2) reviews/*.html (19 upgraded) — give the Final Verdict box the standard verdict-box class + gold accent
// Usage: node scripts/fix-p0.mjs
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = "D:/web/StackHK13";
const SITE = "https://www.airecmark.com";
const MONTHS = { jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12 };
const strip = (s) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&rsaquo;/g, "›").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
const jstr = (s) => JSON.stringify(s);

function fixNews(file) {
  const p = join(ROOT, file);
  let html = readFileSync(p, "utf8");
  if (html.includes('property="og:')) return `${file}: skip (has OG)`;

  const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1]?.trim() || "";
  const headline = title.replace(/ — StackHK.*$/, "").trim();
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "";
  const canon = (html.match(/rel="canonical" href="([^"]+)"/) || [])[1] || `${SITE}/${file}`;
  const h1 = strip((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || headline);
  const heroRel = (html.match(/src="(\.\.\/images\/news\/[^"]+\.jpg)"/) || [])[1];
  const heroAbs = heroRel ? `${SITE}/${heroRel.replace("../", "")}` : null;

  const dm = strip(html).match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2}),\s+(202[4-6])\b/i);
  let dateISO = null;
  if (dm) {
    const mon = MONTHS[dm[1].slice(0, 3).toLowerCase()];
    dateISO = `${dm[3]}-${String(mon).padStart(2, "0")}-${dm[2].padStart(2, "0")}`;
  }

  const og = [
    `<meta property="og:type" content="article">`,
    `<meta property="og:site_name" content="StackHK">`,
    `<meta property="og:title" content="${headline.replace(/"/g, "&quot;")}">`,
    `<meta property="og:description" content="${desc.replace(/"/g, "&quot;")}">`,
    `<meta property="og:url" content="${canon}">`,
    heroAbs ? `<meta property="og:image" content="${heroAbs}">` : null,
  ].filter(Boolean).join("\n");

  const news = { "@context": "https://schema.org", "@type": "NewsArticle",
    headline: h1 || headline, description: desc,
    ...(heroAbs ? { image: [heroAbs] } : {}),
    ...(dateISO ? { datePublished: dateISO, dateModified: dateISO } : {}),
    author: { "@type": "Organization", name: "StackHK", url: SITE },
    publisher: { "@type": "Organization", name: "StackHK", url: SITE },
    mainEntityOfPage: canon };
  const crumb = { "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "AI News", item: `${SITE}/news.html` },
      { "@type": "ListItem", position: 3, name: h1 || headline }] };

  const inject = `${og}\n<script type="application/ld+json">\n${JSON.stringify(news)}\n</script>\n<script type="application/ld+json">\n${JSON.stringify(crumb)}\n</script>`;
  html = html.replace(/(<link rel="canonical" href="[^"]+">)/, `$1\n${inject}`);
  writeFileSync(p, html);
  return `${file}: og+ld ok${dateISO ? "" : " (NO DATE FOUND)"}${heroAbs ? "" : " (NO HERO IMG)"}`;
}

function fixAiVerdict(file) {
  const p = join(ROOT, file);
  let html = readFileSync(p, "utf8");
  if (html.includes('class="verdict-box"')) return `${file}: skip (has verdict-box)`;
  const re = /<div style="background:var\(--black\);color:#fff;border-radius:var\(--radius-lg\);padding:2rem;margin:2rem 0">(\s*<!-- Final Verdict -->)?/;
  if (!re.test(html)) return `${file}: PATTERN NOT FOUND`;
  html = html.replace(re,
    '<div class="verdict-box" style="background:var(--black);color:#fff;border-radius:var(--radius-lg);padding:2rem;margin:2rem 0;border-left:4px solid var(--gold)">$1');
  writeFileSync(p, html);
  return `${file}: verdict-box ok`;
}

const out = [];
for (const f of readdirSync(join(ROOT, "news")).filter(x => x.endsWith(".html")).map(x => `news/${x}`)) out.push(fixNews(f));
for (const f of readdirSync(join(ROOT, "reviews")).filter(x => x.endsWith(".html")).map(x => `reviews/${x}`)) out.push(fixAiVerdict(f));
console.log(out.join("\n"));
