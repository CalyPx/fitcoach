import { LANDMARK } from '../landmarks'
import type { HoldBasedExercise } from './types'

export const plank: HoldBasedExercise = {
  id: 'plank',
  name: 'Plank',
  mode: 'hold',
  cues: [
    'Forearms on the ground, elbows under shoulders',
    'Keep a straight line from shoulders to ankles',
    'Squeeze your core — don’t let your hips sag or pike up',
  ],
  targetHoldSeconds: 30,
  targetSets: 3,
  restSeconds: 30,
  form: {
    // Best viewed roughly side-on to the camera so the shoulder-hip-ankle line is visible.
    label: 'Hip line',
    left: [LANDMARK.leftShoulder, LANDMARK.leftHip, LANDMARK.leftAnkle],
    right: [LANDMARK.rightShoulder, LANDMARK.rightHip, LANDMARK.rightAnkle],
    goodFormMinAngle: 160,
  },
  feedback: {
    idle: ['Get into plank position, facing the camera side-on', 'Set up in a forearm plank to begin'],
    goodForm: ['Great form, keep holding', 'Straight line — nice work', 'Hold it right there'],
    tooHigh: ['Lower your hips a bit', "You're piking up — hips down slightly"],
    tooLow: ['Raise your hips', "Don't let your hips sag — engage your core"],
  },
}
