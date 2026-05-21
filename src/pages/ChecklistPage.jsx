import { Armchair, Camera, Car, ChevronDown, ChevronRight, ChevronUp, CircleDot, Gauge, Lightbulb, ShieldCheck, Sparkles, Video, WalletCards } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import BottomActionBar, { BottomActionButton } from '../components/BottomActionBar.jsx';
import LeadCaptureModal from '../components/LeadCaptureModal.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import SegmentedControl from '../components/SegmentedControl.jsx';
import TopBar from '../components/TopBar.jsx';
import {
  STATUS_OPTIONS,
  allChecklistItems,
  checklistModules,
  flatChecklistItems,
  flatQuickChecklistItems,
  quickChecklistModules,
} from '../data/checklist.js';
import { INSURANCE_PLATFORMS } from '../data/insurancePlans.js';
import {
  getPlatformInsurancePlans,
  getChecklistInsuranceTips,
  INSURANCE_DISCLAIMER,
} from '../utils/insuranceUtils.js';

const STORAGE_KEY = 'rentalDrive.checklistState';
const MODE_STORAGE_KEY = 'rentalDrive.checklistMode';

const statusStyles = {
  unchecked: {
    active: 'bg-card text-muted shadow-sm ring-1 ring-pine/10',
    card: 'ring-pine/10',
    badge: 'bg-aquaCard text-muted ring-pine/10',
  },
  ok: {
    active: 'bg-pine text-white shadow-sm',
    card: 'ring-pine/20',
    badge: 'bg-mint text-pine ring-pine/15',
  },
  issue: {
    active: 'bg-coral/10 text-coral shadow-sm ring-1 ring-coral/20',
    card: 'ring-coral/25',
    badge: 'bg-coral/10 text-coral ring-coral/15',
  },
  na: {
    active: 'bg-aquaCard text-muted shadow-sm',
    card: 'ring-pine/8',
    badge: 'bg-aquaCard text-muted ring-pine/10',
  },
};

const riskStyles = {
  建议补拍: {
    badge: 'bg-amberSoft/45 text-amberDark ring-1 ring-warning/20',
    tone: 'amber',
    label: '建议补拍',
  },
  继续补齐: {
    badge: 'bg-amberSoft/45 text-amberDark ring-1 ring-warning/20',
    tone: 'amber',
    label: '继续补齐',
  },
  留证充分: {
    badge: 'bg-mint text-pine ring-1 ring-pine/20',
    tone: 'pine',
    label: '留证充分',
  },
};

const riskAdvice = {
  建议补拍: '出发前顺手拍一遍，先补齐车身视频、轮胎、轮毂、玻璃和仪表盘。',
  继续补齐: '大部分项目已完成，再补齐几个易遗漏项，还车沟通会更轻松。',
  留证充分: '关键照片和视频留得不错，后续还车更有依据。',
};

const issueStatusHint = '发现划痕、收费不一致或规则说不清时，点“需拍照留证”：拍近照/截图，并让门店写进验车单或订单备注。';

const quickItemIcons = {
  bodyVideo: Video,
  quickBumpers: Car,
  quickWheelRims: CircleDot,
  quickTires: CircleDot,
  quickWindshield: Camera,
  quickMirrorsLights: Lightbulb,
  quickInteriorSeats: Armchair,
  quickEnergyMileage: Gauge,
};

