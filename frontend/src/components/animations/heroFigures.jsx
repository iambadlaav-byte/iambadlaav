/**
 * heroFigures — nine distinct, continuously-animated line-art SVG figures for the
 * right side of each hero. Helper builders (NOT components) consumed by HeroGeometry,
 * mirroring the internal-helper pattern in GeometricViz.
 *
 * All motion is transform/opacity (+ SVG pathLength draw-in). Each builder takes
 * `still`; when true it renders a static skeleton (no loops) — that is how form
 * routes (/contact, /register) and prefers-reduced-motion get a calm static figure.
 * Colors come from CSS variables only (CONSTRAINT-CODE-001 / theme tokens).
 */
import { motion } from 'framer-motion';

const C = 200; // SVG centre (viewBox 0 0 400 400)
const GOLD = 'rgb(var(--color-gold))';
const TEAL = 'rgb(var(--color-teal-light))';
const OCHRE = 'rgb(var(--color-ochre))';

/* ── geometry math ── */
function polar(r, deg) {
  const a = (deg * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
}
function circlePath(r) {
  return `M ${C - r} ${C} a ${r} ${r} 0 1 1 ${r * 2} 0 a ${r} ${r} 0 1 1 ${-r * 2} 0`;
}
// Upper semicircle ("dome") of radius r sitting on the horizon line y=250.
function domeArc(r) {
  return `M ${C - r} 250 A ${r} ${r} 0 0 1 ${C + r} 250`;
}
function triPoints(r, rot) {
  return [0, 120, 240].map((d) => polar(r, d + rot).join(',')).join(' ');
}

/* ── motion-prop factories (collapse to static when `still`) ── */
function draw(still, { delay = 0, duration = 1.8, opacity = 1 } = {}) {
  return {
    initial: still ? false : { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity },
    transition: still
      ? { duration: 0 }
      : { pathLength: { delay, duration, ease: 'easeInOut' }, opacity: { delay, duration: 0.4 } },
  };
}
function spin(still, duration, dir = 1) {
  return {
    style: { originX: `${C}px`, originY: `${C}px` },
    animate: still ? undefined : { rotate: dir === -1 ? -360 : 360 },
    transition: still ? undefined : { duration, ease: 'linear', repeat: Infinity },
  };
}
function breathe(
  still,
  { duration = 4, delay = 0, from = 0.45, to = 0.9, scaleTo = 1.05, origin = [C, C] } = {},
) {
  return {
    style: { originX: `${origin[0]}px`, originY: `${origin[1]}px` },
    animate: still ? undefined : { scale: [1, scaleTo, 1], opacity: [from, to, from] },
    transition: still ? undefined : { duration, ease: 'easeInOut', repeat: Infinity, delay },
  };
}

/* ── figure builders ── */
function figHome(still) {
  return (
    <g fill="none">
      <motion.circle cx={C} cy={C} r="26" fill={GOLD}
        {...breathe(still, { duration: 5, scaleTo: 1.12, from: 0.08, to: 0.16 })} />
      <motion.path d={circlePath(150)} stroke={TEAL} strokeWidth="1" {...draw(still, { delay: 0.1, opacity: 0.3 })} />
      <motion.path d={circlePath(100)} stroke={GOLD} strokeWidth="1" {...draw(still, { delay: 0.3, opacity: 0.4 })} />
      <motion.g {...spin(still, 38, -1)}>
        <circle cx={C} cy={C} r="170" fill="none" stroke={TEAL} strokeWidth="0.6" strokeDasharray="3 12" opacity="0.25" />
      </motion.g>
      <motion.g {...spin(still, 26, 1)}>
        {[0, 72, 144, 216, 288].map((deg, i) => {
          const [x, y] = polar(125, deg);
          return <circle key={i} cx={x} cy={y} r={i % 2 ? 3 : 4} fill={i % 2 ? TEAL : GOLD} opacity="0.9" />;
        })}
      </motion.g>
      <circle cx={C} cy={C} r="5" fill={GOLD} />
    </g>
  );
}

function figRetreat(still) {
  return (
    <g fill="none" strokeLinecap="round">
      <motion.line x1="50" y1="250" x2="350" y2="250" stroke={TEAL} strokeWidth="1"
        {...draw(still, { delay: 0.1, opacity: 0.4 })} />
      <motion.path d={domeArc(130)} stroke={TEAL} strokeWidth="1" {...draw(still, { delay: 0.6, opacity: 0.4 })} />
      <motion.path d={domeArc(95)} stroke={OCHRE} strokeWidth="1.5" {...draw(still, { delay: 0.4, opacity: 0.6 })} />
      <motion.path d={domeArc(60)} stroke={GOLD} strokeWidth="2.5" {...draw(still, { delay: 0.2, opacity: 0.9 })} />
      <motion.g {...breathe(still, { duration: 5, from: 0.25, to: 0.55, scaleTo: 1.12, origin: [C, 250] })}>
        {[-55, -28, 0, 28, 55].map((dx, i) => (
          <line key={i} x1={C + dx * 0.35} y1="250" x2={C + dx} y2="172" stroke={GOLD} strokeWidth="0.7" opacity="0.4" />
        ))}
      </motion.g>
      <motion.circle cx={C} cy="250" r="9" fill={GOLD}
        {...breathe(still, { duration: 4, scaleTo: 1.18, from: 0.7, to: 1, origin: [C, 250] })} />
    </g>
  );
}

function figExperience(still) {
  return (
    <g fill="none">
      <motion.g {...breathe(still, { duration: 4, scaleTo: 1.1, from: 0.1, to: 0.22 })}>
        <circle cx={C} cy={C} r="30" fill={GOLD} opacity="0.6" />
        <circle cx={C} cy={C} r="16" fill={GOLD} />
      </motion.g>
      <motion.g {...spin(still, 60, 1)}>
        {Array.from({ length: 16 }, (_, i) => {
          const deg = i * 22.5;
          const [x1, y1] = polar(42, deg);
          const [x2, y2] = polar(i % 2 ? 150 : 120, deg);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={i % 4 === 0 ? GOLD : TEAL} strokeWidth={i % 4 === 0 ? 1.4 : 0.7} opacity="0.5" />
          );
        })}
      </motion.g>
      <motion.path d={circlePath(155)} stroke={TEAL} strokeWidth="0.6" {...draw(still, { delay: 0.4, opacity: 0.3 })} />
      <circle cx={C} cy={C} r="5" fill={GOLD} />
    </g>
  );
}

