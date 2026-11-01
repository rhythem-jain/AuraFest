import { useMemo } from 'react';
import { vendorChecklist, VENDOR_STATUS_LABELS, type VendorStatus } from '../engine';
import type { Plan } from '../schemas';
import type { Action } from '../state/planStore';
import { Icon, type IconName } from './Icon';

const ICON: Record<VendorStatus, IconName> = {
  not_started: 'circle',
  contacted: 'mail',
  quote_received: 'file',
  quote_accepted: 'check',
};

export function VendorChecklist({
  plan,
  dispatch,
}: {
  plan: Plan;
  dispatch: (action: Action) => void;
}) {
  const items = useMemo(() => vendorChecklist(plan), [plan]);
  const confirmed = items.filter((i) => i.status === 'quote_accepted').length;

  return (
    <section className="card shadow-glass backdrop-blur-xl" aria-labelledby="checklist-h">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 id="checklist-h" className="text-lg font-bold sm:text-xl">
            Vendor checklist
          </h2>
          <p className="hint">
            Track vendor outreach. Accepting or saving a quotation automatically updates procurement
            status.
          </p>
        </div>
        <span className="rounded-full border border-accent/25 bg-accent-soft px-3.5 py-1 text-xs font-bold text-accent shadow-sm backdrop-blur-sm">
          {confirmed} of {items.length} vendors confirmed
        </span>
      </div>

      <ul className="mt-4 divide-y divide-line/60">
        {items.map((item) => (
          <li
            key={item.category}
            className="flex flex-wrap items-center justify-between gap-3 py-3.5 transition-colors hover:bg-card/70 px-2 rounded-xl"
          >
            <div className="min-w-0">
              <p className="text-sm font-bold text-ink">{item.label}</p>
              <p className="text-xs text-ink-soft">{item.hint}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={item.status === 'quote_accepted' ? 'badge-verified' : 'badge-estimate'}
              >
                <Icon name={ICON[item.status]} className="h-3 w-3" />
                <span>{VENDOR_STATUS_LABELS[item.status]}</span>
              </span>
              <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-line/75 bg-field/80 px-3 py-1 text-xs font-semibold hover:border-accent/40 shadow-sm backdrop-blur-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded accent-accent"
                  checked={item.status !== 'not_started'}
                  disabled={item.quotes > 0}
                  onChange={() => dispatch({ type: 'toggleContacted', category: item.category })}
                  aria-label={`Contacted ${item.label} vendor`}
                />
                Contacted
              </label>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
