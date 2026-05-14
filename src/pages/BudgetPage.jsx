import { Calculator, ChevronLeft, ChevronRight, Info, RotateCcw, WalletCards } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import LeadCaptureModal from '../components/LeadCaptureModal.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import TopBar from '../components/TopBar.jsx';
import { ENERGY_DEFAULTS, ENERGY_NOTE } from '../constants/energyDefaults.js';
import { budgetSteps, defaultBudgetDraft } from '../data/budgetFields.js';
import { calculateBudget, formatMoney, formatPercent } from '../utils/budget.js';

const STORAGE_KEY = 'rentalDrive.budgetDraft';

export default function BudgetPage() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState(loadBudgetDraft);
  const [leadOpen, setLeadOpen] = useState(false);
  const result = useMemo(() => calculateBudget(draft), [draft]);
  const currentStep = budgetSteps[step];
  const progress = Math.round(((step + 1) / budgetSteps.length) * 100);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  const update = (name, value) => {
    setDraft((current) => ({ ...current, [name]: value }));
  };

  const goNext = () => {
    if (step === budgetSteps.length - 1) return;
    setStep((current) => current + 1);
  };

  const goPrev = () => {
    setStep((current) => Math.max(0, current - 1));
  };

  const reset = () => {
    setDraft(defaultBudgetDraft);
    setStep(0);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultBudgetDraft));
  };

  const resultSnapshot = {
    input: draft,
    result,
  };

  return (
    <main className="safe-bottom min-h-[calc(100vh-2rem)] bg-mint">
      <TopBar title="自驾旅行预算计算器" subtitle="边填边算，押金单独看" />

      <section className="sticky top-[68px] z-10 border-b border-pine/10 bg-mint/95 px-4 py-3 backdrop-blur">
        <div className="rounded-[22px] bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-black text-ink">
              第 {step + 1} 步 / 共 {budgetSteps.length} 步
            </span>
            <span className="text-sm font-black text-pine">{progress}%</span>
          </div>
          <ProgressBar value={progress} />
          <p className="mt-2 text-xs font-bold text-ink/56">{currentStep.hint}</p>
        </div>
      </section>

      <section className="px-4 pb-28 pt-4">
        {step === budgetSteps.length - 1 ? (
          <BudgetResult result={result} draft={draft} onOpenLead={() => setLeadOpen(true)} onReset={reset} />
        ) : (
          <BudgetFormStep step={currentStep} stepIndex={step} draft={draft} result={result} update={update} />
        )}
      </section>

      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] px-4 pb-4">
        <div className="grid grid-cols-2 gap-3 rounded-[24px] border border-white/60 bg-white/92 p-3 shadow-soft backdrop-blur">
          <button
            type="button"
            onClick={goPrev}
            disabled={step === 0}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-mint px-4 py-3 font-black text-ink disabled:text-ink/28"
          >
            <ChevronLeft size={18} />
            上一步
          </button>
          {step === budgetSteps.length - 1 ? (
            <button
              type="button"
              onClick={() => setLeadOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-pine px-3 py-3 text-sm font-black leading-tight text-white"
            >
              <WalletCards size={18} />
              提交并保存我的出行计划
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-pine px-4 py-3 font-black text-white"
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
      <section className="screen-card rounded-[22px] p-4">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-pine text-white">
            <Calculator size={20} />
          </span>
          <div>
            <h2 className="text-xl font-black text-ink">{step.title}</h2>
            <p className="text-xs font-bold text-ink/52">填写能确定的数字，不确定可以先留空。</p>
          </div>
        </div>

        {step.choice ? (
          <div className="mb-4">
            <p className="mb-2 text-sm font-black text-ink">{step.choice.label}</p>
            <div className="grid grid-cols-3 gap-2">
              {step.choice.options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => update(step.choice.name, option.value)}
                  className={`rounded-2xl px-3 py-3 text-sm font-black ${
                    draft[step.choice.name] === option.value ? 'bg-pine text-white' : 'bg-mint text-ink/62'
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
              <span className="mb-1.5 block text-sm font-black text-ink">{field.label}</span>
              <div className="relative">
                <input
                  type={field.type === 'number' ? 'number' : 'text'}
                  inputMode={field.type === 'number' ? 'numeric' : undefined}
                  min={field.type === 'number' ? '0' : undefined}
                  value={draft[field.name] ?? ''}
                  onChange={(event) => update(field.name, event.target.value)}
                  placeholder={field.placeholder || '0'}
                  className="w-full rounded-2xl border border-pine/15 bg-mint/70 px-4 py-3 pr-20 text-base font-bold text-ink outline-none focus:border-pine"
                />
                {field.suffix ? (
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-ink/42">
                    {field.suffix}
                  </span>
                ) : null}
              </div>
              {field.help ? <span className="mt-1.5 block text-xs leading-relaxed text-ink/52">{field.help}</span> : null}
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
  return (
    <section className="rounded-[22px] bg-ink p-4 text-white shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-white/58">实时预算预览</p>
          <p className="mt-1 text-sm font-bold text-white/72">当前粗略预算</p>
          <p className="mt-0.5 text-3xl font-black">{formatMoney(result.tripTotal)}</p>
        </div>
        <div className="rounded-2xl bg-white/10 px-3 py-2 text-right">
          <p className="text-[11px] text-white/54">完整度</p>
          <p className="text-base font-black">{result.completenessPercent}%</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <PreviewMetric label="人均约" value={formatMoney(result.perPerson)} />
        <PreviewMetric label="日均约" value={formatMoney(result.dailyAverage)} />
        <PreviewMetric label="押金占用" value={formatMoney(result.temporaryFunds)} />
      </div>
      <p className="mt-3 rounded-2xl bg-white/10 px-3 py-2 text-xs font-bold leading-relaxed text-white/72">
        {result.completenessText}
      </p>
    </section>
  );
}

function PreviewMetric({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 px-3 py-2">
      <p className="text-[11px] font-bold text-white/54">{label}</p>
      <p className="mt-0.5 text-sm font-black">{value}</p>
    </div>
  );
}

function BudgetResult({ result, draft, onOpenLead, onReset }) {
  const feeCards = [
    ['车辆与交通费用', result.vehicleTransport],
    ['住宿餐饮费用', result.lodgingDining],
    ['景区游玩费用', result.scenic],
    ['大交通费用', result.bigTraffic],
    ['其他费用', result.otherFees],
    ['应急预算', result.emergency],
  ];

  return (
    <div className="grid gap-4">
      <section className="rounded-[28px] bg-pine p-5 text-white shadow-soft">
        <p className="text-sm font-bold text-white/70">{draft.destination || '本次自驾'} 预算结果</p>
        <div className="mt-3 rounded-[22px] bg-white/12 p-4">
          <p className="text-sm font-bold text-white/70">本次自驾预计总花费</p>
          <p className="mt-1 text-[42px] font-black leading-none">{formatMoney(result.tripTotal)}</p>
          <p className="mt-3 text-sm font-black leading-relaxed text-white/84">{result.budgetSummary}</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <BigMetric label="人均预算" value={formatMoney(result.perPerson)} />
          <BigMetric label="日均预算" value={formatMoney(result.dailyAverage)} />
        </div>
        <div className="mt-3 rounded-2xl bg-amberSoft p-4 text-[#8a4b14]">
          <p className="text-xs font-bold text-[#8a4b14]/70">出行前建议准备资金，包含押金占用</p>
          <p className="mt-1 text-2xl font-black">{formatMoney(result.preparedFunds)}</p>
        </div>
      </section>

      {result.isRoughEstimate ? (
        <p className="rounded-[18px] bg-amberSoft px-4 py-3 text-sm font-bold leading-relaxed text-[#8a4b14]">
          部分费用未填写，当前结果为粗略估算。
        </p>
      ) : null}

      <section className="screen-card rounded-[22px] p-4">
        <h2 className="mb-3 text-lg font-black text-ink">费用拆分</h2>
        <div className="grid gap-2">
          {feeCards.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3 rounded-2xl bg-mint px-4 py-3">
              <span className="text-sm font-bold text-ink/68">{label}</span>
              <span className="shrink-0 text-base font-black text-ink">{formatMoney(value)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="screen-card rounded-[22px] p-4">
        <h2 className="mb-3 text-lg font-black text-ink">押金与资金准备</h2>
        <div className="grid gap-3">
          <HighlightRow label="临时占用资金" value={formatMoney(result.temporaryFunds)} note="车辆押金 + 违章押金" />
          <HighlightRow label="出行前建议准备资金" value={formatMoney(result.preparedFunds)} note="旅行总预算 + 临时占用资金" />
        </div>
      </section>

      <section className="screen-card rounded-[22px] p-4">
        <h2 className="mb-3 text-lg font-black text-ink">预算判断</h2>
        <div className="rounded-2xl bg-mint p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-ink/62">车辆成本占比</span>
            <span className="text-xl font-black text-pine">{formatPercent(result.vehicleCostRatio)}</span>
          </div>
          <div className="mt-3">
            <ProgressBar value={result.vehicleCostRatio} tone={result.vehicleCostRatio >= 45 ? 'coral' : 'pine'} />
          </div>
          <p className="mt-3 text-sm font-bold leading-relaxed text-ink">
            车辆成本占比 {formatPercent(result.vehicleCostRatio)}，{result.vehicleCostJudgment}
          </p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <BadgeBox label="人均预算等级" value={result.budgetLevel} />
          <BadgeBox label="能源估算" value={formatMoney(result.energyCost)} />
        </div>
      </section>

      <EnergyInfoCard selectedType={draft.energyType} result={result} />

      <section className="rounded-[22px] bg-ink p-4 text-white shadow-soft">
        <h2 className="text-lg font-black">预算优化建议</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-white/82">
          {result.suggestions.map((suggestion) => (
            <li key={suggestion}>• {suggestion}</li>
          ))}
        </ul>
      </section>

      <div className="grid grid-cols-1 gap-3">
        <button
          type="button"
          onClick={onOpenLead}
          className="rounded-2xl bg-pine px-4 py-4 text-base font-black text-white shadow-lg shadow-pine/20"
        >
          提交并保存我的出行计划
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 font-black text-ink shadow-sm"
        >
          <RotateCcw size={17} />
          重新填写
        </button>
      </div>
    </div>
  );
}

function EnergyInfoCard({ selectedType, result, compact = false }) {
  const safeType = selectedType === 'hybrid' ? 'extended' : selectedType || 'oil';
  const current = ENERGY_DEFAULTS[safeType] || ENERGY_DEFAULTS.oil;

  return (
    <section className={`rounded-[22px] bg-skySoft p-4 ${compact ? '' : 'shadow-sm'}`}>
      <div className="flex gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-white text-pine">
          <Info size={18} />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-black text-ink">能源费用估算说明</h2>
          <p className="mt-1 text-xs font-bold leading-relaxed text-ink/62">
            当前选择：{current.label}，按 {current.unitText} 估算，预计能源费用 {formatMoney(result.energyCost)}。
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink/56">公式：{current.formulaText}</p>
          {!compact ? <p className="mt-2 text-xs leading-relaxed text-ink/56">{ENERGY_NOTE}</p> : null}
        </div>
      </div>
    </section>
  );
}

function BigMetric({ label, value, tone }) {
  return (
    <div className={`rounded-2xl px-3 py-3 ${tone === 'warm' ? 'bg-amberSoft text-[#8a4b14]' : 'bg-white/12 text-white'}`}>
      <p className={`text-xs font-bold ${tone === 'warm' ? 'text-[#8a4b14]/64' : 'text-white/60'}`}>{label}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}

function HighlightRow({ label, value, note }) {
  return (
    <div className="rounded-2xl bg-amberSoft p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-[#8a4b14]">{label}</p>
          <p className="mt-1 text-xs font-bold text-[#8a4b14]/70">{note}</p>
        </div>
        <p className="shrink-0 text-xl font-black text-[#8a4b14]">{value}</p>
      </div>
    </div>
  );
}

function BadgeBox({ label, value }) {
  return (
    <div className="rounded-2xl bg-skySoft p-4">
      <p className="text-xs font-bold text-ink/54">{label}</p>
      <p className="mt-1 text-lg font-black text-ink">{value}</p>
    </div>
  );
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
