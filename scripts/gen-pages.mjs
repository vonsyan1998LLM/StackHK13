// One-shot page generator for StackHK (StackHK channel port)
import { writeFileSync, mkdirSync } from "node:fs";

const NAV = (active = "", r = "") => {
  const L = (href, label, key) =>
    `<a href="${r}${href}"${key && key === active ? ' class="active"' : ""}>${label}</a>`;
  return `
      ${L("news.html", "AI News", "news")}
      ${L("tools.html", "Reviews", "tools")}
      ${L("categories.html", "Categories", "categories")}
      ${L("articles.html", "Articles", "articles")}
      ${L("compare.html", "Compare", "compare")}
      ${L("deals.html", "Deals", "deals")}
      ${L("saas.html", "SaaS", "saas")}
      ${L("about.html", "About", "about")}`;
};

const HEAD = (title, desc, active, r = "", crumbs = "") => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} | StackHK</title>
<meta name="description" content="${desc}">
<link rel="stylesheet" href="${r}css/tp.css">
</head>
<body>

<header>
  <div class="wrap nav">
    <a class="logo" href="${r}index.html"><span class="mark">S</span> StackHK</a>
    <nav class="nav-links">${NAV(active, r)}
    </nav>
    <a class="btn btn-primary" href="${r}submit.html">Submit a Tool</a>
  </div>
</header>

<div class="page-hero">
  <div class="wrap">
    <div class="crumbs">${crumbs}</div>`;
const HERO_TITLE_SUB = (h1, sub) => `
    <h1>${h1}</h1>
    <p class="sub">${sub}</p>
  </div>
</div>`;

const FOOT = (r = "") => `

<footer>
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-brand">
        <a class="logo" href="${r}index.html"><span class="mark">S</span> StackHK</a>
        <p>Hong Kong's independent source for honest, in-depth AI tool and B2B SaaS reviews. We test so you don't have to.</p>
      </div>
      <div>
        <h4>Discover</h4>
        <ul>
          <li><a href="${r}reviews.html">AI Tool Reviews</a></li>
          <li><a href="${r}tools.html">Full Directory</a></li>
          <li><a href="${r}ranking.html">Top 20 Ranking</a></li>
          <li><a href="${r}categories.html">Categories</a></li>
          <li><a href="${r}submit.html">Submit a Tool</a></li>
        </ul>
      </div>
      <div>
        <h4>Learn</h4>
        <ul>
          <li><a href="${r}articles.html">Articles &amp; Guides</a></li>
          <li><a href="${r}compare.html">Tool Comparisons</a></li>
          <li><a href="${r}glossary.html">Prompt Library</a></li>
          <li><a href="${r}glossary.html">AI Glossary</a></li>
        </ul>
      </div>
      <div>
        <h4>Site</h4>
        <ul>
          <li><a href="${r}news.html">AI News</a></li>
          <li><a href="${r}weekly.html">Weekly Newsletter</a></li>
          <li><a href="${r}about.html">About Us</a></li>
          <li><a href="${r}contact.html">Contact</a></li>
          <li><a href="${r}privacy.html">Privacy Policy</a></li>
          <li><a href="${r}terms.html">Terms of Use</a></li>
          <li><a href="${r}disclosure.html">Affiliate Disclosure</a></li>
        </ul>
      </div>
    </div>
    <div class="foot-bottom">
      <span>&copy; 2026 StackHK. All rights reserved.</span>
      <span>Independent &middot; Curated daily &middot; Built for builders</span>
    </div>
  </div>
</footer>
`;

const SCRIPT = (r = "") => `<script src="${r}js/tp-main.js" defer></script>
<script src="${r}js/tp-nav.js" defer></script>
</body>
</html>
`;

const W = (path, body) => { writeFileSync(path, body); console.log("wrote", path); };

const crumb = (r, parts) => parts.map(p => p.url ? `<a href="${r}${p.url}">${p.t}</a>` : p.t).join(" &rsaquo; ");

/* ---------- 1. reviews.html ---------- */
W("reviews.html",
  HEAD("AI Tool Reviews", "Every AI tool we test gets a hands-on review scored across five dimensions — no pay-for-play, ever.", "tools", "",
    crumb("", [{ t: "Home", url: "index.html" }, { t: "Reviews" }]))
  + HERO_TITLE_SUB(`Hands-on <span class="grad">AI tool reviews</span>`,
    `We buy every subscription ourselves, use each tool for real work for 2&ndash;4 weeks, then score it across five dimensions. Zero sponsored placements.`)
  + `
