import type { Device } from '@/domain/device'
import { createLocalStorageDb } from './localStorageDb'

const db = createLocalStorageDb<Device>('termiq:devices')

export const deviceRepository = {
  getAll(): Device[] {
    return db.findAll()
  },

  /**
   * Create if the device is new; otherwise update only lastSeen and status,
   * preserving the user-assigned name and the lastConnection timestamp.
   */
  register(device: Device): void {
    const existing = db.findById(device.id)
    if (!existing) {
      db.create(device)
    } else {
      db.update(device.id, { lastSeen: device.lastSeen, status: device.status })
    }
  },

  recordConnection(id: string): void {
    db.update(id, { lastConnection: new Date().toISOString() })
  },

  update(id: string, patch: Partial<Device>): void {
    db.update(id, patch)
  },

  remove(id: string): void {
    db.remove(id)
  },
}
