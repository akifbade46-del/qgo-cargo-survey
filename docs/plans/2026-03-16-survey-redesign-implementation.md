# Surveyor Survey UI Redesign - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete redesign of Surveyor Survey page with bottom tab navigation, card-based UI, and integrated feedback system.

**Architecture:** React SPA with 3-tab bottom navigation (Rooms/Items/Complete). Card-based components for rooms and items. Feedback collected via QR code, WhatsApp, and Email after survey completion. Voice note recorded at end of survey.

**Tech Stack:** React, Framer Motion, Tailwind CSS, Supabase, Web Audio API, QRCode library

---

## Task 1: Create Database Schema for Feedback

**Files:**
- Supabase migration

**Step 1: Create feedback table migration**

Run in Supabase SQL editor:
```sql
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_request_id UUID REFERENCES survey_requests(id) ON DELETE CASCADE,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  tags TEXT[],
  comment TEXT,
  would_recommend BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE survey_requests
ADD COLUMN IF NOT EXISTS voice_note TEXT,
ADD COLUMN IF NOT EXISTS feedback_sent_via TEXT,
ADD COLUMN IF NOT EXISTS feedback_sent_at TIMESTAMPTZ;
```

**Step 2: Commit database change note**
```bash
git add docs/plans/2026-03-16-survey-redesign-implementation.md
git commit -m "chore: add feedback table schema to plan"
```

---

## Task 2: Create Bottom Tab Navigation Component

**Files:**
- Create: `src/pages/surveyor/components/SurveyTabNav.jsx`

**Step 1: Create SurveyTabNav component**

```jsx
import { motion } from 'framer-motion'
import { Home, Package, CheckCircle } from 'lucide-react'

const tabs = [
  { id: 'rooms', label: 'Rooms', icon: Home },
  { id: 'items', label: 'Items', icon: Package },
  { id: 'complete', label: 'Complete', icon: CheckCircle }
]

export default function SurveyTabNav({ activeTab, onTabChange }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 max-w-2xl mx-auto">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 left-0 right-0 h-0.5 bg-green-600"
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

**Step 2: Commit component**
```bash
git add src/pages/surveyor/components/SurveyTabNav.jsx
git commit -m "feat: add SurveyTabNav bottom navigation component"
```

---

## Task 3: Create Rooms Tab Component

**Files:**
- Create: `src/pages/surveyor/components/RoomsTab.jsx`

**Step 1: Create RoomsTab component**

```jsx
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Plus, Trash2 } from 'lucide-react'

