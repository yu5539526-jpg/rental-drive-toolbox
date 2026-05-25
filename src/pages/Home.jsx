import { useState } from 'react';
import { Calculator, Camera, ChevronDown, ChevronRight, MapPin, Scale, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar.jsx';

const whyItems = [
  '关键照片顺手拍齐，减少还车沟通成本',
  '提前估算油费、电费、保险和门票',
  '生成自己的出行计划，方便保存和复盘',
];

const tools = [
  {
    to: '/car-recommend',
    step: 1,
    icon: MapPin,
    title: '目的地车型推荐',
    text: '按目的地、人数和行李选车',
    button: '看看适合什么车',
    gradient: 'from-[#0EA5D6] to-[#12BFC1]',
  },
  {
    to: '/price-compare',
    step: 2,
    icon: Scale,
    title: '比租车方案',
    text: '平台、车型、保险放一起看',
    button: '哪个平台更划算',
    gradient: 'from-[#0797BD] to-[#10A7D8]',
  },
  {
    to: '/budget',
    step: 3,
    icon: Calculator,
    title: '算整趟预算',
    text: '租车、油电、住宿一次算清',
    button: '这趟大概花多少',
    gradient: 'from-[#0B8DB8] to-[#0EA5D6]',
  },
  {
    to: '/car-inspection-map',
    step: 4,
    icon: ShieldCheck,
    title: '车身验车避坑图',
    text: '点车身部位看哪里要重点拍',
    button: '取车时重点拍哪里',
    gradient: 'from-[#087FA5] to-[#0B93C2]',
  },
];

export default function Home() {
  const [isWhyOpen, setIsWhyOpen] = useState(false);

  return (
    <main className="min-h-screen bg-cream text-ink">
      <TopBar title="租车自驾工具箱" showBack={true} />

      <div className="px-4 pb-8 pt-4">
        {/* 页面引导语 */}
        <p className="text-[13px] font-semibold leading-relaxed text-muted">
          四个步骤，从选车到验车，把租车这件事一次理顺。
        </p>

        {/* 工具卡片网格 */}
        <section className="mt-4 grid grid-cols-2 gap-3">
          {tools.map((tool, index) => (
            <ToolEntry key={tool.to} {...tool} index={index} />
          ))}
        </section>

        {/* 为什么出发前建议先理一遍 */}
        <section className="fade-up mt-5 rounded-[20px] border border-skyLine bg-card/[0.92] p-3.5 shadow-card">
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

        {/* 收藏提示 */}
        <p className="mt-4 rounded-[16px] bg-amberSoft/[0.55] px-3 py-2.5 text-center text-xs font-bold leading-relaxed text-amberDark ring-1 ring-warning/20">
          收藏后可随时回来算预算、选车型、对比方案和验车留证
        </p>
      </div>
    </main>
  );
}

function ToolEntry({ to, step, icon: Icon, title, text, button, gradient, index }) {
  return (
    <Link
      to={to}
      aria-label={`${title}：${button}`}
      className="fade-up group flex flex-col rounded-[20px] bg-white p-3.5 text-ink shadow-[0_8px_22px_rgba(8,116,151,0.10)] ring-1 ring-skyLine hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(8,116,151,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine/[0.35]"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* 顶部：步骤号 + 图标 */}
      <div className="flex items-center gap-2">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-aquaCard text-[11px] font-black text-pine ring-1 ring-pine/10">
          {step}
        </span>
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[14px] bg-gradient-to-br ${gradient} text-white shadow-sm shadow-pine/12`}>
          <Icon size={18} />
        </span>
        <ChevronRight size={15} className="ml-auto shrink-0 text-pine/50 transition-transform duration-200 group-hover:translate-x-0.5" />
      </div>

      {/* 标题 + 描述 */}
      <div className="mt-3 min-w-0 flex-1">
        <h2 className="text-[15px] font-black leading-tight text-ink">{title}</h2>
        <p className="mt-1 text-[11px] font-semibold leading-relaxed text-muted">{text}</p>
      </div>

      {/* 底部按钮 */}
      <span className={`mt-3 inline-flex min-h-[36px] w-full items-center justify-center rounded-xl bg-gradient-to-r ${gradient} px-2 text-center text-[12px] font-black leading-tight text-white shadow-sm shadow-pine/12 group-hover:shadow-md group-hover:shadow-pine/15`}>
        <span className="break-words">{button}</span>
      </span>
    </Link>
  );
}
