/**
 * themes.js — single fixed "Warm" theme for the Badlaav retreat site.
 *
 * One theme only. The CSS-variable bridge (see tailwind.config.js) maps the
 * semantic color tokens (cream, navy, gold, ink, charcoal, teal, …) to these
 * values, so every component is themed without touching its classNames.
 *
 * Palette: warm sand backgrounds, deep forest-green dark surfaces,
 * muted antique gold CTAs, terracotta warmth accents. Light, calm, premium.
 */
export const THEMES = {
  // "Warm" theme — palette copied from lifebydesign.in (LBD Retreat):
  // deep green #015243, warm blush #FFF0EA, sunny gold #FAD062,
  // terracotta #A03E1B, fern #4E9B77, warm charcoal #373735.
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

export const DEFAULT_THEME = 'warm';
