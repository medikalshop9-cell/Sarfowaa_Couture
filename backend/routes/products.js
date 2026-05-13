'use strict';
const express      = require('express');
const { db, admin } = require('../services/firebase');
const { requireAuth } = require('../middleware/verifyToken');
const requireAdmin    = require('../middleware/requireAdmin');

const router = express.Router();

// ── GET /api/products ────────────────────────────────────────────────────────
// Public: return all active products.
router.get('/', async (req, res) => {
  try {
    let query = db.collection('products').orderBy('createdAt', 'desc');
    if (req.query.category) {
      query = db.collection('products')
        .where('category', '==', req.query.category)
        .orderBy('createdAt', 'desc');
    }
    if (req.query.newArrival === 'true') {
      query = db.collection('products')
        .where('newArrival', '==', true)
        .orderBy('createdAt', 'desc');
    }
    const snap = await query.get();
    res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (err) {
    console.error('[products GET]', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// ── GET /api/products/:id ────────────────────────────────────────────────────
// Public: single product.
router.get('/:id', async (req, res) => {
  try {
    const snap = await db.collection('products').doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ error: 'Product not found' });
    res.json({ id: snap.id, ...snap.data() });
  } catch (err) {
    console.error('[products GET one]', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// ── POST /api/products ───────────────────────────────────────────────────────
// Admin: create product.
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, price, category, description, sizes, imageUrl, images,
            badge, newArrival, featured } = req.body;

    if (!name || price == null || !category) {
      return res.status(400).json({ error: 'name, price and category are required' });
    }

    const data = {
      name,
      price:       Number(price),
      category,
      description: description || '',
      sizes:       Array.isArray(sizes) ? sizes : [],
      imageUrl:    imageUrl || '',
      images:      Array.isArray(images) ? images : [],
      badge:       badge       || '',
      newArrival:  !!newArrival,
      featured:    !!featured,
      createdAt:   admin.firestore.FieldValue.serverTimestamp(),
      updatedAt:   admin.firestore.FieldValue.serverTimestamp(),
    };

    const ref = await db.collection('products').add(data);
    res.status(201).json({ id: ref.id, ...data });
  } catch (err) {
    console.error('[products POST]', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// ── PATCH /api/products/:id ──────────────────────────────────────────────────
// Admin: update product.
router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    delete updates.id;
    delete updates.createdAt;

    if (updates.price != null) updates.price = Number(updates.price);

    await db.collection('products').doc(req.params.id).update(updates);
    res.json({ id: req.params.id, ...updates });
  } catch (err) {
    console.error('[products PATCH]', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// ── DELETE /api/products/:id ─────────────────────────────────────────────────
// Admin: delete product.
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.collection('products').doc(req.params.id).delete();
    res.json({ deleted: req.params.id });
  } catch (err) {
    console.error('[products DELETE]', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
