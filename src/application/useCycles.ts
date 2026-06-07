import { useCycleStore } from '@/store/useCycleStore'

export function useCycles() {
  const cycles = useCycleStore((s) => s.cycles)
  return {
    cycles,
    warningCount: cycles.filter((c) => c.status === 'Warning').length,
  }
}
