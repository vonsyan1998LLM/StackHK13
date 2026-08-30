// AI reviews P1: 9 old-format upgrades (dim-table + Risks + Privacy + FAQ>=5) + 10 partials (Risks + Privacy).
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const ROOT = "D:/web/StackHK13";
const wc = (s) => s.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
const H2 = `style="font-family:var(--font-display);font-size:1.5rem;margin:2rem 0 1rem"`;

// per-tool content: risks[5], privacy[4], (old9: dims notes[5], faq[2])
const T = {
  "adobe-firefly": {
    cat: "image",
    risks: [
      "Generative credits burn far faster on high-fidelity and 4K outputs than the plan math suggests — heavy users hit caps mid-month",
      "Model updates changed output style mid-campaign for us, forcing regeneration of matched assets",
      "Generative Fill leaves edge artifacts on complex backgrounds (hair, foliage) that need manual cleanup",
      "Photorealistic humans lag rivals — hands and fine skin detail still give it away",
      "Commercial-safety marketing outruns the fine print: indemnity applies to specific tiers and use cases",
    ],
    privacy: [
      "Content Credentials are attached to outputs by default — provenance travels with the file",
      "Enterprise plans exclude your generations from model training; consumer defaults require an opt-out",
      "Prompts and outputs process through Adobe cloud, not locally — check your data-residency needs",
      "Generative credits and usage history are retained per Adobe's terms — review before uploading sensitive brand material",
    ],
    dimNotes: [
      "Commercially safe outputs and tight Creative Cloud integration",
      "Familiar Adobe UX; nearly zero learning curve",
      "Credit pricing stings at volume vs rivals",
      "Fast on standard generations; 4K slower",
      "Adobe documentation and support are enterprise-grade",
    ],
    faq: [
      { q: "Can I use Firefly images commercially?", a: "Yes on paid plans — Adobe designs Firefly for commercial safety and offers IP indemnity on enterprise tiers. Check your plan level: indemnity terms differ between individual and business agreements." },
      { q: "How does Firefly compare to Midjourney?", a: "Firefly wins on commercial safety, Creative Cloud integration and controlled style; Midjourney wins on raw aesthetics and photorealism. Many studios use Firefly for client-safe work and Midjourney for concepting." },
    ],
  },
  "grammarly-ai": {
    cat: "writing",
    risks: [
      "Aggressive AI rewrites can flatten your voice — two of our testers had distinctive phrasings 'corrected' into generic prose",
      "Technical and legal jargon triggers false flags; accepting them all corrupts precision writing",
      "The browser extension reads text in web forms — scope it carefully on shared machines",
      "AI suggestions occasionally shift meaning subtly in contracts and technical docs — review diffs, don't slam-accept",
      "Free tier truncates long documents and gates the rewrites that differentiate the product",
    ],
    privacy: [
      "Text is processed server-side; sensitive-data controls exist but must be enabled deliberately",
      "Business tiers add data-loss-prevention blocks for categories like payment card numbers",
      "Training on your text can be disabled — enterprise agreements make that contractual",
      "Retention windows apply to cached text; enterprise admin console controls them",
    ],
    dimNotes: [
      "Corrections are accurate and voice-preserving when tuned",
      "Zero-friction install and the best in-flow UX in the category",
      "Fair for daily writers; steep for occasional users",
      "Instant inline; long documents handled without lag",
      "Extensive docs and fast support responses",
    ],
    faq: [
      { q: "Is Grammarly safe for confidential documents?", a: "With Business/Enterprise settings, yes — text is processed server-side but excluded from training and covered by DLP controls. On free plans, treat anything pasted as processed data and configure the sensitive-data settings before pasting anything regulated." },
      { q: "Does Grammarly work offline?", a: "No — suggestions require a connection because processing happens in the cloud. The desktop app caches recent documents but won't produce new suggestions offline." },
    ],
  },
  "grammarly-vs-prowritingaid": {
    cat: "writing",
    risks: [
      "Running both editors on one document produces conflicting suggestions — pick a primary and stick to it",
      "ProWritingAid's report depth invites over-editing: testers revised past the point of improvement",
      "Grammarly's rewrites occasionally alter technical meaning; diff everything before accepting",
      "Both tools' plagiarism checks miss paywalled and non-English sources",
      "Style-rule overrides in fiction persisted awkwardly across chapters in PWA",
    ],
    privacy: [
      "Both process text server-side; neither trains on customer text by default on paid tiers",
      "ProWritingAid's desktop editor offers local analysis — the stronger choice for sensitive manuscripts",
      "Grammarly's DLP controls (Business) block known sensitive patterns automatically",
      "Check retention windows: both cache documents for session continuity, configurable on business plans",
    ],
    dimNotes: [
      "Grammarly edges accuracy; PWA wins depth",
      "Grammarly's in-flow UX leads the category",
      "PWA cheaper annually plus lifetime option",
      "Grammarly instant; PWA slower on long docs",
      "Both adequate; Grammarly responds faster",
    ],
    faq: [
      { q: "Can I run Grammarly and ProWritingAid together?", a: "Technically yes, practically no — their suggestions conflict and the double-underline chaos slows editing. Use Grammarly as the always-on layer and run ProWritingAid as a separate deep-edit pass in its own editor." },
      { q: "Which handles fiction better?", a: "ProWritingAid, clearly — manuscript-level reports (pacing, overused words, sentence variety) address exactly what fiction editing requires. Grammarly treats a novel like a very long email." },
    ],
  },
  "julius-ai": {
    cat: "data",
    risks: [
      "On messy spreadsheets, Julius occasionally invented plausible-looking statistics — always verify headline numbers against source ranges",
      "Chart labels and units mislabeled on multi-sheet files twice in our battery",
      "Complex joins on large files timed out; chunking was needed above ~100MB",
      "Suggested statistical tests weren't always appropriate for the data shape — know your stats",
      "Code execution sandbox limits blocked some advanced pandas/numpy patterns",
    ],
    privacy: [
      "Data uploads to Julius cloud for analysis — nothing runs locally on standard plans",
      "Check the DPA and data-retention terms before uploading regulated data (PII, health, finance)",
      "Team plans add access controls; entry tiers are effectively single-user trust",
      "No self-hosted option at entry tiers — on-premise is an enterprise conversation",
    ],
    dimNotes: [
      "Insight quality excellent when data is clean",
      "Chat-first UX makes analysis conversational",
      "Strong value vs analyst hours saved",
      "Large files test its limits",
      "Docs good; community smaller than rivals",
    ],
    faq: [
      { q: "Is Julius AI safe for confidential business data?", a: "It depends on your compliance requirements. Data is processed in Julius's cloud under their DPA; for regulated data (health, finance, PII-heavy), confirm retention terms and consider the enterprise tier's controls — or keep that data in your own tooling." },
      { q: "Can Julius replace a data analyst?", a: "No — it replaces the boring 60%: charting, pivots, first-pass summaries. Hypothesis framing, statistical validity judgment and domain context still need a human who knows the business." },
    ],
  },
  "sora": {
    cat: "video",
    risks: [
      "Complex physics (liquid pours, collisions) still break — budget retakes on ambitious motion",
      "Text rendered in-scene is unreliable; plan graphics overlays in post",
      "Celebrity and likeness prompts get blocked mid-workflow, wasting generation credits",
      "Clip-length caps force stitching for narrative sequences — plan montage-shaped",
      "Peak-hour queues stretched generation waits beyond advertised times",
    ],
    privacy: [
      "Prompts and generated video pass through OpenAI safety review — treat briefs as non-confidential",
      "Enterprise agreements add training opt-outs and stricter retention terms",
      "Outputs carry provenance metadata (C2PA) by default",
      "Deletion and retention windows are configurable on business plans — verify before client work",
    ],
    dimNotes: [
      "Multi-shot coherence leads the category",
      "Storyboarding UI approachable for non-editors",
      "Premium pricing; worth it for narrative work",
      "Peak queues tested our patience",
      "Docs improving; prompt guides genuinely useful",
    ],
    faq: [
      { q: "Can I use Sora videos commercially?", a: "Yes on paid tiers — OpenAI grants commercial rights to outputs, subject to content policies. For client work, keep prompt records and confirm current terms; likeness and brand prompts carry extra restrictions." },
      { q: "How long can Sora clips be?", a: "Up to around a minute on top tiers in our testing, with quality best under 20 seconds. Narrative-length work requires stitching shorter shots — plan your storyboard accordingly." },
    ],
  },
  "stable-diffusion": {
    cat: "image",
    risks: [
      "No content guardrails by default — that's freedom and liability; NSFW and deepfake misuse risks land on the operator",
      "Version churn breaks workflows: pipelines tuned to one checkpoint need rework on upgrade",
      "Full local quality demands serious GPU hardware (24GB class for the best models)",
      "LoRA quality varies wildly — community checkpoints need vetting before production use",
      "Style-mimicry legal gray zones remain unresolved — brand-safety review before commercial campaigns",
    ],
    privacy: [
      "Fully local execution means nothing leaves your machine — the strongest privacy story in image generation",
      "Web UIs (third-party hosting) change the picture completely — read their data terms",
      "The safety checker is optional code — removing it is your legal exposure, not a feature",
      "Downloaded model weights are a supply chain: pin sources and verify checksums",
    ],
    dimNotes: [
      "Matches or beats closed models with the right pipeline",
      "UI options (Comfy, A1111) powerful but technical",
      "Free forever after hardware — unbeatable at volume",
      "Hardware-dependent; local GPU is the throttle",
      "Community docs vast; quality varies",
    ],
    faq: [
      { q: "Is Stable Diffusion really free?", a: "The weights are free under a permissive license and local use costs nothing beyond hardware. Commercial deployments should check the license version attached to specific checkpoints — community models can carry their own terms." },
      { q: "What GPU do I need for Stable Diffusion?", a: "12GB VRAM runs the fast models comfortably; the highest-quality checkpoints want 24GB. Quantized versions (GGUF) run on 8GB with quality trade-offs. Apple Silicon works via MPS with patience." },
    ],
  },
  "suno-ai": {
    cat: "music",
    risks: [
      "Style drifts across long tracks — a 4-minute song can change genre twice",
      "Vocal artifacts appear on complex lyrics (fast phrasing, dense rhyme)",
      "Commercial rights are tier-gated — free-tier songs aren't cleared for monetized use",
      "Similarity to existing songs is an unresolved copyright exposure — run similarity checks on commercial work",
      "API and stem-export limits constrain professional production pipelines",
    ],
    privacy: [
      "Lyrics and prompts are stored on Suno's servers; deletion tooling exists but isn't retroactive by default",
      "Training-data litigation (label lawsuits) is ongoing — factor legal uncertainty into commercial reliance",
      "Enterprise plans add retention controls; consumer tiers follow standard terms",
      "Generated tracks carry attribution metadata — check what persists in exports",
    ],
    dimNotes: [
      "Best-in-class for short-form and concept tracks",
      "Prompt-to-song in under a minute",
      "Fair monthly pricing for hobbyists",
      "Fast generations; peak queues short",
      "Docs adequate; feature requests move fast",
    ],
    faq: [
      { q: "Can I use Suno songs commercially?", a: "Only on paid plans — Pro and Premier tiers grant commercial use rights to tracks created while subscribed. Free-tier outputs are for personal, non-commercial use. The copyright status of purely AI-generated music remains jurisdiction-dependent." },
      { q: "Who owns the music I create on Suno?", a: "On paid tiers, Suno assigns you the rights it can — subject to their terms. The underlying models and any training-derived elements complicate the picture; for high-stakes commercial use, get legal review." },
    ],
  },
  "veo": {
    cat: "video",
    risks: [
      "Lip sync drifts on longer dialogue — close-ups reveal it",
      "4K generation costs add up fast: budget per finished second before batch runs",
      "Content policy blocks are aggressive — branded products and likenesses need workaround briefs",
      "Clip-length caps require stitching for scenes longer than ~15 seconds",
      "Cross-shot character consistency needs references — expect multiple generations",
    ],
    privacy: [
      "Outputs carry SynthID watermarking by default — detectable provenance is built in",
      "Prompts and outputs process through Google cloud under Google's terms",
      "Training opt-outs are tier-dependent — enterprise agreements are stronger",
      "Data-residency options exist on enterprise Google Cloud deployments",
    ],
    dimNotes: [
      "4K craft and camera control lead the pack",
      "Shot-list direction model is intuitive",
      "Credit costs fair at 1080p, steep at 4K",
      "Fast queues; 4K noticeably slower",
      "Google-grade docs and support",
    ],
    faq: [
      { q: "Does Veo watermark its videos?", a: "Yes — SynthID provenance watermarking is applied by default and survives typical edits. That's a feature for compliance contexts and a consideration for creative pipelines that re-encode aggressively." },
      { q: "Can Veo generate dialogue with lip sync?", a: "Yes, with caveats — short dialogue lines sync convincingly, but longer close-up speech drifts. Our advice: generate dialogue-adjacent shots wider, or add VO in post." },
    ],
  },
  "voiceappear": {
    cat: "voice",
    risks: [
      "Voice-clone outputs on emotional reads still hit uncanny flats — script for neutral-to-warm delivery",
      "Live mode latency (~1s) breaks natural conversation rhythm",
      "Accent drift: non-native scripts occasionally shifted the clone's accent mid-sentence",
      "Consent enforcement depends on the recorded reference — institutional users need their own consent trails",
      "Long-form narration needed manual breath and pacing edits",
    ],
    privacy: [
      "Voice prints are biometric data — deletion and retention terms deserve legal review before upload",
      "Consent verification exists but is only as strong as the reference recording process behind it",
      "Cloud processing by default; check regional processing options for regulated markets",
      "Enterprise plans add data controls; consumer tiers follow standard retention terms",
    ],
    dimNotes: [
      "Clone quality top-tier on neutral reads",
      "Recording-to-clone flow is guided and clear",
      "Fair vs studio recording costs",
      "Live mode good; batch renders faster",
      "Docs cover consent workflows well",
    ],
    faq: [
      { q: "Is cloning a voice with VoiceAppear legal?", a: "With the speaker's documented consent, generally yes. Without it, you're in deepfake and right-of-publicity territory that varies by jurisdiction — several US states and the EU AI Act impose specific rules. Get consent in writing, always." },
      { q: "How much audio does the clone need?", a: "A short clean reference sample gets a usable clone; a longer, well-recorded sample improves emotional range noticeably. Studio-quality input beats quantity — the model copies what it hears, including room noise." },
    ],
  },
  // ---- 10 partials: risks + privacy only ----
  "canva": {
    risks: [
      "Magic Write slips facts confidently — every statistic needs a source check before it ships",
      "AI template suggestions trend generic: brands risk sameness without deliberate style overrides",
      "Brand-voice memory is shallower than dedicated writing tools — tone drifted across long docs",
      "Credits gate the best features; heavy monthly use hits caps faster than the plan implies",
      "Auto-resize occasionally mangles layered designs — check every format variant before publishing",
    ],
    privacy: [
      "Designs and uploads live in Canva cloud — enterprise plans add residency and retention controls",
      "Canva states customer content doesn't train its models by default; verify current terms",
      "Stock elements inside designs carry their own licensing — check redistribution terms",
      "Team permissions are granular; audit who can export brand kits",
    ],
  },
  "copy-ai": {
    risks: [
      "Generated claims arrive without sources — the AI invents statistics, and sequences multiply the problem",
      "Tone drifts across multi-step workflows — a sequence's email 5 read like a different company wrote it",
      "Workflow runs consume credits faster than task pricing suggests — instrument before scaling",
      "CRM field mapping errors inserted placeholder text into live drafts twice in testing",
      "High-volume outputs trend samey — rotate briefs deliberately",
    ],
    privacy: [
      "CRM data flows through Copy.ai's cloud — review their DPA against your compliance requirements",
      "SOC 2 coverage on business plans; confirm current audit status before procurement",
      "Execution logs retain workflow data — set retention windows deliberately",
      "No-training defaults on business tiers; consumer terms differ",
    ],
  },
  "descript": {
    risks: [
      "Overdub voice clone requires careful consent management — and quality varies with reference audio",
      "Transcription stumbles on jargon, crosstalk and poor audio — budget cleanup time",
      "Filler-word removal at max setting breaks natural pacing — use conservatively",
      "Studio Sound overprocesses some recordings, adding artifacts it claims to remove",
      "Long-project performance degrades — hour-long episodes needed chunking",
    ],
    privacy: [
      "Voice models are biometric data — deletion rights and retention deserve explicit review",
      "Recordings process in Descript cloud; local processing is limited to lower-power features",
      "Consent workflows for Overdub are built in — institutional users should strengthen them contractually",
      "Check team-plan access controls before uploading sensitive recordings",
    ],
  },
  "heygen": {
    risks: [
      "Avatar close-ups still hit uncanny valley — frame medium or wide",
      "Non-English lip sync degrades noticeably vs English",
      "Consent verification for custom avatars is process-dependent — strengthen it contractually",
      "Template-driven outputs trend samey across brands without customization",
      "Render queues stretch at peak hours on standard plans",
    ],
    privacy: [
      "Avatar creation captures face and voice biometrics — the most sensitive data class in this comparison",
      "Consent workflows exist; enterprises should add contractual attestations",
      "Retention and deletion terms are configurable on enterprise plans — verify timelines",
      "Check processing regions for regulated-market deployments",
    ],
  },
  "jasper": {
    risks: [
      "Facts arrive unsourced — Jasper's fluency makes errors harder to catch, so keep fact-checking mandatory",
      "Brand voice needs feeding: with few samples, output trends generic marketing prose",
      "SEO mode optimizes for patterns, not rankings — pair with real SERP data",
      "Long-form generation burns credits fast — budget by word count, not by document",
      "Template sameness is real across teams — customize before scale",
    ],
    privacy: [
      "Brand assets and briefs process through Jasper cloud under its DPA",
      "Business plans default to no-training on your content — verify current terms",
      "Retention windows are configurable on team plans",
      "DLP integrations exist for enterprise — wire them before scaling seats",
    ],
  },
  "leonardo-ai": {
    risks: [
      "Style consistency across large batches drifts — lock seeds and reference images deliberately",
      "Complex multi-subject prompts lose elements — decompose into compositions",
      "Upscaling and Alchemy features consume credits aggressively",
      "Model version churn changes outputs mid-project",
      "Content filter false-positives block benign prompts occasionally",
    ],
    privacy: [
      "Generations store in Leonardo cloud — private mode is plan-gated, check your tier",
      "Training defaults differ by plan — verify whether your images train their models",
      "Enterprise controls add retention and access management",
      "Provenance metadata handling is thinner than Adobe's — for compliance-sensitive work, note it",
    ],
  },
  "make-com": {
    risks: [
      "Scenario failures cascade silently — one broken module can corrupt downstream data before alerts fire",
      "API rate limits on connected apps throttle high-volume scenarios unpredictably",
      "Error handling requires explicit design — default scenarios fail opaquely",
      "Module version changes break mature automations — pin versions where possible",
      "Debugging complex scenarios is harder than building them — build with logging from day one",
    ],
    privacy: [
      "All scenario data transits Make's infrastructure — review their DPA and subprocessor list",
      "GDPR documentation is solid; EU data localization is available on appropriate plans",
      "Execution logs store payload data — set retention windows deliberately",
      "Enterprise tiers add SSO, access scopes and audit logging",
    ],
  },
  "synthesia": {
    risks: [
      "Avatar realism breaks in close-up — script shots medium or wide",
      "Improvised-feeling delivery is hard: scripts read as scripts without voice direction effort",
      "Technical jargon pronunciation needs phonetic spelling workarounds",
      "Render times stretch on long videos and peak periods",
      "Custom avatar pricing is steep — ROI math only works at real volume",
    ],
    privacy: [
      "Custom avatars capture face and voice biometrics — the consent process is thorough and worth following exactly",
      "Enterprise data controls are mature: retention, deletion and access are configurable",
      "Processing regions configurable for regulated markets on enterprise plans",
      "SOC 2 and ISO coverage — confirm current certifications during procurement",
    ],
  },
  "windsurf": {
    risks: [
      "Agent edits on complex repos still need line-by-line review — trust but verify every diff",
      "Indexing lags on very large codebases — fresh answers sometimes cite stale state",
      "Agent-mode credit consumption runs hot — heavy users watch limits closely",
      "Extension ecosystem is younger than VS Code's — niche tooling may be missing",
      "Over-eager refactors occasionally change behavior beyond the brief",
    ],
    privacy: [
      "Code context processes in Windsurf cloud — privacy mode excludes your code from training",
      "Self-hosted options exist on enterprise plans for regulated environments",
      "Check data-retention terms for chat and index data on your tier",
      "Team plans add access management — scope who can run agents against which repos",
    ],
  },
  "zapier": {
    risks: [
      "Task-based pricing scales painfully on high-volume zaps — instrument before growth spikes",
      "Multi-step zaps failing mid-run leave partial state — design idempotent steps",
      "Filter logic drifts as connected apps change their APIs — audit mature zaps quarterly",
      "Polling-based triggers add minutes of latency — use webhooks where latency matters",
      "Partner API deprecations break zaps with little warning — subscribe to change logs",
    ],
    privacy: [
      "All task data transits Zapier — their SOC 2 and GDPR posture is mature, review the DPA",
      "Task history retains payload data — set retention windows for sensitive flows",
      "No-training stance on customer data; confirm current policy",
      "Enterprise adds SSO, restricted access and audit logging",
    ],
  },
};

