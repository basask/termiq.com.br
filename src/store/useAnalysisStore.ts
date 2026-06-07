import { create } from 'zustand'
import type { Analysis } from '@/domain/analysis'

interface AnalysisStore {
  analyses: Analysis[]
  addAnalysis(analysis: Analysis): void
}

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  analyses: [],
  addAnalysis(analysis) {
    set((s) => ({ analyses: [analysis, ...s.analyses] }))
  },
}))
