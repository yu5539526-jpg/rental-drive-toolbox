import { useLocation } from 'react-router-dom';

export default function SiteFooter() {
  const location = useLocation();
  const hasFixedActions = ['/budget', '/checklist', '/risk-check', '/price-compare'].includes(location.pathname);

  return (
    <footer
      className={`border-t border-pine/10 bg-cream/70 px-5 pt-5 text-center text-[11px] font-bold leading-relaxed text-muted ${
        hasFixedActions ? 'pb-28' : 'pb-5'
      }`}
    >
      <p>小红书：pYuY</p>
      <p>ICP备案号：备案后填写</p>
      <p className="mt-1">本工具仅供自驾预算和租车参考，实际价格以租车平台为准。</p>
    </footer>
  );
}
