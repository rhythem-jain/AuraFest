import { formatINR, type GuestImpact } from '../engine';
import { Icon } from './Icon';

interface GuestImpactSummaryProps {
  guests: number;
  impact: GuestImpact;
}

export function GuestImpactSummary({ guests, impact }: GuestImpactSummaryProps) {
  return (
    <p className="tabular text-sm font-medium text-ink" data-testid="guest-impact">
      {guests} guests × {formatINR(Math.round(impact.perPlate))} per plate needs{' '}
      <strong className="font-bold text-accent">{formatINR(impact.requiredCatering)}</strong> for
      catering. You have budgeted{' '}
      <strong className="font-bold text-ink">{formatINR(impact.currentCatering)}</strong>
      {impact.overBy > 0 ? (
        <>
          :{' '}
          <span className="inline-flex items-center gap-1 font-bold text-warn">
            <Icon name="alert" className="h-4 w-4" />
            {formatINR(impact.overBy)} short.
          </span>
        </>
      ) : (
        '. That covers it.'
      )}
    </p>
  );
}
