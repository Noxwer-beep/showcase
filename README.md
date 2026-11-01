# Eight homepages — design gallery

Same content, eight layouts. I wanted to know how much the layout actually decides, so
I built the same page eight times — each a complete, hand-written static page with no
framework, no build step and no bundler.

**Live:** https://noxwer-beep.github.io/showcase/

Open `index.html`, or run a local server:

    cd ~/showcase
    python3 -m http.server 8790
    # http://localhost:8790

Deployed on the homelab at **http://10.10.10.109:8089** as well (rootless Podman +
hardened nginx, same pattern as the portfolio — see `/home/nox/srv/mj-showcase/README-OPS.md`).

## The eight

| # | Name | Argument | Signature interaction |
|---|------|----------|----------------------|
| 01 | [Paper](01-paper/) | A portfolio can read like a printed page | reading progress, drop cap, ledger rows |
| 02 | [Terminal](02-terminal/) | The site is a shell; the visitor types | command parser, tab completion, theme switch |
| 03 | [Kinetic](03-kinetic/) | Type is the layout, motion is the print | scroll-velocity marquee, horizontal rail |
| 04 | [Spatial](04-spatial/) | Atmosphere instead of ornament | canvas flow field, pointer repulsion, click burst |
| 05 | [Brutal](05-brutal/) | Confidence, no gradients, no apologies | draggable sticker, magnetic buttons, cursor ring |
| 06 | [Blueprint](06-blueprint/) | Show the construction, not just the result | drawing sheet, dimension chains, title block |
| 07 | [Aurora](07-aurora/) | Light is the medium; the type holds still | drifting gradients, frosted glass, scroll parallax |
| 08 | [Ledger](08-ledger/) | The work is data, so let it be queried | filter, sort, keyboard navigation, detail pane |

06–08 are also published as standalone repositories, each with a README that explains
what it argues and what it demonstrates:

- **[blueprint](https://github.com/Noxwer-beep/blueprint)** → https://noxwer-beep.github.io/blueprint/
- **[aurora](https://github.com/Noxwer-beep/aurora)** → https://noxwer-beep.github.io/aurora/
- **[ledger](https://github.com/Noxwer-beep/ledger)** → https://noxwer-beep.github.io/ledger/

## Structure

    showcase/
    ├── index.html            gallery hub with cursor-following previews
    ├── hub.css, hub.js
    ├── thumbs/               real screenshots, captured from the pages themselves
    ├── 01-paper/ … 08-ledger/   one concept each
    ├── css/fonts/            self-hosted woff2, no third-party requests
    └── docs/DESIGN-NOTES.md  the reasoning, the techniques, what to reuse

Each demo folder is `index.html` + `style.css` + `main.js`. Fonts are self-hosted, so
a strict `font-src 'self'` CSP still works.

## Shared rules (deliberate, not accidental)

- **Text is HTML.** No headline is painted into a canvas; every page is readable,
  selectable, and searchable.
- **No build step.** Edit the file, reload. That is the whole toolchain.
- **No third-party requests.** Fonts are served from `css/fonts/`.
- **Reduced motion is a real path**, not a disabled toggle: `prefers-reduced-motion`
  removes the marquee, the field animation, the reveals, and the cursor.
- **Pointer-aware.** The custom cursor and hover previews only exist on fine
  pointers; touch devices get tappable rows and native scrolling instead.
- **One accent per page**, chosen per concept rather than defaulting to a template
  colour.
- **Accessible basics**: skip links where needed, visible focus, 44px+ targets,
  `aria-hidden` on decorative type, keyboard alternative for the draggable sticker.

See `docs/DESIGN-NOTES.md` for per-page notes, the exact techniques and their
trade-offs.

## Why eight

The same content, argued eight ways, is the cheapest way to answer "which layout does
this content want?". The answers disagree, which is the point: the terminal says *the
interface is the personality*, the ledger says *the work is data*, the blueprint says
*show the construction*.
