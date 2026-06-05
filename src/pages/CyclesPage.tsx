import { RefreshCw, Clock, CheckCircle2, AlertCircle, Timer } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCycles } from '@/application/useCycles'
import { cycleStatusBadgeVariant } from '@/domain/cycle'
import type { Cycle } from '@/domain/cycle'

function CycleRow({ cycle: c }: { cycle: Cycle }) {
  return (
    <tr className="border-b border-tq-divider last:border-0 hover:bg-tq-bg-soft transition-colors">
      <td className="px-4 py-3 font-mono text-[11px] text-tq-fg-3">{c.id}</td>
      <td className="px-4 py-3 font-medium text-tq-fg-1">{c.machine}</td>
      <td className="px-4 py-3 font-mono text-tq-fg-2">{c.start}</td>
      <td className="px-4 py-3 font-mono text-tq-fg-2">{c.end}</td>
      <td className="px-4 py-3 font-mono text-tq-fg-1">{c.duration}</td>
      <td className="px-4 py-3 font-mono text-tq-fg-1">{c.temp}</td>
      <td className="px-4 py-3">
        <Badge variant={cycleStatusBadgeVariant[c.status] ?? 'default'}>{c.status}</Badge>
      </td>
    </tr>
  )
}

export default function CyclesPage() {
  const { cycles, warningCount } = useCycles()

  const kpis = [
    { label: 'Cycles today', value: '84', icon: RefreshCw, color: 'text-tq-green-600' },
    { label: 'Avg cycle time', value: '47 min', icon: Clock, color: 'text-tq-fg-3' },
    { label: 'Completed', value: '82', icon: CheckCircle2, color: 'text-tq-success' },
    { label: 'With warnings', value: String(warningCount), icon: AlertCircle, color: 'text-tq-warning' },
  ]

  return (
    <div className="p-4 md:p-7 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-tq-fg-1">Cycles</h1>
        <p className="font-mono text-[12px] text-tq-fg-3 mt-1">
          Operational cycle log · today · 5 machines
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`mt-0.5 ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <div className="font-mono text-[22px] font-semibold text-tq-fg-1 leading-none">
                  {value}
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-tq-fg-3 mt-1.5">
                  {label}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="p-4">
          <CardTitle>Recent cycles</CardTitle>
          <CardDescription>Last 5 cycles across all machines</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="bg-tq-bg-soft border-b border-tq-border">
                {['Cycle ID', 'Machine', 'Start', 'End', 'Duration', 'Peak temp', 'Status'].map((h) => (
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
              {cycles.map((cycle) => (
                <CycleRow key={cycle.id} cycle={cycle} />
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-tq-border bg-tq-bg-soft text-[13px] text-tq-fg-3">
        <Timer size={16} className="text-tq-fg-4 shrink-0" />
        Cycle scheduling, threshold editing, and per-cycle trend breakdowns are coming soon.
      </div>
    </div>
  )
}
