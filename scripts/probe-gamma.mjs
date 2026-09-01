import { readFileSync } from "node:fs";
const g = readFileSync("reviews/gamma.html", "utf8");
for (const pat of ["generous free tier (400 credits", "limited AI credits and a set number of presentations"]) {
  const n = (g.match(new RegExp(pat.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
  console.log("[" + n + "x] " + pat);
}
// show both variants contexts
let idx = 0;
while ((idx = g.indexOf("Is Gamma free to use", idx)) !== -1) {
  const seg = g.slice(idx, idx + 400);
  const ans = seg.match(/"text": "([^"]{0,200})/);
  console.log("  FAQ# at " + idx + ":", ans ? ans[1].slice(0, 120) : "?");
  idx += 20;
}
