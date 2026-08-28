/* Mobile drawer menu — clones desktop nav links so active states stay in sync */
(function () {
  var btn = document.querySelector(".menu-btn");
  var panel = document.querySelector(".mobile-menu");
  if (!btn || !panel) return;
  var src = document.querySelector(".nav-links");
  if (src) {
    panel.innerHTML = src.innerHTML;
    // derive root prefix from an existing link ("../" on nested pages)
    var first = src.querySelector("a");
    var pre = first ? (first.getAttribute("href") || "").replace(/[^\/]*$/, "") : "";
    var extra = [
      [pre + "submit.html", "Submit a Tool"],
      [pre + "weekly.html", "Weekly Newsletter"]
    ];
    extra.forEach(function (pair) {
      if (!panel.querySelector('a[href="' + pair[0] + '"]')) {
        var a = document.createElement("a");
        a.href = pair[0];
        a.textContent = pair[1];
        panel.appendChild(a);
      }
    });
  }
  function setOpen(open) {
    panel.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  }
  btn.addEventListener("click", function () {
    setOpen(!panel.classList.contains("open"));
  });
  panel.addEventListener("click", function (e) {
    if (e.target.tagName === "A") setOpen(false);
  });
  document.addEventListener("click", function (e) {
    if (panel.classList.contains("open") && !panel.contains(e.target) && !btn.contains(e.target)) setOpen(false);
  });
  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) setOpen(false);
  });
})();
