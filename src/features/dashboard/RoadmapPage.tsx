import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { GOAL_OPTIONS } from '@/features/onboarding/options'
import { ROADMAP_BY_GOAL, currentPhaseIndex } from './roadmap'

export function RoadmapPage() {
  const profile = useAppStore((s) => s.profile)
  const sessions = useAppStore((s) => s.sessions)

  if (!profile || !profile.onboarded) {
    return <Navigate to="/onboarding" replace />
  }

  const phases = ROADMAP_BY_GOAL[profile.goal]
  const activeIndex = currentPhaseIndex(sessions.length)
  const goalLabel = GOAL_OPTIONS.find((o) => o.value === profile.goal)?.label ?? 'your goal'

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 p-6">
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="text-2xl font-semibold text-fg">Your roadmap</h1>
        <p className="mt-1 text-fg-muted">Your path toward {goalLabel.toLowerCase()}</p>
      </motion.header>

      <div className="flex flex-col">
        {phases.map((phase, i) => {
          const isCompleted = i < activeIndex
          const isCurrent = i === activeIndex
          const isLast = i === phases.length - 1

          return (
            <motion.div
              key={phase.name}
              className="flex gap-4"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: i * 0.08, ease: 'easeOut' }}
            >
              <div className="flex flex-col items-center">
                <PhaseNode index={i} isCompleted={isCompleted} isCurrent={isCurrent} />
                {!isLast && (
                  <div
                    className={cn(
                      'min-h-12 w-0.5 flex-1',
                      isCompleted ? 'bg-accent' : 'bg-border',
                    )}
                  />
                )}
              </div>

              <div className={cn('flex flex-col gap-1', !isLast && 'pb-8')}>
                <div className="flex items-center gap-2 pt-1.5">
                  <p
                    className={cn(
                      'font-semibold',
                      isCurrent || isCompleted ? 'text-fg' : 'text-fg-subtle',
                    )}
                  >
                    {phase.name}
                  </p>
                  {isCurrent && (
                    <span className="rounded-full bg-accent-muted px-2 py-0.5 text-xs font-medium text-accent">
                      You are here
                    </span>
                  )}
                </div>
                <p className={cn('text-sm', isCurrent || isCompleted ? 'text-fg-muted' : 'text-fg-subtle')}>
                  {phase.description}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      <Link to="/dashboard">
        <Button variant="secondary" className="w-full">
          Back to dashboard
        </Button>
      </Link>
    </div>
  )
}

function PhaseNode({
  index,
  isCompleted,
  isCurrent,
}: {
  index: number
  isCompleted: boolean
  isCurrent: boolean
}) {
  return (
    <motion.div
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
        isCompleted && 'bg-accent text-accent-fg',
        isCurrent && 'bg-accent text-accent-fg drop-shadow-[0_0_8px_rgba(61,220,132,0.55)]',
        !isCompleted && !isCurrent && 'border border-border bg-bg-elevated text-fg-subtle',
      )}
      animate={isCurrent ? { scale: [1, 1.08, 1] } : undefined}
      transition={isCurrent ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      {isCompleted ? '✓' : index + 1}
    </motion.div>
  )
}
