export type MachineStatus = 'active' | 'maintenance' | 'inactive'

export interface Section {
  id: string
  name: string
  distance: number
}

export interface Machine {
  id: string
  name: string
  status: MachineStatus
  sections: Section[]
}

export const machineStatusBadgeVariant: Record<MachineStatus, 'success' | 'warning' | 'default'> = {
  active: 'success',
  maintenance: 'warning',
  inactive: 'default',
}

export const machineStatusLabel: Record<MachineStatus, string> = {
  active: 'Active',
  maintenance: 'Maintenance',
  inactive: 'Inactive',
}
