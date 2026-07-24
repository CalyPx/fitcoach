import type { Equipment, ExperienceLevel, Goal } from '@/types'

export const GOAL_OPTIONS: { value: Goal; label: string; hint: string }[] = [
  { value: 'lose-fat', label: 'Lose fat', hint: 'Trim down, feel lighter' },
  { value: 'build-muscle', label: 'Build muscle', hint: 'Get stronger, add size' },
  { value: 'fix-posture', label: 'Fix posture', hint: 'Undo the desk slouch' },
  { value: 'general-fitness', label: 'General fitness', hint: 'Just move more, stay healthy' },
]

export const EQUIPMENT_OPTIONS: { value: Equipment; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'mat', label: 'Mat' },
  { value: 'dumbbells', label: 'Dumbbells' },
]

export const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string; hint: string }[] = [
  { value: 'beginner', label: 'Beginner', hint: "New to working out" },
  { value: 'some-experience', label: 'Some experience', hint: 'I know the basics' },
  { value: 'regular', label: 'Regular', hint: 'I train consistently' },
]
