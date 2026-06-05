import type { Cycle } from '@/domain/cycle'

const CYCLES: Cycle[] = [
  { id: 'CYC-2024-084', machine: 'Boiler Unit A',   machineId: 'MCH-002', start: '14:00', end: '14:48', duration: '48 min',   status: 'Completed', temp: '82°C' },
  { id: 'CYC-2024-083', machine: 'Boiler Unit B',   machineId: 'MCH-003', start: '13:30', end: '14:22', duration: '52 min',   status: 'Completed', temp: '79°C' },
  { id: 'CYC-2024-082', machine: 'Chiller Node 1',  machineId: 'MCH-004', start: '13:00', end: '—',     duration: 'Running…', status: 'Active',    temp: '94°C' },
  { id: 'CYC-2024-081', machine: 'Heat Exchanger',  machineId: 'MCH-005', start: '12:15', end: '13:00', duration: '45 min',   status: 'Completed', temp: '68°C' },
  { id: 'CYC-2024-080', machine: 'Boiler Unit A',   machineId: 'MCH-002', start: '11:45', end: '12:30', duration: '45 min',   status: 'Warning',   temp: '91°C' },
]

export function getCycles(): Promise<Cycle[]> {
  return Promise.resolve(CYCLES)
}
