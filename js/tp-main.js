/* ToolPulse front-end dynamic renderer
   Loads /api/data (admin-editable, KV-backed); falls back to the bundled
   api-seed.json when the API is unavailable. Static pre-rendered HTML stays
   as the last-resort fallback. */
async function loadData() {
  try {
    const r = await fetch("/api/data", { headers: { accept: "application/json" } });
    if (r.ok) {
      const j = await r.json();
      if (j && Array.isArray(j.tools)) return j;
    }
  } catch (e) { /* fall through to bundled seed */ }
  const r2 = await fetch("/api-seed.json?v=" + Date.now(), { headers: { accept: "application/json" } });
  if (!r2.ok) return null;
  return r2.json();
}
(async function () {
  let DATA;
  try {
    DATA = await loadData();
    if (!DATA || !Array.isArray(DATA.tools)) return;
  } catch (e) { return; }

  const CAT = {
    chat: ["Chat & Writing", "cat-chat"], image: ["Image Gen", "cat-image"],
    video: ["Video", "cat-video"], code: ["Code", "cat-code"], audio: ["Audio", "cat-audio"],
    productivity: ["Productivity", "cat-productivity"], marketing: ["Marketing", "cat-marketing"],
    business: ["Business AI", "cat-business"]
  };
  const TAG = {
    release: ["Model Release", "tag-release"], policy: ["Policy & Governance", "tag-policy"],
    products: ["Tools & Products", "tag-products"], business: ["Company News", "tag-business"],
    research: ["Research", "tag-research"]
  };
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = sel => document.querySelector(sel);

  function toolCard(t) {
    const [catLabel, catClass] = CAT[t.category] || [t.category || "Tool", "cat-productivity"];
    const pill = t.tier === "paid" ? "pill-paid" : "pill-free";
    return `<a class="tool-card" href="${esc(t.reviewUrl||"#")}" data-cat="${esc(t.category)}" data-name="${esc(t.name)}">
      <div class="tool-top"><div class="tool-icon"><img src="${esc(t.icon)}" alt="" loading="lazy" style="width:26px;height:26px;border-radius:6px;object-fit:cover"></div>
        <div><div class="tool-name">${esc(t.name)}</div><span class="tool-cat ${catClass}">${esc(catLabel)}</span></div>
        <div class="score"><b>${Number(t.score).toFixed(1)}</b></div></div>
      <p>${esc(t.desc)}</p>
      <div class="tool-foot"><span>${esc(t.vendor)}</span><span class="${pill}">${esc(t.pricing)}</span></div></a>`;
  }

  function newsItem(n) {
    const [tagLabel, tagClass] = TAG[n.tag] || [n.tag, "tag-products"];
    return `<article class="feed-item">
      <div class="feed-meta"><span class="feed-tag ${tagClass}">${esc(tagLabel)}</span><span>· ${esc(n.when)}</span></div>
      <h3 class="feed-title"><a href="${esc(n.url||"#")}">${esc(n.title)}</a></h3>
      <p class="feed-excerpt">${esc(n.excerpt)}</p></article>`;
  }

  /* ---- Homepage ---- */
  const homeGrid = $("#tools .tools-grid");
  if (homeGrid) {
    const feat = DATA.tools.filter(t => t.featured).slice(0, 8);
    if (feat.length) homeGrid.innerHTML = feat.map(toolCard).join("");
  }
  const homeFeed = $("#home-news-feed");
  if (homeFeed && Array.isArray(DATA.news)) homeFeed.innerHTML = DATA.news.slice(0, 5).map(newsItem).join("");
  const board = $("#home-scoreboard");
  if (board) {
    const top = [...DATA.tools].sort((a, b) => b.score - a.score).slice(0, 8);
    board.innerHTML = top.map(t =>
      `<li><span class="n">${esc(t.name)} · ${esc((CAT[t.category] || [""])[0])}</span><span class="s">${Number(t.score).toFixed(1)}</span></li>`).join("");
  }

  /* ---- Tools directory (filter + search) ---- */
  const grid = $("#grid");
  if (grid) {
    const chips = document.querySelectorAll(".chip");
    const search = $("#search");
    const countEl = $("#count");
    let activeCat = "all";
    function apply() {
      const q = (search?.value || "").trim().toLowerCase();
      let shown = 0;
      grid.innerHTML = "";
      DATA.tools.forEach(t => {
        const okCat = activeCat === "all" || t.category === activeCat;
        const hay = `${t.name} ${t.vendor} ${t.desc} ${t.category}`.toLowerCase();
        if (okCat && (!q || hay.includes(q))) { grid.insertAdjacentHTML("beforeend", toolCard(t)); shown++; }
      });
      if (!shown) grid.innerHTML = '<p style="color:var(--muted)">No tools match your filters.</p>';
      if (countEl) countEl.textContent = `Showing ${shown} of ${DATA.tools.length} tools`;
    }
    chips.forEach(ch => ch.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("on")); ch.classList.add("on");
      activeCat = ch.dataset.cat; apply();
    }));
    search?.addEventListener("input", apply);
    apply();
  }

  /* ---- News archive ---- */
  const newsFeed = $("#news-feed");
  if (newsFeed && Array.isArray(DATA.news)) newsFeed.innerHTML = DATA.news.map(newsItem).join("");

  /* ---- Top 20 ranking ---- */
  const rankCols = document.querySelectorAll("#top20 .rank-wrap");
  if (rankCols.length === 2) {
    const top = [...DATA.tools].sort((a, b) => b.score - a.score).slice(0, 20);
    rankCols.forEach((col, ci) => {
      col.innerHTML = top.slice(ci * 10, ci * 10 + 10).map((t, i) => {
        const n = ci * 10 + i + 1;
        const medal = n <= 3 ? '<span class="rank-medal m' + n + '">' + (n === 1 ? "1" : n === 2 ? "2" : "3") + '</span>' : n;
        return `<a class="rank-row${n === 1 ? " top1" : ""}" href="${esc(t.reviewUrl||"#")}"><span class="rank-num">${medal}</span>
          <div class="rank-body"><div class="rank-name">${esc(t.name)}</div><div class="rank-cat">${esc(t.vendor)}</div></div>
          <span class="rank-score">${Number(t.score).toFixed(1)}</span></a>`;
      }).join("");
    });
  }

  /* ---- Courses ---- */
  const freeG = $("#courses-free"), premG = $("#courses-premium");
  function courseCard(c) {
    const meta = [`<span class="stars">★★★★★ ${esc(c.rating)}</span>`, `· ${esc(c.duration)}`, `· ${esc(c.lessons)}`];
    if (c.learners) meta.push(`· ${esc(c.learners)}`);
    return `<div class="course-card">
      <div class="course-banner ${esc(c.banner)}">${c.free ? '<span class="free-pill">FREE</span>' : ""}${c.emoji}</div>
      <div class="course-body"><div class="course-meta">${meta.join("")}</div>
        <h3>${esc(c.title)}</h3><p>${esc(c.desc)}</p>
        <a class="btn ${c.free ? "btn-primary" : "btn-ghost"}" href="#subscribe">${c.free ? "Claim free access →" : "All-Access →"}</a>
      </div></div>`;
  }
  if (freeG && Array.isArray(DATA.courses)) freeG.innerHTML = DATA.courses.filter(c => c.free).map(courseCard).join("");
  if (premG && Array.isArray(DATA.courses)) premG.innerHTML = DATA.courses.filter(c => !c.free).map(courseCard).join("");

  /* ---- Buying guides ---- */
  function guideCard(g) {
    return `<a class="guide-card" href="${esc(g.url)}"><span class="emoji">${g.emoji}</span>
      <div><div class="tag tag-guide" style="display:inline-block">${esc(g.catLabel)}</div>
      <h3>${esc(g.title)}</h3><p>${esc(g.top)}</p></div></a>`;
  }
  const gHub = $("#guides-grid");
  if (gHub && Array.isArray(DATA.guides)) gHub.innerHTML = DATA.guides.map(guideCard).join("");
  const gHome = $("#home-guides");
  if (gHome && Array.isArray(DATA.guides)) gHome.innerHTML = DATA.guides.map(guideCard).join("");

  /* ---- Category-filtered grids (categories/* & saas) ---- */
  const cGrid = document.querySelector("#cat-grid");
  if (cGrid && Array.isArray(DATA.tools)) {
    const cats = (cGrid.dataset.cats || "").split(",").map(s => s.trim()).filter(Boolean);
    DATA.tools.filter(t => cats.includes(t.category) && (t.group||"ai")==="ai").forEach(t => cGrid.insertAdjacentHTML("beforeend", toolCard(t)));
    if (!cGrid.children.length) cGrid.innerHTML = '<p style="color:var(--muted)">No tools in this category yet.</p>';
  }

  /* ---- SaaS grid (saas.html) ---- */
  const sGrid = document.querySelector("#saas-grid");
  if (sGrid && Array.isArray(DATA.tools)) {
    DATA.tools.filter(t => t.saas).forEach(t => sGrid.insertAdjacentHTML("beforeend", toolCard(t)));
    if (!sGrid.children.length) sGrid.innerHTML = '<p style="color:var(--muted)">No SaaS reviews yet.</p>';
  }
  /* ---- Settings-driven hero text ---- */
  const s = DATA.settings || {};
  const badge = $(".hero-badge"); if (badge && s.heroBadge) badge.innerHTML = `<span class="dot"></span> ${esc(s.heroBadge)}`;
})();
