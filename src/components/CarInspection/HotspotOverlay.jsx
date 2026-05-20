/**
 * 车身检测标记点
 *
 * - 珊瑚/麦金/空青 年轻化配色，与站点奶油+松绿主题协调
 * - 缩小标记点 + 降低选中放大比例，消除紧凑视图中的重叠
 * - 边界感知弹泡
 */

const RISK = {
  '高频争议': {
    hex: '#E28880',
    ring: 'rgba(226,136,128,0.28)',
    shadow: 'rgba(226,136,128,0.14)',
    glow: 'rgba(226,136,128,0.10)',
  },
  '容易忽略': {
    hex: '#CD9F4C',
    ring: 'rgba(205,159,76,0.28)',
    shadow: 'rgba(205,159,76,0.14)',
    glow: 'rgba(205,159,76,0.10)',
  },
  '重点留证': {
    hex: '#4B8493',
    ring: 'rgba(75,132,147,0.28)',
    shadow: 'rgba(75,132,147,0.14)',
    glow: 'rgba(75,132,147,0.10)',
  },
};

const FALLBACK = RISK['重点留证'];

function getTooltipHAlign(leftPct) {
  if (leftPct <= 14) return 'left';
  if (leftPct >= 86) return 'right';
  return 'center';
}

export default function HotspotOverlay({ point, isSelected, isChecked, onClick, index }) {
  const selected = isSelected?.id === point.id;
  const checked = isChecked && !selected;
  const c = RISK[point.riskLevel] || FALLBACK;
  const { left, top } = point.position;
  const align = getTooltipHAlign(left);

  const pinSize = 'w-[5.5%] max-w-[28px] min-w-[20px]';

  // ── 状态样式 ──
  let pinBg, pinBorder, pinShadow, pinZ, pinScale;

  if (selected) {
    pinBg = c.hex;
    pinBorder = `2px solid ${c.hex}`;
    pinShadow = `0 0 0 5px ${c.glow}, 0 4px 16px ${c.shadow}`;
    pinZ = 30;
    pinScale = 'scale-[1.15]';
  } else if (checked) {
    pinBg = 'rgba(109,175,139,0.16)';
    pinBorder = '2px solid rgba(109,175,139,0.40)';
    pinShadow = 'none';
    pinZ = 5;
    pinScale = 'scale-90';
  } else {
    pinBg = 'rgba(255,255,255,0.88)';
    pinBorder = `2px solid ${c.ring}`;
    pinShadow = `0 1.5px 6px ${c.shadow}`;
    pinZ = 10;
    pinScale = 'scale-100 hover:scale-110';
  }

  // ── 弹泡对齐 ──
  const bubblePosClass =
    align === 'left'
      ? 'left-0 translate-x-0'
      : align === 'right'
        ? 'right-0 translate-x-0'
        : 'left-1/2 -translate-x-1/2';

  const arrowPosClass =
    align === 'left'
      ? 'left-4'
      : align === 'right'
        ? 'right-4'
        : 'left-1/2 -translate-x-1/2';

  const textColor = selected ? '#fff' : c.hex;

  return (
    <button
      type="button"
      onClick={() => onClick(point)}
      aria-label={`${point.name}，${point.riskLevel}${checked ? '，已检查' : ''}`}
      className={`absolute rounded-full transition-all duration-300 ease-out cursor-pointer
        flex items-center justify-center
        ${pinSize} aspect-square ${pinScale}`}
      style={{
        left: `${left}%`,
        top: `${top}%`,
        transform: `translate(-50%, -50%)`,
        background: pinBg,
        border: pinBorder,
        boxShadow: pinShadow,
        zIndex: pinZ,
        backdropFilter: selected || checked ? undefined : 'blur(6px)',
        WebkitBackdropFilter: selected || checked ? undefined : 'blur(6px)',
      }}
    >
      {checked ? (
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="pointer-events-none">
          <path d="M2 7.5L5.5 11L12 3" stroke="#6DAF8B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <span
          className="text-[9px] font-extrabold leading-none pointer-events-none select-none tracking-tight transition-colors duration-300"
          style={{ color: textColor }}
        >
          {point.shortLabel}
        </span>
      )}

      {/* 选中态：弹泡（边界感知） */}
      {selected && (
        <span
          className={`absolute px-2.5 py-1 rounded-full text-white text-[11px] font-bold whitespace-nowrap pointer-events-none z-40 shadow-xl ${bubblePosClass}`}
          style={{
            bottom: 'calc(100% + 7px)',
            background: `linear-gradient(135deg, ${c.hex}, ${c.hex}dd)`,
          }}
        >
          {point.name}
          <span
            className={`absolute top-full w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent ${arrowPosClass}`}
            style={{ borderTopColor: c.hex }}
          />
        </span>
      )}

      {/* 选中态：脉冲光环 */}
      {selected && (
        <span
          className="absolute inset-0 rounded-full pointer-events-none animate-ping opacity-20"
          style={{ border: `2px solid ${c.hex}` }}
        />
      )}
    </button>
  );
}
