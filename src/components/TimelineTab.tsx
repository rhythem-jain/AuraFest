import { useMemo } from 'react';
import {
  affectedByDelays,
  buildSchedule,
  compressTasks,
  diffDays,
  phaseFor,
  scheduleCompression,
  ScheduleError,
  timelineToIcs,
  type ScheduledTask,
} from '../engine';
import { downloadText } from '../lib/download';
import { formatDate } from '../lib/format';
import type { Plan } from '../schemas';
import type { Action } from '../state/planStore';
import { Icon } from './Icon';
import { RunSheet } from './RunSheet';
import { TaskRow } from './TaskRow';

const EMPTY: ScheduledTask[] = [];

export function TimelineTab({
  plan,
  today,
  dispatch,
}: {
  plan: Plan;
  today: string;
  dispatch: (action: Action) => void;
}) {
  const result = useMemo(() => {
    try {
      return { schedule: buildSchedule(plan.tasks, plan.eventDate, today), error: null };
    } catch (error) {
      return {
        schedule: EMPTY,
        error: error instanceof ScheduleError ? error.message : 'The timeline could not be built.',
      };
    }
  }, [plan.tasks, plan.eventDate, today]);
  const affected = useMemo(() => {
    try {
      return affectedByDelays(compressTasks(plan.tasks, plan.eventDate, today));
    } catch {
      return {};
    }
  }, [plan.tasks, plan.eventDate, today]);
  const compression = useMemo(
    () => scheduleCompression(plan.tasks, plan.eventDate, today),
    [plan.tasks, plan.eventDate, today],
  );
  const titles = useMemo(
    () => Object.fromEntries(plan.tasks.map((t) => [t.id, t.title])),
    [plan.tasks],
  );

  const groups = useMemo(() => {
    const map = new Map<number, { label: string; tasks: ScheduledTask[] }>();
    for (const task of result.schedule) {
      const phase = phaseFor(task.leadDays);
      const group = map.get(phase.order) ?? { label: phase.label, tasks: [] };
      group.tasks.push(task);
      map.set(phase.order, group);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]).map(([order, g]) => ({ order, ...g }));
  }, [result.schedule]);

  const daysToEvent = diffDays(today, plan.eventDate);
  const problems = result.schedule.filter(
    (t) => t.status !== 'done' && (t.flags.atRisk || t.flags.overdue || t.flags.impossible),
  ).length;

  if (result.error) {
    return (
      <div role="alert" className="card text-warn">
        <p className="flex items-center gap-2 font-semibold">
          <Icon name="alert" />
          {result.error}
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <section className="card shadow-glass backdrop-blur-xl" aria-labelledby="tl-h">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 id="tl-h" className="text-lg font-bold sm:text-xl">
              Your planning timeline
            </h2>
            <p className="mt-1 text-xs font-semibold text-ink-soft sm:text-sm">
              Event on <strong className="text-ink">{formatDate(plan.eventDate)}</strong>
              {daysToEvent > 0
                ? ` · ${daysToEvent} days to go`
                : daysToEvent === 0
                  ? ' · today'
                  : ' · this date has passed'}
            </p>
            <p className="hint">
              Delay a task and everything that depends on it moves too in real time.
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary min-h-10 px-4 text-xs font-semibold shadow-sm backdrop-blur-sm"
            onClick={() =>
              downloadText(
                `aurafest-${plan.occasion}-${plan.eventDate}.ics`,
                timelineToIcs(plan, result.schedule, today),
                'text/calendar;charset=utf-8',
              )
            }
          >
            <Icon name="calendar" className="h-4 w-4 text-accent" />
            Add timeline to calendar (.ics)
          </button>
        </div>

        {compression.compressed && (
          <div
            data-testid="compressed-note"
            className="mt-4 rounded-xl border border-accent/25 bg-accent-soft/50 p-3.5 text-xs font-medium text-ink backdrop-blur-sm"
          >
            Your event is {compression.availableDays} days away, sooner than the usual{' '}
            {compression.spanDays}-day plan, so earlier tasks have been scheduled closer together.
          </div>
        )}

        {problems > 0 ? (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-warn/30 bg-warn-soft/90 p-3 text-xs font-semibold text-warn shadow-sm">
            <Icon name="alert" className="h-4 w-4 shrink-0" />
            <span>
              {problems === 1 ? '1 task needs attention' : `${problems} tasks need attention`}
            </span>
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-ok">
            <Icon name="check" className="h-4 w-4" />
            <span>On track</span>
          </div>
        )}
      </section>

      <div className="space-y-6">
        {groups.map((group) => (
          <section key={group.order} aria-labelledby={`phase-${group.order}`} className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <h3
                id={`phase-${group.order}`}
                className="text-sm font-bold uppercase tracking-wider text-ink-soft"
              >
                {group.label}
              </h3>
            </div>
            <ul className="space-y-3">
              {group.tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  occasion={plan.occasion}
                  titles={titles}
                  pushedBy={affected[task.id] ?? null}
                  onStatus={(id, status) => dispatch({ type: 'setTaskStatus', id, status })}
                  onDelay={(id, days) => dispatch({ type: 'setDelay', id, days })}
                  onAssignee={(id, assignee) => dispatch({ type: 'setAssignee', id, assignee })}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>

      <RunSheet occasion={plan.occasion} />
    </div>
  );
}
