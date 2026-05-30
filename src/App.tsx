import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import MachinePage from '@/pages/MachinePage'
import CyclesPage from '@/pages/CyclesPage'
import AnalysisPage from '@/pages/AnalysisPage'
import ReportPage from '@/pages/ReportPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/machine" replace />} />
          <Route path="machine" element={<MachinePage />} />
          <Route path="cycles" element={<CyclesPage />} />
          <Route path="analysis" element={<AnalysisPage />} />
          <Route path="report" element={<ReportPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
