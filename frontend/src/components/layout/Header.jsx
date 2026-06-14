/**
 * Header — desktop top bar + mobile hamburger trigger.
 * Deep-forest background, 72px height, gold-accent active route indicator.
 * On mobile (<768px): shows logo + hamburger; MobileNav handles the rest.
 * NO inline styles (CONSTRAINT-CODE-001).
 */
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import MobileNav from './MobileNav.jsx';

const NAV_LINKS = [
  { label: 'The Retreat', href: '/retreat' },
  { label: 'Pricing',     href: '/pricing' },
  { label: 'About',       href: '/about' },
  { label: 'Gallery',     href: '/gallery' },
  { label: 'Contact',     href: '/contact' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-navy text-pearl shadow-md">
        <div className="max-w-default mx-auto px-4 flex items-center justify-between h-[72px]">

          {/* Logo */}
          <Link
            to="/"
            className="font-display text-2xl font-medium text-pearl hover:text-gold transition-colors tracking-wide"
          >
            Badlaav
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  cn(
                    'font-sans text-sm transition-colors py-1 border-b-2',
                    isActive
                      ? 'text-gold border-gold'
                      : 'text-pearl/80 hover:text-pearl border-transparent',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-3">
            <Link
              to="/register?program=badlaav"
              className="hidden md:inline-flex items-center px-4 py-2 bg-gold text-on-gold font-sans font-medium text-sm rounded hover:bg-gold/90 transition-colors"
            >
              Register
            </Link>
            <button
              className="md:hidden text-pearl p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile navigation drawer */}
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} links={NAV_LINKS} />
    </>
  );
}
