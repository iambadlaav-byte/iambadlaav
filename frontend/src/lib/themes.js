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
    swatch: '#fff0ea',
    accent: '#fad062',
    vars: {
      '--color-cream': '255 240 234', // #FFF0EA warm blush — default page background
      '--color-soft': '248 231 224', // #F8E7E0 warm pale — alternating bands, cards
      '--color-navy': '1 82 67', // #015243 deep green — header bar, dark surfaces
      '--color-ink': '1 51 40', // #013328 deepest green — hero overlay, footer
      '--color-charcoal': '55 55 53', // #373735 warm near-black — body text on light
      '--color-pearl': '255 243 239', // #FFF3EF warm white — text on dark surfaces
      '--color-gold': '250 208 98', // #FAD062 sunny gold — primary CTAs
      '--color-ochre': '160 62 27', // #A03E1B terracotta — warmth accent
      '--color-teal': '50 116 85', // #327455 deep fern — links, secondary actions
      '--color-teal-light': '78 155 119', // #4E9B77 fern — hover, accent phrase
      '--color-sage': '78 155 119', // #4E9B77 fern — success / payment confirmation
      '--color-muted': '110 110 110', // #6E6E6E grey — captions, metadata
      '--color-danger': '196 74 58', // form errors, destructive actions
      '--color-on-gold': '1 51 40', // deep green text on gold CTA backgrounds
      '--color-on-ochre': '255 243 239', // warm white on terracotta backgrounds
      '--font-display': "'Poppins', system-ui, sans-serif",
      '--font-sans': "'DM Sans', system-ui, sans-serif",
      '--font-mono': "'DM Mono', ui-monospace, monospace",
    },
  },
};

export const DEFAULT_THEME = 'warm';
