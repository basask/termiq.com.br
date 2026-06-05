import { useEffect, useState } from 'react'
import { getCycles } from '@/infrastructure/cycleRepository'
import type { Cycle } from '@/domain/cycle'

interface CyclesState {
  cycles: Cycle[]
  loading: boolean
  warningCount: number
}

export function useCycles(): CyclesState {
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCycles().then((data) => {
      setCycles(data)
      setLoading(false)
    })
  }, [])

  return {
    cycles,
    loading,
    warningCount: cycles.filter((c) => c.status === 'Warning').length,
  }
}
