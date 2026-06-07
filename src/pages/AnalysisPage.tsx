import { Suspense, use, useState, useMemo, type FormEvent } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { Thermometer, Activity, Clock, LineChart, ArrowLeft, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { useAnalysis } from '@/application/useAnalysis'
import { buildChartOptionFromCycle, buildKpisFromCycle } from '@/infrastructure/analysisRepository'
import { useAnalysisStore } from '@/store/useAnalysisStore'
import { useCycleStore } from '@/store/useCycleStore'
import { useMachineStore } from '@/store/useMachineStore'
import { useProductStore } from '@/store/useProductStore'
import type { Analysis, Kpi } from '@/domain/analysis'
import type { Cycle } from '@/domain/cycle'
import type { LucideIcon } from 'lucide-react'

// ── shared sub-components ─────────────────────────────────────────────────────

const KPI_DISPLAY: Array<{ icon: LucideIcon; color: string }> = [
  { icon: Thermometer, color: 'text-tq-green-600' },
  { icon: Clock,       color: 'text-tq-heat-500'  },
  { icon: LineChart,   color: 'text-[#14B8A6]'    },
  { icon: Activity,    color: 'text-tq-danger'     },
]

function KpiCard({ kpi, display }: { kpi: Kpi; display: typeof KPI_DISPLAY[0] }) {
  const { icon: Icon, color } = display
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-tq-fg-3">
            {kpi.label}
          </span>
          <span className={color}>
            <Icon size={16} />
          </span>
        </div>
        <div className="font-mono text-[26px] font-semibold text-tq-fg-1 leading-none">
          {kpi.value}
        </div>
        <div
          className={`font-mono text-[11px] mt-1.5 ${
            kpi.deltaOk ? 'text-tq-green-700' : 'text-tq-heat-600 font-semibold'
          }`}
        >
          {kpi.delta}
        </div>
      </CardContent>
    </Card>
  )
}

function ThermalChart() {
  const { timeseriesData, buildChartOption } = useAnalysis()
  const timeseries = use(timeseriesData)
  return (
    <ReactECharts
      option={buildChartOption(timeseries)}
      style={{ height: 'clamp(280px, 50vw, 520px)', width: '100%' }}
      lazyUpdate
    />
  )
}

// ── new analysis form ─────────────────────────────────────────────────────────

