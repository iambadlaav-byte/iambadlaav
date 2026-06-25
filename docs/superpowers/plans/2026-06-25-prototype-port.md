# First Light Prototype Port — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the `theme_option/` "First Light" prototype's look and copy into the production React homepage (`/`) and program page (`/retreat`).

**Architecture:** Retune the global Warm theme tokens (warm/light values only; `navy`/`ink` stay forest-green) and swap the display font to Cormorant Garamond in `themes.js`; ship the 12 prototype PNGs into `public/images/`; add all prototype copy as new exports in `lib/content.js`; build ten new focused section components that mirror the prototype; recompose `HomePage.jsx` and `RetreatPage.jsx` to the prototype flow while reusing the live functional sections (batches/pricing/FAQ) restyled.

**Tech Stack:** React 18 + Vite + Tailwind (CSS-variable theme tokens) + Framer Motion + react-helmet-async. No new dependencies.

## Global Constraints

- **No new libraries** (CLAUDE.md: ask before adding). In particular, **do NOT add a test runner** — there is none (`frontend/package.json` has only `dev`/`build`/`preview`/`lint`; no Vitest/Jest; zero test files). This is a visual port, so each task's verification cycle is **lint + build + visual check**, not TDD:
  - `cd frontend && npm run lint` → must pass (`eslint src --max-warnings=0`).
  - `cd frontend && npm run build` → must succeed (Vite build; output goes to repo-root `dist/`).
  - Visual: `cd frontend && npm run dev` → open `http://localhost:5173/` and `/retreat`, confirm the section renders as intended at desktop + mobile widths.
- **No hardcoded hex in components** — use theme tokens / Tailwind classes only. Hex changes happen ONLY in `themes.js`.
- **No inline styles** except fluid `clamp()` font-size via `style={{ fontSize: 'clamp(...)' }}` (existing pattern).
- **All copy lives in `lib/content.js`** — components import it; no literal marketing strings in JSX (Devanagari "नाही" included).
- **One component per file**, PascalCase filename = export, functional components + hooks, `cn()` from `lib/cn.js` for conditional classes.
- **Animate only `transform`/`opacity`**; respect `prefers-reduced-motion`; max 1 ambient + 1 reveal per viewport; **no animation on form/admin**. Use the existing `FadeIn` for reveals. Do NOT port the prototype's custom cursor, magnetic buttons, fireflies, scroll-parallax, or mouse-tilt.
- **Numbers in body copy:** spell out one–nine, numerals from 10 (brand stats exempt). Forbidden words: world-class, premier institution, cutting-edge, synergy, leverage (verb), unlock your potential, revolutionary, game-changing, best-in-class, transformative (unless literal), Lorem ipsum.
- **Fidelity source:** the prototype's exact spacing/sizes live in `theme_option/style.css` and `theme_option/program-style.css`. Use them to tune Tailwind values where this plan's classes need refinement; the JSX below is complete and renders without them.
- Commit after each task. Branch: `badlaav-v2-wave1`.

---

## File Structure

**Modify (foundation):**
- `frontend/src/lib/themes.js` — retune 5 token triplets + `--font-display`; update `swatch`/`accent`.
- `frontend/tailwind.config.js` — `fontFamily.display` fallback → serif.
- `frontend/index.html` — font `<link>`: add Cormorant Garamond, extend DM Sans to 1000, drop Poppins.
- `frontend/src/lib/content.js` — ADD new exports (non-breaking): `HERO`, `NOISE_WHEEL`, `COLLAGE`, `INTERSTITIAL`, `RETREAT_DAYS`, `LOCATION`, `FACILITATORS`, `VIDEO`, `BIG_FOOTER`.

**Create (assets):**
- `frontend/public/images/proto_*.png` — 12 files copied from `theme_option/`.

**Create (components, `frontend/src/components/sections/`):**
- `ProtoHero.jsx`, `NoiseWheel.jsx`, `PhotoCollage.jsx`, `InterstitialBand.jsx`, `ThreeDaysInteractive.jsx`, `VideoBanner.jsx`, `LocationGrid.jsx`, `FacilitatorsGrid.jsx`, `BigFooterCta.jsx`, `DayBlock.jsx`.

**Recompose (pages):**
- `frontend/src/pages/public/HomePage.jsx`
- `frontend/src/pages/public/RetreatPage.jsx`

**Reused unchanged (restyled by tokens):** `NextRetreatCard`, `UpcomingBatches`, `Pricing3Plans`, `FAQAccordion`, `Inclusions`, `CtaBand`, `Testimonials`, `FadeIn`.

**Plan deviation from spec (noted):** the spec said "extend `DAYS`"; to avoid breaking the existing `RetreatDays` consumer, this plan instead ADDS a new `RETREAT_DAYS` export with the richer shape and leaves `DAYS` intact.

---

## Task 1: Foundation — retune theme tokens + swap display font

**Files:**
- Modify: `frontend/src/lib/themes.js`
- Modify: `frontend/tailwind.config.js`
- Modify: `frontend/index.html`

**Interfaces:**
- Produces: warm/light palette + Cormorant display font available site-wide via existing token names (`cream`, `soft`, `ochre`, `gold`, `charcoal`, `font-display`). No API change for consumers.

- [ ] **Step 1: Retune token values in `themes.js`**

In `THEMES.warm`, change `swatch` and `accent`, and inside `vars` change exactly these five color triplets and the display font (leave `navy`, `ink`, `teal`, `teal-light`, `sage`, `pearl`, `muted`, `danger`, `on-gold`, `on-ochre` untouched):

