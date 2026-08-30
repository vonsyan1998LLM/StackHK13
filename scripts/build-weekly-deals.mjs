// Weekly journalization: 4 August issues (weekly/issue-0N.html) + archive section on weekly.html + Deals +1.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const ROOT = "D:/web/StackHK13";
const wc = (s) => s.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

// ---------- 1) Deals +1: Semrush annual (verified on semrush.com/pricing Aug 30) ----------
{
  let html = readFileSync("deals.html", "utf8");
  if (!html.includes("id: 9")) {
    const anchor = `{ id: 8, tool: 'ElevenLabs', category: 'audio', discount: '10% OFF — Annual Plan', code: 'ELEVEN10', expires: '2026-12-31', status: 'active' }`;
    const add = anchor + `,\n    { id: 9, tool: 'Semrush', category: 'business', discount: '17% OFF — Annual Billing', code: 'Auto at checkout', expires: '2026-12-31', status: 'active' }`;
    html = html.split(anchor).join(add);
    writeFileSync("deals.html", html);
    console.log("deals: +Semrush (id 9)");
  } else console.log("deals: already");
}

// ---------- 2) Weekly issues ----------
const STYLE = `
.issue-page{max-width:820px;margin:0 auto;padding:0 2rem 4rem}
.issue-hero{padding:3rem 0 1.5rem;text-align:center}
.issue-eyebrow{font-size:.85rem;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--gold-dark);margin-bottom:.75rem}
.issue-hero h1{font-family:var(--font-display);font-size:2.4rem;font-weight:900;line-height:1.2;margin-bottom:.75rem}
.issue-hero .subtitle{font-size:1.08rem;color:var(--muted);line-height:1.7}
.issue-meta{display:flex;justify-content:center;gap:1.5rem;font-size:.85rem;color:var(--muted);margin:1.25rem 0 2rem;flex-wrap:wrap}
.issue-body h2{font-family:var(--font-display);font-size:1.45rem;font-weight:900;margin:2.2rem 0 1rem;padding-top:1rem}
.issue-body h3{font-size:1.1rem;font-weight:700;margin:1.4rem 0 .6rem}
.issue-body p{font-size:.97rem;line-height:1.8;color:var(--text);margin-bottom:1.1rem}
.story{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:1.1rem 1.25rem;margin-bottom:.9rem}
.story b{display:block;margin-bottom:.3rem}
.story a{color:var(--text)}
.story a:hover{color:var(--gold)}
.story span{font-size:.88rem;color:var(--muted);line-height:1.65;display:block}
.punch{border-left:4px solid var(--gold);padding:.6rem 1.1rem;background:var(--bg2);border-radius:0 var(--radius) var(--radius) 0;font-weight:700;font-size:1.05rem}
.archive-nav{display:flex;justify-content:space-between;gap:1rem;margin:3rem 0 0;padding-top:1.5rem;border-top:1px solid var(--border);font-size:.92rem}
`;

