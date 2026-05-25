import { Calculator, ClipboardList, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const entryActions = [
  {
    to: '/budget?mode=quick',
    state: { quickBudget: true },
    icon: Calculator,
    accent: Zap,
    eyebrow: '已经有租车总价',
    title: '速速看预算',
    text: '先把整趟大概花费算出来',
    gradient: 'from-[#0EA5D6] to-[#12BFC1]',
    bgGlow: 'bg-[#0EA5D6]/10',
  },
  {
    to: '/toolbox',
    icon: ClipboardList,
    accent: ArrowRight,
    eyebrow: '还想慢慢比较',
    title: '慢慢出方案',
    text: '车型、平台、预算、验车一步步来',
    gradient: 'from-[#0797BD] to-[#18C3C7]',
    bgGlow: 'bg-[#0797BD]/10',
  },
];

export default function EntryHome() {
  return (
    <main className="overflow-hidden bg-cream text-ink">
      <section className="relative px-4 pb-8 pt-4">
        {/* 顶部渐变背景 — 缩短到仅覆盖头部区域 */}
        <div className="absolute inset-x-0 top-0 h-[220px] bg-[linear-gradient(160deg,#10A7D8_0%,#0797BD_38%,#18C3C7_100%)]" />
        {/* 渐变到奶油色的平滑过渡层 */}
        <div className="absolute inset-x-0 top-[140px] h-[140px] bg-gradient-to-b from-transparent via-[#b3e4f2]/60 to-cream" />
        {/* 装饰光晕 */}
        <div className="absolute right-[-60px] top-[-40px] h-40 w-40 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute left-[-40px] top-20 h-28 w-28 rounded-full bg-[#48E0CF]/20 blur-3xl" />
        <div className="absolute right-[30px] top-[120px] h-20 w-20 rounded-full bg-white/10 blur-2xl" />

        <div className="relative">
          {/* 顶部徽章行 */}
          <div className="flex items-center justify-between">
            <div className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-white/20 px-3 text-xs font-bold text-white ring-1 ring-white/20 backdrop-blur-sm">
              <Sparkles size={14} className="text-white" />
              pYuY
            </div>
            <span className="text-[10px] font-bold tracking-wider text-white/60">租车自驾工具箱</span>
          </div>

          {/* 主标题卡片 */}
          <div className="mt-4 rounded-[24px] bg-white/[0.15] p-4 text-white ring-1 ring-white/20 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold tracking-[0.08em] text-white/80">出发前 3 分钟，一次理顺</p>
                <h1 className="mt-1 text-[26px] font-black leading-tight">今天想怎么开始？</h1>
                <p className="mt-2 max-w-[15rem] text-[13px] font-semibold leading-relaxed text-white/90">
                  已经知道租车总价就先算预算；还没定方案，就按工具箱慢慢理。
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

          {/* 过渡区装饰 — 浅色背景下的小点缀 */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="h-[3px] w-8 rounded-full bg-pine/20" />
            <span className="h-[3px] w-3 rounded-full bg-pine/35" />
            <span className="h-[3px] w-8 rounded-full bg-pine/20" />
          </div>

          {/* 两个入口按钮 — 完全在浅色背景上 */}
          <section className="mt-4 grid gap-3.5">
            {entryActions.map((action, index) => (
              <EntryAction key={action.to} {...action} index={index} />
            ))}
          </section>

          {/* 底部提示 */}
          <p className="mt-5 rounded-[16px] bg-amberSoft/[0.5] px-4 py-2.5 text-center text-[11px] font-bold leading-relaxed text-amberDark ring-1 ring-warning/15">
            收藏后可随时回来算预算、选车型、对比方案和验车留证
          </p>
        </div>
      </section>
    </main>
  );
}

function EntryAction({ to, state, icon: Icon, accent: AccentIcon, eyebrow, title, text, gradient, bgGlow, index }) {
  return (
    <Link
      to={to}
      state={state}
      aria-label={title}
      className="fade-up group relative flex items-stretch gap-3.5 overflow-hidden rounded-[24px] bg-white p-4 text-ink shadow-[0_10px_26px_rgba(8,116,151,0.12)] ring-1 ring-skyLine hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(8,116,151,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine/[0.35]"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* 背景柔光 */}
      <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full ${bgGlow} blur-2xl transition-[transform,opacity] duration-300 group-hover:scale-150 group-hover:opacity-80`} />

      {/* 左侧图标 */}
      <span className={`relative z-0 grid h-[52px] w-[52px] shrink-0 place-items-center self-center rounded-[18px] bg-gradient-to-br ${gradient} text-white shadow-md shadow-pine/15`}>
        <Icon size={26} />
      </span>

      {/* 中间文字 */}
      <span className="relative z-0 flex min-w-0 flex-1 flex-col justify-center">
        <span className="text-[11px] font-black leading-tight text-pine">{eyebrow}</span>
        <span className="mt-0.5 text-[21px] font-black leading-tight text-ink">{title}</span>
        <span className="mt-1.5 text-[12px] font-semibold leading-relaxed text-muted">{text}</span>
      </span>

      {/* 右侧箭头 */}
      <span className="relative z-0 flex shrink-0 items-center gap-1.5 self-center rounded-full bg-aquaCard/80 px-3 py-2 text-pine transition-all duration-200 group-hover:bg-aquaCard group-hover:pr-2">
        <span className="text-[11px] font-black text-pine/70 group-hover:text-pine">进入</span>
        <AccentIcon size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
