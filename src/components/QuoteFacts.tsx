import { effectiveCost, formatINR } from '../engine';
import type { Quote } from '../schemas';

const NOT_STATED = 'Not stated';
const rupees = (v: number | null) => (v === null ? NOT_STATED : formatINR(v));

/** The structured facts extracted from a quote by Gemini, verified with Zod. */
export function QuoteFacts({ quote, guests }: { quote: Quote; guests: number }) {
  const rows: [string, string][] = [
    ['Vendor', quote.vendorName ?? NOT_STATED],
    ['Total price', rupees(quote.totalPrice)],
    ['Price per plate', rupees(quote.pricePerPlate)],
    ['Guest minimum', quote.guestMinimum === null ? NOT_STATED : String(quote.guestMinimum)],
    ['Overtime fee per hour', rupees(quote.overtimeFeePerHour)],
    [
      'Tax included',
      quote.taxIncluded === null ? NOT_STATED : quote.taxIncluded ? 'Yes' : 'No, extra',
    ],
    ['Advance', quote.advancePercent === null ? NOT_STATED : `${quote.advancePercent}%`],
    ['Inclusions', quote.inclusions.length ? quote.inclusions.join(', ') : NOT_STATED],
    ['Exclusions', quote.exclusions.length ? quote.exclusions.join(', ') : NOT_STATED],
    ['Cancellation', quote.cancellationPolicy ?? NOT_STATED],
  ];
  const cost = effectiveCost(quote, guests);
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
      <table className="text-xs sm:text-sm">
        <caption className="sr-only">Details found in the quotation</caption>
        <tbody className="divide-y divide-line/60">
          {rows.map(([k, v]) => (
            <tr key={k} className="transition-colors hover:bg-paper/50">
              <th scope="row" className="w-2/5 px-4 py-2.5 font-semibold text-ink-soft">
                {k}
              </th>
              <td className="px-4 py-2.5 font-medium text-ink">{v}</td>
            </tr>
          ))}
          <tr className="bg-accent-soft/30 font-bold">
            <th scope="row" className="px-4 py-3 text-ink">
              Effective cost for {guests} guests
            </th>
            <td className="px-4 py-3 font-extrabold text-accent">
              {cost === null ? 'Cannot be worked out yet' : formatINR(cost)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
