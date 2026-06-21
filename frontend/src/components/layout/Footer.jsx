/**
 * Footer — three-column desktop, stacked mobile. Warm cream background.
 * NO inline styles. NO forbidden phrases.
 */
import { Link } from 'react-router-dom';
import { Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { CONTACT_EMAIL, WHATSAPP_NUMBER, CONTACT_PHONE, MAP_LINK } from '../../lib/constants.js';
import { SITE, SOCIAL } from '../../lib/content.js';

// Main site navigation — kept distinct from the legal column below.
const EXPLORE_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Stories', href: '/stories' },
  { label: 'About', href: '/about' },
  { label: 'Volunteer', href: '/volunteer' },
  { label: 'Contact', href: '/contact' },
];

const PROGRAMME_LINKS = [
  { label: 'The Retreat', href: '/retreat' },
  { label: 'The Badlaav Experience', href: '/badlaav-experience' },
];

// Legal links live in their own column — never crammed in with the nav.
const LEGAL_LINKS = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Refund Policy', href: '/refund' },
  { label: 'Cookie Policy', href: '/cookies' },
  { label: 'Code of Conduct', href: '/code-of-conduct' },
];

const linkClass = 'font-sans text-sm text-charcoal/80 hover:text-teal transition-colors';

export default function Footer() {
  return (
    <footer className="bg-cream border-t border-soft">
      <div className="max-w-default mx-auto px-4 py-16 grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4 lg:grid-cols-12 lg:gap-x-10">

        {/* Brand + contact — wider lead column */}
        <div className="col-span-2 md:col-span-4 lg:col-span-4">
          <img
            src="/images/badlaav-logo.png"
            alt="Badlaav"
            className="h-14 w-auto"
          />
          <p className="font-mono text-xs uppercase tracking-widest text-muted mt-4 mb-4">
            {SITE.parent}
          </p>
          <p className="font-display text-lg text-ink mb-6">
            {SITE.tagline}
          </p>
          <address className="not-italic space-y-3 text-sm text-charcoal/80 font-sans">
            <a
              href={MAP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 hover:text-teal transition-colors"
            >
              <MapPin size={15} className="text-teal mt-0.5 shrink-0" />
              <span>Ambajogai, Dist. Beed, Maharashtra 431517</span>
            </a>
            <div className="flex items-center gap-2">
              <Mail size={15} className="text-teal shrink-0" />
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-teal hover:text-teal-light transition-colors"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={15} className="text-teal shrink-0" />
              <a
                href={`tel:+91${CONTACT_PHONE}`}
                className="text-teal hover:text-teal-light transition-colors"
              >
                {CONTACT_PHONE}
              </a>
            </div>
          </address>
          <div className="flex items-center gap-4 mt-5">
            <a
              href={SOCIAL.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-charcoal/80 hover:text-teal transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              WhatsApp us
            </a>
          </div>
        </div>

        {/* Explore */}
        <nav aria-label="Footer navigation" className="lg:col-span-3">
          <h3 className="font-mono text-xs uppercase tracking-widest text-muted mb-4">Explore</h3>
          <ul className="space-y-2.5">
            {EXPLORE_LINKS.map((link) => (
              <li key={link.href}>
                <Link to={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Programmes */}
        <nav aria-label="Programmes" className="lg:col-span-2">
          <h3 className="font-mono text-xs uppercase tracking-widest text-muted mb-4">Programmes</h3>
          <ul className="space-y-2.5">
            {PROGRAMME_LINKS.map((link) => (
              <li key={link.href}>
                <Link to={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Legal — its own grouped column */}
        <nav aria-label="Legal" className="lg:col-span-3">
          <h3 className="font-mono text-xs uppercase tracking-widest text-muted mb-4">Legal</h3>
          <ul className="space-y-2.5">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link to={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Bottom strip */}
      <div className="border-t border-soft py-4 px-4">
        <p className="text-center font-sans text-xs text-muted">
          &copy; {new Date().getFullYear()} {SITE.legalEntity} &middot; Made with care in Ambajogai
        </p>
      </div>
    </footer>
  );
}
