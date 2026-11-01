import { useState, type FormEvent } from 'react';
import { localAnswer, planFacts } from '../engine';
import { askPlanner, type RequestOptions } from '../lib/api';
import { useAiCall } from '../lib/useAiCall';
import type { ChatTurn, Plan } from '../schemas';
import { Icon } from './Icon';
import { AnswerMeta } from './ThinkingTrace';
import { AiLoading } from './ui';

interface Turn extends ChatTurn {
  source?: 'ai' | 'local';
}

const SUGGESTIONS = [
  'What should I do next?',
  'Are we over budget?',
  'Which vendors are still pending?',
  'How do I politely negotiate with the caterer?',
];

/** Interactive AI Copilot grounded in the celebration plan's live numbers. */
export function AskPlanner({ plan, today }: { plan: Plan; today: string }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const ai = useAiCall((options: RequestOptions, request: Parameters<typeof askPlanner>[0]) =>
    askPlanner(request, options),
  );
  const busy = ai.state.status === 'loading';

  async function ask(question: string) {
    const text = question.trim().slice(0, 500);
    if (!text || busy) return;
    const history = turns.slice(-8).map(({ role, text: t }) => ({ role, text: t.slice(0, 1200) }));
    setTurns((current) => [...current, { role: 'user', text }]);
    setDraft('');
    const result = await ai.run({ question: text, history, facts: planFacts(plan, today) });
    const reply: Turn = result
      ? { role: 'assistant', text: result.answer, source: 'ai' }
      : { role: 'assistant', text: localAnswer(text, plan, today), source: 'local' };
    setTurns((current) => [...current, reply]);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void ask(draft);
  }

  return (
    <section className="mt-6 border-t border-line/80 pt-5" aria-labelledby="ask-h">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="ask-h" className="flex items-center gap-2 text-base font-semibold text-ink">
          <Icon name="mail" className="h-4 w-4 text-accent" />
          <span>Ask the planner</span>
        </h3>
        {turns.length > 0 && (
          <button
            type="button"
            className="btn-quiet min-h-8 text-xs font-semibold"
            onClick={() => setTurns([])}
          >
            New conversation
          </button>
        )}
      </div>
      <p className="hint">
        Ask questions in English or Hinglish. Grounded strictly in your plan&apos;s real numbers.
      </p>

      <div role="log" aria-live="polite" aria-label="Conversation" className="mt-3.5 space-y-3">
        <ol className="space-y-3">
          {turns.map((turn, index) => (
            <li
              key={index}
              className={`rounded-2xl p-4 text-sm shadow-sm transition-all backdrop-blur-sm ${
                turn.role === 'user'
                  ? 'ml-6 border border-line/80 bg-field/90 sm:ml-12'
                  : 'mr-6 border border-accent/25 bg-accent-soft/80 sm:mr-12'
              }`}
            >
              <div className="mb-1.5 flex items-center gap-2">
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    turn.role === 'user'
                      ? 'bg-paper text-ink-soft'
                      : turn.source === 'ai'
                        ? 'bg-accent text-on-accent'
                        : 'bg-card text-ink-soft'
                  }`}
                >
                  {turn.role === 'user'
                    ? 'You'
                    : turn.source === 'ai'
                      ? 'Assistant (Gemini)'
                      : 'Assistant (built-in planner, AI unavailable)'}
                </span>
              </div>
              <p className="whitespace-pre-line leading-relaxed text-ink">{turn.text}</p>
              {turn.source === 'ai' && index === turns.length - 1 && !busy && (
                <AnswerMeta progress={ai.progress} />
              )}
            </li>
          ))}
        </ol>
      </div>

      {busy && (
        <div className="mt-3">
          <AiLoading label="Gemini is thinking about your plan…" progress={ai.progress} />
        </div>
      )}

      {turns.length === 0 && (
        <div role="group" className="mt-3 flex flex-wrap gap-2" aria-label="Suggested questions">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              className="btn-secondary min-h-8 rounded-full px-3 py-1 text-xs font-medium text-ink-soft hover:text-ink"
              onClick={() => void ask(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form className="mt-4 flex gap-2" onSubmit={submit}>
        <label htmlFor="planner-q" className="sr-only">
          Your question
        </label>
        <input
          id="planner-q"
          className="input flex-1"
          placeholder="Ask a question about budget, timeline or vendors…"
          value={draft}
          disabled={busy}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button
          type="submit"
          className="btn-primary min-h-11 px-5"
          disabled={busy || draft.trim() === ''}
        >
          Ask
        </button>
      </form>
    </section>
  );
}
