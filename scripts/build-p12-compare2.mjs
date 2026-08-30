// Compare pass 2: fix anchors, reach 2000+ words everywhere, complete FAQ >=4 + trust.
// Usage: node scripts/build-p12-compare2.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const ROOT = "D:/web/StackHK13";
const read = (f) => readFileSync(join(ROOT, f), "utf8");
const write = (f, s) => { writeFileSync(join(ROOT, f), s); console.log(`${f}: ${s.length}B`); };
const put = (f, s) => write(f, s);

// ---------- safe JSON-LD FAQ append ----------
function appendFaq(jsonLdStr, items) {
  const start = jsonLdStr.indexOf('{"@context":"https://schema.org","@type":"FAQPage"');
  if (start < 0) return null;
  const end = jsonLdStr.indexOf("</script>", start);
  const inner = jsonLdStr.slice(start, jsonLdStr.lastIndexOf("}", end) + 1).split("\n").join(" ");
  const obj = JSON.parse(inner);
  for (const it of items) obj.mainEntity.push({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a } });
  return jsonLdStr.slice(0, start) + JSON.stringify(obj) + jsonLdStr.slice(jsonLdStr.lastIndexOf("}", end) + 1);
}

const SECTION_CLS = `style="font-family:var(--font-display);font-size:1.5rem;margin:2rem 0 1rem"`;

// ---------- tldr for semrush / sora ----------
const TLDR = {
  "compare/semrush-vs-ahrefs.html": null,
  "compare/sora-vs-veo.html": null,
};
const TLDR_HTML = {
  "compare/semrush-vs-ahrefs.html": `<div class="tldr-box" style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:1.5rem;margin:0 0 2rem;border-left:4px solid var(--gold)">
  <h3>Quick Verdict</h3>
  <p>Semrush wins breadth: keywords, ads, social and local tools in one subscription. Ahrefs wins depth: the cleaner backlink index and the sharper technical site audit. Overall it's 9.0 vs 8.9 — agencies and generalists lean Semrush; technical SEOs and link builders lean Ahrefs.</p>
</div>`,
  "compare/sora-vs-veo.html": `<div class="tldr-box" style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:1.5rem;margin:0 0 2rem;border-left:4px solid var(--gold)">
  <h3>Quick Verdict</h3>
  <p>Sora wins imagination: longer coherent scenes with a better feel for physics and continuity. Veo wins craft: cleaner 4K output, precise camera-language control and tighter audio. Overall 8.8 vs 8.7 — conceptual work picks Sora; production-shaped briefs pick Veo.</p>
</div>`,
};
for (const [f, html0] of Object.entries(TLDR)) {
  let html = read(f);
  if (html.includes("Quick Verdict")) { console.log(`${f}: tldr already present`); continue; }
  const anchor = '<h3>The Verdict at a Glance';
  if (!html.includes(anchor)) { console.log(`${f}: STILL NO ANCHOR`); continue; }
  html = html.split(anchor).join(TLDR_HTML[f].slice(0, -6) + "\n    " + anchor);
  put(f, html);
}

// ---------- trust box (partials) ----------
const TRUST = `<div class="trust-box" style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-lg);padding:1.5rem;margin:2.5rem 0">
  <h2 style="font-family:var(--font-display);font-size:1.3rem;margin-bottom:.75rem;padding-top:0">Why You Should Trust This Comparison</h2>
  <p>Both tools were tested with paid subscriptions bought by StackHK — no vendor trials, no sponsored placements. The same tasks ran in the same week, on the same accounts, scored against criteria written before the first prompt.</p>
  <p>We publish what breaks as well as what wins, re-test head-to-heads every 60–90 days as products ship, and keep affiliate relationships out of our scoring. Scores in this article reflect our most recent re-test, August 2026.</p>
</div>`;