<section style="padding-top:44px">
  <div class="wrap">
    <div class="sec-head sec-head-row">
      <div>
        <div class="sec-kicker">&#9733; Editor's Picks</div>
        <h2>Latest scored reviews</h2>
        <p>Scores combine five dimensions: Features, Ease of Use, Output Quality, Value for Money, and Support.</p>
      </div>
      <a class="btn btn-ghost" href="tools.html">Browse full directory with filters &rarr;</a>
    </div>
    <p class="result-count" id="count"></p>
    <div class="tools-grid" id="grid"></div>
  </div>
</section>
`
  + FOOT()
  + SCRIPT());

/* ---------- 2. articles.html ---------- */
const GUIDES_FALLBACK = [
  ["✍️","Writing","10 Best AI Writing Tools","Claude Pro (9.4), ChatGPT-4o (8.7), Jasper, Grammarly & more","articles/best-ai-writing-tools-2026.html"],
  ["💻","Coding","8 Best AI Coding Tools","Cursor (9.1), GitHub Copilot (8.9), Replit Agent & more","articles/best-ai-coding-tools-2026.html"],
  ["⚡","Productivity","7 Best AI Productivity Tools","Perplexity (9.0), NotebookLM (8.8), Notion AI & more","articles/best-ai-productivity-tools-2026.html"],
  ["🎨","Image & Video","7 Best AI Image Generators","Midjourney (9.3), DALL·E 3 (8.4), Leonardo AI & more","articles/best-ai-image-generators-2026.html"],
  ["🎙️","Audio & Voice","8 Best AI Audio & Voice Tools","ElevenLabs (9.0), Suno (8.5), Murf, Wispr Flow & more","articles/best-ai-audio-tools-2026.html"],
  ["📊","Business","8 Best AI Business Tools","HubSpot CRM (8.7), Bolt.new (8.5), Attio, Intercom Fin & more","articles/best-ai-business-tools-2026.html"]
].map(([e,c,t,p,u]) => `<a class="guide-card" href="${u}"><span class="emoji">${e}</span>
        <div><div class="tag tag-guide" style="display:inline-block">${c}</div><h3>${t}</h3><p>${p}</p></div></a>`).join("\n      ");

W("articles.html",
  HEAD("Articles & Guides", "In-depth buying guides and roundups — every AI tool tested hands-on before it earns a place in our rankings.", "articles", "",
    crumb("", [{ t: "Home", url: "index.html" }, { t: "Articles & Guides" }]))
  + HERO_TITLE_SUB(`2026 Roundup Guides`,
    `Comprehensive buying guides based on months of hands-on testing. Every pick is earned, never sold.`)
  + `
<section style="padding-top:48px">
  <div class="wrap">
    <div class="guides-grid" id="guides-grid">
      ${GUIDES_FALLBACK}
    </div>
  </div>
</section>

<section class="alt">
  <div class="wrap">
    <div class="sec-head sec-head-row">
      <div>
        <div class="sec-kicker" style="color:var(--teal)">Why trust these rankings?</div>
        <h2>Bought, tested, scored &mdash; never sponsored</h2>
      </div>
      <a class="btn btn-ghost" href="disclosure.html">Read our disclosure &rarr;</a>
    </div>
    <div class="meth-grid">
      <div class="meth-card"><span class="emoji">&#128176;</span><h3>We pay for everything</h3><p>Every subscription in every guide was purchased at full price.</p></div>
      <div class="meth-card"><span class="emoji">&#9201;&#65039;</span><h3>Weeks, not hours</h3><p>No tool is ranked off a demo &mdash; we live in each one for 2&ndash;4 weeks.</p></div>
      <div class="meth-card"><span class="emoji">&#128202;</span><h3>Five dimensions</h3><p>Features, ease of use, output quality, value, and support &mdash; scored separately.</p></div>
      <div class="meth-card"><span class="emoji">&#128260;</span><h3>Always current</h3><p>Guides are re-tested as vendors ship updates or change pricing.</p></div>
    </div>
  </div>
