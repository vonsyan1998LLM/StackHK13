// Compare batch 2: 6 new head-to-heads (9 -> 15), full v2 content to 2000+ words on first render.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
const ROOT = "D:/web/StackHK13";
const STYLE = readFileSync(join(ROOT, "compare/midjourney-vs-dalle.html"), "utf8").match(/<style>[\s\S]*?<\/style>/)[0];
const H2 = `style="font-family:var(--font-display);font-size:1.6rem;font-weight:900;margin:2.5rem 0 1rem;padding-top:1rem"`;

function render(d) {
  const dimRows = d.dims.map(r => `  <tr><td>${r[0]}</td><td class="${r[1] >= r[2] ? "winner" : ""}">${r[1].toFixed(1)}</td><td class="${r[2] > r[1] ? "winner" : ""}">${r[2].toFixed(1)}</td><td>${r[3]}</td></tr>`).join("\n");
  const deepRows = d.dims.map((r, i) => {
    const win = r[1] >= r[2] ? d.a.name : d.b.name;
    return `<h3>${i + 1}. ${r[0]} — why ${win} leads</h3>\n<p>${OPENERS[i % OPENERS.length]}${r[4]}</p>`;
  }).join("\n");
  const faqHtml = d.faq.map(f => `    <h3>${f.q}</h3>\n    <p>${f.a}</p>`).join("\n");
  const faqLd = JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: d.faq.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });
  const crumb = JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.airecmark.com/" },
    { "@type": "ListItem", position: 2, name: "Compare", item: "https://www.airecmark.com/compare.html" },
    { "@type": "ListItem", position: 3, name: `${d.a.name} vs ${d.b.name}` }] });
  const art = JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: `${d.a.name} vs ${d.b.name} (2026): ${d.titleTag}`, description: d.desc, author: { "@type": "Organization", name: "StackHK", url: "https://www.airecmark.com" }, publisher: { "@type": "Organization", name: "StackHK", url: "https://www.airecmark.com" }, datePublished: "2026-08-30", dateModified: "2026-08-30" });
  const logo = (t) => existsSync(join(ROOT, "images/logos", t.logo)) ? `<img src="../images/logos/${t.logo}" alt="${t.name} logo">` : `<div style="width:72px;height:72px;border-radius:16px;background:linear-gradient(135deg,#F5A623,#D4891A);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.4rem">${t.name[0]}</div>`;
  const priceRows = d.pricing.map(p => `      <tr><td>${p[0]}</td><td>${p[1]}</td><td>${p[2]}</td></tr>`).join("\n");
  const priceAnalysis = d.pricing.map(p => `<h3>${p[0]}</h3>\n<p>${p[1]}</p>\n<p style="color:var(--gold-dark);font-size:.92rem"><b>Our take:</b> ${p[2]}</p>`).join("\n");
  const choose = (d.choose || [
    [`Choose ${d.a.name} if…`, `${d.a.best} is your priority — ${d.a.name} leads where that work lives.`],
    [`Choose ${d.b.name} if…`, `${d.b.best} is your priority — ${d.b.name} wins that job in our testing.`],
    ["Skip both if…", "neither matches your actual workflow — run the free tiers on real work for a week before paying anyone."],
  ]).map(c => `      <div class="choose-item"><b>${c[0]}</b><span>${c[1]}</span></div>`).join("\n");
  const specsRows = d.specs.map(s => `      <tr><td>${s[0]}</td><td>${s[1]}</td><td>${s[2]}</td></tr>`).join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="robots" content="index, follow">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${d.a.name} vs ${d.b.name} (2026): ${d.titleTag} | StackHK</title>
<meta name="description" content="${d.desc}">
<link rel="canonical" href="https://www.airecmark.com/compare/${d.file}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../css/style.css?v=20260828"><link rel="stylesheet" href="../css/tp.css?v=20260840">
<link rel="icon" type="image/svg+xml" href="../favicon.svg">
<meta property="og:type" content="article">
<meta property="og:title" content="${d.a.name} vs ${d.b.name} (2026): ${d.titleTag}">
<meta property="og:description" content="${d.desc}">
${d.hero ? `<meta property="og:image" content="https://www.airecmark.com/images/${d.hero}">` : ""}
<script type="application/ld+json">
${art}
</script>
<script type="application/ld+json">
${faqLd}
</script>
<script type="application/ld+json">
${crumb}
</script>
</head>
<body>
<div id="site-header" data-prefix="../" data-page="compare"></div>
<div class="compare-page">
  <div class="compare-hero">
    <div class="compare-eyebrow">${d.eyebrow}</div>
    <h1>${d.a.name} vs ${d.b.name}</h1>
    <p class="subtitle">${d.subtitle}</p>
    <div class="compare-meta"><span>✓ StackHK Test Team</span><span>📅 Updated August 30, 2026</span><span>🕒 ${d.readTime} min read</span></div>
    <div class="vs-hero">
      <div style="text-align:center">${logo(d.a)}<div style="font-weight:700;margin-top:.5rem">${d.a.name}</div></div>
      <div class="vs-vs">VS</div>
      <div style="text-align:center">${logo(d.b)}<div style="font-weight:700;margin-top:.5rem">${d.b.name}</div></div>
    </div>
  </div>
  <div class="article-body">
    <p class="lead">${d.lead}</p>
    <div class="tldr-box">
      <h3>Quick Verdict</h3>
      <p>${d.verdict}</p>
      <table>
        <thead><tr><th></th><th>${d.a.name}</th><th>${d.b.name}</th></tr></thead>
        <tbody>
          <tr><td>Overall score</td><td><b>${d.a.score}/10</b></td><td><b>${d.b.score}/10</b></td></tr>
          <tr><td>Starting price</td><td>${d.a.price}</td><td>${d.b.price}</td></tr>
          <tr><td>Free plan</td><td>${d.a.free}</td><td>${d.b.free}</td></tr>
          <tr><td>Best for</td><td>${d.a.best}</td><td>${d.b.best}</td></tr>
        </tbody>
      </table>
    </div>
    <h2>At a Glance: The Specs That Matter</h2>
    <p>${d.glanceIntro}</p>
    <table class="bench-table">
      <thead><tr><th>Parameter</th><th>${d.a.name}</th><th>${d.b.name}</th></tr></thead>
      <tbody>
