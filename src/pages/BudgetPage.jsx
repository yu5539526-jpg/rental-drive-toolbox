import {
  ArrowLeft,
  BatteryCharging,
  Calculator,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Fuel,
  Image,
  Info,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import BottomActionBar, { BottomActionButton } from '../components/BottomActionBar.jsx';
import LeadCaptureModal from '../components/LeadCaptureModal.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import TopBar from '../components/TopBar.jsx';
import { ENERGY_DEFAULTS, ENERGY_NOTE } from '../constants/energyDefaults.js';
import { budgetSteps, defaultBudgetDraft } from '../data/budgetFields.js';
import { calculateBudget, formatMoney, formatPercent } from '../utils/budget.js';

const STORAGE_KEY = 'rentalDrive.budgetDraft';
const SELECTED_PLAN_STORAGE_KEY = 'rentalDrive.selectedRentalPlan';
const ENERGY_CARD_META = {
  oil: {
    icon: Fuel,
    title: '油车',
    description: '适合长途、偏远路线和补能不确定场景',
  },
  electric: {
    icon: BatteryCharging,
    title: '新能源',
    description: '适合城市周边、充电条件明确的路线',
  },
  extended: {
    icon: Zap,
    title: '增程',
    description: '兼顾电驱体验和长途补能安全感',
  },
};

export default function BudgetPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState(loadBudgetDraft);
  const [selectedPlan, setSelectedPlan] = useState(loadSelectedRentalPlan);
  const [leadOpen, setLeadOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [cardStatus, setCardStatus] = useState('');
  const [feedback, setFeedback] = useState('填写任意费用后，预算结果会立刻同步刷新。');
  const prefillAppliedRef = useRef(false);
  const result = useMemo(() => calculateBudget(draft), [draft]);
  const currentStep = budgetSteps[step];
  const progress = Math.round(((step + 1) / budgetSteps.length) * 100);

  useEffect(() => {
    if (prefillAppliedRef.current) return;

    const incomingPlan = normalizeSelectedRentalPlan(location.state?.priceComparePlan);
    const prefillTotal = Number(location.state?.prefillRentalPlatformTotal ?? incomingPlan?.totalPrice);
    if (!incomingPlan && (!Number.isFinite(prefillTotal) || prefillTotal <= 0)) return;

    prefillAppliedRef.current = true;

    if (incomingPlan) {
      setSelectedPlan(incomingPlan);
      localStorage.setItem(SELECTED_PLAN_STORAGE_KEY, JSON.stringify(incomingPlan));
    }

    if (Number.isFinite(prefillTotal) && prefillTotal > 0) {
      setDraft((current) => ({
        ...current,
        rentalPlatformTotal: String(Math.round(prefillTotal)),
      }));
      setStep(1);
    }

    const planText = incomingPlan
      ? `${incomingPlan.platform}｜${incomingPlan.carModel}｜${incomingPlan.insurancePlan}｜${formatMoney(incomingPlan.totalPrice)}`
      : formatMoney(prefillTotal);
    setFeedback(`已带入租车方案：${planText}，可继续补充其他预算信息。`);
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

  const clearSelectedPlan = () => {
    setSelectedPlan(null);
    localStorage.removeItem(SELECTED_PLAN_STORAGE_KEY);
    setFeedback('已清除租车方案信息，已填写的预算金额和其他信息会保留。');
  };

  const openLead = () => {
    setFeedback('请确认隐私提示后提交，提交成功后会显示已保存。');
    setLeadOpen(true);
  };

  const openBudgetCard = () => {
    if (!hasBudgetCardBase(draft, result)) {
      setCardStatus('先填写基础信息和主要费用，再生成适合截图的预算卡。');
      return;
    }

    setCardStatus('');
    setCardOpen(true);
  };

  const resultSnapshot = {
    input: draft,
    result,
    selectedRentalPlan: selectedPlan,
  };

  return (
    <main className="min-h-screen bg-cream">
      <TopBar title={step === budgetSteps.length - 1 ? '预算结果' : '自驾预算计算器'} />

      <section className="sticky top-14 z-10 bg-cream/92 px-4 py-3 backdrop-blur">
        <StepProgressCard step={step} total={budgetSteps.length} progress={progress} currentStep={currentStep} />
      </section>

      <section className="page-pad px-4 pt-4">
        {selectedPlan ? (
          <SelectedRentalPlanCard
            plan={selectedPlan}
            currentTotal={draft.rentalPlatformTotal || selectedPlan.totalPrice}
            onBack={() => navigate('/price-compare')}
            onClear={clearSelectedPlan}
          />
        ) : null}
        {step === budgetSteps.length - 1 ? (
          <BudgetResult
            result={result}
            draft={draft}
            selectedPlan={selectedPlan}
            cardStatus={cardStatus}
            onReset={reset}
            onEdit={goPrev}
          />
        ) : (
          <BudgetFormStep step={currentStep} stepIndex={step} draft={draft} result={result} update={update} />
        )}
      </section>

      <BottomActionBar layout="double">
        {step === budgetSteps.length - 1 ? (
          <>
            <BottomActionButton type="button" variant="secondary" className="text-xs" onClick={openLead}>
              保存到出行计划
            </BottomActionButton>
            <BottomActionButton type="button" onClick={openBudgetCard}>
              <Image size={18} />
              生成预算卡
            </BottomActionButton>
          </>
        ) : (
          <>
            <BottomActionButton type="button" variant="secondary" onClick={goPrev} disabled={step === 0}>
              <ChevronLeft size={18} />
              上一步
            </BottomActionButton>
            <BottomActionButton type="button" onClick={goNext}>
              {step === budgetSteps.length - 2 ? '查看结果' : '下一步'}
              <ChevronRight size={18} />
            </BottomActionButton>
          </>
        )}
      </BottomActionBar>

      <BudgetCardModal open={cardOpen} onClose={() => setCardOpen(false)} result={result} draft={draft} selectedPlan={selectedPlan} />

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

function StepProgressCard({ step, total, progress, currentStep }) {
  return (
    <div className="rounded-[24px] border border-pine/10 bg-card/95 p-4 shadow-card">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="rounded-full bg-aquaCard px-3 py-1.5 text-sm font-bold text-pine">
          第 {step + 1} 步 / 共 {total} 步
        </span>
        <span className="text-sm font-bold text-muted">{progress}%</span>
      </div>
      <h1 className="text-[20px] font-bold leading-tight text-ink">{currentStep.title}</h1>
      <p className="mt-2 text-sm font-medium leading-relaxed text-muted">{currentStep.hint}</p>
      <div className="mt-4">
        <ProgressBar value={progress} />
      </div>
    </div>
  );
}

function SelectedRentalPlanCard({ plan, currentTotal, onBack, onClear }) {
  return (
    <section className="mb-4 rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-muted">已选租车方案</p>
          <h2 className="mt-1 text-lg font-bold leading-tight text-ink">
            {plan.platform}｜{plan.carModel}
          </h2>
        </div>
        <span className="shrink-0 rounded-full bg-aquaCard px-3 py-1.5 text-xs font-bold text-pine">已带入</span>
      </div>
      <div className="mt-3 grid gap-2 rounded-2xl bg-aquaCard px-3 py-3 text-sm font-medium leading-relaxed text-ink">
        <p>平台：{plan.platform}</p>
        <p>车型：{plan.carModel}</p>
        <p>保险：{plan.insurancePlan}</p>
        <p className="font-bold text-pine">含保险租车总价：{formatMoney(currentTotal || plan.totalPrice)}</p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-card px-3 text-sm font-bold text-pine ring-1 ring-pine/15"
        >
          返回修改方案
        </button>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-aquaCard px-3 text-sm font-bold text-pine"
        >
          清除已选方案
        </button>
      </div>
    </section>
  );
}

function BudgetFormStep({ step, stepIndex, draft, result, update }) {
  const isBasicStep = stepIndex === 0;

  return (
    <div className="grid gap-4">
      {isBasicStep ? (
        <BasicInfoStep step={step} draft={draft} update={update} />
      ) : (
        <StandardBudgetFields step={step} draft={draft} update={update} />
      )}

      {stepIndex === 0 ? <EnergyInfoCard selectedType={draft.energyType} result={result} compact /> : null}
      <BudgetPreview result={result} draft={draft} />
    </div>
  );
}

function BasicInfoStep({ step, draft, update }) {
  const textFields = step.fields.filter((field) => ['destination', 'departureCity'].includes(field.name));
  const routeFields = step.fields.filter((field) => ['tripDays', 'people', 'rentalDays', 'mileage'].includes(field.name));

  return (
    <div className="grid gap-5">
      <FieldGroup title="能源类型" compact>
        <EnergyTypeCards choice={step.choice} value={draft[step.choice.name]} onChange={(value) => update(step.choice.name, value)} />
      </FieldGroup>

      <FieldGroup title="基础行程">
        <div className="grid gap-4">
          {textFields.map((field) => (
            <BudgetInputField key={field.name} field={field} value={draft[field.name]} onChange={(value) => update(field.name, value)} />
          ))}
        </div>
      </FieldGroup>

      <FieldGroup title="里程与天数">
        <div className="grid grid-cols-2 gap-3">
          {routeFields.map((field) => (
            <BudgetInputField key={field.name} field={field} value={draft[field.name]} onChange={(value) => update(field.name, value)} />
          ))}
        </div>
      </FieldGroup>
    </div>
  );
}

function EnergyTypeCards({ choice, value, onChange }) {
  if (!choice) return null;

  return (
    <div>
      <div className="grid gap-3">
        {choice.options.map((option) => {
          const meta = ENERGY_CARD_META[option.value] || { icon: Zap, title: option.label, description: '' };
          const Icon = meta.icon;
          const active = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`flex min-h-[76px] items-center gap-3 rounded-[20px] border px-3.5 py-3 text-left transition hover:-translate-y-0.5 active:scale-[0.99] ${
                active
                  ? 'border-pine bg-gradient-to-r from-[#356F67] to-[#4A8F83] text-lightText shadow-lg shadow-pine/15'
                  : 'border-pine/10 bg-card text-ink shadow-sm hover:border-pine/25 hover:bg-aquaCard'
              }`}
            >
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
                  active ? 'bg-white/15 text-lightText' : 'bg-aquaCard text-pine'
                }`}
              >
                <Icon size={22} />
              </span>
              <span className="min-w-0">
                <span className="block text-base font-bold leading-tight">{meta.title}</span>
                <span className={`mt-1 block text-xs font-medium leading-relaxed ${active ? 'text-white/80' : 'text-muted'}`}>
                  {meta.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FieldGroup({ title, children, compact = false }) {
  return (
    <section className={`rounded-[24px] border border-pine/10 bg-card ${compact ? 'p-3.5' : 'p-4'} shadow-card`}>
      <h3 className="mb-3 text-sm font-bold text-ink">{title}</h3>
      {children}
    </section>
  );
}

function StandardBudgetFields({ step, draft, update }) {
  if (step.groups?.length) {
    const fieldsByName = new Map(step.fields.map((field) => [field.name, field]));

    return (
      <div className="grid gap-4">
        {step.groups.map((group) => {
          const fields = group.fields.map((name) => fieldsByName.get(name)).filter(Boolean);

          return (
            <FieldGroup key={group.title} title={group.title}>
              <div className="grid gap-3">
                {fields.map((field) => (
                  <BudgetInputField key={field.name} field={field} value={draft[field.name]} onChange={(value) => update(field.name, value)} />
                ))}
              </div>
            </FieldGroup>
          );
        })}
        <p className="rounded-2xl bg-amberSoft/45 px-3 py-2.5 text-xs font-bold leading-relaxed text-[#735B16] ring-1 ring-warning/20">
          没填的费用会按 0 计算，结果适合作为粗略估算。
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {step.fields.map((field) => (
        <BudgetInputField key={field.name} field={field} value={draft[field.name]} onChange={(value) => update(field.name, value)} />
      ))}
    </div>
  );
}

function BudgetInputField({ field, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold leading-tight text-ink">{field.label}</span>
      <div className="relative">
        <input
          type={field.type === 'number' ? 'number' : 'text'}
          inputMode={field.type === 'number' ? 'numeric' : undefined}
          min={field.type === 'number' ? '0' : undefined}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder || '0'}
          className={`h-12 w-full rounded-[16px] border border-pine/15 bg-aquaCard/70 px-3.5 text-[15px] font-semibold text-ink outline-none transition placeholder:text-muted/55 focus:border-pine focus:bg-card focus:ring-2 focus:ring-pine/10 ${
            field.suffix ? 'pr-14' : ''
          }`}
        />
        {field.suffix ? (
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted">
            {field.suffix}
          </span>
        ) : null}
      </div>
      {field.help ? <span className="mt-1.5 block text-xs leading-relaxed text-muted">{field.help}</span> : null}
    </label>
  );
}

function BudgetPreview({ result, draft }) {
  const hasBudget = result.tripTotal > 0;
  const hasPartialInfo = hasBudgetPreviewInput(draft);

  if (!hasBudget) {
    return (
      <section className="rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
        <div className="flex gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-aquaCard text-pine">
            <Calculator size={19} />
          </span>
          <div>
            <p className="text-sm font-bold text-ink">预算预览</p>
            <p className="mt-1 text-sm font-medium leading-relaxed text-muted">
              {hasPartialInfo ? '继续补充里程和费用后，预算会更准确。' : '填写上方信息后，将自动生成预算预览。'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-ink">当前预估</p>
          <p className="mt-1 text-xs font-medium leading-relaxed text-muted">
            {result.completenessPercent < 40 ? '继续补充里程和费用后，预算会更准确。' : result.completenessText}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-aquaCard px-3 py-1.5 text-xs font-bold text-pine">{result.completenessPercent}%</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <PreviewMetric label="当前预估总预算" value={formatMoney(result.tripTotal)} strong />
        <PreviewMetric label="人均预算" value={formatMoney(result.perPerson)} />
        <PreviewMetric label="日均预算" value={formatMoney(result.dailyAverage)} />
        <PreviewMetric label="押金占用" value={formatMoney(result.temporaryFunds)} muted />
      </div>
    </section>
  );
}

function PreviewMetric({ label, value, strong, muted }) {
  return (
    <div className={`rounded-2xl px-3 py-2.5 ${strong ? 'bg-gradient-to-r from-[#356F67] to-[#4A8F83] text-lightText' : muted ? 'bg-amberSoft/45 text-ink' : 'bg-aquaCard text-ink'}`}>
      <p className={`text-[11px] font-bold ${strong ? 'text-white/75' : 'text-muted'}`}>{label}</p>
      <p className={`mt-0.5 text-base font-bold ${strong ? 'text-lightText' : 'text-ink'}`}>{value}</p>
    </div>
  );
}

function hasBudgetPreviewInput(draft) {
  const textFields = ['destination', 'departureCity'];
  const moneyOrRouteFields = [
    'mileage',
    'rentalPlatformTotal',
    'tolls',
    'parking',
    'carWash',
    'vehicleDeposit',
    'violationDeposit',
    'hotelNightPrice',
    'breakfast',
    'lunch',
    'dinner',
    'snacks',
    'specialMeals',
    'ticket',
    'shuttle',
    'cableway',
    'entertainment',
    'roundTripTransit',
    'cityTransport',
    'shopping',
    'gear',
    'other',
  ];

  return (
    textFields.some((field) => String(draft[field] || '').trim()) ||
    moneyOrRouteFields.some((field) => {
      const value = Number(draft[field]);
      return Number.isFinite(value) && value > 0;
    })
  );
}

function BudgetResult({ result, draft, selectedPlan, cardStatus, onReset, onEdit }) {
  const [copyStatus, setCopyStatus] = useState('');
  const feeCards = [
    ['车辆与交通费用', result.vehicleTransport],
    ['住宿餐饮费用', result.lodgingDining],
    ['景区游玩费用', result.scenic],
    ['大交通费用', result.bigTraffic],
    ['其他费用', result.otherFees],
  ];
  const splitTotal = Math.max(feeCards.reduce((total, [, value]) => total + value, 0), 1);
  const budgetReport = buildBudgetReport(result);

  const copyBudgetResult = async () => {
    const text = buildBudgetCopyText(result, draft, selectedPlan);
    const ok = await copyText(text);
    setCopyStatus(ok ? '预算结果已复制，可以粘贴到备忘录或聊天里。' : '复制失败，可以稍后再试。');
  };

  return (
    <div className="grid gap-4">
      <ResultHeroCard result={result} draft={draft} />

      <ResultRentalPlanCard selectedPlan={selectedPlan} currentTotal={draft.rentalPlatformTotal || selectedPlan?.totalPrice} />

      {result.isRoughEstimate ? (
        <p className="rounded-[18px] bg-amberSoft/45 px-4 py-3 text-sm font-bold leading-relaxed text-[#735B16] ring-1 ring-warning/20">
          部分费用未填写，当前结果为粗略估算。
        </p>
      ) : null}

      <section className="screen-card rounded-[24px] p-4">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-muted">消费结构图</p>
            <h2 className="mt-1 text-lg font-bold text-ink">费用拆分</h2>
          </div>
          <span className="shrink-0 rounded-full bg-aquaCard px-3 py-1.5 text-xs font-bold text-pine">不含押金</span>
        </div>
        <div className="grid gap-3.5">
          {feeCards.map(([label, value]) => (
            <FeeSplitRow key={label} label={label} value={value} percent={Math.min(100, Math.round((value / splitTotal) * 100))} />
          ))}
        </div>
      </section>

      <BudgetLevelPanel report={budgetReport} result={result} />

      <EnergyInfoCard selectedType={draft.energyType} result={result} />

      <BudgetTipsCard suggestions={result.suggestions} />

      <section className="rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
        <h2 className="text-lg font-bold text-ink">分享和保存</h2>
        <p className="mt-1 text-sm font-medium leading-relaxed text-muted">生成预算卡适合截图发给同行人，文字版适合复制到聊天或备忘录。</p>
        <div className="mt-4 grid gap-2">
          <ResultActionButton onClick={copyBudgetResult} icon={<Copy size={18} />}>
            复制预算结果
          </ResultActionButton>
          <ResultActionButton onClick={onEdit} icon={<ChevronLeft size={17} />}>
            返回修改预算
          </ResultActionButton>
          <ResultActionButton onClick={onReset} icon={<RotateCcw size={17} />}>
            重新填写
          </ResultActionButton>
        </div>
        {copyStatus ? <p className="mt-2 text-center text-xs font-bold text-muted">{copyStatus}</p> : null}
        {cardStatus ? <p className="mt-2 text-center text-xs font-bold text-[#735B16]">{cardStatus}</p> : null}
      </section>

      <p className="rounded-2xl bg-aquaCard px-4 py-3 text-xs font-medium leading-relaxed text-muted">
        结果仅供出行前估算，实际价格以租车平台、酒店、景区和路况为准。
      </p>
    </div>
  );
}

function ResultHeroCard({ result, draft }) {
  return (
    <section className="rounded-[24px] bg-gradient-to-b from-[#356F67] to-[#4A8F83] p-5 text-lightText shadow-[0_12px_32px_rgba(34,82,71,0.12)]">
      <p className="text-sm font-bold text-white/70">{draft.destination || '本次自驾'}</p>
      <h2 className="mt-1 text-xl font-bold">本次自驾预算结果</h2>
      <div className="mt-5">
        <p className="text-xs font-bold text-white/65">预计总花费</p>
        <p className="mt-1 text-[48px] font-bold leading-none tracking-normal">{formatMoney(result.tripTotal)}</p>
        <p className="mt-2 text-xs font-medium leading-relaxed text-white/70">不含押金占用，押金会影响出发前资金准备。</p>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <ResultMetric label="人均预算" value={formatMoney(result.perPerson)} />
        <ResultMetric label="日均预算" value={formatMoney(result.dailyAverage)} />
        <ResultMetric label="押金占用" value={formatMoney(result.temporaryFunds)} subtle />
        <ResultMetric label="出行前建议准备资金" value={formatMoney(result.preparedFunds)} wide />
      </div>
    </section>
  );
}

function ResultMetric({ label, value, subtle = false, wide = false }) {
  return (
    <div className={`rounded-2xl px-3 py-3 ${wide ? 'col-span-2' : ''} ${subtle ? 'bg-amberSoft/45 text-ink' : 'bg-white/12 text-lightText'}`}>
      <p className={`text-[11px] font-bold ${subtle ? 'text-muted' : 'text-white/65'}`}>{label}</p>
      <p className={`mt-1 text-lg font-bold leading-tight ${subtle ? 'text-ink' : 'text-lightText'}`}>{value}</p>
    </div>
  );
}

function ResultRentalPlanCard({ selectedPlan, currentTotal }) {
  if (!selectedPlan) {
    return (
      <section className="rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
        <p className="text-sm font-bold text-ink">本次租车方案</p>
        <p className="mt-1 text-sm font-medium leading-relaxed text-muted">还没选择租车方案，可以先去“租车方案对比”看不同平台价格。</p>
        <Link
          to="/price-compare"
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-aquaCard px-4 text-sm font-bold text-pine"
        >
          去对比租车方案
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
      <p className="text-sm font-bold text-muted">本次租车方案</p>
      <h3 className="mt-1 break-words text-lg font-bold leading-tight text-ink">
        {selectedPlan.platform}｜{selectedPlan.carModel}｜{selectedPlan.insurancePlan}
      </h3>
      <div className="mt-3 rounded-2xl bg-aquaCard px-3 py-3">
        <p className="text-xs font-bold text-muted">含保险租车总价</p>
        <p className="mt-1 text-xl font-bold text-pine">{formatMoney(currentTotal || selectedPlan.totalPrice)}</p>
      </div>
    </section>
  );
}

function BudgetLevelPanel({ report, result }) {
  return (
    <section className="screen-card rounded-[24px] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-muted">预算等级</p>
          <h2 className="mt-1 text-lg font-bold text-ink">人均日预算判断</h2>
        </div>
        <span className="shrink-0 rounded-full bg-amberSoft/45 px-3 py-1.5 text-xs font-bold text-[#735B16] ring-1 ring-warning/20">{report.level}</span>
      </div>
      <p className="mt-3 text-sm font-medium leading-relaxed text-muted">{report.message}</p>
      <div className="mt-4 rounded-2xl bg-aquaCard p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-bold text-muted">车辆成本占比</span>
          <span className="text-xl font-bold text-pine">{formatPercent(result.vehicleCostRatio)}</span>
        </div>
        <div className="mt-3">
          <ProgressBar value={result.vehicleCostRatio} tone={result.vehicleCostRatio >= 45 ? 'coral' : 'pine'} />
        </div>
        <p className="mt-3 text-sm font-medium leading-relaxed text-ink">
          {result.vehicleCostJudgment}
        </p>
      </div>
    </section>
  );
}

function BudgetTipsCard({ suggestions }) {
  const defaultTips = [
    '租车和住宿通常是主要支出，可以优先对比不同平台和车型。',
    '押金不是实际消费，但会影响出发前资金准备。',
    '多人出行建议提前把人均预算发给同行人确认。',
  ];
  const tips = suggestions?.length ? suggestions : defaultTips;

  return (
    <section className="rounded-[24px] border border-pine/10 bg-aquaCard p-4 shadow-card">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-2xl bg-card text-base">💡</span>
        <h2 className="text-lg font-bold text-ink">预算优化建议</h2>
      </div>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed text-muted">
        {tips.map((suggestion) => (
          <li key={suggestion} className="rounded-2xl bg-card/75 px-3 py-2.5">
            {suggestion}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ResultActionButton({ children, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-card px-4 text-sm font-bold text-pine ring-1 ring-pine/15"
    >
      {icon}
      {children}
    </button>
  );
}

function BudgetCardModal({ open, onClose, result, draft, selectedPlan }) {
  const [copyStatus, setCopyStatus] = useState('');
  const cardData = useMemo(() => buildBudgetCardData(result, draft), [result, draft]);

  if (!open) return null;

  const copyCardText = async () => {
    const ok = await copyText(buildBudgetCopyText(result, draft, selectedPlan));
    setCopyStatus(ok ? '文字版预算卡已复制。' : '复制失败，可以稍后再试。');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 px-4 sm:items-center">
      <div className="flex max-h-[94vh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[28px] bg-card shadow-soft sm:rounded-[28px]">
        <div className="grid h-14 shrink-0 grid-cols-[44px_minmax(0,1fr)_44px] items-center border-b border-[rgba(47,122,109,0.08)] bg-card/95 px-3 backdrop-blur">
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-full text-pine"
            aria-label="返回预算结果"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="truncate px-2 text-center text-[17px] font-bold leading-tight text-ink">我的自驾预算卡</h2>
          <span className="h-11 w-11" aria-hidden="true" />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pb-4">
          <div className="mx-4 mt-4 rounded-2xl bg-aquaCard px-3 py-2 text-center text-xs font-bold leading-relaxed text-pine">
            适合截图保存或发给同行人。
          </div>

          <div className="mx-auto mt-3 w-[calc(100%-2rem)] max-w-[390px] overflow-hidden rounded-[24px] border border-pine/10 bg-gradient-to-br from-cream via-aquaCard to-amberSoft/45 shadow-[0_12px_32px_rgba(34,82,71,0.12)]">
            <div className="bg-gradient-to-b from-[#356F67] to-[#4A8F83] px-5 pb-5 pt-4 text-lightText">
              <p className="text-xs font-bold text-white/70">pYuY 租车自驾工具箱</p>
              <h3 className="mt-2 text-2xl font-bold leading-tight">我的自驾预算卡</h3>
              <div className="mt-5 rounded-[20px] bg-white/12 px-4 py-3">
                <p className="text-xs font-bold text-white/65">预计总花费</p>
                <p className="mt-1 text-[44px] font-bold leading-none tracking-normal">{formatMoney(result.tripTotal)}</p>
                <p className="mt-2 text-xs font-medium leading-relaxed text-white/80">押金不算实际花费，但会影响出发前准备资金。</p>
              </div>
            </div>

            <div className="grid gap-3.5 p-4">
              <section className="rounded-[20px] bg-white/88 p-3 ring-1 ring-pine/10">
                <h4 className="mb-3 text-sm font-bold text-ink">行程信息</h4>
                <div className="grid grid-cols-2 gap-2">
                  {cardData.baseInfo.map(([label, value]) => (
                    <InfoCell key={label} label={label} value={value} />
                  ))}
                </div>
              </section>

              {selectedPlan ? (
                <section className="rounded-[20px] bg-white/88 p-3 ring-1 ring-pine/10">
                  <h4 className="text-sm font-bold text-ink">本次租车方案</h4>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <InfoCell label="平台" value={selectedPlan.platform} />
                    <InfoCell label="车型" value={selectedPlan.carModel} />
                    <InfoCell label="保险" value={selectedPlan.insurancePlan} />
                    <InfoCell label="租车总价" value={formatMoney(draft.rentalPlatformTotal || selectedPlan.totalPrice)} strong />
                  </div>
                </section>
              ) : null}

              <section className="rounded-[20px] bg-white/88 p-3 ring-1 ring-pine/10">
                <h4 className="mb-3 text-sm font-bold text-ink">核心金额</h4>
                <div className="grid grid-cols-2 gap-2">
                  <MoneyCell label="人均预算" value={formatMoney(result.perPerson)} />
                  <MoneyCell label="日均预算" value={formatMoney(result.dailyAverage)} />
                  <MoneyCell label="押金占用" value={formatMoney(result.temporaryFunds)} muted />
                  <MoneyCell label="建议准备资金" value={formatMoney(result.preparedFunds)} strong />
                </div>
              </section>

              <section className="rounded-[20px] bg-white/88 p-3 ring-1 ring-pine/10">
                <h4 className="text-sm font-bold text-ink">费用拆分</h4>
                <div className="mt-3 grid gap-2.5">
                  {cardData.feeCards.map(([label, value]) => (
                    <BudgetCardFeeRow
                      key={label}
                      label={label}
                      value={value}
                      percent={Math.min(100, Math.round((value / cardData.splitTotal) * 100))}
                    />
                  ))}
                </div>
              </section>

              <section className="rounded-[20px] bg-white/88 p-3 ring-1 ring-pine/10">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold text-muted">预算等级</p>
                  <span className="shrink-0 rounded-full bg-amberSoft/45 px-3 py-1.5 text-xs font-bold text-[#735B16] ring-1 ring-warning/20">{cardData.level}</span>
                </div>
                <p className="mt-2 text-sm font-medium leading-relaxed text-muted">{cardData.judgment}</p>
              </section>

              <section className="rounded-[20px] bg-white/80 p-3 text-center ring-1 ring-pine/10">
                <p className="text-lg font-bold leading-tight text-ink">你觉得这个预算能接受吗？</p>
                <p className="mt-2 text-xs font-medium leading-relaxed text-muted">
                  结果仅供出行前估算，实际价格以租车平台、酒店、景区和路况为准。
                </p>
                <p className="mt-2 text-[11px] font-bold text-pine">来自 pYuY 租车自驾工具箱</p>
              </section>
            </div>
          </div>

          <p className="mx-4 mt-3 rounded-2xl bg-aquaCard px-3 py-2 text-center text-xs font-bold leading-relaxed text-pine">
            可以截图保存或复制文字版。
          </p>
          {copyStatus ? <p className="mx-4 mt-2 text-center text-xs font-bold text-muted">{copyStatus}</p> : null}
        </div>

        <div className="modal-bottom-action grid shrink-0 grid-cols-2 gap-3 px-4 pt-3">
          <BottomActionButton type="button" variant="secondary" onClick={copyCardText}>
            <Copy size={18} />
            复制文字版
          </BottomActionButton>
          <BottomActionButton type="button" onClick={onClose}>
            <CheckCircle2 size={17} />
            我已截图保存
          </BottomActionButton>
        </div>
      </div>
    </div>
  );
}

function InfoCell({ label, value, strong = false }) {
  return (
    <div className="rounded-2xl bg-aquaCard px-3 py-2">
      <p className="text-[11px] font-bold text-muted">{label}</p>
      <p className={`mt-0.5 break-words text-sm font-bold leading-tight ${strong ? 'text-pine' : 'text-ink'}`}>{value || '未填写'}</p>
    </div>
  );
}

function MoneyCell({ label, value, muted = false, strong = false }) {
  return (
    <div className={`rounded-2xl px-3 py-2 ${muted ? 'bg-amberSoft/45' : strong ? 'bg-pine text-lightText' : 'bg-aquaCard'}`}>
      <p className={`text-[11px] font-bold ${strong ? 'text-white/70' : 'text-muted'}`}>{label}</p>
      <p className={`mt-0.5 text-base font-bold leading-tight ${strong ? 'text-lightText' : 'text-ink'}`}>{value}</p>
    </div>
  );
}

function BudgetCardFeeRow({ label, value, percent }) {
  const isEmpty = Number(value) <= 0;
  const isLow = !isEmpty && percent < 8;

  return (
    <div className={isEmpty ? 'opacity-55' : ''}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-muted">{label}</span>
        <span className="shrink-0 text-sm font-bold text-ink">{formatMoney(value)}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-aquaCard">
        <div className={`h-full rounded-full ${isEmpty ? 'bg-muted/30' : isLow ? 'bg-mint' : 'bg-pine'}`} style={{ width: `${isEmpty ? 4 : Math.max(percent, 6)}%` }} />
      </div>
    </div>
  );
}

function EnergyInfoCard({ selectedType, result, compact = false }) {
  const [open, setOpen] = useState(false);
  const safeType = selectedType === 'hybrid' ? 'extended' : selectedType || 'oil';
  const current = ENERGY_DEFAULTS[safeType] || ENERGY_DEFAULTS.oil;
  const rules = ['oil', 'electric', 'extended'].map((type) => ENERGY_DEFAULTS[type]);

  return (
    <section className={`rounded-[24px] bg-aquaCard p-4 ring-1 ring-pine/10 ${compact ? '' : 'shadow-sm'}`}>
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full gap-3 text-left" aria-expanded={open}>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-card text-pine">
          <Info size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-ink">能源费用估算说明</h2>
          <p className="mt-1 text-xs font-medium leading-relaxed text-muted">
            当前按通用经验值估算，点击查看计算规则
          </p>
        </div>
        <ChevronDown size={18} className={`mt-2 shrink-0 text-pine transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
        <div className="mt-4 grid gap-2.5">
          <p className="rounded-2xl bg-card px-3 py-2 text-xs font-bold leading-relaxed text-pine">
            当前选择：{current.label}，预计能源费用 {formatMoney(result.energyCost)}。
          </p>
          {rules.map((rule) => (
            <div key={rule.label} className="rounded-2xl bg-card px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-ink">{rule.label}</p>
                <p className="shrink-0 text-xs font-bold text-muted">{rule.unitText}</p>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted">公式：{rule.formulaText}</p>
            </div>
          ))}
          {!compact ? <p className="text-xs leading-relaxed text-muted">{ENERGY_NOTE}</p> : null}
        </div>
      ) : null}
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
  const isEmpty = Number(value) <= 0;
  const isLow = !isEmpty && percent < 8;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-muted">{label}</span>
        <span className="shrink-0 text-base font-bold text-ink">{formatMoney(value)}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-aquaCard">
        <div
          className={`h-full rounded-full transition-all duration-300 ${isEmpty ? 'bg-muted/30' : isLow ? 'bg-mint' : 'bg-pine'}`}
          style={{ width: `${isEmpty ? 4 : Math.max(percent, 6)}%` }}
        />
      </div>
    </div>
  );
}

function HighlightRow({ label, value, note }) {
  return (
    <div className="rounded-2xl bg-amberSoft/45 p-4 ring-1 ring-warning/20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#735B16]">{label}</p>
          <p className="mt-1 text-xs font-medium text-[#735B16]/75">{note}</p>
        </div>
        <p className="shrink-0 text-xl font-bold text-[#735B16]">{value}</p>
      </div>
    </div>
  );
}

function BadgeBox({ label, value }) {
  return (
    <div className="rounded-2xl bg-aquaCard p-4">
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
  const report = buildBudgetReport(result);

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
    level: report.level,
    judgment: report.message,
  };
}

function buildBudgetReport(result) {
  const feeCards = [
    ['车辆与交通', result.vehicleTransport],
    ['住宿餐饮', result.lodgingDining],
    ['景区游玩', result.scenic],
    ['大交通', result.bigTraffic],
    ['其他', result.otherFees],
  ];
  const level = getBudgetCardLevel(result.perPersonDaily);
  const dominantLabels = [...feeCards]
    .filter(([, value]) => Number(value) > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([label]) => label);
  const dominant = dominantLabels.length ? dominantLabels.join('与') : '车辆与住宿';

  return {
    level,
    message: `这趟行程预算比较均衡，${dominant}是主要支出，适合正常自驾出游，也方便提前和同行人确认。`,
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

function buildBudgetCopyText(result, draft, selectedPlan) {
  const lines = [
    '我的自驾预算结果：',
    `目的地：${draft.destination || '未填写'}`,
    `出发城市：${draft.departureCity || '未填写'}`,
    `出行天数：${result.tripDays} 天`,
    `出行人数：${result.people} 人`,
    `租车天数：${Number(draft.rentalDays) || result.tripDays} 天`,
    `能源类型：${result.energyLabel || '未填写'}`,
    '',
  ];

  if (selectedPlan) {
    lines.push(
      '租车方案：',
      `平台：${selectedPlan.platform}`,
      `车型：${selectedPlan.carModel}`,
      `保险：${selectedPlan.insurancePlan}`,
      `含保险租车总价：${formatMoney(draft.rentalPlatformTotal || selectedPlan.totalPrice)}`,
      '',
    );
  }

  lines.push(
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
    '来自 pYuY 租车自驾决策工具箱',
  );

  return lines.join('\n');
}

function normalizeSelectedRentalPlan(plan) {
  if (!plan || typeof plan !== 'object') return null;

  const platform = String(plan.platform || '').trim();
  const carModel = String(plan.carModel || '').trim();
  const insurancePlan = String(plan.insurancePlan || '').trim();
  const totalPrice = Math.round(Number(plan.totalPrice));

  if (!platform || !carModel || !insurancePlan || !Number.isFinite(totalPrice) || totalPrice <= 0) {
    return null;
  }

  return {
    platform,
    carModel,
    insurancePlan,
    totalPrice,
  };
}

function loadSelectedRentalPlan() {
  try {
    return normalizeSelectedRentalPlan(JSON.parse(localStorage.getItem(SELECTED_PLAN_STORAGE_KEY) || 'null'));
  } catch {
    return null;
  }
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