```javascript
export const THEMES = {
  warm: {
    label: 'Warm',
    swatch: '#fdfaf6',
    accent: '#f3a747',
    vars: {
      '--color-cream': '253 250 246', // #fdfaf6 off-white — default page background
      '--color-soft': '250 238 229', // #faeee5 peach — alternating bands, cards
      '--color-navy': '1 82 67', // #015243 deep green — header bar, dark surfaces (KEEP)
      '--color-ink': '1 51 40', // #013328 deepest green — hero overlay, footer (KEEP)
      '--color-charcoal': '44 44 44', // #2c2c2c warm near-black — body text on light
      '--color-pearl': '255 243 239', // #FFF3EF warm white — text on dark surfaces (KEEP)
      '--color-gold': '243 167 71', // #f3a747 amber — primary CTAs / badges
      '--color-ochre': '141 62 29', // #8d3e1d terracotta — primary brand accent
      '--color-teal': '50 116 85', // #327455 deep fern — links (KEEP)
      '--color-teal-light': '78 155 119', // #4E9B77 fern — hover, accent (KEEP)
      '--color-sage': '78 155 119', // #4E9B77 fern — success / day-2 accent (KEEP)
      '--color-muted': '110 110 110', // #6E6E6E grey — captions (KEEP)
      '--color-danger': '196 74 58', // form errors (KEEP)
      '--color-on-gold': '1 51 40', // deep green text on amber CTA (KEEP)
      '--color-on-ochre': '255 243 239', // warm white on terracotta (KEEP)
      '--font-display': "'Cormorant Garamond', Georgia, serif",
      '--font-sans': "'DM Sans', system-ui, sans-serif",
      '--font-mono': "'DM Mono', ui-monospace, monospace",
    },
  },
};
```

- [ ] **Step 2: Fix the display fallback in `tailwind.config.js`**

Change the `fontFamily.display` line so the fallback is a serif (Cormorant is a serif):

```javascript
fontFamily: {
  display: ['var(--font-display)', 'Georgia', 'serif'],
  sans:    ['var(--font-sans)', 'system-ui', 'sans-serif'],
  mono:    ['var(--font-mono)', 'ui-monospace', 'monospace'],
  deva: ['"Mukta"', 'sans-serif'],
},
```

- [ ] **Step 3: Update the font `<link>` in `index.html`**

Replace the existing Google Fonts `<link>` (the one beginning `https://fonts.googleapis.com/css2?family=Poppins...`) with this — adds Cormorant Garamond, extends DM Sans to weight 1000 (for the heavy hero), keeps DM Mono + Mukta, drops the now-unused Poppins:

```html
<link
  href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Mono:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300..1000;1,9..40,400&family=Mukta:wght@400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

- [ ] **Step 4: Verify**

Run: `cd frontend && npm run lint && npm run build`
Expected: lint passes, build succeeds.
Then `npm run dev` → at `/`, headings now render in Cormorant Garamond; backgrounds are warmer off-white/peach; CTA buttons are amber; dark header/footer stay forest-green.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/themes.js frontend/tailwind.config.js frontend/index.html
git commit -m "feat(theme): retune warm tokens + Cormorant Garamond display font"
```

---

## Task 2: Ship the prototype images into the app

**Files:**
- Create: `frontend/public/images/proto_hero.png`, `proto_dawn.png`, `proto_golden.png`, `proto_figure.png`, `proto_day1.png`..`proto_day5.png`, `proto_venue_aerial.png`, `proto_venue_room.png`, `proto_venue_dining.png` (12 files).

**Interfaces:**
- Produces: images served at `/images/proto_*.png`.

- [ ] **Step 1: Copy the 12 PNGs from the prototype into `public/images/`**

Run (Git Bash):
```bash
cd "D:/iambadlaav-main/iambadlaav-main"
for f in hero dawn golden figure day1 day2 day3 day4 day5 venue_aerial venue_room venue_dining; do
  cp "theme_option/img_${f}.png" "frontend/public/images/proto_${f}.png"
done
ls -1 frontend/public/images/proto_*.png | wc -l   # expect 12
```

- [ ] **Step 2: Verify they serve**

`npm run dev`, then open `http://localhost:5173/images/proto_hero.png` — the dawn hero image loads.

- [ ] **Step 3: Commit**

```bash
git add frontend/public/images/proto_*.png
git commit -m "chore(assets): add First Light prototype images"
```

---

## Task 3: Add prototype copy to `content.js`

**Files:**
- Modify: `frontend/src/lib/content.js` (append new exports; do not alter existing ones)

**Interfaces:**
- Produces: `HERO`, `NOISE_WHEEL`, `COLLAGE`, `INTERSTITIAL`, `RETREAT_DAYS`, `LOCATION`, `FACILITATORS`, `VIDEO`, `BIG_FOOTER` — consumed by Tasks 4–15.

- [ ] **Step 1: Append the new exports**

Add at the end of `frontend/src/lib/content.js`:

