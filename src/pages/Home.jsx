import { Calculator, Camera, ChevronRight, MapPinned, Scale, ShieldAlert, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const whyItems = [
  '避免漏拍车损，减少还车纠纷',
  '提前估算油费、电费、保险和门票',
  '生成自己的出行计划，方便保存和复盘',
];

export default function Home() {
  return (
    <main className="min-h-screen bg-transparent">
      <section className="relative overflow-hidden bg-pine px-5 pb-6 pt-6 text-white">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-white/14 px-3 text-xs font-bold">
            <Sparkles size={14} />
            pYuY 整理
          </div>
          <div className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold">小红书收藏版</div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-bold text-white/72">租车前看一眼，路上少一点慌</p>
          <h1 className="mt-2 text-[28px] font-bold leading-tight tracking-normal">租车自驾工具箱</h1>
          <p className="mt-3 max-w-[20rem] text-[15px] font-medium leading-relaxed text-white/90">
            出发前 3 分钟，帮你把取车和预算理清楚。
          </p>
        </div>

        <div className="mt-5 rounded-[24px] bg-white/10 p-3 ring-1 ring-white/10">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-pine">
              <MapPinned size={22} />
            </span>
            <div>
              <p className="text-sm font-bold">适合取车现场、路线规划和出发前复核</p>
              <p className="mt-1 text-xs leading-relaxed text-white/70">不替你做决定，只把容易漏的事摆清楚。</p>
            </div>
          </div>
        </div>
      </section>

      <section className="-mt-3 rounded-t-[28px] bg-gradient-to-b from-cream to-mint px-5 pb-7 pt-5">
        <div className="grid gap-3">
          <ToolEntry
            to="/checklist"
            icon={ShieldCheck}
            title="我要取车验车"
            text="适合刚到门店、准备提车、担心还车纠纷时使用。"
            button="开始 3 分钟验车"
          />
          <ToolEntry
            to="/budget"
            icon={Calculator}
            title="我要计算预算"
            text="适合规划路线、控制花费、对比租车方案时使用。"
            button="开始预算计算"
            warm
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <ToolEntry
            to="/risk-check"
            icon={ShieldAlert}
            title="租车避坑自测"
            text="1 分钟看看这趟行程有哪些隐藏风险"
            button="开始风险自测"
            compact
          />
          <ToolEntry
            to="/price-compare"
            icon={Scale}
            title="价格对比记录"
            text="多个平台和车型放一起，算清真实租车成本"
            button="开始价格对比"
            compact
            warm
          />
        </div>

        <section className="fade-up mt-4 rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-mint text-pine">
              <Camera size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold leading-tight text-ink">为什么出发前建议先看一遍</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted">几分钟把取车、预算和留证思路顺一遍。</p>
            </div>
          </div>

          <ul className="mt-4 grid gap-2.5">
            {whyItems.map((item) => (
              <li key={item} className="flex gap-2 rounded-2xl bg-mint/70 px-3 py-2.5 text-sm font-medium leading-relaxed text-ink">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-pine" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-4 rounded-2xl bg-amberSoft px-4 py-3 text-center text-sm font-bold leading-relaxed text-[#7A5521]">
          收藏后可随时回来核对预算和验车步骤
        </p>
      </section>
    </main>
  );
}
function ToolEntry({ to, icon: Icon, title, text, button, warm, compact }) {
  return (
    <article className={`fade-up rounded-[24px] bg-card text-ink shadow-card ring-1 ring-pine/10 ${compact ? 'p-3.5' : 'p-4'}`}>
      <div className={compact ? 'grid gap-2.5' : 'flex items-start gap-3'}>
        <span
          className={`grid shrink-0 place-items-center rounded-[18px] ${compact ? 'h-11 w-11' : 'h-12 w-12'} ${
            warm ? 'bg-amberSoft text-[#7A5521]' : 'bg-mint text-pine'
          }`}
        >
          <Icon size={compact ? 21 : 23} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className={`font-bold leading-tight ${compact ? 'text-base' : 'text-[19px]'}`}>{title}</h2>
          <p className={`mt-1.5 font-medium leading-relaxed text-muted ${compact ? 'text-xs' : 'text-sm'}`}>{text}</p>
        </div>
      </div>
      <Link
        to={to}
        className={`inline-flex min-h-12 w-full items-center justify-center gap-1.5 rounded-2xl bg-pine px-3 text-center text-sm font-bold leading-tight text-white shadow-lg shadow-pine/20 ${
          compact ? 'mt-3' : 'mt-4'
        }`}
      >
        {button}
        <ChevronRight size={compact ? 16 : 18} />
      </Link>
    </article>
  );
}
