import { DataFrame, readCSV } from 'danfojs'
import type { EChartsOption, MarkLineComponentOption } from 'echarts'
import type { Kpi } from '@/domain/analysis'
import type { Cycle } from '@/domain/cycle'

async function loadTimeseries(path: string): Promise<DataFrame> {
  const columns = {
    0: 'date', 1: 'time',
    2: 's1', 3: 'c1',
    4: 's2', 5: 'c2',
    6: 's3', 7: 'c3',
    8: 's4', 9: 'c4',
  }
  const df = await readCSV(path, { header: false })
  df.rename(columns, { inplace: true })
  return df
}

export const timeseriesData: Promise<DataFrame> = loadTimeseries('/data/test-synthetic.csv')

const markLine: MarkLineComponentOption = {
  symbol: ['circle', 'circle'],
  data: [
    {
      yAxis: 160,
      name: 'PMT',
      lineStyle: { color: '#ff4d4f', type: 'dashed', width: 1 },
      label: { show: true, position: 'end', formatter: 'PMT: {c}°C' },
    },
  ],
}

const markArea = {
  itemStyle: { color: 'rgba(0, 0, 156, 0.10)' },
  data: [[{ xAxis: '08:00:25' }, { xAxis: '08:01:00' }]],
}

const chartBaseOption: EChartsOption = {
  backgroundColor: 'transparent',
  grid: { top: 56, right: 72, bottom: 36, left: 56 },
  tooltip: {
    trigger: 'axis' as const,
    backgroundColor: '#ffffff',
    borderColor: '#E3E8E4',
    borderWidth: 1,
    padding: [8, 12],
    textStyle: { color: '#0B1410', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 },
    axisPointer: { type: 'line' as const, lineStyle: { color: '#E3E8E4', width: 1 } },
  },
  legend: {
    top: 4,
    left: 0,
    data: [],
    itemWidth: 16,
    itemHeight: 2,
    itemGap: 20,
    textStyle: { color: '#5A6660', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 },
  },
  xAxis: {
    type: 'category' as const,
    data: [],
    boundaryGap: false,
    axisLine: { lineStyle: { color: '#E3E8E4' } },
    axisLabel: { color: '#8A938E', align: 'left', fontFamily: 'JetBrains Mono, monospace' },
    axisTick: { show: false },
    splitLine: { show: false },
  },
  yAxis: [
    {
      type: 'value' as const,
      name: '°C',
      nameTextStyle: { color: '#8A938E', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, padding: [0, 8, 0, 0] },
      axisLabel: { color: '#8A938E', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, formatter: '{value}°' },
      splitLine: { lineStyle: { color: '#EDF1EE', type: 'solid' } },
      axisLine: { show: false },
      axisTick: { show: false },
    },
  ],
  brush: { toolbox: ['rect', 'polygon', 'lineX', 'lineY', 'keep', 'clear'], xAxisIndex: 0 },
  series: [],
}

export function buildChartOption(timeseries: DataFrame): EChartsOption {
  const series: EChartsOption['series'] = []
  const legendData: string[] = []

  for (const sensor of ['s1', 's2', 's3', 's4']) {
    const name = `Sensor ${sensor} (°C)`
    series.push({
      name,
      type: 'line' as const,
      yAxisIndex: 0,
      data: [...(timeseries[sensor].values as number[])],
      markLine: sensor === 's1' ? markLine : undefined,
      markArea: sensor === 's1' ? markArea : undefined,
    })
    legendData.push(name)
  }

  return {
    ...chartBaseOption,
    xAxis: { ...chartBaseOption.xAxis, data: timeseries['time'].values as string[] },
    legend: { ...chartBaseOption.legend, data: legendData },
    series,
  }
}

const CHANNEL_COLORS = [
  '#22c55e', '#f97316', '#14b8a6', '#ef4444',
  '#8b5cf6', '#ec4899', '#eab308', '#06b6d4',
]

export function buildChartOptionFromCycle(cycle: Cycle): EChartsOption {
  const { samples, channels = 1, interval = 1, start } = cycle
  if (!samples || samples.length === 0) return { ...chartBaseOption, series: [] }

  const [datePart, timePart] = start.split(' ')
  const [y, mo, d] = datePart.split('-').map(Number)
  const [h, mi, s] = timePart.split(':').map(Number)
  const startMs = new Date(y, mo - 1, d, h, mi, s).getTime()

  const timeLabels = samples.map((_, i) =>
    new Date(startMs + i * interval * 1000).toTimeString().slice(0, 8),
  )

  const series: EChartsOption['series'] = Array.from({ length: channels }, (_, ch) => ({
    name: `Ch ${ch + 1} (°C)`,
    type: 'line' as const,
    yAxisIndex: 0,
    data: samples.map((row) => row[ch] ?? null),
    symbol: 'none',
    lineStyle: { width: 1.5, color: CHANNEL_COLORS[ch % CHANNEL_COLORS.length] },
    color: CHANNEL_COLORS[ch % CHANNEL_COLORS.length],
  }))

  return {
    ...chartBaseOption,
    xAxis: { ...chartBaseOption.xAxis, data: timeLabels },
    legend: { ...chartBaseOption.legend, data: (series as Array<{ name: string }>).map((s) => s.name) },
    series,
  }
}

export function buildKpisFromCycle(cycle: Cycle): Kpi[] {
  const { samples, channels = 1, interval = 1, duration } = cycle
  if (!samples || samples.length === 0) return []

  const allTemps = samples.flat()
  const peak = Math.max(...allTemps)
  const avg  = allTemps.reduce((a, b) => a + b, 0) / allTemps.length

  const highThreshold = peak * 0.8
  const dwellCount = samples.filter((row) => Math.max(...row) >= highThreshold).length
  const dwellSecs  = dwellCount * interval
  const dwellMin   = Math.floor(dwellSecs / 60)
  const dwellSec   = Math.round(dwellSecs % 60)
  const dwellStr   = dwellMin > 0 ? `${dwellMin}min ${dwellSec}s` : `${dwellSec}s`

  return [
    {
      label: 'Peak temperature',
      value: `${peak.toFixed(1)}°C`,
      delta: `avg ${avg.toFixed(1)}°C across all channels`,
      deltaOk: true,
    },
    {
      label: 'Dwell above 80% peak',
      value: dwellStr,
      delta: `≥ ${highThreshold.toFixed(0)}°C threshold`,
      deltaOk: true,
    },
    {
      label: 'Cycle duration',
      value: duration,
      delta: `${samples.length} samples · ${channels} ch`,
      deltaOk: true,
    },
    {
      label: 'Interval',
      value: `${interval}s`,
      delta: `${channels} channel${channels !== 1 ? 's' : ''}`,
      deltaOk: true,
    },
  ]
}

export const ANALYSIS_KPIS: Kpi[] = [
  { label: 'Peak Metal Temperature', value: '160.0°C', delta: '↘ -0.6 from yesterday', deltaOk: true },
  { label: 'Dwell Time at PMT', value: '15min30s', delta: '↘ -4min30s · Bellow PMT', deltaOk: false },
  { label: 'Oven Ramp-Up Rate', value: '1.5°C/sec', delta: '→ stable', deltaOk: true },
  { label: 'Peak outlet', value: '94.6°C', delta: '↗ threshold: 90°C', deltaOk: false },
]
