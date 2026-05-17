import { ArrowLeft, Check } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomActionButton } from './BottomActionBar.jsx';
import { submitUserData } from '../services/submitUserData.js';

const concernOptions = [
  '不知道租什么车',
  '不同平台价格看不懂',
  '不知道保险买哪档',
  '担心还车被扣钱',
  '不知道整趟要花多少钱',
  '担心新能源补能',
  '担心行程太赶',
  '担心同行人预算谈不拢',
  '担心押金和违章押金',
  '其他',
];

const budgetOptions = ['2000 以下', '2000-5000', '5000-8000', '8000 以上', '还没确定'];

export default function LeadCaptureModal({ open, onClose, resultType, resultSnapshot, defaultDestination = '' }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [form, setForm] = useState({
    nickname: '',
    destination: defaultDestination,
    travelMonth: '',
    people: '',
    budgetRange: '',
    concerns: [],
    customPainPoint: '',
    contact: '',
    caseAnalysis: '是',
    privacyAccepted: false,
  });

  const canSubmit = useMemo(
    () => form.nickname.trim() && form.destination.trim() && form.travelMonth.trim() && form.people && form.privacyAccepted,
    [form],
  );

  useEffect(() => {
    if (!open || !defaultDestination) return;
    setForm((current) => (current.destination ? current : { ...current, destination: defaultDestination }));
  }, [defaultDestination, open]);

  if (!open) return null;

  const update = (name, value) => setForm((current) => ({ ...current, [name]: value }));

  const toggleConcern = (concern) => {
    setForm((current) => ({
      ...current,
      concerns: current.concerns.includes(concern)
        ? current.concerns.filter((item) => item !== concern)
        : [...current.concerns, concern],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    if (!form.privacyAccepted) {
      setSubmitMessage('请先确认隐私提示，再提交出行计划。');
      return;
    }
    if (!canSubmit) {
      setSubmitMessage('请补全必填信息后再提交。');
      return;
    }
    setSubmitting(true);
    setSubmitMessage('正在保存并生成出行计划...');

    try {
      await submitUserData({
        profile: {
          xhsNickname: form.nickname.trim(),
          destination: form.destination.trim(),
          travelMonth: form.travelMonth.trim(),
          people: Number(form.people) || form.people,
          budgetRange: form.budgetRange,
          concerns: form.concerns,
          selectedPainPoints: form.concerns,
          customPainPoint: form.concerns.includes('其他') ? form.customPainPoint.trim() : '',
          contact: form.contact.trim(),
          caseAnalysis: form.caseAnalysis,
        },
        resultType,
        resultSnapshot,
      });

      setSubmitMessage('已保存，正在打开出行计划结果页...');

      navigate('/success', {
        state: {
          resultType,
          nickname: form.nickname.trim(),
        },
      });
    } catch {
      setSubmitting(false);
      setSubmitMessage('保存失败，请稍后重试。');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 px-4 sm:items-center">
      <form onSubmit={handleSubmit} className="flex max-h-[92vh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[28px] bg-card shadow-soft sm:rounded-[28px]">
        <div className="grid h-14 shrink-0 grid-cols-[44px_minmax(0,1fr)_44px] items-center border-b border-[rgba(47,107,95,0.08)] bg-card/95 px-3 backdrop-blur">
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-full text-pine"
            aria-label="返回"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="truncate px-2 text-center text-[17px] font-bold leading-tight text-ink">保存出行计划</h2>
          <span className="h-11 w-11" aria-hidden="true" />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-4">
          <div className="mb-4">
            <p className="text-xs font-bold text-coral">保存结果 · pYuY</p>
            <h3 className="mt-1 text-xl font-bold text-ink">提交并保存出行计划</h3>
            <p className="mt-1 text-sm text-muted">
              提交后会保存你的本次留证、预算或省心自测结果，方便后续整理自驾需求和优化工具。
            </p>
          </div>

          <div className="grid gap-3">
          <Field label="小红书昵称" required>
            <input
              value={form.nickname}
              onChange={(event) => update('nickname', event.target.value)}
              className="h-12 w-full rounded-[14px] border border-pine/20 bg-card px-3.5 outline-none shadow-sm focus:border-pine focus:ring-2 focus:ring-pine/10"
              placeholder="例如：pYuY"
            />
          </Field>

          <Field label="计划目的地" required>
            <input
              value={form.destination}
              onChange={(event) => update('destination', event.target.value)}
              className="h-12 w-full rounded-[14px] border border-pine/20 bg-card px-3.5 outline-none shadow-sm focus:border-pine focus:ring-2 focus:ring-pine/10"
              placeholder="例如：川西、大理、海南"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="出行月份" required>
              <input
                value={form.travelMonth}
                onChange={(event) => update('travelMonth', event.target.value)}
                className="h-12 w-full rounded-[14px] border border-pine/20 bg-card px-3.5 outline-none shadow-sm focus:border-pine focus:ring-2 focus:ring-pine/10"
                placeholder="例如：7 月"
              />
            </Field>
            <Field label="出行人数" required>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                value={form.people}
                onChange={(event) => update('people', event.target.value)}
                className="h-12 w-full rounded-[14px] border border-pine/20 bg-card px-3.5 outline-none shadow-sm focus:border-pine focus:ring-2 focus:ring-pine/10"
                placeholder="2"
              />
            </Field>
          </div>

          <Field label="预算区间">
            <div className="flex flex-wrap gap-2">
              {budgetOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => update('budgetRange', option)}
                  className={`min-h-11 rounded-full px-3 py-2 text-sm font-bold ${
                    form.budgetRange === option ? 'bg-pine text-white' : 'bg-mint text-pine'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </Field>

          <Field label="最担心的问题（可多选）">
            <div className="flex flex-wrap gap-2">
              {concernOptions.map((concern) => {
                const active = form.concerns.includes(concern);
                return (
                  <button
                    key={concern}
                    type="button"
                    onClick={() => toggleConcern(concern)}
                    className={`inline-flex min-h-11 items-center gap-1 rounded-full px-3 py-2 text-sm font-bold transition ${
                      active ? 'bg-amberSoft text-[#7A5521] ring-1 ring-[#E3CB8D]' : 'bg-mint text-pine'
                    }`}
                  >
                    {active ? <Check size={14} /> : null}
                    {concern}
                  </button>
                );
              })}
            </div>
            {!form.concerns.length ? (
              <p className="mt-2 rounded-2xl bg-cream px-3 py-2 text-xs font-bold leading-relaxed text-muted">
                选择你最担心的问题，我后续可以优先整理类似案例。
              </p>
            ) : null}
            {form.concerns.includes('其他') ? (
              <input
                value={form.customPainPoint}
                onChange={(event) => update('customPainPoint', event.target.value)}
                className="mt-3 h-12 w-full rounded-[14px] border border-pine/20 bg-card px-3.5 outline-none shadow-sm focus:border-pine focus:ring-2 focus:ring-pine/10"
                placeholder="可以补充你的具体担心，比如路线、保险、预算分摊等"
              />
            ) : null}
          </Field>

          <Field label="联系方式（选填）">
            <input
              value={form.contact}
              onChange={(event) => update('contact', event.target.value)}
              className="h-12 w-full rounded-[14px] border border-pine/20 bg-card px-3.5 outline-none shadow-sm focus:border-pine focus:ring-2 focus:ring-pine/10"
              placeholder="微信 / 手机号 / 邮箱"
            />
            <span className="mt-1.5 block text-xs leading-relaxed text-muted">不要填写身份证、银行卡、精确住址等敏感信息。</span>
          </Field>

          <Field label="是否愿意被选为免费案例分析">
            <div className="grid grid-cols-2 gap-2">
              {['是', '否'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => update('caseAnalysis', option)}
                  className={`rounded-2xl px-4 py-3 font-bold ${
                    form.caseAnalysis === option ? 'bg-pine text-white' : 'bg-mint text-pine'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <div className="mt-4 rounded-2xl bg-mint px-3 py-3 text-xs font-medium leading-relaxed text-muted">
          <p className="font-bold text-ink">隐私提示</p>
          <p className="mt-1">
            你填写的昵称、目的地、出行月份、人数、预算区间、担心事项和联系方式，仅用于生成并保存本次出行计划、后续自驾需求分析、小红书匿名案例整理和工具优化。
          </p>
          <p className="mt-1">请不要填写身份证、银行卡、精确住址、驾驶证号等敏感信息。</p>
          <label className="mt-3 flex items-start gap-2 rounded-2xl bg-card px-3 py-3 text-ink">
            <input
              type="checkbox"
              checked={form.privacyAccepted}
              onChange={(event) => update('privacyAccepted', event.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-pine"
            />
            <span>我已阅读并确认以上隐私提示，同意保存本次出行计划。</span>
          </label>
        </div>

        {submitMessage ? (
          <p className="mt-3 rounded-2xl bg-amberSoft px-3 py-2 text-xs font-bold leading-relaxed text-[#7A5521]" role="status" aria-live="polite">
            {submitMessage}
          </p>
        ) : null}

        </div>

        <div className="modal-bottom-action shrink-0 px-5 pt-3">
          <BottomActionButton type="submit" disabled={!canSubmit || submitting} className="text-base disabled:cursor-not-allowed">
          {submitting ? '提交中...' : '提交并保存我的出行计划'}
          </BottomActionButton>
        </div>
      </form>
    </div>
  );
}
function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-ink">
        {label}
        {required ? <span className="text-coral"> *</span> : null}
      </span>
      {children}
    </label>
  );
}
