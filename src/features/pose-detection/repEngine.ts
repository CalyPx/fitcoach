import type { RepFeedbackKey, RepPhaseThresholds } from './exercises/types'

export type RepPhase = 'top' | 'descending' | 'bottom' | 'ascending'

export interface RepEngineState {
  phase: RepPhase
  reps: number
  feedbackKey: RepFeedbackKey
  /** True on the exact update() call that just completed a rep — lets callers react once, not every frame. */
  repJustCompleted: boolean
}

/** Consecutive frames a condition must hold before a phase change commits — debounces single-frame jitter. */
const DEBOUNCE_FRAMES = 3

/**
 * Generic rep-counting state machine driven by exercise-specific angle
 * thresholds. Works for any exercise with a "top -> descending -> bottom ->
 * ascending -> top" cycle (squats, push-ups, lunges) — the exercise only
 * supplies the four threshold angles and which joint angle to feed in.
 */
export class RepEngine {
  private phase: RepPhase = 'top'
  private reps = 0
  private feedbackKey: RepFeedbackKey = 'idle'
  private minAngleThisRep = 180
  private candidatePhase: RepPhase | null = null
  private candidateStreak = 0
  private thresholds: RepPhaseThresholds

  constructor(thresholds: RepPhaseThresholds) {
    this.thresholds = thresholds
  }

  update(angle: number | null): RepEngineState {
    if (angle === null) {
      return { phase: this.phase, reps: this.reps, feedbackKey: this.feedbackKey, repJustCompleted: false }
    }

    const repJustCompleted = this.tryTransition(angle)

    if (this.phase === 'bottom' || this.phase === 'descending') {
      this.minAngleThisRep = Math.min(this.minAngleThisRep, angle)
    }

    return { phase: this.phase, reps: this.reps, feedbackKey: this.feedbackKey, repJustCompleted }
  }

  reset() {
    this.phase = 'top'
    this.reps = 0
    this.feedbackKey = 'idle'
    this.minAngleThisRep = 180
    this.candidatePhase = null
    this.candidateStreak = 0
  }

  private tryTransition(angle: number): boolean {
    const next = this.nextPhase(angle)
    if (next === null || next === this.phase) {
      this.candidatePhase = null
      this.candidateStreak = 0
      return false
    }

    if (next === this.candidatePhase) {
      this.candidateStreak += 1
    } else {
      this.candidatePhase = next
      this.candidateStreak = 1
    }

    if (this.candidateStreak >= DEBOUNCE_FRAMES) {
      const completed = this.commitPhase(next)
      this.candidatePhase = null
      this.candidateStreak = 0
      return completed
    }
    return false
  }

  private nextPhase(angle: number): RepPhase | null {
    const t = this.thresholds
    switch (this.phase) {
      case 'top':
        return angle < t.descendAngle ? 'descending' : null
      case 'descending':
        return angle < t.bottomAngle ? 'bottom' : null
      case 'bottom':
        return angle > t.ascendAngle ? 'ascending' : null
      case 'ascending':
        if (angle > t.topAngle) return 'top'
        if (angle < t.bottomAngle) return 'bottom' // sank back down instead of finishing
        return null
    }
  }

  /** Returns true if this transition completed a full rep. */
  private commitPhase(next: RepPhase): boolean {
    this.phase = next
    const t = this.thresholds
    let completed = false

    if (next === 'top') {
      this.reps += 1
      this.feedbackKey = this.minAngleThisRep <= t.goodDepthAngle ? 'goodDepth' : 'shallow'
      this.minAngleThisRep = 180
      completed = true
    } else if (next === 'descending') {
      this.feedbackKey = 'descending'
    } else if (next === 'bottom') {
      this.feedbackKey = this.minAngleThisRep <= t.goodDepthAngle ? 'goodDepth' : 'shallow'
    } else if (next === 'ascending') {
      this.feedbackKey = 'ascending'
    }

    return completed
  }
}
