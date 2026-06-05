import { useEffect, useState } from 'react'
import { getReports, getReportTemplates } from '@/infrastructure/reportRepository'
import type { Report, ReportTemplate } from '@/domain/report'

interface ReportsState {
  reports: Report[]
  templates: ReportTemplate[]
  loading: boolean
}

export function useReports(): ReportsState {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getReports().then((data) => {
      setReports(data)
      setLoading(false)
    })
  }, [])

  return {
    reports,
    templates: getReportTemplates(),
    loading,
  }
}
