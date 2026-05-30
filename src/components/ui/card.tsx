import * as React from 'react'
import { cn } from '@/lib/utils'

function Card({ className, ref, ...props }: React.ComponentPropsWithRef<'div'>) {
  return (
    <div
      ref={ref}
      className={cn('bg-white border border-tq-border rounded-lg shadow-xs', className)}
      {...props}
    />
  )
}

function CardHeader({ className, ref, ...props }: React.ComponentPropsWithRef<'div'>) {
  return <div ref={ref} className={cn('flex flex-col gap-1 p-4 pb-0', className)} {...props} />
}

function CardTitle({ className, ref, ...props }: React.ComponentPropsWithRef<'h3'>) {
  return (
    <h3
      ref={ref}
      className={cn('text-[14px] font-semibold text-tq-fg-1 leading-snug', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ref, ...props }: React.ComponentPropsWithRef<'p'>) {
  return (
    <p
      ref={ref}
      className={cn('text-[13px] text-tq-fg-3 leading-normal', className)}
      {...props}
    />
  )
}

function CardContent({ className, ref, ...props }: React.ComponentPropsWithRef<'div'>) {
  return <div ref={ref} className={cn('p-4', className)} {...props} />
}

function CardFooter({ className, ref, ...props }: React.ComponentPropsWithRef<'div'>) {
  return <div ref={ref} className={cn('flex items-center p-4 pt-0', className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
