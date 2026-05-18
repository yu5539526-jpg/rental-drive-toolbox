import { useState } from 'react';
import { Calculator, Camera, ChevronDown, ChevronRight, MapPin, Scale, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const whyItems = [
  '关键照片顺手拍齐，减少还车沟通成本',
  '提前估算油费、电费、保险和门票',
  '生成自己的出行计划，方便保存和复盘',
];

export default function Home() {
  const [isWhyOpen, setIsWhyOpen] = useState(false);

  return (
    <main className="min-h-screen bg-cream">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#123B52_0%,#1E5A6E_55%,#DFF3F8_160%)] px-5 pb-7 pt-5 text-white">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-white/15 px-3 text-xs font-bold">
            <Sparkles size={14} />
            pYuY
          </div>
          <div className="rounded-full bg-[rgba(229,57,53,0.12)] px-3 py-1.5 text-xs font-bold text-[#C91F1F]">小红书收藏版</div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold tracking-[0.08em] text-white/65">租车自驾先理清，再出发</p>
            <h1 className="mt-2 text-[24px] font-bold leading-tight">租车自驾工具箱</h1>
            <p className="mt-2 text-[14px] font-medium leading-relaxed text-white/90">
              出发前 3 分钟，把预算、车型和方案先算清楚。
            </p>
          </div>
          <div className="shrink-0">
            <div className="rounded-full bg-[#A5D0DC]/25 p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
              <img
                src="/images/pyuy-lighthouse-hero.png"
                alt="pyUY 租车自驾工具箱品牌插画"
                width="115"
                height="115"
                fetchPriority="high"
                className="h-[115px] w-[115px] rounded-full object-cover sm:h-[145px] sm:w-[145px]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="-mt-5 rounded-t-[26px] bg-gradient-to-b from-cream via-cream to-mint px-5 pb-7 pt-6">
        <div className="grid gap-4">
          <ToolEntry
            to="/car-recommend"
            icon={MapPin}
            title="目的地车型推荐"
            text="根据目的地、人数和行李，判断这趟更适合租什么车"
            button="开始选车建议"
            priority="primary"
          />
          <ToolEntry
            to="/price-compare"
            icon={Scale}
            title="比租车方案"
            text="不同平台、车型和保险方案放一起看"
            button="开始方案对比"
            priority="primary"
          />
          <ToolEntry
            to="/budget"
            icon={Calculator}
            title="算整趟预算"
            text="租车、油电、住宿、门票和押金一次算清"
            button="开始预算计算"
            priority="primary"
          />
          <ToolEntry
            to="/checklist"
            icon={ShieldCheck}
            title="取车留证清单"
            text="取车前该拍哪里、核对什么，一次看清"
            button="开始留证"
            priority="secondary"
          />
        </div>

        <section className="fade-up mt-6 rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
          <button
            type="button"
            aria-expanded={isWhyOpen}
            onClick={() => setIsWhyOpen((open) => !open)}
            className="flex w-full items-center gap-3 text-left"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-mint text-pine">
              <Camera size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold leading-tight text-ink">为什么出发前建议先理一遍</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted">几分钟把租车方案、预算和关键留证顺一遍。</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-pine/55">pyUY——一个喜欢自驾、懂车、也爱做旅行规划的创作者</p>
            </div>
            <ChevronDown
              size={18}
              className={`shrink-0 text-pine transition-transform duration-200 ${isWhyOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isWhyOpen ? (
            <ul className="mt-4 grid gap-2.5">
              {whyItems.map((item) => (
                <li key={item} className="flex gap-2 rounded-2xl bg-mint/70 px-3 py-2.5 text-sm font-medium leading-relaxed text-ink">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-pine" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <p className="mt-4 rounded-[20px] bg-amberSoft/45 px-4 py-3 text-center text-sm font-bold leading-relaxed text-amberDark ring-1 ring-warning/20">
          收藏后可随时回来算预算、选车型和对比方案
        </p>
      </section>
    </main>
  );
}

function ToolEntry({ to, icon: Icon, title, text, button, priority }) {
  const isPrimary = priority === 'primary';

  return (
    <article
      className={`fade-up rounded-[24px] bg-card text-ink ring-1 ring-pine/10 ${
        isPrimary ? 'p-[18px] shadow-card' : 'p-4 shadow-card'
      }`}
    >
      <div className="flex items-start gap-3.5">
        <span
          className={`grid shrink-0 place-items-center rounded-[18px] ${
            isPrimary ? 'h-14 w-14 bg-pine text-white' : 'h-11 w-11 bg-mint text-pine'
          }`}
        >
          <Icon size={isPrimary ? 27 : 21} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className={`font-bold leading-tight ${isPrimary ? 'text-[20px]' : 'text-[17px]'}`}>{title}</h2>
          <p className={`mt-1.5 font-medium leading-relaxed text-muted ${isPrimary ? 'text-sm' : 'text-[13px]'}`}>{text}</p>
        </div>
      </div>
      <Link
        to={to}
        className={`inline-flex w-full items-center justify-center gap-1.5 rounded-2xl px-3 text-center font-bold leading-tight ${
          isPrimary
            ? 'mt-4 min-h-12 bg-gradient-to-r from-[#174B63] to-[#1E6B8A] text-sm text-white shadow-md shadow-pine/15 hover:from-[#123B52] hover:to-[#174B63] active:from-[#123B52] active:to-[#174B63]'
            : 'mt-3 min-h-11 border border-pine/15 bg-aquaCard text-[13px] text-pine hover:border-pine/25 hover:bg-mint/60'
        }`}
      >
        {button}
        <ChevronRight size={isPrimary ? 18 : 16} />
      </Link>
    </article>
  );
}
