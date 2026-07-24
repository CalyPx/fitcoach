import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { useAppStore } from '@/lib/store'
import { calorieTargetKcal, dailyNutritionTotals, mealsOnDay, proteinTargetGrams, todayKey } from '@/features/dashboard/insights'
import { MealCaptureSheet } from './MealCaptureSheet'

export function NutritionPage() {
  const profile = useAppStore((s) => s.profile)
  const meals = useAppStore((s) => s.meals)
  const addMeal = useAppStore((s) => s.addMeal)
  const deleteMeal = useAppStore((s) => s.deleteMeal)

  const [sheetOpen, setSheetOpen] = useState(false)

  const today = todayKey()
  const todaysMeals = mealsOnDay(meals, today).slice().reverse()
  const totals = dailyNutritionTotals(meals, today)

  const proteinTarget = profile ? proteinTargetGrams(profile.goal) : 100
  const calorieTarget = profile ? calorieTargetKcal(profile.goal) : 2000

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-6 p-6 md:gap-8 md:p-10">
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="text-2xl font-semibold text-fg md:text-3xl">Meals</h1>
        <p className="mt-1 text-fg-muted">Today's nutrition</p>
      </motion.header>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] md:items-start md:gap-8">
        <div className="flex flex-col gap-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
            <Card className="flex flex-col gap-5">
              <div className="flex items-center justify-center gap-6">
                <ProgressRing
                  progress={calorieTarget > 0 ? totals.calories / calorieTarget : 0}
                  size={120}
                  strokeWidth={10}
                  label={`${Math.round(totals.calories)}`}
                  tone="primary"
                />
                <ProgressRing
                  progress={proteinTarget > 0 ? totals.proteinG / proteinTarget : 0}
                  size={90}
                  strokeWidth={8}
                  label={`${Math.round(totals.proteinG)}g`}
                  tone="secondary"
                />
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <MacroTile label="Protein" value={totals.proteinG} target={proteinTarget} unit="g" />
                <MacroTile label="Carbs" value={totals.carbsG} unit="g" />
                <MacroTile label="Fat" value={totals.fatG} unit="g" />
              </div>
            </Card>
          </motion.div>

          <Button glow onClick={() => setSheetOpen(true)} className="w-full">
            Log a meal
          </Button>
        </div>

        <motion.div
          className="flex flex-col gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {todaysMeals.length === 0 ? (
            <Card className="text-center text-fg-muted">No meals logged yet today.</Card>
          ) : (
            <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-3">
              {todaysMeals.map((meal) => (
                <Card key={meal.id} className="flex items-center gap-3">
                  {meal.thumbnailDataUrl ? (
                    <img
                      src={meal.thumbnailDataUrl}
                      alt=""
                      className="h-14 w-14 flex-shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-bg-subtle text-xl">
                      🍽️
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-fg">{meal.foodLabel || meal.description || 'Meal'}</p>
                    <p className="text-sm text-fg-muted">
                      {Math.round(meal.estimate.calories)} kcal · {Math.round(meal.estimate.proteinG)}g protein
                    </p>
                  </div>
                  <button
                    onClick={() => deleteMeal(meal.id)}
                    aria-label="Delete meal"
                    className="flex-shrink-0 text-fg-subtle hover:text-danger"
                  >
                    ✕
                  </button>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {sheetOpen && (
        <MealCaptureSheet
          dateKey={today}
          onSave={(meal) => {
            addMeal(meal)
            setSheetOpen(false)
          }}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </div>
  )
}

function MacroTile({ label, value, target, unit }: { label: string; value: number; target?: number; unit: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-fg-subtle">{label}</p>
      <p className="mt-1 text-lg font-semibold text-fg">
        {Math.round(value)}
        {unit}
      </p>
      {target !== undefined && <p className="text-xs text-fg-subtle">of {target}{unit}</p>}
    </div>
  )
}
