// P0b: repair news byline dates + backfill datePublished/dateModified in NewsArticle JSON-LD.
// Cases: proper "Aug 26, 2026" (keep); malformed "Aug 2026, 2026" -> "Aug 2026" + month ISO;
// relative "3d ago, 2026" -> git add date (real publish day).
// Usage: node scripts/fix-p0b.mjs
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

const ROOT = "D:/web/StackHK13";
const M = { jan:"01",feb:"02",mar:"03",apr:"04",may:"05",jun:"06",jul:"07",aug:"08",sep:"09",oct:"10",nov:"11",dec:"12" };

const gitDate = (f) => execSync(`git log --diff-filter=A --format=%as -- "${f}"`, { cwd: ROOT }).toString().trim().split("\n").pop();
const fmt = (iso) => { const [y,m,d] = iso.split("-"); return `${Object.keys(M).find(k => M[k] === m)}, ${d}, ${y}`.replace(/^(\w+)/, w => w[0].toUpperCase() + w.slice(1)); };

let nFixed = 0;
for (const f of readdirSync(join(ROOT, "news")).filter(x => x.endsWith(".html")).sort()) {
  const rel = `news/${f}`;
  const p = join(ROOT, rel);
  let html = readFileSync(p, "utf8");

  const byRe = /(<div class="news-byline">[\s\S]*?<span>Updated )([^<]*)(<\/span><\/div>)/;
  const bm = html.match(byRe);
  if (!bm) { console.log(`${rel}: NO BYLINE`); continue; }
  const cur = bm[2];
  let dateISO = null, visible = cur;

  const full = cur.match(/^([A-Z][a-z]{2,8})\s+(\d{1,2}),\s*(\d{4})$/);
  const monthOnly = cur.match(/^([A-Z][a-z]{2,8})\s+(\d{4}),\s*\d{4}$/);
  const relTime = cur.match(/^(\d+[hd])\s+ago,\s*(\d{4})$/i);
  if (full) {
    dateISO = `${full[3]}-${M[full[1].slice(0,3).toLowerCase()]}-${full[2].padStart(2, "0")}`;
  } else if (monthOnly) {
    visible = `Aug ${monthOnly[2]}`.replace(/^Aug/, full0(monthOnly[1]));
    dateISO = `${monthOnly[2]}-${M[monthOnly[1].slice(0,3).toLowerCase()]}`;
  } else if (relTime) {
    const g = gitDate(rel);
    if (!g) { console.log(`${rel}: NO GIT DATE for "${cur}"`); continue; }
    visible = fmt(g);
    dateISO = g;
  } else {
    console.log(`${rel}: UNPARSED "${cur}"`); continue;
  }

  if (visible !== cur) html = html.replace(byRe, `$1${visible}$3`);
  if (!html.includes('"datePublished"')) {
    html = html.replace(/("mainEntityOfPage":)/, `"datePublished":"${dateISO}","dateModified":"${dateISO}",$1`);
  }
  writeFileSync(p, html);
  nFixed++;
  console.log(`${rel}: "${cur}" -> visible="${visible}" datePublished=${dateISO}`);
}
console.log(`done: ${nFixed} files`);
function full0(m) { const names = { Jan:"Jan",Feb:"Feb",Mar:"Mar",Apr:"Apr",May:"May",Jun:"Jun",Jul:"Jul",Aug:"Aug",Sep:"Sep",Oct:"Oct",Nov:"Nov",Dec:"Dec" }; return names[m] || m; }
