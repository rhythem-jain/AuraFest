import { useState, type KeyboardEvent } from 'react';
import { parseIntake, type RequestOptions } from '../lib/api';
import { useAiCall } from '../lib/useAiCall';
import type { IntakeParse } from '../schemas';
import { Icon } from './Icon';
import { AnswerMeta } from './ThinkingTrace';
import { AiError, AiLoading } from './ui';

export const EXAMPLE_EVENT =
  'Shaadi in Pune, 200 guests, 8 lakh budget, mid-Feb, simple ceremony but premium food';

/**
 * Free-text AI intake. Gemini reads the description and populates the structured essentials.
 */
export function DescribeEvent({ onParsed }: { onParsed: (result: IntakeParse) => string[] }) {
  const [description, setDescription] = useState('');
  const [filled, setFilled] = useState<string | null>(null);
  const ai = useAiCall((options: RequestOptions, text: string) => parseIntake(text, options));

  function acceptExample(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Tab' || event.shiftKey || description !== '') return;
    event.preventDefault();
    setDescription(EXAMPLE_EVENT);
  }

  async function fill() {
    setFilled(null);
    const result = await ai.run(description);
    if (!result) return;
    const found = onParsed(result);
    setFilled(
      found.length
        ? `Filled ${found.join(', ')}. Please check the details before creating your plan.`
        : 'We could not find event details in that text. You can fill the form below by hand.',
    );
  }

  return (
    <section
      className="card lg:sticky lg:top-24 shadow-glass backdrop-blur-xl"
      aria-labelledby="describe-h"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <Icon name="sparkle" className="h-4 w-4" />
        </div>
        <div>
          <h2 id="describe-h" className="text-lg font-bold sm:text-xl">
            Describe your event
          </h2>
          <p className="hint">
            Write naturally like you would to family. Our GenAI model auto-fills your parameters.
          </p>
        </div>
      </div>

      <label htmlFor="describe" className="sr-only">
        Event description
      </label>
      <div className="relative mt-4">
        <textarea
          id="describe"
          className="input min-h-32 text-sm leading-relaxed"
          maxLength={1000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={EXAMPLE_EVENT}
          aria-describedby={description === '' ? 'describe-tab-hint' : undefined}
          onKeyDown={acceptExample}
        />
        {description === '' && (
          <p id="describe-tab-hint" className="hint mt-1.5 flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            Press{' '}
            <kbd className="rounded-md border border-line bg-card px-1.5 py-0.5 text-[10px] font-bold shadow-sm">
              Tab
            </kbd>{' '}
            to use this example.
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          className={`w-full sm:w-auto ${description.trim() === '' ? 'btn-secondary' : 'btn-primary'}`}
          onClick={() => void fill()}
          disabled={description.trim() === '' || ai.state.status === 'loading'}
        >
          <Icon name="sparkle" className="h-4 w-4" />
          Fill form from description
        </button>
        <span className="tabular text-xs text-ink-soft">
          {description.length}/1000 chars · AI suggestion
        </span>
      </div>

      <div className="mt-4" aria-live="polite">
        {ai.state.status === 'loading' && (
          <AiLoading label="Gemini is reading your description…" progress={ai.progress} />
        )}
        {ai.state.status === 'error' && (
          <AiError message={ai.state.message} onRetry={() => void fill()} />
        )}
        {filled && ai.state.status === 'done' && (
          <div className="rounded-xl border border-accent/20 bg-accent-soft/40 p-3.5">
            <p className="text-xs font-semibold text-accent">{filled}</p>
            <AnswerMeta progress={ai.progress} />
          </div>
        )}
      </div>
    </section>
  );
}
