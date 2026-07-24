import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { OnboardingPage } from '@/features/onboarding/OnboardingPage'
import { HomePage } from '@/features/dashboard/HomePage'
import { WorkoutPage } from '@/features/workout/WorkoutPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { RoadmapPage } from '@/features/dashboard/RoadmapPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/workout/:exerciseId" element={<WorkoutPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
