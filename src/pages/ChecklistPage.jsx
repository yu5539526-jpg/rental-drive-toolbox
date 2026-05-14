import { RotateCcw, ShieldAlert, Sparkles, WalletCards } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import LeadCaptureModal from '../components/LeadCaptureModal.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import TopBar from '../components/TopBar.jsx';
import { STATUS_OPTIONS, checklistModules, flatChecklistItems } from '../data/checklist.js';

const STORAGE_KEY = 'rentalDrive.checklistState';

const statusStyles = {
  unchecked: 'bg-white text-ink/56 ring-1 ring-pine/10',
  ok: 'bg-pine text-white',
  issue: 'bg-coral text-white',
  na: 'bg-skySoft text-ink',
};

const riskStyles = {
  高风险: {
    badge: 'bg-coral text-white',
    tone: 'coral',
  },
  中风险: {
    badge: 'bg-amberSoft text-[#99551d] ring-1 ring-[#efc894]',
    tone: 'amber',
  },
  低风险: {
    badge: 'bg-pine text-white',
    tone: 'pine',
  },
};

const riskAdvice = {
  高风险: '还有关键项目未检查，建议先补充检查轮胎、轮毂、玻璃、底盘、保险、押金和还车要求。',
  中风险: '大部分项目已完成，但仍建议补充未检查项，尤其是车损和费用相关内容。',
  低风险: '检查完成度较高，可以保留照片和视频后再取车/还车。',
};

