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
        <p className="text-[14px] font-semibold leading-relaxed text-muted">
          四个步骤，从选车到验车，把租车这件事一次理顺。
        </p>

        {/* 工具卡片网格 — 放大卡片尺寸和间距 */}
        <section className="mt-4 grid grid-cols-2 gap-3.5">
          {tools.map((tool, index) => (
            <ToolEntry key={tool.to} {...tool} index={index} />
          ))}
        </section>

        {/* 为什么出发前建议先理一遍 — 放大区域 */}
        <section className="fade-up mt-5 rounded-[22px] border border-skyLine bg-card/[0.92] p-4 shadow-card">
          <button
            type="button"
            aria-expanded={isWhyOpen}
            onClick={() => setIsWhyOpen((open) => !open)}
            className="flex w-full items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine/[0.35]"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-mint text-pine">
              <Camera size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-[15px] font-bold leading-tight text-ink">为什么出发前建议先理一遍</h2>
              <p className="mt-0.5 text-[12px] font-medium leading-relaxed text-muted">少走弯路，取还车也更安心。</p>
            </div>
            <ChevronDown
              size={18}
              className={`shrink-0 text-pine transition-transform duration-200 ${isWhyOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isWhyOpen ? (
            <ul className="mt-3.5 grid gap-2.5">
              {whyItems.map((item) => (
                <li key={item} className="flex gap-2.5 rounded-2xl bg-aquaCard px-3.5 py-2.5 text-xs font-bold leading-relaxed text-ink">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-pine" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        {/* 收藏提示 — 放大 */}
        <p className="mt-5 rounded-[18px] bg-amberSoft/[0.55] px-4 py-3 text-center text-[12px] font-bold leading-relaxed text-amberDark ring-1 ring-warning/20">
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
      className="fade-up group flex flex-col rounded-[22px] bg-white p-4 text-ink shadow-[0_8px_22px_rgba(8,116,151,0.10)] ring-1 ring-skyLine transition-[transform,box-shadow] duration-150 active:scale-[0.98] active:shadow-[0_4px_12px_rgba(8,116,151,0.13)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine/[0.35]"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* 顶部：步骤号 + 图标 — 放大 */}
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-aquaCard text-[12px] font-black text-pine ring-1 ring-pine/10">
          {step}
        </span>
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-gradient-to-br ${gradient} text-white shadow-sm shadow-pine/12`}>
          <Icon size={22} />
        </span>
        <ChevronRight size={16} className="ml-auto shrink-0 text-pine/50 transition-transform duration-150 group-active:translate-x-0.5" />
      </div>

      {/* 标题 + 描述 — 字号加大 */}
      <div className="mt-3.5 min-w-0 flex-1">
        <h2 className="text-[17px] font-black leading-tight text-ink">{title}</h2>
        <p className="mt-1.5 text-[12px] font-semibold leading-relaxed text-muted">{text}</p>
      </div>

      {/* 底部按钮 — 加大高度 */}
      <span className={`mt-3.5 inline-flex min-h-[42px] w-full items-center justify-center rounded-xl bg-gradient-to-r ${gradient} px-2 text-center text-[13px] font-black leading-tight text-white shadow-sm shadow-pine/12 transition-shadow duration-150 group-active:shadow-sm group-active:shadow-pine/10`}>
        <span className="break-words">{button}</span>
      </span>
    </Link>
  );
}
