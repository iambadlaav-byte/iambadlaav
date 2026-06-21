/**
 * invoice.service.js — pdfkit-based PDF generation + Cloudinary upload.
 *
 * Two documents, both branded "Badlaav" (warm green / terracotta palette):
 *   1. generateInvoicePdf()      — the tax-style invoice (uploaded to Cloudinary,
 *                                  signed URL returned for dashboard re-download).
 *   2. generateRegistrationPass() — the participant's arrival pass: big candidate ID,
 *                                  programme, batch dates, venue + map, help contact.
 *                                  Returned as a raw buffer for email attachment only
 *                                  (no upload — it is regenerable and carries no money).
 *
 * Colours are hard-coded here because pdfkit can't read CSS variables; they mirror the
 * frontend Badlaav tokens (deep green, terracotta, warm cream).
 *
 * NO GST line items in Phase 1 (deferred pending CA advice — founder-approved).
 */
import PDFDocument from 'pdfkit';
import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../lib/logger.js';

// ── Badlaav brand palette (mirrors frontend tokens; pdfkit needs literal hex) ──
const GREEN = '#015243'; // deep forest green — primary surfaces
const TERRA = '#A03E1B'; // terracotta — accent / candidate-ID panel
const GOLD  = '#FAD062'; // warm gold — labels on dark
const CREAM = '#FFF0EA'; // warm blush — soft panels
const INK   = '#373735'; // charcoal — body text
const MUTED = '#7a756f'; // muted brown-grey — secondary text
const PEARL = '#FFFFFF';

const CONTACT_EMAIL = 'iambadlaav@gmail.com';
const CONTACT_PHONE = '7409339740';
const FOOTER_LINE   = `Badlaav  ·  Ambajogai, Maharashtra  ·  ${CONTACT_EMAIL}  ·  ${CONTACT_PHONE}`;

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
 * @returns {Promise<{ invoiceNumber: string, invoiceUrl: string|null, pdfBuffer: Buffer }>}
 */
