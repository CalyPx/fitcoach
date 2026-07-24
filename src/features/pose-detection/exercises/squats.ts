import { LANDMARK } from '../landmarks'
import type { RepBasedExercise } from './types'

export const squats: RepBasedExercise = {
  id: 'squats',
  name: 'Squats',
  mode: 'rep',
  cues: [
    'Feet shoulder-width apart, toes slightly out',
    'Push your hips back like sitting into a chair',
    'Keep your chest up and knees tracking over your toes',
  ],
  targetReps: 12,
  targetSets: 3,
  restSeconds: 30,
  primaryAngle: {
    label: 'Knee angle',
    left: [LANDMARK.leftHip, LANDMARK.leftKnee, LANDMARK.leftAnkle],
    right: [LANDMARK.rightHip, LANDMARK.rightKnee, LANDMARK.rightAnkle],
  },
  thresholds: {
    topAngle: 160,
    descendAngle: 140,
    bottomAngle: 110,
    ascendAngle: 130,
    goodDepthAngle: 100,
  },
  feedback: {
    idle: ['Stand facing the camera to begin', 'Step into frame and get ready'],
    descending: ['Keep going down', 'Nice and controlled'],
    ascending: ['Drive up', 'Push through your heels'],
    goodDepth: ['Good depth', 'Nice squat', "That's the depth"],
    shallow: ['Go lower', 'A little deeper next time', 'Try to sit back further'],
  },
}
