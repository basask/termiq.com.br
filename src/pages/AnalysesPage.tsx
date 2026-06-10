import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LineChart, Plus, ExternalLink, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAnalysisStore } from '@/store/useAnalysisStore'
import { useCycleStore } from '@/store/useCycleStore'
import type { Analysis } from '@/domain/analysis'
import type { Cycle } from '@/domain/cycle'

function AnalysisRow({ analysis, cycle }: { analysis: Analysis; cycle: Cycle | undefined }) {
  const { t } = useTranslation()
  const date = new Date(analysis.createdAt)
  const created = `${date.toLocaleDateString()} ${date.toTimeString().slice(0, 5)}`

  return (
    <tr className="border-b border-tq-divider last:border-0 hover:bg-tq-bg-soft transition-colors">
      <td className="px-4 py-3 font-medium text-tq-fg-1">{analysis.name}</td>
      <td className="px-4 py-3 font-mono text-[11px] text-tq-fg-3">
        {cycle ? (
          <Link
            to={`/cycle/${encodeURIComponent(cycle.id)}`}
            className="hover:text-tq-fg-1 underline underline-offset-2"
          >
            {cycle.id}
          </Link>
        ) : (
          <span className="text-tq-fg-4">{analysis.cycleId}</span>
        )}
      </td>
      <td className="px-4 py-3 font-mono text-tq-fg-2">{cycle?.start ?? '—'}</td>
      <td className="px-4 py-3 font-mono text-[11px] text-tq-fg-3">{created}</td>
      <td className="px-4 py-3 text-right">
        <Link
          to={`/analysis/${analysis.id}`}
          className="inline-flex items-center gap-1 text-[12px] text-tq-fg-3 hover:text-tq-fg-1 font-medium"
        >
          <ExternalLink size={12} />
          {t('common.view')}
        </Link>
      </td>
    </tr>
  )
}

export default function AnalysesPage() {
  const { t } = useTranslation()
  const analyses = useAnalysisStore((s) => s.analyses)
  const cycles   = useCycleStore((s) => s.cycles)

  const cycleById = useMemo(() => new Map(cycles.map((c) => [c.id, c])), [cycles])

  const HEADERS = [
    t('analyses.colName'), t('analyses.colCycle'), t('analyses.colCycleStart'),
    t('analyses.colCreated'), '',
  ]

  return (
    <div className="p-4 md:p-7 flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-tq-fg-1">{t('analyses.title')}</h1>
          <p className="font-mono text-[12px] text-tq-fg-3 mt-1">
            {t('analyses.subtitle', { count: analyses.length })}
          </p>
        </div>
        <Button asChild>
          <Link to="/analysis/new">
            <Plus size={15} />
            {t('analyses.newAnalysis')}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="p-4">
          <CardTitle>{t('analyses.allAnalyses')}</CardTitle>
          <CardDescription>{t('analyses.allAnalysesDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {analyses.length === 0 ? (
            <div className="flex items-center gap-3 px-4 py-8 text-[13px] text-tq-fg-3">
              <LineChart size={15} className="shrink-0 text-tq-fg-4" />
              {t('analyses.noAnalysesPrefix')}{' '}
              <Link to="/analysis/new" className="underline hover:text-tq-fg-1">
                {t('analyses.noAnalysesLink')}
              </Link>{' '}
              {t('analyses.noAnalysesSuffix')}
            </div>
          ) : (
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr className="bg-tq-bg-soft border-b border-tq-border">
                  {HEADERS.map((h, i) => (
                    <th
                      key={i}
                      className="text-left text-[11px] font-semibold uppercase tracking-widest text-tq-fg-3 px-4 py-2.5 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {analyses.map((a) => (
                  <AnalysisRow key={a.id} analysis={a} cycle={cycleById.get(a.cycleId)} />
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-tq-border bg-tq-bg-soft text-[13px] text-tq-fg-3">
        <Clock size={16} className="text-tq-fg-4 shrink-0" />
        {t('analyses.comingSoon')}
      </div>
    </div>
  )
}
