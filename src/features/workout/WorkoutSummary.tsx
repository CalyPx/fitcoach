import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { ExerciseConfig } from '@/features/pose-detection/exercises/types'
import type { SetResult } from './WorkoutSession'

const ENCOURAGEMENT = [
  'Solid work — that\'s a session in the bank.',
  'Nice consistency out there. Keep it up.',
  'That\'s the effort that adds up over time.',
  'Good session. Your future self says thanks.',
]

interface WorkoutSummaryProps {
  exercise: ExerciseConfig
  setResults: SetResult[]
  totalTimeSeconds: number
  onDone: () => void
}

export function WorkoutSummary({ exercise, setResults, totalTimeSeconds, onDone }: WorkoutSummaryProps) {
  const message = useMemo(() => ENCOURAGEMENT[Math.floor(Math.random() * ENCOURAGEMENT.length)], [])

  const totalReps = setResults.reduce((sum, r) => sum + (r.reps ?? 0), 0)
  const totalHoldSeconds = setResults.reduce((sum, r) => sum + (r.holdSeconds ?? 0), 0)

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-fg">{exercise.name} complete</h1>
        <p className="mt-1 text-fg-muted">{message}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatTile
          label={exercise.mode === 'rep' ? 'Total reps' : 'Total hold time'}
          value={exercise.mode === 'rep' ? String(totalReps) : formatSeconds(totalHoldSeconds)}
        />
        <StatTile label="Session time" value={formatSeconds(totalTimeSeconds)} />
      </div>

      <Card className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wide text-fg-subtle">Sets</p>
        {setResults.map((result, i) => (
          <div key={i} className="flex items-center justify-between text-fg">
            <span className="text-fg-muted">Set {i + 1}</span>
            <span>{exercise.mode === 'rep' ? `${result.reps ?? 0} reps` : formatSeconds(result.holdSeconds ?? 0)}</span>
          </div>
        ))}
      </Card>

      <div className="flex flex-col gap-2">
        <Button size="lg" onClick={onDone} className="w-full">
          Do it again
        </Button>
        <Link to="/home">
          <Button variant="secondary" size="lg" className="w-full">
            Back to home
          </Button>
        </Link>
      </div>
    </div>
  )
}

function formatSeconds(totalSeconds: number): string {
  const s = Math.round(totalSeconds)
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, '0')}`
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-bg-elevated p-4 text-center">
      <p className="text-xs uppercase tracking-wide text-fg-subtle">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-fg">{value}</p>
    </div>
  )
}
