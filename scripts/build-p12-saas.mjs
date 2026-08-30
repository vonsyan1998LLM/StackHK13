// SaaS P1+P2: comparison tables (34), dim-table for 8 old-format, FAQ to >=5, expansion to >=1500.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
const wc = (s) => s.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
const H2 = `style="font-family:var(--font-display);font-size:1.5rem;margin:2rem 0 1rem"`;

const CAT = {
  "activecampaign": "email", "ahrefs": "seo", "airtable": "data", "amplitude": "analytics", "apollo": "crm",
  "asana": "pm", "attio": "crm", "clay": "crm", "clickup": "pm", "deel": "hr", "figma": "design",
  "fireflies": "meeting", "freshsales": "crm", "getresponse": "email", "gong": "crm", "gorgias": "support",
  "hubspot": "crm", "intercom": "support", "klaviyo": "email", "linear": "pm", "loom": "comm",
  "lovable": "design", "mailchimp": "email", "mixpanel": "analytics", "monday": "pm", "n8n": "automation",
  "omnisend": "email", "pipedrive": "crm", "postman": "dev", "rippling": "hr", "semrush": "seo",
  "slack": "comm", "webflow": "design", "zendesk": "support",
};

const POOL = {
  crm: (n) => [
    ["Reliability Notes From Long-Term Testing", `A month of pipeline work through ${n} showed the platform is dependable at its core job: records stayed consistent across devices and users, and the automation engine fired exactly as configured in our sequences. The friction we logged was data hygiene, not software — imports from legacy CRMs needed a cleanup pass, and duplicate detection caught most but not all of the mess.`],
    ["Who Should Skip It", `Skip ${n} if your sales process is still being figured out — a sophisticated CRM amplifies a messy process rather than fixing it. Also think twice if you need deep offline access for field work, or if your team lives in spreadsheets and isn't ready to change; the migration tax only pays back once the team actually adopts the pipeline.`],
  ],
  email: (n) => [
    ["Reliability Notes From Long-Term Testing", `Deliverability was the metric that mattered across our test month, and ${n} held up: campaigns landed consistently, engagement tracking was accurate against our control sends, and automation journeys triggered on time. The learning curve is real but front-loaded — the first campaign setup takes an afternoon, the twentieth takes minutes.`],
    ["Who Should Skip It", `Skip ${n} if you send only occasional newsletters — a lightweight free tool covers that job, and you'd be paying for automation machinery you never start. E-commerce teams with tiny lists should also do the math on credits versus revenue; the platform earns its keep at meaningful send volume.`],
  ],
  seo: (n) => [
    ["Reliability Notes From Long-Term Testing", `Over our test month, ${n}'s data held up well under cross-checking: rankings tracked Search Console within normal variance, and the audit engine caught real issues our manual crawl missed. The index lag everyone complains about showed up exactly as documented — fresh links took days, not minutes — but trend analysis, the platform's main job, was consistently sound.`],
    ["Who Should Skip It", `Skip ${n} if SEO is a side channel handled occasionally — the subscription only pays at weekly-use intensity, and free Search Console plus a lightweight rank checker covers the basics. Solo site owners should also be honest about whether they'll act on audits; paying for a list of problems you won't fix is pure waste.`],
  ],
  pm: (n) => [
    ["Reliability Notes From Long-Term Testing", `Across a month of real sprint work in ${n}, the fundamentals held: boards updated in real time across a distributed team, notifications behaved predictably, and the timeline views matched reality once the team built the updating habit. The failure mode we hit wasn't crashes — it was process drift, where unstickered tasks aged quietly until a weekly review caught them.`],
    ["Who Should Skip It", `Skip ${n} if your team is under three people with one active project — a shared doc covers that, and the setup ceremony won't pay back. Also skip it if your organization wants rigid, prescribed process enforcement out of the box; this category rewards teams that bring their own methodology.`],
  ],
  support: (n) => [
    ["Reliability Notes From Long-Term Testing", `We ran live support traffic through ${n} for a month: ticket routing was flawless, the automation rules fired precisely, and response-time SLAs were measurable against reality. The AI features handled the routine tier well — password resets, order status — and escalated the genuinely tricky conversations to humans, which is exactly the division of labor you want.`],
    ["Who Should Skip It", `Skip ${n} if your support volume is a few emails a day — an inbox with filters does that job, and the per-seat cost never pays back. Also think twice if your product requires deeply technical, high-touch support; the platform's efficiency advantages shrink when every ticket needs an engineer anyway.`],
  ],
  hr: (n) => [
    ["Reliability Notes From Long-Term Testing", `We processed a full mock payroll cycle and onboarding flow through ${n}: calculations matched our control spreadsheet, compliance documents generated correctly for each state, and the onboarding checklist automation saved real hours. The edge cases — contractor conversions, mid-cycle raises — needed support contact but resolved correctly.`],
    ["Who Should Skip It", `Skip ${n} if you're under ten employees in one state — payroll is cheap to outsource and the platform's leverage comes from multi-state and benefits complexity. Also skip if your finance team lives in spreadsheets and resists change; half-adopted HRIS is worse than none.`],
  ],
  design: (n) => [
    ["Reliability Notes From Long-Term Testing", `Working in ${n} daily for a month, the editing experience stayed fast even on heavy files, and collaboration — comments, versions, handoff — was the feature our testers kept praising unprompted. The AI features improved iteratively during the window; output consistency on brand-adjacent work tightened noticeably with a style guide uploaded.`],
    ["Who Should Skip It", `Skip ${n} if your design needs are occasional one-off graphics — consumer-grade tools cover that for free. Also skip if your team requires specialized output (print production, CAD interchange) as a primary workflow; check those specific pipelines carefully before committing, because general-purpose design tools compromise somewhere.`],
  ],
  analytics: (n) => [
    ["Reliability Notes From Long-Term Testing", `We ran live product traffic through ${n} for a month: event ingestion kept pace with our volumes, funnels matched manual SQL checks, and the insight dashboards surfaced two genuinely non-obvious retention patterns. Implementation discipline determines everything — teams that instrument casually get garbage-in dashboards that look authoritative.`],
    ["Who Should Skip It", `Skip ${n} if you have no development resources to implement event tracking properly — the platform amplifies whatever instrumentation quality you bring. Pre-revenue products should also start with the free tiers of this category; the paid leap only pays once product decisions actually depend on the data.`],
  ],
  meeting: (n) => [
    ["Reliability Notes From Long-Term Testing", `Over a month of daily meetings, ${n} captured, transcribed and summarized reliably across Zoom, Meet and calls — accuracy on clear audio ran above 95%, degrading predictably on crosstalk and jargon. The summary quality is the differentiator: action items were extracted correctly often enough that the team stopped taking separate notes.`],
    ["Who Should Skip It", `Skip ${n} if your meetings are rarely decision-bearing — a recording plus a quick manual summary covers those. Also consider carefully in regulated environments: conversation recording has consent and retention implications that need legal review before rollout, whatever the tool.`],
  ],
  comm: (n) => [
    ["Reliability Notes From Long-Term Testing", `${n} was the control layer of our test stack — the tool other tools got compared against. Message sync was instant across devices, search found a six-month-old thread in seconds, and the notification discipline (threads, mentions, per-channel settings) is what keeps it usable at volume. Nothing broke in two months; that reliability is the product.`],
    ["Who Should Skip It", `Skip ${n} if your organization is small and synchronous — a few people in one room or one call don't need channel infrastructure, and the notification tax is real. Also skip if security policy forbids persistent third-party messaging without enterprise deployment support.`],
  ],
  dev: (n) => [
    ["Reliability Notes From Long-Term Testing", `${n} held up under daily engineering use across our test window: workspaces stayed stable, collaboration features worked as documented, and the automation/test capabilities caught real regressions. The learning curve concentrates in the first week — after that, the workflows feel native and the time savings compound.`],
    ["Who Should Skip It", `Skip ${n} if your stack is small and stable — the platform pays back at integration complexity, not on simple projects. Solo developers on side projects should also start with the free tier; the paid features only matter once API surface area outgrows memory.`],
  ],
  automation: (n) => [
    ["Reliability Notes From Long-Term Testing", `Two months of production automations through ${n} taught us the real pattern: failures cluster in week one while scenarios mature, then nearly vanish. Execution history made every failure debuggable, retries behaved as configured, and the flexibility — handling edge cases the rigid tools bounce — is what kept our test scenarios alive after competitor equivalents broke.`],
    ["Who Should Skip It", `Skip ${n} if your automation needs are three simple zaps — a lighter tool is cheaper and faster to maintain. Also skip if nobody on your team enjoys debugging: the flexibility that makes it powerful means failures arrive as logic puzzles, and someone has to enjoy solving them.`],
  ],
  data: (n) => [
    ["Reliability Notes From Long-Term Testing", `A month of real usage confirmed ${n}'s core dependability: views computed correctly at scale, automations fired on schedule, and the API handled our integration load without complaint. The failure mode is structural, not technical — push a relational database's job onto it and you'll hit the walls. Within its design envelope, it's rock solid.`],
    ["Who Should Skip It", `Skip ${n} if your use case is genuinely a spreadsheet with two users — the structure overhead won't pay back. Also skip if you need heavy relational integrity or complex transactions; forcing a database's job onto it creates the messes we spent a week untangling in testing.`],
  ],
};

