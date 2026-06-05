import type { Device } from '@/domain/device'
import { createLocalStorageDb } from './localStorageDb'

const db = createLocalStorageDb<Device>('termiq:devices')

const SEED_DEVICES: Device[] = [
  { id: 'DL-001', name: 'Data Logger - Engineering 01', status: 'Healthy', battery: 0.9, channels: '4', cycles: '121' },
  { id: 'DL-002', name: 'Data Logger - Quality Asurance 01', status: 'Healthy', battery: 0.1, channels: '4', cycles: '20' },
  { id: 'DL-003', name: 'Data Logger - Operations 01', status: 'Warning', battery: 0.23, channels: '8', cycles: '13' },
  { id: 'DL-004', name: 'Data Logger - Operations 02', status: 'Healthy', battery: 0.56, channels: '4', cycles: '45' },
  { id: 'DL-005', name: 'Data Logger - Engineering 02', status: 'Offline', battery: 0.0, channels: '4', cycles: '—' },
]

function ensureSeeded(): void {
  if (db.findAll().length === 0) {
    SEED_DEVICES.forEach((d) => db.create(d))
  }
}

export function nextDeviceId(existing: Device[]): string {
  const nums = existing
    .map((d) => parseInt(d.id.replace('DL-', ''), 10))
    .filter((n) => !isNaN(n))
  const next = nums.length ? Math.max(...nums) + 1 : 1
  return `DL-${String(next).padStart(3, '0')}`
}

export const deviceRepository = {
  getAll(): Device[] {
    ensureSeeded()
    return db.findAll()
  },
  getById(id: string): Device | undefined {
    return db.findById(id)
  },
  create(device: Device): void {
    db.create(device)
  },
  update(id: string, patch: Partial<Device>): void {
    db.update(id, patch)
  },
  remove(id: string): void {
    db.remove(id)
  },
}