export default function RoomsTab({
  rooms,
  activeRoom,
  onSelectRoom,
  onAddRoom,
  onDeleteRoom
}) {
  const colors = [
    'bg-blue-50 border-blue-200',
    'bg-green-50 border-green-200',
    'bg-purple-50 border-purple-200',
    'bg-orange-50 border-orange-200',
    'bg-pink-50 border-pink-200',
    'bg-teal-50 border-teal-200'
  ]

  return (
    <div className="p-4 space-y-3 pb-24">
      <AnimatePresence mode="popLayout">
        {rooms.map((room, index) => {
          const itemCount = room.survey_items?.length || 0
          const totalCb = room.survey_items?.reduce((sum, item) =>
            sum + (item.cbm * (item.quantity || 1)), 0) || 0
          const isSelected = activeRoom === room.id

          return (
            <motion.div
              key={room.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              onClick={() => onSelectRoom(room.id)}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-green-500 bg-green-50 shadow-lg'
                  : `${colors[index % colors.length]} hover:shadow-md`
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-green-500 text-white' : 'bg-white'
                  }`}>
                    <Home size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{room.room_name}</h3>
                    <p className="text-sm text-gray-500">
                      {itemCount} items • {totalCb.toFixed(2)} CBM
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteRoom(room.id)
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Add Room Button */}
      <button
        onClick={onAddRoom}
        className="w-full p-4 rounded-2xl border-2 border-dashed border-gray-300
                   flex items-center justify-center gap-2 text-gray-500
                   hover:border-green-500 hover:text-green-500 transition-colors"
      >
        <Plus size={20} />
        <span className="font-medium">Add Room</span>
      </button>
    </div>
  )
}
```

**Step 2: Commit component**
```bash
git add src/pages/surveyor/components/RoomsTab.jsx
git commit -m "feat: add RoomsTab component with card-based room list"
```

---

## Task 4: Create Items Tab Component

**Files:**
- Create: `src/pages/surveyor/components/ItemsTab.jsx`

**Step 1: Create ItemsTab component**

```jsx
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Camera, Trash2, Package, X } from 'lucide-react'

export default function ItemsTab({
  currentRoom,
  items,
  onAddItem,
  onDeleteItem,
  onPhotoCapture
}) {
  const [search, setSearch] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const suggestions = useMemo(() => {
    if (!search.trim()) return []
    const searchLower = search.toLowerCase()
    return items
      .filter(item => item.name?.toLowerCase().includes(searchLower))
      .slice(0, 5)
  }, [search, items])

  const roomItems = currentRoom?.survey_items || []

  const handleSelectItem = (item) => {
    onAddItem(item)
    setSearch('')
    setShowSuggestions(false)
  }

  return (
    <div className="p-4 pb-24">
      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-2xl">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search items to add..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            className="flex-1 bg-transparent outline-none text-gray-900"
          />
          {search && (
            <button onClick={() => setSearch('')}>
              <X size={18} className="text-gray-400" />
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl
                         shadow-lg border border-gray-100 overflow-hidden z-10"
            >
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Package size={18} className="text-blue-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.default_cbm} CBM</p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {roomItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                    <Package size={24} className="text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {item.custom_name || item.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {(item.cbm || 0).toFixed(2)} CBM • Qty: {item.quantity || 1}
                    </p>
                    {item.is_fragile && (
                      <span className="text-xs text-red-500">Fragile</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.photos?.length > 0 && (
                    <span className="text-xs text-gray-400">📷 {item.photos.length}</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => onPhotoCapture(item)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg
                           bg-gray-100 text-gray-600 text-sm hover:bg-gray-200"
                >
                  <Camera size={14} />
                  Photo
                </button>
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg
                           bg-red-50 text-red-500 text-sm hover:bg-red-100"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {roomItems.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No items yet</p>
            <p className="text-sm text-gray-400">Search above to add items</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Commit component**
```bash
git add src/pages/surveyor/components/ItemsTab.jsx
git commit -m "feat: add ItemsTab with search and card-based item list"
```

---

## Task 5: Create Complete Tab Component

**Files:**
- Create: `src/pages/surveyor/components/CompleteTab.jsx`

**Step 1: Create CompleteTab component**

```jsx
import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Package, Truck, Home, Mic, Square, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CompleteTab({
  rooms,
  allItems,
  voiceNote,
  setVoiceNote,
  onComplete
}) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  const totalCb = allItems.reduce((sum, item) =>
    sum + (item.cbm * (item.quantity || 1)), 0)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      chunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.onloadend = () => {
          setVoiceNote(reader.result)
        }
        reader.readAsDataURL(blob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1)
      }, 1000)
    } catch (err) {
      toast.error('Could not access microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
    }
    clearInterval(timerRef.current)
    setIsRecording(false)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="p-4 pb-24 space-y-4">
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
        <h2 className="text-lg font-semibold mb-4">Survey Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <Package size={24} className="mx-auto mb-1 opacity-80" />
            <p className="text-2xl font-bold">{allItems.length}</p>
            <p className="text-xs opacity-80">Items</p>
          </div>
          <div className="text-center">
            <Truck size={24} className="mx-auto mb-1 opacity-80" />
            <p className="text-2xl font-bold">{totalCb.toFixed(1)}</p>
            <p className="text-xs opacity-80">CBM</p>
          </div>
          <div className="text-center">
            <Home size={24} className="mx-auto mb-1 opacity-80" />
            <p className="text-2xl font-bold">{rooms.length}</p>
            <p className="text-xs opacity-80">Rooms</p>
          </div>
        </div>
      </div>

      {/* Voice Note Section */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <h3 className="font-medium text-gray-900 mb-3">Voice Note (Optional)</h3>

        {voiceNote ? (
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
            <Mic size={20} className="text-green-500" />
            <audio src={voiceNote} controls className="flex-1 h-8" />
            <button
              onClick={() => setVoiceNote(null)}
              className="text-red-500 text-sm"
            >
              Delete
            </button>
          </div>
        ) : isRecording ? (
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="flex-1 text-red-600 font-medium">
              Recording... {formatTime(recordingTime)}
            </span>
            <button
              onClick={stopRecording}
              className="p-2 bg-red-500 text-white rounded-lg"
            >
              <Square size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={startRecording}
            className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300
                     text-gray-500 flex items-center justify-center gap-2
                     hover:border-green-500 hover:text-green-500 transition-colors"
          >
            <Mic size={20} />
            Tap to record voice note
          </button>
        )}
      </div>

      {/* Complete Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onComplete}
        disabled={allItems.length === 0}
        className="w-full py-4 rounded-2xl bg-green-600 text-white font-semibold
                 flex items-center justify-center gap-2 shadow-lg
                 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CheckCircle size={20} />
        Complete Survey
      </motion.button>
    </div>
  )
}
```

**Step 2: Commit component**
```bash
git add src/pages/surveyor/components/CompleteTab.jsx
git commit -m "feat: add CompleteTab with summary and voice recording"
```

---

## Task 6: Create Feedback Popup Component

**Files:**
- Create: `src/pages/surveyor/components/FeedbackPopup.jsx`

**Step 1: Install QR code library**
```bash
npm install qrcode.react
```

**Step 2: Create FeedbackPopup component**

```jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { X, MessageCircle, Mail, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function FeedbackPopup({
  isOpen,
  onClose,
  surveyId,
  surveyRef,
  customerPhone,
  customerEmail
}) {
  const [sending, setSending] = useState(false)

  const feedbackUrl = `${window.location.origin}/feedback/${surveyId}`

  const sendWhatsApp = async () => {
    setSending(true)
    try {
      const message = `Hello! Please share your feedback for survey #${surveyRef}. ${feedbackUrl}`
      const whatsappUrl = `https://wa.me/${customerPhone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')

      // Log to database
      await fetch('/api/feedback-sent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surveyId, via: 'whatsapp' })
      })

      toast.success('WhatsApp opened!')
    } catch (err) {
      toast.error('Failed to send')
    }
    setSending(false)
  }

  const sendEmail = async () => {
    setSending(true)
    try {
      const subject = `Feedback for Survey #${surveyRef}`
      const body = `Please share your feedback: ${feedbackUrl}`
      window.location.href = `mailto:${customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

      await fetch('/api/feedback-sent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surveyId, via: 'email' })
      })

      toast.success('Email client opened!')
    } catch (err) {
      toast.error('Failed to send')
    }
    setSending(false)
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 w-full max-w-sm"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-500" size={24} />
            <h2 className="text-lg font-bold">Survey Completed!</h2>
          </div>
          <button onClick={onClose} className="text-gray-400">
            <X size={24} />
          </button>
        </div>

        {/* QR Code */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500 mb-3">Customer scan karein for feedback</p>
          <div className="bg-white p-4 rounded-2xl inline-block border border-gray-100">
            <QRCodeSVG value={feedbackUrl} size={180} />
          </div>
        </div>

        {/* OR Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">OR send link via</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={sendWhatsApp}
            disabled={sending || !customerPhone}
            className="flex-1 py-3 rounded-xl bg-green-500 text-white font-medium
                     flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <MessageCircle size={18} />
            WhatsApp
          </button>
          <button
            onClick={sendEmail}
            disabled={sending || !customerEmail}
            className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-medium
                     flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Mail size={18} />
            Email
          </button>
        </div>

        {/* Skip */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-2 text-gray-500 text-sm"
        >
          Skip for now
        </button>
      </motion.div>
    </motion.div>
  )
}
```

**Step 3: Commit component**
```bash
git add src/pages/surveyor/components/FeedbackPopup.jsx
git commit -m "feat: add FeedbackPopup with QR, WhatsApp and Email options"
```

---

## Task 7: Create Customer Feedback Form Page

**Files:**
- Create: `src/pages/CustomerFeedback.jsx`

**Step 1: Create CustomerFeedback page**

```jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Star, CheckCircle, Send } from 'lucide-react'
import toast from 'react-hot-toast'

const FEEDBACK_TAGS = [
  'Professional', 'On-time', 'Careful', 'Friendly',
  'Efficient', 'Organized', 'Helpful', 'Recommended'
]

export default function CustomerFeedback() {
  const { surveyId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [survey, setSurvey] = useState(null)
  const [rating, setRating] = useState(0)
  const [tags, setTags] = useState([])
  const [comment, setComment] = useState('')
  const [wouldRecommend, setWouldRecommend] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSurvey()
  }, [surveyId])

  async function loadSurvey() {
    const { data } = await supabase
      .from('survey_requests')
      .select('id, reference_number, customer_name')
      .eq('id', surveyId)
      .single()

    if (data) {
      setSurvey(data)
      // Check if feedback already exists
      const { data: existing } = await supabase
        .from('feedback')
        .select('id')
        .eq('survey_request_id', surveyId)
        .single()

      if (existing) {
        setSubmitted(true)
      }
    }
    setLoading(false)
  }

  const toggleTag = (tag) => {
    setTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const submitFeedback = async () => {
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from('feedback')
      .insert([{
        survey_request_id: surveyId,
        rating,
        tags,
        comment,
        would_recommend: wouldRecommend
      }])

    if (!error) {
      setSubmitted(true)
      toast.success('Thank you for your feedback!')
    } else {
      toast.error('Failed to submit feedback')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-500">Your feedback has been submitted.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-xl font-bold text-gray-900">Rate Your Experience</h1>
          {survey && (
            <p className="text-gray-500">Survey #{survey.reference_number}</p>
          )}
        </div>

        {/* Rating */}
        <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
          <p className="text-center text-gray-600 mb-4">How was our service?</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="p-2"
              >
                <Star
                  size={32}
                  className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
          <p className="text-gray-600 mb-3">What did you like?</p>
          <div className="flex flex-wrap gap-2">
            {FEEDBACK_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  tags.includes(tag)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
          <p className="text-gray-600 mb-3">Additional comments (optional)</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us more about your experience..."
            className="w-full p-3 rounded-xl border border-gray-200 resize-none h-24"
          />
        </div>

        {/* Recommend */}
        <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
          <p className="text-gray-600 mb-3">Would you recommend us?</p>
          <div className="flex gap-3">
            <button
              onClick={() => setWouldRecommend(true)}
              className={`flex-1 py-3 rounded-xl font-medium ${
                wouldRecommend === true
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Yes 👍
            </button>
            <button
              onClick={() => setWouldRecommend(false)}
              className={`flex-1 py-3 rounded-xl font-medium ${
                wouldRecommend === false
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              No 👎
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={submitFeedback}
          disabled={saving || rating === 0}
          className="w-full py-4 rounded-2xl bg-green-600 text-white font-semibold
                   flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Send size={20} />
          {saving ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </div>
    </div>
  )
}
```

**Step 2: Add route to App.jsx**
```jsx
// Add to routes:
<Route path="/feedback/:surveyId" element={<CustomerFeedback />} />
```

**Step 3: Commit**
```bash
git add src/pages/CustomerFeedback.jsx src/App.jsx
git commit -m "feat: add CustomerFeedback page with rating, tags, and comments"
```

---

## Task 8: Rewrite SurveyorSurvey Page

**Files:**
- Modify: `src/pages/surveyor/SurveyorSurvey.jsx`

**Step 1: Completely rewrite SurveyorSurvey with tabs**

```jsx
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { calcCBM, recommendContainer, getFillPercent } from '@/utils/cbm'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

import SurveyTabNav from './components/SurveyTabNav'
import RoomsTab from './components/RoomsTab'
import ItemsTab from './components/ItemsTab'
import CompleteTab from './components/CompleteTab'
import FeedbackPopup from './components/FeedbackPopup'

export default function SurveyorSurvey() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [survey, setSurvey] = useState(null)
  const [rooms, setRooms] = useState([])
  const [items, setItems] = useState([])
  const [activeTab, setActiveTab] = useState('rooms')
  const [activeRoom, setActiveRoom] = useState(null)
  const [voiceNote, setVoiceNote] = useState(null)
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false)
  const [addRoomModal, setAddRoomModal] = useState(false)
  const [newRoom, setNewRoom] = useState('')

  // Get current room and all items
  const currentRoom = rooms.find(r => r.id === activeRoom)
  const allItems = rooms.flatMap(r => r.survey_items || [])

  useEffect(() => { load() }, [id])

  async function load() {
    const [{ data: s }, { data: rm }, { data: it }] = await Promise.all([
      supabase.from('survey_requests')
        .select('id,reference_number,customer_name,customer_email,customer_phone')
        .eq('id', id).single(),
      supabase.from('survey_rooms')
        .select('*,survey_items(*)')
        .eq('survey_request_id', id).order('created_at'),
      supabase.from('items')
        .select('id,name,default_cbm,default_weight_kg,is_fragile')
        .eq('is_active', true).order('name')
    ])
    setSurvey(s)
    setRooms(rm ?? [])
    setItems(it ?? [])
    if (rm?.length > 0) setActiveRoom(rm[0].id)
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
  }

  async function deleteRoom(roomId) {
    await supabase.from('survey_rooms').delete().eq('id', roomId)
    setRooms(p => p.filter(r => r.id !== roomId))
    if (activeRoom === roomId && rooms.length > 1) {
      setActiveRoom(rooms.find(r => r.id !== roomId)?.id)
    }
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

  async function deleteItem(itemId) {
    await supabase.from('survey_items').delete().eq('id', itemId)
    setRooms(p => p.map(r => ({
      ...r,
      survey_items: r.survey_items?.filter(i => i.id !== itemId) || []
    })))
  }

  async function completeSurvey() {
    // Save voice note if recorded
    if (voiceNote) {
      await supabase.from('survey_requests')
        .update({ voice_note: voiceNote })
        .eq('id', id)
    }

    // Update status
    await supabase.from('survey_requests')
      .update({ status: 'completed' })
      .eq('id', id)

    setShowFeedbackPopup(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
      </div>
    )
  }

  const totalCb = allItems.reduce((sum, item) =>
    sum + (item.cbm * (item.quantity || 1)), 0)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto p-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-gray-900">#{survey?.reference_number}</h1>
            <p className="text-sm text-gray-500">{survey?.customer_name}</p>
          </div>
          <div className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
            {totalCb.toFixed(1)} CBM
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'rooms' && (
            <RoomsTab
              rooms={rooms}
              activeRoom={activeRoom}
              onSelectRoom={setActiveRoom}
              onAddRoom={() => setAddRoomModal(true)}
              onDeleteRoom={deleteRoom}
            />
          )}
          {activeTab === 'items' && (
            <ItemsTab
              currentRoom={currentRoom}
              items={items}
              onAddItem={addItemToRoom}
              onDeleteItem={deleteItem}
              onPhotoCapture={(item) => {/* TODO */}}
            />
          )}
          {activeTab === 'complete' && (
            <CompleteTab
              rooms={rooms}
              allItems={allItems}
              voiceNote={voiceNote}
              setVoiceNote={setVoiceNote}
              onComplete={completeSurvey}
            />
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
              <h3 className="font-bold text-lg mb-4">Add Room</h3>
              <input
                className="w-full p-3 rounded-xl bg-gray-100 mb-4"
                placeholder="Room name..."
                value={newRoom}
                onChange={e => setNewRoom(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addRoom()}
                autoFocus
              />
              <div className="flex gap-2 flex-wrap mb-4">
                {['Living Room', 'Bedroom', 'Kitchen', 'Office', 'Garage'].map(r => (
                  <button
                    key={r}
                    onClick={() => setNewRoom(r)}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 text-sm"
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setAddRoomModal(false)}
                  className="flex-1 py-3 rounded-xl bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={addRoom}
                  className="flex-1 py-3 rounded-xl bg-green-500 text-white"
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
```

**Step 2: Commit rewrite**
```bash
git add src/pages/surveyor/SurveyorSurvey.jsx
git commit -m "feat: complete rewrite of SurveyorSurvey with bottom tab navigation"
```

---

## Task 9: Clean Up Old Components

**Files:**
- Delete: `src/pages/surveyor/components/QuickAddInput.jsx`
- Delete: `src/pages/surveyor/components/QuickAddModal.jsx`
- Delete: `src/pages/surveyor/components/RoomTabs.jsx`

**Step 1: Delete unused components**
```bash
rm src/pages/surveyor/components/QuickAddInput.jsx
rm src/pages/surveyor/components/QuickAddModal.jsx
rm src/pages/surveyor/components/RoomTabs.jsx
```

**Step 2: Commit cleanup**
```bash
git add -A
git commit -m "chore: remove old unused components"
```

---

## Task 10: Test and Deploy

**Step 1: Build and test**
```bash
npm run build
```

**Step 2: Push to deploy**
```bash
git push origin main
```

**Step 3: Verify deployment**
- Open survey page as surveyor
- Test all 3 tabs
- Test adding rooms and items
- Test complete flow with feedback popup

---

## Files Summary

| Action | File |
|--------|------|
| Create | `src/pages/surveyor/components/SurveyTabNav.jsx` |
| Create | `src/pages/surveyor/components/RoomsTab.jsx` |
| Create | `src/pages/surveyor/components/ItemsTab.jsx` |
| Create | `src/pages/surveyor/components/CompleteTab.jsx` |
| Create | `src/pages/surveyor/components/FeedbackPopup.jsx` |
| Create | `src/pages/CustomerFeedback.jsx` |
| Modify | `src/pages/surveyor/SurveyorSurvey.jsx` |
| Modify | `src/App.jsx` |
| Delete | `src/pages/surveyor/components/QuickAddInput.jsx` |
| Delete | `src/pages/surveyor/components/QuickAddModal.jsx` |
| Delete | `src/pages/surveyor/components/RoomTabs.jsx` |
| SQL | Create `feedback` table |
