import { categoryLabel, compareQuote, effectiveCost, formatINR } from '../engine';
import { CATEGORIES, type Category, type Plan, type StoredQuote } from '../schemas';
import type { Action } from '../state/planStore';
import { Icon } from './Icon';
import { EstimateBadge } from './ui';

function CategoryTable({
  plan,
  category,
  quotes,
  dispatch,
}: {
  plan: Plan;
  category: Category;
  quotes: StoredQuote[];
  dispatch: (a: Action) => void;
}) {
  const label = categoryLabel(plan.occasion, category);
  const budget = plan.allocation[category];
  const cols = quotes.map((s) => {
    const cost = effectiveCost(s.quote, plan.guests);
    return { s, cost, flags: compareQuote(s.quote, plan) };
  });
  const cell = (render: (c: (typeof cols)[number]) => React.ReactNode) =>
    cols.map((c) => (
      <td key={c.s.id} className="px-4 py-3 align-top text-xs sm:text-sm">
        {render(c)}
      </td>
    ));

  return (
    <section
      className="card overflow-x-auto shadow-glass backdrop-blur-xl"
      aria-labelledby={`cmp-${category}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-3">
        <h3 id={`cmp-${category}`} className="text-base font-bold text-ink">
          {label}: compare quotations
        </h3>
        <EstimateBadge verified={quotes.some((q) => q.accepted)} />
      </div>
      <p className="hint mt-2">Budget for this category: {formatINR(budget)}</p>
      <table className="mt-3 min-w-[28rem] rounded-xl border border-line/70 bg-card/60 backdrop-blur-sm">
        <caption className="sr-only">Side-by-side quotations for {label}</caption>
        <thead>
          <tr className="bg-field/75 backdrop-blur-sm">
            <th scope="col" className="px-4 py-3 font-semibold text-ink-soft">
              <span className="sr-only">Detail</span>
            </th>
            {cols.map((c, i) => (
              <th key={c.s.id} scope="col" className="px-4 py-3 font-bold text-ink">
                <div className="flex items-center gap-1.5">
                  <span>{c.s.quote.vendorName ?? `Quotation ${i + 1}`}</span>
                  {c.s.accepted && (
                    <span className="badge-verified ml-1.5">
                      <Icon name="check" className="h-3 w-3" /> Accepted
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line/60">
          <tr>
            <th scope="row" className="px-4 py-3 font-medium text-ink-soft">
              Effective cost for {plan.guests} guests
            </th>
            {cell((c) =>
              c.cost === null ? (
                '-'
              ) : (
                <strong className="font-bold text-accent">{formatINR(c.cost)}</strong>
              ),
            )}
          </tr>
          <tr>
            <th scope="row" className="px-4 py-3 font-medium text-ink-soft">
              Against budget
            </th>
            {cell((c) =>
              c.cost === null ? (
                '-'
              ) : c.cost > budget ? (
                <span className="inline-flex items-center gap-1 font-bold text-warn">
                  <Icon name="alert" className="h-3.5 w-3.5" />
                  {formatINR(c.cost - budget)} over
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-bold text-ok">
                  <Icon name="check" className="h-3.5 w-3.5" />
                  {formatINR(budget - c.cost)} under
                </span>
              ),
            )}
          </tr>
          <tr>
            <th scope="row" className="px-4 py-3 font-medium text-ink-soft">
              Per plate
            </th>
            {cell((c) =>
              c.s.quote.pricePerPlate === null ? '-' : formatINR(c.s.quote.pricePerPlate),
            )}
          </tr>
          <tr>
            <th scope="row" className="px-4 py-3 font-medium text-ink-soft">
              Guest minimum
            </th>
            {cell((c) => c.s.quote.guestMinimum ?? '-')}
          </tr>
          <tr>
            <th scope="row" className="px-4 py-3 font-medium text-ink-soft">
              Advance
            </th>
            {cell((c) =>
              c.s.quote.advancePercent === null ? '-' : `${c.s.quote.advancePercent}%`,
            )}
          </tr>
          <tr>
            <th scope="row" className="px-4 py-3 font-medium text-ink-soft">
              Tax
            </th>
            {cell((c) =>
              c.s.quote.taxIncluded === null
                ? 'Not stated'
                : c.s.quote.taxIncluded
                  ? 'Included'
                  : 'Extra',
            )}
          </tr>
          <tr>
            <th scope="row" className="px-4 py-3 font-medium text-ink-soft">
              Overtime per hr
            </th>
            {cell((c) =>
              c.s.quote.overtimeFeePerHour === null ? '-' : formatINR(c.s.quote.overtimeFeePerHour),
            )}
          </tr>
          <tr>
            <th scope="row" className="px-4 py-3 font-medium text-ink-soft">
              Inclusions
            </th>
            {cell((c) => (c.s.quote.inclusions.length ? c.s.quote.inclusions.join(', ') : '-'))}
          </tr>
          <tr>
            <th scope="row" className="px-4 py-3 font-medium text-ink-soft">
              Exclusions
            </th>
            {cell((c) => (c.s.quote.exclusions.length ? c.s.quote.exclusions.join(', ') : '-'))}
          </tr>
          <tr>
            <th scope="row" className="px-4 py-3 font-medium text-ink-soft">
              Cancellation
            </th>
            {cell((c) => c.s.quote.cancellationPolicy ?? 'Not stated')}
          </tr>
          <tr>
            <th scope="row" className="px-4 py-3 font-medium text-ink-soft">
              Actions
            </th>
            {cell((c) => (
              <div className="flex flex-wrap gap-2">
                {!c.s.accepted && c.cost !== null && (
                  <button
                    type="button"
                    className="btn-primary min-h-8 px-3 text-xs font-semibold"
                    onClick={() => dispatch({ type: 'acceptQuote', id: c.s.id })}
                  >
                    Accept
                  </button>
                )}
                <button
                  type="button"
                  className="btn-secondary min-h-8 px-3 text-xs font-semibold"
                  onClick={() => dispatch({ type: 'removeQuote', id: c.s.id })}
                >
                  Remove
                </button>
              </div>
            ))}
          </tr>
        </tbody>
      </table>
    </section>
  );
}

export function QuoteComparison({ plan, dispatch }: { plan: Plan; dispatch: (a: Action) => void }) {
  const byCategory = CATEGORIES.map((c) => ({
    category: c,
    quotes: plan.quotes.filter((q) => q.category === c),
  })).filter((g) => g.quotes.length > 0);

  if (byCategory.length === 0) return null;
  return (
    <div className="space-y-6">
      {byCategory.map((g) => (
        <CategoryTable
          key={g.category}
          plan={plan}
          category={g.category}
          quotes={g.quotes}
          dispatch={dispatch}
        />
      ))}
    </div>
  );
}
