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
