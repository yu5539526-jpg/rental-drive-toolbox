import { Calculator, CheckCircle2, ChevronLeft, ChevronRight, Copy, Image, Info, RotateCcw, WalletCards, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import LeadCaptureModal from '../components/LeadCaptureModal.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import TopBar from '../components/TopBar.jsx';
import { ENERGY_DEFAULTS, ENERGY_NOTE } from '../constants/energyDefaults.js';
import { budgetSteps, defaultBudgetDraft } from '../data/budgetFields.js';
import { calculateBudget, formatMoney, formatPercent } from '../utils/budget.js';

const STORAGE_KEY = 'rentalDrive.budgetDraft';

export default function BudgetPage() {
  const location = useLocation();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState(loadBudgetDraft);
  const [leadOpen, setLeadOpen] = useState(false);
  const [feedback, setFeedback] = useState('填写任意费用后，预算结果会立刻同步刷新。');
  const prefillAppliedRef = useRef(false);
  const result = useMemo(() => calculateBudget(draft), [draft]);
  const currentStep = budgetSteps[step];
  const progress = Math.round(((step + 1) / budgetSteps.length) * 100);

  useEffect(() => {
    if (prefillAppliedRef.current) return;

    const prefillTotal = Number(location.state?.prefillRentalPlatformTotal);
    if (!Number.isFinite(prefillTotal) || prefillTotal <= 0) return;

    prefillAppliedRef.current = true;
    setDraft((current) => ({
      ...current,
      rentalPlatformTotal: String(Math.round(prefillTotal)),
    }));
    setStep(1);

    const selectedPlan = location.state?.priceComparePlan;
    const planText = selectedPlan
      ? `${selectedPlan.platform}｜${selectedPlan.carModel}｜${formatMoney(selectedPlan.totalPrice)}`
      : formatMoney(prefillTotal);
    setFeedback(`已带入最低价方案：${planText}，可继续补充其他预算信息。`);
  }, [location.state]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  const update = (name, value) => {
    setDraft((current) => ({ ...current, [name]: value }));
    setFeedback('预算已更新，下方实时预览已同步刷新。');
  };

  const goNext = () => {
    if (step === budgetSteps.length - 1) return;
    setStep((current) => {
      const next = current + 1;
      setFeedback(next === budgetSteps.length - 1 ? '已生成完整预算结果。' : `已进入第 ${next + 1} 步。`);
      return next;
    });
  };

  const goPrev = () => {
    setStep((current) => {
      const next = Math.max(0, current - 1);
      setFeedback(`已返回第 ${next + 1} 步。`);
      return next;
    });
  };

  const reset = () => {
    setDraft(defaultBudgetDraft);
    setStep(0);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultBudgetDraft));
    setFeedback('预算表已重置。');
  };

  const openLead = () => {
    setFeedback('请确认隐私提示后提交，提交成功后会显示已保存。');
    setLeadOpen(true);
  };

  const resultSnapshot = {
    input: draft,
    result,
  };

  return (
    <main className="min-h-screen bg-transparent">
      <TopBar title="自驾旅行预算计算器" subtitle="5 步算清大概花费" />

      <section className="sticky top-[72px] z-10 border-b border-pine/10 bg-cream/90 px-4 py-3 backdrop-blur">
        <div className="rounded-[22px] bg-card p-4 shadow-card ring-1 ring-pine/10">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-pine">
              第 {step + 1} 步 / 共 {budgetSteps.length} 步
            </span>
            <span className="text-sm font-bold text-muted">{progress}%</span>
          </div>
          <h1 className="mb-3 text-xl font-bold leading-tight text-ink">{currentStep.title}</h1>
          <ProgressBar value={progress} />
          <p className="mt-3 text-xs font-medium leading-relaxed text-muted">{currentStep.hint}</p>
          <p className="mt-2 rounded-2xl bg-mint px-3 py-2 text-xs font-bold leading-relaxed text-pine" role="status" aria-live="polite">
            {feedback}
          </p>
        </div>
      </section>

      <section className="page-pad px-4 pt-4">
        {step === budgetSteps.length - 1 ? (
          <BudgetResult result={result} draft={draft} onReset={reset} onOpenLead={openLead} />
        ) : (
          <BudgetFormStep step={currentStep} stepIndex={step} draft={draft} result={result} update={update} />
        )}
      </section>

      <nav className="bottom-action fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] px-4 pt-3 sm:bottom-6 sm:rounded-b-[30px]">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={goPrev}
            disabled={step === 0}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-card px-4 font-bold text-pine shadow-sm ring-1 ring-pine/10 disabled:text-muted/50"
          >
            <ChevronLeft size={18} />
            上一步
          </button>
          {step === budgetSteps.length - 1 ? (
            <button
              type="button"
              onClick={openLead}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-pine px-3 text-sm font-bold leading-tight text-white shadow-lg shadow-pine/20"
            >
              <WalletCards size={18} />
              提交并保存我的出行计划
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-pine px-4 font-bold text-white shadow-lg shadow-pine/20"
            >
              {step === budgetSteps.length - 2 ? '查看完整结果' : '下一步'}
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </nav>

      <LeadCaptureModal
        open={leadOpen}
        onClose={() => setLeadOpen(false)}
        resultType="budget"
        resultSnapshot={resultSnapshot}
        defaultDestination={draft.destination}
      />
    </main>
  );
}

function BudgetFormStep({ step, stepIndex, draft, result, update }) {
  return (
    <div className="grid gap-4">
      <section className="screen-card rounded-[24px] p-4">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[18px] bg-mint text-pine">
            <Calculator size={21} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-ink">{step.title}</h2>
            <p className="mt-0.5 text-xs font-medium text-muted">填写能确定的数字，不确定可以先留空。</p>
          </div>
        </div>

        {step.choice ? (
          <div className="mb-4">
            <p className="mb-2 text-sm font-bold text-ink">{step.choice.label}</p>
            <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-mint p-1.5">
              {step.choice.options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => update(step.choice.name, option.value)}
                  className={`min-h-11 rounded-xl px-3 text-sm font-bold ${
                    draft[step.choice.name] === option.value ? 'bg-pine text-white shadow-sm' : 'bg-transparent text-pine'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="grid gap-3">
          {step.fields.map((field) => (
            <label key={field.name} className="block">
              <span className="mb-1.5 block text-sm font-bold text-ink">{field.label}</span>
              <div className="relative">
                <input
                  type={field.type === 'number' ? 'number' : 'text'}
                  inputMode={field.type === 'number' ? 'numeric' : undefined}
                  min={field.type === 'number' ? '0' : undefined}
                  value={draft[field.name] ?? ''}
                  onChange={(event) => update(field.name, event.target.value)}
                  placeholder={field.placeholder || '0'}
                  className="h-12 w-full rounded-[14px] border border-pine/20 bg-card px-3.5 pr-20 text-[15px] font-semibold text-ink outline-none shadow-sm transition focus:border-pine focus:ring-2 focus:ring-pine/10"
                />
                {field.suffix ? (
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted">
                    {field.suffix}
                  </span>
                ) : null}
              </div>
              {field.help ? <span className="mt-1.5 block text-xs leading-relaxed text-muted">{field.help}</span> : null}
            </label>
          ))}
        </div>
      </section>

      {stepIndex === 0 ? <EnergyInfoCard selectedType={draft.energyType} result={result} compact /> : null}
      <BudgetPreview result={result} />
    </div>
  );
}

function BudgetPreview({ result }) {
  const hasBudget = result.tripTotal > 0 || result.temporaryFunds > 0;

  return (
    <section className="rounded-[24px] bg-card p-4 shadow-card ring-1 ring-pine/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-muted">实时预算预览</p>
          <p className="mt-1 text-3xl font-bold leading-tight text-ink">{formatMoney(result.tripTotal)}</p>
          <p className="mt-1 text-xs font-medium leading-relaxed text-muted">
            {hasBudget ? result.completenessText : '填写信息后将自动生成预算。'}
          </p>
        </div>
        <div className="rounded-2xl bg-mint px-3 py-2 text-right">
          <p className="text-[11px] font-bold text-muted">完整度</p>
          <p className="text-base font-bold text-pine">{result.completenessPercent}%</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <PreviewMetric label="人均" value={formatMoney(result.perPerson)} />
        <PreviewMetric label="日均" value={formatMoney(result.dailyAverage)} />
        <PreviewMetric label="押金占用" value={formatMoney(result.temporaryFunds)} />
      </div>
    </section>
  );
}

function PreviewMetric({ label, value }) {
  return (
    <div className="rounded-2xl bg-mint px-3 py-2">
      <p className="text-[11px] font-bold text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-ink">{value}</p>
    </div>
  );
}

function BudgetResult({ result, draft, onReset, onOpenLead }) {
  const [copyStatus, setCopyStatus] = useState('');
  const [cardStatus, setCardStatus] = useState('');
  const [cardOpen, setCardOpen] = useState(false);
  const feeCards = [
    ['车辆与交通费用', result.vehicleTransport],
    ['住宿餐饮费用', result.lodgingDining],
    ['景区游玩费用', result.scenic],
    ['大交通费用', result.bigTraffic],
    ['其他费用', result.otherFees],
    ['应急预算', result.emergency],
  ];
  const splitTotal = Math.max(result.tripTotal, 1);

  const copyBudgetResult = async () => {
    const text = buildBudgetCopyText(result, draft);
    const ok = await copyText(text);
    setCopyStatus(ok ? '预算结果已复制，可以粘贴到备忘录或聊天里。' : '复制失败，可以稍后再试。');
  };

  const openBudgetCard = () => {
    if (!hasBudgetCardBase(draft, result)) {
      setCardStatus('请先填写基础预算信息，再生成预算卡。');
      return;
    }

    setCardStatus('');
    setCardOpen(true);
  };

  return (
    <div className="grid gap-4">
      <section className="rounded-[24px] bg-pine p-5 text-white shadow-soft">
        <p className="text-sm font-bold text-white/70">{draft.destination || '本次自驾'}</p>
        <h2 className="mt-1 text-xl font-bold">本次自驾预算结果</h2>
        <p className="mt-4 text-[44px] font-bold leading-none tracking-normal">{formatMoney(result.tripTotal)}</p>
        <p className="mt-3 text-sm font-medium leading-relaxed text-white/80">{result.budgetSummary}</p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <BigMetric label="人均预算" value={formatMoney(result.perPerson)} />
          <BigMetric label="日均预算" value={formatMoney(result.dailyAverage)} />
          <BigMetric label="押金占用" value={formatMoney(result.temporaryFunds)} />
        </div>
      </section>

      {result.isRoughEstimate ? (
        <p className="rounded-[18px] bg-amberSoft px-4 py-3 text-sm font-bold leading-relaxed text-[#7A5521]">
          部分费用未填写，当前结果为粗略估算。
        </p>
      ) : null}

      <section className="screen-card rounded-[24px] p-4">
        <h2 className="mb-3 text-lg font-bold text-ink">费用拆分</h2>
        <div className="grid gap-3">
          {feeCards.map(([label, value]) => (
            <FeeSplitRow key={label} label={label} value={value} percent={Math.min(100, Math.round((value / splitTotal) * 100))} />
          ))}
        </div>
      </section>

      <section className="screen-card rounded-[24px] p-4">
        <h2 className="mb-3 text-lg font-bold text-ink">押金与资金准备</h2>
        <div className="grid gap-3">
          <HighlightRow label="临时占用资金" value={formatMoney(result.temporaryFunds)} note="车辆押金 + 违章押金" />
          <HighlightRow label="出行前建议准备资金" value={formatMoney(result.preparedFunds)} note="旅行总预算 + 临时占用资金" />
        </div>
      </section>

      <section className="screen-card rounded-[24px] p-4">
        <h2 className="mb-3 text-lg font-bold text-ink">预算判断</h2>
        <div className="rounded-2xl bg-mint p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-muted">车辆成本占比</span>
            <span className="text-xl font-bold text-pine">{formatPercent(result.vehicleCostRatio)}</span>
          </div>
          <div className="mt-3">
            <ProgressBar value={result.vehicleCostRatio} tone={result.vehicleCostRatio >= 45 ? 'coral' : 'pine'} />
          </div>
          <p className="mt-3 text-sm font-medium leading-relaxed text-ink">
            车辆成本占比 {formatPercent(result.vehicleCostRatio)}，{result.vehicleCostJudgment}
          </p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <BadgeBox label="人均预算等级" value={result.budgetLevel} />
          <BadgeBox label="能源估算" value={formatMoney(result.energyCost)} />
        </div>
      </section>

      <EnergyInfoCard selectedType={draft.energyType} result={result} />

      <section className="screen-card rounded-[24px] p-4">
        <h2 className="text-lg font-bold text-ink">预算优化建议</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
          {result.suggestions.map((suggestion) => (
            <li key={suggestion}>• {suggestion}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-[24px] bg-card p-4 shadow-card ring-1 ring-pine/10">
        <div className="grid gap-3">
          <button
            type="button"
            onClick={copyBudgetResult}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-mint px-4 font-bold text-pine"
          >
            <Copy size={18} />
            复制预算结果
          </button>
          <button
            type="button"
            onClick={openBudgetCard}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-pine px-4 font-bold text-white shadow-lg shadow-pine/20"
          >
            <Image size={18} />
            生成预算卡
          </button>
          <button
            type="button"
            onClick={onOpenLead}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-card px-4 font-bold text-pine ring-1 ring-pine/10"
          >
            <WalletCards size={18} />
            提交并保存我的出行计划
          </button>
        </div>
        {copyStatus ? <p className="mt-2 text-center text-xs font-bold text-muted">{copyStatus}</p> : null}
        {cardStatus ? <p className="mt-2 text-center text-xs font-bold text-[#7A5521]">{cardStatus}</p> : null}
        <button
          type="button"
          onClick={onReset}
          className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-card px-4 font-bold text-pine ring-1 ring-pine/10"
        >
          <RotateCcw size={17} />
          重新填写
        </button>
      </section>

      <p className="rounded-2xl bg-cream px-4 py-3 text-xs font-medium leading-relaxed text-muted">
        结果仅供出行前估算，实际价格以租车平台、酒店、景区和路况为准。
      </p>

      <BudgetCardModal open={cardOpen} onClose={() => setCardOpen(false)} result={result} draft={draft} />
    </div>
  );
}

function BudgetCardModal({ open, onClose, result, draft }) {
  const [copyStatus, setCopyStatus] = useState('');
  const cardData = useMemo(() => buildBudgetCardData(result, draft), [result, draft]);

  if (!open) return null;

  const copyCardText = async () => {
    const ok = await copyText(buildBudgetCopyText(result, draft));
    setCopyStatus(ok ? '文字版预算卡已复制。' : '复制失败，可以稍后再试。');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 px-4 sm:items-center">
      <div className="safe-bottom max-h-[94vh] w-full max-w-[430px] overflow-y-auto rounded-t-[28px] bg-card p-4 shadow-soft sm:rounded-[28px]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-coral">预算卡预览</p>
            <h2 className="mt-1 text-xl font-bold text-ink">适合截图保存或发给同行人</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-mint text-ink"
            aria-label="关闭预算卡"
          >
            <X size={19} />
          </button>
        </div>

        <div className="mx-auto w-full max-w-[390px] overflow-hidden rounded-[24px] bg-gradient-to-br from-cream via-mint to-[#F8EABD] shadow-card ring-1 ring-pine/10">
          <div className="bg-pine px-5 pb-5 pt-4 text-white">
            <p className="text-xs font-bold text-white/70">pYuY 租车自驾工具箱</p>
            <h3 className="mt-2 text-2xl font-bold leading-tight">我的自驾预算卡</h3>
            <p className="mt-4 text-[42px] font-bold leading-none tracking-normal">{formatMoney(result.tripTotal)}</p>
            <p className="mt-2 text-sm font-medium text-white/78">预计总花费，不含押金占用</p>
          </div>

          <div className="grid gap-4 p-4">
            <section className="rounded-[20px] bg-white/80 p-3 ring-1 ring-pine/10">
              <div className="grid grid-cols-2 gap-2">
                {cardData.baseInfo.map(([label, value]) => (
                  <InfoCell key={label} label={label} value={value} />
                ))}
              </div>
            </section>

            <section className="rounded-[20px] bg-white/84 p-3 ring-1 ring-pine/10">
              <div className="grid grid-cols-2 gap-2">
                <MoneyCell label="人均预算" value={formatMoney(result.perPerson)} />
                <MoneyCell label="日均预算" value={formatMoney(result.dailyAverage)} />
                <MoneyCell label="押金占用" value={formatMoney(result.temporaryFunds)} muted />
                <MoneyCell label="建议准备资金" value={formatMoney(result.preparedFunds)} />
              </div>
            </section>

            <section className="rounded-[20px] bg-white/84 p-3 ring-1 ring-pine/10">
              <h4 className="text-sm font-bold text-ink">费用拆分</h4>
              <div className="mt-3 grid gap-2.5">
                {cardData.feeCards.map(([label, value]) => (
                  <FeeSplitRow key={label} label={label} value={value} percent={Math.min(100, Math.round((value / cardData.splitTotal) * 100))} />
                ))}
              </div>
            </section>

            <section className="rounded-[20px] bg-pine/95 p-3 text-white">
              <p className="text-xs font-bold text-white/64">预算判断</p>
              <p className="mt-1 text-xl font-bold">{cardData.level}</p>
              <p className="mt-2 text-sm font-medium leading-relaxed text-white/84">{cardData.judgment}</p>
            </section>

            <p className="text-center text-[11px] font-medium leading-relaxed text-muted">
              结果仅供出行前估算，实际价格以租车平台、酒店、景区和路况为准。
              <br />
              来自 pYuY 租车自驾工具箱
            </p>
          </div>
        </div>

        <p className="mt-3 rounded-2xl bg-mint px-3 py-2 text-center text-xs font-bold leading-relaxed text-pine">
          可以截图保存或复制文字版。
        </p>
        {copyStatus ? <p className="mt-2 text-center text-xs font-bold text-muted">{copyStatus}</p> : null}

        <div className="mt-4 grid gap-3">
          <button
            type="button"
            onClick={copyCardText}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-pine px-4 font-bold text-white shadow-lg shadow-pine/20"
          >
            <Copy size={18} />
            复制文字版
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-card px-3 text-sm font-bold text-pine ring-1 ring-pine/10"
            >
              返回修改预算
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-mint px-3 text-sm font-bold text-pine"
            >
              <CheckCircle2 size={17} />
              我已截图保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCell({ label, value }) {
  return (
    <div className="rounded-2xl bg-mint px-3 py-2">
      <p className="text-[11px] font-bold text-muted">{label}</p>
      <p className="mt-0.5 break-words text-sm font-bold leading-tight text-ink">{value || '未填写'}</p>
    </div>
  );
}

function MoneyCell({ label, value, muted }) {
  return (
    <div className={`rounded-2xl px-3 py-2 ${muted ? 'bg-amberSoft' : 'bg-mint'}`}>
      <p className="text-[11px] font-bold text-muted">{label}</p>
      <p className="mt-0.5 text-base font-bold leading-tight text-ink">{value}</p>
    </div>
  );
}

function EnergyInfoCard({ selectedType, result, compact = false }) {
  const safeType = selectedType === 'hybrid' ? 'extended' : selectedType || 'oil';
  const current = ENERGY_DEFAULTS[safeType] || ENERGY_DEFAULTS.oil;

  return (
    <section className={`rounded-[24px] bg-cream p-4 ring-1 ring-pine/10 ${compact ? '' : 'shadow-sm'}`}>
      <div className="flex gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-card text-pine">
          <Info size={18} />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-ink">能源费用估算说明</h2>
          <p className="mt-1 text-xs font-medium leading-relaxed text-muted">
            当前选择：{current.label}，按 {current.unitText} 估算，预计能源费用 {formatMoney(result.energyCost)}。
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">公式：{current.formulaText}</p>
          {!compact ? <p className="mt-2 text-xs leading-relaxed text-muted">{ENERGY_NOTE}</p> : null}
        </div>
      </div>
    </section>
  );
}

function BigMetric({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 px-3 py-3">
      <p className="text-[11px] font-bold text-white/60">{label}</p>
      <p className="mt-1 text-sm font-bold leading-tight">{value}</p>
    </div>
  );
}

function FeeSplitRow({ label, value, percent }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-muted">{label}</span>
        <span className="shrink-0 text-base font-bold text-ink">{formatMoney(value)}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-mint">
        <div className="h-full rounded-full bg-pine transition-all duration-300" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function HighlightRow({ label, value, note }) {
  return (
    <div className="rounded-2xl bg-amberSoft p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#7A5521]">{label}</p>
          <p className="mt-1 text-xs font-medium text-[#7A5521]/75">{note}</p>
        </div>
        <p className="shrink-0 text-xl font-bold text-[#7A5521]">{value}</p>
      </div>
    </div>
  );
}

function BadgeBox({ label, value }) {
  return (
    <div className="rounded-2xl bg-mint p-4">
      <p className="text-xs font-bold text-muted">{label}</p>
      <p className="mt-1 text-lg font-bold text-ink">{value}</p>
    </div>
  );
}

function hasBudgetCardBase(draft, result) {
  return Boolean(
    draft.destination?.trim() &&
      draft.departureCity?.trim() &&
      Number(draft.tripDays) > 0 &&
      Number(draft.people) > 0 &&
      result.tripTotal > 0,
  );
}

function buildBudgetCardData(result, draft) {
  const feeCards = [
    ['车辆与交通费用', result.vehicleTransport],
    ['住宿餐饮费用', result.lodgingDining],
    ['景区游玩费用', result.scenic],
    ['大交通费用', result.bigTraffic],
    ['其他费用', result.otherFees],
  ];
  const level = getBudgetCardLevel(result.perPersonDaily);
  const dominant = [...feeCards].sort((a, b) => b[1] - a[1])[0]?.[0] || '车辆与住宿';

  return {
    baseInfo: [
      ['目的地', draft.destination],
      ['出发城市', draft.departureCity],
      ['出行天数', `${result.tripDays} 天`],
      ['出行人数', `${result.people} 人`],
      ['租车天数', `${Number(draft.rentalDays) || result.tripDays} 天`],
      ['能源类型', result.energyLabel],
    ],
    feeCards,
    splitTotal: Math.max(feeCards.reduce((total, [, value]) => total + value, 0), 1),
    level,
    judgment: `这趟行程人均日预算属于${level}，${dominant}是主要支出，适合按实际路线和同行人数再做细化。`,
  };
}

function getBudgetCardLevel(perPersonDaily) {
  if (perPersonDaily <= 300) return '极简省钱型';
  if (perPersonDaily <= 600) return '经济实用型';
  if (perPersonDaily <= 1000) return '经济舒适型';
  if (perPersonDaily <= 1500) return '舒适品质型';
  return '高预算享受型';
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

function buildBudgetCopyText(result, draft) {
  return [
    '我的自驾预算结果：',
    `目的地：${draft.destination || '未填写'}`,
    `出发城市：${draft.departureCity || '未填写'}`,
    `出行天数：${result.tripDays} 天`,
    `出行人数：${result.people} 人`,
    `租车天数：${Number(draft.rentalDays) || result.tripDays} 天`,
    `能源类型：${result.energyLabel || '未填写'}`,
    '',
    `预计总花费：${formatMoney(result.tripTotal)}`,
    `人均预算：${formatMoney(result.perPerson)}`,
    `日均预算：${formatMoney(result.dailyAverage)}`,
    `押金占用：${formatMoney(result.temporaryFunds)}`,
    `建议准备资金：${formatMoney(result.preparedFunds)}`,
    '',
    '费用拆分：',
    `车辆与交通：${formatMoney(result.vehicleTransport)}`,
    `住宿餐饮：${formatMoney(result.lodgingDining)}`,
    `景区游玩：${formatMoney(result.scenic)}`,
    `大交通：${formatMoney(result.bigTraffic)}`,
    `其他费用：${formatMoney(result.otherFees)}`,
    '',
    '结果仅供出行前估算，实际价格以平台、酒店、景区和路况为准。',
    '来自 pYuY 租车自驾工具箱',
  ].join('\n');
}

function loadBudgetDraft() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const migratedTotal =
      Number(parsed.rentalPlatformTotal) > 0
        ? parsed.rentalPlatformTotal
        : legacyRentalTotal(parsed);

    return {
      ...defaultBudgetDraft,
      ...parsed,
      energyType: parsed.energyType === 'hybrid' ? 'extended' : parsed.energyType || defaultBudgetDraft.energyType,
      rentalPlatformTotal: migratedTotal || defaultBudgetDraft.rentalPlatformTotal,
    };
  } catch {
    return defaultBudgetDraft;
  }
}

function legacyRentalTotal(parsed) {
  const dailyRental = Number(parsed.dailyRental) || 0;
  const baseInsurance = Number(parsed.baseInsurance) || 0;
  const extraInsurance = Number(parsed.extraInsurance) || 0;
  const rentalDays = Number(parsed.rentalDays) || 0;
  const baseServiceFee = Number(parsed.baseServiceFee) || 0;
  const oneWayFee = Number(parsed.oneWayFee) || 0;
  const total = dailyRental * rentalDays + (baseInsurance + extraInsurance) * rentalDays + baseServiceFee + oneWayFee;
  return total > 0 ? String(Math.round(total)) : '';
}
