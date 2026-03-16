import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { CONTAINERS, formatCBM, recommendContainer } from '@/utils/cbm'
import { ArrowLeft, Download, Printer, Edit2, Save, X, Truck, MapPin, RefreshCw, CheckCircle2, Clock, UserCheck, ClipboardCheck, XCircle, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

// Container options for manual selection
const CONTAINER_OPTIONS = [
  { value: 'lcl', label: 'LCL (Less than Container)', description: 'For small shipments', maxCBM: 15 },
  { value: 'groupage', label: 'Groupage (Shared Container)', description: 'Share with other shipments', maxCBM: 10 },
  { value: '20ft', label: '20ft Standard', description: '33 CBM capacity', maxCBM: 33 },
  { value: '20ft_hc', label: '20ft High Cube', description: '37 CBM capacity', maxCBM: 37 },
  { value: '40ft', label: '40ft Standard', description: '67 CBM capacity', maxCBM: 67 },
  { value: '40ft_hc', label: '40ft High Cube', description: '76 CBM capacity', maxCBM: 76 }
]

// Status options with colors and icons
const STATUS_OPTIONS = [
  {
    value: 'pending',
    label: 'Pending',
    description: 'Waiting to be assigned',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    bgColor: 'bg-yellow-50'
  },
  {
    value: 'assigned',
    label: 'Assigned',
    description: 'Surveyor assigned',
    icon: UserCheck,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    bgColor: 'bg-blue-50'
  },
  {
    value: 'in_progress',
    label: 'In Progress',
    description: 'Surveyor is on site',
    icon: RefreshCw,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    bgColor: 'bg-purple-50'
  },
  {
    value: 'surveyed',
    label: 'Surveyed',
    description: 'Survey completed',
    icon: ClipboardCheck,
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    bgColor: 'bg-indigo-50'
  },
  {
    value: 'completed',
    label: 'Completed',
    description: 'Process finished',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-700 border-green-200',
    bgColor: 'bg-green-50'
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
    description: 'Request cancelled',
    icon: XCircle,
    color: 'bg-red-100 text-red-700 border-red-200',
    bgColor: 'bg-red-50'
  }
]

export default function SurveyReport() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [survey, setSurvey]   = useState(null)
  const [report, setReport]   = useState(null)
  const [rooms, setRooms]     = useState([])
  const [loading, setLoading] = useState(true)
  const printRef = useRef()

  // Editing states
  const [editingRoute, setEditingRoute] = useState(false)
  const [routeData, setRouteData] = useState({
    from_address: '', from_city: '', from_country: '',
    to_address: '', to_city: '', to_country: '',
    selected_container: ''
  })
  const [savingRoute, setSavingRoute] = useState(false)

  // Status modal states
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => { load() }, [id])

  async function load() {
    const [{ data: sr }, { data: rpt }, { data: rm }] = await Promise.all([
      supabase.from('survey_requests').select('*').eq('id', id).single(),
      supabase.from('survey_reports').select('*').eq('survey_request_id', id).maybeSingle(),
      supabase.from('survey_rooms').select('*, survey_items(*, items(name))').eq('survey_request_id', id)
    ])
    setSurvey(sr); setReport(rpt); setRooms(rm || [])
    // Initialize route data
    if (sr) {
      setRouteData({
        from_address: sr.from_address || '',
        from_city: sr.from_city || '',
        from_country: sr.from_country || '',
        to_address: sr.to_address || '',
        to_city: sr.to_city || '',
        to_country: sr.to_country || '',
        selected_container: sr.selected_container || ''
      })
    }
    setLoading(false)
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
        selected_container: routeData.selected_container || null
      }).eq('id', id)

      if (error) throw error

      // Update local state
      setSurvey(prev => ({ ...prev, ...routeData }))

      // Update report if container changed
      if (routeData.selected_container) {
        const totalCBM = report?.total_cbm || 0
        await supabase.from('survey_reports').update({
          recommended_container: routeData.selected_container
        }).eq('survey_request_id', id)
        setReport(prev => ({ ...prev, recommended_container: routeData.selected_container }))
      }

      toast.success('Route details updated!')
      setEditingRoute(false)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSavingRoute(false)
    }
  }

  async function updateStatus(newStatus) {
    if (!newStatus) return

    setUpdatingStatus(true)
    try {
      const { error } = await supabase.from('survey_requests').update({
        status: newStatus
      }).eq('id', id)

      if (error) throw error

      setSurvey(prev => ({ ...prev, status: newStatus }))
      setShowStatusModal(false)
      setSelectedStatus('')

      const statusLabel = STATUS_OPTIONS.find(s => s.value === newStatus)?.label || newStatus
      toast.success(`Status updated to ${statusLabel}`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setUpdatingStatus(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  if (loading) return <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-qgo-blue border-t-transparent rounded-full animate-spin"/></div>
  if (!survey) return <p className="text-center text-gray-400 py-12">Survey not found</p>

  const totalItems = rooms.flatMap(r => r.survey_items).reduce((a, i) => a + i.quantity, 0)
  const totalCBM   = report?.total_cbm || rooms.flatMap(r => r.survey_items).reduce((a, i) => a + (Number(i.cbm) * i.quantity), 0)
  // Use selected_container if manually set, otherwise use recommended from report
  const containerKey = survey?.selected_container || report?.recommended_container
  const container  = containerKey ? CONTAINERS[containerKey] : null
  const isManualOverride = survey?.selected_container && survey.selected_container !== report?.recommended_container

  // Get current status info
  const currentStatus = STATUS_OPTIONS.find(s => s.value === survey?.status) || STATUS_OPTIONS[0]

  return (
    <div className="py-4 space-y-4">
      {/* Header - no print */}
      <div className="no-print flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-qgo-blue font-bold text-sm">{survey.reference_number}</p>
            <button
              onClick={() => setShowStatusModal(true)}
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full border transition-colors flex items-center gap-1 ${currentStatus.color} hover:opacity-80`}
            >
              <currentStatus.icon size={12} />
              {currentStatus.label}
            </button>
          </div>
          <p className="font-semibold text-qgo-text">{survey.customer_name}</p>
        </div>
      </div>

      {/* Route & Container Details Card - no print */}
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

      {/* Print controls - hidden on print */}
      <div className="no-print flex items-center gap-3">
        <h1 className="text-lg font-bold text-qgo-text flex-1">Survey Report</h1>
        <button onClick={handlePrint}
          className="btn-secondary text-sm flex items-center gap-2">
          <Printer className="w-4 h-4" /> Print / PDF
        </button>
      </div>

      {/* Report Document */}
      <div ref={printRef} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-none" id="report-doc">
        {/* Header */}
        <div className="bg-qgo-blue px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-white text-qgo-blue font-black text-sm px-2 py-0.5 rounded-lg">Q</div>
                <span className="text-white font-bold text-xl">Q'go <span className="text-qgo-cyan">Cargo</span></span>
              </div>
              <p className="text-white/60 text-xs">www.qgocargo.com</p>
            </div>
            <div className="text-right">
              <p className="text-white font-bold text-lg">SURVEY REPORT</p>
              <p className="text-white/60 text-sm font-mono">{survey.reference_number}</p>
              <p className="text-white/60 text-xs">{format(new Date(survey.created_at), 'dd MMM yyyy')}</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Customer & Move Details */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Customer Details</h3>
              <p className="font-bold text-qgo-text text-lg">{survey.customer_name}</p>
              <p className="text-gray-600 text-sm">{survey.customer_email}</p>
              {survey.customer_phone && <p className="text-gray-600 text-sm">{survey.customer_phone}</p>}
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Move Details</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-400">From:</span> <span className="font-medium">{survey.from_address}, {survey.from_city}</span></p>
                <p><span className="text-gray-400">To:</span> <span className="font-medium">{survey.to_city || '—'}, {survey.to_country || '—'}</span></p>
                <p><span className="text-gray-400">Type:</span> <span className="font-medium capitalize">{survey.move_type}</span></p>
                <p><span className="text-gray-400">Property:</span> <span className="font-medium">{survey.property_type} · {survey.bedrooms}</span></p>
              </div>
            </div>
          </div>

          {/* CBM Summary */}
          <div className="bg-qgo-bg rounded-2xl p-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Survey Summary</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-black text-qgo-blue">{formatCBM(totalCBM)}</p>
                <p className="text-xs text-gray-500 mt-1">Total CBM</p>
              </div>
              <div className="text-center border-x border-gray-200">
                <p className="text-3xl font-black text-qgo-text">{totalItems}</p>
                <p className="text-xs text-gray-500 mt-1">Total Items</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-green-600">{rooms.length}</p>
                <p className="text-xs text-gray-500 mt-1">Rooms</p>
              </div>
            </div>
          </div>

          {/* Container Recommendation */}
          {container && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                {isManualOverride ? 'Selected Container (Manual Override)' : 'Recommended Container'}
              </h3>
              <div className={`border-2 rounded-xl p-4 flex items-center gap-4 ${isManualOverride ? 'border-amber-400 bg-amber-50' : 'border-qgo-blue'}`}>
                <div className="text-4xl">🚢</div>
                <div className="flex-1">
                  <p className="font-bold text-qgo-text text-lg">{container.label}</p>
                  <p className="text-sm text-gray-500">Capacity: {container.maxCBM} CBM · Max Weight: {(container.maxKg/1000).toFixed(1)}t</p>
                  {isManualOverride && <p className="text-xs text-amber-600 mt-1">Manually selected by admin</p>}
                  {/* Fill bar */}
                  <div className="mt-2 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className="h-full bg-qgo-blue rounded-full transition-all"
                      style={{ width: `${Math.min((totalCBM / container.maxCBM) * 100, 100)}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{formatCBM(totalCBM)} / {container.maxCBM} CBM ({Math.round((totalCBM / container.maxCBM) * 100)}% filled)</p>
                </div>
              </div>
            </div>
          )}

          {/* Items by Room */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Items by Room</h3>
            {rooms.map(room => {
              const roomCBM = room.survey_items.reduce((a, i) => a + (Number(i.cbm) * i.quantity), 0)
              return (
                <div key={room.id} className="mb-6">
                  <div className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-t-lg border border-gray-100">
                    <p className="font-bold text-qgo-text text-sm">🏠 {room.room_name}</p>
                    <p className="text-xs text-gray-400">{formatCBM(roomCBM)} CBM</p>
                  </div>
                  <table className="w-full text-sm border border-gray-100 border-t-0">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs text-gray-400 font-medium">Item</th>
                        <th className="px-4 py-2 text-center text-xs text-gray-400 font-medium">Qty</th>
                        <th className="px-4 py-2 text-right text-xs text-gray-400 font-medium">CBM Each</th>
                        <th className="px-4 py-2 text-right text-xs text-gray-400 font-medium">Total CBM</th>
                      </tr>
                    </thead>
                    <tbody>
                      {room.survey_items.map(item => (
                        <tr key={item.id} className="border-b border-gray-50">
                          <td className="px-4 py-2">
                            {item.custom_name || item.items?.name}
                            {item.is_fragile && <span className="ml-2 text-xs text-red-400">Fragile</span>}
                          </td>
                          <td className="px-4 py-2 text-center font-bold">{item.quantity}</td>
                          <td className="px-4 py-2 text-right font-mono text-gray-500">{Number(item.cbm).toFixed(3)}</td>
                          <td className="px-4 py-2 text-right font-mono font-bold">{(Number(item.cbm) * item.quantity).toFixed(3)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50">
                        <td colSpan={3} className="px-4 py-2 text-right text-xs font-bold text-gray-500">Room Total</td>
                        <td className="px-4 py-2 text-right font-mono font-black text-qgo-blue">{formatCBM(roomCBM)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )
            })}
          </div>

          {/* Grand Total */}
          <div className="border-t-2 border-qgo-blue pt-4 flex justify-end">
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Grand Total</p>
              <p className="text-3xl font-black text-qgo-blue">{formatCBM(totalCBM)} CBM</p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 pt-6 flex items-center justify-between text-xs text-gray-400">
            <p>Q'go Cargo Survey Platform · {format(new Date(), 'dd MMM yyyy')}</p>
            <p>This report is confidential and prepared for {survey.customer_name}</p>
          </div>
        </div>
      </div>

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-qgo-text flex items-center gap-2">
                <RefreshCw size={20} className="text-qgo-blue" />
                Change Status
              </h3>
              <button
                onClick={() => {
                  setShowStatusModal(false)
                  setSelectedStatus('')
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Survey:</span> {survey?.reference_number}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Current:</span> {currentStatus.label}
              </p>
            </div>

            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium text-gray-700">Select New Status:</label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {STATUS_OPTIONS.map(status => (
                  <button
                    key={status.value}
                    onClick={() => setSelectedStatus(status.value)}
                    disabled={updatingStatus}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all flex items-center gap-3 ${
                      selectedStatus === status.value
                        ? 'border-qgo-blue bg-blue-50'
                        : status.value === survey?.status
                        ? 'border-gray-300 bg-gray-50 opacity-60'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <status.icon size={18} className={selectedStatus === status.value ? 'text-qgo-blue' : 'text-gray-500'} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{status.label}</p>
                      <p className="text-xs text-gray-500">{status.description}</p>
                    </div>
                    {selectedStatus === status.value && (
                      <div className="w-5 h-5 bg-qgo-blue rounded-full flex items-center justify-center">
                        <CheckCircle2 size={12} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowStatusModal(false)
                  setSelectedStatus('')
                }}
                disabled={updatingStatus}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => updateStatus(selectedStatus)}
                disabled={!selectedStatus || updatingStatus || selectedStatus === survey?.status}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                {updatingStatus ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Update Status
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          #report-doc { margin: 0; }
        }
      `}</style>
    </div>
  )
}

// Route Details Card Component
function RouteDetailsCard({ survey, editing, onEdit, onCancel, routeData, onRouteDataChange, onSave, saving, totalCBM }) {
  const autoRecommended = recommendContainer(totalCBM)
  const isManualOverride = routeData.selected_container && routeData.selected_container !== autoRecommended.primary

  if (editing) {
    return (
      <div className="card !p-4 space-y-4 no-print">
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
                    <span className="text-xs bg-qgo-blue text-white px-1.5 py-0.5 rounded">Selected</span>
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
    <div className="card !p-0 overflow-hidden no-print">
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
