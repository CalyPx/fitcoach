import type { ExperienceLevel } from '@/types'
import { Button } from '@/components/ui/Button'
import { OptionTile } from './OptionTile'
import { EXPERIENCE_OPTIONS } from './options'
import { StepHeader } from './StepHeader'

interface ExperienceStepProps {
  experience: ExperienceLevel | null
  onChange: (experience: ExperienceLevel) => void
  onNext: () => void
  onBack: () => void
}

export function ExperienceStep({ experience, onChange, onNext, onBack }: ExperienceStepProps) {
  const canContinue = experience !== null

  return (
    <div className="flex flex-col gap-6">
      <StepHeader title="How much have you trained before?" subtitle="This sets your starting difficulty." />

      <div className="flex flex-col gap-2">
        {EXPERIENCE_OPTIONS.map((option) => (
          <OptionTile
            key={option.value}
            label={option.label}
            hint={option.hint}
            selected={experience === option.value}
            onClick={() => onChange(option.value)}
          />
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button size="lg" disabled={!canContinue} onClick={onNext} className="flex-1">
          Continue
        </Button>
      </div>
    </div>
  )
}
