import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 font-semibold text-[11px] leading-none px-2 py-1 rounded-sm',
  {
    variants: {
      variant: {
        default: 'bg-tq-bg-muted text-tq-fg-2',
        success: 'bg-[#E8F6EE] text-[#0F5132]',
        warning: 'bg-[#FEF3D6] text-[#92670C]',
        danger: 'bg-[#FCE6E7] text-[#B83236]',
        info: 'bg-[#E5EEFC] text-[#1E40AF]',
        brand: 'bg-tq-green-50 text-tq-green-800',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />
}

export { Badge, badgeVariants }