export default function ChecklistPage() {
  const [state, setState] = useState(loadChecklistState);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const summaryRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const stats = useMemo(() => getChecklistStats(state), [state]);
  const summary = useMemo(
    () => (summaryVisible ? buildSummary(state, stats) : null),
    [state, stats, summaryVisible],
  );
  const riskStyle = riskStyles[stats.riskLevel];

  const updateStatus = (itemId, status) => {
    setState((current) => ({ ...current, [itemId]: status }));
  };

  const reset = () => {
    const next = createInitialState();
    setState(next);
    setSummaryVisible(false);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const generateSummary = () => {
    setSummaryVisible(true);
    window.setTimeout(() => {
      summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const resultSnapshot = summary || buildSummary(state, stats);

  return (
    <main className="safe-bottom min-h-[calc(100vh-2rem)] bg-mint">
      <TopBar title="取车验车清单" subtitle="点选状态，实时看风险" />

      <section className="sticky top-[68px] z-10 border-b border-pine/10 bg-mint/95 px-4 py-3 backdrop-blur">
        <RealtimeFeedback stats={stats} riskStyle={riskStyle} />
      </section>

      <section className="px-4 pb-24 pt-4">
        <div className="grid gap-5">
          {checklistModules.map((module, moduleIndex) => {
            const moduleStats = getModuleStats(module.items, state);
            return (
              <section key={module.id}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-black text-ink">
                    {String(moduleIndex + 1).padStart(2, '0')} {module.title}
                  </h2>
                  <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-ink/56">
                    {moduleStats.completed}/{moduleStats.activeTotal}
                  </span>
                </div>

                <div className="grid gap-3">
                  {module.items.map((item) => (
                    <article key={item.id} className="screen-card rounded-[22px] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-base font-black leading-snug text-ink">{item.title}</h3>
                          <p className="mt-2 text-sm leading-relaxed text-ink/64">{item.advice}</p>
                        </div>
                        <RiskPill risk={item.risk} />
                      </div>
                      <div className="mt-4 grid grid-cols-4 gap-2">
                        {STATUS_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => updateStatus(item.id, option.value)}
                            className={`min-h-10 rounded-xl px-1 text-xs font-black transition ${
                              state[item.id] === option.value
                                ? statusStyles[option.value]
                                : 'bg-mint text-ink/52 ring-1 ring-transparent'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <section className="mt-6 rounded-[24px] border border-pine/10 bg-white p-4 shadow-soft">
          <div>
            <p className="text-xs font-bold text-ink/52">检查完成后</p>
            <h2 className="mt-1 text-lg font-black text-ink">生成本次验车清单</h2>
            <p className="mt-1 text-sm leading-relaxed text-ink/62">
              根据你刚才标记的状态，汇总完成度、风险项和需要补拍留证的内容。
            </p>
          </div>

          <div className="mt-4 grid grid-cols-[0.85fr_1.35fr] gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-mint px-3 text-sm font-black text-ink"
            >
              <RotateCcw size={17} />
              重置
            </button>
            <button
              type="button"
              onClick={generateSummary}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-coral px-3 text-sm font-black text-white shadow-lg shadow-coral/20"
            >
              <Sparkles size={17} />
              生成验车清单
            </button>
          </div>
        </section>

        {summary ? (
          <div ref={summaryRef} className="mt-5 scroll-mt-24">
            <SummaryCard summary={summary} onOpenLead={() => setLeadOpen(true)} />
          </div>
        ) : null}
      </section>

      <LeadCaptureModal
        open={leadOpen}
        onClose={() => setLeadOpen(false)}
        resultType="checklist"
        resultSnapshot={resultSnapshot}
      />
    </main>
  );
}

function RealtimeFeedback({ stats, riskStyle }) {
  return (
    <div className="rounded-[22px] bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-ink/52">实时验车反馈</p>
          <p className="mt-0.5 text-xl font-black text-ink">{stats.percent}% 完成</p>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-xs font-black ${riskStyle.badge}`}>{stats.riskLevel}</span>
      </div>
      <ProgressBar value={stats.percent} tone={riskStyle.tone} />
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Metric label="未检查" value={stats.unchecked} />
        <Metric label="有问题" value={stats.issueCount} danger={stats.issueCount > 0} />
        <Metric label="高危未完" value={stats.highUnfinished} danger={stats.highUnfinished > 0} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Metric label="总项" value={stats.total} />
        <Metric label="有效项" value={stats.activeTotal} />
        <Metric label="已完成" value={stats.completed} highlight />
      </div>
      <p className="mt-3 rounded-2xl bg-mint px-3 py-2 text-xs font-bold leading-relaxed text-ink/68">
        {riskAdvice[stats.riskLevel]}
      </p>
    </div>
  );
}

function Metric({ label, value, highlight, danger }) {
  return (
    <div className="rounded-2xl bg-mint px-2 py-2">
      <div className={`text-lg font-black ${danger ? 'text-coral' : highlight ? 'text-pine' : 'text-ink'}`}>{value}</div>
      <div className="mt-0.5 text-[11px] font-bold text-ink/52">{label}</div>
    </div>
  );
}

function RiskPill({ risk }) {
  const className =
    risk === '高'
      ? 'bg-coral text-white'
      : risk === '中'
        ? 'bg-amberSoft text-[#99551d] ring-1 ring-[#efc894]'
        : 'bg-skySoft text-ink';

  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-black ${className}`}>{risk}风险</span>;
}

function SummaryCard({ summary, onOpenLead }) {
  return (
    <section className="mb-5 rounded-[22px] bg-ink p-4 text-white shadow-soft">
      <div className="flex items-center gap-2">
        <ShieldAlert size={18} className="text-amberSoft" />
        <h2 className="text-base font-black">验车结果摘要</h2>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/10 p-3">
          <p className="text-xs text-white/58">完成度</p>
          <p className="mt-1 text-2xl font-black">{summary.completion}</p>
        </div>
        <div className="rounded-2xl bg-white/10 p-3">
          <p className="text-xs text-white/58">风险等级</p>
          <p className="mt-1 text-2xl font-black">{summary.riskLevel}</p>
        </div>
      </div>
      <SummaryList title="未检查的高风险项目" empty="暂无未检查高风险项" items={summary.unfinishedHighRisk} />
      <SummaryList title="标记为有问题的项目" empty="暂无标记为有问题的项目" items={summary.issueItems} />
      <div className="mt-3 rounded-2xl bg-white/10 p-3">
        <p className="text-xs font-bold text-white/58">建议补拍或补确认的内容</p>
        <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
          {summary.suggestions.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        onClick={onOpenLead}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-coral px-4 py-4 font-black text-white"
      >
        <WalletCards size={18} />
        保存结果并领取完整资料包
      </button>
    </section>
  );
}

function SummaryList({ title, empty, items }) {
  return (
    <div className="mt-3 rounded-2xl bg-white/10 p-3">
      <p className="text-xs font-bold text-white/58">{title}</p>
      <p className="mt-2 text-sm leading-relaxed">{items.length ? items.join('、') : empty}</p>
    </div>
  );
}

function createInitialState() {
  return Object.fromEntries(flatChecklistItems.map((item) => [item.id, 'unchecked']));
}

function loadChecklistState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return { ...createInitialState(), ...parsed };
  } catch {
    return createInitialState();
  }
}

function getChecklistStats(state) {
  const total = flatChecklistItems.length;
  const notApplicable = flatChecklistItems.filter((item) => state[item.id] === 'na').length;
  const activeTotal = Math.max(total - notApplicable, 0);
  const completed = flatChecklistItems.filter((item) => ['ok', 'issue'].includes(state[item.id])).length;
  const unchecked = flatChecklistItems.filter((item) => state[item.id] === 'unchecked').length;
  const issueCount = flatChecklistItems.filter((item) => state[item.id] === 'issue').length;
  const percent = activeTotal ? Math.round((completed / activeTotal) * 100) : 100;
  const highUnfinished = flatChecklistItems.filter((item) => item.risk === '高' && state[item.id] === 'unchecked').length;
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
    riskLevel,
  };
}

function getModuleStats(items, state) {
  const notApplicable = items.filter((item) => state[item.id] === 'na').length;
  const activeTotal = Math.max(items.length - notApplicable, 0);
  const completed = items.filter((item) => ['ok', 'issue'].includes(state[item.id])).length;
  return { activeTotal, completed };
}

function buildSummary(state, stats) {
  const unfinishedHighRisk = flatChecklistItems
    .filter((item) => item.risk === '高' && state[item.id] === 'unchecked')
    .map((item) => item.title);

  const issueItems = flatChecklistItems.filter((item) => state[item.id] === 'issue').map((item) => item.title);
  const uncheckedItems = flatChecklistItems.filter((item) => state[item.id] === 'unchecked').map((item) => item.title);
  const suggestions = [];

  if (unfinishedHighRisk.length) {
    suggestions.push('先补完高风险项，尤其是轮胎、轮毂、玻璃、底盘、保险、押金和还车要求。');
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
