'use strict';
const express      = require('express');
const { db, admin } = require('../services/firebase');
const { requireAuth } = require('../middleware/verifyToken');
const requireAdmin    = require('../middleware/requireAdmin');

const router = express.Router();

// ── GET /api/categories ───────────────────────────────────────────────────────
router.get('/', async (_req, res) => {
  try {
    const snap = await db.collection('categories').orderBy('createdAt', 'desc').get();
    res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (err) {
    console.error('[categories GET]', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// ── GET /api/categories/:id ──────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const snap = await db.collection('categories').doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ error: 'Category not found' });
    res.json({ id: snap.id, ...snap.data() });
  } catch (err) {
    console.error('[categories GET one]', err);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// ── POST /api/categories ─────────────────────────────────────────────────────
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, slug, description, imageUrl } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const data = {
      name,
      slug:        slug || name.toLowerCase().replace(/\s+/g, '-'),
      description: description || '',
      imageUrl:    imageUrl    || '',
      createdAt:   admin.firestore.FieldValue.serverTimestamp(),
      updatedAt:   admin.firestore.FieldValue.serverTimestamp(),
    };

    const ref = await db.collection('categories').add(data);
    res.status(201).json({ id: ref.id, ...data });
  } catch (err) {
    console.error('[categories POST]', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// ── PATCH /api/categories/:id ────────────────────────────────────────────────
router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    delete updates.id; delete updates.createdAt;
    await db.collection('categories').doc(req.params.id).update(updates);
    res.json({ id: req.params.id, ...updates });
  } catch (err) {
    console.error('[categories PATCH]', err);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// ── DELETE /api/categories/:id ───────────────────────────────────────────────
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.collection('categories').doc(req.params.id).delete();
    res.json({ deleted: req.params.id });
  } catch (err) {
    console.error('[categories DELETE]', err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;
