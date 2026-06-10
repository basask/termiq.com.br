import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, X } from 'lucide-react'
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Machine, MachineStatus, Section } from '@/domain/machine'

// ── form primitives ──────────────────────────────────────────────────────────

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

function errCls(msg?: string) {
  return msg ? 'border-tq-danger focus:border-tq-danger focus:ring-tq-danger/20' : ''
}

// ── section draft type ───────────────────────────────────────────────────────

interface SectionDraft {
  draftId: string
  name: string
  distance: string
}

function newDraft(): SectionDraft {
  return {
    draftId: `d-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
    name: '',
    distance: '',
  }
}

function sectionToSection(d: SectionDraft, index: number, machineId: string): Section {
  return {
    id: `sec-${machineId}-${index + 1}`,
    name: d.name.trim(),
    distance: Number(d.distance),
  }
}

function sectionToDraft(s: Section): SectionDraft {
  return { draftId: s.id, name: s.name, distance: String(s.distance) }
}

// ── machine form values ──────────────────────────────────────────────────────

interface MachineFormValues {
  name: string
  status: MachineStatus
  sections: SectionDraft[]
}

function blankForm(): MachineFormValues {
  return { name: '', status: 'active', sections: [] }
}

function machineToForm(m: Machine): MachineFormValues {
  return {
    name: m.name,
    status: m.status,
    sections: m.sections.map(sectionToDraft),
  }
}

// ── error shapes ─────────────────────────────────────────────────────────────

interface SectionError { name?: string; distance?: string }
interface FormErrors {
  name?: string
  sections?: Record<string, SectionError>
}

// ── MachineFormDialog ─────────────────────────────────────────────────────────

interface MachineFormDialogProps {
  mode: 'create' | 'edit'
  machine?: Machine
  onClose: () => void
  onSubmit: (name: string, status: MachineStatus, sections: Section[]) => void
}

export function MachineFormDialog({ mode, machine, onClose, onSubmit }: MachineFormDialogProps) {
  const { t } = useTranslation()
  const [form, setForm] = useState<MachineFormValues>(blankForm)
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    setForm(mode === 'edit' && machine ? machineToForm(machine) : blankForm())
    setErrors({})
  }, [mode, machine])

  // ── section helpers ──

  function addSection() {
    setForm((prev) => ({ ...prev, sections: [...prev.sections, newDraft()] }))
  }

  function removeSection(draftId: string) {
    setForm((prev) => ({ ...prev, sections: prev.sections.filter((s) => s.draftId !== draftId) }))
    setErrors((prev) => {
      const next = { ...prev.sections }
      delete next[draftId]
      return { ...prev, sections: next }
    })
  }

  function updateSection(draftId: string, field: 'name' | 'distance', value: string) {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.draftId === draftId ? { ...s, [field]: value } : s)),
    }))
    setErrors((prev) => ({
      ...prev,
      sections: { ...prev.sections, [draftId]: { ...prev.sections?.[draftId], [field]: undefined } },
    }))
  }

  // ── validation ──

  function validate(): boolean {
    const next: FormErrors = {}
    if (!form.name.trim()) next.name = t('common.required')

    const sectionErrors: Record<string, SectionError> = {}
    form.sections.forEach((s) => {
      const se: SectionError = {}
      if (!s.name.trim()) se.name = t('common.required')
      if (!s.distance || Number(s.distance) <= 0) se.distance = '> 0'
      if (Object.keys(se).length) sectionErrors[s.draftId] = se
    })
    if (Object.keys(sectionErrors).length) next.sections = sectionErrors

    setErrors(next)
    return !next.name && !next.sections
  }

  function handleSubmit() {
    if (!validate()) return
    const tempId = machine?.id ?? 'new'
    const sections = form.sections.map((d, i) => sectionToSection(d, i, tempId))
    onSubmit(form.name.trim(), form.status, sections)
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={mode === 'create' ? t('machines.formCreate') : t('machines.formEdit')}
      className="max-w-xl"
    >
      <DialogBody className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto">
        {/* Name + Status */}
        <div className="grid grid-cols-[1fr_auto] gap-4 items-start">
          <div>
            <Label htmlFor="m-name">{t('machines.labelName')}</Label>
            <input
              id="m-name"
              type="text"
              value={form.name}
              onChange={(e) => {
                setForm((p) => ({ ...p, name: e.target.value }))
                setErrors((p) => ({ ...p, name: undefined }))
              }}
              placeholder="Powder Coating Oven"
              className={cn(fieldCls, errCls(errors.name))}
            />
            {errors.name && <p className="mt-1 text-[11px] text-tq-danger">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="m-status">{t('machines.labelStatus')}</Label>
            <select
              id="m-status"
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as MachineStatus }))}
              className={fieldCls}
            >
              <option value="active">{t('machines.statusActive')}</option>
              <option value="maintenance">{t('machines.statusMaintenance')}</option>
              <option value="inactive">{t('machines.statusInactive')}</option>
            </select>
          </div>
        </div>

        {/* Sections */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="m-sections">
              {t('machines.labelSections')}{form.sections.length > 0 && ` (${form.sections.length})`}
            </Label>
            {form.sections.length > 0 && (
              <span className="font-mono text-[11px] text-tq-fg-3">
                {form.sections
                  .reduce((s, d) => s + (Number(d.distance) || 0), 0)
                  .toFixed(1)}{' '}
                m total
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2" id="m-sections">
            {form.sections.map((section, idx) => {
              const se = errors.sections?.[section.draftId]
              return (
                <div key={section.draftId} className="flex items-start gap-2">
                  <span className="font-mono text-[11px] text-tq-fg-4 w-5 pt-2.5 shrink-0 text-right">
                    {idx + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={section.name}
                      onChange={(e) => updateSection(section.draftId, 'name', e.target.value)}
                      placeholder={t('machines.sectionPlaceholderName')}
                      className={cn(fieldCls, errCls(se?.name))}
                    />
                    {se?.name && <p className="mt-0.5 text-[11px] text-tq-danger">{se.name}</p>}
                  </div>
                  <div className="w-28 shrink-0">
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        step="any"
                        value={section.distance}
                        onChange={(e) => updateSection(section.draftId, 'distance', e.target.value)}
                        placeholder="0.0"
                        className={cn(fieldCls, 'font-mono pr-7', errCls(se?.distance))}
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-tq-fg-4 pointer-events-none">
                        m
                      </span>
                    </div>
                    {se?.distance && (
                      <p className="mt-0.5 text-[11px] text-tq-danger">{se.distance}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeSection(section.draftId)}
                    className="mt-2 flex items-center justify-center w-7 h-7 rounded-md text-tq-fg-4 hover:text-tq-danger hover:bg-red-50 transition-colors shrink-0"
                    aria-label={t('machines.ariaRemoveSection')}
                  >
                    <X size={14} />
                  </button>
                </div>
              )
            })}
          </div>

          <button
            onClick={addSection}
            className={cn(
              'mt-2 flex items-center gap-1.5 text-[12px] font-medium text-tq-green-700',
              'hover:text-tq-green-800 transition-colors',
            )}
          >
            <Plus size={13} />
            {t('machines.addSection')}
          </button>
        </div>
      </DialogBody>

      <DialogFooter>
        <Button variant="ghost" size="sm" onClick={onClose}>{t('common.cancel')}</Button>
        <Button variant="primary" size="sm" onClick={handleSubmit}>
          {mode === 'create' ? t('machines.formCreate') : t('machines.saveChanges')}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

// ── DeleteMachineDialog ───────────────────────────────────────────────────────

interface DeleteMachineDialogProps {
  machine: Machine
  onClose: () => void
  onConfirm: () => void
}

export function DeleteMachineDialog({ machine, onClose, onConfirm }: DeleteMachineDialogProps) {
  const { t } = useTranslation()
  return (
    <Dialog open onClose={onClose} title={t('machines.removeMachine')}>
      <DialogBody>
        <p className="text-[13px] text-tq-fg-2 leading-relaxed">
          {t('common.remove')}{' '}
          <span className="font-semibold text-tq-fg-1">{machine.name}</span>{' '}
          <span className="font-mono text-[11px] text-tq-fg-3">({machine.id})</span>
          {t('machines.removeMachineSuffix')}
        </p>
      </DialogBody>
      <DialogFooter>
        <Button variant="ghost" size="sm" onClick={onClose}>{t('common.cancel')}</Button>
        <Button variant="danger" size="sm" onClick={onConfirm}>{t('common.remove')}</Button>
      </DialogFooter>
    </Dialog>
  )
}
