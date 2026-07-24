import { Link, Navigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { GOAL_OPTIONS } from '@/features/onboarding/options'
import { ROADMAP_BY_GOAL, currentPhaseIndex, type RoadmapPhase } from './roadmap'

// Fixed 4-point trail layout — every goal's roadmap has exactly 4 phases
// (see ROADMAP_BY_GOAL), so the ascent geometry is hand-placed rather than
// derived, trading generality for a deliberately shaped winding path.
const TRAIL_POINTS = [
  { x: 62, y: 486 },
  { x: 274, y: 372 },
  { x: 96, y: 224 },
  { x: 288, y: 84 },
]

const TRAIL_PATH = `M ${TRAIL_POINTS[0].x} ${TRAIL_POINTS[0].y}
  C ${TRAIL_POINTS[0].x} 420, 232 440, ${TRAIL_POINTS[1].x} ${TRAIL_POINTS[1].y}
  C 322 310, 54 296, ${TRAIL_POINTS[2].x} ${TRAIL_POINTS[2].y}
  C 128 168, 246 152, ${TRAIL_POINTS[3].x} ${TRAIL_POINTS[3].y}`

export function RoadmapPage() {
  const profile = useAppStore((s) => s.profile)
  const sessions = useAppStore((s) => s.sessions)
  const reduceMotion = useReducedMotion()

  if (!profile || !profile.onboarded) {
    return <Navigate to="/onboarding" replace />
  }

  const phases = ROADMAP_BY_GOAL[profile.goal]
  const activeIndex = currentPhaseIndex(sessions.length)
  const goalLabel = GOAL_OPTIONS.find((o) => o.value === profile.goal)?.label ?? 'your goal'
  const currentPhase = phases[activeIndex]

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 p-6">
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="text-2xl font-semibold text-fg">Your roadmap</h1>
        <p className="mt-1 text-fg-muted">Your path toward {goalLabel.toLowerCase()}</p>
      </motion.header>

      <svg
        viewBox="0 0 360 560"
        className="w-full"
        role="img"
        aria-label={`Ascent toward ${goalLabel}: currently on ${currentPhase.name}, phase ${activeIndex + 1} of ${phases.length}`}
      >
        <motion.path
          d={TRAIL_PATH}
          fill="none"
          className="stroke-border"
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={reduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.3, ease: 'easeInOut' }}
        />

        {phases.map((phase, i) => {
          const point = TRAIL_POINTS[i]
          const isCompleted = i < activeIndex
          const isCurrent = i === activeIndex
          const delay = reduceMotion ? 0 : 0.3 + i * 0.18

          return (
            <g key={phase.name}>
              {isCurrent && (
                <motion.circle
                  cx={point.x}
                  cy={point.y}
                  r={26}
                  className="fill-accent/25"
                  initial={{ opacity: 0.6, scale: 0.85 }}
                  animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.15, 0.9] }}
                  transition={{ duration: 2.6, repeat: reduceMotion ? 0 : Infinity, ease: 'easeInOut' }}
                />
              )}

              <motion.g
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.7 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, delay, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <Peak point={point} state={isCurrent ? 'current' : isCompleted ? 'completed' : 'upcoming'} />
              </motion.g>

              <motion.text
                x={point.x}
                y={point.y + (isCurrent ? 46 : 38)}
                textAnchor="middle"
                className={cn(
                  'font-sans text-[12px]',
                  isCurrent || isCompleted ? 'fill-fg font-medium' : 'fill-fg-subtle',
                )}
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: delay + 0.15 }}
              >
                {phase.name}
              </motion.text>

              {isCurrent && (
                <motion.text
                  x={point.x}
                  y={point.y - 34}
                  textAnchor="middle"
                  className="fill-accent text-[10px] font-semibold uppercase tracking-wide"
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: delay + 0.25 }}
                >
                  You are here
                </motion.text>
              )}
            </g>
          )
        })}
      </svg>

      <Card className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-accent-muted px-2 py-0.5 text-xs font-medium text-accent">
            Current phase
          </span>
        </div>
        <p className="font-display text-display-md text-fg">{currentPhase.name}</p>
        <p className="text-sm text-fg-muted">{currentPhase.description}</p>
      </Card>

      <div className="flex flex-col gap-2">
        {phases.map((phase, i) => (
          <PhaseRow key={phase.name} phase={phase} isCurrent={i === activeIndex} isCompleted={i < activeIndex} />
        ))}
      </div>

      <Link to="/dashboard">
        <Button variant="secondary" className="w-full">
          Back to dashboard
        </Button>
      </Link>
    </div>
  )
}

function Peak({ point, state }: { point: { x: number; y: number }; state: 'completed' | 'current' | 'upcoming' }) {
  const { x, y } = point
  const scale = state === 'current' ? 1.25 : 1
  const apex = y - 16 * scale
  const baseY = y + 10 * scale
  const spread = 18 * scale
  const d = `M ${x} ${apex} L ${x + spread} ${baseY} L ${x - spread} ${baseY} Z`

  if (state === 'upcoming') {
    return <path d={d} className="fill-none stroke-border" strokeWidth={2} strokeLinejoin="round" />
  }

  return (
    <path
      d={d}
      className={cn('stroke-none', state === 'current' ? 'fill-accent drop-shadow-[0_0_10px_rgba(255,157,77,0.65)]' : 'fill-accent/70')}
    />
  )
}

function PhaseRow({
  phase,
  isCurrent,
  isCompleted,
}: {
  phase: RoadmapPhase
  isCurrent: boolean
  isCompleted: boolean
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-bg-elevated/60 px-3 py-2">
      <span
        className={cn(
          'h-1.5 w-1.5 shrink-0 rounded-full',
          isCurrent || isCompleted ? 'bg-accent' : 'bg-fg-subtle',
        )}
      />
      <p className={cn('text-sm', isCurrent ? 'font-medium text-fg' : 'text-fg-subtle')}>
        {phase.name} <span className="text-fg-subtle">— {phase.description}</span>
      </p>
    </div>
  )
}
