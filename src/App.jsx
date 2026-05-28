import { Navigate, Route, Routes } from 'react-router-dom';
import EntryHome from './pages/EntryHome.jsx';
import Home from './pages/Home.jsx';
import ChecklistPage from './pages/ChecklistPage.jsx';
import CarInspectionMap from './pages/CarInspectionMap.jsx';
import BudgetPage from './pages/BudgetPage.jsx';
import PriceComparePage from './pages/PriceComparePage.jsx';
import CarRecommendPage from './pages/CarRecommendPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import SuccessPage from './pages/SuccessPage.jsx';
import SiteFooter from './components/SiteFooter.jsx';

export default function App() {
  return (
    <div className="min-h-screen px-0 text-ink sm:px-4 sm:py-6">
      <div className="app-shell mx-auto">
        <Routes>
          <Route path="/" element={<EntryHome />} />
          <Route path="/toolbox" element={<Home />} />
          <Route path="/checklist" element={<ChecklistPage />} />
          <Route path="/car-inspection-map" element={<CarInspectionMap />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/price-compare" element={<PriceComparePage />} />
          <Route path="/car-recommend" element={<CarRecommendPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <SiteFooter />
      </div>
    </div>
  );
}
