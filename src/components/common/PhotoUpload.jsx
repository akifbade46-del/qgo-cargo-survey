import { useState, useRef } from 'react'
import { Camera, X, ZoomIn, Trash2, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

/**
 * Photo Upload Component
 * Allows surveyors to attach photos to items or rooms
 */
export default function PhotoUpload({
  surveyId,
  roomId,
  itemId,
  existingPhotos = [],
  onPhotosChange,
  maxPhotos = 5,
  label = "Add Photos"
}) {
  const [photos, setPhotos] = useState(existingPhotos || [])
  const [uploading, setUploading] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(null)
  const fileInputRef = useRef(null)

  const folderPath = itemId
    ? `surveys/${surveyId}/rooms/${roomId}/items/${itemId}`
    : `surveys/${surveyId}/rooms/${roomId}`

  async function handleFileSelect(event) {
    const files = Array.from(event.target.files || [])

    if (photos.length + files.length > maxPhotos) {
      return toast.error(`Maximum ${maxPhotos} photos allowed`)
    }

    setUploading(true)

    try {
      const uploadPromises = files.map(async (file) => {
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`

        // Compress image if too large
        const compressedFile = await compressImage(file)

        const { data, error } = await supabase.storage
          .from('survey-photos')
          .upload(`${folderPath}/${fileName}`, compressedFile, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) throw error

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('survey-photos')
          .getPublicUrl(data.path)

        return {
          id: data.id,
          url: publicUrl,
          path: data.path,
          name: file.name,
          size: file.size,
          uploaded_at: new Date().toISOString()
        }
      })

      const uploadedPhotos = await Promise.all(uploadPromises)
      const newPhotos = [...photos, ...uploadedPhotos]
      setPhotos(newPhotos)
      onPhotosChange?.(newPhotos)

      toast.success(`${uploadedPhotos.length} photo(s) uploaded`)
    } catch (err) {
      console.error('Upload error:', err)
      toast.error('Failed to upload photos')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  async function handleCameraCapture() {
    // Check if device supports camera
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return toast.error('Camera not supported on this device')
    }

    // Create file input with capture attribute
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'

    input.onchange = (e) => {
      handleFileSelect(e)
    }

    input.click()
  }

  async function compressImage(file) {
    // If image is already small, return as is
    if (file.size < 500000) return file // 500KB

    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          // Max dimensions
          const maxDim = 1920
          if (width > height && width > maxDim) {
            height = (height * maxDim) / width
            width = maxDim
          } else if (height > maxDim) {
            width = (width * maxDim) / height
            height = maxDim
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }))
          }, 'image/jpeg', 0.8)
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  async function deletePhoto(photoId) {
    try {
      const photo = photos.find(p => p.id === photoId)
      if (photo?.path) {
        await supabase.storage
          .from('survey-photos')
          .remove([photo.path])
      }

      const newPhotos = photos.filter(p => p.id !== photoId)
      setPhotos(newPhotos)
      onPhotosChange?.(newPhotos)

      toast.success('Photo deleted')
    } catch (err) {
      console.error('Delete error:', err)
      toast.error('Failed to delete photo')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="label flex items-center gap-2">
          <Camera size={16} className="text-qgo-blue" />
          {label}
        </label>
        <span className="text-xs text-gray-400">
          {photos.length} / {maxPhotos}
        </span>
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, index) => (
            <div key={photo.id || index} className="relative group aspect-square">
              <img
                src={photo.url}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setPreviewIndex(index)}
              />
              <button
                onClick={() => deletePhoto(photo.id || index)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <X size={12} />
              </button>
            </div>
          ))}

          {/* Add Photo Button */}
          {photos.length < maxPhotos && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-qgo-blue hover:text-qgo-blue transition-colors"
            >
              {uploading ? (
                <div className="w-6 h-6 border-2 border-qgo-blue border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Camera size={20} />
                  <span className="text-xs mt-1">Add</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Camera size={32} className="text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 mb-4">No photos added yet</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Upload size={16} />
              Upload Photos
            </button>
            <button
              onClick={handleCameraCapture}
              disabled={uploading}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Camera size={16} />
              Take Photo
            </button>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Photo Preview Modal */}
      {previewIndex !== null && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewIndex(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={photos[previewIndex]?.url}
              alt={`Preview ${previewIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setPreviewIndex(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white"
            >
              <X size={20} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setPreviewIndex(p => Math.max(0, p - 1))
                }}
                disabled={previewIndex === 0}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-white text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setPreviewIndex(p => Math.min(photos.length - 1, p + 1))
                }}
                disabled={previewIndex === photos.length - 1}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-white text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Photo Gallery Component (Read-only display)
 */
export function PhotoGallery({ photos, title = "Photos" }) {
  const [previewIndex, setPreviewIndex] = useState(null)

  if (!photos || photos.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">{title}</p>
      <div className="flex flex-wrap gap-2">
        {photos.map((photo, index) => (
          <button
            key={photo.id || index}
            onClick={() => setPreviewIndex(index)}
            className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 hover:ring-2 hover:ring-qgo-blue transition-all"
          >
            <img
              src={photo.url}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Preview Modal */}
      {previewIndex !== null && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewIndex(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={photos[previewIndex]?.url}
              alt={`Preview ${previewIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setPreviewIndex(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
