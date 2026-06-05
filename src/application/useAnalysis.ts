import { timeseriesData, buildChartOption, ANALYSIS_KPIS } from '@/infrastructure/analysisRepository'

export function useAnalysis() {
  return {
    timeseriesData,
    buildChartOption,
    kpis: ANALYSIS_KPIS,
  }
}
