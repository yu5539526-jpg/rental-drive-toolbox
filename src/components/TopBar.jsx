import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TopBar({ title, showBack = true, onBack }) {
  const navigate = useNavigate();
  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    navigate(-1);
  };

  return (
    <header className="sticky top-0 z-20 h-14 border-b border-pine/12 bg-cream/92 px-3 backdrop-blur">
      <div className="grid h-full grid-cols-[44px_minmax(0,1fr)_44px] items-center">
        {showBack ? (
          <button
            type="button"
            onClick={handleBack}
            className="grid h-11 w-11 place-items-center rounded-full text-pine"
            aria-label="返回"
          >
            <ArrowLeft size={20} />
          </button>
        ) : (
          <span className="h-11 w-11" aria-hidden="true" />
        )}
        <div className="flex flex-col items-center justify-center px-2">
          <h1 className="max-w-full truncate text-[17px] font-black leading-tight text-pine">{title}</h1>
          <span className="mt-0.5 block h-[2px] w-10 rounded-full bg-gradient-to-r from-pine/30 via-pine/15 to-transparent" />
        </div>
        <span className="h-11 w-11" aria-hidden="true" />
      </div>
    </header>
  );
}
