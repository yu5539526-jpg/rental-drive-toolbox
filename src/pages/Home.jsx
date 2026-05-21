import { useState } from 'react';
import { Calculator, Camera, ChevronDown, ChevronRight, MapPin, Scale, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const whyItems = [
  '关键照片顺手拍齐，减少还车沟通成本',
  '提前估算油费、电费、保险和门票',
  '生成自己的出行计划，方便保存和复盘',
];

const tools = [
  {
    to: '/car-recommend',
    icon: MapPin,
    title: '目的地车型推荐',
    text: '按目的地、人数和行李选车',
    button: '选车',
  },
  {
    to: '/price-compare',
    icon: Scale,
    title: '比租车方案',
    text: '平台、车型、保险放一起看',
    button: '对比',
  },
  {
    to: '/budget',
    icon: Calculator,
    title: '算整趟预算',
    text: '租车、油电、住宿一次算清',
    button: '计算',
  },
  {
    to: '/car-inspection-map',
    icon: ShieldCheck,
    title: '车身验车避坑图',
    text: '点车身部位看哪里要重点拍',
    button: '验车',
  },
];

export default function Home() {
  const [isWhyOpen, setIsWhyOpen] = useState(false);

  return (
    <main className="min-h-screen overflow-hidden bg-cream text-ink">
      <section className="relative px-4 pb-5 pt-4">
        <div className="absolute inset-x-0 top-0 h-[238px] bg-[linear-gradient(135deg,#10A7D8_0%,#0797BD_45%,#18C3C7_100%)]" />
        <div className="absolute right-[-72px] top-[-74px] h-44 w-44 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute left-[-52px] top-28 h-32 w-32 rounded-full bg-[#48E0CF]/25 blur-3xl" />

        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-white/20 px-3 text-xs font-bold text-white ring-1 ring-white/20">
              <Sparkles size={14} className="text-white" />
              pYuY
            </div>
            <div className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/20">小红书收藏版</div>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-[22px] bg-white/[0.16] p-3 text-white ring-1 ring-white/20 backdrop-blur">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold tracking-[0.08em] text-white/80">租车自驾先理清，再出发</p>
              <h1 className="mt-1 text-[23px] font-black leading-tight">租车自驾工具箱</h1>
              <p className="mt-1.5 max-w-[13rem] text-[13px] font-semibold leading-relaxed text-white/90">
                出发前 3 分钟，把车型、预算、方案和验车一次理顺。
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

          <section className="mt-3 rounded-[24px] bg-card/[0.96] p-3 shadow-[0_18px_42px_rgba(10,128,163,0.16)] ring-1 ring-skyLine backdrop-blur">
            <div className="grid grid-cols-2 gap-3">
              {tools.map((tool) => (
                <ToolEntry key={tool.to} {...tool} />
              ))}
            </div>
          </section>

          <section className="fade-up mt-4 rounded-[20px] border border-skyLine bg-card/[0.92] p-3 shadow-card">
            <button
              type="button"
              aria-expanded={isWhyOpen}
              onClick={() => setIsWhyOpen((open) => !open)}
              className="flex w-full items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine/[0.35]"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-mint text-pine">
                <Camera size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-[14px] font-bold leading-tight text-ink">为什么出发前建议先理一遍</h2>
                <p className="mt-0.5 text-[11px] font-medium leading-relaxed text-muted">少走弯路，取还车也更安心。</p>
              </div>
              <ChevronDown
                size={17}
                className={`shrink-0 text-pine transition-transform duration-200 ${isWhyOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isWhyOpen ? (
              <ul className="mt-3 grid gap-2">
                {whyItems.map((item) => (
                  <li key={item} className="flex gap-2 rounded-2xl bg-aquaCard px-3 py-2 text-xs font-bold leading-relaxed text-ink">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-pine" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          <p className="mt-3 rounded-[18px] bg-amberSoft/[0.55] px-3 py-2.5 text-center text-xs font-bold leading-relaxed text-amberDark ring-1 ring-warning/20">
            收藏后可随时回来算预算、选车型、对比方案和验车留证
          </p>
        </div>
      </section>
    </main>
  );
}

function ToolEntry({ to, icon: Icon, title, text, button }) {
  return (
    <article className="fade-up flex min-h-[150px] flex-col rounded-[20px] bg-white p-3 text-ink shadow-[0_8px_22px_rgba(8,116,151,0.10)] ring-1 ring-skyLine">
      <div className="flex items-start justify-between gap-2">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,#0EA5D6,#12BFC1)] text-white shadow-md shadow-pine/15">
          <Icon size={21} />
        </span>
        <ChevronRight size={17} className="mt-1 shrink-0 text-pine/70" />
      </div>
      <div className="mt-3 min-w-0 flex-1">
        <h2 className="text-[15px] font-black leading-tight text-ink">{title}</h2>
        <p className="mt-1 text-[11px] font-semibold leading-relaxed text-muted">{text}</p>
      </div>
      <Link
        to={to}
        className="mt-3 inline-flex min-h-9 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#0EA5D6] to-[#12BFC1] px-3 text-center text-[12px] font-black leading-tight text-white shadow-md shadow-pine/15 hover:from-[#0B93C2] hover:to-[#0EAFAF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine/[0.35]"
      >
        开始{button}
      </Link>
    </article>
  );
}
