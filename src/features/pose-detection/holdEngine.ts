import type { HoldFeedbackKey } from './exercises/types'

export interface HoldEngineState {
  holding: boolean
  elapsedGoodSeconds: number
  feedbackKey: HoldFeedbackKey
}

/** Consecutive frames a form change must hold before feedback switches — avoids flickering between messages. */
const DEBOUNCE_FRAMES = 5

/** Exponential smoothing factor for the raw form angle — see the matching constant in repEngine.ts for why. */
const SMOOTHING_ALPHA = 0.35

/**
 * Generic hold-timer for time-based exercises (plank, and anything else
 * scored by "how long was correct form maintained" rather than reps).
 * The timer only accumulates while form is good; it pauses (doesn't reset)
 * the moment form breaks, and resumes once form is corrected.
 */
export class HoldEngine {
  private elapsedGoodSeconds = 0
  private feedbackKey: HoldFeedbackKey = 'idle'
  private candidateKey: HoldFeedbackKey | null = null
  private candidateStreak = 0
  private smoothedAngle: number | null = null
  private goodFormMinAngle: number

  constructor(goodFormMinAngle: number) {
    this.goodFormMinAngle = goodFormMinAngle
  }

  /**
   * @param rawAngle form angle this frame (null if not visible)
   * @param signedDeviation positive = hinge point below the reference line (sagging),
   *   negative = above it (piked) — only used to pick which "bad form" message to show
   * @param dtSeconds real time elapsed since the last update() call
   */
  update(rawAngle: number | null, signedDeviation: number | null, dtSeconds: number): HoldEngineState {
    if (rawAngle === null) {
      this.smoothedAngle = null
      return {
        holding: false,
        elapsedGoodSeconds: this.elapsedGoodSeconds,
        feedbackKey: this.feedbackKey,
      }
    }

    this.smoothedAngle =
      this.smoothedAngle === null
        ? rawAngle
        : this.smoothedAngle + SMOOTHING_ALPHA * (rawAngle - this.smoothedAngle)
    const angle = this.smoothedAngle

    const good = angle >= this.goodFormMinAngle
    let candidate: HoldFeedbackKey
    if (good) {
      candidate = 'goodForm'
    } else if (signedDeviation !== null && signedDeviation < 0) {
      candidate = 'tooHigh'
    } else {
      candidate = 'tooLow'
    }

    // The timer reacts to `good` immediately — only the *displayed* message
    // debounces. Gating accumulation on the debounced key would let a few
    // hundred ms of already-broken form still count as held time.
    if (good) {
      this.elapsedGoodSeconds += dtSeconds
    }

    if (candidate === this.candidateKey) {
      this.candidateStreak += 1
    } else {
      this.candidateKey = candidate
      this.candidateStreak = 1
    }
    if (this.candidateStreak >= DEBOUNCE_FRAMES) {
      this.feedbackKey = candidate
    }

    return {
      holding: good,
      elapsedGoodSeconds: this.elapsedGoodSeconds,
      feedbackKey: this.feedbackKey,
    }
  }

  reset() {
    this.elapsedGoodSeconds = 0
    this.feedbackKey = 'idle'
    this.candidateKey = null
    this.candidateStreak = 0
    this.smoothedAngle = null
  }
}
