import { Camera, Car, ChevronRight, Lightbulb, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar.jsx';
import { CarInspectionImageMap, CarViewTabs, HotspotDetailCard } from '../components/CarInspection/index.js';
import { imageHotspotsByView } from '../data/carInspectionImageHotspots.js';

/* ---- 常量 ---- */

const allHotspotIds = Object.values(imageHotspotsByView).flat().map((p) => p.id);
const totalCount = allHotspotIds.length;

const tips = [
  { icon: Car, text: '先绕车录一段完整视频，口播日期和车牌号' },
  { icon: Camera, text: '开闪光灯拍缝隙，自然光看不清的伤闪光灯下很明显' },
];

/* ---- 页面 ---- */

export default function CarInspectionMap() {
  const [view, setView] = useState('side');
  const [selected, setSelected] = useState(() => {
    const pts = imageHotspotsByView.side;
    const highRisk = pts.filter((p) => p.riskLevel === '高频争议');
    return highRisk.length > 0 ? highRisk[0] : pts[0];
  });
  const [checkedSet, setCheckedSet] = useState({});

  const checkedCount = Object.keys(checkedSet).length;

  const toggleCheck = (id) => {
    setCheckedSet((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  };

  const switchView = (nextView) => {
    setView(nextView);
    const pts = imageHotspotsByView[nextView];
    const highRisk = pts.filter((p) => p.riskLevel === '高频争议');
    setSelected(highRisk.length > 0 ? highRisk[0] : pts[0]);
  };

  return (
    <main className="min-h-screen bg-cream">
      <TopBar title="车身验车避坑图" />

      <section className="px-4 pt-4 page-pad">
        {/* 头部 */}
        <section className="rounded-[24px] border border-pine/10 bg-card p-3.5 shadow-card">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[18px] bg-aquaCard text-lg" aria-hidden="true">🔍</span>
            <div className="min-w-0">
              <h1 className="text-lg font-bold leading-tight text-ink">点车身，看哪里要留证</h1>
              <p className="mt-1 text-[13px] font-medium leading-relaxed text-muted">
                点一下车身重点部位，快速知道取车时要检查什么、怎么拍。
              </p>
            </div>
          </div>
        </section>

        {/* 进度 */}
        <div className="mt-3 rounded-[18px] bg-card border border-pine/10 px-3.5 py-2.5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] font-bold text-ink">
              已检查 <span className="text-pine">{checkedCount}</span> / {totalCount} 个重点部位
            </span>
            <span className="text-[12px] font-bold text-muted">
              {checkedCount === 0 ? '点击部位开始检查' : checkedCount === totalCount ? '全部完成' : `${Math.round((checkedCount / totalCount) * 100)}%`}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-aquaCard">
            <div className="h-full rounded-full bg-pine transition-all duration-300" style={{ width: `${Math.round((checkedCount / totalCount) * 100)}%` }} />
          </div>
        </div>

        {/* Tab */}
        <div className="mt-3">
          <CarViewTabs view={view} onChange={switchView} />
        </div>

        {/* SVG */}
        <div className="mt-3">
          <CarInspectionImageMap view={view} selected={selected} checkedSet={checkedSet} onSelect={setSelected} />
        </div>

        {/* 详情卡片 */}
        <div className="mt-3">
          <HotspotDetailCard point={selected} isChecked={!!checkedSet[selected.id]} onToggleCheck={toggleCheck} />
        </div>

        {/* 贴士 */}
        <section className="mt-3 rounded-[24px] border border-pine/10 bg-card p-3.5 shadow-card">
          <div className="flex items-center gap-2 mb-2.5">
            <Lightbulb size={16} className="text-amberWarm" />
            <h3 className="text-sm font-bold text-ink">验车拍照小贴士</h3>
          </div>
          <div className="grid gap-2">
            {tips.map((item, i) => (
              <div key={i} className="flex gap-2 rounded-xl bg-aquaCard px-3 py-2">
                <item.icon size={14} className="text-pine shrink-0 mt-0.5" />
                <p className="text-[13px] font-medium leading-relaxed text-ink">{item.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-2.5 rounded-xl bg-amberSoft/45 px-3 py-2 text-[11px] font-bold leading-relaxed text-amberDark ring-1 ring-warning/20">
            取车时建议保存原图，不要只发压缩图到聊天软件。
          </p>
        </section>

        {/* 完整清单链接 */}
        <div className="mt-3 rounded-[24px] border border-pine/10 bg-card p-3.5 shadow-card">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-mint text-pine">
              <Sparkles size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink">需要逐项打钩核对？</p>
              <p className="mt-0.5 text-[12px] text-muted leading-relaxed">互动图适合快速定位，打钩核对可用完整版清单。</p>
            </div>
            <Link to="/checklist" className="shrink-0 inline-flex items-center gap-1 rounded-xl bg-aquaCard px-3 py-2 text-[12px] font-bold text-pine hover:bg-mint/60 transition-colors">
              打开<ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
