import * as React from 'react'
import { cn } from '@/lib/utils'

function Table({ className, ref, ...props }: React.ComponentPropsWithRef<'table'>) {
  return (
    <div className="relative w-full overflow-auto">
      <table ref={ref} className={cn('w-full caption-bottom text-[13px]', className)} {...props} />
    </div>
  )
}

function TableHeader({ className, ref, ...props }: React.ComponentPropsWithRef<'thead'>) {
  return (
    <thead
      ref={ref}
      className={cn('[&_tr]:border-b [&_tr]:border-tq-border', className)}
      {...props}
    />
  )
}

function TableBody({ className, ref, ...props }: React.ComponentPropsWithRef<'tbody'>) {
  return (
    <tbody
      ref={ref}
      className={cn('[&_tr:last-child]:border-0 [&_tr]:border-b [&_tr]:border-tq-divider', className)}
      {...props}
    />
  )
}

function TableRow({ className, ref, ...props }: React.ComponentPropsWithRef<'tr'>) {
  return (
    <tr
      ref={ref}
      className={cn(
        'transition-colors hover:bg-tq-bg-soft data-[state=selected]:bg-tq-bg-soft',
        className,
      )}
      {...props}
    />
  )
}

function TableHead({ className, ref, ...props }: React.ComponentPropsWithRef<'th'>) {
  return (
    <th
      ref={ref}
      className={cn(
        'h-10 px-4 py-2.5 text-left align-middle text-[11px] font-semibold uppercase tracking-widest text-tq-fg-3',
        className,
      )}
      {...props}
    />
  )
}

function TableCell({ className, ref, ...props }: React.ComponentPropsWithRef<'td'>) {
  return <td ref={ref} className={cn('px-4 py-3 align-middle', className)} {...props} />
}

function TableCaption({ className, ref, ...props }: React.ComponentPropsWithRef<'caption'>) {
  return (
    <caption ref={ref} className={cn('mt-4 text-sm text-tq-fg-3', className)} {...props} />
  )
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption }
