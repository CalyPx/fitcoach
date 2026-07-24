import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { ExerciseConfig } from '@/features/pose-detection/exercises/types'

interface ExerciseIntroProps {
  exercise: ExerciseConfig
  onStart: () => void
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

export function ExerciseIntro({ exercise, onStart }: ExerciseIntroProps) {
  const target =
    exercise.mode === 'rep'
      ? `${exercise.targetSets} sets × ${exercise.targetReps} reps`
      : `${exercise.targetSets} sets × ${exercise.targetHoldSeconds}s hold`

  return (
    <motion.div
      className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item}>
        <h1 className="text-2xl font-semibold text-fg">{exercise.name}</h1>
        <p className="mt-1 text-fg-muted">{target}</p>
      </motion.div>

      <motion.div variants={item}>
        <Card className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-wide text-fg-subtle">Technique cues</p>
          <ul className="flex flex-col gap-2">
            {exercise.cues.map((cue, i) => (
              <motion.li
                key={cue}
                className="flex gap-2 text-fg"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.3 + i * 0.09, ease: 'easeOut' }}
              >
                <span className="text-accent">•</span>
                <span>{cue}</span>
              </motion.li>
            ))}
          </ul>
        </Card>
      </motion.div>

      {exercise.mode === 'rep' && (
        <motion.div variants={item}>
          <Card className="flex gap-2 border-accent/25 bg-accent-muted text-sm text-fg-muted">
            <span className="text-accent">📷</span>
            <span>
              Stand back far enough that your whole body — head to feet — fits in frame. Rep counting
              tracks your knee angle and loses accuracy if your ankles get cropped out.
            </span>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.3 + exercise.cues.length * 0.09 + 0.15, ease: 'easeOut' }}
      >
        <Button size="lg" glow onClick={onStart} className="h-16 w-full text-lg">
          Start
        </Button>
      </motion.div>
    </motion.div>
  )
}
