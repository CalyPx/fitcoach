import { useEffect, useRef, type ReactNode } from 'react'
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface OptionTileProps {
  selected: boolean
  onClick: () => void
  label: string
  hint?: string
  children?: ReactNode
}

export function OptionTile({ selected, onClick, label, hint, children }: OptionTileProps) {
  const reduceMotion = useReducedMotion()
  const controls = useAnimationControls()
  const wasSelected = useRef(selected)

  // Bounce only on the false -> true transition, never on incidental
  // re-renders (e.g. a sibling input changing) while already selected.
  useEffect(() => {
    if (selected && !wasSelected.current && !reduceMotion) {
      controls.start({ scale: [1, 1.045, 1], transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] } })
    }
    wasSelected.current = selected
  }, [selected, reduceMotion, controls])

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      whileTap={{ scale: 0.98 }}
      animate={controls}
      className={cn(
        'flex w-full items-center justify-between gap-3 rounded-md border px-4 py-3.5 text-left transition-colors duration-300 ease-out',
        selected
          ? 'border-accent bg-accent'
          : 'border-border bg-bg-elevated hover:bg-bg-subtle',
      )}
    >
      <span>
        <span className={cn('block font-medium', selected ? 'text-accent-fg' : 'text-fg')}>
          {label}
        </span>
        {hint && (
          <span className={cn('block text-sm', selected ? 'text-accent-fg/70' : 'text-fg-muted')}>
            {hint}
          </span>
        )}
      </span>
      {children}
      <span
        className={cn(
          'relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
          selected ? 'border-accent-fg/20 bg-accent-fg' : 'border-border',
        )}
      >
        <AnimatePresence>
          {selected && (
            <motion.svg
              viewBox="0 0 12 12"
              className="h-3 w-3 fill-none stroke-accent stroke-2"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
              transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <path d="M2 6l2.5 2.5L10 3" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          )}
        </AnimatePresence>
      </span>
    </motion.button>
  )
}
