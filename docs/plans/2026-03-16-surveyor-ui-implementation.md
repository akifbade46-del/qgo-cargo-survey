# Surveyor UI Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete overhaul of Surveyor mobile interface with modern Mobile-First design (Uber/WhatsApp style)

**Architecture:** React functional components with hooks, Tailwind CSS for styling, Framer Motion for animations. Uses existing Supabase backend with new offline-first approach.

**Tech Stack:** React 18, Tailwind CSS, Framer Motion, Lucide React Icons, Supabase (existing), IndexedDB for offline

---

## Task 1: Update CSS with Dark Theme Support

**Files:**
- Modify: `src/index.css`

**Step 1: Add dark theme CSS variables**

Add to `src/index.css` after existing `:root` block:

```css
/* Dark theme support */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #1a1a2e;
    --color-text: #eaeaea;
  }
}

.dark {
  --color-bg: #1a1a2e;
  --color-text: #eaeaea;
}

/* Surveyor specific styles */
.surveyor-layout {
  @apply min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300;
}

.surveyor-card {
  @apply bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 transition-colors;
}

.surveyor-tab {
  @apply flex-1 py-3 text-center text-sm font-medium border-b-2 transition-colors;
}

.surveyor-tab-active {
  @apply border-qgo-blue text-qgo-blue;
}

.surveyor-tab-inactive {
  @apply border-transparent text-gray-500 dark:text-gray-400;
}

.fab-button {
  @apply fixed bottom-6 right-6 w-14 h-14 bg-qgo-blue text-white rounded-full shadow-lg flex items-center justify-center hover:bg-qgo-navy transition-all hover:scale-105 active:scale-95;
}
```

**Step 2: Verify CSS compiles**

Run: `npm run build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add dark theme support and surveyor styles"
```

---

## Task 2: Create Surveyor Components Directory

**Files:**
- Create: `src/pages/surveyor/components/SurveyCard.jsx`
- Create: `src/pages/surveyor/components/StatCard.jsx`
- Create: `src/pages/surveyor/components/RoomTabs.jsx`
- Create: `src/pages/surveyor/components/CBMCounter.jsx`

**Step 1: Create StatCard component**

Create `src/pages/surveyor/components/StatCard.jsx`:

```jsx
import { motion } from 'framer-motion'

export default function StatCard({ icon: Icon, value, label, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  }

  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      className="surveyor-card flex flex-col items-center justify-center py-4"
    >
      <div className={`w-10 h-10 rounded-xl ${colors[color]} flex items-center justify-center mb-2`}>
        <Icon size={20} />
      </div>
      <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
    </motion.div>
  )
}
```

**Step 2: Create SurveyCard component**

Create `src/pages/surveyor/components/SurveyCard.jsx`:

```jsx
import { motion } from 'framer-motion'
import { MapPin, Clock, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import StatusBadge from '@/components/common/StatusBadge'

export default function SurveyCard({ survey }) {
  return (
    <Link to={`/surveyor/${survey.id}`}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="surveyor-card mb-3"
      >
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-qgo-blue to-qgo-cyan rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">
              {survey.customer_name?.charAt(0) || '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-qgo-blue">{survey.reference_number}</span>
              <StatusBadge status={survey.status} />
            </div>
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {survey.customer_name}
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
              <MapPin size={12} />
              <span className="truncate">{survey.from_address || survey.from_city}</span>
            </div>
            {survey.preferred_date && (
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                <Clock size={12} />
                <span>{new Date(survey.preferred_date).toLocaleDateString('en-KW', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
            )}
          </div>
          <ChevronRight size={20} className="text-gray-300 flex-shrink-0" />
        </div>
      </motion.div>
    </Link>
  )
}
```

**Step 3: Create RoomTabs component**

Create `src/pages/surveyor/components/RoomTabs.jsx`:

```jsx
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

export default function RoomTabs({ rooms, activeRoom, onSelect, onAddRoom }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
      {rooms.map((room) => {
        const itemCount = room.survey_items?.length || 0
        const isActive = activeRoom === room.id

        return (
          <motion.button
            key={room.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(room.id)}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              isActive
                ? 'bg-qgo-blue text-white shadow-lg shadow-qgo-blue/30'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {room.room_name}
            <span className={`ml-1.5 text-xs ${isActive ? 'text-white/70' : 'text-gray-400'}`}>
              ({itemCount})
            </span>
          </motion.button>
        )
      })}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onAddRoom}
        className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-500 hover:bg-qgo-blue hover:text-white transition-colors"
      >
        <Plus size={18} />
      </motion.button>
    </div>
  )
}
```

**Step 4: Create CBMCounter component**

Create `src/pages/surveyor/components/CBMCounter.jsx`:

