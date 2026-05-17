import { ArrowRight, CheckCircle2, ClipboardCheck, Compass, Route, ShieldCheck, Sparkles, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMemo, useRef, useState } from 'react';
import BottomActionBar, { BottomActionButton } from '../components/BottomActionBar.jsx';
import LeadCaptureModal from '../components/LeadCaptureModal.jsx';
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
  '确认保险责任、不计免赔和自付额度',
  '确认押金、违章押金、超时费和异地还车费',
  '保留租车合同、取车照片、还车照片和平台沟通记录',
];

const questionGroups = [
  {
    title: '租车情况',
    description: '先看取还车方式、驾驶人和车型。',
    ids: ['rentalExperience', 'oneWay', 'nightPickup', 'multiDriver', 'smartCar'],
  },
  {
    title: '费用与保险',
    description: '再确认保障、押金和还车规则。',
    ids: ['insurance', 'extraCoverage', 'deposit', 'extraFees', 'returnEnergy'],
  },
  {
    title: '路线与用车',
    description: '最后补充路线复杂度和补能安排。',
    ids: ['specialRoute', 'energyPlan'],
  },
];

export default function RiskQuizPage() {
  const [answers, setAnswers] = useState({});
  const [reportVisible, setReportVisible] = useState(false);
  const [feedback, setFeedback] = useState('按真实情况点选就好，完成后会生成这趟的省心建议。');
  const [leadOpen, setLeadOpen] = useState(false);
  const questionRefs = useRef({});

  const report = useMemo(() => buildRiskReport(answers), [answers]);
  const answeredCount = Object.keys(answers).length;
  const canGenerate = answeredCount === questions.length;
  const groupedQuestions = useMemo(() => buildQuestionGroups(), []);
  const progressValue = (answeredCount / questions.length) * 100;

  const updateAnswer = (id, value) => {
    setAnswers((current) => ({ ...current, [id]: value }));
    setReportVisible(false);
    setFeedback('已记录，继续补充几题，建议会更准确。');
  };

  const generateReport = () => {
    if (!canGenerate) {
      const firstUnanswered = groupedQuestions.flatMap((group) => group.questions).find((question) => !answers[question.id]);
      setFeedback('还有几题没选，补充后建议会更准确。');
      questionRefs.current[firstUnanswered?.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    <main className="min-h-screen bg-[#F6F8F5] text-[#18322D]">
      <TopBar title="省心程度自测" />

      <section className="safe-bottom-action px-4 pt-4">
        {reportVisible ? (
          <RiskReport report={report} onSave={() => setLeadOpen(true)} />
        ) : (
          <div className="grid gap-5">
            <QuizIntroCard />
            <ProgressCard answeredCount={answeredCount} total={questions.length} progressValue={progressValue} feedback={feedback} />
            {groupedQuestions.map((group) => (
              <QuestionGroup
                key={group.title}
                group={group}
                answers={answers}
                questionRefs={questionRefs}
                onChange={updateAnswer}
              />
            ))}
          </div>
        )}
      </section>

      <BottomActionBar>
        {reportVisible ? (
          <BottomActionButton as={Link} to="/price-compare">
            去比租车方案
            <ArrowRight size={17} />
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

function QuizIntroCard() {
  return (
    <section className="rounded-[24px] bg-white p-4 shadow-card ring-1 ring-[#2F7A6D]/10">
      <div className="flex items-start gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] bg-[#F2F7F5] text-2xl" aria-hidden="true">
          🧭
        </span>
        <div className="min-w-0">
          <h1 className="text-xl font-bold leading-tight text-[#18322D]">省心程度自测</h1>
          <p className="mt-1.5 text-sm font-semibold leading-relaxed text-[#667B75]">
            看看这趟适合买高档保险，还是认真留证更划算。
          </p>
          <div className="mt-3 rounded-[18px] bg-[#F2F7F5] px-3 py-2.5">
            <p className="text-xs font-bold leading-relaxed text-[#18322D]">完成 12 个小问题后，系统会给出这趟出行的省心建议。</p>
            <p className="mt-1 text-xs font-medium leading-relaxed text-[#667B75]">分数越高，越建议选择高保障方案并认真留证。</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProgressCard({ answeredCount, total, progressValue, feedback }) {
  return (
    <section className="rounded-[24px] bg-white p-4 shadow-card ring-1 ring-[#2F7A6D]/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-[#667B75]">自测进度</p>
          <h2 className="mt-1 text-lg font-bold leading-tight text-[#18322D]">已完成 {answeredCount} / {total} 题</h2>
          <p className="mt-1 text-xs font-semibold text-[#667B75]">大约 1 分钟完成</p>
        </div>
        <span className="shrink-0 rounded-full bg-[#F9EDC6] px-3 py-1.5 text-xs font-bold text-[#735B16]">
          完成后生成省心建议
        </span>
      </div>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#DDEFEA]">
        <div className="h-full rounded-full bg-[#2F7A6D] transition-all duration-300" style={{ width: `${progressValue}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs font-bold text-[#667B75]">
        <span>{Math.round(progressValue)}% 已完成</span>
        <span>{total - answeredCount} 题待选</span>
      </div>
      <p className="mt-3 rounded-[18px] bg-[#F2F7F5] px-3 py-2 text-xs font-bold leading-relaxed text-[#2F7A6D]" role="status" aria-live="polite">
        {feedback}
      </p>
    </section>
  );
}

function QuestionGroup({ group, answers, questionRefs, onChange }) {
  return (
    <section className="grid gap-3">
      <div className="px-1">
        <p className="text-xs font-bold tracking-[0.08em] text-[#2F7A6D]">{group.title}</p>
        <p className="mt-1 text-xs font-medium leading-relaxed text-[#667B75]">{group.description}</p>
      </div>
      {group.questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          index={question.index}
          value={answers[question.id]}
          onChange={(value) => onChange(question.id, value)}
          setNode={(node) => {
            if (node) questionRefs.current[question.id] = node;
          }}
        />
      ))}
    </section>
  );
}

function QuestionCard({ question, index, value, onChange, setNode }) {
  return (
    <article ref={setNode} className="rounded-[24px] bg-white p-4 shadow-card ring-1 ring-[#2F7A6D]/10 scroll-mt-24">
      <div className="mb-3 flex items-start gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#F2F7F5] text-sm font-bold text-[#2F7A6D]">
          {index + 1}
        </span>
        <h2 className="pt-1 text-base font-bold leading-snug text-[#18322D]">{question.title}</h2>
      </div>
      <div className={`grid gap-2 ${question.options.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
        {question.options.map((option) => {
          const active = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`min-h-11 rounded-full px-3 text-center text-sm font-bold leading-tight ring-1 ${
                active
                  ? 'bg-[#2F7A6D] text-white shadow-sm ring-[#2F7A6D]'
                  : 'bg-[#F2F7F5] text-[#667B75] ring-[#2F7A6D]/8 hover:bg-[#E8F2EF] hover:text-[#18322D]'
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

function RiskReport({ report, onSave }) {
  return (
    <div className="grid gap-4">
      <section className="rounded-[24px] bg-gradient-to-br from-[#2F7A6D] to-[#1E5C52] p-5 text-white shadow-soft">
        <div className="flex items-center gap-2">
          <ShieldCheck size={19} />
          <p className="text-sm font-bold text-white/80">你的省心建议</p>
        </div>
        <h1 className="mt-3 text-[30px] font-bold leading-tight">{report.level}</h1>
        <div className="mt-4 rounded-[20px] bg-white/12 p-3 ring-1 ring-white/12">
          <p className="text-xs font-bold text-white/70">本次省心指数</p>
          <p className="mt-1 text-4xl font-bold leading-none">{report.displayScore} / 100</p>
        </div>
        <p className="mt-2 text-xs font-medium leading-relaxed text-white/72">分数越高，代表越建议选择高保障方案并认真留证。</p>
        <p className="mt-3 text-sm font-medium leading-relaxed text-white/90">{report.summary}</p>
      </section>

      <section className="rounded-[24px] bg-white p-4 shadow-card ring-1 ring-[#2F7A6D]/10">
        <div className="flex items-center gap-2">
          <Compass size={18} className="text-[#2F7A6D]" />
          <h2 className="text-lg font-bold text-[#18322D]">本次需要重点留意的地方</h2>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {report.sources.map((source) => (
            <span key={source} className="rounded-full bg-[#F2F7F5] px-3 py-2 text-xs font-bold text-[#2F7A6D] ring-1 ring-[#2F7A6D]/8">
              {source}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] bg-white p-4 shadow-card ring-1 ring-[#2F7A6D]/10">
        <div className="flex items-center gap-2">
          <ClipboardCheck size={18} className="text-[#2F7A6D]" />
          <h2 className="text-lg font-bold text-[#18322D]">个性化建议</h2>
        </div>
        <ul className="mt-3 grid gap-2 text-sm leading-relaxed text-[#667B75]">
          {report.reminders.map((reminder) => (
            <li key={reminder} className="rounded-[18px] bg-[#F2F7F5] px-3 py-2.5">
              {reminder}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[24px] bg-white p-4 shadow-card ring-1 ring-[#2F7A6D]/10">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={18} className="text-[#2F7A6D]" />
          <h2 className="text-lg font-bold text-[#18322D]">行动建议</h2>
        </div>
        <ul className="mt-3 grid gap-2 text-sm leading-relaxed text-[#667B75]">
          {actionSuggestions.map((suggestion) => (
            <li key={suggestion} className="flex gap-2 rounded-[18px] bg-[#F2F7F5] px-3 py-2.5">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#2F7A6D]" />
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[24px] bg-white p-4 shadow-card ring-1 ring-[#2F7A6D]/10">
        <div className="flex items-center gap-2">
          <Route size={18} className="text-[#2F7A6D]" />
          <h2 className="text-lg font-bold text-[#18322D]">下一步</h2>
        </div>
        <div className="mt-3 grid gap-2">
          <Link
            to="/price-compare"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#2F7A6D] px-3 text-center text-sm font-bold leading-tight text-white shadow-lg shadow-[#2F7A6D]/20"
          >
            去比租车方案
            <ArrowRight size={16} />
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/budget"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#F2F7F5] px-3 text-center text-sm font-bold leading-tight text-[#2F7A6D]"
            >
              去算整趟预算
            </Link>
            <Link
              to="/checklist"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#F2F7F5] px-3 text-center text-sm font-bold leading-tight text-[#2F7A6D]"
            >
              去取车留证
            </Link>
          </div>
          <button
            type="button"
            onClick={onSave}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-3 text-center text-sm font-bold leading-tight text-[#2F7A6D] ring-1 ring-[#2F7A6D]/15"
          >
            <WalletCards size={16} />
            保存到出行计划
          </button>
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
    };
  }

  if (score <= 50) {
    return {
      label: '常规省心型',
      summary: '建议至少选择中等保障，并完成省心版 8 项留证。',
      tone: 'amber',
      badgeClass: 'bg-amberSoft/45 text-[#735B16] ring-1 ring-warning/20',
    };
  }

  if (score <= 75) {
    return {
      label: '建议高保障型',
      summary: '这趟路线或用车场景有一定复杂度，建议优先考虑高档保险，同时做好关键留证。',
      tone: 'amber',
      badgeClass: 'bg-amberSoft/55 text-[#735B16] ring-1 ring-warning/25',
    };
  }

  return {
    label: '重点准备型',
    summary: '这趟不建议只看低价，建议选择更规范的平台、更高保障方案，并完整完成取车留证。',
    tone: 'amber',
    badgeClass: 'bg-amberSoft/45 text-[#735B16] ring-1 ring-warning/20',
  };
}

function buildQuestionGroups() {
  const questionMap = new Map(questions.map((question, index) => [question.id, { ...question, index }]));
  return questionGroups.map((group) => ({
    ...group,
    questions: group.ids.map((id) => questionMap.get(id)).filter(Boolean),
  }));
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
    reminders.push('建议核对保险责任、不计免赔、自付额度，以及轮胎轮毂玻璃底盘是否覆盖。');
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
