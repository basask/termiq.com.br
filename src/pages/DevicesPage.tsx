import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { Gauge, Usb, AlertTriangle, RefreshCw, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EditDeviceDialog, DeleteConfirmDialog } from '@/components/DeviceDialog'
import { ThermographPanel } from '@/components/ThermographPanel'
import { useDevices } from '@/application/useDevices'
import { useUsbDevices } from '@/application/useUsbDevices'
import { useHidDevices } from '@/application/useHidDevices'
import { ThermographDriver } from '@/infrastructure/thermographDriver'
import { ThermographHidDriver } from '@/infrastructure/thermographHidDriver'
import { USB_API_MODE } from '@/lib/usbApiFlag'
import { deviceStatusBadgeVariant, deviceStatusDotColor } from '@/domain/device'
import type { UsbDeviceInfo, UsbSupportStatus } from '@/application/useUsbDevices'
import type { IThermographDriver } from '@/infrastructure/thermographDriver'
import type { Device } from '@/domain/device'

// ── timestamp helper ──────────────────────────────────────────────────────────

function formatRelative(iso: string | null, t: TFunction): string {
  if (!iso) return '—'
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (sec < 5)   return t('devices.justNow')
  if (sec < 60)  return t('devices.secondsAgo', { count: sec })
  const min = Math.floor(sec / 60)
  if (min < 60)  return t('devices.minutesAgo', { count: min })
  const hrs = Math.floor(min / 60)
  if (hrs < 24)  return t('devices.hoursAgo', { count: hrs })
  return t('devices.daysAgo', { count: Math.floor(hrs / 24) })
}

// ── unified device type ───────────────────────────────────────────────────────

interface ConnectedDevice {
  info: UsbDeviceInfo
  createDriver: () => IThermographDriver
}

// ── dialog state ──────────────────────────────────────────────────────────────

type DialogState =
  | { type: 'edit'; device: Device }
  | { type: 'delete'; device: Device }
  | null

// ── devices section ───────────────────────────────────────────────────────────

interface DevicesSectionProps {
  apiMode: 'USB' | 'HID'
  support: UsbSupportStatus
  devices: ConnectedDevice[]
  scanning: boolean
  onScan: () => void
  vendorId: number
  productId: number
  onConnected: (serialNumber: string) => void
}

