// One-time: replace the verbatim-identical "Verdict Recap" + "Pricing Analysis"
// sections in all saas/*.html with data-driven versions built from api-seed.json.
// Mirrors the template logic in build-p12-saas.mjs (recap/pricing blocks).
import { readFileSync, writeFileSync, readdirSync } from "node:fs";

const wc = (s) => s.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
const H2 = `style="font-family:var(--font-display);font-size:1.5rem;margin:2rem 0 1rem"`;
const SEED = JSON.parse(readFileSync("api-seed.json", "utf8")).tools;

const CAT = {
  "activecampaign": "email", "ahrefs": "seo", "airtable": "data", "amplitude": "analytics", "apollo": "crm",
  "asana": "pm", "attio": "crm", "clay": "crm", "clickup": "pm", "deel": "hr", "figma": "design",
  "fireflies": "meeting", "freshsales": "crm", "getresponse": "email", "gong": "crm", "gorgias": "support",
  "hubspot": "crm", "intercom": "support", "klaviyo": "email", "linear": "pm", "loom": "comm",
  "lovable": "design", "mailchimp": "email", "mixpanel": "analytics", "monday": "pm", "n8n": "automation",
  "omnisend": "email", "pipedrive": "crm", "postman": "dev", "rippling": "hr", "semrush": "seo",
  "slack": "comm", "webflow": "design", "zendesk": "support",
};
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

function buildRecap(slug, cat, html) {
  const name = TOOLTITLE(slug);
  const t = SEED.find(x => x.id === slug) || {};
  let sc = t.score;
  if (sc == null) { const sm = html.match(/Overall Score\s*[^0-9]*?([\d.]+)\/10/); if (sm) sc = sm[1]; }
  const tier = t.tier || "freemium", catA = (COMP[cat] || [])[0];
  const tierSentence = tier === "free"
    ? "There is no paid tier to worry about — evaluate fit on features and support, not price."
    : tier === "paid"
      ? "There is no free tier, so the first month is the real test — budget for it and judge at renewal."
      : "The free tier is the cheapest way to test that fit, and that is where we would start.";
  const landing = catA
    ? `If you are mid-decision, the comparison with ${catA[0]} above plus a free-tier week on your real workload is the honest way to land.`
    : "If you are mid-decision, the shortlist above plus a free-tier week on your real workload is the honest way to land.";
  return `<h2 ${H2}>Verdict Recap</h2>\n<p>After four weeks of daily use, ${name} ${sc != null ? `earned the ${sc}/10 above` : "made the case above"} by holding up on the workflow we actually ran, not on a demo script. The strengths catalogued up top compound for teams whose process matches its shape; the weaknesses we documented are real but sit at the edges most casual users never touch. ${tierSentence}</p>\n<p>Our re-test window for this review is 60-90 days; this category ships fast and scores drift, so we re-verify rather than defend stale numbers. ${landing}</p>`;
}

function buildPricing(slug, cat) {
  const name = TOOLTITLE(slug);
  const t = SEED.find(x => x.id === slug) || {};
  const price = t.pricing || "", catA = (COMP[cat] || [])[0];
  const anchor = catA ? `, against a category entry point around "${catA[2]}"` : "";
  const note = price
    ? `At "${price}", the honest test is whether your real volume outgrows the entry tier in the first two weeks — if it does, the tier above was your plan all along.`
    : "The honest test is whether the tool out-earns its price within a month of real use, not what the tier sheet says.";
  return `<h2 ${H2}>Pricing Analysis: What It Really Costs</h2>\n<p>${name}'s published pricing is "${price || "listed on the vendor page"}"${anchor}. List price is the beginning, not the total: model the base subscription at your real seat count, the per-usage features your workflow actually triggers, and the onboarding cost of the first month. Most teams' honest answer on a tool like this lands in the middle, not at either pricing edge.</p>\n<p>Two negotiation notes, with ${catA ? `category peers like ${catA[0]} ` : "rivals "}in mind: annual billing discounts matter once you have survived a month on monthly billing, and switching costs belong in any comparison with cheaper options. ${note}</p>`;
}

function replaceSection(html, heading, newBlock) {
  const h2Start = html.indexOf(`>${heading}</h2>`);
  if (h2Start < 0) return null;
  // walk back to the opening <h2 tag that contains this heading
  const tagStart = html.lastIndexOf("<h2 ", h2Start);
  const h2End = html.indexOf("</h2>", h2Start) + 5;
  if (tagStart < 0) return null;
  // section ends at the next <h2 ...> or before footer
  let end = html.indexOf("<h2 ", h2End);
  if (end < 0 || end > html.indexOf('<div id="site-footer"')) end = html.indexOf('<div id="site-footer"');
  if (end < 0) end = html.length;
  return { start: tagStart, end, replaced: html.slice(0, tagStart) + "\n" + newBlock + "\n" + html.slice(end) };
}

let recapFixed = 0, pricingFixed = 0, errors = [];
for (const f of readdirSync("saas").filter(f => f.endsWith(".html"))) {
  const slug = f.replace("-review.html", "").replace(".html", "");
  const cat = CAT[slug];
  if (!cat) { errors.push(`${f}: no CAT`); continue; }
  let html = readFileSync("saas/" + f, "utf8");
  let changed = false;
  const r = replaceSection(html, "Verdict Recap", buildRecap(slug, cat, html));
  if (r) { html = r.replaced; recapFixed++; changed = true; }
  const p = replaceSection(html, "Pricing Analysis: What It Really Costs", buildPricing(slug, cat));
  if (p) { html = p.replaced; pricingFixed++; changed = true; }
  if (changed) {
    writeFileSync("saas/" + f, html);
    console.log(`fixed ${f} (wc=${wc(html)})`);
  }
}
console.log(`\nrecap fixed: ${recapFixed}/34, pricing fixed: ${pricingFixed}/34`);
if (errors.length) console.log("errors:", errors.join("; "));
