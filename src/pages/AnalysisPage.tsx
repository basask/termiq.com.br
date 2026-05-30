import ReactECharts from 'echarts-for-react'
import { TrendingUp, Thermometer, Droplets, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { EChartsOption } from 'echarts'
import { useEffect, useState } from 'react'

const hours = Array.from({ length: 25 }, (_, i) => `${String(i).padStart(2, '0')}:00`)


const chartOption:EChartsOption = {
  backgroundColor: 'transparent',
  grid: { top: 56, right: 72, bottom: 36, left: 56 },
  tooltip: {
    trigger: 'axis' as const,
    backgroundColor: '#ffffff',
    borderColor: '#E3E8E4',
    borderWidth: 1,
    padding: [8, 12],
    textStyle: {
      color: '#0B1410',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 12,
    },
    axisPointer: {
      type: 'line' as const,
      lineStyle: { color: '#E3E8E4', width: 1 },
    },
  },
  legend: {
    top: 4,
    left: 0,
    data: ['Sensor A (°C)'],
    itemWidth: 16,
    itemHeight: 2,
    itemGap: 20,
    textStyle: {
      color: '#5A6660',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 11,
    },
  },
  xAxis: {
    type: 'category' as const,
    data: hours,
    boundaryGap: false,
    axisLine: { lineStyle: { color: '#E3E8E4' } },
    axisLabel: {
      color: '#8A938E',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 10,
      interval: 3,
    },
    axisTick: { show: false },
    splitLine: { show: false },
  },
  yAxis: [
    {
      type: 'value' as const,
      name: '°C',
      nameTextStyle: {
        color: '#8A938E',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10,
        padding: [0, 8, 0, 0],
      },
      axisLabel: {
        color: '#8A938E',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10,
        formatter: '{value}°',
      },
      splitLine: { lineStyle: { color: '#EDF1EE', type: 'solid' } },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    {
      type: 'value' as const,
      name: 'L/s',
      min: 8,
      max: 16,
      nameTextStyle: {
        color: '#8A938E',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10,
        padding: [0, 0, 0, 8],
      },
      axisLabel: {
        color: '#8A938E',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10,
      },
      splitLine: { show: false },
      axisLine: { show: false },
      axisTick: { show: false },
    },
  ],
  brush: {
    toolbox: ['rect', 'polygon', 'lineX', 'lineY', 'keep', 'clear'],
    xAxisIndex: 0
  },
  series: [
    {
      name: 'Sensor A (°C)',
      type: 'scatter' as const,
      yAxisIndex: 0,
      data: [],
    },
  ],
}

const kpis = [
  { label: 'Avg inlet temp', value: '23.4°C', delta: '↘ -0.6 from yesterday', deltaOk: true, icon: Thermometer, color: 'text-tq-green-600' },
  { label: 'Avg outlet temp', value: '85.2°C', delta: '↗ +2.1 · above avg', deltaOk: false, icon: TrendingUp, color: 'text-tq-heat-500' },
  { label: 'Avg flow rate', value: '12.3 L/s', delta: '→ stable', deltaOk: true, icon: Droplets, color: 'text-[#14B8A6]' },
  { label: 'Peak outlet', value: '94.6°C', delta: '↗ threshold: 90°C', deltaOk: false, icon: Activity, color: 'text-tq-danger' },
]

const tempData = [
  22.0, 22.2, 22.1, 21.9, 22.4, 23.0, 23.6, 24.1, 24.4, 24.3, 24.0, 23.6,
  23.3, 23.9, 24.2, 24.6, 24.9, 25.0, 24.7, 24.2, 23.8, 23.4, 23.0, 22.7, 22.5,
];

export default function AnalysisPage() {

  const [option, setOption] = useState<EChartsOption>(chartOption);
  
  useEffect(() => {
    const intervalId = setTimeout(() => {

      if (option.series === undefined || option.series === null || option.series.length === 0) {
        return;
      }

      const { data } = option.series[0];
      
      if (data.length >= tempData.length) {
        clearInterval(intervalId);
        return;
      }

      setOption({
        ...option, 
        series: [{
          data: tempData.slice(0, data.length + 1)
        }]
      })
    }, 50);

    return () => clearInterval(intervalId)
  })

  return (
    <div className="p-4 md:p-7 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-tq-fg-1">Analysis</h1>
        <p className="font-mono text-[12px] text-tq-fg-3 mt-1">
          24-hour thermal trend · plant-norte · boiler area
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, delta, deltaOk, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-tq-fg-3">
                  {label}
                </span>
                <span className={color}>
                  <Icon size={16} />
                </span>
              </div>
              <div className="font-mono text-[26px] font-semibold text-tq-fg-1 leading-none">
                {value}
              </div>
              <div
                className={`font-mono text-[11px] mt-1.5 ${deltaOk ? 'text-tq-green-700' : 'text-tq-heat-600 font-semibold'}`}
              >
                {delta}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main chart */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle>Thermal series — last 24 hours</CardTitle>
          <CardDescription>
            Inlet temp · Outlet temp · Flow rate · sensor_temp_b03
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <ReactECharts
            option={option}
            style={{ height: 'clamp(280px, 50vw, 520px)', width: '100%' }}
            lazyUpdate
          />
        </CardContent>
      </Card>
    </div>
  )
}
