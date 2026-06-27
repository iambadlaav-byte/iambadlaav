# Design: Port the First Light prototype into the React site

**Date:** 2026-06-25
**Branch:** badlaav-v2-wave1
**Status:** Design — awaiting user review before implementation planning

---

## Context

`theme_option/` holds a standalone HTML/CSS/JS visual prototype (Direction 08 "First Light") for the Badlaav homepage + program page, already rebranded to Badlaav voice (hero: *"Trip नाही — Turning Point." / "You cannot think clearly in a noisy environment."*) and restructured to a 3-day retreat. The goal is to bring its look-and-feel **and** copy into the production React app (`frontend/`), which already ships a complete, conventions-compliant Badlaav site.

This is a **full visual overhaul** of two pages, executed within the app's locked conventions (Tailwind + Warm theme CSS-variable tokens, Framer Motion, React Hook Form/Zod, no hardcoded hex, no inline styles except `clamp()` font-size, copy centralized in `lib/content.js`).

## Goal & scope

**In scope**
- Overhaul the homepage `/` (`pages/public/HomePage.jsx`).
- Overhaul the program page `/retreat` (`pages/public/RetreatPage.jsx`) — the day-by-day page, mirroring `theme_option/program.html`.
- Global theme retune (warm/light tokens only) + display-font swap.
- Ship the 12 prototype PNGs into the app.

**Out of scope (do not touch)**
- `/badlaav-experience` (`BadlaavExperiencePage.jsx`) — a separate, lighter programme with its own `EXPERIENCE` content.
- The Razorpay/registration **logic** in `UpcomingBatches`, `Pricing3Plans`, `RegisterPage` (restyle only, no logic changes).
- Admin panel, legal pages, auth.

## Locked decisions (from brainstorming)

| # | Decision |
|---|---|
| Scope | **Full overhaul** of `/` and `/retreat`. |
| Colors | Retune **warm/light tokens only**; `navy`/`ink` stay **forest-green**. Site-wide via `themes.js` values (names unchanged). |
| Fonts | `font-display` Poppins → **Cormorant Garamond** (global). DM Sans stays body; hero = heavy DM Sans. |
| Images | **Ship the 12 prototype PNGs** into `frontend/public/images/`. |
| Execution | **Faithful clone of the prototype's distinctive sections + reuse live functional sections** (UpcomingBatches/Razorpay, Pricing3Plans, FAQAccordion), restyled. |
| Pricing/FAQ | **Keep both** on the new homepage. |
| Motion | **Tone down** to the app's animation rules. |

## 1. Foundation (global, shared)

### 1a. Theme tokens — `frontend/src/lib/themes.js` (retune values, keep names)

| Token | Now | → New | Role |
|---|---|---|---|
| `cream` | `#FFF0EA` | `#fdfaf6` | page background (off-white) |
| `soft` | `#F8E7E0` | `#faeee5` | peach band background |
| `ochre` | `#A03E1B` | `#8d3e1d` | terracotta — primary brand / buttons |
| `gold` | `#FAD062` | `#f3a747` | amber — highlights / badges / CTA accents |
| `charcoal` | `#373735` | `#2c2c2c` | body text |
| `navy` | `#015243` | **keep** | dark surface (forest-green) |
| `ink` | `#013328` | **keep** | darkest surface (forest-green) |
| `teal` / `sage` / `teal-light` | green | **keep** | links / secondary / check accents |
| `pearl` | `#FFF3EF` | **keep** | text on dark |
| `muted` | `#6E6E6E` | **keep** | secondary text |

**Consequence:** dark surfaces (including the new big footer) render **forest-green with amber/terracotta accents** — a warm-light body anchored by deep green, rather than the prototype's all-brown darks. Verify contrast after swap: `on-gold` (deep-green text on amber `#f3a747`), `on-ochre` (warm-white on `#8d3e1d`), and links on green surfaces. Adjust the paired text tokens if any pair fails WCAG AA.

### 1b. Fonts — `frontend/tailwind.config.js` + font loading

- `fontFamily.display` → `'Cormorant Garamond'` (was Poppins).
- Ensure the font loader (`index.html` `<link>` or equivalent) loads **Cormorant Garamond** (ital + 400–700), **DM Sans** (300–1000, for the heavy hero), **DM Mono**, and the Devanagari fallback (`Mukta`) for "नाही".
- Hero headline uses `font-sans` (DM Sans) at weight ~900–1000 with tight letter-spacing — matches the prototype; not the serif.
- Section/display headings use `font-display` (Cormorant Garamond).

### 1c. Images — `frontend/public/images/`

Move all 12 PNGs from `theme_option/` with a `proto_` prefix to avoid collisions: `proto_hero, proto_dawn, proto_golden, proto_figure, proto_day1..5, proto_venue_aerial, proto_venue_room, proto_venue_dining`. Reference via new `content.js` keys (see §4). These are AI-generated stand-ins; mark slots so real photos can replace them 1:1 later.

## 2. Homepage `/` — section inventory (new order = prototype flow)

`new` = rebuilt prototype clone · `reuse` = existing live section, restyled by the global token/font change.

