/**
 * Analytics — loads GA4 once (if configured) and records SPA page views on route change.
 * Renders nothing. Dark/no-op unless VITE_GA_MEASUREMENT_ID is set.
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { loadAnalytics, trackPageView, isAnalyticsEnabled } from '../lib/analytics.js';

export function Analytics() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    if (isAnalyticsEnabled()) trackPageView(pathname + search);
  }, [pathname, search]);

  return null;
}
