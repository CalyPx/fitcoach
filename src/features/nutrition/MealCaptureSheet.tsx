import { useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { analyzeMeal, downscaleImageToJpeg } from '@/lib/nutritionApi'
import type { MealEntry, NutritionEstimate } from '@/types'

interface MealCaptureSheetProps {
  dateKey: string
  onSave: (meal: MealEntry) => void
  onClose: () => void
}

type Phase = 'compose' | 'analyzing' | 'manual'

const EMPTY_ESTIMATE: NutritionEstimate = { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }

export function MealCaptureSheet({ dateKey, onSave, onClose }: MealCaptureSheetProps) {
  const reduceMotion = useReducedMotion()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [phase, setPhase] = useState<Phase>('compose')
  const [description, setDescription] = useState('')
  const [thumbnail, setThumbnail] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [manualEstimate, setManualEstimate] = useState<NutritionEstimate>(EMPTY_ESTIMATE)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await downscaleImageToJpeg(file)
      setThumbnail(dataUrl)
    } catch {
      setError("Couldn't read that photo — try again or describe the meal instead.")
    }
  }

  async function handleAnalyze() {
    if (!thumbnail && !description.trim()) {
      setError('Add a photo or a short description first.')
      return
    }
    setError(null)
    setPhase('analyzing')
    try {
      const base64 = thumbnail ? thumbnail.split(',')[1] : undefined
      const result = await analyzeMeal({ imageBase64: base64, description: description.trim() || undefined })
      onSave({
        id: crypto.randomUUID(),
        dateKey,
        loggedAt: new Date().toISOString(),
        description: description.trim(),
        thumbnailDataUrl: thumbnail,
        source: 'ai',
        estimate: result.estimate,
        foodLabel: result.foodLabel,
      })
    } catch {
      // AI analysis is unreachable under plain `vite dev`, or the upstream
      // call failed — fall back to manual entry rather than hard-failing.
      setManualEstimate(EMPTY_ESTIMATE)
      setPhase('manual')
    }
  }

  function handleManualSave() {
    onSave({
      id: crypto.randomUUID(),
      dateKey,
      loggedAt: new Date().toISOString(),
      description: description.trim(),
      thumbnailDataUrl: thumbnail,
      source: 'manual',
      estimate: manualEstimate,
      foodLabel: description.trim() || 'Meal',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-bg/70 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        className="w-full max-w-md rounded-t-2xl border-t border-border bg-bg-elevated p-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]"
        initial={reduceMotion ? { opacity: 0 } : { y: '100%' }}
        animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
      >
        {phase !== 'analyzing' && (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-fg">Log a meal</h2>
            <button onClick={onClose} className="text-fg-subtle hover:text-fg" aria-label="Close">
              ✕
            </button>
          </div>
        )}

        {phase === 'compose' && (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-bg-subtle text-fg-muted hover:border-accent hover:text-fg"
            >
              {thumbnail ? (
                <img src={thumbnail} alt="Selected meal" className="h-full w-full rounded-lg object-cover" />
              ) : (
                <>
                  <span className="text-2xl">📷</span>
                  <span className="text-sm">Add a photo</span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="meal-description" className="text-xs uppercase tracking-wide text-fg-subtle">
                Description (optional if you added a photo)
              </label>
              <textarea
                id="meal-description"
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 300))}
                placeholder="e.g. Dal bhat with vegetables and a fried egg"
                rows={2}
                className="w-full resize-none rounded-md border border-border bg-bg-subtle px-3 py-2 text-fg placeholder:text-fg-subtle outline-none focus:border-accent"
              />
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}

            <Button onClick={handleAnalyze} className="w-full">
              Analyze with AI
            </Button>
          </div>
        )}

        {phase === 'analyzing' && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Spinner size={28} />
            <p className="text-fg-muted">Estimating nutrition…</p>
          </div>
        )}

        {phase === 'manual' && (
          <ManualEntryForm
            description={description}
            estimate={manualEstimate}
            onChange={setManualEstimate}
            onSave={handleManualSave}
            notice="Couldn't reach the AI estimator — enter the macros yourself."
          />
        )}
      </motion.div>
    </div>
  )
}

function ManualEntryForm({
  description,
  estimate,
  onChange,
  onSave,
  notice,
}: {
  description: string
  estimate: NutritionEstimate
  onChange: (estimate: NutritionEstimate) => void
  onSave: () => void
  notice?: string
}) {
  const fields: { key: keyof NutritionEstimate; label: string; unit: string }[] = [
    { key: 'calories', label: 'Calories', unit: 'kcal' },
    { key: 'proteinG', label: 'Protein', unit: 'g' },
    { key: 'carbsG', label: 'Carbs', unit: 'g' },
    { key: 'fatG', label: 'Fat', unit: 'g' },
  ]

  return (
    <div className="flex flex-col gap-4">
      {notice && <p className="text-sm text-fg-muted">{notice}</p>}
      {description && <p className="text-sm text-fg">"{description}"</p>}
      <div className="grid grid-cols-2 gap-3">
        {fields.map((field) => (
          <div key={field.key} className="flex flex-col gap-1.5">
            <label htmlFor={`meal-${field.key}`} className="text-xs uppercase tracking-wide text-fg-subtle">
              {field.label} ({field.unit})
            </label>
            <input
              id={`meal-${field.key}`}
              type="number"
              inputMode="numeric"
              min={0}
              value={estimate[field.key] || ''}
              onChange={(e) =>
                onChange({ ...estimate, [field.key]: Math.max(0, Number(e.target.value) || 0) })
              }
              className="w-full rounded-md border border-border bg-bg-subtle px-3 py-2 text-fg outline-none focus:border-accent"
            />
          </div>
        ))}
      </div>
      <Button onClick={onSave} className="w-full">
        Save meal
      </Button>
    </div>
  )
}
