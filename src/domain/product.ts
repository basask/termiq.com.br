export interface Dimensions {
  d: number
  w: number
  l: number
}

export interface Product {
  id: string
  name: string
  sku: string
  material: string
  dimensions: Dimensions
  weight: number
  surface_area: number
  notes: string
}
