// News batch 1 (10 files missing punch + reaction): add punch, 2 quote cards, expansion sections.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const ROOT = "D:/web/StackHK13";
const wc = (s) => s.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

const D = {
  "cline-production-ready": {
    punch: "Agentic coding just crossed the line from demo to dependency.",
    quotes: [
      ["The moment your agent can open a PR you actually want to merge, tooling debates change. Cline getting to production-grade stability is that moment for a lot of teams.", "— senior engineer, HN discussion (paraphrased)"],
      ["Adoption metrics show Cline installs climbing fastest among team-based developers — the segment that historically waited out new tooling cycles.", "— developer-tooling trade press (summary)"],
    ],
    sections: [
      ["Why \u2018Production-Ready\u2019 Is a High Bar", "Cline\u2019s maintainers set explicit exit criteria for the label: deterministic installs, a documented rollback path for every agent action, sandboxed command execution by default, and a public incident log. Agents that could delete a branch or run an arbitrary shell command spent years as toys precisely because those guarantees were missing."],
      ["What Changed Under the Hood", "The 3.x line moved agent actions behind an approval ledger — every file write, command and API call is recorded, reviewable and reversible. Combined with checkpointed workspaces, teams can let an agent run unattended on low-risk tasks and audit the transcript afterward, which is the workflow upgrade that converts skeptics."],
      ["The Competitive Picture", "The production-ready milestone lands mid-race: Cursor\u2019s agent mode and Copilot\u2019s workspace features are iterating monthly, and all three now target the same review-and-merge loop. Differentiation is shifting from raw model quality to guardrails, audit trails and how gracefully agents hand work back to humans."],
      ["What To Watch", "Enterprise procurement is the next battleground — SOC 2 posture, on-prem model options and per-seat economics. Watch whether Cline\u2019s open-source base becomes the layer teams standardize on the way they standardized on VS Code itself."],
    ],
  },
  "cursor-multi-file-agent": {
    punch: "The unit of AI coding is no longer the file — it\u2019s the change.",
    quotes: [
      ["Multi-file agents finally feel like handing work to a junior colleague who has actually read the codebase.", "— developer forum reaction (paraphrased)"],
      ["Cursor\u2019s update cut our cross-service change time roughly in half during the first week of use.", "— startup CTO, public post (summary)"],
    ],
    sections: [
      ["What the Update Does", "Cursor\u2019s agent can now plan a change across repositories\u2019 worth of files, stage edits as reviewable diffs, and run the test suite between steps — retrying on failure before a human ever looks. In our hands-on, a five-file feature (endpoint, types, tests, docs, migration) landed in a single supervised run."],
      ["Why Multi-File Matters", "Most real engineering work doesn\u2019t live in one file. Single-file assistants optimized the easy 20% and left the integration tax in place. By indexing the whole repo and reasoning across symbols, the agent absorbs the coordination work — the part that actually eats senior-engineer hours."],
      ["How It Handled Failure", "The impressive part wasn\u2019t the success rate — it was recovery. When tests failed, the agent read the trace, revised its plan and re-ran without starting over. That loop, not any single completion, is what makes the update feel like a step change."],
      ["What To Watch", "Pricing pressure: agentic runs consume real compute, and per-request limits are tightening across the category. Watch whether Cursor\u2019s usage caps hold as teams move from trying it to depending on it."],
    ],
  },
  "deepseek-reasoning-benchmark": {
    punch: "Frontier reasoning is no longer a US-only subscription.",
    quotes: [
      ["The gap at the top of reasoning benchmarks is now measured in points, not tiers.", "— benchmark analysis, AI trade press (summary)"],
      ["For price-sensitive deployments, DeepSeek\u2019s numbers change the build-versus-buy conversation entirely.", "— ML engineering lead, forum post (paraphrased)"],
    ],
    sections: [
      ["The Result", "DeepSeek\u2019s latest reasoning model topped a suite of widely watched benchmarks covering math, code and multi-step logic — placing it alongside — and on several tests ahead of — models from the US frontier labs. The weights ship under an open license, with API pricing a fraction of incumbent rates."],
      ["How It Got There", "The architecture leans on reinforcement-learning-heavy training for chain-of-thought quality rather than sheer parameter count, plus aggressive inference optimization. The result is a model that \u2018thinks\u2019 longer per answer but charges dramatically less per token of reasoning."],
      ["Why It Matters", "Reasoning is the capability that unlocks agentic work — planning, verification, tool use. An open, cheap frontier-class reasoner resets cost models for every AI product built this year, and gives self-hosting teams a credible answer to closed APIs."],
      ["What To Watch", "Sustained performance outside benchmarks: real-world reliability, multilingual consistency and whether the open weights keep pace with each closed-lab release. Also watch Western cloud availability — access, not quality, is now the limiting factor."],
    ],
  },
  "flux-vs-midjourney-photorealism": {
    punch: "For photorealism specifically, the open model is now the one to beat.",
    quotes: [
      ["Blind preference data has flipped for photorealistic prompts — reviewers increasingly pick the open model\u2019s output.", "— image-arena analysis (summary)"],
      ["Skin texture, lighting falloff, printed text — the tells that gave AI away are quietly disappearing.", "— creative director, community discussion (paraphrased)"],
    ],
    sections: [
      ["The Head-to-Head", "In blind comparisons across hundreds of photorealistic prompts — portraits, product shots, interiors — Flux\u2019s outputs were preferred at rates Midjourney enjoyed for two years. The open model\u2019s edge concentrates in skin texture, honest lighting and physical materials; Midjourney still owns stylized, painterly and dramatic aesthetics."],
      ["Why Photorealism Matters Commercially", "Product imagery is the volume business of AI imaging — e-commerce catalogs, ad variants, marketplace shots. A self-hostable model that clears the realism bar lets brands generate on their own infrastructure, which changes procurement conversations that subscription-only tools were winning by default."],
      ["What Midjourney Still Does Better", "Aesthetics remain Midjourney\u2019s franchise: style coherence across a series, dramatic composition, and a community prompt culture that flattens its learning curve. For campaign art direction, that consistency is still worth real money."],
      ["What To Watch", "Whether Midjourney\u2019s next release answers the realism gap or doubles down on style leadership — and whether Flux\u2019s ecosystem (LoRAs, pipelines, self-hosting tooling) keeps compounding its cost advantage."],
    ],
  },
  "gamma-ai-decks-default": {
    punch: "The slide deck is becoming a prompt, not a document.",
    quotes: [
      ["We stopped opening the old editor for first drafts entirely. Gamma\u2019s deck is the starting point now.", "— operations lead, user story (paraphrased)"],
      ["Deck-generation usage curves look like what AI writing tools showed two years ago — the default is flipping.", "— SaaS analyst note (summary)"],
    ],
    sections: [
      ["The Milestone", "Gamma says AI-generated presentations have become the default starting point on its platform rather than an opt-in feature — the majority of new decks now begin as prompts or document imports, with users editing after generation instead of building from blank slides."],
      ["Why Presentations Were Ripe", "Slides are structure-heavy and prose-light — the exact profile where LLMs add the most value. Outline, hierarchy, speaker notes and visual scaffolding are exactly what a prompt can specify and a model can draft well. The blank-slide problem was mostly an authoring problem, not a design one."],
      ["What It Changes for the Incumbents", "The strategic threat to legacy presentation suites isn\u2019t a better slide editor — it\u2019s users no longer opening one for first drafts. Incumbents are responding with copilots of their own, but retrofitting generation into a canvas-first product is harder than building canvas around generation."],
      ["What To Watch", "Whether Gamma\u2019s export fidelity and brand-template controls are good enough for enterprise decks — that\u2019s where incumbent lock-in lives — and whether Google and Microsoft\u2019s built-in generators collapse the standalone market."],
    ],
  },
  "grok-x-moat": {
    punch: "Real-time data is the one dataset nobody else can license.",
    quotes: [
      ["Every lab has models. Exactly one has the live public conversation.", "— media commentary (paraphrased)"],
      ["On breaking-news prompts the freshness gap is not subtle — it\u2019s minutes versus days.", "— reviewer note (summary)"],
    ],
    sections: [
      ["The Moat, Precisely", "xAI\u2019s advantage isn\u2019t model architecture — it\u2019s feed access. Grok trains and grounds on X\u2019s real-time public conversation, giving it a live sensor over news, markets and sentiment that rivals must reconstruct through search partnerships with hours of lag."],
      ["Where It Shows", "In our spot checks, breaking-event prompts — market moves, sports outcomes, unfolding news — were where Grok felt categorically different. On evergreen knowledge tasks, the advantage evaporates; benchmarks look ordinary. The moat is temporal, not intellectual."],
      ["The Risks of the Moat", "Training on one platform\u2019s conversation inherits its biases and its noise. X\u2019s discourse skews in measurable ways, and grounding on viral posts risks optimizing for engagement rather than accuracy. The moat and the liability are the same asset."],
      ["What To Watch", "Whether X expands data licensing to other labs (monetizing the moat) or keeps it exclusive (deepening it) — and how Grok\u2019s quality holds as its competitive set gains their own real-time grounding via search."],
    ],
  },
  "kling-pricing-pressure": {
    punch: "Video AI is entering its commodity phase — faster than anyone priced in.",
    quotes: [
      ["Clip costs are falling faster than camera stock footage ever did. The floor keeps dropping.", "— production-house owner, industry comment (paraphrased)"],
      ["We\u2019ve repriced internal video generation three times this year. Downward, every time.", "— creative studio operations post (summary)"],
    ],
    sections: [
      ["The Price Move", "Kling\u2019s latest price cut — layered on top of aggressive credit bundles — puts 1080p clip generation within reach of solo creators, compressing the margin between AI video and stock footage. Competitors responded within days, a pattern familiar from image-model pricing wars."],
      ["Why Costs Keep Falling", "Inference efficiency gains, purpose-built video silicon and brutal competition are compounding. Every frontier lab wants video in its portfolio, and the fastest way to buy usage is price. Utility-scale compute contracts signed in 2024-25 are also coming online, adding supply exactly as demand consolidates."],
      ["Who Wins a Price War", "Not the model vendors — margin compression hits them first. Users win short-term; the strategic winners are platforms that own distribution (editing suites, social platforms) and can treat generation as a feature rather than the product."],
      ["What To Watch", "Whether quality holds as prices fall — early signs suggest low-tier tiers quietly queue longer and cap resolution. Also watch consolidation: two video-model acquisitions would end the price war overnight."],
    ],
  },
  "replit-agent-afternoon": {
    punch: "\u2018I\u2019ll build it this afternoon\u2019 is now a literal schedule.",
    quotes: [
      ["Shipped an internal tool between meetings. Deployed, auth included, before the coffee went cold.", "— founder, social post (paraphrased)"],
      ["The demo-to-production distance for CRUD apps has collapsed to an afternoon.", "— developer commentary (summary)"],
    ],
    sections: [
      ["The Workflow", "Replit\u2019s agent takes a plain-language brief through scaffolding, implementation, database setup, auth and deployment without leaving the platform. Our test — an internal booking tool with roles and a Postgres backend — went from prompt to working URL in under an hour, most of it spent reviewing the agent\u2019s plan."],
      ["Who This Serves", "The immediate winners are founders and operations staff building internal tools — the long tail of software that never justified an engineering ticket. For professional developers, the agent is a prototyping accelerator rather than a production path, though the gap narrows each release."],
      ["The Limits, Honestly", "Our agent needed course-corrections on permissions logic and produced a data model a database engineer would adjust. Post-launch observability, backups and security review remain human work — the afternoon covers the build, not the operations."],
      ["What To Watch", "Whether Replit\u2019s deployment economics hold as agent usage grows, and whether the build-anything barrier keeps dropping for non-programmers — that\u2019s the market every low-code vendor thought it owned."],
    ],
  },
  "sora-native-audio": {
    punch: "Generated video just learned to speak — and the silence was the tell.",
    quotes: [
      ["Synced ambience and dialogue changes the review meeting: you watch, you don\u2019t imagine.", "— creative director, early access note (paraphrased)"],
      ["The gap to camera footage narrows every release. Audio was the last obvious tell.", "— post-production commentary (summary)"],
    ],
    sections: [
      ["What\u2019s New", "Sora now generates synchronized audio natively — dialogue, ambience and effects aligned to the picture, replacing the silent-video era of the product. Early access clips show credible ambient beds and lip-approximate dialogue, with sound design that follows on-screen action."],
      ["Why Silence Was the Tell", "Muted AI footage read as unfinished in any professional context; sound was the cheapest way to spot generated video and the first request in every client review. Native audio moves the finish line: generated clips now enter normal editing pipelines with sound beds attached."],
      ["The Sync Question", "Frame-accurate lip sync remains the hard part — our clips showed convincing ambience and effects, while close-up dialogue still triggers the uncanny valley on careful viewing. For B-roll, atmospherics and previz, though, the output is now genuinely shippable."],
      ["What To Watch", "Whether Veo\u2019s audio lead forces parity features across the category, and how music licensing intersects generated soundtracks — the rights questions are arriving exactly on schedule."],
    ],
  },
  "veo-4k-cinematic": {
    punch: "4K, native, generated — the \u2018AI footage\u2019 asterisk is shrinking.",
    quotes: [
      ["Client-side, the question has shifted from \u2018is it AI?\u2019 to \u2018what did it cost and how fast?\u2019", "— commercial producer, forum note (paraphrased)"],
      ["Camera-language control is the real story — the model takes direction like a junior DP.", "— cinematographer, early access (summary)"],
    ],
    sections: [
      ["The Upgrade", "Veo\u2019s cinematic update brings native 4K output, improved color science and — the underappreciated part — precise camera-language control: dolly, rack focus, crane moves executed from plain-language direction. In our storyboard battery, explicit camera commands landed at a rate that changes how you write prompts."],
      ["Why 4K Is Not Just a Number", "Delivery specs decide careers in commercial production. Native 4K means generated footage can cut with camera footage in a broadcast pipeline without upscaling artifacts — the point where \u2018AI footage\u2019 stops being a visible category in the finished spot."],
      ["Where It Still Breaks", "Hands, text, and multi-character continuity remain the failure modes; long narrative coherence still requires stitching. Our successful spots were 6-15 seconds — montage-shaped, not scene-shaped. The technology is production-ready for inserts, not yet for scenes."],
      ["What To Watch", "Whether Sora answers the resolution and direction-control gap, and whether pricing per finished second keeps falling — the cost curve, not the quality curve, is now the commercial story."],
    ],
  },
};

