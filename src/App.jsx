import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home.jsx';
import ChecklistPage from './pages/ChecklistPage.jsx';
import BudgetPage from './pages/BudgetPage.jsx';
import SuccessPage from './pages/SuccessPage.jsx';

export default function App() {
  return (
    <div className="min-h-screen px-4 py-4 text-ink sm:py-6">
      <div className="mx-auto min-h-[calc(100vh-2rem)] w-full max-w-[430px] overflow-hidden rounded-[28px] border border-white/70 bg-mint shadow-soft">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/checklist" element={<ChecklistPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