export async function generateInvoicePdf({ registration, user, batch, invoiceNumber, paymentDetails }) {
  const pdfBuffer = await buildInvoicePdf({ registration, user, batch, invoiceNumber, paymentDetails });

  // Upload to Cloudinary private folder with authenticated type
  const publicId = invoiceNumber.replace(/\//g, '-'); // BAD-2026-27-00001

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
        folder: 'badlaav/invoices',
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
 * Build the invoice PDF buffer using pdfkit. No Cloudinary calls — pure computation.
 * @returns {Promise<Buffer>}
 */
function buildInvoicePdf({ registration, user, batch, invoiceNumber, paymentDetails }) {
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
    const dateStr = formatDate(date);

    const baseAmount   = Number(registration.amount ?? 0);
    const discountAmt  = Number(registration.discountAmount ?? 0);
    const finalAmount  = Number(registration.finalAmount ?? baseAmount);
    const programLabel = programDisplay(registration.program);
    const planLabel    = registration.plan ?? '';
    const batchName    = batch?.name ?? '';

    // ── Header ────────────────────────────────────────────────
    doc
      .fillColor(GREEN)
      .fontSize(28)
      .font('Helvetica-Bold')
      .text('Badlaav', 50, 50);

    doc
      .fillColor(MUTED)
      .fontSize(9)
      .font('Helvetica')
      .text('A turning point, not a trip.', 50, 82);

    // INVOICE label (right-aligned)
    doc
      .fillColor(TERRA)
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('INVOICE', 50, 50, { align: 'right', width: W });

    doc
      .fillColor(INK)
      .fontSize(10)
      .font('Helvetica')
      .text(invoiceNumber, 50, 78, { align: 'right', width: W })
      .text(dateStr, 50, 92, { align: 'right', width: W });

    // Divider
    doc
      .moveTo(50, 115)
      .lineTo(50 + W, 115)
      .strokeColor(GOLD)
      .lineWidth(1)
      .stroke();

    // ── Bill To ───────────────────────────────────────────────
    doc
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
      .fillColor(GREEN)
      .fontSize(8)
      .font('Helvetica-Bold')
      .text('DESCRIPTION', 50, serviceY, { characterSpacing: 1.5 })
      .text('AMOUNT', 50 + W - 80, serviceY, { characterSpacing: 1.5 });

    doc
      .moveTo(50, serviceY + 14)
      .lineTo(50 + W, serviceY + 14)
      .strokeColor(GREEN)
      .lineWidth(0.5)
      .stroke();

    const descLine = [programLabel, planLabel, batchName].filter(Boolean).join(' — ');
    doc
      .fillColor(INK)
      .fontSize(10)
      .font('Helvetica')
      .text(descLine, 50, serviceY + 20, { width: W - 100 })
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

    // NOTE: No GST line items in Phase 1 — deferred pending CA advice (founder-approved)

    // Divider before total
    doc
      .moveTo(50 + W - 210, finalLineY + 4)
      .lineTo(50 + W, finalLineY + 4)
      .strokeColor(GREEN)
      .lineWidth(0.5)
      .stroke();

    // Total
    doc
      .fillColor(GREEN)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Total', 50 + W - 200, finalLineY + 10)
      .text(`₹${finalAmount.toLocaleString('en-IN')}`, 50 + W - 80, finalLineY + 10);

    // Payment reference (small muted)
    const refParts = [];
    if (registration.candidateId)   refParts.push(`Candidate ID: ${registration.candidateId}`);
    if (paymentDetails?.paymentId)  refParts.push(`Payment ref: ${paymentDetails.paymentId}`);
    if (refParts.length) {
      doc
        .fillColor(MUTED)
        .fontSize(8)
        .font('Helvetica')
        .text(refParts.join('     '), 50, finalLineY + 32);
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
      .text(FOOTER_LINE, 50, footerY + 8, { align: 'center', width: W });

    doc.end();
  });
}

/**
 * Generate the participant's Registration Pass PDF (arrival document).
 *
 * Pure computation — returns a raw buffer for email attachment. Not uploaded:
 * it carries no financial data and can be regenerated from the registration row.
 *
 * @param {{ registration: object, user: object, batch: object|null, candidateId: string }} opts
 * @returns {Promise<Buffer>}
 */
export function generateRegistrationPass({ registration, user, batch, candidateId }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageW = doc.page.width;
    const W = pageW - 100; // usable width
    const L = 50;          // left margin

    const programLabel = programDisplay(registration.program);
    const planLabel    = planDisplay(registration.plan);
    const batchName    = batch?.name ?? '';
    const dateRange    = batch?.startDate ? formatDateRange(batch.startDate, batch.endDate) : '';
    const venue        = batch?.venue || '';
    const address      = batch?.address || '';
    const mapLink      = batch?.mapLink || '';

    // ── Header band (full-bleed green) ────────────────────────
    doc.rect(0, 0, pageW, 132).fill(GREEN);

    doc
      .fillColor(PEARL)
      .fontSize(30)
      .font('Helvetica-Bold')
      .text('Badlaav', L, 42);

    doc
      .fillColor(GOLD)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('REGISTRATION PASS', L, 82, { characterSpacing: 3 });

    // Programme (right-aligned, on the band)
    doc
      .fillColor(PEARL)
      .fontSize(13)
      .font('Helvetica-Bold')
      .text(programLabel, L, 58, { align: 'right', width: W });

    // ── Candidate ID panel (terracotta) ──────────────────────
    const panelY = 168;
    const panelH = 82;
    doc.roundedRect(L, panelY, W, panelH, 10).fill(TERRA);

    doc
      .fillColor('#F6D9CC')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('CANDIDATE ID', L + 24, panelY + 18, { characterSpacing: 2 });

    doc
      .fillColor(PEARL)
      .fontSize(30)
      .font('Helvetica-Bold')
      .text(candidateId || '—', L + 24, panelY + 36);

    // Participant name on the right of the panel
    doc
      .fillColor('#F6D9CC')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('PARTICIPANT', L + 24, panelY + 18, { width: W - 48, align: 'right', characterSpacing: 2 });
    doc
      .fillColor(PEARL)
      .fontSize(15)
      .font('Helvetica-Bold')
      .text(user.name || '', L + 24, panelY + 38, { width: W - 48, align: 'right' });

    // ── Details grid ──────────────────────────────────────────
    let y = panelY + panelH + 30;
    y = detailRow(doc, L, y, W, 'Programme', programLabel);
    if (planLabel)  y = detailRow(doc, L, y, W, 'Plan', planLabel);
    if (batchName)  y = detailRow(doc, L, y, W, 'Batch', batchName);
    if (dateRange)  y = detailRow(doc, L, y, W, 'Dates', dateRange);
    y = detailRow(doc, L, y, W, 'Email', user.email || '');
    y = detailRow(doc, L, y, W, 'Phone', user.phone || '');

    // ── Venue panel (cream) ───────────────────────────────────
    if (venue || address || mapLink) {
      y += 12;
      const vLines = [venue, address].filter(Boolean);
      const vH = 56 + vLines.length * 14 + (mapLink ? 18 : 0);
      doc.roundedRect(L, y, W, vH, 10).fill(CREAM);

      doc
        .fillColor(TERRA)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('WHERE TO REACH', L + 20, y + 16, { characterSpacing: 2 });

      let vy = y + 34;
      if (venue) {
        doc.fillColor(INK).fontSize(12).font('Helvetica-Bold').text(venue, L + 20, vy, { width: W - 40 });
        vy += 16;
      }
      if (address) {
        doc.fillColor(INK).fontSize(10).font('Helvetica').text(address, L + 20, vy, { width: W - 40 });
        vy += 14;
      }
      if (mapLink) {
        doc
          .fillColor(GREEN)
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('Open in Google Maps →', L + 20, vy + 2, { link: mapLink, underline: true });
      }
      y += vH;
    }

    // ── Note ──────────────────────────────────────────────────
    y += 22;
    doc
      .fillColor(MUTED)
      .fontSize(10)
      .font('Helvetica')
      .text(
        'Please carry this pass — printed or on your phone — on the day you arrive. ' +
        `Any questions before then, write to ${CONTACT_EMAIL} or call ${CONTACT_PHONE}. ` +
        'We are glad you said yes.',
        L, y, { width: W, lineGap: 3 }
      );

    // ── Footer ────────────────────────────────────────────────
    const footerY = doc.page.height - 64;
    doc
      .moveTo(L, footerY)
      .lineTo(L + W, footerY)
      .strokeColor(GOLD)
      .lineWidth(0.5)
      .stroke();
    doc
      .fillColor(MUTED)
      .fontSize(8)
      .font('Helvetica')
      .text(FOOTER_LINE, L, footerY + 8, { align: 'center', width: W });

    doc.end();
  });
}

