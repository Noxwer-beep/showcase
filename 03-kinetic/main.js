/* 03 — Kinetic.
   Four behaviours: per-letter hover, scroll-velocity marquee, a horizontal rail
   driven by vertical scroll, and word-by-word statement reveal. */

(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var wide = window.matchMedia("(min-width: 901px)");

  /* ---------- split hero words into chars ---------- */
  document.querySelectorAll("[data-split]").forEach(function (word) {
    var text = word.textContent.trim();
    word.textContent = "";
    word.setAttribute("aria-hidden", "true");
    for (var i = 0; i < text.length; i++) {
      var s = document.createElement("span");
      s.className = "ch";
      s.textContent = text.charAt(i) === " " ? "\u00A0" : text.charAt(i);
      word.appendChild(s);
    }
  });

  var heroType = document.querySelector(".hero-type");
  if (heroType && !reduce) {
    heroType.querySelectorAll(".word").forEach(function (word) {
      word.addEventListener("pointerenter", function () {
        word.querySelectorAll(".ch").forEach(function (ch, i) {
          var y = (Math.random() * 2 - 1) * 0.09;
          var r = (Math.random() * 2 - 1) * 7;
          ch.style.transitionDelay = i * 12 + "ms";
          ch.style.transform = "translateY(" + y.toFixed(3) + "em) rotate(" + r.toFixed(1) + "deg)";
        });
      });
      word.addEventListener("pointerleave", function () {
        word.querySelectorAll(".ch").forEach(function (ch) {
          ch.style.transitionDelay = "0ms";
          ch.style.transform = "";
        });
      });
    });
  }

  /* ---------- scroll-velocity marquee ---------- */
  var track = document.getElementById("track");
  if (track) {
    var x = 0;
    var velocity = 0;
    var lastY = window.scrollY;

    if (reduce) {
      track.style.transform = "translate3d(0,0,0)";
    } else {
      var tick = function () {
        var y = window.scrollY;
        var delta = y - lastY;
        lastY = y;
        velocity += delta * 0.28;
        velocity *= 0.9;

        var half = track.scrollWidth / 2;
        x -= 0.6 + velocity;
        if (x <= -half) x += half;
        if (x > 0) x -= half;

        track.style.transform = "translate3d(" + x.toFixed(2) + "px,0,0)";
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }

  /* ---------- horizontal rail ---------- */
  var wrap = document.getElementById("railWrap");
  var rail = document.getElementById("rail");
  var indexEl = document.getElementById("railIndex");

  function updateRail() {
    if (!wrap || !rail) return;

    if (!wide.matches) {
      rail.style.transform = "";
      return;
    }

    var total = wrap.offsetHeight - window.innerHeight;
    var scrolled = Math.min(Math.max(-wrap.getBoundingClientRect().top, 0), total);
    var p = total > 0 ? scrolled / total : 0;
    var max = rail.scrollWidth - window.innerWidth;
    rail.style.transform = "translate3d(" + (-p * max).toFixed(1) + "px,0,0)";

    if (indexEl) {
      var n = Math.min(4, Math.floor(p * 4) + 1);
      indexEl.textContent = ("0" + n).slice(-2);
    }
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      updateRail();
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateRail();

  /* ---------- statement reveal ---------- */
  var statement = document.querySelector("[data-words]");
  if (statement) {
    var words = statement.textContent.trim().split(/\s+/);
    statement.textContent = "";
    words.forEach(function (w) {
      var outer = document.createElement("span");
      outer.className = "w";
      var inner = document.createElement("span");
      inner.textContent = w + " ";
      outer.appendChild(inner);
      statement.appendChild(outer);
    });

    if (reduce || !("IntersectionObserver" in window)) {
      statement.classList.add("in");
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            statement.classList.add("in");
            io.disconnect();
          }
        });
      }, { threshold: 0.35 });
      io.observe(statement);
    }
  }
})();
