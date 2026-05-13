'use strict';
const express      = require('express');
const { db, auth } = require('../services/firebase');
const { requireAuth } = require('../middleware/verifyToken');
const requireAdmin    = require('../middleware/requireAdmin');

const router = express.Router();

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
// Authenticated: get the current user's profile from Firestore.
router.get('/me', requireAuth, async (req, res) => {
  try {
    const snap = await db.collection('users').doc(req.user.uid).get();
    if (!snap.exists) return res.status(404).json({ error: 'User not found' });
    const data = snap.data();
    // Never expose sensitive fields
    delete data.password;
    res.json({ uid: req.user.uid, email: req.user.email, ...data });
  } catch (err) {
    console.error('[auth GET me]', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ── POST /api/auth/make-admin ────────────────────────────────────────────────
// Admin-only: grant admin role to a user by their email address.
// The first call can be made with BOOTSTRAP_SECRET header for initial setup.
router.post('/make-admin', async (req, res) => {
  const { email, bootstrapSecret } = req.body;

  // Bootstrap mode: allows first-time admin setup without an existing admin
  const secretOk = bootstrapSecret &&
    bootstrapSecret === process.env.BOOTSTRAP_SECRET &&
    process.env.BOOTSTRAP_SECRET?.length > 8;

  if (!secretOk) {
    // Must be an existing admin
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    try {
      const decoded = await auth.verifyIdToken(authHeader.split('Bearer ')[1]);
      const snap = await db.collection('users').doc(decoded.uid).get();
      if (!snap.exists || snap.data().role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  if (!email) return res.status(400).json({ error: 'email is required' });

  try {
    const user = await auth.getUserByEmail(email);

    // Set custom claim
    await auth.setCustomUserClaims(user.uid, { admin: true });

    // Update Firestore role
    await db.collection('users').doc(user.uid).set({ role: 'admin' }, { merge: true });

    res.json({ success: true, uid: user.uid, email, role: 'admin' });
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      return res.status(404).json({ error: 'User not found. They must register first.' });
    }
    console.error('[auth make-admin]', err);
    res.status(500).json({ error: 'Failed to grant admin role' });
  }
});

// ── POST /api/auth/revoke-admin ──────────────────────────────────────────────
// Admin-only: revoke admin role from a user.
router.post('/revoke-admin', requireAuth, requireAdmin, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email is required' });

  try {
    const user = await auth.getUserByEmail(email);

    // Prevent self-revocation
    if (user.uid === req.user.uid) {
      return res.status(400).json({ error: 'You cannot revoke your own admin role' });
    }

    await auth.setCustomUserClaims(user.uid, { admin: false });
    await db.collection('users').doc(user.uid).update({ role: 'customer' });

    res.json({ success: true, uid: user.uid, email, role: 'customer' });
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      return res.status(404).json({ error: 'User not found' });
    }
    console.error('[auth revoke-admin]', err);
    res.status(500).json({ error: 'Failed to revoke admin role' });
  }
});

// ── GET /api/auth/users ──────────────────────────────────────────────────────
// Admin: list all registered users (paginated, max 100).
router.get('/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const snap = await db.collection('users')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();
    const users = snap.docs.map((d) => {
      const data = d.data();
      return {
        uid:         d.id,
        email:       data.email,
        displayName: data.displayName,
        role:        data.role || 'customer',
        createdAt:   data.createdAt,
      };
    });
    res.json(users);
  } catch (err) {
    console.error('[auth GET users]', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
