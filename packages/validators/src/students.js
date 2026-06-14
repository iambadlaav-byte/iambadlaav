/**
 * Mission Udaan student schema — FORM-05.
 * FRONTEND-ONLY navigation gate — no backend POST endpoint.
 * On valid submit, redirects to /register?program=mission-udaan&plan=<plan>&...
 * Step 1 of FORM-02 (Plan 05) pre-fills from these URL params.
 * Never creates an enquiries row (broken double-entry journey eliminated).
 */
import { z } from 'zod';
import { indianPhone, email, mhDistrict } from './shared.js';

export const TARGET_EXAMS = ['MPSC', 'UPSC', 'PSI', 'STI', 'RTS', 'OTHER'];
export const QUALIFICATION_OPTIONS = ['GRADUATION', 'PG', 'OTHER'];
export const PLAN_OPTIONS = ['MONTHLY', 'QUARTERLY', 'ANNUAL'];

/**
 * FORM-05 — Mission Udaan Student (Navigation Form)
 * Valid submit → navigate('/register?program=mission-udaan&plan=<plan>&...')
 * Fields captured as URL params for FORM-02 Step 1 pre-fill.
 */
export const missionUdaanStudentSchema = z.strictObject({
  fullName:         z.string().trim().min(2, 'Name is too short.').max(120, 'Name must be 120 characters or fewer.'),
  phone:            indianPhone,
  email,
  qualification:    z.enum(['GRADUATION', 'PG', 'OTHER'], {
    errorMap: () => ({ message: 'Select your qualification.' }),
  }),
  targetExams:      z.array(
    z.enum(TARGET_EXAMS, { errorMap: () => ({ message: 'Select a valid exam type.' }) })
  ).min(1, 'Select at least one target exam.').max(6, 'You can select up to six exams.'),
  previousAttempts: z.coerce.number().int().min(0, 'Enter 0 or more.').max(20, 'Maximum 20 attempts.'),
  homeDistrict:     mhDistrict,
  plan:             z.enum(['MONTHLY', 'QUARTERLY', 'ANNUAL'], {
    errorMap: () => ({ message: 'Select a plan.' }),
  }),
  parentName:       z.string().trim().max(120, 'Parent name must be 120 characters or fewer.').optional(),
  parentContact:    indianPhone.optional(),
  couponCode:       z.string().trim().max(40, 'Coupon code must be 40 characters or fewer.').optional(),
});
