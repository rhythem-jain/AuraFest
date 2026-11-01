interface GuestQuickScenarioButtonsProps {
  guests: number;
  onSelect: (target: number) => void;
}

export function GuestQuickScenarioButtons({ guests, onSelect }: GuestQuickScenarioButtonsProps) {
  return [-25, 25, 50].map((delta) => {
    const target = Math.max(1, guests + delta);
    return (
      <button
        key={delta}
        type="button"
        className="rounded-lg border border-line/70 bg-paper/70 px-2 py-0.5 text-[11px] font-semibold text-ink-soft hover:bg-card hover:text-ink shadow-sm"
        onClick={() => onSelect(target)}
      >
        {delta > 0 ? `+${delta}` : delta}
      </button>
    );
  });
}
