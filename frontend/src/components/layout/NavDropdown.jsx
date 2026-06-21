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
import { cn } from '../../lib/cn.js';

export default function NavDropdown({ label, items = [] }) {
  const [open, setOpen] = useState(false);
  const groupRef = useRef(null);
  const { pathname } = useLocation();

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

      {open && (
        <div
          className="absolute left-0 top-full pt-2 z-50 min-w-[14rem]"
          role="menu"
          aria-label={label}
        >
          <div className="bg-ink rounded-lg shadow-lg border border-pearl/10 py-2">
            {items.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                role="menuitem"
                className={({ isActive }) =>
                  cn(
                    'block px-4 py-2.5 font-sans text-sm transition-colors',
                    isActive
                      ? 'text-gold'
                      : 'text-pearl/80 hover:text-pearl hover:bg-pearl/5',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