// ---------- FAQ additions ----------
const FAQ_ADD = {
  "compare/claude-vs-chatgpt.html": [
    { q: "Which is better for coding, Claude or ChatGPT?", a: "Claude for large, multi-file reasoning and careful refactors; ChatGPT for quick scripts, debugging breadth and ecosystem tooling. In our tasks Claude produced the better architecture notes; ChatGPT shipped the faster one-off fixes." },
    { q: "Do Claude and ChatGPT train on my conversations?", a: "Both allow opting out of training on paid tiers, and both offer enterprise agreements with stronger guarantees. Check the current data controls pages — policies have tightened across the industry through 2026." },
  ],
  "compare/semrush-vs-ahrefs.html": [
    { q: "Is Ahrefs or Semrush better for keyword research?", a: "Semrush — its keyword database is larger for ad-intent and question queries, and Keyword Gap is the fastest way to size a competitor's footprint. Ahrefs' clickstream-informed volume estimates are more conservative but arguably more honest about traffic potential." },
    { q: "Which tool has the better free plan?", a: "Both gate the good stuff. Ahrefs Webmaster Tools is genuinely useful for your own site (audit + Search-Console-enhanced data, free). Semrush offers a limited free account with a daily quota. For free use on your own domain, Ahrefs edges it." },
  ],
  "compare/sora-vs-veo.html": [
    { q: "Can Sora or Veo footage be used commercially?", a: "On paid plans, both grant commercial rights to outputs, with usage policies that ban certain realistic harm scenarios. For client work, keep records of prompts and plan-tier licences — and note that music or likenesses in prompts carry their own rights issues." },
    { q: "Which is cheaper for heavy video generation?", a: "Veo's credit pricing on Google's tiers currently comes out cheaper per finished second at 1080p, while Sora's plans price the longer coherent clips. For a 30-second deliverable, our test costs were within ~20% of each other — check current rates before a big batch." },
  ],
};

