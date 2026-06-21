/**
 * DoodleArrow — a loose hand-drawn arrow (the LBD pen-doodle that nudges the
 * eye toward content). Stroke uses currentColor, so colour it with text-* classes.
 * Decorative (aria-hidden).
 */
export function DoodleArrow({ className }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width="96"
      height="74"
      viewBox="0 0 96 74"
      fill="none"
    >
      <path
        d="M6 10 C 46 0, 86 14, 70 50"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M55 41 L 71 53 L 83 37"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
