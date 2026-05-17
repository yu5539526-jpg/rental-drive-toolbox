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
      ? 'bg-card text-pine shadow-sm ring-1 ring-pine/10 disabled:text-muted/50'
      : 'bg-pine text-white shadow-lg shadow-pine/20 disabled:bg-muted/40 disabled:text-white/80';

  return (
    <Component
      className={`inline-flex h-12 min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-3 text-center text-sm font-bold leading-tight disabled:cursor-not-allowed ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
