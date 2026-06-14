/**
 * content.js — single source of truth for Badlaav marketing copy.
 * Mirrors docs/CONTENT.md. Keep the two in sync. Respect the brand voice
 * in CLAUDE.md (no forbidden phrases; calm, direct, elder-brother tone).
 */

export const SITE = {
  name: 'Badlaav',
  parent: 'A Dnyanpith initiative',
  legalEntity: 'Dnyanpith Abhyasika Pvt. Ltd.',
  founder: 'Arjun Thoratt',
  tagline: 'Trip नाही — Turning Point.',
  oneLiner:
    'A 3-day residential retreat for professionals who need a real reset, not another workshop.',
  coreIdea: 'You cannot think clearly in a noisy environment.',
  locationShort: 'Ambajogai, Marathwada',
  locationLong:
    'Ambajogai, Beed district, Marathwada, Maharashtra — roughly 160 km from Aurangabad and 450 km from Pune.',
};

export const ABOUT_PARAGRAPHS = [
  'Badlaav means change. Not a seminar about change — a three-day immersion in an environment designed for it. Ambajogai provides the distance from ordinary life that makes real reflection possible.',
  'The sessions are structured but not scripted. Arjun works with each participant and each team where they actually are, not where a curriculum says they should be. The goals are clarity, decision, and a concrete plan for what comes next.',
  'Accommodation, meals, and all sessions are included. You come; you focus; you leave with more than you arrived with.',
];

export const DAYS = [
  {
    day: 'Day 1',
    title: 'Arrive and slow down',
    body: 'Check-in from 3pm. Evening session: where are you actually? Diagnostic conversations, no projectors, no slides. Dinner together.',
    gain: 'Distance from the noise.',
  },
  {
    day: 'Day 2',
    title: 'The work',
    body: 'Full-day structured reflection. Morning: your environment. Afternoon: your patterns. Evening: the decision you have been avoiding. No phones all day.',
    gain: 'The decision you have been avoiding.',
  },
  {
    day: 'Day 3',
    title: 'What comes next',
    body: 'Morning: a specific plan for the next 90 days. Group debrief. Check-out by 2pm. One follow-up call 30 days later.',
    gain: 'A concrete 90-day plan.',
  },
];

export const WHO_CHIPS = [
  'Founders & leadership teams',
  'Mid-career professionals',
  'Team leads under pressure',
  'Couples wanting clarity together',
];

export const HIGHLIGHTS = [
  {
    title: 'Residential setting',
    body: 'Three days away from everything. Ambajogai, Marathwada. The distance is part of the design.',
  },
  {
    title: 'Structured silence',
    body: 'Mornings begin in quiet. No phones in sessions. The atmosphere is the intervention.',
  },
  {
    title: 'Small group',
    body: 'Max 20 participants per batch. Enough for real conversation; small enough for each person to be seen.',
  },
  {
    title: 'Follow-through design',
    body: 'The retreat ends; the framework stays. One accountability check-in 30 days after.',
  },
];

export const INCLUSIONS = [
  'Three-day residential stay',
  'All meals, prepared on site',
  'Every session with Arjun',
  'A detailed pre-arrival note',
  'A 30-day follow-through call',
  'All materials provided',
];

export const TESTIMONIALS = [
  {
    quote:
      'I came thinking it would be a team-building exercise. I left having made a decision I had been avoiding for two years.',
    author: 'Suresh Naik',
    designation: 'Operations Director',
    program: 'badlaav',
    year: '2024',
    photoUrl: '/images/officer_1.jpg',
  },
  {
    quote:
      'The environment did the work. Three days and more clarity than six months of weekend workshops.',
    author: 'Meena Thokal',
    designation: 'Startup Founder',
    program: 'badlaav',
    year: '2023',
    photoUrl: '/images/officer_2.jpg',
  },
  {
    quote:
      'Arjun does not perform a retreat. He holds a space. That is a different thing entirely.',
    author: 'Prakash Shinde',
    designation: 'Senior Manager, BFSI',
    program: 'badlaav',
    year: '2024',
    photoUrl: '/images/officer_3.jpg',
  },
];

export const PLANS = [
  {
    name: 'Individual',
    price: 18000,
    features: [
      '3-day residential retreat',
      'All meals and accommodation',
      'Structured sessions with Arjun',
      '30-day follow-through check-in',
    ],
    cta: { label: 'Register', href: '/register?program=badlaav&plan=individual' },
  },
  {
    name: 'Couple',
    price: 30000,
    features: [
      'Everything in Individual',
      'Partner attends together',
      'Shared room accommodation',
      'Couples-specific session',
    ],
    cta: { label: 'Register', href: '/register?program=badlaav&plan=couple' },
    isPopular: true,
  },
  {
    name: 'Corporate',
    price: null,
    features: [
      'Exclusive batch for your team',
      'Custom session design',
      'Pre-retreat team assessment',
      'Post-retreat leadership debrief',
    ],
    cta: { label: 'Get a Quote', href: '/contact' },
  },
];

export const FAQS = [
  {
    q: 'Is this a Vipassana retreat?',
    a: 'No. Badlaav is a structured professional retreat. It draws on principles of focused environments and deliberate reflection, but it is not a meditation program.',
  },
  {
    q: 'What do I need to bring?',
    a: 'Comfortable clothes, an open mind, and no work calls. We will share a detailed pre-arrival note after you register.',
  },
  {
    q: 'Can my whole company come?',
    a: "Yes. The corporate plan is designed for teams of 8–20. We design the sessions around your team's specific challenges.",
  },
  {
    q: 'What is the refund policy?',
    a: 'Full refund up to 14 days before the retreat. 50% refund between 7–14 days. No refund within 7 days — but you can transfer your seat to the next available batch.',
  },
  {
    q: 'Where exactly is Ambajogai?',
    a: 'Ambajogai is in Beed district, Marathwada, Maharashtra — roughly 160 km from Aurangabad and 450 km from Pune. We share detailed travel instructions after registration.',
  },
];

export const GALLERY = [
  { url: '/images/badlaav_day1.jpg', alt: 'Badlaav retreat — arrival and the grounds' },
  { url: '/images/badlaav_day2.jpg', alt: 'Badlaav retreat — a working session' },
  { url: '/images/badlaav_day3.jpg', alt: 'Badlaav retreat — the closing debrief' },
  { url: '/images/gallery_1.jpg', alt: 'Badlaav retreat — a quiet morning' },
  { url: '/images/gallery_2.jpg', alt: 'Badlaav retreat — conversation in the open' },
  { url: '/images/gallery_3.jpg', alt: 'Badlaav retreat — the grounds at Ambajogai' },
  { url: '/images/gallery_4.jpg', alt: 'Badlaav retreat — a shared meal' },
];

export const HERO_IMAGE = '/images/program_badlaav.jpg';

export const SOCIAL = {
  instagram: 'https://instagram.com/dnyanpith',
  youtube: 'https://youtube.com/@dnyanpith',
};
