/**
 * invoice.service.js — pdfkit-based PDF invoice generation + Cloudinary upload.
 *
 * Invoice layout (A4 portrait, 50pt margins):
 *   - Header: "Dnyanpith" (Cormorant Garamond equivalent via pdfkit Helvetica)
 *   - INVOICE + number + date
 *   - Bill-to block
 *   - Service row (program — plan)
 *   - Amount table: Base ₹X — Discount -₹Y — Total ₹Z
 *   - NO GST line items in Phase 1 (REQUIREMENTS.md PAY-01 revised + DECISION-009;
 *     GST deferred to Phase 2 pending CA advice — founder-approved)
 *   - Footer: Dnyanpith Abhyasika Pvt. Ltd. Ambajogai, Maharashtra
 *
 * After PDF generation, uploads to Cloudinary dnyanpith/invoices/ (private)
 * with type:'authenticated' and 7-day signed URL for user re-download.
 *
 * ARCHITECTURE.md §23.9 + RESEARCH "Don't Hand-Roll" PDF gen row.
 */
import PDFDocument from 'pdfkit';
import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../lib/logger.js';

// Colours matched to brand tokens (CSS vars can't be used in pdfkit)
const NAVY   = '#1A3C5E';
const GOLD   = '#D4A017';
const CREAM  = '#F8F4EF';
const INK    = '#0d1b2a';
const MUTED  = '#5a6e7a';

/**
 * Generate an invoice PDF and upload to Cloudinary.
 *
 * @param {{
 *   registration: object,
 *   user: object,
 *   batch: object|null,
 *   invoiceNumber: string,
 *   paymentDetails: { paymentId: string, capturedAt: Date }
 * }} opts
 * @returns {Promise<{ invoiceNumber: string, invoiceUrl: string, pdfBuffer: Buffer }>}
 */
export async function generateInvoicePdf({ registration, user, batch, invoiceNumber, paymentDetails }) {
  const pdfBuffer = await buildPdf({ registration, user, batch, invoiceNumber, paymentDetails });

  // Upload to Cloudinary private folder with authenticated type
  const publicId = invoiceNumber.replace(/\//g, '-'); // DNY-2026-27-00001

  // Configure Cloudinary lazily — keys may not be set during local preview
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    logger.warn({ invoiceNumber }, 'invoice.upload.skipped: Cloudinary not configured');
    // Return buffer with no URL — the registration still gets paid status
    return { invoiceNumber, invoiceUrl: null, pdfBuffer };
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        format: 'pdf',
        public_id: publicId,
        folder: 'dnyanpith/invoices',
        type: 'authenticated',
        // 7-day signed URL — long enough for user re-download from dashboard
        invalidate: true,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(pdfBuffer);
  });

  // Generate a 7-day signed URL for the authenticated asset
  const invoiceUrl = cloudinary.url(uploadResult.public_id, {
    resource_type: 'raw',
    type: 'authenticated',
    sign_url: true,
    expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
  });

  return { invoiceNumber, invoiceUrl, pdfBuffer };
}

/**
 * Build the PDF buffer using pdfkit.
 * No Cloudinary calls — pure computation.
 *
 * @returns {Promise<Buffer>}
 */
