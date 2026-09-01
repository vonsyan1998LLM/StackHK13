import { readFileSync } from "node:fs";
const g = readFileSync("reviews/gamma.html", "utf8");
for (const idx of [25471, 27234]) {
  console.log("=== around " + idx + ":");
  console.log(g.slice(idx, idx + 500).replace(/\s+/g, " ").slice(0, 320));
  console.log("");
}
// where is the "generous free tier" answer?
const gi = g.indexOf("generous free tier (400 credits");
console.log("=== 'generous free tier' answer context at " + gi + ":");
console.log(g.slice(Math.max(0, gi - 200), gi + 200).replace(/\s+/g, " ").slice(0, 300));
