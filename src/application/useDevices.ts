import { useDeviceStore } from '@/store/useDeviceStore'
import type { Device } from '@/domain/device'

export interface DevicesViewModel {
  devices: Device[]
  totalCount: number
  alertCount: number
  createDevice: (data: Omit<Device, 'id' | 'cycles'>) => void
  updateDevice: (id: string, patch: Partial<Omit<Device, 'id'>>) => void
  removeDevice: (id: string) => void
}

export function useDevices(): DevicesViewModel {
  const { devices, createDevice, updateDevice, removeDevice } = useDeviceStore()

  return {
    devices,
    totalCount: devices.length,
    alertCount: devices.filter((d) => d.status === 'Warning').length,
    createDevice,
    updateDevice,
    removeDevice,
  }
}
