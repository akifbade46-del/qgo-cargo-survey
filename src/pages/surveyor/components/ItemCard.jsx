import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Camera, Mic, Trash2, ChevronDown, ChevronUp, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import PhotoUploader from './PhotoUploader'
import VoiceRecorder from './VoiceRecorder'

export default function ItemCard({ item, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({
    quantity: item.quantity || 1,
    cbm: item.cbm || 0,
    notes: item.notes || ''
  })
  const [photos, setPhotos] = useState([])
  const [voiceNotes, setVoiceNotes] = useState([])
  const [loading, setLoading] = useState(false)

  // Load attachments on mount
  useEffect(() => {
    if (item.id) loadAttachments()
  }, [item.id])

  async function loadAttachments() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('item_attachments')
        .select('*')
        .eq('survey_item_id', item.id)
        .order('created_at', { ascending: true })

      if (data) {
        setPhotos(data.filter(a => a.type === 'photo'))
        setVoiceNotes(data.filter(a => a.type === 'voice'))
      }
    } catch (err) {
      console.error('Failed to load attachments')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (onUpdate) {
      await onUpdate(item.id, editData)
      toast.success('Item updated')
    }
    setEditing(false)
  }

  const hasAttachments = photos.length > 0 || voiceNotes.length > 0

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

        {/* Attachment Count Badges */}
        <div className="flex items-center gap-1">
          {photos.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
              <Camera size={12} /> {photos.length}
            </span>
          )}
          {voiceNotes.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 flex items-center gap-1">
              <Mic size={12} /> {voiceNotes.length}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
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
            <div className="px-3 pb-3 pt-1 border-t space-y-4" style={{ borderColor: 'var(--border-color)' }}>
              {/* Photo Uploader */}
              <div>
                <p className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                  <Camera size={12} /> Photos
                </p>
                <PhotoUploader
                  itemId={item.id}
                  existingPhotos={photos}
                  onUploaded={() => loadAttachments()}
                />
              </div>

              {/* Voice Recorder */}
              <div>
                <p className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                  <Mic size={12} /> Voice Notes
                </p>
                <VoiceRecorder
                  itemId={item.id}
                  existingNotes={voiceNotes}
                  onRecorded={() => loadAttachments()}
                />
              </div>

              {/* Edit Section */}
              {editing ? (
                <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
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
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                >
                  <Edit2 size={12} /> Edit Item Details
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
