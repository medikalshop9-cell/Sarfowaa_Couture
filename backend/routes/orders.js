'use strict';
const express     = require('express');
const rateLimit   = require('express-rate-limit');
const { db, admin } = require('../services/firebase');
const { verifyToken, requireAuth } = require('../middleware/verifyToken');
const requireAdmin = require('../middleware/requireAdmin');
const email = require('../services/email');

const router = express.Router();

// Tight rate limit for order creation (10 per 15 min per IP)
const orderCreateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many orders from this IP, please try again later.' },
});

function genOrderRef() {
  const d    = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `SC-${d}-${rand}`;
}

// ── POST /api/orders ─────────────────────────────────────────────────────────
// Create a new order; send confirmation email to customer + alert to admin.
router.post('/', orderCreateLimit, verifyToken, async (req, res) => {
  try {
    const { customer, items, total, userId } = req.body;

    // Basic validation
    if (!customer?.email || !Array.isArray(items) || !items.length || !total) {
      return res.status(400).json({ error: 'Missing required order fields' });
    }
    if (typeof total !== 'number' || total <= 0) {
      return res.status(400).json({ error: 'Invalid total' });
    }

    const orderRef = genOrderRef();
    const now      = admin.firestore.FieldValue.serverTimestamp();

    const orderData = {
      orderRef,
      userId:   req.user?.uid || userId || null,
      customer,
      items:    items.map((i) => ({
        id:       i.id       || '',
        name:     i.name     || '',
        price:    Number(i.price) || 0,
        qty:      Number(i.qty)   || 1,
        size:     i.size     || '',
        imageUrl: i.imageUrl || '',
      })),
      total,
      status:    'pending_payment',
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection('orders').add(orderData);

    // Fire-and-forget emails (don't block the response)
    const fullOrder = { id: docRef.id, ...orderData, createdAt: new Date() };
    email.sendOrderConfirmation(fullOrder).catch(console.error);
    email.sendNewOrderAlert(fullOrder).catch(console.error);

    res.status(201).json({ id: docRef.id, orderRef, status: 'pending_payment' });
  } catch (err) {
    console.error('[orders POST]', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// ── GET /api/orders ──────────────────────────────────────────────────────────
// Admin: get all orders, sorted by createdAt desc.
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const snap = await db.collection('orders').orderBy('createdAt', 'desc').get();
    const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(orders);
  } catch (err) {
    console.error('[orders GET all]', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ── GET /api/orders/my ───────────────────────────────────────────────────────
// Authenticated customer: get their own orders.
router.get('/my', requireAuth, async (req, res) => {
  try {
    const snap = await db.collection('orders')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();
    res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (err) {
    console.error('[orders GET my]', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ── GET /api/orders/:id ───────────────────────────────────────────────────────
// Order owner or admin.
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const snap = await db.collection('orders').doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ error: 'Order not found' });

    const order = { id: snap.id, ...snap.data() };

    // Check access
    const isOwner  = order.userId === req.user.uid;
    const adminSnap = await db.collection('users').doc(req.user.uid).get();
    const isAdmin   = adminSnap.exists && adminSnap.data().role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);
  } catch (err) {
    console.error('[orders GET one]', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// ── PATCH /api/orders/:id/status ─────────────────────────────────────────────
// Admin: update order status + send customer notification email.
router.patch('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  const VALID = ['pending_payment', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  try {
    const { status } = req.body;
    if (!VALID.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID.join(', ')}` });
    }

    const ref  = db.collection('orders').doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: 'Order not found' });

    await ref.update({ status, updatedAt: admin.firestore.FieldValue.serverTimestamp() });

    // Email customer if status progresses meaningfully
    const emailStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
    if (emailStatuses.includes(status)) {
      const order = { id: snap.id, ...snap.data() };
      email.sendStatusUpdate(order, status).catch(console.error);
    }

    res.json({ id: req.params.id, status });
  } catch (err) {
    console.error('[orders PATCH status]', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// ── DELETE /api/orders/:id ───────────────────────────────────────────────────
// Admin: delete an order.
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.collection('orders').doc(req.params.id).delete();
    res.json({ deleted: req.params.id });
  } catch (err) {
    console.error('[orders DELETE]', err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

module.exports = router;
