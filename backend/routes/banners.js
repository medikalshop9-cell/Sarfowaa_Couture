'use strict';
const express      = require('express');
const { db, admin } = require('../services/firebase');
const { requireAuth } = require('../middleware/verifyToken');
const requireAdmin    = require('../middleware/requireAdmin');

const router = express.Router();

// ── GET /api/banners ──────────────────────────────────────────────────────────
// Public: returns only active banners, sorted by order field.
router.get('/', async (_req, res) => {
  try {
    const snap = await db.collection('banners')
      .where('active', '==', true)
      .orderBy('order', 'asc')
      .get();
    res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (err) {
    console.error('[banners GET public]', err);
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
});

// ── GET /api/banners/all ──────────────────────────────────────────────────────
// Admin: all banners regardless of active flag.
router.get('/all', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const snap = await db.collection('banners').orderBy('order', 'asc').get();
    res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (err) {
    console.error('[banners GET all]', err);
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
});

// ── POST /api/banners ─────────────────────────────────────────────────────────
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, subtitle, imageUrl, ctaText, ctaLink, active, order } = req.body;
    if (!imageUrl) return res.status(400).json({ error: 'imageUrl is required' });

    const data = {
      title:     title    || '',
      subtitle:  subtitle || '',
      imageUrl,
      ctaText:   ctaText  || 'Shop Now',
      ctaLink:   ctaLink  || '/shop',
      active:    active !== false,
      order:     Number(order) || 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const ref = await db.collection('banners').add(data);
    res.status(201).json({ id: ref.id, ...data });
  } catch (err) {
    console.error('[banners POST]', err);
    res.status(500).json({ error: 'Failed to create banner' });
  }
});

// ── PATCH /api/banners/:id ───────────────────────────────────────────────────
router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    delete updates.id; delete updates.createdAt;
    if (updates.order != null) updates.order = Number(updates.order);
    await db.collection('banners').doc(req.params.id).update(updates);
    res.json({ id: req.params.id, ...updates });
  } catch (err) {
    console.error('[banners PATCH]', err);
    res.status(500).json({ error: 'Failed to update banner' });
  }
});

// ── DELETE /api/banners/:id ──────────────────────────────────────────────────
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.collection('banners').doc(req.params.id).delete();
    res.json({ deleted: req.params.id });
  } catch (err) {
    console.error('[banners DELETE]', err);
    res.status(500).json({ error: 'Failed to delete banner' });
  }
});

module.exports = router;
