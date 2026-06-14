import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/cn';

export default function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[990] flex flex-col items-end gap-2">
      {open && (
        <div className="bg-navy border border-teal/20 shadow-2xl p-3 w-44 flex flex-col gap-0.5">
          <p className="font-mono text-[9px] tracking-[.22em] uppercase text-teal px-2 pb-2 pt-1">
            Theme
          </p>

          {Object.entries(themes).map(([id, t]) => {
            const active = theme === id;
            return (
              <button
                key={id}
                onClick={() => { setTheme(id); setOpen(false); }}
                className={cn(
                  'flex items-center gap-2.5 w-full px-2 py-2 text-left transition-colors duration-150',
                  active
                    ? 'bg-teal/10 text-charcoal'
                    : 'text-muted hover:text-charcoal hover:bg-teal/5'
                )}
              >
                <span
                  className="shrink-0 rounded-full"
                  style={{
                    width: 16,
                    height: 16,
                    background: t.swatch,
                    border: `2px solid ${t.accent}`,
                    boxShadow: active ? `0 0 0 1px ${t.accent}` : 'none',
                  }}
                />
                <span className="font-sans text-[11px] tracking-wide leading-none">
                  {t.label}
                </span>
                {active && (
                  <span className="ml-auto font-mono text-[9px] text-teal">✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Switch theme"
        title="Switch theme"
        className={cn(
          'w-9 h-9 flex items-center justify-center border shadow-lg transition-all duration-200',
          'bg-navy border-teal/25 text-teal hover:border-teal/60 hover:text-teal-light',
          open && 'border-teal/60 text-teal-light'
        )}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      </button>
    </div>
  );
}
