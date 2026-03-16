import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import QgoLogo from '@/components/common/QgoLogo'
import { LayoutDashboard, ClipboardList, Users, Package, LogOut, Menu, Settings, TrendingUp, Route, DollarSign, Activity } from 'lucide-react'
import { useState } from 'react'

const NAV = [
  { to: '/admin',            label: 'Dashboard',    icon: LayoutDashboard, end: true },
  { to: '/admin/surveys',    label: 'Surveys',      icon: ClipboardList },
  { to: '/admin/surveyors',  label: 'Surveyors',    icon: Users },
  { to: '/admin/items',      label: 'Item Library', icon: Package },
  { to: '/admin/pricing',    label: 'Pricing',      icon: DollarSign },
  { to: '/admin/analytics',  label: 'Analytics',    icon: TrendingUp },
  { to: '/admin/owntracks',  label: 'GPS Tracking', icon: Route },
  { to: '/admin/track-surveyor', label: 'Track Surveyor', icon: Activity },
  { to: '/admin/settings',   label: 'Settings',     icon: Settings },
]

export default function AdminLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-qgo-navy flex flex-col transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0
      `}>
        <div className="px-6 py-5 border-b border-white/10">
          <QgoLogo white size="md" />
          <p className="text-white/40 text-xs mt-1">Admin Portal</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`
              }>
              <Icon className="w-4 h-4" /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="px-4 py-2 mb-2">
            <p className="text-white text-sm font-medium truncate">{profile?.full_name || profile?.email}</p>
            <p className="text-white/40 text-xs capitalize">{profile?.role?.replace('_', ' ')}</p>
          </div>
          <button onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-white/60 hover:bg-white/10 hover:text-white text-sm transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {open && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 lg:hidden">
          <button onClick={() => setOpen(true)} className="text-gray-600">
            <Menu className="w-5 h-5" />
          </button>
          <QgoLogo size="sm" />
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