function buildPdf({ registration, user, batch, invoiceNumber, paymentDetails }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const W = doc.page.width - 100; // usable width (margin 50 each side)
    const date = paymentDetails?.capturedAt
      ? new Date(paymentDetails.capturedAt)
      : new Date();
    const dateStr = date.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata',
    });

    const baseAmount   = Number(registration.amount ?? 0);
    const discountAmt  = Number(registration.discountAmount ?? 0);
    const finalAmount  = Number(registration.finalAmount ?? baseAmount);
    const programLabel = programDisplay(registration.program);
    const planLabel    = registration.plan ?? '';
    const batchName    = batch?.name ?? '';

    // ── Header ────────────────────────────────────────────────
    // Brand name
    doc
      .fillColor(NAVY)
      .fontSize(28)
      .font('Helvetica-Bold')
      .text('Dnyanpith', 50, 50);

    // Tagline
    doc
      .fillColor(MUTED)
      .fontSize(9)
      .font('Helvetica')
      .text('Environment changes outcomes.', 50, 82);

    // INVOICE label (right-aligned)
    doc
      .fillColor(GOLD)
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('INVOICE', 50, 50, { align: 'right', width: W });

    // Invoice number + date (right-aligned)
    doc
      .fillColor(INK)
      .fontSize(10)
      .font('Helvetica')
      .text(invoiceNumber, 50, 78, { align: 'right', width: W })
      .text(dateStr, 50, 92, { align: 'right', width: W });

    // Divider
    doc
      .moveDown(0.5)
      .moveTo(50, 115)
      .lineTo(50 + W, 115)
      .strokeColor(GOLD)
      .lineWidth(1)
      .stroke();

    // ── Bill To ───────────────────────────────────────────────
    doc
      .moveDown(1)
      .fillColor(MUTED)
      .fontSize(8)
      .font('Helvetica-Bold')
      .text('BILL TO', 50, 130, { characterSpacing: 1.5 });

    doc
      .fillColor(INK)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(user.name || '', 50, 145);

    doc
      .fillColor(INK)
      .fontSize(10)
      .font('Helvetica')
      .text(user.email || '', 50, 160)
      .text(user.phone || '', 50, 174)
      .text([user.city, user.state].filter(Boolean).join(', ') || '', 50, 188);

    // ── Service Row ───────────────────────────────────────────
    const serviceY = 225;
    doc
      .fillColor(NAVY)
      .fontSize(8)
      .font('Helvetica-Bold')
      .text('DESCRIPTION', 50, serviceY, { characterSpacing: 1.5 })
      .text('AMOUNT', 50 + W - 80, serviceY, { characterSpacing: 1.5 });

    doc
      .moveTo(50, serviceY + 14)
      .lineTo(50 + W, serviceY + 14)
      .strokeColor(NAVY)
      .lineWidth(0.5)
      .stroke();

    const descLine = [programLabel, planLabel, batchName].filter(Boolean).join(' — ');
    doc
      .fillColor(INK)
      .fontSize(10)
      .font('Helvetica')
      .text(descLine, 50, serviceY + 20)
      .text(`₹${baseAmount.toLocaleString('en-IN')}`, 50 + W - 80, serviceY + 20);

    // ── Amount Table ──────────────────────────────────────────
    const tableY = serviceY + 55;

    doc
      .moveTo(50, tableY)
      .lineTo(50 + W, tableY)
      .strokeColor(MUTED)
      .lineWidth(0.5)
      .stroke();

    // Subtotal
    doc
      .fillColor(INK)
      .fontSize(10)
      .font('Helvetica')
      .text('Subtotal', 50 + W - 200, tableY + 8)
      .text(`₹${baseAmount.toLocaleString('en-IN')}`, 50 + W - 80, tableY + 8);

    // Coupon discount (only if applied)
    let finalLineY = tableY + 28;
    if (discountAmt > 0) {
      const couponLabel = registration.couponCode
        ? `Coupon (${registration.couponCode})`
        : 'Discount';
      doc
        .fillColor(MUTED)
        .text(couponLabel, 50 + W - 200, tableY + 28)
        .text(`-₹${discountAmt.toLocaleString('en-IN')}`, 50 + W - 80, tableY + 28);
      finalLineY = tableY + 48;
    }

    // NOTE: No GST line items in Phase 1 — deferred to Phase 2 per REQUIREMENTS.md PAY-01
    // (founder-approved; pending CA advice on GST registration)

    // Divider before total
    doc
      .moveTo(50 + W - 210, finalLineY + 4)
      .lineTo(50 + W, finalLineY + 4)
      .strokeColor(NAVY)
      .lineWidth(0.5)
      .stroke();

    // Total
    doc
      .fillColor(NAVY)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Total', 50 + W - 200, finalLineY + 10)
      .text(`₹${finalAmount.toLocaleString('en-IN')}`, 50 + W - 80, finalLineY + 10);

    // Payment ID reference (small muted)
    if (paymentDetails?.paymentId) {
      doc
        .fillColor(MUTED)
        .fontSize(8)
        .font('Helvetica')
        .text(`Payment ref: ${paymentDetails.paymentId}`, 50, finalLineY + 30);
    }

    // ── Footer ────────────────────────────────────────────────
    const footerY = doc.page.height - 70;
    doc
      .moveTo(50, footerY)
      .lineTo(50 + W, footerY)
      .strokeColor(GOLD)
      .lineWidth(0.5)
      .stroke();

    doc
      .fillColor(MUTED)
      .fontSize(8)
      .font('Helvetica')
      .text(
        'Dnyanpith Abhyasika Pvt. Ltd.  ·  Ambajogai, Maharashtra  ·  hello@dnyanpith.org',
        50,
        footerY + 8,
        { align: 'center', width: W }
      );

    doc.end();
  });
}

/**
 * Map Program enum to display name.
 * @param {string} program
 * @returns {string}
 */
function programDisplay(program) {
  const map = {
    BADLAAV:          'Badlaav Corporate Retreat',
    MISSION_UDAAN:    'Mission Udaan',
    FUTURE_READINESS: 'Future Readiness',
    ANTRANG:          'Antrang',
  };
  return map[program] ?? program;
}
