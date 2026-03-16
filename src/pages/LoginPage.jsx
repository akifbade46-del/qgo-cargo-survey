import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import QgoLogo from '@/components/common/QgoLogo'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { signIn, profile, user } = useAuth()
  const navigate                = useNavigate()

  // Redirect when profile loads after login
  useEffect(() => {
    if (user && profile) {
      const role = profile.role
      if (role === 'surveyor') navigate('/surveyor', { replace: true })
      else navigate('/admin', { replace: true })
    }
  }, [user, profile, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    const { error } = await signIn(email, password)
    if (error) {
      toast.error(error.message)
      setSubmitting(false)
    }
    // On success, useEffect will handle redirect when profile loads
  }

  return (
    <div className="min-h-screen bg-qgo-bg flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <div className="flex justify-center mb-8">
          <QgoLogo size="lg" />
        </div>
        <h2 className="text-xl font-bold text-center text-qgo-text mb-1">Staff Login</h2>
        <p className="text-sm text-gray-500 text-center mb-8">Admin & Surveyor Portal</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={email}
              onChange={e => setEmail(e.target.value)} required placeholder="you@qgocargo.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={password}
              onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <button className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Demo Login Buttons */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">Quick Demo Access</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin2@qgocargo.com')
                  setPassword('demo123')
                }}
                className="px-3 py-2 text-xs font-medium bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors border border-amber-200"
              >
                🎯 Demo Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('surveyor@qgocargo.com')
                  setPassword('demo123')
                }}
                className="px-3 py-2 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200"
              >
                📍 Demo Surveyor
              </button>
            </div>
          </div>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Customer? <a href="/" className="text-qgo-blue hover:underline">Request a survey →</a>
        </p>
      </div>
    </div>
  )
}