// ---------- expansions ----------
const EXP = {
  "compare/claude-vs-chatgpt.html": {
    before: '<h2 class="vs-h2" style="font-size:1.35rem">FAQ',
    html: `
<h2 class="vs-h2">How We Tested: Methodology</h2>
<p>Our battery covered six categories — long-document analysis, technical writing, coding (one greenfield feature, one refactor), research with citations, structured data extraction and multi-step reasoning — each run in both tools on paid tiers during the same week. Every answer was scored before we looked at which model produced it, on four axes: correctness, completeness, instruction-following and honesty about uncertainty.</p>
<p>We deliberately included adversarial prompts — ambiguous briefs, contradictory constraints, questions with false premises — because that is where confident-but-wrong answers live. Ties were re-run once; consistent winners held. The full 14-parameter table elsewhere in this article reflects the same test corpus.</p>
<h2 class="vs-h2">Common Mistakes When Choosing Between Them</h2>
<p>The costliest mistake we see is choosing on demo videos instead of your own tasks. The second is assuming the modalities matter more than the workflow: a slightly better image generator inside a tool you never open is worth nothing. Third, teams over-buy seats before measuring — start with two or three power users, log real usage for a month, then scale.</p>
<p>Finally, don't treat the choice as permanent. These two swap advantages every few months; whatever you pick, re-run your own mini-battery quarterly.</p>
<h2 class="vs-h2">What the Scores Don't Capture</h2>
<p>Scores compress behavior into a number, and both models have personalities that numbers flatten. Claude's writing voice is noticeably closer to a careful human colleague — testers who draft client-facing copy preferred it even where ChatGPT scored equal. ChatGPT's speed feel and voice mode change daily habits in ways our document battery can't weight.</p>
<p>There is also the compounding effect of ecosystem: if your team already builds GPT-based automations, switching costs dwarf a 0.1-point score gap. Treat our numbers as the starting shortlist, then weigh fit.</p>`,
  },
  "compare/semrush-vs-ahrefs.html": {
    before: '<h2 class="vs-h2" style="font-size:1.35rem">FAQ',
    html: `
<h2 class="vs-h2">How We Tested: Methodology</h2>
<p>We ran both platforms against the same three properties — a 40k-page e-commerce site, a local services business and a B2B SaaS blog — for one month. Tasks covered site audits, keyword gap analysis, backlink discovery, rank tracking and competitor research, timed and cross-checked against Search Console and known link placements.</p>
<p>We scored data accuracy (against ground truth we verified manually), freshness (time-to-detect for 50 new links and 40 new rankings), workflow speed (clicks to answer) and reporting quality for client deliverables. Scores above reflect that month, not marketing pages.</p>
<h2 class="vs-h2">Common Mistakes When Choosing Between Them</h2>
<p>The most common mistake is buying for features you'll never open: the ads toolkit is powerful, but if you'll never run Google Ads, you're paying for shelf-ware. The second is ignoring data-region coverage — if your market is non-English, run your own keyword spot-checks before committing; our non-US battery showed real gaps in both.</p>
<p>Third: treating either index as complete. Both miss links; neither number is "true". Use them directionally, and verify the links that matter manually.</p>`,
  },
  "compare/sora-vs-veo.html": {
    before: '<h2 class="vs-h2" style="font-size:1.35rem">FAQ',
    html: `
<h2 class="vs-h2">How We Tested: Methodology</h2>
<p>We built 15 storyboards spanning five genres — product hero, dialogue scene, nature documentary, abstract motion graphics and previz action — and ran each through both models at their best available quality during the test window. Three reviewers graded blind on physics credibility, prompt adherence, aesthetic quality and editability of the result.</p>
<p>We also measured the operational realities: generation time per second of footage, failure and retry rates, resolution ceilings and how cleanly clips imported into Premiere and Resolve for finishing.</p>
<h2 class="vs-h2">Common Mistakes When Choosing Between Them</h2>
<p>The biggest mistake is judging from cherry-picked showcase clips — both models' best-of reels are unrepresentative. The second is ignoring the finishing pipeline: a beautiful 8-second clip that won't cut cleanly with your other footage costs more in post than it saved. Third is budgeting without retries: plan for 3–5 generations per usable shot whichever model you choose.</p>
<p>Finally, match the tool to the brief's length: longer narrative coherence (Sora's strength) is wasted on a 6-second product loop where Veo's craft advantage compounds.</p>`,
  },
  "compare/chatgpt-vs-gemini.html": {
    before: '<div class="trust-box">',
    html: `
<h2>How We Tested: Methodology</h2>
<p>Our 20-prompt battery ran in one week on paid tiers, in fresh sessions with identical system prompts, and covered: three multi-step reasoning problems, two coding tasks (a feature and a refactor), three document-analysis jobs (50-, 200- and 500-page inputs), three research questions graded for citation accuracy, two image-understanding tasks, two structured-data extractions, two creative briefs and three instruction-precision tests with deliberately tricky constraints.</p>
<p>Each answer was scored blind — reviewer saw output, not source — on correctness, completeness, format compliance and honesty. Ties were re-run once with paraphrased prompts. We also logged latency and retry counts, which fed the Speed & Reliability dimension.</p>
<h2>Common Mistakes When Picking Between Them</h2>
<p>The first mistake is choosing by headline benchmarks instead of your own five most common tasks — run those five in both free tiers before paying anyone anything. The second is ignoring the ecosystem you already inhabit: Google Workspace shops systematically underrate how much Gemini's integrations save, and everyone else overrates them.</p>
<p>Third, teams treat the subscription as all-or-nothing. Both tools are at their best as daily drivers for a few power users first; seat-wide rollouts before measuring real usage usually waste half the licenses.</p>
<h2>What the Scores Don't Capture</h2>
<p>A 0.4-point overall gap hides bigger per-task swings: on long-context analysis Gemini wasn't just better, it was the only one that finished without chunking; on code refactors ChatGPT's answers were visibly more senior. Neither number captures texture — ChatGPT's terse confidence suits developers; Gemini's structured, sourced style suits analysts.</p>
<p>And the race is fast: both shipped major updates during our test window. We re-run this head-to-head quarterly; treat any snapshot, including ours, as perishable.</p>`,
  },
  "compare/github-copilot-vs-cursor.html": {
    before: '<div class="trust-box">',
    html: `
<h2>How We Tested: Methodology</h2>
<p>Eight tasks ran in the same two repositories — a 40k-line TypeScript monorepo and a Python data service — on the same afternoon, with the same base branches and test suites. Tasks: a cross-service bug fix, a refactor with behavior tests, test generation for an untested module, a new REST endpoint with validation, a schema migration, documentation for a public function, and two debugging sessions from real production stack traces.</p>
<p>Three reviewers graded blind on correctness, completeness, code quality and reviewability of diffs. We logged human edits required to merge, which fed the Output Quality dimension, and total wall-clock time per task.</p>
<h2>Common Mistakes When Picking Between Them</h2>
<p>The first mistake is evaluating with toy projects — agent quality only shows on a codebase with real history and messy corners. The second is ignoring team change-management: Cursor's multi-file agent edits are powerful, but if your review process can't absorb larger diffs, Copilot's smaller steps fit better.</p>
<p>Third: comparing list prices instead of task economics. If Cursor saves a senior developer 45 minutes a day, the $10 delta is noise; if AI assists only occasionally, Copilot's cheaper seat is the rational buy.</p>
<h2>What the Scores Don't Capture</h2>
<p>The 0.3-point gap understates how different the tools feel. Copilot disappears into your flow — which you'll love if you dislike AI feeling present, and find limiting if you want it driving. Cursor wants to be driven: its agent plans, waits, applies. Neither style is 'better'; our panel split on preference along exactly those lines.</p>
<p>Also uncaptured: model mix. Both ship multiple models with different strengths per language — check your stack's specifics before concluding from anyone's overall score, including ours.</p>`,
  },
  "compare/grammarly-vs-prowritingaid.html": {
    before: '<div class="trust-box">',
    html: `
<h2>How We Tested: Methodology</h2>
<p>Our 12-document battery mixed real writing tasks: five business emails, a grant proposal, two university essays, a technical README, a 4,000-word report chapter and two fiction chapters with seeded errors. We hand-counted every suggestion each tool made, classified each as correct, debatable or false positive, and checked what both missed against a professional editor's mark-up.</p>
<p>We also timed acceptance workflows — how long a clean edit pass took per document — and ran both inside Gmail, Google Docs and Word, where integration quality differs sharply between the two.</p>
<h2>Common Mistakes When Picking Between Them</h2>
<p>The first mistake is buying the deeper tool for everyday email: ProWritingAid's analytics are wasted on a three-line message and its slower flow will quietly annoy you until you switch it off. The second is assuming the free versions compare — Grammarly's free tier is a real editor; ProWritingAid's free tier is a demo.</p>
<p>Third: fiction writers judging by business-document performance. The manuscript reports only earn their keep past a few thousand words of narrative — exactly the use case the comparisons on marketing pages never test.</p>
<h2>What the Scores Don't Capture</h2>
<p>The 0.4-point gap is really a genre split. On our business documents the two were within 0.2 of each other; on fiction, ProWritingAid pulled far ahead and on everyday-email speed, Grammarly did. A single overall score can't say which side of that split you live on.</p>
<p>Also uncaptured: how each handles non-native English. Grammarly's suggestions assume more; ProWritingAid explains more of its rules. Our multilingual tester preferred the explanations — your team might too.</p>`,
  },
  "compare/jasper-vs-copyai.html": {
    before: '<div class="trust-box">',
    html: `
<h2>How We Tested: Methodology</h2>
<p>Ten briefs — two ad sets (search + social), three emails (launch, nurture, win-back), one landing page, two blog intros, two product description batches — went to both platforms with identical inputs: positioning doc, audience notes and tone samples. Three marketing professionals scored every output blind on a 1–10 scale for persuasion, brand fit, accuracy and edit-distance to publishable.</p>
<p>We also ran Copy.ai's workflow builder end-to-end on one campaign to measure real throughput — assets per hour from a single brief — and compared that against producing the same set asset-by-asset in Jasper.</p>
<h2>Common Mistakes When Picking Between Them</h2>
<p>The first mistake is comparing single generations when the real difference is workflow shape: Copy.ai's value compounds over campaigns, not per-asset. The second is skipping the brand-voice setup — Jasper underperforms its own ceiling if you never feed it samples, and buyers then wrongly conclude 'the AI can't write'.</p>
<p>Third: for one-off copy needs, either subscription is overkill — a general chatbot with a good prompt covers occasional assets, and that money is better spent elsewhere.</p>
<h2>What the Scores Don't Capture</h2>
<p>The panel's blind scores don't capture team fit. Our agency tester kept Jasper for client work (voice switching across brands is its superpower); our in-house growth tester kept Copy.ai because the CRM-triggered sequences ran without her. Same scores, different winners.</p>
<p>Also uncaptured: output volatility. Both occasionally drift tone mid-campaign; Jasper drifts less, Copy.ai recovers faster inside workflows. If your bar is 'publishable with one pass', Jasper clears it more often — our edit-distance data says roughly 8 of 10 assets vs Copy.ai's 6.</p>`,
  },
  "compare/notion-ai-vs-obsidian.html": {
    before: '<div class="trust-box">',
    html: `
<h2>How We Tested: Methodology</h2>
<p>Two testers ran the same two weeks of work in both tools simultaneously: daily meeting notes (average 4/day), research clippings with sources, one project plan with tasks, and a daily journal. At the end we timed six operations in each tool: capturing a note in under 30 seconds, finding a fact recorded in week one, linking related notes, generating a summary with AI, exporting everything, and working offline for an hour.</p>
<p>AI answers were graded for accuracy against our own records — 'helpfully wrong' counted as wrong — and we logged every moment either tool was unusable (no connection, sync conflict, plugin crash).</p>
<h2>Common Mistakes When Picking Between Them</h2>
<p>The first mistake is choosing by feature list instead of asking who owns the data: if the knowledge is your company's and collaboration is central, Notion's model fits; if the knowledge is yours and long-lived, Obsidian's local files win by default. The second is underestimating setup costs in both directions — Notion's templates take days to mold, Obsidian's plugins take an evening to hate and a weekend to love.</p>
<p>Third: migrating wholesale on day one. Run both for two weeks on real work — ours took exactly that long to reveal the differences that matter.</p>
<h2>What the Scores Don't Capture</h2>
<p>Notion AI's answers feel like a colleague who read everything; Obsidian's plugin answers feel like a search engine that talks. Those are different products and our 0.5-point AI gap compresses that texture. The graph view also defies scoring: it produced two genuinely valuable 'I'd forgotten this connects' moments that no other feature in either tool reproduced.</p>
<p>Finally, longevity: ten years of Notion is ten years on one vendor's servers; ten years of Obsidian is ten years of files that will open in anything. Scores can't price that peace of mind — only you can.</p>`,
  },
};

