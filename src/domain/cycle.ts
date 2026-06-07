export type CycleStatus = 'Completed' | 'Active' | 'Warning'

export interface Cycle {
  id: string
  machine: string
  machineId?: string
  start: string
  end: string
  duration: string
  status: CycleStatus
  temp: string
  // Set only for cycles sourced from a physical device
  deviceKey?: string
  channels?: number
  interval?: number
  samples?: number[][]
}

export const cycleStatusBadgeVariant: Record<CycleStatus, 'success' | 'brand' | 'warning' | 'default'> = {
  Completed: 'success',
  Active: 'brand',
  Warning: 'warning',
}
