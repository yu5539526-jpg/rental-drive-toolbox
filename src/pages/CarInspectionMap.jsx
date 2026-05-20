import { Camera, Car, ChevronDown, ChevronRight, ChevronUp, Lightbulb, ShieldCheck, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar.jsx';
import { CarInspectionImageMap, CarViewTabs, HotspotDetailCard } from '../components/CarInspection/index.js';
import { primaryZonesByView } from '../data/vehicleInspectionZones.js';
import { INSURANCE_PLATFORMS } from '../data/insurancePlans.js';
import {
  getPlatformInsurancePlans,
  findInsurancePlan,
  getTierLabel,
  INSURANCE_DISCLAIMER,
} from '../utils/insuranceUtils.js';
import {
  getInsuranceSensitiveZones,
  getEnhancedZonePriority,
  getInsuranceLinkedTips,
} from '../utils/vehicleInspectionUtils.js';

/* ---- 常量 ---- */

const CHECKED_STORAGE_KEY = 'rentalDrive.inspectionCheckedSet';
const INSURANCE_STORAGE_KEY = 'rentalTool:lastInsuranceSelection';
const LEGACY_INSURANCE_KEY = 'rentalDrive.priceComparePlans';

const allPrimaryIds = Object.values(primaryZonesByView).flat().map((z) => z.id);
const primaryCount = allPrimaryIds.length;

const tips = [
  { icon: Car, text: '先绕车录一段完整视频，口播日期和车牌号' },
  { icon: Camera, text: '开闪光灯拍缝隙，自然光看不清的伤闪光灯下很明显' },
];

const ALL_VIEWS = ['front', 'side', 'rear'];

/* ---- helpers ---- */

function loadCheckedSet() {
  try {
    const raw = localStorage.getItem(CHECKED_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * 读取最近保险选择 — 优先新 key，回退旧 key
 * @returns {{ platform: string, planName: string } | null}
 */
function loadLastInsuranceSelection() {
  try {
    // 优先读取统一 key
    const raw = localStorage.getItem(INSURANCE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.platform === 'string' && typeof parsed.planName === 'string') {
        return { platform: parsed.platform, planName: parsed.planName, source: 'direct' };
      }
    }
    // 回退：从比价页 plans 数组读取最后一项
    const legacy = localStorage.getItem(LEGACY_INSURANCE_KEY);
    if (legacy) {
      const plans = JSON.parse(legacy);
      if (Array.isArray(plans) && plans.length) {
        const last = plans[plans.length - 1];
        if (last.platform && last.insurancePlan) {
          return { platform: last.platform, planName: last.insurancePlan, source: 'legacy' };
        }
      }
    }
  } catch { /* ignore */ }
  return null;
}

/** 保存保险选择到统一 key */
function saveInsuranceSelection(platform, planName) {
  try {
    if (platform && planName) {
      localStorage.setItem(INSURANCE_STORAGE_KEY, JSON.stringify({ platform, planName }));
    } else {
      localStorage.removeItem(INSURANCE_STORAGE_KEY);
    }
  } catch { /* ignore */ }
}

function getDefaultSelected(view, insurancePlan) {
  const zones = primaryZonesByView[view] || [];
  if (!zones.length) return null;

  const ranked = zones
    .map((z) => {
      const { level } = getEnhancedZonePriority(z, insurancePlan);
      const weight = level === 'must' ? 3 : level === 'warning' ? 2 : 1;
      return { zone: z, weight };
    })
    .sort((a, b) => b.weight - a.weight);

  return ranked[0].zone;
}

function findNextUncheckedInView(view, checkedSet, insurancePlan) {
  const zones = primaryZonesByView[view] || [];
  const ranked = zones
    .map((z) => {
      const { level } = getEnhancedZonePriority(z, insurancePlan);
      const weight = level === 'must' ? 3 : level === 'warning' ? 2 : 1;
      return { zone: z, weight };
    })
    .sort((a, b) => b.weight - a.weight);

  return ranked.find((r) => !checkedSet[r.zone.id])?.zone || null;
}

function isViewAllChecked(view, checkedSet) {
  const zones = primaryZonesByView[view] || [];
  return zones.length > 0 && zones.every((z) => checkedSet[z.id]);
}

/* ---- 页面 ---- */

export default function CarInspectionMap() {
  // ── 保险选择 — 从统一 key 初始化 ──
  const savedSelection = useMemo(() => loadLastInsuranceSelection(), []);

  const [insurancePlatform, setInsurancePlatform] = useState(
    () => savedSelection?.platform || '',
  );
  const [insurancePlanName, setInsurancePlanName] = useState(
    () => savedSelection?.planName || '',
  );
  const [insurancePanelOpen, setInsurancePanelOpen] = useState(false);
  const [wasLoadedFromStorage] = useState(() => !!savedSelection);

  const insurancePlan = useMemo(() => {
    if (!insurancePlatform || !insurancePlanName) return null;
    return findInsurancePlan(insurancePlatform, insurancePlanName);
  }, [insurancePlatform, insurancePlanName]);

  const platformPlans = useMemo(
    () => (insurancePlatform ? getPlatformInsurancePlans(insurancePlatform) : null),
    [insurancePlatform],
  );

  const highlightedZoneIds = useMemo(() => {
    if (!insurancePlan) return new Set();
    const sensitive = getInsuranceSensitiveZones(insurancePlan, { primaryOnly: true });
    return new Set(sensitive.map((z) => z.id));
  }, [insurancePlan]);

  // ── 视角 & 选中 ──
  const [view, setView] = useState('side');
  const [selected, setSelected] = useState(() => {
    const plan = savedSelection?.platform && savedSelection?.planName
      ? findInsurancePlan(savedSelection.platform, savedSelection.planName)
      : null;
    return getDefaultSelected('side', plan);
  });

  // ── 已检查状态 ──
  const [checkedSet, setCheckedSet] = useState(loadCheckedSet);

  useEffect(() => {
    localStorage.setItem(CHECKED_STORAGE_KEY, JSON.stringify(checkedSet));
  }, [checkedSet]);

  // ── 计算 ──
  const checkedCount = Object.keys(checkedSet).length;
  const progressPct = Math.round((checkedCount / primaryCount) * 100);
  const viewComplete = isViewAllChecked(view, checkedSet);

  // ── 切换视角 ──
  const switchView = useCallback(
    (nextView) => {
      setView(nextView);
      const nextUnchecked = findNextUncheckedInView(nextView, checkedSet, insurancePlan);
      if (nextUnchecked) {
        setSelected(nextUnchecked);
      } else {
        const zones = primaryZonesByView[nextView] || [];
        if (zones.length) setSelected(zones[0]);
      }
    },
    [checkedSet, insurancePlan],
  );

  // ── 标记已检查 + 自动跳转 ──
  const toggleCheck = useCallback(
    (id) => {
      const willBeChecked = !checkedSet[id];

      setCheckedSet((prev) => {
        const next = { ...prev };
        if (next[id]) delete next[id];
        else next[id] = true;
        return next;
      });

      if (willBeChecked) {
        const futureChecked = { ...checkedSet, [id]: true };
        const next = findNextUncheckedInView(view, futureChecked, insurancePlan);
        if (next) setSelected(next);
      }
    },
    [checkedSet, view, insurancePlan],
  );

  // ── 保险选择处理 ──
  const handleSelectPlatform = (name) => {
    if (name === insurancePlatform) {
      setInsurancePlatform('');
      setInsurancePlanName('');
      saveInsuranceSelection('', '');
    } else {
      setInsurancePlatform(name);
      setInsurancePlanName('');
    }
  };

  const handleSelectPlan = (name) => {
    const newPlanName = name === insurancePlanName ? '' : name;
    setInsurancePlanName(newPlanName);
    if (newPlanName && insurancePlatform) {
      saveInsuranceSelection(insurancePlatform, newPlanName);
    } else {
      saveInsuranceSelection('', '');
    }
  };

  // 当前保险关联提示
  const currentInsuranceTip = useMemo(
    () => (selected ? getInsuranceLinkedTips(selected, insurancePlan) : null),
    [selected, insurancePlan],
  );

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
              <h1 className="text-lg font-bold leading-tight text-ink">车身验车避坑图</h1>
              <p className="mt-1 text-[13px] font-medium leading-relaxed text-muted">
                点选车身重点部位，查看拍摄建议并逐项标记。
              </p>
            </div>
          </div>
        </section>

        {/* 进度条 */}
        <div className="mt-3 rounded-[20px] bg-card border border-pine/10 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] font-bold text-ink">
              已检查{' '}
              <span className="text-pine text-base">{checkedCount}</span>
              <span className="text-faint"> / {primaryCount}</span> 个重点部位
            </span>
            <span className="text-[12px] font-bold text-muted tabular-nums">
              {checkedCount === 0
                ? '点击圆点开始'
                : checkedCount === primaryCount
                  ? '全部完成 ✓'
                  : `${progressPct}%`}
            </span>
          </div>
          <div className="mt-2.5 h-[6px] overflow-hidden rounded-full bg-aquaCard">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPct}%`,
                background:
                  progressPct === 100
                    ? 'linear-gradient(90deg, #10B981, #34D399)'
                    : 'linear-gradient(90deg, #174B63, #1E6B8A)',
              }}
            />
          </div>

          {/* 保险联动状态指示 */}
          {insurancePlan && (
            <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-bold text-amberDark">
              <ShieldCheck size={12} />
              <span>
                已根据 {insurancePlan.platform}「{insurancePlan.name}」突出重点部位
              </span>
            </div>
          )}
        </div>

        {/* ── 按保险方案突出重点 ── */}
        <div className="mt-3 rounded-[20px] bg-card border border-pine/10 p-4 shadow-sm">
          <button
            type="button"
            onClick={() => setInsurancePanelOpen((v) => !v)}
            className="flex w-full items-center gap-3 text-left"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-mint text-pine">
              <ShieldCheck size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink">按保险方案突出重点</p>
              <p className="text-[11px] text-muted">
                {insurancePlan
                  ? `${insurancePlan.platform} · ${insurancePlan.name}（${getTierLabel(insurancePlan)}）`
                  : wasLoadedFromStorage
                    ? '已读取你最近选择的保险方案，可手动切换'
                    : '选择保险方案后，系统会自动突出更需要重点拍摄的部位。'}
              </p>
            </div>
            {insurancePanelOpen ? (
              <ChevronUp size={16} className="shrink-0 text-muted" />
            ) : (
              <ChevronDown size={16} className="shrink-0 text-muted" />
            )}
          </button>

          {insurancePanelOpen && (
            <div className="mt-3 border-t border-pine/8 pt-3">
              <p className="text-[11px] font-medium leading-relaxed text-muted mb-3">
                不同保障方案下，轮胎、车损自付、停运费等风险不同，系统会自动提示更该重点拍的位置。
              </p>

              {/* 平台选择 */}
              <p className="text-[10px] font-bold text-faint mb-1.5">选择平台</p>
              <div className="flex flex-wrap gap-1.5">
                {INSURANCE_PLATFORMS.map((p) => {
                  const active = insurancePlatform === p.name;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPlatform(p.name)}
                      className={`min-h-7 rounded-full px-2.5 py-1 text-[11px] font-bold leading-tight transition active:scale-[0.97] ${
                        active
                          ? 'bg-pine text-lightText shadow-sm shadow-pine/15'
                          : 'bg-aquaCard text-pine ring-1 ring-pine/10 hover:bg-mint/60'
                      }`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>

              {/* 方案选择 */}
              {platformPlans && (
                <div className="mt-2.5">
                  <p className="text-[10px] font-bold text-faint mb-1.5">{insurancePlatform} 保险方案</p>
                  <div className="flex flex-wrap gap-1.5">
                    {platformPlans.plans.map((plan) => {
                      const active = insurancePlanName === plan.name;
                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => handleSelectPlan(plan.name)}
                          className={`min-h-7 rounded-full px-2.5 py-1 text-[11px] font-bold leading-tight transition active:scale-[0.97] ${
                            active
                              ? 'bg-pine text-lightText shadow-sm shadow-pine/15'
                              : 'bg-card text-ink ring-1 ring-pine/10 hover:bg-mint/60'
                          }`}
                        >
                          {plan.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 联动结果提示 */}
              {insurancePlan && highlightedZoneIds.size > 0 && (
                <div className="mt-2.5 rounded-xl bg-amberSoft/30 px-3 py-2">
                  <p className="text-[11px] font-bold text-amberDark">
                    已标记 {highlightedZoneIds.size} 个保险重点部位
                  </p>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-muted">
                    车身图上带暖色外圈的圆点为当前方案下建议重点关注的部位。
                  </p>
                </div>
              )}

              {insurancePlan && highlightedZoneIds.size === 0 && (
                <div className="mt-2.5 rounded-xl bg-mint/50 px-3 py-2">
                  <p className="text-[11px] font-bold text-pine">当前方案覆盖较全面</p>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-muted">
                    仍建议按常规流程完整验车留证。高保障能降低部分意外支出，但不代表可以省略验车。
                  </p>
                </div>
              )}

              {!insurancePlatform && (
                <div className="mt-2.5 rounded-xl bg-aquaCard/60 px-3 py-2">
                  <p className="text-[11px] font-medium leading-relaxed text-muted">
                    选择保险方案后，系统会自动突出更需要重点拍摄的部位。
                  </p>
                </div>
              )}

              <p className="mt-2.5 text-[9px] text-muted/60 leading-relaxed">
                保险权益和免责条件会随城市、车型、供应商和订单页面变化，最终以下单页、合同和保障说明为准。
              </p>
            </div>
          )}
        </div>

        {/* 视图切换 Tab */}
        <div className="mt-3">
          <CarViewTabs view={view} onChange={switchView} />
        </div>

        {/* 车身图 + 标记点 */}
        <div className="mt-3">
          <CarInspectionImageMap
            view={view}
            selected={selected}
            checkedSet={checkedSet}
            onSelect={setSelected}
            highlightedZoneIds={highlightedZoneIds}
          />
        </div>

        {/* 详情卡片 */}
        <div className="mt-3">
          <HotspotDetailCard
            point={selected}
            isChecked={!!checkedSet[selected?.id]}
            onToggleCheck={toggleCheck}
            insuranceTip={currentInsuranceTip}
            allCheckedInView={viewComplete}
            otherViews={ALL_VIEWS}
            onSwitchView={switchView}
          />
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
        <div className="mt-3 mb-4 rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mint text-pine">
              <Sparkles size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink">需要逐项打钩核对？</p>
              <p className="mt-0.5 text-[12px] text-muted leading-relaxed">
                互动图适合快速定位，打钩核对可用完整版清单。
              </p>
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
