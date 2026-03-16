import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useBranding } from '@/hooks/useBranding'

// Pages
import NewLandingPage      from '@/pages/NewLandingPage'
import LoginPage          from '@/pages/LoginPage'
import SurveyWizard       from '@/pages/SurveyWizard'
import LiveTracking       from '@/pages/LiveTracking'
import AdminLayout        from '@/pages/admin/AdminLayout'
import AdminDashboard     from '@/pages/admin/AdminDashboard'
import AdminSurveys       from '@/pages/admin/AdminSurveys'
import AdminSurveyDetail  from '@/pages/admin/AdminSurveyDetail'
import AdminSurveyors     from '@/pages/admin/AdminSurveyors'
import AdminItems         from '@/pages/admin/AdminItems'
import AdminSettings      from '@/pages/admin/AdminSettings'
import AdminOwnTracks     from '@/pages/admin/AdminOwnTracks'
import AdminTrackSurveyor from '@/pages/admin/AdminTrackSurveyor'
import AdminAnalytics     from '@/pages/admin/AdminAnalytics'
import PricingManagement  from '@/pages/admin/PricingManagement'
import SurveyReport       from '@/pages/admin/SurveyReport'
import CustomerPortal     from '@/pages/CustomerPortal'

// Surveyor Pages (Redesigned)
import SurveyorLayout     from '@/pages/surveyor/SurveyorLayout'
import SurveyorDashboard  from '@/pages/surveyor/SurveyorDashboard'
import SurveyorSurvey     from '@/pages/surveyor/SurveyorSurvey'
import SurveyorSurveys    from '@/pages/surveyor/SurveyorSurveys'
import SurveyorMap        from '@/pages/surveyor/SurveyorMap'
import SurveyorSettings   from '@/pages/surveyor/SurveyorSettings'

function ProtectedRoute({ children, role }) {
  const { user, profile, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#060E1E]">
      <div className="w-8 h-8 border-4 border-[#00C8F0] border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (role === 'admin' && !['super_admin','operations_manager'].includes(profile?.role))
    return <Navigate to="/surveyor" replace />
  return children
}

export default function App() {
  useBranding() // Load branding colors from settings

  return (
    <Routes>
      {/* Public */}
      <Route path="/"              element={<NewLandingPage />} />
      <Route path="/survey"        element={<SurveyWizard />} />
      <Route path="/login"         element={<LoginPage />} />
      <Route path="/track/:token"  element={<LiveTracking />} />
      <Route path="/portal/:token" element={<CustomerPortal />} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index                     element={<AdminDashboard />} />
        <Route path="surveys"            element={<AdminSurveys />} />
        <Route path="surveys/:id"        element={<AdminSurveyDetail />} />
        <Route path="surveys/:id/report" element={<SurveyReport />} />
        <Route path="surveyors"          element={<AdminSurveyors />} />
        <Route path="items"              element={<AdminItems />} />
        <Route path="pricing"            element={<PricingManagement />} />
        <Route path="analytics"          element={<AdminAnalytics />} />
        <Route path="settings"           element={<AdminSettings />} />
        <Route path="owntracks"          element={<AdminOwnTracks />} />
        <Route path="track-surveyor"     element={<AdminTrackSurveyor />} />
      </Route>

      {/* Surveyor */}
      <Route path="/surveyor" element={<ProtectedRoute role="surveyor"><SurveyorLayout /></ProtectedRoute>}>
        <Route index           element={<SurveyorDashboard />} />
        <Route path="surveys"  element={<SurveyorSurveys />} />
        <Route path="map"      element={<SurveyorMap />} />
        <Route path="settings" element={<SurveyorSettings />} />
        <Route path="survey/:id" element={<SurveyorSurvey />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
