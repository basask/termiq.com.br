import { useProductStore } from '@/store/useProductStore'
import type { Product } from '@/domain/product'

interface ProductsViewModel {
  products: Product[]
  totalCount: number
  uniqueMaterials: number
  avgWeight: string
  avgSurfaceArea: string
  createProduct: (data: Omit<Product, 'id'>) => void
  updateProduct: (id: string, patch: Partial<Omit<Product, 'id'>>) => void
  removeProduct: (id: string) => void
}

export function useProducts(): ProductsViewModel {
  const { products, createProduct, updateProduct, removeProduct } = useProductStore()

  const uniqueMaterials = new Set(products.map((p) => p.material)).size

  const avgWeight =
    products.length
      ? (products.reduce((s, p) => s + p.weight, 0) / products.length).toFixed(2)
      : '—'

  const avgSurfaceArea =
    products.length
      ? (products.reduce((s, p) => s + p.surface_area, 0) / products.length).toFixed(3)
      : '—'

  return {
    products,
    totalCount: products.length,
    uniqueMaterials,
    avgWeight,
    avgSurfaceArea,
    createProduct,
    updateProduct,
    removeProduct,
  }
}
