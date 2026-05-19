import C from './brandColors.js';

export default function Hotspot({ point, isSelected, isChecked, onClick }) {
  const selected = isSelected?.id === point.id;
  const checked = isChecked && !selected;
  const cx = point.rect.x + point.rect.w / 2;
  const cy = point.rect.y + point.rect.h / 2;
  const labelY = point.rect.y - 5;

  const fillColor = selected ? C.red : checked ? C.success : C.pine;
  const fillOpacity = selected ? 0.12 : checked ? 0.1 : 0.06;
  const strokeColor = selected ? C.red : checked ? C.success : C.pine;
  const strokeWidth = selected ? 2.5 : checked ? 1.5 : 1;
  const strokeOpacity = selected ? 1 : checked ? 0.5 : 0.2;

  return (
    <g
      className="cursor-pointer"
      onClick={() => onClick(point)}
      role="button"
      aria-label={`${point.name}，${point.riskLevel}${checked ? '，已检查' : ''}`}
    >
      <title>{point.name} — {point.riskLevel}{checked ? ' ✓' : ''}</title>

      <rect
        x={point.rect.x}
        y={point.rect.y}
        width={point.rect.w}
        height={point.rect.h}
        rx="8"
        className="transition-all duration-200"
        fill={fillColor}
        opacity={fillOpacity}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
      />

      {!selected && (
        <rect
          x={point.rect.x}
          y={point.rect.y}
          width={point.rect.w}
          height={point.rect.h}
          rx="8"
          fill={C.pine}
          opacity="0"
          stroke={C.pine}
          strokeWidth="1.5"
          strokeOpacity="0"
          className="transition-all duration-150 hover:fill-opacity-[0.08] hover:stroke-opacity-[0.3]"
          style={{ pointerEvents: 'none' }}
        />
      )}

      {selected && (
        <rect
          x={point.rect.x}
          y={point.rect.y}
          width={point.rect.w}
          height={point.rect.h}
          rx="8"
          fill="none"
          stroke={C.red}
          strokeWidth="2.5"
          className="animate-pulse"
          opacity="0.5"
        />
      )}

      {selected ? (
        <g>
          <rect x={cx - 22} y={labelY - 16} width="44" height="16" rx="8" fill={C.red} opacity="0.9" />
          <polygon points={`${cx - 4},${labelY} ${cx + 4},${labelY} ${cx},${labelY + 4}`} fill={C.red} opacity="0.9" />
          <text
            x={cx}
            y={labelY - 4}
            textAnchor="middle"
            fill={C.white}
            fontSize="10"
            fontWeight="bold"
            fontFamily="PingFang SC, Microsoft YaHei, sans-serif"
          >
            {point.shortLabel || point.name}
          </text>
        </g>
      ) : checked ? (
        <g>
          <circle cx={cx} cy={cy} r="8" fill={C.success} opacity="0.85" />
          <text x={cx} y={cy + 3.5} textAnchor="middle" fill={C.white} fontSize="9" fontWeight="bold" fontFamily="PingFang SC, Microsoft YaHei, sans-serif">✓</text>
        </g>
      ) : (
        <circle cx={cx} cy={cy} r="3.5" fill={C.pine} opacity="0.25" />
      )}
    </g>
  );
}
