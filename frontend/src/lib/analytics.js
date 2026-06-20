/**
 * analytics.js — Google Analytics 4 loader, feature-flagged.
 *
 * No-ops entirely unless VITE_GA_MEASUREMENT_ID is set, so nothing loads and no
 * tracking happens until a measurement ID is provided. Safe to ship dark.
 */
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
let loaded = false;

export function isAnalyticsEnabled() {
  return Boolean(GA_ID);
}

export function loadAnalytics() {
  if (!GA_ID || loaded || typeof window === 'undefined') return;
  loaded = true;

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  // Route changes are tracked manually (SPA) — disable automatic page_view.
  window.gtag('config', GA_ID, { send_page_view: false });
}

export function trackPageView(path) {
  if (!GA_ID || typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'page_view', { page_path: path, page_location: window.location.href });
}
