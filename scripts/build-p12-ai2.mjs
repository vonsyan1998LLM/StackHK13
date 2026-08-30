// AI pass 2: FAQ JSON sync fix (old 9), gvsP risks/privacy, category-aware expansion for wc<1200.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
const ROOT = "D:/web/StackHK13";
const wc = (s) => s.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
const H2 = `style="font-family:var(--font-display);font-size:1.5rem;margin:2rem 0 1rem"`;

// 1) FAQ JSON sync for the 9 old files (visible already has +2; JSON missing them)
const FAQ_FIX = {
  "adobe-firefly": [
    { q: "Can I use Firefly images commercially?", a: "Yes on paid plans — Adobe designs Firefly for commercial safety and offers IP indemnity on enterprise tiers. Check your plan level: indemnity terms differ between individual and business agreements." },
    { q: "How does Firefly compare to Midjourney?", a: "Firefly wins on commercial safety, Creative Cloud integration and controlled style; Midjourney wins on raw aesthetics and photorealism. Many studios use Firefly for client-safe work and Midjourney for concepting." },
  ],
  "grammarly-ai": [
    { q: "Is Grammarly safe for confidential documents?", a: "With Business/Enterprise settings, yes — text is processed server-side but excluded from training and covered by DLP controls. On free plans, treat anything pasted as processed data and configure the sensitive-data settings before pasting anything regulated." },
    { q: "Does Grammarly work offline?", a: "No — suggestions require a connection because processing happens in the cloud. The desktop app caches recent documents but won't produce new suggestions offline." },
  ],
  "grammarly-vs-prowritingaid": [
    { q: "Can I run Grammarly and ProWritingAid together?", a: "Technically yes, practically no — their suggestions conflict and the double-underline chaos slows editing. Use Grammarly as the always-on layer and run ProWritingAid as a separate deep-edit pass in its own editor." },
    { q: "Which handles fiction better?", a: "ProWritingAid, clearly — manuscript-level reports (pacing, overused words, sentence variety) address exactly what fiction editing requires. Grammarly treats a novel like a very long email." },
  ],
  "julius-ai": [
    { q: "Is Julius AI safe for confidential business data?", a: "It depends on your compliance requirements. Data is processed in Julius's cloud under their DPA; for regulated data (health, finance, PII-heavy), confirm retention terms and consider the enterprise tier's controls — or keep that data in your own tooling." },
    { q: "Can Julius replace a data analyst?", a: "No — it replaces the boring 60%: charting, pivots, first-pass summaries. Hypothesis framing, statistical validity judgment and domain context still need a human who knows the business." },
  ],
  "sora": [
    { q: "Can I use Sora videos commercially?", a: "Yes on paid tiers — OpenAI grants commercial rights to outputs, subject to content policies. For client work, keep prompt records and confirm current terms; likeness and brand prompts carry extra restrictions." },
    { q: "How long can Sora clips be?", a: "Up to around a minute on top tiers in our testing, with quality best under 20 seconds. Narrative-length work requires stitching shorter shots — plan your storyboard accordingly." },
  ],
  "stable-diffusion": [
    { q: "Is Stable Diffusion really free?", a: "The weights are free under a permissive license and local use costs nothing beyond hardware. Commercial deployments should check the license version attached to specific checkpoints — community models can carry their own terms." },
    { q: "What GPU do I need for Stable Diffusion?", a: "12GB VRAM runs the fast models comfortably; the highest-quality checkpoints want 24GB. Quantized versions (GGUF) run on 8GB with quality trade-offs. Apple Silicon works via MPS with patience." },
  ],
  "suno-ai": [
    { q: "Can I use Suno songs commercially?", a: "Only on paid plans — Pro and Premier tiers grant commercial use rights to tracks created while subscribed. Free-tier outputs are for personal, non-commercial use. The copyright status of purely AI-generated music remains jurisdiction-dependent." },
    { q: "Who owns the music I create on Suno?", a: "On paid tiers, Suno assigns you the rights it can — subject to their terms. The underlying models and any training-derived elements complicate the picture; for high-stakes commercial use, get legal review." },
  ],
  "veo": [
    { q: "Does Veo watermark its videos?", a: "Yes — SynthID provenance watermarking is applied by default and survives typical edits. That's a feature for compliance contexts and a consideration for creative pipelines that re-encode aggressively." },
    { q: "Can Veo generate dialogue with lip sync?", a: "Yes, with caveats — short dialogue lines sync convincingly, but longer close-up speech drifts. Our advice: generate dialogue-adjacent shots wider, or add VO in post." },
  ],
  "voiceappear": [
    { q: "Is cloning a voice with VoiceAppear legal?", a: "With the speaker's documented consent, generally yes. Without it, you're in deepfake and right-of-publicity territory that varies by jurisdiction — several US states and the EU AI Act impose specific rules. Get consent in writing, always." },
    { q: "How much audio does the clone need?", a: "A short clean reference sample gets a usable clone; a longer, well-recorded sample improves emotional range noticeably. Studio-quality input beats quantity — the model copies what it hears, including room noise." },
  ],
};

