/**
 * CouponField — enter a code, press Apply, and see the discount before paying.
 *
 * Validates against POST /coupons/validate (read-only pre-flight). The server
 * re-checks and atomically redeems the coupon at payment time, so this is purely
 * UX feedback — the authoritative amount is computed server-side on the order.
 *
 * Props:
 *   program  — enum value for the coupon's applicability check ('BADLAAV', …).
 *   amount   — baseline price (₹, integer) the discount is computed against.
 *   batchId  — selected batch (cuid) for per-batch coupon scoping; optional.
 *   applied  — current applied result ({ code, discountAmount, finalAmount }) or null.
 *   onApply  — called with { code, discountAmount, finalAmount } on a valid code.
 *   onClear  — called when an applied code is removed.
 *   disabled — e.g. while no batch is selected yet (no baseline amount).
 */
import { useState } from 'react';
import { apiClient } from '../../api/client.js';
import { Button } from '../ui/Button.jsx';

const REASON_COPY = {
  NOT_FOUND:      "That code isn't valid for this programme.",
  EXPIRED:        'That code has expired.',
  EXHAUSTED:      'This code has reached its limit.',
  NOT_APPLICABLE: "That code isn't valid for this programme.",
};

export function CouponField({ program, amount, batchId, applied, onApply, onClear, disabled }) {
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  async function apply() {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 2 || !amount) return;
    setChecking(true);
    setError('');
    try {
      const { data } = await apiClient.post('/coupons/validate', {
        code: trimmed,
        program,
        amount: Math.round(amount),
        // Only send batchId when present — the validate schema treats it as optional.
        ...(batchId ? { batchId } : {}),
      });
      if (data.valid) {
        onApply({ code: trimmed, discountAmount: data.discountAmount, finalAmount: data.finalAmount });
      } else {
        setError(REASON_COPY[data.reason] ?? "That code isn't valid.");
      }
    } catch {
      setError("Couldn't check that code. Try again.");
    } finally {
      setChecking(false);
    }
  }

  function remove() {
    setCode('');
    setError('');
    onClear();
  }

  if (applied) {
    return (
      <div className="rounded-lg border border-sage/40 bg-sage/10 px-3 py-2.5 flex items-center justify-between gap-3">
        <p className="font-sans text-sm text-ink">
          <span className="font-semibold">{applied.code}</span> applied — you save ₹
          {Number(applied.discountAmount).toLocaleString('en-IN')}.
        </p>
        <button type="button" onClick={remove} className="font-sans text-xs text-ochre underline underline-offset-2 shrink-0">
          Remove
        </button>
      </div>
    );
  }

  return (
    <div>
      <label className="block font-sans text-sm text-charcoal mb-1">Coupon code (optional)</label>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => { setCode(e.target.value); if (error) setError(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); apply(); } }}
          placeholder="Enter a code if you have one"
          className="flex-1 rounded-lg border border-charcoal/20 bg-pearl px-3 py-2.5 font-sans text-sm uppercase placeholder:normal-case"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={apply}
          loading={checking}
          disabled={disabled || code.trim().length < 2}
        >
          Apply
        </Button>
      </div>
      {disabled && <p className="text-charcoal/60 text-xs mt-1">Choose a batch first to apply a coupon.</p>}
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  );
}
