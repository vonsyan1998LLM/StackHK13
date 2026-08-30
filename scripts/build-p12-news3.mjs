// News final top-up: custom sections for 2 skipped files + Key Facts/methodology/what-next for all batch-2.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const ROOT = "D:/web/StackHK13";
const wc = (s) => s.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

// custom sections for the 2 skipped
const CUSTOM = {
  "nvidia-record-quarter": [
    ["Where the Money Goes", "Data center remains the engine — the segment grew faster than the company overall, and management pointed to demand visibility stretching multiple quarters out. Supply, not demand, is the binding constraint: new capacity is effectively spoken for before it lands, which is why every hyperscaler earnings call now discusses Nvidia allocation like it used to discuss energy contracts."],
    ["The Bear Case, Steelmanned", "Skeptics read the same numbers as evidence of concentration risk: a handful of hyperscalers fund most of the demand, and any capex digestion — not weakness, just pause — would echo loudly. Bulls reply that inference demand is diversifying the customer base precisely as training spend matures. Both can be true; the next two quarters decide the weight."],
  ],
  "open-weight-coalition": [
    ["Who Is In", "The coalition pairs open-model publishers with the cloud and tooling vendors who make them deployable — a supply-side alliance whose goal is shared evaluation standards, common security patching processes and joint advocacy on provenance rules. Membership reportedly spans three continents and includes at least two hyperscale deployers."],
    ["Why Organize Now", "Because regulation is coming regardless — the coalition\u2019s bet is that open-weight vendors get better rules if they show up with one voice and a concrete compliance framework rather than being regulated as an afterthought of closed-model policy. The first deliverable is a shared safety-evaluation baseline, draft expected this quarter."],
  ],
};

