import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import QgoLogo from '@/components/common/QgoLogo'
import SignatureCanvas from '@/components/common/SignatureCanvas'
import toast from 'react-hot-toast'
import { CheckCircle, Clock, Package, MapPin, Calendar, FileText, DollarSign, XCircle, AlertCircle, Upload, ExternalLink, MessageCircle } from 'lucide-react'
import { formatCurrency, formatCurrency as formatPrice } from '@/utils/pricing'
import { CONTAINERS, getFillPercent, formatCBM } from '@/utils/cbm'
import WhatsAppButton from '@/components/common/WhatsAppButton'

const STATUS_STEPS = [
  { key: 'pending', label: 'Request Received', icon: AlertCircle },
  { key: 'assigned', label: 'Surveyor Assigned', icon: Package },
  { key: 'in_progress', label: 'Survey In Progress', icon: Clock },
  { key: 'surveyed', label: 'Survey Completed', icon: CheckCircle },
  { key: 'completed', label: 'Quote Ready', icon: DollarSign },
]

export default function CustomerPortal() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [survey, setSurvey] = useState(null)
  const [rooms, setRooms] = useState([])
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [signature, setSignature] = useState(null)

  useEffect(() => {
    loadSurvey()
  }, [token])

  async function loadSurvey() {
    setLoading(true)
    try {
      // Get survey by tracking token or reference number
      const { data: s, error } = await supabase
        .from('survey_requests')
        .select('*, surveyors(name, phone)')
        .or(`tracking_token.eq.${token},reference_number.eq.${token}`)
        .single()

      if (error || !s) {
        toast.error('Survey not found')
        return
      }

      setSurvey(s)

      // Load rooms and items
      const { data: rm } = await supabase
        .from('survey_rooms')
        .select('*, survey_items(*)')
        .eq('survey_request_id', s.id)

      setRooms(rm || [])

      // Load report
      const { data: rp } = await supabase
        .from('survey_reports')
        .select('*')
        .eq('survey_request_id', s.id)
        .maybeSingle()

      setReport(rp)
      if (rp?.customer_signature_data) {
        setSignature(rp.customer_signature_data)
      }
    } catch (err) {
      console.error('Load error:', err)
      toast.error('Failed to load survey')
    } finally {
      setLoading(false)
    }
  }

  async function handleQuoteAccept() {
    if (!signature) {
      return toast.error('Please provide your signature first')
    }

    try {
      await supabase
        .from('survey_reports')
        .update({
          customer_signature_data: signature,
          customer_signed_at: new Date().toISOString(),
          quote_status: 'accepted'
        })
        .eq('survey_request_id', survey?.id)

      toast.success('Quote accepted! Thank you.')
      loadSurvey()
    } catch (err) {
      toast.error('Failed to accept quote')
    }
  }

  async function handleQuoteReject() {
    if (!confirm('Are you sure you want to reject this quote?')) return

    try {
      await supabase
        .from('survey_reports')
        .update({ quote_status: 'rejected' })
        .eq('survey_request_id', survey?.id)

      toast.success('Quote rejected')
      loadSurvey()
    } catch (err) {
      toast.error('Failed to reject quote')
    }
  }

  async function handleFileUpload(event) {
    const file = event.target.files[0]
    if (!file) return

    try {
      const fileName = `${survey?.id}/${Date.now()}-${file.name}`
      const { error } = await supabase.storage
        .from('customer-uploads')
        .upload(fileName, file)

      if (error) throw error
      toast.success('File uploaded successfully')
    } catch (err) {
      toast.error('Failed to upload file')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-qgo-bg">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-qgo-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your portal...</p>
        </div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-qgo-bg">
        <div className="text-center">
          <AlertCircle size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Survey Not Found</h2>
          <p className="text-gray-500 mb-4">Please check your reference number or contact support.</p>
          <button onClick={() => navigate('/')} className="btn-primary">Go Home</button>
        </div>
      </div>
    )
  }

  const totalCBM = rooms?.flatMap(r => r.survey_items).reduce((a, i) => a + (parseFloat(i.cbm) * i.quantity || 0), 0) || 0
  const containerType = survey?.selected_container || report?.recommended_container
  const container = CONTAINERS[containerType] || { label: containerType, color: '#0D5C9E' }
  const currentStatusIndex = STATUS_STEPS.findIndex(s => s.key === survey?.status)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-qgo-navy text-white py-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <QgoLogo white size="md" />
          <div className="text-right">
            <p className="font-bold text-lg">{survey.reference_number}</p>
            <p className="text-white/60 text-sm">Customer Portal</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Status Timeline */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-bold text-lg mb-4">Survey Progress</h2>

          <div className="relative">
            <div className="absolute top-5 left-5 right-5 h-1 bg-gray-200">
              <div
                className="h-full bg-qgo-blue transition-all duration-500"
                style={{ width: `${((currentStatusIndex + 1) / STATUS_STEPS.length) * 100}%` }}
              />
            </div>

            <div className="relative flex justify-between">
              {STATUS_STEPS.map((step, index) => {
                const Icon = step.icon
                const isCompleted = index <= currentStatusIndex
                const isCurrent = index === currentStatusIndex

                return (
                  <div key={step.key} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                      isCompleted ? 'bg-qgo-blue text-white' : 'bg-gray-200 text-gray-400'
                    } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}>
                      <Icon size={18} />
                    </div>
                    <p className={`text-xs mt-2 text-center max-w-[70px] ${
                      isCurrent ? 'text-qgo-blue font-semibold' : 'text-gray-500'
                    }`}>{step.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-bold text-lg mb-4">Your Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Name</p>
              <p className="font-medium">{survey.customer_name}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium">{survey.customer_email}</p>
            </div>
            <div>
              <p className="text-gray-500">From</p>
              <p className="font-medium">{survey.from_city}, {survey.from_country}</p>
            </div>
            <div>
              <p className="text-gray-500">To</p>
              <p className="font-medium">{survey.to_city || '—'}, {survey.to_country || '—'}</p>
            </div>
          </div>
        </div>

        {/* Survey Results */}
        {rooms?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Package className="text-qgo-blue" /> Survey Results
            </h2>

            <div className="bg-qgo-bg rounded-lg p-4 mb-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-qgo-blue">{formatCBM(totalCBM)}</p>
                  <p className="text-xs text-gray-500">Total CBM</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{getFillPercent(totalCBM, containerType)}%</p>
                  <p className="text-xs text-gray-500">Container Fill</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{container.label}</p>
                  <p className="text-xs text-gray-500">Container</p>
                </div>
              </div>
            </div>

            {/* Rooms List */}
            <div className="space-y-3">
              {rooms.map(room => (
                <details key={room.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <summary className="px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 flex items-center justify-between">
                    <span className="font-medium">🏠 {room.room_name}</span>
                    <span className="text-xs text-gray-500">
                      {room.survey_items?.length || 0} items · {(room.survey_items || []).reduce((a, i) => a + (parseFloat(i.cbm) * i.quantity || 0), 0).toFixed(2)} CBM
                    </span>
                  </summary>
                  <div className="p-4 space-y-2">
                    {(room.survey_items || []).map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.custom_name} × {item.quantity}</span>
                        <span className="font-mono text-gray-500">{(parseFloat(item.cbm) * item.quantity).toFixed(3)} CBM</span>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Quote Section */}
        {report && survey?.status === 'completed' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <DollarSign className="text-green-600" /> Your Quote
            </h2>

            {report.estimated_cost ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 text-center">
                  <p className="text-sm text-gray-600 mb-1">Estimated Cost</p>
                  <p className="text-4xl font-black text-green-600">
                    {formatPrice(report.estimated_cost || 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Valid for 30 days from quote date</p>
                </div>

                {/* Signature Section */}
                {report.quote_status !== 'accepted' && (
                  <div className="space-y-4">
                    <SignatureCanvas
                      value={signature}
                      onChange={setSignature}
                    />

                    <div className="flex gap-3">
                      <button
                        onClick={handleQuoteAccept}
                        disabled={!signature}
                        className="flex-1 btn-primary flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={18} /> Accept Quote
                      </button>
                      <button
                        onClick={handleQuoteReject}
                        className="flex-1 btn-secondary flex items-center justify-center gap-2 text-red-600 hover:bg-red-50"
                      >
                        <XCircle size={18} /> Reject
                      </button>
                    </div>
                  </div>
                )}

                {report.quote_status === 'accepted' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                    <p className="font-semibold text-green-700">Quote Accepted!</p>
                    <p className="text-sm text-green-600">We'll be in touch soon with next steps.</p>
                  </div>
                )}

                {report.pdf_url && (
                  <a
                    href={report.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full btn-secondary flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={18} /> Download Full Quote PDF
                  </a>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Quote is being prepared. You'll receive it soon!</p>
              </div>
            )}
          </div>
        )}

        {/* Tracking */}
        {survey?.tracking_token && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <MapPin className="text-qgo-blue" /> Live Tracking
            </h2>

            <a
              href={`/track/${survey.tracking_token}`}
              target="_blank"
              rel="noreferrer"
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <ExternalLink size={18} /> Track Your Shipment
            </a>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-bold text-lg mb-4">Quick Actions</h2>

          <div className="space-y-3">
            <WhatsAppButton
              type="tracking"
              trackingToken={survey?.tracking_token}
              customerName={survey?.customer_name}
              className="w-full justify-center"
            />

            <div className="border-t border-gray-100 pt-3">
              <label className="text-sm text-gray-600 mb-2 block">Upload Additional Documents</label>
              <div className="flex gap-2">
                <label className="flex-1">
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                  <span className="w-full btn-secondary flex items-center justify-center gap-2 cursor-pointer">
                    <Upload size={16} /> Choose File
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-500">
        <p>Need help? Contact us at <a href="mailto:support@qgocargo.com" className="text-qgo-blue hover:underline">support@qgocargo.com</a></p>
        <p className="mt-1">Or WhatsApp us anytime!</p>
      </footer>
    </div>
  )
}