</section>
`
  + FOOT()
  + SCRIPT());

/* ---------- 3-8. category pages ---------- */
const CATS = [
  ["writing", "writing.html", "chat", "Writing Tools", "✍️", "Long-form quality, editing, and marketing copy assistants — tested on real deadlines.", "Writing"],
  ["coding", "coding.html", "code", "Coding Tools", "💻", "Agentic editors, copilots, and app builders — evaluated on real production repos.", "Coding"],
  ["productivity", "productivity.html", "productivity", "Productivity", "⚡", "Research, notes, and workflow automation that gives you hours back every week.", "Productivity"],
  ["image-video", "image-video.html", "image,video", "Image & Video", "🎨", "Generative imagery and video creation — hundreds of prompts per model before scoring.", "Image & Video"],
  ["audio", "audio.html", "audio", "Audio & Voice", "🎙️", "Voice synthesis, music generation, and dictation — judged by what listeners actually hear.", "Audio & Voice"],
  ["business", "business.html", "business,marketing", "Business AI", "📊", "CRMs, support agents, app builders, and marketing engines that power modern companies.", "Business AI"]
];
for (const [slug, file, filter, title, emoji, desc, label] of CATS) {
  mkdirSync("categories", { recursive: true });
  W(`categories/${file}`,
    HEAD(`${label} — AI Tool Category`, `${label}: every AI tool we've tested in this category, scored across five dimensions.`, "categories", "../",
      crumb("../", [{ t: "Home", url: "index.html" }, { t: "Categories", url: "categories.html" }, { t: label }]))
    + HERO_TITLE_SUB(`${emoji} <span class="grad">${label}</span>`, desc)
    + `
<section style="padding-top:44px">
  <div class="wrap">
    <div class="filter-bar">
      <button class="chip on" onclick="location.href='../articles.html'">&larr; All buying guides</button>
    </div>
    <div class="tools-grid" id="cat-grid" data-cats="${filter}"></div>
  </div>
</section>
`
    + FOOT("../")
    + SCRIPT("../"));
}

/* ---------- 9. compare.html ---------- */
const CMP = [
  {
    a: "ChatGPT", b: "Claude", sa: "9.6", sb: "9.4", wa: true,
    bestA: "All-round assistant, coding help, multimodal work", bestB: "Nuanced long-form writing and document analysis",
    priceA: "Free · Pro $20/mo", priceB: "Free · Pro $20/mo",
    strA: "Ecosystem: voice, images, custom GPTs, plugins", strB: "Best-in-class prose quality and long-context reasoning",
    watchA: "Occasional fluff on creative writing tasks", watchB: "Smaller third-party plugin ecosystem",
    verdict: "<span class='cmp-winner'>ChatGPT</span> edges ahead for most people on versatility — but writers doing serious long-form should pick Claude."
  },
  {
    a: "Cursor", b: "GitHub Copilot", sa: "9.1", sb: "8.9", wa: true,
    bestA: "Developers who want an AI-native editor end to end", bestB: "Teams already living inside VS Code and GitHub",
    priceA: "Free · Pro $20/mo", priceB: "$10/mo · Free for students",
    strA: "Agentic multi-file edits and codebase-wide context", strB: "Cheapest entry point and zero workflow change",
    watchA: "New editor to learn if you're an IDE loyalist", watchB: "Agent features trail Cursor's by a step",
    verdict: "<span class='cmp-winner'>Cursor</span> wins on raw capability; Copilot remains the pragmatic pick for budget-conscious VS Code teams."
  },
  {
    a: "Midjourney", b: "DALL·E 3", sa: "9.3", sb: "8.4", wb: false,
    bestA: "Creators chasing distinctive, art-directed imagery", bestB: "Quick illustrations inside ChatGPT conversations",
    priceA: "From $10/mo", priceB: "Included in ChatGPT",
    strA: "Unmatched aesthetics, style control, community", strB: "Understands messy prompts and renders readable text",
    watchA: "No free tier; Discord/web workflow isn't for everyone", watchB: "Softer artistic ceiling than Midjourney",
    verdict: "<span class='cmp-winner'>Midjourney</span> is the clear choice for visual quality — DALL·E 3 wins on convenience alone."
  }
];
const cmpHTML = CMP.map(c => `
  <div class="cmp-block">
    <div class="cmp-head"><h3 style="font-size:18px;font-weight:800">${c.a} vs ${c.b}</h3><span class="cmp-vs">HEAD TO HEAD</span>
      <span style="margin-left:auto;font-size:14px;color:var(--muted)">${c.a} <b class="cmp-winner">${c.sa}</b> &nbsp;&middot;&nbsp; ${c.b} <b style="color:var(--muted)">${c.sb}</b></span></div>
    <table class="cmp-table">
      <tr><th>Editor score</th><td><b class="cmp-winner">${c.sa}</b> vs ${c.sb}</td></tr>
      <tr><th>Best for</th><td>${c.bestA} <b>vs</b> ${c.bestB}</td></tr>
      <tr><th>Pricing</th><td>${c.priceA} <b>vs</b> ${c.priceB}</td></tr>
      <tr><th>Standout strength</th><td>${c.strA} <b>vs</b> ${c.strB}</td></tr>
      <tr><th>Watch out for</th><td>${c.watchA} <b>vs</b> ${c.watchB}</td></tr>
      <tr><th>Verdict</th><td>${c.verdict}</td></tr>
    </table>
  </div>`).join("\n");

