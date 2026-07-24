import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { OnboardingPage } from '@/features/onboarding/OnboardingPage'
import { HomePage } from '@/features/dashboard/HomePage'
import { WorkoutPage } from '@/features/workout/WorkoutPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { RoadmapPage } from '@/features/dashboard/RoadmapPage'
import { NutritionPage } from '@/features/nutrition/NutritionPage'
import { AppShell } from '@/components/layout/AppShell'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/workout/:exerciseId" element={<WorkoutPage />} />
        <Route
          path="/home"
          element={
            <AppShell>
              <HomePage />
            </AppShell>
          }
        />
        <Route
          path="/meals"
          element={
            <AppShell>
              <NutritionPage />
            </AppShell>
          }
        />
        <Route
          path="/dashboard"
          element={
            <AppShell>
              <DashboardPage />
            </AppShell>
          }
        />
        <Route
          path="/roadmap"
          element={
            <AppShell>
              <RoadmapPage />
            </AppShell>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
