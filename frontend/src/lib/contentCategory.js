/**
 * contentCategory.js — labels + options for the Stories/Gallery programme filter.
 *
 * The Story.category and GalleryItem.category columns carry one of three values
 * app-wide. We surface friendly labels everywhere (admin selects, public chips,
 * item tags) so nobody sees the raw enum value. Mirrors the programme labelling
 * convention in constants.js but is scoped to the content verticals.
 */

export const CONTENT_CATEGORY_LABELS = {
  BADLAAV:          'The Retreat',
  FUTURE_READINESS: 'The Badlaav Experience',
  GENERAL:          'General',
};

// Admin create/edit selects — value + label, in display order.
export const CONTENT_CATEGORY_OPTIONS = [
  { value: 'BADLAAV',          label: 'The Retreat' },
  { value: 'FUTURE_READINESS', label: 'The Badlaav Experience' },
  { value: 'GENERAL',          label: 'General' },
];

// Public filter chips — 'ALL' first, then each programme vertical.
export const CONTENT_CATEGORY_FILTERS = [
  { value: 'ALL',              label: 'All' },
  { value: 'BADLAAV',          label: 'The Retreat' },
  { value: 'FUTURE_READINESS', label: 'The Badlaav Experience' },
  { value: 'GENERAL',          label: 'General' },
];

export const DEFAULT_CONTENT_CATEGORY = 'GENERAL';

export function contentCategoryLabel(value) {
  return CONTENT_CATEGORY_LABELS[String(value).toUpperCase()] ?? CONTENT_CATEGORY_LABELS.GENERAL;
}
