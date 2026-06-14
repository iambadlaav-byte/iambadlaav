/**
 * StaggerChildren — wraps a list of children and staggers their FadeIn reveals.
 * Uses Framer Motion variants with staggerChildren: 0.1s.
 * Short-circuits when reduced-motion is active.
 */
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

/**
 * StaggerChildren wraps the container.
 * Wrap each child in <StaggerItem> to opt in to the stagger.
 */
export function StaggerChildren({ children, className, disabled = false }) {
  const noMotion = useReducedMotion(disabled);

  if (noMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerItem — individual child that participates in the stagger.
 */
export function StaggerItem({ children, className }) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
