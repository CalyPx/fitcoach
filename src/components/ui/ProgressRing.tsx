import { motion } from 'framer-motion'
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
}

export function ProgressRing({
  progress,
  size = 96,
  strokeWidth = 8,
  label,
  className,
  ease = 'easeOut',
  durationSeconds = 0.7,
}: ProgressRingProps) {
  const clamped = Math.min(1, Math.max(0, progress))
  const complete = clamped >= 1
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - clamped)

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
          className={cn('fill-none stroke-accent', complete && 'drop-shadow-[0_0_6px_rgba(61,220,132,0.6)]')}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: durationSeconds, ease }}
        />
      </svg>
      <span className="absolute text-sm font-medium text-fg">
        {label ?? `${Math.round(clamped * 100)}%`}
      </span>
    </motion.div>
  )
}
