import { memo } from 'react';
import {
  budgetStatus,
  buildSchedule,
  categoryLabel,
  categoryNeeds,
  effectiveCost,
  formatINR,
  OCCASION_LABELS,
  percentOf,
  planReadiness,
  RUN_SHEETS,
} from '../engine';
import { BRAND } from '../lib/branding';
import { formatDate } from '../lib/format';
import { CATEGORIES, type Plan } from '../schemas';

/**
 * Printable executive summary. Hidden on screen, beautifully formatted by print CSS.
 */
export const PrintSummary = memo(function PrintSummary({
  plan,
  today,
}: {
  plan: Plan;
  today: string;
}) {
  const status = budgetStatus(plan);
  const needs = categoryNeeds(plan);
  const readiness = planReadiness(plan);
  let schedule: ReturnType<typeof buildSchedule> = [];
  try {
    schedule = buildSchedule(plan.tasks, plan.eventDate, today);
  } catch {
    schedule = [];
  }
  const accepted = plan.quotes.filter((q) => q.accepted);

  return (
    <article className="print-only print-sheet p-8 font-sans" aria-label="Plan summary for printing">
      <div className="border-b-2 border-ink pb-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-ink">
            {BRAND.name} · Celebration Intelligence
          </p>
          <span className="text-xs text-ink-soft">Generated: {formatDate(today)}</span>
        </div>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-ink">
          {OCCASION_LABELS[plan.occasion]}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          {formatDate(plan.eventDate)} · {plan.guests} guests · Total budget{' '}
          {formatINR(plan.totalBudget)}
          {plan.vibe ? ` · Theme: ${plan.vibe}` : ''}
        </p>
        <p className="mt-1 text-xs font-semibold text-ink">
          Plan readiness {readiness.percent}% · {readiness.tasksDone}/{readiness.tasksTotal} tasks
          done · {readiness.quotesVerified}/{readiness.quotesTotal} categories with verified
          quotations
        </p>
      </div>

      <h2 className="mt-6 text-base font-bold uppercase tracking-wider text-ink">Budget Allocation</h2>
      <table className="mt-2 w-full text-xs">
        <thead>
          <tr className="border-b border-ink">
            <th scope="col" className="py-2 text-left">Category</th>
            <th scope="col" className="py-2 text-left">Amount</th>
            <th scope="col" className="py-2 text-left">Share</th>
            <th scope="col" className="py-2 text-left">Basis</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-300">
          {CATEGORIES.map((c) => (
            <tr key={c}>
              <th scope="row" className="py-2 text-left font-semibold">{categoryLabel(plan.occasion, c)}</th>
              <td className="py-2">{formatINR(plan.allocation[c])}</td>
              <td className="py-2">{percentOf(plan.allocation[c], plan.totalBudget)}%</td>
              <td className="py-2">
                {needs.find((n) => n.category === c)?.verified ? 'Verified quotation' : 'Estimate'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs font-medium text-ink-soft">
        Committed {formatINR(status.committed)} · Estimated {formatINR(status.estimated)}
        {status.overBy > 0 ? ` · Over budget by ${formatINR(status.overBy)}` : ' · Within budget'}
      </p>

      {accepted.length > 0 && (
        <>
          <h2 className="mt-6 text-base font-bold uppercase tracking-wider text-ink">Accepted Vendor Quotations</h2>
          <ul className="mt-2 list-disc pl-5 text-xs">
            {accepted.map((q) => {
              const cost = effectiveCost(q.quote, plan.guests);
              return (
                <li key={q.id} className="py-0.5">
                  <strong>{categoryLabel(plan.occasion, q.category)}: {q.quote.vendorName ?? 'Vendor'}</strong> ·{' '}
                  {cost === null ? 'Price not stated' : formatINR(cost)}
                </li>
              );
            })}
          </ul>
        </>
      )}

      <h2 className="mt-6 text-base font-bold uppercase tracking-wider text-ink">Timeline & Key Milestones</h2>
      <table className="mt-2 w-full text-xs">
        <thead>
          <tr className="border-b border-ink">
            <th scope="col" className="py-2 text-left">Milestone</th>
            <th scope="col" className="py-2 text-left">Category</th>
            <th scope="col" className="py-2 text-left">Target Date</th>
            <th scope="col" className="py-2 text-left">Owner</th>
            <th scope="col" className="py-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-300">
          {schedule.map((t) => (
            <tr key={t.id}>
              <th scope="row" className="py-2 text-left font-semibold">{t.title}</th>
              <td className="py-2">{categoryLabel(plan.occasion, t.category)}</td>
              <td className="py-2">{formatDate(t.effectiveDate)}</td>
              <td className="py-2">{t.assignee ?? '-'}</td>
              <td className="py-2 uppercase font-semibold text-[10px]">{t.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mt-6 text-base font-bold uppercase tracking-wider text-ink">Day-of Protocol & Run Sheet</h2>
      <ol className="mt-2 divide-y divide-gray-200 text-xs">
        {RUN_SHEETS[plan.occasion].map((item) => (
          <li key={item.time} className="flex gap-4 py-1.5">
            <strong className="w-16">{item.time}</strong>
            <span>{item.title}</span>
          </li>
        ))}
      </ol>

      <footer className="mt-8 border-t border-gray-400 pt-3 text-center text-[10px] text-ink-soft">
        Amounts are estimates unless marked as a verified quotation. Planned with {BRAND.name}.
      </footer>
    </article>
  );
});
