import { useState, type KeyboardEvent, type MutableRefObject } from 'react';
import { planReadiness } from '../engine';
import { BRAND } from '../lib/branding';
import { useTheme } from '../lib/theme';
import type { Plan } from '../schemas';
import { shareHash } from '../state/share';
import { BrandMark, Icon, type IconName } from './Icon';
import { Confirm } from './ui';

export type TabId = 'setup' | 'budget' | 'timeline' | 'vendors';

export interface HeaderProps {
  plan: Plan | null;
  tab: TabId;
  onTabChange: (tab: TabId) => void;
  onReset: () => void;
  tabs: readonly { id: TabId; label: string; icon: IconName }[];
  refs: MutableRefObject<Record<string, HTMLButtonElement | null>>;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

export function Header({
  plan,
  tab,
  onTabChange,
  onReset,
  tabs,
  refs,
  onKeyDown,
}: HeaderProps) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [share, setShare] = useState<{ status: 'copied' | 'manual'; url: string } | null>(null);
  const readiness = plan ? planReadiness(plan) : null;
  const { theme, toggle } = useTheme();

  async function copyLink(current: Plan) {
    const url = `${window.location.origin}${window.location.pathname}${shareHash(current)}`;
    try {
      await navigator.clipboard.writeText(url);
      setShare({ status: 'copied', url });
    } catch {
      setShare({ status: 'manual', url });
    }
  }

  return (
    <header
      role="banner"
      className="no-print w-full md:w-64 lg:w-72 md:shrink-0 md:sticky md:top-0 md:h-screen md:flex md:flex-col md:justify-between border-b md:border-b-0 md:border-r border-white/60 dark:border-white/10 bg-white/45 dark:bg-slate-900/40 shadow-glass backdrop-blur-2xl transition-colors duration-200 z-30 p-4 sm:p-5 overflow-y-auto"
    >
      <div>
        <div className="flex items-center justify-between gap-3 border-b border-line/60 pb-4">
          <div className="flex items-center gap-3">
            <BrandMark className="h-9 w-9 shrink-0 shadow-sm" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-bold tracking-tight text-ink truncate">
                  {BRAND.name}
                </h1>
                <span className="rounded-full border border-accent/30 bg-accent-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent shrink-0">
                  Luxe
                </span>
              </div>
              <p className="text-[11px] font-medium text-ink-soft truncate">
                Celebration OS
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-secondary min-h-10 min-w-10 px-2.5 text-xs font-semibold flex items-center justify-center shrink-0"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="h-4 w-4" />
          </button>
        </div>

        <nav aria-label="Plan navigation" className="mt-4">
          <p className="mb-2 hidden md:block px-1 text-[10px] font-bold uppercase tracking-wider text-ink-soft">
            Operating Modules
          </p>
          <div
            role="tablist"
            aria-label="Plan sections"
            className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible p-1 md:p-0 rounded-2xl md:rounded-none bg-paper/50 md:bg-transparent"
          >
            {tabs.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  ref={(el) => {
                    refs.current[t.id] = el;
                  }}
                  id={`tab-${t.id}`}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  aria-controls={`panel-${t.id}`}
                  tabIndex={active ? 0 : -1}
                  className={`flex min-h-11 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shrink-0 md:shrink ${
                    active
                      ? 'bg-gradient-to-r from-accent to-accent-dark text-on-accent shadow-glass-glow border border-white/20'
                      : 'text-ink-soft hover:bg-white/50 dark:hover:bg-white/10 hover:text-ink'
                  }`}
                  onClick={() => onTabChange(t.id)}
                  onKeyDown={onKeyDown}
                >
                  <Icon name={t.icon} className="h-4 w-4 shrink-0" />
                  <span className="truncate">{t.label}</span>
                  {active && (
                    <span className="hidden md:inline-block ml-auto h-2 w-2 rounded-full bg-on-accent shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {readiness && (
          <div
            className="mt-4 md:mt-6 rounded-2xl border border-white/60 dark:border-white/10 bg-white/45 dark:bg-slate-800/40 p-3.5 shadow-glass backdrop-blur-md"
            aria-label="Plan readiness"
          >
            <div className="flex items-baseline justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-ink">
                <span className="inline-block h-2 w-2 rounded-full bg-accent animate-pulse" />
                Plan readiness {readiness.percent}%
              </span>
              <span className="text-[11px] font-normal text-ink-soft">
                {readiness.tasksDone}/{readiness.tasksTotal} tasks
              </span>
            </div>
            <progress
              className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full accent-accent"
              max={100}
              value={readiness.percent}
              aria-label="Plan readiness percent"
            />
            <p className="mt-1 text-[11px] text-ink-soft text-right">
              {readiness.quotesVerified}/{readiness.quotesTotal} vendors confirmed
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 md:mt-auto pt-3 border-t border-line/60 space-y-2">
        {plan && (
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              className="btn-secondary min-h-9 px-2.5 text-xs font-semibold flex items-center gap-1.5 flex-1 justify-center"
              onClick={() => void copyLink(plan)}
              aria-label="Share link"
            >
              <Icon name="link" className="h-3.5 w-3.5" />
              <span>Share link</span>
            </button>
            <button
              type="button"
              className="btn-secondary min-h-9 px-2.5 text-xs font-semibold flex items-center gap-1.5 flex-1 justify-center"
              onClick={() => window.print()}
              aria-label="Print summary"
            >
              <Icon name="printer" className="h-3.5 w-3.5" />
              <span>Print summary</span>
            </button>
            <button
              type="button"
              className="btn-secondary min-h-9 px-2.5 text-xs font-semibold flex items-center gap-1.5 justify-center text-warn hover:border-warn"
              onClick={() => setConfirmReset(true)}
              aria-label="Reset"
            >
              <Icon name="reset" className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        )}

        <div aria-live="polite" className="space-y-2">
          {share?.status === 'copied' && (
            <div className="flex items-center gap-2 rounded-xl border border-ok/30 bg-ok-soft px-3 py-2 text-xs font-medium text-ok shadow-sm">
              <Icon name="check" className="h-4 w-4 shrink-0 text-ok" />
              <span>Link copied to clipboard. Anyone with this link can view this celebration plan.</span>
            </div>
          )}
          {share?.status === 'manual' && (
            <div className="rounded-xl border border-line bg-paper p-2.5 text-xs">
              <label htmlFor="share-url" className="label text-xs">
                Copy this link
              </label>
              <input
                id="share-url"
                readOnly
                className="input font-mono text-xs"
                value={share.url}
                onFocus={(e) => e.currentTarget.select()}
              />
            </div>
          )}
          {confirmReset && (
            <div className="mt-2">
              <Confirm
                prompt="Reset the whole plan? Your budget, timeline and quotations will be cleared from this browser."
                confirmLabel="Yes, reset"
                onCancel={() => setConfirmReset(false)}
                onConfirm={() => {
                  setConfirmReset(false);
                  setShare(null);
                  onReset();
                }}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
