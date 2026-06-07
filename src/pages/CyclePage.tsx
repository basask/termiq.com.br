import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, FileDown, Thermometer, Clock, BarChart2, Layers } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useCycleStore } from '@/store/useCycleStore'
import { cycleStatusBadgeVariant } from '@/domain/cycle'
import type { Cycle } from '@/domain/cycle'

// ── CSV export ────────────────────────────────────────────────────────────────

function exportCsv(cycle: Cycle) {
  if (!cycle.samples || !cycle.channels || !cycle.interval) return
  const [datePart, timePart] = cycle.start.split(' ')
  const [y, mo, d] = datePart.split('-').map(Number)
  const [h, mi, s] = timePart.split(':').map(Number)
  const startMs = new Date(y, mo - 1, d, h, mi, s).getTime()

  const chHeaders = Array.from({ length: cycle.channels }, (_, i) => `ch${i + 1}_degC`)
  const rows = cycle.samples.map((sample, i) => {
    const ts = new Date(startMs + i * cycle.interval! * 1000)
    return [
      ts.toISOString().slice(0, 10),
      ts.toTimeString().slice(0, 8),
      ...sample.map((t) => t.toFixed(1)),
    ]
  })

  const csv = [['date', 'time', ...chHeaders], ...rows].map((r) => r.join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = `cycle_${cycle.id.replace(/[^a-z0-9]/gi, '_')}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

// ── meta kpi card ─────────────────────────────────────────────────────────────

function MetaCard({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ElementType
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-start gap-3">
        <Icon size={18} className="mt-0.5 text-tq-fg-3 shrink-0" />
        <div>
          <div className={`text-[15px] font-semibold text-tq-fg-1 ${mono ? 'font-mono' : ''}`}>
            {value}
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-tq-fg-4 mt-0.5">
            {label}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── temperature table ─────────────────────────────────────────────────────────

function TemperatureTable({ cycle }: { cycle: Cycle }) {
  if (!cycle.samples || !cycle.channels || !cycle.interval) return null

  const [datePart, timePart] = cycle.start.split(' ')
  const [y, mo, d] = datePart.split('-').map(Number)
  const [h, mi, s] = timePart.split(':').map(Number)
  const startMs = new Date(y, mo - 1, d, h, mi, s).getTime()

  const PREVIEW = 50

  return (
    <Card>
      <CardHeader className="p-4 flex-row items-center justify-between">
        <CardTitle>Temperature samples</CardTitle>
        <Button variant="secondary" size="sm" onClick={() => exportCsv(cycle)}>
          <FileDown size={13} />
          Export CSV
        </Button>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-tq-bg-soft hover:bg-tq-bg-soft">
              <TableHead className="text-[11px]">Time</TableHead>
              {Array.from({ length: cycle.channels }, (_, i) => (
                <TableHead key={i} className="text-[11px]">Ch{i + 1} (°C)</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {cycle.samples.slice(0, PREVIEW).map((sample, i) => {
              const ts = new Date(startMs + i * cycle.interval! * 1000)
              return (
                <TableRow key={i}>
                  <TableCell className="font-mono text-[11px] text-tq-fg-3">
                    {ts.toTimeString().slice(0, 8)}
                  </TableCell>
                  {sample.map((t, ch) => (
                    <TableCell key={ch} className="font-mono text-[12px]">
                      {t.toFixed(1)}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        {cycle.samples.length > PREVIEW && (
          <p className="px-4 py-2 text-[12px] text-tq-fg-4 border-t border-tq-border">
            Showing first {PREVIEW} of {cycle.samples.length} samples — export CSV for the full dataset.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function CyclePage() {
  const { cycleId } = useParams<{ cycleId: string }>()
  const id    = cycleId ?? ''
  const cycle = useCycleStore((s) => s.cycles.find((c) => c.id === id))

  if (!cycle) {
    return (
      <div className="p-4 md:p-7 flex flex-col gap-4">
        <Link
          to="/cycles"
          className="inline-flex items-center gap-1.5 text-[13px] text-tq-fg-3 hover:text-tq-fg-1 w-fit"
        >
          <ArrowLeft size={14} />
          Back to cycles
        </Link>
        <p className="text-[14px] text-tq-fg-3">Cycle not found.</p>
      </div>
    )
  }

  const allTemps  = cycle.samples?.flat() ?? []
  const peakTemp  = allTemps.length > 0 ? Math.max(...allTemps).toFixed(1) : null

  return (
    <div className="p-4 md:p-7 flex flex-col gap-6">
      {/* breadcrumb */}
      <Link
        to="/cycles"
        className="inline-flex items-center gap-1.5 text-[13px] text-tq-fg-3 hover:text-tq-fg-1 w-fit"
      >
        <ArrowLeft size={14} />
        Back to cycles
      </Link>

      {/* header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-tq-fg-1">Cycle detail</h1>
          <p className="font-mono text-[12px] text-tq-fg-3 mt-1">
            {cycle.machine}
            {cycle.deviceKey && <> · <span className="text-tq-fg-4">{cycle.deviceKey}</span></>}
          </p>
        </div>
        <Badge variant={cycleStatusBadgeVariant[cycle.status] ?? 'default'}>
          {cycle.status}
        </Badge>
      </div>

      {/* meta kpis */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <MetaCard icon={Clock}      label="Start"     value={cycle.start}    mono />
        <MetaCard icon={Clock}      label="End"       value={cycle.end}      mono />
        <MetaCard icon={Clock}      label="Duration"  value={cycle.duration} />
        {peakTemp !== null
          ? <MetaCard icon={Thermometer} label="Peak temp" value={`${peakTemp} °C`} />
          : <MetaCard icon={Thermometer} label="Peak temp" value={cycle.temp} />
        }
        {cycle.channels !== undefined && (
          <MetaCard icon={Layers}   label="Channels"  value={String(cycle.channels)} />
        )}
        {cycle.interval !== undefined && (
          <MetaCard icon={BarChart2} label="Interval" value={`${cycle.interval} s`} />
        )}
      </div>

      {/* temperature table (device cycles only) */}
      {cycle.samples ? (
        <TemperatureTable cycle={cycle} />
      ) : (
        <Card>
          <CardContent className="p-6 text-[13px] text-tq-fg-3">
            Detailed temperature data is not available for this cycle.
            Data is only stored for cycles fetched directly from a connected device.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