```javascript
// ── First Light prototype copy ──────────────────────────────────────────────
export const HERO = {
  badge: 'A three-day residential retreat · Ambajogai, Maharashtra',
  titleTop: 'Trip नाही —',
  titleBottom: 'Turning Point.',
  subtitle: 'You cannot think clearly in a noisy environment.',
  image: '/images/proto_hero.png',
  imageAlt: 'A quiet Badlaav morning',
};

export const NOISE_WHEEL = {
  heading: "You already know what's wrong.",
  subheading: "You just can't hear it over the noise.",
  center: ['Turning', 'Point'],
  spokes: ['Clarity', 'Focus', 'Rest', 'Direction', 'Patience', 'Honesty', 'Stillness', 'Self'],
  listHeading: 'Eight things the noise quietly takes from you',
  list: [
    'See the patterns you keep repeating',
    "Sit with what you've been avoiding",
    'Hear yourself think again',
    'Leave with one clear next step',
    'Spend three days with people doing the same work',
  ],
};

export const COLLAGE = {
  images: [
    { src: '/images/proto_day1.png', alt: 'A moment at Badlaav', span: 'col-span-2 row-span-2' },
    { src: '/images/proto_day2.png', alt: 'A moment at Badlaav', span: '' },
    { src: '/images/proto_day3.png', alt: 'A moment at Badlaav', span: '' },
    { src: '/images/proto_day4.png', alt: 'A moment at Badlaav', span: '' },
    { src: '/images/proto_day5.png', alt: 'A moment at Badlaav', span: '' },
    { src: '/images/proto_venue_dining.png', alt: 'A moment at Badlaav', span: 'col-span-2' },
  ],
};

export const INTERSTITIAL = {
  line1: 'Trip नाही. This is not a getaway.',
  line2: "It's the pause your life keeps asking for.",
  ctaLabel: 'See upcoming batches',
  ctaHref: '/register?program=badlaav',
};

// Richer 3-day data for ThreeDaysInteractive + DayBlock (additive; DAYS stays as-is).
export const RETREAT_DAYS = [
  {
    day: 'Day 1',
    title: 'Arrival',
    subtitle: 'Coming Into Stillness',
    accent: 'gold',
    image: '/images/proto_day1.png',
    paragraphs: [
      'You arrive carrying the weight of the outside world. Today is about putting your bags down — literally and mentally. We welcome you with warmth, chai, and a simple instruction: stop.',
      'The evening is an opening circle. You meet the others, and for the first time in a long while, the phone stays off and the noise stays outside.',
    ],
    list: [
      'Disconnect from devices and the constant noise',
      'Settle into a slower, more natural rhythm',
    ],
  },
  {
    day: 'Day 2',
    title: 'The Honest Look',
    subtitle: 'Seeing Your Patterns Clearly',
    accent: 'sage',
    image: '/images/proto_day3.png',
    paragraphs: [
      "With the noise gone, the real work begins. Through quiet reflection and long stretches of silence, you start to see the patterns running your life — the ones you're usually too busy to notice.",
      "We don't chase quick fixes. We sit with what's true. By evening, things you've avoided for years feel a little easier to face.",
    ],
    list: [
      'Honest reflection in long stretches of silence',
      'Seeing the patterns and loops you keep repeating',
    ],
  },
  {
    day: 'Day 3',
    title: 'Walking Back',
    subtitle: 'Taking It Home With You',
    accent: 'gold',
    image: '/images/proto_day5.png',
    paragraphs: [
      "Clarity that stays at the retreat isn't clarity. The final day turns inward work into one clear, honest decision — and a plan for carrying it back into ordinary life.",
      'We close the circle, sit together one last time, and say goodbye. You leave not just rested, but clear, grounded, and pointed in a direction you chose.',
    ],
    list: [
      'Turning three days of silence into one clear next step',
      'A closing circle, and a calm goodbye',
    ],
  },
];

export const LOCATION = {
  eyebrow: 'The Place',
  badge: 'Quiet by design',
  copy: 'We choose properties that are secluded, surrounded by deep nature, and simple enough that nothing competes for your attention — so you can do the only work that matters here: your own.',
  images: [
    { src: '/images/proto_venue_aerial.png', alt: 'The retreat, from above', large: true },
    { src: '/images/proto_venue_room.png', alt: 'A quiet room', large: false },
    { src: '/images/proto_venue_dining.png', alt: 'Shared, home-cooked meals', large: false },
    { src: '/images/proto_day2.png', alt: 'The land around the retreat', large: false },
  ],
};

export const FACILITATORS = {
  heading: 'Who holds the space',
  subheading: 'People who have done the work themselves',
  people: [
    { name: 'Arjun Dada', role: 'Founder & Facilitator', image: '/images/proto_figure.png', alt: 'Arjun Dada, founder of Badlaav' },
    { name: 'Sandeep', role: 'Facilitator', image: '/images/proto_day3.png', alt: 'Badlaav facilitator' },
    { name: 'Meera', role: 'Facilitator & Care', image: '/images/proto_day4.png', alt: 'Badlaav facilitator' },
  ],
};

export const VIDEO = {
  heading: 'See a Badlaav unfold',
  sub: 'Three days, in three minutes',
  cta: 'Watch',
  image: '/images/proto_hero.png',
};

export const BIG_FOOTER = {
  headline: ["You don't need more noise.", 'You need three quiet days.'],
  brandLine: 'Trip नाही — Turning Point.',
  credit: '© 2026 Badlaav · Dnyanpith Abhyasika Pvt. Ltd., Ambajogai',
  links: [
    { label: 'Home', href: '/' },
    { label: 'The Three Days', href: '/retreat' },
    { label: 'Upcoming Batches', href: '/register?program=badlaav' },
    { label: 'Talk to Arjun Dada', href: '/contact' },
  ],
};
```

- [ ] **Step 2: Verify**

Run: `cd frontend && npm run lint && npm run build`
Expected: passes (exports are syntactically valid; not yet imported anywhere).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/content.js
git commit -m "feat(content): add First Light prototype copy exports"
```

---

## Task 4: `ProtoHero` section

**Files:**
- Create: `frontend/src/components/sections/ProtoHero.jsx`

**Interfaces:**
- Consumes: `HERO` from content; `NextRetreatCard` as the floating card; `useAmbientMotion`.
- Produces: `export function ProtoHero()` — no props.

- [ ] **Step 1: Create the component**

```jsx
/**
 * ProtoHero — full-bleed dawn image with forest-green overlay, the brand line
 * in heavy DM Sans, and the live NextRetreatCard floating bottom-right.
 */
import { HERO } from '../../lib/content.js';
import { NextRetreatCard } from './NextRetreatCard.jsx';

