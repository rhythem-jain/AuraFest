import { useEffect, useRef } from 'react';
import { Icon } from './Icon';

export interface FieldError {
  /** Id of the input the message belongs to. */
  fieldId: string;
  message: string;
}

/**
 * GOV.UK-style accessible error summary: takes focus on failed submission and links directly to invalid fields.
 */
export function ErrorSummary({ errors, attempt }: { errors: FieldError[]; attempt: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (attempt > 0) ref.current?.focus();
  }, [attempt]);

  if (attempt === 0 || errors.length === 0) return null;
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      aria-labelledby="error-summary-h"
      className="rounded-2xl border border-warn/30 bg-warn-soft p-4 text-warn shadow-sm outline-none"
    >
      <h3 id="error-summary-h" className="flex items-center gap-2 text-sm font-bold text-warn">
        <Icon name="alert" className="h-4 w-4 shrink-0" />
        <span>
          Please fix {errors.length} {errors.length === 1 ? 'thing' : 'things'} to create your plan
        </span>
      </h3>
      <ul className="mt-2.5 list-disc space-y-1.5 pl-6 text-xs font-semibold">
        {errors.map((error) => (
          <li key={error.fieldId}>
            <a
              href={`#${error.fieldId}`}
              className="underline underline-offset-2 hover:opacity-80"
              onClick={(event) => {
                event.preventDefault();
                document.getElementById(error.fieldId)?.focus();
              }}
            >
              {error.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
