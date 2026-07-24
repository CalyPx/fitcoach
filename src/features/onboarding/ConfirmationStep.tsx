import type { Equipment, ExperienceLevel, Goal } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { StepHeader } from './StepHeader'
import { EQUIPMENT_OPTIONS, EXPERIENCE_OPTIONS, GOAL_OPTIONS } from './options'

interface ConfirmationStepProps {
  name: string
  goal: Goal
  equipment: Equipment[]
  injuries: string
  experience: ExperienceLevel
  onConfirm: () => void
  onBack: () => void
}

export function ConfirmationStep({
  name,
  goal,
  equipment,
  injuries,
  experience,
  onConfirm,
  onBack,
}: ConfirmationStepProps) {
  const goalLabel = GOAL_OPTIONS.find((o) => o.value === goal)?.label
  const experienceLabel = EXPERIENCE_OPTIONS.find((o) => o.value === experience)?.label
  const equipmentLabel = equipment
    .map((e) => EQUIPMENT_OPTIONS.find((o) => o.value === e)?.label)
    .join(', ')

  return (
    <div className="flex flex-col gap-6">
      <StepHeader
        title={`Here's your starting plan, ${name.trim() || 'friend'}`}
        subtitle="You can change any of this later from your dashboard."
      />

      <Card className="flex flex-col gap-2">
        <SummaryRow label="Goal" value={goalLabel ?? '—'} />
        <SummaryRow label="Equipment" value={equipmentLabel || '—'} />
        <SummaryRow label="Experience" value={experienceLabel ?? '—'} />
        <SummaryRow label="Working around" value={injuries.trim() || 'Nothing noted'} />
      </Card>

      <div className="flex gap-2">
        <Button variant="secondary" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button size="lg" onClick={onConfirm} className="flex-1">
          Start my plan
        </Button>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-fg-muted">{label}</span>
      <span className="text-right font-medium text-fg">{value}</span>
    </div>
  )
}
