import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function QuickAddInput({
  onAdd,
  onManualAdd,
  rooms,
  activeRoom,
  placeholder = 'Search items or add room...',
  items = [],
  categories = []
}) {
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef(null)

  // Get items for the current room
  const room = rooms.find(r => r.id === activeRoom)
  const itemsInRoom = room ? room.survey_items : []

  // Filter suggestions based on input (3 chars)
  const filteredSuggestions = useMemo(() => {
    if (!input) return []
    const inputLower = input.toLowerCase()

    return items
      .filter(item =>
        item.name?.toLowerCase().includes(inputLower) ||
        item.custom_name?.toLowerCase().includes(inputLower)
      )
      .slice(0, 5)
  }, [input, items])

  // Show suggestions when typing
  useEffect(() => {
    if (input.length >= 2) {
      setShowSuggestions(true)
    }
  }, [input])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (filteredSuggestions.length > 0) {
        handleSelect(filteredSuggestions[0])
      } else if (input.trim() && onManualAdd) {
        // No match - open manual add modal
        onManualAdd(input.trim())
        setInput('')
        setShowSuggestions(false)
      }
    }
  }

  const handleSelect = (item) => {
    if (onAdd) {
      onAdd(item)
      toast.success(`${item.name || item.custom_name} added!`)
    }
    setInput('')
    setShowSuggestions(false)
  }

  // Show manual add option
  const handleManualAdd = () => {
    if (onManualAdd) {
      onManualAdd(input.trim())
    }
    setShowSuggestions(false)
    setInput('')
  }

  return (
    <div className="sticky bottom-4 left-4 right-4 p-3 bg-white z-40 rounded-t-2xl shadow-lg"
      style={{ backgroundColor: 'var(--color-primary)', boxShadow: '0 4px 4px rgba(0,0,0,0.15)' }}
    >
      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && input.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-16 left-4 right-4 max-h-48 bg-white rounded-xl shadow-lg overflow-y-auto"
            style={{ maxHeight: '200px' }}
          >
            {filteredSuggestions.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className="w-full p-3 flex items-center gap-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <span className="text-lg">📦</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.custom_name || item.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.default_cbm} CBM
                  </p>
                </div>
              </button>
            ))}
            {filteredSuggestions.length === 0 && input.length >= 2 && (
              <button
                onClick={handleManualAdd}
                className="w-full p-3 flex items-center gap-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
                  <Plus size={18} className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Add custom item</p>
                  <p className="text-xs text-gray-500">"{input}"</p>
                </div>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input field */}
      <div className="flex items-center gap-2">
        <Search size={18} className="text-white/70" />
        <input
          type="text"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 py-2.5 text-sm bg-transparent outline-none placeholder-white/70 text-white"
        />
        <button
          onClick={() => {
            if (input.trim() && onManualAdd) {
              onManualAdd(input.trim())
              setInput('')
              setShowSuggestions(false)
            } else {
              inputRef.current?.focus()
            }
          }}
          className="p-2 rounded-lg transition-colors hover:bg-white/10"
        >
          <Plus size={18} className="text-white" />
        </button>
      </div>
    </div>
  )
}
