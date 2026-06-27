import { motion } from 'framer-motion';

export function ScaleOnHover({ children, className = "", scale = 1.02 }) {
  return (
    <motion.div
      whileHover={{ scale }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