function figAbout(still) {
  return (
    <g fill="none">
      <motion.path d={circlePath(150)} stroke={TEAL} strokeWidth="1" {...draw(still, { delay: 0.1, opacity: 0.3 })} />
      <motion.g {...spin(still, 50, 1)}>
        <rect x="80" y="80" width="240" height="240" stroke={GOLD} strokeWidth="1" opacity="0.5" />
      </motion.g>
      <motion.g {...spin(still, 50, -1)}>
        <rect x="80" y="80" width="240" height="240" stroke={OCHRE} strokeWidth="1" opacity="0.35"
          transform={`rotate(45 ${C} ${C})`} />
      </motion.g>
      <motion.g {...spin(still, 80, 1)}>
        <rect x="120" y="120" width="160" height="160" stroke={TEAL} strokeWidth="0.7" opacity="0.4"
          transform={`rotate(22.5 ${C} ${C})`} />
      </motion.g>
      <motion.circle cx={C} cy={C} r="10" fill={GOLD}
        {...breathe(still, { duration: 5, scaleTo: 1.15, from: 0.6, to: 1 })} />
    </g>
  );
}

function figPricing(still) {
  const bars = [
    { y: 250, w: 70, c: TEAL, o: 0.4 },
    { y: 210, w: 110, c: GOLD, o: 0.6 },
    { y: 170, w: 150, c: OCHRE, o: 0.5 },
    { y: 130, w: 200, c: GOLD, o: 0.85 },
  ];
  return (
    <g fill="none">
      <line x1="110" y1="290" x2="320" y2="290" stroke={TEAL} strokeWidth="1" opacity="0.3" />
      {bars.map((b, i) => (
        <motion.rect key={i} x="110" y={b.y} width={b.w} height="24" rx="4" fill={b.c}
          style={{ originX: '110px' }}
          initial={still ? false : { scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: b.o }}
          transition={still ? { duration: 0 } : { delay: 0.2 + i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
      ))}
      <motion.rect x="110" y="130" width="200" height="24" rx="4" fill={GOLD}
        animate={still ? { opacity: 0 } : { opacity: [0, 0.25, 0] }}
        transition={still ? undefined : { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }} />
    </g>
  );
}

function figStories(still) {
  const circles = [
    { cx: 160, cy: 170, r: 70, c: GOLD, amp: -8, dur: 6, delay: 0 },
    { cx: 250, cy: 180, r: 80, c: TEAL, amp: 10, dur: 7, delay: 0.5 },
    { cx: 200, cy: 250, r: 60, c: OCHRE, amp: -6, dur: 5.5, delay: 1 },
  ];
  return (
    <g fill="none">
      {circles.map((c, i) => (
        <motion.circle key={i} cx={c.cx} cy={c.cy} r={c.r} stroke={c.c} strokeWidth="1.2" opacity="0.45"
          animate={still ? undefined : { y: [0, c.amp, 0], x: [0, c.amp / 2, 0] }}
          transition={still ? undefined : { duration: c.dur, repeat: Infinity, ease: 'easeInOut', delay: c.delay }} />
      ))}
      {[[205, 175], [225, 215], [180, 215]].map(([x, y], i) => (
        <motion.circle key={`d${i}`} cx={x} cy={y} r="3.5" fill={GOLD}
          animate={still ? undefined : { opacity: [0.4, 1, 0.4] }}
          transition={still ? undefined : { duration: 3, repeat: Infinity, delay: i * 0.6 }} />
      ))}
    </g>
  );
}

function figGallery(still) {
  const cells = [];
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      cells.push({ x: 110 + col * 50, y: 110 + row * 50, i: row * 4 + col });
    }
  }
  return (
    <g fill="none">
      {cells.map((c) => (
        <rect key={c.i} x={c.x} y={c.y} width="38" height="38" rx="4" stroke={TEAL} strokeWidth="0.8" opacity="0.28" />
      ))}
      <motion.g
        animate={still ? { x: 0, y: 0 } : { x: [0, 100, 150, 50, 0], y: [0, 50, 150, 100, 0] }}
        transition={still ? { duration: 0 } : { duration: 9, repeat: Infinity, ease: 'easeInOut', times: [0, 0.25, 0.5, 0.75, 1] }}>
        <rect x="110" y="110" width="38" height="38" rx="4" fill={GOLD} opacity="0.6" />
      </motion.g>
    </g>
  );
}

