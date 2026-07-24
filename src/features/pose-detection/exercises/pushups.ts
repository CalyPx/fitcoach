import { LANDMARK } from '../landmarks'
import type { RepBasedExercise } from './types'

export const pushups: RepBasedExercise = {
  id: 'pushups',
  name: 'Push-ups',
  mode: 'rep',
  cues: [
    'Hands slightly wider than shoulders',
    'Keep your body in a straight line, hips level',
    'Lower until your elbows hit about 90°',
  ],
  targetReps: 10,
  targetSets: 3,
  restSeconds: 45,
  primaryAngle: {
    label: 'Elbow angle',
    left: [LANDMARK.leftShoulder, LANDMARK.leftElbow, LANDMARK.leftWrist],
    right: [LANDMARK.rightShoulder, LANDMARK.rightElbow, LANDMARK.rightWrist],
  },
  thresholds: {
    topAngle: 155,
    descendAngle: 140,
    bottomAngle: 95,
    ascendAngle: 115,
    goodDepthAngle: 90,
  },
  feedback: {
    idle: ['Get into plank position, facing the camera', 'Set up in a high plank to begin'],
    descending: ['Lower with control', 'Keep your core tight'],
    ascending: ['Push back up', 'Press through your palms'],
    goodDepth: ['Good depth', 'Nice rep', 'Elbows at 90 — solid'],
    shallow: ['Go a bit lower', 'Bend those elbows more', 'Almost there, dip further'],
  },
}
