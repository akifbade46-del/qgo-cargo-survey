import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Camera, Mic, Grid, List, Star, Package, PlusCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function QuickAddModal({ isOpen, onClose, items = [], categories = [], onAddItem, onManualAdd, recentItems = [] }) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // grid or list
  const [isListening, setIsListening] = useState(false)

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = search
        ? item.name.toLowerCase().includes(search.toLowerCase()) ||
          (item.name_ar && item.name_ar.includes(search))
        : true
      const matchesCategory = activeCategory === 'all' || item.category_id === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [items, search, activeCategory])

  // Get popular items (most frequently used)
  const popularItems = useMemo(() => {
    if (recentItems.length > 0) {
      return recentItems.slice(0, 6)
    }
    return items.filter(i => i.is_popular).slice(0, 6)
  }, [items, recentItems])

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearch('')
      setActiveCategory('all')
    }
  }, [isOpen])

  // Voice input handler
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice input not supported in this browser')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setSearch(transcript)
    }

    recognition.start()
  }

  // Handle item selection
  const handleSelectItem = (item) => {
    onAddItem(item)
    toast.success(`${item.name} added!`)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25 }}
          className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col"
          onClick={e => e.stopPropagation()}
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
          {/* Header */}
          <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Add Item</h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)'
                  }}
                  autoFocus
                />
              </div>
              <button
                onClick={startVoiceInput}
                className={`p-2.5 rounded-xl transition-colors ${isListening ? 'bg-red-500 text-white' : ''}`}
                style={{ backgroundColor: isListening ? undefined : 'var(--bg-secondary)' }}
              >
                <Mic size={20} className={isListening ? 'animate-pulse' : ''} />
              </button>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
              <button
                onClick={() => setActiveCategory('all')}
                className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  activeCategory === 'all' ? 'text-white' : ''
                }`}
                style={{
                  backgroundColor: activeCategory === 'all' ? 'var(--color-primary)' : 'var(--bg-tertiary)',
                  color: activeCategory === 'all' ? 'white' : 'var(--text-secondary)'
                }}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors`}
                  style={{
                    backgroundColor: activeCategory === cat.id ? 'var(--color-primary)' : 'var(--bg-tertiary)',
                    color: activeCategory === cat.id ? 'white' : 'var(--text-secondary)'
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Popular Items (when no search) */}
          {!search && popularItems.length > 0 && (
            <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Star size={14} style={{ color: 'var(--color-primary)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Popular Items</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {popularItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className="p-2 rounded-xl text-center transition-all hover:scale-105"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                  >
                    <Package size={20} className="mx-auto mb-1" style={{ color: 'var(--color-primary)' }} />
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{item.default_cbm} CBM</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto">
            {filteredItems.length > 0 ? (
              <div className="p-4 space-y-1">
                {filteredItems.map(item => (
                  <motion.button
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <Package size={18} style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {item.default_cbm} CBM · {item.default_weight_kg} kg
                        {item.is_fragile && <span className="text-red-500 ml-1">· Fragile</span>}
                      </p>
                    </div>
                    <div className="text-xs px-2 py-1 rounded-lg" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
                      Add
                    </div>
                  </motion.button>
                ))}

                {/* Manual Add Button */}
                {onManualAdd && (
                  <motion.button
                    onClick={onManualAdd}
                    className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left mt-2 border-2 border-dashed"
                    style={{ borderColor: 'var(--border-color)', backgroundColor: 'transparent' }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <PlusCircle size={18} style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        Add Custom Item
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        Item not in list? Add manually
                      </p>
                    </div>
                  </motion.button>
                )}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Package size={48} className="mx-auto mb-3" style={{ color: 'var(--text-tertiary)' }} />
                <p style={{ color: 'var(--text-secondary)' }}>No items found</p>
                <p className="text-sm mb-4" style={{ color: 'var(--text-tertiary)' }}>Try a different search or add manually</p>
                {onManualAdd && (
                  <button
                    onClick={onManualAdd}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    <PlusCircle size={16} className="inline mr-1" /> Add Custom Item
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