function figVolunteer(still) {
  return (
    <g fill="none">
      <motion.path d={circlePath(150)} stroke={TEAL} strokeWidth="0.6" {...draw(still, { delay: 0.2, opacity: 0.25 })} />
      <motion.g {...spin(still, 34, 1)}>
        <polygon points={triPoints(130, -90)} stroke={GOLD} strokeWidth="1.4" opacity="0.6" />
      </motion.g>
      <motion.g {...spin(still, 34, -1)}>
        <polygon points={triPoints(130, 90)} stroke={OCHRE} strokeWidth="1.4" opacity="0.5" />
      </motion.g>
      <motion.g {...spin(still, 60, 1)}>
        <polygon points={triPoints(75, -90)} stroke={TEAL} strokeWidth="0.8" opacity="0.5" />
      </motion.g>
      <motion.circle cx={C} cy={C} r="6" fill={GOLD}
        {...breathe(still, { duration: 4, scaleTo: 1.2, from: 0.7, to: 1 })} />
    </g>
  );
}

function figContact(still) {
  return (
    <g fill="none">
      <circle cx={C} cy={C} r="130" stroke={TEAL} strokeWidth="0.8" opacity="0.25" />
      <circle cx={C} cy={C} r="90" stroke={GOLD} strokeWidth="1" opacity="0.35" />
      <line x1="40" y1={C} x2="360" y2={C} stroke={TEAL} strokeWidth="0.5" opacity="0.2" />
      <line x1={C} y1="40" x2={C} y2="360" stroke={TEAL} strokeWidth="0.5" opacity="0.2" />
      <motion.circle cx={C} cy={C} r="50" stroke={GOLD} strokeWidth="1.2" opacity="0.4"
        style={{ originX: `${C}px`, originY: `${C}px` }}
        animate={still ? undefined : { scale: [0.6, 1, 0.6], opacity: [0.6, 0.1, 0.6] }}
        transition={still ? undefined : { duration: 5, repeat: Infinity, ease: 'easeInOut' }} />
      <circle cx={C} cy={C} r="5" fill={GOLD} />
    </g>
  );
}

/* ── dispatch ── */
export const HERO_FIGURE = {
  HOME: 'home',
  RETREAT: 'retreat',
  EXPERIENCE: 'experience',
  ABOUT: 'about',
  PRICING: 'pricing',
  STORIES: 'stories',
  GALLERY: 'gallery',
  VOLUNTEER: 'volunteer',
  CONTACT: 'contact',
};

const BUILDERS = {
  home: figHome,
  retreat: figRetreat,
  experience: figExperience,
  about: figAbout,
  pricing: figPricing,
  stories: figStories,
  gallery: figGallery,
  volunteer: figVolunteer,
  contact: figContact,
};

export function renderHeroFigure(variant, still) {
  const build = BUILDERS[variant] || figHome;
  return build(still);
}
