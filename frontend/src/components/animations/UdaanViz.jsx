import { motion, useReducedMotion } from 'framer-motion';

export function UdaanViz({ hovered = false }) {
  const prefersReduced = useReducedMotion();

  // Slow, continuous rotation
  const spinVariants = {
    animate: (custom) => ({
      rotate: custom.dir === -1 ? -360 : 360,
      transition: {
        duration: hovered ? (custom.dur ?? 20) * 0.6 : (custom.dur ?? 20),
        ease: 'linear',
        repeat: Infinity,
      },
    }),
  };

  const pulseVariants = {
    animate: {
      scale: hovered ? [1, 1.08, 1] : [1, 1.03, 1],
      opacity: hovered ? [0.7, 1, 0.7] : [0.5, 0.8, 0.5],
      transition: { 
        duration: 4, 
        ease: 'easeInOut', 
        repeat: Infinity 
      },
    },
  };

  if (prefersReduced) {
    return (
      <svg viewBox="0 0 500 500" className="w-full h-full" aria-hidden="true">
        <circle cx="250" cy="250" r="150" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        <circle cx="250" cy="250" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
        <circle cx="250" cy="250" r="12" fill="currentColor" opacity="0.8" />
      </svg>
    );
  }

  const CX = 250;
  const CY = 250;

  return (
    <svg
      viewBox="0 0 500 500"
      className="w-full h-full"
      aria-hidden="true"
      style={{ color: 'rgb(var(--color-gold))' }}
    >
      <defs>
        <radialGradient id="focusGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgb(var(--color-ochre))" stopOpacity="0.25" />
          <stop offset="100%" stopColor="rgb(var(--color-ochre))" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Core glow representing clarity/focus */}
      <motion.ellipse 
        cx={CX} cy={CY} rx="160" ry="160" 
        fill="url(#focusGlow)" 
        variants={pulseVariants}
        animate="animate"
      />

      {/* Outer horizon ring (slowest) */}
      <motion.g
        style={{ originX: `${CX}px`, originY: `${CY}px` }}
        variants={spinVariants}
        animate="animate"
        custom={{ dur: 60, dir: 1 }}
      >
        <circle cx={CX} cy={CY} r="210" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.2" strokeDasharray="2 12" />
      </motion.g>

      {/* Outer focus ring (discipline / hours) */}
      <motion.g
        style={{ originX: `${CX}px`, originY: `${CY}px` }}
        variants={spinVariants}
        animate="animate"
        custom={{ dur: 45, dir: 1 }}
      >
        <circle cx={CX} cy={CY} r="180" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        {/* Tick marks representing discipline / hours */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 15 * Math.PI) / 180;
          const x1 = CX + 176 * Math.cos(angle);
          const y1 = CY + 176 * Math.sin(angle);
          const x2 = CX + 184 * Math.cos(angle);
          const y2 = CY + 184 * Math.sin(angle);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.8" opacity="0.4" />;
        })}
      </motion.g>

      {/* Middle orbital ring (consistency) */}
      <motion.g
        style={{ originX: `${CX}px`, originY: `${CY}px` }}
        variants={spinVariants}
        animate="animate"
        custom={{ dur: 35, dir: -1 }}
      >
        <circle cx={CX} cy={CY} r="130" fill="none" stroke="rgb(var(--color-teal-light))" strokeWidth="1" strokeDasharray="4 16" opacity="0.6" />
        <circle cx={CX} cy={CY - 130} r="5" fill="rgb(var(--color-teal-light))" opacity="0.9" />
        <circle cx={CX} cy={CY + 130} r="3" fill="rgb(var(--color-teal-light))" opacity="0.5" />
      </motion.g>

      {/* Inner lens/focus ring (concentration) */}
      <motion.g
        style={{ originX: `${CX}px`, originY: `${CY}px` }}
        variants={spinVariants}
        animate="animate"
        custom={{ dur: 25, dir: 1 }}
      >
        <circle cx={CX} cy={CY} r="80" fill="none" stroke="rgb(var(--color-ochre))" strokeWidth="1.5" strokeDasharray="70 25" opacity="0.7" />
        {/* Abstract lens crosshairs */}
        <line x1={CX - 80} y1={CY} x2={CX - 60} y2={CY} stroke="rgb(var(--color-ochre))" strokeWidth="1.5" opacity="0.8" />
        <line x1={CX + 60} y1={CY} x2={CX + 80} y2={CY} stroke="rgb(var(--color-ochre))" strokeWidth="1.5" opacity="0.8" />
        <line x1={CX} y1={CY - 80} x2={CX} y2={CY - 60} stroke="rgb(var(--color-ochre))" strokeWidth="1.5" opacity="0.8" />
        <line x1={CX} y1={CY + 60} x2={CX} y2={CY + 80} stroke="rgb(var(--color-ochre))" strokeWidth="1.5" opacity="0.8" />
      </motion.g>

      {/* Very center point - The Goal/Clarity */}
      <motion.circle 
        cx={CX} cy={CY} r="16" 
        fill="currentColor" 
        variants={pulseVariants}
        animate="animate"
        opacity="0.9"
      />
      <circle cx={CX} cy={CY} r="6" fill="rgb(var(--color-ink))" />

    </svg>
  );
}
