/* 01 — Paper.
   Three small things: reading progress, staggered reveals, and a hover
   underline that follows the pointer across the ledger. */

(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- reading progress ---------- */
  var bar = document.getElementById("bar");
  function progress() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var pct = h > 0 ? (window.scrollY / h) * 100 : 0;
    bar.style.width = Math.min(100, Math.max(0, pct)) + "%";
  }
  if (bar) {
    progress();
    window.addEventListener("scroll", progress, { passive: true });
    window.addEventListener("resize", progress);
  }

  /* ---------- reveals ---------- */
  var targets = document.querySelectorAll(".hero-grid > *, .ledger li, .about-grid > *, .contact > *");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("rv", "in"); });
  } else {
    targets.forEach(function (el, i) {
      el.classList.add("rv");
      el.style.transitionDelay = Math.min(i % 4, 3) * 60 + "ms";
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -5% 0px" });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- ledger rows: the number leans in ---------- */
  if (!reduce) {
    document.querySelectorAll(".ledger li").forEach(function (row) {
      row.addEventListener("pointerenter", function () {
        row.querySelector(".num").style.transform = "translateX(4px)";
        row.querySelector(".num").style.transition = "transform .4s cubic-bezier(.2,.7,.2,1)";
      });
      row.addEventListener("pointerleave", function () {
        row.querySelector(".num").style.transform = "";
      });
    });
  }
})();
