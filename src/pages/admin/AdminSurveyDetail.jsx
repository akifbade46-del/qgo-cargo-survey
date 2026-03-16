import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import StatusBadge from '@/components/common/StatusBadge'
import ContainerRecommendation from '@/components/container/ContainerRecommendation'
import PDFQuoteGenerator from '@/components/quote/PDFQuoteGenerator'
import WhatsAppButton from '@/components/common/WhatsAppButton'
import { useEmail } from '@/hooks/useEmail'
import { useAuth } from '@/contexts/AuthContext'
import { calcCBM, recommendContainer, CONTAINERS, getFillPercent } from '@/utils/cbm'
import toast from 'react-hot-toast'
import { ArrowLeft, MapPin, User, Home, Package, Copy, Mail, FileText, ExternalLink, Send, Edit2, Save, X, Truck, DollarSign, Star, Mic, MessageCircle, Image } from 'lucide-react'

const STATUSES = ['pending','assigned','in_progress','surveyed','completed','cancelled']

export default function AdminSurveyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { sendConfirmation, sendAssigned, sendReportReady } = useEmail()
  const [survey, setSurvey]     = useState(null)
  const [surveyors, setSurveyors] = useState([])
  const [rooms, setRooms]       = useState([])
  const [report, setReport]     = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [emailSending, setEmailSending] = useState(false)

  // Route editing states
  const [editingRoute, setEditingRoute] = useState(false)
  const [routeData, setRouteData] = useState({
    from_address: '', from_city: '', from_country: '',
    to_address: '', to_city: '', to_country: '',
    selected_container: ''
  })
  const [savingRoute, setSavingRoute] = useState(false)
  const [showQuote, setShowQuote] = useState(false)

  useEffect(() => { load() }, [id])

  async function load() {
    const [{ data: s }, { data: sv }, { data: rm }, { data: rp }, { data: fb }] = await Promise.all([
      supabase.from('survey_requests').select('*').eq('id', id).single(),
      supabase.from('surveyors').select('id,name,is_available'),
      supabase.from('survey_rooms').select('*,survey_items(*)').eq('survey_request_id', id),
      supabase.from('survey_reports').select('*').eq('survey_request_id', id).maybeSingle(),
      supabase.from('feedback').select('*').eq('survey_request_id', id).maybeSingle()
    ])
    setSurvey(s); setSurveyors(sv ?? []); setRooms(rm ?? []); setReport(rp); setFeedback(fb)
    // Initialize route data
    if (s) {
      setRouteData({
        from_address: s.from_address || '',
        from_city: s.from_city || '',
        from_country: s.from_country || '',
        to_address: s.to_address || '',
        to_city: s.to_city || '',
        to_country: s.to_country || '',
        selected_container: s.selected_container || ''
      })
    }
    setLoading(false)
  }

  async function updateStatus(status) {
    setSaving(true)
    await supabase.from('survey_requests').update({ status }).eq('id', id)
    toast.success('Status updated')
    setSurvey(p => ({ ...p, status })); setSaving(false)
  }

  async function assignSurveyor(surveyor_id) {
    setSaving(true)
    await supabase.from('survey_requests').update({
      assigned_surveyor_id: surveyor_id || null,
      status: surveyor_id ? 'assigned' : 'pending',
      assigned_at: surveyor_id ? new Date().toISOString() : null
    }).eq('id', id)
    toast.success('Surveyor assigned'); load(); setSaving(false)
  }

  async function handleEmail(type) {
    setEmailSending(true)
    try {
      if (type === 'confirmation') await sendConfirmation(id)
      else if (type === 'assigned')  await sendAssigned(id)
      else if (type === 'report_ready') await sendReportReady(id)
    } finally { setEmailSending(false) }
  }

  async function saveRouteData() {
    setSavingRoute(true)
    try {
      const { error } = await supabase.from('survey_requests').update({
        from_address: routeData.from_address,
        from_city: routeData.from_city,
        from_country: routeData.from_country,
        to_address: routeData.to_address,
        to_city: routeData.to_city,
        to_country: routeData.to_country,
        selected_container: routeData.selected_container || null,
        container_override_by: user?.id,
        container_override_at: routeData.selected_container ? new Date().toISOString() : null
      }).eq('id', id)

      if (error) throw error

      // Update local state
      setSurvey(prev => ({
        ...prev,
        ...routeData
      }))

      toast.success('Route details updated!')
      setEditingRoute(false)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSavingRoute(false)
    }
  }

  function copyTrackingLink() {
    navigator.clipboard.writeText(`${window.location.origin}/track/${survey.tracking_token}`)
    toast.success('Tracking link copied!')
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-qgo-blue border-t-transparent rounded-full animate-spin" /></div>
  if (!survey) return <div className="text-center py-16 text-gray-400">Survey not found</div>

  const totalCBM = rooms.flatMap(r => r.survey_items).reduce((a, i) => a + (parseFloat(i.cbm) * i.quantity || 0), 0)
  const autoRec = recommendContainer(totalCBM)
  const selectedContainer = survey?.selected_container || autoRec.primary
  const recContainer = CONTAINERS[selectedContainer]
  const fillPct = getFillPercent(totalCBM, selectedContainer)
  const isManualOverride = survey?.selected_container && survey.selected_container !== autoRec.primary

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4 flex-wrap">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-qgo-text">{survey.reference_number}</h1>
            <StatusBadge status={survey.status} />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">Submitted {new Date(survey.created_at).toLocaleString()}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={copyTrackingLink} className="btn-secondary flex items-center gap-2 text-sm">
            <Copy className="w-3.5 h-3.5" /> Tracking Link
          </button>
          {totalCBM > 0 && (
            <Link to={`/admin/surveys/${id}/report`} className="btn-primary flex items-center gap-2 text-sm">
              <FileText className="w-3.5 h-3.5" /> View Report
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <div className="flex items-center gap-2 mb-4"><User className="w-4 h-4 text-qgo-blue" /><h3 className="font-semibold">Customer</h3></div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoRow label="Name" value={survey.customer_name} />
              <InfoRow label="Email" value={survey.customer_email} />
              <InfoRow label="Phone" value={survey.customer_phone || '—'} />
              <InfoRow label="WhatsApp" value={survey.whatsapp_number || '—'} />
            </div>
          </div>

          {/* Route & Container Details */}
          <RouteDetailsCard
            survey={survey}
            editing={editingRoute}
            onEdit={() => setEditingRoute(true)}
            onCancel={() => {
              setEditingRoute(false)
              setRouteData({
                from_address: survey.from_address || '',
                from_city: survey.from_city || '',
                from_country: survey.from_country || '',
                to_address: survey.to_address || '',
                to_city: survey.to_city || '',
                to_country: survey.to_country || '',
                selected_container: survey.selected_container || ''
              })
            }}
            routeData={routeData}
            onRouteDataChange={setRouteData}
            onSave={saveRouteData}
            saving={savingRoute}
            totalCBM={totalCBM}
          />

          <div className="card">
            <div className="flex items-center gap-2 mb-4"><Home className="w-4 h-4 text-qgo-blue" /><h3 className="font-semibold">Property</h3></div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <InfoRow label="Type"      value={survey.property_type || '—'} />
              <InfoRow label="Bedrooms"  value={survey.bedrooms || '—'} />
              <InfoRow label="Floor"     value={survey.floor || '—'} />
              <InfoRow label="Elevator"  value={survey.has_elevator ? 'Yes' : 'No'} />
              <InfoRow label="Move Type" value={survey.move_type || '—'} />
              <InfoRow label="Pref. Date" value={survey.preferred_date || '—'} />
            </div>
            {survey.notes && <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{survey.notes}</p>}
          </div>

          {rooms.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2"><Package className="w-4 h-4 text-qgo-blue" /><h3 className="font-semibold">Survey Results</h3></div>
                <span className="text-sm font-bold text-qgo-blue">{totalCBM.toFixed(2)} CBM total</span>
              </div>
              <div className="space-y-3">
                {rooms.map(room => (
                  <div key={room.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex justify-between mb-2">
                      <p className="font-medium text-sm">🏠 {room.room_name}</p>
                      <span className="text-xs text-gray-400">
                        {room.survey_items?.reduce((a,i) => a+i.quantity,0)} items ·{' '}
                        {room.survey_items?.reduce((a,i) => a+(parseFloat(i.cbm)*i.quantity||0),0).toFixed(2)} CBM
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {room.survey_items?.map(item => (
                        <div key={item.id} className="flex justify-between text-xs text-gray-500 py-0.5">
                          <span className="flex items-center gap-1">
                            {item.custom_name} ×{item.quantity}
                            {item.photos?.length > 0 && <Image size={10} className="text-blue-400" />}
                          </span>
                          <span className="font-mono">{(parseFloat(item.cbm)*item.quantity).toFixed(3)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {totalCBM > 0 && <div className="mt-4"><ContainerRecommendation totalCBM={totalCBM} selectedContainer={survey?.selected_container} /></div>}
            </div>
          )}

          {/* Voice Note */}
          {survey?.voice_note && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Mic className="w-4 h-4 text-purple-500" />
                <h3 className="font-semibold">Surveyor Voice Note</h3>
              </div>
              <audio src={survey.voice_note} controls className="w-full" />
            </div>
          )}

          {/* Customer Feedback */}
          {feedback && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-4 h-4 text-green-500" />
                <h3 className="font-semibold">Customer Feedback</h3>
              </div>

              {/* Stars */}
              <div className="flex items-center gap-1 mb-3">
                {[1,2,3,4,5].map(star => (
                  <Star
                    key={star}
                    size={20}
                    className={star <= feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">{feedback.rating}/5</span>
              </div>

              {/* Tags */}
              {feedback.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {feedback.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Comment */}
              {feedback.comment && (
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-3">
                  "{feedback.comment}"
                </p>
              )}

              {/* Recommend */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Would recommend:</span>
                <span className={feedback.would_recommend ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                  {feedback.would_recommend ? 'Yes ✓' : 'No ✗'}
                </span>
              </div>

              <p className="text-xs text-gray-400 mt-3">
                Submitted {new Date(feedback.created_at).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold mb-3 text-sm">Update Status</h3>
            <div className="space-y-1.5">
              {STATUSES.map(s => (
                <button key={s} onClick={() => updateStatus(s)} disabled={saving || survey.status === s}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                    survey.status === s ? 'bg-qgo-blue text-white font-semibold' : 'hover:bg-gray-50 text-gray-600'
                  }`}>{s.replace('_',' ')}</button>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-3 text-sm">Assign Surveyor</h3>
            <select className="input text-sm" value={survey.assigned_surveyor_id || ''}
              onChange={e => assignSurveyor(e.target.value)} disabled={saving}>
              <option value="">— Unassigned —</option>
              {surveyors.map(s => (
                <option key={s.id} value={s.id}>{s.name} {s.is_available ? '✓' : '(busy)'}</option>
              ))}
            </select>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
              <Mail className="w-4 h-4 text-qgo-blue" /> Contact Customer
            </h3>
            <div className="space-y-1.5">
              {/* Email Options */}
              {[
                { type: 'confirmation', label: 'Confirmation' },
                { type: 'assigned',     label: 'Surveyor Assigned' },
                { type: 'report_ready', label: 'Report Ready', disabled: !report },
              ].map(({ type, label, disabled }) => (
                <button key={type} onClick={() => handleEmail(type)}
                  disabled={emailSending || disabled}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors disabled:opacity-40">
                  <Send className="w-3.5 h-3.5 text-qgo-blue" /> {label}
                </button>
              ))}

              <div className="border-t border-gray-100 my-2 pt-2">
                <p className="text-xs text-gray-400 px-1 mb-2">Send via WhatsApp</p>

                {/* WhatsApp Options */}
                <div className="grid grid-cols-2 gap-2">
                  <WhatsAppButton
                    type="confirmation"
                    referenceNumber={survey?.reference_number}
                    customerName={survey?.customer_name}
                    customerPhone={survey?.whatsapp_number}
                    surveyDate={survey?.preferred_date}
                    className="!py-1.5 text-xs"
                  />
                  <WhatsAppButton
                    type="assigned"
                    referenceNumber={survey?.reference_number}
                    customerName={survey?.customer_name}
                    customerPhone={survey?.whatsapp_number}
                    surveyorName={survey?.surveyors?.name}
                    surveyDate={survey?.preferred_date}
                    className="!py-1.5 text-xs"
                  />
                  {report && (
                    <WhatsAppButton
                      type="quote_ready"
                      referenceNumber={survey?.reference_number}
                      customerName={survey?.customer_name}
                      customerPhone={survey?.whatsapp_number}
                      quoteAmount={report?.estimated_cost}
                      className="!py-1.5 text-xs col-span-2"
                    />
                  )}
                </div>

                {/* Send Feedback Request */}
                {survey?.status === 'completed' && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400 px-1 mb-2">Request Feedback</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const feedbackUrl = `${window.location.origin}/feedback/${survey.id}`
                          const message = `Hi ${survey.customer_name}! Thank you for completing your survey #${survey.reference_number}. Please share your feedback: ${feedbackUrl}`
                          const whatsappUrl = `https://wa.me/${survey.whatsapp_number?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
                          window.open(whatsappUrl, '_blank')
                        }}
                        disabled={!survey?.whatsapp_number}
                        className="flex-1 py-2 rounded-lg bg-green-500 text-white text-xs font-medium flex items-center justify-center gap-1 disabled:opacity-50 disabled:bg-gray-300"
                      >
                        <MessageCircle size={14} /> WhatsApp
                      </button>
                      <button
                        onClick={() => {
                          const feedbackUrl = `${window.location.origin}/feedback/${survey.id}`
                          const subject = `Feedback for Survey #${survey.reference_number}`
                          const body = `Hi ${survey.customer_name}!\n\nThank you for completing your survey. Please share your feedback:\n\n${feedbackUrl}`
                          window.location.href = `mailto:${survey.customer_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
                        }}
                        disabled={!survey?.customer_email}
                        className="flex-1 py-2 rounded-lg bg-blue-500 text-white text-xs font-medium flex items-center justify-center gap-1 disabled:opacity-50 disabled:bg-gray-300"
                      >
                        <Mail size={14} /> Email
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-3 text-sm">Live Tracking</h3>
            <a href={`/track/${survey.tracking_token}`} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-sm text-qgo-blue hover:underline">
              <ExternalLink className="w-4 h-4" /> Open tracking map
            </a>
          </div>

          {totalCBM > 0 && (
            <div className="card">
              <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" /> Quote & Pricing
              </h3>
              <button
                onClick={() => setShowQuote(!showQuote)}
                className="w-full btn-primary flex items-center justify-center gap-2 text-sm"
              >
                <FileText className="w-4 h-4" />
                {showQuote ? 'Hide Quote Generator' : 'Generate Quote'}
              </button>
              {report?.pdf_url && (
                <a
                  href={report.pdf_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 w-full btn-secondary flex items-center justify-center gap-2 text-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Download PDF
                </a>
              )}
            </div>
          )}

          {totalCBM > 0 && (
            <div className="card border-2 border-qgo-blue/20">
              <h3 className="font-semibold mb-3 text-sm text-qgo-blue">Survey Report</h3>
              <p className="text-3xl font-black text-qgo-blue text-center">{totalCBM.toFixed(2)}<span className="text-base font-normal text-gray-400 ml-1">CBM</span></p>
              <div className="bg-qgo-bg rounded-lg p-3 text-center my-3">
                <p className="text-sm font-bold capitalize">
                  {recContainer?.label || selectedContainer}
                </p>
                <p className="text-xs text-gray-500">
                  {isManualOverride ? 'Selected Container (Manual)' : 'AI Recommended'}
                </p>
                {isManualOverride && (
                  <span className="inline-block mt-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    Manual Override
                  </span>
                )}
              </div>
              <Link to={`/admin/surveys/${id}/report`}
                className="btn-primary w-full flex items-center justify-center gap-2 text-sm mt-3">
                <FileText className="w-4 h-4" /> Full Report / Print
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quote Generator Section */}
      {showQuote && totalCBM > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-qgo-text flex items-center gap-2">
              <DollarSign className="text-green-600" />
              Quote Generator
            </h2>
            <button
              onClick={() => setShowQuote(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <PDFQuoteGenerator
            survey={survey}
            rooms={rooms}
            report={report}
            onQuoteGenerated={(filename) => {
              load() // Reload to get updated PDF URL
            }}
          />
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="font-medium mt-0.5 capitalize">{value}</p>
    </div>
  )
}

// Container options
const CONTAINER_OPTIONS = [
  { value: 'lcl', label: 'LCL (Less than Container)', description: 'For small shipments', maxCBM: 15, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'groupage', label: 'Groupage (Shared Container)', description: 'Share with other shipments', maxCBM: 10, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: '20ft', label: '20ft Standard', description: '33 CBM capacity', maxCBM: 33, color: 'bg-green-100 text-green-700 border-green-200' },
  { value: '20ft_hc', label: '20ft High Cube', description: '37 CBM capacity', maxCBM: 37, color: 'bg-teal-100 text-teal-700 border-teal-200' },
  { value: '40ft', label: '40ft Standard', description: '67 CBM capacity', maxCBM: 67, color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: '40ft_hc', label: '40ft High Cube', description: '76 CBM capacity', maxCBM: 76, color: 'bg-red-100 text-red-700 border-red-200' }
]

function RouteDetailsCard({ survey, editing, onEdit, onCancel, routeData, onRouteDataChange, onSave, saving, totalCBM }) {
  const autoRecommended = recommendContainer(totalCBM)
  const isManualOverride = routeData.selected_container && routeData.selected_container !== autoRecommended.primary

  if (editing) {
    return (
      <div className="card !p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck size={18} className="text-qgo-blue" />
            <span className="font-semibold text-sm">Route Details</span>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Editing</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onCancel} disabled={saving} className="text-xs flex items-center gap-1 px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={14} /> Cancel
            </button>
            <button onClick={onSave} disabled={saving} className="text-xs flex items-center gap-1 px-3 py-1 bg-qgo-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
              <Save size={14} /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* From Section */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
            Origin (From)
          </label>
          <input
            className="input text-sm"
            placeholder="Full address"
            value={routeData.from_address}
            onChange={e => onRouteDataChange({ ...routeData, from_address: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              className="input text-sm"
              placeholder="City"
              value={routeData.from_city}
              onChange={e => onRouteDataChange({ ...routeData, from_city: e.target.value })}
            />
            <input
              className="input text-sm"
              placeholder="Country"
              value={routeData.from_country}
              onChange={e => onRouteDataChange({ ...routeData, from_country: e.target.value })}
            />
          </div>
        </div>

        {/* To Section */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
            Destination (To)
          </label>
          <input
            className="input text-sm"
            placeholder="Full address"
            value={routeData.to_address}
            onChange={e => onRouteDataChange({ ...routeData, to_address: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              className="input text-sm"
              placeholder="City"
              value={routeData.to_city}
              onChange={e => onRouteDataChange({ ...routeData, to_city: e.target.value })}
            />
            <input
              className="input text-sm"
              placeholder="Country"
              value={routeData.to_country}
              onChange={e => onRouteDataChange({ ...routeData, to_country: e.target.value })}
            />
          </div>
        </div>

        {/* Container Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
            <Truck size={14} />
            Container Type {isManualOverride && <span className="text-amber-600">(Manual Override)</span>}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {/* Auto Recommend Option */}
            <button
              type="button"
              onClick={() => onRouteDataChange({ ...routeData, selected_container: '' })}
              className={`p-2 rounded-lg border-2 text-left transition-all ${
                !routeData.selected_container
                  ? 'border-qgo-blue bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold">Auto Recommend</span>
                {!routeData.selected_container && <span className="text-xs bg-qgo-blue text-white px-1.5 py-0.5 rounded">AI</span>}
              </div>
              <p className="text-xs text-gray-500">
                {autoRecommended.primary} ({CONTAINERS[autoRecommended.primary]?.label})
              </p>
            </button>

            {/* Container Options */}
            {CONTAINER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onRouteDataChange({ ...routeData, selected_container: opt.value })}
                className={`p-2 rounded-lg border-2 text-left transition-all ${
                  routeData.selected_container === opt.value
                    ? 'border-qgo-blue bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold">{opt.label}</span>
                  {routeData.selected_container === opt.value && (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${opt.color}`}>Selected</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{opt.description}</p>
              </button>
            ))}
          </div>

          {/* CBM indicator */}
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Current CBM:</span>
              <span className="font-bold text-qgo-blue">{totalCBM.toFixed(2)} CBM</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // View mode
  return (
    <div className="card !p-0 overflow-hidden">
      <div className="p-3 border-b border-gray-100 flex items-center justify-between">
        <span className="font-semibold text-sm flex items-center gap-2">
          <Truck size={16} className="text-qgo-blue" />
          Route & Container
        </span>
        <button onClick={onEdit} className="text-xs flex items-center gap-1 px-2 py-1 text-qgo-blue hover:bg-blue-50 rounded-lg transition-colors">
          <Edit2 size={12} /> Edit
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* Origin */}
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-bold text-blue-700">1</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-0.5">From</p>
            <p className="text-sm font-medium truncate">{routeData.from_address || '—'}</p>
            <p className="text-xs text-gray-500">
              {routeData.from_city && routeData.from_country
                ? `${routeData.from_city}, ${routeData.from_country}`
                : routeData.from_city || routeData.from_country || '—'
              }
            </p>
          </div>
        </div>

        {/* Destination */}
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-bold text-green-700">2</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-0.5">To</p>
            <p className="text-sm font-medium truncate">{routeData.to_address || '—'}</p>
            <p className="text-xs text-gray-500">
              {routeData.to_city && routeData.to_country
                ? `${routeData.to_city}, ${routeData.to_country}`
                : routeData.to_city || routeData.to_country || '—'
              }
            </p>
          </div>
        </div>

        {/* Container Selection */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                <Truck size={12} />
                Container Type
                {isManualOverride && (
                  <span className="text-amber-600 font-medium"> (Manual)</span>
                )}
              </p>
              <p className="text-sm font-bold text-qgo-blue">
                {routeData.selected_container
                  ? CONTAINER_OPTIONS.find(c => c.value === routeData.selected_container)?.label || routeData.selected_container
                  : `${autoRecommended.primary} (${CONTAINERS[autoRecommended.primary]?.label})`
                }
              </p>
              {!routeData.selected_container && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Based on {totalCBM.toFixed(2)} CBM
                </p>
              )}
            </div>

            {/* Manual override indicator */}
            {isManualOverride && (
              <span className="text-amber-600 text-xs bg-amber-100 px-2 py-1 rounded-full">
                Override
              </span>
            )}
          </div>
        </div>

        {/* CBM Progress */}
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600">Current Volume</span>
            <span className="font-bold text-qgo-blue">{totalCBM.toFixed(2)} CBM</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-qgo-blue rounded-full transition-all"
              style={{
                width: `${Math.min((totalCBM / (routeData.selected_container
                  ? (CONTAINER_OPTIONS.find(c => c.value === routeData.selected_container)?.maxCBM || 33)
                  : CONTAINERS[autoRecommended.primary]?.maxCBM || 33)) * 100, 100)}%`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
