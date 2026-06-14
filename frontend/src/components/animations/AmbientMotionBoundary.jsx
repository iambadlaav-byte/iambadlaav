/**
 * AmbientMotionBoundary — route-level gate for ambient animations.
 * Reads useLocation().pathname and provides a React context value
 * `ambientDisabled: true` on paths where ambient motion is banned:
 *   - /contact (form-bearing page)
 *   - /register and /register/* (Form 2 wizard)
 *   - /login
 *   - /payment-success
 *   - /account/* (authenticated zone)
 *   - /admin/* (admin zone — also handled by lazy loading)
 *
 * Components that are ambient (FallingLeaves, BreathingPulse, FloatingParticles)
 * should call useAmbientMotion() and pass the result as `disabled` prop.
 *
 * FadeIn (reveal, not ambient) is exempt from this ban — it is allowed everywhere
 * except /admin/* (where we skip it for cleanliness).
 *
 * Per RESEARCH.md Pitfall 10: explicit opt-in list is safer than opt-out.
 * This component implements the "explicit block" pattern — ambient motion
 * is NOT rendered on the paths above.
 */
import { createContext, useContext } from 'react';
import { useLocation } from 'react-router-dom';

const AmbientMotionContext = createContext({ ambientDisabled: false });

/** Paths where ambient motion is banned. */
const AMBIENT_DISABLED_PATHS = [
  '/contact',
  '/register',
  '/login',
  '/payment-success',
];

/** Prefix-based path bans (all sub-routes). */
const AMBIENT_DISABLED_PREFIXES = [
  '/account/',
  '/admin/',
  '/register/',
];

function isAmbientDisabled(pathname) {
  if (AMBIENT_DISABLED_PATHS.includes(pathname)) return true;
  if (AMBIENT_DISABLED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true;
  return false;
}

/**
 * Wrap the app (or the route tree) in this boundary.
 * All child components can call useAmbientMotion() to read the flag.
 */
export function AmbientMotionBoundary({ children }) {
  const { pathname } = useLocation();
  const ambientDisabled = isAmbientDisabled(pathname);

  return (
    <AmbientMotionContext.Provider value={{ ambientDisabled }}>
      {children}
    </AmbientMotionContext.Provider>
  );
}

/**
 * Hook for ambient animation components.
 * Returns true when animations should be disabled on the current route.
 */
export function useAmbientMotion() {
  return useContext(AmbientMotionContext).ambientDisabled;
}
