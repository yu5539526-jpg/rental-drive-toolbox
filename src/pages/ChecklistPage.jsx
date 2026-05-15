import { RotateCcw, ShieldAlert, Sparkles, WalletCards } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import LeadCaptureModal from '../components/LeadCaptureModal.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import TopBar from '../components/TopBar.jsx';
import {
  STATUS_OPTIONS,
  allChecklistItems,
  checklistModules,
  flatChecklistItems,
  flatQuickChecklistItems,
  quickChecklistModules,
} from '../data/checklist.js';

const STORAGE_KEY = 'rentalDrive.checklistState';
const MODE_STORAGE_KEY = 'rentalDrive.checklistMode';

const statusStyles = {
  unchecked: {
    active: 'bg-[#F0EFEA] text-muted ring-2 ring-pine/10',
    inactive: 'bg-[#F0EFEA]/70 text-muted',
  },
  ok: {
    active: 'bg-[#DDEFE8] text-pine ring-2 ring-pine/25 shadow-sm',
    inactive: 'bg-mint text-pine',
  },
  issue: {
    active: 'bg-[#FBE4E0] text-coral ring-2 ring-coral/25 shadow-sm',
    inactive: 'bg-[#FBEDEA] text-coral',
  },
  na: {
    active: 'bg-[#F3F1EA] text-muted ring-2 ring-pine/10',
    inactive: 'bg-[#F5F3ED] text-muted',
  },
};

const riskStyles = {
  高风险: {
    badge: 'bg-[#FBE4E0] text-coral ring-1 ring-coral/20',
    tone: 'coral',
    label: '建议先补查',
  },
  中风险: {
    badge: 'bg-amberSoft text-[#7A5521] ring-1 ring-[#E3CB8D]',
    tone: 'amber',
    label: '继续补齐',
  },
  低风险: {
    badge: 'bg-mint text-pine ring-1 ring-pine/20',
    tone: 'pine',
    label: '基本妥当',
  },
};

const riskAdvice = {
  高风险: '还有关键项没检查，建议先补拍车身、轮胎、玻璃、保险和押金规则。',
  中风险: '大部分项目已完成，再补齐几个易遗漏项，取车会更稳妥。',
  低风险: '完成度不错，取车前保留照片和视频，后续还车更有依据。',
};

