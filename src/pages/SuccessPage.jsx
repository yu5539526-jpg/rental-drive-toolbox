import { Calculator, CheckCircle2, Home, MessageCircle, Scale } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import TopBar from '../components/TopBar.jsx';

export default function SuccessPage() {
  const location = useLocation();
  const resultLabelMap = {
    budget: '预算结果',
    checklist: '留证结果',
  };
  const resultType = resultLabelMap[location.state?.resultType] || '出行结果';

  return (
    <main className="min-h-screen bg-[#F6F8F5] text-[#18322D]">
      <TopBar title="保存成功" />

      <section className="px-5 py-8">
        <div className="rounded-[24px] bg-white p-6 text-center shadow-card ring-1 ring-[#2F7A6D]/10">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#F2F7F5] text-[#2F7A6D]">
            <CheckCircle2 size={42} />
          </div>
          <p className="mt-5 text-sm font-bold text-[#2F7A6D]">已保存你的{resultType}</p>
          <h1 className="mt-2 text-[26px] font-bold leading-tight text-[#18322D]">你的出行计划已保存</h1>
          <p className="mt-4 text-[15px] font-medium leading-relaxed text-[#667B75]">
            我会优先整理典型案例，用于后续小红书免费分析。如果你的计划比较有代表性，可能会被整理成匿名案例。
          </p>

          <div className="mt-6 rounded-[22px] bg-[#F2F7F5] p-4 text-left">
            <div className="flex gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-[#2F7A6D]">
                <MessageCircle size={21} />
              </span>
              <div>
                <p className="text-sm font-bold text-[#18322D]">案例说明</p>
                <p className="mt-1 text-sm leading-relaxed text-[#667B75]">
                  匿名案例只会用于整理租车自驾需求和选题方向，不公开联系方式等个人信息。
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/"
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-[#2F7A6D] px-5 font-bold text-white shadow-lg shadow-[#2F7A6D]/20"
          >
            <Home size={19} />
            返回首页
          </Link>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Link
              to="/budget"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[18px] bg-[#F2F7F5] px-3 text-sm font-bold text-[#2F7A6D]"
            >
              <Calculator size={17} />
              继续算预算
            </Link>
            <Link
              to="/price-compare"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[18px] bg-white px-3 text-sm font-bold text-[#2F7A6D] ring-1 ring-[#2F7A6D]/12"
            >
              <Scale size={17} />
              继续比方案
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-sm font-bold leading-relaxed text-[#667B75]">
          小红书 pYuY：已生成出行计划，可继续返回工具箱核对预算和留证清单。
        </p>
      </section>
    </main>
  );
}
