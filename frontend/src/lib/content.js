/**
 * content.js — single source of truth for Badlaav marketing copy.
 * Mirrors docs/CONTENT.md. Keep the two in sync. Respect the brand voice
 * in CLAUDE.md (no forbidden phrases; calm, direct, elder-brother tone).
 */

export const SITE = {
  name: 'Badlaav',
  parent: 'Ambajogai · Maharashtra',
  legalEntity: 'Badlaav',
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

// Pricing for The Badlaav Experience — a single, accessible entry point.
// Same plan shape as PLANS so it renders through <Pricing3Plans />.
export const EXPERIENCE_PLANS = [
  {
    name: 'The Badlaav Experience',
    price: 999,
    features: [
      'Full-day guided experience',
      'Interactive learning sessions',
      'Practical frameworks and tools',
      'Action planning and goal setting',
    ],
    cta: { label: 'Register', href: '/register?program=badlaav-experience' },
  },
];

// ── The Badlaav Experience (the lighter, second programme) ──
// Client-supplied copy, lightly formatted. Program facts (dates, fee, seats,
// venue, facilitator, deadline) render dynamically from the selected batch.
export const EXPERIENCE = {
  hero: {
    program: 'The Badlaav Experience',
    // Headline keeps "Transform your" fixed and rotates the closing word in
    // place: mindset → results. `headline` is the static fallback (reduced motion).
    headline: 'Transform your mindset.',
    headlinePrefix: 'Transform your',
    headlineWords: ['mindset', 'results'],
    sub: 'Every meaningful transformation begins with awareness. A guided experience to break through limiting patterns, gain clarity, and move forward with confidence and purpose.',
  },
  intro: [
    'This programme is designed to help participants break through limiting patterns, gain clarity, develop stronger emotional resilience, and create meaningful progress in their personal and professional lives.',
    'Whether you are an entrepreneur, professional, student, leader, or someone seeking positive change, this experience offers practical tools, guided learning, and grounded insight that help you move forward with greater confidence and purpose.',
  ],
  learn: [
    { title: 'Self-awareness & personal growth', body: 'A deeper understanding of your thoughts, emotions, habits, and behavioural patterns.' },
    { title: 'Clarity & direction', body: 'Clarity on your goals, priorities, and the actions needed to move toward the future you want to create.' },
    { title: 'Mindset', body: 'How beliefs, emotions, and daily thinking patterns shape your results — and how to change them.' },
    { title: 'Emotional intelligence', body: 'Stronger emotional resilience, self-confidence, and the ability to respond well to life’s challenges.' },
    { title: 'Performance & productivity', body: 'Better focus, decision-making, consistency, and personal effectiveness.' },
    { title: 'Meaningful action', body: 'Turning insight into practical action that creates real, lasting results.' },
  ],
  audience: [
    'Entrepreneurs & business owners',
    'Corporate professionals',
    'Freelancers & consultants',
    'Students & young professionals',
    'Leaders & team members',
    'Anyone seeking clarity, confidence, and purpose',
  ],
  highlights: [
    'Interactive learning sessions',
    'Guided reflection activities',
    'Practical frameworks and tools',
    'Personal growth exercises',
    'Group discussions and networking',
    'Action planning and goal setting',
    'Real-world application strategies',
  ],
  outcomes: [
    'Greater self-awareness',
    'Improved clarity and focus',
    'Increased confidence',
    'Better emotional balance',
    'Stronger decision-making',
    'A renewed sense of direction and purpose',
  ],
  process: [
    'Complete the registration form.',
    'Submit the required information.',
    'Complete payment (if applicable).',
    'Receive confirmation by email, SMS, and WhatsApp.',
    'Receive your registration receipt and joining details.',
  ],
};

// ── Volunteer with Badlaav ──
export const VOLUNTEER = {
  hero: {
    program: 'Volunteer',
    headline: 'Help hold the space.',
    sub: 'Badlaav runs on a small team of people who care. If a batch changed something for you, this is how you give it back.',
  },
  intro: [
    'Volunteers are the quiet backbone of every batch. You help participants arrive, settle, and focus — and you become part of the team that makes three days feel safe enough for real work.',
    'It is unpaid and it is meaningful. Most of our volunteers have been through a Badlaav batch themselves.',
  ],
  roles: [
    { title: 'Arrival & logistics', body: 'Welcome participants, manage check-in, keep the day running on time.' },
    { title: 'Holding the room', body: 'A calm, reliable presence during sessions — so the facilitator can focus on the work.' },
    { title: 'Meals & care', body: 'Look after the small comforts that let people put their phones down and stay present.' },
    { title: 'Follow-through', body: 'Help with the 30-day check-ins that keep the change alive after people leave.' },
  ],
  lookingFor: [
    'You have attended a Badlaav batch (preferred, not required)',
    'A calm, dependable presence',
    'Available for the full three days',
    'Comfortable putting others first',
  ],
};

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

// Big-number brand stats (numerals are intentional — the "numbers" voice
// exception covers brand stats). Mirrors the calm, factual claims of the retreat.
export const STATS = [
  { value: '03', kicker: 'Residential', label: 'Three days away from the noise.' },
  { value: '20', kicker: 'Small batch', label: 'No more than twenty people.' },
  { value: '30', kicker: 'Follow-through', label: 'A check-in call thirty days later.' },
];

export const SOCIAL = {
  instagram: 'https://www.instagram.com/iambadlaav/',
  // TODO: paste the real channel/page URLs — these icons render only once set.
  youtube: '',
  facebook: '',
};

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
};