```jsx
import { motion } from 'framer-motion'
import { Package } from 'lucide-react'
import { CONTAINERS } from '@/utils/cbm'

export default function CBMCounter({ totalCBM, containerType, fillPercent }) {
  const container = CONTAINERS[containerType] || { label: containerType, maxCBM: 33 }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-qgo-navy to-gray-900 rounded-2xl p-5 text-white shadow-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Total Volume</p>
          <div className="flex items-baseline gap-2">
            <motion.span
              key={totalCBM}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-4xl font-black"
            >
              {totalCBM.toFixed(2)}
            </motion.span>
            <span className="text-white/60 text-sm">CBM</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white/60 text-xs mb-1">Container</p>
          <p className="text-qgo-cyan font-bold text-lg">{container.label}</p>
          <p className="text-white/50 text-xs">{fillPercent}% fill</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(fillPercent, 100)}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full ${
            fillPercent > 90 ? 'bg-red-500' : fillPercent > 70 ? 'bg-amber-500' : 'bg-qgo-cyan'
          }`}
        />
      </div>
      <div className="flex justify-between text-xs text-white/40 mt-1">
        <span>0</span>
        <span>{container.maxCBM} CBM max</span>
      </div>
    </motion.div>
  )
}
```

**Step 5: Commit**

```bash
git add src/pages/surveyor/components/
git commit -m "feat: create surveyor UI components (StatCard, SurveyCard, RoomTabs, CBMCounter)"
```

---

## Task 3: Create QuickAddModal Component

**Files:**
- Create: `src/pages/surveyor/components/QuickAddModal.jsx`
- Create: `src/pages/surveyor/components/ItemCard.jsx`

**Step 1: Create ItemCard component**

Create `src/pages/surveyor/components/ItemCard.jsx`:

```jsx
import { motion } from 'framer-motion'
import { Package, Camera, Mic, Trash2, Edit2 } from 'lucide-react'

export default function ItemCard({ item, onEdit, onDelete, onPhoto, onVoice }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-2"
    >
      <div className="w-10 h-10 bg-white dark:bg-gray-600 rounded-lg flex items-center justify-center shadow-sm">
        <Package size={18} className="text-gray-400" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
          {item.custom_name}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{item.cbm} CBM</span>
          {item.weight_kg && <span>• {item.weight_kg} kg</span>}
          {item.is_fragile && (
            <span className="text-red-500 flex items-center gap-0.5">
              • <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Fragile
            </span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPhoto?.(item)}
          className="p-2 text-gray-400 hover:text-qgo-blue hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
        >
          <Camera size={16} />
        </button>
        <button
          onClick={() => onVoice?.(item)}
          className="p-2 text-gray-400 hover:text-qgo-blue hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
        >
          <Mic size={16} />
        </button>
        <button
          onClick={() => onEdit?.(item)}
          className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={() => onDelete?.(item)}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  )
}
```

**Step 2: Create QuickAddModal component**

Create `src/pages/surveyor/components/QuickAddModal.jsx`:

```jsx
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Scan, Mic, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

const POPULAR_ITEMS = [
  { id: 'sofa', name: 'Sofa Set', cbm: 2.5, icon: '🛋️' },
  { id: 'tv', name: 'TV', cbm: 0.8, icon: '📺' },
  { id: 'bed', name: 'Bed', cbm: 2.0, icon: '🛏️' },
  { id: 'fridge', name: 'Fridge', cbm: 1.5, icon: '🧊' },
  { id: 'table', name: 'Dining Table', cbm: 1.2, icon: '🪑' },
  { id: 'wardrobe', name: 'Wardrobe', cbm: 3.0, icon: '🚪' },
]

export default function QuickAddModal({ isOpen, onClose, items, categories, onSelect }) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isListening, setIsListening] = useState(false)

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.name_ar?.includes(search)
      const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [items, search, selectedCategory])

  function handleVoiceInput() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Voice input not supported in this browser')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setSearch(transcript)
    }
    recognition.onerror = () => {
      setIsListening(false)
      toast.error('Could not understand. Please try again.')
    }

    recognition.start()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25 }}
          className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl max-h-[85vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Item</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Search bar */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-qgo-blue dark:text-white"
                  autoFocus
                />
              </div>
              <button
                onClick={handleVoiceInput}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-qgo-blue hover:text-white'
                }`}
              >
                <Mic size={20} />
              </button>
            </div>

            {/* Category tabs */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-qgo-blue text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-qgo-blue text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Popular items */}
          {!search && (
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Quick Add
              </p>
              <div className="grid grid-cols-3 gap-2">
                {POPULAR_ITEMS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => onSelect({ name: item.name, default_cbm: item.cbm })}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-qgo-blue/10 transition-colors text-center"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.cbm} CBM</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Items list */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                    <span className="text-lg">📦</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.default_cbm} CBM • {item.default_weight_kg} kg</p>
                  </div>
                  {item.is_fragile && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">Fragile</span>
                  )}
                </button>
              ))
            ) : (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No items found</p>
                <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
```

