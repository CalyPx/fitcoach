import { LANDMARK } from '../landmarks'
import type { RepBasedExercise } from './types'

export const lunges: RepBasedExercise = {
  id: 'lunges',
  name: 'Lunges',
  mode: 'rep',
  cues: [
    'Step forward and lower your back knee toward the floor',
    'Keep your front knee over your ankle, not past your toes',
    'Torso upright, push back to standing through your front heel',
  ],
  targetReps: 10,
  targetSets: 3,
  restSeconds: 30,
  primaryAngle: {
    // Averages both knees — with a single front-facing camera we can't reliably
    // tell front leg from back leg, so this tracks whichever knee bends most.
    label: 'Knee angle',
    left: [LANDMARK.leftHip, LANDMARK.leftKnee, LANDMARK.leftAnkle],
    right: [LANDMARK.rightHip, LANDMARK.rightKnee, LANDMARK.rightAnkle],
  },
  thresholds: {
    topAngle: 160,
    descendAngle: 145,
    bottomAngle: 110,
    ascendAngle: 130,
    goodDepthAngle: 100,
  },
  feedback: {
    idle: ['Stand facing the camera to begin', 'Get ready to step forward'],
    descending: ['Lower under control', 'Keep your torso upright'],
    ascending: ['Push back up', 'Drive through your front heel'],
    goodDepth: ['Good depth', 'Nice lunge', 'Back knee close to the floor — great'],
    shallow: ['Go a bit lower', 'Drop your back knee further', 'Try for more depth'],
  },
}
