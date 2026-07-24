import type { RepFeedbackKey, RepPhaseThresholds } from './exercises/types'

export type RepPhase = 'top' | 'descending' | 'bottom' | 'ascending'

export interface RepEngineState {
  phase: RepPhase
  reps: number
  feedbackKey: RepFeedbackKey
  /** True on the exact update() call that just completed a rep — lets callers react once, not every frame. */
  repJustCompleted: boolean
  /** False until tracking has been continuously stable for ARM_FRAMES — see the constant below for why. */
  calibrating: boolean
}

/** Consecutive frames a condition must hold before a phase change commits — debounces single-frame jitter. */
const DEBOUNCE_FRAMES = 5

/**
 * Exponential smoothing factor applied to the raw angle before it drives the
 * phase machine. Pose landmarks (especially ankles, which are easy to lose
 * to typical webcam framing) can briefly report a plausible-looking but
 * wrong position — without smoothing, that single noisy frame can be enough
 * to trip a debounced threshold crossing while the person isn't moving at
 * all. A low-pass filter here trades a small amount of latency for a much
 * more stable signal.
 */
const SMOOTHING_ALPHA = 0.35

/**
 * Consecutive valid-tracking frames required before the phase machine is
 * allowed to transition at all. When a person first steps into frame (or
 * tracking recovers after a brief occlusion), MediaPipe's temporal filter
 * hasn't locked on yet and can emit a burst of landmark positions that swing
 * through a large chunk of the angle range before settling — enough on its
 * own to fake a full top->bottom->top cycle even though nobody moved.
 * Requiring a stable streak first (rather than just per-frame smoothing)
 * filters that startup burst without needing looser, less accurate
 * thresholds elsewhere.
 */
const ARM_FRAMES = 12

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
  private smoothedAngle: number | null = null
  private validStreak = 0
  private thresholds: RepPhaseThresholds

  constructor(thresholds: RepPhaseThresholds) {
    this.thresholds = thresholds
  }

  update(rawAngle: number | null): RepEngineState {
    // A momentary loss of tracking resets the smoother and the arming streak
    // rather than holding a stale average — the next valid frame becomes the
    // new baseline, and tracking must re-stabilize before transitions count
    // again, instead of the filter slowly catching up from a possibly-wrong
    // prior value.
    if (rawAngle === null) {
      this.smoothedAngle = null
      this.validStreak = 0
      return {
        phase: this.phase,
        reps: this.reps,
        feedbackKey: this.feedbackKey,
        repJustCompleted: false,
        calibrating: true,
      }
    }

    this.smoothedAngle =
      this.smoothedAngle === null
        ? rawAngle
        : this.smoothedAngle + SMOOTHING_ALPHA * (rawAngle - this.smoothedAngle)
    const angle = this.smoothedAngle
    this.validStreak += 1
    const calibrating = this.validStreak < ARM_FRAMES

    const repJustCompleted = calibrating ? false : this.tryTransition(angle)

    if (!calibrating && (this.phase === 'bottom' || this.phase === 'descending')) {
      this.minAngleThisRep = Math.min(this.minAngleThisRep, angle)
    }

    return { phase: this.phase, reps: this.reps, feedbackKey: this.feedbackKey, repJustCompleted, calibrating }
  }

  reset() {
    this.phase = 'top'
    this.reps = 0
    this.feedbackKey = 'idle'
    this.minAngleThisRep = 180
    this.candidatePhase = null
    this.candidateStreak = 0
    this.smoothedAngle = null
    this.validStreak = 0
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
