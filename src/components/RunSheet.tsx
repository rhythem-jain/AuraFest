import { RUN_SHEETS } from '../engine';
import type { Occasion } from '../schemas';

/** The day itself, in order. Suggested times only; families adjust them to their muhurat. */
export function RunSheet({ occasion }: { occasion: Occasion }) {
  return (
    <section className="card shadow-glass backdrop-blur-xl" aria-labelledby="runsheet-h">
      <div className="flex items-center justify-between gap-3">
        <h3 id="runsheet-h" className="font-display text-lg font-bold tracking-tight text-ink sm:text-xl">
          On the day: suggested run sheet
        </h3>
        <span className="rounded-full border border-accent/25 bg-accent-soft px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent shadow-sm backdrop-blur-sm">
          Day-of Protocol
        </span>
      </div>
      <p className="hint mt-1">
        Typical timings to share with family, coordinator and vendors. Adjust them to your muhurat and venue slot.
      </p>
      <ol className="mt-4 divide-y divide-line/60">
        {RUN_SHEETS[occasion].map((item) => (
          <li key={item.time} className="flex items-center gap-4 py-3 text-xs sm:text-sm rounded-xl px-2 transition-colors hover:bg-card/70">
            <time className="tabular flex h-8 w-16 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent-soft/80 font-bold text-accent shadow-sm backdrop-blur-sm">
              {item.time}
            </time>
            <span className="font-semibold text-ink">{item.title}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
