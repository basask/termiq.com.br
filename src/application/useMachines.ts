import { useMachineStore } from '@/store/useMachineStore'
import type { Machine } from '@/domain/machine'

interface MachinesViewModel {
  machines: Machine[]
  totalCount: number
  activeCount: number
  maintenanceCount: number
  inactiveCount: number
  createMachine: (data: Omit<Machine, 'id'>) => void
  updateMachine: (id: string, patch: Partial<Omit<Machine, 'id'>>) => void
  removeMachine: (id: string) => void
}

export function useMachines(): MachinesViewModel {
  const { machines, createMachine, updateMachine, removeMachine } = useMachineStore()

  return {
    machines,
    totalCount: machines.length,
    activeCount: machines.filter((m) => m.status === 'active').length,
    maintenanceCount: machines.filter((m) => m.status === 'maintenance').length,
    inactiveCount: machines.filter((m) => m.status === 'inactive').length,
    createMachine,
    updateMachine,
    removeMachine,
  }
}