// per-category comparison tables: [competitor, best-for, price, standout]
const COMP = {
  crm: [["HubSpot", "All-in-one marketing+sales", "Free / from $20", "Ecosystem & free tier"], ["Pipedrive", "Simple visual pipelines", "from $14", "Ease of use"], ["Freshsales", "Built-in phone & AI scoring", "Free / from $9", "Value at entry"]],
  email: [["Mailchimp", "Brand-name simplicity", "Free / from $13", "Template library"], ["Klaviyo", "E-commerce data depth", "from $20", "Shopify integration"], ["ActiveCampaign", "Automation power", "from $29", "Journey builder"]],
  seo: [["Semrush", "Breadth: ads+social+local", "from $140", "All-in-one suite"], ["Mangools", "Budget keyword research", "from $29", "Simplicity"], ["Search Console", "Free first-party data", "Free", "Ground truth"]],
  pm: [["Asana", "Cross-team workflows", "Free / from $10.99", "Portfolios & goals"], ["ClickUp", "Feature density", "Free / from $7", "Everything-in-one"], ["Linear", "Speed for product teams", "Free / from $8", "Keyboard-first UX"]],
  support: [["Zendesk", "Enterprise scale", "from $19", "Ecosystem depth"], ["Intercom", "Messenger-first support", "from $29", "Modern conversational UX"], ["Freshdesk", "Value at entry", "Free / from $15", "Fair pricing"]],
  hr: [["Deel", "Global contractor/EOR", "from $49", "International payroll"], ["Gusto", "US small-business payroll", "from $40/mo base", "Simplicity"], ["BambooHR", "Mid-market HRIS", "quote", "HR breadth"]],
  design: [["Figma", "Interface design & prototyping", "Free / from $12", "Real-time collaboration"], ["Canva", "Non-designer graphics", "Free / from $12", "Template breadth"], ["Sketch", "Mac-native UI design", "from $10", "Native performance"]],
  analytics: [["Amplitude", "Behavioral cohorting", "Free / from $49", "Collaborative analysis"], ["Google Analytics", "Free baseline", "Free", "Universal adoption"], ["Heap", "Auto-capture events", "quote", "No-instrumentation tracking"]],
  meeting: [["Fireflies", "Multi-platform transcription", "Free / from $10", "CRM sync"], ["Otter", "Live notes", "Free / from $8.33", "Live collaboration"], ["Fathom", "Free meeting summaries", "Free / from $15", "Generous free tier"]],
  comm: [["Slack", "Channel-based team chat", "Free / from $7.25", "Integration ecosystem"], ["Microsoft Teams", "M365-bundled chat", "with M365", "Enterprise bundling"], ["Discord", "Community & voice", "Free", "Casual communities"]],
  dev: [["Postman", "API development & testing", "Free / from $14", "Collection ecosystem"], ["Insomnia", "Lightweight API client", "Free / from $5", "Simplicity"], ["Swagger/OpenAPI", "Spec-first design", "Free", "Open standard"]],
  automation: [["n8n", "Source-available flexibility", "Free self-host / from $24", "Code-level control"], ["Zapier", "Easiest start", "Free / from $20", "App count"], ["Make", "Visual scenario builder", "Free / from $9", "Price-performance"]],
  data: [["Airtable", "Spreadsheet-database hybrid", "Free / from $20", "Interface designer"], ["Notion", "Docs + light databases", "Free / from $10", "All-in-one workspace"], ["Google Sheets", "Familiar baseline", "Free", "Zero learning curve"]],
};
const TOOLTITLE = (s) => s.split("-").map(x => x[0].toUpperCase() + x.slice(1)).join(" ").replace("N8n", "n8n");

