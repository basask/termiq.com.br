import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, AlertCircle, Layers, RefreshCw, Timer, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCycles } from '@/application/useCycles'
import { useDeviceStore } from '@/store/useDeviceStore'
import { useMachineStore } from '@/store/useMachineStore'
import { useProductStore } from '@/store/useProductStore'
import { cycleStatusBadgeVariant } from '@/domain/cycle'
import type { Cycle } from '@/domain/cycle'

// ── row ───────────────────────────────────────────────────────────────────────

function CycleRow({
  cycle: c,
  deviceName,
  machineName,
  productName,
}: {
  cycle: Cycle
  deviceName: string
  machineName: string
  productName: string
}) {
  const { t } = useTranslation()
  return (
    <tr className="border-b border-tq-divider last:border-0 hover:bg-tq-bg-soft transition-colors">
      <td className="px-4 py-3 font-mono text-[11px] text-tq-fg-3">{c.id}</td>
      <td className="px-4 py-3 font-medium text-tq-fg-1">{deviceName}</td>
      <td className="px-4 py-3 text-tq-fg-1">{machineName}</td>
      <td className="px-4 py-3 text-tq-fg-1">{productName}</td>
      <td className="px-4 py-3 font-mono text-tq-fg-2">{c.start}</td>
      <td className="px-4 py-3 font-mono text-tq-fg-2">{c.end}</td>
      <td className="px-4 py-3 font-mono text-tq-fg-1">{c.duration}</td>
      <td className="px-4 py-3 font-mono text-tq-fg-1">{c.temp}</td>
      <td className="px-4 py-3">
        <Badge variant={cycleStatusBadgeVariant[c.status] ?? 'default'}>{c.status}</Badge>
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          to={`/cycle/${encodeURIComponent(c.id)}`}
          className="inline-flex items-center gap-1 text-[12px] text-tq-fg-3 hover:text-tq-fg-1 font-medium"
        >
          <ExternalLink size={12} />
          {t('cycles.view')}
        </Link>
      </td>
    </tr>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function CyclesPage() {
  const { t } = useTranslation()
  const { cycles, warningCount } = useCycles()
  const devices  = useDeviceStore((s) => s.devices)
  const machines = useMachineStore((s) => s.machines)
  const products = useProductStore((s) => s.products)

  const deviceNameById  = useMemo(() => new Map(devices.map((d) => [d.id, d.name])),  [devices])
  const machineNameById = useMemo(() => new Map(machines.map((m) => [m.id, m.name])), [machines])
  const productNameById = useMemo(() => new Map(products.map((p) => [p.id, p.name])), [products])

  const uniqueDevices = useMemo(
    () => new Set(cycles.map((c) => c.deviceKey).filter(Boolean)).size,
    [cycles],
  )

  const kpis = [
    { labelKey: 'cycles.kpiTotal',    value: String(cycles.length),  icon: RefreshCw,    color: 'text-tq-green-600' },
    { labelKey: 'cycles.kpiDevices',  value: String(uniqueDevices),  icon: Layers,       color: 'text-tq-fg-3' },
    { labelKey: 'cycles.kpiCompleted',value: String(cycles.filter((c) => c.status === 'Completed').length), icon: CheckCircle2, color: 'text-tq-success' },
    { labelKey: 'cycles.kpiWarnings', value: String(warningCount),   icon: AlertCircle,  color: 'text-tq-warning' },
  ]

  const HEADERS = [
    t('cycles.colId'), t('cycles.colDevice'), t('cycles.colMachine'), t('cycles.colProduct'),
    t('cycles.colStart'), t('cycles.colEnd'), t('cycles.colDuration'), t('cycles.colPeakTemp'),
    t('cycles.colStatus'), '',
  ]

  return (
    <div className="p-4 md:p-7 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-tq-fg-1">{t('cycles.title')}</h1>
        <p className="font-mono text-[12px] text-tq-fg-3 mt-1">
          {t('cycles.subtitleLog')}
          {' · '}
          {t('cycles.cycleCount', { count: cycles.length })}
          {' · '}
          {t('cycles.deviceCount', { count: uniqueDevices })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ labelKey, value, icon: Icon, color }) => (
          <Card key={labelKey}>
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`mt-0.5 ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <div className="font-mono text-[22px] font-semibold text-tq-fg-1 leading-none">{value}</div>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-tq-fg-3 mt-1.5">
                  {t(labelKey)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="p-4">
          <CardTitle>{t('cycles.fetched')}</CardTitle>
          <CardDescription>{t('cycles.fetchedDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {cycles.length === 0 ? (
            <div className="flex items-center gap-3 px-4 py-8 text-[13px] text-tq-fg-3">
              <RefreshCw size={15} className="shrink-0 text-tq-fg-4" />
              {t('cycles.noCycles')}
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
                {cycles.map((cycle) => (
                  <CycleRow
                    key={cycle.id}
                    cycle={cycle}
                    deviceName={
                      cycle.deviceKey
                        ? (deviceNameById.get(cycle.deviceKey) ?? cycle.machine)
                        : cycle.machine
                    }
                    machineName={cycle.machineId ? (machineNameById.get(cycle.machineId) ?? '—') : '—'}
                    productName={cycle.productId ? (productNameById.get(cycle.productId) ?? '—') : '—'}
                  />
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-tq-border bg-tq-bg-soft text-[13px] text-tq-fg-3">
        <Timer size={16} className="text-tq-fg-4 shrink-0" />
        {t('cycles.comingSoon')}
      </div>
    </div>
  )
}
