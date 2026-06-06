import { useCallback, useEffect, useState } from 'react'

const VENDOR_ID = 0x1a86
const PRODUCT_ID = 0xe010

export type UsbSupportStatus = 'supported' | 'unsupported' | 'checking'

export interface UsbDeviceInfo {
  productName: string | undefined
  manufacturerName: string | undefined
  serialNumber: string | undefined
  vendorId: number
  productId: number
}

export interface ConnectedUsbDevice {
  info: UsbDeviceInfo
  usbDevice: USBDevice
}

const infoFrom = (d: USBDevice): UsbDeviceInfo => ({
  productName: d.productName,
  manufacturerName: d.manufacturerName,
  serialNumber: d.serialNumber,
  vendorId: d.vendorId,
  productId: d.productId,
})

export function useUsbDevices() {
  const [support, setSupport] = useState<UsbSupportStatus>('checking')
  const [devices, setDevices] = useState<ConnectedUsbDevice[]>([])
  const [scanning, setScanning] = useState(false)

  const refresh = useCallback(async () => {
    if (!navigator.usb) return
    const granted = await navigator.usb.getDevices()
    setDevices(
      granted
        .filter((d) => d.vendorId === VENDOR_ID && d.productId === PRODUCT_ID)
        .map((d) => ({ info: infoFrom(d), usbDevice: d })),
    )
  }, [])

  useEffect(() => {
    if (!('usb' in navigator)) {
      setSupport('unsupported')
      return
    }
    setSupport('supported')
    refresh()

    const onConnect = (e: USBConnectionEvent) => {
      const d = e.device
      if (d.vendorId === VENDOR_ID && d.productId === PRODUCT_ID) {
        setDevices((prev) => [...prev, { info: infoFrom(d), usbDevice: d }])
      }
    }
    const onDisconnect = (e: USBConnectionEvent) => {
      setDevices((prev) => prev.filter((x) => x.usbDevice !== e.device))
    }

    navigator.usb.addEventListener('connect', onConnect)
    navigator.usb.addEventListener('disconnect', onDisconnect)
    return () => {
      navigator.usb.removeEventListener('connect', onConnect)
      navigator.usb.removeEventListener('disconnect', onDisconnect)
    }
  }, [refresh])

  const scan = useCallback(async () => {
    if (!navigator.usb) return
    setScanning(true)
    try {
      await navigator.usb.requestDevice({ filters: [{ vendorId: VENDOR_ID, productId: PRODUCT_ID }] })
      await refresh()
    } catch {
      // user cancelled the picker — not an error
    } finally {
      setScanning(false)
    }
  }, [refresh])

  return { support, devices, scanning, scan, VENDOR_ID, PRODUCT_ID }
}
