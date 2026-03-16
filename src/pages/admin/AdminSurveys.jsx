import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import StatusBadge from '@/components/common/StatusBadge'
import { Search, Filter } from 'lucide-react'

const STATUSES = ['all','pending','assigned','in_progress','surveyed','completed','cancelled']

export default function AdminSurveys() {
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('all')

  useEffect(() => { load() }, [filter])

  async function load() {
    setLoading(true)
    let q = supabase.from('survey_requests')
      .select('id,reference_number,customer_name,customer_email,from_city,from_country,to_city,to_country,status,move_type,preferred_date,created_at,assigned_surveyor_id')
      .order('created_at', { ascending: false })
    if (filter !== 'all') q = q.eq('status', filter)
    const { data } = await q
    setSurveys(data ?? [])
    setLoading(false)
  }

  const filtered = surveys.filter(s =>
    s.reference_number?.toLowerCase().includes(search.toLowerCase()) ||
    s.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.customer_email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-qgo-text">Surveys</h1>
        <span className="text-sm text-gray-500">{filtered.length} results</span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search by name, email, reference..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                filter === s ? 'bg-qgo-blue text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-qgo-blue'
              }`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>{['Reference','Customer','Route','Type','Status','Date',''].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No surveys found</td></tr>
              ) : filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link to={`/admin/surveys/${s.id}`} className="text-qgo-blue font-semibold text-sm hover:underline">{s.reference_number}</Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-800">{s.customer_name}</p>
                    <p className="text-xs text-gray-400">{s.customer_email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.from_city||'?'}, {s.from_country} → {s.to_city||'?'}, {s.to_country}</td>
                  <td className="px-4 py-3"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">{s.move_type}</span></td>
                  <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-400">{new Date(s.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <Link to={`/admin/surveys/${s.id}`} className="text-xs text-qgo-blue hover:underline">View →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
