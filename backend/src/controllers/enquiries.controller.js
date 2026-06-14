/**
 * Enquiries controller — FORM-01 (Corporate) + FORM-06 (College).
 * Request body is pre-validated by validate() middleware before reaching here.
 * Writes to enquiries table; sends Brevo email to admin + thank-you to applicant.
 * Email send failures are caught and logged — they do NOT fail the HTTP response.
 * The DB row is the source of truth; email is secondary.
 */
import { prisma } from '../lib/prisma.js';
import { sendEmail } from '../services/email.service.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'arjun@dnyanpith.org';

/**
 * POST /api/v1/enquiries/corporate
 * Body validated to corporateEnquirySchema by validate middleware.
 */
export async function createCorporateEnquiry(req, res, next) {
  try {
  const { companyName, contactName, designation, phone, email, teamSize, preferredMonth, goals, source } = req.body;

  // ── Dedup guard (Issue 3 FIX) ──────────────────────────────────────────────
  // Prevent the same email from submitting duplicate enquiries within 5 minutes
  // (e.g. double-clicking or refreshing after submit).
  const FIVE_MIN_AGO = new Date(Date.now() - 5 * 60 * 1000);
  const recentEnquiry = await prisma.enquiry.findFirst({
    where: { email, type: 'CORPORATE', createdAt: { gte: FIVE_MIN_AGO } },
    select: { id: true },
  });
  if (recentEnquiry) {
    return res.status(409).json({
      error:   'DUPLICATE_ENQUIRY',
      message: 'Your enquiry was already received. We will contact you shortly.',
    });
  }

  const enquiry = await prisma.enquiry.create({
    data: {
      type:           'CORPORATE',
      name:           contactName,
      organisation:   companyName,
      designation,
      email,
      phone,
      teamSize,
      preferredMonth,
      message:        goals ?? null,
      source:         source ?? null,
      status:         'NEW',
    },
  });

  req.log.info({ formType: 'CORPORATE', enquiryId: enquiry.id }, 'form.submit');

  // Admin notification — non-blocking
  sendEmail({
    to:       ADMIN_EMAIL,
    subject:  `New Corporate Enquiry — ${companyName}`,
    template: 'admin-new-enquiry',
    data: {
      kind:           'Corporate',
      companyName,
      contactName,
      designation,
      email,
      phone,
      teamSize,
      preferredMonth,
      goals:          goals ?? '—',
      source:         source ?? '—',
      enquiryId:      enquiry.id,
    },
  }).catch((err) => req.log.error({ err, enquiryId: enquiry.id }, 'email.admin.failed'));

  // Applicant thank-you — non-blocking
  sendEmail({
    to:       email,
    subject:  'We got your enquiry — Dnyanpith',
    template: 'applicant-thank-you',
    data: { name: contactName, kind: 'corporate enquiry' },
  }).catch((err) => req.log.error({ err, enquiryId: enquiry.id }, 'email.applicant.failed'));

  return res.status(201).json({ enquiryId: enquiry.id });
  } catch (err) { next(err); }
}

/**
 * POST /api/v1/enquiries/college
 * Body validated to collegeAssociationSchema by validate middleware.
 */
export async function createCollegeEnquiry(req, res, next) {
  try {
  const { collegeName, district, principalName, officialEmail, officialPhone, finalYearStudents, hasPlacementCell, message } = req.body;

  // ── Dedup guard (Issue 3 FIX) ──────────────────────────────────────────────
  const FIVE_MIN_AGO = new Date(Date.now() - 5 * 60 * 1000);
  const recentEnquiry = await prisma.enquiry.findFirst({
    where: { email: officialEmail, type: 'COLLEGE', createdAt: { gte: FIVE_MIN_AGO } },
    select: { id: true },
  });
  if (recentEnquiry) {
    return res.status(409).json({
      error:   'DUPLICATE_ENQUIRY',
      message: 'Your enquiry was already received. We will contact you shortly.',
    });
  }

  const enquiry = await prisma.enquiry.create({
    data: {
      type:         'COLLEGE',
      name:         principalName,
      organisation: collegeName,
      email:        officialEmail,
      phone:        officialPhone,
      message:      message ?? null,
      source:       district,   // repurpose source field for district since schema has no dedicated column
      status:       'NEW',
    },
  });

  req.log.info({ formType: 'COLLEGE', enquiryId: enquiry.id }, 'form.submit');

  sendEmail({
    to:       ADMIN_EMAIL,
    subject:  `New College Association — ${collegeName}`,
    template: 'admin-new-college',
    data: {
      collegeName,
      district,
      principalName,
      officialEmail,
      officialPhone,
      finalYearStudents,
      hasPlacementCell: hasPlacementCell ? 'Yes' : 'No',
      message:          message ?? '—',
      enquiryId:        enquiry.id,
    },
  }).catch((err) => req.log.error({ err, enquiryId: enquiry.id }, 'email.admin.failed'));

  // Applicant thank-you
  sendEmail({
    to:       officialEmail,
    subject:  'We got your association request — Dnyanpith',
    template: 'applicant-thank-you',
    data: { name: principalName, kind: 'college association request' },
  }).catch((err) => req.log.error({ err, enquiryId: enquiry.id }, 'email.applicant.failed'));

  return res.status(201).json({ enquiryId: enquiry.id });
  } catch (err) { next(err); }
}
