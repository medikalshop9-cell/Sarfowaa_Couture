'use strict';
const { db } = require('../services/firebase');

/**
 * Middleware — must come after verifyToken/requireAuth.
 * Allows the request only if the authenticated user has role === 'admin'
 * in the Firestore users collection (mirrors the frontend isAdmin check).
 */
async function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Fast path: custom claim set on the token
  if (req.user.admin === true) return next();

  // Fallback: read role from Firestore users document
  try {
    const snap = await db.collection('users').doc(req.user.uid).get();
    if (snap.exists && snap.data().role === 'admin') return next();
    return res.status(403).json({ error: 'Admin access required' });
  } catch {
    return res.status(403).json({ error: 'Admin access required' });
  }
}

module.exports = requireAdmin;
