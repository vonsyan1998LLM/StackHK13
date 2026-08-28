/* ============================================================
   StackHK 统一站点头部/尾部组件
   用法：在页面中放置
     <div id="site-header" data-prefix="" data-page="home"></div>
     <div id="site-footer" data-prefix=""></div>
   并引入本脚本。data-prefix = 相对路径前缀（"" 或 "../"）
   data-page = 当前页（home/news/tools/reviews/categories/articles/compare/deals/saas/about/submit/ranking/glossary/weekly/search/contact/privacy/terms/disclosure）
   修改头部/尾部只需改这一个文件，全站同步。
   ============================================================ */
(function () {
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  var headerEl = document.getElementById("site-header");
  var footerEl = document.getElementById("site-footer");
  if (!headerEl && !footerEl) return;

  var prefix = (headerEl && headerEl.getAttribute("data-prefix")) || "";
  var page = (headerEl && headerEl.getAttribute("data-page")) || "";

  function navLink(href, label, key) {
    var cls = (key === page) ? ' class="active"' : "";
    return '<a href="' + esc(prefix) + href + '"' + cls + '>' + label + "</a>";
  }

  var header = "" +
    '<header>' +
      '<div class="wrap nav">' +
        '<a class="logo" href="' + esc(prefix) + 'index.html"><img src="' + esc(prefix) + 'images/logo.svg" alt="StackHK" style="width:28px;height:28px"> <span class="lt">STACK<span class="lk">HK</span></span></a>' +
        '<nav class="nav-links">' +
          navLink("news.html", "AI News", "news") +
          navLink("tools.html", "Reviews", "tools") +
          navLink("categories.html", "Categories", "categories") +
          navLink("articles.html", "Articles", "articles") +
          navLink("compare.html", "Compare", "compare") +
          navLink("deals.html", "Deals", "deals") +
          navLink("saas.html", "SaaS", "saas") +
          navLink("about.html", "About", "about") +
        "</nav>" +
        '<button class="menu-btn" type="button" aria-label="Toggle menu" aria-expanded="false">&#9776;</button>' +
        '<a class="btn btn-primary" href="' + esc(prefix) + 'submit.html">Submit a Tool</a>' +
      "</div>" +
      '<nav class="mobile-menu" hidden></nav>' +
    "</header>";

  var footer = "" +
    "<footer>" +
      '<div class="wrap">' +
        '<div class="foot-grid">' +
          '<div class="foot-brand">' +
            '<a class="logo" href="' + esc(prefix) + 'index.html"><img src="' + esc(prefix) + 'images/logo-white.svg" alt="StackHK" style="width:28px;height:28px"> <span class="lt">STACK<span class="lk">HK</span></span></a>' +
            '<p>Hong Kong\'s independent source for honest, in-depth AI tool and B2B SaaS reviews. We test so you don\'t have to.</p>' +
          "</div>" +
          "<div>" +
            "<h4>Discover</h4><ul>" +
              '<li><a href="' + esc(prefix) + 'reviews.html">AI Tool Reviews</a></li>' +
              '<li><a href="' + esc(prefix) + 'tools.html">Full Directory</a></li>' +
              '<li><a href="' + esc(prefix) + 'ranking.html">Top 20 Ranking</a></li>' +
              '<li><a href="' + esc(prefix) + 'categories.html">Categories</a></li>' +
              '<li><a href="' + esc(prefix) + 'submit.html">Submit a Tool</a></li>' +
            "</ul>" +
          "</div>" +
          "<div>" +
            "<h4>Learn</h4><ul>" +
              '<li><a href="' + esc(prefix) + 'articles.html">Articles &amp; Guides</a></li>' +
              '<li><a href="' + esc(prefix) + 'compare.html">Comparisons</a></li>' +
              '<li><a href="' + esc(prefix) + 'glossary.html">AI Glossary</a></li>' +
              '<li><a href="' + esc(prefix) + 'deals.html">Deals</a></li>' +
            "</ul>" +
          "</div>" +
          "<div>" +
            "<h4>Site</h4><ul>" +
              '<li><a href="' + esc(prefix) + 'news.html">AI News</a></li>' +
              '<li><a href="' + esc(prefix) + 'weekly.html">Newsletter</a></li>' +
              '<li><a href="' + esc(prefix) + 'about.html">About Us</a></li>' +
              '<li><a href="' + esc(prefix) + 'contact.html">Contact</a></li>' +
              '<li><a href="' + esc(prefix) + 'legal.html">Privacy Policy</a></li>' +
            "</ul>" +
          "</div>" +
        "</div>" +
        '<div class="foot-bottom">' +
          "<span>&copy; 2026 StackHK Media. All rights reserved. Hong Kong.</span>" +

        "</div>" +
      "</div>" +
    "</footer>";

  if (headerEl) headerEl.outerHTML = header;
  if (footerEl) footerEl.outerHTML = footer;
})();