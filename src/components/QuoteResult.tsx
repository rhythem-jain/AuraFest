import { useState } from 'react';
import {
  categoryLabel,
  compareQuote,
  effectiveCost,
  formatINR,
  inquiryDraft,
  missingFields,
} from '../engine';
import { MAX_QUOTES_PER_CATEGORY, type Plan, type Quote } from '../schemas';
import { Icon } from './Icon';
import { QuoteFacts } from './QuoteFacts';

/** One analysed quote: facts, engine flags, cost against budget, inquiry draft and actions. */
export function QuoteResult({
  quote,
  plan,
  full,
  onSave,
}: {
  quote: Quote;
  plan: Plan;
  full: boolean;
  onSave: (accept: boolean) => void;
}) {
  const [copied, setCopied] = useState<'done' | 'failed' | null>(null);
  const flags = compareQuote(quote, plan);
  const missing = missingFields(quote);
  const cost = effectiveCost(quote, plan.guests);
  const draft = inquiryDraft(quote, plan);

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied('done');
    } catch {
      setCopied('failed');
    }
  }

  return (
    <div className="mt-5 space-y-4" data-testid="quote-result">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-ink-soft">
          What we found (AI extraction, please verify)
        </h3>
        <span className="rounded-full bg-paper px-2.5 py-0.5 text-xs font-semibold text-ink-soft border border-line">
          Automated Extraction
        </span>
      </div>

      <QuoteFacts quote={quote} guests={plan.guests} />

      {cost !== null ? (
        <div className="rounded-xl border border-line bg-paper/60 p-3.5 text-xs sm:text-sm font-medium text-ink">
          Effective cost <strong className="font-bold text-accent">{formatINR(cost)}</strong> against a{' '}
          {categoryLabel(plan.occasion, quote.category)} budget of{' '}
          <strong className="font-bold text-ink">{formatINR(plan.allocation[quote.category])}</strong>.
        </div>
      ) : (
        <p className="text-xs font-semibold text-warn">
          This quotation needs a price before it can be accepted.
        </p>
      )}

      <div role="status" aria-live="polite" className="rounded-2xl border border-line bg-card p-4 shadow-sm">
        <h4 className="text-xs font-bold uppercase tracking-wider text-ink">Things to check</h4>
        {flags.length === 0 ? (
          <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-ok">
            <Icon name="check" className="h-4 w-4" />
            Nothing worrying found.
          </p>
        ) : (
          <ul className="mt-2 space-y-1.5 text-xs font-semibold">
            {flags.map((f) => (
              <li key={f.code} className="flex items-center gap-2 text-warn">
                <Icon name="alert" className="h-4 w-4 shrink-0" />
                <span>{f.message}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {missing.length > 0 && (
        <p className="text-xs font-medium text-ink-soft">
          {missing.length} details are missing. Copy the inquiry message below to ask the vendor for exactly those.
        </p>
      )}

      <div className="flex flex-wrap gap-2.5 pt-1">
        <button type="button" className="btn-secondary min-h-10 px-4 text-xs font-semibold" onClick={() => void copyDraft()}>
          <Icon name="mail" className="h-4 w-4 text-accent" />
          Copy inquiry message
        </button>
        <button
          type="button"
          className="btn-secondary min-h-10 px-4 text-xs font-semibold"
          disabled={full}
          onClick={() => onSave(false)}
        >
          Save for comparison
        </button>
        <button
          type="button"
          className="btn-primary min-h-10 px-5 text-xs font-semibold shadow-sm"
          disabled={full || cost === null}
          onClick={() => onSave(true)}
        >
          <Icon name="check" className="h-4 w-4" />
          Accept quotation
        </button>
      </div>

      {copied === 'done' && (
        <p className="text-xs font-semibold text-ok flex items-center gap-1.5">
          <Icon name="check" className="h-3.5 w-3.5" />
          Message copied to clipboard. Ready to paste in WhatsApp or email.
        </p>
      )}
      {copied === 'failed' && (
        <div className="rounded-xl border border-line bg-paper p-3 text-xs">
          <label htmlFor="inquiry-draft" className="label text-xs">
            Inquiry message
          </label>
          <textarea id="inquiry-draft" readOnly className="input min-h-24 text-xs font-mono" value={draft} />
        </div>
      )}

      {full && (
        <p className="text-xs font-semibold text-warn">
          You already have {MAX_QUOTES_PER_CATEGORY} quotations for this category. Remove one below to add more.
        </p>
      )}
    </div>
  );
}
