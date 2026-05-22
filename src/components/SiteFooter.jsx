import { useLocation } from 'react-router-dom';

export default function SiteFooter() {
  const location = useLocation();
  const hasFixedActions = ['/budget', '/checklist', '/price-compare', '/car-recommend'].includes(location.pathname);

  return (
    <footer
      className={`border-t border-pine/10 bg-cream/70 px-5 pt-5 text-center text-[11px] font-medium leading-relaxed text-muted ${
        hasFixedActions ? 'footer-action-pad' : 'pb-5'
      }`}
    >
      <p>&copy; 2026 租车自驾工具箱</p>
      <p>
        <a
          className="hover:text-pine hover:underline"
          href="https://beian.miit.gov.cn/"
          rel="noreferrer"
          target="_blank"
        >
          渝ICP备2026009822号
        </a>
      </p>
      <p>公安备案号：审核通过后填写</p>
    </footer>
  );
}
