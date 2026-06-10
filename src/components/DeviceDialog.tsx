import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Device } from '@/domain/device'

const fieldCls = cn(
  'w-full border border-tq-border rounded-md px-3 py-2',
  'text-[13px] text-tq-fg-1 bg-white',
  'focus:outline-none focus:ring-2 focus:ring-tq-green-500/30 focus:border-tq-green-500',
  'transition-colors',
)

// ── EditDeviceDialog ──────────────────────────────────────────────────────────

interface EditDeviceDialogProps {
  device: Device
  onClose: () => void
  onSubmit: (name: string) => void
}

export function EditDeviceDialog({ device, onClose, onSubmit }: EditDeviceDialogProps) {
  const { t } = useTranslation()
  const [name, setName] = useState(device.name)
  const [error, setError] = useState('')

  useEffect(() => {
    setName(device.name)
    setError('')
  }, [device])

  function handleSubmit() {
    if (!name.trim()) { setError(t('devices.nameRequired')); return }
    onSubmit(name.trim())
  }

  return (
    <Dialog open onClose={onClose} title={t('devices.renameDevice')}>
      <DialogBody>
        <label
          htmlFor="device-name"
          className="block text-[11px] font-semibold uppercase tracking-widest text-tq-fg-3 mb-1.5"
        >
          {t('devices.deviceName')}
        </label>
        <input
          id="device-name"
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setError('') }}
          placeholder="Data Logger – Sector A"
          className={cn(fieldCls, error && 'border-tq-danger focus:border-tq-danger')}
          autoFocus
        />
        {error && <p className="mt-1 text-[11px] text-tq-danger">{error}</p>}
      </DialogBody>
      <DialogFooter>
        <Button variant="ghost" size="sm" onClick={onClose}>{t('common.cancel')}</Button>
        <Button variant="primary" size="sm" onClick={handleSubmit}>{t('common.save')}</Button>
      </DialogFooter>
    </Dialog>
  )
}

// ── DeleteConfirmDialog ───────────────────────────────────────────────────────

interface DeleteConfirmDialogProps {
  device: Device
  onClose: () => void
  onConfirm: () => void
}

export function DeleteConfirmDialog({ device, onClose, onConfirm }: DeleteConfirmDialogProps) {
  const { t } = useTranslation()
  return (
    <Dialog open onClose={onClose} title={t('devices.removeDevice')}>
      <DialogBody>
        <p className="text-[13px] text-tq-fg-2 leading-relaxed">
          {t('common.remove')}{' '}
          <span className="font-semibold text-tq-fg-1">{device.name}</span>{' '}
          <span className="font-mono text-[11px] text-tq-fg-3">({device.id})</span>
          {t('devices.removeDeviceSuffix')}
        </p>
      </DialogBody>
      <DialogFooter>
        <Button variant="ghost" size="sm" onClick={onClose}>{t('common.cancel')}</Button>
        <Button variant="danger" size="sm" onClick={onConfirm}>{t('common.remove')}</Button>
      </DialogFooter>
    </Dialog>
  )
}
