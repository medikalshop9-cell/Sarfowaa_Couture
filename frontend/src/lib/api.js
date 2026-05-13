/**
 * frontend/src/lib/api.js
 *
 * Thin fetch wrapper that automatically attaches the Firebase Auth ID token.
 * Every call gracefully handles missing auth (e.g. guest users).
 */
import { auth } from '../firebase';

const BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3001' : '');

/**
 * Core request helper.
 * @param {string} path      - e.g. '/api/orders'
 * @param {object} [options] - Standard fetch options (method, body, etc.)
 * @returns {Promise<any>}   - Parsed JSON response
 */
async function apiRequest(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };

  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch {
    // Not authenticated – continue without token (public routes still work)
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      (typeof data === 'object' && data?.error) ||
      (typeof data === 'string' && data) ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

// ── Convenience methods ──────────────────────────────────────────────────────
const api = {
  get: (path, options = {}) =>
    apiRequest(path, { ...options, method: 'GET' }),

  post: (path, body, options = {}) =>
    apiRequest(path, { ...options, method: 'POST', body: JSON.stringify(body) }),

  patch: (path, body, options = {}) =>
    apiRequest(path, { ...options, method: 'PATCH', body: JSON.stringify(body) }),

  delete: (path, options = {}) =>
    apiRequest(path, { ...options, method: 'DELETE' }),
};

export { api, apiRequest };
export default api;
