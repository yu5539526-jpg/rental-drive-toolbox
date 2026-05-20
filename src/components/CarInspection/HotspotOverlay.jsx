/**
 * 车身检测标记点 — 精密光学检测仪器风格
 *
 * - 低饱和度专业配色，告别红/黄/蓝"红绿灯"感
 * - 圆形标记点 + 风险等级色环 + 白色内核（暗底上清晰可见）
 * - 边界感知弹泡：靠近边缘时自动调整方向，不超出容器
 * - 选中态呼吸光环 + 微动效
 */

const RISK = {
  '高频争议': {
    hex: '#CB5A4F',
    ring: 'rgba(203,90,79,0.30)',
    shadow: 'rgba(203,90,79,0.16)',
    glow: 'rgba(203,90,79,0.10)',
  },
  '容易忽略': {
    hex: '#C4873C',
    ring: 'rgba(196,135,60,0.30)',
    shadow: 'rgba(196,135,60,0.16)',
    glow: 'rgba(196,135,60,0.10)',
  },
  '重点留证': {
    hex: '#3E6B7C',
    ring: 'rgba(62,107,124,0.30)',
    shadow: 'rgba(62,107,124,0.16)',
    glow: 'rgba(62,107,124,0.10)',
  },
};

const FALLBACK = RISK['重点留证'];

function getTooltipHAlign(leftPct) {
  if (leftPct <= 13) return 'left';
  if (leftPct >= 87) return 'right';
  return 'center';
}

export default function HotspotOverlay({ point, isSelected, isChecked, onClick, index }) {
  const selected = isSelected?.id === point.id;
  const checked = isChecked && !selected;
  const c = RISK[point.riskLevel] || FALLBACK;
  const { left, top } = point.position;
  const align = getTooltipHAlign(left);

  const pinSize = 'w-[7%] max-w-[34px] min-w-[24px]';

  // ── 计算 pin 内联样式 ──
  let pinBg, pinBorder, pinShadow, pinZ, pinScale;

  if (selected) {
    pinBg = c.hex;
    pinBorder = `2px solid ${c.hex}`;
    pinShadow = `0 0 0 6px ${c.glow}, 0 4px 20px ${c.shadow}`;
    pinZ = 30;
    pinScale = 'scale-125';
  } else if (checked) {
    pinBg = 'rgba(123,175,140,0.18)';
    pinBorder = '2px solid rgba(123,175,140,0.45)';
    pinShadow = 'none';
    pinZ = 5;
    pinScale = 'scale-90';
  } else {
    pinBg = 'rgba(255,255,255,0.88)';
    pinBorder = `2px solid ${c.ring}`;
    pinShadow = `0 2px 8px ${c.shadow}`;
    pinZ = 10;
    pinScale = 'scale-100 hover:scale-115';
  }

  // ── 弹泡对齐 class ──
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
      {/* 内容 */}
      {checked ? (
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="pointer-events-none">
          <path d="M2 7.5L5.5 11L12 3" stroke="#7BAF8C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <span
          className="text-[10px] font-extrabold leading-none pointer-events-none select-none tracking-tight transition-colors duration-300"
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
            bottom: 'calc(100% + 8px)',
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
          style={{ border: `2.5px solid ${c.hex}` }}
        />
      )}
    </button>
  );
}
