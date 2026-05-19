/**
 * DOM 版热区叠加组件
 *
 * 热区以 position.left / position.top 为中心点，通过 transform 居中。
 * - 默认：半透明浅蓝边框 + 中心标签（大热区）或小圆点（小热区）
 * - 选中：红色边框 + 红色底 + 上方标签弹泡 + 脉冲动画
 * - 已检查：绿色边框 + 中心 ✓
 * - 移动端：所有热区显示圆点，不显示文字标签
 */

export default function HotspotOverlay({ point, isSelected, isChecked, onClick }) {
  const selected = isSelected?.id === point.id;
  const checked = isChecked && !selected;
  const { left, top, width, height } = point.position;
  const large = width >= 12 && height >= 12;

  let borderBg;
  if (selected) {
    borderBg = 'border-red/85 bg-red/10 z-20';
  } else if (checked) {
    borderBg = 'border-emerald-400/50 bg-emerald-400/8 z-10';
  } else {
    borderBg = 'border-sky-400/35 bg-sky-400/5 hover:border-sky-400/60 hover:bg-sky-400/10 z-10';
  }

  return (
    <button
      type="button"
      className={`absolute rounded-xl transition-all duration-200 cursor-pointer border-2 ${borderBg}`}
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: `${width}%`,
        height: `${height}%`,
        transform: 'translate(-50%, -50%)',
      }}
      onClick={() => onClick(point)}
      aria-label={`${point.name}，${point.riskLevel}${checked ? '，已检查' : ''}`}
    >
      {/* === 默认态：大热区显示文字标签（桌面端） === */}
      {large && !selected && !checked && (
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none max-sm:hidden">
          <span className="text-[10px] font-bold text-sky-700/55 leading-none select-none">
            {point.label}
          </span>
        </span>
      )}

      {/* === 默认态：小热区或移动端 → 中心圆点 === */}
      {!selected && !checked && (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-sky-400/60 pointer-events-none sm:hidden" />
      )}
      {!large && !selected && !checked && (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-sky-400/60 pointer-events-none max-sm:hidden" />
      )}

      {/* === 选中态：上方标签弹泡 === */}
      {selected && (
        <span
          className="absolute left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-red text-white text-[10px] font-bold whitespace-nowrap pointer-events-none z-30"
          style={{ bottom: 'calc(100% + 3px)' }}
        >
          {point.shortLabel}
        </span>
      )}

      {/* === 选中态：中心红点 === */}
      {selected && (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-red/80 pointer-events-none" />
      )}

      {/* === 选中态：脉冲动画环 === */}
      {selected && (
        <span className="absolute inset-0 rounded-xl border-2 border-red animate-pulse pointer-events-none" />
      )}

      {/* === 已检查：中心绿色对勾 === */}
      {checked && (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white text-[10px] font-bold pointer-events-none">
          ✓
        </span>
      )}
    </button>
  );
}
