# Hero Geometry + Nav Restructure — Design

**Date:** 2026-06-27
**Branch:** `badlaav-v2-wave1`
**Status:** Approved design → ready for implementation plan

## Goal

Two independent changes to the Badlaav marketing site:

1. **Nav restructure** — pull Stories, Gallery, and Volunteer out of the
   "Explore" dropdown and promote them to top-level navigation tabs (the
   "Explore" dropdown disappears).
2. **Animated hero geometry** — add a distinct, continuously-animated line-art
   geometric figure to the right side of every hero section. Nine pages, nine
   different figures.

These are decorative/structural only — no routing, content, or backend changes.

## Context (current state)

- `frontend/src/components/layout/Header.jsx` owns a single `NAV_LINKS` array
  consumed by **both** the desktop bar and `MobileNav`. Stories/Gallery/Volunteer
  currently live in an `EXPLORE_LINKS` dropdown.
- `frontend/src/components/sections/ProgramHero.jsx` is the shared hero used by
  8 pages (About, Badlaav Experience, Contact, Gallery, Pricing, Retreat,
  Stories, Volunteer). It **already** has an `aside` prop rendered in the right
  grid column (`lg:grid-cols-[1.5fr_minmax(0,1fr)]`). **No page currently passes
  `aside`**, so the right column is empty today.
- The Home page uses `frontend/src/components/sections/ProtoHero.jsx` — a
  full-bleed dawn image with the live `NextRetreatCard` floating bottom-right.
  It has **no** `aside` slot.
- `frontend/src/components/animations/GeometricViz.jsx` already exists: an
  animated line-art SVG (concentric rings, arcs, orbiting nodes, pulsing core,
  gold/teal strokes) built for the legacy `/badlaav` hero. It is the visual
  template for this work.
- `AmbientMotionBoundary` (wraps the whole Layout) sets `ambientDisabled: true`
  on `/contact` and `/register`. Ambient components read it via
  `useAmbientMotion()`.
- `ProgramHero`'s `showAmbient` prop is **false on every page** today, so
  `FallingLeaves`/`BreathingPulse` are not active on any hero. The geometric
  figure will therefore be the sole ambient animation per hero — no stacking to
  resolve.

## Part 1 — Nav restructure

Single-source edit in `Header.jsx`:

- Delete the `EXPLORE_LINKS` array and its `{ label: 'Explore', dropdown: … }`
  entry in `NAV_LINKS`.
- Add `Stories`, `Gallery`, `Volunteer` as flat `{ label, href }` entries.
- Final desktop order:
  `Programmes ▾ · Pricing · About · Stories · Gallery · Volunteer · Contact`
  (7 items; keep existing `gap-6` and text size — confirmed acceptable).

Because `MobileNav` maps the same `NAV_LINKS` array, the three items
automatically become flat links in the mobile drawer (the grouped "Explore"
section disappears). **No edit to `MobileNav.jsx` or `NavDropdown.jsx`.**
`NavDropdown` stays in use for Programmes. No routing changes — `/stories`,
`/gallery`, `/volunteer` already exist.

## Part 2 — Hero geometry

### New files

**`frontend/src/components/animations/HeroGeometry.jsx`** — the single exported
React component.

- Props: `variant` (string key), optional `className`.
- Owns the motion gate once: `still = useReducedMotion() || useAmbientMotion()`.
  When `still`, renders the figure's **static skeleton** (no animation loops) —
  this is what makes `/contact` and `/register` render a still figure
  automatically, satisfying the "no animation on form pages" rule.
- Renders a square, responsive SVG container. Decorative: `aria-hidden="true"`,
  `pointer-events-none`, and **`hidden lg:block`** (desktop-only — avoids mobile
  stacking and keeps the per-viewport animation budget clean on small screens).
- Selects the figure subtree by `variant` from `heroFigures.jsx`.

**`frontend/src/components/animations/heroFigures.jsx`** — shared SVG geometry
math helpers (`circlePath`, `arcPath`, polygon points, etc., adapted from
`GeometricViz`) plus one builder function per variant. Builders return the SVG
`<g>` subtree and accept `{ still }` so each can render its static fallback.
These are plain helper builders (not React components), matching the internal-
helper pattern `GeometricViz` already uses — so the "one component per file"
rule is preserved (`HeroGeometry` is the only component).

