import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Camera, Trash2, Package, X, Plus, Edit2 } from 'lucide-react'

export default function ItemsTab({
  currentRoom,
  items,
  onAddItem,
  onDeleteItem,
  onPhotoCapture,
  onManualAdd
}) {
  const [search, setSearch] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [manualModal, setManualModal] = useState(false)
  const [manualItem, setManualItem] = useState({
    name: '',
    cbm: '',
    quantity: 1,
    is_fragile: false,
    notes: ''
  })

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

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setManualModal(true)}
          className="flex-1 py-3 rounded-xl bg-green-500 text-white font-medium
                     flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Add Custom Item
        </button>
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
            <p className="text-sm text-gray-400">Search above or tap Add Custom Item</p>
          </div>
        )}
      </div>

      {/* Manual Item Modal */}
      <AnimatePresence>
        {manualModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setManualModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm"
            >
              <h3 className="font-bold text-lg mb-4">Add Custom Item</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Item Name *</label>
                  <input
                    type="text"
                    value={manualItem.name}
                    onChange={e => setManualItem(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Antique Vase"
                    className="w-full p-3 rounded-xl bg-gray-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">CBM</label>
                    <input
                      type="number"
                      step="0.01"
                      value={manualItem.cbm}
                      onChange={e => setManualItem(p => ({ ...p, cbm: e.target.value }))}
                      placeholder="0.00"
                      className="w-full p-3 rounded-xl bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Qty</label>
                    <input
                      type="number"
                      value={manualItem.quantity}
                      onChange={e => setManualItem(p => ({ ...p, quantity: parseInt(e.target.value) || 1 }))}
                      className="w-full p-3 rounded-xl bg-gray-100"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="fragile"
                    checked={manualItem.is_fragile}
                    onChange={e => setManualItem(p => ({ ...p, is_fragile: e.target.checked }))}
                    className="w-5 h-5 rounded"
                  />
                  <label htmlFor="fragile" className="text-gray-700">Fragile item</label>
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Notes (optional)</label>
                  <textarea
                    value={manualItem.notes}
                    onChange={e => setManualItem(p => ({ ...p, notes: e.target.value }))}
                    placeholder="Any special notes..."
                    className="w-full p-3 rounded-xl bg-gray-100 h-20 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setManualModal(false)
                    setManualItem({ name: '', cbm: '', quantity: 1, is_fragile: false, notes: '' })
                  }}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (manualItem.name.trim()) {
                      onManualAdd({
                        custom_name: manualItem.name,
                        cbm: parseFloat(manualItem.cbm) || 0,
                        quantity: manualItem.quantity || 1,
                        is_fragile: manualItem.is_fragile,
                        notes: manualItem.notes
                      })
                      setManualModal(false)
                      setManualItem({ name: '', cbm: '', quantity: 1, is_fragile: false, notes: '' })
                    }
                  }}
                  disabled={!manualItem.name.trim()}
                  className="flex-1 py-3 rounded-xl bg-green-500 text-white disabled:opacity-50"
                >
                  Add Item
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
