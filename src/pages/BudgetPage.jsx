import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Image,
  Info,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import BottomActionBar, { BottomActionButton } from '../components/BottomActionBar.jsx';
import { submitBudgetSnapshotToBackend } from '../services/submitBudgetSnapshotToBackend.js';
import { loadBudgetSnapshot, saveBudgetSnapshot } from '../utils/budgetSnapshot.js';
import ProgressBar from '../components/ProgressBar.jsx';
import TopBar from '../components/TopBar.jsx';
import { ENERGY_DEFAULTS, ENERGY_NOTE } from '../constants/energyDefaults.js';
import { budgetSteps, defaultBudgetDraft } from '../data/budgetFields.js';
import { calculateBudget, formatMoney, formatPercent } from '../utils/budget.js';
import { findInsurancePlan, getTierLabel, isBasicPlan, INSURANCE_DISCLAIMER } from '../utils/insuranceUtils.js';

const STORAGE_KEY = 'rentalDrive.budgetDraft';
const SELECTED_PLAN_STORAGE_KEY = 'rentalDrive.selectedRentalPlan';
export default function BudgetPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState(loadBudgetDraft);
  const [selectedPlan, setSelectedPlan] = useState(loadSelectedRentalPlan);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [cardOpen, setCardOpen] = useState(false);
  const [cardStatus, setCardStatus] = useState('');
  const [feedback, setFeedback] = useState('填写任意费用后，预算结果会立刻同步刷新。');
  const prefillAppliedRef = useRef(false);
  const lastSavedRef = useRef(null);
  const result = useMemo(() => calculateBudget(draft, selectedPlan), [draft, selectedPlan]);
  const hasUnsavedChanges = useMemo(() => {
    const current = JSON.stringify({ draft, selectedPlan });
    if (lastSavedRef.current === null) {
      return current !== JSON.stringify({ draft: defaultBudgetDraft, selectedPlan: null });
    }
    return lastSavedRef.current !== current;
  }, [draft, selectedPlan]);
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
    if (prefillAppliedRef.current) return;
    const snapshot = loadBudgetSnapshot();
    if (!snapshot) return;
    prefillAppliedRef.current = true;

    lastSavedRef.current = JSON.stringify({ draft: snapshot.draft, selectedPlan: snapshot.selectedPlan });

    const { energyType, ...snapshotDraft } = snapshot.draft || {};

    setDraft({
      ...defaultBudgetDraft,
      ...snapshotDraft,
    });

    if (snapshot.selectedPlan) {
      setSelectedPlan(snapshot.selectedPlan);
      localStorage.setItem(SELECTED_PLAN_STORAGE_KEY, JSON.stringify(snapshot.selectedPlan));
    }

    setFeedback('已恢复上次保存的预算数据，可继续修改或查看结果。');
  }, []);

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

  const handleSave = () => {
    saveBudgetSnapshot(draft, result, selectedPlan);
    submitBudgetSnapshotToBackend({ draft, result, selectedPlan, updatedAt: new Date().toISOString() });
    lastSavedRef.current = JSON.stringify({ draft, selectedPlan });
    setSaveStatus('saved');
    setFeedback('已保存，下次打开网页可以继续查看。');
    setTimeout(() => setSaveStatus('idle'), 1500);
  };

  const openBudgetCard = () => {
    if (!hasBudgetCardBase(draft, result)) {
      setCardStatus('先填写基础信息和主要费用，再生成适合截图的预算卡。');
      return;
    }

    setCardStatus('');
    setCardOpen(true);
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
            <BottomActionButton type="button" variant="secondary" className={`text-xs ${hasUnsavedChanges ? 'bg-aquaCard ring-pine/25' : 'text-pine/70'}`} onClick={handleSave} disabled={saveStatus === 'saved'}>
              {saveStatus === 'saved' ? '已保存' : '保存，下次继续看'}
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

      {step === budgetSteps.length - 1 ? (
        <p className="mx-4 mb-28 mt-3 text-center text-[11px] font-medium leading-relaxed text-muted/55 sm:mb-6">
          点击保存即表示你了解：本次预算信息会保存到本机，并提交给 pyUY 用于工具优化和需求分析，不收集手机号、身份证等敏感信息。
        </p>
      ) : null}
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

      <BudgetPreview result={result} draft={draft} />
    </div>
  );
}