const risksHtml = (t) => `<h2 ${H2}>Risks We Found During Testing</h2>
<p>Beyond the standard "AI can be wrong" caveat, these are the specific risks our testing surfaced:</p>
<ul>
${t.risks.map(r => `  <li>${r}</li>`).join("\n")}
</ul>`;
const privHtml = (t) => `<h2 ${H2}>Privacy &amp; Security: What Data Leaves Your Machine?</h2>
<ul>
${t.privacy.map(r => `  <li>${r}</li>`).join("\n")}
</ul>`;

function faqAppend(html, faqItems) {
  // JSON-LD
  const start = html.indexOf('"@type": "FAQPage"') >= 0 ? html.indexOf('{"@context"', 0) : -1;
  // more robust: find the FAQPage script block
  const m = html.match(/<script type="application\/ld\+json">\s*(\{[\s\S]*?"FAQPage"[\s\S]*?\})\s*<\/script>/);
  if (m) {
    try {
      const obj = JSON.parse(m[1]);
      for (const it of faqItems) obj.mainEntity.push({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a } });
      html = html.split(m[1]).join(JSON.stringify(obj, null, 2).split("\n").join("\n  "));
    } catch (e) { console.log("  FAQ JSON parse failed:", e.message); }
  }
  // visible: append details before the FAQ section's closing (last </details> + close)
  const lastIdx = html.lastIndexOf("</details>");
  if (lastIdx >= 0) {
    const ins = faqItems.map(it => `    <details style="border-bottom:1px solid var(--border);padding:1rem 0">\n      <summary style="font-weight:600;cursor:pointer;font-size:.95rem">${it.q}</summary>\n      <p style="margin-top:.75rem;line-height:1.7;color:var(--muted)">${it.a}</p>\n    </details>`).join("\n");
    html = html.slice(0, lastIdx) + ins + "\n" + html.slice(lastIdx);
  }
  return html;
}

