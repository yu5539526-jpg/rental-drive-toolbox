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
  const [form, setForm] = useState({
    nickname: '',
    destination: defaultDestination,
    travelMonth: '',
    people: '',
    budgetRange: '',
    concerns: [],
    contact: '',
    caseAnalysis: '是',
  });

  const canSubmit = useMemo(
    () => form.nickname.trim() && form.destination.trim() && form.travelMonth.trim() && form.people,
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
    if (!canSubmit || submitting) return;
    setSubmitting(true);

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

    navigate('/success', {
      state: {
        resultType,
        nickname: form.nickname.trim(),
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 px-4 sm:items-center">
      <form
        onSubmit={handleSubmit}
        className="safe-bottom max-h-[92vh] w-full max-w-[430px] overflow-y-auto rounded-t-[28px] bg-white p-5 shadow-soft sm:rounded-[28px]"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-coral">保存结果</p>
            <h2 className="mt-1 text-xl font-black text-ink">保存结果并提交出行计划</h2>
            <p className="mt-1 text-sm text-ink/60">
              提交后会保存你的本次验车/预算结果，方便后续整理自驾需求和优化工具。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mint text-ink"
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
              className="w-full rounded-2xl border border-pine/15 bg-mint/70 px-4 py-3 outline-none focus:border-pine"
              placeholder="例如：爱自驾的小鱼"
            />
          </Field>

          <Field label="计划目的地" required>
            <input
              value={form.destination}
              onChange={(event) => update('destination', event.target.value)}
              className="w-full rounded-2xl border border-pine/15 bg-mint/70 px-4 py-3 outline-none focus:border-pine"
              placeholder="例如：川西、大理、海南"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="出行月份" required>
              <input
                value={form.travelMonth}
                onChange={(event) => update('travelMonth', event.target.value)}
                className="w-full rounded-2xl border border-pine/15 bg-mint/70 px-4 py-3 outline-none focus:border-pine"
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
                className="w-full rounded-2xl border border-pine/15 bg-mint/70 px-4 py-3 outline-none focus:border-pine"
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
                  className={`rounded-full px-3 py-2 text-sm font-bold transition ${
                    form.budgetRange === option ? 'bg-pine text-white' : 'bg-mint text-ink/70'
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
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-bold transition ${
                      active ? 'bg-amberSoft text-[#99551d] ring-1 ring-[#efc894]' : 'bg-mint text-ink/70'
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
              className="w-full rounded-2xl border border-pine/15 bg-mint/70 px-4 py-3 outline-none focus:border-pine"
              placeholder="微信 / 手机号 / 邮箱"
            />
          </Field>

          <Field label="是否愿意被选为免费案例分析">
            <div className="grid grid-cols-2 gap-2">
              {['是', '否'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => update('caseAnalysis', option)}
                  className={`rounded-2xl px-4 py-3 font-black ${
                    form.caseAnalysis === option ? 'bg-pine text-white' : 'bg-mint text-ink/70'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <p className="mt-4 rounded-2xl bg-mint px-3 py-2 text-xs font-bold leading-relaxed text-ink/58">
          你填写的信息仅用于自驾需求分析、案例整理和工具优化，不会公开展示个人联系方式。
        </p>

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="mt-5 w-full rounded-2xl bg-pine px-5 py-4 text-base font-black text-white shadow-lg shadow-pine/20 disabled:cursor-not-allowed disabled:bg-ink/25"
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
      <span className="mb-1.5 block text-sm font-black text-ink">
        {label}
        {required ? <span className="text-coral"> *</span> : null}
      </span>
      {children}
    </label>
  );
}