function BasicInfoStep({ step, draft, update }) {
  const textFields = step.fields.filter((field) => ['destination', 'departureCity'].includes(field.name));
  const routeFields = step.fields.filter((field) => ['tripDays', 'people', 'rentalDays', 'mileage'].includes(field.name));

  return (
    <div className="grid gap-5">
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
        <p className="rounded-2xl bg-amberSoft/45 px-3 py-2.5 text-xs font-bold leading-relaxed text-amberDark ring-1 ring-warning/20">
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
    <div className={`rounded-2xl px-3 py-2.5 ${strong ? 'bg-gradient-to-r from-[#174B63] to-[#1E6B8A] text-lightText' : muted ? 'bg-amberSoft/45 text-ink' : 'bg-aquaCard text-ink'}`}>
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
        <p className="rounded-[18px] bg-amberSoft/45 px-4 py-3 text-sm font-bold leading-relaxed text-amberDark ring-1 ring-warning/20">
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

      <EnergyInfoCard result={result} />

      <BudgetTipsCard suggestions={result.suggestions} />

      <InsuranceRiskCard selectedPlan={selectedPlan} />

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
        {cardStatus ? <p className="mt-2 text-center text-xs font-bold text-amberDark">{cardStatus}</p> : null}
      </section>

      <p className="rounded-2xl bg-aquaCard px-4 py-3 text-xs font-medium leading-relaxed text-muted">
        结果仅供出行前估算，实际价格以租车平台、酒店、景区和路况为准。
      </p>
    </div>
  );
}

