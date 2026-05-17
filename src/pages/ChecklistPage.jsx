import { ShieldAlert, Sparkles, WalletCards } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
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

const STORAGE_KEY = 'rentalDrive.checklistState';
const MODE_STORAGE_KEY = 'rentalDrive.checklistMode';

const statusStyles = {
  unchecked: {
    active: 'bg-card text-muted shadow-sm ring-1 ring-pine/10',
    card: 'ring-pine/10',
    badge: 'bg-[#F3F1EA] text-muted ring-pine/10',
  },
  ok: {
    active: 'bg-pine text-white shadow-sm',
    card: 'ring-pine/20',
    badge: 'bg-mint text-pine ring-pine/15',
  },
  issue: {
    active: 'bg-[#FBEDEA] text-coral shadow-sm ring-1 ring-coral/20',
    card: 'ring-coral/25',
    badge: 'bg-[#FBEDEA] text-coral ring-coral/15',
  },
  na: {
    active: 'bg-[#E8E6DF] text-muted shadow-sm',
    card: 'ring-pine/8',
    badge: 'bg-[#F3F1EA] text-muted ring-pine/10',
  },
};

const riskStyles = {
  建议补拍: {
    badge: 'bg-amberSoft text-[#7A5521] ring-1 ring-[#E3CB8D]',
    tone: 'amber',
    label: '建议补拍',
  },
  继续补齐: {
    badge: 'bg-amberSoft text-[#7A5521] ring-1 ring-[#E3CB8D]',
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
  建议补拍: '还有关键照片没留，建议先补拍车身、轮胎、玻璃、内饰和仪表盘。',
  继续补齐: '大部分项目已完成，再补齐几个易遗漏项，还车沟通会更轻松。',
  留证充分: '关键照片和视频留得不错，后续还车更有依据。',
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
    <main className="min-h-screen bg-transparent">
      <TopBar title="取车留证清单" />

      <section className="sticky top-14 z-10 border-b border-pine/10 bg-cream/90 px-4 py-3 backdrop-blur">
        <RealtimeFeedback stats={stats} riskStyle={riskStyle} />
        <p className="mt-2 rounded-2xl bg-card px-3 py-2 text-xs font-bold leading-relaxed text-pine shadow-sm" role="status" aria-live="polite">
          {feedback}
        </p>
      </section>

      <section className="page-pad px-4 pt-4">
        <ModeSwitch mode={mode} setMode={updateMode} />

        <section className="mb-3 rounded-[22px] bg-card px-4 py-3 text-sm font-bold leading-relaxed text-pine shadow-sm ring-1 ring-pine/10">
          建议先拍完整车身视频，再逐项补拍轮胎、轮毂、玻璃和仪表盘。
        </section>

        <section className="mb-4 rounded-[22px] bg-amberSoft px-4 py-3 text-sm font-bold leading-relaxed text-[#7A5521]">
          买了高档保险通常会省心很多，但取车时保留关键照片和视频，仍然能减少还车沟通成本。
        </section>

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
            汇总已完成项目、未确认项目、问题项和建议补拍内容，方便后面保存或复盘。
          </p>
        </section>

        {summary ? (
          <div ref={summaryRef} className="mt-5 scroll-mt-32">
            <SummaryCard summary={summary} />
          </div>
        ) : null}
      </section>

      <BottomActionBar layout={summaryVisible ? 'double' : 'single'}>
        {summaryVisible ? (
          <>
            <BottomActionButton type="button" variant="secondary" onClick={generateSummary}>
              <Sparkles size={17} />
              更新摘要
            </BottomActionButton>
            <BottomActionButton type="button" onClick={openLead}>
              <WalletCards size={17} />
              保存计划
            </BottomActionButton>
          </>
        ) : (
          <BottomActionButton type="button" onClick={generateSummary}>
            <Sparkles size={17} />
            生成留证摘要
          </BottomActionButton>
        )}
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

function ChecklistItem({ item, value, onUpdate }) {
  const currentStatus = STATUS_OPTIONS.find((option) => option.value === value) || STATUS_OPTIONS[0];
  const currentStyle = statusStyles[value] || statusStyles.unchecked;

  return (
    <article className={`screen-card rounded-[22px] p-4 transition-colors duration-200 ${currentStyle.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold leading-snug text-ink">{item.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted/85">{item.advice}</p>
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
        optionClassName="px-1"
        getOptionClassName={(option, active) =>
          active ? statusStyles[option.value].active : 'text-muted/70 hover:bg-card/60 hover:text-ink'
        }
      />
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
          <p className="text-xs font-bold text-muted">取车留证进度</p>
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
        <Metric label="必拍未完" value={stats.highUnfinished} danger={stats.highUnfinished > 0} />
      </div>

      <div className="mt-3 grid gap-2">
        <ActionLine title="建议补拍" text={missingHigh.length ? missingHigh.join('、') : '暂无必拍未完成项'} danger={missingHigh.length > 0} />
        <ActionLine title="有问题项目" text={issueItems.length ? issueItems.join('、') : '暂无标记为有问题的项目'} danger={issueItems.length > 0} />
      </div>

      <p className="mt-3 rounded-2xl bg-mint px-3 py-2 text-xs font-medium leading-relaxed text-muted">{riskAdvice[stats.riskLevel]}</p>
    </div>
  );
}

function ModeSwitch({ mode, setMode }) {
  const options = [
    { value: 'quick', label: '省心版：8 项必拍' },
    { value: 'detail', label: '认真版：完整检查' },
  ];

  return (
    <SegmentedControl
      options={options}
      value={mode}
      onChange={setMode}
      columns={2}
      ariaLabel="清单模式"
      className="mb-4 rounded-[22px] bg-card p-1.5 shadow-sm"
      optionClassName="min-h-11 rounded-2xl px-3 text-sm"
      getOptionClassName={(_option, active) => (active ? 'bg-pine text-white shadow-sm' : 'bg-mint text-pine')}
    />
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
    label === '易产生争议'
      ? 'bg-amberSoft/70 text-[#7A5521] ring-[#E3CB8D]/70'
      : label === '建议确认'
        ? 'bg-[#EDF1EA]/80 text-pine ring-pine/10'
        : label === '必拍'
          ? 'bg-mint/80 text-pine ring-pine/15'
          : label === '重点'
            ? 'bg-[#EDF1EA]/80 text-pine ring-pine/10'
            : 'bg-[#F3F1EA] text-muted ring-pine/10';

  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${className}`}>{label}</span>;
}

function getRiskTag(item) {
  if (item.risk === '高') {
    if (/deposit|fee|settlement|fuel|insurance|deductible|returnFuel|coverage|license|contract|driver/i.test(item.id)) return '建议确认';
    if (/video|body|bumper|tire|wheel|glass|mirror|light|interior|seat|dashboard|mileage|energy|windshield/i.test(item.id)) return '必拍';
    return '重点';
  }

  if (item.risk === '中') {
    if (/tool|time|point|spare|charging|parking|belongings|overTime/i.test(item.id)) return '易遗漏';
    return '重点';
  }

  return '易遗漏';
}

function SummaryCard({ summary }) {
  return (
    <section className="rounded-[24px] bg-pine p-4 text-white shadow-soft">
      <div className="flex items-center gap-2">
        <ShieldAlert size={18} className="text-amberSoft" />
        <h2 className="text-lg font-bold">本次取车留证摘要</h2>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/10 p-3">
          <p className="text-xs text-white/60">已完成留证项目</p>
          <p className="mt-1 text-2xl font-bold">{summary.completion}</p>
        </div>
        <div className="rounded-2xl bg-white/10 p-3">
          <p className="text-xs text-white/60">留证提醒</p>
          <p className="mt-1 text-2xl font-bold">{riskStyles[summary.riskLevel].label}</p>
        </div>
      </div>
      <SummaryList title="仍未确认项目" empty="暂无仍未确认项目" items={summary.unfinishedHighRisk} />
      <SummaryList title="标记为有问题的项目" empty="暂无标记为有问题的项目" items={summary.issueItems} />
      <div className="mt-3 rounded-2xl bg-white/10 p-3">
        <p className="text-xs font-bold text-white/60">建议补拍内容</p>
        <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
          {summary.suggestions.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </div>
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
    suggestions.push('建议先补齐必拍项，尤其是车身一圈视频、轮胎、轮毂、玻璃、内饰和仪表盘。');
  }

  if (issueItems.length) {
    suggestions.push(`标记有问题的项目建议拍近景，并让门店同步确认：${issueItems.slice(0, 3).join('、')}。`);
  }

  if (uncheckedItems.length) {
    suggestions.push(`仍未确认项目可以按需补拍：${uncheckedItems.slice(0, 4).join('、')}。`);
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

