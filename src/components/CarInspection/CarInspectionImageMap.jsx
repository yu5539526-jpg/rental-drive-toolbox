import { primaryZonesByView, viewMeta } from '../../data/vehicleInspectionZones.js';
import HotspotOverlay from './HotspotOverlay.jsx';

/**
 * 车身验车地图 — 极简小圆点版
 *
 * - 每个视角默认展示 7 个主要点位
 * - 支持保险重点高亮
 * - 深色灯箱底让车身图更突出
 */

const RISK_HEX = {
  '高频争议': '#E28880',
  '容易忽略': '#CD9F4C',
  '重点留证': '#4B8493',
};

function RiskLegend({ zones }) {
  const counts = {};
  zones.forEach((z) => {
    const level = z.basePriority === 'must' ? '高频争议' : z.basePriority === 'warning' ? '重点留证' : '容易忽略';
    counts[level] = (counts[level] || 0) + 1;
  });

  return (
    <div className="flex items-center justify-center gap-4 px-4 pb-3 pt-1">
      {Object.entries(RISK_HEX).map(([level, hex]) => {
        if (!counts[level]) return null;
        return (
          <span key={level} className="inline-flex items-center gap-1.5 text-[10px] font-bold" style={{ color: '#8B9DAF' }}>
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: hex, boxShadow: `0 0 0 2px ${hex}18` }}
            />
            {level}
          </span>
        );
      })}
    </div>
  );
}

export default function CarInspectionImageMap({ view, selected, checkedSet, onSelect, highlightedZoneIds }) {
  const zones = primaryZonesByView[view] || [];
  const meta = viewMeta[view];
  const isSide = view === 'side';
  const highlightSet = highlightedZoneIds instanceof Set ? highlightedZoneIds : new Set();

  return (
    <div className="overflow-hidden rounded-[24px] border border-pine/10 bg-white shadow-card">
      {/* 提示文字 */}
      <p className="px-4 pt-3 pb-2 text-center text-[11px] font-bold text-faint">
        点击圆点查看检查重点
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
          {zones.map((z) => (
            <HotspotOverlay
              key={z.id}
              point={z}
              isSelected={selected}
              isChecked={checkedSet && checkedSet[z.id]}
              highlightLevel={highlightSet.has(z.id) ? 'high' : undefined}
              onClick={onSelect}
            />
          ))}
        </div>
      </div>

      {/* 风险等级图例 */}
      <RiskLegend zones={zones} />
    </div>
  );
}
