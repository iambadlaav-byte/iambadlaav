/**
 * HomePage — / (Badlaav). First Light flow:
 * hero → the idea (noise wheel) → collage → interstitial → the three days →
 * video → batches → the place → testimonials → facilitators → pricing → FAQ →
 * closing band.
 */
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { getSeoForRoute, OrganizationLD } from '../../lib/seo.js';
import { ProtoHero } from '../../components/sections/ProtoHero.jsx';
import { NoiseWheel } from '../../components/sections/NoiseWheel.jsx';
import { PhotoCollage } from '../../components/sections/PhotoCollage.jsx';
import { InterstitialBand } from '../../components/sections/InterstitialBand.jsx';
import { ThreeDaysInteractive } from '../../components/sections/ThreeDaysInteractive.jsx';
import { VideoBanner } from '../../components/sections/VideoBanner.jsx';
import { UpcomingBatches } from '../../components/sections/UpcomingBatches.jsx';
import { LocationGrid } from '../../components/sections/LocationGrid.jsx';
import { Testimonials } from '../../components/sections/Testimonials.jsx';
import { FacilitatorsGrid } from '../../components/sections/FacilitatorsGrid.jsx';
import { Pricing3Plans } from '../../components/sections/Pricing3Plans.jsx';
import { FAQAccordion } from '../../components/sections/FAQAccordion.jsx';
import { BigFooterCta } from '../../components/sections/BigFooterCta.jsx';
import { PLANS } from '../../lib/content.js';

export default function HomePage() {
  const { pathname } = useLocation();
  const seo = getSeoForRoute(pathname);

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:type" content={seo.ogType} />
        <meta property="og:image" content={seo.ogImage} />
        <meta name="twitter:card" content={seo.twitterCard} />
        <script type="application/ld+json">{JSON.stringify(OrganizationLD)}</script>
      </Helmet>

      <ProtoHero />
      <NoiseWheel />
      <PhotoCollage />
      <InterstitialBand />
      <ThreeDaysInteractive />
      <VideoBanner />
      <UpcomingBatches program="BADLAAV" title="Join us at an upcoming batch" />
      <LocationGrid />
      <Testimonials />
      <FacilitatorsGrid />
      <Pricing3Plans program="Badlaav" plans={PLANS} />
      <FAQAccordion />
      <BigFooterCta />
    </>
  );
}
