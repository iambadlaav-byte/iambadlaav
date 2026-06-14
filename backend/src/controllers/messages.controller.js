/**
 * Messages controller — FORM-09 (Generic Contact).
 * Writes to messages table (separate from enquiries per REQ-form-09 + ARCH §9.9).
 */
import { prisma } from '../lib/prisma.js';
import { sendEmail } from '../services/email.service.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'arjun@dnyanpith.org';

const ENQUIRY_TYPE_LABELS = {
  GENERAL:          'General',
  BADLAAV:          'Badlaav',
  MISSION_UDAAN:    'Mission Udaan',
  FUTURE_READINESS: 'Future Readiness',
  COMMUNITY:        'Community',
  PRESS:            'Press',
  PARTNERSHIP:      'Partnership',
};

/**
 * POST /api/v1/messages
 * Body validated to genericContactSchema by validate middleware.
 */
export async function createMessage(req, res) {
  const { name, email, enquiryType, message, phone } = req.body;

  // ── Dedup guard (Issue 4 FIX) ─────────────────────────────────────────────
  // Prevent the same email from flooding the inbox (e.g. network retry on slow connection).
  const FIVE_MIN_AGO = new Date(Date.now() - 5 * 60 * 1000);
  const recent = await prisma.message.findFirst({
    where: { email, createdAt: { gte: FIVE_MIN_AGO } },
    select: { id: true },
  });
  if (recent) {
    return res.status(409).json({
      error:   'DUPLICATE_MESSAGE',
      message: 'Your message was already received. We will get back to you shortly.',
    });
  }

  const msg = await prisma.message.create({
    data: {
      name,
      email,
      phone:  phone ?? null,
      type:   enquiryType,
      message,
      isRead: false,
    },
  });

  req.log.info({ formType: 'CONTACT', enquiryType, messageId: msg.id }, 'form.submit');

  sendEmail({
    to:       ADMIN_EMAIL,
    subject:  `New Message — ${ENQUIRY_TYPE_LABELS[enquiryType] || enquiryType} — ${name}`,
    template: 'admin-new-message',
    data: {
      name,
      email,
      phone:        phone ?? '—',
      enquiryType:  ENQUIRY_TYPE_LABELS[enquiryType] || enquiryType,
      message,
      messageId:    msg.id,
    },
  }).catch((err) => req.log.error({ err, messageId: msg.id }, 'email.admin.failed'));

  return res.status(201).json({ messageId: msg.id });
}
