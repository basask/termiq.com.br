import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import DevicePage from '@/pages/DevicesPage'
import CyclesPage from '@/pages/CyclesPage'
import CyclePage from '@/pages/CyclePage'
import AnalysesPage from '@/pages/AnalysesPage'
import AnalysisPage from '@/pages/AnalysisPage'
import ReportPage from '@/pages/ReportPage'
import ProductsPage from '@/pages/ProductsPage'
import MachinesPage from '@/pages/MachinesPage'
import SettingsPage from '@/pages/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/devices" replace />} />
          <Route path="devices" element={<DevicePage />} />
          <Route path="cycles" element={<CyclesPage />} />
          <Route path="cycle/:cycleId" element={<CyclePage />} />
          <Route path="analyses" element={<AnalysesPage />} />
          <Route path="analysis/:analysisId" element={<AnalysisPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="machines" element={<MachinesPage />} />
          <Route path="report" element={<ReportPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
