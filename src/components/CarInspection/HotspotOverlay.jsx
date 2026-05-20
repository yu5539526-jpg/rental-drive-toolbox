/**
 * 车身检测标记点组件
 *
 * 以编号圆形标记取代原来的矩形热区，解决重叠问题。
 * - 默认：小圆形 + 风险等级底色 + 短标签
 * - 悬停：上浮效果
 * - 选中：放大 + 脉冲光环 + 上方标签弹泡
 * - 已检查：绿色对勾 + 降低不透明度
 *
 * 使用 position.left / top 作为圆心，百分比定位。
 */

const RISK_HEX = {
  '高频争议': '#E54B4B',
  '容易忽略': '#D97706',
  '重点留证': '#174B63',
};

const RISK_RING = {
  '高频争议': 'ring-[#E54B4B]/30',
  '容易忽略': 'ring-[#D97706]/30',
  '重点留证': 'ring-[#174B63]/30',
};

export default function HotspotOverlay({ point, isSelected, isChecked, onClick, index }) {
  const selected = isSelected?.id === point.id;
  const checked = isChecked && !selected;
  const hex = RISK_HEX[point.riskLevel] || RISK_HEX['重点留证'];
  const ringClass = RISK_RING[point.riskLevel] || RISK_RING['重点留证'];
  const { left, top } = point.position;

  let pinStyle;
  if (selected) {
    pinStyle = {
      background: hex,
      boxShadow: `0 4px 14px ${hex}40, 0 0 0 4px ${hex}30`,
      zIndex: 30,
      transform: 'translate(-50%, -50%) scale(1.25)',
    };
  } else if (checked) {
    pinStyle = {
      background: '#10B981',
      boxShadow: '0 2px 6px rgba(16,185,129,0.25)',
      zIndex: 10,
      opacity: 0.75,
      transform: 'translate(-50%, -50%) scale(0.9)',
    };
  } else {
    pinStyle = {
      background: hex,
      boxShadow: `0 2px 8px ${hex}35`,
      zIndex: 20,
      transform: 'translate(-50%, -50%) scale(1)',
    };
  }

  return (
    <button
      type="button"
      className={`absolute rounded-full transition-all duration-300 ease-out cursor-pointer
        flex items-center justify-center
        w-[6.5%] max-w-[36px] min-w-[26px]
        aspect-square
        ${checked ? '' : ringClass} ring-1
        ${selected ? '' : 'hover:scale-110'}`}
      style={{
        left: `${left}%`,
        top: `${top}%`,
        ...pinStyle,
      }}
      onClick={() => onClick(point)}
      aria-label={`${point.name}，${point.riskLevel}${checked ? '，已检查' : ''}`}
    >
      {/* 内容：已检查 → 对勾，否则 → 短标签 */}
      {checked ? (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="pointer-events-none drop-shadow-sm">
          <path d="M2 7.5L5.5 11L12 3" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <span className="text-[10px] font-extrabold text-white leading-none pointer-events-none select-none tracking-tight drop-shadow-sm">
          {point.shortLabel}
        </span>
      )}

      {/* === 选中态：上方标签弹泡 === */}
      {selected && (
        <span
          className="absolute left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full text-white text-[11px] font-bold whitespace-nowrap pointer-events-none z-40 shadow-lg"
          style={{ bottom: 'calc(100% + 7px)', background: hex }}
        >
          {point.name}
          {/* 三角箭头 */}
          <span
            className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent"
            style={{ borderTopColor: hex }}
          />
        </span>
      )}

      {/* === 选中态：脉冲光环 === */}
      {selected && (
        <span
          className="absolute inset-0 rounded-full border-[2.5px] pointer-events-none animate-ping opacity-25"
          style={{ borderColor: hex }}
        />
      )}
    </button>
  );
}
