import { CheckCircle2, Home, MessageCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import TopBar from '../components/TopBar.jsx';

export default function SuccessPage() {
  const location = useLocation();
  const resultType = location.state?.resultType === 'budget' ? '预算结果' : '验车结果';

  return (
    <main className="safe-bottom min-h-[calc(100vh-2rem)] bg-mint">
      <TopBar title="提交成功" subtitle="出行计划已保存" showBack={false} />

      <section className="px-5 py-8">
        <div className="rounded-[28px] bg-white p-6 text-center shadow-soft">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-pine text-white">
            <CheckCircle2 size={40} />
          </div>
          <p className="mt-5 text-sm font-bold text-coral">已保存你的{resultType}</p>
          <h1 className="mt-2 text-3xl font-black leading-tight text-ink">出行计划提交成功</h1>
          <p className="mt-4 text-base leading-relaxed text-ink/64">
            提交成功，已保存你的出行计划。你也可以关注小红书，后续获取更多租车自驾攻略。
          </p>

          <div className="mt-6 rounded-[22px] bg-amberSoft p-4 text-left">
            <div className="flex gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-[#9a551d]">
                <MessageCircle size={21} />
              </span>
              <div>
                <p className="text-sm font-black text-[#8a4b14]">私信建议</p>
                <p className="mt-1 text-sm leading-relaxed text-[#8a4b14]/78">
                  如需交流，可以附上目的地、出行月份和人数，我会按你的情况整理租车避坑提醒。
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-pine px-5 py-4 font-black text-white"
          >
            <Home size={19} />
            回到工具箱首页
          </Link>
        </div>

        <p className="mt-6 text-center text-sm font-black text-[#9a551d]">更多租车自驾攻略，可以关注小红书 @你的账号名。</p>
      </section>
    </main>
  );
}
