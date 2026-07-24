export type Goal = 'lose-fat' | 'build-muscle' | 'fix-posture' | 'general-fitness'

export type Equipment = 'none' | 'mat' | 'dumbbells'

export type ExperienceLevel = 'beginner' | 'some-experience' | 'regular'

export interface UserProfile {
  name: string
  goal: Goal
  equipment: Equipment[]
  injuries: string
  experience: ExperienceLevel
  onboarded: boolean
}

export interface WorkoutSession {
  id: string
  exerciseId: string
  completedAt: string // ISO timestamp
  mode: 'rep' | 'hold'
  setsCompleted: number
  repsCompleted: number // 0 for hold-based exercises
  holdSecondsCompleted: number // 0 for rep-based exercises
}

export interface NutritionEstimate {
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}

export interface MealEntry {
  id: string
  dateKey: string // YYYY-MM-DD, local time — see dateKey()/todayKey() in insights.ts
  loggedAt: string // ISO timestamp
  description: string
  /** Small downscaled JPEG data URL for display — never the original full-res photo. */
  thumbnailDataUrl?: string
  source: 'ai' | 'manual'
  estimate: NutritionEstimate
  /** AI's short name for the dish, e.g. "Dal bhat with vegetables". */
  foodLabel?: string
}
