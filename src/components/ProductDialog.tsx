import { useState, useEffect } from 'react'
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Product } from '@/domain/product'

// ── shared form primitives ───────────────────────────────────────────────────

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[11px] font-semibold uppercase tracking-widest text-tq-fg-3 mb-1.5"
    >
      {children}
    </label>
  )
}

const fieldCls = cn(
  'w-full border border-tq-border rounded-md px-3 py-2',
  'text-[13px] text-tq-fg-1 bg-white',
  'focus:outline-none focus:ring-2 focus:ring-tq-green-500/30 focus:border-tq-green-500',
  'transition-colors',
)

function errCls(hasError?: string) {
  return hasError ? 'border-tq-danger focus:border-tq-danger focus:ring-tq-danger/20' : ''
}

function FieldError({ msg }: { msg?: string }) {
  return msg ? <p className="mt-1 text-[11px] text-tq-danger">{msg}</p> : null
}

// ── form values ──────────────────────────────────────────────────────────────

export interface ProductFormValues {
  name: string
  sku: string
  material: string
  dim_d: string
  dim_w: string
  dim_l: string
  weight: string
  surface_area: string
  notes: string
}

function blankForm(): ProductFormValues {
  return { name: '', sku: '', material: '', dim_d: '', dim_w: '', dim_l: '', weight: '', surface_area: '', notes: '' }
}

function productToForm(p: Product): ProductFormValues {
  return {
    name: p.name,
    sku: p.sku,
    material: p.material,
    dim_d: String(p.dimensions.d),
    dim_w: String(p.dimensions.w),
    dim_l: String(p.dimensions.l),
    weight: String(p.weight),
    surface_area: String(p.surface_area),
    notes: p.notes,
  }
}

export function formToProduct(f: ProductFormValues): Omit<Product, 'id'> {
  return {
    name: f.name.trim(),
    sku: f.sku.trim(),
    material: f.material.trim(),
    dimensions: { d: Number(f.dim_d), w: Number(f.dim_w), l: Number(f.dim_l) },
    weight: Number(f.weight),
    surface_area: Number(f.surface_area),
    notes: f.notes.trim(),
  }
}

// ── form dialog ──────────────────────────────────────────────────────────────

interface ProductFormDialogProps {
  mode: 'create' | 'edit'
  product?: Product
  onClose: () => void
  onSubmit: (values: ProductFormValues) => void
}

type Errors = Partial<Record<keyof ProductFormValues, string>>

export function ProductFormDialog({ mode, product, onClose, onSubmit }: ProductFormDialogProps) {
  const [form, setForm] = useState<ProductFormValues>(blankForm)
  const [errors, setErrors] = useState<Errors>({})

  useEffect(() => {
    setForm(mode === 'edit' && product ? productToForm(product) : blankForm())
    setErrors({})
  }, [mode, product])

  function set<K extends keyof ProductFormValues>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function validate(): boolean {
    const next: Errors = {}
    if (!form.name.trim()) next.name = 'Required'
    if (!form.sku.trim()) next.sku = 'Required'
    if (!form.material.trim()) next.material = 'Required'
    if (!form.dim_d || Number(form.dim_d) <= 0) next.dim_d = '> 0'
    if (!form.dim_w || Number(form.dim_w) <= 0) next.dim_w = '> 0'
    if (!form.dim_l || Number(form.dim_l) <= 0) next.dim_l = '> 0'
    if (!form.weight || Number(form.weight) <= 0) next.weight = '> 0'
    if (form.surface_area === '' || Number(form.surface_area) < 0) next.surface_area = '≥ 0'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit() {
    if (validate()) onSubmit(form)
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={mode === 'create' ? 'Add product' : 'Edit product'}
      className="max-w-lg"
    >
      <DialogBody className="flex flex-col gap-4">
        {/* Name */}
        <div>
          <Label htmlFor="p-name">Product name</Label>
          <input
            id="p-name"
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Steel Bracket A40"
            className={cn(fieldCls, errCls(errors.name))}
          />
          <FieldError msg={errors.name} />
        </div>

        {/* SKU + Material */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="p-sku">SKU</Label>
            <input
              id="p-sku"
              type="text"
              value={form.sku}
              onChange={(e) => set('sku', e.target.value)}
              placeholder="BKT-A40-STL"
              className={cn(fieldCls, 'font-mono', errCls(errors.sku))}
            />
            <FieldError msg={errors.sku} />
          </div>
          <div>
            <Label htmlFor="p-material">Material</Label>
            <input
              id="p-material"
              type="text"
              value={form.material}
              onChange={(e) => set('material', e.target.value)}
              placeholder="Carbon Steel"
              className={cn(fieldCls, errCls(errors.material))}
            />
            <FieldError msg={errors.material} />
          </div>
        </div>

        {/* Dimensions D × W × L */}
        <div>
          <Label htmlFor="p-dim-d">Dimensions (mm) — D × W × L</Label>
          <div className="grid grid-cols-3 gap-2">
            {(['dim_d', 'dim_w', 'dim_l'] as const).map((key, i) => (
              <div key={key} className="relative">
                <input
                  id={i === 0 ? 'p-dim-d' : undefined}
                  type="number"
                  min={0}
                  step="any"
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder={['D', 'W', 'L'][i]}
                  className={cn(fieldCls, errCls(errors[key]))}
                />
                <FieldError msg={errors[key]} />
              </div>
            ))}
          </div>
        </div>

        {/* Weight + Surface area */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="p-weight">Weight (kg)</Label>
            <input
              id="p-weight"
              type="number"
              min={0}
              step="any"
              value={form.weight}
              onChange={(e) => set('weight', e.target.value)}
              placeholder="0.45"
              className={cn(fieldCls, 'font-mono', errCls(errors.weight))}
            />
            <FieldError msg={errors.weight} />
          </div>
          <div>
            <Label htmlFor="p-surface">Surface area (m²)</Label>
            <input
              id="p-surface"
              type="number"
              min={0}
              step="any"
              value={form.surface_area}
              onChange={(e) => set('surface_area', e.target.value)}
              placeholder="0.032"
              className={cn(fieldCls, 'font-mono', errCls(errors.surface_area))}
            />
            <FieldError msg={errors.surface_area} />
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="p-notes">Notes</Label>
          <textarea
            id="p-notes"
            rows={3}
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Optional coating instructions, pre-treatment notes…"
            className={cn(fieldCls, 'resize-none leading-relaxed')}
          />
        </div>
      </DialogBody>

      <DialogFooter>
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant="primary" size="sm" onClick={handleSubmit}>
          {mode === 'create' ? 'Add product' : 'Save changes'}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

// ── delete confirm ────────────────────────────────────────────────────────────

interface DeleteProductDialogProps {
  product: Product
  onClose: () => void
  onConfirm: () => void
}

export function DeleteProductDialog({ product, onClose, onConfirm }: DeleteProductDialogProps) {
  return (
    <Dialog open onClose={onClose} title="Remove product">
      <DialogBody>
        <p className="text-[13px] text-tq-fg-2 leading-relaxed">
          Remove{' '}
          <span className="font-semibold text-tq-fg-1">{product.name}</span>{' '}
          <span className="font-mono text-[11px] text-tq-fg-3">({product.sku})</span>?
          This action cannot be undone.
        </p>
      </DialogBody>
      <DialogFooter>
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant="danger" size="sm" onClick={onConfirm}>Remove</Button>
      </DialogFooter>
    </Dialog>
  )
}
