import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tq-green-500 focus-visible:ring-offset-1 disabled:opacity-40 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary:
          'bg-tq-green-500 text-white border border-transparent rounded-md hover:bg-tq-green-600 active:bg-tq-green-700',
        secondary:
          'bg-white text-tq-fg-1 border border-tq-border rounded-md hover:bg-tq-bg-soft active:bg-tq-bg-muted',
        ghost:
          'bg-transparent text-tq-fg-2 border border-transparent rounded-md hover:bg-tq-bg-muted hover:text-tq-fg-1',
        danger:
          'bg-tq-danger text-white border border-transparent rounded-md hover:opacity-90',
      },
      size: {
        sm: 'text-[12px] px-2.5 py-1.5',
        md: 'text-[13px] px-3 py-[9px]',
        lg: 'text-[14px] px-4 py-2.5',
        icon: 'w-8 h-8 text-[13px]',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends React.ComponentPropsWithRef<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

function Button({ className, variant, size, asChild = false, ref, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref as React.Ref<HTMLButtonElement>}
      {...props}
    />
  )
}

export { Button, buttonVariants }