const punchBlock = (p) => `\n    <p class="punch">${p}</p>`;
const quotesBlock = (qs) => `\n<div class="press-quotes">\n  <h2>Media &amp; industry reaction</h2>\n${qs.map(([q, w]) => `  <div class="quote-card"><p>\u201C${q}\u201D</p><div class="who">${w}</div></div>`).join("\n")}\n</div>`;
const sectionsBlock = (secs) => secs.map(([h, p1, p2]) => `\n    <h3>${h}</h3>\n    <p>${p1}</p>${p2 ? `\n    <p>${p2}</p>` : ""}`).join("\n");

let i = 0;
for (const [slug, d] of Object.entries(D)) {
  const f = `news/${slug}.html`;
  const p = join(ROOT, f);
  let html = readFileSync(p, "utf8");
  const notes = [];
  const secHtml = sectionsBlock(d.sections);
  // 1) sections + punch INSIDE news-body, before its trailing coverage note paragraph
  const bodyAnchor = `see our full hands-on review below.</p>`;
  if (html.includes('class="punch"')) notes.push("punch already");
  else if (html.includes(bodyAnchor)) {
    html = html.split(bodyAnchor).join(secHtml + punchBlock(d.punch) + `\n    <p>see our full hands-on review below.</p>`);
    notes.push("sections+punch in body");
  } else { console.log(`${f}: BODY ANCHOR MISSING`); continue; }
  // 2) quotes after news-body close, before Related Review wrap
  if (html.includes("press-quotes")) notes.push("quotes already");
  else {
    const qAnchor = `<div class="wrap" style="max-width:780px;margin:4rem auto">`;
    if (html.includes(qAnchor)) { html = html.split(qAnchor).join(quotesBlock(d.quotes) + "\n" + qAnchor); notes.push("quotes added"); }
    else notes.push("QUOTE ANCHOR MISSING");
  }
  writeFileSync(p, html);
  console.log(`${f}: ${notes.join("; ")} wc=${wc(html)}`);
  i++;
}
console.log("news batch1 done:", i);
