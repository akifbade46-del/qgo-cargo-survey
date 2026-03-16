import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import StatusBadge from '@/components/common/StatusBadge'
import WhatsAppButton from '@/components/common/WhatsAppButton'
import { Search, Filter, Mic, Star, Image, MessageCircle } from 'lucide-react'

const STATUSES = ['all','pending','assigned','in_progress','surveyed','completed','cancelled']

export default function AdminSurveys() {
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => { load() }, [filter])

  async function load() {
    setLoading(true)
    let q = supabase.from('survey_requests')
      .select(`
        id, reference_number, customer_name, customer_email, customer_phone, whatsapp_number,
        from_city, from_country, to_city, to_country, status, move_type,
        preferred_date, created_at, assigned_surveyor_id, voice_note,
        surveyors(name)
      `)
      .order('created_at', { ascending: false })
    if (filter !== 'all') q = q.eq('status', filter)
    const { data } = await q

    // Fetch feedback and item counts for each survey
    if (data && data.length > 0) {
      const surveyIds = data.map(s => s.id)

      const [feedbackData, roomsData] = await Promise.all([
        supabase.from('feedback').select('survey_request_id, rating').in('survey_request_id', surveyIds),
        supabase.from('survey_rooms').select('survey_request_id, survey_items(id, photos)').in('survey_request_id', surveyIds)
      ])

      // Merge data
      const surveysWithExtras = data.map(survey => {
        const feedback = feedbackData.data?.find(f => f.survey_request_id === survey.id)
        const rooms = roomsData.data?.filter(r => r.survey_request_id === survey.id) || []
        const itemCount = rooms.reduce((sum, r) => sum + (r.survey_items?.length || 0), 0)
        const photoCount = rooms.reduce((sum, r) =>
          sum + r.survey_items?.reduce((s, i) => s + (i.photos?.length || 0), 0) || 0, 0)

        return {
          ...survey,
          hasFeedback: !!feedback,
          feedbackRating: feedback?.rating,
          itemCount,
          photoCount
        }
      })

      setSurveys(surveysWithExtras)
    } else {
      setSurveys(data ?? [])
    }
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
              <tr>{['Reference','Customer','Route','Type','Info','Status','Date','Actions'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No surveys found</td></tr>
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
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {/* Item count */}
                      {s.itemCount > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                          📦 {s.itemCount}
                        </span>
                      )}
                      {/* Photo indicator */}
                      {s.photoCount > 0 && (
                        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Image size={10} /> {s.photoCount}
                        </span>
                      )}
                      {/* Voice note indicator */}
                      {s.voice_note && (
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Mic size={10} />
                        </span>
                      )}
                      {/* Feedback indicator with stars */}
                      {s.hasFeedback && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-0.5" title={`Rating: ${s.feedbackRating}/5`}>
                          {[1,2,3,4,5].map(star => (
                            <Star
                              key={star}
                              size={10}
                              className={star <= s.feedbackRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                            />
                          ))}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-400">{new Date(s.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link to={`/admin/surveys/${s.id}`} className="text-xs text-qgo-blue hover:underline">View</Link>
                      {/* WhatsApp Button */}
                      {s.whatsapp_number && (
                        <WhatsAppButton
                          type="confirmation"
                          referenceNumber={s.reference_number}
                          customerName={s.customer_name}
                          customerPhone={s.whatsapp_number}
                          className="!p-1 !px-2"
                        />
                      )}
                      {/* Send Feedback Request for completed surveys without feedback */}
                      {s.status === 'completed' && !s.hasFeedback && s.whatsapp_number && (
                        <button
                          onClick={() => {
                            const feedbackUrl = `${window.location.origin}/feedback/${s.id}`
                            const message = `Hi ${s.customer_name}! Thank you for completing your survey #${s.reference_number}. Please share your feedback: ${feedbackUrl}`
                            window.open(`https://wa.me/${s.whatsapp_number?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank')
                          }}
                          className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full hover:bg-yellow-200 flex items-center gap-1"
                          title="Send feedback request"
                        >
                          <Star size={10} /> Request Feedback
                        </button>
                      )}
                    </div>
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