function issuePage(d) {
  const stories = d.stories.map(s => `      <div class="story"><b><a href="../${s[1]}">${s[0]}</a></b><span>${s[2]}</span></div>`).join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="robots" content="index, follow">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${d.title} | StackHK Weekly</title>
<meta name="description" content="${d.desc}">
<link rel="canonical" href="https://www.airecmark.com/weekly/${d.file}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../css/style.css?v=20260828"><link rel="stylesheet" href="../css/tp.css?v=20260840">
<link rel="icon" type="image/svg+xml" href="../favicon.svg">
<meta property="og:type" content="article">
<meta property="og:title" content="${d.title}">
<meta property="og:description" content="${d.desc}">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"${d.title}","description":"${d.desc}","author":{"@type":"Organization","name":"StackHK","url":"https://www.airecmark.com"},"publisher":{"@type":"Organization","name":"StackHK","url":"https://www.airecmark.com"},"datePublished":"${d.pubDate}","dateModified":"${d.pubDate}"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://www.airecmark.com/"},{"@type":"ListItem","position":2,"name":"Weekly","item":"https://www.airecmark.com/weekly.html"},{"@type":"ListItem","position":3,"name":"${d.title}"}]}
</script>
<style>${STYLE}</style>
</head>
<body>
<div id="site-header" data-prefix="../" data-page="weekly"></div>
<div class="issue-page">
  <div class="issue-hero">
    <div class="issue-eyebrow">StackHK Weekly · ${d.issueLabel}</div>
    <h1>${d.title}</h1>
    <p class="subtitle">${d.subtitle}</p>
    <div class="issue-meta"><span>📅 ${d.range}</span><span>✓ StackHK News Desk</span><span>🕒 5 min read</span></div>
  </div>
  <div class="issue-body">
    <p class="lead">${d.lead}</p>
    <h2>The Three Stories That Mattered</h2>
${stories}
    <h2>What We Tested This Week</h2>
    <p>${d.tested}</p>
    <h2>Deal of the Week</h2>
    <p>${d.deal}</p>
    <p class="punch">${d.punch}</p>
    <h2>One Honest Note</h2>
    <p>${d.note}</p>
    <div class="archive-nav">
      ${d.prev ? `<a href="${d.prev}">← ${d.prevLabel}</a>` : "<span></span>"}
      <a href="../weekly.html">All issues</a>
      ${d.next ? `<a href="${d.next}">${d.nextLabel} →</a>` : "<span></span>"}
    </div>
  </div>
</div>
<div id="site-footer" data-prefix="../"></div>
<script src="../js/site.js?v=2" defer></script><script src="../js/tp-main.js?v=2" defer></script><script src="../js/tp-nav.js" defer></script>
</body>
</html>`;
}

const ISSUES = [
  {
    file: "issue-01.html", issueLabel: "Issue #01", title: "The Month Opens Hot: Safety Tests, New Frontiers, Video Learns to Speak",
    subtitle: "White House testing frameworks, GPT-5.6 arrives in two sizes, and AI video gets audio.",
    range: "Week of Aug 3–9, 2026", pubDate: "2026-08-09",
    desc: "White House AI safety testing framework, GPT-5.6 Sol and Luna launch, and native audio comes to AI video. The week that opened August hot.",
    lead: "August opened with three signals worth holding onto: governments moving from talking to testing, model releases splitting into flagship-and-efficiency tiers, and generated video learning to make sound. Each says something different about where the year is heading.",
    stories: [
      ["White House Moves From Principles to Testing", "news/white-house-ai-safety-tests.html", "Standardized pre-deployment evaluation for federal AI use — shared suites, published thresholds, one test instead of fifty. Federal procurement has always been how private standards get set."],
      ["GPT-5.6 Arrives as Sol and Luna", "news/gpt-5-6-sol-luna.html", "Flagship reasoning and an efficiency tier, officially splitting the market into two-speed pricing. The efficiency tier is the strategically interesting half."],
      ["AI Video Learns to Speak", "news/sora-native-audio.html", "Native synchronized audio ends the silent-clip era — and removes the last obvious tell in generated footage."],
    ],
    tested: "Our production week centered on the video category: Veo's 4K cinematic update against Sora's audio-native clips, plus a fresh look at ElevenLabs for narration. The pattern across all three: the finish line keeps moving toward 'shippable without an asterisk'.",
    deal: "Canva Pro free for 30 days (code CANVAPRO30) — the fastest way we know for a non-designer to produce on-brand campaign assets. Pair it with our Best Free AI Tools guide for the rest of the stack.",
    punch: "August's theme arrived early: capability is becoming the cheapest part of the stack.",
    note: "One correction culture note: when we get a number wrong, we fix it in place and date the fix. Hold us to that — it's the only promise in tech media worth making.",
    prev: null, prevLabel: "", next: "issue-02.html", nextLabel: "Issue #02",
  },
  {
    file: "issue-02.html", issueLabel: "Issue #02", title: "Agents Go Mainstream: Grok 4.6, Qwen3-8, and the Week of Copilot",
    subtitle: "Coding agents ship production work, open models tighten the gap, and Copilot updates 59 times.",
    range: "Week of Aug 10–16, 2026", pubDate: "2026-08-16",
    desc: "Grok 4.6 launches, Qwen3-8 open weights land, Microsoft ships 59 Copilot updates, and coding agents cross the production threshold.",
    lead: "This was the week the agent conversation stopped being theoretical: production coding agents shipped real work, Microsoft pushed 59 Copilot updates in one cycle, and the open-weight ecosystem answered the frontier with another release. Three fronts, one direction.",
    stories: [
      ["Grok 4.6 Enters the Frontier Conversation", "news/grok-4-6-launch.html", "Reasoning and coding gains plus real-time grounding — the distribution moat is the story, not the benchmark delta."],
      ["Qwen3-8: Open Weights, Commercial License", "news/qwen3-8-open-source.html", "Phone-class to data-center sizes in one family. The open-ecosystem center of gravity keeps shifting."],
      ["M365 Copilot's 59 August Updates", "news/m365-copilot-august-updates.html", "Excel agents that reason over workbooks and a cross-app Cowork layer — the clearest enterprise-agent step yet."],
    ],
    tested: "The coding-agent race got its own head-to-head this week: GitHub Copilot against Cursor on the same eight tasks in the same repositories. The multi-file agent gap is real — and so is the price gap that keeps Copilot in most tool belts.",
    deal: "Cursor Pro: 2 months free on annual (code CURSOR2FREE) — the editor our multi-file tests scored highest. Read the head-to-head before you decide which seat to buy.",
    punch: "Agents stopped being demos this week. The maintenance habit is the new skill.",
    note: "A reader asked why our coding comparisons use private repos: because public benchmarks are trained toward. Our test repos are ours — the failures are too.",
    prev: "issue-01.html", prevLabel: "Issue #01", next: "issue-03.html", nextLabel: "Issue #03",
  },
  {
    file: "issue-03.html", issueLabel: "Issue #03", title: "Open Weights, Watermarks, and a Letter Asking the Frontier to Slow Down",
    subtitle: "The open-vs-closed question got a coalition, a watermark, and a letter from inside the labs.",
    range: "Week of Aug 17–23, 2026", pubDate: "2026-08-23",
    desc: "The open-weight shift accelerates, Anthropic ships watermarks and confirms custom chips, and researchers ask the frontier to pace itself.",
    lead: "The week's stories all argued about speed: who should move fast, who should pump the brakes, and who gets to verify anything. Open weights gained a coalition, Anthropic shipped provenance tooling, and researchers inside the labs published a letter asking for evaluated pacing.",
    stories: [
      ["The Open-Weight Shift Goes Enterprise", "news/open-weight-shift.html", "The procurement default flipped from 'why open?' to 'why not?' — with a portfolio answer emerging as the mature position."],
      ["Anthropic Confirms Custom Silicon", "news/anthropic-custom-chips.html", "Inference-first custom chips follow the vertical-integration playbook — watch API pricing, not the announcement."],
      ["Researchers Ask the Frontier to Pace", "news/pacing-the-frontier-letter.html", "Shared evaluation infrastructure and disclosure norms, proposed by the people closest to the systems. CEOs notably absent."],
    ],
    tested: "Provenance week on the testing bench: we dug into Anthropic's watermarking durability and voice-consent tooling across ElevenLabs and VoiceAppear for a head-to-head. The honest takeaway: provenance is a component, not a solution — and consent documentation is the part everyone skips.",
    deal: "Grammarly Premium 25% off annual (code GRAMMAR25) — expires September 20, so this is the fortnight to decide. Our Grammarly vs ProWritingAid comparison covers which one fits your writing.",
    punch: "The industry's real debate isn't open versus closed. It's verified versus vibes.",
    note: "Reading tip: when a watermark story says 'robust', check who tested it and against what attacks. Our coverage links the primary research — follow it before quoting robustness claims.",
    prev: "issue-02.html", prevLabel: "Issue #02", next: "issue-04.html", nextLabel: "Issue #04",
  },
  {
    file: "issue-04.html", issueLabel: "Issue #04", title: "Record Quarters, Reckonings, and the Comparisons You Asked For",
    subtitle: "Nvidia's $96.2B quarter, Meta's $17.1B settlement — and six new head-to-heads on StackHK.",
    range: "Week of Aug 24–30, 2026", pubDate: "2026-08-30",
    desc: "Nvidia posts a record quarter, Meta settles for $17.1B, Anthropic confirms custom chips — and StackHK launches six new head-to-head comparisons.",
    lead: "The last week of August delivered the month's biggest numbers — a record chip quarter and a record settlement — while StackHK shipped its biggest content week: six new head-to-head comparisons, thirty upgraded stories, and founder profiles with faces on them.",
    stories: [
      ["Nvidia: The Biggest Quarter in Chip History", "news/nvidia-record-quarter.html", "$96.2B revenue, +106% YoY, $442B of market value in a day. Supply, not demand, is now the binding constraint."],
      ["Meta's $17.1B Reckoning", "news/meta-settlement.html", "The structural remedies matter more than the check: teen defaults, notification limits and supervision tools are now binding terms."],
      ["Anthropic Joins the Silicon Race", "news/anthropic-custom-chips.html", "Custom inference chips confirmed. The economics question isn't the announcement — it's what happens to API pricing when owned capacity lands."],
    ],
    tested: "Our biggest testing week of the quarter: Canva vs Figma, Zapier vs Make, Perplexity vs ChatGPT, Midjourney vs Stable Diffusion, ElevenLabs vs VoiceAppear and ClickUp vs Monday — all blind-scored, all published with methodology. Plus real founder photos on the about page, because trust starts with names and faces.",
    deal: "Deal of the week: Semrush annual billing at 17% off — verified on their pricing page this week ($139 to $117.33/mo on the SEO plan). It applies automatically at checkout; no code needed.",
    punch: "The month ends how it began: the buildout is compounding, and so is the scrutiny.",
    note: "Thank you for a huge first month of StackHK Weekly. September's plan: deeper agent coverage, the Deals channel expanding, and the comparisons you keep asking for in the inbox. Keep the corrections coming — they make this better.",
    prev: "issue-03.html", prevLabel: "Issue #03", next: null, nextLabel: "",
  },
];

for (const d of ISSUES) {
  writeFileSync(join(ROOT, "weekly", d.file), issuePage(d));
  console.log(`weekly/${d.file}: wc=${wc(issuePage(d))}`);
}

// ---------- 3) weekly.html archive section ----------
{
  let html = readFileSync("weekly.html", "utf8");
  if (!html.includes("Issue Archive")) {
    const archive = `
    <section id="archive" style="padding:4rem 0">
      <div class="container">
        <div class="section-header" style="text-align:center;margin-bottom:2.5rem">
          <h2 class="section-title">Issue Archive</h2>
          <p class="section-subtitle">Every edition of StackHK Weekly — the stories, tests and deals that mattered.</p>
        </div>
        <div style="max-width:820px;margin:0 auto">
          <a href="weekly/issue-04.html" style="display:block;background:var(--card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:1.4rem 1.6rem;margin-bottom:1rem;text-decoration:none">
            <div style="display:flex;justify-content:space-between;align-items:baseline;gap:1rem;flex-wrap:wrap">
              <b style="font-family:var(--font-display);font-size:1.15rem">Issue #04 — Record Quarters, Reckonings, and the Comparisons You Asked For</b>
              <span style="font-size:.85rem;color:var(--muted)">Aug 30</span>
            </div>
            <p style="font-size:.92rem;color:var(--muted);margin-top:.5rem;line-height:1.7">Nvidia's $96.2B quarter, Meta's $17.1B settlement, and six new head-to-head comparisons published this week.</p>
          </a>
          <a href="weekly/issue-03.html" style="display:block;background:var(--card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:1.4rem 1.6rem;margin-bottom:1rem;text-decoration:none">
            <div style="display:flex;justify-content:space-between;align-items:baseline;gap:1rem;flex-wrap:wrap">
              <b style="font-family:var(--font-display);font-size:1.15rem">Issue #03 — Open Weights, Watermarks, and a Letter to the Frontier</b>
              <span style="font-size:.85rem;color:var(--muted)">Aug 23</span>
            </div>
            <p style="font-size:.92rem;color:var(--muted);margin-top:.5rem;line-height:1.7">The open-vs-closed debate got a coalition, provenance tooling, and an internal letter from lab researchers.</p>
          </a>
          <a href="weekly/issue-02.html" style="display:block;background:var(--card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:1.4rem 1.6rem;margin-bottom:1rem;text-decoration:none">
            <div style="display:flex;justify-content:space-between;align-items:baseline;gap:1rem;flex-wrap:wrap">
              <b style="font-family:var(--font-display);font-size:1.15rem">Issue #02 — Agents Go Mainstream</b>
              <span style="font-size:.85rem;color:var(--muted)">Aug 16</span>
            </div>
            <p style="font-size:.92rem;color:var(--muted);margin-top:.5rem;line-height:1.7">Grok 4.6, Qwen3-8 open weights, and Microsoft's 59 Copilot updates in one cycle.</p>
          </a>
          <a href="weekly/issue-01.html" style="display:block;background:var(--card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:1.4rem 1.6rem;margin-bottom:1rem;text-decoration:none">
            <div style="display:flex;justify-content:space-between;align-items:baseline;gap:1rem;flex-wrap:wrap">
              <b style="font-family:var(--font-display);font-size:1.15rem">Issue #01 — The Month Opens Hot</b>
              <span style="font-size:.85rem;color:var(--muted)">Aug 9</span>
            </div>
            <p style="font-size:.92rem;color:var(--muted);margin-top:.5rem;line-height:1.7">White House testing frameworks, GPT-5.6 in two sizes, and AI video learning to speak.</p>
          </a>
        </div>
      </div>
    </section>`;
    const anchor = `<section id="subscribe">`;
    if (html.includes(anchor)) {
      html = html.split(anchor).join(archive + "\n    " + anchor);
      writeFileSync("weekly.html", html);
      console.log("weekly.html: archive section added");
    } else console.log("weekly.html: ANCHOR MISS");
  } else console.log("weekly.html: archive already");
}
