import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Plus, X, Smartphone, MapPin, Edit2, Check, Award, Clock, TrendingUp, Users, CheckCircle } from 'lucide-react'

export default function AdminSurveyors() {
  const [surveyors, setSurveyors] = useState([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(false)
  const [form, setForm]           = useState({ name: '', phone: '', employee_id: '', tracking_device_id: '' })
  const [saving, setSaving]       = useState(false)
  const [editingDeviceId, setEditingDeviceId] = useState(null)
  const [deviceIdInput, setDeviceIdInput] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase
      .from('surveyors')
      .select('*, survey_requests(id,status,created_at,confirmed_date)')
      .order('created_at', { ascending: false })

    // Calculate performance metrics for each surveyor
    const surveyorsWithStats = (data || []).map(surveyor => {
      const requests = surveyor.survey_requests || []
      const total = requests.length
      const completed = requests.filter(r => r.status === 'completed').length
      const inProgress = requests.filter(r => r.status === 'in_progress').length
      const thisMonth = requests.filter(r => {
        const date = new Date(r.created_at)
        const now = new Date()
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
      }).length

      return {
        ...surveyor,
        stats: {
          total,
          completed,
          inProgress,
          thisMonth,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        }
      }
    })

    setSurveyors(surveyorsWithStats)
    setLoading(false)
  }

  async function save() {
    setSaving(true)
    const { error } = await supabase.from('surveyors').insert([form])
    if (error) toast.error(error.message)
    else { toast.success('Surveyor added!'); setModal(false); setForm({ name: '', phone: '', employee_id: '', tracking_device_id: '' }); load() }
    setSaving(false)
  }

  async function toggleAvailable(id, val) {
    await supabase.from('surveyors').update({ is_available: !val }).eq('id', id)
    setSurveyors(p => p.map(s => s.id === id ? { ...s, is_available: !val } : s))
  }

  async function saveDeviceId(surveyorId) {
    if (!deviceIdInput.trim()) {
      toast.error('Device ID is required')
      return
    }
    setSaving(true)
    const { error } = await supabase
      .from('surveyors')
      .update({ tracking_device_id: deviceIdInput.trim() })
      .eq('id', surveyorId)

    if (error) toast.error(error.message)
    else {
      toast.success('Device ID saved!')
      setSurveyors(p => p.map(s => s.id === surveyorId ? { ...s, tracking_device_id: deviceIdInput.trim() } : s))
      setEditingDeviceId(null)
      setDeviceIdInput('')
    }
    setSaving(false)
  }

  function generateDeviceId(name) {
    const cleanName = name.toLowerCase().replace(/\s+/g, '-')
    const random = Math.random().toString(36).substring(2, 6)
    return `surveyor-${cleanName}-${random}`
  }

  function startEditDeviceId(surveyor) {
    setEditingDeviceId(surveyor.id)
    setDeviceIdInput(surveyor.tracking_device_id || generateDeviceId(surveyor.name))
  }

  // Check if OwnTracks is active (received update within last 2 minutes)
  function isOwnTracksActive(surveyor) {
    if (!surveyor.current_location?.updated_at) return false
    if (surveyor.current_location?.source !== 'owntracks') return false
    const timeDiff = Date.now() - new Date(surveyor.current_location.updated_at).getTime()
    return timeDiff < 120000 // 2 minutes
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-qgo-text flex items-center gap-2">
          <Users className="text-qgo-blue" /> Surveyors
        </h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => setModal(true)}>
          <Plus size={16} /> Add Surveyor
        </button>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <PerfCard
          title="Total Surveyors"
          value={surveyors.length}
          icon={Users}
          color="blue"
        />
        <PerfCard
          title="Available Now"
          value={surveyors.filter(s => s.is_available).length}
          icon={CheckCircle}
          color="green"
        />
        <PerfCard
          title="On Assignment"
          value={surveyors.reduce((sum, s) => sum + (s.stats?.inProgress || 0), 0)}
          icon={Clock}
          color="orange"
        />
        <PerfCard
          title="Completed This Month"
          value={surveyors.reduce((sum, s) => sum + (s.stats?.thisMonth || 0), 0)}
          icon={Award}
          color="purple"
        />
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-gray-400">Loading...</div>
        ) : surveyors.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-400">No surveyors yet. Add one!</div>
        ) : surveyors.map(s => {
          const ownTracksActive = isOwnTracksActive(s)

          return (
            <div key={s.id} className="card">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-qgo-bg rounded-xl flex items-center justify-center text-qgo-blue font-bold text-lg">
                  {s.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-qgo-text">{s.name}</p>
                  <p className="text-sm text-gray-500">{s.employee_id || 'No ID'}</p>
                </div>
                <button onClick={() => toggleAvailable(s.id, s.is_available)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                    s.is_available ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}>
                  {s.is_available ? 'Available' : 'Busy'}
                </button>
              </div>

              {/* Phone */}
              <p className="text-sm text-gray-400 mb-2">{s.phone || 'No phone'}</p>

              {/* Performance Stats */}
              {s.stats && s.stats.total > 0 && (
                <div className="flex items-center gap-4 mb-2 text-xs">
                  <div className="flex items-center gap-1 text-gray-600">
                    <CheckCircle size={12} className="text-green-600" />
                    <span>{s.stats.completed} completed</span>
                  </div>
                  {s.stats.inProgress > 0 && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock size={12} className="text-orange-500" />
                      <span>{s.stats.inProgress} active</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-gray-600">
                    <TrendingUp size={12} className="text-qgo-blue" />
                    <span>{s.stats.completionRate}% rate</span>
                  </div>
                </div>
              )}

              {/* Performance Bar */}
              {s.stats && s.stats.total > 0 && (
                <div className="mb-2">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                      style={{ width: `${s.stats.completionRate}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Tracking Device ID */}
              <div className="border-t border-gray-100 pt-3 mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Smartphone size={12} /> OwnTracks Device ID
                  </span>
                  {ownTracksActive && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      Active
                    </span>
                  )}
                </div>

                {editingDeviceId === s.id ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      className="input text-xs flex-1 py-1.5"
                      value={deviceIdInput}
                      onChange={e => setDeviceIdInput(e.target.value)}
                      placeholder="surveyor-name-abc123"
                    />
                    <button
                      onClick={() => saveDeviceId(s.id)}
                      disabled={saving}
                      className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => { setEditingDeviceId(null); setDeviceIdInput('') }}
                      className="p-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono ${s.tracking_device_id ? 'text-gray-600' : 'text-gray-400 italic'}`}>
                      {s.tracking_device_id || 'Not set'}
                    </span>
                    <button
                      onClick={() => startEditDeviceId(s)}
                      className="text-qgo-blue hover:text-qgo-navy text-xs flex items-center gap-1"
                    >
                      <Edit2 size={12} /> {s.tracking_device_id ? 'Edit' : 'Set'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Add Surveyor</h3>
              <button onClick={() => setModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Full Name *</label>
                <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Mohammed Al-Khaldi" />
              </div>
              <div>
                <label className="label">Employee ID</label>
                <input className="input" value={form.employee_id} onChange={e => setForm(p => ({ ...p, employee_id: e.target.value }))} placeholder="EMP-001" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+965 XXXX XXXX" />
              </div>
              <div>
                <label className="label flex items-center gap-1">
                  <Smartphone size={14} /> OwnTracks Device ID
                </label>
                <input
                  className="input font-mono text-sm"
                  value={form.tracking_device_id}
                  onChange={e => setForm(p => ({ ...p, tracking_device_id: e.target.value }))}
                  placeholder="surveyor-name-abc123 (optional)"
                />
                <p className="text-xs text-gray-400 mt-1">For background GPS tracking via OwnTracks app</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button className="btn-secondary flex-1" onClick={() => setModal(false)}>Cancel</button>
                <button className="btn-primary flex-1" onClick={save} disabled={saving || !form.name}>
                  {saving ? 'Saving...' : 'Add Surveyor'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PerfCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    orange: 'bg-orange-100 text-orange-700',
    purple: 'bg-purple-100 text-purple-700'
  }

  return (
    <div className="card !p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-qgo-text mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
}
