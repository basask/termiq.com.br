import type { Machine } from '@/domain/machine'
import { createLocalStorageDb } from './localStorageDb'

const db = createLocalStorageDb<Machine>('termiq:machines')

const SEED_MACHINES: Machine[] = [
  {
    id: 'MCH-001',
    name: 'Powder Coating Oven',
    status: 'active',
    sections: [
      { id: 'sec-001-1', name: 'Melting',                  distance: 5.0  },
      { id: 'sec-001-2', name: 'Flow-out',                 distance: 10.0 },
      { id: 'sec-001-3', name: 'Gelling',                  distance: 8.5  },
      { id: 'sec-001-4', name: 'Cross-linking / Curing',   distance: 15.3 },
    ],
  },
  {
    id: 'MCH-002',
    name: 'Boiler Unit A',
    status: 'active',
    sections: [
      { id: 'sec-002-1', name: 'Preheating',     distance: 3.0  },
      { id: 'sec-002-2', name: 'Main heating',   distance: 12.0 },
      { id: 'sec-002-3', name: 'Stabilization',  distance: 5.0  },
    ],
  },
  {
    id: 'MCH-003',
    name: 'Boiler Unit B',
    status: 'maintenance',
    sections: [],
  },
  {
    id: 'MCH-004',
    name: 'Chiller Node 1',
    status: 'active',
    sections: [
      { id: 'sec-004-1', name: 'Pre-cooling',  distance: 4.0 },
      { id: 'sec-004-2', name: 'Main cooling', distance: 8.0 },
    ],
  },
  {
    id: 'MCH-005',
    name: 'Heat Exchanger',
    status: 'inactive',
    sections: [],
  },
]

function ensureSeeded(): void {
  if (db.findAll().length === 0) SEED_MACHINES.forEach((m) => db.create(m))
}

export function nextMachineId(existing: Machine[]): string {
  const nums = existing
    .map((m) => parseInt(m.id.replace('MCH-', ''), 10))
    .filter((n) => !isNaN(n))
  const next = nums.length ? Math.max(...nums) + 1 : 1
  return `MCH-${String(next).padStart(3, '0')}`
}

export const machineRepository = {
  getAll(): Machine[] {
    ensureSeeded()
    return db.findAll()
  },
  create(machine: Machine): void {
    db.create(machine)
  },
  update(id: string, patch: Partial<Machine>): void {
    db.update(id, patch)
  },
  remove(id: string): void {
    db.remove(id)
  },
}
