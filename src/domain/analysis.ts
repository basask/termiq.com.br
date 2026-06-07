export interface Kpi {
  label: string
  value: string
  delta: string
  deltaOk: boolean
}

export interface Analysis {
  id: string
  name: string
  cycleId: string
  createdAt: string
}
