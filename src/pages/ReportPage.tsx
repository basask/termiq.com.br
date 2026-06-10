import { useTranslation } from 'react-i18next'
import { FileText, Download, BarChart3, Calendar, TrendingUp, FileSpreadsheet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useReports } from '@/application/useReports'
import type { ReportTemplate } from '@/domain/report'

const TEMPLATE_ICONS: Record<string, LucideIcon> = {
  'Weekly summary': BarChart3,
  'Incident report': FileText,
  'Monthly audit': Calendar,
  'Trend analysis': TrendingUp,
}

function TemplateCard({ template }: { template: ReportTemplate }) {
  const Icon = TEMPLATE_ICONS[template.title] ?? FileText
  return (
    <Card className="flex items-start gap-4 p-4 hover:border-tq-border-strong transition-colors cursor-pointer">
      <div className="w-9 h-9 rounded-md bg-tq-green-50 flex items-center justify-center text-tq-green-700 shrink-0">
        <Icon size={18} />
      </div>
      <div>
        <div className="text-[13px] font-semibold text-tq-fg-1">{template.title}</div>
        <div className="text-[12px] text-tq-fg-3 mt-0.5 leading-normal">{template.description}</div>
      </div>
    </Card>
  )
}

export default function ReportPage() {
  const { t } = useTranslation()
  const { reports, templates } = useReports()

  const tableHeaders = [
    t('report.colName'), t('report.colType'), t('report.colGenerated'),
    t('report.colSize'), t('report.colStatus'), '',
  ]

  return (
    <div className="p-4 md:p-7 flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-tq-fg-1">{t('report.title')}</h1>
          <p className="font-mono text-[12px] text-tq-fg-3 mt-1">{t('report.subtitle')}</p>
        </div>
        <Button variant="primary" size="md">
          <FileSpreadsheet size={14} />
          {t('report.newReport')}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {templates.map((template) => (
          <TemplateCard key={template.title} template={template} />
        ))}
      </div>

      <Card>
        <CardHeader className="p-4">
          <CardTitle>{t('report.recentReports')}</CardTitle>
          <CardDescription>{t('report.recentReportsDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="bg-tq-bg-soft border-b border-tq-border">
                {tableHeaders.map((h, i) => (
                  <th
                    key={i}
                    className="text-left text-[11px] font-semibold uppercase tracking-widest text-tq-fg-3 px-4 py-2.5"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr
                  key={r.name}
                  className="border-b border-tq-divider last:border-0 hover:bg-tq-bg-soft transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-tq-fg-1 max-w-xs truncate">{r.name}</td>
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
                      {t('report.download')}
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
