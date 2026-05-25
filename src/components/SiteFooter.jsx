import { useLocation } from 'react-router-dom';

export default function SiteFooter() {
  const location = useLocation();
  const hasFixedActions = ['/budget', '/checklist', '/price-compare', '/car-recommend'].includes(location.pathname);

  return (
    <footer
      className={`border-t border-pine/10 bg-cream/70 px-5 pt-5 text-center text-[12px] font-medium leading-relaxed text-muted ${
        hasFixedActions ? 'footer-action-pad' : 'pb-5'
      }`}
    >
      <p>&copy; 2026 租车自驾工具箱</p>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <a
          className="text-muted transition-colors hover:text-pine hover:underline"
          href="https://beian.miit.gov.cn/"
          rel="noreferrer"
          target="_blank"
        >
          渝ICP备2026009822号
        </a>
        <a
          className="inline-flex items-center justify-center gap-1 text-muted transition-colors hover:text-pine hover:underline"
          href="https://beian.mps.gov.cn/#/query/webSearch?code=50010502504666"
          rel="noreferrer"
          target="_blank"
        >
          <img src="/images/beian-police.png" alt="公安备案图标" className="h-4 w-4 shrink-0" />
          <span>渝公网安备50010502504666号</span>
        </a>
      </div>
    </footer>
  );
}