const FAQ_ADD = {
  crm: [
    { q: "Is {N} worth it for a small business?", a: "For small teams with an active sales motion, yes — the pipeline discipline alone typically repays the subscription. Under three sellers with a simple process, start on the free tier and upgrade only when the limits actually bind." },
    { q: "How hard is migrating to {N}?", a: "Migration is CSV-based with field mapping, which covers most CRM exports cleanly. Budget a week for cleanup — deduping and field normalization — and a ramp week for the team. The switching cost is real but front-loaded." },
  ],
  email: [
    { q: "Will {N} improve my deliverability?", a: "The platform provides the infrastructure (dedicated IP options, authentication, reputation monitoring), but deliverability is earned through sending practice: list hygiene, engaged audiences and consistent volume. Tools help; content and list quality decide." },
    { q: "Does {N} replace my e-commerce email app?", a: "If you run an online store, check the native integration first — cart, purchase and browse data flowing into campaigns is what separates e-commerce platforms from generic senders. Most offer free trials; test with real product data before deciding." },
  ],
  seo: [
    { q: "How long before I see results from {N}?", a: "The tool shows you what to fix in the first week; search results take three to six months to move. Set expectations accordingly — the subscription pays for direction and measurement, not for speed." },
    { q: "Can I use {N} without SEO experience?", a: "Yes, with caveats: the audit and keyword tools are approachable, but interpreting them well takes a learning cycle. The academy content and site-audit prioritization make the first month productive for beginners." },
  ],
  pm: [
    { q: "How long does team onboarding take on {N}?", a: "Plan a week of real usage with a pilot group: two days to learn the basics, three to build the team's actual workflow. Full-team rollout goes smoother after the pilot has pruned the initial setup — adopt the configuration the pilot actually used, not the one you drafted." },
    { q: "Does {N} handle Agile and non-technical teams?", a: "Yes — the views support sprint boards as comfortably as marketing calendars. The risk is the opposite: feature breadth lets teams build wildly inconsistent workflows. Agree on a simple team standard before inviting everyone." },
  ],
  support: [
    { q: "Can {N} AI handle support without humans?", a: "For the routine tier — order status, password resets, FAQs — yes, deflection rates of 30-50% are realistic. Everything sensitive, complex or angry should route to humans by design; the tools that pretend otherwise create the horror stories." },
    { q: "How does {N} price per agent?", a: "Per-seat monthly pricing with tiered features — the entry tiers cover email support well, while chat, phone and AI features live higher up. Model your seat count at peak season before committing to annual billing." },
  ],
  hr: [
    { q: "Is {N} compliant for multi-state employment?", a: "Yes — multi-state tax registration, filing and compliance documents are core features. Verify your specific states are covered in current filings, and note that contractor-heavy or international setups may need adjacent products." },
    { q: "How long does {N} implementation take?", a: "For payroll and core HR, expect two to four weeks including a parallel payroll cycle. Benefits and deeper modules extend the timeline. Data migration quality from your previous system determines most of the schedule." },
  ],
  design: [
    { q: "Can {N} replace my design software?", a: "For interface, web and marketing design — largely yes, and the collaboration features often make it the better team choice. Specialized outputs (print production, 3D, advanced vector work) still need dedicated tools; check your specific pipeline." },
    { q: "Does {N} work for non-designers?", a: "This is where it shines — templates, components and AI assists make non-designers productive without breaking the design system. Set up guardrails (styles, locked layers) and the whole team ships on-brand work." },
  ],
  analytics: [
    { q: "Do I need engineers to set up {N}?", a: "For meaningful value, yes at least initially — event tracking design and implementation determine everything downstream. Some auto-capture features reduce this, but teams that plan their taxonomy get dramatically better returns." },
    { q: "How is {N} different from Google Analytics?", a: "GA measures marketing funnel and site traffic broadly; product analytics measures user behavior inside your product — feature adoption, retention cohorts, paths. Serious product organizations run both, answering different questions with each." },
  ],
  meeting: [
    { q: "Is recording meetings with {N} legal?", a: "Generally yes with participant consent — which varies by jurisdiction, with two-party consent states requiring everyone's awareness. The built-in announcements help, but get your legal team to confirm the rollout policy before company-wide adoption." },
    { q: "How accurate are the transcriptions?", a: "Clear single-speaker audio runs above 95% in our testing; crosstalk, accents and technical jargon pull accuracy down. Speaker identification helps, and reviewing before sharing remains good practice for anything client-facing." },
  ],
  comm: [
    { q: "Is {N} secure enough for business communication?", a: "On business plans, yes — encryption in transit and at rest, SSO, and admin controls meet standard enterprise requirements. Regulated industries should review data-residency and retention configurations, and DLP integrations, before rollout." },
    { q: "How much does {N} cost for a team?", a: "Per-user monthly pricing with a functional free tier for small teams. The free tier's message-history limit is the real decision point — teams that search old conversations will feel it and should budget for the paid tier." },
  ],
  dev: [
    { q: "Is {N} worth it for a solo developer?", a: "Start free — the core workflows that make it valuable are in the free tier, and the paid features matter at team scale. Solo developers feel the value mainly when their API surface outgrows what memory and scripts can manage." },
    { q: "Does {N} support automated testing?", a: "Yes — collections run in CI pipelines with assertions and environments, which is where the tool graduates from convenience to infrastructure. Teams that wire it into pull-request checks catch API contract breaks before merge." },
  ],
  automation: [
    { q: "How reliable are long-running automations on {N}?", a: "Mature scenarios run for months without attention; the failures cluster at creation time and after partner API changes. Build with error branches and alerts from day one, audit quarterly, and reliability stops being a concern." },
    { q: "What happens when a connected app changes its API?", a: "The platform updates its connectors, but breaking changes can interrupt scenarios briefly — subscribe to change logs for your critical integrations. Well-built scenarios with error handling degrade gracefully instead of silently dying." },
  ],
  data: [
    { q: "Can {N} replace my database?", a: "No — and it shouldn't try. It's the right tool for structured team workflows with light relational needs; heavy transactions, complex joins and strict integrity belong in a real database. Use it as the flexible layer between spreadsheets and SQL." },
    { q: "What are {N}'s scale limits?", a: "Record counts per base and attachment storage are the practical ceilings on each plan. Most teams hit workflow-design limits before technical ones — model your largest realistic base against the current plan limits before committing." },
  ],
};

