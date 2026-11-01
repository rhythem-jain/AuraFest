import { useState } from 'react';
import { categoryLabel } from '../engine';
import { extractQuote, type RequestOptions } from '../lib/api';
import { newId } from '../lib/id';
import { useAiCall } from '../lib/useAiCall';
import {
  CATEGORIES,
  CategorySchema,
  MAX_QUOTES_PER_CATEGORY,
  type Category,
  type Plan,
  type Quote,
} from '../schemas';
import type { Action } from '../state/planStore';
import { Icon } from './Icon';
import { QuoteResult } from './QuoteResult';
import { AnswerMeta } from './ThinkingTrace';
import { AiError, AiLoading } from './ui';

const QUOTE_CATEGORIES = CATEGORIES.filter((c) => c !== 'contingency');

export function QuoteAnalyzer({
  plan,
  dispatch,
}: {
  plan: Plan;
  dispatch: (action: Action) => void;
}) {
  const [category, setCategory] = useState<Category>('catering');
  const [pasted, setPasted] = useState('');
  const [saved, setSaved] = useState<string | null>(null);
  const ai = useAiCall((options: RequestOptions, text: string, category: Category) =>
    extractQuote(text, category, options),
  );

  const result = ai.state.status === 'done' ? { ...ai.state.data, category } : null;
  const full = plan.quotes.filter((q) => q.category === category).length >= MAX_QUOTES_PER_CATEGORY;

  const analyze = () => {
    setSaved(null);
    return ai.run(pasted, category);
  };

  function save(quote: Quote, accept: boolean) {
    dispatch({ type: 'addQuote', quote, id: newId(), accept });
    setSaved(
      accept
        ? 'Quotation accepted. This category now shows a verified quotation.'
        : 'Saved for comparison.',
    );
    ai.reset();
    setPasted('');
  }

  return (
    <section className="card shadow-glass backdrop-blur-xl" aria-labelledby="analyze-h">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent shadow-sm backdrop-blur-sm">
          <Icon name="file" className="h-5 w-5" />
        </div>
        <div>
          <h2 id="analyze-h" className="text-lg font-bold sm:text-xl">
            Analyze vendor quotation
          </h2>
          <p className="hint">
            Paste WhatsApp text or email quotes. Gemini parses fine print, advances, and hidden
            costs into structured data.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        <div>
          <label htmlFor="quote-cat" className="label">
            What is this quotation for?
          </label>
          <select
            id="quote-cat"
            className="input font-semibold"
            value={category}
            onChange={(e) => {
              const picked = CategorySchema.safeParse(e.target.value);
              if (picked.success) setCategory(picked.data);
            }}
          >
            {QUOTE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {categoryLabel(plan.occasion, c)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="quote-text" className="label">
              Quotation text
            </label>
            <span className="tabular text-xs text-ink-soft">{pasted.length}/6000 chars</span>
          </div>
          <textarea
            id="quote-text"
            className="input min-h-36 text-sm leading-relaxed"
            maxLength={6000}
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            placeholder="Paste raw vendor message or quotation here…"
          />
        </div>

        <div>
          <button
            type="button"
            className="btn-primary min-h-11 px-6 shadow-sm"
            disabled={pasted.trim() === '' || ai.state.status === 'loading'}
            onClick={() => void analyze()}
          >
            <Icon name="sparkle" className="h-4 w-4" />
            Analyze quotation
          </button>
        </div>
      </div>

      <div className="mt-4" aria-live="polite">
        {ai.state.status === 'loading' && (
          <AiLoading label="Gemini is analyzing the vendor quote…" progress={ai.progress} />
        )}
        {ai.state.status === 'error' && (
          <AiError message={ai.state.message} onRetry={() => void analyze()} />
        )}
        {saved && (
          <div className="rounded-xl border border-ok/30 bg-ok-soft p-3.5 text-xs font-semibold text-ok shadow-sm">
            {saved}
          </div>
        )}
        {result && (
          <>
            <QuoteResult
              quote={result}
              plan={plan}
              full={full}
              onSave={(accept) => save(result, accept)}
            />
            <AnswerMeta progress={ai.progress} />
          </>
        )}
      </div>
    </section>
  );
}
