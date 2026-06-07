import { create } from 'zustand'
import type { IThermographDriver, DeviceInfo, RecordEntry } from '@/infrastructure/thermographDriver'

export type ThermographStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface ThermographSlice {
  status: ThermographStatus
  busyOp: string | null
  error: string | null
  info: DeviceInfo | null
  /** Cycles listed on the device (index + metadata, no samples). */
  cycles: RecordEntry[] | null
  /** Index of the specific device cycle currently being fetched (for per-row loaders). */
  fetchingCycleIdx: number | null
  driver: IThermographDriver | null
}

export const IDLE_SLICE: ThermographSlice = {
  status: 'disconnected',
  busyOp: null,
  error: null,
  info: null,
  cycles: null,
  fetchingCycleIdx: null,
  driver: null,
}

interface ThermographStore {
  slices: Record<string, ThermographSlice>
  patch(key: string, update: Partial<ThermographSlice>): void
  reset(key: string): void
}

export const useThermographStore = create<ThermographStore>((set) => ({
  slices: {},

  patch(key, update) {
    set((s) => ({
      slices: {
        ...s.slices,
        [key]: { ...(s.slices[key] ?? IDLE_SLICE), ...update },
      },
    }))
  },

  reset(key) {
    set((s) => ({ slices: { ...s.slices, [key]: IDLE_SLICE } }))
  },
}))