W("compare.html",
  HEAD("Tool Comparisons", "Head-to-head AI tool comparisons from real testing — scores, strengths, weaknesses, and a clear verdict for each matchup.", "compare", "",
    crumb("", [{ t: "Home", url: "index.html" }, { t: "Compare" }]))
  + HERO_TITLE_SUB(`Head-to-head <span class="grad">tool comparisons</span>`,
    `The matchups everyone asks about, settled with weeks of side-by-side testing.`)
  + `
<section style="padding-top:44px">
  <div class="wrap" style="max-width:900px">
    ${cmpHTML}
  </div>
</section>
`
  + FOOT() + SCRIPT());

/* ---------- 10. deals.html ---------- */
const DEALS = [
  ["ElevenLabs", "10k characters/month free forever", "Freemium", "The most generous free tier in voice AI — enough for real projects, not just demos."],
  ["GitHub Copilot", "100% free for students & OSS maintainers", "Student Offer", "Verified students and popular open-source maintainers get Copilot Pro at no cost."],
  ["Notion AI", "AI add-on from $8/member annually", "Annual Saving", "Paying yearly instead of monthly cuts roughly 20% off the per-seat AI add-on."],
  ["Google AI Studio", "Free experimentation across Gemini models", "Free Tier", "Prototype prompts against Gemini models free before committing to any paid API plan."],
  ["Perplexity Pro", "Bundled free with select carrier & hardware promos", "Bundle Deal", "Frequently bundled with new phones and connectivity plans — check before paying."],
  ["Suno", "50 free credits daily on the basic plan", "Freemium", "Daily renewable credits mean casual creators may never need to pay."]
];
const dealsHTML = DEALS.map(([t, offer, badge, d]) => `
    <div class="deal-card"><span class="deal-badge">${badge}</span>
      <h3>${t}</h3><p>${d}</p><span class="deal-code">${offer}</span></div>`).join("\n");

W("deals.html",
  HEAD("Deals & Discounts", "Current AI tool deals, free tiers worth claiming, and bundle offers — verified by editors, updated regularly.", "deals", "",
    crumb("", [{ t: "Home", url: "index.html" }, { t: "Deals" }]))
  + HERO_TITLE_SUB(`Deals worth <span class="grad">your attention</span>`,
    `Hand-picked free tiers, student offers, and annual discounts on tools we've actually tested. No coupon-spam, ever.`)
  + `
<section style="padding-top:52px;padding-bottom:24px">
  <div class="wrap tools-grid" style="grid-template-columns:repeat(3,1fr)">
${dealsHTML}
  </div>
  <div class="wrap" style="margin-top:28px">
    <p style="font-size:13px;color:var(--muted)">Offers change without notice and some links may be affiliate links — see our <a href="disclosure.html" style="color:var(--indigo)">affiliate disclosure</a>. Deals never influence scores.</p>
  </div>
</section>
`
  + FOOT() + SCRIPT());

/* ---------- 11. saas.html ---------- */
W("saas.html",
  HEAD("B2B SaaS Reviews", "We review the software that powers modern companies — CRMs, sales platforms, AI app builders, and support agents.", "saas", "",
    crumb("", [{ t: "Home", url: "index.html" }, { t: "SaaS Reviews" }]))
  + HERO_TITLE_SUB(`Best SaaS tools for <span class="grad">business</span>`,
    `We review the software that powers modern companies &mdash; CRMs, support platforms, and AI app builders &mdash; with procurement-grade rigor.`)
  + `
<section style="padding-top:44px">
  <div class="wrap">
    <div class="trust-grid" style="padding:0 0 30px">
      <div class="trust-item"><span class="chk">&#10003;</span><span><em>Procurement-tested</em>, not demo-tested</span></div>
      <div class="trust-item"><span class="chk">&#10003;</span><span><em>TCO analyzed</em> &mdash; seats, usage, add-ons</span></div>
      <div class="trust-item"><span class="chk">&#10003;</span><span><em>Migration effort</em> factored into scores</span></div>
      <div class="trust-item"><span class="chk">&#10003;</span><span><em>Sponsorship</em> never affects ratings</span></div>
    </div>
    <div class="tools-grid" id="cat-grid" data-cats="business,marketing"></div>
  </div>
</section>
`
  + FOOT() + SCRIPT());