1. **Hero** *(new — `ProtoHero`)* — dawn image, badge, "Trip नाही — Turning Point.", subtitle; floating **NextRetreatCard** (`reuse`).
2. **Philosophy + noise wheel** *(new — `NoiseWheel`)* — "You already know what's wrong…" + 8-spoke SVG ("eight things the noise takes") + check-list.
3. **Photo collage** *(new — `PhotoCollage`)* — 6-image asymmetric grid.
4. **Interstitial band** *(new — `InterstitialBand`)* — "Trip नाही. This is not a getaway."
5. **What three days look like** *(new — `ThreeDaysInteractive`)* — 3 day items + paired images; data sourced from existing `DAYS`.
6. **Video banner** *(new — `VideoBanner`)* — "See a Badlaav unfold" (static poster + play affordance; no autoplay).
7. **Upcoming batches** — **`reuse` `UpcomingBatches`** (`program="BADLAAV"`) — the prototype's "editions", real + Razorpay.
8. **The Place** *(new — `LocationGrid`)* — venue image grid + copy.
9. **Testimonials** *(`reuse` `Testimonials`, restyled to the prototype 4-card grid)* — data from `TESTIMONIALS`.
10. **Facilitators** *(new — `FacilitatorsGrid`)* — Arjun Dada + 2.
11. **Pricing** — **`reuse` `Pricing3Plans`** (`program="Badlaav"`), restyled.
12. **FAQ** — **`reuse` `FAQAccordion`**, restyled.
13. **Big footer CTA** *(new — `BigFooterCta`)* — forest-green band, "Trip नाही — Turning Point.", Dnyanpith/Ambajogai credit. (This is a homepage closing band; the global site `Footer` in `Layout` is unchanged unless we later choose to align it.)

**Removed as standalone sections:** `StatStrip`, `ValueProp`, `WhoItsFor`, `Highlights` (their content folds into the new sections or is cut). Reversible if any proves load-bearing.

## 3. Program page `/retreat` (mirror `program.html`)

- **Hero** — reuse `ProtoHero` (or `ProgramHero`) with program-page copy ("The Badlaav Retreat Experience").
- **The Three Days** — new `DayBlock` ×3 (alternating image side; amber/green/amber accents), copy from `DAYS`. Replaces/restyles current `RetreatDays variant="deep"`.
- **Inclusions** — `reuse`, restyled.
- **Upcoming batches** — `reuse` `UpcomingBatches`.
- **CtaBand** — `reuse`, restyled, + **big footer** band.
- `/badlaav-experience` untouched.

## 4. New components & content

**New section components** (`frontend/src/components/sections/`, one per file, PascalCase, Tailwind + `cn()`, tokens only, copy from `content.js`):
`ProtoHero`, `NoiseWheel`, `PhotoCollage`, `InterstitialBand`, `ThreeDaysInteractive`, `VideoBanner`, `LocationGrid`, `FacilitatorsGrid`, `BigFooterCta`, `DayBlock`.

**`content.js` additions** (single source of truth — no copy hardcoded in JSX):
- `HERO` (badge, title lines incl. Devanagari, subtitle, next-batch card text)
- `NOISE_WHEEL` (heading, 8 spoke labels, center label, check-list items)
- `COLLAGE` (image refs + alts)
- `INTERSTITIAL` (line, CTA)
- Extend `DAYS`: add per-day title/subtitle, two paragraphs, two list items, image ref, and accent-color key (consumed by both `ThreeDaysInteractive` and `DayBlock`)
- `LOCATION` (heading, copy, venue images)
- `FACILITATORS` (name, role, image — Arjun Dada + 2)
- `TESTIMONIALS` (reuse/extend; quote, name, city)
- `BIG_FOOTER` (headline, brand line, credit)

## 5. Motion plan (toned down — per CLAUDE.md animation rules)

- **Keep:** `FadeIn` scroll reveals (transform/opacity only); existing ambient `FallingLeaves` + `BreathingPulse` in the hero (max 1 ambient + 1 reveal per viewport); all gated by `useReducedMotion`/`AmbientMotionBoundary`.
- **Drop:** custom cursor, magnetic buttons, 20 fireflies, mouse-tilt wheel, scroll parallax stack — these violate the calm aesthetic / motion budget. The noise wheel renders static (optional one-time reveal). No animation on the reused form-bearing sections.

## 6. Conventions compliance

- No hardcoded hex in components — only theme tokens / Tailwind classes.
- No inline styles except fluid `clamp()` font-size (existing pattern).
- Constants → `lib/constants.js`; copy → `lib/content.js`.
- Functional components + hooks; one component per file; `cn()` for conditional classes.
- Animate only `transform`/`opacity`; respect `prefers-reduced-motion`; no animation on form/admin.
- Shared validators untouched.

## 7. Risks / open items

- **Contrast after retune:** amber `gold` (`#f3a747`) is less bright than `#FAD062`; recheck `on-gold` and badge legibility.
- **Green darks + warm body:** confirm the forest-green footer reads well against the amber/terracotta system once rendered (visual check at the end).
- **SEO/Helmet:** preserve existing `getSeoForRoute` usage on both pages.
- **`HomePage.jsx` growth:** keep it a thin composition file; all weight lives in section components.

## 8. Acceptance criteria

- `/` and `/retreat` visually match the prototype (layout, copy, palette-as-retuned, Cormorant headings, heavy DM Sans hero) at desktop + mobile.
- Live batches/pricing/registration still function (Razorpay flow unbroken).
- No hardcoded hex / no console.log / lint passes / build succeeds (`npm run build` → root `dist/`).
- Reduced-motion users get a static, calm experience; motion budget respected.
- `/badlaav-experience`, admin, legal unaffected beyond the intended global token/font shift.