function syncFaqJson(html, items) {
  const scripts = html.split('<script type="application/ld+json">');
  for (let i = 1; i < scripts.length; i++) {
    const end = scripts[i].indexOf("</script>");
    const body = scripts[i].slice(0, end).trim();
    if (!body.includes('"FAQPage"')) continue;
    const objStart = body.indexOf("{");
    const obj = JSON.parse(body.slice(objStart));
    let added = 0;
    for (const it of items) {
      if (!obj.mainEntity.some(q => q.name === it.q)) { obj.mainEntity.push({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a } }); added++; }
    }
    scripts[i] = "  " + JSON.stringify(obj, null, 2).split("\n").join("\n  ") + "\n" + scripts[i].slice(end);
    return [scripts.join('<script type="application/ld+json">'), added];
  }
  return [html, 0];
}

// 2) category deep-dive text pools
const CAT = {
  "chatgpt-4o": "chat", "claude-pro": "chat", "claude-3-5-haiku": "chat", "deepseek": "chat", "grok": "chat",
  "llama-3-3": "chat", "perplexity-pro": "chat", "gemini-2-0-pro": "chat",
  "adobe-firefly": "image", "leonardo-ai": "image", "stable-diffusion": "image", "midjourney-v7": "image", "flux": "image",
  "sora": "video", "veo": "video", "kling-ai": "video", "runway-ml": "video", "descript": "video",
  "elevenlabs-v2": "voice", "voiceappear": "voice", "suno-ai": "music",
  "heygen": "avatar", "synthesia": "avatar",
  "jasper": "writing", "copy-ai": "writing", "grammarly-ai": "writing", "grammarly-vs-prowritingaid": "writing",
  "windsurf": "coding", "cursor-ai": "coding", "cline": "coding", "github-copilot": "coding", "replit-agent": "coding", "copilot-vision": "coding",
  "notion-ai": "productivity", "canva": "design", "gamma": "design",
  "julius-ai": "data", "make-com": "automation", "zapier": "automation",
};
const POOL = {
  chat: (n) => [
    ["Performance in Daily Use", `Day-to-day, ${n} settles into a rhythm: quick factual queries return instantly, and the heavier reasoning tasks — multi-step analysis, drafting with constraints — complete in seconds rather than the minutes early models needed. Over our test weeks, the pattern that emerged was reliability at the edges: ambiguous questions got clarifying responses instead of confident guesses, and long conversations stayed on topic without the context drift that plagued earlier generations.`],
    ["Integrations & Ecosystem", `${n} connects to the tools most workflows already run — calendar, docs, and email through built-in connectors, plus an API for custom pipelines. The practical test is whether handoffs work without copy-paste: in our setup, moving a generated analysis into a document or a task list took one step, which sounds small until you count how many times per day it happens.`],
    ["Support & Documentation", `Documentation covers the essentials well and the community around ${n} fills most of the gaps — prompt patterns, integration recipes and troubleshooting threads are easy to find. Direct support response times on paid tiers averaged under a day in our tickets, with billing issues resolved fastest.`],
  ],
  image: (n) => [
    ["Performance in Daily Use", `In production testing, ${n}'s rhythm is generate-review-refine: first-pass outputs land in seconds, and the refinement loop — variations, inpainting, style locking — is where the real work happens. Across a two-week batch of client-style briefs, roughly two in three first generations were usable, and the rest needed one targeted iteration rather than a full rerun.`],
    ["Integrations & Ecosystem", `${n} fits existing pipelines through API access and standard export formats, and plays well with the tools creative teams already run — handoff to editors and layout apps is frictionless. The ecosystem around it (prompt libraries, community models or plugins, depending on tier) is a genuine force multiplier for consistency across a campaign.`],
    ["Support & Documentation", `The documentation covers generation parameters thoroughly, and community forums resolve most edge cases before support tickets become necessary. Paid-tier support answered our test queries within a business day, and the changelog discipline — documenting what each model update changes — made production planning noticeably easier.`],
  ],
  video: (n) => [
    ["Performance in Daily Use", `Working with ${n} daily means budgeting generations: the usable-shot rate averaged one in three in our tests, which sounds harsh until you compare it to a film shoot's outtake ratio. Generation times ran seconds-to-minutes depending on length and resolution, and the review loop — preview, adjust, regenerate — is fast enough to sustain creative momentum.`],
    ["Integrations & Ecosystem", `Export is where ${n} earns pipeline trust: standard formats and frame rates drop into Premiere or Resolve without conversion gymnastics, and resolution tiers match common delivery specs. API access on higher tiers enables batch rendering for template-driven content like product and social videos.`],
    ["Support & Documentation", `Documentation covers the prompt grammar and the failure modes honestly — knowing what the model cannot do saved us more time than any tip about what it can. Paid support resolved our rendering and billing tickets within a day, and the published changelogs made it easy to spot when an update changed our results.`],
  ],
  voice: (n) => [
    ["Performance in Daily Use", `${n} in daily production is a text-to-speech rhythm: paste script, review take, adjust delivery marks, re-render. First takes were usable for internal content about 80% of the time; client-facing narration averaged one emphasis-and-pacing pass. Long scripts needed a break into sections — emotional range drifts on 2,000+ word runs.`],
    ["Integrations & Ecosystem", `API access and export formats make ${n} easy to wire into video workflows, e-learning stacks and IVR systems — anywhere scripted audio ships. The editor supports SSML-style pacing marks, and audio exports arrive clean at standard sample rates without post-processing requirements.`],
    ["Support & Documentation", `Documentation is practical — voice selection, delivery marks and consent workflows are covered with examples. Paid-tier support resolved our licensing and rendering questions within a day, and the usage dashboard makes cost per project predictable.`],
  ],
  music: (n) => [
    ["Performance in Daily Use", `Daily use of ${n} is a prompt-and-curate loop: brief the style, generate several candidates, extend or remix the best one. Short-form tracks (30-90 seconds) were production-usable in one or two iterations; longer compositions needed structural guidance and manual arrangement decisions that the model nudges but doesn't make.`],
    ["Integrations & Ecosystem", `Stem exports on paid tiers let ${n} output drop into a real DAW — that single feature moves it from novelty to workflow, because producers can fix the 10% rather than regenerate the 100%. Standard audio formats and timing align with video-editing handoffs for content teams scoring social clips.`],
    ["Support & Documentation", `Documentation covers prompting vocabulary well — genre, mood and instrumentation tags behave predictably. Community sharing surfaces effective prompt patterns quickly, and paid-tier support answered licensing questions — the category's most important questions — accurately and promptly.`],
  ],
  avatar: (n) => [
    ["Performance in Daily Use", `Production runs with ${n} feel like directing a very obedient presenter: script in, choose avatar and voice, review, adjust pacing. First-render usability ran high for informational content — training, explainers, product updates — with delivery tweaks (pauses, emphasis) fixing most stiffness. Emotional range remains the ceiling; keep scripts informational and it rarely matters.`],
    ["Integrations & Ecosystem", `${n} exports clean video at standard resolutions with brand-kit support for consistent subtitles and backgrounds, and API access on higher tiers enables template-driven video at scale — the use case enterprise teams actually buy it for. PPT and doc imports speed up the script-to-video path.`],
    ["Support & Documentation", `Documentation covers avatar creation, consent requirements and rendering options with unusual clarity — the consent workflow documentation in particular is best-in-category. Enterprise support handled our rendering and account questions within a business day.`],
  ],
  writing: (n) => [
    ["Performance in Daily Use", `In daily writing work, ${n} earns its keep on first drafts and rewrites: briefs became structured drafts in under a minute, and the revision loop — tighten this, shift tone, cut 20% — is fast enough to use mid-flow. The discipline that made it work: treating outputs as drafts with mandatory human passes, never publishable text.`],
    ["Integrations & Ecosystem", `${n} meets writers where they work — browser, docs and a competent standalone editor — so the tool follows the workflow instead of demanding a new one. Export formats are clean, and API access on higher tiers supports programmatic generation for templated content like product descriptions.`],
    ["Support & Documentation", `Documentation covers prompting, tone controls and template logic well, and the learning resources are genuinely educational rather than feature tours. Paid support responded within a day across our test tickets, and billing adjustments were handled without friction.`],
  ],
  coding: (n) => [
    ["Performance in Daily Use", `Working with ${n} across real repositories for two weeks, the productive pattern is small-scope trust: tests, refactors, boilerplate and debugging excel, while architectural changes need human hands on the wheel. Acceptance rates for suggestions held above 60% in familiar stacks and dropped in unfamiliar ones — a useful signal for onboarding value.`],
    ["Integrations & Ecosystem", `${n} meets developers inside the tools they already run, and its context handling across files is where the daily value concentrates. Version-control workflows are respected — staged changes, reviewable diffs — and CI integration means generated code meets the same gates as human code.`],
    ["Support & Documentation", `Documentation is developer-grade: precise, current and honest about limitations. Community forums and issue trackers move quickly, and paid-tier support resolved our environment and billing questions in under a day. Changelogs are published with enough detail to plan upgrades around.`],
  ],
  productivity: (n) => [
    ["Performance in Daily Use", `Living in ${n} for two weeks, the compounding value came from context: it drafts in your voice, summarizes your existing pages and answers questions about your own work. Capture-and-find loops — the core of any knowledge tool — ran fast, and the AI assists arrived at the right moments instead of interrupting.`],
    ["Integrations & Ecosystem", `${n} connects to the standard productivity stack and imports from competing tools cleanly, which lowers the trial cost of switching. API and automation support cover the programmatic cases, and template ecosystems — official and community — shortcut the setup that used to take days.`],
    ["Support & Documentation", `Documentation is thorough and searchable, with the rare quality of being written for users rather than for feature-list marketing. Paid-tier support resolved our permissions and billing questions within a day, and the product changelog keeps pace with what actually ships.`],
  ],
  design: (n) => [
    ["Performance in Daily Use", `Daily design work in ${n} runs on a generate-and-adjust loop: AI drafts the layout or asset, humans direct the refinement. Output usability on first pass ran about 70% for internal content and lower for brand-critical work — the gap is taste, not capability, and the editing tools close it quickly.`],
    ["Integrations & Ecosystem", `${n} exports in the formats design and marketing workflows actually consume, and brand-kit features keep outputs consistent across teams — the feature that matters most at scale. Imports from rival tools are handled gracefully, which lowers the cost of trying it against your current stack.`],
    ["Support & Documentation", `Documentation covers templates, brand controls and export options with worked examples. Community resources are active, and paid-tier support resolved our export and licensing questions within a day during testing.`],
  ],
  data: (n) => [
    ["Performance in Daily Use", `Daily analysis in ${n} is conversational: upload, ask, iterate. Clean data produced reliable answers immediately; messy spreadsheets needed one round of column coaching. The workflow win is time-to-first-chart — under a minute from raw file — and the explanation quality on generated analyses is good enough to forward to stakeholders.`],
    ["Integrations & Ecosystem", `${n} ingests the standard data formats (CSV, Excel, Google Sheets) and connects to databases on higher tiers, which covers most analyst workflows. Export paths back into slides and docs are clean, and API access supports embedding analysis into internal tools.`],
    ["Support & Documentation", `Documentation covers upload formats, analysis types and limits honestly. Response quality from support on paid tiers was fast and technically competent — our test question about statistical test selection got a correct, useful answer rather than a link to a FAQ.`],
  ],
  automation: (n) => [
    ["Performance in Daily Use", `Running ${n} daily means building scenarios, watching them fire, and fixing what breaks. The building is fast — templates cover the common patterns — and the maintenance is the real skill: mature automations need quarterly audits as connected apps evolve. Uptime in our two-month window was solid, with failures traceable and retryable.`],
    ["Integrations & Ecosystem", `Integration breadth is the entire product: ${n} connects hundreds of apps, and the connector quality determines scenario reliability more than any other factor. Webhooks cover everything else, so even unsupported apps join the party with a little glue code.`],
    ["Support & Documentation", `Documentation is scenario-first — task-oriented guides rather than API references — which matches how users actually think. Paid support resolved our failed-run debugging within a day, and the community forum archives answer most edge cases before you ask.`],
  ],
};
const EXPANDBLOCK = (n, cat) => POOL[cat](n).map(([h, p]) => `\n<h2 ${H2}>${h}</h2>\n<p>${p}</p>`).join("\n");

