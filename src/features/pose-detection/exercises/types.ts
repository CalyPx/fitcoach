import type { LandmarkTriple } from '../landmarks'

/** A single angle to track, measured at the middle joint, averaged across left/right sides. */
export interface TrackedAngle {
  label: string
  left: LandmarkTriple
  right: LandmarkTriple
}

/**
 * Thresholds driving the generic 4-phase rep cycle: top -> descending -> bottom -> ascending -> top.
 * All in degrees. Deliberate gaps between them give hysteresis (see RepEngine) so single-frame
 * jitter can't flip the phase back and forth.
 */
export interface RepPhaseThresholds {
  topAngle: number // above this: joint is extended, counts as "top" of the rep
  descendAngle: number // below this while at top: rep has started
  bottomAngle: number // below this while descending: at the bottom of the rep
  ascendAngle: number // above this while at bottom: coming back up
  goodDepthAngle: number // bottom-of-rep angle must reach this to count as good depth
}

export type RepFeedbackKey = 'idle' | 'descending' | 'ascending' | 'goodDepth' | 'shallow'

export type RepFeedbackPhrases = Record<RepFeedbackKey, string[]>

export interface RepBasedExercise {
  id: string
  name: string
  mode: 'rep'
  cues: string[]
  targetReps: number
  targetSets: number
  restSeconds: number
  primaryAngle: TrackedAngle
  thresholds: RepPhaseThresholds
  feedback: RepFeedbackPhrases
}

/**
 * Hold-based form check: a single angle at the "hinge" joint (e.g. the hip
 * in a plank), plus the two flanking landmarks used to tell which direction
 * the form is breaking (too high vs too low) when the angle drops out of range.
 */
export interface HoldForm {
  label: string
  left: LandmarkTriple
  right: LandmarkTriple
  goodFormMinAngle: number // angle at/above this = good form
}

export type HoldFeedbackKey = 'idle' | 'goodForm' | 'tooHigh' | 'tooLow'

export type HoldFeedbackPhrases = Record<HoldFeedbackKey, string[]>

export interface HoldBasedExercise {
  id: string
  name: string
  mode: 'hold'
  cues: string[]
  targetHoldSeconds: number
  targetSets: number
  restSeconds: number
  form: HoldForm
  feedback: HoldFeedbackPhrases
}

export type ExerciseConfig = RepBasedExercise | HoldBasedExercise
