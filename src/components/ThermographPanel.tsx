import { Link } from 'react-router-dom'
import { Loader2, Plug, Unplug, List, Download, AlertTriangle, CheckCircle2, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useThermograph, cycleUid } from '@/application/useThermograph'
import { useCycleStore } from '@/store/useCycleStore'
import type { UsbDeviceInfo } from '@/application/useUsbDevices'
import type { IThermographDriver } from '@/infrastructure/thermographDriver'

interface Props {
  device: UsbDeviceInfo
  createDriver: () => IThermographDriver
  onConnected?: () => void
}

export function ThermographPanel({ device, createDriver, onConnected }: Props) {
  const deviceKey  = device.serialNumber ?? `${device.vendorId}-${device.productId}`
  const deviceName = device.productName ?? 'Thermograph device'

  const {
    status, busyOp, error,
    info, cycles, fetchingCycleIdx,
    connect, disconnect, loadCycles, fetchCycle, fetchAllCycles,
  } = useThermograph(deviceKey, deviceName, createDriver, onConnected)

  // Reactive: reference changes when any cycle is added → per-row badges update automatically.
  const cycleIds = useCycleStore((s) => s.cycleIds)

  const isConnected  = status === 'connected'
  const isConnecting = status === 'connecting'
  const isBusy       = busyOp !== null

  const pendingCount = cycles
    ? cycles.filter((e) => !cycleIds.has(cycleUid(deviceKey, e.startDatetime))).length
    : 0

  return (
    <Card>
      {/* ── header ── */}
      <CardHeader className="p-4 flex-row items-start justify-between gap-4">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isConnected  ? 'bg-tq-success' :
                isConnecting ? 'bg-tq-warning animate-pulse' :
                status === 'error' ? 'bg-tq-danger' :
                'bg-tq-fg-4'
              }`}
            />
            <span className="text-[14px] font-semibold text-tq-fg-1 truncate">
              {deviceName}
            </span>
            {device.serialNumber && (
              <span className="font-mono text-[11px] text-tq-fg-3 shrink-0">
                S/N {device.serialNumber}
              </span>
            )}
          </div>
          <p className="font-mono text-[11px] text-tq-fg-4 pl-4">
            {device.manufacturerName && <>{device.manufacturerName} · </>}
            VID 0x{device.vendorId.toString(16).toUpperCase().padStart(4, '0')} ·{' '}
            PID 0x{device.productId.toString(16).toUpperCase().padStart(4, '0')}
          </p>
        </div>

        {isConnected ? (
          <Button variant="ghost" size="sm" onClick={disconnect}>
            <Unplug size={13} />
            Disconnect
          </Button>
        ) : (
          <Button variant="primary" size="sm" onClick={connect} disabled={isConnecting}>
            {isConnecting ? <Loader2 size={13} className="animate-spin" /> : <Plug size={13} />}
            {isConnecting ? 'Connecting…' : 'Connect'}
          </Button>
        )}
      </CardHeader>

      {/* ── body ── */}
      {status !== 'disconnected' && (
        <>
          <Separator />
          <CardContent className="p-4 space-y-5">

            {/* error */}
            {status === 'error' && error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
                <AlertTriangle size={14} className="mt-0.5 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* operations toolbar */}
            {isConnected && (
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="secondary" size="sm" onClick={loadCycles} disabled={isBusy}>
                  <List size={13} />
                  List cycles
                </Button>

                {cycles !== null && cycles.length > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={fetchAllCycles}
                    disabled={isBusy || pendingCount === 0}
                  >
                    <Download size={13} />
                    {pendingCount === 0
                      ? 'All cycles fetched'
                      : `Fetch all cycles (${pendingCount} new)`}
                  </Button>
                )}

                {isBusy && (
                  <span className="flex items-center gap-1.5 text-[12px] text-tq-fg-3 ml-1">
                    <Loader2 size={12} className="animate-spin" />
                    {busyOp}
                  </span>
                )}
              </div>
            )}

            {/* device info */}
            {info && (
              <section className="space-y-2">
                <SectionLabel>Device info</SectionLabel>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5 text-[13px]">
                  {device.serialNumber && (
                    <InfoRow label="Serial" value={device.serialNumber} mono />
                  )}
                  <InfoRow label="Model"      value={`${info.modelHint || '—'} · v${info.version}`} />
                  <InfoRow label="Clock"      value={`${info.clockDate} ${info.clockTime}`} mono />
                  <InfoRow label="Channels"   value={String(info.channels)} />
                  <InfoRow label="Interval"   value={`${info.samplingInterval} s`} />
                  <InfoRow label="Datapoints" value={String(info.totalDatapoints)} />
                  <InfoRow label="Status"     value={info.statusBytes} mono />
                </div>
              </section>
            )}

            {/* cycles list */}
            {cycles !== null && (
              <section className="space-y-2">
                <SectionLabel>Stored cycles ({cycles.length})</SectionLabel>
                {cycles.length === 0 ? (
                  <p className="text-[13px] text-tq-fg-3">No cycles found on device.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-tq-bg-soft hover:bg-tq-bg-soft">
                        {['#', 'Start', 'Meta', '', ''].map((h, i) => (
                          <TableHead key={i} className="text-[11px]">{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cycles.map((r) => {
                        const uid          = cycleUid(deviceKey, r.startDatetime)
                        const isFetched    = cycleIds.has(uid)
                        const isFetching   = fetchingCycleIdx === r.index

                        return (
                          <TableRow key={r.index}>
                            <TableCell className="font-mono text-[11px] text-tq-fg-3 w-8">
                              {r.index}
                            </TableCell>
                            <TableCell className="font-mono text-[12px]">
                              {r.startDatetime}
                            </TableCell>
                            <TableCell className="font-mono text-[11px] text-tq-fg-4">
                              {r.meta.map((b) => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}
                            </TableCell>
                            <TableCell>
                              {isFetching ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-tq-fg-3">
                                  <Loader2 size={11} className="animate-spin" />
                                  Fetching…
                                </span>
                              ) : isFetched ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-tq-success font-medium">
                                  <CheckCircle2 size={11} />
                                  Fetched
                                </span>
                              ) : null}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {isFetched && (
                                  <Button variant="ghost" size="sm" asChild>
                                    <Link to={`/cycle/${encodeURIComponent(uid)}`}>
                                      <ExternalLink size={12} />
                                      View
                                    </Link>
                                  </Button>
                                )}
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  disabled={isBusy}
                                  onClick={() => fetchCycle(r.index)}
                                >
                                  <Download size={12} />
                                  {isFetched ? 'Re-fetch' : 'Fetch'}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </section>
            )}
          </CardContent>
        </>
      )}
    </Card>
  )
}

// ── small presentational helpers ──────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-[11px] font-semibold uppercase tracking-widest text-tq-fg-4">{children}</h4>
  )
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <span className="text-tq-fg-3 mr-1.5">{label}</span>
      <span className={`text-tq-fg-1 ${mono ? 'font-mono text-[12px]' : 'font-semibold'}`}>{value}</span>
    </div>
  )
}
