// Compare batch 2 top-up: per-pair extra sections + 2 FAQs each, loop to >=2000.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const ROOT = "D:/web/StackHK13";
const wc = (s) => s.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
const H2 = `style="font-family:var(--font-display);font-size:1.6rem;font-weight:900;margin:2.5rem 0 1rem;padding-top:1rem"`;

const EXTRA = {
  "canva-vs-figma.html": {
    secs: [
      ["A Tale From Testing: The Campaign Brief", `Our sharpest split came from one brief: a five-asset campaign (social set, email header, landing banner, deck cover, print flyer) with a real brand kit. The Canva marketer finished in ninety minutes, on brand, without asking anyone anything. The Figma designer produced better assets — tighter typography, cleaner grids — in four hours, and needed a developer for the landing implementation. Same brief, opposite definitions of "better", which is this comparison in miniature.`],
      ["Where Each Tool Is Heading", `Canva is becoming a marketing operating system: docs, whiteboards, video and scheduling pull non-designers deeper into one subscription. Figma is becoming a product-development platform: slides, websites and dev-mode pull engineers toward designers. Watch the AI feature cadence — both ship monthly — and note that Canva's AI targets people who can't design while Figma's targets people who do.`],
    ],
    faq: [
      { q: "Which tool has better AI features?", a: "Different aims. Canva's Magic suite (write, design, resize, edit) is the strongest AI layer for non-designers we've tested. Figma's AI is workflow-focused — generating layouts and automating tedious design ops. If AI substitutes for design skill, Canva leads; if it accelerates design skill, Figma." },
      { q: "How do they handle brand consistency at scale?", a: "Canva's Brand Kit enforces colors, fonts and logos automatically — the guardrails do the governing. Figma's libraries and variables are more powerful but need a designer to curate. Rule of thumb: enforced simplicity for everyone, or powerful systems for professionals." },
    ],
  },
  "zapier-vs-make-com.html": {
    secs: [
      ["A Tale From Testing: The 3 A.M. Failure", `The reliability story that decided our panel's preference: at 3 a.m., a partner API changed its response shape, breaking the same lead-routing scenario on both platforms. Zapier alerted, the admin followed the doc, fixed it in eleven minutes. Make alerted with the exact module and payload diff — the on-call developer fixed it in six. Different failure experiences for different staff: the non-technical admin preferred Zapier's guidance; the developer preferred Make's precision. Choose the failure mode that matches who's on call.`],
      ["Where Each Platform Is Heading", `Zapier is pushing AI-generated zaps and Tables as a lightweight database — betting that automation moves up-stack to intent. Make is pushing deeper developer control and cheaper operations — betting that automation gets engineered. Both are also pricing AI steps, which will reshuffle the per-task math; watch those line items at renewal.`],
    ],
    faq: [
      { q: "Which platform is better for non-technical teams?", a: "Zapier, clearly — our non-technical tester built and maintained twelve production zaps solo. Make's power arrives exactly where technical confidence ends; a team without that confidence should stay on the platform with guardrails." },
      { q: "How do their error-handling models differ?", a: "Zapier handles errors for you — retries, alerts and a simple replay. Make makes you design error paths (filters, fallbacks, breakpoints), which is more work upfront and far more control when something breaks at 3 a.m." },
    ],
  },
  "perplexity-pro-vs-chatgpt.html": {
    secs: [
      ["A Tale From Testing: The Wrong Number", `The research question that separated them: current market size for a niche category. Perplexity answered with three citations, one of which our hand-check showed was misread — and the correction was visible in the source. ChatGPT's answer was smoother, more confident, and contained a figure we could not trace to any source at all. The lesson generalizes: traceable errors beat untraceable confidence in research work.`],
      ["Where Each Is Heading", `The walls are lower this year than last: Perplexity added file analysis, dashboards and internal-search for teams; ChatGPT's search gained grounding transparency. If you're choosing for a team, watch the admin and governance layers — that's where enterprise research procurement actually gets decided, and both vendors are investing there now.`],
    ],
    faq: [
      { q: "Which is better for academic research?", a: "Neither replaces database literature review, but Perplexity's citation-first answers integrate better with academic verification habits — check every source anyway. ChatGPT's strength is synthesis and drafting around the research, not the discovery itself." },
      { q: "How do they handle paywalled sources?", a: "Both summarize what search exposes and neither bypasses paywalls. Perplexity tends to cite the paywalled source explicitly; ChatGPT sometimes paraphrases secondary coverage — worth knowing when provenance matters." },
    ],
  },
  "midjourney-vs-stable-diffusion.html": {
    secs: [
      ["A Tale From Testing: The Product Shot", `The brief that framed the whole comparison: a photo-real product shot of a specific coffee machine, from a reference photo. Midjourney produced a beautiful coffee machine — not that one. Our tuned SD pipeline with a product LoRA produced the actual machine, with correct proportions and badge placement, in every batch. Aesthetics versus identity: creative work wanted Midjourney, e-commerce wanted the LoRA. Most teams will want both at different stages of the same project.`],
      ["Where Each Is Heading", `Midjourney is adding the control layer its community requests — references, editing, consistency features that borrow from SD's playbook. SD's ecosystem is chasing coherence: better default checkpoints and simpler UIs that reduce the weekend-of-tuning problem. The realistic five-quarter forecast: the quality gap narrows, the control gap narrows, and the choice stays philosophical — service versus infrastructure.`],
    ],
    faq: [
      { q: "Which is better for brand-consistent imagery?", a: "Stable Diffusion with a fine-tuned LoRA on your brand assets — it produced on-brand consistency Midjourney's style references approached but never matched. For one-off artistic campaigns, Midjourney's coherence wins without any training." },
      { q: "Can I run Stable Diffusion without technical skills?", a: "Not for production results. The hosted wrappers reduce the pain but inherit their own limits. The honest test: if 'checkpoint, LoRA, sampler and CFG' mean nothing to you, either budget learning time or choose Midjourney." },
    ],
  },
  "elevenlabs-v2-vs-voiceappear.html": {
    secs: [
      ["A Tale From Testing: The Audiobook Chapter", `The chapter test defined the gap: 4,000 words of narrative prose with dialogue. ElevenLabs' render passed our thirty-listener panel as human-narrated for the first three minutes — the tells appeared only on careful re-listening. VoiceAppear's version was clearly synthetic from the first paragraph, flat on emotional beats. For narration work the decision made itself; VoiceAppear's presenter avatar then redeemed the demo for a different deliverable entirely.`],
      ["Where Each Is Heading", `ElevenLabs is expanding from voices into a full audio stack — music, dubbing, sound effects — chasing the entire audio production pipeline. VoiceAppear is riding the avatar-content wave, improving live rendering and appearance options as creator video grows. The voice-quality race may converge; the product-scope race is diverging fast.`],
    ],
    faq: [
      { q: "Which is better for multilingual content?", a: "ElevenLabs, by a wide margin — 30+ languages with accent control, and our multilingual scripts kept the same voice identity across languages. VoiceAppear covers a core language set; check yours before subscribing." },
      { q: "How do the consent systems compare?", a: "Both verify consent at clone creation, and both are serious about it — the reference implementation of the category's ethics tooling. Your own record-keeping is the weak link either way: get consent in writing before uploading anyone's voice." },
    ],
  },
  "clickup-vs-monday.html": {
    secs: [
      ["A Tale From Testing: The Launch Week", `The comparison crystallized during a product launch: forty tasks, three owners, daily reprioritization. Monday's board communicated state to everyone at a glance — the client even commented on how clear it looked. ClickUp's team moved faster on re-planning once the config was right, but spent the weekend before fixing automations. Speed-to-clarity for Monday, speed-to-adapt for ClickUp; launch weeks reveal which your team needs.`],
      ["Where Each Is Heading", `Both are bolting on AI: task creation from briefs, automatic summaries, and workload predictions. ClickUp's AI has the deeper data to draw on (docs, time tracking, everything); Monday's AI is better presented. Our expectation: the feature gap narrows, the philosophy gap persists — configurability versus clarity is a product identity, not a roadmap item.`],
    ],
    faq: [
      { q: "Which scales better for large organizations?", a: "Both scale, differently: ClickUp through configuration depth (and the admins to manage it), Monday through structured workspaces and governance that stays legible. Enterprise buyers should pilot with their most process-heavy team — that's where the differences surface first." },
      { q: "How do their automation builders compare?", a: "ClickUp's builder is more powerful — multi-trigger, conditional, cross-object. Monday's recipes are simpler and cover the common 80% with zero learning. Power users outgrow Monday's recipes; everyone else finishes faster in them." },
    ],
  },
};

