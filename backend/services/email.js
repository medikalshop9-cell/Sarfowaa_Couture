'use strict';
const nodemailer = require('nodemailer');

// ── Transporter ──────────────────────────────────────────────────────────────
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_USER || !SMTP_PASS) {
    console.warn('[email] SMTP credentials not set — emails will be logged only.');
    return null;
  }
  transporter = nodemailer.createTransport({
    host:   SMTP_HOST  || 'smtp.gmail.com',
    port:   parseInt(SMTP_PORT || '587'),
    secure: SMTP_SECURE === 'true',
    auth:   { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

async function send(to, subject, html) {
  const t = getTransporter();
  if (!t) {
    console.log(`[email:dev] TO=${to} | SUBJECT=${subject}`);
    return;
  }
  await t.sendMail({
    from:    process.env.EMAIL_FROM || "Sarfowaa's Couture <hello@sarfowaa.com>",
    to,
    subject,
    html,
  });
}

// ── Shared layout wrapper ─────────────────────────────────────────────────────
function layout(content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sarfowaa's Couture</title>
</head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E8;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#0A0A0A;padding:32px 40px;text-align:center;">
            <p style="margin:0;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#C4973F;">SARFOWAA'S COUTURE</p>
            <div style="width:40px;height:1px;background:#C4973F;margin:12px auto;"></div>
            <p style="margin:0;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.3);">Luxury African Fashion Atelier</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:40px;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0A0A0A;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.3);">
              Devi, Accra, Ghana &nbsp;·&nbsp; hello@sarfowaa.com &nbsp;·&nbsp; +233 020 281 9377
            </p>
            <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.15);">© ${new Date().getFullYear()} Sarfowaa's Couture. All rights reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function gold(text) {
  return `<span style="color:#C4973F;">${text}</span>`;
}

function divider() {
  return `<div style="border-top:1px solid #E8E3DA;margin:24px 0;"></div>`;
}

function itemsTable(items) {
  const rows = items.map((item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #F0EBE0;">
        <p style="margin:0;font-size:14px;color:#1A1A1A;">${item.name}</p>
        ${item.size ? `<p style="margin:2px 0 0;font-size:12px;color:#8A8A8A;">Size: ${item.size}</p>` : ''}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #F0EBE0;text-align:center;color:#5A5A5A;font-size:13px;">×${item.qty}</td>
      <td style="padding:10px 0;border-bottom:1px solid #F0EBE0;text-align:right;color:#C4973F;font-size:13px;font-weight:bold;">
        ${fmt(item.price * item.qty)}
      </td>
    </tr>`).join('');
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
      <tr>
        <th style="text-align:left;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8A8A8A;padding-bottom:8px;border-bottom:1px solid #E8E3DA;">Item</th>
        <th style="text-align:center;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8A8A8A;padding-bottom:8px;border-bottom:1px solid #E8E3DA;">Qty</th>
        <th style="text-align:right;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8A8A8A;padding-bottom:8px;border-bottom:1px solid #E8E3DA;">Price</th>
      </tr>
      ${rows}
    </table>`;
}

// ── GHS formatter ─────────────────────────────────────────────────────────────
function fmt(n) {
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2 }).format(n || 0);
}

// ── STATUS labels (for emails) ────────────────────────────────────────────────
const STATUS_LABEL = {
  pending_payment: 'Awaiting Payment',
  pending:         'Pending',
  processing:      'In Production',
  shipped:         'Shipped',
  delivered:       'Delivered',
  cancelled:       'Cancelled',
};

// ══════════════════════════════════════════════════════════════════════════════
// Email: Customer — Order Confirmation
// ══════════════════════════════════════════════════════════════════════════════
async function sendOrderConfirmation(order) {
  const { customer, items, total, orderRef } = order;
  const name = customer.firstName || customer.name || 'Valued Customer';

  const content = `
    <h2 style="margin:0 0 6px;font-family:'Georgia',serif;font-size:26px;color:#1A1A1A;">Order Received</h2>
    <div style="width:32px;height:2px;background:#C4973F;margin:0 0 20px;"></div>

    <p style="color:#5A5A5A;font-size:14px;line-height:1.7;margin:0 0 20px;">
      Dear ${name}, thank you for your order. We have received it and will begin crafting your pieces with care.
      Please complete your MoMo payment using the details below to confirm your order.
    </p>

    <div style="background:#F9F6F0;border:1px solid #E8E3DA;padding:20px;margin:0 0 24px;">
      <p style="margin:0 0 6px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8A8A8A;">Order Reference</p>
      <p style="margin:0;font-size:22px;font-family:'Georgia',serif;color:#C4973F;letter-spacing:2px;">${orderRef}</p>
    </div>

    ${itemsTable(items)}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
      <tr>
        <td style="font-size:13px;color:#5A5A5A;padding:6px 0;">Subtotal</td>
        <td style="font-size:13px;color:#5A5A5A;text-align:right;padding:6px 0;">${fmt(total / 1.125)}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#5A5A5A;padding:6px 0;">VAT (12.5%)</td>
        <td style="font-size:13px;color:#5A5A5A;text-align:right;padding:6px 0;">${fmt(total - total / 1.125)}</td>
      </tr>
      <tr>
        <td style="font-size:15px;font-weight:bold;color:#1A1A1A;padding:12px 0 0;border-top:1px solid #E8E3DA;">Total</td>
        <td style="font-size:18px;font-family:'Georgia',serif;color:#C4973F;text-align:right;padding:12px 0 0;border-top:1px solid #E8E3DA;">${fmt(total)}</td>
      </tr>
    </table>

    ${divider()}

    <h3 style="margin:0 0 12px;font-family:'Georgia',serif;font-size:16px;color:#1A1A1A;">Complete Your Payment</h3>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="font-size:13px;color:#8A8A8A;padding:6px 0 2px;">Send to (MTN MoMo)</td>
        <td style="font-size:16px;font-weight:bold;color:#1A1A1A;text-align:right;letter-spacing:2px;">0202819377</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#8A8A8A;padding:6px 0 2px;">Account Name</td>
        <td style="font-size:13px;color:#1A1A1A;text-align:right;">Jemima Akomeah</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#8A8A8A;padding:6px 0 2px;">Amount</td>
        <td style="font-size:15px;color:#C4973F;font-weight:bold;text-align:right;">${fmt(total)}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#8A8A8A;padding:6px 0 2px;">Payment Reference</td>
        <td style="font-size:13px;color:#C4973F;font-family:monospace;text-align:right;">${orderRef}</td>
      </tr>
    </table>

    <p style="margin:24px 0 0;font-size:12px;color:#8A8A8A;line-height:1.6;">
      After payment, please send your MoMo screenshot via WhatsApp to
      <a href="https://wa.me/233202819377" style="color:#C4973F;">+233 020 281 9377</a>
      with your order reference <strong>${orderRef}</strong>.
    </p>`;

  await send(
    customer.email,
    `Order Confirmation — ${orderRef} | Sarfowaa's Couture`,
    layout(content),
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Email: Admin — New Order Alert
// ══════════════════════════════════════════════════════════════════════════════
async function sendNewOrderAlert(order) {
  const { customer, items, total, orderRef, id } = order;
  const name = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.name;

  const content = `
    <h2 style="margin:0 0 6px;font-family:'Georgia',serif;font-size:24px;color:#1A1A1A;">New Order Received</h2>
    <div style="width:32px;height:2px;background:#C4973F;margin:0 0 20px;"></div>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9F6F0;border:1px solid #E8E3DA;padding:20px;margin:0 0 24px;">
      <tr>
        <td style="font-size:13px;color:#8A8A8A;padding:4px 0;">Reference</td>
        <td style="font-size:14px;color:#C4973F;font-family:monospace;text-align:right;">${orderRef}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#8A8A8A;padding:4px 0;">Customer</td>
        <td style="font-size:14px;color:#1A1A1A;text-align:right;">${name}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#8A8A8A;padding:4px 0;">Email</td>
        <td style="font-size:14px;color:#1A1A1A;text-align:right;">${customer.email}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#8A8A8A;padding:4px 0;">Phone</td>
        <td style="font-size:14px;color:#1A1A1A;text-align:right;">${customer.phone || '—'}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#8A8A8A;padding:4px 0;">Delivery</td>
        <td style="font-size:14px;color:#1A1A1A;text-align:right;">${customer.address}, ${customer.city}</td>
      </tr>
      <tr>
        <td style="font-size:16px;font-weight:bold;color:#1A1A1A;padding:12px 0 0;border-top:1px solid #E8E3DA;">Total</td>
        <td style="font-size:18px;font-family:'Georgia',serif;color:#C4973F;text-align:right;padding:12px 0 0;border-top:1px solid #E8E3DA;">${fmt(total)}</td>
      </tr>
    </table>

    ${itemsTable(items)}

    ${customer.notes ? `<p style="margin:16px 0 0;font-size:13px;color:#5A5A5A;"><strong>Customer note:</strong> ${customer.notes}</p>` : ''}

    <div style="margin-top:24px;text-align:center;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/orders"
        style="display:inline-block;background:#C4973F;color:#fff;font-size:11px;letter-spacing:2px;text-transform:uppercase;padding:14px 32px;text-decoration:none;">
        View in Admin Panel
      </a>
    </div>`;

  await send(
    process.env.ADMIN_EMAIL || 'hello@sarfowaa.com',
    `🛍 New Order — ${orderRef} — ${fmt(total)}`,
    layout(content),
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Email: Customer — Order Status Update
// ══════════════════════════════════════════════════════════════════════════════
async function sendStatusUpdate(order, newStatus) {
  const { customer, orderRef, total } = order;
  const name = customer.firstName || customer.name || 'Valued Customer';
  const label = STATUS_LABEL[newStatus] || newStatus;

  const messages = {
    processing: 'Our artisans have started working on your pieces. We will notify you when your order ships.',
    shipped:    'Your order is on its way! Please allow 1–3 business days for delivery within Accra.',
    delivered:  'Your order has been marked as delivered. We hope you love your new pieces!',
    cancelled:  'Your order has been cancelled. Please contact us if you have any questions.',
    pending:    'Your order is now pending and will be reviewed shortly.',
  };

  const message = messages[newStatus] || 'Your order status has been updated.';

  const statusColors = {
    processing: '#3B82F6',
    shipped:    '#8B5CF6',
    delivered:  '#22C55E',
    cancelled:  '#EF4444',
    pending:    '#F59E0B',
  };
  const badgeColor = statusColors[newStatus] || '#C4973F';

  const content = `
    <h2 style="margin:0 0 6px;font-family:'Georgia',serif;font-size:24px;color:#1A1A1A;">Order Update</h2>
    <div style="width:32px;height:2px;background:#C4973F;margin:0 0 20px;"></div>

    <p style="color:#5A5A5A;font-size:14px;line-height:1.7;margin:0 0 24px;">
      Dear ${name}, your order status has been updated.
    </p>

    <div style="background:#F9F6F0;border:1px solid #E8E3DA;padding:20px;margin:0 0 24px;text-align:center;">
      <p style="margin:0 0 8px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8A8A8A;">Order Reference</p>
      <p style="margin:0 0 16px;font-size:20px;font-family:'Georgia',serif;color:#C4973F;">${orderRef}</p>
      <span style="display:inline-block;background:${badgeColor}22;color:${badgeColor};font-size:12px;letter-spacing:1px;text-transform:uppercase;padding:8px 20px;border:1px solid ${badgeColor}44;border-radius:4px;">
        ${label}
      </span>
    </div>

    <p style="color:#5A5A5A;font-size:14px;line-height:1.7;margin:0 0 16px;">${message}</p>

    ${newStatus !== 'cancelled' ? `
    <p style="color:#8A8A8A;font-size:13px;margin:0;">
      Questions? Reach us on
      <a href="https://wa.me/233202819377" style="color:#C4973F;">WhatsApp (+233 020 281 9377)</a>
      or email <a href="mailto:hello@sarfowaa.com" style="color:#C4973F;">hello@sarfowaa.com</a>.
    </p>` : ''}`;

  await send(
    customer.email,
    `Order Update — ${label} | ${orderRef}`,
    layout(content),
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Email: Admin — New Inquiry Alert
// ══════════════════════════════════════════════════════════════════════════════
async function sendInquiryAlert(inquiry) {
  const { name, email, phone, service, message } = inquiry;

  const content = `
    <h2 style="margin:0 0 6px;font-family:'Georgia',serif;font-size:24px;color:#1A1A1A;">New Inquiry</h2>
    <div style="width:32px;height:2px;background:#C4973F;margin:0 0 20px;"></div>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9F6F0;border:1px solid #E8E3DA;padding:20px;margin:0 0 24px;">
      <tr>
        <td style="font-size:13px;color:#8A8A8A;padding:5px 0;">Name</td>
        <td style="font-size:14px;color:#1A1A1A;text-align:right;">${name}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#8A8A8A;padding:5px 0;">Email</td>
        <td style="font-size:14px;color:#C4973F;text-align:right;"><a href="mailto:${email}" style="color:#C4973F;">${email}</a></td>
      </tr>
      ${phone ? `<tr>
        <td style="font-size:13px;color:#8A8A8A;padding:5px 0;">Phone</td>
        <td style="font-size:14px;color:#1A1A1A;text-align:right;">${phone}</td>
      </tr>` : ''}
      ${service ? `<tr>
        <td style="font-size:13px;color:#8A8A8A;padding:5px 0;">Service</td>
        <td style="font-size:14px;color:#1A1A1A;text-align:right;">${service}</td>
      </tr>` : ''}
    </table>

    <h3 style="margin:0 0 10px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#8A8A8A;">Message</h3>
    <div style="background:#F9F6F0;border-left:3px solid #C4973F;padding:16px 20px;">
      <p style="margin:0;font-size:14px;color:#1A1A1A;line-height:1.7;">${message.replace(/\n/g, '<br>')}</p>
    </div>

    <div style="margin-top:24px;text-align:center;">
      <a href="mailto:${email}?subject=Re: Your inquiry to Sarfowaa's Couture"
        style="display:inline-block;background:#C4973F;color:#fff;font-size:11px;letter-spacing:2px;text-transform:uppercase;padding:14px 32px;text-decoration:none;">
        Reply to ${name}
      </a>
    </div>`;

  await send(
    process.env.ADMIN_EMAIL || 'hello@sarfowaa.com',
    `💬 New Inquiry from ${name} — ${service || 'General'}`,
    layout(content),
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Email: Customer — Inquiry Auto-Reply
// ══════════════════════════════════════════════════════════════════════════════
async function sendInquiryAutoReply(inquiry) {
  const { name, email, service } = inquiry;

  const content = `
    <h2 style="margin:0 0 6px;font-family:'Georgia',serif;font-size:26px;color:#1A1A1A;">Thank You for Reaching Out</h2>
    <div style="width:32px;height:2px;background:#C4973F;margin:0 0 20px;"></div>

    <p style="color:#5A5A5A;font-size:14px;line-height:1.7;margin:0 0 20px;">
      Dear ${name}, we have received your inquiry${service ? ` regarding <em>${service}</em>` : ''} and will be in touch
      within <strong>24 hours</strong>.
    </p>

    <div style="background:#F9F6F0;border:1px solid #E8E3DA;padding:20px;margin:0 0 24px;">
      <p style="margin:0;font-size:13px;color:#5A5A5A;line-height:1.7;font-style:italic;">
        "Every woman deserves to feel extraordinary. We look forward to crafting something exceptional for you."
      </p>
      <p style="margin:12px 0 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#C4973F;">— Sarfowaa's Couture</p>
    </div>

    <p style="color:#8A8A8A;font-size:13px;line-height:1.6;">
      For urgent matters, you can also reach us on
      <a href="https://wa.me/233202819377" style="color:#C4973F;">WhatsApp (+233 020 281 9377)</a>.
    </p>`;

  await send(
    email,
    `We received your message | Sarfowaa's Couture`,
    layout(content),
  );
}

module.exports = {
  sendOrderConfirmation,
  sendNewOrderAlert,
  sendStatusUpdate,
  sendInquiryAlert,
  sendInquiryAutoReply,
};
