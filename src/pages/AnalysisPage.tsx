import ReactECharts from 'echarts-for-react'
import { TrendingUp, Thermometer, Droplets, Activity, Clock, LineChart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { EChartsOption, MarkLineComponentOption } from 'echarts'
import { Suspense, use, useEffect, useState } from 'react'
import { DataFrame, readCSV } from 'danfojs';

const hours = Array.from({ length: 25 }, (_, i) => `${String(i).padStart(2, '0')}:00`)


const chartOption: EChartsOption = {
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
    data: [],
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
      // rotate: 45,
      align: 'left',
      // verticalAlign: 'middle',
      fontFamily: 'JetBrains Mono, monospace',
      // fontSize: 10,
      // interval: 10,
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
  ],
  brush: {
    toolbox: ['rect', 'polygon', 'lineX', 'lineY', 'keep', 'clear'],
    xAxisIndex: 0
  },
  series: [],
}

// const kpis = [
//   { label: 'Avg inlet temp', value: '23.4°C', delta: '↘ -0.6 from yesterday', deltaOk: true, icon: Thermometer, color: 'text-tq-green-600' },
//   { label: 'Avg outlet temp', value: '85.2°C', delta: '↗ +2.1 · above avg', deltaOk: false, icon: TrendingUp, color: 'text-tq-heat-500' },
//   { label: 'Avg flow rate', value: '12.3 L/s', delta: '→ stable', deltaOk: true, icon: Droplets, color: 'text-[#14B8A6]' },
//   { label: 'Peak outlet', value: '94.6°C', delta: '↗ threshold: 90°C', deltaOk: false, icon: Activity, color: 'text-tq-danger' },
// ]

const kpis = [
  { label: 'Peak Metal Temperature', value: '160.0°C', delta: '↘ -0.6 from yesterday', deltaOk: true, icon: Thermometer, color: 'text-tq-green-600' },
  { label: 'Dwell Time at PMT', value: '15min30s', delta: '↘ -4min30s · Bellow PMT', deltaOk: false, icon: Clock, color: 'text-tq-heat-500' },
  { label: 'Oven Ramp-Up Rate', value: '1.5°C/sec', delta: '→ stable', deltaOk: true, icon: LineChart, color: 'text-[#14B8A6]' },
  { label: 'Peak outlet', value: '94.6°C', delta: '↗ threshold: 90°C', deltaOk: false, icon: Activity, color: 'text-tq-danger' },
]

/*
  - Target Peak Metal Temperature (PMT) - 180 °C
  - Dwell Time at PMT - 15min30s
  - Oven Ramp-Up Rate - 1.5°C/sec
  - Temperature Uniformity - 



  Metrics:
  - Temperature Uniformity\(\le \pm 5^\circ\text{F}\) (\(\pm 2.8^{\circ }\text{C}\)) varianceEnsures even curing, preventing weak bonding or discoloration.
  - Part Metal Temp (PMT) Ramp RateVaries by chemistry; usually \(350^{\circ }\text{F}\) to \(400^{\circ }\text{F}\) (\(175^{\circ }\text{C}\) – \(204^{\circ }\text{C}\))Critical for cross-linking the powder. Exceeding recommended time may cause over-bake; shorting causes under-bake.
  - Airflow Speed/VolumeHigh-velocity recirculating airEliminates hot and cold spots inside the chamber.
  - Panel Insulation DensityMineral wool, \(\ge 6\text{ lbs/ft}^3\) densityRetains heat and directly reduces fuel/electricity OPEX.



  */


const markLine: MarkLineComponentOption = {
  symbol: ['circle', 'circle'],
  data: [
    { 
      yAxis: 160, 
      name: 'PMT',
      lineStyle: {
        color: '#ff4d4f',  // Custom color for the line (Red)
        type: 'dashed',    // Style: 'solid', 'dashed', or 'dotted'
        width: 1           // Thickness of the threshold line
      },
      label: {
        show: true,
        position: 'end',   // Positions text: 'start', 'middle', 'end'
        formatter: 'PMT: {c}°C' // Renders the text on screen dynamically
      }
    }
  ]
}


const markArea = {
  itemStyle: {
      color: 'rgba(0, 0, 156, 0.10)' // Highlight color
  },
  data: [
      [
        { xAxis: '08:00:25' },
        { xAxis: '08:01:00' }, 
      ]
  ]
}


async function fetchData(path:string): Promise<DataFrame> {
  const columns = {
    0: 'date', 1: 'time',
    2: 's1', 3: 'c1', 
    4: 's2', 5: 'c2',
    6: 's3', 7: 'c3',
    8: 's4', 9: 'c4'
  };
  const df = await readCSV(path, { header: false });
  df.rename(columns, { inplace: true})
  return df;
}

// const tsData = fetchData('/data/office-temperature-data-20250123.csv');
const tsData = fetchData('/data/test-synthetic.csv');

export default function AnalysisPage() {

  const timeseries = use(tsData);
  const options = {...chartOption};

  options.xAxis.data = timeseries['time'].values;

  for (const item of ['s1', 's2', 's3', 's4']) {
    options.series = [
      ...options.series, 
      {
        name: `Sensor ${item} (°C)`,
        type: 'line' as const,
        yAxisIndex: 0,
        data: [...timeseries[item].values],
        markLine: item === 's1' ? markLine: null,
        markArea: item === 's1' ? markArea: null,
      }
    ];
  
    options.legend.data = [
      ...options.legend.data, 
      `Sensor ${item} (°C)`
    ];
  }

  return (
    <div className="p-4 md:p-7 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-tq-fg-1">Analysis</h1>
        <p className="font-mono text-[12px] text-tq-fg-3 mt-1">
          SK-0045A · Metal Structure · Pirabeiraba Plant · Curing Oven
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
        <Suspense fallback={<div>Loading...</div>}>
          <CardContent className="px-4 pb-4 pt-0">
            <ReactECharts
              option={options}
              style={{ height: 'clamp(280px, 50vw, 520px)', width: '100%' }}
              lazyUpdate
              />
          </CardContent>
        </Suspense>
      </Card>
    </div>
  )
}
