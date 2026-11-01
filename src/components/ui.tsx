import { useId, type ReactNode } from 'react';
import type { AiProgress } from '../lib/useAiCall';
import { Icon } from './Icon';
import { LiveThinking } from './ThinkingTrace';

export interface FieldControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

export function Field({
  id: fixedId,
  label,
  hint,
  error,
  children,
}: {
  id?: string;
  label: string;
  hint?: string;
  error?: string | null;
  children: (props: FieldControlProps) => ReactNode;
}) {
  const generated = useId();
  const id = fixedId ?? generated;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      {hint && (
        <p id={hintId} className="hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="flex items-center gap-1.5 text-xs font-semibold text-warn">
          <Icon name="alert" className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

export function EstimateBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="badge-verified">
      <Icon name="check" className="h-3 w-3" />
      <span>Verified quotation</span>
    </span>
  ) : (
    <span className="badge-estimate">
      <span>Estimate</span>
    </span>
  );
}

/** Live "Gemini is thinking" panel: a running timer plus thoughts as they stream in. */
export function AiLoading({ label, progress }: { label: string; progress: AiProgress }) {
  return <LiveThinking label={label} progress={progress} />;
}

export function AiError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-warn/30 bg-warn-soft p-4 text-sm text-warn shadow-sm"
    >
      <p className="flex items-start gap-2.5 font-semibold">
        <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
        <span>{message}</span>
      </p>
      <button
        type="button"
        className="btn-secondary mt-3 min-h-9 px-3.5 text-xs font-semibold"
        onClick={onRetry}
      >
        Try again
      </button>
    </div>
  );
}

export function EmptyState({
  title,
  action,
  onAction,
}: {
  title: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="card flex flex-col items-center justify-center py-16 text-center shadow-glass backdrop-blur-xl">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/25 bg-accent-soft text-accent shadow-glass-glow">
        <Icon name="sparkle" className="h-7 w-7 text-accent" />
      </div>
      <p className="max-w-md font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
        {title}
      </p>
      <p className="mt-2 text-sm text-ink-soft">
        Configure your budget, timeline, and vendors in one connected operating plan.
      </p>
      <button
        type="button"
        className="btn-primary mt-6 min-h-11 px-6 shadow-glass-glow"
        onClick={onAction}
      >
        {action}
      </button>
    </div>
  );
}

/** Inline two-step confirmation (no intrusive modal, keyboard and screen reader accessible). */
export function Confirm({
  prompt,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  prompt: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      role="group"
      aria-label="Confirm action"
      className="mt-3 rounded-2xl border border-line bg-paper p-4 shadow-sm"
    >
      <p className="text-sm font-semibold text-ink">{prompt}</p>
      <div className="mt-3 flex flex-wrap gap-2.5">
        <button
          type="button"
          className="btn-primary min-h-9 px-4 text-xs font-semibold"
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          className="btn-secondary min-h-9 px-4 text-xs font-semibold"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