/** One label/value row in the pass details grid. Returns the next y. */
function detailRow(doc, x, y, w, label, value) {
  doc
    .fillColor(MUTED)
    .fontSize(8)
    .font('Helvetica-Bold')
    .text(label.toUpperCase(), x, y, { width: 120, characterSpacing: 1.5 });
  const h = doc
    .fillColor(INK)
    .fontSize(11)
    .font('Helvetica')
    .text(value || '—', x + 130, y - 1, { width: w - 130 })
    .heightOfString(value || '—', { width: w - 130 });
  return y + Math.max(20, h + 8);
}

/** "12–14 August 2026" (collapses the month/year when the range shares them). */
function formatDateRange(start, end) {
  const s = new Date(start);
  const e = end ? new Date(end) : s;
  const optsFull = { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' };
  if (!end || s.getTime() === e.getTime()) return s.toLocaleDateString('en-IN', optsFull);

  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  if (sameMonth) {
    const month = e.toLocaleDateString('en-IN', { month: 'long', timeZone: 'Asia/Kolkata' });
    const year  = e.toLocaleDateString('en-IN', { year: 'numeric', timeZone: 'Asia/Kolkata' });
    return `${s.getDate()}–${e.getDate()} ${month} ${year}`;
  }
  return `${s.toLocaleDateString('en-IN', optsFull)} – ${e.toLocaleDateString('en-IN', optsFull)}`;
}

/** "12 August 2026" in IST. */
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata',
  });
}

/**
 * Map Program enum to display name. The enum values are repurposed (see schema notes):
 * BADLAAV = The Retreat, FUTURE_READINESS = The Badlaav Experience.
 * @param {string} program
 */
function programDisplay(program) {
  const map = {
    BADLAAV:          'The Retreat',
    FUTURE_READINESS: 'The Badlaav Experience',
    MISSION_UDAAN:    'Future Programme',
    ANTRANG:          'Future Programme',
  };
  return map[program] ?? program;
}

/** Humanise the stored plan slug for display. */
function planDisplay(plan) {
  if (!plan) return '';
  const map = {
    individual:       'Individual',
    couple:           'Couple',
    corporate_batch:  'Corporate Batch',
    corporate_annual: 'Corporate Annual',
  };
  return map[plan] ?? plan.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