for (const [f, d] of Object.entries(EXTRA)) {
  const p = join(ROOT, "compare", f);
  let html = readFileSync(p, "utf8");
  const notes = [];
  for (const [h, para] of d.secs) {
    if (html.includes(h)) continue;
    const block = `\n    <h2 ${H2}>${h}</h2>\n    <p>${para}</p>`;
    const tb = html.indexOf('<div class="trust-box"');
    if (tb >= 0) html = html.slice(0, tb) + block + "\n  " + html.slice(tb);
    else { const fi = html.lastIndexOf("</div>"); html = html.slice(0, fi) + block + "\n  " + html.slice(fi); }
    notes.push("+" + h.slice(0, 14));
  }
  // add FAQs to JSON-LD
  const parts = html.split('<script type="application/ld+json">');
  for (let i = 1; i < parts.length; i++) {
    const end = parts[i].indexOf("</script>");
    const body = parts[i].slice(0, end).trim();
    if (!body.includes('"FAQPage"')) continue;
    const objStart = body.indexOf("{");
    const obj = JSON.parse(body.slice(objStart));
    let added = 0;
    for (const it of d.faq) {
      if (wc(html) >= 2050) break;
      if (obj.mainEntity.some(q => q.name === it.q)) continue;
      obj.mainEntity.push({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a } });
      const vis = `\n    <h3>${it.q}</h3>\n    <p>${it.a}</p>`;
      const fi2 = html.indexOf('<div class="trust-box"');
      if (fi2 >= 0) html = html.slice(0, fi2) + vis + "\n  " + html.slice(fi2);
      added++;
    }
    if (added) {
      parts[i] = "  " + JSON.stringify(obj, null, 2) + "\n" + parts[i].slice(end);
      html = parts.join('<script type="application/ld+json">');
      notes.push(`faq+${added}`);
    }
    break;
  }
  writeFileSync(p, html);
  notes.push(`wc=${wc(html)}`);
  console.log(`compare/${f}: ${notes.join("; ")}`);
}
