import { useState } from 'react';
import { categoryLabel, type ScheduledTask } from '../engine';
import { formatDate } from '../lib/format';
import type { Occasion } from '../schemas';
import { Icon, type IconName } from './Icon';
import { Field } from './ui';

export interface TaskRowProps {
  task: ScheduledTask;
  occasion: Occasion;
  titles: Record<string, string>;
  pushedBy: string | null;
  onStatus: (id: string, status: 'todo' | 'done') => void;
  onDelay: (id: string, days: number) => void;
  onAssignee: (id: string, assignee: string) => void;
}

function Flag({ icon, text }: { icon: IconName; text: string }) {
  return (
    <span className="badge-warn">
      <Icon name={icon} className="h-3 w-3 shrink-0" />
      <span>{text}</span>
    </span>
  );
}

export function TaskRow({
  task,
  occasion,
  titles,
  pushedBy,
  onStatus,
  onDelay,
  onAssignee,
}: TaskRowProps) {
  const [editing, setEditing] = useState(false);
  const [days, setDays] = useState(String(task.delayDays ?? 7));
  const done = task.status === 'done';
  const delayed = task.status === 'delayed';
  const shifted = task.effectiveDate !== task.dueDate;
  const problem =
    !done &&
    (task.flags.atRisk || task.flags.overdue || task.flags.impossible || task.flags.tooLate);
  const dayCount = Number(days);
  const daysValid = Number.isInteger(dayCount) && dayCount >= 1 && dayCount <= 365;
  const flagged = Boolean(pushedBy) || problem;

  return (
    <li
      className="relative pb-6 pl-8 last:pb-0"
      data-testid={`task-${task.id}`}
      data-affected={pushedBy ? 'true' : undefined}
    >
      <span
        aria-hidden="true"
        className={`absolute left-0 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-paper transition-all ${
          done
            ? 'border-ok bg-ok text-paper shadow-sm'
            : flagged
              ? 'border-warn bg-warn-soft text-warn'
              : 'border-line text-ink-soft'
        }`}
      >
        {done ? <Icon name="check" className="h-3.5 w-3.5 stroke-[2.5]" /> : <span className="h-2 w-2 rounded-full bg-current" />}
      </span>

      <div
        className={`rounded-2xl border p-4.5 transition-all shadow-sm backdrop-blur-sm ${
          flagged
            ? 'border-warn/40 bg-warn-soft/60 shadow-sm'
            : done
              ? 'border-line/50 bg-card/50 opacity-90'
              : 'border-line/75 bg-card/85 hover:border-accent/40 hover:shadow-md'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className={`text-base font-bold ${done ? 'text-ink-soft line-through' : 'text-ink'}`}>
              {task.title}
            </h4>
            <p className="tabular mt-0.5 text-xs font-semibold text-ink-soft">
              {categoryLabel(occasion, task.category)} · Due {formatDate(task.dueDate)}
              {shifted && !done && <> · Now expected {formatDate(task.effectiveDate)}</>}
            </p>
          </div>
          <span className={done ? 'badge-verified' : delayed ? 'badge-warn' : 'badge-estimate'}>
            {done && <Icon name="check" className="h-3 w-3" />}
            {done ? 'Done' : delayed ? `Delayed ${task.delayDays} days` : 'To do'}
          </span>
        </div>

        {flagged && (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {pushedBy && <Flag icon="alert" text={`Pushed by delay in "${titles[pushedBy] ?? pushedBy}"`} />}
            {task.flags.overdue && !done && <Flag icon="clock" text="Overdue" />}
            {task.flags.tooLate && !task.flags.overdue && !done && (
              <Flag icon="clock" text="Due date already passed" />
            )}
            {task.flags.atRisk && !pushedBy && !done && <Flag icon="alert" text="At risk" />}
            {task.flags.impossible && !done && (
              <Flag icon="stop" text="Cannot finish before the event" />
            )}
          </div>
        )}

        {task.dependsOn.length > 0 && (
          <p className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-semibold text-ink-soft">Needs:</span>
            {task.dependsOn.map((id) => (
              <span key={id} className="rounded-md border border-line bg-paper px-2 py-0.5 font-semibold text-ink">
                {titles[id] ?? id}
              </span>
            ))}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line/60 pt-3">
          <div className="w-full sm:w-56">
            <label htmlFor={`assignee-${task.id}`} className="sr-only">
              Assignee
            </label>
            <input
              id={`assignee-${task.id}`}
              className="input min-h-9 px-3 py-1.5 text-xs font-medium"
              placeholder="Assign family member (e.g. Mama)"
              value={task.assignee ?? ''}
              onChange={(e) => onAssignee(task.id, e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`btn min-h-9 px-3.5 text-xs font-semibold ${
                done ? 'btn-secondary text-ink-soft' : 'btn-primary'
              }`}
              onClick={() => onStatus(task.id, done ? 'todo' : 'done')}
            >
              {done ? 'Mark as to do' : 'Done'}
            </button>
            <button
              type="button"
              className="btn-secondary min-h-9 px-3.5 text-xs font-semibold"
              onClick={() => setEditing((v) => !v)}
            >
              {delayed ? 'Change delay' : 'Mark delayed'}
            </button>
          </div>
        </div>

        {editing && (
          <div className="mt-3 rounded-xl border border-line bg-paper p-3.5">
            <Field label="Delay this task by how many days?">
              {(p) => (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    {...p}
                    type="number"
                    min={1}
                    max={365}
                    aria-label="Delayed by (days)"
                    className="input min-h-9 w-28 px-3 py-1 text-xs font-semibold"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-primary min-h-9 px-3.5 text-xs font-semibold"
                    disabled={!daysValid}
                    onClick={() => {
                      onDelay(task.id, dayCount);
                      setEditing(false);
                    }}
                  >
                    Apply delay
                  </button>
                  {delayed && (
                    <button
                      type="button"
                      className="btn-secondary min-h-9 px-3 text-xs font-semibold"
                      onClick={() => {
                        onDelay(task.id, 0);
                        setEditing(false);
                      }}
                    >
                      Clear delay
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-secondary min-h-9 px-3 text-xs font-semibold"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </Field>
            {!daysValid && (
              <p className="hint mt-1.5 text-warn font-medium">Enter 1 to 365 days.</p>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
