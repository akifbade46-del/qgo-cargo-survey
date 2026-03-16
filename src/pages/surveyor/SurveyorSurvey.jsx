import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

import SurveyDetails from './components/SurveyDetails'
import SurveyTabNav from './components/SurveyTabNav'
import RoomsTab from './components/RoomsTab'
import ItemsTab from './components/ItemsTab'
import CompleteTab from './components/CompleteTab'
import FeedbackPopup from './components/FeedbackPopup'

export default function SurveyorSurvey() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [survey, setSurvey] = useState(null)
  const [rooms, setRooms] = useState([])
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [surveyStarted, setSurveyStarted] = useState(false)
  const [activeTab, setActiveTab] = useState('rooms')
  const [activeRoom, setActiveRoom] = useState(null)
  const [voiceNote, setVoiceNote] = useState(null)
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false)
  const [addRoomModal, setAddRoomModal] = useState(false)
  const [newRoom, setNewRoom] = useState('')
  const [wasOriginallyCompleted, setWasOriginallyCompleted] = useState(false)

  // Get current room and all items
  const currentRoom = rooms.find(r => r.id === activeRoom)
  const allItems = rooms.flatMap(r => r.survey_items || [])

  useEffect(() => { load() }, [id])

  async function load() {
    const [{ data: s }, { data: rm }, { data: it }, { data: cats }] = await Promise.all([
      supabase.from('survey_requests')
        .select(`
          id, reference_number, customer_name, customer_email, customer_phone,
          from_address, from_city, from_country,
          to_address, to_city, to_country,
          selected_container, move_type, notes, status, created_at, voice_note
        `)
        .eq('id', id).single(),
      supabase.from('survey_rooms')
        .select('*,survey_items(*)')
        .eq('survey_request_id', id).order('created_at'),
      supabase.from('items')
        .select('id,name,default_cbm,default_weight_kg,is_fragile')
        .eq('is_active', true).order('name'),
      supabase.from('item_categories')
        .select('id, name')
        .order('name')
    ])
    setSurvey(s)
    setRooms(rm ?? [])
    setItems(it ?? [])
    setCategories(cats ?? [])
    // Load existing voice note if present (for update mode)
    if (s?.voice_note) {
      setVoiceNote(s.voice_note)
    }
    if (rm?.length > 0) setActiveRoom(rm[0].id)

    // Check if survey already has items (started)
    // If completed or surveyed, show details screen first with edit option
    const hasItems = (rm ?? []).some(r => r.survey_items?.length > 0)
    const isFinished = s?.status === 'completed' || s?.status === 'surveyed'
    if (isFinished) {
      setSurveyStarted(false) // Show details screen first for completed/surveyed surveys
      setWasOriginallyCompleted(true) // Track that this was originally completed
    } else {
      setSurveyStarted(hasItems || s?.status === 'in_progress')
    }

    setLoading(false)
  }

  async function addRoom() {
    if (!newRoom.trim()) return
    const { data } = await supabase.from('survey_rooms')
      .insert([{ survey_request_id: id, room_name: newRoom }])
      .select().single()
    if (data) {
      setRooms(p => [...p, { ...data, survey_items: [] }])
      setActiveRoom(data.id)
    }
    setNewRoom('')
    setAddRoomModal(false)
    toast.success('Room added!')
  }

  async function deleteRoom(roomId) {
    await supabase.from('survey_rooms').delete().eq('id', roomId)
    setRooms(p => p.filter(r => r.id !== roomId))
    if (activeRoom === roomId && rooms.length > 1) {
      setActiveRoom(rooms.find(r => r.id !== roomId)?.id)
    }
    toast.success('Room deleted')
  }

  async function addItemToRoom(item) {
    const { data, error } = await supabase.from('survey_items')
      .insert([{
        survey_room_id: activeRoom,
        item_id: item.id,
        custom_name: item.name,
        cbm: parseFloat(item.default_cbm) || 0,
        quantity: 1
      }]).select().single()

    if (!error && data) {
      setRooms(p => p.map(r =>
        r.id === activeRoom
          ? { ...r, survey_items: [...(r.survey_items || []), data] }
          : r
      ))
      toast.success(`${item.name} added!`)
    }
  }

  async function addManualItem(customItem) {
    const { data, error } = await supabase.from('survey_items')
      .insert([{
        survey_room_id: activeRoom,
        item_id: null,
        custom_name: customItem.custom_name,
        cbm: parseFloat(customItem.cbm) || 0,
        quantity: customItem.quantity || 1,
        is_fragile: customItem.is_fragile,
        notes: customItem.notes
      }]).select().single()

    if (!error && data) {
      setRooms(p => p.map(r =>
        r.id === activeRoom
          ? { ...r, survey_items: [...(r.survey_items || []), data] }
          : r
      ))
      toast.success(`${customItem.custom_name} added!`)
    }
  }

  async function deleteItem(itemId) {
    await supabase.from('survey_items').delete().eq('id', itemId)
    setRooms(p => p.map(r => ({
      ...r,
      survey_items: r.survey_items?.filter(i => i.id !== itemId) || []
    })))
    toast.success('Item deleted')
  }

  async function addPhotoToItem(itemId, photoData) {
    // Find current item and get existing photos
    let currentPhotos = []
    rooms.forEach(r => {
      const item = r.survey_items?.find(i => i.id === itemId)
      if (item?.photos) currentPhotos = item.photos
    })

    // Add new photo
    const newPhotos = [...currentPhotos, photoData]

    // Update in database
    const { error } = await supabase.from('survey_items')
      .update({ photos: newPhotos })
      .eq('id', itemId)

    if (!error) {
      // Update local state
      setRooms(p => p.map(r => ({
        ...r,
        survey_items: r.survey_items?.map(i =>
          i.id === itemId ? { ...i, photos: newPhotos } : i
        ) || []
      })))
    }
  }

  async function handleStartSurvey() {
    // Update status to in_progress
    await supabase.from('survey_requests')
      .update({ status: 'in_progress' })
      .eq('id', id)

    setSurveyStarted(true)

    // Create first room if none exists
    if (rooms.length === 0) {
      const { data } = await supabase.from('survey_rooms')
        .insert([{ survey_request_id: id, room_name: 'Living Room' }])
        .select().single()
      if (data) {
        setRooms([{ ...data, survey_items: [] }])
        setActiveRoom(data.id)
      }
    }
  }

  async function completeSurvey() {
    // Save voice note if recorded (or keep existing one)
    if (voiceNote) {
      await supabase.from('survey_requests')
        .update({ voice_note: voiceNote })
        .eq('id', id)
    }

    // Check if this was originally a completed survey (update mode)
    if (!wasOriginallyCompleted) {
      // First time completion - update status
      await supabase.from('survey_requests')
        .update({ status: 'completed' })
        .eq('id', id)
      setShowFeedbackPopup(true)
    } else {
      // Update mode - just show success, keep status as completed
      await supabase.from('survey_requests')
        .update({ status: 'completed' })
        .eq('id', id)
      toast.success('Survey updated!')
      navigate('/surveyor')
    }
  }

  async function handleReopenSurvey() {
    // Change status back to in_progress
    await supabase.from('survey_requests')
      .update({ status: 'in_progress' })
      .eq('id', id)

    setSurvey(p => ({ ...p, status: 'in_progress' }))
    setSurveyStarted(true)
    toast.success('Survey reopened for editing')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
      </div>
    )
  }

  // Show details screen first if survey not started
  if (!surveyStarted) {
    return (
      <SurveyDetails
        survey={survey}
        rooms={rooms}
        onStart={handleStartSurvey}
        onReopen={handleReopenSurvey}
        isCompleted={survey?.status === 'completed'}
      />
    )
  }

  // Calculate total photos from all items
  const totalPhotos = allItems.reduce((sum, item) => sum + (item.photos?.length || 0), 0)

  // Calculate total CBM
  const totalCb = allItems.reduce((sum, item) => sum + (item.cbm * (item.quantity || 1)), 0)

  const isCompleted = survey?.status === 'completed'

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto p-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-gray-900">#{survey?.reference_number}</h1>
            <p className="text-sm text-gray-500">{survey?.customer_name}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Voice Note Indicator */}
            {survey?.voice_note && (
              <div className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium flex items-center gap-1">
                🎤 Voice
              </div>
            )}
            {/* Photos Indicator */}
            {totalPhotos > 0 && (
              <div className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium flex items-center gap-1">
                📷 {totalPhotos}
              </div>
            )}
            {/* CBM Badge */}
            <div className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
              {totalCb.toFixed(1)} CBM
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'rooms' && (
            <motion.div key="rooms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RoomsTab
                rooms={rooms}
                activeRoom={activeRoom}
                onSelectRoom={setActiveRoom}
                onAddRoom={() => setAddRoomModal(true)}
                onDeleteRoom={deleteRoom}
              />
            </motion.div>
          )}
          {activeTab === 'items' && (
            <motion.div key="items" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ItemsTab
                currentRoom={currentRoom}
                items={items}
                categories={categories}
                onAddItem={addItemToRoom}
                onDeleteItem={deleteItem}
                onManualAdd={addManualItem}
                onAddPhoto={addPhotoToItem}
              />
            </motion.div>
          )}
          {activeTab === 'complete' && (
            <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CompleteTab
                rooms={rooms}
                allItems={allItems}
                voiceNote={voiceNote}
                setVoiceNote={setVoiceNote}
                onComplete={completeSurvey}
                isUpdate={survey?.status === 'completed' || survey?.voice_note}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Tab Navigation */}
      <SurveyTabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Add Room Modal */}
      <AnimatePresence>
        {addRoomModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setAddRoomModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm"
            >
              <h3 className="font-bold text-lg mb-4 text-gray-900">Add Room</h3>
              <input
                className="w-full p-3 rounded-xl bg-gray-100 mb-4 outline-none"
                placeholder="Room name..."
                value={newRoom}
                onChange={e => setNewRoom(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addRoom()}
                autoFocus
              />
              <div className="flex gap-2 flex-wrap mb-4">
                {['Living Room', 'Bedroom', 'Kitchen', 'Office', 'Garage', 'Bathroom'].map(r => (
                  <button
                    key={r}
                    onClick={() => setNewRoom(r)}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 text-sm text-gray-700"
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setAddRoomModal(false)}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={addRoom}
                  disabled={!newRoom.trim()}
                  className="flex-1 py-3 rounded-xl bg-green-500 text-white disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Popup */}
      <FeedbackPopup
        isOpen={showFeedbackPopup}
        onClose={() => {
          setShowFeedbackPopup(false)
          navigate('/surveyor')
        }}
        surveyId={id}
        surveyRef={survey?.reference_number}
        customerPhone={survey?.customer_phone}
        customerEmail={survey?.customer_email}
      />
    </div>
  )
}