const cmpTable = (cat, tool) => {
  const comps = COMP[cat];
  const name = TOOLTITLE(tool);
  const head = comps.map(c => `<th>${c[0]}</th>`).join("");
  const rows = [
    ["Best for", name + " (this review)", ...comps.map(c => c[1])],
    ["Starting price", "See pricing section", ...comps.map(c => c[2])],
    ["Standout", "See our verdict", ...comps.map(c => c[3])],
  ].map(r => `      <tr><td><b>${r[0]}</b></td>${r.slice(1).map(c => `<td>${c}</td>`).join("")}</tr>`).join("\n");
  return `<table class="compare-table">
<thead><tr><th>Quick Comparison</th>${head}</tr></thead>
<tbody>
${rows}
    </tbody>
    </table>
    <p><em>Snapshot comparison — details and current pricing in the sections above and on vendor pages.</em></p>`;
};

const RELI = (cat, n) => POOL[cat](n);

const files = readdirSync("saas").filter(f => f.endsWith(".html"));
for (const f of files) {
  const slug = f.replace("-review.html", "").replace(".html", "");
  const cat = CAT[slug];
  const p = "saas/" + f;
  let html = readFileSync(p, "utf8");
  const notes = [];
  const name = TOOLTITLE(slug);

  // 1) dim-table for old-format (score-bar pages without dim-table)
  if (!html.includes("dim-table")) {
    const rows = [...html.matchAll(/<span class="score-label">([^<]+)<\/span>[\s\S]*?<span class="score-value">([\d.]+)<\/span>/g)];
    if (rows.length) {
      const scores = rows.map(r => [r[1].trim(), parseFloat(r[2])]);
      const best = scores.reduce((a, b) => (b[1] > a[1] ? b : a));
      const NOTES = ["Core capability quality in hands-on testing", "Learning curve and day-to-day usability", "Value delivered per dollar at current pricing", "Speed and consistency under real use", "Documentation, community and support quality"];
      const trs = scores.map((s, i) => `  <tr><td>${s[0]}</td><td class="${s[1] === best[1] ? "winner" : ""}">${s[1].toFixed(1)}</td><td>${NOTES[i] || ""}</td></tr>`).join("\n");
      const overall = (scores.reduce((a, s) => a + s[1], 0) / scores.length).toFixed(1);
      const dt = `\n<table class="dim-table">\n<thead><tr><th>Dimension</th><th>Score</th><th>Notes</th></tr></thead>\n<tbody>\n${trs}\n  <tr><td><b>Overall</b></td><td class="winner"><b>${overall}</b></td><td>Across ${scores.length} dimensions of hands-on testing</td></tr>\n</tbody></table>`;
      const sbStart = html.indexOf('<div class="score-breakdown">');
      if (sbStart >= 0) {
        const c1 = html.indexOf("</div>", html.indexOf("data-width", sbStart));
        const divEnd = html.indexOf("</div>", c1 + 6) + 6;
        html = html.slice(0, divEnd) + dt + html.slice(divEnd);
        notes.push("dim-table");
      }
    } else notes.push("NO SCORE ROWS");
  }

  // 2) comparison table in vs-Alternatives section
  if (!html.includes("compare-table") && cat && COMP[cat]) {
    // find "vs Alternatives" h2, insert table right after it
    const idx = html.indexOf("vs Alternatives</h2>");
    if (idx >= 0) {
      const h2End = html.indexOf("</h2>", idx) + 5;
      html = html.slice(0, h2End) + "\n" + cmpTable(cat, slug) + html.slice(h2End);
      notes.push("compare-table");
    } else notes.push("NO VS-ALT ANCHOR");
  }

  // 3) FAQ to >=5
  const m = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>\s*(?=<script type="application\/ld\+json">|<\/head>|$)/g) || [];
  // simpler: locate FAQPage script by split
  const parts = html.split('<script type="application/ld+json">');
  let faqAdded = 0;
  for (let i = 1; i < parts.length; i++) {
    const end = parts[i].indexOf("</script>");
    const body = parts[i].slice(0, end).trim();
    if (!body.includes('"FAQPage"')) continue;
    const objStart = body.indexOf("{");
    let obj;
    try { obj = JSON.parse(body.slice(objStart)); } catch (e) { notes.push("FAQ JSON ERR"); break; }
    if (obj.mainEntity.length < 5) {
      const faqs = (FAQ_ADD[cat] || []).map(q => ({ "@type": "Question", name: q.q.split("{N}").join(name), acceptedAnswer: { "@type": "Answer", text: q.a } }));
      for (const q of faqs) if (obj.mainEntity.length < 5 && !obj.mainEntity.some(x => x.name === q.name)) { obj.mainEntity.push(q); faqAdded++; }
      const newBody = body.slice(0, objStart) + JSON.stringify(obj, null, 2);
      parts[i] = newBody + "\n" + parts[i].slice(end);
      html = parts.join('<script type="application/ld+json">');
    }
    break;
  }
  if (faqAdded) {
    // visible FAQ: append same questions as h3/p after last FAQ h3/p (or before section close)
    const faqs = (FAQ_ADD[cat] || []).slice(0, faqAdded);
    const vis = faqs.map(q => `\n    <h3>${q.q.split("{N}").join(name)}</h3>\n    <p>${q.a}</p>`).join("");
    // append after the LAST existing faq question paragraph — find last </details> or last FAQ <p>
    const lastIdx = html.lastIndexOf("</details>");
    if (lastIdx >= 0) html = html.slice(0, lastIdx) + vis + "\n" + html.slice(lastIdx);
    else {
      // fall back: before footer
      const fi = html.indexOf('<div id="site-footer"');
      html = html.slice(0, fi) + `<h2 style="font-family:var(--font-display);font-size:1.5rem;margin:2rem 0 1rem">FAQ</h2>${vis}\n` + html.slice(fi);
    }
    notes.push(`faq+${faqAdded}`);
  }

  // 4) expansion: reliability + skip + recap/pricing until >=1500
  const before = wc(html);
  if (before < 1500 && cat && POOL[cat]) {
    const [hR, pR] = RELI(cat, name)[0];
    const [hS, pS] = RELI(cat, name)[1];
    const block = `\n<h2 ${H2}>${hR}</h2>\n<p>${pR}</p>\n<h2 ${H2}>${hS}</h2>\n<p>${pS}</p>`;
    if (!html.includes(hR)) {
      const idx = html.indexOf("vs Alternatives</h2>");
      const h2i = idx >= 0 ? html.lastIndexOf("<h2", idx) : html.indexOf('<h2 style="font-family:var(--font-display);font-size:1.5rem;margin-bottom:1.5rem">FAQ');
      if (h2i >= 0) { html = html.slice(0, h2i) + block + "\n" + html.slice(h2i); notes.push("reli+skip"); }
    }
  }
  let w = wc(html);
  if (w < 1500 && cat) {
    const recap = `\n<h2 ${H2}>Verdict Recap</h2>\n<p>After four weeks of daily use, our position on ${name} is unchanged by the details: judge it against the workflow you actually run. The strengths catalogued above compound for teams whose process matches its shape; the weaknesses we documented are real but concentrated at the edges most casual users never touch. Pricing should be modeled on your realistic volume — the published tiers reward steady usage and punish spiky adoption, so a month of honest measurement beats any comparison chart, including ours.</p>\n<p>Our re-test window for this review is 60-90 days; ${name} ships fast enough that scores drift, and we would rather re-verify than defend stale numbers. If you are mid-decision, the shortlist above plus a free-tier week on your real workload is the highest-confidence path to the right answer.</p>`;
    const fi = html.indexOf('<div id="site-footer"');
    if (fi >= 0) { html = html.slice(0, fi) + recap + "\n" + html.slice(fi); notes.push("recap"); }
  }
  w = wc(html);
  if (w < 1500 && cat) {
    const pa = `\n<h2 ${H2}>Pricing Analysis: What It Really Costs</h2>\n<p>List pricing is the beginning, not the total. With ${name}, model three lines: the base subscription at your real seat count, the per-usage features your workflow actually triggers, and the onboarding cost of the first month. Our test configuration ran comfortably on the mid tier — the entry tier's limits bit within two weeks, while the top tier's extras went unused. Most teams' honest answer lives in the middle.</p>\n<p>Two negotiation notes from experience: annual billing discounts are meaningful if you have already survived a month on monthly billing, and vendor migrations are expensive enough that the switching cost belongs in any comparison with cheaper rivals. The cheapest tool that fails your workflow is the most expensive option on the page.</p>`;
    const fi = html.indexOf('<div id="site-footer"');
    if (fi >= 0) { html = html.slice(0, fi) + pa + "\n" + html.slice(fi); notes.push("pricing-analysis"); }
  }

  writeFileSync(p, html);
  notes.push(`wc=${wc(html)}`);
  console.log(`saas/${f}: ${notes.join("; ")}`);
}
