import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Package, Truck, Home, Mic, Square, CheckCircle, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CompleteTab({
  rooms,
  allItems,
  voiceNote,
  setVoiceNote,
  onComplete,
  isUpdate = false
}) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  const totalCb = allItems.reduce((sum, item) =>
    sum + (item.cbm * (item.quantity || 1)), 0)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      chunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.onloadend = () => {
          setVoiceNote(reader.result)
        }
        reader.readAsDataURL(blob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1)
      }, 1000)
    } catch (err) {
      toast.error('Could not access microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
    }
    clearInterval(timerRef.current)
    setIsRecording(false)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="p-4 pb-24 space-y-4">
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
        <h2 className="text-lg font-semibold mb-4">Survey Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <Package size={24} className="mx-auto mb-1 opacity-80" />
            <p className="text-2xl font-bold">{allItems.length}</p>
            <p className="text-xs opacity-80">Items</p>
          </div>
          <div className="text-center">
            <Truck size={24} className="mx-auto mb-1 opacity-80" />
            <p className="text-2xl font-bold">{totalCb.toFixed(1)}</p>
            <p className="text-xs opacity-80">CBM</p>
          </div>
          <div className="text-center">
            <Home size={24} className="mx-auto mb-1 opacity-80" />
            <p className="text-2xl font-bold">{rooms.length}</p>
            <p className="text-xs opacity-80">Rooms</p>
          </div>
        </div>
      </div>

      {/* Voice Note Section */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <h3 className="font-medium text-gray-900 mb-3">Voice Note (Optional)</h3>

        {voiceNote ? (
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
            <Mic size={20} className="text-green-500" />
            <audio src={voiceNote} controls className="flex-1 h-8" />
            <button
              onClick={() => setVoiceNote(null)}
              className="text-red-500 text-sm"
            >
              Delete
            </button>
          </div>
        ) : isRecording ? (
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="flex-1 text-red-600 font-medium">
              Recording... {formatTime(recordingTime)}
            </span>
            <button
              onClick={stopRecording}
              className="p-2 bg-red-500 text-white rounded-lg"
            >
              <Square size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={startRecording}
            className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300
                     text-gray-500 flex items-center justify-center gap-2
                     hover:border-green-500 hover:text-green-500 transition-colors"
          >
            <Mic size={20} />
            Tap to record voice note
          </button>
        )}
      </div>

      {/* Complete/Update Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onComplete}
        disabled={allItems.length === 0}
        className={`w-full py-4 rounded-2xl text-white font-semibold
                 flex items-center justify-center gap-2 shadow-lg
                 disabled:opacity-50 disabled:cursor-not-allowed
                 ${isUpdate ? 'bg-blue-600' : 'bg-green-600'}`}
      >
        {isUpdate ? <RefreshCw size={20} /> : <CheckCircle size={20} />}
        {isUpdate ? 'Update Survey' : 'Complete Survey'}
      </motion.button>
    </div>
  )
}
