import { AlertTriangle, Camera, Check, Search, ShieldAlert } from 'lucide-react';
import { riskLevelStyles } from '../../data/carInspectionImageHotspots.js';

const RISK_HEX = {
  '高频争议': '#E54B4B',
  '容易忽略': '#D97706',
  '重点留证': '#174B63',
};

/* ---- 信息块 ---- */

function InfoBlock({ icon: Icon, label, items, content, tone }) {
  const isCoral = tone === 'coral';
  return (
    <div className={`rounded-2xl px-3.5 py-3 ${isCoral ? 'bg-[#E54B4B]/6 ring-1 ring-[#E54B4B]/12' : 'bg-aquaCard'}`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon size={13} className={isCoral ? 'text-[#E54B4B]' : 'text-pine'} />
        <p className={`text-[11px] font-bold ${isCoral ? 'text-[#E54B4B]' : 'text-pine'}`}>{label}</p>
      </div>
      {items ? (
        <ul className="space-y-1">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2 text-[13px] font-medium leading-relaxed text-ink">
              <span className="text-faint/50 shrink-0 mt-0.5">•</span>
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
  const hex = RISK_HEX[point.riskLevel] || RISK_HEX['重点留证'];

  return (
    <section className="overflow-hidden rounded-[24px] border border-pine/10 bg-card shadow-card fade-up">
      {/* 顶部色条 */}
      <div className="h-1" style={{ background: isChecked ? '#10B981' : hex }} />

      <div className="p-4">
        {/* 头部 */}
        <div className="flex items-center gap-3">
          <span
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${badge}`}
          >
            <AlertTriangle size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-ink truncate">{point.name}</h2>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${badge}`}>
                {point.riskLevel}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-muted">
              {point.riskLevel === '高频争议' ? '还车时最容易被指出问题的部位'
                : point.riskLevel === '容易忽略' ? '取车时容易漏看的细节'
                : '建议重点留证以备不时之需'}
            </p>
          </div>
        </div>

        {/* 内容 */}
        <div className="mt-3.5 grid gap-2.5">
          <InfoBlock icon={Search} label="看什么" items={point.checkPoints} />
          <InfoBlock icon={Camera} label="怎么拍" items={point.photoTips} />
          <InfoBlock icon={ShieldAlert} label="注意点" content={point.warning} tone="coral" />
        </div>

        {/* 已检查按钮 */}
        <div className="mt-3.5">
          <button
            type="button"
            onClick={() => onToggleCheck(point.id)}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-bold transition-all duration-200 active:scale-[0.98] ${
              isChecked
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                : 'bg-aquaCard text-pine hover:bg-mint/60'
            }`}
          >
            {isChecked ? (
              <>
                <Check size={16} />
                已检查
              </>
            ) : (
              '标记已检查'
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
