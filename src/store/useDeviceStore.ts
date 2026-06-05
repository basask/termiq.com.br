import { create } from 'zustand'
import { deviceRepository, nextDeviceId } from '@/infrastructure/deviceRepository'
import type { Device } from '@/domain/device'

interface DeviceStore {
  devices: Device[]
  createDevice(device: Omit<Device, 'id' | 'cycles'>): void
  updateDevice(id: string, patch: Partial<Omit<Device, 'id'>>): void
  removeDevice(id: string): void
}

export const useDeviceStore = create<DeviceStore>((set, get) => ({
  devices: deviceRepository.getAll(),

  createDevice(data) {
    const device: Device = {
      ...data,
      id: nextDeviceId(get().devices),
      cycles: '0',
    }
    deviceRepository.create(device)
    set((s) => ({ devices: [...s.devices, device] }))
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
