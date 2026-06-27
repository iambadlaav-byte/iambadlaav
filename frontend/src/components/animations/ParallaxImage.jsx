import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';

export function ParallaxImage({
  src,
  alt,
  className = "",
  offset = 50,
  containerClassName = "",
}) {
  const ref = useRef(null);
  const noMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);

  // Reduced motion: render a plain, static image (no scroll-driven transform).
  if (noMotion) {
    return (
      <div ref={ref} className={`overflow-hidden relative ${containerClassName}`}>
        <img src={src} alt={alt} className={`object-cover w-full h-full absolute inset-0 ${className}`} />
      </div>
    );
  }

  return (
    <div ref={ref} className={`overflow-hidden relative ${containerClassName}`}>
      <motion.img
        src={src}
        alt={alt}
        style={{ y, scale: 1.15 }} // scale up to prevent edges showing during parallax
        className={`object-cover w-full h-full absolute inset-0 ${className}`}
      />
    </div>
  );
}
