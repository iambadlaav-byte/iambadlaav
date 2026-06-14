import { motion, useReducedMotion } from 'framer-motion';

export function EnvironmentViz({ hovered = false }) {
  const prefersReduced = useReducedMotion();

  const drawVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (custom) => ({
      pathLength: 1,
      opacity: custom.opacity ?? 1,
      transition: {
        pathLength: { delay: custom.delay ?? 0, duration: custom.duration ?? 2, ease: 'easeInOut' },
        opacity: { delay: custom.delay ?? 0, duration: 0.8 },
      },
    }),
  };

  // Unified breathing for the "structured" environment
  const structuredVariants = {
    animate: (custom) => ({
      y: [0, -4, 0],
      opacity: hovered ? [0.6, 1, 0.6] : [0.4, 0.8, 0.4],
      scale: hovered ? [1, 1.15, 1] : [1, 1.05, 1],
      transition: {
        duration: 3.5,
        ease: 'easeInOut',
        repeat: Infinity,
        // Using a staggered delay based on row to create a gentle wave inside the structure
        delay: custom.delay ?? 0,
      },
    }),
  };

  // Chaotic floating for "unstructured" outside
  const chaoticVariants = {
    animate: (custom) => ({
      x: [0, custom.dx, 0],
      y: [0, custom.dy, 0],
      opacity: [0.15, 0.4, 0.15],
      transition: {
        duration: custom.dur,
        ease: 'easeInOut',
        repeat: Infinity,
        delay: custom.delay ?? 0,
      },
    }),
  };

  if (prefersReduced) {
    return (
      <svg viewBox="0 0 500 500" className="w-full h-full" aria-hidden="true">
        <rect x="150" y="150" width="200" height="200" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      </svg>
    );
  }

  // The "Environment" Boundary Box
  const boxSize = 220;
  const cx = 250;
  const cy = 250;
  const x0 = cx - boxSize / 2;
  const y0 = cy - boxSize / 2;

  // Grid points inside the environment (4x4 matrix)
  const gridSpacing = 40;
  const gridPoints = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      gridPoints.push({
        x: cx - 1.5 * gridSpacing + col * gridSpacing,
        y: cy - 1.5 * gridSpacing + row * gridSpacing,
        delay: row * 0.2 + col * 0.1,
      });
    }
  }

  // Random chaotic points outside
  const chaoticPoints = [
    { x: 50, y: 80, dx: 15, dy: 20, dur: 5, delay: 0 },
    { x: 420, y: 110, dx: -20, dy: 15, dur: 4.5, delay: 1 },
    { x: 100, y: 400, dx: 25, dy: -15, dur: 6, delay: 0.5 },
    { x: 450, y: 380, dx: -15, dy: -25, dur: 5.5, delay: 2 },
    { x: 250, y: 50, dx: 20, dy: 10, dur: 4, delay: 1.5 },
    { x: 80, y: 250, dx: 10, dy: -20, dur: 4.8, delay: 0.2 },
    { x: 400, y: 250, dx: -25, dy: 15, dur: 5.2, delay: 1.2 },
    { x: 250, y: 450, dx: -15, dy: -20, dur: 6.5, delay: 0.8 },
  ];

  return (
    <svg
      viewBox="0 0 500 500"
      className="w-full h-full"
      aria-hidden="true"
      style={{ color: 'rgb(var(--color-gold))' }}
    >
      <defs>
        <radialGradient id="envGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgb(var(--color-teal-light))" stopOpacity={hovered ? "0.15" : "0.1"} />
          <stop offset="100%" stopColor="rgb(var(--color-teal-light))" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background ambient glow inside the environment */}
      <motion.rect 
        x={x0 - 20} y={y0 - 20} width={boxSize + 40} height={boxSize + 40} 
        fill="url(#envGlow)" 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2, delay: 0.5 }}
      />

      {/* The Environment boundary lines */}
      <motion.path
        d={`M ${x0} ${y0 + 40} L ${x0} ${y0} L ${x0 + 40} ${y0}`}
        fill="none" stroke="currentColor" strokeWidth="1.5"
        variants={drawVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
        custom={{ delay: 0.2, duration: 1.5, opacity: 0.8 }}
      />
      <motion.path
        d={`M ${x0 + boxSize - 40} ${y0} L ${x0 + boxSize} ${y0} L ${x0 + boxSize} ${y0 + 40}`}
        fill="none" stroke="currentColor" strokeWidth="1.5"
        variants={drawVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
        custom={{ delay: 0.4, duration: 1.5, opacity: 0.8 }}
      />
      <motion.path
        d={`M ${x0 + boxSize} ${y0 + boxSize - 40} L ${x0 + boxSize} ${y0 + boxSize} L ${x0 + boxSize - 40} ${y0 + boxSize}`}
        fill="none" stroke="currentColor" strokeWidth="1.5"
        variants={drawVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
        custom={{ delay: 0.6, duration: 1.5, opacity: 0.8 }}
      />
      <motion.path
        d={`M ${x0 + 40} ${y0 + boxSize} L ${x0} ${y0 + boxSize} L ${x0} ${y0 + boxSize - 40}`}
        fill="none" stroke="currentColor" strokeWidth="1.5"
        variants={drawVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
        custom={{ delay: 0.8, duration: 1.5, opacity: 0.8 }}
      />

      {/* The faint boundary box connecting the corners */}
      <motion.rect
        x={x0} y={y0} width={boxSize} height={boxSize}
        fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 8"
        variants={drawVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
        custom={{ delay: 1.0, duration: 2, opacity: 0.3 }}
      />

      {/* Connecting abstract pathways drawing people into the environment */}
      {[
        { path: `M 50 80 Q 150 50 ${x0 + 40} ${y0}`, delay: 1.5 },
        { path: `M 420 110 Q 400 0 ${x0 + boxSize - 40} ${y0}`, delay: 1.8 },
        { path: `M 100 400 Q 50 350 ${x0} ${y0 + boxSize - 40}`, delay: 2.1 },
        { path: `M 450 380 Q 480 450 ${x0 + boxSize} ${y0 + boxSize - 40}`, delay: 1.2 },
      ].map((line, i) => (
        <motion.path
          key={`pull-${i}`}
          d={line.path}
          fill="none" stroke="rgb(var(--color-teal-light))" strokeWidth="0.5" strokeDasharray="2 6"
          variants={drawVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
          custom={{ delay: line.delay, duration: 2, opacity: 0.3 }}
        />
      ))}

      {/* Chaotic dots outside */}
      {chaoticPoints.map((pt, i) => (
        <motion.circle
          key={`chaos-${i}`}
          cx={pt.x} cy={pt.y} r="3"
          fill="currentColor"
          variants={chaoticVariants}
          animate="animate"
          custom={{ dx: pt.dx, dy: pt.dy, dur: pt.dur, delay: pt.delay }}
        />
      ))}

      {/* Structured, aligned grid dots inside the environment */}
      {gridPoints.map((pt, i) => (
        <motion.g
          key={`struct-${i}`}
          variants={structuredVariants}
          animate="animate"
          custom={{ delay: pt.delay }}
        >
          {/* Subtle connection lines forming the grid */}
          {i % 4 !== 3 && ( // Horizontal connects
            <line x1={pt.x} y1={pt.y} x2={pt.x + gridSpacing} y2={pt.y} stroke="rgb(var(--color-teal-light))" strokeWidth="0.5" opacity="0.3" />
          )}
          {i < 12 && ( // Vertical connects
            <line x1={pt.x} y1={pt.y} x2={pt.x} y2={pt.y + gridSpacing} stroke="rgb(var(--color-teal-light))" strokeWidth="0.5" opacity="0.3" />
          )}
          
          <circle cx={pt.x} cy={pt.y} r="4" fill="rgb(var(--color-gold))" />
          <circle cx={pt.x} cy={pt.y} r="8" fill="none" stroke="rgb(var(--color-teal-light))" strokeWidth="0.5" opacity="0.5" />
        </motion.g>
      ))}

    </svg>
  );
}
