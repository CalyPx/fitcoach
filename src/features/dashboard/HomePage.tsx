import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { useAppStore } from '@/lib/store'
import {
  calorieTargetKcal,
  computeStreak,
  dailyNutritionTotals,
  recommendExercise,
  sessionsOnDay,
  todayKey,
  totalReps,
  totalSets,
} from './insights'

function getGreeting(date: Date): string {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function HomePage() {
  const profile = useAppStore((s) => s.profile)
  const sessions = useAppStore((s) => s.sessions)
  const meals = useAppStore((s) => s.meals)

  if (!profile || !profile.onboarded) {
    return <Navigate to="/onboarding" replace />
  }

  const now = new Date()
  const greeting = getGreeting(now)
  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const streak = computeStreak(sessions, now)
  const todaysSessions = sessionsOnDay(sessions, todayKey(now))
  const setsToday = totalSets(todaysSessions)
  const repsToday = totalReps(todaysSessions)

  const nextExercise = recommendExercise(profile.goal, sessions)
  const dailyTargetSets = nextExercise.targetSets
  const ringProgress = dailyTargetSets > 0 ? setsToday / dailyTargetSets : 0

  const nutritionToday = dailyNutritionTotals(meals, todayKey(now))
  const calorieTarget = calorieTargetKcal(profile.goal)
  const calorieProgress = calorieTarget > 0 ? nutritionToday.calories / calorieTarget : 0

  const workoutTarget =
    nextExercise.mode === 'rep'
      ? `${nextExercise.targetSets} sets × ${nextExercise.targetReps} reps`
      : `${nextExercise.targetSets} sets × ${nextExercise.targetHoldSeconds}s hold`

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 p-6">
      <motion.header
        className="flex items-start justify-between"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div>
          <h1 className="text-2xl font-semibold text-fg">
            {greeting}, {profile.name || 'there'}
          </h1>
          <p className="mt-1 text-fg-muted">{dateLabel}</p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 rounded-full border border-accent-secondary/25 bg-accent-secondary-muted px-3 py-1.5 text-sm text-accent-secondary">
            <span aria-label={`${streak}-day streak`}>🔥</span>
            <span className="font-display text-display-sm">{streak}</span>
          </div>
        )}
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.05, ease: 'easeOut' }}
      >
        <Card className="flex flex-col items-center gap-5 py-8 text-center">
          <p className="text-xs uppercase tracking-wide text-fg-subtle">Today's progress</p>
          <ProgressRing
            progress={ringProgress}
            size={196}
            strokeWidth={14}
            label={`${setsToday}/${dailyTargetSets}`}
            hero
          />
          <p className="text-sm text-fg-muted">sets completed · {repsToday} reps today</p>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
      >
        <Link to={`/workout/${nextExercise.id}`}>
          <Card interactive className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-fg-subtle">Today's workout</p>
              <span className="text-accent">→</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-fg">{nextExercise.name}</h2>
              <p className="mt-1 text-fg-muted">{workoutTarget}</p>
            </div>
            <p className="text-sm text-fg-subtle">{nextExercise.cues[0]}</p>
          </Card>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.12, ease: 'easeOut' }}
      >
        <Link to="/meals">
          <Card interactive className="flex items-center gap-4">
            <ProgressRing
              progress={calorieProgress}
              size={64}
              strokeWidth={6}
              label={`${Math.round(nutritionToday.calories)}`}
              tone="secondary"
            />
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wide text-fg-subtle">Nutrition today</p>
              <p className="mt-1 font-medium text-fg">
                {Math.round(nutritionToday.proteinG)}g protein · {Math.round(nutritionToday.calories)} kcal
              </p>
              <p className="text-sm text-fg-subtle">Tap to log a meal</p>
            </div>
          </Card>
        </Link>
      </motion.div>

      <motion.div
        className="flex flex-col gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Link to="/dashboard">
          <Button variant="secondary" className="w-full">
            View dashboard
          </Button>
        </Link>
        <Link to="/onboarding">
          <Button variant="ghost" size="sm" className="w-full">
            Redo onboarding
          </Button>
        </Link>
      </motion.div>
    </div>
  )
}
