/* Aurora — parallax light, scroll reveal. */

(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  var orbs = Array.prototype.slice.call(document.querySelectorAll(".orb"));
  var cards = document.querySelectorAll(".card, .about-copy, .stats, .contact-title, .mail");

  /* ---------- reveal ---------- */
  cards.forEach(function (el) { el.classList.add("reveal"); });

  if (reduce || !("IntersectionObserver" in window)) {
    cards.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = Array.prototype.slice.call(el.parentElement.children);
        var i = siblings.indexOf(el);
        el.style.transitionDelay = Math.min(i, 3) * 70 + "ms";
        el.classList.add("in");
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    cards.forEach(function (el) { io.observe(el); });
  }

  /* ---------- parallax: scroll plus a slow pointer offset ---------- */
  if (reduce) return;

  var depths = [0.06, -0.04, 0.03];
  var pointer = { x: 0, y: 0 };
  var target = { x: 0, y: 0 };
  var scrolling = false;

  function frame() {
    pointer.x += (target.x - pointer.x) * 0.06;
    pointer.y += (target.y - pointer.y) * 0.06;

    var y = window.scrollY || 0;
    orbs.forEach(function (orb, i) {
      var d = depths[i] || 0.04;
      orb.style.transform = "translate3d(" +
        (pointer.x * (d * 14)).toFixed(2) + "px," +
        (y * -d + pointer.y * (d * 14)).toFixed(2) + "px, 0)";
    });

    if (Math.abs(target.x - pointer.x) > 0.1 || Math.abs(target.y - pointer.y) > 0.1) {
      requestAnimationFrame(frame);
    } else {
      scrolling = false;
    }
  }

  function kick() {
    if (!scrolling) { scrolling = true; requestAnimationFrame(frame); }
  }

  window.addEventListener("scroll", kick, { passive: true });

  if (window.matchMedia("(pointer: fine)").matches) {
    document.addEventListener("mousemove", function (e) {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
      kick();
    }, { passive: true });
  }
})();
