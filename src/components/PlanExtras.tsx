import { categoryLabel } from '../engine';
import { CATEGORIES, type Category, type Occasion } from '../schemas';
import { Field } from './ui';

const PRIORITY_CATEGORIES = CATEGORIES.filter((c) => c !== 'contingency');

/** The optional customization section of the intake: aesthetic vibe and priority weightings. */
export function PlanExtras({
  occasion,
  vibe,
  priorities,
  onVibe,
  onPriorities,
}: {
  occasion: Occasion;
  vibe: string;
  priorities: Category[];
  onVibe: (vibe: string) => void;
  onPriorities: (priorities: Category[]) => void;
}) {
  function toggle(category: Category) {
    onPriorities(
      priorities.includes(category)
        ? priorities.filter((c) => c !== category)
        : [...priorities, category],
    );
  }

  return (
    <details className="group rounded-2xl border border-white/70 dark:border-white/10 bg-white/40 dark:bg-white/5 p-4 transition-all backdrop-blur-md open:bg-white/60 dark:open:bg-white/10 open:shadow-glass">
      <summary className="flex min-h-11 cursor-pointer items-center justify-between font-semibold text-ink">
        <span>Make it yours (optional)</span>
        <span className="text-xs font-semibold text-accent group-open:rotate-180 transition-transform duration-200">
          ▼
        </span>
      </summary>
      <div className="mt-4 space-y-5 border-t border-line/60 pt-4">
        <Field label="Style or vibe" hint="For example: royal traditional, minimalist elegance, pastel florals.">
          {(p) => (
            <input
              {...p}
              className="input"
              maxLength={200}
              placeholder="e.g. Traditional Marathi ceremony with grand dinner"
              value={vibe}
              onChange={(e) => onVibe(e.target.value)}
            />
          )}
        </Field>
        <fieldset>
          <legend className="label">
            What matters most? We give these categories more of the budget.
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {PRIORITY_CATEGORIES.map((c) => {
              const selected = priorities.includes(c);
              return (
                <label
                  key={c}
                  className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                    selected
                      ? 'border-accent/40 bg-accent-soft/80 text-accent shadow-sm'
                      : 'border-white/60 dark:border-white/10 bg-white/40 dark:bg-white/5 text-ink hover:bg-white/60 dark:hover:bg-white/10'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded accent-accent"
                    checked={selected}
                    onChange={() => toggle(c)}
                  />
                  <span>{categoryLabel(occasion, c)}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>
    </details>
  );
}
