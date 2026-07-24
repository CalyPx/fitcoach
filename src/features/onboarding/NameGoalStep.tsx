import type { Goal } from '@/types'
import { Button } from '@/components/ui/Button'
import { OptionTile } from './OptionTile'
import { GOAL_OPTIONS } from './options'
import { StepHeader } from './StepHeader'

interface NameGoalStepProps {
  name: string
  goal: Goal | null
  onChangeName: (name: string) => void
  onChangeGoal: (goal: Goal) => void
  onNext: () => void
}

export function NameGoalStep({ name, goal, onChangeName, onChangeGoal, onNext }: NameGoalStepProps) {
  const canContinue = name.trim().length > 0 && goal !== null

  return (
    <div className="flex flex-col gap-6">
      <StepHeader
        title="Namaste! What should we call you?"
        subtitle="And what are you here to work on?"
      />

      <input
        autoFocus
        value={name}
        onChange={(e) => onChangeName(e.target.value)}
        placeholder="Your name"
        className="w-full rounded-md border border-border bg-bg-elevated px-4 py-3.5 text-fg placeholder:text-fg-subtle outline-none focus:border-accent"
      />

      <div className="flex flex-col gap-2">
        {GOAL_OPTIONS.map((option) => (
          <OptionTile
            key={option.value}
            label={option.label}
            hint={option.hint}
            selected={goal === option.value}
            onClick={() => onChangeGoal(option.value)}
          />
        ))}
      </div>

      <Button size="lg" disabled={!canContinue} onClick={onNext} className="w-full">
        Continue
      </Button>
    </div>
  )
}
