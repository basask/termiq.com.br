import { RefreshCw, Clock, CheckCircle2, AlertCircle, Timer } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const recentCycles = [
  { id: 'CYC-2024-084', machine: 'Boiler Unit A', start: '14:00', end: '14:48', duration: '48 min', status: 'Completed', temp: '82°C' },
  { id: 'CYC-2024-083', machine: 'Boiler Unit B', start: '13:30', end: '14:22', duration: '52 min', status: 'Completed', temp: '79°C' },
  { id: 'CYC-2024-082', machine: 'Chiller Node 1', start: '13:00', end: '—', duration: 'Running…', status: 'Active', temp: '94°C' },
  { id: 'CYC-2024-081', machine: 'Heat Exchanger', start: '12:15', end: '13:00', duration: '45 min', status: 'Completed', temp: '68°C' },
  { id: 'CYC-2024-080', machine: 'Boiler Unit A', start: '11:45', end: '12:30', duration: '45 min', status: 'Warning', temp: '91°C' },
]

const cycleStatusVariant: Record<string, 'success' | 'brand' | 'warning' | 'default'> = {
  Completed: 'success',
  Active: 'brand',
  Warning: 'warning',
}

export default function CyclesPage() {
  return (
    <div className="p-7 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-tq-fg-1">Cycles</h1>
        <p className="font-mono text-[12px] text-tq-fg-3 mt-1">
          Operational cycle log · today · 5 machines
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Cycles today', value: '84', icon: RefreshCw, color: 'text-tq-green-600' },
          { label: 'Avg cycle time', value: '47 min', icon: Clock, color: 'text-tq-fg-3' },
          { label: 'Completed', value: '82', icon: CheckCircle2, color: 'text-tq-success' },
          { label: 'With warnings', value: '2', icon: AlertCircle, color: 'text-tq-warning' },
        ].map(({ label, value, icon: Icon, color }) => (
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

      {/* Cycle log */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle>Recent cycles</CardTitle>
          <CardDescription>Last 5 cycles across all machines</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="bg-tq-bg-soft border-b border-tq-border">
                {['Cycle ID', 'Machine', 'Start', 'End', 'Duration', 'Peak temp', 'Status'].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left text-[11px] font-semibold uppercase tracking-widest text-tq-fg-3 px-4 py-2.5"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {recentCycles.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-tq-divider last:border-0 hover:bg-tq-bg-soft transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-[11px] text-tq-fg-3">{c.id}</td>
                  <td className="px-4 py-3 font-medium text-tq-fg-1">{c.machine}</td>
                  <td className="px-4 py-3 font-mono text-tq-fg-2">{c.start}</td>
                  <td className="px-4 py-3 font-mono text-tq-fg-2">{c.end}</td>
                  <td className="px-4 py-3 font-mono text-tq-fg-1">{c.duration}</td>
                  <td className="px-4 py-3 font-mono text-tq-fg-1">{c.temp}</td>
                  <td className="px-4 py-3">
                    <Badge variant={cycleStatusVariant[c.status] ?? 'default'}>{c.status}</Badge>
                  </td>
                </tr>
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
