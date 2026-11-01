import { formatINR } from '../engine';
import { Icon } from './Icon';

interface BudgetStatusBannerProps {
  over: boolean;
  overBy: number;
  overByPct: number;
  total: number;
  onShowOptions: () => void;
}

export function BudgetStatusBanner({
  over,
  overBy,
  overByPct,
  total,
  onShowOptions,
}: BudgetStatusBannerProps) {
  if (!over) {
    return (
      <div className="flex h-[4.75rem] items-center gap-3.5 rounded-2xl border border-ok/30 bg-card/90 px-5 text-ink-soft shadow-glass backdrop-blur-md">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ok-soft text-ok shadow-sm">
          <Icon name="check" className="h-5 w-5 text-ok" />
        </div>
        <p className="truncate text-sm font-semibold text-ink">
          Within budget. Everything adds up to {formatINR(total)}.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[4.75rem] items-center gap-3.5 rounded-2xl border border-warn/40 bg-warn-soft/95 px-5 text-warn shadow-elevated backdrop-blur-md">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warn text-on-accent shadow-sm">
        <Icon name="alert" className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold sm:text-base">
          Over budget by {formatINR(overBy)}
        </p>
        <p className="truncate text-xs font-medium sm:text-sm">
          {overByPct}% of your total. Nothing was changed automatically.
        </p>
      </div>
      <button
        type="button"
        className="btn-primary min-h-10 shrink-0 border border-warn/30 bg-warn text-white shadow-sm hover:bg-warn/90"
        onClick={onShowOptions}
      >
        Options
      </button>
    </div>
  );
}
