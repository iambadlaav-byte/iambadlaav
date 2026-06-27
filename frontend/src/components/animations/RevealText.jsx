import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';

export function RevealText({ text, delay = 0, className = "" }) {
  const noMotion = useReducedMotion();

  // Reduced motion: render the text statically (no word stagger / fade-up).
  if (noMotion) {
    return <div className={className}>{text}</div>;
  }

  // If text is not a string (e.g. JSX elements), fallback to simple fade up
  if (typeof text !== 'string') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
        className={className}
      >
        {text}
      </motion.div>
    );
  }

  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: delay * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      {words.map((word, index) => (
        <motion.span
          variants={child}
          style={{ display: "inline-block", marginRight: "0.25em" }}
          key={index}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}
