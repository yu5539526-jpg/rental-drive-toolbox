import { Check, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitUserData } from '../services/submitUserData.js';

const concernOptions = [
  '不知道租什么车',
  '怕验车被坑',
  '怕预算超支',
  '怕新能源补能不方便',
  '怕路线安排不合理',
  '怕保险看不懂',
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
      <form
        onSubmit={handleSubmit}
        className="safe-bottom max-h-[92vh] w-full max-w-[430px] overflow-y-auto rounded-t-[28px] bg-card p-5 shadow-soft sm:rounded-[28px]"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-coral">保存结果 · pYuY</p>
            <h2 className="mt-1 text-xl font-bold text-ink">保存结果并提交出行计划</h2>
            <p className="mt-1 text-sm text-muted">
              提交后会保存你的本次验车、预算或风险自测结果，方便后续整理自驾需求和优化工具。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-mint text-ink"
            aria-label="关闭弹窗"
          >
            <X size={19} />
          </button>
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
            你填写的昵称、目的地、出行月份、人数、预算区间、担心事项和联系方式，仅用于生成并保存本次出行计划、后续自驾需求分析和工具优化。
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

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="mt-5 min-h-12 w-full rounded-2xl bg-pine px-5 text-base font-bold text-white shadow-lg shadow-pine/20 disabled:cursor-not-allowed disabled:bg-muted/40"
        >
          {submitting ? '提交中...' : '提交并保存我的出行计划'}
        </button>
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
