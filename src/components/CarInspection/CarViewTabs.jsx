import { viewMeta } from '../../data/carInspectionHotspots.js';

export default function CarViewTabs({ view, onChange }) {
  return (
    <div className="rounded-[18px] bg-aquaCard p-1.5 ring-1 ring-pine/10">
      <div className="grid grid-cols-3 gap-1.5">
        {Object.entries(viewMeta).map(([key, v]) => {
          const active = view === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={`min-h-11 rounded-2xl px-2 text-sm font-bold transition-all duration-200 ${
                active ? 'bg-pine text-white shadow-sm' : 'text-pine hover:bg-white/70'
              }`}
            >
              {v.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
