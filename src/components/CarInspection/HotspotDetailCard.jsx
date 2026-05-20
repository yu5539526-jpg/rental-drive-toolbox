import { Camera, Check, ChevronRight, Search, ShieldAlert, ShieldCheck, Zap } from 'lucide-react';

/* ---- 兼容新旧数据格式 ---- */

function resolveName(point) {
  return point?.label || point?.name || '';
}

function resolveCheckPoints(point) {
  return point?.whatToCheck || point?.checkPoints || [];
}

function resolvePhotoTips(point) {
  return point?.howToShoot || point?.photoTips || [];
}

function resolveNote(point) {
  return point?.note || point?.warning || '';
}

/**
 * 根据 baseTags + insuranceTip 生成最终展示标签
 * 顺序：必拍 > 保险重点 > 易争议 > 易遗漏
 */
function resolveTags(point, insuranceTip) {
  const tags = [];
  const baseTags = point?.baseTags || [];

  if (baseTags.includes('必拍')) {
    tags.push({ key: 'must', label: '必拍', color: '#E28880', bg: 'rgba(226,136,128,0.08)' });
  }
  if (insuranceTip?.severity === 'strong' || insuranceTip?.severity === 'medium') {
    tags.push({ key: 'insurance', label: '保险重点', color: '#D97706', bg: 'rgba(217,119,6,0.08)' });
  }
  if (baseTags.includes('易争议')) {
    tags.push({ key: 'dispute', label: '易争议', color: '#CD9F4C', bg: 'rgba(205,159,76,0.08)' });
  }
  if (baseTags.includes('易遗漏')) {
    tags.push({ key: 'overlook', label: '易遗漏', color: '#7B8FA0', bg: 'rgba(123,143,160,0.06)' });
  }
  // 确保至少有一个标签
  if (tags.length === 0) {
    tags.push({ key: 'default', label: '建议留证', color: '#4B8493', bg: 'rgba(75,132,147,0.06)' });
  }
  return tags;
}

/* ---- 子组件 ---- */

/** 看什么 / 怎么拍 — 要点列表 */
function InfoBlock({ icon: Icon, label, items, accentColor }) {
  return (
    <div
      className="rounded-[16px] px-3.5 py-3"
      style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}12` }}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon size={13} style={{ color: accentColor }} />
        <p className="text-[11px] font-bold" style={{ color: accentColor }}>{label}</p>
      </div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-[13px] font-medium leading-relaxed text-ink">
            <span className="text-faint/40 shrink-0 mt-0.5">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 注意点 — 单段文字 */
function NoteBlock({ content, accentColor }) {
  return (
    <div
      className="rounded-[16px] px-3.5 py-3"
      style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}12` }}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <ShieldAlert size={13} style={{ color: accentColor }} />
        <p className="text-[11px] font-bold" style={{ color: accentColor }}>注意点</p>
      </div>
      <p className="text-[13px] font-medium leading-relaxed text-ink">{content}</p>
    </div>
  );
}

/** 保险提醒 — 工具函数返回的提示 */
function InsuranceBlock({ tip }) {
  if (!tip) return null;

  const isStrong = tip.severity === 'strong';
  const isMedium = tip.severity === 'medium';

  const bg = isStrong ? 'rgba(217,119,6,0.08)' : isMedium ? 'rgba(217,119,6,0.05)' : 'rgba(75,132,147,0.05)';
  const border = isStrong ? 'rgba(217,119,6,0.18)' : isMedium ? 'rgba(217,119,6,0.12)' : 'rgba(75,132,147,0.12)';
  const accent = isStrong || isMedium ? '#B45309' : '#4B8493';

  return (
    <div className="rounded-[16px] px-3.5 py-3" style={{ background: bg, border: `1px solid ${border}` }}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <ShieldCheck size={13} style={{ color: accent }} />
        <p className="text-[11px] font-bold" style={{ color: accent }}>保险提醒</p>
      </div>
      <p className="text-[12px] font-medium leading-relaxed text-ink">{tip.tip}</p>
    </div>
  );
}