Also export a `HERO_FIGURE` map of variant-key constants so pages reference
named keys, not magic strings (per the no-magic-values convention).

### Wiring

- **8 ProgramHero pages** — pass `aside={<HeroGeometry variant={HERO_FIGURE.X} />}`.
  No change to `ProgramHero` itself: passing `aside` flips its grid to two
  columns on `lg` and right-aligns the figure (`lg:justify-self-end`). On mobile
  the grid is single-column and the figure is `hidden`, so it takes no space.
- **Home (`ProtoHero`)** — add the figure as an absolutely-positioned element in
  the **upper-right** (`pointer-events-none`, z above the image but below the
  z-10 copy, `hidden lg:block`), so it never overlaps the bottom-right
  `NextRetreatCard`.

### Animation contract (all figures)

- Animate **only** `transform` / `opacity` (SVG `pathLength` for one-time
  draw-in is allowed, as in `GeometricViz`). No layout/color animation.
- "Live" = a continuous ambient loop (slow spin / float / pulse) in addition to
  the on-load draw-in.
- Counts as the **single ambient** animation for the hero viewport; the hero's
  existing `RevealText`/`SlideUp` are the one reveal animation. Within budget.
- Respect `prefers-reduced-motion` and the route ambient gate → static skeleton.
- Palette: thin `gold` + `teal` strokes (CSS variables, never hardcoded hex),
  reading over the dark forest-green scrim. Reuse `GeometricViz`'s stroke
  weights/opacities for visual consistency.

### The nine figures (each visually distinct)

| Variant key | Page | Composition | Continuous motion |
|---|---|---|---|
| `home` | Home | concentric rings + orbiting nodes ("stillness / center") | slow counter-spin + floating dots |
| `retreat` | Retreat | nested rising sunrise arcs (First Light dawn) | arcs breathe; draw-in on load |
| `experience` | Badlaav Experience | radiating spokes from a pulsing core | core pulse + spoke shimmer |
| `about` | About | square-in-circle mandala | slow rotation |
| `pricing` | Pricing | stacked breathing bars | bars rise/settle + opacity pulse |
| `stories` | Stories | overlapping drifting circles (connection) | gentle orbital drift |
| `gallery` | Gallery | dot/square grid with a traveling highlight | highlight sweeps cell to cell |
| `volunteer` | Volunteer | interlocking triangles | counter-rotating pair |
| `contact` | Contact | single pulse ring + crosshair | **static** (form route → ambient gate) |

## Files touched

**New:**
- `frontend/src/components/animations/HeroGeometry.jsx`
- `frontend/src/components/animations/heroFigures.jsx`

**Modified:**
- `frontend/src/components/layout/Header.jsx` (nav array)
- `frontend/src/components/sections/ProtoHero.jsx` (Home figure, top-right)
- `frontend/src/pages/public/AboutPage.jsx`
- `frontend/src/pages/public/BadlaavExperiencePage.jsx`
- `frontend/src/pages/public/ContactPage.jsx`
- `frontend/src/pages/public/GalleryPage.jsx`
- `frontend/src/pages/public/PricingPage.jsx`
- `frontend/src/pages/public/RetreatPage.jsx`
- `frontend/src/pages/public/StoriesPage.jsx`
- `frontend/src/pages/public/VolunteerPage.jsx`

(No `MobileNav.jsx`, `NavDropdown.jsx`, or `ProgramHero.jsx` changes.)

## Out of scope

- No new routes, content, or copy changes.
- No backend changes.
- No theme/token changes (figures use existing `gold`/`teal` variables).
- No refactor of `GeometricViz` (kept as-is for the legacy hero); new figures
  are independent, though they reuse its math/stroke conventions.

## Acceptance criteria

1. Desktop nav shows Programmes ▾, Pricing, About, Stories, Gallery, Volunteer,
   Contact — no "Explore" dropdown. Mobile drawer shows the same three as flat
   links.
2. Each of the nine heroes shows a **different** geometric figure on its right
   (upper-right on Home).
3. Figures animate continuously on capable devices; render static under
   `prefers-reduced-motion`; render static on `/contact`.
4. Figures are desktop-only (`hidden lg:block`), `aria-hidden`, and do not shift
   or overlap hero copy or the Home `NextRetreatCard`.
5. `npm run build` (frontend) succeeds; no `console.log`; no hardcoded hex; only
   `transform`/`opacity`/`pathLength` animated.
