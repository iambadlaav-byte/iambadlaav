import { motion, useReducedMotion } from 'framer-motion';

export function JoinViz({ hovered = false }) {
  const prefersReduced = useReducedMotion();

  const drawVariants = {
    animate: (custom) => ({
      pathLength: [0, 1, 1, 0],
      opacity: [0, custom.opacity ?? 0.4, 0, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        delay: custom.delay ?? 0,
        ease: 'easeInOut'
      },
    }),
  };

  const nodeVariants = {
    animate: (custom) => ({
      scale: hovered ? [1, 1.3, 1] : [1, 1.15, 1],
      opacity: hovered ? [0.9, 1, 0.9] : [0.6, 1, 0.6],
      x: [0, custom.dx ?? 4, 0],
      y: [0, custom.dy ?? -4, 0],
      transition: { duration: (custom.dur ?? 4) * 0.5, repeat: Infinity, delay: custom.delay ?? 0, ease: 'easeInOut' }
    })
  };

  const centerPulseVariants = {
    animate: {
      scale: hovered ? [1, 1.15, 1] : [1, 1.05, 1],
      opacity: hovered ? [0.8, 1, 0.8] : [0.5, 0.8, 0.5],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
    }
  };

  const rotateVariants = {
    animate: {
      rotate: [0, 360],
      transition: { duration: 20, repeat: Infinity, ease: 'linear' }
    }
  };

  if (prefersReduced) {
    return (
      <svg viewBox="0 0 500 500" className="w-full h-full" aria-hidden="true">
        <circle cx="250" cy="250" r="100" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      </svg>
    );
  }

  const CX = 250;
  const CY = 250;

  // Peripheral nodes forming a community / network
  const nodes = [
    { x: 120, y: 150, delay: 0.2, dur: 3.5, dx: 4, dy: -6, color: 'rgb(var(--color-gold))' },
    { x: 380, y: 120, delay: 0.6, dur: 4.2, dx: -5, dy: 4, color: 'rgb(var(--color-teal-light))' },
    { x: 100, y: 350, delay: 1.0, dur: 3.8, dx: 6, dy: 5, color: 'rgb(var(--color-ochre))' },
    { x: 400, y: 380, delay: 1.4, dur: 4.5, dx: -4, dy: -5, color: 'rgb(var(--color-gold))' },
    { x: 250, y: 60, delay: 1.8, dur: 3.2, dx: 0, dy: -6, color: 'currentColor' },
    { x: 250, y: 440, delay: 2.2, dur: 4.0, dx: 0, dy: 5, color: 'rgb(var(--color-teal-light))' },
    { x: 60, y: 250, delay: 2.6, dur: 3.6, dx: -6, dy: 0, color: 'rgb(var(--color-ochre))' },
    { x: 440, y: 250, delay: 3.0, dur: 4.8, dx: 5, dy: 0, color: 'currentColor' },
  ];

  return (
    <svg
      viewBox="0 0 500 500"
      className="w-full h-full"
      aria-hidden="true"
      style={{ color: 'rgb(var(--color-teal-light))' }}
    >
      <defs>
        <radialGradient id="joinGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgb(var(--color-gold))" stopOpacity={hovered ? "0.2" : "0.1"} />
          <stop offset="100%" stopColor="rgb(var(--color-gold))" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient background glow */}
      <motion.ellipse
        cx={CX} cy={CY} rx="180" ry="180"
        fill="url(#joinGlow)"
        variants={centerPulseVariants}
        animate="animate"
      />

      {/* Orbit paths */}
      <motion.g
        style={{ originX: `${CX}px`, originY: `${CY}px` }}
        variants={rotateVariants}
        animate="animate"
      >
        <circle cx={CX} cy={CY} r="140" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" strokeDasharray="4 8" />
        <circle cx={CX} cy={CY} r="200" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.1" strokeDasharray="2 12" />
      </motion.g>

      {/* Connections pulling into the center */}
      {nodes.map((n, i) => (
        <motion.line
          key={`line-${i}`}
          x1={n.x} y1={n.y} x2={CX} y2={CY}
          stroke={n.color} strokeWidth="1"
          variants={drawVariants}
          animate="animate"
          custom={{ delay: n.delay, opacity: 0.5 }}
        />
      ))}

      {/* Cross connections between adjacent nodes to form a web */}
      {nodes.map((n, i) => {
        const nextNode = nodes[(i + 1) % nodes.length];
        return (
          <motion.line
            key={`cross-${i}`}
            x1={n.x} y1={n.y} x2={nextNode.x} y2={nextNode.y}
            stroke="currentColor" strokeWidth="0.5"
            variants={drawVariants}
            animate="animate"
            custom={{ delay: n.delay + 0.5, opacity: 0.2 }}
          />
        );
      })}

      {/* The nodes themselves */}
      {nodes.map((n, i) => (
        <motion.g
          key={`node-${i}`}
          variants={nodeVariants}
          animate="animate"
          custom={{ delay: n.delay, dur: n.dur }}
        >
          <circle cx={n.x} cy={n.y} r="8" fill="rgb(var(--color-ink))" stroke={n.color} strokeWidth="2" />
          <circle cx={n.x} cy={n.y} r="3" fill={n.color} opacity="0.7" />
        </motion.g>
      ))}

      {/* The Central Community Node */}
      <motion.g
        variants={centerPulseVariants}
        animate="animate"
      >
        <circle cx={CX} cy={CY} r="24" fill="rgb(var(--color-ink))" stroke="rgb(var(--color-gold))" strokeWidth="1.5" opacity="0.8" />
        <circle cx={CX} cy={CY} r="18" fill="rgb(var(--color-gold))" opacity="0.1" />
        <circle cx={CX} cy={CY} r="8" fill="rgb(var(--color-gold))" />
      </motion.g>

    </svg>
  );
}
