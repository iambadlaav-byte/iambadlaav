/**
 * Toast — minimal non-blocking notification (uses React state, no portal lib needed).
 *
 * Usage: wrap page or layout in <ToastProvider>. Use useToast() to fire toasts.
 *
 * Per UI-SPEC §Destructive actions: sign-out toast reads "Signed out." (no dialog confirm).
 * Only animates opacity (CONSTRAINT-CODE-004 compliant). Auto-dismisses after 3s.
 * NO inline styles (CONSTRAINT-CODE-001).
 */
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '../../lib/cn.js';

const ToastContext = createContext(null);

/**
 * ToastProvider — wraps the app/layout, provides useToast().
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, variant = 'default') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, variant }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container — fixed bottom-right, above mobile safe area */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-6 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }) {
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => onRemove(toast.id), 3000);
    return () => clearTimeout(timerRef.current);
  }, [toast.id, onRemove]);

  const variantClasses = {
    default: 'bg-ink text-pearl border-ink/20',
    success: 'bg-sage text-pearl border-sage/20',
    danger:  'bg-danger text-pearl border-danger/20',
  };

  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto px-4 py-3 rounded shadow-lg border',
        'font-sans text-sm font-medium',
        'max-w-[320px]',
        variantClasses[toast.variant] || variantClasses.default
      )}
    >
      {toast.message}
    </div>
  );
}

/**
 * useToast() — returns { toast(message, variant?) }
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return {
    toast: ctx.addToast,
  };
}
