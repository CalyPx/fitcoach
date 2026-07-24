export const LANDMARK = {
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
} as const

export type LandmarkTriple = [number, number, number]

export interface Point2D {
  x: number
  y: number
}

/**
 * Angle at vertex `b` formed by rays b->a and b->c, in degrees [0, 180].
 * Points must be in a common pixel-space (not raw normalized 0–1 coords) —
 * mixing x/y scales when width !== height skews the angle.
 */
export function angleBetween(a: Point2D, b: Point2D, c: Point2D): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
  let degrees = Math.abs((radians * 180) / Math.PI)
  if (degrees > 180) degrees = 360 - degrees
  return degrees
}

/**
 * Signed vertical distance of `vertex` from the straight line a->c, in
 * pixel-space. Positive = vertex sits below the line (e.g. sagging hips in
 * a plank), negative = vertex sits above the line (e.g. piked hips).
 * Used alongside angleBetween (which only measures how bent, not which way)
 * to tell two "bad form" cases apart.
 */
export function signedLineDeviation(a: Point2D, vertex: Point2D, c: Point2D): number {
  if (a.x === c.x) return 0
  const t = (vertex.x - a.x) / (c.x - a.x)
  const expectedY = a.y + t * (c.y - a.y)
  return vertex.y - expectedY
}

/** Converts a normalized (0–1) landmark to pixel coordinates for a given frame size. */
export function toPixel(point: Point2D, width: number, height: number): Point2D {
  return { x: point.x * width, y: point.y * height }
}