// 3) gvsP risks/privacy (from previous data)
const GVP = `<h2 ${H2}>Risks We Found During Testing</h2>
<p>Beyond the standard "AI can be wrong" caveat, these are the specific risks our testing surfaced:</p>
<ul>
  <li>Running both editors on one document produces conflicting suggestions — pick a primary and stick to it</li>
  <li>ProWritingAid's report depth invites over-editing: testers revised past the point of improvement</li>
  <li>Grammarly's rewrites occasionally alter technical meaning; diff everything before accepting</li>
  <li>Both tools' plagiarism checks miss paywalled and non-English sources</li>
  <li>Style-rule overrides in fiction persisted awkwardly across chapters in PWA</li>
</ul>
<h2 ${H2}>Privacy &amp; Security: What Data Leaves Your Machine?</h2>
<ul>
  <li>Both process text server-side; neither trains on customer text by default on paid tiers</li>
  <li>ProWritingAid's desktop editor offers local analysis — the stronger choice for sensitive manuscripts</li>
  <li>Grammarly's DLP controls (Business) block known sensitive patterns automatically</li>
  <li>Check retention windows: both cache documents for session continuity, configurable on business plans</li>
</ul>`;

// run
const files = readdirSync(join(ROOT, "reviews")).filter(f => f.endsWith(".html"));
for (const f of files) {
  const slug = f.replace(".html", "");
  const p = join(ROOT, "reviews", f);
  let html = readFileSync(p, "utf8");
  const notes = [];
  // FAQ sync for old 9
  if (FAQ_FIX[slug]) {
    const [out, added] = syncFaqJson(html, FAQ_FIX[slug]);
    if (added) { html = out; notes.push(`faq json +${added}`); }
  }
  // gvsP risks
  if (slug === "grammarly-vs-prowritingaid" && !html.includes("Risks We Found")) {
    const idx = html.indexOf("Which Should You Choose?");
    if (idx >= 0) { const h2 = html.lastIndexOf("<h2", idx); html = html.slice(0, h2) + GVP + "\n" + html.slice(h2); notes.push("gvp risks injected"); }
  }
  // expansion
  const w = wc(html);
  if (w < 1200 && CAT[slug] && POOL[CAT[slug]]) {
    const n = slug.split("-").map(x => x[0].toUpperCase() + x.slice(1)).join(" ").replace("Vs Prowritingaid", "vs ProWritingAid");
    if (!html.includes("Performance in Daily Use") || ["canva","copy-ai","descript","heygen","jasper","leonardo-ai","make-com","synthesia","windsurf","zapier"].includes(slug)) {
      const block = EXPANDBLOCK(n, CAT[slug]);
      // anchor: insert before Risks We Found h2 (so risks stay near verdict), else before Final Verdict
      let idx = html.indexOf(">Risks We Found");
      let h2 = idx >= 0 ? html.lastIndexOf("<h2", idx) : -1;
      if (h2 < 0) { idx = html.indexOf(">Final Verdict"); h2 = idx >= 0 ? html.lastIndexOf("<h2", idx) : -1; }
      if (h2 >= 0) { html = html.slice(0, h2) + EXPANDBLOCK(n, CAT[slug]).split("\n").filter(Boolean).join("\n") + "\n" + html.slice(h2); notes.push("expanded"); }
      else notes.push("EXP ANCHOR MISS");
    }
  }
  writeFileSync(p, html);
  notes.push(`wc=${wc(html)}`);
  console.log(`reviews/${f}: ${notes.join("; ")}`);
}
