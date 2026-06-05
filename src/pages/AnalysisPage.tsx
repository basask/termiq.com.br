import { Suspense, use } from 'react'
import ReactECharts from 'echarts-for-react'
import { Thermometer, Activity, Clock, LineChart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAnalysis } from '@/application/useAnalysis'
import type { Kpi } from '@/domain/analysis'
import type { LucideIcon } from 'lucide-react'

const KPI_DISPLAY: Array<{ icon: LucideIcon; color: string }> = [
  { icon: Thermometer, color: 'text-tq-green-600' },
  { icon: Clock, color: 'text-tq-heat-500' },
  { icon: LineChart, color: 'text-[#14B8A6]' },
  { icon: Activity, color: 'text-tq-danger' },
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

export default function AnalysisPage() {
  const { kpis } = useAnalysis()

  return (
    <div className="p-4 md:p-7 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-tq-fg-1">Analysis</h1>
        <p className="font-mono text-[12px] text-tq-fg-3 mt-1">
          SK-0045A · Metal Structure · Pirabeiraba Plant · Curing Oven
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <KpiCard key={kpi.label} kpi={kpi} display={KPI_DISPLAY[i]} />
        ))}
      </div>

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle>Thermal series — last 24 hours</CardTitle>
          <CardDescription>
            Inlet temp · Outlet temp · Flow rate · sensor_temp_b03
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <Suspense
            fallback={
              <div className="h-64 flex items-center justify-center font-mono text-[12px] text-tq-fg-3">
                Loading chart…
              </div>
            }
          >
            <ThermalChart />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
