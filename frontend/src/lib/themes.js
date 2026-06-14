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
  warm: {
    label: 'Warm',
    swatch: '#f7f3ea',
    accent: '#be9a4e',
    vars: {
      '--color-cream': '247 243 234', // warm sand — default page background
      '--color-soft': '239 232 217', // pale sand — alternating bands, cards
      '--color-navy': '31 58 46', // deep forest — header bar, dark surfaces
      '--color-ink': '22 39 30', // deepest forest — hero overlay, footer
      '--color-charcoal': '51 48 42', // warm near-black — body text on light
      '--color-pearl': '244 238 226', // warm light — text on dark surfaces
      '--color-gold': '190 154 78', // muted antique gold — primary CTAs
      '--color-ochre': '194 112 62', // terracotta — warmth accent
      '--color-teal': '62 107 79', // deep sage — links, secondary actions
      '--color-teal-light': '90 140 104', // sage — hover, accent phrase
      '--color-sage': '74 124 89', // fern — success / payment confirmation
      '--color-muted': '138 129 112', // warm taupe — captions, metadata
      '--color-danger': '196 74 58', // form errors, destructive actions
      '--color-on-gold': '22 39 30', // dark text on gold CTA backgrounds
      '--color-on-ochre': '244 238 226', // light text on terracotta backgrounds
      '--font-display': "'Cormorant Garamond', Georgia, serif",
      '--font-sans': "'DM Sans', system-ui, sans-serif",
      '--font-mono': "'DM Mono', ui-monospace, monospace",
    },
  },
};

export const DEFAULT_THEME = 'warm';
