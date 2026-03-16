import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Camera, Mic, Trash2, ChevronDown, ChevronUp, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ItemCard({ item, onUpdate, onDelete, onAddPhoto, onAddVoice }) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({
    quantity: item.quantity || 1,
    cbm: item.cbm || 0,
    notes: item.notes || ''
  })

  const handleUpdate = async () => {
    if (onUpdate) {
      await onUpdate(item.id, editData)
      toast.success('Item updated')
    }
    setEditing(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      {/* Main Content */}
      <div className="flex items-center gap-3 p-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          <Package size={18} style={{ color: 'var(--color-primary)' }} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
            {item.custom_name || item.name}
            {item.quantity > 1 && <span className="ml-1 opacity-60">×{item.quantity}</span>}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {(item.cbm * (item.quantity || 1)).toFixed(2)} CBM · {item.weight_kg} kg
            {item.is_fragile && <span className="text-red-500 ml-1">· Fragile</span>}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {onAddPhoto && (
            <button
              onClick={() => onAddPhoto(item)}
              className={`relative p-2 rounded-lg transition-colors`}
              style={{ backgroundColor: item.photos?.length > 0 ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-tertiary)', color: item.photos?.length > 0 ? '#3b82f6' : 'var(--text-tertiary)' }}
            >
              <Camera size={16} />
              {item.photos?.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                  {item.photos.length}
                </span>
              )}
            </button>
          )}
          {onAddVoice && (
            <button
              onClick={() => onAddVoice(item)}
              className={`p-2 rounded-lg transition-colors`}
              style={{ backgroundColor: item.voice_notes?.length > 0 ? 'rgba(249, 115, 22, 0.1)' : 'var(--bg-tertiary)', color: item.voice_notes?.length > 0 ? '#f97316' : 'var(--text-tertiary)' }}
            >
              <Mic size={16} />
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(item.id)}
              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 border-t" style={{ borderColor: 'var(--border-color)' }}>
              {editing ? (
                <div className="space-y-2 mt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs block mb-1" style={{ color: 'var(--text-tertiary)' }}>Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={editData.quantity}
                        onChange={e => setEditData({ ...editData, quantity: parseInt(e.target.value) || 1 })}
                        className="w-full p-2 rounded-lg text-sm"
                        style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <div>
                      <label className="text-xs block mb-1" style={{ color: 'var(--text-tertiary)' }}>CBM</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editData.cbm}
                        onChange={e => setEditData({ ...editData, cbm: parseFloat(e.target.value) || 0 })}
                        className="w-full p-2 rounded-lg text-sm"
                        style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs block mb-1" style={{ color: 'var(--text-tertiary)' }}>Notes</label>
                    <textarea
                      value={editData.notes}
                      onChange={e => setEditData({ ...editData, notes: e.target.value })}
                      rows={2}
                      placeholder="Add notes..."
                      className="w-full p-2 rounded-lg text-sm"
                      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditing(false)}
                      className="flex-1 py-2 rounded-lg text-sm font-medium"
                      style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdate}
                      className="flex-1 py-2 rounded-lg text-sm font-medium text-white"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  {/* Photos Preview */}
                  {item.photos?.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Photos ({item.photos.length})</p>
                      <div className="flex gap-1 overflow-x-auto">
                        {item.photos.map((photo, i) => (
                          <img key={i} src={photo} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Voice Notes */}
                  {item.voice_notes?.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Voice Notes ({item.voice_notes.length})</p>
                      {item.voice_notes.map((note, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg mb-1" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                          <Mic size={14} style={{ color: 'var(--text-tertiary)' }} />
                          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{note.duration}s</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Notes */}
                  {item.notes && (
                    <p className="text-xs p-2 rounded-lg mb-2" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                      {item.notes}
                    </p>
                  )}

                  {/* Edit Button */}
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                  >
                    <Edit2 size={12} /> Edit Details
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
