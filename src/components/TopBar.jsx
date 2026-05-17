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
    <header className="sticky top-0 z-20 h-14 border-b border-[rgba(47,107,95,0.08)] bg-cream/90 px-3 backdrop-blur">
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
        <h1 className="truncate px-2 text-center text-[17px] font-bold leading-tight text-ink">{title}</h1>
        <span className="h-11 w-11" aria-hidden="true" />
      </div>
    </header>
  );
}
