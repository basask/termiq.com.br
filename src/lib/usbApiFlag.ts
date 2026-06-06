// Feature flag: set VITE_TERMIQ_USB_API=USB to use the WebUSB driver.
// Defaults to WebHID when unset or set to any other value.
export const USB_API_MODE: 'USB' | 'HID' =
  (import.meta.env.VITE_TERMIQ_USB_API as string | undefined)?.toUpperCase() === 'USB'
    ? 'USB'
    : 'HID'