/* ---------- 12. weekly.html ---------- */
W("weekly.html",
  HEAD("Weekly Newsletter", "Join the free twice-weekly StackHK briefing — top tools, biggest AI news, and one practical skill to try.", "", "",
    crumb("", [{ t: "Home", url: "index.html" }, { t: "Weekly Newsletter" }]))
  + HERO_TITLE_SUB(`Stay ahead on AI.<br><span class="grad">All in one email.</span>`,
    `Join hundreds of thousands of readers getting the twice-weekly briefing &mdash; top tools, biggest news, and one practical skill to try. Free forever.`)
  + `
<section style="padding-top:20px">
  <div class="wrap">
    <div class="cta" style="max-width:760px;margin:0 auto">
      <form class="subscribe-form" onsubmit="event.preventDefault();this.querySelector('input').value='';alert('Subscribed! (demo)');return false;">
        <input type="email" placeholder="you@company.com" required>
        <button class="btn btn-primary" type="submit">Subscribe Free</button>
      </form>
      <p class="fine">Twice a week &middot; Unsubscribe anytime &middot; No spam, ever</p>
    </div>
  </div>
</section>

<section class="alt">
  <div class="wrap prose">
    <h2>What lands in your inbox</h2>
    <ul>
      <li><strong>Monday:</strong> the week's biggest AI stories, compressed to five minutes</li>
      <li><strong>Thursday:</strong> one deep-dive review or guide from our testing bench</li>
      <li><strong>Monthly bonus:</strong> subscriber-only deal roundups and early access to new guides</li>
    </ul>
  </div>
</section>
`
  + FOOT());

/* ---------- 13. contact.html ---------- */
W("contact.html",
  HEAD("Contact", "Get in touch with the StackHK editorial team — corrections, partnership inquiries, and press requests.", "", "",
    crumb("", [{ t: "Home", url: "index.html" }, { t: "Contact" }]))
  + HERO_TITLE_SUB(`Talk to the <span class="grad">editorial team</span>`,
    `Corrections, tips, partnerships, or press &mdash; we read everything and reply within two business days.`)
  + `
<section style="padding-top:44px">
  <div class="wrap prose">
    <h2>Fastest routes</h2>
    <ul>
      <li><strong>Suggest or submit a tool:</strong> use the <a href="submit.html">submission form</a> &mdash; reviewed within two weeks</li>
      <li><strong>Corrections:</strong> include the article URL and the specific line &mdash; verified fixes ship same week</li>
      <li><strong>Partnerships &amp; advertising:</strong> clearly labeled placements only; scores are never for sale</li>
      <li><strong>Press &amp; interviews:</strong> mention your outlet and deadline</li>
    </ul>
    <blockquote>The submission form doubles as our inbox &mdash; anything sent there reaches the editors directly.</blockquote>
  </div>
</section>
`
  + FOOT());

/* ---------- 14. disclosure.html ---------- */
W("disclosure.html",
  HEAD("Affiliate Disclosure", "How StackHK handles affiliate links, sponsorships, and why paid relationships never affect our scores.", "", "",
    crumb("", [{ t: "Home", url: "index.html" }, { t: "Affiliate Disclosure" }]))
  + HERO_TITLE_SUB(`Affiliate <span class="grad">Disclosure</span>`,
    `Last updated: August 24, 2026`)
  + `
<section style="padding-top:44px">
  <div class="wrap prose">
    <h2>The short version</h2>
    <p>StackHK is reader-supported. Some outbound links to vendors are affiliate links: if you buy through them, we may earn a commission at no extra cost to you. That income keeps the lights on and the subscriptions paid.</p>

    <h2>What affiliates never touch</h2>
    <ul>
      <li><strong>Scores.</strong> Every rating comes from hands-on testing, decided before any commercial conversation exists.</li>
      <li><strong>Rankings.</strong> The Top 20 and buying-guide order are editorial. Vendors cannot buy placement.</li>
      <li><strong>Coverage decisions.</strong> We review tools people ask about &mdash; including competitors of our partners.</li>
    </ul>

    <h2>How we label things</h2>
    <p>Affiliate-heavy pages carry a notice near the relevant links. Sponsored content, on the rare occasions it exists, is labeled "Sponsored" at the top and excluded from all scoring surfaces.</p>

    <h2>Questions</h2>
    <p>If a relationship on this site ever reads as unclear, call it out via the <a href="submit.html">contact form</a> &mdash; we treat clarity as part of the product.</p>
  </div>
</section>
`
  + FOOT());

console.log("DONE");

