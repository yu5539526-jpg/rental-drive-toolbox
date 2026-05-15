import { Copy, Edit3, Plus, RotateCcw, Send, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar.jsx';
import { formatMoney } from '../utils/budget.js';

const STORAGE_KEY = 'rentalDrive.priceComparePlans';
const emptyForm = {
  platform: '',
  carModel: '',
  insurancePlan: '',
  totalPrice: '',
};

export default function PriceComparePage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState(loadPlans);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [feedback, setFeedback] = useState('把不同平台看到的含保险总价填进来，就能自动对比。');
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
      setFeedback('已添加到对比列表。');
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
    setFeedback('已清空对比记录，可以重新添加。');
  };

  const copyCompareResult = async () => {
    if (!plans.length) {
      setFeedback('还没有方案可复制，先添加一个租车方案吧。');
      return;
    }
    const ok = await copyText(buildCompareCopyText(stats));
    setFeedback(ok ? '对比结果已复制，可以粘贴到备忘录或聊天里。' : '复制失败，可以稍后再试。');
  };

  const useLowestPlan = () => {
    if (!stats.lowest) {
      setFeedback('还没有最低价方案，先添加租车方案。');
      return;
    }

    navigate('/budget', {
      state: {
        prefillRentalPlatformTotal: stats.lowest.totalPrice,
        priceComparePlan: stats.lowest,
      },
    });
  };

  return (
    <main className="min-h-screen bg-transparent">
      <TopBar title="租车价格对比记录" subtitle="把不同平台、不同车型放在一起，先算清含保险总价" />

      <section className="px-4 pb-[13rem] pt-4">
        <form onSubmit={submitPlan} className="screen-card rounded-[24px] p-4">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[18px] bg-mint text-pine">
              <Plus size={21} />
            </span>
            <div>
              <h1 className="text-lg font-bold text-ink">{editingId ? '编辑方案' : '添加方案'}</h1>
              <p className="mt-0.5 text-xs font-medium leading-relaxed text-muted">只填平台、车型、保险方案和含保险总价。</p>
            </div>
          </div>

          <div className="grid gap-3">
            <Field label="平台">
              <input
                value={form.platform}
                onChange={(event) => update('platform', event.target.value)}
                className="h-12 w-full rounded-[14px] border border-pine/20 bg-card px-3.5 outline-none shadow-sm focus:border-pine focus:ring-2 focus:ring-pine/10"
                placeholder="例如：携程 / 一嗨 / 神州 / 哈啰 / 租租车"
              />
            </Field>
            <Field label="车型">
              <input
                value={form.carModel}
                onChange={(event) => update('carModel', event.target.value)}
                className="h-12 w-full rounded-[14px] border border-pine/20 bg-card px-3.5 outline-none shadow-sm focus:border-pine focus:ring-2 focus:ring-pine/10"
                placeholder="例如：问界 M9 / 理想 L9 / 坦克 300 / GL8"
              />
            </Field>
            <Field label="保险方案">
              <input
                value={form.insurancePlan}
                onChange={(event) => update('insurancePlan', event.target.value)}
                className="h-12 w-full rounded-[14px] border border-pine/20 bg-card px-3.5 outline-none shadow-sm focus:border-pine focus:ring-2 focus:ring-pine/10"
                placeholder="例如：基础保障 / 全险 / 尊享保障"
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
                  className="h-12 w-full rounded-[14px] border border-pine/20 bg-card px-3.5 pr-12 outline-none shadow-sm focus:border-pine focus:ring-2 focus:ring-pine/10"
                  placeholder="例如：5200"
                />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted">元</span>
              </div>
            </Field>
          </div>

          <button
            type="submit"
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-pine px-4 font-bold text-white shadow-lg shadow-pine/20"
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
              className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-mint px-4 font-bold text-pine"
            >
              取消编辑
            </button>
          ) : null}
        </form>

        <p className="mt-3 rounded-2xl bg-mint px-3 py-2 text-xs font-bold leading-relaxed text-pine" role="status" aria-live="polite">
          {feedback}
        </p>

        <section className="mt-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-ink">已添加方案</h2>
            <span className="rounded-full bg-card px-3 py-1 text-xs font-bold text-muted shadow-sm ring-1 ring-pine/10">{plans.length}/10</span>
          </div>
          {plans.length ? (
            <div className="grid gap-3">
              {plans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} stats={stats} onEdit={editPlan} onDelete={deletePlan} />
              ))}
            </div>
          ) : (
            <EmptyPlanCard />
          )}
        </section>

        <CompareResult stats={stats} />
      </section>

      <nav className="bottom-action fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] px-4 pt-3 sm:bottom-6 sm:rounded-b-[30px]">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={clearPlans}
            disabled={!plans.length}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-card px-3 text-sm font-bold text-pine shadow-sm ring-1 ring-pine/10 disabled:text-muted/50"
          >
            <RotateCcw size={17} />
            清空对比
          </button>
          <button
            type="button"
            onClick={copyCompareResult}
            disabled={!plans.length}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-mint px-3 text-sm font-bold text-pine disabled:text-muted/50"
          >
            <Copy size={17} />
            复制结果
          </button>
        </div>
        <button
          type="button"
          onClick={useLowestPlan}
          disabled={!stats.lowest}
          className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-pine px-3 text-center text-sm font-bold leading-tight text-white shadow-lg shadow-pine/20 disabled:bg-muted/40"
        >
          <Send size={17} />
          使用最低价方案进入预算计算
        </button>
      </nav>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-ink">{label}</span>
      {children}
    </label>
  );
}

