export type CycleStatus = 'Completed' | 'Active' | 'Warning'

export interface Cycle {
  id: string
  machine: string
  /** ID of the Machine (from useMachineStore) this cycle ran on. */
  machineId?: string
  /** ID of the Product (from useProductStore) this cycle was produced for. */
  productId?: string
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
