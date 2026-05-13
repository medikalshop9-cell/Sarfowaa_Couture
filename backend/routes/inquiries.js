'use strict';
const express      = require('express');
const rateLimit    = require('express-rate-limit');
const { db, admin } = require('../services/firebase');
const { requireAuth } = require('../middleware/verifyToken');
const requireAdmin    = require('../middleware/requireAdmin');
const email = require('../services/email');

const router = express.Router();

// Tight rate limit: 5 submissions per 10 min per IP (anti-spam)
const inquiryLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { error: 'Too many messages sent. Please wait and try again.' },
});

// ── POST /api/inquiries ───────────────────────────────────────────────────────
// Public: submit a contact/inquiry form.
router.post('/', inquiryLimit, async (req, res) => {
  try {
    const { name, email: customerEmail, phone, service, message } = req.body;

    if (!name || !customerEmail || !message) {
      return res.status(400).json({ error: 'name, email and message are required' });
    }
    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const data = {
      name:      name.trim(),
      email:     customerEmail.trim().toLowerCase(),
      phone:     phone   || '',
      service:   service || '',
      message:   message.trim(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read:      false,
    };

    const ref = await db.collection('inquiries').add(data);

    // Send emails (fire-and-forget)
    const inq = { id: ref.id, ...data, createdAt: new Date() };
    email.sendInquiryAlert(inq).catch(console.error);
    email.sendInquiryAutoReply(inq).catch(console.error);

    res.status(201).json({ id: ref.id, success: true });
  } catch (err) {
    console.error('[inquiries POST]', err);
    res.status(500).json({ error: 'Failed to submit inquiry' });
  }
});

// ── GET /api/inquiries ────────────────────────────────────────────────────────
// Admin: get all inquiries, newest first.
router.get('/', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const snap = await db.collection('inquiries').orderBy('createdAt', 'desc').get();
    res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (err) {
    console.error('[inquiries GET]', err);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

// ── PATCH /api/inquiries/:id/read ────────────────────────────────────────────
// Admin: mark inquiry as read.
router.patch('/:id/read', requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.collection('inquiries').doc(req.params.id).update({ read: true });
    res.json({ id: req.params.id, read: true });
  } catch (err) {
    console.error('[inquiries PATCH read]', err);
    res.status(500).json({ error: 'Failed to update inquiry' });
  }
});

// ── DELETE /api/inquiries/:id ────────────────────────────────────────────────
// Admin: delete inquiry.
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.collection('inquiries').doc(req.params.id).delete();
    res.json({ deleted: req.params.id });
  } catch (err) {
    console.error('[inquiries DELETE]', err);
    res.status(500).json({ error: 'Failed to delete inquiry' });
  }
});

module.exports = router;
