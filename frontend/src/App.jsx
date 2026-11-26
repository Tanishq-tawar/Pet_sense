import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/layout/Layout'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import MyPetsPage from './pages/MyPetsPage'
import AddEditPetPage from './pages/AddEditPetPage'
import PetProfilePage from './pages/PetProfilePage'
import UploadMediaPage from './pages/UploadMediaPage'
import AnalysisResultsPage from './pages/AnalysisResultsPage'
import AnalysisHistoryPage from './pages/AnalysisHistoryPage'
import ReportPage from './pages/ReportPage'
import RemindersPage from './pages/RemindersPage'
import SettingsPage from './pages/SettingsPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Protected – inside Layout */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/pets" element={<MyPetsPage />} />
        <Route path="/pets/new" element={<AddEditPetPage />} />
        <Route path="/pets/:id/edit" element={<AddEditPetPage />} />
        <Route path="/pets/:id" element={<PetProfilePage />} />
        <Route path="/upload" element={<UploadMediaPage />} />
        <Route path="/analysis/:id" element={<AnalysisResultsPage />} />
        <Route path="/history" element={<AnalysisHistoryPage />} />
        <Route path="/report/:id" element={<ReportPage />} />
        <Route path="/reminders" element={<RemindersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
