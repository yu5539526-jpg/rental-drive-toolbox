export default function ProgressBar({ value, tone = 'pine' }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  const color = tone === 'coral' ? 'bg-coral' : tone === 'amber' ? 'bg-[#d88635]' : 'bg-pine';

  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-[#d7e8e3]">
      <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${safeValue}%` }} />
    </div>
  );
}
