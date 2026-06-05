export type CycleStatus = 'Completed' | 'Active' | 'Warning'

export interface Cycle {
  id: string
  machine: string
  start: string
  end: string
  duration: string
  status: CycleStatus
  temp: string
}

export const cycleStatusBadgeVariant: Record<CycleStatus, 'success' | 'brand' | 'warning' | 'default'> = {
  Completed: 'success',
  Active: 'brand',
  Warning: 'warning',
}
