# Design notes — five homepage concepts

Working notes for the gallery. What each page argues, how it is built, what is
worth stealing, and where each one would fail.

---

## 01 — Paper

**Argument.** A developer's site can behave like a printed object: rules, small
caps, an index, a colophon. It signals care and reading rather than novelty.

**Type.** Fraunces (variable serif, 300 weight at display size) against Inter
Tight for body. The optical-size axis is why the headline looks drawn rather than
scaled — small details get thicker, large ones get finer.

**Palette.** Warm paper `#f3efe6`, ink `#17150f`, one oxblood accent `#b23a22`.

**Layout.** Three-column hero (contents / standfirst / colophon) on a 12-column
feel, then a full-bleed marquee band, then a ledger of work in a
`3rem / 1fr / 1.7fr / 6rem` grid. The work rows fill with accent on hover — the
only loud moment on the page.

**Techniques.**
- Reading progress: `scrollY / (scrollHeight - innerHeight)` into a 2px bar.
- Staggered reveals via IntersectionObserver, `transitionDelay` capped at 4 steps
  so rows never feel slow.
- A rotating circular stamp: SVG `<textPath>` on a circle path, CSS rotation.
  Cheap, and it reads as print rather than as motion design.
- Drop cap with `::first-letter` and a float.

**Steal.** The ledger row hover: `::after` scaled on Y inside a `z-index: -1` layer,
so text colour can flip without touching each child.

**Would fail if.** The copy were generic — this design has no images to hide behind.

---

## 02 — Terminal

**Argument.** For a homelab/security person, a shell is the most honest interface.
It also filters: people who type `help` get a tour, everyone else gets a prompt.

**Type.** JetBrains Mono at 14px (13px on phones), 1.65 line-height. Nothing else.

**Palette.** Phosphor green `#8be28f` on `#060806`, lime prompt `#c9f24d`. A second
"paper" theme (`theme paper`) proves the interface is themable, not a costume.

**Build.** A tiny interpreter: `commands` map, `history` array with ↑/↓, Tab
completion against the command names, Ctrl+L to clear. Output is appended as DOM
nodes; user input is escaped before it is echoed.

**Details that matter.**
- Boot sequence types at 9–17ms per character, then hands over the prompt. It is
  the page's only entrance animation, and it explains the interface.
- `neofetch` block with an ASCII cat: the empty terminal space needed *something*
  and a wall of text would have been worse.
- Scanlines are `repeating-linear-gradient` + a vignette at 50% opacity,
  `pointer-events: none`. No flicker — flicker is a headache, not an aesthetic.
- `noscript` fallback lists the contact links, because a terminal page without JS
  is otherwise a black rectangle.

**Steal.** Click-to-run links in the output (`data-cmd`) so mouse users get the same
tour as typists, and the escape function for anything echoed back.

**Would fail if.** The visitor is on a phone with a keyboard covering half the
screen — mitigated by a 100dvh frame and a compact bar, but it is still the least
mobile-friendly concept here.

---

## 03 — Kinetic

**Argument.** For a design-interested developer, the type *is* the portfolio.
Oversized, tightly tracked, and set in motion by the reader's own scrolling.

**Type.** Archivo Black for everything display; DM Mono for labels. Outline word
via `-webkit-text-stroke: 2px` with transparent fill.

**Palette.** Paper `#f6f4ee`, ink `#0d0d0c`, hot accent `#ff3b1f`. Three colours,
no tints.

**Composition.** Four stacked words at 14.6vw with 0.76 line-height, every line a
different treatment (solid / outline / accent / solid). Then a marquee, then a
320vh scroll-driven horizontal rail, then a word-by-word statement.

**Techniques.**
- **Scroll velocity marquee:** `velocity += (scrollY - lastY) * 0.28` each frame,
  decayed by `*0.9`, added to a base speed. Scrolling down speeds it up; scrolling
  up reverses it. This is the page's best trick and about 15 lines of code.
- **Horizontal rail:** a `height: 320vh` wrapper with a `position: sticky` child;
  progress = `-rect.top / (height - viewport)`, applied as `translate3d` and the
  counter updates from the same value.
- **Per-letter hover:** split into `.ch` spans; each gets a random ±0.09em /
  ±7deg offset with a 12ms stagger, cleared on leave.
