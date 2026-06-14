/**
 * BadlaavHero — Custom hero for /badlaav page only.
 * Left: headline, sub-headline, CTAs.
 * Right: animated SVG geometric visualization — minimal, strategic, data-driven.
 * Uses Framer Motion for smooth, performant SVG path animations.
 * No GSAP dependency — Framer Motion is already in the project.
 */
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/* ─── SVG constants ─────────────────────────────── */
const CX = 250; // SVG centre x
const CY = 250; // SVG centre y

/* Draw a full circle path string */
function circlePath(cx, cy, r) {
  return `M ${cx - r} ${cy}
    a ${r} ${r} 0 1 1 ${r * 2} 0
    a ${r} ${r} 0 1 1 ${-r * 2} 0`;
}

/* Arc from angle a1 to a2 (degrees) on circle of radius r around (cx, cy) */
function arcPath(cx, cy, r, a1, a2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(a1));
  const y1 = cy + r * Math.sin(toRad(a1));
  const x2 = cx + r * Math.cos(toRad(a2));
  const y2 = cy + r * Math.sin(toRad(a2));
  const large = a2 - a1 > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

/* ─── Animated SVG ─────────────────────────────── */
export function GeometricViz({ hovered = false }) {
  const prefersReduced = useReducedMotion();

  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (custom) => ({
      pathLength: 1,
      opacity: custom.opacity ?? 1,
      transition: {
        pathLength: {
          delay: custom.delay ?? 0,
          duration: custom.duration ?? 2.5,
          ease: 'easeInOut',
        },
        opacity: {
          delay: custom.delay ?? 0,
          duration: 0.4,
        },
      },
    }),
  };

  const spinVariants = {
    animate: (custom) => ({
      rotate: custom.dir === -1 ? -360 : 360,
      transition: {
        duration: hovered ? (custom.dur ?? 20) * 0.5 : (custom.dur ?? 20),
        ease: 'linear',
        repeat: Infinity,
      },
    }),
  };

  const floatVariants = {
    animate: (custom) => ({
      y: hovered ? [0, (custom.amp ?? -8) * 1.5, 0] : [0, custom.amp ?? -8, 0],
      opacity: hovered ? [0.8, 1, 0.8] : [0.6, 1, 0.6],
      transition: {
        duration: hovered ? (custom.dur ?? 4) * 0.7 : (custom.dur ?? 4),
        ease: 'easeInOut',
        repeat: Infinity,
        delay: custom.delay ?? 0,
      },
    }),
  };

  const pulseVariants = {
    animate: {
      scale: hovered ? [1, 1.15, 1] : [1, 1.06, 1],
      opacity: hovered ? [0.6, 1, 0.6] : [0.5, 0.9, 0.5],
      transition: { 
        duration: hovered ? 1.5 : 3, 
        ease: 'easeInOut', 
        repeat: Infinity 
      },
    },
  };

  if (prefersReduced) {
    return (
      <svg viewBox="0 0 500 500" className="w-full h-full" aria-hidden="true">
        <circle cx={CX} cy={CY} r="160" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <circle cx={CX} cy={CY} r="100" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 500 500"
      className="w-full h-full"
      aria-hidden="true"
      style={{ color: 'rgb(var(--color-gold))' }}
    >
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgb(var(--color-gold))" stopOpacity="0.15" />
          <stop offset="100%" stopColor="rgb(var(--color-gold))" stopOpacity="0" />
        </radialGradient>
        <filter id="blur-sm">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>

      {/* Glow backdrop */}
      <ellipse cx={CX} cy={CY} rx="170" ry="170" fill="url(#glow)" />

      {/* ── Outer rings (spinning) ── */}
      <motion.g
        style={{ originX: `${CX}px`, originY: `${CY}px` }}
        variants={spinVariants}
        animate="animate"
        custom={{ dur: 36, dir: 1 }}
      >
        {/* Dashed outer circle */}
        <motion.circle
          cx={CX} cy={CY} r="200"
          fill="none"
          stroke="rgb(var(--color-teal-light))"
          strokeWidth="0.4"
          strokeDasharray="4 12"
          variants={pathVariants}
          initial="hidden"
          animate="visible"
          custom={{ delay: 0.2, duration: 2, opacity: 0.25 }}
        />
      </motion.g>

      <motion.g
        style={{ originX: `${CX}px`, originY: `${CY}px` }}
        variants={spinVariants}
        animate="animate"
        custom={{ dur: 28, dir: -1 }}
      >
        {/* Main ring */}
        <motion.path
          d={circlePath(CX, CY, 160)}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
          opacity="0.35"
          variants={pathVariants}
          initial="hidden"
          animate="visible"
          custom={{ delay: 0.1, duration: 3, opacity: 0.35 }}
        />
        {/* Tick marks on main ring */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x1 = CX + 155 * Math.cos(angle);
          const y1 = CY + 155 * Math.sin(angle);
          const x2 = CX + 165 * Math.cos(angle);
          const y2 = CY + 165 * Math.sin(angle);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
          );
        })}
      </motion.g>

      {/* ── Arc segments (draw-in) ── */}
      <motion.path
        d={arcPath(CX, CY, 130, -90, 30)}
        fill="none" stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round"
        variants={pathVariants}
        initial="hidden"
        animate="visible"
        custom={{ delay: 0.5, duration: 2.2, opacity: 0.9 }}
      />
      <motion.path
        d={arcPath(CX, CY, 130, 60, 160)}
        fill="none" stroke="rgb(var(--color-ochre))" strokeWidth="1.5"
        strokeLinecap="round"
        variants={pathVariants}
        initial="hidden"
        animate="visible"
        custom={{ delay: 0.8, duration: 2, opacity: 0.7 }}
      />
      <motion.path
        d={arcPath(CX, CY, 130, 190, 300)}
        fill="none" stroke="rgb(var(--color-teal-light))" strokeWidth="1"
        strokeLinecap="round"
        variants={pathVariants}
        initial="hidden"
        animate="visible"
        custom={{ delay: 1.1, duration: 1.8, opacity: 0.5 }}
      />

      {/* ── Middle ring (slow spin) ── */}
      <motion.g
        style={{ originX: `${CX}px`, originY: `${CY}px` }}
        variants={spinVariants}
        animate="animate"
        custom={{ dur: 50, dir: 1 }}
      >
        <motion.circle
          cx={CX} cy={CY} r="95"
          fill="none" stroke="currentColor" strokeWidth="0.5"
          strokeDasharray="2 18"
          variants={pathVariants}
          initial="hidden"
          animate="visible"
          custom={{ delay: 0.6, duration: 2, opacity: 0.3 }}
        />
        {/* Small diamonds on mid ring */}
        {[0, 90, 180, 270].map((deg, i) => {
          const angle = (deg * Math.PI) / 180;
          const dx = CX + 95 * Math.cos(angle);
          const dy = CY + 95 * Math.sin(angle);
          return (
            <rect key={i}
              x={dx - 3} y={dy - 3} width="6" height="6"
              transform={`rotate(45 ${dx} ${dy})`}
              fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6"
            />
          );
        })}
      </motion.g>

      {/* ── Cross-hair lines (draw-in) ── */}
      {[
        { x1: CX - 180, y1: CY, x2: CX + 180, y2: CY, delay: 0.3 },
        { x1: CX, y1: CY - 180, x2: CX, y2: CY + 180, delay: 0.4 },
        { x1: CX - 130, y1: CY - 130, x2: CX + 130, y2: CY + 130, delay: 0.9 },
        { x1: CX + 130, y1: CY - 130, x2: CX - 130, y2: CY + 130, delay: 1.0 },
      ].map((l, i) => (
        <motion.line
          key={i}
          x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke="currentColor" strokeWidth="0.3" opacity="0.2"
          variants={pathVariants}
          initial="hidden"
          animate="visible"
          custom={{ delay: l.delay, duration: 1.5, opacity: 0.2 }}
        />
      ))}

      {/* ── Diagonal strategic lines ── */}
      {[
        { d: `M ${CX} ${CY - 130} L ${CX + 112} ${CY + 65}`, delay: 1.3, color: 'currentColor', opacity: 0.15 },
        { d: `M ${CX} ${CY - 130} L ${CX - 112} ${CY + 65}`, delay: 1.4, color: 'currentColor', opacity: 0.15 },
        { d: `M ${CX - 112} ${CY + 65} L ${CX + 112} ${CY + 65}`, delay: 1.5, color: 'currentColor', opacity: 0.15 },
      ].map((p, i) => (
        <motion.path
          key={i} d={p.d} fill="none"
          stroke={p.color} strokeWidth="0.5"
          variants={pathVariants}
          initial="hidden"
          animate="visible"
          custom={{ delay: p.delay, duration: 1.4, opacity: p.opacity }}
        />
      ))}

      {/* ── Centre core ── */}
      <motion.g variants={pulseVariants} animate="animate"
        style={{ originX: `${CX}px`, originY: `${CY}px` }}>
        <circle cx={CX} cy={CY} r="28"
          fill="rgb(var(--color-gold))" opacity="0.08" />
        <circle cx={CX} cy={CY} r="16"
          fill="rgb(var(--color-gold))" opacity="0.15" />
      </motion.g>
      <motion.circle
        cx={CX} cy={CY} r="5"
        fill="currentColor"
        variants={pathVariants}
        initial="hidden"
        animate="visible"
        custom={{ delay: 1.8, duration: 0.5, opacity: 1 }}
      />

      {/* ── Floating data nodes (orbit dots) ── */}
      {[
        { r: 130, angle: -90, amp: -6, dur: 3.5, delay: 0 },
        { r: 130, angle: 30, amp: -8, dur: 4.2, delay: 0.8 },
        { r: 130, angle: 150, amp: -5, dur: 5, delay: 1.4 },
        { r: 130, angle: 240, amp: -7, dur: 3.8, delay: 0.4 },
        { r: 95, angle: 45, amp: -4, dur: 4.5, delay: 0.2 },
        { r: 95, angle: 225, amp: -6, dur: 3.2, delay: 1.0 },
      ].map((node, i) => {
        const angle = (node.angle * Math.PI) / 180;
        const nx = CX + node.r * Math.cos(angle);
        const ny = CY + node.r * Math.sin(angle);
        const isGold = i % 2 === 0;
        return (
          <motion.g key={i} variants={floatVariants} animate="animate"
            custom={{ amp: node.amp, dur: node.dur, delay: node.delay }}>
            <circle cx={nx} cy={ny} r={i < 4 ? 4 : 3}
              fill={isGold ? 'rgb(var(--color-gold))' : 'rgb(var(--color-teal-light))'}
              opacity="0.9"
            />
            {/* Radial connector */}
            <line x1={CX} y1={CY} x2={nx} y2={ny}
              stroke="currentColor" strokeWidth="0.3" opacity="0.12" />
          </motion.g>
        );
      })}

      {/* ── Outer corner markers ── */}
      {[
        { x: 30, y: 30 }, { x: 470, y: 30 },
        { x: 30, y: 470 }, { x: 470, y: 470 },
      ].map(({ x, y }, i) => (
        <motion.g key={i}
          variants={pathVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          custom={{ delay: 1.6 + i * 0.1, duration: 0.6, opacity: hovered ? 0.6 : 0.3 }}
          animate={{ opacity: hovered ? 0.6 : 0.3 }}
        >
          <line x1={x} y1={y} x2={x + (x < 250 ? 16 : -16)} y2={y}
            stroke="currentColor" strokeWidth="1" />
          <line x1={x} y1={y} x2={x} y2={y + (y < 250 ? 16 : -16)}
            stroke="currentColor" strokeWidth="1" />
        </motion.g>
      ))}

      {/* ── Small grid dots (background texture) ── */}
      {Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 5 }, (_, col) => {
          const gx = 100 + col * 75;
          const gy = 100 + row * 75;
          const dist = Math.sqrt((gx - CX) ** 2 + (gy - CY) ** 2);
          if (dist < 50 || dist > 200) return null;
          return (
            <circle key={`${row}-${col}`} cx={gx} cy={gy} r="1"
              fill="currentColor" opacity="0.12" />
          );
        })
      )}
    </svg>
  );
}


