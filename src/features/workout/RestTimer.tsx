import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ProgressRing } from '@/components/ui/ProgressRing'

interface RestTimerProps {
  seconds: number
  nextSetLabel: string
  onComplete: () => void
  onSkip: () => void
}

export function RestTimer({ seconds, nextSetLabel, onComplete, onSkip }: RestTimerProps) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    setRemaining(seconds)
  }, [seconds])

  useEffect(() => {
    if (remaining <= 0) {
      onComplete()
      return
    }
    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining])

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 p-6 text-center">
      <p className="text-fg-muted">Rest up</p>
      <ProgressRing
        progress={1 - remaining / seconds}
        size={140}
        strokeWidth={8}
        label={String(remaining)}
        ease="linear"
        durationSeconds={0.95}
      />
      <p className="text-fg-muted">Next: {nextSetLabel}</p>
      <Button variant="secondary" onClick={onSkip}>
        Skip rest
      </Button>
    </div>
  )
}