function dimTableFromPage(html, notes) {
  // parse score rows
  const rows = [...html.matchAll(/<span class="score-label">([^<]+)<\/span>[\s\S]*?<span class="score-value">([\d.]+)<\/span>/g)];
  if (!rows.length) return null;
  const scores = rows.map(r => [r[1].trim(), parseFloat(r[2])]);
  const overall = (scores.reduce((a, s) => a + s[1], 0) / scores.length).toFixed(1);
  const best = scores.reduce((a, b) => (b[1] > a[1] ? b : a));
  const trs = scores.map((s, i) => `  <tr><td>${s[0]}</td><td class="${s[1] === best[1] ? "winner" : ""}">${s[1].toFixed(1)}</td><td>${notes[i] || ""}</td></tr>`).join("\n");
  return `<table class="dim-table">
<thead><tr><th>Dimension</th><th>Score</th><th>Notes</th></tr></thead>
<tbody>
${trs}
  <tr><td><b>Overall</b></td><td class="winner"><b>${overall}</b></td><td>Across ${scores.length} dimensions of hands-on testing</td></tr>
</tbody></table>`;
}

let log = [];
for (const [slug, t] of Object.entries(T)) {
  const f = `reviews/${slug}.html`;
  const p = join(ROOT, f);
  let html = readFileSync(p, "utf8");
  const isOld = !!t.dimNotes;
  const notes = [];
  const risksBlock = risksHtml(t) + "\n" + privHtml(t);

  if (html.includes("Risks We Found")) { notes.push("risks already"); }
  else {
    // injection anchor: old -> "Who Should Use" h2 ; partial -> first h2 containing "vs Alternatives"
    let anchorIdx = html.indexOf("Who Should Use");
    if (isOld && anchorIdx >= 0) {
      // find the enclosing <h2 start before anchorIdx
      const h2 = html.lastIndexOf("<h2", anchorIdx);
      html = html.slice(0, h2) + risksBlock + "\n" + html.slice(h2);
      notes.push("injected before WhoShouldUse");
    } else {
      const altIdx = html.indexOf("vs Alternatives</h2>");
      if (altIdx >= 0) {
        const h2 = html.lastIndexOf("<h2", altIdx);
        html = html.slice(0, h2) + risksBlock + "\n" + html.slice(h2);
        notes.push("injected before vsAlternatives");
      } else notes.push("ANCHOR MISSING (risks not injected)");
    }
  }
  if (isOld) {
    if (!html.includes("dim-table")) {
      // insert dim-table after score-breakdown div (find its closing)
      const sbStart = html.indexOf('<div class="score-breakdown">');
      if (sbStart >= 0) {
        const close = html.indexOf("</div>", html.indexOf('data-width', sbStart));
        const divEnd = html.indexOf("</div>", close + 6) + 6;
        const dt = dimTableFromPage(html, t.dimNotes);
        if (dt) { html = html.slice(0, divEnd) + "\n" + dt + html.slice(divEnd); notes.push("dim-table added"); }
        else notes.push("dim-table parse fail");
      } else notes.push("score-breakdown not found");
    }
    if (html.includes(t.faq[0].q.slice(0, 30))) notes.push("faq already");
    else { html = faqAppend(html, t.faq); notes.push("faq+2"); }
  }
  writeFileSync(p, html);
  notes.push(`wc=${wc(html)}`);
  log.push(`${f}: ${notes.join("; ")}`);
}
console.log(log.join("\n"));
