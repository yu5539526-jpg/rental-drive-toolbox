import { ArrowLeft, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function TopBar({ title, subtitle, showBack = true }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 border-b border-pine/10 bg-mint/95 px-4 pb-3 pt-4 backdrop-blur">
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-pine shadow-sm"
            aria-label="返回"
          >
            <ArrowLeft size={20} />
          </button>
        ) : (
          <Link
            to="/"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-pine shadow-sm"
            aria-label="首页"
          >
            <Home size={20} />
          </Link>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-lg font-black text-ink">{title}</h1>
          {subtitle ? <p className="mt-0.5 truncate text-xs font-medium text-ink/60">{subtitle}</p> : null}
        </div>
      </div>
    </header>
  );
}