export default function ChecklistPage() {
  const [state, setState] = useState(loadChecklistState);
  const [mode, setMode] = useState(loadChecklistMode);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const [feedback, setFeedback] = useState('点选状态后，完成度和提醒会实时更新。');
  const summaryRef = useRef(null);

  // 保险差异化提醒：平台/方案选择
  const [insurancePlatform, setInsurancePlatform] = useState(() => loadLastInsurancePlatform());
  const [insurancePlanName, setInsurancePlanName] = useState(() => loadLastInsurancePlanName());
  const [insuranceTipsOpen, setInsuranceTipsOpen] = useState(false);
  const platformPlans = useMemo(
    () => (insurancePlatform ? getPlatformInsurancePlans(insurancePlatform) : null),
    [insurancePlatform],
  );
  const insuranceTips = useMemo(
    () => (insurancePlatform ? getChecklistInsuranceTips(insurancePlatform, insurancePlanName) : null),
    [insurancePlatform, insurancePlanName],
  );

  const handleSelectPlatform = (platformName) => {
    setInsurancePlatform(platformName === insurancePlatform ? '' : platformName);
    setInsurancePlanName('');
  };

  const handleSelectPlan = (planName) => {
    setInsurancePlanName(planName === insurancePlanName ? '' : planName);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  }, [mode]);

  const currentModules = mode === 'quick' ? quickChecklistModules : checklistModules;
  const currentItems = mode === 'quick' ? flatQuickChecklistItems : flatChecklistItems;
  const stats = useMemo(() => getChecklistStats(currentItems, state), [currentItems, state]);
  const summary = useMemo(
    () => (summaryVisible ? buildSummary(currentItems, state, stats) : null),
    [currentItems, state, stats, summaryVisible],
  );
  const riskStyle = riskStyles[stats.riskLevel];

  const updateStatus = (itemId, status) => {
    setState((current) => ({ ...current, [itemId]: status }));
    const item = currentItems.find((currentItem) => currentItem.id === itemId);
    const option = STATUS_OPTIONS.find((currentOption) => currentOption.value === status);
    setFeedback(`已将「${item?.title || '留证项'}」标记为「${option?.label || '已更新'}」。`);
  };

  const generateSummary = () => {
    setSummaryVisible(true);
    setFeedback('已生成本次取车留证摘要。');
    window.setTimeout(() => {
      summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const updateMode = (nextMode) => {
    setMode(nextMode);
    setFeedback(nextMode === 'quick' ? '已切换到省心版：8 项必拍。' : '已切换到认真版：完整检查。');
  };

  const openLead = () => {
    setFeedback('请确认隐私提示后提交，提交成功后会显示已保存。');
    setLeadOpen(true);
  };

  const resultSnapshot = summary || buildSummary(currentItems, state, stats);

  return (
    <main className="min-h-screen bg-cream">
      <TopBar title="取车留证清单" />

      <section className="mx-4 mt-3 rounded-2xl bg-gradient-to-r from-[#174B63] to-[#1E6B8A] px-4 py-3.5 text-white shadow-md shadow-pine/15">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/20">
            <Sparkles size={17} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-snug">本功能已升级为「车身验车避坑图」</p>
            <p className="mt-1 text-xs font-medium leading-relaxed text-white/80">
              全新的互动式车身验车工具，点击车身部位即可查看检查重点和避坑提醒。
            </p>
            <Link
              to="/car-inspection-map"
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-2xl bg-white/20 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/30 transition-colors"
            >
              去体验新版
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section className="page-pad px-4 pt-4">
        <IntroCard />
        <InsuranceChecklistSection
          platform={insurancePlatform}
          planName={insurancePlanName}
          platformPlans={platformPlans}
          tips={insuranceTips}
          tipsOpen={insuranceTipsOpen}
          onToggleTips={() => setInsuranceTipsOpen((v) => !v)}
          onSelectPlatform={handleSelectPlatform}
          onSelectPlan={handleSelectPlan}
        />
        <ModeSwitch mode={mode} setMode={updateMode} />
        <RealtimeFeedback stats={stats} riskStyle={riskStyle} />
        <p className="mb-4 mt-3 rounded-2xl bg-aquaCard px-3 py-2 text-xs font-bold leading-relaxed text-pine" role="status" aria-live="polite">
          {feedback}
        </p>

        <div className="grid gap-5">
          {currentModules.map((module, moduleIndex) => {
            const moduleStats = getModuleStats(module.items, state);
            return (
              <section key={module.id} className="fade-up">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-muted">模块 {String(moduleIndex + 1).padStart(2, '0')}</p>
                    <h2 className="text-[19px] font-bold leading-tight text-ink">{module.title}</h2>
                  </div>
                  <span className="shrink-0 rounded-full bg-card px-3 py-1 text-xs font-bold text-muted shadow-sm ring-1 ring-pine/10">
                    {moduleStats.completed}/{moduleStats.activeTotal}
                  </span>
                </div>

                <div className="grid gap-4">
                  {module.items.map((item) => (
                    <ChecklistItem key={item.id} item={item} value={state[item.id]} onUpdate={updateStatus} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <section className="mt-6 rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
          <p className="text-xs font-bold text-muted">留证完成后</p>
          <h2 className="mt-1 text-lg font-bold text-ink">生成本次取车留证摘要</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
          汇总已完成项目、还没确认项目、需拍照留证项目和待补拍内容，方便后面保存或复盘。
          </p>
        </section>

        {summary ? (
          <div ref={summaryRef} className="mt-5 scroll-mt-32">
            <SummaryCard summary={summary} />
          </div>
        ) : null}
      </section>

      <BottomActionBar layout="double">
        <BottomActionButton type="button" variant="secondary" className="text-xs" onClick={openLead}>
          <WalletCards size={17} />
          保存到出行计划
        </BottomActionButton>
        <BottomActionButton type="button" onClick={generateSummary}>
            <Sparkles size={17} />
            生成留证摘要
        </BottomActionButton>
      </BottomActionBar>

      <LeadCaptureModal
        open={leadOpen}
        onClose={() => setLeadOpen(false)}
        resultType="checklist"
        resultSnapshot={resultSnapshot}
      />
    </main>
  );
}

function IntroCard() {
  return (
    <section className="mb-4 rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
      <div className="flex items-start gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[20px] bg-aquaCard text-xl" aria-hidden="true">
          📸
        </span>
        <div className="min-w-0">
          <h1 className="text-xl font-bold leading-tight text-ink">取车留证清单</h1>
          <p className="mt-1.5 text-sm font-medium leading-relaxed text-muted">买了保险也建议拍一遍，关键照片别漏掉。</p>
          <p className="mt-2 rounded-2xl bg-amberSoft/45 px-3 py-2 text-xs font-bold leading-relaxed text-amberDark ring-1 ring-warning/20">
            高保障方案通常会更省心，但取车时保留关键照片和视频，仍然能减少还车沟通成本。
          </p>
        </div>
      </div>
    </section>
  );
}

function ChecklistItem({ item, value, onUpdate }) {
  const currentStatus = STATUS_OPTIONS.find((option) => option.value === value) || STATUS_OPTIONS[0];
  const currentStyle = statusStyles[value] || statusStyles.unchecked;
  const Icon = quickItemIcons[item.id];

  return (
    <article className={`rounded-[22px] border border-pine/10 bg-card p-4 shadow-card transition-colors duration-200 ${currentStyle.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          {Icon ? (
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-aquaCard text-pine">
              <Icon size={19} />
            </span>
          ) : null}
          <div className="min-w-0">
            <h3 className="text-base font-bold leading-snug text-ink">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.advice}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <RiskPill item={item} />
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${currentStyle.badge}`}>
            {currentStatus.label}
          </span>
        </div>
      </div>
      <SegmentedControl
        options={STATUS_OPTIONS}
        value={currentStatus.value}
        onChange={(nextValue) => onUpdate(item.id, nextValue)}
        columns={4}
        ariaLabel={`${item.title}状态`}
        className="mt-4"
        optionClassName="min-h-10 px-1 text-[12px]"
        getOptionClassName={(option, active) =>
          active ? statusStyles[option.value].active : 'text-muted/70 hover:bg-card/70 hover:text-ink'
        }
      />
      <p className="mt-2 rounded-2xl bg-aquaCard px-3 py-2 text-[11px] font-bold leading-relaxed text-muted">
        {issueStatusHint}
      </p>
    </article>
  );
}

function RealtimeFeedback({ stats, riskStyle }) {
  const needRetake = stats.highUnfinished;

  return (
    <div className="mb-4 rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-muted">本次留证进度</p>
          <h2 className="mt-1 text-lg font-bold text-ink">已完成 {stats.completed} / {stats.activeTotal} 项</h2>
        </div>
        <div className="text-right">
          <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${riskStyle.badge}`}>{stats.percent}%</span>
          <p className="mt-1 text-[11px] font-bold text-muted">{stats.percent}% 完成</p>
        </div>
      </div>
      <ProgressBar value={stats.percent} tone="pine" />

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Metric label="已完成" value={`${stats.completed}/${stats.activeTotal}`} />
        <Metric label="需留证" value={`${stats.issueCount} 项`} danger={stats.issueCount > 0} />
        <Metric label="待补拍" value={`${needRetake} 项`} danger={needRetake > 0} />
      </div>

      <p className="mt-3 rounded-2xl bg-aquaCard px-3 py-2 text-xs font-bold leading-relaxed text-pine">{riskAdvice[stats.riskLevel]}</p>
    </div>
  );
}

function ModeSwitch({ mode, setMode }) {
  const options = [
    { value: 'quick', label: '省心版：8 项必拍' },
    { value: 'detail', label: '认真版：完整检查' },
  ];
  const description =
    mode === 'quick'
      ? '适合大多数平台租车场景，几分钟拍完关键位置。'
      : '适合基础保障、夜间取车、长途自驾、异地还车或路线复杂的情况。';

  return (
    <div className="mb-4">
      <SegmentedControl
        options={options}
        value={mode}
        onChange={setMode}
        columns={2}
        ariaLabel="清单模式"
        className="rounded-[18px] bg-aquaCard p-1.5"
        optionClassName="min-h-11 rounded-2xl px-2 text-[13px]"
        getOptionClassName={(_option, active) => (active ? 'bg-pine text-lightText shadow-sm' : 'text-muted hover:bg-card/70 hover:text-ink')}
      />
      <p className="mt-2 rounded-2xl bg-card px-3 py-2 text-xs font-bold leading-relaxed text-muted shadow-sm ring-1 ring-pine/10">
        {description}
      </p>
    </div>
  );
}

function ActionLine({ title, text, danger }) {
  return (
    <div className={`rounded-2xl px-3 py-2 ${danger ? 'bg-coral/10' : 'bg-mint'}`}>
      <p className={`text-[11px] font-bold ${danger ? 'text-coral' : 'text-muted'}`}>{title}</p>
      <p className="mt-1 text-xs font-medium leading-relaxed text-ink">{text}</p>
    </div>
  );
}

function Metric({ label, value, danger }) {
  return (
    <div className="rounded-2xl bg-aquaCard px-2 py-2 text-center">
      <div className={`text-base font-bold ${danger ? 'text-coral' : 'text-pine'}`}>{value}</div>
      <div className="mt-0.5 text-[11px] font-bold text-muted">{label}</div>
    </div>
  );
}

function RiskPill({ item }) {
  const label = getRiskTag(item);
  const className =
    label === '容易遗漏'
      ? 'bg-amberSoft/45 text-amberDark ring-warning/20'
      : label === '建议确认'
        ? 'bg-aquaCard text-pine ring-pine/10'
        : label === '关键留证'
          ? 'bg-mint/80 text-pine ring-pine/15'
        : label === '方便核对'
            ? 'bg-aquaCard text-pine ring-pine/10'
            : 'bg-aquaCard text-muted ring-pine/10';

  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${className}`}>{label}</span>;
}

function getRiskTag(item) {
  if (item.risk === '高') {
    if (/deposit|fee|settlement|fuel|insurance|deductible|returnFuel|coverage|license|contract|driver/i.test(item.id)) return '建议确认';
    if (/video|body|bumper|tire|wheel|glass|mirror|light|interior|seat|dashboard|mileage|energy|windshield/i.test(item.id)) return '关键留证';
    return '方便核对';
  }

  if (item.risk === '中') {
    if (/tool|time|point|spare|charging|parking|belongings|overTime/i.test(item.id)) return '容易遗漏';
    return '方便核对';
  }

  return '容易遗漏';
}

function SummaryCard({ summary }) {
  return (
    <section className="rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-2xl bg-aquaCard text-pine">
          <Camera size={18} />
        </span>
        <h2 className="text-lg font-bold text-ink">本次取车留证摘要</h2>
      </div>
      <div className="mt-3 rounded-2xl bg-aquaCard p-3 text-sm font-bold leading-relaxed text-ink">
        <p>你已经完成 {summary.completedCount} 项留证。</p>
        <p className="mt-1">仍有 {summary.remainingAdviceCount} 项建议补拍。</p>
        <p className="mt-1">有 {summary.issueCount} 项被标记为需要拍照留证。</p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-aquaCard p-3">
          <p className="text-xs font-bold text-muted">留证完成度</p>
          <p className="mt-1 text-2xl font-bold text-pine">{summary.completion}</p>
        </div>
        <div className="rounded-2xl bg-amberSoft/45 p-3 ring-1 ring-warning/20">
          <p className="text-xs font-bold text-amberDark/75">留证提醒</p>
          <p className="mt-1 text-lg font-bold text-amberDark">{riskStyles[summary.riskLevel].label}</p>
        </div>
      </div>
      <SummaryList title="建议补拍项目" empty="暂无建议补拍项目" items={summary.unfinishedHighRisk} tone="warm" />
      <SummaryList title="需拍照留证项目" empty="暂无需拍照留证项目" items={summary.issueItems} tone="danger" />
      <div className="mt-3 rounded-2xl bg-aquaCard p-3">
        <p className="text-xs font-bold text-muted">下一步怎么处理</p>
        <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink">
          {summary.suggestions.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </div>
      <p className="mt-3 rounded-2xl bg-mint px-3 py-2 text-xs font-bold leading-relaxed text-pine">
        建议在还车前保留好照片、视频和平台沟通记录。
      </p>
    </section>
  );
}

function SummaryList({ title, empty, items, tone = 'default' }) {
  const hasItems = items.length > 0;
  const toneClass =
    tone === 'danger' && hasItems
      ? 'bg-coral/10 text-coral'
      : tone === 'warm' && hasItems
        ? 'bg-amberSoft/45 text-amberDark'
        : 'bg-aquaCard text-ink';

  return (
    <div className={`mt-3 rounded-2xl p-3 ${toneClass}`}>
      <p className="text-xs font-bold opacity-75">{title}</p>
      <p className="mt-2 text-sm font-medium leading-relaxed">{hasItems ? items.join('、') : empty}</p>
    </div>
  );
}

/* ========================================================================
   保险差异化拍摄提醒
   ======================================================================== */

/** 从比价页 localStorage 读取最近一次选择的平台 */
function loadLastInsurancePlatform() {
  try {
    const plans = JSON.parse(localStorage.getItem('rentalDrive.priceComparePlans') || '[]');
    if (!Array.isArray(plans) || !plans.length) return '';
    const last = plans[plans.length - 1];
    const result = getPlatformInsurancePlans(last.platform);
    return result ? result.platform.name : '';
  } catch {
    return '';
  }
}

/** 从比价页 localStorage 读取最近一次选择的保险方案 */
function loadLastInsurancePlanName() {
  try {
    const plans = JSON.parse(localStorage.getItem('rentalDrive.priceComparePlans') || '[]');
    if (!Array.isArray(plans) || !plans.length) return '';
    const last = plans[plans.length - 1];
    return last.insurancePlan || '';
  } catch {
    return '';
  }
}

function InsuranceChecklistSection({
  platform,
  planName,
  platformPlans,
  tips,
  tipsOpen,
  onToggleTips,
  onSelectPlatform,
  onSelectPlan,
}) {
  return (
    <section className="mt-4 rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
      <button
        type="button"
        onClick={onToggleTips}
        className="flex w-full items-center gap-3 text-left"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-mint text-pine">
          <ShieldCheck size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold leading-tight text-ink">根据保险方案补充拍摄重点</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {platform ? `${platform}${planName ? ` · ${planName}` : ''}` : '选择平台和保险方案后，显示差异化拍摄提醒'}
          </p>
        </div>
        {tipsOpen ? (
          <ChevronUp size={18} className="shrink-0 text-pine" />
        ) : (
          <ChevronDown size={18} className="shrink-0 text-pine" />
        )}
      </button>

      {tipsOpen ? (
        <div className="mt-4 border-t border-pine/10 pt-4">
          {/* 平台选择 */}
          <p className="text-[11px] font-bold text-muted">选择平台</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {INSURANCE_PLATFORMS.map((p) => {
              const active = platform === p.name;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectPlatform(p.name)}
                  className={`min-h-8 rounded-full px-3 py-1 text-[11px] font-bold leading-tight transition active:scale-[0.97] ${
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

          {/* 保险方案选择 */}
          {platformPlans ? (
            <div className="mt-3">
              <p className="text-[11px] font-bold text-muted">{platform}保险方案</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {platformPlans.plans.map((plan) => {
                  const active = planName === plan.name;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => onSelectPlan(plan.name)}
                      className={`min-h-8 rounded-full px-2.5 py-1 text-[11px] font-bold leading-tight transition active:scale-[0.97] ${
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
          ) : null}

          {/* 差异化拍摄提醒 */}
          {tips ? (
            <div className="mt-3 rounded-2xl bg-aquaCard/60 px-3 py-3">
              <p className="text-[11px] font-bold text-pine">建议重点拍</p>
              <div className="mt-2 grid gap-2">
                {tips.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-xl bg-card/80 px-2.5 py-2">
                    <Camera size={13} className="mt-0.5 shrink-0 text-pine" />
                    <p className="text-xs font-medium leading-relaxed text-ink">{item}</p>
                  </div>
                ))}
              </div>

              {tips.notice ? (
                <div className="mt-2.5 rounded-xl bg-amberSoft/35 px-2.5 py-2">
                  <p className="text-[11px] font-bold text-amberDark">特别提醒</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-ink">{tips.notice}</p>
                </div>
              ) : null}

              {tips.planSpecific?.keyWarnings?.length ? (
                <div className="mt-2 rounded-xl bg-coral/5 px-2.5 py-2">
                  <p className="text-[10px] font-bold text-coral">该方案风险提示</p>
                  <ul className="mt-1 space-y-0.5">
                    {tips.planSpecific.keyWarnings.slice(0, 3).map((w, i) => (
                      <li key={i} className="text-[10px] leading-relaxed text-muted">{w}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : platform ? (
            <div className="mt-3 rounded-2xl bg-aquaCard/40 px-3 py-2.5">
              <p className="text-xs font-medium leading-relaxed text-muted">
                请选择一个保险方案，查看针对该方案的差异化拍摄提醒。
              </p>
            </div>
          ) : null}

          <p className="mt-3 text-[10px] font-medium leading-relaxed text-muted/70">
            {INSURANCE_DISCLAIMER}
          </p>
        </div>
      ) : null}
    </section>
  );
}

function createInitialState() {
  return Object.fromEntries(allChecklistItems.map((item) => [item.id, 'unchecked']));
}

function loadChecklistState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return { ...createInitialState(), ...parsed };
  } catch {
    return createInitialState();
  }
}

function loadChecklistMode() {
  try {
    const saved = localStorage.getItem(MODE_STORAGE_KEY);
    return saved === 'detail' ? 'detail' : 'quick';
  } catch {
    return 'quick';
  }
}

function getChecklistStats(items, state) {
  const total = items.length;
  const notApplicable = items.filter((item) => state[item.id] === 'na').length;
  const activeTotal = Math.max(total - notApplicable, 0);
  const completed = items.filter((item) => ['ok', 'issue'].includes(state[item.id])).length;
  const unchecked = items.filter((item) => state[item.id] === 'unchecked').length;
  const issueItems = items.filter((item) => state[item.id] === 'issue').map((item) => item.title);
  const percent = activeTotal ? Math.round((completed / activeTotal) * 100) : 100;
  const highUnfinishedItems = items
    .filter((item) => item.risk === '高' && state[item.id] === 'unchecked')
    .map((item) => item.title);
  const highUnfinished = highUnfinishedItems.length;
  const issueCount = issueItems.length;
  const riskLevel =
    highUnfinished > 0
      ? '建议补拍'
      : percent < 70
        ? '建议补拍'
        : percent < 90
          ? '继续补齐'
          : '留证充分';

  return {
    total,
    activeTotal,
    completed,
    percent,
    unchecked,
    notApplicable,
    issueCount,
    highUnfinished,
    highUnfinishedItems,
    issueItems,
    riskLevel,
  };
}

function getModuleStats(items, state) {
  const notApplicable = items.filter((item) => state[item.id] === 'na').length;
  const activeTotal = Math.max(items.length - notApplicable, 0);
  const completed = items.filter((item) => ['ok', 'issue'].includes(state[item.id])).length;
  return { activeTotal, completed };
}

function buildSummary(items, state, stats) {
  const unfinishedHighRisk = items
    .filter((item) => item.risk === '高' && state[item.id] === 'unchecked')
    .map((item) => item.title);

  const issueItems = items.filter((item) => state[item.id] === 'issue').map((item) => item.title);
  const uncheckedItems = items.filter((item) => state[item.id] === 'unchecked').map((item) => item.title);
  const suggestions = [];

  if (unfinishedHighRisk.length) {
    suggestions.push('建议先补齐关键留证项，尤其是车身一圈视频、轮胎、轮毂、玻璃、内饰和仪表盘。');
  }

  if (issueItems.length) {
    suggestions.push(`已标记为“需拍照留证”的项目，请拍近景，并让门店写进验车单或订单备注：${issueItems.slice(0, 3).join('、')}。`);
  }

  if (uncheckedItems.length) {
    suggestions.push(`还没确认的项目可以按需补拍：${uncheckedItems.slice(0, 4).join('、')}。`);
  }

  suggestions.push('出发前顺手拍一遍车身四面、四条轮胎、前挡玻璃、内饰、仪表盘、合同总价和押金规则。');

  return {
    completion: `${stats.percent}%`,
    completedCount: stats.completed,
    remainingAdviceCount: unfinishedHighRisk.length,
    issueCount: issueItems.length,
    riskLevel: stats.riskLevel,
    unfinishedHighRisk,
    issueItems,
    suggestions: suggestions.slice(0, 4),
  };
}

