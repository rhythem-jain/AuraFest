import { useState } from 'react';
import { formatINR, type TradeoffOption } from '../engine';
import { explainTradeoffs, type RequestOptions } from '../lib/api';
import { describeChanges } from '../lib/format';
import { useAiCall } from '../lib/useAiCall';
import type { Plan } from '../schemas';
import { Icon } from './Icon';
import { AnswerMeta } from './ThinkingTrace';
import { AiError, AiLoading, Confirm } from './ui';

export function TradeoffPanel({
  plan,
  options,
  overBy,
  onApply,
}: {
  plan: Plan;
  options: TradeoffOption[];
  overBy: number;
  onApply: (option: TradeoffOption) => void;
}) {
  const [confirming, setConfirming] = useState<string | null>(null);
  const ai = useAiCall((options: RequestOptions, request: Parameters<typeof explainTradeoffs>[0]) =>
    explainTradeoffs(request, options),
  );

  const explain = () =>
    ai.run({
      occasion: plan.occasion,
      guests: plan.guests,
      totalBudget: plan.totalBudget,
      overBy,
      priorities: plan.priorities,
      options: options.map((o) => ({
        id: o.id,
        title: o.title,
        coversRupees: o.coversRupees,
        summary: o.description,
        warning: o.warning,
      })),
    });

  if (options.length === 0) {
    return (
      <section className="card border-warn/30 bg-warn-soft/30" aria-labelledby="options-h">
        <h2 id="options-h" className="text-lg font-bold sm:text-xl">
          Ways to close the gap
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          No automatic option fits {formatINR(overBy)}. Try fewer guests, a bigger total budget, or
          unlock categories so funds can be redistributed.
        </p>
      </section>
    );
  }

  const explanations = ai.state.status === 'done' ? ai.state.data.explanations : [];
  return (
    <section className="card border-accent/30 bg-card shadow-card" aria-labelledby="options-h">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <Icon name="sparkle" className="h-5 w-5" />
          </div>
          <div>
            <h2 id="options-h" className="text-lg font-bold sm:text-xl">
              Ways to close the gap
            </h2>
            <p className="hint">Deterministic calculations. Nothing changes until you explicitly apply an option.</p>
          </div>
        </div>
        <button
          type="button"
          className="btn-secondary min-h-10 px-4 text-xs font-semibold"
          onClick={() => void explain()}
          disabled={ai.state.status === 'loading'}
        >
          <Icon name="sparkle" className="h-4 w-4 text-accent" />
          Explain these options
        </button>
      </div>

      <div aria-live="polite" className="mt-3">
        {ai.state.status === 'loading' && (
          <AiLoading label="Gemini is explaining the options…" progress={ai.progress} />
        )}
        {ai.state.status === 'error' && (
          <AiError message={ai.state.message} onRetry={() => void explain()} />
        )}
        {ai.state.status === 'done' && <AnswerMeta progress={ai.progress} />}
      </div>

      <ul className="mt-5 grid gap-4 md:grid-cols-3">
        {options.map((o) => {
          const explanation = explanations.find((e) => e.optionId === o.id);
          return (
            <li
              key={o.id}
              className="flex flex-col justify-between rounded-2xl border border-line bg-paper/60 p-5 shadow-sm transition-all hover:border-accent/40"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-bold text-accent">
                    Saves {formatINR(o.coversRupees)}
                  </span>
                </div>
                <h3 className="mt-2 text-base font-bold text-ink">{o.title}</h3>
                <p className="mt-1 text-xs text-ink-soft">{o.description}</p>
                {o.changes.length > 0 && (
                  <p className="mt-2.5 rounded-lg bg-card p-2 text-xs font-semibold text-ink">
                    {describeChanges(plan.occasion, o.changes)}
                  </p>
                )}
                {o.warning && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-warn">
                    <Icon name="alert" className="h-3.5 w-3.5 shrink-0" />
                    <span>{o.warning}</span>
                  </p>
                )}
                {explanation && (
                  <div className="mt-3 border-t border-line/60 pt-2 text-xs">
                    <p className="font-medium text-ink">{explanation.summary}</p>
                    <p className="hint mt-1">Best when: {explanation.bestWhen}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-2">
                {confirming === o.id ? (
                  <Confirm
                    prompt={`Apply "${o.title}"? Your budget will be adjusted to cover the gap.`}
                    confirmLabel="Yes, apply"
                    onCancel={() => setConfirming(null)}
                    onConfirm={() => {
                      setConfirming(null);
                      onApply(o);
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    className="btn-primary w-full min-h-10 text-xs font-semibold"
                    onClick={() => setConfirming(o.id)}
                  >
                    Apply
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
