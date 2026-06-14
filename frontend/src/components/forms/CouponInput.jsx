/**
 * CouponInput — coupon code input with real-time server-side validation.
 *
 * On Apply button click OR blur (debounced 400ms):
 *   - POST /api/v1/coupons/validate with { code, program, amount }
 *   - valid:true  → sage border + "CODE applied — ₹N off" helper
 *   - valid:false → danger border + reason copy per UI-SPEC §Copywriting Coupon
 *
 * Anti-pattern avoided: discount is NOT computed client-side from the response.
 * The server validates; the UI shows feedback. The actual discount applied at
 * registration POST is server-side again (Pitfall 3 — RESEARCH).
 *
 * Updates parent RHF state via Controller setValue('couponCode') and
 * setValue('_couponPreview') for display purposes only (not sent to backend).
 */
import { useState, useRef, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { cn } from '../../lib/cn.js';
import { apiClient } from '../../api/client.js';
import { Spinner } from '../ui/Spinner.jsx';

// Reason-to-copy map per UI-SPEC §Copywriting Coupon
const REASON_COPY = {
  NOT_FOUND:      "That code isn't valid for this program.",
  EXPIRED:        'That code has expired.',
  EXHAUSTED:      'This code has reached its limit.',
  NOT_APPLICABLE: "That code isn't valid for this program.",
};

export function CouponInput({ program, baseAmount }) {
  const { setValue, watch } = useFormContext();
  const couponCode = watch('couponCode') ?? '';

  const [status, setStatus]           = useState('idle'); // 'idle' | 'loading' | 'valid' | 'invalid'
  const [helperText, setHelperText]   = useState('');
  const [discount, setDiscount]       = useState(null);
  const debounceRef                   = useRef(null);

  const validate = useCallback(
    async (code) => {
      if (!code || code.trim().length < 2) {
        setStatus('idle');
        setHelperText('');
        setDiscount(null);
        setValue('_couponPreview', null);
        return;
      }

      setStatus('loading');

      try {
        const res = await apiClient.post('/coupons/validate', {
          code:    code.trim().toUpperCase(),
          program,
          amount:  baseAmount,
        });
        const data = res.data;

        if (data.valid) {
          setStatus('valid');
          setHelperText(`${code.trim().toUpperCase()} applied — ₹${data.discountAmount.toLocaleString('en-IN')} off`);
          setDiscount({ discountAmount: data.discountAmount, finalAmount: data.finalAmount });
          setValue('_couponPreview', { discountAmount: data.discountAmount, finalAmount: data.finalAmount });
        } else {
          setStatus('invalid');
          setHelperText(REASON_COPY[data.reason] ?? "That code isn't valid.");
          setDiscount(null);
          setValue('_couponPreview', null);
        }
      } catch {
        // Backend down (expected during local UI preview without backend)
        setStatus('invalid');
        setHelperText('Could not validate code — check your connection.');
        setDiscount(null);
        setValue('_couponPreview', null);
      }
    },
    [program, baseAmount, setValue]
  );

  const handleChange = (e) => {
    const val = e.target.value;
    setValue('couponCode', val.toUpperCase());

    // Reset state on change
    setStatus('idle');
    setHelperText('');
    setDiscount(null);
    setValue('_couponPreview', null);

    // Debounce validation 400ms after typing stops
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => validate(val), 400);
  };

  const handleBlur = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    validate(couponCode);
  };

  const handleApply = (e) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    validate(couponCode);
  };

  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-widest text-muted block mb-1.5">
        Coupon code <span className="normal-case tracking-normal">(optional)</span>
      </label>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={couponCode}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. WELCOME500"
            maxLength={40}
            autoComplete="off"
            className={cn(
              'w-full px-3 py-2.5 rounded border bg-cream font-mono text-sm',
              'focus:outline-none focus:ring-2 focus:ring-offset-1',
              'transition-colors duration-150',
              status === 'idle'    && 'border-soft focus:ring-teal',
              status === 'loading' && 'border-soft focus:ring-teal',
              status === 'valid'   && 'border-sage focus:ring-sage',
              status === 'invalid' && 'border-danger focus:ring-danger'
            )}
          />
          {status === 'loading' && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <Spinner size={14} />
            </span>
          )}
        </div>

        <button
          onClick={handleApply}
          type="button"
          disabled={status === 'loading' || !couponCode.trim()}
          className={cn(
            'px-4 py-2.5 rounded border border-teal text-teal text-sm font-medium',
            'hover:bg-teal hover:text-pearl transition-colors duration-150',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal'
          )}
        >
          Apply
        </button>
      </div>

      {/* Helper text */}
      {helperText && (
        <p
          className={cn(
            'mt-1.5 text-sm',
            status === 'valid'   && 'text-sage',
            status === 'invalid' && 'text-danger'
          )}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
