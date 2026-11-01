/* Gallery hub.
   The preview follows the cursor with a little lag. Rows own their thumbnail via
   data-img, so adding a concept is one <a> and one image. */

(function () {
  "use strict";

  var preview = document.getElementById("preview");
  var img = document.getElementById("previewImg");
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!preview || !img || !fine) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var tx = 0, ty = 0, px = 0, py = 0, active = false;

  // warm the cache so the first hover is instant
  document.querySelectorAll(".row[data-img]").forEach(function (row) {
    var pre = new Image();
    pre.src = row.getAttribute("data-img");
  });

  function render() {
    var e = reduce ? 1 : 0.16;
    px += (tx - px) * e;
    py += (ty - py) * e;
    preview.style.transform =
      "translate3d(" + px.toFixed(1) + "px," + py.toFixed(1) + "px,0) translate(-50%,-50%)";
    if (active) requestAnimationFrame(render);
  }

  document.querySelectorAll(".row").forEach(function (row) {
    row.addEventListener("pointerenter", function (e) {
      img.src = row.getAttribute("data-img");
      preview.classList.add("on");
      tx = e.clientX;
      ty = e.clientY;
      if (!active) {
        active = true;
        px = tx;
        py = ty;
        requestAnimationFrame(render);
      }
    });

    row.addEventListener("pointerleave", function () {
      preview.classList.remove("on");
      active = false;
    });
  });

  document.addEventListener("pointermove", function (e) {
    if (!active) return;
    tx = e.clientX;
    ty = e.clientY;
  }, { passive: true });
})();
