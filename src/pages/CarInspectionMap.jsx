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
  const progressPct = Math.round((checkedCount / totalCount) * 100);

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
        {/* 头部介绍卡片 */}
        <section className="rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-[20px] text-xl"
              style={{ background: 'linear-gradient(135deg, #E8F5F0, #D4EDE8)' }}
              aria-hidden="true"
            >
              🔍
            </span>
            <div className="min-w-0">
              <h1 className="text-lg font-bold leading-tight text-ink">点车身，看哪里要留证</h1>
              <p className="mt-1 text-[13px] font-medium leading-relaxed text-muted">
                点击标记点查看检查重点，逐项核对后勾选已检查。
              </p>
            </div>
          </div>
        </section>

        {/* 进度条 */}
        <div className="mt-3 rounded-[20px] bg-card border border-pine/10 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] font-bold text-ink">
              已检查 <span className="text-pine text-base">{checkedCount}</span>
              <span className="text-faint"> / {totalCount}</span> 个部位
            </span>
            <span className="text-[12px] font-bold text-muted tabular-nums">
              {checkedCount === 0 ? '点击标记点开始' : checkedCount === totalCount ? '全部完成 ✓' : `${progressPct}%`}
            </span>
          </div>
          <div className="mt-2.5 h-[6px] overflow-hidden rounded-full bg-aquaCard">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPct}%`,
                background: progressPct === 100
                  ? 'linear-gradient(90deg, #10B981, #34D399)'
                  : 'linear-gradient(90deg, #174B63, #1E6B8A)',
              }}
            />
          </div>
        </div>

        {/* 视图切换 Tab */}
        <div className="mt-3">
          <CarViewTabs view={view} onChange={switchView} />
        </div>

        {/* 车身图 + 标记点 */}
        <div className="mt-3">
          <CarInspectionImageMap view={view} selected={selected} checkedSet={checkedSet} onSelect={setSelected} />
        </div>

        {/* 详情卡片 */}
        <div className="mt-3">
          <HotspotDetailCard point={selected} isChecked={!!checkedSet[selected.id]} onToggleCheck={toggleCheck} />
        </div>

        {/* 拍照小贴士 */}
        <section className="mt-3 rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={16} className="text-[#D97706]" />
            <h3 className="text-sm font-bold text-ink">验车拍照小贴士</h3>
          </div>
          <div className="grid gap-2">
            {tips.map((item, i) => (
              <div key={i} className="flex gap-2.5 rounded-xl bg-aquaCard px-3.5 py-2.5">
                <item.icon size={15} className="text-pine shrink-0 mt-0.5" />
                <p className="text-[13px] font-medium leading-relaxed text-ink">{item.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-2.5 rounded-xl bg-amberSoft/40 px-3.5 py-2.5 text-[11px] font-bold leading-relaxed text-amberDark ring-1 ring-warning/20">
            取车时建议保存原图到相册，不要只发压缩图到聊天软件。
          </p>
        </section>

        {/* 完整清单入口 */}
        <div className="mt-3 rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mint text-pine">
              <Sparkles size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink">需要逐项打钩核对？</p>
              <p className="mt-0.5 text-[12px] text-muted leading-relaxed">互动图适合快速定位，打钩核对可用完整版清单。</p>
            </div>
            <Link
              to="/checklist"
              className="shrink-0 inline-flex items-center gap-1 rounded-xl bg-aquaCard px-3.5 py-2.5 text-[12px] font-bold text-pine hover:bg-mint/60 transition-colors"
            >
              打开<ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
