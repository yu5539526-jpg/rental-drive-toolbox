import { imageHotspotsByView, viewMeta } from '../../data/carInspectionImageHotspots.js';
import HotspotOverlay from './HotspotOverlay.jsx';

/**
 * 图片版车身验车地图
 *
 * - 白色卡片，圆角与网站整体风格一致
 * - 正面 / 背面使用较小最大宽度（图片偏方），侧面使用较宽容器
 * - 图片保持原比例，不变形不裁切
 * - 热区叠加层完全覆盖图片，不影响清晰度
 */

export default function CarInspectionImageMap({ view, selected, checkedSet, onSelect }) {
  const hotspots = imageHotspotsByView[view] || [];
  const meta = viewMeta[view];
  const isSide = view === 'side';

  return (
    <div className="overflow-hidden rounded-[24px] border border-pine/10 bg-white shadow-card">
      {/* 提示文字 */}
      <p className="px-4 pt-2.5 pb-1.5 text-center text-[11px] font-bold text-faint">
        点击车身部位查看检查重点
      </p>

      {/* 图片区域 — 极浅蓝白底，不同视角不同最大宽度 */}
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

        {/* 热区叠加层 */}
        <div className="absolute inset-0">
          {hotspots.map((p) => (
            <HotspotOverlay
              key={p.id}
              point={p}
              isSelected={selected}
              isChecked={checkedSet && checkedSet[p.id]}
              onClick={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
