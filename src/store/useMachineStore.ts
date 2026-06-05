import { create } from 'zustand'
import { machineRepository, nextMachineId } from '@/infrastructure/machineRepository'
import type { Machine } from '@/domain/machine'

interface MachineStore {
  machines: Machine[]
  createMachine(data: Omit<Machine, 'id'>): void
  updateMachine(id: string, patch: Partial<Omit<Machine, 'id'>>): void
  removeMachine(id: string): void
}

export const useMachineStore = create<MachineStore>((set, get) => ({
  machines: machineRepository.getAll(),

  createMachine(data) {
    const machine: Machine = { ...data, id: nextMachineId(get().machines) }
    machineRepository.create(machine)
    set((s) => ({ machines: [...s.machines, machine] }))
  },

  updateMachine(id, patch) {
    machineRepository.update(id, patch)
    set((s) => ({
      machines: s.machines.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }))
  },

  removeMachine(id) {
    machineRepository.remove(id)
    set((s) => ({ machines: s.machines.filter((m) => m.id !== id) }))
  },
}))
