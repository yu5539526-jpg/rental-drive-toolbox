import { ArrowLeft, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function TopBar({ title, subtitle, showBack = true }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 border-b border-pine/10 bg-cream/90 px-4 pb-3 pt-3 backdrop-blur">
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-card text-pine shadow-sm ring-1 ring-pine/10"
            aria-label="返回"
          >
            <ArrowLeft size={20} />
          </button>
        ) : (
          <Link
            to="/"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-card text-pine shadow-sm ring-1 ring-pine/10"
            aria-label="首页"
          >
            <Home size={20} />
          </Link>
        )}
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-muted">pYuY 自驾工具箱</p>
          <h1 className="truncate text-lg font-bold leading-tight text-ink">{title}</h1>
          {subtitle ? <p className="mt-0.5 truncate text-xs font-medium text-muted">{subtitle}</p> : null}
        </div>
      </div>
    </header>
  );
}