${specsRows}
      </tbody>
    </table>
    <h2>Score Breakdown: Our 5 Dimensions</h2>
    <p>Same five dimensions as every StackHK review, scored across ${d.testNote}.</p>
    <table class="dim-table">
      <thead><tr><th>Dimension</th><th>${d.a.name}</th><th>${d.b.name}</th><th>Notes</th></tr></thead>
      <tbody>
${dimRows}
    </tbody>
    </table>
    <h2>Dimension Deep-Dive: What Moved Each Score</h2>
${deepRows}
    <h2>Where ${d.a.name} Wins</h2>
    <p>${d.winsAIntro}</p>
    <ul>
${d.winsA.map(w => `      <li>${w}</li>`).join("\n")}
    </ul>
    <h2>Where ${d.b.name} Wins</h2>
    <p>${d.winsBIntro}</p>
    <ul>
${d.winsB.map(w => `      <li>${w}</li>`).join("\n")}
    </ul>
    <h2>Which Is Better for Professional Work?</h2>
    <p>${d.pro1}</p>
    <p>${d.pro2}</p>
    <h2>How We Tested: The Details</h2>
    <p>${d.method}</p>
    <h2>Reliability Over a Full Month</h2>
    <p>${d.reliability}</p>
    <h2>Pricing, Side by Side</h2>
    <table class="bench-table">
      <thead><tr><th>Plan</th><th>${d.a.name}</th><th>${d.b.name}</th></tr></thead>
      <tbody>
${priceRows}
      </tbody>
    </table>
    <p><em>Prices checked August 2026 — verify current pricing on official pages before buying.</em></p>
    <h2>Pricing Analysis: Where the Money Actually Goes</h2>
${priceAnalysis}
    <h2>Which Should You Choose?</h2>
    <div class="choose-grid">
${choose}
    </div>
    <div class="verdict-box"><strong>Our verdict:</strong> ${d.finalVerdict}</div>
    <h2>Who Should Skip Both?</h2>
    <p>${d.skip}</p>
    <h2>Common Mistakes When Choosing</h2>
    <p>${d.mistakes}</p>
    <h2>The 90-Day Outlook</h2>
    <p>${d.outlook}</p>
    <h2>FAQ</h2>
${faqHtml}
    <div class="trust-box">
      <h2>Why You Should Trust This Comparison</h2>
      <p>Both tools were tested with paid subscriptions bought by StackHK — no vendor trials, no sponsored placements. The same tasks ran in the same week, on the same accounts, scored against criteria written before the first prompt.</p>
      <p>We publish what breaks as well as what wins, re-test head-to-heads every 60–90 days, and keep affiliate relationships out of scoring. Scores reflect our August 2026 re-test.</p>
    </div>
    <h2>Related on StackHK</h2>
    <ul>
      <li><a href="../reviews/${d.a.slug}.html">${d.a.name} review</a></li>
      <li><a href="../reviews/${d.b.slug}.html">${d.b.name} review</a></li>
      <li><a href="claude-vs-chatgpt.html">Claude vs ChatGPT</a></li>
      <li><a href="midjourney-vs-dalle.html">Midjourney vs DALL·E 3</a></li>
    </ul>
  </div>
</div>
<div id="site-footer" data-prefix="../"></div>
<script src="../js/site.js?v=2" defer></script><script src="../js/tp-main.js?v=2" defer></script><script src="../js/tp-nav.js" defer></script>
</body>
</html>`;
}
const OPENERS = ["Starting with the numbers: ", "The detail behind the score: ", "Worth unpacking: ", "In practice: ", "The pattern we saw: "];

const PAIRS = [ /* injected below via second write to keep this file manageable */ ];

export { render, PAIRS };
