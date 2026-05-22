import { ChevronDown, ChevronUp, Copy, Edit3, Plus, RotateCcw, Send, ShieldAlert, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomActionBar, { BottomActionButton } from '../components/BottomActionBar.jsx';
import TopBar from '../components/TopBar.jsx';
import { formatMoney } from '../utils/budget.js';
import { INSURANCE_PLATFORMS } from '../data/insurancePlans.js';
import {
  getPlatformInsurancePlans,
  findInsurancePlan,
  compareInsurancePlans,
  getChecklistInsuranceTips,
} from '../utils/insuranceUtils.js';

const STORAGE_KEY = 'rentalDrive.priceComparePlans';
const emptyForm = {
  platform: '',
  carModel: '',
  insurancePlan: '',
  totalPrice: '',
};
const inputClass =
  'h-12 w-full rounded-[16px] border border-pine/15 bg-aquaCard/70 px-3.5 text-[15px] font-semibold text-ink outline-none transition placeholder:text-muted/55 focus:border-pine focus:bg-card focus:ring-2 focus:ring-pine/10';
const UNCLEAR_TEXT = '未明确';
const PUBLIC_INSURANCE_DISCLAIMER =
  '保障内容仅供出行前参考，实际以下单页展示的合同、保障说明和保险条款为准。';
const INTERNAL_INSURANCE_NOTE_PATTERNS = [
  /截图/,
  /用户截图/,
  /未显示/,
  /未单独列明/,
  /未明确说明/,
  /未列明/,
  /待复核/,
  /待确认/,
  /以下单页/,
  /以条款为准/,
  /未在官方/,
  /未在媒体/,
  /媒体报道未/,
  /帮助中心未/,
  /无增加/,
];

export default function PriceComparePage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState(loadPlans);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [feedback, setFeedback] = useState('把不同平台、车型和保险方案的含保险总价填进来，就能自动对比。');
  const stats = useMemo(() => buildCompareStats(plans), [plans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  }, [plans]);

  const update = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submitPlan = (event) => {
    event.preventDefault();
    const validation = validatePlan(form, plans.length, editingId);

    if (!validation.ok) {
      setFeedback(validation.message);
      return;
    }

    const normalized = normalizePlan(form);

    if (editingId) {
      setPlans((current) => current.map((plan) => (plan.id === editingId ? { ...plan, ...normalized } : plan)));
      setFeedback('方案已更新，对比结果已重新计算。');
    } else {
      setPlans((current) => [{ id: globalThis.crypto?.randomUUID?.() || String(Date.now()), ...normalized }, ...current]);
      setFeedback('已添加到对比。');
    }

    // 保存最近一次保险选择，供验车页面联动使用
    try {
      localStorage.setItem('rentalTool:lastInsuranceSelection', JSON.stringify({
        platform: normalized.platform,
        planName: normalized.insurancePlan,
      }));
    } catch { /* ignore */ }

    setForm(emptyForm);
    setEditingId('');
  };

  const editPlan = (plan) => {
    setForm({
      platform: plan.platform,
      carModel: plan.carModel,
      insurancePlan: plan.insurancePlan,
      totalPrice: String(plan.totalPrice),
    });
    setEditingId(plan.id);
    setFeedback('正在编辑该方案，修改后点“更新方案”。');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deletePlan = (id) => {
    setPlans((current) => current.filter((plan) => plan.id !== id));
    if (editingId === id) {
      setEditingId('');
      setForm(emptyForm);
    }
    setFeedback('已删除该方案。');
  };

  const clearPlans = () => {
    setPlans([]);
    setForm(emptyForm);
    setEditingId('');
    setFeedback('已清空方案对比，可以重新添加。');
  };

  const copyCompareResult = async () => {
    if (!plans.length) {
      setFeedback('还没有方案可复制，先添加一个租车方案吧。');
      return;
    }
    const ok = await copyText(buildCompareCopyText(stats));
    setFeedback(ok ? '对比结果已复制，可以粘贴到备忘录或聊天里。' : '复制失败，可以稍后再试。');
  };

  const usePlanForBudget = (plan) => {
    navigate('/budget', {
      state: {
        prefillRentalPlatformTotal: plan.totalPrice,
        priceComparePlan: plan,
      },
    });
  };

  const useLowestPlan = () => {
    if (!stats.lowest) {
      setFeedback('还没有最低价方案，先添加租车方案。');
      return;
    }

    usePlanForBudget(stats.lowest);
  };

  return (
    <main className="min-h-screen bg-cream">
      <TopBar title="租车方案对比" />

      <section className="safe-bottom-action px-4 pt-4">
        <form onSubmit={submitPlan} className="mt-4 rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[18px] bg-aquaCard text-pine">
              <Plus size={21} />
            </span>
            <div>
              <h1 className="text-lg font-bold text-ink">{editingId ? '编辑一个租车方案' : '添加一个租车方案'}</h1>
              <p className="mt-0.5 text-xs font-medium leading-relaxed text-muted">只填平台、车型、保险方案和含保险总价。</p>
            </div>
          </div>

          <div className="grid gap-4">
            <Field label="平台">
              <div className="grid grid-cols-3 gap-2">
                {INSURANCE_PLATFORMS.map((p) => {
                  const active = form.platform === p.name;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => update('platform', active ? '' : p.name)}
                      className={`min-h-12 rounded-[16px] px-2 py-2.5 text-center text-sm font-bold leading-tight transition active:scale-[0.97] ${
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
              <p className="mt-1.5 text-[10px] font-medium leading-relaxed text-muted/70">
                点击上方选择平台，下方自动展示该平台真实保险方案
              </p>
            </Field>
            <Field label="车型">
              <input
                value={form.carModel}
                onChange={(event) => update('carModel', event.target.value)}
                className={inputClass}
                placeholder="例如：问界 M9 / 理想 L9 / 坦克 300 / GL8"
              />
            </Field>
            <Field label="保险方案">
              <InsurancePlanSelector
                platformValue={form.platform}
                value={form.insurancePlan}
                onChange={(value) => update('insurancePlan', value)}
              />
              {!form.platform || !getPlatformInsurancePlans(form.platform.trim()) ? (
                <p className="mt-1.5 text-[11px] font-medium leading-relaxed text-muted">
                  请先在上方选择平台，再选择保险方案
                </p>
              ) : null}
            </Field>
            <Field label="租期内租车总价，含保险">
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={form.totalPrice}
                  onChange={(event) => update('totalPrice', event.target.value)}
                  className={`${inputClass} pr-12`}
                  placeholder="例如：5200"
                />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted">元</span>
              </div>
            </Field>
          </div>

          <button
            type="submit"
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-[#174B63] to-[#1E6B8A] px-4 font-bold text-lightText shadow-lg shadow-pine/20"
          >
            <Plus size={18} />
            {editingId ? '更新方案' : '添加到对比'}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={() => {
                setEditingId('');
                setForm(emptyForm);
                setFeedback('已取消编辑。');
              }}
              className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-aquaCard px-4 font-bold text-pine"
            >
              取消编辑
            </button>
          ) : null}
        </form>

        <p className="mt-3 rounded-2xl bg-aquaCard px-3 py-2 text-xs font-bold leading-relaxed text-pine" role="status" aria-live="polite">
          {feedback}
        </p>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={clearPlans}
            disabled={!plans.length}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-card px-4 text-sm font-bold text-pine shadow-sm ring-1 ring-pine/15 disabled:text-muted/50"
          >
            <RotateCcw size={16} />
            清空对比
          </button>
        </div>

        <section className="mt-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-muted">从低到高自动排序</p>
              <h2 className="mt-1 text-lg font-bold text-ink">已添加方案</h2>
            </div>
            <span className="rounded-full bg-card px-3 py-1 text-xs font-bold text-muted shadow-sm ring-1 ring-pine/10">{plans.length}/10</span>
          </div>
          {plans.length ? (
            <div className="grid gap-3">
              {stats.sorted.map((plan) => (
                <PlanCard key={plan.id} plan={plan} stats={stats} onEdit={editPlan} onDelete={deletePlan} onUse={usePlanForBudget} />
              ))}
            </div>
          ) : (
            <EmptyPlanCard />
          )}
        </section>

        <CompareResult stats={stats} />

      </section>

      <BottomActionBar layout="double">
        <BottomActionButton type="button" variant="secondary" onClick={copyCompareResult} disabled={!plans.length}>
          <Copy size={17} />
          复制对比结果
        </BottomActionButton>
        <BottomActionButton type="button" onClick={useLowestPlan} disabled={!stats.lowest}>
          <Send size={17} />
          使用最低价算预算
        </BottomActionButton>
      </BottomActionBar>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <span className="mb-1.5 block text-sm font-bold text-ink">{label}</span>
      {children}
    </div>
  );
}

function InsurancePlanSelector({ platformValue, value, onChange }) {
  const detected = useMemo(() => {
    if (!platformValue || !platformValue.trim()) return null;
    return getPlatformInsurancePlans(platformValue.trim());
  }, [platformValue]);

  if (!detected) return null;

  const { platform, plans } = detected;

  return (
    <div className="mt-2 rounded-2xl bg-aquaCard/60 px-3 py-2.5 ring-1 ring-pine/10">
      <p className="mb-2 text-[11px] font-bold text-muted">
        {platform.name}真实保险方案
      </p>
      <div className="flex flex-wrap gap-1.5">
        {plans.map((plan) => {
          const active = value === plan.name;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onChange(plan.name)}
              className={`min-h-8 rounded-full px-2.5 py-1 text-[11px] font-bold leading-tight transition active:scale-[0.97] ${
                active
                  ? 'bg-pine text-lightText shadow-sm shadow-pine/15'
                  : 'bg-card text-pine ring-1 ring-pine/10 hover:bg-mint/60'
              }`}
            >
              {plan.name}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onChange('其他')}
          className={`min-h-8 rounded-full px-2.5 py-1 text-[11px] font-bold leading-tight transition active:scale-[0.97] ${
            value === '其他'
              ? 'bg-pine text-lightText shadow-sm shadow-pine/15'
              : 'bg-card text-muted ring-1 ring-pine/10 hover:bg-mint/60'
          }`}
        >
          其他
        </button>
      </div>
      <p className="mt-1.5 text-[10px] font-medium leading-relaxed text-muted/70">
        方案名称和保障内容可能随平台调整，实际以下单页为准
      </p>
    </div>
  );
}

function cleanInsuranceText(value, fallback = UNCLEAR_TEXT) {
  if (value === true) return '包含';
  if (value === false) return '不包含';
  if (value === '部分') return '部分包含';
  if (value === null || value === undefined) return fallback;

  const text = String(value).trim();
  if (!text || text === '-' || text === '无' || text === '未知') return fallback;
  if (hasInternalInsuranceNote(text)) return fallback;
  return text;
}

function hasInternalInsuranceNote(value) {
  if (!value) return false;
  const text = String(value);
  return INTERNAL_INSURANCE_NOTE_PATTERNS.some((pattern) => pattern.test(text));
}

function formatCoverageDetail(section) {
  if (hasInternalInsuranceNote(section?.note)) return UNCLEAR_TEXT;
  const note = cleanInsuranceText(section?.note, '');
  if (note) return note;
  return cleanInsuranceText(section?.covered);
}

function formatThirdPartyDetail(plan) {
  const amount = plan?.thirdParty?.amount;
  const unit = plan?.thirdParty?.unit || '';
  const note = cleanInsuranceText(plan?.thirdParty?.note, '');
  const amountText = amount ? `${amount}${unit}` : UNCLEAR_TEXT;
  return note ? `${amountText}（${note}）` : amountText;
}

function formatVehicleDamageSummary(plan) {
  const customerPay = cleanInsuranceText(plan?.vehicleDamage?.customerPay, '');
  if (customerPay) return customerPay.includes('0') ? '0自付' : `自付${customerPay}`;

  const covered = cleanInsuranceText(plan?.vehicleDamage?.covered, '');
  if (covered) return covered.includes('100') || covered.includes('全部') ? '0自付' : covered;

  const summary = cleanInsuranceText(plan?.vehicleDamage?.summary, '');
  if (!summary) return UNCLEAR_TEXT;
  if (summary.includes('客户承担 0') || summary.includes('承租人承担 0') || summary.includes('0 元')) return '0自付';
  return summary.length > 12 ? '见详情' : summary;
}

function formatDriverPassengerDetail(driverPassenger) {
  const note = cleanInsuranceText(driverPassenger?.note, '');
  if (note) return note;

  const driver = cleanInsuranceText(driverPassenger?.driver);
  const passenger = cleanInsuranceText(driverPassenger?.passenger);
  if (driver === UNCLEAR_TEXT && passenger === UNCLEAR_TEXT) return UNCLEAR_TEXT;
  return `司机${driver}，乘客${passenger}`;
}

function formatPassengerSummary(driverPassenger) {
  return cleanInsuranceText(driverPassenger?.passenger);
}

function formatAdvancePaymentDetail(advancePayment) {
  const note = cleanInsuranceText(advancePayment?.note, '');
  if (note) return note;
  if (advancePayment?.required === false) return '无需垫付';
  if (advancePayment?.required === true) return '需垫付';
  return UNCLEAR_TEXT;
}

function formatChassisRoadsideDetail(plan) {
  const details = [];
  const chassis = formatCoverageDetail(plan?.chassis || plan?.undercarriage);
  const roadside = formatCoverageDetail(plan?.roadsideAssistance || plan?.roadsideRescue || plan?.rescue);

  if (chassis !== UNCLEAR_TEXT) details.push(`底盘：${chassis}`);
  if (roadside !== UNCLEAR_TEXT) details.push(`救援：${roadside}`);
  return details.length ? details.join('；') : UNCLEAR_TEXT;
}

function InsuranceSummaryInline({ plan }) {
  const [expanded, setExpanded] = useState(false);
  const summary = useMemo(() => getPlanInsuranceSummary(plan), [plan]);
  const matched = summary.matched;

  if (!matched) {
    return (
      <div className="mt-2 rounded-2xl bg-aquaCard/60 px-3 py-2.5 ring-1 ring-pine/8">
        <p className="text-[11px] font-bold text-muted">保险摘要</p>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {summary.items.map((item) => (
            <InsuranceInfoPill key={item.label} {...item} />
          ))}
        </div>
        <p className="mt-2 text-[10px] font-medium leading-relaxed text-muted/70">
          未收录该保障方案，请以下单页保障说明为准。
        </p>
      </div>
    );
  }

  const tips = getChecklistInsuranceTips(plan.platform, plan.insurancePlan);

  return (
    <div className="mt-2 rounded-2xl bg-aquaCard/60 px-3 py-2.5 ring-1 ring-pine/8">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold text-muted">保险摘要</p>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-pine"
        >
          {expanded ? '收起详情' : '展开详情'}
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-1.5">
        {summary.items.map((item) => (
          <InsuranceInfoPill key={item.label} {...item} />
        ))}
      </div>

      {/* 展开后详情 */}
      {expanded ? (
        <div className="mt-2.5 grid gap-2 border-t border-pine/10 pt-2.5">
          <DetailRow label="车损责任" value={cleanInsuranceText(matched.vehicleDamage?.summary)} />
          <DetailRow label="三者额度" value={formatThirdPartyDetail(matched)} />
          <DetailRow label="轮胎/轮毂" value={formatCoverageDetail(matched.tireWheel)} />
          <DetailRow label="玻璃破损" value={formatCoverageDetail(matched.glass)} />
          <DetailRow label="停运费" value={formatCoverageDetail(matched.downtime)} />
          <DetailRow label="折旧/贬值" value={formatCoverageDetail(matched.depreciation)} />
          <DetailRow label="底盘/救援" value={formatChassisRoadsideDetail(matched)} />
          <DetailRow label="司乘保障" value={formatDriverPassengerDetail(matched.driverPassenger)} />
          {matched.medicalOutsideInsurance?.covered ? (
            <DetailRow label="医保外费用" value={formatCoverageDetail(matched.medicalOutsideInsurance)} />
          ) : null}
          <DetailRow label="费用垫付" value={formatAdvancePaymentDetail(matched.advancePayment)} />

          {matched.keyWarnings?.length ? (
            <div className="rounded-xl bg-amberSoft/35 px-2.5 py-2">
              <p className="text-[11px] font-bold text-amberDark">重点风险提示</p>
              <ul className="mt-1 space-y-0.5">
                {matched.keyWarnings.slice(0, 3).map((w, i) => (
                  <li key={i} className="flex items-start gap-1 text-[11px] leading-relaxed text-ink">
                    <ShieldAlert size={12} className="mt-0.5 shrink-0 text-amberDark" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {tips?.notice ? (
            <div className="rounded-xl bg-mint/50 px-2.5 py-2">
              <p className="text-[11px] font-bold text-pine">验车提醒</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-ink">{tips.notice}</p>
            </div>
          ) : null}

          <p className="text-[10px] font-medium leading-relaxed text-muted/70">
            {PUBLIC_INSURANCE_DISCLAIMER}
          </p>
        </div>
      ) : null}

      {/* 未展开时的关键风险一句话 */}
      {!expanded && matched.keyWarnings?.length ? (
        <p className="mt-1.5 text-[10px] font-medium leading-relaxed text-amberDark/80">
          <ShieldAlert size={10} className="mr-0.5 inline align-middle" />
          {matched.keyWarnings[0]}
        </p>
      ) : null}
    </div>
  );
}

function InsuranceInfoPill({ label, value, weak = false, strong = false }) {
  return (
    <div className={`rounded-xl px-2.5 py-2 ${weak ? 'bg-amberSoft/35 text-amberDark ring-1 ring-warning/15' : strong ? 'bg-mint/55 text-pine ring-1 ring-pine/10' : 'bg-card text-ink ring-1 ring-pine/10'}`}>
      <p className="text-[10px] font-bold text-muted">{label}</p>
      <p className="mt-0.5 text-[11px] font-bold leading-tight">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-2 text-[11px] leading-relaxed">
      <span className="shrink-0 font-bold text-muted">{label}</span>
      <span className="text-right text-ink">{value}</span>
    </div>
  );
}

function PlanCard({ plan, stats, onEdit, onDelete, onUse }) {
  const isLowest = stats.lowest?.id === plan.id;
  const diff = stats.lowest ? plan.totalPrice - stats.lowest.totalPrice : 0;
  const category = getInsuranceCategory(plan);
  const badge = getInsuranceBadgeMeta(category);
  const budgetHint = getBudgetLinkInsuranceHint(category);
  const planTags = stats.insuranceInsights?.tagsById?.[plan.id] || [];

  return (
    <article className={`rounded-[22px] border bg-card p-4 shadow-card ${isLowest ? 'border-pine/25' : 'border-pine/10'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-words text-lg font-bold leading-tight text-ink">{plan.platform}</h3>
            {planTags.map((tag) => (
              <PlanTag key={tag.label} {...tag} />
            ))}
          </div>
          <p className="mt-1 break-words text-sm font-bold leading-relaxed text-ink">{plan.carModel}</p>
          <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${badge.className}`}>
            {badge.label}
          </span>
          <p className="mt-1 text-xs font-medium leading-relaxed text-muted">保险方案：{plan.insurancePlan}</p>
          <InsuranceSummaryInline plan={plan} />
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[11px] font-bold text-muted">含保险总价</p>
          <p className="mt-1 text-xl font-bold text-pine">{formatMoney(plan.totalPrice)}</p>
        </div>
      </div>

      <div className={`mt-3 rounded-2xl px-3 py-2 text-xs font-bold ${isLowest ? 'bg-mint text-pine' : 'bg-amberSoft/45 text-amberDark'}`}>
        {isLowest ? '当前最低价，可作为预算计算参考。' : `比最低价高 ${formatMoney(diff)}`}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onEdit(plan)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-card px-3 text-sm font-bold text-pine ring-1 ring-pine/15"
        >
          <Edit3 size={16} />
          编辑
        </button>
        <button
          type="button"
          onClick={() => onDelete(plan.id)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-coral/10 px-3 text-sm font-bold text-coral"
        >
          <Trash2 size={16} />
          删除
        </button>
      </div>
      <button
        type="button"
        onClick={() => onUse(plan)}
        className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#174B63] to-[#1E6B8A] px-3 text-center text-sm font-bold leading-tight text-lightText shadow-lg shadow-pine/20"
      >
        <Send size={16} />
        使用该方案算预算
      </button>
      <p className={`mt-2 rounded-2xl px-3 py-2 text-xs font-bold leading-relaxed ${budgetHint.className}`}>
        {budgetHint.text}
      </p>
    </article>
  );
}

function EmptyPlanCard() {
  return (
    <article className="rounded-[24px] border border-pine/10 bg-aquaCard p-4 shadow-card">
      <div className="flex items-start gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[20px] bg-card text-xl" aria-hidden="true">
          🚗
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-bold leading-tight text-ink">还没有添加租车方案</h3>
          <p className="mt-1.5 text-sm font-medium leading-relaxed text-muted">
            把你在不同平台看到的车型和含保险总价填进来，就能自动比较最低价、价差和推荐选择。
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-2xl bg-card/80 p-3 ring-1 ring-pine/10">
        <p className="text-xs font-bold text-muted">示例</p>
        <div className="mt-2 grid gap-2 text-sm font-bold leading-relaxed text-ink">
          <ExamplePlanLine text="携程｜问界 M9｜全程无忧｜¥5200" />
          <ExamplePlanLine text="一嗨｜理想 L9｜百万守护｜¥4800" />
        </div>
      </div>

      <p className="mt-3 rounded-2xl bg-amberSoft/45 px-3 py-2 text-xs font-bold leading-relaxed text-amberDark ring-1 ring-warning/20">
        先添加 2 个方案，对比结果会更有参考价值。
      </p>
    </article>
  );
}

function ExamplePlanLine({ text }) {
  return <p className="rounded-2xl bg-aquaCard px-3 py-2 text-sm font-bold leading-relaxed text-ink">{text}</p>;
}

function CompareResult({ stats }) {
  if (stats.count === 0) {
    return (
      <section className="mt-4 rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
        <h2 className="text-lg font-bold text-ink">对比结果</h2>
        <div className="mt-3 rounded-2xl bg-aquaCard px-3 py-3">
          <p className="text-sm font-bold text-pine">添加方案后，这里会显示最低价、最高价、价差和推荐选择。</p>
          <p className="mt-1 text-xs font-medium leading-relaxed text-muted">先从上方录入 2 个方案，对比会更清楚。</p>
        </div>
      </section>
    );
  }

  if (stats.count === 1) {
    return (
      <section className="mt-4 rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
        <h2 className="text-lg font-bold text-ink">对比结果</h2>
        <div className="mt-3 rounded-2xl bg-aquaCard px-3 py-3">
          <p className="text-sm font-bold text-pine">已添加 1 个方案</p>
          <p className="mt-1 text-sm font-medium leading-relaxed text-muted">
            继续添加其他平台或车型后，可以看到最低价、最高价和价差。
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-4 grid gap-4">
      <InsuranceOverviewCard insights={stats.insuranceInsights} />
      <InsuranceCompareTips data={stats.insuranceCompare} />
    </section>
  );
}

function PlanTag({ label, tone = 'neutral' }) {
  const toneClass =
    tone === 'money'
      ? 'bg-mint text-pine'
      : tone === 'coverage'
        ? 'bg-amberSoft/45 text-amberDark ring-1 ring-warning/20'
        : tone === 'warning'
          ? 'bg-coral/10 text-coral'
          : 'bg-aquaCard text-muted';

  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${toneClass}`}>{label}</span>;
}

function InsuranceOverviewCard({ insights }) {
  if (!insights || !insights.shouldShow) return null;

  return (
    <section className="rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
      <div className="flex items-center gap-2">
        <ShieldAlert size={18} className="text-amberDark" />
        <h2 className="text-lg font-bold text-ink">保险差异提醒</h2>
      </div>
      <div className="mt-3 grid gap-2">
        {insights.messages.map((message) => (
          <p key={message} className="rounded-2xl bg-aquaCard/60 px-3 py-2.5 text-sm font-medium leading-relaxed text-ink">
            {message}
          </p>
        ))}
      </div>
      <p className="mt-3 text-[10px] font-medium leading-relaxed text-muted/70">
        这里只做轻量提醒，最终以平台下单页、合同和保障说明为准。
      </p>
    </section>
  );
}

function InsuranceCompareTips({ data }) {
  if (!data) return null;

  // 未就绪：显示不可对比的原因
  if (!data.ready) {
    if (!data.hint) return null;
    return (
      <section className="rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
        <div className="flex items-center gap-2">
          <ShieldAlert size={18} className="text-amberDark" />
          <h2 className="text-lg font-bold text-ink">保障差异对比</h2>
        </div>
        <p className="mt-3 rounded-2xl bg-aquaCard/60 px-3 py-3 text-sm font-medium leading-relaxed text-muted">
          {data.hint}
        </p>
        {data.partialMatch ? (
          <p className="mt-2 rounded-2xl bg-mint/50 px-3 py-2 text-xs font-medium leading-relaxed text-pine">
            已有 1 个方案的保障被收录。再添加 1 个可识别的方案后，就能看到保障差异。
          </p>
        ) : null}
      </section>
    );
  }

  const { result, highlights, advice } = data;

  return (
    <section className="rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
      <div className="flex items-center gap-2">
        <ShieldAlert size={18} className="text-amberDark" />
        <h2 className="text-lg font-bold text-ink">保障细节对比</h2>
      </div>

      {/* 对比双方 */}
      <div className="mt-3 flex items-center gap-2 rounded-2xl bg-aquaCard/60 px-3 py-2.5">
        <span className="text-xs font-bold text-muted">对比</span>
        <span className="text-sm font-bold text-ink">
          {result.planA.platform}「{result.planA.name}」
        </span>
        <span className="text-[10px] font-bold text-muted">vs</span>
        <span className="text-sm font-bold text-ink">
          {result.planB.platform}「{result.planB.name}」
        </span>
      </div>

      {/* 保障高亮差异 */}
      {highlights.length > 0 ? (
        <div className="mt-3 grid gap-1.5">
          {highlights.map((text, i) => (
            <div key={i} className="flex items-start gap-2 rounded-xl bg-amberSoft/25 px-3 py-2.5">
              <span className="mt-0.5 shrink-0 text-xs" aria-hidden="true">
                {i === 0 ? '⚡' : '•'}
              </span>
              <p className="text-xs font-medium leading-relaxed text-ink">{text}</p>
            </div>
          ))}
        </div>
      ) : null}

      {/* 维度速览表 */}
      <div className="mt-3 rounded-2xl bg-aquaCard/40 px-3 py-2.5">
        <p className="mb-2 text-[11px] font-bold text-muted">关键维度速览</p>
        <div className="grid gap-1.5">
          {result.dimensions
            .filter((d) => d.important)
            .map((dim) => (
              <div key={dim.label} className="flex items-center justify-between gap-2 text-[11px] leading-relaxed">
                <span className="shrink-0 font-bold text-muted">{dim.label}</span>
                <span className="text-right">
                  <span className={dim.difference === 'A更优' ? 'text-pine font-bold' : 'text-ink'}>
                    {dim.valueA}
                  </span>
                  <span className="mx-1 text-muted/50">|</span>
                  <span className={dim.difference === 'B更优' ? 'text-pine font-bold' : 'text-ink'}>
                    {dim.valueB}
                  </span>
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* 我的建议 */}
      {advice ? (
        <div className="mt-3 rounded-2xl bg-gradient-to-r from-mint/70 to-mint/30 px-3 py-3 ring-1 ring-pine/10">
          <p className="text-[11px] font-bold text-pine">我的建议</p>
          <p className="mt-1 text-sm font-medium leading-relaxed text-ink">{advice.text}</p>
          {advice.note ? (
            <p className="mt-1.5 text-xs font-medium leading-relaxed text-muted">{advice.note}</p>
          ) : null}
        </div>
      ) : null}

      {/* 通用风险提醒 */}
      {result.commonWarnings && result.commonWarnings.length > 0 ? (
        <div className="mt-2.5 rounded-xl bg-coral/5 px-2.5 py-2">
          <p className="text-[10px] font-bold text-coral">两个方案共同风险</p>
          <p className="mt-0.5 text-[10px] leading-relaxed text-muted">
            {result.commonWarnings.slice(0, 2).join('；')}
          </p>
        </div>
      ) : null}

      <p className="mt-3 text-[10px] font-medium leading-relaxed text-muted/70">
        保障权益会随城市、车型、供应商、渠道和下单页版本变化，最终以下单页、合同和保障说明为准。
      </p>
    </section>
  );
}

function validatePlan(form, count, editingId) {
  const hasEmpty = !form.platform.trim() || !form.carModel.trim() || !form.insurancePlan.trim() || !String(form.totalPrice).trim();
  const totalPrice = Number(form.totalPrice);

  if (hasEmpty) {
    return { ok: false, message: '请把平台、车型、保险方案和租车总价都填完整。' };
  }

  if (!Number.isFinite(totalPrice) || totalPrice <= 0) {
    return { ok: false, message: '租车总价需要填写大于 0 的数字。' };
  }

  if (!editingId && count >= 10) {
    return { ok: false, message: '当前最多支持 10 个方案，先删除一个再添加。' };
  }

  return { ok: true };
}

function normalizePlan(form) {
  return {
    platform: form.platform.trim(),
    carModel: form.carModel.trim(),
    insurancePlan: form.insurancePlan.trim(),
    totalPrice: Math.round(Number(form.totalPrice)),
  };
}

function getPlanInsuranceSummary(plan) {
  const matched = plan?.platform && plan?.insurancePlan ? findInsurancePlan(plan.platform, plan.insurancePlan) : null;

  if (!matched) {
    const items = [
      { label: '车损', value: '未明确' },
      { label: '三者保障', value: '未明确' },
      { label: '停运费', value: '未明确' },
      { label: '乘客保障', value: '未明确' },
    ];

    return {
      matched: null,
      score: 0,
      items,
      itemMap: Object.fromEntries(items.map((item) => [item.label, item.value])),
    };
  }

  const passengerSummary = formatPassengerSummary(matched.driverPassenger);
  const items = [
    { label: '车损', value: formatVehicleDamageSummary(matched), strong: matched.vehicleDamage?.customerPay?.includes('0') },
    { label: '三者保障', value: formatThirdPartyUser(matched), strong: Number(matched.thirdParty?.amount) >= 100 },
    { label: '停运费', value: formatCoveredUser(matched.downtime?.covered, matched.downtime?.note), weak: matched.downtime?.covered === false && !hasInternalInsuranceNote(matched.downtime?.note), strong: matched.downtime?.covered === true && !hasInternalInsuranceNote(matched.downtime?.note) },
    { label: '乘客保障', value: passengerSummary, weak: passengerSummary === UNCLEAR_TEXT },
  ];

  return {
    matched,
    score: getInsuranceCoverageScore(matched),
    items,
    itemMap: Object.fromEntries(items.map((item) => [item.label, item.value])),
  };
}

function buildInsuranceInsights(sorted) {
  if (sorted.length < 2) {
    return { shouldShow: false, tagsById: {}, messages: [] };
  }

  const planSummaries = sorted.map((plan) => ({
    plan,
    summary: getPlanInsuranceSummary(plan),
  }));
  const matchedSummaries = planSummaries.filter((item) => item.summary.matched);
  const lowest = sorted[0];
  const tagsById = Object.fromEntries(sorted.map((plan) => [plan.id, []]));
  const messages = [];

  if (lowest) {
    tagsById[lowest.id].push({ label: '最省钱', tone: 'money' });
    messages.push(`${formatPlanName(lowest)} 当前总价最低，预算优先可以先看这个。`);
  }

  if (matchedSummaries.length) {
    const maxScore = Math.max(...matchedSummaries.map((item) => item.summary.score));
    const minScore = Math.min(...matchedSummaries.map((item) => item.summary.score));
    const bestCoverageItems = matchedSummaries.filter((item) => item.summary.score === maxScore && maxScore - minScore >= 2);
    const bestCoverage = bestCoverageItems[0] || null;
    const lowestSummary = planSummaries.find((item) => item.plan.id === lowest?.id);
    const lowestIsWeak = lowestSummary?.summary.matched && maxScore - lowestSummary.summary.score >= 2;

    bestCoverageItems.forEach((item) => {
      tagsById[item.plan.id].push({ label: '保障更全', tone: 'coverage' });
    });

    if (lowestIsWeak) {
      tagsById[lowest.id].push({ label: '低价但保障弱', tone: 'warning' });
    }

    if (bestCoverage) {
      messages.push(`${formatPlanName(bestCoverage.plan)} 收录到的保障项更多，想省心可以重点看。`);
    } else {
      messages.push('几个方案保障差异不算明显，重点看免赔、三者险和轮胎/玻璃就够。');
    }

    if (lowestIsWeak) {
      messages.push('低价方案记得确认轮胎、玻璃和免赔规则，别只看总价。');
    }
  } else {
    messages.push('这些保险方案暂时没匹配到数据，建议手动看下单页的轮胎、玻璃、免赔和三者险。');
  }

  return {
    shouldShow: true,
    tagsById,
    messages: messages.slice(0, 3),
  };
}

function buildCompareStats(plans) {
  const sorted = [...plans].sort((a, b) => a.totalPrice - b.totalPrice);
  const count = plans.length;
  const lowest = sorted[0] || null;
  const highest = sorted[sorted.length - 1] || null;
  const diff = lowest && highest ? highest.totalPrice - lowest.totalPrice : 0;
  const average = count ? Math.round(plans.reduce((total, plan) => total + plan.totalPrice, 0) / count) : 0;
  const modelCounts = plans.reduce((map, plan) => {
    const key = plan.carModel.trim().toLowerCase();
    map.set(key, (map.get(key) || 0) + 1);
    return map;
  }, new Map());
  const hasSameModel = [...modelCounts.values()].some((value) => value > 1);
  const hasInsuranceGap = hasMeaningfulInsuranceGap(plans);
  const hasLargePriceGap = diff > 1000;
  const premiumPriceHint = getPremiumPriceHint(sorted, lowest);
  const lowestBasicHint =
    lowest && getInsuranceCategory(lowest) === 'basic'
      ? '最低价方案为基础保障，适合预算敏感、路线简单、驾驶经验较丰富，并愿意认真留证的用户。'
      : '';
  const insuranceInsights = buildInsuranceInsights(sorted);

  // 保障差异对比数据
  const insuranceCompare = buildInsuranceCompareData(sorted);

  return {
    count,
    sorted,
    lowest,
    highest,
    diff,
    average,
    summary:
      count >= 2
        ? `本次共对比 ${count} 个租车方案。价格最低的是【${lowest.platform} - ${lowest.carModel} - ${lowest.insurancePlan}】，含保险总价为 ${formatMoney(
            lowest.totalPrice,
          )}。最高价与最低价相差 ${formatMoney(
            diff,
          )}。如果车型级别和保险保障接近，可以优先考虑低价方案；如果高价方案保险更完整或车型更适合长途，也建议结合路线和用车需求选择。`
        : '',
    sameModelHint: hasSameModel ? '你添加了多个相同车型方案，可以重点比较不同平台的保险方案和含保险总价。' : '',
    insuranceHint: hasInsuranceGap ? '不同方案的保险保障不同，不建议只看总价。长途、山路、新手或多人出行场景下，高保障方案可能更省心。' : '',
    premiumPriceHint,
    lowestBasicHint,
    priceGapHint: hasLargePriceGap ? '本次方案价差较大，建议确认车型级别、保险范围和租车天数是否一致。' : '',
    insuranceInsights,
    insuranceCompare,
  };
}

/** 从已排序的方案列表中构建保险对比数据 */
function buildInsuranceCompareData(sorted) {
  if (sorted.length < 2) return null;

  // 为每个方案尝试匹配保险数据
  const matched = sorted
    .map((plan) => ({
      plan,
      insurance: findInsurancePlan(plan.platform, plan.insurancePlan),
    }))
    .filter((m) => m.insurance !== null);

  if (matched.length < 2) {
    const hasAnyMatch = matched.length === 1;
    const totalWithInsurance = sorted.filter(
      (p) => p.insurancePlan && p.insurancePlan.trim() && p.insurancePlan !== '其他',
    ).length;

    return {
      ready: false,
      partialMatch: hasAnyMatch,
      unmatchedCount: sorted.length - matched.length,
      hint:
        totalWithInsurance >= 2
          ? '部分方案的保障名称未收录，暂无法完整对比保障差异，请以下单页保障说明为准。'
          : null,
    };
  }

  // 选择对比对：优先选保障层级差异最大的一对
  let pair = pickBestComparisonPair(matched);

  const result = compareInsurancePlans(pair.a.insurance, pair.b.insurance);

  // 生成面向用户的对比文案
  const highlights = buildCoverageHighlights(result);
  const advice = buildInsuranceAdvice(result, pair.a.plan, pair.b.plan);

  return {
    ready: true,
    result,
    pairA: pair.a,
    pairB: pair.b,
    highlights,
    advice,
  };
}

/** 从已匹配的方案中选出最有对比价值的一对 */
function pickBestComparisonPair(matched) {
  // 优先：基础 vs 高保障
  const basicPlan = matched.find((m) => m.insurance.tier === 'basic');
  const premiumPlan = matched.find((m) => m.insurance.tier === 'premium');
  if (basicPlan && premiumPlan) return { a: basicPlan, b: premiumPlan };

  // 其次：不同平台的最低方案
  const byPlatform = new Map();
  matched.forEach((m) => {
    if (!byPlatform.has(m.insurance.platformId)) {
      byPlatform.set(m.insurance.platformId, m);
    }
  });
  const platforms = [...byPlatform.values()];
  if (platforms.length >= 2) return { a: platforms[0], b: platforms[1] };

  // 兜底：前两个
  return { a: matched[0], b: matched[1] };
}

/** 生成面向用户的高亮对比文案（每条约 1-2 行，适合手机阅读） */
function buildCoverageHighlights(compareResult) {
  if (!compareResult || !compareResult.valid) return [];

  const highlights = [];
  const dims = compareResult.dimensions;
  const planAName = `「${compareResult.planA.name}」`;
  const planBName = `「${compareResult.planB.name}」`;

  // 车损自付差异
  const vd = dims.find((d) => d.icon === 'vehicleDamage');
  if (vd && vd.difference !== '相同') {
    const a0 = vd.valueA.includes('0 元') || vd.valueA.includes('0元');
    const b0 = vd.valueB.includes('0 元') || vd.valueB.includes('0元');
    if (a0 && !b0) {
      highlights.push(`${planAName}车损 0 自付，${planBName}有 ${vd.valueB} 自付。如路线复杂或新手驾驶，0 自付更省心。`);
    } else if (b0 && !a0) {
      highlights.push(`${planBName}车损 0 自付，${planAName}有 ${vd.valueA} 自付。如路线复杂或新手驾驶，0 自付更省心。`);
    } else {
      highlights.push(`车损自付不同：${planAName}${vd.valueA}，${planBName}${vd.valueB}。`);
    }
  } else if (vd && vd.valueA.includes('1500') && vd.valueB.includes('1500')) {
    highlights.push('两个方案都存在 1500 元以内车损自付，取车时小划痕也建议拍清楚。');
  }

  // 三者额度差异
  const tp = dims.find((d) => d.icon === 'thirdParty');
  if (tp && tp.difference !== '相同' && tp.difference !== '信息不全') {
    const amountA = parseInt(tp.valueA, 10) || 0;
    const amountB = parseInt(tp.valueB, 10) || 0;
    if (amountA && amountB) {
      const diff = Math.abs(amountA - amountB);
      const higher = amountA > amountB ? planAName : planBName;
      highlights.push(`${higher}三者额度高出 ${diff} 万（${tp.valueA} vs ${tp.valueB}）。长途或高速较多的路线三者额度值得关注。`);
    }
  }

  // 轮胎/轮毂差异
  const tw = dims.find((d) => d.icon === 'tireWheel');
  if (tw && tw.difference !== '相同') {
    const aCover = tw.valueA.includes('覆盖') && !tw.valueA.includes('不覆盖');
    const bCover = tw.valueB.includes('覆盖') && !tw.valueB.includes('不覆盖');
    const aNoCover = tw.valueA.includes('不覆盖');
    const bNoCover = tw.valueB.includes('不覆盖');
    if (aCover && bNoCover) {
      highlights.push(`${planBName}不覆盖轮胎/轮毂单独损失，${planAName}覆盖。如有山路或非铺装路面，轮胎保障值得关注。`);
    } else if (bCover && aNoCover) {
      highlights.push(`${planAName}不覆盖轮胎/轮毂单独损失，${planBName}覆盖。如有山路或非铺装路面，轮胎保障值得关注。`);
    }
  }

  // 停运费差异
  const dt = dims.find((d) => d.icon === 'downtime');
  if (dt && dt.difference !== '相同') {
    const aCover = dt.valueA.includes('覆盖') && !dt.valueA.includes('不覆盖');
    const bCover = dt.valueB.includes('覆盖') && !dt.valueB.includes('不覆盖');
    const aNoCover = dt.valueA.includes('不覆盖');
    const bNoCover = dt.valueB.includes('不覆盖');
    if (aCover && bNoCover) {
      highlights.push(`${planAName}覆盖停运费，${planBName}不覆盖。万一修车期间仍需付租金，长途环线建议关注。`);
    } else if (bCover && aNoCover) {
      highlights.push(`${planBName}覆盖停运费，${planAName}不覆盖。万一修车期间仍需付租金，长途环线建议关注。`);
    }
  }

  // 折旧/贬值差异
  const dp = dims.find((d) => d.icon === 'depreciation');
  if (dp && dp.difference !== '相同') {
    const aCover = dp.valueA.includes('覆盖') && !dp.valueA.includes('不覆盖');
    const bCover = dp.valueB.includes('覆盖') && !dp.valueB.includes('不覆盖');
    const aNoCover = dp.valueA.includes('不覆盖');
    const bNoCover = dp.valueB.includes('不覆盖');
    if (aCover && bNoCover) {
      highlights.push(`${planBName}可能需承担折旧/贬值费，${planAName}已覆盖。重大事故时折旧费可能是一笔不小的支出。`);
    } else if (bCover && aNoCover) {
      highlights.push(`${planAName}可能需承担折旧/贬值费，${planBName}已覆盖。重大事故时折旧费可能是一笔不小的支出。`);
    }
  }

  // 司乘保障差异
  const dpPass = dims.find((d) => d.icon === 'driverPassenger');
  if (dpPass) {
    const hasDriverA = dpPass.valueA && dpPass.valueA !== UNCLEAR_TEXT;
    const hasDriverB = dpPass.valueB && dpPass.valueB !== UNCLEAR_TEXT;
    if (!hasDriverA && hasDriverB) {
      highlights.push(`${planBName}司乘保障更明确，${planAName}需要再确认车上人员保障。多人出行建议重点看这一项。`);
    } else if (hasDriverA && !hasDriverB) {
      highlights.push(`${planAName}司乘保障更明确，${planBName}需要再确认车上人员保障。多人出行建议重点看这一项。`);
    }
  }

  // 如果没生成任何高亮，给一个总结
  if (!highlights.length) {
    highlights.push(compareResult.summaryJudgment);
  }

  return highlights.slice(0, 5);
}

/** 基于保障对比和价格差生成"我的建议" */
function buildInsuranceAdvice(compareResult, planA, planB) {
  const dims = compareResult.dimensions;
  const betterA = dims.filter((d) => d.difference === 'A更优').length;
  const betterB = dims.filter((d) => d.difference === 'B更优').length;
  const priceDiff = Math.abs((planA.totalPrice || 0) - (planB.totalPrice || 0));

  const betterPlan = betterA > betterB ? compareResult.planA : compareResult.planB;
  const worsePlan = betterA > betterB ? compareResult.planB : compareResult.planA;
  const cheaperPlan = (planA.totalPrice || 0) <= (planB.totalPrice || 0) ? planA : planB;
  const pricierPlan = cheaperPlan === planA ? planB : planA;

  const betterIsCheaper = betterPlan.name === cheaperPlan.insurancePlan;

  if (betterA === betterB) {
    return {
      level: 'neutral',
      text: `两个方案的保障水平接近${priceDiff > 0 ? `，价格相差 ${formatMoney(priceDiff)}` : ''}。如果路线简单、驾驶经验丰富，可以优先考虑价格更低的方案；如果对省心有更高要求，可以结合具体保障维度微调。`,
      note: '具体保障以下单页和合同为准。',
    };
  }

  if (betterIsCheaper) {
    const dimExamples = dims
      .filter((d) => d.difference === 'A更优')
      .slice(0, 2)
      .map((d) => d.label)
      .join('、');
    return {
      level: 'recommendA',
      text: `${compareResult.planA.platform}「${compareResult.planA.name}」在保障上更完整（如${dimExamples}等），且价格更低或相近。这种情况比较难得，建议优先考虑。`,
      note: '同时也请在下单页核对保障详情，确认覆盖范围后再下单。',
    };
  }

  if (priceDiff <= 300 && betterA !== betterB) {
    return {
      level: 'recommendCoverage',
      text: `${betterPlan.platform}「${betterPlan.name}」的保障更完整，而价格仅高出约 ${formatMoney(priceDiff)}。建议优先考虑保障更完整的方案——多花 ${formatMoney(priceDiff)} 换省心，在长途、复杂路线或多人出行场景下很值得。`,
      note: '如果只是城市短途、路况简单，也可以维持低价方案，但取车时务必做好验车留证。',
    };
  }

  if (betterA < betterB) {
    return {
      level: 'tradeoff',
      text: `${betterPlan.platform}「${betterPlan.name}」保障更完整，但价格也高出约 ${formatMoney(priceDiff)}。你需要权衡：多花的钱主要换来更全面的保障和更省心的体验。长途、山路、新手驾驶或带家人出行，建议往保障更完整的方向靠。`,
      note: '如果预算确实有限，低价方案配合认真验车留证也可以。但出发前建议先了解低价方案的不覆盖范围。',
    };
  }

  return {
    level: 'tradeoff',
    text: `${betterPlan.platform}「${betterPlan.name}」保障更完整，但价格也高出约 ${formatMoney(priceDiff)}。如果预算允许且路线复杂、新手驾驶或多人出行，建议优先考虑保障更完整的方案。`,
    note: '城市短途且预算敏感时，低价方案也可以接受，取车时做好验车留证即可。',
  };
}

function hasMeaningfulInsuranceGap(plans) {
  const categories = new Set(plans.map((plan) => getInsuranceCategory(plan)));
  return categories.has('basic') && categories.has('premium');
}

function formatThirdPartyUser(plan) {
  const amount = Number(plan?.thirdParty?.amount);
  if (!Number.isFinite(amount) || amount <= 0) return '未明确';
  return `${amount}${plan.thirdParty?.unit || '万元'}`;
}

function formatCoveredUser(value, note = '') {
  if (hasInternalInsuranceNote(note)) return UNCLEAR_TEXT;
  if (value === true) return '包含';
  if (value === false) return '不包含';
  if (value === '部分') return '部分包含';
  return UNCLEAR_TEXT;
}

function getChassisOrRoadsideValue(plan) {
  const candidates = [
    plan?.chassis?.covered,
    plan?.undercarriage?.covered,
    plan?.roadsideAssistance?.covered,
    plan?.roadsideRescue?.covered,
    plan?.rescue?.covered,
  ].filter((value) => value !== undefined && value !== null);

  if (!candidates.length) return '未明确';
  if (candidates.some((value) => value === '部分')) return '部分包含';
  if (candidates.every((value) => value === true)) return '包含';
  if (candidates.some((value) => value === true)) return '部分包含';
  if (candidates.every((value) => value === false)) return '不包含';
  return '未明确';
}

function getInsuranceCoverageScore(plan) {
  if (!plan) return 0;

  let score = 0;
  const thirdPartyAmount = Number(plan.thirdParty?.amount);

  if (Number.isFinite(thirdPartyAmount) && thirdPartyAmount > 0) score += 1;
  if (thirdPartyAmount >= 100) score += 0.5;
  score += getExplicitCoverageScore(plan.tireWheel?.covered);
  score += getExplicitCoverageScore(plan.glass?.covered);
  score += getExplicitCoverageScore(plan.downtime?.covered);
  score += getExplicitCoverageScore(plan.depreciation?.covered);
  score += getExplicitCoverageScore(plan.medicalOutsideInsurance?.covered);
  const chassisRoadsideValue = getChassisOrRoadsideValue(plan);
  score += chassisRoadsideValue === '包含' ? 1 : chassisRoadsideValue === '部分包含' ? 0.5 : 0;

  if (plan.vehicleDamage?.customerPay?.includes('0')) score += 1;
  if (plan.driverPassenger?.driver || plan.driverPassenger?.passenger) score += 1;
  if (plan.advancePayment?.required === false) score += 0.5;

  return score;
}

function getExplicitCoverageScore(value) {
  if (value === true) return 1;
  if (value === '部分') return 0.5;
  return 0;
}

function formatPlanName(plan) {
  if (!plan) return '该方案';
  return `${plan.platform}「${plan.insurancePlan}」`;
}

function getInsuranceCategory(planOrValue) {
  // 如果传入的是方案对象（有 platform 和 insurancePlan），先尝试从数据中查找
  if (planOrValue && typeof planOrValue === 'object' && planOrValue.platform && planOrValue.insurancePlan) {
    const matched = findInsurancePlan(planOrValue.platform, planOrValue.insurancePlan);
    if (matched) return matched.tier;
  }

  // 如果只传了字符串，用原有正则兜底
  const text = String(typeof planOrValue === 'string' ? planOrValue : planOrValue?.insurancePlan || '').toLowerCase();
  if (/基础|basic/.test(text)) return 'basic';
  if (/最高|尊享|全险|高档|全面|不计免赔|premium|plus|百万|无忧|升级/.test(text)) return 'premium';
  if (/中等|标准|standard|优享|剐蹭/.test(text)) return 'standard';
  return 'other';
}

function getInsuranceBadgeMeta(category) {
  if (category === 'premium') return { label: '高保障', className: 'bg-amberSoft/40 text-amberDark' };
  if (category === 'basic') return { label: '基础保障', className: 'bg-aquaCard text-muted' };
  if (category === 'standard') return { label: '中等保障', className: 'bg-mint text-pine' };
  return { label: '其他保障', className: 'bg-aquaCard/70 text-muted' };
}

function getBudgetLinkInsuranceHint(category) {
  if (category === 'premium') {
    return {
      text: '想省心可以重点看这类高保障方案。',
      className: 'bg-amberSoft/35 text-amberDark',
    };
  }

  if (category === 'basic') {
    return {
      text: '预算优先可以看，但取车时要把关键位置拍清楚。',
      className: 'bg-aquaCard text-pine',
    };
  }

  return {
    text: '可以结合路线难度，再决定要不要升保障。',
    className: 'bg-aquaCard/70 text-muted',
  };
}

function getPremiumPriceHint(sorted, lowest) {
  if (!lowest) return '';

  const premiumPlan = sorted.find((plan) => getInsuranceCategory(plan) === 'premium');
  if (!premiumPlan) return '';

  const diff = premiumPlan.totalPrice - lowest.totalPrice;
  if (diff <= 0) return '';

  if (diff <= 300) {
    return `有一个高保障方案只比最低价贵 ${formatMoney(diff)}。如果你更重视省心，可以把它作为优先考虑方案。`;
  }

  if (diff <= 800) {
    return '高保障方案价格略高，但可能减少小剐蹭和还车沟通成本，适合长途或新手场景。';
  }

  return '高保障方案明显更贵，建议结合路线复杂度、驾驶经验和预算决定。';
}

function formatPlanLine(plan) {
  if (!plan) return '-';
  return `${plan.platform}｜${plan.carModel}｜${plan.insurancePlan}｜${formatMoney(plan.totalPrice)}`;
}

function buildCompareCopyText(stats) {
  const lines = ['租车方案对比'];

  stats.sorted.forEach((plan, index) => {
    lines.push(`${index + 1}. ${plan.platform}｜${plan.carModel}｜${plan.insurancePlan}｜${formatMoney(plan.totalPrice)}`);
  });

  if (stats.count >= 2) {
    lines.push('');
    lines.push(`最低价方案：${formatPlanLine(stats.lowest)}`);
    lines.push(`最高价方案：${formatPlanLine(stats.highest)}`);
    lines.push(`最高价与最低价相差：${formatMoney(stats.diff)}`);
    lines.push(`平均价格：${formatMoney(stats.average)}`);
    lines.push(stats.summary);
    if (stats.sameModelHint) lines.push(stats.sameModelHint);
    if (stats.insuranceHint) lines.push(stats.insuranceHint);
    if (stats.premiumPriceHint) lines.push(stats.premiumPriceHint);
    if (stats.lowestBasicHint) lines.push(stats.lowestBasicHint);
    if (stats.priceGapHint) lines.push(stats.priceGapHint);

    // 保障差异对比
    const ic = stats.insuranceCompare;
    if (ic && ic.ready && ic.highlights.length) {
      lines.push('');
      lines.push('【保障差异提醒】');
      lines.push(`对比：${ic.result.planA.platform}「${ic.result.planA.name}」vs ${ic.result.planB.platform}「${ic.result.planB.name}」`);
      ic.highlights.forEach((h, i) => lines.push(`${i + 1}. ${h}`));
      if (ic.advice) {
        lines.push('');
        lines.push(`建议：${ic.advice.text}`);
      }
    }
  }

  lines.push('');
  lines.push('结果仅供手动记录和出行前估算，实际价格以租车平台和门店合同为准。');
  lines.push('保障权益以下单页、合同和保障说明为准。');
  lines.push('来自 pYuY 租车自驾决策工具箱');
  return lines.join('\n');
}

async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

function loadPlans() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.slice(0, 10).filter((plan) => Number(plan.totalPrice) > 0) : [];
  } catch {
    return [];
  }
}
