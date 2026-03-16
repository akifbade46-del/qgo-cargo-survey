import { useState } from 'react'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { X, MessageCircle, Mail, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function FeedbackPopup({
  isOpen,
  onClose,
  surveyId,
  surveyRef,
  customerPhone,
  customerEmail
}) {
  const [sending, setSending] = useState(false)

  const feedbackUrl = `${window.location.origin}/feedback/${surveyId}`

  const sendWhatsApp = async () => {
    setSending(true)
    try {
      const message = `Hello! Please share your feedback for survey #${surveyRef}. ${feedbackUrl}`
      const whatsappUrl = `https://wa.me/${customerPhone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')
      toast.success('WhatsApp opened!')
    } catch (err) {
      toast.error('Failed to send')
    }
    setSending(false)
  }

  const sendEmail = async () => {
    setSending(true)
    try {
      const subject = `Feedback for Survey #${surveyRef}`
      const body = `Please share your feedback: ${feedbackUrl}`
      window.location.href = `mailto:${customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      toast.success('Email client opened!')
    } catch (err) {
      toast.error('Failed to send')
    }
    setSending(false)
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 w-full max-w-sm"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-500" size={24} />
            <h2 className="text-lg font-bold">Survey Completed!</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* QR Code */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500 mb-3">Customer scan karein for feedback</p>
          <div className="bg-white p-4 rounded-2xl inline-block border border-gray-100">
            <QRCodeSVG value={feedbackUrl} size={180} />
          </div>
        </div>

        {/* OR Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">OR send link via</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={sendWhatsApp}
            disabled={sending || !customerPhone}
            className="flex-1 py-3 rounded-xl bg-green-500 text-white font-medium
                     flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-gray-300"
          >
            <MessageCircle size={18} />
            WhatsApp
          </button>
          <button
            onClick={sendEmail}
            disabled={sending || !customerEmail}
            className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-medium
                     flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-gray-300"
          >
            <Mail size={18} />
            Email
          </button>
        </div>

        {/* Skip */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-2 text-gray-500 text-sm hover:text-gray-700"
        >
          Skip for now
        </button>
      </motion.div>
    </motion.div>
  )
}
