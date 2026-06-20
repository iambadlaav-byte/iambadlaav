/**
 * Seo — reusable per-page metadata: title, description, canonical, OG + Twitter.
 * Canonical is derived from the current path + SITE_URL.
 */
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { SITE_URL } from '../../lib/seo.js';

export function Seo({ title, description, image, type = 'website', noindex = false }) {
  const { pathname } = useLocation();
  const canonical = `${SITE_URL}${pathname}`;
  const ogImage = image || `${SITE_URL}/images/program_badlaav.jpg`;

  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex" />}
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
}
