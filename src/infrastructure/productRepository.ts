import type { Product } from '@/domain/product'
import { createLocalStorageDb } from './localStorageDb'

const db = createLocalStorageDb<Product>('termiq:products')

const SEED_PRODUCTS: Product[] = [
  {
    id: 'PRD-001', name: 'Steel Bracket A40', sku: 'BKT-A40-STL', material: 'Carbon Steel',
    dimensions: { d: 40, w: 60, l: 120 }, weight: 0.45, surface_area: 0.032,
    notes: 'Punched holes — deburr before coating',
  },
  {
    id: 'PRD-002', name: 'Aluminum Panel 300', sku: 'PNL-300-ALU', material: 'Aluminum 6061',
    dimensions: { d: 2, w: 300, l: 500 }, weight: 0.81, surface_area: 0.310,
    notes: 'Anodized base — re-coat on request only',
  },
  {
    id: 'PRD-003', name: 'Mild Steel Sheet 2040', sku: 'SHT-MS-2040', material: 'Mild Steel',
    dimensions: { d: 3, w: 200, l: 400 }, weight: 1.88, surface_area: 0.165,
    notes: '',
  },
  {
    id: 'PRD-004', name: 'Galvanized Enclosure Lid', sku: 'LID-GV-4060', material: 'Galvanized Steel',
    dimensions: { d: 5, w: 400, l: 600 }, weight: 3.40, surface_area: 0.520,
    notes: 'Pre-treat with adhesion primer',
  },
]

function ensureSeeded(): void {
  if (db.findAll().length === 0) SEED_PRODUCTS.forEach((p) => db.create(p))
}

export function nextProductId(existing: Product[]): string {
  const nums = existing
    .map((p) => parseInt(p.id.replace('PRD-', ''), 10))
    .filter((n) => !isNaN(n))
  const next = nums.length ? Math.max(...nums) + 1 : 1
  return `PRD-${String(next).padStart(3, '0')}`
}

export const productRepository = {
  getAll(): Product[] {
    ensureSeeded()
    return db.findAll()
  },
  create(product: Product): void {
    db.create(product)
  },
  update(id: string, patch: Partial<Product>): void {
    db.update(id, patch)
  },
  remove(id: string): void {
    db.remove(id)
  },
}
