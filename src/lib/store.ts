import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile, WorkoutSession } from '@/types'

interface AppState {
  profile: UserProfile | null
  sessions: WorkoutSession[]
  /** Date key (YYYY-MM-DD, local time) -> grams of protein logged that day. */
  proteinLogs: Record<string, number>
  setProfile: (profile: UserProfile) => void
  addSession: (session: WorkoutSession) => void
  addProtein: (dateKey: string, grams: number) => void
  reset: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      profile: null,
      sessions: [],
      proteinLogs: {},
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
      reset: () => set({ profile: null, sessions: [], proteinLogs: {} }),
    }),
    { name: 'fitcoach-storage' },
  ),
)
