import { FileText, Download, Calendar, BarChart3, TrendingUp, FileSpreadsheet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const recentReports = [
  { name: 'Weekly thermal summary — May 19–25', type: 'Weekly', generated: '2026-05-26', size: '218 KB', status: 'Ready' },
  { name: 'Boiler-03 incident review', type: 'Incident', generated: '2026-05-25', size: '84 KB', status: 'Ready' },
  { name: 'Monthly energy audit — April 2026', type: 'Monthly', generated: '2026-05-01', size: '1.2 MB', status: 'Ready' },
  { name: 'Chiller anomaly analysis', type: 'Ad-hoc', generated: '2026-04-28', size: '156 KB', status: 'Ready' },
]

const reportTypes = [
  { title: 'Weekly summary', description: 'Thermal KPIs, cycle counts, and alert history over 7 days.', icon: BarChart3 },
  { title: 'Incident report', description: 'Root-cause timeline for a specific alert or anomaly event.', icon: FileText },
  { title: 'Monthly audit', description: 'Energy usage, uptime, and efficiency metrics for compliance.', icon: Calendar },
  { title: 'Trend analysis', description: 'Long-term drift detection across sensors and machines.', icon: TrendingUp },
]

export default function ReportPage() {
  return (
    <div className="p-7 flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-tq-fg-1">Reports</h1>
          <p className="font-mono text-[12px] text-tq-fg-3 mt-1">
            Generate and download operational reports
          </p>
        </div>
        <Button variant="primary" size="md">
          <FileSpreadsheet size={14} />
          New report
        </Button>
      </div>

      {/* Report type cards */}
      <div className="grid grid-cols-2 gap-4">
        {reportTypes.map(({ title, description, icon: Icon }) => (
          <Card
            key={title}
            className="flex items-start gap-4 p-4 hover:border-tq-border-strong transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-md bg-tq-green-50 flex items-center justify-center text-tq-green-700 shrink-0">
              <Icon size={18} />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-tq-fg-1">{title}</div>
              <div className="text-[12px] text-tq-fg-3 mt-0.5 leading-normal">{description}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent reports table */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle>Recent reports</CardTitle>
          <CardDescription>Previously generated reports available for download</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="bg-tq-bg-soft border-b border-tq-border">
                {['Report name', 'Type', 'Generated', 'Size', 'Status', ''].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[11px] font-semibold uppercase tracking-widest text-tq-fg-3 px-4 py-2.5"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentReports.map((r) => (
                <tr
                  key={r.name}
                  className="border-b border-tq-divider last:border-0 hover:bg-tq-bg-soft transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-tq-fg-1 max-w-xs truncate">
                    {r.name}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="default">{r.type}</Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-tq-fg-3">{r.generated}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-tq-fg-3">{r.size}</td>
                  <td className="px-4 py-3">
                    <Badge variant="success">{r.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" className="gap-1.5">
                      <Download size={12} />
                      Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
