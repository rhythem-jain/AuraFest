import { useCallback, useMemo, useRef } from 'react';
import {
  budgetStatus,
  categoryNeeds,
  formatINR,
  generateOverBudgetOptions,
  OCCASION_LABELS,
  parseGuests,
  parseINR,
  scaleGuests,
  toLakh,
} from '../engine';
import { MAX_GUESTS, type Category, type Plan } from '../schemas';
import type { Action } from '../state/planStore';
import { useSyncedText } from '../lib/useSyncedText';
import { AllocationBar, SWATCH_CLASS } from './AllocationBar';
import { CategoryRow } from './CategoryRow';
import { Icon } from './Icon';
import { TradeoffPanel } from './TradeoffPanel';
import { Field } from './ui';

export function BudgetTab({ plan, dispatch }: { plan: Plan; dispatch: (action: Action) => void }) {
  const status = useMemo(() => budgetStatus(plan), [plan]);
  const needs = useMemo(() => categoryNeeds(plan), [plan]);
  const options = useMemo(() => generateOverBudgetOptions(plan), [plan]);
  const impact = useMemo(() => scaleGuests(plan, plan.guests), [plan]);

  const [guestsText, setGuestsText] = useSyncedText(String(plan.guests));
  const [budgetText, setBudgetText] = useSyncedText(String(plan.totalBudget));
  const [perPlateText, setPerPlateText] = useSyncedText(String(Math.round(plan.perPlate)));

  const onChange = useCallback(
    (category: Category, amount: number) => dispatch({ type: 'setAmount', category, amount }),
    [dispatch],
  );
  const onToggleLock = useCallback(
    (category: Category) => dispatch({ type: 'toggleLock', category }),
    [dispatch],
  );

  function commitGuests(value: string) {
    const guests = parseGuests(value);
    if (guests === null) setGuestsText(String(plan.guests));
    else dispatch({ type: 'setGuests', guests });
  }
  function commitBudget() {
    const parsed = parseINR(budgetText);
    if (parsed === null) setBudgetText(String(plan.totalBudget));
    else dispatch({ type: 'setTotal', total: parsed });
  }
  function commitPerPlate() {
    const parsed = perPlateText.trim() === '0' ? 0 : parseINR(perPlateText);
    if (parsed === null) setPerPlateText(String(Math.round(plan.perPlate)));
    else dispatch({ type: 'setPerPlate', perPlate: parsed });
  }

  const over = status.overBy > 0;
  const optionsRef = useRef<HTMLDivElement>(null);
  const showOptions = () => {
    optionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    optionsRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className="space-y-6">
      <section className="card shadow-glass backdrop-blur-xl" aria-labelledby="summary-h">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 id="summary-h" className="text-lg font-bold sm:text-xl">
              Budget at a glance
            </h2>
            <p className="mt-0.5 text-xs text-ink-soft">
              Dynamic auto-balancing keeps your total budget balanced in real time.
            </p>
          </div>
          <span className="rounded-full border border-accent/25 bg-accent-soft px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent shadow-sm">
            Live Rebalancing
          </span>
        </div>
        <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-line/70 bg-field/60 p-4.5 shadow-sm backdrop-blur-sm">
            <dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Total budget
            </dt>
            <dd className="tabular mt-1 font-display text-2xl font-extrabold text-ink sm:text-3xl">
              {formatINR(status.total)}
            </dd>
            <dd className="mt-1 text-xs font-semibold text-accent">{toLakh(status.total)}</dd>
          </div>
          <div className="rounded-2xl border border-line/70 bg-field/60 p-4.5 shadow-sm backdrop-blur-sm">
            <dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Committed (verified quotations)
            </dt>
            <dd className="tabular mt-1 font-display text-2xl font-extrabold text-ok sm:text-3xl">
              {formatINR(status.committed)}
            </dd>
            <dd className="mt-1 text-xs text-ink-soft">Locked by signed quotes</dd>
          </div>
          <div className="rounded-2xl border border-line/70 bg-field/60 p-4.5 shadow-sm backdrop-blur-sm">
            <dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Estimated (not yet quoted)
            </dt>
            <dd className="tabular mt-1 font-display text-2xl font-extrabold text-ink sm:text-3xl">
              {formatINR(status.estimated)}
            </dd>
            <dd className="mt-1 text-xs text-ink-soft">Engine baseline allocations</dd>
          </div>
        </dl>
        <div className="mt-6 pt-2">
          <AllocationBar plan={plan} />
        </div>
      </section>

      <div
        role="status"
        aria-live="polite"
        data-testid="over-budget-region"
        className="sticky top-20 z-20"
      >
        {over ? (
          <div className="flex h-[4.75rem] items-center gap-3.5 rounded-2xl border border-warn/40 bg-warn-soft/95 px-5 text-warn shadow-elevated backdrop-blur-md">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warn text-on-accent shadow-sm">
              <Icon name="alert" className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold sm:text-base">
                Over budget by {formatINR(status.overBy)}
              </p>
              <p className="truncate text-xs font-medium sm:text-sm">
                {status.overByPct}% of your total. Nothing was changed automatically.
              </p>
            </div>
            <button
              type="button"
              className="btn-primary min-h-10 shrink-0 border border-warn/30 bg-warn text-white shadow-sm hover:bg-warn/90"
              onClick={showOptions}
            >
              Options
            </button>
          </div>
        ) : (
          <div className="flex h-[4.75rem] items-center gap-3.5 rounded-2xl border border-ok/30 bg-card/90 px-5 text-ink-soft shadow-glass backdrop-blur-md">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ok-soft text-ok shadow-sm">
              <Icon name="check" className="h-5 w-5 text-ok" />
            </div>
            <p className="truncate text-sm font-semibold text-ink">
              Within budget. Everything adds up to {formatINR(status.total)}.
            </p>
          </div>
        )}
      </div>

      <section aria-labelledby="cats-h">
        <h2 id="cats-h" className="text-lg font-bold sm:text-xl">
          Where the money goes
        </h2>
        <p className="mb-4 mt-1 text-xs text-ink-soft sm:text-sm">
          Move one slider and the others adjust to keep the total the same. Lock a category to
          protect it.
        </p>
        <div className="card divide-y divide-line/60 !p-0 shadow-glass backdrop-blur-xl">
          {needs.map((need) => (
            <CategoryRow
              key={need.category}
              occasion={plan.occasion}
              category={need.category}
              amount={plan.allocation[need.category]}
              total={plan.totalBudget}
              locked={plan.locked.includes(need.category)}
              need={need}
              swatchClass={SWATCH_CLASS[need.category]}
              onChange={onChange}
              onToggleLock={onToggleLock}
            />
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-soft">
          Splits start from typical presets for a {OCCASION_LABELS[plan.occasion].toLowerCase()} and
          stay estimates until you accept a vendor quotation.
        </p>
      </section>

      <section className="card shadow-glass backdrop-blur-xl" aria-labelledby="controls-h">
        <h2 id="controls-h" className="text-lg font-bold sm:text-xl">
          Guests and totals
        </h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          <div>
            <Field label="Number of guests">
              {(p) => (
                <input
                  {...p}
                  className="input font-semibold"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={MAX_GUESTS}
                  value={guestsText}
                  onChange={(e) => {
                    setGuestsText(e.target.value);
                    const guests = parseGuests(e.target.value);
                    if (guests !== null) dispatch({ type: 'setGuests', guests });
                  }}
                  onBlur={(e) => commitGuests(e.target.value)}
                />
              )}
            </Field>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                Quick scenario:
              </span>
              {[-25, 25, 50].map((delta) => {
                const target = Math.max(1, plan.guests + delta);
                return (
                  <button
                    key={delta}
                    type="button"
                    className="rounded-lg border border-line/70 bg-paper/70 px-2 py-0.5 text-[11px] font-semibold text-ink-soft hover:bg-card hover:text-ink shadow-sm"
                    onClick={() => {
                      setGuestsText(String(target));
                      dispatch({ type: 'setGuests', guests: target });
                    }}
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </button>
                );
              })}
            </div>
          </div>
          <Field label="Total budget (₹)" hint="Try 8 lakh or 8,00,000">
            {(p) => (
              <input
                {...p}
                className="input font-semibold"
                value={budgetText}
                onChange={(e) => setBudgetText(e.target.value)}
                onBlur={commitBudget}
                onKeyDown={(e) => e.key === 'Enter' && commitBudget()}
              />
            )}
          </Field>
          <Field
            label="Catering cost per plate (₹)"
            hint="Starts from your catering share. Edit if you know better."
          >
            {(p) => (
              <input
                {...p}
                className="input font-semibold"
                value={perPlateText}
                onChange={(e) => setPerPlateText(e.target.value)}
                onBlur={commitPerPlate}
                onKeyDown={(e) => e.key === 'Enter' && commitPerPlate()}
              />
            )}
          </Field>
        </div>
        <div className="mt-5 rounded-2xl border border-line/70 bg-field/60 p-4 shadow-sm backdrop-blur-sm">
          <p className="tabular text-sm font-medium text-ink" data-testid="guest-impact">
            {plan.guests} guests × {formatINR(Math.round(impact.perPlate))} per plate needs{' '}
            <strong className="font-bold text-accent">{formatINR(impact.requiredCatering)}</strong>{' '}
            for catering. You have budgeted{' '}
            <strong className="font-bold text-ink">{formatINR(impact.currentCatering)}</strong>
            {impact.overBy > 0 ? (
              <>
                :{' '}
                <span className="inline-flex items-center gap-1 font-bold text-warn">
                  <Icon name="alert" className="h-4 w-4" />
                  {formatINR(impact.overBy)} short.
                </span>
              </>
            ) : (
              '. That covers it.'
            )}
          </p>
        </div>
      </section>

      {over && (
        <div id="tradeoffs" ref={optionsRef} tabIndex={-1} className="outline-none">
          <TradeoffPanel
            plan={plan}
            options={options}
            overBy={status.overBy}
            onApply={(option) => dispatch({ type: 'applyOption', option })}
          />
        </div>
      )}
    </div>
  );
}
