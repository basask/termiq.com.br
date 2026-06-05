import { useEffect, useState } from 'react'
import { getDevices } from '@/infrastructure/deviceRepository'
import type { Device } from '@/domain/device'

interface DevicesState {
  devices: Device[]
  loading: boolean
  totalCount: number
  alertCount: number
}

export function useDevices(): DevicesState {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDevices().then((data) => {
      setDevices(data)
      setLoading(false)
    })
  }, [])

  return {
    devices,
    loading,
    totalCount: devices.length,
    alertCount: devices.filter((d) => d.status === 'Warning').length,
  }
}
