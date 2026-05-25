import { Calculator, ClipboardList, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const entryActions = [
  {
    to: '/budget?mode=quick',
    state: { quickBudget: true },
    icon: Calculator,
    accent: Zap,
    eyebrow: '已有租车总价，也适合自用车',
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
        {/* 顶部渐变背景 */}
        <div className="absolute inset-x-0 top-0 h-[220px] bg-[linear-gradient(160deg,#10A7D8_0%,#0797BD_38%,#18C3C7_100%)]" />
        {/* 渐变到奶油色的平滑过渡层 */}
        <div className="absolute inset-x-0 top-[140px] h-[140px] bg-gradient-to-b from-transparent via-[#b3e4f2]/60 to-cream" />
        {/* 装饰光晕 */}
        <div className="absolute right-[-60px] top-[-40px] h-40 w-40 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute left-[-40px] top-20 h-28 w-28 rounded-full bg-[#48E0CF]/20 blur-3xl" />
        <div className="absolute right-[30px] top-[120px] h-20 w-20 rounded-full bg-white/10 blur-2xl" />

        <div className="relative">
          {/* 顶部徽章行 */}
          <div className="flex items-center">
            <div className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-white/20 px-3 text-xs font-bold text-white ring-1 ring-white/20 backdrop-blur-sm">
              <Sparkles size={14} className="text-white" />
              pYuY
            </div>
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
              <div className="shrink-0 rounded-[28px] bg-white/[0.22] p-[8px] shadow-[0_12px_30px_rgba(5,93,125,0.24)] ring-1 ring-white/20">
                <img
                  src="/images/pyuy-lighthouse-hero.png"
                  alt="pyUY 租车自驾工具箱个人图像"
                  width="103"
                  height="103"
                  fetchPriority="high"
                  className="h-[103px] w-[103px] rounded-[24px] object-cover"
                />
              </div>
            </div>
          </div>

          {/* 过渡区装饰 */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="h-[3px] w-8 rounded-full bg-pine/20" />
            <span className="h-[3px] w-3 rounded-full bg-pine/35" />
            <span className="h-[3px] w-8 rounded-full bg-pine/20" />
          </div>

          {/* 两个入口按钮 — 放大尺寸填充空白 */}
          <section className="mt-5 grid gap-4">
            {entryActions.map((action, index) => (
              <EntryAction key={action.to} {...action} index={index} />
            ))}
          </section>

          {/* 底部提示 */}
          <p className="mt-6 rounded-[18px] bg-amberSoft/[0.5] px-4 py-3 text-center text-[12px] font-bold leading-relaxed text-amberDark ring-1 ring-warning/15">
            本次计划会保存在当前浏览器中，换设备或浏览器后无法查看噢
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
      className="fade-up group relative flex items-stretch gap-3 overflow-hidden rounded-[26px] bg-white p-5 text-ink shadow-[0_10px_26px_rgba(8,116,151,0.12)] ring-1 ring-skyLine transition-[transform,box-shadow] duration-150 active:scale-[0.98] active:shadow-[0_4px_12px_rgba(8,116,151,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine/[0.35]"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* 背景柔光 */}
      <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${bgGlow} blur-2xl transition-[transform,opacity] duration-200 group-active:scale-125 group-active:opacity-70`} />

      {/* 左侧图标 — 放大 */}
      <span className={`relative z-0 grid h-[64px] w-[64px] shrink-0 place-items-center self-center rounded-[20px] bg-gradient-to-br ${gradient} text-white shadow-md shadow-pine/15`}>
        <Icon size={32} />
      </span>

      {/* 中间文字 — 字号加大 */}
      <span className="relative z-0 flex min-w-0 flex-1 flex-col justify-center">
        <span className="whitespace-nowrap text-[12px] font-black leading-tight text-pine">{eyebrow}</span>
        <span className="mt-1 text-[24px] font-black leading-tight text-ink">{title}</span>
        <span className="mt-2 text-[13px] font-semibold leading-relaxed text-muted">{text}</span>
      </span>

      {/* 右侧箭头 — 放大 */}
      <span className="relative z-0 flex shrink-0 items-center gap-1 self-center rounded-full bg-aquaCard/80 px-2.5 py-2.5 text-pine transition-all duration-150 group-active:bg-aquaCard group-active:pr-1.5">
        <span className="text-[12px] font-black text-pine/70 group-active:text-pine">进入</span>
        <AccentIcon size={16} className="transition-transform duration-150 group-active:translate-x-0.5" />
      </span>
    </Link>
  );
}