function DevicesSection({
  apiMode, support, devices, scanning, onScan, vendorId, productId, onConnected,
}: DevicesSectionProps) {
  const { t } = useTranslation()
  const vendorHex = `0x${vendorId.toString(16).toUpperCase().padStart(4, '0')}`
  const productHex = `0x${productId.toString(16).toUpperCase().padStart(4, '0')}`

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Usb size={15} className="text-tq-green-600" />
          <span className="text-[14px] font-semibold text-tq-fg-1">
            {t('devices.connectedDevices', { api: apiMode === 'HID' ? 'HID' : 'USB' })}
          </span>
          <span className="font-mono text-[11px] text-tq-fg-4">
            VID {vendorHex} · PID {productHex}
          </span>
        </div>
        {support === 'supported' && (
          <Button variant="secondary" size="sm" onClick={onScan} disabled={scanning}>
            <RefreshCw size={13} className={scanning ? 'animate-spin' : ''} />
            {scanning ? t('devices.scanning') : t('devices.scanForDevices')}
          </Button>
        )}
      </div>

      {support === 'checking' && (
        <p className="text-[13px] text-tq-fg-3 pl-1">{t('devices.checkingUsb')}</p>
      )}

      {support === 'unsupported' && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
          <div className="space-y-1">
            <p className="font-semibold">
              {t('devices.notAvailable', { api: apiMode === 'HID' ? 'WebHID' : 'WebUSB' })}
            </p>
            <p className="text-amber-700">{t('devices.notAvailableDesc')}</p>
            <ol className="mt-2 list-decimal list-inside space-y-1 text-amber-700">
              <li>
                {t('devices.step1Prefix')}{' '}
                <span className="font-mono text-[11px]">
                  chrome://flags/#enable-experimental-web-platform-features
                </span>
              </li>
              <li>
                {t('devices.step2Prefix')} <strong>{t('devices.step2Bold')}</strong>
              </li>
              <li>{t('devices.step3')}</li>
            </ol>
          </div>
        </div>
      )}

      {support === 'supported' && devices.length === 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-tq-border bg-tq-bg-soft px-4 py-3 text-[13px] text-tq-fg-3">
          <Usb size={15} className="shrink-0 text-tq-fg-4" />
          {t('devices.noDevicesFoundPrefix')}{' '}
          <strong className="mx-1">{t('devices.scanForDevices')}</strong>{' '}
          {t('devices.noDevicesFoundSuffix')}
        </div>
      )}

      {support === 'supported' && devices.map(({ info, createDriver }) => {
        const sn = info.serialNumber ?? `${info.vendorId}-${info.productId}`
        return (
          <ThermographPanel
            key={sn}
            device={info}
            createDriver={createDriver}
            onConnected={() => onConnected(sn)}
          />
        )
      })}
    </div>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function DevicePage() {
  const { t } = useTranslation()
  const { devices, totalCount, registerDevice, recordConnection, updateDevice, removeDevice } = useDevices()
  const usbHook = useUsbDevices()
  const hidHook = useHidDevices()
  const [dialog, setDialog] = useState<DialogState>(null)

  // Normalize both hooks into a unified ConnectedDevice[] based on the active API mode
  const activeDevices = useMemo<ConnectedDevice[]>(() => {
    if (USB_API_MODE === 'HID') {
      return hidHook.devices.map(({ info, hidDevice }) => ({
        info,
        createDriver: () => new ThermographHidDriver(hidDevice),
      }))
    }
    return usbHook.devices.map(({ info, usbDevice }) => ({
      info,
      createDriver: () => new ThermographDriver(usbDevice),
    }))
  }, [hidHook.devices, usbHook.devices])

  const activeSupport  = USB_API_MODE === 'HID' ? hidHook.support   : usbHook.support
  const activeScan     = USB_API_MODE === 'HID' ? hidHook.scan      : usbHook.scan
  const activeScanning = USB_API_MODE === 'HID' ? hidHook.scanning  : usbHook.scanning

  const prevSerialsRef = useRef<Set<string>>(new Set())

  const makeDeviceId = useCallback(
    (info: UsbDeviceInfo) => info.serialNumber ?? `${info.vendorId}-${info.productId}`,
    [],
  )

  useEffect(() => {
    if (activeSupport !== 'supported') return

    const now = new Date().toISOString()
    const currentSerials = new Set<string>()

    for (const { info } of activeDevices) {
      const id = makeDeviceId(info)
      currentSerials.add(id)
      registerDevice({
        id,
        name: info.productName ?? 'Thermograph Device',
        status: 'Healthy',
        lastSeen: now,
        lastConnection: null,
      })
    }

    for (const sn of prevSerialsRef.current) {
      if (!currentSerials.has(sn)) {
        updateDevice(sn, { status: 'Offline' })
      }
    }

    prevSerialsRef.current = currentSerials
  }, [activeDevices, activeSupport, registerDevice, updateDevice, makeDeviceId])

  function handleDelete() {
    if (dialog?.type === 'delete') removeDevice(dialog.device.id)
    setDialog(null)
  }

  function handleRename(name: string) {
    if (dialog?.type === 'edit') updateDevice(dialog.device.id, { name })
    setDialog(null)
  }

  const tableHeaders = [
    t('devices.colDevice'),
    t('devices.colSerialNumber'),
    t('devices.colStatus'),
    t('devices.colLastSeen'),
    t('devices.colLastConnection'),
    '',
  ]

  return (
    <div className="p-4 md:p-7 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-tq-fg-1">{t('devices.title')}</h1>
        <p className="font-mono text-[12px] text-tq-fg-3 mt-1">
          {t('devices.subtitle', { count: totalCount })}
          {' · '}
          <span className="text-tq-fg-4">{t('devices.modeLabel', { mode: USB_API_MODE })}</span>
        </p>
      </div>

      {/* Connected devices */}
      <DevicesSection
        apiMode={USB_API_MODE}
        support={activeSupport}
        devices={activeDevices}
        scanning={activeScanning}
        onScan={activeScan}
        vendorId={usbHook.VENDOR_ID}
        productId={usbHook.PRODUCT_ID}
        onConnected={(sn) => recordConnection(sn)}
      />

      {/* Device registry table */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle>{t('devices.registry')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-tq-bg-soft hover:bg-tq-bg-soft">
                {tableHeaders.map((h, i) => (
                  <TableHead key={i}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-[13px] text-tq-fg-3">
                    {t('devices.noDevicesInRegistry')}
                  </TableCell>
                </TableRow>
              ) : (
                devices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-semibold text-tq-fg-1">{device.name}</TableCell>
                    <TableCell className="font-mono text-[11px] text-tq-fg-3">{device.id}</TableCell>
                    <TableCell>
                      <Badge variant={deviceStatusBadgeVariant[device.status]}>
                        <span className={`w-1.5 h-1.5 rounded-full ${deviceStatusDotColor[device.status]}`} />
                        {device.status}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="font-mono text-[12px] text-tq-fg-2"
                      title={device.lastSeen ?? undefined}
                    >
                      {formatRelative(device.lastSeen, t)}
                    </TableCell>
                    <TableCell
                      className="font-mono text-[12px] text-tq-fg-2"
                      title={device.lastConnection ?? undefined}
                    >
                      {formatRelative(device.lastConnection, t)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={t('devices.ariaRename')}
                          onClick={() => setDialog({ type: 'edit', device })}
                        >
                          <Pencil size={13} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={t('devices.ariaRemove')}
                          className="text-tq-danger hover:text-tq-danger hover:bg-red-50"
                          onClick={() => setDialog({ type: 'delete', device })}
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Placeholder notice */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-tq-border bg-tq-bg-soft text-[13px] text-tq-fg-3">
        <Gauge size={16} className="text-tq-fg-4 shrink-0" />
        {t('devices.telemetryComingSoon')}
      </div>

      {/* Dialogs */}
      {dialog?.type === 'edit' && (
        <EditDeviceDialog
          device={dialog.device}
          onClose={() => setDialog(null)}
          onSubmit={handleRename}
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
