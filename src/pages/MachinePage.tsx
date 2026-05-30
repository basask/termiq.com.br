import { Cpu, Thermometer, Gauge, Zap, Activity } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const machines = [
  { id: 'MCH-001', name: 'Boiler Unit A', status: 'Healthy', temp: '82.4°C', pressure: '3.2 bar', flow: '12.4 L/s' },
  { id: 'MCH-002', name: 'Boiler Unit B', status: 'Healthy', temp: '79.8°C', pressure: '3.1 bar', flow: '11.9 L/s' },
  { id: 'MCH-003', name: 'Chiller Node 1', status: 'Warning', temp: '94.2°C', pressure: '3.8 bar', flow: '12.8 L/s' },
  { id: 'MCH-004', name: 'Heat Exchanger', status: 'Healthy', temp: '68.1°C', pressure: '2.9 bar', flow: '10.6 L/s' },
  { id: 'MCH-005', name: 'Pump Station C', status: 'Offline', temp: '—', pressure: '—', flow: '—' },
]

const statusVariantMap: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  Healthy: 'success',
  Warning: 'warning',
  Offline: 'default',
}

const statusDotColor: Record<string, string> = {
  Healthy: 'bg-tq-success',
  Warning: 'bg-tq-warning',
  Offline: 'bg-tq-fg-4',
}

export default function MachinePage() {
  return (
    <div className="p-7 flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-tq-fg-1">Machine monitoring</h1>
          <p className="font-mono text-[12px] text-tq-fg-3 mt-1">
            Live · plant-norte · 5 machines · 38 sensors
          </p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total machines', value: '5', icon: Cpu, color: 'text-tq-green-600' },
          { label: 'Avg temperature', value: '81.1°C', icon: Thermometer, color: 'text-tq-heat-500' },
          { label: 'Avg flow rate', value: '11.9 L/s', icon: Activity, color: 'text-tq-series-2' },
          { label: 'Alerts active', value: '1', icon: Zap, color: 'text-tq-warning' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="p-4 pb-4 flex-row items-start gap-3">
              <div className={`mt-0.5 ${color}`}>
                <Icon size={20} />
              </div>
              <div className="space-y-1.5">
                <CardTitle className="font-mono text-[22px] leading-none">{value}</CardTitle>
                <CardDescription className="text-[11px] font-semibold uppercase tracking-widest text-tq-fg-3">
                  {label}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Machine table */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle>All machines</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-tq-bg-soft hover:bg-tq-bg-soft">
                {['Machine', 'ID', 'Status', 'Temperature', 'Pressure', 'Flow rate'].map((h) => (
                  <TableHead key={h}>
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {machines.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-semibold text-tq-fg-1">{m.name}</TableCell>
                  <TableCell className="font-mono text-[11px] text-tq-fg-3">{m.id}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariantMap[m.status] ?? 'default'}>
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${statusDotColor[m.status] ?? 'bg-tq-fg-4'}`}
                      />
                      {m.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-tq-fg-1">{m.temp}</TableCell>
                  <TableCell className="font-mono text-tq-fg-1">{m.pressure}</TableCell>
                  <TableCell className="font-mono text-tq-fg-1">{m.flow}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Placeholder notice */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-tq-border bg-tq-bg-soft text-[13px] text-tq-fg-3">
        <Gauge size={16} className="text-tq-fg-4 shrink-0" />
        Detailed machine telemetry, threshold configuration, and historical comparisons are coming soon.
      </div>
    </div>
  )
}
