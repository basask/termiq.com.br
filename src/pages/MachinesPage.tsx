import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Cog, CheckCircle2, Wrench, PowerOff, Plus, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MachineFormDialog, DeleteMachineDialog } from '@/components/MachineDialog'
import { useMachines } from '@/application/useMachines'
import { useCycles } from '@/application/useCycles'
import { machineStatusBadgeVariant, machineStatusLabel } from '@/domain/machine'
import { cycleStatusBadgeVariant } from '@/domain/cycle'
import type { Machine, Section, MachineStatus } from '@/domain/machine'
import type { Cycle } from '@/domain/cycle'

// ── stacked sections bar ──────────────────────────────────────────────────────

const SEGMENT_COLORS = [
  'bg-tq-green-200',
  'bg-tq-green-400',
  'bg-tq-green-600',
  'bg-tq-green-800',
]

function StackedSectionsBar({ sections }: { sections: Section[] }) {
  const totalDistance = sections.reduce((s, sec) => s + sec.distance, 0)
  if (sections.length === 0) return null

  return (
    <div>
      <div className="flex h-3 rounded-md overflow-hidden gap-px bg-tq-bg-muted">
        {sections.map((section, idx) => {
          const pct = totalDistance > 0 ? (section.distance / totalDistance) * 100 : 0
          return (
            <div
              key={section.id}
              style={{ width: `${pct}%` }}
              className={`h-full ${SEGMENT_COLORS[idx % SEGMENT_COLORS.length]}`}
              title={`${section.name}: ${section.distance} m`}
            />
          )
        })}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
        {sections.map((section, idx) => (
          <span key={section.id} className="inline-flex items-center gap-1">
            <span className={`w-2 h-2 rounded-sm shrink-0 ${SEGMENT_COLORS[idx % SEGMENT_COLORS.length]}`} />
            <span className="text-[11px] text-tq-fg-2">{section.name}</span>
            <span className="font-mono text-[10px] text-tq-fg-4">{section.distance} m</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ── machine card ──────────────────────────────────────────────────────────────

interface MachineCardProps {
  machine: Machine
  cycles: Cycle[]
  onEdit: () => void
  onDelete: () => void
}

function MachineCard({ machine, cycles, onEdit, onDelete }: MachineCardProps) {
  const { t } = useTranslation()
  const totalDistance = machine.sections.reduce((s, sec) => s + sec.distance, 0)
  return (
    <Card>
      <CardHeader className="p-4 pb-3 border-b border-tq-divider">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-[14px] text-tq-fg-1 truncate">{machine.name}</span>
              <span className="font-mono text-[10px] text-tq-fg-4 shrink-0">{machine.id}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant={machineStatusBadgeVariant[machine.status]}>
              {machineStatusLabel[machine.status]}
            </Badge>
            <Button variant="ghost" size="icon" aria-label={t('machines.ariaEdit')} onClick={onEdit}>
              <Pencil size={13} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('machines.ariaRemove')}
              className="text-tq-danger hover:text-tq-danger hover:bg-red-50"
              onClick={onDelete}
            >
              <Trash2 size={13} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-tq-divider">
          {/* Sections column */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-tq-fg-3">
                {t('machines.sections')}
              </span>
              {machine.sections.length > 0 && (
                <span className="font-mono text-[11px] text-tq-fg-3">
                  {t('machines.sectionsTotal', { total: totalDistance.toFixed(1) })}
                </span>
              )}
            </div>

            {machine.sections.length === 0 ? (
              <p className="text-[12px] text-tq-fg-4 italic">{t('machines.noSections')}</p>
            ) : (
              <StackedSectionsBar sections={machine.sections} />
            )}
          </div>

          {/* Cycles column */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-tq-fg-3">
                {t('machines.recentCycles')}
              </span>
              <span className="font-mono text-[11px] text-tq-fg-3">{cycles.length}</span>
            </div>

            {cycles.length === 0 ? (
              <p className="text-[12px] text-tq-fg-4 italic">{t('machines.noCycles')}</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {cycles.slice(0, 5).map((cycle) => (
                  <div
                    key={cycle.id}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-tq-bg-soft border border-tq-divider"
                  >
                    <span className="font-mono text-[10px] text-tq-fg-4">{cycle.id}</span>
                    <Badge variant={cycleStatusBadgeVariant[cycle.status] ?? 'default'}>
                      {cycle.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── dialog state ──────────────────────────────────────────────────────────────

type DialogState =
  | { type: 'create' }
  | { type: 'edit'; machine: Machine }
  | { type: 'delete'; machine: Machine }
  | null

// ── page ──────────────────────────────────────────────────────────────────────

export default function MachinesPage() {
  const { t } = useTranslation()
  const { machines, totalCount, activeCount, maintenanceCount, inactiveCount,
          createMachine, updateMachine, removeMachine } = useMachines()
  const { cycles } = useCycles()
  const [dialog, setDialog] = useState<DialogState>(null)

  function handleFormSubmit(name: string, status: MachineStatus, sections: Machine['sections']) {
    if (dialog?.type === 'create') {
      createMachine({ name, status, sections })
    } else if (dialog?.type === 'edit') {
      updateMachine(dialog.machine.id, { name, status, sections })
    }
    setDialog(null)
  }

  function handleDelete() {
    if (dialog?.type === 'delete') removeMachine(dialog.machine.id)
    setDialog(null)
  }

  const kpis = [
    { labelKey: 'machines.kpiTotal',       value: String(totalCount),       icon: Cog,          color: 'text-tq-green-600' },
    { labelKey: 'machines.kpiActive',      value: String(activeCount),      icon: CheckCircle2, color: 'text-tq-success'   },
    { labelKey: 'machines.kpiMaintenance', value: String(maintenanceCount), icon: Wrench,       color: 'text-tq-warning'   },
    { labelKey: 'machines.kpiInactive',    value: String(inactiveCount),    icon: PowerOff,     color: 'text-tq-fg-4'      },
  ]

  return (
    <div className="p-4 md:p-7 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-tq-fg-1">{t('machines.title')}</h1>
          <p className="font-mono text-[12px] text-tq-fg-3 mt-1">{t('machines.subtitle')}</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setDialog({ type: 'create' })}>
          <Plus size={14} />
          {t('machines.addMachine')}
        </Button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ labelKey, value, icon: Icon, color }) => (
          <Card key={labelKey}>
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`mt-0.5 ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <div className="font-mono text-[22px] font-semibold text-tq-fg-1 leading-none">
                  {value}
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-tq-fg-3 mt-1.5">
                  {t(labelKey)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Machine cards */}
      <div className="flex flex-col gap-4">
        {machines.map((machine) => (
          <MachineCard
            key={machine.id}
            machine={machine}
            cycles={cycles.filter((c) => c.machineId === machine.id)}
            onEdit={() => setDialog({ type: 'edit', machine })}
            onDelete={() => setDialog({ type: 'delete', machine })}
          />
        ))}

        {machines.length === 0 && (
          <div className="py-16 text-center text-[13px] text-tq-fg-3">
            {t('machines.noMachinesPrefix')}{' '}
            <button
              className="text-tq-green-700 font-medium hover:underline"
              onClick={() => setDialog({ type: 'create' })}
            >
              {t('machines.noMachinesBtn')}
            </button>
          </div>
        )}
      </div>

      {/* Dialogs */}
      {(dialog?.type === 'create' || dialog?.type === 'edit') && (
        <MachineFormDialog
          mode={dialog.type}
          machine={dialog.type === 'edit' ? dialog.machine : undefined}
          onClose={() => setDialog(null)}
          onSubmit={handleFormSubmit}
        />
      )}

      {dialog?.type === 'delete' && (
        <DeleteMachineDialog
          machine={dialog.machine}
          onClose={() => setDialog(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}
