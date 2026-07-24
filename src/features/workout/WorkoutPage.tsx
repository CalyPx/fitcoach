import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'
import { getExercise } from '@/features/pose-detection/exercises'
import { Spinner } from '@/components/ui/Spinner'

const WorkoutSession = lazy(() =>
  import('./WorkoutSession').then((m) => ({ default: m.WorkoutSession })),
)

export function WorkoutPage() {
  const { exerciseId } = useParams<{ exerciseId: string }>()
  const exercise = getExercise(exerciseId)

  if (!exercise) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-semibold">Unknown exercise</h1>
        <p className="mt-2 text-fg-muted">No exercise named "{exerciseId}"</p>
      </div>
    )
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh flex-col items-center justify-center gap-3 text-fg-muted">
          <Spinner size={24} />
          <span>Loading…</span>
        </div>
      }
    >
      <WorkoutSession exercise={exercise} />
    </Suspense>
  )
}
