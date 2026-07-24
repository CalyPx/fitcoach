interface StepHeaderProps {
  title: string
  subtitle?: string
}

export function StepHeader({ title, subtitle }: StepHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold leading-snug tracking-tight text-fg">{title}</h1>
      {subtitle && <p className="mt-1.5 text-fg-muted">{subtitle}</p>}
    </div>
  )
}
