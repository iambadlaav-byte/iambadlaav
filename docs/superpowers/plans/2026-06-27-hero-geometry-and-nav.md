# Hero Geometry + Nav Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pull Stories/Gallery/Volunteer out of the "Explore" nav dropdown into top-level tabs, and add a distinct, continuously-animated line-art geometric figure to the right of every hero (nine pages, nine figures).

**Architecture:** One new component `HeroGeometry` owns the motion gate (`reduced-motion` + route ambient gate) and renders a variant-keyed SVG from a sibling helper module `heroFigures.jsx` (plain builder functions, no extra components — mirrors the existing `GeometricViz` internal-helper pattern). The 8 shared-hero pages pass `aside={<HeroGeometry .../>}` into `ProgramHero`'s already-existing right grid column; the Home page (`ProtoHero`) mounts the figure absolutely in its upper-right.

**Tech Stack:** React 18, Framer Motion (`motion`, already a dep), Tailwind, the project `useReducedMotion` hook, `useAmbientMotion` context.

## Global Constraints

(Every task implicitly includes these — copied verbatim from project rules / spec.)

- **No test runner exists.** Frontend has only `eslint` + `vite build`. Verification per task = `npm run lint` clean (`--max-warnings=0`) **and** `npm run build` success **and** the stated manual visual check. **Do NOT add a test framework** (Vitest/Jest/etc.) — substituting libraries needs explicit approval.
- Run all `npm` commands from the `frontend/` directory.
- **Animate only `transform` / `opacity`** (SVG `pathLength` for one-time draw-in is allowed — `GeometricViz` already uses it). No layout/color/width/height animation.
- **No hardcoded hex** in components — colors come from CSS variables via `rgb(var(--color-*))`.
- **No `console.log`** in committed code.
- **No inline styles** except the existing allowed patterns (`style={{ fontSize: 'clamp(...) }}` and Framer Motion's `style={{ originX, originY }}` transform-origin shorthand, which `GeometricViz` already uses).
- Always respect `prefers-reduced-motion` and the route ambient gate (`/contact`, `/register`) → render a **static** figure (no loops).
- Functional components + hooks only. One component per file, PascalCase filename = export.
- Figures are **decorative**: `aria-hidden="true"`, `pointer-events-none`, and **`hidden lg:block`** (desktop-only).
- Max 1 ambient + 1 reveal animation per hero viewport — the figure is the hero's single ambient (heroes already have `RevealText`/`SlideUp` as the one reveal). `showAmbient` stays false everywhere, so there is no stacking.

---

## File Structure

**New:**
- `frontend/src/components/animations/heroFigures.jsx` — geometry math helpers, motion-prop factories, nine figure builders, the `HERO_FIGURE` key map, and `renderHeroFigure(variant, still)` dispatcher. (Helper functions only — not React components.)
- `frontend/src/components/animations/HeroGeometry.jsx` — the single exported component. Resolves the motion gate, renders the SVG shell, delegates to `renderHeroFigure`. Re-exports `HERO_FIGURE` for convenient one-import page wiring.

**Modified:**
- `frontend/src/components/layout/Header.jsx` — nav array (remove Explore dropdown; add three flat tabs).
- `frontend/src/components/sections/ProtoHero.jsx` — Home figure, absolute upper-right.
- `frontend/src/pages/public/{About,BadlaavExperience,Contact,Gallery,Pricing,Retreat,Stories,Volunteer}Page.jsx` — pass `aside`.

**Untouched:** `ProgramHero.jsx`, `MobileNav.jsx`, `NavDropdown.jsx`, `GeometricViz.jsx`.

---

## Task 1: Nav restructure — promote Stories/Gallery/Volunteer to top-level tabs

**Files:**
- Modify: `frontend/src/components/layout/Header.jsx:23-37`

**Interfaces:**
- Consumes: nothing new.
- Produces: a `NAV_LINKS` array of 7 entries (6 flat `{label, href}` + 1 `{label:'Programmes', dropdown}`). `MobileNav` and the desktop bar both already map this array — no other file changes.

- [ ] **Step 1: Replace the EXPLORE block and NAV_LINKS**

In `Header.jsx`, delete the `EXPLORE_LINKS` constant (lines 23-29) and replace the `NAV_LINKS` definition (lines 31-37) so the file reads:

```jsx
// The two programmes live under one "Programmes" dropdown to save top-bar space.
const PROGRAMME_LINKS = [
  { label: 'The Retreat', href: '/retreat' },
  { label: 'The Badlaav Experience', href: '/badlaav-experience' },
];

const NAV_LINKS = [
  { label: 'Programmes', dropdown: PROGRAMME_LINKS },
  { label: 'Pricing',   href: '/pricing' },
  { label: 'About',     href: '/about' },
  { label: 'Stories',   href: '/stories' },
  { label: 'Gallery',   href: '/gallery' },
  { label: 'Volunteer', href: '/volunteer' },
  { label: 'Contact',   href: '/contact' },
];
```

(Leave the rest of `Header.jsx` untouched — the `NAV_LINKS.map` and `<MobileNav links={NAV_LINKS} />` already handle both flat links and dropdowns.)

- [ ] **Step 2: Lint + build**

Run (from `frontend/`):
```bash
npm run lint && npm run build
```
Expected: both succeed, no warnings.

- [ ] **Step 3: Visual check**

Run `npm run dev`. On desktop (≥1024px) the bar shows: `Programmes ▾  Pricing  About  Stories  Gallery  Volunteer  Contact` — no "Explore". Hover Programmes → dropdown still works. Open the mobile drawer (<768px) → Stories/Gallery/Volunteer appear as flat links (no grouped "Explore" heading); Programmes still shows its grouped sub-links.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/layout/Header.jsx
git commit -m "feat(nav): promote Stories/Gallery/Volunteer to top-level tabs"
```

---

## Task 2: Hero geometry components (figures + wrapper)

**Files:**
- Create: `frontend/src/components/animations/heroFigures.jsx`
- Create: `frontend/src/components/animations/HeroGeometry.jsx`

**Interfaces:**
- Consumes: `framer-motion` `motion`; `../../hooks/useReducedMotion.js` (`useReducedMotion(forceOff) → boolean`); `./AmbientMotionBoundary.jsx` (`useAmbientMotion() → boolean`); `../../lib/cn.js` (`cn(...classes)`).
- Produces:
  - `heroFigures.jsx` exports `HERO_FIGURE` (object map of variant keys) and `renderHeroFigure(variant: string, still: boolean) → JSX`.
  - `HeroGeometry.jsx` exports the component `HeroGeometry({ variant: string, className?: string })` and re-exports `HERO_FIGURE`.

- [ ] **Step 1: Create `heroFigures.jsx`**

```jsx
/**
 * heroFigures — nine distinct, continuously-animated line-art SVG figures for the
 * right side of each hero. Helper builders (NOT components) consumed by HeroGeometry,
 * mirroring the internal-helper pattern in GeometricViz.
 *
 * All motion is transform/opacity (+ SVG pathLength draw-in). Each builder takes
 * `still`; when true it renders a static skeleton (no loops) — that is how form
 * routes (/contact, /register) and prefers-reduced-motion get a calm static figure.
 * Colors come from CSS variables only (CONSTRAINT-CODE-001 / theme tokens).
 */
import { motion } from 'framer-motion';

const C = 200; // SVG centre (viewBox 0 0 400 400)
const GOLD = 'rgb(var(--color-gold))';
const TEAL = 'rgb(var(--color-teal-light))';
const OCHRE = 'rgb(var(--color-ochre))';

/* ── geometry math ── */
function polar(r, deg) {
  const a = (deg * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
}
function circlePath(r) {
  return `M ${C - r} ${C} a ${r} ${r} 0 1 1 ${r * 2} 0 a ${r} ${r} 0 1 1 ${-r * 2} 0`;
}
// Upper semicircle ("dome") of radius r sitting on the horizon line y=250.
function domeArc(r) {
  return `M ${C - r} 250 A ${r} ${r} 0 0 1 ${C + r} 250`;
}
function triPoints(r, rot) {
  return [0, 120, 240].map((d) => polar(r, d + rot).join(',')).join(' ');
}

/* ── motion-prop factories (collapse to static when `still`) ── */
function draw(still, { delay = 0, duration = 1.8, opacity = 1 } = {}) {
  return {
    initial: still ? false : { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity },
    transition: still
      ? { duration: 0 }
      : { pathLength: { delay, duration, ease: 'easeInOut' }, opacity: { delay, duration: 0.4 } },
  };
}
function spin(still, duration, dir = 1) {
  return {
    style: { originX: `${C}px`, originY: `${C}px` },
    animate: still ? undefined : { rotate: dir === -1 ? -360 : 360 },
    transition: still ? undefined : { duration, ease: 'linear', repeat: Infinity },
  };
}
function breathe(
  still,
  { duration = 4, delay = 0, from = 0.45, to = 0.9, scaleTo = 1.05, origin = [C, C] } = {},
) {
  return {
    style: { originX: `${origin[0]}px`, originY: `${origin[1]}px` },
    animate: still ? undefined : { scale: [1, scaleTo, 1], opacity: [from, to, from] },
    transition: still ? undefined : { duration, ease: 'easeInOut', repeat: Infinity, delay },
  };
}

/* ── figure builders ── */
function figHome(still) {
  return (
    <g fill="none">
      <motion.circle cx={C} cy={C} r="26" fill={GOLD}
        {...breathe(still, { duration: 5, scaleTo: 1.12, from: 0.08, to: 0.16 })} />
      <motion.path d={circlePath(150)} stroke={TEAL} strokeWidth="1" {...draw(still, { delay: 0.1, opacity: 0.3 })} />
      <motion.path d={circlePath(100)} stroke={GOLD} strokeWidth="1" {...draw(still, { delay: 0.3, opacity: 0.4 })} />
      <motion.g {...spin(still, 38, -1)}>
        <circle cx={C} cy={C} r="170" fill="none" stroke={TEAL} strokeWidth="0.6" strokeDasharray="3 12" opacity="0.25" />
      </motion.g>
      <motion.g {...spin(still, 26, 1)}>
        {[0, 72, 144, 216, 288].map((deg, i) => {
          const [x, y] = polar(125, deg);
          return <circle key={i} cx={x} cy={y} r={i % 2 ? 3 : 4} fill={i % 2 ? TEAL : GOLD} opacity="0.9" />;
        })}
      </motion.g>
      <circle cx={C} cy={C} r="5" fill={GOLD} />
    </g>
  );
}

function figRetreat(still) {
  return (
    <g fill="none" strokeLinecap="round">
      <motion.line x1="50" y1="250" x2="350" y2="250" stroke={TEAL} strokeWidth="1"
        {...draw(still, { delay: 0.1, opacity: 0.4 })} />
      <motion.path d={domeArc(130)} stroke={TEAL} strokeWidth="1" {...draw(still, { delay: 0.6, opacity: 0.4 })} />
      <motion.path d={domeArc(95)} stroke={OCHRE} strokeWidth="1.5" {...draw(still, { delay: 0.4, opacity: 0.6 })} />
      <motion.path d={domeArc(60)} stroke={GOLD} strokeWidth="2.5" {...draw(still, { delay: 0.2, opacity: 0.9 })} />
      <motion.g {...breathe(still, { duration: 5, from: 0.25, to: 0.55, scaleTo: 1.12, origin: [C, 250] })}>
        {[-55, -28, 0, 28, 55].map((dx, i) => (
          <line key={i} x1={C + dx * 0.35} y1="250" x2={C + dx} y2="172" stroke={GOLD} strokeWidth="0.7" opacity="0.4" />
        ))}
      </motion.g>
      <motion.circle cx={C} cy="250" r="9" fill={GOLD}
        {...breathe(still, { duration: 4, scaleTo: 1.18, from: 0.7, to: 1, origin: [C, 250] })} />
    </g>
  );
}

function figExperience(still) {
  return (
    <g fill="none">
      <motion.g {...breathe(still, { duration: 4, scaleTo: 1.1, from: 0.1, to: 0.22 })}>
        <circle cx={C} cy={C} r="30" fill={GOLD} opacity="0.6" />
        <circle cx={C} cy={C} r="16" fill={GOLD} />
      </motion.g>
      <motion.g {...spin(still, 60, 1)}>
        {Array.from({ length: 16 }, (_, i) => {
          const deg = i * 22.5;
          const [x1, y1] = polar(42, deg);
          const [x2, y2] = polar(i % 2 ? 150 : 120, deg);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={i % 4 === 0 ? GOLD : TEAL} strokeWidth={i % 4 === 0 ? 1.4 : 0.7} opacity="0.5" />
          );
        })}
      </motion.g>
      <motion.path d={circlePath(155)} stroke={TEAL} strokeWidth="0.6" {...draw(still, { delay: 0.4, opacity: 0.3 })} />
      <circle cx={C} cy={C} r="5" fill={GOLD} />
    </g>
  );
}

function figAbout(still) {
  return (
    <g fill="none">
      <motion.path d={circlePath(150)} stroke={TEAL} strokeWidth="1" {...draw(still, { delay: 0.1, opacity: 0.3 })} />
      <motion.g {...spin(still, 50, 1)}>
        <rect x="80" y="80" width="240" height="240" stroke={GOLD} strokeWidth="1" opacity="0.5" />
      </motion.g>
      <motion.g {...spin(still, 50, -1)}>
        <rect x="80" y="80" width="240" height="240" stroke={OCHRE} strokeWidth="1" opacity="0.35"
          transform={`rotate(45 ${C} ${C})`} />
      </motion.g>
      <motion.g {...spin(still, 80, 1)}>
        <rect x="120" y="120" width="160" height="160" stroke={TEAL} strokeWidth="0.7" opacity="0.4"
          transform={`rotate(22.5 ${C} ${C})`} />
      </motion.g>
      <motion.circle cx={C} cy={C} r="10" fill={GOLD}
        {...breathe(still, { duration: 5, scaleTo: 1.15, from: 0.6, to: 1 })} />
    </g>
  );
}

function figPricing(still) {
  const bars = [
    { y: 250, w: 70, c: TEAL, o: 0.4 },
    { y: 210, w: 110, c: GOLD, o: 0.6 },
    { y: 170, w: 150, c: OCHRE, o: 0.5 },
    { y: 130, w: 200, c: GOLD, o: 0.85 },
  ];
  return (
    <g fill="none">
      <line x1="110" y1="290" x2="320" y2="290" stroke={TEAL} strokeWidth="1" opacity="0.3" />
      {bars.map((b, i) => (
        <motion.rect key={i} x="110" y={b.y} width={b.w} height="24" rx="4" fill={b.c}
          style={{ originX: '110px' }}
          initial={still ? false : { scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: b.o }}
          transition={still ? { duration: 0 } : { delay: 0.2 + i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
      ))}
      <motion.rect x="110" y="130" width="200" height="24" rx="4" fill={GOLD}
        animate={still ? undefined : { opacity: [0, 0.25, 0] }}
        transition={still ? undefined : { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }} />
    </g>
  );
}

function figStories(still) {
  const circles = [
    { cx: 160, cy: 170, r: 70, c: GOLD, amp: -8, dur: 6, delay: 0 },
    { cx: 250, cy: 180, r: 80, c: TEAL, amp: 10, dur: 7, delay: 0.5 },
    { cx: 200, cy: 250, r: 60, c: OCHRE, amp: -6, dur: 5.5, delay: 1 },
  ];
  return (
    <g fill="none">
      {circles.map((c, i) => (
        <motion.circle key={i} cx={c.cx} cy={c.cy} r={c.r} stroke={c.c} strokeWidth="1.2" opacity="0.45"
          animate={still ? undefined : { y: [0, c.amp, 0], x: [0, c.amp / 2, 0] }}
          transition={still ? undefined : { duration: c.dur, repeat: Infinity, ease: 'easeInOut', delay: c.delay }} />
      ))}
      {[[205, 175], [225, 215], [180, 215]].map(([x, y], i) => (
        <motion.circle key={`d${i}`} cx={x} cy={y} r="3.5" fill={GOLD}
          animate={still ? undefined : { opacity: [0.4, 1, 0.4] }}
          transition={still ? undefined : { duration: 3, repeat: Infinity, delay: i * 0.6 }} />
      ))}
    </g>
  );
}

function figGallery(still) {
  const cells = [];
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      cells.push({ x: 110 + col * 50, y: 110 + row * 50, i: row * 4 + col });
    }
  }
  return (
    <g fill="none">
      {cells.map((c) => (
        <rect key={c.i} x={c.x} y={c.y} width="38" height="38" rx="4" stroke={TEAL} strokeWidth="0.8" opacity="0.28" />
      ))}
      <motion.g
        animate={still ? { x: 0, y: 0 } : { x: [0, 100, 150, 50, 0], y: [0, 50, 150, 100, 0] }}
        transition={still ? { duration: 0 } : { duration: 9, repeat: Infinity, ease: 'easeInOut', times: [0, 0.25, 0.5, 0.75, 1] }}>
        <rect x="110" y="110" width="38" height="38" rx="4" fill={GOLD} opacity="0.6" />
      </motion.g>
    </g>
  );
}

function figVolunteer(still) {
  return (
    <g fill="none">
      <motion.path d={circlePath(150)} stroke={TEAL} strokeWidth="0.6" {...draw(still, { delay: 0.2, opacity: 0.25 })} />
      <motion.g {...spin(still, 34, 1)}>
        <polygon points={triPoints(130, -90)} stroke={GOLD} strokeWidth="1.4" opacity="0.6" />
      </motion.g>
      <motion.g {...spin(still, 34, -1)}>
        <polygon points={triPoints(130, 90)} stroke={OCHRE} strokeWidth="1.4" opacity="0.5" />
      </motion.g>
      <motion.g {...spin(still, 60, 1)}>
        <polygon points={triPoints(75, -90)} stroke={TEAL} strokeWidth="0.8" opacity="0.5" />
      </motion.g>
      <motion.circle cx={C} cy={C} r="6" fill={GOLD}
        {...breathe(still, { duration: 4, scaleTo: 1.2, from: 0.7, to: 1 })} />
    </g>
  );
}

function figContact(still) {
  return (
    <g fill="none">
      <circle cx={C} cy={C} r="130" stroke={TEAL} strokeWidth="0.8" opacity="0.25" />
      <circle cx={C} cy={C} r="90" stroke={GOLD} strokeWidth="1" opacity="0.35" />
      <line x1="40" y1={C} x2="360" y2={C} stroke={TEAL} strokeWidth="0.5" opacity="0.2" />
      <line x1={C} y1="40" x2={C} y2="360" stroke={TEAL} strokeWidth="0.5" opacity="0.2" />
      <motion.circle cx={C} cy={C} r="50" stroke={GOLD} strokeWidth="1.2" opacity="0.4"
        style={{ originX: `${C}px`, originY: `${C}px` }}
        animate={still ? undefined : { scale: [0.6, 1, 0.6], opacity: [0.6, 0.1, 0.6] }}
        transition={still ? undefined : { duration: 5, repeat: Infinity, ease: 'easeInOut' }} />
      <circle cx={C} cy={C} r="5" fill={GOLD} />
    </g>
  );
}

/* ── dispatch ── */
export const HERO_FIGURE = {
  HOME: 'home',
  RETREAT: 'retreat',
  EXPERIENCE: 'experience',
  ABOUT: 'about',
  PRICING: 'pricing',
  STORIES: 'stories',
  GALLERY: 'gallery',
  VOLUNTEER: 'volunteer',
  CONTACT: 'contact',
};

const BUILDERS = {
  home: figHome,
  retreat: figRetreat,
  experience: figExperience,
  about: figAbout,
  pricing: figPricing,
  stories: figStories,
  gallery: figGallery,
  volunteer: figVolunteer,
  contact: figContact,
};

export function renderHeroFigure(variant, still) {
  const build = BUILDERS[variant] || figHome;
  return build(still);
}
```

- [ ] **Step 2: Create `HeroGeometry.jsx`**

```jsx
/**
 * HeroGeometry — decorative animated line-art figure for the right side of a hero.
 * Picks a figure by `variant`, owns the motion gate (prefers-reduced-motion OR the
 * route ambient gate → static skeleton), and renders the SVG. Desktop-only and
 * aria-hidden — it carries no meaning, only atmosphere.
 *
 * Animates transform/opacity (+ SVG pathLength draw-in) only (CONSTRAINT-CODE-004).
 */
import { cn } from '../../lib/cn.js';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';
import { useAmbientMotion } from './AmbientMotionBoundary.jsx';
import { renderHeroFigure, HERO_FIGURE } from './heroFigures.jsx';

export function HeroGeometry({ variant, className }) {
  const ambientDisabled = useAmbientMotion();
  // `still` when the user prefers reduced motion OR the route bans ambient motion.
  const still = useReducedMotion(ambientDisabled);

  return (
    <div
      className={cn('hidden lg:block pointer-events-none select-none w-full max-w-[440px] mx-auto', className)}
      aria-hidden="true"
    >
      <svg viewBox="0 0 400 400" className="w-full h-auto">
        {renderHeroFigure(variant, still)}
      </svg>
    </div>
  );
}

// Re-export so pages can `import { HeroGeometry, HERO_FIGURE }` from one path.
export { HERO_FIGURE };
```

- [ ] **Step 3: Lint + build**

Run (from `frontend/`):
```bash
npm run lint && npm run build
```
Expected: both succeed, no warnings. (Nothing renders these yet — this step proves the files compile and pass lint.)

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/animations/heroFigures.jsx frontend/src/components/animations/HeroGeometry.jsx
git commit -m "feat(animations): add HeroGeometry + nine hero figures"
```

---

## Task 3: Wire the geometric figure into the eight ProgramHero pages

**Files (modify):**
- `frontend/src/pages/public/AboutPage.jsx`
- `frontend/src/pages/public/BadlaavExperiencePage.jsx`
- `frontend/src/pages/public/ContactPage.jsx`
- `frontend/src/pages/public/GalleryPage.jsx`
- `frontend/src/pages/public/PricingPage.jsx`
- `frontend/src/pages/public/RetreatPage.jsx`
- `frontend/src/pages/public/StoriesPage.jsx`
- `frontend/src/pages/public/VolunteerPage.jsx`

**Interfaces:**
- Consumes: `HeroGeometry`, `HERO_FIGURE` from `../../components/animations/HeroGeometry.jsx`; `ProgramHero`'s existing `aside` prop (rendered in its right grid column — no change to `ProgramHero`).
- Produces: each page's hero now shows its figure on the right (lg+).

The edit is identical in shape for each file: **(a)** add one import directly under the existing `ProgramHero` import, **(b)** add one `aside={...}` prop just before the hero's closing `/>`. Variant per page:

| File | closing `/>` after this existing prop line | variant |
|---|---|---|
| AboutPage.jsx | `heroImageAlt="Arjun at his desk in Ambajogai"` | `HERO_FIGURE.ABOUT` |
| BadlaavExperiencePage.jsx | `secondaryCta={{ label: 'Talk to Arjun Dada', href: '/contact' }}` | `HERO_FIGURE.EXPERIENCE` |
| ContactPage.jsx | `heroImageAlt="First light over the Badlaav retreat"` | `HERO_FIGURE.CONTACT` |
| GalleryPage.jsx | `heroImageAlt="The grounds at the Badlaav retreat in Ambajogai"` | `HERO_FIGURE.GALLERY` |
| PricingPage.jsx | `primaryCta={{ label: 'Register', href: '/register?program=badlaav' }}` | `HERO_FIGURE.PRICING` |
| RetreatPage.jsx | `secondaryCta={{ label: 'Talk to Arjun Dada', href: '/contact' }}` | `HERO_FIGURE.RETREAT` |
| StoriesPage.jsx | `heroImageAlt="The closing circle at a Badlaav retreat"` | `HERO_FIGURE.STORIES` |
| VolunteerPage.jsx | `secondaryCta={{ label: 'Talk to Arjun Dada', href: '/contact' }}` | `HERO_FIGURE.VOLUNTEER` |

- [ ] **Step 1: Add the import to each of the eight files**

In each file, the existing line is:
```jsx
import { ProgramHero } from '../../components/sections/ProgramHero.jsx';
```
Add directly beneath it:
```jsx
import { HeroGeometry, HERO_FIGURE } from '../../components/animations/HeroGeometry.jsx';
```

- [ ] **Step 2: Add the `aside` prop to each hero**

For each file, insert this line as the last prop, immediately before the `<ProgramHero .../>` closing `/>` (use the page's variant from the table above):
```jsx
        aside={<HeroGeometry variant={HERO_FIGURE.ABOUT} />}
```
Concrete example — `AboutPage.jsx` becomes:
```jsx
      <ProgramHero
        program="About"
        headline="दादा who walked the same road"
        subHeadline="Badlaav is led by Arjun. Not a motivational speaker — a fellow who needed the reset himself, and built the space he wished had existed."
        heroImage="/images/arjun_study.jpg"
        heroImageAlt="Arjun at his desk in Ambajogai"
        aside={<HeroGeometry variant={HERO_FIGURE.ABOUT} />}
      />
```
Repeat for the other seven, swapping the variant per the table (e.g. `HERO_FIGURE.EXPERIENCE` in BadlaavExperiencePage, `HERO_FIGURE.CONTACT` in ContactPage, etc.).

- [ ] **Step 3: Lint + build**

Run (from `frontend/`):
```bash
npm run lint && npm run build
```
Expected: both succeed, no warnings.

- [ ] **Step 4: Visual check**

Run `npm run dev`. On desktop visit `/about`, `/badlaav-experience`, `/gallery`, `/pricing`, `/retreat`, `/stories`, `/volunteer` — each hero shows a **different** animated figure on the right; hero copy still reads on the left (two-column on lg). Resize below 1024px → the figure disappears and copy spans full width (no layout shift, no stacked empty space). Visit `/contact` → the figure renders **static** (no looping) because it's a form route. Verify no figure overlaps headline text.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/public/AboutPage.jsx frontend/src/pages/public/BadlaavExperiencePage.jsx frontend/src/pages/public/ContactPage.jsx frontend/src/pages/public/GalleryPage.jsx frontend/src/pages/public/PricingPage.jsx frontend/src/pages/public/RetreatPage.jsx frontend/src/pages/public/StoriesPage.jsx frontend/src/pages/public/VolunteerPage.jsx
git commit -m "feat(heroes): add distinct geometric figure to each ProgramHero page"
```

---

## Task 4: Wire the Home figure into ProtoHero (absolute upper-right)

**Files:**
- Modify: `frontend/src/components/sections/ProtoHero.jsx`

**Interfaces:**
- Consumes: `HeroGeometry`, `HERO_FIGURE` from `../animations/HeroGeometry.jsx`.
- Produces: Home hero shows the `home` figure upper-right, clear of the bottom-right `NextRetreatCard`.

- [ ] **Step 1: Add the import**

In `ProtoHero.jsx`, under the existing `SlideUp` import line (`import { SlideUp } from '../animations/SlideUp.jsx';`), add:
```jsx
import { HeroGeometry, HERO_FIGURE } from '../animations/HeroGeometry.jsx';
```

- [ ] **Step 2: Mount the figure absolutely, upper-right**

In `ProtoHero.jsx`, immediately after the gradient overlay `<div>` (the line `<div className="absolute inset-0 bg-gradient-to-t from-ember/90 via-ember/60 to-ember/40 z-0" />`), insert:
```jsx
      {/* Decorative geometric figure — upper-right, clear of the bottom-right NextRetreatCard. */}
      <div className="absolute top-8 right-[var(--section-x)] z-[1] w-[clamp(220px,26vw,380px)] hidden lg:block pointer-events-none">
        <HeroGeometry variant={HERO_FIGURE.HOME} className="max-w-none" />
      </div>
```
(`z-[1]` sits above the image/overlay but below the `z-10` copy and the `z-10` NextRetreatCard. `max-w-none` lets the figure fill the sized wrapper instead of the default 440px cap.)

- [ ] **Step 3: Lint + build**

Run (from `frontend/`):
```bash
npm run lint && npm run build
```
Expected: both succeed, no warnings.

- [ ] **Step 4: Visual check**

Run `npm run dev`, visit `/`. On desktop the `home` figure (concentric rings + orbiting nodes) animates in the upper-right; it does **not** overlap the brand headline (left) or the `NextRetreatCard` (bottom-right). Below 1024px the figure is hidden. The figure differs from all eight inner-page figures.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/sections/ProtoHero.jsx
git commit -m "feat(home): add geometric figure to ProtoHero upper-right"
```

---

## Task 5: Full-site verification pass

**Files:** none (verification only).

- [ ] **Step 1: Clean lint + build**

Run (from `frontend/`):
```bash
npm run lint && npm run build
```
Expected: both pass with zero warnings/errors.

- [ ] **Step 2: Reduced-motion check**

In the browser devtools, emulate `prefers-reduced-motion: reduce` (Rendering tab). Reload `/` and one inner page (e.g. `/about`). Expected: figures render as a **static** skeleton — no spinning/pulsing/drifting. Disable the emulation → motion resumes.

- [ ] **Step 3: Form-route static check**

With motion enabled, visit `/contact` and `/register`. Expected: any hero figure present is static (no loops), matching the "no animation on form pages" rule.

- [ ] **Step 4: Nav + distinctness sweep**

Confirm the desktop nav has no "Explore" dropdown and shows the seven items; the mobile drawer lists Stories/Gallery/Volunteer as flat links. Click through all nine heroes and confirm each figure is visibly different from the others.

- [ ] **Step 5: Final commit (if any tidy-ups were needed)**

```bash
git add -A
git commit -m "chore: hero geometry + nav verification pass"
```
(If nothing changed in this task, skip the commit.)

---

## Self-Review

**Spec coverage:**
- Nav restructure (remove Explore, 3 top-level tabs) → Task 1. ✓
- `HeroGeometry.jsx` + `heroFigures.jsx`, gate handling, desktop-only, aria-hidden → Task 2. ✓
- Nine distinct figures incl. static Contact → Task 2 (figures) + Tasks 3-4 (wiring). ✓
- ProgramHero `aside` wiring, no ProgramHero change → Task 3. ✓
- Home `ProtoHero` upper-right, clear of NextRetreatCard → Task 4. ✓
- Reduced-motion / form-route static, transform-opacity-only, no hex, lint+build → Global Constraints + Task 5. ✓
- MobileNav/NavDropdown untouched → Task 1 (array is single source). ✓

**Placeholder scan:** No TBD/TODO; all code blocks are complete and concrete. ✓

**Type consistency:** `HERO_FIGURE` keys (`HOME/RETREAT/EXPERIENCE/ABOUT/PRICING/STORIES/GALLERY/VOLUNTEER/CONTACT`) match `BUILDERS` lowercase keys via the values, and the page table uses exactly those constant names. `renderHeroFigure(variant, still)` signature matches its call in `HeroGeometry`. `useReducedMotion(forceOff)` and `useAmbientMotion()` match existing hook/context signatures (per `QuietRipple.jsx` / `FAQAccordion.jsx` usage). ✓
