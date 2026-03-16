import { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Camera, Trash2, Package, X, Plus, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

// Compress image to reduce storage
async function compressImage(file, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Scale down if too large
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to compressed JPEG
        const compressedData = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedData)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

export default function ItemsTab({
  currentRoom,
  items,
  categories,
  onAddItem,
  onDeleteItem,
  onPhotoCapture,
  onManualAdd,
  onAddPhoto
}) {
  const [search, setSearch] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [manualModal, setManualModal] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [showItemBrowser, setShowItemBrowser] = useState(true)
  const [photoViewer, setPhotoViewer] = useState({ open: false, photos: [], index: 0 })
  const [cameraModal, setCameraModal] = useState({ open: false, itemId: null })
  const fileInputRef = useRef(null)
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

  // Group items by category
  const itemsByCategory = useMemo(() => {
    const grouped = {}
    items.forEach(item => {
      const catId = item.category_id || 'other'
      const catName = categories?.find(c => c.id === catId)?.name || 'Other'
      if (!grouped[catName]) grouped[catName] = []
      grouped[catName].push(item)
    })
    return grouped
  }, [items, categories])

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

        {/* Search Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl
                         shadow-lg border border-gray-100 overflow-hidden z-10 max-h-64 overflow-y-auto"
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
                  <Plus size={16} className="text-green-500" />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setShowItemBrowser(!showItemBrowser)}
          className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-medium
                     flex items-center justify-center gap-2"
        >
          <Package size={18} />
          {showItemBrowser ? 'Hide' : 'Show'} Items
        </button>
        <button
          onClick={() => setManualModal(true)}
          className="flex-1 py-3 rounded-xl bg-green-500 text-white font-medium
                     flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Custom Item
        </button>
      </div>

      {/* Item Browser - Category Accordion */}
      <AnimatePresence>
        {showItemBrowser && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
                <div key={category} className="border-b border-gray-100 last:border-b-0">
                  {/* Category Header */}
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{category}</span>
                      <span className="text-xs text-gray-400">({categoryItems.length})</span>
                    </div>
                    {expandedCategory === category ? (
                      <ChevronUp size={18} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-400" />
                    )}
                  </button>

                  {/* Category Items */}
                  <AnimatePresence>
                    {expandedCategory === category && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden bg-gray-50"
                      >
                        <div className="p-3 grid grid-cols-2 gap-2">
                          {categoryItems.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => handleSelectItem(item)}
                              className="p-3 bg-white rounded-xl text-left hover:shadow-md
                                       transition-shadow border border-gray-100"
                            >
                              <p className="font-medium text-sm text-gray-900 truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-500">{item.default_cbm} CBM</p>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Added Items Section */}
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">
          Added Items ({roomItems.length})
        </h3>
      </div>

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
                      <span className="text-xs text-red-500">⚠️ Fragile</span>
                    )}
                    {item.notes && (
                      <p className="text-xs text-gray-400 mt-1">{item.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.photos?.length > 0 && (
                    <button
                      onClick={() => setPhotoViewer({ open: true, photos: item.photos, index: 0 })}
                      className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full hover:bg-blue-200 flex items-center gap-1"
                    >
                      <Camera size={12} /> {item.photos.length} Photo{item.photos.length > 1 ? 's' : ''}
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setCameraModal({ open: true, itemId: item.id })}
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
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <Package size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No items added yet</p>
            <p className="text-sm text-gray-400">Browse items above or add custom</p>
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
              className="bg-white rounded-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto"
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

      {/* Photo Viewer Modal */}
      <AnimatePresence>
        {photoViewer.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
            onClick={() => setPhotoViewer({ open: false, photos: [], index: 0 })}
          >
            <button
              onClick={() => setPhotoViewer({ open: false, photos: [], index: 0 })}
              className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
            >
              <X size={32} />
            </button>

            {/* Navigation */}
            {photoViewer.photos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setPhotoViewer(p => ({
                      ...p,
                      index: p.index > 0 ? p.index - 1 : p.photos.length - 1
                    }))
                  }}
                  className="absolute left-4 text-white/80 hover:text-white p-2"
                >
                  <ChevronLeft size={40} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setPhotoViewer(p => ({
                      ...p,
                      index: p.index < p.photos.length - 1 ? p.index + 1 : 0
                    }))
                  }}
                  className="absolute right-4 text-white/80 hover:text-white p-2"
                >
                  <ChevronRight size={40} />
                </button>
              </>
            )}

            {/* Photo */}
            <motion.img
              key={photoViewer.index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={photoViewer.photos[photoViewer.index]}
              alt={`Photo ${photoViewer.index + 1}`}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
              onClick={e => e.stopPropagation()}
            />

            {/* Counter */}
            {photoViewer.photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
                {photoViewer.index + 1} / {photoViewer.photos.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera Modal */}
      <AnimatePresence>
        {cameraModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setCameraModal({ open: false, itemId: null })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm"
            >
              <h3 className="font-bold text-lg mb-4 text-center">Add Photo</h3>

              <div className="space-y-3">
                {/* Camera Button */}
                <button
                  onClick={async () => {
                    try {
                      // Create file input for camera
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = 'image/*'
                      input.capture = 'environment'

                      input.onchange = async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          toast.loading('Processing...')
                          const compressed = await compressImage(file, 800, 0.6)
                          toast.dismiss()

                          if (onAddPhoto) {
                            onAddPhoto(cameraModal.itemId, compressed)
                          }
                          setCameraModal({ open: false, itemId: null })
                          toast.success('Photo added!')
                        }
                      }

                      input.click()
                    } catch (err) {
                      toast.error('Could not open camera')
                    }
                  }}
                  className="w-full py-4 rounded-xl bg-blue-500 text-white font-medium
                           flex items-center justify-center gap-2"
                >
                  <Camera size={20} />
                  Open Camera
                </button>

                {/* Gallery Button */}
                <button
                  onClick={async () => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = 'image/*'

                    input.onchange = async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        toast.loading('Processing...')
                        const compressed = await compressImage(file, 800, 0.6)
                        toast.dismiss()

                        if (onAddPhoto) {
                          onAddPhoto(cameraModal.itemId, compressed)
                        }
                        setCameraModal({ open: false, itemId: null })
                        toast.success('Photo added!')
                      }
                    }

                    input.click()
                  }}
                  className="w-full py-4 rounded-xl bg-gray-100 text-gray-700 font-medium
                           flex items-center justify-center gap-2"
                >
                  <Package size={20} />
                  Choose from Gallery
                </button>
              </div>

              <button
                onClick={() => setCameraModal({ open: false, itemId: null })}
                className="w-full mt-4 py-2 text-gray-500 text-sm"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
