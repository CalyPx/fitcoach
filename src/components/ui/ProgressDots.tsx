import { cn } from '@/lib/utils'

interface ProgressDotsProps {
  total: number
  current: number
  className?: string
}

export function ProgressDots({ total, current, className }: ProgressDotsProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'h-1.5 rounded-full transition-all duration-300 ease-out',
            i === current ? 'w-6 bg-accent' : 'w-1.5 bg-bg-subtle',
          )}
        />
      ))}
    </div>
  )
}
