import { useEffect } from 'react';
import { describeChanges } from '../lib/format';
import type { Occasion } from '../schemas';
import type { ToastData } from '../state/planStore';
import { Icon } from './Icon';

/** Shows rebalance diff after a budget change. Mounted with aria-live for screen readers. */
export function Toast({
  toast,
  occasion,
  onDismiss,
}: {
  toast: ToastData | null;
  occasion: Occasion;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const text = toast
    ? [describeChanges(occasion, toast.changes), toast.note].filter(Boolean).join(' ')
    : '';

  return (
    <div
      aria-live="polite"
      role="status"
      className="no-print pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4"
    >
      {toast && text && (
        <div className="pointer-events-auto flex max-w-xl items-center gap-3 rounded-2xl border border-white/20 bg-ink/90 px-5 py-3 text-xs sm:text-sm font-semibold text-paper shadow-glass-glow backdrop-blur-xl">
          <Icon name="sparkle" className="h-4 w-4 shrink-0 text-accent-soft" />
          <p className="flex-1">{text}</p>
          <button
            type="button"
            className="btn min-h-8 shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold text-accent-soft hover:bg-paper/10"
            onClick={onDismiss}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
