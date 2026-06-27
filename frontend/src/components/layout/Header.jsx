/**
 * Header — desktop top bar + mobile hamburger trigger.
 * Terracotta bar; once the page scrolls it condenses into a translucent,
 * blurred surface with a stronger shadow and a slightly smaller logo for a
 * calmer, more premium feel (no layout shift — only paint/transform change).
 * On mobile (<768px): shows logo + hamburger; MobileNav handles the rest.
 * NO inline styles (CONSTRAINT-CODE-001).
 */
import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { HEADER_SCROLL_THRESHOLD } from '../../lib/constants.js';
import MobileNav from './MobileNav.jsx';
import NavDropdown from './NavDropdown.jsx';

// The two programmes live under one "Programmes" dropdown to save top-bar space.
const PROGRAMME_LINKS = [
  { label: 'The Retreat', href: '/retreat' },
  { label: 'The Badlaav Experience', href: '/badlaav-experience' },
];

const NAV_LINKS = [
  { label: 'Programmes', dropdown: PROGRAMME_LINKS },
  { label: 'Pricing',   href: '/pricing' },
  { label: 'About',     href: '/about' },
  { label: 'Stories',   href: '/stories' },
  { label: 'Gallery',   href: '/gallery' },
  { label: 'Volunteer', href: '/volunteer' },
  { label: 'Contact',   href: '/contact' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Condense the bar into a translucent, blurred surface once the page scrolls.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > HEADER_SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 text-pearl transition-[background-color,box-shadow,padding] duration-300',
          scrolled ? 'bg-transparent pt-3' : 'bg-ochre shadow-md',
        )}
      >
        {/* On scroll the bar contracts into a shorter, centered floating pill
            (still carries the logo). Heights are tuned so the total header box
            stays 72px — no layout shift, only paint/size change. */}
        <div
          className={cn(
            'mx-auto flex items-center justify-between transition-all duration-300',
            scrolled
              ? 'max-w-3xl px-5 h-[60px] rounded-full bg-ochre/90 backdrop-blur-md shadow-lg'
              : 'max-w-default px-4 h-[72px]',
          )}
        >

          {/* Logo */}
          <Link to="/" className="flex items-center" aria-label="Badlaav — home">
            <img
              src="/images/badlaav-logo-white.png"
              alt="Badlaav"
              className={cn(
                'h-12 sm:h-14 w-auto origin-left transition-transform duration-300',
                scrolled && 'scale-90',
              )}
            />
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-6" aria-label="Main navigation">
            {NAV_LINKS.map((link) =>
              link.dropdown ? (
                <NavDropdown key={link.label} label={link.label} items={link.dropdown} />
              ) : (
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
              ),
            )}
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
