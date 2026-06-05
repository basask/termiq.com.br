export type DeviceStatus = 'Healthy' | 'Warning' | 'Offline'

export interface Device {
  id: string
  name: string
  status: DeviceStatus
  battery: number
  channels: string
  cycles: string
}

export const deviceStatusBadgeVariant: Record<DeviceStatus, 'success' | 'warning' | 'danger' | 'default'> = {
  Healthy: 'success',
  Warning: 'warning',
  Offline: 'default',
}

export const deviceStatusDotColor: Record<DeviceStatus, string> = {
  Healthy: 'bg-tq-success',
  Warning: 'bg-tq-warning',
  Offline: 'bg-tq-fg-4',
}
