import { useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { PoseDetector, type MetricUpdate } from '@/features/pose-detection/PoseDetector'
import type { ExerciseConfig } from '@/features/pose-detection/exercises/types'
import { useAppStore } from '@/lib/store'
import { ExerciseIntro } from './ExerciseIntro'
import { RestTimer } from './RestTimer'
import { WorkoutSummary } from './WorkoutSummary'

export interface SetResult {
  reps?: number
  holdSeconds?: number
}

type Stage = 'intro' | 'active' | 'rest' | 'summary'

interface WorkoutSessionProps {
  exercise: ExerciseConfig
}

export function WorkoutSession({ exercise }: WorkoutSessionProps) {
  const addSession = useAppStore((s) => s.addSession)
  const [stage, setStage] = useState<Stage>('intro')
  const [setIndex, setSetIndex] = useState(0)
  const [setResults, setSetResults] = useState<SetResult[]>([])
  const [liveMetric, setLiveMetric] = useState<MetricUpdate | null>(null)
  const [totalTimeSeconds, setTotalTimeSeconds] = useState(0)
  const sessionStartRef = useRef<number | null>(null)
  const finishedRef = useRef(false)

  function finishSet(result: SetResult) {
    // Guards the whole function against running twice for one real
    // completion (e.g. StrictMode double-invoking a handler). Side effects
    // like addSession must stay out of the setSetResults updater below —
    // React (StrictMode in dev, and concurrent features generally) can
    // invoke a functional updater more than once per commit, which would
    // silently duplicate the persisted session record.
    if (finishedRef.current) return
    finishedRef.current = true

    const next = [...setResults, result]
    setSetResults(next)

    const isLastSet = next.length >= exercise.targetSets
    if (isLastSet) {
      const start = sessionStartRef.current
      setTotalTimeSeconds(start ? (performance.now() - start) / 1000 : 0)
      setStage('summary')
      addSession({
        id: crypto.randomUUID(),
        exerciseId: exercise.id,
        completedAt: new Date().toISOString(),
        mode: exercise.mode,
        setsCompleted: next.length,
        repsCompleted: next.reduce((sum, r) => sum + (r.reps ?? 0), 0),
        holdSecondsCompleted: next.reduce((sum, r) => sum + (r.holdSeconds ?? 0), 0),
      })
    } else {
      setStage('rest')
    }
  }

  const handleStart = () => {
    sessionStartRef.current = performance.now()
    setStage('active')
  }

  const handleMetricUpdate = (update: MetricUpdate) => {
    setLiveMetric(update)
    if (exercise.mode === 'rep' && update.mode === 'rep' && update.reps >= exercise.targetReps) {
      finishSet({ reps: update.reps })
    } else if (
      exercise.mode === 'hold' &&
      update.mode === 'hold' &&
      update.elapsedGoodSeconds >= exercise.targetHoldSeconds
    ) {
      finishSet({ holdSeconds: update.elapsedGoodSeconds })
    }
  }

  const handleEndSetEarly = () => {
    if (!liveMetric) {
      finishSet(exercise.mode === 'rep' ? { reps: 0 } : { holdSeconds: 0 })
      return
    }
    if (liveMetric.mode === 'rep') finishSet({ reps: liveMetric.reps })
    else finishSet({ holdSeconds: liveMetric.elapsedGoodSeconds })
  }

  const handleRestComplete = () => {
    finishedRef.current = false
    setLiveMetric(null)
    setSetIndex((i) => i + 1)
    setStage('active')
  }

  const handleRestart = () => {
    setSetIndex(0)
    setSetResults([])
    setLiveMetric(null)
    finishedRef.current = false
    setStage('intro')
  }

  let content: ReactNode

  if (stage === 'intro') {
    content = <ExerciseIntro exercise={exercise} onStart={handleStart} />
  } else if (stage === 'rest') {
    content = (
      <RestTimer
        seconds={exercise.restSeconds}
        nextSetLabel={`Set ${setIndex + 2} of ${exercise.targetSets}`}
        onComplete={handleRestComplete}
        onSkip={handleRestComplete}
      />
    )
  } else if (stage === 'summary') {
    content = (
      <WorkoutSummary
        exercise={exercise}
        setResults={setResults}
        totalTimeSeconds={totalTimeSeconds}
        onDone={handleRestart}
      />
    )
  } else {
    const target = exercise.mode === 'rep' ? `Target: ${exercise.targetReps} reps` : `Target: ${exercise.targetHoldSeconds}s`
    content = (
      <div className="mx-auto flex h-dvh max-w-2xl flex-col gap-3 p-3 lg:max-w-5xl lg:p-6">
        <div className="flex items-center justify-between px-1">
          <h1 className="text-lg font-semibold text-fg">{exercise.name}</h1>
          <span className="text-sm text-fg-muted">
            Set {setIndex + 1} of {exercise.targetSets} · {target}
          </span>
        </div>

        <PoseDetector key={setIndex} exercise={exercise} onMetricUpdate={handleMetricUpdate} />

        <Button variant="secondary" onClick={handleEndSetEarly} className="lg:mx-auto lg:w-full lg:max-w-md">
          End set
        </Button>
      </div>
    )
  }

  // A plain fade-in on mount (no AnimatePresence/exit) — keyed by stage so
  // each transition still gets a soft entrance, but nothing here ever waits
  // on an exit animation to resolve before showing the next stage. That
  // "wait" pattern is a real trap: if an exit transition ever stalls (a
  // backgrounded tab, a slow device), the user is stuck with no way to
  // continue the session. A fade-in-only approach can't hang like that.
  return (
    <motion.div
      key={stage}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {content}
    </motion.div>
  )
}
