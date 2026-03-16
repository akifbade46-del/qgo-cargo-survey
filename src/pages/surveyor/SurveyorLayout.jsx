import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import QgoLogo from '@/components/common/QgoLogo'
import { LayoutDashboard, ClipboardList, Map, Settings, LogOut, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import OfflineIndicator from './components/OfflineIndicator'

const NAV_ITEMS = [
  { to: '/surveyor', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/surveyor/surveys', icon: ClipboardList, label: 'Surveys' },
  { to: '/surveyor/map', icon: Map, label: 'Map' },
  { to: '/surveyor/settings', icon: Settings, label: 'Settings' }
]

export default function SurveyorLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Check if we're on a survey detail page (to show back button instead of tabs)
  const isSurveyDetail = location.pathname.includes('/surveyor/survey/')

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Offline Indicator Banner */}
      <OfflineIndicator />

      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-color)'
        }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <QgoLogo size="sm" />
          <div className="flex items-center gap-3">
            <span className="text-sm hidden sm:block" style={{ color: 'var(--text-secondary)' }}>
              {profile?.full_name}
            </span>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Top Tabs Navigation */}
        {!isSurveyDetail && (
          <nav className="flex border-t" style={{ borderColor: 'var(--border-color)' }}>
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className="flex-1 relative"
              >
                {({ isActive }) => (
                  <div
                    className="flex flex-col items-center py-2.5 transition-colors"
                    style={{ color: isActive ? 'var(--color-primary)' : 'var(--text-tertiary)' }}
                  >
                    <item.icon size={20} />
                    <span className="text-xs mt-0.5 font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                      />
                    )}
                  </div>
                )}
              </NavLink>
            ))}
          </nav>
        )}

        {/* Back button for survey detail */}
        {isSurveyDetail && (
          <div className="flex items-center gap-3 px-4 py-2">
            <button
              onClick={() => navigate('/surveyor')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Survey Details</span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      {/* Floating Action Button (FAB) - only show on dashboard and surveys */}
      {(location.pathname === '/surveyor' || location.pathname === '/surveyor/surveys') && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/surveyor/surveys')}
          className="surveyor-fab"
        >
          <Plus size={24} className="text-white" />
        </motion.button>
      )}
    </div>
  )
}
