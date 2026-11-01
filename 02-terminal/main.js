/* 02 — Terminal.
   A small command interpreter: a handful of commands, history, tab completion,
   and a theme switch. Output is built with DOM nodes; user input is never
   injected as HTML. */

(function () {
  "use strict";

  var out = document.getElementById("out");
  var screen = document.getElementById("screen");
  var form = document.getElementById("form");
  var input = document.getElementById("cmd");
  var hint = document.getElementById("hint");
  var clockEl = document.getElementById("clock");
  var root = document.documentElement;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var busy = true;
  var history = [];
  var hIndex = 0;

  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  function toBottom() { screen.scrollTop = screen.scrollHeight; }

  function node(html, cls) {
    var el = document.createElement("div");
    el.className = "line" + (cls ? " " + cls : "");
    el.innerHTML = html;
    out.appendChild(el);
    toBottom();
    return el;
  }

  function gap() { node("", "gap"); }

  function echo(text) {
    node('<span class="ps1">max@homelab:~/portfolio$</span> ' + escapeHtml(text), "echo");
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- boot ---------- */
  var boot = [
    ["mj-terminal v1.0 · boot", "dim"],
    ["[ ok ] mount /home/max", ""],
    ["[ ok ] network 10.10.10.0/24", ""],
    ["[ ok ] firewall · 312 rules loaded", ""],
    ["[ ok ] portfolio · 3 files, 0 dependencies", ""],
    ["", ""],
    ["", "gap"],
    ["", "welcome"],
    ["Welcome. This whole site is one shell.", "bright"],
    ["Type <b>help</b> to look around.", "dim"]
  ];

  var neofetch =
    '  <span class="ok">/\\_/\\</span>     <b>maximilian@homelab</b>\n' +
    ' <span class="ok">( o.o )</span>    <span class="dim">───────────────────</span>\n' +
    '  <span class="ok">&gt; ^ &lt;</span>     <span class="dim">role</span>   IT student &amp; builder\n' +
    '            <span class="dim">base</span>   Germany · CET\n' +
    '            <span class="dim">focus</span>  homelab · security · web\n' +
    '            <span class="dim">now</span>    Metasploitable 2 · AI agents\n' +
    '            <span class="dim">shell</span>  bash, allegedly';

  async function typeBoot() {
    for (var i = 0; i < boot.length; i++) {
      var text = boot[i][0];
      var cls = boot[i][1];
      if (cls === "gap") { gap(); continue; }
      if (cls === "welcome") { node(neofetch); continue; }
      var el = node("", cls);
      if (reduce) {
        el.innerHTML = text;
      } else {
        // type only the plain-text lines; markup lines appear at once
        if (/[<>]/.test(text)) {
          el.innerHTML = text;
        } else {
          for (var c = 0; c < text.length; c++) {
            el.textContent += text.charAt(c);
            toBottom();
            await sleep(9 + Math.random() * 8);
          }
        }
      }
      await sleep(reduce ? 0 : 45);
    }
    busy = false;
    input.focus();
  }

  /* ---------- content ---------- */
  var parts = {
    about:
      "I learn by building the thing, breaking it, and writing down what happened.\n" +
      "25, studying IT in Germany. The homelab is where the theory gets tested:\n" +
      "one server, managed switches, firewall rules, a segmented network — and\n" +
      "documentation for all of it.",
    lab:
      "Homelab · 2026\n\n" +
      "  Bare-metal server, managed switches, firewall rules and a segmented\n" +
      "  network. Every rule is written down, because a system nobody can\n" +
      "  explain is a system nobody can fix.",
    security:
      "Security · ongoing\n\n" +
      "  Hack The Box machines and local labs like Metasploitable 2.\n" +
      "  Enumeration first; the exploit is usually the boring part.\n" +
      "  Notes for every box, including the dead ends.",
    agents:
      "AI agents · ongoing\n\n" +
      "  Tool-calling agents for research and automation, built to be useful\n" +
      "  first and impressive second — which is the harder order.",
    contact:
      'Email    <a href="mailto:jatzkowski.maximilian@gmail.com">jatzkowski.maximilian@gmail.com</a>\n' +
      'Hack The Box  <a href="https://www.hackthebox.com/" target="_blank" rel="noopener">hackthebox.com</a>\n\n' +
      "  Replies in English or German, usually within a day."
  };

  var commands = {
    help: function () {
      node("Available commands:", "bright");
      gap();
      [
        ["help", "this list"],
        ["whoami", "name, role, base"],
        ["ls", "what is in the portfolio"],
        ["cat <topic>", "about · lab · security · agents · contact"],
        ["projects", "the four things I spend time on"],
        ["contact", "email and socials"],
        ["theme paper", "light mode, for daylight"],
        ["date", "local time"],
        ["clear", "wipe the screen"]
      ].forEach(function (row) {
        node("  <b>" + row[0] + "</b>" + " ".repeat(Math.max(2, 18 - row[0].length)) + '<span class="dim">' + row[1] + "</span>");
      });
      gap();
      node('<span class="dim">Tab completes commands. ↑ recalls history. Ctrl+L clears.</span>');
    },

    whoami: function () {
      node("Maximilian Jatzkowski", "bright");
      node("role      IT student &amp; builder");
      node("base      Germany · CET");
      node("focus     homelab · security · web");
      node('status    <span class="ok">●</span> Metasploitable 2 · AI agents');
    },

    ls: function () {
      var items = [
        ["about/", "about", "who I am"],
        ["lab/", "lab", "homelab build"],
        ["security/", "security", "HTB, labs"],
        ["agents/", "agents", "AI agents"],
        ["contact/", "contact", "email"]
      ];
      items.forEach(function (it) {
        node(
          '  <a href="#" data-cmd="cat ' + it[1] + '">' + it[0] + "</a>" +
          " ".repeat(Math.max(2, 14 - it[0].length)) +
          '<span class="dim">' + it[2] + "</span>"
        );
      });
      gap();
      node('<span class="dim">4 entries · run <b>cat &lt;topic&gt;</b> or click one</span>');
    },

    cat: function (args) {
      var topic = (args[0] || "").toLowerCase();
      if (!topic) return node("usage: cat &lt;about|lab|security|agents|contact&gt;", "warn");
      if (!parts[topic]) return node("cat: " + escapeHtml(topic) + ": no such file", "warn");
      node(parts[topic]);
    },

    projects: function () {
      [
        ["2026", "Homelab", "server, switching, firewall rules, docs"],
        ["ongoing", "Hack The Box", "enumeration, exploitation, priv-esc"],
        ["ongoing", "Agent experiments", "tool-calling, automation"],
        ["2026", "This site", "hand-written, no framework"]
      ].forEach(function (p) {
        node("  <span class=\"dim\">" + p[0].padEnd(9) + "</span><b>" + p[1] + "</b>  <span class=\"dim\">" + p[2] + "</span>");
      });
    },

    contact: function () {
      node(parts.contact);
    },

    theme: function (args) {
      var t = (args[0] || "").toLowerCase();
      if (t !== "paper" && t !== "crt") return node("usage: theme paper|crt", "warn");
      root.setAttribute("data-theme", t);
      try { localStorage.setItem("terminal-theme", t); } catch (e) {}
      node("theme → " + t + (t === "paper" ? "  (daylight mode)" : "  (phosphor)"), "ok");
    },

    date: function () { node(new Date().toString()); },

    clear: function () { out.innerHTML = ""; },

    sudo: function () {
      node("maximilian is not in the sudoers file. This incident has been reported.", "warn");
      node('<span class="dim">…to the cat. She is not impressed.</span>');
    },

    exit: function () {
      node('There is no exit. Just <a href="../">the way back</a>.');
    }
  };

  function run(raw) {
    echo(raw);
    var words = raw.trim().split(/\s+/);
    var name = words[0].toLowerCase();
    var args = words.slice(1);
    var fn = commands[name];

    if (!fn) {
      node("command not found: " + escapeHtml(name), "warn");
      node('<span class="dim">Type <b>help</b> for what exists.</span>');
      gap();
      return;
    }
    fn(args);
    gap();
    toBottom();
  }

  /* ---------- input ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (busy) return;
    var raw = input.value.trim();
    input.value = "";
    if (!raw) return;
    history.push(raw);
    hIndex = history.length;
    hint.hidden = true;
    run(raw);
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      hIndex = Math.max(0, hIndex - 1);
      input.value = history[hIndex] || "";
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      hIndex = Math.min(history.length, hIndex + 1);
      input.value = history[hIndex] || "";
    } else if (e.key === "Tab") {
      e.preventDefault();
      var v = input.value.toLowerCase();
      var hit = Object.keys(commands).filter(function (c) { return c.indexOf(v) === 0; });
      if (hit.length === 1) input.value = hit[0] + " ";
    } else if (e.key === "l" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      out.innerHTML = "";
    }
  });

  /* click-to-run links inside the output */
  out.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-cmd]");
    if (!a) return;
    e.preventDefault();
    if (busy) return;
    var cmd = a.getAttribute("data-cmd");
    history.push(cmd);
    hIndex = history.length;
    hint.hidden = true;
    run(cmd);
    input.focus();
  });

  document.addEventListener("click", function (e) {
    if (e.target.closest("a")) return;
    input.focus();
  });

  /* ---------- clock ---------- */
  function tick() {
    var d = new Date();
    clockEl.textContent = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }
  tick();
  setInterval(tick, 20000);

  /* ---------- start ---------- */
  try {
    var saved = localStorage.getItem("terminal-theme");
    if (saved === "paper" || saved === "crt") root.setAttribute("data-theme", saved);
  } catch (e) {}

  typeBoot();
})();
