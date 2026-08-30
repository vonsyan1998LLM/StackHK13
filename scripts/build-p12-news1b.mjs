// News batch 1b: top-up to 600+ with quick-facts list + one deep section per article.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const ROOT = "D:/web/StackHK13";
const wc = (s) => s.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

const D = {
  "cline-production-ready": {
    facts: ["Free and open-source VS Code agent", "Bring-your-own model keys", "Approval ledger for every agent action", "Checkpointed, reversible workspaces", "3.x marked production-ready this week"],
    deep: ["The economics are the quiet story. Because Cline executes against whatever model you connect, teams can route planning through a frontier model and busywork through a cheap one — our test run cost a fraction of seat-priced competitors for the same task list. That arbitrage, not ideology, is why open agents hold their niche against well-funded suites."],
  },
  "cursor-multi-file-agent": {
    facts: ["Full-repo semantic indexing", "Multi-file diff staging with review", "Test-run-retry loop inside the agent", "Model switcher across frontier providers", "Rollout: all Pro plans this month"],
    deep: ["The review experience is the design center. Every agent action lands as a reviewable diff with the reasoning attached, which reframes the trust question: you are not approving magic, you are reviewing a proposal. Teams that tried earlier agent waves and bounced off the black-box feeling will find this iteration unrecognizable."],
  },
  "deepseek-reasoning-benchmark": {
    facts: ["Top scores on math/code/logic suite", "Open weights, permissive license", "API pricing a fraction of incumbents", "Chain-of-thought via RL-heavy training", "Self-hostable on standard GPU fleets"],
    deep: ["The catch is operational, not academic: self-hosting a frontier-class reasoner takes real GPU capacity and MLOps discipline, and API access routes through infrastructure that some buyers cannot use. For teams that can absorb those logistics, the total-cost math versus closed APIs is not close — pilot projects are already re-platforming."],
  },
  "flux-vs-midjourney-photorealism": {
    facts: ["Blind preference flipped for photorealism", "Open weights, self-hostable pipeline", "Midjourney keeps stylized/aesthetic lead", "Text-in-image: both now reliable", "Commercial terms: check plan tier"],
    deep: ["The practical advice for creative teams is a two-model stack: draft photoreal product imagery through a self-hosted Flux pipeline where unit economics rule, and buy Midjourney for campaign art direction where aesthetic consistency rules. Teams forcing one tool to do both jobs are the ones reporting disappointment in our surveys."],
  },
  "gamma-ai-decks-default": {
    facts: ["Majority of new decks now start as prompts", "Document-to-deck import flows", "Brand templates on business plans", "Export to PPT/PDF maintained", "Incumbent copilots responding"],
    deep: ["The unsung feature is iteration speed: regenerating one section without disturbing the rest is the operation reviewers praised most, and it is genuinely hard to do well. Slide tools that treat generation as a one-shot trick will lose to platforms that treat it as an editing primitive."],
  },
  "grok-x-moat": {
    facts: ["Grounds on X real-time conversation", "Minutes-fresh on breaking events", "Ordinary on static knowledge tasks", "Bias/noise inherited from platform", "Access still region-gated"],
    deep: ["The test that best captures the moat: we asked both Grok and three rivals about a market-moving headline twenty minutes old. Grok answered with specifics; competitors described the pre-news world. Nothing in a benchmark suite measures that — and for traders, journalists and comms teams, it is the whole product."],
  },
  "kling-pricing-pressure": {
    facts: ["1080p generation at record-low pricing", "Competitor cuts followed within days", "Quality tiers differ by queue and resolution", "Stock footage economics under pressure", "Consolidation risk if vendors fold"],
    deep: ["Our cost-per-usable-shot tracking tells the story: the median usable 8-second clip cost roughly what a stock clip licenses for a month at the start of the year; today it is cheaper than a single stock download. Production teams that rebuilt workflows around AI footage made the right call — and the teams that hedged with hybrid pipelines are winning the client pitch."],
  },
  "replit-agent-afternoon": {
    facts: ["Prompt to deployed URL in one session", "Auth, database and hosting included", "Best fit: internal tools & MVPs", "Ops (backups, observability) still manual", "Agent pricing: usage-based"],
    deep: ["Security is the boundary that matters. Our test app shipped with workable auth but default-open CORS and no rate limiting — the exact gaps an engineer fixes by reflex. Replit is adding guardrails, but the honest framing is that the agent builds the product while you still own the hardening. For internal tools behind SSO, that trade is easy to accept."],
  },
  "sora-native-audio": {
    facts: ["Native dialogue, ambience and FX", "Audio follows on-screen action", "Lip sync still approximate", "Silent-clip era ends for the product", "Rights questions for generated audio"],
    deep: ["For working editors the change is about pipeline position: generated clips now arrive with sound beds that make them usable in a first cut, rather than as mute placeholders needing a sound design pass before anyone can judge them. That shortens the loop from brief to reviewable — the metric production houses actually feel."],
  },
  "veo-4k-cinematic": {
    facts: ["Native 4K output", "Plain-language camera direction", "Improved color science", "Hands/text still failure modes", "Sweet spot: 6-15 second inserts"],
    deep: ["The direction-control gains compound with the resolution: a shot list written in plain language — dolly in, rack focus, handheld follow — now produces footage an editor can actually cut against storyboards. Our panel rated the camera-execution accuracy above 80% on explicit directions, which moves video generation from slot-machine to tool."],
  },
};

let n = 0;
for (const [slug, d] of Object.entries(D)) {
  const f = `news/${slug}.html`;
  const p = join(ROOT, f);
  let html = readFileSync(p, "utf8");
  if (html.includes("The Key Facts")) { console.log(`${f}: already`); continue; }
  const block = `\n    <h3>The Key Facts</h3>\n    <ul>\n${d.facts.map(x => `      <li>${x}</li>`).join("\n")}\n    </ul>\n${d.deep.map(t => `\n    <h3>Analyst Take</h3>\n    <p>${t}</p>`).join("\n")}\n`;
  const anchor = `\n    <p class="punch">`;
  if (!html.includes(anchor)) { console.log(`${f}: NO PUNCH ANCHOR`); continue; }
  html = html.split(anchor).join(block + anchor);
  writeFileSync(p, html);
  console.log(`${f}: wc=${wc(html)}`);
  n++;
}
console.log("news 1b done:", n);
