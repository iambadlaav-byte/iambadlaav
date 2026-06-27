import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';

export function SlideUp({ children, delay = 0, className = "", duration = 0.8, yOffset = 40 }) {
  const noMotion = useReducedMotion();

  // Reduced motion: render children statically (no fade / slide).
  if (noMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1], // Custom ease-out curve
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
