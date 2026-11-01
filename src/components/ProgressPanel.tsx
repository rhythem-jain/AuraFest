import { useEffect, useRef } from 'react';
import { planReadiness, vendorChecklist, VENDOR_STATUS_LABELS } from '../engine';
import type { Plan } from '../schemas';
import { Icon } from './Icon';

const TASK_LABEL = { todo: 'To do', done: 'Done', delayed: 'Delayed' } as const;

function Tick({ done, warn = false }: { done: boolean; warn?: boolean }) {
  return done ? (
    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-ok" />
  ) : (
    <Icon
      name={warn ? 'alert' : 'circle'}
      className={`mt-0.5 h-4 w-4 shrink-0 ${warn ? 'text-warn' : 'text-ink-soft'}`}
    />
  );
}

/**
 * Global progress drawer: instant overview of open tasks and vendor confirmations.
 * Accessible from any view and dismissible via keyboard or button.
 */
export function ProgressPanel({
  plan,
  open,
  onToggle,
  onNavigate,
}: {
  plan: Plan;
  open: boolean;
  onToggle: () => void;
  onNavigate: (tab: 'timeline' | 'vendors') => void;
}) {
  const readiness = planReadiness(plan);
  const vendors = vendorChecklist(plan);
  const tasks = [...plan.tasks].sort(
    (a, b) => Number(a.status === 'done') - Number(b.status === 'done'),
  );
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onToggle();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onToggle]);

  useEffect(() => {
    if (open) closeRef.current?.focus();
    else if (wasOpen.current) toggleRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className="no-print fixed bottom-5 left-5 md:left-auto md:right-6 md:bottom-6 z-40 flex min-h-12 items-center gap-2.5 rounded-full border border-white/80 dark:border-white/20 bg-white/70 dark:bg-slate-900/70 px-5 py-2.5 text-xs font-bold text-ink shadow-glass-glow backdrop-blur-2xl transition-all hover:scale-[1.03] hover:border-accent/50 sm:text-sm"
        aria-expanded={open}
        aria-controls="progress-panel"
        onClick={onToggle}
      >
        <span className="flex h-2.5 w-2.5 rounded-full bg-accent animate-pulse" />
        <Icon name="route" className="h-4 w-4 text-accent" />
        <span>Progress {readiness.percent}%</span>
      </button>

      <aside
        id="progress-panel"
        aria-label="Plan progress"
        hidden={!open}
        className={`no-print fixed inset-y-0 left-0 z-50 ${
          open ? 'flex' : 'hidden'
        } w-[min(24rem,100vw)] flex-col border-r border-line/75 bg-card/90 shadow-2xl backdrop-blur-2xl transition-transform duration-300`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-line/80 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <Icon name="route" className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-ink">Plan progress</h2>
          </div>
          <button ref={closeRef} type="button" className="btn-secondary min-h-8 px-3 text-xs font-semibold" onClick={onToggle}>
            <Icon name="x" className="h-3.5 w-3.5" />
            Hide
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <div className="rounded-2xl border border-line/70 bg-field/60 p-4 shadow-sm backdrop-blur-sm">
            <p className="text-xs font-semibold text-ink sm:text-sm">
              <strong className="text-accent">{readiness.percent}% ready.</strong> {readiness.tasksDone} of{' '}
              {readiness.tasksTotal} tasks done, {readiness.quotesVerified} of{' '}
              {readiness.quotesTotal} vendors confirmed.
            </p>
            <progress
              className="mt-2 h-2 w-full overflow-hidden rounded-full accent-accent"
              max={100}
              value={readiness.percent}
            />
          </div>

          <section aria-labelledby="progress-vendors">
            <div className="flex items-center justify-between gap-2">
              <h3 id="progress-vendors" className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                Vendors and quotations
              </h3>
              <button type="button" className="btn-quiet min-h-7 text-xs font-semibold" onClick={() => onNavigate('vendors')}>
                Open
              </button>
            </div>
            <ul className="mt-2.5 space-y-2">
              {vendors.map((item) => (
                <li
                  key={item.category}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line/60 bg-paper/40 p-2.5 text-xs transition-colors hover:bg-paper"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Tick done={item.status === 'quote_accepted'} />
                    <span className="font-semibold text-ink truncate">{item.label}</span>
                  </div>
                  <span className="text-ink-soft shrink-0">
                    {VENDOR_STATUS_LABELS[item.status]}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="progress-tasks">
            <div className="flex items-center justify-between gap-2">
              <h3 id="progress-tasks" className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                Timeline tasks
              </h3>
              <button type="button" className="btn-quiet min-h-7 text-xs font-semibold" onClick={() => onNavigate('timeline')}>
                Open
              </button>
            </div>
            <ul className="mt-2.5 space-y-2">
              {tasks.map((task) => {
                const done = task.status === 'done';
                const delayed = task.status === 'delayed';
                return (
                  <li
                    key={task.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-line/60 bg-paper/40 p-2.5 text-xs transition-colors hover:bg-paper"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Tick done={done} warn={delayed} />
                      <span className={`font-semibold truncate ${done ? 'text-ink-soft line-through' : 'text-ink'}`}>
                        {task.title}
                      </span>
                    </div>
                    <span className="text-ink-soft shrink-0">
                      {delayed ? `Delayed ${task.delayDays}d` : TASK_LABEL[task.status]}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </aside>
    </>
  );
}
