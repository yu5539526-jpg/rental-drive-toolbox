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
    gradient: 'from-[#0EA5D6] to-[#12BFC1]',
    bgGlow: 'bg-[#0EA5D6]/10',
  },
  {
    to: '/toolbox',
    icon: ClipboardList,
    accent: ArrowRight,
    eyebrow: '适合从0开始规划租车自驾',
    title: '慢慢出方案',
    gradient: 'from-[#0797BD] to-[#18C3C7]',
    bgGlow: 'bg-[#0797BD]/10',
  },
];

function TravelLineArtBackground() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 top-8 h-[206px] w-full text-white sm:top-9"
      viewBox="0 0 430 206"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        d="M-18 136 L26 116 L56 126 L88 94 L132 126 L166 105 L206 132 L248 91 L288 124 L326 108 L372 134 L448 102"
        stroke="currentColor"
        strokeOpacity="0.24"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M-24 154 L34 139 L82 148 L122 124 L174 151 L226 118 L272 150 L320 130 L366 152 L456 132"
        stroke="currentColor"
        strokeOpacity="0.18"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M-20 174 L38 166 L92 171 L146 156 L198 172 L248 160 L304 174 L356 162 L452 169"
        stroke="currentColor"
        strokeOpacity="0.13"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28 184 C74 164 122 168 164 151 C204 135 242 130 280 142 C318 154 346 143 386 124"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray="7 10"
      />
      <path
        d="M62 57 C74 48 91 49 100 61 M106 61 H134 M292 52 C302 45 316 47 324 57 M330 57 H354"
        stroke="currentColor"
        strokeOpacity="0.22"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M42 198 C58 193 74 193 90 198 M112 198 C126 194 141 194 154 198 M296 190 C310 186 324 186 338 190"
        stroke="currentColor"
        strokeOpacity="0.16"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function EntryHome() {
  return (
    <main className="overflow-hidden bg-cream text-ink">
      <section className="relative px-4 pb-8 pt-4">
        {/* Hero 背景：旅行感线稿山水 + 轻路线感 */}
        <div className="absolute inset-x-0 top-0 h-[292px] overflow-hidden bg-[linear-gradient(155deg,#0FA3D4_0%,#078FBE_42%,#22C7C2_100%)]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_18%,rgba(255,255,255,0.32)_0%,rgba(255,255,255,0)_34%),linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_48%)]" />
          <TravelLineArtBackground />
          <div className="absolute bottom-[-68px] left-1/2 h-[150px] w-[118%] -translate-x-1/2 rounded-t-[55%] bg-[#C6EEF6]/72" />
          <div className="absolute bottom-[-104px] left-1/2 h-[142px] w-[92%] -translate-x-1/2 rounded-t-[52%] bg-cream" />
        </div>
        <div className="absolute inset-x-0 top-[236px] h-[92px] bg-gradient-to-b from-transparent via-cream/80 to-cream" />

        <div className="relative">
          {/* 顶部徽章行 */}
          <div className="flex items-center justify-between">
            <div className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-white/25 px-3 text-xs font-bold text-white shadow-[0_8px_20px_rgba(5,86,118,0.12)] ring-1 ring-white/30 backdrop-blur-md">
              <Sparkles size={14} className="text-white" />
              pYuY
            </div>
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="h-1.5 w-1.5 rounded-full bg-white/45" />
              <span className="h-1.5 w-5 rounded-full bg-white/80" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/45" />
            </div>
          </div>

          {/* 主标题卡片 */}
          <div className="relative mt-4 overflow-hidden rounded-[28px] bg-white/[0.17] p-4 text-white shadow-[0_18px_44px_rgba(5,86,118,0.20)] ring-1 ring-white/25 backdrop-blur-md">
            <div className="absolute inset-x-4 bottom-3 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
            <div className="absolute -right-10 bottom-4 h-14 w-36 -rotate-12 rounded-full border border-white/18" aria-hidden="true" />
            <div className="relative flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <h1 className="mt-1 text-[27px] font-black leading-tight tracking-normal drop-shadow-[0_2px_10px_rgba(4,69,92,0.16)]">
                  租车自驾工具箱
                </h1>
                <div className="mt-3 flex items-center gap-1.5" aria-hidden="true">
                  <span className="h-1 w-10 rounded-full bg-white/80" />
                  <span className="h-1 w-2.5 rounded-full bg-white/45" />
                  <span className="h-1 w-6 rounded-full bg-white/55" />
                </div>
              </div>
              <div className="shrink-0 rounded-[30px] bg-white/[0.24] p-[8px] shadow-[0_16px_34px_rgba(5,93,125,0.26)] ring-1 ring-white/30">
                <img
                  src="/images/pyuy-lighthouse-hero.png"
                  alt="pyUY 租车自驾工具箱个人图像"
                  width="103"
                  height="103"
                  fetchPriority="high"
                  className="h-[104px] w-[104px] rounded-[24px] object-cover shadow-[inset_0_0_0_1px_rgba(255,255,255,0.28)]"
                />
              </div>
            </div>
          </div>

          {/* 过渡区装饰 */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="h-[3px] w-8 rounded-full bg-pine/[0.18]" />
            <span className="h-[3px] w-3 rounded-full bg-[#18C3C7]/55" />
            <span className="h-[3px] w-8 rounded-full bg-pine/[0.18]" />
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

function EntryAction({ to, state, icon: Icon, accent: AccentIcon, eyebrow, title, gradient, bgGlow, index }) {
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
      </span>

      {/* 右侧箭头 — 放大 */}
      <span className="relative z-0 flex shrink-0 items-center gap-1 self-center rounded-full bg-aquaCard/80 px-2.5 py-2.5 text-pine transition-all duration-150 group-active:bg-aquaCard group-active:pr-1.5">
        <span className="text-[12px] font-black text-pine/70 group-active:text-pine">进入</span>
        <AccentIcon size={16} className="transition-transform duration-150 group-active:translate-x-0.5" />
      </span>
    </Link>
  );
}
