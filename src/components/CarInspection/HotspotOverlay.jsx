/**
 * 极简小圆点热点 — 车身验车避坑图
 *
 * - 44px 触摸区域，10px 视觉圆点
 * - 无文字标签、无编号、无气泡弹窗
 * - 四态：默认 / 选中 / 已检查 / 保险重点
 */

const RISK = {
  '高频争议': { hex: '#E28880', ring: 'rgba(226,136,128,0.28)', glow: 'rgba(226,136,128,0.10)' },
  '容易忽略': { hex: '#CD9F4C', ring: 'rgba(205,159,76,0.28)',   glow: 'rgba(205,159,76,0.10)' },
  '重点留证': { hex: '#4B8493', ring: 'rgba(75,132,147,0.28)',   glow: 'rgba(75,132,147,0.10)' },
};

/** basePriority → riskLevel 映射（兼容新旧数据格式） */
function resolveRiskColors(point) {
  if (point.riskLevel && RISK[point.riskLevel]) return RISK[point.riskLevel];
  if (point.basePriority === 'must') return RISK['高频争议'];
  if (point.basePriority === 'warning') return RISK['重点留证'];
  return RISK['容易忽略'];
}

/** 从 point 提取 x / y 百分比 */
function getXY(point) {
  // 新版格式：x / y
  if (typeof point.x === 'number' && typeof point.y === 'number') {
    return { x: point.x, y: point.y };
  }
  // 旧版格式：position.left / position.top
  if (point.position) {
    return { x: point.position.left, y: point.position.top };
  }
  return { x: 50, y: 50 };
}

export default function HotspotOverlay({ point, isSelected, isChecked, highlightLevel, onClick }) {
  const selected = isSelected?.id === point.id;
  const checked = isChecked && !selected;
  const c = resolveRiskColors(point);
  const { x, y } = getXY(point);

  // ── 状态样式 ──
  let dotSize, dotBg, dotBorder, dotShadow, dotZ, dotScale;

  if (selected) {
    dotSize = 14;
    dotBg = c.hex;
    dotBorder = `2px solid ${c.hex}`;
    dotShadow = `0 0 0 4px ${c.glow}, 0 2px 12px rgba(0,0,0,0.18)`;
    dotZ = 30;
    dotScale = 1;
  } else if (checked) {
    dotSize = 11;
    dotBg = '#6DAF8B';
    dotBorder = '2px solid rgba(109,175,139,0.35)';
    dotShadow = '0 1px 4px rgba(109,175,139,0.18)';
    dotZ = 5;
    dotScale = 0.92;
  } else {
    dotSize = 10;
    dotBg = 'rgba(255,255,255,0.72)';
    dotBorder = `1.5px solid ${c.ring}`;
    dotShadow = `0 1px 4px rgba(0,0,0,0.10)`;
    dotZ = 10;
    dotScale = 1;
  }

  // ── 保险重点外圈 ──
  const showHighlightRing = !selected && !checked && (highlightLevel === 'high' || highlightLevel === 'medium');

  return (
    <button
      type="button"
      onClick={() => onClick(point)}
      aria-label={`${point.label || point.name}${checked ? '，已检查' : ''}${showHighlightRing ? '，保险重点' : ''}`}
      className="absolute flex items-center justify-center cursor-pointer rounded-full transition-all duration-300 ease-out"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) scale(${dotScale})`,
        width: 44,
        height: 44,
        zIndex: dotZ,
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
      }}
    >
      {/* 选中态：外圈脉冲光环 */}
      {selected && (
        <span
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            animation: 'hotspot-pulse 2s ease-out infinite',
            border: `2px solid ${c.hex}`,
            opacity: 0.25,
          }}
        />
      )}

      {/* 保险重点：暖色外圈 */}
      {showHighlightRing && (
        <span
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 28,
            height: 28,
            border: `2px solid ${highlightLevel === 'high' ? 'rgba(245,158,11,0.45)' : 'rgba(245,158,11,0.25)'}`,
            background: highlightLevel === 'high' ? 'rgba(245,158,11,0.06)' : 'transparent',
          }}
        />
      )}

      {/* 视觉圆点 */}
      <span
        className="block rounded-full transition-all duration-300 ease-out flex items-center justify-center"
        style={{
          width: dotSize,
          height: dotSize,
          background: dotBg,
          border: dotBorder,
          boxShadow: dotShadow,
          backdropFilter: selected || checked ? 'none' : 'blur(4px)',
          WebkitBackdropFilter: selected || checked ? 'none' : 'blur(4px)',
        }}
      >
        {/* 已检查：小对勾 */}
        {checked && (
          <svg width="8" height="8" viewBox="0 0 12 12" fill="none" className="pointer-events-none">
            <path d="M1.5 6.5L4.5 9.5L10.5 2.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </button>
  );
}
