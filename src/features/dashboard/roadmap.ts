import type { Goal } from '@/types'

export interface RoadmapPhase {
  name: string
  description: string
}

/**
 * Illustrative training roadmap per goal — for demo purposes, not a real
 * adaptive program. Every goal gets a 4-phase arc from "just starting out"
 * to "trained and capable."
 */
export const ROADMAP_BY_GOAL: Record<Goal, RoadmapPhase[]> = {
  'build-muscle': [
    { name: 'Foundation', description: 'Learn the core movements with control' },
    { name: 'Strength', description: 'Build a base of raw strength' },
    { name: 'Muscle Building', description: 'Add volume to grow muscle' },
    { name: 'Athletic', description: 'Train power and full-body performance' },
  ],
  'lose-fat': [
    { name: 'Foundation', description: 'Build the habit, learn the movements' },
    { name: 'Fat Loss Base', description: 'Consistent sessions, steady effort' },
    { name: 'Conditioning', description: 'Push intensity, build endurance' },
    { name: 'Lean & Strong', description: 'Hold onto strength as you lean out' },
  ],
  'fix-posture': [
    { name: 'Foundation', description: 'Wake up the muscles that hold you up' },
    { name: 'Mobility', description: "Undo the stiffness, open things up" },
    { name: 'Postural Strength', description: 'Build strength to hold good posture' },
    { name: 'Movement Mastery', description: 'Move well without thinking about it' },
  ],
  'general-fitness': [
    { name: 'Foundation', description: 'Build the habit, learn the movements' },
    { name: 'Consistency', description: 'Make training a regular part of life' },
    { name: 'Strength', description: 'Get noticeably stronger' },
    { name: 'Athletic', description: 'Train like an athlete, feel like one' },
  ],
}

/** Session counts needed to reach each phase — illustrative, not a real progression model. */
const PHASE_SESSION_THRESHOLDS = [0, 3, 8, 16]

export function currentPhaseIndex(completedSessionCount: number): number {
  let index = 0
  for (let i = 0; i < PHASE_SESSION_THRESHOLDS.length; i++) {
    if (completedSessionCount >= PHASE_SESSION_THRESHOLDS[i]) index = i
  }
  return index
}
