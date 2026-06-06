import { useCallback, useEffect, useState } from 'react'
import type { UsbDeviceInfo, UsbSupportStatus } from './useUsbDevices'

const VENDOR_ID = 0x1a86
const PRODUCT_ID = 0xe010

export interface ConnectedHidDevice {
  info: UsbDeviceInfo
  hidDevice: HIDDevice
}

const infoFrom = (d: HIDDevice): UsbDeviceInfo => ({
  productName: d.productName,
  manufacturerName: undefined,
  serialNumber: undefined,
  vendorId: d.vendorId,
  productId: d.productId,
})

export function useHidDevices() {
  const [support, setSupport] = useState<UsbSupportStatus>('checking')
  const [devices, setDevices] = useState<ConnectedHidDevice[]>([])
  const [scanning, setScanning] = useState(false)

  const refresh = useCallback(async () => {
    if (!navigator.hid) return
    const granted = await navigator.hid.getDevices()
    setDevices(
      granted
        .filter((d) => d.vendorId === VENDOR_ID && d.productId === PRODUCT_ID)
        .map((d) => ({ info: infoFrom(d), hidDevice: d })),
    )
  }, [])

  useEffect(() => {
    if (!('hid' in navigator)) {
      setSupport('unsupported')
      return
    }
    setSupport('supported')
    refresh()

    const onConnect = (e: HIDConnectionEvent) => {
      const d = e.device
      if (d.vendorId === VENDOR_ID && d.productId === PRODUCT_ID) {
        setDevices((prev) => [...prev, { info: infoFrom(d), hidDevice: d }])
      }
    }
    const onDisconnect = (e: HIDConnectionEvent) => {
      setDevices((prev) => prev.filter((x) => x.hidDevice !== e.device))
    }

    navigator.hid.addEventListener('connect', onConnect)
    navigator.hid.addEventListener('disconnect', onDisconnect)
    return () => {
      navigator.hid.removeEventListener('connect', onConnect)
      navigator.hid.removeEventListener('disconnect', onDisconnect)
    }
  }, [refresh])

  const scan = useCallback(async () => {
    if (!navigator.hid) return
    setScanning(true)
    try {
      await navigator.hid.requestDevice({ filters: [{ vendorId: VENDOR_ID, productId: PRODUCT_ID }] })
      await refresh()
    } catch {
      // user cancelled the picker — not an error
    } finally {
      setScanning(false)
    }
  }, [refresh])

  return { support, devices, scanning, scan, VENDOR_ID, PRODUCT_ID }
}