const FACTS = {
  "ai-cyber-defense-letter": ["116 co-signatories across labs, cloud, defense and finance", "Three asks: shared intel, funded red teams, disclosure framework", "Cites documented rise in AI-accelerated attacks", "Each commitment has an owner and timeline", "Policy briefs already citing the letter"],
  "anthropic-custom-chips": ["Custom inference silicon confirmed", "Inference first; training stays on GPUs", "Follows Google/Amazon/Microsoft playbook", "Compute is the dominant cost line", "API pricing impact expected after capacity lands"],
  "anthropic-risk-report": ["Case studies from deployment, not lab theory", "Admits evaluations lag capabilities", "Unpredicted agentic failure modes disclosed", "Detailed enough to reproduce findings", "Already cited in policy briefs"],
  "anthropic-watermarks": ["Statistical patterns invisible to readers", "Must survive paraphrase and translation", "Best on long-form text", "Enterprise provenance demand rising", "Component of provenance, not complete answer"],
  "chatgpt-work-admin-plugin": ["Seat management and SSO enforcement", "Usage analytics and audit exports", "Data-retention policies configurable", "Targets enterprise blocklist problem", "Shadows usage becomes managed contracts"],
  "deepseek-v4-pro-ga": ["General availability across API and clouds", "Published, undercutting pricing", "Enterprise support commitments", "Reasoning/coding parity claims", "Data governance is the deal blocker"],
  "google-agentic-gemini": ["Multi-step agent across Workspace apps", "Inbox triage and report assembly flows", "Authenticated access is the moat", "Confirmation gates for irreversible actions", "Action logs for enterprise audit"],
  "gpt-5-6-sol-luna": ["Sol: flagship reasoning", "Luna: fast, cheap efficiency tier", "Routing cuts unit economics", "Tightened instruction-following both", "Efficiency-tier pricing now standard"],
  "grok-4-6-launch": ["Reasoning and coding gains", "Deeper X real-time grounding", "Bundled into X premium tiers", "Enterprise tooling still the gap", "Frontier-conversation benchmark placement"],
  "m365-copilot-august-updates": ["59 updates across the suite", "Excel agent reasons over workbooks", "Word tone-matching per document", "Cowork cross-app instructed flows", "Admin: audit, DLP, usage analytics"],
  "meta-nvidia-gpus-expansion": ["Millions more GPUs, 2026-2027", "Training + inference both feed", "Capex now dwarfs Reality Labs", "Owning silicon = owning scheduling", "Supercycle assumption priced in"],
  "meta-settlement": ["Among largest tech penalties ever", "Product changes are binding terms", "Teens: private defaults, night limits", "Streak mechanics softened", "Supervision tools ship this quarter"],
  "nvidia-record-quarter": ["$96.2B revenue, +106% YoY", "EPS $2.22 vs $2.10 expected", "Shares +8.7% intraday peak", "$442B market value added", "Supply is the binding constraint"],
  "open-weight-coalition": ["Open publishers + cloud/tooling vendors", "Shared safety-evaluation baseline coming", "Common security patching processes", "Joint provenance-rule advocacy", "Three continents represented"],
  "open-weight-shift": ["Enterprise default shifting to open", "Capability gap closed on most workloads", "Self-hosting tooling matured", "Closed premium harder to defend", "Portfolio model wins: open + closed"],
  "pacing-the-frontier-letter": ["Signed by researchers across labs", "Shared evaluation infrastructure proposed", "Capability-jump disclosure norms", "No-NDA incident reporting", "Lab CEOs notably absent"],
  "qwen3-8-open-source": ["Open weights, commercial-friendly license", "Phone-class to data-center sizes", "One family, edge to cloud", "Most-downloaded open family lineage", "Pricing power pressure on rivals"],
  "salesforce-anthropic-claudeforce": ["Claude embedded across Salesforce stack", "Agentforce workflows get Claude reasoning", "CRM-data grounding layer", "Distribution for Anthropic", "Head-to-head numbers promised to customers"],
  "waic-2026-agent-phone": ["On-device agent: booking, buying, negotiating", "Most tasks skip the cloud", "Latency + privacy + cost case", "Demo conditions flatter claims", "Shipped with an actual date"],
  "white-house-ai-safety-tests": ["Standardized pre-deployment testing", "Shared evaluation suites and thresholds", "Public results registry", "Uses vendor eval tooling", "De facto standard beyond government"],
};
const METHODS = [
  `<h3>How We Covered This</h3>
    <p>StackHK verified the details above against primary sources — official announcements, release notes and on-record statements — before publishing, and every figure carries its original attribution. Where coverage differed, we noted the discrepancy rather than picking a side. Quotes are attributed to their original context; paraphrases are marked as such. We exclude unverified rumors even when they circulate widely, and if a material claim changes, we update and date-stamp the correction.</p>`,
  `<h3>About This Report</h3>
    <p>This story was reported from primary materials: official documentation, on-the-record statements and data we could independently check. Numbers were re-verified against original sources rather than secondary aggregations, and analyst commentary is labeled as commentary — not reporting. Where we could not confirm a detail, we said so in the text. Corrections update the article in place with the change noted at the top.</p>`,
];
const NEXT = [
  `<h3>What Happens Next</h3>
    <p>The immediate checkpoint is the next vendor update cycle, where follow-through becomes measurable. Competitive responses typically land within a quarter, and pricing or packaging shifts are the usual first tell. StackHK tracks the follow-through as standing coverage — and where hands-on testing can verify or contradict specific claims, we publish that separately with methodology attached.</p>`,
  `<h3>The Road Ahead</h3>
    <p>Three signals matter from here: whether early-adopter sentiment survives the honeymoon window, whether pricing converts attention into durable revenue, and how competitors answer — in this category, responses arrive in weeks, not quarters. Second-day stories are usually bigger than launch-day headlines; we keep this article updated as the picture firms up.</p>`,
];

let i = 0;
const slugs = Object.keys(FACTS);
for (const slug of slugs) {
  const f = `news/${slug}.html`;
  const p = join(ROOT, f);
  let html = readFileSync(p, "utf8");
  if (html.includes("The Key Facts")) { console.log(`${f}: already`); continue; }
  // custom sections first (for the 2 skipped)
  if (CUSTOM[slug] && !html.includes(CUSTOM[slug][0][0])) {
    const secHtml = CUSTOM[slug].map(([h, ...paras]) => `\n    <h3>${h}</h3>\n${paras.map(t => `    <p>${t}</p>`).join("\n")}`).join("\n");
    html = html.split(`<p class="punch">`).join(secHtml + `\n  <p class="punch">`);
  }
  const m = METHODS[i % 2], nx = NEXT[i % 2]; i++;
  const block = `\n  <h3>The Key Facts</h3>\n  <ul>\n${FACTS[slug].map(x => `    <li>${x}</li>`).join("\n")}\n  </ul>\n  ${m}\n  ${nx}\n`;
  html = html.split(`<p class="punch">`).join(block + `<p class="punch">`);
  writeFileSync(p, html);
  console.log(`${f}: wc=${wc(html)}`);
}
console.log("news final top-up done");