function NewAnalysisForm() {
  const [searchParams]  = useSearchParams()
  const navigate        = useNavigate()
  const addAnalysis     = useAnalysisStore((s) => s.addAnalysis)
  const allCycles       = useCycleStore((s) => s.cycles)
  const machines        = useMachineStore((s) => s.machines)
  const products        = useProductStore((s) => s.products)

  const machineNameById = useMemo(() => new Map(machines.map((m) => [m.id, m.name])), [machines])
  const productNameById = useMemo(() => new Map(products.map((p) => [p.id, p.name])), [products])

  // Only cycles with both Machine and Product assigned are eligible for analysis
  const eligibleCycles = useMemo(
    () => allCycles.filter((c) => c.machineId && c.productId),
    [allCycles],
  )

  const [name,    setName]    = useState('')
  const [cycleId, setCycleId] = useState(searchParams.get('cycleId') ?? '')

  const isEligibleCycleSelected = eligibleCycles.some((c) => c.id === cycleId)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || !isEligibleCycleSelected) return
    const id = crypto.randomUUID()
    addAnalysis({ id, name: trimmed, cycleId, createdAt: new Date().toISOString() })
    navigate(`/analysis/${id}`)
  }

  return (
    <div className="p-4 md:p-7 flex flex-col gap-6">
      <Link
        to="/analyses"
        className="inline-flex items-center gap-1.5 text-[13px] text-tq-fg-3 hover:text-tq-fg-1 w-fit"
      >
        <ArrowLeft size={14} />
        Back to analyses
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-tq-fg-1">New analysis</h1>
        <p className="font-mono text-[12px] text-tq-fg-3 mt-1">
          Name this analysis and link it to a cycle
        </p>
      </div>

      <Card className="max-w-lg">
        <CardHeader className="p-4">
          <CardTitle>Analysis setup</CardTitle>
          <CardDescription>
            Only cycles with both Machine and Product assigned are listed. Set those on the{' '}
            <Link to="/cycles" className="underline hover:text-tq-fg-1">Cycle page</Link> first if needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-tq-fg-4">
                Cycle
              </label>
              <Select
                value={isEligibleCycleSelected ? cycleId : ''}
                onChange={(e) => setCycleId(e.target.value)}
              >
                <option value="">— select a cycle —</option>
                {eligibleCycles.map((c: Cycle) => {
                  const machine = machineNameById.get(c.machineId!) ?? c.machineId
                  const product = productNameById.get(c.productId!) ?? c.productId
                  return (
                    <option key={c.id} value={c.id}>
                      {c.start} · {machine} · {product}
                    </option>
                  )
                })}
              </Select>
              {eligibleCycles.length === 0 && (
                <p className="text-[12px] text-tq-fg-4">
                  No eligible cycles.{' '}
                  <Link to="/cycles" className="underline hover:text-tq-fg-2">
                    Open a cycle
                  </Link>{' '}
                  and assign both a Machine and a Product to it first.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-tq-fg-4">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Batch SK-0045A — Curing oven"
                className="w-full rounded-md border border-tq-border bg-white px-2.5 py-1.5 text-[13px] text-tq-fg-1 focus:outline-none focus:ring-2 focus:ring-tq-green-500 focus:ring-offset-1 placeholder:text-tq-fg-4"
              />
            </div>

            <Button
              type="submit"
              disabled={!name.trim() || !isEligibleCycleSelected}
              className="self-start"
            >
              <Plus size={14} />
              Create analysis
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// ── analysis detail ───────────────────────────────────────────────────────────

function AnalysisDetail({ analysis }: { analysis: Analysis }) {
  const { kpis: demoKpis } = useAnalysis()
  const cycle = useCycleStore((s) => s.cycles.find((c) => c.id === analysis.cycleId))

  const hasSamples = !!(cycle?.samples?.length)
  const kpis        = hasSamples ? buildKpisFromCycle(cycle!) : demoKpis
  const cycleOption = hasSamples ? buildChartOptionFromCycle(cycle!) : null

  const createdDate = new Date(analysis.createdAt)
  const createdStr  = `${createdDate.toLocaleDateString()} ${createdDate.toTimeString().slice(0, 5)}`

  const chartTitle = hasSamples
    ? `Temperature — ${cycle!.channels ?? 1} channel${(cycle!.channels ?? 1) !== 1 ? 's' : ''}`
    : 'Thermal series — last 24 hours'

  const chartDesc = hasSamples
    ? `${cycle!.samples!.length} samples · ${cycle!.interval ?? 1}s interval · started ${cycle!.start}`
    : 'Inlet temp · Outlet temp · Flow rate · sensor_temp_b03'

  return (
    <div className="p-4 md:p-7 flex flex-col gap-6">
      <Link
        to="/analyses"
        className="inline-flex items-center gap-1.5 text-[13px] text-tq-fg-3 hover:text-tq-fg-1 w-fit"
      >
        <ArrowLeft size={14} />
        Back to analyses
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-tq-fg-1">{analysis.name}</h1>
        <p className="font-mono text-[12px] text-tq-fg-3 mt-1">
          Created {createdStr}
          {cycle && (
            <>
              {' · '}
              <Link
                to={`/cycle/${encodeURIComponent(cycle.id)}`}
                className="underline underline-offset-2 hover:text-tq-fg-1"
              >
                {cycle.id}
              </Link>
              {' · '}
              {cycle.start}
            </>
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <KpiCard key={kpi.label} kpi={kpi} display={KPI_DISPLAY[i % KPI_DISPLAY.length]} />
        ))}
      </div>

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle>{chartTitle}</CardTitle>
          <CardDescription>{chartDesc}</CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          {hasSamples && cycleOption ? (
            <ReactECharts
              option={cycleOption}
              style={{ height: 'clamp(280px, 50vw, 520px)', width: '100%' }}
              lazyUpdate
            />
          ) : (
            <Suspense
              fallback={
                <div className="h-64 flex items-center justify-center font-mono text-[12px] text-tq-fg-3">
                  Loading chart…
                </div>
              }
            >
              <ThermalChart />
            </Suspense>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function AnalysisPage() {
  const { analysisId } = useParams<{ analysisId: string }>()
  const analysis = useAnalysisStore((s) => s.analyses.find((a) => a.id === analysisId))

  if (analysisId === 'new') return <NewAnalysisForm />

  if (!analysis) {
    return (
      <div className="p-4 md:p-7 flex flex-col gap-4">
        <Link
          to="/analyses"
          className="inline-flex items-center gap-1.5 text-[13px] text-tq-fg-3 hover:text-tq-fg-1 w-fit"
        >
          <ArrowLeft size={14} />
          Back to analyses
        </Link>
        <p className="text-[14px] text-tq-fg-3">Analysis not found.</p>
      </div>
    )
  }

  return <AnalysisDetail analysis={analysis} />
}
