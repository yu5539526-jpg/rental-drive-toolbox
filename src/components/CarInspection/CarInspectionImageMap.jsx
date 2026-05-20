import { imageHotspotsByView, viewMeta } from '../../data/carInspectionImageHotspots.js';
import HotspotOverlay from './HotspotOverlay.jsx';

/**
 * 图片版车身验车地图 — 精密光学检测仪器风格
 *
 * - 深色图片容器（模拟灯箱效果），让车身图更突出
 * - 标记点叠加层保持精确对齐
 * - 底部图例使用新配色
 */

const RISK_HEX = {
  '高频争议': '#CB5A4F',
  '容易忽略': '#C4873C',
  '重点留证': '#3E6B7C',
};

function RiskLegend({ hotspots }) {
  const counts = {};
  hotspots.forEach((p) => {
    counts[p.riskLevel] = (counts[p.riskLevel] || 0) + 1;
  });

  return (
    <div className="flex items-center justify-center gap-5 px-4 pb-3.5 pt-1">
      {Object.entries(RISK_HEX).map(([level, hex]) => {
        if (!counts[level]) return null;
        return (
          <span key={level} className="inline-flex items-center gap-1.5 text-[10px] font-bold" style={{ color: '#6B7280' }}>
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: hex,
                boxShadow: `0 0 0 2px ${hex}22`,
              }}
            />
            {level}
          </span>
        );
      })}
    </div>
  );
}

export default function CarInspectionImageMap({ view, selected, checkedSet, onSelect }) {
  const hotspots = imageHotspotsByView[view] || [];
  const meta = viewMeta[view];
  const isSide = view === 'side';

  return (
    <div className="overflow-hidden rounded-[24px] border border-pine/10 bg-white shadow-card">
      {/* 提示文字 */}
      <p className="px-4 pt-3 pb-2 text-center text-[11px] font-bold text-faint">
        点击标记点查看检查重点
      </p>

      {/* 图片区域 — 深色灯箱底 */}
      <div
        className="car-image-map relative mx-auto rounded-2xl overflow-hidden"
        style={{
          maxWidth: isSide ? 720 : 480,
          background: 'linear-gradient(180deg, #1E2328 0%, #1A1E23 100%)',
        }}
      >
        <img
          src={meta.src}
          alt={`车身${meta.label}验车示意图`}
          className="block w-full h-auto select-none"
          draggable={false}
        />

        {/* 标记点叠加层 */}
        <div className="absolute inset-0">
          {hotspots.map((p, i) => (
            <HotspotOverlay
              key={p.id}
              point={p}
              isSelected={selected}
              isChecked={checkedSet && checkedSet[p.id]}
              onClick={onSelect}
              index={i + 1}
            />
          ))}
        </div>
      </div>

      {/* 风险等级图例 */}
      <RiskLegend hotspots={hotspots} />
    </div>
  );
}
