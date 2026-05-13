'use strict';
require('dotenv').config();

const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const rateLimit   = require('express-rate-limit');

// Route handlers
const ordersRouter     = require('./routes/orders');
const productsRouter   = require('./routes/products');
const categoriesRouter = require('./routes/categories');
const bannersRouter    = require('./routes/banners');
const inquiriesRouter  = require('./routes/inquiries');
const settingsRouter   = require('./routes/settings');
const authRouter       = require('./routes/auth');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Security headers ──────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:4173',
  'https://sarfowaa-couture.vercel.app',
];
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl / mobile) or from allowed list
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// ── Body parsing ─────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ── Global rate limit (100 req / 15 min per IP) ──────────
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please try again later.' },
}));

// ── Routes ────────────────────────────────────────────────
app.use('/api/orders',     ordersRouter);
app.use('/api/products',   productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/banners',    bannersRouter);
app.use('/api/inquiries',  inquiriesRouter);
app.use('/api/settings',   settingsRouter);
app.use('/api/auth',       authRouter);

// ── Health check ─────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── 404 ───────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// ── Global error handler ─────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[server error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// Only start the HTTP server when run directly (not when imported by Vercel serverless)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅  Sarfowaa backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;
