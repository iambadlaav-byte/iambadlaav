/**
 * lib/seo.js — per-route SEO metadata for the Badlaav site.
 * Exports getSeoForRoute(pathname) and the Organization JSON-LD snippet.
 * Titles ≤ 60 chars. Descriptions 150–160 chars.
 */

const DEFAULT_OG_IMAGE = 'https://badlaav.dnyanpith.org/og-default.jpg';
const SITE_NAME = 'Badlaav';

const SEO_MAP = {
  '/': {
    title: 'Badlaav — Trip नाही, Turning Point.',
    description:
      'A 3-day residential retreat in Ambajogai for professionals and teams who need a real reset, not another workshop. You have an environment problem.',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
    twitterCard: 'summary_large_image',
  },
  '/retreat': {
    title: 'The Retreat — Three Days | Badlaav',
    description:
      'Day 1 arrive and slow down. Day 2 the work — no phones. Day 3 a plan for the next 90 days. A residential retreat in Ambajogai, Marathwada.',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
    twitterCard: 'summary_large_image',
  },
  '/pricing': {
    title: 'Pricing — Individual, Couple, Corporate | Badlaav',
    description:
      'Badlaav retreat plans: Individual ₹18,000, Couple ₹30,000, and custom corporate batches. All meals, accommodation, and sessions included.',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
    twitterCard: 'summary',
  },
  '/about': {
    title: 'About Arjun Dada — Badlaav',
    description:
      'The story behind Badlaav and Arjun Thoratt — a fellow who walked the same road before building a space where people can finally focus.',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'profile',
    twitterCard: 'summary',
  },
  '/gallery': {
    title: 'From the Retreat — Gallery | Badlaav',
    description:
      'Photographs from past Badlaav batches in Ambajogai — the grounds, the sessions, the quiet. A look at the environment that does the work.',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
    twitterCard: 'summary_large_image',
  },
  '/contact': {
    title: 'Talk to Arjun Dada — Badlaav',
    description:
      'Enquire about a Badlaav retreat for yourself, your team, or your company. Reach us by the form, email, or WhatsApp. Ambajogai, Maharashtra.',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
    twitterCard: 'summary',
  },
  '/register': {
    title: 'Register — Badlaav Retreat',
    description:
      'Register for an upcoming Badlaav retreat batch. Individual and couple plans, secure payment, instant confirmation. Ambajogai, Marathwada.',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
    twitterCard: 'summary',
  },
  '/payment-success': {
    title: 'Registration Confirmed — Badlaav',
    description:
      'Your Badlaav retreat registration is confirmed. Check your email for details and your invoice.',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
    twitterCard: 'summary',
  },
  '/privacy': {
    title: 'Privacy Policy — Badlaav',
    description:
      'How Dnyanpith Abhyasika Pvt. Ltd. collects, uses, and protects your personal data for the Badlaav programme.',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
    twitterCard: 'summary',
  },
  '/terms': {
    title: 'Terms of Service — Badlaav',
    description:
      'Terms governing registration, payments, and participation in Badlaav retreats, operated by Dnyanpith Abhyasika Pvt. Ltd.',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
    twitterCard: 'summary',
  },
  '/refund': {
    title: 'Refund & Cancellation — Badlaav',
    description:
      'Full refund up to 14 days before the retreat, 50% between 7–14 days, none within 7 days — seats are transferable to the next batch.',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
    twitterCard: 'summary',
  },
  '/404': {
    title: 'Page Not Found — Badlaav',
    description: 'This page wandered off. Find your way back to Badlaav.',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
    twitterCard: 'summary',
  },
};

const FALLBACK_SEO = {
  title: 'Badlaav — Trip नाही, Turning Point.',
  description:
    'A 3-day residential retreat in Ambajogai for professionals and teams who need a real reset. A Dnyanpith initiative.',
  ogImage: DEFAULT_OG_IMAGE,
  ogType: 'website',
  twitterCard: 'summary',
};

/**
 * getSeoForRoute — returns SEO metadata for a given pathname.
 * @param {string} pathname
 * @returns {{ title, description, ogImage, ogType, twitterCard, siteName }}
 */
export function getSeoForRoute(pathname) {
  if (SEO_MAP[pathname]) return { ...SEO_MAP[pathname], siteName: SITE_NAME };

  // Prefix match for nested routes (e.g. /register/*)
  for (const prefix of ['/register/']) {
    if (pathname.startsWith(prefix)) {
      const base = prefix.slice(0, -1);
      if (SEO_MAP[base]) return { ...SEO_MAP[base], siteName: SITE_NAME };
    }
  }

  return { ...FALLBACK_SEO, siteName: SITE_NAME };
}

/**
 * OrganizationLD — JSON-LD for the Badlaav programme.
 * Render via <script type="application/ld+json">{JSON.stringify(OrganizationLD)}</script>
 */
export const OrganizationLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Badlaav — Dnyanpith Abhyasika Pvt. Ltd.',
  url: 'https://badlaav.dnyanpith.org',
  logo: 'https://badlaav.dnyanpith.org/logo.png',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    areaServed: 'IN',
    availableLanguage: ['English', 'Marathi'],
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Ambajogai',
    addressRegion: 'Maharashtra',
    postalCode: '431517',
    addressCountry: 'IN',
  },
  sameAs: ['https://www.instagram.com/dnyanpith', 'https://www.youtube.com/@dnyanpith'],
  founder: { '@type': 'Person', name: 'Arjun Thoratt' },
  foundingLocation: { '@type': 'Place', name: 'Ambajogai, Marathwada, Maharashtra' },
};
