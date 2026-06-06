import { Loader2, Plug, Unplug, Info, List, Download, FileDown, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useThermograph } from '@/application/useThermograph'
import type { UsbDeviceInfo } from '@/application/useUsbDevices'
import type { FetchedRecord } from '@/application/useThermograph'
import type { IThermographDriver } from '@/infrastructure/thermographDriver'

// ── CSV export ────────────────────────────────────────────────────────────────

function exportCsv(record: FetchedRecord): void {
  const [datePart, timePart] = record.entry.startDatetime.split(' ')
  const [y, mo, d] = datePart.split('-').map(Number)
  const [h, mi, s] = timePart.split(':').map(Number)
  const startMs = new Date(y, mo - 1, d, h, mi, s).getTime()

  const chHeaders = Array.from({ length: record.channels }, (_, i) => `ch${i + 1}_degC`)
  const rows = record.samples.map((sample, i) => {
    const ts = new Date(startMs + i * record.interval * 1000)
    return [
      ts.toISOString().slice(0, 10),
      ts.toTimeString().slice(0, 8),
      ...sample.map((t) => t.toFixed(1)),
    ]
  })

  const csv = [['date', 'time', ...chHeaders], ...rows].map((r) => r.join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = `thermograph_r${record.entry.index}_${datePart}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

// ── component ─────────────────────────────────────────────────────────────────

interface Props {
  device: UsbDeviceInfo
  createDriver: () => IThermographDriver
  onConnected?: () => void
}

export function ThermographPanel({ device, createDriver, onConnected }: Props) {
  const {
    status, busyOp, error,
    info, records, fetchedRecord,
    connect, disconnect, loadInfo, loadRecords, downloadRecord,
  } = useThermograph(createDriver, onConnected)

  const isConnected = status === 'connected'
  const isConnecting = status === 'connecting'
  const isBusy = busyOp !== null

  return (
    <Card>
      {/* ── header ── */}
      <CardHeader className="p-4 flex-row items-start justify-between gap-4">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isConnected ? 'bg-tq-success' :
                isConnecting ? 'bg-tq-warning animate-pulse' :
                status === 'error' ? 'bg-tq-danger' :
                'bg-tq-fg-4'
              }`}
            />
            <span className="text-[14px] font-semibold text-tq-fg-1 truncate">
              {device.productName ?? 'Thermograph device'}
            </span>
          </div>
          <p className="font-mono text-[11px] text-tq-fg-4 pl-4">
            {device.manufacturerName && <>{device.manufacturerName} · </>}
            {device.serialNumber && <>S/N {device.serialNumber} · </>}
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

      {/* ── body (only when not idle/disconnected) ── */}
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
                <Button variant="secondary" size="sm" onClick={loadInfo} disabled={isBusy}>
                  <Info size={13} />
                  Read info
                </Button>
                <Button variant="secondary" size="sm" onClick={loadRecords} disabled={isBusy}>
                  <List size={13} />
                  List records
                </Button>
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
                  <InfoRow label="Model"   value={`${info.modelHint || '—'} · v${info.version}`} />
                  <InfoRow label="Clock"   value={`${info.clockDate} ${info.clockTime}`} mono />
                  <InfoRow label="Channels"   value={String(info.channels)} />
                  <InfoRow label="Interval"   value={`${info.samplingInterval} s`} />
                  <InfoRow label="Datapoints" value={String(info.totalDatapoints)} />
                  <InfoRow label="Status"     value={info.statusBytes} mono />
                </div>
              </section>
            )}

            {/* records list */}
            {records !== null && (
              <section className="space-y-2">
                <SectionLabel>Stored records ({records.length})</SectionLabel>
                {records.length === 0 ? (
                  <p className="text-[13px] text-tq-fg-3">No records found on device.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-tq-bg-soft hover:bg-tq-bg-soft">
                        {['#', 'Start datetime', 'Meta', ''].map((h) => (
                          <TableHead key={h} className="text-[11px]">{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((r) => (
                        <TableRow key={r.index}>
                          <TableCell className="font-mono text-[11px] text-tq-fg-3 w-8">{r.index}</TableCell>
                          <TableCell className="font-mono text-[12px]">{r.startDatetime}</TableCell>
                          <TableCell className="font-mono text-[11px] text-tq-fg-4">
                            {r.meta.map((b) => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={isBusy}
                              onClick={() => downloadRecord(r.index)}
                            >
                              <Download size={12} />
                              Fetch
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </section>
            )}

            {/* fetched record data */}
            {fetchedRecord && (
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <SectionLabel>
                    Record {fetchedRecord.entry.index} · {fetchedRecord.samples.length} samples ·{' '}
                    {fetchedRecord.channels} ch · {fetchedRecord.interval} s/sample
                  </SectionLabel>
                  <Button variant="secondary" size="sm" onClick={() => exportCsv(fetchedRecord)}>
                    <FileDown size={12} />
                    Export CSV
                  </Button>
                </div>

                <div className="overflow-x-auto rounded-md border border-tq-border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-tq-bg-soft hover:bg-tq-bg-soft">
                        <TableHead className="text-[11px]">Time</TableHead>
                        {Array.from({ length: fetchedRecord.channels }, (_, i) => (
                          <TableHead key={i} className="text-[11px]">Ch{i + 1} (°C)</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fetchedRecord.samples.slice(0, 20).map((sample, i) => {
                        const [datePart, timePart] = fetchedRecord.entry.startDatetime.split(' ')
                        const [y, mo, d] = datePart.split('-').map(Number)
                        const [h, mi, s] = timePart.split(':').map(Number)
                        const ts = new Date(
                          new Date(y, mo - 1, d, h, mi, s).getTime() + i * fetchedRecord.interval * 1000,
                        )
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
                </div>

                {fetchedRecord.samples.length > 20 && (
                  <p className="text-[12px] text-tq-fg-4 pl-1">
                    Showing first 20 of {fetchedRecord.samples.length} samples. Export CSV to get all data.
                  </p>
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
