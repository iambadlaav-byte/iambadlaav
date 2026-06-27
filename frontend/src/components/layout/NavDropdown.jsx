/**
 * NavDropdown — desktop top-nav dropdown trigger + panel.
 * Used by Header to collapse the two programme links under one "Programmes" item.
 * Accessible: opens on click/Enter, on hover for pointer users, closes on
 * Escape, outside click, and blur out of the group. Items are real <NavLink>s.
 * NO inline styles (CONSTRAINT-CODE-001).
 */
import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../lib/cn.js';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';

export default function NavDropdown({ label, items = [] }) {
  const [open, setOpen] = useState(false);
  const groupRef = useRef(null);
  const { pathname } = useLocation();
  const reduce = useReducedMotion();

  // Panel grows out of the bar (fade + slide-down + scale-from-top); items
  // cascade in. Reduced motion → a quick fade, no transform. transform/opacity
  // only (CONSTRAINT-CODE-004).
  const panelVariants = reduce
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.1 } }, exit: { opacity: 0, transition: { duration: 0.1 } } }
    : {
        hidden: { opacity: 0, y: -8, scale: 0.96 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.045, delayChildren: 0.02 } },
        exit: { opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.14 } },
      };
  const itemVariants = reduce
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : { hidden: { opacity: 0, x: -6 }, visible: { opacity: 1, x: 0, transition: { duration: 0.18, ease: 'easeOut' } } };

  const isActiveGroup = items.some((item) => pathname.startsWith(item.href));

  // Close when route changes (a link inside was followed).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return undefined;
    const handlePointer = (event) => {
      if (groupRef.current && !groupRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointer);
    return () => document.removeEventListener('mousedown', handlePointer);
  }, [open]);

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  // Close when focus leaves the whole group (keyboard tab-out / blur).
  const handleBlur = (event) => {
    if (groupRef.current && !groupRef.current.contains(event.relatedTarget)) {
      setOpen(false);
    }
  };

  return (
    <div
      ref={groupRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        className={cn(
          'flex items-center gap-1 font-sans text-sm transition-colors py-1 border-b-2',
          isActiveGroup
            ? 'text-gold border-gold'
            : 'text-pearl/80 hover:text-pearl border-transparent',
        )}
      >
        {label}
        <ChevronDown
          size={14}
          aria-hidden="true"
          className={cn('transition-transform', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute left-0 top-full pt-2 z-50 min-w-[14rem] origin-top"
            role="menu"
            aria-label={label}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="bg-ember rounded-xl shadow-xl ring-1 ring-pearl/10 py-2">
              {items.map((item) => (
                <motion.div key={item.href} variants={itemVariants}>
                  <NavLink
                    to={item.href}
                    role="menuitem"
                    className={({ isActive }) =>
                      cn(
                        'block mx-1.5 rounded-lg px-3.5 py-2.5 font-sans text-sm transition-colors',
                        isActive
                          ? 'text-gold bg-pearl/5'
                          : 'text-pearl/80 hover:text-pearl hover:bg-pearl/10',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
