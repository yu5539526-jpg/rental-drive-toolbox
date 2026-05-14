import { Calculator, CarFront, ChevronRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <main className="safe-bottom min-h-[calc(100vh-2rem)] bg-mint">
      <section className="relative overflow-hidden bg-pine px-5 pb-8 pt-7 text-white">
        <div className="absolute right-4 top-5 rounded-full bg-white/12 px-3 py-1 text-xs font-bold">小红书收藏版</div>
        <div className="mt-12 inline-flex items-center gap-1 rounded-full bg-white/14 px-3 py-1.5 text-xs font-black">
          <Sparkles size={14} />
          新手自驾出发前先看
        </div>
        <h1 className="mt-5 text-[40px] font-black leading-[1.05] tracking-normal">租车自驾工具箱</h1>
        <p className="mt-4 max-w-[310px] text-lg font-semibold leading-relaxed text-white/84">
          验车、预算、避坑，一次搞清楚
        </p>

        <div className="mt-7 grid gap-3">
          <Link
            to="/checklist"
            className="flex items-center justify-between rounded-[22px] bg-white px-5 py-4 text-ink shadow-lg shadow-ink/10"
          >
            <span className="flex items-center gap-3 text-lg font-black">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amberSoft text-[#9a551d]">
                <CarFront size={22} />
              </span>
              开始取车验车
            </span>
            <ChevronRight className="text-pine" size={22} />
          </Link>

          <Link
            to="/budget"
            className="flex items-center justify-between rounded-[22px] bg-coral px-5 py-4 text-white shadow-lg shadow-coral/20"
          >
            <span className="flex items-center gap-3 text-lg font-black">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/18">
                <Calculator size={22} />
              </span>
              计算自驾预算
            </span>
            <ChevronRight size={22} />
          </Link>
        </div>
      </section>

      <section className="-mt-3 rounded-t-[28px] bg-mint px-5 pb-8 pt-5">
        <div className="overflow-hidden rounded-[22px] border border-pine/10 bg-white shadow-soft">
          <img
            src="assets/cover.png"
            alt="租车自驾工具包封面"
            className="aspect-[4/3] w-full object-cover object-top"
          />
        </div>

        <p className="mt-7 rounded-2xl bg-amberSoft px-4 py-3 text-center text-sm font-black text-[#9a551d]">
          更多租车自驾攻略，可以关注小红书 @你的账号名。
        </p>
      </section>
    </main>
  );
}
