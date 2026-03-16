import { useRef, useEffect, useState } from 'react'
import { Pen, Eraser, Download, Trash2 } from 'lucide-react'

/**
 * Digital Signature Canvas Component
 * Allows customers to sign quotes digitally
 */
export default function SignatureCanvas({ value, onChange, darkMode = false }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const ctxRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctxRef.current = ctx

    // Set canvas size
    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)

    // Set default styles
    ctx.strokeStyle = darkMode ? '#ffffff' : '#1a1a1a'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Load existing signature if provided
    if (value) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.offsetWidth, canvas.offsetHeight)
        setHasSignature(true)
      }
      img.src = value
    }
  }, [darkMode, value])

  const getCoordinates = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()

    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      }
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const startDrawing = (e) => {
    e.preventDefault()
    setIsDrawing(true)
    const { x, y } = getCoordinates(e)
    ctxRef.current.beginPath()
    ctxRef.current.moveTo(x, y)
  }

  const draw = (e) => {
    if (!isDrawing) return
    e.preventDefault()
    const { x, y } = getCoordinates(e)
    ctxRef.current.lineTo(x, y)
    ctxRef.current.stroke()
    setHasSignature(true)
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      ctxRef.current.closePath()
      // Save the signature as base64 with better quality for PDF
      // Create a normalized canvas with white background
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = 400
      tempCanvas.height = 150
      const tempCtx = tempCanvas.getContext('2d')

      // Fill white background (needed for JPEG)
      tempCtx.fillStyle = '#ffffff'
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)

      // Draw the signature scaled to fit
      tempCtx.drawImage(canvasRef.current, 0, 0, tempCanvas.width, tempCanvas.height)

      // Save as JPEG for better PDF compatibility
      const dataURL = tempCanvas.toDataURL('image/jpeg', 0.95)
      onChange?.(dataURL)
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
    onChange?.(null)
  }

  const downloadSignature = () => {
    const link = document.createElement('a')
    link.download = `signature-${Date.now()}.png`
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Digital Signature
        </label>
        <div className="flex gap-2">
          {hasSignature && (
            <>
              <button
                type="button"
                onClick={downloadSignature}
                className="text-xs flex items-center gap-1 px-2 py-1 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <Download size={12} /> Download
              </button>
              <button
                type="button"
                onClick={clearSignature}
                className="text-xs flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded transition-colors"
              >
                <Trash2 size={12} /> Clear
              </button>
            </>
          )}
        </div>
      </div>

      <div
        className={`relative rounded-lg border-2 overflow-hidden cursor-crosshair ${
          darkMode
            ? 'border-gray-600 bg-gray-800'
            : 'border-gray-300 bg-white'
        }`}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-32 touch-none"
          style={{ touchAction: 'none' }}
        />

        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2 text-gray-400">
              <Pen size={16} />
              <span className="text-sm">Sign here with mouse or finger</span>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        By signing, you agree to the terms and conditions of this quote.
      </p>
    </div>
  )
}

/**
 * Signature Display Component
 * Shows a saved signature (read-only)
 */
export function SignatureDisplay({ signatureData, signedAt, darkMode = false }) {
  if (!signatureData) {
    return (
      <div className="text-center py-6 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-500 dark:text-gray-400">No signature yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div
        className={`rounded-lg border overflow-hidden ${
          darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
        }`}
      >
        <img
          src={signatureData}
          alt="Customer Signature"
          className="w-full h-24 object-contain bg-white"
        />
      </div>
      {signedAt && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Signed on {new Date(signedAt).toLocaleString()}
        </p>
      )}
    </div>
  )
}
