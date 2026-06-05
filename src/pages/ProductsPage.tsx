import { useState } from 'react'
import { Package, Layers, Weight, Maximize2, Plus, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ProductFormDialog, DeleteProductDialog, formToProduct, type ProductFormValues } from '@/components/ProductDialog'
import { useProducts } from '@/application/useProducts'
import type { Product } from '@/domain/product'

// ── dialog state ──────────────────────────────────────────────────────────────

type DialogState =
  | { type: 'create' }
  | { type: 'edit'; product: Product }
  | { type: 'delete'; product: Product }
  | null

// ── page ──────────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const {
    products, totalCount, uniqueMaterials, avgWeight, avgSurfaceArea,
    createProduct, updateProduct, removeProduct,
  } = useProducts()

  const [dialog, setDialog] = useState<DialogState>(null)

  function handleFormSubmit(values: ProductFormValues) {
    const data = formToProduct(values)
    if (dialog?.type === 'create') createProduct(data)
    else if (dialog?.type === 'edit') updateProduct(dialog.product.id, data)
    setDialog(null)
  }

  function handleDelete() {
    if (dialog?.type === 'delete') removeProduct(dialog.product.id)
    setDialog(null)
  }

  const kpis = [
    { label: 'Total products', value: String(totalCount), icon: Package, color: 'text-tq-green-600' },
    { label: 'Materials', value: String(uniqueMaterials), icon: Layers, color: 'text-tq-fg-3' },
    { label: 'Avg weight', value: totalCount ? `${avgWeight} kg` : '—', icon: Weight, color: 'text-tq-series-2' },
    { label: 'Avg surface', value: totalCount ? `${avgSurfaceArea} m²` : '—', icon: Maximize2, color: 'text-tq-heat-500' },
  ]

  return (
    <div className="p-4 md:p-7 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-tq-fg-1">Products</h1>
          <p className="font-mono text-[12px] text-tq-fg-3 mt-1">
            Product catalog · Pirabeiraba Plant
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setDialog({ type: 'create' })}>
          <Plus size={14} />
          Add product
        </Button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`mt-0.5 ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <div className="font-mono text-[22px] font-semibold text-tq-fg-1 leading-none">
                  {value}
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-tq-fg-3 mt-1.5">
                  {label}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Product table */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle>All products</CardTitle>
          <CardDescription>Catalog of parts processed through the curing oven</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-tq-bg-soft hover:bg-tq-bg-soft">
                {['Product', 'SKU', 'Material', 'Dimensions (mm)', 'Weight', 'Surface area', 'Notes', ''].map((h) => (
                  <TableHead key={h}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-semibold text-tq-fg-1 min-w-[160px]">
                    {product.name}
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-tq-fg-3">
                    {product.sku}
                  </TableCell>
                  <TableCell className="text-tq-fg-2">{product.material}</TableCell>
                  <TableCell className="font-mono text-[12px] text-tq-fg-1 whitespace-nowrap">
                    {product.dimensions.d} × {product.dimensions.w} × {product.dimensions.l}
                  </TableCell>
                  <TableCell className="font-mono text-tq-fg-1 whitespace-nowrap">
                    {product.weight} kg
                  </TableCell>
                  <TableCell className="font-mono text-tq-fg-1 whitespace-nowrap">
                    {product.surface_area} m²
                  </TableCell>
                  <TableCell className="text-[12px] text-tq-fg-3 max-w-[200px] truncate">
                    {product.notes || <span className="text-tq-fg-4 italic">—</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Edit product"
                        onClick={() => setDialog({ type: 'edit', product })}
                      >
                        <Pencil size={13} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Remove product"
                        className="text-tq-danger hover:text-tq-danger hover:bg-red-50"
                        onClick={() => setDialog({ type: 'delete', product })}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-[13px] text-tq-fg-3">
                    No products yet. Add the first one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialogs */}
      {(dialog?.type === 'create' || dialog?.type === 'edit') && (
        <ProductFormDialog
          mode={dialog.type}
          product={dialog.type === 'edit' ? dialog.product : undefined}
          onClose={() => setDialog(null)}
          onSubmit={handleFormSubmit}
        />
      )}

      {dialog?.type === 'delete' && (
        <DeleteProductDialog
          product={dialog.product}
          onClose={() => setDialog(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}
