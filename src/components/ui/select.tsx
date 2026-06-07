import { cn } from '@/lib/utils'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'w-full rounded-md border border-tq-border bg-white px-2.5 py-1.5 text-[13px] text-tq-fg-1',
        'focus:outline-none focus:ring-2 focus:ring-tq-green-500 focus:ring-offset-1',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
