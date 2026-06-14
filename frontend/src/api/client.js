/**
 * Axios API client.
 * withCredentials: true — sends httpOnly refresh cookie on every request.
 *
 * Request interceptor: injects Authorization: Bearer <accessToken> header.
 * Response interceptor: on 401 from a non-refresh endpoint, tries one refresh
 *   cycle and retries the original request. On second 401, propagates.
 *
 * Chicken-and-egg pattern (AuthContext needs client, client needs AuthContext):
 * Solved via setAccessTokenGetter(fn) — AuthContext calls this on mount,
 * so the client always reads the latest token without importing AuthContext.
 */
import axios from 'axios';
import { API_BASE } from '../lib/constants.js';

// Getter set by AuthContext after mount
let getAccessToken = () => null;

export function setAccessTokenGetter(fn) {
  getAccessToken = fn;
}

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // required for httpOnly refresh cookie
});

// Request interceptor — inject Authorization header
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 with one refresh retry
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't intercept the refresh endpoint itself (prevents infinite loop)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        // Queue this request until the ongoing refresh resolves
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await apiClient.post('/auth/refresh');
        const newToken = data.accessToken;
        // Update the getter so future requests use the new token
        getAccessToken = () => newToken;
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
