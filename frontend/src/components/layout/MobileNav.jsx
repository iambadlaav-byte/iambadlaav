/**
 * MobileNav — slide-out drawer + sticky bottom bar.
 * Animation: transform: translateX (CONSTRAINT-CODE-004 — no width/height animation).
 * Respects prefers-reduced-motion via useReducedMotion.
 * NO inline styles (CONSTRAINT-CODE-001).
 */
import { Link, NavLink } from 'react-router-dom';
import { X, Phone, MessageCircle } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';
import { WHATSAPP_NUMBER, CONTACT_PHONE } from '../../lib/constants.js';

export default function MobileNav({ open, onClose, links = [] }) {
  const reduceMotion = useReducedMotion();

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-ink/50 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Slide-out drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-72 bg-ink z-50 md:hidden',
          'flex flex-col',
          reduceMotion
            ? (open ? 'translate-x-0' : 'translate-x-full')
            : 'transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
        aria-hidden={!open}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 h-[72px] border-b border-navy">
          <span className="font-display text-xl font-medium text-pearl">Badlaav</span>
          <button
            onClick={onClose}
            className="text-pearl/70 hover:text-pearl p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-5 py-6" aria-label="Mobile navigation">
          {links.map((link) =>
            link.dropdown ? (
              <div key={link.label} className="mb-2">
                <span className="font-mono text-xs uppercase tracking-widest text-muted block mb-2 mt-4">
                  {link.label}
                </span>
                {link.dropdown.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'block py-2 pl-3 font-sans text-sm border-l-2 transition-colors',
                        isActive
                          ? 'text-gold border-gold'
                          : 'text-pearl/70 hover:text-pearl border-transparent'
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            ) : (
              <NavLink
                key={link.href}
                to={link.href}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'block py-3 font-sans text-base border-b border-navy/50 transition-colors',
                    isActive ? 'text-gold' : 'text-pearl/80 hover:text-pearl'
                  )
                }
              >
                {link.label}
              </NavLink>
            )
          )}
        </nav>

        {/* CTA in drawer */}
        <div className="px-5 pb-24">
          <Link
            to="/contact"
            onClick={onClose}
            className="block w-full text-center px-5 py-3 bg-ochre text-on-ochre font-sans font-semibold rounded-full hover:bg-ochre/90 transition-colors"
          >
            Talk to Arjun Dada
          </Link>
        </div>
      </div>

      {/* Sticky bottom bar — always visible on mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden h-16 bg-navy border-t border-navy/50 flex items-center">
        <a
          href={`tel:+91${CONTACT_PHONE}`}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-pearl/70 hover:text-pearl transition-colors min-h-[44px]"
          aria-label="Call us"
        >
          <Phone size={18} />
          <span className="font-sans text-xs">Call</span>
        </a>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-pearl/70 hover:text-pearl transition-colors min-h-[44px]"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle size={18} />
          <span className="font-sans text-xs">WhatsApp</span>
        </a>
        <Link
          to="/register?program=badlaav"
          onClick={onClose}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 bg-ochre text-on-ochre hover:bg-ochre/90 transition-colors min-h-full"
        >
          <span className="font-sans text-sm font-semibold">Register</span>
        </Link>
      </div>
    </>
  );
}