export default function ChecklistPage() {
  const [state, setState] = useState(loadChecklistState);
  const [mode, setMode] = useState(loadChecklistMode);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const [feedback, setFeedback] = useState('点选状态后，完成度和提醒会实时更新。');
  const summaryRef = useRef(null);

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
    setFeedback(`已将「${item?.title || '检查项'}」标记为「${option?.label || '已更新'}」。`);
  };

  const reset = () => {
    const next = createInitialState();
    setState(next);
    setSummaryVisible(false);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setFeedback('验车清单已重置，可以重新检查。');
  };

  const generateSummary = () => {
    setSummaryVisible(true);
    setFeedback('已生成本次验车清单。');
    window.setTimeout(() => {
      summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const updateMode = (nextMode) => {
    setMode(nextMode);
    setFeedback(nextMode === 'quick' ? '已切换到 3 分钟快速验车。' : '已切换到详细验车模式。');
  };

  const openLead = () => {
    setFeedback('请确认隐私提示后提交，提交成功后会显示已保存。');
    setLeadOpen(true);
  };

  const resultSnapshot = summary || buildSummary(currentItems, state, stats);

  return (
    <main className="min-h-screen bg-transparent">
      <TopBar title="取车验车清单" subtitle="照着点，少漏拍" />

      <section className="sticky top-[72px] z-10 border-b border-pine/10 bg-cream/90 px-4 py-3 backdrop-blur">
        <RealtimeFeedback stats={stats} riskStyle={riskStyle} />
        <p className="mt-2 rounded-2xl bg-card px-3 py-2 text-xs font-bold leading-relaxed text-pine shadow-sm" role="status" aria-live="polite">
          {feedback}
        </p>
      </section>

      <section className="page-pad px-4 pt-4">
        <ModeSwitch mode={mode} setMode={updateMode} />

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

                <div className="grid gap-3">
                  {module.items.map((item) => (
                    <ChecklistItem key={item.id} item={item} value={state[item.id]} onUpdate={updateStatus} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <section className="mt-6 rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
          <p className="text-xs font-bold text-muted">检查完成后</p>
          <h2 className="mt-1 text-lg font-bold text-ink">生成本次验车清单</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            汇总完成度、问题项和需要补拍留证的内容，方便后面保存或复盘。
          </p>
        </section>

        {summary ? (
          <div ref={summaryRef} className="mt-5 scroll-mt-32">
            <SummaryCard summary={summary} onOpenLead={openLead} />
          </div>
        ) : null}
      </section>

      <nav className="bottom-action fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] px-4 pt-3 sm:bottom-6 sm:rounded-b-[30px]">
        <div className="grid grid-cols-[0.85fr_1.35fr] gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-card px-3 text-sm font-bold text-pine shadow-sm ring-1 ring-pine/10"
          >
            <RotateCcw size={17} />
            重置
          </button>
          <button
            type="button"
            onClick={generateSummary}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-pine px-3 text-sm font-bold text-white shadow-lg shadow-pine/20"
          >
            <Sparkles size={17} />
            生成验车清单
          </button>
        </div>
      </nav>

      <LeadCaptureModal
        open={leadOpen}
        onClose={() => setLeadOpen(false)}
        resultType="checklist"
        resultSnapshot={resultSnapshot}
      />
    </main>
  );
}

function ChecklistItem({ item, value, onUpdate }) {
  return (
    <article className="screen-card rounded-[22px] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold leading-snug text-ink">{item.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{item.advice}</p>
        </div>
        <RiskPill item={item} />
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {STATUS_OPTIONS.map((option) => {
          const active = value === option.value;
          const style = statusStyles[option.value];

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onUpdate(item.id, option.value)}
              className={`min-h-11 rounded-xl px-1 text-xs font-bold ${active ? style.active : style.inactive}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </article>
  );
}

function RealtimeFeedback({ stats, riskStyle }) {
  const missingHigh = stats.highUnfinishedItems.slice(0, 3);
  const issueItems = stats.issueItems.slice(0, 2);

  return (
    <div className="rounded-[22px] bg-card p-4 shadow-card ring-1 ring-pine/10">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-muted">现场验车进度</p>
          <p className="mt-1 text-2xl font-bold text-ink">
            {stats.completed}
            <span className="text-base font-medium text-muted">/{stats.activeTotal}</span>
          </p>
        </div>
        <div className="text-right">
          <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${riskStyle.badge}`}>{riskStyle.label}</span>
          <p className="mt-1 text-[11px] font-bold text-muted">{stats.percent}% 完成</p>
        </div>
      </div>
      <ProgressBar value={stats.percent} tone={riskStyle.tone} />

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Metric label="未检查" value={stats.unchecked} />
        <Metric label="有问题" value={stats.issueCount} danger={stats.issueCount > 0} />
        <Metric label="必查未完" value={stats.highUnfinished} danger={stats.highUnfinished > 0} />
      </div>

      <div className="mt-3 grid gap-2">
        <ActionLine title="还差关键项" text={missingHigh.length ? missingHigh.join('、') : '暂无必查未完成项'} danger={missingHigh.length > 0} />
        <ActionLine title="有问题项目" text={issueItems.length ? issueItems.join('、') : '暂无标记为有问题的项目'} danger={issueItems.length > 0} />
      </div>

      <p className="mt-3 rounded-2xl bg-mint px-3 py-2 text-xs font-medium leading-relaxed text-muted">{riskAdvice[stats.riskLevel]}</p>
    </div>
  );
}

function ModeSwitch({ mode, setMode }) {
  const options = [
    { value: 'quick', label: '3 分钟快速验车' },
    { value: 'detail', label: '详细验车模式' },
  ];

  return (
    <div className="mb-4 rounded-[22px] bg-card p-1.5 shadow-sm ring-1 ring-pine/10">
      <div className="grid grid-cols-2 gap-1.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setMode(option.value)}
            className={`min-h-11 rounded-2xl px-3 text-sm font-bold ${
              mode === option.value ? 'bg-pine text-white shadow-sm' : 'bg-mint text-pine'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ActionLine({ title, text, danger }) {
  return (
    <div className={`rounded-2xl px-3 py-2 ${danger ? 'bg-[#FBEDEA]' : 'bg-mint'}`}>
      <p className={`text-[11px] font-bold ${danger ? 'text-coral' : 'text-muted'}`}>{title}</p>
      <p className="mt-1 text-xs font-medium leading-relaxed text-ink">{text}</p>
    </div>
  );
}

function Metric({ label, value, danger }) {
  return (
    <div className="rounded-2xl bg-mint px-2 py-2">
      <div className={`text-lg font-bold ${danger ? 'text-coral' : 'text-pine'}`}>{value}</div>
      <div className="mt-0.5 text-[11px] font-bold text-muted">{label}</div>
    </div>
  );
}

function RiskPill({ item }) {
  const label = getRiskTag(item);
  const className =
    label === '争议高发'
      ? 'bg-[#FBE4E0] text-coral ring-coral/20'
      : label === '易扣费'
        ? 'bg-amberSoft text-[#7A5521] ring-[#E3CB8D]'
        : label === '必查'
          ? 'bg-mint text-pine ring-pine/20'
          : label === '重点'
            ? 'bg-[#EDF1EA] text-pine ring-pine/10'
            : 'bg-[#F3F1EA] text-muted ring-pine/10';

  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${className}`}>{label}</span>;
}

function getRiskTag(item) {
  if (item.risk === '高') {
    if (/deposit|fee|settlement|fuel|insurance|deductible|returnFuel|quickDeposit|coverage/i.test(item.id)) return '易扣费';
    if (/video|body|bumper|tire|wheel|glass|mirror|bottom|windshield/i.test(item.id)) return '争议高发';
    return '必查';
  }

  if (item.risk === '中') {
    if (/tool|time|point|spare|charging|parking|belongings|overTime/i.test(item.id)) return '易遗漏';
    return '重点';
  }

  return '易遗漏';
}

function SummaryCard({ summary, onOpenLead }) {
  return (
    <section className="rounded-[24px] bg-pine p-4 text-white shadow-soft">
      <div className="flex items-center gap-2">
        <ShieldAlert size={18} className="text-amberSoft" />
        <h2 className="text-lg font-bold">验车结果摘要</h2>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/10 p-3">
          <p className="text-xs text-white/60">完成度</p>
          <p className="mt-1 text-2xl font-bold">{summary.completion}</p>
        </div>
        <div className="rounded-2xl bg-white/10 p-3">
          <p className="text-xs text-white/60">提醒级别</p>
          <p className="mt-1 text-2xl font-bold">{riskStyles[summary.riskLevel].label}</p>
        </div>
      </div>
      <SummaryList title="未检查的必查项目" empty="暂无未检查必查项" items={summary.unfinishedHighRisk} />
      <SummaryList title="标记为有问题的项目" empty="暂无标记为有问题的项目" items={summary.issueItems} />
      <div className="mt-3 rounded-2xl bg-white/10 p-3">
        <p className="text-xs font-bold text-white/60">建议补拍或补确认的内容</p>
        <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
          {summary.suggestions.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        onClick={onOpenLead}
        className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-card px-4 font-bold text-pine shadow-sm"
      >
        <WalletCards size={18} />
        提交并保存我的出行计划
      </button>
    </section>
  );
}

function SummaryList({ title, empty, items }) {
  return (
    <div className="mt-3 rounded-2xl bg-white/10 p-3">
      <p className="text-xs font-bold text-white/60">{title}</p>
      <p className="mt-2 text-sm leading-relaxed">{items.length ? items.join('、') : empty}</p>
    </div>
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
      ? '高风险'
      : percent < 70
        ? '高风险'
        : percent < 90
          ? '中风险'
          : '低风险';

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
    suggestions.push('先补完必查项，尤其是轮胎、轮毂、玻璃、底盘、保险、押金和还车要求。');
  }

  if (issueItems.length) {
    suggestions.push(`有问题的项目要让门店写进验车单，并拍近景留证：${issueItems.slice(0, 3).join('、')}。`);
  }

  if (uncheckedItems.length) {
    suggestions.push(`建议补查未检查项：${uncheckedItems.slice(0, 4).join('、')}。`);
  }

  suggestions.push('补拍车身四面、四条轮胎、前挡玻璃、内饰、仪表盘、合同总价和押金规则。');

  return {
    completion: `${stats.percent}%`,
    riskLevel: stats.riskLevel,
    unfinishedHighRisk,
    issueItems,
    suggestions: suggestions.slice(0, 4),
  };
}

