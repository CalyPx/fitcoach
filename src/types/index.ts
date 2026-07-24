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
