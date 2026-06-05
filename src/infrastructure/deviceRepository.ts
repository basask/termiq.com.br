import type { Device } from '@/domain/device'

const DEVICES: Device[] = [
  { id: 'DL-001', name: 'Data Logger - Engineering 01', status: 'Healthy', battery: 0.9, channels: '4', cycles: '121' },
  { id: 'DL-002', name: 'Data Logger - Quality Asurance 01', status: 'Healthy', battery: 0.1, channels: '4', cycles: '20' },
  { id: 'DL-003', name: 'Data Logger - Operations 01', status: 'Warning', battery: 0.23, channels: '8', cycles: '13' },
  { id: 'DL-004', name: 'Data Logger - Operations 02', status: 'Healthy', battery: 0.56, channels: '4', cycles: '45' },
  { id: 'DL-005', name: 'Data Logger - Engineering 02', status: 'Offline', battery: 0.0, channels: '4', cycles: '—' },
]

export function getDevices(): Promise<Device[]> {
  return Promise.resolve(DEVICES)
}
