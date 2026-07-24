import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressRingProps {
  progress: number // 0–1
  size?: number
  strokeWidth?: number
  label?: string
  className?: string
  /** Stroke sweep timing — defaults suit one-shot reveals; a ticking countdown looks smoother as 'linear'. */
  ease?: 'easeOut' | 'linear'
  durationSeconds?: number
  /** primary = marigold (the day's main goal); secondary = teal (supporting metrics like protein). */
  tone?: 'primary' | 'secondary'
  /** Renders the numeric label in the display face at a larger weight — for hero placements. */
  hero?: boolean
}

const TONE_STYLES = {
  primary: {
    stroke: 'stroke-accent',
    glow: 'drop-shadow-[0_0_6px_rgba(255,157,77,0.6)]',
    ambient: 'rgba(255,157,77,0.35)',
  },
  secondary: {
    stroke: 'stroke-accent-secondary',
    glow: 'drop-shadow-[0_0_6px_rgba(62,207,196,0.6)]',
    ambient: 'rgba(62,207,196,0.35)',
  },
} as const

export function ProgressRing({
  progress,
  size = 96,
  strokeWidth = 8,
  label,
  className,
  ease = 'easeOut',
  durationSeconds = 0.7,
  tone = 'primary',
  hero = false,
}: ProgressRingProps) {
  const reduceMotion = useReducedMotion()
  const clamped = Math.min(1, Math.max(0, progress))
  const complete = clamped >= 1
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - clamped)
  const toneStyle = TONE_STYLES[tone]

  return (
    <motion.div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={
        complete
          ? { opacity: 1, scale: [1, 1.04, 1] }
          : { opacity: 1, scale: 1 }
      }
      transition={
        complete
          ? { scale: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } }
          : { duration: 0.4, ease: 'easeOut' }
      }
    >
      {clamped > 0 && !reduceMotion && (
        <motion.div
          aria-hidden
          className="absolute inset-0 -z-10 rounded-full blur-2xl"
          style={{ background: `radial-gradient(circle, ${toneStyle.ambient}, transparent 70%)` }}
          animate={{ opacity: [0.5, 0.9, 0.5], scale: [0.92, 1.06, 0.92] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-bg-subtle"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="round"
          className={cn('fill-none', toneStyle.stroke, complete && toneStyle.glow)}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: durationSeconds, ease }}
        />
      </svg>
      <span
        className={cn(
          hero ? 'font-display text-display-lg text-fg' : 'text-sm font-medium text-fg',
          'absolute',
        )}
      >
        {label ?? `${Math.round(clamped * 100)}%`}
      </span>
    </motion.div>
  )
}
