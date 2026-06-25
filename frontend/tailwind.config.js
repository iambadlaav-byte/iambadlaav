/** Wraps a CSS custom-property color so Tailwind /opacity modifiers work. */
function themeColor(cssVar) {
  return `rgb(var(${cssVar}) / <alpha-value>)`;
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      // CSS variable bridge — echoes brand colors so canvas/SVG/Framer Motion
      // can reference the same tokens via var(--color-*) syntax.
      // themeColor() enables Tailwind /opacity modifiers (e.g. text-pearl/80)
      // via CSS color-mix().
      colors: {
        navy:      themeColor('--color-navy'),
        gold:      themeColor('--color-gold'),
        ochre:     themeColor('--color-ochre'),
        cream:     themeColor('--color-cream'),
        charcoal:  themeColor('--color-charcoal'),
        teal:      themeColor('--color-teal'),
        sage:      themeColor('--color-sage'),
        soft:      themeColor('--color-soft'),
        ink:       themeColor('--color-ink'),
        muted:     themeColor('--color-muted'),
        danger:    themeColor('--color-danger'),
        pearl:     themeColor('--color-pearl'),
        'teal-light': themeColor('--color-teal-light'),
        'on-gold':    themeColor('--color-on-gold'),
        'on-ochre':   themeColor('--color-on-ochre'),
      },
      fontFamily: {
        // Switched per theme via --font-* CSS variables (see ThemeContext)
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans:    ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'ui-monospace', 'monospace'],
        // Mukta — Devanagari fallback (community pages with Marathi phrases)
        deva: ['"Mukta"', 'sans-serif'],
      },
      maxWidth: {
        // Three container widths per §3.3
        narrow:  '700px',   // blog body, legal pages, single-form pages
        default: '1160px',  // main page content
        wide:    '1440px',  // hero sections, full-bleed gallery strips
      },
      lineHeight: {
        // Brand atmosphere: body copy breathes at 1.7
        body: '1.7',
      },
    },
  },
  plugins: [],
};
