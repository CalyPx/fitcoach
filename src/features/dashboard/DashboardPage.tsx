import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import type { WorkoutSession } from '@/types'
import {
  dailyNutritionTotals,
  lastNDayKeys,
  parseDateKey,
  proteinTargetGrams,
  sessionsInLastDays,
  sessionsOnDay,
  todayKey,
  totalReps,
} from './insights'

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function DashboardPage() {
  const profile = useAppStore((s) => s.profile)
  const sessions = useAppStore((s) => s.sessions)
  const meals = useAppStore((s) => s.meals)

  const now = new Date()
  const dayKeys = lastNDayKeys(7, now)
  const today = todayKey(now)

  const weekSessions = sessionsInLastDays(sessions, 7, now)
  const weekReps = totalReps(weekSessions)
  const weekSessionCount = weekSessions.length

  const proteinToday = dailyNutritionTotals(meals, today).proteinG
  const proteinTarget = profile ? proteinTargetGrams(profile.goal) : 100
  const proteinProgress = proteinTarget > 0 ? proteinToday / proteinTarget : 0

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 p-6">
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="text-2xl font-semibold text-fg">Dashboard</h1>
        <p className="mt-1 text-fg-muted">This week</p>
      </motion.header>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
        <Card className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-wide text-fg-subtle">Workout consistency</p>
          <WeekGrid dayKeys={dayKeys} sessions={sessions} today={today} />
        </Card>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <StatTile label="Sessions this week" value={String(weekSessionCount)} />
        <StatTile label="Reps this week" value={String(weekReps)} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
        <Link to="/meals">
          <Card interactive className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-fg-subtle">Protein today</p>
              <span className="text-sm text-fg-muted">Target: {proteinTarget}g</span>
            </div>

            <div className="flex items-center gap-4">
              <ProgressRing
                progress={proteinProgress}
                size={72}
                strokeWidth={7}
                label={`${Math.round(proteinToday)}g`}
                tone="secondary"
              />
              <p className="flex-1 text-sm text-fg-muted">Log meals in the Meals tab to track this →</p>
            </div>
          </Card>
        </Link>
      </motion.div>
    </div>
  )
}

function WeekGrid({
  dayKeys,
  sessions,
  today,
}: {
  dayKeys: string[]
  sessions: WorkoutSession[]
  today: string
}) {
  const counts = dayKeys.map((key) => sessionsOnDay(sessions, key).length)
  const maxCount = Math.max(1, ...counts)

  return (
    <div className="flex items-end justify-between gap-2">
      {dayKeys.map((key, i) => {
        const count = counts[i]
        const heightPct = count === 0 ? 8 : Math.max(30, (count / maxCount) * 100)
        const isToday = key === today
        const date = parseDateKey(key)
        return (
          <div key={key} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-28 w-full items-end">
              <motion.div
                className={cn(
                  'w-full rounded-t-xl',
                  count > 0 ? 'bg-gradient-to-t from-accent to-accent/10' : 'bg-bg-subtle',
                  isToday && 'ring-1 ring-accent ring-offset-2 ring-offset-bg-elevated',
                )}
                initial={{ height: 6 }}
                animate={{ height: `${heightPct}%` }}
                transition={{ type: 'spring', stiffness: 140, damping: 16, delay: i * 0.05 }}
              />
            </div>
            <span className={cn('text-xs', isToday ? 'font-semibold text-fg' : 'text-fg-subtle')}>
              {WEEKDAY_LABELS[date.getDay()]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Card className="flex flex-col items-center text-center">
      <p className="text-xs uppercase tracking-wide text-fg-subtle">{label}</p>
      <p className="mt-1 font-display text-display-md text-fg">{value}</p>
    </Card>
  )
}
