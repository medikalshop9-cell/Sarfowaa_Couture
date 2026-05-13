'use strict';
const { auth } = require('../services/firebase');

/**
 * Optionally verifies a Firebase ID token from the Authorization header.
 * Sets req.user if valid; continues without setting it if none provided.
 * Use requireAdmin or requireAuth after this for protected routes.
 */
async function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  const token = header.split('Bearer ')[1];
  try {
    req.user = await auth.verifyIdToken(token);
  } catch {
    req.user = null;
  }
  next();
}

/**
 * Strict version — rejects if no valid token present.
 */
async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = header.split('Bearer ')[1];
  try {
    req.user = await auth.verifyIdToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { verifyToken, requireAuth };