function ResultHeroCard({ result, draft }) {
  return (
    <section className="rounded-[24px] bg-gradient-to-b from-[#174B63] to-[#1E6B8A] p-5 text-lightText shadow-[0_12px_32px_rgba(18,50,63,0.12)]">
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
        <span className="shrink-0 rounded-full bg-amberSoft/45 px-3 py-1.5 text-xs font-bold text-amberDark ring-1 ring-warning/20">{report.level}</span>
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
        <div className="grid h-14 shrink-0 grid-cols-[44px_minmax(0,1fr)_44px] items-center border-b border-pine/10 bg-card/95 px-3 backdrop-blur">
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
            可使用手机截长图保存，也可以发给同行人。
          </div>

          <div className="mx-auto mt-3 w-[calc(100%-2rem)] max-w-[390px] overflow-hidden rounded-[24px] border border-pine/10 bg-gradient-to-br from-cream via-aquaCard to-amberSoft/45 shadow-[0_12px_32px_rgba(18,50,63,0.12)]">
            <div className="bg-gradient-to-b from-[#174B63] to-[#1E6B8A] px-5 pb-5 pt-4 text-lightText">
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
                  <span className="shrink-0 rounded-full bg-amberSoft/45 px-3 py-1.5 text-xs font-bold text-amberDark ring-1 ring-warning/20">{cardData.level}</span>
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
            建议使用手机截长图保存完整预算卡，或复制文字版。
          </p>
          {copyStatus ? <p className="mx-4 mt-2 text-center text-xs font-bold text-muted">{copyStatus}</p> : null}
        </div>

        <div className="modal-bottom-action grid shrink-0 grid-cols-1 gap-3 px-4 pt-3">
          <BottomActionButton type="button" onClick={copyCardText}>
            <Copy size={18} />
            复制文字版
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

function EnergyInfoCard({ result, compact = false }) {
  const [open, setOpen] = useState(false);
  const safeType = result.energyType || 'oil';
  const current = ENERGY_DEFAULTS[safeType] || ENERGY_DEFAULTS.oil;
  const rules = ['oil', 'electric', 'extended'].map((type) => ENERGY_DEFAULTS[type]);
  const usesVehicleEnergy = result.energySource === 'vehicle' && result.matchedVehicleName;
  const summaryText = usesVehicleEnergy
    ? `已按${result.matchedVehicleName}的车型能耗估算，点击查看计算规则`
    : '未匹配到具体车型时按通用经验值估算，点击查看计算规则';
  const currentLabel = usesVehicleEnergy ? result.energyLabel : current.label;
  const currentUnitText = usesVehicleEnergy ? result.energyUnitText : current.unitText;
  const currentFormulaText = usesVehicleEnergy ? result.energyFormulaText : current.formulaText;

  return (
    <section className={`rounded-[24px] bg-aquaCard p-4 ring-1 ring-pine/10 ${compact ? '' : 'shadow-sm'}`}>
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full gap-3 text-left" aria-expanded={open}>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-card text-pine">
          <Info size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-ink">能源费用估算说明</h2>
          <p className="mt-1 text-xs font-medium leading-relaxed text-muted">{summaryText}</p>
        </div>
        <ChevronDown size={18} className={`mt-2 shrink-0 text-pine transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
        <div className="mt-4 grid gap-2.5">
          <p className="rounded-2xl bg-card px-3 py-2 text-xs font-bold leading-relaxed text-pine">
            {usesVehicleEnergy ? `当前匹配：${result.matchedVehicleName}（${currentLabel}）` : `通用估算：${currentLabel}`}，预计能源费用 {formatMoney(result.energyCost)}。
          </p>
          {usesVehicleEnergy ? (
            <div className="rounded-2xl bg-card px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-ink">具体车型</p>
                <p className="shrink-0 text-xs font-bold text-muted">{currentUnitText}</p>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted">公式：{currentFormulaText}</p>
            </div>
          ) : (
            rules.map((rule) => (
              <div key={rule.label} className="rounded-2xl bg-card px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-ink">{rule.label}</p>
                  <p className="shrink-0 text-xs font-bold text-muted">{rule.unitText}</p>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted">公式：{rule.formulaText}</p>
              </div>
            ))
          )}
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
          <p className="text-sm font-bold text-amberDark">{label}</p>
          <p className="mt-1 text-xs font-medium text-amberDark/75">{note}</p>
        </div>
        <p className="shrink-0 text-xl font-bold text-amberDark">{value}</p>
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
  const energyLabel = result.matchedVehicleName
    ? `${result.energyLabel} · ${result.matchedVehicleName}`
    : result.energyLabel;

  return {
    baseInfo: [
      ['目的地', draft.destination],
      ['出发城市', draft.departureCity],
      ['出行天数', `${result.tripDays} 天`],
      ['出行人数', `${result.people} 人`],
      ['租车天数', `${Number(draft.rentalDays) || result.tripDays} 天`],
      ['能源类型', energyLabel],
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
  const energyEstimateText = result.matchedVehicleName
    ? `按${result.matchedVehicleName}估算（${result.energyUnitText}）`
    : `按通用经验值估算（${result.energyUnitText}）`;
  const lines = [
    '我的自驾预算结果：',
    `目的地：${draft.destination || '未填写'}`,
    `出发城市：${draft.departureCity || '未填写'}`,
    `出行天数：${result.tripDays} 天`,
    `出行人数：${result.people} 人`,
    `租车天数：${Number(draft.rentalDays) || result.tripDays} 天`,
    `能源类型：${result.energyLabel || '未填写'}`,
    `能源估算：${energyEstimateText}`,
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
    const { energyType, ...draftWithoutLegacyEnergyType } = parsed;
    const migratedTotal =
      Number(parsed.rentalPlatformTotal) > 0
        ? parsed.rentalPlatformTotal
        : legacyRentalTotal(parsed);

    return {
      ...defaultBudgetDraft,
      ...draftWithoutLegacyEnergyType,
      rentalPlatformTotal: migratedTotal || defaultBudgetDraft.rentalPlatformTotal,
    };
  } catch {
    return defaultBudgetDraft;
  }
}

/* ========================================================================
   保险风险提示卡片
   ======================================================================== */

function InsuranceRiskCard({ selectedPlan }) {
  const matched = useMemo(() => {
    if (!selectedPlan || !selectedPlan.platform || !selectedPlan.insurancePlan) return null;
    return findInsurancePlan(selectedPlan.platform, selectedPlan.insurancePlan);
  }, [selectedPlan]);

  const isBasic = matched ? isBasicPlan(matched) : null;

  return (
    <section className="rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
      <div className="flex items-center gap-2">
        <ShieldAlert size={18} className="text-amberDark" />
        <h2 className="text-lg font-bold text-ink">保险与意外支出提醒</h2>
      </div>

      {matched ? (
        <div className="mt-3 grid gap-2.5">
          {/* 基础保障提示 */}
          {isBasic ? (
            <>
              <div className="rounded-2xl bg-amberSoft/35 px-3 py-2.5 ring-1 ring-warning/15">
                <p className="text-xs font-bold text-amberDark">基础保障 · 建议预留意外备用金</p>
                <p className="mt-1 text-xs leading-relaxed text-ink">
                  如果选择{matched.platform}「{matched.name}」，建议额外预留一笔小额车损自付备用金（该方案车损{matched.vehicleDamage?.customerPay || '请以下单页为准'}）。如果路线包含山路、碎石路或长途，建议重点核对轮胎/轮毂、停运费和折旧/贬值。
                </p>
              </div>
              {/* 关键缺口 */}
              <div className="flex flex-wrap gap-1">
                {matched.tireWheel?.covered === false ? (
                  <span className="rounded-full bg-coral/10 px-2 py-0.5 text-[10px] font-bold text-coral">车轮不覆盖</span>
                ) : null}
                {matched.downtime?.covered === false ? (
                  <span className="rounded-full bg-coral/10 px-2 py-0.5 text-[10px] font-bold text-coral">停运费不覆盖</span>
                ) : null}
                {matched.depreciation?.covered === false ? (
                  <span className="rounded-full bg-coral/10 px-2 py-0.5 text-[10px] font-bold text-coral">可能承担折旧费</span>
                ) : null}
                {matched.advancePayment?.required === true ? (
                  <span className="rounded-full bg-amberSoft/35 px-2 py-0.5 text-[10px] font-bold text-amberDark">需垫付费用</span>
                ) : null}
              </div>
            </>
          ) : (
            /* 中高保障提示 */
            <div className="rounded-2xl bg-mint/50 px-3 py-2.5 ring-1 ring-pine/10">
              <p className="text-xs font-bold text-pine">
                {getTierLabel(matched)} · 降低意外支出，但不等于所有情况都赔
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink">
                {matched.platform}「{matched.name}」通常能降低车损自付和停运/贬值风险，但仍需核对免责条款、报案流程和材料要求。酒驾、涉水后二次启动、未及时报案、无证驾驶、非约定用途等通常不赔。
              </p>
            </div>
          )}

          {/* 方案关键风险 */}
          {matched.keyWarnings?.length ? (
            <div className="rounded-xl bg-coral/5 px-2.5 py-2">
              <p className="text-[10px] font-bold text-coral">该方案风险提示</p>
              <ul className="mt-0.5 space-y-0.5">
                {matched.keyWarnings.slice(0, 3).map((w, i) => (
                  <li key={i} className="text-[10px] leading-relaxed text-muted">{w}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : selectedPlan ? (
        /* 已选择方案但未识别 */
        <div className="mt-3 rounded-2xl bg-aquaCard/60 px-3 py-2.5">
          <p className="text-xs leading-relaxed text-ink">
            当前预算已包含「{selectedPlan.insurancePlan}」方案。下单前建议至少核对：车损自付额、三者额度、轮胎轮毂、停运费、折旧/贬值、司乘保障。
          </p>
        </div>
      ) : (
        /* 未选择任何方案 */
        <div className="mt-3 rounded-2xl bg-aquaCard/60 px-3 py-2.5">
          <p className="text-xs leading-relaxed text-ink">
            当前预算未拆分保险费用。下单前建议至少核对：车损自付额、三者额度、轮胎轮毂、停运费、折旧/贬值、司乘保障。
          </p>
          <Link
            to="/price-compare"
            className="mt-2 inline-flex min-h-9 items-center justify-center gap-1.5 rounded-2xl bg-pine px-3 py-1.5 text-[11px] font-bold text-white"
          >
            去比租车方案
            <ChevronRight size={13} />
          </Link>
        </div>
      )}

      <p className="mt-3 text-[10px] font-medium leading-relaxed text-muted/70">
        保险价格会随城市、车型、供应商、渠道和下单页变化，本工具不估算保险价格，具体费用以下单页为准。
      </p>
    </section>
  );
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