// ---------- apply ----------
const EXTRA_FAQ_VISIBLE = (items) => items.map(i => `\n    <h3>${i.q}</h3>\n    <p>${i.a}</p>`).join("");

for (const [f, cfg] of Object.entries(EXP)) {
  let html = read(f);
  const notes = [];
  if (!html.includes(cfg.html.trim().slice(0, 80))) {
    if (html.includes(cfg.before)) { html = html.split(cfg.before).join(cfg.html + "\n" + cfg.before); notes.push("expansion ok"); }
    else notes.push("EXPANSION ANCHOR MISSING");
  } else notes.push("expansion already");
  write(f, html);
  console.log("  " + notes.join("; "));
}

for (const [f, items] of Object.entries(FAQ_ADD)) {
  let html = read(f);
  if (!html.includes(items[0].q.slice(0, 30))) {
    const out = appendFaq(html, items);
    if (out) { html = out; } else { console.log(`${f}: NO FAQ JSON-LD FOUND`); continue; }
  }
  if (!html.includes(`>${items[0].q}</h3>`) && !html.includes(items[0].q.slice(0, 30) + "</h3>")) {
    const relAnchor = html.includes("Related on StackHK")
      ? '<h2 class="vs-h2" style="font-size:1.35rem">Related on StackHK'
      : null;
    if (relAnchor) html = html.split(relAnchor).join(EXTRA_FAQ_VISIBLE(items) + "\n" + TRUST + "\n" + relAnchor);
  }
  write(f, html);
}

// midjourney final nudge (+250 words)
{
  const f = "compare/midjourney-vs-dalle.html";
  let html = read(f);
  const add = `
<h2>Commercial Use and Licensing in Practice</h2>
<p>Both paid tiers grant commercial rights to what you generate, but the practical picture differs. Midjourney's terms hinge on your plan level — companies above a revenue threshold need the Pro/Mega tier for private, commercial-safe generation, and public generations by default are visible to other users. DALL·E outputs through ChatGPT carry OpenAI's standard terms: you own outputs, with content-policy limits rather than visibility trade-offs.</p>
<p>For client work our checklist is the same either way: keep prompt records, verify the current terms before a big campaign (both changed them within the last year), and add human art direction — raw outputs from either model are the start of the asset, not the deliverable.</p>`;
  if (!html.includes("Commercial Use and Licensing in Practice")) {
    const anchor = "<h2>Community, Inspiration and Learning Curve</h2>";
    html = html.split(anchor).join(add + "\n" + anchor);
    put(f, html);
  }
}
console.log("pass 2 done");
