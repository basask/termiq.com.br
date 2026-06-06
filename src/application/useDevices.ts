import { useDeviceStore } from '@/store/useDeviceStore'
import type { Device } from '@/domain/device'

export interface DevicesViewModel {
  devices: Device[]
  totalCount: number
  alertCount: number
  registerDevice: (device: Device) => void
  recordConnection: (id: string) => void
  updateDevice: (id: string, patch: Partial<Device>) => void
  removeDevice: (id: string) => void
}

export function useDevices(): DevicesViewModel {
  const { devices, registerDevice, recordConnection, updateDevice, removeDevice } = useDeviceStore()

  return {
    devices,
    totalCount: devices.length,
    alertCount: devices.filter((d) => d.status === 'Warning').length,
    registerDevice,
    recordConnection,
    updateDevice,
    removeDevice,
  }
}
