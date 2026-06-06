import { useCallback, useRef, useState } from 'react'
import type { IThermographDriver, DeviceInfo, FetchedRecord, RecordEntry } from '@/infrastructure/thermographDriver'

export type { DeviceInfo, FetchedRecord, RecordEntry }

export type ThermographStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

interface State {
  status: ThermographStatus
  busyOp: string | null
  error: string | null
  info: DeviceInfo | null
  records: RecordEntry[] | null
  fetchedRecord: FetchedRecord | null
}

const IDLE: State = {
  status: 'disconnected',
  busyOp: null,
  error: null,
  info: null,
  records: null,
  fetchedRecord: null,
}

export function useThermograph(createDriver: () => IThermographDriver, onConnected?: () => void) {
  const driverRef = useRef<IThermographDriver | null>(null)
  const [state, setState] = useState<State>(IDLE)

  const connect = useCallback(async () => {
    setState((s) => ({ ...s, status: 'connecting', busyOp: 'Connecting…', error: null }))
    try {
      const driver = createDriver()
      await driver.open()
      driverRef.current = driver
      setState((s) => ({ ...s, status: 'connected', busyOp: null }))
      onConnected?.()
    } catch (e) {
      driverRef.current = null
      setState((s) => ({ ...s, status: 'error', busyOp: null, error: errMsg(e) }))
    }
  }, [createDriver, onConnected])

  const disconnect = useCallback(async () => {
    const driver = driverRef.current
    driverRef.current = null
    if (driver) await driver.close().catch(() => {})
    setState(IDLE)
  }, [])

  const runOp = useCallback(
    async (opLabel: string, fn: (d: IThermographDriver) => Promise<Partial<State>>) => {
      const driver = driverRef.current
      if (!driver) return
      setState((s) => ({ ...s, busyOp: opLabel, error: null }))
      try {
        const patch = await fn(driver)
        setState((s) => ({ ...s, ...patch, busyOp: null }))
      } catch (e) {
        setState((s) => ({ ...s, status: 'error', busyOp: null, error: errMsg(e) }))
      }
    },
    [],
  )

  const loadInfo = useCallback(
    () => runOp('Reading device info…', async (d) => {
      console.log('Started loading info...')
      const info  = await d.getInfo()
      console.log(`[DEBUG] info=${info}`)
      return { info };
    }),
    [runOp],
  )

  const loadRecords = useCallback(
    () => runOp('Listing records…', async (d) => ({ records: await d.listRecords() })),
    [runOp],
  )

  const downloadRecord = useCallback(
    (idx: number) =>
      runOp(`Fetching record ${idx}…`, async (d) => ({ fetchedRecord: await d.fetchRecord(idx) })),
    [runOp],
  )

  return { ...state, connect, disconnect, loadInfo, loadRecords, downloadRecord }
}

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}
