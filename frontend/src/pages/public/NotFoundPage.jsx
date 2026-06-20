/**
 * NotFoundPage — 404 page (UI-SPEC §Error states).
 * Heading: "This page wandered off."
 * Four nav links + falling leaves ambient per UI-SPEC §Animation Contract.
 * /404 is one of the few pages that gets ambient motion (it's not a form page).
 */
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FallingLeaves } from '../../components/animations/FallingLeaves.jsx';
import { FadeIn } from '../../components/animations/FadeIn.jsx';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'The Retreat', href: '/retreat' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
];

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Page Not Found — Badlaav</title>
        <meta name="description" content="This page wandered off. Find your way back to Badlaav." />
      </Helmet>

      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-ink">
        {/* Falling leaves — explicitly allowed on /404 per UI-SPEC §Animation Contract */}
        <FallingLeaves disabled={false} />

        <div className="relative z-10 text-center px-6 max-w-narrow mx-auto">
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-widest text-pearl/40 mb-4">404</p>
            <h1
              className="font-display font-semibold text-pearl mb-4"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}
            >
              This page wandered off.
            </h1>
            <p className="font-sans text-pearl/70 leading-body mb-10">
              Take a breath. Try one of these instead:
            </p>

            <nav aria-label="Return navigation">
              <div className="flex flex-wrap gap-3 justify-center">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="font-mono text-xs uppercase tracking-widest px-5 py-3
                               border border-pearl/30 text-pearl/70
                               hover:border-gold hover:text-gold
                               rounded transition-colors duration-150
                               focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