- **Statement reveal:** words wrapped in `.w > span`, inner span translated 110%
  and released by a class — a mask reveal without clipping bugs.

**Steal.** The velocity marquee and the sticky-rail maths; both are reusable in any
theme.

**Would fail if.** Used for long-form reading (it is a poster, not a document) or
if the rail had more than ~6 cards.

---

## 04 — Spatial

**Argument.** A page can be a place. Movement in the background, stillness in the
type, and a pointer that actually does something.

**Type.** Syne (800 for the headline, italic 400 for "that") + IBM Plex Mono.
The headline uses `mix-blend-mode: difference` so it inverts over bright particles.

**Palette.** `#05060a` ground, bone `#ece9e0` strokes at 26% alpha, coral `#ff6a4d`
on 7% of particles.

**Techniques.**
- **Flow field:** two crossed sines approximate noise —
  `sin(x·0.0021 + t) + cos(y·0.0026 − t)` — plus a per-particle phase offset. The
  phase is what stops every particle collapsing into the same horizontal band.
- **Trails:** instead of clearing, fill the canvas with `rgba(5,6,10,0.13)` each
  frame. Old strokes fade over ~0.5s.
- **Batching:** strokes accumulate into two `Path2D` objects (bone, coral) and are
  stroked twice per frame, not once per particle.
- **Pointer:** repulsion inside 150px, force `(1 − d/r)·1.1`. Click spawns 24
  particles outward from the cursor.
- **DPR cap at 2**, particle count scaled by area (220–700), paused on
  `visibilitychange`.

**One bug worth remembering.** Wrapping a particle from one edge to the other drew
a stroke straight across the canvas — hundreds of full-width lines. Guard with
`if (|x − px| > 24 || |y − py| > 24) continue`.

**Would fail if.** Text were placed directly over the busiest part of the field
without the blend mode or a scrim.

---

## 05 — Brutal

**Argument.** Confidence. Thick borders, hard shadows, acid colour, and physical
objects you can pick up. The opposite of a gradient hero.

**Type.** Bricolage Grotesque 800 (uppercase, −0.055em) + Space Mono for labels.

**Palette.** Acid `#e8ff00`, ink `#0b0b0b`, paper `#f2efe4`.

**Techniques.**
- **Draggable sticker:** pointer capture, `translate(tx,ty) rotate(-9deg)`,
  `touch-action: none`. Arrow keys move it 12px (Shift: 40px) so it is not a
  mouse-only easter egg.
- **Magnetic buttons:** pointer offset from centre sets `--tx/--ty`; the CSS
  transform reads those variables in both rest and hover states, so magnetism and
  the lift do not fight each other.
- **Cursor:** a white dot with `mix-blend-mode: difference` (inverts on any
  surface) plus a lagging ring (lerp 0.18) that grows over links.
- **Shadows:** `box-shadow: 5px 5px 0` in the ink colour — no blur anywhere.

**Steal.** The `--tx/--ty` trick for combining hover motion with pointer-following
motion; without variables the two transforms overwrite each other.

**Would fail if.** The palette were diluted — acid yellow stops working the moment
a second bright colour enters.

---

## Hub

The gallery index is one list, not a grid: five rows, each owning a thumbnail via
`data-img`. On a fine pointer a 360px preview follows the cursor with a lerp; on
touch the same thumbnails render inside the rows via `::after` and CSS
`background-image`, so nothing depends on JS to be visible.

That is the pattern worth keeping: **one list of links, progressive enhancement for
the preview.** No JS, no preview, still a usable page.

---

## Measurements

| Page | HTML + CSS + JS | Notes |
|---|---|---|
| 01 Paper | 15.6 KB | no canvas, no images |
| 02 Terminal | 16.7 KB | ~300 lines of JS |
| 03 Kinetic | 17.3 KB | rAF marquee + rail |
| 04 Spatial | 14.2 KB | canvas, 220–700 particles |
| 05 Brutal | 15.2 KB | pointer drag |

All five load one self-hosted stylesheet (`/css/fonts.css`) plus only the woff2
subsets their visible text needs, thanks to `unicode-range`. Nothing is requested
from any third-party origin.
