import { CheckCircle2, Home, MessageCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import TopBar from '../components/TopBar.jsx';

export default function SuccessPage() {
  const location = useLocation();
  const resultLabelMap = {
    budget: '预算结果',
    checklist: '验车结果',
    risk: '风险自测结果',
  };
  const resultType = resultLabelMap[location.state?.resultType] || '出行结果';

  return (
    <main className="min-h-screen bg-transparent">
      <TopBar title="提交成功" subtitle="出行计划已保存" showBack={false} />

      <section className="px-5 py-8">
        <div className="rounded-[24px] bg-card p-6 text-center shadow-card ring-1 ring-pine/10">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-pine text-white">
            <CheckCircle2 size={40} />
          </div>
          <p className="mt-5 text-sm font-bold text-coral">已保存你的{resultType}</p>
          <h1 className="mt-2 text-[26px] font-bold leading-tight text-ink">已生成并保存出行计划</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            提交成功，你的出行信息和本次结果已保存在当前浏览器中，可返回继续查看或调整。
          </p>

          <div className="mt-6 rounded-[22px] bg-amberSoft p-4 text-left">
            <div className="flex gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-card text-[#7A5521]">
                <MessageCircle size={21} />
              </span>
              <div>
                <p className="text-sm font-bold text-[#7A5521]">使用提醒</p>
                <p className="mt-1 text-sm leading-relaxed text-[#7A5521]/78">
                  租车价格、保险规则和押金政策会随平台变化，出发前请以租车平台和门店合同为准。
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/"
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-pine px-5 font-bold text-white shadow-lg shadow-pine/20"
          >
            <Home size={19} />
            回到工具箱首页
          </Link>
        </div>

        <p className="mt-6 text-center text-sm font-bold leading-relaxed text-muted">小红书 pYuY：已生成出行计划，可继续返回工具箱核对预算和验车清单。</p>
      </section>
    </main>
  );
}
