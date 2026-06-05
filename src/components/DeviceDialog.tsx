import { useState, useEffect } from 'react'
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Device, DeviceStatus } from '@/domain/device'

// ── shared form primitives ──────────────────────────────────────────────────

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[11px] font-semibold uppercase tracking-widest text-tq-fg-3 mb-1.5"
    >
      {children}
    </label>
  )
}

const fieldCls = cn(
  'w-full border border-tq-border rounded-md px-3 py-2',
  'text-[13px] text-tq-fg-1 bg-white',
  'focus:outline-none focus:ring-2 focus:ring-tq-green-500/30 focus:border-tq-green-500',
  'transition-colors',
)

// ── types ───────────────────────────────────────────────────────────────────

interface FormValues {
  name: string
  status: DeviceStatus
  batteryPct: number
  channels: string
}

function blankForm(): FormValues {
  return { name: '', status: 'Healthy', batteryPct: 100, channels: '4' }
}

function deviceToForm(device: Device): FormValues {
  return {
    name: device.name,
    status: device.status,
    batteryPct: Math.round(device.battery * 100),
    channels: device.channels,
  }
}

// ── DeviceFormDialog ─────────────────────────────────────────────────────────

interface DeviceFormDialogProps {
  mode: 'create' | 'edit'
  device?: Device
  onClose: () => void
  onSubmit: (values: FormValues) => void
}

export function DeviceFormDialog({ mode, device, onClose, onSubmit }: DeviceFormDialogProps) {
  const [form, setForm] = useState<FormValues>(blankForm)
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({})

  useEffect(() => {
    setForm(mode === 'edit' && device ? deviceToForm(device) : blankForm())
    setErrors({})
  }, [mode, device])

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function validate(): boolean {
    const next: typeof errors = {}
    if (!form.name.trim()) next.name = 'Name is required'
    if (form.batteryPct < 0 || form.batteryPct > 100) next.batteryPct = 'Must be 0 – 100'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit() {
    if (validate()) onSubmit(form)
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={mode === 'create' ? 'Add device' : 'Edit device'}
    >
      <DialogBody className="flex flex-col gap-4">
        {/* Name */}
        <div>
          <Label htmlFor="device-name">Device name</Label>
          <input
            id="device-name"
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Data Logger - Sector XX"
            className={cn(fieldCls, errors.name && 'border-tq-danger focus:border-tq-danger')}
          />
          {errors.name && (
            <p className="mt-1 text-[11px] text-tq-danger">{errors.name}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Status */}
          <div>
            <Label htmlFor="device-status">Status</Label>
            <select
              id="device-status"
              value={form.status}
              onChange={(e) => set('status', e.target.value as DeviceStatus)}
              className={fieldCls}
            >
              <option value="Healthy">Healthy</option>
              <option value="Warning">Warning</option>
              <option value="Offline">Offline</option>
            </select>
          </div>

          {/* Channels */}
          <div>
            <Label htmlFor="device-channels">Channels</Label>
            <select
              id="device-channels"
              value={form.channels}
              onChange={(e) => set('channels', e.target.value)}
              className={fieldCls}
            >
              <option value="4">4</option>
              <option value="8">8</option>
              <option value="16">16</option>
            </select>
          </div>
        </div>

        {/* Battery */}
        <div>
          <Label htmlFor="device-battery">Battery (%)</Label>
          <input
            id="device-battery"
            type="number"
            min={0}
            max={100}
            value={form.batteryPct}
            onChange={(e) => set('batteryPct', Number(e.target.value))}
            className={cn(fieldCls, errors.batteryPct && 'border-tq-danger focus:border-tq-danger')}
          />
          {errors.batteryPct && (
            <p className="mt-1 text-[11px] text-tq-danger">{errors.batteryPct}</p>
          )}
        </div>
      </DialogBody>

      <DialogFooter>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={handleSubmit}>
          {mode === 'create' ? 'Add device' : 'Save changes'}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

// ── DeleteConfirmDialog ──────────────────────────────────────────────────────

interface DeleteConfirmDialogProps {
  device: Device
  onClose: () => void
  onConfirm: () => void
}

export function DeleteConfirmDialog({ device, onClose, onConfirm }: DeleteConfirmDialogProps) {
  return (
    <Dialog open onClose={onClose} title="Remove device">
      <DialogBody>
        <p className="text-[13px] text-tq-fg-2 leading-relaxed">
          Remove{' '}
          <span className="font-semibold text-tq-fg-1">{device.name}</span>{' '}
          <span className="font-mono text-[11px] text-tq-fg-3">({device.id})</span>?
          This action cannot be undone.
        </p>
      </DialogBody>
      <DialogFooter>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" size="sm" onClick={onConfirm}>
          Remove
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

// ── exported form-values type (for the page) ─────────────────────────────────

export type { FormValues as DeviceFormValues }
