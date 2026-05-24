import { Calculator, ChevronRight, ClipboardList, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const entryActions = [
  {
    to: '/budget?mode=quick',
    state: { quickBudget: true },
    icon: Calculator,
    eyebrow: '已经有租车总价',
    title: '速速看预算',
    text: '先把整趟大概花费算出来',
  },
  {
    to: '/toolbox',
    icon: ClipboardList,
    eyebrow: '还想慢慢比较',
    title: '慢慢出方案',
    text: '车型、平台、预算、验车一步步来',
  },
];

export default function EntryHome() {
  return (
    <main className="min-h-screen overflow-hidden bg-cream text-ink">
      <section className="relative min-h-[calc(100vh-96px)] px-4 pb-6 pt-4">
        <div className="absolute inset-x-0 top-0 h-[270px] bg-[linear-gradient(135deg,#10A7D8_0%,#0797BD_45%,#18C3C7_100%)]" />
        <div className="absolute right-[-76px] top-[-72px] h-44 w-44 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute left-[-54px] top-32 h-36 w-36 rounded-full bg-[#48E0CF]/25 blur-3xl" />

        <div className="relative flex min-h-[calc(100vh-120px)] flex-col">
          <div className="inline-flex min-h-8 w-fit items-center gap-1.5 rounded-full bg-white/20 px-3 text-xs font-bold text-white ring-1 ring-white/20">
            <Sparkles size={14} className="text-white" />
            pYuY
          </div>

          <div className="mt-4 rounded-[24px] bg-white/[0.16] p-4 text-white ring-1 ring-white/20 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold tracking-[0.08em] text-white/80">租车自驾先理清，再出发</p>
                <h1 className="mt-1 text-[24px] font-black leading-tight">今天想怎么开始？</h1>
                <p className="mt-2 max-w-[14rem] text-[13px] font-semibold leading-relaxed text-white/90">
                  已经知道租车总价就先算预算；还没定方案，就按原来的工具箱慢慢理。
                </p>
              </div>
              <div className="shrink-0 rounded-[22px] bg-white/[0.22] p-1.5 shadow-[0_12px_30px_rgba(5,93,125,0.24)] ring-1 ring-white/20">
                <img
                  src="/images/pyuy-lighthouse-hero.png"
                  alt="pyUY 租车自驾工具箱个人图像"
                  width="78"
                  height="78"
                  fetchPriority="high"
                  className="h-[78px] w-[78px] rounded-[18px] object-cover"
                />
              </div>
            </div>
          </div>

          <section className="mt-4 grid flex-1 content-center gap-3.5 rounded-[26px] bg-card/[0.96] p-3.5 shadow-[0_18px_42px_rgba(10,128,163,0.16)] ring-1 ring-skyLine backdrop-blur">
            {entryActions.map((action, index) => (
              <EntryAction key={action.to} {...action} index={index} />
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}

function EntryAction({ to, state, icon: Icon, eyebrow, title, text, index }) {
  return (
    <Link
      to={to}
      state={state}
      aria-label={title}
      className="fade-up group flex min-h-[152px] items-stretch gap-3 rounded-[24px] bg-white p-3.5 text-ink shadow-[0_10px_26px_rgba(8,116,151,0.12)] ring-1 ring-skyLine hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(8,116,151,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine/[0.35]"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <span className="grid h-14 w-14 shrink-0 place-items-center self-center rounded-[20px] bg-[linear-gradient(135deg,#0EA5D6,#12BFC1)] text-white shadow-md shadow-pine/15">
        <Icon size={27} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col justify-center">
        <span className="text-[11px] font-black leading-tight text-pine">{eyebrow}</span>
        <span className="mt-1 text-[22px] font-black leading-tight text-ink">{title}</span>
        <span className="mt-2 text-[12px] font-semibold leading-relaxed text-muted">{text}</span>
      </span>
      <span className="grid h-9 w-9 shrink-0 place-items-center self-center rounded-full bg-aquaCard text-pine transition-transform duration-200 group-hover:translate-x-0.5">
        <ChevronRight size={18} />
      </span>
    </Link>
  );
}
