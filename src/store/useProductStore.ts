import { create } from 'zustand'
import { productRepository, nextProductId } from '@/infrastructure/productRepository'
import type { Product } from '@/domain/product'

interface ProductStore {
  products: Product[]
  createProduct(data: Omit<Product, 'id'>): void
  updateProduct(id: string, patch: Partial<Omit<Product, 'id'>>): void
  removeProduct(id: string): void
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: productRepository.getAll(),

  createProduct(data) {
    const product: Product = { ...data, id: nextProductId(get().products) }
    productRepository.create(product)
    set((s) => ({ products: [...s.products, product] }))
  },

  updateProduct(id, patch) {
    productRepository.update(id, patch)
    set((s) => ({
      products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }))
  },

  removeProduct(id) {
    productRepository.remove(id)
    set((s) => ({ products: s.products.filter((p) => p.id !== id) }))
  },
}))
