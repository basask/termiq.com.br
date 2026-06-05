export type ReportType = 'Weekly' | 'Incident' | 'Monthly' | 'Ad-hoc'
export type ReportStatus = 'Ready' | 'Pending' | 'Failed'

export interface Report {
  name: string
  type: ReportType
  generated: string
  size: string
  status: ReportStatus
}

export interface ReportTemplate {
  title: string
  description: string
}
