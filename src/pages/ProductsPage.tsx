import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Package, Layers, Weight, Maximize2, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ProductFormDialog, DeleteProductDialog, formToProduct, type ProductFormValues } from '@/components/ProductDialog'
import { useProducts } from '@/application/useProducts'
import { useCycles } from '@/application/useCycles'
import type { Product } from '@/domain/product'
import type { Cycle } from '@/domain/cycle'

// ── linked cycles indicator ───────────────────────────────────────────────────

function ProductCycles({ cycles }: { cycles: Cycle[] }) {
  if (cycles.length === 0) {
    return <span className="text-[12px] text-tq-fg-4">—</span>
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-tq-bg-soft border border-tq-divider font-mono text-[11px] text-tq-fg-2"
      title={cycles.map((c) => `${c.id} · ${c.start}`).join('\n')}
    >
      <RefreshCw size={11} className="text-tq-fg-4" />
      {cycles.length}
    </span>
  )
}

// ── dialog state ──────────────────────────────────────────────────────────────

type DialogState =
  | { type: 'create' }
  | { type: 'edit'; product: Product }
  | { type: 'delete'; product: Product }
  | null

// ── page ──────────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const { t } = useTranslation()
  const {
    products, totalCount, uniqueMaterials, avgWeight, avgSurfaceArea,
    createProduct, updateProduct, removeProduct,
  } = useProducts()
  const { cycles } = useCycles()

  const cyclesByProductId = useMemo(() => {
    const map = new Map<string, Cycle[]>()
    for (const c of cycles) {
      if (!c.productId) continue
      const list = map.get(c.productId)
      if (list) list.push(c)
      else map.set(c.productId, [c])
    }
    return map
  }, [cycles])

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
    { labelKey: 'products.kpiTotal',      value: String(totalCount),                                    icon: Package,   color: 'text-tq-green-600'  },
    { labelKey: 'products.kpiMaterials',  value: String(uniqueMaterials),                               icon: Layers,    color: 'text-tq-fg-3'       },
    { labelKey: 'products.kpiAvgWeight',  value: totalCount ? `${avgWeight} kg` : '—',                  icon: Weight,    color: 'text-tq-series-2'   },
    { labelKey: 'products.kpiAvgSurface', value: totalCount ? `${avgSurfaceArea} m²` : '—',             icon: Maximize2, color: 'text-tq-heat-500'   },
  ]

  const tableHeaders = [
    t('products.colProduct'), t('products.colSku'), t('products.colMaterial'),
    t('products.colDimensions'), t('products.colWeight'), t('products.colSurface'),
    t('products.colCycles'), t('products.colNotes'), '',
  ]

  return (
    <div className="p-4 md:p-7 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-tq-fg-1">{t('products.title')}</h1>
          <p className="font-mono text-[12px] text-tq-fg-3 mt-1">{t('products.subtitle')}</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setDialog({ type: 'create' })}>
          <Plus size={14} />
          {t('products.addProduct')}
        </Button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ labelKey, value, icon: Icon, color }) => (
          <Card key={labelKey}>
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`mt-0.5 ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <div className="font-mono text-[22px] font-semibold text-tq-fg-1 leading-none">
                  {value}
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-tq-fg-3 mt-1.5">
                  {t(labelKey)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Product table */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle>{t('products.allProducts')}</CardTitle>
          <CardDescription>{t('products.allProductsDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-tq-bg-soft hover:bg-tq-bg-soft">
                {tableHeaders.map((h, i) => (
                  <TableHead key={i}>{h}</TableHead>
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
                  <TableCell>
                    <ProductCycles cycles={cyclesByProductId.get(product.id) ?? []} />
                  </TableCell>
                  <TableCell className="text-[12px] text-tq-fg-3 max-w-[200px] truncate">
                    {product.notes || <span className="text-tq-fg-4 italic">—</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t('products.ariaEdit')}
                        onClick={() => setDialog({ type: 'edit', product })}
                      >
                        <Pencil size={13} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t('products.ariaRemove')}
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
                  <TableCell colSpan={9} className="py-12 text-center text-[13px] text-tq-fg-3">
                    {t('products.noProducts')}
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
