/**
 * Enquiry schemas — FORM-01 (Corporate) + FORM-06 (College Association).
 * Shared between frontend (via @validators alias) and backend (via workspace).
 * Both use z.strictObject() to reject unknown fields (CONSTRAINT-API-002).
 */
import { z } from 'zod';
import { indianPhone, businessEmail, mhDistrict } from './shared.js';

/**
 * FORM-01 — Corporate Enquiry
 * POST /api/v1/enquiries/corporate
 * Writes to enquiries table with type=CORPORATE.
 */
export const corporateEnquirySchema = z.strictObject({
  companyName:    z.string().trim().min(2, 'Company name is too short.').max(120, 'Company name must be 120 characters or fewer.'),
  contactName:    z.string().trim().min(2, 'Name is too short.').max(120, 'Name must be 120 characters or fewer.'),
  designation:    z.string().trim().min(2, 'Designation is too short.').max(80, 'Designation must be 80 characters or fewer.'),
  phone:          indianPhone,
  email:          businessEmail,
  teamSize:       z.enum(['5-10', '11-20', '21-30', '30+'], {
    errorMap: () => ({ message: 'Select a team size.' }),
  }),
  preferredMonth: z.string()
    .regex(/^\d{4}-\d{2}$/, 'Preferred month must be in YYYY-MM format.')
    .refine((val) => {
      const [year, month] = val.split('-').map(Number);
      const date = new Date(year, month - 1, 1);
      const now = new Date();
      const sixMonthsOut = new Date(now.getFullYear(), now.getMonth() + 6, 1);
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return date >= startOfThisMonth && date <= sixMonthsOut;
    }, 'Choose a month within the next six months.'),
  goals:          z.string().trim().max(500, 'Goals must be 500 characters or fewer.').optional(),
  source:         z.enum(['instagram', 'referral', 'whatsapp', 'other']).optional(),
});

/**
 * FORM-06 — College Association Enquiry
 * POST /api/v1/enquiries/college
 * Writes to enquiries table with type=COLLEGE.
 */
export const collegeAssociationSchema = z.strictObject({
  collegeName:        z.string().trim().min(2, 'College name is too short.').max(160, 'College name must be 160 characters or fewer.'),
  district:           mhDistrict,
  principalName:      z.string().trim().min(2, 'Name is too short.').max(120, 'Name must be 120 characters or fewer.'),
  officialEmail:      businessEmail,
  officialPhone:      indianPhone,
  finalYearStudents:  z.coerce.number().int().min(1, 'Enter at least 1 student.').max(10000, 'Value too large.'),
  hasPlacementCell:   z.boolean().optional(),
  message:            z.string().trim().max(500, 'Message must be 500 characters or fewer.').optional(),
});
