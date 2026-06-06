import { create } from 'zustand'
import { deviceRepository } from '@/infrastructure/deviceRepository'
import type { Device } from '@/domain/device'

interface DeviceStore {
  devices: Device[]
  /** Create or update a device on USB detection. Preserves name and lastConnection on update. */
  registerDevice(device: Device): void
  /** Stamp lastConnection = now for the given device id. */
  recordConnection(id: string): void
  updateDevice(id: string, patch: Partial<Device>): void
  removeDevice(id: string): void
}

export const useDeviceStore = create<DeviceStore>((set, get) => ({
  devices: deviceRepository.getAll(),

  registerDevice(device) {
    deviceRepository.register(device)
    const existing = get().devices.find((d) => d.id === device.id)
    if (!existing) {
      set((s) => ({ devices: [...s.devices, device] }))
    } else {
      set((s) => ({
        devices: s.devices.map((d) =>
          d.id === device.id
            ? { ...d, lastSeen: device.lastSeen, status: device.status }
            : d,
        ),
      }))
    }
  },

  recordConnection(id) {
    const ts = new Date().toISOString()
    deviceRepository.recordConnection(id)
    set((s) => ({
      devices: s.devices.map((d) => (d.id === id ? { ...d, lastConnection: ts } : d)),
    }))
  },

  updateDevice(id, patch) {
    deviceRepository.update(id, patch)
    set((s) => ({
      devices: s.devices.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    }))
  },

  removeDevice(id) {
    deviceRepository.remove(id)
    set((s) => ({ devices: s.devices.filter((d) => d.id !== id) }))
  },
}))
