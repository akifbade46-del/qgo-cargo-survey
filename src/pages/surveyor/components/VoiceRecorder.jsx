import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Square, Play, Trash2, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export default function VoiceRecorder({ itemId, onRecorded, existingNotes = [] }) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState(null)
  const [audioBlob, setAudioBlob] = useState(null)
  const [duration, setDuration] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [notes, setNotes] = useState(existingNotes)
  const [playingId, setPlayingId] = useState(null)

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioURL(URL.createObjectURL(blob))
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setDuration(0)

      timerRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= 60) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)

    } catch (err) {
      toast.error('Microphone access denied')
      console.error(err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      clearInterval(timerRef.current)
    }
  }

  const saveRecording = async () => {
    if (!audioBlob || !itemId) return

    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result

        const { data, error } = await supabase
          .from('item_attachments')
          .insert([{
            survey_item_id: itemId,
            type: 'voice',
            file_data: base64,
            file_name: `voice_${Date.now()}.webm`,
            mime_type: 'audio/webm',
            duration_seconds: duration,
            file_size_kb: Math.round(audioBlob.size / 1024)
          }])
          .select()
          .single()

        if (error) throw error

        setNotes(prev => [...prev, data])
        toast.success('Voice note saved!')
        setAudioBlob(null)
        setAudioURL(null)
        setDuration(0)
        if (onRecorded) onRecorded(data)
      }
      reader.readAsDataURL(audioBlob)
    } catch (err) {
      toast.error('Failed to save voice note')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const deleteNote = async (noteId) => {
    try {
      await supabase.from('item_attachments').delete().eq('id', noteId)
      setNotes(prev => prev.filter(n => n.id !== noteId))
      toast.success('Voice note deleted')
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  const playNote = (note) => {
    if (playingId === note.id) {
      setPlayingId(null)
    } else {
      setPlayingId(note.id)
      const audio = new Audio(note.file_data)
      audio.onended = () => setPlayingId(null)
      audio.play()
    }
  }

  return (
    <div className="space-y-3">
      {/* Existing Voice Notes */}
      {notes.length > 0 && (
        <div className="space-y-2">
          {notes.map((note, i) => (
            <div
              key={note.id}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ backgroundColor: 'var(--bg-tertiary)' }}
            >
              <button
                onClick={() => playNote(note)}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: playingId === note.id ? 'var(--color-primary)' : 'var(--bg-secondary)' }}
              >
                {playingId === note.id ? (
                  <Square size={14} className="text-white" />
                ) : (
                  <Play size={14} style={{ color: 'var(--color-primary)' }} />
                )}
              </button>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Voice Note {i + 1}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {note.duration_seconds}s · {note.file_size_kb}KB
                </p>
              </div>
              <button
                onClick={() => deleteNote(note.id)}
                className="p-2 rounded-lg text-gray-400 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Recording UI */}
      {isRecording ? (
        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center"
          >
            <Mic size={24} className="text-white" />
          </motion.div>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {duration}s
          </p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Max 60 seconds
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={stopRecording}
            className="px-6 py-3 rounded-xl bg-red-500 text-white"
          >
            <Square size={18} className="inline mr-2" />
            Stop Recording
          </motion.button>
        </div>
      ) : audioBlob ? (
        <div className="flex items-center gap-3">
          <audio ref={useRef(null)} src={audioURL} />
          <div className="flex-1 flex items-center gap-2 p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <Mic size={18} style={{ color: 'var(--color-primary)' }} />
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{duration}s</span>
          </div>
          <button
            onClick={() => { setAudioBlob(null); setAudioURL(null); setDuration(0) }}
            className="p-3 rounded-xl"
            style={{ backgroundColor: 'var(--bg-tertiary)' }}
          >
            <Trash2 size={18} className="text-gray-400" />
          </button>
          <button
            onClick={saveRecording}
            disabled={uploading}
            className="p-3 rounded-xl text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {uploading ? <Loader size={18} className="animate-spin" /> : 'Save'}
          </button>
        </div>
      ) : (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={startRecording}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl"
          style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
        >
          <Mic size={18} style={{ color: 'var(--color-primary)' }} />
          <span>Add Voice Note</span>
        </motion.button>
      )}
    </div>
  )
}
