/* hero-type.js — h1 逐字打字机（无 JS/减少动态时显示完整文本） */
document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("typeline");
  const caret = document.getElementById("typecaret");
  const grad = document.getElementById("gradline");
  if (!el || !caret || !grad) return;
  const text = el.textContent;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !text) { caret.style.display = "none"; return; }
  el.setAttribute("aria-hidden", "true");
  el.textContent = "";
  grad.style.opacity = "0";
  grad.style.transition = "opacity .9s ease";
  caret.style.display = "inline-block";
  let i = 0;
  (function type() {
    if (i <= text.length) {
      el.textContent = text.slice(0, i++);
      setTimeout(type, 60 + Math.random() * 45);
    } else {
      setTimeout(() => { caret.style.display = "none"; grad.style.opacity = "1"; }, 500);
    }
  })();
});