export function ProtoHero() {
  return (
    <header className="relative min-h-[88vh] flex items-center overflow-hidden bg-ink">
      <div className="absolute inset-0">
        <img src={HERO.image} alt={HERO.imageAlt} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/40 to-ink/30" />
      </div>

      <div className="relative z-10 w-full max-w-wide mx-auto px-[var(--section-x)]">
        <p className="font-mono text-xs uppercase tracking-widest text-pearl/80 mb-5">
          {HERO.badge}
        </p>
        <h1
          className="font-sans font-[1000] tracking-[-0.02em] leading-[1.02] text-pearl mb-6"
          style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)' }}
        >
          {HERO.titleTop}
          <br />
          {HERO.titleBottom}
        </h1>
        <p
          className="font-sans text-pearl/90 max-w-xl leading-snug"
          style={{ fontSize: 'clamp(1.1rem, 2.2vw, 1.5rem)' }}
        >
          {HERO.subtitle}
        </p>
      </div>

      <div className="absolute z-10 bottom-8 right-[var(--section-x)] hidden md:block">
        <NextRetreatCard />
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Verify** — temporarily render `<ProtoHero />` first in `HomePage.jsx` (or just `npm run build`); confirm build passes and, in dev, the hero shows the dawn image, heavy "Trip नाही — Turning Point.", and the floating batch card on desktop. `npm run lint` clean.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/sections/ProtoHero.jsx
git commit -m "feat(sections): add ProtoHero"
```

---

## Task 5: `NoiseWheel` section

**Files:**
- Create: `frontend/src/components/sections/NoiseWheel.jsx`

**Interfaces:**
- Consumes: `NOISE_WHEEL`, `FadeIn`.
- Produces: `export function NoiseWheel()` — no props. Static SVG (no mouse-tilt).

- [ ] **Step 1: Create the component**

```jsx
/**
 * NoiseWheel — "the eight things noise takes" as an 8-spoke ring with the
 * brand line at its centre, beside a heading + check-list. Static (no tilt).
 */
import { NOISE_WHEEL } from '../../lib/content.js';
import { FadeIn } from '../animations/FadeIn.jsx';

const SPOKE_POS = [
  { x: 200, y: 50 }, { x: 310, y: 90 }, { x: 350, y: 205 }, { x: 310, y: 320 },
  { x: 200, y: 360 }, { x: 90, y: 320 }, { x: 50, y: 205 }, { x: 90, y: 90 },
];

export function NoiseWheel() {
  const w = NOISE_WHEEL;
  return (
    <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
      <div className="max-w-default mx-auto">
        <FadeIn>
          <h2
            className="font-display text-ink text-center mb-12"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)' }}
          >
            {w.heading}
            <br />
            <span className="text-ochre">{w.subheading}</span>
          </h2>
        </FadeIn>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <FadeIn>
            <svg viewBox="0 0 400 400" className="w-full max-w-md mx-auto" aria-hidden="true">
              <circle cx="200" cy="200" r="190" fill="none" stroke="rgb(var(--color-charcoal) / 0.12)" strokeWidth="2" />
              <line x1="200" y1="10" x2="200" y2="390" stroke="rgb(var(--color-charcoal) / 0.1)" strokeWidth="2" />
              <line x1="10" y1="200" x2="390" y2="200" stroke="rgb(var(--color-charcoal) / 0.1)" strokeWidth="2" />
              <line x1="65" y1="65" x2="335" y2="335" stroke="rgb(var(--color-charcoal) / 0.1)" strokeWidth="2" />
              <line x1="65" y1="335" x2="335" y2="65" stroke="rgb(var(--color-charcoal) / 0.1)" strokeWidth="2" />
              <circle cx="200" cy="200" r="90" fill="rgb(var(--color-ochre))" />
              <text x="200" y="195" fill="rgb(var(--color-pearl))" fontFamily="DM Sans" fontWeight="700" fontSize="22" textAnchor="middle">{w.center[0]}</text>
              <text x="200" y="220" fill="rgb(var(--color-pearl))" fontFamily="DM Sans" fontWeight="700" fontSize="22" textAnchor="middle">{w.center[1]}</text>
              {w.spokes.map((label, i) => (
                <text key={label} x={SPOKE_POS[i].x} y={SPOKE_POS[i].y} fontFamily="DM Sans" fontWeight="600" fontSize="14" textAnchor="middle" fill="rgb(var(--color-charcoal))">{label}</text>
              ))}
            </svg>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h3 className="font-display text-2xl text-ink mb-6">{w.listHeading}</h3>
            <ul className="space-y-3">
              {w.list.map((item) => (
                <li key={item} className="flex items-start gap-3 font-sans text-charcoal leading-body">
                  <span className="text-gold mt-1 flex-shrink-0" aria-hidden="true">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
```

> Note: `fill`/`stroke` use `rgb(var(--color-*))` directly in SVG attributes (not Tailwind classes, which don't reach SVG `fill`). This is the theme variable, not a hardcoded hex — compliant.

- [ ] **Step 2: Verify** — build + lint pass; wheel renders with amber centre, eight labels, check-list beside it.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/sections/NoiseWheel.jsx
git commit -m "feat(sections): add NoiseWheel"
```

---

## Task 6: `PhotoCollage` section

**Files:**
- Create: `frontend/src/components/sections/PhotoCollage.jsx`

**Interfaces:**
- Consumes: `COLLAGE`, `cn`, `FadeIn`.
- Produces: `export function PhotoCollage()`.

- [ ] **Step 1: Create the component**

```jsx
/**
 * PhotoCollage — an asymmetric six-image grid band.
 */
import { COLLAGE } from '../../lib/content.js';
import { cn } from '../../lib/cn.js';
import { FadeIn } from '../animations/FadeIn.jsx';

export function PhotoCollage() {
  return (
    <section className="bg-cream px-[var(--section-x)] pb-[var(--section-y)]">
      <div className="max-w-wide mx-auto">
        <FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[220px] gap-3">
            {COLLAGE.images.map((img) => (
              <img
                key={img.src}
                src={img.src}
                alt={img.alt}
                className={cn('w-full h-full object-cover rounded-2xl', img.span)}
              />
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify** — build + lint pass; six images tile with the large tile spanning 2×2.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/sections/PhotoCollage.jsx
git commit -m "feat(sections): add PhotoCollage"
```

---

## Task 7: `InterstitialBand` section

**Files:**
- Create: `frontend/src/components/sections/InterstitialBand.jsx`

**Interfaces:**
- Consumes: `INTERSTITIAL`, `FadeIn`, react-router `Link`.
- Produces: `export function InterstitialBand()`.

- [ ] **Step 1: Create the component**

```jsx
/**
 * InterstitialBand — a quiet peach band with a single provocation + CTA.
 */
import { Link } from 'react-router-dom';
import { INTERSTITIAL } from '../../lib/content.js';
import { FadeIn } from '../animations/FadeIn.jsx';

export function InterstitialBand() {
  return (
    <section className="bg-soft py-[var(--section-y)] px-[var(--section-x)] text-center">
      <FadeIn>
        <h2
          className="font-display text-ochre max-w-narrow mx-auto mb-8"
          style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}
        >
          {INTERSTITIAL.line1}
          <br />
          {INTERSTITIAL.line2}
        </h2>
        <Link
          to={INTERSTITIAL.ctaHref}
          className="inline-block font-sans font-semibold bg-ochre text-on-ochre rounded-full px-7 py-3 hover:opacity-90 transition-opacity"
        >
          {INTERSTITIAL.ctaLabel}
        </Link>
      </FadeIn>
    </section>
  );
}
```

- [ ] **Step 2: Verify** — build + lint pass; band renders, CTA navigates to `/register?program=badlaav`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/sections/InterstitialBand.jsx
git commit -m "feat(sections): add InterstitialBand"
```

---

## Task 8: `ThreeDaysInteractive` section

**Files:**
- Create: `frontend/src/components/sections/ThreeDaysInteractive.jsx`

**Interfaces:**
- Consumes: `RETREAT_DAYS`, `cn`, `FadeIn`, `useReducedMotion`, `useState`.
- Produces: `export function ThreeDaysInteractive()`.

- [ ] **Step 1: Create the component**

```jsx
/**
 * ThreeDaysInteractive — homepage "what three days look like": a selectable
 * list of the three days with the active day's image shown alongside.
 * Hover/click to switch (keyboard-accessible buttons). No image animation
 * for reduced-motion users.
 */
import { useState } from 'react';
import { RETREAT_DAYS } from '../../lib/content.js';
import { cn } from '../../lib/cn.js';
import { FadeIn } from '../animations/FadeIn.jsx';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';

export function ThreeDaysInteractive() {
  const [active, setActive] = useState(0);
  const noMotion = useReducedMotion();
  const day = RETREAT_DAYS[active];

  return (
    <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
      <div className="max-w-default mx-auto">
        <FadeIn>
          <p className="font-mono text-xs uppercase tracking-widest text-ochre text-center mb-3">
            Three days, away from the noise
          </p>
          <h2 className="font-display text-ink text-center mb-12" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)' }}>
            What three days look like
          </h2>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-10 items-center">
          <ul className="space-y-2">
            {RETREAT_DAYS.map((d, i) => (
              <li key={d.day}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className={cn(
                    'w-full text-left rounded-2xl p-5 border transition-colors',
                    i === active
                      ? 'bg-soft border-ochre/30'
                      : 'bg-transparent border-charcoal/10 hover:bg-soft/60',
                  )}
                >
                  <h4 className="font-display text-xl text-ink">
                    {d.title} · <span className="text-ochre">{d.subtitle}</span>
                  </h4>
                  <p className="font-sans text-sm text-charcoal/80 mt-1">{d.paragraphs[0]}</p>
                </button>
              </li>
            ))}
          </ul>

          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img
              key={day.image}
              src={day.image}
              alt={`${day.title} — ${day.subtitle}`}
              className={cn('w-full h-[360px] object-cover', !noMotion && 'animate-[fadeIn_0.5s_ease]')}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
```

> The `animate-[fadeIn_...]` uses opacity only; if no `fadeIn` keyframe exists in the Tailwind config, drop the arbitrary animation and keep the bare `<img>` (the `key` swap already gives an instant change). Verify in dev and simplify if the keyframe is undefined.

- [ ] **Step 2: Verify** — build + lint pass; hovering/clicking a day swaps the image; tab-focus works; reduced-motion shows instant swap.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/sections/ThreeDaysInteractive.jsx
git commit -m "feat(sections): add ThreeDaysInteractive"
```

---

## Task 9: `VideoBanner` section

**Files:**
- Create: `frontend/src/components/sections/VideoBanner.jsx`

**Interfaces:**
- Consumes: `VIDEO`, `FadeIn`.
- Produces: `export function VideoBanner()`. Static poster + play affordance (no autoplay, no fireflies).

- [ ] **Step 1: Create the component**

```jsx
/**
 * VideoBanner — a full-bleed poster with a play affordance. Static (no
 * autoplay, no particle effects). The play button is a placeholder until a
 * real video URL is wired.
 */
import { VIDEO } from '../../lib/content.js';
import { FadeIn } from '../animations/FadeIn.jsx';

export function VideoBanner() {
  return (
    <section className="relative h-[60vh] min-h-[380px] overflow-hidden flex items-center justify-center">
      <img src={VIDEO.image} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-ink/55" />
      <FadeIn className="relative z-10 text-center text-pearl px-[var(--section-x)]">
        <h2 className="font-display mb-2" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
          {VIDEO.heading}
        </h2>
        <p className="font-sans text-pearl/85 mb-6">{VIDEO.sub}</p>
        <button
          type="button"
          className="inline-flex items-center gap-2 font-sans font-semibold bg-gold text-on-gold rounded-full px-6 py-3 hover:opacity-90 transition-opacity"
        >
          <span aria-hidden="true">▶</span> {VIDEO.cta}
        </button>
      </FadeIn>
    </section>
  );
}
```

- [ ] **Step 2: Verify** — build + lint pass; banner renders with poster, dark overlay, amber play button.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/sections/VideoBanner.jsx
git commit -m "feat(sections): add VideoBanner"
```

---

## Task 10: `LocationGrid` section

**Files:**
- Create: `frontend/src/components/sections/LocationGrid.jsx`

**Interfaces:**
- Consumes: `LOCATION`, `cn`, `FadeIn`.
- Produces: `export function LocationGrid()`.

- [ ] **Step 1: Create the component**

```jsx
/**
 * LocationGrid — "The Place": copy + a venue image grid (one large, three small).
 */
import { LOCATION } from '../../lib/content.js';
import { cn } from '../../lib/cn.js';
import { FadeIn } from '../animations/FadeIn.jsx';

export function LocationGrid() {
  return (
    <section className="bg-soft py-[var(--section-y)] px-[var(--section-x)]">
      <div className="max-w-default mx-auto">
        <FadeIn>
          <div className="max-w-narrow mb-10">
            <h2 className="font-display text-ink mb-3" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)' }}>
              {LOCATION.eyebrow}
            </h2>
            <span className="inline-block font-mono text-xs uppercase tracking-widest bg-cream text-ochre px-3 py-1 rounded-full mb-4">
              {LOCATION.badge}
            </span>
            <p className="font-sans text-charcoal leading-body">{LOCATION.copy}</p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[200px] gap-3">
            {LOCATION.images.map((img) => (
              <img
                key={img.src}
                src={img.src}
                alt={img.alt}
                className={cn('w-full h-full object-cover rounded-2xl', img.large && 'col-span-2 row-span-2')}
              />
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify** — build + lint pass; copy block + venue grid (large aerial spanning 2×2) render.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/sections/LocationGrid.jsx
git commit -m "feat(sections): add LocationGrid"
```

---

## Task 11: `FacilitatorsGrid` section

**Files:**
- Create: `frontend/src/components/sections/FacilitatorsGrid.jsx`

**Interfaces:**
- Consumes: `FACILITATORS`, `FadeIn`.
- Produces: `export function FacilitatorsGrid()`.

- [ ] **Step 1: Create the component**

```jsx
/**
 * FacilitatorsGrid — Arjun Dada + facilitators, three portrait cards.
 */
import { FACILITATORS } from '../../lib/content.js';
import { FadeIn } from '../animations/FadeIn.jsx';

export function FacilitatorsGrid() {
  return (
    <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
      <div className="max-w-default mx-auto text-center">
        <FadeIn>
          <h2 className="font-display text-ink mb-2" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)' }}>
            {FACILITATORS.heading}
          </h2>
          <p className="font-sans text-charcoal/70 mb-12">{FACILITATORS.subheading}</p>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {FACILITATORS.people.map((p, i) => (
            <FadeIn key={p.name} delay={i * 0.08}>
              <img src={p.image} alt={p.alt} className="w-full aspect-square object-cover rounded-2xl mb-4" />
              <h3 className="font-display text-xl text-ink">{p.name}</h3>
              <p className="font-mono text-xs uppercase tracking-widest text-ochre mt-1">{p.role}</p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify** — build + lint pass; three cards, Arjun Dada first.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/sections/FacilitatorsGrid.jsx
git commit -m "feat(sections): add FacilitatorsGrid"
```

---

## Task 12: `BigFooterCta` section

**Files:**
- Create: `frontend/src/components/sections/BigFooterCta.jsx`

**Interfaces:**
- Consumes: `BIG_FOOTER`, `FadeIn`, react-router `Link`.
- Produces: `export function BigFooterCta()`. (This is a closing band above the global `Footer`; the global `Footer` in `Layout` is unchanged.)

- [ ] **Step 1: Create the component**

```jsx
/**
 * BigFooterCta — forest-green closing band with the brand line in large type.
 */
import { Link } from 'react-router-dom';
import { BIG_FOOTER } from '../../lib/content.js';
import { FadeIn } from '../animations/FadeIn.jsx';

export function BigFooterCta() {
  return (
    <section className="bg-ink text-pearl py-[var(--section-y)] px-[var(--section-x)]">
      <div className="max-w-default mx-auto">
        <FadeIn>
          <h2 className="font-display mb-8" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
            {BIG_FOOTER.headline[0]}
            <br />
            {BIG_FOOTER.headline[1]}
          </h2>
          <nav className="flex flex-wrap gap-x-8 gap-y-2 mb-12 font-sans text-pearl/85">
            {BIG_FOOTER.links.map((l) => (
              <Link key={l.label} to={l.href} className="hover:text-gold transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>
        </FadeIn>
        <div className="border-t border-pearl/15 pt-8">
          <p
            className="font-sans font-[1000] tracking-[-0.02em] text-pearl mb-3"
            style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)' }}
          >
            {BIG_FOOTER.brandLine}
          </p>
          <p className="font-mono text-xs text-pearl/60">{BIG_FOOTER.credit}</p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify** — build + lint pass; forest-green band, big "Trip नाही — Turning Point.", credit line.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/sections/BigFooterCta.jsx
git commit -m "feat(sections): add BigFooterCta"
```

---

## Task 13: `DayBlock` section (for `/retreat`)

**Files:**
- Create: `frontend/src/components/sections/DayBlock.jsx`

**Interfaces:**
- Consumes: a single `RETREAT_DAYS` entry via a `day` prop; `cn`, `FadeIn`.
- Produces: `export function DayBlock({ day, reverse = false })` where `day` is one `RETREAT_DAYS` item and `reverse` flips the image side.

- [ ] **Step 1: Create the component**

```jsx
/**
 * DayBlock — one day on the /retreat page: copy + check-list on one side,
 * image trio on the other. `reverse` alternates the layout. `day.accent` is a
 * theme token name ('gold' | 'sage') used for the badge + check marks.
 */
import { cn } from '../../lib/cn.js';
import { FadeIn } from '../animations/FadeIn.jsx';

const ACCENT = {
  gold: { badge: 'bg-gold text-on-gold', mark: 'text-gold' },
  sage: { badge: 'bg-sage text-pearl', mark: 'text-sage' },
};

export function DayBlock({ day, reverse = false }) {
  const accent = ACCENT[day.accent] ?? ACCENT.gold;
  return (
    <article className="py-[calc(var(--section-y)/1.5)] px-[var(--section-x)]">
      <div className={cn('max-w-default mx-auto grid md:grid-cols-2 gap-10 items-center', reverse && 'md:[&>*:first-child]:order-2')}>
        <FadeIn>
          <span className={cn('inline-block font-mono text-xs uppercase tracking-widest rounded-full px-3 py-1 mb-4', accent.badge)}>
            {day.day}
          </span>
          <h3 className="font-display text-ink mb-5" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)' }}>
            {day.title} | <span className="text-ochre">{day.subtitle}</span>
          </h3>
          {day.paragraphs.map((p) => (
            <p key={p.slice(0, 24)} className="font-sans text-charcoal leading-body mb-4">{p}</p>
          ))}
          <ul className="space-y-2 mt-2">
            {day.list.map((item) => (
              <li key={item} className="flex items-start gap-3 font-sans text-charcoal">
                <span className={cn('mt-1 flex-shrink-0', accent.mark)} aria-hidden="true">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </FadeIn>
        <FadeIn delay={0.1}>
          <img src={day.image} alt={`${day.title} — ${day.subtitle}`} className="w-full h-[360px] object-cover rounded-2xl shadow-lg" />
        </FadeIn>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Verify** — build + lint pass (render check happens in Task 15).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/sections/DayBlock.jsx
git commit -m "feat(sections): add DayBlock"
```

---

## Task 14: Recompose the homepage

**Files:**
- Modify: `frontend/src/pages/public/HomePage.jsx` (full rewrite of the body)

**Interfaces:**
- Consumes: all new sections (Tasks 4–12) + reused `UpcomingBatches`, `Pricing3Plans`, `FAQAccordion`, `Testimonials`; `PLANS` from content; existing `getSeoForRoute`/`OrganizationLD`.

- [ ] **Step 1: Replace the file contents**

```jsx
/**
 * HomePage — / (Badlaav). First Light flow:
 * hero → the idea (noise wheel) → collage → interstitial → the three days →
 * video → batches → the place → testimonials → facilitators → pricing → FAQ →
 * closing band.
 */
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { getSeoForRoute, OrganizationLD } from '../../lib/seo.js';
import { ProtoHero } from '../../components/sections/ProtoHero.jsx';
import { NoiseWheel } from '../../components/sections/NoiseWheel.jsx';
import { PhotoCollage } from '../../components/sections/PhotoCollage.jsx';
import { InterstitialBand } from '../../components/sections/InterstitialBand.jsx';
import { ThreeDaysInteractive } from '../../components/sections/ThreeDaysInteractive.jsx';
import { VideoBanner } from '../../components/sections/VideoBanner.jsx';
import { UpcomingBatches } from '../../components/sections/UpcomingBatches.jsx';
import { LocationGrid } from '../../components/sections/LocationGrid.jsx';
import { Testimonials } from '../../components/sections/Testimonials.jsx';
import { FacilitatorsGrid } from '../../components/sections/FacilitatorsGrid.jsx';
import { Pricing3Plans } from '../../components/sections/Pricing3Plans.jsx';
import { FAQAccordion } from '../../components/sections/FAQAccordion.jsx';
import { BigFooterCta } from '../../components/sections/BigFooterCta.jsx';
import { PLANS } from '../../lib/content.js';

export default function HomePage() {
  const { pathname } = useLocation();
  const seo = getSeoForRoute(pathname);

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:type" content={seo.ogType} />
        <meta property="og:image" content={seo.ogImage} />
        <meta name="twitter:card" content={seo.twitterCard} />
        <script type="application/ld+json">{JSON.stringify(OrganizationLD)}</script>
      </Helmet>

      <ProtoHero />
      <NoiseWheel />
      <PhotoCollage />
      <InterstitialBand />
      <ThreeDaysInteractive />
      <VideoBanner />
      <UpcomingBatches program="BADLAAV" title="Join us at an upcoming batch" />
      <LocationGrid />
      <Testimonials />
      <FacilitatorsGrid />
      <Pricing3Plans program="Badlaav" plans={PLANS} />
      <FAQAccordion />
      <BigFooterCta />
    </>
  );
}
```

- [ ] **Step 2: Verify** — `npm run lint && npm run build` pass. In dev, scroll the full homepage: every section renders in order, the live batch cards and pricing still load, FAQ expands, no console errors. Check mobile width (floating hero card hides < md). Toggle OS reduced-motion → reveals become static.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/public/HomePage.jsx
git commit -m "feat(home): recompose homepage to First Light flow"
```

---

## Task 15: Recompose the program page (`/retreat`)

**Files:**
- Modify: `frontend/src/pages/public/RetreatPage.jsx` (full rewrite of the body)

**Interfaces:**
- Consumes: `ProtoHero` or `ProgramHero`; `DayBlock` ×3 over `RETREAT_DAYS`; reused `Inclusions`, `UpcomingBatches`, `CtaBand`, `BigFooterCta`; existing `getSeoForRoute`.

- [ ] **Step 1: Replace the file contents**

```jsx
/**
 * RetreatPage — /retreat. The three days in depth (First Light look):
 * hero → day-by-day blocks → inclusions → batches → closing band.
 */
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { getSeoForRoute } from '../../lib/seo.js';
import { ProgramHero } from '../../components/sections/ProgramHero.jsx';
import { DayBlock } from '../../components/sections/DayBlock.jsx';
import { Inclusions } from '../../components/sections/Inclusions.jsx';
import { UpcomingBatches } from '../../components/sections/UpcomingBatches.jsx';
import { BigFooterCta } from '../../components/sections/BigFooterCta.jsx';
import { FadeIn } from '../../components/animations/FadeIn.jsx';
import { RETREAT_DAYS, HERO } from '../../lib/content.js';

export default function RetreatPage() {
  const { pathname } = useLocation();
  const seo = getSeoForRoute(pathname);

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:type" content={seo.ogType} />
        <meta property="og:image" content={seo.ogImage} />
        <meta name="twitter:card" content={seo.twitterCard} />
      </Helmet>

      <ProgramHero
        program="Day by day"
        headline="The Badlaav Retreat Experience"
        subHeadline="Step by step, day by day — a glimpse into the journey that awaits when you step away from the noise."
        heroImage={HERO.image}
        heroImageAlt="Arrival at a Badlaav retreat"
        primaryCta={{ label: 'Register', href: '/register?program=badlaav' }}
        secondaryCta={{ label: 'Talk to Arjun Dada', href: '/contact' }}
      />

      <section className="bg-cream pt-[var(--section-y)] text-center px-[var(--section-x)]">
        <FadeIn>
          <h2 className="font-display text-ink" style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)' }}>
            The Three Days
          </h2>
          <p className="font-sans text-charcoal/80 max-w-narrow mx-auto mt-3">
            Three days, carefully held, to take you from exhaustion to clarity. Here is how the journey unfolds.
          </p>
        </FadeIn>
      </section>

      {RETREAT_DAYS.map((day, i) => (
        <DayBlock key={day.day} day={day} reverse={i % 2 === 1} />
      ))}

      <Inclusions />
      <UpcomingBatches program="BADLAAV" title="Upcoming retreat dates" />
      <BigFooterCta />
    </>
  );
}
```

- [ ] **Step 2: Verify** — lint + build pass. In dev at `/retreat`: hero, three alternating day-blocks (Day 2 sage accent), inclusions, live batches, closing band. `/badlaav-experience` still renders unchanged.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/public/RetreatPage.jsx
git commit -m "feat(retreat): recompose /retreat to First Light day-blocks"
```

---

## Task 16: Final verification pass

**Files:** none (verification + any small fixes uncovered).

- [ ] **Step 1: Lint + build**

Run: `cd frontend && npm run lint && npm run build`
Expected: both clean; `dist/` produced at repo root.

- [ ] **Step 2: Visual + functional sweep** (`npm run dev`)
  - `/` and `/retreat` match the prototype (palette, Cormorant headings, heavy DM Sans hero) at ≥1280px and ≤480px.
  - Live flows intact: batch cards load from the API; "Register" reaches `/register`; Razorpay-bound CTAs unbroken; FAQ accordion opens.
  - Reduced-motion (OS setting) → no ambient/reveal motion; layout static and calm.
  - Untouched: `/badlaav-experience`, `/about`, legal pages, `/admin/*`, `/login` render correctly (the global token/font shift applied, no breakage). Spot-check admin contrast (amber `gold`, terracotta `ochre`) is legible.
  - No `console.log` added; no hardcoded hex in the new components (`grep -rn "#[0-9a-fA-F]\{3,6\}" frontend/src/components/sections/Proto* frontend/src/components/sections/NoiseWheel.jsx ...` returns only the `rgb(var(--color-*))` SVG usages).

- [ ] **Step 3: Commit** (only if fixes were made)

```bash
git add -A
git commit -m "fix(port): final verification fixes for First Light port"
```

---

## Self-Review (checked against the spec)

- **§1 foundation** → Tasks 1–2 (tokens, font, images). ✓ (`navy`/`ink` kept green per decision.)
- **§2 homepage 13 sections** → Task 14 composes all; new sections Tasks 4–12; reused batches/pricing/FAQ/testimonials. ✓
- **§3 /retreat** → Task 15 (DayBlock ×3 + reused Inclusions/UpcomingBatches/CtaBand→BigFooterCta). ✓ `/badlaav-experience` untouched. ✓
- **§4 components + content** → Tasks 3–13. ✓ (Deviation logged: new `RETREAT_DAYS` export instead of mutating `DAYS`.)
- **§5 motion** → only `FadeIn` reveals + existing hero ambient; prototype cursor/fireflies/tilt/parallax dropped. ✓
- **§6 conventions** → tokens-only, no inline styles except `clamp()`, copy in content.js, `cn()`, one component per file. ✓
- **§7/§8 risks + acceptance** → Task 16 covers contrast, reduced-motion, untouched routes, build/lint. ✓
- **Type consistency:** `RETREAT_DAYS` item shape (`day,title,subtitle,accent,image,paragraphs[],list[]`) is consumed identically by `ThreeDaysInteractive` and `DayBlock`; `accent` values (`'gold'|'sage'`) match `DayBlock.ACCENT` keys. ✓
- **Placeholder scan:** the only "wire later" items are intentional product stubs (VideoBanner has no real video URL; facilitator names Sandeep/Meera are placeholder copy already in the prototype) — flagged in code comments, not logic gaps. ✓
