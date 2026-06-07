import { useCallback } from 'react'
import { useThermographStore, IDLE_SLICE } from '@/store/useThermographStore'
import { useCycleStore } from '@/store/useCycleStore'
import type { IThermographDriver, DeviceInfo, FetchedRecord, RecordEntry } from '@/infrastructure/thermographDriver'
import type { ThermographSlice } from '@/store/useThermographStore'
import type { Cycle } from '@/domain/cycle'

export type { DeviceInfo, FetchedRecord, RecordEntry }
export type { ThermographStatus } from '@/store/useThermographStore'

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

/** Stable cycle UID: device key + start datetime. Used as the primary key across both stores. */
export function cycleUid(deviceKey: string, startDatetime: string): string {
  return `${deviceKey}_${startDatetime}`
}

function fetchedToDomainCycle(
  fetched: FetchedRecord,
  deviceKey: string,
  deviceName: string,
): Cycle {
  const uid = cycleUid(deviceKey, fetched.entry.startDatetime)

  const [datePart, timePart] = fetched.entry.startDatetime.split(' ')
  const [y, mo, d] = datePart.split('-').map(Number)
  const [h, mi, s] = timePart.split(':').map(Number)
  const startMs    = new Date(y, mo - 1, d, h, mi, s).getTime()
  const durationSec = fetched.samples.length * fetched.interval
  const endMs       = startMs + durationSec * 1000

  const durationMin = Math.round(durationSec / 60)
  const durationStr =
    durationMin >= 60
      ? `${Math.floor(durationMin / 60)}h ${durationMin % 60}min`
      : `${durationMin} min`

  const allTemps = fetched.samples.flat()
  const peakTemp = allTemps.length > 0 ? Math.max(...allTemps) : 0

  const fmt = (ms: number) => new Date(ms).toISOString().slice(0, 19).replace('T', ' ')

  return {
    id: uid,
    machine: deviceName,
    deviceKey,
    start: fetched.entry.startDatetime,
    end: fmt(endMs),
    duration: durationStr,
    status: 'Completed',
    temp: `${peakTemp.toFixed(1)}°C`,
    channels: fetched.channels,
    interval: fetched.interval,
    samples: fetched.samples,
  }
}

export function useThermograph(
  deviceKey: string,
  deviceName: string,
  createDriver: () => IThermographDriver,
  onConnected?: () => void,
) {
  const slice = useThermographStore((s) => s.slices[deviceKey] ?? IDLE_SLICE)
  const patch  = useThermographStore((s) => s.patch)
  const reset  = useThermographStore((s) => s.reset)

  const runOp = useCallback(
    async (label: string, fn: (d: IThermographDriver) => Promise<Partial<ThermographSlice>>) => {
      const driver = useThermographStore.getState().slices[deviceKey]?.driver
      if (!driver) return
      patch(deviceKey, { busyOp: label, error: null })
      try {
        const update = await fn(driver)
        patch(deviceKey, { ...update, busyOp: null })
      } catch (e) {
        patch(deviceKey, { status: 'error', busyOp: null, error: errMsg(e) })
      }
    },
    [deviceKey, patch],
  )

  const connect = useCallback(async () => {
    patch(deviceKey, { status: 'connecting', busyOp: 'Connecting…', error: null })
    try {
      const driver = createDriver()
      await driver.open()
      patch(deviceKey, { driver, status: 'connected', busyOp: null })
      onConnected?.()
    } catch (e) {
      patch(deviceKey, { driver: null, status: 'error', busyOp: null, error: errMsg(e) })
      return
    }
    await runOp('Reading device info…', async (d) => ({ info: await d.getInfo() }))
  }, [deviceKey, createDriver, onConnected, patch, runOp])

  const disconnect = useCallback(async () => {
    const driver = useThermographStore.getState().slices[deviceKey]?.driver
    reset(deviceKey)
    if (driver) await driver.close().catch(() => {})
  }, [deviceKey, reset])

  const loadCycles = useCallback(
    () => runOp('Listing cycles…', async (d) => ({ cycles: await d.listRecords() })),
    [runOp],
  )

  /** Fetch a single cycle by device index; adds it to the Cycles page store. */
  const fetchCycle = useCallback(async (idx: number) => {
    const driver = useThermographStore.getState().slices[deviceKey]?.driver
    if (!driver) return
    patch(deviceKey, { fetchingCycleIdx: idx, busyOp: 'Fetching cycle…', error: null })
    try {
      const fetched = await driver.fetchRecord(idx)
      useCycleStore.getState().addCycle(fetchedToDomainCycle(fetched, deviceKey, deviceName))
      patch(deviceKey, { fetchingCycleIdx: null, busyOp: null })
    } catch (e) {
      patch(deviceKey, { fetchingCycleIdx: null, status: 'error', busyOp: null, error: errMsg(e) })
    }
  }, [deviceKey, deviceName, patch])

  /** Fetch every listed cycle not yet in the Cycles page store. */
  const fetchAllCycles = useCallback(async () => {
    const state  = useThermographStore.getState()
    const listed = state.slices[deviceKey]?.cycles ?? []
    const driver = state.slices[deviceKey]?.driver
    if (!driver || listed.length === 0) return

    const { cycleIds } = useCycleStore.getState()
    const pending = listed.filter((e) => !cycleIds.has(cycleUid(deviceKey, e.startDatetime)))
    if (pending.length === 0) return

    const total = pending.length
    try {
      for (let i = 0; i < pending.length; i++) {
        patch(deviceKey, {
          fetchingCycleIdx: pending[i].index,
          busyOp: `Fetching cycle ${i + 1}/${total}…`,
          error: null,
        })
        const fetched = await driver.fetchRecord(pending[i].index)
        useCycleStore.getState().addCycle(fetchedToDomainCycle(fetched, deviceKey, deviceName))
      }
      patch(deviceKey, { fetchingCycleIdx: null, busyOp: null })
    } catch (e) {
      patch(deviceKey, { fetchingCycleIdx: null, status: 'error', busyOp: null, error: errMsg(e) })
    }
  }, [deviceKey, deviceName, patch])

  const { driver: _driver, ...publicState } = slice
  return { ...publicState, connect, disconnect, loadCycles, fetchCycle, fetchAllCycles }
}
