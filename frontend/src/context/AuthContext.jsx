/**
 * AuthContext — provides { user, loading, accessToken, login, logout, refresh }.
 *
 * Access token stored in React state (memory only — never localStorage).
 * Refresh token is in an httpOnly cookie managed by the browser/server.
 *
 * On mount: calls POST /api/v1/auth/refresh once to restore session
 * (refresh cookie allows this without user interaction).
 * Refreshes every 50 minutes (before 1h access token expiry).
 */
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { apiClient, setAccessTokenGetter } from '../api/client.js';

const AuthContext = createContext(null);

const REFRESH_INTERVAL_MS = 50 * 60 * 1000; // 50 minutes

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef(null);

  // Expose the current access token to the axios client without creating a circular dep.
  // The client calls this getter in the request interceptor.
  useEffect(() => {
    setAccessTokenGetter(() => accessToken);
  }, [accessToken]);

  const login = useCallback((newAccessToken, newUser) => {
    setAccessToken(newAccessToken);
    setUser(newUser);
  }, []);

  // Change the signed-in user's password. The endpoint returns a fresh
  // accessToken (same shape as login) because rotating the password
  // invalidates the old token — store it the same way login does so the
  // current session keeps working.
  const changePassword = useCallback(async ({ currentPassword, newPassword }) => {
    const { data } = await apiClient.post('/auth/password/change', { currentPassword, newPassword });
    setAccessToken(data.accessToken);
    if (data.user) setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore errors on logout — clear state regardless
    }
    setAccessToken(null);
    setUser(null);
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
  }, []);

  const attemptRefresh = useCallback(async () => {
    try {
      const { data } = await apiClient.post('/auth/refresh');
      setAccessToken(data.accessToken);
      setUser(data.user);
      return true;
    } catch {
      setAccessToken(null);
      setUser(null);
      return false;
    }
  }, []);

  // On mount: attempt session restore via refresh cookie
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    attemptRefresh().finally(() => {
      if (mounted) setLoading(false);
    });

    return () => { mounted = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Set up refresh interval when authenticated
  useEffect(() => {
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);

    if (accessToken) {
      refreshTimerRef.current = setInterval(attemptRefresh, REFRESH_INTERVAL_MS);
    }

    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [accessToken, attemptRefresh]);

  return (
    <AuthContext.Provider value={{ user, loading, accessToken, login, logout, changePassword, refresh: attemptRefresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
