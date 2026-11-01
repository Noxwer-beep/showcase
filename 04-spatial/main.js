/* 04 — Spatial.
   A flow field on canvas: ~900 particles steered by a cheap trig field, repelled
   by the pointer, drawn as short strokes over a slowly fading buffer. Batched into
   two paths (bone + coral) so it stays under a millisecond of layout work. */

(function () {
  "use strict";

  var canvas = document.getElementById("field");
  if (!canvas) return;
  var ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0;
  var particles = [];
  var mouse = { x: -9999, y: -9999, active: false };
  var time = 0;
  var running = true;
  var raf = 0;

  var BONE = "rgba(236, 233, 224, 0.26)";
  var CORAL = "rgba(255, 106, 77, 0.55)";
  var BG = "#05060a";

  function count() {
    var area = window.innerWidth * window.innerHeight;
    // sparser than it looks: short strokes read as texture, not noise
    return Math.max(220, Math.min(700, Math.round(area / 2400)));
  }

  function spawn(n) {
    particles = [];
    for (var i = 0; i < n; i++) {
      var sx = Math.random() * W;
      var sy = Math.random() * H;
      particles.push({
        x: sx,
        y: sy,
        vx: 0,
        vy: 0,
        speed: 0.5 + Math.random() * 0.9,
        phase: (Math.random() * 2 - 1) * 0.35,
        coral: Math.random() < 0.07,
        px: sx,
        py: sy
      });
    }
  }

  function resize() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = w; H = h;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);
    spawn(count());
    if (reduce) drawStatic();
  }

  function fieldAngle(x, y, phase) {
    // two crossed sines approximate a noise field cheaply; the per-particle
    // phase stops the whole field collapsing into identical horizontal bands
    return (
      Math.sin(x * 0.0021 + time * 0.00022 + phase) * 1.7 +
      Math.cos(y * 0.0026 - time * 0.00018 + phase * 0.7) * 1.7
    );
  }

  function step() {
    // fade the previous frame instead of clearing: that is the trail
    ctx.fillStyle = "rgba(5, 6, 10, 0.13)";
    ctx.fillRect(0, 0, W, H);

    ctx.lineWidth = 1;
    ctx.lineCap = "round";

    var bone = new Path2D();
    var coral = new Path2D();
    var mx = mouse.x, my = mouse.y;
    var mr = mouse.active ? 150 : 0;
    var mr2 = mr * mr;

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var a = fieldAngle(p.x, p.y, p.phase);

      p.vx += Math.cos(a) * 0.10;
      p.vy += Math.sin(a) * 0.10;

      if (mr > 0) {
        var dx = p.x - mx;
        var dy = p.y - my;
        var d2 = dx * dx + dy * dy;
        if (d2 < mr2 && d2 > 0.01) {
          var d = Math.sqrt(d2);
          var force = (1 - d / mr) * 1.1;
          p.vx += (dx / d) * force;
          p.vy += (dy / d) * force;
        }
      }

      // drag keeps momentum from running away; clamp caps the stroke length
      p.vx *= 0.94;
      p.vy *= 0.94;
      var mag = Math.hypot(p.vx, p.vy);
      var cap = p.speed * 0.9;
      if (mag > cap) {
        p.vx = (p.vx / mag) * cap;
        p.vy = (p.vy / mag) * cap;
      }

      p.px = p.x;
      p.py = p.y;
      p.x += p.vx;
      p.y += p.vy;

      // wrap around the edges rather than clamping
      if (p.x < -5) p.x = W + 5;
      if (p.x > W + 5) p.x = -5;
      if (p.y < -5) p.y = H + 5;
      if (p.y > H + 5) p.y = -5;

      // a wrapped particle jumps from one edge to the other; without this guard
      // the stroke would draw a line straight across the whole canvas
      if (Math.abs(p.x - p.px) > 24 || Math.abs(p.y - p.py) > 24) continue;

      var path = p.coral ? coral : bone;
      path.moveTo(p.px, p.py);
      path.lineTo(p.x, p.y);
    }

    ctx.strokeStyle = BONE;
    ctx.stroke(bone);
    ctx.strokeStyle = CORAL;
    ctx.stroke(coral);

    time += 16;
    if (running) raf = requestAnimationFrame(step);
  }

  function drawStatic() {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = BONE;
    ctx.lineWidth = 1;
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var a = fieldAngle(p.x, p.y, p.phase || 0);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + Math.cos(a) * 9, p.y + Math.sin(a) * 9);
      ctx.stroke();
    }
  }

  /* ---------- pointer ---------- */
  window.addEventListener("pointermove", function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  }, { passive: true });

  window.addEventListener("pointerleave", function () { mouse.active = false; });

  window.addEventListener("pointerdown", function (e) {
    if (reduce) return;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    // a little burst: 24 particles launched outward from the click
    for (var i = 0; i < 24 && particles.length < 1400; i++) {
      var ang = Math.random() * Math.PI * 2;
      var sp = 0.8 + Math.random() * 2.2;
      particles.push({
        x: e.clientX,
        y: e.clientY,
        px: e.clientX,
        py: e.clientY,
        phase: (Math.random() * 2 - 1) * 0.35,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp,
        speed: 0.8 + Math.random() * 0.8,
        coral: Math.random() < 0.35
      });
    }
  });

  /* ---------- lifecycle ---------- */
  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(raf);
    } else if (!reduce) {
      running = true;
      raf = requestAnimationFrame(step);
    }
  });

  resize();

  if (!reduce) raf = requestAnimationFrame(step);

  /* ---------- section reveals ---------- */
  var blocks = document.querySelectorAll(".block");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    blocks.forEach(function (b) { io.observe(b); });
  } else {
    blocks.forEach(function (b) { b.classList.add("in"); });
  }
})();
