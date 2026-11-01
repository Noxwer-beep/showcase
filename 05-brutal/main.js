/* 05 — Brutalist.
   Three interactions: a lagging cursor ring, magnetic buttons that lean toward the
   pointer, and a sticker you can actually drag around (mouse, touch, arrow keys). */

(function () {
  "use strict";

  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- cursor ---------- */
  var dot = document.getElementById("dot");
  var ring = document.getElementById("ring");

  if (fine && dot && ring && !reduce) {
    var mx = window.innerWidth / 2;
    var my = window.innerHeight / 2;
    var rx = mx, ry = my;
    var seen = false;

    window.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      mx = e.clientX; my = e.clientY;
      seen = true;
      dot.style.transform = "translate3d(" + mx + "px," + my + "px,0) translate(-50%,-50%)";
    }, { passive: true });

    // the ring trails the dot; it is the only per-frame work on the page
    var loop = function () {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = "translate3d(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px,0) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    document.addEventListener("pointerover", function (e) {
      if (!seen) return;
      var hit = e.target.closest("a, button, .sticker, .card");
      ring.classList.toggle("is-link", !!hit);
    });
  } else {
    if (dot) dot.style.display = "none";
    if (ring) ring.style.display = "none";
  }

  /* ---------- magnetic buttons ---------- */
  if (fine && !reduce) {
    document.querySelectorAll(".btn").forEach(function (btn) {
      var strength = 7;
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        var dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        btn.style.setProperty("--tx", (dx * strength).toFixed(1) + "px");
        btn.style.setProperty("--ty", (dy * strength).toFixed(1) + "px");
      });
      btn.addEventListener("pointerleave", function () {
        btn.style.setProperty("--tx", "0px");
        btn.style.setProperty("--ty", "0px");
      });
    });
  }

  /* ---------- draggable sticker ---------- */
  var sticker = document.getElementById("sticker");
  if (sticker) {
    var tx = 0, ty = 0;
    var dragging = false;
    var startX = 0, startY = 0;
    var baseRotate = -9;

    function place() {
      sticker.style.transform =
        "translate(" + tx + "px," + ty + "px) rotate(" + baseRotate + "deg)";
    }

    sticker.addEventListener("pointerdown", function (e) {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      dragging = true;
      startX = e.clientX - tx;
      startY = e.clientY - ty;
      sticker.classList.add("dragging");
      sticker.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    sticker.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      tx = e.clientX - startX;
      ty = e.clientY - startY;
      place();
    });

    function end(e) {
      if (!dragging) return;
      dragging = false;
      sticker.classList.remove("dragging");
      if (e && e.pointerId != null && sticker.hasPointerCapture(e.pointerId)) {
        sticker.releasePointerCapture(e.pointerId);
      }
    }
    sticker.addEventListener("pointerup", end);
    sticker.addEventListener("pointercancel", end);

    // keyboard equivalent, so the easter egg is not mouse-only
    sticker.addEventListener("keydown", function (e) {
      var step = e.shiftKey ? 40 : 12;
      var keys = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      var move = keys[e.key];
      if (!move) return;
      e.preventDefault();
      tx += move[0];
      ty += move[1];
      place();
    });

    place();
  }
})();
