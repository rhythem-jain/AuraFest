import { memo, useState } from 'react';
import {
  categoryLabel,
  parseINR,
  percentOf,
  toLakh,
  type CategoryNeed,
} from '../engine';
import type { Category, Occasion } from '../schemas';
import { Icon } from './Icon';
import { EstimateBadge } from './ui';

interface Props {
  occasion: Occasion;
  category: Category;
  amount: number;
  total: number;
  locked: boolean;
  need: CategoryNeed;
  swatchClass: string;
  onChange: (category: Category, amount: number) => void;
  onToggleLock: (category: Category) => void;
}

function stepFor(total: number): number {
  if (total >= 100_000) return 1000;
  if (total >= 10_000) return 100;
  return 1;
}

/** One row per category: label, badge, slider, amount and lock sit together (common region). */
export const CategoryRow = memo(function CategoryRow({
  occasion,
  category,
  amount,
  total,
  locked,
  need,
  swatchClass,
  onChange,
  onToggleLock,
}: Props) {
  const label = categoryLabel(occasion, category);
  const [text, setText] = useState(String(amount));
  const [invalid, setInvalid] = useState(false);
  const [seen, setSeen] = useState(amount);
  if (seen !== amount) {
    setSeen(amount);
    setText(String(amount));
    setInvalid(false);
  }

  function commit() {
    const parsed = text.trim() === '0' ? 0 : parseINR(text);
    if (parsed === null) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    onChange(category, parsed);
  }

  const errorId = `${category}-err`;
  return (
    <article
      aria-label={label}
      className={`grid gap-x-6 gap-y-3 px-4 py-5 transition-colors sm:px-6 md:grid-cols-[14rem_minmax(0,1fr)_11rem] md:items-center ${
        locked ? 'bg-accent-soft/20' : 'hover:bg-paper/40'
      }`}
    >
      <div>
        <div className="flex items-center gap-2.5">
          <span aria-hidden="true" className={`h-3 w-3 shrink-0 rounded-full shadow-sm ${swatchClass}`} />
          <h3 className="text-sm font-bold text-ink">{label}</h3>
        </div>
        <p className="tabular mt-0.5 text-xs font-semibold text-ink-soft">
          {percentOf(amount, total)}% · {toLakh(amount)}
        </p>
        <div className="mt-2">
          <EstimateBadge verified={need.verified} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          aria-label={`${label} amount`}
          min={0}
          max={total}
          step={stepFor(total)}
          value={amount}
          disabled={locked}
          className="h-10 cursor-pointer accent-accent disabled:opacity-40"
          onChange={(e) => onChange(category, Number(e.target.value))}
        />
        <button
          type="button"
          className={`btn-secondary min-h-10 shrink-0 px-3 transition-all ${
            locked
              ? 'border-accent/40 bg-accent-soft text-accent shadow-sm'
              : 'text-ink-soft hover:text-ink'
          }`}
          aria-pressed={locked}
          aria-label={`Lock ${label} amount`}
          onClick={() => onToggleLock(category)}
        >
          <Icon name={locked ? 'lock' : 'unlock'} className="h-4 w-4" />
          <span className="text-xs font-semibold">{locked ? 'Locked' : 'Lock'}</span>
        </button>
      </div>

      <div>
        <div className="relative">
          <label htmlFor={`${category}-amt`} className="sr-only">
            {label} amount (₹)
          </label>
          <input
            id={`${category}-amt`}
            className={`input tabular font-semibold text-ink ${
              invalid ? 'border-warn bg-warn-soft text-warn' : ''
            }`}
            aria-invalid={invalid}
            aria-describedby={invalid ? errorId : undefined}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setInvalid(false);
            }}
            onBlur={commit}
            onKeyDown={(e) => e.key === 'Enter' && commit()}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-ink-soft">
            ₹
          </span>
        </div>
        {invalid && (
          <p id={errorId} className="mt-1 flex items-center gap-1 text-xs font-semibold text-warn">
            <Icon name="alert" className="h-3 w-3 shrink-0" />
            Couldn't read that amount.
          </p>
        )}
      </div>
    </article>
  );
});
