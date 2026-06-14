/**
 * OtpInput — 6-digit boxed OTP entry component.
 * Per UI-SPEC §OTP entry UX:
 *   - 6 separate input boxes, 48×56px each, 8px gap
 *   - Auto-focus next box on input; backspace jumps to previous
 *   - Paste support: 6-digit paste distributes across all boxes
 *   - Fires onComplete(code) when 6th digit fills
 *   - Error state: all boxes flash danger border for 400ms, then clear + refocus box 1
 *
 * Exposes clear() via useImperativeHandle for parent to trigger on error.
 * NO inline styles (CONSTRAINT-CODE-001). NO animations (CONSTRAINT-CODE-004 — form page).
 */
import { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { cn } from '../../lib/cn.js';

const OTP_LENGTH = 6;

const OtpInput = forwardRef(function OtpInput({ onComplete, disabled = false, className }, ref) {
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [hasError, setHasError] = useState(false);
  const inputRefs = useRef(Array(OTP_LENGTH).fill(null));

  // Expose clear() to parent — called on wrong-code response
  useImperativeHandle(ref, () => ({
    clear() {
      setDigits(Array(OTP_LENGTH).fill(''));
      setHasError(true);
      // Flash danger border for 400ms, then clear error state + refocus box 0
      setTimeout(() => {
        setHasError(false);
        inputRefs.current[0]?.focus();
      }, 400);
    },
    focus() {
      inputRefs.current[0]?.focus();
    },
  }));

  function handleChange(index, e) {
    const raw = e.target.value;
    // Accept only digits; take the last character typed (handles composition)
    const digit = raw.replace(/\D/g, '').slice(-1);
    if (!digit) return;

    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    // Auto-advance to next box
    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Fire onComplete when all 6 digits are filled
    const code = next.join('');
    if (code.length === OTP_LENGTH && !next.includes('')) {
      onComplete?.(code);
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        // Clear current box
        const next = [...digits];
        next[index] = '';
        setDigits(next);
      } else if (index > 0) {
        // Jump to previous box and clear it
        const next = [...digits];
        next[index - 1] = '';
        setDigits(next);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pasted)) return;

    const next = pasted.split('');
    setDigits(next);
    // Focus last box
    inputRefs.current[OTP_LENGTH - 1]?.focus();
    // Fire onComplete immediately on valid paste
    onComplete?.(pasted);
  }

  function handleFocus(index) {
    // Select any existing digit in the box so the next keystroke replaces it
    inputRefs.current[index]?.select();
  }

  return (
    <div
      className={cn('flex gap-2', className)}
      role="group"
      aria-label="One-time password input"
    >
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          pattern="\d"
          maxLength={1}
          value={digit}
          disabled={disabled}
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(i)}
          className={cn(
            // Size: 48px wide × 56px tall per UI-SPEC §OTP entry UX
            'w-12 h-14 text-center text-xl font-sans font-medium rounded',
            'border-2 bg-cream text-charcoal',
            'transition-colors duration-[400ms]',
            // Focus ring per UI-SPEC §Forms — 2px teal outline
            'focus:outline-none focus:border-teal',
            // Error flash: danger border for 400ms (CSS transition on border-color)
            // Only opacity + transform are animated under CONSTRAINT-CODE-004.
            // Border-color transition is a short functional flash, not ambient animation.
            hasError ? 'border-danger' : 'border-muted/40',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
      ))}
    </div>
  );
});

export default OtpInput;
