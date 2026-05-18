import { Copy, Edit3, Plus, RotateCcw, Send, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomActionBar, { BottomActionButton } from '../components/BottomActionBar.jsx';
import TopBar from '../components/TopBar.jsx';
import { formatMoney } from '../utils/budget.js';

const STORAGE_KEY = 'rentalDrive.priceComparePlans';
const emptyForm = {
  platform: '',
  carModel: '',
  insurancePlan: '',
  totalPrice: '',
};
const insurancePresets = ['基础保障', '中等保障', '最高档保险', '尊享保障', '全险', '其他'];
const inputClass =
  'h-12 w-full rounded-[16px] border border-pine/15 bg-aquaCard/70 px-3.5 text-[15px] font-semibold text-ink outline-none transition placeholder:text-muted/55 focus:border-pine focus:bg-card focus:ring-2 focus:ring-pine/10';

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
        <IntroCard />

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
              <input
                value={form.platform}
                onChange={(event) => update('platform', event.target.value)}
                className={inputClass}
                placeholder="例如：携程 / 一嗨 / 神州 / 哈啰 / 租租车"
              />
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
              <InsurancePresetPicker value={form.insurancePlan} onChange={(value) => update('insurancePlan', value)} />
              <input
                value={form.insurancePlan}
                onChange={(event) => update('insurancePlan', event.target.value)}
                className={`${inputClass} mt-2`}
                placeholder="例如：基础保障 / 最高档保险 / 尊享保障"
              />
            </Field>
            <Field label="租车总价，含保险">
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

function IntroCard() {
  return (
    <section className="rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
      <div className="flex items-start gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[20px] bg-aquaCard text-xl" aria-hidden="true">
          ⚖️
        </span>
        <div className="min-w-0">
          <h1 className="text-xl font-bold leading-tight text-ink">比租车方案</h1>
          <p className="mt-1.5 text-sm font-medium leading-relaxed text-muted">
            把不同平台、车型和保险方案放一起看，先算清含保险总价。
          </p>
          <p className="mt-2 rounded-2xl bg-amberSoft/45 px-3 py-2 text-xs font-bold leading-relaxed text-amberDark ring-1 ring-warning/20">
            先添加 2 个方案，对比结果会更有参考价值。
          </p>
        </div>
      </div>
    </section>
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

function InsurancePresetPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {insurancePresets.map((preset) => {
        const active = value === preset;

        return (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={`min-h-9 rounded-full px-3 text-center text-xs font-bold leading-tight transition ${
              active ? 'bg-pine text-lightText shadow-sm shadow-pine/15' : 'bg-aquaCard text-pine ring-1 ring-pine/10'
            }`}
          >
            {preset}
          </button>
        );
      })}
    </div>
  );
}

function PlanCard({ plan, stats, onEdit, onDelete, onUse }) {
  const isLowest = stats.lowest?.id === plan.id;
  const diff = stats.lowest ? plan.totalPrice - stats.lowest.totalPrice : 0;
  const category = getInsuranceCategory(plan.insurancePlan);
  const badge = getInsuranceBadgeMeta(category);
  const budgetHint = getBudgetLinkInsuranceHint(category);

  return (
    <article className={`rounded-[22px] border bg-card p-4 shadow-card ${isLowest ? 'border-pine/25' : 'border-pine/10'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-words text-lg font-bold leading-tight text-ink">{plan.platform}</h3>
            {isLowest ? <span className="rounded-full bg-mint px-2.5 py-1 text-xs font-bold text-pine">当前最低价</span> : null}
          </div>
          <p className="mt-1 break-words text-sm font-bold leading-relaxed text-ink">{plan.carModel}</p>
          <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${badge.className}`}>
            {badge.label}
          </span>
          <p className="mt-1 text-xs font-medium leading-relaxed text-muted">保险方案：{plan.insurancePlan}</p>
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
          <ExamplePlanLine text="携程｜问界 M9｜最高档保险｜¥5200" />
          <ExamplePlanLine text="一嗨｜理想 L9｜尊享保障｜¥4800" />
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
      <div className="rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
        <h2 className="text-lg font-bold text-ink">本次方案对比结果</h2>
        <div className="mt-3 grid gap-3">
          <CompareMetric label="已添加租车方案" value={`${stats.count} 个`} />
          <CompareMetric label="最低价方案" value={formatPlanLine(stats.lowest)} tone="low" />
          <CompareMetric label="最高价方案" value={formatPlanLine(stats.highest)} />
          <CompareMetric label="最高价与最低价相差" value={formatMoney(stats.diff)} tone="warm" />
          <CompareMetric label="平均价格" value={formatMoney(stats.average)} tone="muted" />
        </div>
      </div>

      <PriceRanking plans={stats.sorted} />

      <SuggestionCard stats={stats} />
    </section>
  );
}

function CompareMetric({ label, value, tone = 'default' }) {
  const toneClass =
    tone === 'low'
      ? 'bg-aquaCard text-pine'
      : tone === 'warm'
        ? 'bg-amberSoft/45 text-amberDark'
        : tone === 'muted'
          ? 'bg-aquaCard/70 text-ink'
          : 'bg-aquaCard text-ink';

  return (
    <div className={`rounded-2xl px-3 py-3 ${toneClass}`}>
      <p className="text-xs font-bold text-muted">{label}</p>
      <p className={`mt-1 break-words text-base font-bold leading-snug ${tone === 'low' ? 'text-pine' : tone === 'warm' ? 'text-amberDark' : 'text-ink'}`}>
        {value}
      </p>
    </div>
  );
}

function PriceRanking({ plans }) {
  return (
    <section className="rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-muted">从低到高</p>
          <h2 className="mt-1 text-lg font-bold text-ink">价格排序</h2>
        </div>
      </div>
      <ol className="mt-3 grid gap-2">
        {plans.map((plan, index) => (
          <li key={plan.id} className="grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-2 rounded-2xl bg-aquaCard px-3 py-2.5">
            <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${index === 0 ? 'bg-mint text-pine' : 'bg-card text-muted'}`}>
              {index + 1}
            </span>
            <span className="min-w-0">
              <span className="block break-words text-sm font-bold leading-tight text-ink">
                {plan.platform}｜{plan.carModel}
              </span>
              <span className="mt-1 block break-words text-xs font-medium leading-tight text-muted">{plan.insurancePlan}</span>
            </span>
            <span className="shrink-0 text-sm font-bold text-pine">{formatMoney(plan.totalPrice)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function SuggestionCard({ stats }) {
  return (
    <section className="rounded-[24px] border border-pine/10 bg-aquaCard p-4 shadow-card">
      <h2 className="text-lg font-bold text-ink">💡 选择建议</h2>
      <div className="mt-3 grid gap-2">
        <p className="rounded-2xl bg-card/75 px-3 py-3 text-sm font-medium leading-relaxed text-muted">{stats.summary}</p>
        {stats.sameModelHint ? <p className="rounded-2xl bg-card/75 px-3 py-3 text-sm font-bold leading-relaxed text-pine">{stats.sameModelHint}</p> : null}
        {stats.insuranceHint ? <InsuranceNotice text={stats.insuranceHint} /> : null}
        {stats.premiumPriceHint ? <InsuranceNotice text={stats.premiumPriceHint} /> : null}
        {stats.lowestBasicHint ? <p className="rounded-2xl bg-card/75 px-3 py-3 text-sm font-bold leading-relaxed text-ink">{stats.lowestBasicHint}</p> : null}
        {stats.priceGapHint ? <p className="rounded-2xl bg-coral/10 px-3 py-3 text-sm font-bold leading-relaxed text-coral">{stats.priceGapHint}</p> : null}
      </div>
    </section>
  );
}

function InsuranceNotice({ text }) {
  return (
    <p className="rounded-2xl bg-amberSoft/35 px-3 py-3 text-sm font-bold leading-relaxed text-ink ring-1 ring-warning/15">
      <span className="mr-1" aria-hidden="true">
        🛡️
      </span>
      {text}
    </p>
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
    lowest && getInsuranceCategory(lowest.insurancePlan) === 'basic'
      ? '最低价方案为基础保障，适合预算敏感、路线简单、驾驶经验较丰富，并愿意认真留证的用户。'
      : '';

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
  };
}

function hasMeaningfulInsuranceGap(plans) {
  const categories = new Set(plans.map((plan) => getInsuranceCategory(plan.insurancePlan)));
  return categories.has('basic') && categories.has('premium');
}

function getInsuranceCategory(value) {
  const text = String(value || '').toLowerCase();
  if (/基础|basic/.test(text)) return 'basic';
  if (/最高|尊享|全险|高档|全面|不计免赔|premium|plus/.test(text)) return 'premium';
  if (/中等|标准|standard/.test(text)) return 'standard';
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
      text: '已包含较高保险费用，预算会更接近省心出行方案。',
      className: 'bg-amberSoft/35 text-amberDark',
    };
  }

  if (category === 'basic') {
    return {
      text: '基础保障总价更低，但建议取车时完成关键留证。',
      className: 'bg-aquaCard text-pine',
    };
  }

  return {
    text: '建议结合路线复杂度和驾驶经验，再决定是否需要更高保障。',
    className: 'bg-aquaCard/70 text-muted',
  };
}

function getPremiumPriceHint(sorted, lowest) {
  if (!lowest) return '';

  const premiumPlan = sorted.find((plan) => getInsuranceCategory(plan.insurancePlan) === 'premium');
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
  }

  lines.push('');
  lines.push('结果仅供手动记录和出行前估算，实际价格以租车平台和门店合同为准。');
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
