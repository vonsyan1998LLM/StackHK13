// og:image pass 2: alias hero names + correct category fallbacks for the 31 mismatched files.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
const ROOT = "D:/web/StackHK13";
const SITE = "https://www.airecmark.com";

const ALIAS = {
  "copy-ai": "copyai", "make-com": "make", "leonardo-ai": "leonardo", "adobe-firefly": "firefly",
  "midjourney-v7": "midjourney", "perplexity-pro": "perplexity", "notion-ai": "notion",
  "elevenlabs-v2": "elevenlabs", "voiceappear": "voiceappear", "julius-ai": "julius",
  "chatgpt-4o": "chatgpt", "claude-pro": "claude", "claude-3-5-haiku": "claude",
  "gemini-2-0-pro": "gemini", "suno-ai": "suno", "kling-ai": "kling", "gamma": "gamma",
  "grok": "grok", "deepseek": "deepseek", "sora": "sora", "veo": "veo", "flux": "flux",
};
const CAT_FALLBACK = {
  image: "best-image-tools-hero.jpg", coding: "best-coding-tools-hero.jpg",
  writing: "best-writing-tools-hero.jpg", audio: "best-audio-tools-hero.jpg",
  video: "best-ai-video-tools-2026-hero.jpg", productivity: "best-productivity-tools-hero.jpg",
  business: "best-business-tools-hero.jpg",
};
const CAT_OF = {
  "adobe-firefly": "image", "midjourney-v7": "image", "stable-diffusion": "image", "flux": "image", "runway-ml": "image", "leonardo-ai": "image",
  "github-copilot": "coding", "llama-3-3": "coding", "copilot-vision": "coding", "cline": "coding", "windsurf": "coding", "cursor-ai": "coding", "replit-agent": "coding",
  "claude-pro": "writing", "claude-3-5-haiku": "writing", "grammarly-ai": "writing", "grammarly-vs-prowritingaid": "writing", "jasper": "writing", "copy-ai": "writing",
  "elevenlabs-v2": "audio", "voiceappear": "audio", "suno-ai": "audio",
  "sora": "video", "veo": "video", "kling-ai": "video",
  "chatgpt-4o": "productivity", "deepseek": "productivity", "grok": "productivity", "gemini-2-0-pro": "productivity", "perplexity-pro": "productivity", "notion-ai": "productivity", "gamma": "productivity", "julius-ai": "business",
};

function findHero(slug) {
  const names = [slug, ALIAS[slug]].filter(Boolean);
  for (const n of names) {
    for (const ext of ["jpg", "png", "jpeg", "webp"]) {
      const rel = `images/${n}-hero.${ext}`;
      if (existsSync(join(ROOT, rel))) return `${SITE}/${rel}`;
    }
  }
  const cat = CAT_OF[slug];
  if (cat && CAT_FALLBACK[cat] && existsSync(join(ROOT, "images", CAT_FALLBACK[cat]))) return `${SITE}/images/${CAT_FALLBACK[cat]}`;
  return null;
}

let fixed = 0;
for (const slug of Object.keys(CAT_OF)) {
  const base = slug === "grammarly-vs-prowritingaid" ? "grammarly-vs-prowritingaid" : slug;
  const f = `reviews/${base}.html`;
  const p = join(ROOT, f);
  if (!existsSync(p)) continue;
  let html = readFileSync(p, "utf8");
  const hero = findHero(slug);
  if (!hero) { console.log(`${f}: no candidate`); continue; }
  const m = html.match(/<meta property="og:image" content="([^"]*)">/);
  if (m && m[1] === hero) continue;
  if (m) html = html.split(m[0]).join(`<meta property="og:image" content="${hero}">`);
  else html = html.replace(/(<meta property="og:type" content="[^"]*">)/, `$1\n<meta property="og:image" content="${hero}">`);
  writeFileSync(p, html);
  fixed++;
  console.log(`${f}: -> ${hero.split("/").pop()}`);
}
console.log("done", fixed);
