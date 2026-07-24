import { squats } from './squats'
import { pushups } from './pushups'
import { lunges } from './lunges'
import { plank } from './plank'
import type { ExerciseConfig } from './types'

export const EXERCISES: Record<string, ExerciseConfig> = {
  squats,
  pushups,
  lunges,
  plank,
}

export function getExercise(id: string | undefined): ExerciseConfig | null {
  if (!id) return null
  return EXERCISES[id] ?? null
}

export type { ExerciseConfig, RepBasedExercise, HoldBasedExercise } from './types'
