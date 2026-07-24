import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
  /** Pulsing accent glow for the one obvious next action on a screen — use sparingly. */
  glow?: boolean
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-accent text-accent-fg hover:opacity-90 active:opacity-80',
  secondary:
    'bg-bg-subtle text-fg border border-border hover:bg-bg-elevated active:opacity-80',
  ghost: 'text-fg-muted hover:text-fg hover:bg-bg-subtle active:opacity-80',
}

const sizeStyles: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-base',
  lg: 'h-13 px-6 text-lg',
}

export function Button({
  variant = 'primary',
  size = 'md',
  glow = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-150 ease-out disabled:opacity-40 disabled:pointer-events-none',
        variantStyles[variant],
        sizeStyles[size],
        glow && variant === 'primary' && 'btn-glow',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
