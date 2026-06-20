/**
 * Footer — three-column desktop, stacked mobile. Warm cream background.
 * NO inline styles. NO forbidden phrases.
 */
import { Link } from 'react-router-dom';
import { Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { CONTACT_EMAIL, WHATSAPP_NUMBER, CONTACT_PHONE, MAP_LINK } from '../../lib/constants.js';
import { SITE, SOCIAL } from '../../lib/content.js';

const SITE_LINKS_LEFT = [
  { label: 'Home', href: '/' },
  { label: 'The Retreat', href: '/retreat' },
  { label: 'The Badlaav Experience', href: '/badlaav-experience' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Gallery', href: '/gallery' },
];

const SITE_LINKS_RIGHT = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Volunteer', href: '/volunteer' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Refund Policy', href: '/refund' },
  { label: 'Cookie Policy', href: '/cookies' },
  { label: 'Code of Conduct', href: '/code-of-conduct' },
];

export default function Footer() {
  return (
    <footer className="bg-cream border-t border-soft">
      <div className="max-w-default mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Column 1 — Contact */}
        <div>
          <img
            src="/images/badlaav-logo.png"
            alt="Badlaav"
            className="h-10 w-auto"
          />
          <p className="font-mono text-xs uppercase tracking-widest text-muted mt-3 mb-4">
            {SITE.parent}
          </p>
          <div className="space-y-3 text-sm text-charcoal/80 font-sans">
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
            <div>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal hover:text-teal-light text-sm transition-colors"
              >
                WhatsApp us
              </a>
            </div>
          </div>
        </div>

        {/* Column 2 — Site map */}
        <div>
          <h3 className="font-mono text-xs uppercase tracking-widest text-muted mb-4">Explore</h3>
          <div className="grid grid-cols-2 gap-x-6">
            <ul className="space-y-2">
              {SITE_LINKS_LEFT.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="font-sans text-sm text-charcoal/80 hover:text-teal transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="space-y-2">
              {SITE_LINKS_RIGHT.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="font-sans text-sm text-charcoal/80 hover:text-teal transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Column 3 — Social */}
        <div>
          <h3 className="font-mono text-xs uppercase tracking-widest text-muted mb-4">Follow along</h3>
          <div className="flex gap-4 mb-4">
            <a
              href={SOCIAL.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-charcoal/80 hover:text-teal transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
          </div>
          <p className="font-sans text-xs text-muted leading-relaxed">
            Trip नाही — Turning Point.
            <br />
            Three days in Ambajogai.
          </p>
        </div>
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
