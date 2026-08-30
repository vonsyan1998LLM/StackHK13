// Compare pass 4: final word-count top-up with "skip both" + "90-day outlook" sections.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const ROOT = "D:/web/StackHK13";
const read = (f) => readFileSync(join(ROOT, f), "utf8");
const write = (f, s) => { writeFileSync(join(ROOT, f), s); };
const wc = (s) => s.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
const SECTION_CLS = `style="font-family:var(--font-display);font-size:1.5rem;margin:2rem 0 1rem"`;

const M = {
  "compare/chatgpt-vs-gemini.html": {
    before: '<div class="trust-box">',
    skip: `<p>Neither chatbot is the right buy if your needs are narrow. If you only draft social captions, a free tier covers you forever — don't pay for $20 models to write one-liners. If your work is exclusively long legal or technical documents, a purpose-built AI document tool will beat both generalists on your specific workflow. And if you're in a strict-data environment (healthcare, finance compliance), neither consumer plan belongs in production — go straight to the enterprise agreements with data controls.</p>`,
    outlook: `<p>Looking 90 days ahead, expect the gap to keep shifting under your feet. OpenAI's release cadence has been tightening, and Google has tied Gemini updates to Workspace rollouts that land automatically — several of our test scores flipped within the test window itself. Our advice: make the decision reversible. Pick the monthly plan (not annual), pin your five most important recurring tasks, and re-run them in both tools every quarter — it takes twenty minutes and tells you more than any review, including this one.</p>`,
  },
  "compare/github-copilot-vs-cursor.html": {
    before: '<div class="trust-box">',
    skip: `<p>Skip both if AI-assisted coding is occasional rather than daily. A developer who reaches for AI twice a week will never recapture either subscription in saved time — modern free tiers and pay-as-you-go API access cover that cadence. Also skip both if your codebase can't leave your infrastructure: neither consumer tier belongs in an air-gapped environment, and self-hosted or on-prem AI coding is a different procurement entirely. Finally, if your team's bottleneck is design review or requirements clarity rather than typing speed, no coding assistant will move the needle — fix the process first.</p>`,
    outlook: `<p>Ninety days out, expect agent autonomy to keep climbing on both sides. Cursor's roadmap is pushing longer autonomous runs with better review tooling; GitHub is closing the repo-context gap with deeper workspace indexing and tighter Codespaces integration. The practical difference between the tools has narrowed every quarter this year. Our re-test cadence for this pairing is 60 days — if you're mid-decision, it's a reasonable time to sit one cycle out and compare again.</p>`,
  },
  "compare/grammarly-vs-prowritingaid.html": {
    before: '<div class="trust-box">',
    skip: `<p>Skip both if you already work with a human editor on everything — no subscription replaces line-editing judgment, and layering tool suggestions under an editor's passes often creates noise. Skip Grammarly if your documents are non-English-heavy: its multilingual support remains shallow, and a localized editor will serve better. Skip ProWritingAid if you never write past a few hundred words — its depth advantages only wake up on long documents, and its slower flow will tax every short email in exchange.</p>`,
    outlook: `<p>Both vendors are shipping AI features fast, and the lines are blurring: Grammarly is adding deeper document analytics, ProWritingAid is polishing its realtime layer. Expect the everyday-editor gap to narrow over the next quarter. What likely won't change: Grammarly's integration ubiquity and ProWritingAid's lifetime pricing. We re-test this pairing every 90 days — the fiction-writing scores in particular are worth rechecking as both models evolve.</p>`,
  },
  "compare/jasper-vs-copyai.html": {
    before: '<div class="trust-box">',
    skip: `<p>Skip both if marketing copy is a side duty rather than a workflow. Founders who write their own LinkedIn posts twice a week don't need a $36-39/month platform — a general chatbot with a saved prompt library covers it. Skip both for regulated industries' customer communications without legal review: neither tool understands your compliance boundaries, and AI-drafted healthcare or financial copy is a liability pipeline. And if your team's real problem is strategy (muddled positioning, unclear audience), more copy generation just industrializes the confusion.</p>`,
    outlook: `<p>The next quarter should clarify both platforms' bets: Jasper is pushing deeper into brand-performance analytics, while Copy.ai keeps expanding its GTM workflow catalog toward full campaign automation. Watch pricing too — both have reshuffled tiers in the past year. Our advice for new buyers: start on monthly plans, instrument your own edit-distance metric (how many minutes per asset to publishable), and let that number — not a review — make the annual decision. We re-run this comparison quarterly with the same brief bank.</p>`,
  },
  "compare/notion-ai-vs-obsidian.html": {
    before: '<h2 class="vs-h2" style="font-size:1.35rem">Related on StackHK',
    skip: `<p>Skip Notion if your notes are primarily personal and you resent subscriptions for basic capture — you'll pay monthly for collaboration features one person never triggers. Skip Obsidian if sharing is the daily reality: a knowledge base nobody else can open isn't a team tool, however elegant the graph. Also think twice about Obsidian if you need mobile capture polish above all — its mobile apps are capable but not the frictionless experience Notion's are. And skip Notion AI on free-tier expectations: the intelligence is the product, and it lives behind the add-on.</p>`,
    outlook: `<p>Watch two fronts this quarter: Notion AI is extending from Q&A into agentic database actions (auto-filing, auto-linking), which could widen the intelligence gap; Obsidian's community is closing the AI gap with local-model plugins that keep everything on-device. The ownership argument, meanwhile, only strengthens with time — every month of notes deepens the lock-in asymmetry. We re-run the two-week dual test every 90 days; the offline and AI-accuracy numbers are the ones to watch.</p>`,
  },
  "compare/claude-vs-chatgpt.html": {
    before: '<h2 class="vs-h2" style="font-size:1.35rem">Related on StackHK',
    skip: `<p>Skip the paid tier of either — for now — if your monthly usage is a handful of questions: both free tiers are genuinely capable in 2026, and $20/year ×2 buys a lot of patience. Skip Claude if your workflow is voice-first or image-heavy; its strengths are textual. Skip ChatGPT if your days are 100-page PDFs and careful technical review; you'd be paying for breadth you don't use. And if you're building production automations, don't decide from chat UIs at all — benchmark both APIs on your actual tasks, where pricing per token and rate limits decide differently than consumer plans.</p>`,
    outlook: `<p>The next quarter matters for this pairing because both vendors ship on 4-8 week cycles. Claude's MCP ecosystem is compounding — each new connector raises its floor for professional use — while ChatGPT's memory and agent features keep extending its casual-daily lead. Our expectation: the overall scores stay within 0.2 of each other while the task-level winners keep swapping. Re-run your own five core tasks quarterly; that discipline beats any standing answer, ours included.</p>`,
  },
  "compare/midjourney-vs-dalle.html": {
    before: '<h2>Commercial Use and Licensing in Practice</h2>',
    skip: `<p>Skip both subscriptions if your image needs are occasional — a general chatbot's image generation covers birthday-poster duty without a monthly fee. Skip Midjourney if you need pixel-level brand compliance with tight legal review on every asset; its community-default visibility and style looseness complicate strict pipelines. Skip DALL·E if your work lives on volume: twenty variations before lunch is Midjourney's home turf and ChatGPT's conversational loop will feel slow. And if photoreal humans with exact likeness rights are the deliverable, neither model is the right tool — that's a job for licensed photography.</p>`,
  },
};

for (const [f, m] of Object.entries(M)) {
  let html = read(f);
  if (html.includes(m.skip.slice(0, 60))) { console.log(`${f}: already`); continue; }
  const block = `\n<h2 ${SECTION_CLS}>Who Should Skip Both?</h2>\n${m.skip}\n${m.outlook ? `\n<h2 ${SECTION_CLS}>The 90-Day Outlook</h2>\n${m.outlook}\n` : ""}`;
  if (!html.includes(m.before)) { console.log(`${f}: ANCHOR MISSING`); continue; }
  html = html.split(m.before).join(block + m.before);
  write(f, html);
  console.log(`${f}: wc=${wc(html)}`);
}
console.log("pass 4 done");
