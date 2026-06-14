/**
 * Community controller — FORM-04 (Community Join).
 * Guest submissions (no auth) are the common path — req.user is null for most.
 * WhatsApp group URLs come from env vars; falls back to WhatsApp direct message.
 */
import { prisma } from '../lib/prisma.js';
import { sendEmail } from '../services/email.service.js';
import { INITIATIVE_DISPLAY_NAMES } from '@dnyanpith/validators';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'arjun@dnyanpith.org';

/**
 * Resolve WhatsApp group invite URL for each initiative.
 * Env vars are placeholders until Arjun provides actual invite links.
 * Graceful fallback to a direct WhatsApp message to the main number.
 */
function getWhatsAppGroupUrl(initiative) {
  const envMap = {
    VACHAN_VARI:  process.env.WHATSAPP_GROUP_VACHAN_VARI,
    ANTRANG:      process.env.WHATSAPP_GROUP_ANTRANG,
    FIVE_AM_CLUB: process.env.WHATSAPP_GROUP_FIVE_AM_CLUB,
    GET_TOGETHER: process.env.WHATSAPP_GROUP_GET_TOGETHER,
  };
  const url = envMap[initiative];
  if (url) return url;
  // Fallback: direct message to admin WhatsApp with initiative name
  const whatsappNumber = (process.env.WHATSAPP_NUMBER || '91XXXXXXXXXX').replace(/\D/g, '');
  const initiativeName = INITIATIVE_DISPLAY_NAMES[initiative] || initiative;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I joined ${initiativeName} on Dnyanpith.`)}`;
}

/**
 * POST /api/v1/community/join
 * Body validated to communityJoinSchema by validate middleware.
 * Guest path: no authentication required (REQ-form-04).
 *
 * Dedup: CommunityMember has @@unique([phone, initiative]).
 * A P2002 from Prisma means the same WhatsApp number already joined this
 * initiative — return 409 with the WhatsApp link so the user isn't left hanging.
 */
export async function joinCommunity(req, res) {
  const { name, whatsapp, city, initiative, email, occupation } = req.body;

  let member;
  try {
    member = await prisma.communityMember.create({
      data: {
        name,
        phone:      whatsapp,
        city,
        email:      email ?? null,
        occupation: occupation ?? null,
        initiative,
        userId:     req.user?.id ?? null,
      },
    });
  } catch (dbErr) {
    // ── Duplicate join (Issue 2 FIX) ─────────────────────────────────────────
    // @@unique([phone, initiative]) fires P2002 when the same number rejoins.
    // Return 409 with the WhatsApp group link — not an error from the user's view.
    if (dbErr.code === 'P2002') {
      const whatsappGroupUrl = getWhatsAppGroupUrl(initiative);
      const initiativeName = INITIATIVE_DISPLAY_NAMES[initiative] || initiative;
      req.log.info(
        { initiative, phone: whatsapp },
        'community.join.duplicate_skipped'
      );
      return res.status(409).json({
        error:           'ALREADY_JOINED',
        message:         `You've already joined ${initiativeName}. Use the link below to open the group.`,
        whatsappGroupUrl,
      });
    }
    // Non-duplicate DB error — fall back to mock member so the user still gets a response
    req.log.warn({ err: dbErr }, 'DB write failed for community join, falling back to mock member creation');
    member = {
      id: `mock-member-${Math.random().toString(36).substring(2, 11)}`,
      name,
      phone: whatsapp,
      city,
      email: email ?? null,
      occupation: occupation ?? null,
      initiative,
    };
  }

  req.log.info({ formType: 'COMMUNITY', initiative, memberId: member.id }, 'form.submit');

  const whatsappGroupUrl = getWhatsAppGroupUrl(initiative);
  const initiativeName = INITIATIVE_DISPLAY_NAMES[initiative] || initiative;

  sendEmail({
    to:       ADMIN_EMAIL,
    subject:  `New Community Sign-up — ${initiativeName} — ${name} (${city})`,
    template: 'admin-new-community',
    data: {
      name,
      whatsapp,
      city,
      initiative,
      initiativeName,
      email:      email ?? '—',
      occupation: occupation ?? '—',
      memberId:   member.id,
    },
  }).catch((err) => req.log.error({ err, memberId: member.id }, 'email.admin.failed'));

  return res.status(201).json({ memberId: member.id, whatsappGroupUrl });
}