**Step 3: Commit**

```bash
git add src/pages/surveyor/components/ItemCard.jsx src/pages/surveyor/components/QuickAddModal.jsx
git commit -m "feat: create QuickAddModal and ItemCard components with voice input"
```

---

## Task 4: Rewrite SurveyorLayout with Top Tabs

**Files:**
- Rewrite: `src/pages/surveyor/SurveyorLayout.jsx`

**Step 1: Rewrite SurveyorLayout**

Replace entire content of `src/pages/surveyor/SurveyorLayout.jsx`:

```jsx
import { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import QgoLogo from '@/components/common/QgoLogo'
import { Home, ClipboardList, Map, Settings, LogOut, Plus } from 'lucide-react'

const TABS = [
  { path: '/surveyor', icon: Home, label: 'Home', exact: true },
  { path: '/surveyor/surveys', icon: ClipboardList, label: 'Surveys' },
  { path: '/surveyor/map', icon: Map, label: 'Map' },
  { path: '/surveyor/settings', icon: Settings, label: 'Settings' },
]

export default function SurveyorLayout() {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const [showFAB, setShowFAB] = useState(true)

  // Hide FAB on settings page
  useEffect(() => {
    setShowFAB(!location.pathname.includes('/settings') && !location.pathname.includes('/surveyor/'))
  }, [location.pathname])

  return (
    <div className="surveyor-layout">
      {/* Header */}
      <header className="bg-qgo-navy dark:bg-gray-900 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <QgoLogo white size="sm" />
        <div className="flex items-center gap-3">
          <span className="text-white/70 text-sm hidden sm:block max-w-[120px] truncate">
            {profile?.full_name}
          </span>
          <button
            onClick={signOut}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            title="Logout"
          >
            <LogOut size={18} className="text-white/60" />
          </button>
        </div>
      </header>

      {/* Top Tabs */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-[56px] z-30">
        <div className="flex">
          {TABS.map(({ path, icon: Icon, label, exact }) => (
            <NavLink
              key={path}
              to={path}
              end={exact}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-3 border-b-2 transition-colors ${
                  isActive
                    ? 'border-qgo-blue text-qgo-blue'
                    : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`
              }
            >
              <Icon size={20} />
              <span className="text-xs mt-1 font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-2xl mx-auto p-4">
          <Outlet />
        </div>
      </main>

      {/* Floating Action Button */}
      <AnimatePresence>
        {showFAB && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fab-button z-50"
            onClick={() => window.location.href = '/surveyor'}
          >
            <Plus size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/pages/surveyor/SurveyorLayout.jsx
git commit -m "feat: rewrite SurveyorLayout with top tabs navigation"
```

---

## Task 5: Rewrite SurveyorDashboard

**Files:**
- Rewrite: `src/pages/surveyor/SurveyorDashboard.jsx`

**Step 1: Rewrite SurveyorDashboard**

Replace entire content:

```jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import StatCard from './components/StatCard'
import SurveyCard from './components/SurveyCard'
import { ClipboardList, CheckCircle, Calendar, Camera, Mic, Package } from 'lucide-react'

export default function SurveyorDashboard() {
  const { user, profile } = useAuth()
  const [surveys, setSurveys] = useState([])
  const [stats, setStats] = useState({ active: 0, completed: 0, today: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) load()
  }, [user])

  async function load() {
    // Get surveyor record
    const { data: sv } = await supabase
      .from('surveyors')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (sv) {
      // Get all assigned surveys
      const { data: allSurveys } = await supabase
        .from('survey_requests')
        .select('id, reference_number, customer_name, from_address, from_city, from_country, preferred_date, status, created_at')
        .eq('assigned_surveyor_id', sv.id)
        .order('preferred_date', { ascending: true })

      const active = allSurveys?.filter(s => ['assigned', 'in_progress'].includes(s.status)) || []
      const completed = allSurveys?.filter(s => s.status === 'surveyed') || []

      // Today's surveys
      const today = new Date().toDateString()
      const todaySurveys = active.filter(s =>
        new Date(s.preferred_date).toDateString() === today
      )

      setSurveys(todaySurveys.length > 0 ? todaySurveys : active.slice(0, 5))
      setStats({
        active: active.length,
        completed: completed.length,
        today: todaySurveys.length
      })
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-qgo-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {getGreeting()}, {profile?.full_name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {stats.today > 0
            ? `You have ${stats.today} surveys scheduled for today`
            : 'All caught up! No surveys for today'}
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={ClipboardList} value={stats.active} label="Active" color="blue" />
        <StatCard icon={CheckCircle} value={stats.completed} label="Done" color="green" />
        <StatCard icon={Calendar} value={stats.today} label="Today" color="amber" />
      </div>

      {/* Today's Surveys */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900 dark:text-white">
            {stats.today > 0 ? "Today's Surveys" : 'Active Surveys'}
          </h2>
          <span className="text-xs text-gray-500">{surveys.length} surveys</span>
        </div>

        {surveys.length === 0 ? (
          <div className="surveyor-card text-center py-12">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No surveys assigned</p>
            <p className="text-gray-400 text-xs mt-1">Check back later or contact operations</p>
          </div>
        ) : (
          surveys.map(survey => (
            <SurveyCard key={survey.id} survey={survey} />
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-bold text-gray-900 dark:text-white mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          <button className="surveyor-card flex flex-col items-center gap-2 py-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            <Camera className="text-qgo-blue" size={24} />
            <span className="text-xs text-gray-600 dark:text-gray-300">Photo</span>
          </button>
          <button className="surveyor-card flex flex-col items-center gap-2 py-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            <Mic className="text-qgo-blue" size={24} />
            <span className="text-xs text-gray-600 dark:text-gray-300">Voice Note</span>
          </button>
          <button className="surveyor-card flex flex-col items-center gap-2 py-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            <Package className="text-qgo-blue" size={24} />
            <span className="text-xs text-gray-600 dark:text-gray-300">Add Item</span>
          </button>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/pages/surveyor/SurveyorDashboard.jsx
git commit -m "feat: rewrite SurveyorDashboard with new design and stats"
```

---

## Task 6: Create SurveyorSurveys Page

**Files:**
- Create: `src/pages/surveyor/SurveyorSurveys.jsx`

**Step 1: Create SurveyorSurveys**

```jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import SurveyCard from './components/SurveyCard'
import { Search, Filter, RefreshCw } from 'lucide-react'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'surveyed', label: 'Completed' },
]

export default function SurveyorSurveys() {
  const { user } = useAuth()
  const [surveys, setSurveys] = useState([])
  const [filteredSurveys, setFilteredSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    if (user) load()
  }, [user])

  useEffect(() => {
    filterSurveys()
  }, [surveys, search, activeFilter])

  async function load() {
    const { data: sv } = await supabase
      .from('surveyors')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (sv) {
      const { data } = await supabase
        .from('survey_requests')
        .select('id, reference_number, customer_name, from_address, from_city, from_country, preferred_date, status, created_at')
        .eq('assigned_surveyor_id', sv.id)
        .order('preferred_date', { ascending: true })

      setSurveys(data || [])
    }
    setLoading(false)
  }

  function filterSurveys() {
    let result = surveys

    // Filter by status
    if (activeFilter !== 'all') {
      result = result.filter(s => s.status === activeFilter)
    }

    // Filter by search
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(s =>
        s.customer_name?.toLowerCase().includes(q) ||
        s.reference_number?.toLowerCase().includes(q) ||
        s.from_address?.toLowerCase().includes(q)
      )
    }

    setFilteredSurveys(result)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-qgo-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">All Surveys</h1>
        <button
          onClick={load}
          className="p-2 text-gray-400 hover:text-qgo-blue transition-colors"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, ref, or address..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-qgo-blue dark:text-white"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(filter => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeFilter === filter.value
                ? 'bg-qgo-blue text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {filteredSurveys.length} survey{filteredSurveys.length !== 1 ? 's' : ''} found
      </p>

      {/* Survey list */}
      {filteredSurveys.length === 0 ? (
        <div className="surveyor-card text-center py-12">
          <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No surveys match your filters</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {filteredSurveys.map(survey => (
            <SurveyCard key={survey.id} survey={survey} />
          ))}
        </motion.div>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/pages/surveyor/SurveyorSurveys.jsx
git commit -m "feat: create SurveyorSurveys page with search and filters"
```

---

## Task 7: Create SurveyorMap Page

**Files:**
- Create: `src/pages/surveyor/SurveyorMap.jsx`

**Step 1: Create SurveyorMap**

```jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Navigation, Phone, MapPin } from 'lucide-react'

// Custom marker
const surveyIcon = new L.DivIcon({
  className: '',
  html: `<div style="width:36px;height:36px;background:#0D5C9E;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
})

function LocationMarker({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position) {
      map.setView(position, 13)
    }
  }, [position, map])
  return null
}

export default function SurveyorMap() {
  const { user } = useAuth()
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSurvey, setSelectedSurvey] = useState(null)
  const [userLocation, setUserLocation] = useState(null)

  // Kuwait City default
  const defaultCenter = [29.3759, 47.9770]

  useEffect(() => {
    if (user) load()
    getUserLocation()
  }, [user])

  async function load() {
    const { data: sv } = await supabase
      .from('surveyors')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (sv) {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('survey_requests')
        .select('id, reference_number, customer_name, customer_phone, from_address, from_lat, from_lng, preferred_date, status')
        .eq('assigned_surveyor_id', sv.id)
        .in('status', ['assigned', 'in_progress'])
        .gte('preferred_date', today)
        .order('preferred_date', { ascending: true })

      setSurveys(data || [])
    }
    setLoading(false)
  }

  function getUserLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => console.log('Could not get location')
      )
    }
  }

  function openNavigation(lat, lng) {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank')
  }

  function callCustomer(phone) {
    if (phone) {
      window.open(`tel:${phone}`, '_self')
    }
  }

  const surveysWithLocation = surveys.filter(s => s.from_lat && s.from_lng)

  return (
    <div className="space-y-4 -mx-4 -mb-4 md:-mx-0 md:-mb-0">
      {/* Map */}
      <div className="h-[40vh] md:h-[50vh] rounded-none md:rounded-2xl overflow-hidden">
        <MapContainer
          center={surveysWithLocation[0]
            ? [parseFloat(surveysWithLocation[0].from_lat), parseFloat(surveysWithLocation[0].from_lng)]
            : defaultCenter
          }
          zoom={11}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            attribution='© Google Maps'
          />
          <LocationMarker position={userLocation} />

          {surveysWithLocation.map(survey => (
            <Marker
              key={survey.id}
              position={[parseFloat(survey.from_lat), parseFloat(survey.from_lng)]}
              icon={surveyIcon}
              eventHandlers={{
                click: () => setSelectedSurvey(survey)
              }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">{survey.customer_name}</p>
                  <p className="text-gray-500 text-xs">{survey.from_address}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Survey List */}
      <div className="p-4 md:p-0">
        <h2 className="font-bold text-gray-900 dark:text-white mb-3">
          Today's Route ({surveys.length})
        </h2>

        {surveys.length === 0 ? (
          <div className="surveyor-card text-center py-8">
            <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No surveys for today</p>
          </div>
        ) : (
          surveys.map((survey, idx) => (
            <motion.div
              key={survey.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="surveyor-card mb-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-qgo-blue text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white">{survey.customer_name}</p>
                  <p className="text-xs text-gray-500 truncate">{survey.from_address}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(survey.preferred_date).toLocaleDateString('en-KW', {
                      weekday: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => openNavigation(survey.from_lat, survey.from_lng)}
                  disabled={!survey.from_lat}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-qgo-blue text-white rounded-xl text-sm font-medium hover:bg-qgo-navy disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Navigation size={16} /> Navigate
                </button>
                <button
                  onClick={() => callCustomer(survey.customer_phone)}
                  disabled={!survey.customer_phone}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Phone size={16} /> Call
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/pages/surveyor/SurveyorMap.jsx
git commit -m "feat: create SurveyorMap page with navigation and call buttons"
```

---

## Task 8: Create SurveyorSettings Page

**Files:**
- Create: `src/pages/surveyor/SurveyorSettings.jsx`

**Step 1: Create SurveyorSettings**

```jsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import {
  User,
  Moon,
  Sun,
  Smartphone,
  Wifi,
  WifiOff,
  Bell,
  LogOut,
  ChevronRight,
  Database,
  RefreshCw
} from 'lucide-react'

export default function SurveyorSettings() {
  const { user, profile, signOut } = useAuth()
  const [theme, setTheme] = useState('system')
  const [notifications, setNotifications] = useState(true)
  const [syncStatus, setSyncStatus] = useState('online')
  const [offlineDataSize, setOfflineDataSize] = useState('0 KB')

  useEffect(() => {
    // Check stored theme preference
    const stored = localStorage.getItem('theme')
    if (stored) setTheme(stored)

    // Check if online
    setSyncStatus(navigator.onLine ? 'online' : 'offline')

    // Listen for online/offline
    window.addEventListener('online', () => setSyncStatus('online'))
    window.addEventListener('offline', () => setSyncStatus('offline'))

    // Estimate offline data size
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(({ usage }) => {
        setOfflineDataSize(formatBytes(usage || 0))
      })
    }
  }, [])

  function formatBytes(bytes) {
    if (bytes === 0) return '0 KB'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  function handleThemeChange(newTheme) {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)

    // Apply theme
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', prefersDark)
    }

    toast.success('Theme updated!')
  }

  async function clearOfflineData() {
    if (confirm('Clear all offline data? You may need to re-sync surveys.')) {
      // Clear IndexedDB
      if ('databases' in indexedDB) {
        const dbs = await indexedDB.databases()
        for (const db of dbs) {
          if (db.name) indexedDB.deleteDatabase(db.name)
        }
      }
      // Clear cache storage
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        for (const name of cacheNames) {
          await caches.delete(name)
        }
      }
      setOfflineDataSize('0 KB')
      toast.success('Offline data cleared!')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>

      {/* Profile Card */}
      <div className="surveyor-card">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-qgo-blue to-qgo-cyan rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">
              {profile?.full_name?.charAt(0) || '?'}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-gray-900 dark:text-white">{profile?.full_name}</h2>
            <p className="text-sm text-gray-500">{profile?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-qgo-blue/10 text-qgo-blue text-xs font-medium rounded-full">
              Surveyor
            </span>
          </div>
        </div>
      </div>

      {/* Sync Status */}
      <div className="surveyor-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {syncStatus === 'online' ? (
              <Wifi className="text-green-500" size={20} />
            ) : (
              <WifiOff className="text-red-500" size={20} />
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Sync Status</p>
              <p className="text-xs text-gray-500">
                {syncStatus === 'online' ? 'All data synced' : 'Offline - data will sync when connected'}
              </p>
            </div>
          </div>
          <button
            onClick={() => toast.success('Syncing...')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <RefreshCw size={18} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Theme */}
      <div className="surveyor-card">
        <p className="text-sm font-medium text-gray-500 mb-3">Appearance</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'system', icon: Smartphone, label: 'System' },
            { value: 'light', icon: Sun, label: 'Light' },
            { value: 'dark', icon: Moon, label: 'Dark' },
          ].map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => handleThemeChange(value)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-colors ${
                theme === value
                  ? 'bg-qgo-blue/10 border-2 border-qgo-blue'
                  : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent'
              }`}
            >
              <Icon size={20} className={theme === value ? 'text-qgo-blue' : 'text-gray-400'} />
              <span className={`text-xs font-medium ${theme === value ? 'text-qgo-blue' : 'text-gray-600 dark:text-gray-300'}`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="surveyor-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-gray-400" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Notifications</p>
              <p className="text-xs text-gray-500">Get alerts for new surveys</p>
            </div>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`w-12 h-7 rounded-full transition-colors ${
              notifications ? 'bg-qgo-blue' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <motion.div
              animate={{ x: notifications ? 22 : 2 }}
              className="w-5 h-5 bg-white rounded-full shadow"
            />
          </button>
        </div>
      </div>

      {/* Offline Data */}
      <div className="surveyor-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database size={20} className="text-gray-400" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Offline Data</p>
              <p className="text-xs text-gray-500">{offlineDataSize} stored locally</p>
            </div>
          </div>
          <button
            onClick={clearOfflineData}
            className="text-sm text-red-500 hover:text-red-600 font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={signOut}
        className="w-full flex items-center justify-center gap-2 py-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
      >
        <LogOut size={18} />
        Sign Out
      </button>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/pages/surveyor/SurveyorSettings.jsx
git commit -m "feat: create SurveyorSettings page with theme toggle and sync status"
```

---

## Task 9: Rewrite SurveyorSurvey (Survey Detail)

**Files:**
- Rewrite: `src/pages/surveyor/SurveyorSurvey.jsx`

**Step 1: Rewrite SurveyorSurvey (Part 1 - Main Component)**

Replace `src/pages/surveyor/SurveyorSurvey.jsx` with new implementation:

```jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import { calcCBM, recommendContainer, CONTAINERS, getFillPercent } from '@/utils/cbm'
import GPSTracker from '@/components/surveyor/GPSTracker'
import RoomTabs from './components/RoomTabs'
import CBMCounter from './components/CBMCounter'
import ItemCard from './components/ItemCard'
import QuickAddModal from './components/QuickAddModal'
import {
  ArrowLeft,
  Plus,
  CheckCircle,
  Truck,
  MapPin,
  Edit2,
  X,
  Save,
  ChevronDown
} from 'lucide-react'

export default function SurveyorSurvey() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [surveyor, setSurveyor] = useState(null)
  const [survey, setSurvey] = useState(null)
  const [rooms, setRooms] = useState([])
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeRoom, setActiveRoom] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    load()
  }, [id])

  async function load() {
    if (user) {
      const { data: sv } = await supabase
        .from('surveyors')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      setSurveyor(sv)
    }

    const [{ data: s }, { data: rm }, { data: it }, { data: ct }] = await Promise.all([
      supabase.from('survey_requests')
        .select('id,reference_number,customer_name,customer_email,customer_phone,from_address,from_lat,from_lng,from_city,from_country,to_address,to_lat,to_lng,to_city,to_country,move_type,selected_container,status')
        .eq('id', id)
        .single(),
      supabase.from('survey_rooms')
        .select('*,survey_items(*)')
        .eq('survey_request_id', id)
        .order('created_at'),
      supabase.from('items')
        .select('id,name,name_ar,default_cbm,default_weight_kg,is_fragile,category_id')
        .eq('is_active', true)
        .order('name'),
      supabase.from('item_categories')
        .select('*')
        .order('sort_order')
    ])

    setSurvey(s)
    setRooms(rm ?? [])
    setItems(it ?? [])
    setCategories(ct ?? [])
    if (rm?.length > 0) setActiveRoom(rm[0].id)
    setLoading(false)
  }

  async function addRoom() {
    if (!newRoomName.trim()) return
    setSaving(true)
    const { data } = await supabase
      .from('survey_rooms')
      .insert([{ survey_request_id: id, room_name: newRoomName }])
      .select()
      .single()

    if (data) {
      setRooms(prev => [...prev, { ...data, survey_items: [] }])
      setActiveRoom(data.id)
      setNewRoomName('')
      setShowRoomModal(false)
      toast.success('Room added!')
    }
    setSaving(false)
  }

  async function addItemToRoom(item) {
    const cbm = parseFloat(item.default_cbm) || 0
    const { data, error } = await supabase
      .from('survey_items')
      .insert([{
        survey_room_id: activeRoom,
        item_id: item.id,
        custom_name: item.name,
        cbm,
        weight_kg: item.default_weight_kg,
        is_fragile: item.is_fragile,
        quantity: 1
      }])
      .select()
      .single()

    if (error) {
      toast.error(error.message)
      return
    }

    setRooms(prev => prev.map(r =>
      r.id === activeRoom
        ? { ...r, survey_items: [...(r.survey_items || []), data] }
        : r
    ))
    toast.success(`${item.name} added!`)
  }

  async function removeItem(roomId, itemId) {
    await supabase.from('survey_items').delete().eq('id', itemId)
    setRooms(prev => prev.map(r =>
      r.id === roomId
        ? { ...r, survey_items: r.survey_items.filter(i => i.id !== itemId) }
        : r
    ))
  }

  async function completeSurvey() {
    const allItems = rooms.flatMap(r => r.survey_items || [])
    const totalCBM = allItems.reduce((a, i) => a + (parseFloat(i.cbm) || 0), 0)
    const autoRec = recommendContainer(totalCBM)
    const finalContainer = survey?.selected_container || autoRec.primary

    setSaving(true)
    await Promise.all([
      supabase.from('survey_requests').update({ status: 'surveyed' }).eq('id', id),
      supabase.from('survey_reports').upsert([{
        survey_request_id: id,
        total_items: allItems.length,
        total_cbm: totalCBM,
        recommended_container: finalContainer,
        container_recommendation: { ...autoRec, totalCBM },
        status: 'draft'
      }])
    ])
    toast.success('Survey completed!')
    navigate('/surveyor')
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-qgo-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">Survey not found</p>
      </div>
    )
  }

  const allItems = rooms.flatMap(r => r.survey_items || [])
  const totalCBM = allItems.reduce((a, i) => a + (parseFloat(i.cbm) || 0), 0)
  const autoRec = recommendContainer(totalCBM)
  const selectedContainer = survey?.selected_container || autoRec.primary
  const recContainer = CONTAINERS[selectedContainer]
  const fillPct = getFillPercent(totalCBM, selectedContainer)
  const currentRoom = rooms.find(r => r.id === activeRoom)

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 shadow-sm"
        >
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-qgo-blue font-bold text-sm">{survey.reference_number}</p>
          <p className="font-semibold text-gray-900 dark:text-white truncate">{survey.customer_name}</p>
        </div>
      </div>

      {/* Route Card */}
      <div className="surveyor-card">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600">1</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {survey.from_city || survey.from_address}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-green-600">2</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {survey.to_city || survey.to_address}
              </span>
            </div>
          </div>
          <Truck className="text-gray-300" size={32} />
        </div>
      </div>

      {/* CBM Counter */}
      <CBMCounter
        totalCBM={totalCBM}
        containerType={selectedContainer}
        fillPercent={fillPct}
      />

      {/* GPS Tracker */}
      {surveyor && (
        <GPSTracker surveyorId={surveyor.id} surveyRequestId={id} />
      )}

      {/* Room Tabs */}
      <RoomTabs
        rooms={rooms}
        activeRoom={activeRoom}
        onSelect={setActiveRoom}
        onAddRoom={() => setShowRoomModal(true)}
      />

      {/* Items */}
      {currentRoom ? (
        <div className="surveyor-card !p-0">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="font-semibold text-gray-900 dark:text-white">{currentRoom.room_name}</span>
            <span className="text-xs text-gray-400">
              {currentRoom.survey_items?.reduce((a, i) => a + (parseFloat(i.cbm) || 0), 0).toFixed(2)} CBM
            </span>
          </div>
          <div className="p-3">
            {(currentRoom.survey_items || []).length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">
                No items yet. Tap + to add items.
              </div>
            ) : (
              <AnimatePresence>
                {currentRoom.survey_items.map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onDelete={() => removeItem(currentRoom.id, item.id)}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      ) : (
        <div className="surveyor-card text-center py-8">
          <p className="text-gray-400">Add a room to start</p>
        </div>
      )}

      {/* Add Item Button */}
      {activeRoom && (
        <button
          className="w-full btn-primary flex items-center justify-center gap-2"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={18} /> Add Item to {currentRoom?.room_name}
        </button>
      )}

      {/* Complete Button */}
      {allItems.length > 0 && (
        <button
          className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors"
          onClick={completeSurvey}
          disabled={saving}
        >
          <CheckCircle size={20} />
          {saving ? 'Saving...' : 'Complete Survey'}
        </button>
      )}

      {/* Add Room Modal */}
      <AnimatePresence>
        {showRoomModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowRoomModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Add Room</h3>
              <input
                className="input mb-4"
                placeholder="e.g. Master Bedroom, Living Room..."
                value={newRoomName}
                onChange={e => setNewRoomName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addRoom()}
                autoFocus
              />
              <div className="flex gap-2 flex-wrap mb-4">
                {['Living Room', 'Master Bedroom', 'Bedroom', 'Kitchen', 'Dining', 'Office', 'Storage', 'Garage'].map(r => (
                  <button
                    key={r}
                    onClick={() => setNewRoomName(r)}
                    className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-qgo-blue hover:text-white transition-colors"
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  className="btn-secondary flex-1"
                  onClick={() => setShowRoomModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary flex-1"
                  onClick={addRoom}
                  disabled={!newRoomName.trim() || saving}
                >
                  Add
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        items={items}
        categories={categories}
        onSelect={(item) => {
          addItemToRoom(item)
          setShowAddModal(false)
        }}
      />
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/pages/surveyor/SurveyorSurvey.jsx
git commit -m "feat: rewrite SurveyorSurvey with new mobile-first design"
```

---

## Task 10: Update App Routes

**Files:**
- Modify: `src/App.jsx`

**Step 1: Add new surveyor routes**

Find the surveyor routes section in `src/App.jsx` and update:

```jsx
// Surveyor routes
<Route path="/surveyor" element={<RequireAuth><SurveyorLayout /></RequireAuth>}>
  <Route index element={<SurveyorDashboard />} />
  <Route path="surveys" element={<SurveyorSurveys />} />
  <Route path="map" element={<SurveyorMap />} />
  <Route path="settings" element={<SurveyorSettings />} />
  <Route path=":id" element={<SurveyorSurvey />} />
</Route>
```

**Step 2: Add imports for new components**

Add to imports section:

```jsx
import SurveyorLayout from '@/pages/surveyor/SurveyorLayout'
import SurveyorDashboard from '@/pages/surveyor/SurveyorDashboard'
import SurveyorSurveys from '@/pages/surveyor/SurveyorSurveys'
import SurveyorMap from '@/pages/surveyor/SurveyorMap'
import SurveyorSettings from '@/pages/surveyor/SurveyorSettings'
import SurveyorSurvey from '@/pages/surveyor/SurveyorSurvey'
```

**Step 3: Verify routes work**

Run: `npm run dev`
Navigate to: `/surveyor`

**Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add new surveyor routes with top tabs"
```

---

## Final Verification

1. Login as surveyor (`surveyor@qgocargo.com` / `demo123`)
2. Verify top tabs show: Home, Surveys, Map, Settings
3. Dashboard shows greeting, stats, and today's surveys
4. Surveys tab shows all surveys with search and filters
5. Map tab shows survey locations with navigate/call buttons
6. Settings tab shows theme toggle and sync status
7. Open a survey - verify new layout with room tabs
8. Test adding items via quick add modal
9. Test voice input in quick add modal
10. Test theme toggle (light/dark/system)
11. Complete a survey and verify redirect

---

## Files Summary

| File | Action |
|------|--------|
| `src/index.css` | Modify - Add dark theme and surveyor styles |
| `src/pages/surveyor/components/StatCard.jsx` | Create |
| `src/pages/surveyor/components/SurveyCard.jsx` | Create |
| `src/pages/surveyor/components/RoomTabs.jsx` | Create |
| `src/pages/surveyor/components/CBMCounter.jsx` | Create |
| `src/pages/surveyor/components/ItemCard.jsx` | Create |
| `src/pages/surveyor/components/QuickAddModal.jsx` | Create |
| `src/pages/surveyor/SurveyorLayout.jsx` | Rewrite |
| `src/pages/surveyor/SurveyorDashboard.jsx` | Rewrite |
| `src/pages/surveyor/SurveyorSurveys.jsx` | Create |
| `src/pages/surveyor/SurveyorMap.jsx` | Create |
| `src/pages/surveyor/SurveyorSettings.jsx` | Create |
| `src/pages/surveyor/SurveyorSurvey.jsx` | Rewrite |
| `src/App.jsx` | Modify - Add new routes |
