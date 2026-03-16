import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Moon, Sun, Smartphone, Bell, Database, LogOut, ChevronRight, Cloud, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const THEME_OPTIONS = [
  { value: 'auto', label: 'Auto', icon: Smartphone, description: 'Follow system setting' },
  { value: 'light', label: 'Light', icon: Sun, description: 'Always light mode' },
  { value: 'dark', label: 'Dark', icon: Moon, description: 'Always dark mode' }
]

export default function SurveyorSettings() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [theme, setTheme] = useState('auto')
  const [notifications, setNotifications] = useState(true)
  const [offlineData, setOfflineData] = useState({ surveys: 0, items: 0 })

  useEffect(() => {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('surveyor_theme') || 'auto'
    setTheme(savedTheme)
    applyTheme(savedTheme)

    // Load notification preference
    const savedNotif = localStorage.getItem('surveyor_notifications')
    if (savedNotif !== null) {
      setNotifications(savedNotif === 'true')
    }

    // Simulate loading offline data count
    loadOfflineData()
  }, [])

  function applyTheme(newTheme) {
    const root = document.documentElement

    // Remove existing theme classes
    root.classList.remove('dark', 'auto-theme')

    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else if (newTheme === 'auto') {
      root.classList.add('auto-theme')
    }
    // light theme is default (no class needed)
  }

  function handleThemeChange(newTheme) {
    setTheme(newTheme)
    localStorage.setItem('surveyor_theme', newTheme)
    applyTheme(newTheme)
    toast.success(`Theme changed to ${newTheme}`)
  }

  function handleNotificationsChange() {
    const newValue = !notifications
    setNotifications(newValue)
    localStorage.setItem('surveyor_notifications', String(newValue))
    toast.success(newValue ? 'Notifications enabled' : 'Notifications disabled')
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  async function loadOfflineData() {
    // In a real app, this would check IndexedDB
    // For now, just show placeholder
    setOfflineData({ surveys: 0, items: 0 })
  }

  async function clearOfflineData() {
    // In a real app, this would clear IndexedDB
    setOfflineData({ surveys: 0, items: 0 })
    toast.success('Offline data cleared')
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage your preferences</p>
      </div>

      {/* Profile Section */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-4"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {profile?.full_name?.charAt(0) || 'S'}
          </div>
          <div className="flex-1">
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {profile?.full_name || 'Surveyor'}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Surveyor</p>
          </div>
          <button
            className="p-2 rounded-lg"
            style={{ backgroundColor: 'var(--bg-tertiary)' }}
          >
            <User size={18} style={{ color: 'var(--color-primary)' }} />
          </button>
        </div>
      </motion.section>

      {/* Theme Selection */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-sm font-medium mb-3 px-1" style={{ color: 'var(--text-secondary)' }}>Theme</h3>
        <div className="grid grid-cols-3 gap-3">
          {THEME_OPTIONS.map(option => {
            const Icon = option.icon
            const isActive = theme === option.value
            return (
              <button
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                className={`relative p-4 rounded-xl transition-all ${isActive ? 'ring-2' : ''}`}
                style={{
                  backgroundColor: isActive ? 'var(--color-primary)' : 'var(--bg-secondary)',
                  color: isActive ? 'white' : 'var(--text-primary)',
                  ringColor: 'var(--color-primary)'
                }}
              >
                <Icon size={24} className="mx-auto mb-2" />
                <p className="text-sm font-medium">{option.label}</p>
                <p className="text-xs opacity-70">{option.description}</p>
                {isActive && (
                  <motion.div
                    layoutId="themeCheck"
                    className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center"
                  >
                    <Check size={12} style={{ color: 'var(--color-primary)' }} />
                  </motion.div>
                )}
              </button>
            )
          })}
        </div>
      </motion.section>

      {/* Preferences */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-sm font-medium mb-3 px-1" style={{ color: 'var(--text-secondary)' }}>Preferences</h3>
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          {/* Notifications */}
          <button
            onClick={handleNotificationsChange}
            className="w-full flex items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-100 text-purple-600">
                <Bell size={20} />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Notifications</p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Push notifications for new surveys</p>
              </div>
            </div>
            <div
              className={`w-12 h-7 rounded-full transition-colors relative ${notifications ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <motion.div
                animate={{ x: notifications ? 22 : 2 }}
                className="absolute top-1 w-5 h-5 bg-white rounded-full shadow"
              />
            </div>
          </button>
        </div>
      </motion.section>

      {/* Offline & Sync */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-sm font-medium mb-3 px-1" style={{ color: 'var(--text-secondary)' }}>Offline & Sync</h3>
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600">
              <Cloud size={20} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Sync Status</p>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>All data synced</p>
            </div>
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Online</span>
          </div>

          <div className="border-t" style={{ borderColor: 'var(--border-color)' }} />

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-orange-100 text-orange-600">
                <Database size={20} />
              </div>
              <div>
                <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Offline Data</p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {offlineData.surveys} surveys, {offlineData.items} items cached
                </p>
              </div>
            </div>
            <button
              onClick={clearOfflineData}
              className="text-xs px-3 py-1.5 rounded-lg font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </motion.section>

      {/* Sign Out */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 p-4 rounded-2xl transition-colors bg-red-50 hover:bg-red-100 text-red-600"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-100">
            <LogOut size={20} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-sm">Sign Out</p>
            <p className="text-xs text-red-400">Sign out of your account</p>
          </div>
          <ChevronRight size={18} />
        </button>
      </motion.section>

      {/* Version Info */}
      <div className="text-center py-4">
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Q'go Cargo Survey v1.0.0</p>
      </div>
    </div>
  )
}
