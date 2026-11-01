import { useEffect, useState } from 'react';
import type { AiProgress } from '../lib/useAiCall';
import { Icon } from './Icon';

/** Gemini's thought summaries start with a bold heading: split it from the text that follows. */
export function splitThought(text: string): { title: string | null; body: string } {
  const match = /^\s*\*\*(.+?)\*\*\s*/.exec(text);
  const title = match?.[1]?.trim() ?? null;
  const body = (match ? text.slice(match[0].length) : text).replace(/\*\*/g, '').trim();
  return { title, body };
}

/** "gemini-3.1-flash-lite" -> "Gemini 3.1 Flash Lite". */
export function modelLabel(id: string): string {
  return id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function Thoughts({ thoughts, live }: { thoughts: string[]; live: boolean }) {
  return (
    <ol className="space-y-3 border-l-2 border-accent/40 pl-3.5">
      {thoughts.map((thought, index) => {
        const { title, body } = splitThought(thought);
        const newest = live && index === thoughts.length - 1;
        return (
          <li key={index} className={`text-sm ${newest ? 'thought-in' : ''}`}>
            {title && <p className="font-semibold text-ink">{title}</p>}
            {body && <p className="mt-0.5 text-xs text-ink-soft">{body}</p>}
          </li>
        );
      })}
    </ol>
  );
}

function useElapsedSeconds(): number {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  return seconds;
}

/**
 * While Gemini works: a live modern thinking panel with a running timer and streaming thought summaries.
 */
export function LiveThinking({ label, progress }: { label: string; progress: AiProgress }) {
  const seconds = useElapsedSeconds();
  const { thoughts } = progress;
  return (
    <div
      role="status"
      className="rounded-2xl border border-accent/30 bg-accent-soft p-4 shadow-sm"
      data-testid="ai-loading"
    >
      <p className="flex items-center gap-2 text-sm font-semibold text-accent">
        <Icon name="sparkle" className="thinking-pulse h-4 w-4" />
        <span>{label}</span>
        <span className="tabular ml-auto rounded-full bg-card px-2 py-0.5 text-xs font-semibold text-ink-soft shadow-sm">
          {seconds}s
        </span>
      </p>
      <div data-testid="thinking-live" className="mt-3">
        {thoughts.length > 0 ? (
          <>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-accent">
              Gemini&apos;s thinking, live
            </p>
            <Thoughts thoughts={thoughts} live />
          </>
        ) : (
          <div className="space-y-2 py-1">
            <p className="text-xs text-ink-soft">Waiting for Gemini&apos;s first thought…</p>
            <div className="skeleton h-2.5 w-3/4" />
            <div className="skeleton h-2.5 w-1/2" />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * After the answer: which model replied, and the reasoning behind it, kept collapsed for inspection.
 */
export function AnswerMeta({ progress }: { progress: AiProgress }) {
  const { thoughts, model } = progress;
  if (!model && thoughts.length === 0) return null;
  return (
    <div className="mt-3 text-xs text-ink-soft" data-testid="answer-meta">
      {model && (
        <p className="flex items-center gap-1.5 font-medium">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-ok" />
          Answered by {modelLabel(model)}
        </p>
      )}
      {thoughts.length > 0 && (
        <details className="mt-1.5 text-xs" data-testid="thinking-done">
          <summary className="cursor-pointer font-semibold text-accent hover:underline">
            How Gemini thought about this ({thoughts.length}{' '}
            {thoughts.length === 1 ? 'step' : 'steps'})
          </summary>
          <div className="mt-2.5 rounded-xl border border-line bg-card/80 p-3">
            <Thoughts thoughts={thoughts} live={false} />
          </div>
        </details>
      )}
    </div>
  );
}
