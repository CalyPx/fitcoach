import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /** Adds hover/active lift for cards that act as tap targets (e.g. a card wrapped in a Link). */
  interactive?: boolean
}

export function Card({ className, children, interactive, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-bg-elevated p-6',
        'shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_20px_40px_-24px_rgba(0,0,0,0.65)]',
        interactive &&
          'transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_24px_48px_-20px_rgba(0,0,0,0.7)] active:translate-y-0',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
