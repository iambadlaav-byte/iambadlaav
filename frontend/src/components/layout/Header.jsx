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
  { label: 'The Badlaav Experience', href: '/badlaav-experience' },
  { label: 'Pricing',     href: '/pricing' },
  { label: 'About',       href: '/about' },
  { label: 'Gallery',     href: '/gallery' },
  { label: 'Volunteer',   href: '/volunteer' },
  { label: 'Contact',     href: '/contact' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-ochre text-pearl shadow-md">
        <div className="max-w-default mx-auto px-4 flex items-center justify-between h-[72px]">

          {/* Logo */}
          <Link to="/" className="flex items-center" aria-label="Badlaav — home">
            <img
              src="/images/badlaav-logo-white.png"
              alt="Badlaav"
              className="h-9 w-auto"
            />
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-6" aria-label="Main navigation">
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
              className="hidden lg:inline-flex items-center px-5 py-2 bg-pearl text-ochre font-sans font-semibold text-sm rounded-full hover:bg-pearl/90 transition-colors"
            >
              Register
            </Link>
            <button
              className="lg:hidden text-pearl p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
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
