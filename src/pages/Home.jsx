import { Calculator, ChevronRight, MapPinned, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <main className="safe-bottom min-h-[calc(100vh-2rem)] bg-mint">
      <section className="relative overflow-hidden bg-pine px-5 pb-6 pt-6 text-white">
        <div className="absolute right-4 top-5 rounded-full bg-white/12 px-3 py-1 text-xs font-bold">小红书收藏版</div>
        <div className="inline-flex items-center gap-1 rounded-full bg-white/14 px-3 py-1.5 text-xs font-black">
          <Sparkles size={14} />
          出发前 3 分钟搞定
        </div>
        <h1 className="mt-4 text-[38px] font-black leading-[1.06] tracking-normal">租车自驾工具箱</h1>
        <p className="mt-3 text-lg font-black leading-relaxed text-white/90">
          取车验车、旅行预算，出发前 3 分钟搞定。
        </p>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-white/70">
          适合第一次租车、异地自驾、情侣/朋友出游前使用。
        </p>

        <div className="mt-5 grid gap-3">
          <ToolEntry
            to="/checklist"
            icon={ShieldCheck}
            title="我要取车验车"
            text="照着检查车身、轮胎、保险、押金，避免还车扯皮。"
            button="开始验车"
          />
          <ToolEntry
            to="/budget"
            icon={Calculator}
            title="我要计算预算"
            text="租车、油电、住宿、餐饮、门票，一次算清。"
            button="开始计算"
            warm
          />
        </div>
      </section>

      <section className="-mt-3 rounded-t-[28px] bg-mint px-5 pb-7 pt-5">
        <div className="rounded-[22px] border border-pine/10 bg-white/90 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-pine text-white">
              <MapPinned size={20} />
            </span>
            <div>
              <p className="text-sm font-black text-ink">现场取车别慌</p>
              <p className="mt-1 text-xs font-bold leading-relaxed text-ink/58">
                先验车，再开走；先估预算，再定行程。
              </p>
            </div>
          </div>
        </div>

        <p className="mt-4 rounded-2xl bg-amberSoft px-4 py-3 text-center text-sm font-black text-[#9a551d]">
          更多租车自驾攻略：小红书 @你的账号名
        </p>
      </section>
    </main>
  );
}

function ToolEntry({ to, icon: Icon, title, text, button, warm }) {
  return (
    <article className="rounded-[22px] bg-white p-4 text-ink shadow-lg shadow-ink/10">
      <div className="flex items-start gap-3">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${warm ? 'bg-amberSoft text-[#9a551d]' : 'bg-mint text-pine'}`}>
          <Icon size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-black leading-tight">{title}</h2>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-ink/62">{text}</p>
        </div>
      </div>
      <Link
        to={to}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-pine px-4 text-sm font-black text-white"
      >
        {button}
        <ChevronRight size={18} />
      </Link>
    </article>
  );
}