function PlanCard({ plan, stats, onEdit, onDelete }) {
  const isLowest = stats.lowest?.id === plan.id;
  const diff = stats.lowest ? plan.totalPrice - stats.lowest.totalPrice : 0;

  return (
    <article className="screen-card rounded-[22px] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold leading-tight text-ink">{plan.platform}</h3>
            {isLowest ? <span className="rounded-full bg-mint px-2.5 py-1 text-xs font-bold text-pine">当前最低价</span> : null}
          </div>
          <p className="mt-1 text-sm font-bold leading-relaxed text-muted">{plan.carModel}</p>
          <p className="mt-0.5 text-xs font-medium leading-relaxed text-muted">保险方案：{plan.insurancePlan}</p>
        </div>
        <p className="shrink-0 text-xl font-bold text-pine">{formatMoney(plan.totalPrice)}</p>
      </div>

      <div className="mt-3 rounded-2xl bg-mint px-3 py-2 text-xs font-bold text-pine">
        {isLowest ? '当前最低价，可作为预算计算参考。' : `比最低价高 ${formatMoney(diff)}`}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onEdit(plan)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-card px-3 text-sm font-bold text-pine ring-1 ring-pine/10"
        >
          <Edit3 size={16} />
          编辑
        </button>
        <button
          type="button"
          onClick={() => onDelete(plan.id)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#FBEDEA] px-3 text-sm font-bold text-coral"
        >
          <Trash2 size={16} />
          删除
        </button>
      </div>
    </article>
  );
}

function EmptyPlanCard() {
  return (
    <div className="rounded-[22px] bg-card p-4 text-sm font-medium leading-relaxed text-muted shadow-sm ring-1 ring-pine/10">
      还没有添加方案，把你在不同平台看到的车型价格填进来，就能自动对比。
    </div>
  );
}

function CompareResult({ stats }) {
  if (stats.count === 0) {
    return (
      <section className="mt-4 rounded-[24px] bg-card p-4 shadow-card ring-1 ring-pine/10">
        <h2 className="text-lg font-bold text-ink">对比结果</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">还没有添加方案，把你在不同平台看到的车型价格填进来，就能自动对比。</p>
      </section>
    );
  }

  if (stats.count === 1) {
    return (
      <section className="mt-4 rounded-[24px] bg-card p-4 shadow-card ring-1 ring-pine/10">
        <h2 className="text-lg font-bold text-ink">对比结果</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">已添加 1 个方案，继续添加其他平台或车型后，可以进行对比。</p>
      </section>
    );
  }

  return (
    <section className="mt-4 rounded-[24px] bg-card p-4 shadow-card ring-1 ring-pine/10">
      <h2 className="text-lg font-bold text-ink">对比结果</h2>
      <div className="mt-3 grid gap-3">
        <CompareMetric label="已添加租车方案" value={`${stats.count} 个`} />
        <CompareMetric label="最低价方案" value={formatPlanLine(stats.lowest)} />
        <CompareMetric label="最高价方案" value={formatPlanLine(stats.highest)} />
        <CompareMetric label="最高价与最低价相差" value={formatMoney(stats.diff)} />
        <CompareMetric label="平均价格" value={formatMoney(stats.average)} />
      </div>

      <div className="mt-4 rounded-2xl bg-mint p-3">
        <p className="text-sm font-bold text-ink">价格排序</p>
        <ol className="mt-2 grid gap-2">
          {stats.sorted.map((plan, index) => (
            <li key={plan.id} className="flex items-start justify-between gap-3 rounded-2xl bg-card px-3 py-2">
              <span className="min-w-0 text-sm font-medium leading-relaxed text-muted">
                {index + 1}. {plan.platform}｜{plan.carModel}｜{plan.insurancePlan}
              </span>
              <span className="shrink-0 text-sm font-bold text-pine">{formatMoney(plan.totalPrice)}</span>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-3 rounded-2xl bg-cream px-3 py-3 text-sm font-medium leading-relaxed text-muted">{stats.summary}</p>

      {stats.sameModelHint ? <p className="mt-3 rounded-2xl bg-mint px-3 py-3 text-sm font-bold leading-relaxed text-pine">{stats.sameModelHint}</p> : null}
      {stats.modelGapHint ? <p className="mt-3 rounded-2xl bg-amberSoft px-3 py-3 text-sm font-bold leading-relaxed text-[#7A5521]">{stats.modelGapHint}</p> : null}
    </section>
  );
}

function CompareMetric({ label, value }) {
  return (
    <div className="rounded-2xl bg-mint px-3 py-3">
      <p className="text-xs font-bold text-muted">{label}</p>
      <p className="mt-1 break-words text-base font-bold leading-snug text-ink">{value}</p>
    </div>
  );
}

function validatePlan(form, count, editingId) {
  const hasEmpty = !form.platform.trim() || !form.carModel.trim() || !form.insurancePlan.trim() || !String(form.totalPrice).trim();
  const totalPrice = Number(form.totalPrice);

  if (hasEmpty) {
    return { ok: false, message: '请把平台、车型、保险方案和含保险总价都填完整。' };
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
  const uniqueModels = modelCounts.size;
  const hasSameModel = [...modelCounts.values()].some((value) => value > 1);
  const hasLargeModelGap = uniqueModels > 1 && lowest && diff >= Math.max(800, lowest.totalPrice * 0.25);

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
          )}。如果车型级别和保险保障接近，建议优先考虑低价方案；如果高价方案保险更完整或车型更适合长途，也可以结合实际需求选择。`
        : '',
    sameModelHint: hasSameModel ? '你添加了多个相同车型方案，可以重点比较不同平台的保险方案和含保险总价。' : '',
    modelGapHint: hasLargeModelGap ? '不同车型之间价格差异较大，建议不要只看总价，也要考虑人数、行李、路线和驾驶难度。' : '',
  };
}

function formatPlanLine(plan) {
  if (!plan) return '-';
  return `${plan.platform}｜${plan.carModel}｜${plan.insurancePlan}｜${formatMoney(plan.totalPrice)}`;
}

function buildCompareCopyText(stats) {
  const lines = ['租车平台价格对比记录'];

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
    if (stats.modelGapHint) lines.push(stats.modelGapHint);
  }

  lines.push('');
  lines.push('结果仅供手动记录和出行前估算，实际价格以租车平台和门店合同为准。');
  lines.push('来自 pYuY 租车自驾工具箱');
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
