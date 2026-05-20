import { viewMeta } from '../../data/vehicleInspectionZones.js';

const VIEW_ICONS = {
  front: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="10" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="4.5" cy="8" r="1" fill="currentColor" />
      <circle cx="11.5" cy="8" r="1" fill="currentColor" />
      <rect x="6" y="10" width="4" height="2" rx="1" stroke="currentColor" strokeWidth="1" />
    </svg>
  ),
  side: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="3" width="14" height="9" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="4" cy="10.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="12" cy="10.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="7" y="3.5" width="2" height="1.5" rx="0.5" stroke="currentColor" strokeWidth="1" />
      <rect x="11" y="5" width="1.5" height="2" rx="0.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  ),
  rear: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="10" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="4.5" cy="7" r="1" fill="currentColor" />
      <circle cx="11.5" cy="7" r="1" fill="currentColor" />
      <circle cx="11.5" cy="9" r="1" fill="currentColor" />
      <circle cx="4.5" cy="9" r="1" fill="currentColor" />
    </svg>
  ),
};

export default function CarViewTabs({ view, onChange }) {
  return (
    <div className="rounded-[20px] bg-aquaCard/80 p-1.5 ring-1 ring-pine/8">
      <div className="grid grid-cols-3 gap-1.5">
        {Object.entries(viewMeta).map(([key, v]) => {
          const active = view === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={`min-h-[44px] rounded-[16px] px-2 text-sm font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                active
                  ? 'bg-pine text-white shadow-lg shadow-pine/20 scale-[1.02]'
                  : 'text-muted hover:text-ink hover:bg-white/60'
              }`}
            >
              <span className={active ? 'text-white' : 'text-muted/50'}>
                {VIEW_ICONS[key]}
              </span>
              {v.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
