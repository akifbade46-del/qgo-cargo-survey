import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, Plus, Trash2, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export default function PhotoUploader({ itemId, onUploaded, existingPhotos = [] }) {
  const [photos, setPhotos] = useState(existingPhotos)
  const [uploading, setUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const fileInputRef = useRef(null)

  const compressImage = (file, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          const base64 = canvas.toDataURL('image/jpeg', quality)
          resolve(base64)
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    if (photos.length + files.length > 5) {
      toast.error('Maximum 5 photos allowed per item')
      return
    }

    setUploading(true)
    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`)
          continue
        }

        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 10MB)`)
          continue
        }

        const base64 = await compressImage(file)
        const sizeKB = Math.round((base64.length * 3) / 4 / 1024)

        if (sizeKB > 500) {
          // Try more compression
          const smaller = await compressImage(file, 600, 0.5)
          if (smaller.length > 500 * 1024 * 1.3) {
            toast.error(`Image still too large. Please use a smaller image.`)
            continue
          }
        }

        const { data, error } = await supabase
          .from('item_attachments')
          .insert([{
            survey_item_id: itemId,
            type: 'photo',
            file_data: base64,
            file_name: file.name,
            mime_type: 'image/jpeg',
            file_size_kb: sizeKB
          }])
          .select()
          .single()

        if (error) throw error

        setPhotos(prev => [...prev, data])
        if (onUploaded) onUploaded(data)
      }

      toast.success('Photo(s) uploaded!')
    } catch (err) {
      toast.error('Failed to upload photo')
      console.error(err)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const deletePhoto = async (photoId) => {
    try {
      await supabase.from('item_attachments').delete().eq('id', photoId)
      setPhotos(prev => prev.filter(p => p.id !== photoId))
      setPreviewImage(null)
      toast.success('Photo deleted')
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="space-y-3">
      {/* Photo Grid */}
      <div className="grid grid-cols-5 gap-2">
        {photos.map((photo) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-square"
          >
            <button
              onClick={() => setPreviewImage(photo)}
              className="w-full h-full rounded-lg overflow-hidden"
            >
              <img
                src={photo.file_data}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
            <button
              onClick={() => deletePhoto(photo.id)}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white"
            >
              <X size={12} />
            </button>
          </motion.div>
        ))}

        {/* Add Photo Button */}
        {photos.length < 5 && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-lg border-2 border-dashed flex items-center justify-center transition-colors"
            style={{
              borderColor: 'var(--border-color)',
              backgroundColor: 'var(--bg-tertiary)'
            }}
          >
            {uploading ? (
              <Loader size={20} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
            ) : (
              <Plus size={20} style={{ color: 'var(--text-tertiary)' }} />
            )}
          </motion.button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        capture="environment"
      />

      {/* Camera Button */}
      {photos.length < 5 && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
          style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
        >
          <Camera size={16} style={{ color: 'var(--color-primary)' }} />
          <span>{uploading ? 'Uploading...' : 'Take Photo'}</span>
          <span className="text-xs opacity-60">({photos.length}/5)</span>
        </motion.button>
      )}

      {/* Full Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-full max-h-full"
            >
              <img
                src={previewImage.file_data}
                alt=""
                className="max-w-full max-h-[80vh] rounded-lg"
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deletePhoto(previewImage.id)
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center gap-2"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </motion.div>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white"
            >
              <X size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
