import { create } from 'zustand'
import { getCycles } from '@/infrastructure/cycleRepository'
import type { Cycle } from '@/domain/cycle'

interface CycleStore {
  cycles: Cycle[]
  /** Set of cycle IDs for O(1) duplicate checks — changes reference when cycles are added. */
  cycleIds: Set<string>
  addCycle(cycle: Cycle): void
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
}))

// Load seed data on module initialisation (before any component mounts).
getCycles().then((initial) => {
  const { cycleIds, addCycle } = useCycleStore.getState()
  for (const c of initial) {
    if (!cycleIds.has(c.id)) addCycle(c)
  }
})
