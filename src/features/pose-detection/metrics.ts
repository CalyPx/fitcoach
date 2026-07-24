import { angleBetween, signedLineDeviation, toPixel, type LandmarkTriple } from './landmarks'

export interface RawLandmark {
  x: number
  y: number
  visibility?: number
}

// Landmark visibility gating alone can't distinguish "confidently wrong"
// extrapolated points from genuinely-visible ones — MediaPipe reports both
// as fairly confident. The real fix for noise-driven false reps is the
// RepEngine's arm/calibration streak; keep this threshold modest so a leg
// that's genuinely (if partially) visible mid-rep doesn't get rejected too.
const MIN_VISIBILITY = 0.55

function pointsFor(
  landmarks: RawLandmark[],
  [aIdx, bIdx, cIdx]: LandmarkTriple,
): [RawLandmark, RawLandmark, RawLandmark] | null {
  const a = landmarks[aIdx]
  const b = landmarks[bIdx]
  const c = landmarks[cIdx]
  if (!a || !b || !c) return null
  const visible = [a, b, c].every((p) => (p.visibility ?? 1) >= MIN_VISIBILITY)
  if (!visible) return null
  return [a, b, c]
}

/** Angle at the middle joint of a triple, in pixel-space. Null if any point isn't visible enough. */
export function tripleAngle(
  landmarks: RawLandmark[],
  triple: LandmarkTriple,
  width: number,
  height: number,
): number | null {
  const points = pointsFor(landmarks, triple)
  if (!points) return null
  const [a, b, c] = points
  return angleBetween(
    toPixel(a, width, height),
    toPixel(b, width, height),
    toPixel(c, width, height),
  )
}

/** Averages the same triple's angle across left/right sides — robust to one side being partly occluded. */
export function averageAngle(
  landmarks: RawLandmark[],
  leftTriple: LandmarkTriple,
  rightTriple: LandmarkTriple,
  width: number,
  height: number,
): number | null {
  const left = tripleAngle(landmarks, leftTriple, width, height)
  const right = tripleAngle(landmarks, rightTriple, width, height)
  if (left === null && right === null) return null
  if (left === null) return right
  if (right === null) return left
  return (left + right) / 2
}

/** Signed deviation of the middle joint from the line a->c, averaged across left/right sides. */
export function averageSignedDeviation(
  landmarks: RawLandmark[],
  leftTriple: LandmarkTriple,
  rightTriple: LandmarkTriple,
  width: number,
  height: number,
): number | null {
  const leftPoints = pointsFor(landmarks, leftTriple)
  const rightPoints = pointsFor(landmarks, rightTriple)
  const values: number[] = []
  if (leftPoints) {
    const [a, b, c] = leftPoints
    values.push(
      signedLineDeviation(toPixel(a, width, height), toPixel(b, width, height), toPixel(c, width, height)),
    )
  }
  if (rightPoints) {
    const [a, b, c] = rightPoints
    values.push(
      signedLineDeviation(toPixel(a, width, height), toPixel(b, width, height), toPixel(c, width, height)),
    )
  }
  if (values.length === 0) return null
  return values.reduce((sum, v) => sum + v, 0) / values.length
}
