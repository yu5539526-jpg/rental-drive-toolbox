import { AlertTriangle, ShieldAlert, Sparkles, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import BottomActionBar, { BottomActionButton } from '../components/BottomActionBar.jsx';
import LeadCaptureModal from '../components/LeadCaptureModal.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import TopBar from '../components/TopBar.jsx';

const questions = [
  {
    id: 'rentalExperience',
    title: '你是第几次租车？',
    options: [
      { value: 'first', label: '第一次' },
      { value: 'few', label: '2-3 次' },
      { value: 'frequent', label: '经常租车' },
    ],
  },
  {
    id: 'oneWay',
    title: '是否异地还车？',
    options: [
      { value: 'yes', label: '是' },
      { value: 'no', label: '否' },
      { value: 'unsure', label: '还不确定' },
    ],
  },
  {
    id: 'nightPickup',
    title: '是否夜间取车或还车？',
    options: [
      { value: 'yes', label: '是' },
      { value: 'no', label: '否' },
    ],
  },
  {
    id: 'multiDriver',
    title: '是否多人轮流驾驶？',
    options: [
      { value: 'yes', label: '是' },
      { value: 'no', label: '否' },
    ],
  },
  {
    id: 'smartCar',
    title: '是否租新能源或智能车？',
    options: [
      { value: 'yes', label: '是' },
      { value: 'no', label: '否' },
    ],
  },
  {
    id: 'specialRoute',
    title: '是否会走山区、高原、草原、沙漠、长途国道？',
    options: [
      { value: 'yes', label: '是' },
      { value: 'no', label: '否' },
      { value: 'unsure', label: '不确定' },
    ],
  },
  {
    id: 'insurance',
    title: '是否已经看清楚保险责任？',
    options: [
      { value: 'confirmed', label: '已确认' },
      { value: 'unclear', label: '没看清' },
      { value: 'unsure', label: '不确定' },
    ],
  },
  {
    id: 'extraCoverage',
    title: '是否购买不计免赔或补充保障？',
    options: [
      { value: 'purchased', label: '已购买' },
      { value: 'notPurchased', label: '未购买' },
      { value: 'unsure', label: '不确定' },
    ],
  },
  {
    id: 'deposit',
    title: '是否确认押金和违章押金金额？',
    options: [
      { value: 'confirmed', label: '已确认' },
      { value: 'unconfirmed', label: '未确认' },
    ],
  },
  {
    id: 'extraFees',
    title: '是否确认超时费、超公里费、异地还车费？',
    options: [
      { value: 'confirmed', label: '已确认' },
      { value: 'unconfirmed', label: '未确认' },
    ],
  },
  {
    id: 'returnEnergy',
    title: '是否确认还车油量或电量要求？',
    options: [
      { value: 'confirmed', label: '已确认' },
      { value: 'unconfirmed', label: '未确认' },
    ],
  },
  {
    id: 'energyPlan',
    title: '是否提前规划补能或加油点？',
    options: [
      { value: 'planned', label: '已规划' },
      { value: 'unplanned', label: '未规划' },
      { value: 'notNeeded', label: '不需要' },
    ],
  },
];

const scoreRules = {
  rentalExperience: { first: 15, few: 8 },
  oneWay: { yes: 12, unsure: 8 },
  nightPickup: { yes: 10 },
  multiDriver: { yes: 8 },
  smartCar: { yes: 8 },
  specialRoute: { yes: 12, unsure: 8 },
  insurance: { unclear: 15, unsure: 10 },
  extraCoverage: { notPurchased: 8, unsure: 8 },
  deposit: { unconfirmed: 10 },
  extraFees: { unconfirmed: 8 },
  returnEnergy: { unconfirmed: 8 },
  energyPlan: { unplanned: 10 },
};

const actionSuggestions = [
  '取车时录制车身一圈视频，作为基础留证',
  '单独拍轮胎、轮毂、前后保险杠和底盘可见区域',
  '确认保险责任、不计免赔、事故自付额度',
  '确认押金、违章押金、超时费和异地还车费',
  '保留租车合同、取车照片、还车照片和平台沟通记录',
];

export default function RiskQuizPage() {
  const [answers, setAnswers] = useState({});
  const [reportVisible, setReportVisible] = useState(false);
  const [feedback, setFeedback] = useState('先按真实情况点选，系统会自动给出省心建议。');
  const [leadOpen, setLeadOpen] = useState(false);

  const report = useMemo(() => buildRiskReport(answers), [answers]);
  const answeredCount = Object.keys(answers).length;
  const canGenerate = answeredCount === questions.length;

  const updateAnswer = (id, value) => {
    setAnswers((current) => ({ ...current, [id]: value }));
    setReportVisible(false);
    setFeedback('已记录，省心指数会随选择实时变化。');
  };

  const generateReport = () => {
    if (!canGenerate) {
      setFeedback(`还差 ${questions.length - answeredCount} 个问题，答完后就能生成省心建议。`);
      return;
    }
    setReportVisible(true);
    setFeedback('已生成本次省心程度建议。');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reset = () => {
    setAnswers({});
    setReportVisible(false);
    setFeedback('已重新开始自测。');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resultSnapshot = {
    answers,
    score: report.rawScore,
    displayScore: report.displayScore,
    level: report.level,
    sources: report.sources,
    reminders: report.reminders,
  };

  return (
    <main className="min-h-screen bg-transparent">
      <TopBar title="省心程度自测" />

      <section className="border-b border-pine/10 bg-cream/90 px-4 py-3">
        <div className="rounded-[22px] bg-card p-4 shadow-card ring-1 ring-pine/10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-muted">自测进度</p>
              <p className="mt-1 text-lg font-bold leading-tight text-ink">已完成 {answeredCount} / {questions.length} 题</p>
              <p className="mt-1 text-xs font-bold text-pine">完成后生成省心建议</p>
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${report.badgeClass}`}>{report.level}</span>
          </div>
          <div className="mt-3">
            <ProgressBar value={(answeredCount / questions.length) * 100} tone={report.tone} />
          </div>
          <p className="mt-2 text-xs font-medium leading-relaxed text-muted">大约 1 分钟完成。</p>
          <p className="mt-3 rounded-2xl bg-mint px-3 py-2 text-xs font-bold leading-relaxed text-pine" role="status" aria-live="polite">
            {feedback}
          </p>
        </div>
      </section>

      <section className="safe-bottom-action px-4 pt-4">
        {reportVisible ? (
          <RiskReport report={report} />
        ) : (
          <div className="grid gap-3">
            <QuizStartGuide />
            {questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                value={answers[question.id]}
                onChange={(value) => updateAnswer(question.id, value)}
              />
            ))}
          </div>
        )}
      </section>

      <BottomActionBar>
        {reportVisible ? (
          <BottomActionButton type="button" onClick={() => setLeadOpen(true)}>
            <WalletCards size={17} />
            提交并保存我的出行计划
          </BottomActionButton>
        ) : (
          <BottomActionButton type="button" onClick={generateReport}>
            <Sparkles size={18} />
            生成省心建议
          </BottomActionButton>
        )}
      </BottomActionBar>

      <LeadCaptureModal
        open={leadOpen}
        onClose={() => setLeadOpen(false)}
        resultType="risk"
        resultSnapshot={resultSnapshot}
      />
    </main>
  );
}

function QuizStartGuide() {
  return (
    <section className="rounded-[24px] bg-card p-4 shadow-card ring-1 ring-pine/10">
      <div className="flex gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-mint text-pine">
          <Sparkles size={18} />
        </span>
        <div>
          <p className="text-sm font-bold leading-relaxed text-ink">完成 12 个小问题后，系统会给出这趟出行的省心建议。</p>
          <p className="mt-1 text-xs font-medium leading-relaxed text-muted">分数越高，越建议选择高保障方案并认真留证。</p>
        </div>
      </div>
    </section>
  );
}

function QuestionCard({ question, index, value, onChange }) {
  return (
    <article className="screen-card rounded-[24px] p-4">
      <div className="mb-3 flex items-start gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mint text-sm font-bold text-pine">
          {index + 1}
        </span>
        <h2 className="pt-1 text-base font-bold leading-snug text-ink">{question.title}</h2>
      </div>
      <div className={`grid gap-2 ${question.options.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {question.options.map((option) => {
          const active = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`min-h-11 rounded-2xl px-2 text-center text-sm font-bold leading-tight ${
                active ? 'bg-pine text-white shadow-sm' : 'bg-mint text-pine'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </article>
  );
}

function RiskReport({ report }) {
  return (
    <div className="grid gap-4">
      <section className={`rounded-[24px] p-5 text-white shadow-soft ${report.heroClass}`}>
        <div className="flex items-center gap-2">
          <ShieldAlert size={19} />
          <p className="text-sm font-bold text-white/80">你的省心建议</p>
        </div>
        <h1 className="mt-3 text-[32px] font-bold leading-tight">{report.level}</h1>
        <p className="mt-4 text-xs font-bold text-white/65">本次省心指数</p>
        <p className="mt-2 text-4xl font-bold leading-none">{report.displayScore} / 100</p>
        <p className="mt-2 text-xs font-medium leading-relaxed text-white/72">分数越高，代表越建议选择高保障方案并认真留证。</p>
        <p className="mt-3 text-sm font-medium leading-relaxed text-white/90">{report.summary}</p>
      </section>

      <section className="screen-card rounded-[24px] p-4">
        <h2 className="text-lg font-bold text-ink">本次需要重点留意的地方</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {report.sources.map((source) => (
            <span key={source} className="rounded-full bg-mint px-3 py-2 text-xs font-bold text-pine">
              {source}
            </span>
          ))}
        </div>
      </section>

      <section className="screen-card rounded-[24px] p-4">
        <h2 className="text-lg font-bold text-ink">个性化建议</h2>
        <ul className="mt-3 grid gap-2 text-sm leading-relaxed text-muted">
          {report.reminders.map((reminder) => (
            <li key={reminder} className="rounded-2xl bg-mint/70 px-3 py-2.5">
              {reminder}
            </li>
          ))}
        </ul>
      </section>

      <section className="screen-card rounded-[24px] p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-coral" />
          <h2 className="text-lg font-bold text-ink">行动建议</h2>
        </div>
        <ul className="mt-3 grid gap-2 text-sm leading-relaxed text-muted">
          {actionSuggestions.map((suggestion) => (
            <li key={suggestion} className="flex gap-2 rounded-2xl bg-cream px-3 py-2.5">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-pine" />
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[24px] bg-card p-4 shadow-card ring-1 ring-pine/10">
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/price-compare"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-mint px-3 text-center text-sm font-bold leading-tight text-pine"
          >
            去比租车方案
          </Link>
          <Link
            to="/budget"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-mint px-3 text-center text-sm font-bold leading-tight text-pine"
          >
            去算整趟预算
          </Link>
          <Link
            to="/checklist"
            className="col-span-2 inline-flex min-h-12 items-center justify-center rounded-2xl bg-card px-3 text-center text-sm font-bold leading-tight text-pine ring-1 ring-pine/10"
          >
            去取车留证
          </Link>
        </div>
      </section>
    </div>
  );
}

function buildRiskReport(answers) {
  const rawScore = questions.reduce((total, question) => {
    const selected = answers[question.id];
    return total + (scoreRules[question.id]?.[selected] || 0);
  }, 0);
  const displayScore = Math.min(100, rawScore);
  const level = getRiskLevel(rawScore);

  return {
    rawScore,
    displayScore,
    level: level.label,
    summary: level.summary,
    tone: level.tone,
    badgeClass: level.badgeClass,
    heroClass: level.heroClass,
    sources: buildRiskSources(answers),
    reminders: buildReminders(answers),
  };
}

function getRiskLevel(score) {
  if (score <= 25) {
    return {
      label: '轻松出行型',
      summary: '这趟整体复杂度不高，按流程取车、拍好关键照片即可。',
      tone: 'pine',
      badgeClass: 'bg-mint text-pine ring-1 ring-pine/20',
      heroClass: 'bg-pine',
    };
  }

  if (score <= 50) {
    return {
      label: '常规省心型',
      summary: '建议至少选择中等保障，并完成省心版 8 项留证。',
      tone: 'amber',
      badgeClass: 'bg-amberSoft text-[#7A5521] ring-1 ring-[#E3CB8D]',
      heroClass: 'bg-[#B8762F]',
    };
  }

  if (score <= 75) {
    return {
      label: '建议高保障型',
      summary: '这趟路线或用车场景有一定复杂度，建议优先考虑高档保险，同时做好关键留证。',
      tone: 'amber',
      badgeClass: 'bg-[#F8D6B0] text-[#8A4B1F] ring-1 ring-[#E3A45D]',
      heroClass: 'bg-[#C96E2D]',
    };
  }

  return {
    label: '重点准备型',
    summary: '这趟不建议只看低价，建议选择更规范的平台、更高保障方案，并完整完成取车留证。',
    tone: 'amber',
    badgeClass: 'bg-amberSoft text-[#7A5521] ring-1 ring-[#E3CB8D]',
    heroClass: 'bg-[#A65F2A]',
  };
}

function buildRiskSources(answers) {
  const sources = [];

  if (answers.oneWay === 'yes' || answers.oneWay === 'unsure') sources.push('异地还车费用');
  if (answers.nightPickup === 'yes') sources.push('夜间取还车留证');
  if (answers.insurance === 'unclear' || answers.insurance === 'unsure' || answers.extraCoverage !== 'purchased') sources.push('保险责任确认');
  if (answers.deposit === 'unconfirmed') sources.push('押金与违章押金');
  if (answers.smartCar === 'yes' || answers.energyPlan === 'unplanned') sources.push('新能源补能');
  if (answers.specialRoute === 'yes' || answers.specialRoute === 'unsure') sources.push('山区/高原/长途路线');
  if (answers.multiDriver === 'yes') sources.push('多人驾驶理赔范围');
  if (answers.extraFees === 'unconfirmed' && (answers.oneWay === 'yes' || answers.oneWay === 'unsure')) sources.push('异地还车费用');
  if (answers.returnEnergy === 'unconfirmed') sources.push('还车油量或电量要求');

  return sources.length ? [...new Set(sources)] : ['整体信息确认较完整'];
}

function buildReminders(answers) {
  const reminders = [];

  if (answers.oneWay === 'yes' || answers.oneWay === 'unsure') {
    reminders.push('提前确认异地还车费是否已经计入平台总价。');
  }

  if (answers.nightPickup === 'yes') {
    reminders.push('建议开闪光灯拍车身、轮胎、轮毂、玻璃和底盘可见区域。');
  }

  if (answers.multiDriver === 'yes') {
    reminders.push('确认是否允许额外驾驶员，否则可能影响理赔。');
  }

  if (answers.smartCar === 'yes') {
    reminders.push('确认续航、充电口、补能条件、车辆启动方式和钥匙形式。');
  }

  if (answers.specialRoute === 'yes' || answers.specialRoute === 'unsure') {
    reminders.push('山区、高原或长途国道建议提前确认轮胎状态、备胎/补胎工具、补能点和救援范围。');
  }

  if (answers.insurance === 'unclear' || answers.insurance === 'unsure' || answers.extraCoverage !== 'purchased') {
    reminders.push('重点核对保险责任、不计免赔、事故自付额度、轮胎轮毂玻璃底盘是否覆盖。');
  }

  if (answers.deposit === 'unconfirmed') {
    reminders.push('确认车辆押金、违章押金、退还周期和冻结方式。');
  }

  if (answers.extraFees === 'unconfirmed') {
    reminders.push('超时费、超公里费、异地还车费请提前截图留证，避免只看日租金。');
  }

  if (answers.returnEnergy === 'unconfirmed') {
    reminders.push('还车前确认油量或电量要求，尽量拍下交车和还车时的仪表信息。');
  }

  if (answers.energyPlan === 'unplanned') {
    reminders.push('补能或加油点还没规划时，建议把第一天和最后一天的补给点先标出来。');
  }

  return reminders.length ? reminders : ['这趟整体复杂度不高，按流程取车、确认合同并完成关键留证即可。'];
}