/** 当前视角全部完成 — 切换提示 */
function ViewCompleteHint({ views, currentView, onSwitchView }) {
  const otherViews = views.filter((v) => v !== currentView);
  if (!otherViews.length) return null;

  const labels = { front: '正面', side: '侧面', rear: '背面' };

  return (
    <div className="rounded-[16px] bg-mint/50 px-3.5 py-3">
      <p className="text-[12px] font-bold text-pine">当前视角已全部检查</p>
      <p className="mt-0.5 text-[11px] text-muted">切换到其他视角继续：</p>
      <div className="mt-2 flex gap-1.5">
        {otherViews.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onSwitchView(v)}
            className="inline-flex items-center gap-1 rounded-full bg-pine text-white px-3 py-1.5 text-[11px] font-bold active:scale-[0.97] transition"
          >
            {labels[v]}
            <ChevronRight size={12} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---- 详情卡片 ---- */

const ACCENT_MAP = {
  必拍: '#E28880',
  易争议: '#CD9F4C',
  易遗漏: '#7B8FA0',
  保险重点: '#D97706',
  建议留证: '#4B8493',
};

export default function HotspotDetailCard({
  point,
  isChecked,
  onToggleCheck,
  insuranceTip,
  allCheckedInView,
  otherViews,
  onSwitchView,
}) {
  if (!point) return null;

  const name = resolveName(point);
  const checkPoints = resolveCheckPoints(point);
  const photoTips = resolvePhotoTips(point);
  const note = resolveNote(point);
  const tags = resolveTags(point, insuranceTip);

  // 用第一个标签的颜色作为卡片强调色
  const primaryTag = tags[0];
  const accentColor = ACCENT_MAP[primaryTag.label] || '#4B8493';

  return (
    <section className="overflow-hidden rounded-[24px] border border-pine/10 bg-card shadow-card fade-up">
      {/* 顶部色条 */}
      <div
        className="h-1"
        style={{ background: isChecked ? '#6DAF8B' : `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)` }}
      />

      <div className="p-4">
        {/* ── 头部：部位名称 + 标签 ── */}
        <div className="flex items-start gap-3">
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg"
            style={{ background: `${accentColor}10` }}
            aria-hidden="true"
          >
            🔍
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-ink">{name}</h2>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag.key}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ background: tag.bg, color: tag.color, border: `1px solid ${tag.color}20` }}
                >
                  {tag.key === 'insurance' && <Zap size={10} />}
                  {tag.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── 内容区块 ── */}
        <div className="mt-4 grid gap-2.5">
          <InfoBlock icon={Search} label="看什么" items={checkPoints} accentColor={accentColor} />
          <InfoBlock icon={Camera} label="怎么拍" items={photoTips} accentColor={accentColor} />
          {note ? <NoteBlock content={note} accentColor={accentColor} /> : null}
          {insuranceTip ? <InsuranceBlock tip={insuranceTip} /> : null}
        </div>

        {/* ── 全部完成提示 ── */}
        {allCheckedInView && otherViews?.length > 0 && (
          <div className="mt-3">
            <ViewCompleteHint views={otherViews} currentView="" onSwitchView={onSwitchView} />
          </div>
        )}

        {/* ── 标记已检查按钮 ── */}
        <div className="mt-3.5">
          <button
            type="button"
            onClick={() => onToggleCheck(point.id)}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-3 text-[14px] font-bold transition-all duration-200 active:scale-[0.98] ${
              isChecked
                ? 'bg-[#6DAF8B]/12 text-[#6DAF8B] ring-1 ring-[#6DAF8B]/25'
                : 'bg-pine text-white shadow-md shadow-pine/15 hover:bg-[#1E6B8A]'
            }`}
          >
            {isChecked ? (
              <>
                <Check size={17} />
                已检查
              </>
            ) : (
              '标记已检查'
            )}
          </button>
          {isChecked && (
            <p className="mt-2 text-center text-[11px] text-muted">
              已自动跳至下一个未检查部位
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
