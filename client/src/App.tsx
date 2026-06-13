import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { OnboardingPage } from '@/pages/auth/OnboardingPage'
import { DashboardLayout } from '@/features/dashboard/layout/DashboardLayout'
import { DashboardHome } from '@/pages/dashboard/DashboardHome'
import { TrainingPage } from '@/pages/training/TrainingPage'
import { EmployabilityPage } from '@/pages/employability/EmployabilityPage'
import { ExperiencesPage } from '@/pages/experiences/ExperiencesPage'
import { MentorshipPage } from '@/pages/mentorship/MentorshipPage'
import { MentalHealthPage } from '@/pages/mental-health/MentalHealthPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="formacion" element={<TrainingPage />} />
          <Route path="empleabilidad" element={<EmployabilityPage />} />
          <Route path="experiencias" element={<ExperiencesPage />} />
          <Route path="mentorias" element={<MentorshipPage />} />
          <Route path="salud-mental" element={<MentalHealthPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
