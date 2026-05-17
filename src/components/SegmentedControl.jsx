const columnClasses = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};

export default function SegmentedControl({
  options,
  value,
  onChange,
  columns,
  ariaLabel,
  className = '',
  optionClassName = '',
  getOptionClassName,
}) {
  const gridClass = columnClasses[columns || options.length] || 'grid-cols-2';

  return (
    <div className={`rounded-2xl bg-[#F1F3EC] p-1 ring-1 ring-pine/10 ${className}`} role="group" aria-label={ariaLabel}>
      <div className={`grid gap-1 ${gridClass}`}>
        {options.map((option) => {
          const active = value === option.value;
          const stateClass = getOptionClassName
            ? getOptionClassName(option, active)
            : active
              ? 'bg-pine text-white shadow-sm'
              : 'text-muted/70 hover:bg-card/60 hover:text-ink';

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`min-h-10 rounded-xl px-2 text-center text-[12px] font-bold leading-tight transition-all duration-200 ${stateClass} ${optionClassName}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
