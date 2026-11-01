/* Ledger — filter, sort, keyboard navigation, detail pane.
   No dependencies. The data is the page. */

(function () {
  "use strict";

  var DATA = [
    {
      year: 2026, name: "Vantage", cat: "security", status: "live",
      body: "An authorized network scanner: scope enforcement, NSE grading, TLS checks, a live dashboard and scan diffing. 129 tests, no runtime dependencies beyond jinja2.",
      stack: "Python · nmap · Flask", link: "https://github.com/Noxwer-beep/vantage"
    },
    {
      year: 2026, name: "Homelab", cat: "infrastructure", status: "live",
      body: "Bare-metal hypervisor, managed switching, VLAN segmentation and firewall rules — with the whole build documented as it happened.",
      stack: "Linux · Networking · Firewalls", link: "https://github.com/Noxwer-beep/homelab-infrastructure"
    },
    {
      year: 2026, name: "This portfolio", cat: "web", status: "live",
      body: "Hand-written, no framework, no build step. Eight design studies arguing the same content should behave differently.",
      stack: "HTML · CSS · JavaScript", link: "https://github.com/Noxwer-beep/portfolio"
    },
    {
      year: 2026, name: "Design studies", cat: "web", status: "ongoing",
      body: "Eight concepts: editorial, terminal, kinetic type, spatial canvas, neo-brutalist, technical drawing, atmospheric, and this data-forward one.",
      stack: "HTML · CSS · JavaScript", link: "https://github.com/Noxwer-beep/showcase"
    },
    {
      year: 2025, name: "Hack The Box", cat: "practice", status: "ongoing",
      body: "Machines and challenges across web, network and privilege escalation. Notes kept for every box, including the dead ends.",
      stack: "Enumeration · Priv-esc", link: ""
    },
    {
      year: 2025, name: "Metasploitable 2", cat: "practice", status: "archived",
      body: "Deliberately vulnerable target used for systematic enumeration and exploitation practice. Every service documented.",
      stack: "Exploitation basics · Reporting", link: ""
    },
    {
      year: 2025, name: "Documentation vault", cat: "infrastructure", status: "live",
      body: "Engineering notes: decisions with reasons, deployment runbooks, build logs. If it is not written down it did not happen.",
      stack: "Markdown · Obsidian", link: "https://github.com/Noxwer-beep/homelab-notes"
    },
    {
      year: 2024, name: "Agent experiments", cat: "web", status: "ongoing",
      body: "Tool-calling agents for research and automation, and a running argument with myself about where they are actually worth it.",
      stack: "LLMs · Python · Tooling", link: ""
    }
  ];

  var CATS = { security: "Security", infrastructure: "Infrastructure", web: "Web", practice: "Practice" };
  var STATUS = { live: "live", ongoing: "in progress", archived: "archived" };

  var state = { q: "", cat: "all", sort: "year", dir: -1, sel: 0, rows: [] };

  var tbody = document.getElementById("rows");
  var empty = document.getElementById("empty");
  var q = document.getElementById("q");
  var chips = document.getElementById("chips");
  var count = document.getElementById("count");
  var grid = document.getElementById("grid");
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- filter + sort ---------- */
  function compute() {
    var needle = state.q.trim().toLowerCase();
    var rows = DATA.filter(function (d) {
      if (state.cat !== "all" && d.cat !== state.cat) return false;
      if (!needle) return true;
      return (d.name + " " + d.cat + " " + d.status + " " + d.body + " " + d.stack)
        .toLowerCase().indexOf(needle) !== -1;
    });

    var key = state.sort;
    rows.sort(function (a, b) {
      var va = a[key], vb = b[key];
      if (typeof va === "string") { va = va.toLowerCase(); vb = vb.toLowerCase(); }
      if (va < vb) return -1 * state.dir;
      if (va > vb) return 1 * state.dir;
      return 0;
    });
    state.rows = rows;
    if (state.sel >= rows.length) state.sel = Math.max(0, rows.length - 1);
  }

  /* ---------- render ---------- */
  function render() {
    compute();
    tbody.innerHTML = "";

    state.rows.forEach(function (d, i) {
      var tr = document.createElement("tr");
      if (i === state.sel) tr.className = "sel";
      tr.setAttribute("data-i", String(i));
      tr.innerHTML =
        '<td class="year">' + d.year + "</td>" +
        '<td class="name"></td>' +
        '<td><span class="cat cat-' + d.cat + '">' + CATS[d.cat] + "</span></td>" +
        '<td><span class="status ' + (d.status === "live" ? "live" : "") + '">' +
          STATUS[d.status] + "</span></td>";
      tr.querySelector(".name").textContent = d.name;
      tbody.appendChild(tr);
    });

    empty.hidden = state.rows.length > 0;
    count.textContent = String(state.rows.length);
    document.querySelectorAll("th.sortable").forEach(function (th) {
      th.removeAttribute("aria-sort");
      if (th.dataset.sort === state.sort) {
        th.setAttribute("aria-sort", state.dir === 1 ? "ascending" : "descending");
      }
    });
    renderDetail();
  }

  function renderDetail() {
    var d = state.rows[state.sel];
    var $ = function (id) { return document.getElementById(id); };
    if (!d) {
      $("d-cat").textContent = "No record";
      $("d-name").textContent = "—";
      $("d-year").textContent = "";
      $("d-body").textContent = "Nothing matches that filter.";
      $("d-stack").textContent = "—";
      $("d-status").textContent = "—";
      $("d-link").textContent = "—";
      return;
    }
    $("d-cat").textContent = CATS[d.cat] + " · record";
    $("d-name").textContent = d.name;
    $("d-year").textContent = String(d.year);
    $("d-body").textContent = d.body;
    $("d-stack").textContent = d.stack;
    $("d-status").textContent = STATUS[d.status];
    var link = $("d-link");
    if (d.link) {
      link.innerHTML = "";
      var a = document.createElement("a");
      a.href = d.link;
      a.textContent = "open ↗";
      a.rel = "noopener";
      link.appendChild(a);
    } else {
      link.textContent = "—";
    }
  }

  /* ---------- events ---------- */
  var timer = 0;
  q.addEventListener("input", function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      state.q = q.value;
      state.sel = 0;
      render();
    }, 90);
  });

  chips.addEventListener("click", function (e) {
    var btn = e.target.closest(".chip");
    if (!btn) return;
    chips.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("on"); });
    btn.classList.add("on");
    state.cat = btn.dataset.cat;
    state.sel = 0;
    render();
  });

  grid.addEventListener("click", function (e) {
    var th = e.target.closest("th.sortable");
    if (th) {
      var key = th.dataset.sort;
      state.dir = state.sort === key ? state.dir * -1 : (key === "year" ? -1 : 1);
      state.sort = key;
      render();
      return;
    }
    var tr = e.target.closest("tbody tr");
    if (tr) {
      state.sel = Number(tr.dataset.i);
      render();
    }
  });

  document.addEventListener("keydown", function (e) {
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea") {
      if (e.key === "Escape") { q.value = ""; state.q = ""; state.sel = 0; render(); }
      return;
    }
    if (!state.rows.length) return;
    if (e.key === "ArrowDown" || e.key === "j") {
      e.preventDefault();
      state.sel = Math.min(state.sel + 1, state.rows.length - 1);
      render();
    } else if (e.key === "ArrowUp" || e.key === "k") {
      e.preventDefault();
      state.sel = Math.max(state.sel - 1, 0);
      render();
    } else if (e.key === "Enter") {
      var d = state.rows[state.sel];
      if (d && d.link) window.open(d.link, "_blank", "noopener");
    }
  });

  render();
})();
