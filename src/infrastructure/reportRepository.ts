import type { Report, ReportTemplate } from '@/domain/report'

const REPORTS: Report[] = [
  { name: 'Weekly thermal summary — May 19–25', type: 'Weekly', generated: '2026-05-26', size: '218 KB', status: 'Ready' },
  { name: 'Boiler-03 incident review', type: 'Incident', generated: '2026-05-25', size: '84 KB', status: 'Ready' },
  { name: 'Monthly energy audit — April 2026', type: 'Monthly', generated: '2026-05-01', size: '1.2 MB', status: 'Ready' },
  { name: 'Chiller anomaly analysis', type: 'Ad-hoc', generated: '2026-04-28', size: '156 KB', status: 'Ready' },
]

const REPORT_TEMPLATES: ReportTemplate[] = [
  { title: 'Weekly summary', description: 'Thermal KPIs, cycle counts, and alert history over 7 days.' },
  { title: 'Incident report', description: 'Root-cause timeline for a specific alert or anomaly event.' },
  { title: 'Monthly audit', description: 'Energy usage, uptime, and efficiency metrics for compliance.' },
  { title: 'Trend analysis', description: 'Long-term drift detection across sensors and machines.' },
]

export function getReports(): Promise<Report[]> {
  return Promise.resolve(REPORTS)
}

export function getReportTemplates(): ReportTemplate[] {
  return REPORT_TEMPLATES
}
