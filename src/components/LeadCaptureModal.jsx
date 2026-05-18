import { ArrowLeft, Check } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
const inputClass =
  'h-12 w-full rounded-[16px] border border-pine/15 bg-aquaCard px-3.5 text-[15px] font-semibold text-ink outline-none transition placeholder:text-muted/55 focus:border-pine focus:bg-card focus:ring-2 focus:ring-pine/12';

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
    setSubmitMessage('正在保存...');

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

      setSubmitMessage('已保存，正在打开结果页...');

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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 px-3 sm:items-center">
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[94vh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[24px] bg-cream shadow-soft sm:rounded-[24px]"
      >
        <div className="grid h-14 shrink-0 grid-cols-[44px_minmax(0,1fr)_44px] items-center bg-card px-3">
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

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-4">
          <section className="rounded-[24px] bg-card p-4 shadow-card ring-1 ring-pine/10">
            <div className="mb-5">
              <p className="text-xs font-bold text-pine">pYuY 出行计划</p>
              <h3 className="mt-1 text-xl font-bold leading-tight text-ink">保存出行计划</h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-muted">
                留下你的目的地和担心的问题，后续可以整理成匿名案例参考。
              </p>
            </div>

            <div className="grid gap-4">
              <Field label="小红书昵称" required>
                <input
                  value={form.nickname}
                  onChange={(event) => update('nickname', event.target.value)}
                  className={inputClass}
                  placeholder="例如：pYuY"
                />
              </Field>

              <Field label="计划目的地" required>
                <input
                  value={form.destination}
                  onChange={(event) => update('destination', event.target.value)}
                  className={inputClass}
                  placeholder="例如：川西、大理、海南"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="出行月份" required>
                  <input
                    value={form.travelMonth}
                    onChange={(event) => update('travelMonth', event.target.value)}
                    className={inputClass}
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
                    className={inputClass}
                    placeholder="2"
                  />
                </Field>
              </div>

              <Field label="预算区间">
                <div className="flex flex-wrap gap-2">
                  {budgetOptions.map((option) => (
                    <PillButton key={option} active={form.budgetRange === option} onClick={() => update('budgetRange', option)}>
                      {option}
                    </PillButton>
                  ))}
                </div>
              </Field>

              <Field label="最担心的问题（可多选）">
                <div className="flex flex-wrap gap-2">
                  {concernOptions.map((concern) => {
                    const active = form.concerns.includes(concern);
                    return (
                      <PillButton key={concern} active={active} onClick={() => toggleConcern(concern)}>
                        {active ? <Check size={14} /> : null}
                        {concern}
                      </PillButton>
                    );
                  })}
                </div>
                {!form.concerns.length ? (
                  <p className="mt-2 rounded-[18px] bg-aquaCard px-3 py-2 text-xs font-bold leading-relaxed text-muted">
                    选几项最关心的内容，后续整理计划会更贴近你的需求。
                  </p>
                ) : null}
                {form.concerns.includes('其他') ? (
                  <input
                    value={form.customPainPoint}
                    onChange={(event) => update('customPainPoint', event.target.value)}
                    className={`${inputClass} mt-3`}
                    placeholder="可以补充你的具体担心，比如路线、保险、预算分摊等"
                  />
                ) : null}
              </Field>

              <Field label="联系方式（选填）">
                <input
                  value={form.contact}
                  onChange={(event) => update('contact', event.target.value)}
                  className={inputClass}
                  placeholder="微信 / 手机号 / 邮箱"
                />
                <span className="mt-1.5 block text-xs leading-relaxed text-muted">联系方式仍然选填，用于后续与你确认案例细节。</span>
              </Field>

              <Field label="是否愿意被选为免费案例分析">
                <div className="grid grid-cols-2 gap-2">
                  {['是', '否'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => update('caseAnalysis', option)}
                      className={`min-h-11 rounded-[16px] px-4 text-sm font-bold ${
                        form.caseAnalysis === option ? 'bg-pine text-white shadow-sm' : 'bg-aquaCard text-pine'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            <div className="mt-5 rounded-[20px] bg-aquaCard px-3 py-3 text-xs font-medium leading-relaxed text-muted">
              <p className="font-bold text-ink">隐私提示</p>
              <p className="mt-1">
                仅用于整理你的出行计划和后续案例分析参考，不会公开你的联系方式。若用于内容案例，会默认匿名处理。
              </p>
              <label className="mt-3 flex items-start gap-2 rounded-[18px] bg-card px-3 py-3 text-ink ring-1 ring-pine/10">
                <input
                  type="checkbox"
                  checked={form.privacyAccepted}
                  onChange={(event) => update('privacyAccepted', event.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-pine"
                />
                <span>我已了解并同意保存本次出行计划信息。</span>
              </label>
            </div>

            {submitMessage ? (
              <p className="mt-3 rounded-[18px] bg-amberSoft px-3 py-2 text-xs font-bold leading-relaxed text-amberDark" role="status" aria-live="polite">
                {submitMessage}
              </p>
            ) : null}
          </section>
        </div>

        <div className="modal-bottom-action shrink-0 bg-cream/95 px-4 pt-3">
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="inline-flex h-12 min-h-12 w-full items-center justify-center rounded-[18px] bg-gradient-to-r from-[#174B63] to-[#0D2B3D] px-4 text-base font-bold text-white shadow-lg shadow-pine/20 disabled:cursor-not-allowed disabled:from-muted/50 disabled:to-muted/50"
          >
            {submitting ? '正在保存...' : '提交并保存'}
          </button>
        </div>
      </form>
    </div>
  );
}

function PillButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold leading-tight transition ${
        active ? 'bg-pine text-white shadow-sm' : 'bg-aquaCard text-pine ring-1 ring-pine/8'
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-ink">
        {label}
        {required ? <span className="text-red"> *</span> : null}
      </span>
      {children}
    </label>
  );
}
