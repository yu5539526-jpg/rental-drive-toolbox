import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home.jsx';
import ChecklistPage from './pages/ChecklistPage.jsx';
import BudgetPage from './pages/BudgetPage.jsx';
import RiskQuizPage from './pages/RiskQuizPage.jsx';
import PriceComparePage from './pages/PriceComparePage.jsx';
import SuccessPage from './pages/SuccessPage.jsx';
import SiteFooter from './components/SiteFooter.jsx';

export default function App() {
  return (
    <div className="min-h-screen px-0 text-ink sm:px-4 sm:py-6">
      <div className="app-shell mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/checklist" element={<ChecklistPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/risk-check" element={<RiskQuizPage />} />
          <Route path="/price-compare" element={<PriceComparePage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <SiteFooter />
      </div>
    </div>
  );
}
