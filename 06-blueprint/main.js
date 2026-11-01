/* Blueprint — crosshair guides, readout, sheet reveal. */

(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- construction crosshair ---------- */
  var ax = document.querySelector(".axis-x");
  var ay = document.querySelector(".axis-y");
  var readout = document.getElementById("readout");

  if (ax && ay && !reduce && window.matchMedia("(pointer: fine)").matches) {
    var raf = 0, gx = 0, gy = 0;

    function paint() {
      ax.style.top = gy + "px";
      ay.style.left = gx + "px";
      if (readout) {
        readout.textContent = "x " + String(Math.round(gx)).padStart(3, "0") +
                              " · y " + String(Math.round(gy)).padStart(3, "0");
      }
      raf = 0;
    }

    document.addEventListener("mousemove", function (e) {
      gx = e.clientX; gy = e.clientY;
      if (!raf) raf = requestAnimationFrame(paint);
    }, { passive: true });
  }

  /* ---------- drawn date ---------- */
  var drawn = document.getElementById("drawn");
  if (drawn) drawn.textContent = String(new Date().getFullYear());

  /* ---------- reveal each sheet ---------- */
  var sheets = document.querySelectorAll(".sheet");
  if (reduce || !("IntersectionObserver" in window)) {
    sheets.forEach(function (s) { s.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
    sheets.forEach(function (s) {
      // the hero is above the fold on load; show it once painted
      io.observe(s);
    });
  }
})();
