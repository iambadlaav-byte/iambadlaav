/**
 * retreatQuestions.js — the deep questionnaire for The Retreat (FORM data).
 * Pure data so the multi-step form can render generically. The answers are
 * collected into a `questionnaire` object and stored as JSON on the registration.
 */

export const MARITAL_OPTIONS = ['Single', 'Married', 'Divorced', 'Widowed'];

export const PROFESSION_OPTIONS = [
  'Business Owner / Entrepreneur',
  'Corporate Professional / Employee',
  'Government Job',
  'Freelancer / Consultant',
  'Student / Preparing for Next Phase',
  'Transitioning / Looking for a New Path',
];

// How many Badlaav programmes the person has attended before (self-reported).
export const PROGRAMS_ATTENDED_OPTIONS = ['This is my first', 'One before', 'Two or three', 'More than three'];

// Section 2 — Current life state (single-select each)
export const LIFE_STATE_QUESTIONS = [
  {
    key: 'energyNow',
    question: 'Which of these best describes your current mental and emotional energy?',
    options: [
      'Stressed, drained, and burned out',
      'Confused or feeling stuck',
      'Excited but lacking direction',
      'Calm but hungry for growth',
      'Highly driven and ready for success',
    ],
  },
  {
    key: 'visionClarity',
    question: 'How clear is your vision for the next 1–3 years?',
    options: [
      'Crystal clear & documented',
      'Written down but lacking energy',
      'It’s all in my head',
      'Honestly, I am confused',
    ],
  },
  {
    key: 'meditation',
    question: 'Meditation / inner-healing experience',
    options: ['Experienced', 'Beginner / on & off', 'Brand new', 'Struggling'],
  },
  {
    key: 'baggage',
    question: 'What feels like the heaviest baggage you are carrying right now?',
    options: ['Past grudges / anger', 'Fear of failure', 'Overthinking', 'Procrastination', 'Self-doubt'],
  },
];

// Section 3 — Self-assessment (simple single-selects — no numeric scales)
export const POTENTIAL_OPTIONS = [
  'Barely surviving',
  'Getting by',
  'Doing okay',
  'Performing well',
  'At my very best',
];

export const COMMITMENT_SCALE_OPTIONS = [
  'Just exploring',
  'Interested but unsure',
  'Ready',
  'Fully committed',
];

export const HEALTH_OPTIONS = [
  'None',
  'Dietary restrictions / allergies',
  'Physical constraints',
  'Ongoing medical condition',
  'Prefer to discuss privately',
];

export const SUCCESS_OPTIONS = [
  'Biggest financial target achieved',
  'Business / career expansion',
  'Mental peace and emotional balance',
  'Strong relationships and network',
];

export const HUNGER_OPTIONS = [
  'Business growth',
  'Inner peace',
  'Better relationships',
  'Life-purpose clarity',
  'Better health',
];

export const BADLAAV_OPTIONS = ['Absolute lightness', 'Absolute clarity', 'Unstoppable energy', 'Powerful tribe'];

// Section 4 — Energy & commitment (simple single-select — no Hawkins scale)
export const FREQUENCY_OPTIONS = [
  'Mostly low and drained',
  'Often anxious or restless',
  'Generally neutral',
  'Mostly positive and hopeful',
  'Energised and joyful',
];

export const COMMITMENT_LEVEL_OPTIONS = ['100% all in', 'Nervous but ready', 'Fully present', 'Open minded'];

export const COMMITMENT_CONFIRM =
  'I understand the retreat guidelines and I am fully committed to doing the inner work.';

// Section 5 — Plans
export const RETREAT_PLANS = [
  { value: 'INDIVIDUAL', regType: 'INDIVIDUAL', label: 'Individual', note: 'One person · 3-day retreat, meals, stay, materials', paid: true },
  { value: 'COUPLE', regType: 'COUPLE', label: 'Couple', note: 'Two people · everything in Individual, for both', paid: true },
  { value: 'CORPORATE', regType: 'CORPORATE', label: 'Corporate batch', note: '6–30 people · custom facilitation, corporate invoice', paid: false },
  { value: 'CORPORATE_ANNUAL', regType: 'CORPORATE', label: 'Corporate annual', note: '2–4 batches a year · residential + online combo', paid: false },
];
