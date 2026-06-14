/**
 * RegistrationStep1 — URL-param pre-fill handler for the FORM-05 → FORM-02 handoff.
 *
 * FORM-05 (MissionUdaanStudentForm) redirects to:
 *   /register?program=mission-udaan&plan=ANNUAL&qualification=BSc&targetExams=UPSC,MPSC
 *           &previousAttempts=1&homeDistrict=Beed&fullName=Test+User
 *           &email=test@example.com&phone=9876543210
 *
 * On mount:
 *   1. Read URL params via useSearchParams().
 *   2. Pre-fill RHF fields that exist in registrationCreateSchema:
 *        program, plan, fullName, email, phone, city (mapped from homeDistrict), state.
 *   3. Fields NOT in registrationCreateSchema (qualification, targetExams,
 *      previousAttempts, homeDistrict) are intentionally ignored — they were
 *      collected by FORM-05 and stored in the enquiry/student row. We don't
 *      re-collect them in FORM-02 (T-05-16: URL params are pre-fill convenience,
 *      never trusted — server re-validates all fields).
 *   4. If `program` param is present, auto-lock the program chip.
 *   5. If both `program` and `plan` are present (Mission Udaan flow), signal
 *      parent to skip Step 2.
 *
 * This component renders its children (StepPersonal) and manages auto-advance logic.
 */
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFormContext } from 'react-hook-form';

// Program enum normalisation: URL uses lowercase slug, schema uses UPPER_SNAKE
const SLUG_TO_ENUM = {
  'mission-udaan':    'MISSION_UDAAN',
  'badlaav':          'BADLAAV',
  'future-readiness': 'FUTURE_READINESS',
  'antrang':          'ANTRANG',
};

// Plan normalisation: URL uses any case, schema uses UPPER
function normalisePlan(plan) {
  if (!plan) return null;
  return plan.toUpperCase();
}

/**
 * @param {{
 *   children: React.ReactNode,
 *   onProgramLocked: (locked: boolean) => void,
 *   onSkipStep2: (skip: boolean) => void
 * }} props
 */
export function RegistrationStep1({ children, onProgramLocked, onSkipStep2 }) {
  const [searchParams] = useSearchParams();
  const { setValue } = useFormContext();

  useEffect(() => {
    // Read URL params (FORM-05 handoff)
    const programSlug = searchParams.get('program');
    const plan        = searchParams.get('plan');
    const fullName    = searchParams.get('fullName');
    const email       = searchParams.get('email');
    const phone       = searchParams.get('phone');
    // homeDistrict maps to city in FORM-02 (closest equivalent field)
    const homeDistrict = searchParams.get('homeDistrict');
    // couponCode may also come from URL (e.g. marketing campaign links)
    const couponCode  = searchParams.get('couponCode');

    let programEnum = null;
    if (programSlug) {
      programEnum = SLUG_TO_ENUM[programSlug.toLowerCase()] ?? programSlug.toUpperCase();
    }

    // Pre-fill fields that exist in registrationCreateSchema
    if (programEnum) {
      setValue('program', programEnum, { shouldValidate: false });
      onProgramLocked?.(true);
    }

    const normPlan = normalisePlan(plan);
    if (normPlan) {
      setValue('plan', normPlan, { shouldValidate: false });
    }

    if (fullName)      setValue('fullName',    fullName,    { shouldValidate: false });
    if (email)         setValue('email',        email,       { shouldValidate: false });
    if (phone)         setValue('phone',        phone,       { shouldValidate: false });
    // homeDistrict → city (Mission Udaan students are from MH districts)
    if (homeDistrict)  setValue('city',         homeDistrict, { shouldValidate: false });
    if (couponCode)    setValue('couponCode',   couponCode.toUpperCase(), { shouldValidate: false });

    // Skip Step 2 only for Mission Udaan — it's subscription-based (no batch selection).
    // Badlaav, Future Readiness, etc. still need Step 2 for batch + seat selection.
    if (programEnum === 'MISSION_UDAAN' && normPlan) {
      onSkipStep2?.(true);
    }
  }, []); // Run once on mount — URL params don't change during session

  return children;
}
