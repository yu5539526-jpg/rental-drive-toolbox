import { imageHotspotsByView, viewMeta } from '../../data/carInspectionImageHotspots.js';
import HotspotOverlay from './HotspotOverlay.jsx';

/**
 * 图片版车身验车地图
 *
 * - 白色卡片容纳车身图片和叠加标记点
 * - 正面 / 背面使用较小最大宽度，侧面使用较宽容器
 * - 图片保持原比例不变形
 * - 标记点层精确叠加在图片上方
 * - 底部图例帮助用户快速识别风险等级
 */

function RiskLegend({ hotspots }) {
  const highRisk = hotspots.filter((p) => p.riskLevel === '高频争议').length;
  const easyMiss = hotspots.filter((p) => p.riskLevel === '容易忽略').length;
  const important = hotspots.filter((p) => p.riskLevel === '重点留证').length;

  return (
    <div className="flex items-center justify-center gap-4 px-4 pb-3">
      {highRisk > 0 && (
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-muted">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E54B4B]" />
          高频争议
        </span>
      )}
      {easyMiss > 0 && (
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-muted">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
          容易忽略
        </span>
      )}
      {important > 0 && (
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-muted">
          <span className="w-2.5 h-2.5 rounded-full bg-[#174B63]" />
          重点留证
        </span>
      )}
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

      {/* 图片区域 */}
      <div
        className="car-image-map relative mx-auto bg-[#F8FCFE]"
        style={{ maxWidth: isSide ? 720 : 480 }}
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
