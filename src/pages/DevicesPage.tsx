import { useState } from 'react'
import { Cpu, Thermometer, Gauge, Zap, Activity, Battery, BatteryFull, BatteryLowIcon, BatteryMediumIcon, Plus, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DeviceFormDialog, DeleteConfirmDialog, type DeviceFormValues } from '@/components/DeviceDialog'
import { useDevices } from '@/application/useDevices'
import { deviceStatusBadgeVariant, deviceStatusDotColor } from '@/domain/device'
import type { Device } from '@/domain/device'

// ── small presentational helpers ─────────────────────────────────────────────

function BatteryIcon({ value }: { value: number }) {
  if (value <= 0.0) return <Battery className="text-tq-danger" />
  if (value <= 0.3) return <BatteryLowIcon className="text-tq-warning" />
  if (value <= 0.6) return <BatteryMediumIcon className="text-tq-success" />
  return <BatteryFull className="text-tq-success" />
}

function BatteryLevel({ battery }: { battery: number }) {
  return (
    <div className="flex flex-row gap-2 items-center">
      <BatteryIcon value={battery} />
      <span>{Math.trunc(battery * 100)}%</span>
    </div>
  )
}

// ── dialog state ──────────────────────────────────────────────────────────────

type DialogState =
  | { type: 'create' }
  | { type: 'edit'; device: Device }
  | { type: 'delete'; device: Device }
  | null

// ── page ──────────────────────────────────────────────────────────────────────

export default function DevicePage() {
  const { devices, totalCount, alertCount, createDevice, updateDevice, removeDevice } = useDevices()
  const [dialog, setDialog] = useState<DialogState>(null)

  function handleFormSubmit(values: DeviceFormValues) {
    const patch = {
      name: values.name,
      status: values.status,
      battery: values.batteryPct / 100,
      channels: values.channels,
    }
    if (dialog?.type === 'create') {
      createDevice(patch)
    } else if (dialog?.type === 'edit') {
      updateDevice(dialog.device.id, patch)
    }
    setDialog(null)
  }

  function handleDelete() {
    if (dialog?.type === 'delete') removeDevice(dialog.device.id)
    setDialog(null)
  }

  const kpis = [
    { label: 'Total device', value: String(totalCount), icon: Cpu, color: 'text-tq-green-600' },
    { label: 'Avg temperature', value: '81.1°C', icon: Thermometer, color: 'text-tq-heat-500' },
    { label: 'Avg flow rate', value: '11.9 L/s', icon: Activity, color: 'text-tq-series-2' },
    { label: 'Alerts active', value: String(alertCount), icon: Zap, color: 'text-tq-warning' },
  ]

  return (
    <div className="p-4 md:p-7 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-tq-fg-1">Devices monitoring</h1>
          <p className="font-mono text-[12px] text-tq-fg-3 mt-1">
            Live · Pirabeiraba Plant · {totalCount} device · 38 sensors
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setDialog({ type: 'create' })}>
          <Plus size={14} />
          Add device
        </Button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color }) => (
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

      {/* Device table */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle>All devices</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-tq-bg-soft hover:bg-tq-bg-soft">
                {['Device', 'ID', 'Status', 'Battery', 'Channels', 'Cycles', ''].map((h) => (
                  <TableHead key={h}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell className="font-semibold text-tq-fg-1">{device.name}</TableCell>
                  <TableCell className="font-mono text-[11px] text-tq-fg-3">{device.id}</TableCell>
                  <TableCell>
                    <Badge variant={deviceStatusBadgeVariant[device.status]}>
                      <span className={`w-1.5 h-1.5 rounded-full ${deviceStatusDotColor[device.status]}`} />
                      {device.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-tq-fg-1">
                    <BatteryLevel battery={device.battery} />
                  </TableCell>
                  <TableCell className="font-mono text-tq-fg-1">{device.channels}</TableCell>
                  <TableCell className="font-mono text-tq-fg-1">{device.cycles}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Edit device"
                        onClick={() => setDialog({ type: 'edit', device })}
                      >
                        <Pencil size={13} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Remove device"
                        className="text-tq-danger hover:text-tq-danger hover:bg-red-50"
                        onClick={() => setDialog({ type: 'delete', device })}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Placeholder notice */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-tq-border bg-tq-bg-soft text-[13px] text-tq-fg-3">
        <Gauge size={16} className="text-tq-fg-4 shrink-0" />
        Detailed device telemetry, threshold configuration, and historical comparisons are coming soon.
      </div>

      {/* Dialogs */}
      {(dialog?.type === 'create' || dialog?.type === 'edit') && (
        <DeviceFormDialog
          mode={dialog.type}
          device={dialog.type === 'edit' ? dialog.device : undefined}
          onClose={() => setDialog(null)}
          onSubmit={handleFormSubmit}
        />
      )}

      {dialog?.type === 'delete' && (
        <DeleteConfirmDialog
          device={dialog.device}
          onClose={() => setDialog(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}
