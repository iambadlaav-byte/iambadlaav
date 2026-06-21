/**
 * SliderField — 1–10 range slider with anchored labels. Controlled.
 */
export function SliderField({ question, value, onChange, minLabel, maxLabel, required, error, min = 1, max = 10 }) {
  return (
    <fieldset>
      <legend className="font-sans text-charcoal font-medium mb-3 leading-snug">
        {question}
        {required && <span className="text-ochre"> *</span>}
      </legend>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={min}
          max={max}
          value={value ?? min}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-ochre h-2"
          aria-label={question}
        />
        <span className="font-display text-2xl font-semibold text-ochre w-10 text-center tabular-nums">
          {value ?? '–'}
        </span>
      </div>
      <div className="flex justify-between font-mono text-[11px] uppercase tracking-wide text-muted mt-1">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
      {error && <p className="text-danger text-xs mt-2 font-sans">{error}</p>}
    </fieldset>
  );
}
