// WebHID API type declarations — not yet in TypeScript's DOM lib
// https://wicg.github.io/webhid/

interface HIDInputReportEvent extends Event {
  readonly device: HIDDevice
  readonly reportId: number
  readonly data: DataView
}

interface HIDConnectionEvent extends Event {
  readonly device: HIDDevice
}

declare class HIDDevice extends EventTarget {
  readonly opened: boolean
  readonly vendorId: number
  readonly productId: number
  readonly productName: string
  readonly collections: unknown[]

  open(): Promise<void>
  close(): Promise<void>
  forget(): Promise<void>
  sendReport(reportId: number, data: BufferSource): Promise<void>
  sendFeatureReport(reportId: number, data: BufferSource): Promise<void>
  receiveFeatureReport(reportId: number): Promise<DataView>

  addEventListener(
    type: 'inputreport',
    listener: (event: HIDInputReportEvent) => void,
    options?: boolean | AddEventListenerOptions,
  ): void
  removeEventListener(
    type: 'inputreport',
    listener: (event: HIDInputReportEvent) => void,
    options?: boolean | EventListenerOptions,
  ): void
}

interface HIDDeviceFilter {
  vendorId?: number
  productId?: number
  usagePage?: number
  usage?: number
}

interface HIDDeviceRequestOptions {
  filters: HIDDeviceFilter[]
}

interface HID extends EventTarget {
  getDevices(): Promise<HIDDevice[]>
  requestDevice(options: HIDDeviceRequestOptions): Promise<HIDDevice[]>
  addEventListener(
    type: 'connect' | 'disconnect',
    listener: (event: HIDConnectionEvent) => void,
    options?: boolean | AddEventListenerOptions,
  ): void
  removeEventListener(
    type: 'connect' | 'disconnect',
    listener: (event: HIDConnectionEvent) => void,
    options?: boolean | EventListenerOptions,
  ): void
}

interface Navigator {
  readonly hid: HID
}
