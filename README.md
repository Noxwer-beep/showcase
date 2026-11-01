# Five homepages — design gallery

Five different answers to the same brief: a homepage for Maximilian Jatzkowski —
IT student, homelab, security, web. Each is a complete, hand-written static page.
No framework, no build step, no bundler.

Open `index.html`, or run a local server:

    cd ~/showcase
    python3 -m http.server 8790
    # http://localhost:8790

Deployed on the homelab at **http://10.10.10.109:8089** (rootless Podman + hardened
nginx, same pattern as the portfolio — see `/home/nox/srv/mj-showcase/README-OPS.md`).

## Structure

    showcase/
    ├── index.html            gallery hub with cursor-following previews
    ├── hub.css, hub.js
    ├── thumbs/               real screenshots, captured from the pages themselves
    ├── 01-paper/             editorial print layout
    ├── 02-terminal/          interactive shell
    ├── 03-kinetic/           Swiss poster + scroll velocity
    ├── 04-spatial/           generative flow field
    ├── 05-brutal/            neo-brutalist, draggable sticker
    └── docs/DESIGN-NOTES.md  the reasoning, the techniques, what to reuse

Each demo folder is `index.html` + `style.css` + `main.js`, 14–17 KB each,
~3,200 lines across the whole project. Fonts are self-hosted in `css/fonts/`
(62 woff2 subsets, latin + latin-ext only) — no third-party requests at all.

## The five concepts

| # | Name | Argument | Signature interaction |
|---|------|----------|----------------------|
| 01 | Paper | A portfolio can read like a printed page | reading progress, drop cap, ledger rows |
| 02 | Terminal | The site is a shell; the visitor types | command parser, tab completion, theme switch |
| 03 | Kinetic | Type is the layout, motion is the print | scroll-velocity marquee, horizontal rail |
| 04 | Spatial | Atmosphere instead of ornament | canvas flow field, pointer repulsion, click burst |
| 05 | Brutal | Confidence, no gradients, no apologies | draggable sticker, magnetic buttons, cursor ring |

## Shared rules (deliberate, not accidental)

- **Text is HTML.** No headline is painted into a canvas; every page is readable,
  selectable, and searchable.
- **No build step.** Edit the file, reload. That is the whole toolchain.
- **No third-party requests.** Fonts are served from `css/fonts/`, so the CSP can be
  `default-src 'none'` with `font-src 'self'`.
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
