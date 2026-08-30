// Fix og:image on reviews/ + saas/ pages: map to per-tool hero images where they exist.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
const ROOT = "D:/web/StackHK13";
const SITE = "https://www.airecmark.com";

function heroFor(slug) {
  for (const ext of ["jpg", "png", "jpeg", "webp"]) {
    const rel = `images/${slug}-hero.${ext}`;
    if (existsSync(join(ROOT, rel))) return `${SITE}/${rel}`;
  }
  return null;
}

let fixed = 0, missing = 0;
for (const dir of ["reviews", "saas"]) {
  for (const f of readdirSync(join(ROOT, dir)).filter(x => x.endsWith(".html"))) {
    const slug = f.replace("-review.html", "").replace(".html", "");
    const p = join(ROOT, dir, f);
    let html = readFileSync(p, "utf8");
    const hero = heroFor(slug);
    if (!hero) { missing++; continue; }
    const m = html.match(/<meta property="og:image" content="([^"]*)">/);
    if (m) {
      if (m[1] === hero) continue;
      html = html.split(m[0]).join(`<meta property="og:image" content="${hero}">`);
    } else {
      html = html.replace(/(<meta property="og:type" content="[^"]*">)/, `$1\n<meta property="og:image" content="${hero}">`);
    }
    writeFileSync(p, html);
    fixed++;
    console.log(`${dir}/${f}: og:image -> ${hero.split("/").pop()}`);
  }
}
console.log(`done. fixed=${fixed} no-hero=${missing}`);
