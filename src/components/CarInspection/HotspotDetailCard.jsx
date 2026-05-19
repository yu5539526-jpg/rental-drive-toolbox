import { AlertTriangle, Camera, Check, Search, ShieldAlert } from 'lucide-react';
import { riskLevelStyles } from '../../data/carInspectionHotspots.js';

/* ---- 信息块 ---- */

function InfoBlock({ icon: Icon, label, items, content, tone }) {
  const isCoral = tone === 'coral';
  return (
    <div className={`rounded-2xl px-3 py-2.5 ${isCoral ? 'bg-coral/5 ring-1 ring-coral/15' : 'bg-aquaCard'}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={13} className={isCoral ? 'text-coral' : 'text-pine'} />
        <p className={`text-[11px] font-bold ${isCoral ? 'text-coral' : 'text-pine'}`}>{label}</p>
      </div>
      {items ? (
        <ul className="space-y-0.5">
          {items.map((item, i) => (
            <li key={i} className="flex gap-1.5 text-[13px] font-medium leading-relaxed text-ink">
              <span className="text-faint/60 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[13px] font-medium leading-relaxed text-ink">{content}</p>
      )}
    </div>
  );
}

/* ---- 详情卡片 ---- */

export default function HotspotDetailCard({ point, isChecked, onToggleCheck }) {
  const badge = riskLevelStyles[point.riskLevel] || riskLevelStyles['重点留证'];

  return (
    <section className="overflow-hidden rounded-[24px] border border-pine/10 bg-card shadow-card fade-up">
      <div className="flex">
        <div className={`w-1 shrink-0 ${isChecked ? 'bg-success' : 'bg-red'}`} />
        <div className="flex-1 p-4 pl-3.5">
          {/* 头部 */}
          <div className="flex items-center gap-2.5">
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${badge}`}>
              <AlertTriangle size={17} />
            </span>
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="text-base font-bold text-ink truncate">{point.name}</h2>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${badge}`}>
                {point.riskLevel}
              </span>
            </div>
          </div>

          {/* 内容 */}
          <div className="mt-3 grid gap-2.5">
            <InfoBlock icon={Search} label="看什么" items={point.checkPoints} />
            <InfoBlock icon={Camera} label="怎么拍" items={point.photoTips} />
            <InfoBlock icon={ShieldAlert} label="注意点" content={point.warning} tone="coral" />
          </div>

          {/* 已检查按钮 */}
          <div className="mt-3">
            <button
              type="button"
              onClick={() => onToggleCheck(point.id)}
              className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[13px] font-bold transition-all duration-200 ${
                isChecked
                  ? 'bg-mint text-success ring-1 ring-success/20'
                  : 'bg-aquaCard text-pine hover:bg-mint/60 active:scale-[0.98]'
              }`}
            >
              {isChecked ? (
                <>
                  <Check size={15} />
                  已检查
                </>
              ) : (
                '标记已检查'
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
