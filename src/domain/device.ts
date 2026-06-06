export type DeviceStatus = 'Healthy' | 'Warning' | 'Offline'

export interface Device {
  id: string              // USB serial number — primary key
  name: string
  status: DeviceStatus
  lastSeen: string | null      // ISO — set whenever the USB device is detected
  lastConnection: string | null // ISO — set when the HID protocol connection succeeds
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
