import { create } from 'zustand'
import type { Cycle } from '@/domain/cycle'

interface CycleStore {
  cycles: Cycle[]
  /** Set of cycle IDs for O(1) duplicate checks — changes reference when cycles are added. */
  cycleIds: Set<string>
  addCycle(cycle: Cycle): void
  updateCycle(id: string, patch: Partial<Pick<Cycle, 'machineId' | 'productId'>>): void
}

export const useCycleStore = create<CycleStore>((set, get) => ({
  cycles: [],
  cycleIds: new Set(),

  addCycle(cycle) {
    if (get().cycleIds.has(cycle.id)) return
    set((s) => ({
      cycles: [cycle, ...s.cycles],
      cycleIds: new Set([...s.cycleIds, cycle.id]),
    }))
  },

  updateCycle(id, patch) {
    set((s) => ({
      cycles: s.cycles.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }))
  },
}))
