'use strict';
const express      = require('express');
const { db, admin } = require('../services/firebase');
const { requireAuth } = require('../middleware/verifyToken');
const requireAdmin    = require('../middleware/requireAdmin');

const router = express.Router();

const SETTINGS_DOC = 'settings/site';

// ── GET /api/settings ────────────────────────────────────────────────────────
// Public: fetch site settings.
router.get('/', async (_req, res) => {
  try {
    const snap = await db.doc(SETTINGS_DOC).get();
    if (!snap.exists) return res.json({});
    res.json({ id: snap.id, ...snap.data() });
  } catch (err) {
    console.error('[settings GET]', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// ── PATCH /api/settings ──────────────────────────────────────────────────────
// Admin: update/create site settings.
router.patch('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const updates = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    delete updates.id;
    await db.doc(SETTINGS_DOC).set(updates, { merge: true });
    res.json({ success: true, ...updates });
  } catch (err) {
    console.error('[settings PATCH]', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;
