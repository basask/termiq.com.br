import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import DevicePage from '@/pages/DevicesPage'
import CyclesPage from '@/pages/CyclesPage'
import AnalysisPage from '@/pages/AnalysisPage'
import ReportPage from '@/pages/ReportPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/devices" replace />} />
          <Route path="devices" element={<DevicePage />} />
          <Route path="cycles" element={<CyclesPage />} />
          <Route path="analysis" element={<AnalysisPage />} />
          <Route path="report" element={<ReportPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
