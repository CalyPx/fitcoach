import type { Goal, MealEntry, NutritionEstimate, WorkoutSession } from '@/types'
import { EXERCISES, type ExerciseConfig } from '@/features/pose-detection/exercises'

/** Local YYYY-MM-DD — deliberately not UTC, so "today" matches the user's wall clock. */
export function dateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayKey(now: Date = new Date()): string {
  return dateKey(now)
}

/** Parses a "YYYY-MM-DD" key back into a local Date — `new Date(key)` parses as UTC and can land on the wrong weekday. */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function sessionsOnDay(sessions: WorkoutSession[], key: string): WorkoutSession[] {
  return sessions.filter((s) => dateKey(new Date(s.completedAt)) === key)
}

/**
 * Consecutive-day streak of completed sessions. Counts today if a session
 * is already logged; otherwise starts from yesterday so the streak doesn't
 * drop to zero simply because today isn't over yet.
 */
export function computeStreak(sessions: WorkoutSession[], now: Date = new Date()): number {
  const days = new Set(sessions.map((s) => dateKey(new Date(s.completedAt))))
  const cursor = new Date(now)
  if (!days.has(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
  }
  let streak = 0
  while (days.has(dateKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

/** Last N days as local date keys, oldest first — e.g. for a 7-day consistency grid. */
export function lastNDayKeys(days: number, now: Date = new Date()): string[] {
  const keys: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    keys.push(dateKey(d))
  }
  return keys
}

export function sessionsInLastDays(
  sessions: WorkoutSession[],
  days: number,
  now: Date = new Date(),
): WorkoutSession[] {
  const keys = new Set(lastNDayKeys(days, now))
  return sessions.filter((s) => keys.has(dateKey(new Date(s.completedAt))))
}

export function totalSets(sessions: WorkoutSession[]): number {
  return sessions.reduce((sum, s) => sum + s.setsCompleted, 0)
}

export function totalReps(sessions: WorkoutSession[]): number {
  return sessions.reduce((sum, s) => sum + s.repsCompleted, 0)
}

/**
 * Which exercise to recommend today, based on onboarding goal. Cycles
 * through a short goal-appropriate rotation so it's not the same exercise
 * every single day — advances one step per completed session.
 */
const GOAL_EXERCISE_ROTATION: Record<Goal, string[]> = {
  'lose-fat': ['squats', 'lunges', 'pushups'],
  'build-muscle': ['pushups', 'squats', 'lunges'],
  'fix-posture': ['plank', 'squats'],
  'general-fitness': ['squats', 'pushups', 'plank'],
}

export function recommendExercise(goal: Goal, sessions: WorkoutSession[]): ExerciseConfig {
  const rotation = GOAL_EXERCISE_ROTATION[goal]
  const id = rotation[sessions.length % rotation.length]
  return EXERCISES[id]
}

/** Rough daily protein target in grams. Not personalized to bodyweight — onboarding doesn't collect it — just a goal-shaped ballpark. */
export function proteinTargetGrams(goal: Goal): number {
  switch (goal) {
    case 'build-muscle':
      return 150
    case 'lose-fat':
      return 120
    case 'fix-posture':
      return 90
    case 'general-fitness':
      return 100
  }
}

/** Rough daily calorie target — same goal-shaped ballpark approach as proteinTargetGrams. */
export function calorieTargetKcal(goal: Goal): number {
  switch (goal) {
    case 'build-muscle':
      return 2400
    case 'lose-fat':
      return 1800
    case 'fix-posture':
      return 2000
    case 'general-fitness':
      return 2100
  }
}

export function mealsOnDay(meals: MealEntry[], key: string): MealEntry[] {
  return meals.filter((m) => m.dateKey === key)
}

export function dailyNutritionTotals(meals: MealEntry[], key: string): NutritionEstimate {
  return mealsOnDay(meals, key).reduce<NutritionEstimate>(
    (sum, m) => ({
      calories: sum.calories + m.estimate.calories,
      proteinG: sum.proteinG + m.estimate.proteinG,
      carbsG: sum.carbsG + m.estimate.carbsG,
      fatG: sum.fatG + m.estimate.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  )
}
