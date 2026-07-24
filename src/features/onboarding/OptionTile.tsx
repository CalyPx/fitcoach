import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface OptionTileProps {
  selected: boolean
  onClick: () => void
  label: string
  hint?: string
  children?: ReactNode
}

export function OptionTile({ selected, onClick, label, hint, children }: OptionTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'flex w-full items-center justify-between gap-3 rounded-md border px-4 py-3.5 text-left transition-colors duration-150 ease-out',
        selected
          ? 'border-accent bg-accent-muted'
          : 'border-border bg-bg-elevated hover:bg-bg-subtle',
      )}
    >
      <span>
        <span className={cn('block font-medium', selected ? 'text-fg' : 'text-fg')}>
          {label}
        </span>
        {hint && <span className="block text-sm text-fg-muted">{hint}</span>}
      </span>
      {children}
      <span
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
          selected ? 'border-accent bg-accent' : 'border-border',
        )}
      >
        {selected && (
          <svg viewBox="0 0 12 12" className="h-3 w-3 fill-none stroke-accent-fg stroke-2">
            <path d="M2 6l2.5 2.5L10 3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </button>
  )
}
