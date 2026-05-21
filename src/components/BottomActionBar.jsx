export default function BottomActionBar({ children, layout = 'single', className = '' }) {
  const gridClass = layout === 'double' ? 'grid-cols-2' : 'grid-cols-1';

  return (
    <nav className={`bottom-action fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] px-4 pt-3 sm:bottom-6 sm:rounded-b-[30px] ${className}`}>
      <div className={`grid gap-3 ${gridClass}`}>{children}</div>
    </nav>
  );
}

export function BottomActionButton({ as: Component = 'button', variant = 'primary', className = '', children, ...props }) {
  const variantClass =
    variant === 'secondary'
      ? 'bg-card text-pine shadow-sm ring-1 ring-skyLine hover:border-pine/25 hover:bg-mint/70 disabled:bg-aquaCard disabled:text-muted/60'
      : 'bg-gradient-to-r from-[#0EA5D6] to-[#12BFC1] text-lightText shadow-md shadow-pine/15 hover:from-[#0B93C2] hover:to-[#0EAFAF] active:from-[#087FA8] active:to-[#0B9E9E] disabled:from-muted/40 disabled:to-muted/40 disabled:text-white/80';

  return (
    <Component
      className={`inline-flex h-12 min-h-12 w-full items-center justify-center gap-2 rounded-[18px] px-3 text-center text-sm font-bold leading-tight disabled:cursor-not-allowed ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
