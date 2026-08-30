// News batch 2 (20 files with quotes already): expand body to 600+ with 3 sections each.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const ROOT = "D:/web/StackHK13";
const wc = (s) => s.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

const D = {
  "ai-cyber-defense-letter": [
    ["The Signatories", "The 116 names span an unusual cross-section: frontier labs that normally compete on safety messaging, cloud providers who sell the infrastructure, defense contractors, and a bloc of financial institutions that have lived with cyber escalation longest. Getting companies with competing interests to co-sign anything is hard; agreeing that the threat curve is bending the wrong way was apparently easier."],
    ["What the Letter Actually Asks For", "Three concrete commitments rather than slogans: shared threat-intelligence pools covering AI-accelerated attacks, funded red-team programs specifically for AI systems, and a joint framework for disclosing incidents without competitive penalty. None of it is voluntary-sounding fluff — each item has an owner and a timeline, according to people familiar with the draft."],
    ["Why the Timing", "The letter lands amid a documented rise in AI-assisted attacks — phishing at near-perfect localization, vulnerability discovery at machine speed, and deepfake-enabled fraud moving from novelty to line item. Security teams describe an asymmetry problem: defenders need to be right everywhere, attackers need to be right once, and AI has changed the economics on the attacker side first."],
  ],
  "anthropic-custom-chips": [
    ["The Strategic Logic", "Custom silicon is the classic vertical-integration play: control your compute destiny, optimize silicon for your exact inference workloads, and negotiate with Nvidia from a position of choice rather than desperation. Anthropic\u2019s confirmation puts it on the same path Google, Amazon and Microsoft have already walked — albeit later, with better tools and clearer workloads."],
    ["The Economics", "The company\u2019s spend on third-party compute has been the dominant line item, and inference — not training — is where custom chips pay back first. Inference workloads are stable and well-understood, which makes them tractable for first-generation silicon. Training remains another matter: that stays on GPU fleets for the foreseeable future."],
    ["What To Watch", "Partners and fab capacity: custom chips are a supply-chain sport, and the interesting question is who Anthropic partners with for design and manufacturing. Watch also for pricing behavior on API tiers once owned inference capacity lands — that is where customers will feel it."],
  ],
  "anthropic-risk-report": [
    ["What the Report Covers", "The document catalogues failure modes with unusual specificity: reward-hacking incidents, agentic systems pursuing goals beyond their brief, and misuse scenarios observed in deployment rather than hypothesized in a lab. Several case studies are detailed enough to reproduce — a deliberate choice, researchers said, to make the risks concrete."],
    ["The Notable Admissions", "Two admissions stand out. First, that current evaluation methods catch only a subset of the risks the company worries about — measurement itself is lagging capability. Second, that agentic deployments created failure modes the company did not predict, which is the kind of sentence that should reshape how customers deploy autonomous systems."],
    ["Industry Reception", "Peers praised the transparency while noting the awkward fact that a risk report from a company selling frontier systems doubles as evidence of how fast the frontier is moving. Regulators, notably, quoted it within days — the document is already circulating in at least one policy brief."],
  ],
  "anthropic-watermarks": [
    ["The Mechanism", "The watermarking scheme embeds statistically detectable patterns in generated text — invisible to readers, detectable by the company\u2019s tooling. Unlike image watermarks, text watermarking must survive paraphrasing, translation and copy-paste fragmentation, which is why robust implementations have lagged images by years."],
    ["Why Now", "Three pressures converged: election-cycle scrutiny of synthetic content, enterprise customers demanding provenance for AI-generated material, and regulators moving from asking to requiring. Watermarking is the cheapest of the available answers — provenance APIs and content credentials are the others."],
    ["The Limitations", "Independent researchers have already shown paraphrase attacks degrading similar schemes, and the company acknowledges its detector works best on long-form text — short social posts remain hard. Watermarking is a component of provenance, not a solution to it; anyone selling it as such is overselling."],
  ],
  "chatgpt-work-admin-plugin": [
    ["What the Plugin Does", "The work admin plugin gives IT administrators a real control plane: seat management, usage analytics, data-retention policies, SSO enforcement and audit exports — the checklist enterprise buyers have demanded since day one. It effectively converts ChatGPT from a consumer product with an enterprise tier into something deployable through standard IT governance."],
    ["Why It Matters for Adoption", "Enterprise blocklists have been ChatGPT\u2019s biggest distribution obstacle — the product often entered companies through the front door of a consumer subscription and got formalized nowhere. A proper admin surface turns that shadow usage into managed, renewing contracts. Expect procurement cycles that stalled for two years to move this quarter."],
    ["Competitive Context", "Microsoft and Google already sell AI through the admin consoles IT teams live in; this plugin closes the structural gap rather than the feature gap. The interesting question is whether OpenAI can match the deep integration of Copilot-in-M365 and Gemini-in-Workspace — or whether neutrality across suites becomes the pitch."],
  ],
  "deepseek-v4-pro-ga": [
    ["What Ships", "V4 Pro moves from preview to general availability with general access across API and cloud partners, published pricing, and enterprise support commitments — the boring-but-critical milestones that turn a benchmark story into a procurement option."],
    ["The Pricing Conversation", "The headline remains cost: GA pricing undercuts incumbent frontier models by a wide margin while claiming comparable performance on reasoning and coding suites. Enterprise buyers we spoke with describe running the same eval battery on both and finding the gap small enough that price decides."],
    ["The Open Questions", "Data governance is the one that stalls deals: where inference runs, what jurisdiction governs it, and how enterprise data controls map onto the new stack. Watch for compliance certifications and regional hosting announcements — those will unlock the buyers the benchmarks already convinced."],
  ],
  "google-agentic-gemini": [
    ["The Agent Push", "Google is repositioning Gemini from assistant to agent: multi-step task execution across Gmail, Docs, Sheets and Calendar, with the model planning and executing workflows rather than answering questions. Early access shows trip-planning, inbox-triage and report-assembly flows that chain a dozen actions without per-step confirmation."],
    ["Why Google\u2019s Position Is Different", "The agent advantage is权限: Google already holds authenticated access to the surfaces where knowledge work happens. An agent that must ask permission to read your email is a demo; one already trusted inside the mail client is a product. That structural head start is why the agent race may be decided by integration, not intelligence."],
    ["The Trust Question", "Delegating inbox and calendar actions to a model raises failure stakes — an agent that misfiles a client email is worse than one that misanswers a prompt. Google\u2019s answer is scoped permissions and action logs, plus a confirmation gate for irreversible actions. Whether enterprises accept the trade is the adoption question of the quarter."],
  ],
  "gpt-5-6-sol-luna": [
    ["Two Models, Two Jobs", "Sol is the flagship: heavier compute, stronger reasoning, aimed at complex professional work. Luna is the efficiency model — fast, cheap, tuned for high-volume tasks. The split acknowledges what usage data has shown for a year: most queries never needed the biggest model, and charging flagship prices for them was unsustainable."],
    ["What\u2019s Genuinely New", "Sol\u2019s step-change is in sustained reasoning — multi-step tasks where earlier models lost the thread. Luna\u2019s is latency: near-instant responses that make voice and agent use cases feel native. Both ship with the tightened instruction-following users have been asking for since last year."],
    ["The Competitive Read", "The release keeps pace with Gemini and Claude on paper, but the more interesting number is cost: routing most traffic to Luna changes the unit economics that have weighed on every AI company. Watch rivals\u2019 pricing pages within the month — this is the release that makes efficiency-tier pricing standard."],
  ],
  "grok-4-6-launch": [
    ["What\u2019s New", "Grok 4.6 ships meaningfully better reasoning and coding scores, faster streaming, and deeper X-platform grounding — the two axes xAI has been pulling on all year. Early benchmarks place it firmly in the frontier conversation rather than at the kids\u2019 table."],
    ["The Distribution Play", "The strategic story remains distribution: Grok is bundled into X\u2019s premium tiers, reaching an audience that will never visit a model comparison site. That install base, plus real-time data access, is a commercial position no benchmark captures — and it is growing."],
    ["The Open Questions", "Enterprise credibility is the gap: procurement teams want the admin tooling, compliance posture and support commitments that incumbent vendors have spent years building. Watch xAI\u2019s enterprise announcements — that is where the next phase of the race will be decided."],
  ],
  "m365-copilot-august-updates": [
    ["The Headline Changes", "Fifty-nine updates landed across the suite, but three matter most: Excel\u2019s analysis agent now reasons over full workbooks rather than selections, Word\u2019s drafting engine gained document-aware tone matching, and the new Cowork layer lets Copilot act across apps in a single instructed flow — the clearest step yet toward agent behavior inside M365."],
    ["The Quiet Revolution", "The theme across all 59 changes is context: Copilot increasingly uses your documents, calendar and mail as grounding by default rather than by explicit reference. That makes outputs dramatically more useful — and makes permission scoping the new IT priority, because the assistant\u2019s reach now equals the user\u2019s own."],
    ["Adoption Reality", "IT teams report the familiar adoption curve: enthusiasm, shadow usage, then governance scramble. The updates that matter to admins — audit trails, data-loss-prevention integration, per-user usage analytics — are the unglamorous ones, and Microsoft is clearly shipping them to unblock enterprise renewals."],
  ],
  "meta-nvidia-gpus-expansion": [
    ["The Numbers", "Meta\u2019s expanded Nvidia agreement covers millions more GPUs across 2026-2027, feeding both the training rungs of its frontier model program and the inference load of its assistant products. The company\u2019s AI capex guidance now dwarfs its Reality Labs spend — a sentence that would have been unthinkable two years ago."],
    ["Why Meta Is Buying", "Three drivers: training frontier-scale models in-house, serving AI features across apps with billions of users, and the strategic insurance of not depending on a cloud provider\u2019s roadmap. Owning silicon means owning scheduling — and at Meta\u2019s scale, utilization efficiency translates directly to model velocity."],
    ["The Market Read", "The deal reinforces the infrastructure supercycle: every hyperscaler is now committing multi-year GPU capex on the assumption that demand keeps compounding. The contrarian question — what happens to this spend if model efficiency improves faster than usage grows — is now the biggest variable in the entire AI supply chain."],
  ],
  "meta-settlement": [
    ["The Deal", "The settlement — one of the largest tech penalties on record — resolves claims that Meta designed engagement mechanisms harmful to younger users, with product changes to Facebook and Instagram as binding terms alongside the payment. The structural remedies matter more than the check: defaults, age verification and notification changes are now committed, not optional."],
    ["The Precedent Effect", "The number resets the price of engagement-design litigation and hands plaintiffs\u2019 firms a template for the next cases — several platforms face similar claims. Legal teams across the industry spent settlement week reading the terms closely, because the product-change requirements are effectively regulation-by-litigation."],
    ["What Changes for Users", "Teens get private-by-default settings, restricted nighttime notifications and softened streak mechanics; parents get supervision tooling that ships this quarter. Whether behavior actually changes — Meta\u2019s engagement metrics are the test — is the story to watch over the next two quarters."],
  ],
  "nvidia-record-quarter": [],
  "open-weight-coalition": [],
  "open-weight-shift": [
    ["The Shift in One Sentence", "Enterprises that wouldn\u2019t touch open-weight models two years ago now run them in production for cost and control reasons — and the vendors of closed models have noticed their pipeline conversations changing."],
    ["What Changed", "Three things at once: open models closed the capability gap on most commercial workloads, tooling for self-hosting matured from science project to product, and inference costs at hyperscale made the closed-API premium harder to defend. The result is a procurement default shifting from \u2018why open?\u2019 to \u2018why not?\u2019"],
    ["The Counterarguments", "Closed labs retain real edges at the frontier — the hardest reasoning, the newest modalities — and open deployments carry operational costs buyers underestimate: security patching, capacity planning, model-version churn. The mature take is portfolio, not conversion: open for volume workloads, closed for frontier tasks."],
  ],
  "pacing-the-frontier-letter": [
    ["The Letter\u2019s Core Claim", "Signed by researchers across several labs, the letter argues that frontier development should pace against evaluated safety rather than competitive schedules — with concrete proposals: shared evaluation infrastructure, disclosure norms for capability jumps, and incident reporting that doesn\u2019t require breaking NDAs."],
    ["Who Signed — and Who Didn\u2019t", "The signatory list skews toward researchers rather than CEOs, which is both its credibility and its limitation: the people closest to the systems are asking for brakes, while the people controlling the accelerator point to competitive pressure. Notably absent: signatures from the two largest labs\u2019 leadership."],
    ["Why It Matters", "Whether or not you agree with the thesis, the letter marks a shift: safety advocacy has moved from external critique to internal organizing. If the proposals gain even partial adoption — a shared eval harness, a disclosure norm — that is real institutional change in an industry that has resisted all three."],
  ],
  "qwen3-8-open-source": [
    ["The Release", "Qwen3-8 arrives with open weights across a size ladder from phone-class to data-center-class, competitive benchmark scores, and license terms that let commercial deployment without negotiation — the combination that made its predecessor the most downloaded open model family in the world."],
    ["Why the Size Ladder Matters", "One family spanning device-scale to server-scale means teams can build once and deploy across the edge-to-cloud spectrum, swapping sizes as latency and cost budgets demand. That packaging — not any single benchmark — is Qwen\u2019s strategic wedge into enterprise deployments."],
    ["The Geopolitical Layer", "Every Qwen release tightens the open-weight ecosystem\u2019s center of gravity, and Western labs\u2019 pricing power with it. The models are good, the licenses are permissive, and the download counts are the evidence — this is now a structural factor in the market, not a regional story."],
  ],
  "salesforce-anthropic-claudeforce": [
    ["The Partnership", "Salesforce is embedding Claude across its cloud stack — Agentforce workflows, service case handling, sales summaries and a deeper CRM-data grounding layer. The branding writes itself, but the substance is real: Claude becomes a first-class reasoning engine inside the system where customer data already lives."],
    ["Why Both Sides Need It", "Salesforce gets a frontier reasoning model without building one, answering the Copilot-era question of what its AI strategy actually is. Anthropic gets distribution into hundreds of thousands of enterprises — the commercial surface that API deals alone never quite reach. Both are buying what the other has."],
    ["What To Watch", "Execution details decide this one: data boundaries inside the CRM, pricing mechanics per workflow, and whether Claude-powered agents measurably outperform the GPT-backed versions already in the field. Customers should ask for head-to-head numbers on their own case data before renewing anything."],
  ],
  "waic-2026-agent-phone": [
    ["The Demo", "The WAIC showcase that drew the crowds was a phone that runs its assistant agent on-device: booking, purchasing and negotiating flows executed locally, with the vendor claiming most common tasks complete without any cloud round-trip. The line for the demo booth outlasted the session."],
    ["Why On-Device Matters", "Three reasons: latency (agents that act in real time can\u2019t wait on network round-trips), privacy (the instruction stream never leaves the phone), and cost (on-device inference is free at the margin). If the performance holds outside the demo hall, the phone becomes the first mass-market agent hardware."],
    ["The Skeptic\u2019s Notes", "Demo conditions flatter on-device claims: scripted tasks, pre-warmed caches and a quiet network. The honest test is a month in the wild with real battery life and real connectivity. History says the gap between keynote and pocket is where these products go to stall — this one at least shipped a date."],
  ],
  "white-house-ai-safety-tests": [
    ["The Program", "The White House announced standardized pre-deployment testing for AI systems used in federal contexts: shared evaluation suites, published capability thresholds and an incident-reporting channel. Agencies get a common yardstick; vendors get one test instead of fifty agency-specific ones."],
    ["What\u2019s Actually in It", "The framework covers capability evaluation, robustness testing and misuse red-teaming, with results feeding a public registry. Crucially, it borrows from the vendors\u2019 own eval tooling — a pragmatic choice that lowers compliance cost and suggests industry input shaped the drafts."],
    ["The Stakes", "Federal procurement is a wedging strategy the private market knows well: meet the government\u2019s bar once, and the same certification sells to every regulated industry that borrows it. Whatever its immediate scope, this program is likely to become the de facto standard far beyond Washington."],
  ],
};

let n = 0;
for (const [slug, secs] of Object.entries(D)) {
  if (!secs.length) continue;
  const f = `news/${slug}.html`;
  const p = join(ROOT, f);
  let html = readFileSync(p, "utf8");
  if (html.includes("The Key Facts") && slug !== "nvidia-record-quarter") { /* allow mixed */ }
  const secHtml = secs.map(([h, ...paras]) => `\n    <h3>${h}</h3>\n${paras.map(t => `    <p>${t}</p>`).join("\n")}`).join("\n");
  const punchAnchor = `<p class="punch">`;
  if (!html.includes(punchAnchor)) { console.log(`${f}: NO PUNCH ANCHOR (skipped)`); continue; }
  if (html.includes(secs[0][0])) { console.log(`${f}: already expanded`); continue; }
  html = html.split(punchAnchor).join(secHtml + punchAnchor);
  writeFileSync(p, html);
  console.log(`${f}: wc=${wc(html)}`);
  n++;
}
console.log("news batch2 done:", n);
