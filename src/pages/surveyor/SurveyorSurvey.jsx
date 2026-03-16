import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import GPSTracker from '@/components/surveyor/GPSTracker'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { calcCBM, recommendContainer, CONTAINERS, getFillPercent } from '@/utils/cbm'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, CheckCircle, Package, MapPin, Edit2, Save, X, Truck, Camera, Mic, ChevronDown } from 'lucide-react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import CBMCounter from './components/CBMCounter'
import RoomTabs from './components/RoomTabs'
import QuickAddModal from './components/QuickAddModal'
import ItemCard from './components/ItemCard'

// Custom marker icons
const fromIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
})

const toIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
})

export default function SurveyorSurvey() {
  const { id } = useParams()
  const { user, profile } = useAuth()
  const [surveyor, setSurveyor] = useState(null)
  const navigate = useNavigate()
  const [survey, setSurvey] = useState(null)
  const [rooms, setRooms] = useState([])
  const [items, setItems] = useState([])
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeRoom, setActiveRoom] = useState(null)
  const [addRoomModal, setAddRoomModal] = useState(false)
  const [addItemModal, setAddItemModal] = useState(false)
  const [newRoom, setNewRoom] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingRoute, setEditingRoute] = useState(false)
  const [routeData, setRouteData] = useState({
    from_address: '', from_city: '', from_country: '',
    to_address: '', to_city: '', to_country: '',
    selected_container: ''
  })
  const [savingRoute, setSavingRoute] = useState(false)
  const [expandedRoute, setExpandedRoute] = useState(false)

  useEffect(() => { load() }, [id])

  async function load() {
    if (user) {
      const { data: sv } = await supabase.from('surveyors').select('*').eq('user_id', user.id).maybeSingle()
      setSurveyor(sv)
    }
    const [{ data: s }, { data: rm }, { data: it }, { data: ct }] = await Promise.all([
      supabase.from('survey_requests').select('id,reference_number,customer_name,customer_email,customer_phone,from_address,from_lat,from_lng,from_city,from_country,to_address,to_lat,to_lng,to_city,to_country,move_type,selected_container,status').eq('id', id).single(),
      supabase.from('survey_rooms').select('*,survey_items(*)').eq('survey_request_id', id).order('created_at'),
      supabase.from('items').select('id,name,name_ar,default_cbm,default_weight_kg,is_fragile,category_id').eq('is_active', true).order('name'),
      supabase.from('item_categories').select('*').order('sort_order')
    ])
    setSurvey(s); setRooms(rm ?? []); setItems(it ?? []); setCats(ct ?? [])
    if (rm?.length > 0 && !activeRoom) setActiveRoom(rm[0].id)
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

  async function addRoom() {
    if (!newRoom.trim()) return
    setSaving(true)
    const { data } = await supabase.from('survey_rooms').insert([{ survey_request_id: id, room_name: newRoom }]).select().single()
    if (data) { setRooms(p => [...p, { ...data, survey_items: [] }]); setActiveRoom(data.id); setNewRoom('') }
    setAddRoomModal(false); setSaving(false)
  }

  async function addItemToRoom(item) {
    const cbm = parseFloat(item.default_cbm) || 0
    const { data, error } = await supabase.from('survey_items').insert([{
      survey_room_id: activeRoom,
      item_id: item.id,
      custom_name: item.name,
      cbm,
      weight_kg: item.default_weight_kg,
      is_fragile: item.is_fragile,
      quantity: 1
    }]).select().single()
    if (error) { toast.error(error.message); return }
    setRooms(p => p.map(r => r.id === activeRoom
      ? { ...r, survey_items: [...(r.survey_items || []), data] }
      : r))
    toast.success(`${item.name} added!`)
  }

  async function removeItem(roomId, itemId) {
    await supabase.from('survey_items').delete().eq('id', itemId)
    setRooms(p => p.map(r => r.id === roomId
      ? { ...r, survey_items: r.survey_items.filter(i => i.id !== itemId) }
      : r))
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

      setSurvey(prev => ({ ...prev, ...routeData }))
      toast.success('Route details updated!')
      setEditingRoute(false)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSavingRoute(false)
    }
  }

  async function completeSurvey() {
    const allItems = rooms.flatMap(r => r.survey_items || [])
    const totalCBM = allItems.reduce((a, i) => a + (parseFloat(i.cbm) || 0), 0)
    const autoRec = recommendContainer(totalCBM)
    const finalContainer = survey?.selected_container || autoRec.primary
    const finalRec = survey?.selected_container
      ? { ...autoRec, primary: survey.selected_container, reason: survey.selected_container !== autoRec.primary ? 'Manual override' : 'AI selected' }
      : autoRec

    setSaving(true)
    await Promise.all([
      supabase.from('survey_requests').update({ status: 'surveyed' }).eq('id', id),
      supabase.from('survey_reports').upsert([{
        survey_request_id: id,
        total_items: allItems.length,
        total_cbm: totalCBM,
        recommended_container: finalContainer,
        container_recommendation: { ...finalRec, totalCBM },
        status: 'draft'
      }])
    ])
    toast.success('Survey completed!')
    navigate('/surveyor')
    setSaving(false)
  }

  if (loading) return (
    <div className="flex justify-center py-16">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 border-4 border-t-transparent rounded-full"
        style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
      />
    </div>
  )
  if (!survey) return <div className="text-center py-16" style={{ color: 'var(--text-tertiary)' }}>Survey not found</div>

  const allItems = rooms.flatMap(r => r.survey_items || [])
  const totalCBM = allItems.reduce((a, i) => a + (parseFloat(i.cbm) || 0), 0)
  const autoRec = recommendContainer(totalCBM)
  const selectedContainer = survey?.selected_container || autoRec.primary
  const recContainer = CONTAINERS[selectedContainer]
  const isManualOverride = survey?.selected_container && survey.selected_container !== autoRec.primary
  const currentRoom = rooms.find(r => r.id === activeRoom)

  return (
    <div className="p-4 space-y-4 pb-32">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-4"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium px-2 py-0.5 rounded-full inline-block mb-2" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
              {survey.reference_number}
            </p>
            <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{survey.customer_name}</h2>
            <div className="flex items-center gap-1 text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              <MapPin size={14} />
              <span className="truncate">{survey.from_address || 'Address not set'}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CBM Counter */}
      <CBMCounter
        totalCBM={totalCBM}
        containerType={selectedContainer}
        isManualOverride={isManualOverride}
      />

      {/* Route Card (Collapsible) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <button
          onClick={() => setExpandedRoute(!expandedRoute)}
          className="w-full p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)' }}>
              <Truck size={18} className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Route & Container</p>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {routeData.from_city || 'Origin'} → {routeData.to_city || 'Destination'}
              </p>
            </div>
          </div>
          <ChevronDown
            size={18}
            className={`transition-transform ${expandedRoute ? 'rotate-180' : ''}`}
            style={{ color: 'var(--text-tertiary)' }}
          />
        </button>

        <AnimatePresence>
          {expandedRoute && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3">
                {/* Route Details */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>From</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{routeData.from_address || '—'}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{routeData.from_city}, {routeData.from_country}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>To</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{routeData.to_address || '—'}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{routeData.to_city}, {routeData.to_country}</p>
                  </div>
                </div>

                <button
                  onClick={() => setEditingRoute(true)}
                  className="w-full py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--color-primary)' }}
                >
                  <Edit2 size={14} /> Edit Route
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* GPS Tracker */}
      {surveyor && (
        <GPSTracker surveyorId={surveyor.id} surveyRequestId={id} />
      )}

      {/* Room Tabs */}
      <div>
        <RoomTabs
          rooms={rooms}
          activeRoom={activeRoom}
          onSelectRoom={setActiveRoom}
          onAddRoom={() => setAddRoomModal(true)}
        />

        {/* Room Content */}
        {currentRoom ? (
          <div className="mt-3 space-y-2">
            <AnimatePresence mode="popLayout">
              {(currentRoom.survey_items || []).map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onDelete={(itemId) => removeItem(currentRoom.id, itemId)}
                />
              ))}
            </AnimatePresence>

            {(currentRoom.survey_items || []).length === 0 && (
              <div className="text-center py-8 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <Package size={32} className="mx-auto mb-2" style={{ color: 'var(--text-tertiary)' }} />
                <p style={{ color: 'var(--text-secondary)' }}>No items yet</p>
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Tap + to add items</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Add a room to start</p>
          </div>
        )}
      </div>

      {/* Add Item FAB */}
      {activeRoom && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setAddItemModal(true)}
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-30"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <Plus size={24} className="text-white" />
        </motion.button>
      )}

      {/* Complete Survey Button */}
      {allItems.length > 0 && (
        <motion.button
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-4 left-4 right-4 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg z-30 text-white max-w-2xl mx-auto"
          style={{ backgroundColor: '#16a34a' }}
          onClick={completeSurvey}
          disabled={saving}
        >
          <CheckCircle size={20} /> {saving ? 'Saving...' : 'Complete Survey'}
        </motion.button>
      )}

      {/* Add Room Modal */}
      <AnimatePresence>
        {addRoomModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setAddRoomModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Add Room</h3>
              <input
                className="w-full p-3 rounded-xl text-sm mb-4"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                placeholder="e.g. Master Bedroom, Living Room..."
                value={newRoom}
                onChange={e => setNewRoom(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addRoom()}
                autoFocus
              />
              <div className="flex gap-2 flex-wrap mb-4">
                {['Living Room', 'Master Bedroom', 'Bedroom 2', 'Kitchen', 'Dining Room', 'Office'].map(r => (
                  <button
                    key={r}
                    onClick={() => setNewRoom(r)}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--color-primary)' }}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  className="flex-1 py-3 rounded-xl font-medium"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                  onClick={() => setAddRoomModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 py-3 rounded-xl font-medium text-white"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  onClick={addRoom}
                  disabled={!newRoom.trim() || saving}
                >
                  Add
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Item Modal */}
      <QuickAddModal
        isOpen={addItemModal}
        onClose={() => setAddItemModal(false)}
        items={items}
        categories={cats}
        onAddItem={(item) => { addItemToRoom(item); setAddItemModal(false) }}
      />
    </div>
  )
}
