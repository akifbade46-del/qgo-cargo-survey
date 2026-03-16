import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Link } from 'react-router-dom'
import StatusBadge from '@/components/common/StatusBadge'
import { ClipboardList, CheckCircle, Clock, Users, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats]     = useState({ total: 0, pending: 0, in_progress: 0, completed: 0 })
  const [recent, setRecent]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: reqs }, { data: rec }] = await Promise.all([
        supabase.from('survey_requests').select('status'),
        supabase.from('survey_requests').select('id,reference_number,customer_name,from_city,to_country,status,created_at')
          .order('created_at', { ascending: false }).limit(8)
      ])
      if (reqs) {
        const counts = reqs.reduce((a, r) => { a[r.status] = (a[r.status] || 0) + 1; return a }, {})
        setStats({ total: reqs.length, pending: counts.pending || 0, in_progress: (counts.in_progress || 0) + (counts.assigned || 0), completed: counts.completed || 0 })
      }
      if (rec) setRecent(rec)
      setLoading(false)
    }
    load()
  }, [])

  const CARDS = [
    { label: 'Total Surveys',  value: stats.total,       icon: ClipboardList, color: 'bg-blue-50 text-qgo-blue' },
    { label: 'Pending',        value: stats.pending,      icon: Clock,         color: 'bg-yellow-50 text-yellow-600' },
    { label: 'In Progress',    value: stats.in_progress,  icon: TrendingUp,    color: 'bg-orange-50 text-orange-600' },
    { label: 'Completed',      value: stats.completed,    icon: CheckCircle,   color: 'bg-green-50 text-green-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-qgo-text">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-qgo-text">{loading ? '—' : value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Surveys */}
      <div className="card !p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-qgo-text">Recent Surveys</h2>
          <Link to="/admin/surveys" className="text-sm text-qgo-blue hover:underline">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>{['Reference','Customer','Route','Status','Date'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recent.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link to={`/admin/surveys/${r.id}`} className="text-qgo-blue font-medium text-sm hover:underline">{r.reference_number}</Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.customer_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{r.from_city} → {r.to_country}</td>
                  <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                  <td className="px-6 py-4 text-sm text-gray-400">{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {!loading && recent.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-sm">No surveys yet. Share the survey form link!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
