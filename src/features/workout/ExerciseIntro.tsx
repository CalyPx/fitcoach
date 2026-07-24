import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { ExerciseConfig } from '@/features/pose-detection/exercises/types'

interface ExerciseIntroProps {
  exercise: ExerciseConfig
  onStart: () => void
}

export function ExerciseIntro({ exercise, onStart }: ExerciseIntroProps) {
  const target =
    exercise.mode === 'rep'
      ? `${exercise.targetSets} sets × ${exercise.targetReps} reps`
      : `${exercise.targetSets} sets × ${exercise.targetHoldSeconds}s hold`

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-fg">{exercise.name}</h1>
        <p className="mt-1 text-fg-muted">{target}</p>
      </div>

      <Card className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-wide text-fg-subtle">Technique cues</p>
        <ul className="flex flex-col gap-2">
          {exercise.cues.map((cue) => (
            <li key={cue} className="flex gap-2 text-fg">
              <span className="text-accent">•</span>
              <span>{cue}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Button size="lg" onClick={onStart} className="w-full">
        Start
      </Button>
    </div>
  )
}
