import type { Equipment } from '@/types'
import { Button } from '@/components/ui/Button'
import { OptionTile } from './OptionTile'
import { EQUIPMENT_OPTIONS } from './options'
import { StepHeader } from './StepHeader'

interface EquipmentStepProps {
  equipment: Equipment[]
  onToggle: (equipment: Equipment) => void
  onNext: () => void
  onBack: () => void
}

export function EquipmentStep({ equipment, onToggle, onNext, onBack }: EquipmentStepProps) {
  const canContinue = equipment.length > 0

  return (
    <div className="flex flex-col gap-6">
      <StepHeader
        title="What do you have to work with?"
        subtitle="Pick everything available at home. Most people just pick None — that's fine."
      />

      <div className="flex flex-col gap-2">
        {EQUIPMENT_OPTIONS.map((option) => (
          <OptionTile
            key={option.value}
            label={option.label}
            selected={equipment.includes(option.value)}
            onClick={() => onToggle(option.value)}
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
