import { Button } from '@/components/ui/Button'
import { StepHeader } from './StepHeader'

interface InjuriesStepProps {
  injuries: string
  onChange: (injuries: string) => void
  onNext: () => void
  onBack: () => void
}

export function InjuriesStep({ injuries, onChange, onNext, onBack }: InjuriesStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <StepHeader
        title="Anything we should work around?"
        subtitle="Old injuries, bad knees, back pain — whatever we should avoid. Totally optional."
      />

      <textarea
        value={injuries}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. lower back pain, right knee"
        rows={4}
        className="w-full resize-none rounded-md border border-border bg-bg-elevated px-4 py-3.5 text-fg placeholder:text-fg-subtle outline-none focus:border-accent"
      />

      <div className="flex gap-2">
        <Button variant="secondary" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button size="lg" onClick={onNext} className="flex-1">
          {injuries.trim() ? 'Continue' : 'Skip'}
        </Button>
      </div>
    </div>
  )
}
