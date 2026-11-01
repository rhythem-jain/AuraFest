import { useMemo, useState } from 'react';
import {
  diffDays,
  planInsights,
  type Insight,
  type InsightSeverity,
  type InsightTab,
} from '../engine';
import { reviewPlan, type RequestOptions } from '../lib/api';
import { useAiCall } from '../lib/useAiCall';
import type { Plan } from '../schemas';
import { AskPlanner } from './AskPlanner';
import { Icon, type IconName } from './Icon';
import { AnswerMeta } from './ThinkingTrace';
import { AiError, AiLoading } from './ui';

const SEVERITY: Record<
  InsightSeverity,
  { label: string; icon: IconName; tone: string; bg: string }
> = {
  critical: {
    label: 'Urgent',
    icon: 'alert',
    tone: 'text-warn',
    bg: 'bg-warn-soft border-warn/30',
  },
  warning: {
    label: 'Needs attention',
    icon: 'clock',
    tone: 'text-warn',
    bg: 'bg-warn-soft/60 border-warn/25',
  },
  suggestion: {
    label: 'Suggestion',
    icon: 'sparkle',
    tone: 'text-accent',
    bg: 'bg-accent-soft/60 border-accent/25',
  },
};

const TAB_LABEL: Record<InsightTab, string> = {
  budget: 'Budget',
  timeline: 'Timeline',
  vendors: 'Vendors',
};

const COLLAPSED = 3;

function InsightRow({
  insight,
  onNavigate,
}: {
  insight: Insight;
  onNavigate: (tab: InsightTab) => void;
}) {
  const s = SEVERITY[insight.severity];
  return (
    <li
      className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5 transition-all ${s.bg}`}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <Icon name={s.icon} className={`mt-0.5 h-4 w-4 shrink-0 ${s.tone}`} />
        <div className="min-w-0">
          <p className="font-semibold text-ink">
            <span
              className={`mr-2 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${s.tone} bg-card/80`}
            >
              {s.label}
            </span>
            {insight.title}
          </p>
          <p className="mt-0.5 text-xs text-ink-soft">{insight.detail}</p>
        </div>
      </div>
      <button
        type="button"
        className="btn-secondary min-h-8 shrink-0 px-3 text-xs font-semibold"
        onClick={() => onNavigate(insight.tab)}
      >
        Open {TAB_LABEL[insight.tab]}
      </button>
    </li>
  );
}

/**
 * The planning assistant. The engine computes deterministic insights;
 * Gemini synthesizes them into an executive review.
 */
export function AssistantPanel({
  plan,
  today,
  onNavigate,
}: {
  plan: Plan;
  today: string;
  onNavigate: (tab: InsightTab) => void;
}) {
  const insights = useMemo(() => planInsights(plan, today), [plan, today]);
  const [expanded, setExpanded] = useState(false);
  const ai = useAiCall((options: RequestOptions, request: Parameters<typeof reviewPlan>[0]) =>
    reviewPlan(request, options),
  );
  const shown = expanded ? insights : insights.slice(0, COLLAPSED);
  const urgent = insights.filter((i) => i.severity !== 'suggestion').length;

  const askAi = () =>
    ai.run({
      occasion: plan.occasion,
      guests: plan.guests,
      totalBudget: plan.totalBudget,
      daysToEvent: diffDays(today, plan.eventDate),
      vibe: plan.vibe,
      insights: insights
        .slice(0, 10)
        .map(({ severity, title, detail }) => ({ severity, title, detail })),
    });

  return (
    <section className="card mb-6 shadow-glass backdrop-blur-xl" aria-labelledby="assistant-h">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/25 bg-accent-soft text-accent shadow-sm backdrop-blur-sm">
            <Icon name="sparkle" className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h2 id="assistant-h" className="flex items-center gap-2 text-lg font-bold sm:text-xl">
              Your planning assistant
            </h2>
            <p className="text-xs text-ink-soft">
              {urgent > 0 ? (
                <span className="font-semibold text-warn">
                  {urgent}{' '}
                  {urgent === 1 ? 'thing needs your attention' : 'things need your attention'}
                </span>
              ) : (
                <span className="font-semibold text-ok">Nothing urgent</span>
              )}
              {' · '}Deterministic engine analysis
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn-secondary min-h-9 px-3.5 text-xs font-semibold shadow-sm backdrop-blur-sm"
          onClick={() => void askAi()}
          disabled={ai.state.status === 'loading'}
        >
          <Icon name="sparkle" className="h-3.5 w-3.5 text-accent" />
          {ai.state.status === 'done' ? 'Refresh AI review' : 'Ask AI for a plan review'}
        </button>
      </div>

      <div className="mt-4" aria-live="polite">
        {ai.state.status === 'loading' && (
          <AiLoading label="Gemini is reviewing your plan…" progress={ai.progress} />
        )}
        {ai.state.status === 'error' && (
          <AiError message={ai.state.message} onRetry={() => void askAi()} />
        )}
        {ai.state.status === 'done' && (
          <div
            data-testid="ai-review"
            className="rounded-2xl border border-accent/25 bg-accent-soft/50 p-4 shadow-sm backdrop-blur-sm"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-accent">
              Gemini Executive Review
            </p>
            <p className="mt-1 text-sm font-medium leading-relaxed text-ink">
              {ai.state.data.summary}
            </p>
            {ai.state.data.steps.length > 0 && (
              <ol className="mt-2.5 list-decimal space-y-1 pl-5 text-xs font-semibold text-ink">
                {ai.state.data.steps.map((s) => (
                  <li key={s.title}>
                    <strong>{s.title}</strong>: {s.why}
                  </li>
                ))}
              </ol>
            )}
            <AnswerMeta progress={ai.progress} />
          </div>
        )}
      </div>

      {insights.length > 0 ? (
        <div className="mt-4">
          <ul className="space-y-2.5">
            {shown.map((insight) => (
              <InsightRow key={insight.id} insight={insight} onNavigate={onNavigate} />
            ))}
          </ul>
          {insights.length > COLLAPSED && (
            <button
              type="button"
              aria-expanded={expanded}
              className="btn-quiet mt-3 min-h-8 text-xs font-semibold"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? 'Show less' : `Show all ${insights.length} items`}
            </button>
          )}
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-line bg-paper/40 p-4 text-center text-xs font-semibold text-ok">
          Everything is on track.
        </p>
      )}

      <AskPlanner plan={plan} today={today} />
    </section>
  );
}
