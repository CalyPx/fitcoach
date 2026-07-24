import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MealEntry, UserProfile, WorkoutSession } from '@/types'

interface AppState {
  profile: UserProfile | null
  sessions: WorkoutSession[]
  /** Date key (YYYY-MM-DD, local time) -> grams of protein logged that day. */
  proteinLogs: Record<string, number>
  meals: MealEntry[]
  setProfile: (profile: UserProfile) => void
  addSession: (session: WorkoutSession) => void
  addProtein: (dateKey: string, grams: number) => void
  addMeal: (meal: MealEntry) => void
  deleteMeal: (id: string) => void
  reset: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      profile: null,
      sessions: [],
      proteinLogs: {},
      meals: [],
      setProfile: (profile) => set({ profile }),
      addSession: (session) =>
        set((state) => ({ sessions: [...state.sessions, session] })),
      addProtein: (dateKey, grams) =>
        set((state) => ({
          proteinLogs: {
            ...state.proteinLogs,
            [dateKey]: (state.proteinLogs[dateKey] ?? 0) + grams,
          },
        })),
      addMeal: (meal) => set((state) => ({ meals: [...state.meals, meal] })),
      deleteMeal: (id) =>
        set((state) => ({ meals: state.meals.filter((m) => m.id !== id) })),
      reset: () => set({ profile: null, sessions: [], proteinLogs: {}, meals: [] }),
    }),
    { name: 'fitcoach-storage' },
  ),
)
